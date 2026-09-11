/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: solitaire.js
  EXPECTED PROJECT PATH: /games/cards/js/solitaire.js
  ROLE: Paragon Cards wave 2 — Klondike Solitaire rules and rendering. Click-to-move
        (no dragging, mobile-friendly): draw from the stock, build tableau runs down in
        alternating colours, stack each suit Ace-to-King on the foundations. Seeded deal;
        sessions, bests, resume and audit stay in games/engine.js via the dispatched shell.
  PLATFORM LAWS: the deal comes from engine.int draws only (seeded, replayable); no
        window.alert/prompt/confirm; free play never touches coins; scores are points,
        never chips or coins.
  RESTORE-LOAD NOTE: Load after js/cards.js on play.html. Dispatched from cards.js boot
        when ?v=solitaire. Reuses window.ParagonCards.cardHtml for faces.
*/
(function (global) {
  "use strict";

  var doc = global.document;

  /* Published scoring (also printed in the manifest rules — never drift apart). */
  var SCORE = {
    toFoundation: 10,
    wasteToTableau: 5,
    tableauMove: 3,
    flip: 5,
    recyclePenalty: 20,
    winBonusBase: 1000,
    winBonusPerMove: 1
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function isRed(suitKey) {
    return suitKey === "h" || suitKey === "d";
  }

  /* A tableau run builds DOWN in alternating colours; only a King starts an empty column. */
  function canPlaceOnTableau(movingBottom, destTop) {
    if (!movingBottom) return false;
    if (!destTop) return movingBottom.r === 13;
    return isRed(movingBottom.s) !== isRed(destTop.s) && movingBottom.r === destTop.r - 1;
  }

  /* A foundation stacks ONE suit UP from the Ace. */
  function canPlaceOnFoundation(card, foundTop) {
    if (!card) return false;
    if (!foundTop) return card.r === 1;
    return card.s === foundTop.s && card.r === foundTop.r + 1;
  }

  /* Every card below the grabbed one must continue the descending alternating run. */
  function movingStackValid(stack) {
    var cards = Array.isArray(stack) ? stack : [];
    if (!cards.length) return false;
    for (var i = 0; i < cards.length - 1; i++) {
      if (!cards[i].up || !cards[i + 1].up) return false;
      if (isRed(cards[i].s) === isRed(cards[i + 1].s)) return false;
      if (cards[i].r !== cards[i + 1].r + 1) return false;
    }
    return !!cards[cards.length - 1].up;
  }

  function topOf(pile) {
    return Array.isArray(pile) && pile.length ? pile[pile.length - 1] : null;
  }

  /* Recycling turns the waste back into the stock in original order (no shuffle — the
     order is preserved exactly, which is why unlimited passes stay fair). */
  function recycleOrder(waste) {
    return (Array.isArray(waste) ? waste.slice() : []).reverse().map(function (card) {
      return { r: card.r, s: card.s, up: false };
    });
  }

  /* Stalemate detection: any draw, flip, foundation or tableau move available? */
  function solitaireHasMove(piles) {
    var p = piles || {};
    var stock = p.stock || [];
    var waste = p.waste || [];
    var tableau = p.tableau || [];
    var foundations = p.foundations || [];
    if (stock.length) return true;
    var i, j;
    for (i = 0; i < tableau.length; i++) {
      var col = tableau[i] || [];
      var top = topOf(col);
      if (top && !top.up) return true; /* a flip is available */
    }
    function fitsFoundation(card) {
      for (var f = 0; f < foundations.length; f++) {
        if (canPlaceOnFoundation(card, topOf(foundations[f]))) return true;
      }
      return false;
    }
    function fitsTableau(bottom, skipCol) {
      for (var c = 0; c < tableau.length; c++) {
        if (c === skipCol) continue;
        if (canPlaceOnTableau(bottom, topOf(tableau[c]))) return true;
      }
      return false;
    }
    var wasteTop = topOf(waste);
    if (wasteTop && (fitsFoundation(wasteTop) || fitsTableau(wasteTop, -1))) return true;
    for (i = 0; i < tableau.length; i++) {
      var column = tableau[i] || [];
      for (j = 0; j < column.length; j++) {
        if (!column[j].up) continue;
        var stack = column.slice(j);
        if (!movingStackValid(stack)) continue;
        if (stack.length === 1 && fitsFoundation(stack[0])) return true;
        if (fitsTableau(stack[0], i)) return true;
        break; /* only the lowest face-up run head can move from this column */
      }
    }
    return false;
  }

  function foundationCount(foundations) {
    return (foundations || []).reduce(function (sum, pile) { return sum + (pile ? pile.length : 0); }, 0);
  }

  function allTableauUp(tableau) {
    return (tableau || []).every(function (col) {
      return (col || []).every(function (card) { return !!card.up; });
    });
  }

  function cardFace(card, extra, label) {
    var lib = global.ParagonCards || {};
    var html = typeof lib.cardHtml === "function" ? lib.cardHtml(card, !card.up) : "";
    return '<div class="solitaire-card' + (extra || "") + '" data-cardlabel="' + esc(label || "") + '">' + html + "</div>";
  }

  function play(engine, ui, savedState) {
    var state = (savedState && Array.isArray(savedState.tableau) && savedState.tableau.length === 7) ? savedState : null;
    if (!state) {
      var lib = global.ParagonCards || {};
      var deck = typeof lib.buildShoe === "function"
        ? lib.buildShoe(1, function () { return engine.next(); })
        : [];
      var tableau = [[], [], [], [], [], [], []];
      for (var col = 0; col < 7; col++) {
        for (var row = 0; row <= col; row++) {
          var dealt = deck.pop() || { r: 1, s: "s" };
          dealt.up = row === col;
          tableau[col].push(dealt);
        }
      }
      var stock = deck.map(function (card) { card.up = false; return card; });
      state = {
        stock: stock, waste: [], tableau: tableau, foundations: [[], [], [], []],
        score: 0, moves: 0, passes: 0, selected: null, phase: "play",
        message: "Build each suit Ace to King. Tap a card, then tap where it goes."
      };
      engine.action("solitaire-deal", "seeded 52");
    }
    state.selected = null;
    state.phase = "play";

    function checkpoint() { engine.checkpoint(state); }

    function addScore(n) {
      state.score = Math.max(0, state.score + n);
      engine.score(state.score);
    }

    function select(from, col, index) {
      state.selected = { from: from, col: col, index: index };
      checkpoint();
      render();
    }

    function clearSelect(message) {
      state.selected = null;
      if (message) state.message = message;
      checkpoint();
      render();
    }

    function movingCards() {
      var sel = state.selected;
      if (!sel) return [];
      if (sel.from === "waste") {
        var top = topOf(state.waste);
        return top ? [top] : [];
      }
      var column = state.tableau[sel.col] || [];
      return column.slice(sel.index);
    }

    function removeMoving() {
      var sel = state.selected;
      if (sel.from === "waste") return [state.waste.pop()];
      var column = state.tableau[sel.col] || [];
      return column.splice(sel.index);
    }

    function flipExposed(col) {
      var column = state.tableau[col] || [];
      var top = topOf(column);
      if (top && !top.up) {
        top.up = true;
        addScore(SCORE.flip);
        engine.action("solitaire-flip", "col " + (col + 1));
      }
    }

    function drawStock() {
      if (state.stock.length) {
        var card = state.stock.pop();
        card.up = true;
        state.waste.push(card);
        state.moves += 1;
        engine.action("solitaire-draw", "waste " + state.waste.length);
        checkpoint();
        render();
        return;
      }
      if (!state.waste.length) {
        state.message = "Stock and waste are both empty — keep building.";
        checkpoint();
        render();
        return;
      }
      state.stock = recycleOrder(state.waste);
      state.waste = [];
      state.passes += 1;
      state.moves += 1;
      addScore(-SCORE.recyclePenalty);
      engine.action("solitaire-recycle", "pass " + (state.passes + 1) + " −" + SCORE.recyclePenalty);
      state.message = "Waste recycled (pass " + (state.passes + 1) + ", −" + SCORE.recyclePenalty + " pts).";
      checkpoint();
      render();
    }

    function tryTableau(col) {
      var sel = state.selected;
      var column = state.tableau[col] || [];
      var cards = movingCards();
      if (!sel || !cards.length) return;
      if (sel.from === "tableau" && sel.col === col) { clearSelect("That is where those cards already are."); return; }
      if (!movingStackValid(cards)) { clearSelect("Only a descending alternating run can move together."); return; }
      if (!canPlaceOnTableau(cards[0], topOf(column))) {
        clearSelect(sel.from === "waste" || cards.length > 1 || column.length
          ? "That card cannot land there — tableau builds down in alternating colours."
          : "That card cannot land there.");
        return;
      }
      var moved = removeMoving();
      if (sel.from === "tableau") flipExposed(sel.col);
      state.tableau[col] = column.concat(moved);
      state.moves += 1;
      addScore(sel.from === "waste" ? SCORE.wasteToTableau : SCORE.tableauMove);
      engine.action("solitaire-tableau", moved.length + " to col " + (col + 1));
      state.selected = null;
      state.message = moved.length > 1 ? moved.length + " cards moved." : "Card placed.";
      afterMove();
    }

    function tryFoundation(index) {
      var sel = state.selected;
      var cards = movingCards();
      if (!sel || cards.length !== 1) {
        if (sel) clearSelect("Foundations take one card at a time.");
        return;
      }
      var pile = state.foundations[index] || [];
      if (!canPlaceOnFoundation(cards[0], topOf(pile))) {
        clearSelect("Foundations stack one suit up from the Ace.");
        return;
      }
      var moved = removeMoving();
      if (sel.from === "tableau") flipExposed(sel.col);
      state.foundations[index] = pile.concat(moved);
      state.moves += 1;
      addScore(SCORE.toFoundation);
      engine.action("solitaire-foundation", "pile " + (index + 1) + " +" + SCORE.toFoundation);
      state.selected = null;
      state.message = "To the foundation — nice.";
      afterMove();
    }

    function tapTableauCard(col, index) {
      var column = state.tableau[col] || [];
      var card = column[index];
      if (!card) { tryTableau(col); return; }
      if (!card.up) {
        if (index === column.length - 1) {
          card.up = true;
          state.moves += 1;
          addScore(SCORE.flip);
          engine.action("solitaire-flip", "col " + (col + 1));
          state.message = "Card turned.";
          afterMove();
        }
        return;
      }
      var sel = state.selected;
      /* Tapping the selected card again sends it to a foundation if one fits. */
      if (sel && sel.from === "tableau" && sel.col === col && sel.index === index) {
        var stack = column.slice(index);
        if (stack.length === 1) {
          for (var f = 0; f < 4; f++) {
            if (canPlaceOnFoundation(stack[0], topOf(state.foundations[f]))) { tryFoundation(f); return; }
          }
        }
        clearSelect("No foundation fits that card yet.");
        return;
      }
      if (sel) { tryTableau(col); return; }
      select("tableau", col, index);
      state.message = "Selected — now tap a column or foundation.";
      checkpoint();
      render();
    }

    function tapWaste() {
      var top = topOf(state.waste);
      if (!top) { state.message = "Waste is empty — draw from the stock."; checkpoint(); render(); return; }
      var sel = state.selected;
      if (sel && sel.from === "waste") {
        for (var f = 0; f < 4; f++) {
          if (canPlaceOnFoundation(top, topOf(state.foundations[f]))) { tryFoundation(f); return; }
        }
        clearSelect("No foundation fits that card yet.");
        return;
      }
      if (sel) { clearSelect("Selection moved to the waste card."); }
      select("waste", -1, state.waste.length - 1);
    }

    function autoFinish() {
      if (state.stock.length || state.waste.length || !allTableauUp(state.tableau)) {
        state.message = "Auto-finish unlocks when the stock and waste are empty and every tableau card is face up.";
        checkpoint();
        render();
        return;
      }
      var guard = 0;
      var movedAny = true;
      while (movedAny && guard < 200) {
        movedAny = false;
        guard += 1;
        for (var c = 0; c < 7; c++) {
          var top = topOf(state.tableau[c]);
          if (!top) continue;
          for (var f = 0; f < 4; f++) {
            if (canPlaceOnFoundation(top, topOf(state.foundations[f]))) {
              state.tableau[c].pop();
              state.foundations[f].push(top);
              state.moves += 1;
              addScore(SCORE.toFoundation);
              movedAny = true;
              break;
            }
          }
        }
      }
      engine.action("solitaire-autofinish", "foundations " + foundationCount(state.foundations));
      state.message = "Auto-finish played every available card.";
      afterMove();
    }

    function afterMove() {
      checkpoint();
      if (foundationCount(state.foundations) === 52) { finish(true); return; }
      if (!solitaireHasMove(state)) { finish(false); return; }
      render();
    }

    function finish(won) {
      state.phase = "over";
      var bonus = won ? Math.max(0, SCORE.winBonusBase - state.moves * SCORE.winBonusPerMove) : 0;
      var total = state.score + bonus;
      engine.score(total);
      checkpoint();
      render();
      ui.finish({
        outcome: won ? "win" : "draw",
        score: total,
        meta: { boardPoints: total, competitionMode: "free", moves: state.moves, foundations: foundationCount(state.foundations) },
        lines: won ? [
          "All four suits stacked in " + state.moves + " moves · win bonus +" + bonus,
          "Free performance only — no Paragon Coins moved"
        ] : [
          "No legal moves left — an honest stalemate after " + state.moves + " moves",
          foundationCount(state.foundations) + " of 52 cards reached the foundations",
          "Free performance only — no Paragon Coins moved"
        ],
        actions: [
          { label: "New deal", primary: true, onClick: function () { restart(); } },
          { label: "Other modes", onClick: function () { global.location.href = "index.html"; } },
          { label: "Leaderboard", onClick: function () { global.location.href = "index.html#leaderboard"; } }
        ]
      });
    }

    function restart() {
      try { global.ParagonGames.clearResume("cards", "solitaire", "free"); } catch (error) { /* noop */ }
      global.location.href = "play.html?v=solitaire";
    }

    function finishReady() {
      return !state.stock.length && !state.waste.length && allTableauUp(state.tableau) &&
        foundationCount(state.foundations) < 52;
    }

    function render() {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      ui.setStat("score", state.score);
      ui.setStat("moves", state.moves);
      ui.setStat("foundations", foundationCount(state.foundations) + "/52");
      ui.setMeta("Foundation +10 · waste to tableau +5 · tableau move +3 · flip +5 · recycle −20. Points are not Paragon Coins.");

      var sel = state.selected;
      function pileHtml(pile, kind, col) {
        if (!pile.length) {
          return '<button type="button" class="solitaire-slot is-empty" data-' + kind + '="' + col + '" aria-label="Empty ' + kind + '">' +
            (kind === "foundation" ? "A" : kind === "tableau" ? "K" : "·") + "</button>";
        }
        if (kind === "waste" || kind === "foundation") {
          var face = cardFace(topOf(pile), (sel && sel.from === kind && (kind !== "tableau" || sel.col === col) ? " is-selected" : ""), kind);
          return '<button type="button" class="solitaire-slot" data-' + kind + '="' + col + '">' + face + "</button>";
        }
        return "";
      }

      var tableauHtml = "";
      for (var c = 0; c < 7; c++) {
        var column = state.tableau[c] || [];
        var cards = "";
        if (!column.length) {
          cards = '<button type="button" class="solitaire-slot is-empty" data-tableau="' + c + '" aria-label="Empty column — Kings start here">K</button>';
        } else {
          for (var i = 0; i < column.length; i++) {
            var isSel = !!(sel && sel.from === "tableau" && sel.col === c && i >= sel.index);
            cards += '<button type="button" class="solitaire-slot is-stacked" data-tcard="' + c + ":" + i + '" aria-label="Column ' + (c + 1) + " card " + (i + 1) + '">' +
              cardFace(column[i], (column[i].up ? "" : " is-down") + (isSel ? " is-selected" : ""), "") + "</button>";
          }
        }
        tableauHtml += '<div class="solitaire-column" role="group" aria-label="Column ' + (c + 1) + '">' + cards + "</div>";
      }

      var foundationsHtml = "";
      for (var f = 0; f < 4; f++) foundationsHtml += pileHtml(state.foundations[f], "foundation", f);

      stage.innerHTML = '<div class="solitaire-table">' +
        '<p class="solitaire-message">' + esc(state.message) + "</p>" +
        '<div class="solitaire-top">' +
          '<button type="button" class="solitaire-slot ' + (state.stock.length ? "" : "is-empty") + '" data-stock="1" aria-label="Stock, ' + state.stock.length + ' cards left">' +
            (state.stock.length ? '<span class="solitaire-back">◈<small>' + state.stock.length + "</small></span>" : "<span>↺</span>") + "</button>" +
          pileHtml(state.waste, "waste", 0) +
          '<div class="solitaire-foundations">' + foundationsHtml + "</div>" +
        "</div>" +
        '<div class="solitaire-columns">' + tableauHtml + "</div>" +
        (finishReady() ? '<button type="button" class="gk-btn gk-btn-primary" data-autofinish="1">Auto-finish to the foundations</button>' : "") +
        '<p class="solitaire-legend">Tap the stock to draw · tap a card, then tap where it goes · tap a selected card again to send it up · unlimited recycles at −20.</p>' +
        "</div>";

      var stockBtn = stage.querySelector("[data-stock]");
      if (stockBtn) stockBtn.addEventListener("click", drawStock);
      stage.querySelectorAll("[data-waste]").forEach(function (button) {
        button.addEventListener("click", tapWaste);
      });
      stage.querySelectorAll("[data-foundation]").forEach(function (button) {
        button.addEventListener("click", function () { tryFoundation(Number(button.getAttribute("data-foundation"))); });
      });
      stage.querySelectorAll("[data-tableau]").forEach(function (button) {
        button.addEventListener("click", function () { tryTableau(Number(button.getAttribute("data-tableau"))); });
      });
      stage.querySelectorAll("[data-tcard]").forEach(function (button) {
        button.addEventListener("click", function () {
          var parts = String(button.getAttribute("data-tcard")).split(":");
          tapTableauCard(Number(parts[0]), Number(parts[1]));
        });
      });
      var auto = stage.querySelector("[data-autofinish]");
      if (auto) auto.addEventListener("click", autoFinish);
    }

    checkpoint();
    render();
  }

  global.ParagonCardsSolitaire = {
    SCORE: SCORE,
    canPlaceOnTableau: canPlaceOnTableau,
    canPlaceOnFoundation: canPlaceOnFoundation,
    movingStackValid: movingStackValid,
    recycleOrder: recycleOrder,
    solitaireHasMove: solitaireHasMove,
    foundationCount: foundationCount,
    play: play
  };
})(typeof window !== "undefined" ? window : globalThis);
