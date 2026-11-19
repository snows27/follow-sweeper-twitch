"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

type NavigationLike = {
  currentEntry?: { index: number } | null;
  entries?: () => { url: string | null }[];
};

/** Was the previous history entry a page on this site? (Never send users back to another site.) */
function previousPageIsOurs(): boolean {
  const origin = window.location.origin;
  // Navigation API (Chromium, Safari 26+, Firefox 147+): exact previous entry, also for in-app navigations.
  const nav = (window as unknown as { navigation?: NavigationLike }).navigation;
  if (nav?.currentEntry && nav.entries) {
    const prev = nav.entries()[nav.currentEntry.index - 1];
    return Boolean(prev?.url?.startsWith(origin));
  }
  // Fallback: where the current document was loaded from.
  return window.history.length > 1 && document.referrer.startsWith(origin);
}

/**
 * Go back to the previous page on this site (e.g. Followers → Help → back).
 * If there's nothing to go back to (opened directly / from another site),
 * go to the home page — which sends logged-in users straight to Followers.
 */
export function BackButton({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const router = useRouter();

  function goBack() {
    if (previousPageIsOurs()) router.back();
    else router.push(`/${locale}`);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={cn(
        "-ml-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-3 hover:text-fg",
        className,
      )}
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {dict.common.back}
    </button>
  );
}
