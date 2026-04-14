# FE Scope C — Full Product Shell

**Date:** 2026-04-14
**Scope:** Frontend only (`web/`)
**Backend state:** Properties/Tenants/Leases CRUD already shipped on `http://localhost:8080` (see `cmd/api/main.go`). No backend work in this spec.

---

## 1. Goal

Bring the rntly frontend from "Properties-only prototype" to a coherent product shell: Tenants, Leases, Property Detail, and a live Dashboard — all matching the lovable.app template provided by the user, all with tested hooks and clean DDD boundaries.

**Out of scope:**
- Search, filters, grid/list toggle (deferred — template shows them, plan does not implement)
- Light/dark mode toggle (deferred)
- Contracts, Transactions, Reports, Settings pages (stay as placeholders)
- Tenant detail page and Lease detail page (list views only; property detail is the only detail page in scope)
- Real transactions data (Dashboard shows a Recent Leases section instead)
- Any backend change
- MSW / integration tests (unit-test depth only)

---

## 2. Success criteria

A reviewer running `make dev` + `npm run dev -- --port 3333` sees:

1. **Dashboard** with four live stat cards, three latest properties, and a "Recent Leases" strip — all data sourced from the three existing REST domains via `Promise.all`.
2. **Properties list** — existing page, now using shared primitives (`PageHeader`, `Loading`, `ErrorBanner`, `StatCard`), with cards linking to a working detail page.
3. **Property detail** at `/properties/:id` with header, hero, four info cards, five tabs (Overview, Tenant, Contracts, Financials, Maintenance), Edit modal, Delete with confirm.
4. **Tenants list** — matches template: top stat cards, grid of tenant cards with avatar initials, create modal.
5. **Leases list** — top stat cards, grid of lease cards, create modal with property/tenant pickers.
6. `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` all green.
7. Every hook in the three domains has unit tests. Shared utilities have unit tests.

---

## 3. Architecture

### 3.1 Domain layout

```
src/domains/
├── properties/
│   ├── api/          types.ts, api.ts, index.ts               (existing)
│   ├── hooks/        useProperties, useProperty,               (useProperty is new)
│   │                 useCreatePropertyForm, useEditPropertyForm
│   ├── components/   PropertyCard, CreatePropertyForm,         (+new detail components)
│   │                 EditPropertyForm,
│   │                 PropertyDetailHeader, PropertyDetailHero,
│   │                 PropertyInfoCards, PropertyStatCards,
│   │                 OverviewTab, TenantTab, ContractsTab,
│   │                 FinancialsTab, MaintenanceTab
│   ├── utils/        NEW — formatters + predicates, unit-tested
│   └── index.ts      barrel
├── tenants/
│   ├── api/          existing
│   ├── hooks/        useTenants, useCreateTenantForm, useTenantStats
│   ├── components/   TenantCard, CreateTenantForm, TenantStatCards
│   ├── utils/        NEW
│   └── index.ts
├── leases/
│   ├── api/          existing
│   ├── hooks/        useLeases, useLeasesByProperty, useLeasesByTenant,
│   │                 useCreateLeaseForm, useLeaseStats
│   ├── components/   LeaseCard, CreateLeaseForm, LeaseStatCards
│   ├── utils/        NEW
│   └── index.ts
└── dashboard/
    ├── hooks/        useDashboardStats
    ├── components/   DashboardStatCards, YourPropertiesSection, RecentLeasesSection
    └── index.ts
```

### 3.2 Consumer boundary rules

- **Pages import only from `@/domains/<name>`** via barrels. Never from internals (`@/domains/tenants/hooks/...` is forbidden).
- **Cross-domain imports allowed only from `dashboard/`** and only importing *hooks and types*, never components. Dashboard aggregates; it does not render other domains' UI.
- **Domains never import from other domains** (except the dashboard exception above). If Property Detail's `TenantTab` needs tenant data, it goes through its own `useLeasesByProperty` hook plus a shallow read from the leases barrel.

### 3.3 Shared layer

