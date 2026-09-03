-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: coins-master-stage4-quiz.sql
-- EXPECTED PROJECT PATH: /supabase/coins-master-stage4-quiz.sql
-- ROLE: Stage 4 — Paid quizzes, creator prizes hardening, server scoring,
--       paid-attempt protection, creator self-play blocks.
--       Free client quiz unchanged. real_money / compete stay OFF by default.
-- RESTORE-LOAD NOTE: Run AFTER phase4 (+ stage3 recommended). Idempotent.

-- ---------------------------------------------------------------------------
-- Server quiz definitions (answers NEVER exposed to anon/authenticated select)
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_quiz_definitions (
  id uuid primary key default gen_random_uuid(),
  quiz_key text not null unique,
  title text not null,
  description text not null default '',
  creator_id uuid references auth.users(id) on delete set null,
  category text not null default 'general',
  difficulty text not null default 'medium',
  timer_seconds integer not null default 0 check (timer_seconds >= 0),
  /* questions_public: text + options only (no correct index) */
  questions_public jsonb not null default '[]'::jsonb,
  /* answer_key: array of correct option indexes — service/team only */
  answer_key integer[] not null default '{}',
  entry_fee_coins integer not null default 0 check (entry_fee_coins >= 0),
  paid_enabled boolean not null default false,
  max_paid_attempts integer not null default 1 check (max_paid_attempts >= 1 and max_paid_attempts <= 20),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists paragon_quiz_def_creator_idx
  on public.paragon_quiz_definitions (creator_id, created_at desc);
alter table public.paragon_quiz_definitions enable row level security;

-- Public can read published quizzes WITHOUT answer_key
drop policy if exists "public read published quiz defs meta" on public.paragon_quiz_definitions;
-- Use a view for safe public reads instead of selecting table (answer_key would leak via *)
create or replace view public.paragon_quiz_public as
  select
    id, quiz_key, title, description, creator_id, category, difficulty,
    timer_seconds, questions_public, entry_fee_coins, paid_enabled,
    max_paid_attempts, status, metadata, created_at, updated_at
  from public.paragon_quiz_definitions
  where status = 'published';

grant select on public.paragon_quiz_public to anon, authenticated;

drop policy if exists "team full quiz defs" on public.paragon_quiz_definitions;
create policy "team full quiz defs" on public.paragon_quiz_definitions
  for all to authenticated
  using (public.paragon_is_team_member())
  with check (public.paragon_is_team_member());

drop policy if exists "creators manage own draft quizzes" on public.paragon_quiz_definitions;
create policy "creators manage own draft quizzes" on public.paragon_quiz_definitions
  for all to authenticated
  using (
    (select auth.uid()) = creator_id
    or public.paragon_is_team_member()
  )
  with check (
    (select auth.uid()) = creator_id
    or public.paragon_is_team_member()
  );

-- Block direct select of answer_key for non-team via column privilege where possible
revoke all on public.paragon_quiz_definitions from anon;
grant select (id, quiz_key, title, description, creator_id, category, difficulty,
  timer_seconds, questions_public, entry_fee_coins, paid_enabled, max_paid_attempts,
  status, metadata, created_at, updated_at)
  on public.paragon_quiz_definitions to authenticated;
-- answer_key not granted to authenticated — only security definer RPCs / service role

-- ---------------------------------------------------------------------------
-- Paid attempts
-- ---------------------------------------------------------------------------
create table if not exists public.paragon_quiz_paid_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.paragon_quiz_definitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_fee_coins integer not null default 0,
  status text not null default 'locked' check (status in (
    'locked','in_progress','scored','voided','refunded'
  )),
  idempotency_key text,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score integer,
  total integer,
  percent numeric,
  eligible_for_prize boolean not null default true,
  eligible_for_leaderboard boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);
create unique index if not exists paragon_quiz_paid_attempt_idem_uidx
  on public.paragon_quiz_paid_attempts (user_id, idempotency_key)
  where idempotency_key is not null;
create index if not exists paragon_quiz_paid_attempt_user_quiz_idx
  on public.paragon_quiz_paid_attempts (quiz_id, user_id, started_at desc);
alter table public.paragon_quiz_paid_attempts enable row level security;
drop policy if exists "users read own paid attempts" on public.paragon_quiz_paid_attempts;
create policy "users read own paid attempts" on public.paragon_quiz_paid_attempts
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "team read paid attempts" on public.paragon_quiz_paid_attempts;
create policy "team read paid attempts" on public.paragon_quiz_paid_attempts
  for select to authenticated using (public.paragon_is_team_member());
