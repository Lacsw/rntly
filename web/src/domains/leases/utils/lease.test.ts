import { isActiveLease, daysRemaining, isEndingSoon, leaseDisplayStatus } from './lease';
import type { TLease } from '../api';

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

describe('isActiveLease', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns true for an active lease covering now', () => {
    expect(isActiveLease(build({}), now)).toBe(true);
  });

  it('returns false when status is not active', () => {
    expect(isActiveLease(build({ status: 'ended' }), now)).toBe(false);
  });

  it('returns false when lease ended before now', () => {
    expect(isActiveLease(build({ end_date: '2026-03-01T00:00:00Z' }), now)).toBe(false);
  });

  it('returns false when lease has not started yet', () => {
    expect(isActiveLease(build({ start_date: '2027-01-01T00:00:00Z' }), now)).toBe(false);
  });
});

describe('daysRemaining', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns positive number for future end date', () => {
    const d = daysRemaining(build({ end_date: '2026-07-01T00:00:00Z' }), now);
    expect(d).toBe(30);
  });

  it('returns 0 when end_date equals now', () => {
    expect(daysRemaining(build({ end_date: '2026-06-01T00:00:00Z' }), now)).toBe(0);
  });

  it('returns negative number for past end date', () => {
    const d = daysRemaining(build({ end_date: '2026-05-01T00:00:00Z' }), now);
    expect(d).toBe(-31);
  });
});

describe('isEndingSoon', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns true when lease ends within the default 30 day window', () => {
    expect(isEndingSoon(build({ end_date: '2026-06-15T00:00:00Z' }), 30, now)).toBe(true);
  });

  it('returns false when lease ends outside the window', () => {
    expect(isEndingSoon(build({ end_date: '2026-08-01T00:00:00Z' }), 30, now)).toBe(false);
  });

  it('returns false for leases that have already ended', () => {
    expect(isEndingSoon(build({ end_date: '2026-05-01T00:00:00Z' }), 30, now)).toBe(false);
  });

  it('honors a custom window', () => {
    expect(isEndingSoon(build({ end_date: '2026-08-01T00:00:00Z' }), 90, now)).toBe(true);
  });
});

describe('leaseDisplayStatus', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns "upcoming" when start is in the future', () => {
    expect(leaseDisplayStatus(build({ start_date: '2027-01-01T00:00:00Z' }), now)).toBe('upcoming');
  });

  it('returns "ended" when end is in the past or status is ended', () => {
    expect(leaseDisplayStatus(build({ end_date: '2026-05-01T00:00:00Z' }), now)).toBe('ended');
    expect(leaseDisplayStatus(build({ status: 'ended' }), now)).toBe('ended');
  });

  it('returns "ended" when status is ended even if start_date is in the future', () => {
    expect(
      leaseDisplayStatus(build({ status: 'ended', start_date: '2028-01-01T00:00:00Z' }), now),
    ).toBe('ended');
  });

  it('returns "ending-soon" when active and within 30 days of end', () => {
    expect(leaseDisplayStatus(build({ end_date: '2026-06-15T00:00:00Z' }), now)).toBe('ending-soon');
  });

  it('returns "active" for an active lease with more than 30 days left', () => {
    expect(leaseDisplayStatus(build({ end_date: '2026-09-01T00:00:00Z' }), now)).toBe('active');
  });
});
