import type { TProperty } from '../../api';
import { StatusBadge } from '@/shared/components';
import { BuildingIcon } from '@/shared/icons/BuildingIcon';

type PropertyCardImageProps = {
  property: TProperty;
  displayName: string;
};

export const PropertyCardImage = ({ property, displayName }: PropertyCardImageProps) => {
  return (
    <div className="relative aspect-16/10 bg-stone-200">
      {property.image_url ? (
        <img
          src={property.image_url}
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-stone-400">
          <BuildingIcon className="w-12 h-12" />
        </div>
      )}

      <div className="absolute top-3 left-3">
        <StatusBadge
          status={property.status}
          variant={property.status === 'vacant' ? 'green' : 'yellow'}
        />
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span className="bg-white/80 backdrop-blur text-stone-700 text-xs rounded-full px-3 py-1 capitalize">
          {property.type}
        </span>
      </div>
    </div>
  );
};
