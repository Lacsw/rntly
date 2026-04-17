import { Bed, DollarSign } from 'lucide-react';
import type { TProperty } from '../../api';

type PropertyCardStatsProps = {
  property: TProperty;
};

export const PropertyCardStats = ({ property }: PropertyCardStatsProps) => {
  return (
    <div className="flex items-center gap-4 mt-3 text-sm text-stone-600">
      <div className="flex items-center gap-1">
        <Bed className="w-4 h-4" />
        <span>{property.bedrooms} bed</span>
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <DollarSign className="w-4 h-4" />
        <span className="font-semibold text-stone-900">
          {property.rent_amount}
        </span>
      </div>
    </div>
  );
};
