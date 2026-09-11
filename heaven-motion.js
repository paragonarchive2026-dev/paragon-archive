/*
  PARAGON ARCHIVE — HEAVEN-06 motion layer
  REAL FILE NAME: heaven-motion.js
  ROLE: scroll-reveal glow + entrance bloom for the heavenly design system.
        Progressive enhancement only: without JS, without IntersectionObserver,
        or with prefers-reduced-motion, content is simply fully visible.
*/
(function () {
  "use strict";
  if (typeof window === "undefined") return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  var SELECTOR = [
    "#hero-section",
    "#tab-websites section",
    ".updates-header",
    ".timeline-entry",
    ".account-hero",
    ".account-section",
    ".stat-box",
    ".review-card",
    ".board-post",
    ".hub-section-heading",
    ".hub-quick-card",
    ".hub-doc-card",
    ".hub-stat-box"
  ].join(", ");

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add("is-revealed");
      io.unobserve(el);
      /* hand the element back to its base transitions once the bloom ends */
      window.setTimeout(function () {
        el.classList.remove("heaven-rise", "is-revealed");
      }, 1700);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function enlist(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.matches && node.matches(SELECTOR) && !node.classList.contains("heaven-rise")) {
      node.classList.add("heaven-rise");
      io.observe(node);
    }
    if (node.querySelectorAll) {
      node.querySelectorAll(SELECTOR).forEach(function (el) {
        if (el.classList.contains("heaven-rise")) return;
        el.classList.add("heaven-rise");
        io.observe(el);
      });
    }
  }

  function start() {
    enlist(document.body);
    if (!("MutationObserver" in window)) return;
    var mo = new MutationObserver(function (records) {
      records.forEach(function (record) {
        record.addedNodes.forEach(enlist);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
