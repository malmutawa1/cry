// Seed data for the Pressd operations terminal.
// Pressd is a *subscription* laundry (monthly kg allowance) with pickup &
// delivery — there is no walk-in counter and no cash tender. This terminal is
// the facility-side tool staff use to take in members' laundry, bill overflow
// as extra-kg blocks against the account, and watch operations.
//
// It stays self-contained (its own copy of the plan/extra figures that mirror
// the customer app) and persists to localStorage with no backend.

export interface Plan {
  id: string
  name: string
  /** Monthly subscription price in KWD. */
  priceKwd: number
  /** Monthly laundry allowance in kilograms. */
  capKg: number
  tagline: string
  popular?: boolean
}

export interface ExtraBlock {
  id: string
  kg: number
  priceKwd: number
}

export interface Member {
  id: string
  name: string
  phone: string
  area: string
  planId: string
  /** Kilograms already used in the current billing cycle. */
  kgUsed: number
  /** Masked card kept on file — overflow is billed here, never at a counter. */
  cardLast4: string
}

export interface OrderBlocks {
  /** count of 5 kg blocks added */
  k5: number
  /** count of 8 kg blocks added */
  k8: number
}

export interface Intake {
  id: string
  ts: number
  memberId: string
  memberName: string
  planId: string
  planName: string
  /** Weight of this batch (kg). */
  kg: number
  /** Allowance remaining before this batch was taken in. */
  remainingBefore: number
  /** Portion of the batch covered by the subscription allowance. */
  coveredKg: number
  /** Portion beyond the allowance. */
  overflowKg: number
  blocks: OrderBlocks
  /** Total extra capacity purchased (kg). */
  extraKgAdded: number
  /** Amount billed to the card on file for extra kg (KWD). */
  extraCharge: number
  hangers: boolean
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

// Subscription tiers — mirror the customer app's feasibility-study plans.
export const seedPlans: Plan[] = [
  { id: 'basic', name: 'Basic', priceKwd: 15, capKg: 20, tagline: 'Singles & couples' },
  { id: 'standard', name: 'Standard', priceKwd: 28, capKg: 40, tagline: 'Small families', popular: true },
  { id: 'premium', name: 'Premium', priceKwd: 45, capKg: 70, tagline: 'Larger families' },
  { id: 'family-plus', name: 'Family Plus', priceKwd: 65, capKg: 100, tagline: 'Heavy-use households' },
]

// Extra-capacity blocks, sold when a batch runs past the monthly allowance.
export const seedExtras: ExtraBlock[] = [
  { id: 'x5', kg: 5, priceKwd: 2 },
  { id: 'x8', kg: 8, priceKwd: 5 },
]

export const staff: Staff[] = [
  { id: 's-fatima', name: 'Fatima', role: 'Shift Lead', pin: '2468' },
  { id: 's-yousef', name: 'Yousef', role: 'Intake', pin: '1357' },
  { id: 's-ahmad', name: 'Ahmad', role: 'Intake', pin: '1111' },
]

// Member roster — the subscribers whose laundry comes through the facility.
export const seedMembers: Member[] = [
  { id: 'm-1001', name: 'Noura Al-Sabah', phone: '9945 1002', area: 'Salmiya, Block 10', planId: 'standard', kgUsed: 31, cardLast4: '4417' },
  { id: 'm-1002', name: 'Yousef Al-Ajmi', phone: '6612 8830', area: 'Jabriya, Block 3', planId: 'premium', kgUsed: 52, cardLast4: '9021' },
  { id: 'm-1003', name: 'Dana Khalid', phone: '5540 7781', area: 'Mishref, Block 6', planId: 'basic', kgUsed: 17, cardLast4: '1188' },
  { id: 'm-1004', name: 'Abdullah Al-Rashed', phone: '9901 4456', area: 'Rumaithiya, Block 2', planId: 'family-plus', kgUsed: 74, cardLast4: '3390' },
  { id: 'm-1005', name: 'Fatima Al-Enezi', phone: '6678 2213', area: 'Bayan, Block 7', planId: 'standard', kgUsed: 39, cardLast4: '7752' },
  { id: 'm-1006', name: 'Mishari Al-Otaibi', phone: '5023 9987', area: 'Salwa, Block 4', planId: 'basic', kgUsed: 8, cardLast4: '2204' },
  { id: 'm-1007', name: 'Latifa Bader', phone: '9987 1120', area: 'Qortuba, Block 1', planId: 'premium', kgUsed: 61, cardLast4: '6612' },
  { id: 'm-1008', name: 'Hamad Al-Failakawi', phone: '6650 3341', area: 'Surra, Block 5', planId: 'standard', kgUsed: 22, cardLast4: '8830' },
  { id: 'm-1009', name: 'Sara Al-Mutairi', phone: '5567 9004', area: 'Shaab, Block 8', planId: 'family-plus', kgUsed: 88, cardLast4: '1077' },
  { id: 'm-1010', name: 'Khaled Al-Duwaisan', phone: '9932 6650', area: 'Jabriya, Block 11', planId: 'basic', kgUsed: 19, cardLast4: '4520' },
  { id: 'm-1011', name: 'Maryam Al-Sabah', phone: '6604 8871', area: 'Mishref, Block 2', planId: 'premium', kgUsed: 45, cardLast4: '3011' },
  { id: 'm-1012', name: 'Talal Al-Harbi', phone: '5590 1123', area: 'Rumaithiya, Block 9', planId: 'standard', kgUsed: 36, cardLast4: '9948' },
]

export function planById(plans: Plan[], id: string): Plan | undefined {
  return plans.find((p) => p.id === id)
}

/** Cheapest set of extra blocks that covers `overflowKg`, using the cheapest
 *  per-kg block first. Returns block counts, total kg and total price. */
export function suggestBlocks(
  overflowKg: number,
  extras: ExtraBlock[],
): { k5: number; k8: number; kg: number; price: number } {
  const b5 = extras.find((e) => e.kg === 5) ?? { kg: 5, priceKwd: 2 }
  const b8 = extras.find((e) => e.kg === 8) ?? { kg: 8, priceKwd: 5 }
  if (overflowKg <= 0) return { k5: 0, k8: 0, kg: 0, price: 0 }
  // Order blocks by price-per-kg (cheapest first) and greedily cover.
  const perKg5 = b5.priceKwd / b5.kg
  const perKg8 = b8.priceKwd / b8.kg
  const [big, small] = perKg8 <= perKg5 ? [b8, b5] : [b5, b8]
  let remaining = overflowKg
  const countBig = Math.floor(remaining / big.kg)
  remaining -= countBig * big.kg
  const countSmall = remaining > 0 ? Math.ceil(remaining / small.kg) : 0
  const k5 = (big.kg === 5 ? countBig : 0) + (small.kg === 5 ? countSmall : 0)
  const k8 = (big.kg === 8 ? countBig : 0) + (small.kg === 8 ? countSmall : 0)
  const kg = k5 * 5 + k8 * 8
  const price = k5 * b5.priceKwd + k8 * b8.priceKwd
  return { k5, k8, kg, price }
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

// Membership-tier colours, drawn from the Zona lavender palette
// (light lavender → purple → near-black → green).
export const PLAN_COLOR: Record<string, string> = {
  basic: '#DBD3F5',
  standard: '#877FC1',
  premium: '#222026',
  'family-plus': '#34B37A',
}
