import type { Follower } from "@/types/api";
import type { FollowerItem } from "../types";

/** Parse dates once so filtering and sorting stay fast on large lists. */
export function prepareFollowers(followers: Follower[]): FollowerItem[] {
  return followers.map((f) => ({
    ...f,
    followedAtMs: Date.parse(f.followedAt),
    createdAtMs: f.createdAt ? Date.parse(f.createdAt) : null,
  }));
}
