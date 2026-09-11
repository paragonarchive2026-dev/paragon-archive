<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SUPABASE-AI-VERIFY-PROMPT.md
  EXPECTED PROJECT PATH: /supabase/SUPABASE-AI-VERIFY-PROMPT.md
  ROLE: Copy-paste prompt for Supabase Dashboard AI / SQL so the OWNER gets full assurance of which migrations ran. P-118: agent-connector path is primary in this interface; manual paste is the fallback.
-->

# Full assurance — which SQL is live?

**Status — 2026-09-11 (P-118): ✅ ALL SQL DONE through Phase 5 + Stage 4.**
Use this file to re-verify after any future migration, or on a fresh project.

## How the coding agent checks (updated P-118)

> **The old "agent can't reach Supabase" note is outdated in this interface.**
> Earlier sandboxes got **`Name or service not known`** for `*.supabase.co` and
> needed the owner to paste SQL manually. **This interface has a direct
> Supabase connector** — the agent can apply migrations and run security
> advisors against the live project in-chat (7 migrations + advisors done this
> way, 2026-09-11).
> **Default route for SQL work now:** ask the agent. Manual paste below is the
> fallback (fresh projects, second opinions, or sessions without the connector).

### Paths (in order)

1. **Ask the agent in chat** (recommended here) — verifies + applies directly.
2. Open **Supabase Dashboard → SQL**, paste **Script A** below → Run → copy the
   entire result grid back into Arena chat or a GitHub Issue/comment.
3. Team desk on your live site → **Probe SQL health now** (uses the public anon
   key already in `config/supabase.js` — safe).
4. GitHub Action (`.github/workflows/supabase-health.yml`) runs **from GitHub's
   network**. You add `SUPABASE_URL` + `SUPABASE_ANON_KEY` as repo **Actions
   secrets** (anon only — never service role).

---

## Script A — paste into Supabase SQL (or give to Supabase AI)

```sql
-- PARAGON ARCHIVE — FULL SQL ASSURANCE REPORT
-- Safe read-only. Run once and copy all result sets.

-- 1) Object existence
select * from (
  values
    ('core','paragon_user_state', to_regclass('public.paragon_user_state') is not null),
    ('core','paragon_profiles', to_regclass('public.paragon_profiles') is not null),
    ('announce','paragon_announcements', to_regclass('public.paragon_announcements') is not null),
    ('announce','paragon_team_members', to_regclass('public.paragon_team_members') is not null),
    ('phase1','paragon_coin_accounts', to_regclass('public.paragon_coin_accounts') is not null),
    ('phase1','paragon_feature_flags', to_regclass('public.paragon_feature_flags') is not null),
    ('phase1','paragon_economic_settings', to_regclass('public.paragon_economic_settings') is not null),
    ('phase1','paragon_payment_intents', to_regclass('public.paragon_payment_intents') is not null),
    ('phase1','paragon_payment_events', to_regclass('public.paragon_payment_events') is not null),
    ('phase1','paragon_coin_ledger_v2', to_regclass('public.paragon_coin_ledger_v2') is not null),
    ('phase1','paragon_withdrawals', to_regclass('public.paragon_withdrawals') is not null),
    ('phase3','paragon_payment_matches', to_regclass('public.paragon_payment_matches') is not null),
    ('phase3','paragon_payment_webhook_inbox', to_regclass('public.paragon_payment_webhook_inbox') is not null),
    ('phase3','paragon_payment_provider_settings', to_regclass('public.paragon_payment_provider_settings') is not null),
    ('phase4','paragon_competitions', to_regclass('public.paragon_competitions') is not null),
    ('phase4','paragon_competition_participants', to_regclass('public.paragon_competition_participants') is not null),
    ('phase4','paragon_competition_settlements', to_regclass('public.paragon_competition_settlements') is not null),
    ('phase4','paragon_leaderboard_periods', to_regclass('public.paragon_leaderboard_periods') is not null),
    ('phase4','paragon_leaderboard_entries', to_regclass('public.paragon_leaderboard_entries') is not null),
    ('phase4','paragon_creator_prizes', to_regclass('public.paragon_creator_prizes') is not null),
    ('phase4','paragon_financial_cases', to_regclass('public.paragon_financial_cases') is not null),
    ('phase4','paragon_risk_flags', to_regclass('public.paragon_risk_flags') is not null),
    ('phase5','paragon_kyc_profiles', to_regclass('public.paragon_kyc_profiles') is not null),
    ('phase5','paragon_payout_rail_events', to_regclass('public.paragon_payout_rail_events') is not null),
    ('stage3','paragon_competitive_points', to_regclass('public.paragon_competitive_points') is not null),
    ('stage3','paragon_anticheat_events', to_regclass('public.paragon_anticheat_events') is not null),
    ('stage4','paragon_quiz_definitions', to_regclass('public.paragon_quiz_definitions') is not null),
    ('stage4','paragon_quiz_attempts', to_regclass('public.paragon_quiz_attempts') is not null)
) as t(pack, object_name, exists)
order by pack, object_name;

-- 1b) Legacy-draft absence check (all of these must be FALSE — the early drafts
-- were never applied and must stay absent; true here = wrong file was run)
select * from (
  values
    ('legacy-absent','paragon_coin_wallets', to_regclass('public.paragon_coin_wallets') is not null),
    ('legacy-absent','paragon_coin_ledger', to_regclass('public.paragon_coin_ledger') is not null),
    ('legacy-absent','paragon_wallets', to_regclass('public.paragon_wallets') is not null),
    ('legacy-absent','paragon_leaderboards', to_regclass('public.paragon_leaderboards') is not null)
) as t(pack, object_name, exists)
order by object_name;

-- 2) Key RPCs
select * from (
  values
    ('paragon_public_coin_config', to_regprocedure('public.paragon_public_coin_config()') is not null),
    ('paragon_sql_health', to_regprocedure('public.paragon_sql_health()') is not null),
    ('paragon_coin_create_payment_intent', to_regprocedure('public.paragon_coin_create_payment_intent(integer,text,text)') is not null),
    ('paragon_coin_post_entry', to_regprocedure('public.paragon_coin_post_entry(uuid,text,integer,text,text,text,text,text,jsonb)') is not null),
    ('paragon_competition_settle', to_regprocedure('public.paragon_competition_settle(uuid,text,uuid,text)') is not null),
    ('paragon_leaderboard_settle_period', to_regprocedure('public.paragon_leaderboard_settle_period(uuid)') is not null)
) as r(rpc_name, exists);

-- 3) One-shot health JSON (if phase3+ applied)
select public.paragon_sql_health();

-- 4) Flags (if phase1 applied)
select * from public.paragon_feature_flags where id = 1;

-- 5) Announcements sample (if applied)
select id, title, status, published_at
from public.paragon_announcements
order by coalesce(published_at, created_at) desc
limit 10;

-- 6) Team members
select email, role from public.paragon_team_members;
```

