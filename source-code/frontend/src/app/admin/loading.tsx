import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="admin-card flex items-center gap-3 px-6 py-4">
        <Loader2 className="size-5 animate-spin text-brand-primary" />
        <p className="text-sm font-medium text-text-body">Loading...</p>
      </div>
    </div>
  );
}
