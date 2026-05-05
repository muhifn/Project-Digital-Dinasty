"use client";

import { Check, MessageCircleMore, ShieldCheck, ShoppingBag, Wrench } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useLocale } from "@/components/providers/locale-provider";

const featureIcons = [Wrench, ShieldCheck, MessageCircleMore, ShoppingBag];

export function FeaturesSection() {
  const { messages } = useLocale();

  return (
    <section className="container-wrap mt-16">
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <ScrollReveal className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">{messages.home.features.badge}</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-text-heading sm:text-[2.2rem]">
              {messages.home.features.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-text-body sm:text-base">
              {messages.home.features.description}
            </p>
          </ScrollReveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {messages.home.features.cards.map((item, index) => {
              const Icon = featureIcons[index] ?? Wrench;

              return (
                <ScrollReveal key={item.title} delay={index * 0.08} className="h-full">
                    <article className="rounded-sm border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)]">
                    <div className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-heading">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-body">{item.description}</p>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        <ScrollReveal delay={0.18}>
          <div className="relative overflow-hidden rounded-sm border border-border bg-[#f8fafc] p-7 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
            <div className="absolute -right-12 top-10 h-36 w-36 rounded-full bg-brand-primary/14 blur-3xl" />
            <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-[#E7222E]/10 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">
                {messages.home.features.highlight.badge}
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-text-heading sm:text-[2rem]">
                {messages.home.features.highlight.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-text-body">
                {messages.home.features.highlight.description}
              </p>

              <div className="mt-7 space-y-4">
                {messages.home.features.highlight.bullets.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-sm border border-border bg-white px-4 py-3">
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                      <Check className="size-4" />
                    </span>
                    <p className="text-sm leading-6 text-text-body">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-sm border border-border bg-white p-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-text-muted">
                  {messages.home.features.highlight.floatingTitle}
                </p>
                <p className="mt-2 text-3xl font-bold text-text-heading">{messages.home.features.highlight.floatingValue}</p>
                <p className="mt-2 text-sm leading-6 text-text-body">
                  {messages.home.features.highlight.floatingDescription}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
