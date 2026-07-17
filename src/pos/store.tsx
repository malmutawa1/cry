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
  seedExtras,
  seedMembers,
  seedPlans,
  staff as staffList,
  suggestBlocks,
  type ExtraBlock,
  type Intake,
  type Member,
  type OrderBlocks,
  type Plan,
  type Staff,
} from './data'
import {
  RUSH_DEFAULTS,
  tierFee,
  readyBy as rushReadyBy,
  recordRush,
  type RushTier,
} from '../data/rush'

const PLANS_KEY = 'pressd-pos:plans:v2'
const EXTRAS_KEY = 'pressd-pos:extras:v2'
const MEMBERS_KEY = 'pressd-pos:members:v2'
const INTAKES_KEY = 'pressd-pos:intakes:v3'
const OCCUPIED_KEY = 'pressd-pos:occupied:v1'

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
    /* storage unavailable — terminal keeps running from memory */
  }
}

export function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

/** Deterministic PRNG so the seeded intake history is stable across reloads. */
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

/** A week of past intakes so the operations dashboard is populated on launch. */
function seedIntakes(plans: Plan[], extras: ExtraBlock[], members: Member[]): Intake[] {
  const rng = mulberry32(20260715)
  const out: Intake[] = []
  const now = Date.now()
  for (let day = 6; day >= 0; day--) {
    const count = 6 + Math.floor(rng() * 8)
    for (let i = 0; i < count; i++) {
      const member = members[Math.floor(rng() * members.length)]
      const plan = plans.find((p) => p.id === member.planId) ?? plans[0]
      const kg = round3(3 + rng() * 9)
      const remainingBefore = Math.max(0, plan.capKg - Math.floor(rng() * plan.capKg))
      const overflowKg = Math.max(0, round3(kg - remainingBefore))
      const s = suggestBlocks(overflowKg, extras)
      const d = new Date(now - day * 86400000)
      d.setHours(9 + Math.floor(rng() * 11), Math.floor(rng() * 60), 0, 0)
      const clerk = staffList[Math.floor(rng() * staffList.length)]
      const tier: RushTier = rng() > 0.82 ? (rng() > 0.6 ? 'urgent' : 'express') : 'standard'
      out.push({
        id: `PRS-${7000 + out.length}`,
        ts: d.getTime(),
        memberId: member.id,
        memberName: member.name,
        planId: plan.id,
        planName: plan.name,
        kg,
        remainingBefore,
        coveredKg: round3(Math.min(kg, remainingBefore)),
        overflowKg,
        blocks: { k5: s.k5, k8: s.k8 },
        extraKgAdded: s.kg,
        extraCharge: round3(s.price),
        hangers: rng() > 0.4,
        tier,
        rushFee: tierFee(tier, RUSH_DEFAULTS),
        readyBy: rushReadyBy(tier, d.getTime()),
        express: tier !== 'standard',
        staffId: clerk.id,
        staffName: clerk.name,
      })
    }
  }
  return out.sort((a, b) => a.ts - b.ts)
}

export interface IntakeDraft {
  memberId: string
  kg: number
  remainingBefore: number
  coveredKg: number
  overflowKg: number
  blocks: OrderBlocks
  extraKgAdded: number
  extraCharge: number
  hangers: boolean
  tier: RushTier
  rushFee: number
}

interface PosState {
  staff: Staff[]
  currentStaff: Staff | null
  plans: Plan[]
  extras: ExtraBlock[]
  members: Member[]
  intakes: Intake[]
  /** Composite slotKey()s the driver is marked occupied for (pickup/delivery). */
  occupied: string[]
  login: (pin: string) => Staff | null
  logout: () => void
  addPlan: (p: Omit<Plan, 'id'>) => void
  updatePlan: (p: Plan) => void
  deletePlan: (id: string) => void
  updateExtra: (e: ExtraBlock) => void
  recordIntake: (draft: IntakeDraft) => Intake | null
  toggleOccupied: (key: string) => void
  /** Bulk mark/clear a set of slot keys (e.g. a whole day). */
  setOccupied: (keys: string[], value: boolean) => void
}

const Ctx = createContext<PosState | null>(null)

