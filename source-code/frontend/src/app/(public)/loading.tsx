import { Loader2 } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-brand-primary" />
        <p className="mt-4 text-sm font-medium text-text-body">Loading...</p>
      </div>
    </div>
  );
}
