import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, Truck } from "lucide-react";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { GridCardIcon, type GridCardIconName } from "@/components/shared/grid-card-icon";
import { ProductCard } from "@/components/shared/product-card";
import { LiveStockBadge } from "@/components/shared/live-stock-badge";
import { LiveStockText } from "@/components/shared/live-stock-text";
import { formatCurrency } from "@/lib/format";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/messages";
import { connection } from "next/server";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  await connection();
  const locale = await getRequestLocale();
  const messages = getDictionary(locale);
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: messages.productDetail.metadataNotFound,
    };
  }

  return {
    title: `${product.name} | Planet Motor BMW`,
    description:
      product.description ??
      messages.productDetail.metadataDescriptionFallback.replace("{name}", product.name),
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  await connection();
  const locale = await getRequestLocale();
  const messages = getDictionary(locale);
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category.slug, product.id, 4);

  return (
    <section className="container-wrap py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="overflow-hidden rounded-sm border border-border bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-8">
          {product.imageUrl ? (
            <div className="relative h-full min-h-64 overflow-hidden rounded-sm border border-border bg-muted sm:min-h-96">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-sm border border-border bg-muted sm:min-h-96">
              <div className="text-center">
                <div className="mx-auto h-28 w-28 rounded-full bg-brand-primary/10" />
                <p className="mt-4 text-sm font-medium text-text-body">{messages.productDetail.imagePlaceholder}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.18em] text-text-muted uppercase">{product.category.name}</p>
            <h1 className="headline-lg text-text-heading">{product.name}</h1>
            <p className="text-base text-text-body">
              {product.description ?? messages.productDetail.descriptionFallback}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LiveStockBadge productId={product.id} initialStock={product.stock} threshold={product.lowStockThreshold} />
            <span className="rounded-sm border border-border bg-muted px-3 py-1 text-sm font-medium text-text-body">
              {messages.productDetail.lastUpdate}: {new Date(product.stockUpdatedAt).toLocaleString(locale === "en" ? "en-US" : "id-ID")}
            </span>
          </div>

          <div className="space-y-4 rounded-sm border border-border bg-card p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-text-muted">{messages.productDetail.price}</p>
                <p className="text-4xl font-black text-text-heading">{formatCurrency(Number(product.price))}</p>
              </div>
              <p className="text-sm font-medium text-text-body"><LiveStockText productId={product.id} initialStock={product.stock} unit={product.unit} /></p>
            </div>

            <div className="grid gap-2 text-sm text-text-body">
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                {messages.productDetail.bullets[0]}
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock3 className="size-4 text-brand-primary" />
                {messages.productDetail.bullets[1]}
              </p>
              <p className="inline-flex items-center gap-2">
                <Truck className="size-4 text-text-heading" />
                {messages.productDetail.bullets[2]}
              </p>
            </div>

            <div className="grid gap-3 pt-1 sm:grid-cols-2 xl:grid-cols-3">
              <Link
                href="https://tk.tokopedia.com/ZSHhyGtpk/"
                target="_blank"
                rel="noopener noreferrer"
                className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md bg-primary px-5 text-[11px] font-bold tracking-[0.18em] text-white uppercase transition-colors hover:bg-brand-primary-hover"
              >
                <ChannelIcon channel="tokopedia" size={18} />
                {messages.productDetail.buyTokopedia}
              </Link>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md bg-[#0DBA62] px-5 text-[11px] font-bold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#0AAE5A]"
              >
                <ChannelIcon channel="whatsapp" size={18} />
                {messages.productDetail.askWhatsapp}
              </a>
              <Link
                href="/products"
                className="motion-button inline-flex h-[52px] w-full items-center justify-center rounded-md border border-primary/35 bg-white px-5 text-[11px] font-bold tracking-[0.18em] text-text-heading uppercase shadow-[2px_2px_0_rgba(68,94,255,0.22)] transition-colors hover:border-primary hover:text-primary dark:border-primary/55 dark:bg-[#111827] dark:shadow-[2px_2px_0_rgba(82,125,255,0.24)] sm:col-span-2 xl:col-span-1"
              >
                {messages.productDetail.backToProducts}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 rounded-sm border border-border bg-card p-6">
        <h2 className="headline-lg text-text-heading">{messages.productDetail.whyChoose}</h2>
        <div className="mt-5 grid auto-rows-fr gap-4 md:grid-cols-3">
          {messages.productDetail.reasons.map((item, index) => {
            const iconName = (["trust", "support", "delivery"] as GridCardIconName[])[index] ?? "trust";

            return (
              <div
                key={`${item}-${index}`}
                className="flex min-h-[150px] flex-col border border-primary/45 bg-white p-5 text-sm leading-6 text-text-body shadow-[3px_3px_0_rgba(68,94,255,0.48)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)]"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                  <GridCardIcon name={iconName} className="h-5 w-5" />
                </div>
                {item}
              </div>
            );
          })}
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <div className="mt-14">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.18em] text-text-muted">{messages.productDetail.relatedBadge}</p>
            <h2 className="headline-lg mt-2 text-text-heading">{messages.productDetail.relatedTitle}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                product={{
                  id: related.id,
                  name: related.name,
                  slug: related.slug,
                  description: related.description ?? null,
                  price: Number(related.price),
                  stock: related.stock,
                  unit: related.unit,
                  imageUrl: related.imageUrl ?? null,
                  status: related.status as "AVAILABLE" | "OUT_OF_STOCK",
                  lowStockThreshold: related.lowStockThreshold,
                  category: related.category,
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
