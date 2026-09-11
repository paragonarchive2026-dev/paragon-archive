/*
  PARAGON ARCHIVE — HEAVEN-09 micro-interactions
  1. press ripple of light on divine buttons/chips (pointer-accurate)
  2. star-spark on hover for category tiles & pills
  Progressive enhancement: skipped for reduced-motion; sparks need hover.
*/
(function () {
  "use strict";
  if (typeof document === "undefined") return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  /* --- ripple of light on press --- */
  document.addEventListener("pointerdown", function (e) {
    var t = e.target && e.target.closest ? e.target.closest(".primary-action, .gk-btn-primary, .open-btn, .chip") : null;
    if (!t) return;
    var rect = t.getBoundingClientRect();
    var s = document.createElement("span");
    s.className = "heaven-ripple";
    s.style.left = (e.clientX - rect.left) + "px";
    s.style.top = (e.clientY - rect.top) + "px";
    t.appendChild(s);
    s.addEventListener("animationend", function () { s.remove(); });
  }, { passive: true });

  /* --- star-spark on hover (hover-capable devices only) --- */
  if (!(window.matchMedia && window.matchMedia("(hover: hover)").matches)) return;
  document.addEventListener("pointerover", function (e) {
    var t = e.target && e.target.closest ? e.target.closest(".cat-chip, .see-all-pill, .hub-quick-card, .category-full-chip") : null;
    if (!t || t.dataset.sparked) return;
    t.dataset.sparked = "1";
    window.setTimeout(function () { delete t.dataset.sparked; }, 900);
    for (var i = 0; i < 3; i++) {
      var s = document.createElement("span");
      s.className = "heaven-spark";
      s.style.left = (12 + Math.random() * 76) + "%";
      s.style.top = (18 + Math.random() * 50) + "%";
      s.style.animationDelay = (i * 90) + "ms";
      t.appendChild(s);
      s.addEventListener("animationend", function () { this.remove(); });
    }
  }, { passive: true });
})();
