import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/msw/server';
import { createMockLease } from '@/tests/msw/factories/lease';
import { useLeasesByTenant } from '../useLeasesByTenant';

const API = 'http://localhost:8080';

describe('useLeasesByTenant', () => {
  it('fetches leases for the given tenant id', async () => {
    const seen: string[] = [];
    server.use(
      http.get(`${API}/tenants/:tenantId/leases`, ({ params }) => {
        seen.push(String(params.tenantId));
        return HttpResponse.json([createMockLease({ tenant_id: String(params.tenantId) })]);
      }),
    );
    const { result } = renderHook(() => useLeasesByTenant('t1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(seen).toEqual(['t1']);
    expect(result.current.leases).toEqual([createMockLease({ tenant_id: 't1' })]);
    expect(result.current.error).toBe('');
  });

  it('refetches when tenantId changes', async () => {
    const seen: string[] = [];
    server.use(
      http.get(`${API}/tenants/:tenantId/leases`, ({ params }) => {
        seen.push(String(params.tenantId));
        return HttpResponse.json([]);
      }),
    );
    const { rerender } = renderHook(({ id }) => useLeasesByTenant(id), {
      initialProps: { id: 't1' },
    });
    await waitFor(() => expect(seen).toContain('t1'));

    rerender({ id: 't2' });
    await waitFor(() => expect(seen).toContain('t2'));
  });

  it('sets error when fetch fails', async () => {
    server.use(
      http.get(`${API}/tenants/:tenantId/leases`, () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    const { result } = renderHook(() => useLeasesByTenant('t1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch leases');
    expect(result.current.leases).toEqual([]);
  });

  it('does not fetch when tenantId is empty', async () => {
    let hit = false;
    server.use(
      http.get(`${API}/tenants/:tenantId/leases`, () => {
        hit = true;
        return HttpResponse.json([]);
      }),
    );
    const { result } = renderHook(() => useLeasesByTenant(''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(hit).toBe(false);
    expect(result.current.leases).toEqual([]);
  });
});
