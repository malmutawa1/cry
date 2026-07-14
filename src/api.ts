// Thin API client for the Pressd backend.
// Enabled only when VITE_API_URL is set — otherwise the app runs fully local
// (so the static GitHub Pages demo keeps working with no backend).

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
export const apiEnabled = BASE.length > 0

const TOKEN_KEY = 'pressd.token'
let token: string | null = null
try {
  token = localStorage.getItem(TOKEN_KEY)
} catch {
  /* storage unavailable */
}

export function getToken(): string | null {
  return token
}
export function setToken(t: string | null): void {
  token = t
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) throw new ApiError(res.status, (data?.error as string) || `Request failed (${res.status})`)
  return data as T
}

/** Staff endpoints are authorized by a shared key sent as `x-staff-key`. */
async function staffRequest<T = unknown>(method: string, path: string, key: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-staff-key': key },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) throw new ApiError(res.status, (data?.error as string) || `Request failed (${res.status})`)
  return data as T
}

// ---- Response shapes (subset the store consumes) ----
export interface ApiUser {
  id: number
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
  expiresAt: number
}
export interface ApiCard {
  id: number
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
type AuthResponse = Snapshot & { token: string }

export const api = {
  signup: (b: { name: string; email: string; password: string; phone?: string; gender?: string; address?: string }) =>
    request<AuthResponse>('POST', '/api/auth/signup', b),
  login: (b: { email: string; password: string }) => request<AuthResponse>('POST', '/api/auth/login', b),
  me: () => request<Snapshot>('GET', '/api/auth/me'),
  updateProfile: (b: { name?: string; email?: string; phone?: string; address?: string }) =>
    request<Snapshot>('PATCH', '/api/auth/me', b),

  subscribe: (b: { planId: string; billing: string }) => request<{ subscription: ApiSubscription }>('POST', '/api/subscription', b),
  cancelSubscription: () => request<{ subscription: null }>('POST', '/api/subscription/cancel'),
  freeze: (frozen: boolean) => request<{ subscription: ApiSubscription }>('POST', '/api/subscription/freeze', { frozen }),

  createOrder: (b: { pickup?: string; delivery?: string; address?: string; phone?: string }) =>
    request<{ order: { id: string }; loyalty: ApiLoyalty }>('POST', '/api/orders', b),
  redeem: (rewardId: string) => request<{ loyalty: ApiLoyalty }>('POST', '/api/loyalty/redeem', { rewardId }),
  extraKg: (kg: number) => request<{ loyalty: ApiLoyalty }>('POST', '/api/extra-kg', { kg }),

  addCard: (number: string) => request<{ cards: ApiCard[] }>('POST', '/api/cards', { number }),
  setPaymentMethod: (method: string) => request<{ paymentMethod: string }>('POST', '/api/payment-method', { method }),
  referral: () => request<{ code: string; referredCount: number }>('GET', '/api/referral'),

  // staff / admin (key-authorized)
  staffOrders: (key: string) => staffRequest<{ orders: ApiStaffOrder[] }>('GET', '/api/staff/orders', key),
  staffAdvance: (key: string, id: string) =>
    staffRequest<{ order: ApiStaffOrder }>('POST', `/api/staff/orders/${encodeURIComponent(id)}/advance`, key),
  staffStats: (key: string) => staffRequest<ApiStaffStats>('GET', '/api/staff/stats', key),
}

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
