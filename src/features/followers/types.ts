import type { AccountType, BroadcasterType, Follower } from "@/types/api";

/** A follower with parsed dates, ready for filtering, sorting and display. */
export type FollowerItem = Follower & {
  followedAtMs: number;
  createdAtMs: number | null;
};

export type TriState = "any" | "yes" | "no";
export type AvatarFilter = "any" | "default" | "custom";
export type BioFilter = "any" | "empty" | "filled";
/** Account was at most this old when it followed. */
export type AgeAtFollow = "any" | "1h" | "1d" | "7d" | "30d";
/** Followed inside [start, end) — picked from the follow-time chart. */
export type FollowWindow = { start: number; end: number };

export type FilterState = {
  query: string;
  /** Empty array = any. */
  broadcasterTypes: BroadcasterType[];
  accountTypes: AccountType[];
  subscriber: TriState;
  banned: TriState;
  avatar: AvatarFilter;
  bio: BioFilter;
  ageAtFollow: AgeAtFollow;
  followWindow: FollowWindow | null;
};

export type SortColumn = "name" | "followedAt" | "createdAt";
export type SortDirection = "asc" | "desc";
export type SortState = { column: SortColumn; direction: SortDirection };
