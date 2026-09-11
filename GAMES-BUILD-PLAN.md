# PARAGON ARCHIVE — GAMES BUILD PLAN (P-114)

Owner note: "Maybe I should start building all the games — let's think on how we should build the games."
This plan is written against what ALREADY exists in the repo, so each game plugs into real engines
instead of inventing new money/leaderboard logic.

> **STATUS — 2026-09-11 (P-120).** **Cards wave 2 is built and Quiz runs on the
> engine.** Paragon Cards now ships four live cabinets (Higher·Lower, Blackjack 21,
> **Solitaire**, **Memory Match**) on the shared engine — seeded deals, honest resume,
> per-cabinet bests, published scoring, full regression cover; `buildProgress: 90`
> pending the owner demo, like Spin/Chess/Arcade. Paragon Quiz now opens a real engine
> session per attempt: timed rounds with streak multipliers (1x–5x) + speed bonus, live
> HUD, per-answer audit, win/draw/loss close — while paid prize eligibility stays 100%
> server-side (Stage 4). Remaining order is now **Bet LAST**.
>
> **Owner vision recorded (P-120, SPEC-ONLY — build later).** One day the site hosts
> real matches (e.g. a football-style World Cup bracket with a set squad size per team);
> **Paragon Bet** becomes a SportyBet-style book where spectators predict match winners
> with form stats (point strength and friends), and stake/multiplayer modes connect into
> the same fixtures. Money/legal gates stand: nothing pays out until real money is ON,
> the settle contract is authoritative server-side, and the jurisdiction/age/KYC answers
> are documented. No bet/multiplayer code ships in P-120 beyond this paragraph.
>
> **STATUS — 2026-09-11 (P-119).** **Paragon Arcade is built and complete:** five live
> cabinets (Reflex Tap, Memory Match, Timing Bar, Sequence Repeat, Target Sprint) on the shared
> engine — seeded rounds, honest resume per cabinet, per-cabinet bests, in-game board, published
> win/draw/loss thresholds, full regression cover. `buildProgress: 90` pending the owner demo,
> like Cards/Spin/Chess. Remaining order is now **Quiz onto the engine → Cards wave 2
> (solitaire/memory) → Bet LAST**. Stake inputs, live opponent search and `paragon_game_settle`
> UI wiring remain deliberately deferred until real money is ON.
>
> **STATUS — 2026-09-11 (P-118).** All SQL is done through Phase 5 + Stage 4; the next
> blocker is Edge Function deploys (`supabase/functions/EDGE-DEPLOY-RUNBOOK.md`). The Updates.txt
> spec is mapped in `docs/GAMES-UPDATES-SPEC.md`: Spin + Chess live as the new games, free tier
> (guest/signed-up/0 coins) beside gated bet mode, **stake-matched 1v1 matchmaking completed**
> (match-my-stake desk, equal-stake pairing), in-game General/Free/Bet/Multiplayer board live and
> explicitly separate from the revenue-funded money leaderboard (phase-4 periods/entries).
> Supabase free-tier estimate: ≈115 MB @ 10k economy users (4× headroom); Firebase not added
> (D-236 stands; "Firebird" clarified as Firebase typo). Two half-built pieces completed: Quiz
> paid-path `window.alert` calls are now inline panels, and the desk matches by stake amount.
> Cards/Spin/Chess stay at `buildProgress: 90` pending the owner demo. Remaining order is still
> **Arcade → Quiz onto the engine → Cards wave 2 (solitaire/memory) → Bet LAST**.
>
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
4. **Paragon Arcade — DONE (P-119).** `games/arcade/` ships five complete cabinets —
   Reflex Tap (5 reaction rounds), Memory Match (6 seeded pairs + combo), Timing Bar (5 bullseye
   stops), Sequence Repeat (patterns 3→10 over 8 rounds) and Target Sprint (25-second aim) — on
   one `play.html?v=` router with honest per-cabinet resume, bests and board. Free performance
   can appear on its game board, but coins only ever move through future server-led competitions.
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
