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
