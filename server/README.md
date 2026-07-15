# Pressd — Backend API

A small, dependency-free REST API for the Pressd laundry app. Built entirely on Node.js
built-ins — `node:http` for the server and `node:sqlite` for storage — so there is nothing to
`npm install`.

## Requirements
- Node.js **22.6+** (uses built-in `node:sqlite` and TypeScript type-stripping).

## Run
```bash
cd server
npm start          # http://localhost:4000
npm run dev        # same, with --watch reload
```

## Test
```bash
cd server
npm test          # node:test suite (in-memory DB, 24 cases)
```

## Config (env vars)
| Var | Default | Notes |
|-----|---------|-------|
| `PORT` | `4000` | |
| `JWT_SECRET` | dev value | **Required in production** (`NODE_ENV=production`) |
| `STAFF_KEY` | dev value | **Required in production**; sent as `x-staff-key` |
| `ACCESS_TTL` | `3600` (1h) | Access-token lifetime (seconds) |
| `REFRESH_TTL` | 60 days | Refresh-token lifetime (seconds) |
| `DB_PATH` | `data/pressd.db` | `:memory:` for tests |
| `CORS_ORIGIN` | `*` | Allowed origin |
| `MAX_BODY_BYTES` | `65536` | Bodies larger than this → `413` |
| `TRUST_PROXY` | `0` (on in prod) | Use `X-Forwarded-For` for client IP |
| `AUTH_RATE_MAX` / `AUTH_RATE_WINDOW_MS` | `15` / `60000` | Auth rate limit per IP |

## Auth (access + refresh tokens)
- `signup` / `login` return `{ token, refreshToken, ... }`. Send the **access token** as
  `Authorization: Bearer <token>` on protected routes.
- Access tokens are **short-lived HS256 JWTs**; when one expires, exchange the **refresh token** at
  `POST /api/auth/refresh` for a new pair. Refresh tokens are stored **hashed** and **rotated** on every
  use (the old one is revoked). `POST /api/auth/logout` revokes a refresh token.
- Passwords are hashed with scrypt.

## Hardening
- Per-IP **rate limiting** on auth endpoints (`429` when exceeded).
- Request **body-size cap** (`413`) and strict field validation (types, length, numeric ranges).
- **Graceful shutdown** (SIGINT/SIGTERM → drain connections, close DB) and a DB-checked `/health`.
- Production boot **refuses insecure defaults** for `JWT_SECRET` / `STAFF_KEY`.

## Endpoints
| Method | Path | Auth | Purpose |
|--------|------|:----:|---------|
| GET | `/health` | – | Liveness check |
| POST | `/api/auth/signup` | – | Create account → `{ token, user, loyalty, subscription }` |
| POST | `/api/auth/login` | – | Log in → `{ token, refreshToken, ... }` |
| POST | `/api/auth/refresh` | – | Exchange a refresh token for a new (rotated) session |
| POST | `/api/auth/logout` | – | Revoke a refresh token |
| GET | `/api/auth/me` | ✓ | Account snapshot |
| PATCH | `/api/auth/me` | ✓ | Update name / email / phone / address |
| GET | `/api/plans` | – | Plan catalog (monthly + annual pricing) |
| GET | `/api/subscription` | ✓ | Current subscription (or `null`) |
| POST | `/api/subscription` | ✓ | Subscribe / upgrade / switch billing `{ planId, billing }` |
| POST | `/api/subscription/cancel` | ✓ | Cancel membership |
| POST | `/api/subscription/freeze` | ✓ | Freeze / resume `{ frozen }` |
| GET | `/api/orders` | ✓ | Pickup history |
| POST | `/api/orders` | ✓ | Schedule a pickup (earns +50 pts) |
| GET | `/api/loyalty` | ✓ | Points, tier, progress, perks + reward catalog |
| POST | `/api/loyalty/redeem` | ✓ | Redeem a reward `{ rewardId }` (spends balance, keeps tier) |
| POST | `/api/extra-kg` | ✓ | Buy a one-time capacity top-up `{ kg }` |

## Domain notes
- Loyalty tracks a **spendable balance** and a **lifetime total**; tier/progress use the lifetime
  total, so redeeming never drops your tier. Tiers: Bronze 0 · Silver 1500 · Gold 5000 · Platinum 12000.
- New subscribe / upgrade / annual-switch starts a fresh billing period (`startedAt`); the response
  includes the computed `expiresAt`.

## Notes
This mirrors the frontend's in-memory store (`src/store.tsx`) so the React app can be pointed at a
real server. It is not deployed to GitHub Pages (static hosting) — run it locally or on any Node host.
