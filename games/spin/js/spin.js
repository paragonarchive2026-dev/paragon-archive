/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: spin.js
  EXPECTED PROJECT PATH: /games/spin/js/spin.js
  ROLE: Paragon Spin Precision Wheel rules and rendering. Six seeded turns, one shared result,
        equal scoring for player and house. Session lifecycle, resume, bests and auditing stay
        in games/engine.js; this file never touches coins, account data or the network.
  PLATFORM LAWS: every house pick/result/rotation draw comes from engine.random/int; free-only;
        no browser dialogs; no invented online users; no money language or payout behaviour.
  RESTORE-LOAD NOTE: Load after site-kit.js, manifest.js, engine.js and game-kit.js.
*/
(function (global) {
  "use strict";

  var doc = global.document;
  var games = global.ParagonGames;
  var kit = global.ParagonGameKit;
  var TOTAL_TURNS = 6;
  var SECTORS = 12;
  var spinTimer = null;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function circularDistance(a, b, total) {
    var size = Math.max(1, Math.round(Number(total) || SECTORS));
    var left = ((Math.round(Number(a) || 1) - 1) % size + size) % size;
    var right = ((Math.round(Number(b) || 1) - 1) % size + size) % size;
    var direct = Math.abs(left - right);
    return Math.min(direct, size - direct);
  }

  function scorePrediction(target, result) {
    var distance = circularDistance(target, result, SECTORS);
    if (distance === 0) return { points: 120, distance: 0, label: "exact" };
    if (distance === 1) return { points: 60, distance: 1, label: "adjacent" };
    if (distance === 2) return { points: 25, distance: 2, label: "two away" };
    return { points: 0, distance: distance, label: "miss" };
  }

  /* Sector 1 is centred under the top pointer. Positive motion keeps the physical wheel
     turning clockwise while preserving the exact final sector modulo 360. */
  function rotationForResult(currentRotation, result, turns) {
    var current = Number(currentRotation) || 0;
    var fullTurns = Math.max(1, Math.round(Number(turns) || 5));
    var targetModulo = ((-(Math.round(Number(result) || 1) - 1) * 30) % 360 + 360) % 360;
    var currentModulo = ((current % 360) + 360) % 360;
    var delta = (targetModulo - currentModulo + 360) % 360;
    return current + fullTurns * 360 + delta;
  }

  function freshState() {
    return {
      round: 1,
      totalRounds: TOTAL_TURNS,
      playerScore: 0,
      houseScore: 0,
      playerPick: null,
      housePick: null,
      result: null,
      playerGain: 0,
      houseGain: 0,
      phase: "pick",
      rotation: 0,
      previousRotation: 0,
      history: [],
      message: "Choose the sector you believe the wheel will find."
    };
  }

  function wheelNumbers() {
    var html = "";
    for (var i = 0; i < SECTORS; i++) {
      html += '<span class="spin-wheel-number' + ([2, 6, 10].indexOf(i) !== -1 ? " is-cream" : "") + '" style="--i:' + i + '">' + (i + 1) + "</span>";
    }
    return html;
  }

  function SpinMatch(engine, ui, savedState) {
    var state = savedState && savedState.totalRounds === TOTAL_TURNS ? savedState : freshState();
    var reduceMotion = false;
    try { reduceMotion = !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (error) { /* default */ }

    function checkpoint() {
      engine.checkpoint(state);
    }

    function pick(number) {
      if (state.phase !== "pick") return;
      state.playerPick = Math.max(1, Math.min(SECTORS, Math.round(Number(number) || 1)));
      state.message = "Sector " + state.playerPick + " is marked. Start when you are ready.";
      engine.action("prediction", "turn " + state.round + " sector " + state.playerPick);
      checkpoint();
      render();
    }

    function startSpin() {
      if (state.phase !== "pick" || !state.playerPick) return;
      state.housePick = engine.int(SECTORS) + 1;
      state.result = engine.int(SECTORS) + 1;
      state.previousRotation = Number(state.rotation) || 0;
      state.rotation = rotationForResult(state.previousRotation, state.result, 5 + engine.int(3));
      state.phase = "spinning";
      state.message = "Predictions locked. The wheel is in motion.";
      engine.action("wheel-start", "turn " + state.round + " player " + state.playerPick + " house " + state.housePick + " result " + state.result);
      checkpoint();
      animate(state.previousRotation);
    }

    function animate(fromRotation) {
      render(fromRotation);
      var disc = doc.querySelector(".spin-disc");
      var raf = global.requestAnimationFrame || function (fn) { return global.setTimeout(fn, 16); };
      raf(function () {
        var liveDisc = doc.querySelector(".spin-disc");
        if (!liveDisc) return;
        liveDisc.classList.add("is-spinning");
        liveDisc.style.transform = "rotate(" + state.rotation + "deg)";
      });
      if (spinTimer) global.clearTimeout(spinTimer);
      spinTimer = global.setTimeout(reveal, reduceMotion ? 80 : 2100);
    }

    function reveal() {
      if (state.phase !== "spinning") return;
      var mine = scorePrediction(state.playerPick, state.result);
      var house = scorePrediction(state.housePick, state.result);
      state.playerGain = mine.points;
      state.houseGain = house.points;
      state.playerScore += mine.points;
      state.houseScore += house.points;
      state.phase = "reveal";
      state.message = "Sector " + state.result + ". You add " + mine.points + "; the house adds " + house.points + ".";
      state.history.push({
        round: state.round,
        playerPick: state.playerPick,
        housePick: state.housePick,
        result: state.result,
        playerPoints: mine.points,
        housePoints: house.points
      });
      engine.action("wheel-result", "turn " + state.round + " sector " + state.result + " player +" + mine.points + " house +" + house.points);
      engine.score(state.playerScore);
      checkpoint();
      render();
    }

    function nextTurn() {
      if (state.phase !== "reveal") return;
      if (state.round >= TOTAL_TURNS) {
        finish();
        return;
      }
      state.round += 1;
      state.playerPick = null;
      state.housePick = null;
      state.result = null;
      state.playerGain = 0;
      state.houseGain = 0;
      state.phase = "pick";
      state.message = "Turn " + state.round + ". Mark your next sector.";
      engine.action("next-turn", state.round);
      checkpoint();
      render();
    }

    function finish() {
      var outcome = state.playerScore > state.houseScore ? "win" : (state.playerScore < state.houseScore ? "loss" : "draw");
      state.phase = "over";
      checkpoint();
      ui.finish({
        outcome: outcome,
        score: state.playerScore,
        meta: { boardPoints: state.playerScore, competitionMode: "free", houseScore: state.houseScore },
        lines: [
          "Final table: you " + state.playerScore + " · house " + state.houseScore,
          "Six turns completed against one shared wheel result per turn",
          "Free performance only — no Paragon Coins moved"
        ],
        actions: [
          { label: "New match", primary: true, onClick: restart },
          { label: "Spin room", onClick: function () { global.location.href = "index.html"; } },
          { label: "Leaderboard", onClick: function () { global.location.href = "index.html#leaderboard"; } }
        ]
      });
    }

    function render(rotationOverride) {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      var spinning = state.phase === "spinning";
      var revealed = state.phase === "reveal";
      var startRotation = rotationOverride != null ? Number(rotationOverride) : Number(state.rotation);
      var numberButtons = "";
      for (var i = 1; i <= SECTORS; i++) {
        numberButtons += '<button type="button" class="spin-number-button' + (state.playerPick === i ? " selected" : "") + '" data-pick="' + i + '"' + (state.phase !== "pick" ? " disabled" : "") + ' aria-pressed="' + (state.playerPick === i ? "true" : "false") + '">' + i + "</button>";
      }
      var history = state.history.length
        ? state.history.map(function (row) { return '<span title="Turn ' + row.round + ': you ' + row.playerPoints + ', house ' + row.housePoints + '">' + row.result + "</span>"; }).join("")
        : '<span title="No result yet">—</span>';

      ui.setStat("score", state.playerScore);
      ui.setStat("house", state.houseScore);
      ui.setStat("round", state.round + "/" + TOTAL_TURNS);
      ui.setStat("result", revealed ? state.result : "—");
      ui.setMeta("Exact 120 · adjacent 60 · two sectors away 25 · farther 0. Points are not Paragon Coins.");

      var action = "";
      if (state.phase === "pick") {
        action = '<button type="button" class="spin-main-action" data-action="spin"' + (!state.playerPick ? " disabled" : "") + '>Start precision wheel</button>';
      } else if (spinning) {
        action = '<button type="button" class="spin-main-action" disabled>Wheel in motion</button>';
      } else if (revealed) {
        action = '<button type="button" class="spin-main-action" data-action="next">' + (state.round >= TOTAL_TURNS ? "View match result" : "Prepare next turn") + "</button>";
      }

      stage.innerHTML = '<div class="spin-layout">' +
        '<div class="spin-wheel-bay"><div class="spin-wheel-assembly" aria-label="Twelve-sector precision wheel">' +
          '<div class="spin-pointer" aria-hidden="true"></div>' +
          '<div class="spin-wheel-shell"><div class="spin-disc" style="transform:rotate(' + startRotation + 'deg)">' + wheelNumbers() + '</div><div class="spin-hub" aria-hidden="true"></div></div>' +
        '</div></div>' +
        '<div class="spin-desk">' +
          '<div class="spin-turnline"><span>Turn <strong>' + state.round + " / " + TOTAL_TURNS + '</strong></span><span>One shared result</span></div>' +
          '<p class="spin-message">' + esc(state.message) + "</p>" +
          '<p class="spin-prediction-label">Your prediction</p>' +
          '<div class="spin-number-grid">' + numberButtons + "</div>" +
          '<div class="spin-picks">' +
            '<div class="spin-pick-card"><small>Your sector</small><strong>' + (state.playerPick || "—") + "</strong></div>" +
            '<div class="spin-pick-card house"><small>House sector</small><strong>' + (state.housePick || "Locked after start") + "</strong></div>" +
          "</div>" + action +
          (revealed ? '<div class="spin-last-result"><span>Turn result · you +' + state.playerGain + " · house +" + state.houseGain + '</span><strong>' + state.result + "</strong></div>" : "") +
          '<div class="spin-history" aria-label="Previous wheel results">' + history + "</div>" +
        "</div></div>";

      stage.querySelectorAll("[data-pick]").forEach(function (button) {
        button.addEventListener("click", function () { pick(button.getAttribute("data-pick")); });
      });
      var spin = stage.querySelector('[data-action="spin"]');
      if (spin) spin.addEventListener("click", startSpin);
      var next = stage.querySelector('[data-action="next"]');
      if (next) next.addEventListener("click", nextTurn);
    }

    if (state.phase === "spinning") animate(state.previousRotation);
    else render();
    return { state: function () { return state; }, render: render };
  }

  function restart() {
    try { games.clearResume("spin", "wheel-duel", "free"); } catch (error) { /* noop */ }
    global.location.href = "play.html";
  }

  function boot() {
    if (!doc || !doc.getElementById("game-stage") || !games || !kit) return;
    kit.mount({
      hud: "#game-hud",
      gameKey: "spin",
      variant: "wheel-duel",
      stats: [
        { id: "score", label: "Your score" },
        { id: "house", label: "House" },
        { id: "round", label: "Turn" },
        { id: "result", label: "Last sector" }
      ],
      onStart: function (engine, savedState, resumed, shell) { SpinMatch(engine, shell, savedState); },
      onQuit: function () { global.location.href = "index.html"; }
    });
  }

  global.ParagonSpin = {
    TOTAL_TURNS: TOTAL_TURNS,
    SECTORS: SECTORS,
    circularDistance: circularDistance,
    scorePrediction: scorePrediction,
    rotationForResult: rotationForResult,
    freshState: freshState
  };

  if (doc && doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
