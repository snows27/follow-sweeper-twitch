import type { AgeAtFollow, FilterState, FollowerItem, SortColumn, SortState } from "../types";

export const defaultFilters: FilterState = {
  query: "",
  broadcasterTypes: [],
  accountTypes: [],
  subscriber: "any",
  banned: "any",
  avatar: "any",
  bio: "any",
  ageAtFollow: "any",
  followWindow: null,
};

const HOUR_MS = 3_600_000;
export const AGE_AT_FOLLOW_MS: Record<Exclude<AgeAtFollow, "any">, number> = {
  "1h": HOUR_MS,
  "1d": 24 * HOUR_MS,
  "7d": 7 * 24 * HOUR_MS,
  "30d": 30 * 24 * HOUR_MS,
};

/** How old the account was when it followed; null for deleted accounts. */
export function ageAtFollowMs(x: FollowerItem): number | null {
  return x.createdAtMs === null ? null : Math.max(0, x.followedAtMs - x.createdAtMs);
}

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
    if (f.bio !== "any" && (f.bio === "filled") !== x.hasBio) return false;
    if (f.ageAtFollow !== "any") {
      const age = ageAtFollowMs(x);
      if (age === null || age > AGE_AT_FOLLOW_MS[f.ageAtFollow]) return false;
    }
    if (f.followWindow && (x.followedAtMs < f.followWindow.start || x.followedAtMs >= f.followWindow.end)) {
      return false;
    }
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
    f.bio !== "any",
    f.ageAtFollow !== "any",
    f.followWindow !== null,
  ].filter(Boolean).length;
}
