import type { TProperty } from '../api';

type PropertyTableProps = {
  properties: TProperty[];
  onDelete: (id: string) => void;
};

export const PropertyTable = ({ properties, onDelete }: PropertyTableProps) => {
  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="text-left p-3">Address</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Bedrooms</th>
              <th className="text-left p-3">Rent</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">{property.address}</td>
                <td className="p-3 capitalize">{property.type}</td>
                <td className="p-3">{property.bedrooms}</td>
                <td className="p-3">${property.rent_amount}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      property.status === 'vacant'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {property.status}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => onDelete(property.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
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
        <p className="text-slate-500 mt-4">No properties yet.</p>
      )}
    </>
  );
};
