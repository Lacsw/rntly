# Sprint 6 — Test Layout Migration Implementation Plan

> **For agentic workers:** Execute inline. Verify after every commit: `npm run lint && npx tsc --noEmit && npm test && npm run build` all green.

**Goal:** Move every `*.test.ts(x)` file out of co-location with source and into sibling `__tests__/` folders. Update tooling docs (`.claude/rules/testing.md`, `.claude/skills/unit-test/SKILL.md`, `web/CLAUDE.md`) so this becomes the documented convention.

**Why this sprint exists:** Per updated project guidance, tests belong in `__tests__/` folders — **this is a deliberate reversal** of the prior "co-located" convention recorded in `docs/superpowers/specs/2026-04-16-qa-and-polish-design.md` §3 Sprint 0 ("Co-located `foo.test.ts` next to `foo.ts` (do NOT migrate to `__tests__/`)"). Rationale: visual separation of implementation from tests.

**Spec reference:** N/A — this sprint was not in the QA+Polish spec. Its plan doc is the source of truth.

---

## Scope inventory

23 test files currently co-located. Moves are mechanical:

| Current | New |
|---|---|
| `web/src/tests/sanity.test.ts` | stays (already in `tests/`) |
| `web/src/shared/components/ui/<X>.test.tsx` × 7 | `web/src/shared/components/ui/__tests__/<X>.test.tsx` |
| `web/src/shared/utils/format.test.ts` | `web/src/shared/utils/__tests__/format.test.ts` |
| `web/src/domains/properties/hooks/<X>.test.ts` × 2 | `web/src/domains/properties/hooks/__tests__/<X>.test.ts` |
| `web/src/domains/tenants/hooks/<X>.test.ts` × 3 | `web/src/domains/tenants/hooks/__tests__/<X>.test.ts` |
| `web/src/domains/tenants/utils/tenant.test.ts` | `web/src/domains/tenants/utils/__tests__/tenant.test.ts` |
| `web/src/domains/leases/hooks/<X>.test.ts` × 5 | `web/src/domains/leases/hooks/__tests__/<X>.test.ts` |
| `web/src/domains/leases/utils/lease.test.ts` | `web/src/domains/leases/utils/__tests__/lease.test.ts` |
| `web/src/domains/dashboard/hooks/useDashboardStats.test.ts` | `web/src/domains/dashboard/hooks/__tests__/useDashboardStats.test.ts` |

Plus Sprint 5's new `web/src/tests/a11y.test.tsx` (if merged before this sprint) — stays under `tests/`.

---

## Commit plan

Each step is one atomic commit. Between commits, run the full verify gate.

### Step 1 — Verify vitest discovers `__tests__/` folders

- [ ] `web/vitest.config.ts` (or `vite.config.ts`): confirm `test.include` matches both co-located and `__tests__/` glob patterns. Default Vitest config accepts `**/*.{test,spec}.?(c|m)[jt]s?(x)` which already covers the new layout — verify before moving anything.
- [ ] If the config is explicit, extend the include array to `['**/__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)', '**/*.{test,spec}.?(c|m)[jt]s?(x)']`.
- [ ] No commit unless config changes.

### Step 2 — Update tooling docs first

Move the documentation **before** the physical migration so the rule is the commit that flips the convention, not the move.

- [ ] `web/.claude/rules/testing.md`:
  - Replace "Tests live co-located next to source as `foo.test.ts` or `foo.test.tsx`" with "Tests live in a sibling `__tests__/` folder, e.g. `hooks/__tests__/useProperties.test.ts`."
  - Note: test files use the same basename as the source file plus `.test.ts(x)`.
- [ ] `web/.claude/skills/unit-test/SKILL.md`:
  - Update the "Test Location" section tree to show `__tests__/` folders.
  - Update every code example's path comment (e.g., `// web/src/domains/properties/hooks/__tests__/useProperties.test.ts`).
  - Keep the MSW hook example intact — only the path changes.
- [ ] `web/CLAUDE.md`:
  - Change "Co-locate tests as `*.test.ts(x)` next to the source file" → "Place tests under a sibling `__tests__/` folder inside each feature dir (e.g., `hooks/__tests__/*.test.ts`)."
