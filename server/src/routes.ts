import { db } from './db.ts'
import { hashPassword, verifyPassword, signToken } from './auth.ts'
import { Router, HttpError, json, requireAuth, requireStaff, str, type Ctx } from './http.ts'
import {
  PLANS,
  REWARDS,
  EXTRAS,
  planById,
  planPrice,
  cardBrand,
  POINTS_PER_PICKUP,
  LAST_STAGE,
  REFERRAL_REWARD_POINTS,
  REFERRAL_CREDIT_KWD,
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
  listCards,
  addCard,
  setDefaultCard,
  serializeUser,
  serializeLoyalty,
  serializeSub,
  serializeOrder,
  serializeCard,
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
    cards: listCards(userId).map(serializeCard),
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

  // ---------- Order tracking (single order) ----------
  r.get('/api/orders/:id', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(ctx.params.id, userId) as OrderRow | undefined
    if (!order) throw new HttpError(404, 'Order not found')
    json(ctx.res, 200, { order: serializeOrder(order) })
  })

  // ---------- Referrals ----------
  r.get('/api/referral', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const user = findUserById(userId)!
    const count = db.prepare('SELECT COUNT(*) AS n FROM users WHERE referred_by = ?').get(userId) as { n: number }
    json(ctx.res, 200, { code: user.referral_code, referredCount: count.n, rewardPoints: REFERRAL_REWARD_POINTS, creditKwd: REFERRAL_CREDIT_KWD })
  })

  r.post('/api/referral/apply', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const code = str(ctx.body, 'code').trim().toUpperCase()
    const me = findUserById(userId)!
    if (me.referred_by) throw new HttpError(409, 'A referral code has already been applied to this account')
    const referrer = db.prepare('SELECT * FROM users WHERE UPPER(referral_code) = ?').get(code) as { id: number } | undefined
    if (!referrer) throw new HttpError(404, 'Invalid referral code')
    if (referrer.id === userId) throw new HttpError(400, "You can't use your own code")
    db.prepare('UPDATE users SET referred_by = ? WHERE id = ?').run(referrer.id, userId)
    addPoints(referrer.id, REFERRAL_REWARD_POINTS) // referrer earns points
    addPerk(userId, 'credit', REFERRAL_CREDIT_KWD) // invited user gets credit
    json(ctx.res, 200, { applied: true, creditKwd: REFERRAL_CREDIT_KWD, loyalty: serializeLoyalty(getLoyalty(userId)) })
  })

  // ---------- Payment methods (cards) ----------
  r.get('/api/cards', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    json(ctx.res, 200, { cards: listCards(userId).map(serializeCard), paymentMethod: findUserById(userId)!.payment_method })
  })

  r.post('/api/cards', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const digits = str(ctx.body, 'number').replace(/\D/g, '')
    if (digits.length < 12) throw new HttpError(400, 'Enter a valid card number')
    const card = addCard(userId, cardBrand(digits), digits.slice(-4))
    json(ctx.res, 201, { card: serializeCard(card), cards: listCards(userId).map(serializeCard) })
  })

  r.delete('/api/cards/:id', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    db.prepare('DELETE FROM cards WHERE id = ? AND user_id = ?').run(Number(ctx.params.id), userId)
    json(ctx.res, 200, { cards: listCards(userId).map(serializeCard) })
  })

  r.post('/api/cards/:id/default', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const cardId = Number(ctx.params.id)
    const owned = db.prepare('SELECT 1 FROM cards WHERE id = ? AND user_id = ?').get(cardId, userId)
    if (!owned) throw new HttpError(404, 'Card not found')
    setDefaultCard(userId, cardId)
    db.prepare('UPDATE users SET payment_method = ? WHERE id = ?').run(`card:${cardId}`, userId)
    json(ctx.res, 200, { cards: listCards(userId).map(serializeCard), paymentMethod: `card:${cardId}` })
  })

  /** Select applepay / knet / card:<id> as the active method. */
  r.post('/api/payment-method', (ctx: Ctx) => {
    const userId = requireAuth(ctx)
    const method = str(ctx.body, 'method')
    const ok = method === 'applepay' || method === 'knet' || /^card:\d+$/.test(method)
    if (!ok) throw new HttpError(400, 'Invalid payment method')
    if (method.startsWith('card:')) {
      const cardId = Number(method.slice(5))
      if (!db.prepare('SELECT 1 FROM cards WHERE id = ? AND user_id = ?').get(cardId, userId)) throw new HttpError(404, 'Card not found')
      setDefaultCard(userId, cardId)
    }
    db.prepare('UPDATE users SET payment_method = ? WHERE id = ?').run(method, userId)
    json(ctx.res, 200, { paymentMethod: method })
  })

  // ---------- Staff / admin (guarded by x-staff-key) ----------
  r.get('/api/staff/orders', (ctx: Ctx) => {
    requireStaff(ctx)
    const rows = db
      .prepare(`SELECT o.*, u.name AS user_name, u.email AS user_email
                FROM orders o JOIN users u ON u.id = o.user_id
                ORDER BY o.created_at DESC LIMIT 200`)
      .all() as (OrderRow & { user_name: string; user_email: string })[]
    json(ctx.res, 200, {
      orders: rows.map((o) => ({ ...serializeOrder(o), customer: { name: o.user_name, email: o.user_email } })),
    })
  })

  r.post('/api/staff/orders/:id/advance', (ctx: Ctx) => {
    requireStaff(ctx)
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(ctx.params.id) as OrderRow | undefined
    if (!order) throw new HttpError(404, 'Order not found')
    const next = Math.min(LAST_STAGE, order.stage + 1)
    db.prepare('UPDATE orders SET stage = ?, stage_updated_at = ? WHERE id = ?').run(next, Date.now(), order.id)
    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id) as OrderRow
    json(ctx.res, 200, { order: serializeOrder(updated) })
  })

  r.get('/api/staff/stats', (ctx: Ctx) => {
    requireStaff(ctx)
    const users = db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }
    const orders = db.prepare('SELECT COUNT(*) AS n FROM orders').get() as { n: number }
    const active = db.prepare('SELECT COUNT(*) AS n FROM subscriptions WHERE canceled_at IS NULL').get() as { n: number }
    const inProgress = db.prepare('SELECT COUNT(*) AS n FROM orders WHERE stage < ?').get(LAST_STAGE) as { n: number }
    json(ctx.res, 200, { users: users.n, orders: orders.n, activeSubscriptions: active.n, ordersInProgress: inProgress.n })
  })
}
