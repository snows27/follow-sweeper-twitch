"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUpDown } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { intlLocale } from "@/i18n/config";
import { format } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { FollowerRow, ROW_GRID, ROW_HEIGHT } from "@/features/followers/components/follower-row";
import type { FollowerItem } from "@/features/followers/types";

/**
 * Static preview of the Followers table for the landing page.
 * Uses the real row component with MADE-UP accounts — never real users.
 * Dates are fixed and formatted in UTC so server and browser render identically.
 */
const DEMO_NOW = Date.parse("2026-11-20T12:00:00Z");
const DAY = 86_400_000;

function avatar(letter: string, bg: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${bg}"/><text x="20" y="26" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type Demo = Partial<FollowerItem> & { login: string; followedDaysAgo: number; createdDaysAgo: number };

const demo: Demo[] = [
  { login: "pixel_panda", displayName: "Pixel_Panda", followedDaysAgo: 1, createdDaysAgo: 1520, isSubscriber: true, avatarUrl: avatar("P", "#9146ff") },
  { login: "moonlight_gg", displayName: "MoonlightGG", followedDaysAgo: 2, createdDaysAgo: 3, isDefaultAvatar: true },
  { login: "kawaii_cat99", displayName: "kawaii_cat99", followedDaysAgo: 5, createdDaysAgo: 880, isVip: true, avatarUrl: avatar("K", "#e9437a") },
  { login: "nightowl_tv", displayName: "NightOwl_TV", followedDaysAgo: 34, createdDaysAgo: 2100, broadcasterType: "affiliate", avatarUrl: avatar("N", "#1f69ff") },
  { login: "user48213", displayName: "user48213", followedDaysAgo: 40, createdDaysAgo: 41, isBanned: true, isDefaultAvatar: true },
  { login: "sunny_side", displayName: "Sunny_Side", followedDaysAgo: 400, createdDaysAgo: 1900, isModerator: true, avatarUrl: avatar("S", "#00a35c") },
];

const items: FollowerItem[] = demo.map((d, i) => {
  const followedAtMs = DEMO_NOW - d.followedDaysAgo * DAY;
  const createdAtMs = DEMO_NOW - d.createdDaysAgo * DAY;
  return {
    id: `demo-${i}`,
    login: d.login,
    displayName: d.displayName ?? d.login,
    followedAt: new Date(followedAtMs).toISOString(),
    createdAt: new Date(createdAtMs).toISOString(),
    broadcasterType: d.broadcasterType ?? "none",
    accountType: "none",
    avatarUrl: d.avatarUrl ?? null,
    isDefaultAvatar: d.isDefaultAvatar ?? false,
    isSubscriber: d.isSubscriber ?? false,
    isBanned: d.isBanned ?? false,
    isModerator: d.isModerator ?? false,
    isVip: d.isVip ?? false,
    followedAtMs,
    createdAtMs,
  };
});

const SELECTED = new Set(["demo-1", "demo-4"]);
const noop = () => {};

export function DemoPreview() {
  const { locale, dict } = useI18n();
  const t = dict.followers;

  const fmt = useMemo(() => {
    const date = new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeZone: "UTC" });
    const number = new Intl.NumberFormat(intlLocale[locale]);
    return { dateTime: (ms: number) => date.format(ms), date: (ms: number) => date.format(ms), number };
  }, [locale]);

  const header = "inline-flex items-center gap-1.5";

  return (
    // Tilted + slightly muted so it reads as a screenshot, not a live control.
    // A small angle and no extra scale() keep text sharp — 3D transforms resample the layer,
    // and every extra degree / scale step makes it softer.
    <div className="[perspective:2400px]">
    <div
      inert
      aria-hidden="true"
      className="pointer-events-none relative origin-top select-none overflow-hidden rounded-card border border-line bg-surface shadow-2xl shadow-brand/15 saturate-[.8] [backface-visibility:hidden] [transform:rotateX(6deg)]"
    >
      {/* Window bar */}
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-danger/60" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <span className="ml-3 truncate text-xs text-subtle">{t.title}</span>
      </div>

      {/* Counts + action, like the real toolbar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm">
        <span className="text-muted">
          {t.stats.total} <b className="text-lg text-fg">{fmt.number.format(1284)}</b>
        </span>
        <span className="text-muted">
          {t.stats.shown} <b className="text-lg text-fg">{fmt.number.format(1284)}</b>
        </span>
        <span className="text-muted">
          {t.stats.selected} <b className="text-lg text-brand-fg">2</b>
        </span>
        {/* Soft style on purpose: a solid red button would compete with the real login CTA. */}
        <span className="ml-auto inline-flex h-8 items-center rounded-md border border-danger/30 bg-danger-soft px-3 text-sm font-semibold text-danger-fg">
          {format(t.actions.removeSelected, { count: 2 })}
        </span>
      </div>

      {/* Table */}
      <div className="border-t border-line">
        <div
          className={cn(
            ROW_GRID,
            "h-12 border-b border-line bg-surface-2 px-4 text-xs font-semibold uppercase tracking-wide text-muted",
          )}
        >
          <span className="size-[18px] rounded border border-subtle" />
          <span className={header}>
            {t.table.user} <ArrowUpDown className="size-3.5 opacity-60" />
          </span>
          <span className="hidden md:block">{t.table.roles}</span>
          <span className={cn(header, "hidden text-fg md:inline-flex")}>
            {t.table.followedAt} <ArrowDown className="size-3.5 text-brand-fg" />
          </span>
          <span className={cn(header, "hidden md:inline-flex")}>
            {t.table.createdAt} <ArrowUpDown className="size-3.5 opacity-60" />
          </span>
        </div>
        {items.map((f) => (
          <div key={f.id} style={{ height: ROW_HEIGHT }}>
            <FollowerRow follower={f} selected={SELECTED.has(f.id)} onToggle={noop} fmt={fmt} now={DEMO_NOW} />
          </div>
        ))}
      </div>

      {/* Fade out the bottom so it reads as a glimpse, not a page */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
    </div>
    </div>
  );
}
