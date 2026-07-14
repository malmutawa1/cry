import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { config } from './config.ts'

if (config.dbPath !== ':memory:') {
  mkdirSync(dirname(config.dbPath), { recursive: true })
}

export const db = new DatabaseSync(config.dbPath)

db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA foreign_keys = ON;')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    phone         TEXT NOT NULL DEFAULT '',
    gender        TEXT,
    accent        TEXT NOT NULL DEFAULT 'blue',
    address       TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS loyalty (
    user_id         INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    points          INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    credit          INTEGER NOT NULL DEFAULT 0,
    free_months     INTEGER NOT NULL DEFAULT 0,
    extra_kg        INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id     TEXT NOT NULL,
    billing     TEXT NOT NULL DEFAULT 'monthly',
    started_at  INTEGER NOT NULL,
    frozen      INTEGER NOT NULL DEFAULT 0,
    canceled_at INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);

  CREATE TABLE IF NOT EXISTS orders (
    id               TEXT PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at       INTEGER NOT NULL,
    pickup           TEXT NOT NULL DEFAULT '',
    delivery         TEXT NOT NULL DEFAULT '',
    address          TEXT NOT NULL DEFAULT '',
    phone            TEXT NOT NULL DEFAULT '',
    status           TEXT NOT NULL DEFAULT 'scheduled',
    stage            INTEGER NOT NULL DEFAULT 0,
    stage_updated_at INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

  CREATE TABLE IF NOT EXISTS cards (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand      TEXT NOT NULL,
    last4      TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);

  CREATE TABLE IF NOT EXISTS redemptions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id  TEXT NOT NULL,
    pts        INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL,
    amount_kwd INTEGER NOT NULL,
    detail     TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );
`)

// ---- Idempotent migrations for DBs created by an earlier version ----
function ensureColumn(table: string, column: string, decl: string): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`)
  }
}
ensureColumn('users', 'role', "TEXT NOT NULL DEFAULT 'customer'")
ensureColumn('users', 'referral_code', 'TEXT')
ensureColumn('users', 'referred_by', 'INTEGER')
ensureColumn('users', 'payment_method', "TEXT NOT NULL DEFAULT 'applepay'")
ensureColumn('orders', 'stage', 'INTEGER NOT NULL DEFAULT 0')
ensureColumn('orders', 'stage_updated_at', 'INTEGER NOT NULL DEFAULT 0')
