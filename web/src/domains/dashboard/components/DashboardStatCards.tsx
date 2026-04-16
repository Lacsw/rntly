import { DollarSign, Building2, Users, TrendingUp } from 'lucide-react';
import { StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/utils';

type TDashboardStatCardsProps = {
  totalRevenue: number;
  propertyCount: number;
  tenantCount: number;
  occupancyRate: number;
};

export const DashboardStatCards = ({
  totalRevenue,
  propertyCount,
  tenantCount,
  occupancyRate,
}: TDashboardStatCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={<DollarSign size={20} aria-hidden />}
      />
      <StatCard
        label="Properties"
        value={propertyCount}
        icon={<Building2 size={20} aria-hidden />}
      />
      <StatCard
        label="Total Tenants"
        value={tenantCount}
        icon={<Users size={20} aria-hidden />}
      />
      <StatCard
        label="Occupancy Rate"
        value={`${occupancyRate}%`}
        icon={<TrendingUp size={20} aria-hidden />}
      />
    </div>
  );
};
