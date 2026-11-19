"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * The API said the session ended: go through /api/auth/expired, which clears
 * the session + logged-in hint, then shows the login page with a message.
 * A full navigation (not router.push) because it's an API route that sets cookies.
 */
export function useSessionExpired() {
  const { locale } = useI18n();
  const pathname = usePathname();
  return useCallback(() => {
    const q = new URLSearchParams({ locale, returnTo: pathname });
    window.location.replace(`/api/auth/expired?${q.toString()}`);
  }, [locale, pathname]);
}
