# Sprint 1 — Manual Exploratory QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or just execute inline — this sprint produces a single bug-report doc, not code. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Walk every user-visible surface of the scope-C app methodically, capture findings into a single structured bug report at `docs/qa/2026-04-16-scope-c-bug-report.md`. No code fixes.

**Architecture:** Two-phase — (1) environment setup with both servers running, (2) systematic walkthrough against a pre-defined checklist. Bugs captured as they surface, not at the end. Uses Chrome MCP tools for DOM interaction and console capture.

**Tech Stack:** Browser + MCP (mcp__claude-in-chrome__*), curl for BE smoke checks. No code changes.

**Spec reference:** `docs/superpowers/specs/2026-04-16-qa-and-polish-design.md` section 3 (Sprint 1).

---

## Output location

`docs/qa/2026-04-16-scope-c-bug-report.md` — a structured doc with a preamble describing methodology and environment, then one ## BUG-### block per finding.

## Bug block format

```
## BUG-###: Short title
- **Severity:** critical | important | minor
- **Surface:** /page or component path
- **Repro:**
  1. Numbered steps
  2. …
- **Expected:** What should happen
- **Actual:** What happens
- **Notes:** optional context, console output, network response
- **Status:** OPEN
```

Severity definitions:
- **critical** — broken flow, data loss risk, infinite loops, blocks user from completing a primary task
- **important** — visible wrong behaviour, accessibility violation caught by keyboard walk, error silently swallowed, stale state shown
- **minor** — cosmetic drift from template, copy awkwardness, missing polish that doesn't block use

---

## Task 1: Environment setup

**Purpose:** Both servers running against a live Postgres. FE on 5173 (matches BE CORS whitelist).

- [ ] **Step 1: Confirm backend health**

```bash
curl -s -o /dev/null -w "be:%{http_code}\n" http://localhost:8080/health
```

Expected: `be:200`. If not, run `cd /Users/romanfrolov/dev/rntly && make dev` in a dedicated terminal or via background task.

- [ ] **Step 2: Start Vite on 5173 from main**

```bash
cd /Users/romanfrolov/dev/rntly/web && npm run dev -- --port 5173 --strictPort
```

Run in background. Confirm `VITE v7.3.0 ready` appears in its log output.

- [ ] **Step 3: Create `docs/qa/` directory and seed the report**

Create `docs/qa/2026-04-16-scope-c-bug-report.md` with the preamble scaffold (methodology, environment, legend) but no bug entries yet.

- [ ] **Step 4: Use tabs_context_mcp to orient the browser**

Use `mcp__claude-in-chrome__tabs_context_mcp` to see current tabs. Create a new tab navigating to `http://localhost:5173/` via `tabs_create_mcp`.

---

## Task 2: Walk Dashboard (/)

- [ ] **Load fresh** — navigate to `/`
- [ ] Capture a screenshot (mental note of layout)
- [ ] Check the 4 stat tiles render values (not NaN, not infinite loader)
- [ ] Check "Your Properties" section — top 3 properties or empty state
- [ ] Check "Recent Leases" table — 5 rows or empty state
- [ ] Click "+ Add Property" button — should navigate to `/properties`
- [ ] Click "View All" link in Your Properties — navigates to `/properties`
- [ ] Click "View All" link in Recent Leases — navigates to `/leases`
- [ ] Read console messages — any warnings/errors?
- [ ] Sidebar: hover every link, verify they don't throw

Log each finding as a BUG-### entry as it occurs.

---

## Task 3: Walk Properties list (/properties)

- [ ] Load `/properties`
- [ ] Verify PageHeader, "+ Add Property" button
- [ ] Verify grid renders with card count matching backend data
- [ ] Click "+ Add Property" → Modal opens
- [ ] Fill out form: name, address, city, type, status, bedrooms, bathrooms, rent
- [ ] Submit with missing required field — verify disabled
- [ ] Submit with all fields — card appears in grid
- [ ] Hover over the new card's kebab (three dots) — verify it appears
- [ ] Click kebab → Delete menu appears
- [ ] Click Delete → ConfirmDialog
- [ ] Cancel → dialog closes, card still there
- [ ] Reopen delete → Confirm → card removed
- [ ] Click a card body (not the kebab) → navigates to `/properties/:id`
- [ ] Console errors during each step

---

## Task 4: Walk Property Detail (/properties/:id)

- [ ] Click a property card to enter detail
- [ ] Verify URL includes property id
- [ ] Header: back chevron, title (name or address), status pill, Edit + Delete buttons
- [ ] Click back chevron → `/properties`
- [ ] Re-enter
- [ ] Hero image / placeholder + rent overlay
- [ ] Info cards row: 4 stats
- [ ] Tab strip: Overview / Tenant / Contracts / Financials / Maintenance — click each, verify URL updates to `?tab=...`
- [ ] Overview: Property Details card + Amenities card (should show "No amenities listed." if BE returns no array)
- [ ] Tenant tab: if property has an active lease shows TenantCard; else EmptyState
- [ ] Contracts tab: lease history table or EmptyState
- [ ] Financials tab: "Coming soon" card
- [ ] Maintenance tab: "Coming soon" card
- [ ] Click Edit → Modal opens with all fields prefilled
- [ ] Change name → Save → modal closes → header updates
- [ ] Click Delete → ConfirmDialog with destructive red button → Confirm → navigate to `/properties`
- [ ] Navigate directly to `/properties/does-not-exist` (type in URL) — verify EmptyState "Property not found"
- [ ] Console errors

