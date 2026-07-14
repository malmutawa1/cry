import { db } from './db.ts'
import { planById, planPrice, periodEnd, tierInfo, type Billing } from './domain.ts'

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

// ---------- Serializers (shape the API/JSON responses) ----------
export function serializeUser(u: UserRow) {
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, gender: u.gender, accent: u.accent, address: u.address, createdAt: u.created_at }
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
  return { id: o.id, createdAt: o.created_at, pickup: o.pickup, delivery: o.delivery, address: o.address, phone: o.phone, status: o.status }
}
