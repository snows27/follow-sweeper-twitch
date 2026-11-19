import { describe, expect, it } from "vitest";
import { prepareFollowers } from "@/features/followers/lib/prepare";
import {
  activeFilterCount,
  applyFilters,
  defaultFilters,
  defaultSort,
  nextSort,
  sortFollowers,
} from "@/features/followers/lib/filters";
import type { Follower } from "@/types/api";

const base: Omit<Follower, "id" | "login" | "displayName"> = {
  followedAt: "2026-11-10T10:00:00Z",
  createdAt: "2020-01-01T00:00:00Z",
  broadcasterType: "none",
  accountType: "none",
  avatarUrl: null,
  isDefaultAvatar: false,
  isSubscriber: false,
  isBanned: false,
  isModerator: false,
  isVip: false,
};

const followers = prepareFollowers([
  { ...base, id: "1", login: "alice", displayName: "Alice", followedAt: "2026-11-12T10:00:00Z" },
  { ...base, id: "2", login: "bob48213", displayName: "bob48213", isDefaultAvatar: true, createdAt: "2026-11-09T10:00:00Z" },
  { ...base, id: "3", login: "carol", displayName: "Carol", isSubscriber: true, followedAt: "2026-11-01T10:00:00Z" },
  { ...base, id: "4", login: "dave", displayName: "Dave", isBanned: true, broadcasterType: "affiliate", accountType: "staff", createdAt: null },
]);
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe("applyFilters", () => {
  it("returns everything with default filters", () => {
    expect(applyFilters(followers, defaultFilters)).toHaveLength(4);
  });

  it("searches login and display name, case-insensitive", () => {
    expect(ids(applyFilters(followers, { ...defaultFilters, query: "AL" }))).toEqual(["1"]);
    expect(ids(applyFilters(followers, { ...defaultFilters, query: "482" }))).toEqual(["2"]);
  });

  it("filters by broadcaster and account type", () => {
    expect(ids(applyFilters(followers, { ...defaultFilters, broadcasterTypes: ["affiliate"] }))).toEqual(["4"]);
    expect(ids(applyFilters(followers, { ...defaultFilters, accountTypes: ["none"] }))).toEqual(["1", "2", "3"]);
  });

  it("filters by subscriber, banned and avatar", () => {
    expect(ids(applyFilters(followers, { ...defaultFilters, subscriber: "yes" }))).toEqual(["3"]);
    expect(ids(applyFilters(followers, { ...defaultFilters, banned: "no" }))).toEqual(["1", "2", "3"]);
    expect(ids(applyFilters(followers, { ...defaultFilters, avatar: "default" }))).toEqual(["2"]);
  });
});

describe("sorting", () => {
  it("defaults to newest follows first", () => {
    expect(ids(sortFollowers(followers, defaultSort))).toEqual(["1", "2", "4", "3"]);
  });

  it("sorts by name and creation date", () => {
    expect(ids(sortFollowers(followers, { column: "name", direction: "asc" }))).toEqual(["1", "2", "3", "4"]);
    // Deleted account (no date) goes last when ascending.
    expect(ids(sortFollowers(followers, { column: "createdAt", direction: "asc" })).at(-1)).toBe("4");
  });

  it("clicking the same column flips direction; a new column starts at its natural order", () => {
    expect(nextSort(defaultSort, "followedAt")).toEqual({ column: "followedAt", direction: "asc" });
    expect(nextSort(defaultSort, "name")).toEqual({ column: "name", direction: "asc" });
    expect(nextSort(defaultSort, "createdAt")).toEqual({ column: "createdAt", direction: "desc" });
  });
});

describe("activeFilterCount", () => {
  it("counts filters that differ from the defaults", () => {
    expect(activeFilterCount(defaultFilters)).toBe(0);
    expect(activeFilterCount({ ...defaultFilters, query: "x", banned: "yes" })).toBe(2);
  });
});
