import { useState } from 'react';
import { MapPin, Bed, Bath, DollarSign } from 'lucide-react';
import type { TPropertyCreate } from '../api';

type TCreatePropertyFormProps = {
  onSubmit: (data: TPropertyCreate) => Promise<void>;
  onCancel: () => void;
};

export const CreatePropertyForm = ({ onSubmit, onCancel }: TCreatePropertyFormProps) => {
  const [formData, setFormData] = useState<TPropertyCreate>({
    name: '',
    address: '',
    city: '',
    type: 'apartment',
    status: 'vacant',
    bedrooms: 1,
    bathrooms: 1,
    rent_amount: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      name: '',
      address: '',
      city: '',
      type: 'apartment',
      status: 'vacant',
      bedrooms: 1,
      bathrooms: 1,
      rent_amount: 0,
    });
    onCancel();
  };

  const isValid =
    (formData.name ?? '').trim() !== '' &&
    formData.address.trim() !== '' &&
    (formData.city ?? '').trim() !== '' &&
    formData.rent_amount > 0;

  const inputClass =
    'w-full border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Property Name */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Property Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Downtown Studio Apartment"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClass}
          required
        />
      </div>

      {/* Address */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1">
          <MapPin size={14} />
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., 123 Main Street"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className={inputClass}
          required
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Los Angeles"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className={inputClass}
          required
        />
      </div>

      {/* Type + Status (2-column) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Property Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={inputClass}
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
            <option value="condo">Condo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className={inputClass}
          >
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
          </select>
        </div>
      </div>

      {/* Bedrooms + Bathrooms + Rent (3-column) */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1">
            <Bed size={14} />
            Bedrooms
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.bedrooms}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, bedrooms: val === '' ? 0 : Number(val) });
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1">
            <Bath size={14} />
            Bathrooms
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.bathrooms}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, bathrooms: val === '' ? 0 : Number(val) });
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1">
            <DollarSign size={14} />
            Rent <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.rent_amount}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, rent_amount: val === '' ? 0 : Number(val) });
            }}
            className={inputClass}
          />
        </div>
      </div>

      {/* Buttons */}
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
