import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/msw/server';
import { createMockLease } from '@/tests/msw/factories/lease';
import { useLeases } from '../useLeases';

const API = 'http://localhost:8080';

describe('useLeases', () => {
  it('fetches leases on mount', async () => {
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.leases).toEqual([createMockLease()]);
    expect(result.current.error).toBe('');
  });

  it('sets error when fetch fails', async () => {
    server.use(
      http.get(`${API}/leases`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch leases');
    expect(result.current.leases).toEqual([]);
  });

  it('createLease calls api and refetches', async () => {
    let getCount = 0;
    let postCalled = false;
    server.use(
      http.get(`${API}/leases`, () => {
        getCount += 1;
        return HttpResponse.json([createMockLease()]);
      }),
      http.post(`${API}/leases`, () => {
        postCalled = true;
        return HttpResponse.json(createMockLease({ id: 'l2' }));
      }),
    );
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

    expect(postCalled).toBe(true);
    expect(getCount).toBe(2);
  });

  it('sets error when createLease fails', async () => {
    server.use(
      http.post(`${API}/leases`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
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
    let getCount = 0;
    let updatedId: string | null = null;
    server.use(
      http.get(`${API}/leases`, () => {
        getCount += 1;
        return HttpResponse.json([createMockLease()]);
      }),
      http.put(`${API}/leases/:id`, ({ params }) => {
        updatedId = String(params.id);
        return HttpResponse.json(createMockLease({ id: updatedId }));
      }),
    );
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

    expect(updatedId).toBe('l1');
    expect(getCount).toBe(2);
  });

  it('sets error when updateLease fails', async () => {
    server.use(
      http.put(`${API}/leases/:id`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
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
    let getCount = 0;
    let deletedId: string | null = null;
    server.use(
      http.get(`${API}/leases`, () => {
        getCount += 1;
        return HttpResponse.json([createMockLease()]);
      }),
      http.delete(`${API}/leases/:id`, ({ params }) => {
        deletedId = String(params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteLease('l1');
    });

    expect(deletedId).toBe('l1');
    expect(getCount).toBe(2);
  });

  it('sets error when deleteLease fails', async () => {
    server.use(
      http.delete(`${API}/leases/:id`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
    const { result } = renderHook(() => useLeases());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteLease('l1');
    });

    expect(result.current.error).toBe('Failed to delete lease');
  });

  it('clears a mutation error on the next successful operation', async () => {
    server.use(
      http.post(`${API}/leases`, () => HttpResponse.json({ error: 'boom' }, { status: 500 }), {
        once: true,
      }),
    );
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
