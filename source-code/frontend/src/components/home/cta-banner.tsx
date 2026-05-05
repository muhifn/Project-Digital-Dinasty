"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { ChannelIcon } from "@/components/shared/channel-icon";

type CtaBannerProps = {
  tokopediaStoreUrl: string;
  whatsappUrl: string;
};

export function CtaBanner({ tokopediaStoreUrl, whatsappUrl }: CtaBannerProps) {
  const { messages } = useLocale();

  return (
    <section className="container-wrap mt-16">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-sm border border-border bg-[linear-gradient(135deg,#ffffff,#f5f8ff_60%,#eef4ff_100%)] px-6 py-10 shadow-[0_18px_38px_rgba(15,23,42,0.08)] sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,83,183,0.18),transparent_42%)]" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-brand-primary/16 blur-3xl" />
          <div className="pointer-events-none absolute right-16 top-12 h-28 w-28 rounded-full bg-[#E7222E]/10 blur-2xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.2em] text-brand-primary">{messages.home.cta.badge}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-text-heading sm:text-4xl">
                {messages.home.cta.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-text-body sm:text-base">
                {messages.home.cta.description}
              </p>
            </div>

            <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[520px]">
              <Link
                href={tokopediaStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md bg-primary px-6 text-[11px] font-bold tracking-[0.2em] text-white uppercase transition-colors hover:bg-brand-primary-hover"
              >
                <ChannelIcon channel="tokopedia" size={18} />
                {messages.home.cta.primaryCta}
                <ArrowUpRight className="size-4" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md border border-border bg-card px-6 text-[11px] font-bold tracking-[0.2em] text-text-heading uppercase transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
              >
                <ChannelIcon channel="whatsapp" size={18} />
                {messages.home.cta.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
