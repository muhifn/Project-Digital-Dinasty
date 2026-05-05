"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
};

type SiteHeaderNavProps = {
  links: NavLink[];
  overlay?: boolean;
};

export function SiteHeaderNav({ links, overlay = false }: SiteHeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {links.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "font-headline group relative shrink-0 py-2 text-xs font-bold tracking-[0.22em] uppercase transition-colors",
              overlay
                ? isActive
                  ? "text-white"
                  : "text-white/78 hover:text-white"
                : isActive
                  ? "text-text-heading"
                  : "text-text-body hover:text-text-heading"
            )}
          >
            {item.label}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-0.5 h-px origin-left rounded-full transition-transform duration-300",
                overlay ? "bg-white" : "bg-brand-primary",
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
