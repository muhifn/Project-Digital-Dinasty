import { AdminFlash } from "@/components/admin/admin-flash";
import { CategoryRowActions } from "@/components/admin/category-row-actions";
import { CategoryFormFields } from "@/components/admin/category-form-fields";
import { createCategoryAction, deleteCategoryAction } from "@/app/admin/categories/actions";
import { getAdminCategoriesList } from "@/lib/admin-categories";
import { connection } from "next/server";
import { Plus, Search } from "lucide-react";

type AdminCategoriesPageProps = {
  searchParams: Promise<{
    search?: string;
    flashType?: "success" | "error";
    flashMessage?: string;
  }>;
};

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  await connection();
  const params = await searchParams;
  const categories = await getAdminCategoriesList(params.search);

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl text-text-heading">Categories</h1>
        <p className="mt-1 text-sm text-text-body">
          Organize your product catalog with categories.
        </p>
      </div>

      <AdminFlash type={params.flashType} message={params.flashMessage} />

      {/* Create category card */}
      <details className="admin-card group">
        <summary className="flex cursor-pointer items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-primary">
            <Plus className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-heading">
              Create new category
            </p>
            <p className="text-xs text-text-muted">
              Click to expand the category creation form
            </p>
          </div>
        </summary>

        <div className="border-t border-border-subtle px-5 pb-5 pt-5">
          <form action={createCategoryAction} className="grid gap-4">
            <CategoryFormFields
              initialValues={{
                name: "",
                description: "",
                imageUrl: "",
              }}
            />

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-primary px-6 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
            >
              Create category
            </button>
          </form>
        </div>
      </details>

      {/* Category list card */}
      <div className="admin-card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-heading">
              Category list
            </h2>
            <p className="mt-0.5 text-sm text-text-muted">
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"} found
            </p>
          </div>
        </div>

        {/* Search filter */}
        <form
          action="/admin/categories"
          method="GET"
          className="mb-5 flex items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              name="search"
              defaultValue={params.search ?? ""}
              placeholder="Search categories..."
              className="h-10 w-full rounded-xl bg-[#F3F4F6] pl-9 pr-4 text-sm text-text-heading outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-text-heading px-5 text-sm font-medium text-white transition-colors hover:bg-[#333]"
          >
            Apply
          </button>
        </form>

        {/* Table */}
        {categories.length === 0 ? (
          <div className="rounded-xl bg-[#F3F4F6] p-4 text-center text-sm text-text-body">
            No categories matched current filter.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-3 admin-table-header">Name</th>
                  <th className="px-4 py-3 admin-table-header">Slug</th>
                  <th className="px-4 py-3 admin-table-header">Products</th>
                  <th className="px-4 py-3 admin-table-header">Created</th>
                  <th className="px-4 py-3 admin-table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-[#F9FAFB]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-heading">
                        {category.name}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {category.description ?? "No description"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-body">{category.slug}</td>
                    <td className="px-4 py-3 text-text-body">
                      {category._count.products}
                    </td>
                    <td className="px-4 py-3 text-text-body">
                      {new Date(category.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryRowActions
                        categoryId={category.id}
                        productCount={category._count.products}
                        deleteAction={deleteCategoryAction.bind(null, category.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
