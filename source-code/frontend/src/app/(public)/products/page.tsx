import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { ProductsToolbar } from "@/components/shared/products-toolbar";
import { ProductsFilterSidebar } from "@/components/shared/products-filter-sidebar";
import { ProductsMobileFilter } from "@/components/shared/products-mobile-filter";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/messages";
import { BMW_CHASSIS_FITMENT, buildFitmentOptions, extractChassisCodes } from "@/lib/bmw-fitment";
import { getCategories, getProducts } from "@/lib/products";
import { connection } from "next/server";

type ProductPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: "featured" | "newest" | "price_asc" | "price_desc";
    minPrice?: string;
    maxPrice?: string;
    stockStatus?: string;
    year?: string;
    series?: string;
    chassis?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductPageProps) {
  await connection();
  const locale = await getRequestLocale();
  const messages = getDictionary(locale);
  const params = await searchParams;

  // Fetch from Go API (supports search, category, sort)
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts({
      search: params.search,
      category: params.category,
      sort: params.sort,
    }),
  ]);

  const selectedYear = Number(params.year);
  const activeYear = Number.isNaN(selectedYear) ? null : selectedYear;
  const activeSeries = params.series?.trim() || null;
  const activeChassis = params.chassis?.trim().toUpperCase() || null;

  // Client-side filtering for price range and stock status
  let products = allProducts;

  if (activeYear || activeSeries || activeChassis) {
    products = products.filter((product) => {
      const chassisCodes = extractChassisCodes(`${product.name} ${product.description ?? ""}`);
      if (chassisCodes.length === 0) return false;

      if (activeChassis && !chassisCodes.includes(activeChassis)) {
        return false;
      }

      if (activeSeries) {
        const hasSeriesMatch = chassisCodes.some((code) => BMW_CHASSIS_FITMENT[code]?.series === activeSeries);
        if (!hasSeriesMatch) return false;
      }

      if (activeYear) {
        const hasYearMatch = chassisCodes.some((code) => {
          const meta = BMW_CHASSIS_FITMENT[code];
          if (!meta) return false;
          return activeYear >= meta.startYear && activeYear <= meta.endYear;
        });
        if (!hasYearMatch) return false;
      }

      return true;
    });
  }

  if (params.minPrice) {
    const min = Number(params.minPrice);
    if (!Number.isNaN(min)) {
      products = products.filter((p) => Number(p.price) >= min);
    }
  }

  if (params.maxPrice) {
    const max = Number(params.maxPrice);
    if (!Number.isNaN(max)) {
      products = products.filter((p) => Number(p.price) <= max);
    }
  }

  if (params.stockStatus) {
    const statuses = params.stockStatus.split(",").filter(Boolean);
    if (statuses.length > 0) {
      products = products.filter((p) => {
        const stock = p.stock;
        const threshold = p.lowStockThreshold;
        if (stock <= 0) return statuses.includes("out");
        if (stock <= threshold) return statuses.includes("low");
        return statuses.includes("available");
      });
    }
  }

  // Prepare lightweight product data for filter components (no images, no descriptions)
  const productsForFilter = allProducts.map((p) => ({
    price: Number(p.price),
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    status: p.status,
  }));

  const categoriesSimple = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const fitmentOptions = buildFitmentOptions(
    allProducts.map((product) => ({ name: product.name, description: product.description ?? null })),
  );

  return (
    <section className="container-wrap py-10">
      <Suspense>
        <ProductsToolbar
          categories={categoriesSimple}
          totalCount={products.length}
          fitmentOptions={fitmentOptions}
        />
      </Suspense>

      <div className="flex gap-10">
        {/* Desktop sidebar */}
        <Suspense>
          <ProductsFilterSidebar
            categories={categoriesSimple}
            products={productsForFilter}
          />
        </Suspense>

        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <h2 className="text-2xl font-bold text-text-heading">{messages.productsPage.noProductsTitle}</h2>
              <p className="mt-2 text-sm text-text-body">
                {messages.productsPage.noProductsDescription}
              </p>
              <Link
                href="/products"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
              >
                {messages.productsPage.resetFilters}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-text-body">
                  {messages.productsPage.showingProducts}{" "}
                  <span className="font-semibold text-text-heading">{products.length}</span>{" "}
                  {messages.productsPage.productsSuffix}
                </p>
              </div>
              <div className="rounded-sm border border-border bg-card p-3 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        description: product.description ?? null,
                        price: Number(product.price),
                        stock: product.stock,
                        unit: product.unit,
                        imageUrl: product.imageUrl ?? null,
                        status: product.status as "AVAILABLE" | "OUT_OF_STOCK",
                        lowStockThreshold: product.lowStockThreshold,
                        category: product.category,
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      <Suspense>
        <ProductsMobileFilter
          categories={categoriesSimple}
          products={productsForFilter}
        />
      </Suspense>
    </section>
  );
}
