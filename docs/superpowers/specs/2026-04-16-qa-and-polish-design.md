# QA + Polish Design Spec

**Date:** 2026-04-16
**Scope:** Frontend only (`web/`). Builds on merged Scope C (141 tests passing across 4 domains).
**Sibling repo referenced:** `/Users/romanfrolov/Portal-WEB/.claude/` — rules, skills, agents, commands.

---

## 1. Goal

Harden rntly's FE after Scope C by (a) adopting a stronger tooling baseline (rules, skills, agents, commands ported from Portal-WEB and adapted), (b) doing a real QA pass on every existing feature, (c) fixing the bugs found, (d) protecting the golden paths with Playwright, (e) tightening hook tests with MSW, and (f) closing accessibility gaps.

**Out of scope:**
- New product features
- BE changes
- Internationalization (rntly is English-only)
- Design-system extraction (rntly has no `ds/` package)
- Sentry or any error-tracking service

---

## 2. Success criteria

- `.claude/` directory in `web/` contains adapted rules, skills, agents, commands. CLAUDE.md references them.
- A bug-report doc inventories every QA finding with severity, repro, and fix status.
- Every critical and important bug from Sprint 1 is fixed. Minor bugs logged and optionally deferred.
- `npm run test:e2e` runs Playwright against a real backend and covers the golden paths for properties, tenants, leases, and property detail (create / read / edit / delete / tab-switch).
- Hook tests use MSW handlers instead of `vi.mock('../api')` where the added realism catches a real bug class (axios error shape, status code branches).
- `@axe-core/react` reports zero critical violations on Dashboard, Properties, Property Detail, Tenants, Leases. Keyboard walkthrough finds no traps.
- All quality gates stay green through every sprint merge: lint 0, tsc 0, unit tests 100% pass, e2e (after Sprint 3) 100% pass, build OK.

---

## 3. Sprint breakdown

### Sprint 0 — Adapt Portal-WEB `.claude` setup (~12 commits)

Install rules, skills, agents, and commands from Portal-WEB into `web/.claude/`, adapted to rntly's stack (no TanStack Query, no Zustand, no i18n, no DS package). Update `web/CLAUDE.md` to reference the new assets.

**Ports (adapted):**
- Rules: `typescript.md`, `react-components.md`, `testing.md`, `e2e.md`, `git.md` (merge — keep `refactor` not `ref`), `security.md` (merge with existing)
- Skills: `unit-test`, `e2e-test`, `react-component`, `url-state`, `documentation`
- Agents: `tdd-guide`, `planner`, `architect`, `refactor-cleaner`
- Commands: `/commit`, `/verify`, `/test-coverage`

**Skipped (N/A for rntly):** `domains.md`, `form-validation`, `api-hooks`, `zustand-store`, `translations`, `error-handling`, `domain-feature`, `code-reviewer` (use superpowers), `security-reviewer`.

**Conventions kept from existing rntly:**
- Co-located `foo.test.ts` next to `foo.ts` (do NOT migrate to `__tests__/`)
- `T`-prefix types (already in place)
- `refactor(...)` commit prefix (NOT `ref`)
- `@/` alias
- `import type` for type-only cross-boundary imports

### Sprint 1 — Manual exploratory QA (~1-2 commits)

Walk every page and flow systematically, capture findings into `docs/qa/2026-04-16-scope-c-bug-report.md`. No code fixes in this sprint.

**Scope of QA:**
- Dashboard: stat tiles reflect real data, links navigate, loading/empty/error states render, sidebar persists across route changes.
- Properties list: create, delete with confirm, card click navigates to detail, empty/error states.
- Property detail: tabs switch and sync URL, Edit modal prefill + save, Delete + confirm + navigate back, Tenant/Contracts tabs reflect real leases, Financials/Maintenance render "coming soon" cleanly.
- Tenants list: create with email validation, stat tiles, enriched cards show property/dates/rent when lease exists.
- Leases list: create with property/tenant pickers + date range validation, stat tiles, cards show status pills with correct variant.
- Cross-cutting: keyboard navigation, focus management in modals, browser back/forward behavior, rapid-click double-submits, error-banner display on backend-down, stale state after delete.
- Non-scope pages: Contracts / Transactions / Reports / Settings are still stubs — note their state but do not test flows.

