"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useLocale } from "@/components/providers/locale-provider";

const TOKOPEDIA_STORE_URL = "https://tk.tokopedia.com/ZSHhyGtpk/";
const WHATSAPP_URL = "https://wa.me/6281234567890";

export function FaqAccordion() {
  const { messages } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const contactCards = [
    {
      key: "whatsapp",
      icon: MessageCircle,
      title: messages.home.faq.contact.cards.whatsapp.title,
      description: messages.home.faq.contact.cards.whatsapp.description,
      value: messages.home.faq.contact.cards.whatsapp.value,
    },
    {
      key: "tokopedia",
      icon: ShoppingBag,
      title: messages.home.faq.contact.cards.tokopedia.title,
      description: messages.home.faq.contact.cards.tokopedia.description,
      value: messages.home.faq.contact.cards.tokopedia.value,
    },
    {
      key: "location",
      icon: MapPin,
      title: messages.home.faq.contact.cards.location.title,
      description: messages.home.faq.contact.cards.location.description,
      value: messages.home.faq.contact.cards.location.value,
    },
  ];

  return (
    <section className="container-wrap mt-16 pb-10">
      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-sm border border-border bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-8">
          <ScrollReveal className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">{messages.home.faq.badge}</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-text-heading sm:text-[2.2rem]">
              {messages.home.faq.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-text-body sm:text-base">{messages.home.faq.description}</p>
          </ScrollReveal>

          <div className="mt-8 space-y-3">
            {messages.home.faq.items.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <ScrollReveal key={item.question} delay={index * 0.05}>
                  <article className="rounded-sm border border-border bg-[#f8fafc]">
                    <button
                      type="button"
                      onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-semibold text-text-heading sm:text-base">{item.question}</span>
                      <ChevronDown
                        className={`size-5 shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <div
                      className={`grid overflow-hidden transition-all duration-300 ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="min-h-0">
                        <p className="px-5 pb-5 text-sm leading-7 text-text-body">{item.answer}</p>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        <ScrollReveal delay={0.1}>
          <div className="relative overflow-hidden rounded-sm border border-border bg-[#f8fafc] p-7 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
            <div className="absolute -right-10 top-10 h-32 w-32 rounded-full bg-brand-primary/15 blur-3xl" />
            <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-[#E7222E]/10 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">{messages.home.faq.contact.badge}</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-text-heading sm:text-[2.2rem]">
                {messages.home.faq.contact.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-text-body sm:text-base">
                {messages.home.faq.contact.description}
              </p>

              <div className="mt-7 grid gap-3">
                {contactCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.key} className="rounded-sm border border-border bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm bg-brand-primary/10 text-brand-primary">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-heading">{item.title}</p>
                          <p className="mt-1 text-xs leading-6 text-text-body">{item.description}</p>
                          <p className="mt-2 text-sm font-medium text-text-heading">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1fb855]"
                >
                  <MessageCircle className="size-4" />
                  {messages.home.faq.contact.primaryCta}
                </a>
                <Link
                  href={TOKOPEDIA_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-border bg-white px-6 text-sm font-semibold text-text-heading transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
                >
                  <ShoppingBag className="size-4" />
                  {messages.home.faq.contact.secondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
