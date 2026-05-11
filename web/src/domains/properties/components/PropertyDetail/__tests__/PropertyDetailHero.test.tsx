import { render, screen } from '@testing-library/react';
import { PropertyDetailHero } from '../PropertyDetailHero';
import { createMockProperty } from '@/tests/msw/factories/property';

describe('PropertyDetailHero', () => {
  it('renders property image when image_url is present', () => {
    const p = { ...createMockProperty({ address: 'The Manor' }), image_url: 'https://example.com/img.jpg' };
    render(<PropertyDetailHero property={p} />);
    const img = screen.getByRole('img', { name: 'The Manor' });
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('renders placeholder icon when image_url is absent', () => {
    const p = createMockProperty();
    render(<PropertyDetailHero property={p} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders formatted rent amount', () => {
    const p = createMockProperty({ rent_amount: 2500 });
    render(<PropertyDetailHero property={p} />);
    expect(screen.getByText(/\$2,500.*\/mo/)).toBeInTheDocument();
  });

  it('renders property type', () => {
    const p = createMockProperty({ type: 'apartment' });
    render(<PropertyDetailHero property={p} />);
    expect(screen.getByText('apartment')).toBeInTheDocument();
  });
});
