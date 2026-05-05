import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

type RequireAdminOptions = {
  callbackUrl?: string;
};

export async function requireAdminSession(options: RequireAdminOptions = {}) {
  const session = await auth();
  const callbackUrl = options.callbackUrl ?? "/admin";

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (session.user.role !== "admin") {
    redirect("/auth/error?error=AccessDenied");
  }

  return session;
}

export async function isAdminSession() {
  const session = await auth();
  return Boolean(session?.user && session.user.role === "admin");
}
