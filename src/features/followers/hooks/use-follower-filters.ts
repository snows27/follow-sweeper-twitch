"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { applyFilters, defaultFilters, defaultSort, nextSort, sortFollowers } from "../lib/filters";
import type { FilterState, FollowerItem, SortColumn, SortState } from "../types";

/** Filter + sort state. Work is deferred so typing stays smooth on big lists. */
export function useFollowerFilters(followers: FollowerItem[]) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState<SortState>(defaultSort);

  const deferredFilters = useDeferredValue(filters);
  const deferredSort = useDeferredValue(sort);

  const items = useMemo(
    () => sortFollowers(applyFilters(followers, deferredFilters), deferredSort),
    [followers, deferredFilters, deferredSort],
  );

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  return {
    filters,
    update,
    reset: () => setFilters(defaultFilters),
    sort,
    toggleSort: (column: SortColumn) => setSort((s) => nextSort(s, column)),
    items,
    isStale: filters !== deferredFilters || sort !== deferredSort,
  };
}
