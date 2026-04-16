import type { TLease } from '@/domains/leases';
import { isActiveLease } from '@/domains/leases';
import { TenantCard } from '@/domains/tenants';
import type { TTenant } from '@/domains/tenants';
import { EmptyState } from '@/shared/components';

type TTenantTabProps = {
  leases: TLease[];
  tenants: TTenant[];
};

export const TenantTab = ({ leases, tenants }: TTenantTabProps) => {
  const activeLease = leases.find((l) => isActiveLease(l));
  const tenant = activeLease ? tenants.find((t) => t.id === activeLease.tenant_id) : undefined;

  if (!activeLease || !tenant) {
    return (
      <EmptyState
        title="No active tenant"
        description="This property does not have an active lease right now."
      />
    );
  }

  return (
    <div className="max-w-md">
      <TenantCard
        tenant={tenant}
        lease={activeLease}
        leasesForStatus={leases}
      />
    </div>
  );
};
