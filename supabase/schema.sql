-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: schema.sql
-- EXPECTED PROJECT PATH: /supabase/schema.sql
-- ROLE: ARCHIVED DESIGN REFERENCE — this schema was EXECUTED LIVE on 2026-08-18 (probe-verified:
--       tables/RPC live in the Supabase dashboard). The dashboard is now the source of truth;
--       this file stays as the regression-guard reference the test suites assert against.
--       The ONLY pending SQL is supabase/announcements-schema.sql (P-094/D-174).
-- RESTORE/LOAD NOTE: Do NOT re-run. Kept for design archaeology + fixture checks.


-- PARAGON ARCHIVE — SHARED USER STATE
-- Run in the Supabase SQL editor for the project configured in config/supabase.js.

create table if not exists public.paragon_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default jsonb_build_object(
    'bookmarks', '[]'::jsonb,
    'reviews', '{}'::jsonb,
    'reviewVotes', '{}'::jsonb,
    'visits', '[]'::jsonb,
    'progress', '{}'::jsonb,
    'preferences', '{}'::jsonb,
    'collections', '[]'::jsonb,
    'profile', '{}'::jsonb,
    'notifications', '[]'::jsonb
  ),
  updated_at timestamptz not null default now()
);

alter table public.paragon_user_state enable row level security;

revoke all on table public.paragon_user_state from anon;
grant select, insert, update, delete on table public.paragon_user_state to authenticated;

drop policy if exists "Users can read their own Paragon state" on public.paragon_user_state;
drop policy if exists "Users can create their own Paragon state" on public.paragon_user_state;
drop policy if exists "Users can update their own Paragon state" on public.paragon_user_state;
drop policy if exists "Users can delete their own Paragon state" on public.paragon_user_state;

create policy "Users can read their own Paragon state"
on public.paragon_user_state
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own Paragon state"
on public.paragon_user_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own Paragon state"
on public.paragon_user_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own Paragon state"
on public.paragon_user_state
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists paragon_user_state_updated_at_idx
on public.paragon_user_state (updated_at desc);

-- UNIQUE USERNAME PROFILE
create extension if not exists citext;

create table if not exists public.paragon_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique check (username::text ~ '^[A-Za-z0-9_]{3,24}$'),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.paragon_profiles enable row level security;
revoke all on table public.paragon_profiles from anon;
grant select, insert, update on table public.paragon_profiles to authenticated;

drop policy if exists "Users can read their own Paragon profile" on public.paragon_profiles;
drop policy if exists "Users can update their own Paragon profile" on public.paragon_profiles;
create policy "Users can read their own Paragon profile"
on public.paragon_profiles for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Users can update their own Paragon profile"
on public.paragon_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_paragon_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_username text;
  final_username text;
begin
  requested_username := nullif(lower(new.raw_user_meta_data ->> 'username'), '');
  final_username := regexp_replace(
    coalesce(requested_username, lower(new.raw_user_meta_data ->> 'preferred_username'), lower(split_part(new.email, '@', 1))),
    '[^a-z0-9_]+', '_', 'g'
  );
  final_username := trim(both '_' from final_username);
  if char_length(final_username) < 3 then
    final_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  final_username := left(final_username, 24);
  if requested_username is null and exists (select 1 from public.paragon_profiles where username = final_username::citext) then
    final_username := left(final_username, 15) || '_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.paragon_profiles (user_id, username, display_name)
  values (
    new.id,
    final_username::citext,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_paragon_profile on auth.users;
create trigger on_auth_user_created_paragon_profile
after insert on auth.users
for each row execute function public.handle_new_paragon_user();

create or replace function public.paragon_username_available(candidate text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select candidate ~ '^[A-Za-z0-9_]{3,24}$'
    and not exists (select 1 from public.paragon_profiles where username = lower(candidate)::citext);
$$;
grant execute on function public.paragon_username_available(text) to anon, authenticated;

-- WEBSITE REQUESTS
create table if not exists public.paragon_website_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  website_name text not null check (char_length(website_name) between 2 and 120),
  website_url text,
  category text,
  reason text not null check (char_length(reason) between 10 and 1000),
  need_reason text,
  contact_email text,
  terms_acknowledged boolean not null default false,
  status text not null default 'submitted' check (status in ('submitted','reviewing','approved','declined')),
  created_at timestamptz not null default now()
);

-- Rerunnable upgrades for projects that created the request table before v0.21.0.
alter table public.paragon_website_requests add column if not exists need_reason text;
alter table public.paragon_website_requests add column if not exists contact_email text;
alter table public.paragon_website_requests add column if not exists terms_acknowledged boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'paragon_requests_need_reason_length') then
    alter table public.paragon_website_requests
      add constraint paragon_requests_need_reason_length
      check (need_reason is null or char_length(need_reason) between 10 and 500);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'paragon_requests_contact_email_length') then
    alter table public.paragon_website_requests
      add constraint paragon_requests_contact_email_length
      check (contact_email is null or char_length(contact_email) between 3 and 254);
  end if;
