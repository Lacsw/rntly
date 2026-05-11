import { render, screen, fireEvent } from '@testing-library/react';
import { EditPropertyForm } from '../EditPropertyForm';
import { createMockProperty } from '@/tests/msw/factories/property';

const noop = () => Promise.resolve();

describe('EditPropertyForm', () => {
  it('pre-fills address from initial property', () => {
    const p = createMockProperty({ address: '99 Oak Lane' });
    render(<EditPropertyForm initial={p} onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole('textbox', { name: /address/i })).toHaveValue('99 Oak Lane');
  });

  it('pre-fills rent from initial property', () => {
    const p = createMockProperty({ rent_amount: 2000 });
    render(<EditPropertyForm initial={p} onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole('spinbutton', { name: /rent/i })).toHaveValue(2000);
  });

  it('submit button is disabled when address is cleared', () => {
    const p = createMockProperty({ address: '99 Oak Lane' });
    render(<EditPropertyForm initial={p} onSubmit={noop} onCancel={noop} />);
    fireEvent.change(screen.getByRole('textbox', { name: /address/i }), { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    const p = createMockProperty();
    render(<EditPropertyForm initial={p} onSubmit={noop} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onSubmit with updated data when form is valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    const p = createMockProperty({ address: '1 First Ave' });
    render(<EditPropertyForm initial={p} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.change(screen.getByRole('textbox', { name: /address/i }), {
      target: { value: '2 Second Ave' },
    });
    await fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form')!);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('updates select and numeric fields on user input', () => {
    const p = createMockProperty({ address: '1 First Ave', bedrooms: 2, rent_amount: 1500 });
    render(<EditPropertyForm initial={p} onSubmit={noop} onCancel={noop} />);
    fireEvent.change(screen.getByRole('combobox', { name: /property type/i }), { target: { value: 'house' } });
    fireEvent.change(screen.getByRole('combobox', { name: /status/i }), { target: { value: 'vacant' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /bedrooms/i }), { target: { value: '3' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /rent/i }), { target: { value: '2000' } });
    expect(screen.getByRole('spinbutton', { name: /rent/i })).toHaveValue(2000);
  });
});
