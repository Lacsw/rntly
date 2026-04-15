# Sprint 1 — Tenants Domain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fully functional Tenants page — list, stats, create — matching the lovable.app template, all tested at the hook/utility layer, following the Properties domain pattern.

**Architecture:** Follow the Properties domain shape exactly: `api/` (already exists) → `hooks/` (state management) → `utils/` (pure helpers, tested) → `components/` (presentational) → page composes via barrel. Data that a `TenantCard` needs from the *leases* domain (active lease, property) is deferred to Sprint 2 via a follow-up commit (C2.9 in the spec) — Sprint 1 passes only `tenant` and renders card fields gracefully when `lease`/`property` are absent.

**Tech Stack:** React 19, TypeScript 5.9 strict, Vitest 4.x + RTL 16.x, Tailwind 4, axios. All commands run from `/Users/romanfrolov/dev/rntly/web` unless otherwise noted (we'll run from a worktree at `.worktrees/sprint-1-tenants` during execution).

**Spec reference:** `docs/superpowers/specs/2026-04-14-fe-scope-c-design.md` section 5.

**Lessons baked in from Sprint 0 review:**
- Hooks reset `error` at the start of each fetch, and mutations `await` their refetch.
- Tests use `toHaveClass(...)` (jest-dom matcher) instead of `className.toContain(...)`.
- New types use the `T` prefix. New icon-only buttons have `aria-label`.

---

## File structure

**Created in this sprint:**

```
web/src/domains/tenants/
├── api/                                  (already exists — untouched)
├── hooks/
│   ├── useTenants.ts                     + useTenants.test.ts
│   ├── useCreateTenantForm.ts            + useCreateTenantForm.test.ts
│   └── useTenantStats.ts                 + useTenantStats.test.ts
├── utils/
│   └── tenant.ts                         + tenant.test.ts
├── components/
│   ├── TenantCard.tsx
│   ├── CreateTenantForm.tsx
│   └── TenantStatCards.tsx
└── index.ts                              (barrel — replaces the stub)
```

**Modified in this sprint:**
- `web/src/pages/TenantsPage.tsx` — replaces the placeholder `<h1>Tenants</h1>` stub

**Boundary rules (unchanged):**
- `TenantsPage` imports only from `../domains/tenants` (barrel) and `@/shared/components`.
- Tenants domain does not import from Leases or Properties — stats that need lease data accept it as a parameter with sensible empty defaults in Sprint 1.

---

## Task 1: `useTenants` hook + tests

**Goal:** Fetch / create / delete tenants, exposing `{ tenants, loading, error, createTenant, deleteTenant }`. Mirror `useProperties` shape but start with the corrected template (error reset + awaited refetch — the Sprint 0 review lesson).

**Files:**
- Create: `web/src/domains/tenants/hooks/useTenants.ts`
- Create: `web/src/domains/tenants/hooks/useTenants.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/src/domains/tenants/hooks/useTenants.test.ts`:
```ts
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTenants } from './useTenants';
import { tenantsApi } from '../api';
import type { TTenant } from '../api';

vi.mock('../api', () => ({
  tenantsApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockTenant: TTenant = {
  id: '1',
  first_name: 'Sarah',
  last_name: 'Johnson',
  email: 'sarah@example.com',
  phone: '555-1234',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('useTenants', () => {
  beforeEach(() => {
    vi.mocked(tenantsApi.getAll).mockResolvedValue({ data: [mockTenant] } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches tenants on mount and exposes them', async () => {
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tenants).toEqual([mockTenant]);
    expect(result.current.error).toBe('');
  });

  it('sets error when the fetch fails', async () => {
    vi.mocked(tenantsApi.getAll).mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch tenants');
    expect(result.current.tenants).toEqual([]);
  });

  it('createTenant calls the api and refetches the list', async () => {
    vi.mocked(tenantsApi.create).mockResolvedValue({ data: mockTenant } as never);
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTenant({
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'm.chen@example.com',
        phone: '555-6789',
      });
    });

    expect(tenantsApi.create).toHaveBeenCalledOnce();
    expect(tenantsApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('sets error when createTenant fails', async () => {
    vi.mocked(tenantsApi.create).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createTenant({
        first_name: 'X',
        last_name: 'Y',
        email: 'x@y.com',
        phone: '0',
      });
    });

    expect(result.current.error).toBe('Failed to create tenant');
  });

  it('deleteTenant calls the api with the id and refetches the list', async () => {
    vi.mocked(tenantsApi.delete).mockResolvedValue({} as never);
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTenant('1');
    });

    expect(tenantsApi.delete).toHaveBeenCalledWith('1');
    expect(tenantsApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('sets error when deleteTenant fails', async () => {
    vi.mocked(tenantsApi.delete).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTenant('1');
    });

    expect(result.current.error).toBe('Failed to delete tenant');
  });

  it('clears a previous error when the next fetch succeeds', async () => {
    vi.mocked(tenantsApi.getAll).mockRejectedValueOnce(new Error('first fails'));

    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch tenants');

    vi.mocked(tenantsApi.create).mockResolvedValue({ data: mockTenant } as never);
    await act(async () => {
      await result.current.createTenant({
        first_name: 'X',
        last_name: 'Y',
        email: 'x@y.com',
        phone: '0',
      });
    });

    expect(result.current.error).toBe('');
  });
});
```

- [ ] **Step 2: Run the test — verify FAIL**

```bash
npx vitest run src/domains/tenants/hooks/useTenants.test.ts
```

Expected: FAIL with "Failed to resolve import './useTenants'".

- [ ] **Step 3: Implement the hook**

Create `web/src/domains/tenants/hooks/useTenants.ts`:
```ts
import { useEffect, useState } from 'react';
import { tenantsApi, type TTenant, type TTenantCreate } from '../api';

export const useTenants = () => {
  const [tenants, setTenants] = useState<TTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTenants = async () => {
    setError('');
    try {
      const { data } = await tenantsApi.getAll();
      setTenants(data);
    } catch {
      setError('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const createTenant = async (data: TTenantCreate) => {
    try {
      await tenantsApi.create(data);
      await fetchTenants();
    } catch {
      setError('Failed to create tenant');
    }
  };

  const deleteTenant = async (id: string) => {
    try {
      await tenantsApi.delete(id);
      await fetchTenants();
    } catch {
      setError('Failed to delete tenant');
    }
  };

  return { tenants, loading, error, createTenant, deleteTenant };
};
```

- [ ] **Step 4: Run the test — verify PASS**

```bash
npx vitest run src/domains/tenants/hooks/useTenants.test.ts
```

Expected: 7 passed.

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/tenants/hooks/useTenants.ts web/src/domains/tenants/hooks/useTenants.test.ts
git commit -m "feat(tenants): add useTenants hook"
```

No "Co-Authored-By" lines.

---

## Task 2: Tenant utilities + tests

**Goal:** Pure helpers consumed by `TenantCard` and `useTenantStats`.

**Files:**
- Create: `web/src/domains/tenants/utils/tenant.ts`
- Create: `web/src/domains/tenants/utils/tenant.test.ts`

**Note on `TLease` import:** We haven't built the leases domain yet (Sprint 2), but `TLease` is already exported from `web/src/domains/leases/api/types.ts`. That's a **type-only** import, which is allowed across domains because it doesn't bring runtime code. This is the single cross-domain import permitted in Sprint 1; when Sprint 2 builds the leases hook layer, no change is needed here.

- [ ] **Step 1: Write the failing test**

Create `web/src/domains/tenants/utils/tenant.test.ts`:
```ts
import { fullName, isActiveTenant, paymentRateLabel } from './tenant';
import type { TTenant } from '../api';
import type { TLease } from '@/domains/leases/api/types';

const tenant: TTenant = {
  id: 't1',
  first_name: 'Sarah',
  last_name: 'Johnson',
  email: 's@j.com',
  phone: '555',
  created_at: '',
  updated_at: '',
};

const buildLease = (overrides: Partial<TLease>): TLease => ({
  id: 'l1',
  property_id: 'p1',
  tenant_id: 't1',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1000,
  deposit: 1000,
  status: 'active',
  created_at: '',
  updated_at: '',
  ...overrides,
});

describe('fullName', () => {
  it('joins first and last name with a space', () => {
    expect(fullName(tenant)).toBe('Sarah Johnson');
  });

  it('trims extra whitespace if either name is missing', () => {
    expect(fullName({ ...tenant, last_name: '' })).toBe('Sarah');
    expect(fullName({ ...tenant, first_name: '' })).toBe('Johnson');
  });
});

describe('isActiveTenant', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns true when tenant has an active lease covering now', () => {
    const lease = buildLease({ tenant_id: 't1' });
    expect(isActiveTenant(tenant, [lease], now)).toBe(true);
  });

  it('returns false when lease ended before now', () => {
    const lease = buildLease({ tenant_id: 't1', end_date: '2026-03-01T00:00:00Z' });
    expect(isActiveTenant(tenant, [lease], now)).toBe(false);
  });

  it('returns false when lease belongs to a different tenant', () => {
    const lease = buildLease({ tenant_id: 'other' });
    expect(isActiveTenant(tenant, [lease], now)).toBe(false);
  });

  it('returns false when lease status is not active', () => {
    const lease = buildLease({ tenant_id: 't1', status: 'ended' });
    expect(isActiveTenant(tenant, [lease], now)).toBe(false);
  });

  it('returns false when no leases are supplied', () => {
    expect(isActiveTenant(tenant, [], now)).toBe(false);
  });
});

