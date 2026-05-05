"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { LiveStockBadge } from "@/components/shared/live-stock-badge";
import { useLocale } from "@/components/providers/locale-provider";
import { useStockStore } from "@/stores/stock-store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: string | number;
    stock: number;
    unit: string;
    imageUrl: string | null;
    status: "AVAILABLE" | "OUT_OF_STOCK";
    lowStockThreshold: number;
    category?: {
      name: string;
      slug: string;
    };
  };
  className?: string;
  emphasis?: "default" | "feature";
};

export function ProductCard({ product, className, emphasis = "default" }: ProductCardProps) {
  const { messages } = useLocale();
  const liveEntry = useStockStore((s) => s.stockMap[product.id]);
  const effectiveStock = liveEntry?.stock ?? product.stock;
  const isFeature = emphasis === "feature";

  const description = product.description?.trim() || messages.productCard.descriptionFallback;
  const isInStock = effectiveStock > 0;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]",
        isFeature && "sm:flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b border-border bg-card",
          isFeature ? "aspect-[16/10] sm:aspect-auto sm:min-h-[250px] sm:w-[45%] sm:border-b-0 sm:border-r" : "h-[220px]",
        )}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            sizes={isFeature ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 100vw, 33vw"}
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <div className="h-20 w-20 rounded-full border border-border bg-card" />
          </div>
        )}

        <div className="absolute left-3 top-3 z-10 rounded-sm border border-border bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          {product.category?.name ?? messages.productCard.defaultCategory}
        </div>

        <div className="absolute right-3 top-3 z-10">
          <LiveStockBadge productId={product.id} initialStock={product.stock} threshold={product.lowStockThreshold} />
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-4", isFeature && "sm:p-5")}>
        <h3 className="line-clamp-2 min-h-[3.1rem] text-base font-semibold leading-6 text-text-heading">{product.name}</h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-body">{description}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
            <span className="text-xl font-bold text-text-heading">{formatCurrency(Number(product.price))}</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-text-body">
              <span className={cn("size-2 rounded-full", isInStock ? "bg-[#008A52]" : "bg-[#E7222E]")} />
              {effectiveStock} {product.unit}
            </span>
          </div>

          <div className={cn("mt-4 grid gap-2.5", isFeature && "sm:grid-cols-2")}>
            <Link
              href={`/products/${product.slug}`}
              className={cn(
                "motion-button inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-md border border-primary/35 bg-white px-4 text-xs font-bold tracking-[0.12em] text-text-heading uppercase shadow-[2px_2px_0_rgba(68,94,255,0.22)] transition-colors hover:bg-brand-primary hover:text-white dark:border-primary/55 dark:bg-[#111827] dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]",
              )}
            >
              <span>{messages.productCard.detail}</span>
              <ArrowRight className="motion-arrow size-4" />
            </Link>

            <Link
              href="https://tk.tokopedia.com/ZSHhyGtpk/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "motion-button inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-md border border-primary/35 bg-white px-4 text-xs font-bold tracking-[0.12em] text-text-heading uppercase shadow-[2px_2px_0_rgba(68,94,255,0.22)] transition-colors hover:border-brand-primary/30 hover:text-brand-primary dark:border-primary/55 dark:bg-[#111827] dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]",
              )}
            >
              <ChannelIcon channel="tokopedia" size={18} />
              <span>{messages.productCard.buyTokopedia}</span>
              <ArrowUpRight className="motion-arrow size-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
