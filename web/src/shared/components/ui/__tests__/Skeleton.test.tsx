import { render } from '@testing-library/react';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders an aria-hidden pulsing block', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden');
    expect(el.className).toContain('animate-pulse');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-6 w-32" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('h-6');
    expect(el.className).toContain('w-32');
  });
});
