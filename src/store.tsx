import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CatalogItem, Service } from './data/catalog'
import type { Plan } from './data/plans'

export interface BasketLine {
  key: string // itemId::serviceId
  itemId: string
  name: string
  art: string
  serviceId: string
  serviceName: string
  priceKwd: number
  qty: number
}

interface Store {
  lines: BasketLine[]
  addLine: (item: CatalogItem, service: Service, qty: number) => void
  setQty: (key: string, qty: number) => void
  removeItem: (itemId: string) => void
  clearBasket: () => void
  itemCount: number
  subtotal: number

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

  pickup: string
  setPickup: (v: string) => void
  delivery: string
  setDelivery: (v: string) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<BasketLine[]>([])
  const [activePlan, setActivePlan] = useState<Plan | null>(null)
  const [hangers, setHangers] = useState(true)
  const [note, setNote] = useState('')
  const [address, setAddress] = useState('Zahra, Hawalli Governorate, Kuwait')
  const [phone, setPhone] = useState('+965 4103 5032')
  const [pickup, setPickup] = useState('Today, 6 PM – 8 PM')
  const [delivery, setDelivery] = useState('Tomorrow, 10 AM – 10 PM')

  function addLine(item: CatalogItem, service: Service, qty: number) {
    if (qty <= 0) return
    const key = `${item.id}::${service.id}`
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key)
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
      }
      return [
        ...prev,
        {
          key,
          itemId: item.id,
          name: item.name,
          art: item.art,
          serviceId: service.id,
          serviceName: service.name,
          priceKwd: service.priceKwd,
          qty,
        },
      ]
    })
  }

  function setQty(key: string, qty: number) {
    setLines((prev) =>
      prev.flatMap((l) => (l.key === key ? (qty <= 0 ? [] : [{ ...l, qty }]) : [l])),
    )
  }

  function removeItem(itemId: string) {
    setLines((prev) => prev.filter((l) => l.itemId !== itemId))
  }

  function clearBasket() {
    setLines([])
  }

  const itemCount = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines])
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.qty * l.priceKwd, 0), [lines])

  const value: Store = {
    lines,
    addLine,
    setQty,
    removeItem,
    clearBasket,
    itemCount,
    subtotal,
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

export function kwd(n: number): string {
  return `${n.toFixed(3)} KWD`
}
