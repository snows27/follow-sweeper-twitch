import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import type { ApiError, ApiErrorCode } from "@/types/api";

const NO_STORE = { "Cache-Control": "no-store" };

export function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

const statusFor: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  forbidden_origin: 403,
  rate_limited: 429,
  bad_request: 400,
  twitch_error: 502,
  server_error: 500,
};

export function apiError(code: ApiErrorCode) {
  return json<ApiError>({ error: { code } }, statusFor[code]);
}

/**
 * CSRF defence for state-changing requests: the browser always sends
 * `Origin` on POST, and it must be our own site.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(getEnv().APP_URL).origin;
}
