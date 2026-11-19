import "server-only";
import { z } from "zod";
import { getEnv } from "@/lib/env";
import { REQUIRED_SCOPES } from "./scopes";
import type { SessionTokens } from "./session";

const AUTH_BASE = "https://id.twitch.tv/oauth2";

export function redirectUri(): string {
  return `${getEnv().APP_URL}/api/auth/callback`;
}

export function buildAuthorizeUrl(state: string): string {
  const { TWITCH_CLIENT_ID } = getEnv();
  const url = new URL(`${AUTH_BASE}/authorize`);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: TWITCH_CLIENT_ID,
    redirect_uri: redirectUri(),
    scope: REQUIRED_SCOPES.join(" "),
    state,
  }).toString();
  return url.toString();
}

const tokenResponse = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number(),
  scope: z.array(z.string()).default([]),
});

async function postToken(params: Record<string, string>): Promise<SessionTokens> {
  const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = getEnv();
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      ...params,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new OAuthError(`Token endpoint returned ${res.status}`);
  const data = tokenResponse.parse(await res.json());
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    // Renew a minute early so a token never expires mid-request.
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    scopes: data.scope,
  };
}

export function exchangeCode(code: string) {
  return postToken({ code, grant_type: "authorization_code", redirect_uri: redirectUri() });
}

export function refreshTokens(refreshToken: string) {
  return postToken({ refresh_token: refreshToken, grant_type: "refresh_token" });
}

/** Revoke the token on Twitch. Best effort: logout must never fail because of this. */
export async function revokeToken(token: string): Promise<void> {
  try {
    await fetch(`${AUTH_BASE}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: getEnv().TWITCH_CLIENT_ID, token }),
      cache: "no-store",
    });
  } catch {
    // ignore
  }
}

export class OAuthError extends Error {
  name = "OAuthError";
}
