# Coding Standards

General coding principles for the rntly frontend codebase.

## Principles

- **Readability first** — code is read far more than written.
- **KISS** — prefer the simplest solution that works.
- **DRY** — extract repeated logic, but not prematurely (rule of three).
- **YAGNI** — don't build for hypothetical future requirements.

## Naming Conventions

- **Functions**: verb-noun (`fetchProperties`, `validateEmail`, `formatCurrency`).
- **Booleans**: `is`/`has`/`should` prefix (`isLoading`, `hasError`, `shouldRefresh`).
- **Components**: PascalCase, noun-based (`PropertyCard`, `TenantList`).
- **Hooks**: `use<Purpose>` (`useProperties`, `useDebounce`).
- **Constants**: UPPER_SNAKE_CASE for true constants (`MAX_FILE_SIZE`).
- **Types**: `T` prefix per project convention (`TProperty`, `TPropertyCreate`).
- Variables should be descriptive — `filteredProperties` not `fp`.

## Immutability

- Always use spread/destructuring to create new objects and arrays.
- Never mutate function arguments, state, or props.

```tsx
// Good
setItems((prev) => [...prev, newItem]);
const updated = { ...property, name: newName };

// Bad
items.push(newItem);
property.name = newName;
```

## Async / Error Handling

- Use `async/await` over raw `.then()` chains.
- Wrap async operations in `try/catch`.
- Never swallow errors silently — at minimum log them.
- Use `Promise.all()` for independent async operations.

```tsx
// Good: parallel independent requests
const [properties, tenants] = await Promise.all([
  propertiesApi.getAll(),
  tenantsApi.getAll(),
]);

// Bad: sequential when order doesn't matter
const properties = await propertiesApi.getAll();
const tenants = await tenantsApi.getAll();
```

## Type Safety

- No `any` — use `unknown` when the type is genuinely unknown.
- Define explicit return types for public functions.
- Use discriminated unions for state variants.
- Prefer interfaces for object shapes, type aliases for unions/intersections.

```tsx
// Discriminated union for API state
type ApiState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };
```

## Code Smells to Avoid

- **Long functions** — break up functions over 50 lines.
- **Deep nesting** — refactor beyond 3-4 levels (early returns, extraction).
- **Magic numbers** — name them as constants.
- **Boolean parameters** — use options objects or separate functions instead.
- **Comments explaining "what"** — rewrite the code to be self-documenting; comments should explain "why."
