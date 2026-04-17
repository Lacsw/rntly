import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
  it('renders the default label', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders a custom label when provided', () => {
    render(<Loading label="Fetching properties" />);
    expect(screen.getByText('Fetching properties')).toBeInTheDocument();
  });

  it('exposes a polite live region for assistive tech', () => {
    render(<Loading label="Fetching" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Fetching');
  });
});
