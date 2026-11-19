import "server-only";
import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { getSession, type SessionUser } from "./session";
import { refreshTokens } from "./oauth";
import { clearAuthHint } from "./auth-hint";
import { TwitchApiError } from "@/server/twitch/client";
import { apiError, isSameOrigin } from "@/server/http";
import type { Locale } from "@/i18n/config";

/**
 * Data Access Layer for auth. Every page and API route goes through
 * one of these — never read the session directly elsewhere.
 */

/**
 * For Server Components: the logged-in user, or null. Never exposes tokens.
 *
 * `use cache: private` is required with Cache Components: unsealing the cookie
 * checks its expiry against the current time, which isn't allowed while
 * prerendering. A private cache runs at request time and is kept only in the
 * user's browser (keyed by their cookies) — never shared on the server.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  "use cache: private";
  cacheLife("minutes");
  const session = await getSession();
  return session.user && session.tokens ? session.user : null;
}

/**
 * For Server Components on protected pages. If logged out or expired, go through
 * /api/auth/expired, which clears the cookies (pages can't) and shows the login page.
 */
export async function requireUser(locale: Locale, returnTo?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const q = new URLSearchParams({ locale });
    if (returnTo) q.set("returnTo", returnTo);
    redirect(`/api/auth/expired?${q.toString()}`);
  }
  return user;
}

export type ApiContext = { user: SessionUser; accessToken: string };

/**
 * Wrap a Route Handler so it only runs for a logged-in user.
 * - Rejects cross-site requests for anything other than GET.
 * - Refreshes the Twitch token when it's about to expire.
 * - Logs the user out if Twitch says the token is no longer valid.
 * The broadcaster id always comes from the session, never from the request.
 */
export function withAuth(
  handler: (request: NextRequest, ctx: ApiContext) => Promise<Response>,
) {
  return async (request: NextRequest): Promise<Response> => {
    await connection(); // always run at request time, never prerendered
    try {
      return await authorize(request, handler);
    } catch (err) {
      // e.g. missing environment variables — never leak details to the client.
      console.error("[api] request failed", err instanceof Error ? err.message : err);
      return apiError("server_error");
    }
  };
}

async function authorize(
  request: NextRequest,
  handler: (request: NextRequest, ctx: ApiContext) => Promise<Response>,
): Promise<Response> {
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return apiError("forbidden_origin");
  }

  const session = await getSession();
  if (!session.user || !session.tokens) return apiError("unauthorized");

  if (Date.now() >= session.tokens.expiresAt) {
    try {
      session.tokens = await refreshTokens(session.tokens.refreshToken);
      await session.save();
    } catch {
      session.destroy();
      await clearAuthHint();
      return apiError("unauthorized");
    }
  }

  try {
    return await handler(request, {
      user: session.user,
      accessToken: session.tokens.accessToken,
    });
  } catch (err) {
    if (err instanceof TwitchApiError && err.status === 401) {
      session.destroy();
      await clearAuthHint();
      return apiError("unauthorized");
    }
    if (err instanceof TwitchApiError) {
      console.error(`[twitch] ${err.status} ${err.message}`);
      return apiError(err.status === 429 ? "rate_limited" : "twitch_error");
    }
    throw err;
  }
}
