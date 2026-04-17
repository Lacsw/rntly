import type { TTenant } from '@/domains/tenants';

export const createMockTenant = (overrides: Partial<TTenant> = {}): TTenant => ({
  id: 't1',
  first_name: 'Alex',
  last_name: 'Doe',
  email: 'alex@example.com',
  phone: '555-0100',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});
