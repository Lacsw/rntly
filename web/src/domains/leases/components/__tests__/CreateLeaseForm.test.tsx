import { render, screen, fireEvent } from '@testing-library/react';
import { CreateLeaseForm } from '../CreateLeaseForm';
import { createMockProperty } from '@/tests/msw/factories/property';
import { createMockTenant } from '@/tests/msw/factories/tenant';

const property = createMockProperty({ id: 'p1', address: '123 Main St' });
const tenant = createMockTenant({ id: 't1', first_name: 'Alex', last_name: 'Doe' });

const noop = () => Promise.resolve();

const fillForm = () => {
  fireEvent.change(screen.getByRole('combobox', { name: /property/i }), { target: { value: 'p1' } });
  fireEvent.change(screen.getByRole('combobox', { name: /tenant/i }), { target: { value: 't1' } });
  fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-01-01' } });
  fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2027-01-01' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: /monthly rent/i }), { target: { value: '1500' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: /deposit/i }), { target: { value: '500' } });
};

describe('CreateLeaseForm', () => {
  it('renders Property and Tenant selects', () => {
    render(<CreateLeaseForm properties={[property]} tenants={[tenant]} onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole('combobox', { name: /property/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /tenant/i })).toBeInTheDocument();
  });

  it('renders Start Date and End Date inputs', () => {
    render(<CreateLeaseForm properties={[property]} tenants={[tenant]} onSubmit={noop} onCancel={noop} />);
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('renders Monthly Rent and Deposit fields', () => {
    render(<CreateLeaseForm properties={[property]} tenants={[tenant]} onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole('spinbutton', { name: /monthly rent/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /deposit/i })).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<CreateLeaseForm properties={[property]} tenants={[tenant]} onSubmit={noop} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows rent error after submit with zero rent', () => {
    render(<CreateLeaseForm properties={[property]} tenants={[tenant]} onSubmit={noop} onCancel={noop} />);
    fireEvent.submit(screen.getByRole('button', { name: 'Create Lease' }).closest('form')!);
    expect(screen.getByText('Rent must be greater than 0')).toBeInTheDocument();
  });

  it('does not call onSubmit when form is invalid', () => {
    const onSubmit = vi.fn();
    render(<CreateLeaseForm properties={[property]} tenants={[tenant]} onSubmit={onSubmit} onCancel={noop} />);
    fireEvent.submit(screen.getByRole('button', { name: 'Create Lease' }).closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('updates field values when user types', () => {
    render(<CreateLeaseForm properties={[property]} tenants={[tenant]} onSubmit={noop} onCancel={noop} />);
    fillForm();
    expect(screen.getByRole('combobox', { name: /property/i })).toHaveValue('p1');
    expect(screen.getByRole('combobox', { name: /tenant/i })).toHaveValue('t1');
    expect(screen.getByRole('spinbutton', { name: /monthly rent/i })).toHaveValue(1500);
  });

  it('calls onSubmit with form data when all fields are filled', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    render(<CreateLeaseForm properties={[property]} tenants={[tenant]} onSubmit={onSubmit} onCancel={onCancel} />);
    fillForm();
    await fireEvent.submit(screen.getByRole('button', { name: 'Create Lease' }).closest('form')!);
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
