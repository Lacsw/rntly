---
paths:
  - "web/src/**/*.tsx"
---

# React Component Rules

## Component Structure
1. Imports (grouped: react, external, internal, relative)
2. Type definitions (`type TProps = { ... }`)
3. Component function (NO `React.FC` annotation)
4. Hooks first inside component
5. Event handlers
6. Early returns for loading/error states
7. Main render

## Pages vs Components
- **Pages** (`src/pages/`): orchestrate data fetching, compose components
- **Components** (`src/domains/*/components/`): receive props, don't fetch data

## Styling
- Use Tailwind CSS utility classes
- Use `cn()` from `@/shared/lib/cn` for conditional classes
- Use shared components from `@/shared/components` (Modal, PageHeader, StatCard, etc.)

## Lists
- Never use array index as React `key`
- Always use a stable identifier (id, unique value)

## Accessibility patterns (adopted Sprint 5)
- **Dialogs** (`shared/ui/Modal`): `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Escape closes, first-focusable auto-focus, Tab traps inside dialog. New modal-like surfaces must reuse `Modal`, not roll their own.
- **Tabs** (`shared/ui/DetailTabs`): ARIA tab pattern — `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `aria-controls`, roving `tabIndex` (active=0, rest=-1), ArrowLeft/Right/Home/End move focus.
- **Menu triggers**: buttons that open a `role="menu"` need `aria-haspopup="menu"` + `aria-expanded={open}` + `aria-controls={menuId}`.
- **Icon-only buttons**: require `aria-label`. Icon inside gets `aria-hidden`.
- **Grouped nav**: wrap link groups in `<div role="group" aria-labelledby={labelId}>` with a `useId` label.
- **Live regions**: spinners/status get `role="status"` + `aria-live="polite"`. Errors get `role="alert"`.
- **Heading order**: one `<h1>` per page (via `PageHeader`); sections `<h2>`; cards `<h3>`. Never skip levels.

## Feedback + forms patterns (adopted Sprint 7)
- **Mutations → toasts**: every create/update/delete calls `toast.success(...)` on happy path and `toast.error(...)` on failure. Import from `@/shared/toast`. Don't render mutation errors as inline banners.
- **Fetch errors → banners**: only bootstrap/list-fetch failures set the hook's `error` state; pages render `<ErrorBanner>` from that.
- **Optimistic deletes**: snapshot → filter locally → await api → revert snapshot + toast on error. No post-success refetch.
- **Skeletons**: list pages render domain skeleton cards (`PropertyCardSkeleton`, `TenantCardSkeleton`, `LeaseCardSkeleton`) during initial loading, not `<Loading />`. Count = 6 per grid. Dashboard uses `StatCardSkeleton` + `<Skeleton>` blocks.
- **Inline validation**: form hooks expose `errors: { field?: string }`. Pass into `FormField` / `FormSelect` via `error={errors.field}` — the component wires `aria-invalid` + `aria-describedby` and renders the message.

## Avoid
- `data-testid` attributes — use semantic HTML and ARIA roles instead
- Prop drilling more than 2 levels — extract to context or composition
- Business logic in components — extract to hooks or utils
- Deeply nested ternaries in JSX
