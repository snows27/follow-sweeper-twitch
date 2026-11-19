import type { ComponentProps, ReactNode } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-hidden="true"
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-line border-t-brand",
        className,
      )}
    />
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-3", className)}
    >
      <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}

type AlertTone = "info" | "warning" | "danger";

const alertStyles: Record<AlertTone, { cls: string; icon: ReactNode }> = {
  info: { cls: "border-line bg-surface-2 text-muted", icon: <Info className="size-4 shrink-0" /> },
  warning: {
    cls: "border-warning/30 bg-warning-soft text-warning-fg",
    icon: <AlertTriangle className="size-4 shrink-0" />,
  },
  danger: {
    cls: "border-danger/40 bg-danger-soft text-danger-fg",
    icon: <XCircle className="size-4 shrink-0" />,
  },
};

export function Alert({
  tone = "info",
  className,
  children,
  ...props
}: ComponentProps<"div"> & { tone?: AlertTone }) {
  const s = alertStyles[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex items-start gap-2 rounded-md border px-3 py-2 text-sm", s.cls, className)}
      {...props}
    >
      <span className="mt-0.5">{s.icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
