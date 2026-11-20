import { Suspense } from "react";
import Image from "next/image";
import heroArt from "@/assets/landing-hero.jpg";
import { Lock } from "lucide-react";
import { resolveLocale } from "@/i18n/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { SiteFooter } from "@/components/layout/site-footer";
import { LoginButton, LoginButtonFallback } from "@/features/auth/components/login-button";
import { LoginError } from "@/features/auth/components/login-error";
import { DemoPreview } from "@/features/landing/demo-preview";
import { Mascot } from "@/components/common/mascot";
import { APP_NAME } from "@/lib/constants";

/**
 * Landing: no navbar — just the login, with a preview of the app below.
 * Details (how it works, permissions, security, FAQ) live on /help.
 * Fully static, so it loads instantly.
 */
export default async function LandingPage({ params }: PageProps<"/[lang]">) {
  const { locale, dict } = await resolveLocale(params);
  const t = dict.landing;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      {/* Decorative art on the right (desktop only), faded into the background. */}
      <div
        aria-hidden="true"
        className="hero-art-mask pointer-events-none absolute right-0 top-0 hidden h-dvh w-[36%] max-w-[44rem] lg:block"
      >
        <Image
          src={heroArt}
          alt=""
          fill
          sizes="34vw"
          placeholder="blur"
          className="hero-art object-cover object-[50%_15%]"
        />
      </div>
      {/* Only the theme + language switches — no navbar */}
      <div className="relative flex justify-end gap-2 p-4 sm:gap-3 sm:p-6">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>

      <main id="main" className="relative flex-1">
        {/* Hero + login */}
        <section className="px-4 pb-12 pt-4 text-center sm:px-6 sm:pt-8">
          <div className="mx-auto max-w-3xl">
            {/* Mascot greets visitors; the broom icon stays the logo for the tab icon and small headers. */}
            <div className="mb-4 flex flex-col items-center">
              <Mascot name="welcome" size={140} priority className="size-28 sm:size-[140px]" />
              <span className="-mt-1 text-2xl font-extrabold tracking-tight">{APP_NAME}</span>
            </div>
            <Suspense>
              <LoginError />
            </Suspense>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{t.heroTitle}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted text-pretty">{t.heroSubtitle}</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Suspense fallback={<LoginButtonFallback size="lg" />}>
                <LoginButton size="lg" />
              </Suspense>
              {/* Icon is inline so it stays on the first line when the note wraps; both lines centred. */}
              <p className="max-w-sm text-center text-sm text-balance text-subtle">
                <Lock className="mr-1.5 inline-block size-3.5 align-[-2px]" aria-hidden="true" />
                {t.ctaNote}
              </p>
            </div>
          </div>
        </section>

        {/* App preview with made-up data */}
        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <DemoPreview />
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
