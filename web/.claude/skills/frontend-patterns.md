# Frontend Patterns

Guidance for React component architecture, hooks, and performance in a Vite SPA.

## Component Composition

- Prefer compound components for related UI groups (e.g., `<Tabs>`, `<Tabs.Panel>`).
- Use `children` prop for layout wrappers — avoid prop-drilling JSX.
- Keep components focused: one responsibility per component.
- Extract reusable pieces into the domain's `components/` directory.

## Custom Hooks

- Name hooks `use<Purpose>` — e.g., `useToggle`, `useDebounce`, `useProperties`.
- Hooks encapsulate state + side effects; components handle rendering.
- For async data fetching, return `{ data, loading, error }` tuple.
- Keep hooks composable — a hook can call other hooks.

```tsx
// Pattern: async data hook
function useProperties() {
  const [data, setData] = useState<TProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    propertiesApi.getAll()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

## State Management Hierarchy

Choose the simplest option that works:

1. **`useState`** — local component state (default choice).
2. **Derived state** — compute during render, no extra state needed.
3. **`useReducer`** — complex state transitions within one component.
4. **Context + `useReducer`** — shared state across a subtree.

Avoid introducing external state libraries unless Context becomes unwieldy.

## Performance

- **`React.memo`** — wrap components that re-render with the same props.
- **`useMemo`** — cache expensive computations, not simple primitives.
- **`useCallback`** — stabilize callbacks passed to memoized children.
- **`React.lazy` + `Suspense`** — code-split heavy routes/components.
- Measure before optimizing — premature optimization adds complexity.

```tsx
// Code-splitting a heavy page
const ReportsPage = React.lazy(() => import("../pages/ReportsPage"));

<Suspense fallback={<Spinner />}>
  <ReportsPage />
</Suspense>
```

## Form Handling

- Use controlled components with `useState` for simple forms.
- Validate on submit (not on every keystroke) unless UX requires it.
- Show inline error messages next to the relevant field.
- Disable submit button while a request is in flight.
- Reset form state after successful submission.

## Error Boundaries

- Wrap route-level components in error boundaries.
- Provide a user-friendly fallback UI with a retry action.
- Log errors for debugging but never expose stack traces to users.

```tsx
// Minimal error boundary usage
<ErrorBoundary fallback={<ErrorFallback />}>
  <PropertyDetails />
</ErrorBoundary>
```
