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
});
