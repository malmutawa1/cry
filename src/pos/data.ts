// Seed data for the standalone Pressd POS.
// This POS is intentionally self-contained: it does NOT import from the
// customer app's data/ or store — it keeps its own catalog and sales log in
// localStorage so the terminal works with no backend.

export type Unit = 'item' | 'kg'

export interface Category {
  id: string
  name: string
  /** Emoji used as a lightweight tile glyph — no icon dependency. */
  glyph: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  /** Price in KWD (3-decimal fils precision). */
  price: number
  unit: Unit
  available: boolean
}

export interface Staff {
  id: string
  name: string
  role: string
  /** 4-digit counter passcode (prototype only). */
  pin: string
}

export type PaymentMethod = 'cash' | 'knet' | 'card'

export interface SaleLine {
  productId: string
  name: string
  unit: Unit
  price: number
  qty: number
}

export interface Sale {
  id: string
  ts: number
  staffId: string
  staffName: string
  method: PaymentMethod
  lines: SaleLine[]
  subtotal: number
  discountPct: number
  total: number
}

export const CURRENCY = 'KD'

/** Kuwaiti dinar is quoted to 3 decimals (1000 fils). */
export function money(kwd: number): string {
  return `${CURRENCY} ${kwd.toFixed(3)}`
}

export const categories: Category[] = [
  { id: 'wash', name: 'Wash & Fold', glyph: '🧺' },
  { id: 'dry', name: 'Dry Cleaning', glyph: '🥼' },
  { id: 'press', name: 'Ironing & Press', glyph: '👔' },
  { id: 'house', name: 'Household', glyph: '🛏️' },
  { id: 'express', name: 'Express', glyph: '⚡' },
]

export const seedProducts: Product[] = [
  // Wash & Fold — priced by weight.
  { id: 'wf-mixed', name: 'Mixed Wash & Fold', categoryId: 'wash', price: 1.5, unit: 'kg', available: true },
  { id: 'wf-delicate', name: 'Delicate Wash', categoryId: 'wash', price: 2.25, unit: 'kg', available: true },
  { id: 'wf-whites', name: 'Whites & Brights', categoryId: 'wash', price: 1.75, unit: 'kg', available: true },
  // Dry cleaning — per item.
  { id: 'dc-suit', name: 'Two-piece Suit', categoryId: 'dry', price: 3.5, unit: 'item', available: true },
  { id: 'dc-dishdasha', name: 'Dishdasha', categoryId: 'dry', price: 1.25, unit: 'item', available: true },
  { id: 'dc-abaya', name: 'Abaya', categoryId: 'dry', price: 1.5, unit: 'item', available: true },
  { id: 'dc-coat', name: 'Winter Coat', categoryId: 'dry', price: 4, unit: 'item', available: true },
  { id: 'dc-dress', name: 'Evening Dress', categoryId: 'dry', price: 3, unit: 'item', available: true },
  // Ironing & press — per item.
  { id: 'pr-shirt', name: 'Shirt Press', categoryId: 'press', price: 0.5, unit: 'item', available: true },
  { id: 'pr-trouser', name: 'Trouser Press', categoryId: 'press', price: 0.5, unit: 'item', available: true },
  { id: 'pr-dishdasha', name: 'Dishdasha Press', categoryId: 'press', price: 0.75, unit: 'item', available: true },
  { id: 'pr-thobe', name: 'Ghutra / Thobe Press', categoryId: 'press', price: 0.4, unit: 'item', available: true },
  // Household — per item.
  { id: 'hh-duvet', name: 'Duvet (Double)', categoryId: 'house', price: 4.5, unit: 'item', available: true },
  { id: 'hh-blanket', name: 'Blanket', categoryId: 'house', price: 3, unit: 'item', available: true },
  { id: 'hh-curtain', name: 'Curtain Panel', categoryId: 'house', price: 2, unit: 'item', available: true },
  { id: 'hh-rug', name: 'Small Rug', categoryId: 'house', price: 5, unit: 'item', available: false },
  // Express surcharge.
  { id: 'ex-sameday', name: 'Same-day Rush', categoryId: 'express', price: 2, unit: 'item', available: true },
  { id: 'ex-4hr', name: '4-hour Express', categoryId: 'express', price: 3.5, unit: 'item', available: true },
]

export const staff: Staff[] = [
  { id: 's-fatima', name: 'Fatima', role: 'Shift Lead', pin: '2468' },
  { id: 's-yousef', name: 'Yousef', role: 'Cashier', pin: '1357' },
  { id: 's-ahmad', name: 'Ahmad', role: 'Cashier', pin: '1111' },
]

export const paymentMethods: { id: PaymentMethod; label: string; glyph: string }[] = [
  { id: 'cash', label: 'Cash', glyph: '💵' },
  { id: 'knet', label: 'KNET', glyph: '🏧' },
  { id: 'card', label: 'Card', glyph: '💳' },
]
