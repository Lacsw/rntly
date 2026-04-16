import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  useDashboardStats,
  DashboardStatCards,
  YourPropertiesSection,
  RecentLeasesSection,
} from '../domains/dashboard';
import { useProperties } from '../domains/properties';
import { useTenants } from '../domains/tenants';
import {
  PageHeader,
  Loading,
  ErrorBanner,
} from '@/shared/components';

export const DashboardPage = () => {
  const { stats, loading, error } = useDashboardStats();
  const { properties } = useProperties();
  const { tenants } = useTenants();

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to rntly"
        actions={
          <Link
            to="/properties"
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-800 flex items-center gap-2"
          >
            <Plus size={18} aria-hidden />
            Add Property
          </Link>
        }
      />

      {error && <ErrorBanner message={error} />}

      <DashboardStatCards
        totalRevenue={stats.totalRevenue}
        propertyCount={stats.propertyCount}
        tenantCount={stats.tenantCount}
        occupancyRate={stats.occupancyRate}
      />

      <YourPropertiesSection properties={stats.recentProperties} />

      <RecentLeasesSection
        leases={stats.recentLeases}
        properties={properties}
        tenants={tenants}
      />
    </div>
  );
};

export default DashboardPage;
