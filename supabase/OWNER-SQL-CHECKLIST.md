<!-- Stage1: also run coins-master-stage1-hardening.sql after phase2 -->
<!-- See also: SUPABASE-AI-VERIFY-PROMPT.md for Supabase AI + GitHub Actions assurance -->
<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: OWNER-SQL-CHECKLIST.md
  EXPECTED PROJECT PATH: /supabase/OWNER-SQL-CHECKLIST.md
  ROLE: Owner-facing checklist — what SQL has been run, what to run next, how to verify.
  RESTORE-LOAD NOTE: Update after every new migration. Owner pastes VERIFY queries in Supabase SQL.
-->

# Owner SQL checklist — run & verify

**Project:** `qnylhlyyzpwlfftiygcn` (from `config/supabase.js`)  
**Where:** Supabase Dashboard → **SQL** → New query  
**Status — 2026-09-11 (P-118): ✅ ALL SQL IS DONE through Phase 5 + Stage 4.**
Nothing below needs running unless a future migration lands. The next blocker is
**Edge Function deploys** (application code, not SQL) — see
`supabase/functions/EDGE-DEPLOY-RUNBOOK.md`.

> **Agent reachability (P-118 correction):** older versions of this file said the
> sandbox gets DNS failures and the owner must paste SQL manually. **That is
> outdated in this interface** — the agent now has a direct Supabase connector
> and can apply migrations + run advisors against the live project in-chat.
> The manual VERIFY path below stays as a fallback, not the default route.

---

## A) VERIFY — paste this whole block once (fallback / double-check)

```sql
-- PARAGON ARCHIVE — OWNER VERIFY (read-only)
select 'paragon_user_state' as object,
  to_regclass('public.paragon_user_state') is not null as exists;
select 'paragon_profiles' as object,
  to_regclass('public.paragon_profiles') is not null as exists;
select 'paragon_announcements' as object,
  to_regclass('public.paragon_announcements') is not null as exists;
select 'paragon_team_members' as object,
  to_regclass('public.paragon_team_members') is not null as exists;
select 'paragon_coin_accounts' as object,
  to_regclass('public.paragon_coin_accounts') is not null as exists;
select 'paragon_coin_ledger_v2' as object,
  to_regclass('public.paragon_coin_ledger_v2') is not null as exists;
select 'paragon_economic_settings' as object,
  to_regclass('public.paragon_economic_settings') is not null as exists;
select 'paragon_payment_intents' as object,
  to_regclass('public.paragon_payment_intents') is not null as exists;
select 'paragon_payment_matches' as object,
  to_regclass('public.paragon_payment_matches') is not null as exists;
select 'paragon_payment_webhook_inbox' as object,
  to_regclass('public.paragon_payment_webhook_inbox') is not null as exists;
select 'paragon_feature_flags' as object,
  to_regclass('public.paragon_feature_flags') is not null as exists;
select 'paragon_coin_post_entry_fn' as object,
  to_regprocedure('public.paragon_coin_post_entry(uuid,text,integer,text,text,text,text,text,jsonb)') is not null as exists;
select 'paragon_coin_create_payment_intent_fn' as object,
  to_regprocedure('public.paragon_coin_create_payment_intent(integer,text,text)') is not null as exists;
select 'paragon_withdrawals' as object,
  to_regclass('public.paragon_withdrawals') is not null as exists;
select 'paragon_leaderboard_periods' as object,
  to_regclass('public.paragon_leaderboard_periods') is not null as exists;
select 'paragon_leaderboard_entries' as object,
  to_regclass('public.paragon_leaderboard_entries') is not null as exists;
select 'paragon_kyc_profiles' as object,
  to_regclass('public.paragon_kyc_profiles') is not null as exists;
select 'paragon_competitive_points' as object,
  to_regclass('public.paragon_competitive_points') is not null as exists;
select 'paragon_quiz_definitions' as object,
  to_regclass('public.paragon_quiz_definitions') is not null as exists;

-- If announcements table exists, show live rows:
select id, title, status, published_at
from public.paragon_announcements
order by coalesce(published_at, created_at) desc
limit 10;

-- Team members (if table exists):
select email, role from public.paragon_team_members;
```

### How to read the results

| Object | Expected if done | Meaning |
|--------|------------------|---------|
| `paragon_user_state` | **true** | Core schema live (2026-08-18) — do not re-run `schema.sql` |
| `paragon_profiles` | **true** | Core schema live |
| `paragon_announcements` | **true** = announcements SQL ran | If **false**, run `announcements-schema.sql` |
| `paragon_team_members` | **true** with your founder email | Needed for team write policies |
| `paragon_coin_accounts` / `paragon_coin_ledger_v2` / `paragon_economic_settings` | **true** | Master Phase-1 live |
| `paragon_payment_matches` / `paragon_payment_webhook_inbox` | **true** | Master Phase-3 live |
| `paragon_leaderboard_periods` / `paragon_leaderboard_entries` | **true** | Master Phase-4 live (money leaderboard) |
| `paragon_kyc_profiles` | **true** | Master Phase-5 live (OPay/Moniepoint rails + KYC) |
| `paragon_competitive_points` / `paragon_quiz_definitions` | **true** | Stage 3 games + Stage 4 quiz live |
| announcements rows | 4+ published | Seed data present |

**Reply in chat with:** a screenshot or copy of the `exists` column results. I will mark the CTA complete.

> **Legacy tables you do NOT need:** `paragon_coin_wallets`, `paragon_coin_ledger`
> (v1), `paragon_wallets`, `paragon_leaderboards` belong to the SUPERSEDED early
> drafts (`coins-schema.sql`, `finance-schema.sql`, `leaderboards-schema.sql`).
> They were never applied and must stay absent — **false is correct** for those.

