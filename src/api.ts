// Pressd data client — backed by Supabase (Auth + RLS + Postgres RPC).
//
// Enabled only when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set —
// otherwise the app runs fully local (so the static GitHub Pages demo keeps
// working with no backend). The public surface (apiEnabled, getToken,
// setSession/clearSession, the `api` object and its types) is unchanged from
// the previous REST client, so the store consumes it identically.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const ANON = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''
export const apiEnabled = URL.length > 0 && ANON.length > 0

export const supabase: SupabaseClient | null = apiEnabled
  ? createClient(URL, ANON, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null

// Order stages (mirrors server domain ORDER_STAGES / STAGE_LABELS).
const STAGES = ['scheduled', 'picked_up', 'washing', 'ready', 'out_for_delivery', 'delivered'] as const
const STAGE_LABELS: Record<string, string> = {
  scheduled: 'Pickup scheduled',
  picked_up: 'Picked up',
  washing: 'Washing & pressing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
}
const LAST_STAGE = STAGES.length - 1

// ---- Synchronous token/uid mirror ----
// supabase-js restores its session asynchronously, but the store checks
// getToken() synchronously on mount to decide whether to hydrate. We seed a
// cached token from supabase-js's own persisted blob so that check is correct
// on reload, then keep it fresh via onAuthStateChange.
const REF = URL.replace(/^https?:\/\//, '').split('.')[0]
const STORAGE_KEY = `sb-${REF}-auth-token`
let cachedToken: string | null = null
let cachedUid: string | null = null

function seedFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    const session = parsed?.access_token ? parsed : parsed?.currentSession ?? null
    cachedToken = session?.access_token ?? null
    cachedUid = session?.user?.id ?? null
  } catch {
    /* storage unavailable or malformed */
  }
}
if (apiEnabled) {
  seedFromStorage()
  supabase!.auth.onAuthStateChange((_event, session) => {
    cachedToken = session?.access_token ?? null
    cachedUid = session?.user?.id ?? null
  })
}

export function getToken(): string | null {
  return cachedToken
}
export function setToken(t: string | null): void {
  cachedToken = t
}
/** Store the session after login / signup. supabase-js persists it itself; we
 *  only update the synchronous mirror so getToken() is immediately correct. */
export function setSession(t: string | null, _rt: string | null): void {
  cachedToken = t
}
/** Clear the session (logout or unrecoverable auth failure). */
export function clearSession(): void {
  cachedToken = null
  cachedUid = null
  supabase?.auth.signOut().catch(() => {})
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function sb(): SupabaseClient {
  if (!supabase) throw new ApiError(0, 'Backend is not configured')
  return supabase
}

async function uid(): Promise<string> {
  if (cachedUid) return cachedUid
  const { data } = await sb().auth.getUser()
  cachedUid = data.user?.id ?? null
  if (!cachedUid) throw new ApiError(401, 'Not authenticated')
  return cachedUid
}

// Supabase/Postgres error codes → rough HTTP-ish status for the UI.
function mapStatus(code?: string): number {
  if (code === '28000') return 401
  if (code === '42501') return 403
  return 400
}

/** Invoke a Postgres RPC, mapping Supabase errors onto ApiError. */
async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await sb().rpc(fn, args)
  if (error) throw new ApiError(mapStatus(error.code), error.message)
  return data as T
}

// ---- Response shapes (subset the store consumes) ----
export interface ApiUser {
  id: string
  name: string
  email: string
  phone: string
  gender: string | null
  accent: 'blue' | 'pink'
  address: string
  role: string
  referralCode: string | null
  paymentMethod: string
}
export interface ApiLoyalty {
  points: number
  lifetimePoints: number
  credit: number
  freeMonths: number
  extraKg: number
  tier: string
  progress: number
}
export interface ApiSubscription {
  planId: string
  billing: 'monthly' | 'annual'
  frozen: boolean
  startedAt: number
  expiresAt?: number
}
export interface ApiCard {
  id: string
  brand: string
  last4: string
  isDefault: boolean
}
export interface Snapshot {
  user: ApiUser
  loyalty: ApiLoyalty
  subscription: ApiSubscription | null
  cards: ApiCard[]
}
type AuthResponse = Snapshot & { token: string; refreshToken: string }

export interface ApiStaffOrder {
  id: string
  createdAt: number
  stage: number
  stageKey: string
  stageLabel: string
  delivered: boolean
  address: string
  phone: string
  customer: { name: string; email: string }
}
export interface ApiStaffStats {
  users: number
  orders: number
  activeSubscriptions: number
  ordersInProgress: number
}

function cardBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa'
  if (/^5/.test(digits)) return 'Mastercard'
  return 'Card'
}

async function snapshot(): Promise<Snapshot> {
  return rpc<Snapshot>('account_snapshot')
}

async function reloadCards(): Promise<ApiCard[]> {
  const userId = await uid()
  const { data, error } = await sb()
    .from('cards')
    .select('id, brand, last4, is_default')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw new ApiError(400, error.message)
  return (data ?? []).map((c) => ({ id: String(c.id), brand: c.brand, last4: c.last4, isDefault: c.is_default }))
}

