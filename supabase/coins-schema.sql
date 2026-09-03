-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-schema.sql
-- EXPECTED PROJECT PATH: /supabase/coins-schema.sql
-- ROLE: Paragon Coins backend (P-100) — ledger, purchase requests, withdrawals, team credits.
--       Front-end already works device-local (paragonTeamCoinRequests.v1 + coinCredits.v1).
--       Running this SQL makes the same flows multi-device via Supabase.
-- RESTORE-LOAD NOTE: Run ONCE in Supabase SQL Editor after schema.sql (already live) and
--       preferably after announcements-schema.sql. Idempotent (IF NOT EXISTS / ON CONFLICT).
-- OWNER ACTION: Dashboard → SQL → New query → paste this whole file → Run.
--               Then add your founder email to paragon_team_members if not already there.

-- 0. Ensure team membership table exists (also created by announcements-schema.sql)
create table if not exists public.paragon_team_members (
  email text primary key,
  role text not null default 'founder',
  added_at timestamptz not null default now()
);

insert into public.paragon_team_members (email, role)
values ('paragon.archive.2026@gmail.com', 'founder')
on conflict (email) do nothing;

-- Helper: is the current JWT email a team member?
create or replace function public.paragon_is_team_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.paragon_team_members m
    where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.paragon_is_team_member() from public;
grant execute on function public.paragon_is_team_member() to authenticated, anon;

-- 1. Per-user coin wallet (source of truth once backend is live)
create table if not exists public.paragon_coin_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_bought integer not null default 0 check (lifetime_bought >= 0),
  lifetime_spent integer not null default 0 check (lifetime_spent >= 0),
  lifetime_withdrawn integer not null default 0 check (lifetime_withdrawn >= 0),
  updated_at timestamptz not null default now()
);

alter table public.paragon_coin_wallets enable row level security;

drop policy if exists "users read own wallet" on public.paragon_coin_wallets;
create policy "users read own wallet" on public.paragon_coin_wallets
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users insert own wallet" on public.paragon_coin_wallets;
create policy "users insert own wallet" on public.paragon_coin_wallets
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Users must NOT update balance directly — only via RPCs / team paths.
drop policy if exists "team read all wallets" on public.paragon_coin_wallets;
create policy "team read all wallets" on public.paragon_coin_wallets
  for select to authenticated
  using (public.paragon_is_team_member());

-- 2. Immutable ledger (every credit/debit)
create table if not exists public.paragon_coin_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null check (delta <> 0),
  balance_after integer not null check (balance_after >= 0),
  reason text not null,
  kind text not null check (kind in (
    'purchase_credit', 'spend', 'bet_stake', 'bet_win', 'entry_fee',
    'creator_prize', 'reward', 'withdrawal', 'adjustment', 'refund'
  )),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists paragon_coin_ledger_user_idx
  on public.paragon_coin_ledger (user_id, created_at desc);

alter table public.paragon_coin_ledger enable row level security;

drop policy if exists "users read own ledger" on public.paragon_coin_ledger;
create policy "users read own ledger" on public.paragon_coin_ledger
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "team read all ledger" on public.paragon_coin_ledger;
create policy "team read all ledger" on public.paragon_coin_ledger
  for select to authenticated
  using (public.paragon_is_team_member());

-- No direct client inserts into ledger — RPCs only.
revoke insert, update, delete on public.paragon_coin_ledger from authenticated, anon;

-- 3. Purchase requests (user asks to buy; super-admin confirms naira received)
create table if not exists public.paragon_coin_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  display_name text,
  naira integer not null check (naira >= 500),
  coins integer not null check (coins > 0),
  rate_note text not null default 'placeholder ₦1 = 2 coins — owner sets real rate',
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  payment_ref text,
  team_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id)
);

create index if not exists paragon_coin_purchases_status_idx
  on public.paragon_coin_purchase_requests (status, created_at desc);

alter table public.paragon_coin_purchase_requests enable row level security;

drop policy if exists "users read own purchases" on public.paragon_coin_purchase_requests;
create policy "users read own purchases" on public.paragon_coin_purchase_requests
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users create own purchases" on public.paragon_coin_purchase_requests;
create policy "users create own purchases" on public.paragon_coin_purchase_requests
  for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists "users cancel own pending purchases" on public.paragon_coin_purchase_requests;
create policy "users cancel own pending purchases" on public.paragon_coin_purchase_requests
  for update to authenticated
  using ((select auth.uid()) = user_id and status = 'pending')
  with check ((select auth.uid()) = user_id and status in ('pending','cancelled'));

