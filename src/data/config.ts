// Admin-editable configuration for the customer app.
//
// Staff edit this from the operations portal; the customer app reads it live.
// The two surfaces are separate Vite entries but the SAME origin, so a single
// localStorage key is the shared source of truth — the same seam rush.ts uses.
// (When Supabase goes live this module swaps local storage for the backend.)

import { plans as basePlans, type Plan } from './plans'

/** Per-plan price / allowance overrides. Absent fields fall back to defaults. */
export interface PlanOverride {
  priceKwd?: number
  /** Monthly item allowance. */
  items?: number
}

export type AnnouncementTone = 'info' | 'promo'

/** Customer-facing banner shown on the Home screen when `on` is true. */
export interface Announcement {
  on: boolean
  en: string
  ar: string
  tone: AnnouncementTone
}

export interface AppConfig {
  planOverrides: Record<string, PlanOverride>
  announcement: Announcement
}

export const CONFIG_DEFAULTS: AppConfig = {
  planOverrides: {},
  announcement: { on: false, en: '', ar: '', tone: 'promo' },
}

// ---------------------------------------------------------------------------
// Persistence (shared across the customer app + POS via same-origin storage)
// ---------------------------------------------------------------------------
const CONFIG_KEY = 'pressd:appconfig'
const EVENT = 'pressd:appconfig:changed'

function emit() {
  try {
    window.dispatchEvent(new Event(EVENT))
  } catch {
    /* non-browser */
  }
}

export function getAppConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return CONFIG_DEFAULTS
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    return {
      planOverrides: { ...CONFIG_DEFAULTS.planOverrides, ...(parsed.planOverrides ?? {}) },
      announcement: { ...CONFIG_DEFAULTS.announcement, ...(parsed.announcement ?? {}) },
    }
  } catch {
    return CONFIG_DEFAULTS
  }
}

function write(next: AppConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable */
  }
  emit()
}

/** Set (or clear) a plan's price/allowance override. */
export function setPlanOverride(planId: string, patch: PlanOverride | null): AppConfig {
  const cfg = getAppConfig()
  const overrides = { ...cfg.planOverrides }
  if (patch === null) {
    delete overrides[planId]
  } else {
    const merged: PlanOverride = { ...overrides[planId], ...patch }
    // Clamp to sane, positive values; drop empty fields.
    if (merged.priceKwd != null) merged.priceKwd = Math.max(0, Number(merged.priceKwd) || 0)
    if (merged.items != null) merged.items = Math.max(0, Math.round(Number(merged.items) || 0))
    overrides[planId] = merged
  }
  const next = { ...cfg, planOverrides: overrides }
  write(next)
  return next
}

export function setAnnouncement(patch: Partial<Announcement>): AppConfig {
  const cfg = getAppConfig()
  const next = { ...cfg, announcement: { ...cfg.announcement, ...patch } }
  write(next)
  return next
}

/** Base plans with any admin overrides applied (price / allowance). */
export function resolvePlans(cfg: AppConfig = getAppConfig()): Plan[] {
  return basePlans.map((p) => {
    const o = cfg.planOverrides[p.id]
    if (!o) return p
    return {
      ...p,
      priceKwd: o.priceKwd != null ? o.priceKwd : p.priceKwd,
      items: o.items != null ? o.items : p.items,
    }
  })
}

/** Subscribe to config changes (same tab + cross-tab). Returns unsub. */
export function subscribeConfig(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONFIG_KEY || e.key === null) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}
