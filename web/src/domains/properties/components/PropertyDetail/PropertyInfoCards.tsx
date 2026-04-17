import { Bed, DollarSign, Ruler } from 'lucide-react';
import type { TProperty } from '../../api';
import { StatCard } from '@/shared/components';
import { formatCurrency } from '@/shared/utils';

type TPropertyInfoCardsProps = {
  property: TProperty;
};

type TPropertyWithOptionalSize = TProperty & { square_feet?: number };

export const PropertyInfoCards = ({ property }: TPropertyInfoCardsProps) => {
  const squareFeet = (property as TPropertyWithOptionalSize).square_feet;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        label="Bedrooms"
        value={property.bedrooms}
        icon={<Bed size={20} aria-hidden />}
      />
      <StatCard
        label="Monthly Rent"
        value={formatCurrency(property.rent_amount)}
        icon={<DollarSign size={20} aria-hidden />}
      />
      <StatCard
        label="Size"
        value={squareFeet !== undefined ? `${squareFeet} sqft` : '—'}
        icon={<Ruler size={20} aria-hidden />}
      />
    </div>
  );
};
