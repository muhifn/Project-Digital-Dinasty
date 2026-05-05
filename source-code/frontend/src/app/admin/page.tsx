import Link from "next/link";
import { Package, AlertTriangle, Tag, ArrowRight } from "lucide-react";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { connection } from "next/server";

export default async function AdminOverviewPage() {
  await connection();
  const dashboard = await getAdminDashboardData();

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl text-text-heading">Dashboard</h1>
        <p className="mt-1 text-sm text-text-body">
          Ringkasan katalog spare part BMW dan level stok saat ini.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="admin-card flex items-start gap-4 p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-accent">
            <Package className="size-5 text-brand-primary" />
          </div>
          <div>
            <p className="admin-table-header">Total Products</p>
            <p className="mt-1 text-3xl font-bold text-text-heading">
              {dashboard.stats.totalProducts}
            </p>
          </div>
        </article>

        <article className="admin-card flex items-start gap-4 p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff1f1]">
            <AlertTriangle className="size-5 text-[#991b1b]" />
          </div>
          <div>
            <p className="admin-table-header">Low Stock</p>
            <p className="mt-1 text-3xl font-bold text-brand-primary">
              {dashboard.stats.lowStockProducts}
            </p>
          </div>
        </article>

        <article className="admin-card flex items-start gap-4 p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf3]">
            <Tag className="size-5 text-[#0d6b43]" />
          </div>
          <div>
            <p className="admin-table-header">Categories</p>
            <p className="mt-1 text-3xl font-bold text-text-heading">6</p>
          </div>
        </article>
      </div>

      {/* Low stock alerts table */}
      <div className="admin-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-heading">
            Low stock alerts
          </h2>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
          >
            Manage stock
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {dashboard.lowStockList.length === 0 ? (
          <div className="rounded-xl bg-[#ecfdf3] p-4 text-sm text-[#166534]">
            All products are sufficiently stocked.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border-subtle">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-3 admin-table-header">Product</th>
                  <th className="px-4 py-3 admin-table-header">Category</th>
                  <th className="px-4 py-3 admin-table-header">Stock</th>
                  <th className="px-4 py-3 admin-table-header">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {dashboard.lowStockList.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-[#F9FAFB]"
                  >
                    <td className="px-4 py-3 font-medium text-text-heading">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-text-body">
                      {product.categoryName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-[#fff1f1] px-2.5 py-0.5 text-xs font-semibold text-[#991b1b]">
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {product.lowStockThreshold}
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
