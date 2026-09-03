<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COINS-DISASTER-RECOVERY.md
-->

# Coins — disaster recovery (foundation)

1. **Do not** edit user balances in the browser or by raw SQL `UPDATE` on `paragon_coin_accounts` without a ledger entry.
2. **Financial pause:** Team desk → Emergency financial pause ON (`paragon_set_financial_pause(true)`).
3. **Preserve:** webhook inbox rows, payment events, audit_log, ledger_v2 — never truncate.
4. **Provider refs:** keep OPay/Moniepoint receipt IDs in `paragon_payout_rail_events` / payment events.
5. **Restore:** Supabase dashboard backups / PITR on your plan; re-deploy Edge functions from repo.
6. **After incident:** run Team **Probe SQL health** + finance report snapshot; match open intents manually.
7. **Honesty copy:** if verification is delayed, tell users transfers are recorded and being reconciled — never pretend credit happened.