### Prompt for Supabase AI (optional)

> Run the SQL in SUPABASE-AI-VERIFY-PROMPT.md Script A against this project.  
> Return a markdown table of pack → object → exists true/false.  
> Then list which migration files I still need to run from the paragon-archive repo:  
> announcements-schema.sql, coins-master-phase1.sql, coins-master-phase2.sql,
> coins-master-stage1-hardening.sql, coins-master-phase3.sql,
> coins-master-phase4.sql, coins-master-phase5.sql,
> coins-master-stage2-coin-system.sql, coins-master-stage3-games.sql,
> coins-master-stage4-quiz.sql.  
> Do NOT list coins-schema.sql, finance-schema.sql or leaderboards-schema.sql —
> those are superseded early drafts that must never be applied (D-237).  
> Do not modify data. Do not enable real_money_enabled.

---

## How to read the answer

| If most of pack… | You already ran… |
|------------------|------------------|
| `core` true | schema.sql (do not re-run) |
| `announce` true | announcements-schema.sql |
| `phase1` true | coins-master-phase1.sql |
| RPCs payment/post_entry | coins-master-phase2.sql |
| `phase3` + sql_health | coins-master-phase3.sql |
| `phase4` + competition_settle | coins-master-phase4.sql |
| `phase5` | coins-master-phase5.sql |
| `stage3` | coins-master-stage3-games.sql |
| `stage4` | coins-master-stage4-quiz.sql |
| any `legacy-absent` true | ⚠️ a superseded draft was run by mistake — tell the agent before doing anything else |

Anything `false` → run that file from `supabase/` in order (see `SQL-RUN-PACK.md`).

---

## What NOT to do

- Do **not** put `service_role` key in GitHub, Arena chat, or `config/supabase.js`.
- Do **not** run `coins-schema.sql`, `finance-schema.sql`, or
  `leaderboards-schema.sql` — superseded drafts (D-237); the live system is
  `coins-master-phaseN` + `stageN` only.
- Do **not** flip `real_money_enabled` until provider + compliance are ready.
