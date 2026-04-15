import { useEffect, useState } from 'react';
import { leasesApi, type TLease } from '../api';

export const useLeasesByTenant = (tenantId: string) => {
  const [leases, setLeases] = useState<TLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tenantId) {
      setLeases([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError('');
    setLoading(true);

    leasesApi
      .listByTenant(tenantId)
      .then(({ data }) => {
        if (!cancelled) setLeases(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to fetch leases');
          setLeases([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  return { leases, loading, error };
};
