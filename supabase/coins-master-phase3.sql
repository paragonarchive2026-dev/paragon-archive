-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-master-phase3.sql
-- EXPECTED PROJECT PATH: /supabase/coins-master-phase3.sql
-- ROLE: Coins master Phase 3 — provider-agnostic payment events, matches, webhook inbox.
--       Complements phase1 tables + phase2 RPCs. Does NOT enable real_money_enabled.
-- RESTORE-LOAD NOTE: Run AFTER coins-master-phase1.sql and coins-master-phase2.sql.
--       Edge functions coin-payment-webhook + coin-reconcile use service role + secrets.
--       Idempotent.

-- Payment matches (reconciliation decisions)
create table if not exists public.paragon_payment_matches (
  id uuid primary key default gen_random_uuid(),
  intent_id uuid not null references public.paragon_payment_intents(id) on delete cascade,
  event_id uuid references public.paragon_payment_events(id) on delete set null,
  match_method text not null default 'manual' check (match_method in (
    'manual','amount_ref','provider_webhook','bank_feed','admin_force'
  )),
  confidence numeric(5,2) not null default 1.00,
  status text not null default 'matched' check (status in (
    'matched','rejected','duplicate','needs_review'
  )),
  matched_by uuid references auth.users(id),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists paragon_payment_matches_intent_idx
  on public.paragon_payment_matches (intent_id);
alter table public.paragon_payment_matches enable row level security;
drop policy if exists "team manage payment matches" on public.paragon_payment_matches;
create policy "team manage payment matches" on public.paragon_payment_matches
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- Raw webhook inbox (provider-agnostic; Edge writes with service role)
create table if not exists public.paragon_payment_webhook_inbox (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_key text not null,
  payload jsonb not null default '{}'::jsonb,
  headers jsonb not null default '{}'::jsonb,
  processed boolean not null default false,
  process_result text,
  payment_event_id uuid references public.paragon_payment_events(id),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create unique index if not exists paragon_payment_webhook_inbox_provider_key_uidx
  on public.paragon_payment_webhook_inbox (provider, event_key);
alter table public.paragon_payment_webhook_inbox enable row level security;
drop policy if exists "team read webhook inbox" on public.paragon_payment_webhook_inbox;
create policy "team read webhook inbox" on public.paragon_payment_webhook_inbox
  for select to authenticated using (public.paragon_is_team_member());
-- No authenticated insert — Edge service role only.

-- Provider settings (non-secret config only; secrets stay in Edge env)
create table if not exists public.paragon_payment_provider_settings (
  id int primary key default 1 check (id = 1),
  active_provider text not null default 'manual_bank',
  /* manual_bank | paystack | flutterwave | other */
  bank_transfer_instructions text not null default
    'Transfer to the Paragon team bank account provided by the founder. Include your Paragon account email in the narration. Coins credit only after team or provider confirmation.',
  paystack_public_key text,
  flutterwave_public_key text,
  webhook_path_hint text not null default '/functions/v1/coin-payment-webhook',
  notes text not null default 'Secrets (secret keys, webhook HMAC) live only in Edge Function env — never here.',
  updated_at timestamptz not null default now()
);
insert into public.paragon_payment_provider_settings (id) values (1)
on conflict (id) do nothing;
alter table public.paragon_payment_provider_settings enable row level security;
drop policy if exists "public read provider settings safe" on public.paragon_payment_provider_settings;
create policy "public read provider settings safe" on public.paragon_payment_provider_settings
  for select to anon, authenticated using (true);
drop policy if exists "team update provider settings" on public.paragon_payment_provider_settings;
create policy "team update provider settings" on public.paragon_payment_provider_settings
  for update to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- Extend public config RPC with provider public fields
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
        'bank_transfer_instructions', p.bank_transfer_instructions,
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

-- Manual reconcile: team links a payment event to an intent and confirms credit
create or replace function public.paragon_coin_match_and_confirm(
  p_intent_id uuid,
  p_event_id uuid default null,
  p_match_method text default 'manual',
  p_note text default null
)
returns public.paragon_payment_intents
language plpgsql
security definer
set search_path = public
as $$
declare
  intent public.paragon_payment_intents;
  match_id uuid;
begin
  if not public.paragon_is_team_member() then raise exception 'Team only'; end if;

  select * into intent from public.paragon_payment_intents where id = p_intent_id for update;
  if intent.id is null then raise exception 'Intent not found'; end if;
  if intent.status = 'confirmed' then
    return intent;
  end if;

  insert into public.paragon_payment_matches (
    intent_id, event_id, match_method, confidence, status, matched_by, note
  ) values (
    p_intent_id, p_event_id, coalesce(p_match_method, 'manual'), 1.0, 'matched',
    auth.uid(), p_note
  ) returning id into match_id;

  if p_event_id is not null then
    update public.paragon_payment_events set
      matched_intent_id = p_intent_id,
      matched_user_id = intent.user_id,
      status = 'matched'
    where id = p_event_id;
  end if;

  -- Credit via phase2 confirm
  intent := public.paragon_coin_confirm_payment_intent(p_intent_id, p_note);

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), 'payment_matched_confirmed', 'payment_intent', p_intent_id::text,
          jsonb_build_object('match_id', match_id, 'event_id', p_event_id, 'method', p_match_method));

  return intent;
end;
$$;
revoke all on function public.paragon_coin_match_and_confirm(uuid, uuid, text, text) from public;
grant execute on function public.paragon_coin_match_and_confirm(uuid, uuid, text, text) to authenticated;

