-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-master-phase2.sql
-- EXPECTED PROJECT PATH: /supabase/coins-master-phase2.sql
-- ROLE: Coins master Phase 2 — authority RPCs on multi-bucket accounts + ledger_v2.
--       Completes money-moving paths from PARAGON-COINS-MASTER-BUILD-SPEC (no provider yet).
-- RESTORE-LOAD NOTE: Run AFTER coins-schema.sql AND coins-master-phase1.sql.
--       real_money_enabled stays FALSE until owner flips it after provider + compliance.
--       Idempotent.

-- Ensure phase1 helpers exist (no-op if already present)
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

-- ---------------------------------------------------------------------------
-- Core: post ledger entry + mutate one bucket (never direct client balance edit)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_coin_post_entry(
  p_user uuid,
  p_entry_type text,
  p_amount integer,          -- signed: + credit bucket, - debit bucket
  p_bucket text default 'available',
  p_reference_type text default null,
  p_reference_id text default null,
  p_correlation_id text default null,
  p_idempotency_key text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.paragon_coin_ledger_v2
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.paragon_coin_accounts;
  e public.paragon_coin_ledger_v2;
  new_avail int;
  new_locked int;
  new_pending int;
  new_restricted int;
begin
  if p_user is null then raise exception 'user required'; end if;
  if p_amount = 0 then raise exception 'amount must be non-zero'; end if;
  if p_bucket not in ('available','locked','pending','restricted') then
    raise exception 'invalid bucket';
  end if;

  -- Idempotency
  if p_idempotency_key is not null then
    select * into e from public.paragon_coin_ledger_v2
    where user_id = p_user and idempotency_key = p_idempotency_key;
    if e.id is not null then return e; end if;
  end if;

  -- Pause check
  if exists (select 1 from public.paragon_feature_flags f where f.id = 1 and f.financial_pause = true) then
    raise exception 'Financial operations paused';
  end if;

  perform public.paragon_ensure_coin_account(p_user);
  select * into a from public.paragon_coin_accounts where user_id = p_user for update;
  if a.status = 'closed' then raise exception 'Account closed'; end if;

  new_avail := a.available_coins;
  new_locked := a.locked_coins;
  new_pending := a.pending_coins;
  new_restricted := a.restricted_coins;

  if p_bucket = 'available' then new_avail := new_avail + p_amount;
  elsif p_bucket = 'locked' then new_locked := new_locked + p_amount;
  elsif p_bucket = 'pending' then new_pending := new_pending + p_amount;
  else new_restricted := new_restricted + p_amount;
  end if;

  if new_avail < 0 or new_locked < 0 or new_pending < 0 or new_restricted < 0 then
    raise exception 'Insufficient coins in bucket %', p_bucket;
  end if;

  update public.paragon_coin_accounts set
    available_coins = new_avail,
    locked_coins = new_locked,
    pending_coins = new_pending,
    restricted_coins = new_restricted,
    updated_at = now()
  where user_id = p_user;

  insert into public.paragon_coin_ledger_v2 (
    user_id, entry_type, amount, bucket, status,
    reference_type, reference_id, correlation_id, idempotency_key, metadata, created_by
  ) values (
    p_user, p_entry_type, p_amount, p_bucket, 'posted',
    p_reference_type, p_reference_id, p_correlation_id, p_idempotency_key,
    coalesce(p_metadata, '{}'::jsonb), auth.uid()
  ) returning * into e;

  -- Mirror into legacy wallet balance (available only) when table exists
  begin
    insert into public.paragon_coin_wallets (user_id, balance, updated_at)
    values (p_user, greatest(new_avail, 0), now())
    on conflict (user_id) do update set
      balance = greatest(new_avail, 0),
      updated_at = now();
  exception when undefined_table then
    null;
  end;

  return e;
end;
$$;
revoke all on function public.paragon_coin_post_entry(uuid, text, integer, text, text, text, text, text, jsonb) from public;
-- Not granted to clients directly — only via higher-level RPCs.

-- ---------------------------------------------------------------------------
-- Move between buckets (lock / unlock) — same total coins
-- ---------------------------------------------------------------------------
create or replace function public.paragon_coin_move_bucket(
  p_user uuid,
  p_amount integer,
  p_from text,
  p_to text,
  p_entry_type text,
  p_reference_type text default null,
  p_reference_id text default null,
  p_idempotency_key text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if p_from = p_to then raise exception 'from/to must differ'; end if;
  perform public.paragon_coin_post_entry(
    p_user, p_entry_type, -p_amount, p_from,
    p_reference_type, p_reference_id, null,
    case when p_idempotency_key is null then null else p_idempotency_key || ':debit' end,
    p_metadata
  );
  perform public.paragon_coin_post_entry(
    p_user, p_entry_type, p_amount, p_to,
    p_reference_type, p_reference_id, null,
    case when p_idempotency_key is null then null else p_idempotency_key || ':credit' end,
    p_metadata
  );
  return true;
end;
$$;
revoke all on function public.paragon_coin_move_bucket(uuid, integer, text, text, text, text, text, text, jsonb) from public;

-- ---------------------------------------------------------------------------
-- User: create payment intent (purchase request) — does NOT credit coins
-- ---------------------------------------------------------------------------
create or replace function public.paragon_coin_create_payment_intent(
  p_naira integer,
  p_idempotency_key text default null,
  p_pack_label text default null
)
returns public.paragon_payment_intents
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  flags public.paragon_feature_flags;
  econ public.paragon_economic_settings;
  coins int;
  intent public.paragon_payment_intents;
  email text;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into flags from public.paragon_feature_flags where id = 1;
  select * into econ from public.paragon_economic_settings where id = 1;
  if flags.financial_pause then raise exception 'Financial operations paused'; end if;
  -- Purchases may be requested even when real_money_enabled is false (manual team path),
  -- but only if purchases_enabled OR real_money is still off (manual review queue).
  if flags.real_money_enabled and not flags.purchases_enabled then
    raise exception 'Purchases disabled';
  end if;
  if p_naira is null or p_naira < coalesce(econ.min_purchase_naira, 500) then
    raise exception 'Below minimum purchase';
  end if;

  if p_idempotency_key is not null then
    select * into intent from public.paragon_payment_intents
    where user_id = uid and idempotency_key = p_idempotency_key;
    if intent.id is not null then return intent; end if;
  end if;

  coins := round(p_naira * coalesce(econ.naira_per_coin_purchase, 1.0));
  email := coalesce(auth.jwt() ->> 'email', '');

  insert into public.paragon_payment_intents (
    user_id, user_email, naira, coins, pack_label, status, idempotency_key
  ) values (
    uid, email, p_naira, coins, p_pack_label, 'awaiting_transfer', p_idempotency_key
  ) returning * into intent;

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (uid, 'payment_intent_created', 'payment_intent', intent.id::text,
          jsonb_build_object('naira', p_naira, 'coins', coins));

  return intent;
end;
$$;
revoke all on function public.paragon_coin_create_payment_intent(integer, text, text) from public;
grant execute on function public.paragon_coin_create_payment_intent(integer, text, text) to authenticated;

-- User claims they paid (hint only — never auto-credits)
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
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  update public.paragon_payment_intents set
    status = 'claimed',
    user_claim_ref = left(coalesce(p_claim_ref, ''), 200),
    user_claim_note = left(coalesce(p_claim_note, ''), 500),
    updated_at = now()
  where id = p_intent_id and user_id = auth.uid()
    and status in ('awaiting_transfer', 'created', 'claimed')
  returning * into intent;
  if intent.id is null then raise exception 'Intent not found or not claimable'; end if;
  return intent;
end;
$$;
revoke all on function public.paragon_coin_claim_payment(uuid, text, text) from public;
grant execute on function public.paragon_coin_claim_payment(uuid, text, text) to authenticated;

-- Team: confirm payment intent → credit AVAILABLE (ledger)
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
-- Withdrawals: request (locks coins) → team pay / reject
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
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into flags from public.paragon_feature_flags where id = 1;
  select * into econ from public.paragon_economic_settings where id = 1;
  if flags.financial_pause then raise exception 'Financial operations paused'; end if;
  -- Allow queueing withdrawal requests for manual path even if real_money off,
  -- but block if withdrawals_enabled is explicitly false while real_money on.
  if flags.real_money_enabled and not flags.withdrawals_enabled then
    raise exception 'Withdrawals disabled';
  end if;
  if p_coins is null or p_coins < coalesce(econ.min_withdraw_coins, 500) then
    raise exception 'Below minimum withdrawal';
  end if;
  if length(coalesce(p_bank_snapshot, '')) < 8 then
    raise exception 'Bank details required';
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
  -- redeemable ₦ per coin
  payout := round(payout * coalesce(econ.naira_per_coin_redeemable, 1.0));
  email := coalesce(auth.jwt() ->> 'email', '');

  -- Lock full coin amount from available
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

  -- fix reference id on lock was null — acceptable; settlement uses withdrawal id
  update public.paragon_coin_ledger_v2 set reference_id = w.id::text
  where user_id = uid and entry_type = 'WITHDRAWAL_LOCK' and reference_id is null
    and created_at > now() - interval '1 minute';

  return w;
end;
$$;
revoke all on function public.paragon_coin_request_withdrawal(integer, text, uuid, text) from public;
grant execute on function public.paragon_coin_request_withdrawal(integer, text, uuid, text) to authenticated;

create or replace function public.paragon_coin_complete_withdrawal_v2(
  p_id uuid,
  p_team_note text default null
)
returns public.paragon_withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.paragon_withdrawals;
begin
  if not public.paragon_is_team_member() then raise exception 'Team only'; end if;
  select * into w from public.paragon_withdrawals where id = p_id for update;
  if w.id is null then raise exception 'Not found'; end if;
  if w.status = 'paid' then return w; end if;
  if w.status not in ('locked', 'requested', 'review', 'approved', 'paying') then
    raise exception 'Cannot complete status %', w.status;
  end if;

  -- Settle locked coins out of the system
  perform public.paragon_coin_post_entry(
    w.user_id, 'WITHDRAWAL_SETTLED', -w.coins, 'locked',
    'withdrawal', w.id::text, w.id::text,
    'wd-settle:' || w.id::text,
    jsonb_build_object('naira_payout', w.naira_payout, 'fee_coins', w.fee_coins)
  );
  if w.fee_coins > 0 then
    -- fee already included in locked amount; record fee type for audit (0 net if already settled)
    insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
    values (auth.uid(), 'withdrawal_fee_noted', 'withdrawal', w.id::text,
            jsonb_build_object('fee_coins', w.fee_coins));
  end if;

  update public.paragon_withdrawals set
    status = 'paid',
    team_note = coalesce(p_team_note, team_note),
    resolved_at = now(),
    resolved_by = auth.uid()
  where id = p_id
  returning * into w;

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), 'withdrawal_paid', 'withdrawal', w.id::text,
          jsonb_build_object('coins', w.coins, 'naira', w.naira_payout));

  return w;
