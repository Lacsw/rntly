import { useMemo, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import {
  useLeases,
  useLeaseStats,
  LeaseCard,
  LeaseCardSkeleton,
  CreateLeaseForm,
  LeaseStatCards,
} from '../domains/leases';
import { useProperties } from '../domains/properties';
import { useTenants } from '../domains/tenants';
import {
  Modal,
  PageHeader,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';

const SKELETON_COUNT = 6;

export const LeasesPage = () => {
  const { leases, loading: leasesLoading, error: leasesError, createLease } = useLeases();
  const { properties, loading: propsLoading } = useProperties();
  const { tenants, loading: tenantsLoading } = useTenants();
  const stats = useLeaseStats(leases);
  const [showForm, setShowForm] = useState(false);

  const propertyById = useMemo(() => {
    const map = new Map<string, (typeof properties)[number]>();
    for (const p of properties) map.set(p.id, p);
    return map;
  }, [properties]);

  const tenantById = useMemo(() => {
    const map = new Map<string, (typeof tenants)[number]>();
    for (const t of tenants) map.set(t.id, t);
    return map;
  }, [tenants]);

  const loading = leasesLoading || propsLoading || tenantsLoading;

  return (
    <div>
      <PageHeader
        title="Leases"
        subtitle="Track lease agreements between tenants and properties"
        actions={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-800 flex items-center gap-2"
          >
            <Plus size={18} aria-hidden />
            Create Lease
          </button>
        }
      />

      {leasesError && <ErrorBanner message={leasesError} />}

      <LeaseStatCards {...stats} />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Create New Lease"
        icon={<FileText className="w-6 h-6 text-stone-700" aria-hidden />}
      >
        <CreateLeaseForm
          properties={properties}
          tenants={tenants}
          onSubmit={createLease}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <LeaseCardSkeleton key={i} />
          ))}
        </div>
      ) : leases.length === 0 ? (
        <EmptyState
          title="No leases yet"
          description="Create your first lease agreement to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {leases.map((lease) => (
            <LeaseCard
              key={lease.id}
              lease={lease}
              property={propertyById.get(lease.property_id)}
              tenant={tenantById.get(lease.tenant_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeasesPage;
