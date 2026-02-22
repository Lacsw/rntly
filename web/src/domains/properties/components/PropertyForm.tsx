import { useState } from 'react';
import type { TPropertyCreate } from '../api';

type PropertyFormProps = {
  onSubmit: (data: TPropertyCreate) => Promise<void>;
  onCancel: () => void;
};

export const PropertyForm = ({ onSubmit, onCancel }: PropertyFormProps) => {
  const [formData, setFormData] = useState<TPropertyCreate>({
    address: '',
    type: 'apartment',
    bedrooms: 1,
    rent_amount: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ address: '', type: 'apartment', bedrooms: 1, rent_amount: 0 });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg mb-6 flex gap-3 flex-wrap">
      <input
        type="text"
        placeholder="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className="border border-slate-300 rounded px-3 py-2 flex-1 min-w-50"
        required
      />
      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        className="border border-slate-300 rounded px-3 py-2"
      >
        <option value="apartment">Apartment</option>
        <option value="house">House</option>
        <option value="studio">Studio</option>
      </select>
      <input
        type="number"
        placeholder="Bedrooms"
        value={formData.bedrooms}
        onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
        className="border border-slate-300 rounded px-3 py-2 w-24"
        min="0"
      />
      <input
        type="number"
        placeholder="Rent Amount"
        value={formData.rent_amount}
        onChange={(e) => setFormData({ ...formData, rent_amount: Number(e.target.value) })}
        className="border border-slate-300 rounded px-3 py-2 w-32"
        min="0"
      />
      <button
        type="submit"
        className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700"
      >
        Save
      </button>
    </form>
  );
};
