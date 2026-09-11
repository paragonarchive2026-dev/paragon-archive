<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SPEC.md
  EXPECTED PROJECT PATH: /games/cards/SPEC.md
  ROLE: The single source of truth for the Paragon Cards build — generated from
        docs/site-specs/_TEMPLATE.md, merged with the Archive concept record, the
        GAMES-BUILD-PLAN (P-114) and docs/SITE-BUILD-KIT.md (12 standing rules).
  RESTORE-LOAD NOTE: Keep inside /games/cards/. Any agent can rebuild this game from this file.
-->

# 🏗️ BUILD SPEC — Paragon Cards

**Archive record:** `data/catalogue-expansion-45-100.js` · category: Games · icon art:
`assets/site-icons/paragon-cards.png`
**Owner brief:** "Let's start building the game" → shared engine first, Paragon Cards as the
first playable game, free-play now with stake wiring ready underneath, wired into the
catalogue immediately.
**Spec version:** 1 · **Date:** 2026-09-06 · **Build:** P-116

## 1. Purpose (from the Archive concept record)
Card games — two rule sets live: **Higher · Lower** (a head-to-head call against the house) and
**Blackjack 21** (beat the dealer with play chips). Free forever, no downloads, no real money.

## 2. Features built (MUST)
- [x] **Higher · Lower** — ten rounds, you and the house call the same up-card
- [x] **Blackjack 21** — hit/stand/double, dealer draws to 17, blackjack pays 3:2
- [x] Seeded six-deck shoe (replayable; reshuffled below 78 cards)
- [x] Save and resume an unfinished game on the same device
- [x] Local personal bests and honest real-zero counters
- [x] One-tap rules card that states every rule of the mode being played
- [x] Mode chip: FREE PLAY always visible, STAKE · LOCKED with every reason listed
- [x] Game-specific General / Free / Bet / Multiplayer performance views (real rows only)
- [x] P-117 realism pass: tactile felt/walnut table, paper card faces and restrained brass UI

## 3. Features deliberately NOT built (honest scope)
- [ ] Stake play — wired in the engine and gated, but no stake UI ships until real money is ON
- [ ] Online multiplayer — the seat model allows it; Supabase realtime/presence is future work
- [ ] Local hot-seat (two players, one device) — planned with online play
- [ ] Solitaire / Snap / Memory match / Card flip — still concept features, not built
- [ ] Split, insurance and surrender in blackjack — v1 ships hit/stand/double only

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
  manifest.js            # registry: what exists, what is planned, stake limits
  _shared/game-kit.js    # HUD shell: mode chip, stats, rules card, quit panel, result overlay
  _shared/game-kit.css   # shared game-screen visual system
  cards/                 # this game — rules + drawing ONLY
```
Engine API used by this game:
```js
ParagonGameKit.mount({ hud, gameKey: "cards", variant, stats, onStart(engine, savedState) })
engine.next()            // seeded draw — never Math.random
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
- [x] Paragon bar present; logo → `paragon-archive.html?site=Paragon Cards`
- [x] Free mode playable by guest, and offline (files precached by the service worker)
- [x] Stake mode gated: account + KYC + real money + no pause + no kill switch
- [x] Coins Leaderboard points impossible in free play; local in-game performance remains separate
- [x] Audit row written for every session start, finish and plausibility flag
- [x] `node tests/suite-games.test.js` — 233 checks green across Cards, Spin, Chess and shared room law
- [x] Real-DOM playthrough (jsdom) of both modes incl. reload → resume, quit panel, shoe end at ≥ 200 or 0
- [ ] **Owner demo pass** → then `buildProgress` 90 → 100

## 8. Rules exactly as shipped
**Higher · Lower:** aces are LOW (1). Both sides see the same up-card and the same next card.
Correct call = 10 × streak, multiplier capped at 5x. Wrong call resets the streak. Equal ranks
push (no points, streaks kept). Ten rounds; highest total wins; equal totals draw.
The house calls: rank ≤ 6 → higher, rank ≥ 8 → lower, rank 7 → seeded coin flip.

**Blackjack 21:** start 100 play chips, target 200, six-deck shoe reshuffled below 78 cards.
Bets 10/25/50. Blackjack pays 3:2. Dealer draws to 17 and stands (soft 17 included). Double
down doubles the bet for exactly one card and is offered only while the bankroll covers the
doubled bet; the bet is settled ONCE at the end of the hand (+bet / +1.5 × bet / −bet / 0) and
the next hand returns to the chip you chose. Under 10 chips the next hand is all in. The shoe
ends at 200 or more (won) or exactly 0 (over). Play chips are **not** Paragon Coins.

**Personal bests:** decided by the engine, never by the game, and only for a real score above
zero — a busted shoe or ten wrong calls is a play and a loss, never a "new best".

## 9. Wave 2 — Solitaire + Memory Match (P-120)
**Solitaire:** full Klondike, click-to-move on the shared engine. Seeded 52-card deal
(no re-deal button — the seed is the fairness proof). Tableau builds down in alternating
colours, only a King starts an empty column, foundations stack one suit up from the Ace,
unlimited waste recycles in exact order. Scoring: foundation +10, waste→tableau +5,
tableau move +3, flip +5, recycle −20, win bonus 1000 − moves. Win = all 52 home;
stalemate (no draw, flip, foundation or tableau move) ends honestly as a loss; auto-finish
offers one-tap completion once the stock and waste are empty and every tableau card is
face-up. Resume restores the exact piles, score and move count.

**Memory Match:** 16 cards, 8 seeded rank pairs. A match scores 100 + 25 × combo
(combo counts consecutive matches, resets on a miss). Clearing the board adds an
efficiency bonus of (24 − moves) × 15 through 24 moves, zero after. Matches are
rank-only; suits never matter.

Both cabinets checkpoint every move for resume, audit deals/matches/finishes, and never
touch coins, wallets or the money leaderboard. `buildProgress` stays 90 pending the
owner demo pass.
