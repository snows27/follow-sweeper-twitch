"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, LayoutDashboard, Users, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

/** Main navigation. Add new tools here as they're built. */
export function AppNav({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();

  const items = [
    { href: `/${locale}/dashboard`, label: dict.nav.dashboard, icon: LayoutDashboard },
    { href: `/${locale}/followers`, label: dict.nav.followers, icon: Users },
    { href: `/${locale}/help`, label: dict.nav.help, icon: CircleHelp },
  ];

  return (
    <nav aria-label={dict.nav.menu}>
      <ul className={cn("flex gap-1", orientation === "vertical" ? "flex-col" : "flex-row")}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-brand-soft text-brand-fg" : "text-muted hover:bg-surface-3 hover:text-fg",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
        {orientation === "vertical" && (
          <li className="mt-4 flex items-center gap-3 px-3 py-2 text-sm text-subtle">
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
            {dict.nav.comingSoon}…
          </li>
        )}
      </ul>
    </nav>
  );
}
