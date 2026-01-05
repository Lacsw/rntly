export type TTenant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

export type TTenantCreate = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

export type TTenantUpdate = TTenantCreate;