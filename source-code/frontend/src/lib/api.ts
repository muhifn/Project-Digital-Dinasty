/**
 * Centralized fetch wrapper for the Go API backend.
 *
 * Server-side (SSR, Server Components, Server Actions):
 *   - Uses GO_API_URL directly.
 *   - Forwards cookies from the incoming request for authentication.
 *
 * Client-side (browser):
 *   - Uses the relative /api/* path, which Next.js rewrites to the Go API.
 *   - In production, GO_API_URL should point to the Railway service.
 *   - Cookies are sent automatically by the browser.
 */

// Internal Go API base URL (server-side only).
// In production, set this to the Railway service URL.
const GO_API_INTERNAL = process.env.GO_API_URL || "http://localhost:8080";

/**
 * Standard API response shape from the Go backend.
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  errors?: Record<string, string>;
};

/**
 * Thrown when the Go API returns an error response (non-2xx).
 */
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;
  /** Full response body for non-standard error shapes (e.g., stock conflicts). */
  body?: Record<string, unknown>;

  constructor(message: string, status: number, errors?: Record<string, string>, body?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.body = body;
  }
}

/**
 * Build the full URL for a Go API endpoint.
 *
 * On the server: uses the internal base URL directly.
 * On the client: uses relative paths (browser handles routing).
 */
function buildUrl(path: string): string {
  // Server-side: call Go API directly
  if (typeof window === "undefined") {
    return `${GO_API_INTERNAL}${path}`;
  }
  // Client-side: relative URL proxied by Next.js rewrites
  return path;
}

/**
 * Get cookies from the current incoming request (server-side only).
 * Uses Next.js `headers()` to read the Cookie header.
 */
async function getServerCookies(): Promise<string> {
  if (typeof window !== "undefined") return "";

  try {
    // Dynamic import to avoid bundling issues on client
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.toString();
  } catch {
    return "";
  }
}

/**
 * Get the access token from cookies (server-side only).
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window !== "undefined") return null;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("rdp_access_token");
    return token?.value ?? null;
  } catch {
    return null;
  }
}

type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** Pass cookies for auth. If true (default for server), forwards incoming cookies. */
  withAuth?: boolean;
  /** Custom cache/revalidation settings */
  next?: { revalidate?: number; tags?: string[] };
  /** Do not throw on error responses */
  noThrow?: boolean;
};

/**
 * Core fetch function for the Go API.
 */
async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, withAuth = true, noThrow = false } = options;

  const url = buildUrl(path);
  const fetchHeaders: Record<string, string> = {
    ...headers,
  };

  // For JSON bodies
  if (body && !(body instanceof FormData)) {
    fetchHeaders["Content-Type"] = "application/json";
  }

  // Server-side: forward cookies for authentication
  if (typeof window === "undefined" && withAuth) {
    const cookieHeader = await getServerCookies();
    if (cookieHeader) {
      fetchHeaders["Cookie"] = cookieHeader;
    }
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method,
    headers: fetchHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  };

  // Next.js cache options
  if (options.next) {
    fetchOptions.next = options.next;
  }

  const response = await fetch(url, fetchOptions);

  // Handle non-JSON responses (e.g., SSE, file downloads)
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (!response.ok && !noThrow) {
      throw new ApiError(response.statusText, response.status);
    }
    return { success: response.ok } as ApiResponse<T>;
  }

  const data: ApiResponse<T> & Record<string, unknown> = await response.json();

  if (!response.ok && !noThrow) {
    throw new ApiError(
      (data.error as string) || (data.message as string) || "API request failed",
      response.status,
      data.errors as Record<string, string> | undefined,
      data
    );
  }

  return data;
}

// ── Convenience methods ──────────────────────────────────────────────

export const api = {
  get<T = unknown>(path: string, options?: Omit<FetchOptions, "method" | "body">) {
    return apiFetch<T>(path, { ...options, method: "GET" });
  },

  post<T = unknown>(path: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) {
    return apiFetch<T>(path, { ...options, method: "POST", body });
  },

  put<T = unknown>(path: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) {
    return apiFetch<T>(path, { ...options, method: "PUT", body });
  },

  delete<T = unknown>(path: string, options?: Omit<FetchOptions, "method" | "body">) {
    return apiFetch<T>(path, { ...options, method: "DELETE" });
  },

  /** Raw fetch for cases like FormData uploads */
  fetch: apiFetch,
};
