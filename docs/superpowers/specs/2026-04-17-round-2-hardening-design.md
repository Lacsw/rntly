# Round-2 Hardening Design Spec

**Date:** 2026-04-17
**Scope:** Frontend only (`web/`). Builds on Sprints 0–7 of the QA+Polish initiative.
**Prior spec:** `docs/superpowers/specs/2026-04-16-qa-and-polish-design.md`

---

## 1. Goal

Continue hardening rntly past Sprint 7 with four themed sprints, bundled as one spec in the spirit of the QA+Polish design. Focus:

1. A fresh exploratory QA pass that surfaces what's rough after six sprints of change.
2. Filling the testing gaps the first pass deliberately skipped: negative-path E2E, live-browser a11y, component-level unit tests.
3. A second UX polish round targeting list-page discoverability, confirm-dialog clarity, and detail-tab empty states.
4. Turning `/reports` from a stub heading into a real FE-only page that aggregates over existing properties/tenants/leases data.

**Out of scope:**

- Backend changes of any kind.
- New product domains beyond `/reports`.
- Charting libraries. `/reports` uses stat cards and tables only.
- Feature flags, Sentry, i18n, design-system extraction.
- `/contracts`, `/transactions`, `/settings` pages — they stay stubs and are waiting on BE models or product direction.
- Further test-directory migration — already completed in Sprint 6.

---

## 2. Success criteria

- `docs/qa/2026-04-17-scope-c-round-2-bug-report.md` exists with severity-tagged findings from a fresh walk of every feature merged since Sprint 1.
- Every critical or important bug from the new QA pass is fixed before the spec closes. Minor bugs triaged, optionally deferred.
- Playwright suite gains negative-path coverage: 4xx on create, forced 500 on list via route interception, 404 on detail, optimistic-delete revert under forced error.
- Live-browser a11y walk appends A11Y-07+ entries to `docs/qa/2026-04-17-a11y-findings.md` (contrast ratios, focus-visible on `<NavLink>` / `<Link>`, keyboard-only walk). Zero new critical axe violations after fixes.
- Every presentational component in `web/src/shared/components/ui/` and every domain card has a co-located `__tests__/*.test.tsx` render/interaction test. Coverage for `web/src/shared/components/ui/` and each `web/src/domains/*/components/` directory is ≥ 80% lines.
- List pages (`/properties`, `/tenants`, `/leases`) support search + filter + sort, all persisted in URL params and restorable across reload.
- Confirm dialogs include the target item's identifier in the prompt copy.
- Property-detail Tenants / Contracts / Financials / Maintenance tabs render a real `<EmptyState>` instead of ad-hoc "coming soon" text.
- `/reports` renders a Portfolio Summary, Leases Overview, and Tenants Overview section computed from existing APIs, with skeletons, a11y-clean structure, and unit + MSW-hook + Playwright coverage.
- Every quality gate stays green at every sprint boundary: `npm run lint && npx tsc --noEmit && npm test && npm run build && npm run test:e2e`.

---

## 3. Sprint breakdown

### Sprint 8 — Exploratory QA round 2 (~2 commits)

Chrome-MCP walk of every surface, with particular focus on flows that changed post-Sprint-1: toast behavior, loading skeletons, optimistic deletes, inline validation, a11y fixes, test-dir refactor.

**No code fixes this sprint.**

- Bug report: `docs/qa/2026-04-17-scope-c-round-2-bug-report.md`, same format as the Sprint-1 report (`BUG-###` + severity + repro + expected/actual + status).
- Plan: `docs/superpowers/plans/2026-04-17-sprint-8-qa-round-2.md`.
- Findings feed Sprint 9 (bugfixes) and inform Sprints 10–12.

**Scope of walk:**

- Dashboard: stat-card skeletons, recent-leases skeleton rows, toast on backend-down, keyboard-only nav through tiles and links.
- Properties list: search/sort absence (confirms Sprint 11 scope), skeleton cards, optimistic delete + revert, kebab a11y, inline validation on create.
- Property detail: all 5 tabs (URL sync, focus, roving tabindex from A11Y-01 fix), Edit modal prefill + toasts, Delete + optimistic remove + navigate back.
- Tenants list: create with email validation, inline errors, skeletons, enriched card data.
- Leases list: date-range validation, status pill colors, skeletons.
- Cross-cutting: modal focus trap (A11Y-02), Escape close, Tab wrap, sidebar group roles (A11Y-05), logout `aria-label` (A11Y-03), Loading live region (A11Y-06), rapid-click double submit, browser back/forward, stale state after delete.
- Stub pages: confirm they still render without error; do not test flows.

