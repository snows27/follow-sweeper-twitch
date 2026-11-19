import "server-only";
import { TwitchApiError } from "@/server/twitch/client";
import { blockUser, unblockUser } from "@/server/twitch/endpoints";
import type { ApiContext } from "@/server/auth/guard";
import type { RemoveAction, RemoveItemResult } from "@/types/api";

function rethrowAuth(err: unknown) {
  if (err instanceof TwitchApiError && err.status === 401) throw err;
}

/**
 * Remove followers by blocking then immediately unblocking each one.
 * Blocking forces Twitch to drop their follow; unblocking leaves them unblocked.
 * `action: "unblock"` retries only the second step for earlier partial failures.
 */
export async function removeFollowers(
  { user, accessToken }: ApiContext,
  ids: string[],
  action: RemoveAction,
): Promise<RemoveItemResult[]> {
  const results: RemoveItemResult[] = [];

  // Sequential on purpose: keeps us well inside Twitch's rate limit.
  for (const id of ids) {
    if (id === user.id) continue; // never block yourself

    if (action === "remove") {
      try {
        await blockUser(accessToken, id);
      } catch (err) {
        rethrowAuth(err);
        results.push({ id, status: "block_failed" });
        continue;
      }
    }

    try {
      await unblockUser(accessToken, id);
      results.push({ id, status: "removed" });
    } catch (err) {
      rethrowAuth(err);
      results.push({ id, status: "unblock_failed" });
    }
  }

  return results;
}
