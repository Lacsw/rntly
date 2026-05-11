import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from '../FormField';

describe('FormField — text type', () => {
  it('renders the label', () => {
    render(<FormField label="Address" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
  });

  it('shows required asterisk when required=true', () => {
    render(<FormField label="Address" required value="" onChange={vi.fn()} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not show asterisk when required is omitted', () => {
    render(<FormField label="Address" value="" onChange={vi.fn()} />);
    expect(screen.queryByText('*')).toBeNull();
  });

  it('calls onChange with the input value', () => {
    const onChange = vi.fn();
    render(<FormField label="Address" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } });
    expect(onChange).toHaveBeenCalledWith('123 Main St');
  });

  it('renders the current value', () => {
    render(<FormField label="Address" value="My Street" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('My Street')).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(<FormField label="Address" value="" onChange={vi.fn()} error="Address is required" />);
    expect(screen.getByText('Address is required')).toBeInTheDocument();
  });

  it('sets aria-invalid on the input when error is provided', () => {
    render(<FormField label="Address" value="" onChange={vi.fn()} error="required" />);
    expect(screen.getByLabelText('Address')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(<FormField label="Address" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Address')).not.toHaveAttribute('aria-invalid');
  });

  it('renders placeholder text', () => {
    render(<FormField label="Address" value="" onChange={vi.fn()} placeholder="e.g. 123 Main St" />);
    expect(screen.getByPlaceholderText('e.g. 123 Main St')).toBeInTheDocument();
  });
});

describe('FormField — numeric type', () => {
  it('renders a number input', () => {
    render(<FormField label="Rent" type="numeric" value={0} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Rent')).toHaveAttribute('type', 'number');
  });

  it('calls onChange with parsed number', () => {
    const onChange = vi.fn();
    render(<FormField label="Rent" type="numeric" value={0} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Rent'), { target: { value: '1500' } });
    expect(onChange).toHaveBeenCalledWith(1500);
  });

  it('calls onChange with 0 when input is cleared', () => {
    const onChange = vi.fn();
    render(<FormField label="Rent" type="numeric" value={1500} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Rent'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('shows error message for numeric field', () => {
    render(<FormField label="Rent" type="numeric" value={0} onChange={vi.fn()} error="Rent must be greater than 0" />);
    expect(screen.getByText('Rent must be greater than 0')).toBeInTheDocument();
  });
});
