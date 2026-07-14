import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const config = {
  port: Number(process.env.PORT ?? 4000),
  /** Signing secret for auth tokens. Override in production via env. */
  jwtSecret: process.env.JWT_SECRET ?? 'pressd-dev-secret-change-me',
  /** Token lifetime in seconds (30 days). */
  tokenTtl: 60 * 60 * 24 * 30,
  /** SQLite database file (set DB_PATH=":memory:" for an ephemeral DB in tests). */
  dbPath: process.env.DB_PATH ?? join(__dirname, '..', 'data', 'pressd.db'),
  /** Allowed CORS origins ("*" allows any). */
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  /** Shared key for staff/admin endpoints (sent as `x-staff-key`). */
  staffKey: process.env.STAFF_KEY ?? 'pressd-staff-dev',
} as const
