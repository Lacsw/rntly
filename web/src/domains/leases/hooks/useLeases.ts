import { useEffect, useState } from 'react';
import { leasesApi, type TLease, type TLeaseCreate, type TLeaseUpdate } from '../api';

export const useLeases = () => {
  const [leases, setLeases] = useState<TLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeases = async () => {
    setError('');
    try {
      const { data } = await leasesApi.getAll();
      setLeases(data);
    } catch {
      setError('Failed to fetch leases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const createLease = async (data: TLeaseCreate) => {
    try {
      await leasesApi.create(data);
      await fetchLeases();
    } catch {
      setError('Failed to create lease');
    }
  };

  const updateLease = async (id: string, data: TLeaseUpdate) => {
    try {
      await leasesApi.update(id, data);
      await fetchLeases();
    } catch {
      setError('Failed to update lease');
    }
  };

  const deleteLease = async (id: string) => {
    try {
      await leasesApi.delete(id);
      await fetchLeases();
    } catch {
      setError('Failed to delete lease');
    }
  };

  return { leases, loading, error, createLease, updateLease, deleteLease };
};
