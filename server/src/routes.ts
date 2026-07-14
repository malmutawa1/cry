import { db } from './db.ts'
import { hashPassword, verifyPassword, signToken } from './auth.ts'
import { Router, HttpError, json, requireAuth, str, type Ctx } from './http.ts'
import {
  PLANS,
  REWARDS,
  EXTRAS,
  planById,
  planPrice,
  POINTS_PER_PICKUP,
  type Billing,
} from './domain.ts'
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateProfile,
  getLoyalty,
  addPoints,
  spendPoints,
  addPerk,
  activeSub,
  serializeUser,
  serializeLoyalty,
  serializeSub,
  serializeOrder,
  type OrderRow,
} from './repo.ts'

const EMAIL_RE = /.+@.+\..+/

/** Full account snapshot returned after auth and on /me. */
function accountSnapshot(userId: number) {
  const user = findUserById(userId)!
  return {
    user: serializeUser(user),
    loyalty: serializeLoyalty(getLoyalty(userId)),
    subscription: serializeSub(activeSub(userId)),
  }
}

function genOrderId(): string {
  for (let i = 0; i < 20; i++) {
    const id = 'PRS-' + Math.floor(1000 + Math.random() * 9000)
    const exists = db.prepare('SELECT 1 FROM orders WHERE id = ?').get(id)
    if (!exists) return id
  }
  return 'PRS-' + Date.now()
}

