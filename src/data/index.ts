export type City = { id: string; name: string; region: string };
export type SimpleItem = { id: number; label: string };

export const CITIES: City[] = [
  { id: '1', name: 'Київ', region: 'Київська' },
  { id: '2', name: 'Львів', region: 'Львівська' },
  { id: '3', name: 'Одеса', region: 'Одеська' },
  { id: '4', name: 'Харків', region: 'Харківська' },
  { id: '5', name: 'Дніпро', region: 'Дніпропетровська' },
];

export const SIMPLE_ITEMS: SimpleItem[] = [
  { id: 1, label: 'Item 1' },
  { id: 2, label: 'Item 2' },
  { id: 3, label: 'Item 3' },
];
