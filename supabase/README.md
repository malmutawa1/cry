# Pressd on Supabase

The Pressd backend runs entirely on Supabase — no server to host:

- **Auth** — Supabase Auth (email + password). Signup metadata (name, phone,
  gender, address) is captured in `auth.signUp({ options: { data } })` and a
  trigger provisions the `profiles` + `loyalty` rows.
- **Data** — per-user tables in the `public` schema, isolated by Row-Level
  Security (`auth.uid()` ownership predicates).
- **Logic** — points, pricing, referrals, redemptions, subscription changes and
  staff actions run in `SECURITY DEFINER` Postgres RPC functions, so the client
  is never trusted with money or loyalty points.

The frontend talks to all of this through `src/api.ts` (backed by
`@supabase/supabase-js`). It activates only when `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` are set; unset, the app runs fully local (the GitHub
Pages demo).

## One-time setup

1. **Authenticate the CLI / MCP** (interactive — not possible from a Claude web
   session):

   ```bash
   claude /mcp          # select "supabase" -> Authenticate
   # or, using the CLI:
   supabase login
   ```

2. **Link the project** (ref is already in `config.toml`):

   ```bash
   supabase link --project-ref pdebesxkkqzbcrkporcs
   ```

3. **Apply the migration** to the hosted database:

   ```bash
   supabase db push
   ```

   (Or paste `migrations/20260715120000_init.sql` into the SQL Editor.)

4. **Check the security advisors** and resolve anything flagged:

   ```bash
   supabase db advisors           # CLI v2.81.3+
   # or the MCP get_advisors tool
   ```

5. **Wire the frontend env** (see `.env.example`): set `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`, then `npm run build`.

## Making a staff user

Staff endpoints (`staff_orders`, `staff_advance`, `staff_stats`) authorize on
the caller's session via `is_staff()`, which checks `profiles.role = 'staff'`.
Promote a signed-up user once:

```sql
update public.profiles set role = 'staff' where email = 'ops@pressd.example';
```

## Schema summary

| Table            | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| `profiles`       | user profile, accent, referral code, payment method |
| `loyalty`        | points, lifetime points, credit, free months, kg    |
| `subscriptions`  | active + historical plans (one active per user)      |
| `orders`         | pickups with a 0–5 stage pipeline                   |
| `cards`          | saved payment cards (brand + last4 only, never PAN) |
| `redemptions`    | reward redemption log                               |
| `payments`       | subscription / extra-kg payment log                 |
| `plans` / `rewards` / `extras` | server-authoritative catalog (read-only)  |

## RPC functions (all `to authenticated`)

`account_snapshot`, `subscribe`, `cancel_subscription`, `set_frozen`,
`create_order`, `redeem_reward`, `add_extra_kg`, `apply_referral`,
`referral_info`, `set_payment_method`, and the staff-guarded `staff_orders`,
`staff_advance`, `staff_stats`.

## Verifying after deploy

```sql
-- catalog seeded?
select count(*) from public.plans;   -- 4
-- RLS on everywhere?
select tablename from pg_tables where schemaname = 'public'
  and rowsecurity = false;           -- (no rows)
```
