import { createContext, useContext, useState, type ReactNode } from 'react'
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
  /** true right after a fresh sign-up, so the app can open the plans screen */
  needsPlan: boolean
  clearNeedsPlan: () => void
  /** accent colour (blue = male/default, pink = female), chosen at sign-up */
  accent: Accent
  setAccent: (a: Accent) => void
  /** appearance mode toggle */
  mode: Mode
  setMode: (m: Mode) => void

  // subscription
  activePlan: Plan | null
  setActivePlan: (p: Plan | null) => void
  billing: Billing
  setBilling: (b: Billing) => void
  /** extra kg bought on top of the plan's monthly cap */
  extraKg: number
  addExtraKg: (kg: number) => void

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
}

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
  const [mode, setMode] = useState<Mode>('dark')
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
      setMode('dark')
    },
    needsPlan,
    clearNeedsPlan: () => setNeedsPlan(false),
    accent,
    setAccent,
    mode,
    setMode,
    activePlan,
    setActivePlan,
    billing,
    setBilling,
    extraKg,
    addExtraKg: (kg) => setExtraKg((n) => n + kg),
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
      return id
    },
    cancelOrder: () => setActiveOrder(null),
    orders,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
