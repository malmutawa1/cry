// Piece-based (item) pricing model — the shared, admin-editable config that
// the customer app, the POS terminal and the staff portal all read.
//
// Plans are sold to the customer as "items per month". Each physical piece
// counts as one or more allowance items depending on its size (a suit = 3),
// so we weight items by a per-category multiplier. Bedding (duvets etc.) is
// NOT counted against the allowance — it is a separate paid add-on.
//
// Internally we also track an estimated weight (kg) and processing cost per
// category — never shown to the customer — to drive the staff margin report.
//
// Like config.ts / rush.ts this lives under one localStorage key so the
// customer app and the POS (separate Vite entries, same origin) stay in sync.
// (When Supabase goes live this module is the seam to swap for the backend.)

import { useEffect, useState } from 'react'

export interface ItemCategory {
  id: string
  name: string
  nameAr: string
  /** Allowance items one physical piece of this size counts as (Regular = 1). */
  multiplier: number
  /** Estimated weight per piece (kg) — internal costing only, never shown. */
  kgEst: number
  /** Estimated processing cost per piece (KWD) — internal costing only. */
  costKwd: number
  /** Example garments, shown in the plain-language counting rule. */
  examples: string
  examplesAr: string
}

/** Bedding / bulky add-on billed on top of the subscription (not vs items). */
export interface AddOn {
  id: string
  name: string
  nameAr: string
  /** Flat fee charged per piece (KWD). */
  priceKwd: number
  /** Estimated weight (kg) — internal costing only. */
  kgEst: number
  /** Estimated processing cost (KWD) — internal costing only. */
  costKwd: number
}

export interface ItemsConfig {
  categories: ItemCategory[]
  addOns: AddOn[]
  /** Fee charged per weighted item beyond the plan allowance (KWD). */
  overagePerItem: number
}

export const ITEMS_DEFAULTS: ItemsConfig = {
  categories: [
    {
      id: 'regular',
      name: 'Regular item',
      nameAr: 'قطعة عادية',
      multiplier: 1,
      kgEst: 0.3,
      costKwd: 0.12,
      examples: 'Shirts, t-shirts, dishdasha, trousers, underwear, ghutra, light abaya',
      examplesAr: 'قمصان، تيشيرت، دشداشة، بناطيل، ملابس داخلية، غترة، عباية خفيفة',
    },
    {
      id: 'large',
      name: 'Large item',
      nameAr: 'قطعة كبيرة',
      multiplier: 3,
      kgEst: 1.2,
      costKwd: 0.45,
      examples: 'Suits, jackets, bisht, bed sheets, blankets, winter coats, heavy items',
      examplesAr: 'بدلات، جواكيت، بشت، شراشف، بطانيات، معاطف شتوية، قطع ثقيلة',
    },
    {
      id: 'xl',
      name: 'Extra-large item',
      nameAr: 'قطعة كبيرة جداً',
      multiplier: 6,
      kgEst: 2.2,
      costKwd: 0.9,
      examples: 'Heavy curtains and other bulky non-bedding items',
      examplesAr: 'ستائر ثقيلة وقطع ضخمة أخرى غير المفروشات',
    },
  ],
  addOns: [
    { id: 'duvet', name: 'Duvet', nameAr: 'لحاف', priceKwd: 2.5, kgEst: 2.5, costKwd: 1.0 },
    { id: 'comforter', name: 'Comforter', nameAr: 'مفرش سرير', priceKwd: 3, kgEst: 3, costKwd: 1.2 },
    { id: 'large-bedding', name: 'Large bedding set', nameAr: 'طقم مفروشات كبير', priceKwd: 4, kgEst: 4, costKwd: 1.6 },
  ],
  overagePerItem: 0.25,
}

// ---------------------------------------------------------------------------
// Persistence (shared across the customer app + POS via same-origin storage)
// ---------------------------------------------------------------------------
const KEY = 'pressd:items:config'
const EVENT = 'pressd:items:changed'

function emit() {
  try {
    window.dispatchEvent(new Event(EVENT))
  } catch {
    /* non-browser */
  }
}

/** Merge one stored record over a default, preserving any newer default keys. */
function mergeById<T extends { id: string }>(defaults: T[], stored?: Partial<T>[]): T[] {
  if (!Array.isArray(stored)) return defaults
  // Keep the default order/shape; overlay stored values by id.
  const byId = new Map(stored.filter((s) => s && s.id).map((s) => [s.id, s]))
  const merged = defaults.map((d) => ({ ...d, ...(byId.get(d.id) ?? {}) }))
  // Append any admin-added rows that aren't in defaults.
  for (const s of stored) {
    if (s && s.id && !defaults.some((d) => d.id === s.id)) merged.push(s as T)
  }
  return merged
}

