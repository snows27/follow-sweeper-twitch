import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowRight, Users } from "lucide-react";
import { resolveLocale } from "@/i18n/server";
import { format } from "@/i18n/format";
import { requireUser } from "@/server/auth/guard";
import { Card } from "@/components/ui/card";
import { Mascot } from "@/components/common/mascot";
import { ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard">): Promise<Metadata> {
  const { dict } = await resolveLocale(params);
  return { title: dict.nav.dashboard };
}

export default async function DashboardPage({ params }: PageProps<"/[lang]/dashboard">) {
  const { locale, dict } = await resolveLocale(params);
  const t = dict.dashboard;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center gap-4">
        <Mascot name="welcome" size={96} priority />
        <div>
          <Suspense fallback={<div className="h-9 w-64 animate-pulse rounded bg-surface-3" />}>
            <Welcome locale={locale} dict={dict} />
          </Suspense>
          <p className="mt-1 text-muted">{t.intro}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-brand-soft">
            <Users className="size-5 text-brand-fg" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold">{t.followersCardTitle}</h2>
          <p className="mt-1 flex-1 text-sm text-muted">{t.followersCardBody}</p>
          <ButtonLink href={`/${locale}/followers`} className="mt-4 self-start">
            {t.open}
            <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </Card>

        <Card className="border-dashed bg-transparent">
          <h2 className="text-lg font-bold text-muted">{t.upcomingTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-subtle">
            {t.upcoming.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

async function Welcome({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const user = await requireUser(locale, `/${locale}/dashboard`);
  return <h1 className="text-3xl font-bold">{format(dict.dashboard.welcome, { name: user.displayName })}</h1>;
}
