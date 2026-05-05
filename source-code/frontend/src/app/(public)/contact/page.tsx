import { ChannelIcon } from "@/components/shared/channel-icon";
import { GridCardIcon } from "@/components/shared/grid-card-icon";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/messages";
import { getCategories } from "@/lib/products";

const TOKOPEDIA_STORE_URL = "https://tk.tokopedia.com/ZSHhyGtpk/";
const WHATSAPP_URL = "https://wa.me/6281234567890";

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const messages = getDictionary(locale);
  const categories = await getCategories();
  const totalProducts = categories.reduce((sum, category) => sum + category._count.products, 0);
  const showcaseNames = categories.map((category) => category.name).join(", ");
  const liveCatalogSummary =
    locale === "id"
      ? `${categories.length} etalase aktif dengan ${totalProducts}+ produk: ${showcaseNames}.`
      : `${categories.length} active showcases with ${totalProducts}+ products: ${showcaseNames}.`;
  const catalogStatLabel =
    locale === "id"
      ? `${totalProducts}+ produk di ${categories.length} etalase`
      : `${totalProducts}+ products across ${categories.length} showcases`;

  return (
    <section className="container-wrap py-12">
      <div className="rounded-md border border-primary/45 bg-white p-8 shadow-[3px_3px_0_rgba(68,94,255,0.48)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)]">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-primary">{messages.contactPage.badge}</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-text-heading sm:text-[2.7rem]">
          {messages.contactPage.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-text-body">{messages.contactPage.description}</p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-text-muted">{liveCatalogSummary}</p>

        <div className="mt-8 grid gap-4 text-sm text-text-body sm:grid-cols-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="motion-button flex items-start gap-3 rounded-md border border-primary/45 bg-white p-5 shadow-[3px_3px_0_rgba(68,94,255,0.42)] transition-colors hover:border-primary dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.3)]"
          >
            <ChannelIcon channel="whatsapp" size={22} className="mt-0.5" />
            <div>
              <p className="font-semibold text-[#25D366]">{messages.contactPage.whatsapp.title}</p>
              <p className="mt-1 text-text-body">{messages.contactPage.whatsapp.description}</p>
              <p className="mt-1 font-medium text-text-heading">0812-3456-7890</p>
            </div>
          </a>

          <a
            href={TOKOPEDIA_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="motion-button rounded-md border border-primary/45 bg-white p-5 shadow-[3px_3px_0_rgba(68,94,255,0.42)] transition-colors hover:border-primary dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.3)]"
          >
            <div className="flex items-start gap-3">
              <ChannelIcon channel="tokopedia" size={22} className="mt-0.5" />
              <div>
                <p className="font-semibold text-text-heading">{messages.contactPage.tokopedia.title}</p>
                <p className="mt-1 text-text-body">{messages.contactPage.tokopedia.description}</p>
                <p className="mt-1 font-medium text-text-heading">Planet Motor BMW</p>
              </div>
            </div>
          </a>

          <div className="rounded-md border border-primary/45 bg-white p-5 shadow-[3px_3px_0_rgba(68,94,255,0.42)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.3)]">
            <div className="flex items-start gap-3">
              <GridCardIcon name="category" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-text-heading">{messages.contactPage.catalog.title}</p>
                <p className="mt-1 text-text-body">{messages.contactPage.catalog.description}</p>
                <p className="mt-1 font-medium text-text-heading">{catalogStatLabel}</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-primary/45 bg-white p-5 shadow-[3px_3px_0_rgba(68,94,255,0.42)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.3)]">
            <div className="flex items-start gap-3">
              <GridCardIcon name="location" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-text-heading">{messages.contactPage.address.title}</p>
                <p className="mt-2">{messages.contactPage.address.value}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
