import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProperties, CreatePropertyForm, PropertyCard } from '../domains/properties';
import {
  Modal,
  PageHeader,
  Loading,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';
import { BuildingIcon } from '@/shared/icons/BuildingIcon';

export const PropertiesPage = () => {
  const { properties, loading, error, createProperty, deleteProperty } = useProperties();
  const [showForm, setShowForm] = useState(false);

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Properties"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-700 text-white px-4 py-2 rounded hover:bg-orange-800 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Property
          </button>
        }
      />

      {error && <ErrorBanner message={error} />}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Property"
        icon={<BuildingIcon className="w-6 h-6 text-stone-700" />}
      >
        <CreatePropertyForm onSubmit={createProperty} onCancel={() => setShowForm(false)} />
      </Modal>

      <p className="text-sm text-stone-500 mb-4">
        Showing {properties.length} of {properties.length} properties
      </p>

      {properties.length === 0 ? (
        <EmptyState title="No properties yet" description="Add your first property to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} onDelete={deleteProperty} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