end $$;

alter table public.paragon_website_requests enable row level security;
revoke all on table public.paragon_website_requests from anon;
grant select, insert on table public.paragon_website_requests to authenticated;

drop policy if exists "Users can submit website requests" on public.paragon_website_requests;
drop policy if exists "Users can read their own website requests" on public.paragon_website_requests;
create policy "Users can submit website requests"
on public.paragon_website_requests for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Users can read their own website requests"
on public.paragon_website_requests for select to authenticated
using ((select auth.uid()) = user_id);

create index if not exists paragon_website_requests_user_created_idx
on public.paragon_website_requests (user_id, created_at desc);

-- Privacy-safe public aggregate: returns only the number of accepted inserts.
-- It starts at zero in an empty project and exposes no request/user fields.
create or replace function public.paragon_request_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint from public.paragon_website_requests;
$$;
revoke all on function public.paragon_request_count() from public;
grant execute on function public.paragon_request_count() to anon, authenticated;

-- Enforce one request per authenticated account in every rolling seven-day period.
-- The advisory transaction lock closes the simultaneous-double-submit race.
create or replace function public.enforce_paragon_request_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  latest_request_at timestamptz;
begin
  -- Browser clients cannot backdate requests or choose a moderation status.
  new.created_at := now();
  new.status := 'submitted';

  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));

  select max(created_at)
    into latest_request_at
    from public.paragon_website_requests
   where user_id = new.user_id;

  if latest_request_at is not null and latest_request_at > now() - interval '7 days' then
    raise exception using
      errcode = 'P0001',
      message = 'REQUEST_RATE_LIMIT: You can submit only one website request every 7 days.',
      detail = 'The next request is available after ' || (latest_request_at + interval '7 days')::text;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_paragon_request_rate_limit() from public;

drop trigger if exists enforce_paragon_request_rate_limit on public.paragon_website_requests;
create trigger enforce_paragon_request_rate_limit
before insert on public.paragon_website_requests
for each row execute function public.enforce_paragon_request_rate_limit();

-- TRANSACTIONAL EMAIL OUTBOX
-- Browser roles cannot read or write this table. Accepted application events queue
-- allowlisted templates; the protected Edge Function processes them with service role.
create table if not exists public.paragon_email_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  template_key text not null,
  recipient_email text not null check (char_length(recipient_email) between 3 and 254),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  provider text,
  provider_message_id text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz
);

-- Replace any earlier anonymous template-key check with one rerunnable named constraint.
do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
      from pg_constraint
     where conrelid = 'public.paragon_email_outbox'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%template_key%'
  loop
    execute format('alter table public.paragon_email_outbox drop constraint %I', constraint_row.conname);
  end loop;

  alter table public.paragon_email_outbox
    add constraint paragon_email_outbox_template_key_check
    check (template_key in ('request-received','support-notification'));
end $$;

alter table public.paragon_email_outbox enable row level security;
revoke all on table public.paragon_email_outbox from anon, authenticated;

create index if not exists paragon_email_outbox_status_created_idx
on public.paragon_email_outbox (status, created_at);

