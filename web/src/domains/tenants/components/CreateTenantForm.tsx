import { Mail, Phone, User } from 'lucide-react';
import { FormField } from '@/shared/components';
import type { TTenantCreate } from '../api';
import { useCreateTenantForm } from '../hooks/useCreateTenantForm';

type TCreateTenantFormProps = {
  onSubmit: (data: TTenantCreate) => Promise<void>;
  onCancel: () => void;
};

export const CreateTenantForm = ({ onSubmit, onCancel }: TCreateTenantFormProps) => {
  const { formData, updateField, reset, isValid, errors } = useCreateTenantForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit(formData);
    reset();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="First Name"
          icon={<User size={14} />}
          required
          placeholder="e.g., Sarah"
          value={formData.first_name}
          onChange={(v) => updateField('first_name', v)}
        />
        <FormField
          label="Last Name"
          required
          placeholder="e.g., Johnson"
          value={formData.last_name}
          onChange={(v) => updateField('last_name', v)}
        />
      </div>

      <div>
        <FormField
          label="Email"
          icon={<Mail size={14} />}
          required
          placeholder="sarah@example.com"
          value={formData.email}
          onChange={(v) => updateField('email', v)}
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      <FormField
        label="Phone"
        icon={<Phone size={14} />}
        required
        placeholder="(555) 123-4567"
        value={formData.phone}
        onChange={(v) => updateField('phone', v)}
      />

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
          Add Tenant
        </button>
      </div>
    </form>
  );
};
