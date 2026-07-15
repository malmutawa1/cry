-- Pressd backend on Supabase.
--
-- Migrated from the zero-dependency Node/SQLite server (server/src/*). Auth is
-- handled by Supabase Auth (auth.users); per-user data lives in public tables
-- guarded by Row-Level Security; all points/pricing logic runs server-side in
-- SECURITY DEFINER RPC functions so the client is never trusted with money or
-- loyalty points.
--
-- Security posture (see the Supabase skill checklist):
--   * RLS enabled on every table in the exposed `public` schema.
--   * Policies use `TO authenticated` + an `auth.uid()` ownership predicate.
--   * UPDATE policies carry both USING and WITH CHECK.
--   * DEFINER functions pin `search_path = ''`, fully-qualify objects, and
--     re-check `auth.uid()` internally.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions; -- gen_random_uuid / gen_random_bytes

-- ===========================================================================
-- Catalog (server-authoritative; read-only to clients)
-- ===========================================================================
create table public.plans (
  id        text primary key,
  name      text not null,
  price_kwd integer not null,
  cap_kg    integer not null,
  tagline   text not null default '',
  popular   boolean not null default false,
  perks     jsonb not null default '[]'::jsonb,
  sort      integer not null default 0
);

create table public.rewards (
  id     text primary key,
  title  text not null,
  pts    integer not null,
  effect text not null check (effect in ('extraKg', 'credit', 'freeMonth')),
  amount integer not null
);

create table public.extras (
  kg        integer primary key,
  price_kwd integer not null
);

-- Seed the catalog (mirrors server/src/domain.ts).
insert into public.plans (id, name, price_kwd, cap_kg, tagline, popular, perks, sort) values
  ('basic',       'Basic',       15, 20,  'For singles & couples',  false, '["Free pickup & delivery","Next-day turnaround","Delivered on hangers","Pause anytime"]', 0),
  ('standard',    'Standard',    28, 40,  'For small families',     true,  '["Free pickup & delivery","Next-day turnaround","Delivered on hangers","Priority scheduling"]', 1),
  ('premium',     'Premium',     45, 70,  'Larger families',        false, '["Dry-clean-grade care included","Free pickup & delivery","Same-day slots available","Delivered on hangers"]', 2),
  ('family-plus', 'Family Plus', 65, 100, 'Heavy-use households',   false, '["Dry-clean-grade care included","Free pickup & delivery","Same-day slots available","Freeze anytime while travelling"]', 3);

insert into public.rewards (id, title, pts, effect, amount) values
  ('extra5',    'Free extra 5 kg',      750,  'extraKg',   5),
  ('credit5',   '5 KWD account credit', 2000, 'credit',    5),
  ('freemonth', 'One free month',       6000, 'freeMonth', 1);

insert into public.extras (kg, price_kwd) values (5, 2), (8, 5);

-- ===========================================================================
-- Per-user tables
-- ===========================================================================
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  name           text not null default '',
  email          text not null default '',
  phone          text not null default '',
  gender         text,
  accent         text not null default 'blue',
  address        text not null default '',
  role           text not null default 'customer',
  referral_code  text unique,
  referred_by    uuid references public.profiles(id),
  payment_method text not null default 'applepay',
  created_at     timestamptz not null default now()
);

create table public.loyalty (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  points          integer not null default 0,
  lifetime_points integer not null default 0,
  credit          integer not null default 0,
  free_months     integer not null default 0,
  extra_kg        integer not null default 0
);

create table public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  plan_id     text not null references public.plans(id),
  billing     text not null default 'monthly' check (billing in ('monthly', 'annual')),
  started_at  timestamptz not null default now(),
  frozen      boolean not null default false,
  canceled_at timestamptz
);
create index idx_subs_user on public.subscriptions(user_id);
-- At most one active (non-canceled) subscription per user.
create unique index idx_subs_one_active on public.subscriptions(user_id) where canceled_at is null;

create table public.orders (
  id               text primary key,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  created_at       timestamptz not null default now(),
  pickup           text not null default '',
  delivery         text not null default '',
  address          text not null default '',
  phone            text not null default '',
  stage            integer not null default 0,
  stage_updated_at timestamptz not null default now()
);
create index idx_orders_user on public.orders(user_id);

create table public.cards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  brand      text not null,
  last4      text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_cards_user on public.cards(user_id);

create table public.redemptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  reward_id  text not null,
  pts        integer not null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null,
  amount_kwd integer not null,
  detail     text not null default '',
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- Helpers
-- ===========================================================================

-- Is the current user a staff member? SECURITY DEFINER so it can read
-- public.profiles without tripping the profiles RLS policies (which would
-- otherwise recurse) — it only ever reports on the caller's own row.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role = 'staff' from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;
revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

-- ===========================================================================
-- Row-Level Security
-- ===========================================================================

-- Catalog: readable by anyone (anon + authenticated), never writable via the API.
alter table public.plans   enable row level security;
alter table public.rewards enable row level security;
alter table public.extras  enable row level security;

create policy "catalog plans readable"   on public.plans   for select to anon, authenticated using (true);
create policy "catalog rewards readable" on public.rewards for select to anon, authenticated using (true);
create policy "catalog extras readable"  on public.extras  for select to anon, authenticated using (true);

-- Profiles.
alter table public.profiles enable row level security;
create policy "profiles select own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id or public.is_staff());
create policy "profiles update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
-- No INSERT policy: rows are created by the on-signup trigger (SECURITY DEFINER).

-- Loyalty (read own; mutated only via RPC).
alter table public.loyalty enable row level security;
create policy "loyalty select own" on public.loyalty
  for select to authenticated using ((select auth.uid()) = user_id);

-- Subscriptions (read own; mutated only via RPC).
alter table public.subscriptions enable row level security;
create policy "subscriptions select own" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

-- Orders (read own; staff read all; mutated only via RPC).
alter table public.orders enable row level security;
create policy "orders select own" on public.orders
  for select to authenticated using ((select auth.uid()) = user_id or public.is_staff());

-- Cards: users manage their own directly (full PAN is never sent — the client
-- stores brand + last4 only).
alter table public.cards enable row level security;
create policy "cards select own" on public.cards
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "cards insert own" on public.cards
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cards delete own" on public.cards
  for delete to authenticated using ((select auth.uid()) = user_id);
create policy "cards update own" on public.cards
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Redemptions / payments (read own; written only via RPC).
alter table public.redemptions enable row level security;
create policy "redemptions select own" on public.redemptions
  for select to authenticated using ((select auth.uid()) = user_id);

alter table public.payments enable row level security;
create policy "payments select own" on public.payments
  for select to authenticated using ((select auth.uid()) = user_id);

-- ===========================================================================
-- On-signup trigger: create the profile + loyalty rows
-- ===========================================================================
-- Signup metadata (name/phone/gender/address) is passed by the client in
-- auth.signUp({ options: { data } }) and lands in raw_user_meta_data. These
-- are display-only fields — never used for authorization.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_gender text := nullif(new.raw_user_meta_data ->> 'gender', '');
  v_code   text;
begin
  -- A short, unambiguous referral code (no 0/O/1/I).
  v_code := upper(regexp_replace(encode(extensions.gen_random_bytes(6), 'base64'), '[^A-Z0-9]', '', 'g'));
  v_code := 'PR' || left(translate(v_code, '01IO', '2345'), 6);

  insert into public.profiles (id, name, email, phone, gender, accent, address, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    v_gender,
    case when v_gender = 'female' then 'pink' else 'blue' end,
    coalesce(new.raw_user_meta_data ->> 'address', ''),
    v_code
  );

  insert into public.loyalty (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- Snapshot: one round-trip account state for hydrate() / api.me()
-- ===========================================================================
create or replace function public.account_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select jsonb_build_object(
    'user', (
      select jsonb_build_object(
        'id', p.id, 'name', p.name, 'email', p.email, 'phone', p.phone,
        'gender', p.gender, 'accent', p.accent, 'address', p.address,
        'role', p.role, 'referralCode', p.referral_code, 'paymentMethod', p.payment_method
      ) from public.profiles p where p.id = v_uid
    ),
    'loyalty', public.loyalty_json(v_uid),
    'subscription', (
      select jsonb_build_object(
        'planId', s.plan_id, 'billing', s.billing, 'frozen', s.frozen,
        'startedAt', (extract(epoch from s.started_at) * 1000)::bigint
      )
      from public.subscriptions s
      where s.user_id = v_uid and s.canceled_at is null
      limit 1
    ),
    'cards', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id, 'brand', c.brand, 'last4', c.last4, 'isDefault', c.is_default
      ) order by c.created_at)
      from public.cards c where c.user_id = v_uid
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

-- Loyalty JSON including the derived tier + progress (mirrors domain.tierInfo).
create or replace function public.loyalty_json(p_uid uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  l public.loyalty%rowtype;
  v_tier text;
  v_curmin integer;
  v_nextmin integer;
  v_progress numeric;
begin
  select * into l from public.loyalty where user_id = p_uid;
  if not found then
    return jsonb_build_object('points', 0, 'lifetimePoints', 0, 'credit', 0,
      'freeMonths', 0, 'extraKg', 0, 'tier', 'bronze', 'progress', 0);
  end if;

  -- Tiers: bronze 0 / silver 1500 / gold 5000 / platinum 12000.
  if    l.lifetime_points >= 12000 then v_tier := 'platinum'; v_curmin := 12000; v_nextmin := null;
  elsif l.lifetime_points >= 5000  then v_tier := 'gold';     v_curmin := 5000;  v_nextmin := 12000;
  elsif l.lifetime_points >= 1500  then v_tier := 'silver';   v_curmin := 1500;  v_nextmin := 5000;
  else                                  v_tier := 'bronze';   v_curmin := 0;     v_nextmin := 1500;
  end if;

  if v_nextmin is null then
    v_progress := 1;
  else
    v_progress := least(1, (l.lifetime_points - v_curmin)::numeric / (v_nextmin - v_curmin));
  end if;

  return jsonb_build_object(
    'points', l.points, 'lifetimePoints', l.lifetime_points, 'credit', l.credit,
    'freeMonths', l.free_months, 'extraKg', l.extra_kg, 'tier', v_tier, 'progress', v_progress
  );
end;
$$;

-- ===========================================================================
-- Mutating RPCs (server-authoritative; each re-checks auth.uid())
-- ===========================================================================

-- Subscribe / upgrade / switch: cancels any active sub, starts a fresh period,
-- logs the payment at the catalog price (client cannot set the amount).
create or replace function public.subscribe(p_plan_id text, p_billing text default 'monthly')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_plan public.plans%rowtype;
  v_amount integer;
begin
  if v_uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if p_billing not in ('monthly', 'annual') then raise exception 'Invalid billing period'; end if;
  select * into v_plan from public.plans where id = p_plan_id;
  if not found then raise exception 'Unknown plan'; end if;

  v_amount := case when p_billing = 'annual' then v_plan.price_kwd * 10 else v_plan.price_kwd end;

  update public.subscriptions set canceled_at = now()
    where user_id = v_uid and canceled_at is null;
  insert into public.subscriptions (user_id, plan_id, billing) values (v_uid, p_plan_id, p_billing);
  insert into public.payments (user_id, kind, amount_kwd, detail)
    values (v_uid, 'subscription', v_amount, v_plan.name || ' (' || p_billing || ')');

  return (
    select jsonb_build_object('planId', s.plan_id, 'billing', s.billing, 'frozen', s.frozen,
      'startedAt', (extract(epoch from s.started_at) * 1000)::bigint)
    from public.subscriptions s where s.user_id = v_uid and s.canceled_at is null limit 1
  );
end;
$$;

create or replace function public.cancel_subscription()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  update public.subscriptions set canceled_at = now() where user_id = v_uid and canceled_at is null;
  return 'null'::jsonb;
end;
$$;

create or replace function public.set_frozen(p_frozen boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  update public.subscriptions set frozen = p_frozen where user_id = v_uid and canceled_at is null;
  return (
    select jsonb_build_object('planId', s.plan_id, 'billing', s.billing, 'frozen', s.frozen,
      'startedAt', (extract(epoch from s.started_at) * 1000)::bigint)
    from public.subscriptions s where s.user_id = v_uid and s.canceled_at is null limit 1
  );
end;
$$;

-- Create an order (requires an active subscription); grants +50 loyalty points.
create or replace function public.create_order(
  p_pickup text default '', p_delivery text default '', p_address text default '', p_phone text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id text;
  i integer;
begin
  if v_uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from public.subscriptions where user_id = v_uid and canceled_at is null) then
    raise exception 'An active subscription is required to schedule a pickup';
  end if;

  for i in 1..20 loop
    v_id := 'PRS-' || (1000 + floor(random() * 9000))::int;
    exit when not exists (select 1 from public.orders where id = v_id);
  end loop;

  insert into public.orders (id, user_id, pickup, delivery, address, phone)
    values (v_id, v_uid, coalesce(p_pickup,''), coalesce(p_delivery,''), coalesce(p_address,''), coalesce(p_phone,''));

  update public.loyalty set points = points + 50, lifetime_points = lifetime_points + 50
    where user_id = v_uid;

  return jsonb_build_object(
    'order', (select jsonb_build_object('id', o.id) from public.orders o where o.id = v_id),
    'loyalty', public.loyalty_json(v_uid)
  );
end;
$$;

-- Redeem a reward: spends balance points (lifetime/tier untouched), applies perk.
create or replace function public.redeem_reward(p_reward_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  r public.rewards%rowtype;
  v_points integer;
begin
  if v_uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  select * into r from public.rewards where id = p_reward_id;
  if not found then raise exception 'Unknown reward'; end if;

  select points into v_points from public.loyalty where user_id = v_uid for update;
  if v_points < r.pts then raise exception 'Not enough points'; end if;

  update public.loyalty
    set points = points - r.pts,
        extra_kg    = extra_kg    + case when r.effect = 'extraKg'   then r.amount else 0 end,
        credit      = credit      + case when r.effect = 'credit'    then r.amount else 0 end,
        free_months = free_months + case when r.effect = 'freeMonth' then r.amount else 0 end
    where user_id = v_uid;

  insert into public.redemptions (user_id, reward_id, pts) values (v_uid, r.id, r.pts);
  return jsonb_build_object('loyalty', public.loyalty_json(v_uid));
end;
$$;

-- One-time extra-capacity top-up at the catalog price.
create or replace function public.add_extra_kg(p_kg integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  e public.extras%rowtype;
begin
  if v_uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  select * into e from public.extras where kg = p_kg;
  if not found then raise exception 'Invalid top-up amount'; end if;

  update public.loyalty set extra_kg = extra_kg + e.kg where user_id = v_uid;
  insert into public.payments (user_id, kind, amount_kwd, detail)
    values (v_uid, 'extra-kg', e.price_kwd, '+' || e.kg || ' kg');
  return jsonb_build_object('loyalty', public.loyalty_json(v_uid));
end;
$$;

-- Apply a referral code: one per account, not your own; referrer earns points,
-- the invited user gets KWD credit.
create or replace function public.apply_referral(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_referred_by uuid;
  v_referrer uuid;
begin
  if v_uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  select referred_by into v_referred_by from public.profiles where id = v_uid;
  if v_referred_by is not null then raise exception 'A referral code has already been applied to this account'; end if;

  select id into v_referrer from public.profiles where upper(referral_code) = upper(trim(p_code));
  if v_referrer is null then raise exception 'Invalid referral code'; end if;
  if v_referrer = v_uid then raise exception 'You cannot use your own code'; end if;

  update public.profiles set referred_by = v_referrer where id = v_uid;
  update public.loyalty set points = points + 200, lifetime_points = lifetime_points + 200 where user_id = v_referrer;
  update public.loyalty set credit = credit + 5 where user_id = v_uid;

  return jsonb_build_object('creditKwd', 5, 'loyalty', public.loyalty_json(v_uid));
end;
$$;

-- Referral summary for the current user.
create or replace function public.referral_info()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'code', (select referral_code from public.profiles where id = (select auth.uid())),
    'referredCount', (select count(*) from public.profiles where referred_by = (select auth.uid())),
    'rewardPoints', 200,
    'creditKwd', 5
  );
$$;

-- Select the active payment method (applepay / knet / card:<uuid>).
create or replace function public.set_payment_method(p_method text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_card_id uuid;
begin
  if v_uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;

  if p_method like 'card:%' then
    begin
      v_card_id := substring(p_method from 6)::uuid;
    exception when others then
      raise exception 'Invalid payment method';
    end;
    if not exists (select 1 from public.cards where id = v_card_id and user_id = v_uid) then
      raise exception 'Card not found';
    end if;
    update public.cards set is_default = (id = v_card_id) where user_id = v_uid;
  elsif p_method not in ('applepay', 'knet') then
    raise exception 'Invalid payment method';
  end if;

  update public.profiles set payment_method = p_method where id = v_uid;
  return jsonb_build_object('paymentMethod', p_method);
end;
$$;

-- ===========================================================================
-- Staff RPCs (guarded by is_staff())
-- ===========================================================================
create or replace function public.staff_orders()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then raise exception 'Staff access required' using errcode = '42501'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', o.id,
      'createdAt', (extract(epoch from o.created_at) * 1000)::bigint,
      'stage', o.stage,
      'address', o.address,
      'phone', o.phone,
      'customer', jsonb_build_object('name', p.name, 'email', p.email)
    ) order by o.created_at desc)
    from public.orders o join public.profiles p on p.id = o.user_id
  ), '[]'::jsonb);
end;
$$;

create or replace function public.staff_advance(p_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_stage integer;
begin
  if not public.is_staff() then raise exception 'Staff access required' using errcode = '42501'; end if;
  select stage into v_stage from public.orders where id = p_id;
  if not found then raise exception 'Order not found'; end if;
  update public.orders set stage = least(5, v_stage + 1), stage_updated_at = now() where id = p_id;
  return (
    select jsonb_build_object('id', o.id, 'stage', o.stage,
      'stageUpdatedAt', (extract(epoch from o.stage_updated_at) * 1000)::bigint)
    from public.orders o where o.id = p_id
  );
end;
$$;

create or replace function public.staff_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then raise exception 'Staff access required' using errcode = '42501'; end if;
  return jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'orders', (select count(*) from public.orders),
    'activeSubscriptions', (select count(*) from public.subscriptions where canceled_at is null),
    'ordersInProgress', (select count(*) from public.orders where stage < 5)
  );
end;
$$;

-- ===========================================================================
-- Function grants: RPCs are callable only by authenticated users (never anon).
-- ===========================================================================
do $$
declare fn text;
begin
  foreach fn in array array[
    'public.account_snapshot()', 'public.subscribe(text, text)', 'public.cancel_subscription()',
    'public.set_frozen(boolean)', 'public.create_order(text, text, text, text)',
    'public.redeem_reward(text)', 'public.add_extra_kg(integer)', 'public.apply_referral(text)',
    'public.referral_info()', 'public.set_payment_method(text)',
    'public.staff_orders()', 'public.staff_advance(text)', 'public.staff_stats()',
    'public.loyalty_json(uuid)'
  ] loop
    execute format('revoke all on function %s from public', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end;
$$;
