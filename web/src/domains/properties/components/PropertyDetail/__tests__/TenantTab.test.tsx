import { render, screen } from '@testing-library/react';
import { TenantTab } from '../TenantTab';
import { createMockLease } from '@/tests/msw/factories/lease';
import { createMockTenant } from '@/tests/msw/factories/tenant';

const tenant = createMockTenant({ id: 't1', first_name: 'Alex', last_name: 'Doe' });
const activeLease = createMockLease({ tenant_id: 't1', status: 'active' });

describe('TenantTab', () => {
  it('shows empty state when there are no leases', () => {
    render(<TenantTab leases={[]} tenants={[tenant]} />);
    expect(screen.getByText('No active tenant')).toBeInTheDocument();
  });

  it('shows empty state when lease tenant is not in tenants list', () => {
    render(<TenantTab leases={[activeLease]} tenants={[]} />);
    expect(screen.getByText('No active tenant')).toBeInTheDocument();
  });

  it('renders tenant card when active lease and matching tenant exist', () => {
    render(<TenantTab leases={[activeLease]} tenants={[tenant]} />);
    expect(screen.getByText('Alex Doe')).toBeInTheDocument();
  });

  it('does not render tenant card for ended lease', () => {
    const ended = createMockLease({ tenant_id: 't1', status: 'ended', end_date: '2020-01-01T00:00:00Z' });
    render(<TenantTab leases={[ended]} tenants={[tenant]} />);
    expect(screen.getByText('No active tenant')).toBeInTheDocument();
  });
});
