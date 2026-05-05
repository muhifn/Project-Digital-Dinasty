"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { FitmentOption } from "@/lib/bmw-fitment";
import { useLocale } from "@/components/providers/locale-provider";
import { GridCardIcon, type GridCardIconName } from "@/components/shared/grid-card-icon";

type ProductsToolbarProps = {
  categories: { id: string; name: string; slug: string }[];
  totalCount: number;
  fitmentOptions: FitmentOption[];
};

type FitmentDropdownOption = {
  value: string;
  label: string;
};

type FitmentDropdownProps = {
  label: string;
  value: string;
  options: FitmentDropdownOption[];
  iconName: GridCardIconName;
  onChange: (value: string) => void;
};

function FitmentDropdown({ label, value, options, iconName, onChange }: FitmentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold tracking-[0.12em] text-text-muted">{label}</span>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          className="motion-button flex h-12 w-full items-center gap-3 rounded-md border border-primary/35 bg-white pl-3 pr-3 text-left text-sm text-text-body shadow-[2px_2px_0_rgba(68,94,255,0.22)] outline-none transition-colors hover:border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-primary/55 dark:bg-[#111827] dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]"
        >
          <GridCardIcon name={iconName} className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate">{selectedOption?.label}</span>
          <ChevronDown className={`size-4 shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen ? (
          <div
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-50 max-h-64 overflow-auto rounded-sm border border-border bg-card p-1 shadow-[0_18px_44px_rgba(15,23,42,0.16)]"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex min-h-10 w-full items-center rounded-sm px-3 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-brand-primary text-white"
                      : "text-text-body hover:bg-muted hover:text-text-heading"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ProductsToolbar({ categories, totalCount, fitmentOptions }: ProductsToolbarProps) {
  const { messages } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "all";
  const activeSort = searchParams.get("sort") ?? "featured";
  const activeYear = searchParams.get("year") ?? "all";
  const activeSeries = searchParams.get("series") ?? "all";
  const chassisParam = searchParams.get("chassis");
  const activeChassis = chassisParam ? chassisParam.toUpperCase() : "all";
  const activeSearch = searchParams.get("search") ?? "";

  const [keyword, setKeyword] = useState(activeSearch);

  useEffect(() => {
    setKeyword(activeSearch);
  }, [activeSearch]);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all" || value === "featured") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products", { scroll: false });
  }

  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    for (const item of fitmentOptions) {
      for (let year = item.startYear; year <= item.endYear; year += 1) {
        years.add(year);
      }
    }
    return [...years].sort((a, b) => b - a);
  }, [fitmentOptions]);

  const yearDropdownOptions = useMemo(
    () => [
      { value: "all", label: messages.productsPage.yearAll },
      ...yearOptions.map((year) => ({ value: String(year), label: String(year) })),
    ],
    [messages.productsPage.yearAll, yearOptions],
  );

  const filteredForSeries = useMemo(() => {
    if (activeYear === "all") return fitmentOptions;
    const yearValue = Number(activeYear);
    if (Number.isNaN(yearValue)) return fitmentOptions;

    return fitmentOptions.filter((item) => yearValue >= item.startYear && yearValue <= item.endYear);
  }, [activeYear, fitmentOptions]);

  const seriesOptions = useMemo(() => {
    return [...new Set(filteredForSeries.map((item) => item.series))].sort((a, b) => a.localeCompare(b));
  }, [filteredForSeries]);

  const seriesDropdownOptions = useMemo(
    () => [
      { value: "all", label: messages.productsPage.seriesAll },
      ...seriesOptions.map((series) => ({ value: series, label: series })),
    ],
    [messages.productsPage.seriesAll, seriesOptions],
  );

  const chassisOptions = useMemo(() => {
    const filtered = filteredForSeries.filter((item) => {
      if (activeSeries !== "all" && item.series !== activeSeries) return false;
      return true;
    });

    return [...new Set(filtered.map((item) => item.chassis))].sort((a, b) => a.localeCompare(b));
  }, [activeSeries, filteredForSeries]);

  const chassisDropdownOptions = useMemo(
    () => [
      { value: "all", label: messages.productsPage.chassisAll },
      ...chassisOptions.map((chassis) => ({ value: chassis.toUpperCase(), label: chassis.toUpperCase() })),
    ],
    [chassisOptions, messages.productsPage.chassisAll],
  );

  return (
    <div className="mb-8 space-y-6 border-b border-border pb-7">
      <div className="text-xs text-text-muted">
        {messages.productsPage.breadcrumbHome} /{" "}
        <span className="font-medium text-text-heading">{messages.productsPage.breadcrumbProducts}</span>
      </div>

      <div className="rounded-md border border-primary/45 bg-white p-5 shadow-[3px_3px_0_rgba(68,94,255,0.48)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] sm:p-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-primary">{messages.productsPage.vehicleFinderBadge}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-heading sm:text-3xl">
            {messages.productsPage.vehicleFinderTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-body">{messages.productsPage.vehicleFinderDescription}</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({ search: keyword.trim() });
          }}
          className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(16rem,1.4fr)_minmax(15rem,auto)] xl:items-end"
        >
          <FitmentDropdown
            label={messages.productsPage.yearLabel}
            value={activeYear}
            options={yearDropdownOptions}
            iconName="calendar"
            onChange={(value) => updateParams({ year: value, series: "all", chassis: "all" })}
          />

          <FitmentDropdown
            label={messages.productsPage.seriesLabel}
            value={activeSeries}
            options={seriesDropdownOptions}
            iconName="car"
            onChange={(value) => updateParams({ series: value, chassis: "all" })}
          />

          <FitmentDropdown
            label={messages.productsPage.chassisLabel}
            value={activeChassis}
            options={chassisDropdownOptions}
            iconName="wrench"
            onChange={(value) => updateParams({ chassis: value })}
          />

          <label className="space-y-2">
            <span className="text-xs font-semibold tracking-[0.12em] text-text-muted">{messages.productsPage.keywordLabel}</span>
            <div className="relative">
              <GridCardIcon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={messages.productsPage.keywordPlaceholder}
                className="h-12 w-full rounded-md border border-primary/35 bg-white pl-9 pr-4 text-sm text-text-body shadow-[2px_2px_0_rgba(68,94,255,0.22)] outline-none transition-colors hover:border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-primary/55 dark:bg-[#111827] dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]"
              />
            </div>
          </label>

          <div className="space-y-2 md:col-span-2 xl:col-span-1">
            <span className="hidden text-xs font-semibold tracking-[0.12em] text-transparent xl:block" aria-hidden="true">
              Actions
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_1.05fr]">
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  updateParams({ year: "all", series: "all", chassis: "all", search: "" });
                }}
                className="motion-button inline-flex h-12 items-center justify-center rounded-md border border-primary/35 bg-white px-4 text-sm font-semibold text-text-body shadow-[2px_2px_0_rgba(68,94,255,0.22)] transition-colors hover:border-primary hover:text-primary dark:border-primary/55 dark:bg-[#111827] dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]"
              >
                {messages.productsPage.clearFitment}
              </button>

              <button
                type="submit"
                className="motion-button inline-flex h-12 items-center justify-center rounded-md bg-brand-primary px-4 text-sm font-semibold text-white shadow-[2px_2px_0_rgba(68,94,255,0.4)] transition-colors hover:bg-brand-primary-hover"
              >
                {messages.productsPage.findParts}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-heading">{messages.productsPage.breadcrumbProducts}</h1>
          <p className="mt-2 text-sm text-text-body">
            <span className="font-semibold text-text-heading">{totalCount}</span> {messages.productsPage.items}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={activeSort}
              onChange={(event) => updateParams({ sort: event.target.value })}
                className="h-10 appearance-none rounded-sm border border-border bg-card pl-4 pr-10 text-sm font-medium text-text-body outline-none transition-colors hover:bg-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="featured">{messages.productsPage.popular}</option>
              <option value="newest">{messages.productsPage.newest}</option>
              <option value="price_asc">{messages.productsPage.priceLowHigh}</option>
              <option value="price_desc">{messages.productsPage.priceHighLow}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          </div>

          <button
            type="button"
            onClick={() => {
              const event = new CustomEvent("open-mobile-filters");
              window.dispatchEvent(event);
            }}
            className="motion-button inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-muted lg:hidden"
          >
            <GridCardIcon name="filter" className="size-4" />
            {messages.productsPage.filters}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => updateParams({ category: "all" })}
          className={`motion-button shrink-0 rounded-md px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all ${
            activeCategory === "all"
              ? "bg-brand-primary text-white shadow-[3px_3px_0_rgba(68,94,255,0.45)]"
              : "border border-primary/35 bg-white text-text-body shadow-[2px_2px_0_rgba(68,94,255,0.22)] hover:border-primary dark:border-primary/55 dark:bg-[#111827] dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]"
          }`}
        >
          {messages.productsPage.all}
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => updateParams({ category: category.slug })}
            className={`motion-button shrink-0 rounded-md px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all ${
              activeCategory === category.slug
                ? "bg-brand-primary text-white shadow-[3px_3px_0_rgba(68,94,255,0.45)]"
                : "border border-primary/35 bg-white text-text-body shadow-[2px_2px_0_rgba(68,94,255,0.22)] hover:border-primary dark:border-primary/55 dark:bg-[#111827] dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)]"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
