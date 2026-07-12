// Subscription tiers — taken directly from the feasibility study (Section 5).
// Monthly membership model is the core differentiator vs. pay-per-order competitors.

export interface Plan {
  id: string
  name: string
  priceKwd: number
  capKg: number
  tagline: string
  segment: string
  popular?: boolean
  perks: string[]
}

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    priceKwd: 15,
    capKg: 20,
    tagline: 'For singles & couples',
    segment: 'Everyday essentials, washed & pressed',
    perks: ['Free pickup & delivery', 'Next-day turnaround', 'Delivered on hangers', 'Pause anytime'],
  },
  {
    id: 'standard',
    name: 'Standard',
    priceKwd: 28,
    capKg: 40,
    tagline: 'For small families',
    segment: 'Our most popular plan',
    popular: true,
    perks: [
      'Free pickup & delivery',
      'Next-day turnaround',
      'Delivered on hangers',
      'Priority scheduling',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceKwd: 45,
    capKg: 70,
    tagline: 'Larger families',
    segment: 'Includes dry-cleaning-grade items',
    perks: [
      'Dry-clean-grade care included',
      'Free pickup & delivery',
      'Same-day slots available',
      'Delivered on hangers',
    ],
  },
  {
    id: 'family-plus',
    name: 'Family Plus',
    priceKwd: 65,
    capKg: 100,
    tagline: 'Heavy-use households',
    segment: 'Maximum allowance & flexibility',
    perks: [
      'Dry-clean-grade care included',
      'Free pickup & delivery',
      'Same-day slots available',
      'Freeze anytime while travelling',
    ],
  },
]
