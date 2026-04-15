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
