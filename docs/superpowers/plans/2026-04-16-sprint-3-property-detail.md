# Sprint 3 — Property Detail + Edit/Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a working `/properties/:id` route matching the lovable.app template — header with back/edit, hero image with overlay, four info cards, five tabs (Overview / Tenant / Contracts / Financials / Maintenance), plus functional edit modal and destructive delete from the detail page.

**Architecture:** `useProperty(id)` fetches a single record. A new shared `DetailTabs` primitive (with tests) powers the tab strip. Detail-page-specific components live under `domains/properties/components/PropertyDetail/`. The detail page composes everything and keeps tab state in `?tab=` via `useSearchParams` for shareable links. Edit reuses `CreatePropertyForm` in an extended shape via a sibling `useEditPropertyForm` hook.

**Tech Stack:** React 19, TypeScript 5.9 strict, Vitest 4.x + RTL 16.x + MemoryRouter, Tailwind 4.

**Spec reference:** `docs/superpowers/specs/2026-04-14-fe-scope-c-design.md` section 7.

**Lessons baked in from Sprints 0/1/2:**
- Hooks reset `error` at fetch start. Mutations `await` refetch.
- Tests cover mutation-error → recovery path.
- New types `T`-prefixed. Icon buttons get `aria-label`. Decorative icons get `aria-hidden`.
- Pages surface errors from every hook they consume (don't silently drop them).
- Cross-domain type imports go through barrels, not internal paths.

---

## File structure

**Created:**

```
web/src/shared/components/ui/
├── DetailTabs.tsx                  + DetailTabs.test.tsx

web/src/domains/properties/
├── hooks/
│   ├── useProperty.ts              + useProperty.test.ts
│   └── useEditPropertyForm.ts      (no tests — shape mirrors useCreatePropertyForm)
├── components/PropertyDetail/
│   ├── PropertyDetailHeader.tsx
│   ├── PropertyDetailHero.tsx
│   ├── PropertyInfoCards.tsx
│   ├── OverviewTab.tsx
│   ├── TenantTab.tsx
│   ├── ContractsTab.tsx
│   ├── FinancialsTab.tsx           (placeholder)
│   └── MaintenanceTab.tsx          (placeholder)
├── components/EditPropertyForm.tsx
```

**Modified:**
- `web/src/shared/components/index.ts` — export `DetailTabs`
- `web/src/domains/properties/index.ts` — export new hooks + components
- `web/src/domains/properties/components/PropertyCard/PropertyCard.tsx` — wrap card body in `<Link>`, stop propagation on menu button
- `web/src/app/routes.tsx` — add `/properties/:id` lazy route
- `web/src/pages/PropertiesPage.tsx` — no change (card's own nav now handles click)
- Create: `web/src/pages/PropertyDetailPage.tsx`

**Boundary rules:**
- `PropertyDetailPage` is a page — it may import from `properties`, `leases`, and `tenants` barrels.
- Detail components stay inside the properties domain; they may accept lease/property/tenant data as props but do not fetch from other domains themselves (that's the page's job).

---

## Task 1: `useProperty` hook + tests

**Goal:** Fetch a single property by id. Returns `{ property, loading, error, refetch }`. Cancellation on id-change or unmount.

**Files:**
- Create: `web/src/domains/properties/hooks/useProperty.ts`
- Create: `web/src/domains/properties/hooks/useProperty.test.ts`

- [ ] **Step 1: Failing test**

Create `web/src/domains/properties/hooks/useProperty.test.ts`:
```ts
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProperty } from './useProperty';
import { propertiesApi } from '../api';
import type { TProperty } from '../api';

vi.mock('../api', () => ({
  propertiesApi: {
    getById: vi.fn(),
  },
}));

const mockProperty: TProperty = {
  id: 'p1',
  address: '123 Main St',
  type: 'apartment',
  bedrooms: 2,
  rent_amount: 1850,
  status: 'occupied',
  created_at: '',
  updated_at: '',
};

describe('useProperty', () => {
  beforeEach(() => {
    vi.mocked(propertiesApi.getById).mockResolvedValue({ data: mockProperty } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the property for the given id', async () => {
    const { result } = renderHook(() => useProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(propertiesApi.getById).toHaveBeenCalledWith('p1');
    expect(result.current.property).toEqual(mockProperty);
    expect(result.current.error).toBe('');
  });

  it('refetches when id changes', async () => {
    const { rerender } = renderHook(({ id }) => useProperty(id), {
      initialProps: { id: 'p1' },
    });
    await waitFor(() => expect(propertiesApi.getById).toHaveBeenCalledWith('p1'));

    rerender({ id: 'p2' });
    await waitFor(() => expect(propertiesApi.getById).toHaveBeenCalledWith('p2'));
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(propertiesApi.getById).mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch property');
    expect(result.current.property).toBeUndefined();
  });

  it('does not fetch when id is empty', async () => {
    const { result } = renderHook(() => useProperty(''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(propertiesApi.getById).not.toHaveBeenCalled();
    expect(result.current.property).toBeUndefined();
  });

  it('refetch re-fires the same id after a previous error', async () => {
    vi.mocked(propertiesApi.getById).mockRejectedValueOnce(new Error('net'));
    const { result } = renderHook(() => useProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch property');

    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBe('');
    expect(result.current.property).toEqual(mockProperty);
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

```bash
npx vitest run src/domains/properties/hooks/useProperty.test.ts
```

- [ ] **Step 3: Implement**

Create `web/src/domains/properties/hooks/useProperty.ts`:
```ts
import { useCallback, useEffect, useState } from 'react';
import { propertiesApi, type TProperty } from '../api';

export const useProperty = (id: string) => {
  const [property, setProperty] = useState<TProperty | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperty = useCallback(async (signal?: { cancelled: boolean }) => {
    setError('');
    try {
      const { data } = await propertiesApi.getById(id);
      if (!signal?.cancelled) setProperty(data);
    } catch {
      if (!signal?.cancelled) {
        setError('Failed to fetch property');
        setProperty(undefined);
      }
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setProperty(undefined);
      setLoading(false);
      return;
    }
    const signal = { cancelled: false };
    setLoading(true);
    fetchProperty(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [id, fetchProperty]);

  const refetch = useCallback(() => fetchProperty(), [fetchProperty]);

  return { property, loading, error, refetch };
};
```

- [ ] **Step 4: Run — verify 5 passed + full suite 125 passed**

```bash
npx vitest run src/domains/properties/hooks/useProperty.test.ts && npm test
```

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/properties/hooks/useProperty.ts web/src/domains/properties/hooks/useProperty.test.ts
git commit -m "feat(properties): add useProperty hook"
```

---

## Task 2: `DetailTabs` shared component + tests

**Goal:** Controlled tab strip. Active-id prop with `onChange` callback. Renders the active tab's content below the strip. Used by the property detail page.

**Files:**
- Create: `web/src/shared/components/ui/DetailTabs.tsx`
- Create: `web/src/shared/components/ui/DetailTabs.test.tsx`
- Modify: `web/src/shared/components/index.ts` (export)

- [ ] **Step 1: Failing test**

Create `web/src/shared/components/ui/DetailTabs.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetailTabs } from './DetailTabs';

const tabs = [
  { id: 'overview', label: 'Overview', content: <div>overview-content</div> },
  { id: 'tenant', label: 'Tenant', content: <div>tenant-content</div> },
  { id: 'contracts', label: 'Contracts', content: <div>contracts-content</div> },
];

describe('DetailTabs', () => {
  it('renders all tab labels', () => {
    render(<DetailTabs tabs={tabs} activeId="overview" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tenant' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Contracts' })).toBeInTheDocument();
  });

  it('renders only the active tab content', () => {
    render(<DetailTabs tabs={tabs} activeId="tenant" onChange={() => {}} />);
    expect(screen.queryByText('overview-content')).not.toBeInTheDocument();
    expect(screen.getByText('tenant-content')).toBeInTheDocument();
    expect(screen.queryByText('contracts-content')).not.toBeInTheDocument();
  });

  it('marks the active tab with aria-selected', () => {
    render(<DetailTabs tabs={tabs} activeId="tenant" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Tenant' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with tab id when a tab is clicked', async () => {
    const onChange = vi.fn();
    render(<DetailTabs tabs={tabs} activeId="overview" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Contracts' }));
    expect(onChange).toHaveBeenCalledWith('contracts');
  });

  it('falls back to the first tab when activeId does not match any tab', () => {
    render(<DetailTabs tabs={tabs} activeId="nonexistent" onChange={() => {}} />);
    expect(screen.getByText('overview-content')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — verify FAIL**

- [ ] **Step 3: Implement**

Create `web/src/shared/components/ui/DetailTabs.tsx`:
```tsx
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type TDetailTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TDetailTabsProps = {
  tabs: TDetailTab[];
  activeId: string;
  onChange: (id: string) => void;
};

export const DetailTabs = ({ tabs, activeId, onChange }: TDetailTabsProps) => {
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="flex gap-4 border-b border-stone-200 mb-6">
        {tabs.map((tab) => {
          const isActive = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'pb-3 -mb-px border-b-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{active?.content}</div>
    </div>
  );
};
```

- [ ] **Step 4: Update barrel**

Edit `web/src/shared/components/index.ts`. Add line:
```ts
export { DetailTabs } from './ui/DetailTabs';
```
in alphabetical position (between `ConfirmDialog` and `EmptyState`).

- [ ] **Step 5: Run — verify 5 passed + full suite 130 passed**

- [ ] **Step 6: Commit**

```bash
git add web/src/shared/components/ui/DetailTabs.tsx web/src/shared/components/ui/DetailTabs.test.tsx web/src/shared/components/index.ts
git commit -m "feat(shared/ui): add DetailTabs component"
```

---

## Task 3: `PropertyDetailHeader` component

**Goal:** Back chevron (navigates to `/properties`), title, address subtitle, status badge on the right, edit button slot.

**Files:**
- Create: `web/src/domains/properties/components/PropertyDetail/PropertyDetailHeader.tsx`

- [ ] **Step 1: Create component**

Create `web/src/domains/properties/components/PropertyDetail/PropertyDetailHeader.tsx`:
```tsx
import type { ReactNode } from 'react';
import { PageHeader, StatusBadge } from '@/shared/components';
import type { TProperty } from '../../api';

type TPropertyDetailHeaderProps = {
  property: TProperty;
  actions?: ReactNode;
};

export const PropertyDetailHeader = ({ property, actions }: TPropertyDetailHeaderProps) => {
  const title = property.name ?? property.address;
  const subtitle = property.name ? property.address : undefined;

  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      backHref="/properties"
      actions={
        <div className="flex items-center gap-3">
          <StatusBadge
            status={property.status}
            variant={property.status === 'vacant' ? 'green' : 'yellow'}
          />
          {actions}
        </div>
      }
    />
  );
};
```

- [ ] **Step 2: Verify tsc + tests**

```bash
npx tsc --noEmit && npm test
```

Tests: 130 passed (no new tests).

- [ ] **Step 3: Commit**

```bash
git add web/src/domains/properties/components/PropertyDetail/PropertyDetailHeader.tsx
git commit -m "feat(properties): add PropertyDetailHeader component"
```

---

## Task 4: `PropertyDetailHero` component

**Goal:** Large 16:9 image. Bottom-left overlay shows `{type}` small and `${rent}/mo` large. Falls back to a stone-200 placeholder with `BuildingIcon` when `image_url` is absent.

**Files:**
- Create: `web/src/domains/properties/components/PropertyDetail/PropertyDetailHero.tsx`

- [ ] **Step 1: Create component**

Create `web/src/domains/properties/components/PropertyDetail/PropertyDetailHero.tsx`:
```tsx
import type { TProperty } from '../../api';
import { BuildingIcon } from '@/shared/icons/BuildingIcon';
import { formatCurrency } from '@/shared/utils';

type TPropertyDetailHeroProps = {
  property: TProperty;
};

export const PropertyDetailHero = ({ property }: TPropertyDetailHeroProps) => {
  const displayName = property.name ?? property.address;
  return (
    <div className="relative aspect-[16/9] bg-stone-200 rounded-xl overflow-hidden mb-6">
      {property.image_url ? (
        <img
          src={property.image_url}
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-stone-400">
          <BuildingIcon className="w-24 h-24" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="absolute bottom-4 left-4 text-white">
        <p className="text-xs capitalize opacity-80">{property.type}</p>
        <p className="text-2xl font-bold">{formatCurrency(property.rent_amount)}/mo</p>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
```

```bash
git add web/src/domains/properties/components/PropertyDetail/PropertyDetailHero.tsx
git commit -m "feat(properties): add PropertyDetailHero component"
```

---

## Task 5: `PropertyInfoCards` component

**Goal:** Row of 4 stat cards — Bedrooms, Bathrooms, Monthly Rent, Size (sq ft). Uses shared `StatCard`. Missing fields render "—".

**Files:**
- Create: `web/src/domains/properties/components/PropertyDetail/PropertyInfoCards.tsx`

- [ ] **Step 1: Create component**

Create `web/src/domains/properties/components/PropertyDetail/PropertyInfoCards.tsx`:
```tsx
import { Bed, Bath, DollarSign, Ruler } from 'lucide-react';
import type { TProperty } from '../../api';
import { StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/utils';

type TPropertyInfoCardsProps = {
  property: TProperty;
};

type TPropertyWithOptionalSize = TProperty & { square_feet?: number };

export const PropertyInfoCards = ({ property }: TPropertyInfoCardsProps) => {
  const squareFeet = (property as TPropertyWithOptionalSize).square_feet;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Bedrooms"
        value={property.bedrooms}
        icon={<Bed size={20} aria-hidden />}
      />
      <StatCard
        label="Bathrooms"
        value={property.bathrooms ?? '—'}
        icon={<Bath size={20} aria-hidden />}
      />
      <StatCard
        label="Monthly Rent"
        value={formatCurrency(property.rent_amount)}
        icon={<DollarSign size={20} aria-hidden />}
      />
      <StatCard
        label="Size"
        value={squareFeet !== undefined ? `${squareFeet} sqft` : '—'}
        icon={<Ruler size={20} aria-hidden />}
      />
    </div>
  );
};
```

**Design note:** `TProperty` doesn't currently have `square_feet` — it's treated as a forward-compatible optional field. The cast keeps type-safety local to this component. A follow-up BE spec would add it to the type.

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
```

```bash
git add web/src/domains/properties/components/PropertyDetail/PropertyInfoCards.tsx
git commit -m "feat(properties): add PropertyInfoCards component"
```

---

## Task 6: `OverviewTab` component

**Goal:** Two-column section — "Property Details" card (type, year built, square footage, status, description) + "Amenities" chip list. Missing fields show "—" or explanatory fallback.

**Files:**
- Create: `web/src/domains/properties/components/PropertyDetail/OverviewTab.tsx`

- [ ] **Step 1: Create component**

Create `web/src/domains/properties/components/PropertyDetail/OverviewTab.tsx`:
```tsx
import type { TProperty } from '../../api';

type TOverviewTabProps = {
  property: TProperty;
};

type TPropertyWithExtras = TProperty & {
  year_built?: number;
  square_feet?: number;
  description?: string;
  amenities?: string[];
};

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <p className="text-xs text-stone-500">{label}</p>
    <p className="text-sm font-medium text-stone-900 mt-0.5">{value}</p>
  </div>
);

export const OverviewTab = ({ property }: TOverviewTabProps) => {
  const extras = property as TPropertyWithExtras;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-stone-100 p-6">
        <h3 className="font-semibold text-stone-900 mb-4">Property Details</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DetailRow label="Type" value={property.type} />
          <DetailRow label="Square Footage" value={extras.square_feet !== undefined ? `${extras.square_feet} sq ft` : '—'} />
          <DetailRow label="Year Built" value={extras.year_built ?? '—'} />
          <DetailRow label="Status" value={property.status} />
        </div>
        <div className="mt-4">
          <p className="text-xs text-stone-500">Description</p>
          <p className="text-sm text-stone-900 mt-0.5">
            {extras.description ?? 'No description yet.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-100 p-6">
        <h3 className="font-semibold text-stone-900 mb-4">Amenities</h3>
        {extras.amenities && extras.amenities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {extras.amenities.map((a) => (
              <span
                key={a}
                className="bg-stone-100 text-stone-700 text-xs rounded-full px-3 py-1"
              >
                {a}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">No amenities listed.</p>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
git add web/src/domains/properties/components/PropertyDetail/OverviewTab.tsx
git commit -m "feat(properties): add OverviewTab component"
```

---

## Task 7: `TenantTab` component

**Goal:** Show the current tenant for this property. Consumes `useLeasesByProperty(propertyId)` + `useTenants` (passed down by the page for consistency with other domain-join patterns). Renders a compact `TenantCard` when an active lease exists, else empty state with "No active tenant".

**Files:**
- Create: `web/src/domains/properties/components/PropertyDetail/TenantTab.tsx`

- [ ] **Step 1: Create component**

Create `web/src/domains/properties/components/PropertyDetail/TenantTab.tsx`:
```tsx
import type { TLease } from '@/domains/leases';
import { isActiveLease } from '@/domains/leases';
import { TenantCard } from '@/domains/tenants';
import type { TTenant } from '@/domains/tenants';
import { EmptyState } from '@/shared/components';

type TTenantTabProps = {
  leases: TLease[];
  tenants: TTenant[];
};

export const TenantTab = ({ leases, tenants }: TTenantTabProps) => {
  const activeLease = leases.find((l) => isActiveLease(l));
  const tenant = activeLease ? tenants.find((t) => t.id === activeLease.tenant_id) : undefined;

  if (!activeLease || !tenant) {
    return (
      <EmptyState
        title="No active tenant"
        description="This property does not have an active lease right now."
      />
    );
  }

  return (
    <div className="max-w-md">
      <TenantCard
        tenant={tenant}
        lease={activeLease}
        leasesForStatus={leases}
        paymentRate={100}
      />
    </div>
  );
};
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
git add web/src/domains/properties/components/PropertyDetail/TenantTab.tsx
git commit -m "feat(properties): add TenantTab component"
```

---

## Task 8: `ContractsTab` component

**Goal:** Lease history for this property. Table-style list. Empty state when no leases.

**Files:**
- Create: `web/src/domains/properties/components/PropertyDetail/ContractsTab.tsx`

- [ ] **Step 1: Create component**

Create `web/src/domains/properties/components/PropertyDetail/ContractsTab.tsx`:
```tsx
import type { TLease } from '@/domains/leases';
import { leaseDisplayStatus, type TLeaseDisplayStatus } from '@/domains/leases';
import type { TTenant } from '@/domains/tenants';
import { StatusBadge, EmptyState } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/utils';

type TContractsTabProps = {
  leases: TLease[];
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

export const ContractsTab = ({ leases, tenants }: TContractsTabProps) => {
  if (leases.length === 0) {
    return <EmptyState title="No leases yet" description="This property has no lease history." />;
  }

  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  return (
    <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-stone-50 text-xs text-stone-500">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Tenant</th>
            <th className="text-left px-4 py-3 font-medium">Dates</th>
            <th className="text-left px-4 py-3 font-medium">Rent</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {leases.map((lease) => {
            const tenant = tenantById.get(lease.tenant_id);
            const tenantLabel = tenant
              ? `${tenant.first_name} ${tenant.last_name}`.trim()
              : 'Unknown tenant';
            const status = leaseDisplayStatus(lease);
            return (
              <tr key={lease.id} className="border-t border-stone-100 text-sm">
                <td className="px-4 py-3 text-stone-900">{tenantLabel}</td>
                <td className="px-4 py-3 text-stone-600">
                  {formatDate(lease.start_date)} — {formatDate(lease.end_date)}
                </td>
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
  );
};
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
git add web/src/domains/properties/components/PropertyDetail/ContractsTab.tsx
git commit -m "feat(properties): add ContractsTab component"
```

---

## Task 9: `FinancialsTab` + `MaintenanceTab` placeholders

**Goal:** Both render a centered "Coming soon" card to keep the tab strip complete without misrepresenting backend capability.

**Files:**
- Create: `web/src/domains/properties/components/PropertyDetail/FinancialsTab.tsx`
- Create: `web/src/domains/properties/components/PropertyDetail/MaintenanceTab.tsx`

- [ ] **Step 1: Create both files**

`FinancialsTab.tsx`:
```tsx
import { EmptyState } from '@/shared/components';
import { DollarSign } from 'lucide-react';

export const FinancialsTab = () => {
  return (
    <EmptyState
      icon={<DollarSign size={32} aria-hidden />}
      title="Financials coming soon"
      description="Revenue, expense, and occupancy analytics will live here."
    />
  );
};
```

`MaintenanceTab.tsx`:
```tsx
import { EmptyState } from '@/shared/components';
import { Wrench } from 'lucide-react';

export const MaintenanceTab = () => {
  return (
    <EmptyState
      icon={<Wrench size={32} aria-hidden />}
      title="Maintenance coming soon"
      description="Work orders and request tracking will live here."
    />
  );
};
```

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
git add web/src/domains/properties/components/PropertyDetail/FinancialsTab.tsx web/src/domains/properties/components/PropertyDetail/MaintenanceTab.tsx
git commit -m "feat(properties): add FinancialsTab and MaintenanceTab placeholders"
```

---

## Task 10: `/properties/:id` route + `PropertyDetailPage`

**Goal:** Wire all the pieces. Page fetches property + property's leases + tenants. Renders header → hero → info cards → tab strip. Tab state synced with `?tab=` in URL.

**Files:**
- Modify: `web/src/domains/properties/index.ts` (export `useProperty` + detail components)
- Create: `web/src/pages/PropertyDetailPage.tsx`
- Modify: `web/src/app/routes.tsx` (add lazy route)

- [ ] **Step 1: Update properties barrel**

Replace `web/src/domains/properties/index.ts` with:
```ts
export * from './api';
export { useProperties } from './hooks/useProperties';
export { useProperty } from './hooks/useProperty';
export { useCreatePropertyForm } from './hooks/useCreatePropertyForm';
export { CreatePropertyForm } from './components/CreatePropertyForm';
export { PropertyCard } from './components/PropertyCard';
export { PropertyDetailHeader } from './components/PropertyDetail/PropertyDetailHeader';
export { PropertyDetailHero } from './components/PropertyDetail/PropertyDetailHero';
export { PropertyInfoCards } from './components/PropertyDetail/PropertyInfoCards';
export { OverviewTab } from './components/PropertyDetail/OverviewTab';
export { TenantTab } from './components/PropertyDetail/TenantTab';
export { ContractsTab } from './components/PropertyDetail/ContractsTab';
export { FinancialsTab } from './components/PropertyDetail/FinancialsTab';
export { MaintenanceTab } from './components/PropertyDetail/MaintenanceTab';
```

- [ ] **Step 2: Create `web/src/pages/PropertyDetailPage.tsx`**

```tsx
import { useParams, useSearchParams } from 'react-router-dom';
import {
  useProperty,
  PropertyDetailHeader,
  PropertyDetailHero,
  PropertyInfoCards,
  OverviewTab,
  TenantTab,
  ContractsTab,
  FinancialsTab,
  MaintenanceTab,
} from '../domains/properties';
import { useLeasesByProperty } from '../domains/leases';
import { useTenants } from '../domains/tenants';
import {
  DetailTabs,
  Loading,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';

const DEFAULT_TAB = 'overview';

export const PropertyDetailPage = () => {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? DEFAULT_TAB;

  const { property, loading: propertyLoading, error: propertyError } = useProperty(id);
  const { leases, loading: leasesLoading, error: leasesError } = useLeasesByProperty(id);
  const { tenants, loading: tenantsLoading, error: tenantsError } = useTenants();

  const handleTabChange = (tabId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabId);
    setSearchParams(next, { replace: true });
  };

  if (propertyLoading || leasesLoading || tenantsLoading) return <Loading />;

  if (propertyError) return <ErrorBanner message={propertyError} />;

  if (!property) {
    return (
      <EmptyState
        title="Property not found"
        description="This property may have been deleted."
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab property={property} /> },
    { id: 'tenant', label: 'Tenant', content: <TenantTab leases={leases} tenants={tenants} /> },
    { id: 'contracts', label: 'Contracts', content: <ContractsTab leases={leases} tenants={tenants} /> },
    { id: 'financials', label: 'Financials', content: <FinancialsTab /> },
    { id: 'maintenance', label: 'Maintenance', content: <MaintenanceTab /> },
  ];

  return (
    <div>
      <PropertyDetailHeader property={property} />
      {leasesError && <ErrorBanner message={leasesError} />}
      {tenantsError && <ErrorBanner message={tenantsError} />}
      <PropertyDetailHero property={property} />
      <PropertyInfoCards property={property} />
      <DetailTabs tabs={tabs} activeId={activeTab} onChange={handleTabChange} />
    </div>
  );
};

export default PropertyDetailPage;
```

- [ ] **Step 3: Add the lazy route**

Edit `web/src/app/routes.tsx`. Add the new lazy import alongside the others:
```tsx
const PropertyDetailPage = lazy(() => import('../pages/PropertyDetailPage'));
```

Add the new route inside the `<Route element={<MainLayout />}>` block, immediately after the `/properties` route:
```tsx
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
```

- [ ] **Step 4: Full quality gate**

```bash
cd web && npm run lint && npx tsc --noEmit && npm test && npm run build
```

All four must exit 0. Tests: 130 passed.

- [ ] **Step 5: Commit**

```bash
git add web/src/domains/properties/index.ts web/src/pages/PropertyDetailPage.tsx web/src/app/routes.tsx
git commit -m "feat(properties): add /properties/:id route and detail page"
```

---

## Task 11: Link `PropertyCard` to the detail route

**Goal:** Clicking a card body navigates to `/properties/:id`. The kebab menu's click is intercepted so it does not navigate.

**Files:**
- Modify: `web/src/domains/properties/components/PropertyCard/PropertyCard.tsx`

- [ ] **Step 1: Wrap the card body in `<Link>`**

Replace entire file with:
```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const stopPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 relative">
      {onDelete && (
        <div className="absolute top-2 right-2 z-10" onClick={stopPropagation}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm"
            aria-label="Property actions"
          >
            <MoreVertical size={16} aria-hidden />
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
                <Trash2 size={14} aria-hidden />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <Link to={`/properties/${property.id}`} className="block">
        <PropertyCardImage property={property} displayName={displayName} />

        <div className="p-4">
          <h3 className="text-lg font-semibold text-stone-900">{displayName}</h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-stone-500">
            <MapPin className="w-3.5 h-3.5" aria-hidden />
            <span>{property.address}</span>
          </div>

          <PropertyCardStats property={property} />

          {property.tenant_name && <PropertyCardTenant name={property.tenant_name} />}
        </div>
      </Link>

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

- [ ] **Step 2: Verify + commit**

```bash
npx tsc --noEmit && npm test
git add web/src/domains/properties/components/PropertyCard/PropertyCard.tsx
git commit -m "feat(properties): link PropertyCard to detail route"
```

---

## Task 12: `EditPropertyForm` + `useEditPropertyForm`

**Goal:** Edit flow mirrors create but with pre-filled initial values and a different submit verb.

**Files:**
- Create: `web/src/domains/properties/hooks/useEditPropertyForm.ts`
- Create: `web/src/domains/properties/components/EditPropertyForm.tsx`

- [ ] **Step 1: Create the hook**

Create `web/src/domains/properties/hooks/useEditPropertyForm.ts`:
```ts
import { useState } from 'react';
import type { TProperty, TPropertyUpdate } from '../api';

export const useEditPropertyForm = (initial: TProperty) => {
  const [formData, setFormData] = useState<TPropertyUpdate>({
    name: initial.name,
    address: initial.address,
    city: initial.city,
    type: initial.type,
    status: initial.status,
    bedrooms: initial.bedrooms,
    bathrooms: initial.bathrooms,
    rent_amount: initial.rent_amount,
    image_url: initial.image_url,
    tenant_name: initial.tenant_name,
  });

  const updateField = <K extends keyof TPropertyUpdate>(key: K, value: TPropertyUpdate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    (formData.name ?? '').trim() !== '' &&
    formData.address.trim() !== '' &&
    (formData.city ?? '').trim() !== '' &&
    formData.rent_amount > 0;

  return { formData, updateField, isValid };
};
```

- [ ] **Step 2: Create the component**

Create `web/src/domains/properties/components/EditPropertyForm.tsx`:
```tsx
import { MapPin, Bed, Bath, DollarSign } from 'lucide-react';
import { FormField, FormSelect } from '@/shared/components';
import type { TProperty, TPropertyUpdate } from '../api';
import { useEditPropertyForm } from '../hooks/useEditPropertyForm';
import {
  PROPERTY_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from './CreatePropertyForm/constants';

type TEditPropertyFormProps = {
  initial: TProperty;
  onSubmit: (data: TPropertyUpdate) => Promise<void>;
  onCancel: () => void;
};

export const EditPropertyForm = ({ initial, onSubmit, onCancel }: TEditPropertyFormProps) => {
  const { formData, updateField, isValid } = useEditPropertyForm(initial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit(formData);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Property Name"
        required
        value={formData.name ?? ''}
        onChange={(v) => updateField('name', v)}
      />

      <FormField
        label="Address"
        icon={<MapPin size={14} />}
        required
        value={formData.address}
        onChange={(v) => updateField('address', v)}
      />

      <FormField
        label="City"
        required
        value={formData.city ?? ''}
        onChange={(v) => updateField('city', v)}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Property Type"
          value={formData.type}
          onChange={(v) => updateField('type', v)}
          options={PROPERTY_TYPE_OPTIONS}
        />
        <FormSelect
          label="Status"
          value={formData.status}
          onChange={(v) => updateField('status', v)}
          options={STATUS_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          label="Bedrooms"
          icon={<Bed size={14} />}
          type="numeric"
          value={formData.bedrooms}
          onChange={(v) => updateField('bedrooms', v)}
        />
        <FormField
          label="Bathrooms"
          icon={<Bath size={14} />}
          type="numeric"
          value={formData.bathrooms ?? 1}
          onChange={(v) => updateField('bathrooms', v)}
        />
        <FormField
          label="Rent"
          icon={<DollarSign size={14} />}
          required
          type="numeric"
          value={formData.rent_amount}
          onChange={(v) => updateField('rent_amount', v)}
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
          Save Changes
        </button>
      </div>
    </form>
  );
};
```

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit && npm test
git add web/src/domains/properties/hooks/useEditPropertyForm.ts web/src/domains/properties/components/EditPropertyForm.tsx
git commit -m "feat(properties): add EditPropertyForm and useEditPropertyForm"
```

---

## Task 13: Wire edit + delete on `PropertyDetailPage`

**Goal:** Edit button in header opens a modal with `EditPropertyForm`. Add a delete action to the header (kebab menu inside actions slot) that opens `ConfirmDialog` → calls `useProperties().deleteProperty` → navigates back to `/properties`.

**Files:**
- Modify: `web/src/domains/properties/index.ts` (export `EditPropertyForm`)
- Modify: `web/src/pages/PropertyDetailPage.tsx`
- Modify: `web/src/domains/properties/hooks/useProperties.ts` — add `updateProperty` (if not already there)

- [ ] **Step 1: Check `useProperties` for `updateProperty`**

Read `web/src/domains/properties/hooks/useProperties.ts`. If it does NOT have an `updateProperty` method, add one. Final file should be:
```ts
import { useEffect, useState } from 'react';
import { propertiesApi, type TProperty, type TPropertyCreate, type TPropertyUpdate } from '../api';

export const useProperties = () => {
  const [properties, setProperties] = useState<TProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperties = async () => {
    setError('');
    try {
      const { data } = await propertiesApi.getAll();
      setProperties(data);
    } catch {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const createProperty = async (data: TPropertyCreate) => {
    try {
      await propertiesApi.create(data);
      await fetchProperties();
    } catch {
      setError('Failed to create property');
    }
  };

  const updateProperty = async (id: string, data: TPropertyUpdate) => {
    try {
      await propertiesApi.update(id, data);
      await fetchProperties();
    } catch {
      setError('Failed to update property');
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await propertiesApi.delete(id);
      await fetchProperties();
    } catch {
      setError('Failed to delete property');
    }
  };

  return { properties, loading, error, createProperty, updateProperty, deleteProperty };
};
```

Also add a matching test case in `useProperties.test.ts` if `updateProperty` is newly added — follow the shape of the `createProperty` tests: happy path + error path. If it already exists, skip this addition.

- [ ] **Step 2: Update properties barrel**

Add to `web/src/domains/properties/index.ts`:
```ts
export { EditPropertyForm } from './components/EditPropertyForm';
```
in alphabetical position within the components section.

- [ ] **Step 3: Rewrite `web/src/pages/PropertyDetailPage.tsx`**

Full file:
```tsx
import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useProperty,
  useProperties,
  EditPropertyForm,
  PropertyDetailHeader,
  PropertyDetailHero,
  PropertyInfoCards,
  OverviewTab,
  TenantTab,
  ContractsTab,
  FinancialsTab,
  MaintenanceTab,
} from '../domains/properties';
import { useLeasesByProperty } from '../domains/leases';
import { useTenants } from '../domains/tenants';
import {
  DetailTabs,
  Loading,
  ErrorBanner,
  EmptyState,
  Modal,
  ConfirmDialog,
} from '@/shared/components';

const DEFAULT_TAB = 'overview';

export const PropertyDetailPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? DEFAULT_TAB;

  const { property, loading: propertyLoading, error: propertyError, refetch } = useProperty(id);
  const { leases, loading: leasesLoading, error: leasesError } = useLeasesByProperty(id);
  const { tenants, loading: tenantsLoading, error: tenantsError } = useTenants();
  const { updateProperty, deleteProperty } = useProperties();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleTabChange = (tabId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabId);
    setSearchParams(next, { replace: true });
  };

  if (propertyLoading || leasesLoading || tenantsLoading) return <Loading />;

  if (propertyError) return <ErrorBanner message={propertyError} />;

  if (!property) {
    return (
      <EmptyState
        title="Property not found"
        description="This property may have been deleted."
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab property={property} /> },
    { id: 'tenant', label: 'Tenant', content: <TenantTab leases={leases} tenants={tenants} /> },
    { id: 'contracts', label: 'Contracts', content: <ContractsTab leases={leases} tenants={tenants} /> },
    { id: 'financials', label: 'Financials', content: <FinancialsTab /> },
    { id: 'maintenance', label: 'Maintenance', content: <MaintenanceTab /> },
  ];

  return (
    <div>
      <PropertyDetailHeader
        property={property}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 border border-stone-200 px-3 py-1.5 rounded text-sm hover:bg-stone-50"
            >
              <Pencil size={14} aria-hidden />
              Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              aria-label="Delete property"
              className="flex items-center gap-1.5 border border-red-200 text-red-700 px-3 py-1.5 rounded text-sm hover:bg-red-50"
            >
              <Trash2 size={14} aria-hidden />
              Delete
            </button>
          </div>
        }
      />
      {leasesError && <ErrorBanner message={leasesError} />}
      {tenantsError && <ErrorBanner message={tenantsError} />}
      <PropertyDetailHero property={property} />
      <PropertyInfoCards property={property} />
      <DetailTabs tabs={tabs} activeId={activeTab} onChange={handleTabChange} />

      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Property"
        icon={<Pencil className="w-6 h-6 text-stone-700" aria-hidden />}
      >
        <EditPropertyForm
          initial={property}
          onSubmit={async (data) => {
            await updateProperty(property.id, data);
            await refetch();
          }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      <ConfirmDialog
        open={showDelete}
        title="Delete property"
        message={`Are you sure you want to delete ${property.name ?? property.address}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await deleteProperty(property.id);
          setShowDelete(false);
          navigate('/properties');
        }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default PropertyDetailPage;
```

- [ ] **Step 4: Full quality gate**

```bash
cd web && npm run lint && npx tsc --noEmit && npm test && npm run build
```

All four must exit 0. Test count depends on whether Step 1 added a new test pair for `updateProperty` — expected 130 (no new tests) or 132 (if 2 new tests for updateProperty).

- [ ] **Step 5: Commit**

```bash
git add web/src/pages/PropertyDetailPage.tsx web/src/domains/properties/index.ts web/src/domains/properties/hooks/useProperties.ts web/src/domains/properties/hooks/useProperties.test.ts
git commit -m "feat(properties): wire edit and delete on PropertyDetailPage"
```

---

## Sprint 3 exit checklist

- [ ] `npm run lint` → exit 0
- [ ] `npx tsc --noEmit` → exit 0
- [ ] `npm test` → 130 or 132 passed across ~21 test files
- [ ] `npm run build` → exit 0, `PropertyDetailPage-*.js` chunk visible
- [ ] `git log --oneline main..HEAD` → 13 commits, all `feat(properties):` or `feat(shared/ui):` prefixed
- [ ] Manual browser verify: `/properties` shows clickable cards, clicking navigates to `/properties/:id`, hero + info cards render, tab switching updates `?tab=`, Edit button opens modal with prefilled data, Delete asks for confirmation then navigates back

---

## Execution order

Linear 1 → 13. Every task compiles and tests pass after its commit.
