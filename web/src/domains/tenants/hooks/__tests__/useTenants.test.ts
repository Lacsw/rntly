import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/msw/server';
import { createMockTenant } from '@/tests/msw/factories/tenant';
import { toast } from '@/shared/toast';
import { useTenants } from '../useTenants';

vi.mock('@/shared/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const API = 'http://localhost:8080';

describe('useTenants', () => {
  afterEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('fetches tenants on mount and exposes them', async () => {
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tenants).toEqual([createMockTenant()]);
    expect(result.current.error).toBe('');
  });

  it('sets error when the fetch fails', async () => {
    server.use(
      http.get(`${API}/tenants`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch tenants');
    expect(result.current.tenants).toEqual([]);
  });

  it('createTenant calls the api and refetches the list', async () => {
    let getCount = 0;
    let postCalled = false;
    server.use(
      http.get(`${API}/tenants`, () => {
        getCount += 1;
        return HttpResponse.json([createMockTenant()]);
      }),
      http.post(`${API}/tenants`, () => {
        postCalled = true;
        return HttpResponse.json(createMockTenant({ id: 't2' }));
      }),
    );
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

    expect(postCalled).toBe(true);
    expect(getCount).toBe(2);
    expect(toast.success).toHaveBeenCalledWith('Tenant added');
  });

  it('toasts an error when createTenant fails', async () => {
    server.use(
      http.post(`${API}/tenants`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
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

    expect(toast.error).toHaveBeenCalledWith('Failed to create tenant');
    expect(result.current.error).toBe('');
  });

  it('deleteTenant removes the item optimistically and calls the api', async () => {
    let getCount = 0;
    let deletedId: string | null = null;
    server.use(
      http.get(`${API}/tenants`, () => {
        getCount += 1;
        return HttpResponse.json([createMockTenant({ id: 't1' })]);
      }),
      http.delete(`${API}/tenants/:id`, ({ params }) => {
        deletedId = String(params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tenants).toHaveLength(1);

    await act(async () => {
      await result.current.deleteTenant('t1');
    });

    expect(deletedId).toBe('t1');
    expect(getCount).toBe(1);
    expect(result.current.tenants).toHaveLength(0);
    expect(toast.success).toHaveBeenCalledWith('Tenant deleted');
  });

  it('reverts the optimistic delete and toasts on error', async () => {
    server.use(
      http.delete(`${API}/tenants/:id`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const before = result.current.tenants;

    await act(async () => {
      await result.current.deleteTenant('t1');
    });

    expect(result.current.tenants).toEqual(before);
    expect(toast.error).toHaveBeenCalledWith('Failed to delete tenant');
  });

  it('clears a fetch error when a subsequent mutation triggers a successful refetch', async () => {
    server.use(
      http.get(`${API}/tenants`, () => HttpResponse.json({ error: 'boom' }, { status: 500 }), {
        once: true,
      }),
    );

    const { result } = renderHook(() => useTenants());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch tenants');

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
