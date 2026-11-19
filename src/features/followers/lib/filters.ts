import type { FilterState, FollowerItem, SortColumn, SortState } from "../types";

export const defaultFilters: FilterState = {
  query: "",
  broadcasterTypes: [],
  accountTypes: [],
  subscriber: "any",
  banned: "any",
  avatar: "any",
};

export const defaultSort: SortState = { column: "followedAt", direction: "desc" };

function matchTri(state: FilterState["subscriber"], value: boolean) {
  return state === "any" || (state === "yes") === value;
}

export function applyFilters(followers: FollowerItem[], f: FilterState): FollowerItem[] {
  const needle = f.query.trim().toLowerCase();

  return followers.filter((x) => {
    if (needle && !x.login.includes(needle) && !x.displayName.toLowerCase().includes(needle)) {
      return false;
    }
    if (f.broadcasterTypes.length && !f.broadcasterTypes.includes(x.broadcasterType)) return false;
    if (f.accountTypes.length && !f.accountTypes.includes(x.accountType)) return false;
    if (!matchTri(f.subscriber, x.isSubscriber)) return false;
    if (!matchTri(f.banned, x.isBanned)) return false;
    if (f.avatar !== "any" && (f.avatar === "default") !== x.isDefaultAvatar) return false;
    return true;
  });
}

const compare: Record<SortColumn, (a: FollowerItem, b: FollowerItem) => number> = {
  name: (a, b) => a.login.localeCompare(b.login),
  followedAt: (a, b) => a.followedAtMs - b.followedAtMs,
  // Deleted accounts (no creation date) sort last when ascending.
  createdAt: (a, b) => (a.createdAtMs ?? Infinity) - (b.createdAtMs ?? Infinity),
};

export function sortFollowers(items: FollowerItem[], sort: SortState): FollowerItem[] {
  const cmp = compare[sort.column];
  const sign = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => sign * cmp(a, b) || a.id.localeCompare(b.id));
}

/** Click a column header: same column flips direction, a new column starts at its natural order. */
export function nextSort(current: SortState, column: SortColumn): SortState {
  if (current.column === column) {
    return { column, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { column, direction: column === "name" ? "asc" : "desc" };
}

/** Number of filters actually narrowing the list (a mode alone doesn't count). */
export function activeFilterCount(f: FilterState): number {
  return [
    f.query.trim() !== "",
    f.broadcasterTypes.length > 0,
    f.accountTypes.length > 0,
    f.subscriber !== "any",
    f.banned !== "any",
    f.avatar !== "any",
  ].filter(Boolean).length;
}
