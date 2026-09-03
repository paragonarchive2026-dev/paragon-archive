<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: CHANGES.md
-->
# Changed — P-109 (2026-09-03)

## Stage 2 — Coin system
- `coins-master-stage2-coin-system.sql` — my wallet view, team open intents, unmatched events
- FE: server ledger history, purchase request list, **I paid — claim**, full bucket strip
- Team: Stage 2 server reconcile desk (confirm credit / match+confirm); mirror approve also hits server when UUID
- Docs: COINS-STAGE2.md, checklist Stage 2 rows
- Skipped rebuild of already-complete ledger/idempotency/duplicate SQL
- Cache **v86**
