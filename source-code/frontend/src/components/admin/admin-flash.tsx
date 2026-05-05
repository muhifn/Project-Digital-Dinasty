import { CheckCircle2, XCircle } from "lucide-react";

type AdminFlashProps = {
  type?: string;
  message?: string;
};

export function AdminFlash({ type, message }: AdminFlashProps) {
  if (!message) {
    return null;
  }

  const isError = type === "error";

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
        isError
          ? "bg-[#fff1f1] text-[#991b1b]"
          : "bg-[#ecfdf3] text-[#166534]"
      }`}
    >
      {isError ? (
        <XCircle className="size-4 shrink-0" />
      ) : (
        <CheckCircle2 className="size-4 shrink-0" />
      )}
      {message}
    </div>
  );
}
