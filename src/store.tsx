import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Billing, Plan } from './data/plans'
import { defaultDelivery, defaultPickup, type Slot } from './data/slots'

export interface User {
  name: string
  email: string
}

export interface Card {
  id: string
  brand: string
  last4: string
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

  // subscription
  activePlan: Plan | null
  setActivePlan: (p: Plan | null) => void
  billing: Billing
  setBilling: (b: Billing) => void

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
}

const Ctx = createContext<Store | null>(null)

const APPLE_RELAY = { name: 'Abdullah', email: 'r8s2pw7hj4@privaterelay.appleid.com' }

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'there'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [activePlan, setActivePlan] = useState<Plan | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [hangers, setHangers] = useState(true)
  const [note, setNote] = useState('')
  const [address, setAddress] = useState('Zahra, Hawalli Governorate, Kuwait')
  const [phone, setPhone] = useState('+965 4103 5032')
  const [pickup, setPickup] = useState<Slot>(defaultPickup)
  const [delivery, setDelivery] = useState<Slot>(defaultDelivery)
  const [payment, setPayment] = useState<PayMethod>('applepay')
  const [cards, setCards] = useState<Card[]>([])

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
    signup: (name, email) => setUser({ name: name.trim() || nameFromEmail(email), email }),
    loginWithApple: () => setUser(APPLE_RELAY),
    logout: () => setUser(null),
    activePlan,
    setActivePlan,
    billing,
    setBilling,
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
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
