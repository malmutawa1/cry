// Item catalog + per-item services, styled after the reference screens.
// Prices in KWD. "Dishdasha (Summer) from 0.350" etc. match the reference photos.

export type Category = 'Traditional' | "Women's" | "Men's" | 'Household'

export interface Service {
  id: string
  name: string
  priceKwd: number
}

export interface CatalogItem {
  id: string
  name: string
  category: Category
  /** id of an inline SVG illustration in Garment.tsx */
  art: string
  services: Service[]
}

const standardServices: Service[] = [
  { id: 'wash-press', name: 'Wash and press', priceKwd: 0.6 },
  { id: 'dry-clean', name: 'Dry clean', priceKwd: 0.75 },
  { id: 'press-only', name: 'Press only', priceKwd: 0.35 },
]

const beshtServices: Service[] = [
  { id: 'dry-clean', name: 'Dry clean', priceKwd: 3.0 },
  { id: 'press-only', name: 'Steam press', priceKwd: 1.5 },
]

const householdServices: Service[] = [
  { id: 'wash-fold', name: 'Wash and fold', priceKwd: 0.9 },
  { id: 'wash-press', name: 'Wash and press', priceKwd: 1.2 },
]

export const categories: Category[] = ['Traditional', "Women's", "Men's", 'Household']

export const catalog: CatalogItem[] = [
  {
    id: 'besht',
    name: 'Besht',
    category: 'Traditional',
    art: 'besht',
    services: beshtServices,
  },
  {
    id: 'besht-winter',
    name: 'Besht (Winter)',
    category: 'Traditional',
    art: 'besht',
    services: [
      { id: 'dry-clean', name: 'Dry clean', priceKwd: 3.5 },
      { id: 'press-only', name: 'Steam press', priceKwd: 2.0 },
    ],
  },
  {
    id: 'dishdasha-summer',
    name: 'Dishdasha (Summer)',
    category: "Men's",
    art: 'dishdasha',
    services: standardServices,
  },
  {
    id: 'dishdasha-winter',
    name: 'Dishdasha (Winter)',
    category: "Men's",
    art: 'dishdasha',
    services: [
      { id: 'wash-press', name: 'Wash and press', priceKwd: 0.7 },
      { id: 'dry-clean', name: 'Dry clean', priceKwd: 0.9 },
      { id: 'press-only', name: 'Press only', priceKwd: 0.4 },
    ],
  },
  {
    id: 'ghutra',
    name: 'Ghutra / Shemagh',
    category: 'Traditional',
    art: 'ghutra',
    services: [
      { id: 'wash-press', name: 'Wash and press', priceKwd: 0.25 },
      { id: 'press-only', name: 'Press only', priceKwd: 0.15 },
    ],
  },
  {
    id: 'abaya',
    name: 'Abaya',
    category: "Women's",
    art: 'abaya',
    services: standardServices,
  },
  {
    id: 'dress',
    name: 'Dress',
    category: "Women's",
    art: 'dress',
    services: standardServices,
  },
  {
    id: 'shirt',
    name: 'Shirt',
    category: "Men's",
    art: 'shirt',
    services: [
      { id: 'wash-press', name: 'Wash and press', priceKwd: 0.4 },
      { id: 'dry-clean', name: 'Dry clean', priceKwd: 0.55 },
      { id: 'press-only', name: 'Press only', priceKwd: 0.25 },
    ],
  },
  {
    id: 'trousers',
    name: 'Trousers',
    category: "Men's",
    art: 'trousers',
    services: [
      { id: 'wash-press', name: 'Wash and press', priceKwd: 0.45 },
      { id: 'dry-clean', name: 'Dry clean', priceKwd: 0.6 },
      { id: 'press-only', name: 'Press only', priceKwd: 0.3 },
    ],
  },
  {
    id: 'bedsheet',
    name: 'Bed sheet',
    category: 'Household',
    art: 'bedsheet',
    services: householdServices,
  },
  {
    id: 'towel',
    name: 'Towel',
    category: 'Household',
    art: 'towel',
    services: [
      { id: 'wash-fold', name: 'Wash and fold', priceKwd: 0.4 },
    ],
  },
  {
    id: 'blanket',
    name: 'Blanket',
    category: 'Household',
    art: 'blanket',
    services: [
      { id: 'wash-fold', name: 'Wash and fold', priceKwd: 1.5 },
      { id: 'dry-clean', name: 'Dry clean', priceKwd: 2.5 },
    ],
  },
]

export function itemStartingPrice(item: CatalogItem): number {
  return Math.min(...item.services.map((s) => s.priceKwd))
}