```
src/shared/
├── api/
│   └── client.ts                base URL from VITE_API_URL w/ fallback
├── components/
│   ├── ui/                      NEW subfolder — reorganisation
│   │   ├── Loading.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBanner.tsx
│   │   ├── StatCard.tsx
│   │   ├── PageHeader.tsx
│   │   ├── DetailTabs.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── Modal.tsx            (moved)
│   │   ├── StatusBadge.tsx      (moved)
│   │   ├── FormField.tsx        (moved)
│   │   └── FormSelect.tsx       (moved)
│   └── index.ts                 barrel
├── hooks/                       NEW — cross-domain reusable hooks
│   └── (added if a third copy appears; starts empty)
├── utils/                       NEW
│   ├── format.ts                formatCurrency, formatDate, initials
│   └── format.test.ts
├── icons/                       existing
├── layouts/                     existing
└── lib/                         existing
```

### 3.4 Testing strategy (Scope A)

- **Framework:** Vitest 1.x + @testing-library/react + @testing-library/jest-dom + jsdom
- **What is tested:**
  - Every hook in every domain (happy path + error path + any derivation logic)
  - Every file in `shared/utils/` and `domains/*/utils/`
- **What is NOT tested:** component render assertions, DOM snapshot tests, integration flows. Components stay presentational; domain logic is in hooks.
- **API mocking:** `vi.mock('../api')` at hook test boundary. No MSW.
- **Location:** `foo.ts` → `foo.test.ts` co-located.
- **Command:** `npm test` runs once; `npm run test:watch` watch mode; `npm run coverage` for report.

### 3.5 Conventions kept as-is

- `T` prefix for types (`TProperty`, `TTenant`, `TLease`), three variants per entity.
- Barrel exports per domain (`index.ts`).
- `@/` alias for cross-boundary imports; relative imports within a domain.
- Tailwind 4 via `@tailwindcss/postcss` (no config file).
- Axios via `shared/api/client.ts` singleton.
- No `console.log` in committed code.
- Early return, functional `setState`, derive state during render (per `web/.claude/rules/react-best-practices.md`).

---

## 4. Sprint 0 — Foundation (14 commits)

**Goal:** every primitive feature sprints lean on is ready and tested. No new features yet.

### 4.1 Commits

**C0.1 — `chore(web): add Vitest + RTL + jsdom`**
- Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@vitest/coverage-v8`
- `vite.config.ts` → `defineConfig` with `test: { environment: 'jsdom', globals: true, setupFiles: './tests/setup.ts' }`
- `tests/setup.ts` → `import '@testing-library/jest-dom/vitest'`
- `tsconfig.app.json` add `"types": ["vitest/globals", "@testing-library/jest-dom"]`
- `package.json` add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"coverage": "vitest run --coverage"`
- Sanity test: `tests/sanity.test.ts` with one `expect(1 + 1).toBe(2)`
- **Gate:** `npm test` green.

**C0.2 — `chore(web): read API URL from VITE_API_URL with fallback`**
- `.env.example`: `VITE_API_URL=http://localhost:8080`
- `.env.local` added to `.gitignore` if missing
- `shared/api/client.ts`: `baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080'`

**C0.3 — `feat(shared/ui): add Loading component`**
- `shared/components/ui/Loading.tsx`: small centered spinner + optional label prop
- `Loading.test.tsx`: renders with default and custom label
- Props: `{ label?: string }`, default label "Loading..."

**C0.4 — `feat(shared/ui): add EmptyState component`**
- Props: `{ title: string; description?: string; action?: ReactNode }`
- Centered stone-500 text, icon slot optional
- Test: renders title+description; renders action when provided

**C0.5 — `feat(shared/ui): add ErrorBanner component`**
- Props: `{ message: string; onRetry?: () => void }`
- Red-50 bg, red-700 text, optional retry button
- Test: renders message; calls onRetry on click when supplied

**C0.6 — `feat(shared/ui): add StatCard component`**
- Props: `{ label: string; value: string | number; icon: ReactNode; delta?: { value: string; positive: boolean } }`
- Layout matches template: label (stone-500 sm), value (2xl font-bold), icon pill right, delta text below value (emerald-600 positive, red-600 negative)
- Test: renders required props; applies delta color classes correctly per `positive` flag

