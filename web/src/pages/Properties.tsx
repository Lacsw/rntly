import { useEffect, useState } from 'react';
import { propertiesApi, type TProperty, type TPropertyCreate } from '../api';

const Properties = () => {
  const [properties, setProperties] = useState<TProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TPropertyCreate>({
    address: '',
    type: 'apartment',
    bedrooms: 1,
    rent_amount: 0,
  });

  const fetchProperties = async () => {
    try {
      const { data } = await propertiesApi.getAll();
      setProperties(data);
    } catch (err) {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await propertiesApi.create(formData);
      setShowForm(false);
      setFormData({ address: '', type: 'apartment', bedrooms: 1, rent_amount: 0 });
      fetchProperties();
    } catch (err) {
      setError('Failed to create property');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await propertiesApi.delete(id);
      fetchProperties();
    } catch (err) {
      setError('Failed to delete property');
    }
  };

  if (loading) return <div className="text-slate-600">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Properties</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700"
        >
          {showForm ? 'Cancel' : 'Add Property'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
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
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="text-left p-3">Address</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Bedrooms</th>
              <th className="text-left p-3">Rent</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">{property.address}</td>
                <td className="p-3 capitalize">{property.type}</td>
                <td className="p-3">{property.bedrooms}</td>
                <td className="p-3">${property.rent_amount}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      property.status === 'vacant'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {property.status}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {properties.length === 0 && (
        <p className="text-slate-500 mt-4">No properties yet.</p>
      )}
    </div>
  );
};

export default Properties;