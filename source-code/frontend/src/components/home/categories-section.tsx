"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useLocale } from "@/components/providers/locale-provider";

type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
};

type CategoriesSectionProps = {
  categories: CategorySummary[];
};

const categoryIconPaths: Record<string, string> = {
  "rak-lampu": "/images/categories/rak-lampu.png",
  "rak-spare-part": "/images/categories/rak-spare-part.png",
  "rak-kaca": "/images/categories/rak-kaca.png",
  variasi: "/images/categories/variasi.png",
  "bemper-caver": "/images/categories/bemper-caver.png",
  "bumper-cover": "/images/categories/bemper-caver.png",
  "ban-velg": "/images/categories/ban-velg.png",
};

const categoryDisplayNames: Record<string, string> = {
  "bemper-caver": "Bumper & Cover",
  "bumper-cover": "Bumper & Cover",
};

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const { messages } = useLocale();

  return (
    <section className="container-wrap mt-16">
      <ScrollReveal className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">{messages.home.categories.badge}</p>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-text-heading sm:text-[2.35rem]">
          {messages.home.categories.title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-text-body sm:text-base">
          {messages.home.categories.description}
        </p>
      </ScrollReveal>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category, index) => {
          const iconPath = categoryIconPaths[category.slug];
          const categoryName = categoryDisplayNames[category.slug] ?? category.name;

          return (
            <ScrollReveal key={category.id} delay={index * 0.06} className="h-full">
              <Link
                href={`/products?category=${category.slug}`}
                className="group flex h-full items-center gap-4 rounded-sm border border-border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-sm border border-border bg-[#F8FAFC] p-3">
                  {iconPath ? (
                    <Image
                      src={iconPath}
                      alt={categoryName}
                      fill
                      sizes="80px"
                      className="object-contain p-3"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-text-heading transition-colors group-hover:text-brand-primary">
                    {categoryName}
                  </p>
                  <p className="mt-1 text-sm text-text-body">
                    {category._count.products} {messages.home.categories.productCountSuffix}
                  </p>
                </div>

                <ArrowRight className="size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" />
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
