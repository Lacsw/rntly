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
  ErrorBanner,
  StatCardSkeleton,
  Skeleton,
} from '@/shared/components';

export const DashboardPage = () => {
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { properties, loading: propsLoading, error: propsError } = useProperties();
  const { tenants, loading: tenantsLoading, error: tenantsError } = useTenants();

  const loading = statsLoading || propsLoading || tenantsLoading;

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

      {statsError && <ErrorBanner message={statsError} />}
      {propsError && <ErrorBanner message={propsError} />}
      {tenantsError && <ErrorBanner message={tenantsError} />}

      {loading ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="mb-8">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="bg-white rounded-xl border border-stone-100 p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default DashboardPage;