---

## B) RUN ORDER (only what is still false — currently nothing)

### 0. `schema.sql` — DO NOT RE-RUN
Already executed live 2026-08-18. File is an archive reference.

### 1. Announcements (if `paragon_announcements` = false)
**File:** `supabase/announcements-schema.sql`  
**Action:** paste entire file → Run  
**Safe:** idempotent  

### ⛔ REMOVED — `coins-schema.sql` ("Coins Phase 1 — wallets/ledger") is NOT a step
Earlier versions of this checklist listed it as required before
`coins-master-phase1.sql`. **It never was.** The live system was built entirely
on the `coins-master-phaseN` + `stageN` architecture. `coins-schema.sql` is an
earlier, incompatible draft that was never applied — running it now would
conflict with the live tables. **Do not run it.** Same for `finance-schema.sql`
and `leaderboards-schema.sql` (all three carry ⛔ SUPERSEDED banners — D-237).

### 2. Coins master Phase 1 — accounts/ledger/economy (if `paragon_coin_accounts` = false)
**File:** `supabase/coins-master-phase1.sql`  
**Action:** paste entire file → Run  
**Safe:** idempotent  
**Adds:** multi-balance accounts, economic settings, feature flags, payment intents, withdrawals v2, payout accounts, audit log, competitions stubs, leaderboard stubs — aligned with `PARAGON-COINS-MASTER-BUILD-SPEC.md` §47.  
**Does NOT** turn on real-money mode (`real_money_enabled` stays **false** until you decide).

### 3. Coins master Phase 2 — authority RPCs (if phase1 exists but RPCs missing)
**File:** `supabase/coins-master-phase2.sql`  
**then:** `supabase/coins-master-stage1-hardening.sql` (rate limits, reserves, finance report)  
**Action:** paste entire file → Run  
**Safe:** idempotent (`create or replace function`)  
**Adds:** ledger post/move, payment intent create/claim/confirm, withdrawal lock/pay/reject, admin adjust, my_account/my_ledger, lock_stake.

### 4. Coins master Phase 3 — provider + health (if `paragon_payment_matches` / `paragon_sql_health` missing)
**File:** `supabase/coins-master-phase3.sql`  
**Action:** paste entire file → Run  
**Adds:** payment matches, webhook inbox, provider settings, `paragon_coin_match_and_confirm`, `paragon_coin_ingest_payment_event`, **`paragon_sql_health()`** (Team desk probe).

**Then:** deploy Edge functions per `supabase/functions/EDGE-DEPLOY-RUNBOOK.md`.

### 5. Coins master Phase 4 — compete / leaderboard / cases
**File:** `supabase/coins-master-phase4.sql`  
**Adds:** participants, settlements, leaderboard entries, creator prizes, financial cases, risk flags, competition create/join/settle, leaderboard settle, prize lock/award, financial pause, open case, health phase=4.

### 6. Coins master Phase 5 — OPay/Moniepoint rails + KYC
**File:** `supabase/coins-master-phase5.sql`  
**Adds:** KYC profiles, payout rail events, preferred-rails settings. Rails stay manual until provider webhooks are wired (see runbook).

### 7. Stage 2 — coin system (after phase2 + stage1-hardening)
**File:** `supabase/coins-master-stage2-coin-system.sql`  
**Adds:** purchase intents → claim → reconcile flow. See `docs/COINS-STAGE2.md`.

### 8. Stage 3 — games (after phase4)
**File:** `supabase/coins-master-stage3-games.sql`  
**Adds:** 1v1 stake helpers, competitive points, anti-cheat foundations, settle enhancements. See `docs/COINS-STAGE3.md`.

### 9. Stage 4 — paid quiz (after stage3)
**File:** `supabase/coins-master-stage4-quiz.sql`  
**Adds:** server quiz definitions, paid attempts, server scoring, creator self-play protection. See `docs/COINS-STAGE4.md`.

### Browser probe (easiest confirm)
Team desk → **Probe SQL health now** → paste the pre block back to the agent if you want confirmation logged.

---

## C) After SQL is green

1. Soft-refresh the Archive (hard refresh / clear SW if needed — cache **v92**).  
2. Team desk → Settings: coin purchase + withdrawal panels still work local-first; live RPCs activate as we wire them.  
3. Account → Paragon Coins: rates now follow config (**1 coin = ₦1** target; real-money OFF until flag).  

---

## D) Still NOT SQL (owner next — the actual blocker)

| Item | Status |
|------|--------|
| Edge functions `coin-payment-webhook`, `coin-reconcile`, `competition-settle` | **NEXT — deploy + set secrets** (`EDGE-DEPLOY-RUNBOOK.md`) |
| Secrets `PARAGON_COIN_WEBHOOK_SECRET` (+ `OPAY_*`/`MONIEPOINT_*` if webhooks) | Set in Dashboard → Edge Functions → Secrets (never in Git/chat) |
| Brevo SMTP hold | Account-side — `docs/BREVO-CONTACT.md` |
| Payment provider (OPay/Moniepoint account numbers) | Owner paste — Phase 5 |
| Production domain + Auth redirect allowlist | Owner |
| Gaming licence / KYC | Legal — not blocked for free-play build |

---

## E) Honesty

- Free play works without any of the coin SQL.  
- **Redeemable / real naira** stays **OFF** until `paragon_feature_flags.real_money_enabled = true` **and** payment provider + licence path are ready.  
- LocalStorage coin UI is a **display / offline prototype** until the ledger is the authority (master spec §2).