drop policy if exists "team manage purchases" on public.paragon_coin_purchase_requests;
create policy "team manage purchases" on public.paragon_coin_purchase_requests
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- 4. Withdrawal requests (sell coins back for naira — manual team payout)
create table if not exists public.paragon_coin_withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  display_name text,
  coins integer not null check (coins > 0),
  naira_requested integer not null check (naira_requested >= 0),
  fee_naira integer not null default 0 check (fee_naira >= 0),
  naira_payout integer not null check (naira_payout >= 0),
  bank_details text not null, -- user-provided; team sees only when processing
  status text not null default 'pending' check (status in ('pending','paid','rejected','cancelled')),
  team_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id)
);

create index if not exists paragon_coin_withdrawals_status_idx
  on public.paragon_coin_withdrawals (status, created_at desc);

alter table public.paragon_coin_withdrawals enable row level security;

drop policy if exists "users read own withdrawals" on public.paragon_coin_withdrawals;
create policy "users read own withdrawals" on public.paragon_coin_withdrawals
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users create own withdrawals" on public.paragon_coin_withdrawals;
create policy "users create own withdrawals" on public.paragon_coin_withdrawals
  for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists "team manage withdrawals" on public.paragon_coin_withdrawals;
create policy "team manage withdrawals" on public.paragon_coin_withdrawals
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- 5. Platform rate config (single row; team editable)
create table if not exists public.paragon_coin_config (
  id int primary key default 1 check (id = 1),
  naira_per_coin_buy numeric(12,4) not null default 0.5,  -- ₦0.50 per coin => ₦1 = 2 coins
  naira_per_coin_sell numeric(12,4) not null default 0.4, -- sell-back lower (spread)
  min_purchase_naira integer not null default 500,
  min_withdraw_coins integer not null default 1000,
  withdraw_fee_naira integer not null default 0,
  packs jsonb not null default '[
    {"naira":500,"label":"Starter"},
    {"naira":1000,"label":"Standard"},
    {"naira":5000,"label":"Pro"}
  ]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.paragon_coin_config (id) values (1)
on conflict (id) do nothing;

alter table public.paragon_coin_config enable row level security;

drop policy if exists "anyone read coin config" on public.paragon_coin_config;
create policy "anyone read coin config" on public.paragon_coin_config
  for select to anon, authenticated
  using (true);

drop policy if exists "team update coin config" on public.paragon_coin_config;
create policy "team update coin config" on public.paragon_coin_config
  for update to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- 6. RPC: ensure wallet row
create or replace function public.paragon_ensure_coin_wallet(p_user uuid default auth.uid())
returns public.paragon_coin_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.paragon_coin_wallets;
begin
  if p_user is null then
    raise exception 'Not authenticated';
  end if;
  insert into public.paragon_coin_wallets (user_id)
  values (p_user)
  on conflict (user_id) do nothing;
  select * into w from public.paragon_coin_wallets where user_id = p_user;
  return w;
end;
$$;

revoke all on function public.paragon_ensure_coin_wallet(uuid) from public;
grant execute on function public.paragon_ensure_coin_wallet(uuid) to authenticated;

-- 7. RPC: apply ledger delta (internal / team)
create or replace function public.paragon_coin_apply(
  p_user uuid,
  p_delta integer,
  p_reason text,
  p_kind text,
  p_meta jsonb default '{}'::jsonb
)
returns public.paragon_coin_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.paragon_coin_wallets;
  new_bal integer;
begin
  if p_user is null or p_delta = 0 then
    raise exception 'Invalid apply';
  end if;
  -- Only the user themself for spend kinds, or team for credits/adjustments
  if auth.uid() is distinct from p_user and not public.paragon_is_team_member() then
    raise exception 'Not allowed';
  end if;

  w := public.paragon_ensure_coin_wallet(p_user);
  new_bal := w.balance + p_delta;
  if new_bal < 0 then
    raise exception 'Insufficient coins';
  end if;

  update public.paragon_coin_wallets set
    balance = new_bal,
    lifetime_bought = lifetime_bought + case when p_kind = 'purchase_credit' then greatest(p_delta,0) else 0 end,
    lifetime_spent = lifetime_spent + case when p_delta < 0 and p_kind in ('spend','bet_stake','entry_fee','creator_prize') then abs(p_delta) else 0 end,
    lifetime_withdrawn = lifetime_withdrawn + case when p_kind = 'withdrawal' then abs(p_delta) else 0 end,
    updated_at = now()
  where user_id = p_user
  returning * into w;

  insert into public.paragon_coin_ledger (user_id, delta, balance_after, reason, kind, meta, created_by)
  values (p_user, p_delta, new_bal, coalesce(p_reason,'adjustment'), p_kind, coalesce(p_meta,'{}'::jsonb), auth.uid());

  return w;
end;
$$;

