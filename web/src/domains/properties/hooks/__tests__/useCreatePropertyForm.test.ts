import { renderHook, act } from '@testing-library/react';
import { useCreatePropertyForm } from '../useCreatePropertyForm';

describe('useCreatePropertyForm', () => {
  it('starts with no errors and isValid false', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it('does not show address error before submit is attempted', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    expect(result.current.errors.address).toBeUndefined();
  });

  it('does not show rent error before submit is attempted', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    expect(result.current.errors.rent_amount).toBeUndefined();
  });

  it('shows address required error after markSubmitted with empty address', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    act(() => result.current.markSubmitted());
    expect(result.current.errors.address).toBe('Address is required');
  });

  it('shows rent error after markSubmitted with zero rent', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    act(() => result.current.markSubmitted());
    expect(result.current.errors.rent_amount).toBe('Rent must be greater than 0');
  });

  it('shows address error after markSubmitted even if whitespace-only', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    act(() => result.current.updateField('address', '   '));
    act(() => result.current.markSubmitted());
    expect(result.current.errors.address).toBe('Address is required');
  });

  it('clears address error once address is filled after markSubmitted', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    act(() => result.current.markSubmitted());
    expect(result.current.errors.address).toBeDefined();
    act(() => result.current.updateField('address', '123 Main St'));
    expect(result.current.errors.address).toBeUndefined();
  });

  it('isValid is true when address and rent are filled', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    act(() => {
      result.current.updateField('address', '123 Main St');
      result.current.updateField('rent_amount', 1500);
    });
    expect(result.current.isValid).toBe(true);
  });

  it('still shows whitespace address error without markSubmitted', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    act(() => result.current.updateField('address', '   '));
    expect(result.current.errors.address).toBe('Address is required');
  });

  it('reset clears submitted state so errors hide again', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    act(() => result.current.markSubmitted());
    expect(result.current.errors.address).toBeDefined();
    act(() => result.current.reset());
    expect(result.current.errors).toEqual({});
  });

  it('updateField updates one key without mutating others', () => {
    const { result } = renderHook(() => useCreatePropertyForm());
    act(() => result.current.updateField('address', 'Test St'));
    expect(result.current.formData.address).toBe('Test St');
    expect(result.current.formData.rent_amount).toBe(0);
  });
});
