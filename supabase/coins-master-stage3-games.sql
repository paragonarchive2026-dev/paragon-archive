-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-master-stage3-games.sql
-- EXPECTED PROJECT PATH: /supabase/coins-master-stage3-games.sql
-- ROLE: Stage 3 — Games: 1v1 helpers, competitive points, anti-cheat foundations,
--       settle enhancements (fee→reward, points). Does NOT enable real_money or compete.
-- RESTORE-LOAD NOTE: Run AFTER coins-master-phase4.sql (+ stage1-hardening for fee books).
--       Idempotent. Browser never settles money.

-- ---------------------------------------------------------------------------
-- Competitive points (leaderboard eligibility — only from settled competitive play)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_competitive_points (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  period_id uuid references public.paragon_leaderboard_periods(id) on delete set null,
  competition_id uuid references public.paragon_competitions(id) on delete set null,
  points numeric not null default 0,
  reason text not null default 'competition',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists paragon_comp_points_user_idx
  on public.paragon_competitive_points (user_id, created_at desc);
create index if not exists paragon_comp_points_period_idx
  on public.paragon_competitive_points (period_id, points desc);
alter table public.paragon_competitive_points enable row level security;
drop policy if exists "users read own competitive points" on public.paragon_competitive_points;
create policy "users read own competitive points" on public.paragon_competitive_points
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "team read competitive points" on public.paragon_competitive_points;
create policy "team read competitive points" on public.paragon_competitive_points
  for select to authenticated using (public.paragon_is_team_member());
revoke insert, update, delete on public.paragon_competitive_points from authenticated, anon;

-- ---------------------------------------------------------------------------
-- Anti-cheat event log (foundations — team reviews; not auto-ban)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_anticheat_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  competition_id uuid references public.paragon_competitions(id) on delete set null,
  event_type text not null,
  severity text not null default 'low' check (severity in ('low','medium','high','critical')),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists paragon_anticheat_user_idx
  on public.paragon_anticheat_events (user_id, created_at desc);
alter table public.paragon_anticheat_events enable row level security;
drop policy if exists "team manage anticheat" on public.paragon_anticheat_events;
create policy "team manage anticheat" on public.paragon_anticheat_events
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

-- Raise risk flag + anticheat event (team or service)
create or replace function public.paragon_anticheat_flag(
  p_user_id uuid,
  p_flag_type text,
  p_severity text default 'medium',
  p_competition_id uuid default null,
  p_detail jsonb default '{}'::jsonb
)
returns public.paragon_risk_flags
language plpgsql
security definer
set search_path = public
as $$
declare
  f public.paragon_risk_flags;
  sev text := coalesce(nullif(trim(p_severity), ''), 'medium');
begin
  if not public.paragon_is_team_member()
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Team or service only';
  end if;
  if p_user_id is null then raise exception 'user required'; end if;
  if sev not in ('low','medium','high','critical') then sev := 'medium'; end if;

  insert into public.paragon_risk_flags (user_id, flag_type, severity, detail)
  values (p_user_id, left(coalesce(p_flag_type, 'manual'), 80), sev, coalesce(p_detail, '{}'::jsonb))
  returning * into f;

  insert into public.paragon_anticheat_events (
    user_id, competition_id, event_type, severity, detail
  ) values (
    p_user_id, p_competition_id, left(coalesce(p_flag_type, 'manual'), 80), sev,
    coalesce(p_detail, '{}'::jsonb)
  );

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (
    auth.uid(), 'anticheat_flag', 'user', p_user_id::text,
    jsonb_build_object('flag_type', p_flag_type, 'severity', sev, 'competition_id', p_competition_id)
  );
  return f;
end;
$$;
revoke all on function public.paragon_anticheat_flag(uuid, text, text, uuid, jsonb) from public;
grant execute on function public.paragon_anticheat_flag(uuid, text, text, uuid, jsonb) to authenticated;

-- Velocity / collusion foundation check before stake (advisory only unless blocked)
create or replace function public.paragon_competition_preflight_check(p_user_id uuid default auth.uid())
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := coalesce(p_user_id, auth.uid());
  open_flags int;
  comps_24h int;
  wins_24h int;
  warnings jsonb := '[]'::jsonb;
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  select count(*) into open_flags from public.paragon_risk_flags
  where user_id = uid and status = 'open' and severity in ('high','critical');

  select count(*) into comps_24h from public.paragon_competition_participants p
  join public.paragon_competitions c on c.id = p.competition_id
  where p.user_id = uid and p.joined_at > now() - interval '24 hours';

  select count(*) into wins_24h from public.paragon_competition_participants
  where user_id = uid and result = 'win' and joined_at > now() - interval '24 hours';

  if open_flags > 0 then
    warnings := warnings || jsonb_build_array(jsonb_build_object(
      'code', 'open_high_risk_flags', 'count', open_flags, 'block_stake', true
    ));
  end if;
  if comps_24h >= 40 then
    warnings := warnings || jsonb_build_array(jsonb_build_object(
      'code', 'high_match_velocity', 'count', comps_24h, 'block_stake', false
    ));
  end if;
  if wins_24h >= 25 and comps_24h >= 30 then
    warnings := warnings || jsonb_build_array(jsonb_build_object(
      'code', 'win_velocity_review', 'wins', wins_24h, 'matches', comps_24h, 'block_stake', false
    ));
  end if;

  return jsonb_build_object(
    'user_id', uid,
    'open_high_risk_flags', open_flags,
    'competitions_24h', comps_24h,
    'wins_24h', wins_24h,
    'warnings', warnings,
    'allow_stake', open_flags = 0
  );
end;
$$;
revoke all on function public.paragon_competition_preflight_check(uuid) from public;
grant execute on function public.paragon_competition_preflight_check(uuid) to authenticated;

-- Award competitive points (server only)
create or replace function public.paragon_competition_award_points(
  p_user_id uuid,
  p_points numeric,
  p_competition_id uuid default null,
  p_period_id uuid default null,
  p_reason text default 'competition_win'
)
returns public.paragon_competitive_points
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.paragon_competitive_points;
  period uuid;
begin
  if not public.paragon_is_team_member()
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Team or service only';
  end if;
  if p_user_id is null or p_points is null then raise exception 'user and points required'; end if;

  period := p_period_id;
  if period is null then
    select id into period from public.paragon_leaderboard_periods
    where status = 'open' order by starts_at desc nulls last limit 1;
  end if;

  insert into public.paragon_competitive_points (
    user_id, period_id, competition_id, points, reason
  ) values (
    p_user_id, period, p_competition_id, p_points, left(coalesce(p_reason, 'competition'), 80)
  ) returning * into row;

  -- Upsert leaderboard entry for open period
  if period is not null then
    insert into public.paragon_leaderboard_entries (period_id, user_id, points, eligible)
    values (period, p_user_id, p_points, true)
    on conflict (period_id, user_id) do update set
      points = public.paragon_leaderboard_entries.points + excluded.points;
  end if;

  return row;
end;
$$;
revoke all on function public.paragon_competition_award_points(uuid, numeric, uuid, uuid, text) from public;
grant execute on function public.paragon_competition_award_points(uuid, numeric, uuid, uuid, text) to authenticated;

-- User: list my 1v1 competitions
create or replace function public.paragon_competition_my_list(p_limit integer default 20)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rows jsonb;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc), '[]'::jsonb) into rows
  from (
    select c.id, c.game_key, c.status, c.stake_coins, c.fee_coins, c.pool_coins, c.created_at,
           p.result, p.stake_coins as my_stake
    from public.paragon_competition_participants p
    join public.paragon_competitions c on c.id = p.competition_id
    where p.user_id = uid
    order by c.created_at desc
    limit least(coalesce(p_limit, 20), 50)
  ) x;
  return jsonb_build_object(
    'matches', rows,
    'preflight', public.paragon_competition_preflight_check(uid),
    'note', 'Money outcomes only via team/service settle — never client winner claims.'
  );
