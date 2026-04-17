# Sprint 7 — Polish Gaps Implementation Plan

> **For agentic workers:** Execute inline. Verify each commit: `npm run lint && npx tsc --noEmit && npm test && npm run build` all green. UI changes must be walked manually (Vite dev + Chrome MCP) before closing the step.

**Goal:** Close the UX rough edges that the QA+Polish spec did not cover — ones that make rntly feel inconsistent rather than broken. Focus on three visible wins: a unified toast system, loading skeletons, and inline form validation that matches the tenant-email pattern. Optimistic updates included only where they're safe and obviously improve the feel.

**Spec reference:** N/A — not in QA+Polish spec. This plan is the source of truth.

**Scope boundaries:**
- No new product features. Every item is a finish pass on an existing surface.
- No new dependencies beyond one tiny, well-maintained toast library (pick **sonner** — single file, zero context providers required, framework-agnostic). If `sonner` isn't appropriate, build the toaster in-house with React Portal + a hook — decide in Step 1.
- No BE changes. All polish is FE-only.
- Optimistic updates only for delete operations. Create/update stay pessimistic because the server-generated id is needed in the UI.

---

## Commit plan

### Step 1 — Install + wire a toast system

- [ ] `cd web && npm install sonner` (or decide to hand-roll; note the decision in the commit body).
- [ ] `web/src/shared/toast/Toaster.tsx`: default-export a thin wrapper (`<Toaster richColors position="top-right" closeButton />`). Mount it once inside `MainLayout` below the sidebar root.
- [ ] `web/src/shared/toast/useToast.ts`: re-export `toast.success`, `toast.error`, `toast.info` behind a project-owned facade so a future swap-out doesn't require codebase-wide churn.
- [ ] Barrel: `web/src/shared/toast/index.ts` exporting `useToast` + `Toaster`.
- [ ] Smoke test `web/src/shared/toast/__tests__/useToast.test.tsx`: asserts the re-exported fns forward args to sonner.
- [ ] Commit: `feat(shared/toast): add toast system with sonner`

### Step 2 — Replace "Failed to X" inline banners with error toasts

Current pattern: hooks set `error` state, pages render `<ErrorBanner>`. Replace with toasts for transient operation failures (create / update / delete). Keep `ErrorBanner` for fatal list-level failures (e.g., "failed to load tenants" where the whole screen is empty).

- [ ] `useProperties`, `useTenants`, `useLeases`: when a mutation errors, call `toast.error('Failed to X')` from inside the catch block. Remove the error-state-setter for mutation errors. Keep the fetch-error banner for list bootstrap.
- [ ] Pages: delete the `<ErrorBanner>` components that were tied to mutation-only errors. Keep the list-bootstrap banners.
- [ ] Update hook tests accordingly — the `Failed to create X` assertion moves from `result.current.error` to asserting `toast.error` was called (mock the facade in each test file).
- [ ] Manual walk: trigger a failed create via MSW-sim-in-dev or BE-down; verify toast + form stays open with its inputs preserved.
- [ ] Commit: `refactor(domains): surface mutation failures via toasts, not inline banners`

### Step 3 — Success toasts on create / update / delete

- [ ] In each mutation hook (`useProperties.createProperty`, `updateProperty`, `deleteProperty`; same for tenants + leases), on success call `toast.success('Property created')` / `'Property updated'` / `'Property deleted'`. Keep copy short; no emoji.
- [ ] Hook tests: assert `toast.success` fires on success paths.
- [ ] Playwright e2e tests may need an update to wait for the toast before proceeding (or tear down the toast first if it covers UI). Check `e2e/tests/*.spec.ts`.
- [ ] Commit: `feat(domains): confirm mutations with success toasts`

### Step 4 — Loading skeletons for list pages

Replace the current `Loading...` text on the three list pages.

- [ ] `web/src/shared/components/ui/Skeleton.tsx`: a zero-logic div with `className="animate-pulse bg-neutral-200 rounded"`. Accept `className` for dimensional overrides. No deps beyond Tailwind.
- [ ] `web/src/shared/components/ui/__tests__/Skeleton.test.tsx`: render + presence assertion.
- [ ] `PropertyCardSkeleton`, `TenantCardSkeleton`, `LeaseCardSkeleton`: compose the grid shape with `<Skeleton>` blocks matching the real card height. Co-locate in each domain's components folder.
- [ ] Pages: while `loading === true && items.length === 0`, render 6 skeleton cards in the grid. When items arrive, swap.
- [ ] Commit: `feat(shared/ui): add loading skeletons to list pages`

