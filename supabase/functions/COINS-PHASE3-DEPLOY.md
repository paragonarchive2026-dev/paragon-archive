<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COINS-PHASE3-DEPLOY.md
  EXPECTED PROJECT PATH: /supabase/functions/COINS-PHASE3-DEPLOY.md
  ROLE: Owner deploy guide for Paragon Coins Phase 3 Edge functions + secrets.
-->

# Coins Phase 3 — deploy guide

## 0. SQL first

In Supabase SQL Editor, run in order (skip any already green from VERIFY):

1. `announcements-schema.sql` (if needed)
2. `coins-schema.sql`
3. `coins-master-phase1.sql`
4. `coins-master-phase2.sql`
5. **`coins-master-phase3.sql`** ← webhook inbox, matches, provider settings, `paragon_sql_health`

Then open **Team desk → Settings** and click **Probe SQL health** (uses anon `paragon_sql_health` RPC).

## 1. Edge secrets (Dashboard → Edge Functions → Secrets)

| Secret | Required | Notes |
|--------|----------|--------|
| `SUPABASE_URL` | auto | Usually injected |
| `SUPABASE_SERVICE_ROLE_KEY` | auto / set | **Never** put in browser or Git |
| `PARAGON_COIN_WEBHOOK_SECRET` | **yes** | Long random string; shared with your bank/provider relay |
| `PAYSTACK_SECRET_KEY` | if Paystack | Server only |
| `FLUTTERWAVE_SECRET_KEY` | if Flutterwave | Used as `verif-hash` value |

Public keys only go in `paragon_payment_provider_settings` (SQL), not secrets.

## 2. Deploy functions

```bash
supabase functions deploy coin-payment-webhook --no-verify-jwt
supabase functions deploy coin-reconcile --no-verify-jwt
```

`--no-verify-jwt` is required so providers can POST without a user JWT. Auth is the webhook secret / HMAC.

## 3. Provider URLs

- Paystack webhook:  
  `https://qnylhlyyzpwlfftiygcn.supabase.co/functions/v1/coin-payment-webhook?provider=paystack`
- Flutterwave:  
  `...?provider=flutterwave`
- Manual / bank relay:  
  `...?provider=manual_bank`  
  Header: `X-Paragon-Coin-Secret: <PARAGON_COIN_WEBHOOK_SECRET>`  
  Body JSON: `{ "amount_naira": 5000, "provider_transaction_id": "BANK-REF-123", "sender_name": "..." }`

## 4. Reconcile helper

```bash
curl -s "https://qnylhlyyzpwlfftiygcn.supabase.co/functions/v1/coin-reconcile?action=health" \
  -H "X-Paragon-Coin-Secret: $PARAGON_COIN_WEBHOOK_SECRET"
```

Match manually:

```bash
curl -s -X POST "https://.../functions/v1/coin-reconcile" \
  -H "X-Paragon-Coin-Secret: $PARAGON_COIN_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"op":"match","intent_id":"<uuid>","event_id":"<uuid>","note":"bank ref OK"}'
```

## 5. Real-money gate (still OFF by default)

```sql
-- ONLY after provider + compliance + you are ready:
update public.paragon_feature_flags
set real_money_enabled = true,
    purchases_enabled = true,
    withdrawals_enabled = true,
    updated_at = now()
where id = 1;
```

Do **not** run this casually. Free play works without it.

## 6. What Phase 3 does NOT do

- Does not invent bank money from localStorage
- Does not store provider secret keys in the repo
- Does not claim FCT gaming licence is complete
- Does not auto-enable compete / leaderboard rewards