**Bug report format:**
```
## BUG-###: Short title
- Severity: critical | important | minor
- Surface: /page or component
- Repro: numbered steps
- Expected / Actual
- Notes / screenshots (optional)
- Status: OPEN | FIXED-in-<commit-sha>
```

### Sprint 2 — Polish (fix bugs) (~10-20 commits)

For each critical or important bug: one fix commit, one regression-test commit (or combined) if the bug class is regression-prone. Minor bugs may be batched or deferred at reviewer discretion.

**Commit message format:** `fix(<domain>): <bug summary>` referencing the BUG-### from Sprint 1 in the body.

**Regression-test policy:** add a unit test if the bug is in hook / utility logic. For visual / layout bugs, skip unit tests — Sprint 3 Playwright will cover the user-visible path.

### Sprint 3 — Playwright E2E (~10 commits)

Install Playwright + write golden-path E2E covering:

1. Create a property → appears on Properties list → appears on Dashboard "Your Properties" → navigate to detail → tab through all 5 tabs (URL updates) → Edit save persists → Delete navigates back
2. Create a tenant → appears on Tenants list → TenantCard renders tenant-native fields (lease-enriched row empty until step 4)
3. Create a lease (requires property + tenant from steps 1-2) → appears on Leases list with correct status pill → Dashboard "Recent Leases" shows it → TenantsPage now enriches the tenant with property + dates + rent
4. Delete the lease, then tenant, then property — in that order — cleaning up

**Conventions:**
- Page Object Model under `web/e2e/pages/`, extending a `BasePage` class.
- Selector priority: `getByRole` → `getByLabel` → `getByText`. No `getByTestId`.
- No i18n (single language).
- Fixtures for BE seeding via `beforeAll` hitting the real API (not Playwright mocking).
- CI-ready structure even though rntly has no CI yet — path stays open.
- `npm run test:e2e` + `npm run test:e2e:ui` scripts.

### Sprint 4 — MSW integration tests (~8 commits)

Replace `vi.mock('../api', ...)` in the nine existing hook tests with MSW handlers for each endpoint. This exercises real axios code paths and catches bugs invisible to hard module mocks (e.g., 500-response handling, malformed JSON, timeout behaviour).

**Handlers:** `web/src/tests/msw/handlers.ts` — one per resource with GET/POST/PUT/DELETE.

**Server setup:** `web/src/tests/msw/server.ts` exporting a `setupServer(...)` instance; integrated into `web/src/tests/setup.ts` via `beforeAll`/`afterEach`/`afterAll` hooks for cleanup.

**Per-hook test refactor:** each hook `*.test.ts` imports `server` from `msw/server`, overrides handlers inside tests using `server.use(...)` for error / empty / slow cases. Removes the old `vi.mock('../api')`.

### Sprint 5 — Accessibility audit (~6 commits)

- Install `@axe-core/react`. Add a DEV-only `axe(React, ReactDOM, 1000)` call in `main.tsx` that prints violations to console.
- Walk each page in DEV build, capture violations.
- Fix critical violations in focused commits (e.g. `fix(shared/ui): ensure DetailTabs focus style`).
- Manual keyboard-only walk: verify tab order makes sense, no focus traps, modals trap focus correctly, skip-link not needed for a single-column layout.
- Commit: `test(a11y): add axe-core smoke test` — one Vitest test that renders `<App />` and asserts zero violations.

---

## 4. Architecture details

### 4.1 `.claude/` layout after Sprint 0

