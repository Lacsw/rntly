---
name: url-state
description: Guidelines for managing URL search params state — filters, pagination, tabs, and view toggles using useSearchParams from react-router-dom.
user-invokable: false
---

# URL State Guidelines

This guide provides patterns for persisting UI state in URL search parameters using `useSearchParams` from `react-router-dom`.

## Hook Location

- Domain-specific: `domains/[domain]/hooks/` (e.g., `use-url-filters.ts`, `use-property-tab.ts`)
- Shared/reusable: `web/src/shared/hooks/` (e.g., `use-properties-list-view-mode.ts`)

## Key Rules

- **Validate URL values** — always provide defaults for missing/invalid params
- **Use type guards for enums** — don't trust raw `searchParams.get()` values
- **Use `replace: true`** for filter/pagination changes (avoids polluting browser history)
- **Reset page on filter change** — when a filter changes, reset `page` to `"1"`
- **Delete empty params** — remove params from URL when value is empty/default
- **Use `useCallback`** for setter functions passed to child components

## Single Param Pattern

For tabs, view toggles, or single selections.

Inline pattern used by `PropertyDetailPage`:

```ts
// Inline pattern used by PropertyDetailPage
import { useSearchParams } from 'react-router-dom';

const DEFAULT_TAB = 'overview';

export const PropertyDetailPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? DEFAULT_TAB;

  const handleTabChange = (tabId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabId);
    setSearchParams(next, { replace: true });
  };

  return null;
};
```

**View toggle variant** (based on `use-properties-list-view-mode.ts`):

Note: rntly will adopt this pattern when view toggles are introduced.

```typescript
export type ViewMode = "list" | "map";
const DEFAULT_VIEW: ViewMode = "map";

export const usePropertiesListViewMode = () => {
  const [searchParams, setSearchParams] = useSearchParams({ view: DEFAULT_VIEW });
  const view = searchParams.get("view");
  const isListView = view === "list";
  const isMapView = view === "map";

  const setViewMode = useCallback(
    (view: ViewMode) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("view", view);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return { isListView, isMapView, setViewMode };
};
```

## Multi-Filter Pattern

Reference pattern — rntly will adopt for the deferred search/filter sprint.

For complex filter UIs with multiple filter types.

```typescript
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const LIST_FILTER_KEYS: TFilterKey[] = ["propertyType", "propertyStatus", "tags"];

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse all filters from URL
  const filters = useMemo(() => {
    const listFilters = LIST_FILTER_KEYS.reduce((acc, key) => {
      acc[key] = parseListFilterParam(searchParams.get(key));
      return acc;
    }, {} as Record<TFilterKey, string[]>);

    return {
      filterQuery: searchParams.get("filterQuery") ?? "",
      ...listFilters,
    };
  }, [searchParams]);

  // Atomic URL updates with commitSearchParams
  const commitSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      setSearchParams(
        (currentParams) => {
          const next = new URLSearchParams(currentParams);
          mutator(next);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const updateFilters = useCallback(
    (key: keyof TFilters, value: string | string[] | null) => {
      commitSearchParams((next) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          next.delete(key);
          return;
        }
        next.set(key, serializeListFilter(value));
      });
    },
    [commitSearchParams]
  );

  const clearFilters = useCallback(() => {
    commitSearchParams((next) => {
      LIST_FILTER_KEYS.forEach((key) => next.delete(key));
    });
  }, [commitSearchParams]);

  return { filters, updateFilters, clearFilters } as const;
};
```

**Key points:**

- Use `useMemo` to derive filter state from `searchParams` (avoids re-parsing on every render)
- `commitSearchParams` helper wraps `setSearchParams` for atomic updates with `replace: true`
- Delete params when value is empty — keeps URLs clean

## Pagination + Sort Pattern

Reference pattern — rntly will adopt for the deferred search/filter sprint.

For table views with page, perPage, sort, and multiple filters.

```typescript
const useTenantPageConfig = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse with defaults
  const page = Number(searchParams.get("page") || 1);
  const rows = Number(searchParams.get("perPage") || 10);
  const sortBy = isSortBy(searchParams.get("sortBy")) ? rawSortBy : DEFAULT_SORT_BY;
  const sortDirection = isSortDirection(searchParams.get("sortDirection"))
    ? rawSortDirection
    : DEFAULT_SORT_DIRECTION;

  // Bulk update helper — deletes empty values
  const updateParams = (updates: Record<string, string | null | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  // Reset page when filters change
  const handleNameSearch = (value: string) => {
    updateParams({ name: value, page: "1" });
  };

  const handleSortChange = (field: TSortColumn) => {
    const nextDirection = field === sortBy ? (sortDirection === "asc" ? "desc" : "asc") : "desc";
    updateParams({ sortBy: field, sortDirection: nextDirection, page: "1" });
  };

  return { page, rows, sortBy, sortDirection, handleNameSearch, handleSortChange };
};
```

**Key points:**

- Type guards (`isSortBy`, `isSortDirection`) validate URL values against allowed arrays
- `updateParams` bulk-updates multiple params atomically and deletes empty ones
- Every filter/sort change resets `page` to `"1"`

## Conventions

| Convention | Pattern |
|---|---|
| Serialize arrays | Comma-separated: `"value1,value2"` |
| Parse arrays | Split + trim + deduplicate via `new Set()` |
| Type guard enums | `const isValid = (v: string \| null): v is TEnum => ALLOWED.includes(v as TEnum)` |
| Atomic updates | `commitSearchParams(mutator)` or `updateParams(record)` helper |
| History mode | `{ replace: true }` for filters/pagination, default (push) for navigation |
| Default values | `searchParams.get("key") \|\| DEFAULT_VALUE` |
| Clean URLs | Delete params when value equals default or is empty |

## Utility Functions

Place URL serialization/parsing utilities in `domains/[domain]/utils/url-filters.ts`:

```typescript
export const LIST_FILTER_SEPARATOR = ",";

// Parse: "a,b,c" → ["a", "b", "c"] (deduplicated)
export const parseListFilterParam = (value: string | null): string[] => {
  if (!value) return [];
  return Array.from(new Set(value.split(LIST_FILTER_SEPARATOR).map(s => s.trim()).filter(Boolean)));
};

// Serialize: ["a", "b"] → "a,b"
export const serializeListFilter = (values: string[]): string =>
  values.join(LIST_FILTER_SEPARATOR);
```
