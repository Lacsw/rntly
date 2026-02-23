import { useState } from 'react';
import type { TPropertyCreate } from '../api';
import { DEFAULT_FORM_DATA } from '../components/CreatePropertyForm/constants';

export const useCreatePropertyForm = () => {
  const [formData, setFormData] = useState<TPropertyCreate>(DEFAULT_FORM_DATA);

  const updateField = <K extends keyof TPropertyCreate>(key: K, value: TPropertyCreate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setFormData(DEFAULT_FORM_DATA);

  const isValid =
    (formData.name ?? '').trim() !== '' &&
    formData.address.trim() !== '' &&
    (formData.city ?? '').trim() !== '' &&
    formData.rent_amount > 0;

  return { formData, updateField, reset, isValid };
};
