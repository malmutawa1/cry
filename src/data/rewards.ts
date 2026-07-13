export interface Reward {
  id: string
  titleKey: string
  pts: number
}

export const rewards: Reward[] = [
  { id: 'extra5', titleKey: 'reward.extra5', pts: 300 },
  { id: 'credit5', titleKey: 'reward.credit5', pts: 800 },
  { id: 'freemonth', titleKey: 'reward.freemonth', pts: 2500 },
]

export interface Tier {
  key: 'bronze' | 'silver' | 'gold'
  min: number
}

export const TIERS: Tier[] = [
  { key: 'bronze', min: 0 },
  { key: 'silver', min: 500 },
  { key: 'gold', min: 1500 },
]

export function tierInfo(points: number): { current: Tier; next: Tier | null; progress: number } {
  let idx = 0
  for (let i = 0; i < TIERS.length; i++) if (points >= TIERS[i].min) idx = i
  const current = TIERS[idx]
  const next = TIERS[idx + 1] ?? null
  const progress = next ? Math.min(1, (points - current.min) / (next.min - current.min)) : 1
  return { current, next, progress }
}
