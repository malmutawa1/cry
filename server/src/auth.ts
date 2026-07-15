import { scryptSync, randomBytes, timingSafeEqual, createHmac, createHash } from 'node:crypto'
import { config } from './config.ts'

// ---------- Password hashing (scrypt) ----------
export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const hash = scryptSync(password, Buffer.from(saltHex, 'hex'), 64)
  const expected = Buffer.from(hashHex, 'hex')
  return hash.length === expected.length && timingSafeEqual(hash, expected)
}

// ---------- JWT (HS256, hand-rolled with node:crypto) ----------
function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function sign(data: string): string {
  return createHmac('sha256', config.jwtSecret).update(data).digest('base64url')
}

export function signToken(payload: Record<string, unknown>): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + config.accessTtl }))
  const sig = sign(`${header}.${body}`)
  return `${header}.${body}.${sig}`
}

// ---------- Refresh tokens (opaque, stored hashed, rotated on use) ----------
/** A fresh opaque refresh token plus the SHA-256 hash to persist. */
export function newRefreshToken(): { token: string; hash: string; expiresAt: number } {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashToken(token), expiresAt: Date.now() + config.refreshTtl * 1000 }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export interface TokenClaims {
  sub: number
  iat: number
  exp: number
}

export function verifyToken(token: string): TokenClaims | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts as [string, string, string]
  const expected = sign(`${header}.${body}`)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenClaims
    if (typeof claims.exp !== 'number' || claims.exp < Math.floor(Date.now() / 1000)) return null
    return claims
  } catch {
    return null
  }
}