### Step 5 — Dashboard stat tile skeletons

- [ ] Dashboard currently shows zeroed stats during initial fetch. Swap in `StatCardSkeleton` for the Properties / Tenants / Revenue / Occupancy tiles while `loading`.
- [ ] Recent Leases table: show 3 skeleton rows.
- [ ] Commit: `feat(dashboard): add stat tile and recent-leases skeletons`

### Step 6 — Optimistic deletes

- [ ] `useProperties.deleteProperty`: before calling the api, immediately remove the property from local state. On error, re-insert at its original index + surface the error toast. On success, the downstream `fetchProperties()` refetch is now redundant — drop it for deletes only.
- [ ] Same treatment for `useTenants.deleteTenant`, `useLeases.deleteLease`.
- [ ] Tests: update to assert local-state update happens before the api promise resolves. Add an error-path test that asserts the item is restored.
- [ ] Commit: `feat(domains): optimistically remove items on delete, revert on error`

### Step 7 — Inline validation extensions

Extend the tenant-email pattern to the other forms where the current validation is form-level only.

- [ ] `AddPropertyModal` + `EditPropertyModal`: inline errors for Address required, Bedrooms >= 0, Rent >= 0.
- [ ] `CreateLeaseModal`: inline errors on Rent / Deposit (>= 0), and keep the existing end-date > start-date validation visible per-field rather than as a form-level error.
- [ ] Extract a small shared `useFormErrors<T>()` hook (Zod-free, minimal — a record of field → message) so each modal doesn't re-roll its own error map.
- [ ] Hook test for `useFormErrors`.
- [ ] Commit: `feat(shared): add useFormErrors and extend inline validation`

### Step 8 — Copy pass

- [ ] Audit button labels and headings for consistency: "Add Property" vs "+ Add Property"; "Delete" vs "Remove"; "Save" vs "Save Changes". Pick one in each pair and unify across the app.
- [ ] Empty-state copy: verify every empty state has both a title and a CTA (or explicit "no action possible" text).
- [ ] Commit: `refactor(ui): unify button copy and empty-state text`

---

## Exit checklist

- [ ] ~8 commits on `main`.
- [ ] Every list page shows skeletons, not "Loading…", on initial fetch.
- [ ] Every mutation (create/update/delete) fires a success or error toast.
- [ ] Delete feels instant on all three list pages; error path reverts correctly.
- [ ] Every form field in Add/Edit Property, Add Tenant, Create Lease shows inline validation errors.
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build && npm run test:e2e` all green.
- [ ] Playwright e2e still passes — waits updated to account for toasts if needed.

---

## Execution order

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Toast infra (1) must land before 2/3 reference it. Skeletons (4/5) are independent and could be reordered. Optimistic updates (6) depend on toasts (2) for the revert-error surface. Copy pass (8) is last because prior steps introduce new strings.

---

## Risk notes

- **Toast library choice**: sonner is tiny (~3 KB) but adds a transitive dep. If preference is zero new deps, hand-roll in Step 1 — a Portal + `useReducer` + a timer cleanup is ~60 lines. Document the choice and don't revisit.
- **E2E fragility**: toasts auto-dismiss after ~4s. If a Playwright test takes longer than that to assert, the toast is gone. Either extend dismiss duration in tests via a query-param, or match on the toast before assertion timing matters.
- **Optimistic deletes on error**: reverting to the original index requires capturing it at call time. If the list has since been mutated by another concurrent action, insertion may land in the wrong place. Accept this as a known limitation for rntly's single-user scope — don't over-engineer a reducer.
- **Inline validation ≠ form library**: deliberately not pulling in Formik/React-Hook-Form. If validation needs grow past ~5 fields per form, reconsider, but do NOT swap libraries mid-sprint.
- **StrictMode**: optimistic updates can double-fire in DEV because mutations run twice. Guard with an in-flight ref or accept the visual flicker in DEV only; assert behavior in build mode.
