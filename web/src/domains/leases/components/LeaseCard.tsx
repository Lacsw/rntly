import { Home, User, Calendar } from 'lucide-react';
import type { TLease } from '../api';
import type { TProperty } from '@/domains/properties';
import type { TTenant } from '@/domains/tenants';
import { StatusBadge } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/utils';
import { leaseDisplayStatus, type TLeaseDisplayStatus } from '../utils/lease';

type TLeaseCardProps = {
  lease: TLease;
  property?: TProperty;
  tenant?: TTenant;
};

const STATUS_VARIANT: Record<TLeaseDisplayStatus, 'green' | 'yellow'> = {
  active: 'green',
  'ending-soon': 'yellow',
  upcoming: 'yellow',
  ended: 'yellow',
};

const STATUS_LABEL: Record<TLeaseDisplayStatus, string> = {
  active: 'Active',
  'ending-soon': 'Ending Soon',
  upcoming: 'Upcoming',
  ended: 'Ended',
};

export const LeaseCard = ({ lease, property, tenant }: TLeaseCardProps) => {
  const status = leaseDisplayStatus(lease);
  const propertyLabel = property ? property.address : 'Unknown property';
  const tenantLabel = tenant ? `${tenant.first_name} ${tenant.last_name}`.trim() : 'Unknown tenant';

  return (
    <div className="bg-white rounded-xl border border-stone-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-stone-900 font-semibold truncate">
            <Home size={14} className="text-stone-400 shrink-0" aria-hidden />
            <span className="truncate">{propertyLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-stone-500 mt-1 truncate">
            <User size={13} className="text-stone-400 shrink-0" aria-hidden />
            <span className="truncate">{tenantLabel}</span>
          </div>
        </div>
        <StatusBadge status={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-3">
        <Calendar size={13} className="text-stone-400" aria-hidden />
        <span>{formatDate(lease.start_date)} — {formatDate(lease.end_date)}</span>
      </div>

      <div className="flex items-end justify-between mt-4 pt-3 border-t border-stone-100">
        <div>
          <p className="text-xs text-stone-500">Monthly Rent</p>
          <p className="font-semibold text-stone-900">{formatCurrency(lease.rent_amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-500">Deposit</p>
          <p className="font-semibold text-stone-900">{formatCurrency(lease.deposit)}</p>
        </div>
      </div>
    </div>
  );
};