---

## Task 5: Walk Tenants (/tenants)

- [ ] Load `/tenants`
- [ ] PageHeader with subtitle "Manage tenant information and payment history"
- [ ] 4 stat tiles: Active / Revenue / On-Time / Overdue
- [ ] Tenant grid — each card: avatar with initials, full name, status pill, email, phone, (property + dates + rent + payment-rate if lease exists)
- [ ] Click "+ Add Tenant" → Modal opens
- [ ] Enter invalid email (`not-an-email`) → error message appears, submit disabled
- [ ] Fix email, fill other required fields → submit enables
- [ ] Submit → new tenant card appears
- [ ] Kill the backend (stop `make dev`) → reload — ErrorBanner "Failed to fetch tenants"
- [ ] Restart backend
- [ ] Console errors

---

## Task 6: Walk Leases (/leases)

- [ ] Load `/leases`
- [ ] PageHeader + 4 stat tiles (Active / Ending Soon / Total Rent / Ended)
- [ ] Lease grid: each card shows property name, tenant name, date range, rent, deposit, status pill
- [ ] Click "+ Create Lease" → Modal opens
- [ ] Pick a property from dropdown
- [ ] Pick a tenant from dropdown
- [ ] Enter start date, enter end date BEFORE start date → error message, submit disabled
- [ ] Fix dates → submit enables
- [ ] Submit → new lease card appears with correct status pill
- [ ] Return to Tenants — verify the tenant whose lease was just created now shows property + dates + rent on their card (enrichment)
- [ ] Return to Dashboard — verify stats updated, Recent Leases shows the new row
- [ ] Console errors

---

## Task 7: Cross-cutting — keyboard-only walkthrough

Use Tab, Shift+Tab, Enter, Escape, arrow keys.

- [ ] Tab from top of Dashboard — focus ring visible, order logical
- [ ] Tab through Properties list — card should be focusable (it's a Link), kebab reachable separately
- [ ] Open Add Property modal via keyboard (Tab to button, Enter). Verify focus moves into the modal
- [ ] Escape — modal closes, focus returns to trigger (if not, that's a bug)
- [ ] Open the property detail kebab menu — Enter to open, Tab to Delete item, Enter, Tab to ConfirmDialog buttons
- [ ] DetailTabs: Tab to the tablist, arrow keys should switch tabs? (may not work — note if missing)
- [ ] Escape the ConfirmDialog
- [ ] Any focus traps? Any unreachable interactive elements?

---

## Task 8: Cross-cutting — error handling

- [ ] With backend running, perform a normal create → observe success
- [ ] Stop backend → attempt create → ErrorBanner appears, form doesn't submit silently
- [ ] Restart backend → next operation succeeds, error banner clears
- [ ] Stop backend → open property detail for a real id → EmptyState or ErrorBanner?
- [ ] Navigate between pages rapidly — any stale loading states or double fetches?

---

## Task 9: Cross-cutting — UX edge cases

- [ ] Rapid double-click on "+ Add Property" — does the modal open twice? Does form submit twice?
- [ ] Close the Add Property modal via backdrop click — verify modal closes, form state resets (open again should show empty)
- [ ] Create a property, delete it immediately — does the list update correctly?
- [ ] Navigate from Dashboard → Properties → Dashboard — do the lazy chunks load without flicker? (Sprint 0 fix-up should have handled sidebar persistence)
- [ ] Refresh on `/properties/:id?tab=contracts` — tab state preserved after reload?
- [ ] Very long property name / tenant name — does anything overflow? text-truncation?
- [ ] Empty database: delete all properties → verify EmptyState on Properties list AND on Dashboard

---

## Task 10: Placeholder pages

- [ ] `/contracts` — renders stub `<h1>Contracts</h1>` + paragraph. Note as "stub, out of scope".
- [ ] `/transactions` — same
- [ ] `/reports` — same
- [ ] `/settings` — same

Not bugs — note in the report's "Placeholder pages" section at the bottom.

---

## Task 11: Write the bug report

- [ ] Compile all findings collected during Tasks 2-9 into `docs/qa/2026-04-16-scope-c-bug-report.md`
- [ ] Group by severity (critical → important → minor)
- [ ] Include a preamble with methodology + environment
- [ ] Include a "Placeholder pages" section at the end
- [ ] Include a "Surfaces verified bug-free" section listing what passed every check
- [ ] Number bugs sequentially BUG-001, BUG-002, ...
- [ ] If no bugs at all — note explicitly "Sprint 1 found no bugs — Sprint 2 skipped"

---

## Task 12: Commit

- [ ] `git add docs/qa/2026-04-16-scope-c-bug-report.md && git commit -m "docs(qa): add scope C exploratory bug report"`

No "Co-Authored-By". Commit message exactly: `docs(qa): add scope C exploratory bug report`.

---

## Exit checklist

- [ ] `docs/qa/2026-04-16-scope-c-bug-report.md` exists and is committed
- [ ] `npm test` still at 141 passed (we shouldn't have changed anything)
- [ ] Both dev servers still running (they can be killed after QA)
- [ ] Bug count + severity breakdown known and surfaced in Sprint 2 planning

---

## Execution order

Linear 1 → 12. Task 1 is setup; Tasks 2-10 are parallel-safe in practice but the same human walks them in order. Task 11 compiles. Task 12 commits.
