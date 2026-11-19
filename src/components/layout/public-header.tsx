import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import type { Locale } from "@/i18n/config";

/** Header for public content pages (Help, Privacy): logo + theme + language. */
export function PublicHeader({ locale, maxWidth = "max-w-3xl" }: { locale: Locale; maxWidth?: string }) {
  return (
    <header className="border-b border-line px-4 sm:px-6">
      <div className={`mx-auto flex h-16 ${maxWidth} items-center justify-between gap-3`}>
        <Logo locale={locale} />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
