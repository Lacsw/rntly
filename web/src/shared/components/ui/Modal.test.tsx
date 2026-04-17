import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

const baseProps = {
  open: true,
  title: 'Edit property',
  onClose: () => {},
};

describe('Modal', () => {
  it('renders dialog with title when open', () => {
    render(
      <Modal {...baseProps}>
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Edit property' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal {...baseProps} open={false}>
        <p>Body</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal {...baseProps} onClose={onClose}>
        <input placeholder="first" />
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose on Escape when closed', async () => {
    const onClose = vi.fn();
    render(
      <Modal {...baseProps} open={false} onClose={onClose}>
        <input />
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('focuses the first focusable element on open', () => {
    render(
      <Modal {...baseProps}>
        <input placeholder="first" />
        <input placeholder="second" />
      </Modal>,
    );
    expect(document.activeElement).toBe(screen.getByPlaceholderText('first'));
  });
});
