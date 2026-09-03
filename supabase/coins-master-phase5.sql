-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-master-phase5.sql
-- EXPECTED PROJECT PATH: /supabase/coins-master-phase5.sql
-- ROLE: Coins master Phase 5 — Nigerian wallet rails (OPay / Moniepoint first),
--       bank-transfer-first provider config, KYC/AML extensibility, payout rails,
--       withdrawal reconcile helpers. Does NOT enable real_money_enabled.
-- RESTORE-LOAD NOTE: Run AFTER coins-master-phase1..4.sql. Idempotent.
--
-- OWNER INTENT: Prefer OPay or Moniepoint (Nigerian bank/wallet transfer), NOT
-- Flutterwave/Paystack as the primary path. Those remain optional adapters only.
-- Secrets never live in SQL — only public account labels + Edge env keys.

-- ---------------------------------------------------------------------------
-- Provider settings: add OPay / Moniepoint columns (keep paystack/flutterwave optional)
-- ---------------------------------------------------------------------------
alter table public.paragon_payment_provider_settings
  add column if not exists preferred_rails text[] not null default array['opay','moniepoint','manual_bank']::text[];

alter table public.paragon_payment_provider_settings
  add column if not exists opay_merchant_label text;

alter table public.paragon_payment_provider_settings
  add column if not exists opay_account_name text;

alter table public.paragon_payment_provider_settings
  add column if not exists opay_account_number text;

alter table public.paragon_payment_provider_settings
  add column if not exists opay_bank_name text default 'OPay';

alter table public.paragon_payment_provider_settings
  add column if not exists moniepoint_merchant_label text;

alter table public.paragon_payment_provider_settings
  add column if not exists moniepoint_account_name text;

alter table public.paragon_payment_provider_settings
  add column if not exists moniepoint_account_number text;

alter table public.paragon_payment_provider_settings
  add column if not exists moniepoint_bank_name text default 'Moniepoint MFB';

alter table public.paragon_payment_provider_settings
  add column if not exists payout_rail text not null default 'manual_opay_moniepoint';
  /* manual_opay_moniepoint | opay_api | moniepoint_api | manual_bank | other */

alter table public.paragon_payment_provider_settings
  add column if not exists support_contact_note text not null default
    'After you transfer via OPay or Moniepoint, keep the receipt. Coins credit only after Paragon confirms the payment — never from the Buy click alone.';

-- Default active provider toward Nigerian wallet rails (still manual confirm until APIs wired)
update public.paragon_payment_provider_settings
set
  active_provider = case
    when active_provider in ('paystack', 'flutterwave') then 'manual_bank'
    else active_provider
  end,
  preferred_rails = array['opay','moniepoint','manual_bank']::text[],
  bank_transfer_instructions = coalesce(
    nullif(trim(bank_transfer_instructions), ''),
    'Pay with OPay or Moniepoint transfer to the Paragon wallet account shown in the coin shop. Put your Paragon account email in the narration/reference. Coins credit only after team or provider confirmation.'
  ),
  payout_rail = coalesce(nullif(payout_rail, ''), 'manual_opay_moniepoint'),
  webhook_path_hint = coalesce(
    nullif(trim(webhook_path_hint), ''),
    '/functions/v1/coin-payment-webhook?provider=opay|moniepoint|manual_bank'
  )
where id = 1;

-- ---------------------------------------------------------------------------
-- KYC / AML extensibility (no hard block until owner policy turns it on)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_kyc_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'none' check (status in (
    'none','pending','verified','rejected','expired','manual_review'
  )),
  legal_name text,
  phone_e164 text,
  country_code text not null default 'NG',
  id_type text check (id_type is null or id_type in (
    'nin','bvn_tokenized','passport','drivers_license','voters_card','other'
  )),
  /* Never store raw BVN/NIN in cleartext long-term — token/ref only when a provider exists */
  id_reference text,
  payout_account_name text,
  payout_account_number text,
  payout_bank_name text,
  payout_rail text check (payout_rail is null or payout_rail in (
    'opay','moniepoint','other_bank'
  )),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.paragon_kyc_profiles enable row level security;
drop policy if exists "users read own kyc" on public.paragon_kyc_profiles;
create policy "users read own kyc" on public.paragon_kyc_profiles
  for select to authenticated
  using ((select auth.uid()) = user_id or public.paragon_is_team_member());
