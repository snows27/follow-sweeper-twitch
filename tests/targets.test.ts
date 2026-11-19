import { describe, expect, it } from "vitest";
import { planRemoval } from "@/features/followers/lib/targets";
import type { FollowerItem } from "@/features/followers/types";

const item = (id: string) => ({ id }) as FollowerItem;
const all = ["1", "2", "3", "4", "5"].map(item);
const allIds = new Set(all.map((f) => f.id));

describe("planRemoval", () => {
  it("removes exactly the ticked accounts", () => {
    const plan = planRemoval(all, new Set(["2", "4"]), allIds);
    expect(plan.remove).toEqual(["2", "4"]);
    expect(plan.hiddenSelected).toBe(0);
  });

  it("still removes ticked accounts hidden by a filter, and counts them", () => {
    const shown = [item("1"), item("2")]; // filter hides 3,4,5
    const plan = planRemoval(shown, new Set(["2", "4"]), allIds);
    expect(plan.remove).toEqual(["2", "4"]);
    expect(plan.hiddenSelected).toBe(1);
  });

  it("ignores ticks for accounts that no longer exist", () => {
    expect(planRemoval(all, new Set(["9"]), allIds).remove).toEqual([]);
  });
});
