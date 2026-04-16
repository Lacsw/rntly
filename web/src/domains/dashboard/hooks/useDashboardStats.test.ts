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

  it('does not re-fetch when parent re-renders without a now prop', async () => {
    const { rerender } = renderHook(() => useDashboardStats());
    await waitFor(() => expect(propertiesApi.getAll).toHaveBeenCalledOnce());

    rerender();
    rerender();
    rerender();

    expect(propertiesApi.getAll).toHaveBeenCalledOnce();
    expect(tenantsApi.getAll).toHaveBeenCalledOnce();
    expect(leasesApi.getAll).toHaveBeenCalledOnce();
  });
});
