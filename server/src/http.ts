import type { IncomingMessage, ServerResponse } from 'node:http'
import { verifyToken } from './auth.ts'
import { config } from './config.ts'

export interface Ctx {
  req: IncomingMessage
  res: ServerResponse
  params: Record<string, string>
  query: URLSearchParams
  body: unknown
  /** authenticated user id, set by requireAuth */
  userId?: number
}

export type Handler = (ctx: Ctx) => void | Promise<void>

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function json(res: ServerResponse, status: number, data: unknown): void {
  const payload = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': config.corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-staff-key',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  })
  res.end(payload)
}

export async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += (chunk as Buffer).length
    if (size > config.maxBodyBytes) throw new HttpError(413, 'Request body too large')
    chunks.push(chunk as Buffer)
  }
  if (chunks.length === 0) return undefined
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object') throw new Error('not an object')
    return parsed
  } catch {
    throw new HttpError(400, 'Invalid JSON body')
  }
}

/** Client IP for logging / rate limiting (respects X-Forwarded-For when trusted). */
export function clientIp(req: IncomingMessage): string {
  if (config.trustProxy) {
    const fwd = req.headers['x-forwarded-for']
    if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0]!.trim()
  }
  return req.socket.remoteAddress ?? 'unknown'
}

// ---- Fixed-window in-memory rate limiter ----
const buckets = new Map<string, { count: number; reset: number }>()
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || b.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (b.count >= max) return false
  b.count++
  return true
}
// occasional cleanup so the map doesn't grow unbounded
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k)
}, 60_000).unref?.()

/** Throws 429 when the caller exceeds the limit for `bucket`. */
export function requireRate(ctx: Ctx, bucket: string, max: number, windowMs: number): void {
  if (!rateLimit(`${bucket}:${clientIp(ctx.req)}`, max, windowMs)) {
    throw new HttpError(429, 'Too many requests — please slow down')
  }
}

/** Pulls a bearer token from the Authorization header and returns the user id. */
export function requireAuth(ctx: Ctx): number {
  const header = ctx.req.headers['authorization'] ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const claims = token ? verifyToken(token) : null
  if (!claims) throw new HttpError(401, 'Unauthorized')
  ctx.userId = claims.sub
  return claims.sub
}

/** Guards staff/admin endpoints behind a shared key (`x-staff-key` header). */
export function requireStaff(ctx: Ctx): void {
  const key = ctx.req.headers['x-staff-key']
  if (typeof key !== 'string' || key !== config.staffKey) throw new HttpError(403, 'Staff access required')
}

interface Route {
  method: string
  segments: string[]
  handler: Handler
}

export class Router {
  private routes: Route[] = []

  add(method: string, path: string, handler: Handler): void {
    this.routes.push({ method, segments: path.split('/').filter(Boolean), handler })
  }
  get(path: string, handler: Handler) { this.add('GET', path, handler) }
  post(path: string, handler: Handler) { this.add('POST', path, handler) }
  patch(path: string, handler: Handler) { this.add('PATCH', path, handler) }
  delete(path: string, handler: Handler) { this.add('DELETE', path, handler) }

  match(method: string, pathname: string): { handler: Handler; params: Record<string, string> } | null {
    const parts = pathname.split('/').filter(Boolean)
    for (const route of this.routes) {
      if (route.method !== method) continue
      if (route.segments.length !== parts.length) continue
      const params: Record<string, string> = {}
      let ok = true
      for (let i = 0; i < route.segments.length; i++) {
        const seg = route.segments[i]!
        const val = parts[i]!
        if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(val)
        else if (seg !== val) { ok = false; break }
      }
      if (ok) return { handler: route.handler, params }
    }
    return null
  }
}

/** Minimal runtime validation helpers (no external deps). */
export function str(
  body: unknown,
  key: string,
  opts: { min?: number; max?: number; optional?: boolean } = {},
): string {
  const v = (body as Record<string, unknown> | undefined)?.[key]
  if (v === undefined || v === null || v === '') {
    if (opts.optional) return ''
    throw new HttpError(400, `Missing field: ${key}`)
  }
  if (typeof v !== 'string') throw new HttpError(400, `Field ${key} must be a string`)
  const max = opts.max ?? 500
  if (v.length > max) throw new HttpError(400, `Field ${key} is too long`)
  if (opts.min && v.trim().length < opts.min) throw new HttpError(400, `Field ${key} is too short`)
  return v
}

/** Validate and coerce a numeric field within an inclusive range. */
export function num(body: unknown, key: string, opts: { min?: number; max?: number } = {}): number {
  const v = (body as Record<string, unknown> | undefined)?.[key]
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN
  if (!Number.isFinite(n)) throw new HttpError(400, `Field ${key} must be a number`)
  if (opts.min !== undefined && n < opts.min) throw new HttpError(400, `Field ${key} is too small`)
  if (opts.max !== undefined && n > opts.max) throw new HttpError(400, `Field ${key} is too large`)
  return n
}
