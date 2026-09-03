/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: session.js
  EXPECTED PROJECT PATH: /team/session.js
  ROLE: Reusable Paragon Team idle-session guard — 29-minute idle warning modal with 60-second logout countdown.
  RESTORE/LOAD NOTE: Include on every /team/ page after its page script. Any click fully resets the 30-minute timer.
    Durations are overridable via window.PARAGON_SESSION_CONFIG = { idleMs, warnMs } for testing.
*/

(function () {
  "use strict";

  var config = window.PARAGON_SESSION_CONFIG || {};
  /* P-067 — REAL Settings integration: the Super Admin Settings page stores
     sessionIdleMinutes / sessionWarnSeconds in paragonTeamSettings.v1 and this
     guard honours them (test override via PARAGON_SESSION_CONFIG still wins). */
  var stored = {};
  try { stored = JSON.parse(window.localStorage.getItem("paragonTeamSettings.v1") || "null") || {}; } catch (error) { stored = {}; }
  var IDLE_MS = Number(config.idleMs) || (Number(stored.sessionIdleMinutes) > 0 ? Number(stored.sessionIdleMinutes) * 60 * 1000 : 0) || 29 * 60 * 1000;   // warning appears at 29 minutes idle by default
  var WARN_MS = Number(config.warnMs) || (Number(stored.sessionWarnSeconds) > 0 ? Number(stored.sessionWarnSeconds) * 1000 : 0) || 60 * 1000;             // 60-second countdown by default
  var LOGIN_URL = "login.html";

  var idleHandle = null;
  var countdownHandle = null;
  var warningOpen = false;

  function element(id) { return document.getElementById(id); }

  function buildModal() {
    if (element("session-timeout-overlay")) return;
    var overlay = document.createElement("div");
    overlay.id = "session-timeout-overlay";
    overlay.className = "session-timeout-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="session-timeout-modal" role="alertdialog" aria-modal="true" aria-labelledby="session-timeout-title" aria-describedby="session-timeout-desc">' +
        '<div class="session-timeout-icon" aria-hidden="true">⚠️</div>' +
        '<h2 id="session-timeout-title">Your Session Is About to Expire</h2>' +
        '<p id="session-timeout-desc">You have been inactive for ' + Math.round(IDLE_MS / 60000) + ' minutes.<br>You will be automatically logged out in:</p>' +
        '<div class="session-countdown-box"><strong id="session-countdown-value">60</strong><span>seconds</span></div>' +
        '<p class="session-timeout-note">Any unsaved work may be lost.</p>' +
        '<div class="session-timeout-actions">' +
          '<button type="button" id="session-stay-btn" class="primary-action">Stay Logged In</button>' +
          '<button type="button" id="session-logout-btn" class="secondary-action">Log Out Now</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    element("session-stay-btn").addEventListener("click", stayLoggedIn);
    element("session-logout-btn").addEventListener("click", logoutNow);
  }

  function showWarning() {
    buildModal();
    warningOpen = true;
    var overlay = element("session-timeout-overlay");
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    var secondsLeft = Math.round(WARN_MS / 1000);
    element("session-countdown-value").textContent = String(secondsLeft);
    element("session-stay-btn").focus();
    countdownHandle = window.setInterval(function () {
      secondsLeft -= 1;
      var value = element("session-countdown-value");
      if (value) value.textContent = String(Math.max(0, secondsLeft));
      if (secondsLeft <= 0) logoutNow();
    }, 1000);
  }

  function hideWarning() {
    warningOpen = false;
    if (countdownHandle) { window.clearInterval(countdownHandle); countdownHandle = null; }
    var overlay = element("session-timeout-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
    }
  }

  function stayLoggedIn() {
    hideWarning();
    resetIdleTimer();
  }

  function logoutNow() {
    hideWarning();
    if (idleHandle) { window.clearTimeout(idleHandle); idleHandle = null; }
    window.location.href = LOGIN_URL + "?timeout=1";
  }

  function resetIdleTimer() {
    if (idleHandle) window.clearTimeout(idleHandle);
    idleHandle = window.setTimeout(showWarning, IDLE_MS);
  }

  function activityReset(event) {
    // Any click anywhere fully resets the 30-minute timer — but interacting with the
    // warning modal itself must not silently dismiss it; its buttons decide.
    if (warningOpen) {
      var overlay = element("session-timeout-overlay");
      if (overlay && overlay.contains(event.target)) return;
      stayLoggedIn();
      return;
    }
    resetIdleTimer();
  }

  document.addEventListener("click", activityReset, true);
  document.addEventListener("keydown", activityReset, true);
  document.addEventListener("DOMContentLoaded", resetIdleTimer);
  if (document.readyState !== "loading") resetIdleTimer();

  window.ParagonTeamSession = {
    IDLE_MS: IDLE_MS,
    WARN_MS: WARN_MS,
    showWarning: showWarning,
    stayLoggedIn: stayLoggedIn,
    logoutNow: logoutNow,
    resetIdleTimer: resetIdleTimer,
    isWarningOpen: function () { return warningOpen; }
  };
})();
