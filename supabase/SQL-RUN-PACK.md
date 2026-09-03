<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SQL-RUN-PACK.md
  EXPECTED PROJECT PATH: /supabase/SQL-RUN-PACK.md
  ROLE: Ordered SQL the owner must run in Supabase Dashboard.
-->

# SQL run pack — Paragon Archive

**Project ref:** `qnylhlyyzpwlfftiygcn`  
**Where:** Supabase Dashboard → **SQL** → New query → paste file → **Run**

## Confirm what is live

### A) From your browser (recommended)
1. Open **Team desk → Settings** (or the desk section **Backend SQL health**).
2. Click **Probe SQL health now**.
3. ✅ / ❌ lines show which tables and RPCs exist.

### B) From SQL Editor
Paste VERIFY from `OWNER-SQL-CHECKLIST.md`.

### C) From this coding sandbox
**Usually fails** with `Name or service not known` (no DNS to `*.supabase.co`). Do not treat sandbox failure as “SQL not run.”

---

## Run order

| # | File | Purpose |
|---|------|---------|
| 0 | `schema.sql` | **DO NOT RE-RUN** (live 2026-08-18) |
| 1 | `announcements-schema.sql` | Announcements + team members |
| 2 | `coins-schema.sql` | Wallets, legacy ledger, purchase RPCs |
| 3 | `coins-master-phase1.sql` | Multi-bucket accounts, flags, economy, intents |
| 4 | `coins-master-phase2.sql` | Authority RPCs (post, lock, confirm, withdraw) |
| 5 | `coins-master-phase3.sql` | Matches, webhook inbox, provider settings, `paragon_sql_health` |
| 6 | `coins-master-phase4.sql` | Competitions settle, leaderboard rewards, creator prizes, cases, risk, pause RPC |

Skip any step whose objects already show ✅ on the probe.

## Phase 3–4 Edge (after SQL #5–6)

- `coin-payment-webhook`, `coin-reconcile` (phase 3)
- `competition-settle` (phase 4) — settle / leaderboard / pause / award prize

## Phase 3 Edge (after SQL #5)

See `supabase/functions/COINS-PHASE3-DEPLOY.md`:

- `coin-payment-webhook` — Paystack / Flutterwave / manual bank relay
- `coin-reconcile` — health, open intents, manual match

Secrets: `PARAGON_COIN_WEBHOOK_SECRET`, optional `PAYSTACK_SECRET_KEY` / `FLUTTERWAVE_SECRET_KEY`.

## Economics

| Rule | Value |
|------|-------|
| 1 coin | ₦1 redeemable target |
| Packs | ₦500 / ₦1,000 / ₦5,000 |
| Min withdraw | 500 coins |
| Fee | 50 coins if ≥ 10,000 |
| `real_money_enabled` | **false** until you flip it |

## Still not SQL

Brevo SMTP, production domain, gaming licence/KYC, provider account signup.
