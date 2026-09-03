-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: finance-schema.sql
-- EXPECTED PROJECT PATH: /supabase/finance-schema.sql
-- ROLE: STAGES 6+7 — the AUTHORITATIVE server-side finance layer (P-100 / D-208): wallet
--       balances by type, the typed append-only coin ledger, withdrawal requests + the full
--       payout state machine, verified payout accounts, payment claims with the UNIQUE
--       (provider, provider_transaction_id) duplicate-payment key, risk cases, audit rows,
--       emergency controls, and server-controlled economic settings. It mirrors the device
--       engine (paragon-wallets.js + the public withdrawal UI + the Team finance desks) —
--       PARAGON-COINS-MASTER-BUILD-SPEC.md §14–§37, §54–§61.
-- RESTORE-LOAD NOTE: The device layer works TODAY and never claims to send real money.
--       Run this SQL ONCE in the Supabase SQL editor ONLY when the owner activates
--       real-money infrastructure (REAL_MONEY_MODE = LIVE per the activation gates):
--       provider credentials exist, legal terms are in place, and the operator accepts
--       that the SERVER becomes the wallet of record (the browser is never authoritative).
--       It is idempotent (ON CONFLICT / IF NOT EXISTS). It does NOT activate anything by
--       itself — no money moves until a provider is wired and the owner flips the gates.

-- 1. Wallets — balance by type (available / locked / pending / restricted).
create table if not exists public.paragon_wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  available_coins bigint not null default 0 check (available_coins >= 0),
  locked_coins bigint not null default 0 check (locked_coins >= 0),
  pending_coins bigint not null default 0 check (pending_coins >= 0),
  restricted_coins bigint not null default 0 check (restricted_coins >= 0),
  total_ever_credited bigint not null default 0 check (total_ever_credited >= 0),
  total_ever_debited bigint not null default 0 check (total_ever_debited >= 0),
  updated_at timestamptz not null default now()
);
-- The wallet may NEVER go negative and may only move through typed ledger rows
-- (no direct edits): enforce with a defensive trigger at activation time.
create or replace function public.guard_wallet_balance() returns trigger as $$
begin
  if new.available_coins < 0 or new.locked_coins < 0 or new.pending_coins < 0 or new.restricted_coins < 0 then
    raise exception 'wallet balance can never go negative (guard_wallet_balance)';
  end if;
  return new;
end; $$ language plpgsql;
drop trigger if exists trg_guard_wallet_balance on public.paragon_wallets;
create trigger trg_guard_wallet_balance before update on public.paragon_wallets
  for each row execute function public.guard_wallet_balance();

-- 2. Typed append-only coin ledger — never free-text accounting (§15–§16).
create table if not exists public.paragon_coin_ledger_entries (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete restrict,
  entry_type text not null check (entry_type in
    ('PURCHASE_CREDIT','PURCHASE_REFUND','WITHDRAWAL_LOCK','WITHDRAWAL_SETTLED',
     'WITHDRAWAL_FEE','WITHDRAWAL_REVERSAL','LEADERBOARD_REWARD','COMPETITION_FEE',
     'COMPETITION_PRIZE','ADJUSTMENT')),
  amount_coins bigint not null check (amount_coins <> 0),   -- signed: + credit / − debit
  balance_snapshot_coins bigint not null,                   -- server balance after this row
  ref_type text not null,                                   -- withdrawal | purchase | reward | competition
  ref_id text not null,                                     -- the client correlationId / row id
  reason text not null default '',
  actor text not null default 'system',
  idempotency_key text unique,                              -- replay-safe credits (applies once)
  created_at timestamptz not null default now()
);
create index if not exists idx_ledger_user_time on public.paragon_coin_ledger_entries (user_id, created_at desc);
create index if not exists idx_ledger_ref on public.paragon_coin_ledger_entries (ref_type, ref_id);

