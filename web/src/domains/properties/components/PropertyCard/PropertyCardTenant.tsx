type PropertyCardTenantProps = {
  name: string;
};

export const PropertyCardTenant = ({ name }: PropertyCardTenantProps) => {
  return (
    <>
      <div className="border-t border-stone-100 my-3" />
      <p className="text-sm text-stone-500">
        Tenant: <span className="font-medium text-stone-700">{name}</span>
      </p>
    </>
  );
};
