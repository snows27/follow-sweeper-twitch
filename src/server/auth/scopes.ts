/**
 * Twitch OAuth scopes requested at login. Keep this list minimal —
 * every scope is explained to the user on the landing page.
 */
export const REQUIRED_SCOPES = [
  "moderator:read:followers",
  "user:manage:blocked_users",
  "channel:read:subscriptions",
  "moderation:read",
  "channel:read:vips",
] as const;

export type Scope = (typeof REQUIRED_SCOPES)[number];

export function missingScopes(granted: readonly string[]): Scope[] {
  return REQUIRED_SCOPES.filter((s) => !granted.includes(s));
}
