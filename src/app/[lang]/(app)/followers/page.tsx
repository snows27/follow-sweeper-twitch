import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveLocale } from "@/i18n/server";
import { requireUser } from "@/server/auth/guard";
import { FollowersSkeleton, FollowersView } from "@/features/followers/components/followers-view";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/followers">): Promise<Metadata> {
  const { dict } = await resolveLocale(params);
  return { title: dict.followers.title };
}

export default async function FollowersPage({ params }: PageProps<"/[lang]/followers">) {
  const { locale, dict } = await resolveLocale(params);
  return (
    <div className="mx-auto max-w-[96rem]">
      <header className="mb-5">
        <h1 className="text-2xl font-bold sm:text-3xl">{dict.followers.title}</h1>
        <p className="mt-1 text-sm text-muted">{dict.followers.subtitle}</p>
      </header>
      <Suspense fallback={<FollowersSkeleton />}>
        <AuthedFollowers locale={locale} />
      </Suspense>
    </div>
  );
}

/** Checks the session on the server before the tool renders. */
async function AuthedFollowers({ locale }: { locale: Locale }) {
  await requireUser(locale, `/${locale}/followers`);
  return <FollowersView />;
}