export function PosProvider({ children }: { children: ReactNode }) {
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null)
  const [plans, setPlans] = useState<Plan[]>(() => load(PLANS_KEY, seedPlans))
  const [extras, setExtras] = useState<ExtraBlock[]>(() => load(EXTRAS_KEY, seedExtras))
  const [members, setMembers] = useState<Member[]>(() => load(MEMBERS_KEY, seedMembers))
  const [intakes, setIntakes] = useState<Intake[]>(() => {
    const existing = load<Intake[] | null>(INTAKES_KEY, null)
    if (existing) return existing
    const seeded = seedIntakes(seedPlans, seedExtras, seedMembers)
    save(INTAKES_KEY, seeded)
    // Seed today's rush intakes into the shared cap ledger so the live counter
    // matches the day's accepted rush orders (recordRush de-dupes by id).
    const startToday = new Date().setHours(0, 0, 0, 0)
    for (const i of seeded) {
      if (i.tier !== 'standard' && i.ts >= startToday) recordRush(i.tier, i.rushFee, i.id)
    }
    return seeded
  })
  const [occupied, setOccupiedState] = useState<string[]>(() => load(OCCUPIED_KEY, []))

  useEffect(() => save(PLANS_KEY, plans), [plans])
  useEffect(() => save(EXTRAS_KEY, extras), [extras])
  useEffect(() => save(MEMBERS_KEY, members), [members])
  useEffect(() => save(INTAKES_KEY, intakes), [intakes])
  useEffect(() => save(OCCUPIED_KEY, occupied), [occupied])

  const login = useCallback((pin: string) => {
    const match = staffList.find((s) => s.pin === pin) ?? null
    if (match) setCurrentStaff(match)
    return match
  }, [])
  const logout = useCallback(() => setCurrentStaff(null), [])

  const addPlan = useCallback((p: Omit<Plan, 'id'>) => {
    setPlans((prev) => [...prev, { ...p, id: `plan-${Date.now()}` }])
  }, [])
  const updatePlan = useCallback((p: Plan) => {
    setPlans((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  }, [])
  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((x) => x.id !== id))
  }, [])
  const updateExtra = useCallback((e: ExtraBlock) => {
    setExtras((prev) => prev.map((x) => (x.id === e.id ? e : x)))
  }, [])

  const recordIntake = useCallback<PosState['recordIntake']>(
    (draft) => {
      if (!currentStaff) return null
      const member = members.find((m) => m.id === draft.memberId)
      if (!member) return null
      const plan = plans.find((p) => p.id === member.planId)
      const intake: Intake = {
        id: `PRS-${9000 + Math.floor(Math.random() * 999)}`,
        ts: Date.now(),
        memberId: member.id,
        memberName: member.name,
        planId: member.planId,
        planName: plan?.name ?? '—',
        kg: draft.kg,
        remainingBefore: draft.remainingBefore,
        coveredKg: draft.coveredKg,
        overflowKg: draft.overflowKg,
        blocks: draft.blocks,
        extraKgAdded: draft.extraKgAdded,
        extraCharge: draft.extraCharge,
        hangers: draft.hangers,
        tier: draft.tier,
        rushFee: draft.rushFee,
        readyBy: rushReadyBy(draft.tier, Date.now()),
        express: draft.tier !== 'standard',
        staffId: currentStaff.id,
        staffName: currentStaff.name,
      }
      setIntakes((prev) => [...prev, intake])
      // Rush intakes count toward the shared daily cap + reporting ledger.
      if (draft.tier !== 'standard') recordRush(draft.tier, draft.rushFee, intake.id)
      // Deduct the batch from the member's monthly allowance usage.
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, kgUsed: round3(m.kgUsed + draft.kg) } : m)),
      )
      return intake
    },
    [currentStaff, members, plans],
  )

  const toggleOccupied = useCallback((key: string) => {
    setOccupiedState((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }, [])

  const setOccupied = useCallback((keys: string[], value: boolean) => {
    setOccupiedState((prev) => {
      const set = new Set(prev)
      if (value) keys.forEach((k) => set.add(k))
      else keys.forEach((k) => set.delete(k))
      return [...set]
    })
  }, [])

  const value = useMemo<PosState>(
    () => ({
      staff: staffList,
      currentStaff,
      plans,
      extras,
      members,
      intakes,
      occupied,
      login,
      logout,
      addPlan,
      updatePlan,
      deletePlan,
      updateExtra,
      recordIntake,
      toggleOccupied,
      setOccupied,
    }),
    [currentStaff, plans, extras, members, intakes, occupied, login, logout, addPlan, updatePlan, deletePlan, updateExtra, recordIntake, toggleOccupied, setOccupied],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePos(): PosState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePos must be used inside <PosProvider>')
  return ctx
}
