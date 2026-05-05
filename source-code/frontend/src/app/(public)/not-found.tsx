import Link from "next/link";
import { SearchX } from "lucide-react";

export default function PublicNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-primary/10">
          <SearchX className="size-8 text-brand-primary" />
        </div>
        <h2 className="mt-6 font-heading text-2xl text-text-heading">Page not found</h2>
        <p className="mt-2 text-sm text-text-body">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
