<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SPEC.md
  EXPECTED PROJECT PATH: /games/arcade/SPEC.md
  ROLE: The single source of truth for the Paragon Arcade build — generated from
        docs/site-specs/_TEMPLATE.md, merged with the Archive concept record, the
        GAMES-BUILD-PLAN (P-114) and docs/SITE-BUILD-KIT.md (12 standing rules).
  RESTORE-LOAD NOTE: Keep inside /games/arcade/. Any agent can rebuild this game from this file.
-->

# 🏗️ BUILD SPEC — Paragon Arcade

**Archive record:** `data/catalogue-expansion-45-100.js` · category: Games · icon art:
`assets/site-icons/paragon-arcade.png`
**Owner brief:** "Build your next recommendations everything on it completely" → the
plan-order next game after Cards/Spin/Chess (GAMES-BUILD-PLAN §3.4): all five cabinets,
complete with rules, resume, bests, board and tests.
**Spec version:** 1 · **Date:** 2026-09-11 · **Build:** P-119

## 1. Purpose (from the Archive concept record)
Five quick solo skill cabinets — reaction, memory, precision timing, pattern repeat and
aim — in one neon arcade shell. Every cabinet finishes in about a minute. Free forever,
no downloads, no real money.

## 2. Features built (MUST)
- [x] **Reflex Tap** (`?v=reflex`) — five wait-then-tap rounds, seeded 900–2600 ms delays, fouls score 0, points = 1000 − ms (min 50)
- [x] **Memory Match** (`?v=memory`) — twelve cards, six seeded pairs, combo bonus 100 + 25×combo, efficiency bonus (18 − moves) × 20
- [x] **Timing Bar** (`?v=timing`) — five stops on a seeded 1200–2200 ms sweep, zones 200/120/60/0
- [x] **Sequence Repeat** (`?v=sequence`) — four numbered pads, seeded patterns 3→10 steps over eight rounds, 10/pad + 50×round bonus, one mistake ends the run
- [x] **Target Sprint** (`?v=targets`) — 25-second wall-clock sprint, seeded positions/sizes, hits +100, arena misses −25 (floor 0)
- [x] One `play.html?v=` router with per-cabinet stats, rules card, quit/resume panels and result overlay (shared game-kit shell)
- [x] Honest resume per cabinet: Memory exact (half-open pair closes); Reflex/Timing restart the current round; Sequence redeals the round's pattern; Sprint restarts (all stated in the manifest rules)
- [x] Local personal bests per cabinet + honest real-zero counters + game-specific General / Free / Bet / Multiplayer board
- [x] Keyboard play (Space/Enter tap + STOP, 1–4 pads), reduced-motion paths, labelled (never colour-only) zones/pads
- [x] Seeded everything replayable: delays, shuffles, sweeps, patterns, positions all come from `engine.int/random`; `Date.now` measures time only

## 3. Features deliberately NOT built (honest scope)
- [ ] Stake play — manifest keeps `supportsStake: true` so the HUD lists every lock reason, but no stake UI ships until real money is ON
- [ ] Online multiplayer / live opponent matching — cabinets are solo; the Bet/Multiplayer board tabs stay honestly empty
- [ ] Snake / Tetris / Breakout / Space Invaders / Pac-Man-style games — the old catalogue concept list was replaced by the five real cabinets (no licensed clones, no fake rows)
- [ ] Sound effects — visual-only v1 (a mute-safe choice for shared devices)

## 4. Owner rules that win (merged verbatim)
1. Free play is always playable — guest included, no coins, no KYC.
2. The browser never settles a money outcome and never mints coins.
3. Revenue-funded Coins Leaderboard points come only from eligible staked results; free performance may appear only on this game's local board.
4. One suspicious signal never bans anyone — it opens a Risk case.
5. Every website/game carries the Paragon bar with the logo linked back to its Archive detail.
6. No `alert`/`prompt`/`confirm`; no fake data; counters start at real zero.

## 5. Architecture
```
games/
  engine.js              # ParagonGameEngine — sessions, seeded RNG, gate, bests, audit
  manifest.js            # registry: arcade row is live with five variants
  _shared/game-kit.js    # HUD shell: mode chip, stats, rules card, quit panel, result overlay
  _shared/game-kit.css   # shared game-screen visual system
  arcade/                # this game — rules + drawing ONLY
    index.html           # floor: hero, five cabinets, counters, board
    play.html?v=         # one router for all five cabinets
    css/style.css        # neon arcade visual system
    js/arcade.js         # all five cabinets + pure exports (window.ParagonArcade)
    js/home.js           # counters + per-cabinet bests + board mount
```
Engine API used by this game:
```js
ParagonGameKit.mount({ hud, gameKey: "arcade", variant, stats, onStart(engine, savedState) })
engine.int(n) / engine.random()   // every seeded draw — never Math.random
engine.score(n) · engine.action(name, detail) · engine.checkpoint(state)
engine.finish({ outcome }) · engine.abandon(reason)
```

## 6. Data model (local-first, nothing uploaded)
| Key | Shape |
|---|---|
| `paragonGames.sessions.v1` | last 120 finished sessions (id, seed, score, outcome, flags, log) |
| `paragonGames.open.v1` | the one unfinished session per game+mode (save/resume) |
| `paragonGames.bests.v1` | personal best per game + rule set + mode |
| `paragonGames.stats.v1` | plays / wins / losses / draws / best score / streaks |

## 7. Acceptance checklist
- [x] Identity headers on every file
- [x] No dialogs · no fake data · responsive 320px→4K · reduced-motion respected
- [x] Paragon bar present; logo → `paragon-archive.html?site=Paragon Arcade`
- [x] Free mode playable by guest, and offline (files precached by the service worker)
- [x] Stake mode gated: account + KYC + real money + no pause + no kill switch
- [x] Win/draw/loss thresholds published in the manifest rules, not hidden
- [x] Pure scoring functions exported for regression tests (`window.ParagonArcade`)
