import { renderHook } from '@testing-library/react';
import { useLeaseStats } from '../useLeaseStats';
import type { TLease } from '../../api';

const build = (o: Partial<TLease>): TLease => ({
  id: 'l',
  property_id: 'p',
  tenant_id: 't',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1000,
  deposit: 1000,
  status: 'active',
  created_at: '',
  updated_at: '',
  ...o,
});

describe('useLeaseStats', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns zero stats for an empty list', () => {
    const { result } = renderHook(() => useLeaseStats([], now));
    expect(result.current).toEqual({
      activeLeases: 0,
      endingSoon: 0,
      totalMonthlyRent: 0,
      ended: 0,
    });
  });

  it('counts active leases and sums their rent', () => {
    const leases = [
      build({ id: 'l1', rent_amount: 1850 }),
      build({ id: 'l2', rent_amount: 2800 }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.activeLeases).toBe(2);
    expect(result.current.totalMonthlyRent).toBe(4650);
  });

  it('counts leases ending within 30 days', () => {
    const leases = [
      build({ id: 'l1', end_date: '2026-06-15T00:00:00Z' }),
      build({ id: 'l2', end_date: '2026-09-01T00:00:00Z' }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.endingSoon).toBe(1);
  });

  it('counts ended leases', () => {
    const leases = [
      build({ id: 'l1', status: 'ended' }),
      build({ id: 'l2', end_date: '2026-05-01T00:00:00Z' }),
      build({ id: 'l3' }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.ended).toBe(2);
  });

  it('excludes ended leases from monthly rent', () => {
    const leases = [
      build({ id: 'l1', rent_amount: 1000 }),
      build({ id: 'l2', rent_amount: 2000, status: 'ended' }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.totalMonthlyRent).toBe(1000);
  });

  it('excludes future-dated leases from active count and rent', () => {
    const leases = [
      build({ id: 'l1', rent_amount: 1000 }),
      build({ id: 'l2', rent_amount: 2000, start_date: '2027-01-01T00:00:00Z' }),
    ];
    const { result } = renderHook(() => useLeaseStats(leases, now));
    expect(result.current.activeLeases).toBe(1);
    expect(result.current.totalMonthlyRent).toBe(1000);
  });
});
