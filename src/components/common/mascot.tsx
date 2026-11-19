import Image from "next/image";
import { cn } from "@/lib/cn";

/** Mascot stickers in /public/mascot — one per app state. */
export type MascotName =
  | "welcome"
  | "loading"
  | "confirm"
  | "removing"
  | "paused"
  | "done"
  | "partial-fail"
  | "empty"
  | "no-results"
  | "error"
  | "rate-limited"
  | "session-expired";

/**
 * Decorative mascot. Always paired with text that carries the meaning,
 * so it's hidden from screen readers (alt="").
 * `bob` adds a gentle float for "busy" states (disabled for reduced-motion users).
 */
export function Mascot({
  name,
  size = 128,
  bob = false,
  priority = false,
  className,
}: {
  name: MascotName;
  size?: number;
  bob?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={`/mascot/${name}.webp`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      // Serve the original 512px sticker (already small WebP): the browser's own
      // downscaling keeps fine line art (hair, glasses) crisp. Re-encoding to tiny
      // sizes at default quality made small mascots look blurry/blocky.
      unoptimized
      priority={priority}
      draggable={false}
      className={cn("pointer-events-none shrink-0 select-none", bob && "animate-mascot-bob", className)}
    />
  );
}
