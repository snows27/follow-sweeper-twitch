"use client";

import { CheckCircle2, Pause, Play, RotateCw, Square } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/feedback";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/i18n/format";
import type { QueueState } from "../hooks/use-remove-queue";
import { Mascot, type MascotName } from "@/components/common/mascot";

/** Live progress while removing. Can't be dismissed until the job is finished or stopped. */
export function RemoveProgress({
  state,
  nameOf,
  onPause,
  onResume,
  onStop,
  onRetry,
  onDismiss,
}: {
  state: QueueState;
  nameOf: (id: string) => string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const { dict } = useI18n();
  const t = dict.remove;
  const active = state.phase === "running" || state.phase === "paused";
  const pct = state.total ? (state.done / state.total) * 100 : 0;

  const title =
    state.phase === "finished" ? t.finished : state.phase === "stopped" ? t.stopped : t.progressTitle;

  // Mascot follows the job: sweeping → tea break → celebrate, or apologise if anything failed.
  const mascot: MascotName =
    state.phase === "running"
      ? "removing"
      : state.phase === "paused" || (state.phase === "stopped" && state.failed.size === 0)
        ? "paused"
        : state.failed.size > 0
          ? "partial-fail"
          : "done";

  return (
    <Dialog
      open={state.phase !== "idle"}
      onClose={onDismiss}
      dismissible={!active}
      title={title}
      closeLabel={dict.common.close}
    >
      <div className="space-y-3" aria-live="polite">
        <Mascot name={mascot} size={140} bob={state.phase === "running"} className="mx-auto" />
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold tabular-nums">
            {format(t.progress, { done: state.done, total: state.total })}
          </span>
          {state.phase === "paused" && <span className="text-warning-fg">{t.paused}</span>}
          {state.phase === "finished" && <CheckCircle2 className="size-5 text-success-fg" aria-hidden="true" />}
        </div>
        <ProgressBar value={pct} />
        <p className="text-sm text-muted">
          {format(t.summary, { removed: state.removed, failed: state.failed.size })}
        </p>

        {!active && state.failed.size > 0 && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{t.failedTitle}</h3>
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md bg-surface-2 p-2 text-xs">
              {[...state.failed].map(([id, status]) => (
                <li key={id} className="flex justify-between gap-2">
                  <span className="truncate font-semibold">{nameOf(id)}</span>
                  <span className="shrink-0 text-danger-fg">{t.status[status]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {active ? (
          <>
            {state.phase === "running" ? (
              <Button variant="secondary" onClick={onPause}>
                <Pause className="size-4" aria-hidden="true" />
                {t.pause}
              </Button>
            ) : (
              <Button variant="secondary" onClick={onResume}>
                <Play className="size-4" aria-hidden="true" />
                {t.resume}
              </Button>
            )}
            <Button variant="danger" onClick={onStop}>
              <Square className="size-4" aria-hidden="true" />
              {t.stop}
            </Button>
          </>
        ) : (
          <>
            {state.failed.size > 0 && (
              <Button variant="secondary" onClick={onRetry}>
                <RotateCw className="size-4" aria-hidden="true" />
                {t.retryFailed}
              </Button>
            )}
            <Button onClick={onDismiss}>{t.dismiss}</Button>
          </>
        )}
      </div>
    </Dialog>
  );
}
