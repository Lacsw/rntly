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
