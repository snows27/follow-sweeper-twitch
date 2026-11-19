import type { AccountType, BroadcasterType, Follower } from "@/types/api";

/** A follower with parsed dates, ready for filtering, sorting and display. */
export type FollowerItem = Follower & {
  followedAtMs: number;
  createdAtMs: number | null;
};

export type TriState = "any" | "yes" | "no";
export type AvatarFilter = "any" | "default" | "custom";

export type FilterState = {
  query: string;
  /** Empty array = any. */
  broadcasterTypes: BroadcasterType[];
  accountTypes: AccountType[];
  subscriber: TriState;
  banned: TriState;
  avatar: AvatarFilter;
};

export type SortColumn = "name" | "followedAt" | "createdAt";
export type SortDirection = "asc" | "desc";
export type SortState = { column: SortColumn; direction: SortDirection };
