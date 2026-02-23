import type { TPropertyCreate } from '../../api';

export const DEFAULT_FORM_DATA: TPropertyCreate = {
  name: '',
  address: '',
  city: '',
  type: 'apartment',
  status: 'vacant',
  bedrooms: 1,
  bathrooms: 1,
  rent_amount: 0,
};

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'studio', label: 'Studio' },
  { value: 'condo', label: 'Condo' },
];

export const STATUS_OPTIONS = [
  { value: 'vacant', label: 'Vacant' },
  { value: 'occupied', label: 'Occupied' },
];
