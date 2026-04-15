import { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import {
  useTenants,
  useTenantStats,
  TenantCard,
  CreateTenantForm,
  TenantStatCards,
} from '../domains/tenants';
import {
  Modal,
  PageHeader,
  Loading,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';

export const TenantsPage = () => {
  const { tenants, loading, error, createTenant } = useTenants();
  const stats = useTenantStats(tenants);
  const [showForm, setShowForm] = useState(false);

  if (loading) return <Loading />;

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
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantsPage;
