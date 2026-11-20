import type { Metadata } from "next";
import { Check, ChevronDown, Lock, ShieldCheck, Sparkles, CircleHelp } from "lucide-react";
import { resolveLocale } from "@/i18n/server";
import { PublicHeader } from "@/components/layout/public-header";
import { BackButton } from "@/components/layout/back-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { REQUIRED_SCOPES } from "@/server/auth/scopes";

export async function generateMetadata({ params }: PageProps<"/[lang]/help">): Promise<Metadata> {
  const { dict } = await resolveLocale(params);
  return { title: dict.help.title, description: dict.help.intro };
}

function SectionTitle({ icon, children, id }: { icon: React.ReactNode; children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="mb-4 flex items-center gap-2 text-xl font-bold">
      {icon}
      {children}
    </h2>
  );
}

/** Public help page: how it works, permissions, security and FAQ. Fully static. */
export default async function HelpPage({ params }: PageProps<"/[lang]/help">) {
  const { locale, dict } = await resolveLocale(params);
  const t = dict.help;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader locale={locale} />

      <main id="main" className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-4 py-8 sm:px-6">
        <header>
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-extrabold tracking-tight">{t.title}</h1>
          <p className="mt-2 text-muted">{t.intro}</p>
        </header>

        <section aria-labelledby="how">
          <SectionTitle id="how" icon={<Sparkles className="size-5 text-brand" aria-hidden="true" />}>
            {t.howTitle}
          </SectionTitle>
          <ol className="grid gap-3 sm:grid-cols-3">
            {t.steps.map((step, i) => (
              <li key={step.title}>
                <Card className="h-full p-4">
                  <span className="mb-2 flex size-7 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-fg">
                    {i + 1}
                  </span>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="permissions">
          <SectionTitle id="permissions" icon={<Lock className="size-5 text-brand" aria-hidden="true" />}>
            {t.permissionsTitle}
          </SectionTitle>
          <Card>
            <ul className="divide-y divide-line">
              {REQUIRED_SCOPES.map((scope) => (
                <li key={scope} className="py-3 text-sm first:pt-0 last:pb-0">
                  <code className="rounded bg-surface-3 px-1.5 py-0.5 text-xs text-brand-fg">{scope}</code>
                  <p className="mt-1.5 text-muted">{dict.scopes[scope]}</p>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="security">
          <SectionTitle id="security" icon={<ShieldCheck className="size-5 text-success-fg" aria-hidden="true" />}>
            {t.securityTitle}
          </SectionTitle>
          <Card>
            <ul className="space-y-3">
              {t.securityPoints.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm text-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-success-fg" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="faq">
          <SectionTitle id="faq" icon={<CircleHelp className="size-5 text-brand" aria-hidden="true" />}>
            {t.faqTitle}
          </SectionTitle>
          <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {t.faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex list-none items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-5 pb-5 pt-3 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} dict={dict} />
    </div>
  );
}
