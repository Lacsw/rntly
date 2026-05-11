import { render, screen } from '@testing-library/react';
import { ContractsTab } from '../ContractsTab';
import { createMockLease } from '@/tests/msw/factories/lease';
import { createMockTenant } from '@/tests/msw/factories/tenant';

const tenant = createMockTenant({ id: 't1', first_name: 'Alex', last_name: 'Doe' });
const lease = createMockLease({ tenant_id: 't1', rent_amount: 1200, status: 'active' });

describe('ContractsTab', () => {
  it('shows empty state when there are no leases', () => {
    render(<ContractsTab leases={[]} tenants={[]} />);
    expect(screen.getByText('No leases yet')).toBeInTheDocument();
  });

  it('renders table column headers when leases are present', () => {
    render(<ContractsTab leases={[lease]} tenants={[tenant]} />);
    expect(screen.getByText('Tenant')).toBeInTheDocument();
    expect(screen.getByText('Dates')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders tenant name when tenant matches lease', () => {
    render(<ContractsTab leases={[lease]} tenants={[tenant]} />);
    expect(screen.getByText('Alex Doe')).toBeInTheDocument();
  });

  it('renders "Unknown tenant" when tenant is not in list', () => {
    render(<ContractsTab leases={[lease]} tenants={[]} />);
    expect(screen.getByText('Unknown tenant')).toBeInTheDocument();
  });

  it('renders formatted rent amount', () => {
    render(<ContractsTab leases={[lease]} tenants={[tenant]} />);
    expect(screen.getByText(/\$1,200/)).toBeInTheDocument();
  });

  it('renders Active status badge for active lease', () => {
    render(<ContractsTab leases={[lease]} tenants={[tenant]} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Ended status badge for ended lease', () => {
    const ended = createMockLease({ tenant_id: 't1', status: 'ended', end_date: '2020-01-01T00:00:00Z' });
    render(<ContractsTab leases={[ended]} tenants={[tenant]} />);
    expect(screen.getByText('Ended')).toBeInTheDocument();
  });
});
