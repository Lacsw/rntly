# Sprint 4 — Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stub Dashboard with the template's working shell — four live stat tiles, "Your Properties" preview (top 3 with "View All →"), and "Recent Leases" preview.

**Architecture:** A new `dashboard/` domain — the only one allowed to import hooks + components from other domain barrels (per the spec's explicit exception). `useDashboardStats` aggregates properties / tenants / leases via `Promise.all`. Thin presentational sections compose `StatCard` and existing cards from sibling domains. No new backend contract.

**Tech Stack:** React 19, TypeScript 5.9 strict, Vitest 4.x + RTL 16.x, Tailwind 4.

**Spec reference:** `docs/superpowers/specs/2026-04-14-fe-scope-c-design.md` section 8.

**Lessons baked in:**
- Hooks reset error at fetch start. `Promise.all` avoids waterfalls.
- Pages surface errors from all hooks.
- `T`-prefixed types. `aria-hidden` on decorative icons.
- Cross-domain type/hook imports go through barrels.

---

## File structure

**Created:**

```
web/src/domains/dashboard/
├── hooks/
│   └── useDashboardStats.ts         + useDashboardStats.test.ts
├── components/
│   ├── DashboardStatCards.tsx
│   ├── YourPropertiesSection.tsx
│   └── RecentLeasesSection.tsx
└── index.ts                         (barrel)
```

**Modified:**
- `web/src/pages/DashboardPage.tsx` — replaces stub

---

## Task 1: `useDashboardStats` hook + tests

**Goal:** Aggregate properties, tenants, leases into a single stats object via `Promise.all`. Derive counts, revenue, occupancy, recent lists.

**Files:**
- Create: `web/src/domains/dashboard/hooks/useDashboardStats.ts`
- Create: `web/src/domains/dashboard/hooks/useDashboardStats.test.ts`

- [ ] **Step 1: Failing test**

Create `web/src/domains/dashboard/hooks/useDashboardStats.test.ts`:
```ts
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardStats } from './useDashboardStats';
import { propertiesApi } from '@/domains/properties';
import { tenantsApi } from '@/domains/tenants';
import { leasesApi } from '@/domains/leases';
import type { TProperty } from '@/domains/properties';
import type { TTenant } from '@/domains/tenants';
import type { TLease } from '@/domains/leases';

vi.mock('@/domains/properties', async () => {
  const actual = await vi.importActual<typeof import('@/domains/properties')>(
    '@/domains/properties',
  );
  return {
    ...actual,
    propertiesApi: { getAll: vi.fn() },
  };
});

vi.mock('@/domains/tenants', async () => {
  const actual = await vi.importActual<typeof import('@/domains/tenants')>(
    '@/domains/tenants',
  );
  return {
    ...actual,
    tenantsApi: { getAll: vi.fn() },
  };
});

vi.mock('@/domains/leases', async () => {
  const actual = await vi.importActual<typeof import('@/domains/leases')>(
    '@/domains/leases',
  );
  return {
    ...actual,
    leasesApi: { getAll: vi.fn() },
  };
});

const mkProperty = (overrides: Partial<TProperty>): TProperty => ({
  id: 'p',
  address: '123',
  type: 'apartment',
  bedrooms: 1,
  rent_amount: 1000,
  status: 'vacant',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const mkTenant = (id: string): TTenant => ({
  id,
  first_name: `F${id}`,
  last_name: `L${id}`,
  email: `${id}@e.com`,
  phone: '0',
  created_at: '',
  updated_at: '',
});

const mkLease = (overrides: Partial<TLease>): TLease => ({
  id: 'l',
  property_id: 'p',
  tenant_id: 't',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1000,
  deposit: 0,
  status: 'active',
  created_at: '',
  updated_at: '',
  ...overrides,
});

const now = new Date('2026-06-01T00:00:00Z');

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.mocked(propertiesApi.getAll).mockResolvedValue({ data: [] } as never);
    vi.mocked(tenantsApi.getAll).mockResolvedValue({ data: [] } as never);
    vi.mocked(leasesApi.getAll).mockResolvedValue({ data: [] } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fires all three fetches in parallel on mount', async () => {
    renderHook(() => useDashboardStats(now));
    await waitFor(() => {
      expect(propertiesApi.getAll).toHaveBeenCalledOnce();
      expect(tenantsApi.getAll).toHaveBeenCalledOnce();
      expect(leasesApi.getAll).toHaveBeenCalledOnce();
    });
  });

  it('derives stats from the fetched lists', async () => {
    vi.mocked(propertiesApi.getAll).mockResolvedValue({
      data: [mkProperty({ id: 'p1' }), mkProperty({ id: 'p2' })],
    } as never);
    vi.mocked(tenantsApi.getAll).mockResolvedValue({
      data: [mkTenant('t1'), mkTenant('t2'), mkTenant('t3')],
    } as never);
    vi.mocked(leasesApi.getAll).mockResolvedValue({
      data: [
        mkLease({ id: 'l1', property_id: 'p1', rent_amount: 1850 }),
        mkLease({ id: 'l2', property_id: 'p2', rent_amount: 2800, status: 'ended' }),
      ],
    } as never);

    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.propertyCount).toBe(2);
    expect(result.current.stats.tenantCount).toBe(3);
    expect(result.current.stats.totalRevenue).toBe(1850);
    expect(result.current.stats.occupancyRate).toBe(50);
    expect(result.current.stats.recentProperties).toHaveLength(2);
    expect(result.current.stats.recentLeases).toHaveLength(2);
  });

  it('sets error when any fetch fails', async () => {
    vi.mocked(leasesApi.getAll).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to load dashboard');
  });

  it('returns zero stats when everything is empty', async () => {
    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.propertyCount).toBe(0);
    expect(result.current.stats.tenantCount).toBe(0);
    expect(result.current.stats.totalRevenue).toBe(0);
    expect(result.current.stats.occupancyRate).toBe(0);
    expect(result.current.stats.recentProperties).toEqual([]);
    expect(result.current.stats.recentLeases).toEqual([]);
  });

  it('sorts recentProperties by updated_at desc and limits to 3', async () => {
    vi.mocked(propertiesApi.getAll).mockResolvedValue({
      data: [
        mkProperty({ id: 'p1', updated_at: '2026-01-01T00:00:00Z' }),
        mkProperty({ id: 'p2', updated_at: '2026-03-01T00:00:00Z' }),
        mkProperty({ id: 'p3', updated_at: '2026-02-01T00:00:00Z' }),
        mkProperty({ id: 'p4', updated_at: '2026-04-01T00:00:00Z' }),
      ],
    } as never);

    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.recentProperties.map((p) => p.id)).toEqual(['p4', 'p2', 'p3']);
  });

  it('sorts recentLeases by start_date desc and limits to 5', async () => {
    vi.mocked(leasesApi.getAll).mockResolvedValue({
      data: [
        mkLease({ id: 'l1', start_date: '2026-01-01T00:00:00Z' }),
        mkLease({ id: 'l2', start_date: '2026-05-01T00:00:00Z' }),
        mkLease({ id: 'l3', start_date: '2026-03-01T00:00:00Z' }),
        mkLease({ id: 'l4', start_date: '2026-04-01T00:00:00Z' }),
        mkLease({ id: 'l5', start_date: '2026-02-01T00:00:00Z' }),
        mkLease({ id: 'l6', start_date: '2025-12-01T00:00:00Z' }),
      ],
    } as never);

    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.recentLeases.map((l) => l.id)).toEqual([
      'l2',
      'l4',
      'l3',
      'l5',
      'l1',
    ]);
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

```bash
npx vitest run src/domains/dashboard/hooks/useDashboardStats.test.ts
```

- [ ] **Step 3: Implement**

Create `web/src/domains/dashboard/hooks/useDashboardStats.ts`:
```ts
import { useEffect, useState } from 'react';
import {
  propertiesApi,
  type TProperty,
} from '@/domains/properties';
import { tenantsApi, type TTenant } from '@/domains/tenants';
import { leasesApi, type TLease, isActiveLease } from '@/domains/leases';

type TDashboardStats = {
  propertyCount: number;
  tenantCount: number;
  totalRevenue: number;
  occupancyRate: number;
  recentProperties: TProperty[];
  recentLeases: TLease[];
};

const EMPTY_STATS: TDashboardStats = {
  propertyCount: 0,
  tenantCount: 0,
  totalRevenue: 0,
  occupancyRate: 0,
  recentProperties: [],
  recentLeases: [],
};

const toMs = (iso: string) => new Date(iso).getTime();

export const useDashboardStats = (now: Date = new Date()) => {
  const [stats, setStats] = useState<TDashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    setLoading(true);

    Promise.all([
      propertiesApi.getAll(),
      tenantsApi.getAll(),
      leasesApi.getAll(),
    ])
      .then(([propertiesRes, tenantsRes, leasesRes]) => {
        if (cancelled) return;
        const properties: TProperty[] = propertiesRes.data;
        const tenants: TTenant[] = tenantsRes.data;
        const leases: TLease[] = leasesRes.data;

        const activeLeases = leases.filter((l) => isActiveLease(l, now));
        const totalRevenue = activeLeases.reduce((sum, l) => sum + l.rent_amount, 0);
        const occupancyRate = properties.length > 0
          ? Math.round((activeLeases.length / properties.length) * 100)
          : 0;

        const recentProperties = [...properties]
          .sort((a, b) => toMs(b.updated_at) - toMs(a.updated_at))
          .slice(0, 3);

        const recentLeases = [...leases]
          .sort((a, b) => toMs(b.start_date) - toMs(a.start_date))
          .slice(0, 5);

        setStats({
          propertyCount: properties.length,
          tenantCount: tenants.length,
          totalRevenue,
          occupancyRate,
          recentProperties,
          recentLeases,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load dashboard');
          setStats(EMPTY_STATS);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [now]);

  return { stats, loading, error };
};
```

- [ ] **Step 4: Run — verify 6 passed + full suite 139 passed**

```bash
npx vitest run src/domains/dashboard/hooks/useDashboardStats.test.ts && npm test
```

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/dashboard/hooks/useDashboardStats.ts web/src/domains/dashboard/hooks/useDashboardStats.test.ts
git commit -m "feat(dashboard): add useDashboardStats hook"
```

---

## Task 2: `DashboardStatCards` component

**Files:**
- Create: `web/src/domains/dashboard/components/DashboardStatCards.tsx`

- [ ] **Step 1: Create**

```tsx
import { DollarSign, Building2, Users, TrendingUp } from 'lucide-react';
import { StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/utils';

type TDashboardStatCardsProps = {
  totalRevenue: number;
  propertyCount: number;
  tenantCount: number;
  occupancyRate: number;
};

export const DashboardStatCards = ({
  totalRevenue,
  propertyCount,
  tenantCount,
  occupancyRate,
}: TDashboardStatCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={<DollarSign size={20} aria-hidden />}
      />
      <StatCard
        label="Properties"
        value={propertyCount}
        icon={<Building2 size={20} aria-hidden />}
      />
      <StatCard
        label="Total Tenants"
        value={tenantCount}
        icon={<Users size={20} aria-hidden />}
      />
      <StatCard
        label="Occupancy Rate"
        value={`${occupancyRate}%`}
        icon={<TrendingUp size={20} aria-hidden />}
      />
    </div>
  );
};
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
git add web/src/domains/dashboard/components/DashboardStatCards.tsx
git commit -m "feat(dashboard): add DashboardStatCards component"
```

---

## Task 3: `YourPropertiesSection` component

**Files:**
- Create: `web/src/domains/dashboard/components/YourPropertiesSection.tsx`

- [ ] **Step 1: Create**

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PropertyCard } from '@/domains/properties';
import type { TProperty } from '@/domains/properties';
import { EmptyState } from '@/shared/components';

type TYourPropertiesSectionProps = {
  properties: TProperty[];
};

export const YourPropertiesSection = ({ properties }: TYourPropertiesSectionProps) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900">Your Properties</h2>
        <Link
          to="/properties"
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900"
        >
          View All
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
      {properties.length === 0 ? (
        <EmptyState title="No properties yet" description="Add your first property to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
};
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
git add web/src/domains/dashboard/components/YourPropertiesSection.tsx
git commit -m "feat(dashboard): add YourPropertiesSection component"
```

---

## Task 4: `RecentLeasesSection` component

**Goal:** Replaces template's "Recent Transactions" (BE has no transactions yet). Shows 5 most-recent leases with property/tenant/start/rent/status in a compact table.

**Files:**
- Create: `web/src/domains/dashboard/components/RecentLeasesSection.tsx`

- [ ] **Step 1: Create**

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { TLease } from '@/domains/leases';
import { leaseDisplayStatus, type TLeaseDisplayStatus } from '@/domains/leases';
import type { TProperty } from '@/domains/properties';
import type { TTenant } from '@/domains/tenants';
import { StatusBadge, EmptyState } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/utils';

type TRecentLeasesSectionProps = {
  leases: TLease[];
  properties: TProperty[];
  tenants: TTenant[];
};

const STATUS_LABEL: Record<TLeaseDisplayStatus, string> = {
  active: 'Active',
  'ending-soon': 'Ending Soon',
  upcoming: 'Upcoming',
  ended: 'Ended',
};

const STATUS_VARIANT: Record<TLeaseDisplayStatus, 'green' | 'yellow'> = {
  active: 'green',
  'ending-soon': 'yellow',
  upcoming: 'yellow',
  ended: 'yellow',
};

export const RecentLeasesSection = ({ leases, properties, tenants }: TRecentLeasesSectionProps) => {
  const propertyById = new Map(properties.map((p) => [p.id, p]));
  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900">Recent Leases</h2>
        <Link
          to="/leases"
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900"
        >
          View All
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
      {leases.length === 0 ? (
        <EmptyState title="No leases yet" description="Lease activity will appear here." />
      ) : (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Property</th>
                <th className="text-left px-4 py-3 font-medium">Tenant</th>
                <th className="text-left px-4 py-3 font-medium">Start</th>
                <th className="text-left px-4 py-3 font-medium">Rent</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leases.map((lease) => {
                const property = propertyById.get(lease.property_id);
                const tenant = tenantById.get(lease.tenant_id);
                const propertyLabel = property ? (property.name ?? property.address) : 'Unknown property';
                const tenantLabel = tenant
                  ? `${tenant.first_name} ${tenant.last_name}`.trim()
                  : 'Unknown tenant';
                const status = leaseDisplayStatus(lease);
                return (
                  <tr key={lease.id} className="border-t border-stone-100 text-sm">
                    <td className="px-4 py-3 text-stone-900">{propertyLabel}</td>
                    <td className="px-4 py-3 text-stone-600">{tenantLabel}</td>
                    <td className="px-4 py-3 text-stone-600">{formatDate(lease.start_date)}</td>
                    <td className="px-4 py-3 text-stone-900">{formatCurrency(lease.rent_amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
git add web/src/domains/dashboard/components/RecentLeasesSection.tsx
git commit -m "feat(dashboard): add RecentLeasesSection component"
```

---

## Task 5: Wire `DashboardPage` + barrel

**Files:**
- Create: `web/src/domains/dashboard/index.ts`
- Modify: `web/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Create barrel**

`web/src/domains/dashboard/index.ts`:
```ts
export { useDashboardStats } from './hooks/useDashboardStats';
export { DashboardStatCards } from './components/DashboardStatCards';
export { YourPropertiesSection } from './components/YourPropertiesSection';
export { RecentLeasesSection } from './components/RecentLeasesSection';
```

- [ ] **Step 2: Replace DashboardPage**

Overwrite `web/src/pages/DashboardPage.tsx` with:
```tsx
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  useDashboardStats,
  DashboardStatCards,
  YourPropertiesSection,
  RecentLeasesSection,
} from '../domains/dashboard';
import { useProperties } from '../domains/properties';
import { useTenants } from '../domains/tenants';
import { useLeases } from '../domains/leases';
import {
  PageHeader,
  Loading,
  ErrorBanner,
} from '@/shared/components';

export const DashboardPage = () => {
  const { stats, loading, error } = useDashboardStats();
  const { properties } = useProperties();
  const { tenants } = useTenants();
  const { leases } = useLeases();

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to rntly"
        actions={
          <Link
            to="/properties"
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-800 flex items-center gap-2"
          >
            <Plus size={18} aria-hidden />
            Add Property
          </Link>
        }
      />

      {error && <ErrorBanner message={error} />}

      <DashboardStatCards
        totalRevenue={stats.totalRevenue}
        propertyCount={stats.propertyCount}
        tenantCount={stats.tenantCount}
        occupancyRate={stats.occupancyRate}
      />

      <YourPropertiesSection properties={stats.recentProperties} />

      <RecentLeasesSection
        leases={stats.recentLeases}
        properties={properties}
        tenants={tenants}
      />

      {/* leases + tenants list hooks are consumed for id-lookup maps in RecentLeasesSection */}
      {leases.length === 0 && null}
    </div>
  );
};

export default DashboardPage;
```

(The trailing `{leases.length === 0 && null}` is a no-op that silences TS's "unused variable" check on the `leases` destructure since `RecentLeasesSection` already receives `stats.recentLeases`. Remove it and the destructure if tsc doesn't complain — `noUnusedLocals` is strict in this project.)

- [ ] **Step 3: Simplify — remove redundant leases destructure**

Since `RecentLeasesSection` only needs `properties` and `tenants` for id lookups (not the full leases list — that's in `stats.recentLeases`), remove the `useLeases()` call and the no-op expression. Final page:
```tsx
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  useDashboardStats,
  DashboardStatCards,
  YourPropertiesSection,
  RecentLeasesSection,
} from '../domains/dashboard';
import { useProperties } from '../domains/properties';
import { useTenants } from '../domains/tenants';
import {
  PageHeader,
  Loading,
  ErrorBanner,
} from '@/shared/components';

export const DashboardPage = () => {
  const { stats, loading, error } = useDashboardStats();
  const { properties } = useProperties();
  const { tenants } = useTenants();

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to rntly"
        actions={
          <Link
            to="/properties"
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-800 flex items-center gap-2"
          >
            <Plus size={18} aria-hidden />
            Add Property
          </Link>
        }
      />

      {error && <ErrorBanner message={error} />}

      <DashboardStatCards
        totalRevenue={stats.totalRevenue}
        propertyCount={stats.propertyCount}
        tenantCount={stats.tenantCount}
        occupancyRate={stats.occupancyRate}
      />

      <YourPropertiesSection properties={stats.recentProperties} />

      <RecentLeasesSection
        leases={stats.recentLeases}
        properties={properties}
        tenants={tenants}
      />
    </div>
  );
};

export default DashboardPage;
```

- [ ] **Step 4: Full quality gate**

```bash
cd web && npm run lint && npx tsc --noEmit && npm test && npm run build
```

Tests: 139 passed. Build: `DashboardPage-*.js` chunk should grow substantially.

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/dashboard/index.ts web/src/pages/DashboardPage.tsx
git commit -m "feat(dashboard): wire DashboardPage with stats, properties, and leases"
```

---

## Sprint 4 exit checklist

- [ ] `npm run lint` / `npx tsc --noEmit` / `npm test` (139 passed) / `npm run build` all green
- [ ] `git log --oneline main..HEAD` → 5 Sprint 4 commits, all `feat(dashboard):`
- [ ] Manual browser verify: `/` shows four stat tiles with real values, three properties, "Recent Leases" table, "Add Property" button navigates to `/properties`

---

## Execution order

Linear 1 → 5.
