import "server-only";
import { helix, helixPaginate } from "./client";
import { mapWithConcurrency } from "@/lib/async";
import type { HelixFollower, HelixPage, HelixUser, HelixUserRef } from "@/types/twitch";

/**
 * Thin, typed wrappers around the Helix endpoints FollowSweep uses.
 * Each one maps to a single Twitch API reference page.
 */

/** The user who owns the token. */
export async function getTokenUser(accessToken: string): Promise<HelixUser> {
  const page = await helix<HelixPage<HelixUser>>("/users", { accessToken });
  const user = page?.data[0];
  if (!user) throw new Error("Twitch returned no user for this token");
  return user;
}

/** Full profiles for any number of ids (100 per request, 4 requests in parallel). */
export async function getUsersByIds(accessToken: string, ids: string[]): Promise<HelixUser[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100));
  const pages = await mapWithConcurrency(chunks, 4, (chunk) =>
    helix<HelixPage<HelixUser>>("/users", { accessToken, query: { id: chunk } }),
  );
  return pages.flatMap((page) => page?.data ?? []);
}

/** Scope: moderator:read:followers */
export function getFollowers(accessToken: string, broadcasterId: string, max: number) {
  return helixPaginate<HelixFollower>("/channels/followers", {
    accessToken,
    query: { broadcaster_id: broadcasterId },
    max,
  });
}

/** Scope: channel:read:subscriptions (Affiliates/Partners only). */
export async function getSubscriberIds(accessToken: string, broadcasterId: string) {
  const { items } = await helixPaginate<HelixUserRef>("/subscriptions", {
    accessToken,
    query: { broadcaster_id: broadcasterId },
  });
  return new Set(items.map((s) => s.user_id));
}

/** Scope: moderation:read */
export async function getBannedIds(accessToken: string, broadcasterId: string) {
  const { items } = await helixPaginate<HelixUserRef>("/moderation/banned", {
    accessToken,
    query: { broadcaster_id: broadcasterId },
  });
  return new Set(items.map((b) => b.user_id));
}

/** Scope: moderation:read */
export async function getModeratorIds(accessToken: string, broadcasterId: string) {
  const { items } = await helixPaginate<HelixUserRef>("/moderation/moderators", {
    accessToken,
    query: { broadcaster_id: broadcasterId },
  });
  return new Set(items.map((m) => m.user_id));
}

/** Scope: channel:read:vips */
export async function getVipIds(accessToken: string, broadcasterId: string) {
  const { items } = await helixPaginate<HelixUserRef>("/channels/vips", {
    accessToken,
    query: { broadcaster_id: broadcasterId },
  });
  return new Set(items.map((v) => v.user_id));
}

/** Scope: user:manage:blocked_users. Blocking forces the account to unfollow. */
export async function blockUser(accessToken: string, targetUserId: string) {
  await helix("/users/blocks", {
    accessToken,
    method: "PUT",
    query: { target_user_id: targetUserId },
  });
}

/** Scope: user:manage:blocked_users */
export async function unblockUser(accessToken: string, targetUserId: string) {
  await helix("/users/blocks", {
    accessToken,
    method: "DELETE",
    query: { target_user_id: targetUserId },
  });
}
