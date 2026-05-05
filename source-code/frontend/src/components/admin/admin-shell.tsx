"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
	LayoutDashboard,
	LogOut,
	Menu,
	Package,
  Tag,
  X,
} from "lucide-react";

type AdminShellProps = {
  adminName: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
};

const navItems = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    exact: false,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tag,
    exact: false,
  },
];

export function AdminShell({
	adminName,
	signOutAction,
	children,
}: AdminShellProps) {
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	function closeSidebar() {
		setSidebarOpen(false);
	}

  /* Lock body scroll when mobile sidebar is open */
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2">
        <div className="relative size-10 overflow-hidden rounded-xl border border-border bg-card">
          <Image
            src="/images/logo-planet-motor.png"
            alt="Planet Motor logo"
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-text-heading">
            Planet Motor BMW
          </p>
          <p className="text-xs text-text-muted">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
							<Link
								key={item.href}
								href={item.href}
								onClick={closeSidebar}
								className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
									active
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-text-body hover:bg-[#F3F4F6]"
              }`}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Admin profile + sign out */}
      <div className="border-t border-border-subtle pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-brand-primary">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-heading">
              {adminName}
            </p>
            <p className="text-xs text-text-muted">Administrator</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-body transition-colors hover:bg-[#F3F4F6]"
          >
            <LogOut className="size-[18px]" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background p-3 md:p-5 lg:gap-5">
      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop: static, mobile: overlay) ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-white p-5 shadow-xl
          transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:flex lg:w-64 lg:flex-col lg:rounded-[24px] lg:shadow-sm lg:transition-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-text-muted hover:bg-[#F3F4F6] lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="size-5" />
        </button>

        {sidebar}
      </aside>

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col gap-5 overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm"
            aria-label="Open sidebar"
          >
            <Menu className="size-5 text-text-heading" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative size-8 overflow-hidden rounded-lg border border-border bg-card">
              <Image
                src="/images/logo-planet-motor.png"
                alt="Planet Motor logo"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <p className="text-sm font-bold text-text-heading">Planet Motor BMW</p>
          </div>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
