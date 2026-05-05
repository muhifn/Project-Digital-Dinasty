import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { GridCardIcon, type GridCardIconName } from "@/components/shared/grid-card-icon";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/messages";
import { getCategories } from "@/lib/products";

const WHATSAPP_URL = "https://wa.me/6281234567890";
const TOKOPEDIA_STORE_URL = "https://tk.tokopedia.com/ZSHhyGtpk/";

const trustIconNames: GridCardIconName[] = ["official-flow", "support", "trust", "bmw-focus"];
const shopIconNames: GridCardIconName[] = ["sold", "category", "responsiveness", "parts", "trust", "official-flow"];

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const messages = getDictionary(locale);
  const categories = await getCategories();
  const totalProducts = categories.reduce((sum, category) => sum + category._count.products, 0);
  const showcaseNames = categories.map((category) => category.name).join(", ");
  const stats = [
    { value: `${totalProducts}+`, label: messages.about.stats[0]?.label ?? "Active parts" },
    { value: `${categories.length}`, label: messages.about.stats[1]?.label ?? "Active showcases" },
    { value: messages.about.stats[2]?.value ?? "4.9/5", label: messages.about.stats[2]?.label ?? "Store rating" },
  ];
  const storyParagraphs =
    locale === "id"
      ? [
          `Planet Motor BMW saat ini menampilkan etalase aktif seperti ${showcaseNames}, sehingga pengunjung bisa melihat struktur toko yang sama dengan yang tampil di katalog saat ini.`,
          "Website ini dibuat untuk membantu pembeli membaca kategori, mengecek konteks produk, lalu melanjutkan inquiry atau checkout ke kanal resmi toko tanpa bergantung pada copy placeholder.",
        ]
      : [
          `Planet Motor BMW currently runs active showcases such as ${showcaseNames}, so visitors can browse the same store structure reflected in the current catalog.`,
          "The website is designed to help buyers read category context, understand the product path, and then continue to inquiry or checkout through the official store channels without relying on placeholder copy.",
        ];
  const onlineShopCards = messages.about.onlineShop.cards.map((item, index) => {
    if (index !== 1) return item;

    return {
      ...item,
      description:
        locale === "id"
          ? `Website membantu pembeli membaca kategori seperti ${showcaseNames} sebelum masuk ke etalase resmi Tokopedia.`
          : `The website helps buyers read categories such as ${showcaseNames} before they continue to the official Tokopedia showcases.`,
    };
  });
  const valueServiceCards = [
    ...messages.about.values.cards.map((item, index) => ({
      ...item,
      icon: (["precision", "transparency", "responsiveness"] as const)[index],
    })),
    {
      title: locale === "id" ? "#OfficialFlow" : "#OfficialFlow",
      description:
        locale === "id"
          ? "Alur website, WhatsApp, dan Tokopedia dijaga tetap jelas agar pembeli paham langkah berikutnya."
          : "The website, WhatsApp, and Tokopedia paths stay clear so buyers understand the next step.",
      icon: "official-flow" as const,
    },
    {
      title: locale === "id" ? "#BMWFocus" : "#BMWFocus",
      description:
        locale === "id"
          ? "Konten dan kategori difokuskan untuk kebutuhan part BMW, bukan katalog otomotif umum."
          : "Content and categories stay focused on BMW part needs, not a generic automotive catalog.",
      icon: "bmw-focus" as const,
    },
  ].slice(0, 5);

  return (
    <div className="bg-background selection:bg-primary selection:text-white">
      <section className="relative overflow-hidden border-b border-outline-variant bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(95%_100%_at_0%_0%,rgba(6,83,183,0.16),transparent_72%)]" />

        <div className="container-wrap relative py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.88fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{messages.about.badge}</p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tighter text-text-heading sm:text-5xl lg:text-[3.85rem] lg:leading-[1.02]">
                {messages.about.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-text-body sm:text-lg">{messages.about.description}</p>

              <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md bg-primary px-5 text-[11px] font-bold tracking-[0.22em] text-white uppercase transition-colors hover:bg-brand-primary-hover"
                >
                  <ChannelIcon channel="whatsapp" size={18} />
                  {messages.about.primaryCta}
                  <ArrowUpRight size={15} />
                </a>

                <Link
                  href="/products"
                  className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md border border-outline-variant bg-card px-5 text-[11px] font-bold tracking-[0.22em] text-text-heading uppercase transition-colors hover:border-primary hover:text-primary"
                >
                  {messages.about.secondaryCta}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-primary/45 bg-white p-5 shadow-[3px_3px_0_rgba(68,94,255,0.42)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.3)] sm:p-6"
                >
                  <p className="text-3xl font-black tracking-tighter text-text-heading">{item.value}</p>
                  <p className="mt-2 text-[10px] font-bold tracking-[0.22em] text-text-muted uppercase">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="container-wrap">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{messages.about.story.badge}</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tighter text-text-heading sm:text-5xl">{messages.about.story.title}</h2>
            <div className="mx-auto mt-5 h-1 w-12 bg-primary" />

            <div className="mt-8 space-y-5 text-base leading-8 text-text-body sm:text-lg">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background pb-20 sm:pb-24">
        <div className="container-wrap">
          <div className="mb-12 text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{messages.about.values.badge}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tighter text-text-heading sm:text-4xl">{messages.about.values.title}</h2>
          </div>

          <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {valueServiceCards.map((item, index) => {
              const iconName = item.icon as GridCardIconName;
              const label =
                locale === "id"
                  ? ["KATEGORI PRESISI", "INFO JELAS", "RESPON ADMIN", "FLOW RESMI", "FOKUS BMW"][index]
                  : ["PRECISE CATEGORY", "CLEAR INFO", "ADMIN RESPONSE", "OFFICIAL FLOW", "BMW FOCUS"][index];

              return (
                <article
                  key={item.title}
                  className="group flex min-h-[205px] flex-col items-center justify-center border border-primary/45 bg-white px-5 py-8 text-center shadow-[3px_3px_0_rgba(68,94,255,0.58)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(68,94,255,0.68)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] dark:hover:shadow-[6px_6px_0_rgba(82,125,255,0.42)]"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center text-[#ff625a] transition-transform duration-300 group-hover:-translate-y-0.5">
                    <GridCardIcon name={iconName} className="h-8 w-8" />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold leading-tight tracking-tight text-text-heading underline decoration-text-heading underline-offset-2">
                    {item.title.replace(/^#/, "")}
                  </h3>
                  <p className="mt-3 text-[9px] font-bold tracking-[0.18em] text-primary uppercase">{label}</p>
                  <p className="mt-2 max-w-[11.5rem] text-xs leading-5 text-text-body">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-20 sm:py-24">
        <div className="container-wrap grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{messages.about.trust.badge}</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tighter text-text-heading sm:text-5xl sm:leading-[1.05]">
              {messages.about.trust.title}
            </h2>
            <p className="mt-6 text-base leading-8 text-text-body sm:text-lg">{messages.about.trust.description}</p>

            <Link
              href="/products"
              className="motion-button mt-8 inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] text-primary uppercase transition-colors hover:text-brand-primary-hover"
            >
              {messages.about.secondaryCta}
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {messages.about.trust.items.map((item, index) => {
              const iconName = trustIconNames[index] ?? "trust";

              return (
                <article
                  key={item.title}
                  className="border border-primary/45 bg-white p-6 shadow-[3px_3px_0_rgba(68,94,255,0.48)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(68,94,255,0.62)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] dark:hover:shadow-[6px_6px_0_rgba(82,125,255,0.42)]"
                >
                  <div className="inline-flex size-10 items-center justify-center rounded-full bg-slate-900 text-white">
                    <GridCardIcon name={iconName} className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-text-heading">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-body">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="container-wrap">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{messages.about.onlineShop.badge}</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tighter text-text-heading sm:text-5xl sm:leading-[1.05]">
              {messages.about.onlineShop.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-text-body sm:text-lg">{messages.about.onlineShop.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {onlineShopCards.map((item, index) => {
              const iconName = shopIconNames[index] ?? "official-flow";
              const isTokopediaCard = index === 0;
              const itemChannel = item.href.includes("wa.me")
                ? "whatsapp"
                : item.href.includes("tokopedia") || item.href.includes("tk.tokopedia")
                  ? "tokopedia"
                  : null;
              const cardClassName =
                "group flex h-full flex-col border border-primary/45 bg-white p-6 shadow-[3px_3px_0_rgba(68,94,255,0.48)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(68,94,255,0.62)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.32)] dark:hover:shadow-[6px_6px_0_rgba(82,125,255,0.42)]";
              const cardContent = (
                <>
                  <div className="flex items-start justify-between gap-4">
                    {isTokopediaCard ? (
                      <div className="overflow-hidden rounded-sm border border-outline-variant bg-white p-2 shadow-sm">
                        <Image
                          src="/images/tokopedia-logo.svg"
                          alt="Tokopedia"
                          width={160}
                          height={44}
                          className="h-10 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="inline-flex size-10 items-center justify-center rounded-full bg-slate-900 text-white transition-transform group-hover:-translate-y-0.5">
                        {itemChannel ? <ChannelIcon channel={itemChannel} size={24} /> : <GridCardIcon name={iconName} className="h-6 w-6" />}
                      </div>
                    )}
                    <ArrowUpRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  <div className="mt-8">
                    <p className="text-[10px] font-bold tracking-[0.24em] text-text-muted uppercase">{item.eyebrow}</p>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-text-heading">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-text-body">{item.description}</p>
                  </div>
                </>
              );

              return item.external ? (
                <a
                  key={`${item.eyebrow}-${item.title}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClassName}
                >
                  {cardContent}
                </a>
              ) : (
                <Link key={`${item.eyebrow}-${item.title}`} href={item.href} className={cardClassName}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-20 sm:py-24">
        <div className="container-wrap grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="rounded-md border border-primary/45 bg-white p-6 shadow-[3px_3px_0_rgba(68,94,255,0.42)] dark:border-primary/55 dark:bg-[#111827] dark:shadow-[3px_3px_0_rgba(82,125,255,0.3)] sm:p-8">
            <p className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">{messages.about.location.badge}</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tighter text-text-heading sm:text-4xl">{messages.about.location.title}</h2>
            <p className="mt-4 text-sm leading-8 text-text-body sm:text-base">{messages.about.location.description}</p>

            <div className="mt-6 space-y-4 text-sm text-text-body">
              <div className="flex items-start gap-3">
                <GridCardIcon name="location" className="mt-0.5 size-[18px] shrink-0 text-primary" />
                <p>{messages.about.location.address}</p>
              </div>
              <div className="flex items-start gap-3">
                <GridCardIcon name="clock" className="mt-0.5 size-[18px] shrink-0 text-primary" />
                <p>{messages.about.location.hours}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-text-muted uppercase">{messages.about.location.supportTitle}</p>
                <ul className="mt-4 space-y-3">
                  {messages.about.location.supportItems.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-text-body">
                      <GridCardIcon name="check" className="mt-[0.45rem] size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-text-muted uppercase">{messages.about.location.serviceTitle}</p>
                <ul className="mt-4 space-y-3">
                  {messages.about.location.serviceItems.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-text-body">
                      <GridCardIcon name="check" className="mt-[0.45rem] size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a
              href={messages.about.location.mapsCtaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="motion-button mt-8 inline-flex items-center gap-2 rounded-sm border border-outline-variant bg-card px-4 py-2.5 text-[11px] font-bold tracking-[0.18em] text-text-heading uppercase transition-colors hover:border-primary hover:text-primary"
            >
              {messages.about.location.mapsCta}
              <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="overflow-hidden rounded-sm border border-outline-variant bg-card shadow-sm">
            <iframe
              title={messages.about.location.mapTitle}
              src={messages.about.location.mapsEmbedUrl}
              className="h-[380px] w-full sm:h-[420px] lg:h-full lg:min-h-[560px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="container-wrap">
          <div className="relative overflow-hidden rounded-sm bg-primary p-8 sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(70%_70%_at_70%_50%,rgba(255,255,255,0.18),transparent_70%)] lg:block" />

            <div className="relative max-w-3xl">
              <p className="text-[10px] font-bold tracking-[0.3em] text-primary-fixed uppercase">{messages.about.cta.badge}</p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tighter text-white sm:text-5xl sm:leading-[1.05]">
                {messages.about.cta.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-primary-fixed sm:text-lg">{messages.about.cta.description}</p>

              <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md bg-white px-5 text-[11px] font-bold tracking-[0.22em] text-primary uppercase transition-colors hover:bg-primary-fixed"
                >
                  <ChannelIcon channel="whatsapp" size={18} />
                  {messages.about.cta.primaryCta}
                  <ArrowUpRight size={15} />
                </a>

                <a
                  href={TOKOPEDIA_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="motion-button inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-md border border-white/25 px-5 text-[11px] font-bold tracking-[0.22em] text-white uppercase transition-colors hover:bg-white/10"
                >
                  <ChannelIcon channel="tokopedia" size={18} />
                  {messages.about.cta.secondaryCta}
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
