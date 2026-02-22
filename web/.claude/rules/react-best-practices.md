---
paths: ["**/*.tsx", "**/*.ts"]
---

# React Best Practices

Always-active rules for React + TypeScript in a Vite SPA.

## Avoid Waterfalls

- Use `Promise.all()` for independent async operations — never `await` them sequentially.
- Defer `await` until the result is actually needed.

```tsx
// Good: start both, await together
const propertiesPromise = propertiesApi.getAll();
const tenantsPromise = tenantsApi.getAll();
const [properties, tenants] = await Promise.all([propertiesPromise, tenantsPromise]);
```

## Bundle Size

- Use `React.lazy()` + `<Suspense>` for heavy components and route-level code splitting.
- Conditionally import modules only when needed (`import()` in event handlers).
- Preload lazy components on hover/focus for perceived performance.

## Prevent Unnecessary Re-renders

- **Derive state during render** — do not use `useEffect` to sync state from props.

```tsx
// Good: derive during render
const fullName = `${firstName} ${lastName}`;

// Bad: useEffect to sync derived state
useEffect(() => setFullName(`${firstName} ${lastName}`), [firstName, lastName]);
```

- **Functional `setState`** — always use the callback form when new state depends on previous state.

```tsx
setCount((prev) => prev + 1);
```

- **Lazy state initialization** — pass a function to `useState` for expensive initial values.

```tsx
const [data] = useState(() => expensiveComputation());
```

- **Hoist default prop values** outside the component to keep stable references.

```tsx
const DEFAULT_FILTERS: TFilters = { status: "active" };

function PropertyList({ filters = DEFAULT_FILTERS }) { ... }
```

- **`useRef` for values that don't trigger re-renders** — timers, previous values, DOM refs.
- **`useTransition`** for non-urgent state updates (filtering large lists, tab switches).
- **Don't `useMemo` simple primitives** — memoize only expensive computations or reference-unstable objects/arrays.
- **Narrow effect dependencies** — extract only the needed values, not entire objects.
- **Prefer event handlers over `useEffect`** — if something happens in response to a user action, handle it in the event handler, not an effect.

## Rendering

- **Hoist static JSX** outside the component when it doesn't depend on props or state.
- **Use `content-visibility: auto`** CSS for long lists or off-screen sections.
- **Use ternary, not `&&`** for conditional rendering to avoid rendering `0` or `""`.

```tsx
// Good
{items.length > 0 ? <List items={items} /> : null}

// Bad — renders "0" if items is empty
{items.length && <List items={items} />}
```

## JavaScript Performance

- **Early return** — exit functions as soon as the result is determined.
- **Use `Set` and `Map`** for O(1) lookups instead of `Array.includes()` or `Array.find()` in hot paths.
- **Combine iterations** — chain `.filter().map()` into a single `.reduce()` or loop when processing large arrays.
- **Use `toSorted()` / `toReversed()`** for immutable array operations.
- **Build index maps** for repeated lookups into arrays.
- **Cache property access** in tight loops — extract `obj.nested.value` to a local variable.
