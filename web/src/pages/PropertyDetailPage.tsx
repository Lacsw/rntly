import { useParams, useSearchParams } from 'react-router-dom';
import {
  useProperty,
  PropertyDetailHeader,
  PropertyDetailHero,
  PropertyInfoCards,
  OverviewTab,
  TenantTab,
  ContractsTab,
  FinancialsTab,
  MaintenanceTab,
} from '../domains/properties';
import { useLeasesByProperty } from '../domains/leases';
import { useTenants } from '../domains/tenants';
import {
  DetailTabs,
  Loading,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';

const DEFAULT_TAB = 'overview';

export const PropertyDetailPage = () => {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? DEFAULT_TAB;

  const { property, loading: propertyLoading, error: propertyError } = useProperty(id);
  const { leases, loading: leasesLoading, error: leasesError } = useLeasesByProperty(id);
  const { tenants, loading: tenantsLoading, error: tenantsError } = useTenants();

  const handleTabChange = (tabId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabId);
    setSearchParams(next, { replace: true });
  };

  if (propertyLoading || leasesLoading || tenantsLoading) return <Loading />;

  if (propertyError) return <ErrorBanner message={propertyError} />;

  if (!property) {
    return (
      <EmptyState
        title="Property not found"
        description="This property may have been deleted."
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab property={property} /> },
    { id: 'tenant', label: 'Tenant', content: <TenantTab leases={leases} tenants={tenants} /> },
    { id: 'contracts', label: 'Contracts', content: <ContractsTab leases={leases} tenants={tenants} /> },
    { id: 'financials', label: 'Financials', content: <FinancialsTab /> },
    { id: 'maintenance', label: 'Maintenance', content: <MaintenanceTab /> },
  ];

  return (
    <div>
      <PropertyDetailHeader property={property} />
      {leasesError && <ErrorBanner message={leasesError} />}
      {tenantsError && <ErrorBanner message={tenantsError} />}
      <PropertyDetailHero property={property} />
      <PropertyInfoCards property={property} />
      <DetailTabs tabs={tabs} activeId={activeTab} onChange={handleTabChange} />
    </div>
  );
};

export default PropertyDetailPage;
