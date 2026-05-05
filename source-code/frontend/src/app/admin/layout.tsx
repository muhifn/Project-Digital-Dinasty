import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin-auth";
import { signOut } from "@/lib/auth";
import { StockStreamProvider } from "@/components/providers/stock-stream-provider";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession({ callbackUrl: "/admin" });

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/auth/login" });
  }

  return (
    <AdminShell
      adminName={session.user.name ?? "Admin"}
      signOutAction={handleSignOut}
    >
      <StockStreamProvider>{children}</StockStreamProvider>
    </AdminShell>
  );
}
