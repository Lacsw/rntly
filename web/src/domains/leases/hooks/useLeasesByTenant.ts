import { useCallback, useEffect, useState } from 'react';
import { leasesApi, type TLease } from '../api';

export const useLeasesByTenant = (tenantId: string) => {
  const [leases, setLeases] = useState<TLease[]>([]);
  const [loading, setLoading] = useState(() => Boolean(tenantId));
  const [error, setError] = useState('');

  const fetchLeases = useCallback(async (id: string, signal: { cancelled: boolean }) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await leasesApi.listByTenant(id);
      if (!signal.cancelled) setLeases(data ?? []);
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
    if (!tenantId) {
      return;
    }

    const signal = { cancelled: false };
    fetchLeases(tenantId, signal);

    return () => {
      signal.cancelled = true;
    };
  }, [tenantId, fetchLeases]);

  return { leases, loading, error };
};
