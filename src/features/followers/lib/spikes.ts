/**
 * Follow-time analysis for the "Follow times" panel: follows per day and busy hours.
 * Pure functions. No bot score: they only point at times, and the streamer picks.
 */

export const HOUR_MS = 3_600_000;

export type TimeBucket = { start: number; end: number; count: number };

/** An hour is "busy" when it has this many follows or more... */
export const BURST_MIN_COUNT = 10;
/** ...and at least this many times the channel's usual hour (median of hours with follows). */
export const BURST_FACTOR = 5;
export const MAX_BURSTS = 5;

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Find hours with far more follows than usual. Busy hours next to each other are
 * merged into one window. Biggest first, at most MAX_BURSTS.
 */
export function findBursts(followedAtMs: number[]): TimeBucket[] {
  const perHour = new Map<number, number>();
  for (const ms of followedAtMs) {
    const h = Math.floor(ms / HOUR_MS);
    perHour.set(h, (perHour.get(h) ?? 0) + 1);
  }
  const threshold = Math.max(BURST_MIN_COUNT, Math.ceil(median([...perHour.values()]) * BURST_FACTOR));

  const hot = [...perHour.entries()].filter(([, n]) => n >= threshold).sort((a, b) => a[0] - b[0]);
  const merged: TimeBucket[] = [];
  for (const [h, n] of hot) {
    const last = merged.at(-1);
    if (last && last.end === h * HOUR_MS) {
      last.end += HOUR_MS;
      last.count += n;
    } else {
      merged.push({ start: h * HOUR_MS, end: (h + 1) * HOUR_MS, count: n });
    }
  }
  return merged.sort((a, b) => b.count - a.count || a.start - b.start).slice(0, MAX_BURSTS);
}

/** Follows per local calendar day for the `days` days ending on `now`'s day, oldest first. */
export function dailyCounts(followedAtMs: number[], now: number, days = 30): TimeBucket[] {
  const today = new Date(now);
  const dayStart = (offset: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset).getTime();

  const buckets: TimeBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    buckets.push({ start: dayStart(i), end: dayStart(i - 1), count: 0 });
  }
  const first = buckets[0].start;
  const last = buckets[buckets.length - 1].end;
  for (const ms of followedAtMs) {
    if (ms < first || ms >= last) continue;
    // Days can be 23 or 25 hours around DST changes, so search instead of dividing.
    const b = buckets.find((x) => ms >= x.start && ms < x.end);
    if (b) b.count++;
  }
  return buckets;
}

/** Do two time ranges overlap? */
export function overlaps(a: { start: number; end: number }, b: { start: number; end: number }) {
  return a.start < b.end && b.start < a.end;
}
