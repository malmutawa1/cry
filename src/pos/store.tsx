import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  seedProducts,
  staff as staffList,
  type PaymentMethod,
  type Product,
  type Sale,
  type SaleLine,
  type Staff,
} from './data'

const PRODUCTS_KEY = 'pressd-pos:products:v1'
const SALES_KEY = 'pressd-pos:sales:v1'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable — POS keeps running from memory */
  }
}

/** A day's worth of pretend transactions so the dashboard is never empty on
 *  first launch. Spread across the last 7 days at plausible counter hours. */
function seedSales(products: Product[]): Sale[] {
  const rng = mulberry32(20260714)
  const methods: PaymentMethod[] = ['cash', 'knet', 'knet', 'card']
  const out: Sale[] = []
  const now = Date.now()
  for (let day = 6; day >= 0; day--) {
    const count = 8 + Math.floor(rng() * 12)
    for (let i = 0; i < count; i++) {
      const hour = 9 + Math.floor(rng() * 11)
      const ts = now - day * 86400000
      const d = new Date(ts)
      d.setHours(hour, Math.floor(rng() * 60), 0, 0)
      const lineCount = 1 + Math.floor(rng() * 3)
      const lines: SaleLine[] = []
      for (let l = 0; l < lineCount; l++) {
        const p = products[Math.floor(rng() * products.length)]
        const qty = p.unit === 'kg' ? 1 + Math.floor(rng() * 6) : 1 + Math.floor(rng() * 3)
        lines.push({ productId: p.id, name: p.name, unit: p.unit, price: p.price, qty })
      }
      const subtotal = lines.reduce((s, ln) => s + ln.price * ln.qty, 0)
      const discountPct = rng() > 0.85 ? 10 : 0
      const total = round3(subtotal * (1 - discountPct / 100))
      const clerk = staffList[Math.floor(rng() * staffList.length)]
      out.push({
        id: `S-${d.getTime()}-${i}`,
        ts: d.getTime(),
        staffId: clerk.id,
        staffName: clerk.name,
        method: methods[Math.floor(rng() * methods.length)],
        lines,
        subtotal: round3(subtotal),
        discountPct,
        total,
      })
    }
  }
  return out.sort((a, b) => a.ts - b.ts)
}

/** Deterministic PRNG so the demo sales look the same on every reload. */
function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

interface PosState {
  staff: Staff[]
  currentStaff: Staff | null
  products: Product[]
  sales: Sale[]
  login: (pin: string) => Staff | null
  logout: () => void
  addProduct: (p: Omit<Product, 'id'>) => void
  updateProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  toggleAvailable: (id: string) => void
  recordSale: (sale: Omit<Sale, 'id' | 'ts' | 'staffId' | 'staffName'>) => Sale | null
}

const Ctx = createContext<PosState | null>(null)

export function PosProvider({ children }: { children: ReactNode }) {
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null)
  const [products, setProducts] = useState<Product[]>(() => load(PRODUCTS_KEY, seedProducts))
  const [sales, setSales] = useState<Sale[]>(() => {
    const existing = load<Sale[] | null>(SALES_KEY, null)
    if (existing) return existing
    const seeded = seedSales(seedProducts)
    save(SALES_KEY, seeded)
    return seeded
  })

  useEffect(() => save(PRODUCTS_KEY, products), [products])
  useEffect(() => save(SALES_KEY, sales), [sales])

  const login = useCallback((pin: string) => {
    const match = staffList.find((s) => s.pin === pin) ?? null
    if (match) setCurrentStaff(match)
    return match
  }, [])

  const logout = useCallback(() => setCurrentStaff(null), [])

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    setProducts((prev) => [...prev, { ...p, id: `p-${Date.now()}` }])
  }, [])

  const updateProduct = useCallback((p: Product) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const toggleAvailable = useCallback((id: string) => {
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, available: !x.available } : x)))
  }, [])

  const recordSale = useCallback<PosState['recordSale']>(
    (draft) => {
      if (!currentStaff) return null
      const sale: Sale = {
        ...draft,
        id: `S-${Date.now()}`,
        ts: Date.now(),
        staffId: currentStaff.id,
        staffName: currentStaff.name,
      }
      setSales((prev) => [...prev, sale])
      return sale
    },
    [currentStaff],
  )

  const value = useMemo<PosState>(
    () => ({
      staff: staffList,
      currentStaff,
      products,
      sales,
      login,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleAvailable,
      recordSale,
    }),
    [currentStaff, products, sales, login, logout, addProduct, updateProduct, deleteProduct, toggleAvailable, recordSale],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePos(): PosState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePos must be used inside <PosProvider>')
  return ctx
}
