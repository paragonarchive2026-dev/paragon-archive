<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SQL-RUN-PACK.md
  EXPECTED PROJECT PATH: /supabase/SQL-RUN-PACK.md
  ROLE: Ordered SQL the owner must run in Supabase Dashboard. Source of truth for money/announcements migrations.
-->

# SQL run pack — Paragon Archive

**Project ref:** `qnylhlyyzpwlfftiygcn`  
**Where to run:** Supabase Dashboard → **SQL** → New query → paste file → **Run**

> This sandbox **cannot** reach Supabase DNS. After you run SQL, paste the VERIFY results from `OWNER-SQL-CHECKLIST.md` so the agent can confirm.

## Status board (owner fills)

| # | File | Status | Action |
|---|------|--------|--------|
| 0 | `schema.sql` | ✅ Live since 2026-08-18 | **DO NOT RE-RUN** |
| 1 | `announcements-schema.sql` | ⬜ Unknown until VERIFY | Run if `paragon_announcements` missing |
| 2 | `coins-schema.sql` | ⬜ Unknown until VERIFY | Run if coin wallets missing |
| 3 | `coins-master-phase1.sql` | ⬜ Unknown until VERIFY | Run after #2 — master §47 foundation |

**VERIFY first:** open `supabase/OWNER-SQL-CHECKLIST.md` and paste the VERIFY block. Only run files whose tables still show `exists = false`.

---

## 1) Announcements

**File:** `supabase/announcements-schema.sql`  
**Creates:** `paragon_announcements`, `paragon_team_members`, RLS, optional seeds.  
**Safe:** idempotent (`create table if not exists`).

---

## 2) Coins Phase 1 — wallets + purchase RPCs (P-100)

**File:** `supabase/coins-schema.sql`  
**Creates:** `paragon_coin_wallets`, `paragon_coin_ledger`, `paragon_coin_purchase_requests`, `paragon_coin_withdrawals`, `paragon_coin_config`, team helper, purchase/approve/reject RPCs.  
**Safe:** idempotent.  
**Does not** enable automatic bank payouts — team desk still confirms.

---

## 3) Coins master Phase 1b — multi-bucket + flags (P-101)

**File:** `supabase/coins-master-phase1.sql`  
**Creates:**  
- `paragon_feature_flags` (`real_money_enabled` **false**)  
- `paragon_economic_settings` (₦1 = 1 coin, packs 500/1000/5000, withdraw fee rules)  
- `paragon_coin_accounts` (available/locked/pending/restricted)  
- `paragon_coin_ledger_v2` (typed append-only)  
- `paragon_payment_intents` / `paragon_payment_events`  
- `paragon_withdrawals` + `paragon_payout_accounts`  
- competition / leaderboard stubs + `paragon_audit_log`  
- RPC `paragon_public_coin_config()` for the Archive shop  

**Safe:** idempotent. **Does NOT turn on real money.**

---

## Economics (honest)

| Rule | Value |
|------|-------|
| Redeemable target | **1 coin = ₦1** |
| Buy packs | ₦500 / ₦1,000 / ₦5,000 → same coins |
| Min withdraw | 500 coins |
| Fee | 50 coins if withdrawal ≥ 10,000 coins |
| Real-money mode | **OFF** until `paragon_feature_flags.real_money_enabled = true` |

LocalStorage balances are **display / offline prototype** until ledger authority is fully wired (master spec).

---

## Still not SQL

- Brevo SMTP hold  
- Payment provider (Paystack / bank feed)  
- Production domain + Auth redirect allowlist  
- Edge function deploy  
- Gaming licence / KYC (legal)

---

## After green

1. Soft-refresh Archive (SW cache **v78**).  
2. Account → Paragon Coins should still open; real-money OFF banner visible.  
3. Team → Paid desk for manual purchase/withdraw review.  
4. Reply with VERIFY output so the agent can mark CTAs complete.
