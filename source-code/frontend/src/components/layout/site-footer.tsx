import Link from "next/link";
import { Clock3, MapPin, Phone } from "lucide-react";
import { ChannelIcon } from "@/components/shared/channel-icon";
import { getRequestLocale } from "@/lib/i18n/get-locale";
import { getDictionary, STORE_MAP_EMBED_URL, STORE_MAP_URL } from "@/lib/i18n/messages";
import { getCategories } from "@/lib/products";

const TOKOPEDIA_STORE_URL = "https://tk.tokopedia.com/ZSHhyGtpk/";
const WHATSAPP_URL = "https://wa.me/6281234567890";
const INSTAGRAM_URL = "https://instagram.com/planetmotorbmw";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

type ChannelSocialLink = {
  href: string;
  label: string;
  channel: "tokopedia" | "whatsapp";
};

type IconSocialLink = {
  href: string;
  label: string;
  icon: typeof InstagramIcon;
  iconClassName: string;
};

type SocialLink = ChannelSocialLink | IconSocialLink;

const socialLinks: SocialLink[] = [
  {
    href: TOKOPEDIA_STORE_URL,
    label: "Tokopedia",
    channel: "tokopedia" as const,
  },
  {
    href: WHATSAPP_URL,
    label: "WhatsApp",
    channel: "whatsapp" as const,
  },
  {
    href: INSTAGRAM_URL,
    label: "Instagram",
    icon: InstagramIcon,
    iconClassName: "text-[#E4405F]",
  },
];

export async function SiteFooter() {
  const locale = await getRequestLocale();
  const messages = getDictionary(locale);
  const categories = await getCategories();
  const totalProducts = categories.reduce((sum, category) => sum + category._count.products, 0);
  const quickLinks = [
    { href: "/", label: messages.footer.quick.home },
    { href: "/products", label: messages.footer.quick.products },
    { href: "/about", label: messages.footer.quick.about },
    { href: "/contact", label: messages.footer.quick.contact },
  ];
  const storeSnapshot =
    locale === "id"
      ? `${categories.length} etalase aktif dan ${totalProducts}+ produk untuk membantu pembeli menelusuri part BMW dengan lebih jelas.`
      : `${categories.length} active showcases and ${totalProducts}+ products to help buyers browse BMW parts more clearly.`;

  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="container-wrap py-14">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[minmax(340px,1.72fr)_minmax(132px,0.82fr)_minmax(132px,0.82fr)_minmax(176px,0.96fr)_minmax(220px,1.12fr)] xl:gap-x-10 xl:gap-y-10">
          <div className="space-y-4 xl:pr-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-xs font-semibold tracking-[0.16em] text-brand-primary">
                PM
              </div>
              <p className="min-w-0 whitespace-nowrap font-heading text-[1.35rem] leading-none text-text-heading sm:text-[1.55rem]">
                {messages.common.brand}
              </p>
            </div>

            <p className="max-w-md text-sm leading-7 text-text-body">{messages.footer.description}</p>
            <p className="max-w-md text-xs font-medium tracking-[0.08em] text-text-muted uppercase">{storeSnapshot}</p>

            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = "icon" in item ? item.icon : null;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="motion-button inline-flex size-10 items-center justify-center rounded-md border border-border/70 bg-card text-text-heading transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
                    aria-label={item.label}
                    title={item.label}
                  >
                    {"channel" in item ? (
                      <ChannelIcon channel={item.channel} size={20} />
                    ) : Icon ? (
                      <Icon className={`size-[18px] ${item.iconClassName}`} />
                    ) : null}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="xl:pl-2">
            <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-text-muted">{messages.footer.primaryShowcase}</p>
            <ul className="space-y-2 text-sm text-text-body">
              {categories.map((item) => (
                <li key={item.id}>
                  <Link href={`/products?category=${item.slug}`} className="transition-colors hover:text-brand-primary">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="xl:pl-2">
            <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-text-muted">{messages.footer.quickLinks}</p>
            <ul className="space-y-2 text-sm text-text-body">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-brand-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-text-muted">{messages.footer.contact}</p>
            <div className="space-y-3 text-sm text-text-body">
              <p className="inline-flex items-center gap-2">
                <Phone className="size-4 text-brand-primary" />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand-primary"
                >
                  +62 812-3456-7890
                </a>
              </p>
              <p className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-primary" />
                <span>{messages.footer.address}</span>
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock3 className="size-4 text-brand-primary" />
                <span>{messages.footer.hours}</span>
              </p>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.18em] text-text-muted">{messages.footer.location}</p>
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <iframe
                title="Planet Motor BMW location map"
                src={STORE_MAP_EMBED_URL}
                className="h-44 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={STORE_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-xs text-text-muted transition-colors hover:text-brand-primary"
            >
              {messages.common.openInMaps}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-text-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {messages.common.brand}. {messages.footer.rights}
          </p>
          <p>{messages.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
