"use client";

import { memo, type ReactNode } from "react";
import { ExternalLink, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { agoParts } from "../lib/age";
import type { FollowerItem } from "../types";
import type { Dictionary } from "@/i18n/dictionaries/en";

export const ROW_HEIGHT = 76;

/**
 * Compact column layout (landing demo): on small screens only checkbox + account,
 * with roles and date squeezed under the name.
 */
export const ROW_GRID =
  "grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-4 md:grid-cols-[2.25rem_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)]";

/**
 * Wide column layout (Followers page): all five columns at every size.
 * On phones the table is wider than the screen and scrolls sideways.
 */
export const ROW_GRID_WIDE =
  "grid grid-cols-[2.25rem_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)] items-center gap-4";

/** Min width of the wide table on phones, so columns don't get squeezed. */
export const WIDE_TABLE_MIN_W = "min-w-[720px] md:min-w-0";

/** "today", "1 day ago", "3 mo ago", "4 yr 3 mo ago" — relative to now. */
export function formatAgo(ms: number, now: number, dict: Dictionary): string {
  const a = dict.followers.ago;
  const p = agoParts(ms, now);
  switch (p.unit) {
    case "lessThanDay":
      return a.lessThanDay;
    case "days":
      return p.days === 1 ? a.day : format(a.days, { days: p.days });
    case "months":
      return format(a.months, { months: p.months });
    case "years":
      return p.months
        ? format(a.yearsMonths, { years: p.years, months: p.months })
        : format(a.years, { years: p.years });
  }
}

/** Role/type tags. Shown for information only — every account can be selected. */
function RoleTags({ f, dict }: { f: FollowerItem; dict: Dictionary }) {
  const t = dict.followers.flags;
  const tags: ReactNode[] = [];
  if (f.isModerator) tags.push(<Badge key="mod" tone="success">{t.moderator}</Badge>);
  if (f.isVip) tags.push(<Badge key="vip" tone="brand">{t.vip}</Badge>);
  if (f.isSubscriber) tags.push(<Badge key="sub" tone="success">{t.subscriber}</Badge>);
  if (f.isBanned) tags.push(<Badge key="ban" tone="danger">{t.banned}</Badge>);
  if (f.broadcasterType !== "none") {
    tags.push(<Badge key="bt" tone="brand">{t[f.broadcasterType]}</Badge>);
  }
  if (f.accountType !== "none") {
    tags.push(<Badge key="at" tone="warning">{t[f.accountType]}</Badge>);
  }
  if (!f.createdAtMs) tags.push(<Badge key="del" tone="danger">{t.deleted}</Badge>);
  // No special role: a regular viewer.
  if (tags.length === 0) tags.push(<Badge key="user">{t.user}</Badge>);
  return <div className="flex flex-wrap gap-1">{tags}</div>;
}

/**
 * Clicking anywhere on a row toggles it, except:
 * - on the checkbox (it already toggles itself — handling both would undo the click),
 * - on links/buttons (the profile link should just open the profile),
 * - when the user is selecting text (drag to copy a name).
 */
export function shouldIgnoreRowClick(target: EventTarget | null): boolean {
  if (target instanceof Element && target.closest("input, a, button, label, select, textarea")) {
    return true;
  }
  const selection = typeof window !== "undefined" ? window.getSelection() : null;
  return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
}

type Props = {
  follower: FollowerItem;
  selected: boolean;
  onToggle: (id: string) => void;
  fmt: { dateTime: (ms: number) => string; date: (ms: number) => string };
  /** Reference time for "x ago" labels (fixed per page load). */
  now: number;
  /** "compact" (default, landing demo) or "wide" (all columns at every size). */
  layout?: "compact" | "wide";
};

export const FollowerRow = memo(function FollowerRow({
  follower: f,
  selected,
  onToggle,
  fmt,
  now,
  layout = "compact",
}: Props) {
  const wide = layout === "wide";
  /** Desktop-only column in compact layout; always shown in wide layout. */
  const col = wide ? "min-w-0" : "hidden min-w-0 md:block";
  const { dict } = useI18n();
  const t = dict.followers;
  const followedAgo = formatAgo(f.followedAtMs, now, dict);
  const createdAgo = f.createdAtMs ? formatAgo(f.createdAtMs, now, dict) : null;

  return (
    <div
      role="row"
      aria-selected={selected}
      onClick={(e) => {
        if (shouldIgnoreRowClick(e.target)) return;
        onToggle(f.id);
      }}
      className={cn(
        wide ? ROW_GRID_WIDE : ROW_GRID,
        "h-full cursor-pointer border-b border-line px-4 transition-colors",
        selected ? "bg-brand-soft hover:bg-brand/25" : "hover:bg-surface-2",
      )}
    >
      <div role="cell">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(f.id)}
          aria-label={`${t.table.select} ${f.displayName}`}
          className="size-[18px] cursor-pointer accent-brand"
        />
      </div>

      {/* Account */}
      <div role="cell" className="flex min-w-0 items-center gap-3">
        {f.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={f.avatarUrl}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            decoding="async"
            className="size-11 shrink-0 rounded-full bg-surface-3 object-cover"
          />
        ) : (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-3">
            <UserRound className="size-5 text-subtle" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <a
            href={`https://www.twitch.tv/${encodeURIComponent(f.login)}`}
            target="_blank"
            rel="noopener noreferrer"
            title={format(t.table.openProfile, { name: f.displayName })}
            className="group flex items-center gap-1.5 text-base font-semibold hover:text-brand-fg"
          >
            <span className="truncate">{f.displayName}</span>
            <ExternalLink className="size-3.5 shrink-0 opacity-0 group-hover:opacity-100" aria-hidden="true" />
          </a>
          <p className="truncate text-sm text-subtle">@{f.login}</p>
          {/* Compact layout on mobile: roles + date under the name */}
          <div className={cn("mt-0.5 flex items-center gap-2 text-xs text-subtle md:hidden", wide && "hidden")}>
            <span className="shrink-0" title={fmt.dateTime(f.followedAtMs)}>
              {followedAgo}
            </span>
            <div className="min-w-0 overflow-hidden">
              <RoleTags f={f} dict={dict} />
            </div>
          </div>
        </div>
      </div>

      {/* Roles */}
      <div role="cell" className={col}>
        <RoleTags f={f} dict={dict} />
      </div>

      {/* Followed: exact date + how long ago */}
      <div role="cell" className={col}>
        <p className="truncate text-sm">{fmt.dateTime(f.followedAtMs)}</p>
        <p className="truncate text-xs text-subtle">{followedAgo}</p>
      </div>

      {/* Account created: exact date + how long ago */}
      <div role="cell" className={col}>
        <p className="truncate text-sm">{f.createdAtMs ? fmt.date(f.createdAtMs) : "—"}</p>
        {createdAgo && <p className="truncate text-xs text-subtle">{createdAgo}</p>}
      </div>
    </div>
  );
});
