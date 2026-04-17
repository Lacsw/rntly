# Sprint 2 — Bug Fix Implementation Plan

> **For agentic workers:** Execute inline. One fix per commit. Add regression tests only for hook/utility logic (Sprint 3 Playwright will cover visual paths).

**Goal:** Close every critical and important bug from `docs/qa/2026-04-16-scope-c-bug-report.md`. Minor bug (BUG-007) falls out of BUG-001 direction.

**Scope decision:** FE-only path (spec §1 "Out of scope: BE changes"). BUG-001 resolved by removing dropped fields from the FE form + types, not by extending the BE.

**Tech stack:** React 19, TypeScript strict, Vitest 4.

**Spec reference:** `docs/superpowers/specs/2026-04-16-qa-and-polish-design.md` §3 (Sprint 2).

---

## Commit plan

Each step produces a single atomic commit. Verify after each: `npm run lint && npx tsc --noEmit && npm test` green.

### Step 1 — BUG-001 + BUG-007: drop phantom FE fields

- [ ] Remove `name`, `city`, `bathrooms` from:
  - `web/src/domains/properties/api/types.ts` (`TProperty`, `TPropertyCreate`, `TPropertyUpdate`)
  - `AddPropertyModal` (form state, inputs, submit payload)
  - `EditPropertyModal` (if separate — else the same modal)
  - `PropertyCard` (remove `displayName = property.name ?? property.address` → just use address)
  - `PropertyDetailHeader` (title = address)
  - `PropertyDetailHero` (displayName = address)
  - `PropertyInfoCards` (remove Bathrooms stat if present)
- [ ] Update unit tests to drop these fields from mocks
- [ ] Commit: `refactor(properties): drop name/city/bathrooms — BE has no schema for them`

### Step 2 — BUG-002: close Modal on Escape

- [ ] `shared/components/ui/Modal`: add `useEffect` listening for `keydown` `Escape` → `onClose()` when open
- [ ] Guard on `open` prop so closed modals don't swallow Escape
- [ ] Add unit test: render Modal, fire Escape keyDown on document, expect `onClose` called
- [ ] Commit: `fix(shared/ui): close Modal on Escape key`

### Step 3 — BUG-003: move focus into Modal on open

- [ ] `shared/components/ui/Modal`: on open, focus the first focusable child (use `useEffect` + `querySelector('input, button, [tabindex]:not([tabindex="-1"])')`). Fallback to the dialog wrapper with `tabIndex={-1}`.
- [ ] Optional: cheap focus trap with Tab / Shift+Tab wraparound — or leave to Sprint 5 if scope creeps.
- [ ] Add unit test: render Modal with an input, expect `document.activeElement` to be the input after open.
- [ ] Commit: `fix(shared/ui): focus first input when Modal opens`

### Step 4 — BUG-004: add Leases to sidebar

- [ ] Find the Sidebar nav-item array (likely `web/src/app/layouts/MainLayout.tsx` or `shared/components/layout/Sidebar.tsx`)
- [ ] Insert `{ label: 'Leases', to: '/leases', icon: <appropriate icon> }` between Tenants and Contracts
- [ ] Commit: `fix(app/layout): add Leases link to sidebar`

### Step 5 — BUG-005: proper 404 empty state

- [ ] `useProperty`: inspect axios error `response?.status === 404` → set a distinguishable error flag (e.g. `notFound: true`)
- [ ] `PropertyDetailPage`: if `notFound`, render `<EmptyState title="Property not found" action={<Link to="/properties">Back to properties</Link>} />`
- [ ] Unit test: add case covering 404 → `notFound === true`, non-404 → error string set
- [ ] Commit: `fix(properties): distinguish 404 from fetch error on detail page`

### Step 6 — BUG-006: numeric inputs

- [ ] `AddPropertyModal`: bedrooms + rent → `type="number"`, `min={0}`, `step={1}` for bedrooms, `step="0.01"` for rent (or keep int if BE stores int)
- [ ] `CreateLeaseModal`: rent + deposit → `type="number"`, `min={0}`
- [ ] If form state currently stores numbers as strings, adjust payload serialization to `Number(value)` at submit (already done in most places, verify)
- [ ] Commit: `fix(shared/ui): use number inputs for money and counts`

---

## Exit checklist

- [ ] All six commits landed on `main`
- [ ] Bug report updated: each BUG-### has `Status: FIXED-in-<sha>`
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build` all green
- [ ] Manual re-verify: open each flow in browser, confirm fixed behavior

---

## Execution order

Steps 1 → 2 → 3 → 4 → 5 → 6 sequentially. Independent in practice but linear keeps git history clean and each commit verifiable.
