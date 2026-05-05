import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { AlertCircle } from "lucide-react";
import { createHash } from "node:crypto";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    callbackUrl?: string;
    retryAfter?: string;
  }>;
};

const errorMessageByCode: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  TooManyAttempts: "Too many login attempts. Please try again later.",
  AccessDenied: "You do not have permission to access this area.",
  Default: "Sign in failed. Please try again.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/admin";
  const errorCode = params.error;
  const retryAfterRaw = params.retryAfter ? Number.parseInt(params.retryAfter, 10) : NaN;
  const retryAfterSeconds = Number.isFinite(retryAfterRaw) && retryAfterRaw > 0 ? retryAfterRaw : null;
  const retryAfterMinutes = retryAfterSeconds ? Math.ceil(retryAfterSeconds / 60) : null;
  const errorMessage =
    errorCode === "TooManyAttempts" && retryAfterMinutes
      ? `Too many login attempts. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? "" : "s"}.`
      : errorCode
        ? errorMessageByCode[errorCode] ?? errorMessageByCode.Default
        : null;

  async function handleAdminLogin(formData: FormData) {
    "use server";

    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      redirect("/auth/login?error=CredentialsSignin");
    }

    try {
      const requestHeaders = await headers();
      const forwardedFor = requestHeaders.get("x-forwarded-for");
      const realIP = requestHeaders.get("x-real-ip");
      const firstForwardedIP = forwardedFor?.split(",")[0]?.trim();
      const clientIP = firstForwardedIP || realIP?.trim();
      const userAgent = requestHeaders.get("user-agent") || "";

      const cookieStore = await cookies();
      let loginClientId = cookieStore.get("login_client_id")?.value;
      if (!loginClientId) {
        const hashSeed = `${Date.now()}-${Math.random()}-${clientIP || "unknown"}-${userAgent}`;
        loginClientId = createHash("sha256").update(hashSeed).digest("hex").slice(0, 40);
      }

      const goApiUrl = process.env.GO_API_URL || "http://localhost:8080";
      const res = await fetch(`${goApiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Login-Client-Id": loginClientId,
          ...(clientIP ? { "X-Original-Client-IP": clientIP } : {}),
          ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
          ...(realIP ? { "X-Real-IP": realIP } : {}),
        },
        body: JSON.stringify({ email, password }),
      });

      cookieStore.set({
        name: "login_client_id",
        value: loginClientId,
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      if (res.status === 429) {
        let retryAfter = res.headers.get("retry-after");

        try {
          const body = await res.json();
          if (typeof body?.retryAfter === "number" && body.retryAfter > 0) {
            retryAfter = String(Math.ceil(body.retryAfter));
          }
        } catch {
          // ignore JSON parsing errors and fall back to header value
        }

        const retryAfterQuery = retryAfter ? `&retryAfter=${encodeURIComponent(retryAfter)}` : "";
        redirect(`/auth/login?error=TooManyAttempts${retryAfterQuery}`);
      }

      if (!res.ok) {
        redirect("/auth/login?error=CredentialsSignin");
      }

      // Forward the Set-Cookie headers from the Go API response
      // The Go API sets rdp_access_token and rdp_refresh_token
      const setCookieHeaders = res.headers.getSetCookie();
      for (const setCookie of setCookieHeaders) {
        // Parse the Set-Cookie header
        const parts = setCookie.split(";").map(p => p.trim());
        const [nameValue, ...attrs] = parts;
        const eqIndex = nameValue.indexOf("=");
        if (eqIndex === -1) continue;

        const name = nameValue.substring(0, eqIndex);
        const value = nameValue.substring(eqIndex + 1);

        // Parse attributes
        let maxAge: number | undefined;
        let path = "/";
        let httpOnly = false;
        let secure = false;
        let sameSite: "lax" | "strict" | "none" | undefined;

        for (const attr of attrs) {
          const lower = attr.toLowerCase();
          if (lower.startsWith("max-age=")) {
            maxAge = parseInt(attr.split("=")[1], 10);
          } else if (lower.startsWith("path=")) {
            path = attr.split("=")[1];
          } else if (lower === "httponly") {
            httpOnly = true;
          } else if (lower === "secure") {
            secure = true;
          } else if (lower.startsWith("samesite=")) {
            sameSite = attr.split("=")[1].toLowerCase() as "lax" | "strict" | "none";
          }
        }

        cookieStore.set({
          name,
          value,
          maxAge,
          path,
          httpOnly,
          secure,
          sameSite,
        });
      }
    } catch (error) {
      // Re-throw redirect errors (Next.js uses them for navigation)
      if (error && typeof error === "object" && "digest" in error) {
        throw error;
      }
      redirect("/auth/login?error=CredentialsSignin");
    }

    redirect(callbackUrl);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-[0_24px_50px_rgba(0,0,0,0.05)] sm:p-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-text-muted">ADMIN LOGIN</p>
      <h1 className="headline-lg mt-2 text-text-heading">Welcome back</h1>
      <p className="mt-3 text-sm text-text-body">
        Sign in with your admin account to access dashboard and manage products, categories, and stock.
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          <div className="inline-flex items-center gap-2 font-medium">
            <AlertCircle className="size-4" />
            {errorMessage}
          </div>
        </div>
      ) : null}

      <form action={handleAdminLogin} className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-text-heading">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="admin@planetmotorbmw.com"
            className="h-11 rounded-2xl border border-border px-4 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-text-heading">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="h-11 rounded-2xl border border-border px-4 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <button
          type="submit"
          className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
        >
          Sign in to admin
        </button>
      </form>

      <div className="mt-5 border-t border-border pt-4 text-sm text-text-body">
        Back to storefront?{" "}
        <Link href="/" className="font-semibold text-brand-primary hover:text-brand-primary-hover">
          Go home
        </Link>
      </div>
    </section>
  );
}
