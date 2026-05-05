import Link from "next/link";

type AuthErrorPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessageByCode: Record<string, string> = {
  AccessDenied: "You do not have access to this page.",
  CredentialsSignin: "Invalid credentials.",
  Configuration: "Authentication is not configured correctly.",
  Default: "Authentication error occurred.",
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const code = params.error;
  const message = code ? errorMessageByCode[code] ?? errorMessageByCode.Default : errorMessageByCode.Default;

  return (
    <section className="rounded-3xl border border-border bg-card p-8 text-center shadow-[0_24px_50px_rgba(0,0,0,0.05)]">
      <p className="text-xs font-semibold tracking-[0.2em] text-text-muted">AUTH ERROR</p>
      <h1 className="headline-lg mt-2 text-text-heading">Sign in issue</h1>
      <p className="mt-4 text-sm text-text-body">{message}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/auth/login"
          className="inline-flex h-10 items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
        >
          Try login again
        </Link>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-[#2a2a2a]"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
