import { describe, expect, it } from "vitest";
import { BURST_MIN_COUNT, HOUR_MS, dailyCounts, findBursts } from "@/features/followers/lib/spikes";

const H0 = Date.UTC(2026, 10, 20, 10); // an hour boundary
const at = (hour: number, n: number) => Array.from({ length: n }, (_, i) => H0 + hour * HOUR_MS + i * 1000);
/** A normal channel: one follow every few hours, before the tested hours. */
const quiet = Array.from({ length: 40 }, (_, i) => H0 - (i + 1) * 3 * HOUR_MS);

describe("findBursts", () => {
  it("finds nothing in a quiet channel", () => {
    expect(findBursts(quiet)).toEqual([]);
  });

  it("needs at least the minimum count, even when the usual hour is tiny", () => {
    expect(findBursts([...quiet, ...at(0, BURST_MIN_COUNT - 1)])).toEqual([]);
    expect(findBursts([...quiet, ...at(0, BURST_MIN_COUNT)])).toEqual([
      { start: H0, end: H0 + HOUR_MS, count: BURST_MIN_COUNT },
    ]);
  });

  it("merges busy hours next to each other and sorts biggest first", () => {
    const times = [...quiet, ...at(0, 30), ...at(1, 20), ...at(10, 40), ...at(20, 1), ...at(30, 2)];
    expect(findBursts(times)).toEqual([
      { start: H0, end: H0 + 2 * HOUR_MS, count: 50 },
      { start: H0 + 10 * HOUR_MS, end: H0 + 11 * HOUR_MS, count: 40 },
    ]);
  });

  it("scales the bar with the channel's usual hour", () => {
    // Usual hour = 4 follows, so 12 in one hour is normal for this channel (below 4 × 5).
    const busyChannel = [...Array.from({ length: 40 }, (_, h) => at(h * 2, 4)).flat(), ...at(100, 12)];
    expect(findBursts(busyChannel)).toEqual([]);
  });
});

describe("dailyCounts", () => {
  it("returns one bucket per day, oldest first, ending today", () => {
    const now = new Date(2026, 10, 26, 15).getTime();
    const days = dailyCounts([now, now - 1000, new Date(2026, 10, 25, 1).getTime(), 0], now, 3);
    expect(days.map((d) => d.count)).toEqual([0, 1, 2]);
    expect(days[2].start).toBe(new Date(2026, 10, 26).getTime());
    expect(days[0].end).toBe(days[1].start);
  });
});
