import { useMemo, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  useLeases,
  useLeaseStats,
  LeaseCard,
  LeaseCardSkeleton,
  CreateLeaseForm,
  LeaseStatCards,
  leaseDisplayStatus,
} from '../domains/leases';
import { useProperties } from '../domains/properties';
import { useTenants } from '../domains/tenants';
import {
  Modal,
  PageHeader,
  ErrorBanner,
  EmptyState,
  SearchBar,
} from '@/shared/components';

const SKELETON_COUNT = 6;

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'ended', label: 'Ended' },
] as const;

type TStatusFilter = (typeof STATUS_FILTERS)[number]['value'];

export const LeasesPage = () => {
  const { leases, loading: leasesLoading, error: leasesError, createLease } = useLeases();
  const { properties, loading: propsLoading } = useProperties();
  const { tenants, loading: tenantsLoading } = useTenants();
  const stats = useLeaseStats(leases);
  const [showForm, setShowForm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const statusFilter = (searchParams.get('status') ?? 'all') as TStatusFilter;

  const setQuery = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('q', value);
        else next.delete('q');
        return next;
      },
      { replace: true },
    );
  };

  const setStatusFilter = (value: TStatusFilter) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === 'all') next.delete('status');
        else next.set('status', value);
        return next;
      },
      { replace: true },
    );
  };

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

  const filtered = useMemo(() => {
    return leases.filter((lease) => {
      if (statusFilter !== 'all' && leaseDisplayStatus(lease) !== statusFilter) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const property = propertyById.get(lease.property_id);
        const tenant = tenantById.get(lease.tenant_id);
        const propertyMatch = property?.address.toLowerCase().includes(q) ?? false;
        const tenantMatch = tenant
          ? `${tenant.first_name} ${tenant.last_name}`.toLowerCase().includes(q)
          : false;
        if (!propertyMatch && !tenantMatch) return false;
      }

      return true;
    });
  }, [leases, statusFilter, query, propertyById, tenantById]);

  const loading = leasesLoading || propsLoading || tenantsLoading;
  const isFiltered = query.trim() !== '' || statusFilter !== 'all';

  return (
    <div>
      <PageHeader
        title="Leases"
        subtitle="Track lease agreements between tenants and properties"
        actions={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded hover:bg-stone-800 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-1"
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
      ) : (
        <>
          {leases.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search by property or tenant…"
                />
              </div>
              <div className="flex gap-1" role="group" aria-label="Filter by status">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setStatusFilter(f.value)}
                    aria-pressed={statusFilter === f.value}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === f.value
                        ? 'bg-stone-900 text-white'
                        : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && leases.length > 0 ? (
            <EmptyState
              title={query ? `No results for "${query}"` : `No ${statusFilter} leases`}
              description="Try adjusting your search or filter."
              action={
                isFiltered ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setStatusFilter('all');
                    }}
                    className="text-sm text-orange-700 hover:underline"
                  >
                    Clear filters
                  </button>
                ) : undefined
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No leases yet"
              description="Create your first lease agreement to get started."
            />
          ) : (
            <>
              {isFiltered && (
                <p className="text-sm text-stone-500 mb-4">
                  Showing {filtered.length} of {leases.length} leases
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((lease) => (
                  <LeaseCard
                    key={lease.id}
                    lease={lease}
                    property={propertyById.get(lease.property_id)}
                    tenant={tenantById.get(lease.tenant_id)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LeasesPage;
