import { useCallback, useEffect, useState } from 'react';
import { leasesApi, type TLease } from '../api';

export const useLeasesByProperty = (propertyId: string) => {
  const [leases, setLeases] = useState<TLease[]>([]);
  const [loading, setLoading] = useState(() => Boolean(propertyId));
  const [error, setError] = useState('');

  const fetchLeases = useCallback(async (id: string, signal: { cancelled: boolean }) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await leasesApi.listByProperty(id);
      if (!signal.cancelled) setLeases(data);
    } catch {
      if (!signal.cancelled) {
        setError('Failed to fetch leases');
        setLeases([]);
      }
    } finally {
      if (!signal.cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    const signal = { cancelled: false };
    fetchLeases(propertyId, signal);

    return () => {
      signal.cancelled = true;
    };
  }, [propertyId, fetchLeases]);

  return { leases, loading, error };
};
