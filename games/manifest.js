/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: manifest.js
  EXPECTED PROJECT PATH: /games/manifest.js
  ROLE: The game registry (GAMES-BUILD-PLAN.md §2). One row per Paragon game: what it is,
        where it lives, whether it may ever take a stake (and between what limits), and the
        rule variants it ships. games/engine.js reads this file — never the other way round.
  HONESTY RULE (P-009): status is "live" ONLY when the game is actually playable at `path`.
        Everything else stays "planned" and must be presented as planned, never as built.
  RESTORE-LOAD NOTE: Load BEFORE games/engine.js and before any game's own script.
*/
(function (global) {
  "use strict";

  var games = [
    {
      key: "cards",
      name: "Paragon Cards",
      icon: "🃏",
      group: "Games",
      path: "games/cards/index.html",
      playPath: "games/cards/play.html",
      status: "live",
      blurb: "One deck, fair rules, no downloads — beat the house at cards.",
      supportsFree: true,
      supportsStake: true,
      minStake: 100,
      maxStake: 10000,
      stakeStep: 50,
      minDurationMs: 4000,
      variants: [
        {
          key: "higher-lower",
          name: "Higher · Lower",
          seats: "you vs the house",
          scoreUnit: "points",
          summary: "The same card is shown to you and the house. Call higher or lower before it turns. Ten cards each — most points wins.",
          rules: [
            "Ten rounds. Both you and the house see the SAME up-card and the SAME next card, so luck is shared and only the call decides it.",
            "A correct call scores 10 points, multiplied by your streak (1x, 2x, 3x, 4x, 5x — capped at 5x).",
            "An incorrect call scores nothing and resets your streak.",
            "An equal rank is a push: nobody scores and streaks are kept.",
            "Aces are LOW (value 1) in this game — it is printed on the card, so the rule is never a surprise.",
            "Highest total after ten rounds wins. Equal totals are a draw."
          ]
        },
        {
          key: "blackjack",
          name: "Blackjack 21",
          seats: "you vs the dealer",
          scoreUnit: "play chips",
          summary: "Beat the dealer without going over 21. Start with 100 play chips; reach 200 to win the shoe, hit zero and the shoe is over.",
          rules: [
            "You start every shoe with 100 play chips. These are PLAY CHIPS — they are not Paragon Coins and they can never be bought, sold or withdrawn.",
            "Bet 10, 25 or 50 chips before each hand. A win pays 1:1; a natural blackjack pays 3:2.",
            "The dealer must draw to 17 and then stand, including on a soft 17.",
            "You may Hit, Stand, or Double Down (double your bet for exactly one more card).",
            "Push returns your bet. Reaching 200 chips wins the shoe; running out ends it."
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- planned (declared, NOT built)
       These rows exist so the engine, the HUD and the catalogue all tell the same honest
       story: the plan is public, only what is built is presented as built. */
    {
      key: "arcade",
      name: "Paragon Arcade", icon: "🕹️", group: "Games",
      path: "games/arcade/index.html", playPath: "games/arcade/play.html", status: "live",
      blurb: "Five quick reflex, timing and memory cabinets in one neon arcade shell.",
      supportsFree: true, supportsStake: true,
      minStake: 100, maxStake: 10000, stakeStep: 50, minDurationMs: 5000,
      variants: [
        {
          key: "reflex",
          name: "Reflex Tap",
          seats: "solo",
          scoreUnit: "points",
          minDurationMs: 6000,
          summary: "Five rounds of wait-then-tap. The panel turns green after a seeded delay — tap fast, but a tap while it is red is a foul and scores nothing for that round.",
          rules: [
            "Five rounds. Each round shows WAIT (red), then TAP (green) after a seeded 900–2600 ms delay.",
            "Tap while the panel is red and the round is a foul: 0 points, no retry.",
            "Round points = 1000 minus your reaction milliseconds, minimum 50 for a completed tap (a 200 ms tap scores 800).",
            "Total 3000+ is a win, 1500–2999 a draw, below that a loss. Keyboard Space or Enter taps too.",
            "Quitting mid-game resumes at the start of the current round — completed rounds are kept."
          ]
        },
        {
          key: "memory",
          name: "Memory Match",
          seats: "solo",
          scoreUnit: "points",
          minDurationMs: 5000,
          summary: "Twelve cards, six seeded pairs. Flip two at a time; matches stay open and consecutive matches build a combo bonus.",
          rules: [
            "Twelve cards hide six pairs in a seeded shuffle — the same seed replays the same board.",
            "Flip two cards. A match stays open and scores 100 plus 25 per combo step; a miss closes both and resets the combo.",
            "Finishing in 18 moves or fewer adds an efficiency bonus of (18 − moves) × 20.",
            "Clearing the board is always a win. A half-open pair closes if you quit and resume.",
            "Every flip is logged to the session audit trail with the seed."
          ]
        },
        {
          key: "timing",
          name: "Timing Bar",
          seats: "solo",
          scoreUnit: "points",
          minDurationMs: 8000,
          summary: "Five rounds on a sweeping marker. Stop it as close to the centre bullseye as you can — each round sweeps at a seeded speed.",
          rules: [
            "Five rounds. The marker sweeps the bar at a seeded speed (1200–2200 ms per sweep).",
            "Press STOP (button or Space). Within 4 of centre scores 200 (bullseye), within 10 scores 120, within 20 scores 60, farther scores 0.",
            "Total 700+ is a win, 350–699 a draw, below that a loss.",
            "Zones are labelled in text as well as colour, and the centre line is always marked.",
            "Quitting mid-game resumes at the start of the current round with a fresh seeded sweep."
          ]
        },
        {
          key: "sequence",
          name: "Sequence Repeat",
          seats: "solo",
          scoreUnit: "points",
          minDurationMs: 8000,
          summary: "Watch the four numbered pads light in a seeded pattern, then repeat it. Patterns grow from 3 to 10 steps over eight rounds — one wrong pad ends the run.",
          rules: [
            "Eight rounds maximum. Round N shows a seeded pattern of N + 2 steps (3 up to 10).",
            "Watch the pads light, then repeat with clicks/taps or keys 1–4. Pads are numbered, never colour-only.",
            "Each correct pad scores 10; clearing a round adds a 50 × round bonus.",
            "One wrong pad ends the run and keeps your score: clearing all 8 is a win, 4–7 a draw, fewer a loss.",
            "Quitting mid-round resumes that round with a fresh seeded pattern."
          ]
        },
        {
          key: "targets",
          name: "Target Sprint",
          seats: "solo",
          scoreUnit: "points",
          minDurationMs: 20000,
          summary: "A 25-second sprint. One seeded target at a time — tap it for 100 points; tapping empty arena costs 25. Most hits wins.",
          rules: [
            "One 25-second sprint on a wall clock. One target appears at a time at a seeded position and size.",
            "Tapping the target scores 100 and spawns the next. Tapping empty arena is a miss: −25, total never below 0.",
            "18+ hits is a win, 10–17 a draw, fewer a loss.",
            "Quitting restarts the sprint — timer games cannot resume fairly, so this is stated, not hidden.",
            "Reduced-motion players get the same sprint with instant (non-animated) target changes."
          ]
        }
      ]
    },
    {
      key: "chess",
      name: "Paragon Chess", icon: "♟", group: "Games",
      path: "games/chess/index.html", playPath: "games/chess/play.html", status: "live",
      blurb: "Tournament chess against a local computer in a refined, full-rule board room.",
      supportsFree: true, supportsStake: true,
      minStake: 100, maxStake: 10000, stakeStep: 50, minDurationMs: 8000,
      variants: [{
        key: "computer",
        name: "Club match",
        seats: "you vs the computer",
        scoreUnit: "performance points",
        minDurationMs: 8000,
        summary: "Play White against a local computer opponent. Full legal movement, check, checkmate, castling, en passant, promotion and draw rules run on this device.",
        rules: [
          "You play White and move first. Select a piece, then one of its highlighted legal squares.",
          "The computer plays Black at Casual, Club or Master strength. Difficulty changes start a fresh game and never alter a match already in progress.",
          "Castling, en passant, check, checkmate, stalemate, promotion, the fifty-move rule, repetition and insufficient-material draws are supported.",
          "Promotion offers queen, rook, bishop or knight. A move that leaves your king in check is never legal.",
          "Free performance appears only on this game's device-local board. It never earns coins or a revenue-funded prize.",
          "Human-versus-human staked chess remains locked until real-money mode and the authoritative server settlement contract are switched on."
        ]
      }]
    },
    {
      key: "puzzle",
      name: "Paragon Puzzle", icon: "🧩", group: "Games",
      path: "", playPath: "", status: "planned",
      blurb: "Memory match, sliding puzzles, sudoku and word scramble.",
      supportsFree: true, supportsStake: false,
      minStake: 0, maxStake: 0, stakeStep: 0, minDurationMs: 5000,
      variants: [{ key: "set", name: "Puzzle set", seats: "solo", summary: "Planned — a puzzle hub with per-puzzle bests. Free only: puzzles take no stakes.", rules: [] }]
    },
    {
      key: "trivia",
      name: "Paragon Trivia", icon: "🎤", group: "Games",
      path: "", playPath: "", status: "planned",
      blurb: "Timed trivia with streak scoring and a weekly board.",
      supportsFree: true, supportsStake: true,
      minStake: 100, maxStake: 10000, stakeStep: 50, minDurationMs: 10000,
      variants: [{ key: "timed", name: "Timed rounds", seats: "solo / field", summary: "Planned — timed categories with streak multipliers.", rules: [] }]
    },
    {
      key: "race",
      name: "Paragon Race", icon: "🏎️", group: "Games",
      path: "", playPath: "", status: "planned",
      blurb: "Browser racing with keyboard controls and time trial.",
      supportsFree: true, supportsStake: true,
      minStake: 100, maxStake: 10000, stakeStep: 50, minDurationMs: 20000,
      variants: [{ key: "time-trial", name: "Time trial", seats: "solo", summary: "Planned — keyboard racing against the clock.", rules: [] }]
    },
    {
      key: "spin",
      name: "Paragon Spin", icon: "◉", group: "Games",
      path: "games/spin/index.html", playPath: "games/spin/play.html", status: "live",
      blurb: "A precision wheel duel with one visible result and equal odds for player and house.",
      supportsFree: true, supportsStake: false,
      minStake: 0, maxStake: 0, stakeStep: 0, minDurationMs: 5000,
      variants: [{
        key: "wheel-duel",
        name: "Precision Wheel",
        seats: "you vs the house",
        scoreUnit: "points",
        minDurationMs: 5000,
        summary: "Pick a numbered sector before each turn. The house locks its own pick, then one seeded wheel result scores both predictions by the same published distance table.",
        rules: [
          "Six turns. Pick one of the twelve numbered sectors before the wheel starts.",
          "The house locks a seeded pick before the result. Both predictions face the exact same wheel result and the exact same scoring rule.",
          "Exact sector scores 120 points; one sector away scores 60; two sectors away scores 25; farther away scores zero.",
          "Distance wraps around the wheel, so sector 12 is beside sector 1.",
          "The highest total after six turns wins. Equal totals are a draw.",
          "Paragon Spin is free-only. Points are game performance, not Paragon Coins, and cannot be bought, sold, staked or withdrawn."
        ]
      }]
    },
    {
      key: "survival",
      name: "Paragon Survival", icon: "🧭", group: "Games",
      path: "", playPath: "", status: "planned",
      blurb: "Text survival scenarios with resource management.",
      supportsFree: true, supportsStake: false,
      minStake: 0, maxStake: 0, stakeStep: 0, minDurationMs: 15000,
      variants: [{ key: "story", name: "Story runs", seats: "solo", summary: "Planned — choose your path, manage resources, reach an ending.", rules: [] }]
    },
    {
      key: "bet",
      name: "Paragon Bet", icon: "🎯", group: "Games",
      path: "", playPath: "", status: "planned",
      blurb: "Friendly prediction tracker for private groups.",
      supportsFree: true, supportsStake: true,
      minStake: 100, maxStake: 10000, stakeStep: 50, minDurationMs: 0,
      variants: [{ key: "predictions", name: "Predictions", seats: "group", summary: "Planned — build LAST (highest legal risk). No sports booking until the legal review is done.", rules: [] }]
    }
  ];

  var manifest = {
    CONFIG_VERSION: "1",
    games: games,
    all: function () { return games.slice(); },
    live: function () { return games.filter(function (g) { return g.status === "live"; }); },
    planned: function () { return games.filter(function (g) { return g.status === "planned"; }); },
    find: function (key) {
      var found = null;
      games.forEach(function (g) { if (String(g.key) === String(key)) found = g; });
      return found;
    },
    /* Money limits the whole platform must obey (mirrors the 1v1 stake desk in app.js). */
    STAKE_RULE: { min: 100, max: 10000, step: 50, houseFeePct: 5 }
  };

  global.ParagonGameManifest = manifest;
  if (global.window) global.window.ParagonGameManifest = manifest;
})(typeof window !== "undefined" ? window : globalThis);
