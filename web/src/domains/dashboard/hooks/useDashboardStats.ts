import { useEffect, useState } from 'react';
import {
  propertiesApi,
  type TProperty,
} from '@/domains/properties';
import { tenantsApi, type TTenant } from '@/domains/tenants';
import { leasesApi, type TLease, isActiveLease } from '@/domains/leases';

type TDashboardStats = {
  propertyCount: number;
  tenantCount: number;
  totalRevenue: number;
  occupancyRate: number;
  recentProperties: TProperty[];
  recentLeases: TLease[];
};

const EMPTY_STATS: TDashboardStats = {
  propertyCount: 0,
  tenantCount: 0,
  totalRevenue: 0,
  occupancyRate: 0,
  recentProperties: [],
  recentLeases: [],
};

const toMs = (iso: string) => new Date(iso).getTime();

export const useDashboardStats = (now: Date = new Date()) => {
  const [stats, setStats] = useState<TDashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    setLoading(true);

    Promise.all([
      propertiesApi.getAll(),
      tenantsApi.getAll(),
      leasesApi.getAll(),
    ])
      .then(([propertiesRes, tenantsRes, leasesRes]) => {
        if (cancelled) return;
        const properties: TProperty[] = propertiesRes.data;
        const tenants: TTenant[] = tenantsRes.data;
        const leases: TLease[] = leasesRes.data;

        const activeLeases = leases.filter((l) => isActiveLease(l, now));
        const totalRevenue = activeLeases.reduce((sum, l) => sum + l.rent_amount, 0);
        const occupancyRate = properties.length > 0
          ? Math.round((activeLeases.length / properties.length) * 100)
          : 0;

        const recentProperties = [...properties]
          .sort((a, b) => toMs(b.updated_at) - toMs(a.updated_at))
          .slice(0, 3);

        const recentLeases = [...leases]
          .sort((a, b) => toMs(b.start_date) - toMs(a.start_date))
          .slice(0, 5);

        setStats({
          propertyCount: properties.length,
          tenantCount: tenants.length,
          totalRevenue,
          occupancyRate,
          recentProperties,
          recentLeases,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load dashboard');
          setStats(EMPTY_STATS);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [now]);

  return { stats, loading, error };
};
