import { MapPin, Bed, Bath, DollarSign, MoreVertical } from 'lucide-react';
import type { TProperty } from '../api';
import { StatusBadge } from '../../../shared/components/StatusBadge';

type PropertyCardProps = {
  property: TProperty;
};

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const displayName = property.name ?? property.address;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100">
      {/* Image area */}
      <div className="relative aspect-[16/10] bg-stone-200">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
        )}

        {/* Status badge - top left */}
        <div className="absolute top-3 left-3">
          <StatusBadge
            status={property.status}
            variant={property.status === 'vacant' ? 'green' : 'yellow'}
          />
        </div>

        {/* Type pill + menu - top right */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="bg-white/80 backdrop-blur text-stone-700 text-xs rounded-full px-3 py-1 capitalize">
            {property.type}
          </span>
          <button className="bg-white/80 backdrop-blur rounded-full p-1 text-stone-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-stone-900">{displayName}</h3>
        <div className="flex items-center gap-1 mt-1 text-sm text-stone-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>{property.address}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 text-sm text-stone-600">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} bed</span>
          </div>
          {property.bathrooms != null && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} bath</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold text-stone-900">
              {property.rent_amount}
            </span>
          </div>
        </div>

        {/* Tenant info */}
        {property.tenant_name && (
          <>
            <div className="border-t border-stone-100 my-3" />
            <p className="text-sm text-stone-500">
              Tenant: <span className="font-medium text-stone-700">{property.tenant_name}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