**Severity legend:** same as Sprint-1 report — critical / important / minor.

### Sprint 9 — Bugfixes (~5–15 commits, open-ended)

One fix commit per critical or important bug, referencing `BUG-###` in the body. Regression test when bug class is regression-prone (logic hooks, utilities). Minor bugs may be batched or deferred.

**Commit format:** `fix(<domain>): <summary>` — same convention as Sprint 2.

**Regression-test policy:** unit test for logic bugs; Playwright test for user-visible flow bugs if not already covered by the Sprint 10.1 negative-path suite.

### Sprint 10 — Test hardening (~12 commits)

Three subsprints. Commits within a subsprint may be reordered; subsprints run in order.

#### 10.1 Negative-path E2E (~4 commits)

Add `web/e2e/tests/error-paths.spec.ts` covering:

- 404 on property / tenant / lease detail — assert empty state + back CTA.
- Forced 500 on list fetch via `page.route('**/properties', r => r.fulfill({ status: 500, body: '{}' }))` — assert `<ErrorBanner>` renders and no crash.
- Invalid create input — assert inline per-field errors and submit stays disabled.
- Optimistic-delete revert — intercept DELETE with 500, assert item reappears and error toast fires.

Extend POM where needed (`BasePage` gets a `mockApiError(url, status)` helper). No FE simulate-error flag — all injection is test-local.

#### 10.2 Live-browser a11y walk (~4 commits)

DEV build with axe-extension + keyboard-only pass.

