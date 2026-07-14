import { db } from './db.ts'
import {
  planById,
  planPrice,
  periodEnd,
  tierInfo,
  ORDER_STAGES,
  STAGE_LABELS,
  LAST_STAGE,
  type Billing,
  type OrderStage,
} from './domain.ts'

export interface UserRow {
  id: number
  name: string
  email: string
  phone: string
  gender: string | null
  accent: string
  address: string
  password_hash: string
  created_at: number
  role: string
  referral_code: string | null
  referred_by: number | null
  payment_method: string
}

export interface LoyaltyRow {
  user_id: number
  points: number
  lifetime_points: number
  credit: number
  free_months: number
  extra_kg: number
}

export interface SubRow {
  id: number
  user_id: number
  plan_id: string
  billing: string
  started_at: number
  frozen: number
  canceled_at: number | null
}

export interface OrderRow {
  id: string
  user_id: number
  created_at: number
  pickup: string
  delivery: string
  address: string
  phone: string
  status: string
  stage: number
  stage_updated_at: number
}

export interface CardRow {
  id: number
  user_id: number
  brand: string
  last4: string
  is_default: number
  created_at: number
}

// ---------- Users ----------
export function findUserByEmail(email: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as UserRow | undefined
}
export function findUserById(id: number): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined
}

export function createUser(input: {
  name: string
  email: string
  phone?: string
  gender?: string | null
  accent?: string
  address?: string
  passwordHash: string
}): UserRow {
  const now = Date.now()
  const info = db
    .prepare(
      `INSERT INTO users (name, email, phone, gender, accent, address, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name.trim(),
      input.email.toLowerCase(),
      input.phone ?? '',
      input.gender ?? null,
      input.accent ?? 'blue',
      input.address ?? '',
      input.passwordHash,
      now,
    )
  const id = Number(info.lastInsertRowid)
  // seed loyalty (matches the frontend's starting balance)
  db.prepare('INSERT INTO loyalty (user_id, points, lifetime_points) VALUES (?, 320, 320)').run(id)
  // deterministic, unique referral code
  const initials = input.name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'FRND'
  db.prepare('UPDATE users SET referral_code = ? WHERE id = ?').run(`PRESSD-${initials}${String(id).padStart(2, '0')}`, id)
  return findUserById(id)!
}

export function updateProfile(userId: number, fields: Partial<Pick<UserRow, 'name' | 'email' | 'phone' | 'address'>>): void {
  const sets: string[] = []
  const vals: unknown[] = []
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue
    sets.push(`${k} = ?`)
    vals.push(k === 'email' ? String(v).toLowerCase() : v)
  }
  if (!sets.length) return
  vals.push(userId)
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...(vals as never[]))
}

// ---------- Loyalty ----------
export function getLoyalty(userId: number): LoyaltyRow {
  return db.prepare('SELECT * FROM loyalty WHERE user_id = ?').get(userId) as LoyaltyRow
}
export function addPoints(userId: number, delta: number): void {
  db.prepare('UPDATE loyalty SET points = points + ?, lifetime_points = lifetime_points + ? WHERE user_id = ?').run(delta, delta, userId)
}
export function spendPoints(userId: number, cost: number): void {
  db.prepare('UPDATE loyalty SET points = points - ? WHERE user_id = ?').run(cost, userId)
}
export function addPerk(userId: number, column: 'credit' | 'free_months' | 'extra_kg', amount: number): void {
  db.prepare(`UPDATE loyalty SET ${column} = ${column} + ? WHERE user_id = ?`).run(amount, userId)
}

// ---------- Subscription ----------
export function activeSub(userId: number): SubRow | undefined {
  return db
    .prepare('SELECT * FROM subscriptions WHERE user_id = ? AND canceled_at IS NULL ORDER BY id DESC LIMIT 1')
    .get(userId) as SubRow | undefined
}

// ---------- Cards ----------
export function listCards(userId: number): CardRow[] {
  return db.prepare('SELECT * FROM cards WHERE user_id = ? ORDER BY id DESC').all(userId) as CardRow[]
}
export function addCard(userId: number, brand: string, last4: string): CardRow {
  const isFirst = listCards(userId).length === 0
  const info = db.prepare('INSERT INTO cards (user_id, brand, last4, is_default, created_at) VALUES (?, ?, ?, ?, ?)').run(userId, brand, last4, isFirst ? 1 : 0, Date.now())
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(Number(info.lastInsertRowid)) as CardRow
  if (isFirst) db.prepare("UPDATE users SET payment_method = ? WHERE id = ?").run(`card:${card.id}`, userId)
  return card
}
export function setDefaultCard(userId: number, cardId: number): void {
  db.prepare('UPDATE cards SET is_default = CASE id WHEN ? THEN 1 ELSE 0 END WHERE user_id = ?').run(cardId, userId)
}

// ---------- Order stage ----------
export function stageOf(o: OrderRow): { index: number; key: OrderStage; label: string; delivered: boolean } {
  const index = Math.max(0, Math.min(LAST_STAGE, o.stage))
  const key = ORDER_STAGES[index]!
  return { index, key, label: STAGE_LABELS[key], delivered: index >= LAST_STAGE }
}

// ---------- Serializers (shape the API/JSON responses) ----------
export function serializeUser(u: UserRow) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    gender: u.gender,
    accent: u.accent,
    address: u.address,
    role: u.role,
    referralCode: u.referral_code,
    paymentMethod: u.payment_method,
    createdAt: u.created_at,
  }
}

export function serializeCard(c: CardRow) {
  return { id: c.id, brand: c.brand, last4: c.last4, isDefault: !!c.is_default }
}

export function serializeLoyalty(l: LoyaltyRow) {
  const tier = tierInfo(l.lifetime_points)
  return {
    points: l.points,
    lifetimePoints: l.lifetime_points,
    credit: l.credit,
    freeMonths: l.free_months,
    extraKg: l.extra_kg,
    tier: tier.current,
    nextTier: tier.next,
    nextTierAt: tier.nextAt,
    progress: tier.progress,
  }
}

export function serializeSub(s: SubRow | undefined) {
  if (!s) return null
  const plan = planById(s.plan_id)
  const billing = s.billing as Billing
  return {
    planId: s.plan_id,
    planName: plan?.name ?? s.plan_id,
    billing,
    priceKwd: plan ? planPrice(plan, billing) : 0,
    capKg: plan?.capKg ?? 0,
    frozen: !!s.frozen,
    startedAt: s.started_at,
    expiresAt: periodEnd(s.started_at, billing),
  }
}

export function serializeOrder(o: OrderRow) {
  const st = stageOf(o)
  return {
    id: o.id,
    createdAt: o.created_at,
    pickup: o.pickup,
    delivery: o.delivery,
    address: o.address,
    phone: o.phone,
    stage: st.index,
    stageKey: st.key,
    stageLabel: st.label,
    delivered: st.delivered,
    stageUpdatedAt: o.stage_updated_at || o.created_at,
  }
}