end;
$$;
revoke all on function public.paragon_coin_complete_withdrawal_v2(uuid, text) from public;
grant execute on function public.paragon_coin_complete_withdrawal_v2(uuid, text) to authenticated;

create or replace function public.paragon_coin_reject_withdrawal_v2(
  p_id uuid,
  p_team_note text default null
)
returns public.paragon_withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.paragon_withdrawals;
begin
  if not public.paragon_is_team_member() then raise exception 'Team only'; end if;
  select * into w from public.paragon_withdrawals where id = p_id for update;
  if w.id is null then raise exception 'Not found'; end if;
  if w.status = 'paid' then raise exception 'Already paid'; end if;
  if w.status in ('locked', 'requested', 'review', 'approved') then
    -- return locked → available
    perform public.paragon_coin_move_bucket(
      w.user_id, w.coins, 'locked', 'available',
      'WITHDRAWAL_REVERSAL', 'withdrawal', w.id::text,
      'wd-reject:' || w.id::text,
      jsonb_build_object('note', p_team_note)
    );
  end if;
  update public.paragon_withdrawals set
    status = 'rejected',
    team_note = coalesce(p_team_note, team_note),
    resolved_at = now(),
    resolved_by = auth.uid()
  where id = p_id
  returning * into w;
  return w;
