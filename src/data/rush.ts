// Rush-service pricing, guardrails, and the shared daily-cap ledger.
//
// The customer app and the POS terminal are separate Vite entries but the SAME
// origin, so they share localStorage. This module is the single source of truth
// both import: admin-editable fees + cap live under one key, and every accepted
// rush order is appended to a shared ledger used for the daily cap, the live
// counter, late-tracking, and reporting. (When Supabase goes live this module
// is the seam to swap local storage for the backend.)

export type RushTier = 'standard' | 'express' | 'urgent'

export interface RushSettings {
  /** Extra fee (KWD) for Express (≤24h). Admin-editable. */
  expressFee: number
  /** Extra fee (KWD) for Urgent / same-day. Admin-editable. */
  urgentFee: number
  /** Max combined Express + Urgent orders accepted per day. Admin-editable. */
  dailyCap: number
}

export const RUSH_DEFAULTS: RushSettings = {
  expressFee: 3,
  urgentFee: 6,
  dailyCap: 6,
}

export interface TierMeta {
  id: RushTier
  /** Turnaround used to compute the promised ready-by time. */
  slaHours: number
  label: { en: string; ar: string }
  /** Short promise shown next to the fee ("ready by tomorrow"). */
  ready: { en: string; ar: string }
  /** Accent colour; urgent is the most prominent. */
  color: string
}

// SLA windows are fixed constants (only the fees + cap are admin-editable).
export const TIERS: Record<RushTier, TierMeta> = {
  standard: {
    id: 'standard',
    slaHours: 48,
    label: { en: 'Standard', ar: 'عادي' },
    ready: { en: 'ready in 1–2 days', ar: 'جاهز خلال يوم–يومين' },
    color: '#4cc4ff',
  },
  express: {
    id: 'express',
    slaHours: 24,
    label: { en: 'Express', ar: 'سريع' },
    ready: { en: 'ready by tomorrow', ar: 'جاهز غداً' },
    color: '#f0932b',
  },
  urgent: {
    id: 'urgent',
    slaHours: 4,
    label: { en: 'Urgent · Same-day', ar: 'عاجل · نفس اليوم' },
    ready: { en: 'ready in a few hours', ar: 'جاهز خلال ساعات' },
    color: '#e5484d',
  },
}

export const RUSH_TIER_ORDER: RushTier[] = ['standard', 'express', 'urgent']

/** Fee (KWD) for a tier under the current settings. Standard is always free. */
export function tierFee(tier: RushTier, s: RushSettings): number {
  if (tier === 'express') return s.expressFee
  if (tier === 'urgent') return s.urgentFee
  return 0
}

export function isRush(tier: RushTier | undefined | null): tier is 'express' | 'urgent' {
  return tier === 'express' || tier === 'urgent'
}

/** Promised ready-by timestamp for an order placed at `fromTs`. */
export function readyBy(tier: RushTier, fromTs: number): number {
  return fromTs + TIERS[tier].slaHours * 3600_000
}

// ---------------------------------------------------------------------------
// Persistence (shared across the customer app + POS via same-origin storage)
// ---------------------------------------------------------------------------
const SETTINGS_KEY = 'pressd:rush:settings'
const LEDGER_KEY = 'pressd:rush:ledger'
const EVENT = 'pressd:rush:changed'

export interface RushEntry {
  id: string
  tier: 'express' | 'urgent'
  fee: number
  ts: number
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...(JSON.parse(raw) as object) } as T : fallback
  } catch {
    return fallback
  }
}

function emit() {
  try {
    window.dispatchEvent(new Event(EVENT))
  } catch {
    /* non-browser */
  }
}

export function getRushSettings(): RushSettings {
  return read<RushSettings>(SETTINGS_KEY, RUSH_DEFAULTS)
}

export function setRushSettings(patch: Partial<RushSettings>): RushSettings {
  const next = { ...getRushSettings(), ...patch }
  // Clamp to sane, non-negative values.
  next.expressFee = Math.max(0, Number(next.expressFee) || 0)
  next.urgentFee = Math.max(0, Number(next.urgentFee) || 0)
  next.dailyCap = Math.max(0, Math.round(Number(next.dailyCap) || 0))
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable */
  }
  emit()
  return next
}

export function getLedger(): RushEntry[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY)
    const arr = raw ? (JSON.parse(raw) as RushEntry[]) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Count of Express + Urgent orders accepted so far today. */
export function rushCountToday(ledger: RushEntry[] = getLedger()): number {
  const from = startOfToday()
  return ledger.filter((e) => e.ts >= from).length
}

/** True once today's combined Express + Urgent orders hit the cap. */
export function rushCapReached(s: RushSettings = getRushSettings(), ledger?: RushEntry[]): boolean {
  return rushCountToday(ledger) >= s.dailyCap
}

/** Record an accepted rush order in the shared ledger (drives cap + reports). */
export function recordRush(tier: 'express' | 'urgent', fee: number, id: string): RushEntry {
  const entry: RushEntry = { id, tier, fee, ts: Date.now() }
  const ledger = getLedger()
  // Avoid double-counting the same order id.
  if (!ledger.some((e) => e.id === id)) {
    ledger.push(entry)
    try {
      // Keep the ledger bounded (last ~400 rush orders is plenty for reports).
      localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger.slice(-400)))
    } catch {
      /* storage unavailable */
    }
    emit()
  }
  return entry
}

/** Subscribe to settings/ledger changes (same tab + cross-tab). Returns unsub. */
export function subscribeRush(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === SETTINGS_KEY || e.key === LEDGER_KEY || e.key === null) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}
