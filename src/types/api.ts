/**
 * Shapes exchanged between our API routes and the browser.
 * Shared by server and client — types only, no runtime code.
 */

export type BroadcasterType = "partner" | "affiliate" | "none";
export type AccountType = "staff" | "admin" | "global_mod" | "none";

export type Follower = {
  id: string;
  login: string;
  displayName: string;
  /** ISO date */
  followedAt: string;
  /** ISO date; null if the account no longer exists */
  createdAt: string | null;
  broadcasterType: BroadcasterType;
  accountType: AccountType;
  /** Small (70x70) profile image URL */
  avatarUrl: string | null;
  isDefaultAvatar: boolean;
  /** Profile has a bio. Only this flag is sent, never the bio text. */
  hasBio: boolean;
  isSubscriber: boolean;
  isBanned: boolean;
  isModerator: boolean;
  isVip: boolean;
};

export type DataSource = "subscriptions" | "banned" | "moderators" | "vips";

export type FollowersResponse = {
  followers: Follower[];
  total: number;
  truncated: boolean;
  /** Extra data sources that failed or don't apply (e.g. subs for non-affiliates). */
  unavailable: DataSource[];
};

export type RemoveAction = "remove" | "unblock";

export type RemoveItemResult = {
  id: string;
  status: "removed" | "block_failed" | "unblock_failed";
};

export type RemoveResponse = { results: RemoveItemResult[] };

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden_origin"
  | "rate_limited"
  | "bad_request"
  | "twitch_error"
  | "server_error";

export type ApiError = { error: { code: ApiErrorCode } };
