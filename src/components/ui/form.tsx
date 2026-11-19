import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const field =
  "h-9 w-full rounded-md border border-line bg-surface-2 px-3 text-sm text-fg placeholder:text-subtle transition-colors hover:border-subtle focus:border-brand focus:outline-none aria-invalid:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(field, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(field, "cursor-pointer pr-8", className)} {...props} />;
}

export function Checkbox({
  className,
  label,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label?: ReactNode }) {
  const box = (
    <input
      type="checkbox"
      className={cn("size-4 cursor-pointer rounded accent-brand", className)}
      {...props}
    />
  );
  if (!label) return box;
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
      {box}
      <span>{label}</span>
    </label>
  );
}

export function FieldLabel({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted", className)}
      {...props}
    />
  );
}

export type SegmentTone = "brand" | "success" | "danger";

const activeTone: Record<SegmentTone, string> = {
  brand: "bg-brand text-white",
  success: "bg-success text-white",
  danger: "bg-danger text-white",
};

/**
 * Segmented "Any / Yes / No" style control.
 * Each option can have its own active color, e.g. Yes = green ("show only"), No = red ("hide").
 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  name,
  size = "md",
}: {
  value: T;
  options: { value: T; label: string; tone?: SegmentTone }[];
  onChange: (value: T) => void;
  name: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn("flex rounded-md bg-surface-2", size === "md" ? "h-[45px] p-1" : "h-8 p-0.5")}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded font-semibold whitespace-nowrap transition-colors",
            size === "md" ? "px-3 text-sm" : "px-2.5 text-xs",
            value === opt.value ? activeTone[opt.tone ?? "brand"] : "text-muted hover:text-fg",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
