"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Package, ShoppingBag, Star, Store } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

type TokopediaStats = {
  rating: number;
  totalRatings: number;
  satisfaction: number;
  sold: number;
};

type SocialProofSectionProps = {
  totalProducts: number;
  totalCategories: number;
  tokopediaStats: TokopediaStats;
};

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let start = 0;
    const increment = target / (duration / 16);
    let raf: number;

    const step = () => {
      start += increment;
      if (start >= target) {
        setCount(target);
        return;
      }
      setCount(target < 10 ? Number(start.toFixed(1)) : Math.floor(start));
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger]);

  return count;
}

function StatCard({
  label,
  numericValue,
  displaySuffix,
  index,
  icon: Icon,
}: {
  label: string;
  numericValue: number;
  displaySuffix?: string;
  index: number;
  icon: typeof Package;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.45 });
  const count = useCountUp(numericValue, 1400, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-sm border border-border bg-white p-5"
    >
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-3xl font-bold text-text-heading">
        {numericValue < 10 ? count.toFixed(1) : count}
        {displaySuffix}
      </p>
      <p className="mt-2 text-sm font-medium text-text-heading">{label}</p>
    </motion.div>
  );
}

export function SocialProofSection({
  totalProducts,
  totalCategories,
  tokopediaStats,
}: SocialProofSectionProps) {
  const { messages } = useLocale();

  const stats = [
    {
      label: messages.home.socialProof.items.products,
      numericValue: totalProducts,
      displaySuffix: "+",
      icon: Package,
    },
    {
      label: messages.home.socialProof.items.categories,
      numericValue: totalCategories,
      icon: Store,
    },
    {
      label: messages.home.socialProof.items.rating,
      numericValue: tokopediaStats.rating,
      displaySuffix: "/5",
      icon: Star,
    },
    {
      label: messages.home.socialProof.items.sold,
      numericValue: tokopediaStats.sold,
      displaySuffix: "+",
      icon: ShoppingBag,
    },
  ];

  return (
      <section className="container-wrap mt-16">
      <div className="rounded-sm border border-border bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">{messages.home.socialProof.badge}</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-text-heading sm:text-[2.35rem]">
              {messages.home.socialProof.title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-text-body sm:text-base">
              {messages.home.socialProof.description}
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((item, index) => (
              <StatCard
                key={item.label}
                label={item.label}
                numericValue={item.numericValue}
                displaySuffix={item.displaySuffix}
                index={index}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