drop policy if exists "users upsert own kyc draft" on public.paragon_kyc_profiles;
create policy "users upsert own kyc draft" on public.paragon_kyc_profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "users update own kyc draft" on public.paragon_kyc_profiles;
create policy "users update own kyc draft" on public.paragon_kyc_profiles
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and status in ('none','pending','rejected')
  )
  with check ((select auth.uid()) = user_id);
drop policy if exists "team manage kyc" on public.paragon_kyc_profiles;
create policy "team manage kyc" on public.paragon_kyc_profiles
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

create table if not exists public.paragon_kyc_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id),
  event_type text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists paragon_kyc_events_user_idx
  on public.paragon_kyc_events (user_id, created_at desc);
alter table public.paragon_kyc_events enable row level security;
drop policy if exists "team read kyc events" on public.paragon_kyc_events;
create policy "team read kyc events" on public.paragon_kyc_events
  for select to authenticated
  using (public.paragon_is_team_member() or (select auth.uid()) = user_id);
drop policy if exists "team write kyc events" on public.paragon_kyc_events;
create policy "team write kyc events" on public.paragon_kyc_events
  for insert to authenticated
  with check (public.paragon_is_team_member() or (select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Payout rail log (Opay/Moniepoint manual or API later)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_payout_rail_events (
  id uuid primary key default gen_random_uuid(),
  withdrawal_id uuid,
  provider text not null check (provider in (
    'opay','moniepoint','manual_bank','other'
  )),
  provider_reference text,
  amount_naira integer not null check (amount_naira > 0),
  status text not null default 'initiated' check (status in (
    'initiated','sent','confirmed','failed','needs_review','cancelled'
  )),
  raw jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (provider, provider_reference)
);
create index if not exists paragon_payout_rail_wd_idx
  on public.paragon_payout_rail_events (withdrawal_id, created_at desc);
alter table public.paragon_payout_rail_events enable row level security;
drop policy if exists "team manage payout rail" on public.paragon_payout_rail_events;
create policy "team manage payout rail" on public.paragon_payout_rail_events
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- ---------------------------------------------------------------------------
-- User: submit / update KYC draft (payout destination for OPay/Moniepoint)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_kyc_upsert_draft(
  p_legal_name text default null,
  p_phone_e164 text default null,
  p_payout_account_name text default null,
  p_payout_account_number text default null,
  p_payout_bank_name text default null,
  p_payout_rail text default 'opay'
)
returns public.paragon_kyc_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.paragon_kyc_profiles;
  rail text := lower(coalesce(nullif(trim(p_payout_rail), ''), 'opay'));
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if rail not in ('opay','moniepoint','other_bank') then
    raise exception 'payout_rail must be opay, moniepoint, or other_bank';
  end if;

  insert into public.paragon_kyc_profiles as k (
    user_id, status, legal_name, phone_e164,
    payout_account_name, payout_account_number, payout_bank_name, payout_rail,
    updated_at
  ) values (
    auth.uid(), 'pending',
    nullif(trim(p_legal_name), ''),
    nullif(trim(p_phone_e164), ''),
    nullif(trim(p_payout_account_name), ''),
    nullif(trim(p_payout_account_number), ''),
    nullif(trim(p_payout_bank_name), ''),
    rail,
    now()
  )
  on conflict (user_id) do update set
    legal_name = coalesce(excluded.legal_name, k.legal_name),
    phone_e164 = coalesce(excluded.phone_e164, k.phone_e164),
    payout_account_name = coalesce(excluded.payout_account_name, k.payout_account_name),
    payout_account_number = coalesce(excluded.payout_account_number, k.payout_account_number),
    payout_bank_name = coalesce(excluded.payout_bank_name, k.payout_bank_name),
    payout_rail = excluded.payout_rail,
    status = case
      when k.status in ('verified') then k.status
      else 'pending'
    end,
    updated_at = now()
  returning * into row;

  insert into public.paragon_kyc_events (user_id, actor_id, event_type, detail)
  values (
    auth.uid(), auth.uid(), 'draft_upsert',
    jsonb_build_object('rail', rail, 'status', row.status)
  );

  return row;
end;
$$;
revoke all on function public.paragon_kyc_upsert_draft(text, text, text, text, text, text) from public;
grant execute on function public.paragon_kyc_upsert_draft(text, text, text, text, text, text) to authenticated;

create or replace function public.paragon_kyc_my_profile()
returns public.paragon_kyc_profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.paragon_kyc_profiles where user_id = auth.uid();
$$;
revoke all on function public.paragon_kyc_my_profile() from public;
grant execute on function public.paragon_kyc_my_profile() to authenticated;

-- Team: set KYC status
create or replace function public.paragon_kyc_set_status(
  p_user_id uuid,
  p_status text,
  p_note text default null
)
returns public.paragon_kyc_profiles
language plpgsql
security definer
set search_path = public
as $$
declare row public.paragon_kyc_profiles;
begin
  if not public.paragon_is_team_member() then raise exception 'Team only'; end if;
  if p_status not in ('none','pending','verified','rejected','expired','manual_review') then
    raise exception 'Invalid status';
  end if;
  update public.paragon_kyc_profiles set
    status = p_status,
    note = coalesce(p_note, note),
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  where user_id = p_user_id
  returning * into row;
  if row.user_id is null then raise exception 'KYC profile not found'; end if;
  insert into public.paragon_kyc_events (user_id, actor_id, event_type, detail)
  values (p_user_id, auth.uid(), 'status_set', jsonb_build_object('status', p_status, 'note', p_note));
  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), 'kyc_status_set', 'user', p_user_id::text,
          jsonb_build_object('status', p_status));
  return row;
