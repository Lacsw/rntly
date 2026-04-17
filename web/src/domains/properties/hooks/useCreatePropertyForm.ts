import { useState } from 'react';
import type { TPropertyCreate } from '../api';
import { DEFAULT_FORM_DATA } from '../components/CreatePropertyForm/constants';

type TFormErrors = {
  address?: string;
  rent_amount?: string;
};

export const useCreatePropertyForm = () => {
  const [formData, setFormData] = useState<TPropertyCreate>(DEFAULT_FORM_DATA);

  const updateField = <K extends keyof TPropertyCreate>(key: K, value: TPropertyCreate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setFormData(DEFAULT_FORM_DATA);

  const errors: TFormErrors = {};
  if (formData.address !== '' && formData.address.trim() === '') {
    errors.address = 'Address is required';
  }
  if (formData.rent_amount !== 0 && formData.rent_amount <= 0) {
    errors.rent_amount = 'Rent must be greater than 0';
  }

  const isValid =
    formData.address.trim() !== '' &&
    formData.rent_amount > 0;

  return { formData, updateField, reset, isValid, errors };
};
