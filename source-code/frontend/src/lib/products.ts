import { api } from "@/lib/api";
import { FALLBACK_GO_PRODUCTS, getFallbackGoCategories } from "@/lib/fallback-catalog";

export type ProductListQuery = {
  search?: string;
  category?: string;
  sort?: "featured" | "newest" | "price_asc" | "price_desc";
};

// ── Types matching Go API response shapes ────────────────────────────

/** Product as returned by the Go API (flat category fields). */
type GoProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string; // decimal string like "45000.00"
  stock: number;
  unit: string;
  imageUrl?: string | null;
  isActive: boolean;
  status: string;
  lowStockThreshold: number;
  stockUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
};

/** Category as returned by the Go API. */
type GoCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  productCount?: number;
};

type GoStockLog = {
  id: string;
  type: string;
  quantityChange: number;
  createdAt: string;
};

// ── Shape transformers ───────────────────────────────────────────────

/**
 * Transform a Go API product into the shape the frontend pages expect.
 * Pages access `product.category.name`, `product.category.slug`, etc.
 */
function toFrontendProduct(p: GoProduct) {
  return {
    ...p,
    // Reconstruct nested category object from flat fields
    category: {
      id: p.categoryId,
      name: p.categoryName ?? "",
      slug: p.categorySlug ?? "",
    },
  };
}

/**
 * Transform a Go API category into the shape the frontend pages expect.
 * The home page accesses `category._count.products`.
 */
function toFrontendCategory(c: GoCategory) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    imageUrl: c.imageUrl ?? null,
    _count: {
      products: c.productCount ?? 0,
    },
  };
}

let didLogCatalogFallback = false;

function logCatalogFallback(context: string, error: unknown) {
  if (didLogCatalogFallback) return;
  didLogCatalogFallback = true;

  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[products] Using local fallback catalog for ${context}: ${message}`);
}

function getFallbackCategories() {
  return getFallbackGoCategories()
    .map(toFrontendCategory)
    .filter((category) => category._count.products > 0);
}

function getFallbackProducts(query: ProductListQuery = {}) {
  const term = query.search?.trim().toLowerCase();
  let products = [...FALLBACK_GO_PRODUCTS];

  if (query.category) {
    products = products.filter((product) => product.categorySlug === query.category);
  }

  if (term) {
    products = products.filter((product) => {
      const haystack = `${product.name} ${product.description ?? ""} ${product.categoryName ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }

  switch (query.sort) {
    case "price_asc":
      products.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price_desc":
      products.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "newest":
      products.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    case "featured":
    default:
      break;
  }

  return products.map(toFrontendProduct);
}

// ── Public API functions ─────────────────────────────────────────────

export async function getCategories() {
  try {
    const res = await api.get<GoCategory[]>("/api/categories?withCount=true", {
      withAuth: false,
      next: { revalidate: 60 },
    });
    return (res.data ?? [])
      .map(toFrontendCategory)
      .filter((category) => category._count.products > 0);
  } catch (error) {
    logCatalogFallback("getCategories", error);
    return getFallbackCategories();
  }
}

export async function getProducts(query: ProductListQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.sort) params.set("sort", query.sort);

  try {
    const res = await api.get<GoProduct[]>(`/api/products?${params.toString()}`, {
      withAuth: false,
      next: { revalidate: 30 },
    });
    return (res.data ?? []).map(toFrontendProduct);
  } catch (error) {
    logCatalogFallback("getProducts", error);
    return getFallbackProducts(query);
  }
}

export async function getFeaturedProducts(limit = 8) {
  try {
    const res = await api.get<GoProduct[]>(
      `/api/products?featured=true&limit=${limit}`,
      { withAuth: false, next: { revalidate: 30 } }
    );
    return (res.data ?? []).map(toFrontendProduct);
  } catch (error) {
    logCatalogFallback("getFeaturedProducts", error);
    return getFallbackProducts({ sort: "featured" }).slice(0, limit);
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const res = await api.get<{ product: GoProduct; stockLogs: GoStockLog[] }>(
      `/api/products/by-slug/${encodeURIComponent(slug)}`,
      { withAuth: false, next: { revalidate: 30 } }
    );

    if (!res.data?.product) return null;

    const product = toFrontendProduct(res.data.product);
    // Attach stockLogs to the product so the page can access them
    return {
      ...product,
      stockLogs: res.data.stockLogs ?? [],
    };
  } catch (error) {
    logCatalogFallback(`getProductBySlug(${slug})`, error);

    const product = FALLBACK_GO_PRODUCTS.find((item) => item.slug === slug);
    if (!product) return null;

    return {
      ...toFrontendProduct(product),
      stockLogs: [],
    };
  }
}

/**
 * Fetch related products in the same category, excluding the current one.
 * @param categorySlug - Category slug (Go API filters by slug, not ID)
 * @param currentProductId - Product ID to exclude from results
 * @param limit - Max number of results
 */
export async function getRelatedProducts(
  categorySlug: string,
  currentProductId: string,
  limit = 4
) {
  try {
    const params = new URLSearchParams();
    params.set("category", categorySlug);
    params.set("exclude", currentProductId);
    params.set("limit", String(limit));

    const res = await api.get<GoProduct[]>(`/api/products?${params.toString()}`, {
      withAuth: false,
      next: { revalidate: 30 },
    });
    return (res.data ?? []).map(toFrontendProduct);
  } catch (error) {
    logCatalogFallback(`getRelatedProducts(${categorySlug})`, error);

    return FALLBACK_GO_PRODUCTS.filter(
      (product) => product.categorySlug === categorySlug && product.id !== currentProductId,
    )
      .slice(0, limit)
      .map(toFrontendProduct);
  }
}
