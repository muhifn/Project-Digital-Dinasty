"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-primary/10">
          <AlertTriangle className="size-8 text-brand-primary" />
        </div>
        <h2 className="mt-6 font-heading text-2xl text-text-heading">Something went wrong</h2>
        <p className="mt-2 text-sm text-text-body">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-text-muted">Error ID: {error.digest}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-primary px-5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>
			<Link
				href="/"
				className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-text-body transition-colors hover:bg-muted"
			>
				Go home
			</Link>
        </div>
      </div>
    </div>
  );
}
