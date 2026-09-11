<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: EDGE-DEPLOY-RUNBOOK.md
  EXPECTED PROJECT PATH: /supabase/functions/EDGE-DEPLOY-RUNBOOK.md
  ROLE: Consolidated owner runbook — deploy the three coin Edge Functions + set secrets (P-118). SQL is done through Phase 5 + Stage 4; this is the actual next blocker.
-->

# Edge deploy runbook — coin functions (P-118)

**Status — 2026-09-11: ✅ ALL SQL DONE through Phase 5 + Stage 4.**
This runbook is the next actual blocker. It is application code + secrets, not SQL.

**Project ref:** `qnylhlyyzpwlfftiygcn`  
**Functions:** `coin-payment-webhook` · `coin-reconcile` · `competition-settle`  
**Code:** `supabase/functions/<name>/index.ts` (in this repo, no TODOs — deployable as-is)

---

## 1. Secrets (Dashboard → Edge Functions → Secrets) — DO THIS FIRST

| Secret | Required | Used by | Notes |
|--------|----------|---------|-------|
| `SUPABASE_URL` | auto | all | Usually injected by Supabase; verify it exists |
| `SUPABASE_SERVICE_ROLE_KEY` | auto / set | all | **Never** in Git, chat, or browser code |
| `PARAGON_COIN_WEBHOOK_SECRET` | **yes** | all three | Long random string (≥32 chars). Shared with your bank/provider relay. Sent as `X-Paragon-Coin-Secret` header |
| `OPAY_WEBHOOK_SECRET` | only if OPay business webhook enabled | `coin-payment-webhook` | Leave unset for manual-rail flow |
| `MONIEPOINT_WEBHOOK_SECRET` | only if Moniepoint webhook enabled | `coin-payment-webhook` | Leave unset for manual-rail flow |
| `PAYSTACK_SECRET_KEY` | optional only | `coin-payment-webhook` | Not required for the OPay/Moniepoint story |
| `FLUTTERWAVE_SECRET_KEY` | optional only | `coin-payment-webhook` | Not required; used as `verif-hash` value |

Generate the shared secret locally (never paste the value into chat/Git):

```bash
openssl rand -hex 32
```

Then paste it into **Dashboard → Edge Functions → Secrets** as
`PARAGON_COIN_WEBHOOK_SECRET`.

---

## 2. Deploy (Supabase CLI, logged in)

```bash
supabase functions deploy coin-payment-webhook --no-verify-jwt
supabase functions deploy coin-reconcile --no-verify-jwt
supabase functions deploy competition-settle --no-verify-jwt
```

`--no-verify-jwt` is required so payment providers can POST without a user JWT.
Auth is the webhook secret / provider HMAC instead — each function refuses
traffic when its expected secret is missing (HTTP 503, fail-closed).

Redeploy any single function the same way after a code change. No SQL re-run needed.

---

## 3. Webhook URLs (give these to the provider / relay)

Base: `https://qnylhlyyzpwlfftiygcn.supabase.co/functions/v1`

| Provider | URL |
|----------|-----|
| OPay | `…/coin-payment-webhook?provider=opay` |
| Moniepoint | `…/coin-payment-webhook?provider=moniepoint` |
| Manual / bank relay | `…/coin-payment-webhook?provider=manual_bank` |
| Paystack (optional) | `…/coin-payment-webhook?provider=paystack` |
| Flutterwave (optional) | `…/coin-payment-webhook?provider=flutterwave` |

Manual relay call shape (header + JSON body):

```bash
curl -s -X POST "https://qnylhlyyzpwlfftiygcn.supabase.co/functions/v1/coin-payment-webhook?provider=manual_bank" \
  -H "X-Paragon-Coin-Secret: $PARAGON_COIN_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"amount_naira": 5000, "provider_transaction_id": "BANK-REF-123", "sender_name": "..."}'
```

Manual is the default honest rail: user transfers via OPay/Moniepoint with their
Paragon email in the narration → Team confirms in the reconcile desk (or relay
POSTs here) → ingest → match intent → ledger credit. Nothing credits coins from
an unverified client call.

---

## 4. Verify (in order — stop at the first failure)

```bash
# 1) Reconcile health (proves secrets + service key wiring)
curl -s "https://qnylhlyyzpwlfftiygcn.supabase.co/functions/v1/coin-reconcile?action=health" \
  -H "X-Paragon-Coin-Secret: $PARAGON_COIN_WEBHOOK_SECRET"

# 2) Webhook rejects bad secrets (proves auth is fail-closed)
curl -s -X POST "https://qnylhlyyzpwlfftiygcn.supabase.co/functions/v1/coin-payment-webhook?provider=manual_bank" \
  -H "Content-Type: application/json" \
  -d '{"amount_naira": 1, "provider_transaction_id": "PROBE-BAD-SECRET"}'
# → expect 401/403, and NO row in paragon_payment_webhook_inbox

# 3) Team desk → Probe SQL health now (proves paragon_sql_health RPC live)

# 4) Manual match drill (after a real test intent exists; see §5)
curl -s -X POST "https://qnylhlyyzpwlfftiygcn.supabase.co/functions/v1/coin-reconcile" \
  -H "X-Paragon-Coin-Secret: $PARAGON_COIN_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"op":"match","intent_id":"<uuid>","event_id":"<uuid>","note":"bank ref OK"}'
```

---

## 5. First live drill (recommended before announcing coins)

1. Create a **₦500 test purchase intent** from the Archive coin shop (signed-in test account).
2. Transfer ₦500 via OPay/Moniepoint with the test email in the narration.
3. Relay POST (manual_bank, §3) **or** Team desk reconcile → match → confirm.
4. Check: ledger credit exactly ₦500→500 coins; intent `confirmed`; inbox row stored.
5. Create + join a **100-coin 1v1 challenge** from two test accounts; settle via
   `competition-settle`/Team desk; check 5% fee math + single credit (no double-pay).
6. Attempt a duplicate webhook POST with the same `provider_transaction_id` —
   must be deduped, never double-credited.

---

## 6. What these functions NEVER do (law, enforced in code)

- Never credit coins from an unverified client request.
- Never flip `real_money_enabled` (DB flag, owner SQL only).
- Never auto-confirm while `financial_pause` is true.
- Never log or return secret values.
- Never settle a competition from the browser — `competition-settle` is the referee.

Real-money gate (ONLY after provider + compliance + owner go-ahead):

```sql
update public.paragon_feature_flags
set real_money_enabled = true,
    purchases_enabled = true,
    withdrawals_enabled = true,
    updated_at = now()
where id = 1;
```

---

## 7. Troubleshooting

| Symptom | Check |
|---------|-------|
| `503 Supabase service not configured` | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` missing in Edge secrets |
| `503 …_SECRET not set; refusing traffic` | The named secret is missing — set it, no redeploy needed |
| `401/403` on every call | Wrong `X-Paragon-Coin-Secret` value vs Dashboard secret |
| Webhook 200 but no credit | Expected: ingest stores inbox + event; credit happens on match/confirm (Team/reconcile), never on receipt alone |
| Duplicate provider POSTs | Safe: `(provider, provider_transaction_id)` is UNIQUE; replays are deduped |
| `competition-settle` refuses | Check `financial_pause`, stake range 100–10,000, two seated players |

## 8. Rollback

Edge deploys are versioned in the Dashboard (Edge Functions → function → Versions):
re-deploy the previous version, or delete the function to fail closed (SQL + free
play are unaffected — the device layers keep working offline-first).
