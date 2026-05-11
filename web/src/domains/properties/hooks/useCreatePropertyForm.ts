import { useState } from 'react';
import type { TPropertyCreate } from '../api';
import { DEFAULT_FORM_DATA } from '../components/CreatePropertyForm/constants';

type TFormErrors = {
  address?: string;
  rent_amount?: string;
};

export const useCreatePropertyForm = () => {
  const [formData, setFormData] = useState<TPropertyCreate>(DEFAULT_FORM_DATA);
  const [submitted, setSubmitted] = useState(false);

  const updateField = <K extends keyof TPropertyCreate>(key: K, value: TPropertyCreate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const markSubmitted = () => setSubmitted(true);

  const reset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setSubmitted(false);
  };

  const errors: TFormErrors = {};
  if (submitted || formData.address !== '') {
    if (!formData.address.trim()) errors.address = 'Address is required';
  }
  if (submitted || formData.rent_amount !== 0) {
    if (formData.rent_amount <= 0) errors.rent_amount = 'Rent must be greater than 0';
  }

  const isValid = formData.address.trim() !== '' && formData.rent_amount > 0;

  return { formData, updateField, markSubmitted, reset, isValid, errors };
};
