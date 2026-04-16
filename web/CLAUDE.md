# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frontend for **rntly** — a rental property management app. React + TypeScript + Vite, with a Go backend API on port 8080.

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build
npm test           # Run the test suite once
npm run test:watch # Run the tests in watch mode
npm run coverage   # Run tests with coverage report
```

Type-check without emitting: `npx tsc --noEmit`

Tests use Vitest 4 + @testing-library/react + jsdom. Co-locate tests as `*.test.ts(x)` next to the source file. Shared setup lives at `src/tests/setup.ts`.

Backend (from repo root `/Users/romanfrolov/dev/rntly/`):
```bash
make db-up         # Start PostgreSQL (port 5433)
make dev           # Run migrations + start Go API server
make db-down       # Stop database
```

## Architecture

Domain-driven structure with clear separation of concerns:

```
src/
├── app/            # App shell: BrowserRouter + route definitions
├── pages/          # Route entry points (thin, compose from domains)
├── domains/        # Business logic per domain (api, hooks, components)
│   ├── properties/ # Template domain — has api/, hooks/, components/
│   ├── tenants/    # Stub — api/ only
│   └── leases/     # Stub — api/ only
└── shared/         # Cross-cutting: api client, layouts, UI components
```

### Key conventions

- **Pages are NOT inside domains.** Pages live in `src/pages/` as thin composition layers. Domains contain pure business logic (api, hooks, components) with no routing awareness.
- **Each domain exports through a barrel** (`index.ts`). Consumers import from `../domains/properties`, never from internal paths.
- **Domain pattern** (properties as reference): `api/` (axios CRUD + types) → `hooks/` (state management) → `components/` (UI pieces) → page composes all three.
- **Shared API client** (`shared/api/client.ts`): single axios instance, base URL `http://localhost:8080`.
- **Layout route**: `MainLayout` wraps all routes via React Router's `<Outlet />`.

### Import aliases

Use the `@` alias (`@/` → `src/`) for imports that cross domain boundaries with 3+ levels of `../`. Keep relative imports for local references within a domain (e.g., `../../api`).

```ts
// Good — cross-boundary import
import api from '@/shared/api/client';
import { StatusBadge } from '@/shared/components/StatusBadge';

// Good — local within domain
import type { TProperty } from '../../api';
```

### Type naming

Domain types use `T` prefix: `TProperty`, `TPropertyCreate`, `TPropertyUpdate`. Three variants per entity: full model, create payload, update payload.

## Stack

- React 19, React Router 7, TypeScript 5.9 (strict mode)
- Tailwind CSS 4 (via `@tailwindcss/postcss`, no config file)
- Axios for API calls
- Vite 7, ESLint 9 (flat config)

## Git Commits

- Do not include "Co-Authored-By" lines in commit messages

---

## .claude Assets

The `.claude/` directory holds rules, skills, agents, and commands adapted from Portal-WEB conventions. Rules auto-load by file context; skills are invokable templates; agents are spawnable specialists; commands are slash-invokable workflows.

### Rules (`.claude/rules/`)

| Rule                      | Scope                                          |
| ------------------------- | ---------------------------------------------- |
| `typescript.md`           | `*.ts, *.tsx` — types, null handling           |
| `react-components.md`     | `*.tsx` — component structure, styling         |
| `testing.md`              | `*.test.{ts,tsx}` — Vitest, mock factories     |
| `e2e.md`                  | `e2e/**, *.spec.ts` — Playwright conventions   |
| `git.md`                  | Always — conventional commits (`refactor`)     |
| `security.md`             | Always — XSS, secrets, eval, env vars          |
| `coding-style.md`         | Always — immutability, file size, naming       |
| `react-best-practices.md` | `*.tsx` — waterfalls, re-renders, JS perf      |

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
