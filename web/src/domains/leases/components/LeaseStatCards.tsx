import { FileText, Clock, DollarSign, Archive } from 'lucide-react';
import { StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/utils';

type TLeaseStatCardsProps = {
  activeLeases: number;
  endingSoon: number;
  totalMonthlyRent: number;
  ended: number;
};

export const LeaseStatCards = ({
  activeLeases,
  endingSoon,
  totalMonthlyRent,
  ended,
}: TLeaseStatCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Active Leases"
        value={activeLeases}
        icon={<FileText size={20} aria-hidden />}
      />
      <StatCard
        label="Ending Soon"
        value={endingSoon}
        icon={<Clock size={20} aria-hidden />}
      />
      <StatCard
        label="Total Monthly Rent"
        value={formatCurrency(totalMonthlyRent)}
        icon={<DollarSign size={20} aria-hidden />}
      />
      <StatCard
        label="Ended"
        value={ended}
        icon={<Archive size={20} aria-hidden />}
      />
    </div>
  );
};
