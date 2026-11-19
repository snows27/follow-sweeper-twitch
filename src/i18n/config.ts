export const locales = ["en", "th"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function hasLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** BCP 47 tag used for Intl date/number formatting. */
export const intlLocale: Record<Locale, string> = {
  en: "en-US",
  th: "th-TH",
};

/** Swap the locale segment of a path: "/en/followers" -> "/th/followers". */
export function switchLocalePath(pathname: string, next: Locale): string {
  const parts = pathname.split("/");
  if (hasLocale(parts[1])) {
    parts[1] = next;
    return parts.join("/") || `/${next}`;
  }
  return `/${next}${pathname === "/" ? "" : pathname}`;
}
