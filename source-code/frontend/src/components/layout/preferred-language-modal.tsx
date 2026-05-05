"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2 } from "lucide-react";
import {
  isLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/lib/i18n/messages";
import { useLocale } from "@/components/providers/locale-provider";

function getCookieValue(name: string) {
  return document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function PreferredLanguageModal() {
  const { messages, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const cookieLocale = getCookieValue(LOCALE_COOKIE_NAME);
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

    if (!cookieLocale && isLocale(storedLocale)) {
      setLocale(storedLocale);
      return;
    }

    if (!cookieLocale && !storedLocale) {
      const timer = window.setTimeout(() => setIsOpen(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, [setLocale]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function handleSelect(locale: Locale) {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    setLocale(locale);
    setIsOpen(false);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/82 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border/80 bg-card/95 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
            <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-brand-primary/15 blur-3xl" />
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-brand-primary/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-brand-primary">
                <Globe2 className="size-4" />
                {messages.languageModal.badge}
              </div>

              <h2 className="mt-5 text-3xl font-bold leading-tight text-text-heading sm:text-4xl">
                {messages.languageModal.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-body sm:text-base">
                {messages.languageModal.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {(["id", "en"] as const).map((item) => {
                  const copy = messages.languageModal.cards[item];

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="group rounded-[1.75rem] border border-border/80 bg-background/70 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:shadow-[0_18px_36px_rgba(28,105,212,0.16)]"
                    >
                      <div className="inline-flex rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-text-muted">
                        {item === "id" ? "ID" : "EN"}
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-text-heading transition-colors group-hover:text-brand-primary">
                        {copy.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-text-body">{copy.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
