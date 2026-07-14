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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  })
  res.end(payload)
}

export async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  if (chunks.length === 0) return undefined
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    throw new HttpError(400, 'Invalid JSON body')
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
export function str(body: unknown, key: string, opts: { min?: number; optional?: boolean } = {}): string {
  const v = (body as Record<string, unknown> | undefined)?.[key]
  if (v === undefined || v === null || v === '') {
    if (opts.optional) return ''
    throw new HttpError(400, `Missing field: ${key}`)
  }
  if (typeof v !== 'string') throw new HttpError(400, `Field ${key} must be a string`)
  if (opts.min && v.trim().length < opts.min) throw new HttpError(400, `Field ${key} is too short`)
  return v
}
