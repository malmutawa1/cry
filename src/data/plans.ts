// Subscription tiers — piece-based (item) model.
//
// The customer sees each plan as a number of *items per month*. Every physical
// piece counts as one or more allowance items based on its size (a suit = 3);
// the weighting lives in data/items.ts. Kilograms are tracked internally for
// costing only and never shown to the customer.

import type { Lang } from '../i18n'

export interface Plan {
  id: string
  name: string
  nameAr: string
  priceKwd: number
  /** Monthly allowance in items (weighted). Admin-editable. */
  items: number
  tagline: string
  taglineAr: string
  popular?: boolean
  perks: string[]
  perksAr: string[]
}

export const plans: Plan[] = [
  {
    id: 'solo',
    name: 'Solo',
    nameAr: 'فردي',
    priceKwd: 25,
    items: 70,
    tagline: 'For singles & couples',
    taglineAr: 'للأفراد والأزواج',
    perks: ['Free pickup & delivery', 'Next-day turnaround', 'Delivered on hangers', 'Pause anytime'],
    perksAr: ['استلام وتوصيل مجاني', 'تسليم في اليوم التالي', 'التوصيل على علاقات', 'إيقاف مؤقت في أي وقت'],
  },
  {
    id: 'family',
    name: 'Family',
    nameAr: 'عائلي',
    priceKwd: 40,
    items: 140,
    tagline: 'For small families',
    taglineAr: 'للعائلات الصغيرة',
    popular: true,
    perks: ['Free pickup & delivery', 'Next-day turnaround', 'Delivered on hangers', 'Priority scheduling'],
    perksAr: ['استلام وتوصيل مجاني', 'تسليم في اليوم التالي', 'التوصيل على علاقات', 'أولوية في المواعيد'],
  },
  {
    id: 'family-plus',
    name: 'Family Plus',
    nameAr: 'عائلي بلس',
    priceKwd: 65,
    items: 240,
    tagline: 'Larger families',
    taglineAr: 'للعائلات الكبيرة',
    perks: ['Dry-clean-grade care included', 'Free pickup & delivery', 'Same-day slots available', 'Delivered on hangers'],
    perksAr: ['عناية بمستوى التنظيف الجاف', 'استلام وتوصيل مجاني', 'مواعيد في نفس اليوم', 'التوصيل على علاقات'],
  },
  {
    id: 'max',
    name: 'Max',
    nameAr: 'ماكس',
    priceKwd: 85,
    items: 350,
    tagline: 'Heavy-use households',
    taglineAr: 'للاستخدام الكثيف',
    perks: ['Dry-clean-grade care included', 'Free pickup & delivery', 'Same-day slots available', 'Freeze anytime while travelling'],
    perksAr: ['عناية بمستوى التنظيف الجاف', 'استلام وتوصيل مجاني', 'مواعيد في نفس اليوم', 'إيقاف مؤقت عند السفر'],
  },
]

export type Billing = 'monthly' | 'annual'

// Annual billing charges for 10 months (2 months free) → ~17% saving.
export const ANNUAL_MONTHS = 10
export const ANNUAL_SAVING_PCT = Math.round((1 - ANNUAL_MONTHS / 12) * 100)

/** Amount charged per billing period. */
export function planPrice(p: Plan, billing: Billing): number {
  return billing === 'annual' ? p.priceKwd * ANNUAL_MONTHS : p.priceKwd
}

export function planName(p: Plan, lang: Lang): string {
  return lang === 'ar' ? p.nameAr : p.name
}
export function planTagline(p: Plan, lang: Lang): string {
  return lang === 'ar' ? p.taglineAr : p.tagline
}
export function planPerks(p: Plan, lang: Lang): string[] {
  return lang === 'ar' ? p.perksAr : p.perks
}
