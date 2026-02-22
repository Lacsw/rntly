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
```

Type-check without emitting: `npx tsc --noEmit`

No test framework is configured yet.

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

### Type naming

Domain types use `T` prefix: `TProperty`, `TPropertyCreate`, `TPropertyUpdate`. Three variants per entity: full model, create payload, update payload.

## Stack

- React 19, React Router 7, TypeScript 5.9 (strict mode)
- Tailwind CSS 4 (via `@tailwindcss/postcss`, no config file)
- Axios for API calls
- Vite 7, ESLint 9 (flat config)

## Git Commits

- Do not include "Co-Authored-By" lines in commit messages
