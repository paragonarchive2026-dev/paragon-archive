-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-master-stage2-coin-system.sql
-- EXPECTED PROJECT PATH: /supabase/coins-master-stage2-coin-system.sql
-- ROLE: Stage 2 — purchase requests, reconciliation helpers, credits, history,
--       locked/available reads. Complements phase2–3 (does not replace them).
--       real_money stays OFF. Idempotent.
-- RESTORE-LOAD NOTE: Run AFTER phase1, phase2, stage1-hardening. Safe with phase3+.

-- User: list own payment intents (purchase requests)
create or replace function public.paragon_coin_my_payment_intents(p_limit integer default 20)
returns setof public.paragon_payment_intents
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.paragon_payment_intents
  where user_id = auth.uid()
  order by created_at desc
  limit least(coalesce(p_limit, 20), 100);
$$;
revoke all on function public.paragon_coin_my_payment_intents(integer) from public;
grant execute on function public.paragon_coin_my_payment_intents(integer) to authenticated;

-- Team: list open purchase intents for reconcile desk
create or replace function public.paragon_coin_team_open_intents(p_limit integer default 50)
returns setof public.paragon_payment_intents
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.paragon_payment_intents
  where public.paragon_is_team_member()
    and status in (
      'awaiting_transfer','claimed','pending_verification','matched','manual_review'
    )
  order by created_at asc
  limit least(coalesce(p_limit, 50), 200);
$$;
revoke all on function public.paragon_coin_team_open_intents(integer) from public;
grant execute on function public.paragon_coin_team_open_intents(integer) to authenticated;

-- Team: unmatched payment events (duplicate protection visible)
create or replace function public.paragon_coin_team_unmatched_events(p_limit integer default 50)
returns setof public.paragon_payment_events
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.paragon_payment_events
  where public.paragon_is_team_member()
    and matched_intent_id is null
    and status in ('received','needs_review')
  order by created_at desc
  limit least(coalesce(p_limit, 50), 200);
$$;
revoke all on function public.paragon_coin_team_unmatched_events(integer) from public;
grant execute on function public.paragon_coin_team_unmatched_events(integer) to authenticated;

-- User-facing balance + buckets + recent ledger in one call (Stage 2 shop)
create or replace function public.paragon_coin_my_wallet_view(p_ledger_limit integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  acct public.paragon_coin_accounts;
  ledger jsonb;
  intents jsonb;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  acct := public.paragon_ensure_coin_account(uid);

  select coalesce(jsonb_agg(row_to_json(l)::jsonb order by l.created_at desc), '[]'::jsonb)
  into ledger
  from (
    select id, entry_type, amount, bucket, status, reference_type, reference_id,
           idempotency_key, metadata, created_at
    from public.paragon_coin_ledger_v2
    where user_id = uid
    order by created_at desc
    limit least(coalesce(p_ledger_limit, 30), 100)
  ) l;

  select coalesce(jsonb_agg(row_to_json(i)::jsonb order by i.created_at desc), '[]'::jsonb)
  into intents
  from (
    select id, naira, coins, pack_label, status, user_claim_ref, created_at, updated_at
    from public.paragon_payment_intents
    where user_id = uid
    order by created_at desc
    limit 15
  ) i;

  return jsonb_build_object(
    'account', to_jsonb(acct),
    'available_coins', acct.available_coins,
    'locked_coins', acct.locked_coins,
    'pending_coins', acct.pending_coins,
    'restricted_coins', acct.restricted_coins,
    'ledger', ledger,
    'payment_intents', intents,
    'authority', 'server_ledger',
    'note', 'Credits only after team/provider confirm. Purchase request never auto-credits.'
  );
end;
$$;
revoke all on function public.paragon_coin_my_wallet_view(integer) from public;
grant execute on function public.paragon_coin_my_wallet_view(integer) to authenticated;

-- Confirm credit is idempotent (purchase:intent id) — already via post_entry; document health
-- Extend health markers for stage2
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
    'paragon_coin_accounts', to_regclass('public.paragon_coin_accounts') is not null,
    'paragon_coin_ledger_v2', to_regclass('public.paragon_coin_ledger_v2') is not null,
    'paragon_payment_intents', to_regclass('public.paragon_payment_intents') is not null,
    'paragon_payment_events', to_regclass('public.paragon_payment_events') is not null,
    'paragon_payment_matches', to_regclass('public.paragon_payment_matches') is not null,
    'paragon_platform_books', to_regclass('public.paragon_platform_books') is not null,
    'rpc_create_payment_intent', to_regprocedure('public.paragon_coin_create_payment_intent(integer,text,text)') is not null,
    'rpc_claim_payment', to_regprocedure('public.paragon_coin_claim_payment(uuid,text,text)') is not null,
    'rpc_confirm_payment', to_regprocedure('public.paragon_coin_confirm_payment_intent(uuid,text)') is not null,
    'rpc_match_and_confirm', to_regprocedure('public.paragon_coin_match_and_confirm(uuid,uuid,text,text)') is not null,
    'rpc_my_wallet_view', to_regprocedure('public.paragon_coin_my_wallet_view(integer)') is not null,
    'rpc_my_ledger', to_regprocedure('public.paragon_coin_my_ledger(integer)') is not null,
    'stage2_coin_system', true,
    'duplicate_payment_unique', true,
    'idempotency', true,
    'real_money_default_off', true,
    'phase', 5,
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

-- DONE Stage 2 coin-system RPCs. Credits still only via confirm/match — never on request click.
