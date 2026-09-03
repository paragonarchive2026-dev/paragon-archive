-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-master-stage1-hardening.sql
-- EXPECTED PROJECT PATH: /supabase/coins-master-stage1-hardening.sql
-- ROLE: Stage 1 foundation gaps — rate limits (2 wd/24h, 5 wd/7d, 5 claims/24h),
--       platform reserve/liability books, 30% fee→reward_reserve, finance report,
--       advisory locks. Does NOT enable real_money_enabled.
-- RESTORE-LOAD NOTE: Run AFTER coins-master-phase1.sql and coins-master-phase2.sql.
--       Safe before or after phase3–5. Idempotent.

-- ---------------------------------------------------------------------------
-- Economic knobs for rate limits + reward fee share (30% of competition fees)
-- ---------------------------------------------------------------------------
alter table public.paragon_economic_settings
  add column if not exists max_withdrawals_per_24h integer not null default 2;
alter table public.paragon_economic_settings
  add column if not exists max_withdrawals_per_7d integer not null default 5;
alter table public.paragon_economic_settings
  add column if not exists max_payment_claims_per_24h integer not null default 5;
alter table public.paragon_economic_settings
  add column if not exists fee_to_reward_reserve_bps integer not null default 3000; -- 30% of fee coins
alter table public.paragon_economic_settings
  add column if not exists min_reserve_coverage_ratio numeric(8,4) not null default 1.0000;

update public.paragon_economic_settings set
  max_withdrawals_per_24h = coalesce(max_withdrawals_per_24h, 2),
  max_withdrawals_per_7d = coalesce(max_withdrawals_per_7d, 5),
  max_payment_claims_per_24h = coalesce(max_payment_claims_per_24h, 5),
  fee_to_reward_reserve_bps = coalesce(fee_to_reward_reserve_bps, 3000),
  naira_per_coin_purchase = coalesce(naira_per_coin_purchase, 1.0),
  naira_per_coin_redeemable = coalesce(naira_per_coin_redeemable, 1.0),
  min_stake_coins = coalesce(min_stake_coins, 100),
  max_stake_coins = coalesce(max_stake_coins, 10000),
  competition_fee_bps = coalesce(competition_fee_bps, 500),
  withdraw_fee_coins_at_or_above = coalesce(withdraw_fee_coins_at_or_above, 10000),
  withdraw_fee_coins = coalesce(withdraw_fee_coins, 50)
where id = 1;

