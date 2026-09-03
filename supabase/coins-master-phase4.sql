-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-master-phase4.sql
-- EXPECTED PROJECT PATH: /supabase/coins-master-phase4.sql
-- ROLE: Coins master Phase 4 — competition settle, leaderboard periods/rewards,
--       creator prizes, financial cases, risk flags, velocity, emergency helpers.
-- RESTORE-LOAD NOTE: Run AFTER coins-master-phase1..3.sql. real_money stays OFF by default.
--       Idempotent.

-- ---------------------------------------------------------------------------
-- Competition participants + settlements (extends phase1 competitions stub)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_competition_participants (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.paragon_competitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stake_coins integer not null default 0 check (stake_coins >= 0),
  result text check (result is null or result in ('win','loss','draw','void','pending')),
  score numeric,
  joined_at timestamptz not null default now(),
  unique (competition_id, user_id)
);
create index if not exists paragon_comp_part_user_idx
  on public.paragon_competition_participants (user_id, joined_at desc);
alter table public.paragon_competition_participants enable row level security;
drop policy if exists "users read own competition seats" on public.paragon_competition_participants;
create policy "users read own competition seats" on public.paragon_competition_participants
  for select to authenticated
  using ((select auth.uid()) = user_id or public.paragon_is_team_member());
drop policy if exists "team write competition seats" on public.paragon_competition_participants;
create policy "team write competition seats" on public.paragon_competition_participants
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

