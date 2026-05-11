import { render, screen, fireEvent } from '@testing-library/react';
import { CreateTenantForm } from '../CreateTenantForm';

const noop = () => Promise.resolve();

const fillForm = () => {
  fireEvent.change(screen.getByRole('textbox', { name: /first name/i }), { target: { value: 'Alex' } });
  fireEvent.change(screen.getByRole('textbox', { name: /last name/i }), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByRole('textbox', { name: /email/i }), { target: { value: 'alex@example.com' } });
  fireEvent.change(screen.getByRole('textbox', { name: /phone/i }), { target: { value: '555-1234' } });
};

describe('CreateTenantForm', () => {
  it('renders First Name, Last Name, Email, and Phone fields', () => {
    render(<CreateTenantForm onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /phone/i })).toBeInTheDocument();
  });

  it('submit button is disabled when form is empty', () => {
    render(<CreateTenantForm onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole('button', { name: 'Add Tenant' })).toBeDisabled();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<CreateTenantForm onSubmit={noop} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows email error when email is invalid', () => {
    render(<CreateTenantForm onSubmit={noop} onCancel={noop} />);
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'not-an-email' },
    });
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('does not show email error for empty email', () => {
    render(<CreateTenantForm onSubmit={noop} onCancel={noop} />);
    expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument();
  });

  it('enables submit button when all required fields are filled', () => {
    render(<CreateTenantForm onSubmit={noop} onCancel={noop} />);
    fillForm();
    expect(screen.getByRole('button', { name: 'Add Tenant' })).not.toBeDisabled();
  });

  it('calls onSubmit when form is valid and submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    render(<CreateTenantForm onSubmit={onSubmit} onCancel={onCancel} />);
    fillForm();
    await fireEvent.submit(screen.getByRole('button', { name: 'Add Tenant' }).closest('form')!);
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
