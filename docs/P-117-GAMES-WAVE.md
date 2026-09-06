# P-117 — Premium game rooms: Paragon Spin + Paragon Chess

Date: 2026-09-06  
Status: built in repository; owner visual/gameplay demo pending

## Owner direction implemented

- Continue improving earlier game work so game screens feel like real environments rather than toys or avatars.
- Build **Paragon Spin**, then **Paragon Chess**, for owner review.
- Free play must work for Guest, signed-in players and accounts with zero coins.
- Future Bet mode is human-versus-human, never player-versus-computer.
- In each game environment provide a game-specific leaderboard with General / Free / Bet / Multiplayer views; General combines modes.
- Do not build stake UI or the `paragon_game_settle` client path until real money is switched ON.
- Do not fabricate users who appear to be searching for a match.

## Delivered

### Paragon Spin

`games/spin/` is a free-only twelve-sector Precision Wheel duel:

- six turns;
- player and house lock a prediction;
- one shared seeded result scores both sides;
- exact = 120, adjacent = 60, two away = 25, otherwise 0;
- circular distance and deterministic wheel landing;
- exact resume, local bests and audit trail;
- premium brass/enamel private-room design and high-resolution photographic hero.

### Paragon Chess

`games/chess/` is a free player-versus-computer game:

- full legal movement and king safety;
- check/checkmate and stalemate;
- castling, en passant and all four promotion choices;
- threefold, fifty-move and insufficient-material draws;
- Casual / Club / Master local alpha-beta strengths;
- position hints, captured material and signed move ledger;
- exact resume and premium walnut tournament-room design.

### Shared in-game leaderboard

`ParagonGameKit.mountLeaderboard()` renders only actual local sessions or production adapter rows explicitly marked `verified: true`. General sums Free / Bet / Multiplayer for a player. Free performance is game-local and never calls the revenue-funded `ParagonLeaderboards.recordResult` path. Bet and Multiplayer are honest empty views while their server modes are off.

### Existing Cards

Paragon Cards received a realism pass: tactile felt and walnut table, paper-textured cards, restrained brass navigation, and the same game-specific performance board. `buildProgress` remains 90 pending owner review.

## Backend/storage decision

Do **not** add Firebase merely to “save Supabase space.” Free games use local device storage and static Vercel/CDN assets, consuming no Supabase game-session rows. The existing Supabase stack remains the single authority for authentication and future verified online/money state. Adding Firebase now would duplicate identity, RLS and sync responsibilities.

When online play is approved, store only compact authoritative match/presence records in Supabase (or an explicitly selected realtime provider after an architecture review), not free-game animation/assets or every local move. Money settlement remains server-only.

## Vercel note

PR #5 is already merged. GitHub deployment state shows immediate configuration failures and links to Vercel project configuration. The previous `vercel.json` introduced `$comment` and `errorDocument`, which are not accepted project-config fields; P-117 removes them and adds the official schema declaration. A private Vercel dashboard session is still required to retrieve the exact old failed-build log. PR #6's Vercel Preview now succeeds with the corrected file, confirming the repository fix; production follows the merge.
