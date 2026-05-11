import { render, screen } from '@testing-library/react';
import { TenantStatCards } from '../TenantStatCards';

describe('TenantStatCards', () => {
  const props = { totalTenants: 5, monthlyRevenue: 7500, onTimePayments: 4, overduePayments: 1 };

  it('renders Total Tenants count', () => {
    render(<TenantStatCards {...props} />);
    expect(screen.getByText('Total Tenants')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders Monthly Revenue formatted as currency', () => {
    render(<TenantStatCards {...props} />);
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText(/\$7,500/)).toBeInTheDocument();
  });

  it('renders On-Time Payments count', () => {
    render(<TenantStatCards {...props} />);
    expect(screen.getByText('On-Time Payments')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders Overdue Payments count', () => {
    render(<TenantStatCards {...props} />);
    expect(screen.getByText('Overdue Payments')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
