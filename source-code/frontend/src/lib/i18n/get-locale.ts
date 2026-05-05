import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale, LOCALE_COOKIE_NAME } from "@/lib/i18n/messages";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}
