// Filters a list page keeps when its search box, category or page changes
// (2026-09): a tag chip on a card and an insurer's "in network" links open the
// list narrowed by these.
export const KEPT_LIST_FILTERS = ["tag", "insurance"] as const;

export type ListPageFilters = {
  tag?: { _id: string; name?: string };
  insurance?: { _id: string; name?: string; slug?: string };
  // the pharmacy list's city (2026-10); not kept across lists
  city?: { _id: string; name?: string };
};

export const keepListFilters = (
  from: { getAll: (key: string) => string[] },
  to: URLSearchParams,
) => {
  for (const key of KEPT_LIST_FILTERS)
    for (const value of from.getAll(key)) to.append(key, value);
  return to;
};