- Contrast ratios measured in a real browser (jsdom can't compute styles). Flag any text failing WCAG AA (4.5:1 for normal, 3:1 for large).
- Focus-visible ring verified on every `<NavLink>`, `<Link>`, `<button>`, `<input>`. Tailwind's `focus:ring-2 focus:ring-orange-600` exists on form controls; extend to nav and body links.
- Keyboard walkthrough of every page: Tab order, focus trap in modals, arrow keys in DetailTabs (sanity-check A11Y-01 fix).
- Append findings A11Y-07+ to `docs/qa/2026-04-17-a11y-findings.md` using the existing legend.
- One focused fix commit per violation category.

#### 10.3 Component-level unit tests (~4 commits)

Co-located under `__tests__/` next to each component. Cover the presentational pieces currently only exercised through hook tests.

Targets:

- Shared UI: `ConfirmDialog`, `DetailTabs`, `EmptyState`, `FormField`, `FormSelect`, `Loading`, `Modal`, `PageHeader`, `StatCard`, `StatusBadge`, `StatCardSkeleton`, `ErrorBanner`. (`Skeleton` already has a test.)
- Domain cards: `domains/properties/components/PropertyCard`, `domains/tenants/components/TenantCard`, `domains/leases/components/LeaseCard`, and their sub-components (property detail header, card skeletons).

Assertions per component: renders expected structure, click / keyboard handlers fire, disabled state blocks interaction, ARIA attributes present where the a11y audit requires them. No deep branching tests — integration is covered elsewhere.

Coverage target: ≥ 80% lines for `web/src/shared/components/ui/` and each `web/src/domains/*/components/` directory.

### Sprint 11 — UX polish round 2 (~10 commits)

#### 11.1 List-page search + filter + sort (~5 commits)

Shared `useListControls<TItem>` hook wrapping `useSearchParams` (uses existing `url-state` skill).

- Search: text match on primary fields (property address, tenant name, lease property/tenant name).
- Filter: where applicable — property type, lease status.
- Sort: created-at (default desc), name/address, rent.

URL keys: `?q=`, `?filter=`, `?sort=`. Empty string removes the key. Pure derivation in `apply()`; no `useEffect` syncing.

Apply to `/properties`, `/tenants`, `/leases`. MSW hook test covers the hook contract; Playwright spec covers URL persistence across reload.

#### 11.2 Confirm-dialog UX (~2 commits)

Extend `ConfirmDialog` with an optional `itemLabel` prop.

```tsx
<ConfirmDialog
  open={open}
  title="Delete property"
  itemLabel={property.address}
  description="This action cannot be undone."
  onConfirm={...}
  onCancel={...}
/>
```

Rendered prompt: `"Delete 99 QA Lane? This action cannot be undone."` — `itemLabel` becomes part of the accessible name so screen readers announce the target.

Update every call site (property / tenant / lease delete). Backwards-compatible: omitting `itemLabel` falls back to the title-only rendering.

#### 11.3 Detail-tab empty states (~3 commits)

Property-detail Tenants / Contracts / Financials / Maintenance tabs currently render ad-hoc "coming soon" or empty content. Replace each with `<EmptyState>` carrying:

- A title describing what the tab is for.
- A short supporting sentence.
- A CTA where applicable (e.g., "Add Tenant" from the Tenants tab when the property has no lease); otherwise explicit "Available soon" text — no CTA.

### Sprint 12 — `/reports` FE-only page (~9 commits)

Aggregates existing data into a real page. **No BE changes** — everything derived client-side from `/properties`, `/tenants`, `/leases`.

#### 12.1 Aggregation utilities (~2 commits)

`web/src/domains/reports/utils/aggregate.ts` — pure, side-effect-free functions.

```ts
portfolioSummary(properties: TProperty[]): {
  total: number;
  byType: Record<TPropertyType, number>;
  avgRent: number;
  totalRent: number;
};

leaseStats(leases: TLease[]): {
  total: number;
  active: number;
  upcoming: number;
  ended: number;
  monthlyRecurringRent: number;
  upcomingRenewalsNext30Days: number;
};

tenantStats(tenants: TTenant[], leases: TLease[]): {
  total: number;
  withActiveLease: number;
  withoutLease: number;
};
```

Exhaustive unit tests: empty arrays, missing optional fields, date boundaries (today inclusive), local-timezone consistency with the rest of rntly.

#### 12.2 Hook (~2 commits)

`web/src/domains/reports/hooks/useReportData.ts` — fetches the three existing lists in parallel via `Promise.all`, derives aggregates during render (no `useEffect` sync, per `react-best-practices.md`).

Returns `{ loading, error, data: { portfolio, leases, tenants } }`. Error is for list bootstrap only; per CLAUDE.md, mutation errors would toast — but this page is read-only so only bootstrap errors apply.

MSW-backed tests: all-success, one-endpoint-500, loading state.

#### 12.3 UI (~3 commits)

`ReportsPage` with three sections, using existing `<StatCard>` / `<StatusBadge>` / `<EmptyState>` / `<Skeleton>` / `<StatCardSkeleton>`.

Heading hierarchy: `<h1>Reports` → `<h2>Portfolio summary` / `<h2>Leases overview` / `<h2>Tenants overview`. Each section renders stat cards on top and an optional table below where a list view adds value (e.g., leases by status with tenant + property columns).

Empty-data behavior: each section renders its own `<EmptyState>` when its source list is empty.

One commit per section.

#### 12.4 E2E + a11y (~2 commits)

- `web/e2e/tests/reports.spec.ts` — navigate via sidebar, assert aggregated values match BE-seeded data. Reuse the `fixtures/seed.ts` helpers.
- Extend the existing axe smoke test to render `<ReportsPage />` and assert zero violations.

---

## 4. Architecture details

### 4.1 New directories / files

```
docs/
├── qa/
│   ├── 2026-04-17-scope-c-round-2-bug-report.md  (NEW — Sprint 8)
│   └── 2026-04-17-a11y-findings.md               (EXTEND — Sprint 10.2, append A11Y-07+)
└── superpowers/
    ├── specs/
    │   └── 2026-04-17-round-2-hardening-design.md (THIS SPEC)
    └── plans/
        ├── 2026-04-17-sprint-8-qa-round-2.md
        ├── 2026-04-17-sprint-9-bugfixes.md
        ├── 2026-04-17-sprint-10-test-hardening.md
        ├── 2026-04-17-sprint-11-ux-polish-r2.md
        └── 2026-04-17-sprint-12-reports.md

web/src/
├── domains/
│   └── reports/                                  (NEW — Sprint 12)
│       ├── index.ts
│       ├── utils/
│       │   ├── aggregate.ts
│       │   └── __tests__/aggregate.test.ts
│       ├── hooks/
│       │   ├── useReportData.ts
│       │   └── __tests__/useReportData.test.ts
│       └── components/
│           ├── PortfolioSummary.tsx
│           ├── LeasesOverview.tsx
│           ├── TenantsOverview.tsx
│           └── __tests__/*.test.tsx
└── shared/
    ├── hooks/                                    (NEW — Sprint 11.1)
    │   ├── useListControls.ts
    │   └── __tests__/useListControls.test.ts
    └── components/ui/
        └── ConfirmDialog.tsx                     (EXTEND — Sprint 11.2, `itemLabel` prop)

web/e2e/
├── pages/
│   └── ReportsPage.ts                            (NEW — Sprint 12)
└── tests/
    ├── error-paths.spec.ts                       (NEW — Sprint 10.1)
    └── reports.spec.ts                           (NEW — Sprint 12)
```

### 4.2 `useListControls` contract (Sprint 11.1)

```ts
type TListControls<TItem> = {
  query: string;
  filter: string | null;
  sort: string;
  setQuery: (q: string) => void;
  setFilter: (f: string | null) => void;
  setSort: (s: string) => void;
  apply: (items: readonly TItem[]) => TItem[];
};

useListControls<TItem>(config: {
  searchFields: (keyof TItem)[];
  filterField?: keyof TItem;
  sortFields: { label: string; compare: (a: TItem, b: TItem) => number }[];
  defaultSort?: string;
}): TListControls<TItem>;
```

URL keys: `?q=`, `?filter=`, `?sort=`. Empty string removes the key. `apply()` is a pure derivation — no state, no effects.

### 4.3 Reports aggregation contracts (Sprint 12.1)

Signatures above in §3.12.1. Implementation notes:

- `avgRent` returns `0` for empty input (not `NaN`).
- `upcomingRenewalsNext30Days` compares `lease.end_date` against `today + 30d`, local timezone.
- `active` = `today` is within `[start_date, end_date]` inclusive.
- `upcoming` = `start_date > today`.
- `ended` = `end_date < today`.

### 4.4 Playwright 500-injection (Sprint 10.1)

Route interception is test-local:

```ts
await page.route('**/properties', (route) =>
  route.fulfill({ status: 500, body: '{}' }),
);
```

No FE simulate-error query param. No dev-only BE handler. `BasePage` gets a `mockApiError(urlPattern: string, status: number)` helper so test bodies stay readable.

### 4.5 Confirm-dialog API change (Sprint 11.2)

New optional prop `itemLabel: string`. When present, it renders between the title and description and is included in the accessible name of the dialog. Backwards-compatible: omitting `itemLabel` preserves the existing rendering. Tests assert both shapes.

### 4.6 Reports hook data flow (Sprint 12.2)

```
ReportsPage
  └── useReportData()
        ├── Promise.all([propertiesApi.getAll(), tenantsApi.getAll(), leasesApi.getAll()])
        ├── useMemo(() => aggregate(...), [properties, tenants, leases])
        └── returns { loading, error, data }
```

No mutation API. Read-only page — no toast infrastructure beyond the existing error paths inherited from list hooks.

---

## 5. Quality gates

Every sprint boundary requires:

- `npm run lint` exit 0
- `npx tsc --noEmit` exit 0
- `npm test` exit 0 (tests never decrease)
- `npm run build` exit 0
- Sprint 10+: `npm run test:e2e` exit 0 (requires `make dev` running locally)
- Sprint 12: the extended axe smoke test covers `/reports`

---

## 6. Commit discipline (unchanged from prior spec)

- One logical unit per commit.
- Conventional commit prefixes: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`.
- Keep `refactor`, not `ref` — preserves rntly history.
- No `Co-Authored-By` lines (per user rule).
- Every commit compiles and tests pass.
- Bugfix commit bodies reference `BUG-###` from the Sprint 8 report.
- A11y fix commit bodies reference `A11Y-##` from the findings doc.

---

## 7. Totals (rough)

| Sprint | Commits    | Theme                             |
| -----: | ---------: | --------------------------------- |
|      8 | ~2         | QA round 2: bug report (no fixes) |
|      9 | ~5–15      | Polish: fix bugs from Sprint 8    |
|     10 | ~12        | Test hardening                    |
|     11 | ~10        | UX polish round 2                 |
|     12 | ~9         | `/reports` page (FE-only)         |
| **Total** | **~38–48** |                                   |

Order is strict: 8 → 9 → 10 → 11 → 12.

---

## 8. Non-goals reminder

- No backend changes.
- No new product domains beyond `/reports`.
- No charting library. Stat cards and tables only.
- No feature flags, Sentry, i18n, or design-system extraction.
- `/contracts`, `/transactions`, `/settings` stay stubs.
- No further test-directory migration — Sprint 6 closed that.
