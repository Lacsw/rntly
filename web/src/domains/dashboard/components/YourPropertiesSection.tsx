import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PropertyCard } from '@/domains/properties';
import type { TProperty } from '@/domains/properties';
import { EmptyState } from '@/shared/components';

type TYourPropertiesSectionProps = {
  properties: TProperty[];
};

export const YourPropertiesSection = ({ properties }: TYourPropertiesSectionProps) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-900">Your Properties</h2>
        <Link
          to="/properties"
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900"
        >
          View All
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
      {properties.length === 0 ? (
        <EmptyState title="No properties yet" description="Add your first property to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
};
