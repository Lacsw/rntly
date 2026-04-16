import { MapPin, Bed, Bath, DollarSign } from 'lucide-react';
import { FormField, FormSelect } from '@/shared/components';
import type { TProperty, TPropertyUpdate } from '../api';
import { useEditPropertyForm } from '../hooks/useEditPropertyForm';
import {
  PROPERTY_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from './CreatePropertyForm/constants';

type TEditPropertyFormProps = {
  initial: TProperty;
  onSubmit: (data: TPropertyUpdate) => Promise<void>;
  onCancel: () => void;
};

export const EditPropertyForm = ({ initial, onSubmit, onCancel }: TEditPropertyFormProps) => {
  const { formData, updateField, isValid } = useEditPropertyForm(initial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit(formData);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Property Name"
        required
        value={formData.name ?? ''}
        onChange={(v) => updateField('name', v)}
      />

      <FormField
        label="Address"
        icon={<MapPin size={14} />}
        required
        value={formData.address}
        onChange={(v) => updateField('address', v)}
      />

      <FormField
        label="City"
        required
        value={formData.city ?? ''}
        onChange={(v) => updateField('city', v)}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Property Type"
          value={formData.type}
          onChange={(v) => updateField('type', v)}
          options={PROPERTY_TYPE_OPTIONS}
        />
        <FormSelect
          label="Status"
          value={formData.status}
          onChange={(v) => updateField('status', v)}
          options={STATUS_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          label="Bedrooms"
          icon={<Bed size={14} />}
          type="numeric"
          value={formData.bedrooms}
          onChange={(v) => updateField('bedrooms', v)}
        />
        <FormField
          label="Bathrooms"
          icon={<Bath size={14} />}
          type="numeric"
          value={formData.bathrooms ?? 1}
          onChange={(v) => updateField('bathrooms', v)}
        />
        <FormField
          label="Rent"
          icon={<DollarSign size={14} />}
          required
          type="numeric"
          value={formData.rent_amount}
          onChange={(v) => updateField('rent_amount', v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="border border-stone-200 rounded-lg py-3 text-stone-700 hover:bg-stone-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="bg-stone-900 text-white rounded-lg py-3 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
