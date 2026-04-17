import { useCallback, useEffect, useState } from 'react';
import { propertiesApi, type TProperty } from '../api';

const is404 = (err: unknown): boolean => {
  if (typeof err !== 'object' || err === null) return false;
  const response = (err as { response?: { status?: number } }).response;
  return response?.status === 404;
};

export const useProperty = (id: string) => {
  const [property, setProperty] = useState<TProperty | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const fetchProperty = useCallback(async (signal?: { cancelled: boolean }) => {
    setLoading(true);
    setError('');
    setNotFound(false);
    try {
      const { data } = await propertiesApi.getById(id);
      if (!signal?.cancelled) setProperty(data);
    } catch (err) {
      if (!signal?.cancelled) {
        if (is404(err)) {
          setNotFound(true);
        } else {
          setError('Failed to fetch property');
        }
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

  return { property, loading, error, notFound, refetch };
};
