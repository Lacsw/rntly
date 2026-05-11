import { render, screen, fireEvent } from '@testing-library/react';
import { FormSelect } from '../FormSelect';

const OPTIONS = [
  { value: '', label: 'Select…' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
];

describe('FormSelect', () => {
  it('renders the label', () => {
    render(<FormSelect label="Property Type" value="" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByLabelText('Property Type')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<FormSelect label="Property Type" value="" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByRole('option', { name: 'Select…' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apartment' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'House' })).toBeInTheDocument();
  });

  it('shows the current value as selected', () => {
    render(<FormSelect label="Property Type" value="apartment" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByDisplayValue('Apartment')).toBeInTheDocument();
  });

  it('calls onChange with the selected value', () => {
    const onChange = vi.fn();
    render(<FormSelect label="Property Type" value="" onChange={onChange} options={OPTIONS} />);
    fireEvent.change(screen.getByLabelText('Property Type'), { target: { value: 'house' } });
    expect(onChange).toHaveBeenCalledWith('house');
  });

  it('shows required asterisk when required=true', () => {
    render(<FormSelect label="Property Type" required value="" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not show asterisk when required is omitted', () => {
    render(<FormSelect label="Property Type" value="" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.queryByText('*')).toBeNull();
  });
});
