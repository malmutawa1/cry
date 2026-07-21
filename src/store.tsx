import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { plans, type Billing, type Plan } from './data/plans'
import { weightedItems, type ItemCounts } from './data/items'
import { defaultDelivery, defaultPickup, type Slot } from './data/slots'
import { isRush, recordRush, type RushTier } from './data/rush'
import { api, apiEnabled, getToken, setSession, clearSession, type ApiLoyalty, type Snapshot } from './api'
import { supabase, supabaseEnabled, userFromSupabase } from './supabase'

/** Result of an email/password auth attempt. */
export interface AuthResult {
  ok: boolean
  error?: string
  code?: string
  /** true when sign-up succeeded but the email must be confirmed before login */
  needsConfirmation?: boolean
}

export interface User {
  name: string
  email: string
}

export interface SignupOpts {
  password?: string
  phone?: string
  gender?: string
  address?: string
}

export type Accent = 'blue' | 'pink'
export type Mode = 'dark' | 'light' | 'system'

export interface Card {
  id: string
  brand: string
  last4: string
}

export interface Order {
  id: string
  createdAt: number
  pickup: Slot
  delivery: Slot
  address: string
  phone: string
  /** Service speed. Rush tiers (express/urgent) carry an extra fee. */
  tier?: RushTier
  rushFee?: number
}

/** Seconds each tracking stage takes in this prototype (demo-paced). */
export const STAGE_SECONDS = 9
export const STAGE_COUNT = 6

/** Current stage index (0..STAGE_COUNT-1) for an order at time `now`. */
export function orderStage(order: Order, now: number): number {
  const elapsed = (now - order.createdAt) / 1000
  return Math.min(STAGE_COUNT - 1, Math.floor(elapsed / STAGE_SECONDS))
}

/** 'applepay' | 'knet' | `card:<id>` */
export type PayMethod = string

interface Store {
  // auth
  user: User | null
  login: (email: string, password?: string) => Promise<AuthResult>
  signup: (name: string, email: string, opts?: SignupOpts) => Promise<AuthResult>
  loginWithApple: () => void
  logout: () => void
  /** edit the signed-in user's profile fields */
  updateProfile: (p: { name?: string; email?: string; phone?: string; address?: string }) => void
  /** the signed-in user's referral code (from the backend when available) */
  referralCode: string | null
  /** true right after a fresh sign-up, so the app can open the plans screen */
  needsPlan: boolean
  clearNeedsPlan: () => void
  /** true right after a fresh sign-up, so the app can show the privacy consent */
  justSignedUp: boolean
  acknowledgeSignup: () => void
  /** accent colour (blue = male/default, pink = female), chosen at sign-up */
  accent: Accent
  setAccent: (a: Accent) => void
  /** appearance mode toggle */
  mode: Mode
  setMode: (m: Mode) => void
  /** user preference to reduce/disable animations */
  reduceMotion: boolean
  setReduceMotion: (v: boolean) => void

  // subscription
  activePlan: Plan | null
  setActivePlan: (p: Plan | null) => void
  billing: Billing
  setBilling: (b: Billing) => void
  /** epoch ms when the current subscription period started (null = not subscribed) */
  subscribedAt: number | null
  setSubscribedAt: (t: number | null) => void
  /** subscribe / upgrade / switch billing (persists to the backend when enabled) */
  subscribe: (plan: Plan, billing: Billing) => void
  /** cancel the active membership */
  cancelSubscription: () => void
  /** weighted allowance items collected this billing cycle (drives the counter) */
  itemsUsed: number
  /** bedding add-ons collected this cycle: { [addOnId]: count } (paid separately) */
  beddingAddOns: Record<string, number>
  /** log a batch of collected pieces (adds their weighted items to the counter) */
  logItems: (counts: ItemCounts) => void
  /** add a raw number of weighted items to the cycle counter (garment pickup) */
  addItemsUsed: (n: number) => void
  /** add one bedding add-on (billed on top of the subscription) */
  addBedding: (addOnId: string) => void
  /** extra kg bought on top of the plan's monthly cap (legacy backend field) */
  extraKg: number
  addExtraKg: (kg: number) => void
  /** membership paused */
  frozen: boolean
  setFrozen: (v: boolean) => void
  /** freeze / resume (persists to the backend when enabled) */
  freeze: (v: boolean) => void

  // scheduling
  hangers: boolean
  setHangers: (v: boolean) => void
  note: string
  setNote: (v: string) => void
  address: string
  setAddress: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  pickup: Slot
  setPickup: (s: Slot) => void
  delivery: Slot
  setDelivery: (s: Slot) => void

