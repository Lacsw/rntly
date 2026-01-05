import api from '../client';
import type { TLease, TLeaseCreate, TLeaseUpdate } from './types';

export const leasesApi = {
  getAll: () =>
    api.get<TLease[]>('/leases'),

  getById: (id: string) =>
    api.get<TLease>(`/leases/${id}`),

  create: (data: TLeaseCreate) =>
    api.post<TLease>('/leases', data),

  update: (id: string, data: TLeaseUpdate) =>
    api.put<TLease>(`/leases/${id}`, data),

  delete: (id: string) =>
    api.delete(`/leases/${id}`),
};
