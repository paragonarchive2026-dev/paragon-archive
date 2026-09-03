<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COINS-STAGE3.md
-->

# Stage 3 — Games (complete in repo)

## Scope

| Item | Status |
|------|--------|
| 1v1 staking | ✅ create + join lock stakes (100–10k) |
| 5% competition fee | ✅ `fee = 5% of (stake×2)` at create; taken on **win** settle |
| Server-authoritative settlement | ✅ team/service only; Edge `competition-settle` |
| Draw / void / refund | ✅ `settled_draw` / `voided` return locked stakes |
| Competitive points | ✅ win 10 / participate-or-draw 2 → points + leaderboard period |
| Anti-cheat foundations | ✅ risk flags, anticheat events, preflight velocity checks |

## Flow

```text
Create challenge → lock my stake
Join challenge → lock opponent stake → READY
Play (any free UI) — client result is NOT money truth
Team/Edge settle:
  settled_win  → winner gets pool − 5% fee; points awarded
  settled_draw → both stakes returned; small points
  voided       → both stakes returned; no fee; no win points
```

## SQL

`supabase/coins-master-stage3-games.sql` after **phase4**.

## FE / Team

- Account → **1v1 competitive stake**
- Team desk → **Stage 3 — 1v1 settle**

## Explicitly still later

- Full paid **quiz answer server** (separate from stake rails)
- Automated collusion graph / device fingerprint network
- Live multiplayer transport (WebSocket) — not required for money rails
