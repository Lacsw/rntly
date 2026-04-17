# Scope C — Exploratory Bug Report

**Date:** 2026-04-16
**Sprint:** 1 (manual exploratory QA)
**Plan:** `docs/superpowers/plans/2026-04-16-sprint-1-qa-walkthrough.md`
**Spec:** `docs/superpowers/specs/2026-04-16-qa-and-polish-design.md` §3

## Methodology

Driven by Chrome MCP tools against a live FE (Vite on :5173) + BE (Go on :8080) against Postgres. Each surface
walked per the plan's Task 2–10 checklists. Findings logged as they surfaced.

## Environment

- FE: rntly web @ `main`, Vite 7, port 5173
- BE: `make dev`, Go API, port 8080, Postgres @ :5433
- Seed: 9 properties, 2 tenants, 1 lease (all "Ended") before walkthrough

## Legend

- **critical** — broken flow, data loss, blocks primary task
- **important** — wrong behavior, a11y violation, silent error
- **minor** — cosmetic, copy, polish

---

## BUG-001: Property name, city, bathrooms silently dropped by backend

- **Severity:** critical
- **Surface:** `POST /properties`, FE form `AddPropertyModal`, `PropertyCard`, `PropertyDetailHeader`
- **Repro:**
  1. Go to `/properties` and click "+ Add Property"
  2. Fill Name = "QA Test Property", Address = "99 QA Lane", City = "Portland", Type = apartment, Bedrooms = 1, Bathrooms = 1, Rent = 1800
  3. Submit
  4. `curl http://localhost:8080/properties` → returned record is `{address: "99 QA Lane", type: "apartment", bedrooms: 1, rent_amount: 1800, ...}`
- **Expected:** Property persists with `name`, `city`, `bathrooms` so the FE can display them
- **Actual:** BE model (`internal/model/property.go`) has no `Name`, `City`, `Bathrooms` columns. Fields are silently stripped. `PropertyCard` falls back to `property.name ?? property.address` so it renders the address twice and loses user intent entirely.
- **Notes:** FE types (`web/src/domains/properties/api/types.ts`) declare these as optional. Either extend the BE schema or remove the fields from the FE form.
- **Status:** OPEN

---

## BUG-002: Modal does not close on Escape key

- **Severity:** important
- **Surface:** `shared/components/ui/Modal` (all modals: Add/Edit Property, Add Tenant, Create Lease, ConfirmDialog)
- **Repro:**
  1. Open "+ Add Property" modal
  2. Press Escape
- **Expected:** Modal closes, focus returns to trigger button
- **Actual:** Modal stays open. Escape does nothing.
- **Notes:** Backdrop click does close the modal correctly, so only the keyboard path is broken.
- **Status:** OPEN

---

## BUG-003: Focus not moved into modal on open

- **Severity:** important
- **Surface:** `shared/components/ui/Modal`
- **Repro:**
  1. Tab until focus is on "+ Add Property", press Enter
  2. Inspect `document.activeElement`
- **Expected:** Focus moves to first focusable element inside the dialog (e.g., name input or Close button)
- **Actual:** `document.activeElement === document.body`. Keyboard users cannot tab into the form without first clicking inside.
- **Notes:** Dialog has `role="dialog"` and `aria-modal="true"` but lacks focus management. Related: no focus trap — Tab can escape back to page content behind the backdrop.
- **Status:** OPEN

---

## BUG-004: Sidebar missing "Leases" link

- **Severity:** important
- **Surface:** `shared/components/layout/Sidebar` (or equivalent)
- **Repro:**
  1. Load any page, inspect sidebar links
- **Expected:** Leases link alongside Properties, Tenants, Contracts, Transactions
- **Actual:** Sidebar shows Dashboard, Properties, Tenants, Contracts, Transactions, Reports, Settings. `/leases` is reachable only via the Dashboard's "View All" link or direct URL.
- **Notes:** `/leases` is a real, implemented Scope C page; its absence from nav feels accidental, not intentional.
- **Status:** OPEN

---

## BUG-005: Property 404 shows generic fetch error, no empty state or back nav

- **Severity:** important
- **Surface:** `pages/PropertyDetailPage`
- **Repro:**
  1. Navigate directly to `http://localhost:5173/properties/does-not-exist`
- **Expected:** Dedicated "Property not found" empty state with a button back to `/properties`
- **Actual:** Bare text "Failed to fetch property" fills `main`. Sidebar still works, but the page has no back link, no title, and no CTA. 404 looks identical to a transient network error.
- **Notes:** Distinguish HTTP 404 (not found) from HTTP 5xx / network (fetch failed) in `useProperty`.
- **Status:** OPEN

---

## BUG-006: Numeric inputs use type="text"

- **Severity:** important
- **Surface:** `AddPropertyModal` (bedrooms, bathrooms, rent), `CreateLeaseModal` (rent, deposit)
- **Repro:**
  1. Open "+ Add Property"
  2. Type "abc" into the bedrooms / bathrooms / rent fields
- **Expected:** Inputs reject non-numeric characters or show inline validation
- **Actual:** Inputs accept any string. Form-level validation only checks required status of name/address/city; submit button enables even with gibberish rent. Negative numbers also not blocked.
- **Notes:** Use `type="number"` with `min={0}` (and `step="1"` for bedrooms) or add Zod-style validators.
- **Status:** OPEN

---

## BUG-007: PropertyCard renders address twice when name is absent

- **Severity:** minor
- **Surface:** `domains/properties/components/PropertyCard/PropertyCard.tsx`
- **Repro:**
  1. Look at any property card on `/properties`
- **Expected:** A card with a distinct title and supporting info (e.g., address as subtitle, type + beds + rent)
- **Actual:** Cards display the address as both the heading and the body text (e.g., "99 QA Lane / 99 QA Lane / 1 bed / 1800"). Caused by the underlying BUG-001 + the fallback `displayName = property.name ?? property.address` being paired with a secondary slot that also renders `property.address`.
- **Notes:** Fix will likely fall out naturally once BUG-001 is resolved, but worth a direct review of the card layout.
- **Status:** OPEN

---

## Placeholder pages (not bugs — out of scope)

- `/contracts` — renders `<h1>Contracts</h1>` stub with subtitle "Manage your rental contracts"
- `/transactions` — stub
- `/reports` — stub
- `/settings` — stub

These are expected placeholders per the Scope C spec.

---

## Surfaces verified bug-free

- Dashboard stat tiles render non-NaN values (Revenue, Properties count, Tenants count, Occupancy %)
- Dashboard "Your Properties" (top 3) and "Recent Leases" (table) render with real data
- "+ Add Property" / "View All" navigations on Dashboard
- `/properties` grid renders with correct card count
- Property create flow: form submits, modal closes, card appears, BE persists
- Property delete flow: kebab → Delete menu item → ConfirmDialog → Cancel preserves card; Confirm removes card
- Property card body navigates to `/properties/:id`
- PropertyDetail tab switching updates URL via `?tab=`
- Tenant email field validates format — "not-an-email" surfaces inline "Enter a valid email address", submit disabled
- CreateLease modal: property and tenant dropdowns populated from live data
- CreateLease date validation: end-before-start surfaces "End date must be after start date", submit disabled
- Add Property rapid double-click does not spawn duplicate modals
- Modal backdrop click closes modal
- No console errors during any happy-path walk (only Vite dev connect/connected messages)
- Dialogs announce `role="dialog"` + `aria-modal="true"`

---

## Next step

Proceed to Sprint 2 (fix bugs) — 7 bugs filed (1 critical, 5 important, 1 minor).
