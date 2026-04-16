import { useState } from 'react';
import type { TProperty, TPropertyUpdate } from '../api';

export const useEditPropertyForm = (initial: TProperty) => {
  const [formData, setFormData] = useState<TPropertyUpdate>({
    name: initial.name,
    address: initial.address,
    city: initial.city,
    type: initial.type,
    status: initial.status,
    bedrooms: initial.bedrooms,
    bathrooms: initial.bathrooms,
    rent_amount: initial.rent_amount,
    image_url: initial.image_url,
    tenant_name: initial.tenant_name,
  });

  const updateField = <K extends keyof TPropertyUpdate>(key: K, value: TPropertyUpdate[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    (formData.name ?? '').trim() !== '' &&
    formData.address.trim() !== '' &&
    (formData.city ?? '').trim() !== '' &&
    formData.rent_amount > 0;

  return { formData, updateField, isValid };
};
