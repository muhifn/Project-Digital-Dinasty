import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { sanitizePlainText } from "@/lib/input-sanitization";

// ── Types ───────────────────────────────────────────────────────────

export class AdminCategoryInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminCategoryInputError";
  }
}

export class AdminCategoryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminCategoryNotFoundError";
  }
}

// ── Form validation ─────────────────────────────────────────────────

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Category name is required").max(80),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().max(500).optional(),
});

type NormalizedCategoryInput = {
  name: string;
  description: string | null;
  imageUrl: string | null;
};

function parseImageUrl(value: string | undefined): string | null {
  if (!value || value.length === 0) return null;
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  throw new AdminCategoryInputError("Image URL must start with /, http://, or https://");
}

function normalizeFormData(formData: FormData): NormalizedCategoryInput {
  const parsed = categoryFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success) {
    throw new AdminCategoryInputError(parsed.error.issues[0]?.message ?? "Invalid category form input");
  }

  const sanitizedName = sanitizePlainText(parsed.data.name);
  const sanitizedDescription = parsed.data.description
    ? sanitizePlainText(parsed.data.description)
    : "";

  if (sanitizedName.length < 2) throw new AdminCategoryInputError("Category name is required");
  if (sanitizedName.length > 80) throw new AdminCategoryInputError("Category name is too long");
  if (sanitizedDescription.length > 500) throw new AdminCategoryInputError("Category description is too long");

  return {
    name: sanitizedName,
    description: sanitizedDescription.length > 0 ? sanitizedDescription : null,
    imageUrl: parseImageUrl(parsed.data.imageUrl),
  };
}

// ── Go API response shape ───────────────────────────────────────────

type GoCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
  createdAt: string;
};

// ── Transformer ─────────────────────────────────────────────────────

function toCategoryWithCount(c: GoCategory) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    imageUrl: c.imageUrl ?? null,
    createdAt: c.createdAt,
    _count: {
      products: c.productCount ?? 0,
    },
  };
}

// ── Data fetching ───────────────────────────────────────────────────

/**
 * Fetch admin categories list from Go API.
 * Returns shape expected by admin/categories/page.tsx with `_count.products`.
 */
export async function getAdminCategoriesList(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);

  const qs = params.toString();
  const path = `/api/admin/categories${qs ? `?${qs}` : ""}`;

  const res = await api.get<GoCategory[]>(path);
  const categories = res.data ?? [];

  return categories.map(toCategoryWithCount);
}

/**
 * Fetch a single admin category by ID from Go API.
 * Returns shape expected by admin/categories/[categoryId]/page.tsx.
 */
export async function getAdminCategoryById(categoryId: string) {
  try {
    const res = await api.get<GoCategory>(`/api/admin/categories/${categoryId}`);
    const category = res.data;

    if (!category) return null;

    return toCategoryWithCount(category);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

// ── Mutations ───────────────────────────────────────────────────────

/**
 * Create a new category via Go API.
 * Parses FormData, validates, and sends JSON to Go.
 * Go handles slug generation.
 */
export async function createAdminCategory(formData: FormData) {
  const input = normalizeFormData(formData);

  try {
    await api.post("/api/admin/categories", {
      name: input.name,
      description: input.description ?? "",
      imageUrl: input.imageUrl ?? "",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw new AdminCategoryInputError(error.message);
    }
    throw error;
  }
}

/**
 * Update an existing category via Go API.
 * Parses FormData, validates, and sends JSON to Go.
 * Go handles slug regeneration if name changed.
 */
export async function updateAdminCategory(categoryId: string, formData: FormData) {
  const input = normalizeFormData(formData);

  try {
    await api.put(`/api/admin/categories/${categoryId}`, {
      name: input.name,
      description: input.description ?? "",
      imageUrl: input.imageUrl ?? "",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new AdminCategoryNotFoundError("Category not found");
      }
      throw new AdminCategoryInputError(error.message);
    }
    throw error;
  }
}

/**
 * Delete a category via Go API.
 * Go validates no products exist before deleting.
 */
export async function deleteAdminCategory(categoryId: string) {
  try {
    await api.delete(`/api/admin/categories/${categoryId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new AdminCategoryNotFoundError("Category not found");
      }
      // Go returns error message like "category has products, cannot delete"
      throw new AdminCategoryInputError(error.message);
    }
    throw error;
  }
}
