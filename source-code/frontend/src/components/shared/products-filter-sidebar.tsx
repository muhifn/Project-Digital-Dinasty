"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Check } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useLocale } from "@/components/providers/locale-provider";

type Category = { id: string; name: string; slug: string };

type ProductForFilter = {
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: string;
};

type ProductsFilterSidebarProps = {
  categories: Category[];
  products: ProductForFilter[];
};

function PriceHistogram({
  products,
  minPrice,
  maxPrice,
}: {
  products: ProductForFilter[];
  minPrice: number;
  maxPrice: number;
}) {
  const bars = useMemo(() => {
    const bucketCount = 20;
    const range = maxPrice - minPrice || 1;
    const bucketSize = range / bucketCount;
    const buckets = new Array(bucketCount).fill(0);

    for (const p of products) {
      const idx = Math.min(Math.floor((p.price - minPrice) / bucketSize), bucketCount - 1);
      if (idx >= 0) buckets[idx]++;
    }

    const maxCount = Math.max(...buckets, 1);
    return buckets.map((count) => Math.max((count / maxCount) * 100, 8));
  }, [products, minPrice, maxPrice]);

  return (
    <div className="flex h-20 items-end gap-[2px]">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-brand-primary/70 transition-all"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export function ProductsFilterSidebar({ categories, products }: ProductsFilterSidebarProps) {
  const { messages } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const searchValue = searchParams.get("search") ?? "";
  const minPriceParam = searchParams.get("minPrice") ?? "";
  const maxPriceParam = searchParams.get("maxPrice") ?? "";
  const stockFilter = searchParams.get("stockStatus")?.split(",").filter(Boolean) ?? [];

  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localMin, setLocalMin] = useState(minPriceParam);
  const [localMax, setLocalMax] = useState(maxPriceParam);

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`/products?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  function toggleCategory(slug: string) {
    let next: string[];
    if (activeCategories.includes(slug)) {
      next = activeCategories.filter((s) => s !== slug);
    } else {
      next = [...activeCategories, slug];
    }
    pushParams({ category: next.length > 0 ? next.join(",") : null });
  }

  function toggleStock(status: string) {
    let next: string[];
    if (stockFilter.includes(status)) {
      next = stockFilter.filter((s) => s !== status);
    } else {
      next = [...stockFilter, status];
    }
    pushParams({ stockStatus: next.length > 0 ? next.join(",") : null });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ search: localSearch || null });
  }

  function handlePriceApply() {
    pushParams({
      minPrice: localMin || null,
      maxPrice: localMax || null,
    });
  }

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <aside className="hidden w-64 shrink-0 space-y-8 lg:block">
      {/* Search */}
      <section>
        <h3 className="mb-4 font-bold text-text-heading">{messages.productsPage.search}</h3>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={messages.productsPage.searchPlaceholder}
            className="w-full rounded-sm border border-border bg-card py-2 pl-3 pr-9 text-xs outline-none transition-colors focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
          />
          <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <Search className="size-4 text-text-muted" />
          </button>
        </form>
      </section>

      {/* Categories */}
      <section>
        <h3 className="mb-4 font-bold text-text-heading">{messages.productsPage.categories}</h3>
        <div className="grid grid-cols-1 gap-y-3">
          {categories.map((cat) => {
            const isChecked = activeCategories.includes(cat.slug);
            return (
              <label key={cat.id} className="flex cursor-pointer items-center gap-2 group">
                <div
                  className={`flex size-4 items-center justify-center rounded border transition-colors ${
                    isChecked
                      ? "border-brand-primary bg-brand-primary"
                      : "border-gray-300 group-hover:border-brand-primary"
                  }`}
                  onClick={() => toggleCategory(cat.slug)}
                >
                  {isChecked && <Check className="size-3 text-white" />}
                </div>
                <span
                  className={`text-xs ${isChecked ? "font-medium text-text-heading" : "text-text-body"}`}
                  onClick={() => toggleCategory(cat.slug)}
                >
                  {cat.name}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Price Range */}
      <section>
        <h3 className="mb-4 font-bold text-text-heading">{messages.productsPage.priceRange}</h3>
        <PriceHistogram products={products} minPrice={priceRange.min} maxPrice={priceRange.max} />
        <div className="mt-2 flex items-center justify-between text-xs font-bold text-text-heading">
          <span>{formatRp(priceRange.min)}</span>
          <span>{formatRp(priceRange.max)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder={messages.productsPage.min}
            className="w-full rounded-sm border border-border bg-card px-2 py-1.5 text-xs outline-none focus:border-brand-primary"
          />
          <span className="text-xs text-text-muted">-</span>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder={messages.productsPage.max}
            className="w-full rounded-sm border border-border bg-card px-2 py-1.5 text-xs outline-none focus:border-brand-primary"
          />
        </div>
        <button
          type="button"
          onClick={handlePriceApply}
          className="motion-button mt-2 w-full rounded-sm bg-brand-primary/10 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/20"
        >
          {messages.productsPage.applyPrice}
        </button>
      </section>

      {/* Stock Status */}
      <section>
        <h3 className="mb-4 font-bold text-text-heading">{messages.productsPage.stockStatus}</h3>
        <div className="space-y-3">
          {[
            { key: "available", label: messages.productsPage.available, color: "bg-[#e6f4ee] text-[#2d6a4f]" },
            { key: "low", label: messages.productsPage.lowStock, color: "bg-[#fff4db] text-[#8c5e00]" },
            { key: "out", label: messages.productsPage.outOfStock, color: "bg-brand-primary/10 text-brand-primary" },
          ].map((item) => {
            const isChecked = stockFilter.includes(item.key);
            return (
              <label key={item.key} className="flex cursor-pointer items-center gap-2 group">
                <div
                  className={`flex size-4 items-center justify-center rounded border transition-colors ${
                    isChecked
                      ? "border-brand-primary bg-brand-primary"
                      : "border-gray-300 group-hover:border-brand-primary"
                  }`}
                  onClick={() => toggleStock(item.key)}
                >
                  {isChecked && <Check className="size-3 text-white" />}
                </div>
                <span
                  className={`text-xs ${isChecked ? "font-medium text-text-heading" : "text-text-body"}`}
                  onClick={() => toggleStock(item.key)}
                >
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
