import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.en),
  th: () => import("./dictionaries/th").then((m) => m.th),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
