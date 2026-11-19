import { LOCALE_COOKIE } from "@/lib/constants";
import type { Locale } from "./config";

/** Remember the chosen language for next visit (read by the proxy on "/"). */
export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
