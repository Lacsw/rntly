import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useProperty,
  useProperties,
  EditPropertyForm,
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
  Modal,
  ConfirmDialog,
} from '@/shared/components';

const DEFAULT_TAB = 'overview';

export const PropertyDetailPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? DEFAULT_TAB;

  const {
    property,
    loading: propertyLoading,
    error: propertyError,
    notFound: propertyNotFound,
    refetch,
  } = useProperty(id);
  const { leases, loading: leasesLoading, error: leasesError } = useLeasesByProperty(id);
  const { tenants, loading: tenantsLoading, error: tenantsError } = useTenants();
  const { updateProperty, deleteProperty, error: propertiesError } = useProperties();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleTabChange = (tabId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tabId);
    setSearchParams(next, { replace: true });
  };

  if (propertyLoading || leasesLoading || tenantsLoading) return <Loading />;

  if (propertyNotFound) {
    return (
      <EmptyState
        title="Property not found"
        description="This property may have been deleted or the link is incorrect."
      />
    );
  }

  if (propertyError) return <ErrorBanner message={propertyError} />;

  if (!property) {
    return <EmptyState title="Property not found" description="This property may have been deleted." />;
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
      <PropertyDetailHeader
        property={property}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 border border-stone-200 px-3 py-1.5 rounded text-sm hover:bg-stone-50"
            >
              <Pencil size={14} aria-hidden />
              Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              aria-label="Delete property"
              className="flex items-center gap-1.5 border border-red-200 text-red-700 px-3 py-1.5 rounded text-sm hover:bg-red-50"
            >
              <Trash2 size={14} aria-hidden />
              Delete
            </button>
          </div>
        }
      />
      {leasesError && <ErrorBanner message={leasesError} />}
      {tenantsError && <ErrorBanner message={tenantsError} />}
      {propertiesError && <ErrorBanner message={propertiesError} />}
      <PropertyDetailHero property={property} />
      <PropertyInfoCards property={property} />
      <DetailTabs tabs={tabs} activeId={activeTab} onChange={handleTabChange} />

      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Property"
        icon={<Pencil className="w-6 h-6 text-stone-700" aria-hidden />}
      >
        <EditPropertyForm
          initial={property}
          onSubmit={async (data) => {
            await updateProperty(property.id, data);
            await refetch();
          }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      <ConfirmDialog
        open={showDelete}
        title="Delete property"
        message={`Are you sure you want to delete ${property.address}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await deleteProperty(property.id);
          setShowDelete(false);
          navigate('/properties');
        }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default PropertyDetailPage;
