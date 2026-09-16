import { DayCode } from '../types';

export const MALAYSIAN_STATES = [
  'All States',
  'Selangor',
  'Kuala Lumpur',
  'Penang',
  'Johor',
  'Perak',
  'Melaka',
  'Kedah',
  'Negeri Sembilan',
  'Pahang',
  'Terengganu',
  'Kelantan',
  'Sabah',
  'Sarawak',
  'Putrajaya',
  'Perlis',
  'Labuan',
] as const;

export const DAY_CODES: DayCode[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const DAY_NAMES: Record<DayCode, { name: string; short: string; en: string; shortEn: string }> = {
  mon: { name: 'Monday', short: 'Mon', en: 'Monday', shortEn: 'Mon' },
  tue: { name: 'Tuesday', short: 'Tue', en: 'Tuesday', shortEn: 'Tue' },
  wed: { name: 'Wednesday', short: 'Wed', en: 'Wednesday', shortEn: 'Wed' },
  thu: { name: 'Thursday', short: 'Thu', en: 'Thursday', shortEn: 'Thu' },
  fri: { name: 'Friday', short: 'Fri', en: 'Friday', shortEn: 'Fri' },
  sat: { name: 'Saturday', short: 'Sat', en: 'Saturday', shortEn: 'Sat' },
  sun: { name: 'Sunday', short: 'Sun', en: 'Sunday', shortEn: 'Sun' },
};

export const POPULAR_FOOD_TAGS = [
  { id: 'all', name: 'All Foods' },
  { id: 'Apam Balik', name: 'Apam Balik' },
  { id: 'Ayam Gunting', name: 'Fried Chicken' },
  { id: 'Roti John', name: 'Roti John' },
  { id: 'Satay Ayam & Daging', name: 'Satay' },
  { id: 'Air Balang Jagung', name: 'Beverages' },
  { id: 'Char Kuey Teow', name: 'Char Kuey Teow' },
  { id: 'Kuih-Muih Tradisional', name: 'Traditional Cakes' },
  { id: 'Keropok Lekor', name: 'Keropok Lekor' },
  { id: 'Takoyaki', name: 'Takoyaki' },
  { id: 'Pisang Goreng Cheese', name: 'Fried Banana' },
  { id: 'Burger Ramly Banjir', name: 'Ramly Burger' },
  { id: 'Nasi Kukus Ayam Berempah', name: 'Steamed Rice' },
  { id: 'Lok-Lok', name: 'Lok-Lok' },
  { id: 'Murtabak', name: 'Murtabak' },
  { id: 'Otak-Otak', name: 'Otak-Otak' },
];

export const MALAYSIA_CENTER = {
  lat: 4.2105,
  lng: 101.9758,
  defaultZoom: 7,
};

export const KUALA_LUMPUR_CENTER = {
  lat: 3.139,
  lng: 101.6869,
};
