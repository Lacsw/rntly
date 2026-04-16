# Sprint 0 — Adapt Portal-WEB `.claude` Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port rules, skills, agents, and commands from Portal-WEB (`/Users/romanfrolov/Portal-WEB/.claude/`) into `web/.claude/`, adapted to rntly's stack and conventions.

**Architecture:** Each ported file becomes a standalone commit. Adaptations are mechanical: swap `pnpm` for `npm`, strip TanStack Query / Zustand / i18n / DS / `@purpose/ds` references, change `__tests__/` to co-located `foo.test.ts`, keep `refactor` not `ref`, drop `Portal`-specific paths (`apps/portal/src` → `web/src`). The final commit updates `web/CLAUDE.md` with an index.

**Tech Stack:** Markdown only — no code changes. Quality gate per task: `npm run lint && npx tsc --noEmit && npm test` must still pass (they will because no source code changes).

**Spec reference:** `docs/superpowers/specs/2026-04-16-qa-and-polish-design.md` section 3 (Sprint 0) and section 4.1.

---

## Adaptation rules (apply to every ported file)

1. Paths: `apps/portal/src` → `web/src`, `packages/ds/` → n/a (skip those sections).
2. Package manager: `pnpm` → `npm`. Scripts: `pnpm test:unit` → `npm test`, `pnpm type-check` → `npx tsc --noEmit`, `pnpm --filter @purpose/portal lint` → `npm run lint`.
3. Test location: `__tests__/<file>.test.ts` → `<file>.test.ts` (co-located).
4. Commit prefix: keep `refactor` (not `ref`).
5. Remove i18n: no `useTranslation`, no `de.json`, no regex `/English|German/i`.
6. Remove TanStack Query: no `QueryClient`, no `useQuery`, no `QueryClientProvider`. Replace with rntly's pattern (`vi.mock('../api')` + plain `useState` + `useEffect`, or MSW once Sprint 4 lands).
7. Remove Zustand: no `zustand`, no `useXStore`.
8. Remove DS: no `@purpose/ds` imports. Where Portal says `import { Button } from "@purpose/ds"` — reference rntly's shared components (`import { Modal, PageHeader } from '@/shared/components'`) or plain Tailwind.
9. Remove Sentry / error-handling references.
10. Drop monorepo references: no `apps/`, no `packages/`, no `turborepo`.
11. Preserve Portal's strong patterns: `T`-prefix types, no `data-testid`, semantic queries, RED-GREEN-REFACTOR, mock factories, `@/` alias, early returns.

---

## File structure created

```
web/.claude/
├── rules/
│   ├── typescript.md
│   ├── react-components.md
│   ├── testing.md
│   ├── e2e.md
│   ├── git.md
│   ├── security.md          (merged with existing portal items)
│   ├── coding-style.md      (EXISTING — untouched)
│   └── react-best-practices.md  (EXISTING — untouched)
├── skills/
│   ├── unit-test/SKILL.md
│   ├── e2e-test/SKILL.md
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

Also modified: `web/CLAUDE.md` — index section listing the new assets.

---

## Task 1: typescript rule

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/rules/typescript.md`
**Target:** `web/.claude/rules/typescript.md`

**Adaptations:**
- Change the `paths:` frontmatter from `apps/**/*.{ts,tsx}` + `packages/**/*.{ts,tsx}` to `web/src/**/*.{ts,tsx}`.
- Remove the `@purpose/ds` line from the Imports section.
- Keep everything else (type/interface, T prefix, early returns, null handling, avoid `any`/`as`/`!`).

**Steps:**
- [ ] Read the source file
- [ ] Create target with adaptations above
- [ ] `git add web/.claude/rules/typescript.md && git commit -m "chore(claude): add typescript rule adapted from Portal-WEB"`

---

## Task 2: react-components rule

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/rules/react-components.md`
**Target:** `web/.claude/rules/react-components.md`

**Adaptations:**
- Frontmatter `paths:` → `web/src/**/*.tsx`.
- "Styling" section: change `@purpose/ds`'s `cn()` reference to rntly's `@/shared/lib/cn` + our shared components list.
- Drop the "Pages vs Components" example referencing `domains/*/components/` paths from Portal — keep the principle, generalise wording: "Pages (`src/pages/`): orchestrate data fetching, compose components. Components (`src/domains/*/components/`): receive props, don't fetch data."
- Keep list rules, avoid rules (no data-testid, no deep prop drilling, no business logic in components, no deeply nested ternaries in JSX).

**Steps:**
- [ ] Read source, adapt, write target
- [ ] `git commit -m "chore(claude): add react-components rule adapted from Portal-WEB"`

---

## Task 3: testing rule

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/rules/testing.md`
**Target:** `web/.claude/rules/testing.md`

