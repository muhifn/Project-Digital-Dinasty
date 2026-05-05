"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { formatCurrency } from "@/lib/format";

type TopPickProduct = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  imageUrl?: string | null;
  stock: number;
  unit: string;
  category: {
    name: string;
    slug: string;
  };
};

type TopPicksMarqueeProps = {
  products: TopPickProduct[];
};

export function TopPicksMarquee({ products }: TopPicksMarqueeProps) {
  const { messages } = useLocale();

  if (products.length === 0) return null;

  const looping = [...products, ...products];

  return (
    <section className="container-wrap mt-16">
      <ScrollReveal className="mb-7 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">{messages.home.topPicks.badge}</p>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-text-heading sm:text-[2.25rem]">
          {messages.home.topPicks.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-body sm:text-base">{messages.home.topPicks.description}</p>
      </ScrollReveal>

      <div className="overflow-hidden rounded-sm border border-border bg-[#f8fafc] p-4 sm:p-5">
        <div className="marquee-mask">
          <div className="marquee-track-ltr flex w-max gap-4" style={{ animationDuration: "44s" }}>
            {looping.map((product, index) => (
              <article
                key={`${product.id}-${index}`}
                aria-hidden={index >= products.length}
                className="group w-[78vw] max-w-[300px] shrink-0 overflow-hidden rounded-sm border border-border bg-white transition-all hover:border-brand-primary/35 sm:w-[300px]"
              >
                <div className="relative h-40 w-full overflow-hidden bg-[#f4f5f7]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#f4f5f7]" />
                  )}
                </div>

                <div className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{product.category.name}</p>
                  <h3 className="mt-2 line-clamp-2 min-h-[2.9rem] text-sm font-semibold leading-6 text-text-heading">{product.name}</h3>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-base font-bold text-text-heading">{formatCurrency(Number(product.price))}</p>
                    <p className="text-[11px] text-text-muted">
                      {product.stock} {product.unit}
                    </p>
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1 rounded-sm border border-border bg-[#f4f5f7] text-xs font-semibold uppercase tracking-[0.08em] text-text-heading transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white"
                  >
                    Explore
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
