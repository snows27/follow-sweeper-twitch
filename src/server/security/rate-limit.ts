import "server-only";

/**
 * Small in-memory sliding-window rate limiter, keyed per user + action.
 *
 * Note: memory is per server instance. That's enough to stop one browser
 * from hammering the API; for multi-instance hosting with strict limits,
 * swap this for a shared store (e.g. Upstash Redis).
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing forever.
  if (hits.size > 10_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return true;
}
