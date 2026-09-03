/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: service-worker.js
  EXPECTED PROJECT PATH: /service-worker.js
  ROLE: PWA offline shell and same-origin asset cache.
  RESTORE/LOAD NOTE: Keep at project root so its scope covers all path-based Paragon assets.
*/

const CACHE_NAME = "paragon-archive-v88";
const APP_SHELL = [
  "./paragon-archive.html",
  "./paragon-archive-hub.html",
  "./paragon-product-preview.html",
  "./style.css",
  "./app.js",
  "./archive-hub.js",
  "./product-preview.js",
  "./pwa.js",
  "./ads/adsense.js",
  "./privacy.js",
  "./vendor/qrcode.min.js",
  "./manifest.webmanifest",
  "./config/supabase.js",
  "./auth/supabase-auth.js",
  "./auth/paragon-sync.js",
  "./data/sites.js",
  "./data/catalogue-expansion.js",
  "./data/catalogue-expansion-45-100.js",
  "./data/updates.js",
  "./data/metrics.js",
  "./ai/paragon-archive-ai.js",
  "./assets/icons/paragon-192.png",
  "./assets/icons/paragon-512.png",
  "./assets/hub-hero.jpg",
  "./offline.html",
  "./assets/illustrations/offline.png",
  "./assets/brand/favicon-32.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(match => match || caches.match("./paragon-archive.html")).then(match => match || caches.match("./offline.html"))));
    return;
  }
  // P-047: stale-while-revalidate for same-origin assets. The cached copy answers
  // instantly, but the network copy is fetched in the background and replaces it,
  // so updated JS/CSS/data self-heal on the next load even between version bumps.
  event.respondWith(caches.match(event.request).then(cached => {
    const network = fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => cached);
    return cached || network;
  }));
});

/* P-096 — REAL phone notifications (Web Push): arriving push messages become OS
   notifications branded "Paragon Archive" while the app is closed or backgrounded.
   Delivery itself needs the production domain + VAPID keys + a push sender (roadmap item 6). */
self.addEventListener("push", event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch (error) { payload = { title: "Paragon Archive", body: event.data ? event.data.text() : "" }; }
  const title = payload.title || "Paragon Archive";
  const options = {
    body: payload.body || "Something new happened in the Paragon Archive.",
    icon: payload.icon || "./assets/brand/pwa-icon.png",
    badge: payload.badge || "./assets/brand/favicon-32.png",
    tag: payload.tag || "paragon-archive",
    data: { url: payload.url || "./paragon-archive.html" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "./paragon-archive.html";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ("focus" in client) { client.navigate?.(target); return client.focus(); }
      }
      return self.clients.openWindow(target);
    })
  );
});
