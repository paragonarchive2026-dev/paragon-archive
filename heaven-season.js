/*
  PARAGON ARCHIVE — HEAVEN-09 seasonal sky
  Sets <html data-season="rain" | "harmattan" | ""> from the local date:
    rain      May–Oct  (rain-season aurora: lush aqua/green ribbons)
    harmattan Nov–Feb  (harmattan gold: amber haze, dimmer stars)
    (default) Mar–Apr  (the classic heaven)
  Pure attribute flip — all visuals live in CSS. No-JS users get default.
*/
(function () {
  "use strict";
  if (typeof document === "undefined") return;
  var m = new Date().getMonth(); /* 0 = Jan */
  var season = (m >= 4 && m <= 9) ? "rain" : (m >= 10 || m <= 1) ? "harmattan" : "";
  if (season) document.documentElement.setAttribute("data-season", season);
})();
