import { renderHook, act } from '@testing-library/react';
import { useCreateTenantForm } from '../useCreateTenantForm';

describe('useCreateTenantForm', () => {
  it('starts with empty fields and isValid false', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    expect(result.current.formData).toEqual({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    });
    expect(result.current.isValid).toBe(false);
  });

  it('updateField sets a single key without mutating others', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => result.current.updateField('first_name', 'Sarah'));
    expect(result.current.formData.first_name).toBe('Sarah');
    expect(result.current.formData.last_name).toBe('');
  });

  it('isValid is true only when all fields are non-empty and email is valid', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => {
      result.current.updateField('first_name', 'Sarah');
      result.current.updateField('last_name', 'Johnson');
      result.current.updateField('phone', '555-1234');
    });
    expect(result.current.isValid).toBe(false);

    act(() => result.current.updateField('email', 'sarah@example.com'));
    expect(result.current.isValid).toBe(true);
  });

  it('isValid is false when email fails the regex', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => {
      result.current.updateField('first_name', 'Sarah');
      result.current.updateField('last_name', 'Johnson');
      result.current.updateField('phone', '555-1234');
      result.current.updateField('email', 'not-an-email');
    });
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.email).toBeDefined();
  });

  it('errors.email is absent when email is empty', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    expect(result.current.errors.email).toBeUndefined();
  });

  it('errors.email is absent when email is valid', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => result.current.updateField('email', 'ok@example.com'));
    expect(result.current.errors.email).toBeUndefined();
  });

  it('reset returns form to initial empty state', () => {
    const { result } = renderHook(() => useCreateTenantForm());
    act(() => {
      result.current.updateField('first_name', 'Sarah');
      result.current.updateField('email', 'sarah@example.com');
    });
    act(() => result.current.reset());
    expect(result.current.formData).toEqual({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    });
    expect(result.current.errors.email).toBeUndefined();
  });
});