-- ---------------------------------------------------------------------------
-- Platform books (single-row) — liability vs reserves (not user-spendable)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_platform_books (
  id integer primary key default 1 check (id = 1),
  redeemable_liability_coins bigint not null default 0,
  liquid_reserve_coins bigint not null default 0,
  reward_reserve_coins bigint not null default 0,
  fee_revenue_coins bigint not null default 0,
  notes text not null default 'Updated by server RPCs only. Display for Team finance.',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
insert into public.paragon_platform_books (id) values (1) on conflict (id) do nothing;
alter table public.paragon_platform_books enable row level security;
drop policy if exists "team read platform books" on public.paragon_platform_books;
create policy "team read platform books" on public.paragon_platform_books
  for select to authenticated using (public.paragon_is_team_member());
-- no direct client writes

create or replace function public.paragon_platform_books_apply(
  p_liability_delta bigint default 0,
  p_liquid_delta bigint default 0,
  p_reward_delta bigint default 0,
  p_fee_delta bigint default 0,
  p_note text default null
)
returns public.paragon_platform_books
language plpgsql
security definer
set search_path = public
as $$
declare b public.paragon_platform_books;
begin
  insert into public.paragon_platform_books (id) values (1) on conflict (id) do nothing;
  update public.paragon_platform_books set
    redeemable_liability_coins = greatest(0, redeemable_liability_coins + coalesce(p_liability_delta, 0)),
    liquid_reserve_coins = greatest(0, liquid_reserve_coins + coalesce(p_liquid_delta, 0)),
    reward_reserve_coins = greatest(0, reward_reserve_coins + coalesce(p_reward_delta, 0)),
    fee_revenue_coins = greatest(0, fee_revenue_coins + coalesce(p_fee_delta, 0)),
    notes = coalesce(nullif(trim(p_note), ''), notes),
    updated_at = now(),
    updated_by = auth.uid()
  where id = 1
  returning * into b;
  return b;
end;
$$;
revoke all on function public.paragon_platform_books_apply(bigint, bigint, bigint, bigint, text) from public;
-- called only from other security definer functions

-- Recompute liability from sum of user buckets (source of truth check)
create or replace function public.paragon_recompute_liability()
returns public.paragon_platform_books
language plpgsql
security definer
set search_path = public
as $$
declare
  total bigint;
  b public.paragon_platform_books;
begin
  if not public.paragon_is_team_member()
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Team or service only';
  end if;
  select coalesce(sum(available_coins + locked_coins + pending_coins + restricted_coins), 0)
    into total from public.paragon_coin_accounts;
  update public.paragon_platform_books set
    redeemable_liability_coins = total,
    updated_at = now(),
    updated_by = auth.uid()
  where id = 1
  returning * into b;
  return b;
end;
$$;
revoke all on function public.paragon_recompute_liability() from public;
grant execute on function public.paragon_recompute_liability() to authenticated;

-- ---------------------------------------------------------------------------
-- Harden claim payment: 5 claims / 24h + advisory lock
-- ---------------------------------------------------------------------------
create or replace function public.paragon_coin_claim_payment(
  p_intent_id uuid,
  p_claim_ref text,
  p_claim_note text default null
)
returns public.paragon_payment_intents
language plpgsql
security definer
set search_path = public
as $$
declare
  intent public.paragon_payment_intents;
  uid uuid := auth.uid();
  econ public.paragon_economic_settings;
  claim_count int;
  max_claims int;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  perform pg_advisory_xact_lock(hashtextextended('claim:' || uid::text, 0));

  select * into econ from public.paragon_economic_settings where id = 1;
  max_claims := coalesce(econ.max_payment_claims_per_24h, 5);

  select count(*) into claim_count
  from public.paragon_payment_intents
  where user_id = uid
    and status in ('claimed', 'pending_verification', 'matched', 'confirmed')
    and updated_at > now() - interval '24 hours'
    and user_claim_ref is not null;

  -- Count recent claim transitions more accurately via audit when available
  select count(*) into claim_count
  from public.paragon_audit_log
  where actor_id = uid
    and action = 'payment_claim'
    and created_at > now() - interval '24 hours';

  if claim_count >= max_claims then
    raise exception 'Payment claim limit reached (% per 24h)', max_claims;
  end if;

  update public.paragon_payment_intents set
    status = 'claimed',
    user_claim_ref = left(coalesce(p_claim_ref, ''), 200),
    user_claim_note = left(coalesce(p_claim_note, ''), 500),
    updated_at = now()
  where id = p_intent_id and user_id = uid
    and status in ('awaiting_transfer', 'created', 'claimed')
  returning * into intent;
  if intent.id is null then raise exception 'Intent not found or not claimable'; end if;

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (uid, 'payment_claim', 'payment_intent', intent.id::text,
          jsonb_build_object('ref', intent.user_claim_ref));

  return intent;
end;
$$;
revoke all on function public.paragon_coin_claim_payment(uuid, text, text) from public;
grant execute on function public.paragon_coin_claim_payment(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Harden withdrawal request: 2/24h + 5/7d + advisory lock
-- ---------------------------------------------------------------------------
create or replace function public.paragon_coin_request_withdrawal(
  p_coins integer,
  p_bank_snapshot text,
  p_payout_account_id uuid default null,
  p_idempotency_key text default null
)
returns public.paragon_withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  flags public.paragon_feature_flags;
  econ public.paragon_economic_settings;
  fee int := 0;
  payout int;
  w public.paragon_withdrawals;
  email text;
  c24 int;
  c7 int;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  perform pg_advisory_xact_lock(hashtextextended('withdraw:' || uid::text, 0));

  select * into flags from public.paragon_feature_flags where id = 1;
  select * into econ from public.paragon_economic_settings where id = 1;
  if flags.financial_pause then raise exception 'Financial operations paused'; end if;
  if flags.real_money_enabled and not flags.withdrawals_enabled then
    raise exception 'Withdrawals disabled';
  end if;
  if p_coins is null or p_coins < coalesce(econ.min_withdraw_coins, 500) then
    raise exception 'Below minimum withdrawal';
  end if;
  if length(coalesce(p_bank_snapshot, '')) < 8 then
    raise exception 'Bank details required';
  end if;

  select count(*) into c24 from public.paragon_withdrawals
  where user_id = uid and created_at > now() - interval '24 hours'
    and status not in ('rejected', 'cancelled');
  if c24 >= coalesce(econ.max_withdrawals_per_24h, 2) then
    raise exception 'Withdrawal limit: max % per 24 hours', coalesce(econ.max_withdrawals_per_24h, 2);
  end if;

  select count(*) into c7 from public.paragon_withdrawals
  where user_id = uid and created_at > now() - interval '7 days'
    and status not in ('rejected', 'cancelled');
  if c7 >= coalesce(econ.max_withdrawals_per_7d, 5) then
    raise exception 'Withdrawal limit: max % per 7 days', coalesce(econ.max_withdrawals_per_7d, 5);
  end if;

  if p_idempotency_key is not null then
    select * into w from public.paragon_withdrawals
    where user_id = uid and idempotency_key = p_idempotency_key;
    if w.id is not null then return w; end if;
  end if;

  if p_coins >= coalesce(econ.withdraw_fee_coins_at_or_above, 10000) then
    fee := coalesce(econ.withdraw_fee_coins, 50);
  end if;
  payout := greatest(0, p_coins - fee);
  payout := round(payout * coalesce(econ.naira_per_coin_redeemable, 1.0));
  email := coalesce(auth.jwt() ->> 'email', '');

  perform public.paragon_coin_move_bucket(
    uid, p_coins, 'available', 'locked',
    'WITHDRAWAL_LOCK', 'withdrawal', null,
    coalesce(p_idempotency_key, 'wd-lock-' || gen_random_uuid()::text),
    jsonb_build_object('fee_coins', fee)
  );

  insert into public.paragon_withdrawals (
    user_id, user_email, coins, fee_coins, naira_payout,
    payout_account_id, bank_snapshot, status, idempotency_key
  ) values (
    uid, email, p_coins, fee, payout,
    p_payout_account_id, left(p_bank_snapshot, 500), 'locked', p_idempotency_key
  ) returning * into w;

  update public.paragon_coin_ledger_v2 set reference_id = w.id::text
  where user_id = uid and entry_type = 'WITHDRAWAL_LOCK' and reference_id is null
    and created_at > now() - interval '1 minute';

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (uid, 'withdrawal_requested', 'withdrawal', w.id::text,
          jsonb_build_object('coins', p_coins, 'fee', fee, 'naira', payout));

  return w;
end;
$$;
revoke all on function public.paragon_coin_request_withdrawal(integer, text, uuid, text) from public;
grant execute on function public.paragon_coin_request_withdrawal(integer, text, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Purchase confirm → bump liability + liquid (when team confirms payment)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_coin_confirm_payment_intent(
  p_intent_id uuid,
  p_team_note text default null
)
returns public.paragon_payment_intents
language plpgsql
security definer
set search_path = public
as $$
declare
  intent public.paragon_payment_intents;
begin
  if not public.paragon_is_team_member() then raise exception 'Team only'; end if;
  select * into intent from public.paragon_payment_intents where id = p_intent_id for update;
  if intent.id is null then raise exception 'Not found'; end if;
  if intent.status = 'confirmed' then return intent; end if;
  if intent.status not in ('claimed', 'awaiting_transfer', 'pending_verification', 'matched', 'manual_review') then
    raise exception 'Intent status % cannot confirm', intent.status;
  end if;

  perform public.paragon_coin_post_entry(
    intent.user_id,
    'PURCHASE_CREDIT',
    intent.coins,
    'available',
    'payment_intent',
    intent.id::text,
    intent.id::text,
    'purchase:' || intent.id::text,
    jsonb_build_object('naira', intent.naira, 'team_note', p_team_note)
  );

  -- Liability up; liquid reserve tracks coins issued against confirmed ₦ (1:1 model)
  perform public.paragon_platform_books_apply(
    intent.coins,  -- liability
    intent.coins,  -- liquid (mirrored until real bank cash ops separate)
    0, 0,
    'purchase confirm ' || intent.id::text
  );

  update public.paragon_payment_intents set
    status = 'confirmed',
    updated_at = now()
  where id = p_intent_id
  returning * into intent;

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), 'payment_intent_confirmed', 'payment_intent', intent.id::text,
          jsonb_build_object('coins', intent.coins, 'note', p_team_note));

  return intent;
end;
$$;
revoke all on function public.paragon_coin_confirm_payment_intent(uuid, text) from public;
grant execute on function public.paragon_coin_confirm_payment_intent(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Record competition fee into fee_revenue + 30% to reward_reserve
-- (callable after settle; also safe standalone)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_record_competition_fee_revenue(
  p_competition_id uuid,
  p_fee_coins integer
)
returns public.paragon_platform_books
language plpgsql
security definer
set search_path = public
as $$
declare
  econ public.paragon_economic_settings;
  to_reward int;
  b public.paragon_platform_books;
begin
  if not public.paragon_is_team_member()
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Team or service only';
  end if;
  if p_fee_coins is null or p_fee_coins <= 0 then
    return (select * from public.paragon_platform_books where id = 1);
  end if;
  select * into econ from public.paragon_economic_settings where id = 1;
  to_reward := greatest(0, round(p_fee_coins * coalesce(econ.fee_to_reward_reserve_bps, 3000) / 10000.0));
  b := public.paragon_platform_books_apply(
    0, 0, to_reward, p_fee_coins,
    'comp fee ' || coalesce(p_competition_id::text, '')
  );
  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (
    auth.uid(), 'competition_fee_books', 'competition', coalesce(p_competition_id::text, ''),
    jsonb_build_object('fee_coins', p_fee_coins, 'to_reward_reserve', to_reward, 'bps', econ.fee_to_reward_reserve_bps)
  );
  return b;
end;
$$;
revoke all on function public.paragon_record_competition_fee_revenue(uuid, integer) from public;
grant execute on function public.paragon_record_competition_fee_revenue(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Finance report snapshot (Team)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_finance_report_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  books public.paragon_platform_books;
  econ public.paragon_economic_settings;
  flags public.paragon_feature_flags;
  user_liability bigint;
  open_intents int;
  open_wd int;
  coverage numeric;
begin
  if not public.paragon_is_team_member()
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Team or service only';
  end if;

  select * into books from public.paragon_platform_books where id = 1;
  select * into econ from public.paragon_economic_settings where id = 1;
  select * into flags from public.paragon_feature_flags where id = 1;

  select coalesce(sum(available_coins + locked_coins + pending_coins + restricted_coins), 0)
    into user_liability from public.paragon_coin_accounts;

  select count(*) into open_intents from public.paragon_payment_intents
  where status in ('awaiting_transfer','claimed','pending_verification','matched','manual_review');

  select count(*) into open_wd from public.paragon_withdrawals
  where status in ('locked','pending_payout','processing');

  coverage := case when user_liability > 0
    then round((coalesce(books.liquid_reserve_coins, 0)::numeric / user_liability::numeric), 4)
    else null end;

  return jsonb_build_object(
    'checked_at', now(),
    'real_money_enabled', flags.real_money_enabled,
    'financial_pause', flags.financial_pause,
    'denomination', jsonb_build_object(
      'naira_per_coin_purchase', econ.naira_per_coin_purchase,
      'naira_per_coin_redeemable', econ.naira_per_coin_redeemable,
      'min_stake', econ.min_stake_coins,
      'max_stake', econ.max_stake_coins,
      'competition_fee_bps', econ.competition_fee_bps,
      'withdraw_fee_at_coins', econ.withdraw_fee_coins_at_or_above,
      'withdraw_fee_coins', econ.withdraw_fee_coins,
      'fee_to_reward_reserve_bps', econ.fee_to_reward_reserve_bps,
      'max_withdrawals_24h', econ.max_withdrawals_per_24h,
      'max_withdrawals_7d', econ.max_withdrawals_per_7d,
      'max_claims_24h', econ.max_payment_claims_per_24h
    ),
    'books', to_jsonb(books),
    'user_liability_coins_sum', user_liability,
    'reserve_coverage_ratio', coverage,
    'coverage_warning', case
      when coverage is not null and coverage < coalesce(econ.min_reserve_coverage_ratio, 1.0) then true
      else false end,
    'open_payment_intents', open_intents,
    'open_withdrawals', open_wd,
    'stage1_foundation', true
  );
end;
$$;
revoke all on function public.paragon_finance_report_snapshot() from public;
grant execute on function public.paragon_finance_report_snapshot() to authenticated;

-- Extend health
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
    'paragon_coin_accounts', to_regclass('public.paragon_coin_accounts') is not null,
    'paragon_coin_ledger_v2', to_regclass('public.paragon_coin_ledger_v2') is not null,
    'paragon_feature_flags', to_regclass('public.paragon_feature_flags') is not null,
    'paragon_economic_settings', to_regclass('public.paragon_economic_settings') is not null,
    'paragon_payment_intents', to_regclass('public.paragon_payment_intents') is not null,
    'paragon_payment_events', to_regclass('public.paragon_payment_events') is not null,
    'paragon_payment_matches', to_regclass('public.paragon_payment_matches') is not null,
    'paragon_platform_books', to_regclass('public.paragon_platform_books') is not null,
    'paragon_kyc_profiles', to_regclass('public.paragon_kyc_profiles') is not null,
    'paragon_competitions', to_regclass('public.paragon_competitions') is not null,
    'rpc_post_entry', to_regprocedure('public.paragon_coin_post_entry(uuid,text,integer,text,text,text,text,text,jsonb)') is not null,
    'rpc_finance_report', to_regprocedure('public.paragon_finance_report_snapshot()') is not null,
    'rpc_sql_health', true,
    'phase', 5,
    'stage1_hardening', to_regclass('public.paragon_platform_books') is not null,
    'preferred_payment_story', 'opay_moniepoint_bank_transfer_first',
    'real_money_default_off', true,
    'checked_at', now()
  );
  if to_regclass('public.paragon_feature_flags') is not null then
    result := result || jsonb_build_object(
      'flags', (select to_jsonb(f) - 'updated_by' from public.paragon_feature_flags f where id = 1)
    );
  end if;
  return result;
end;
$$;
revoke all on function public.paragon_sql_health() from public;
grant execute on function public.paragon_sql_health() to anon, authenticated;

-- DONE Stage 1 hardening. real_money stays OFF.
