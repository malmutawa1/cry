// Seed data for the Pressd operations terminal.
// Pressd is a *subscription* laundry with pickup & delivery — there is no
// walk-in counter and no cash tender. This terminal is the facility-side tool
// staff use to take in members' laundry piece by piece, weight each piece by
// its category (Regular = 1, Large = 3, Extra-large = 6), bill any items over
// the monthly allowance plus any bedding add-ons, and watch operations.
//
// It stays self-contained (its own copy of the plan figures that mirror the
// customer app) and persists to localStorage with no backend. Item weighting,
// per-category kg/cost and the overage fee come from the shared data/items.ts.
import type { RushTier } from '../data/rush'
import {
  getItemsConfig,
  weightedItems,
  pieceCount,
  estKg as estKgOf,
  estCost as estCostOf,
  type ItemCounts,
  type ItemsConfig,
} from '../data/items'

export interface Plan {
  id: string
  name: string
  /** Monthly subscription price in KWD. */
  priceKwd: number
  /** Monthly allowance in items (weighted). */
  items: number
  tagline: string
  popular?: boolean
}

export interface Member {
  id: string
  name: string
  phone: string
  area: string
  planId: string
  /** Weighted items already used in the current billing cycle. */
  itemsUsed: number
  /** Masked card kept on file — overage/add-ons billed here, never at a counter. */
  cardLast4: string
}

/** Bedding add-ons selected on an intake: { [addOnId]: count }. */
export type AddOnCounts = Record<string, number>

export interface Intake {
  id: string
  ts: number
  memberId: string
  memberName: string
  planId: string
  planName: string
  /** Pieces collected, by category id. */
  counts: ItemCounts
  /** Bedding add-ons collected, by add-on id. */
  addOnCounts: AddOnCounts
  /** Weighted allowance items this batch consumed. */
  items: number
  /** Physical piece count (unweighted) — "22 items received". */
  pieces: number
  /** Estimated weight of this batch (kg) — internal costing only. */
  estKg: number
  /** Estimated processing cost of this batch (KWD) — internal. */
  estCost: number
  /** Alias of estKg, kept so ops/quality dashboards keep working. */
  kg: number
  /** Allowance items remaining before this batch was taken in. */
  remainingBefore: number
  /** Weighted items beyond the allowance. */
  overageItems: number
  /** Amount billed for over-allowance items (KWD). */
  overageCharge: number
  /** Amount billed for bedding add-ons (KWD). */
  addOnCharge: number
  hangers: boolean
  /** Service speed. Express/Urgent add a rush fee and a tighter ready-by. */
  tier: RushTier
  /** Rush surcharge billed for this order (KWD); 0 for standard. */
  rushFee: number
  /** Promised ready-by time (epoch ms) derived from the tier SLA. */
  readyBy: number
  /** Legacy flag — kept in sync with `tier !== 'standard'` for older records. */
  express: boolean
  staffId: string
  staffName: string
}

export interface Staff {
  id: string
  name: string
  role: string
  pin: string
}

export const CURRENCY = 'KD'

/** Kuwaiti dinar is quoted to 3 decimals (1000 fils). */
export function money(kwd: number): string {
  return `${CURRENCY} ${kwd.toFixed(3)}`
}

// Subscription tiers — mirror the customer app's item-based plans.
export const seedPlans: Plan[] = [
  { id: 'solo', name: 'Solo', priceKwd: 22, items: 70, tagline: 'Singles & couples' },
  { id: 'family', name: 'Family', priceKwd: 40, items: 140, tagline: 'Small families', popular: true },
  { id: 'family-plus', name: 'Family Plus', priceKwd: 65, items: 240, tagline: 'Larger families' },
  { id: 'max', name: 'Max', priceKwd: 85, items: 350, tagline: 'Heavy-use households' },
]

export const staff: Staff[] = [
  { id: 's-fatima', name: 'Fatima', role: 'Shift Lead', pin: '2468' },
  { id: 's-yousef', name: 'Yousef', role: 'Intake', pin: '1357' },
  { id: 's-ahmad', name: 'Ahmad', role: 'Intake', pin: '1111' },
]

