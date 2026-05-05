"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  AdminCategoryInputError,
  AdminCategoryNotFoundError,
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory,
} from "@/lib/admin-categories";

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
  if (error instanceof AdminCategoryInputError || error instanceof AdminCategoryNotFoundError) {
    return error.message;
  }

  return "Unexpected error while processing category changes";
}

export async function createCategoryAction(formData: FormData) {
  await requireAdminSession({ callbackUrl: "/admin/categories" });

  let redirectUrl = buildFlashUrl("/admin/categories", "success", "Category created successfully");

  try {
    await createAdminCategory(formData);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/categories");
  } catch (error) {
    redirectUrl = buildFlashUrl("/admin/categories", "error", resolveErrorMessage(error));
  }

  redirect(redirectUrl);
}

export async function updateCategoryAction(categoryId: string, formData: FormData) {
  await requireAdminSession({ callbackUrl: `/admin/categories/${categoryId}` });

  let redirectUrl = buildFlashUrl(
    `/admin/categories/${categoryId}`,
    "success",
    "Category updated successfully"
  );

  try {
    await updateAdminCategory(categoryId, formData);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${categoryId}`);
  } catch (error) {
    redirectUrl = buildFlashUrl(`/admin/categories/${categoryId}`, "error", resolveErrorMessage(error));
  }

  redirect(redirectUrl);
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdminSession({ callbackUrl: "/admin/categories" });

  let redirectUrl = buildFlashUrl("/admin/categories", "success", "Category deleted successfully");

  try {
    await deleteAdminCategory(categoryId);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath("/admin/categories");
  } catch (error) {
    redirectUrl = buildFlashUrl("/admin/categories", "error", resolveErrorMessage(error));
  }

  redirect(redirectUrl);
}
