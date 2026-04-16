import { EmptyState } from '@/shared/components';
import { Wrench } from 'lucide-react';

export const MaintenanceTab = () => {
  return (
    <EmptyState
      icon={<Wrench size={32} aria-hidden />}
      title="Maintenance coming soon"
      description="Work orders and request tracking will live here."
    />
  );
};
