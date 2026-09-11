/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: home.js
  EXPECTED PROJECT PATH: /games/arcade/js/home.js
  ROLE: Paragon Arcade home page counters (P-009 honest: every counter starts at REAL ZERO and
        only ever shows cabinets you actually played on this device) plus the per-cabinet best
        line and the shared in-game performance leaderboard.
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

    var summary = kit ? kit.summary("arcade") : null;
    setText("statPlays", summary ? summary.plays : 0);
    setText("statWins", summary ? summary.wins : 0);
    setText("statStreak", summary ? summary.bestStreak : 0);

    /* One honest best per cabinet — each score is that cabinet's own points. */
    var cabinets = [
      { variant: "reflex", node: "bestReflex" },
      { variant: "memory", node: "bestMemory" },
      { variant: "timing", node: "bestTiming" },
      { variant: "sequence", node: "bestSequence" },
      { variant: "targets", node: "bestTargets" }
    ];
    cabinets.forEach(function (cabinet) {
      var best = games.best("arcade", cabinet.variant, "free");
      setText(cabinet.node, "Best: " + (best ? Number(best.score || 0) : 0) + " pts" +
        (best && best.outcome ? " (" + best.outcome + ")" : ""));
    });

    if (!summary || !summary.plays) setText("statPlays", "0");
    if (kit && typeof kit.mountLeaderboard === "function") {
      kit.mountLeaderboard({ host: "#game-leaderboard", gameKey: "arcade" });
    }
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
