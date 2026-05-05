"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useLocale } from "@/components/providers/locale-provider";
import { formatCurrency } from "@/lib/format";

type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  stock: number;
  unit: string;
  imageUrl?: string | null;
  status: string;
  lowStockThreshold: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

type FeaturedProductsSectionProps = {
  products: FeaturedProduct[];
};

function oemFromId(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const cut = cleaned.slice(0, 11).padEnd(11, "0");
  return `${cut.slice(0, 2)}-${cut.slice(2, 4)}-${cut.slice(4, 7)}-${cut.slice(7, 11)}`;
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  const { messages } = useLocale();

  return (
    <section className="container-wrap mt-16">
      <ScrollReveal className="mb-10 flex flex-col gap-3">
        <h2 className="text-[32px] font-bold leading-tight tracking-[-0.02em] text-text-heading uppercase">
          {messages.home.products.title}
        </h2>
        <p className="max-w-3xl text-base text-text-muted">{messages.home.products.description}</p>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 8).map((product, index) => {
          const inStock = product.stock > 0;

          return (
            <ScrollReveal key={product.id} delay={index * 0.05} className="h-full">
              <article className="group relative flex h-full flex-col rounded-sm border border-[#E5E7EB] bg-white p-4 transition-colors duration-200 hover:border-brand-primary">
                <div className="mb-4 flex h-[240px] w-full items-center justify-center overflow-hidden rounded-sm bg-white">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 25vw"
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full border border-border bg-[#F4F5F7]" />
                  )}
                </div>

                <div className="flex flex-grow flex-col gap-2">
                  <span className="text-[12px] font-medium uppercase tracking-[0.05em] text-text-muted">
                    OEM: {oemFromId(product.id)}
                  </span>

                  <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-text-heading">{product.name}</h3>

                  <div className="mt-auto flex flex-col gap-3 pt-2">
                    <span className="text-xl font-bold text-text-heading">{formatCurrency(Number(product.price))}</span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block size-2 rounded-full ${inStock ? "bg-[#008A52]" : "bg-[#E7222E]"}`}
                      />
                      <span className="text-[12px] text-text-body">
                        {inStock
                          ? `${product.stock} ${product.unit} available`
                          : "Out of stock"}
                      </span>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-2 flex h-10 items-center justify-center rounded-sm bg-[#F4F5F7] text-[14px] font-bold uppercase tracking-wide text-text-heading transition-colors duration-200 group-hover:bg-brand-primary group-hover:text-white"
                    >
                      View Detail
                    </Link>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          );
        })}
      </div>

      <div className="mt-7 flex justify-end">
        <Link
          href="/products"
          className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-white px-5 text-sm font-semibold text-text-heading transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
        >
          <span>{messages.header.nav.products}</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
