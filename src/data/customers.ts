// Customer roster — the facility's subscribers, managed by staff.
//
// Persisted to same-origin localStorage so staff edits (freeze a member, grant
// account credit) stick across sessions and surfaces, like rush.ts/config.ts.
// (Swaps to Supabase when the backend goes live.)

export interface Customer {
  id: string
  name: string
  area: string
  planId: string
  /** Kilograms used in the current billing cycle. */
  kgUsed: number
  /** KWD account credit granted by staff. */
  credit: number
  /** Membership paused by staff. */
  frozen: boolean
}

const CUSTOMERS_KEY = 'pressd:customers'
const EVENT = 'pressd:customers:changed'

const SEED: Customer[] = [
  { id: 'm-1001', name: 'Noura Al-Sabah', area: 'Salmiya', planId: 'standard', kgUsed: 31, credit: 0, frozen: false },
  { id: 'm-1002', name: 'Yousef Al-Ajmi', area: 'Jabriya', planId: 'premium', kgUsed: 52, credit: 0, frozen: false },
  { id: 'm-1003', name: 'Dana Khalid', area: 'Mishref', planId: 'basic', kgUsed: 17, credit: 0, frozen: false },
  { id: 'm-1004', name: 'Abdullah Al-Rashed', area: 'Rumaithiya', planId: 'family-plus', kgUsed: 74, credit: 0, frozen: false },
  { id: 'm-1005', name: 'Fatima Al-Enezi', area: 'Bayan', planId: 'standard', kgUsed: 39, credit: 0, frozen: false },
  { id: 'm-1006', name: 'Mishari Al-Otaibi', area: 'Salwa', planId: 'basic', kgUsed: 8, credit: 0, frozen: false },
]

function emit() {
  try {
    window.dispatchEvent(new Event(EVENT))
  } catch {
    /* non-browser */
  }
}

export function getCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY)
    if (!raw) return SEED
    const arr = JSON.parse(raw) as Customer[]
    return Array.isArray(arr) && arr.length ? arr : SEED
  } catch {
    return SEED
  }
}

function write(list: Customer[]) {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable */
  }
  emit()
}

export function updateCustomer(id: string, patch: Partial<Customer>): Customer[] {
  const next = getCustomers().map((c) => (c.id === id ? { ...c, ...patch } : c))
  write(next)
  return next
}

export function toggleFreeze(id: string): Customer[] {
  const next = getCustomers().map((c) => (c.id === id ? { ...c, frozen: !c.frozen } : c))
  write(next)
  return next
}

export function grantCustomerCredit(id: string, kwd: number): Customer[] {
  const next = getCustomers().map((c) => (c.id === id ? { ...c, credit: Math.max(0, c.credit + kwd) } : c))
  write(next)
  return next
}

export function subscribeCustomers(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === CUSTOMERS_KEY || e.key === null) cb()
  }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}
