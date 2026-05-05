import { LocaleProvider } from "@/components/providers/locale-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StockStreamProvider } from "@/components/providers/stock-stream-provider";
import { getRequestLocale } from "@/lib/i18n/get-locale";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export async function PublicLayout({ children }: PublicLayoutProps) {
  const locale = await getRequestLocale();

  return (
    <LocaleProvider initialLocale={locale}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <StockStreamProvider>
          <main className="flex-1 pt-20">{children}</main>
        </StockStreamProvider>
        <SiteFooter />
      </div>
    </LocaleProvider>
  );
}
