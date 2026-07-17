// Discount / promo codes — created by staff, redeemed by customers.
//
// Shared across the customer app + POS terminal via same-origin localStorage
// (the same seam as rush.ts / config.ts). Staff create codes in the operations
// portal; customers type them at checkout and the matching discount is applied.

export type DiscountKind = 'percent' | 'fixed'
/** Where a code can be redeemed: subscription plans, rush fees, or both. */
export type DiscountScope = 'plans' | 'rush' | 'all'

export interface Discount {
  /** Uppercase, unique. */
  code: string
  kind: DiscountKind
  /** Percent (0–100) for 'percent', KWD amount for 'fixed'. */
  value: number
  scope: DiscountScope
  active: boolean
  /** Times this code has been applied at checkout. */
  uses: number
  createdAt: number
}

const DISCOUNTS_KEY = 'pressd:discounts'
const EVENT = 'pressd:discounts:changed'

const SEED: Discount[] = [
  { code: 'WELCOME10', kind: 'percent', value: 10, scope: 'plans', active: true, uses: 0, createdAt: 0 },
]

function emit() {
  try {
    window.dispatchEvent(new Event(EVENT))
  } catch {
    /* non-browser */
  }
}

export function getDiscounts(): Discount[] {
  try {
    const raw = localStorage.getItem(DISCOUNTS_KEY)
    if (!raw) return SEED
    const arr = JSON.parse(raw) as Discount[]
    return Array.isArray(arr) ? arr : SEED
  } catch {
    return SEED
  }
}

function write(list: Discount[]) {
  try {
    localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable */
  }
  emit()
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '')
}

/** Add a code (clamped). Returns the updated list, or null if the code is a dup. */
export function addDiscount(input: {
  code: string
  kind: DiscountKind
  value: number
  scope: DiscountScope
}): Discount[] | null {
  const code = normalizeCode(input.code)
  if (!code) return null
  const list = getDiscounts()
  if (list.some((d) => d.code === code)) return null
  const value =
    input.kind === 'percent'
      ? Math.min(100, Math.max(0, Math.round(Number(input.value) || 0)))
      : Math.max(0, Number(input.value) || 0)
  const next: Discount[] = [
    { code, kind: input.kind, value, scope: input.scope, active: true, uses: 0, createdAt: Date.now() },
    ...list,
  ]
  write(next)
  return next
}

export function toggleDiscount(code: string): Discount[] {
  const next = getDiscounts().map((d) => (d.code === code ? { ...d, active: !d.active } : d))
  write(next)
  return next
}

export function removeDiscount(code: string): Discount[] {
  const next = getDiscounts().filter((d) => d.code !== code)
  write(next)
  return next
}

/** Find an active code usable for a given scope. */
export function findDiscount(code: string, scope: 'plans' | 'rush'): Discount | null {
  const c = normalizeCode(code)
  const d = getDiscounts().find((x) => x.code === c)
  if (!d || !d.active) return null
  if (d.scope !== 'all' && d.scope !== scope) return null
  return d
}

/** Apply a discount to an amount (KWD). Never returns a negative total. */
export function applyDiscount(amount: number, d: Discount): { total: number; saved: number } {
  const saved = d.kind === 'percent' ? (amount * d.value) / 100 : Math.min(amount, d.value)
  const total = Math.max(0, amount - saved)
  return { total: round3(total), saved: round3(Math.min(amount, saved)) }
}

/** Increment a code's redemption counter. */
export function recordDiscountUse(code: string): void {
  const c = normalizeCode(code)
  const next = getDiscounts().map((d) => (d.code === c ? { ...d, uses: d.uses + 1 } : d))
  write(next)
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

export function subscribeDiscounts(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === DISCOUNTS_KEY || e.key === null) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}
