import { Suspense } from "react";
import { resolveLocale } from "@/i18n/server";
import { Logo } from "@/components/layout/logo";
import { AppNav } from "@/components/layout/app-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { SiteFooter } from "@/components/layout/site-footer";
import { UserMenu, UserMenuSkeleton } from "@/features/auth/components/user-menu";

/**
 * Shell for logged-in pages. The shell itself is static (instant load);
 * only the user menu reads the session, so it streams in behind <Suspense>.
 * Each page also enforces login itself.
 */
export default async function AppLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { locale, dict } = await resolveLocale(params);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Logo locale={locale} href={`/${locale}/followers`} />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Suspense fallback={<UserMenuSkeleton />}>
              <UserMenu locale={locale} dict={dict} />
            </Suspense>
          </div>
        </div>
        <div className="-mx-1 overflow-x-auto pb-2 lg:hidden">
          <AppNav orientation="horizontal" />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-line p-3 lg:block">
          <div className="sticky top-20">
            <AppNav />
          </div>
        </aside>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>

      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
