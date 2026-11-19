import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/server/auth/session";
import { clearAuthHint } from "@/server/auth/auth-hint";
import { safeReturnPath } from "@/server/security/random";
import { defaultLocale, hasLocale } from "@/i18n/config";

/**
 * A page found the session missing or expired. Pages can't change cookies,
 * so they redirect here: clear the session + logged-in hint, then go to the
 * landing page with a message. Clearing the hint prevents a redirect loop.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const localeParam = params.get("locale");
  const locale = hasLocale(localeParam) ? localeParam : defaultLocale;

  const session = await getSession();
  session.destroy();
  await clearAuthHint();

  const url = new URL(`/${locale}`, request.url);
  url.searchParams.set("error", "session_expired");
  const returnTo = safeReturnPath(params.get("returnTo"), "");
  if (returnTo) url.searchParams.set("returnTo", returnTo);

  const res = NextResponse.redirect(url);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
