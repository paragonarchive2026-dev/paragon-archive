/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: home.js
  EXPECTED PROJECT PATH: /games/cards/js/home.js
  ROLE: Paragon Cards home page counters (P-009 honest: every counter starts at REAL ZERO and
        only ever shows games you actually played on this device) plus the per-mode best line.
  RESTORE-LOAD NOTE: Load after games/engine.js and games/_shared/game-kit.js on index.html.
*/
(function (global) {
  "use strict";

  var doc = global.document;

  function setText(id, value) {
    var node = doc.getElementById(id);
    if (node) node.textContent = String(value);
  }

  function boot() {
    var games = global.ParagonGames;
    var kit = global.ParagonGameKit;
    if (!games) return;

    var summary = kit ? kit.summary("cards") : null;
    var stats = games.stats("cards");

    /* Higher·Lower scores points and Blackjack counts play chips, so the hero never
       mixes the two units — each mode reports its own best. */
    var hl = games.best("cards", "higher-lower", "free");
    var bj = games.best("cards", "blackjack", "free");

    setText("statPlays", summary ? summary.plays : 0);
    setText("statBest", hl ? Number(hl.score || 0) : 0);
    setText("statStreak", summary ? summary.bestStreak : 0);
    setText("bestHigher", "Best: " + (hl ? Number(hl.score || 0) : 0) + " pts" + (hl && hl.outcome ? " (" + hl.outcome + ")" : ""));
    setText("bestBlackjack", "Best: " + (bj ? Number(bj.score || 0) : 0) + " chips" + (bj && bj.outcome ? " (" + bj.outcome + ")" : ""));

    /* Nothing is invented: an unplayed device shows zero everywhere. */
    if (!summary || !summary.plays) setText("statPlays", "0");
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