- [ ] Commit: `docs(tests): switch convention to __tests__/ folders`

### Step 3 — Move shared/ui tests

- [ ] Create `web/src/shared/components/ui/__tests__/`.
- [ ] Move each of the seven `*.test.tsx` files in that dir into `__tests__/`. Use `git mv` so history follows.
- [ ] For each moved file: relative imports of the form `./<Component>` become `../<Component>`. Apply with a single careful sed-equivalent or one-by-one Edit.
- [ ] Verify `npm test -- shared/components/ui` passes.
- [ ] Commit: `refactor(tests): move shared/ui tests into __tests__/`

### Step 4 — Move shared/utils tests

- [ ] `git mv web/src/shared/utils/format.test.ts web/src/shared/utils/__tests__/format.test.ts`.
- [ ] Fix import: `./format` → `../format`.
- [ ] Verify.
- [ ] Commit: `refactor(tests): move shared/utils tests into __tests__/`

### Step 5 — Move domain tests (properties)

- [ ] `git mv web/src/domains/properties/hooks/{useProperties,useProperty}.test.ts web/src/domains/properties/hooks/__tests__/`.
- [ ] Fix relative imports: `./useProperties` → `../useProperties`, etc. The `@/tests/msw/*` imports stay unchanged.
- [ ] Verify.
- [ ] Commit: `refactor(tests): move properties tests into __tests__/`

### Step 6 — Move domain tests (tenants)

- [ ] Move three hook tests + one utils test into their respective `__tests__/` folders.
- [ ] Fix relative imports.
- [ ] Verify.
- [ ] Commit: `refactor(tests): move tenants tests into __tests__/`

### Step 7 — Move domain tests (leases)

- [ ] Move five hook tests + one utils test.
- [ ] Fix relative imports.
- [ ] Verify.
- [ ] Commit: `refactor(tests): move leases tests into __tests__/`

### Step 8 — Move dashboard tests

- [ ] Move `useDashboardStats.test.ts`.
- [ ] Fix relative imports.
- [ ] Verify.
- [ ] Commit: `refactor(tests): move dashboard tests into __tests__/`

### Step 9 — Final grep + lockout

- [ ] Grep for any remaining `*.test.ts(x)` files outside `__tests__/` or `src/tests/`:
  ```bash
  find web/src -name '*.test.*' -not -path '*/__tests__/*' -not -path '*/tests/*'
  ```
  Expect zero results. If any, move them.
- [ ] Consider adding an ESLint rule or a pre-commit check that forbids `*.test.*` outside `__tests__/` — defer if tooling overhead is high, but note it in `.claude/rules/testing.md` as a convention.
- [ ] Commit: `chore(tests): verify all tests live in __tests__/` (empty or near-empty — doc tweak only if nothing else)

---

## Exit checklist

- [ ] 7–8 commits on `main` (Step 1 may produce zero commits; Step 9 may skip if nothing to add).
- [ ] `find web/src -name '*.test.*' -not -path '*/__tests__/*' -not -path '*/tests/*'` → no results.
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build` green.
- [ ] Test count unchanged from Sprint 5 exit.
- [ ] `.claude/rules/testing.md`, `.claude/skills/unit-test/SKILL.md`, `web/CLAUDE.md` all describe the new layout.

---

## Execution order

Linear 1 → 9. The doc-first ordering in Step 2 is deliberate — it makes the convention change reviewable in isolation.

---

## Risk notes

- **Git history**: use `git mv` so `git log --follow <file>` continues to work.
- **Relative imports**: tests often import sibling factory files or local utils with `./X`. Moving them one level deeper requires `../X`. A careless mass-move breaks quietly because TS errors bubble up but Vitest may silently skip. Run `npx tsc --noEmit` after each step, not just at the end.
- **Absolute `@/*` imports**: these don't change. Only relative imports care about depth.
- **Vitest include globs**: if the config explicitly lists `src/**/*.test.ts` without `**`, add `src/**/__tests__/**/*.test.ts`. Check `web/vite.config.ts` before Step 3.
- **Superpowers spec drift**: the QA+Polish spec §3 Sprint 0 still reads "co-located" after this sprint. Don't amend the spec file — it's a historical record. The new rule lives in `.claude/rules/testing.md`.
