import { render, screen } from '@testing-library/react';
import { FinancialsTab } from '../FinancialsTab';

describe('FinancialsTab', () => {
  it('renders the coming-soon message', () => {
    render(<FinancialsTab />);
    expect(screen.getByText('Financials coming soon')).toBeInTheDocument();
  });
});
