import { useMemo } from 'react';
import type { TTenant } from '../api';
import type { TLease } from '@/domains/leases/api/types';
import { isActiveTenant } from '../utils/tenant';

type TTenantStats = {
  activeTenants: number;
  monthlyRevenue: number;
  onTimePayments: number;
  overduePayments: number;
};

export const useTenantStats = (
  tenants: TTenant[],
  leases: TLease[] = [],
  now: Date = new Date(),
): TTenantStats => {
  return useMemo(() => {
    const activeTenants = tenants.filter((t) => isActiveTenant(t, leases, now)).length;

    const nowMs = now.getTime();
    const monthlyRevenue = leases.reduce((sum, lease) => {
      if (lease.status !== 'active') return sum;
      const start = new Date(lease.start_date).getTime();
      const end = new Date(lease.end_date).getTime();
      if (start > nowMs || nowMs > end) return sum;
      return sum + lease.rent_amount;
    }, 0);

    return {
      activeTenants,
      monthlyRevenue,
      onTimePayments: activeTenants,
      overduePayments: 0,
    };
  }, [tenants, leases, now]);
};
