import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/server/auth/session";
import { buildAuthorizeUrl } from "@/server/auth/oauth";
import { randomToken, safeReturnPath } from "@/server/security/random";
import { getEnv } from "@/lib/env";
import { defaultLocale, hasLocale } from "@/i18n/config";

/** Step 1 of login: remember a random `state`, then send the user to Twitch. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const localeParam = params.get("locale");
  const locale = hasLocale(localeParam) ? localeParam : defaultLocale;

  try {
    getEnv();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return NextResponse.redirect(new URL(`/${locale}?error=config`, request.url));
  }

  const session = await getSession();
  const state = randomToken();
  session.oauth = {
    state,
    locale,
    returnTo: safeReturnPath(params.get("returnTo"), `/${locale}/followers`),
    createdAt: Date.now(),
  };
  await session.save();

  const res = NextResponse.redirect(buildAuthorizeUrl(state));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
