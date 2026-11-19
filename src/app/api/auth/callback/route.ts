import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/server/auth/session";
import { setAuthHint } from "@/server/auth/auth-hint";
import { exchangeCode, revokeToken } from "@/server/auth/oauth";
import { missingScopes } from "@/server/auth/scopes";
import { getTokenUser } from "@/server/twitch/endpoints";
import { safeEqual } from "@/server/security/random";
import { getEnv } from "@/lib/env";
import { defaultLocale } from "@/i18n/config";

const STATE_MAX_AGE_MS = 10 * 60 * 1000;

/** Step 2 of login: Twitch sends the user back here with `code` + `state`. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const session = await getSession();
  const pending = session.oauth;
  const locale = pending?.locale ?? defaultLocale;
  const appUrl = getEnv().APP_URL;

  const fail = (error: string) => {
    session.oauth = undefined;
    return session.save().then(() =>
      NextResponse.redirect(`${appUrl}/${locale}?error=${error}`),
    );
  };

  if (params.get("error")) return fail("access_denied");

  const code = params.get("code");
  const state = params.get("state");
  if (
    !pending ||
    !code ||
    !state ||
    Date.now() - pending.createdAt > STATE_MAX_AGE_MS ||
    !safeEqual(state, pending.state)
  ) {
    return fail("state_mismatch");
  }

  let tokens;
  try {
    tokens = await exchangeCode(code);
  } catch {
    return fail("token_exchange");
  }

  if (missingScopes(tokens.scopes).length > 0) {
    await revokeToken(tokens.accessToken);
    return fail("missing_scopes");
  }

  let user;
  try {
    user = await getTokenUser(tokens.accessToken);
  } catch {
    return fail("unknown");
  }

  session.oauth = undefined;
  session.tokens = tokens;
  session.user = {
    id: user.id,
    login: user.login,
    displayName: user.display_name,
    profileImageUrl: user.profile_image_url,
    broadcasterType: user.broadcaster_type,
  };
  await session.save();
  await setAuthHint();

  return NextResponse.redirect(`${appUrl}${pending.returnTo}`);
}
