<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SQL-RUN-PACK.md
  EXPECTED PROJECT PATH: /supabase/SQL-RUN-PACK.md
  ROLE: Ordered SQL the owner must run in Supabase Dashboard.
-->

# SQL run pack — Paragon Archive

**Project ref:** `qnylhlyyzpwlfftiygcn`  
**Where:** Supabase Dashboard → **SQL** → New query → paste file → **Run**

> Sandbox cannot reach Supabase DNS. After running, paste VERIFY results from `OWNER-SQL-CHECKLIST.md`.

## Status board

| # | File | Action |
|---|------|--------|
| 0 | `schema.sql` | **DO NOT RE-RUN** (live 2026-08-18) |
| 1 | `announcements-schema.sql` | Run if announcements missing |
| 2 | `coins-schema.sql` | Run if wallets/RPCs missing |
| 3 | `coins-master-phase1.sql` | Run if accounts/flags/settings missing |
| 4 | `coins-master-phase2.sql` | **NEW P-102** — authority RPCs (post entry, payment intents, withdrawals lock/settle, admin adjust) |

**VERIFY first** — see `OWNER-SQL-CHECKLIST.md`.

## Economics (honest)

| Rule | Value |
|------|-------|
| Redeemable | 1 coin = ₦1 |
| Packs | ₦500 / ₦1,000 / ₦5,000 |
| Min withdraw | 500 coins |
| Fee | 50 coins if ≥ 10,000 coins |
| Real-money | **OFF** until `paragon_feature_flags.real_money_enabled = true` |

## Phase 2 RPCs (after #4)

User: `paragon_coin_create_payment_intent`, `paragon_coin_claim_payment`, `paragon_coin_request_withdrawal`, `paragon_coin_my_account`, `paragon_coin_my_ledger`, `paragon_coin_lock_stake`  
Team: `paragon_coin_confirm_payment_intent`, `paragon_coin_complete_withdrawal_v2`, `paragon_coin_reject_withdrawal_v2`, `paragon_coin_admin_adjust`  
Public: `paragon_public_coin_config`

Payment **provider webhooks** are still owner Phase 3 (not SQL).
