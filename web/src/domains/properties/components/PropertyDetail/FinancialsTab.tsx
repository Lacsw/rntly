import { EmptyState } from '@/shared/components';
import { DollarSign } from 'lucide-react';

export const FinancialsTab = () => {
  return (
    <EmptyState
      icon={<DollarSign size={32} aria-hidden />}
      title="Financials coming soon"
      description="Revenue, expense, and occupancy analytics will live here."
    />
  );
};
