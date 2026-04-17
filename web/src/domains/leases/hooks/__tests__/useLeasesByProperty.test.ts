import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/msw/server';
import { createMockLease } from '@/tests/msw/factories/lease';
import { useLeasesByProperty } from '../useLeasesByProperty';

const API = 'http://localhost:8080';

describe('useLeasesByProperty', () => {
  it('fetches leases for the given property id', async () => {
    const seen: string[] = [];
    server.use(
      http.get(`${API}/properties/:propertyId/leases`, ({ params }) => {
        seen.push(String(params.propertyId));
        return HttpResponse.json([createMockLease({ property_id: String(params.propertyId) })]);
      }),
    );
    const { result } = renderHook(() => useLeasesByProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(seen).toEqual(['p1']);
    expect(result.current.leases).toEqual([createMockLease({ property_id: 'p1' })]);
    expect(result.current.error).toBe('');
  });

  it('refetches when propertyId changes', async () => {
    const seen: string[] = [];
    server.use(
      http.get(`${API}/properties/:propertyId/leases`, ({ params }) => {
        seen.push(String(params.propertyId));
        return HttpResponse.json([]);
      }),
    );
    const { result, rerender } = renderHook(({ id }) => useLeasesByProperty(id), {
      initialProps: { id: 'p1' },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ id: 'p2' });
    await waitFor(() => expect(seen).toContain('p2'));
  });

  it('sets error when fetch fails', async () => {
    server.use(
      http.get(`${API}/properties/:propertyId/leases`, () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    const { result } = renderHook(() => useLeasesByProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch leases');
    expect(result.current.leases).toEqual([]);
  });

  it('does not fetch when propertyId is empty', async () => {
    let hit = false;
    server.use(
      http.get(`${API}/properties/:propertyId/leases`, () => {
        hit = true;
        return HttpResponse.json([]);
      }),
    );
    const { result } = renderHook(() => useLeasesByProperty(''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(hit).toBe(false);
    expect(result.current.leases).toEqual([]);
  });
});
