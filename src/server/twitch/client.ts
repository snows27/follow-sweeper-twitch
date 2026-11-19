import "server-only";
import { getEnv } from "@/lib/env";
import type { HelixPage } from "@/types/twitch";

const HELIX = "https://api.twitch.tv/helix";
const MAX_RETRIES = 3;
const MAX_WAIT_MS = 15_000;

export class TwitchApiError extends Error {
  name = "TwitchApiError";
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | string[] | undefined>;

type RequestOptions = {
  accessToken: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildUrl(path: string, query: Query = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) params.append(key, String(v));
  }
  const qs = params.toString();
  return `${HELIX}${path}${qs ? `?${qs}` : ""}`;
}

/** Milliseconds until Twitch's rate-limit bucket refills (from the Ratelimit-Reset header). */
function msUntilReset(res: Response): number {
  const reset = Number(res.headers.get("Ratelimit-Reset"));
  if (!Number.isFinite(reset) || reset <= 0) return 1000;
  return Math.min(Math.max(reset * 1000 - Date.now(), 250), MAX_WAIT_MS);
}

/**
 * Call a Twitch Helix endpoint with the user's token.
 * - Waits and retries on 429 (rate limited) and 5xx.
 * - Slows down automatically when the rate-limit bucket is almost empty.
 * - Returns `null` for 204 No Content.
 */
export async function helix<T>(path: string, opts: RequestOptions): Promise<T | null> {
  const url = buildUrl(path, opts.query);

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        "Client-Id": getEnv().TWITCH_CLIENT_ID,
      },
      cache: "no-store",
    });

    const retryable = res.status === 429 || res.status >= 500;
    if (retryable && attempt < MAX_RETRIES) {
      await sleep(res.status === 429 ? msUntilReset(res) : 500 * 2 ** attempt);
      continue;
    }

    if (!res.ok) {
      let message = res.statusText;
      try {
        const body = (await res.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // non-JSON error body
      }
      throw new TwitchApiError(res.status, message);
    }

    if (Number(res.headers.get("Ratelimit-Remaining")) <= 2) {
      await sleep(msUntilReset(res));
    }

    if (res.status === 204) return null;
    return (await res.json()) as T;
  }
}

/** Follow `pagination.cursor` until the end or until `max` items. */
export async function helixPaginate<T>(
  path: string,
  opts: RequestOptions & { max?: number },
): Promise<{ items: T[]; total?: number; truncated: boolean }> {
  const max = opts.max ?? Infinity;
  const items: T[] = [];
  let cursor: string | undefined;
  let total: number | undefined;

  do {
    const page = await helix<HelixPage<T>>(path, {
      ...opts,
      query: { ...opts.query, first: 100, after: cursor },
    });
    if (!page) break;
    items.push(...page.data);
    total ??= page.total;
    cursor = page.pagination?.cursor;
  } while (cursor && items.length < max);

  const truncated = items.length > max || Boolean(cursor);
  return { items: items.slice(0, max), total, truncated };
}
