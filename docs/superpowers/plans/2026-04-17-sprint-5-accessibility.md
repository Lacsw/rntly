# Sprint 5 — Accessibility Audit Implementation Plan

> **For agentic workers:** Execute inline. One logical unit per commit. Verify each: `npm run lint && npx tsc --noEmit && npm test && npm run build` all green.

**Goal:** Close the a11y gaps left after Scope C + bugfix sprints. Install `@axe-core/react` in DEV, run the app through an audit pass, fix critical violations, and lock the floor with a Vitest smoke test that fails the build if regressions land.

**Spec reference:** `docs/superpowers/specs/2026-04-16-qa-and-polish-design.md` §3 (Sprint 5), §4.4.

**Scope boundaries:**
- Manual keyboard walk + axe-core catches; no bespoke a11y library integration.
- `@axe-core/react` runs DEV-only (`import.meta.env.DEV` guard) — must not ship in the production bundle.
- Only critical + serious violations are fixed in this sprint. Moderate / minor get logged for future polish.
- Surfaces covered: Dashboard, Properties list, Property detail (all 5 tabs), Tenants, Leases, all modals (Add Property, Edit Property, Add Tenant, Create Lease, ConfirmDialog), and the MainLayout sidebar.

---

## Prerequisites

- Vite DEV server runs on :5173. Use Chrome MCP for the interactive audit.
- Sprint 4 MSW infra is in place — the a11y smoke test renders `<App />` with MSW stubbing network calls.

---

## Commit plan

### Step 1 — Install axe-core, wire DEV-only init

- [ ] `cd web && npm install -D @axe-core/react react-dom`
  - (react-dom is already a dep; the `-D` for react-dom is redundant — just verify it's present, don't re-install.)
- [ ] Update `web/src/main.tsx`:
  ```ts
  if (import.meta.env.DEV) {
    const [{ default: React }, { default: ReactDOM }, { default: axe }] = await Promise.all([
      import('react'),
      import('react-dom'),
      import('@axe-core/react'),
    ]);
    axe(React, ReactDOM, 1000);
  }
  ```
  Dynamic imports keep axe out of the prod bundle. Verify via `npm run build && ls -lh dist/assets` — no `@axe-core` chunk should appear.
- [ ] Commit: `chore(a11y): install @axe-core/react with DEV-only dynamic init`

### Step 2 — Audit walk + findings doc

- [ ] Create `docs/qa/2026-04-17-a11y-findings.md` with the same format as the Scope C bug report.
- [ ] For each surface (Dashboard, Properties, Property Detail w/ each tab, Tenants, Leases, each modal, sidebar): open in Chrome, record axe-reported violations by rule id + severity + element + page. Keyboard-only walk: tab order sensible, no traps, Esc closes modals, Enter activates buttons, arrow keys work on tab lists.
- [ ] Record `role`/`aria-*` gaps, contrast failures, missing labels, non-semantic headings.
- [ ] Commit: `docs(qa): record Sprint 5 a11y audit findings`

### Step 3 — Fix critical + serious violations

One commit per logical fix. Examples (specifics depend on Step 2 findings):

- [ ] **DetailTabs** — ensure `role="tablist"` / `role="tab"` / `role="tabpanel"` wiring is correct; tabs reachable with arrow keys (use `aria-selected`, `aria-controls`, `tabIndex={selected ? 0 : -1}`). Commit: `fix(shared/ui): upgrade DetailTabs to ARIA tab pattern`
- [ ] **Modal focus trap** — currently focuses first input but Tab can still escape. Add wraparound using `keydown` on the last/first focusable. Commit: `fix(shared/ui): trap focus inside open Modal`
- [ ] **StatusBadge** — verify color contrast vs Tailwind tokens; add `aria-label` if color is the only affordance. Commit: `fix(shared/ui): ensure StatusBadge contrast and label`
- [ ] **Icon-only buttons** — kebab menu, close button, delete — add `aria-label`s where missing. Commit: `fix(shared/ui): add aria-labels to icon-only buttons`
- [ ] **Heading hierarchy** — every page starts with a single `<h1>`; no heading level skipped. Fix PageHeader / DetailHeader as needed. Commit: `fix(shared/ui): correct heading hierarchy across pages`
- [ ] If any page lacks a main landmark: wrap content in `<main>` inside MainLayout. Commit: `fix(layout): add <main> landmark to MainLayout`

Skip a fix if axe reports zero violations of that class.

### Step 4 — A11y smoke test

- [ ] `web/src/tests/a11y.test.tsx`:
  ```tsx
  import { render } from '@testing-library/react';
  import { axe, toHaveNoViolations } from 'jest-axe';
  import { MemoryRouter } from 'react-router-dom';
  import App from '@/app/App';

  expect.extend(toHaveNoViolations);

  it('App renders with no axe-critical violations on initial dashboard', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
  ```
  - Install `jest-axe` as dev dep. `color-contrast` rule disabled because jsdom doesn't compute styles — defer to manual audit.
- [ ] Verify App renders without MSW unhandled errors; default handlers already cover Dashboard's three fetches.
- [ ] Commit: `test(a11y): add axe-core smoke test`

### Step 5 — Refresh docs

- [ ] `web/CLAUDE.md`: add one-line note "DEV build loads @axe-core/react; critical violations fail the a11y smoke test."
- [ ] `web/.claude/rules/react-components.md` (if exists) or `react-best-practices.md`: note tab/modal/icon-button a11y patterns adopted in Step 3.
- [ ] Commit: `docs(a11y): document axe-core + smoke test contract`

---

## Exit checklist

- [ ] Six commits (approximate — Step 3 may collapse or expand based on findings) landed on `main`.
- [ ] `docs/qa/2026-04-17-a11y-findings.md` lists every violation with status (FIXED-in-sha / DEFERRED-minor).
- [ ] Zero critical + serious axe violations on Dashboard, Properties, Property Detail, Tenants, Leases in DEV browser.
- [ ] `npm test` includes the new smoke test and passes.
- [ ] `npm run build && ls dist/assets` shows no axe chunks in prod bundle.
- [ ] Keyboard-only walk: every flow completable, no focus traps (except intentional modal traps), Esc closes every modal.

---

## Execution order

Linear 1 → 5. Step 2's findings determine Step 3 scope — do not pre-write fixes.

---

## Risk notes

- **axe + jsdom**: some axe rules (color-contrast, `frame-title`) require a real browser. Disable those in the smoke test and rely on manual audit for visual rules.
- **StrictMode double-mount** + axe: in DEV StrictMode, `axe(React, ReactDOM, 1000)` may log each violation twice. Don't chase this — it's a false alarm.
- **Modal focus trap** conflicts with nested Modals (e.g., ConfirmDialog inside another Modal). If any surface triggers this, the trap should scope to the topmost dialog via a stack or a `useModal` registry. Flag and decide in-commit.
- **`@axe-core/react` import cost**: even lazy-loaded, if Vite pre-bundles it the tree-shake may miss. Verify `dist/assets/*` post-build and use `console.log(dependencies)` only if an unexpected chunk appears.
