"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { locales, switchLocalePath, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { rememberLocale } from "@/i18n/locale-cookie";
import { cn } from "@/lib/cn";

const labels: Record<Locale, string> = { en: "EN", th: "TH" };

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  function change(next: Locale) {
    if (next === locale) return;
    rememberLocale(next);
    router.push(switchLocalePath(pathname, next) + window.location.search);
  }

  return (
    <div
      role="group"
      aria-label={dict.common.language}
      className={cn("flex items-center gap-0.5 rounded-lg bg-surface-2 p-1", className)}
    >
      <Languages className="mx-1.5 hidden size-[18px] text-muted sm:block" aria-hidden="true" />
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => change(l)}
          aria-pressed={l === locale}
          lang={l}
          className={cn(
            "h-8 rounded-md px-2.5 text-sm font-bold transition-colors sm:h-9 sm:px-3",
            l === locale ? "bg-brand text-white" : "text-muted hover:text-fg",
          )}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
