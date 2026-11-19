import { z } from "zod";
import { withAuth } from "@/server/auth/guard";
import { removeFollowers } from "@/server/followers/remove-followers";
import { rateLimit } from "@/server/security/rate-limit";
import { apiError, json } from "@/server/http";
import { REMOVE_BATCH_SIZE } from "@/lib/constants";
import type { RemoveResponse } from "@/types/api";

const bodySchema = z.object({
  ids: z
    .array(z.string().regex(/^\d{1,20}$/))
    .min(1)
    .max(REMOVE_BATCH_SIZE),
  action: z.enum(["remove", "unblock"]).default("remove"),
});

/** POST /api/followers/remove — remove one small batch of followers. */
export const POST = withAuth(async (request, ctx) => {
  if (!rateLimit(`remove:${ctx.user.id}`, 40, 60_000)) return apiError("rate_limited");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("bad_request");

  const ids = [...new Set(parsed.data.ids)];
  const results = await removeFollowers(ctx, ids, parsed.data.action);
  return json<RemoveResponse>({ results });
});
