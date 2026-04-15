import { useState } from 'react';
import type { TTenantCreate } from '../api';

const INITIAL: TTenantCreate = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
};

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

type TFormErrors = {
  email?: string;
};

export const useCreateTenantForm = () => {
  const [formData, setFormData] = useState<TTenantCreate>(INITIAL);

  const updateField = <K extends keyof TTenantCreate>(key: K, value: TTenantCreate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setFormData(INITIAL);

  const errors: TFormErrors = {};
  if (formData.email !== '' && !EMAIL_REGEX.test(formData.email)) {
    errors.email = 'Enter a valid email address';
  }

  const isValid =
    formData.first_name.trim() !== '' &&
    formData.last_name.trim() !== '' &&
    formData.phone.trim() !== '' &&
    EMAIL_REGEX.test(formData.email);

  return { formData, updateField, reset, isValid, errors };
};
