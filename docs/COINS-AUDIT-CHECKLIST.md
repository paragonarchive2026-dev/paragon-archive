<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COINS-AUDIT-CHECKLIST.md
  EXPECTED PROJECT PATH: /docs/COINS-AUDIT-CHECKLIST.md
  ROLE: Owner-facing done/not-done against master coin checklist + Stage 1 status (P-108).
-->

# Paragon Coins — audit checklist (done vs not yet)

**Legend:** ✅ done in repo · 🟡 partial / needs owner run or live keys · ❌ not built yet · 🔒 owner/legal only

**Authority rule:** Browser/`localStorage` = **display cache only**. Server ledger + RPCs = truth when SQL is run.

**Real-money:** `real_money_enabled` defaults **false** and stays false until you flip it after provider + compliance.

---

## Your product rules

| Item | Status | Where |
|------|--------|--------|
| Existing-code audit | ✅ | This file + `docs/COINS-PHASES.md` + phases 1–5 SQL |
| Guest/account rules | ✅ | Guest = free-play only; buy/withdraw/stake need real account (`app.js` + phase2 RPCs) |
| Free vs competitive mode | ✅ | Free always; compete gated by `compete_enabled` + server settle |
| 5% competition model | ✅ | `competition_fee_bps = 500` (5% of two-player pool) phase1 + settle phase4 |
| ₦1 = 1 coin denomination | ✅ | `naira_per_coin_purchase/redeemable = 1.0` |
| 100-coin minimum stake | ✅ | `min_stake_coins = 100` |
| 10,000-coin initial stake max | ✅ | `max_stake_coins = 10000` |
| Creator quiz rules | 🟡 | Prize lock/award RPCs phase4; **paid quiz play server** still not full product |
| Weekly leaderboard/reward system | 🟡 | Periods + settle + top-10 shares phase4; needs team to open periods + feed scores |
| 30% fee-revenue → rewards | ✅ | Stage1 hardening: fee credits `reward_reserve`; settle draws policy |
| ₦10,000+ withdrawal → 50-coin fee | ✅ | `withdraw_fee_coins_at_or_above = 10000`, `withdraw_fee_coins = 50` |
| 2 withdrawals/24h + 5/7 days | ✅ | Enforced in `paragon_coin_request_withdrawal` (stage1 hardening) |
| 5 payment claims/24h | ✅ | Enforced in `paragon_coin_claim_payment` (stage1 hardening) |
| Payment reconciliation | ✅ | phase3 match/confirm + webhook inbox + Team probe |
| Bank-transfer architecture | ✅ | OPay/Moniepoint-first phase5; manual_bank path |
| Duplicate-payment protection | ✅ | Unique `(provider, provider_transaction_id)` + idempotent ingest |
| Idempotency | ✅ | Ledger + intents + withdrawals + competition join keys |
| Race-condition protection | ✅ | `FOR UPDATE` on accounts/intents; advisory locks (hardening) |
| Server-authoritative games | ✅ | Stage 3 settle + points; free UI can still be local |
| Quiz security (paid) | ❌ | Free quiz is client; paid competitive quiz needs server answers/results (**Stage 2+**) |
| Anti-cheat/collusion | 🟡 | Foundations ✅ (flags/events/preflight); full graph still later |
| Multiple-account controls | 🟡 | KYC draft + risk flags; no automated device graph yet |
| Admin/Team financial permissions | ✅ | `paragon_is_team_member` + team-only RPCs + audit log |
| Financial ledger architecture | ✅ | Multi-bucket accounts + append-only `paragon_coin_ledger_v2` |
| Reserve/liability accounting | ✅ | Platform books + liability snapshot RPC (stage1 hardening) |
| Withdrawal state machine | ✅ | lock → complete/reject RPCs phase2 + payout rail phase5 |
| Disaster recovery | 🟡 | `docs/COINS-DISASTER-RECOVERY.md`; backups = your Supabase plan |
| Audit logs | ✅ | `paragon_audit_log` on money moves |
| Financial reports | ✅ | `paragon_finance_report_snapshot` + Team desk |
| Supabase/RLS architecture | ✅ | RLS on accounts/ledger/intents; no client ledger insert |
| Edge/server function architecture | ✅ | webhook, reconcile, competition-settle (deploy = owner) |
| Testing requirements | 🟡 | Suite fixtures P-100–P-108; live SQL tests need your project |
| Production-readiness checklist | 🟡 | Owner gates remain (SQL run, Edge deploy, accounts, licence) |

---

## Stage 1 — Foundation

| Stage 1 task | Status |
|--------------|--------|
| Audit the actual current code | ✅ |
| Preserve existing Paragon functionality | ✅ free play / catalogue / guest unchanged |
| Create proper coin database/ledger structure | ✅ phases 1–2 + hardening |
| Move authority away from localStorage | ✅ server RPCs; FE cache only |
| Add RLS | ✅ |
| Add server-side financial functions | ✅ |
| Keep real-money mode safely disabled | ✅ default `false`; agent never flips it |

**Stage 1 = complete in the repository.** You still must **run** the SQL in Supabase for it to be live.

### SQL run order (owner)

```text
coins-schema.sql                    (if never run)
coins-master-phase1.sql
coins-master-phase2.sql
coins-master-stage1-hardening.sql   ← rate limits, reserves, reports (P-108)
coins-master-phase3.sql
coins-master-phase4.sql
coins-master-phase5.sql             ← OPay/Moniepoint
```

---

## NOT Stage 1 (provide these as Stage 2 when ready)

- Live OPay/Moniepoint **API** auto-payout (manual rail is foundation-complete)
- Flip `real_money_enabled`
- Full **server paid-quiz** engine + answer security
- Automated multi-account / device graph
- Gaming licence / legal pack (🔒 you only)

**After you accept Stage 1, paste Stage 2** and we only build what is still open.

---

## Stage 2 — Coin system (P-109)

| Item | Status |
|------|--------|
| Purchase requests | ✅ create intent RPC + FE request + my intents list + claim |
| Payment reconciliation architecture | ✅ match/confirm + Team Stage 2 reconcile desk + webhook ingest |
| Coin credits | ✅ only via confirm/match → PURCHASE_CREDIT ledger (never on request click) |
| Transaction history | ✅ server ledger via `paragon_coin_my_wallet_view` + shop history |
| Locked/available balances | ✅ multi-bucket account + shop bucket strip |
| Idempotency | ✅ intent/ledger keys; confirm key `purchase:<id>` |
| Duplicate-payment protection | ✅ unique (provider, provider_transaction_id) |

**SQL:** `coins-master-stage2-coin-system.sql` after phase2 (+ stage1-hardening recommended).

---

## Stage 3 — Games (P-110)

| Item | Status |
|------|--------|
| 1v1 staking | ✅ |
| 5% competition fee | ✅ |
| Server-authoritative settlement | ✅ |
| Draw/void/refund | ✅ |
| Competitive points | ✅ |
| Anti-cheat foundations | ✅ |

See `docs/COINS-STAGE3.md`.

See `docs/COINS-STAGE4.md`.
