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
