import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/server";
import { PublicHeader } from "@/components/layout/public-header";
import { BackButton } from "@/components/layout/back-button";
import { SiteFooter } from "@/components/layout/site-footer";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { dict } = await resolveLocale(params);
  return { title: dict.privacy.title };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { locale, dict } = await resolveLocale(params);
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader locale={locale} />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <BackButton className="mb-4" />
        <h1 className="mb-6 text-3xl font-bold">{dict.privacy.title}</h1>
        <div className="space-y-4 text-muted">
          {dict.privacy.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </main>
      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
