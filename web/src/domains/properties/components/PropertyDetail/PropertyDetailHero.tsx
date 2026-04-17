import type { TProperty } from '../../api';
import { BuildingIcon } from '@/shared/icons/BuildingIcon';
import { formatCurrency } from '@/shared/utils';

type TPropertyDetailHeroProps = {
  property: TProperty;
};

export const PropertyDetailHero = ({ property }: TPropertyDetailHeroProps) => {
  return (
    <div className="relative aspect-[16/9] bg-stone-200 rounded-xl overflow-hidden mb-6">
      {property.image_url ? (
        <img
          src={property.image_url}
          alt={property.address}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-stone-400">
          <BuildingIcon className="w-24 h-24" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="absolute bottom-4 left-4 text-white">
        <p className="text-xs capitalize opacity-80">{property.type}</p>
        <p className="text-2xl font-bold">{formatCurrency(property.rent_amount)}/mo</p>
      </div>
    </div>
  );
};