-- 3. Payout accounts — must belong to the verified user (§26): no third-party payouts.
create table if not exists public.paragon_payout_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  bank text not null,
  account_number text not null,
  account_name text not null,
  verified boolean not null default false,     -- verified against the named account (BVN/OTC later)
  risk_hold boolean not null default false,    -- detail changes → extra verification
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Withdrawal requests — the full payout state machine (§22–§25).
create table if not exists public.paragon_withdrawals (
  id uuid primary key default gen_random_uuid(),
  correlation_id text not null unique,
  user_id uuid references auth.users (id) on delete restrict,
  amount_naira bigint not null check (amount_naira >= 1000),
  amount_coins bigint not null check (amount_coins > 0),
  fee_coins bigint not null default 0 check (fee_coins >= 0),  -- ₦10,000+ rule → 50 coins
  locked_coins bigint not null check (locked_coins > 0),
  state text not null check (state in
    ('REQUESTED','ELIGIBILITY_CHECK','RISK_CHECK','LOCKED','PAYOUT_PENDING',
     'PROVIDER_SUBMITTED','PROVIDER_CONFIRMED','PAID','RETRYING','UNKNOWN',
     'RECONCILIATION','FAILED','COINS_UNLOCKED')),
  payout_account_id uuid references public.paragon_payout_accounts (user_id),
  payout_provider text not null default '',
  payout_provider_txn text not null default '',
  unique (payout_provider, payout_provider_txn),               -- §19: never pay twice
  risk_flags jsonb not null default '[]',
  fail_reason text not null default '',
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz
);
create index if not exists idx_withdrawals_user on public.paragon_withdrawals (user_id, requested_at desc);
create index if not exists idx_withdrawals_state on public.paragon_withdrawals (state);
-- Rolling frequency limits (§23) are enforced transactionally at activation by the
-- server function; the client engine enforces the same limits today (2 / rolling 24 h,
-- 5 / rolling 7 days — configurable, never traps funds: FAILED → COINS_UNLOCKED refunds).

-- 5. Payment claims — matching information ONLY; the unique key is the anti-duplicate law.
create table if not exists public.paragon_payment_claims (
  id text primary key,                        -- matches the client requestId
  user_id uuid references auth.users (id) on delete restrict,
  request_id text not null,
  provider text not null default 'bank-transfer',
  provider_transaction_id text not null,
  sender_name text not null default '',
  sender_bank text not null default '',
  amount_naira bigint not null check (amount_naira > 0),
  state text not null default 'CLAIMED' check (state in
    ('CLAIMED','PENDING_VERIFICATION','MANUAL_REVIEW','CONFIRMED','MISMATCH','REJECTED','DUPLICATE')),
  duplicate_of text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_transaction_id)   -- §19: one credit per transfer, always
);

-- 6. Risk & fraud cases (§31–§34, §58–§59) — advisory signals, never auto-freezes.
create table if not exists public.paragon_risk_cases (
  id text primary key,
  user_id uuid references auth.users (id) on delete restrict,
  case_type text not null,
  reason text not null default '',
  state text not null default 'OPEN' check (state in ('OPEN','REVIEW','RESOLVED','CLOSED')),
  linked_refs jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Append-only finance audit (§37) — server rows cannot be edited or deleted.
create table if not exists public.paragon_finance_audit (
  id bigint generated always as identity primary key,
  actor_role text not null default 'system',
  action text not null,
  detail text not null default '',
  ref_id text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists idx_finance_audit_time on public.paragon_finance_audit (created_at desc);

-- 8. Emergency controls (§30) — financial pause + per-game kill switches (server copy).
create table if not exists public.paragon_finance_controls (
  id boolean primary key default true check (id = true),      -- single-row table
  financial_pause boolean not null default false,
  paused_reason text not null default '',
  kill_switches jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by text not null default ''
);

-- 9. Server-controlled economic settings (mirrors the device copy of §22–§23 defaults).
create table if not exists public.paragon_economic_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text not null default ''
);
insert into public.paragon_economic_settings (key, value) values
  ('naira_rate', '2'::jsonb),
  ('withdrawal_fee', '{"threshold_naira": 10000, "fee_coins": 50}'::jsonb),
  ('withdrawal_limits', '{"min_naira": 1000, "daily_24h": 2, "weekly_7d": 5}'::jsonb),
  ('claim_limits', '{"daily_24h": 5}'::jsonb)
on conflict (key) do nothing;

-- 10. Team desk row-level access is scoped by auth claims at activation (RLS), mirroring
--     the device permission law in team/permissions.js (six fixed roles; finance views for
--     super-admin/admin (+analyst read-only dashboards), payouts/emergency = super-admin).
