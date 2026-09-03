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

This sandbox cannot reach your Supabase project over the network, so **you** must run the VERIFY block below and tell me the results. That is how we confirm announcements / coins / core schema.

---

## A) VERIFY — paste this whole block once

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
select 'paragon_coin_wallets' as object,
  to_regclass('public.paragon_coin_wallets') is not null as exists;
select 'paragon_coin_accounts' as object,
  to_regclass('public.paragon_coin_accounts') is not null as exists;
select 'paragon_coin_ledger' as object,
  to_regclass('public.paragon_coin_ledger') is not null as exists;
select 'paragon_coin_config' as object,
  to_regclass('public.paragon_coin_config') is not null as exists;
select 'paragon_economic_settings' as object,
  to_regclass('public.paragon_economic_settings') is not null as exists;
select 'paragon_feature_flags' as object,
  to_regclass('public.paragon_feature_flags') is not null as exists;
select 'paragon_payment_intents' as object,
  to_regclass('public.paragon_payment_intents') is not null as exists;
select 'paragon_withdrawals' as object,
  to_regclass('public.paragon_withdrawals') is not null as exists;

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
| `paragon_coin_*` / `paragon_economic_settings` | **true** | Coins Phase-1 SQL ran |
| announcements rows | 4+ published | Seed data present |

**Reply in chat with:** a screenshot or copy of the `exists` column results. I will mark the CTA complete.

---

## B) RUN ORDER (only what is still false)

### 0. `schema.sql` — DO NOT RE-RUN
Already executed live 2026-08-18. File is an archive reference.

### 1. Announcements (if `paragon_announcements` = false)
**File:** `supabase/announcements-schema.sql`  
**Action:** paste entire file → Run  
**Safe:** idempotent  

### 2. Coins Phase 1 — wallets/ledger/config (if coin tables = false)
**File:** `supabase/coins-schema.sql`  
**Action:** paste entire file → Run  
**Safe:** idempotent  
**Note:** This is the first coins migration (wallets + purchase RPCs). Still required.

### 3. Coins Phase 1b — master-spec tables (if `paragon_coin_accounts` = false)
**File:** `supabase/coins-master-phase1.sql`  
**Action:** paste entire file → Run  
**Safe:** idempotent  
**Adds:** multi-balance accounts, economic settings, feature flags, payment intents, withdrawals v2, payout accounts, audit log, competitions stubs, leaderboard stubs — aligned with `PARAGON-COINS-MASTER-BUILD-SPEC.md` §47.  
**Does NOT** turn on real-money mode (`real_money_enabled` stays **false** until you decide).

---

## C) After SQL is green

1. Soft-refresh the Archive (hard refresh / clear SW if needed — cache **v78**).  
2. Team desk → Settings: coin purchase + withdrawal panels still work local-first; live RPCs activate as we wire them.  
3. Account → Paragon Coins: rates now follow config (**1 coin = ₦1** target; real-money OFF until flag).  

---

## D) Still NOT SQL (owner later)

| Item | Status |
|------|--------|
| Brevo SMTP hold | Account-side — `docs/BREVO-CONTACT.md` |
| Payment provider (Paystack/bank feed) | Owner pick — Phase 2 |
| Production domain + Auth redirect allowlist | Owner |
| Edge function deploy + secrets | Owner when Phase 2 starts |
| Gaming licence / KYC | Legal — not blocked for free-play build |

---

## E) Honesty

- Free play works without any of the coin SQL.  
- **Redeemable / real naira** stays **OFF** until `paragon_feature_flags.real_money_enabled = true` **and** payment provider + licence path are ready.  
- LocalStorage coin UI is a **display / offline prototype** until the ledger is the authority (master spec §2).