end;
$$;
revoke all on function public.paragon_competition_my_list(integer) from public;
grant execute on function public.paragon_competition_my_list(integer) to authenticated;

-- Open challenges waiting for a second player (same game_key optional filter)
create or replace function public.paragon_competition_open_challenges(
  p_game_key text default null,
  p_limit integer default 20
)
returns setof public.paragon_competitions
language sql
stable
security definer
set search_path = public
as $$
  select c.*
  from public.paragon_competitions c
  where c.status in ('CREATED','STAKE_PENDING')
    and (p_game_key is null or c.game_key = p_game_key)
    and (
      select count(*) from public.paragon_competition_participants p
      where p.competition_id = c.id
    ) = 1
  order by c.created_at asc
  limit least(coalesce(p_limit, 20), 50);
$$;
revoke all on function public.paragon_competition_open_challenges(text, integer) from public;
grant execute on function public.paragon_competition_open_challenges(text, integer) to authenticated;

-- Harden create with preflight block on high risk
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
  pre jsonb;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into flags from public.paragon_feature_flags where id = 1;
  select * into econ from public.paragon_economic_settings where id = 1;
  if flags.financial_pause then raise exception 'Financial operations paused'; end if;
  if flags.real_money_enabled and not flags.compete_enabled then
    raise exception 'Compete disabled';
  end if;
  -- Free-play path: allow creating practice challenge records only when compete off and real_money off
  -- Stakes still lock coins if user has them; when real_money off this is soft economy practice.
  if p_stake_coins < coalesce(econ.min_stake_coins, 100)
     or p_stake_coins > coalesce(econ.max_stake_coins, 10000) then
    raise exception 'Stake out of range (100–10000)';
  end if;

  pre := public.paragon_competition_preflight_check(uid);
  if coalesce((pre->>'allow_stake')::boolean, true) is not true then
    raise exception 'Stake blocked by risk review (open high/critical flags)';
  end if;

  fee := greatest(0, round(p_stake_coins * 2 * coalesce(econ.competition_fee_bps, 500) / 10000.0));
  pool := p_stake_coins * 2;

  insert into public.paragon_competitions (
    game_key, status, stake_coins, fee_coins, pool_coins, metadata
  ) values (
    coalesce(nullif(trim(p_game_key), ''), '1v1'),
    'CREATED', p_stake_coins, fee, pool,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'creator', uid,
      'fee_bps', coalesce(econ.competition_fee_bps, 500),
      'mode', '1v1'
    )
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
    update public.paragon_competitions set
      metadata = metadata || jsonb_build_object('invited', p_opponent)
    where id = c.id returning * into c;
  end if;

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (uid, 'competition_created', 'competition', c.id::text,
          jsonb_build_object('stake', p_stake_coins, 'fee', fee, 'game_key', c.game_key));

  return c;
