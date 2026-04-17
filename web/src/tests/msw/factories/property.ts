import type { TProperty } from '@/domains/properties';

export const createMockProperty = (overrides: Partial<TProperty> = {}): TProperty => ({
  id: 'p1',
  address: '123 Main St',
  type: 'apartment',
  bedrooms: 2,
  rent_amount: 1500,
  status: 'available',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});