```
web/.claude/
├── rules/
│   ├── typescript.md          (adapted from Portal; merged with existing coding-style.md conventions)
│   ├── react-components.md    (adapted)
│   ├── react-best-practices.md  (EXISTING — untouched)
│   ├── coding-style.md          (EXISTING — untouched)
│   ├── security.md              (merged — Portal items added where non-duplicative)
│   ├── testing.md             (NEW — Vitest conventions)
│   ├── e2e.md                 (NEW — Playwright conventions, no i18n)
│   └── git.md                 (NEW — conventional commits, keep `refactor`)
├── skills/
│   ├── unit-test/SKILL.md     (adapted — axios not TanStack Query, rntly hook patterns)
│   ├── e2e-test/SKILL.md      (adapted — no i18n, real-BE fixtures)
│   ├── react-component/SKILL.md
│   ├── url-state/SKILL.md
│   └── documentation/SKILL.md
├── agents/
│   ├── tdd-guide.md
│   ├── planner.md
│   ├── architect.md
│   └── refactor-cleaner.md
└── commands/
    ├── commit.md
    ├── verify.md
    └── test-coverage.md
```

### 4.2 Test structure changes (Sprint 4)

```
web/src/tests/
├── setup.ts                   (EXISTING — add MSW beforeAll/afterEach/afterAll)
├── sanity.test.ts             (EXISTING)
├── msw/
│   ├── server.ts              (NEW — setupServer instance + handlers import)
│   ├── handlers.ts            (NEW — default handlers for all four endpoints)
│   └── factories/
│       ├── property.ts        (NEW — createMockProperty)
│       ├── tenant.ts          (NEW — createMockTenant)
│       └── lease.ts           (NEW — createMockLease)
└── (unit tests stay co-located next to source)
```

### 4.3 E2E structure (Sprint 3)

```
web/e2e/
├── pages/
│   ├── BasePage.ts
│   ├── DashboardPage.ts
│   ├── PropertiesPage.ts
│   ├── PropertyDetailPage.ts
│   ├── TenantsPage.ts
│   └── LeasesPage.ts
├── tests/
│   ├── properties.spec.ts
│   ├── tenants.spec.ts
│   ├── leases.spec.ts
│   └── dashboard.spec.ts
├── fixtures/
│   └── seed.ts                (helpers for BE seeding via axios)
└── playwright.config.ts
```

### 4.4 Accessibility setup (Sprint 5)

- `@axe-core/react` only in DEV (`if (import.meta.env.DEV)` guard)
- Automated check as a Vitest smoke test that renders `<App />` with memory router and asserts no violations
- CLI script `npm run a11y:manual` opens the app in Chromium headless with axe extension

---

## 5. Quality gates

Every sprint boundary requires:
- `npm run lint` exit 0
- `npx tsc --noEmit` exit 0
- `npm test` exit 0 (tests never decrease)
- `npm run build` exit 0
- Sprint 3+: `npm run test:e2e` exit 0 (requires `make dev` running locally; skipped in unit-only runs)

---

## 6. Commit discipline (unchanged from scope C)

- One logical unit per commit
- Conventional commit prefixes: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`
- **Keep `refactor`, not `ref`** — preserves rntly's existing history
- No "Co-Authored-By" lines (per user rule)
- Every commit compiles and tests pass

---

## 7. Totals (rough)

| Sprint | Commits | Theme |
|-------:|--------:|-------|
| 0 | ~12 | Adapt Portal-WEB `.claude` setup |
| 1 | ~2 | QA: bug report (no code fixes) |
| 2 | ~10-20 | Polish: fix bugs from Sprint 1 |
| 3 | ~10 | Playwright E2E |
| 4 | ~8 | MSW integration tests |
| 5 | ~6 | Accessibility audit |
| **Total** | **~48-60** | |

Order is strict: 0 → 1 → 2 → 3 → 4 → 5.

---

## 8. Non-goals reminder

- No new product features
- No backend changes
- No i18n, no Sentry, no Zustand, no TanStack Query
- No `__tests__/` folder migration (co-located tests stay)
- Contracts / Transactions / Reports / Settings pages remain stubs — QA notes their state but does not test flows there
