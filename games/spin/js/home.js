/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: home.js
  EXPECTED PROJECT PATH: /games/spin/js/home.js
  ROLE: Paragon Spin home counters and honest in-game performance leaderboard. Every number
        comes from completed local sessions or a verified production adapter; no sample users.
  RESTORE-LOAD NOTE: Load after manifest.js, engine.js and game-kit.js on Spin index.html.
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
    var row = kit.summary("spin");
    var best = games.best("spin", "wheel-duel", "free");
    text("spinPlays", row ? row.plays : 0);
    text("spinBest", best ? Number(best.score || 0) : 0);
    text("spinStreak", row ? row.bestStreak : 0);
    kit.mountLeaderboard({ host: "#game-leaderboard", gameKey: "spin" });
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
