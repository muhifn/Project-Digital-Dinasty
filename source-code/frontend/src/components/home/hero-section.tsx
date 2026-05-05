"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, Store } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { ChannelIcon } from "@/components/shared/channel-icon";

type HeroSectionProps = {
  tokopediaStoreUrl: string;
  whatsappUrl: string;
  stats: {
    rating: number;
    totalRatings: number;
    satisfaction: number;
    sold: number;
  };
  totalCategories: number;
};

export function HeroSection({ tokopediaStoreUrl, whatsappUrl, stats, totalCategories }: HeroSectionProps) {
  const { messages } = useLocale();

  return (
    <section className="container-wrap pb-4 pt-2 sm:pt-4">
      <div className="relative overflow-hidden rounded-xl border border-border bg-white px-6 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-[#E7222E]/10 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.02fr] lg:items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.42 }}
              className="inline-flex rounded-sm border border-border bg-[#F4F5F7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary"
            >
              {messages.home.hero.badge}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.46, delay: 0.04 }}
              className="mt-4 text-4xl font-bold leading-[1.03] text-text-heading sm:text-5xl xl:text-[3.75rem]"
            >
              {messages.home.hero.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.48, delay: 0.1 }}
              className="mt-5 max-w-2xl text-base leading-7 text-text-body"
            >
              {messages.home.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.48, delay: 0.16 }}
              className="mt-7 grid w-full max-w-xl gap-3 sm:grid-cols-2"
            >
              <Link
                href={tokopediaStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md bg-primary px-5 text-[11px] font-bold tracking-[0.2em] text-white uppercase transition-colors hover:bg-brand-primary-hover"
              >
                <ChannelIcon channel="tokopedia" size={18} />
                {messages.home.hero.primaryCta}
                <ArrowRight className="size-4" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md border border-border bg-white px-5 text-[11px] font-bold tracking-[0.2em] text-text-heading uppercase transition-colors hover:border-brand-primary/35 hover:text-brand-primary"
              >
                <ChannelIcon channel="whatsapp" size={18} />
                {messages.home.hero.secondaryCta}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 grid gap-3 sm:grid-cols-3"
            >
              <div className="rounded-sm border border-border bg-[#F8FAFC] p-4">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-heading">
                  <Star className="size-4 text-[#F59E0B]" />
                  {stats.rating}/5.0
                </div>
                <p className="mt-1 text-xs text-text-muted">{stats.totalRatings} {messages.home.hero.stats.reviews}</p>
              </div>

              <div className="rounded-sm border border-border bg-[#F8FAFC] p-4">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-heading">
                  <Store className="size-4 text-brand-primary" />
                  {totalCategories}
                </div>
                <p className="mt-1 text-xs text-text-muted">{messages.home.hero.stats.categories}</p>
              </div>

              <div className="rounded-sm border border-border bg-[#F8FAFC] p-4">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-heading">
                  <ShieldCheck className="size-4 text-[#008A52]" />
                  {stats.satisfaction}%
                </div>
                <p className="mt-1 text-xs text-text-muted">{messages.home.hero.stats.satisfaction}</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.56, delay: 0.12 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="relative col-span-2 h-56 overflow-hidden rounded-sm border border-border bg-[#f4f5f7] sm:h-72">
              <Image
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80"
                alt="BMW coupe in motion"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="relative h-36 overflow-hidden rounded-sm border border-border bg-[#f4f5f7] sm:h-44">
              <Image
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80"
                alt="BMW wheel detail"
                fill
                unoptimized
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>

            <div className="relative h-36 overflow-hidden rounded-sm border border-border bg-[#f4f5f7] sm:h-44">
              <Image
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80"
                alt="BMW front profile"
                fill
                unoptimized
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
