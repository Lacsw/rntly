import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  useProperties,
  CreatePropertyForm,
  PropertyCard,
  PropertyCardSkeleton,
} from '../domains/properties';
import {
  Modal,
  PageHeader,
  ErrorBanner,
  EmptyState,
} from '@/shared/components';
import { BuildingIcon } from '@/shared/icons/BuildingIcon';

const SKELETON_COUNT = 6;

export const PropertiesPage = () => {
  const { properties, loading, error, createProperty, deleteProperty } = useProperties();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(() => searchParams.get('create') === '1');

  const openForm = () => setShowForm(true);
  const closeForm = () => {
    setShowForm(false);
    if (searchParams.get('create') === '1') navigate('/properties', { replace: true });
  };

  return (
    <div>
      <PageHeader
        title="Properties"
        actions={
          <button
            type="button"
            onClick={openForm}
            className="bg-orange-700 text-white px-4 py-2 rounded hover:bg-orange-800 flex items-center gap-2"
          >
            <Plus size={18} aria-hidden />
            Add Property
          </button>
        }
      />

      {error && <ErrorBanner message={error} />}

      <Modal
        open={showForm}
        onClose={closeForm}
        title="Add New Property"
        icon={<BuildingIcon className="w-6 h-6 text-stone-700" />}
      >
        <CreatePropertyForm onSubmit={createProperty} onCancel={closeForm} />
      </Modal>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState title="No properties yet" description="Add your first property to get started." />
      ) : (
        <>
          <p className="text-sm text-stone-500 mb-4">
            Showing {properties.length} of {properties.length} properties
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} onDelete={deleteProperty} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PropertiesPage;
