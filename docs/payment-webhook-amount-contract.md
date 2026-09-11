# OPay / Moniepoint amount safety

The webhook no longer guesses units from amount magnitude. Both providers now
require an explicitly unit-labelled amount from a trusted server adapter:

- `amountNaira` or `amount_naira`: whole naira.
- `amountInKobo`: kobo, exactly divisible by 100.

Fields may be in the selected `data` / `transaction` object or the root payload.
If several explicit fields exist they must agree. Non-positive, fractional-naira,
non-finite and unsafe-integer amounts are rejected. Bare `amount`, `orderAmount`,
`transAmount`, `transactionAmount`, and `settlementAmount` are not accepted.
Successful status must match an allowed status exactly; `unsuccessful` is not success.
There is no generic fallback for either provider. Unsupported events return HTTP
422 before inbox/event writes or credit RPCs. Monitor these responses and reconcile
rejected transfers against provider records; do not consider them credited.

## Deployment gate

These are explicit adapter field contracts, **not verified native provider schemas**.
Before enabling native OPay or Moniepoint traffic, obtain redacted sandbox webhook
samples and the applicable product/version documentation from each merchant account.
Verify field path, unit, success status, currency, transaction identity and signature
scheme. Add the samples as fixtures, implement the documented mapping, then exercise
duplicate delivery and ledger balances in staging. Do not restore magnitude guessing
or deploy expecting bare native `amount` fields to work.

Local synthetic regressions (Node 22.13+):

```sh
node --test tests/finance-rest-auth.test.js tests/webhook-amounts.test.js
node tests/suite-finance.test.js
```

The Team desk helper separately awaits the refreshed ParagonAuth session and uses
its access token as Authorization while retaining the anon API key. Verify a signed-in
roster member and a non-team account against staging RLS before production rollout.
No production deployment or real payment verification is implied by these tests.
