"use client";

import { RotateCcw, Search } from "lucide-react";
import { Input, Segmented } from "@/components/ui/form";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import type { FilterState, TriState } from "../types";
import type { AccountType, BroadcasterType } from "@/types/api";

type Props = {
  filters: FilterState;
  update: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  reset: () => void;
  activeCount: number;
  /** Hide filters whose data couldn't be loaded. */
  hasSubscriberData: boolean;
  hasBanData: boolean;
};

const BROADCASTER_TYPES: BroadcasterType[] = ["partner", "affiliate", "none"];
const ACCOUNT_TYPES: AccountType[] = ["staff", "admin", "global_mod", "none"];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Multi-select pill group: nothing selected = any. */
function ChipGroup<T extends string>({
  label,
  values,
  selected,
  labelOf,
  onChange,
}: {
  label: string;
  values: T[];
  selected: T[];
  labelOf: (v: T) => string;
  onChange: (next: T[]) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => {
          const on = selected.includes(v);
          return (
            <button
              key={v}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(toggle(selected, v))}
              className={cn(
                "h-8 rounded-full border px-3 text-sm font-semibold transition-colors",
                on
                  ? "border-brand bg-brand text-white"
                  : "border-line text-muted hover:border-subtle hover:text-fg",
              )}
            >
              {labelOf(v)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      {children}
    </div>
  );
}

/** Horizontal filter bar shown above the table. */
export function FilterBar({ filters: f, update, reset, activeCount, hasSubscriberData, hasBanData }: Props) {
  const { dict } = useI18n();
  const t = dict.filters;

  const tri = (key: "subscriber" | "banned") => (
    <Segmented<TriState>
      name={t[key]}
      value={f[key]}
      onChange={(v) => update(key, v)}
      // Yes = show only these (green), No = hide these (red), Any = no filter (purple).
      options={[
        { value: "any", label: t.any },
        { value: "yes", label: t.yes, tone: "success" },
        { value: "no", label: t.no, tone: "danger" },
      ]}
    />
  );

  return (
    <div className="space-y-4 rounded-card border border-line bg-surface p-4">
      {/* Row 1: types (most used) + reset */}
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <ChipGroup
          label={t.broadcasterType}
          values={BROADCASTER_TYPES}
          selected={f.broadcasterTypes}
          labelOf={(v) => t.broadcasterTypes[v]}
          onChange={(v) => update("broadcasterTypes", v)}
        />
        <ChipGroup
          label={t.accountType}
          values={ACCOUNT_TYPES}
          selected={f.accountTypes}
          labelOf={(v) => t.accountTypes[v]}
          onChange={(v) => update("accountTypes", v)}
        />
        <button
          type="button"
          onClick={reset}
          disabled={activeCount === 0}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-muted hover:bg-surface-3 hover:text-fg disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {t.reset}
          {activeCount > 0 && (
            <span className="rounded-full bg-brand px-1.5 text-xs text-white">{activeCount}</span>
          )}
        </button>
      </div>

      {/* Row 2: search + roles + avatar */}
      <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,2fr)_repeat(3,minmax(0,1fr))]">
        <Field label={t.username}>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle"
              aria-hidden="true"
            />
            <Input
              type="search"
              aria-label={t.username}
              placeholder={t.usernamePlaceholder}
              value={f.query}
              onChange={(e) => update("query", e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="h-[45px] pl-10 text-base"
            />
          </div>
        </Field>
        {hasSubscriberData && <Field label={t.subscriber}>{tri("subscriber")}</Field>}
        {hasBanData && <Field label={t.banned}>{tri("banned")}</Field>}
        <Field label={t.avatar}>
          <Segmented
            name={t.avatar}
            value={f.avatar}
            onChange={(v) => update("avatar", v)}
            options={[
              { value: "any", label: t.any },
              { value: "default", label: t.defaultAvatar },
              { value: "custom", label: t.customAvatar },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}
