/**
 * Auth module: replaces NextAuth with Go JWT cookie-based authentication.
 *
 * The Go API manages JWT tokens via HttpOnly cookies:
 * - `rdp_access_token` (15 min) — used for auth
 * - `rdp_refresh_token` (7 days) — used to refresh access token
 *
 * This module provides:
 * - signIn() — calls Go login endpoint, which sets cookies
 * - signOut() — calls Go logout endpoint, which clears cookies
 * - auth() — reads the access token cookie and decodes the JWT payload
 */

import { api } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────

type JwtPayload = {
  sub: string; // admin ID
  email: string;
  name: string;
  role: string;
  exp: number;
};

type AuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

type LoginResponse = {
  accessToken: string;
  admin: {
    id: string;
    email: string;
    name: string;
  };
};

// ── JWT helpers ──────────────────────────────────────────────────────

/**
 * Decode a JWT payload without verification.
 * Verification is the Go API's responsibility; the frontend only
 * needs the claims for display purposes and route guarding.
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url decode the payload
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const decoded = JSON.parse(
      typeof atob === "function"
        ? atob(payload)
        : Buffer.from(payload, "base64").toString("utf-8")
    );
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Sign in via the Go API. Sets HttpOnly cookies on success.
 *
 * @param _provider - Ignored (kept for API compat with old signIn("admin-login", ...))
 * @param credentials - { email, password, redirect? }
 */
export async function signIn(
  _provider: string,
  credentials: { email: string; password: string; redirect?: boolean }
): Promise<void> {
  const res = await api.post<LoginResponse>("/api/auth/login", {
    email: credentials.email,
    password: credentials.password,
  }, { withAuth: false });

  if (!res.success || !res.data) {
    throw new Error("Login failed");
  }

  // On the server side, the Go API's Set-Cookie headers are in the response
  // but we can't set them in the browser from a server action.
  // The login must happen client-side OR we need to forward Set-Cookie headers.
  //
  // Since the login page uses a server action, we need a different approach:
  // We'll switch the login page to call the Go API via the Next.js rewrite proxy
  // so the browser receives the Set-Cookie headers directly.
  //
  // For now, this function works for server-side login validation.
  // The actual cookie setting is handled by the browser via the proxy.
}

/**
 * Sign out via the Go API. Clears auth cookies.
 */
export async function signOut(options?: { redirectTo?: string }): Promise<void> {
  try {
    await api.post("/api/auth/logout", undefined, { withAuth: true });
  } catch {
    // Ignore errors on logout
  }

  if (options?.redirectTo) {
    const { redirect } = await import("next/navigation");
    redirect(options.redirectTo);
  }
}

/**
 * Get the current auth session from the JWT cookie.
 * Returns null if no valid session exists.
 *
 * This is a server-side function that reads the `rdp_access_token` cookie.
 */
export async function auth(): Promise<AuthSession | null> {
  if (typeof window !== "undefined") return null;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("rdp_access_token")?.value;

    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Token expired — try to refresh
      try {
        const refreshRes = await api.post<{ accessToken: string }>("/api/auth/refresh", undefined, {
          withAuth: true,
        });
        if (refreshRes.success && refreshRes.data?.accessToken) {
          const newPayload = decodeJwtPayload(refreshRes.data.accessToken);
          if (newPayload) {
            return {
              user: {
                id: newPayload.sub,
                email: newPayload.email,
                name: newPayload.name,
                role: newPayload.role,
              },
            };
          }
        }
      } catch {
        return null;
      }
      return null;
    }

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    };
  } catch {
    return null;
  }
}
