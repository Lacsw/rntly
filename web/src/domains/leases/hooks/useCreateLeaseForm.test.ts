import { renderHook, act } from '@testing-library/react';
import { useCreateLeaseForm } from './useCreateLeaseForm';

describe('useCreateLeaseForm', () => {
  it('starts empty and isValid false', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    expect(result.current.formData).toEqual({
      property_id: '',
      tenant_id: '',
      start_date: '',
      end_date: '',
      rent_amount: 0,
      deposit: 0,
    });
    expect(result.current.isValid).toBe(false);
  });

  it('updateField updates single key without mutating others', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => result.current.updateField('property_id', 'p1'));
    expect(result.current.formData.property_id).toBe('p1');
    expect(result.current.formData.tenant_id).toBe('');
  });

  it('isValid is true when all fields are filled and dates/money are valid', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('tenant_id', 't1');
      result.current.updateField('start_date', '2026-01-01');
      result.current.updateField('end_date', '2027-01-01');
      result.current.updateField('rent_amount', 1850);
      result.current.updateField('deposit', 1850);
    });
    expect(result.current.isValid).toBe(true);
  });

  it('isValid is false when end_date is not after start_date', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('tenant_id', 't1');
      result.current.updateField('start_date', '2026-06-01');
      result.current.updateField('end_date', '2026-06-01');
      result.current.updateField('rent_amount', 1000);
      result.current.updateField('deposit', 0);
    });
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.end_date).toBeDefined();
  });

  it('isValid is false when rent_amount is zero', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('tenant_id', 't1');
      result.current.updateField('start_date', '2026-01-01');
      result.current.updateField('end_date', '2027-01-01');
      result.current.updateField('rent_amount', 0);
    });
    expect(result.current.isValid).toBe(false);
  });

  it('isValid is false when deposit is negative', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('tenant_id', 't1');
      result.current.updateField('start_date', '2026-01-01');
      result.current.updateField('end_date', '2027-01-01');
      result.current.updateField('rent_amount', 1000);
      result.current.updateField('deposit', -1);
    });
    expect(result.current.isValid).toBe(false);
  });

  it('reset returns form to initial empty state', () => {
    const { result } = renderHook(() => useCreateLeaseForm());
    act(() => {
      result.current.updateField('property_id', 'p1');
      result.current.updateField('rent_amount', 1000);
    });
    act(() => result.current.reset());
    expect(result.current.formData).toEqual({
      property_id: '',
      tenant_id: '',
      start_date: '',
      end_date: '',
      rent_amount: 0,
      deposit: 0,
    });
  });
});