end;
$$;
revoke all on function public.paragon_competition_create(text, integer, uuid, jsonb) from public;
grant execute on function public.paragon_competition_create(text, integer, uuid, jsonb) to authenticated;

-- Enhanced settle: points + fee books (wraps same outcomes)
create or replace function public.paragon_competition_settle(
  p_competition_id uuid,
  p_outcome text,
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
  loser uuid;
  win_points numeric := 10;
  part_points numeric := 2;
begin
  is_team := public.paragon_is_team_member();
  if not is_team and coalesce(auth.jwt() ->> 'role','') <> 'service_role' then
    raise exception 'Team or service only — client cannot settle money';
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
    for part in select * from public.paragon_competition_participants where competition_id = c.id
    loop
      perform public.paragon_coin_post_entry(
        part.user_id, 'GAME_STAKE_RELEASE', -part.stake_coins, 'locked',
        'competition', c.id::text, p_correlation_id,
        'settle-release:' || c.id::text || ':' || part.user_id::text,
        jsonb_build_object('outcome', p_outcome)
      );
      update public.paragon_competition_participants set
        result = case when part.user_id = p_winner_user_id then 'win' else 'loss' end
      where id = part.id;
      if part.user_id <> p_winner_user_id then loser := part.user_id; end if;
    end loop;
    perform public.paragon_coin_post_entry(
      p_winner_user_id, 'GAME_WIN', payout, 'available',
      'competition', c.id::text, p_correlation_id,
      'settle-win:' || c.id::text,
      jsonb_build_object('fee_coins', fee, 'pool', c.pool_coins)
    );
    if fee > 0 then
      insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
      values (auth.uid(), 'competition_fee', 'competition', c.id::text,
              jsonb_build_object('fee_coins', fee));
      begin
        perform public.paragon_record_competition_fee_revenue(c.id, fee);
      exception when undefined_function then
        null;
      end;
    end if;
    -- Competitive points: win 10, participate 2 (loser)
    begin
      perform public.paragon_competition_award_points(
        p_winner_user_id, win_points, c.id, null, 'competition_win'
      );
      if loser is not null then
        perform public.paragon_competition_award_points(
          loser, part_points, c.id, null, 'competition_participate'
        );
      end if;
    exception when others then
      null; -- points table may lag
    end;
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
      if p_outcome = 'settled_draw' then
        begin
          perform public.paragon_competition_award_points(
            part.user_id, part_points, c.id, null, 'competition_draw'
          );
        exception when others then null;
        end;
      end if;
    end loop;
    update public.paragon_competitions set
      status = case when p_outcome = 'voided' then 'VOIDED' else 'SETTLED' end
    where id = c.id;
    payout := 0;
    fee := case when p_outcome = 'voided' then 0 else fee end;
    -- void: no fee kept; draw: fee already calculated at create — return full stakes, fee not taken from users on draw/void path above
    fee := 0;

  else
    raise exception 'Unknown outcome % (use settled_win | settled_draw | voided)', p_outcome;
  end if;

  insert into public.paragon_competition_settlements (
    competition_id, winner_user_id, pool_coins, fee_coins, payout_coins,
    outcome, correlation_id, settled_by
  ) values (
    c.id, p_winner_user_id, c.pool_coins, fee, payout,
    p_outcome, p_correlation_id, auth.uid()
  ) returning * into s;

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), 'competition_settled', 'competition', c.id::text,
          jsonb_build_object('outcome', p_outcome, 'winner', p_winner_user_id, 'payout', payout, 'fee', fee));

  return s;
