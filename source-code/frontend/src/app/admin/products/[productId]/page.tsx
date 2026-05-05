import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateProductAction } from "@/app/admin/products/actions";
import { AdminFlash } from "@/components/admin/admin-flash";
import { ProductFormFields } from "@/components/admin/product-form-fields";
import { getAdminCategories, getAdminProductById } from "@/lib/admin-products";
import { connection } from "next/server";

type AdminEditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
  searchParams: Promise<{
    flashType?: "success" | "error";
    flashMessage?: string;
  }>;
};

export default async function AdminEditProductPage({
  params,
  searchParams,
}: AdminEditProductPageProps) {
  await connection();
  const { productId } = await params;
  const query = await searchParams;

  const [product, categories] = await Promise.all([
    getAdminProductById(productId),
    getAdminCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/products"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-heading"
          >
            <ArrowLeft className="size-3.5" />
            Back to products
          </Link>
          <h1 className="font-heading text-2xl text-text-heading">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">/{product.slug}</p>
        </div>
      </div>

      <AdminFlash type={query.flashType} message={query.flashMessage} />

      {/* Edit form card */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-text-heading">
          Edit product details
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Update product information and save changes.
        </p>

        <form
          action={updateProductAction.bind(null, product.id)}
          className="mt-5 grid gap-4"
        >
          <ProductFormFields
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
            }))}
            showCurrentImageHint
            initialValues={{
              name: product.name,
              description: product.description ?? "",
              price: String(product.price),
              stock: String(product.stock),
              unit: product.unit,
              categoryId: product.categoryId,
              lowStockThreshold: String(product.lowStockThreshold),
              imageUrl: product.imageUrl ?? "",
              status: product.status,
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

      {/* Current status card */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-text-heading">
          Current status
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#F3F4F6] p-4">
            <p className="admin-table-header">Stock</p>
            <p className="mt-1.5 text-xl font-bold text-text-heading">
              {product.stock} {product.unit}
            </p>
          </div>

          <div className="rounded-xl bg-[#F3F4F6] p-4">
            <p className="admin-table-header">Threshold</p>
            <p className="mt-1.5 text-xl font-bold text-text-heading">
              {product.lowStockThreshold}
            </p>
          </div>

          <div className="rounded-xl bg-[#F3F4F6] p-4">
            <p className="admin-table-header">Status</p>
            <p className="mt-1.5 text-xl font-bold text-text-heading">
              {product.status === "AVAILABLE" ? "Available" : "Out of stock"}
            </p>
          </div>

          <div className="rounded-xl bg-[#F3F4F6] p-4">
            <p className="admin-table-header">Updated</p>
            <p className="mt-1.5 text-sm font-semibold text-text-heading">
              {new Date(product.updatedAt).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