create table if not exists public.paragon_competition_settlements (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.paragon_competitions(id) on delete cascade,
  winner_user_id uuid references auth.users(id),
  pool_coins integer not null default 0,
  fee_coins integer not null default 0,
  payout_coins integer not null default 0,
  outcome text not null check (outcome in ('settled_win','settled_draw','voided','manual')),
  correlation_id text,
  settled_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.paragon_competition_settlements enable row level security;
drop policy if exists "auth read settlements" on public.paragon_competition_settlements;
create policy "auth read settlements" on public.paragon_competition_settlements
  for select to authenticated using (true);
drop policy if exists "team write settlements" on public.paragon_competition_settlements;
create policy "team write settlements" on public.paragon_competition_settlements
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- Leaderboard entries
create table if not exists public.paragon_leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.paragon_leaderboard_periods(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  points numeric not null default 0,
  rank integer,
  eligible boolean not null default true,
  reward_coins integer not null default 0,
  rewarded boolean not null default false,
  unique (period_id, user_id)
);
alter table public.paragon_leaderboard_entries enable row level security;
drop policy if exists "public read leaderboard entries" on public.paragon_leaderboard_entries;
create policy "public read leaderboard entries" on public.paragon_leaderboard_entries
  for select to anon, authenticated using (true);
drop policy if exists "team write leaderboard entries" on public.paragon_leaderboard_entries;
create policy "team write leaderboard entries" on public.paragon_leaderboard_entries
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- Creator prizes
create table if not exists public.paragon_creator_prizes (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  quiz_key text not null,
  prize_coins integer not null check (prize_coins > 0),
  status text not null default 'locked' check (status in (
    'locked','open','awarded','refunded','cancelled'
  )),
  winner_user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.paragon_creator_prizes enable row level security;
drop policy if exists "users read creator prizes" on public.paragon_creator_prizes;
create policy "users read creator prizes" on public.paragon_creator_prizes
  for select to authenticated using (true);
drop policy if exists "users create own prizes" on public.paragon_creator_prizes;
create policy "users create own prizes" on public.paragon_creator_prizes
  for insert to authenticated with check ((select auth.uid()) = creator_id);
drop policy if exists "team manage creator prizes" on public.paragon_creator_prizes;
create policy "team manage creator prizes" on public.paragon_creator_prizes
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- Financial cases / disputes
create table if not exists public.paragon_financial_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_type text not null check (case_type in (
    'payment','withdrawal','competition','leaderboard','fraud','appeal','other'
  )),
  reference_type text,
  reference_id text,
  status text not null default 'open' check (status in (
    'open','investigating','resolved','rejected','escalated'
  )),
  summary text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id)
);
alter table public.paragon_financial_cases enable row level security;
drop policy if exists "users manage own cases" on public.paragon_financial_cases;
create policy "users manage own cases" on public.paragon_financial_cases
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "team manage financial cases" on public.paragon_financial_cases;
create policy "team manage financial cases" on public.paragon_financial_cases
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- Risk flags
create table if not exists public.paragon_risk_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flag_type text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','cleared','confirmed')),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  cleared_at timestamptz,
  cleared_by uuid references auth.users(id)
);
alter table public.paragon_risk_flags enable row level security;
drop policy if exists "team manage risk flags" on public.paragon_risk_flags;
create policy "team manage risk flags" on public.paragon_risk_flags
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());
drop policy if exists "users read own risk flags" on public.paragon_risk_flags;
create policy "users read own risk flags" on public.paragon_risk_flags
  for select to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Create 1v1 competition + lock both stakes (team or system path)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_competition_create(
  p_game_key text,
  p_stake_coins integer,
  p_opponent uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.paragon_competitions
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  flags public.paragon_feature_flags;
  econ public.paragon_economic_settings;
  fee int;
  pool int;
  c public.paragon_competitions;
  idem text;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into flags from public.paragon_feature_flags where id = 1;
  select * into econ from public.paragon_economic_settings where id = 1;
  if flags.financial_pause then raise exception 'Financial operations paused'; end if;
  if flags.real_money_enabled and not flags.compete_enabled then
    raise exception 'Compete disabled';
  end if;
  if p_stake_coins < coalesce(econ.min_stake_coins, 100)
     or p_stake_coins > coalesce(econ.max_stake_coins, 10000) then
    raise exception 'Stake out of range';
  end if;

  fee := greatest(0, round(p_stake_coins * 2 * coalesce(econ.competition_fee_bps, 500) / 10000.0));
  pool := p_stake_coins * 2;

  insert into public.paragon_competitions (
    game_key, status, stake_coins, fee_coins, pool_coins, metadata
  ) values (
    p_game_key, 'CREATED', p_stake_coins, fee, pool,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('creator', uid)
  ) returning * into c;

  idem := 'comp-join:' || c.id::text || ':' || uid::text;
  perform public.paragon_coin_move_bucket(
    uid, p_stake_coins, 'available', 'locked',
    'GAME_STAKE_LOCK', 'competition', c.id::text, idem, '{}'::jsonb
  );

  insert into public.paragon_competition_participants (
    competition_id, user_id, stake_coins, result
  ) values (c.id, uid, p_stake_coins, 'pending');

  update public.paragon_competitions set status = 'STAKE_PENDING' where id = c.id
  returning * into c;

  if p_opponent is not null and p_opponent <> uid then
    -- opponent must call join separately (do not lock their coins here)
    update public.paragon_competitions set
      metadata = metadata || jsonb_build_object('invited', p_opponent)
    where id = c.id returning * into c;
  end if;

  return c;
end;
$$;
revoke all on function public.paragon_competition_create(text, integer, uuid, jsonb) from public;
grant execute on function public.paragon_competition_create(text, integer, uuid, jsonb) to authenticated;

create or replace function public.paragon_competition_join(
  p_competition_id uuid,
  p_idempotency_key text default null
)
returns public.paragon_competitions
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  c public.paragon_competitions;
  seats int;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into c from public.paragon_competitions where id = p_competition_id for update;
  if c.id is null then raise exception 'Competition not found'; end if;
  if c.status not in ('CREATED','STAKE_PENDING') then
    raise exception 'Competition not joinable';
  end if;
  if exists (select 1 from public.paragon_competition_participants where competition_id = c.id and user_id = uid) then
    return c;
  end if;

  perform public.paragon_coin_move_bucket(
    uid, c.stake_coins, 'available', 'locked',
    'GAME_STAKE_LOCK', 'competition', c.id::text,
    coalesce(p_idempotency_key, 'comp-join:' || c.id::text || ':' || uid::text),
    '{}'::jsonb
  );

  insert into public.paragon_competition_participants (competition_id, user_id, stake_coins, result)
  values (c.id, uid, c.stake_coins, 'pending');

  select count(*) into seats from public.paragon_competition_participants where competition_id = c.id;
  update public.paragon_competitions set
    status = case when seats >= 2 then 'STAKES_LOCKED' else 'STAKE_PENDING' end
  where id = c.id
  returning * into c;

  if c.status = 'STAKES_LOCKED' then
    update public.paragon_competitions set status = 'READY' where id = c.id returning * into c;
  end if;
  return c;
end;
$$;
revoke all on function public.paragon_competition_join(uuid, text) from public;
grant execute on function public.paragon_competition_join(uuid, text) to authenticated;

-- Settle: winner takes pool minus fee; draw/void returns stakes
create or replace function public.paragon_competition_settle(
  p_competition_id uuid,
  p_outcome text, -- settled_win | settled_draw | voided
  p_winner_user_id uuid default null,
  p_correlation_id text default null
)
returns public.paragon_competition_settlements
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.paragon_competitions;
  s public.paragon_competition_settlements;
  part record;
  fee int;
  payout int;
  is_team boolean;
begin
  is_team := public.paragon_is_team_member();
  -- For now only team may settle (server Edge will use service role / team JWT)
  if not is_team and coalesce(auth.jwt() ->> 'role','') <> 'service_role' then
    raise exception 'Team or service only';
  end if;

  select * into c from public.paragon_competitions where id = p_competition_id for update;
  if c.id is null then raise exception 'Not found'; end if;
  if c.status in ('SETTLED','VOIDED','CANCELLED') then
    select * into s from public.paragon_competition_settlements
    where competition_id = c.id order by created_at desc limit 1;
    if s.id is not null then return s; end if;
  end if;

  fee := coalesce(c.fee_coins, 0);
  payout := greatest(0, coalesce(c.pool_coins, 0) - fee);

  if p_outcome = 'settled_win' then
    if p_winner_user_id is null then raise exception 'Winner required'; end if;
    -- Unlock loser stake into fee/pool accounting: debit locked for all, credit winner available
    for part in select * from public.paragon_competition_participants where competition_id = c.id
    loop
      -- remove locked stake
      perform public.paragon_coin_post_entry(
        part.user_id, 'GAME_STAKE_RELEASE', -part.stake_coins, 'locked',
        'competition', c.id::text, p_correlation_id,
        'settle-release:' || c.id::text || ':' || part.user_id::text,
        jsonb_build_object('outcome', p_outcome)
      );
      update public.paragon_competition_participants set
        result = case when part.user_id = p_winner_user_id then 'win' else 'loss' end
      where id = part.id;
    end loop;
    perform public.paragon_coin_post_entry(
      p_winner_user_id, 'GAME_WIN', payout, 'available',
      'competition', c.id::text, p_correlation_id,
      'settle-win:' || c.id::text,
      jsonb_build_object('fee_coins', fee, 'pool', c.pool_coins)
    );
    if fee > 0 then
      -- platform fee is coins leaving player balances (already removed from locked; not credited to a user)
      insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
      values (auth.uid(), 'competition_fee', 'competition', c.id::text,
              jsonb_build_object('fee_coins', fee));
    end if;
    update public.paragon_competitions set status = 'SETTLED' where id = c.id;

  elsif p_outcome in ('settled_draw','voided') then
    for part in select * from public.paragon_competition_participants where competition_id = c.id
    loop
      perform public.paragon_coin_move_bucket(
        part.user_id, part.stake_coins, 'locked', 'available',
        case when p_outcome = 'voided' then 'GAME_VOID_REFUND' else 'GAME_STAKE_RELEASE' end,
        'competition', c.id::text,
        'settle-return:' || c.id::text || ':' || part.user_id::text,
        jsonb_build_object('outcome', p_outcome)
      );
      update public.paragon_competition_participants set
        result = case when p_outcome = 'voided' then 'void' else 'draw' end
      where id = part.id;
    end loop;
    update public.paragon_competitions set
      status = case when p_outcome = 'voided' then 'VOIDED' else 'SETTLED' end
    where id = c.id;
    payout := 0; fee := 0;

  else
    raise exception 'Unknown outcome %', p_outcome;
  end if;

  insert into public.paragon_competition_settlements (
    competition_id, winner_user_id, pool_coins, fee_coins, payout_coins,
    outcome, correlation_id, settled_by
  ) values (
    c.id, p_winner_user_id, c.pool_coins, fee, payout,
    p_outcome, p_correlation_id, auth.uid()
  ) returning * into s;

  return s;
end;
$$;
revoke all on function public.paragon_competition_settle(uuid, text, uuid, text) from public;
grant execute on function public.paragon_competition_settle(uuid, text, uuid, text) to authenticated;

-- Creator prize lock
create or replace function public.paragon_creator_prize_lock(
  p_quiz_key text,
  p_prize_coins integer,
  p_idempotency_key text default null
)
returns public.paragon_creator_prizes
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  p public.paragon_creator_prizes;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if p_prize_coins is null or p_prize_coins <= 0 then raise exception 'Prize required'; end if;
  perform public.paragon_coin_move_bucket(
    uid, p_prize_coins, 'available', 'locked',
    'CREATOR_PRIZE_LOCK', 'creator_prize', p_quiz_key,
    coalesce(p_idempotency_key, 'prize:' || uid::text || ':' || p_quiz_key),
    '{}'::jsonb
  );
  insert into public.paragon_creator_prizes (creator_id, quiz_key, prize_coins, status)
  values (uid, p_quiz_key, p_prize_coins, 'locked')
  returning * into p;
  return p;
end;
$$;
revoke all on function public.paragon_creator_prize_lock(text, integer, text) from public;
grant execute on function public.paragon_creator_prize_lock(text, integer, text) to authenticated;

create or replace function public.paragon_creator_prize_award(
  p_prize_id uuid,
  p_winner_user_id uuid
)
returns public.paragon_creator_prizes
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.paragon_creator_prizes;
begin
  if not public.paragon_is_team_member() and coalesce(auth.jwt() ->> 'role','') <> 'service_role' then
    raise exception 'Team or service only';
  end if;
  select * into p from public.paragon_creator_prizes where id = p_prize_id for update;
  if p.id is null then raise exception 'Not found'; end if;
  if p.status = 'awarded' then return p; end if;
  if p_winner_user_id = p.creator_id then
    raise exception 'Creator cannot win own prize';
  end if;
  -- release creator lock
  perform public.paragon_coin_post_entry(
    p.creator_id, 'CREATOR_PRIZE_LOCK', -p.prize_coins, 'locked',
    'creator_prize', p.id::text, null,
    'prize-release:' || p.id::text, '{}'::jsonb
  );
  perform public.paragon_coin_post_entry(
    p_winner_user_id, 'GAME_WIN', p.prize_coins, 'available',
    'creator_prize', p.id::text, null,
    'prize-award:' || p.id::text, jsonb_build_object('quiz_key', p.quiz_key)
  );
  update public.paragon_creator_prizes set
    status = 'awarded', winner_user_id = p_winner_user_id, resolved_at = now()
  where id = p.id returning * into p;
  return p;
end;
$$;
revoke all on function public.paragon_creator_prize_award(uuid, uuid) from public;
grant execute on function public.paragon_creator_prize_award(uuid, uuid) to authenticated;

-- Leaderboard period settle (top 10 shares of pool)
create or replace function public.paragon_leaderboard_settle_period(
  p_period_id uuid
)
returns public.paragon_leaderboard_periods
language plpgsql
security definer
set search_path = public
as $$
declare
  per public.paragon_leaderboard_periods;
  shares int[] := array[30,20,15,10,7,5,4,3,2,4]; -- sum 100
  rec record;
  rnk int := 0;
  reward int;
  pool int;
begin
  if not public.paragon_is_team_member() and coalesce(auth.jwt() ->> 'role','') <> 'service_role' then
    raise exception 'Team or service only';
  end if;
  select * into per from public.paragon_leaderboard_periods where id = p_period_id for update;
  if per.id is null then raise exception 'Period not found'; end if;
  if per.status = 'settled' then return per; end if;

  pool := coalesce(per.prize_pool_coins, 0);
  update public.paragon_leaderboard_periods set status = 'closed' where id = per.id;

  for rec in
    select * from public.paragon_leaderboard_entries
    where period_id = per.id and eligible = true
    order by points desc, user_id
    limit 10
  loop
    rnk := rnk + 1;
    reward := case when pool > 0 then floor(pool * shares[rnk] / 100.0) else 0 end;
    update public.paragon_leaderboard_entries set
      rank = rnk, reward_coins = reward
    where id = rec.id;
    if reward > 0 and not rec.rewarded then
      perform public.paragon_coin_post_entry(
        rec.user_id, 'LEADERBOARD_REWARD', reward, 'available',
        'leaderboard_period', per.id::text, null,
        'lb-reward:' || per.id::text || ':' || rec.user_id::text,
        jsonb_build_object('rank', rnk)
      );
      update public.paragon_leaderboard_entries set rewarded = true where id = rec.id;
    end if;
  end loop;

  update public.paragon_leaderboard_periods set status = 'settled' where id = per.id
  returning * into per;
  return per;
end;
$$;
revoke all on function public.paragon_leaderboard_settle_period(uuid) from public;
grant execute on function public.paragon_leaderboard_settle_period(uuid) to authenticated;

-- Emergency financial pause toggle (team)
create or replace function public.paragon_set_financial_pause(p_paused boolean)
returns public.paragon_feature_flags
language plpgsql
security definer
set search_path = public
as $$
declare f public.paragon_feature_flags;
begin
  if not public.paragon_is_team_member() then raise exception 'Team only'; end if;
  update public.paragon_feature_flags set
    financial_pause = coalesce(p_paused, true),
    updated_at = now(),
    updated_by = auth.uid()
  where id = 1
  returning * into f;
  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), 'financial_pause', 'feature_flags', '1',
          jsonb_build_object('paused', p_paused));
  return f;
