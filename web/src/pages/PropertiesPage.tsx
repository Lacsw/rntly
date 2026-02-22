import { useState } from 'react';
import { useProperties, PropertyForm, PropertyTable } from '../domains/properties';

export const PropertiesPage = () => {
  const { properties, loading, error, createProperty, deleteProperty } = useProperties();
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await deleteProperty(id);
  };

  if (loading) return <div className="text-stone-500">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Properties</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-700 text-white px-4 py-2 rounded hover:bg-orange-800"
        >
          {showForm ? 'Cancel' : 'Add Property'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <PropertyForm onSubmit={createProperty} onCancel={() => setShowForm(false)} />
      )}

      <PropertyTable properties={properties} onDelete={handleDelete} />
    </div>
  );
};

export default PropertiesPage;