  // payment
  payment: PayMethod
  setPayment: (m: PayMethod) => void
  /** pick a payment method (persists to the backend when enabled) */
  choosePayment: (m: PayMethod) => void
  cards: Card[]
  addCard: (number: string) => void

  // tracking
  activeOrder: Order | null
  createOrder: (opts?: { tier?: RushTier; rushFee?: number }) => string
  cancelOrder: () => void
  orders: Order[]

  // loyalty
  /** spendable points balance (drops when you redeem) */
  points: number
  /** total points ever earned — drives tier & progress (never drops on redeem) */
  lifetimePoints: number
  redeem: (cost: number) => boolean
  /** redeem a specific reward — deducts points AND applies its perk */
  redeemReward: (id: string, cost: number) => boolean
  /** KWD account credit earned from rewards/referrals */
  credit: number
  /** free months banked from rewards */
  freeMonths: number
  /** staff-side: grant account credit (KWD) to this customer */
  grantCredit: (kwd: number) => void
  /** staff-side: comp free membership months to this customer */
  grantFreeMonths: (n: number) => void

  // ephemeral feedback
  toast: string | null
  showToast: (msg: string) => void
}

export const POINTS_PER_PICKUP = 50

const Ctx = createContext<Store | null>(null)

const APPLE_RELAY = { name: 'Abdullah', email: 'r8s2pw7hj4@privaterelay.appleid.com' }

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'there'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [needsPlan, setNeedsPlan] = useState(false)
  const [justSignedUp, setJustSignedUp] = useState(false)
  const [accent, setAccent] = useState<Accent>('blue')
  const [mode, setMode] = useState<Mode>('light')
  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pressd.reduceMotion')
      if (saved != null) return saved === '1'
    } catch {
      /* storage unavailable */
    }
    return typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  })
  function setReduceMotion(v: boolean) {
    setReduceMotionState(v)
    try {
      localStorage.setItem('pressd.reduceMotion', v ? '1' : '0')
    } catch {
      /* storage unavailable */
    }
  }
  const [activePlan, setActivePlan] = useState<Plan | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [subscribedAt, setSubscribedAt] = useState<number | null>(null)
  const [extraKg, setExtraKg] = useState(0)
  // Item usage this cycle. Seeded to a mid-cycle figure so the live counter and
  // the demo have something to show ("15 of 70 items").
  const [itemsUsed, setItemsUsed] = useState(15)
  const [beddingAddOns, setBeddingAddOns] = useState<Record<string, number>>({})
  const [hangers, setHangers] = useState(true)
  const [note, setNote] = useState('')
  const [address, setAddress] = useState('Zahra, Hawalli Governorate, Kuwait')
  const [phone, setPhone] = useState('+965 4103 5032')
  const [pickup, setPickup] = useState<Slot>(defaultPickup)
  const [delivery, setDelivery] = useState<Slot>(defaultDelivery)
  const [payment, setPayment] = useState<PayMethod>('applepay')
  const [cards, setCards] = useState<Card[]>([])
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [points, setPoints] = useState(320)
  const [lifetimePoints, setLifetimePoints] = useState(320)
  const [credit, setCredit] = useState(0)
  const [freeMonths, setFreeMonths] = useState(0)
  const [frozen, setFrozen] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }
  const DAY = 86400000
  const [orders, setOrders] = useState<Order[]>(() => {
    const base = { pickup: defaultPickup, delivery: defaultDelivery, address, phone }
    return [
      { id: 'PRS-8842', createdAt: Date.now() - 3 * DAY, ...base },
      { id: 'PRS-8177', createdAt: Date.now() - 9 * DAY, ...base },
      { id: 'PRS-7431', createdAt: Date.now() - 16 * DAY, ...base },
    ]
  })

  // ---- Backend sync (only active when VITE_API_URL is set) ----
  function authed() {
    return apiEnabled && getToken() != null
  }

  function reconcileLoyalty(l: ApiLoyalty) {
    setPoints(l.points)
    setLifetimePoints(l.lifetimePoints)
    setCredit(l.credit)
    setFreeMonths(l.freeMonths)
    setExtraKg(l.extraKg)
  }

  /** Replace local state with an authoritative snapshot from the server. */
  function hydrate(s: Snapshot) {
    setUser({ name: s.user.name, email: s.user.email })
    setAccent(s.user.accent === 'pink' ? 'pink' : 'blue')
    if (s.user.phone) setPhone(s.user.phone)
    if (s.user.address) setAddress(s.user.address)
    setReferralCode(s.user.referralCode ?? null)
    setPayment(s.user.paymentMethod || 'applepay')
    reconcileLoyalty(s.loyalty)
    if (s.subscription) {
      setActivePlan(plans.find((p) => p.id === s.subscription!.planId) ?? null)
      setBilling(s.subscription.billing)
      setSubscribedAt(s.subscription.startedAt)
      setFrozen(s.subscription.frozen)
    } else {
      setActivePlan(null)
      setSubscribedAt(null)
      setFrozen(false)
    }
    setCards(s.cards.map((c) => ({ id: String(c.id), brand: c.brand, last4: c.last4 })))
  }

  // Restore an existing session on load (auto-refreshes the access token if needed).
  useEffect(() => {
    if (apiEnabled && getToken()) {
      api.me().then(hydrate).catch(() => clearSession())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Supabase auth: restore the session on load and follow sign-in/out changes.
  useEffect(() => {
    if (!supabaseEnabled) return
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(userFromSupabase(data.session.user))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) setUser(userFromSupabase(session.user))
      else if (event === 'SIGNED_OUT') setUser(null) // don't clear an optimistic sign-up user on token events
    })
    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addCard(number: string) {
    const digits = number.replace(/\D/g, '')
    const last4 = digits.slice(-4) || '0000'
    const brand = /^4/.test(digits) ? 'Visa' : /^5/.test(digits) ? 'Mastercard' : 'Card'
    const id = 'c' + Date.now()
    setCards((prev) => [...prev, { id, brand, last4 }])
    setPayment('card:' + id)
    if (authed()) {
      api
        .addCard(number)
        .then((r) => {
          setCards(r.cards.map((c) => ({ id: String(c.id), brand: c.brand, last4: c.last4 })))
          const def = r.cards.find((c) => c.isDefault) ?? r.cards[0]
          if (def) setPayment('card:' + def.id)
        })
        .catch(() => {})
    }
  }

  const value: Store = {
    user,
    login: async (email, password) => {
      // Supabase email/password sign-in (primary auth).
      if (supabaseEnabled) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: password ?? '' })
        if (error) return { ok: false, error: error.message, code: (error as { code?: string }).code }
        if (data.user) setUser(userFromSupabase(data.user))
        return { ok: true }
      }
      if (apiEnabled && password) {
        try {
          const r = await api.login({ email, password })
          setSession(r.token, r.refreshToken)
          hydrate(r)
        } catch {
          setUser({ name: nameFromEmail(email), email }) // graceful offline fallback
        }
        return { ok: true }
      }
      setUser({ name: nameFromEmail(email), email })
      return { ok: true }
    },
    signup: async (name, email, opts) => {
      // Supabase email/password sign-up (primary auth). Extra profile fields go
      // into user metadata. If the project requires email confirmation, no
      // session is returned until the user confirms.
      if (supabaseEnabled) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: opts?.password ?? '',
          options: { data: { name: name.trim() || undefined, phone: opts?.phone, gender: opts?.gender, address: opts?.address } },
        })
        if (error) return { ok: false, error: error.message, code: (error as { code?: string }).code }
        // Sign-up succeeded: take the customer straight into the app and open the
        // subscription screen. If the project requires email confirmation the
        // confirmation email still goes out, but we don't block the flow on it.
        if (data.user) {
          setNeedsPlan(true)
          setJustSignedUp(true)
          setUser(userFromSupabase(data.user))
        }
        return { ok: true, needsConfirmation: !data.session }
      }
      setNeedsPlan(true)
      setJustSignedUp(true)
      if (apiEnabled && opts?.password) {
        try {
          const r = await api.signup({ name, email, password: opts.password, phone: opts.phone, gender: opts.gender, address: opts.address })
          setSession(r.token, r.refreshToken)
          hydrate(r)
        } catch {
          setUser({ name: name.trim() || nameFromEmail(email), email })
        }
        return { ok: true }
      }
      setUser({ name: name.trim() || nameFromEmail(email), email })
      return { ok: true }
    },
    loginWithApple: () => setUser(APPLE_RELAY),
    logout: () => {
      if (supabaseEnabled) supabase.auth.signOut().catch(() => {})
      if (apiEnabled) api.logout().catch(() => {})
      clearSession()
      setUser(null)
      setJustSignedUp(false)
      setAccent('blue')
      setMode('light')
      setActivePlan(null)
      setSubscribedAt(null)
      setFrozen(false)
      setCards([])
      setPayment('applepay')
      setReferralCode(null)
      setPoints(320)
      setLifetimePoints(320)
      setCredit(0)
      setFreeMonths(0)
      setExtraKg(0)
      setItemsUsed(15)
      setBeddingAddOns({})
    },
    updateProfile: (p) => {
      setUser((u) => (u ? { name: p.name?.trim() || u.name, email: p.email?.trim() || u.email } : u))
      if (p.phone !== undefined) setPhone(p.phone)
      if (p.address !== undefined) setAddress(p.address)
      if (authed()) api.updateProfile({ name: p.name, email: p.email, phone: p.phone, address: p.address }).catch(() => {})
    },
    referralCode,
    needsPlan,
    clearNeedsPlan: () => setNeedsPlan(false),
    justSignedUp,
    acknowledgeSignup: () => setJustSignedUp(false),
    accent,
    setAccent,
    mode,
    setMode,
    reduceMotion,
    setReduceMotion,
    activePlan,
    setActivePlan,
    billing,
    setBilling,
    subscribedAt,
    setSubscribedAt,
    subscribe: (plan, b) => {
      setActivePlan(plan)
      setBilling(b)
      setSubscribedAt(Date.now())
      if (authed()) {
        api
          .subscribe({ planId: plan.id, billing: b })
          .then((r) => r.subscription && setSubscribedAt(r.subscription.startedAt))
          .catch(() => {})
      }
    },
    cancelSubscription: () => {
      setActivePlan(null)
      setSubscribedAt(null)
      if (authed()) api.cancelSubscription().catch(() => {})
    },
    itemsUsed,
    beddingAddOns,
    logItems: (counts) => setItemsUsed((n) => n + weightedItems(counts)),
    addItemsUsed: (n) => setItemsUsed((v) => v + Math.max(0, n)),
    addBedding: (addOnId) => setBeddingAddOns((prev) => ({ ...prev, [addOnId]: (prev[addOnId] || 0) + 1 })),
    extraKg,
    addExtraKg: (kg) => {
      setExtraKg((n) => n + kg)
      if (authed()) api.extraKg(kg).then((r) => reconcileLoyalty(r.loyalty)).catch(() => {})
    },
    frozen,
    setFrozen,
    freeze: (v) => {
      setFrozen(v)
      if (authed()) api.freeze(v).catch(() => {})
    },
    hangers,
    setHangers,
    note,
    setNote,
    address,
    setAddress,
    phone,
    setPhone,
    pickup,
    setPickup,
    delivery,
    setDelivery,
    payment,
    setPayment,
    choosePayment: (m) => {
      setPayment(m)
      if (authed()) api.setPaymentMethod(m).catch(() => {})
    },
    cards,
    addCard,
    activeOrder,
    createOrder: (opts) => {
      const id = 'PRS-' + Math.floor(1000 + Math.random() * 9000)
      const tier: RushTier = opts?.tier ?? 'standard'
      const rushFee = opts?.rushFee ?? 0
      const o: Order = { id, createdAt: Date.now(), pickup, delivery, address, phone, tier, rushFee }
      setActiveOrder(o)
      setOrders((prev) => [o, ...prev])
      setPoints((p) => p + POINTS_PER_PICKUP)
      setLifetimePoints((p) => p + POINTS_PER_PICKUP)
      // Log accepted rush orders to the shared cap/report ledger.
      if (isRush(tier)) recordRush(tier, rushFee, id)
      if (authed()) {
        api
          .createOrder({ pickup: pickup.id, delivery: delivery.id, address, phone })
          .then((r) => reconcileLoyalty(r.loyalty))
          .catch(() => {})
      }
      return id
    },
    cancelOrder: () => setActiveOrder(null),
    orders,
    points,
    lifetimePoints,
    redeem: (cost) => {
      if (points < cost) return false
      setPoints((p) => p - cost)
      return true
    },
    redeemReward: (id, cost) => {
      if (points < cost) return false
      setPoints((p) => p - cost)
      // apply the actual perk so redeeming a reward really does something
      if (id === 'extra5') setItemsUsed((n) => Math.max(0, n - 10)) // 10 free items
      else if (id === 'credit5') setCredit((c) => c + 5)
      else if (id === 'freemonth') setFreeMonths((n) => n + 1)
      if (authed()) api.redeem(id).then((r) => reconcileLoyalty(r.loyalty)).catch(() => {})
      return true
    },
    credit,
    freeMonths,
    grantCredit: (kwd) => setCredit((c) => Math.max(0, c + kwd)),
    grantFreeMonths: (n) => setFreeMonths((m) => Math.max(0, m + n)),
    toast,
    showToast,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
