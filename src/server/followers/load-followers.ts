import "server-only";
import { MAX_FOLLOWERS } from "@/lib/constants";
import { TwitchApiError } from "@/server/twitch/client";
import {
  getBannedIds,
  getFollowers,
  getModeratorIds,
  getSubscriberIds,
  getUsersByIds,
  getVipIds,
} from "@/server/twitch/endpoints";
import type { ApiContext } from "@/server/auth/guard";
import type { HelixUser } from "@/types/twitch";
import type { AccountType, DataSource, Follower, FollowersResponse } from "@/types/api";

/** Optional data: a failure (e.g. no subs for non-affiliates) shouldn't break the page. */
async function optional(source: DataSource, load: () => Promise<Set<string>>) {
  try {
    return { source, ids: await load() };
  } catch (err) {
    if (err instanceof TwitchApiError && err.status === 401) throw err;
    return { source, ids: null };
  }
}

const smallAvatar = (url: string) => url.replace(/-\d+x\d+\.(png|jpe?g|webp)$/i, "-70x70.$1");

/** Load every follower and enrich it with profile + channel-relationship data. */
export async function loadFollowers({ user, accessToken }: ApiContext): Promise<FollowersResponse> {
  const { items, total, truncated } = await getFollowers(accessToken, user.id, MAX_FOLLOWERS);
  const ids = items.map((f) => f.user_id);

  const [profiles, ...extras] = await Promise.all([
    getUsersByIds(accessToken, ids),
    optional("subscriptions", () =>
      user.broadcasterType
        ? getSubscriberIds(accessToken, user.id)
        : Promise.reject(new Error("not affiliate")),
    ),
    optional("banned", () => getBannedIds(accessToken, user.id)),
    optional("moderators", () => getModeratorIds(accessToken, user.id)),
    optional("vips", () => getVipIds(accessToken, user.id)),
  ]);

  const byId = new Map<string, HelixUser>(profiles.map((p) => [p.id, p]));
  const sets = Object.fromEntries(extras.map((e) => [e.source, e.ids])) as Record<
    DataSource,
    Set<string> | null
  >;
  const has = (source: DataSource, id: string) => sets[source]?.has(id) ?? false;

  const followers: Follower[] = items.map((f) => {
    const p = byId.get(f.user_id);
    return {
      id: f.user_id,
      login: f.user_login,
      displayName: f.user_name,
      followedAt: f.followed_at,
      createdAt: p?.created_at ?? null,
      broadcasterType: p?.broadcaster_type || "none",
      accountType: (p?.type || "none") as AccountType,
      avatarUrl: p?.profile_image_url ? smallAvatar(p.profile_image_url) : null,
      isDefaultAvatar: !p?.profile_image_url || p.profile_image_url.includes("user-default-pictures"),
      hasBio: Boolean(p?.description?.trim()),
      isSubscriber: has("subscriptions", f.user_id),
      isBanned: has("banned", f.user_id),
      isModerator: has("moderators", f.user_id),
      isVip: has("vips", f.user_id),
    };
  });

  return {
    followers,
    total: total ?? followers.length,
    truncated,
    unavailable: extras.filter((e) => e.ids === null).map((e) => e.source),
  };
}
