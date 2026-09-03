-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: leaderboards-schema.sql
-- EXPECTED PROJECT PATH: /supabase/leaderboards-schema.sql
-- ROLE: STAGE 5 — LEADERBOARDS backend (P-099 / D-207): weekly leaderboard periods, eligible
--       entries, realized competition fees (fund the reward pool), reward issuance records,
--       an append-only settlement audit, and the server-controlled economic settings that
--       mirror PARAGON-COINS-MASTER-BUILD-SPEC.md §11/§12 (30% revenue-funded pool, the
--       top-3 + ranks-4-10 distribution table, performance-based scoring, min stake).
-- RESTORE-LOAD NOTE: The device engine (paragon-leaderboards.js + the Team desk settlement
--       module) is the working layer TODAY. Run this SQL ONCE in the Supabase SQL editor
--       when the betting/competition stage lands and the leaderboard-settle Edge Function
--       is deployed — it is idempotent (ON CONFLICT / IF NOT EXISTS) and safe to re-run.
--       It does NOT activate anything by itself; nothing here fabricates points or money.

-- 0. Team membership gate (shared with announcements-schema.sql; safe if that ran already).
create table if not exists public.paragon_team_members (
  email text primary key,
  role text not null default 'founder',
  added_at timestamptz not null default now()
);
insert into public.paragon_team_members (email, role)
values ('paragon.archive.2026@gmail.com', 'founder')
on conflict (email) do nothing;

-- 1. Leaderboard periods — one row per Monday-starting week (D-013 convention).
create table if not exists public.paragon_leaderboards (
  period_key text primary key,              -- 'YYYY-MM-DD' = the Monday of the week
  starts_at date not null,
  ends_at date not null,                    -- exclusive end (next Monday)
  state text not null default 'running' check (state in
    ('running','closed','review','final','prizes','credited')),
  pool_coins bigint not null default 0 check (pool_coins >= 0),
  frozen_json jsonb,                        -- frozen standings snapshot (period close)
  final_json jsonb,                         -- final ranking after anti-abuse review
  prizes_json jsonb,                        -- calculated top-10 prize rows
  closed_at timestamptz,
  finalized_at timestamptz,
  credited_at timestamptz,
  credited_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Eligible leaderboard entries — ONE row per eligible BET result. The client engine never
--    writes here; the server-authoritative competition engine / leaderboard-settle function
--    inserts via the service role. Points are performance-based only (stake proves eligibility,
--    never size); creator self-play rows are rejected before they reach this table.
create table if not exists public.paragon_leaderboard_entries (
  id text primary key,
  period_key text not null references public.paragon_leaderboards(period_key) on delete cascade,
  user_email text not null,
  display_name text not null default '',
  game_type text not null,
  result_ref text not null default '',
  mode text not null default 'bet' check (mode = 'bet'),   -- free play NEVER awards points
  stake_coins integer not null check (stake_coins >= 1),
  fee_coins integer not null default 0 check (fee_coins >= 0),
  perf jsonb not null default '{}'::jsonb,
  points integer not null check (points > 0),
  flags jsonb not null default '[]'::jsonb,  -- advisory risk signals (rapid-fire, repeated-opponent...)
  status text not null default 'active' check (status in ('active','disqualified')),
  review_note text not null default '',
  reviewed_by text,
  recorded_at timestamptz not null default now(),
  unique (user_email, result_ref)
);
create index if not exists paragon_leaderboard_entries_period_idx
  on public.paragon_leaderboard_entries (period_key);

-- 3. Realized competition fees — the ONLY funding source of the weekly reward pool.
create table if not exists public.paragon_competition_fees (
  id text primary key,
  period_key text not null references public.paragon_leaderboards(period_key) on delete cascade,
  competition_ref text not null default '',
  game_type text not null,
  fee_coins integer not null check (fee_coins > 0),
  realized_at timestamptz not null default now(),
  recorded_at timestamptz not null default now()
);

-- 4. Reward issuance records (the settlement ledger entries; credits reach balances through
--    the same approval -> credit-mirror flow the device engine already uses).
create table if not exists public.paragon_rewards (
  id text primary key,
  period_key text not null references public.paragon_leaderboards(period_key) on delete cascade,
  rank integer not null check (rank between 1 and 10),
  user_email text not null,
  display_name text not null default '',
  share_pct numeric not null check (share_pct > 0),
  coins bigint not null check (coins > 0),
  status text not null default 'pending' check (status in ('pending','credited')),
  credited_at timestamptz,
  credited_by text,
  created_at timestamptz not null default now(),
  unique (period_key, rank)
);

-- 5. Append-only settlement audit trail.
create table if not exists public.paragon_leaderboard_audit (
  id bigint generated always as identity primary key,
  period_key text not null default '',
  actor text not null default '',
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

-- 6. Server-controlled economic settings — the live copy of the device CONFIG defaults.
create table if not exists public.paragon_economic_settings (
  key text primary key,
  value jsonb not null,
  note text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.paragon_economic_settings (key, value, note) values
  ('reward_pool_share', '0.30'::jsonb, '30% of eligible realized competition-fee revenue funds the weekly pool (spec §12).'),
  ('leaderboard_distribution', '[30,20,15,10,7,5,4,3,2,4]'::jsonb, 'Rank shares in % for #1..#10 (top 3 + ranks 4-10); total must equal 100 (spec §12).'),
  ('min_bet_stake_coins', '1'::jsonb, 'Minimum stake for leaderboard eligibility (spec §5.3).'),
  ('scoring_rules', '{"quiz":{"mode":"accuracyPct"}}'::jsonb, 'Performance-only scoring per game type; stake size NEVER multiplies points (spec §11.2).'),
  ('leaderboards_enabled', 'false'::jsonb, 'Feature flag: flipped true when the betting stage and settlement function are live.')
on conflict (key) do nothing;

-- 7. Row Level Security.
alter table public.paragon_leaderboards enable row level security;
alter table public.paragon_leaderboard_entries enable row level security;
alter table public.paragon_competition_fees enable row level security;
alter table public.paragon_rewards enable row level security;
alter table public.paragon_leaderboard_audit enable row level security;
alter table public.paragon_economic_settings enable row level security;

-- Public: read period/state metadata + the server-controlled economic settings.
drop policy if exists "public read leaderboard periods" on public.paragon_leaderboards;
create policy "public read leaderboard periods" on public.paragon_leaderboards
  for select to anon, authenticated
  using (true);
drop policy if exists "public read economic settings" on public.paragon_economic_settings;
create policy "public read economic settings" on public.paragon_economic_settings
  for select to anon, authenticated
  using (true);

-- Users: see only their OWN entries and their OWN reward records.
drop policy if exists "owner read own entries" on public.paragon_leaderboard_entries;
create policy "owner read own entries" on public.paragon_leaderboard_entries
  for select to authenticated
  using (lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "owner read own rewards" on public.paragon_rewards;
create policy "owner read own rewards" on public.paragon_rewards
  for select to authenticated
  using (lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')) and status = 'credited');

-- Team: full management (settlement desk + future sync) for signed-in team members.
drop policy if exists "team manage leaderboards" on public.paragon_leaderboards;
create policy "team manage leaderboards" on public.paragon_leaderboards
  for all to authenticated
  using (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))))
  with check (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))));
