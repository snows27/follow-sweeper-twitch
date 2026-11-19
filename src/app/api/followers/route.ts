import { withAuth } from "@/server/auth/guard";
import { loadFollowers } from "@/server/followers/load-followers";
import { rateLimit } from "@/server/security/rate-limit";
import { apiError, json } from "@/server/http";

/** GET /api/followers — the logged-in broadcaster's followers, enriched. */
export const GET = withAuth(async (_request, ctx) => {
  if (!rateLimit(`followers:${ctx.user.id}`, 10, 60_000)) return apiError("rate_limited");
  return json(await loadFollowers(ctx));
});
