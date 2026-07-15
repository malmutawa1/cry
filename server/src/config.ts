import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const isProd = process.env.NODE_ENV === 'production'

function required(name: string, fallback: string): string {
  const v = process.env[name]
  if (v) return v
  if (isProd) {
    // Refuse to boot in production with insecure defaults.
    throw new Error(`Missing required env var ${name} in production`)
  }
  return fallback
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  /** Signing secret for access tokens. Must be set in production. */
  jwtSecret: required('JWT_SECRET', 'pressd-dev-secret-change-me'),
  /** Access-token lifetime in seconds (short-lived; clients refresh). */
  accessTtl: Number(process.env.ACCESS_TTL ?? 60 * 60), // 1 hour
  /** Refresh-token lifetime in seconds (long-lived, rotated on use). */
  refreshTtl: Number(process.env.REFRESH_TTL ?? 60 * 60 * 24 * 60), // 60 days
  /** SQLite database file (set DB_PATH=":memory:" for an ephemeral DB in tests). */
  dbPath: process.env.DB_PATH ?? join(__dirname, '..', 'data', 'pressd.db'),
  /** Allowed CORS origins ("*" allows any). */
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  /** Shared key for staff/admin endpoints (sent as `x-staff-key`). Must be set in production. */
  staffKey: required('STAFF_KEY', 'pressd-staff-dev'),
  /** Max request body size in bytes (larger bodies are rejected with 413). */
  maxBodyBytes: Number(process.env.MAX_BODY_BYTES ?? 64 * 1024),
  /** Trust X-Forwarded-For for client IP (enable behind a proxy/load balancer). */
  trustProxy: process.env.TRUST_PROXY === '1' || isProd,
  /** Auth rate limit: max attempts per window per IP. */
  authRateMax: Number(process.env.AUTH_RATE_MAX ?? 15),
  authRateWindowMs: Number(process.env.AUTH_RATE_WINDOW_MS ?? 60_000),
} as const