end;
$$;
revoke all on function public.paragon_set_financial_pause(boolean) from public;
grant execute on function public.paragon_set_financial_pause(boolean) to authenticated;

-- Open financial case from user
create or replace function public.paragon_open_financial_case(
  p_case_type text,
  p_summary text,
  p_reference_type text default null,
  p_reference_id text default null,
  p_detail jsonb default '{}'::jsonb
)
returns public.paragon_financial_cases
language plpgsql
security definer
set search_path = public
as $$
declare c public.paragon_financial_cases;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if p_summary is null or length(trim(p_summary)) < 5 then
    raise exception 'Summary required';
  end if;
  insert into public.paragon_financial_cases (
    user_id, case_type, reference_type, reference_id, summary, detail
  ) values (
    auth.uid(), p_case_type, p_reference_type, p_reference_id,
    left(p_summary, 500), coalesce(p_detail, '{}'::jsonb)
  ) returning * into c;
  return c;
end;
$$;
revoke all on function public.paragon_open_financial_case(text, text, text, text, jsonb) from public;
grant execute on function public.paragon_open_financial_case(text, text, text, text, jsonb) to authenticated;

-- Extend health RPC
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
    'paragon_competitions', to_regclass('public.paragon_competitions') is not null,
    'paragon_competition_participants', to_regclass('public.paragon_competition_participants') is not null,
    'paragon_competition_settlements', to_regclass('public.paragon_competition_settlements') is not null,
    'paragon_leaderboard_periods', to_regclass('public.paragon_leaderboard_periods') is not null,
    'paragon_leaderboard_entries', to_regclass('public.paragon_leaderboard_entries') is not null,
    'paragon_creator_prizes', to_regclass('public.paragon_creator_prizes') is not null,
    'paragon_financial_cases', to_regclass('public.paragon_financial_cases') is not null,
    'paragon_risk_flags', to_regclass('public.paragon_risk_flags') is not null,
    'rpc_competition_settle', to_regprocedure('public.paragon_competition_settle(uuid,text,uuid,text)') is not null,
    'rpc_leaderboard_settle', to_regprocedure('public.paragon_leaderboard_settle_period(uuid)') is not null,
    'rpc_sql_health', true,
    'phase', 4,
    'checked_at', now()
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
  return result;
end;
$$;
revoke all on function public.paragon_sql_health() from public;
grant execute on function public.paragon_sql_health() to anon, authenticated;

-- DONE Phase 4. Free play unaffected. Compete RPCs gated by flags when real_money on.
