import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Plan } from './data/plans'
import { defaultDelivery, defaultPickup, type Slot } from './data/slots'

interface Store {
  activePlan: Plan | null
  setActivePlan: (p: Plan | null) => void

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
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [activePlan, setActivePlan] = useState<Plan | null>(null)
  const [hangers, setHangers] = useState(true)
  const [note, setNote] = useState('')
  const [address, setAddress] = useState('Zahra, Hawalli Governorate, Kuwait')
  const [phone, setPhone] = useState('+965 4103 5032')
  const [pickup, setPickup] = useState<Slot>(defaultPickup)
  const [delivery, setDelivery] = useState<Slot>(defaultDelivery)

  const value: Store = {
    activePlan,
    setActivePlan,
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
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