create or replace function public.queue_paragon_request_received_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.contact_email is null or btrim(new.contact_email) = '' then
    -- No optional contact email: place the receipt in the authenticated account state.
    insert into public.paragon_user_state (user_id, state, updated_at)
    values (
      new.user_id,
      jsonb_build_object(
        'bookmarks', '[]'::jsonb,
        'reviews', '{}'::jsonb,
        'reviewVotes', '{}'::jsonb,
        'visits', '[]'::jsonb,
        'progress', '{}'::jsonb,
        'preferences', '{}'::jsonb,
        'collections', '[]'::jsonb,
        'profile', '{}'::jsonb,
        'notifications', jsonb_build_array(jsonb_build_object(
          'id', 'request-receipt:' || new.id::text,
          'type', 'request-receipt',
          'title', 'We got your idea 💡 — Paragon Archive',
          'message', 'Your request for ' || new.website_name || ' was received. The Paragon Team will review it personally.',
          'icon', '💡',
          'createdAt', new.created_at,
          'expiresAt', new.created_at + interval '24 hours',
          'readAt', null
        ))
      ),
      now()
    )
    on conflict (user_id) do update
      set state = jsonb_set(
        public.paragon_user_state.state,
        '{notifications}',
        coalesce(public.paragon_user_state.state -> 'notifications', '[]'::jsonb)
          || jsonb_build_array(jsonb_build_object(
            'id', 'request-receipt:' || new.id::text,
            'type', 'request-receipt',
            'title', 'We got your idea 💡 — Paragon Archive',
            'message', 'Your request for ' || new.website_name || ' was received. The Paragon Team will review it personally.',
            'icon', '💡',
            'createdAt', new.created_at,
            'expiresAt', new.created_at + interval '24 hours',
            'readAt', null
          )),
        true
      ),
      updated_at = now();
    return new;
  end if;

  insert into public.paragon_email_outbox (
    event_key,
    template_key,
    recipient_email,
    payload
  ) values (
    'website-request-received:' || new.id::text,
    'request-received',
    lower(btrim(new.contact_email)),
    jsonb_build_object(
      'requestId', new.id,
      'websiteName', new.website_name,
      'category', new.category,
      'submittedAt', new.created_at
    )
  )
  on conflict (event_key) do nothing;

  return new;
end;
$$;

revoke all on function public.queue_paragon_request_received_email() from public;

drop trigger if exists queue_paragon_request_received_email on public.paragon_website_requests;
create trigger queue_paragon_request_received_email
after insert on public.paragon_website_requests
for each row execute function public.queue_paragon_request_received_email();

-- HELP & SUPPORT MESSAGES
create table if not exists public.paragon_support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 3 and 254),
  topic text not null check (topic in ('General Question','Bug Report','Account Issue','Website Not Loading','Privacy Concern','Feature Suggestion','Other')),
  message text not null check (char_length(message) between 20 and 2000),
  attachment_path text,
  attachment_name text,
  attachment_type text check (attachment_type is null or attachment_type in ('image/png','image/jpeg','image/gif')),
  attachment_size bigint check (attachment_size is null or attachment_size between 1 and 10485760),
  user_agent text,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.paragon_support_messages enable row level security;
revoke all on table public.paragon_support_messages from anon, authenticated;

create index if not exists paragon_support_messages_status_created_idx
on public.paragon_support_messages (status, created_at desc);
create index if not exists paragon_support_messages_email_created_idx
on public.paragon_support_messages (lower(email), created_at desc);

create or replace function public.enforce_paragon_support_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  new.email := lower(btrim(new.email));
  new.created_at := now();
  new.updated_at := now();
  new.status := 'open';

  perform pg_advisory_xact_lock(hashtextextended('support:' || new.email, 0));

  select count(*)
    into recent_count
    from public.paragon_support_messages
   where lower(email) = new.email
     and created_at > now() - interval '24 hours';

  if recent_count >= 3 then
    raise exception using
      errcode = 'P0001',
      message = 'SUPPORT_RATE_LIMIT: You can send up to three support messages in 24 hours.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_paragon_support_rate_limit() from public;

drop trigger if exists enforce_paragon_support_rate_limit on public.paragon_support_messages;
create trigger enforce_paragon_support_rate_limit
before insert on public.paragon_support_messages
for each row execute function public.enforce_paragon_support_rate_limit();

-- Private screenshot bucket. Browser roles receive no storage policies; only the
-- protected service-role Edge Function can upload/read/delete these objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-attachments',
  'support-attachments',
  false,
  10485760,
  array['image/png','image/jpeg','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.queue_paragon_support_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.paragon_email_outbox (
    event_key,
    template_key,
    recipient_email,
    payload
  ) values (
    'support-message:' || new.id::text,
    'support-notification',
    'paragon.archive.2026@gmail.com',
    jsonb_build_object(
      'supportId', new.id,
      'name', new.name,
      'email', new.email,
      'topic', new.topic,
      'message', new.message,
      'attachmentPath', new.attachment_path,
      'attachmentName', new.attachment_name,
      'userAgent', new.user_agent,
      'submittedAt', new.created_at
    )
  )
  on conflict (event_key) do nothing;

  return new;
end;
$$;

revoke all on function public.queue_paragon_support_notification() from public;

drop trigger if exists queue_paragon_support_notification on public.paragon_support_messages;
create trigger queue_paragon_support_notification
after insert on public.paragon_support_messages
for each row execute function public.queue_paragon_support_notification();
