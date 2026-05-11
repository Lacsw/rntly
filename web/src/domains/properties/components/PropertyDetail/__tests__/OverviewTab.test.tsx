import { render, screen } from '@testing-library/react';
import { OverviewTab } from '../OverviewTab';
import { createMockProperty } from '@/tests/msw/factories/property';

describe('OverviewTab', () => {
  it('renders property type capitalised', () => {
    const p = createMockProperty({ type: 'apartment' });
    render(<OverviewTab property={p} />);
    expect(screen.getByText('Apartment')).toBeInTheDocument();
  });

  it('renders property status', () => {
    const p = createMockProperty({ status: 'available' });
    render(<OverviewTab property={p} />);
    expect(screen.getByText('available')).toBeInTheDocument();
  });

  it('renders "No amenities listed." when amenities are absent', () => {
    render(<OverviewTab property={createMockProperty()} />);
    expect(screen.getByText('No amenities listed.')).toBeInTheDocument();
  });

  it('renders amenity tags when amenities are present', () => {
    const p = { ...createMockProperty(), amenities: ['Parking', 'Pool'] } as Parameters<typeof OverviewTab>[0]['property'];
    render(<OverviewTab property={p} />);
    expect(screen.getByText('Parking')).toBeInTheDocument();
    expect(screen.getByText('Pool')).toBeInTheDocument();
  });

  it('renders "No description yet." when description is absent', () => {
    render(<OverviewTab property={createMockProperty()} />);
    expect(screen.getByText('No description yet.')).toBeInTheDocument();
  });

  it('renders description when present', () => {
    const p = { ...createMockProperty(), description: 'Great location' } as Parameters<typeof OverviewTab>[0]['property'];
    render(<OverviewTab property={p} />);
    expect(screen.getByText('Great location')).toBeInTheDocument();
  });

  it('renders "—" for square footage when absent', () => {
    render(<OverviewTab property={createMockProperty()} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('renders section headings', () => {
    render(<OverviewTab property={createMockProperty()} />);
    expect(screen.getByRole('heading', { name: 'Property Details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Amenities' })).toBeInTheDocument();
  });
});
