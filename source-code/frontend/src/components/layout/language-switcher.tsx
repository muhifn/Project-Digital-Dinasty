"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/lib/i18n/messages";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
  variant?: "default" | "overlay";
};

const languageLabels: Record<Locale, string> = {
  id: "ID",
  en: "EN",
};

export function LanguageSwitcher({ className, compact = false, variant = "default" }: LanguageSwitcherProps) {
  const { locale, messages, setLocale, isSwitching } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full p-1 backdrop-blur-xl",
        variant === "default" && "border border-border/60 bg-card/80 text-text-heading",
        variant === "overlay" && "border border-white/15 bg-white/5 text-white",
        className,
      )}
      aria-label={messages.common.chooseLanguage}
    >
      {(["id", "en"] as const).map((item) => {
        const isActive = item === locale;

        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            disabled={isSwitching}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              compact && "px-2.5 py-1 text-[11px]",
              variant === "default" &&
                (isActive
                  ? "bg-brand-primary text-white"
                  : "text-text-heading hover:bg-brand-primary/10 hover:text-brand-primary"),
              variant === "overlay" &&
                (isActive
                  ? "bg-white text-slate-950"
                  : "text-white/85 hover:bg-white/10 hover:text-white"),
            )}
          >
            <span className="sr-only">
              {item === "id" ? messages.common.indonesian : messages.common.english}
            </span>
            <span aria-hidden="true">{languageLabels[item]}</span>
          </button>
        );
      })}
    </div>
  );
}