end;
$$;
revoke all on function public.paragon_kyc_set_status(uuid, text, text) from public;
grant execute on function public.paragon_kyc_set_status(uuid, text, text) to authenticated;

-- Team: record payout rail event (after sending ₦ via OPay/Moniepoint)
create or replace function public.paragon_payout_rail_record(
  p_provider text,
  p_amount_naira integer,
  p_provider_reference text default null,
  p_withdrawal_id uuid default null,
  p_status text default 'sent',
  p_raw jsonb default '{}'::jsonb
)
returns public.paragon_payout_rail_events
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public.paragon_payout_rail_events;
  prov text := lower(trim(p_provider));
  ref text := coalesce(nullif(trim(p_provider_reference), ''), 'manual-' || gen_random_uuid()::text);
begin
  if not public.paragon_is_team_member() then raise exception 'Team only'; end if;
  if prov not in ('opay','moniepoint','manual_bank','other') then
    raise exception 'provider must be opay, moniepoint, manual_bank, or other';
  end if;
  if p_amount_naira is null or p_amount_naira <= 0 then
    raise exception 'amount required';
  end if;
  insert into public.paragon_payout_rail_events (
    withdrawal_id, provider, provider_reference, amount_naira, status, raw, created_by
  ) values (
    p_withdrawal_id, prov, ref, p_amount_naira,
    coalesce(nullif(trim(p_status), ''), 'sent'),
    coalesce(p_raw, '{}'::jsonb), auth.uid()
  )
  on conflict (provider, provider_reference) do update set
    status = excluded.status,
    raw = excluded.raw
  returning * into ev;

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (
    auth.uid(), 'payout_rail_recorded', 'payout_rail', ev.id::text,
    jsonb_build_object(
      'provider', prov, 'amount_naira', p_amount_naira,
      'withdrawal_id', p_withdrawal_id, 'reference', ref, 'status', ev.status
    )
  );
  return ev;
end;
$$;
revoke all on function public.paragon_payout_rail_record(text, integer, text, uuid, text, jsonb) from public;
grant execute on function public.paragon_payout_rail_record(text, integer, text, uuid, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Public config: expose OPay / Moniepoint labels (never secrets)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_public_coin_config()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'flags', (select to_jsonb(f) - 'updated_by' from public.paragon_feature_flags f where id = 1),
    'economy', (select to_jsonb(e) - 'updated_by' from public.paragon_economic_settings e where id = 1),
    'provider', (
      select jsonb_build_object(
        'active_provider', p.active_provider,
        'preferred_rails', p.preferred_rails,
        'bank_transfer_instructions', p.bank_transfer_instructions,
        'support_contact_note', p.support_contact_note,
        'payout_rail', p.payout_rail,
        'opay', jsonb_build_object(
          'label', p.opay_merchant_label,
          'account_name', p.opay_account_name,
          'account_number', p.opay_account_number,
          'bank_name', p.opay_bank_name
        ),
        'moniepoint', jsonb_build_object(
          'label', p.moniepoint_merchant_label,
          'account_name', p.moniepoint_account_name,
          'account_number', p.moniepoint_account_number,
          'bank_name', p.moniepoint_bank_name
        ),
        /* Optional cards — not preferred */
        'paystack_public_key', p.paystack_public_key,
        'flutterwave_public_key', p.flutterwave_public_key,
        'webhook_path_hint', p.webhook_path_hint
      )
      from public.paragon_payment_provider_settings p where id = 1
    )
  );
