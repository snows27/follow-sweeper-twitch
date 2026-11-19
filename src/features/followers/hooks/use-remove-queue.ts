"use client";

import { useCallback, useRef, useState } from "react";
import { REMOVE_BATCH_SIZE } from "@/lib/constants";
import { ApiRequestError, removeBatch } from "../api";
import { useSessionExpired } from "./use-session-expired";
import type { RemoveAction, RemoveItemResult } from "@/types/api";

export type QueuePhase = "idle" | "running" | "paused" | "finished" | "stopped";
type FailStatus = Exclude<RemoveItemResult["status"], "removed">;
type Job = { id: string; action: RemoveAction };

export type QueueState = {
  phase: QueuePhase;
  total: number;
  done: number;
  removed: number;
  failed: Map<string, FailStatus>;
};

const initial: QueueState = { phase: "idle", total: 0, done: 0, removed: 0, failed: new Map() };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Removes followers in small batches with pause / resume / stop.
 * `onRemoved` is called after every batch with the ids that were removed.
 */
export function useRemoveQueue(onRemoved: (ids: string[]) => void) {
  const [state, setState] = useState<QueueState>(initial);
  const pausedRef = useRef(false);
  const stoppedRef = useRef(false);
  const runningRef = useRef(false);
  const onExpired = useSessionExpired();

  const run = useCallback(
    async (jobs: Job[]) => {
      if (runningRef.current || jobs.length === 0) return;
      runningRef.current = true;
      pausedRef.current = false;
      stoppedRef.current = false;
      setState({ phase: "running", total: jobs.length, done: 0, removed: 0, failed: new Map() });

      let i = 0;
      while (i < jobs.length) {
        if (stoppedRef.current) break;
        if (pausedRef.current) {
          await sleep(250);
          continue;
        }

        // A batch shares one action, so split at action changes.
        const action = jobs[i].action;
        const batch: string[] = [];
        while (i < jobs.length && batch.length < REMOVE_BATCH_SIZE && jobs[i].action === action) {
          batch.push(jobs[i++].id);
        }

        let results: RemoveItemResult[];
        try {
          results = (await removeBatch(batch, action)).results;
        } catch (err) {
          const code = err instanceof ApiRequestError ? err.code : "server_error";
          if (code === "unauthorized") {
            runningRef.current = false;
            return onExpired();
          }
          if (code === "rate_limited") {
            i -= batch.length; // retry the same batch after a pause
            await sleep(10_000);
            continue;
          }
          results = batch.map((id) => ({
            id,
            status: action === "remove" ? "block_failed" : "unblock_failed",
          }));
        }

        const removedIds = results.filter((r) => r.status === "removed").map((r) => r.id);
        if (removedIds.length) onRemoved(removedIds);

        setState((s) => {
          const failed = new Map(s.failed);
          for (const r of results) {
            if (r.status === "removed") failed.delete(r.id);
            else failed.set(r.id, r.status);
          }
          return {
            ...s,
            done: s.done + batch.length,
            removed: s.removed + removedIds.length,
            failed,
          };
        });
      }

      runningRef.current = false;
      setState((s) => ({ ...s, phase: stoppedRef.current ? "stopped" : "finished" }));
    },
    [onExpired, onRemoved],
  );

  const start = useCallback(
    (ids: string[]) => run(ids.map((id) => ({ id, action: "remove" as const }))),
    [run],
  );

  /** Retry failures: a failed block is retried fully, a failed unblock only unblocks. */
  const retryFailed = useCallback(() => {
    const jobs: Job[] = [...state.failed].map(([id, status]) => ({
      id,
      action: status === "unblock_failed" ? "unblock" : "remove",
    }));
    jobs.sort((a, b) => a.action.localeCompare(b.action));
    return run(jobs);
  }, [run, state.failed]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setState((s) => ({ ...s, phase: "paused" }));
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setState((s) => ({ ...s, phase: "running" }));
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    pausedRef.current = false;
  }, []);

  const reset = useCallback(() => setState(initial), []);

  return { state, start, pause, resume, stop, retryFailed, reset };
}