end;
$$;
revoke all on function public.paragon_coin_reject_withdrawal_v2(uuid, text) from public;
grant execute on function public.paragon_coin_reject_withdrawal_v2(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin adjustment (ledger only — never silent balance edit)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_coin_admin_adjust(
  p_user uuid,
  p_amount integer,
  p_reason text,
  p_bucket text default 'available'
)
returns public.paragon_coin_ledger_v2
language plpgsql
security definer
set search_path = public
as $$
declare e public.paragon_coin_ledger_v2;
begin
  if not public.paragon_is_team_member() then raise exception 'Team only'; end if;
  if p_reason is null or length(trim(p_reason)) < 5 then
    raise exception 'Reason required (min 5 chars)';
  end if;
  e := public.paragon_coin_post_entry(
    p_user, 'ADMIN_ADJUSTMENT', p_amount, p_bucket,
    'admin', null, null,
    'admin-adj:' || p_user::text || ':' || gen_random_uuid()::text,
    jsonb_build_object('reason', p_reason)
  );
  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), 'admin_adjustment', 'user', p_user::text,
          jsonb_build_object('amount', p_amount, 'bucket', p_bucket, 'reason', p_reason));
  return e;
end;
$$;
revoke all on function public.paragon_coin_admin_adjust(uuid, integer, text, text) from public;
grant execute on function public.paragon_coin_admin_adjust(uuid, integer, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Read helpers for FE (display cache only)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_coin_my_account()
returns public.paragon_coin_accounts
language plpgsql
security definer
set search_path = public
as $$
declare a public.paragon_coin_accounts;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  a := public.paragon_ensure_coin_account(auth.uid());
  return a;
end;
$$;
revoke all on function public.paragon_coin_my_account() from public;
grant execute on function public.paragon_coin_my_account() to authenticated;

create or replace function public.paragon_coin_my_ledger(p_limit integer default 50)
returns setof public.paragon_coin_ledger_v2
language sql
stable
security definer
set search_path = public
as $$
  select * from public.paragon_coin_ledger_v2
  where user_id = auth.uid()
  order by created_at desc
  limit least(coalesce(p_limit, 50), 200);
$$;
revoke all on function public.paragon_coin_my_ledger(integer) from public;
grant execute on function public.paragon_coin_my_ledger(integer) to authenticated;

-- Competition lock stake (structure for later game engine)
create or replace function public.paragon_coin_lock_stake(
  p_competition_id uuid,
  p_stake integer,
  p_idempotency_key text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare flags public.paragon_feature_flags;
declare econ public.paragon_economic_settings;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into flags from public.paragon_feature_flags where id = 1;
  select * into econ from public.paragon_economic_settings where id = 1;
  if not flags.compete_enabled and flags.real_money_enabled then
    raise exception 'Compete disabled';
  end if;
  if p_stake < coalesce(econ.min_stake_coins, 100) or p_stake > coalesce(econ.max_stake_coins, 10000) then
    raise exception 'Stake out of range';
  end if;
  perform public.paragon_coin_move_bucket(
    auth.uid(), p_stake, 'available', 'locked',
    'GAME_STAKE_LOCK', 'competition', p_competition_id::text,
    p_idempotency_key,
    '{}'::jsonb
  );
  return true;
end;
$$;
revoke all on function public.paragon_coin_lock_stake(uuid, integer, text) from public;
grant execute on function public.paragon_coin_lock_stake(uuid, integer, text) to authenticated;

-- DONE Phase 2. Provider webhooks + Edge functions remain owner Phase 3.
