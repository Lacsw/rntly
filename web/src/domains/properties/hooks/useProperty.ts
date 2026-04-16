import { useCallback, useEffect, useState } from 'react';
import { propertiesApi, type TProperty } from '../api';

export const useProperty = (id: string) => {
  const [property, setProperty] = useState<TProperty | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperty = useCallback(async (signal?: { cancelled: boolean }) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await propertiesApi.getById(id);
      if (!signal?.cancelled) setProperty(data);
    } catch {
      if (!signal?.cancelled) {
        setError('Failed to fetch property');
        setProperty(undefined);
      }
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setProperty(undefined);
      setLoading(false);
      return;
    }
    const signal = { cancelled: false };
    setLoading(true);
    fetchProperty(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [id, fetchProperty]);

  const refetch = useCallback(() => fetchProperty(), [fetchProperty]);

  return { property, loading, error, refetch };
};
