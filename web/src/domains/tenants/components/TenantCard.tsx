import { Mail, Phone, Home, MoreVertical } from 'lucide-react';
import type { TTenant } from '../api';
import type { TLease } from '@/domains/leases/api/types';
import type { TProperty } from '@/domains/properties';
import { StatusBadge } from '@/shared/components';
import { formatCurrency, formatDate, initials } from '@/shared/utils';
import { fullName, isActiveTenant, paymentRateLabel } from '../utils/tenant';

type TTenantCardProps = {
  tenant: TTenant;
  lease?: TLease;
  property?: TProperty;
  leasesForStatus?: TLease[];
  paymentRate?: number;
  onActions?: () => void;
};

export const TenantCard = ({
  tenant,
  lease,
  property,
  leasesForStatus,
  paymentRate,
  onActions,
}: TTenantCardProps) => {
  const active = leasesForStatus
    ? isActiveTenant(tenant, leasesForStatus)
    : lease?.status === 'active';
  const statusLabel = active ? 'Active' : 'Overdue';
  const statusVariant = active ? 'green' : 'yellow';
  const payment = paymentRate !== undefined ? paymentRateLabel(paymentRate) : null;

  return (
    <div className="bg-white rounded-xl border border-stone-100 p-5 relative">
      {onActions && (
        <button
          onClick={onActions}
          aria-label="Tenant actions"
          className="absolute top-3 right-3 p-1.5 hover:bg-stone-100 rounded-full"
        >
          <MoreVertical size={16} aria-hidden />
        </button>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 font-medium">
          {initials(tenant.first_name, tenant.last_name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">{fullName(tenant)}</h3>
          <StatusBadge status={statusLabel} variant={statusVariant} />
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-stone-600">
        <div className="flex items-center gap-2 min-w-0">
          <Mail size={14} className="text-stone-400 shrink-0" aria-hidden />
          <span className="truncate">{tenant.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-stone-400 shrink-0" aria-hidden />
          <span>{tenant.phone}</span>
        </div>
        {property && (
          <div className="flex items-center gap-2 min-w-0">
            <Home size={14} className="text-stone-400 shrink-0" aria-hidden />
            <span className="truncate">{property.name ?? property.address}</span>
          </div>
        )}
      </div>

      {lease && (
        <p className="text-xs text-stone-500 mt-3">
          {formatDate(lease.start_date)} — {formatDate(lease.end_date)}
        </p>
      )}

      {(lease || payment) && (
        <div className="flex items-end justify-between mt-4 pt-3 border-t border-stone-100">
          {lease && (
            <div>
              <p className="text-xs text-stone-500">Monthly Rent</p>
              <p className="font-semibold text-stone-900">{formatCurrency(lease.rent_amount)}</p>
            </div>
          )}
          {payment && (
            <div className="text-right">
              <p className="text-xs text-stone-500">Payment Rate</p>
              <p
                className={`font-semibold ${
                  payment.positive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {payment.label}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
