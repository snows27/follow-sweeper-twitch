import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/server/auth/session";
import { clearAuthHint } from "@/server/auth/auth-hint";
import { revokeToken } from "@/server/auth/oauth";
import { apiError, isSameOrigin } from "@/server/http";
import { getEnv } from "@/lib/env";
import { defaultLocale, hasLocale } from "@/i18n/config";

/** POST only (a GET logout could be triggered by any site via an <img> tag). */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return apiError("forbidden_origin");

  const form = await request.formData().catch(() => null);
  const localeValue = form?.get("locale");
  const locale =
    typeof localeValue === "string" && hasLocale(localeValue) ? localeValue : defaultLocale;

  const session = await getSession();
  if (session.tokens) await revokeToken(session.tokens.accessToken);
  session.destroy();
  await clearAuthHint();

  // 303 so the browser follows with GET.
  return NextResponse.redirect(`${getEnv().APP_URL}/${locale}`, 303);
}
