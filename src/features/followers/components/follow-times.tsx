"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Clock, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { format, plural } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { useFormatters } from "../hooks/use-formatters";
import { dailyCounts, findBursts, overlaps, type TimeBucket } from "../lib/spikes";
import type { FollowerItem, FollowWindow } from "../types";

type Props = {
  /** All loaded followers (not the filtered list), so the chart doesn't change as you filter. */
  followers: FollowerItem[];
  /** When the list was loaded — the chart's "today". 0 while loading. */
  now: number;
  active: FollowWindow | null;
  onWindow: (w: FollowWindow | null) => void;
};

const CHART_H = 64;

/**
 * Collapsible "Follow times" panel: follows per day (last 30 days) plus busy hours.
 * Picking a bar or a busy hour sets a follow-time filter. It never selects anyone.
 */
export function FollowTimes({ followers, now, active, onWindow }: Props) {
  const { dict } = useI18n();
  const t = dict.followers.followTimes;
  const fmt = useFormatters();
  const [hover, setHover] = useState<TimeBucket | null>(null);

  const { days, bursts, max } = useMemo(() => {
    const times = followers.map((f) => f.followedAtMs);
    const days = now ? dailyCounts(times, now) : [];
    return { days, bursts: findBursts(times), max: Math.max(1, ...days.map((d) => d.count)) };
  }, [followers, now]);

  const rangeLabel = (b: { start: number; end: number }) => {
    const sameDay = new Date(b.start).toDateString() === new Date(b.end - 1).toDateString();
    const endLabel = fmt.time(b.end);
    return sameDay ? `${fmt.dateTime(b.start)}–${endLabel}` : `${fmt.dateTime(b.start)} – ${fmt.dateTime(b.end)}`;
  };
  const windowLabel = (w: FollowWindow) => {
    // A whole local day reads better as just the date.
    const isDay = days.some((d) => d.start === w.start && d.end === w.end);
    return isDay ? fmt.date(w.start) : rangeLabel(w);
  };
  const isPicked = (b: TimeBucket) => active?.start === b.start && active?.end === b.end;
  const pick = (b: TimeBucket) => onWindow(isPicked(b) ? null : { start: b.start, end: b.end });

  const readout = hover ?? days.at(-1);

  return (
    <div className="rounded-card border border-line bg-surface">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-card px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <Clock className="size-4 text-muted" aria-hidden="true" />
          {t.title}
          <span className="font-normal text-muted">
            ·{" "}
            {now === 0
              ? "…"
              : bursts.length === 0
                ? t.noBursts
                : plural(bursts.length, t.burstsFoundOne, t.burstsFound, { count: fmt.number(bursts.length) })}
          </span>
          <ChevronDown
            className="ml-auto size-4 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </summary>

        <div className="space-y-4 border-t border-line px-4 pb-4 pt-3">
          <p className="max-w-prose text-sm text-muted">{t.hint}</p>

          {days.length > 0 && (
            <figure className="space-y-1.5">
              <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 text-xs">
                <span className="font-semibold uppercase tracking-wide text-muted">{t.chartLabel}</span>
                {readout && (
                  <span className="tabular-nums text-fg" aria-live="polite">
                    {format(t.dayValue, { date: fmt.date(readout.start), count: fmt.number(readout.count) })}
                  </span>
                )}
              </figcaption>
              <div
                className="flex items-end gap-0.5 border-b border-line"
                style={{ height: CHART_H }}
                onMouseLeave={() => setHover(null)}
              >
                {days.map((d) => {
                  const inActive = isPicked(d) || (active !== null && overlaps(active, d));
                  const busy = bursts.some((b) => overlaps(b, d));
                  return (
                    <button
                      key={d.start}
                      type="button"
                      aria-pressed={isPicked(d)}
                      aria-label={format(t.dayValue, { date: fmt.date(d.start), count: fmt.number(d.count) })}
                      disabled={d.count === 0}
                      onClick={() => pick(d)}
                      onMouseEnter={() => setHover(d)}
                      onFocus={() => setHover(d)}
                      // Full-height hit area; the visible bar sits at the bottom.
                      className="group/bar flex h-full min-w-0 flex-1 items-end rounded-t-sm focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-default"
                    >
                      <span
                        className={cn(
                          "block w-full rounded-t-[4px] transition-colors motion-reduce:transition-none",
                          inActive
                            ? "bg-brand-fg"
                            : busy
                              ? "bg-brand group-hover/bar:bg-brand-hover"
                              : "bg-brand/35 group-hover/bar:bg-brand/60",
                        )}
                        style={{ height: d.count === 0 ? 0 : Math.max(2, (d.count / max) * CHART_H) }}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs tabular-nums text-subtle" aria-hidden="true">
                <span>{fmt.date(days[0].start)}</span>
                <span>{fmt.date(days[days.length - 1].start)}</span>
              </div>
            </figure>
          )}

          {bursts.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t.busyHours}</p>
              <ul className="flex flex-wrap gap-1.5">
                {bursts.map((b) => (
                  <li key={b.start}>
                    <button
                      type="button"
                      aria-pressed={isPicked(b)}
                      onClick={() => pick(b)}
                      className={cn(
                        "flex h-8 items-center gap-2 rounded-full border px-3 text-sm transition-colors",
                        isPicked(b)
                          ? "border-brand bg-brand text-white"
                          : "border-line text-fg hover:border-subtle",
                      )}
                    >
                      <span className="tabular-nums">{rangeLabel(b)}</span>
                      <span className={cn("font-semibold tabular-nums", !isPicked(b) && "text-muted")}>
                        {format(t.burstCount, { count: fmt.number(b.count) })}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="max-w-prose text-xs text-muted">{t.caution}</p>
        </div>
      </details>

      {/* Stays visible when the panel is closed, so a hidden filter never surprises anyone. */}
      {active && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5 text-sm">
          <span className="text-brand-fg">{format(t.showing, { range: windowLabel(active) })}</span>
          <button
            type="button"
            onClick={() => onWindow(null)}
            className="ml-auto flex h-8 items-center gap-1.5 rounded-md px-3 font-semibold text-muted hover:bg-surface-3 hover:text-fg"
          >
            <X className="size-4" aria-hidden="true" />
            {t.clear}
          </button>
        </div>
      )}
    </div>
  );
}
