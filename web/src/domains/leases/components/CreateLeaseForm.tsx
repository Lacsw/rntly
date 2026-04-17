import { useId } from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { FormField, FormSelect } from '@/shared/components';
import type { TLeaseCreate } from '../api';
import type { TProperty } from '@/domains/properties';
import type { TTenant } from '@/domains/tenants';
import { useCreateLeaseForm } from '../hooks/useCreateLeaseForm';

type TCreateLeaseFormProps = {
  properties: TProperty[];
  tenants: TTenant[];
  onSubmit: (data: TLeaseCreate) => Promise<void>;
  onCancel: () => void;
};

export const CreateLeaseForm = ({
  properties,
  tenants,
  onSubmit,
  onCancel,
}: TCreateLeaseFormProps) => {
  const { formData, updateField, reset, isValid, errors } = useCreateLeaseForm();
  const startId = useId();
  const endId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit(formData);
    reset();
    onCancel();
  };

  const propertyOptions = [
    { value: '', label: 'Select property…' },
    ...properties.map((p) => ({ value: p.id, label: p.address })),
  ];
  const tenantOptions = [
    { value: '', label: 'Select tenant…' },
    ...tenants.map((t) => ({ value: t.id, label: `${t.first_name} ${t.last_name}`.trim() })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSelect
        label="Property"
        required
        value={formData.property_id}
        onChange={(v) => updateField('property_id', v)}
        options={propertyOptions}
      />

      <FormSelect
        label="Tenant"
        required
        value={formData.tenant_id}
        onChange={(v) => updateField('tenant_id', v)}
        options={tenantOptions}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={startId}
            className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1"
          >
            <Calendar size={14} aria-hidden />
            Start Date
            <span className="text-red-500">*</span>
          </label>
          <input
            id={startId}
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => updateField('start_date', e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor={endId}
            className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1"
          >
            <Calendar size={14} aria-hidden />
            End Date
            <span className="text-red-500">*</span>
          </label>
          <input
            id={endId}
            type="date"
            required
            value={formData.end_date}
            onChange={(e) => updateField('end_date', e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
          />
          {errors.end_date && <p className="text-xs text-red-600 mt-1">{errors.end_date}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Monthly Rent"
          icon={<DollarSign size={14} />}
          required
          type="numeric"
          value={formData.rent_amount}
          onChange={(v) => updateField('rent_amount', v)}
          error={errors.rent_amount}
        />
        <FormField
          label="Deposit"
          icon={<DollarSign size={14} />}
          type="numeric"
          value={formData.deposit}
          onChange={(v) => updateField('deposit', v)}
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
          Create Lease
        </button>
      </div>
    </form>
  );
};
