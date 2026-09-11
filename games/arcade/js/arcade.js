/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: arcade.js
  EXPECTED PROJECT PATH: /games/arcade/js/arcade.js
  ROLE: Paragon Arcade rules and rendering — five solo skill cabinets (Reflex Tap,
        Memory Match, Timing Bar, Sequence Repeat, Target Sprint) behind one play.html
        (?v=reflex|memory|timing|sequence|targets). Session lifecycle, resume, bests and
        auditing stay in games/engine.js; this file never touches coins, account data,
        the network or browser dialogs.
  PLATFORM LAWS: every shuffled board, delay, sweep speed, pattern and target position
        comes from engine.random/int (seeded, replayable); Date.now is used ONLY for
        reaction/stopwatch measurement, never for gameplay randomness. Free-only UI;
        outcomes are honest thresholds printed in the manifest rules.
  RESTORE-LOAD NOTE: Load after site-kit.js, manifest.js, engine.js and game-kit.js.
*/
(function (global) {
  "use strict";

  var doc = global.document;
  var games = global.ParagonGames;
  var kit = global.ParagonGameKit;
  var currentVariant = "reflex";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function reduceMotion() {
    try { return !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch (error) { return false; }
  }

  /* ------------------------------------------------------------------ pure rules (exported for tests) */
  function scoreReflex(ms, foul) {
    if (foul) return 0;
    var t = Math.max(0, Math.round(Number(ms) || 0));
    return Math.max(50, 1000 - t);
  }

  function reflexOutcome(total) {
    var t = Number(total) || 0;
    if (t >= 3000) return "win";
    if (t >= 1500) return "draw";
    return "loss";
  }

  function memoryMatchPoints(combo) {
    return 100 + 25 * Math.max(0, Math.round(Number(combo) || 0));
  }

  function memoryBonus(moves) {
    var m = Math.max(0, Math.round(Number(moves) || 0));
    return m <= 18 ? (18 - m) * 20 : 0;
  }

  function timingPoints(position) {
    var d = Math.abs(Number(position) - 50);
    if (d <= 4) return 200;
    if (d <= 10) return 120;
    if (d <= 20) return 60;
    return 0;
  }

  function timingOutcome(total) {
    var t = Number(total) || 0;
    if (t >= 700) return "win";
    if (t >= 350) return "draw";
    return "loss";
  }

  function sequenceRoundPoints(round, pads) {
    return Math.max(1, Math.round(Number(round) || 1)) * 50 + Math.max(0, Math.round(Number(pads) || 0)) * 10;
  }

  function sequenceOutcome(cleared) {
    var c = Number(cleared) || 0;
    if (c >= 8) return "win";
    if (c >= 4) return "draw";
    return "loss";
  }

  function targetsScore(hits, misses) {
    return Math.max(0, Math.max(0, Math.round(Number(hits) || 0)) * 100 - Math.max(0, Math.round(Number(misses) || 0)) * 25);
  }

  function targetsOutcome(hits) {
    var h = Number(hits) || 0;
    if (h >= 18) return "win";
    if (h >= 10) return "draw";
    return "loss";
  }

  function finishActions() {
    return [
      { label: "Play again", primary: true, onClick: restart },
      { label: "Arcade floor", onClick: function () { global.location.href = "index.html"; } },
      { label: "Leaderboard", onClick: function () { global.location.href = "index.html#leaderboard"; } }
    ];
  }

  function restart() {
    try { games.clearResume("arcade", currentVariant, "free"); } catch (error) { /* noop */ }
    global.location.href = "play.html?v=" + encodeURIComponent(currentVariant);
  }

  /* ================================================================== 1. Reflex Tap */
  function ReflexTap(engine, ui, savedState) {
    var ROUNDS = 5;
    var state = (savedState && savedState.rounds === ROUNDS) ? savedState : {
      rounds: ROUNDS, round: 1, results: [], phase: "wait", delay: 0, greenAt: 0, timer: 0
    };
    /* Resume always re-arms the current round's wait honestly — completed rounds kept. */
    if (state.phase === "armed" || state.phase === "green") state.phase = "wait";
    state.timer = 0;

    function checkpoint() { engine.checkpoint(state); }

    function arm() {
      state.phase = "armed";
      state.delay = 900 + engine.int(1701); /* 900–2600 ms, seeded */
      checkpoint();
      render();
      state.timer = global.setTimeout(goGreen, state.delay);
    }

    function goGreen() {
      if (state.phase !== "armed") return;
      state.phase = "green";
      state.greenAt = Date.now();
      checkpoint();
      render();
    }

    function tap() {
      if (state.phase === "armed") {
        global.clearTimeout(state.timer);
        state.results.push({ ms: 0, foul: true, points: 0 });
        engine.action("reflex-foul", "round " + state.round);
        advance();
        return;
      }
      if (state.phase !== "green") return;
      var ms = Math.max(0, Date.now() - state.greenAt);
      var points = scoreReflex(ms, false);
      state.results.push({ ms: ms, foul: false, points: points });
      engine.action("reflex-tap", "round " + state.round + " " + ms + "ms +" + points);
      advance();
    }

    function advance() {
      var total = state.results.reduce(function (sum, row) { return sum + row.points; }, 0);
      engine.score(total);
      if (state.round >= ROUNDS) { finish(total); return; }
      state.round += 1;
      state.phase = "wait";
      checkpoint();
      render();
    }

    function finish(total) {
      global.clearTimeout(state.timer);
      var outcome = reflexOutcome(total);
      var valid = state.results.filter(function (row) { return !row.foul; });
      var avg = valid.length ? Math.round(valid.reduce(function (s, row) { return s + row.ms; }, 0) / valid.length) : 0;
      var fouls = state.results.length - valid.length;
      state.phase = "over";
      checkpoint();
      ui.finish({
        outcome: outcome,
        score: total,
        meta: { boardPoints: total, competitionMode: "free", avgMs: avg, fouls: fouls },
        lines: [
          "Five taps · average " + (valid.length ? avg + " ms" : "no clean taps") + (fouls ? " · " + fouls + " foul" + (fouls === 1 ? "" : "s") : ""),
          "Free performance only — no Paragon Coins moved"
        ],
        actions: finishActions()
      });
    }

    function render() {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      var total = state.results.reduce(function (sum, row) { return sum + row.points; }, 0);
      ui.setStat("score", total);
      ui.setStat("round", state.round + "/" + ROUNDS);
      ui.setMeta("Tap only when the panel turns green. Early taps are fouls. Points are not Paragon Coins.");
      var panel = "";
      if (state.phase === "wait") {
        panel = '<button type="button" class="arcade-reflex-panel is-idle" data-action="arm">Round ' + state.round + " — press to arm the timer</button>";
      } else if (state.phase === "armed") {
        panel = '<button type="button" class="arcade-reflex-panel is-wait" data-action="tap">WAIT…</button>';
      } else if (state.phase === "green") {
        panel = '<button type="button" class="arcade-reflex-panel is-green" data-action="tap">TAP</button>';
      }
      var history = state.results.map(function (row, i) {
        return '<span title="Round ' + (i + 1) + (row.foul ? ": foul" : ": " + row.ms + " ms") + '">' + (row.foul ? "✕" : row.ms + "ms") + "</span>";
      }).join("") || '<span title="No rounds yet">—</span>';
      stage.innerHTML = '<div class="arcade-reflex">' + panel +
        '<div class="arcade-history" aria-label="Round results">' + history + "</div></div>";
      var button = stage.querySelector("[data-action]");
      if (button) button.addEventListener("click", function () {
        if (state.phase === "wait") arm();
        else tap();
      });
    }

    render();
  }

  /* ================================================================== 2. Memory Match */
  var MEMORY_GLYPHS = ["★", "◆", "●", "▲", "■", "♥"];

  function MemoryMatch(engine, ui, savedState) {
    var state = (savedState && Array.isArray(savedState.board) && savedState.board.length === 12) ? savedState : null;
    if (!state) {
      var deck = MEMORY_GLYPHS.concat(MEMORY_GLYPHS);
      /* Seeded Fisher–Yates — same seed replays the same board. */
      for (var i = deck.length - 1; i > 0; i--) {
        var j = engine.int(i + 1);
        var swap = deck[i]; deck[i] = deck[j]; deck[j] = swap;
      }
      state = { board: deck, matched: [], open: [], moves: 0, combo: 0, score: 0, lock: false };
    }
    /* A half-open pair honestly closes on resume. */
    state.open = [];
    state.lock = false;
    var flipTimer = 0;
    var reduced = reduceMotion();
    checkpoint(); /* exact board is resumable from the first render */

    function checkpoint() { engine.checkpoint(state); }

    function flip(index) {
      if (state.lock || state.matched.indexOf(index) !== -1 || state.open.indexOf(index) !== -1) return;
      state.open.push(index);
      engine.action("memory-flip", "card " + index);
      if (state.open.length < 2) { checkpoint(); render(); return; }
      state.moves += 1;
      var a = state.open[0];
      var b = state.open[1];
      if (state.board[a] === state.board[b]) {
        var gained = memoryMatchPoints(state.combo);
        state.combo += 1;
        state.score += gained;
        state.matched.push(a, b);
        state.open = [];
        engine.action("memory-match", state.board[a] + " +" + gained);
        engine.score(state.score);
        checkpoint();
        if (state.matched.length === 12) { finish(); return; }
        render();
      } else {
        state.combo = 0;
        state.lock = true;
        engine.action("memory-miss", "moves " + state.moves);
        checkpoint();
        render();
        flipTimer = global.setTimeout(function () {
          state.open = [];
          state.lock = false;
          checkpoint();
          render();
        }, reduced ? 120 : 700);
      }
    }

    function finish() {
      global.clearTimeout(flipTimer);
      var bonus = memoryBonus(state.moves);
      var total = state.score + bonus;
      engine.score(total);
      checkpoint();
      ui.finish({
        outcome: "win",
        score: total,
        meta: { boardPoints: total, competitionMode: "free", moves: state.moves, bonus: bonus },
        lines: [
          "Board cleared in " + state.moves + " moves" + (bonus ? " · efficiency bonus +" + bonus : ""),
          "Free performance only — no Paragon Coins moved"
        ],
        actions: finishActions()
      });
    }

    function render() {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      ui.setStat("score", state.score);
      ui.setStat("moves", state.moves);
      ui.setStat("pairs", (state.matched.length / 2) + "/6");
      ui.setMeta("Match all six pairs. Consecutive matches build a combo bonus. Points are not Paragon Coins.");
      var cards = "";
      for (var i = 0; i < 12; i++) {
        var face = state.matched.indexOf(i) !== -1 || state.open.indexOf(i) !== -1;
        cards += '<button type="button" class="arcade-card' + (face ? " is-face" : "") + (state.matched.indexOf(i) !== -1 ? " is-matched" : "") + '" data-card="' + i + '" aria-label="Card ' + (i + 1) + (face ? ", " + state.board[i] : ", face down") + '">' + (face ? esc(state.board[i]) : "◈") + "</button>";
      }
      stage.innerHTML = '<div class="arcade-memory" role="group" aria-label="Memory board">' + cards + "</div>";
      stage.querySelectorAll("[data-card]").forEach(function (button) {
        button.addEventListener("click", function () { flip(Number(button.getAttribute("data-card"))); });
      });
    }

    render();
  }

  /* ================================================================== 3. Timing Bar */
  function TimingBar(engine, ui, savedState) {
    var ROUNDS = 5;
    var state = (savedState && savedState.rounds === ROUNDS) ? savedState : {
      rounds: ROUNDS, round: 1, results: [], phase: "ready", period: 1600, startedAt: 0
    };
    var raf = 0;
    var marker = null;

    function checkpoint() { engine.checkpoint(state); }

    function positionAt(now) {
      var elapsed = Math.max(0, now - state.startedAt);
      var half = state.period / 2;
      var cycle = elapsed % state.period;
      return cycle < half ? (cycle / half) * 100 : 100 - ((cycle - half) / half) * 100;
    }

    function tick() {
      if (state.phase !== "sweep" || !marker) return;
      marker.style.left = positionAt(Date.now()) + "%";
      raf = (global.requestAnimationFrame || function (fn) { return global.setTimeout(fn, 16); })(tick);
    }

    function stopLoop() {
      if (global.cancelAnimationFrame) { try { global.cancelAnimationFrame(raf); } catch (error) { /* noop */ } }
      else global.clearTimeout(raf);
    }

    function startRound() {
      if (state.phase !== "ready") return;
      state.period = 1200 + engine.int(1001); /* 1200–2200 ms sweep, seeded */
      state.startedAt = Date.now();
      state.phase = "sweep";
      engine.action("timing-start", "round " + state.round + " period " + state.period);
      checkpoint();
      render();
    }

    function stop() {
      if (state.phase !== "sweep") return;
      stopLoop();
      var pos = Math.round(positionAt(Date.now()) * 10) / 10;
      var points = timingPoints(pos);
      state.results.push({ pos: pos, points: points });
      engine.action("timing-stop", "round " + state.round + " @" + pos + " +" + points);
      var total = state.results.reduce(function (sum, row) { return sum + row.points; }, 0);
      engine.score(total);
      if (state.round >= ROUNDS) { finish(total); return; }
      state.round += 1;
      state.phase = "ready";
      checkpoint();
      render();
    }

    function finish(total) {
      state.phase = "over";
      checkpoint();
      ui.finish({
        outcome: timingOutcome(total),
        score: total,
        meta: { boardPoints: total, competitionMode: "free", best: Math.max.apply(null, state.results.map(function (r) { return r.points; }).concat([0])) },
        lines: [
          "Five stops · best stop +" + Math.max.apply(null, state.results.map(function (r) { return r.points; }).concat([0])),
          "Free performance only — no Paragon Coins moved"
        ],
        actions: finishActions()
      });
    }

    function render() {
      stopLoop();
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      var total = state.results.reduce(function (sum, row) { return sum + row.points; }, 0);
      ui.setStat("score", total);
      ui.setStat("round", state.round + "/" + ROUNDS);
      ui.setMeta("Stop the marker on the centre bullseye. Bullseye 200 · inner 120 · outer 60. Points are not Paragon Coins.");
      var history = state.results.map(function (row, i) {
        return "<span> R" + (i + 1) + " +" + row.points + "</span>";
      }).join("") || '<span title="No stops yet">—</span>';
      stage.innerHTML = '<div class="arcade-timing">' +
        '<div class="arcade-track" aria-hidden="true"><div class="arcade-zone is-outer"></div><div class="arcade-zone is-inner"></div><div class="arcade-zone is-bull"></div><div class="arcade-marker" id="arcadeMarker"></div></div>' +
        '<p class="arcade-timing-label">Centre 50 · bullseye ±4 · inner ±10 · outer ±20</p>' +
        (state.phase === "ready"
          ? '<button type="button" class="arcade-main-action" data-action="start">Start sweep — round ' + state.round + "</button>"
          : '<button type="button" class="arcade-main-action" data-action="stop">STOP</button>') +
        '<div class="arcade-history" aria-label="Round results">' + history + "</div></div>";
      marker = stage.querySelector("#arcadeMarker");
      var start = stage.querySelector('[data-action="start"]');
      if (start) start.addEventListener("click", startRound);
      var stopBtn = stage.querySelector('[data-action="stop"]');
      if (stopBtn) {
        stopBtn.addEventListener("click", stop);
        stopBtn.focus();
        tick();
      }
    }

    /* Resume re-arms the current round honestly (a sweep cannot pause fairly). */
    if (state.phase === "sweep") { state.phase = "ready"; checkpoint(); }
    render();
  }

  /* ================================================================== 4. Sequence Repeat */
  function SequenceRepeat(engine, ui, savedState) {
    var MAX_ROUNDS = 8;
    var state = (savedState && savedState.maxRounds === MAX_ROUNDS) ? savedState : {
      maxRounds: MAX_ROUNDS, round: 1, cleared: 0, score: 0,
      pattern: [], input: [], phase: "watch", step: 0
    };
    var timers = [];
    var reduced = reduceMotion();

    function later(fn, ms) {
      timers.push(global.setTimeout(fn, reduced ? Math.min(ms, 160) : ms));
    }

    function clearTimers() {
      timers.forEach(function (t) { global.clearTimeout(t); });
      timers = [];
    }

    function checkpoint() { engine.checkpoint(state); }

    function dealPattern() {
      var length = state.round + 2;
      state.pattern = [];
      for (var i = 0; i < length; i++) state.pattern.push(engine.int(4) + 1);
      state.input = [];
      state.step = 0;
      state.phase = "watch";
      engine.action("sequence-deal", "round " + state.round + " length " + length);
      checkpoint();
      render();
      playPattern();
    }

    function playPattern() {
      var i = 0;
      function light() {
        if (state.phase !== "watch") return;
        if (i >= state.pattern.length) {
          state.phase = "repeat";
          checkpoint();
          render();
          return;
        }
        var pad = state.pattern[i];
        i += 1;
        state.step = i;
        render();
        later(light, 700);
      }
      later(light, 500);
    }

    function press(pad) {
      if (state.phase !== "repeat") return;
      var expected = state.pattern[state.input.length];
      state.input.push(pad);
      engine.action("sequence-press", "pad " + pad);
      if (pad !== expected) { finish(false); return; }
      state.score += 10;
      engine.score(state.score);
      if (state.input.length >= state.pattern.length) {
        var bonus = state.round * 50;
        state.score += bonus;
        engine.score(state.score);
        state.cleared = state.round;
        engine.action("sequence-clear", "round " + state.round + " bonus +" + bonus);
        if (state.round >= MAX_ROUNDS) { finish(true); return; }
        state.round += 1;
        checkpoint();
        render();
        later(dealPattern, 600);
      } else {
        checkpoint();
        render();
      }
    }

    function finish(completed) {
      clearTimers();
      state.phase = "over";
      checkpoint();
      ui.finish({
        outcome: sequenceOutcome(state.cleared),
        score: state.score,
        meta: { boardPoints: state.score, competitionMode: "free", cleared: state.cleared },
        lines: [
          (completed ? "All 8 patterns cleared" : "Run ended on round " + state.round + " · " + state.cleared + " cleared"),
          "Free performance only — no Paragon Coins moved"
        ],
        actions: finishActions()
      });
    }

    function render() {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      ui.setStat("score", state.score);
      ui.setStat("round", state.round + "/" + MAX_ROUNDS);
      ui.setStat("cleared", state.cleared);
      ui.setMeta("Repeat the pattern with clicks or keys 1–4. One wrong pad ends the run. Points are not Paragon Coins.");
      var lit = state.phase === "watch" && state.step > 0 ? state.pattern[state.step - 1] : 0;
      var pads = "";
      for (var p = 1; p <= 4; p++) {
        pads += '<button type="button" class="arcade-pad is-pad' + p + (lit === p ? " is-lit" : "") + '" data-pad="' + p + '"' +
          (state.phase !== "repeat" ? " disabled" : "") + ' aria-label="Pad ' + p + '">' + p + "</button>";
      }
      var status = state.phase === "watch" ? "Watch… step " + state.step + " of " + state.pattern.length
        : state.phase === "repeat" ? "Your turn — " + state.input.length + " of " + state.pattern.length + " pressed"
        : "Round " + state.round;
      stage.innerHTML = '<div class="arcade-sequence"><p class="arcade-status">' + esc(status) + '</p><div class="arcade-pads">' + pads + "</div></div>";
      stage.querySelectorAll("[data-pad]").forEach(function (button) {
        button.addEventListener("click", function () { press(Number(button.getAttribute("data-pad"))); });
      });
    }

    doc.addEventListener("keydown", function handler(event) {
      if (currentVariant !== "sequence") { doc.removeEventListener("keydown", handler); return; }
      if (state.phase !== "repeat") return;
      var n = Number(event.key);
      if (n >= 1 && n <= 4) press(n);
    });

    /* Resume restarts the current round with a fresh seeded pattern (stated in rules). */
    if (state.phase === "watch" || state.phase === "repeat") { dealPattern(); return; }
    dealPattern();
  }

  /* ================================================================== 5. Target Sprint */
  function TargetSprint(engine, ui, savedState) {
    var SPRINT_MS = 25000;
    var state = (savedState && savedState.sprintMs === SPRINT_MS && savedState.phase !== "over") ? savedState : null;
    /* Timer games restart honestly on resume — a sprint cannot pause fairly. */
    if (state && state.phase === "run") state = null;
    if (!state) {
      state = { sprintMs: SPRINT_MS, hits: 0, misses: 0, target: null, phase: "ready", startedAt: 0, count: 0 };
    }
    var ticker = 0;

    function checkpoint() { engine.checkpoint(state); }

    function spawn() {
      state.target = {
        x: 6 + engine.int(83), /* percent, keeps the target inside the arena */
        y: 8 + engine.int(76),
        size: 44 + engine.int(29) /* 44–72 px */
      };
      state.count += 1;
      checkpoint();
      render();
    }

    function start() {
      if (state.phase !== "ready") return;
      state.phase = "run";
      state.startedAt = Date.now();
      engine.action("sprint-start", "25s");
      spawn();
      ticker = global.setInterval(function () {
        var left = SPRINT_MS - (Date.now() - state.startedAt);
        var node = doc.getElementById("arcadeClock");
        if (node) node.textContent = Math.max(0, Math.ceil(left / 1000)) + "s";
        if (left <= 0) finish();
      }, 100);
      render();
    }

    function tapTarget(event) {
      if (event) { try { event.stopPropagation(); } catch (err) { /* noop */ } }
      if (state.phase !== "run") return;
      state.hits += 1;
      engine.action("sprint-hit", "hit " + state.hits);
      engine.score(targetsScore(state.hits, state.misses));
      spawn();
    }

    function tapArena() {
      if (state.phase !== "run") return;
      state.misses += 1;
      engine.action("sprint-miss", "miss " + state.misses);
      engine.score(targetsScore(state.hits, state.misses));
      render();
    }

    function finish() {
      global.clearInterval(ticker);
      if (state.phase === "over") return;
      var total = targetsScore(state.hits, state.misses);
      engine.score(total);
      state.phase = "over";
      checkpoint();
      ui.finish({
        outcome: targetsOutcome(state.hits),
        score: total,
        meta: { boardPoints: total, competitionMode: "free", hits: state.hits, misses: state.misses },
        lines: [
          "25 seconds · " + state.hits + " hits · " + state.misses + " misses",
          "Free performance only — no Paragon Coins moved"
        ],
        actions: finishActions()
      });
    }

    function render() {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      ui.setStat("score", targetsScore(state.hits, state.misses));
      ui.setStat("hits", state.hits);
      ui.setStat("misses", state.misses);
      ui.setMeta("Tap the target for 100. Tapping empty arena costs 25. Points are not Paragon Coins.");
      if (state.phase === "ready") {
        stage.innerHTML = '<div class="arcade-sprint"><button type="button" class="arcade-main-action" data-action="start">Start 25-second sprint</button></div>';
        var startBtn = stage.querySelector('[data-action="start"]');
        if (startBtn) startBtn.addEventListener("click", start);
        return;
      }
      var left = state.phase === "run" ? Math.max(0, Math.ceil((SPRINT_MS - (Date.now() - state.startedAt)) / 1000)) : 0;
      var target = "";
      if (state.target) {
        target = '<button type="button" class="arcade-target" style="left:' + state.target.x + "%;top:" + state.target.y + "%;width:" + state.target.size + "px;height:" + state.target.size + 'px" data-action="hit" aria-label="Target">◎</button>';
      }
      stage.innerHTML = '<div class="arcade-sprint"><p class="arcade-clock" id="arcadeClock">' + left + 's</p><div class="arcade-arena" data-action="arena">' + target + "</div></div>";
      var hit = stage.querySelector('[data-action="hit"]');
      if (hit) hit.addEventListener("click", tapTarget);
      var arena = stage.querySelector('[data-action="arena"]');
      if (arena) arena.addEventListener("click", tapArena);
    }

    render();
  }

  /* ------------------------------------------------------------------ boot (?v=…) */
  var STATS = {
    reflex: [{ id: "score", label: "Score" }, { id: "round", label: "Round" }],
    memory: [{ id: "score", label: "Score" }, { id: "moves", label: "Moves" }, { id: "pairs", label: "Pairs" }],
    timing: [{ id: "score", label: "Score" }, { id: "round", label: "Round" }],
    sequence: [{ id: "score", label: "Score" }, { id: "round", label: "Round" }, { id: "cleared", label: "Cleared" }],
    targets: [{ id: "score", label: "Score" }, { id: "hits", label: "Hits" }, { id: "misses", label: "Misses" }]
  };

  function pickVariant() {
    var asked = "";
    try { asked = String(new URLSearchParams(global.location.search || "").get("v") || "").trim(); }
    catch (error) { asked = ""; }
    var entry = games ? games.game("arcade") : null;
    var known = entry && Array.isArray(entry.variants) ? entry.variants : [];
    var ok = known.some(function (v) { return v.key === asked; });
    return ok ? asked : "reflex";
  }

  function boot() {
    if (!doc.getElementById("game-stage")) return;
    if (!kit || !games) return;
    currentVariant = pickVariant();
    kit.mount({
      hud: "#game-hud",
      gameKey: "arcade",
      variant: currentVariant,
      stats: STATS[currentVariant] || STATS.reflex,
      onStart: function (engine, savedState, resumed, shell) {
        if (currentVariant === "memory") MemoryMatch(engine, shell, savedState);
        else if (currentVariant === "timing") TimingBar(engine, shell, savedState);
        else if (currentVariant === "sequence") SequenceRepeat(engine, shell, savedState);
        else if (currentVariant === "targets") TargetSprint(engine, shell, savedState);
        else ReflexTap(engine, shell, savedState);
      },
      onQuit: function () { global.location.href = "index.html"; }
    });
    var title = doc.getElementById("variant-title");
    if (title) {
      var row = games.variant("arcade", currentVariant);
      title.textContent = row ? row.name : currentVariant;
    }
    var names = { reflex: "Reflex Tap", memory: "Memory Match", timing: "Timing Bar", sequence: "Sequence Repeat", targets: "Target Sprint" };
    doc.title = "Paragon Arcade — " + (names[currentVariant] || "Play");
  }

  /* The pure rules are exported so tests can check them without a browser.
     Nothing here touches the DOM, storage, coins or the network. */
  global.ParagonArcade = {
    VARIANTS: ["reflex", "memory", "timing", "sequence", "targets"],
    MEMORY_GLYPHS: MEMORY_GLYPHS,
    scoreReflex: scoreReflex,
    reflexOutcome: reflexOutcome,
    memoryMatchPoints: memoryMatchPoints,
    memoryBonus: memoryBonus,
    timingPoints: timingPoints,
    timingOutcome: timingOutcome,
    sequenceRoundPoints: sequenceRoundPoints,
    sequenceOutcome: sequenceOutcome,
    targetsScore: targetsScore,
    targetsOutcome: targetsOutcome
  };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
