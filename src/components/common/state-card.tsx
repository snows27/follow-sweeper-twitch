import type { ReactNode } from "react";
import { Mascot, type MascotName } from "./mascot";
import { cn } from "@/lib/cn";

/** Friendly full-width state: mascot + message (+ optional action). Used for empty / error screens. */
export function StateCard({
  mascot,
  title,
  body,
  action,
  tone = "neutral",
  className,
}: {
  mascot: MascotName;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger";
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border px-6 py-10 text-center",
        tone === "danger" ? "border-danger/30 bg-danger-soft" : "border-dashed border-line bg-surface",
        className,
      )}
    >
      <Mascot name={mascot} size={160} />
      <p className={cn("text-lg font-bold", tone === "danger" && "text-danger-fg")}>{title}</p>
      {body && <p className="max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
