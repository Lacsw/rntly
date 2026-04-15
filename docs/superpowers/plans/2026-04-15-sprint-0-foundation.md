# Sprint 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install test tooling, extract shared UI primitives and utilities, introduce env-driven API URL, and lazy-load route pages — so feature sprints 1-4 can lean on a tested, DRY foundation.

**Architecture:** Purely additive changes plus two small refactors (move shared components into `ui/` subfolder; adopt primitives on `PropertiesPage`). No domain logic changes. Each task is one commit and is individually reversible. After every task, `npm run lint && npx tsc --noEmit && npm test && npm run build` must stay green.

**Tech Stack:** React 19, TypeScript 5.9 (strict), Vite 7, Tailwind 4, Vitest 1.x, @testing-library/react 16.x, jsdom. All commands run from `/Users/romanfrolov/dev/rntly/web`.

**Spec reference:** `docs/superpowers/specs/2026-04-14-fe-scope-c-design.md` section 4.

---

## File structure

**Created in this sprint:**
- `web/src/tests/setup.ts` — global Vitest setup (jest-dom matchers)
- `web/src/tests/sanity.test.ts` — baseline smoke test
- `web/.env.example` — document `VITE_API_URL`
- `web/src/shared/components/ui/Loading.tsx` + `Loading.test.tsx`
- `web/src/shared/components/ui/EmptyState.tsx` + `EmptyState.test.tsx`
- `web/src/shared/components/ui/ErrorBanner.tsx` + `ErrorBanner.test.tsx`
- `web/src/shared/components/ui/StatCard.tsx` + `StatCard.test.tsx`
- `web/src/shared/components/ui/PageHeader.tsx` + `PageHeader.test.tsx`
- `web/src/shared/components/ui/ConfirmDialog.tsx` + `ConfirmDialog.test.tsx`
- `web/src/shared/components/index.ts` — barrel for all `ui/` primitives
- `web/src/shared/utils/format.ts` + `format.test.ts`
- `web/src/domains/properties/hooks/useProperties.test.ts`

**Moved in this sprint (refactor only, no code change):**
- `web/src/shared/components/Modal.tsx` → `web/src/shared/components/ui/Modal.tsx`
- `web/src/shared/components/StatusBadge.tsx` → `web/src/shared/components/ui/StatusBadge.tsx`
- `web/src/shared/components/FormField.tsx` → `web/src/shared/components/ui/FormField.tsx`
- `web/src/shared/components/FormSelect.tsx` → `web/src/shared/components/ui/FormSelect.tsx`

**Modified in this sprint:**
- `web/package.json` — add dev deps + test scripts
- `web/vite.config.ts` — add `test` config block
- `web/tsconfig.app.json` — add test type references
- `web/src/shared/api/client.ts` — read base URL from env
- `web/src/app/routes.tsx` — `React.lazy` + `Suspense`
- `web/src/pages/PropertiesPage.tsx` — adopt `PageHeader`, `Loading`, `ErrorBanner`, pass `onDelete`
- `web/src/domains/properties/components/PropertyCard/PropertyCard.tsx` — add delete menu + `ConfirmDialog`
- Import sites of moved components (Task 10): `CreatePropertyForm/index.tsx`, `PropertyCard/PropertyCardImage.tsx`, `PropertiesPage.tsx`

---

## Task 1: Install Vitest + RTL + jsdom and wire a sanity test

**Files:**
- Modify: `web/package.json`
- Modify: `web/vite.config.ts`
- Modify: `web/tsconfig.app.json`
- Create: `web/src/tests/setup.ts`
- Create: `web/src/tests/sanity.test.ts`

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

Expected: packages install cleanly, `package.json` lists all six under `devDependencies`.

- [ ] **Step 2: Add test scripts to package.json**

Replace the `scripts` block in `web/package.json` with:
```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage"
  },
```

- [ ] **Step 3: Update `web/vite.config.ts` with Vitest config**

Replace entire file with:
```ts
/// <reference types="vitest/config" />
import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
  },
})
```