export function getItemsConfig(): ItemsConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return ITEMS_DEFAULTS
    const p = JSON.parse(raw) as Partial<ItemsConfig>
    return {
      categories: mergeById(ITEMS_DEFAULTS.categories, p.categories as Partial<ItemCategory>[]),
      addOns: mergeById(ITEMS_DEFAULTS.addOns, p.addOns as Partial<AddOn>[]),
      overagePerItem: p.overagePerItem != null ? Math.max(0, Number(p.overagePerItem) || 0) : ITEMS_DEFAULTS.overagePerItem,
    }
  } catch {
    return ITEMS_DEFAULTS
  }
}

function write(next: ItemsConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable */
  }
  emit()
}

function clampCategory(c: ItemCategory): ItemCategory {
  return {
    ...c,
    multiplier: Math.max(1, Math.round(Number(c.multiplier) || 1)),
    kgEst: Math.max(0, Number(c.kgEst) || 0),
    costKwd: Math.max(0, Number(c.costKwd) || 0),
  }
}

/** Patch one item category (by id). */
export function setCategory(id: string, patch: Partial<ItemCategory>): ItemsConfig {
  const cfg = getItemsConfig()
  const categories = cfg.categories.map((c) => (c.id === id ? clampCategory({ ...c, ...patch }) : c))
  const next = { ...cfg, categories }
  write(next)
  return next
}

/** Patch one add-on (by id). */
export function setAddOn(id: string, patch: Partial<AddOn>): ItemsConfig {
  const cfg = getItemsConfig()
  const addOns = cfg.addOns.map((a) =>
    a.id === id
      ? {
          ...a,
          ...patch,
          priceKwd: Math.max(0, Number(patch.priceKwd ?? a.priceKwd) || 0),
          kgEst: Math.max(0, Number(patch.kgEst ?? a.kgEst) || 0),
          costKwd: Math.max(0, Number(patch.costKwd ?? a.costKwd) || 0),
        }
      : a,
  )
  const next = { ...cfg, addOns }
  write(next)
  return next
}

/** Set the per-item overage fee (KWD). */
export function setOveragePerItem(v: number): ItemsConfig {
  const next = { ...getItemsConfig(), overagePerItem: Math.max(0, Number(v) || 0) }
  write(next)
  return next
}

// ---------------------------------------------------------------------------
// Helpers — a "count map" is { [categoryId]: pieces }
// ---------------------------------------------------------------------------
export type ItemCounts = Record<string, number>

export function categoryById(cfg: ItemsConfig, id: string): ItemCategory | undefined {
  return cfg.categories.find((c) => c.id === id)
}

/** Weighted allowance items used by a set of pieces (suit ×3, etc.). */
export function weightedItems(counts: ItemCounts, cfg: ItemsConfig = getItemsConfig()): number {
  return cfg.categories.reduce((sum, c) => sum + (counts[c.id] || 0) * c.multiplier, 0)
}

/** Raw physical piece count (unweighted) — used for "22 items received". */
export function pieceCount(counts: ItemCounts): number {
  return Object.values(counts).reduce((s, n) => s + (n || 0), 0)
}

/** Estimated weight (kg) for a set of pieces — internal only. */
export function estKg(counts: ItemCounts, cfg: ItemsConfig = getItemsConfig()): number {
  return cfg.categories.reduce((sum, c) => sum + (counts[c.id] || 0) * c.kgEst, 0)
}

/** Estimated processing cost (KWD) for a set of pieces — internal only. */
export function estCost(counts: ItemCounts, cfg: ItemsConfig = getItemsConfig()): number {
  return cfg.categories.reduce((sum, c) => sum + (counts[c.id] || 0) * c.costKwd, 0)
}

export function categoryName(c: ItemCategory, lang: string): string {
  return lang === 'ar' ? c.nameAr : c.name
}
export function categoryExamples(c: ItemCategory, lang: string): string {
  return lang === 'ar' ? c.examplesAr : c.examples
}
export function addOnName(a: AddOn, lang: string): string {
  return lang === 'ar' ? a.nameAr : a.name
}

/** Subscribe to item-config changes (same tab + cross-tab). Returns unsub. */
export function subscribeItems(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}

/** Live view of the item config. Re-renders on any change (same/other app). */
export function useItemsConfig(): ItemsConfig {
  const [, force] = useState(0)
  useEffect(() => subscribeItems(() => force((n) => n + 1)), [])
  return getItemsConfig()
}