**C0.7 — `feat(shared/ui): add PageHeader component`**
- Props: `{ title: string; subtitle?: string; actions?: ReactNode; backHref?: string }`
- `title` 2xl bold; `subtitle` sm stone-500; `actions` right-aligned slot; `backHref` renders a chevron-left link
- Test: renders title; renders subtitle/actions/back when present

**C0.8 — `feat(shared/ui): add ConfirmDialog component`**
- Built on existing `Modal`
- Props: `{ open: boolean; title: string; message: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void; onCancel: () => void }`
- Destructive variant turns confirm button red-700
- Test: confirm/cancel callbacks fire; destructive applies red styling

**C0.9 — `feat(shared/utils): add formatCurrency, formatDate, initials`**
- `shared/utils/format.ts`:
  - `formatCurrency(n: number): string` — `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })`
  - `formatDate(iso: string): string` — `Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })`, returns `""` for invalid input
  - `initials(first: string, last: string): string` — `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
- `format.test.ts` — happy paths, empty strings, invalid dates, negative amounts

**C0.10 — `refactor(shared): move existing components into ui/ subfolder`**
- Move `FormField`, `FormSelect`, `Modal`, `StatusBadge` to `shared/components/ui/`
- Add `shared/components/index.ts` barrel re-exporting all ui components
- Update every existing import site to import from barrel

**C0.11 — `refactor(properties): adopt PageHeader + Loading + ErrorBanner on PropertiesPage`**
- `PropertiesPage.tsx`: replace ad-hoc `<div>Loading...</div>` with `<Loading />`
- Replace ad-hoc error banner with `<ErrorBanner />`
- Replace manual flex header with `<PageHeader title="Properties" actions={<AddButton />} />`

**C0.12 — `refactor(app): lazy-load route pages with Suspense fallback`**
- `app/routes.tsx`: convert all 8 page imports to `React.lazy`
- Wrap `<Routes>` in `<Suspense fallback={<Loading />}>`
- Verify production build chunks split per route

**C0.13 — `test(properties): add useProperties hook tests`**
- `useProperties.test.ts`:
  - fetches on mount, returns data
  - `createProperty` calls api then refetches
  - `deleteProperty` calls api then refetches
  - fetch error sets error message, loading false
  - create error sets error message

**C0.14 — `fix(properties): wire deleteProperty to PropertyCard menu`**
- Add overflow menu button on `PropertyCard` (three dots, like template)
- Menu: "Delete" item → opens `ConfirmDialog` → calls `deleteProperty` from context/prop
- Hook prop drilling: `PropertiesPage` passes `onDelete={deleteProperty}` to each card
- Manual verification: create a property, delete it, list refreshes

### 4.2 Sprint 0 quality gate

Before Sprint 1 starts, in this order:
```
npm run lint && npx tsc --noEmit && npm test && npm run build
```
All four must exit 0. If any fail, a fix-up commit precedes Sprint 1.

---

## 5. Sprint 1 — Tenants domain (7 commits)

**Goal:** Tenants list page fully functional, matching template exactly.

### 5.1 Commits

**C1.1 — `feat(tenants): add useTenants hook`**
- `domains/tenants/hooks/useTenants.ts` mirroring `useProperties` shape
- Returns `{ tenants, loading, error, createTenant, deleteTenant }`
- `useTenants.test.ts` — same coverage as C0.13 for `useProperties`

**C1.2 — `feat(tenants/utils): add tenant status + payment helpers`**
- `domains/tenants/utils/tenant.ts`:
  - `fullName(t: TTenant): string`
  - `isActiveTenant(t: TTenant, leases: TLease[]): boolean` — has an active lease today
  - `paymentRateLabel(rate: number): { label: string; positive: boolean }` — e.g. `{label:'100%', positive:true}` for >= 90%, `{..., positive:false}` otherwise
- `tenant.test.ts`

**C1.3 — `feat(tenants): add TenantCard component`**
- Match template: avatar circle (initials, stone-200 bg), name (bold), status pill ("Active" emerald / "Overdue" red)
- Contact rows: email (icon + text), phone (icon + text), property (icon + text — rendered only if `property` prop supplied)
- Dates row: start — end (rendered only if `lease` prop supplied)
- Bottom row: "Monthly Rent $X,XXX" left, "Payment Rate XX%" right (rendered only if `lease` prop supplied)
- Props: `{ tenant: TTenant; lease?: TLease; property?: TProperty }` — consumer passes joined data
- **Graceful degradation:** in Sprint 1, `TenantsPage` passes only `tenant` (no leases domain yet); card renders tenant-native fields only. Sprint 2 adds a commit (C2.9) that enriches the page with lease + property joins, filling in the remaining rows.

**C1.4 — `feat(tenants): add CreateTenantForm component`**
- Fields: `first_name`, `last_name`, `email`, `phone` (all required)
- Built on `FormField` shared component
- Email validated via simple regex (`/^\S+@\S+\.\S+$/`) — surfaces inline error
- Submit disabled until all valid
- Props: `{ onSubmit: (t: TTenantCreate) => Promise<void>; onCancel: () => void }`

**C1.5 — `feat(tenants): add useCreateTenantForm hook`**
- Mirrors `useCreatePropertyForm`:
  - `values`, `errors`, `setField`, `isValid`, `submit`, `reset`
- `useCreateTenantForm.test.ts` — validation rules, submit pathway, reset

**C1.6 — `feat(tenants): add useTenantStats hook`**
- Input: tenants + leases (passed in from `TenantsPage`)
- Derives during render (no useEffect):
  - `activeTenants` — count with active lease
  - `monthlyRevenue` — sum of `rent_amount` over active leases
  - `onTimePayments` — placeholder (no payments BE yet) — active count minus overdue
  - `overduePayments` — placeholder (0 until payments exist; kept in signature for template parity)
- `useTenantStats.test.ts`

**C1.7 — `feat(tenants): wire TenantsPage with list, stats, modal create`**
- Page composes: `PageHeader` ("Tenants" / "Manage tenant information and payment history" / "+ Add Tenant" action)
- `TenantStatCards` (4× `StatCard`) from `useTenantStats`
- Search bar placeholder (disabled visually — filter sprint not done yet). Kept as `<div className="..."/>` with TODO or simply omitted? **Decision: omit entirely in this sprint.** Deferred items do not land dead UI.
- Tenant grid: 3-col on xl, 2-col on md, 1-col base
- Empty state via `EmptyState`
- Create modal: `CreateTenantForm` on top of shared `Modal`

### 5.2 Sprint 1 quality gate

Same four commands green.

---

## 6. Sprint 2 — Leases domain (9 commits)

**Goal:** Leases list page functional; leases are referenceable from future property detail page.

### 6.1 Commits

**C2.1 — `feat(leases): add useLeases hook`**
- Returns `{ leases, loading, error, createLease, updateLease, deleteLease }`
- `useLeases.test.ts` — fetch / create / update / delete / error paths

**C2.2 — `feat(leases): add useLeasesByProperty hook`**
- Accepts `propertyId: string`
- Calls `GET /properties/:id/leases` (new endpoint wired in `leasesApi.listByProperty(propertyId)` — add to api.ts)
- Returns `{ leases, loading, error }`
- `useLeasesByProperty.test.ts`

**C2.3 — `feat(leases): add useLeasesByTenant hook`**
- Mirror of C2.2 for `/tenants/:id/leases`
- Used later by dashboard/tenant join logic

**C2.4 — `feat(leases/utils): add lease date helpers`**
- `domains/leases/utils/lease.ts`:
  - `isActiveLease(lease: TLease, now = new Date()): boolean` — start ≤ now ≤ end, status === 'active'
  - `daysRemaining(lease: TLease, now = new Date()): number`
  - `isEndingSoon(lease: TLease, withinDays = 30, now = new Date()): boolean`
  - `leaseDisplayStatus(lease: TLease): 'active' | 'ending-soon' | 'ended' | 'upcoming'`
- `lease.test.ts` covering all branches + edge cases (same-day, past, future)

**C2.5 — `feat(leases): add LeaseCard component`**
- Shows: property name (bold), tenant name, date range, rent amount, deposit, status pill derived from `leaseDisplayStatus`
- Props: `{ lease: TLease; property?: TProperty; tenant?: TTenant }`
- Presentational only in Sprint 2. No navigation — property detail route does not exist yet. Sprint 3 may (optionally) add a "View Property" link on the card; if so, that is part of C3.11's scope.

**C2.6 — `feat(leases): add CreateLeaseForm component`**
- Fields: `property_id` (FormSelect of properties), `tenant_id` (FormSelect of tenants), `start_date` (date input), `end_date` (date input), `rent_amount`, `deposit`
- Consumer passes `properties: TProperty[]` and `tenants: TTenant[]` for the selects
- Default `rent_amount` to selected property's `rent_amount` if user hasn't touched the field (nice-to-have)

**C2.7 — `feat(leases): add useCreateLeaseForm hook`**
- Validation:
  - all fields required
  - `new Date(end_date) > new Date(start_date)`
  - rent_amount > 0, deposit >= 0
- `useCreateLeaseForm.test.ts`

**C2.8 — `feat(leases): wire LeasesPage with list, stats, modal create`**
- `useLeases`, `useProperties`, `useTenants` in parallel via independent hooks — React schedules them together, no waterfall
- `LeaseStatCards`: Active Leases / Ending Soon (30d) / Total Monthly Rent / Ended
- Grid of `LeaseCard` joined with property + tenant from their domain lists via id lookup (`Map<id, T>` built once with `useMemo`)
- Empty state, create modal

**C2.9 — `feat(tenants): enrich TenantsPage with lease + property joins`**
- `TenantsPage` now also consumes `useLeases` and `useProperties`
- For each tenant, find their most recent active lease (via `isActiveLease` + latest `start_date`), then resolve its property
- Pass `{ tenant, lease, property }` into `TenantCard` — card now renders property row, date range, rent, payment rate (template-matching)
- No changes to Sprint 1's `TenantCard` API (optional props introduced in C1.3 now get supplied)

### 6.2 Sprint 2 quality gate

Same four green.

---

## 7. Sprint 3 — Property detail + edit/delete (13 commits)

**Goal:** `/properties/:id` route live, matching template; properties become editable and deletable.

### 7.1 Commits

**C3.1 — `feat(properties): add useProperty hook`**
- Accepts `id: string`, fetches single property, returns `{ property, loading, error, refetch }`
- `useProperty.test.ts`

**C3.2 — `feat(shared/ui): add DetailTabs component`**
- Controlled tabs: `{ tabs: { id: string; label: string; content: ReactNode }[]; activeId: string; onChange: (id: string) => void }`
- Uncontrolled variant via default active id (optional `defaultActiveId` prop)
- Tab strip styling matches template: active tab underline stone-800, inactive stone-500
- `DetailTabs.test.tsx` — click switches tab, controlled state honored

**C3.3 — `feat(properties): add PropertyDetailHeader`**
- Back chevron → `navigate(-1)` or `/properties`
- Title + address subtitle
- Status badge (existing `StatusBadge`)
- Actions slot (Edit button)
- Built on `PageHeader` with `backHref`

**C3.4 — `feat(properties): add PropertyDetailHero`**
- Large rounded image (16:9 aspect)
- Bottom-left overlay: `{type}` small, `${rent}/mo` large
- Bottom-right overlay: chip row of amenities (first 3 + "+N" fallback)
- If `image_url` missing: stone-200 placeholder with building icon

**C3.5 — `feat(properties): add PropertyInfoCards`**
- 4 cards: Bedrooms / Bathrooms / Monthly Rent / Size (sq ft)
- Uses `StatCard` with building/bed/bath/ruler icons
- Size / bathrooms / amenities are FE-only optional fields — render "—" when missing

**C3.6 — `feat(properties): add OverviewTab`**
- Left: "Property Details" card (Type, Year Built, Square Footage, Status, Description)
- Right: "Amenities" card (chip list)
- Both fields optional on type; fallback copy when missing

**C3.7 — `feat(properties): add TenantTab`**
- Uses `useLeasesByProperty(propertyId)` to find the active lease (via `isActiveLease`)
- Renders compact tenant card (`TenantCard` from tenants domain is OK to import via its barrel — this is a **page-level** composition, and a page may import multiple domain barrels)
- Empty state: "No active tenant" + CTA "Create Lease" (opens lease create modal — Sprint 2 component reused)

**C3.8 — `feat(properties): add ContractsTab`**
- Lease history for this property via `useLeasesByProperty`
- Compact list (not full `LeaseCard`): each row shows tenant, date range, rent, status
- Empty state: "No leases yet"

**C3.9 — `feat(properties): add FinancialsTab + MaintenanceTab placeholders`**
- Both render a centered "Coming soon" card. Keeps tab strip complete to match template without pretending to work.

**C3.10 — `feat(app): add /properties/:id route + PropertyDetailPage`**
- Route added in `app/routes.tsx` (lazy)
- `pages/PropertyDetailPage.tsx`: composes header → hero → info cards → `<DetailTabs>` with the 5 tabs above
- Tab state in URL via `useSearchParams` (`?tab=overview`) for shareable links
- Loading: `<Loading />`; error: `<ErrorBanner message={error} />`

**C3.11 — `feat(properties): link PropertyCard to detail page`**
- Wrap card in `<Link to={`/properties/${id}`}>`
- Delete menu stops propagation so clicking menu doesn't navigate

**C3.12 — `feat(properties): add EditPropertyForm component`**
- Thin wrapper around `CreatePropertyForm`: accepts `initialValues: TProperty` + `onSubmit: (u: TPropertyUpdate) => Promise<void>`
- Extend `useCreatePropertyForm` to accept optional `initialValues`, rename as needed or add a sibling `useEditPropertyForm` (decision: sibling hook — keeps each hook's purpose obvious)

**C3.13 — `feat(properties): wire edit + delete on detail page`**
- Edit button → `Modal` with `EditPropertyForm`
- Header shows kebab menu with Delete → `ConfirmDialog` → `useProperties().deleteProperty` → navigate back
- After edit: `refetch()` from `useProperty`

### 7.2 Sprint 3 quality gate

Same four green.

---

## 8. Sprint 4 — Dashboard (5 commits)

**Goal:** Dashboard shows live data matching template's structure.

### 8.1 Commits

**C4.1 — `feat(dashboard): add useDashboardStats hook`**
- Fires `propertiesApi.getAll()`, `tenantsApi.getAll()`, `leasesApi.getAll()` via `Promise.all` in a single effect
- Returns `{ stats, loading, error }` where `stats = { totalRevenue, propertyCount, newThisMonth, tenantCount, occupancyRate, netIncome, netIncomeDelta, revenueDelta, recentProperties, recentLeases }`
- `useDashboardStats.test.ts` — mock the three apis, assert `Promise.all` composition and derivation math

**C4.2 — `feat(dashboard): add DashboardStatCards`**
- 4× `StatCard`: Total Revenue, Properties, Total Tenants, Net Income
- Delta lines match template ("+12.5% from last month", "3 new this month", "92% occupancy rate", "+8.5% from last month")
- Deltas computed in hook; card just renders

**C4.3 — `feat(dashboard): add YourPropertiesSection`**
- Section header: "Your Properties" + "View All →" link to `/properties`
- 3-column grid of the 3 most-recently-updated properties via existing `PropertyCard` (imported from properties barrel — dashboard-only cross-domain exception documented in 3.2)

**C4.4 — `feat(dashboard): add RecentLeasesSection`**
- Template shows "Recent Transactions"; we have no transactions yet — substitute with Recent Leases
- Section header: "Recent Leases" + "View All →" link to `/leases`
- Table: Property · Tenant · Start · Rent · Status (5 most recent)

**C4.5 — `feat(dashboard): wire DashboardPage`**
- Composes: `PageHeader` ("Dashboard" / "Welcome to rntly" / `+ Add Property` action that navigates to `/properties` — no modal from dashboard; user adds properties on the properties page)
- `DashboardStatCards` → `YourPropertiesSection` → `RecentLeasesSection`
- Loading / error / empty handled via shared primitives

### 8.2 Sprint 4 quality gate

Same four green.

---

## 9. Cross-cutting concerns

### 9.1 Error handling

- API errors caught in hooks, mapped to user-friendly string set on `error` state
- `ErrorBanner` is the single UI surface
- Never leak axios error objects, stack traces, or response bodies to the view layer
- Form validation errors live on form hooks, not global error state

### 9.2 Loading states

- Per-page loading = `<Loading />` top-level (replaces the whole content area)
- Per-section (inside a working page) — spinner or skeleton inline, scoped to that section
- Suspense fallback on lazy routes = `<Loading />`

### 9.3 Empty states

- Every list uses `<EmptyState />` with domain-appropriate copy and optional CTA button matching the page's "+Add X" action

### 9.4 No waterfalls

- Any page needing multiple independent fetches uses hooks that each kick off their own fetch in `useEffect` — React runs them in parallel. Where one hook internally needs multiple endpoints (e.g., `useDashboardStats`), it uses `Promise.all` explicitly.

### 9.5 Re-render discipline

- No `useEffect` syncing derived state; all derivations happen during render.
- `useMemo` only on collection lookups (id → entity maps) and expensive calculations, never primitives.
- Default prop values hoisted out of component scope for stable references.
- Hooks built with the functional `setState` form.

### 9.6 Accessibility (basic bar)

- Modals trap focus (existing `Modal` already does via its portal behavior — verify in each consumer)
- All interactive elements are real `<button>` / `<a>` — no clickable divs
- Icons supplied to buttons paired with text or `aria-label`
- Status badges use color + text, never color alone

### 9.7 Security (per `web/.claude/rules/security.md`)

- No `dangerouslySetInnerHTML` introduced
- No `eval` / `new Function`
- No secrets committed
- URL params (`/properties/:id`) treated as untrusted; TypeScript already narrows them to `string | undefined`, but any downstream use in an API call passes them through the axios url template unchanged (safe), never string-concat into HTML

---

## 10. File-size discipline

Per `web/.claude/rules/coding-style.md`: ≤800 lines/file, typical 200–400. All components in this plan are small enough (<200 LOC) that this is not a constraint, but any file that grows past 400 during implementation prompts an immediate split.

---

## 11. Commit discipline ("baby commits")

- One logical unit per commit (usually 1 file + its test, or a move refactor affecting imports only)
- Conventional commits: `feat(domain): ...`, `fix(domain): ...`, `refactor(domain): ...`, `chore(web): ...`, `test(domain): ...`, `docs(…): …`
- No "Co-Authored-By" lines (per user global rules)
- Each sprint ends with lint + typecheck + tests + build green; a fix-up commit is allowed only if the last feature commit broke a gate
- Every sprint commit boundary is independently bisectable

---

## 12. Totals

| Sprint | Commits | Theme |
|-------:|--------:|-------|
| 0 | 14 | Foundation: tooling, primitives, env, lazy routes |
| 1 | 7 | Tenants domain |
| 2 | 9 | Leases domain + tenant card enrichment |
| 3 | 13 | Property detail + edit/delete |
| 4 | 5 | Dashboard wiring |
| **Total** | **48** | |

Order is strict: 0 → 1 → 2 → 3 → 4. Sprint 3 depends on Sprint 2's `useLeasesByProperty`. Sprint 4 depends on all three.

---

## 13. Non-goals reminder

- No backend change. If a template feature requires a backend field (e.g., `amenities`, `year_built`, `payment_rate`, `on_time_payments`, real transactions), the FE treats the field as optional and renders gracefully when absent. A follow-up BE spec would formalize any new fields — out of scope here.
- No search/filter UI — deferred. Dead UI stubs are not committed.
- No light/dark theme — deferred.
- No test framework beyond Vitest + RTL + jsdom. No Playwright, no MSW, no Storybook in this plan.
