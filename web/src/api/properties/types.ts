export type TProperty = {
  id: string;
  address: string;
  type: string;
  bedrooms: number;
  rent_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TPropertyCreate = {
  address: string;
  type: string;
  bedrooms: number;
  rent_amount: number;
};

export type TPropertyUpdate = TPropertyCreate & {
  status: string;
};