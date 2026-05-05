import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateCategoryAction } from "@/app/admin/categories/actions";
import { AdminFlash } from "@/components/admin/admin-flash";
import { CategoryFormFields } from "@/components/admin/category-form-fields";
import { getAdminCategoryById } from "@/lib/admin-categories";
import { connection } from "next/server";

type AdminEditCategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
  searchParams: Promise<{
    flashType?: "success" | "error";
    flashMessage?: string;
  }>;
};

export default async function AdminEditCategoryPage({
  params,
  searchParams,
}: AdminEditCategoryPageProps) {
  await connection();
  const { categoryId } = await params;
  const query = await searchParams;
  const category = await getAdminCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div>
        <Link
          href="/admin/categories"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-heading"
        >
          <ArrowLeft className="size-3.5" />
          Back to categories
        </Link>
        <h1 className="font-heading text-2xl text-text-heading">
          {category.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{category.slug}</p>
      </div>

      <AdminFlash type={query.flashType} message={query.flashMessage} />

      {/* Edit form card */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-text-heading">
          Edit category details
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Update category information and save changes.
        </p>

        <form
          action={updateCategoryAction.bind(null, category.id)}
          className="mt-5 grid gap-4"
        >
          <CategoryFormFields
            initialValues={{
              name: category.name,
              description: category.description ?? "",
              imageUrl: category.imageUrl ?? "",
            }}
          />

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-primary px-6 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
          >
            Save changes
          </button>
        </form>
      </div>

      {/* Category summary card */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-text-heading">
          Category summary
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#F3F4F6] p-4">
            <p className="admin-table-header">Products</p>
            <p className="mt-1.5 text-xl font-bold text-text-heading">
              {category._count.products}
            </p>
          </div>

          <div className="rounded-xl bg-[#F3F4F6] p-4">
            <p className="admin-table-header">Created</p>
            <p className="mt-1.5 text-sm font-semibold text-text-heading">
              {new Date(category.createdAt).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="rounded-xl bg-[#F3F4F6] p-4">
            <p className="admin-table-header">Description</p>
            <p className="mt-1.5 text-sm font-semibold text-text-heading">
              {category.description ? "Filled" : "Empty"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
