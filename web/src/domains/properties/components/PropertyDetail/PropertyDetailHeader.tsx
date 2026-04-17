import type { ReactNode } from 'react';
import { PageHeader, StatusBadge } from '@/shared/components';
import type { TProperty } from '../../api';

type TPropertyDetailHeaderProps = {
  property: TProperty;
  actions?: ReactNode;
};

export const PropertyDetailHeader = ({ property, actions }: TPropertyDetailHeaderProps) => {
  return (
    <PageHeader
      title={property.address}
      backHref="/properties"
      actions={
        <div className="flex items-center gap-3">
          <StatusBadge
            status={property.status}
            variant={property.status === 'vacant' ? 'green' : 'yellow'}
          />
          {actions}
        </div>
      }
    />
  );
};
