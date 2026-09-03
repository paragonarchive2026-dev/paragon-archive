/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: pwa.js
  EXPECTED PROJECT PATH: /pwa.js
  ROLE: PWA service-worker registration, install-prompt controller, notification opt-in,
        and the real-app share sheet (P-094 owner decision: browser-install PWA only, no store).
  RESTORE/LOAD NOTE: Keep at project root and load before app.js.
*/

(() => {
  let installPrompt = null;
  let installed = window.matchMedia?.("(display-mode: standalone)").matches || false;

  if ("serviceWorker" in navigator && ["https:", "http:"].includes(location.protocol)) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(error => console.warn("Service worker registration failed", error)));
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    window.dispatchEvent(new CustomEvent("paragon:pwa-available"));
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    installPrompt = null;
    window.dispatchEvent(new CustomEvent("paragon:pwa-installed"));
  });

  /* P-094 — real-app powers: notification permission opt-in + test notification.
     Honest: browser local notifications work after install/permission; SERVER push
     delivery still needs the production domain + a push service (roadmap item 6). */
  const notificationsSupported = () => typeof window.Notification !== "undefined";
  const notificationPermission = () => (notificationsSupported() ? window.Notification.permission : "unsupported");

  async function enableNotifications() {
    if (!notificationsSupported()) return { ok: false, reason: "unsupported" };
    try {
      const permission = await window.Notification.requestPermission();
      return { ok: permission === "granted", permission };
    } catch (error) {
      return { ok: false, reason: String(error?.message || error) };
    }
  }

  async function sendTestNotification() {
    if (!notificationsSupported() || window.Notification.permission !== "granted") return { ok: false, reason: "permission" };
    const payload = {
      body: "Paragon Archive notifications are ON — updates and announcements will speak to you here.",
      icon: "assets/brand/pwa-icon-192.png",
      badge: "assets/brand/favicon-32.png",
      tag: "paragon-test"
    };
    try {
      const registration = await navigator.serviceWorker?.getRegistration?.();
      if (registration?.showNotification && typeof registration.showNotification === "function") {
        registration.showNotification("🔔 Paragon Archive", payload);
        return { ok: true };
      }
    } catch (error) { /* fall through to the constructor */ }
    try { new window.Notification("🔔 Paragon Archive", payload); return { ok: true }; }
    catch (error) { return { ok: false, reason: String(error?.message || error) }; }
  }

  /* P-094 — real-app share sheet: Web Share API with an honest clipboard fallback (no dialogs). */
  let shareUrlOverride = null;
  function setShareOverride(url) { shareUrlOverride = url; }
  async function shareParagon() {
    const shareData = {
      title: "Paragon Archive",
      text: "Every website you need, one archive — free, for everyone. Install it as an app:",
      url: shareUrlOverride || window.location.href.split("#")[0].split("?")[0]
    };
    try {
      if (navigator.share && typeof navigator.share === "function") {
        await navigator.share(shareData);
        return { ok: true, method: "share" };
      }
    } catch (error) {
      if (error?.name === "AbortError") return { ok: false, reason: "cancelled" };
      /* fall through to clipboard */
    }
    try {
      if (navigator.clipboard?.writeText && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(shareData.url);
        return { ok: true, method: "clipboard" };
      }
    } catch (error) { /* no clipboard either */ }
    return { ok: false, reason: "unavailable" };
  }

  /* P-096 — REAL phone notifications: browser notification permission already delivers
     OS-level pings on installed PWAs. SERVER push (messages that arrive when the app is
     closed) additionally needs a push subscription — possible only with the production
     HTTPS domain + VAPID keys + a Supabase push sender (roadmap item 6). Honest until then. */
  function pushSupported() {
    return Boolean(navigator.serviceWorker) && typeof window.PushManager !== "undefined";
  }
  function pushPublicKey() { return String(window.ParagonConfig?.pushPublicKey || "").trim(); }
  async function connectPhonePush() {
    if (!notificationsSupported()) return { ok: false, reason: "unsupported" };
    const permissionResult = await enableNotifications();
    if (!permissionResult.ok) return permissionResult;
    if (!pushSupported()) return { ok: false, reason: "push-unsupported", permission: "granted" };
    if (!pushPublicKey()) return { ok: true, method: "permission-only", note: "Server push activates with the production domain + VAPID keys." };
    try {
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = Uint8Array.from(atob(pushPublicKey()), character => character.charCodeAt(0));
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      /* The subscription endpoint is what the future Supabase push function will store. */
      window.localStorage.setItem("paragonArchive.pushSubscription.v1", JSON.stringify(subscription));
      return { ok: true, method: "subscribed", subscription };
    } catch (error) {
      return { ok: false, reason: String(error?.message || error) };
    }
  }

  window.ParagonPWA = {
    isInstallable: () => Boolean(installPrompt),
    isInstalled: () => installed,
    install: async () => {
      if (!installPrompt) return { outcome: installed ? "installed" : "unavailable" };
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") installPrompt = null;
      return choice;
    },
    notificationsSupported,
    notificationPermission,
    enableNotifications,
    sendTestNotification,
    shareParagon,
    pushSupported,
    connectPhonePush
  };
})();
