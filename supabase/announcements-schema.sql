-- PARAGON ARCHIVE — EXPORT IDENTITY
-- REAL FILE NAME: announcements-schema.sql
-- EXPECTED PROJECT PATH: /supabase/announcements-schema.sql
-- ROLE: Managed announcements backend (P-094 / D-174) — the Team Announcements desk becomes the
--       single source of truth for every public announcement: published/scheduled/drafted records,
--       real image data URLs, special-announcement links. Seeds the four REAL launch-window
--       announcements so they are editable from the Team side as if composed there.
-- RESTORE-LOAD NOTE: Run ONCE in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
--       Safe to re-run: idempotent (ON CONFLICT clauses).

-- 1. Team members allowed to write announcements (RLS membership table).
create table if not exists public.paragon_team_members (
  email text primary key,
  role text not null default 'founder',
  added_at timestamptz not null default now()
);

insert into public.paragon_team_members (email, role)
values ('paragon.archive.2026@gmail.com', 'founder')
on conflict (email) do nothing;

-- 2. Managed announcements table. image_url holds a compressed data URL (≤ ~300 KB) so no
--    storage bucket is needed; link_url is for special announcements only (public LINK pill).
create table if not exists public.paragon_announcements (
  id text primary key,
  type text not null check (type in ('new','updated','maintenance','special','featured')),
  site_name text,
  title text not null,
  message text not null,
  image_url text,
  link_url text,
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  publish_at timestamptz,
  published_at timestamptz,
  published_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.paragon_announcements enable row level security;

-- Public read: ONLY published rows whose schedule time has arrived.
drop policy if exists "public read live announcements" on public.paragon_announcements;
create policy "public read live announcements" on public.paragon_announcements
  for select to anon, authenticated
  using (status = 'published' and (publish_at is null or publish_at <= now()));

-- Team write: full management rights for signed-in team members only.
drop policy if exists "team members manage announcements" on public.paragon_announcements;
create policy "team members manage announcements" on public.paragon_announcements
  for all to authenticated
  using (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))))
  with check (exists (select 1 from public.paragon_team_members m where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))));

-- 3. Seed the four REAL announcements (same ids + texts + dates the public feed already shows,
--    so the Team desk can edit/delete them "as if actually made from there").
insert into public.paragon_announcements (id, type, site_name, title, message, image_url, link_url, status, publish_at, published_at, published_by)
values
  ('announcement-2026-08-18-backend-live', 'special', null,
   'The Paragon backend went LIVE',
   'Database schema, Email + Google sign-in, and the community & developer tables are all live and probe-verified. Signed-in members'' board posts now publish to the real backend.',
   null, null, 'published', null, '2026-08-18T18:00:00+01:00', 'Paragon Founder'),
  ('announcement-2026-08-18-community-board', 'special', null,
   'The Community Board is open',
   'Members can post, comment, like, report and appeal — with a real moderation loop on the Team desk. Join through Account, then Paragon Community.',
   null, null, 'published', null, '2026-08-18T17:00:00+01:00', 'Paragon Founder'),
  ('announcement-2026-08-18-developer-portal', 'special', null,
   'The Developer Portal is open',
   'Apply as a developer, pass the real 8-point review gate, and your website joins the public Deployed category.',
   null, null, 'published', null, '2026-08-18T16:00:00+01:00', 'Paragon Founder'),
  ('announcement-2026-08-04-catalogue-expansion', 'special', null,
   'A larger Paragon collection is now available',
   'New productivity, education, creative, social, finance, lifestyle, entertainment, games, and developer experiences have joined the archive.',
   null, null, 'published', null, '2026-08-04T03:15:00+01:00', 'Paragon Founder')
on conflict (id) do nothing;

-- 4. Timestamp trigger keeps updated_at truthful.
create or replace function public.paragon_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists paragon_announcements_touch on public.paragon_announcements;
create trigger paragon_announcements_touch
  before update on public.paragon_announcements
  for each row execute function public.paragon_touch_updated_at();

-- Done. After running:
--   * open team/announcements.html signed in with paragon.archive.2026@gmail.com → the desk
--     flips to "☁️ Live backend" and every edit/delete/schedule reaches ALL devices;
--   * the public Updates feed automatically pulls this table (app.js fetchLiveAnnouncements).
