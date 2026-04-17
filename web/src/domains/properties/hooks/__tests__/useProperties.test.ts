import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/msw/server';
import { createMockProperty } from '@/tests/msw/factories/property';
import { toast } from '@/shared/toast';
import { useProperties } from '../useProperties';

vi.mock('@/shared/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const API = 'http://localhost:8080';

describe('useProperties', () => {
  afterEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('fetches properties on mount and exposes them', async () => {
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toEqual([createMockProperty()]);
    expect(result.current.error).toBe('');
  });

  it('sets error when the fetch fails', async () => {
    server.use(
      http.get(`${API}/properties`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch properties');
    expect(result.current.properties).toEqual([]);
  });

  it('createProperty calls the api and refetches the list', async () => {
    let getCount = 0;
    let postCalled = false;
    server.use(
      http.get(`${API}/properties`, () => {
        getCount += 1;
        return HttpResponse.json([createMockProperty()]);
      }),
      http.post(`${API}/properties`, () => {
        postCalled = true;
        return HttpResponse.json(createMockProperty({ id: 'p2', address: '456 Oak' }));
      }),
    );
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

    expect(postCalled).toBe(true);
    expect(getCount).toBe(2);
    expect(toast.success).toHaveBeenCalledWith('Property added');
  });

  it('toasts an error when createProperty fails', async () => {
    server.use(
      http.post(`${API}/properties`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
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

    expect(toast.error).toHaveBeenCalledWith('Failed to create property');
    expect(result.current.error).toBe('');
  });

  it('deleteProperty removes the item optimistically and calls the api', async () => {
    let getCount = 0;
    let deletedId: string | null = null;
    server.use(
      http.get(`${API}/properties`, () => {
        getCount += 1;
        return HttpResponse.json([createMockProperty({ id: 'p1' })]);
      }),
      http.delete(`${API}/properties/:id`, ({ params }) => {
        deletedId = String(params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.properties).toHaveLength(1);

    await act(async () => {
      await result.current.deleteProperty('p1');
    });

    expect(deletedId).toBe('p1');
    expect(getCount).toBe(1);
    expect(result.current.properties).toHaveLength(0);
    expect(toast.success).toHaveBeenCalledWith('Property deleted');
  });

  it('reverts the optimistic delete and toasts on error', async () => {
    server.use(
      http.delete(`${API}/properties/:id`, () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const before = result.current.properties;

    await act(async () => {
      await result.current.deleteProperty('p1');
    });

    expect(result.current.properties).toEqual(before);
    expect(toast.error).toHaveBeenCalledWith('Failed to delete property');
  });

  it('updateProperty calls api with id+data and refetches', async () => {
    let getCount = 0;
    let updatedId: string | null = null;
    server.use(
      http.get(`${API}/properties`, () => {
        getCount += 1;
        return HttpResponse.json([createMockProperty()]);
      }),
      http.put(`${API}/properties/:id`, ({ params }) => {
        updatedId = String(params.id);
        return HttpResponse.json(createMockProperty({ id: updatedId }));
      }),
    );
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateProperty('1', {
        address: '789 New',
        type: 'house',
        bedrooms: 3,
        rent_amount: 2500,
        status: 'vacant',
      });
    });

    expect(updatedId).toBe('1');
    expect(getCount).toBe(2);
    expect(toast.success).toHaveBeenCalledWith('Property updated');
  });

  it('toasts an error when updateProperty fails', async () => {
    server.use(
      http.put(`${API}/properties/:id`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateProperty('1', {
        address: 'X',
        type: 'apartment',
        bedrooms: 1,
        rent_amount: 1000,
        status: 'vacant',
      });
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to update property');
  });

  it('clears a previous fetch error when the next fetch succeeds', async () => {
    server.use(
      http.get(`${API}/properties`, () => HttpResponse.json({ error: 'boom' }, { status: 500 }), {
        once: true,
      }),
    );

    const { result } = renderHook(() => useProperties());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch properties');

    await act(async () => {
      await result.current.createProperty({
        address: 'X',
        type: 'apartment',
        bedrooms: 1,
        rent_amount: 1000,
      });
    });

    expect(result.current.error).toBe('');
  });
});
