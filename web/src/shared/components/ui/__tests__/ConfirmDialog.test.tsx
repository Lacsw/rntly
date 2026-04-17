import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../ConfirmDialog';

const baseProps = {
  open: true,
  title: 'Delete property',
  message: 'This cannot be undone.',
  onConfirm: () => {},
  onCancel: () => {},
};

describe('ConfirmDialog', () => {
  it('renders title and message when open', () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText('Delete property')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmDialog {...baseProps} open={false} />);
    expect(screen.queryByText('Delete property')).not.toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('uses a destructive red confirm button when destructive is true', () => {
    render(<ConfirmDialog {...baseProps} destructive />);
    expect(screen.getByRole('button', { name: 'Confirm' }).className).toContain('bg-red-700');
  });

  it('uses the custom confirm label when supplied', () => {
    render(<ConfirmDialog {...baseProps} confirmLabel="Delete" />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
