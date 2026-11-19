import { describe, expect, it } from "vitest";
import { ageParts, agoParts } from "@/features/followers/lib/age";

const DAY = 86_400_000;
const NOW = Date.parse("2026-11-20T12:00:00Z");

describe("ageParts", () => {
  it("uses a readable unit", () => {
    expect(ageParts(0.4)).toEqual({ unit: "lessThanDay" });
    expect(ageParts(12.9)).toEqual({ unit: "days", days: 12 });
    expect(ageParts(95)).toEqual({ unit: "months", months: 3 });
    expect(ageParts(2452)).toEqual({ unit: "years", years: 6, months: 8 });
    expect(ageParts(365.25)).toEqual({ unit: "years", years: 1, months: 0 });
  });
});

describe("agoParts", () => {
  it("a follow from yesterday reads as 1 day ago, not the account's age", () => {
    expect(agoParts(NOW - 1.2 * DAY, NOW)).toEqual({ unit: "days", days: 1 });
    expect(agoParts(NOW - 2 * 3600_000, NOW)).toEqual({ unit: "lessThanDay" });
  });

  it("an account created ~4 years 3 months ago", () => {
    const created = Date.parse("2022-08-10T00:00:00Z");
    expect(agoParts(created, NOW)).toEqual({ unit: "years", years: 4, months: 3 });
  });

  it("never goes negative for clock skew", () => {
    expect(agoParts(NOW + DAY, NOW)).toEqual({ unit: "lessThanDay" });
  });
});
