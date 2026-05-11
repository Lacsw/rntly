import { render, screen } from '@testing-library/react';
import { PropertyInfoCards } from '../PropertyInfoCards';
import { createMockProperty } from '@/tests/msw/factories/property';

describe('PropertyInfoCards', () => {
  it('renders bedrooms count', () => {
    const p = createMockProperty({ bedrooms: 3 });
    render(<PropertyInfoCards property={p} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders formatted monthly rent', () => {
    const p = createMockProperty({ rent_amount: 1800 });
    render(<PropertyInfoCards property={p} />);
    expect(screen.getByText(/\$1,800/)).toBeInTheDocument();
  });

  it('renders "—" for size when square_feet is absent', () => {
    const p = createMockProperty();
    render(<PropertyInfoCards property={p} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders square footage when present', () => {
    const p = { ...createMockProperty(), square_feet: 950 } as Parameters<typeof PropertyInfoCards>[0]['property'];
    render(<PropertyInfoCards property={p} />);
    expect(screen.getByText('950 sqft')).toBeInTheDocument();
  });
});