- [ ] **Step 4: Register Vitest + jest-dom types in tsconfig.app.json**

In `web/tsconfig.app.json`, change the `types` line from:
```json
    "types": ["vite/client"],
```
to:
```json
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"],
```

- [ ] **Step 5: Create `web/src/tests/setup.ts`**

Content:
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 6: Create `web/src/tests/sanity.test.ts`**

Content:
```ts
describe('vitest setup', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Run the sanity test**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npm test
```

Expected: `1 passed` under `src/tests/sanity.test.ts`, exit 0.

- [ ] **Step 8: Run typecheck + lint to confirm the scaffolding didn't break anything**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx tsc --noEmit && npm run lint
```

Expected: both exit 0.

- [ ] **Step 9: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/package.json web/package-lock.json web/vite.config.ts web/tsconfig.app.json web/src/tests/ && git commit -m "chore(web): add Vitest + RTL + jsdom with sanity test"
```

---

## Task 2: Read API URL from `VITE_API_URL` env var

**Files:**
- Create: `web/.env.example`
- Modify: `web/src/shared/api/client.ts`
- Modify: `web/.gitignore` (if `.env.local` not already ignored)

- [ ] **Step 1: Create `web/.env.example`**

Content:
```
VITE_API_URL=http://localhost:8080
```

- [ ] **Step 2: Ensure `.env.local` is gitignored**

Check `web/.gitignore`. If it does not contain `.env.local` or a pattern covering it, append this line:
```
.env.local
```

- [ ] **Step 3: Update `web/src/shared/api/client.ts` to read env var with fallback**

Replace entire file with:
```ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

- [ ] **Step 4: Verify build and tests still pass**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx tsc --noEmit && npm test && npm run build
```

Expected: all three exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/.env.example web/.gitignore web/src/shared/api/client.ts && git commit -m "chore(web): read API URL from VITE_API_URL with fallback"
```

---

## Task 3: `Loading` component

**Files:**
- Create: `web/src/shared/components/ui/Loading.tsx`
- Create: `web/src/shared/components/ui/Loading.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `web/src/shared/components/ui/Loading.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
  it('renders the default label', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders a custom label when provided', () => {
    render(<Loading label="Fetching properties" />);
    expect(screen.getByText('Fetching properties')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/Loading.test.tsx
```

Expected: FAIL with "Failed to resolve import './Loading'".

- [ ] **Step 3: Implement the component**

Create `web/src/shared/components/ui/Loading.tsx`:
```tsx
import { Loader2 } from 'lucide-react';

type TLoadingProps = {
  label?: string;
};

export const Loading = ({ label = 'Loading...' }: TLoadingProps) => {
  return (
    <div className="flex items-center justify-center gap-2 text-stone-500 py-8">
      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/Loading.test.tsx
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/shared/components/ui/Loading.tsx web/src/shared/components/ui/Loading.test.tsx && git commit -m "feat(shared/ui): add Loading component"
```

---

## Task 4: `EmptyState` component

