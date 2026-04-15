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

  it('clears a mutation error on the next successful operation', async () => {
    vi.mocked(tenantsApi.create).mockRejectedValueOnce(new Error('create fails'));

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

    vi.mocked(tenantsApi.create).mockResolvedValue({ data: mockTenant } as never);
    await act(async () => {
      await result.current.createTenant({
        first_name: 'OK',
        last_name: 'Again',
        email: 'ok@again.com',
        phone: '1',
      });
    });
    expect(result.current.error).toBe('');
  });

  it('clears a fetch error when a subsequent mutation triggers a successful refetch', async () => {
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
