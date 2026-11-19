import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { AUTH_HINT_COOKIE, LOCALE_COOKIE, SESSION_COOKIE } from "@/lib/constants";

/** Pages that need a login. Real enforcement also happens in every page and API route. */
const PROTECTED = ["/dashboard", "/followers"];

function preferredLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(fromCookie)) return fromCookie;

  const accept = request.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const lang = part.split(";")[0]?.trim().toLowerCase().slice(0, 2);
    if (hasLocale(lang)) return lang;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segment = pathname.split("/")[1];

  // 1. No locale in the URL -> redirect to the preferred one.
  if (!hasLocale(segment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Optimistic checks only — the session itself is verified on the server for every page and API call.
  const loggedIn = request.cookies.has(AUTH_HINT_COOKIE) && request.cookies.has(SESSION_COOKIE);
  const rest = pathname.slice(segment.length + 1);

  // 2. Logged in and opening the landing page (e.g. clicking the logo) -> straight to the app.
  //    Skipped when there's an ?error, so an expired session can always show its message.
  if (rest === "" && loggedIn && !request.nextUrl.searchParams.has("error")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${segment}/followers`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 3. Protected page while logged out -> landing page (then back here after login).
  const isProtected = PROTECTED.some((p) => rest === p || rest.startsWith(`${p}/`));
  if (isProtected && !loggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = `/${segment}`;
    url.search = `?returnTo=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals and files with an extension (icons, images…).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