**Files:**
- Create: `web/src/shared/components/ui/EmptyState.tsx`
- Create: `web/src/shared/components/ui/EmptyState.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `web/src/shared/components/ui/EmptyState.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No properties yet" />);
    expect(screen.getByText('No properties yet')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<EmptyState title="No properties" description="Add one to get started" />);
    expect(screen.getByText('Add one to get started')).toBeInTheDocument();
  });

  it('renders the action when provided', () => {
    render(<EmptyState title="No properties" action={<button>Add property</button>} />);
    expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/EmptyState.test.tsx
```

Expected: FAIL with missing `./EmptyState`.

- [ ] **Step 3: Implement the component**

Create `web/src/shared/components/ui/EmptyState.tsx`:
```tsx
import type { ReactNode } from 'react';

type TEmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, icon, action }: TEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-stone-400 mb-3">{icon}</div>}
      <h3 className="text-lg font-medium text-stone-700">{title}</h3>
      {description && <p className="text-sm text-stone-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/EmptyState.test.tsx
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/shared/components/ui/EmptyState.tsx web/src/shared/components/ui/EmptyState.test.tsx && git commit -m "feat(shared/ui): add EmptyState component"
```

---

## Task 5: `ErrorBanner` component

**Files:**
- Create: `web/src/shared/components/ui/ErrorBanner.tsx`
- Create: `web/src/shared/components/ui/ErrorBanner.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `web/src/shared/components/ui/ErrorBanner.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBanner } from './ErrorBanner';

describe('ErrorBanner', () => {
  it('renders the message', () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not supplied', () => {
    render(<ErrorBanner message="Oops" />);
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorBanner message="Oops" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/ErrorBanner.test.tsx
```

Expected: FAIL with missing `./ErrorBanner`.

- [ ] **Step 3: Implement the component**

Create `web/src/shared/components/ui/ErrorBanner.tsx`:
```tsx
type TErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export const ErrorBanner = ({ message, onRetry }: TErrorBannerProps) => {
  return (
    <div
      role="alert"
      className="bg-red-50 text-red-700 p-3 rounded mb-4 flex items-center justify-between"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium underline hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/ErrorBanner.test.tsx
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/shared/components/ui/ErrorBanner.tsx web/src/shared/components/ui/ErrorBanner.test.tsx && git commit -m "feat(shared/ui): add ErrorBanner component"
```

---

## Task 6: `StatCard` component

**Files:**
- Create: `web/src/shared/components/ui/StatCard.tsx`
- Create: `web/src/shared/components/ui/StatCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `web/src/shared/components/ui/StatCard.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders label, value, and icon', () => {
    render(<StatCard label="Revenue" value="$45,500" icon={<span>icon</span>} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$45,500')).toBeInTheDocument();
    expect(screen.getByText('icon')).toBeInTheDocument();
  });

  it('applies emerald color for a positive delta', () => {
    render(
      <StatCard
        label="Revenue"
        value="$45,500"
        icon={<span>icon</span>}
        delta={{ value: '+12%', positive: true }}
      />,
    );
    expect(screen.getByText('+12%').className).toContain('text-emerald-600');
  });

  it('applies red color for a negative delta', () => {
    render(
      <StatCard
        label="Revenue"
        value="$45,500"
        icon={<span>icon</span>}
        delta={{ value: '-5%', positive: false }}
      />,
    );
    expect(screen.getByText('-5%').className).toContain('text-red-600');
  });

  it('omits delta element when delta is not provided', () => {
    render(<StatCard label="Revenue" value="$45,500" icon={<span>icon</span>} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/StatCard.test.tsx
```

Expected: FAIL with missing `./StatCard`.

- [ ] **Step 3: Implement the component**

Create `web/src/shared/components/ui/StatCard.tsx`:
```tsx
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type TStatCardDelta = {
  value: string;
  positive: boolean;
};

type TStatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  delta?: TStatCardDelta;
};

export const StatCard = ({ label, value, icon, delta }: TStatCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-stone-500">{label}</p>
        <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
        {delta && (
          <p
            className={cn(
              'text-xs mt-1',
              delta.positive ? 'text-emerald-600' : 'text-red-600',
            )}
          >
            {delta.value}
          </p>
        )}
      </div>
      <div className="text-stone-400">{icon}</div>
    </div>
  );
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/StatCard.test.tsx
```

Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/shared/components/ui/StatCard.tsx web/src/shared/components/ui/StatCard.test.tsx && git commit -m "feat(shared/ui): add StatCard component"
```

---

## Task 7: `PageHeader` component

**Files:**
- Create: `web/src/shared/components/ui/PageHeader.tsx`
- Create: `web/src/shared/components/ui/PageHeader.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `web/src/shared/components/ui/PageHeader.test.tsx`:
```tsx
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageHeader } from './PageHeader';

const wrap = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('PageHeader', () => {
  it('renders the title', () => {
    wrap(<PageHeader title="Properties" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Properties' })).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    wrap(<PageHeader title="Properties" subtitle="Manage your rentals" />);
    expect(screen.getByText('Manage your rentals')).toBeInTheDocument();
  });

  it('renders the actions slot when provided', () => {
    wrap(<PageHeader title="Properties" actions={<button>Add</button>} />);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders a back link when backHref is provided', () => {
    wrap(<PageHeader title="Detail" backHref="/properties" />);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/properties');
  });

  it('omits back link when backHref is absent', () => {
    wrap(<PageHeader title="Properties" />);
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/PageHeader.test.tsx
```

Expected: FAIL with missing `./PageHeader`.

- [ ] **Step 3: Implement the component**

Create `web/src/shared/components/ui/PageHeader.tsx`:
```tsx
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type TPageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
};

export const PageHeader = ({ title, subtitle, actions, backHref }: TPageHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-2">
        {backHref && (
          <Link
            to={backHref}
            aria-label="Back"
            className="text-stone-500 hover:text-stone-800 mt-1"
          >
            <ChevronLeft size={20} aria-hidden />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
          {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/PageHeader.test.tsx
```

Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/shared/components/ui/PageHeader.tsx web/src/shared/components/ui/PageHeader.test.tsx && git commit -m "feat(shared/ui): add PageHeader component"
```

---

## Task 8: `ConfirmDialog` component

**Note:** This task depends on the existing `Modal` component at `web/src/shared/components/Modal.tsx`. That file will be moved to `ui/Modal.tsx` in Task 10, so import via relative path `./Modal` for now — this will continue to resolve after the Task 10 move.

**Files:**
- Create: `web/src/shared/components/ui/ConfirmDialog.tsx`
- Create: `web/src/shared/components/ui/ConfirmDialog.test.tsx`

- [ ] **Step 1: Move `Modal.tsx` into `ui/` early (prerequisite)**

`ConfirmDialog` imports `Modal` by relative path. Move `Modal.tsx` into `ui/` now so the import resolves:

```bash
cd /Users/romanfrolov/dev/rntly/web && git mv src/shared/components/Modal.tsx src/shared/components/ui/Modal.tsx
```

Update the one consumer at `web/src/pages/PropertiesPage.tsx` line 4 from:
```ts
import { Modal } from '@/shared/components/Modal';
```
to:
```ts
import { Modal } from '@/shared/components/ui/Modal';
```

Verify the app still builds:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 2: Write the failing test**

Create `web/src/shared/components/ui/ConfirmDialog.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

const baseProps = {
  open: true,
  title: 'Delete property',
  message: 'This cannot be undone.',
  onConfirm: () => {},
  onCancel: () => {},
};

describe('ConfirmDialog', () => {
  it('renders title and message when open', () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText('Delete property')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmDialog {...baseProps} open={false} />);
    expect(screen.queryByText('Delete property')).not.toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('uses a destructive red confirm button when destructive is true', () => {
    render(<ConfirmDialog {...baseProps} destructive />);
    expect(screen.getByRole('button', { name: 'Confirm' }).className).toContain('bg-red-700');
  });

  it('uses the custom confirm label when supplied', () => {
    render(<ConfirmDialog {...baseProps} confirmLabel="Delete" />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/ConfirmDialog.test.tsx
```

Expected: FAIL with missing `./ConfirmDialog`.

- [ ] **Step 4: Implement the component**

Create `web/src/shared/components/ui/ConfirmDialog.tsx`:
```tsx
import { Modal } from './Modal';
import { cn } from '../../lib/cn';

type TConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
  onConfirm,
  onCancel,
}: TConfirmDialogProps) => {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-stone-600 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            'px-4 py-2 text-white rounded',
            destructive ? 'bg-red-700 hover:bg-red-800' : 'bg-orange-700 hover:bg-orange-800',
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
```

- [ ] **Step 5: Run the test to verify it passes**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/components/ui/ConfirmDialog.test.tsx
```

Expected: 6 passed.

- [ ] **Step 6: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/shared/components/ui/ConfirmDialog.tsx web/src/shared/components/ui/ConfirmDialog.test.tsx web/src/pages/PropertiesPage.tsx && git commit -m "feat(shared/ui): add ConfirmDialog component"
```

Note: the `git mv` in Step 1 already staged the `Modal.tsx` rename; it will be included in this commit automatically.

---

## Task 9: `formatCurrency`, `formatDate`, `initials` utilities

**Files:**
- Create: `web/src/shared/utils/format.ts`
- Create: `web/src/shared/utils/format.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/src/shared/utils/format.test.ts`:
```ts
import { formatCurrency, formatDate, initials } from './format';

describe('formatCurrency', () => {
  it('formats positive whole dollars with US locale', () => {
    expect(formatCurrency(1850)).toBe('$1,850');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });

  it('rounds fractional cents to the nearest whole dollar', () => {
    expect(formatCurrency(1850.75)).toBe('$1,851');
  });
});

describe('formatDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatDate('2026-04-15T00:00:00Z')).toMatch(/Apr/);
  });

  it('returns an empty string for non-date input', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('returns an empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('initials', () => {
  it('returns uppercased first letter of each name', () => {
    expect(initials('Sarah', 'Johnson')).toBe('SJ');
  });

  it('handles an empty first name', () => {
    expect(initials('', 'Johnson')).toBe('J');
  });

  it('handles an empty last name', () => {
    expect(initials('Sarah', '')).toBe('S');
  });

  it('returns an empty string when both names are empty', () => {
    expect(initials('', '')).toBe('');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/utils/format.test.ts
```

Expected: FAIL with missing `./format`.

- [ ] **Step 3: Implement the utilities**

Create `web/src/shared/utils/format.ts`:
```ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (iso: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const initials = (first: string, last: string): string => {
  const f = first.at(0) ?? '';
  const l = last.at(0) ?? '';
  return (f + l).toUpperCase();
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/shared/utils/format.test.ts
```

Expected: 11 passed.

- [ ] **Step 5: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/shared/utils/ && git commit -m "feat(shared/utils): add formatCurrency, formatDate, initials"
```

---

## Task 10: Move remaining shared components into `ui/` and add a barrel

`Modal.tsx` was moved in Task 8. This task handles the other three: `StatusBadge`, `FormField`, `FormSelect`. Also creates the `index.ts` barrel so downstream code has a single stable import surface.

**Files:**
- Move: `web/src/shared/components/StatusBadge.tsx` → `ui/StatusBadge.tsx`
- Move: `web/src/shared/components/FormField.tsx` → `ui/FormField.tsx`
- Move: `web/src/shared/components/FormSelect.tsx` → `ui/FormSelect.tsx`
- Create: `web/src/shared/components/index.ts`
- Modify: `web/src/domains/properties/components/CreatePropertyForm/index.tsx` (imports)
- Modify: `web/src/domains/properties/components/PropertyCard/PropertyCardImage.tsx` (import)

- [ ] **Step 1: Move the three files**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web
git mv src/shared/components/StatusBadge.tsx src/shared/components/ui/StatusBadge.tsx
git mv src/shared/components/FormField.tsx src/shared/components/ui/FormField.tsx
git mv src/shared/components/FormSelect.tsx src/shared/components/ui/FormSelect.tsx
```

- [ ] **Step 2: Create the barrel at `web/src/shared/components/index.ts`**

Content:
```ts
export { Loading } from './ui/Loading';
export { EmptyState } from './ui/EmptyState';
export { ErrorBanner } from './ui/ErrorBanner';
export { StatCard } from './ui/StatCard';
export { PageHeader } from './ui/PageHeader';
export { ConfirmDialog } from './ui/ConfirmDialog';
export { Modal } from './ui/Modal';
export { StatusBadge } from './ui/StatusBadge';
export { FormField } from './ui/FormField';
export { FormSelect } from './ui/FormSelect';
```

- [ ] **Step 3: Update `web/src/domains/properties/components/CreatePropertyForm/index.tsx` imports**

Change lines 2-3 from:
```ts
import { FormField } from '@/shared/components/FormField';
import { FormSelect } from '@/shared/components/FormSelect';
```
to:
```ts
import { FormField, FormSelect } from '@/shared/components';
```

- [ ] **Step 4: Update `web/src/domains/properties/components/PropertyCard/PropertyCardImage.tsx` import**

Change line 3 from:
```ts
import { StatusBadge } from '@/shared/components/StatusBadge';
```
to:
```ts
import { StatusBadge } from '@/shared/components';
```

- [ ] **Step 5: Update `web/src/pages/PropertiesPage.tsx` to use the barrel**

Change line 4 from:
```ts
import { Modal } from '@/shared/components/ui/Modal';
```
to:
```ts
import { Modal } from '@/shared/components';
```

- [ ] **Step 6: Verify lint + typecheck + tests + build**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npm run lint && npx tsc --noEmit && npm test && npm run build
```

Expected: all exit 0.

- [ ] **Step 7: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add -A web/src/shared/components web/src/domains/properties web/src/pages/PropertiesPage.tsx && git commit -m "refactor(shared): move components into ui/ subfolder with barrel"
```

---

## Task 11: Adopt `PageHeader`, `Loading`, `ErrorBanner` on `PropertiesPage`

**Files:**
- Modify: `web/src/pages/PropertiesPage.tsx`

- [ ] **Step 1: Replace ad-hoc markup with shared primitives**

Replace the entire contents of `web/src/pages/PropertiesPage.tsx` with:
```tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProperties, CreatePropertyForm, PropertyCard } from '../domains/properties';
import {
  Modal,
  PageHeader,
  Loading,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';
import { BuildingIcon } from '@/shared/icons/BuildingIcon';

export const PropertiesPage = () => {
  const { properties, loading, error, createProperty } = useProperties();
  const [showForm, setShowForm] = useState(false);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Properties"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-700 text-white px-4 py-2 rounded hover:bg-orange-800 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Property
          </button>
        }
      />

      {error && <ErrorBanner message={error} />}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Property"
        icon={<BuildingIcon className="w-6 h-6 text-stone-700" />}
      >
        <CreatePropertyForm onSubmit={createProperty} onCancel={() => setShowForm(false)} />
      </Modal>

      <p className="text-sm text-stone-500 mb-4">
        Showing {properties.length} of {properties.length} properties
      </p>

      {properties.length === 0 ? (
        <EmptyState title="No properties yet" description="Add your first property to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
```

- [ ] **Step 2: Verify the page still works**

Run the dev server:
```bash
cd /Users/romanfrolov/dev/rntly/web && npm run dev -- --port 3333 --strictPort
```

In a browser, visit `http://localhost:3333/properties`. Verify:
- Title "Properties" renders
- "Add Property" button opens the modal
- If the API is down, an `ErrorBanner` renders with retry-free copy
- Empty list shows `EmptyState`; non-empty shows the grid

Stop the dev server (Ctrl+C) when confirmed.

- [ ] **Step 3: Verify lint + typecheck + tests + build**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npm run lint && npx tsc --noEmit && npm test && npm run build
```

Expected: all exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/pages/PropertiesPage.tsx && git commit -m "refactor(properties): adopt PageHeader + Loading + ErrorBanner on PropertiesPage"
```

---

## Task 12: Lazy-load route pages with `Suspense`

**Files:**
- Modify: `web/src/app/routes.tsx`

- [ ] **Step 1: Replace `web/src/app/routes.tsx` with lazy-loaded routes**

Replace entire file with:
```tsx
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../shared/layouts/MainLayout';
import { Loading } from '@/shared/components';

const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const PropertiesPage = lazy(() => import('../pages/PropertiesPage'));
const TenantsPage = lazy(() => import('../pages/TenantsPage'));
const LeasesPage = lazy(() => import('../pages/LeasesPage'));
const ContractsPage = lazy(() => import('../pages/ContractsPage'));
const TransactionsPage = lazy(() => import('../pages/TransactionsPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/leases" element={<LeasesPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
```

- [ ] **Step 2: Verify the production build produces separate chunks per page**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npm run build
```

Expected: `vite build` output shows multiple chunk files under `dist/assets/` whose names include page identifiers (e.g. `DashboardPage-*.js`, `PropertiesPage-*.js`). If the output only shows a single large chunk, the lazy-load did not take effect — recheck the imports.

- [ ] **Step 3: Verify lint + typecheck + tests**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npm run lint && npx tsc --noEmit && npm test
```

Expected: all exit 0.

- [ ] **Step 4: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/app/routes.tsx && git commit -m "refactor(app): lazy-load route pages with Suspense"
```

---

## Task 13: `useProperties` hook unit tests

**Files:**
- Create: `web/src/domains/properties/hooks/useProperties.test.ts`

- [ ] **Step 1: Write the test**

Create `web/src/domains/properties/hooks/useProperties.test.ts`:
```ts
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

const mockProperty: TProperty = {
  id: '1',
  address: '123 Main St',
  type: 'apartment',
  bedrooms: 2,
  rent_amount: 1500,
  status: 'available',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('useProperties', () => {
  beforeEach(() => {
    vi.mocked(propertiesApi.getAll).mockResolvedValue({ data: [mockProperty] } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches properties on mount and exposes them', async () => {
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toEqual([mockProperty]);
    expect(result.current.error).toBe('');
  });

  it('sets error when the fetch fails', async () => {
    vi.mocked(propertiesApi.getAll).mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch properties');
    expect(result.current.properties).toEqual([]);
  });

  it('createProperty calls the api and refetches the list', async () => {
    vi.mocked(propertiesApi.create).mockResolvedValue({ data: mockProperty } as never);
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createProperty({
        address: '456 Oak',
        type: 'condo',
        bedrooms: 1,
        rent_amount: 2000,
      });
    });

    expect(propertiesApi.create).toHaveBeenCalledOnce();
    expect(propertiesApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('sets error when createProperty fails', async () => {
    vi.mocked(propertiesApi.create).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createProperty({
        address: 'X',
        type: 'apartment',
        bedrooms: 1,
        rent_amount: 1000,
      });
    });

    expect(result.current.error).toBe('Failed to create property');
  });

  it('deleteProperty calls the api with the id and refetches the list', async () => {
    vi.mocked(propertiesApi.delete).mockResolvedValue({} as never);
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteProperty('1');
    });

    expect(propertiesApi.delete).toHaveBeenCalledWith('1');
    expect(propertiesApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('sets error when deleteProperty fails', async () => {
    vi.mocked(propertiesApi.delete).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteProperty('1');
    });

    expect(result.current.error).toBe('Failed to delete property');
  });
});
```

- [ ] **Step 2: Run the test**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npx vitest run src/domains/properties/hooks/useProperties.test.ts
```

Expected: 6 passed. If any fail, the failure reveals a real bug in the existing hook — fix the hook before committing the test.

- [ ] **Step 3: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/domains/properties/hooks/useProperties.test.ts && git commit -m "test(properties): add useProperties hook tests"
```

---

## Task 14: Wire `deleteProperty` to `PropertyCard` menu with `ConfirmDialog`

**Files:**
- Modify: `web/src/domains/properties/components/PropertyCard/PropertyCard.tsx`
- Modify: `web/src/pages/PropertiesPage.tsx`

- [ ] **Step 1: Add an optional `onDelete` prop and a kebab menu + confirm flow to `PropertyCard`**

Replace the entire contents of `web/src/domains/properties/components/PropertyCard/PropertyCard.tsx` with:
```tsx
import { useState } from 'react';
import { MapPin, MoreVertical, Trash2 } from 'lucide-react';
import type { TProperty } from '../../api';
import { PropertyCardImage } from './PropertyCardImage';
import { PropertyCardStats } from './PropertyCardStats';
import { PropertyCardTenant } from './PropertyCardTenant';
import { ConfirmDialog } from '@/shared/components';

type TPropertyCardProps = {
  property: TProperty;
  onDelete?: (id: string) => void;
};

export const PropertyCard = ({ property, onDelete }: TPropertyCardProps) => {
  const displayName = property.name ?? property.address;
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 relative">
      {onDelete && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm"
            aria-label="Property actions"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 mt-1 bg-white border border-stone-100 rounded-lg shadow-md py-1 min-w-[120px]"
              role="menu"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                role="menuitem"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <PropertyCardImage property={property} displayName={displayName} />

      <div className="p-4">
        <h3 className="text-lg font-semibold text-stone-900">{displayName}</h3>
        <div className="flex items-center gap-1 mt-1 text-sm text-stone-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>{property.address}</span>
        </div>

        <PropertyCardStats property={property} />

        {property.tenant_name && <PropertyCardTenant name={property.tenant_name} />}
      </div>

      {onDelete && (
        <ConfirmDialog
          open={confirmOpen}
          title="Delete property"
          message={`Are you sure you want to delete ${displayName}? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            onDelete(property.id);
            setConfirmOpen(false);
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};
```

- [ ] **Step 2: Pass `deleteProperty` from `PropertiesPage` into each `PropertyCard`**

In `web/src/pages/PropertiesPage.tsx`, change this block:
```tsx
  const { properties, loading, error, createProperty } = useProperties();
```
to:
```tsx
  const { properties, loading, error, createProperty, deleteProperty } = useProperties();
```

And change the card rendering line from:
```tsx
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
```
to:
```tsx
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} onDelete={deleteProperty} />
          ))}
```

- [ ] **Step 3: Manually verify the flow in the browser**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npm run dev -- --port 3333 --strictPort
```

Also ensure the backend is running (`make dev` from `/Users/romanfrolov/dev/rntly` in another terminal).

Visit `http://localhost:3333/properties`. Verify:
- Each `PropertyCard` shows a kebab (three-dot) icon in the top-right
- Clicking the kebab opens a small menu with a red "Delete" item
- Clicking "Delete" opens `ConfirmDialog` with title "Delete property" and a destructive red confirm button
- Clicking "Cancel" closes the dialog; clicking "Delete" removes the property and the list refreshes

Stop the dev server (Ctrl+C).

- [ ] **Step 4: Run the full quality gate**

Run:
```bash
cd /Users/romanfrolov/dev/rntly/web && npm run lint && npx tsc --noEmit && npm test && npm run build
```

Expected: all exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/romanfrolov/dev/rntly && git add web/src/domains/properties/components/PropertyCard/PropertyCard.tsx web/src/pages/PropertiesPage.tsx && git commit -m "fix(properties): wire deleteProperty to PropertyCard kebab menu"
```

---

## Sprint 0 exit checklist

After Task 14, before declaring Sprint 0 done, run every gate once more from a clean state:

- [ ] `cd /Users/romanfrolov/dev/rntly/web && npm run lint` → exit 0
- [ ] `cd /Users/romanfrolov/dev/rntly/web && npx tsc --noEmit` → exit 0
- [ ] `cd /Users/romanfrolov/dev/rntly/web && npm test` → all suites pass (expect Loading 2, EmptyState 3, ErrorBanner 3, StatCard 4, PageHeader 5, ConfirmDialog 6, format 11, useProperties 6, sanity 1 = 41 passing tests)
- [ ] `cd /Users/romanfrolov/dev/rntly/web && npm run build` → exit 0 with per-route chunks visible in the output
- [ ] `git log --oneline -14` shows 14 commits, all prefixed with `chore(web)`, `feat(shared/...)`, `feat(shared/utils)`, `refactor(shared)`, `refactor(app)`, `refactor(properties)`, `test(properties)`, or `fix(properties)` — none with `Co-Authored-By`

Sprint 0 is now the foundation for Sprints 1-4. Next plan: `docs/superpowers/plans/<date>-sprint-1-tenants.md`.