**Adaptations:**
- Frontmatter `paths:` → `web/src/**/*.test.{ts,tsx}`.
- Test Structure: change "Tests live in `__tests__/` folders" to "Tests live co-located next to source as `foo.test.ts` or `foo.test.tsx`".
- Mock Factories: store location `apps/portal/src/tests/factories/` → `web/src/tests/factories/`.
- Before Committing: `pnpm test:unit` → `npm test`, drop coverage line (we don't enforce 80% yet).
- When Tests Fail: `pnpm test:unit -- financial` → `npm test -- useProperty`.
- Keep all Vitest patterns section (import from vitest, `vi.fn`, `vi.mock`, `renderHook`, `userEvent`, `getByRole`).

**Steps:**
- [ ] Read source, adapt, write target
- [ ] `git commit -m "chore(claude): add testing rule adapted from Portal-WEB"`

---

## Task 4: e2e rule

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/rules/e2e.md`
**Target:** `web/.claude/rules/e2e.md`

**Adaptations:**
- Frontmatter `paths:` → `web/e2e/**/*` + `web/e2e/**/*.spec.ts`.
- Playwright conventions path: `apps/portal/e2e/tests/` → `web/e2e/tests/`. Page objects: `apps/portal/e2e/pages/` → `web/e2e/pages/`.
- Internationalization section: DELETE entirely — rntly is English-only.
- Keep selector priority, API responses, test independence.

**Steps:**
- [ ] Read source, adapt, write target
- [ ] `git commit -m "chore(claude): add e2e rule adapted from Portal-WEB"`

---

## Task 5: git rule

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/rules/git.md`
**Target:** `web/.claude/rules/git.md`

**Adaptations (CRITICAL):**
- Change `ref - Code restructuring (no behavior change) — NOT "refactor"` to `refactor - Code restructuring (no behavior change)`. Remove the "— NOT refactor" note.
- All examples: change `ref: extract validation logic to shared utils` to `refactor: extract validation logic to shared utils`.
- Before Committing commands: `pnpm --filter @purpose/portal lint` → `npm run lint`. `pnpm type-check` → `npx tsc --noEmit`. `pnpm test:unit` → `npm test`.
- Keep branch workflow, protected operations, Do NOT section (no Co-Authored-By, no .env, no debug code).

**Steps:**
- [ ] Read source, adapt, write target
- [ ] `git commit -m "chore(claude): add git rule adapted from Portal-WEB"`

---

## Task 6: security rule (merge)

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/rules/security.md`
**Existing:** `web/.claude/rules/security.md`
**Target:** `web/.claude/rules/security.md` (overwrite with merged content)

**Adaptations:**
- Read existing rntly security.md. Read Portal security.md.
- Merge: keep all rntly content. Add these Portal-only items under a new "Forbidden Patterns" section:
  - "NEVER: Dynamic code execution with user input: `eval(userProvidedCode)`"
  - "NEVER: HTTP URLs for API calls — use HTTPS"
- Drop Portal's `getApi()` reference (rntly uses plain axios — already covered by existing rules).
- Drop "When Vulnerability Found" section if duplicated by rntly's existing text; merge if additive.

**Steps:**
- [ ] Read both source files, merge, write target
- [ ] `git commit -m "chore(claude): merge Portal-WEB security items into existing rule"`

---

## Task 7: unit-test skill

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/skills/unit-test/SKILL.md`
**Target:** `web/.claude/skills/unit-test/SKILL.md`

**Adaptations (major):**
- Test Location diagram: `utils/` with `__tests__/` subfolder → co-located `foo.test.ts`.
- Running Tests: `pnpm test` → `npm test`, `pnpm test:watch` → `npm run test:watch`.
- Utility Function Test example: keep as-is (generic).
- **Replace the "React Query Hook Test" section ENTIRELY** with rntly's pattern. Use this text:

```tsx
// web/src/domains/properties/hooks/useProperties.test.ts
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProperties } from './useProperties';
import { propertiesApi } from '../api';
import type { TProperty } from '../api';

vi.mock('../api', () => ({
  propertiesApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockProperty: TProperty = { /* ... */ };

describe('useProperties', () => {
  beforeEach(() => {
    vi.mocked(propertiesApi.getAll).mockResolvedValue({ data: [mockProperty] } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches on mount', async () => {
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toEqual([mockProperty]);
  });
});
```

Add a note: "Once Sprint 4 ships MSW, replace `vi.mock('../api', ...)` with `server.use(http.get(...))` handlers for realistic HTTP."

- **Delete the "Zustand Store Test" section entirely.**
- "Component Test" section: keep, drop `react-i18next` mock.
- Mock Factory Pattern: change `apps/portal/src/tests/factories/` to `web/src/tests/factories/`.
- Common Mocks section: delete `getApi()` block. Delete "Notifications Store" block. Keep "React Router" mock example.
- Keep Common Assertions section.

**Steps:**
- [ ] Read source, heavily adapt, write target
- [ ] `git commit -m "chore(claude): add unit-test skill adapted from Portal-WEB"`

---

## Task 8: e2e-test skill

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/skills/e2e-test/SKILL.md`
**Target:** `web/.claude/skills/e2e-test/SKILL.md`

**Adaptations:**
- All paths: `apps/portal/e2e/` → `web/e2e/`.
- Running Tests: `pnpm test:e2e` → `npm run test:e2e`.
- **Delete i18n sections entirely** — remove all `/German|English/i` regex examples. Replace with simple strings in English.
- Update the "Basic Test" example to use rntly routes (`/properties`, `/tenants`, `/leases`) with English labels (`name: /Add Property/i` stays as regex for partial matching flexibility — just not bilingual).
- Page Object Model example: change `FeaturePage` target URL from `/feature` to `/properties` as a concrete example.
- Keep selector priority, API mocking, waiting patterns, common actions, common assertions.
- Checklist: drop the i18n regex bullet.

**Steps:**
- [ ] Read source, adapt, write target
- [ ] `git commit -m "chore(claude): add e2e-test skill adapted from Portal-WEB"`

---

## Task 9: react-component skill

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/skills/react-component/SKILL.md`
**Target:** `web/.claude/skills/react-component/SKILL.md`

**Adaptations:**
- Component Location diagram: remove "Design System" line. Change to:
  - "App shared: `web/src/shared/components/ui/`"
  - "Domain-specific: `web/src/domains/{domain}/components/`"
- Standard Component Template: remove `useTranslation` import and `t(...)` usage. Remove `cn` import from `@purpose/ds` — replace with `import { cn } from '@/shared/lib/cn'`. Inside template, drop `const { t } = useTranslation();` line.
- Component with State: remove `useTranslation`, replace `t("common.text.edit")` with `'Edit'`, `t("common.text.save")` with `'Save'`. Replace `import { Button } from "@purpose/ds"` with a plain `<button className="...">`.
- Component with Hooks example: drop `useTranslation`, `useRoles` (no viewer role concept), `@purpose/ds` imports. Simplify to a rntly-relevant example using `useProperties` from the actual codebase.
- Clickable Card Pattern: keep, replace `cn` import source.
- Imports Order: drop the "Design system" line. Drop icons line's `@phosphor-icons/react` reference — replace with `lucide-react`.
- Tailwind Classes: drop Portal's custom token classes (`text-h6`, `text-body-space`, `border-black-20`, etc.). Replace with rntly's actual utility classes (stone palette, standard Tailwind sizes).

**Steps:**
- [ ] Read source, heavily adapt, write target
- [ ] `git commit -m "chore(claude): add react-component skill adapted from Portal-WEB"`

---

## Task 10: url-state skill

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/skills/url-state/SKILL.md`
**Target:** `web/.claude/skills/url-state/SKILL.md`

**Adaptations (minor):**
- Hook Location: `domains/[domain]/hooks/` stays, `shared/hooks/` → `web/src/shared/hooks/`.
- Example references: change `domains/measures-configurator-v2/...` to `web/src/pages/PropertyDetailPage.tsx` (which actually uses `useSearchParams` with `?tab=`). Use that as the canonical "single param pattern" example with actual rntly code:

```ts
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
  // ...
};
```

- Multi-filter pattern: keep — relevant for future search/filter work.
- Pagination + Sort pattern: keep — ditto.

**Steps:**
- [ ] Read source, lightly adapt, write target
- [ ] `git commit -m "chore(claude): add url-state skill adapted from Portal-WEB"`

---

## Task 11: documentation skill

**Source:** `/Users/romanfrolov/Portal-WEB/.claude/skills/documentation/SKILL.md`
**Target:** `web/.claude/skills/documentation/SKILL.md`

**Adaptations:**
- File Placement: Portal uses `infrastructure/utils/docs/` — rntly doesn't have `infrastructure/`. Rewrite the example with `web/src/shared/utils/` and `web/src/domains/properties/`. Show docs folder co-located with code.
- Content List: Portal's table maps to `docs/utilities/index.md` and `docs/index.md`. rntly has no such files yet. Drop the "content list" convention as "optional — create on first need".
- Template section: keep, generalize to rntly's needs.

**Steps:**
- [ ] Read source, adapt, write target
- [ ] `git commit -m "chore(claude): add documentation skill adapted from Portal-WEB"`

---

## Task 12: Four agents (batched — tdd-guide, planner, architect, refactor-cleaner)

**Sources:**
- `/Users/romanfrolov/Portal-WEB/.claude/agents/tdd-guide.md`
- `/Users/romanfrolov/Portal-WEB/.claude/agents/planner.md`
- `/Users/romanfrolov/Portal-WEB/.claude/agents/architect.md`
- `/Users/romanfrolov/Portal-WEB/.claude/agents/refactor-cleaner.md`

**Targets:** `web/.claude/agents/<name>.md` for each.

**Adaptations (common):**
- Remove Portal-specific paths (`apps/portal/src`, `packages/ds/`, `domains/shared/`, `domains/measures-configurator/`, `domains/portfolio/`). Replace with rntly paths.
- Remove TanStack Query, Zustand, i18n references.
- Remove the Portal domain list (`dashboard, data-room, elr, esg, ...`) — replace with rntly's 4: `dashboard, properties, tenants, leases`.
- `pnpm test:unit` → `npm test`, `pnpm type-check` → `npx tsc --noEmit`, `pnpm --filter @purpose/portal lint` → `npm run lint`.
- Keep the color frontmatter (`purple`, `green`, `blue`, `yellow`) as-is.
- Commit prefix examples: `ref:` → `refactor:`.

**Per-agent adjustments:**
- `tdd-guide`: test location `__tests__/` → co-located. Keep RED-GREEN-REFACTOR cycle. Replace the financial / energy test examples with rntly-appropriate ones (e.g. `formatCurrency`, `useProperties`).
- `planner`: drop "translations to `de.json`" from checklist. Drop Zustand store planning. State management section: keep `useState` and URL-state, drop Zustand and TanStack Query.
- `architect`: domain list → rntly's 4. State Management Layers: drop TanStack Query + Zustand. Keep URL State + useState. Keep anti-patterns section.
- `refactor-cleaner`: keep intact — all patterns apply. Change `domains/measures-configurator/` examples to `domains/properties/`.

**Steps:**
- [ ] Read all 4 source files
- [ ] Create all 4 target files with adaptations
- [ ] `git add web/.claude/agents/ && git commit -m "chore(claude): add tdd-guide, planner, architect, refactor-cleaner agents"`

---

## Task 13: Three commands (batched — commit, verify, test-coverage)

**Sources:**
- `/Users/romanfrolov/Portal-WEB/.claude/commands/commit.md`
- `/Users/romanfrolov/Portal-WEB/.claude/commands/verify.md`
- `/Users/romanfrolov/Portal-WEB/.claude/commands/test-coverage.md`

**Targets:** `web/.claude/commands/<name>.md` for each.

**Adaptations:**
- **`commit.md` (CRITICAL):** Type table — change `ref` row label to `refactor`. Remove "Rules: Use `ref` instead of `refactor` (project convention)" line and replace with "Rules: Use `refactor` (rntly uses the full word)." Commit examples: `ref:` → `refactor:`.
- **`verify.md`:** `pnpm type-check` → `npx tsc --noEmit`. `pnpm --filter @purpose/portal lint` → `npm run lint`. Drop the "pnpm lint only if packages/ds/ has changes" branch. `pnpm --filter @purpose/portal exec prettier --check .` → drop (rntly has no prettier yet). `pnpm test:unit` → `npm test`. Drop "pre-pr" security audit branch — simplify to quick/pre-commit/full.
- **`test-coverage.md`:** `pnpm --filter @purpose/portal coverage` → `npm run coverage`. Test location `__tests__/` → co-located. Keep priorities and example tests.

**Steps:**
- [ ] Read all 3 source files
- [ ] Create all 3 target files with adaptations
- [ ] `git add web/.claude/commands/ && git commit -m "chore(claude): add commit, verify, test-coverage commands"`

---

## Task 14: Update `web/CLAUDE.md` with index

**File:** `web/CLAUDE.md`

**Action:** append a new section at the bottom titled "## .claude assets" linking everything ported.

**Content to append:**

```markdown

