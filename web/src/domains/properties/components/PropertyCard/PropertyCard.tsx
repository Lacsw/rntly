import { MapPin } from 'lucide-react';
import type { TProperty } from '../../api';
import { PropertyCardImage } from './PropertyCardImage';
import { PropertyCardStats } from './PropertyCardStats';
import { PropertyCardTenant } from './PropertyCardTenant';

type PropertyCardProps = {
  property: TProperty;
};

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const displayName = property.name ?? property.address;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100">
      <PropertyCardImage property={property} displayName={displayName} />

      <div className="p-4">
        <h3 className="text-lg font-semibold text-stone-900">{displayName}</h3>
        <div className="flex items-center gap-1 mt-1 text-sm text-stone-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>{property.address}</span>
        </div>

        <PropertyCardStats property={property} />

        {property.tenant_name && (
          <PropertyCardTenant name={property.tenant_name} />
        )}
      </div>
    </div>
  );
};
