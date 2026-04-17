import { apiClient } from './api';

export type TSeededProperty = {
  id: string;
  address: string;
};

export type TSeededTenant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export type TSeededLease = {
  id: string;
  property_id: string;
  tenant_id: string;
};

export const createProperty = async (overrides: Partial<{ address: string; type: string; bedrooms: number; rent_amount: number; status: string }> = {}): Promise<TSeededProperty> => {
  const payload = {
    address: overrides.address ?? `QA-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: overrides.type ?? 'apartment',
    bedrooms: overrides.bedrooms ?? 1,
    rent_amount: overrides.rent_amount ?? 1500,
    status: overrides.status ?? 'vacant',
  };
  const { data } = await apiClient.post('/properties', payload);
  return { id: data.id, address: data.address };
};

export const createTenant = async (overrides: Partial<{ first_name: string; last_name: string; email: string; phone: string }> = {}): Promise<TSeededTenant> => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const payload = {
    first_name: overrides.first_name ?? 'QA',
    last_name: overrides.last_name ?? `Tenant-${suffix}`,
    email: overrides.email ?? `qa-${suffix}@example.com`,
    phone: overrides.phone ?? '5551234567',
  };
  const { data } = await apiClient.post('/tenants', payload);
  return { id: data.id, first_name: data.first_name, last_name: data.last_name, email: data.email };
};

export const createLease = async (propertyId: string, tenantId: string, overrides: Partial<{ start_date: string; end_date: string; rent_amount: number; deposit: number }> = {}): Promise<TSeededLease> => {
  const payload = {
    property_id: propertyId,
    tenant_id: tenantId,
    start_date: overrides.start_date ?? '2026-06-01',
    end_date: overrides.end_date ?? '2027-06-01',
    rent_amount: overrides.rent_amount ?? 1500,
    deposit: overrides.deposit ?? 1500,
    status: 'active',
  };
  const { data } = await apiClient.post('/leases', payload);
  return { id: data.id, property_id: data.property_id, tenant_id: data.tenant_id };
};

export const deleteProperty = async (id: string) => {
  await apiClient.delete(`/properties/${id}`).catch(() => {});
};

export const deleteTenant = async (id: string) => {
  await apiClient.delete(`/tenants/${id}`).catch(() => {});
};

export const deleteLease = async (id: string) => {
  await apiClient.delete(`/leases/${id}`).catch(() => {});
};
