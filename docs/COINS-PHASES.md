<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COINS-PHASES.md
  EXPECTED PROJECT PATH: /docs/COINS-PHASES.md
  ROLE: Honest map of coin SQL phases built vs remaining + OPay/Moniepoint story.
-->

# Paragon Coins — phases built vs remaining

## Your payment story (important)

| Question | Answer |
|----------|--------|
| Did the coin master file **require** Flutterwave? | **No.** It requires a **provider-agnostic**, **bank-transfer-first** Nigerian design (§44–45). |
| Did `docs/COIN-SYSTEM.md` mention OPay? | **Yes** — owner CTA lists `transfer/OPay/Paystack free tier?` as choices still needed. |
| Why did Phase 3 mention Paystack/Flutterwave? | Example webhook adapters with public docs — **not** a product decision that you must use them. |
| What is preferred now (Phase 5)? | **OPay and Moniepoint** (plus manual bank). Flutterwave/Paystack stay optional. |

Tell us the full OPay/Moniepoint merchant story when ready (account numbers, whether you have business API/webhooks, or pure manual confirm). Until then the engine stays **manual confirm + optional webhook**.

## Phases in the repository

| Phase | Artifact | Status |
|-------|----------|--------|
| 0 / base | `coins-schema.sql` + FE shop | Built (legacy + UI) |
| **1** | `coins-master-phase1.sql` | **Built** — accounts, flags, economy, intents skeleton |
| **2** | `coins-master-phase2.sql` | **Built** — ledger authority RPCs, withdraw lock |
| **1b** | `coins-master-stage1-hardening.sql` | **Built (P-108)** — claim/withdraw limits, reserves, 30% fee→reward, finance report |
| **2b** | `coins-master-stage2-coin-system.sql` | **Built (P-109)** — my wallet view, team open intents, Stage 2 FE/Team wire |
| **3** | `coins-master-phase3.sql` + webhook/reconcile Edge | **Built** — matches, inbox, health (adapters were generic + PS/FW examples) |
| **4** | `coins-master-phase4.sql` + competition-settle | **Built** — compete settle, leaderboard, cases, finance desk |
| **5** | `coins-master-phase5.sql` + OPay/Moniepoint webhook path | **Built (P-107)** — preferred rails, KYC draft, payout rail log, public OPay/Moniepoint fields |

### After Phase 5 — what is still **remaining** (not more numbered SQL “must” phases)

These are **owner / production** steps, not missing agent code folders:

1. **You run SQL 1→5** in Supabase (agent cannot DNS-verify).
2. **You deploy Edge** functions + set `PARAGON_COIN_WEBHOOK_SECRET` (+ OPay/Moniepoint secrets if any).
3. **You publish** OPay/Moniepoint account numbers in `paragon_payment_provider_settings`.
4. **Optional Phase 6-class work** (only when you want it):  
   - Live OPay/Moniepoint **API** payout (not just manual record)  
   - Server-authoritative **paid quiz** play (master §9)  
   - Full **regulatory/KYC provider** integration  
   - Flip `real_money_enabled` after licence/compliance  
5. **No Phase 6 SQL file is required** for free-play; Phase 5 completes the **Nigeria-first rail** story in-repo.

**Short answer:** SQL phases **1–5 are built**. **Zero mandatory SQL phases remain.** Remaining work is **owner activation** + optional live wallet APIs / paid-quiz server / compliance gate.

## Run order

```text
announcements-schema.sql   (if not done)
coins-schema.sql           (if not done)
coins-master-phase1.sql
coins-master-phase2.sql
coins-master-phase3.sql
coins-master-phase4.sql
coins-master-phase5.sql    ← OPay/Moniepoint
```

Guide: `supabase/functions/COINS-PHASE5-OPAY-MONIEPOINT.md`
