import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PropertyDetailHeader } from '../PropertyDetailHeader';
import { createMockProperty } from '@/tests/msw/factories/property';

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('PropertyDetailHeader', () => {
  it('renders property address as heading', () => {
    const p = createMockProperty({ address: '42 Elm Street' });
    wrap(<PropertyDetailHeader property={p} />);
    expect(screen.getByRole('heading', { name: '42 Elm Street' })).toBeInTheDocument();
  });

  it('renders status badge', () => {
    const p = createMockProperty({ status: 'available' });
    wrap(<PropertyDetailHeader property={p} />);
    expect(screen.getByText('available')).toBeInTheDocument();
  });

  it('renders back link to /properties', () => {
    const p = createMockProperty();
    wrap(<PropertyDetailHeader property={p} />);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/properties');
  });

  it('renders additional actions slot', () => {
    const p = createMockProperty();
    wrap(<PropertyDetailHeader property={p} actions={<button>Edit</button>} />);
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });
});
