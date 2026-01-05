import api from '../client';
import type { TTenant, TTenantCreate, TTenantUpdate } from './types';

export const tenantsApi = {
  getAll: () =>
    api.get<TTenant[]>('/tenants'),

  getById: (id: string) =>
    api.get<TTenant>(`/tenants/${id}`),

  create: (data: TTenantCreate) =>
    api.post<TTenant>('/tenants', data),

  update: (id: string, data: TTenantUpdate) =>
    api.put<TTenant>(`/tenants/${id}`, data),

  delete: (id: string) =>
    api.delete(`/tenants/${id}`),
};
