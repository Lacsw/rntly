import type { TLease } from '@/domains/leases';
import { leaseDisplayStatus, type TLeaseDisplayStatus } from '@/domains/leases';
import type { TTenant } from '@/domains/tenants';
import { StatusBadge, EmptyState } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/utils';

type TContractsTabProps = {
  leases: TLease[];
  tenants: TTenant[];
};

const STATUS_LABEL: Record<TLeaseDisplayStatus, string> = {
  active: 'Active',
  'ending-soon': 'Ending Soon',
  upcoming: 'Upcoming',
  ended: 'Ended',
};

const STATUS_VARIANT: Record<TLeaseDisplayStatus, 'green' | 'yellow'> = {
  active: 'green',
  'ending-soon': 'yellow',
  upcoming: 'yellow',
  ended: 'yellow',
};

export const ContractsTab = ({ leases, tenants }: TContractsTabProps) => {
  if (leases.length === 0) {
    return <EmptyState title="No leases yet" description="This property has no lease history." />;
  }

  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  return (
    <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-stone-50 text-xs text-stone-500">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Tenant</th>
            <th className="text-left px-4 py-3 font-medium">Dates</th>
            <th className="text-left px-4 py-3 font-medium">Rent</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {leases.map((lease) => {
            const tenant = tenantById.get(lease.tenant_id);
            const tenantLabel = tenant
              ? `${tenant.first_name} ${tenant.last_name}`.trim()
              : 'Unknown tenant';
            const status = leaseDisplayStatus(lease);
            return (
              <tr key={lease.id} className="border-t border-stone-100 text-sm">
                <td className="px-4 py-3 text-stone-900">{tenantLabel}</td>
                <td className="px-4 py-3 text-stone-600">
                  {formatDate(lease.start_date)} — {formatDate(lease.end_date)}
                </td>
                <td className="px-4 py-3 text-stone-900">{formatCurrency(lease.rent_amount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
