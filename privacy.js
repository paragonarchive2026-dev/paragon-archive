/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: privacy.js
  EXPECTED PROJECT PATH: /privacy.js
  ROLE: Cookie consent, privacy preferences, local data export, and privacy-controls UI.
  RESTORE/LOAD NOTE: Keep at project root. Load before app.js on the Archive and before archive-hub.js on paragon-archive-hub.html.
*/

(() => {
  const preferenceKey = "paragonArchive.privacyPreferences.v1";
  const guestSessionKey = "paragonArchive.guestSession.v1";

  function storage() {
    try { return sessionStorage.getItem(guestSessionKey) === "true" ? sessionStorage : localStorage; }
    catch (error) { return localStorage; }
  }

  function defaults() {
    return { essential: true, analytics: false, tracking: false, ads: false, decided: false, updatedAt: null };
  }

  function readPreferences() {
    try { return { ...defaults(), ...(JSON.parse(storage().getItem(preferenceKey) || "null") || {}) }; }
    catch (error) { return defaults(); }
  }

  function writePreferences(next) {
    const preferences = { ...defaults(), ...next, essential: true, decided: true, updatedAt: new Date().toISOString() };
    storage().setItem(preferenceKey, JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent("paragon:privacy-preferences", { detail: preferences }));
    return preferences;
  }

  function syncControls() {
    const preferences = readPreferences();
    const analytics = document.getElementById("privacy-analytics");
    const tracking = document.getElementById("privacy-tracking");
    const ads = document.getElementById("privacy-ads");
    if (analytics) analytics.checked = Boolean(preferences.analytics);
    if (tracking) tracking.checked = Boolean(preferences.tracking);
    if (ads) ads.checked = Boolean(preferences.ads);
    return preferences;
  }

  function hideBanner() {
    const banner = document.getElementById("cookie-banner");
    if (banner) banner.hidden = true;
  }

  function setStatus(message, tone = "") {
    const status = document.getElementById("privacy-controls-status");
    if (!status) return;
    status.textContent = message;
    status.className = `auth-form-status ${tone}`.trim();
  }

  function saveFromControls() {
    const preferences = writePreferences({
      analytics: Boolean(document.getElementById("privacy-analytics")?.checked),
      tracking: Boolean(document.getElementById("privacy-tracking")?.checked),
      ads: Boolean(document.getElementById("privacy-ads")?.checked)
    });
    syncControls();
    hideBanner();
    setStatus("Privacy preferences saved.", "success");
    window.showToast?.("Privacy preferences saved.");
    return preferences;
  }

  async function downloadMyData() {
    let authUser = null;
    try { if (window.ParagonAuth?.getCurrentUser) authUser = await window.ParagonAuth.getCurrentUser(); } catch (error) { /* signed out/unconfigured */ }
    let synced = window.ParagonSync?.getCachedState?.() || null;
    if (authUser && !synced && window.ParagonSync?.loadState) {
      try { synced = await window.ParagonSync.loadState(); } catch (error) { /* export available browser state only */ }
    }
    let guestState = null;
    try { guestState = JSON.parse(sessionStorage.getItem("paragonArchive.guestState.v1") || "null"); } catch (error) { /* ignore */ }
    let recentSearches = [];
    try { recentSearches = JSON.parse(storage().getItem("paragonArchive.recentSearches.v1") || "[]"); } catch (error) { /* ignore */ }
    const payload = {
      exportedAt: new Date().toISOString(),
      account: authUser ? {
        id: authUser.id,
        email: authUser.email,
        createdAt: authUser.created_at,
        provider: authUser.app_metadata?.provider,
        userMetadata: authUser.user_metadata
      } : null,
      state: synced || guestState,
      recentSearches,
      privacyPreferences: readPreferences(),
      note: "Authentication tokens and passwords are intentionally excluded."
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `paragon-archive-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Your data export was created.", "success");
  }

  window.openPrivacyControls = function() {
    const overlay = document.getElementById("privacy-controls-overlay");
    if (!overlay) {
      window.location.href = "paragon-archive-hub.html#privacy-controls";
      return;
    }
    syncControls();
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("privacy-open");
    requestAnimationFrame(() => document.getElementById("privacy-controls-close")?.focus({ preventScroll: true }));
  };

  window.closePrivacyControls = function() {
    const overlay = document.getElementById("privacy-controls-overlay");
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("privacy-open");
  };

  function bind() {
    const preferences = syncControls();
    const banner = document.getElementById("cookie-banner");
    /* P-091 — the privacy banner waits its turn: never over the welcome splash. */
    if (banner) {
      if (preferences.decided) banner.hidden = true;
      else if (document.getElementById("welcome-splash") || !window.sessionStorage?.getItem?.("paragonArchive.welcomeSplash.v1")) {
        banner.hidden = true;
        const reveal = () => { if (!readPreferences().decided) banner.hidden = false; };
        if (typeof window.addEventListener === "function") window.addEventListener("paragon:welcome-splash-done", reveal, { once: true });
        if (typeof window.setTimeout === "function") window.setTimeout(reveal, 6000); // safety net if the splash never ran
      } else banner.hidden = false;
    }

    document.getElementById("cookie-essential")?.addEventListener("click", () => {
      writePreferences({ analytics: false, tracking: false, ads: false });
      hideBanner();
      window.showToast?.("Essential cookies only.");
    });
    document.getElementById("cookie-accept-all")?.addEventListener("click", () => {
      writePreferences({ analytics: true, tracking: true, ads: true });
      hideBanner();
      window.showToast?.("Cookie preferences accepted.");
    });
    document.getElementById("cookie-manage")?.addEventListener("click", () => window.openPrivacyControls());
    document.getElementById("privacy-controls-close")?.addEventListener("click", () => window.closePrivacyControls());
    document.getElementById("privacy-controls-cancel")?.addEventListener("click", () => window.closePrivacyControls());
    document.getElementById("privacy-controls-save")?.addEventListener("click", saveFromControls);
    document.getElementById("privacy-download-data")?.addEventListener("click", downloadMyData);
    document.getElementById("privacy-delete-account")?.addEventListener("click", () => {
      setStatus("Secure account deletion needs the future backend deletion workflow. Email Privacy support for now.", "error");
    });
    document.getElementById("privacy-controls-overlay")?.addEventListener("click", event => {
      if (event.target.id === "privacy-controls-overlay") window.closePrivacyControls();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && document.getElementById("privacy-controls-overlay")?.classList.contains("active")) window.closePrivacyControls();
    });
  }

  window.ParagonPrivacy = {
    getPreferences: readPreferences,
    savePreferences: writePreferences,
    analyticsAllowed: () => Boolean(readPreferences().analytics),
    trackingAllowed: () => Boolean(readPreferences().tracking),
    adsAllowed: () => Boolean(readPreferences().ads),
    downloadMyData
  };

  document.addEventListener("DOMContentLoaded", bind);
})();
