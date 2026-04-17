import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MoreVertical, Trash2 } from 'lucide-react';
import type { TProperty } from '../../api';
import { PropertyCardImage } from './PropertyCardImage';
import { PropertyCardStats } from './PropertyCardStats';
import { PropertyCardTenant } from './PropertyCardTenant';
import { ConfirmDialog } from '@/shared/components';

type TPropertyCardProps = {
  property: TProperty;
  onDelete?: (id: string) => void;
};

export const PropertyCard = ({ property, onDelete }: TPropertyCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuId = useId();

  const stopPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 relative">
      {onDelete && (
        <div className="absolute top-2 right-2 z-10" onClick={stopPropagation}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm"
            aria-label="Property actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
          >
            <MoreVertical size={16} aria-hidden />
          </button>
          {menuOpen && (
            <div
              id={menuId}
              className="absolute right-0 mt-1 bg-white border border-stone-100 rounded-lg shadow-md py-1 min-w-[120px]"
              role="menu"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                role="menuitem"
              >
                <Trash2 size={14} aria-hidden />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <Link to={`/properties/${property.id}`} className="block">
        <PropertyCardImage property={property} />

        <div className="p-4">
          <h3 className="text-lg font-semibold text-stone-900 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-stone-500" aria-hidden />
            <span>{property.address}</span>
          </h3>

          <PropertyCardStats property={property} />

          {property.tenant_name && <PropertyCardTenant name={property.tenant_name} />}
        </div>
      </Link>

      {onDelete && (
        <ConfirmDialog
          open={confirmOpen}
          title="Delete property"
          message={`Are you sure you want to delete ${property.address}? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            onDelete(property.id);
            setConfirmOpen(false);
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};
