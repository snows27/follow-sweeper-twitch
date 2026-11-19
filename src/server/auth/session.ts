import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { getEnv } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/constants";
import type { Locale } from "@/i18n/config";

/** Public profile of the logged-in broadcaster. Safe to send to the client. */
export type SessionUser = {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
  broadcasterType: "partner" | "affiliate" | "";
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms when the access token expires. */
  expiresAt: number;
  scopes: string[];
};

export type SessionData = {
  user?: SessionUser;
  tokens?: SessionTokens;
  /** Short-lived values used only during the OAuth round-trip. */
  oauth?: { state: string; returnTo: string; locale: Locale; createdAt: number };
};

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function sessionOptions(): SessionOptions {
  return {
    password: getEnv().SESSION_SECRET,
    cookieName: SESSION_COOKIE,
    ttl: THIRTY_DAYS,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

/**
 * Encrypted session stored in an httpOnly cookie.
 * Can be read anywhere on the server; `.save()` / `.destroy()` only work
 * in Route Handlers and Server Actions.
 */
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}
