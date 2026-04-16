import { useState } from 'react';
import type { TLeaseCreate } from '../api';

const INITIAL: TLeaseCreate = {
  property_id: '',
  tenant_id: '',
  start_date: '',
  end_date: '',
  rent_amount: 0,
  deposit: 0,
};

type TFormErrors = {
  end_date?: string;
};

export const useCreateLeaseForm = () => {
  const [formData, setFormData] = useState<TLeaseCreate>(INITIAL);

  const updateField = <K extends keyof TLeaseCreate>(key: K, value: TLeaseCreate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setFormData(INITIAL);

  const errors: TFormErrors = {};
  const start = formData.start_date ? new Date(formData.start_date).getTime() : NaN;
  const end = formData.end_date ? new Date(formData.end_date).getTime() : NaN;
  if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
    errors.end_date = 'End date must be after start date';
  }

  const isValid =
    formData.property_id !== '' &&
    formData.tenant_id !== '' &&
    formData.start_date !== '' &&
    formData.end_date !== '' &&
    formData.rent_amount > 0 &&
    formData.deposit >= 0 &&
    !errors.end_date;

  return { formData, updateField, reset, isValid, errors };
};
