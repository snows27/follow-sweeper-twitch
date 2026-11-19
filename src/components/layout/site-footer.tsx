import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="border-t border-line px-4 py-6 text-xs text-subtle sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {APP_NAME} — {dict.common.notAffiliated}
        </p>
        <nav className="flex gap-4">
          <Link href={`/${locale}/help`} className="hover:text-fg">
            {dict.nav.help}
          </Link>
          <Link href={`/${locale}/privacy`} className="hover:text-fg">
            {dict.nav.privacy}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
