import { renderHook } from '@testing-library/react';
import { useTenantStats } from '../useTenantStats';
import type { TTenant } from '../../api';
import type { TLease } from '@/domains/leases';

const mkTenant = (id: string): TTenant => ({
  id,
  first_name: `F${id}`,
  last_name: `L${id}`,
  email: `${id}@e.com`,
  phone: '0',
  created_at: '',
  updated_at: '',
});

const mkLease = (id: string, tenant_id: string, rent: number, status = 'active'): TLease => ({
  id,
  property_id: 'p',
  tenant_id,
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: rent,
  deposit: 0,
  status,
  created_at: '',
  updated_at: '',
});

describe('useTenantStats', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns zero stats when there are no tenants and no leases', () => {
    const { result } = renderHook(() => useTenantStats([], [], now));
    expect(result.current).toEqual({
      activeTenants: 0,
      monthlyRevenue: 0,
      onTimePayments: 0,
      overduePayments: 0,
    });
  });

  it('sums monthly revenue across active leases', () => {
    const tenants = [mkTenant('t1'), mkTenant('t2')];
    const leases = [mkLease('l1', 't1', 1850), mkLease('l2', 't2', 2800)];
    const { result } = renderHook(() => useTenantStats(tenants, leases, now));
    expect(result.current.monthlyRevenue).toBe(4650);
    expect(result.current.activeTenants).toBe(2);
  });

  it('excludes leases that have ended from revenue and active count', () => {
    const tenants = [mkTenant('t1'), mkTenant('t2')];
    const leases = [
      mkLease('l1', 't1', 1850),
      mkLease('l2', 't2', 2800, 'ended'),
    ];
    const { result } = renderHook(() => useTenantStats(tenants, leases, now));
    expect(result.current.monthlyRevenue).toBe(1850);
    expect(result.current.activeTenants).toBe(1);
  });

  it('excludes leases that have not yet started from revenue and active count', () => {
    const tenants = [mkTenant('t1'), mkTenant('t2')];
    const leases = [
      mkLease('l1', 't1', 1850),
      { ...mkLease('l2', 't2', 2800), start_date: '2027-01-01T00:00:00Z' },
    ];
    const { result } = renderHook(() => useTenantStats(tenants, leases, now));
    expect(result.current.monthlyRevenue).toBe(1850);
    expect(result.current.activeTenants).toBe(1);
  });

  it('defaults leases to empty array so no-arg callers still work', () => {
    const tenants = [mkTenant('t1')];
    const { result } = renderHook(() => useTenantStats(tenants));
    expect(result.current.activeTenants).toBe(0);
    expect(result.current.monthlyRevenue).toBe(0);
  });

  it('onTimePayments equals activeTenants as Sprint 1 placeholder', () => {
    const tenants = [mkTenant('t1'), mkTenant('t2')];
    const leases = [mkLease('l1', 't1', 1000), mkLease('l2', 't2', 1000)];
    const { result } = renderHook(() => useTenantStats(tenants, leases, now));
    expect(result.current.onTimePayments).toBe(result.current.activeTenants);
  });

  it('overduePayments is 0 as Sprint 1 placeholder', () => {
    const tenants = [mkTenant('t1')];
    const leases = [mkLease('l1', 't1', 1000)];
    const { result } = renderHook(() => useTenantStats(tenants, leases, now));
    expect(result.current.overduePayments).toBe(0);
  });
});
