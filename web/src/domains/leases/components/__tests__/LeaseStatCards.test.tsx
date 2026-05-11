import { render, screen } from '@testing-library/react';
import { LeaseStatCards } from '../LeaseStatCards';

describe('LeaseStatCards', () => {
  const props = { activeLeases: 4, endingSoon: 1, totalMonthlyRent: 6000, ended: 2 };

  it('renders Active Leases count', () => {
    render(<LeaseStatCards {...props} />);
    expect(screen.getByText('Active Leases')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders Ending Soon count', () => {
    render(<LeaseStatCards {...props} />);
    expect(screen.getByText('Ending Soon')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders Total Monthly Rent formatted as currency', () => {
    render(<LeaseStatCards {...props} />);
    expect(screen.getByText('Total Monthly Rent')).toBeInTheDocument();
    expect(screen.getByText(/\$6,000/)).toBeInTheDocument();
  });

  it('renders Ended count', () => {
    render(<LeaseStatCards {...props} />);
    expect(screen.getByText('Ended')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
