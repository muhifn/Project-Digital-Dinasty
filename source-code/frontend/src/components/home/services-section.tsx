"use client";

import { BadgeCheck, SearchCheck, Shield, Wrench } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useLocale } from "@/components/providers/locale-provider";

export function ServicesSection() {
  const { messages } = useLocale();
  const consultationCards = messages.home.services.consultation.cards;
  const flowSteps = messages.home.services.flow.steps;

  return (
    <section className="container-wrap mt-16">
      <ScrollReveal className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">{messages.home.services.badge}</p>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-text-heading sm:text-[2.25rem]">
          {messages.home.services.title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-text-body sm:text-base">{messages.home.services.description}</p>
      </ScrollReveal>

      <div className="grid gap-5 lg:grid-cols-2">
        <ScrollReveal>
          <article className="rounded-sm border border-border bg-white p-7 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
            <div className="mb-5 inline-flex items-center gap-3 rounded-sm border border-border bg-[#F4F5F7] px-4 py-2 text-xs font-semibold tracking-[0.16em] text-brand-primary">
              <SearchCheck className="size-4" />
              {messages.home.services.consultation.badge}
            </div>

            <h3 className="text-2xl font-bold leading-tight text-text-heading sm:text-[2rem]">
              {messages.home.services.consultation.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-text-body sm:text-base">
              {messages.home.services.consultation.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-[#F8FAFC] p-5">
                <Wrench className="size-4 text-brand-primary" />
                <p className="mt-3 text-sm font-semibold text-text-heading">{consultationCards[0]?.title}</p>
                <p className="mt-2 text-xs leading-6 text-text-body">{consultationCards[0]?.description}</p>
              </div>
              <div className="rounded-sm border border-border bg-[#F8FAFC] p-5">
                <BadgeCheck className="size-4 text-brand-primary" />
                <p className="mt-3 text-sm font-semibold text-text-heading">{consultationCards[1]?.title}</p>
                <p className="mt-2 text-xs leading-6 text-text-body">{consultationCards[1]?.description}</p>
              </div>
            </div>
          </article>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <article className="relative overflow-hidden rounded-sm border border-border bg-[#f8fafc] p-7 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
            <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-brand-primary/15 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-3 rounded-sm border border-border bg-white px-4 py-2 text-xs font-semibold tracking-[0.16em] text-brand-primary">
                <Shield className="size-4" />
                {messages.home.services.flow.badge}
              </div>

              <h3 className="text-2xl font-bold leading-tight text-text-heading sm:text-[2rem]">
                {messages.home.services.flow.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-text-body sm:text-base">
                {messages.home.services.flow.description}
              </p>

              <div className="mt-7 space-y-3">
                {flowSteps.map((item, index) => (
                  <div key={item.title} className="rounded-sm border border-border bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-heading">{item.title}</p>
                        <p className="mt-1 text-xs leading-6 text-text-body">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </ScrollReveal>
      </div>
    </section>
  );
}
