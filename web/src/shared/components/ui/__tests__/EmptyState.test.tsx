import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No properties yet" />);
    expect(screen.getByText('No properties yet')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<EmptyState title="No properties" description="Add one to get started" />);
    expect(screen.getByText('Add one to get started')).toBeInTheDocument();
  });

  it('renders the action when provided', () => {
    render(<EmptyState title="No properties" action={<button>Add property</button>} />);
    expect(screen.getByRole('button', { name: 'Add property' })).toBeInTheDocument();
  });
});
