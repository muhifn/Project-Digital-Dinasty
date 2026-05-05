"use client";

import { createContext, useContext, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  dictionaries,
  type Dictionary,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/lib/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  messages: Dictionary;
  setLocale: (locale: Locale) => void;
  isSwitching: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  initialLocale: Locale;
  children: React.ReactNode;
};

export function LocaleProvider({ initialLocale, children }: LocaleProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isSwitching, startTransition] = useTransition();

  const value = useMemo<LocaleContextValue>(() => {
    return {
      locale,
      messages: dictionaries[locale],
      setLocale(nextLocale) {
        if (nextLocale === locale) return;

        document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
        window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        setLocaleState(nextLocale);
        startTransition(() => {
          router.refresh();
        });
      },
      isSwitching,
    };
  }, [isSwitching, locale, router]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
