import { Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/utils';

type TTenantStatCardsProps = {
  totalTenants: number;
  monthlyRevenue: number;
  onTimePayments: number;
  overduePayments: number;
};

export const TenantStatCards = ({
  totalTenants,
  monthlyRevenue,
  onTimePayments,
  overduePayments,
}: TTenantStatCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Tenants"
        value={totalTenants}
        icon={<Users size={20} aria-hidden />}
      />
      <StatCard
        label="Monthly Revenue"
        value={formatCurrency(monthlyRevenue)}
        icon={<DollarSign size={20} aria-hidden />}
      />
      <StatCard
        label="On-Time Payments"
        value={onTimePayments}
        icon={<CheckCircle size={20} aria-hidden />}
      />
      <StatCard
        label="Overdue Payments"
        value={overduePayments}
        icon={<AlertCircle size={20} aria-hidden />}
      />
    </div>
  );
};
