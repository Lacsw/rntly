import type { TTenant } from '../api';
import type { TLease } from '@/domains/leases/api/types';

export const fullName = (t: TTenant): string => {
  return `${t.first_name} ${t.last_name}`.trim();
};

export const isActiveTenant = (
  tenant: TTenant,
  leases: TLease[],
  now: Date = new Date(),
): boolean => {
  const nowMs = now.getTime();
  return leases.some((lease) => {
    if (lease.tenant_id !== tenant.id) return false;
    if (lease.status !== 'active') return false;
    const start = new Date(lease.start_date).getTime();
    const end = new Date(lease.end_date).getTime();
    return start <= nowMs && nowMs <= end;
  });
};

type TPaymentRateLabel = {
  label: string;
  positive: boolean;
};

export const paymentRateLabel = (rate: number): TPaymentRateLabel => {
  const rounded = Math.round(rate);
  return {
    label: `${rounded}%`,
    positive: rounded >= 90,
  };
};
