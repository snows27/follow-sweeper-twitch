import type { FollowerItem } from "../types";

export type RemovePlan = {
  /** Accounts the Remove button will remove: every ticked account that still exists. */
  remove: string[];
  /** Ticked accounts currently hidden by filters (they are still removed). */
  hiddenSelected: number;
};

export function planRemoval(
  shown: FollowerItem[],
  selected: Set<string>,
  allIds: Set<string>,
): RemovePlan {
  const remove = [...selected].filter((id) => allIds.has(id));
  const shownIds = new Set(shown.map((f) => f.id));
  return { remove, hiddenSelected: remove.filter((id) => !shownIds.has(id)).length };
}
