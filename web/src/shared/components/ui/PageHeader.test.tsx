import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageHeader } from './PageHeader';

const wrap = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('PageHeader', () => {
  it('renders the title', () => {
    wrap(<PageHeader title="Properties" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Properties' })).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    wrap(<PageHeader title="Properties" subtitle="Manage your rentals" />);
    expect(screen.getByText('Manage your rentals')).toBeInTheDocument();
  });

  it('renders the actions slot when provided', () => {
    wrap(<PageHeader title="Properties" actions={<button>Add</button>} />);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders a back link when backHref is provided', () => {
    wrap(<PageHeader title="Detail" backHref="/properties" />);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/properties');
  });

  it('omits back link when backHref is absent', () => {
    wrap(<PageHeader title="Properties" />);
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument();
  });
});
