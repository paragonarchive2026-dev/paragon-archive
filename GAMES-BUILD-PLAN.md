# PARAGON ARCHIVE — GAMES BUILD PLAN (P-114)

Owner note: "Maybe I should start building all the games — let's think on how we should build the games."
This plan is written against what ALREADY exists in the repo, so each game plugs into real engines
instead of inventing new money/leaderboard logic.

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
  arcade/…
  chess/…
  cards/…
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

1. **Paragon Quiz** (already partially live in `paragon-quiz/`) — upgrade to engine: timed rounds,
   streak multipliers, free mode + paid-entry tournaments (paid entry = stake variant that feeds
   leaderboard points).
2. **Paragon Arcade** — 3–5 tiny reflex games (tap-timing, memory match, reaction) sharing one
   arcade shell; scores in coins ONLY through tournaments, never direct.
3. **Paragon Cards** — one deck, one rule set first (e.g. higher-lower), then blackjack-style.
   Card RNG must be seeded server-side for stake games.
4. **Paragon Chess** — integrate an existing OSS engine (e.g. chess.js for rules + stockfish.wasm
   lightly weighted) — stake only against humans via the 1v1 desk; free vs AI.
5. **Paragon Bet** — prediction/reaction markets on real in-app events ONLY (never sports booking
   until legally reviewed). Highest-risk item: build LAST.

## 4. Server settle contract (one RPC for all games)

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

- [ ] Free mode playable by guest, signed-in, offline (PWA)
- [ ] Stake mode gated: account + KYC approved + kill switch respected
- [ ] Coins lock/unlock correctly on abandon/disconnect (never trapped)
- [ ] Leaderboard points only via eligible staked results
- [ ] Audit row appended for every money-touching action
- [ ] Tests in `tests/suite-finance.test.js` extended for its settle path