describe('paymentRateLabel', () => {
  it('labels ≥ 90% as positive', () => {
    expect(paymentRateLabel(100)).toEqual({ label: '100%', positive: true });
    expect(paymentRateLabel(90)).toEqual({ label: '90%', positive: true });
  });

  it('labels < 90% as negative', () => {
    expect(paymentRateLabel(89)).toEqual({ label: '89%', positive: false });
    expect(paymentRateLabel(0)).toEqual({ label: '0%', positive: false });
  });

  it('rounds non-integer rates in the label', () => {
    expect(paymentRateLabel(66.7)).toEqual({ label: '67%', positive: false });
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

```bash
npx vitest run src/domains/tenants/utils/tenant.test.ts
```

- [ ] **Step 3: Implement**

Create `web/src/domains/tenants/utils/tenant.ts`:
```ts
import type { TTenant } from '../api';
import type { TLease } from '@/domains/leases/api/types';

export const fullName = (t: TTenant): string => {
  return `${t.first_name} ${t.last_name}`.trim();
};

export const isActiveTenant = (
  tenant: TTenant,
  leases: TLease[],
  now: Date = new Date(),
): boolean => {
  const nowMs = now.getTime();
  return leases.some((lease) => {
    if (lease.tenant_id !== tenant.id) return false;
    if (lease.status !== 'active') return false;
    const start = new Date(lease.start_date).getTime();
    const end = new Date(lease.end_date).getTime();
    return start <= nowMs && nowMs <= end;
  });
};

type TPaymentRateLabel = {
  label: string;
  positive: boolean;
};

export const paymentRateLabel = (rate: number): TPaymentRateLabel => {
  const rounded = Math.round(rate);
  return {
    label: `${rounded}%`,
    positive: rounded >= 90,
  };
};
```

- [ ] **Step 4: Run — verify PASS**

```bash
npx vitest run src/domains/tenants/utils/tenant.test.ts
```

Expected: 11 passed.

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/tenants/utils/tenant.ts web/src/domains/tenants/utils/tenant.test.ts
git commit -m "feat(tenants): add tenant status and payment helpers"
```

---

## Task 3: `TenantCard` component

**Goal:** Presentational card matching the template — avatar (initials), name, status pill, contact rows, date range, rent, payment rate. Gracefully degrades when `lease`/`property` props are not supplied (Sprint 1 passes only `tenant`; Sprint 2's C2.9 will enrich with joined lease + property data).

**Files:**
- Create: `web/src/domains/tenants/components/TenantCard.tsx`

Per scope A (unit-test hooks + utilities only), components get no render tests.

- [ ] **Step 1: Create the component**

Create `web/src/domains/tenants/components/TenantCard.tsx`:
```tsx
import { Mail, Phone, Home, MoreVertical } from 'lucide-react';
import type { TTenant } from '../api';
import type { TLease } from '@/domains/leases/api/types';
import type { TProperty } from '@/domains/properties';
import { StatusBadge } from '@/shared/components';
import { formatCurrency, formatDate, initials } from '@/shared/utils';
import { fullName, isActiveTenant, paymentRateLabel } from '../utils/tenant';

type TTenantCardProps = {
  tenant: TTenant;
  lease?: TLease;
  property?: TProperty;
  leasesForStatus?: TLease[];
  paymentRate?: number;
  onActions?: () => void;
};

export const TenantCard = ({
  tenant,
  lease,
  property,
  leasesForStatus,
  paymentRate,
  onActions,
}: TTenantCardProps) => {
  const active = leasesForStatus
    ? isActiveTenant(tenant, leasesForStatus)
    : lease?.status === 'active';
  const statusLabel = active ? 'Active' : 'Overdue';
  const statusVariant = active ? 'green' : 'yellow';
  const payment = paymentRate !== undefined ? paymentRateLabel(paymentRate) : null;

  return (
    <div className="bg-white rounded-xl border border-stone-100 p-5 relative">
      {onActions && (
        <button
          onClick={onActions}
          aria-label="Tenant actions"
          className="absolute top-3 right-3 p-1.5 hover:bg-stone-100 rounded-full"
        >
          <MoreVertical size={16} />
        </button>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 font-medium">
          {initials(tenant.first_name, tenant.last_name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">{fullName(tenant)}</h3>
          <StatusBadge status={statusLabel} variant={statusVariant} />
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-stone-600">
        <div className="flex items-center gap-2 min-w-0">
          <Mail size={14} className="text-stone-400 shrink-0" aria-hidden />
          <span className="truncate">{tenant.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-stone-400 shrink-0" aria-hidden />
          <span>{tenant.phone}</span>
        </div>
        {property && (
          <div className="flex items-center gap-2 min-w-0">
            <Home size={14} className="text-stone-400 shrink-0" aria-hidden />
            <span className="truncate">{property.name ?? property.address}</span>
          </div>
        )}
      </div>

      {lease && (
        <p className="text-xs text-stone-500 mt-3">
          {formatDate(lease.start_date)} — {formatDate(lease.end_date)}
        </p>
      )}

      {(lease || payment) && (
        <div className="flex items-end justify-between mt-4 pt-3 border-t border-stone-100">
          {lease && (
            <div>
              <p className="text-xs text-stone-500">Monthly Rent</p>
              <p className="font-semibold text-stone-900">{formatCurrency(lease.rent_amount)}</p>
            </div>
          )}
          {payment && (
            <div className="text-right">
              <p className="text-xs text-stone-500">Payment Rate</p>
              <p
                className={`font-semibold ${
                  payment.positive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {payment.label}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

**Design notes for reviewers:**
- `leasesForStatus` is an optional prop: when supplied (Sprint 2 enrichment), the status is computed from the full lease list via `isActiveTenant`. When absent (Sprint 1 baseline), the status derives from the single passed `lease.status`. Defaults to "Overdue" when neither is available, matching the template's "no active lease" copy.
- `onActions` slot is a placeholder for a future kebab menu (delete, edit). Not wired in Sprint 1 — simply unused on the page. Keeps the prop stable for later.

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Run the full test suite to confirm nothing broke**

```bash
npm test
```

Expected: 60 passed (42 from Sprint 0 + 7 useTenants + 11 tenant utils — Task 3 adds no tests per scope A). If running tests shows a tenant lease import error, STOP — the Sprint 2 leases domain hasn't been touched; only type-only imports are valid here.

- [ ] **Step 4: Commit**

```bash
git add web/src/domains/tenants/components/TenantCard.tsx
git commit -m "feat(tenants): add TenantCard component"
```

---

## Task 4: `useCreateTenantForm` hook + tests

**Goal:** Form state + email validation + derived `isValid` + `reset`, mirroring `useCreatePropertyForm` plus email validation. Done before `CreateTenantForm` (next task) because the form imports this hook.

**Files:**
- Create: `web/src/domains/tenants/hooks/useCreateTenantForm.ts`
- Create: `web/src/domains/tenants/hooks/useCreateTenantForm.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/src/domains/tenants/hooks/useCreateTenantForm.test.ts`:
```ts
import { renderHook, act } from '@testing-library/react';
import { useCreateTenantForm } from './useCreateTenantForm';

describe('useCreateTenantForm', () => {
  it('starts with empty fields and isValid false', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    expect(result.current.formData).toEqual({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    });
    expect(result.current.isValid).toBe(false);
  });

  it('updateField sets a single key without mutating others', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => result.current.updateField('first_name', 'Sarah'));
    expect(result.current.formData.first_name).toBe('Sarah');
    expect(result.current.formData.last_name).toBe('');
  });

  it('isValid is true only when all fields are non-empty and email is valid', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => {
      result.current.updateField('first_name', 'Sarah');
      result.current.updateField('last_name', 'Johnson');
      result.current.updateField('phone', '555-1234');
    });
    expect(result.current.isValid).toBe(false);

    act(() => result.current.updateField('email', 'sarah@example.com'));
    expect(result.current.isValid).toBe(true);
  });

  it('isValid is false when email fails the regex', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => {
      result.current.updateField('first_name', 'Sarah');
      result.current.updateField('last_name', 'Johnson');
      result.current.updateField('phone', '555-1234');
      result.current.updateField('email', 'not-an-email');
    });
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.email).toBeDefined();
  });

  it('errors.email is absent when email is empty', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    expect(result.current.errors.email).toBeUndefined();
  });

  it('errors.email is absent when email is valid', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => result.current.updateField('email', 'ok@example.com'));
    expect(result.current.errors.email).toBeUndefined();
  });

  it('reset returns form to initial empty state', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => {
      result.current.updateField('first_name', 'Sarah');
      result.current.updateField('email', 'sarah@example.com');
    });
    act(() => result.current.reset());
    expect(result.current.formData).toEqual({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    });
    expect(result.current.errors.email).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

```bash
npx vitest run src/domains/tenants/hooks/useCreateTenantForm.test.ts
```

- [ ] **Step 3: Implement the hook**

Create `web/src/domains/tenants/hooks/useCreateTenantForm.ts`:
```ts
import { useState } from 'react';
import type { TTenantCreate } from '../api';

const INITIAL: TTenantCreate = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
};

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

type TFormErrors = {
  email?: string;
};

export const useCreateTenantForm = () => {
  const [formData, setFormData] = useState<TTenantCreate>(INITIAL);

  const updateField = <K extends keyof TTenantCreate>(key: K, value: TTenantCreate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setFormData(INITIAL);

  const errors: TFormErrors = {};
  if (formData.email !== '' && !EMAIL_REGEX.test(formData.email)) {
    errors.email = 'Enter a valid email address';
  }

  const isValid =
    formData.first_name.trim() !== '' &&
    formData.last_name.trim() !== '' &&
    formData.phone.trim() !== '' &&
    EMAIL_REGEX.test(formData.email);

  return { formData, updateField, reset, isValid, errors };
};
```

- [ ] **Step 4: Run — verify 7 passed**

```bash
npx vitest run src/domains/tenants/hooks/useCreateTenantForm.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/tenants/hooks/useCreateTenantForm.ts web/src/domains/tenants/hooks/useCreateTenantForm.test.ts
git commit -m "feat(tenants): add useCreateTenantForm hook"
```

---

## Task 5: `CreateTenantForm` component

**Goal:** Modal form with first/last name, email (validated via hook from Task 4), phone. All fields required.

**Files:**
- Create: `web/src/domains/tenants/components/CreateTenantForm.tsx`

- [ ] **Step 1: Create the form component**

Create `web/src/domains/tenants/components/CreateTenantForm.tsx`:
```tsx
import { Mail, Phone, User } from 'lucide-react';
import { FormField } from '@/shared/components';
import type { TTenantCreate } from '../api';
import { useCreateTenantForm } from '../hooks/useCreateTenantForm';

type TCreateTenantFormProps = {
  onSubmit: (data: TTenantCreate) => Promise<void>;
  onCancel: () => void;
};

export const CreateTenantForm = ({ onSubmit, onCancel }: TCreateTenantFormProps) => {
  const { formData, updateField, reset, isValid, errors } = useCreateTenantForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit(formData);
    reset();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="First Name"
          icon={<User size={14} />}
          required
          placeholder="e.g., Sarah"
          value={formData.first_name}
          onChange={(v) => updateField('first_name', v)}
        />
        <FormField
          label="Last Name"
          required
          placeholder="e.g., Johnson"
          value={formData.last_name}
          onChange={(v) => updateField('last_name', v)}
        />
      </div>

      <div>
        <FormField
          label="Email"
          icon={<Mail size={14} />}
          required
          placeholder="sarah@example.com"
          value={formData.email}
          onChange={(v) => updateField('email', v)}
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      <FormField
        label="Phone"
        icon={<Phone size={14} />}
        required
        placeholder="(555) 123-4567"
        value={formData.phone}
        onChange={(v) => updateField('phone', v)}
      />

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="border border-stone-200 rounded-lg py-3 text-stone-700 hover:bg-stone-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="bg-stone-900 text-white rounded-lg py-3 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Tenant
        </button>
      </div>
    </form>
  );
};
```

- [ ] **Step 2: Verify compilation + tests**

```bash
npx tsc --noEmit && npm test
```

- [ ] **Step 3: Commit**

```bash
git add web/src/domains/tenants/components/CreateTenantForm.tsx
git commit -m "feat(tenants): add CreateTenantForm component"
```

---

## Task 6: `useTenantStats` hook + tests

**Goal:** Derive the four stat-card values shown on the page — Active Tenants, Monthly Revenue, On-Time Payments, Overdue Payments — from tenants + (optional) leases.

**Files:**
- Create: `web/src/domains/tenants/hooks/useTenantStats.ts`
- Create: `web/src/domains/tenants/hooks/useTenantStats.test.ts`

**Placeholder semantics (per spec):**
- **On-Time Payments:** no payments data in BE — returns the active count (assumes on-time). Kept in signature for template parity.
- **Overdue Payments:** placeholder `0` in Sprint 1. Hook signature stable for future wiring.

- [ ] **Step 1: Write the failing test**

Create `web/src/domains/tenants/hooks/useTenantStats.test.ts`:
```ts
import { renderHook } from '@testing-library/react';
import { useTenantStats } from './useTenantStats';
import type { TTenant } from '../api';
import type { TLease } from '@/domains/leases/api/types';

const mkTenant = (id: string): TTenant => ({
  id,
  first_name: `F${id}`,
  last_name: `L${id}`,
  email: `${id}@e.com`,
  phone: '0',
  created_at: '',
  updated_at: '',
});

const mkLease = (id: string, tenant_id: string, rent: number, status = 'active'): TLease => ({
  id,
  property_id: 'p',
  tenant_id,
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: rent,
  deposit: 0,
  status,
  created_at: '',
  updated_at: '',
});

describe('useTenantStats', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns zero stats when there are no tenants and no leases', () => {
    const { result } = renderHook(() => useTenantStats([], [], now));
    expect(result.current).toEqual({
      activeTenants: 0,
      monthlyRevenue: 0,
      onTimePayments: 0,
      overduePayments: 0,
    });
  });

  it('sums monthly revenue across active leases', () => {
    const tenants = [mkTenant('t1'), mkTenant('t2')];
    const leases = [mkLease('l1', 't1', 1850), mkLease('l2', 't2', 2800)];
    const { result } = renderHook(() => useTenantStats(tenants, leases, now));
    expect(result.current.monthlyRevenue).toBe(4650);
    expect(result.current.activeTenants).toBe(2);
  });

  it('excludes leases that have ended from revenue and active count', () => {
    const tenants = [mkTenant('t1'), mkTenant('t2')];
    const leases = [
      mkLease('l1', 't1', 1850),
      mkLease('l2', 't2', 2800, 'ended'),
    ];
    const { result } = renderHook(() => useTenantStats(tenants, leases, now));
    expect(result.current.monthlyRevenue).toBe(1850);
    expect(result.current.activeTenants).toBe(1);
  });

  it('defaults leases to empty array so no-arg callers still work', () => {
    const tenants = [mkTenant('t1')];
    const { result } = renderHook(() => useTenantStats(tenants));
    expect(result.current.activeTenants).toBe(0);
    expect(result.current.monthlyRevenue).toBe(0);
  });

  it('onTimePayments equals activeTenants as Sprint 1 placeholder', () => {
    const tenants = [mkTenant('t1'), mkTenant('t2')];
    const leases = [mkLease('l1', 't1', 1000), mkLease('l2', 't2', 1000)];
    const { result } = renderHook(() => useTenantStats(tenants, leases, now));
    expect(result.current.onTimePayments).toBe(result.current.activeTenants);
  });

  it('overduePayments is 0 as Sprint 1 placeholder', () => {
    const tenants = [mkTenant('t1')];
    const leases = [mkLease('l1', 't1', 1000)];
    const { result } = renderHook(() => useTenantStats(tenants, leases, now));
    expect(result.current.overduePayments).toBe(0);
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

```bash
npx vitest run src/domains/tenants/hooks/useTenantStats.test.ts
```

- [ ] **Step 3: Implement**

Create `web/src/domains/tenants/hooks/useTenantStats.ts`:
```ts
import { useMemo } from 'react';
import type { TTenant } from '../api';
import type { TLease } from '@/domains/leases/api/types';
import { isActiveTenant } from '../utils/tenant';

type TTenantStats = {
  activeTenants: number;
  monthlyRevenue: number;
  onTimePayments: number;
  overduePayments: number;
};

export const useTenantStats = (
  tenants: TTenant[],
  leases: TLease[] = [],
  now: Date = new Date(),
): TTenantStats => {
  return useMemo(() => {
    const activeTenants = tenants.filter((t) => isActiveTenant(t, leases, now)).length;

    const nowMs = now.getTime();
    const monthlyRevenue = leases.reduce((sum, lease) => {
      if (lease.status !== 'active') return sum;
      const start = new Date(lease.start_date).getTime();
      const end = new Date(lease.end_date).getTime();
      if (start > nowMs || nowMs > end) return sum;
      return sum + lease.rent_amount;
    }, 0);

    return {
      activeTenants,
      monthlyRevenue,
      onTimePayments: activeTenants,
      overduePayments: 0,
    };
  }, [tenants, leases, now]);
};
```

- [ ] **Step 4: Run — verify 6 passed**

```bash
npx vitest run src/domains/tenants/hooks/useTenantStats.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/tenants/hooks/useTenantStats.ts web/src/domains/tenants/hooks/useTenantStats.test.ts
git commit -m "feat(tenants): add useTenantStats hook"
```

---

## Task 7: Wire `TenantsPage` + `TenantStatCards` + barrel

**Goal:** Replace the stub page with a working list — page header, four stat tiles, tenant grid, create modal — and expose everything via the tenants barrel.

**Files:**
- Create: `web/src/domains/tenants/components/TenantStatCards.tsx`
- Modify: `web/src/domains/tenants/index.ts` (barrel)
- Modify: `web/src/pages/TenantsPage.tsx`

- [ ] **Step 1: Create `TenantStatCards` — four stat tiles for the page top**

Create `web/src/domains/tenants/components/TenantStatCards.tsx`:
```tsx
import { Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/utils';

type TTenantStatCardsProps = {
  activeTenants: number;
  monthlyRevenue: number;
  onTimePayments: number;
  overduePayments: number;
};

export const TenantStatCards = ({
  activeTenants,
  monthlyRevenue,
  onTimePayments,
  overduePayments,
}: TTenantStatCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Active Tenants"
        value={activeTenants}
        icon={<Users size={20} aria-hidden />}
      />
      <StatCard
        label="Monthly Revenue"
        value={formatCurrency(monthlyRevenue)}
        icon={<DollarSign size={20} aria-hidden />}
      />
      <StatCard
        label="On-Time Payments"
        value={onTimePayments}
        icon={<CheckCircle size={20} aria-hidden />}
      />
      <StatCard
        label="Overdue Payments"
        value={overduePayments}
        icon={<AlertCircle size={20} aria-hidden />}
      />
    </div>
  );
};
```

- [ ] **Step 2: Replace `web/src/domains/tenants/index.ts` (barrel)**

Replace entire file with:
```ts
export * from './api';
export { useTenants } from './hooks/useTenants';
export { useCreateTenantForm } from './hooks/useCreateTenantForm';
export { useTenantStats } from './hooks/useTenantStats';
export { TenantCard } from './components/TenantCard';
export { CreateTenantForm } from './components/CreateTenantForm';
export { TenantStatCards } from './components/TenantStatCards';
```

- [ ] **Step 3: Replace `web/src/pages/TenantsPage.tsx` — wire everything together**

Replace entire file with:
```tsx
import { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import {
  useTenants,
  useTenantStats,
  TenantCard,
  CreateTenantForm,
  TenantStatCards,
} from '../domains/tenants';
import {
  Modal,
  PageHeader,
  Loading,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';

export const TenantsPage = () => {
  const { tenants, loading, error, createTenant } = useTenants();
  const stats = useTenantStats(tenants);
  const [showForm, setShowForm] = useState(false);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Tenants"
        subtitle="Manage tenant information and payment history"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-800 flex items-center gap-2"
          >
            <Plus size={18} aria-hidden />
            Add Tenant
          </button>
        }
      />

      {error && <ErrorBanner message={error} />}

      <TenantStatCards {...stats} />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Tenant"
        icon={<UserPlus className="w-6 h-6 text-stone-700" aria-hidden />}
      >
        <CreateTenantForm onSubmit={createTenant} onCancel={() => setShowForm(false)} />
      </Modal>

      {tenants.length === 0 ? (
        <EmptyState
          title="No tenants yet"
          description="Add your first tenant to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantsPage;
```

- [ ] **Step 4: Run the full quality gate**

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

All four must exit 0. Expected test count: 42 (Sprint 0) + 7 (useTenants) + 11 (tenant utils) + 7 (useCreateTenantForm) + 6 (useTenantStats) = **73 passed** across **13 test files**.

- [ ] **Step 5: Manual browser check**

Start the dev server and the backend:
```bash
# Terminal 1
cd /Users/romanfrolov/dev/rntly && make dev

# Terminal 2
cd /Users/romanfrolov/dev/rntly/web && npm run dev -- --port 3333 --strictPort
```

Visit `http://localhost:3333/tenants`. Verify:
- PageHeader shows "Tenants" + "Manage tenant information and payment history" + "+ Add Tenant" button
- Four stat cards at top (all zeros if DB is empty, or derived values from any existing tenants)
- Clicking "+ Add Tenant" opens the modal with four fields
- Submitting a valid tenant closes the modal and the card appears in the grid
- Grid shows avatar (initials), full name, "Overdue" status (until Sprint 2 joins leases), email, phone
- Empty DB shows `EmptyState` ("No tenants yet")
- With the backend stopped, reload the page — `ErrorBanner` shows "Failed to fetch tenants"

Stop both servers when done (Ctrl+C in each).

- [ ] **Step 6: Commit**

```bash
git add web/src/domains/tenants/components/TenantStatCards.tsx web/src/domains/tenants/index.ts web/src/pages/TenantsPage.tsx
git commit -m "feat(tenants): wire TenantsPage with list, stats, and create modal"
```

---

## Sprint 1 exit checklist

After Task 7, confirm:

- [ ] `npm run lint` → exit 0
- [ ] `npx tsc --noEmit` → exit 0
- [ ] `npm test` → **73 passed** across 13 test files
- [ ] `npm run build` → exit 0, per-route chunks present
- [ ] `git log --oneline main..HEAD` → exactly 7 commits, all prefixed `feat(tenants):`
- [ ] Manual browser verification on `/tenants` (Task 7 Step 5) confirmed

After merge to main, the next plan lives at `docs/superpowers/plans/<date>-sprint-2-leases.md`. Sprint 2's C2.9 will revisit `TenantsPage` to pass `useLeases` + `useProperties` data into each `TenantCard`, filling in the property/dates/rent/payment-rate rows.

---

## Execution order

Execute tasks 1 → 7 in the listed order. Each task has no dependency on a later task, by design:

1. `useTenants` hook (no deps)
2. `tenant` utilities (depends only on type imports)
3. `TenantCard` component (uses utils from Task 2)
4. `useCreateTenantForm` hook (no deps)
5. `CreateTenantForm` component (uses hook from Task 4)
6. `useTenantStats` hook (uses utils from Task 2)
7. Wire `TenantsPage` + `TenantStatCards` + barrel (uses everything above)

Commit order matches task order. This produces a clean linear git history where each commit compiles and tests pass.
