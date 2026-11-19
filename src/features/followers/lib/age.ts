export type AgeParts =
  | { unit: "lessThanDay" }
  | { unit: "days"; days: number }
  | { unit: "months"; months: number }
  | { unit: "years"; years: number; months: number };

const DAY_MS = 86_400_000;

/**
 * Turn a fractional number of days into a human-sized unit:
 * 0.4 -> "<1 day", 12 -> "12 days", 95 -> "3 months", 2452 -> "6 years 8 months".
 */
export function ageParts(days: number): AgeParts {
  if (days < 1) return { unit: "lessThanDay" };
  if (days < 31) return { unit: "days", days: Math.floor(days) };
  const totalMonths = Math.floor(days / 30.4375); // average month length
  if (totalMonths < 12) return { unit: "months", months: totalMonths };
  return { unit: "years", years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
}

/** How long ago `ms` was, relative to `now`. */
export function agoParts(ms: number, now: number): AgeParts {
  return ageParts(Math.max(0, now - ms) / DAY_MS);
}