function decorateStaffOrder(o: {
  id: string
  createdAt: number
  stage: number
  address?: string
  phone?: string
  customer?: { name: string; email: string }
}): ApiStaffOrder {
  const key = STAGES[o.stage] ?? 'scheduled'
  return {
    id: o.id,
    createdAt: o.createdAt,
    stage: o.stage,
    stageKey: key,
    stageLabel: STAGE_LABELS[key] ?? key,
    delivered: o.stage >= LAST_STAGE,
    address: o.address ?? '',
    phone: o.phone ?? '',
    customer: o.customer ?? { name: '', email: '' },
  }
}

export const api = {
  async signup(b: { name: string; email: string; password: string; phone?: string; gender?: string; address?: string }): Promise<AuthResponse> {
    const { data, error } = await sb().auth.signUp({
      email: b.email,
      password: b.password,
      options: { data: { name: b.name, phone: b.phone ?? '', gender: b.gender ?? '', address: b.address ?? '' } },
    })
    if (error) throw new ApiError(400, error.message)
    cachedUid = data.user?.id ?? cachedUid
    cachedToken = data.session?.access_token ?? cachedToken
    const snap = await snapshot()
    return { ...snap, token: data.session?.access_token ?? '', refreshToken: data.session?.refresh_token ?? '' }
  },

  async login(b: { email: string; password: string }): Promise<AuthResponse> {
    const { data, error } = await sb().auth.signInWithPassword({ email: b.email, password: b.password })
    if (error) throw new ApiError(401, error.message)
    cachedUid = data.user?.id ?? null
    cachedToken = data.session?.access_token ?? null
    const snap = await snapshot()
    return { ...snap, token: data.session?.access_token ?? '', refreshToken: data.session?.refresh_token ?? '' }
  },

  async logout(): Promise<{ ok: boolean }> {
    await sb().auth.signOut().catch(() => {})
    cachedToken = null
    cachedUid = null
    return { ok: true }
  },

  me: () => snapshot(),

  async updateProfile(b: { name?: string; email?: string; phone?: string; address?: string }): Promise<Snapshot> {
    const userId = await uid()
    const patch: Record<string, string> = {}
    if (b.name !== undefined) patch.name = b.name
    if (b.email !== undefined) patch.email = b.email
    if (b.phone !== undefined) patch.phone = b.phone
    if (b.address !== undefined) patch.address = b.address
    if (Object.keys(patch).length) {
      const { error } = await sb().from('profiles').update(patch).eq('id', userId)
      if (error) throw new ApiError(400, error.message)
    }
    if (b.email) await sb().auth.updateUser({ email: b.email }).catch(() => {})
    return snapshot()
  },

  subscribe: (b: { planId: string; billing: string }) =>
    rpc<ApiSubscription>('subscribe', { p_plan_id: b.planId, p_billing: b.billing }).then((subscription) => ({ subscription })),
  cancelSubscription: () => rpc<null>('cancel_subscription').then(() => ({ subscription: null as null })),
  freeze: (frozen: boolean) => rpc<ApiSubscription>('set_frozen', { p_frozen: frozen }).then((subscription) => ({ subscription })),

  createOrder: (b: { pickup?: string; delivery?: string; address?: string; phone?: string }) =>
    rpc<{ order: { id: string }; loyalty: ApiLoyalty }>('create_order', {
      p_pickup: b.pickup ?? '',
      p_delivery: b.delivery ?? '',
      p_address: b.address ?? '',
      p_phone: b.phone ?? '',
    }),
  redeem: (rewardId: string) => rpc<{ loyalty: ApiLoyalty }>('redeem_reward', { p_reward_id: rewardId }),
  extraKg: (kg: number) => rpc<{ loyalty: ApiLoyalty }>('add_extra_kg', { p_kg: kg }),

  async addCard(number: string): Promise<{ cards: ApiCard[] }> {
    const digits = number.replace(/\D/g, '')
    if (digits.length < 12) throw new ApiError(400, 'Enter a valid card number')
    const userId = await uid()
    const { error } = await sb().from('cards').insert({ user_id: userId, brand: cardBrand(digits), last4: digits.slice(-4) })
    if (error) throw new ApiError(400, error.message)
    return { cards: await reloadCards() }
  },
  setPaymentMethod: (method: string) => rpc<{ paymentMethod: string }>('set_payment_method', { p_method: method }),
  applyReferral: (code: string) => rpc<{ creditKwd: number; loyalty: ApiLoyalty }>('apply_referral', { p_code: code }),
  referral: () => rpc<{ code: string; referredCount: number; rewardPoints: number; creditKwd: number }>('referral_info'),

  // staff / admin — authorized by the caller's Supabase session (role = 'staff').
  // The `key` argument is accepted for interface compatibility and ignored.
  async staffOrders(_key: string): Promise<{ orders: ApiStaffOrder[] }> {
    const rows = await rpc<ApiStaffOrder[]>('staff_orders')
    return { orders: (rows ?? []).map(decorateStaffOrder) }
  },
  async staffAdvance(_key: string, id: string): Promise<{ order: ApiStaffOrder }> {
    const o = await rpc<{ id: string; stage: number; stageUpdatedAt: number }>('staff_advance', { p_id: id })
    return { order: decorateStaffOrder({ id: o.id, createdAt: Date.now(), stage: o.stage }) }
  },
  staffStats: (_key: string) => rpc<ApiStaffStats>('staff_stats'),
}
