import { useState } from 'react';
import type { TProperty, TPropertyUpdate } from '../api';

export const useEditPropertyForm = (initial: TProperty) => {
  const [formData, setFormData] = useState<TPropertyUpdate>({
    address: initial.address,
    type: initial.type,
    status: initial.status,
    bedrooms: initial.bedrooms,
    rent_amount: initial.rent_amount,
    image_url: initial.image_url,
    tenant_name: initial.tenant_name,
  });

  const updateField = <K extends keyof TPropertyUpdate>(key: K, value: TPropertyUpdate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    formData.address.trim() !== '' &&
    formData.rent_amount > 0;

  return { formData, updateField, isValid };
};
