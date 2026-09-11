/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: cards.js
  EXPECTED PROJECT PATH: /games/cards/js/cards.js
  ROLE: Paragon Cards game logic + rendering. Two rule sets, one deck:
        "higher-lower" — you and the house call the same card (head-to-head, luck shared)
        "blackjack"    — beat the dealer to 21 with play chips that are NOT Paragon Coins.
        This file owns rules and drawing ONLY. Sessions, scoring, bests, resume, the
        stake gate and the audit trail all belong to games/engine.js — never re-implemented here.
  PLATFORM LAWS: every random draw goes through session.random() (seeded, replayable);
        no window.alert/prompt/confirm; free play never touches coins; play chips are
        labelled as play chips everywhere they appear.
  RESTORE-LOAD NOTE: Load after site-kit.js, games/manifest.js, games/engine.js and
        games/_shared/game-kit.js on play.html only.
*/
(function (global) {
  "use strict";

  var doc = global.document;
  var kit = global.ParagonGameKit;
  var games = global.ParagonGames;

  var SUITS = [
    { key: "s", symbol: "♠", red: false },
    { key: "h", symbol: "♥", red: true },
    { key: "d", symbol: "♦", red: true },
    { key: "c", symbol: "♣", red: false }
  ];
  var RANKS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ------------------------------------------------------------------ deck (seeded, never Math.random) */
  function buildShoe(decks, random) {
    var list = [];
    var count = Math.max(1, Number(decks) || 1);
    for (var d = 0; d < count; d++) {
      for (var s = 0; s < SUITS.length; s++) {
        for (var r = 1; r <= 13; r++) list.push({ r: r, s: SUITS[s].key });
      }
    }
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var swap = list[i]; list[i] = list[j]; list[j] = swap;
    }
    return list;
  }

  function suitOf(key) {
    var found = SUITS[0];
    SUITS.forEach(function (s) { if (s.key === key) found = s; });
    return found;
  }

  function cardHtml(card, faceDown) {
    if (faceDown || !card) {
      return '<div class="pcard pcard-back" aria-label="Face-down card"><span class="pcard-mark">🂠</span></div>';
    }
    var suit = suitOf(card.s);
    var label = RANKS[card.r] || String(card.r);
    return '<div class="pcard' + (suit.red ? " pcard-red" : "") + '" aria-label="' + esc(label + " of " + suit.symbol) + '">' +
      '<span class="pcard-corner pcard-tl">' + esc(label) + "<br>" + esc(suit.symbol) + "</span>" +
      '<span class="pcard-pip">' + esc(suit.symbol) + "</span>" +
      '<span class="pcard-corner pcard-br">' + esc(label) + "<br>" + esc(suit.symbol) + "</span>" +
      "</div>";
  }

  function handValue(cards) {
    var total = 0;
    var aces = 0;
    (cards || []).forEach(function (card) {
      if (card.r === 1) { aces += 1; total += 11; }
      else if (card.r >= 10) total += 10;
      else total += card.r;
    });
    while (total > 21 && aces > 0) { total -= 10; aces -= 1; }
    return total;
  }

  function isBlackjack(cards) {
    return (cards || []).length === 2 && handValue(cards) === 21;
  }

  /* Pure settlement for ONE blackjack hand (exported for tests). The bet is never taken
     out of the bankroll in advance — it is applied exactly once, here: +bet on a win,
     +1.5 × bet on a natural, −bet on a loss, unchanged on a push. A doubled hand simply
     carries a doubled bet, so it wins or loses exactly twice the original stake, and the
     note printed to the player always states the real number of chips that moved. */
  function settleHand(hand) {
    var player = Array.isArray(hand && hand.player) ? hand.player : [];
    var dealer = Array.isArray(hand && hand.dealer) ? hand.dealer : [];
    var bet = Math.max(0, Math.round(Number(hand && hand.bet) || 0));
    var chips = Math.round(Number(hand && hand.chips) || 0);
    var playerTotal = handValue(player);
    var dealerTotal = handValue(dealer);
    var playerBJ = isBlackjack(player);
    var dealerBJ = isBlackjack(dealer);
    var delta = 0;
    var result = "push";
    var note = "";

    if (playerTotal > 21) {
      delta = -bet; result = "loss"; note = "You went over 21 — " + bet + " chips lost.";
    } else if (playerBJ && !dealerBJ) {
      delta = Math.round(bet * 1.5); result = "win"; note = "Blackjack! 3:2 pays " + delta + " chips.";
    } else if (dealerBJ && !playerBJ) {
      delta = -bet; result = "loss"; note = "Dealer blackjack — " + bet + " chips lost.";
    } else if (playerBJ && dealerBJ) {
      delta = 0; result = "push"; note = "Both blackjack — a push, your bet is returned.";
    } else if (dealerTotal > 21) {
      delta = bet; result = "win"; note = "Dealer busts — you win " + bet + " chips.";
    } else if (playerTotal > dealerTotal) {
      delta = bet; result = "win"; note = "You win " + bet + " chips.";
    } else if (playerTotal < dealerTotal) {
      delta = -bet; result = "loss"; note = "Dealer wins — " + bet + " chips lost.";
    } else {
      delta = 0; result = "push"; note = "Push — your bet is returned.";
    }

    return { chips: chips + delta, delta: delta, result: result, note: note, playerTotal: playerTotal, dealerTotal: dealerTotal };
  }

  /* Doubling is only offered when the bankroll can cover the DOUBLED bet — the original
     bet is still in the bankroll (nothing is deducted at deal time), so the honest test
     is chips >= 2 × bet, not chips >= bet. */
  function canDoubleDown(state) {
    return !!state && state.phase === "player" &&
      Array.isArray(state.player) && state.player.length === 2 &&
      Number(state.chips) >= Number(state.bet) * 2;
  }

  /* The house's rule for Higher·Lower — a fixed, published policy, not a hidden advantage:
     low card → call higher, high card → call lower, the middle rank (7) is a coin flip
     taken from the seeded RNG so the whole game stays replayable. */
  function houseCallFor(rank, rng) {
    if (rank <= 6) return "higher";
    if (rank >= 8) return "lower";
    return rng() < 0.5 ? "higher" : "lower";
  }

  /* Pure scoring for one Higher·Lower call (exported for tests). */
  function scoreCall(call, up, next, streak, best) {
    if (!next || !up) return { points: 0, kind: "push", streak: streak, best: best };
    if (next.r === up.r) return { points: 0, kind: "push", streak: streak, best: best };
    var won = (next.r > up.r && call === "higher") || (next.r < up.r && call === "lower");
    if (!won) return { points: 0, kind: "wrong", streak: 0, best: best };
    var streakNow = (Number(streak) || 0) + 1;
    return { points: 10 * Math.min(5, streakNow), kind: "correct", streak: streakNow, best: Math.max(Number(best) || 0, streakNow) };
  }

  /* ================================================================== VARIANT 1 — HIGHER · LOWER */
  function HigherLower(engine, ui, savedState) {
    var TOTAL_ROUNDS = 10;
    var state = null;

    function fresh() {
      return {
        round: 1,
        totalRounds: TOTAL_ROUNDS,
        up: null,
        next: null,
        myStreak: 0,
        houseStreak: 0,
        myScore: 0,
        houseScore: 0,
        myBestStreak: 0,
        phase: "guess",
        lastCall: "",
        houseCall: "",
        lastResult: "",
        revealed: false
      };
    }

    function drawCard() {
      return { r: engine.int(13) + 1, s: SUITS[engine.int(SUITS.length)].key };
    }

    function houseCall(up) {
      if (!up) return "higher";
      return houseCallFor(up.r, function () { return engine.next(); });
    }

    function startFrom(saved) {
      state = (saved && saved.round && saved.totalRounds === TOTAL_ROUNDS) ? saved : fresh();
      if (!state.up) { state.up = drawCard(); state.next = drawCard(); }
      if (state.totalRounds !== TOTAL_ROUNDS) state.totalRounds = TOTAL_ROUNDS;
      render();
    }

    function guess(call) {
      if (!state || state.phase !== "guess") return;
      state.lastCall = call;
      state.houseCall = houseCall(state.up);

      var mine = scoreCall(call, state.up, state.next, state.myStreak, state.myBestStreak);
      var theirs = scoreCall(state.houseCall, state.up, state.next, state.houseStreak, 0);

      state.myScore += mine.points;
      state.myStreak = mine.streak;
      state.myBestStreak = mine.best;
      state.houseScore += theirs.points;
      state.houseStreak = theirs.streak;

      state.lastResult = (state.next.r === state.up.r) ? "push" : (mine.kind === "correct" ? "correct" : "wrong");
      state.phase = "reveal";
      state.revealed = true;

      engine.action("call:" + call, "r" + state.round + ":up" + state.up.r + ":next" + state.next.r);
      engine.score(state.myScore);
      engine.checkpoint(state);
      render();
    }

    function nextRound() {
      if (!state || state.phase !== "reveal") return;
      if (state.round >= TOTAL_ROUNDS) { finish(); return; }
      state.round += 1;
      state.up = state.next;
      state.next = drawCard();
      state.phase = "guess";
      state.revealed = false;
      state.lastResult = "";
      engine.checkpoint(state);
      render();
    }

    function finish() {
      var outcome = state.myScore > state.houseScore ? "win" : (state.myScore < state.houseScore ? "loss" : "draw");
      engine.score(state.myScore);
      /* Personal-best verdict comes from the engine inside ui.finish — never computed here. */
      ui.finish({
        outcome: outcome,
        score: state.myScore,
        meta: { boardPoints: state.myScore, competitionMode: "free", houseScore: state.houseScore },
        lines: [
          "You " + state.myScore + " · House " + state.houseScore,
          "Best streak this game: " + state.myBestStreak + " (" + Math.min(5, state.myBestStreak) + "x multiplier)",
          "Correct calls are worth 10 × your streak, capped at 5x. Equal ranks are a push."
        ],
        actions: [
          { label: "Play again", primary: true, onClick: function () { restart(); } },
          { label: "Other mode", onClick: function () { global.location.href = "play.html?v=blackjack"; } },
          { label: "Paragon Cards home", onClick: function () { global.location.href = "index.html"; } }
        ]
      });
    }

    function verdictLine() {
      if (!state.revealed) return "";
      if (state.lastResult === "push") return "Equal ranks — a push. Nobody scores, streaks are kept.";
      return state.lastResult === "correct"
        ? "Correct — the next card was " + (state.next.r > state.up.r ? "higher" : "lower") + "."
        : "Wrong — the next card was " + (state.next.r > state.up.r ? "higher" : "lower") + ".";
    }

    function render() {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      var guessOpen = state.phase === "guess";

      ui.setStat("score", state.myScore);
      ui.setStat("streak", state.myStreak + "×" + Math.min(5, Math.max(1, state.myStreak)));
      ui.setStat("house", state.houseScore);
      ui.setStat("round", state.round + "/" + TOTAL_ROUNDS);
      ui.setMeta("Round " + state.round + " of " + TOTAL_ROUNDS + " · both sides see the same card — only the call decides it.");

      stage.innerHTML =
        '<div class="hl-table">' +
          '<div class="hl-side">' +
            '<p class="hl-side-title">You</p>' +
            '<div class="hl-cards">' + cardHtml(state.up) + '<div class="hl-arrow">?</div>' + cardHtml(state.next, !state.revealed) + "</div>" +
            '<p class="hl-score">' + state.myScore + " pts</p>" +
          "</div>" +
          '<div class="hl-side hl-side-house">' +
            '<p class="hl-side-title">The house</p>' +
            '<p class="hl-call">' + (state.houseCall ? 'Called "' + esc(state.houseCall) + '"' : "Waiting for your call") + "</p>" +
            '<p class="hl-score">' + state.houseScore + " pts</p>" +
          "</div>" +
        "</div>" +
        '<p class="hl-verdict' + (state.lastResult === "wrong" ? " is-wrong" : state.lastResult === "correct" ? " is-right" : "") + '">' +
          esc(verdictLine() || "Is the next card higher or lower than " + (RANKS[state.up.r] || "") + (state.up ? suitOf(state.up.s).symbol : "") + "?") +
        "</p>" +
        '<div class="hl-controls">' +
          '<button type="button" class="gk-btn gk-btn-primary" data-act="higher"' + (guessOpen ? "" : " disabled") + ">▲ Higher</button>" +
          '<button type="button" class="gk-btn gk-btn-primary" data-act="lower"' + (guessOpen ? "" : " disabled") + ">▼ Lower</button>" +
          '<button type="button" class="gk-btn" data-act="next"' + (state.phase === "reveal" ? "" : " disabled") + ">" +
            (state.round >= TOTAL_ROUNDS ? "See result" : "Next card") + "</button>" +
        "</div>" +
        '<p class="hl-note">Aces are LOW in this game. Ten rounds, then the higher total wins.</p>';

      stage.querySelectorAll("[data-act]").forEach(function (button) {
        button.addEventListener("click", function () {
          var act = button.getAttribute("data-act");
          if (act === "higher") guess("higher");
          else if (act === "lower") guess("lower");
          else if (act === "next") nextRound();
        });
      });
    }

    startFrom(savedState);
    return { render: render };
  }

  /* ================================================================== VARIANT 2 — BLACKJACK 21 */
  function Blackjack(engine, ui, savedState) {
    var START_CHIPS = 100;
    var GOAL_CHIPS = 200;
    var DECKS = 6;
    var RESHUFFLE_AT = 78; /* reshuffle a six-deck shoe when fewer than 78 cards remain */
    var state = null;

    function fresh() {
      return {
        chips: START_CHIPS,
        bet: 10,
        baseBet: 0,
        shoe: [],
        index: 0,
        player: [],
        dealer: [],
        hideDealer: true,
        phase: "bet",
        message: "Place your bet to deal a hand.",
        result: "",
        hands: 0
      };
    }

    function shuffle() {
      state.shoe = buildShoe(DECKS, function () { return engine.next(); });
      state.index = 0;
      engine.action("shuffle", DECKS + "-deck shoe");
    }

    function draw() {
      if (!state.shoe.length || state.shoe.length - state.index < RESHUFFLE_AT) shuffle();
      return state.shoe[state.index++];
    }

    function startFrom(saved) {
      state = (saved && saved.chips != null && Array.isArray(saved.shoe)) ? saved : fresh();
      if (!state.shoe.length) shuffle();
      if (state.phase === "player" || state.phase === "dealer") state.hideDealer = true;
      render();
    }

    function deal() {
      if (!state || state.phase !== "bet") return;
      if (state.bet > state.chips) state.bet = state.chips;
      state.player = [draw(), draw()];
      state.dealer = [draw(), draw()];
      state.hideDealer = true;
      state.phase = "player";
      state.result = "";
      state.hands += 1;
      state.message = "Your move — hit, stand or double down.";
      engine.action("deal", "bet " + state.bet);
      engine.checkpoint(state);

      if (isBlackjack(state.player)) { stand(true); return; }
      render();
    }

    function hit() {
      if (!state || state.phase !== "player") return;
      state.player.push(draw());
      engine.action("hit", handValue(state.player));
      if (handValue(state.player) > 21) {
        state.hideDealer = false;
        settle("bust");
        return;
      }
      if (handValue(state.player) === 21) { stand(); return; }
      engine.checkpoint(state);
      render();
    }

    function doubleDown() {
      if (!state || state.phase !== "player" || state.player.length !== 2) return;
      if (!canDoubleDown(state)) { state.message = "Not enough play chips to double — you need " + (state.bet * 2) + " to cover a doubled bet."; render(); return; }
      /* The bet is NOT taken from the bankroll here: settleHand() applies the doubled bet
         exactly once at the end of the hand (the bug this replaces charged it twice). */
      state.baseBet = state.bet;
      state.bet = state.bet * 2;
      state.player.push(draw());
      engine.action("double", "bet " + state.bet);
      if (handValue(state.player) > 21) { state.hideDealer = false; settle("bust"); return; }
      stand();
    }

    function stand(fromBlackjack) {
      if (!state || state.phase !== "player") return;
      state.hideDealer = false;
      state.phase = "dealer";
      engine.action(fromBlackjack ? "blackjack" : "stand", handValue(state.player));

      /* Dealer draws to 17 and then stands — including on a soft 17. */
      while (handValue(state.dealer) < 17) {
        state.dealer.push(draw());
        engine.action("dealer-draw", handValue(state.dealer));
      }
      settle("");
    }

    function settle(forced) {
      /* One settlement path for every ending (bust, natural, dealer bust, compare, push):
         the pure settleHand() moves the bet exactly once, so a doubled hand can never be
         charged twice and the note always matches the chips that actually moved. */
      var outcomeRow = settleHand({ player: state.player, dealer: state.dealer, bet: state.bet, chips: state.chips });
      state.chips = outcomeRow.chips;
      state.result = outcomeRow.result;
      state.message = outcomeRow.note;
      engine.action("settle", (forced === "bust" ? "bust " : "") + outcomeRow.result + " " + (outcomeRow.delta >= 0 ? "+" : "") + outcomeRow.delta + " chips " + state.chips);
      engine.checkpoint(state);

      if (state.chips >= GOAL_CHIPS || state.chips <= 0) {
        var outcome = state.chips >= GOAL_CHIPS ? "win" : "loss";
        state.phase = "over";
        engine.score(state.chips);
        engine.checkpoint(state);
        /* Paint the final hand + the true chip count BEHIND the overlay first, so the HUD
           never shows a stale bankroll under a result that says otherwise. */
        render();
        /* Personal-best verdict comes from the engine inside ui.finish — never computed here. */
        ui.finish({
          outcome: outcome,
          score: state.chips,
          meta: { boardPoints: state.chips, competitionMode: "free", hands: state.hands },
          lines: [
            (outcome === "win" ? "Shoe won — " : "Shoe over — ") + state.chips + " play chips after " + state.hands + " hands",
            "Target was " + GOAL_CHIPS + " play chips from a 100-chip start",
            "Play chips are not Paragon Coins. They cannot be bought, sold or withdrawn."
          ],
          actions: [
            { label: "New shoe", primary: true, onClick: function () { restart(); } },
            { label: "Other mode", onClick: function () { global.location.href = "play.html?v=higher-lower"; } },
            { label: "Paragon Cards home", onClick: function () { global.location.href = "index.html"; } }
          ]
        });
        return;
      }

      state.phase = "bet";
      state.player = [];
      state.dealer = [];
      state.hideDealer = true;
      /* A doubled bet belongs to the hand that doubled it — the next hand goes back to the
         chip the player actually chose (10/25/50), never silently to 20/50/100. */
      if (state.baseBet) { state.bet = state.baseBet; state.baseBet = 0; }
      /* Below the 10-chip minimum the only honest bet is everything you have left. */
      state.bet = Math.max(1, Math.min(state.bet, state.chips));
      if (state.chips < 10) state.message += " Under 10 chips left — the next hand is all in (" + state.chips + ").";
      engine.score(state.chips);
      render();
    }

    function render() {
      var stage = doc.getElementById("game-stage");
      if (!stage) return;
      var playerTotal = handValue(state.player);
      var dealerTotal = state.hideDealer ? handValue(state.dealer.slice(0, 1)) : handValue(state.dealer);
      var canDouble = canDoubleDown(state);

      ui.setStat("chips", state.chips);
      ui.setStat("bet", state.bet);
      ui.setStat("hand", playerTotal || "—");
      ui.setStat("dealer", state.hideDealer ? "?" : dealerTotal);
      ui.setMeta("Play chips are NOT Paragon Coins — they cannot be bought, sold or withdrawn. Reach " + GOAL_CHIPS + " to win the shoe.");

      var controls = "";
      if (state.phase === "bet") {
        controls =
          '<div class="bj-bets">' +
            [10, 25, 50].map(function (amount) {
              return '<button type="button" class="gk-btn' + (state.bet === amount ? " gk-btn-primary" : "") + '" data-bet="' + amount + '"' +
                (amount > state.chips ? " disabled" : "") + ">" + amount + "</button>";
            }).join("") +
            '<button type="button" class="gk-btn gk-btn-primary" data-act="deal">Deal</button>' +
          "</div>";
      } else if (state.phase === "player") {
        controls =
          '<div class="bj-bets">' +
            '<button type="button" class="gk-btn gk-btn-primary" data-act="hit">Hit</button>' +
            '<button type="button" class="gk-btn" data-act="stand">Stand</button>' +
            '<button type="button" class="gk-btn" data-act="double"' + (canDouble ? "" : " disabled") + ">Double</button>" +
          "</div>";
      }

      stage.innerHTML =
        '<p class="bj-message">' + esc(state.message) + "</p>" +
        '<div class="bj-table">' +
          '<div class="bj-hand">' +
            '<p class="bj-hand-title">Dealer ' + (state.hideDealer ? "" : "· " + dealerTotal) + "</p>" +
            '<div class="bj-cards">' +
              state.dealer.map(function (card, i) { return cardHtml(card, state.hideDealer && i === 1); }).join("") +
              (state.dealer.length ? "" : '<div class="pcard pcard-empty" aria-hidden="true"></div>') +
            "</div>" +
          "</div>" +
          '<div class="bj-hand">' +
            '<p class="bj-hand-title">You · ' + (playerTotal || 0) + (state.player.length ? " · bet " + state.bet : "") + "</p>" +
            '<div class="bj-cards">' +
              state.player.map(function (card) { return cardHtml(card); }).join("") +
              (state.player.length ? "" : '<div class="pcard pcard-empty" aria-hidden="true"></div>') +
            "</div>" +
          "</div>" +
        "</div>" +
        controls +
        '<p class="bj-legend">Dealer draws to 17 and stands (soft 17 included). Blackjack pays 3:2. Six-deck shoe, reshuffled below 78 cards.</p>';

      stage.querySelectorAll("[data-act]").forEach(function (button) {
        button.addEventListener("click", function () {
          var act = button.getAttribute("data-act");
          if (act === "deal") deal();
          else if (act === "hit") hit();
          else if (act === "stand") stand();
          else if (act === "double") doubleDown();
        });
      });
      stage.querySelectorAll("[data-bet]").forEach(function (button) {
        button.addEventListener("click", function () {
          state.bet = Number(button.getAttribute("data-bet")) || 10;
          engine.action("bet", state.bet);
          engine.checkpoint(state);
          render();
        });
      });
    }

    startFrom(savedState);
    return { render: render };
  }

  /* ================================================================== boot */
  function restart() {
    try { games.clearResume("cards", currentVariant, "free"); } catch (error) { /* noop */ }
    global.location.href = "play.html?v=" + encodeURIComponent(currentVariant);
  }

  var currentVariant = "higher-lower";

  function pickVariant() {
    var params = new URLSearchParams(global.location.search || "");
    var asked = String(params.get("v") || "").trim();
    var entry = games ? games.game("cards") : null;
    var known = entry && Array.isArray(entry.variants) ? entry.variants : [];
    var ok = known.some(function (v) { return v.key === asked; });
    return ok ? asked : "higher-lower";
  }

  function boot() {
    if (!doc.getElementById("game-stage")) return;
    if (!kit || !games) return;

    currentVariant = pickVariant();
    var STATS = {
      "higher-lower": [{ id: "score", label: "Score" }, { id: "streak", label: "Streak" }, { id: "house", label: "House" }, { id: "round", label: "Round" }],
      blackjack: [{ id: "chips", label: "Chips" }, { id: "bet", label: "Bet" }, { id: "hand", label: "Hand" }, { id: "dealer", label: "Dealer" }],
      solitaire: [{ id: "score", label: "Score" }, { id: "moves", label: "Moves" }, { id: "foundations", label: "Foundations" }],
      memory: [{ id: "score", label: "Score" }, { id: "moves", label: "Moves" }, { id: "pairs", label: "Pairs" }]
    };
    var NAMES = { "higher-lower": "Higher · Lower", blackjack: "Blackjack 21", solitaire: "Solitaire", memory: "Memory" };

    kit.mount({
      hud: "#game-hud",
      gameKey: "cards",
      variant: currentVariant,
      stats: STATS[currentVariant] || STATS["higher-lower"],
      onStart: function (engine, savedState, resumed, shell) {
        /* Wave 2 cabinets live in their own files; the shell degrades honestly if one
           failed to load instead of leaving a dead stage. */
        if (currentVariant === "blackjack") Blackjack(engine, shell, savedState);
        else if (currentVariant === "solitaire" && global.ParagonCardsSolitaire) global.ParagonCardsSolitaire.play(engine, shell, savedState);
        else if (currentVariant === "memory" && global.ParagonCardsMemory) global.ParagonCardsMemory.play(engine, shell, savedState);
        else if (currentVariant === "solitaire" || currentVariant === "memory") {
          shell.showPanel({
            title: "This cabinet did not load",
            body: "The " + currentVariant + " rules file is missing on this device. Go back and try again.",
            actions: [{ label: "Back to Paragon Cards", primary: true, onClick: function () { global.location.href = "index.html"; } }]
          });
        }
        else HigherLower(engine, shell, savedState);
      },
      onQuit: function () { global.location.href = "index.html"; }
    });

    var title = doc.getElementById("variant-title");
    if (title) {
      var row = games.variant("cards", currentVariant);
      title.textContent = row ? row.name : currentVariant;
    }
    doc.title = "Paragon Cards — " + (NAMES[currentVariant] || "Play");
  }

  /* The pure rules are exported so tests/suite-games.test.js can check them without a
     browser. Nothing here touches the DOM, storage, coins or the network. */
  global.ParagonCards = {
    SUITS: SUITS,
    RANKS: RANKS,
    buildShoe: buildShoe,
    handValue: handValue,
    isBlackjack: isBlackjack,
    settleHand: settleHand,
    canDoubleDown: canDoubleDown,
    houseCallFor: houseCallFor,
    scoreCall: scoreCall,
    cardHtml: cardHtml
  };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
