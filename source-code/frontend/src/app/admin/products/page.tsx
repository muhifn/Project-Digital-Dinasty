import { formatCurrency } from "@/lib/format";
import { AdminFlash } from "@/components/admin/admin-flash";
import { ProductFormFields } from "@/components/admin/product-form-fields";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { LiveStockCell } from "@/components/admin/live-stock-cell";
import {
  createProductAction,
  deleteProductAction,
} from "@/app/admin/products/actions";
import { getAdminCategories, getAdminProducts } from "@/lib/admin-products";
import { connection } from "next/server";
import { Plus, Search } from "lucide-react";

const statusLabel: Record<string, string> = {
  AVAILABLE: "Available",
  OUT_OF_STOCK: "Out of stock",
};

const statusBadgeStyle: Record<string, string> = {
  AVAILABLE: "bg-[#ecfdf3] text-[#0d6b43]",
  OUT_OF_STOCK: "bg-[#fff1f1] text-[#991b1b]",
};

type AdminProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    flashType?: "success" | "error";
    flashMessage?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await connection();
  const params = await searchParams;

  const [products, categories] = await Promise.all([
    getAdminProducts({
      search: params.search,
      category: params.category,
      status: params.status,
    }),
    getAdminCategories(),
  ]);

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl text-text-heading">Products</h1>
        <p className="mt-1 text-sm text-text-body">
          Manage your product catalog, stock levels, and pricing.
        </p>
      </div>

      <AdminFlash type={params.flashType} message={params.flashMessage} />

      {/* Create product card */}
      <details className="admin-card group">
        <summary className="flex cursor-pointer items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-primary">
            <Plus className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-heading">
              Create new product
            </p>
            <p className="text-xs text-text-muted">
              Click to expand the product creation form
            </p>
          </div>
        </summary>

        <div className="border-t border-border-subtle px-5 pb-5 pt-5">
          <form action={createProductAction} className="grid gap-4">
            <ProductFormFields
              categories={categories.map((category) => ({
                id: category.id,
                name: category.name,
              }))}
              initialValues={{
                name: "",
                description: "",
                price: "",
                stock: "",
                unit: "pcs",
                categoryId: "",
                lowStockThreshold: "5",
                imageUrl: "",
                status: "OUT_OF_STOCK",
              }}
            />

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-primary px-6 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
            >
              Create product
            </button>
          </form>
        </div>
      </details>

      {/* Product list card */}
      <div className="admin-card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-heading">
              Product list
            </h2>
            <p className="mt-0.5 text-sm text-text-muted">
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Filters */}
        <form
          action="/admin/products"
          method="GET"
          className="mb-5 flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              name="search"
              defaultValue={params.search ?? ""}
              placeholder="Search products..."
              className="h-10 w-full rounded-xl bg-[#F3F4F6] pl-9 pr-4 text-sm text-text-heading outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <select
            name="category"
            defaultValue={params.category ?? "all"}
            className="h-10 min-w-[140px] rounded-xl bg-[#F3F4F6] px-3 text-sm text-text-heading outline-none transition-shadow focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={params.status ?? "all"}
            className="h-10 min-w-[130px] rounded-xl bg-[#F3F4F6] px-3 text-sm text-text-heading outline-none transition-shadow focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
          </select>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-text-heading px-5 text-sm font-medium text-white transition-colors hover:bg-[#333]"
          >
            Apply
          </button>
        </form>

        {/* Table */}
        {products.length === 0 ? (
          <div className="rounded-xl bg-[#F3F4F6] p-4 text-center text-sm text-text-body">
            No products matched current filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border-subtle">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-3 admin-table-header">Name</th>
                  <th className="px-4 py-3 admin-table-header">Category</th>
                  <th className="px-4 py-3 admin-table-header">Price</th>
                  <th className="px-4 py-3 admin-table-header">Stock</th>
                  <th className="px-4 py-3 admin-table-header">Status</th>
                  <th className="px-4 py-3 admin-table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-[#F9FAFB]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-heading">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        /{product.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-body">
                      {product.category.name}
                    </td>
                    <td className="px-4 py-3 font-medium text-text-heading">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 text-text-body">
                      <LiveStockCell
                        productId={product.id}
                        initialStock={product.stock}
                        unit={product.unit}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          statusBadgeStyle[product.status]
                        }`}
                      >
                        {statusLabel[product.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ProductRowActions
                        productId={product.id}
                        deleteAction={deleteProductAction.bind(null, product.id)}
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
