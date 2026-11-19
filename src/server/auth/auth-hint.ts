import "server-only";
import { cookies } from "next/headers";
import { AUTH_HINT_COOKIE } from "@/lib/constants";

/** Mark the browser as logged in (Route Handlers only). */
export async function setAuthHint() {
  (await cookies()).set(AUTH_HINT_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // same lifetime as the session
  });
}

/** Clear the logged-in hint (Route Handlers only). */
export async function clearAuthHint() {
  (await cookies()).delete(AUTH_HINT_COOKIE);
}
