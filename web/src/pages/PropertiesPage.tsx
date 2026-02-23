import { useState } from 'react';
import { useProperties, PropertyForm, PropertyCard } from '../domains/properties';

export const PropertiesPage = () => {
  const { properties, loading, error, createProperty } = useProperties();
  const [showForm, setShowForm] = useState(false);

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

      <p className="text-sm text-stone-500 mb-4">
        Showing {properties.length} of {properties.length} properties
      </p>

      {properties.length === 0 ? (
        <p className="text-stone-500">No properties yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
