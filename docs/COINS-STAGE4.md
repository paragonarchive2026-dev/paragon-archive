<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COINS-STAGE4.md
-->

# Stage 4 — Quiz (complete in repo)

## Scope

| Item | Status |
|------|--------|
| Paid quizzes (entry fee lock) | ✅ `paragon_quiz_start_paid_attempt` |
| Creator-funded prizes | ✅ phase4 lock + stage4 award/refund harden |
| Creator self-play protection | ✅ not prize-eligible, not leaderboard-eligible; award blocks creator |
| Server-side scoring | ✅ `paragon_quiz_score_attempt` — answer_key never to client |
| Paid-attempt protection | ✅ max attempts, fee consume on score, void refund, idempotency |

## Flow

```text
Creator publishes quiz (answer_key stays server-side)
  optional: lock creator prize from creator balance
Player free play → localStorage only (unchanged)
Player paid play (?paid=1 or entry fee > 0):
  start_paid_attempt → lock entry fee
  submit answers → server scores against answer_key
  fee consumed on score; void refunds unfinished
Team awards creator prize to eligible winner (never creator)
```

## SQL

`supabase/coins-master-stage4-quiz.sql` after **phase4** (stage3 recommended).

Owner order:

```text
… → coins-master-phase4.sql
  → coins-master-stage3-games.sql   (if competing)
  → coins-master-stage4-quiz.sql
  → phase5 as needed
```

## FE / Team

- `paragon-quiz/` free play stays offline/local
- `paragon-quiz/js/quiz-paid-bridge.js` — RPC bridge (no keys)
- Create form: optional entry fee + creator prize coins
- Play: paid start/score when configured
- Team desk → **Stage 4 — Paid quiz & creator prizes**

## Explicitly still later

- Production `real_money` / `compete` flag flip
- Automated prize distribution by leaderboard rank
- Full quiz marketplace UX