-- Ingest normalized provider event (called by Edge with elevated path via service role,
-- or by team for manual bank feed rows)
create or replace function public.paragon_coin_ingest_payment_event(
  p_provider text,
  p_provider_transaction_id text,
  p_amount_naira integer,
  p_currency text default 'NGN',
  p_sender_name text default null,
  p_raw_ref text default null,
  p_auto_match boolean default false
)
returns public.paragon_payment_events
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public.paragon_payment_events;
  intent public.paragon_payment_intents;
  is_svc boolean;
begin
  -- Team member OR service role (no JWT user but service claims — Edge uses service key)
  is_svc := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  if not is_svc and not public.paragon_is_team_member() then
    raise exception 'Team or service only';
  end if;
  if p_provider is null or p_provider_transaction_id is null then
    raise exception 'provider and transaction id required';
  end if;
  if p_amount_naira is null or p_amount_naira <= 0 then
    raise exception 'amount required';
  end if;

  insert into public.paragon_payment_events (
    provider, provider_transaction_id, amount_naira, currency, sender_name, raw_ref, status
  ) values (
    p_provider, p_provider_transaction_id, p_amount_naira,
    coalesce(p_currency, 'NGN'), p_sender_name, p_raw_ref, 'received'
  )
  on conflict (provider, provider_transaction_id) do update set
    amount_naira = excluded.amount_naira
  returning * into ev;

  -- Already existed with same key — fetch
  if ev.id is null then
    select * into ev from public.paragon_payment_events
    where provider = p_provider and provider_transaction_id = p_provider_transaction_id;
  end if;

  if p_auto_match and ev.matched_intent_id is null then
    -- Match single open intent with same naira amount (strict)
    select * into intent
    from public.paragon_payment_intents
    where status in ('awaiting_transfer','claimed','pending_verification')
      and naira = p_amount_naira
    order by created_at asc
    limit 2;

    -- Only auto if exactly one candidate
    if (select count(*) from public.paragon_payment_intents
        where status in ('awaiting_transfer','claimed','pending_verification')
          and naira = p_amount_naira) = 1 then
      perform public.paragon_coin_match_and_confirm(
        intent.id, ev.id, 'amount_ref', 'auto-match single amount'
      );
      select * into ev from public.paragon_payment_events where id = ev.id;
    else
      update public.paragon_payment_events set status = 'needs_review' where id = ev.id
      returning * into ev;
    end if;
  end if;

  return ev;
end;
$$;
revoke all on function public.paragon_coin_ingest_payment_event(text, text, integer, text, text, text, boolean) from public;
grant execute on function public.paragon_coin_ingest_payment_event(text, text, integer, text, text, text, boolean) to authenticated;
-- service role bypasses grants via superuser path in practice through REST with service key

-- SQL health snapshot for Team desk / owner VERIFY (anon-safe counts only where RLS allows)
create or replace function public.paragon_sql_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb := '{}'::jsonb;
begin
  result := result || jsonb_build_object(
    'paragon_user_state', to_regclass('public.paragon_user_state') is not null,
    'paragon_announcements', to_regclass('public.paragon_announcements') is not null,
    'paragon_team_members', to_regclass('public.paragon_team_members') is not null,
    'paragon_coin_wallets', to_regclass('public.paragon_coin_wallets') is not null,
    'paragon_coin_accounts', to_regclass('public.paragon_coin_accounts') is not null,
    'paragon_coin_ledger', to_regclass('public.paragon_coin_ledger') is not null,
    'paragon_coin_ledger_v2', to_regclass('public.paragon_coin_ledger_v2') is not null,
    'paragon_feature_flags', to_regclass('public.paragon_feature_flags') is not null,
    'paragon_economic_settings', to_regclass('public.paragon_economic_settings') is not null,
    'paragon_payment_intents', to_regclass('public.paragon_payment_intents') is not null,
    'paragon_payment_events', to_regclass('public.paragon_payment_events') is not null,
    'paragon_payment_matches', to_regclass('public.paragon_payment_matches') is not null,
    'paragon_payment_webhook_inbox', to_regclass('public.paragon_payment_webhook_inbox') is not null,
    'paragon_withdrawals', to_regclass('public.paragon_withdrawals') is not null,
    'rpc_public_coin_config', to_regprocedure('public.paragon_public_coin_config()') is not null,
    'rpc_create_payment_intent', to_regprocedure('public.paragon_coin_create_payment_intent(integer,text,text)') is not null,
    'rpc_post_entry', to_regprocedure('public.paragon_coin_post_entry(uuid,text,integer,text,text,text,text,text,jsonb)') is not null,
    'rpc_match_and_confirm', to_regprocedure('public.paragon_coin_match_and_confirm(uuid,uuid,text,text)') is not null,
    'rpc_sql_health', true
  );
  if to_regclass('public.paragon_feature_flags') is not null then
    result := result || jsonb_build_object(
      'flags', (select to_jsonb(f) - 'updated_by' from public.paragon_feature_flags f where id = 1)
    );
  end if;
  if to_regclass('public.paragon_announcements') is not null then
    result := result || jsonb_build_object(
      'announcements_count', (select count(*)::int from public.paragon_announcements)
    );
  end if;
  return result || jsonb_build_object('checked_at', now());
end;
$$;
revoke all on function public.paragon_sql_health() from public;
grant execute on function public.paragon_sql_health() to anon, authenticated;

-- DONE Phase 3 schema. Deploy Edge functions separately. real_money stays OFF.