end;
$$;
revoke all on function public.paragon_competition_settle(uuid, text, uuid, text) from public;
grant execute on function public.paragon_competition_settle(uuid, text, uuid, text) to authenticated;

-- Health markers
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
    'paragon_competitions', to_regclass('public.paragon_competitions') is not null,
    'paragon_competition_participants', to_regclass('public.paragon_competition_participants') is not null,
    'paragon_competition_settlements', to_regclass('public.paragon_competition_settlements') is not null,
    'paragon_competitive_points', to_regclass('public.paragon_competitive_points') is not null,
    'paragon_anticheat_events', to_regclass('public.paragon_anticheat_events') is not null,
    'paragon_risk_flags', to_regclass('public.paragon_risk_flags') is not null,
    'rpc_competition_create', to_regprocedure('public.paragon_competition_create(text,integer,uuid,jsonb)') is not null,
    'rpc_competition_join', to_regprocedure('public.paragon_competition_join(uuid,text)') is not null,
    'rpc_competition_settle', to_regprocedure('public.paragon_competition_settle(uuid,text,uuid,text)') is not null,
    'rpc_competition_preflight', to_regprocedure('public.paragon_competition_preflight_check(uuid)') is not null,
    'stage3_games', true,
    'fee_model', '5_percent_pool_bps_500',
    'settle_authority', 'team_or_service_only',
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

-- DONE Stage 3 games foundations. Client never settles. Free play unchanged.
