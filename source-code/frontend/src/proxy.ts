import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ProxyConfig } from "next/server";

/**
 * Next.js Proxy — lightweight admin route guard.
 *
 * Checks for the `rdp_access_token` cookie on `/admin/*` routes.
 * If missing or expired, redirects to the login page.
 *
 * This does NOT verify the JWT signature (the Go API does that on every
 * request). It only checks cookie presence and basic expiry to avoid
 * flashing the admin UI before a server-side redirect kicks in.
 */

function decodeJwtPayload(token: string): { exp?: number; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("rdp_access_token")?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    return redirectToLogin(request);
  }

  // Check expiry (with 30s grace for clock skew)
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now - 30) {
    // Token is expired. Check if refresh token exists — if so, let the
    // server-side auth() function handle the refresh. If not, redirect.
    const refreshToken = request.cookies.get("rdp_refresh_token")?.value;
    if (!refreshToken) {
      return redirectToLogin(request);
    }
    // Refresh token exists — let the request through so the server-side
    // auth() function can attempt a refresh.
    return NextResponse.next();
  }

  // Check role
  if (payload.role && payload.role !== "admin") {
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = "/auth/error";
    errorUrl.searchParams.set("error", "AccessDenied");
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/auth/login";
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config: ProxyConfig = {
  matcher: ["/admin/:path*"],
};
