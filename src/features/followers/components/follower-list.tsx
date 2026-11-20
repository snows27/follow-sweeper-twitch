"use client";

import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { Mascot } from "@/components/common/mascot";
import { FollowerRow, ROW_GRID_WIDE, ROW_HEIGHT, WIDE_TABLE_MIN_W } from "./follower-row";
import { useFormatters } from "../hooks/use-formatters";
import type { FollowerItem, SortColumn, SortState } from "../types";

type Props = {
  items: FollowerItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (select: boolean) => void;
  sort: SortState;
  onSort: (column: SortColumn) => void;
  dimmed?: boolean;
  /** Show skeleton rows (header stays real). */
  loading?: boolean;
  /** Reference time for "x ago" labels (when the data was loaded). */
  now: number;
};

/** Column header button with a sort icon next to the label. */
function SortHeader({
  column,
  label,
  sort,
  onSort,
  className,
}: {
  column: SortColumn;
  label: string;
  sort: SortState;
  onSort: (column: SortColumn) => void;
  className?: string;
}) {
  const { dict } = useI18n();
  const active = sort.column === column;
  const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <div
      role="columnheader"
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className={className}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        title={format(dict.followers.table.sortBy, { column: label })}
        className={cn(
          "-ml-2 inline-flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-surface-3 hover:text-fg",
          active && "text-fg",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", active ? "text-brand-fg" : "opacity-60")} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Virtualized table: only the visible rows are in the DOM,
 * so 50,000 followers scroll as smoothly as 50.
 */
export function FollowerList({
  items,
  selected,
  onToggle,
  onToggleAll,
  sort,
  onSort,
  dimmed,
  loading,
  now,
}: Props) {
  const { dict } = useI18n();
  const t = dict.followers.table;
  const fmt = useFormatters();
  const scrollRef = useRef<HTMLDivElement>(null);
  const allRef = useRef<HTMLInputElement>(null);

  const selectedShown = items.reduce((n, f) => n + (selected.has(f.id) ? 1 : 0), 0);
  const allSelected = items.length > 0 && selectedShown === items.length;

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = selectedShown > 0 && !allSelected;
  }, [selectedShown, allSelected]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual is designed for this usage.
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
    // The sticky header sits inside the scroll box, above the rows.
    scrollMargin: HEADER_HEIGHT,
  });
  const slow = useSlow(Boolean(loading));

  return (
    <div
      role="table"
      aria-label={dict.followers.title}
      aria-rowcount={items.length}
      aria-busy={loading || undefined}
      className="relative overflow-hidden rounded-card border border-line bg-surface"
    >
      {/*
        One scroll box for both directions: on phones the table is wider than the screen,
        so header and rows scroll sideways together; the header stays pinned on top.
      */}
      <div
        ref={scrollRef}
        className={cn(
          "h-[calc(100dvh-9rem)] min-h-[32rem] overscroll-x-contain",
          // While loading, the skeleton fills (and is clipped to) the box — nothing to scroll.
          loading ? "overflow-hidden" : "overflow-auto",
        )}
      >
        <div className={WIDE_TABLE_MIN_W}>
          <div role="rowgroup" className="sticky top-0 z-10">
            <div
              role="row"
              className={cn(
                ROW_GRID_WIDE,
                "border-b border-line bg-surface-2 px-4 text-xs font-semibold uppercase tracking-wide text-muted",
              )}
              style={{ height: HEADER_HEIGHT }}
            >
              <div role="columnheader">
                <input
                  ref={allRef}
                  type="checkbox"
                  checked={allSelected}
                  disabled={loading}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  aria-label={dict.followers.actions.selectAllShown}
                  className="size-[18px] cursor-pointer accent-brand"
                />
              </div>
              <SortHeader column="name" label={t.user} sort={sort} onSort={onSort} />
              <div role="columnheader">{t.roles}</div>
              <SortHeader column="followedAt" label={t.followedAt} sort={sort} onSort={onSort} />
              <SortHeader column="createdAt" label={t.createdAt} sort={sort} onSort={onSort} />
            </div>
          </div>

          <div role="rowgroup" className={cn("transition-opacity", dimmed && "opacity-60")}>
            {loading ? (
              <div className={cn("transition-opacity duration-500", slow && "opacity-40")}>
                {Array.from({ length: SKELETON_ROWS }, (_, i) => (
                  <SkeletonRow key={i} index={i} />
                ))}
              </div>
            ) : (
              <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map((row) => {
                  const f = items[row.index];
                  return (
                    <div
                      key={f.id}
                      className="absolute left-0 top-0 w-full"
                      style={{
                        height: row.size,
                        // `start` includes the header (scrollMargin); rows are placed below it.
                        transform: `translateY(${row.start - HEADER_HEIGHT}px)`,
                      }}
                    >
                      <FollowerRow
                        follower={f}
                        selected={selected.has(f.id)}
                        onToggle={onToggle}
                        fmt={fmt}
                        now={now}
                        layout="wide"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slow load: mascot card centred in the visible area (outside the sideways-scrolling box). */}
      {loading && slow && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex max-h-[36rem] items-center justify-center p-4"
          style={{ top: HEADER_HEIGHT }}
        >
          <div className="flex animate-fade-in flex-col items-center gap-2 rounded-card border border-line bg-surface/95 px-6 py-5 text-center shadow-xl">
            <Mascot name="loading" size={120} bob />
            <p className="max-w-xs text-sm font-semibold text-muted">{dict.followers.loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const HEADER_HEIGHT = 48;

/**
 * Enough skeleton rows to cover the tallest table (it is clipped to the box),
 * so the skeleton never leaves an empty gap at the bottom on tall screens.
 */
const SKELETON_ROWS = 24;

/** How long a load must take before the mascot appears (fast loads show only the skeleton). */
const SLOW_LOAD_MS = 1500;

/** True once `active` has lasted SLOW_LOAD_MS; resets when it stops. */
function useSlow(active: boolean) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setSlow(true), SLOW_LOAD_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [active]);
  return slow;
}

/** Placeholder row with the same shape as a real one, so nothing jumps when data arrives. */
function SkeletonRow({ index }: { index: number }) {
  // Vary widths a little so it looks like real content.
  const nameW = ["w-32", "w-24", "w-40", "w-28"][index % 4];
  const tagW = ["w-12", "w-20", "w-10", "w-16"][index % 4];
  const bar = "animate-pulse rounded bg-surface-3";
  return (
    <div role="row" aria-hidden="true" className={cn(ROW_GRID_WIDE, "border-b border-line px-4")} style={{ height: ROW_HEIGHT }}>
      <div className={cn(bar, "size-[18px]")} />
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn(bar, "size-11 shrink-0 rounded-full")} />
        <div className="space-y-2">
          <div className={cn(bar, "h-4", nameW)} />
          <div className={cn(bar, "h-3 w-20")} />
        </div>
      </div>
      <div>
        <div className={cn(bar, "h-5 rounded-full", tagW)} />
      </div>
      <div className="space-y-2">
        <div className={cn(bar, "h-4 w-36")} />
        <div className={cn(bar, "h-3 w-16")} />
      </div>
      <div className="space-y-2">
        <div className={cn(bar, "h-4 w-24")} />
        <div className={cn(bar, "h-3 w-20")} />
      </div>
    </div>
  );
}
