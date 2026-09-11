<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SQL-RUN-PACK.md
  EXPECTED PROJECT PATH: /supabase/SQL-RUN-PACK.md
  ROLE: Ordered SQL the owner must run in Supabase Dashboard.
-->

# SQL run pack — Paragon Archive

**Project ref:** `qnylhlyyzpwlfftiygcn`  
**Where:** Supabase Dashboard → **SQL** → New query → paste file → **Run**  
**Status — 2026-09-11 (P-118): ✅ ALL SQL DONE through Phase 5 + Stage 4.**
Run order below is kept for fresh projects / audit. Next blocker is Edge deploys
(`supabase/functions/EDGE-DEPLOY-RUNBOOK.md`), not SQL.

## Confirm what is live (full assurance)

**Easiest:** paste Script A from `supabase/SUPABASE-AI-VERIFY-PROMPT.md` into Supabase SQL (or Supabase AI), copy results back to chat.  
**Or:** Team desk → Probe SQL health.  
**Or:** GitHub Actions → workflow `Supabase SQL health` (anon secrets only).  
**Or (this interface):** ask the agent — it has a direct Supabase connector here
and can verify/apply migrations in-chat (P-118: the old "agent can't reach
Supabase" note is outdated; manual paste is now the fallback, not the route).

## Confirm what is live

### A) From your browser (recommended)
1. Open **Team desk → Settings** (or the desk section **Backend SQL health**).
2. Click **Probe SQL health now**.
3. ✅ / ❌ lines show which tables and RPCs exist.

### B) From SQL Editor
Paste VERIFY from `OWNER-SQL-CHECKLIST.md`.

### C) From the coding agent (this interface)
Ask in chat — the agent's Supabase connector can report live objects directly.
The old sandbox note (**`Name or service not known`** on `*.supabase.co`) applied
to earlier sandboxes without the connector; do not treat legacy wording in old
docs as current. Manual paste remains a valid fallback.

---

## Run order

| # | File | Purpose |
|---|------|---------|
| 0 | `schema.sql` | **DO NOT RE-RUN** (live 2026-08-18) |
| 1 | `announcements-schema.sql` | Announcements + team members |
| 2 | `coins-master-phase1.sql` | Multi-bucket accounts, flags, economy, intents, withdrawals v2 |
| 3 | `coins-master-phase2.sql`, then `coins-master-stage1-hardening.sql` | Authority RPCs (post, lock, confirm, withdraw) + rate limits, reserves, finance report |
| 4 | `coins-master-phase3.sql` | Matches, webhook inbox, provider settings, `paragon_sql_health` |
| 5 | `coins-master-phase4.sql` | Competitions settle, leaderboard rewards, creator prizes, cases, risk, pause RPC |
| 6 | `coins-master-phase5.sql` | OPay/Moniepoint rails + KYC (P-107) |
| 7 | `coins-master-stage2-coin-system.sql` | Purchase intents → claim → reconcile (after #3; see `docs/COINS-STAGE2.md`) |
| 8 | `coins-master-stage3-games.sql` | 1v1 stake games, competitive points, anti-cheat (after #5; see `docs/COINS-STAGE3.md`) |
| 9 | `coins-master-stage4-quiz.sql` | Paid quiz, server scoring, creator prizes (after #8; see `docs/COINS-STAGE4.md`) |

Skip any step whose objects already show ✅ on the probe.

> ⛔ **NOT in the run order (SUPERSEDED — do not run):** `coins-schema.sql`,
> `finance-schema.sql`, `leaderboards-schema.sql`. Earlier incompatible drafts,
> never applied; their table shapes conflict with the live master architecture
> (D-237). Each file carries a ⛔ banner. Earlier versions of this pack wrongly
> listed `coins-schema.sql` as step 2 — corrected P-118.

## Edge deploy (after SQL — the current blocker)

- `coin-payment-webhook`, `coin-reconcile` (phase 3)
- `competition-settle` (phase 4) — settle / leaderboard / pause / award prize

See **`supabase/functions/EDGE-DEPLOY-RUNBOOK.md`** (consolidated):

- `coin-payment-webhook` — OPay / Moniepoint / manual bank relay (+ optional Paystack/Flutterwave)
- `coin-reconcile` — health, open intents, manual match
- `competition-settle` — server-side competition settle + leaderboard ops

Secrets: `PARAGON_COIN_WEBHOOK_SECRET`, optional `OPAY_WEBHOOK_SECRET` /
`MONIEPOINT_WEBHOOK_SECRET` / `PAYSTACK_SECRET_KEY` / `FLUTTERWAVE_SECRET_KEY`.
Set in Dashboard → Edge Functions → Secrets. Never in Git, chat, or the browser.

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
