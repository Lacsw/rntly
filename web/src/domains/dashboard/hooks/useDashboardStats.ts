import { useEffect, useReducer, useState } from 'react';
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

type TState = {
  stats: TDashboardStats;
  loading: boolean;
  error: string;
};

type TAction =
  | { type: 'fetching' }
  | { type: 'success'; stats: TDashboardStats }
  | { type: 'error' };

const INITIAL_STATE: TState = { stats: EMPTY_STATS, loading: true, error: '' };

function reducer(_state: TState, action: TAction): TState {
  switch (action.type) {
    case 'fetching':
      return { stats: EMPTY_STATS, loading: true, error: '' };
    case 'success':
      return { stats: action.stats, loading: false, error: '' };
    case 'error':
      return { stats: EMPTY_STATS, loading: false, error: 'Failed to load dashboard' };
  }
}

const toMs = (iso: string) => new Date(iso).getTime();

export const useDashboardStats = (nowInput?: Date) => {
  const [now] = useState<Date>(() => nowInput ?? new Date());
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'fetching' });

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
        const occupiedPropertyIds = new Set(activeLeases.map((l) => l.property_id));
        const occupancyRate = properties.length > 0
          ? Math.round((occupiedPropertyIds.size / properties.length) * 100)
          : 0;

        const recentProperties = [...properties]
          .sort((a, b) => toMs(b.updated_at) - toMs(a.updated_at))
          .slice(0, 3);

        const recentLeases = [...leases]
          .sort((a, b) => toMs(b.start_date) - toMs(a.start_date))
          .slice(0, 5);

        dispatch({
          type: 'success',
          stats: {
            propertyCount: properties.length,
            tenantCount: tenants.length,
            totalRevenue,
            occupancyRate,
            recentProperties,
            recentLeases,
          },
        });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [now]);

  return { stats: state.stats, loading: state.loading, error: state.error };
};
