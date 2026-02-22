---
paths: ["**/*.ts", "**/*.tsx"]
---

# Coding Style

Always-active style rules for TypeScript files in this project.

## Immutability

- Always create new objects/arrays via spread — never mutate in place.
- Use `const` by default; `let` only when reassignment is necessary.
- Prefer `readonly` for function parameters and interface properties that shouldn't change.

## File Size

- Typical file: 200–400 lines.
- Maximum: 800 lines — if a file exceeds this, split it.
- One component per file; co-locate its types and helpers if small.

## Error Handling

- Wrap async calls in `try/catch` — handle errors explicitly.
- Never silently swallow errors; at minimum, log them.
- Display user-friendly error messages — never raw error strings or stack traces.
- Distinguish between expected errors (validation) and unexpected errors (network failures).

## Input Validation

- Validate at system boundaries: API responses, user input, URL params.
- Trust internal function calls — don't over-validate within the app.
- Use TypeScript types as the primary guard for internal code.

## No Console in Production

- Remove all `console.log` / `console.debug` before committing.
- `console.error` and `console.warn` are acceptable for genuine error/warning reporting.

## Quality Checklist

Before completing any task, verify:

1. No TypeScript errors (`npx tsc --noEmit`).
2. No lint errors (`npm run lint`).
3. Build succeeds (`npm run build`).
4. No `console.log` left in changed files.
5. All imports use barrel exports from domains (not internal paths).
6. Types follow `T` prefix convention (`TProperty`, `TLease`).
