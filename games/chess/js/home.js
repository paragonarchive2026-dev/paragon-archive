/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: home.js
  EXPECTED PROJECT PATH: /games/chess/js/home.js
  ROLE: Paragon Chess club counters and honest game-specific performance leaderboard. Values
        are actual completed local sessions or verified adapter rows—never seeded demo people.
  RESTORE-LOAD NOTE: Load after manifest.js, engine.js and game-kit.js on Chess index.html.
*/
(function (global) {
  "use strict";
  var doc = global.document;

  function text(id, value) {
    var node = doc.getElementById(id);
    if (node) node.textContent = String(value);
  }

  function boot() {
    var games = global.ParagonGames;
    var kit = global.ParagonGameKit;
    if (!games || !kit) return;
    var row = kit.summary("chess");
    var best = games.best("chess", "computer", "free");
    text("chessPlays", row ? row.plays : 0);
    text("chessWins", row ? row.wins : 0);
    text("chessBest", best ? Number(best.score || 0) : 0);
    text("chessStreak", row ? row.bestStreak : 0);
    kit.mountLeaderboard({ host: "#game-leaderboard", gameKey: "chess" });
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
