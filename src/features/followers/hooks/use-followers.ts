"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiRequestError, fetchFollowers } from "../api";
import { prepareFollowers } from "../lib/prepare";
import { useSessionExpired } from "./use-session-expired";
import type { ApiErrorCode, FollowersResponse } from "@/types/api";

type State =
  | { status: "loading" }
  | { status: "error"; code: ApiErrorCode }
  /** `loadedAt`: when the data arrived — the reference time for "x days ago". */
  | { status: "ready"; data: FollowersResponse; loadedAt: number };

/** Loads followers once and lets the caller drop removed ones locally. */
export function useFollowers() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const onExpired = useSessionExpired();

  useEffect(() => {
    const controller = new AbortController();
    fetchFollowers(controller.signal)
      .then((data) => setState({ status: "ready", data, loadedAt: Date.now() }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const code = err instanceof ApiRequestError ? err.code : "server_error";
        if (code === "unauthorized") return onExpired();
        setState({ status: "error", code });
      });
    return () => controller.abort();
  }, [reloadKey, onExpired]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setReloadKey((k) => k + 1);
  }, []);

  /** Remove followers from the local list after they were removed on Twitch. */
  const dropFollowers = useCallback((ids: Iterable<string>) => {
    const gone = new Set(ids);
    if (gone.size === 0) return;
    setState((s) =>
      s.status === "ready"
        ? {
            ...s,
            data: {
              ...s.data,
              followers: s.data.followers.filter((f) => !gone.has(f.id)),
              total: Math.max(0, s.data.total - gone.size),
            },
          }
        : s,
    );
  }, []);

  const raw = state.status === "ready" ? state.data.followers : null;
  const followers = useMemo(() => (raw ? prepareFollowers(raw) : []), [raw]);

  return { state, followers, reload, dropFollowers };
}