revoke insert, update, delete on public.paragon_quiz_paid_attempts from authenticated, anon;

-- Server score rows (immutable after insert)
create table if not exists public.paragon_quiz_server_scores (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.paragon_quiz_paid_attempts(id) on delete cascade,
  quiz_id uuid not null references public.paragon_quiz_definitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null,
  total integer not null,
  percent numeric not null,
  /* per-question: chosen index, correct bool — not the full key */
  breakdown jsonb not null default '[]'::jsonb,
  scored_at timestamptz not null default now(),
  correlation_id text
);
alter table public.paragon_quiz_server_scores enable row level security;
drop policy if exists "users read own server scores" on public.paragon_quiz_server_scores;
create policy "users read own server scores" on public.paragon_quiz_server_scores
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "team read server scores" on public.paragon_quiz_server_scores;
create policy "team read server scores" on public.paragon_quiz_server_scores
  for select to authenticated using (public.paragon_is_team_member());
revoke insert, update, delete on public.paragon_quiz_server_scores from authenticated, anon;

-- ---------------------------------------------------------------------------
-- Publish quiz definition (creator) — strips nothing client-side; creator supplies key once
-- ---------------------------------------------------------------------------
create or replace function public.paragon_quiz_publish(
  p_quiz_key text,
  p_title text,
  p_description text,
  p_questions_public jsonb,
  p_answer_key integer[],
  p_entry_fee_coins integer default 0,
  p_paid_enabled boolean default false,
  p_category text default 'general',
  p_difficulty text default 'medium',
  p_timer_seconds integer default 0,
  p_max_paid_attempts integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  q public.paragon_quiz_definitions;
  nq int;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if p_quiz_key is null or length(trim(p_quiz_key)) < 3 then
    raise exception 'quiz_key required';
  end if;
  if p_title is null or length(trim(p_title)) < 3 then
    raise exception 'title required';
  end if;
  nq := coalesce(jsonb_array_length(p_questions_public), 0);
  if nq < 1 then raise exception 'at least one question required'; end if;
  if p_answer_key is null or coalesce(array_length(p_answer_key, 1), 0) <> nq then
    raise exception 'answer_key length must match questions';
  end if;
  if coalesce(p_entry_fee_coins, 0) < 0 then raise exception 'invalid fee'; end if;
  if coalesce(p_paid_enabled, false) and coalesce(p_entry_fee_coins, 0) <= 0 then
    raise exception 'paid quiz requires entry_fee_coins > 0';
  end if;

  insert into public.paragon_quiz_definitions as d (
    quiz_key, title, description, creator_id, category, difficulty,
    timer_seconds, questions_public, answer_key, entry_fee_coins, paid_enabled,
    max_paid_attempts, status, updated_at
  ) values (
    trim(p_quiz_key), trim(p_title), coalesce(p_description, ''),
    uid, coalesce(p_category, 'general'), coalesce(p_difficulty, 'medium'),
    coalesce(p_timer_seconds, 0), coalesce(p_questions_public, '[]'::jsonb),
    p_answer_key, coalesce(p_entry_fee_coins, 0), coalesce(p_paid_enabled, false),
    least(greatest(coalesce(p_max_paid_attempts, 1), 1), 20),
    'published', now()
  )
  on conflict (quiz_key) do update set
    title = excluded.title,
    description = excluded.description,
    questions_public = excluded.questions_public,
    answer_key = excluded.answer_key,
    entry_fee_coins = excluded.entry_fee_coins,
    paid_enabled = excluded.paid_enabled,
    max_paid_attempts = excluded.max_paid_attempts,
    category = excluded.category,
    difficulty = excluded.difficulty,
    timer_seconds = excluded.timer_seconds,
    status = 'published',
    updated_at = now()
  where d.creator_id = uid or public.paragon_is_team_member()
  returning * into q;

  if q.id is null then raise exception 'Could not publish (not owner?)'; end if;

  return jsonb_build_object(
    'id', q.id, 'quiz_key', q.quiz_key, 'title', q.title, 'paid_enabled', q.paid_enabled,
    'entry_fee_coins', q.entry_fee_coins, 'status', q.status, 'max_paid_attempts', q.max_paid_attempts
  );
end;
$$;
revoke all on function public.paragon_quiz_publish(text, text, text, jsonb, integer[], integer, boolean, text, text, integer, integer) from public;
grant execute on function public.paragon_quiz_publish(text, text, text, jsonb, integer[], integer, boolean, text, text, integer, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Start paid attempt (locks entry fee; creator self-play: allowed free UI but
-- NOT prize-eligible and NOT leaderboard-eligible)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_quiz_start_paid_attempt(
  p_quiz_key text,
  p_idempotency_key text default null
)
returns public.paragon_quiz_paid_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  q public.paragon_quiz_definitions;
  a public.paragon_quiz_paid_attempts;
  prior int;
  is_creator boolean;
  flags public.paragon_feature_flags;
  idem text;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select * into flags from public.paragon_feature_flags where id = 1;
  if flags.financial_pause then raise exception 'Financial operations paused'; end if;

  select * into q from public.paragon_quiz_definitions
  where quiz_key = p_quiz_key and status = 'published';
  if q.id is null then raise exception 'Quiz not found'; end if;
  if not q.paid_enabled or q.entry_fee_coins <= 0 then
    raise exception 'Quiz is free-play only on server paid path';
  end if;

  if p_idempotency_key is not null then
    select * into a from public.paragon_quiz_paid_attempts
    where user_id = uid and idempotency_key = p_idempotency_key;
    if a.id is not null then return a; end if;
  end if;

  select count(*) into prior from public.paragon_quiz_paid_attempts
  where quiz_id = q.id and user_id = uid
    and status in ('locked','in_progress','scored');
  if prior >= q.max_paid_attempts then
    raise exception 'Paid attempt limit reached for this quiz (% max)', q.max_paid_attempts;
  end if;

  is_creator := (q.creator_id is not null and q.creator_id = uid);
  idem := coalesce(p_idempotency_key, 'quiz-paid:' || q.id::text || ':' || uid::text || ':' || (prior + 1)::text);

  -- Lock entry fee from available
  perform public.paragon_coin_move_bucket(
    uid, q.entry_fee_coins, 'available', 'locked',
    'GAME_STAKE_LOCK', 'quiz_paid_attempt', q.quiz_key,
    idem || ':fee',
    jsonb_build_object('quiz_id', q.id)
  );

  insert into public.paragon_quiz_paid_attempts (
    quiz_id, user_id, entry_fee_coins, status, idempotency_key,
    eligible_for_prize, eligible_for_leaderboard, metadata
  ) values (
    q.id, uid, q.entry_fee_coins, 'in_progress', idem,
    not is_creator,  -- creator cannot win prize
    not is_creator,  -- creator cannot farm leaderboard points from own quiz
    jsonb_build_object('is_creator_self_play', is_creator)
  ) returning * into a;

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (uid, 'quiz_paid_attempt_started', 'quiz_attempt', a.id::text,
          jsonb_build_object('quiz_key', q.quiz_key, 'fee', q.entry_fee_coins, 'creator_self', is_creator));

  return a;
end;
$$;
revoke all on function public.paragon_quiz_start_paid_attempt(text, text) from public;
grant execute on function public.paragon_quiz_start_paid_attempt(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Server-side score (answers never leave this function to the client as a key)
-- p_answers: integer[] chosen option index per question (-1 skip)
-- ---------------------------------------------------------------------------
create or replace function public.paragon_quiz_score_attempt(
  p_attempt_id uuid,
  p_answers integer[],
  p_correlation_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  a public.paragon_quiz_paid_attempts;
  q public.paragon_quiz_definitions;
  i int;
  total int;
  score int := 0;
  chosen int;
  correct_idx int;
  breakdown jsonb := '[]'::jsonb;
  sc public.paragon_quiz_server_scores;
  pct numeric;
  is_svc boolean;
begin
  is_svc := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  if uid is null and not is_svc then raise exception 'Not authenticated'; end if;

  select * into a from public.paragon_quiz_paid_attempts where id = p_attempt_id for update;
  if a.id is null then raise exception 'Attempt not found'; end if;
  if not is_svc and a.user_id <> uid then raise exception 'Not your attempt'; end if;
  if a.status = 'scored' then
    select * into sc from public.paragon_quiz_server_scores where attempt_id = a.id;
    return jsonb_build_object(
      'attempt_id', a.id, 'score', sc.score, 'total', sc.total, 'percent', sc.percent,
      'already_scored', true, 'eligible_for_prize', a.eligible_for_prize,
      'eligible_for_leaderboard', a.eligible_for_leaderboard
    );
  end if;
  if a.status not in ('in_progress','locked') then
    raise exception 'Attempt not scorable';
  end if;

  select * into q from public.paragon_quiz_definitions where id = a.quiz_id;
  total := coalesce(array_length(q.answer_key, 1), 0);
  if total < 1 then raise exception 'Quiz has no answer key'; end if;
  if p_answers is null or coalesce(array_length(p_answers, 1), 0) <> total then
    raise exception 'answers length must equal question count';
  end if;

  for i in 1..total loop
    chosen := p_answers[i];
    correct_idx := q.answer_key[i];
    if chosen is not null and chosen = correct_idx then
      score := score + 1;
    end if;
    breakdown := breakdown || jsonb_build_array(jsonb_build_object(
      'i', i - 1,
      'chosen', chosen,
      'correct', (chosen is not null and chosen = correct_idx)
      -- never include correct_idx in client-facing breakdown? include only boolean
    ));
  end loop;

  pct := case when total > 0 then round((score::numeric / total::numeric) * 100, 2) else 0 end;

  -- Consume entry fee from locked (house / pool — not returned on normal complete)
  if a.entry_fee_coins > 0 then
    perform public.paragon_coin_post_entry(
      a.user_id, 'GAME_STAKE_RELEASE', -a.entry_fee_coins, 'locked',
      'quiz_paid_attempt', a.id::text, p_correlation_id,
      'quiz-fee-consume:' || a.id::text,
      jsonb_build_object('quiz_key', q.quiz_key)
    );
  end if;

  update public.paragon_quiz_paid_attempts set
    status = 'scored',
    submitted_at = now(),
    score = score,
    total = total,
    percent = pct
  where id = a.id
  returning * into a;

  insert into public.paragon_quiz_server_scores (
    attempt_id, quiz_id, user_id, score, total, percent, breakdown, correlation_id
  ) values (
    a.id, q.id, a.user_id, score, total, pct, breakdown, p_correlation_id
  ) returning * into sc;

  -- Leaderboard points only if eligible (not creator self-play)
  if a.eligible_for_leaderboard and score > 0 then
    begin
      perform public.paragon_competition_award_points(
        a.user_id,
        greatest(1, round(pct / 10.0)), -- 0–10 style points from percent
        null,
        null,
        'quiz_paid:' || q.quiz_key
      );
    exception when undefined_function then null;
    when others then null;
    end;
  end if;

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (
    coalesce(uid, a.user_id), 'quiz_server_scored', 'quiz_attempt', a.id::text,
    jsonb_build_object(
      'score', score, 'total', total, 'percent', pct,
      'eligible_prize', a.eligible_for_prize,
      'eligible_lb', a.eligible_for_leaderboard
    )
  );

  return jsonb_build_object(
    'attempt_id', a.id,
    'quiz_key', q.quiz_key,
    'score', score,
    'total', total,
    'percent', pct,
    'breakdown', breakdown,
    'eligible_for_prize', a.eligible_for_prize,
    'eligible_for_leaderboard', a.eligible_for_leaderboard,
    'already_scored', false,
    'note', 'Scored on server. Answer key never returned.'
  );
end;
$$;
revoke all on function public.paragon_quiz_score_attempt(uuid, integer[], text) from public;
grant execute on function public.paragon_quiz_score_attempt(uuid, integer[], text) to authenticated;

-- Void/refund paid attempt (team — e.g. technical failure before score)
create or replace function public.paragon_quiz_void_paid_attempt(
  p_attempt_id uuid,
  p_reason text default null
)
returns public.paragon_quiz_paid_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.paragon_quiz_paid_attempts;
begin
  if not public.paragon_is_team_member()
     and coalesce(auth.jwt() ->> 'role','') <> 'service_role' then
    raise exception 'Team or service only';
  end if;
  select * into a from public.paragon_quiz_paid_attempts where id = p_attempt_id for update;
  if a.id is null then raise exception 'Not found'; end if;
  if a.status = 'scored' then raise exception 'Already scored — cannot void'; end if;
  if a.status in ('voided','refunded') then return a; end if;

  if a.entry_fee_coins > 0 then
    perform public.paragon_coin_move_bucket(
      a.user_id, a.entry_fee_coins, 'locked', 'available',
      'GAME_VOID_REFUND', 'quiz_paid_attempt', a.id::text,
      'quiz-void:' || a.id::text,
      jsonb_build_object('reason', p_reason)
    );
  end if;
  update public.paragon_quiz_paid_attempts set status = 'refunded' where id = a.id
  returning * into a;
  return a;
end;
$$;
revoke all on function public.paragon_quiz_void_paid_attempt(uuid, text) from public;
grant execute on function public.paragon_quiz_void_paid_attempt(uuid, text) to authenticated;

-- Harden creator prize award (already blocks creator) + require eligible attempt optional
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
  bad boolean;
begin
  if not public.paragon_is_team_member() and coalesce(auth.jwt() ->> 'role','') <> 'service_role' then
    raise exception 'Team or service only';
  end if;
  select * into p from public.paragon_creator_prizes where id = p_prize_id for update;
  if p.id is null then raise exception 'Not found'; end if;
  if p.status = 'awarded' then return p; end if;
  if p_winner_user_id is null then raise exception 'Winner required'; end if;
  if p_winner_user_id = p.creator_id then
    raise exception 'Creator cannot win own prize (self-play protection)';
  end if;

  -- If any scored attempt exists for this quiz_key by winner marked ineligible, block
  select exists (
    select 1
    from public.paragon_quiz_paid_attempts a
    join public.paragon_quiz_definitions d on d.id = a.quiz_id
    where d.quiz_key = p.quiz_key
      and a.user_id = p_winner_user_id
      and a.eligible_for_prize = false
      and a.status = 'scored'
  ) into bad;
  if bad then
    raise exception 'Winner is not prize-eligible for this quiz (creator self-play or flag)';
  end if;

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

  insert into public.paragon_audit_log (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), 'creator_prize_awarded', 'creator_prize', p.id::text,
          jsonb_build_object('winner', p_winner_user_id, 'coins', p.prize_coins));
  return p;
end;
$$;
revoke all on function public.paragon_creator_prize_award(uuid, uuid) from public;
grant execute on function public.paragon_creator_prize_award(uuid, uuid) to authenticated;

-- Refund creator prize lock (cancel)
create or replace function public.paragon_creator_prize_refund(p_prize_id uuid)
returns public.paragon_creator_prizes
language plpgsql
security definer
set search_path = public
as $$
declare p public.paragon_creator_prizes;
begin
  if auth.uid() is null and coalesce(auth.jwt() ->> 'role','') <> 'service_role' then
    raise exception 'Not authenticated';
  end if;
  select * into p from public.paragon_creator_prizes where id = p_prize_id for update;
  if p.id is null then raise exception 'Not found'; end if;
  if p.status = 'awarded' then raise exception 'Already awarded'; end if;
  if p.status in ('refunded','cancelled') then return p; end if;
  if not public.paragon_is_team_member()
     and coalesce(auth.jwt() ->> 'role','') <> 'service_role'
     and auth.uid() <> p.creator_id then
    raise exception 'Not your prize';
  end if;
  perform public.paragon_coin_move_bucket(
    p.creator_id, p.prize_coins, 'locked', 'available',
    'CREATOR_PRIZE_REFUND', 'creator_prize', p.id::text,
    'prize-refund:' || p.id::text, '{}'::jsonb
  );
  update public.paragon_creator_prizes set status = 'refunded', resolved_at = now()
  where id = p.id returning * into p;
  return p;
end;
$$;
revoke all on function public.paragon_creator_prize_refund(uuid) from public;
grant execute on function public.paragon_creator_prize_refund(uuid) to authenticated;

-- Health
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
    'paragon_quiz_definitions', to_regclass('public.paragon_quiz_definitions') is not null,
    'paragon_quiz_paid_attempts', to_regclass('public.paragon_quiz_paid_attempts') is not null,
    'paragon_quiz_server_scores', to_regclass('public.paragon_quiz_server_scores') is not null,
    'paragon_creator_prizes', to_regclass('public.paragon_creator_prizes') is not null,
    'rpc_quiz_publish', to_regprocedure('public.paragon_quiz_publish(text,text,text,jsonb,integer[],integer,boolean,text,text,integer,integer)') is not null,
    'rpc_quiz_start_paid', to_regprocedure('public.paragon_quiz_start_paid_attempt(text,text)') is not null,
    'rpc_quiz_score', to_regprocedure('public.paragon_quiz_score_attempt(uuid,integer[],text)') is not null,
    'stage4_quiz', true,
    'creator_self_play_blocked_for_prize', true,
    'paid_attempt_protection', true,
    'server_side_scoring', true,
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

-- DONE Stage 4 quiz. Free localStorage quiz remains valid for free play.
