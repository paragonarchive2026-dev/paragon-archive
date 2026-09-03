/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: site-kit.js
  EXPECTED PROJECT PATH: /sites/_shared/site-kit.js
  ROLE: Shared helpers for in-project product sites — theme, storage, escape, toast panel.
  RESTORE-LOAD NOTE: Loaded before each site's app.js.
*/
(function (global) {
  "use strict";

  function storageGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function applyTheme() {
    try {
      const mode = localStorage.getItem("paragonSiteThemeMode") || "auto";
      let dark = true;
      if (mode === "light") dark = false;
      else if (mode === "dark") dark = true;
      else {
        const hour = new Date().getHours();
        dark = !(hour >= 6 && hour < 18);
      }
      document.documentElement.classList.toggle("light", !dark);
      document.documentElement.dataset.themeMode = mode;
    } catch (error) {
      /* ignore */
    }
  }

  function toggleTheme() {
    const isLight = document.documentElement.classList.contains("light");
    localStorage.setItem("paragonSiteThemeMode", isLight ? "dark" : "light");
    applyTheme();
  }

  function showPanel(el, message, kind) {
    if (!el) return;
    el.textContent = message;
    el.className = "notice " + (kind || "");
    el.hidden = false;
  }

  function downloadText(filename, text, mime) {
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function money(n, currency) {
    const num = Number(n) || 0;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 2
      }).format(num);
    } catch (error) {
      return (currency || "USD") + " " + num.toFixed(2);
    }
  }

  applyTheme();

  global.ParagonSiteKit = {
    storageGet: storageGet,
    storageSet: storageSet,
    escapeHTML: escapeHTML,
    uid: uid,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    showPanel: showPanel,
    downloadText: downloadText,
    money: money
  };
})(typeof window !== "undefined" ? window : globalThis);
