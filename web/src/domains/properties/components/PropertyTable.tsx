import type { TProperty } from '../api';
import { StatusBadge } from '../../../shared/components/StatusBadge';

type PropertyTableProps = {
  properties: TProperty[];
  onDelete: (id: string) => void;
};

export const PropertyTable = ({ properties, onDelete }: PropertyTableProps) => {
  return (
    <>
      <div className="rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 text-gray-500 text-xs uppercase tracking-wider font-medium">Address</th>
              <th className="text-left p-3 text-gray-500 text-xs uppercase tracking-wider font-medium">Type</th>
              <th className="text-left p-3 text-gray-500 text-xs uppercase tracking-wider font-medium">Bedrooms</th>
              <th className="text-left p-3 text-gray-500 text-xs uppercase tracking-wider font-medium">Rent</th>
              <th className="text-left p-3 text-gray-500 text-xs uppercase tracking-wider font-medium">Status</th>
              <th className="text-left p-3 text-gray-500 text-xs uppercase tracking-wider font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{property.address}</td>
                <td className="p-3 capitalize">{property.type}</td>
                <td className="p-3">{property.bedrooms}</td>
                <td className="p-3">${property.rent_amount}</td>
                <td className="p-3">
                  <StatusBadge
                    status={property.status}
                    variant={property.status === 'vacant' ? 'green' : 'yellow'}
                  />
                </td>
                <td className="p-3">
                  <button
                    onClick={() => onDelete(property.id)}
                    className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {properties.length === 0 && (
        <p className="text-gray-500 mt-4">No properties yet.</p>
      )}
    </>
  );
};
