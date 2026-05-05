import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { sanitizePlainText } from "@/lib/input-sanitization";

// ── Types ───────────────────────────────────────────────────────────

export type AdminProductListQuery = {
  search?: string;
  category?: string;
  status?: string;
};

export class AdminProductInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminProductInputError";
  }
}

export class AdminProductNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminProductNotFoundError";
  }
}

// ── Form validation ─────────────────────────────────────────────────

const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(120),
  description: z.string().trim().max(1200).optional(),
  price: z.coerce.number().positive("Price must be greater than 0").max(999999999),
  stock: z.coerce.number().int("Stock must be an integer").min(0, "Stock cannot be negative").max(999999),
  unit: z.string().trim().min(1, "Unit is required").max(30),
  categoryId: z.string().uuid("Invalid category id"),
  lowStockThreshold: z.coerce
    .number()
    .int("Low-stock threshold must be an integer")
    .min(0, "Low-stock threshold cannot be negative")
    .max(999999),
  imageUrl: z.string().trim().max(500).optional(),
});

type NormalizedProductInput = {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  unit: string;
  categoryId: string;
  lowStockThreshold: number;
  imageUrl: string | null;
};

function parseImageUrl(value: string | undefined): string | null {
  if (!value || value.length === 0) return null;
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  throw new AdminProductInputError("Image URL must start with /, http://, or https://");
}

function normalizeFormData(formData: FormData): NormalizedProductInput {
  const parsed = productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    unit: formData.get("unit"),
    categoryId: formData.get("categoryId"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success) {
    throw new AdminProductInputError(parsed.error.issues[0]?.message ?? "Invalid product form input");
  }

  const sanitizedName = sanitizePlainText(parsed.data.name);
  const sanitizedDescription = parsed.data.description
    ? sanitizePlainText(parsed.data.description)
    : "";
  const sanitizedUnit = sanitizePlainText(parsed.data.unit);

  if (sanitizedName.length < 2) throw new AdminProductInputError("Product name is required");
  if (sanitizedName.length > 120) throw new AdminProductInputError("Product name is too long");
  if (sanitizedDescription.length > 1200) throw new AdminProductInputError("Description is too long");
  if (sanitizedUnit.length < 1) throw new AdminProductInputError("Unit is required");
  if (sanitizedUnit.length > 30) throw new AdminProductInputError("Unit is too long");

  return {
    name: sanitizedName,
    description: sanitizedDescription.length > 0 ? sanitizedDescription : null,
    price: parsed.data.price,
    stock: parsed.data.stock,
    unit: sanitizedUnit,
    categoryId: parsed.data.categoryId,
    lowStockThreshold: parsed.data.lowStockThreshold,
    imageUrl: parseImageUrl(parsed.data.imageUrl),
  };
}

// ── Go API response shapes ──────────────────────────────────────────

type GoProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
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
  categoryName?: string | null;
  categorySlug?: string | null;
};

type GoCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

// ── Transformers ────────────────────────────────────────────────────

function toProductWithCategory(p: GoProduct) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? null,
    price: Number(p.price),
    stock: p.stock,
    unit: p.unit,
    imageUrl: p.imageUrl ?? null,
    isActive: p.isActive,
    status: p.status,
    lowStockThreshold: p.lowStockThreshold,
    categoryId: p.categoryId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    stockUpdatedAt: p.stockUpdatedAt,
    category: {
      id: p.categoryId,
      name: p.categoryName ?? "",
      slug: p.categorySlug ?? "",
    },
  };
}

// ── Data fetching ───────────────────────────────────────────────────

/**
 * Fetch categories for admin product form dropdowns.
 * Returns shape expected by admin pages: `{ id, name, slug, _count: { products } }`.
 */
export async function getAdminCategories() {
  const res = await api.get<GoCategory[]>("/api/categories?withCount=true");
  const categories = res.data ?? [];

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    _count: {
      products: c.productCount,
    },
  }));
}

/**
 * Fetch admin product list from Go API.
 * Transforms flat category fields → nested `category` object.
 * Converts price from string to number.
 */
export async function getAdminProducts(query: AdminProductListQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category && query.category !== "all") params.set("category", query.category);
  if (query.status && query.status !== "all") params.set("status", query.status);

  const qs = params.toString();
  const path = `/api/admin/products${qs ? `?${qs}` : ""}`;

  const res = await api.get<GoProduct[]>(path);
  const products = res.data ?? [];

  return products.map(toProductWithCategory);
}

/**
 * Fetch a single admin product by ID from Go API.
 * Go returns `{ product, stockLogs }` — we extract the product and transform it.
 */
export async function getAdminProductById(productId: string) {
  try {
    const res = await api.get<{ product: GoProduct; stockLogs: unknown[] }>(
      `/api/admin/products/${productId}`
    );

    const product = res.data?.product;
    if (!product) return null;

    return toProductWithCategory(product);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

// ── Mutations ───────────────────────────────────────────────────────

/**
 * Create a new product via Go API.
 * Parses FormData, validates, and sends JSON to Go.
 * Go handles slug generation, stock log creation, and SSE broadcast.
 */
export async function createAdminProduct(formData: FormData) {
  const input = normalizeFormData(formData);

  try {
    const res = await api.post<GoProduct>("/api/admin/products", {
      name: input.name,
      description: input.description ?? "",
      price: input.price,
      stock: input.stock,
      unit: input.unit,
      imageUrl: input.imageUrl ?? "",
      lowStockThreshold: input.lowStockThreshold,
      categoryId: input.categoryId,
    });

    return { id: res.data?.id };
  } catch (error) {
    if (error instanceof ApiError) {
      throw new AdminProductInputError(error.message);
    }
    throw error;
  }
}

/**
 * Update an existing product via Go API.
 * Parses FormData, validates, and sends JSON to Go.
 * Go handles slug update, stock log, and SSE broadcast.
 */
export async function updateAdminProduct(productId: string, formData: FormData) {
  const input = normalizeFormData(formData);

  try {
    await api.put(`/api/admin/products/${productId}`, {
      name: input.name,
      description: input.description ?? "",
      price: input.price,
      stock: input.stock,
      unit: input.unit,
      imageUrl: input.imageUrl ?? "",
      lowStockThreshold: input.lowStockThreshold,
      categoryId: input.categoryId,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new AdminProductNotFoundError("Product not found");
      }
      throw new AdminProductInputError(error.message);
    }
    throw error;
  }
}

/**
 * Permanently delete a product via Go API.
 */
export async function deleteAdminProduct(productId: string) {
  try {
    await api.delete(`/api/admin/products/${productId}`);
    return { mode: "deleted" as const };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new AdminProductNotFoundError("Product not found");
      }
      throw new AdminProductInputError(error.message);
    }
    throw error;
  }
}
