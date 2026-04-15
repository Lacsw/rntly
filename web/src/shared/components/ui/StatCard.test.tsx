import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders label, value, and icon', () => {
    render(<StatCard label="Revenue" value="$45,500" icon={<span>icon</span>} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$45,500')).toBeInTheDocument();
    expect(screen.getByText('icon')).toBeInTheDocument();
  });

  it('applies emerald color for a positive delta', () => {
    render(
      <StatCard
        label="Revenue"
        value="$45,500"
        icon={<span>icon</span>}
        delta={{ value: '+12%', positive: true }}
      />,
    );
    expect(screen.getByText('+12%').className).toContain('text-emerald-600');
  });

  it('applies red color for a negative delta', () => {
    render(
      <StatCard
        label="Revenue"
        value="$45,500"
        icon={<span>icon</span>}
        delta={{ value: '-5%', positive: false }}
      />,
    );
    expect(screen.getByText('-5%').className).toContain('text-red-600');
  });

  it('omits delta element when delta is not provided', () => {
    render(<StatCard label="Revenue" value="$45,500" icon={<span>icon</span>} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
