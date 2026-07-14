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

Config via env vars (all optional): `PORT`, `JWT_SECRET`, `DB_PATH` (`:memory:` for tests),
`CORS_ORIGIN`.

## Auth
Send the token from signup/login as `Authorization: Bearer <token>` on protected routes.
Passwords are hashed with scrypt; tokens are HS256 JWTs signed with `JWT_SECRET`.

## Endpoints
| Method | Path | Auth | Purpose |
|--------|------|:----:|---------|
| GET | `/health` | – | Liveness check |
| POST | `/api/auth/signup` | – | Create account → `{ token, user, loyalty, subscription }` |
| POST | `/api/auth/login` | – | Log in → `{ token, ... }` |
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
