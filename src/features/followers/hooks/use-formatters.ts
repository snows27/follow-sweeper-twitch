"use client";

import { useMemo } from "react";
import { intlLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

/** Locale-aware date/number formatters (Thai uses the Buddhist calendar, as Thai users expect). */
export function useFormatters() {
  const { locale } = useI18n();
  return useMemo(() => {
    const tag = intlLocale[locale];
    const dateTime = new Intl.DateTimeFormat(tag, { dateStyle: "medium", timeStyle: "short" });
    const date = new Intl.DateTimeFormat(tag, { dateStyle: "medium" });
    const time = new Intl.DateTimeFormat(tag, { timeStyle: "short" });
    const number = new Intl.NumberFormat(tag);
    return {
      dateTime: (ms: number) => dateTime.format(ms),
      date: (ms: number) => date.format(ms),
      time: (ms: number) => time.format(ms),
      number: (n: number) => number.format(n),
    };
  }, [locale]);
}
