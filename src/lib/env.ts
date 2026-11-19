import "server-only";
import { z } from "zod";

const envSchema = z.object({
  TWITCH_CLIENT_ID: z.string().min(1, "TWITCH_CLIENT_ID is required"),
  TWITCH_CLIENT_SECRET: z.string().min(1, "TWITCH_CLIENT_SECRET is required"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
  APP_URL: z.url("APP_URL must be a full URL, e.g. http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Validated server environment. Read lazily so static pages can build
 * without secrets; any route that needs them fails loudly if they're missing.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  cached = { ...parsed.data, APP_URL: parsed.data.APP_URL.replace(/\/$/, "") };
  return cached;
}
