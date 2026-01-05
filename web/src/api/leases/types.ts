export type TLease = {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TLeaseCreate = {
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit: number;
};

export type TLeaseUpdate = {
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit: number;
  status: string;
};