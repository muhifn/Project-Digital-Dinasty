"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="admin-card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#fff1f1]">
          <AlertTriangle className="size-6 text-brand-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-text-heading">
          Something went wrong
        </h2>
        <p className="mt-1.5 text-sm text-text-body">
          An error occurred while loading this page. Please try again.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-text-muted">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-5">
          <button
            onClick={reset}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-text-heading px-5 text-sm font-medium text-white transition-colors hover:bg-[#333]"
          >
            <RotateCcw className="size-3.5" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
