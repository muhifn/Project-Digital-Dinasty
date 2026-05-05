"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Menu, Moon, PhoneCall, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

const HEADER_IDLE_DELAY_MS = 1600;

export function SiteHeader() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { messages } = useLocale();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTheme = isMounted ? resolvedTheme ?? theme ?? "light" : "light";

  const navLinks = useMemo(
    () => [
      { href: "/", label: messages.header.nav.home },
      { href: "/products", label: messages.header.nav.products },
      { href: "/about", label: messages.header.nav.about },
      { href: "/contact", label: messages.header.nav.contact },
    ],
    [messages.header.nav],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const scheduleHide = () => {
      clearHideTimer();
      hideTimerRef.current = setTimeout(() => {
        setIsHeaderVisible(false);
      }, HEADER_IDLE_DELAY_MS);
    };

    const handleScroll = () => {
      const hasScrolled = window.scrollY > 16;
      setIsScrolled(hasScrolled);
      setIsHeaderVisible(true);

      if (window.scrollY > 0) {
        scheduleHide();
        return;
      }

      clearHideTimer();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    if (window.scrollY > 0) {
      scheduleHide();
    }

    return () => {
      clearHideTimer();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 will-change-transform"
        initial={false}
        animate={{ y: isHeaderVisible || isMobileMenuOpen ? 0 : "-150%" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={cn(
            "flex h-20 min-w-0 items-center justify-between gap-4 px-6 transition-[background-color,box-shadow,backdrop-filter] duration-300 lg:px-8",
            isScrolled
              ? "bg-white/82 shadow-[0_48px_48px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:bg-[#0b1322]/88"
              : "bg-white/60 shadow-[0_48px_48px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:bg-[#0b1322]/78",
          )}
        >
          <div className="flex min-w-0 items-center gap-12">
            <Link href="/" className="group inline-flex min-w-0 shrink-0 items-center gap-3">
              <span className="font-headline text-xl font-black tracking-tighter text-slate-900 uppercase dark:text-slate-100">Planet Motor BMW</span>
            </Link>

            <SiteHeaderNav links={navLinks} />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <LanguageSwitcher className="hidden lg:inline-flex" compact />

            <a
              href="tel:+6281234567890"
              className="motion-button inline-flex size-10 items-center justify-center rounded-full text-text-heading transition-colors hover:text-brand-primary dark:text-slate-100"
              aria-label="Call Planet Motor BMW"
            >
              <PhoneCall className="size-5" />
            </a>

            <button
              type="button"
              onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}
              className="motion-button hidden size-10 items-center justify-center rounded-full border border-border/60 bg-card/90 text-text-heading transition-colors hover:border-brand-primary/30 hover:text-brand-primary dark:bg-[#111827] dark:text-slate-100 md:inline-flex"
              aria-label={activeTheme === "dark" ? messages.header.theme.switchToLight : messages.header.theme.switchToDark}
            >
              {activeTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="motion-button inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-card/90 text-text-heading transition-colors hover:border-brand-primary/30 hover:text-brand-primary dark:bg-[#111827] dark:text-slate-100 md:hidden"
              aria-label={messages.header.mobileMenu.open}
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[70] bg-background/64 backdrop-blur-sm md:hidden"
              aria-label={messages.common.close}
            />

            <motion.aside
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-4 right-4 z-[71] w-[min(23rem,calc(100vw-2rem))] rounded-xl border border-border/80 bg-card/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl md:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-text-heading">{messages.common.brand}</p>
                    <p className="mt-1 text-sm leading-6 text-text-body">{messages.header.mobileMenu.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="motion-button inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/80 text-text-heading transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
                    aria-label={messages.header.mobileMenu.close}
                  >
                    <X size={16} />
                  </button>
                </div>

                <nav className="mt-8 flex flex-col gap-2">
                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="motion-button rounded-lg border border-border/60 bg-background/70 px-4 py-3 text-sm font-semibold text-text-heading transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-8 space-y-4">
                  <div>
                    <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-text-muted">
                      {messages.common.language.toUpperCase()}
                    </p>
                    <LanguageSwitcher compact />
                  </div>

                  <button
                    type="button"
                    onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}
                    className="motion-button inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border/70 bg-background/80 px-5 text-sm font-semibold text-text-heading transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
                  >
                    {activeTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    <span>{activeTheme === "dark" ? messages.header.theme.switchToLight : messages.header.theme.switchToDark}</span>
                  </button>
                </div>

                <div className="mt-auto pt-8">
                  <a
                    href="tel:+6281234567890"
                    className="motion-button inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
                  >
                    <PhoneCall size={16} />
                    <span>Call Planet Motor BMW</span>
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
