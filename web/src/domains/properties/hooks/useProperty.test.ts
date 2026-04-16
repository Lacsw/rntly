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
