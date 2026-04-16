import { useMemo, useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import {
  useTenants,
  useTenantStats,
  TenantCard,
  CreateTenantForm,
  TenantStatCards,
} from '../domains/tenants';
import { useLeases, isActiveLease } from '../domains/leases';
import { useProperties } from '../domains/properties';
import {
  Modal,
  PageHeader,
  Loading,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';

export const TenantsPage = () => {
  const { tenants, loading: tenantsLoading, error, createTenant } = useTenants();
  const { leases, loading: leasesLoading, error: leasesError } = useLeases();
  const { properties, loading: propsLoading, error: propsError } = useProperties();
  const stats = useTenantStats(tenants, leases);
  const [showForm, setShowForm] = useState(false);

  const propertyById = useMemo(() => {
    const map = new Map<string, (typeof properties)[number]>();
    for (const p of properties) map.set(p.id, p);
    return map;
  }, [properties]);

  const activeLeaseByTenant = useMemo(() => {
    const map = new Map<string, (typeof leases)[number]>();
    for (const lease of leases) {
      if (!isActiveLease(lease)) continue;
      const current = map.get(lease.tenant_id);
      if (!current || new Date(lease.start_date) > new Date(current.start_date)) {
        map.set(lease.tenant_id, lease);
      }
    }
    return map;
  }, [leases]);

  if (tenantsLoading || leasesLoading || propsLoading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Tenants"
        subtitle="Manage tenant information and payment history"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-800 flex items-center gap-2"
          >
            <Plus size={18} aria-hidden />
            Add Tenant
          </button>
        }
      />

      {error && <ErrorBanner message={error} />}
      {leasesError && <ErrorBanner message={leasesError} />}
      {propsError && <ErrorBanner message={propsError} />}

      <TenantStatCards {...stats} />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Tenant"
        icon={<UserPlus className="w-6 h-6 text-stone-700" aria-hidden />}
      >
        <CreateTenantForm onSubmit={createTenant} onCancel={() => setShowForm(false)} />
      </Modal>

      {tenants.length === 0 ? (
        <EmptyState
          title="No tenants yet"
          description="Add your first tenant to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tenants.map((tenant) => {
            const lease = activeLeaseByTenant.get(tenant.id);
            const property = lease ? propertyById.get(lease.property_id) : undefined;
            return (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                lease={lease}
                property={property}
                leasesForStatus={leases}
                paymentRate={lease ? 100 : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TenantsPage;
