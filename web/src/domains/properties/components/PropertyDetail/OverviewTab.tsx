import type { TProperty } from '../../api';

type TOverviewTabProps = {
  property: TProperty;
};

type TPropertyWithExtras = TProperty & {
  year_built?: number;
  square_feet?: number;
  description?: string;
  amenities?: string[];
};

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <p className="text-xs text-stone-500">{label}</p>
    <p className="text-sm font-medium text-stone-900 mt-0.5">{value}</p>
  </div>
);

export const OverviewTab = ({ property }: TOverviewTabProps) => {
  const extras = property as TPropertyWithExtras;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-stone-100 p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Property Details</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <DetailRow label="Type" value={property.type.charAt(0).toUpperCase() + property.type.slice(1)} />
          <DetailRow label="Square Footage" value={extras.square_feet !== undefined ? `${extras.square_feet} sq ft` : '—'} />
          <DetailRow label="Year Built" value={extras.year_built ?? '—'} />
          <DetailRow label="Status" value={property.status} />
        </div>
        <div className="mt-4">
          <p className="text-xs text-stone-500">Description</p>
          <p className="text-sm text-stone-900 mt-0.5">
            {extras.description ?? 'No description yet.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-100 p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Amenities</h2>
        {extras.amenities && extras.amenities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {extras.amenities.map((a) => (
              <span
                key={a}
                className="bg-stone-100 text-stone-700 text-xs rounded-full px-3 py-1"
              >
                {a}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">No amenities listed.</p>
        )}
      </div>
    </div>
  );
};
