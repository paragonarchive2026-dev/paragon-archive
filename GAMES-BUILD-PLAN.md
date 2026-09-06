# PARAGON ARCHIVE — GAMES BUILD PLAN (P-114)

Owner note: "Maybe I should start building all the games — let's think on how we should build the games."
This plan is written against what ALREADY exists in the repo, so each game plugs into real engines
instead of inventing new money/leaderboard logic.

> **STATUS — 2026-09-06 (P-117).** The shared framework and anti-cheat/UX shell are built.
> Three honest free game rooms are now live: **Paragon Cards** (Higher·Lower + Blackjack 21),
> **Paragon Spin** (Precision Wheel) and **Paragon Chess** (full-rule computer chess at three
> strengths). The owner directly requested Spin then Chess in this pass, so both were completed
> ahead of Arcade. All three remain at `buildProgress: 90` pending the owner's demo pass; none is
> falsely marked 100. The shared game-specific performance board now has **General / Free / Bet /
> Multiplayer** views: General includes actual local free performance, while unavailable online
> views show zero real rows rather than sample players. Remaining order is **Arcade → Quiz onto the
> engine → Cards wave 2 (solitaire/memory) → Bet LAST**. Stake inputs, live opponent search and
> `paragon_game_settle` UI wiring remain deliberately deferred until real money is ON.

---

## 1. What already exists (build on this — never duplicate it)

| Engine | File | What it gives every game |
|---|---|---|
| Coin balance & buckets | `app.js` (`addCoins`, `spendCoins`, `coinBalanceBuckets`) | available / locked / pending / restricted balance, typed history |
| Wallet/payout machine | `paragon-wallets.js` | state machine, per-game kill switches, financial pause, claims, audit |
| Weekly leaderboard | `paragon-leaderboards.js` | weekly periods (Aug 1 2026 anchor), `recordResult`, `liveStandings`, prize distribution 30/20/15/10/9/6/4/3/2/1, anti-farming |
| 1v1 stake desk | `app.js` `openGamesCompeteDesk` | server-settled stake flow, 100–10,000 coins, 5% house fee |
| KYC gate (new, P-114) | `app.js` `kycState()` | no real-money flow before team-approved KYC |
| Paragon Mind AI | `ai/paragon-archive-ai.js` | in-game hints/rules explainer for every game |
| Catalogue entries | `data/*.js` | Paragon Quiz, Arcade, Chess, Cards, Bet etc. already exist as destinations |

**Golden rule (already law in the repo): the browser NEVER settles real-money results and never
mints coins. Free play is local; stake play locks on the server and the team/Edge settles.**

## 2. One shared game framework — `games/engine.js` (new)

Create ONE small framework all games import, so every game is consistent and reviewable:

```
games/
  engine.js          # ParagonGameEngine: lifecycle, scoring, save/resume, free-vs-stake, hooks
  manifest.js        # registry: { key, name, icon, supportsFree, supportsStake, minStake, maxStake }
  quiz/…             # each game in its own folder (logic.js + ui.js + levels.js)
  arcade/…          # next build
  chess/…           # LIVE — full-rule local computer chess
  cards/…           # LIVE — Higher·Lower + Blackjack 21
  spin/…            # LIVE — Precision Wheel duel
```

Engine API (per game session):

```js
ParagonGameEngine.start({
  gameKey: "quiz",                 // leaderboard gameType
  mode: "free" | "stake",          // stake requires: KYC approved + signed-in + kill switch off
  stakeCoins: 500,                 // stake mode only (100–10,000, multiples of 50)
  onScore(score) {},               // free mode: local best, XP, daily-goal credit
  onFinish({ score, durationMs })  // stake mode: submit to server settle; free: local record
});
```

Free/stake split the engine enforces:
- **Free** — always playable (guest included), local leaderboard only, can award XP/daily goals, NEVER coins.
- **Stake** — requires `isRegisteredMember() && kycApproved() && !financePaused() && !gameKillSwitch(gameKey)`.
  Coins move `available → locked` via the wallet engine; the server settles win/loss/draw.