---

## .claude Assets

The `.claude/` directory holds rules, skills, agents, and commands adapted from Portal-WEB conventions. Rules auto-load by file context; skills are invokable templates; agents are spawnable specialists; commands are slash-invokable workflows.

### Rules (`.claude/rules/`)

| Rule                  | Scope                                        |
| --------------------- | -------------------------------------------- |
| `typescript.md`       | `*.ts, *.tsx` — types, null handling         |
| `react-components.md` | `*.tsx` — component structure, styling       |
| `testing.md`          | `*.test.{ts,tsx}` — Vitest, mock factories   |
| `e2e.md`              | `e2e/**, *.spec.ts` — Playwright conventions |
| `git.md`              | Always — conventional commits (`refactor`)   |
| `security.md`         | Always — XSS, secrets, eval, env vars        |
| `coding-style.md`     | Always — immutability, file size, naming     |
| `react-best-practices.md` | `*.tsx` — waterfalls, re-renders, JS perf |

### Skills (`.claude/skills/`)

| Skill             | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `unit-test`       | Vitest + Testing Library patterns (co-located)      |
| `e2e-test`        | Playwright POM with semantic selectors              |
| `react-component` | Component creation following rntly patterns         |
| `url-state`       | `useSearchParams` patterns for tabs, filters, pages |
| `documentation`   | Docs beside code                                    |

