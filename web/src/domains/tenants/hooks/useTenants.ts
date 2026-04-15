import { useEffect, useState } from 'react';
import { tenantsApi, type TTenant, type TTenantCreate } from '../api';

export const useTenants = () => {
  const [tenants, setTenants] = useState<TTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTenants = async () => {
    setError('');
    try {
      const { data } = await tenantsApi.getAll();
      setTenants(data);
    } catch {
      setError('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const createTenant = async (data: TTenantCreate) => {
    try {
      await tenantsApi.create(data);
      await fetchTenants();
    } catch {
      setError('Failed to create tenant');
    }
  };

  const deleteTenant = async (id: string) => {
    try {
      await tenantsApi.delete(id);
      await fetchTenants();
    } catch {
      setError('Failed to delete tenant');
    }
  };

  return { tenants, loading, error, createTenant, deleteTenant };
};
