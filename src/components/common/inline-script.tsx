"use client";

/**
 * A <script> that runs once, during the initial HTML parse (before first paint).
 *
 * React warns when it renders a <script> in the browser (it would never execute),
 * e.g. when switching language re-renders the root layout. So:
 * - on the server it's `text/javascript` (runs on page load),
 * - in the browser it's `text/plain` (inert, no warning).
 * `suppressHydrationWarning` accepts that difference.
 * Pattern from the Next.js "Preventing flash before hydration" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