revoke all on function public.paragon_coin_apply(uuid, integer, text, text, jsonb) from public;
grant execute on function public.paragon_coin_apply(uuid, integer, text, text, jsonb) to authenticated;

-- 8. RPC: user spends coins (games/quiz)
create or replace function public.paragon_coin_spend(p_amount integer, p_reason text, p_kind text default 'spend', p_meta jsonb default '{}'::jsonb)
returns public.paragon_coin_wallets
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;
  if p_kind not in ('spend','bet_stake','entry_fee','creator_prize') then
    raise exception 'Invalid spend kind';
  end if;
  return public.paragon_coin_apply(auth.uid(), -p_amount, p_reason, p_kind, p_meta);
end;
$$;

revoke all on function public.paragon_coin_spend(integer, text, text, jsonb) from public;
grant execute on function public.paragon_coin_spend(integer, text, text, jsonb) to authenticated;

-- 9. RPC: team approves a purchase request → credits wallet
create or replace function public.paragon_coin_approve_purchase(p_request_id uuid, p_payment_ref text default null, p_team_note text default null)
returns public.paragon_coin_purchase_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.paragon_coin_purchase_requests;
begin
  if not public.paragon_is_team_member() then
    raise exception 'Team only';
  end if;
  select * into r from public.paragon_coin_purchase_requests where id = p_request_id for update;
  if r.id is null then raise exception 'Request not found'; end if;
  if r.status <> 'pending' then raise exception 'Request is not pending'; end if;

  perform public.paragon_coin_apply(
    r.user_id,
    r.coins,
    'Purchase approved ₦' || r.naira::text,
    'purchase_credit',
    jsonb_build_object('request_id', r.id, 'naira', r.naira, 'payment_ref', p_payment_ref)
  );

  update public.paragon_coin_purchase_requests set
    status = 'approved',
    payment_ref = coalesce(p_payment_ref, payment_ref),
    team_note = coalesce(p_team_note, team_note),
    resolved_at = now(),
    resolved_by = auth.uid()
  where id = p_request_id
  returning * into r;

  return r;
end;
$$;

revoke all on function public.paragon_coin_approve_purchase(uuid, text, text) from public;
grant execute on function public.paragon_coin_approve_purchase(uuid, text, text) to authenticated;

-- 10. RPC: team rejects purchase
create or replace function public.paragon_coin_reject_purchase(p_request_id uuid, p_team_note text default null)
returns public.paragon_coin_purchase_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.paragon_coin_purchase_requests;
begin
  if not public.paragon_is_team_member() then
    raise exception 'Team only';
  end if;
  update public.paragon_coin_purchase_requests set
    status = 'rejected',
    team_note = coalesce(p_team_note, team_note),
    resolved_at = now(),
    resolved_by = auth.uid()
  where id = p_request_id and status = 'pending'
  returning * into r;
  if r.id is null then raise exception 'Pending request not found'; end if;
  return r;
end;
$$;

revoke all on function public.paragon_coin_reject_purchase(uuid, text) from public;
grant execute on function public.paragon_coin_reject_purchase(uuid, text) to authenticated;

-- 11. RPC: team marks withdrawal paid (deducts coins if not already held)
create or replace function public.paragon_coin_complete_withdrawal(p_id uuid, p_team_note text default null)
returns public.paragon_coin_withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.paragon_coin_withdrawals;
begin
  if not public.paragon_is_team_member() then
    raise exception 'Team only';
  end if;
  select * into w from public.paragon_coin_withdrawals where id = p_id for update;
  if w.id is null then raise exception 'Not found'; end if;
  if w.status <> 'pending' then raise exception 'Not pending'; end if;

  perform public.paragon_coin_apply(
    w.user_id,
    -w.coins,
    'Withdrawal payout',
    'withdrawal',
    jsonb_build_object('withdrawal_id', w.id, 'naira_payout', w.naira_payout)
  );

  update public.paragon_coin_withdrawals set
    status = 'paid',
    team_note = coalesce(p_team_note, team_note),
    resolved_at = now(),
    resolved_by = auth.uid()
  where id = p_id
  returning * into w;

  return w;
end;
$$;

revoke all on function public.paragon_coin_complete_withdrawal(uuid, text) from public;
grant execute on function public.paragon_coin_complete_withdrawal(uuid, text) to authenticated;

-- 12. Public read of own balance helper
create or replace function public.paragon_coin_my_balance()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.paragon_coin_wallets;
begin
  w := public.paragon_ensure_coin_wallet(auth.uid());
  return w.balance;
end;
$$;

revoke all on function public.paragon_coin_my_balance() from public;
grant execute on function public.paragon_coin_my_balance() to authenticated;

-- DONE. Front-end remains fully usable offline via localStorage until you wire
-- auth client calls to these RPCs (optional next step after this SQL is green).
