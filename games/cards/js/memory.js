/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: memory.js
  EXPECTED PROJECT PATH: /games/cards/js/memory.js
  ROLE: Paragon Cards wave 2 — Memory rules and rendering. Sixteen playing cards hide eight
        pairs matched by RANK (any suits): eight seeded ranks, two distinct seeded suits each,
        one seeded shuffle. Consecutive matches build a combo bonus; few moves earn an
        efficiency bonus. Sessions, bests, resume and audit stay in games/engine.js.
  PLATFORM LAWS: ranks, suits and the shuffle come from engine.int draws only (seeded,
        replayable); no window.alert/prompt/confirm; free play never touches coins; scores
        are points, never chips or coins.
  RESTORE-LOAD NOTE: Load after js/cards.js on play.html. Dispatched from cards.js boot
        when ?v=memory. Reuses window.ParagonCards.cardHtml for faces.
*/
(function (global) {
  "use strict";

  var doc = global.document;

  function rankMatch(a, b) {
    return !!a && !!b && Number(a.r) === Number(b.r);
  }

  function memoryPoints(combo) {
    return 100 + 25 * Math.max(0, Math.round(Number(combo) || 0));
  }

  /* Eight pairs clear in 8 perfect moves; the bonus pays down to 24 moves. */
  function memoryBonus(moves) {
    var m = Math.max(0, Math.round(Number(moves) || 0));
    return m <= 24 ? (24 - m) * 15 : 0;
  }

  function cardBack() {
    return '<div class="pcard pcard-back" aria-label="Face-down card"><span class="pcard-mark">◈</span></div>';
  }

  function play(engine, ui, savedState) {
    var lib = global.ParagonCards || {};
    function face(card) {
      return typeof lib.cardHtml === "function" ? lib.cardHtml(card, false) : "";
    }

    var state = (savedState && Array.isArray(savedState.board) && savedState.board.length === 16) ? savedState : null;
    if (!state) {
      /* Eight distinct ranks, seeded without replacement. */
      var rankPool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      var ranks = [];
      for (var p = 0; p < 8; p++) ranks.push(rankPool.splice(engine.int(rankPool.length), 1)[0]);
      var suits = ["s", "h", "d", "c"];
      var deck = [];
      ranks.forEach(function (rank) {
        var first = suits[engine.int(4)];
        var second = suits[engine.int(4)];
        if (second === first) second = suits[(suits.indexOf(first) + 1 + engine.int(3)) % 4];
        deck.push({ r: rank, s: first }, { r: rank, s: second });
      });
      for (var i = deck.length - 1; i > 0; i--) {
        var j = engine.int(i + 1);
        var swap = deck[i]; deck[i] = deck[j]; deck[j] = swap;
      }
      state = { board: deck, matched: [], open: [], moves: 0, combo: 0, score: 0, lock: false };
      engine.action("memory-deal", "8 seeded rank pairs");
    }
    /* A half-open pair honestly closes on resume. */
    state.open = [];
    state.lock = false;
    var flipTimer = 0;
    var reduced = false;
    try { reduced = !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch (error) { /* default */ }

    function checkpoint() { engine.checkpoint(state); }

    function flip(index) {
      if (state.lock || state.matched.indexOf(index) !== -1 || state.open.indexOf(index) !== -1) return;
      state.open.push(index);
      engine.action("memory-flip", "card " + index);
      if (state.open.length < 2) { checkpoint(); render(); return; }
      state.moves += 1;
      var a = state.board[state.open[0]];
      var b = state.board[state.open[1]];
      if (rankMatch(a, b)) {
        var gained = memoryPoints(state.combo);
        state.combo += 1;
        state.score += gained;
        state.matched.push(state.open[0], state.open[1]);
        state.open = [];
        engine.action("memory-match", "rank " + a.r + " +" + gained);
        engine.score(state.score);
        checkpoint();
        if (state.matched.length === 16) { finish(); return; }
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
        }, reduced ? 120 : 750);
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
          "Eight pairs cleared in " + state.moves + " moves" + (bonus ? " · efficiency bonus +" + bonus : ""),
          "Pairs match by rank — suits never matter",
          "Free performance only — no Paragon Coins moved"
        ],
        actions: [
          { label: "New board", primary: true, onClick: function () { restart(); } },
          { label: "Other modes", onClick: function () { global.location.href = "index.html"; } },
          { label: "Leaderboard", onClick: function () { global.location.href = "index.html#leaderboard"; } }
        ]
      });
    }

    function restart() {
      try { global.ParagonGames.clearResume("cards", "memory", "free"); } catch (error) { /* noop */ }
      global.location.href = "play.html?v=memory";
    }

    function render() {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      ui.setStat("score", state.score);
      ui.setStat("moves", state.moves);
      ui.setStat("pairs", (state.matched.length / 2) + "/8");
      ui.setMeta("Match by rank — suits never matter. Combo bonus grows per consecutive match. Points are not Paragon Coins.");
      var cards = "";
      for (var i = 0; i < 16; i++) {
        var faceUp = state.matched.indexOf(i) !== -1 || state.open.indexOf(i) !== -1;
        cards += '<button type="button" class="cmemory-cell' + (faceUp ? " is-face" : "") +
          (state.matched.indexOf(i) !== -1 ? " is-matched" : "") + '" data-cell="' + i + '"' +
          ' aria-label="Card ' + (i + 1) + (faceUp ? ", rank " + state.board[i].r : ", face down") + '">' +
          (faceUp ? face(state.board[i]) : cardBack()) + "</button>";
      }
      stage.innerHTML = '<div class="cmemory-board" role="group" aria-label="Memory board">' + cards + "</div>";
      stage.querySelectorAll("[data-cell]").forEach(function (button) {
        button.addEventListener("click", function () { flip(Number(button.getAttribute("data-cell"))); });
      });
    }

    checkpoint();
    render();
  }

  global.ParagonCardsMemory = {
    rankMatch: rankMatch,
    memoryPoints: memoryPoints,
    memoryBonus: memoryBonus,
    play: play
  };
})(typeof window !== "undefined" ? window : globalThis);
