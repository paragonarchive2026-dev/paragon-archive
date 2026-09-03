<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COINS-PHASE5-OPAY-MONIEPOINT.md
  EXPECTED PROJECT PATH: /supabase/functions/COINS-PHASE5-OPAY-MONIEPOINT.md
  ROLE: Owner guide — OPay / Moniepoint first (not Flutterwave). Phase 5 rails.
-->

# Coins Phase 5 — OPay / Moniepoint (Nigeria first)

## What the coin file actually said

| Source | What it specifies |
|--------|-------------------|
| `docs/skills/PARAGON-COINS-MASTER-BUILD-SPEC.md` §44–45 | **Provider-agnostic** + **bank-transfer-first**, low/no-cost Nigerian setup. Does **not** name Flutterwave as required. |
| `docs/COIN-SYSTEM.md` CTA | Owner still chooses channels: **“transfer/OPay/Paystack free tier?”** |
| Phase 3 code (earlier) | Example adapters included Paystack + Flutterwave because they publish webhook docs — **not** because you chose them. |

**Your preference (OPay or Moniepoint) was not hard-coded before Phase 5.** It is now the **preferred rail**.

## Preferred flow (no Flutterwave required)

```text
User buys coins in Archive
        ↓
Sees OPay and/or Moniepoint account details (from Team SQL settings)
        ↓
User transfers ₦ via OPay or Moniepoint (narration = Paragon email)
        ↓
A) Team pastes credit into coin-reconcile / match UI  — or —
B) Wallet webhook → coin-payment-webhook?provider=opay|moniepoint
        ↓
paragon_coin_ingest_payment_event → match intent → ledger credit
```

Payouts (withdrawals) reverse the path: Team sends ₦ on OPay/Moniepoint → `paragon_payout_rail_record`.

## SQL

Run after phase 1–4:

```text
supabase/coins-master-phase5.sql
```

Then set **public** receive accounts (SQL Editor — not secrets):

```sql
update public.paragon_payment_provider_settings set
  active_provider = 'manual_bank',  -- or 'opay' / 'moniepoint' when webhook live
  preferred_rails = array['opay','moniepoint','manual_bank'],
  opay_account_name = 'YOUR BUSINESS NAME',
  opay_account_number = 'XXXXXXXXXX',
  opay_bank_name = 'OPay',
  moniepoint_account_name = 'YOUR BUSINESS NAME',
  moniepoint_account_number = 'XXXXXXXXXX',
  moniepoint_bank_name = 'Moniepoint MFB',
  bank_transfer_instructions = 'Transfer with OPay or Moniepoint. Put your Paragon email in the narration. Coins credit after confirmation only.',
  payout_rail = 'manual_opay_moniepoint'
where id = 1;
```

## Edge secrets (only what you use)

| Secret | When |
|--------|------|
| `PARAGON_COIN_WEBHOOK_SECRET` | Always (shared relay / manual tools) |
| `OPAY_WEBHOOK_SECRET` | If OPay business webhook is enabled |
| `MONIEPOINT_WEBHOOK_SECRET` | If Moniepoint webhook is enabled |
| `PAYSTACK_SECRET_KEY` / `FLUTTERWAVE_SECRET_KEY` | **Optional only** — not required for your story |

Redeploy:

```bash
supabase functions deploy coin-payment-webhook --no-verify-jwt
```

Webhook URLs:

- `.../functions/v1/coin-payment-webhook?provider=opay`
- `.../functions/v1/coin-payment-webhook?provider=moniepoint`
- `.../functions/v1/coin-payment-webhook?provider=manual_bank`

## What Phase 5 does **not** do

- Does not flip `real_money_enabled`
- Does not auto-call OPay/Moniepoint payout APIs without your merchant keys (manual rail is default and honest)
- Does not replace phases 1–4

## Phases remaining after 5

See `docs/COINS-PHASES.md`.
