import "server-only";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";
import { getDictionary } from "./get-dictionary";

/** Validate the `[lang]` route param and load its dictionary (404 for unknown locales). */
export async function resolveLocale(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale: Locale = lang;
  return { locale, dict: await getDictionary(locale) };
}
