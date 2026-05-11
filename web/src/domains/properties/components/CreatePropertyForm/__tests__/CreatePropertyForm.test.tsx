import { render, screen, fireEvent } from '@testing-library/react';
import { CreatePropertyForm } from '../index';

const noop = () => Promise.resolve();

const fillForm = () => {
  fireEvent.change(screen.getByRole('textbox', { name: /address/i }), { target: { value: '123 Main St' } });
  fireEvent.change(screen.getByRole('combobox', { name: /property type/i }), { target: { value: 'apartment' } });
  fireEvent.change(screen.getByRole('combobox', { name: /status/i }), { target: { value: 'vacant' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: /bedrooms/i }), { target: { value: '2' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: /rent/i }), { target: { value: '1500' } });
};

describe('CreatePropertyForm', () => {
  it('renders Address, Bedrooms, and Rent fields', () => {
    render(<CreatePropertyForm onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole('textbox', { name: /address/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /bedrooms/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /rent/i })).toBeInTheDocument();
  });

  it('renders Property Type and Status selects', () => {
    render(<CreatePropertyForm onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole('combobox', { name: /property type/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<CreatePropertyForm onSubmit={noop} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows address error after submitting with empty address', () => {
    render(<CreatePropertyForm onSubmit={noop} onCancel={noop} />);
    fireEvent.submit(screen.getByRole('button', { name: 'Add Property' }).closest('form')!);
    expect(screen.getByText('Address is required')).toBeInTheDocument();
  });

  it('does not call onSubmit when form is invalid', () => {
    const onSubmit = vi.fn();
    render(<CreatePropertyForm onSubmit={onSubmit} onCancel={noop} />);
    fireEvent.submit(screen.getByRole('button', { name: 'Add Property' }).closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('updates field values when user types', () => {
    render(<CreatePropertyForm onSubmit={noop} onCancel={noop} />);
    fillForm();
    expect(screen.getByRole('textbox', { name: /address/i })).toHaveValue('123 Main St');
    expect(screen.getByRole('spinbutton', { name: /rent/i })).toHaveValue(1500);
  });

  it('calls onSubmit when form is valid and submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    render(<CreatePropertyForm onSubmit={onSubmit} onCancel={onCancel} />);
    fillForm();
    await fireEvent.submit(screen.getByRole('button', { name: 'Add Property' }).closest('form')!);
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
