import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { TLease } from '@/domains/leases';
import { leaseDisplayStatus, type TLeaseDisplayStatus } from '@/domains/leases';
import type { TProperty } from '@/domains/properties';
import type { TTenant } from '@/domains/tenants';
import { StatusBadge, EmptyState } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/utils';

type TRecentLeasesSectionProps = {
  leases: TLease[];
  properties: TProperty[];
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

export const RecentLeasesSection = ({ leases, properties, tenants }: TRecentLeasesSectionProps) => {
  const propertyById = new Map(properties.map((p) => [p.id, p]));
  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900">Recent Leases</h2>
        <Link
          to="/leases"
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900"
        >
          View All
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
      {leases.length === 0 ? (
        <EmptyState title="No leases yet" description="Lease activity will appear here." />
      ) : (
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Property</th>
                <th className="text-left px-4 py-3 font-medium">Tenant</th>
                <th className="text-left px-4 py-3 font-medium">Start</th>
                <th className="text-left px-4 py-3 font-medium">Rent</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leases.map((lease) => {
                const property = propertyById.get(lease.property_id);
                const tenant = tenantById.get(lease.tenant_id);
                const propertyLabel = property ? property.address : 'Unknown property';
                const tenantLabel = tenant
                  ? `${tenant.first_name} ${tenant.last_name}`.trim()
                  : 'Unknown tenant';
                const status = leaseDisplayStatus(lease);
                return (
                  <tr key={lease.id} className="border-t border-stone-100 text-sm">
                    <td className="px-4 py-3 text-stone-900">{propertyLabel}</td>
                    <td className="px-4 py-3 text-stone-600">{tenantLabel}</td>
                    <td className="px-4 py-3 text-stone-600">{formatDate(lease.start_date)}</td>
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
      )}
    </section>
  );
};
