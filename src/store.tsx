import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import type { Billing, Plan } from './data/plans'
import { defaultDelivery, defaultPickup, type Slot } from './data/slots'

export interface User {
  name: string
  email: string
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
  login: (email: string) => void
  signup: (name: string, email: string) => void
  loginWithApple: () => void
  logout: () => void
  /** edit the signed-in user's profile fields */
  updateProfile: (p: { name?: string; email?: string }) => void
  /** true right after a fresh sign-up, so the app can open the plans screen */
  needsPlan: boolean
  clearNeedsPlan: () => void
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
  /** extra kg bought on top of the plan's monthly cap */
  extraKg: number
  addExtraKg: (kg: number) => void
  /** membership paused */
  frozen: boolean
  setFrozen: (v: boolean) => void

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
  cards: Card[]
  addCard: (number: string) => void

  // tracking
  activeOrder: Order | null
  createOrder: () => string
  cancelOrder: () => void
  orders: Order[]

  // loyalty
  points: number
  redeem: (cost: number) => boolean
  /** redeem a specific reward — deducts points AND applies its perk */
  redeemReward: (id: string, cost: number) => boolean
  /** KWD account credit earned from rewards/referrals */
  credit: number
  /** free months banked from rewards */
  freeMonths: number

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
  const [extraKg, setExtraKg] = useState(0)
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
  const [credit, setCredit] = useState(0)
  const [freeMonths, setFreeMonths] = useState(0)
  const [frozen, setFrozen] = useState(false)
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

  function addCard(number: string) {
    const digits = number.replace(/\D/g, '')
    const last4 = digits.slice(-4) || '0000'
    const brand = /^4/.test(digits) ? 'Visa' : /^5/.test(digits) ? 'Mastercard' : 'Card'
    const id = 'c' + Date.now()
    setCards((prev) => [...prev, { id, brand, last4 }])
    setPayment('card:' + id)
  }

  const value: Store = {
    user,
    login: (email) => setUser({ name: nameFromEmail(email), email }),
    signup: (name, email) => {
      setUser({ name: name.trim() || nameFromEmail(email), email })
      setNeedsPlan(true)
    },
    loginWithApple: () => setUser(APPLE_RELAY),
    logout: () => {
      setUser(null)
      setAccent('blue')
      setMode('light')
    },
    updateProfile: (p) =>
      setUser((u) => (u ? { name: p.name?.trim() || u.name, email: p.email?.trim() || u.email } : u)),
    needsPlan,
    clearNeedsPlan: () => setNeedsPlan(false),
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
    extraKg,
    addExtraKg: (kg) => setExtraKg((n) => n + kg),
    frozen,
    setFrozen,
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
    cards,
    addCard,
    activeOrder,
    createOrder: () => {
      const id = 'PRS-' + Math.floor(1000 + Math.random() * 9000)
      const o: Order = { id, createdAt: Date.now(), pickup, delivery, address, phone }
      setActiveOrder(o)
      setOrders((prev) => [o, ...prev])
      setPoints((p) => p + POINTS_PER_PICKUP)
      return id
    },
    cancelOrder: () => setActiveOrder(null),
    orders,
    points,
    redeem: (cost) => {
      if (points < cost) return false
      setPoints((p) => p - cost)
      return true
    },
    redeemReward: (id, cost) => {
      if (points < cost) return false
      setPoints((p) => p - cost)
      // apply the actual perk so redeeming a reward really does something
      if (id === 'extra5') setExtraKg((n) => n + 5)
      else if (id === 'credit5') setCredit((c) => c + 5)
      else if (id === 'freemonth') setFreeMonths((n) => n + 1)
      return true
    },
    credit,
    freeMonths,
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
