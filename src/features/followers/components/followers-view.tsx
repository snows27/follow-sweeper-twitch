"use client";

import { useCallback, useMemo, useState } from "react";
import { RefreshCw, Trash2, X } from "lucide-react";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { format, plural } from "@/i18n/format";
import { useFollowers } from "../hooks/use-followers";
import { useFollowerFilters } from "../hooks/use-follower-filters";
import { useRemoveQueue } from "../hooks/use-remove-queue";
import { useFormatters } from "../hooks/use-formatters";
import { activeFilterCount, defaultFilters, defaultSort } from "../lib/filters";
import { planRemoval } from "../lib/targets";
import { StateCard } from "@/components/common/state-card";
import { FilterBar } from "./filter-bar";
import { FollowerList } from "./follower-list";
import { RemoveDialog } from "./remove-dialog";
import { RemoveProgress } from "./remove-progress";

const noop = () => {};

type Stat = { label: string; value: number | null; accent?: boolean; note?: string };

/** Counts + actions above the table. `value: null` renders a skeleton. */
function Toolbar({
  stats,
  children,
}: {
  stats: Stat[];
  children?: React.ReactNode;
}) {
  const fmt = useFormatters();
  return (
    <div className="flex min-h-9 flex-wrap items-center gap-x-5 gap-y-2">
      <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
        {stats.map((s) => (
          <div key={s.label} className="flex items-baseline gap-1.5">
            <dt className="text-muted">{s.label}</dt>
            <dd
              className={
                s.accent
                  ? "text-lg font-bold tabular-nums text-brand-fg"
                  : "text-lg font-bold tabular-nums"
              }
            >
              {s.value === null ? (
                <span className="inline-block h-5 w-10 animate-pulse rounded bg-surface-3 align-middle" />
              ) : (
                fmt.number(s.value)
              )}
            </dd>
            {s.note && <dd className="text-xs font-semibold text-warning-fg">({s.note})</dd>}
          </div>
        ))}
      </dl>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  );
}

/**
 * Same layout as the loaded page with placeholder rows — used as the
 * first paint while the server checks the session. No state, no data.
 */
export function FollowersSkeleton() {
  const { dict } = useI18n();
  const t = dict.followers;
  return (
    <div className="space-y-4" aria-busy="true">
      <fieldset disabled className="contents">
        <FilterBar
          filters={defaultFilters}
          update={noop}
          reset={noop}
          activeCount={0}
          hasSubscriberData
          hasBanData
        />
      </fieldset>
      <Toolbar
        stats={[
          { label: t.stats.total, value: null },
          { label: t.stats.shown, value: null },
          { label: t.stats.selected, value: null, accent: true },
        ]}
      />
      <FollowerList
        loading
        items={[]}
        selected={new Set()}
        onToggle={noop}
        onToggleAll={noop}
        sort={defaultSort}
        onSort={noop}
        now={0}
      />
    </div>
  );
}

