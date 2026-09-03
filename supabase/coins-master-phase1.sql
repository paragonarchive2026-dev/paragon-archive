-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-master-phase1.sql
-- EXPECTED PROJECT PATH: /supabase/coins-master-phase1.sql
-- ROLE: Phase-1 financial foundation from PARAGON-COINS-MASTER-BUILD-SPEC.md §47–§48.
--       Complements coins-schema.sql (wallets/RPCs). Does NOT enable real-money mode.
-- RESTORE-LOAD NOTE: Run AFTER announcements-schema.sql and coins-schema.sql.
--       Idempotent. Owner verifies with supabase/OWNER-SQL-CHECKLIST.md.

-- Team helper (safe if already created by coins-schema.sql)
create table if not exists public.paragon_team_members (
  email text primary key,
  role text not null default 'founder',
  added_at timestamptz not null default now()
);
insert into public.paragon_team_members (email, role)
values ('paragon.archive.2026@gmail.com', 'founder')
on conflict (email) do nothing;

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

-- ---------------------------------------------------------------------------
-- Feature flags (real_money_enabled stays FALSE)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_feature_flags (
  id int primary key default 1 check (id = 1),
  real_money_enabled boolean not null default false,
  purchases_enabled boolean not null default false,
  withdrawals_enabled boolean not null default false,
  compete_enabled boolean not null default false,
  leaderboard_rewards_enabled boolean not null default false,
  financial_pause boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
insert into public.paragon_feature_flags (id) values (1) on conflict (id) do nothing;
alter table public.paragon_feature_flags enable row level security;
drop policy if exists "public read feature flags" on public.paragon_feature_flags;
create policy "public read feature flags" on public.paragon_feature_flags
  for select to anon, authenticated using (true);
drop policy if exists "team update feature flags" on public.paragon_feature_flags;
create policy "team update feature flags" on public.paragon_feature_flags
  for update to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- ---------------------------------------------------------------------------
-- Economic settings (server-controlled rates — no hard-coded UI values)
-- Master target: 1 coin = ₦1 redeemable; placeholder buy packs in naira.
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_economic_settings (
  id int primary key default 1 check (id = 1),
  coin_unit_label text not null default 'Paragon Coin',
  naira_per_coin_redeemable numeric(12,4) not null default 1.0,
  naira_per_coin_purchase numeric(12,4) not null default 1.0,
  min_purchase_naira integer not null default 500,
  min_withdraw_coins integer not null default 500,
  withdraw_fee_coins_at_or_above integer not null default 10000,
  withdraw_fee_coins integer not null default 50,
  min_stake_coins integer not null default 100,
  max_stake_coins integer not null default 10000,
  competition_fee_bps integer not null default 500, -- 5% = 500 basis points of pool
  packs jsonb not null default '[
    {"naira":500,"coins":500,"label":"Starter"},
    {"naira":1000,"coins":1000,"label":"Standard"},
    {"naira":5000,"coins":5000,"label":"Pro"}
  ]'::jsonb,
  notes text not null default 'Production rates. real_money_enabled must stay false until provider+compliance ready.',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
insert into public.paragon_economic_settings (id) values (1) on conflict (id) do nothing;
alter table public.paragon_economic_settings enable row level security;
drop policy if exists "public read economic settings" on public.paragon_economic_settings;
create policy "public read economic settings" on public.paragon_economic_settings
  for select to anon, authenticated using (true);
drop policy if exists "team update economic settings" on public.paragon_economic_settings;
create policy "team update economic settings" on public.paragon_economic_settings
  for update to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- ---------------------------------------------------------------------------
-- Multi-bucket coin account (AVAILABLE / LOCKED / PENDING / RESTRICTED)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_coin_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available_coins integer not null default 0 check (available_coins >= 0),
  locked_coins integer not null default 0 check (locked_coins >= 0),
  pending_coins integer not null default 0 check (pending_coins >= 0),
  restricted_coins integer not null default 0 check (restricted_coins >= 0),
  status text not null default 'active' check (status in ('active','restricted','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.paragon_coin_accounts enable row level security;
drop policy if exists "users read own coin account" on public.paragon_coin_accounts;
create policy "users read own coin account" on public.paragon_coin_accounts
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "team read coin accounts" on public.paragon_coin_accounts;
create policy "team read coin accounts" on public.paragon_coin_accounts
  for select to authenticated using (public.paragon_is_team_member());
-- No direct user writes — RPCs only.

create or replace function public.paragon_ensure_coin_account(p_user uuid default auth.uid())
returns public.paragon_coin_accounts
language plpgsql
security definer
set search_path = public
as $$
declare a public.paragon_coin_accounts;
begin
  if p_user is null then raise exception 'Not authenticated'; end if;
  insert into public.paragon_coin_accounts (user_id) values (p_user)
  on conflict (user_id) do nothing;
  select * into a from public.paragon_coin_accounts where user_id = p_user;
  return a;
end;
$$;
revoke all on function public.paragon_ensure_coin_account(uuid) from public;
grant execute on function public.paragon_ensure_coin_account(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Typed ledger (append-only) — extends/parallel to paragon_coin_ledger
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_coin_ledger_v2 (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in (
    'PURCHASE_CREDIT','GAME_STAKE_LOCK','GAME_STAKE_RELEASE','GAME_WIN','GAME_FEE',
    'GAME_VOID_REFUND','CREATOR_PRIZE_LOCK','CREATOR_PRIZE_REFUND','LEADERBOARD_REWARD',
    'WITHDRAWAL_LOCK','WITHDRAWAL_SETTLED','WITHDRAWAL_FEE','WITHDRAWAL_REVERSAL',
    'PAYMENT_REVERSAL','ADMIN_ADJUSTMENT','PROMOTIONAL_CREDIT','PROMOTIONAL_REVERSAL'
  )),
  amount integer not null check (amount <> 0),
  bucket text not null default 'available' check (bucket in ('available','locked','pending','restricted')),
  status text not null default 'posted' check (status in ('posted','pending','void')),
  reference_type text,
  reference_id text,
  correlation_id text,
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create unique index if not exists paragon_coin_ledger_v2_idem_uidx
  on public.paragon_coin_ledger_v2 (user_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists paragon_coin_ledger_v2_user_idx
  on public.paragon_coin_ledger_v2 (user_id, created_at desc);
alter table public.paragon_coin_ledger_v2 enable row level security;
drop policy if exists "users read own ledger v2" on public.paragon_coin_ledger_v2;
create policy "users read own ledger v2" on public.paragon_coin_ledger_v2
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "team read ledger v2" on public.paragon_coin_ledger_v2;
create policy "team read ledger v2" on public.paragon_coin_ledger_v2
  for select to authenticated using (public.paragon_is_team_member());
revoke insert, update, delete on public.paragon_coin_ledger_v2 from authenticated, anon;

-- ---------------------------------------------------------------------------
-- Payment intents + events (provider-agnostic)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  naira integer not null check (naira > 0),
  coins integer not null check (coins > 0),
  pack_label text,
  status text not null default 'created' check (status in (
    'created','awaiting_transfer','claimed','pending_verification','matched',
    'confirmed','duplicate','mismatch','manual_review','cancelled','refunded'
  )),
  user_claim_ref text,
  user_claim_note text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists paragon_payment_intents_idem_uidx
  on public.paragon_payment_intents (user_id, idempotency_key)
  where idempotency_key is not null;
alter table public.paragon_payment_intents enable row level security;
drop policy if exists "users read own payment intents" on public.paragon_payment_intents;
create policy "users read own payment intents" on public.paragon_payment_intents
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "users create own payment intents" on public.paragon_payment_intents;
create policy "users create own payment intents" on public.paragon_payment_intents
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "team manage payment intents" on public.paragon_payment_intents;
create policy "team manage payment intents" on public.paragon_payment_intents
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

create table if not exists public.paragon_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_transaction_id text not null,
  amount_naira integer not null,
  currency text not null default 'NGN',
  sender_name text,
  raw_ref text,
  status text not null default 'received',
  matched_intent_id uuid references public.paragon_payment_intents(id),
  matched_user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create unique index if not exists paragon_payment_events_provider_uidx
  on public.paragon_payment_events (provider, provider_transaction_id);
alter table public.paragon_payment_events enable row level security;
drop policy if exists "team manage payment events" on public.paragon_payment_events;
create policy "team manage payment events" on public.paragon_payment_events
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- ---------------------------------------------------------------------------
-- Withdrawals v2 + payout accounts
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bank_name text not null,
  account_name text not null,
  account_number text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.paragon_payout_accounts enable row level security;
drop policy if exists "users manage own payout accounts" on public.paragon_payout_accounts;
create policy "users manage own payout accounts" on public.paragon_payout_accounts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "team read payout accounts" on public.paragon_payout_accounts;
create policy "team read payout accounts" on public.paragon_payout_accounts
  for select to authenticated using (public.paragon_is_team_member());

create table if not exists public.paragon_withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  coins integer not null check (coins > 0),
  fee_coins integer not null default 0 check (fee_coins >= 0),
  naira_payout integer not null check (naira_payout >= 0),
  payout_account_id uuid references public.paragon_payout_accounts(id),
  bank_snapshot text not null,
  status text not null default 'requested' check (status in (
    'requested','locked','review','approved','paying','paid','rejected','cancelled','failed'
  )),
  team_note text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id)
);
create unique index if not exists paragon_withdrawals_idem_uidx
  on public.paragon_withdrawals (user_id, idempotency_key)
  where idempotency_key is not null;
alter table public.paragon_withdrawals enable row level security;
drop policy if exists "users read own withdrawals v2" on public.paragon_withdrawals;
create policy "users read own withdrawals v2" on public.paragon_withdrawals
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "users create own withdrawals v2" on public.paragon_withdrawals;
create policy "users create own withdrawals v2" on public.paragon_withdrawals
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "team manage withdrawals v2" on public.paragon_withdrawals;
create policy "team manage withdrawals v2" on public.paragon_withdrawals
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- ---------------------------------------------------------------------------
-- Competition / quiz / leaderboard stubs (structure only — engines later)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_competitions (
  id uuid primary key default gen_random_uuid(),
  game_key text not null,
  status text not null default 'CREATED',
  stake_coins integer not null default 0,
  fee_coins integer not null default 0,
  pool_coins integer not null default 0,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
alter table public.paragon_competitions enable row level security;
drop policy if exists "auth read competitions" on public.paragon_competitions;
create policy "auth read competitions" on public.paragon_competitions
  for select to authenticated using (true);
drop policy if exists "team write competitions" on public.paragon_competitions;
create policy "team write competitions" on public.paragon_competitions
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

create table if not exists public.paragon_leaderboard_periods (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'open' check (status in ('open','closed','settled')),
  prize_pool_coins integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.paragon_leaderboard_periods enable row level security;
drop policy if exists "public read leaderboard periods" on public.paragon_leaderboard_periods;
create policy "public read leaderboard periods" on public.paragon_leaderboard_periods
  for select to anon, authenticated using (true);

create table if not exists public.paragon_audit_log (
  id bigserial primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  target_type text,
  target_id text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.paragon_audit_log enable row level security;
drop policy if exists "team read audit log" on public.paragon_audit_log;
create policy "team read audit log" on public.paragon_audit_log
  for select to authenticated using (public.paragon_is_team_member());

-- Public read of flags + settings for the browser (honest real-money OFF)
create or replace function public.paragon_public_coin_config()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'flags', (select to_jsonb(f) - 'updated_by' from public.paragon_feature_flags f where id = 1),
    'economy', (select to_jsonb(e) - 'updated_by' from public.paragon_economic_settings e where id = 1)
  );
$$;
revoke all on function public.paragon_public_coin_config() from public;
grant execute on function public.paragon_public_coin_config() to anon, authenticated;

-- DONE Phase 1b. Real-money stays OFF. Wire Edge/provider in a later phase.
