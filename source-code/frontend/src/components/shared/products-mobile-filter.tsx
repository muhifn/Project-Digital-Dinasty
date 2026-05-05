"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X, Search, Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLocale } from "@/components/providers/locale-provider";

type Category = { id: string; name: string; slug: string };

type ProductForFilter = {
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: string;
};

type MobileFilterProps = {
  categories: Category[];
  products: ProductForFilter[];
};

function PriceHistogramMobile({
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

export function ProductsMobileFilter({ categories, products }: MobileFilterProps) {
  const { messages } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Local draft state (applied on "Apply Filters")
  const activeCategories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const stockFilter = searchParams.get("stockStatus")?.split(",").filter(Boolean) ?? [];

  const [draftCategories, setDraftCategories] = useState<string[]>(activeCategories);
  const [draftStock, setDraftStock] = useState<string[]>(stockFilter);
  const [draftSearch, setDraftSearch] = useState(searchParams.get("search") ?? "");
  const [draftMin, setDraftMin] = useState(searchParams.get("minPrice") ?? "");
  const [draftMax, setDraftMax] = useState(searchParams.get("maxPrice") ?? "");

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // Listen for the custom event from toolbar
  useEffect(() => {
    function handleOpen() {
      // Sync draft state with current URL params before opening
      setDraftCategories(searchParams.get("category")?.split(",").filter(Boolean) ?? []);
      setDraftStock(searchParams.get("stockStatus")?.split(",").filter(Boolean) ?? []);
      setDraftSearch(searchParams.get("search") ?? "");
      setDraftMin(searchParams.get("minPrice") ?? "");
      setDraftMax(searchParams.get("maxPrice") ?? "");
      setIsOpen(true);
    }
    window.addEventListener("open-mobile-filters", handleOpen);
    return () => window.removeEventListener("open-mobile-filters", handleOpen);
  }, [searchParams]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function toggleDraftCategory(slug: string) {
    setDraftCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function toggleDraftStock(key: string) {
    setDraftStock((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (draftSearch) params.set("search", draftSearch);
    if (draftCategories.length > 0) params.set("category", draftCategories.join(","));
    if (draftMin) params.set("minPrice", draftMin);
    if (draftMax) params.set("maxPrice", draftMax);
    if (draftStock.length > 0) params.set("stockStatus", draftStock.join(","));

    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);

    router.push(`/products?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  }

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <aside
          className="fixed right-0 top-0 bottom-0 z-50 w-80 overflow-y-auto bg-card p-6 shadow-2xl transition-transform lg:hidden"
          style={{ animation: "slideInRight 0.25s ease-out" }}
        >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-heading">{messages.productsPage.filters}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="motion-button rounded-full p-2 transition-colors hover:bg-muted"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Search */}
          <section>
            <h3 className="mb-4 font-bold text-text-heading">{messages.productsPage.search}</h3>
            <div className="relative">
              <input
                type="text"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                placeholder={messages.productsPage.searchPlaceholder}
                className="w-full rounded-sm border border-border bg-card py-2.5 pl-3 pr-9 text-sm outline-none focus:border-brand-primary"
              />
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            </div>
          </section>

          {/* Categories */}
          <section>
            <h3 className="mb-4 font-bold text-text-heading">{messages.productsPage.categories}</h3>
            <div className="grid grid-cols-1 gap-y-3">
              {categories.map((cat) => {
                const isChecked = draftCategories.includes(cat.slug);
                return (
                  <label
                    key={cat.id}
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() => toggleDraftCategory(cat.slug)}
                  >
                    <div
                      className={`flex size-5 items-center justify-center rounded border transition-colors ${
                        isChecked ? "border-brand-primary bg-brand-primary" : "border-gray-300"
                      }`}
                    >
                      {isChecked && <Check className="size-3 text-white" />}
                    </div>
                    <span className={`text-sm ${isChecked ? "font-medium text-text-heading" : "text-text-body"}`}>
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
            <PriceHistogramMobile products={products} minPrice={priceRange.min} maxPrice={priceRange.max} />
            <div className="mt-2 flex items-center justify-between text-xs font-bold text-text-heading">
              <span>{formatRp(priceRange.min)}</span>
              <span>{formatRp(priceRange.max)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                value={draftMin}
                onChange={(e) => setDraftMin(e.target.value)}
                placeholder={messages.productsPage.min}
                 className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
              <span className="text-sm text-text-muted">-</span>
              <input
                type="number"
                value={draftMax}
                onChange={(e) => setDraftMax(e.target.value)}
                placeholder={messages.productsPage.max}
                className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
            </div>
          </section>

          {/* Stock Status */}
          <section>
            <h3 className="mb-4 font-bold text-text-heading">{messages.productsPage.stockStatus}</h3>
            <div className="space-y-3">
              {[
                { key: "available", label: messages.productsPage.available },
                { key: "low", label: messages.productsPage.lowStock },
                { key: "out", label: messages.productsPage.outOfStock },
              ].map((item) => {
                const isChecked = draftStock.includes(item.key);
                return (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() => toggleDraftStock(item.key)}
                  >
                    <div
                      className={`flex size-5 items-center justify-center rounded border transition-colors ${
                        isChecked ? "border-brand-primary bg-brand-primary" : "border-gray-300"
                      }`}
                    >
                      {isChecked && <Check className="size-3 text-white" />}
                    </div>
                    <span className={`text-sm ${isChecked ? "font-medium text-text-heading" : "text-text-body"}`}>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Apply button */}
          <button
            type="button"
            onClick={applyFilters}
            className="motion-button w-full rounded-sm bg-brand-primary py-4 text-sm font-bold text-white shadow-lg shadow-brand-primary/30 transition-transform active:scale-95"
          >
            {messages.productsPage.applyFilters}
          </button>
        </div>
      </aside>
    </>
  );
}