$$;
revoke all on function public.paragon_public_coin_config() from public;
grant execute on function public.paragon_public_coin_config() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Health RPC → phase 5
-- ---------------------------------------------------------------------------
create or replace function public.paragon_sql_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare result jsonb := '{}'::jsonb;
begin
  result := jsonb_build_object(
    'paragon_user_state', to_regclass('public.paragon_user_state') is not null,
    'paragon_announcements', to_regclass('public.paragon_announcements') is not null,
    'paragon_team_members', to_regclass('public.paragon_team_members') is not null,
    'paragon_coin_wallets', to_regclass('public.paragon_coin_wallets') is not null,
    'paragon_coin_accounts', to_regclass('public.paragon_coin_accounts') is not null,
    'paragon_coin_ledger_v2', to_regclass('public.paragon_coin_ledger_v2') is not null,
    'paragon_feature_flags', to_regclass('public.paragon_feature_flags') is not null,
    'paragon_economic_settings', to_regclass('public.paragon_economic_settings') is not null,
    'paragon_payment_intents', to_regclass('public.paragon_payment_intents') is not null,
    'paragon_payment_events', to_regclass('public.paragon_payment_events') is not null,
    'paragon_payment_matches', to_regclass('public.paragon_payment_matches') is not null,
    'paragon_payment_webhook_inbox', to_regclass('public.paragon_payment_webhook_inbox') is not null,
    'paragon_payment_provider_settings', to_regclass('public.paragon_payment_provider_settings') is not null,
    'paragon_competitions', to_regclass('public.paragon_competitions') is not null,
    'paragon_competition_participants', to_regclass('public.paragon_competition_participants') is not null,
    'paragon_competition_settlements', to_regclass('public.paragon_competition_settlements') is not null,
    'paragon_leaderboard_periods', to_regclass('public.paragon_leaderboard_periods') is not null,
    'paragon_leaderboard_entries', to_regclass('public.paragon_leaderboard_entries') is not null,
    'paragon_creator_prizes', to_regclass('public.paragon_creator_prizes') is not null,
    'paragon_financial_cases', to_regclass('public.paragon_financial_cases') is not null,
    'paragon_risk_flags', to_regclass('public.paragon_risk_flags') is not null,
    'paragon_kyc_profiles', to_regclass('public.paragon_kyc_profiles') is not null,
    'paragon_kyc_events', to_regclass('public.paragon_kyc_events') is not null,
    'paragon_payout_rail_events', to_regclass('public.paragon_payout_rail_events') is not null,
    'rpc_competition_settle', to_regprocedure('public.paragon_competition_settle(uuid,text,uuid,text)') is not null,
    'rpc_leaderboard_settle', to_regprocedure('public.paragon_leaderboard_settle_period(uuid)') is not null,
    'rpc_kyc_upsert', to_regprocedure('public.paragon_kyc_upsert_draft(text,text,text,text,text,text)') is not null,
    'rpc_payout_rail_record', to_regprocedure('public.paragon_payout_rail_record(text,integer,text,uuid,text,jsonb)') is not null,
    'rpc_sql_health', true,
    'phase', 5,
    'preferred_payment_story', 'opay_moniepoint_bank_transfer_first',
    'checked_at', now()
  );
  if to_regclass('public.paragon_feature_flags') is not null then
    result := result || jsonb_build_object(
      'flags', (select to_jsonb(f) - 'updated_by' from public.paragon_feature_flags f where id = 1)
    );
  end if;
  if to_regclass('public.paragon_payment_provider_settings') is not null then
    result := result || jsonb_build_object(
      'active_provider', (select active_provider from public.paragon_payment_provider_settings where id = 1),
      'preferred_rails', (select preferred_rails from public.paragon_payment_provider_settings where id = 1),
      'payout_rail', (select payout_rail from public.paragon_payment_provider_settings where id = 1)
    );
  end if;
  if to_regclass('public.paragon_announcements') is not null then
    result := result || jsonb_build_object(
      'announcements_count', (select count(*)::int from public.paragon_announcements)
    );
  end if;
  return result;
end;
$$;
revoke all on function public.paragon_sql_health() from public;
grant execute on function public.paragon_sql_health() to anon, authenticated;

-- DONE Phase 5. OPay/Moniepoint-first config + KYC/payout rails. real_money still OFF.
