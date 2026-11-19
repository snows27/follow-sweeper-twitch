"use client";

import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { Mascot } from "@/components/common/mascot";
import { FollowerRow, ROW_GRID, ROW_HEIGHT } from "./follower-row";
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
  });

  return (
    <div
      role="table"
      aria-label={dict.followers.title}
      aria-rowcount={items.length}
      aria-busy={loading || undefined}
      className="overflow-hidden rounded-card border border-line bg-surface"
    >
      <div role="rowgroup">
        <div
          role="row"
          className={cn(
            ROW_GRID,
            "h-12 border-b border-line bg-surface-2 px-4 text-xs font-semibold uppercase tracking-wide text-muted",
          )}
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
          <div role="columnheader" className="hidden md:block">
            {t.roles}
          </div>
          <SortHeader column="followedAt" label={t.followedAt} sort={sort} onSort={onSort} className="hidden md:block" />
          <SortHeader column="createdAt" label={t.createdAt} sort={sort} onSort={onSort} className="hidden md:block" />
        </div>
      </div>

      <div
        ref={scrollRef}
        role="rowgroup"
        className={cn(
          "h-[calc(100dvh-9rem)] min-h-[32rem] overflow-y-auto transition-opacity",
          dimmed && "opacity-60",
        )}
      >
        {loading ? (
          <>
            <div className="flex items-center justify-center gap-4 border-b border-line bg-surface-2/50 px-4 py-4">
              <Mascot name="loading" size={88} bob priority />
              <p className="max-w-xs text-sm text-muted">{dict.followers.loadingText}</p>
            </div>
            {Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <SkeletonRow key={i} index={i} />
            ))}
          </>
        ) : (
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((row) => {
            const f = items[row.index];
            return (
              <div
                key={f.id}
                className="absolute left-0 top-0 w-full"
                style={{ height: row.size, transform: `translateY(${row.start}px)` }}
              >
                <FollowerRow follower={f} selected={selected.has(f.id)} onToggle={onToggle} fmt={fmt} now={now} />
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}

const SKELETON_ROWS = 10;

/** Placeholder row with the same shape as a real one, so nothing jumps when data arrives. */
function SkeletonRow({ index }: { index: number }) {
  // Vary widths a little so it looks like real content.
  const nameW = ["w-32", "w-24", "w-40", "w-28"][index % 4];
  const tagW = ["w-12", "w-20", "w-10", "w-16"][index % 4];
  const bar = "animate-pulse rounded bg-surface-3";
  return (
    <div role="row" aria-hidden="true" className={cn(ROW_GRID, "border-b border-line px-4")} style={{ height: ROW_HEIGHT }}>
      <div className={cn(bar, "size-[18px]")} />
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn(bar, "size-11 shrink-0 rounded-full")} />
        <div className="space-y-2">
          <div className={cn(bar, "h-4", nameW)} />
          <div className={cn(bar, "h-3 w-20")} />
        </div>
      </div>
      <div className="hidden md:block">
        <div className={cn(bar, "h-5 rounded-full", tagW)} />
      </div>
      <div className="hidden space-y-2 md:block">
        <div className={cn(bar, "h-4 w-36")} />
        <div className={cn(bar, "h-3 w-16")} />
      </div>
      <div className="hidden space-y-2 md:block">
        <div className={cn(bar, "h-4 w-24")} />
        <div className={cn(bar, "h-3 w-20")} />
      </div>
    </div>
  );
}
