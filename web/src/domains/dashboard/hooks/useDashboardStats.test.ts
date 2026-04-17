import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/msw/server';
import { createMockProperty } from '@/tests/msw/factories/property';
import { createMockTenant } from '@/tests/msw/factories/tenant';
import { createMockLease } from '@/tests/msw/factories/lease';
import { useDashboardStats } from './useDashboardStats';

const API = 'http://localhost:8080';

const now = new Date('2026-06-01T00:00:00Z');

const emptyLists = () =>
  server.use(
    http.get(`${API}/properties`, () => HttpResponse.json([])),
    http.get(`${API}/tenants`, () => HttpResponse.json([])),
    http.get(`${API}/leases`, () => HttpResponse.json([])),
  );

describe('useDashboardStats', () => {
  it('fires all three fetches in parallel on mount', async () => {
    const hits = { properties: 0, tenants: 0, leases: 0 };
    server.use(
      http.get(`${API}/properties`, () => {
        hits.properties += 1;
        return HttpResponse.json([]);
      }),
      http.get(`${API}/tenants`, () => {
        hits.tenants += 1;
        return HttpResponse.json([]);
      }),
      http.get(`${API}/leases`, () => {
        hits.leases += 1;
        return HttpResponse.json([]);
      }),
    );

    renderHook(() => useDashboardStats(now));
    await waitFor(() => {
      expect(hits.properties).toBe(1);
      expect(hits.tenants).toBe(1);
      expect(hits.leases).toBe(1);
    });
  });

  it('derives stats from the fetched lists', async () => {
    server.use(
      http.get(`${API}/properties`, () =>
        HttpResponse.json([
          createMockProperty({ id: 'p1' }),
          createMockProperty({ id: 'p2' }),
        ]),
      ),
      http.get(`${API}/tenants`, () =>
        HttpResponse.json([
          createMockTenant({ id: 't1' }),
          createMockTenant({ id: 't2' }),
          createMockTenant({ id: 't3' }),
        ]),
      ),
      http.get(`${API}/leases`, () =>
        HttpResponse.json([
          createMockLease({ id: 'l1', property_id: 'p1', rent_amount: 1850 }),
          createMockLease({ id: 'l2', property_id: 'p2', rent_amount: 2800, status: 'ended' }),
        ]),
      ),
    );

    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.propertyCount).toBe(2);
    expect(result.current.stats.tenantCount).toBe(3);
    expect(result.current.stats.totalRevenue).toBe(1850);
    expect(result.current.stats.occupancyRate).toBe(50);
    expect(result.current.stats.recentProperties).toHaveLength(2);
    expect(result.current.stats.recentLeases).toHaveLength(2);
  });

  it('sets error when any fetch fails', async () => {
    server.use(
      http.get(`${API}/properties`, () => HttpResponse.json([])),
      http.get(`${API}/tenants`, () => HttpResponse.json([])),
      http.get(`${API}/leases`, () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
    );
    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to load dashboard');
  });

  it('returns zero stats when everything is empty', async () => {
    emptyLists();
    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats.propertyCount).toBe(0);
    expect(result.current.stats.tenantCount).toBe(0);
    expect(result.current.stats.totalRevenue).toBe(0);
    expect(result.current.stats.occupancyRate).toBe(0);
    expect(result.current.stats.recentProperties).toEqual([]);
    expect(result.current.stats.recentLeases).toEqual([]);
  });

  it('sorts recentProperties by updated_at desc and limits to 3', async () => {
    server.use(
      http.get(`${API}/properties`, () =>
        HttpResponse.json([
          createMockProperty({ id: 'p1', updated_at: '2026-01-01T00:00:00Z' }),
          createMockProperty({ id: 'p2', updated_at: '2026-03-01T00:00:00Z' }),
          createMockProperty({ id: 'p3', updated_at: '2026-02-01T00:00:00Z' }),
          createMockProperty({ id: 'p4', updated_at: '2026-04-01T00:00:00Z' }),
        ]),
      ),
      http.get(`${API}/tenants`, () => HttpResponse.json([])),
      http.get(`${API}/leases`, () => HttpResponse.json([])),
    );

    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.recentProperties.map((p) => p.id)).toEqual(['p4', 'p2', 'p3']);
  });

  it('sorts recentLeases by start_date desc and limits to 5', async () => {
    server.use(
      http.get(`${API}/properties`, () => HttpResponse.json([])),
      http.get(`${API}/tenants`, () => HttpResponse.json([])),
      http.get(`${API}/leases`, () =>
        HttpResponse.json([
          createMockLease({ id: 'l1', start_date: '2026-01-01T00:00:00Z' }),
          createMockLease({ id: 'l2', start_date: '2026-05-01T00:00:00Z' }),
          createMockLease({ id: 'l3', start_date: '2026-03-01T00:00:00Z' }),
          createMockLease({ id: 'l4', start_date: '2026-04-01T00:00:00Z' }),
          createMockLease({ id: 'l5', start_date: '2026-02-01T00:00:00Z' }),
          createMockLease({ id: 'l6', start_date: '2025-12-01T00:00:00Z' }),
        ]),
      ),
    );

    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.recentLeases.map((l) => l.id)).toEqual([
      'l2',
      'l4',
      'l3',
      'l5',
      'l1',
    ]);
  });

  it('occupancyRate counts distinct occupied properties, not lease rows', async () => {
    server.use(
      http.get(`${API}/properties`, () =>
        HttpResponse.json([
          createMockProperty({ id: 'p1' }),
          createMockProperty({ id: 'p2' }),
        ]),
      ),
      http.get(`${API}/tenants`, () => HttpResponse.json([])),
      http.get(`${API}/leases`, () =>
        HttpResponse.json([
          createMockLease({ id: 'l1', property_id: 'p1', rent_amount: 1000 }),
          createMockLease({ id: 'l2', property_id: 'p1', rent_amount: 1500 }),
        ]),
      ),
    );

    const { result } = renderHook(() => useDashboardStats(now));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats.occupancyRate).toBe(50);
    expect(result.current.stats.totalRevenue).toBe(2500);
  });

  it('does not re-fetch when parent re-renders without a now prop', async () => {
    const hits = { properties: 0, tenants: 0, leases: 0 };
    server.use(
      http.get(`${API}/properties`, () => {
        hits.properties += 1;
        return HttpResponse.json([]);
      }),
      http.get(`${API}/tenants`, () => {
        hits.tenants += 1;
        return HttpResponse.json([]);
      }),
      http.get(`${API}/leases`, () => {
        hits.leases += 1;
        return HttpResponse.json([]);
      }),
    );

    const { rerender } = renderHook(() => useDashboardStats());
    await waitFor(() => expect(hits.properties).toBe(1));

    rerender();
    rerender();
    rerender();

    expect(hits.properties).toBe(1);
    expect(hits.tenants).toBe(1);
    expect(hits.leases).toBe(1);
  });
});
