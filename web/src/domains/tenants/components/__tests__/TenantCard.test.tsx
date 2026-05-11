import { render, screen, fireEvent } from '@testing-library/react';
import { TenantCard } from '../TenantCard';
import { createMockTenant } from '@/tests/msw/factories/tenant';
import { createMockLease } from '@/tests/msw/factories/lease';
import { createMockProperty } from '@/tests/msw/factories/property';

const tenant = createMockTenant();
const lease = createMockLease({ status: 'active', start_date: '2026-01-01T00:00:00Z', end_date: '2027-01-01T00:00:00Z' });
const property = createMockProperty({ address: '123 Main St' });

describe('TenantCard', () => {
  it('renders the tenant full name', () => {
    render(<TenantCard tenant={tenant} />);
    expect(screen.getByText('Alex Doe')).toBeInTheDocument();
  });

  it('renders email and phone', () => {
    render(<TenantCard tenant={tenant} />);
    expect(screen.getByText('alex@example.com')).toBeInTheDocument();
    expect(screen.getByText('555-0100')).toBeInTheDocument();
  });

  it('shows Active badge when tenant has an active lease', () => {
    render(<TenantCard tenant={tenant} leasesForStatus={[lease]} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Overdue badge when tenant has no active lease', () => {
    render(<TenantCard tenant={tenant} leasesForStatus={[]} />);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('renders property address when property is provided', () => {
    render(<TenantCard tenant={tenant} property={property} />);
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });

  it('does not render property section when no property', () => {
    render(<TenantCard tenant={tenant} />);
    expect(screen.queryByText('123 Main St')).toBeNull();
  });

  it('renders monthly rent when lease is provided', () => {
    render(<TenantCard tenant={tenant} lease={lease} leasesForStatus={[lease]} />);
    expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
  });

  it('renders payment rate when paymentRate is provided', () => {
    render(<TenantCard tenant={tenant} paymentRate={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('does not render actions button when onActions is not provided', () => {
    render(<TenantCard tenant={tenant} />);
    expect(screen.queryByRole('button', { name: /tenant actions/i })).toBeNull();
  });

  it('renders actions button when onActions is provided', () => {
    render(<TenantCard tenant={tenant} onActions={vi.fn()} />);
    expect(screen.getByRole('button', { name: /tenant actions/i })).toBeInTheDocument();
  });

  it('calls onActions when actions button is clicked', () => {
    const onActions = vi.fn();
    render(<TenantCard tenant={tenant} onActions={onActions} />);
    fireEvent.click(screen.getByRole('button', { name: /tenant actions/i }));
    expect(onActions).toHaveBeenCalledTimes(1);
  });
});
