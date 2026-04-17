import { useEffect, useState } from 'react';
import { propertiesApi, type TProperty, type TPropertyCreate, type TPropertyUpdate } from '../api';
import { toast } from '@/shared/toast';

export const useProperties = () => {
  const [properties, setProperties] = useState<TProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperties = async () => {
    setError('');
    try {
      const { data } = await propertiesApi.getAll();
      setProperties(data ?? []);
    } catch {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const createProperty = async (data: TPropertyCreate) => {
    try {
      await propertiesApi.create(data);
      await fetchProperties();
    } catch {
      toast.error('Failed to create property');
    }
  };

  const updateProperty = async (id: string, data: TPropertyUpdate) => {
    try {
      await propertiesApi.update(id, data);
      await fetchProperties();
    } catch {
      toast.error('Failed to update property');
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await propertiesApi.delete(id);
      await fetchProperties();
    } catch {
      toast.error('Failed to delete property');
    }
  };

  return { properties, loading, error, createProperty, updateProperty, deleteProperty };
};
