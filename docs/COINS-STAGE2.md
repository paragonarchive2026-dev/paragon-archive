<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COINS-STAGE2.md
-->

# Stage 2 — Coin system (complete in repo)

## Flow

```text
User picks pack → paragon_coin_create_payment_intent (idempotent)
        ↓
status = awaiting_transfer  (NO coins yet)
        ↓
User pays OPay/Moniepoint → claimCoinPayment (receipt ref, max 5/24h)
        ↓
Team Stage 2 desk: Confirm credit  OR  Match event + confirm
        ↓
paragon_coin_confirm_payment_intent → PURCHASE_CREDIT on ledger_v2
        ↓
available_coins ↑   (locked unchanged unless withdraw/stake)
```

## Files

| Piece | Path |
|-------|------|
| SQL | `supabase/coins-master-stage2-coin-system.sql` |
| FE shop | `app.js` — wallet view, claim, intents, history, buckets |
| Team | desk Stage 2 reconcile + server confirm on approve |
| Prior | phase2 create/claim/confirm, phase3 match/webhook |

## What was already done (skipped rebuild)

- Ledger post_entry + FOR UPDATE
- Idempotency unique indexes
- Duplicate provider tx unique index
- available/locked/pending/restricted buckets

## Owner run

```text
… phase1 → phase2 → stage1-hardening → stage2-coin-system → phase3 …
```
