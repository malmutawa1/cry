// Subscription tiers — taken from the feasibility study (Section 5).
// Monthly membership model is the core differentiator vs. pay-per-order competitors.

import type { Lang } from '../i18n'

export interface Plan {
  id: string
  name: string
  nameAr: string
  priceKwd: number
  capKg: number
  tagline: string
  taglineAr: string
  popular?: boolean
  perks: string[]
  perksAr: string[]
}

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    nameAr: 'أساسي',
    priceKwd: 15,
    capKg: 20,
    tagline: 'For singles & couples',
    taglineAr: 'للأفراد والأزواج',
    perks: ['Free pickup & delivery', 'Next-day turnaround', 'Delivered on hangers', 'Pause anytime'],
    perksAr: ['استلام وتوصيل مجاني', 'تسليم في اليوم التالي', 'التوصيل على علاقات', 'إيقاف مؤقت في أي وقت'],
  },
  {
    id: 'standard',
    name: 'Standard',
    nameAr: 'قياسي',
    priceKwd: 28,
    capKg: 40,
    tagline: 'For small families',
    taglineAr: 'للعائلات الصغيرة',
    popular: true,
    perks: ['Free pickup & delivery', 'Next-day turnaround', 'Delivered on hangers', 'Priority scheduling'],
    perksAr: ['استلام وتوصيل مجاني', 'تسليم في اليوم التالي', 'التوصيل على علاقات', 'أولوية في المواعيد'],
  },
  {
    id: 'premium',
    name: 'Premium',
    nameAr: 'بريميوم',
    priceKwd: 45,
    capKg: 70,
    tagline: 'Larger families',
    taglineAr: 'للعائلات الكبيرة',
    perks: ['Dry-clean-grade care included', 'Free pickup & delivery', 'Same-day slots available', 'Delivered on hangers'],
    perksAr: ['عناية بمستوى التنظيف الجاف', 'استلام وتوصيل مجاني', 'مواعيد في نفس اليوم', 'التوصيل على علاقات'],
  },
  {
    id: 'family-plus',
    name: 'Family Plus',
    nameAr: 'عائلي بلس',
    priceKwd: 65,
    capKg: 100,
    tagline: 'Heavy-use households',
    taglineAr: 'للاستخدام الكثيف',
    perks: ['Dry-clean-grade care included', 'Free pickup & delivery', 'Same-day slots available', 'Freeze anytime while travelling'],
    perksAr: ['عناية بمستوى التنظيف الجاف', 'استلام وتوصيل مجاني', 'مواعيد في نفس اليوم', 'إيقاف مؤقت عند السفر'],
  },
]

export function planName(p: Plan, lang: Lang): string {
  return lang === 'ar' ? p.nameAr : p.name
}
export function planTagline(p: Plan, lang: Lang): string {
  return lang === 'ar' ? p.taglineAr : p.tagline
}
export function planPerks(p: Plan, lang: Lang): string[] {
  return lang === 'ar' ? p.perksAr : p.perks
}