/** Orchestrates the follower cleanup tool: load → filter/sort → select → remove. */
export function FollowersView() {
  const { dict } = useI18n();
  const t = dict.followers;
  const fmt = useFormatters();

  const { state, followers, reload, dropFollowers } = useFollowers();
  const filter = useFollowerFilters(followers);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onRemoved = useCallback(
    (ids: string[]) => {
      dropFollowers(ids);
      setSelected((s) => {
        const next = new Set(s);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    },
    [dropFollowers],
  );
  const queue = useRemoveQueue(onRemoved);

  const byId = useMemo(() => new Map(followers.map((f) => [f.id, f])), [followers]);
  const nameOf = useCallback((id: string) => byId.get(id)?.displayName ?? id, [byId]);

  const toggle = useCallback((id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllShown = useCallback(
    (select: boolean) =>
      setSelected((s) => {
        const next = new Set(s);
        for (const f of filter.items) {
          if (select) next.add(f.id);
          else next.delete(f.id);
        }
        return next;
      }),
    [filter.items],
  );

  const selectedIds = useMemo(() => [...selected].filter((id) => byId.has(id)), [selected, byId]);
  const allIds = useMemo(() => new Set(byId.keys()), [byId]);
  const plan = useMemo(
    () => planRemoval(filter.items, selected, allIds),
    [filter.items, selected, allIds],
  );
  const rolesCount = useMemo(
    () =>
      plan.remove.filter((id) => {
        const f = byId.get(id)!;
        return f.isSubscriber || f.isModerator || f.isVip;
      }).length,
    [plan.remove, byId],
  );

  if (state.status === "error") {
    const rateLimited = state.code === "rate_limited";
    return (
      <StateCard
        tone="danger"
        mascot={rateLimited ? "rate-limited" : "error"}
        title={rateLimited ? t.errors.rateLimited : t.errors.loadFailed}
        action={
          <Button variant="secondary" onClick={reload}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {dict.common.retry}
          </Button>
        }
      />
    );
  }

  const loading = state.status === "loading";
  const data = state.status === "ready" ? state.data : null;
  const unavailable = new Set(data?.unavailable ?? []);
  const busy = queue.state.phase === "running" || queue.state.phase === "paused";

  return (
    <div className="space-y-4">
      {/* Announce loading to screen readers; sighted users see the skeleton. */}
      <p className="sr-only" aria-live="polite">
        {loading ? t.loadingText : ""}
      </p>

      {data && (data.truncated || unavailable.size > 0) && (
        <div className="space-y-2">
          {data.truncated && (
            <Alert tone="warning">{format(t.truncated, { count: fmt.number(data.followers.length) })}</Alert>
          )}
          {[...unavailable].map((source) => (
            <Alert key={source}>{t.unavailable[source]}</Alert>
          ))}
        </div>
      )}

      {/* Filters work while loading — they apply as soon as data arrives. */}
      <FilterBar
        filters={filter.filters}
        update={filter.update}
        reset={filter.reset}
        activeCount={activeFilterCount(filter.filters)}
        hasSubscriberData={!unavailable.has("subscriptions")}
        hasBanData={!unavailable.has("banned")}
      />

      <Toolbar
        stats={[
          { label: t.stats.total, value: data ? data.total : null },
          { label: t.stats.shown, value: data ? filter.items.length : null },
          {
            label: t.stats.selected,
            value: data ? plan.remove.length : null,
            accent: true,
            note:
              plan.hiddenSelected > 0
                ? format(t.stats.hiddenSelected, { count: fmt.number(plan.hiddenSelected) })
                : undefined,
          },
        ]}
      >
        {selectedIds.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            <X className="size-4" aria-hidden="true" />
            {t.actions.clearSelection}
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={reload}
          disabled={busy || loading}
          title={t.actions.refresh}
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{t.actions.refresh}</span>
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={plan.remove.length === 0 || busy || loading}
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {plural(plan.remove.length, t.actions.removeSelectedOne, t.actions.removeSelected, {
            count: fmt.number(plan.remove.length),
          })}
        </Button>
      </Toolbar>

      {!loading && filter.items.length === 0 ? (
        followers.length === 0 ? (
          <StateCard mascot="empty" title={t.empty.noFollowers} />
        ) : (
          <StateCard
            mascot="no-results"
            title={t.empty.noMatches}
            action={
              <Button variant="secondary" onClick={filter.reset}>
                {dict.filters.reset}
              </Button>
            }
          />
        )
      ) : (
        <FollowerList
          loading={loading}
          items={filter.items}
          selected={selected}
          onToggle={toggle}
          onToggleAll={toggleAllShown}
          sort={filter.sort}
          onSort={filter.toggleSort}
          dimmed={filter.isStale}
          now={state.status === "ready" ? state.loadedAt : 0}
        />
      )}

      <RemoveDialog
        open={confirmOpen}
        count={plan.remove.length}
        rolesCount={rolesCount}
        hiddenSelected={plan.hiddenSelected}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          // The plan is fixed at this moment; later list changes don't affect the running job.
          void queue.start(plan.remove);
        }}
      />
      <RemoveProgress
        state={queue.state}
        nameOf={nameOf}
        onPause={queue.pause}
        onResume={queue.resume}
        onStop={queue.stop}
        onRetry={() => void queue.retryFailed()}
        onDismiss={queue.reset}
      />
    </div>
  );
}
