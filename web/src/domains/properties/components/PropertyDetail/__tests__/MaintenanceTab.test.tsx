import { render, screen } from '@testing-library/react';
import { MaintenanceTab } from '../MaintenanceTab';

describe('MaintenanceTab', () => {
  it('renders the coming-soon message', () => {
    render(<MaintenanceTab />);
    expect(screen.getByText('Maintenance coming soon')).toBeInTheDocument();
  });
});
