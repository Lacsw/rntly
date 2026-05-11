import { render, screen } from '@testing-library/react';
import { LeaseCard } from '../LeaseCard';
import { createMockLease } from '@/tests/msw/factories/lease';
import { createMockProperty } from '@/tests/msw/factories/property';
import { createMockTenant } from '@/tests/msw/factories/tenant';

const lease = createMockLease({ rent_amount: 1500, deposit: 1500, status: 'active' });
const property = createMockProperty({ address: '99 Oak Lane' });
const tenant = createMockTenant({ first_name: 'Alex', last_name: 'Doe' });

describe('LeaseCard', () => {
  it('renders property address when property is provided', () => {
    render(<LeaseCard lease={lease} property={property} />);
    expect(screen.getByText('99 Oak Lane')).toBeInTheDocument();
  });

  it('renders "Unknown property" when no property is provided', () => {
    render(<LeaseCard lease={lease} />);
    expect(screen.getByText('Unknown property')).toBeInTheDocument();
  });

  it('renders tenant name when tenant is provided', () => {
    render(<LeaseCard lease={lease} tenant={tenant} />);
    expect(screen.getByText('Alex Doe')).toBeInTheDocument();
  });

  it('renders "Unknown tenant" when no tenant is provided', () => {
    render(<LeaseCard lease={lease} />);
    expect(screen.getByText('Unknown tenant')).toBeInTheDocument();
  });

  it('renders monthly rent', () => {
    render(<LeaseCard lease={lease} />);
    expect(screen.getAllByText(/\$1,500/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders deposit', () => {
    render(<LeaseCard lease={lease} />);
    expect(screen.getAllByText(/\$1,500/)).toHaveLength(2);
  });

  it('renders Active status badge for active lease', () => {
    render(<LeaseCard lease={lease} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Ended badge for ended lease', () => {
    const ended = createMockLease({ status: 'ended', end_date: '2020-01-01T00:00:00Z' });
    render(<LeaseCard lease={ended} />);
    expect(screen.getByText('Ended')).toBeInTheDocument();
  });
});
