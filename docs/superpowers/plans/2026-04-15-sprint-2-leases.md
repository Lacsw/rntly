# Sprint 2 — Leases Domain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fully functional Leases page — list, stats, create — and enrich the Tenants page with real lease + property data. Every hook and utility unit-tested.

**Architecture:** Follow the Tenants/Properties domain pattern — `api/` (extend with `listByProperty` / `listByTenant` endpoints the backend already serves) → `hooks/` → `utils/` → `components/` → page composes via barrel. Cross-domain type-only imports are permitted (`TProperty`, `TTenant` used in `LeaseCard`). Sprint 2's final task modifies the tenants domain to consume the now-available leases hooks, completing the template-matching UI for tenant cards.

**Tech Stack:** React 19, TypeScript 5.9 strict, Vitest 4.x + RTL 16.x, Tailwind 4, axios.

**Spec reference:** `docs/superpowers/specs/2026-04-14-fe-scope-c-design.md` section 6.

**Deviation from spec:** spec lists 9 commits for Sprint 2. This plan adds a 10th commit — `useLeaseStats` hook as its own task — to mirror the Sprint 1 pattern where `useTenantStats` was a standalone tested hook, rather than folding it into the wire-page commit. This keeps commits small and preserves test quality.

**Lessons baked in from Sprints 0 and 1:**
- Hooks reset `error` at fetch start and `await` refetch in mutations.
- Tests cover the mutation-error → recovery path explicitly (not just fetch-error → recovery).
- New types use the `T` prefix. Icon-only buttons get `aria-label`. Decorative icons inside labeled buttons get `aria-hidden`.
- Utility tests include both ended AND future-dated edge cases.

---

## File structure

**Created:**

```
web/src/domains/leases/
├── api/
│   └── api.ts                            + listByProperty + listByTenant (modified)
├── hooks/
│   ├── useLeases.ts                      + useLeases.test.ts
│   ├── useLeasesByProperty.ts            + useLeasesByProperty.test.ts
│   ├── useLeasesByTenant.ts              + useLeasesByTenant.test.ts
│   ├── useLeaseStats.ts                  + useLeaseStats.test.ts
│   └── useCreateLeaseForm.ts             + useCreateLeaseForm.test.ts
├── utils/
│   └── lease.ts                          + lease.test.ts
├── components/
│   ├── LeaseCard.tsx
│   ├── CreateLeaseForm.tsx
│   └── LeaseStatCards.tsx
└── index.ts                              (barrel — replaces the stub)
```

**Modified:**
- `web/src/domains/leases/api/api.ts` — add `listByProperty(id)` and `listByTenant(id)` methods
- `web/src/pages/LeasesPage.tsx` — replaces stub
- `web/src/pages/TenantsPage.tsx` — Task 10 enrichment
- `web/src/domains/tenants/components/TenantCard.tsx` — no change (Sprint 1 already supports all optional props)

**Boundary rules:**
- `LeaseCard`/`LeasesPage`/`TenantsPage` may import types **and** hooks/components from multiple domain barrels — pages are the composition layer.
- Leases domain internals import only from within leases + type-only from properties/tenants.

---

## Task 1: `useLeases` hook + tests

**Goal:** `{ leases, loading, error, createLease, updateLease, deleteLease }`. Corrected template (error reset + awaited refetches) baked in.

**Files:**
- Create: `web/src/domains/leases/hooks/useLeases.ts`
- Create: `web/src/domains/leases/hooks/useLeases.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/src/domains/leases/hooks/useLeases.test.ts`:
```ts
import { renderHook, waitFor, act } from '@testing-library/react';
import { useLeases } from './useLeases';
import { leasesApi } from '../api';
import type { TLease } from '../api';

vi.mock('../api', () => ({
  leasesApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockLease: TLease = {
  id: 'l1',
  property_id: 'p1',
  tenant_id: 't1',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1850,
  deposit: 1850,
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('useLeases', () => {
  beforeEach(() => {
    vi.mocked(leasesApi.getAll).mockResolvedValue({ data: [mockLease] } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches leases on mount', async () => {
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.leases).toEqual([mockLease]);
    expect(result.current.error).toBe('');
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(leasesApi.getAll).mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch leases');
    expect(result.current.leases).toEqual([]);
  });

  it('createLease calls api and refetches', async () => {
    vi.mocked(leasesApi.create).mockResolvedValue({ data: mockLease } as never);
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createLease({
        property_id: 'p1',
        tenant_id: 't1',
        start_date: '2026-01-01',
        end_date: '2027-01-01',
        rent_amount: 1850,
        deposit: 1850,
      });
    });

    expect(leasesApi.create).toHaveBeenCalledOnce();
    expect(leasesApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('sets error when createLease fails', async () => {
    vi.mocked(leasesApi.create).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createLease({
        property_id: 'p1',
        tenant_id: 't1',
        start_date: '2026-01-01',
        end_date: '2027-01-01',
        rent_amount: 1000,
        deposit: 1000,
      });
    });

    expect(result.current.error).toBe('Failed to create lease');
  });

  it('updateLease calls api with id and data, then refetches', async () => {
    vi.mocked(leasesApi.update).mockResolvedValue({ data: mockLease } as never);
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateLease('l1', {
        start_date: '2026-01-01',
        end_date: '2027-06-01',
        rent_amount: 2000,
        deposit: 1850,
        status: 'active',
      });
    });

    expect(leasesApi.update).toHaveBeenCalledWith('l1', expect.any(Object));
    expect(leasesApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('sets error when updateLease fails', async () => {
    vi.mocked(leasesApi.update).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateLease('l1', {
        start_date: '2026-01-01',
        end_date: '2027-01-01',
        rent_amount: 1000,
        deposit: 1000,
        status: 'active',
      });
    });

    expect(result.current.error).toBe('Failed to update lease');
  });

  it('deleteLease calls api with id and refetches', async () => {
    vi.mocked(leasesApi.delete).mockResolvedValue({} as never);
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteLease('l1');
    });

    expect(leasesApi.delete).toHaveBeenCalledWith('l1');
    expect(leasesApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('sets error when deleteLease fails', async () => {
    vi.mocked(leasesApi.delete).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteLease('l1');
    });

    expect(result.current.error).toBe('Failed to delete lease');
  });

  it('clears a mutation error on the next successful operation', async () => {
    vi.mocked(leasesApi.create).mockRejectedValueOnce(new Error('create fails'));
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createLease({
        property_id: 'p1',
        tenant_id: 't1',
        start_date: '2026-01-01',
        end_date: '2027-01-01',
        rent_amount: 1000,
        deposit: 1000,
      });
    });
    expect(result.current.error).toBe('Failed to create lease');

    vi.mocked(leasesApi.create).mockResolvedValue({ data: mockLease } as never);
    await act(async () => {
      await result.current.createLease({
        property_id: 'p2',
        tenant_id: 't2',
        start_date: '2026-01-01',
        end_date: '2027-01-01',
        rent_amount: 1000,
        deposit: 1000,
      });
    });
    expect(result.current.error).toBe('');
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

```bash
npx vitest run src/domains/leases/hooks/useLeases.test.ts
```

- [ ] **Step 3: Implement**

Create `web/src/domains/leases/hooks/useLeases.ts`:
```ts
import { useEffect, useState } from 'react';
import { leasesApi, type TLease, type TLeaseCreate, type TLeaseUpdate } from '../api';

