"use client";

import { useSearchParams } from "next/navigation";
import { TwitchGlitch } from "@/components/brand/twitch-glitch";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

/**
 * Plain link (not fetch) to our login route, which redirects to Twitch.
 * Carries `returnTo` so the user lands back where they were going.
 */
export function LoginButton({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { locale, dict } = useI18n();
  const searchParams = useSearchParams();
  const query = new URLSearchParams({ locale });
  const returnTo = searchParams.get("returnTo");
  if (returnTo) query.set("returnTo", returnTo);

  return (
    <a
      href={`/api/auth/login?${query.toString()}`}
      className={cn(buttonClasses({ variant: "primary", size }), className)}
    >
      <TwitchGlitch className="size-[18px]" />
      {dict.common.loginWithTwitch}
    </a>
  );
}

/** Fallback while search params load (keeps the button in the static shell). */
export function LoginButtonFallback({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { locale, dict } = useI18n();
  return (
    <a href={`/api/auth/login?locale=${locale}`} className={buttonClasses({ variant: "primary", size })}>
      <TwitchGlitch className="size-[18px]" />
      {dict.common.loginWithTwitch}
    </a>
  );
}
