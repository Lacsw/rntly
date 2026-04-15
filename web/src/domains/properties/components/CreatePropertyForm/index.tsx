import { MapPin, Bed, Bath, DollarSign } from 'lucide-react';
import { FormField, FormSelect } from '@/shared/components';
import type { TPropertyCreate } from '../../api';
import { useCreatePropertyForm } from '../../hooks/useCreatePropertyForm';
import { PROPERTY_TYPE_OPTIONS, STATUS_OPTIONS } from './constants';

type TCreatePropertyFormProps = {
  onSubmit: (data: TPropertyCreate) => Promise<void>;
  onCancel: () => void;
};

export const CreatePropertyForm = ({ onSubmit, onCancel }: TCreatePropertyFormProps) => {
  const { formData, updateField, reset, isValid } = useCreatePropertyForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    reset();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Property Name"
        required
        placeholder="e.g., Downtown Studio Apartment"
        value={formData.name ?? ''}
        onChange={(v) => updateField('name', v)}
      />

      <FormField
        label="Address"
        icon={<MapPin size={14} />}
        required
        placeholder="e.g., 123 Main Street"
        value={formData.address}
        onChange={(v) => updateField('address', v)}
      />

      <FormField
        label="City"
        required
        placeholder="e.g., Los Angeles"
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
          value={formData.status ?? 'vacant'}
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
          Add Property
        </button>
      </div>
    </form>
  );
};
