import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "danger" | "warning" | "success";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-3 text-muted",
  brand: "bg-brand-soft text-brand-fg",
  danger: "bg-danger-soft text-danger-fg",
  warning: "bg-warning-soft text-warning-fg",
  success: "bg-success-soft text-success-fg",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
