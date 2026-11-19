"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Accessible modal built on the native <dialog> element:
 * focus trapping, Esc to close and the backdrop come for free.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  closeLabel,
  dismissible = true,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  closeLabel: string;
  /** When false, Esc / backdrop / X can't close it (e.g. while a job runs). */
  dismissible?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-lg rounded-card border border-line bg-surface p-0 text-fg shadow-2xl",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <h2 id="dialog-title" className="text-lg font-bold">
          {title}
        </h2>
        {dismissible && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded p-1 text-muted hover:bg-surface-3 hover:text-fg"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
