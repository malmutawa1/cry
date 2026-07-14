// Domain catalog + loyalty rules — mirrors the frontend (src/data/plans.ts, rewards.ts).

export type Billing = 'monthly' | 'annual'

export interface Plan {
  id: string
  name: string
  priceKwd: number
  capKg: number
  tagline: string
  popular?: boolean
  perks: string[]
}

export const PLANS: Plan[] = [
  { id: 'basic', name: 'Basic', priceKwd: 15, capKg: 20, tagline: 'For singles & couples', perks: ['Free pickup & delivery', 'Next-day turnaround', 'Delivered on hangers', 'Pause anytime'] },
  { id: 'standard', name: 'Standard', priceKwd: 28, capKg: 40, tagline: 'For small families', popular: true, perks: ['Free pickup & delivery', 'Next-day turnaround', 'Delivered on hangers', 'Priority scheduling'] },
  { id: 'premium', name: 'Premium', priceKwd: 45, capKg: 70, tagline: 'Larger families', perks: ['Dry-clean-grade care included', 'Free pickup & delivery', 'Same-day slots available', 'Delivered on hangers'] },
  { id: 'family-plus', name: 'Family Plus', priceKwd: 65, capKg: 100, tagline: 'Heavy-use households', perks: ['Dry-clean-grade care included', 'Free pickup & delivery', 'Same-day slots available', 'Freeze anytime while travelling'] },
]

/** Annual billing charges for 10 months (2 free) → ~17% saving. */
export const ANNUAL_MONTHS = 10

export function planById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}

export function planPrice(plan: Plan, billing: Billing): number {
  return billing === 'annual' ? plan.priceKwd * ANNUAL_MONTHS : plan.priceKwd
}

/** End of the current billing period given a start (epoch ms). */
export function periodEnd(startedAt: number, billing: Billing): number {
  const d = new Date(startedAt)
  if (billing === 'annual') d.setFullYear(d.getFullYear() + 1)
  else d.setMonth(d.getMonth() + 1)
  return d.getTime()
}

// ---- Loyalty ----
export const POINTS_PER_PICKUP = 50

export type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum'
export const TIERS: { key: TierKey; min: number }[] = [
  { key: 'bronze', min: 0 },
  { key: 'silver', min: 1500 },
  { key: 'gold', min: 5000 },
  { key: 'platinum', min: 12000 },
]

export function tierInfo(lifetimePoints: number) {
  let idx = 0
  for (let i = 0; i < TIERS.length; i++) if (lifetimePoints >= TIERS[i]!.min) idx = i
  const current = TIERS[idx]!
  const next = TIERS[idx + 1] ?? null
  const progress = next ? Math.min(1, (lifetimePoints - current.min) / (next.min - current.min)) : 1
  return { current: current.key, next: next?.key ?? null, nextAt: next?.min ?? null, progress }
}

export interface Reward {
  id: string
  title: string
  pts: number
  /** perk applied on redeem */
  effect: 'extraKg' | 'credit' | 'freeMonth'
  amount: number
}

export const REWARDS: Reward[] = [
  { id: 'extra5', title: 'Free extra 5 kg', pts: 750, effect: 'extraKg', amount: 5 },
  { id: 'credit5', title: '5 KWD account credit', pts: 2000, effect: 'credit', amount: 5 },
  { id: 'freemonth', title: 'One free month', pts: 6000, effect: 'freeMonth', amount: 1 },
]

/** One-time extra-capacity top-ups (mirrors src/data/extras.ts). */
export const EXTRAS: { kg: number; priceKwd: number }[] = [
  { kg: 5, priceKwd: 2 },
  { kg: 8, priceKwd: 5 },
]

// ---- Order tracking ----
export const ORDER_STAGES = ['scheduled', 'picked_up', 'washing', 'ready', 'out_for_delivery', 'delivered'] as const
export type OrderStage = (typeof ORDER_STAGES)[number]
export const STAGE_LABELS: Record<OrderStage, string> = {
  scheduled: 'Pickup scheduled',
  picked_up: 'Picked up',
  washing: 'Washing & pressing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
}
export const LAST_STAGE = ORDER_STAGES.length - 1

// ---- Referrals ----
/** Points awarded to the referrer, and KWD credit given to the invited user. */
export const REFERRAL_REWARD_POINTS = 200
export const REFERRAL_CREDIT_KWD = 5

// ---- Card brand detection (mirrors src/store.tsx addCard) ----
export function cardBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa'
  if (/^5/.test(digits)) return 'Mastercard'
  return 'Card'
}
