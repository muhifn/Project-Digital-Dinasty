"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  AdminProductInputError,
  AdminProductNotFoundError,
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct,
} from "@/lib/admin-products";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function buildFlashUrl(
  basePath: string,
  flashType: "success" | "error",
  flashMessage: string
): string {
  const params = new URLSearchParams({
    flashType,
    flashMessage,
  });

  return `${basePath}?${params.toString()}`;
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof AdminProductInputError || error instanceof AdminProductNotFoundError) {
    return error.message;
  }

  return "Unexpected error while processing product changes";
}

function normalizeProductId(productId: string): string {
  const candidate = productId.trim();

  if (!UUID_PATTERN.test(candidate)) {
    throw new AdminProductInputError("Invalid product id");
  }

  return candidate;
}

export async function createProductAction(formData: FormData) {
  await requireAdminSession({ callbackUrl: "/admin/products" });

  let redirectUrl = buildFlashUrl("/admin/products", "success", "Product created successfully");

  try {
    await createAdminProduct(formData);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
  } catch (error) {
    redirectUrl = buildFlashUrl("/admin/products", "error", resolveErrorMessage(error));
  }

  redirect(redirectUrl);
}

export async function updateProductAction(productId: string, formData: FormData) {
  await requireAdminSession({ callbackUrl: `/admin/products/${productId}` });

  let redirectBasePath = "/admin/products";
  let redirectUrl = buildFlashUrl(redirectBasePath, "success", "Product updated successfully");

  try {
    const safeProductId = normalizeProductId(productId);
    redirectBasePath = `/admin/products/${safeProductId}`;
    redirectUrl = buildFlashUrl(redirectBasePath, "success", "Product updated successfully");

    await updateAdminProduct(safeProductId, formData);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${safeProductId}`);
  } catch (error) {
    redirectUrl = buildFlashUrl(redirectBasePath, "error", resolveErrorMessage(error));
  }

  redirect(redirectUrl);
}

export async function deleteProductAction(productId: string) {
  await requireAdminSession({ callbackUrl: "/admin/products" });

  let redirectUrl = buildFlashUrl("/admin/products", "success", "Product deleted successfully");

  try {
    const safeProductId = normalizeProductId(productId);
    await deleteAdminProduct(safeProductId);
    redirectUrl = buildFlashUrl("/admin/products", "success", "Product deleted permanently");

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/products");
  } catch (error) {
    redirectUrl = buildFlashUrl("/admin/products", "error", resolveErrorMessage(error));
  }

  redirect(redirectUrl);
}
