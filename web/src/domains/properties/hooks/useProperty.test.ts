import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/msw/server';
import { createMockProperty } from '@/tests/msw/factories/property';
import { useProperty } from './useProperty';

const API = 'http://localhost:8080';

describe('useProperty', () => {
  it('fetches the property for the given id', async () => {
    const { result } = renderHook(() => useProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.property).toEqual(createMockProperty({ id: 'p1' }));
    expect(result.current.error).toBe('');
    expect(result.current.notFound).toBe(false);
  });

  it('refetches when id changes', async () => {
    const seen: string[] = [];
    server.use(
      http.get(`${API}/properties/:id`, ({ params }) => {
        seen.push(String(params.id));
        return HttpResponse.json(createMockProperty({ id: String(params.id) }));
      }),
    );
    const { rerender } = renderHook(({ id }) => useProperty(id), {
      initialProps: { id: 'p1' },
    });
    await waitFor(() => expect(seen).toContain('p1'));

    rerender({ id: 'p2' });
    await waitFor(() => expect(seen).toContain('p2'));
  });

  it('sets error when fetch fails', async () => {
    server.use(
      http.get(`${API}/properties/:id`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
    const { result } = renderHook(() => useProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch property');
    expect(result.current.notFound).toBe(false);
    expect(result.current.property).toBeUndefined();
  });

  it('sets notFound when backend returns 404', async () => {
    server.use(
      http.get(`${API}/properties/:id`, () => HttpResponse.json({ error: 'not found' }, { status: 404 })),
    );
    const { result } = renderHook(() => useProperty('missing'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBe('');
    expect(result.current.property).toBeUndefined();
  });

  it('does not fetch when id is empty', async () => {
    let hit = false;
    server.use(
      http.get(`${API}/properties/:id`, () => {
        hit = true;
        return HttpResponse.json(createMockProperty());
      }),
    );
    const { result } = renderHook(() => useProperty(''));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(hit).toBe(false);
    expect(result.current.property).toBeUndefined();
  });

  it('refetch re-fires the same id after a previous error', async () => {
    server.use(
      http.get(`${API}/properties/:id`, () => HttpResponse.json({ error: 'boom' }, { status: 500 }), {
        once: true,
      }),
    );
    const { result } = renderHook(() => useProperty('p1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to fetch property');

    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBe('');
    expect(result.current.property).toEqual(createMockProperty({ id: 'p1' }));
  });
});