// Member roster — the subscribers whose laundry comes through the facility.
export const seedMembers: Member[] = [
  { id: 'm-1001', name: 'Noura Al-Sabah', phone: '9945 1002', area: 'Salmiya, Block 10', planId: 'family', itemsUsed: 96, cardLast4: '4417' },
  { id: 'm-1002', name: 'Yousef Al-Ajmi', phone: '6612 8830', area: 'Jabriya, Block 3', planId: 'family-plus', itemsUsed: 180, cardLast4: '9021' },
  { id: 'm-1003', name: 'Dana Khalid', phone: '5540 7781', area: 'Mishref, Block 6', planId: 'solo', itemsUsed: 58, cardLast4: '1188' },
  { id: 'm-1004', name: 'Abdullah Al-Rashed', phone: '9901 4456', area: 'Rumaithiya, Block 2', planId: 'max', itemsUsed: 300, cardLast4: '3390' },
  { id: 'm-1005', name: 'Fatima Al-Enezi', phone: '6678 2213', area: 'Bayan, Block 7', planId: 'family', itemsUsed: 132, cardLast4: '7752' },
  { id: 'm-1006', name: 'Mishari Al-Otaibi', phone: '5023 9987', area: 'Salwa, Block 4', planId: 'solo', itemsUsed: 24, cardLast4: '2204' },
  { id: 'm-1007', name: 'Latifa Bader', phone: '9987 1120', area: 'Qortuba, Block 1', planId: 'family-plus', itemsUsed: 205, cardLast4: '6612' },
  { id: 'm-1008', name: 'Hamad Al-Failakawi', phone: '6650 3341', area: 'Surra, Block 5', planId: 'family', itemsUsed: 74, cardLast4: '8830' },
  { id: 'm-1009', name: 'Sara Al-Mutairi', phone: '5567 9004', area: 'Shaab, Block 8', planId: 'max', itemsUsed: 340, cardLast4: '1077' },
  { id: 'm-1010', name: 'Khaled Al-Duwaisan', phone: '9932 6650', area: 'Jabriya, Block 11', planId: 'solo', itemsUsed: 63, cardLast4: '4520' },
  { id: 'm-1011', name: 'Maryam Al-Sabah', phone: '6604 8871', area: 'Mishref, Block 2', planId: 'family-plus', itemsUsed: 150, cardLast4: '3011' },
  { id: 'm-1012', name: 'Talal Al-Harbi', phone: '5590 1123', area: 'Rumaithiya, Block 9', planId: 'family', itemsUsed: 118, cardLast4: '9948' },
]

export function planById(plans: Plan[], id: string): Plan | undefined {
  return plans.find((p) => p.id === id)
}

/** Full costing for a batch of pieces + bedding add-ons against a member's
 *  remaining allowance. Used by both the live intake flow and the seed. */
export function costIntake(
  counts: ItemCounts,
  addOnCounts: AddOnCounts,
  remainingBefore: number,
  cfg: ItemsConfig = getItemsConfig(),
): {
  items: number
  pieces: number
  estKg: number
  estCost: number
  overageItems: number
  overageCharge: number
  addOnCharge: number
} {
  const items = weightedItems(counts, cfg)
  const pieces = pieceCount(counts)
  const estKg = round3(estKgOf(counts, cfg))
  let estCost = estCostOf(counts, cfg)
  let addOnCharge = 0
  for (const a of cfg.addOns) {
    const n = addOnCounts[a.id] || 0
    if (n > 0) {
      addOnCharge += n * a.priceKwd
      estCost += n * a.costKwd
    }
  }
  const overageItems = Math.max(0, items - Math.max(0, remainingBefore))
  const overageCharge = round3(overageItems * cfg.overagePerItem)
  return { items, pieces, estKg, estCost: round3(estCost), overageItems, overageCharge, addOnCharge: round3(addOnCharge) }
}

export function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

// --- Operations demo figures (throughput & quality), mirroring the app's
//     facility-side staff view. Turnaround / on-time / rewash are steady-state
//     metrics that wouldn't be derivable from a day of seeded intakes. ---
export const ops = {
  onTimePct: 96,
  slaTargetPct: 95,
  avgTurnaroundH: 22,
  rewashPct: 2.4,
  capacityPct: 78,
  qcPassPct: 97.6,
}

export interface ThroughputDay {
  label: string
  kg: number
}
export const throughputSeed: ThroughputDay[] = [
  { label: 'Sat', kg: 620 },
  { label: 'Sun', kg: 540 },
  { label: 'Mon', kg: 580 },
  { label: 'Tue', kg: 700 },
  { label: 'Wed', kg: 660 },
  { label: 'Thu', kg: 480 },
  { label: 'Fri', kg: 300 },
]

// --- Driver scheduling (pickup & delivery availability) ---
export type SlotType = 'pickup' | 'delivery'

/** Bookable hours in the working day (24h). */
export const DAY_SLOTS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

export function formatHour(h: number): string {
  const am = h < 12
  const hh = h % 12 || 12
  return `${String(hh).padStart(2, '0')}:00 ${am ? 'AM' : 'PM'}`
}

/** Local calendar key (YYYY-MM-DD) — avoids UTC drift from toISOString. */
export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Composite key identifying one driver slot. */
export function slotKey(type: SlotType, day: string, hour: number): string {
  return `${type}|${day}|${hour}`
}

// Membership-tier colours, drawn from the Zona lavender palette
// (light lavender → purple → near-black → green).
export const PLAN_COLOR: Record<string, string> = {
  solo: '#DBD3F5',
  family: '#877FC1',
  'family-plus': '#222026',
  max: '#34B37A',
}
