import api from '../client';
import type { TProperty, TPropertyCreate, TPropertyUpdate } from './types';

export const propertiesApi = {
  getAll: () => 
    api.get<TProperty[]>('/properties'),

  getById: (id: string) => 
    api.get<TProperty>(`/properties/${id}`),

  create: (data: TPropertyCreate) => 
    api.post<TProperty>('/properties', data),

  update: (id: string, data: TPropertyUpdate) => 
    api.put<TProperty>(`/properties/${id}`, data),

  delete: (id: string) => 
    api.delete(`/properties/${id}`),
};