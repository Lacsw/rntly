---
paths:
  - "web/src/**/*.{ts,tsx}"
---

# TypeScript Rules

## Types
- Always use `type`, never `interface`
- Always use `T` prefix: `type TProperty`, `type TProps`, `type TStatus`
- Use type unions for finite states: `type TStatus = "idle" | "loading" | "success" | "error"`
- Use `T` prefix even for function parameter types and return types

## Null Handling
- Use optional chaining: `user?.name`
- Use nullish coalescing: `data?.count ?? 0`
- Handle null/undefined explicitly in function signatures: `(address?: TAddress | null)`

## Early Returns
- Prefer early returns over nested if-else
- Guard clauses first, happy path last

## Imports
- Use `@/` path alias, never deep relative paths (`../../../`)
- Import order: react → external → internal (`@/`) → relative (`./`)

## Avoid
- `any` type — use `unknown` or proper typing
- Type assertions (`as`) — prefer type guards
- Non-null assertions (`!`) — handle the null case