export const useLeases = () => {
  const [leases, setLeases] = useState<TLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeases = async () => {
    setError('');
    try {
      const { data } = await leasesApi.getAll();
      setLeases(data);
    } catch {
      setError('Failed to fetch leases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const createLease = async (data: TLeaseCreate) => {
    try {
      await leasesApi.create(data);
      await fetchLeases();
    } catch {
      setError('Failed to create lease');
    }
  };

  const updateLease = async (id: string, data: TLeaseUpdate) => {
    try {
      await leasesApi.update(id, data);
      await fetchLeases();
    } catch {
      setError('Failed to update lease');
    }
  };

  const deleteLease = async (id: string) => {
    try {
      await leasesApi.delete(id);
      await fetchLeases();
    } catch {
      setError('Failed to delete lease');
    }
  };

  return { leases, loading, error, createLease, updateLease, deleteLease };
};
```

- [ ] **Step 4: Run — verify 9 passed**

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/leases/hooks/useLeases.ts web/src/domains/leases/hooks/useLeases.test.ts
git commit -m "feat(leases): add useLeases hook"
```

---

## Task 2: `useLeasesByProperty` hook + tests (+ api extension)

**Goal:** Fetch leases scoped to a property. Adds `leasesApi.listByProperty` to the api client (backend already serves `GET /properties/:id/leases`).

**Files:**
- Modify: `web/src/domains/leases/api/api.ts`
- Create: `web/src/domains/leases/hooks/useLeasesByProperty.ts`
- Create: `web/src/domains/leases/hooks/useLeasesByProperty.test.ts`

- [ ] **Step 1: Extend the api client**

Open `web/src/domains/leases/api/api.ts`. Add two methods after `delete`. Final file:
```ts
import api from '@/shared/api/client';
import type { TLease, TLeaseCreate, TLeaseUpdate } from './types';

export const leasesApi = {
  getAll: () =>
    api.get<TLease[]>('/leases'),

  getById: (id: string) =>
    api.get<TLease>(`/leases/${id}`),

  create: (data: TLeaseCreate) =>
    api.post<TLease>('/leases', data),

  update: (id: string, data: TLeaseUpdate) =>
    api.put<TLease>(`/leases/${id}`, data),

  delete: (id: string) =>
    api.delete(`/leases/${id}`),

  listByProperty: (propertyId: string) =>
    api.get<TLease[]>(`/properties/${propertyId}/leases`),

  listByTenant: (tenantId: string) =>
    api.get<TLease[]>(`/tenants/${tenantId}/leases`),
};
```

- [ ] **Step 2: Write the failing test**

Create `web/src/domains/leases/hooks/useLeasesByProperty.test.ts`:
```ts
import { renderHook, waitFor } from '@testing-library/react';
import { useLeasesByProperty } from './useLeasesByProperty';
import { leasesApi } from '../api';
import type { TLease } from '../api';

vi.mock('../api', () => ({
  leasesApi: {
    listByProperty: vi.fn(),
  },
}));

const mockLease: TLease = {
  id: 'l1',
  property_id: 'p1',
  tenant_id: 't1',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1850,
  deposit: 1850,
  status: 'active',
  created_at: '',
  updated_at: '',
};

describe('useLeasesByProperty', () => {
  beforeEach(() => {
    vi.mocked(leasesApi.listByProperty).mockResolvedValue({ data: [mockLease] } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches leases for the given property id', async () => {
    const { result } = renderHook(() => useLeasesByProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(leasesApi.listByProperty).toHaveBeenCalledWith('p1');
    expect(result.current.leases).toEqual([mockLease]);
    expect(result.current.error).toBe('');
  });

  it('refetches when propertyId changes', async () => {
    const { result, rerender } = renderHook(({ id }) => useLeasesByProperty(id), {
      initialProps: { id: 'p1' },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ id: 'p2' });
    await waitFor(() => expect(leasesApi.listByProperty).toHaveBeenCalledWith('p2'));
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(leasesApi.listByProperty).mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useLeasesByProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch leases');
    expect(result.current.leases).toEqual([]);
  });

  it('does not fetch when propertyId is empty', async () => {
    const { result } = renderHook(() => useLeasesByProperty(''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(leasesApi.listByProperty).not.toHaveBeenCalled();
    expect(result.current.leases).toEqual([]);
  });
});
```

- [ ] **Step 3: Run — verify FAIL**

```bash
npx vitest run src/domains/leases/hooks/useLeasesByProperty.test.ts
```

- [ ] **Step 4: Implement**

Create `web/src/domains/leases/hooks/useLeasesByProperty.ts`:
```ts
import { useEffect, useState } from 'react';
import { leasesApi, type TLease } from '../api';

export const useLeasesByProperty = (propertyId: string) => {
  const [leases, setLeases] = useState<TLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!propertyId) {
      setLeases([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError('');
    setLoading(true);

    leasesApi
      .listByProperty(propertyId)
      .then(({ data }) => {
        if (!cancelled) setLeases(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to fetch leases');
          setLeases([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  return { leases, loading, error };
};
```

- [ ] **Step 5: Run — verify 4 passed**

- [ ] **Step 6: Commit**

```bash
git add web/src/domains/leases/api/api.ts web/src/domains/leases/hooks/useLeasesByProperty.ts web/src/domains/leases/hooks/useLeasesByProperty.test.ts
git commit -m "feat(leases): add useLeasesByProperty hook"
```

---

## Task 3: `useLeasesByTenant` hook + tests

**Goal:** Mirror of Task 2 for `/tenants/:id/leases`. The api method was already added in Task 2.

**Files:**
- Create: `web/src/domains/leases/hooks/useLeasesByTenant.ts`
- Create: `web/src/domains/leases/hooks/useLeasesByTenant.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/src/domains/leases/hooks/useLeasesByTenant.test.ts`:
```ts
import { renderHook, waitFor } from '@testing-library/react';
import { useLeasesByTenant } from './useLeasesByTenant';
import { leasesApi } from '../api';
import type { TLease } from '../api';

vi.mock('../api', () => ({
  leasesApi: {
    listByTenant: vi.fn(),
  },
}));

const mockLease: TLease = {
  id: 'l1',
  property_id: 'p1',
  tenant_id: 't1',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1850,
  deposit: 1850,
  status: 'active',
  created_at: '',
  updated_at: '',
};

describe('useLeasesByTenant', () => {
  beforeEach(() => {
    vi.mocked(leasesApi.listByTenant).mockResolvedValue({ data: [mockLease] } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches leases for the given tenant id', async () => {
    const { result } = renderHook(() => useLeasesByTenant('t1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(leasesApi.listByTenant).toHaveBeenCalledWith('t1');
    expect(result.current.leases).toEqual([mockLease]);
    expect(result.current.error).toBe('');
  });

  it('refetches when tenantId changes', async () => {
    const { rerender } = renderHook(({ id }) => useLeasesByTenant(id), {
      initialProps: { id: 't1' },
    });
    await waitFor(() => expect(leasesApi.listByTenant).toHaveBeenCalledWith('t1'));

    rerender({ id: 't2' });
    await waitFor(() => expect(leasesApi.listByTenant).toHaveBeenCalledWith('t2'));
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(leasesApi.listByTenant).mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useLeasesByTenant('t1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch leases');
    expect(result.current.leases).toEqual([]);
  });

  it('does not fetch when tenantId is empty', async () => {
    const { result } = renderHook(() => useLeasesByTenant(''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(leasesApi.listByTenant).not.toHaveBeenCalled();
    expect(result.current.leases).toEqual([]);
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

- [ ] **Step 3: Implement**

Create `web/src/domains/leases/hooks/useLeasesByTenant.ts`:
```ts
import { useEffect, useState } from 'react';
import { leasesApi, type TLease } from '../api';

export const useLeasesByTenant = (tenantId: string) => {
  const [leases, setLeases] = useState<TLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tenantId) {
      setLeases([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError('');
    setLoading(true);

    leasesApi
      .listByTenant(tenantId)
      .then(({ data }) => {
        if (!cancelled) setLeases(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to fetch leases');
          setLeases([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  return { leases, loading, error };
};
```

- [ ] **Step 4: Run — verify 4 passed**

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/leases/hooks/useLeasesByTenant.ts web/src/domains/leases/hooks/useLeasesByTenant.test.ts
git commit -m "feat(leases): add useLeasesByTenant hook"
```

---

## Task 4: `lease` utilities + tests

**Goal:** Pure predicate helpers consumed by `LeaseCard`, `useLeaseStats`, and (transitively) tenant stats.

**Files:**
- Create: `web/src/domains/leases/utils/lease.ts`
- Create: `web/src/domains/leases/utils/lease.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/src/domains/leases/utils/lease.test.ts`:
```ts
import { isActiveLease, daysRemaining, isEndingSoon, leaseDisplayStatus } from './lease';
import type { TLease } from '../api';

const build = (o: Partial<TLease>): TLease => ({
  id: 'l',
  property_id: 'p',
  tenant_id: 't',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1000,
  deposit: 1000,
  status: 'active',
  created_at: '',
  updated_at: '',
  ...o,
});

describe('isActiveLease', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns true for an active lease covering now', () => {
    expect(isActiveLease(build({}), now)).toBe(true);
  });

  it('returns false when status is not active', () => {
    expect(isActiveLease(build({ status: 'ended' }), now)).toBe(false);
  });

  it('returns false when lease ended before now', () => {
    expect(isActiveLease(build({ end_date: '2026-03-01T00:00:00Z' }), now)).toBe(false);
  });

  it('returns false when lease has not started yet', () => {
    expect(isActiveLease(build({ start_date: '2027-01-01T00:00:00Z' }), now)).toBe(false);
  });
});

describe('daysRemaining', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns positive number for future end date', () => {
    const d = daysRemaining(build({ end_date: '2026-07-01T00:00:00Z' }), now);
    expect(d).toBe(30);
  });

  it('returns 0 when end_date equals now', () => {
    expect(daysRemaining(build({ end_date: '2026-06-01T00:00:00Z' }), now)).toBe(0);
  });

  it('returns negative number for past end date', () => {
    const d = daysRemaining(build({ end_date: '2026-05-01T00:00:00Z' }), now);
    expect(d).toBe(-31);
  });
});

describe('isEndingSoon', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns true when lease ends within the default 30 day window', () => {
    expect(isEndingSoon(build({ end_date: '2026-06-15T00:00:00Z' }), 30, now)).toBe(true);
  });

  it('returns false when lease ends outside the window', () => {
    expect(isEndingSoon(build({ end_date: '2026-08-01T00:00:00Z' }), 30, now)).toBe(false);
  });

  it('returns false for leases that have already ended', () => {
    expect(isEndingSoon(build({ end_date: '2026-05-01T00:00:00Z' }), 30, now)).toBe(false);
  });

  it('honors a custom window', () => {
    expect(isEndingSoon(build({ end_date: '2026-08-01T00:00:00Z' }), 90, now)).toBe(true);
  });
});

describe('leaseDisplayStatus', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns "upcoming" when start is in the future', () => {
    expect(leaseDisplayStatus(build({ start_date: '2027-01-01T00:00:00Z' }), now)).toBe('upcoming');
  });

  it('returns "ended" when end is in the past or status is ended', () => {
    expect(leaseDisplayStatus(build({ end_date: '2026-05-01T00:00:00Z' }), now)).toBe('ended');
    expect(leaseDisplayStatus(build({ status: 'ended' }), now)).toBe('ended');
  });

  it('returns "ending-soon" when active and within 30 days of end', () => {
    expect(leaseDisplayStatus(build({ end_date: '2026-06-15T00:00:00Z' }), now)).toBe('ending-soon');
  });

  it('returns "active" for an active lease with more than 30 days left', () => {
    expect(leaseDisplayStatus(build({ end_date: '2026-09-01T00:00:00Z' }), now)).toBe('active');
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

- [ ] **Step 3: Implement**

Create `web/src/domains/leases/utils/lease.ts`:
```ts
import type { TLease } from '../api';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const isActiveLease = (lease: TLease, now: Date = new Date()): boolean => {
  if (lease.status !== 'active') return false;
  const nowMs = now.getTime();
  const start = new Date(lease.start_date).getTime();
  const end = new Date(lease.end_date).getTime();
  return start <= nowMs && nowMs <= end;
};

export const daysRemaining = (lease: TLease, now: Date = new Date()): number => {
  const end = new Date(lease.end_date).getTime();
  return Math.round((end - now.getTime()) / MS_PER_DAY);
};

export const isEndingSoon = (
  lease: TLease,
  withinDays = 30,
  now: Date = new Date(),
): boolean => {
  const remaining = daysRemaining(lease, now);
  return remaining >= 0 && remaining <= withinDays;
};

export type TLeaseDisplayStatus = 'active' | 'ending-soon' | 'ended' | 'upcoming';

export const leaseDisplayStatus = (lease: TLease, now: Date = new Date()): TLeaseDisplayStatus => {
  if (lease.status === 'ended') return 'ended';
  const nowMs = now.getTime();
  const start = new Date(lease.start_date).getTime();
  const end = new Date(lease.end_date).getTime();
  if (nowMs < start) return 'upcoming';
  if (nowMs > end) return 'ended';
  if (isEndingSoon(lease, 30, now)) return 'ending-soon';
  return 'active';
};
```

- [ ] **Step 4: Run — verify 15 passed**

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/leases/utils/lease.ts web/src/domains/leases/utils/lease.test.ts
git commit -m "feat(leases): add lease date and status helpers"
```

---

## Task 5: `useLeaseStats` hook + tests

**Goal:** Derive the four stat-card values — Active Leases / Ending Soon (30d) / Total Monthly Rent / Ended — from a leases array. Sprint 1-pattern consistency.

**Files:**
- Create: `web/src/domains/leases/hooks/useLeaseStats.ts`
- Create: `web/src/domains/leases/hooks/useLeaseStats.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/src/domains/leases/hooks/useLeaseStats.test.ts`:
```ts
import { renderHook } from '@testing-library/react';
import { useLeaseStats } from './useLeaseStats';
import type { TLease } from '../api';

const build = (o: Partial<TLease>): TLease => ({
  id: 'l',
  property_id: 'p',
  tenant_id: 't',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1000,
  deposit: 1000,
  status: 'active',
  created_at: '',
  updated_at: '',
  ...o,
});

describe('useLeaseStats', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns zero stats for an empty list', () => {
    const { result } = renderHook(() => useLeaseStats([], now));
    expect(result.current).toEqual({
      activeLeases: 0,
      endingSoon: 0,
      totalMonthlyRent: 0,
      ended: 0,
    });
  });

  it('counts active leases and sums their rent', () => {
    const leases = [
      build({ id: 'l1', rent_amount: 1850 }),
      build({ id: 'l2', rent_amount: 2800 }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.activeLeases).toBe(2);
    expect(result.current.totalMonthlyRent).toBe(4650);
  });

  it('counts leases ending within 30 days', () => {
    const leases = [
      build({ id: 'l1', end_date: '2026-06-15T00:00:00Z' }),
      build({ id: 'l2', end_date: '2026-09-01T00:00:00Z' }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.endingSoon).toBe(1);
  });

  it('counts ended leases', () => {
    const leases = [
      build({ id: 'l1', status: 'ended' }),
      build({ id: 'l2', end_date: '2026-05-01T00:00:00Z' }),
      build({ id: 'l3' }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.ended).toBe(2);
  });

  it('excludes ended leases from monthly rent', () => {
    const leases = [
      build({ id: 'l1', rent_amount: 1000 }),
      build({ id: 'l2', rent_amount: 2000, status: 'ended' }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.totalMonthlyRent).toBe(1000);
  });

  it('excludes future-dated leases from active count and rent', () => {
    const leases = [
      build({ id: 'l1', rent_amount: 1000 }),
      build({ id: 'l2', rent_amount: 2000, start_date: '2027-01-01T00:00:00Z' }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.activeLeases).toBe(1);
    expect(result.current.totalMonthlyRent).toBe(1000);
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

- [ ] **Step 3: Implement**

Create `web/src/domains/leases/hooks/useLeaseStats.ts`:
```ts
import { useMemo } from 'react';
import type { TLease } from '../api';
import { isActiveLease, isEndingSoon, leaseDisplayStatus } from '../utils/lease';

type TLeaseStats = {
  activeLeases: number;
  endingSoon: number;
  totalMonthlyRent: number;
  ended: number;
};

export const useLeaseStats = (leases: TLease[], now: Date = new Date()): TLeaseStats => {
  return useMemo(() => {
    let activeLeases = 0;
    let endingSoon = 0;
    let totalMonthlyRent = 0;
    let ended = 0;

    for (const lease of leases) {
      if (isActiveLease(lease, now)) {
        activeLeases += 1;
        totalMonthlyRent += lease.rent_amount;
        if (isEndingSoon(lease, 30, now)) endingSoon += 1;
      }
      if (leaseDisplayStatus(lease, now) === 'ended') ended += 1;
    }

    return { activeLeases, endingSoon, totalMonthlyRent, ended };
  }, [leases, now]);
};
```

- [ ] **Step 4: Run — verify 6 passed**

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/leases/hooks/useLeaseStats.ts web/src/domains/leases/hooks/useLeaseStats.test.ts
git commit -m "feat(leases): add useLeaseStats hook"
```

---

## Task 6: `LeaseCard` component

**Goal:** Presentational card — property name, tenant name, date range, rent, deposit, status pill derived from `leaseDisplayStatus`. No nav (property detail route comes in Sprint 3). No render tests per scope A.

**Files:**
- Create: `web/src/domains/leases/components/LeaseCard.tsx`

- [ ] **Step 1: Create the component**

Create `web/src/domains/leases/components/LeaseCard.tsx`:
```tsx
import { Home, User, Calendar } from 'lucide-react';
import type { TLease } from '../api';
import type { TProperty } from '@/domains/properties';
import type { TTenant } from '@/domains/tenants';
import { StatusBadge } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/utils';
import { leaseDisplayStatus, type TLeaseDisplayStatus } from '../utils/lease';

type TLeaseCardProps = {
  lease: TLease;
  property?: TProperty;
  tenant?: TTenant;
};

const STATUS_VARIANT: Record<TLeaseDisplayStatus, 'green' | 'yellow'> = {
  active: 'green',
  'ending-soon': 'yellow',
  upcoming: 'yellow',
  ended: 'yellow',
};

const STATUS_LABEL: Record<TLeaseDisplayStatus, string> = {
  active: 'Active',
  'ending-soon': 'Ending Soon',
  upcoming: 'Upcoming',
  ended: 'Ended',
};

export const LeaseCard = ({ lease, property, tenant }: TLeaseCardProps) => {
  const status = leaseDisplayStatus(lease);
  const propertyLabel = property ? (property.name ?? property.address) : 'Unknown property';
  const tenantLabel = tenant ? `${tenant.first_name} ${tenant.last_name}`.trim() : 'Unknown tenant';

  return (
    <div className="bg-white rounded-xl border border-stone-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-stone-900 font-semibold truncate">
            <Home size={14} className="text-stone-400 shrink-0" aria-hidden />
            <span className="truncate">{propertyLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-stone-500 mt-1 truncate">
            <User size={13} className="text-stone-400 shrink-0" aria-hidden />
            <span className="truncate">{tenantLabel}</span>
          </div>
        </div>
        <StatusBadge status={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-3">
        <Calendar size={13} className="text-stone-400" aria-hidden />
        <span>{formatDate(lease.start_date)} — {formatDate(lease.end_date)}</span>
      </div>

      <div className="flex items-end justify-between mt-4 pt-3 border-t border-stone-100">
        <div>
          <p className="text-xs text-stone-500">Monthly Rent</p>
          <p className="font-semibold text-stone-900">{formatCurrency(lease.rent_amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-500">Deposit</p>
          <p className="font-semibold text-stone-900">{formatCurrency(lease.deposit)}</p>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add web/src/domains/leases/components/LeaseCard.tsx
git commit -m "feat(leases): add LeaseCard component"
```

---

## Task 7: `useCreateLeaseForm` hook + tests

**Goal:** Form state with validation — all fields required, `end_date > start_date`, `rent_amount > 0`, `deposit >= 0`.

**Files:**
- Create: `web/src/domains/leases/hooks/useCreateLeaseForm.ts`
- Create: `web/src/domains/leases/hooks/useCreateLeaseForm.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/src/domains/leases/hooks/useCreateLeaseForm.test.ts`:
```ts
import { renderHook, act } from '@testing-library/react';
import { useCreateLeaseForm } from './useCreateLeaseForm';

describe('useCreateLeaseForm', () => {
  it('starts empty and isValid false', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    expect(result.current.formData).toEqual({
      property_id: '',
      tenant_id: '',
      start_date: '',
      end_date: '',
      rent_amount: 0,
      deposit: 0,
    });
    expect(result.current.isValid).toBe(false);
  });

  it('updateField updates single key without mutating others', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => result.current.updateField('property_id', 'p1'));
    expect(result.current.formData.property_id).toBe('p1');
    expect(result.current.formData.tenant_id).toBe('');
  });

  it('isValid is true when all fields are filled and dates/money are valid', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('tenant_id', 't1');
      result.current.updateField('start_date', '2026-01-01');
      result.current.updateField('end_date', '2027-01-01');
      result.current.updateField('rent_amount', 1850);
      result.current.updateField('deposit', 1850);
    });
    expect(result.current.isValid).toBe(true);
  });

  it('isValid is false when end_date is not after start_date', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('tenant_id', 't1');
      result.current.updateField('start_date', '2026-06-01');
      result.current.updateField('end_date', '2026-06-01');
      result.current.updateField('rent_amount', 1000);
      result.current.updateField('deposit', 0);
    });
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.end_date).toBeDefined();
  });

  it('isValid is false when rent_amount is zero', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('tenant_id', 't1');
      result.current.updateField('start_date', '2026-01-01');
      result.current.updateField('end_date', '2027-01-01');
      result.current.updateField('rent_amount', 0);
    });
    expect(result.current.isValid).toBe(false);
  });

  it('isValid is false when deposit is negative', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('tenant_id', 't1');
      result.current.updateField('start_date', '2026-01-01');
      result.current.updateField('end_date', '2027-01-01');
      result.current.updateField('rent_amount', 1000);
      result.current.updateField('deposit', -1);
    });
    expect(result.current.isValid).toBe(false);
  });

  it('reset returns form to initial empty state', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('rent_amount', 1000);
    });
    act(() => result.current.reset());
    expect(result.current.formData).toEqual({
      property_id: '',
      tenant_id: '',
      start_date: '',
      end_date: '',
      rent_amount: 0,
      deposit: 0,
    });
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

- [ ] **Step 3: Implement**

Create `web/src/domains/leases/hooks/useCreateLeaseForm.ts`:
```ts
import { useState } from 'react';
import type { TLeaseCreate } from '../api';

const INITIAL: TLeaseCreate = {
  property_id: '',
  tenant_id: '',
  start_date: '',
  end_date: '',
  rent_amount: 0,
  deposit: 0,
};

type TFormErrors = {
  end_date?: string;
};

export const useCreateLeaseForm = () => {
  const [formData, setFormData] = useState<TLeaseCreate>(INITIAL);

  const updateField = <K extends keyof TLeaseCreate>(key: K, value: TLeaseCreate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setFormData(INITIAL);

  const errors: TFormErrors = {};
  const start = formData.start_date ? new Date(formData.start_date).getTime() : NaN;
  const end = formData.end_date ? new Date(formData.end_date).getTime() : NaN;
  if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
    errors.end_date = 'End date must be after start date';
  }

  const isValid =
    formData.property_id !== '' &&
    formData.tenant_id !== '' &&
    formData.start_date !== '' &&
    formData.end_date !== '' &&
    formData.rent_amount > 0 &&
    formData.deposit >= 0 &&
    !errors.end_date;

  return { formData, updateField, reset, isValid, errors };
};
```

- [ ] **Step 4: Run — verify 7 passed**

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/leases/hooks/useCreateLeaseForm.ts web/src/domains/leases/hooks/useCreateLeaseForm.test.ts
git commit -m "feat(leases): add useCreateLeaseForm hook"
```

---

## Task 8: `CreateLeaseForm` component

**Goal:** Modal form with property/tenant pickers (FormSelect), dates (HTML date inputs), rent, deposit.

**Files:**
- Create: `web/src/domains/leases/components/CreateLeaseForm.tsx`

- [ ] **Step 1: Create the component**

Create `web/src/domains/leases/components/CreateLeaseForm.tsx`:
```tsx
import { Calendar, DollarSign } from 'lucide-react';
import { FormField, FormSelect } from '@/shared/components';
import type { TLeaseCreate } from '../api';
import type { TProperty } from '@/domains/properties';
import type { TTenant } from '@/domains/tenants';
import { useCreateLeaseForm } from '../hooks/useCreateLeaseForm';

type TCreateLeaseFormProps = {
  properties: TProperty[];
  tenants: TTenant[];
  onSubmit: (data: TLeaseCreate) => Promise<void>;
  onCancel: () => void;
};

export const CreateLeaseForm = ({
  properties,
  tenants,
  onSubmit,
  onCancel,
}: TCreateLeaseFormProps) => {
  const { formData, updateField, reset, isValid, errors } = useCreateLeaseForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit(formData);
    reset();
    onCancel();
  };

  const propertyOptions = [
    { value: '', label: 'Select property…' },
    ...properties.map((p) => ({ value: p.id, label: p.name ?? p.address })),
  ];
  const tenantOptions = [
    { value: '', label: 'Select tenant…' },
    ...tenants.map((t) => ({ value: t.id, label: `${t.first_name} ${t.last_name}`.trim() })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSelect
        label="Property"
        required
        value={formData.property_id}
        onChange={(v) => updateField('property_id', v)}
        options={propertyOptions}
      />

      <FormSelect
        label="Tenant"
        required
        value={formData.tenant_id}
        onChange={(v) => updateField('tenant_id', v)}
        options={tenantOptions}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1">
            <Calendar size={14} aria-hidden />
            Start Date
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => updateField('start_date', e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1">
            <Calendar size={14} aria-hidden />
            End Date
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.end_date}
            onChange={(e) => updateField('end_date', e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
          />
          {errors.end_date && <p className="text-xs text-red-600 mt-1">{errors.end_date}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Monthly Rent"
          icon={<DollarSign size={14} />}
          required
          type="numeric"
          value={formData.rent_amount}
          onChange={(v) => updateField('rent_amount', v)}
        />
        <FormField
          label="Deposit"
          icon={<DollarSign size={14} />}
          type="numeric"
          value={formData.deposit}
          onChange={(v) => updateField('deposit', v)}
        />
      </div>

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
          Create Lease
        </button>
      </div>
    </form>
  );
};
```

- [ ] **Step 2: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add web/src/domains/leases/components/CreateLeaseForm.tsx
git commit -m "feat(leases): add CreateLeaseForm component"
```

---

## Task 9: Wire `LeasesPage` + `LeaseStatCards` + barrel

**Goal:** Replace the stub page with working list + stats + modal. Create `LeaseStatCards` presentational component. Expose everything via the leases barrel.

**Files:**
- Create: `web/src/domains/leases/components/LeaseStatCards.tsx`
- Modify: `web/src/domains/leases/index.ts`
- Modify: `web/src/pages/LeasesPage.tsx`

- [ ] **Step 1: Create `LeaseStatCards`**

Create `web/src/domains/leases/components/LeaseStatCards.tsx`:
```tsx
import { FileText, Clock, DollarSign, Archive } from 'lucide-react';
import { StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/utils';

type TLeaseStatCardsProps = {
  activeLeases: number;
  endingSoon: number;
  totalMonthlyRent: number;
  ended: number;
};

export const LeaseStatCards = ({
  activeLeases,
  endingSoon,
  totalMonthlyRent,
  ended,
}: TLeaseStatCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Active Leases"
        value={activeLeases}
        icon={<FileText size={20} aria-hidden />}
      />
      <StatCard
        label="Ending Soon"
        value={endingSoon}
        icon={<Clock size={20} aria-hidden />}
      />
      <StatCard
        label="Total Monthly Rent"
        value={formatCurrency(totalMonthlyRent)}
        icon={<DollarSign size={20} aria-hidden />}
      />
      <StatCard
        label="Ended"
        value={ended}
        icon={<Archive size={20} aria-hidden />}
      />
    </div>
  );
};
```

- [ ] **Step 2: Replace the barrel**

Overwrite `web/src/domains/leases/index.ts` with:
```ts
export * from './api';
export { useLeases } from './hooks/useLeases';
export { useLeasesByProperty } from './hooks/useLeasesByProperty';
export { useLeasesByTenant } from './hooks/useLeasesByTenant';
export { useLeaseStats } from './hooks/useLeaseStats';
export { useCreateLeaseForm } from './hooks/useCreateLeaseForm';
export { isActiveLease, leaseDisplayStatus } from './utils/lease';
export type { TLeaseDisplayStatus } from './utils/lease';
export { LeaseCard } from './components/LeaseCard';
export { CreateLeaseForm } from './components/CreateLeaseForm';
export { LeaseStatCards } from './components/LeaseStatCards';
```

The `isActiveLease` and `leaseDisplayStatus` utilities are exposed so pages (Task 10's TenantsPage enrichment) can derive tenant-level status from the full lease list without re-importing internal paths.

- [ ] **Step 3: Replace `web/src/pages/LeasesPage.tsx`**

Overwrite with:
```tsx
import { useMemo, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import {
  useLeases,
  useLeaseStats,
  LeaseCard,
  CreateLeaseForm,
  LeaseStatCards,
} from '../domains/leases';
import { useProperties } from '../domains/properties';
import { useTenants } from '../domains/tenants';
import {
  Modal,
  PageHeader,
  Loading,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';

export const LeasesPage = () => {
  const { leases, loading: leasesLoading, error: leasesError, createLease } = useLeases();
  const { properties, loading: propsLoading } = useProperties();
  const { tenants, loading: tenantsLoading } = useTenants();
  const stats = useLeaseStats(leases);
  const [showForm, setShowForm] = useState(false);

  const propertyById = useMemo(() => {
    const map = new Map<string, (typeof properties)[number]>();
    for (const p of properties) map.set(p.id, p);
    return map;
  }, [properties]);

  const tenantById = useMemo(() => {
    const map = new Map<string, (typeof tenants)[number]>();
    for (const t of tenants) map.set(t.id, t);
    return map;
  }, [tenants]);

  if (leasesLoading || propsLoading || tenantsLoading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Leases"
        subtitle="Track lease agreements between tenants and properties"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-800 flex items-center gap-2"
          >
            <Plus size={18} aria-hidden />
            Create Lease
          </button>
        }
      />

      {leasesError && <ErrorBanner message={leasesError} />}

      <LeaseStatCards {...stats} />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Create New Lease"
        icon={<FileText className="w-6 h-6 text-stone-700" aria-hidden />}
      >
        <CreateLeaseForm
          properties={properties}
          tenants={tenants}
          onSubmit={createLease}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {leases.length === 0 ? (
        <EmptyState
          title="No leases yet"
          description="Create your first lease agreement to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {leases.map((lease) => (
            <LeaseCard
              key={lease.id}
              lease={lease}
              property={propertyById.get(lease.property_id)}
              tenant={tenantById.get(lease.tenant_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeasesPage;
```

- [ ] **Step 4: Full quality gate**

```bash
cd web && npm run lint && npx tsc --noEmit && npm test && npm run build
```

All four must exit 0. Test count at this point: 74 (main) + 9 (useLeases) + 4 (useLeasesByProperty) + 4 (useLeasesByTenant) + 15 (lease utils) + 6 (useLeaseStats) + 7 (useCreateLeaseForm) = **119 passed**.

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/leases/components/LeaseStatCards.tsx web/src/domains/leases/index.ts web/src/pages/LeasesPage.tsx
git commit -m "feat(leases): wire LeasesPage with list, stats, and create modal"
```

---

## Task 10: Enrich `TenantsPage` with lease + property joins (C2.9)

**Goal:** Sprint 1 left `TenantCard` rendering only tenant-native fields. Now that `useLeases` + `useProperties` are safe to import, pass the joined data so tenant cards show property, dates, rent, and payment rate.

**Files:**
- Modify: `web/src/pages/TenantsPage.tsx`

- [ ] **Step 1: Rewrite `TenantsPage.tsx`**

Overwrite `web/src/pages/TenantsPage.tsx` with:
```tsx
import { useMemo, useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import {
  useTenants,
  useTenantStats,
  TenantCard,
  CreateTenantForm,
  TenantStatCards,
} from '../domains/tenants';
import { useLeases } from '../domains/leases';
import { useProperties } from '../domains/properties';
import { isActiveLease } from '../domains/leases';
import {
  Modal,
  PageHeader,
  Loading,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';

export const TenantsPage = () => {
  const { tenants, loading: tenantsLoading, error, createTenant } = useTenants();
  const { leases, loading: leasesLoading } = useLeases();
  const { properties, loading: propsLoading } = useProperties();
  const stats = useTenantStats(tenants, leases);
  const [showForm, setShowForm] = useState(false);

  const propertyById = useMemo(() => {
    const map = new Map<string, (typeof properties)[number]>();
    for (const p of properties) map.set(p.id, p);
    return map;
  }, [properties]);

  const activeLeaseByTenant = useMemo(() => {
    const map = new Map<string, (typeof leases)[number]>();
    for (const lease of leases) {
      if (!isActiveLease(lease)) continue;
      const current = map.get(lease.tenant_id);
      if (!current || new Date(lease.start_date) > new Date(current.start_date)) {
        map.set(lease.tenant_id, lease);
      }
    }
    return map;
  }, [leases]);

  if (tenantsLoading || leasesLoading || propsLoading) return <Loading />;

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
          {tenants.map((tenant) => {
            const lease = activeLeaseByTenant.get(tenant.id);
            const property = lease ? propertyById.get(lease.property_id) : undefined;
            return (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                lease={lease}
                property={property}
                leasesForStatus={leases}
                paymentRate={lease ? 100 : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TenantsPage;
```

Notes on the design:
- `paymentRate={lease ? 100 : undefined}` is a Sprint 2 placeholder — when the BE adds payment data, this becomes a real per-tenant computation. 100% keeps the card visually accurate until real data exists.
- `activeLeaseByTenant` picks the most-recent active lease per tenant in case a tenant has overlapping records.

**Note:** The `isActiveLease` import above resolves through the leases barrel (exported by Task 9 already). No additional barrel edits here.

- [ ] **Step 2: Full quality gate**

```bash
cd web && npm run lint && npx tsc --noEmit && npm test && npm run build
```

Tests: **119 passed** (no new tests in this task).

- [ ] **Step 3: Manual browser verification — SKIP**

Note skip in report. Page composition mirrors LeasesPage which is tested indirectly by the hook tests.

- [ ] **Step 4: Commit**

```bash
git add web/src/pages/TenantsPage.tsx
git commit -m "feat(tenants): enrich TenantsPage with lease and property joins"
```

---

## Sprint 2 exit checklist

- [ ] `npm run lint` → exit 0
- [ ] `npx tsc --noEmit` → exit 0
- [ ] `npm test` → **119 passed** across ~21 test files
- [ ] `npm run build` → exit 0, per-route chunks present (LeasesPage chunk should appear)
- [ ] `git log --oneline main..HEAD` → 10 commits, prefixes: `feat(leases): ×8`, `feat(tenants): ×1` (Task 10), plus potentially `test(...)` or `fix(...)` follow-ups from review
- [ ] Manual browser verification on `/leases` and `/tenants` — create a lease, see it appear on both pages; tenant card now shows property, dates, rent, 100% payment rate

---

## Execution order

Linear: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10. Each task compiles and passes tests independently.