export function registerRoutes(r: Router): void {
  // ---------- Auth ----------
  r.post('/api/auth/signup', (ctx: Ctx) => {
    const name = str(ctx.body, 'name', { min: 1 })
    const email = str(ctx.body, 'email')
    const password = str(ctx.body, 'password', { min: 4 })
    const phone = str(ctx.body, 'phone', { optional: true })
    const gender = str(ctx.body, 'gender', { optional: true })
    const address = str(ctx.body, 'address', { optional: true })
    if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Invalid email address')
    if (findUserByEmail(email)) throw new HttpError(409, 'An account with that email already exists')

    const user = createUser({
      name,
      email,
      phone,
      gender: gender || null,
      accent: gender === 'female' ? 'pink' : 'blue',
      address,
      passwordHash: hashPassword(password),
    })
    const token = signToken({ sub: user.id })
    json(ctx.res, 201, { token, ...accountSnapshot(user.id) })
  })

  r.post('/api/auth/login', (ctx: Ctx) => {
    const email = str(ctx.body, 'email')
    const password = str(ctx.body, 'password')
    const user = findUserByEmail(email)
    if (!user || !verifyPassword(password, user.password_hash)) {
      throw new HttpError(401, 'Incorrect email or password')
    }
    const token = signToken({ sub: user.id })
    json(ctx.res, 200, { token, ...accountSnapshot(user.id) })
  })

  r.get('/api/auth/me', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    json(ctx.res, 200, accountSnapshot(userId))
  })

  r.patch('/api/auth/me', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const name = str(ctx.body, 'name', { optional: true })
    const email = str(ctx.body, 'email', { optional: true })
    const phone = str(ctx.body, 'phone', { optional: true })
    const address = str(ctx.body, 'address', { optional: true })
    if (email && !EMAIL_RE.test(email)) throw new HttpError(400, 'Invalid email address')
    if (email) {
      const other = findUserByEmail(email)
      if (other && other.id !== userId) throw new HttpError(409, 'Email already in use')
    }
    updateProfile(userId, {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(address ? { address } : {}),
    })
    json(ctx.res, 200, accountSnapshot(userId))
  })

  // ---------- Plans catalog ----------
  r.get('/api/plans', (ctx: Ctx) => {
    json(ctx.res, 200, {
      plans: PLANS.map((p) => ({
        ...p,
        priceMonthly: planPrice(p, 'monthly'),
        priceAnnual: planPrice(p, 'annual'),
      })),
    })
  })

  // ---------- Subscription ----------
  r.get('/api/subscription', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    json(ctx.res, 200, { subscription: serializeSub(activeSub(userId)) })
  })

  r.post('/api/subscription', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const planId = str(ctx.body, 'planId')
    const billingRaw = str(ctx.body, 'billing', { optional: true }) || 'monthly'
    const plan = planById(planId)
    if (!plan) throw new HttpError(400, 'Unknown plan')
    if (billingRaw !== 'monthly' && billingRaw !== 'annual') throw new HttpError(400, 'Invalid billing period')
    const billing = billingRaw as Billing

    const now = Date.now()
    // a new subscribe/upgrade/switch starts a fresh billing period
    db.prepare('UPDATE subscriptions SET canceled_at = ? WHERE user_id = ? AND canceled_at IS NULL').run(now, userId)
    db.prepare('INSERT INTO subscriptions (user_id, plan_id, billing, started_at) VALUES (?, ?, ?, ?)').run(userId, planId, billing, now)
    db.prepare('INSERT INTO payments (user_id, kind, amount_kwd, detail, created_at) VALUES (?, ?, ?, ?, ?)').run(
      userId, 'subscription', planPrice(plan, billing), `${plan.name} (${billing})`, now,
    )
    json(ctx.res, 200, { subscription: serializeSub(activeSub(userId)) })
  })

  r.post('/api/subscription/cancel', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const sub = activeSub(userId)
    if (!sub) throw new HttpError(404, 'No active subscription')
    db.prepare('UPDATE subscriptions SET canceled_at = ? WHERE id = ?').run(Date.now(), sub.id)
    json(ctx.res, 200, { subscription: null })
  })

  r.post('/api/subscription/freeze', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const sub = activeSub(userId)
    if (!sub) throw new HttpError(404, 'No active subscription')
    const frozen = (ctx.body as { frozen?: unknown })?.frozen
    db.prepare('UPDATE subscriptions SET frozen = ? WHERE id = ?').run(frozen ? 1 : 0, sub.id)
    json(ctx.res, 200, { subscription: serializeSub(activeSub(userId)) })
  })

  // ---------- Orders (pickups) ----------
  r.get('/api/orders', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId) as OrderRow[]
    json(ctx.res, 200, { orders: rows.map(serializeOrder) })
  })

  r.post('/api/orders', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    if (!activeSub(userId)) throw new HttpError(403, 'An active subscription is required to schedule a pickup')
    const pickup = str(ctx.body, 'pickup', { optional: true })
    const delivery = str(ctx.body, 'delivery', { optional: true })
    const address = str(ctx.body, 'address', { optional: true })
    const phone = str(ctx.body, 'phone', { optional: true })
    const id = genOrderId()
    const now = Date.now()
    db.prepare('INSERT INTO orders (id, user_id, created_at, pickup, delivery, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, userId, now, pickup, delivery, address, phone)
    addPoints(userId, POINTS_PER_PICKUP) // completing a pickup earns points
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow
    json(ctx.res, 201, { order: serializeOrder(order), loyalty: serializeLoyalty(getLoyalty(userId)) })
  })

  // ---------- Loyalty ----------
  r.get('/api/loyalty', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    json(ctx.res, 200, { loyalty: serializeLoyalty(getLoyalty(userId)), rewards: REWARDS })
  })

  r.post('/api/loyalty/redeem', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const rewardId = str(ctx.body, 'rewardId')
    const reward = REWARDS.find((x) => x.id === rewardId)
    if (!reward) throw new HttpError(400, 'Unknown reward')
    const loyalty = getLoyalty(userId)
    if (loyalty.points < reward.pts) throw new HttpError(400, 'Not enough points')

    spendPoints(userId, reward.pts) // balance drops; lifetime (tier) is untouched
    if (reward.effect === 'extraKg') addPerk(userId, 'extra_kg', reward.amount)
    else if (reward.effect === 'credit') addPerk(userId, 'credit', reward.amount)
    else if (reward.effect === 'freeMonth') addPerk(userId, 'free_months', reward.amount)
    db.prepare('INSERT INTO redemptions (user_id, reward_id, pts, created_at) VALUES (?, ?, ?, ?)').run(userId, reward.id, reward.pts, Date.now())
    json(ctx.res, 200, { reward: { id: reward.id, applied: reward.effect, amount: reward.amount }, loyalty: serializeLoyalty(getLoyalty(userId)) })
  })

  // ---------- Extra-kg top-up (one-time) ----------
  r.post('/api/extra-kg', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const kg = Number((ctx.body as { kg?: unknown })?.kg)
    const extra = EXTRAS.find((e) => e.kg === kg)
    if (!extra) throw new HttpError(400, 'Invalid top-up amount')
    addPerk(userId, 'extra_kg', extra.kg)
    db.prepare('INSERT INTO payments (user_id, kind, amount_kwd, detail, created_at) VALUES (?, ?, ?, ?, ?)').run(
      userId, 'extra-kg', extra.priceKwd, `+${extra.kg} kg`, Date.now(),
    )
    json(ctx.res, 200, { loyalty: serializeLoyalty(getLoyalty(userId)) })
  })
}
