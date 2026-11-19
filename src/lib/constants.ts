export const APP_NAME = "FollowSweep";
export const APP_TAGLINE = "follower tools for Twitch";

/** Cookie that remembers the visitor's chosen language. Not sensitive. */
export const LOCALE_COOKIE = "fs_locale";

/** Encrypted session cookie (iron-session). httpOnly, never readable by JS. */
export const SESSION_COOKIE = "fs_session";

/**
 * "Logged in" hint for the proxy (value "1", no secrets). Set on login, cleared on
 * logout / expiry. Only used to skip the landing page — real auth is always
 * verified on the server from the session cookie.
 */
export const AUTH_HINT_COOKIE = "fs_auth";

/** Max followers removed per API request. Small so each request finishes quickly. */
export const REMOVE_BATCH_SIZE = 10;

/** Safety cap on how many followers we load for one channel. */
export const MAX_FOLLOWERS = 50_000;
