import type { TLease } from '@/domains/leases';

export const createMockLease = (overrides: Partial<TLease> = {}): TLease => ({
  id: 'l1',
  property_id: 'p1',
  tenant_id: 't1',
  start_date: '2026-01-01T00:00:00Z',
  end_date: '2027-01-01T00:00:00Z',
  rent_amount: 1500,
  deposit: 1500,
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});
