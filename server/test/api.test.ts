import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'

// Configure a clean, isolated environment BEFORE importing the app.
process.env.DB_PATH = ':memory:'
process.env.JWT_SECRET = 'test-secret'
process.env.STAFF_KEY = 'test-staff'
process.env.AUTH_RATE_MAX = '1000' // don't rate-limit the functional suite
process.env.MAX_BODY_BYTES = '4096'

const { buildServer } = await import('../src/app.ts')
const { rateLimit } = await import('../src/http.ts')
const { verifyToken, hashToken, hashPassword, verifyPassword } = await import('../src/auth.ts')

const server = buildServer()
let base = ''

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
  const addr = server.address()
  base = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`
})
after(() => server.close())

interface Res {
  status: number
  data: any
}
async function req(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<Res> {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}
const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

let uniq = 0
const email = () => `user${Date.now()}_${uniq++}@example.com`

async function newUser(): Promise<{ token: string; refreshToken: string; email: string }> {
  const e = email()
  const r = await req('POST', '/api/auth/signup', { name: 'Test User', email: e, password: 'secret1' })
  assert.equal(r.status, 201)
  return { token: r.data.token, refreshToken: r.data.refreshToken, email: e }
}

// ---------- Unit-level guards ----------
test('password hashing round-trips and rejects wrong password', () => {
  const h = hashPassword('hunter2')
  assert.ok(verifyPassword('hunter2', h))
  assert.ok(!verifyPassword('nope', h))
})

test('verifyToken rejects tampered/garbage tokens', () => {
  assert.equal(verifyToken('not.a.jwt'), null)
  assert.equal(verifyToken('a.b.c'), null)
})

test('hashToken is deterministic', () => {
  assert.equal(hashToken('abc'), hashToken('abc'))
  assert.notEqual(hashToken('abc'), hashToken('abd'))
})

test('rateLimit blocks after the limit within the window', () => {
  const key = 'unit-test-' + Math.random()
  assert.ok(rateLimit(key, 3, 10_000))
  assert.ok(rateLimit(key, 3, 10_000))
  assert.ok(rateLimit(key, 3, 10_000))
  assert.ok(!rateLimit(key, 3, 10_000)) // 4th blocked
})

// ---------- Health ----------
test('health check reports ok with a working DB', async () => {
  const r = await req('GET', '/health')
  assert.equal(r.status, 200)
  assert.equal(r.data.ok, true)
})

// ---------- Auth ----------
test('signup issues an access token + refresh token and seeds loyalty', async () => {
  const r = await req('POST', '/api/auth/signup', { name: 'Ada', email: email(), password: 'secret1' })
  assert.equal(r.status, 201)
  assert.ok(r.data.token && r.data.refreshToken)
  assert.equal(r.data.loyalty.points, 320)
  assert.ok(r.data.user.referralCode)
})

test('signup rejects a bad email and a duplicate email', async () => {
  assert.equal((await req('POST', '/api/auth/signup', { name: 'X', email: 'bad', password: 'secret1' })).status, 400)
  const e = email()
  await req('POST', '/api/auth/signup', { name: 'X', email: e, password: 'secret1' })
  assert.equal((await req('POST', '/api/auth/signup', { name: 'Y', email: e, password: 'secret1' })).status, 409)
})

test('signup validates required + length limits', async () => {
  assert.equal((await req('POST', '/api/auth/signup', { email: email(), password: 'secret1' })).status, 400) // no name
  assert.equal((await req('POST', '/api/auth/signup', { name: 'X', email: email(), password: '1' })).status, 400) // short pw
  const longName = 'a'.repeat(200)
  assert.equal((await req('POST', '/api/auth/signup', { name: longName, email: email(), password: 'secret1' })).status, 400)
})

test('login succeeds with correct creds and 401s otherwise', async () => {
  const e = email()
  await req('POST', '/api/auth/signup', { name: 'Lo', email: e, password: 'secret1' })
  assert.equal((await req('POST', '/api/auth/login', { email: e, password: 'secret1' })).status, 200)
  assert.equal((await req('POST', '/api/auth/login', { email: e, password: 'wrong' })).status, 401)
})

test('/me requires a valid token', async () => {
  assert.equal((await req('GET', '/api/auth/me')).status, 401)
  const u = await newUser()
  const r = await req('GET', '/api/auth/me', undefined, auth(u.token))
  assert.equal(r.status, 200)
  assert.equal(r.data.user.email, u.email)
})

// ---------- Refresh token rotation ----------
test('refresh returns a new session and rotates (old refresh token is revoked)', async () => {
  const u = await newUser()
  const r1 = await req('POST', '/api/auth/refresh', { refreshToken: u.refreshToken })
  assert.equal(r1.status, 200)
  assert.ok(r1.data.token && r1.data.refreshToken)
  assert.notEqual(r1.data.refreshToken, u.refreshToken)
  // the used refresh token is now invalid
  assert.equal((await req('POST', '/api/auth/refresh', { refreshToken: u.refreshToken })).status, 401)
  // the new one works
  assert.equal((await req('POST', '/api/auth/refresh', { refreshToken: r1.data.refreshToken })).status, 200)
})

test('logout revokes a refresh token', async () => {
  const u = await newUser()
  assert.equal((await req('POST', '/api/auth/logout', { refreshToken: u.refreshToken })).status, 200)
  assert.equal((await req('POST', '/api/auth/refresh', { refreshToken: u.refreshToken })).status, 401)
})

// ---------- Domain flows ----------
test('plans catalog is public', async () => {
  const r = await req('GET', '/api/plans')
  assert.equal(r.status, 200)
  assert.ok(r.data.plans.length >= 4)
})

test('subscribe returns plan + computed expiry; order earns points', async () => {
  const u = await newUser()
  const sub = await req('POST', '/api/subscription', { planId: 'standard', billing: 'monthly' }, auth(u.token))
  assert.equal(sub.status, 200)
  assert.equal(sub.data.subscription.planId, 'standard')
  assert.ok(sub.data.subscription.expiresAt > sub.data.subscription.startedAt)

  const ord = await req('POST', '/api/orders', { pickup: 'a', delivery: 'b' }, auth(u.token))
  assert.equal(ord.status, 201)
  assert.equal(ord.data.loyalty.points, 370) // 320 + 50
  assert.equal(ord.data.loyalty.lifetimePoints, 370)
})

test('order requires an active subscription', async () => {
  const u = await newUser()
  assert.equal((await req('POST', '/api/orders', { pickup: 'a' }, auth(u.token))).status, 403)
})

test('unknown plan is rejected', async () => {
  const u = await newUser()
  assert.equal((await req('POST', '/api/subscription', { planId: 'nope' }, auth(u.token))).status, 400)
})

test('redeem rejects when short on points', async () => {
  const u = await newUser()
  const r = await req('POST', '/api/loyalty/redeem', { rewardId: 'extra5' }, auth(u.token)) // needs 750, has 320
  assert.equal(r.status, 400)
})

test('extra-kg validates the amount', async () => {
  const u = await newUser()
  assert.equal((await req('POST', '/api/extra-kg', { kg: 7 }, auth(u.token))).status, 400) // not an offered tier
  const ok = await req('POST', '/api/extra-kg', { kg: 5 }, auth(u.token))
  assert.equal(ok.status, 200)
  assert.equal(ok.data.loyalty.extraKg, 5)
})

// ---------- Referrals ----------
test('applying a referral rewards both parties and blocks re-use', async () => {
  const referrer = await req('POST', '/api/auth/signup', { name: 'Ref Errer', email: email(), password: 'secret1' })
  const code = referrer.data.user.referralCode
  const invitee = await newUser()
  const apply = await req('POST', '/api/referral/apply', { code }, auth(invitee.token))
  assert.equal(apply.status, 200)
  assert.equal(apply.data.loyalty.credit, 5) // invitee credit
  const refLoyalty = await req('GET', '/api/loyalty', undefined, auth(referrer.data.token))
  assert.equal(refLoyalty.data.loyalty.points, 520) // 320 + 200
  // cannot apply twice
  assert.equal((await req('POST', '/api/referral/apply', { code }, auth(invitee.token))).status, 409)
})

// ---------- Cards ----------
test('cards can be added and listed; first becomes default', async () => {
  const u = await newUser()
  const add = await req('POST', '/api/cards', { number: '4111 1111 1111 1111' }, auth(u.token))
  assert.equal(add.status, 201)
  assert.equal(add.data.card.brand, 'Visa')
  assert.equal(add.data.card.isDefault, true)
  const list = await req('GET', '/api/cards', undefined, auth(u.token))
  assert.equal(list.data.cards.length, 1)
  assert.equal(list.data.paymentMethod, `card:${add.data.card.id}`)
})

// ---------- Staff (key-guarded) ----------
test('staff endpoints require the staff key', async () => {
  assert.equal((await req('GET', '/api/staff/orders')).status, 403)
  assert.equal((await req('GET', '/api/staff/orders', undefined, { 'x-staff-key': 'wrong' })).status, 403)
  assert.equal((await req('GET', '/api/staff/orders', undefined, { 'x-staff-key': 'test-staff' })).status, 200)
})

test('staff can advance an order stage', async () => {
  const u = await newUser()
  await req('POST', '/api/subscription', { planId: 'basic' }, auth(u.token))
  const ord = await req('POST', '/api/orders', { pickup: 'a' }, auth(u.token))
  const id = ord.data.order.id
  const before = ord.data.order.stage
  const adv = await req('POST', `/api/staff/orders/${id}/advance`, {}, { 'x-staff-key': 'test-staff' })
  assert.equal(adv.status, 200)
  assert.equal(adv.data.order.stage, before + 1)
})

// ---------- Hardening: body size ----------
test('oversized request body is rejected with 413', async () => {
  const big = 'x'.repeat(5000) // > MAX_BODY_BYTES (4096)
  const res = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'a@b.co', password: big }),
  })
  assert.equal(res.status, 413)
})

test('non-object JSON body is rejected', async () => {
  const res = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '"just a string"',
  })
  assert.equal(res.status, 400)
})
