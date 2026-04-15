import { fullName, isActiveTenant, paymentRateLabel } from './tenant';
import type { TTenant } from '../api';
import type { TLease } from '@/domains/leases';

const tenant: TTenant = {
  id: 't1',
  first_name: 'Sarah',
  last_name: 'Johnson',
  email: 's@j.com',
  phone: '555',
  created_at: '',
  updated_at: '',
};

const buildLease = (overrides: Partial<TLease>): TLease => ({
  id: 'l1',
  property_id: 'p1',
  tenant_id: 't1',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1000,
  deposit: 1000,
  status: 'active',
  created_at: '',
  updated_at: '',
  ...overrides,
});

describe('fullName', () => {
  it('joins first and last name with a space', () => {
    expect(fullName(tenant)).toBe('Sarah Johnson');
  });

  it('trims extra whitespace if either name is missing', () => {
    expect(fullName({ ...tenant, last_name: '' })).toBe('Sarah');
    expect(fullName({ ...tenant, first_name: '' })).toBe('Johnson');
  });
});

describe('isActiveTenant', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('returns true when tenant has an active lease covering now', () => {
    const lease = buildLease({ tenant_id: 't1' });
    expect(isActiveTenant(tenant, [lease], now)).toBe(true);
  });

  it('returns false when lease ended before now', () => {
    const lease = buildLease({ tenant_id: 't1', end_date: '2026-03-01T00:00:00Z' });
    expect(isActiveTenant(tenant, [lease], now)).toBe(false);
  });

  it('returns false when lease belongs to a different tenant', () => {
    const lease = buildLease({ tenant_id: 'other' });
    expect(isActiveTenant(tenant, [lease], now)).toBe(false);
  });

  it('returns false when lease status is not active', () => {
    const lease = buildLease({ tenant_id: 't1', status: 'ended' });
    expect(isActiveTenant(tenant, [lease], now)).toBe(false);
  });

  it('returns false when no leases are supplied', () => {
    expect(isActiveTenant(tenant, [], now)).toBe(false);
  });
});

describe('paymentRateLabel', () => {
  it('labels ≥ 90% as positive', () => {
    expect(paymentRateLabel(100)).toEqual({ label: '100%', positive: true });
    expect(paymentRateLabel(90)).toEqual({ label: '90%', positive: true });
  });

  it('labels < 90% as negative', () => {
    expect(paymentRateLabel(89)).toEqual({ label: '89%', positive: false });
    expect(paymentRateLabel(0)).toEqual({ label: '0%', positive: false });
  });

  it('rounds non-integer rates in the label', () => {
    expect(paymentRateLabel(66.7)).toEqual({ label: '67%', positive: false });
  });
});