### Agents (`.claude/agents/`)

| Agent              | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `tdd-guide`        | RED-GREEN-REFACTOR with Vitest patterns            |
| `planner`          | Multi-step implementation plans                    |
| `architect`        | System design + domain boundaries review           |
| `refactor-cleaner` | Dead-code and duplicate removal with safety checks |

### Commands (`.claude/commands/`)

| Command          | Purpose                            |
| ---------------- | ---------------------------------- |
| `/commit`        | Conventional commit with auto-type |
| `/verify`        | Lint + typecheck + tests + audit   |
| `/test-coverage` | Analyze and fill coverage gaps     |
```

**Steps:**
- [ ] Read current `web/CLAUDE.md`
- [ ] Append the section above (only — do not modify any existing content)
- [ ] Run the full quality gate: `cd web && npm run lint && npx tsc --noEmit && npm test && npm run build`
- [ ] `git add web/CLAUDE.md && git commit -m "docs(web): document .claude assets in CLAUDE.md"`

---

## Sprint 0 exit checklist

- [ ] `web/.claude/rules/` contains 8 files (6 new + 2 existing: `typescript.md`, `react-components.md`, `testing.md`, `e2e.md`, `git.md`, `security.md`, `coding-style.md`, `react-best-practices.md`)
- [ ] `web/.claude/skills/` contains 5 subdirectories each with `SKILL.md`
- [ ] `web/.claude/agents/` contains 4 files
- [ ] `web/.claude/commands/` contains 3 files
- [ ] `web/CLAUDE.md` ends with the new ".claude Assets" section
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build` all exit 0 (141 tests still passing — unchanged)
- [ ] `git log --oneline main..HEAD` shows ~14 Sprint 0 commits, all prefixed `chore(claude):` or `docs(web):`

---

## Execution order

Linear 1 → 14. Every task is self-contained markdown editing — no code changes, no test changes. Quality gate stays green throughout because source code is untouched.
