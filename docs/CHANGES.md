# Changed — P-111 (2026-09-03)

## Stage 4 — Quiz
- `coins-master-stage4-quiz.sql` — quiz definitions + public view (no answer_key), paid attempts, server score RPCs, creator prize award/refund harden, void refund, health
- FE: `quiz-paid-bridge.js` + play/create paid hooks; free localStorage path unchanged
- Team: Stage 4 prize award + paid attempt void desk
- Docs COINS-STAGE4; cache **v88**

# Changed — P-110 (2026-09-03)

## Stage 3 — Games
- `coins-master-stage3-games.sql` — competitive points, anticheat events/flags, preflight, open challenges, enhanced settle (points + fee books)
- FE: 1v1 compete desk (create/join; never client settle)
- Team: Stage 3 settle WIN/DRAW/VOID + anticheat flag
- Edge settle optionally records fee→reward reserve
- Docs COINS-STAGE3; cache **v87**
