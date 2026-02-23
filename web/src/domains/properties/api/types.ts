export type TProperty = {
  id: string;
  address: string;
  city?: string;
  type: string;
  bedrooms: number;
  rent_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  name?: string;
  bathrooms?: number;
  image_url?: string;
  tenant_name?: string;
};

export type TPropertyCreate = {
  address: string;
  city?: string;
  type: string;
  bedrooms: number;
  rent_amount: number;
  status?: string;
  name?: string;
  bathrooms?: number;
  image_url?: string;
  tenant_name?: string;
};

export type TPropertyUpdate = TPropertyCreate & {
  status: string;
};