## 3. The games to build, in build order (each = one week of focused work)

1. **Paragon Cards — DONE (P-116; realism pass P-117).** `games/cards/` ships Higher·Lower
   and Blackjack 21 on seeded decks, with save/resume, local bests, published rules and a
   walnut/felt/table-card visual pass. Wave 2 (solitaire and memory) comes after Quiz.
2. **Paragon Spin — DONE (P-117, owner direct priority).** `games/spin/` ships a twelve-sector,
   six-turn Precision Wheel duel. Player and house lock predictions against one shared seeded
   result and symmetric scoring. Free-only by design.
3. **Paragon Chess — DONE (P-117).** `games/chess/` ships complete local rules (castling,
   en passant, four promotions, check/mate and draw rules), three alpha-beta computer strengths,
   hints, move ledger and resume. Free is player versus computer; future stake is human versus
   human only and remains locked.
4. **Paragon Arcade — NEXT.** Build 3–5 reflex/timing/memory games in one arcade shell; free
   performance can appear on its game board, but coins only ever move through future server-led
   competitions.
5. **Paragon Quiz — AFTER ARCADE.** Upgrade the existing `paragon-quiz/` product onto this engine:
   timed rounds and streak multipliers first. Paid-entry UI remains deferred with real money.
6. **Paragon Cards wave 2 — AFTER QUIZ.** Solitaire and memory first; Snap can follow with live
   multiplayer infrastructure.
7. **Paragon Bet — LAST.** Prediction/reaction markets on real in-app events only (never sports
   booking until legally reviewed). Highest legal and settlement risk.

## 4. Server settle contract (one RPC for all games — activate only with real money)

**Not active in the game UI today.** Keep this as the future authoritative contract. Do not add
stake inputs, real opponent listings or client settlement before the owner turns real money ON.

```sql
paragon_game_settle(p_match_id, p_game_key, p_result_json, p_signature)
```
- match created by `createOneVOneChallenge` (already exists) or tournament entry;
- result_json includes BOTH players' visible seeds + move logs (audit-friendly);
- payout honors the 5% house fee and writes ONE leaderboard entry via
  `ParagonLeaderboards.recordResult` (points only for eligible staked competitions);
- idempotent per match id (double-settle impossible — mirrors the withdrawal machine).

## 5. Anti-cheat rules baked into the engine from day one

- Score submission must include: duration (server-checked plausibility), seed, action log hash.
- Impossible-speed scores auto-flag to the Risk desk (`paragon-wallets.js` cases), never auto-ban
  (one signal ≠ guilt — already the repo's law).
- Free mode scores never touch coins; suspicious free-mode grinding only affects XP curve.

## 6. UX standards for every game screen

- Header: shared `settingsPopupHead` diamond layout (already shipped P-114).
- Always visible: mode chip (FREE / STAKE n coins), KYC state if stake is attempted.
- Paragon Mind floating button stays available on game screens opened from the Websites tab
  (platform knowledge), hidden inside full-screen game views beyond it (owner rule).
- Every game explains its rules in one tappable card — Paragon Mind answers the rest.

## 7. Definition of done (per game)

- [x] Free mode playable by guest, signed-in, zero-balance and offline (PWA) — Cards, Spin, Chess
- [x] Stake mode gated: account + KYC approved + real-money flag + pause/kill switches; no stake UI ships yet
- [ ] Coins lock/unlock correctly on abandon/disconnect — pending stake UI + live server settlement
- [x] In-game board distinguishes local free performance from the revenue-funded Coins Leaderboard
- [x] Coins Leaderboard results only via eligible staked results (`recordStakedResult` refuses zero stake)
- [x] Audit row appended for session start, finish and plausibility flags; flags open a case, never auto-ban
- [x] Tests: `tests/suite-games.test.js` (**233 checks**) including Cards settlement, Spin wheel
      geometry/scoring, full Chess legality/AI, no-fake-player boards, catalog/cache and Vercel config.
      `tests/suite-finance.test.js` gains settle-path checks only when stake UI actually ships.