drop policy if exists "team manage entries" on public.paragon_leaderboard_entries;
create policy "team manage entries" on public.paragon_leaderboard_entries
  for all to authenticated
  using (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))))
  with check (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))));
drop policy if exists "team manage fees" on public.paragon_competition_fees;
create policy "team manage fees" on public.paragon_competition_fees
  for all to authenticated
  using (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))))
  with check (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))));
drop policy if exists "team manage rewards" on public.paragon_rewards;
create policy "team manage rewards" on public.paragon_rewards
  for all to authenticated
  using (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))))
  with check (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))));
-- Audit is append-only for the team: SELECT + INSERT policies only, no update/delete.
drop policy if exists "team read audit" on public.paragon_leaderboard_audit;
create policy "team read audit" on public.paragon_leaderboard_audit
  for select to authenticated
  using (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))));
drop policy if exists "team append audit" on public.paragon_leaderboard_audit;
create policy "team append audit" on public.paragon_leaderboard_audit
  for insert to authenticated
  with check (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))));
drop policy if exists "team manage economic settings" on public.paragon_economic_settings;
create policy "team manage economic settings" on public.paragon_economic_settings
  for all to authenticated
  using (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))))
  with check (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))));

-- 8. Public weekly standings RPC (security definer): display names + points + rank only —
--    emails never leave the server. Callable by anon/authenticated once the backend is live.
create or replace function public.paragon_leaderboard_standings(target_period text)
returns table (rank bigint, display_name text, points bigint, plays bigint)
language sql stable security definer set search_path = public as $$
  with eligible as (
    select e.user_email, e.display_name,
           sum(e.points)::bigint as points, count(*)::bigint as plays
    from public.paragon_leaderboard_entries e
    where e.period_key = target_period and e.status = 'active'
    group by e.user_email, e.display_name
  )
  select row_number() over (order by points desc, plays asc, display_name asc)::bigint as rank,
         display_name, points, plays
  from eligible
  order by points desc, plays asc, display_name asc;
$$;
grant execute on function public.paragon_leaderboard_standings(text) to anon, authenticated;

-- 9. Timestamp trigger keeps updated_at truthful.
create or replace function public.paragon_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists paragon_leaderboards_touch on public.paragon_leaderboards;
create trigger paragon_leaderboards_touch
  before update on public.paragon_leaderboards
  for each row execute function public.paragon_touch_updated_at();
drop trigger if exists paragon_economic_settings_touch on public.paragon_economic_settings;
create trigger paragon_economic_settings_touch
  before update on public.paragon_economic_settings
  for each row execute function public.paragon_touch_updated_at();

-- Done. After running (when the betting stage lands):
--   * the leaderboard-settle Edge Function (spec §50) drives periods through the state flow;
--   * team rewards mark paragon_rewards.status = 'credited' and the credit mirror pays users;
--   * paragon_economic_settings overrides replace the placeholder numbers in one pass.
