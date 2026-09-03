
/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /app.js
  ROLE: Main UI, navigation, details, Account, Updates, overlays, and interactions.
  RESTORE/LOAD NOTE: Keep at project root. Load last after all config/auth/data modules.
*/

/* P-087/P-094 — entry splash v4: the welcome hero is PRELOADED before the splash appears, so it
   never pops in half-loaded ("appearing fast without loading" bug). Text sits on a dedicated
   readability veil so the background art can never distort it, and the loader is a bold ring
   with the live percentage inside it. Still 5 s, once per browser session — and replayed in
   full after every login (owner rule). */
function showWelcomeSplash() {
  try { if (window.sessionStorage.getItem("paragonArchive.welcomeSplash.v1") === "shown") return; } catch (error) { /* blocked */ }
  if (document.getElementById("welcome-splash")) return;
  if (typeof document.body?.appendChild !== "function" || typeof document.createElement !== "function") return; // VM/test environments
  const runSplash = () => {
    if (document.getElementById("welcome-splash")) return;
    const splash = document.createElement("div");
    splash.id = "welcome-splash";
    splash.innerHTML = `
      <div class="welcome-splash-card">
        <img src="assets/illustrations/welcome-hero.jpg" alt="">
        <div class="welcome-splash-veil" aria-hidden="true"></div>
        <img class="welcome-splash-mark" src="assets/brand/logo-mark.png" alt="">
        <div class="welcome-splash-loader">
          <svg viewBox="0 0 44 44" aria-hidden="true"><circle class="splash-ring-track" cx="22" cy="22" r="19" pathLength="100"></circle><circle id="splash-ring" class="splash-ring-value" cx="22" cy="22" r="19" pathLength="100"></circle></svg>
          <b id="splash-percent">0%</b>
        </div>
        <strong class="welcome-splash-name">Paragon Archive</strong>
        <span class="welcome-splash-tagline">The gateway to everything Paragon — free, for everyone.</span>
      </div>`;
    document.body.appendChild(splash);
    document.body.classList.add("popup-lock");
    try { window.sessionStorage.setItem("paragonArchive.welcomeSplash.v1", "shown"); } catch (error) { /* blocked */ }
    requestAnimationFrame(() => splash.classList.add("show"));
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    /* P-096 — the 5 s hold is UNCONDITIONAL (owner bug report: it flashed for microseconds when
       the OS had reduced-motion on). Reduced-motion only snaps the ring to 100% instantly. */
    const HOLD_MS = 5000;
    const RING_MS = reduced ? 1 : 4300;
    const ring = document.getElementById("splash-ring");
    const percentNode = document.getElementById("splash-percent");
    if (reduced) {
      if (ring) ring.style.strokeDashoffset = "0";
      if (percentNode) percentNode.textContent = "100%";
    }
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const percent = Math.min(100, Math.round(((Date.now() - startedAt) / RING_MS) * 100));
      if (ring) ring.style.strokeDashoffset = String(100 - percent);
      if (percentNode) percentNode.textContent = percent + "%";
      if (percent >= 100) window.clearInterval(timer);
    }, 50);
    window.setTimeout(() => {
      splash.classList.add("fade");
      window.setTimeout(() => {
        splash.remove();
        if (!document.querySelector(".utility-overlay.active, .share-sheet-overlay.active")) document.body.classList.remove("popup-lock");
        window.dispatchEvent(new CustomEvent("paragon:welcome-splash-done"));
      }, reduced ? 60 : 700);
    }, HOLD_MS);
  };
  /* P-096 — the splash opens INSTANTLY (no preload gate: waiting on image bytes made it pop
     in late/janky on slow first visits). The art fades in behind the readability veil while
     the 5 s ring runs — the veil guarantees the text is legible even before the art arrives. */
  runSplash();
}

/* P-097 — WHOLE-PLATFORM MAINTENANCE LOCKDOWN: the Team Settings desk flips
   paragonTeamSettings.v1.maintenanceMode and EVERY public surface (Archive, Hub, previews,
   board, portal) shows the maintenance screen — nothing under it can override this. */
function platformMaintenanceActive() {
  try { return (JSON.parse(window.localStorage.getItem("paragonTeamSettings.v1") || "null") || {}).maintenanceMode === true; }
  catch (error) { return false; }
}
function applyPlatformMaintenanceLockdown() {
  if (!platformMaintenanceActive() || typeof document.createElement !== "function") return false;
  if (document.getElementById("platform-maintenance-lockdown")) return true;
  const screen = document.createElement("div");
  screen.id = "platform-maintenance-lockdown";
  screen.innerHTML = `
    <style>
      #platform-maintenance-lockdown { position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 26px; background: #0b0b0f; color: #e6e9f0; text-align: center; font-family: system-ui, -apple-system, sans-serif; }
      #platform-maintenance-lockdown.light { background: #f3f2ef; color: #1c1e26; }
      #platform-maintenance-lockdown img { width: min(300px, 62vw); height: auto; }
      #platform-maintenance-lockdown h1 { font-size: clamp(22px, 4vw, 32px); margin: 0; }
      #platform-maintenance-lockdown p { max-width: 520px; font-size: 14px; line-height: 1.65; opacity: 0.82; margin: 0; }
      #platform-maintenance-lockdown button { margin-top: 8px; padding: 12px 24px; border: 0; border-radius: 999px; background: linear-gradient(120deg, #2563eb, #6d5efc); color: #fff; font-weight: 800; cursor: pointer; }
    </style>
    <img src="assets/illustrations/maintenance.png" alt="">
    <h1>🚧 Paragon Archive is under maintenance</h1>
    <p>The whole platform is briefly closed for repairs and updates from the Paragon Team. Every Paragon website routes here until the founder switches maintenance off. Nothing is lost — please check back soon.</p>
    <button type="button" onclick="location.reload()">Try again</button>`;
  document.documentElement.appendChild(screen);
  return true;
}

/* P-097 — REAL achievement badge art (stages 1–2 = first 10). Emoji stays as fallback. */
const BADGE_ART = {
  "First Visit": "assets/achievement-badges/badge-first-visit.png",
  "First Rating": "assets/achievement-badges/badge-first-rating.png",
  "First Review": "assets/achievement-badges/badge-first-review.png",
  "First Share": "assets/achievement-badges/badge-first-share.png",
  "Google or Email": "assets/achievement-badges/badge-account.png",
  "Progress Starter": "assets/achievement-badges/badge-progress-starter.png",
  "First Save": "assets/achievement-badges/badge-first-save.png",
  "Collection Keeper": "assets/achievement-badges/badge-collection-keeper.png",
  "Helpful Voice": "assets/achievement-badges/badge-helpful-voice.png",
  "Explorer Five": "assets/achievement-badges/badge-explorer-five.png",
  /* P-098 — badges 11–20 (stages 2–4). 10 remain after this. */
  "Reviewer Three": "assets/achievement-badges/badge-reviewer-three.png",
  "Saver Five": "assets/achievement-badges/badge-saver-five.png",
  "Collector Three": "assets/achievement-badges/badge-collector-three.png",
  "Explorer Ten": "assets/achievement-badges/badge-explorer-ten.png",
  "Progress Three": "assets/achievement-badges/badge-progress-three.png",
  "Five-Star Voice": "assets/achievement-badges/badge-five-star.png",
  "Share Three": "assets/achievement-badges/badge-share-three.png",
  "Theme Explorer": "assets/achievement-badges/badge-theme-explorer.png",
  "Search Explorer": "assets/achievement-badges/badge-search-explorer.png",
  "Notification Reader": "assets/achievement-badges/badge-notification-reader.png",
  /* P-105 — badges 21–30 (final stages) */
  "Archive Veteran": "assets/achievement-badges/badge-archive-veteran.png",
  "Trusted Reviewer": "assets/achievement-badges/badge-trusted-reviewer.png",
  "Hub Visitor": "assets/achievement-badges/badge-hub-visitor.png",
  "Hub Regular": "assets/achievement-badges/badge-hub-regular.png",
  "QR Creator": "assets/achievement-badges/badge-qr-creator.png",
  "AI Curious": "assets/achievement-badges/badge-ai-curious.png",
  "AI Regular": "assets/achievement-badges/badge-ai-regular.png",
  "Results Seeker": "assets/achievement-badges/badge-results-seeker.png",
  "Social Spreader": "assets/achievement-badges/badge-social-spreader.png",
  "Fully Notified": "assets/achievement-badges/badge-fully-notified.png",
  /* P-106 — badges 31–50: ads, leaderboard, engagement (10 stages total) */
  "Ad Curious": "assets/achievement-badges/badge-ad-curious.png",
  "Ad Supporter": "assets/achievement-badges/badge-ad-supporter.png",
  "Ad Ally": "assets/achievement-badges/badge-ad-ally.png",
  "Ad Champion": "assets/achievement-badges/badge-ad-champion.png",
  "Ad Patron": "assets/achievement-badges/badge-ad-patron.png",
  "Leaderboard Scout": "assets/achievement-badges/badge-leaderboard-scout.png",
  "Leaderboard Climber": "assets/achievement-badges/badge-leaderboard-climber.png",
  "Top Ten Contender": "assets/achievement-badges/badge-top-ten-contender.png",
  "Top Ten Finisher": "assets/achievement-badges/badge-top-ten-finisher.png",
  "Podium Push": "assets/achievement-badges/badge-podium-push.png",
  "Daily Return": "assets/achievement-badges/badge-daily-return.png",
  "Week Streak": "assets/achievement-badges/badge-week-streak.png",
  "Coin Curious": "assets/achievement-badges/badge-coin-curious.png",
  "Product Pilot": "assets/achievement-badges/badge-product-pilot.png",
  "Install Ready": "assets/achievement-badges/badge-install-ready.png",
  "Community Step": "assets/achievement-badges/badge-community-step.png",
  "Detail Deep Dive": "assets/achievement-badges/badge-detail-deep-dive.png",
  "Category Hopper": "assets/achievement-badges/badge-category-hopper.png",
  "Update Watcher": "assets/achievement-badges/badge-update-watcher.png",
  "Archive Legend": "assets/achievement-badges/badge-archive-legend.png"
};
function badgeIconMarkup(task) {
  return BADGE_ART[task.title] ? `<img class="ach-badge-art" src="${BADGE_ART[task.title]}" alt="" loading="lazy">` : `<div class="emoji">${task.icon}</div>`;
}

/* P-106 — engagement counters (ads, leaderboard, streaks). Honest local scores;
   server leaderboard periods (phase4) remain team-settled when live. */
function engagementScore() {
  const reviews = Object.values(localReviews || {}).flat().length;
  /* Do not call achievementTasks() here — leaderboard checks run during achievement render. */
  return (
    localVisits.length * 4 +
    bookmarkedSites.size * 3 +
    reviews * 6 +
    Number(accountProfile.shareCount || 0) * 5 +
    Number(accountProfile.adClickCount || 0) * 8 +
    Number(accountProfile.adImpressionCount || 0) * 1 +
    Number(accountProfile.hubVisitCount || 0) * 3 +
    Number(accountProfile.aiQuestionCount || 0) * 4 +
    Number(accountProfile.productOpenCount || 0) * 5 +
    Number(accountProfile.dayStreak || 0) * 10 +
    Number(accountProfile.detailOpenCount || 0) * 2 +
    Number(accountProfile.leaderboardCheckCount || 0) * 3 +
    Math.min(coinBalance(), 500) * 0.05
  );
}

function localDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function bumpDayStreak() {
  if (!hasPersonalSession()) return;
  const today = localDayKey();
  const last = String(accountProfile.lastActiveDay || "");
  if (last === today) return;
  const yesterday = localDayKey(new Date(Date.now() - 86400000));
  if (last === yesterday) accountProfile.dayStreak = Number(accountProfile.dayStreak || 0) + 1;
  else accountProfile.dayStreak = 1;
  accountProfile.lastActiveDay = today;
  persistPersonalState();
}

function bumpEngagement(field, by = 1) {
  if (!hasPersonalSession() || !field) return;
  accountProfile[field] = Number(accountProfile[field] || 0) + by;
  persistPersonalState();
  try { renderAchievementsAccount(); } catch (_) { /* account tab may be idle */ }
}

window.ParagonArchiveAdsBridge = {
  onImpression(purpose) {
    bumpEngagement("adImpressionCount", 1);
  },
  onEngage(purpose, meta) {
    bumpEngagement("adClickCount", 1);
  }
};

function computeMyLeaderboardRank(score) {
  /* Device-local competitive board: stable synthetic rivals + you.
     Encourages climbing; not a money settlement source (D-222). */
  const seeds = [980, 920, 860, 800, 740, 690, 640, 590, 540, 500, 460, 420, 380, 340, 300, 270, 240, 210, 180, 150];
  const rivals = seeds.map((base, index) => ({
    name: ["Nova", "Kemi", "Ada", "Tunde", "Zara", "Chidi", "Maya", "Leo", "Ife", "Sam", "Rae", "Ola", "Nia", "Ben", "Ayo", "Lux", "Ivy", "Kai", "Sade", "Jon"][index],
    score: base + ((index * 17) % 40)
  }));
  const me = { name: "You", score: Math.round(score), isYou: true };
  const board = rivals.concat([me]).sort((a, b) => b.score - a.score || (a.isYou ? -1 : 1));
  const rank = board.findIndex(row => row.isYou) + 1;
  return { rank, board: board.slice(0, 12), score: me.score };
}

function recordLeaderboardCheck(openCount = false) {
  if (!hasPersonalSession()) return null;
  const { rank, board, score } = computeMyLeaderboardRank(engagementScore());
  if (openCount) bumpEngagement("leaderboardOpenCount", 1);
  bumpEngagement("leaderboardCheckCount", 1);
  const prev = Number(accountProfile.leaderboardBestRank || 0);
  if (!prev || rank < prev) accountProfile.leaderboardBestRank = rank;
  persistPersonalState();
  try { renderAchievementsAccount(); } catch (_) {}
  return { rank, board, score, best: Number(accountProfile.leaderboardBestRank || rank) };
}

window.openEngagementLeaderboard = function() {
  if (!requirePersonalSession("view the engagement leaderboard")) return;
  const snap = recordLeaderboardCheck(true) || computeMyLeaderboardRank(engagementScore());
  const overlay = document.createElement("div");
  overlay.id = "leaderboard-overlay";
  overlay.className = "install-popup-overlay active";
  overlay.innerHTML = `
    <div class="install-popup-card leaderboard-card" role="dialog" aria-modal="true" aria-label="Engagement leaderboard">
      <header><h2>🏆 Engagement leaderboard</h2>
        <button type="button" class="icon-btn-small" onclick="document.getElementById('leaderboard-overlay')?.remove();document.body.classList.remove('popup-lock')" aria-label="Close">×</button>
      </header>
      <p class="install-popup-note">Climb with real Archive activity — reviews, shares, <strong>support-ad taps</strong>, product use, and daily returns. Top 10 unlocks Contender / Finisher badges. Podium (top 3) unlocks Podium Push. This board is engagement practice on your device; coin competitions stay server-settled.</p>
      <div class="leaderboard-you">Your score <strong>${snap.score.toLocaleString()}</strong> · Rank <strong>#${snap.rank}</strong> · Best <strong>#${snap.best || snap.rank}</strong></div>
      <ol class="leaderboard-list">
        ${snap.board.map((row, index) => `
          <li class="${row.isYou ? "is-you" : ""}">
            <span class="lb-rank">#${index + 1}</span>
            <span class="lb-name">${row.isYou ? "You" : row.name}</span>
            <span class="lb-score">${Math.round(row.score).toLocaleString()} pts</span>
          </li>`).join("")}
      </ol>
      <div class="install-popup-actions" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;">
        <button type="button" class="primary-action" onclick="document.getElementById('leaderboard-overlay')?.remove();document.body.classList.remove('popup-lock');openEngagementLeaderboard()">↻ Recheck rank</button>
        <button type="button" class="secondary-action" onclick="document.getElementById('leaderboard-overlay')?.remove();document.body.classList.remove('popup-lock');document.querySelector('[data-paragon-ad]')?.scrollIntoView({behavior:'smooth',block:'center'})">Support via ads</button>
        <button type="button" class="secondary-action" onclick="document.getElementById('leaderboard-overlay')?.remove();document.body.classList.remove('popup-lock')">Close</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("popup-lock");
  showToast(snap.rank <= 10 ? `Top 10 — you are #${snap.rank}. Keep climbing!` : `Rank #${snap.rank} — engage more to break top 10.`);
};


/* ============================================
   PARAGON ARCHIVE — FULL APPLICATION LOGIC
   ============================================ */

/* --- Data (loaded before this file from data/sites.js and data/metrics.js) --- */
const sites = window.ParagonSites || [];

/* P-077 (B4) — REAL Deployed merge: websites approved through the Team 8-point
   review gate join the public Deployed category on this device. Backend sync
   extends this across devices at activation. Honest: only status === "approved". */
(function mergeApprovedDeployed() {
  try {
    const submissions = JSON.parse(window.localStorage.getItem("paragonTeamDeployed.submissions.v1") || "null") || [];
    submissions.filter(entry => entry.status === "approved" && entry.name && !entry.illustrative).forEach(entry => {
      if (sites.some(site => site.name === entry.name)) return;
      sites.push({
        name: entry.name, category: "Deployed", group: "Deployed",
        icon: entry.icon || "🚀", color: "#7c3aed",
        desc: entry.desc || "Community-built website approved through the Paragon review gate.",
        about: entry.desc || "", tag: "Community-built", version: "v1.0",
        stars: 0, buildProgress: 100,
        features: entry.features || [], updates: [],
        siteUrl: entry.url || "#",
        developer: { handle: entry.submittedBy || "@developer" },
        deployedReal: true
      });
    });
  } catch (error) { /* storage blocked — catalogue stays as shipped */ }
})();
const curatedUpdates = window.ParagonCuratedUpdates || [];
const publicNotifications = window.ParagonPublicNotifications || [];
const siteMetrics = window.ParagonMetrics || null;

/* --- Helpers --- */
function pickHeroSites() {
  return siteMetrics?.getDailyFeaturedSites(7) || sites.slice(0, 7);
}

function getSiteViewCount(siteOrName) {
  const name = typeof siteOrName === "string" ? siteOrName : siteOrName?.name;
  return name && siteMetrics ? siteMetrics.getViewCount(name) : 0;
}

function formatSiteViews(siteOrName) {
  const value = getSiteViewCount(siteOrName);
  return siteMetrics ? siteMetrics.formatViews(value) : String(value);
}

const authClient = window.ParagonAuth || null;
const syncClient = window.ParagonSync || null;
const localKeys = {
  theme: "paragonArchive.theme.v2",
  notificationsEnabled: "paragonArchive.notificationsEnabled.v2",
  guestSession: "paragonArchive.guestSession.v1",
  guestState: "paragonArchive.guestState.v1",
  guestRequestDraft: "paragonArchive.guestRequestDraft.v1",
  guestInactiveSince: "paragonArchive.guestInactiveSince.v1",
  recentSearches: "paragonArchive.recentSearches.v1",
  pendingIntent: "paragonArchive.pendingPersonalIntent.v1"
};

function readStorageJSON(storage, key, fallback) {
  try {
    const value = JSON.parse(storage.getItem(key) || "null");
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorageJSON(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); } catch (error) { /* in-memory behavior remains */ }
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

let loggedIn = false;
let guestMode = false;
let identityLoading = true;
let authUser = null;
let bookmarkedSites = new Set();
let localReviews = {};
let reviewVotes = {};
let localVisits = [];
let sharedProgress = {};
let userCollections = [];
let accountProfile = {};
let inAppNotifications = [];
let personalSyncTimer = null;
let guestExpiryTimer = null;
const guestAwayTimeoutMs = 30 * 60 * 1000;
const notificationLifetimeMs = 24 * 60 * 60 * 1000;
const adNotificationLifetimeMs = 72 * 60 * 60 * 1000;

function hasPersonalSession() {
  return loggedIn || guestMode;
}

function personalStateSnapshot() {
  const cachedProgress = syncClient?.getCachedState?.()?.progress;
  return {
    bookmarks: [...bookmarkedSites],
    reviews: { ...localReviews },
    reviewVotes: { ...reviewVotes },
    visits: [...localVisits],
    progress: cachedProgress || sharedProgress || {},
    collections: userCollections.map(collection => ({ ...collection, items: Array.isArray(collection.items) ? [...collection.items] : [] })),
    profile: { ...accountProfile },
    notifications: inAppNotifications.map(notification => ({ ...notification })),
    preferences: {
      theme: document.documentElement.classList?.contains("light") ? "light" : "dark",
      notificationsEnabled: notificationsEnabled()
    }
  };
}

function normalizeExclusiveCollections(collections = []) {
  const assigned = new Set();
  return collections.map(collection => ({
    ...collection,
    items: (Array.isArray(collection.items) ? collection.items : []).filter(siteName => {
      if (assigned.has(siteName)) return false;
      assigned.add(siteName);
      return true;
    })
  }));
}

function applyPersonalState(value) {
  const state = syncClient?.normalizeState ? syncClient.normalizeState(value) : {
    bookmarks: Array.isArray(value?.bookmarks) ? value.bookmarks : [],
    reviews: value?.reviews || {}, reviewVotes: value?.reviewVotes || {}, visits: Array.isArray(value?.visits) ? value.visits : [],
    progress: value?.progress || {}, preferences: value?.preferences || {},
    collections: Array.isArray(value?.collections) ? value.collections : [], profile: value?.profile || {},
    notifications: Array.isArray(value?.notifications) ? value.notifications : []
  };
  bookmarkedSites = new Set(state.bookmarks.filter(name => sites.some(site => site.name === name)));
  localReviews = normalizeStoredReviews(state.reviews);
  reviewVotes = state.reviewVotes || {};
  localVisits = state.visits;
  sharedProgress = state.progress;
  userCollections = normalizeExclusiveCollections(state.collections);
  accountProfile = state.profile;
  inAppNotifications = Array.isArray(state.notifications) ? state.notifications : [];
  if (state.preferences?.theme) {
    document.documentElement.classList?.toggle("light", state.preferences.theme === "light");
    const storage = guestMode ? window.sessionStorage : window.localStorage;
    try { storage.setItem(localKeys.theme, state.preferences.theme); } catch (error) { /* ignore */ }
    syncTopThemeButton();
  }
  if (typeof state.preferences?.notificationsEnabled === "boolean") {
    const storage = guestMode ? window.sessionStorage : window.localStorage;
    try { storage.setItem(localKeys.notificationsEnabled, String(state.preferences.notificationsEnabled)); } catch (error) { /* ignore */ }
  }
}

function clearPersonalState() {
  bookmarkedSites = new Set();
  localReviews = {};
  reviewVotes = {};
  localVisits = [];
  sharedProgress = {};
  userCollections = [];
  accountProfile = {};
  inAppNotifications = [];
}

function mergeCollections(accountCollections = [], guestCollections = []) {
  const merged = accountCollections.map(collection => ({ ...collection, items: [...new Set(collection.items || [])] }));
  guestCollections.forEach(guestCollection => {
    const existing = merged.find(collection => collection.id === guestCollection.id || collection.name?.trim().toLowerCase() === guestCollection.name?.trim().toLowerCase());
    if (existing) existing.items = [...new Set([...(existing.items || []), ...(guestCollection.items || [])])];
    else merged.push({ ...guestCollection, items: [...new Set(guestCollection.items || [])] });
  });
  const assigned = new Set();
  for (let index = merged.length - 1; index >= 0; index -= 1) {
    merged[index].items = (merged[index].items || []).filter(siteName => {
      if (assigned.has(siteName)) return false;
      assigned.add(siteName);
      return true;
    });
  }
  return merged;
}

function mergePersonalStates(accountValue = {}, guestValue = {}) {
  const normalize = value => syncClient?.normalizeState ? syncClient.normalizeState(value) : value;
  const account = normalize(accountValue) || {};
  const guest = normalize(guestValue) || {};
  const visitsByName = new Map();
  [...(account.visits || []), ...(guest.visits || [])].forEach(visit => {
    if (!visit?.name) return;
    const previous = visitsByName.get(visit.name);
    if (!previous || new Date(visit.visitedAt || 0) > new Date(previous.visitedAt || 0)) visitsByName.set(visit.name, visit);
  });
  return {
    ...account,
    bookmarks: [...new Set([...(account.bookmarks || []), ...(guest.bookmarks || [])])],
    reviews: mergeStoredReviews(account.reviews, guest.reviews),
    reviewVotes: { ...(account.reviewVotes || {}), ...(guest.reviewVotes || {}) },
    visits: [...visitsByName.values()].sort((a, b) => new Date(b.visitedAt || 0) - new Date(a.visitedAt || 0)).slice(0, 20),
    progress: { ...(account.progress || {}), ...(guest.progress || {}) },
    preferences: { ...(account.preferences || {}), ...(guest.preferences || {}) },
    collections: mergeCollections(account.collections || [], guest.collections || []),
    profile: {
      ...(account.profile || {}),
      firstShareAt: account.profile?.firstShareAt || guest.profile?.firstShareAt || null,
      shareCount: Number(account.profile?.shareCount || 0) + Number(guest.profile?.shareCount || 0),
      themeSwitchCount: Number(account.profile?.themeSwitchCount || 0) + Number(guest.profile?.themeSwitchCount || 0),
      hubVisitCount: Number(account.profile?.hubVisitCount || 0) + Number(guest.profile?.hubVisitCount || 0),
      qrCount: Number(account.profile?.qrCount || 0) + Number(guest.profile?.qrCount || 0),
      aiQuestionCount: Number(account.profile?.aiQuestionCount || 0) + Number(guest.profile?.aiQuestionCount || 0),
      resultsSearchCount: Number(account.profile?.resultsSearchCount || 0) + Number(guest.profile?.resultsSearchCount || 0),
      adImpressionCount: Number(account.profile?.adImpressionCount || 0) + Number(guest.profile?.adImpressionCount || 0),
      adClickCount: Number(account.profile?.adClickCount || 0) + Number(guest.profile?.adClickCount || 0),
      leaderboardOpenCount: Number(account.profile?.leaderboardOpenCount || 0) + Number(guest.profile?.leaderboardOpenCount || 0),
      leaderboardCheckCount: Number(account.profile?.leaderboardCheckCount || 0) + Number(guest.profile?.leaderboardCheckCount || 0),
      leaderboardBestRank: (() => {
        const ranks = [Number(account.profile?.leaderboardBestRank || 0), Number(guest.profile?.leaderboardBestRank || 0)].filter(n => n > 0);
        return ranks.length ? Math.min(...ranks) : 0;
      })(),
      dayStreak: Math.max(Number(account.profile?.dayStreak || 0), Number(guest.profile?.dayStreak || 0)),
      lastActiveDay: account.profile?.lastActiveDay || guest.profile?.lastActiveDay || null,
      coinShopOpenCount: Number(account.profile?.coinShopOpenCount || 0) + Number(guest.profile?.coinShopOpenCount || 0),
      productOpenCount: Number(account.profile?.productOpenCount || 0) + Number(guest.profile?.productOpenCount || 0),
      installOpenCount: Number(account.profile?.installOpenCount || 0) + Number(guest.profile?.installOpenCount || 0),
      communityOpenCount: Number(account.profile?.communityOpenCount || 0) + Number(guest.profile?.communityOpenCount || 0),
      detailOpenCount: Number(account.profile?.detailOpenCount || 0) + Number(guest.profile?.detailOpenCount || 0),
      categoryBrowseCount: Number(account.profile?.categoryBrowseCount || 0) + Number(guest.profile?.categoryBrowseCount || 0),
      updatesViewCount: Number(account.profile?.updatesViewCount || 0) + Number(guest.profile?.updatesViewCount || 0),
      categoriesBrowsed: [...new Set([...(account.profile?.categoriesBrowsed || []), ...(guest.profile?.categoriesBrowsed || [])])].slice(0, 40),
      achievementStage: Math.max(1, Number(account.profile?.achievementStage || 1), Number(guest.profile?.achievementStage || 1)),
      publicNotificationReads: { ...(guest.profile?.publicNotificationReads || {}), ...(account.profile?.publicNotificationReads || {}) },
      finalAchievementUnlockedAt: account.profile?.finalAchievementUnlockedAt || guest.profile?.finalAchievementUnlockedAt || null
    },
    notifications: [...(account.notifications || [])]
  };
}

window.mergePersonalStates = mergePersonalStates;

function guestInactiveTimestamp() {
  try { return Number(window.sessionStorage.getItem(localKeys.guestInactiveSince) || 0); }
  catch (error) { return 0; }
}

function guestSessionExpired(now = Date.now()) {
  const inactiveSince = guestInactiveTimestamp();
  return Boolean(inactiveSince && now - inactiveSince >= guestAwayTimeoutMs);
}

function clearGuestSessionStorage({ keepDraft = false } = {}) {
  try {
    window.sessionStorage.removeItem(localKeys.guestSession);
    window.sessionStorage.removeItem(localKeys.guestState);
    window.sessionStorage.removeItem(localKeys.guestInactiveSince);
    window.sessionStorage.removeItem(localKeys.theme);
    window.sessionStorage.removeItem(localKeys.notificationsEnabled);
    window.sessionStorage.removeItem(localKeys.recentSearches);
    if (!keepDraft) window.sessionStorage.removeItem(localKeys.guestRequestDraft);
  } catch (error) { /* ignore */ }
}

function markGuestInactive() {
  if (!guestMode) return;
  try {
    if (!guestInactiveTimestamp()) window.sessionStorage.setItem(localKeys.guestInactiveSince, String(Date.now()));
  } catch (error) { return; }
  clearTimeout(guestExpiryTimer);
  guestExpiryTimer = setTimeout(() => evaluateGuestActivity(), guestAwayTimeoutMs + 100);
}

function evaluateGuestActivity() {
  if (!guestMode) return;
  const inactive = document.hidden || window.navigator?.onLine === false;
  const inactiveSince = guestInactiveTimestamp();
  if (inactive && !inactiveSince) { markGuestInactive(); return; }
  if (inactive && guestSessionExpired()) { expireGuestSession(); return; }
  if (!inactive) {
    if (guestSessionExpired()) { expireGuestSession(); return; }
    try { window.sessionStorage.removeItem(localKeys.guestInactiveSince); } catch (error) { /* ignore */ }
    clearTimeout(guestExpiryTimer);
  }
}

function expireGuestSession() {
  if (!guestMode && !guestSessionExpired()) return;
  clearTimeout(guestExpiryTimer);
  clearGuestSessionStorage();
  loggedIn = false;
  guestMode = false;
  authUser = null;
  clearPersonalState();
  identityLoading = false;
  renderAccount();
  renderUpdates();
  renderNotificationList();
  syncNotificationPreference();
  showToast("Guest session ended after 30 minutes away or offline. Temporary activity was cleared.", "warning");
}

function bindGuestLifecycle() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) markGuestInactive();
    else evaluateGuestActivity();
  });
  window.addEventListener("offline", markGuestInactive);
  window.addEventListener("online", evaluateGuestActivity);
  window.addEventListener("pagehide", markGuestInactive);
}

function makeLocalId(prefix = "item") {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ensureStarterCollections() {
  if (accountProfile.collectionsInitialized) return false;
  // P-076 — NO made-up starter collections: collections stay honestly empty until the user creates one.
  accountProfile.collectionsInitialized = true;
  return true;
}

async function flushPersonalState() {
  if (guestMode) {
    writeStorageJSON(window.sessionStorage, localKeys.guestState, personalStateSnapshot());
    return;
  }
  if (loggedIn && syncClient && authClient?.isConfigured()) {
    try { await syncClient.saveState(personalStateSnapshot()); }
    catch (error) { showToast(`Sync paused: ${error.message}`, "warning"); }
  }
}

/* P-097 — a tiny honest mirror of REAL user-written review totals (this device) so the Hub
   stats and the Team desks display the same truth the Archive shows. */
function refreshReviewMirror() {
  const total = Object.values(localReviews || {}).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  try { window.localStorage.setItem("paragonArchive.reviewMirror.v1", JSON.stringify({ total, updatedAt: new Date().toISOString() })); } catch (error) { /* blocked */ }
}
function readReviewMirror() {
  try { return (JSON.parse(window.localStorage.getItem("paragonArchive.reviewMirror.v1") || "null") || {}).total || 0; }
  catch (error) { return 0; }
}

function persistPersonalState() {
  try { refreshReviewMirror(); } catch (error) { /* mirror is best-effort */ }
  clearTimeout(personalSyncTimer);
  if (guestMode) {
    writeStorageJSON(window.sessionStorage, localKeys.guestState, personalStateSnapshot());
    return;
  }
  if (loggedIn) personalSyncTimer = setTimeout(() => flushPersonalState(), 450);
}

function storePendingPersonalIntent(action, intent = {}) {
  const payload = {
    action: String(action || "personal action"),
    intent: intent && typeof intent === "object" ? intent : {},
    detailName: currentDetailName || null,
    tabName: getCurrentTabName(),
    navigationHistory: Array.isArray(detailNavigationHistory) ? detailNavigationHistory.slice(-8) : [],
    scrollY: window.scrollY || 0,
    createdAt: Date.now()
  };
  try { window.sessionStorage.setItem(localKeys.pendingIntent, JSON.stringify(payload)); }
  catch (error) { /* return intent remains memory-only unavailable */ }
  return payload;
}

function readPendingPersonalIntent() {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(localKeys.pendingIntent) || "null");
    if (!value || Date.now() - Number(value.createdAt || 0) > 30 * 60 * 1000) {
      window.sessionStorage.removeItem(localKeys.pendingIntent);
      return null;
    }
    return value;
  } catch (error) { return null; }
}

function resumePendingPersonalIntent() {
  if (!hasPersonalSession()) return false;
  const pending = readPendingPersonalIntent();
  if (!pending) return false;
  try { window.sessionStorage.removeItem(localKeys.pendingIntent); } catch (error) { /* ignore */ }
  const detailName = sites.some(site => site.name === pending.detailName) ? pending.detailName : null;
  if (Array.isArray(pending.navigationHistory)) detailNavigationHistory.splice(0, detailNavigationHistory.length, ...pending.navigationHistory);
  if (detailName) {
    isRestoringDetailState = true;
    window.openDetail(detailName);
    isRestoringDetailState = false;
  } else {
    window.switchToTab?.(["websites", "updates", "account"].includes(pending.tabName) ? pending.tabName : "websites", { scroll: false });
  }
  requestAnimationFrame(() => {
    window.scrollTo({ top: Number(pending.scrollY || 0), left: 0, behavior: "auto" });
    const intent = pending.intent || {};
    if (intent.type === "review" && detailName) window.openReviewComposer?.(detailName);
    else if (intent.type === "collection" && detailName) window.openCollectionPicker?.(detailName);
    else if (intent.type === "bookmark" && detailName && !bookmarkedSites.has(detailName)) window.toggleBookmark?.(detailName);
    else if (intent.type === "vote" && intent.reviewId && intent.direction) window.voteReview?.(intent.reviewId, intent.direction);
    else if (intent.type === "request") window.openWebsiteRequest?.();
    showToast(`Returned to continue: ${pending.action}.`);
  });
  return true;
}
window.resumePendingPersonalIntent = resumePendingPersonalIntent;

function requirePersonalSession(action = "use personal features", intent = {}) {
  if (hasPersonalSession()) return true;
  storePendingPersonalIntent(action, intent);
  showToast(`Sign in or continue as Guest to ${action}. You will return here afterward.`, "warning");
  window.switchToTab?.("account");
  return false;
}

function showToast(message, tone = "success") {
  const region = document.getElementById("toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = `toast ${tone}`;
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}
window.showToast = showToast;

function recordLocalVisit(siteName) {
  if (!hasPersonalSession()) return;
  localVisits = [{ name: siteName, visitedAt: new Date().toISOString() }, ...localVisits.filter(entry => entry.name !== siteName)].slice(0, 20);
  persistPersonalState();
}

/* P-097 — Team "Mark Under Review" = real maintenance for that website: users cannot use it. */
function teamSiteOverrideStatus(name) {
  try { return ((JSON.parse(window.localStorage.getItem("paragonTeamWebsites.overrides.v1") || "null") || {})[name] || {}).status || null; }
  catch (error) { return null; }
}
window.siteUnderReviewMaintenance = function(name) { return teamSiteOverrideStatus(name) === "review"; };

/* P-097 — every DISPLAYED review count is REAL user-written reviews only; the inherited
   catalogue sample arrays never surface as counts anywhere (D-162 completed end-to-end). */
function realReviewCount(siteOrName) {
  const name = typeof siteOrName === "string" ? siteOrName : siteOrName?.name;
  return name ? (localReviews[name] || []).length : 0;
}
function getCombinedReviews(site) {
  // P-076 — inherited sample reviews are RETIRED from public display; only real user-written reviews count.
  return getUserReviews(site.name).map(review => ({ ...review, isUser: true }));
}

/* P-076 — real rating: average of user-written reviews, or null when none exist yet. */
function realSiteRating(site) {
  const userReviews = getUserReviews(site.name);
  if (!userReviews.length) return null;
  return Math.round((userReviews.reduce((sum, review) => sum + (Number(review.stars) || 0), 0) / userReviews.length) * 10) / 10;
}
function ratingLabel(site) {
  const rating = realSiteRating(site);
  return rating ? `⭐ ${rating}` : "⭐ New";
}

function getUserReviews(siteName) {
  const value = localReviews[siteName];
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
}

function normalizeStoredReviews(raw) {
  const result = {};
  Object.entries(raw || {}).forEach(([siteName, value]) => {
    const list = (Array.isArray(value) ? value : value ? [value] : [])
      .filter(review => review && typeof review === "object")
      .map((review, index) => ({
        id: review.id || `local-${Date.parse(review.date || "") || Date.now()}-${index}`,
        name: review.name || "You",
        date: review.date || new Date().toISOString(),
        stars: Number(review.stars) || 0,
        text: String(review.text || "")
      }));
    if (list.length) result[siteName] = list;
  });
  return result;
}

function mergeStoredReviews(accountReviews, guestReviews) {
  const merged = normalizeStoredReviews(accountReviews);
  Object.entries(normalizeStoredReviews(guestReviews)).forEach(([siteName, list]) => {
    const existing = merged[siteName] || [];
    const known = new Set(existing.map(review => review.id));
    merged[siteName] = [...existing, ...list.filter(review => !known.has(review.id))];
  });
  return merged;
}

function reviewVoteKey(siteName, review, index) {
  return `${siteName}:${review.isUser ? "user" : "archive"}:${review.isUser && review.id ? review.id : index}:${review.name}`;
}

window.voteReview = function(reviewId, direction) {
  if (!requirePersonalSession("vote on reviews", { type: "vote", reviewId, direction })) return;
  const next = direction === "up" ? 1 : -1;
  reviewVotes[reviewId] = reviewVotes[reviewId] === next ? 0 : next;
  persistPersonalState();
  renderReviewCards();
};

/* P-097 — AUTO DAY/NIGHT: with no manual choice, Paragon follows the clock (06:00–18:00
   light, otherwise dark) and re-checks every 10 minutes WITHOUT any user action. A manual
   toggle writes an explicit preference that always wins. */
const THEME_MODE_KEY = "paragonArchive.themeMode.v2";
function autoThemeForNow() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}
function effectiveThemePreference() {
  let manual = null;
  try { manual = window.sessionStorage.getItem(localKeys.theme) || window.localStorage.getItem(localKeys.theme) || null; } catch (error) { manual = null; }
  let mode = "auto";
  try { mode = window.localStorage.getItem(THEME_MODE_KEY) || "auto"; } catch (error) { mode = "auto"; }
  return mode === "manual" && manual ? manual : autoThemeForNow();
}
function applySavedTheme() {
  document.documentElement.classList?.toggle("light", effectiveThemePreference() === "light");
  try { window.localStorage.setItem(THEME_MODE_KEY, window.localStorage.getItem(THEME_MODE_KEY) || "auto"); } catch (error) { /* blocked */ }
}
applySavedTheme();
if (typeof window.setInterval === "function") {
  window.setInterval(() => {
    /* auto mode keeps following the clock silently; manual choices are never overridden */
    let mode = "auto";
    try { mode = window.localStorage.getItem(THEME_MODE_KEY) || "auto"; } catch (error) { mode = "auto"; }
    if (mode === "auto") document.documentElement.classList?.toggle("light", autoThemeForNow() === "light");
  }, 10 * 60 * 1000);
}

function syncTopThemeButton() {
  const button = document.getElementById("theme-toggle-btn");
  if (!button) return;
  const light = document.documentElement.classList.contains("light");
  const moon = button.querySelector(".theme-moon-icon");
  const sun = button.querySelector(".theme-sun-icon");
  if (moon) { moon.hidden = !light; moon.style.display = light ? "block" : "none"; }
  if (sun) { sun.hidden = light; sun.style.display = light ? "none" : "block"; }
  button.dataset.theme = light ? "light" : "dark";
  button.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  button.setAttribute("title", light ? "Dark mode" : "Light mode");
}

window.toggleTopTheme = function() {
  const currentlyLight = document.documentElement.classList.contains("light");
  window.toggleDark({ checked: currentlyLight });
};

function getCategoryColor(name) {
  const map = {
    Tools: "#3b82f6",
    Productivity: "#6366f1",
    Creative: "#f97316",
    Education: "#0ea5e9",
    Games: "#f59e0b",
    Social: "#8b5cf6",
    Media: "#ec4899",
    Entertainment: "#ec4899",
    Finance: "#14b8a6",
    Health: "#ef4444",
    Lifestyle: "#84cc16",
    "Dev Tools": "#10b981",
    Originals: "#eab308",
    Deployed: "#7c3aed"
  };
  return map[name] || "#a855f7";
}


/* P-073 — HONEST artwork tiles: replaces external picsum.photos placeholder photos.
   Deterministic SVG built ONLY from real catalogue data (category color + the site's own icon).
   No fake screenshots — a branded tile until each real website ships real imagery. */
function paragonTile(name, w = 400, h = 240, label = "") {
  const siteRecord = sites.find(entry => entry.name === name) || {};
  const color = siteRecord.color || getCategoryColor(siteRecord.category || "");
  const icon = siteRecord.icon || "◈";
  const fontSize = Math.round(Math.min(w, h) * 0.32);
  const safeLabel = String(label).replace(/[<>&"]/g, "");
  const labelMarkup = safeLabel ? `<text x="50%" y="90%" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-weight="600" font-size="${Math.max(11, Math.round(h * 0.05))}" fill="rgba(255,255,255,0.6)">${safeLabel}</text>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#0e0e16"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="rgba(8,8,14,0.38)"/><text x="${Math.round(w*0.94)}" y="${Math.round(h*0.16)}" text-anchor="end" font-size="${Math.max(10, Math.round(h*0.07))}" fill="rgba(255,255,255,0.28)">◈</text><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}">${icon}</text>${labelMarkup}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const categoryFamilies = {
  Productivity: ["Tools", "Productivity"],
  Creative: ["Creative"],
  Education: ["Education"],
  Games: ["Games"],
  Social: ["Social"],
  Entertainment: ["Media", "Entertainment"],
  Finance: ["Finance"],
  Lifestyle: ["Health", "Lifestyle"],
  Development: ["Dev Tools"],
  Originals: ["Originals"],
  Deployed: ["Deployed"]
};

const categoryDefinitions = [
  { icon: "🛠️", name: "Tools", color: "#3b82f6" },
  { icon: "⚡", name: "Productivity", color: "#6366f1" },
  { icon: "🎨", name: "Creative", color: "#f97316" },
  { icon: "📚", name: "Education", color: "#0ea5e9" },
  { icon: "🎮", name: "Games", color: "#f59e0b" },
  { icon: "💬", name: "Social", color: "#8b5cf6" },
  { icon: "🎵", name: "Media", color: "#ec4899" },
  { icon: "🎧", name: "Entertainment", color: "#ec4899" },
  { icon: "💰", name: "Finance", color: "#14b8a6" },
  { icon: "🍎", name: "Health", color: "#ef4444" },
  { icon: "👗", name: "Lifestyle", color: "#84cc16" },
  { icon: "💻", name: "Dev Tools", color: "#10b981" },
  { icon: "🌟", name: "Originals", color: "#eab308" },
  { icon: "🚀", name: "Deployed", color: "#7c3aed", status: "planned" }
];

function getCategoryFamily(category) {
  return Object.keys(categoryFamilies).find(family => categoryFamilies[family].includes(category)) || category;
}

function getRelatedSites(site, limit = 4) {
  const family = getCategoryFamily(site.category);
  return sites
    .filter(other => other.name !== site.name && getCategoryFamily(other.category) === family)
    .slice(0, limit);
}

function getSiteScreenshots(site) {
  const base = site.name.replace(/\s/g, "");
  const states = [
    ["Home", "home"],
    ["Dashboard", "dashboard"],
    ["Primary feature", "feature"],
    ["Mobile state", "mobile"],
    ["Settings", "settings"]
  ];
  return states.map(([label, seed], index) => ({
    src: paragonTile(site.name, 720, 1024, label),
    thumb: paragonTile(site.name, 360, 510, label),
    label: `${site.name} — ${label}`,
    index
  }));
}

function getSiteTags(site) {
  const text = `${site.name} ${site.category} ${site.tag || ""} ${site.desc || ""} ${site.about || ""} ${(site.updates || []).join(" ")}`.toLowerCase();
  const tags = [site.name.replace(/^Paragon\s+/i, ""), site.category, site.tag];
  const rules = [
    [/note|journal|resume|script|writing/, "Writing"],
    [/productiv|organize|planner|planning/, "Productivity"],
    [/dark mode|dark\/light/, "Dark Mode"],
    [/collaborat|team|friends|multiplayer/, "Collaboration"],
    [/artificial intelligence|\bai\b|powered q&a/, "AI"],
    [/color|palette|contrast/, "Color"],
    [/accessib/, "Accessibility"],
    [/music|sound|audio|noise/, "Audio"],
    [/exam|test|course|lesson|homework|education/, "Learning"],
    [/finance|invest|portfolio|budget|wealth/, "Finance"],
    [/game|chess|survival|adventure/, "Games"],
    [/deploy|code|developer|hosting|static website/, "Developer Tools"],
    [/mood|wellness|health|journal/, "Wellness"],
    [/event|rsvp|social|sharing|confession/, "Community"]
  ];
  rules.forEach(([pattern, tag]) => { if (pattern.test(text)) tags.push(tag); });
  return [...new Set(tags.filter(Boolean).map(tag => String(tag).trim()))].slice(0, 7);
}

function getVersionHistory(site) {
  const currentDateMatch = String(site.version || "").match(/—\s*(.+)$/);
  const currentDate = currentDateMatch && !/new/i.test(currentDateMatch[1]) ? currentDateMatch[1] : formatAddedDate(site).replace(/^Added\s+/, "");
  const current = { version: site.version?.split(" — ")[0] || "Current", date: currentDate, changes: site.updates || [] };
  const archiveEntry = { version: "Archive entry", date: formatAddedDate(site).replace(/^Added\s+/, ""), changes: [`Added to ${site.category}`, site.desc] };
  return [current, archiveEntry].filter((entry, index, list) => index === 0 || entry.date !== list[0].date || entry.version !== list[0].version);
}

function ratingBreakdownMarkup(site, reviews) {
  const counts = [0, 0, 0, 0, 0, 0];
  reviews.forEach(review => { const stars = Math.max(1, Math.min(5, Math.round(Number(review.stars) || 0))); counts[stars] += 1; });
  const total = reviews.length;
  const reviewAverage = total ? reviews.reduce((sum, review) => sum + Number(review.stars || 0), 0) / total : 0;
  const rating = reviewAverage; // P-076 — real reviews only
  return `<div class="rating-summary-layout"><div class="rating-summary-main"><strong class="rating-big">${rating.toFixed(1)}</strong>${starRatingMarkup(rating)}<span>${total} review${total === 1 ? "" : "s"}</span></div><div class="rating-breakdown" data-rating-breakdown>${[5,4,3,2,1].map(stars => { const percent = total ? Math.round(counts[stars] / total * 100) : 0; return `<div class="rating-breakdown-row"><span>${stars} ★</span><span class="rating-bar"><span class="rating-bar-fill" style="--rating-width:${percent}%"></span></span><span>${percent}%</span></div>`; }).join("")}</div></div>`;
}

function reviewTimestamp(review) {
  if (!review.date) return 0;
  let date = new Date(review.date);
  if (Number.isNaN(date.getTime())) date = new Date(`${review.date}, 2026`);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function reviewDisplayDate(review) {
  const timestamp = reviewTimestamp(review);
  return timestamp ? new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Date unavailable";
}

function reviewViewModels(site) {
  return getCombinedReviews(site).map((review, reviewIndex) => {
    const voteKey = reviewVoteKey(site.name, review, reviewIndex);
    const currentVote = Number(reviewVotes[voteKey] || 0);
    // D-109: helpful/not-helpful counts are real personal votes only — no seeded/made-up numbers, now or in the future.
    const upvotes = currentVote === 1 ? 1 : 0;
    const downvotes = currentVote === -1 ? 1 : 0;
    return { review, reviewIndex, voteKey, currentVote, upvotes, downvotes, helpfulScore: upvotes - downvotes, timestamp: reviewTimestamp(review) };
  });
}

function filteredReviewModels(site) {
  let models = reviewViewModels(site);
  if (reviewStarFilter !== "all") models = models.filter(model => Math.round(Number(model.review.stars)) === Number(reviewStarFilter));
  const term = String(reviewSearchTerm || "").trim().toLowerCase();
  if (term) models = models.filter(model =>
    String(model.review.text || "").toLowerCase().includes(term) ||
    String(model.review.name || "").toLowerCase().includes(term) ||
    String(model.review.stars) === term
  );
  models.sort((first, second) => {
    if (reviewSortMode === "helpful") return second.helpfulScore - first.helpfulScore || second.timestamp - first.timestamp;
    if (reviewSortMode === "highest") return Number(second.review.stars) - Number(first.review.stars) || second.timestamp - first.timestamp;
    if (reviewSortMode === "lowest") return Number(first.review.stars) - Number(second.review.stars) || second.timestamp - first.timestamp;
    return second.timestamp - first.timestamp;
  });
  return models;
}

function reviewCardsMarkup(site, suppliedModels = null) {
  const models = suppliedModels || filteredReviewModels(site).slice(reviewPageIndex * reviewPageSize, reviewPageIndex * reviewPageSize + reviewPageSize);
  if (!models.length) return `<div class="detail-empty-state"><strong>No matching reviews</strong><span>Try another star filter or write the first review.</span></div>`;
  return models.map(model => {
    const review = model.review;
    const initials = String(review.name || "U").split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
    return `<article class="review-card"><div class="review-card-head"><span class="review-avatar" aria-hidden="true">${escapeHTML(initials)}</span><span class="review-identity"><strong>${escapeHTML(review.name)}${review.isUser ? '<span class="user-review-label">Your review</span>' : ''}</strong><small>${reviewDisplayDate(review)}</small></span><span class="review-stars">${'★'.repeat(review.stars)}</span></div><p>“${escapeHTML(review.text)}”</p><div class="review-card-footer"><div class="review-vote-row"><button type="button" class="review-vote ${model.currentVote === 1 ? "active" : ""}" onclick="voteReview('${escapeHTML(model.voteKey)}', 'up')" aria-pressed="${model.currentVote === 1}">👍 Helpful ${model.upvotes}</button><button type="button" class="review-vote down ${model.currentVote === -1 ? "active" : ""}" onclick="voteReview('${escapeHTML(model.voteKey)}', 'down')" aria-pressed="${model.currentVote === -1}">👎 Not helpful ${model.downvotes}</button></div>${review.isUser ? `<div class="review-actions"><button type="button" onclick="openReviewComposer('${site.name}', '${escapeHTML(review.id || "")}')">Edit</button><button type="button" class="danger" onclick="deleteLocalReview('${site.name}', '${escapeHTML(review.id || "")}')">Delete</button></div>` : ''}</div></article>`;
  }).join("");
}

function renderReviewCards() {
  const site = sites.find(item => item.name === currentDetailName);
  const container = document.getElementById("reviews-list");
  if (!site || !container) return [];
  const models = filteredReviewModels(site);
  const totalPages = Math.max(1, Math.ceil(models.length / reviewPageSize));
  reviewPageIndex = Math.max(0, Math.min(reviewPageIndex, totalPages - 1));
  const start = reviewPageIndex * reviewPageSize;
  const visible = models.slice(start, start + reviewPageSize);
  container.innerHTML = reviewCardsMarkup(site, visible);
  const pagination = document.getElementById("review-pagination");
  const previous = document.getElementById("review-previous");
  const next = document.getElementById("review-view-more");
  const status = document.getElementById("review-pagination-status");
  const hasPrevious = reviewPageIndex > 0;
  const hasNext = reviewPageIndex < totalPages - 1;
  if (pagination) pagination.hidden = !hasPrevious && !hasNext;
  if (previous) previous.hidden = !hasPrevious;
  if (next) next.hidden = !hasNext;
  if (status) status.textContent = models.length ? `Reviews ${start + 1}–${start + visible.length} of ${models.length}` : "No matching reviews";
  return models;
}

window.applyReviewFilters = function() {
  reviewSortMode = document.getElementById("review-sort")?.value || "recent";
  reviewStarFilter = document.getElementById("review-star-filter")?.value || "all";
  reviewSearchTerm = document.getElementById("review-search")?.value || "";
  reviewPageIndex = 0;
  renderReviewCards();
};
window.showMoreReviews = function() {
  reviewPageIndex += 1;
  renderReviewCards();
  document.getElementById("reviews-section")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
};
window.showPreviousReviews = function() {
  reviewPageIndex = Math.max(0, reviewPageIndex - 1);
  renderReviewCards();
  document.getElementById("reviews-section")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
};

function setupRatingBreakdownAnimation() {
  const breakdown = document.querySelector("[data-rating-breakdown]");
  if (!breakdown) return;
  const reveal = () => breakdown.classList.add("bars-visible");
  if ("IntersectionObserver" in window && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { reveal(); observer.disconnect(); }
    }, { threshold: 0.25 });
    observer.observe(breakdown);
  } else reveal();
}

function makeGrad(id, color) {
  return `linear-gradient(135deg, ${color}22, ${color}66), linear-gradient(45deg, #1a1a24, #121218)`;
}

let rankingRefreshTimer = null;
function scheduleRankingRefresh() {
  clearTimeout(rankingRefreshTimer);
  const now = new Date();
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  rankingRefreshTimer = setTimeout(() => {
    renderHero();
    renderTrending();
    renderStaffPicks();
    if (document.getElementById("trending-overlay")?.classList.contains("active")) renderFullTrendingList();
    if (document.getElementById("staff-overlay")?.classList.contains("active")) renderFullStaffPickList();
    scheduleRankingRefresh();
  }, Math.max(1000, nextDay.getTime() - now.getTime()));
}

/* --- Init --- */
document.addEventListener("DOMContentLoaded", () => {
  if (applyPlatformMaintenanceLockdown()) return; /* P-097 — whole-platform maintenance outranks everything */
  if (new URLSearchParams(window.location.search).get("install") === "1") window.setTimeout(() => window.openParagonInstall?.(), 2600); /* P-097 — shared install link */
  showWelcomeSplash(); // P-096 — splash opens FIRST, instantly, before identity/auth resolves (bug fix)
  try { bumpDayStreak(); } catch (_) { /* identity may still settle */ }
  // D-109 achievement engagement hooks: Hub visits and Paragon AI questions.
  document.addEventListener("click", event => {
    const link = event.target?.closest?.('a[href*="paragon-archive-hub.html"]');
    if (!link || !hasPersonalSession()) return;
    accountProfile.hubVisitCount = Number(accountProfile.hubVisitCount || 0) + 1;
    persistPersonalState();
  });
  document.addEventListener("submit", event => {
    if (event.target?.id !== "paragon-ai-form" || !hasPersonalSession()) return;
    accountProfile.aiQuestionCount = Number(accountProfile.aiQuestionCount || 0) + 1;
    persistPersonalState();
    renderAchievementsAccount();
  });
  renderHero();
  renderCategories();
  renderTrending();
  scheduleRankingRefresh();
  renderStaffPicks();
  renderRecentlyAdded();
  renderUpdates();
  fetchLiveAnnouncements(); // P-094 — pull managed announcements from the live backend (silent, cached fallback)
  fetchPublicCoinConfig(); // P-101 — silent; applies economy when SQL phase1b is live
  renderAccount();
  bindNav();
  bindUpdateFilters();
  bindSearch();
  bindTrendingOverlay();
  bindStaffOverlay();
  bindRecentOverlay();
  bindCategoryOverlay();
  bindTopIcons();
  bindReviewComposer();
  bindAuthControls();
  bindCollectionComposer();
  bindCollectionView();
  bindWebsiteRequest();
  bindWebsiteQR();
  bindAchievementsAbout();
  bindSitePreview();
  bindScreenshotLightbox();
  bindGlobalUI();
  bindGuestLifecycle();
  bindScrollColor();
  openInitialSiteRoute();
  initializeIdentity();
});

/* --- Hero Slider --- */
let heroIndex = 0;
let heroTimer = null;
let heroSites = [];
let heroPointerStartX = null;

function startHeroTimer() {
  clearInterval(heroTimer);
  if (heroSites.length < 2) return;
  heroTimer = setInterval(() => setHeroIndex(heroIndex + 1, false), 6000);
}

function setHeroIndex(index, restartTimer = true) {
  if (!heroSites.length) return;
  heroIndex = (Number(index) + heroSites.length) % heroSites.length;
  document.querySelectorAll(".hero-slide").forEach((slide, slideIndex) => {
    const isActive = slideIndex === heroIndex;
    slide.classList.toggle("active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });
  document.querySelectorAll("#hero-dots .dot").forEach((dot, dotIndex) => {
    const isActive = dotIndex === heroIndex;
    dot.classList.toggle("active", isActive);
    dot.setAttribute("aria-current", isActive ? "true" : "false");
  });
  if (restartTimer) startHeroTimer();
}

function moveHero(direction) {
  setHeroIndex(heroIndex + direction, true);
}

function bindHeroControls() {
  const section = document.getElementById("hero-section");
  const previous = document.getElementById("hero-prev");
  const next = document.getElementById("hero-next");
  if (!section || section.dataset.controlsBound === "true") return;
  section.dataset.controlsBound = "true";

  previous?.addEventListener("click", () => moveHero(-1));
  next?.addEventListener("click", () => moveHero(1));

  section.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveHero(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveHero(1);
    }
  });

  section.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest("a, button")) return;
    heroPointerStartX = event.clientX;
    section.classList.add("is-dragging");
    section.setPointerCapture?.(event.pointerId);
  });

  section.addEventListener("pointerup", event => {
    if (heroPointerStartX === null) return;
    const distance = event.clientX - heroPointerStartX;
    heroPointerStartX = null;
    section.classList.remove("is-dragging");
    section.releasePointerCapture?.(event.pointerId);
    if (Math.abs(distance) < 45) return;
    moveHero(distance < 0 ? 1 : -1);
  });

  section.addEventListener("pointercancel", () => {
    heroPointerStartX = null;
    section.classList.remove("is-dragging");
  });
}

function renderHero() {
  const hero = document.getElementById("hero-inner");
  const dots = document.getElementById("hero-dots");
  if (!hero || !dots) return;
  heroSites = pickHeroSites();
  heroIndex = 0;

  hero.innerHTML = heroSites.map((site, index) => `
    <div class="hero-slide ${index === 0 ? "active" : ""}" data-i="${index}" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${heroSites.length}: ${site.name}" aria-hidden="${index !== 0}">
      <div style="position:absolute;inset:0;background:${makeGrad(index, site.color)};z-index:0;"></div>
      <img class="hero-banner-img" src="${heroBannerFor(site)}" alt="" loading="eager"><div class="hero-copy-veil"></div>
      <span class="wotd-badge">🌟 WEBSITE OF THE DAY</span>
      <span class="wotd-views" data-wotd-views="${site.name}">👁 ${formatSiteViews(site)} views</span>
      <div class="grad"></div>
      <div class="hero-content hero-content-v2">
        <h1>${site.name}</h1>
        <p>${site.desc}</p>
        <a href="#" class="cta-btn cta-btn-v2" onclick="openDetail('${site.name}'); return false;">OPEN</a>
      </div>
    </div>
  `).join("");

  dots.innerHTML = heroSites.map((site, index) => `
    <button class="dot ${index === 0 ? "active" : ""}" type="button" onclick="setHero(${index})" aria-label="Show ${site.name}" aria-current="${index === 0 ? "true" : "false"}"></button>`).join("");

  bindHeroControls();
  startHeroTimer();
}

window.setHero = function(index) {
  setHeroIndex(index, true);
};

/* --- Categories --- */
/* P-073 — real category icon art (owner list §1.2 #9); emoji stays as fallback for categories without art yet. */
/* P-074 — real site icon art (owner §2 specs); emoji fallback until each icon is produced. Icon art is branding, allowed pre-build (D-153). */
const SITE_ICON_ART = {
  "Paragon Quiz": "assets/site-icons/paragon-quiz.png",
  "Paragon Archive Hub": "assets/brand/logo-mark.png",
  "Paragon Notes": "assets/site-icons/paragon-notes.png",
  "Paragon Tasks": "assets/site-icons/paragon-tasks.png",
  "Paragon Calendar": "assets/site-icons/paragon-calendar.png",
  "Paragon Clock": "assets/site-icons/paragon-clock.png",
  "Paragon Calc": "assets/site-icons/paragon-calc.png",
  "Paragon Dictionary": "assets/site-icons/paragon-dictionary.png",
  "Paragon Files": "assets/site-icons/paragon-files.png",
  "Paragon Paste": "assets/site-icons/paragon-paste.png",
  "Paragon QR": "assets/site-icons/paragon-qr.png",
  "Paragon Password": "assets/site-icons/paragon-password.png",
  "Paragon Resume": "assets/site-icons/paragon-resume.png",
  "Paragon Bookmarks": "assets/site-icons/paragon-bookmarks.png",
  "Paragon Contacts": "assets/site-icons/paragon-contacts.png",
  "Paragon Canvas": "assets/site-icons/paragon-canvas.png",
  "Paragon Design": "assets/site-icons/paragon-design.png",
  "Paragon Color": "assets/site-icons/paragon-color.png",
  "Paragon Icons": "assets/site-icons/paragon-icons.png",
  "Paragon Fonts": "assets/site-icons/paragon-fonts.png",
  "Paragon Photo": "assets/site-icons/paragon-photo.png",
  "Paragon Meme": "assets/site-icons/paragon-meme.png",
  "Paragon Mood": "assets/site-icons/paragon-mood.png",
  "Paragon Whiteboard": "assets/site-icons/paragon-whiteboard.png",
  "Paragon Palette": "assets/site-icons/paragon-palette.png",
  "Paragon Learn": "assets/site-icons/paragon-learn.png",
  "Paragon Flash": "assets/site-icons/paragon-flash.png",
  "Paragon Math": "assets/site-icons/paragon-math.png",
  "Paragon Code": "assets/site-icons/paragon-code.png",
  "Paragon Type": "assets/site-icons/paragon-type.png",
  "Paragon Language": "assets/site-icons/paragon-language.png",
  "Paragon Kids": "assets/site-icons/paragon-kids.png",
  "Paragon Debate": "assets/site-icons/paragon-debate.png",
  "Paragon Mind": "assets/site-icons/paragon-mind.png",
  "Paragon Exam": "assets/site-icons/paragon-exam.png",
  "Paragon Chat": "assets/site-icons/paragon-chat.png",
  "Paragon Forum": "assets/site-icons/paragon-forum.png",
  "Paragon Poll": "assets/site-icons/paragon-poll.png",
  "Paragon Meet": "assets/site-icons/paragon-meet.png",
  "Paragon Wall": "assets/site-icons/paragon-wall.png",
  "Paragon Connect": "assets/site-icons/paragon-connect.png",
  "Paragon Feed": "assets/site-icons/paragon-feed.png",
  "Paragon Collab": "assets/site-icons/paragon-collab.png",
  "Paragon Confess": "assets/site-icons/paragon-confess.png",
  "Paragon Events": "assets/site-icons/paragon-events.png",
  "Paragon Music": "assets/site-icons/paragon-music.png",
  "Paragon Radio": "assets/site-icons/paragon-radio.png",
  "Paragon Beats": "assets/site-icons/paragon-beats.png",
  "Paragon Watch": "assets/site-icons/paragon-watch.png",
  "Paragon Read": "assets/site-icons/paragon-read.png",
  "Paragon Comics": "assets/site-icons/paragon-comics.png",
  "Paragon Anime": "assets/site-icons/paragon-anime.png",
  "Paragon Movie": "assets/site-icons/paragon-movie.png",
  "Paragon Podcast": "assets/site-icons/paragon-podcast.png",
  "Paragon Stories": "assets/site-icons/paragon-stories.png",
  "Paragon Mixes": "assets/site-icons/paragon-mixes.png",
  "Paragon Sounds": "assets/site-icons/paragon-sounds.png",
  "Paragon Theater": "assets/site-icons/paragon-theater.png",
  "Paragon Puzzle": "assets/site-icons/paragon-puzzle.png",
  "Paragon Chess": "assets/site-icons/paragon-chess.png",
  "Paragon Cards": "assets/site-icons/paragon-cards.png",
  "Paragon Trivia": "assets/site-icons/paragon-trivia.png",
  "Paragon Arcade": "assets/site-icons/paragon-arcade.png",
  "Paragon Race": "assets/site-icons/paragon-race.png",
  "Paragon RPG": "assets/site-icons/paragon-rpg.png",
  "Paragon Draw": "assets/site-icons/paragon-draw.png",
  "Paragon Spin": "assets/site-icons/paragon-spin.png",
  "Paragon Bet": "assets/site-icons/paragon-bet.png",
  "Paragon Survival": "assets/site-icons/paragon-survival.png",
  "Paragon Budget": "assets/site-icons/paragon-budget.png",
  /* P-094 — site icons #70–79 (10/10 this turn): Finance & Business + Lifestyle & Health */
  "Paragon Invoice": "assets/site-icons/paragon-invoice.png",
  "Paragon Crypto": "assets/site-icons/paragon-crypto.png",
  "Paragon Stocks": "assets/site-icons/paragon-stocks.png",
  "Paragon Shop": "assets/site-icons/paragon-shop.png",
  "Paragon Invest": "assets/site-icons/paragon-invest.png",
  "Paragon Receipt": "assets/site-icons/paragon-receipt.png",
  "Paragon Recipe": "assets/site-icons/paragon-recipe.png",
  "Paragon Fit": "assets/site-icons/paragon-fit.png",
  "Paragon Sleep": "assets/site-icons/paragon-sleep.png",
  "Paragon Mental": "assets/site-icons/paragon-mental.png",
  /* P-096 — site icons #80–99 (20 this pair of turns): the set is COMPLETE —
     #100 (Paragon Archive Hub) reuses the official brand logo-mark (D-154). */
  "Paragon Habits": "assets/site-icons/paragon-habits.png",
  "Paragon Travel": "assets/site-icons/paragon-travel.png",
  "Paragon Weather": "assets/site-icons/paragon-weather.png",
  "Paragon Wardrobe": "assets/site-icons/paragon-wardrobe.png",
  "Paragon Journal": "assets/site-icons/paragon-journal.png",
  "Paragon Tutor": "assets/site-icons/paragon-tutor.png",
  "Paragon Quotes": "assets/site-icons/paragon-quotes.png",
  "Paragon Countdown": "assets/site-icons/paragon-countdown.png",
  "Paragon Dev Tools": "assets/site-icons/paragon-devtools.png",
  "Paragon Speed": "assets/site-icons/paragon-speed.png",
  "Paragon Domain": "assets/site-icons/paragon-domain.png",
  "Paragon SEO": "assets/site-icons/paragon-seo.png",
  "Paragon Deploy": "assets/site-icons/paragon-deploy.png",
  "Paragon Contrast": "assets/site-icons/paragon-contrast.png",
  "Paragon Markdown": "assets/site-icons/paragon-markdown.png",
  "Paragon Snippets": "assets/site-icons/paragon-snippets.png",
  "Paragon Random": "assets/site-icons/paragon-random.png",
  "Paragon Time Capsule": "assets/site-icons/paragon-timecapsule.png",
  "Paragon Vibe": "assets/site-icons/paragon-vibe.png",
  "Paragon Alive": "assets/site-icons/paragon-alive.png"
};
function siteIconMarkup(site, className = "site-icon-art") {
  if (!site) return "";
  const art = SITE_ICON_ART[site.name];
  return art ? `<img class="${className}" src="${art}" alt="" loading="lazy">` : (site.icon || "◈");
}
/* P-093 — full cinematic banner set: every category + default (concept art per D-153) */
const HERO_BANNERS = { Tools: "tools", Productivity: "productivity", Creative: "creative", Education: "education", Games: "games", Social: "social", Media: "media", Entertainment: "entertainment", Finance: "finance", Health: "health", Lifestyle: "lifestyle", "Dev Tools": "dev-tools", Originals: "originals", Deployed: "deployed" };
function heroBannerFor(site) { return `assets/hero-banners/${HERO_BANNERS[site.category] || "default"}.jpg`; }

const CATEGORY_ICON_ART = { "Tools": "tools", "Productivity": "productivity", "Creative": "creative", "Education": "education", "Games": "games", "Social": "social", "Media": "media", "Entertainment": "entertainment", "Finance": "finance", "Health": "health", "Lifestyle": "lifestyle", "Dev Tools": "dev-tools", "Originals": "originals", "Deployed": "deployed" };
function renderCategories() {
  const container = document.getElementById("cat-scroll");
  if (!container) return;
  container.innerHTML = categoryDefinitions.map(c => `
    <a href="#" class="cat-chip" onclick="filterCategory('${c.name}'); return false;" style="border-color:${c.color}22;">
      <span class="emoji">${CATEGORY_ICON_ART[c.name] ? `<img class="cat-icon-img" src="assets/category-icons/${CATEGORY_ICON_ART[c.name]}.png" alt="" loading="lazy">` : c.icon}</span>
      <span class="label">${c.name}</span>
      ${c.status === "planned" ? `<span class="category-status">Planned</span>` : ""}
    </a>
  `).join("");
}
window.filterCategory = function(name) {
  document.querySelectorAll(".cat-chip").forEach(chip => {
    const isActive = chip.querySelector(".label")?.textContent === name;
    chip.classList.toggle("active", isActive);
  });
  window.openCategoryOverlay(name);
};

/* --- Trending --- */
let trendingReturnFocus = null;

function getWeeklyTrendingEntries() {
  if (siteMetrics) return siteMetrics.getWeeklyRankingEntries();
  return sites.map((site, index) => ({
    site,
    name: site.name,
    totalViews: 0,
    rating: realSiteRating(site) || 0,
    reviewCount: 0, // P-097 — real counts come from realReviewCount() at display time
    score: sites.length - index
  }));
}

/* P-096/P-097 — ICON-FACED CARDS: when real icon art exists it IS the card face (the old
   gradient tile is retired for those sites); paragonTile stays only as the honest fallback. */
function cardFace(name, className = "thumb-icon-face") {
  return SITE_ICON_ART[name]
    ? `<img class="${className}" src="${SITE_ICON_ART[name]}" alt="" loading="lazy">`
    : `<img src="${paragonTile(name, 400, 240)}" alt="" loading="lazy">`;
}
function siteIconChip(name, className = "thumb-icon-chip") {
  return SITE_ICON_ART[name] ? `<img class="${className}" src="${SITE_ICON_ART[name]}" alt="" loading="lazy">` : "";
}
function renderTrending() {
  const container = document.getElementById("trending-row");
  if (!container) return;
  const trending = getWeeklyTrendingEntries().slice(0, 7);
  container.innerHTML = trending.map((entry, index) => {
    const site = entry.site;
    return `
      <a href="#" class="card" onclick="openDetail('${site.name}'); return false;">
        <div class="thumb">${cardFace(site.name)}<span class="badge-trending">🔥 #${index + 1}</span></div>
        <div class="info">
          <div class="name">${site.name}</div>
          <div class="meta trending-meta">
            <span>👁 ${siteMetrics ? siteMetrics.formatViews(entry.totalViews) : entry.totalViews}</span>
            <span class="stars">${ratingLabel(site)}</span>
            <span>💬 ${realReviewCount(entry.site)}</span>
            <span class="cat">${site.category}</span>
          </div>
        </div>
      </a>`;
  }).join("");
}

function renderFullTrendingList() {
  const container = document.getElementById("trending-full-list");
  const weekLabel = document.getElementById("trending-week-label");
  const summary = document.getElementById("trending-summary");
  if (!container) return;
  const entries = getWeeklyTrendingEntries();
  if (weekLabel) weekLabel.textContent = siteMetrics ? siteMetrics.getWeekLabel() : "Current week";
  if (summary) {
    summary.textContent = siteMetrics?.isLocalDemo
      ? "Ranking on this device from real recorded views, ratings, reviews, and last week’s daily featured appearances. Global totals arrive with the analytics backend."
      : "Ranked from views, ratings, reviews, and last week’s daily featured appearances.";
  }

  container.innerHTML = entries.map((entry, index) => {
    const site = entry.site;
    const viewLabel = siteMetrics ? siteMetrics.formatViews(entry.totalViews) : entry.totalViews;
    return `
      <a href="#" class="trending-rank-card" role="listitem" onclick="openDetail('${site.name}'); closeTrendingOverlay(false); return false;">
        <span class="trending-rank-number">#${index + 1}</span>
        <span class="trending-rank-icon" style="background:${site.color}22;color:${site.color};">${SITE_ICON_ART[site.name] ? `<img class="site-icon-art-list" src="${SITE_ICON_ART[site.name]}" alt="">` : site.icon}</span>
        <span class="trending-rank-copy">
          <h3>${site.name}</h3>
          <p>${site.desc}</p>
        </span>
        <span class="trending-rank-stats">
          <span><strong>👁 ${viewLabel}</strong> views</span>
          <span><strong>${ratingLabel(site)}</strong></span>
          <span><strong>💬 ${realReviewCount(entry.site)}</strong> reviews</span>
          
        </span>
      </a>`;
  }).join("");
}

window.openTrendingOverlay = function(shouldFocus = true) {
  const overlay = document.getElementById("trending-overlay");
  if (!overlay) return;
  if (!overlay.classList.contains("active")) trendingReturnFocus = document.activeElement;
  renderFullTrendingList();
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("trending-open");
  if (shouldFocus) requestAnimationFrame(() => document.getElementById("trending-back")?.focus({ preventScroll: true }));
};

window.closeTrendingOverlay = function(restoreFocus = true) {
  const overlay = document.getElementById("trending-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("trending-open");
  if (restoreFocus && trendingReturnFocus?.focus) trendingReturnFocus.focus({ preventScroll: true });
};

function bindTrendingOverlay() {
  const overlay = document.getElementById("trending-overlay");
  overlay?.addEventListener("click", event => {
    if (event.target === overlay) closeTrendingOverlay(true);
  });
  document.addEventListener("keydown", event => {
    if (!overlay?.classList.contains("active")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeTrendingOverlay(true);
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll('button:not([disabled]), a[href]')]
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

/* --- Staff Picks --- */
let staffReturnFocus = null;

function getDailyStaffEntries() {
  if (siteMetrics) return siteMetrics.getDailyStaffPickEntries();
  return [...sites].reverse().map(site => ({
    site,
    name: site.name,
    last24hViews: 0,
    rating: realSiteRating(site) || 0,
    reviewCount: 0, // P-097 — real counts come from realReviewCount() at display time
    totalViews: 0
  }));
}

function renderStaffPicks() {
  const container = document.getElementById("staff-row");
  if (!container) return;
  const picks = getDailyStaffEntries().slice(0, 3);
  const primary = picks[0];
  const smaller = picks.slice(1, 3);
  if (!primary) return;

  container.innerHTML = `
    <div class="staff-picks-layout">
      <a href="#" class="featured-card" role="listitem" onclick="openDetail('${primary.site.name}'); return false;">
        <span class="badge-staff-pick badge-staff-spin">STAFF PICK</span>
        <div class="feat-img"><img class="thumb-icon-face" src="${paragonTile(primary.site.name, 800, 500)}" alt="${primary.site.name}" loading="lazy">${SITE_ICON_ART[primary.site.name] ? `<img class="feat-icon-face" src="${SITE_ICON_ART[primary.site.name]}" alt="" loading="lazy">` : ""}</div>
        <div class="feat-body">
          <h3 class="staff-feat-name">${primary.site.name}</h3>
          <p>${primary.site.desc}</p>
          <div class="row">
            <span class="staff-opportunity-note">👁 ${primary.last24hViews} in 24h</span>
            <span>•</span><span>${ratingLabel(primary.site)}</span>
            <span>•</span><span>💬 ${realReviewCount(primary.site)}</span>
          </div>
        </div>
      </a>
      <div class="staff-mini-grid" role="list" aria-label="More daily Staff Picks">
        ${smaller.map((entry, index) => `
          <a href="#" class="staff-mini-card" role="listitem" onclick="openDetail('${entry.site.name}'); return false;">
            <span class="staff-mini-thumb">${SITE_ICON_ART[entry.site.name] ? `<img class="site-icon-art-list staff-mini-appicon staff-mini-face" src="${SITE_ICON_ART[entry.site.name]}" alt="" loading="lazy">` : `<img src="${paragonTile(entry.site.name, 420, 260)}" alt="${entry.site.name}" loading="lazy">`}</span>
            <span class="staff-mini-body">
              <span class="staff-mini-label">Staff Pick #${index + 2}</span>
              <h4>${entry.site.name}</h4>
              <p>${entry.site.desc}</p>
              <span class="staff-mini-stats">
                <span>👁 ${entry.last24hViews}</span><span>${ratingLabel(entry.site)}</span><span>💬 ${realReviewCount(entry.site)}</span>
              </span>
            </span>
          </a>`).join("")}
      </div>
    </div>`;
}

function renderFullStaffPickList() {
  const container = document.getElementById("staff-full-list");
  const dayLabel = document.getElementById("staff-day-label");
  const summary = document.getElementById("staff-summary");
  if (!container) return;
  const entries = getDailyStaffEntries();
  if (dayLabel) {
    dayLabel.textContent = `${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · refreshes daily`;
  }
  if (summary) {
    summary.textContent = siteMetrics?.isLocalDemo
      ? "Opportunity ranking on this device: least viewed in the preceding 24 hours, then lowest rated, least reviewed, and lowest total views."
      : "Opportunity ranking: least viewed in the preceding 24 hours, then lowest rated, least reviewed, and lowest total views.";
  }

  container.innerHTML = entries.map((entry, index) => {
    const site = entry.site;
    return `
      <a href="#" class="trending-rank-card staff-rank-card" role="listitem" onclick="openDetail('${site.name}'); closeStaffOverlay(false); return false;">
        <span class="trending-rank-number">#${index + 1}</span>
        <span class="trending-rank-icon" style="background:${site.color}22;color:${site.color};">${SITE_ICON_ART[site.name] ? `<img class="site-icon-art-list" src="${SITE_ICON_ART[site.name]}" alt="">` : site.icon}</span>
        <span class="trending-rank-copy">
          <h3>${site.name}</h3>
          <p>${site.desc}</p>
        </span>
        <span class="trending-rank-stats">
          <span><strong>👁 ${entry.last24hViews}</strong> in 24h</span>
          <span><strong>${ratingLabel(site)}</strong></span>
          <span><strong>💬 ${realReviewCount(entry.site)}</strong> reviews</span>
          
        </span>
      </a>`;
  }).join("");
}

window.openStaffOverlay = function(shouldFocus = true) {
  const overlay = document.getElementById("staff-overlay");
  if (!overlay) return;
  if (!overlay.classList.contains("active")) staffReturnFocus = document.activeElement;
  renderFullStaffPickList();
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("staff-open");
  if (shouldFocus) requestAnimationFrame(() => document.getElementById("staff-back")?.focus({ preventScroll: true }));
};

window.closeStaffOverlay = function(restoreFocus = true) {
  const overlay = document.getElementById("staff-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("staff-open");
  if (restoreFocus && staffReturnFocus?.focus) staffReturnFocus.focus({ preventScroll: true });
};

function bindStaffOverlay() {
  const overlay = document.getElementById("staff-overlay");
  overlay?.addEventListener("click", event => {
    if (event.target === overlay) closeStaffOverlay(true);
  });
  document.addEventListener("keydown", event => {
    if (!overlay?.classList.contains("active")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeStaffOverlay(true);
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll('button:not([disabled]), a[href]')]
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

/* --- Recently Added --- */
let recentReturnFocus = null;

function getSitesByAddedDate() {
  return [...sites].sort((first, second) =>
    Date.parse(second.addedAt || 0) - Date.parse(first.addedAt || 0) ||
    Number(second.addedSequence || 0) - Number(first.addedSequence || 0) ||
    first.name.localeCompare(second.name)
  );
}

// D-124: Recently Added shows only websites added within the last 7 days, newest first.
function getRecentlyAddedSites(now = new Date()) {
  const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return getSitesByAddedDate().filter(site => {
    const added = Date.parse(site.addedAt || 0);
    return Number.isFinite(added) && added >= cutoff && added <= now.getTime() + 24 * 60 * 60 * 1000;
  });
}

function formatAddedDate(site) {
  const date = new Date(site.addedAt);
  if (Number.isNaN(date.getTime())) return "Addition date pending";
  return `Added ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function recentCardMarkup(site, closeOverlay = false) {
  return `
    <a href="#" class="card recent-card" role="listitem" onclick="openDetail('${site.name}'); ${closeOverlay ? "closeRecentOverlay(false); " : ""}return false;"><span class="badge-new">NEW</span>
      <div class="thumb">
        ${cardFace(site.name)}
        <span class="recent-date-badge">${formatAddedDate(site)}</span>
      </div>
      <div class="info">
        <div class="recent-order-note">Newest additions first</div>
        <div class="name">${site.name}</div>
        <div class="meta"><span class="stars">⭐ ${site.stars}</span><span class="cat">${site.category}</span></div>
      </div>
    </a>`;
}

function renderRecentlyAdded() {
  const container = document.getElementById("recent-row");
  if (!container) return;
  const recent = getRecentlyAddedSites();
  container.innerHTML = recent.length
    ? recent.slice(0, 7).map(site => recentCardMarkup(site)).join("")
    : `<div class="recent-empty-state"><strong>No websites added in the last 7 days</strong><span>New additions appear here for one week, newest first.</span></div>`;
}

function renderFullRecentList() {
  const container = document.getElementById("recent-full-list");
  if (!container) return;
  const recent = getRecentlyAddedSites();
  container.innerHTML = recent.length
    ? recent.map(site => recentCardMarkup(site, true)).join("")
    : `<div class="recent-empty-state"><strong>No websites added in the last 7 days</strong><span>Check the Websites tab or Browse by Category for the full catalogue.</span></div>`;
}

window.openRecentOverlay = function(shouldFocus = true) {
  const overlay = document.getElementById("recent-overlay");
  if (!overlay) return;
  if (!overlay.classList.contains("active")) recentReturnFocus = document.activeElement;
  renderFullRecentList();
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("recent-open");
  if (shouldFocus) requestAnimationFrame(() => document.getElementById("recent-back")?.focus({ preventScroll: true }));
};

window.closeRecentOverlay = function(restoreFocus = true) {
  const overlay = document.getElementById("recent-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("recent-open");
  if (restoreFocus && recentReturnFocus?.focus) recentReturnFocus.focus({ preventScroll: true });
};

function bindRecentOverlay() {
  const overlay = document.getElementById("recent-overlay");
  overlay?.addEventListener("click", event => {
    if (event.target === overlay) closeRecentOverlay(true);
  });
  document.addEventListener("keydown", event => {
    if (!overlay?.classList.contains("active")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeRecentOverlay(true);
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll('button:not([disabled]), a[href]')]
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

/* --- Category Discovery --- */
let categoryReturnFocus = null;
let activeCategoryView = null;

function getCategoryDefinition(name) {
  return categoryDefinitions.find(category => category.name === name) || {
    name,
    icon: "◈",
    color: getCategoryColor(name)
  };
}

function renderCategoryOverlay(categoryName = activeCategoryView) {
  const content = document.getElementById("category-overlay-content");
  const title = document.getElementById("category-overlay-title");
  const subtitle = document.getElementById("category-overlay-subtitle");
  const summary = document.getElementById("category-summary");
  if (!content) return;
  activeCategoryView = categoryName || null;

  if (!activeCategoryView) {
    if (title) title.textContent = "Browse by Category";
    if (subtitle) subtitle.textContent = "Every category in one place";
    if (summary) summary.textContent = "Choose a category to see the websites that belong to it.";
    content.innerHTML = `
      <div class="category-full-grid" role="list" aria-label="All website categories">
        ${categoryDefinitions.map(category => `
          <button type="button" class="category-full-chip" role="listitem" style="--category-color:${category.color};" onclick="showCategoryInOverlay('${category.name}')">
            <span class="emoji" aria-hidden="true">${CATEGORY_ICON_ART[category.name] ? `<img class="cat-icon-img" src="assets/category-icons/${CATEGORY_ICON_ART[category.name]}.png" alt="" loading="lazy">` : category.icon}</span>
            <span class="label">${category.name}</span>
            ${category.status === "planned" ? `<span class="category-status">Planned</span>` : ""}
          </button>`).join("")}
      </div>`;
    return;
  }

  const category = getCategoryDefinition(activeCategoryView);
  const categorySites = getSitesByAddedDate().filter(site => site.category === activeCategoryView);
  if (title) title.innerHTML = `${CATEGORY_ICON_ART[category.name] ? `<img class="cat-icon-img cat-title-icon" src="assets/category-icons/${CATEGORY_ICON_ART[category.name]}.png" alt="">` : category.icon} ${category.name}`;
  if (subtitle) subtitle.textContent = "Websites in this category";
  if (summary) summary.textContent = category.status === "planned"
    ? `${category.name} is documented in Archive Hub but is not accepting or listing third-party websites yet.`
    : `Explore websites selected for the ${category.name} category.`;

  content.innerHTML = categorySites.length ? `
    <div class="category-site-grid" role="list" aria-label="${category.name} websites">
      ${categorySites.map(site => `
        <a href="#" class="grid-card" role="listitem" onclick="openDetail('${site.name}'); closeCategoryOverlay(false); return false;">
          <div class="g-img"><img src="${paragonTile(site.name, 420, 260)}" alt="${site.name}" loading="lazy"></div>
          <div class="g-body">
            <h4>${site.name}</h4>
            <div class="g-meta"><span style="color:${category.color}">●</span> ${site.category} · ${ratingLabel(site)}</div>
            <div class="g-meta" style="margin-top:5px;">${formatAddedDate(site)}</div>
          </div>
        </a>`).join("")}
    </div>` : category.status === "planned"
      ? `<div class="category-empty-state"><strong>🚀 Deployed is planned</strong><p>No third-party websites are listed. Read the requirements and future submission process in <a href="paragon-archive-hub.html#deployed">Paragon Archive Hub</a>.</p></div>`
      : `<div class="category-empty-state">No public websites are currently listed in ${category.name}.</div>`;
}

window.showCategoryInOverlay = function(categoryName) {
  try {
    if (hasPersonalSession() && categoryName) {
      const seen = new Set(Array.isArray(accountProfile.categoriesBrowsed) ? accountProfile.categoriesBrowsed : []);
      seen.add(String(categoryName));
      accountProfile.categoriesBrowsed = [...seen].slice(0, 40);
      accountProfile.categoryBrowseCount = seen.size;
      persistPersonalState();
      renderAchievementsAccount();
    }
  } catch (_) {}
  renderCategoryOverlay(categoryName);
  document.getElementById("category-overlay")?.scrollTo?.({ top: 0, behavior: "smooth" });
  requestAnimationFrame(() => document.getElementById("category-back")?.focus({ preventScroll: true }));
};

window.openCategoryOverlay = function(categoryName = null, shouldFocus = true) {
  const overlay = document.getElementById("category-overlay");
  if (!overlay) return;
  if (!overlay.classList.contains("active")) categoryReturnFocus = document.activeElement;
  renderCategoryOverlay(categoryName);
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("category-open");
  if (shouldFocus) requestAnimationFrame(() => document.getElementById("category-back")?.focus({ preventScroll: true }));
};

window.closeCategoryOverlay = function(restoreFocus = true) {
  const overlay = document.getElementById("category-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("category-open");
  if (restoreFocus && categoryReturnFocus?.focus) categoryReturnFocus.focus({ preventScroll: true });
};

window.handleCategoryBack = function() {
  if (activeCategoryView) {
    renderCategoryOverlay(null);
    document.getElementById("category-overlay")?.scrollTo?.({ top: 0, behavior: "smooth" });
    return;
  }
  closeCategoryOverlay(true);
};

function bindCategoryOverlay() {
  const overlay = document.getElementById("category-overlay");
  overlay?.addEventListener("click", event => {
    if (event.target === overlay) closeCategoryOverlay(true);
  });
  document.addEventListener("keydown", event => {
    if (!overlay?.classList.contains("active")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeCategoryOverlay(true);
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll('button:not([disabled]), a[href]')]
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

/* --- Updates Tab --- */
let activeUpdateType = "all";
let activeUpdateCategory = "all";
let activeUpdateDate = "";
let updatePageIndex = 0;
const updatePageSize = 10;

const updateTypeDefinitions = {
  all: { label: "All activity" },
  new: { label: "New Sites", badgeText: "🆕 New", badgeClass: "badge-green" },
  updated: { label: "Updated", badgeText: "🔄 Updated", badgeClass: "badge-blue" },
  maintenance: { label: "Maintenance", badgeText: "🔧 Maintenance", badgeClass: "badge-orange" },
  announcement: { label: "Announcements", badgeText: "🎉 Announcement", badgeClass: "badge-purple" },
  featured: { label: "Featured/Promoted", badgeText: "✨ Featured/Promoted", badgeClass: "badge-gold" }
};

function parseVersionDate(version = "") {
  const match = version.match(/—\s*([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})/);
  const parsed = match ? new Date(match[1]) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

function buildUpdateEvents() {
  const events = [];
  sites.forEach(site => {
    const addedDate = new Date(site.addedAt);
    if (!Number.isNaN(addedDate.getTime())) {
      events.push({
        id: `new-${site.name}`,
        type: "new", siteName: site.name, category: site.category, title: site.name,
        desc: `Added to ${site.category} · ${site.desc}`,
        date: addedDate, thumb: paragonTile(site.name, 120, 120), icon: site.icon
      });
    }
    const versionDate = parseVersionDate(site.version);
    const REALLY_UPDATED = ["Paragon Quiz", "Paragon Archive Hub", "Paragon Invoice", "Paragon Resume", "Paragon Recipe", "Paragon Flash", "Paragon Files", "Paragon Travel", "Paragon Photo", "Paragon Shop"]; // P-092/P-099 — only genuinely shipped products have real update entries
    if (versionDate && site.updates?.length && REALLY_UPDATED.includes(site.name)) {
      events.push({
        id: `updated-${site.name}-${site.version}`,
        type: "updated", siteName: site.name, category: site.category, title: `${site.name} · ${site.version.split(" — ")[0]}`,
        desc: site.updates.join(" · "), date: versionDate,
        thumb: paragonTile(site.name, 120, 120), icon: site.icon
      });
    }
  });

  curatedUpdates.forEach((entry, index) => {
    if (!updateTypeDefinitions[entry.type] || entry.type === "all") return;
    const date = new Date(entry.date);
    if (Number.isNaN(date.getTime())) return;
    const site = entry.siteName ? sites.find(item => item.name === entry.siteName) : null;
    events.push({
      id: entry.id || `curated-${index}`,
      type: entry.type,
      siteName: site?.name || null,
      category: site?.category || null,
      title: entry.title,
      desc: entry.desc,
      date,
      icon: entry.icon || site?.icon || "◈",
      thumb: entry.thumb || (site ? paragonTile(site.name, 120, 120) : null)
    });
  });

  // P-064/P-094 (D-174): REAL managed announcements — the Team desk (team/announcements.html) is the
  // single source of truth. The four real launch-window announcements were migrated here from the old
  // static curated list, so the founder can edit/delete them from the Team side exactly as if they had
  // been composed there. The desk mirrors the live Supabase table (paragon_announcements) into this
  // store whenever a team member is signed in, and the public feed also refreshes from the backend.
  try {
    const MANAGED_SEED = [
      { id: "announcement-2026-08-18-backend-live", type: "special", siteName: null, title: "The Paragon backend went LIVE", message: "Database schema, Email + Google sign-in, and the community & developer tables are all live and probe-verified. Signed-in members' board posts now publish to the real backend.", linkUrl: null, image: null, imageName: null, status: "published", publishedAt: "2026-08-18T18:00:00+01:00", scheduledFor: null, createdAt: "2026-08-18T18:00:00+01:00", publishedBy: "Paragon Founder" },
      { id: "announcement-2026-08-18-community-board", type: "special", siteName: null, title: "The Community Board is open", message: "Members can post, comment, like, report and appeal — with a real moderation loop on the Team desk. Join through Account, then Paragon Community.", linkUrl: null, image: null, imageName: null, status: "published", publishedAt: "2026-08-18T17:00:00+01:00", scheduledFor: null, createdAt: "2026-08-18T17:00:00+01:00", publishedBy: "Paragon Founder" },
      { id: "announcement-2026-08-18-developer-portal", type: "special", siteName: null, title: "The Developer Portal is open", message: "Apply as a developer, pass the real 8-point review gate, and your website joins the public Deployed category.", linkUrl: null, image: null, imageName: null, status: "published", publishedAt: "2026-08-18T16:00:00+01:00", scheduledFor: null, createdAt: "2026-08-18T16:00:00+01:00", publishedBy: "Paragon Founder" },
      { id: "announcement-2026-09-03-product-wave", type: "new", siteName: null, title: "First product wave is OPEN inside the Archive", message: "Paragon Invoice, Resume, Recipe, Flash, Files, Travel, Photo and Shop now open real same-origin apps under /sites/ — local-first, free, with honest construction progress. Meal Planner pairs with Recipe. Coins financial SQL is ready for the team to run (real-money stays OFF).", linkUrl: null, image: null, imageName: null, status: "published", publishedAt: "2026-09-03T12:00:00+01:00", scheduledFor: null, createdAt: "2026-09-03T12:00:00+01:00", publishedBy: "Paragon Founder" },
      { id: "announcement-2026-08-04-catalogue-expansion", type: "special", siteName: null, title: "A larger Paragon collection is now available", message: "New productivity, education, creative, social, finance, lifestyle, entertainment, games, and developer experiences have joined the archive.", linkUrl: null, image: null, imageName: null, status: "published", publishedAt: "2026-08-04T03:15:00+01:00", scheduledFor: null, createdAt: "2026-08-04T03:15:00+01:00", publishedBy: "Paragon Founder" }
    ];
    if (window.localStorage.getItem("paragonTeamAnnouncements.v1") === null) {
      window.localStorage.setItem("paragonTeamAnnouncements.v1", JSON.stringify(MANAGED_SEED)); // one-time migration seed — real records, real dates
    }
    const teamAnnouncements = JSON.parse(window.localStorage.getItem("paragonTeamAnnouncements.v1") || "[]");
    const typeMap = { "new": "new", "updated": "updated", "maintenance": "maintenance", "special": "announcement", "featured": "featured" }; // P-092 — team picks a real website, so types stay true
    const iconMap = { "new": "🆕", "updated": "🔄", "maintenance": "🔧", "special": "🎉", "featured": "⭐" };
    const announcementIsLive = record => record.status === "published" || (record.status === "scheduled" && record.scheduledFor && Date.parse(record.scheduledFor) <= Date.now());
    (Array.isArray(teamAnnouncements) ? teamAnnouncements : []).forEach(record => {
      if (!announcementIsLive(record)) return; // P-094 — drafts stay private; scheduled ones go live automatically at their time
      const mappedType = typeMap[record.type] || "announcement";
      if (!updateTypeDefinitions[mappedType]) return;
      const date = new Date(record.status === "scheduled" ? record.scheduledFor : (record.publishedAt || record.scheduledFor));
      if (Number.isNaN(date.getTime())) return;
      const linkedSite = record.siteName ? sites.find(item => item.name === record.siteName) : null;
      events.push({
        id: "team-" + record.id,
        announcementId: record.id,
        type: mappedType,
        siteName: linkedSite?.name || null,
        category: linkedSite?.category || null,
        title: record.title,
        desc: record.message,
        date,
        icon: iconMap[record.type] || linkedSite?.icon || "📢",
        thumb: record.image ? record.image : (linkedSite ? paragonTile(linkedSite.name, 120, 120) : null),
        image: record.image || null,          // P-094 — uploaded image replaces the website icon art in the feed
        imageIsUpload: Boolean(record.image),
        linkUrl: record.type === "special" ? (record.linkUrl || null) : null // LINK pill is special-only
      });
    });
  } catch (error) { /* storage blocked — feed simply shows curated entries */ }

  /* P-096 — TEAM FEED CONTROL (A to Z): every event in this feed — catalogue additions,
     product updates, announcements — is managed from the Team desk (team/announcements.html
     "PUBLIC FEED" section). The desk writes suppress/text overrides here; this feed obeys.
     Notifications derive from the same list, so hidden events stop notifying too. */
  try {
    const overrides = JSON.parse(window.localStorage.getItem("paragonTeamUpdateOverrides.v1") || "null") || {};
    const suppressed = overrides.suppressed || {};
    const text = overrides.text || {};
    for (let index = events.length - 1; index >= 0; index -= 1) {
      if (suppressed[events[index].id]) { events.splice(index, 1); continue; }
      const edit = text[events[index].id];
      if (edit) {
        if (edit.title) events[index].title = String(edit.title);
        if (edit.desc) events[index].desc = String(edit.desc);
        events[index].teamEdited = true;
      }
    }
  } catch (error) { /* storage blocked — feed stays as generated */ }

  return events.sort((first, second) => second.date - first.date || first.title.localeCompare(second.title));
}

/* P-101 — public coin economy/flags from master phase1b (anon RPC). Silent no-op if SQL not run. */
window.ParagonCoinPublicConfig = window.ParagonCoinPublicConfig || null;
function fetchPublicCoinConfig() {
  try {
    const base = (window.ParagonConfig?.supabaseUrl || "").replace(/\/$/, "");
    const key = window.ParagonConfig?.supabaseAnonKey || "";
    if (!base || !key || typeof window.fetch !== "function") return;
    window.fetch(`${base}/rest/v1/rpc/paragon_public_coin_config`, {
      method: "POST",
      headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: "{}"
    })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error("coin config " + r.status))))
      .then(data => {
        window.ParagonCoinPublicConfig = data;
        try { window.localStorage.setItem("paragonArchive.coinPublicConfig.v1", JSON.stringify(data)); } catch (_) {}
      })
      .catch(() => {
        try {
          const cached = window.localStorage.getItem("paragonArchive.coinPublicConfig.v1");
          if (cached) window.ParagonCoinPublicConfig = JSON.parse(cached);
        } catch (_) {}
      });
  } catch (_) {}
}

/* P-094 — public feed refreshes from the live announcements backend (read-only, anon).
   Cached into localStorage so the feed stays honest offline; failures are silent because
   the local managed store already carries the same records. */
function fetchLiveAnnouncements() {
  try {
    const base = window.ParagonConfig?.supabaseUrl;
    const key = window.ParagonConfig?.supabaseAnonKey;
    if (!base || !key || typeof window.fetch !== "function") return;
    window.fetch(`${base}/rest/v1/paragon_announcements?select=*&order=published_at.desc&limit=200`, { headers: { apikey: key } })
      .then(response => (response.ok ? response.json() : Promise.reject(new Error("announcements backend " + response.status))))
      .then(rows => {
        if (!Array.isArray(rows)) return;
        const mapped = rows.map(row => ({
          id: row.id, type: row.type, siteName: row.site_name, title: row.title, message: row.message,
          linkUrl: row.link_url, image: row.image_url, imageName: null, status: row.status,
          publishedAt: row.published_at, scheduledFor: row.publish_at, createdAt: row.published_at || row.publish_at || new Date().toISOString(),
          publishedBy: row.published_by || "Paragon Founder", backend: true
        }));
        window.localStorage.setItem("paragonArchive.announcementsCache.v1", JSON.stringify(mapped));
        /* mirror backend truth into the managed store (backend wins on shared ids) */
        const store = JSON.parse(window.localStorage.getItem("paragonTeamAnnouncements.v1") || "[]");
        const withoutStaleBackend = store.filter(record => !record.backend);
        const merged = withoutStaleBackend.slice();
        let changed = withoutStaleBackend.length !== store.length;
        mapped.forEach(record => {
          const index = merged.findIndex(entry => entry.id === record.id);
          if (index >= 0) { if (JSON.stringify(merged[index]) !== JSON.stringify(record)) changed = true; merged[index] = record; }
          else { merged.push(record); changed = true; }
        });
        if (changed) {
          window.localStorage.setItem("paragonTeamAnnouncements.v1", JSON.stringify(merged));
          renderUpdates?.();
        }
      })
      .catch(() => { /* backend not deployed yet or offline — local managed store is the truth */ });
  } catch (error) { /* blocked */ }
}

function localDateKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const pad = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function updateDateHeading(date) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(date); target.setHours(0, 0, 0, 0);
  const days = Math.round((today - target) / 86400000);
  if (days === 0) return `Today · ${date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
  if (days === 1) return `Yesterday · ${date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
  return date.toLocaleDateString(undefined, { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

function updateElementId(updateId) {
  let hash = 0;
  for (const character of String(updateId)) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return `update-${String(updateId).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 54)}-${Math.abs(hash)}`;
}

function timelineItem(update) {
  const definition = updateTypeDefinitions[update.type] || { badgeText: update.type, badgeClass: "badge-neutral" };
  const isSavedUpdate = Boolean(loggedIn && update.siteName && bookmarkedSites.has(update.siteName));
  const canOpen = Boolean(update.siteName && sites.some(site => site.name === update.siteName));
  /* P-094 — an uploaded announcement image takes the website icon's place entirely; tapping it
     opens the full-size view where the user can also download it. */
  const thumbMarkup = update.image
    ? `<img class="t-image-art" src="${update.image}" alt="Announcement image" loading="lazy" style="cursor:zoom-in" onclick="openUpdateImageViewer('${updateElementId(update.id)}')" tabindex="0" role="button" aria-label="View announcement image full size" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openUpdateImageViewer('${updateElementId(update.id)}')}">`
    : update.thumb
      ? `<img src="${update.thumb}" alt="" loading="lazy">`
      : `<span class="timeline-event-icon" aria-hidden="true">${update.icon}</span>`;
  return `
    <article id="${updateElementId(update.id)}" class="timeline-entry" data-update-id="${escapeHTML(update.id)}" data-update-type="${update.type}" tabindex="-1">
      <div class="timeline-dot timeline-dot-left" aria-hidden="true"></div>
      <div class="timeline-dot timeline-dot-right" aria-hidden="true"></div>
      <div class="timeline-card">
        <div class="t-thumb">${thumbMarkup}</div>
        <div class="t-body">
          <div class="t-head">
            <span class="update-badge ${definition.badgeClass}">${definition.badgeText}</span>
            ${isSavedUpdate ? `<span class="saved-update-star" aria-label="Update for one of your saved websites" title="Saved website">★</span>` : ""}
          </div>
          <div class="t-title">${escapeHTML(update.title)}</div>
          <div class="t-sub">${escapeHTML(update.desc)}</div>
          <button type="button" class="timeline-read-more" onclick="toggleTimelineText(this)" aria-expanded="false" hidden>Read more</button>
          <div class="t-foot"><time datetime="${update.date.toISOString()}">${update.date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time>${canOpen ? `<a href="#" onclick="openDetail('${update.siteName}'); return false;">Open</a>` : ""}${update.linkUrl ? `<a class="timeline-link-pill" href="${escapeHTML(update.linkUrl)}" target="_blank" rel="noopener noreferrer">Link</a>` : (!canOpen ? `<span class="timeline-info-label">Archive-wide</span>` : "")}</div>
        </div>
      </div>
    </article>`;
}

/* P-094 — full-size announcement image viewer: view + download, no browser dialogs. */
window.openUpdateImageViewer = function(elementId) {
  const entry = document.getElementById(elementId);
  const image = entry?.querySelector?.(".t-image-art");
  const title = entry?.querySelector?.(".t-title")?.textContent || "Paragon announcement";
  if (!image || typeof document.createElement !== "function") return;
  document.getElementById("update-image-viewer")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "update-image-viewer";
  overlay.className = "update-image-viewer";
  overlay.innerHTML = `
    <div class="update-image-viewer-card">
      <div class="update-image-viewer-head">
        <strong>${escapeHTML(title)}</strong>
        <button type="button" class="update-image-viewer-close" aria-label="Close image view">✕</button>
      </div>
      <img src="${image.src}" alt="${escapeHTML(title)} announcement image full size">
      <div class="update-image-viewer-actions">
        <a class="timeline-link-pill" href="${image.src}" download="paragon-announcement-image.jpg">⬇ Download image</a>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("popup-lock");
  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    if (!document.querySelector(".utility-overlay.active, .share-sheet-overlay.active, #welcome-splash")) document.body.classList.remove("popup-lock");
  };
  const onKey = event => { if (event.key === "Escape") close(); };
  overlay.querySelector(".update-image-viewer-close").addEventListener("click", close);
  overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
  document.addEventListener("keydown", onKey);
  overlay.querySelector(".update-image-viewer-close").focus?.();
};

function syncUpdateFilterChips() {
  const chips = document.getElementById("update-filter-chips");
  if (!chips) return;
  chips.querySelectorAll("[data-update-type]").forEach(button => {
    const active = button.dataset.updateType === activeUpdateType;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function syncUpdateCategoryOptions(events = buildUpdateEvents()) {
  const select = document.getElementById("updates-category-select");
  if (!select) return;
  const categories = [...new Set(events.map(event => event.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  if (activeUpdateCategory !== "all" && !categories.includes(activeUpdateCategory)) activeUpdateCategory = "all";
  select.innerHTML = `<option value="all">Any category</option>${categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}`;
  select.value = activeUpdateCategory;
}

/* P-112 — the Updates feed is grouped PER WEBSITE so repeated activity for the same
   site collapses into one compact card (fewer repeated thumbs/headers = shorter feed).
   Announcements with no website share one "Announcements" group. Each event stays a
   fully addressable row (same id / data-update-type / viewer hooks as before). */
function timelineGroupsMarkup(updates) {
  const byDay = new Map();
  updates.forEach(update => {
    const key = localDateKey(update.date);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(update);
  });
  const parts = [];
  for (const dayEvents of byDay.values()) {
    parts.push(`<div class="divider-date">${updateDateHeading(dayEvents[0].date)}</div>`);
    const buckets = [];
    const seen = new Map();
    for (const update of dayEvents) {
      const key = update.siteName || "\u0000archive-wide";
      let bucket = seen.get(key);
      if (!bucket) { bucket = { siteName: update.siteName, rows: [] }; seen.set(key, bucket); buckets.push(bucket); }
      bucket.rows.push(update);
    }
    for (const bucket of buckets) parts.push(updatesGroupCard(bucket.siteName, bucket.rows));
  }
  return parts.join("");
}

function updatesGroupCard(siteName, rows) {
  const site = siteName ? sites.find(item => item.name === siteName) : null;
  const label = siteName || "Announcements";
  const thumb = rows[0].image
    ? `<img src="${rows[0].image}" alt="" loading="lazy">`
    : site ? paragonTile(siteName, 120, 120)
    : `<span aria-hidden="true">${rows[0].icon || "📣"}</span>`;
  const isSaved = Boolean(loggedIn && siteName && bookmarkedSites.has(siteName));
  const first = rows[0];
  const sub = site ? `${site.category}` : (first.type === "special" ? "Archive-wide announcement" : "Archive-wide update");
  return `
    <details class="timeline-group-entry" open>
      <span class="timeline-dot timeline-dot-left" aria-hidden="true"></span>
      <span class="timeline-dot timeline-dot-right" aria-hidden="true"></span>
      <summary class="tg-head">
        <span class="tg-thumb">${thumb}</span>
        <span class="tg-title"><b>${escapeHTML(label)}</b><small>${escapeHTML(sub)}</small></span>
        ${isSaved ? `<span class="saved-update-star" aria-label="Update for one of your saved websites" title="Saved website">★</span>` : ""}
        <span class="tg-count">${rows.length}</span>
        <span class="tg-chev">⌄</span>
      </summary>
      <div class="tg-body">
        ${rows.map(updatesGroupRow).join("")}
      </div>
    </details>`;
}

function updatesGroupRow(update) {
  const definition = updateTypeDefinitions[update.type] || { badgeText: update.type, badgeClass: "badge-neutral" };
  const canOpen = Boolean(update.siteName && sites.some(site => site.name === update.siteName));
  const title = update.type === "new" && update.title === update.siteName ? "" : update.title;
  const lead = title ? `<b>${escapeHTML(title)}</b>${update.desc ? ` · ` : ""}` : "";
  return `
    <div class="tg-row" id="${updateElementId(update.id)}" data-update-id="${escapeHTML(update.id)}" data-update-type="${update.type}" tabindex="-1">
      <span class="update-badge ${definition.badgeClass}">${definition.badgeText}</span>
      <span class="tg-text">${lead}${escapeHTML(update.desc || "")}</span>
      <time class="tg-time" datetime="${update.date.toISOString()}">${update.date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time>
      ${update.image ? `<img class="t-image-art" src="${update.image}" alt="Announcement image" loading="lazy" style="cursor:zoom-in" onclick="openUpdateImageViewer('${updateElementId(update.id)}')" tabindex="0" role="button" aria-label="View announcement image full size">` : ""}
      ${canOpen ? `<a class="tg-open" href="#" onclick="openDetail('${escapeHTML(update.siteName)}'); return false;">Open</a>` : ""}
      ${update.linkUrl ? `<a class="timeline-link-pill" href="${escapeHTML(update.linkUrl)}" target="_blank" rel="noopener noreferrer">Link</a>` : ""}
    </div>`;
}

function renderUpdates() {
  const container = document.getElementById("updates-timeline");
  const summary = document.getElementById("updates-filter-summary");
  const pagination = document.getElementById("updates-pagination");
  const paginationStatus = document.getElementById("updates-pagination-status");
  const previous = document.getElementById("updates-previous");
  const viewMore = document.getElementById("updates-view-more");
  if (!container) return [];
  const events = buildUpdateEvents();
  syncUpdateCategoryOptions(events);
  syncUpdateFilterChips();
  const filtered = events.filter(update =>
    (activeUpdateType === "all" || update.type === activeUpdateType) &&
    (activeUpdateCategory === "all" || update.category === activeUpdateCategory) &&
    (!activeUpdateDate || localDateKey(update.date) === activeUpdateDate)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / updatePageSize));
  updatePageIndex = Math.max(0, Math.min(updatePageIndex, totalPages - 1));
  const start = updatePageIndex * updatePageSize;
  const visible = filtered.slice(start, start + updatePageSize);
  container.classList.toggle("compact", visible.length <= 3); // P-073 — calm layout when a filter leaves few entries
  if (summary) {
    const typeLabel = updateTypeDefinitions[activeUpdateType]?.label || "Activity";
    const categoryLabel = activeUpdateCategory === "all" ? "all categories" : activeUpdateCategory;
    const dateLabel = activeUpdateDate ? new Date(`${activeUpdateDate}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "all dates";
    const range = filtered.length ? ` · showing ${start + 1}–${start + visible.length} of ${filtered.length}` : "";
    summary.textContent = `${typeLabel} · ${categoryLabel} · ${dateLabel}${range}.`;
  }
  if (!filtered.length) {
    container.innerHTML = `<div class="updates-empty"><img class="empty-illus" src="assets/illustrations/empty-updates.png" alt="" loading="lazy"><strong>No matching updates</strong><p>No activity matches this type, category and date. Change one or more filters to continue.</p></div>`;
    if (pagination) pagination.hidden = true;
    return filtered;
  }
  container.innerHTML = timelineGroupsMarkup(visible);
  setupTimelineDisclosures();
  const hasPrevious = updatePageIndex > 0;
  const hasNext = updatePageIndex < totalPages - 1;
  if (pagination) pagination.hidden = !hasPrevious && !hasNext;
  if (previous) previous.hidden = !hasPrevious;
  if (viewMore) { viewMore.hidden = !hasNext; viewMore.textContent = "View more"; }
  if (paginationStatus) paginationStatus.textContent = `Page ${updatePageIndex + 1} of ${totalPages}`;
  return filtered;
}

window.setUpdateTypeFilter = function(type) {
  activeUpdateType = updateTypeDefinitions[type] ? type : "all";
  updatePageIndex = 0;
  syncUpdateFilterChips();
  renderUpdates();
};

window.showMoreUpdates = function() {
  updatePageIndex += 1;
  renderUpdates();
  document.getElementById("tab-updates")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
};
window.showPreviousUpdates = function() {
  updatePageIndex = Math.max(0, updatePageIndex - 1);
  renderUpdates();
  document.getElementById("tab-updates")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
};

window.openUpdateFromNotification = function(updateId) {
  const update = buildUpdateEvents().find(event => event.id === updateId);
  if (!update) { showToast("That update is no longer available in the current log.", "warning"); return; }
  activeUpdateType = "all";
  activeUpdateCategory = "all";
  activeUpdateDate = "";
  const eventIndex = buildUpdateEvents().findIndex(event => event.id === updateId);
  updatePageIndex = Math.max(0, Math.floor(eventIndex / updatePageSize));
  const categorySelect = document.getElementById("updates-category-select");
  const dateInput = document.getElementById("updates-date-input");
  if (categorySelect) categorySelect.value = "all";
  if (dateInput) dateInput.value = "";
  window.switchToTab("updates", { scroll: false });
  renderUpdates();
  requestAnimationFrame(() => {
    const target = document.getElementById(updateElementId(updateId));
    if (!target) return;
    target.classList.add("notification-target");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.focus({ preventScroll: true });
    setTimeout(() => target.classList.remove("notification-target"), 2600);
  });
};

function bindUpdateFilters() {
  const chips = document.getElementById("update-filter-chips");
  const categorySelect = document.getElementById("updates-category-select");
  const dateInput = document.getElementById("updates-date-input");
  syncUpdateCategoryOptions();
  categorySelect?.addEventListener("change", event => {
    activeUpdateCategory = event.target.value;
    updatePageIndex = 0;
    renderUpdates();
  });
  dateInput?.addEventListener("change", event => {
    activeUpdateDate = event.target.value || "";
    updatePageIndex = 0;
    renderUpdates();
  });
  chips?.addEventListener("click", event => {
    const chip = event.target.closest("[data-update-type]");
    if (!chip) return;
    window.setUpdateTypeFilter(chip.dataset.updateType);
  });
  document.getElementById("updates-view-more")?.addEventListener("click", window.showMoreUpdates);
  document.getElementById("updates-previous")?.addEventListener("click", window.showPreviousUpdates);
  syncUpdateFilterChips();
  renderUpdates();
}

/* --- Account Tab & Authentication --- */
let authMode = "signin";
let authReturnFocus = null;
let authListenerBound = false;

function clearAccountPrivate() {
  ["stats-row", "progress-row", "ach-row", "saved-row", "collections-row", "visited-row", "reviews-row", "settings-row"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.innerHTML = "";
  });
}

function providerLabel(user) {
  const provider = user?.app_metadata?.provider || user?.identities?.[0]?.provider || "email";
  return provider === "google" ? "Google" : provider === "email" ? "Email" : provider;
}

function isCreatorDemoUser(user = authUser) {
  const configuredEmail = String(window.ParagonConfig?.creatorDemoEmail || "").trim().toLowerCase();
  return Boolean(configuredEmail && String(user?.email || "").toLowerCase() === configuredEmail);
}

function registrationDateLabel() {
  const raw = authUser?.created_at || accountProfile.registeredAt;
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "Registration date pending";
}

function renderSavedAccount() {
  const container = document.getElementById("saved-row");
  if (!container) return;
  const saved = [...bookmarkedSites].map(name => sites.find(site => site.name === name)).filter(Boolean);
  container.innerHTML = saved.length ? saved.map(site => `
    <a href="#" class="saved-card" role="listitem" onclick="openDetail('${site.name}'); return false;">
      <div class="img"><img src="${paragonTile(site.name, 300, 200)}" alt="${site.name}" loading="lazy"></div>
      <div class="body">${site.name}</div>
    </a>`).join("") : `
    <div class="account-empty-state"><img class="empty-illus" src="assets/illustrations/empty-bookmarks.png" alt="" loading="lazy"><br>No bookmarks yet.<br><button type="button" onclick="switchToTab('websites')">Explore websites</button></div>`;
}

function renderVisitedAccount() {
  const container = document.getElementById("visited-row");
  if (!container) return;
  container.innerHTML = localVisits.length ? `
    <div class="visited-list">
      ${localVisits.slice(0, 8).map(entry => {
        const site = sites.find(item => item.name === entry.name);
        if (!site) return "";
        const visited = new Date(entry.visitedAt);
        return `<button type="button" class="visited-item" onclick="openDetail('${site.name}')"><span>${site.icon}</span><span><strong>${site.name}</strong><small>${visited.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${visited.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</small></span></button>`;
      }).join("")}
    </div>` : `<div class="account-empty-state"><img class="empty-illus" src="assets/illustrations/empty-history.png" alt="" loading="lazy"><br>Your recently visited websites will appear here.</div>`;
}

function renderAccountReviews() {
  const container = document.getElementById("reviews-row");
  if (!container) return;
  const entries = Object.entries(localReviews)
    .filter(([name]) => sites.some(site => site.name === name))
    .flatMap(([siteName, list]) => getUserReviews(siteName).map(review => ({ siteName, review })));
  container.innerHTML = entries.length ? entries.map(({ siteName, review }) => `
    <article class="review-card">
      <div class="rev-head"><h4>${siteName}<span class="user-review-label">Your review</span></h4><span class="stars">${"⭐".repeat(review.stars)}</span></div>
      <p>“${escapeHTML(review.text)}”</p>
      <div class="review-actions"><button type="button" onclick="openReviewComposer('${siteName}', '${escapeHTML(review.id || "")}')">Edit</button><button type="button" class="danger" onclick="deleteLocalReview('${siteName}', '${escapeHTML(review.id || "")}')">Delete</button></div>
    </article>`).join("") : `<div class="account-empty-state"><img class="empty-illus" src="assets/illustrations/empty-reviews.png" alt="" loading="lazy"><br>You have not written a review yet.</div>`;
}

function progressSummary(value) {
  if (value && typeof value === "object") {
    if (Number.isFinite(Number(value.completion))) return `${Math.round(Number(value.completion) * 100)}% complete`;
    if (value.lesson !== undefined) return `Lesson ${value.lesson}`;
    if (value.step !== undefined) return `Step ${value.step}`;
  }
  return "Progress saved";
}

function renderProgressAccount() {
  const container = document.getElementById("progress-row");
  if (!container) return;
  const entries = Object.entries(sharedProgress || {});
  container.innerHTML = entries.length ? `<div class="progress-grid">${entries.map(([productId, entry]) => `
    <article class="progress-card"><div><strong>${escapeHTML(productId.replace(/[-_]/g, " "))}</strong><small>${progressSummary(entry?.value)}</small></div><span>${guestMode ? "Temporary" : "Synced"}</span></article>`).join("")}</div>`
    : `<div class="account-empty-state">Progress from Paragon courses and tools will appear here once a product saves it.${guestMode ? " Guest progress is temporary." : ""}</div>`;
}

function achievementTasks() {
  const reviews = Object.values(localReviews || {}).flat();
  const provider = loggedIn ? providerLabel(authUser) : "";
  const collectionItems = userCollections.reduce((total, collection) => total + (collection.items || []).length, 0);
  const voteCount = Object.values(reviewVotes || {}).filter(Boolean).length;
  const progressCount = Object.keys(sharedProgress || {}).length;
  const readNotifications = inAppNotifications.filter(notification => notification.readAt).length;
  const bestRank = Number(accountProfile.leaderboardBestRank || 0);
  const list = [
    { icon: "🥇", title: "First Visit", detail: "Open one website detail.", complete: localVisits.length >= 1 },
    { icon: "⭐", title: "First Rating", detail: "Rate one website.", complete: reviews.some(review => Number(review.stars) >= 1) },
    { icon: "📝", title: "First Review", detail: "Write one review.", complete: reviews.some(review => String(review.text || "").trim()) },
    { icon: "🔗", title: "First Share", detail: "Share or copy one detail link.", complete: Number(accountProfile.shareCount || 0) >= 1 || Boolean(accountProfile.firstShareAt) },
    { icon: "👤", title: "Google or Email", detail: "Continue with a real account.", complete: loggedIn && ["Google", "Email"].includes(provider) },
    { icon: "📈", title: "Progress Starter", detail: "Save progress in one Paragon product.", complete: progressCount >= 1 },
    { icon: "🔖", title: "First Save", detail: "Bookmark one website.", complete: bookmarkedSites.size >= 1 },
    { icon: "📂", title: "Collection Keeper", detail: "Place one website in a collection.", complete: collectionItems >= 1 },
    { icon: "👍", title: "Helpful Voice", detail: "Vote on one review.", complete: voteCount >= 1 },
    { icon: "🧭", title: "Explorer Five", detail: "Visit five different websites.", complete: localVisits.length >= 5 },
    { icon: "✍️", title: "Reviewer Three", detail: "Write three reviews.", complete: reviews.length >= 3 },
    { icon: "🔖", title: "Saver Five", detail: "Save five websites.", complete: bookmarkedSites.size >= 5 },
    { icon: "🗂️", title: "Collector Three", detail: "Collect three websites.", complete: collectionItems >= 3 },
    { icon: "🧭", title: "Explorer Ten", detail: "Visit ten websites.", complete: localVisits.length >= 10 },
    { icon: "📊", title: "Progress Three", detail: "Start progress in three products.", complete: progressCount >= 3 },
    { icon: "🌟", title: "Five-Star Voice", detail: "Give a five-star rating.", complete: reviews.some(review => Number(review.stars) === 5) },
    { icon: "🔗", title: "Share Three", detail: "Share or copy three detail links.", complete: Number(accountProfile.shareCount || 0) >= 3 },
    { icon: "☀️", title: "Theme Explorer", detail: "Switch the Archive appearance.", complete: Number(accountProfile.themeSwitchCount || 0) >= 1 },
    { icon: "⌕", title: "Search Explorer", detail: "Keep five recent searches.", complete: readRecentSearches().length >= 5 },
    { icon: "🔔", title: "Notification Reader", detail: "Read three account notifications.", complete: readNotifications >= 3 },
    { icon: "🏛️", title: "Archive Veteran", detail: "Visit twenty websites.", complete: localVisits.length >= 20 },
    { icon: "💬", title: "Trusted Reviewer", detail: "Write ten reviews.", complete: reviews.length >= 10 },
    { icon: "◈", title: "Hub Visitor", detail: "Open the Paragon Archive Hub.", complete: Number(accountProfile.hubVisitCount || 0) >= 1 },
    { icon: "📚", title: "Hub Regular", detail: "Open the Archive Hub three times.", complete: Number(accountProfile.hubVisitCount || 0) >= 3 },
    { icon: "🧾", title: "QR Creator", detail: "Create one website QR code.", complete: Number(accountProfile.qrCount || 0) >= 1 },
    { icon: "✦", title: "AI Curious", detail: "Ask Paragon AI one question.", complete: Number(accountProfile.aiQuestionCount || 0) >= 1 },
    { icon: "🤖", title: "AI Regular", detail: "Ask Paragon AI three questions.", complete: Number(accountProfile.aiQuestionCount || 0) >= 3 },
    { icon: "🔎", title: "Results Seeker", detail: "Run three full Search Results searches.", complete: Number(accountProfile.resultsSearchCount || 0) >= 3 },
    { icon: "📣", title: "Social Spreader", detail: "Share five detail links to apps or people.", complete: Number(accountProfile.shareCount || 0) >= 5 },
    { icon: "🔔", title: "Fully Notified", detail: "Read ten account notifications.", complete: readNotifications >= 10 },
    /* P-106 — stages 7–10: ads, leaderboard climb, retention & engagement */
    { icon: "👀", title: "Ad Curious", detail: "View one reserved or live ad slot.", complete: Number(accountProfile.adImpressionCount || 0) >= 1 },
    { icon: "📢", title: "Ad Supporter", detail: "Tap a support ad once (helps Paragon stay free).", complete: Number(accountProfile.adClickCount || 0) >= 1 },
    { icon: "🤝", title: "Ad Ally", detail: "Tap support ads three times.", complete: Number(accountProfile.adClickCount || 0) >= 3 },
    { icon: "🏅", title: "Ad Champion", detail: "Tap support ads ten times.", complete: Number(accountProfile.adClickCount || 0) >= 10 },
    { icon: "💎", title: "Ad Patron", detail: "View twenty ad slots while browsing.", complete: Number(accountProfile.adImpressionCount || 0) >= 20 },
    { icon: "📊", title: "Leaderboard Scout", detail: "Open the engagement leaderboard once.", complete: Number(accountProfile.leaderboardOpenCount || 0) >= 1 },
    { icon: "🧗", title: "Leaderboard Climber", detail: "Check the leaderboard three times.", complete: Number(accountProfile.leaderboardCheckCount || 0) >= 3 },
    { icon: "🔟", title: "Top Ten Contender", detail: "Reach a personal best rank of 10 or better.", complete: bestRank > 0 && bestRank <= 10 },
    { icon: "🏁", title: "Top Ten Finisher", detail: "Hold top-10 best rank after five board checks.", complete: bestRank > 0 && bestRank <= 10 && Number(accountProfile.leaderboardCheckCount || 0) >= 5 },
    { icon: "🥇", title: "Podium Push", detail: "Reach a personal best rank of 3 or better.", complete: bestRank > 0 && bestRank <= 3 },
    { icon: "📅", title: "Daily Return", detail: "Come back on a second day (streak 2).", complete: Number(accountProfile.dayStreak || 0) >= 2 },
    { icon: "🔥", title: "Week Streak", detail: "Keep a seven-day return streak.", complete: Number(accountProfile.dayStreak || 0) >= 7 },
    { icon: "🪙", title: "Coin Curious", detail: "Open the Paragon Coins shop once.", complete: Number(accountProfile.coinShopOpenCount || 0) >= 1 },
    { icon: "🚀", title: "Product Pilot", detail: "Open three Paragon product tools.", complete: Number(accountProfile.productOpenCount || 0) >= 3 },
    { icon: "📲", title: "Install Ready", detail: "Open Install & app permissions once.", complete: Number(accountProfile.installOpenCount || 0) >= 1 },
    { icon: "👥", title: "Community Step", detail: "Open Community from Account once.", complete: Number(accountProfile.communityOpenCount || 0) >= 1 },
    { icon: "🔍", title: "Detail Deep Dive", detail: "Open fifteen website detail pages.", complete: Number(accountProfile.detailOpenCount || 0) >= 15 },
    { icon: "🗂️", title: "Category Hopper", detail: "Browse five different categories.", complete: Number(accountProfile.categoryBrowseCount || 0) >= 5 },
    { icon: "📰", title: "Update Watcher", detail: "Open the Updates tab five times.", complete: Number(accountProfile.updatesViewCount || 0) >= 5 },
    { icon: "👑", title: "Archive Legend", detail: "Finish every other achievement first.", complete: false }
  ];
  const prior = list.slice(0, -1);
  list[list.length - 1].complete = prior.every(task => task.complete);
  return list;
}

function currentAchievementStage(tasks = achievementTasks()) {
  const totalStages = Math.ceil(tasks.length / 5);
  const stored = Math.max(1, Math.min(totalStages, Number(accountProfile.achievementStage || 1)));
  return { stage: stored, totalStages, start: (stored - 1) * 5, tasks: tasks.slice((stored - 1) * 5, stored * 5) };
}

function renderAchievementsAccount() {
  const container = document.getElementById("ach-row");
  if (!container) return;
  const tasks = achievementTasks();
  const completed = tasks.filter(task => task.complete).length;
  const remaining = Math.max(0, tasks.length - completed);
  const stage = currentAchievementStage(tasks);
  const stageComplete = stage.tasks.length > 0 && stage.tasks.every(task => task.complete);
  const hasNext = stage.stage < stage.totalStages;
  const taskMarkup = stage.tasks.map(task => `
    <article class="ach-item ${task.complete ? "completed" : ""}">${badgeIconMarkup(task)}<h4>${task.title}</h4><p>${task.complete ? "Completed" : task.detail}</p></article>`).join("");
  const lockMarkup = hasNext ? `<button type="button" class="ach-item ${stageComplete ? "ready" : "locked"}" ${stageComplete ? "onclick=\"unlockNextAchievementStage()\"" : "disabled"} aria-label="More Soon: ${remaining} tasks remaining"><div class="emoji">${stageComplete ? "🔓" : `<img class="ach-lock-illus" src="assets/illustrations/achievement-locked.png" alt="" loading="lazy">`}</div><h4>More Soon</h4><p>${remaining} task${remaining === 1 ? "" : "s"} remaining</p></button>` : "";
  const stageCompleted = stage.tasks.filter(task => task.complete).length;
  const achievementPercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  container.innerHTML = `<div class="achievement-stage-summary"><div class="stage-summary-row"><strong>🏆 Stage ${stage.stage} of ${stage.totalStages} — ${stageCompleted} of ${stage.tasks.length} in this stage</strong><span>Overall: ${completed} of ${tasks.length} · ${achievementPercent}%</span></div><div class="strip-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${achievementPercent}"><span style="width:${achievementPercent}%"></span></div></div><div class="ach-grid">${taskMarkup}${lockMarkup}</div>`;
}

window.unlockNextAchievementStage = function() {
  const tasks = achievementTasks();
  const stage = currentAchievementStage(tasks);
  if (stage.stage >= stage.totalStages || !stage.tasks.every(task => task.complete)) return;
  accountProfile.achievementStage = stage.stage + 1;
  persistPersonalState();
  renderAchievementsAccount();
  showToast(`Achievement stage ${accountProfile.achievementStage} unlocked.`);
  // P-074 — unlock burst animation on the achievements grid
  const achGrid = document.querySelector(".ach-grid");
  if (achGrid) { achGrid.classList.remove("unlock-burst"); void achGrid.offsetWidth; achGrid.classList.add("unlock-burst"); }
};
window.unlockFinalAchievement = window.unlockNextAchievementStage;

window.openAchievementsAbout = function() {
  const overlay = document.getElementById("achievements-overlay");
  if (!overlay) return;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("achievements-open");
  requestAnimationFrame(() => document.getElementById("achievements-close")?.focus({ preventScroll: true }));
};

window.closeAchievementsAbout = function() {
  const overlay = document.getElementById("achievements-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("achievements-open");
};

function bindAchievementsAbout() {
  const overlay = document.getElementById("achievements-overlay");
  document.getElementById("achievements-close")?.addEventListener("click", closeAchievementsAbout);
  document.getElementById("achievements-done")?.addEventListener("click", closeAchievementsAbout);
  overlay?.addEventListener("click", event => { if (event.target === overlay) closeAchievementsAbout(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && overlay?.classList.contains("active")) closeAchievementsAbout(); });
}

function renderCollectionsAccount() {
  const container = document.getElementById("collections-row");
  if (!container) return;
  const cards = userCollections.map(collection => {
    const created = new Date(collection.createdAt);
    const dateLabel = Number.isNaN(created.getTime()) ? "Date pending" : created.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    return `<article class="collection-card"><button type="button" class="collection-open" onclick="openCollectionView('${collection.id}')"><span class="collection-icon">${escapeHTML(collection.icon || "📁")}</span><span><strong>${escapeHTML(collection.name)}</strong><small>${escapeHTML(collection.description || "No description")} · ${Array.isArray(collection.items) ? collection.items.length : 0} saved · ${dateLabel}</small></span></button><button type="button" class="collection-delete" onclick="deleteCollection('${collection.id}')" aria-label="Delete ${escapeHTML(collection.name)}">×</button></article>`;
  }).join("");
  container.innerHTML = `${cards || `<div class="account-empty-state"><img class="empty-illus" src="assets/illustrations/empty-collections.png" alt="" loading="lazy"><br>No collections yet.</div>`}<button type="button" class="secondary-action create-collection-btn" onclick="openCollectionComposer()">+ Create New Collection</button>`;
}

function communityMembershipRecord() {
  if (!loggedIn || !authUser?.id) return null;
  try { return JSON.parse(window.localStorage.getItem(`paragonCommunityMembership:${authUser.id}`) || "null"); }
  catch (error) { return null; }
}

/* =====================================================================
   P-112 — ACCOUNT BOXES: every stat box opens the feature it belongs to.
   9 boxes in a 3×3 grid under the profile head; settings follow last.
   Boxes: Paragon Coins (front) · Recently Visited · Reviews Written ·
   Saved Websites · Products in Progress · Leaderboard · Achievements ·
   Collections & Playlists · Coin Shop (buy / sell tabs).
   The six classic account sections stay in-DOM (hidden) as content
   masters, so guest -> account sync on sign-in keeps working unchanged.
   ===================================================================== */
let walletActiveTab = "buy";
let accountBoxKind = "";

function closeAccountBox() {
  ["account-box-overlay", "leaderboard-hub-overlay"].forEach(id => {
    const overlay = document.getElementById(id);
    if (overlay) overlay.remove();
  });
  if (!document.querySelector(".install-popup-overlay.active, .utility-overlay.active")) {
    document.body.classList.remove("popup-lock");
  }
  accountBoxKind = "";
}

function closeWalletOverlay() {
  document.getElementById("coin-shop-overlay")?.remove();
  if (!document.querySelector(".install-popup-overlay.active, .utility-overlay.active")) {
    document.body.classList.remove("popup-lock");
  }
}

function accountMasterRow(kind) {
  const map = {
    visited: "visited-row", reviews: "reviews-row", saved: "saved-row",
    progress: "progress-row", collections: "collections-row", achievements: "ach-row"
  };
  return document.getElementById(map[kind] || "");
}

function accountMasterRender(kind) {
  const renders = {
    visited: renderVisitedAccount, reviews: renderAccountReviews, saved: renderSavedAccount,
    progress: renderProgressAccount, collections: renderCollectionsAccount, achievements: renderAchievementsAccount
  };
  const fn = renders[kind];
  if (fn) { try { fn(); } catch (error) { /* keep master as-is */ } }
}

function engagementSnapForBox() {
  try { return computeMyLeaderboardRank(engagementScore()); } catch (error) { return { rank: 0, score: 0, board: [], best: 0 }; }
}

function coinsWeekRankForBox() {
  try {
    const engine = lbEngine();
    const me = lbCurrentUser();
    if (!engine || !me) return null;
    const key = engine.currentWeekKey();
    const view = engine.standingsForView(key);
    const rows = Array.isArray(view.rows) ? view.rows : [];
    const mine = rows.filter(row => row.player === me)[0];
    return mine ? { rank: Number(mine.rank) || 0, points: Number(mine.points) || 0 } : null;
  } catch (error) { return null; }
}

function accountBoxValues() {
  const eng = engagementSnapForBox();
  const coinWeek = coinsWeekRankForBox();
  const allTasks = typeof achievementTasks === "function" ? achievementTasks() : [];
  const done = allTasks.filter(task => task.complete).length;
  return {
    coins: coinBalance().toLocaleString(),
    coinsShop: coinBalance().toLocaleString(),
    visited: localVisits.length,
    reviews: Object.values(localReviews || {}).reduce((total, list) => total + (list || []).length, 0),
    saved: bookmarkedSites.size,
    progress: Object.keys(sharedProgress || {}).length,
    leaderboard: eng.rank ? `#${eng.rank}` : "—",
    achievements: `${done}/${allTasks.length}`,
    collections: userCollections.length
  };
}

function accountBoxFaces() {
  const v = accountBoxValues();
  const coinWeek = coinsWeekRankForBox();
  return [
    { kind: "coins", icon: "🪙", value: v.coins, label: "Paragon Coins", hint: "Front row · wallet, buy, sell & withdraw" },
    { kind: "visited", icon: "🕐", value: v.visited, label: "Recently Visited", hint: "Tap to open a visited site again" },
    { kind: "reviews", icon: "📝", value: v.reviews, label: "Reviews Written", hint: "My reviews · edit or delete" },
    { kind: "saved", icon: "🔖", value: v.saved, label: "Saved Websites", hint: "Bookmarks across Paragon" },
    { kind: "progress", icon: "📈", value: v.progress, label: "Products in Progress", hint: "Progress across Paragon tools" },
    { kind: "leaderboard", icon: "🏆", value: v.leaderboard, label: "Leaderboard", hint: coinWeek ? `Engagement rank #${v.leaderboard.replace("#", "")} · Coins weekly #${coinWeek.rank}` : "Engagement rank · weekly coin rewards" },
    { kind: "achievements", icon: "🏅", value: v.achievements, label: "Achievements", hint: `${doneCountLabel(v.achievements)} · badges & stages` },
    { kind: "collections", icon: "📂", value: v.collections, label: "Collections & Playlists", hint: "My collections and playlists" },
    { kind: "coinsShop", icon: "🛍️", value: v.coinsShop, label: "Coin Shop", hint: "Coins Leaderboard — weekly top 3 + ranks 4–10 rewards (staked results only) · buy / sell tabs" }
  ];
}

function doneCountLabel(fraction) {
  const [a, b] = String(fraction).split("/");
  return `${a} of ${b} done`;
}

function renderAccountBoxes() {
  const host = document.getElementById("stats-row");
  if (!host) return;
  const boxes = accountBoxFaces().map(box => `
    <button type="button" class="account-box ${box.kind === "coins" ? "ab-featured" : ""}" onclick="openAccountBox('${box.kind}')">
      <span class="ab-top"><span class="ab-icon">${box.icon}</span><span class="ab-value">${escapeHTML(String(box.value))}</span></span>
      <span class="ab-label">${box.label}</span>
      <span class="ab-hint">${escapeHTML(box.hint)}</span>
    </button>`).join("");
  host.innerHTML = `<div class="account-box-grid">${boxes}</div>`;
}

/* ---------- box popups (snapshot of the hidden content masters) ---------- */
window.openAccountBox = function(kind) {
  if (kind === "coins" || kind === "coinsShop") { openCoinWallet(kind === "coinsShop" ? "buy" : walletActiveTab); return; }
  if (kind === "leaderboard") { openLeaderboardHub(); return; }
  const master = accountMasterRow(kind);
  if (!master) { showToast("This panel is unavailable yet.", "warning"); return; }
  accountMasterRender(kind);
  closeAccountBox();
  document.getElementById("coin-shop-overlay")?.remove();
  const titles = {
    visited: ["🕐 Recently Visited", "Everything you opened recently — tap one to reopen its detail."],
    reviews: ["📝 My Reviews", "Every review you wrote across Paragon — edit or delete any of them."],
    saved: ["🔖 Saved & Bookmarked", "Your saved websites across every Paragon product."],
    progress: ["📈 Products in Progress", "Where you are across Paragon courses and tools."],
    achievements: ["🏅 Achievements", "Real tracked milestones — complete tasks to unlock badges and stages."],
    collections: ["📂 My Collections / Playlists", "Your collections and playlists across the archive."]
  }[kind] || ["Paragon", ""];
  const overlay = document.createElement("div");
  overlay.id = "account-box-overlay";
  overlay.className = "utility-overlay active install-overlay";
  overlay.innerHTML = `
    <div class="install-popup-card account-box-panel" role="dialog" aria-modal="true" aria-label="${titles[0]}">
      <header><h2>${titles[0]}</h2>
        ${kind === "achievements" ? '<button type="button" class="icon-btn-small" onclick="openAchievementsAbout()" aria-label="About achievements" title="About achievements">ℹ️</button>' : ""}
        <button type="button" class="icon-btn-small" onclick="closeAccountBox()" aria-label="Close">×</button>
      </header>
      <div class="ab-body" id="ab-content"></div>
      <small class="ab-panel-note">${escapeHTML(titles[1])}${kind === "collections" ? " Guest collections merge into your account when you sign in while the session is still alive." : ""}</small>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("popup-lock");
  overlay.addEventListener("click", event => { if (event.target === overlay) closeAccountBox(); });
  accountBoxKind = kind;
  const content = overlay.querySelector("#ab-content");
  content.innerHTML = master.innerHTML;
  /* Close-before-action for flows that open their own views/editors; refresh after mutations. */
  overlay.addEventListener("click", event => {
    const action = event.target.closest("[onclick], button, a");
    if (!action) return;
    const attr = String(action.getAttribute && action.getAttribute("onclick") || "");
    if (/openDetail\(|openCollectionView\(|openReviewComposer\(|openCollectionComposer\(|openAchievementsAbout\(/.test(attr)) {
      const delayClose = attr.startsWith("openAchievementsAbout");
      if (!delayClose) closeAccountBox();
    }
    if (/deleteLocalReview\(|deleteCollection\(/.test(attr)) {
      window.setTimeout(() => { accountMasterRender(kind); const host2 = document.getElementById("ab-content"); if (host2) host2.innerHTML = accountMasterRow(kind).innerHTML; }, 140);
    }
    if (/unlockNextAchievementStage\(/.test(attr)) {
      window.setTimeout(() => { accountMasterRender(kind); const host2 = document.getElementById("ab-content"); if (host2) host2.innerHTML = accountMasterRow(kind).innerHTML; }, 140);
    }
  }, true);
};

/* ---------- Coin wallet popup with two tabs (Buy / Sell & Withdraw) ---------- */
function coinWalletTabs() {
  return `
    <div class="wallet-tabbar" role="tablist" aria-label="Coin wallet">
      <button type="button" class="wallet-tab ${walletActiveTab === "buy" ? "active" : ""}" role="tab" aria-selected="${walletActiveTab === "buy"}" onclick="openCoinWallet('buy')">🛒 Buy coins<small>Request a pack — team confirms first</small></button>
      <button type="button" class="wallet-tab ${walletActiveTab === "sell" ? "active" : ""}" role="tab" aria-selected="${walletActiveTab === "sell"}" onclick="openCoinWallet('sell')">💸 Sell / Withdraw<small>Withdraw coins — sell back to naira (weekly rewards + redemptions)</small></button>
    </div>`;
}

function coinShopPaneHTML() {
  const cfg = coinConfigFlags();
  const buckets = coinBalanceBuckets();
  const history = (accountProfile.coinHistory || []).slice(0, 12).map(entry => {
    const sign = Number(entry.amount) >= 0 ? "+" : "";
    const when = entry.at ? new Date(entry.at).toLocaleString() : "";
    const src = entry.source === "server" ? "server" : "local";
    const buck = entry.bucket ? ` · ${entry.bucket}` : "";
    return `<li><b>${sign}${Number(entry.amount).toLocaleString()}</b> · ${String(entry.reason || "").replace(/[<>]/g, "")} <small>${when}${buck} · ${src}</small></li>`;
  }).join("") || "<li><small>No movements yet — balance starts at real zero. Server ledger appears after SQL Stage 2.</small></li>";
  const intents = (accountProfile.paymentIntents || []).slice(0, 8).map(intent => {
    const st = String(intent.status || "pending");
    const claimable = ["awaiting_transfer", "created", "claimed"].includes(st);
    const id = String(intent.id || "").replace(/'/g, "");
    return `<li class="coin-intent-row">
      <span>₦${Number(intent.naira || 0).toLocaleString()} to ${Number(intent.coins || 0).toLocaleString()}c · <b>${st.replace(/[<>]/g, "")}</b></span>
      ${claimable && id ? `<button type="button" class="secondary-action coin-claim-btn" onclick="claimCoinPayment('${id}')">I paid — claim</button>` : ""}
    </li>`;
  }).join("") || "<li><small>No purchase requests yet. Pick a pack below — request never auto-credits.</small></li>";
  const packs = cfg.packs.map(p => [Number(p.naira) || 0, Number(p.coins) || Math.round((Number(p.naira) || 0) * cfg.nairaPerCoinBuy), p.label || ""]);
  return `
    <p style="margin:0 0 10px;font-size:12px;color:var(--text-faint);line-height:1.5">
      Free-to-play always works. <b>Real-money mode is ${cfg.realMoney ? "ON" : "OFF"}</b>${cfg.pause ? " · FINANCIAL PAUSE" : ""}.
      Available <b>${buckets.available.toLocaleString()}</b> · locked <b>${buckets.locked.toLocaleString()}</b> · pending <b>${buckets.pending.toLocaleString()}</b> · restricted <b>${buckets.restricted.toLocaleString()}</b>.
      Server ledger is authority when SQL is live; this device is display cache only.
    </p>
    <div class="install-perm-list">
      ${packs.map(([naira, coins, label]) => `
        <label class="install-perm-row" style="cursor:pointer" onclick="requestCoinPurchase(${naira});">
          <div><b>₦${naira.toLocaleString()}${label ? " · " + String(label).replace(/[<>]/g, "") : ""}</b>
            <small>to ${coins.toLocaleString()} coins after team confirms your transfer. Nothing is credited from this click alone.</small></div>
          <span class="primary-action" style="pointer-events:none;">Request</span>
        </label>`).join("")}
    </div>
    ${opayMoniepointPayMarkup()}
    <div class="coin-stage2-block">
      <h4 style="margin:14px 0 6px">Purchase requests</h4>
      <ul class="coin-intents-list" style="list-style:none;padding:0;margin:0;display:grid;gap:6px">${intents}</ul>
      <h4 style="margin:14px 0 6px">Transaction history</h4>
      <ul class="coin-history-list" style="list-style:none;padding:0;margin:0;display:grid;gap:4px;max-height:170px;overflow:auto;font-size:12px">${history}</ul>
      <p class="install-popup-note" style="margin-top:8px">Credits post only after team/provider confirmation (idempotent). Duplicate provider references are rejected. A request click never mints coins.</p>
    </div>
    <div class="install-popup-actions" style="margin-top:12px">
      <button type="button" class="secondary-action" onclick="openKycPayoutDraft()">OPay / Moniepoint payout details</button>
      <button type="button" class="secondary-action" onclick="openFinancialCase('payment','Problem with a coin purchase or withdrawal')">Report a money problem</button>
    </div>`;
}

function coinSellPaneHTML() {
  const engine = walletEngine();
  if (!engine) return `<p class="ab-panel-note">Withdrawals are unavailable on this page — the wallet engine did not load.</p>`;
  if (!hasPersonalSession()) {
    return `<div class="lb-empty" style="margin-top:8px">Sign in to withdraw coins to naira. Guests are free-play only — no real-money moves.</div>
      <button type="button" class="primary-action" style="margin-top:12px" onclick="requirePersonalSession('withdraw coins')">Sign in to withdraw</button>`;
  }
  applyWithdrawalStatuses();
  return `
    <div class="lb-pool-grid">
      <div class="lb-pool-stat"><b>${coinBalance().toLocaleString()} coins</b><small>available · sold back to naira through the Team payout desk (pendingBackendSync)</small></div>
    </div>
    <div id="withdrawal-host"></div>
    <div class="install-popup-actions" style="margin-top:12px">
      <button type="button" class="secondary-action" onclick="openFinancialCase('withdrawal','Problem with a withdrawal')">Report a problem</button>
    </div>`;
}

window.renderWalletTab = function() {
  const body = document.getElementById("wallet-body");
  if (!body) return;
  if (walletActiveTab === "sell") {
    body.innerHTML = coinSellPaneHTML();
    renderWithdrawalHost();
    return;
  }
  body.innerHTML = coinShopPaneHTML();
};

window.openCoinWallet = function(tab) {
  if (tab === "sell" || tab === "buy") walletActiveTab = tab;
  if (typeof document.createElement !== "function") return;
  if (!hasPersonalSession()) { requirePersonalSession("open your coin wallet"); return; }
  syncApprovedCoinCredits();
  const done = () => {
    document.getElementById("coin-shop-overlay")?.remove();
    closeAccountBox();
    const cfg = coinConfigFlags();
    const overlay = document.createElement("div");
    overlay.id = "coin-shop-overlay";
    overlay.className = "utility-overlay active install-overlay";
    overlay.innerHTML = `
      <div class="install-popup-card" style="width:min(560px,96vw);max-height:90vh;overflow:auto;" role="dialog" aria-modal="true" aria-label="Coin wallet">
        <header><h2>🪙 Paragon Coins — Wallet</h2>
          <p>Balance <b>${coinBalance().toLocaleString()} coins</b> · real-money ${cfg.realMoney ? "ON" : "OFF"}${cfg.pause ? " · FINANCIAL PAUSE" : ""}. Server ledger is the authority when SQL is live.</p>
        </header>
        ${coinWalletTabs()}
        <div id="wallet-body"></div>
        <div class="install-popup-actions">
          <button type="button" class="secondary-action" onclick="closeWalletOverlay()">Close</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add("popup-lock");
    overlay.addEventListener("click", event => { if (event.target === overlay) closeWalletOverlay(); });
    renderWalletTab();
  };
  return refreshCoinAccountFromServer().finally(done);
};

window.afterCoinIntent = function() {
  if (document.getElementById("wallet-body")) { renderWalletTab(); return; }
  try { openCoinShop(); } catch (error) { /* dormant */ }
};

/* ---------- Leaderboard hub popup (Engagement + Coins weekly tabs) ---------- */
function leaderboardHubTabs(active) {
  return `
    <div class="wallet-tabbar" role="tablist" aria-label="Leaderboards">
      <button type="button" class="wallet-tab ${active === "eng" ? "active" : ""}" onclick="showLeaderboardHubTab('eng')">⚡ Engagement board<small>Practice rank from real activity — Top 10</small></button>
      <button type="button" class="wallet-tab ${active === "coins" ? "active" : ""}" onclick="showLeaderboardHubTab('coins')">🪙 Coins weekly board<small>Coins Leaderboard — weekly top 3 + ranks 4–10 rewards (staked results only)</small></button>
    </div>`;
}

let leaderboardHubActive = "eng";
window.showLeaderboardHubTab = function(tab) {
  if (tab !== "coins" && tab !== "eng") return;
  leaderboardHubActive = tab;
  const engPane = document.getElementById("lb-hub-eng");
  const coinsPane = document.getElementById("lb-hub-coins");
  const tabsHost = document.getElementById("lb-hub-tabs");
  if (tabsHost) tabsHost.innerHTML = leaderboardHubTabs(leaderboardHubActive);
  if (engPane) engPane.style.display = tab === "eng" ? "block" : "none";
  if (coinsPane) {
    coinsPane.style.display = tab === "coins" ? "block" : "none";
    if (tab === "coins") { try { renderCoinLeaderboard(); } catch (error) { coinsPane.innerHTML = `<div class="lb-empty">The coins leaderboard engine is not available on this page yet.</div>`; } }
  }
};

function engagementBoardPaneHTML() {
  const snap = recordLeaderboardCheck ? (recordLeaderboardCheck(false) || computeMyLeaderboardRank(engagementScore())) : computeMyLeaderboardRank(engagementScore());
  return `
    <div class="leaderboard-you">Your score <strong>${Number(snap.score).toLocaleString()}</strong> · Rank <strong>#${snap.rank}</strong> · Best <strong>#${snap.best || snap.rank}</strong></div>
    <ol class="leaderboard-list">
      ${(snap.board || []).map((row, index) => `
        <li class="${row.isYou ? "is-you" : ""}">
          <span class="lb-rank">#${index + 1}</span>
          <span>${escapeHTML(row.name)}${row.isYou ? " <small>(you)</small>" : ""}</span>
          <span class="lb-score">${Number(row.score).toLocaleString()}</span>
        </li>`).join("")}
    </ol>`;
}

window.openLeaderboardHub = function() {
  if (!requirePersonalSession("view the leaderboards")) return;
  recordLeaderboardCheck(true);
  document.getElementById("leaderboard-hub-overlay")?.remove();
  document.getElementById("leaderboard-overlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "leaderboard-hub-overlay";
  overlay.className = "utility-overlay active install-overlay";
  overlay.innerHTML = `
    <div class="install-popup-card lb-card" role="dialog" aria-modal="true" aria-label="Leaderboards">
      <header><h2>🏆 Leaderboard</h2><p>Engagement practice rank from real Archive activity, and the weekly coins board with team-approved rewards. Coin competitions stay server-settled.</p></header>
      <div id="lb-hub-tabs">${leaderboardHubTabs("eng")}</div>
      <div id="lb-hub-eng">${engagementBoardPaneHTML()}</div>
      <div id="lb-hub-coins" style="display:none"><div id="coin-leaderboard-host"></div></div>
      <div class="install-popup-actions">
        <button type="button" class="secondary-action" onclick="document.getElementById('leaderboard-hub-overlay').remove(); document.body.classList.remove('popup-lock'); openCoinWallet('buy')">🪙 Buy coins</button>
        <button type="button" class="secondary-action" onclick="document.getElementById('leaderboard-hub-overlay').remove(); document.body.classList.remove('popup-lock')">Close</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("popup-lock");
  overlay.addEventListener("click", event => { if (event.target === overlay) { overlay.remove(); document.body.classList.remove("popup-lock"); } });
};

function renderAccount() {
  syncApprovedCoinCredits?.(); /* P-098 — pick up approved purchases */
  applyWithdrawalStatuses?.(); /* P-100 — refund failed withdrawals / mark paid ones seen */
  const hero = document.getElementById("account-hero");
  const privateArea = document.getElementById("account-private");
  if (!hero || !privateArea) return;

  if (identityLoading) {
    hero.classList.remove("logged-in");
    privateArea.hidden = true;
    clearAccountPrivate();
    hero.innerHTML = `<div class="account-loading"><span class="account-loading-ring"></span><strong>Checking your Paragon session…</strong></div>`;
    return;
  }

  if (!hasPersonalSession()) {
    hero.classList.remove("logged-in");
    // P-096 — the welcome splash now fires at DOMContentLoaded (moved out; D-172).
    privateArea.hidden = true;
    clearAccountPrivate();
    const configured = Boolean(authClient?.isConfigured());
    /* P-096 — guest hero v2: clean art-led card, two clear sign-in paths, one quiet guest
       line (the long warning text is no longer pushed in the user's face). */
    hero.innerHTML = `
      <div class="guest-hero-v2">
        <div class="guest-hero-copy">
          <h2>One account for every Paragon experience</h2>
          <p>Sign in once — bookmarks, reviews, needs and progress follow you across every Paragon website.</p>
          <div class="auth-btns">
            <button type="button" class="auth-btn" onclick="startGoogleAuth()"><svg class="g-icon" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.7 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.5 13.2l7.9 6.2C12.3 13.4 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.4 6.9-17.7z"/><path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.6l-7.7-6c-2.1 1.4-4.7 2.3-7.5 2.3-6.3 0-11.7-3.9-13.6-9.5l-7.9 6.2C6.5 42.6 14.6 48 24 48z"/></svg> Continue with Google</button>
            <button type="button" class="auth-btn" onclick="openEmailAuth('signin')"><svg class="mail-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="m3.5 7 8.5 6 8.5-6"/></svg> Continue with Email</button>
          </div>
          <button type="button" class="guest-link" onclick="guestLogin()">Just browsing — continue as Guest</button>
          <p class="guest-hint-quiet">Guest activity moves into your account when you sign in.</p>
        </div>
        <img class="guest-hero-art" src="assets/illustrations/guest-welcome.png" alt="" loading="lazy">
      </div>
      ${configured ? "" : `<p class="auth-config-warning">Authentication code is ready. Add your Supabase URL and anon key in <strong>config/supabase.js</strong> and enable Google + Email providers.</p>`}`;
    return;
  }

  hero.classList.add("logged-in");
  privateArea.hidden = false;
  const email = loggedIn ? (authUser?.email || "Authenticated account") : "No email · session-only";
  /* P-094 — the editable saved display name wins; the Google/email name is only the starting default. */
  const displayName = loggedIn
    ? (accountProfile.displayName || authUser?.user_metadata?.display_name || authUser?.user_metadata?.full_name || email.split("@")[0])
    : "Guest";
  const avatarUrl = loggedIn ? authUser?.user_metadata?.avatar_url : "";
  const username = loggedIn ? (accountProfile.username || authUser?.user_metadata?.username || "") : "guest";
  hero.innerHTML = `
    <div class="profile-header">
      <div class="avatar">${avatarUrl ? `<img src="${escapeHTML(avatarUrl)}" alt="${escapeHTML(displayName)} profile avatar">` : guestMode ? `<img src="assets/illustrations/default-avatar.png" alt="Guest avatar">` : `<span class="avatar-fallback">${escapeHTML(displayName.slice(0, 1).toUpperCase())}</span>`}</div>
      <div class="info"><h2>${escapeHTML(displayName)}${loggedIn ? ` <button type="button" class="profile-edit-pencil" onclick="openProfileNameEditor()" aria-label="Edit your display name" title="Edit your display name">✏️</button>` : ""}</h2><div class="email">${username ? `@${escapeHTML(username)} · ` : ""}${escapeHTML(email)}</div><div class="profile-badges"><span class="badge">${loggedIn ? (isCreatorDemoUser() ? "Creator Demo · Real Email Auth" : `${providerLabel(authUser)} account · Synced`) : "Guest session · Not saved after session"}</span>${loggedIn ? `<span class="badge member-since">Member since ${registrationDateLabel()}</span>` : ""}${communityMembershipRecord() ? `<span class="badge community-member-chip">👥 Community Member</span>` : ""}</div></div>
      <span class="profile-header-tools">
        ${loggedIn ? `<button type="button" class="profile-edit-pencil" onclick="openProfileNameEditor()" aria-label="Edit your profile name" title="Edit your profile name">✏️ Edit</button>` : ""}
        <button type="button" class="secondary-action profile-logout" onclick="logout()">${guestMode ? "End guest session" : "Log out"}</button>
      </span>
    </div>`;

  const allTasks = achievementTasks();
  const completedTasks = allTasks.filter(task => task.complete).length;
  const achievementPercent = allTasks.length ? Math.round((completedTasks / allTasks.length) * 100) : 0;
    renderAccountBoxes();

  renderProgressAccount();
  renderAchievementsAccount();

  renderSavedAccount();
  renderCollectionsAccount();
  renderVisitedAccount();
  renderAccountReviews();

  const notificationsOn = notificationsEnabled();
  const darkEnabled = !document.documentElement.classList.contains("light");
  document.getElementById("settings-row").innerHTML = `
    <div class="settings-group settings-group-v2">
      <div class="row"><div><h4>🔔 Notifications</h4><p>${guestMode ? "Temporary for this session." : "Sync notification preferences."}</p></div><label><input type="checkbox" class="toggle" ${notificationsOn ? "checked" : ""} onchange="toggleNotificationsPreference(this)" aria-label="Notifications"></label></div>
      ${loggedIn && providerLabel(authUser) === "Email" ? `<div class="row"><button type="button" class="settings-link" onclick="openPasswordUpdate()"><span>🔑 Change Password</span></button></div>` : ""}
      <div class="row"><button type="button" class="settings-link" onclick="openParagonInstall()"><span>📲 Install Paragon Archive &amp; app permissions</span></button></div>
      <div class="row"><button type="button" class="settings-link" onclick="openGamesCompeteDesk()"><span>⚔️ 1v1 competitive stake (server settle · free play separate)</span></button></div>
      <div class="row"><button type="button" class="settings-link" onclick="shareParagonApp()"><span>📤 Share Paragon Archive (install link)</span></button></div>
      <div class="row"><button type="button" class="settings-link" onclick="openCommunityEntry()"><span>${communityMembershipRecord() ? "👥 Paragon Community · Open the Board" : "👥 Paragon Community"}</span></button></div>
      <div class="row"><a class="settings-link" href="paragon-archive-hub.html"><span><img class="settings-brand-mark" src="assets/brand/logo-mark.png" alt=""> Paragon Archive Hub</span></a></div>
      <div class="row"><button type="button" class="settings-link" onclick="openWebsiteRequest()"><span>💬 Request a Website</span></button></div>
      <div class="row"><button type="button" class="settings-link" onclick="openBecomeDeveloper()"><span>🧑‍💻 Become a Developer</span></button></div>
      <div class="settings-trio">
        <button type="button" class="settings-trio-btn" onclick="openSupportOverlay()"><span>🆘</span><b>Help &amp; Support</b></button>
        <button type="button" class="settings-trio-btn" onclick="openFaqOverlay()"><span>❓</span><b>FAQ</b></button>
        <button type="button" class="settings-trio-btn" onclick="openPrivacyControls()"><span>🔒</span><b>Privacy</b></button>
      </div>
    </div>`;
}

/* P-086 — Community smart entry: members go straight to the Board; everyone else
   gets the six-step join reminder popup (steps animate up), then completes in the Hub. */
/* P-090 — Become a Developer popup (the former hub landing dev section lives here now) */
window.openBecomeDeveloper = function() {
  const overlay = ensureUtilityOverlay("become-dev-overlay");
  overlay.innerHTML = `
    <div class="utility-sheet" role="dialog" aria-modal="true" aria-label="Become a Paragon developer">
      <div class="utility-sheet-head"><strong>💼 Want to build with Paragon?</strong><button type="button" onclick="closeUtilityOverlay('become-dev-overlay')" aria-label="Close">×</button></div>
      <p class="utility-sheet-sub">The Deployed programme lets approved developers publish websites inside the Archive.</p>
      <ul class="join-steps-anim" style="margin-bottom:14px;">
        <li><b>📋</b><div><strong>Read the requirements</strong><small>Developer standards and the real 8-point review gate.</small></div></li>
        <li><b>💼</b><div><strong>Apply on the Developer Portal</strong><small>Your application lands on the real Team desk (live backend when signed in).</small></div></li>
        <li><b>🚀</b><div><strong>Submit websites</strong><small>Approved sites join the public Deployed category.</small></div></li>
      </ul>
      <a class="primary-action utility-sheet-cta" href="developer-portal.html">🧑‍💻 Open the Developer Portal</a>
    </div>`;
  overlay.classList.add("active");
};

window.openCommunityEntry = async function() {
  try { if (hasPersonalSession()) { accountProfile.communityOpenCount = Number(accountProfile.communityOpenCount || 0) + 1; persistPersonalState(); renderAchievementsAccount(); } } catch (_) {}
  if (communityMembershipRecord()) { window.location.href = "community-board.html"; return; }
  const overlay = ensureUtilityOverlay("community-join-overlay");
  overlay.innerHTML = `
    <div class="utility-sheet utility-sheet-wide" role="dialog" aria-modal="true" aria-label="Join the Paragon Community">
      <div class="utility-sheet-head"><strong>👥 Join the Community</strong><button type="button" onclick="closeUtilityOverlay('community-join-overlay')" aria-label="Close">×</button></div>
      <div id="join-doc-view"><p class="utility-sheet-sub">Loading the official membership section…</p></div>
      <div id="join-guidelines-view" hidden></div>
      <div id="join-profile-view" hidden></div>
      <div id="join-action-area" class="join-action-area">
        <button type="button" id="join-profile-btn" class="secondary-action join-incomplete">📝 Complete your community profile — INCOMPLETE</button>
        <p id="join-profile-state" class="team-site-sub" style="margin:0;">Step 4 happens right here — complete it to unlock the guidelines.</p>
        <button type="button" id="join-read-guidelines" class="secondary-action" disabled>📜 Read the Community Guidelines</button>
        <label class="join-accept-row join-locked" id="join-accept-row"><input type="checkbox" id="join-accept-check" disabled> I have read and accept the Community Guidelines</label>
        <button type="button" id="join-now-btn" class="primary-action" disabled>🎉 Join the Paragon Community</button>
        <p id="join-status" class="auth-form-status" aria-live="polite"></p>
      </div>
    </div>`;
  overlay.classList.add("active");
  const docView = document.getElementById("join-doc-view");
  const guideView = document.getElementById("join-guidelines-view");
  /* P-092 — steps mark themselves from REAL user state, like the documentation wizard. */
  let joinUser = null;
  try { joinUser = await window.ParagonAuth?.getCurrentUser?.(); } catch (error) { joinUser = null; }
  const emailVerifiedNow = Boolean(joinUser?.email_confirmed_at);
  try {
    const response = await fetch("paragon-archive-hub.html");
    const html = await response.text();
    // The REAL documentation join section (title + six steps), minus the wizard card (this popup provides the working flow).
    const start = html.indexOf('aria-labelledby="community-join-title"');
    const sectionStart = html.lastIndexOf("<section", start);
    const cardStart = html.indexOf('<div id="community-join-card"', sectionStart);
    docView.innerHTML = html.slice(sectionStart, cardStart);
    const markStep = (step, done) => {
      const li = docView.querySelector(`[data-community-step="${step}"]`);
      if (li && done) li.classList.add("popup-step-done");
    };
    markStep(1, Boolean(joinUser));
    markStep(2, emailVerifiedNow);
    markStep(3, true); // they found their way here
    markStep(4, Boolean((() => { try { return JSON.parse(window.localStorage.getItem("paragonCommunityProfileDraft.v1") || "null"); } catch (error) { return null; } })()));
    // Guidelines section for the in-popup reader
    const gStart = html.indexOf('<section id="community-guidelines"');
    const gEnd = html.indexOf("</section>", gStart) + 10;
    guideView.innerHTML = `<button type="button" id="join-guidelines-back" class="secondary-action">◂ Back to the steps</button>` + html.slice(gStart, gEnd) + `<button type="button" id="join-guidelines-accept" class="primary-action" style="margin-top:12px;">✅ I accept the Community Guidelines</button>`;
  } catch (error) {
    docView.innerHTML = `<p class="utility-sheet-sub">Could not load the documentation section offline — the steps also live in the <a href="paragon-archive-hub.html#community">Hub</a>.</p>`;
  }
  const acceptCheck = document.getElementById("join-accept-check");
  const joinBtn = document.getElementById("join-now-btn");
  const statusNode = document.getElementById("join-status");
  const showGuidelines = show => {
    docView.hidden = show;
    document.getElementById("join-action-area").hidden = show;
    guideView.hidden = !show;
    if (show) guideView.scrollIntoView({ block: "nearest" });
  };
  /* P-090 — step 4 in-popup: the community profile form (display name, bio, interests) */
  const profileView = document.getElementById("join-profile-view");
  const profileState = document.getElementById("join-profile-state");
  const PROFILE_DRAFT_KEY = "paragonCommunityProfileDraft.v1";
  const readProfileDraft = () => { try { return JSON.parse(window.localStorage.getItem(PROFILE_DRAFT_KEY) || "null"); } catch (error) { return null; } };
  /* P-091 — strict step order: profile, then guidelines, then checkbox (auto-only), then join. */
  let guidelinesAccepted = false;
  const refreshProfileState = () => {
    const draft = readProfileDraft();
    const profileBtn = document.getElementById("join-profile-btn");
    const guideBtn = document.getElementById("join-read-guidelines");
    const acceptRow = document.getElementById("join-accept-row");
    if (draft) {
      profileBtn.classList.remove("join-incomplete");
      profileBtn.classList.add("join-complete");
      profileBtn.innerHTML = "✅ Community profile COMPLETE — " + escapeHTML(draft.displayName);
      guideBtn.disabled = false;
      acceptRow.classList.remove("join-locked");
      profileState.textContent = draft.interests.length ? "Interests: " + draft.interests.join(", ") + " · guidelines unlocked." : "Profile saved · guidelines unlocked.";
    } else {
      profileBtn.classList.add("join-incomplete");
      profileBtn.classList.remove("join-complete");
      profileBtn.innerHTML = "📝 Complete your community profile — INCOMPLETE";
      guideBtn.disabled = true;
      acceptRow.classList.add("join-locked");
      profileState.textContent = "Step 4 happens right here — complete it to unlock the guidelines.";
    }
  };
  refreshProfileState();
  /* Steps 1 & 2 gate step 4: no profile form until signed in AND verified. */
  if (!joinUser || !emailVerifiedNow) {
    const profileBtn = document.getElementById("join-profile-btn");
    profileBtn.disabled = true;
    profileState.textContent = !joinUser ? "Steps 1–2 first: sign in with a real account (Account tab), verify your email, then return here." : "Step 2 first: verify your email (check your inbox), then return here.";
  }
  const showProfile = show => {
    docView.hidden = show;
    document.getElementById("join-action-area").hidden = show;
    profileView.hidden = !show;
  };
  document.getElementById("join-profile-btn").addEventListener("click", () => {
    const draft = readProfileDraft() || { displayName: "", bio: "", interests: [] };
    const interestOptions = ["Tools", "Games", "Education", "Creative", "Media", "Finance", "Health", "Dev Tools"];
    profileView.innerHTML = `
      <button type="button" id="join-profile-back" class="secondary-action">◂ Back to the steps</button>
      <h3 class="join-profile-title">📝 Your community profile</h3>
      <label class="auth-field"><span>Display name *</span><input id="join-profile-name" type="text" maxlength="40" value="${escapeHTML(draft.displayName)}"></label>
      <label class="auth-field"><span>Bio (optional)</span><textarea id="join-profile-bio" rows="2" maxlength="160">${escapeHTML(draft.bio)}</textarea></label>
      <p class="team-site-sub">Interests</p>
      <div id="join-profile-interests" class="chips">${interestOptions.map(interest => `<button type="button" class="chip ${draft.interests.includes(interest) ? "active" : ""}" data-interest="${interest}">${interest}</button>`).join("")}</div>
      <p id="join-profile-error" class="auth-form-status error" style="display:none;"></p>
      <button type="button" id="join-profile-save" class="primary-action" style="margin-top:12px;">💾 Save profile</button>`;
    showProfile(true);
    profileView.querySelector("#join-profile-back").addEventListener("click", () => showProfile(false));
    profileView.querySelector("#join-profile-interests").addEventListener("click", event => {
      const chip = event.target.closest("[data-interest]");
      if (chip) chip.classList.toggle("active");
    });
    profileView.querySelector("#join-profile-save").addEventListener("click", () => {
      const name = profileView.querySelector("#join-profile-name").value.trim();
      const errorNode = profileView.querySelector("#join-profile-error");
      if (name.length < 3) { errorNode.textContent = "Display name needs at least 3 characters."; errorNode.style.display = "block"; return; }
      const interests = [...profileView.querySelectorAll("[data-interest].active")].map(chip => chip.dataset.interest);
      try { window.localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify({ displayName: name, bio: profileView.querySelector("#join-profile-bio").value.trim(), interests, savedAt: new Date().toISOString() })); } catch (error) { /* blocked */ }
      showProfile(false);
      refreshProfileState();
      statusNode.textContent = "📝 Profile saved — guidelines next, then the Join button.";
      statusNode.className = "auth-form-status success";
    });
  });
  document.getElementById("join-read-guidelines").addEventListener("click", () => {
    if (!readProfileDraft()) return;
    showGuidelines(true);
  });
  guideView.addEventListener("click", event => {
    if (event.target.id === "join-guidelines-back") showGuidelines(false);
    if (event.target.id === "join-guidelines-accept") {
      guidelinesAccepted = true;
      docView.querySelector('[data-community-step="5"]')?.classList.add("popup-step-done");
      acceptCheck.checked = true;
      acceptCheck.disabled = true; // no turning back once accepted
      joinBtn.disabled = false;
      showGuidelines(false);
      statusNode.textContent = "Guidelines accepted — locked in. One click left!";
      statusNode.className = "auth-form-status success";
    }
  });
  /* The checkbox can NEVER be ticked by hand — only the in-guidelines Accept button sets it. */
  acceptCheck.addEventListener("click", event => {
    if (guidelinesAccepted) { event.preventDefault(); return; } // locked after acceptance
    event.preventDefault();
    acceptCheck.checked = false;
    if (!readProfileDraft()) {
      statusNode.textContent = "Finish step 4 first — complete your community profile above.";
    } else {
      statusNode.textContent = "Read the guidelines first — tap “📜 Read the Community Guidelines”, scroll through, and press Accept there. It doesn’t take forever! 😄";
      document.getElementById("join-read-guidelines").classList.add("need-pop");
      window.setTimeout(() => document.getElementById("join-read-guidelines")?.classList.remove("need-pop"), 400);
    }
    statusNode.className = "auth-form-status error";
  });
  joinBtn.addEventListener("click", async () => {
    if (!acceptCheck.checked) return;
    let user = null;
    try { user = await window.ParagonAuth?.getCurrentUser?.(); } catch (error) { user = null; }
    if (!user) {
      statusNode.textContent = "Step 1 first: you need a real signed-in account (Guests cannot join). Sign in from the Account tab and come back.";
      statusNode.className = "auth-form-status error";
      return;
    }
    const savedDraft = readProfileDraft();
    const displayName = (savedDraft && savedDraft.displayName) || user.user_metadata?.display_name || user.user_metadata?.full_name || (user.email || "Member").split("@")[0];
    try {
      window.localStorage.setItem(`paragonCommunityMembership:${user.id}`, JSON.stringify({
        joinedAt: new Date().toISOString(), email: user.email || "", displayName,
        bio: (savedDraft && savedDraft.bio) || "", interests: (savedDraft && savedDraft.interests) || [], guidelinesAcceptedAt: new Date().toISOString(),
        emailVerifiedAtJoin: Boolean(user.email_confirmed_at), pendingBackendSync: true
      }));
    } catch (error) { /* storage blocked */ }
    statusNode.textContent = "🎉 BOOM — you are in! Welcome to the Paragon Community.";
    statusNode.className = "auth-form-status success";
    joinBtn.textContent = "💬 Open the Community Board";
    joinBtn.disabled = false;
    joinBtn.onclick = () => { window.location.href = "community-board.html"; };
    renderAccount();
  });
};

/* P-086 — in-app Help & Support popup (form queues honestly until the support backend) */
window.openSupportOverlay = function() {
  const overlay = ensureUtilityOverlay("support-overlay");
  overlay.innerHTML = `
    <div class="utility-sheet" role="dialog" aria-modal="true" aria-label="Help and Support">
      <div class="utility-sheet-head"><strong>🆘 Help &amp; Support</strong><button type="button" onclick="closeUtilityOverlay('support-overlay')" aria-label="Close">×</button></div>
      <p class="utility-sheet-sub">Real people read every message. Replies within 72 hours.</p>
      <label class="auth-field"><span>Your email</span><input id="support-email" type="email" placeholder="you@example.com"></label>
      <label class="auth-field"><span>Topic</span><select id="support-topic"><option>Question</option><option>Problem with a website</option><option>Account help</option><option>Bug report</option><option>Something else</option></select></label>
      <label class="auth-field"><span>Message</span><textarea id="support-message" rows="4" maxlength="1000" placeholder="Tell us what you need…"></textarea></label>
      <p id="support-status" class="auth-form-status" aria-live="polite"></p>
      <div class="utility-sheet-actions">
        <a class="secondary-action" href="mailto:paragon.archive.2026@gmail.com?subject=Support">✉️ Email instead</a>
        <button type="button" class="primary-action" onclick="submitSupportMessage()">Send message</button>
      </div>
    </div>`;
  overlay.classList.add("active");
};
window.submitSupportMessage = function() {
  const email = document.getElementById("support-email").value.trim();
  const message = document.getElementById("support-message").value.trim();
  const status = document.getElementById("support-status");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
    status.textContent = "A valid email and a message of at least 10 characters are required.";
    status.className = "auth-form-status error";
    return;
  }
  const topic = document.getElementById("support-topic").value;
  /* P-092 — the message becomes a REAL ticket on the Team desk (not an email):
     the team replies from tickets, and the reply lands in the user's in-app inbox. */
  try {
    const tickets = JSON.parse(window.localStorage.getItem("paragonTeamTickets.v1") || "null") || [];
    tickets.push({
      id: `TCK-${Date.now()}`,
      subject: topic + " — in-app support",
      topic,
      message,
      user: email,
      email,
      origin: "in-app",
      status: "open",
      priority: "medium",
      createdAt: new Date().toISOString(),
      thread: [{ author: email, team: false, at: new Date().toISOString(), text: message }],
      pendingBackendSync: true
    });
    window.localStorage.setItem("paragonTeamTickets.v1", JSON.stringify(tickets));
  } catch (error) { /* storage blocked */ }
  // Close the popup, clear the form, then celebrate.
  document.getElementById("support-email").value = "";
  document.getElementById("support-message").value = "";
  status.textContent = "";
  window.closeUtilityOverlay("support-overlay");
  window.showSuccessOverlay("Message sent to the Paragon Team", "Your ticket is on the real Team desk. The reply arrives in your in-app notifications — usually within 72 hours.");
};

/* P-086 — FAQ popup: pulls the EXACT FAQ from the Hub documentation (always in sync) */
window.openFaqOverlay = async function() {
  const overlay = ensureUtilityOverlay("faq-overlay");
  overlay.innerHTML = `<div class="utility-sheet utility-sheet-wide" role="dialog" aria-modal="true" aria-label="Frequently Asked Questions"><div class="utility-sheet-head"><strong>❓ Frequently Asked Questions</strong><button type="button" onclick="closeUtilityOverlay('faq-overlay')" aria-label="Close">×</button></div><div id="faq-overlay-body"><p class="utility-sheet-sub">Loading the documentation FAQ…</p></div></div>`;
  overlay.classList.add("active");
  try {
    const response = await fetch("paragon-archive-hub.html");
    const html = await response.text();
    const start = html.indexOf('<section class="support-faq-card"');
    const end = html.indexOf("</section>", html.lastIndexOf("faq-group"));
    if (start === -1 || end === -1) throw new Error("FAQ section not found");
    document.getElementById("faq-overlay-body").innerHTML = html.slice(start, end + 10);
  } catch (error) {
    document.getElementById("faq-overlay-body").innerHTML = `<p class="utility-sheet-sub">Could not load the FAQ offline — open it in the <a href="paragon-archive-hub.html#help">Hub documentation</a>.</p>`;
  }
};

/* P-092 — shared success overlay: closes the form popup first, then celebrates
   (illustration + animated SVG circle-check), auto-fades like the welcome splash. */
window.showSuccessOverlay = function(title, message) {
  const overlay = document.createElement("div");
  overlay.id = "success-overlay";
  overlay.innerHTML = `
    <div class="success-overlay-card">
      <img src="${title.includes("inbox") ? "assets/illustrations/email-verify.png" : "assets/illustrations/success-submit.png"}" alt="">
      <svg class="anim-check" viewBox="0 0 52 52" aria-hidden="true"><circle class="anim-check-circle" cx="26" cy="26" r="23" pathLength="100"/><path class="anim-check-mark" d="M14 27l8 8 16-17" pathLength="100"/></svg>
      <strong>${escapeHTML(title)}</strong>
      <span>${escapeHTML(message)}</span>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("popup-lock");
  requestAnimationFrame(() => overlay.classList.add("show"));
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => {
    overlay.classList.add("fade");
    window.setTimeout(() => {
      overlay.remove();
      if (!document.querySelector(".utility-overlay.active, .share-sheet-overlay.active, #welcome-splash")) document.body.classList.remove("popup-lock");
    }, reduced ? 60 : 600);
  }, reduced ? 700 : 2800);
};

function ensureUtilityOverlay(id) {
  let overlay = document.getElementById(id);
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = id;
    overlay.className = "share-sheet-overlay utility-overlay";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", event => { if (event.target === overlay) window.closeUtilityOverlay(id); });
  }
  document.body.classList.add("popup-lock"); // P-091 — nothing behind a popup scrolls or clicks
  return overlay;
}
window.closeUtilityOverlay = function(id) {
  document.getElementById(id)?.classList.remove("active");
  if (!document.querySelector(".utility-overlay.active, .share-sheet-overlay.active, #welcome-splash")) document.body.classList.remove("popup-lock");
};

async function activateAuthenticatedSession(session) {
  let guestStateToMerge = null;
  try {
    const guestFlag = window.sessionStorage.getItem(localKeys.guestSession) === "true";
    if (guestFlag && !guestSessionExpired()) guestStateToMerge = readStorageJSON(window.sessionStorage, localKeys.guestState, {});
    else if (guestFlag) clearGuestSessionStorage();
  } catch (error) { /* no transferable Guest state */ }

  loggedIn = true;
  guestMode = false;
  authUser = session?.user || await authClient?.getCurrentUser?.();
  clearPersonalState();
  let accountState = syncClient?.emptyState?.() || {};
  let accountStateLoaded = !(syncClient && authClient?.isConfigured());
  if (syncClient && authClient?.isConfigured()) {
    try { accountState = await syncClient.loadState(); accountStateLoaded = true; }
    catch (error) { showToast(`Signed in, but account data could not load: ${error.message}`, "warning"); }
  }
  applyPersonalState(guestStateToMerge ? mergePersonalStates(accountState, guestStateToMerge) : accountState);

  let profileChanged = Boolean(guestStateToMerge);
  try {
    const authProfile = await authClient?.getProfile?.();
    if (authProfile?.username && accountProfile.username !== authProfile.username) { accountProfile.username = authProfile.username; profileChanged = true; }
  } catch (error) { /* profile table may not be activated yet */ }
  if (!accountProfile.username) {
    accountProfile.username = authUser?.user_metadata?.username || String(authUser?.email || "paragon_user").split("@")[0].replace(/[^A-Za-z0-9_]/g, "_").slice(0, 24);
    profileChanged = true;
  }
  /* P-094 — the account profile starts from the Google/email name and stays editable forever. */
  if (!accountProfile.displayName) {
    accountProfile.displayName = authUser?.user_metadata?.display_name || authUser?.user_metadata?.full_name || String(authUser?.email || "Paragon Member").split("@")[0];
    profileChanged = true;
  }
  if (!accountProfile.registeredAt) {
    accountProfile.registeredAt = authUser?.created_at || new Date().toISOString();
    profileChanged = true;
  }
  const expectedType = isCreatorDemoUser(authUser) ? "creator_demo" : "standard";
  if (accountProfile.accountType !== expectedType) { accountProfile.accountType = expectedType; profileChanged = true; }
  if (ensureStarterCollections()) profileChanged = true;

  if (accountStateLoaded) synchronizeNotificationFeed();
  else renderNotificationList();
  let stateSaved = !guestStateToMerge;
  if ((profileChanged || guestStateToMerge) && accountStateLoaded && syncClient && authClient?.isConfigured()) {
    try {
      await syncClient.saveState(personalStateSnapshot());
      stateSaved = true;
    } catch (error) {
      showToast(`Signed in, but Guest/account transfer is waiting to sync: ${error.message}`, "warning");
    }
  }
  if (guestStateToMerge && stateSaved) {
    clearGuestSessionStorage({ keepDraft: true });
    showToast("Your live Guest bookmarks, reviews, collections, history and progress were merged into this account.");
  } else if (!guestStateToMerge) {
    try {
      window.sessionStorage.removeItem(localKeys.guestSession);
      window.sessionStorage.removeItem(localKeys.guestState);
      window.sessionStorage.removeItem(localKeys.guestInactiveSince);
    } catch (error) { /* ignore */ }
  }

  identityLoading = false;
  renderAccount();
  renderUpdates();
  renderNotificationList();
  syncNotificationPreference();
  resumePendingPersonalIntent();
}

async function initializeIdentity() {
  identityLoading = true;
  renderAccount();
  try {
    const callbackSession = authClient?.isConfigured() ? await authClient.handleOAuthCallback() : null;
    const session = callbackSession || await authClient?.getSession?.();
    if (session?.user) {
      await activateAuthenticatedSession(session);
      if (session.auth_type === "recovery") {
        showToast("Set a new password to complete account recovery.", "warning");
        window.openPasswordUpdate();
      }
      return;
    }
  } catch (error) {
    showToast(`Authentication could not initialize: ${error.message}`, "warning");
  }

  loggedIn = false;
  authUser = null;
  try { guestMode = window.sessionStorage.getItem(localKeys.guestSession) === "true"; }
  catch (error) { guestMode = false; }
  if (guestMode && guestSessionExpired()) {
    clearGuestSessionStorage();
    guestMode = false;
    showToast("The previous Guest session expired after 30 minutes away or offline.", "warning");
  }
  if (guestMode) {
    applyPersonalState(readStorageJSON(window.sessionStorage, localKeys.guestState, {}));
    ensureStarterCollections();
    persistPersonalState();
  } else clearPersonalState();
  identityLoading = false;
  renderAccount();
  renderUpdates();
  renderNotificationList();
  syncNotificationPreference();
  if (guestMode) { evaluateGuestActivity(); resumePendingPersonalIntent(); }

  if (!authListenerBound && authClient?.onAuthStateChange) {
    authListenerBound = true;
    authClient.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && loggedIn) {
        loggedIn = false; authUser = null; clearPersonalState(); renderAccount(); renderUpdates(); renderNotificationList(); syncNotificationPreference();
      } else if (event === "SIGNED_IN" && session?.user && !loggedIn) {
        activateAuthenticatedSession(session);
        /* P-094 — every login replays the full welcome loading experience (owner rule),
           with the hero art preloaded first so it never flashes in half-loaded. */
        try { window.sessionStorage.removeItem("paragonArchive.welcomeSplash.v1"); } catch (error) { /* blocked */ }
        showWelcomeSplash();
      }
    });
  }
}
window.initializeIdentity = initializeIdentity;

window.startGoogleAuth = function() {
  if (!authClient?.isConfigured()) {
    showToast("Add your Supabase URL and anon key in config/supabase.js before using Google sign-in.", "warning");
    return;
  }
  try { authClient.signInWithGoogle(); }
  catch (error) { showToast(error.message, "warning"); }
};

function setAuthMode(mode) {
  authMode = mode === "signup" ? "signup" : mode === "password" ? "password" : "signin";
  document.querySelectorAll("[data-auth-mode]").forEach(button => {
    const active = button.dataset.authMode === authMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  const nameField = document.getElementById("auth-name-field");
  const usernameField = document.getElementById("auth-username-field");
  const usernameInput = document.getElementById("auth-username");
  const emailField = document.getElementById("auth-email-field");
  const emailInput = document.getElementById("auth-email");
  const modeTabs = document.getElementById("auth-mode-tabs");
  const password = document.getElementById("auth-password");
  if (nameField) nameField.hidden = authMode !== "signup";
  if (usernameField) usernameField.hidden = authMode !== "signup";
  if (usernameInput) usernameInput.disabled = authMode !== "signup";
  if (emailField) emailField.hidden = authMode === "password";
  if (emailInput) emailInput.disabled = authMode === "password";
  if (modeTabs) modeTabs.hidden = authMode === "password";
  if (password) password.autocomplete = authMode === "signin" ? "current-password" : "new-password";
  document.getElementById("auth-dialog-title").textContent = authMode === "signup" ? "Create your Paragon account" : authMode === "password" ? "Set a new password" : "Sign in with Email";
  document.getElementById("auth-submit").textContent = authMode === "signup" ? "Create account" : authMode === "password" ? "Update password" : "Sign in";
  document.getElementById("auth-forgot-password").hidden = authMode !== "signin";
  setAuthFormStatus("");
}

function setAuthFormStatus(message, tone = "") {
  const status = document.getElementById("auth-form-status");
  if (!status) return;
  status.textContent = message;
  status.className = `auth-form-status ${tone}`.trim();
}

window.openEmailAuth = function(mode = "signin") {
  const overlay = document.getElementById("auth-overlay");
  if (!overlay) return;
  authReturnFocus = document.activeElement;
  setAuthMode(mode);
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("auth-open");
  requestAnimationFrame(() => document.getElementById("auth-email")?.focus());
};



/* =====================================================================
   P-098/P-101/P-102 — PARAGON COINS
   Master rules:
   • Browser balance is DISPLAY/CACHE only — server ledger is authority when SQL is live.
   • Guest = free-play only (no buy / withdraw / stake).
   • real_money_enabled comes from paragon_public_coin_config (default false).
   • No fake bank confirmations. Purchase = team/RPC confirm after real transfer.
   ===================================================================== */
function opayMoniepointPayMarkup() {
  const p = (window.ParagonCoinPublicConfig || {}).provider || {};
  const rails = Array.isArray(p.preferred_rails) ? p.preferred_rails : ["opay", "moniepoint", "manual_bank"];
  const opay = p.opay || {};
  const moni = p.moniepoint || {};
  const esc = (v) => String(v || "").replace(/[<>]/g, "");
  const card = (title, acct) => {
    if (!acct || (!acct.account_number && !acct.account_name)) return "";
    return `<div class="coin-rail-card"><strong>${esc(title)}</strong>
      <div>${esc(acct.bank_name || title)}</div>
      <div>${esc(acct.account_name || "")}</div>
      <div class="coin-rail-number">${esc(acct.account_number || "— set by team —")}</div>
      ${acct.label ? `<small>${esc(acct.label)}</small>` : ""}</div>`;
  };
  const cards = [
    rails.includes("opay") ? card("OPay", opay) : "",
    rails.includes("moniepoint") ? card("Moniepoint", moni) : ""
  ].filter(Boolean).join("");
  const instructions = esc(p.bank_transfer_instructions || p.support_contact_note ||
    "Transfer with OPay or Moniepoint. Put your Paragon email in the narration. Coins credit only after confirmation — never from this click alone.");
  return `<div class="install-popup-note coin-rails-block" style="margin-top:10px;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.08)">
    <b>How to pay (Nigeria — OPay / Moniepoint first) · real-money OFF · Stage 1 ledger</b>
    <p style="margin:8px 0;font-size:12px;line-height:1.45">${instructions}</p>
    <div class="coin-rails-grid">${cards || "<small>Team will publish OPay/Moniepoint account numbers after phase5 SQL + settings update. Flutterwave is <em>not</em> required.</small>"}</div>
  </div>`;
}

function coinConfigFlags() {
  const cfg = window.ParagonCoinPublicConfig || {};
  const flags = cfg.flags || cfg.economy && cfg.flags || {};
  const economy = cfg.economy || {};
  return {
    realMoney: !!(flags.real_money_enabled),
    purchases: flags.purchases_enabled !== false, /* manual path allowed while real money off */
    withdrawals: flags.withdrawals_enabled !== false,
    compete: !!flags.compete_enabled,
    pause: !!flags.financial_pause,
    nairaPerCoinBuy: Number(economy.naira_per_coin_purchase) || 1,
    nairaPerCoinOut: Number(economy.naira_per_coin_redeemable) || 1,
    minPurchase: Number(economy.min_purchase_naira) || 500,
    minWithdraw: Number(economy.min_withdraw_coins) || 500,
    feeAt: Number(economy.withdraw_fee_coins_at_or_above) || 10000,
    feeCoins: Number(economy.withdraw_fee_coins) || 50,
    packs: Array.isArray(economy.packs) ? economy.packs : [
      { naira: 500, coins: 500, label: "Starter" },
      { naira: 1000, coins: 1000, label: "Standard" },
      { naira: 5000, coins: 5000, label: "Pro" }
    ]
  };
}

function isRegisteredMember() {
  return !!(authUser && authUser.email && !String(authUser.email).includes("Guest"));
}

function coinBalance() {
  /* Prefer server account cache when present */
  if (accountProfile.coinAccount && accountProfile.coinAccount.available_coins != null) {
    return Math.max(0, Math.round(Number(accountProfile.coinAccount.available_coins) || 0));
  }
  return Math.max(0, Math.round(Number(accountProfile.coinBalance || 0)));
}

function coinBalanceBuckets() {
  const a = accountProfile.coinAccount || {};
  return {
    available: Math.max(0, Math.round(Number(a.available_coins != null ? a.available_coins : accountProfile.coinBalance) || 0)),
    locked: Math.max(0, Math.round(Number(a.locked_coins) || 0)),
    pending: Math.max(0, Math.round(Number(a.pending_coins) || 0)),
    restricted: Math.max(0, Math.round(Number(a.restricted_coins) || 0))
  };
}

/* Same-device team desk mirrors (offline prototype). Never treat as bank proof. */
function syncApprovedCoinCredits() {
  try {
    if (!isRegisteredMember()) return;
    const who = authUser?.email || "";
    const credits = JSON.parse(window.localStorage.getItem("paragonArchive.coinCredits.v1") || "[]");
    const mine = credits.filter(credit => credit.for === who && !credit.claimed);
    if (mine.length) {
      let total = 0;
      let rewards = 0;
      mine.forEach(credit => {
        const coins = Number(credit.coins) || 0;
        total += coins;
        if (credit.kind === "weekly-leaderboard-reward") rewards += coins;
        /* P-100 — every credit also lands in the typed finance ledger (one credit per claim). */
        const ledgerUser = String(who).trim().toLowerCase();
        if (ledgerUser && window.ParagonWallets) {
          try {
            window.ParagonWallets.appendLedger({
              user: ledgerUser,
              type: credit.kind === "weekly-leaderboard-reward" ? "LEADERBOARD_REWARD" : "PURCHASE_CREDIT",
              amount: coins,
              refType: "credit",
              ref: credit.id || "",
              reason: credit.kind === "weekly-leaderboard-reward" ? "Weekly leaderboard reward" : "Coin purchase approved",
              idempotencyKey: "credit-" + (credit.id || "")
            });
          } catch (error) { /* blocked */ }
        }
        credit.claimed = true;
      });
      window.localStorage.setItem("paragonArchive.coinCredits.v1", JSON.stringify(credits));
      addCoinsLocal(total, rewards ? "Weekly leaderboard reward approved by the Paragon Team" : "Purchase approved by the Paragon Team (device mirror)");
      if (rewards && rewards === total) showToast(`🏆 ${total.toLocaleString()} coins added — weekly leaderboard reward!`);
      else if (rewards) showToast(`🪙 ${total.toLocaleString()} coins added — purchase approved (incl. ${rewards.toLocaleString()} reward coins)!`);
      else showToast(`🪙 ${total.toLocaleString()} coins added — team approved (display cache).`);
    }
    const debits = JSON.parse(window.localStorage.getItem("paragonArchive.coinDebits.v1") || "[]");
    const myDebits = debits.filter(d => d.for === who && !d.claimed);
    if (myDebits.length) {
      let total = 0;
      myDebits.forEach(d => {
        const n = Number(d.coins) || 0;
        if (n > 0 && spendCoinsLocal(n, d.reason || "Withdrawal payout")) total += n;
        d.claimed = true;
      });
      window.localStorage.setItem("paragonArchive.coinDebits.v1", JSON.stringify(debits));
      if (total) showToast(`🏦 ${total.toLocaleString()} coins withdrawn after team payout (display cache).`);
    }
  } catch (error) { /* blocked */ }
}

let coinShopPack = 0;
function walletEngine() { return window.ParagonWallets || null; }
function walletUserEmail() { return (typeof authUser !== "undefined" && authUser && authUser.email) ? String(authUser.email).trim().toLowerCase() : ""; }
function walletLedger(type, amount, refType, ref, reason, idem) {
  const engine = walletEngine(); const user = walletUserEmail();
  if (!engine || !user) return;
  try { engine.appendLedger({ user: user, type: type, amount: Math.round(Number(amount) || 0), refType: refType || "", ref: ref || "", reason: reason || "", idempotencyKey: idem || "" }); } catch (error) { /* blocked */ }
}
function coinRateNow() {
  const engine = walletEngine();
  return engine && engine.effectiveConfig ? engine.effectiveConfig().nairaRate : 2;
}
function financePausedMessage() {
  const engine = walletEngine();
  if (!engine) return "";
  try {
    const state = engine.controls();
    if (state.paused) return state.pausedReason || "Financial operations are temporarily paused by the Paragon Team.";
  } catch (error) { /* blocked */ }
  return "";
}


/* ---------------- Stage 6 — withdrawals (user side) ---------------- */
let withdrawalNaira = 0;
function wdBadge(state) {
  const meta = {
    LOCKED: ["🟡 Pending — coins locked", "st-scheduled"], REQUESTED: ["🟡 Pending", "st-scheduled"], ELIGIBILITY_CHECK: ["🟡 Eligibility check", "st-scheduled"], RISK_CHECK: ["🟡 Risk check", "st-review"], PAYOUT_PENDING: ["🔵 Awaiting payout", "st-preview"], PROVIDER_SUBMITTED: ["🔵 Payout submitted", "st-preview"], PROVIDER_CONFIRMED: ["🔵 Payout confirmed", "st-preview"], PAID: ["✅ Paid", "st-live"], RETRYING: ["🟠 Retrying payout", "st-review"], UNKNOWN: ["🟠 Payout status unknown — being verified", "st-review"], RECONCILIATION: ["🟠 Reconciliation", "st-review"], FAILED: ["❌ Failed", "st-archived"], COINS_UNLOCKED: ["♻️ Coins returned", "st-archived"]
  };
  const m = meta[state] || [state, "st-review"];
  return `<span class="team-site-badge ${m[1]}">${m[0]}</span>`;
}
function wdFeeLabel(naira) {
  const engine = walletEngine();
  if (!engine) return "";
  return Number(naira) >= engine.effectiveConfig().withdrawalFeeThresholdNaira ? ` + ${engine.effectiveConfig().withdrawalFeeCoins}-coin fee (₦10,000+ rule)` : " · no Paragon fee (below ₦10,000)";
}
function renderWithdrawalHost() {
  const engine = walletEngine();
  const host = document.getElementById("withdrawal-host");
  if (!host || !engine) return;
  const user = walletUserEmail();
  const paused = financePausedMessage();
  const balance = coinBalance();
  const rate = coinRateNow();
  const limits = engine.remainingLimits(user);
  const account = (engine.payoutAccounts() || []).filter(a => a.user === user)[0] || null;
  host.innerHTML = `
    <div class="lb-pool-grid">
      <div class="lb-pool-stat"><b>${balance.toLocaleString()} coins</b><small>available ≈ ₦${engine.coinsToNaira(balance).toLocaleString()} at ₦1 = ${rate} coins</small></div>
      <div class="lb-pool-stat"><b>${limits.used24}/${limits.dailyLimit} · ${limits.used7d}/${limits.weeklyLimit}</b><small>withdrawal requests used — rolling 24 h / 7 days</small></div>
    </div>
    ${paused ? `<div class="site-maintenance-banner">🛑 ${escapeHTML(paused)} — no new withdrawals until the team reopens them. Your locked coins are safe and return automatically if a request fails.</div>` : ""}
    ${!paused ? `<section class="lb-block"><h3>💸 Request a withdrawal</h3>
      <div class="wd-chips">${[2000, 5000, 10000, 20000].map(n => `<button type="button" class="lb-week-chip ${withdrawalNaira === n ? "active" : ""}" onclick="withdrawalNaira=${n}; renderWithdrawalHost()">₦${n.toLocaleString()}</button>`).join("")}</div>
      <label class="wallet-field"><span>Amount in naira</span><input id="wd-naira" type="number" min="1000" step="500" value="${withdrawalNaira || ""}" placeholder="Minimum ₦1,000" oninput="withdrawalNaira=Math.round(Number(this.value)||0)"></label>
      <div class="wd-summary" id="wd-summary">Minimum ₦1,000 · your ₦10,000+ rule: the 50-coin fee applies only at ₦10,000 and above.</div>
      <label class="wallet-field"><span>Bank name</span><input id="wd-bank" maxlength="60" placeholder="e.g. OPay, GTBank, Kuda" value="${account ? escapeHTML(account.bank) : ""}"></label>
      <label class="wallet-field"><span>Account number</span><input id="wd-account" maxlength="10" inputmode="numeric" placeholder="10-digit account number" value="${account ? escapeHTML(account.accountNumber) : ""}"></label>
      <label class="wallet-field"><span>Account name</span><input id="wd-name" maxlength="80" placeholder="Name on the account" value="${account ? escapeHTML(account.accountName) : ""}"></label>
      <p class="team-site-sub" style="margin:4px 0 10px">Payouts go to a verified account in your own name (the team re-verifies before any payout; changing details puts a verification hold on the account).</p>
      <button type="button" class="primary-action" onclick="submitWithdrawalRequest()">📨 Request withdrawal</button>
      <p class="team-site-sub">Withdrawals are paid manually by the Paragon Team through the payout desk. Your coins are locked the moment the request is accepted and return automatically if it fails — limits never trap legitimate funds.</p>
    </section>` : ""}
    <section class="lb-block"><h3>📜 Your withdrawal history</h3><div id="wd-history" class="team-site-list"></div></section>`;
  renderWithdrawalHistory();
  updateWdSummary();
}
function updateWdSummary() {
  const engine = walletEngine();
  const node = document.getElementById("wd-summary");
  if (!engine || !node) return;
  const naira = Math.round(Number(withdrawalNaira) || 0);
  const cfg = engine.effectiveConfig();
  const min = Math.max(cfg.minWithdrawalNaira, 0);
  if (naira < min) { node.innerHTML = `Minimum ₦${min.toLocaleString()} · your ₦${cfg.withdrawalFeeThresholdNaira.toLocaleString()}+ rule: the ${cfg.withdrawalFeeCoins}-coin fee applies only at ₦${cfg.withdrawalFeeThresholdNaira.toLocaleString()} and above.`; return; }
  const needed = engine.coinsRequiredFor(naira);
  const fee = engine.withdrawalFeeFor(naira);
  node.innerHTML = `You will receive <b>₦${naira.toLocaleString()}</b> · ${nairaToCoinsPlaceholder(naira).toLocaleString()} coins + ${fee ? fee + "-coin fee (₦10,000+ rule)" : "no fee (below ₦10,000)"} = <b>${needed.toLocaleString()} coins</b> locked from your balance.`;
}
function nairaToCoinsPlaceholder(naira) { const e = walletEngine(); return e ? e.nairaToCoins(naira) : Math.round(naira * 2); }
function renderWithdrawalHistory() {
  const engine = walletEngine();
  const host = document.getElementById("wd-history");
  if (!host || !engine) return;
  const user = walletUserEmail();
  const mine = engine.requestsFor(user).slice().sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
  host.innerHTML = mine.length ? mine.map(w => `
    <article class="team-site-row ${w.state === "PAID" ? "st-live" : (w.state === "FAILED" || w.state === "COINS_UNLOCKED") ? "st-archived" : "st-scheduled"}">
      <div class="team-site-copy">
        <div class="team-site-title"><strong>₦${Number(w.naira).toLocaleString()}</strong>${wdBadge(w.state)}<span class="team-site-cat">${escapeHTML(w.correlationId || w.id)}</span></div>
        <div class="team-site-sub">${w.lockedCoins.toLocaleString()} coins locked (incl. ${w.feeCoins} fee) · ${escapeHTML((w.payout && (w.payout.bank + " " + (w.payout.masked || ""))) || "")} · ${new Date(w.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
        ${w.failReason ? `<div class="team-site-sub">Reason: ${escapeHTML(w.failReason)}</div>` : ""}
        ${w.payoutRef ? `<div class="team-site-sub">Payout reference: ${escapeHTML(w.payoutRef)}${w.paidAt ? " · paid " + new Date(w.paidAt).toLocaleString() : ""}</div>` : ""}
      </div>
      <div class="team-site-actions">${(w.state === "LOCKED" || w.state === "REQUESTED") ? `<button type="button" class="team-mini-link danger" onclick="cancelWithdrawal('${escapeHTML(w.id)}')">Cancel &amp; unlock coins</button>` : ""}</div>
    </article>`).join("") : '<p class="team-site-sub">No withdrawal requests yet — real zero. Withdrawals become available as your balance grows.</p>';
}
window.submitWithdrawalRequest = function() {
  const engine = walletEngine();
  if (!engine) { showToast("Withdrawals are unavailable on this page.", "warning"); return; }
  const naira = Math.round(Number(document.getElementById("wd-naira")?.value || withdrawalNaira) || 0);
  const bank = String(document.getElementById("wd-bank")?.value || "").trim();
  const account = String(document.getElementById("wd-account")?.value || "").replace(/\D/g, "");
  const name = String(document.getElementById("wd-name")?.value || "").trim();
  if (!account || account.length < 6) { showToast("Enter a valid account number (6+ digits).", "warning"); return; }
  if (!bank) { showToast("Enter your bank name.", "warning"); return; }
  if (!name) { showToast("Enter the account name.", "warning"); return; }
  const user = walletUserEmail();
  if (!user) { requirePersonalSession("withdraw coins"); return; }
  const verdict = engine.requestWithdrawal({ user: user, displayName: accountProfile.displayName || user, naira: naira, availableCoins: coinBalance(), payout: { bank: bank, accountNumber: account, accountName: name } });
  if (!verdict.ok) { showToast(verdict.message || "Withdrawal not accepted: " + verdict.code, "warning"); renderWithdrawalHost(); return; }
  /* Lock the real coins now — the request record already exists (two writes stay in sync). */
  spendCoins(verdict.lockedCoins, `Withdrawal of ₦${verdict.request.naira.toLocaleString()} — coins locked (${verdict.request.correlationId})`);
  walletLedger("WITHDRAWAL_LOCK", -verdict.request.coins, "withdrawal", verdict.request.id, `₦${naira} redeemed at rate ₦1=${coinRateNow()}`, "wd-lock-" + verdict.request.id);
  if (verdict.request.feeCoins) walletLedger("WITHDRAWAL_FEE", -verdict.request.feeCoins, "withdrawal", verdict.request.id, "₦10,000+ 50-coin withdrawal fee (spec §22.1)", "wd-fee-" + verdict.request.id);
  try { engine.savePayoutAccount({ user: user, bank: bank, accountNumber: account, accountName: name }); } catch (error) { /* blocked */ }
  withdrawalNaira = 0;
  showToast(`Withdrawal requested — ${verdict.lockedCoins.toLocaleString()} coins locked. The team pays ₦${naira.toLocaleString()} after verification.`);
  renderWithdrawalHost();
};
window.cancelWithdrawal = function(id) {
  const engine = walletEngine();
  if (!engine) return;
  const request = engine.findRequest(id);
  if (!request) return;
  showToast("Cancelling this withdrawal returns its locked coins to your balance.");
  engine.cancelRequest(id, walletUserEmail() || "user", "Cancelled by the account holder");
  applyWithdrawalStatuses();
  renderWithdrawalHost();
};
/* Claim failed/cancelled refunds + mark paid payouts seen (runs on every Account view). */
function applyWithdrawalStatuses() {
  const engine = walletEngine();
  if (!engine || !hasPersonalSession()) return;
  const user = walletUserEmail();
  if (!user) return;
  let refunded = 0; let paid = 0;
  try {
    const list = engine.allRequests();
    let changed = false;
    list.forEach(w => {
      if (w.user !== user) return;
      if ((w.state === "COINS_UNLOCKED") && !w.refundedOnDevice) {
        addCoins(w.lockedCoins, `Withdrawal refunded — your ${w.lockedCoins.toLocaleString()} coins are back (${w.correlationId})`);
        walletLedger("WITHDRAWAL_REVERSAL", w.lockedCoins, "withdrawal", w.id, "Failed/cancelled withdrawal — coins unlocked", "wd-refund-" + w.id);
        w.refundedOnDevice = true; refunded += w.lockedCoins; changed = true;
      }
      if (w.state === "PAID" && !w.paidSeen) {
        walletLedger("WITHDRAWAL_SETTLED", 0, "withdrawal", w.id, "Paid out by the Paragon Team — " + (w.payoutRef || "manual payout"), "wd-paid-" + w.id);
        w.paidSeen = true; paid += 1; changed = true;
      }
    });
    if (changed && engine.persistRequests) engine.persistRequests(list);
  } catch (error) { /* blocked */ }
  if (refunded) showToast(`♻️ ${refunded.toLocaleString()} coins returned — a withdrawal was refunded.`);
  if (paid) showToast("✅ Your withdrawal was paid — check your bank.");
}
window.openCoinWithdrawal = function() {
  const engine = walletEngine();
  if (!engine) { showToast("Withdrawals are unavailable on this page.", "warning"); return; }
  if (typeof document.createElement !== "function") return;
  if (!hasPersonalSession()) { requirePersonalSession("withdraw coins"); return; }
  document.getElementById("coin-withdrawal-overlay")?.remove();
  applyWithdrawalStatuses();
  const overlay = document.createElement("div");
  overlay.id = "coin-withdrawal-overlay";
  overlay.className = "utility-overlay active install-overlay";
  overlay.innerHTML = `
    <div class="install-popup-card lb-card" role="dialog" aria-modal="true" aria-label="Withdraw coins">
      <header><h2>💸 Paragon Coins — Withdraw to naira</h2><p>Sell coins back to Paragon: the team verifies the request, pays the naira to your bank, and your locked coins close the loop. Balance: <b>${coinBalance().toLocaleString()} coins</b>.</p></header>
      <div id="withdrawal-host"></div>
      <div class="install-popup-actions">
        <button type="button" class="secondary-action" onclick="document.getElementById('coin-withdrawal-overlay').remove(); document.body.classList.remove('popup-lock'); openCoinShop()">🪙 Buy coins</button>
        <button type="button" class="secondary-action" onclick="document.getElementById('coin-withdrawal-overlay').remove(); document.body.classList.remove('popup-lock')">Close</button>
      </div>
      <small class="install-popup-note">Your ₦10,000 rule (docs/COIN-SYSTEM.md): no Paragon fee below ₦10,000; ₦10,000+ carries the 50-coin fee. Withdrawal limits: 2 per rolling 24 h, 5 per rolling 7 days — configurable, never trapping funds: failed requests return their coins automatically. Payouts are manual through the Team payout desk (pendingBackendSync).</small>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("popup-lock");
  overlay.addEventListener("click", event => { if (event.target === overlay) { overlay.remove(); document.body.classList.remove("popup-lock"); } });
  renderWithdrawalHost();
};

/* =====================================================================
   
/* =====================================================================
   P-099 — STAGE 5 LEADERBOARDS (public popup): weekly ranking + top 3 +
   ranks 4-10 revenue-funded rewards. Engine: paragon-leaderboards.js.
   Honesty: standings are real (eligible bet results only, free play never
   climbs); the pool is 30% of REALIZED competition fees — zero is zero.
   ===================================================================== */
let leaderboardFocusWeek = "";
function lbEngine() { return window.ParagonLeaderboards || null; }
function lbCurrentUser() {
  try {
    if (typeof authUser !== "undefined" && authUser && authUser.email) return String(authUser.email).trim().toLowerCase();
    if (typeof accountProfile !== "undefined" && accountProfile && accountProfile.email) return String(accountProfile.email).trim().toLowerCase();
  } catch (error) { /* blocked */ }
  return null;
}
function lbFriendlyDate(key) {
  const parts = String(key).split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function lbShortLabel(key) {
  const engine = lbEngine();
  if (!engine) return key;
  const bounds = engine.periodBounds(key);
  const last = new Date(bounds.end.getTime());
  last.setDate(last.getDate() - 1);
  return `${lbFriendlyDate(key)} – ${lbFriendlyDate(last)}`;
}
function lbStateChip(state, isCurrent) {
  const labels = {
    running: isCurrent ? "Live this week — results can still change" : "Week ended — awaiting team settlement",
    closed: "Week closed — results frozen, anti-abuse review open",
    review: "Anti-abuse review in progress",
    final: "Final ranking locked",
    prizes: "Prizes calculated, awaiting super-admin approval",
    credited: "Rewards approved and credited"
  };
  const kind = {
    running: "st-live", closed: "st-scheduled", review: "st-review",
    final: "st-live", prizes: "st-scheduled", credited: "st-live"
  };
  return `<span class="team-site-badge ${kind[state] || "st-review"}">${labels[state] || escapeHTML(state)}</span>`;
}
function lbMedal(rank) { return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `<span class="lb-rank-num">${rank}</span>`; }
function lbPoolNaira(coins) { return `≈ ₦${Math.floor((Number(coins) || 0) / 2).toLocaleString()} at the placeholder rate (₦1 = 2 coins)`; }
function lbRowsMarkup(rows, me, limit) {
  if (!rows || !rows.length) {
    return `<div class="lb-empty">No eligible bet results this week yet — real zero. Leaderboard points come ONLY from staked (bet) competition results; free play, logins and purchases never climb.</div>`;
  }
  return `<ol class="lb-list">${rows.slice(0, limit || 10).map(row => {
    const mine = me && row.player === me;
    return `<li class="lb-row ${mine ? "lb-me" : ""}">
      <span class="lb-rank">${lbMedal(row.rank)}</span>
      <span class="lb-who"><b>${escapeHTML(row.displayName || row.player)}</b><small>${escapeHTML(row.player)} · ${row.plays} play${row.plays === 1 ? "" : "s"} · ${Object.keys(row.games || {}).map(game => `${escapeHTML(game)} ×${row.games[game]}`).join(" · ") || "no games"}</small></span>
      <span class="lb-pts">${Number(row.points).toLocaleString()} <small>pts</small></span>
    </li>`;
  }).join("")}</ol>`;
}
function lbRulesBlock() {
  return `<details class="lb-details"><summary>How the weekly leaderboard works — eligibility, anti-farming, rewards</summary>
    <ul class="lb-rules">
      <li><b>Bet-only points:</b> only eligible staked competition results earn points (bet games and paid quiz entries). Free play, guest play, logging in, creating an account and buying coins never earn points.</li>
      <li><b>Performance-based:</b> points come from how well you played (accuracy/performance per game), never from how much you staked — 1 coin is never 1 point.</li>
      <li><b>Creator rule:</b> a quiz creator can play their own quiz but can never win its prize or earn leaderboard points from it.</li>
      <li><b>Revenue-funded pool:</b> every week, 30% of eligible realized competition-fee revenue funds the reward pool. No realized fees means a real ₦0 pool — the platform never shows an invented prize.</li>
      <li><b>Top 3 + ranks 4–10:</b> rank 1 takes 30% of the pool, rank 2 takes 20%, rank 3 takes 15%, then 10%, 7%, 5%, 4%, 3%, 2% and 4% for ranks 4 to 10 — the whole pool is always paid out in full.</li>
      <li><b>Settlement is reviewed, never automatic:</b> when a week closes, results freeze and the team runs an anti-abuse review (rapid-fire play, repeated opponents, creator self-play and similar flags) before eligibility, the final ranking, prize calculation and crediting. Rewards are paid by the team through the same approval flow as coin purchases.</li>
    </ul></details>`;
}
function renderCoinLeaderboard() {
  const engine = lbEngine();
  if (!engine) { showToast("Leaderboards are unavailable on this page.", "warning"); return; }
  const host = document.getElementById("coin-leaderboard-host");
  if (!host) return;
  const weeks = engine.recentPeriodKeys(new Date(), 3);
  if (!leaderboardFocusWeek) leaderboardFocusWeek = engine.currentWeekKey();
  if (weeks.indexOf(leaderboardFocusWeek) === -1) leaderboardFocusWeek = weeks[0];
  const view = engine.standingsForView(leaderboardFocusWeek);
  const state = view.state || engine.periodState(leaderboardFocusWeek).state;
  const isCurrent = engine.currentWeekKey() === leaderboardFocusWeek;
  const me = lbCurrentUser();
  const myRow = view.rows.filter(row => me && row.player === me)[0] || null;
  const pool = engine.poolCoins(leaderboardFocusWeek);
  const fees = engine.feeTotal(leaderboardFocusWeek);
  const prizes = engine.prizeRows(leaderboardFocusWeek);
  host.innerHTML = `
    <div class="lb-week-nav">${weeks.map(key => `<button type="button" class="lb-week-chip ${key === leaderboardFocusWeek ? "active" : ""}" onclick="leaderboardFocusWeek='${key}'; renderCoinLeaderboard()">${lbShortLabel(key)}</button>`).join("")}</div>
    <div class="lb-state-line">${lbStateChip(state, isCurrent)}</div>
    <section class="lb-block">
      <h3>🏆 ${lbShortLabel(leaderboardFocusWeek)} — weekly ranking</h3>
      <div class="lb-period-note">${escapeHTML(engine.periodLabel(leaderboardFocusWeek))}${state !== "running" ? ` · settled through the team review desk` : ` · live`}</div>
      ${lbRowsMarkup(view.rows, me, 10)}
      ${myRow ? `<div class="lb-you">You: #${myRow.rank} · ${Number(myRow.points).toLocaleString()} pts · ${myRow.plays} play${myRow.plays === 1 ? "" : "s"}</div>` : me ? `<div class="lb-you">No eligible results from you this week — play a bet game or paid quiz entry to earn points.</div>` : `<div class="lb-you">You are a Guest. Bet games and paid quiz entries require a signed-in account — <button type="button" class="settings-link" style="display:inline;width:auto" onclick="requirePersonalSession('earn leaderboard points')">sign in</button> to become eligible.</div>`}
    </section>
    <section class="lb-block lb-pool-block">
      <h3>💰 Reward pool — funded only by real competition fees</h3>
      <div class="lb-pool-grid">
        <div class="lb-pool-stat"><b>${Number(pool).toLocaleString()} coins</b><small>reward pool = 30% of realized fees${pool ? ` ${lbPoolNaira(pool)}` : ""}</small></div>
        <div class="lb-pool-stat"><b>${Number(fees).toLocaleString()} coins</b><small>eligible realized competition-fee revenue this week</small></div>
      </div>
      ${pool > 0 ? `<div class="lb-dist">${prizes.map(p => `<span class="lb-dist-pill"><b>#${p.rank}</b>${p.rank <= 3 ? " top" : ""} · ${p.pct}% · ${Number(p.coins).toLocaleString()} coins</span>`).join("")}</div>` : `<div class="lb-dist lb-dist-zero">Pool is 0 coins (₦0) — the reward pool is never invented. It fills only from real realized competition-fee revenue, then rewards are approved by the team and credited.</div>`}
    </section>
    <section class="lb-block"><h3>Distribution — top 3 take the big shares, ranks 4–10 win smaller ones</h3>
      <div class="lb-dist">${[30, 20, 15, 10, 7, 5, 4, 3, 2, 4].map((pct, i) => `<span class="lb-dist-pill"><b>#${i + 1}</b> · ${pct}%</span>`).join("")}<span class="lb-dist-note">= 100% of the pool, paid in full</span></div>
    </section>
    <section class="lb-block">${lbRulesBlock()}</section>`;
}
window.openCoinLeaderboard = function() {
  const engine = lbEngine();
  if (!engine) { showToast("Leaderboards are unavailable on this page.", "warning"); return; }
  if (typeof document.createElement !== "function") return;
  leaderboardFocusWeek = engine.currentWeekKey();
  document.getElementById("coin-leaderboard-overlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "coin-leaderboard-overlay";
  overlay.className = "utility-overlay active install-overlay";
  overlay.innerHTML = `
    <div class="install-popup-card lb-card" role="dialog" aria-modal="true" aria-label="Weekly leaderboard">
      <header><h2>🏆 Paragon Coins — Weekly Leaderboard</h2><p>Weekly ranking with rewards for the top 3 and ranks 4–10, funded by 30% of eligible realized competition-fee revenue. Free play never earns points.</p></header>
      <div id="coin-leaderboard-host"></div>
      <div class="install-popup-actions">
        <button type="button" class="primary-action" onclick="document.getElementById('coin-leaderboard-overlay').remove(); document.body.classList.remove('popup-lock'); openCoinShop()">🪙 Buy coins</button>
        <button type="button" class="secondary-action" onclick="document.getElementById('coin-leaderboard-overlay').remove(); document.body.classList.remove('popup-lock')">Close</button>
      </div>
      <small class="install-popup-note">Weekly periods run Monday to Sunday. Bet games and paid quiz entries are the only ways to earn points (docs/COIN-SYSTEM.md). The reward pool activates from real competition fees only — never from invented money.</small>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("popup-lock");
  overlay.addEventListener("click", event => { if (event.target === overlay) { overlay.remove(); document.body.classList.remove("popup-lock"); } });
  renderCoinLeaderboard();
}

function addCoinsLocal(amount, reason) {
  if (!hasPersonalSession()) return false;
  const value = Math.round(Number(amount) || 0);
  if (!value) return false;
  accountProfile.coinBalance = coinBalance() + value;
  if (accountProfile.coinAccount) {
    accountProfile.coinAccount.available_coins = (Number(accountProfile.coinAccount.available_coins) || 0) + value;
  }
  accountProfile.coinHistory = [{ at: new Date().toISOString(), amount: value, reason: String(reason || "adjustment"), source: "local" }, ...(accountProfile.coinHistory || [])].slice(0, 50);
  persistPersonalState();
  return true;
}
function spendCoinsLocal(amount, reason) {
  const value = Math.round(Number(amount) || 0);
  if (value <= 0 || coinBalance() < value) return false;
  accountProfile.coinBalance = coinBalance() - value;
  if (accountProfile.coinAccount) {
    accountProfile.coinAccount.available_coins = Math.max(0, (Number(accountProfile.coinAccount.available_coins) || 0) - value);
  }
  accountProfile.coinHistory = [{ at: new Date().toISOString(), amount: -value, reason: String(reason || "spend"), source: "local" }, ...(accountProfile.coinHistory || [])].slice(0, 50);
  persistPersonalState();
  return true;
}
/* Public aliases used by games — local cache only until server stake RPCs */
function addCoins(amount, reason) { return addCoinsLocal(amount, reason); }
function spendCoins(amount, reason) { return spendCoinsLocal(amount, reason); }

function supabaseRest(path, options) {
  const base = (window.ParagonConfig?.supabaseUrl || "").replace(/\/$/, "");
  const key = window.ParagonConfig?.supabaseAnonKey || "";
  if (!base || !key || typeof window.fetch !== "function") return Promise.reject(new Error("no-supabase"));
  const headers = Object.assign({
    apikey: key,
    "Content-Type": "application/json"
  }, options?.headers || {});
  try {
    const session = window.authClient?.getSession?.() || window.ParagonAuth?.session;
    const token = session?.access_token || key;
    headers.Authorization = "Bearer " + token;
  } catch (_) {
    headers.Authorization = "Bearer " + key;
  }
  return window.fetch(base + path, Object.assign({}, options, { headers })).then(async r => {
    const text = await r.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    if (!r.ok) throw new Error((data && data.message) || (data && data.error_description) || ("http " + r.status));
    return data;
  });
}

function refreshCoinAccountFromServer() {
  if (!isRegisteredMember()) return Promise.resolve(null);
  /* Stage 2: prefer wallet view (account + ledger + intents); fall back to my_account */
  return supabaseRest("/rest/v1/rpc/paragon_coin_my_wallet_view", {
    method: "POST",
    body: JSON.stringify({ p_ledger_limit: 40 })
  }).then(view => {
    if (!view || !view.account) {
      return supabaseRest("/rest/v1/rpc/paragon_coin_my_account", { method: "POST", body: "{}" })
        .then(account => {
          if (!account) return null;
          accountProfile.coinAccount = account;
          accountProfile.coinBalance = Math.max(0, Math.round(Number(account.available_coins) || 0));
          persistPersonalState();
          return account;
        });
    }
    accountProfile.coinAccount = view.account;
    accountProfile.coinBalance = Math.max(0, Math.round(Number(view.available_coins) || 0));
    accountProfile.serverLedger = Array.isArray(view.ledger) ? view.ledger : [];
    accountProfile.paymentIntents = Array.isArray(view.payment_intents) ? view.payment_intents : [];
    /* Merge server ledger into display history (server wins) */
    accountProfile.coinHistory = (accountProfile.serverLedger || []).map(row => ({
      at: row.created_at,
      amount: Number(row.amount) || 0,
      reason: String(row.entry_type || "ledger") + (row.reference_type ? " · " + row.reference_type : ""),
      source: "server",
      bucket: row.bucket,
      idempotency_key: row.idempotency_key || null
    })).concat(
      (accountProfile.coinHistory || []).filter(h => h.source === "local")
    ).slice(0, 60);
    persistPersonalState();
    return view;
  }).catch(() =>
    supabaseRest("/rest/v1/rpc/paragon_coin_my_account", { method: "POST", body: "{}" })
      .then(account => {
        if (!account) return null;
        accountProfile.coinAccount = account;
        accountProfile.coinBalance = Math.max(0, Math.round(Number(account.available_coins) || 0));
        persistPersonalState();
        return account;
      })
      .catch(() => null)
  );
}

window.askAppFields = function(options) {
  /* Dialog-law overlay (P-096): never window.prompt/alert/confirm in the public app. */
  return new Promise(function (resolve) {
    if (typeof document === "undefined" || !document.createElement) { resolve({ ok: false, values: null }); return; }
    document.getElementById("app-field-overlay")?.remove();
    var overlay = document.createElement("div");
    overlay.id = "app-field-overlay";
    overlay.className = "utility-overlay active install-overlay";
    var fields = (options.fields || []).map(function (f) {
      return '<label class="wallet-field"><span>' + String(f.label || f.name).replace(/[<>]/g, "") + (f.required ? " *" : "") + '</span><input id="appf-' + f.name + '" maxlength="200" placeholder="' + String(f.placeholder || "").replace(/[<>]/g, "") + '" value="' + String(f.value || "").replace(/"/g, "&quot;").replace(/[<>]/g, "") + '"></label>';
    }).join("");
    overlay.innerHTML = '<div class="install-popup-card" role="dialog" aria-modal="true"><header><h2>' + (options.icon || "✏️") + " " + String(options.title || "Enter details").replace(/[<>]/g, "") + '</h2></header><div style="padding:2px">' + fields + '<p id="app-field-error" style="display:none;color:#ef4444;font-size:12px;margin:10px 0 0">Please fill the required fields.</p></div><div class="install-popup-actions"><button type="button" class="secondary-action" id="appf-cancel">Cancel</button><button type="button" class="primary-action" id="appf-ok">' + (options.confirmLabel || "Save") + '</button></div></div>';
    document.body.appendChild(overlay);
    document.body.classList.add("popup-lock");
    function closeOutcome(result) { overlay.remove(); document.body.classList.remove("popup-lock"); resolve(result); }
    overlay.querySelector("#appf-cancel").addEventListener("click", function () { closeOutcome({ ok: false, values: null }); });
    overlay.addEventListener("click", function (event) { if (event.target === overlay) closeOutcome({ ok: false, values: null }); });
    overlay.querySelector("#appf-ok").addEventListener("click", function () {
      var values = {}; var missing = false;
      (options.fields || []).forEach(function (f) {
        var el = document.getElementById("appf-" + f.name);
        values[f.name] = el ? el.value : "";
        if (f.required && !String(values[f.name]).trim()) missing = true;
      });
      if (missing) { var er = overlay.querySelector("#app-field-error"); if (er) er.style.display = "block"; return; }
      closeOutcome({ ok: true, values: values });
    });
    var firstInput = overlay.querySelector("#appf-" + ((options.fields || [])[0] || {}).name);
    if (firstInput && typeof firstInput.focus === "function") firstInput.focus();
  });
};

window.claimCoinPayment = function(intentId) {
  if (!isRegisteredMember()) {
    showToast("Sign in to claim a payment.", "warning");
    return;
  }
  if (!intentId) { showToast("Missing purchase request id.", "warning"); return; }
  window.askAppFields({
    icon: "🪙",
    title: "Claim your coin purchase",
    fields: [{ name: "ref", label: "OPay/Moniepoint receipt or transfer reference", placeholder: "e.g. PARAGON-49312", required: true }],
    confirmLabel: "Submit claim"
  }).then(claim => {
    if (!claim.ok) return;
    const ref = String(claim.values.ref || "").trim();
    if (ref.length < 3) {
      showToast("Enter a real transfer reference (min 3 characters).", "warning");
      return;
    }
    supabaseRest("/rest/v1/rpc/paragon_coin_claim_payment", {
      method: "POST",
      body: JSON.stringify({
        p_intent_id: intentId,
        p_claim_ref: ref.slice(0, 200),
        p_claim_note: "User claimed transfer from coin shop"
      })
    }).then(() => {
    showToast("Claim recorded — coins credit only after team/provider confirms. Not credited yet.");
    refreshCoinAccountFromServer().finally(afterCoinIntent);
  }).catch(err => {
    const msg = String(err?.message || err || "");
    if (/limit/i.test(msg)) showToast("Claim limit: max 5 payment claims per 24 hours.", "warning");
    else showToast("Claim failed — run Stage 2 SQL or try again. " + msg.slice(0, 120), "warning");
  });
  });
};

window.requestCoinPurchase = function(nairaAmount) {
  const cfg = coinConfigFlags();
  if (cfg.pause) { showToast("Financial operations are paused by the team.", "warning"); return; }
  if (!hasPersonalSession()) { requirePersonalSession("buy Paragon coins"); return; }
  if (!isRegisteredMember()) {
    showToast("Guests are free-play only. Sign in to request coin purchases.", "warning");
    return;
  }
  const naira = Math.round(Number(nairaAmount) || 0);
  if (naira < cfg.minPurchase) { showToast(`The smallest coin pack is ₦${cfg.minPurchase.toLocaleString()}.`, "warning"); return; }
  const coins = Math.round(naira * cfg.nairaPerCoinBuy);
  const idem = "buy-" + (authUser?.id || "u") + "-" + naira + "-" + Date.now().toString(36);

  /* Try server payment intent first; fall back to team desk local queue */
  supabaseRest("/rest/v1/rpc/paragon_coin_create_payment_intent", {
    method: "POST",
    body: JSON.stringify({ p_naira: naira, p_idempotency_key: idem, p_pack_label: "pack-" + naira })
  }).then(intent => {
    try {
      const list = JSON.parse(window.localStorage.getItem("paragonTeamCoinRequests.v1") || "[]");
      list.push({
        id: intent?.id || idem,
        user: authUser.email,
        displayName: accountProfile.displayName || authUser.email,
        naira, coins,
        status: intent?.status || "awaiting_transfer",
        backend: true,
        createdAt: new Date().toISOString()
      });
      window.localStorage.setItem("paragonTeamCoinRequests.v1", JSON.stringify(list));
    } catch (_) {}
    if (intent?.id) {
      accountProfile.paymentIntents = [
        { id: intent.id, naira, coins, status: intent.status || "awaiting_transfer", created_at: new Date().toISOString() },
        ...(accountProfile.paymentIntents || [])
      ].slice(0, 15);
      persistPersonalState();
    }
    showToast(`Purchase request recorded — ${coins.toLocaleString()} coins after confirm of ₦${naira.toLocaleString()}. Not credited yet. Claim with your OPay/Moniepoint receipt when paid.`);
    refreshCoinAccountFromServer().finally(afterCoinIntent);
  }).catch(() => {
    try {
      const list = JSON.parse(window.localStorage.getItem("paragonTeamCoinRequests.v1") || "[]");
      list.push({
        id: idem,
        user: authUser.email,
        displayName: accountProfile.displayName || authUser.email,
        naira, coins,
        status: "pending",
        backend: false,
        createdAt: new Date().toISOString()
      });
      window.localStorage.setItem("paragonTeamCoinRequests.v1", JSON.stringify(list));
      showToast(`Request saved on this device — ${coins.toLocaleString()} coins await team approval after real payment. (Server RPC not live yet.)`);
    } catch (error) {
      showToast("The request could not be saved on this device.", "warning");
    }
  });
};

window.requestCoinWithdrawal = function() {
  const cfg = coinConfigFlags();
  if (cfg.pause) { showToast("Financial operations are paused by the team.", "warning"); return; }
  if (!hasPersonalSession()) { requirePersonalSession("request a coin withdrawal"); return; }
  if (!isRegisteredMember()) {
    showToast("Guests cannot withdraw. Sign in with a registered account.", "warning");
    return;
  }
  const bal = coinBalance();
  if (bal < cfg.minWithdraw) {
    showToast(`Minimum withdrawal is ${cfg.minWithdraw.toLocaleString()} coins.`, "warning");
    return;
  }
  const coinsEl = document.getElementById("coin-withdraw-amount");
  const bankEl = document.getElementById("coin-withdraw-bank");
  const coins = Math.round(Number(coinsEl?.value) || 0);
  const bank = String(bankEl?.value || "").trim();
  if (coins < cfg.minWithdraw) { showToast(`Enter at least ${cfg.minWithdraw.toLocaleString()} coins.`, "warning"); return; }
  if (coins > bal) { showToast("You do not have that many available coins.", "warning"); return; }
  if (bank.length < 8) { showToast("Add bank/account details for the team payout (min 8 characters).", "warning"); return; }
  const fee = coins >= cfg.feeAt ? cfg.feeCoins : 0;
  const naira = Math.max(0, Math.round((coins - fee) * cfg.nairaPerCoinOut));
  const idem = "wd-" + (authUser?.id || "u") + "-" + coins + "-" + Date.now().toString(36);

  supabaseRest("/rest/v1/rpc/paragon_coin_request_withdrawal", {
    method: "POST",
    body: JSON.stringify({
      p_coins: coins,
      p_bank_snapshot: bank,
      p_payout_account_id: null,
      p_idempotency_key: idem
    })
  }).then(row => {
    spendCoinsLocal(coins, "Withdrawal lock (awaiting team payout)");
    try {
      const list = JSON.parse(window.localStorage.getItem("paragonTeamCoinWithdrawals.v1") || "[]");
      list.push({
        id: row?.id || idem,
        user: authUser.email,
        displayName: accountProfile.displayName || authUser.email,
        coins, fee, naira, bank, status: "pending", backend: true,
        createdAt: new Date().toISOString()
      });
      window.localStorage.setItem("paragonTeamCoinWithdrawals.v1", JSON.stringify(list));
    } catch (_) {}
    refreshCoinAccountFromServer();
    showToast(`Withdrawal queued — ${coins.toLocaleString()} coins locked. ~₦${naira.toLocaleString()} after fee when team pays.`);
    document.getElementById("coin-shop-overlay")?.remove();
    document.body.classList.remove("popup-lock");
  }).catch(() => {
    /* Offline / SQL not run: queue for team desk only — do NOT deduct until paid (honest) */
    try {
      const list = JSON.parse(window.localStorage.getItem("paragonTeamCoinWithdrawals.v1") || "[]");
      list.push({
        id: idem,
        user: authUser.email,
        displayName: accountProfile.displayName || authUser.email,
        coins, fee, naira, bank, status: "pending", backend: false,
        createdAt: new Date().toISOString()
      });
      window.localStorage.setItem("paragonTeamCoinWithdrawals.v1", JSON.stringify(list));
      showToast(`Withdrawal request saved for the team desk. Coins stay available until the team marks paid (server lock not live yet). ~₦${naira.toLocaleString()} after fee.`);
      document.getElementById("coin-shop-overlay")?.remove();
      document.body.classList.remove("popup-lock");
    } catch (error) {
      showToast("Could not save withdrawal request.", "warning");
    }
  });
};


window.openFinancialCase = function(caseType, summary) {
  if (!isRegisteredMember()) {
    showToast("Sign in to open a financial case.", "warning");
    return;
  }
  const detail = summary || "User reported a coin/payment problem from the coin shop.";
  supabaseRest("/rest/v1/rpc/paragon_open_financial_case", {
    method: "POST",
    body: JSON.stringify({
      p_case_type: caseType || "other",
      p_summary: detail.slice(0, 500),
      p_reference_type: "coin_shop",
      p_reference_id: null,
      p_detail: { at: new Date().toISOString() }
    })
  }).then(() => {
    showToast("Financial case opened for the team. Keep your payment references.");
  }).catch(() => {
    try {
      const list = JSON.parse(localStorage.getItem("paragonTeamFinancialCases.v1") || "[]");
      list.push({
        id: "case-" + Date.now().toString(36),
        user: authUser?.email,
        caseType: caseType || "other",
        summary: detail,
        status: "open",
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("paragonTeamFinancialCases.v1", JSON.stringify(list));
      showToast("Case saved on this device for the team desk (server RPC not live yet).");
    } catch (e) {
      showToast("Could not open a case.", "warning");
    }
  });
};


window.openKycPayoutDraft = function() {
  if (!requirePersonalSession("save payout details")) return;
  window.askAppFields({
    icon: "🏦",
    title: "Your payout details (KYC draft for team review)",
    fields: [
      { name: "rail", label: "Payout rail (opay or moniepoint)", value: "opay", required: true },
      { name: "name", label: "Account name on the rail", value: accountProfile.displayName || "", required: true },
      { name: "number", label: "Wallet / account number", required: true },
      { name: "phone", label: "Phone (optional, E.164 e.g. +234…) " }
    ],
    confirmLabel: "Save payout details"
  }).then(result => {
    if (!result.ok) return;
    const rail = String(result.values.rail || "opay").trim() || "opay";
    const name = String(result.values.name || "").trim();
    const number = String(result.values.number || "").trim();
    const phone = String(result.values.phone || "").trim();
    if (!number) { showToast("Account number required.", "warning"); return; }
    supabaseRest("/rest/v1/rpc/paragon_kyc_upsert_draft", {
      method: "POST",
      body: JSON.stringify({
        p_legal_name: name || null,
        p_phone_e164: phone || null,
        p_payout_account_name: name || null,
        p_payout_account_number: number,
        p_payout_bank_name: /monie/i.test(rail) ? "Moniepoint MFB" : "OPay",
        p_payout_rail: /monie/i.test(rail) ? "moniepoint" : "opay"
      })
    }).then(() => showToast("Payout details saved for team review (KYC draft)."))
      .catch(() => showToast("Saved locally note — run phase5 SQL for server KYC.", "warning"));
  });
};


/* =====================================================================
   P-110 — Stage 3 Games desk (1v1 stake UI)
   Free play always available outside this desk. Stakes lock via server RPC.
   Browser NEVER settles winners — team/service only.
   ===================================================================== */
window.openGamesCompeteDesk = function() {
  if (!requirePersonalSession("open competitive games")) return;
  if (!isRegisteredMember()) {
    showToast("Sign in with a real account to stake coins. Guests stay free-play only.", "warning");
    return;
  }
  const cfg = coinConfigFlags();
  document.getElementById("games-compete-overlay")?.remove();

  const run = (view) => {
    const buckets = coinBalanceBuckets();
    const pre = view?.preflight || {};
    const matches = Array.isArray(view?.matches) ? view.matches : [];
    const matchHtml = matches.slice(0, 10).map(m => {
      return `<li class="coin-intent-row"><span><b>${String(m.game_key || "1v1").replace(/[<>]/g, "")}</b> · ${Number(m.stake_coins || 0)}c · ${String(m.status || "").replace(/[<>]/g, "")} · me: ${String(m.result || "pending").replace(/[<>]/g, "")}</span></li>`;
    }).join("") || "<li><small>No staked matches yet. Free play never needs this desk.</small></li>";

    const warnings = Array.isArray(pre.warnings) ? pre.warnings : [];
    const warnHtml = warnings.length
      ? `<ul style="margin:8px 0;padding-left:18px;font-size:12px">${warnings.map(w => `<li>${String(w.code || JSON.stringify(w)).replace(/[<>]/g, "")}</li>`).join("")}</ul>`
      : "<p class=\"install-popup-note\">Preflight clear (or SQL not live yet).</p>";

    const overlay = document.createElement("div");
    overlay.id = "games-compete-overlay";
    overlay.className = "install-popup-overlay active";
    overlay.innerHTML = `
      <div class="install-popup-card" role="dialog" aria-modal="true" aria-label="Competitive 1v1">
        <header><h2>1v1 Competitive stake</h2>
          <button type="button" class="icon-btn-small" onclick="document.getElementById('games-compete-overlay')?.remove();document.body.classList.remove('popup-lock')" aria-label="Close">×</button>
        </header>
        <p class="install-popup-note">Free play is always available without coins. This desk locks stakes on the <strong>server</strong> (100–10,000 coins). House fee = <strong>5% of the two-player pool</strong>. Winners are settled by the Paragon Team / Edge only — your browser cannot credit a win.</p>
        <div class="leaderboard-you">Available <b>${buckets.available.toLocaleString()}</b> · locked <b>${buckets.locked.toLocaleString()}</b>
          · compete_flag=${cfg.compete ? "on" : "off"} · real_money=${cfg.realMoney ? "on" : "OFF"}</div>
        ${warnHtml}
        <label style="display:block;margin:10px 0 4px;font-size:12px">Game key</label>
        <input id="compete-game-key" value="1v1-practice" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit">
        <label style="display:block;margin:10px 0 4px;font-size:12px">Stake (coins)</label>
        <input id="compete-stake" type="number" min="100" max="10000" step="50" value="100" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit">
        <div class="install-popup-actions" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          <button type="button" class="primary-action" onclick="createOneVOneChallenge()">Create challenge (lock my stake)</button>
          <button type="button" class="secondary-action" onclick="refreshOpenChallenges()">Open challenges</button>
          <button type="button" class="secondary-action" onclick="document.getElementById('games-compete-overlay')?.remove();document.body.classList.remove('popup-lock')">Close</button>
        </div>
        <div id="compete-open-list" style="margin-top:12px"></div>
        <h4 style="margin:14px 0 6px;font-size:13px">My recent stakes</h4>
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px">${matchHtml}</ul>
      </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add("popup-lock");
  };

  supabaseRest("/rest/v1/rpc/paragon_competition_my_list", {
    method: "POST", body: JSON.stringify({ p_limit: 15 })
  }).then(run).catch(() => run(null));
};

window.createOneVOneChallenge = function() {
  if (!isRegisteredMember()) return;
  const gameKey = String(document.getElementById("compete-game-key")?.value || "1v1").trim() || "1v1";
  const stake = Math.round(Number(document.getElementById("compete-stake")?.value) || 0);
  if (stake < 100 || stake > 10000) {
    showToast("Stake must be between 100 and 10,000 coins.", "warning");
    return;
  }
  const fee = Math.round(stake * 2 * 0.05);
  supabaseRest("/rest/v1/rpc/paragon_competition_create", {
    method: "POST",
    body: JSON.stringify({
      p_game_key: gameKey,
      p_stake_coins: stake,
      p_opponent: null,
      p_metadata: { client: "archive-games-desk", fee_preview: fee }
    })
  }).then(row => {
    showToast(`Challenge created — ${stake} coins locked. Fee preview ${fee}c (5% of pool when settled as a win). Waiting for opponent.`);
    refreshCoinAccountFromServer();
    openGamesCompeteDesk();
  }).catch(err => {
    const msg = String(err?.message || err || "");
    showToast("Could not create challenge: " + msg.slice(0, 140), "warning");
  });
};

window.refreshOpenChallenges = function() {
  const host = document.getElementById("compete-open-list");
  if (!host) return;
  host.innerHTML = "<small>Loading open challenges…</small>";
  supabaseRest("/rest/v1/rpc/paragon_competition_open_challenges", {
    method: "POST",
    body: JSON.stringify({ p_game_key: null, p_limit: 15 })
  }).then(rows => {
    const list = Array.isArray(rows) ? rows : (rows ? [rows] : []);
    if (!list.length) {
      host.innerHTML = "<small>No open challenges (or Stage 3 SQL not run).</small>";
      return;
    }
    host.innerHTML = `<h4 style="font-size:13px">Open challenges</h4>` + list.map(c => {
      const id = String(c.id || "").replace(/'/g, "");
      return `<div class="coin-intent-row"><span>${String(c.game_key || "").replace(/[<>]/g, "")} · ${Number(c.stake_coins || 0)}c · fee ${Number(c.fee_coins || 0)}c</span>
        <button type="button" class="secondary-action coin-claim-btn" onclick="joinOneVOneChallenge('${id}')">Join (lock my stake)</button></div>`;
    }).join("");
  }).catch(() => {
    host.innerHTML = "<small>Open challenges unavailable — run stage3 SQL.</small>";
  });
};

window.joinOneVOneChallenge = function(competitionId) {
  if (!competitionId || !isRegisteredMember()) return;
  supabaseRest("/rest/v1/rpc/paragon_competition_join", {
    method: "POST",
    body: JSON.stringify({
      p_competition_id: competitionId,
      p_idempotency_key: "join-" + competitionId + "-" + (authUser?.id || "u")
    })
  }).then(() => {
    showToast("Joined — both stakes locked when two players seated. Play free UI; Team settles the money outcome.");
    refreshCoinAccountFromServer();
    openGamesCompeteDesk();
  }).catch(err => showToast("Join failed: " + String(err?.message || err).slice(0, 120), "warning"));
};


window.openCoinShop = function() {
  try { if (hasPersonalSession()) { accountProfile.coinShopOpenCount = Number(accountProfile.coinShopOpenCount || 0) + 1; persistPersonalState(); renderAchievementsAccount(); } } catch (_) {}
  if (typeof document.createElement !== "function") return;
  syncApprovedCoinCredits();
  refreshCoinAccountFromServer().finally(() => {
    document.getElementById("coin-shop-overlay")?.remove();
    const cfg = coinConfigFlags();
    const buckets = coinBalanceBuckets();
    const history = (accountProfile.coinHistory || []).slice(0, 12).map(entry => {
      const sign = Number(entry.amount) >= 0 ? "+" : "";
      const when = entry.at ? new Date(entry.at).toLocaleString() : "";
      const src = entry.source === "server" ? "server" : "local";
      const buck = entry.bucket ? ` · ${entry.bucket}` : "";
      return `<li><b>${sign}${Number(entry.amount).toLocaleString()}</b> · ${String(entry.reason || "").replace(/[<>]/g, "")} <small>${when}${buck} · ${src}</small></li>`;
    }).join("") || "<li><small>No movements yet — balance starts at real zero. Server ledger appears after SQL Stage 2.</small></li>";
    const intents = (accountProfile.paymentIntents || []).slice(0, 8).map(intent => {
      const st = String(intent.status || "pending");
      const claimable = ["awaiting_transfer", "created", "claimed"].includes(st);
      const id = String(intent.id || "").replace(/'/g, "");
      return `<li class="coin-intent-row">
        <span>₦${Number(intent.naira || 0).toLocaleString()} to ${Number(intent.coins || 0).toLocaleString()}c · <b>${st.replace(/[<>]/g, "")}</b></span>
        ${claimable && id ? `<button type="button" class="secondary-action coin-claim-btn" onclick="claimCoinPayment('${id}')">I paid — claim</button>` : ""}
      </li>`;
    }).join("") || "<li><small>No purchase requests yet. Pick a pack below — request never auto-credits.</small></li>";
    const packs = cfg.packs.map(p => {
      const naira = Number(p.naira) || 0;
      const coins = Number(p.coins) || Math.round(naira * cfg.nairaPerCoinBuy);
      return [naira, coins, p.label || ""];
    });
    const overlay = document.createElement("div");
    overlay.id = "coin-shop-overlay";
    overlay.className = "utility-overlay active install-overlay";
    overlay.innerHTML = `
    <div class="install-popup-card" style="width:min(560px,96vw);max-height:90vh;overflow:auto;" role="dialog" aria-modal="true">
      <header><h2>🪙 Paragon Coins</h2>
        <p>Free-to-play always works. <b>Real-money mode is ${cfg.realMoney ? "ON" : "OFF"}</b>${cfg.pause ? " · FINANCIAL PAUSE" : ""}.
        Available <b>${buckets.available.toLocaleString()}</b>
        · locked <b>${buckets.locked.toLocaleString()}</b>
        · pending <b>${buckets.pending.toLocaleString()}</b>
        · restricted <b>${buckets.restricted.toLocaleString()}</b>
        <br><small>Server ledger is authority when SQL is live. localStorage is display cache only. Guests: free-play — no buy/withdraw.</small>
        </p>
      </header>
      <div class="install-perm-list">
        ${packs.map(([naira, coins, label]) => `
          <label class="install-perm-row" style="cursor:pointer" onclick="requestCoinPurchase(${naira});">
            <div><b>₦${naira.toLocaleString()}${label ? " · " + String(label).replace(/[<>]/g,"") : ""}</b>
              <small>to ${coins.toLocaleString()} coins after team confirms your transfer. Nothing is credited from this click alone.</small></div>
            <span class="primary-action" style="pointer-events:none;">Request</span>
          </label>`).join("")}
      </div>
      <div style="margin:14px 0 8px;padding:12px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
        <b style="display:block;margin-bottom:8px;">Withdraw (manual team payout)</b>
        <label style="display:block;font-size:12px;opacity:.8;margin-bottom:4px;">Coins (min ${cfg.minWithdraw})</label>
        <input id="coin-withdraw-amount" type="number" min="${cfg.minWithdraw}" step="100" value="${cfg.minWithdraw}" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit">
        <label style="display:block;font-size:12px;opacity:.8;margin-bottom:4px;">Bank details</label>
        <textarea id="coin-withdraw-bank" rows="2" placeholder="Bank · Account name · Account number" style="width:100%;margin-bottom:8px;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit"></textarea>
        <button type="button" class="secondary-action" onclick="requestCoinWithdrawal()">Request withdrawal</button>
        <small class="install-popup-note" style="display:block;margin-top:8px;">Redeemable target ₦${cfg.nairaPerCoinOut}/coin; fee ${cfg.feeCoins} coins if ≥ ${cfg.feeAt.toLocaleString()} coins. Server ledger is authority when SQL Phase 2+ is live.</small>
${opayMoniepointPayMarkup()}
        <div class="coin-stage2-block">
          <h4 style="margin:14px 0 6px">Purchase requests</h4>
          <ul class="coin-intents-list" style="list-style:none;padding:0;margin:0;display:grid;gap:6px">${intents}</ul>
          <h4 style="margin:14px 0 6px">Transaction history</h4>
          <ul class="coin-history-list" style="list-style:none;padding:0;margin:0;display:grid;gap:4px;max-height:180px;overflow:auto;font-size:12px">${history}</ul>
          <p class="install-popup-note" style="margin-top:8px">Credits post only after team/provider confirmation (idempotent). Duplicate provider references are rejected. Request click never mints coins.</p>
        </div>
      </div>
      <div style="margin-top:8px"><b>Recent (this device)</b><ul style="margin:8px 0 0 18px;padding:0;font-size:13px">${history}</ul></div>
      <div class="install-popup-actions">
        <button type="button" class="secondary-action" onclick="openKycPayoutDraft()">OPay / Moniepoint payout details</button>
        <button type="button" class="secondary-action" onclick="openFinancialCase('payment','Problem with a coin purchase or withdrawal')">Report a money problem</button>
        <button type="button" class="secondary-action" onclick="document.getElementById('coin-shop-overlay')?.remove();document.body.classList.remove('popup-lock')">Close</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add("popup-lock");
    overlay.addEventListener("click", e => { if (e.target === overlay) { overlay.remove(); document.body.classList.remove("popup-lock"); } });
  });
};

/* =====================================================================
   P-097 — INSTALL POPUP: one styled gateway (like Privacy controls) holding
   every app-permission toggle (notifications, camera, mic, location — ONE
   setting for every Paragon website on this origin) and the Install button.
   Opening the shared link (?install=1) opens this popup directly.
   ===================================================================== */
async function permissionState(name) {
  try {
    if (!navigator.permissions?.query) return "unknown";
    const status = await navigator.permissions.query({ name });
    return status.state;
  } catch (error) { return "unknown"; }
}
window.renderInstallPopupStates = async function() {
  const rows = [["notifications", "install-perm-notifications"], ["camera", "install-perm-camera"], ["microphone", "install-perm-microphone"], ["geolocation", "install-perm-location"]];
  for (const [name, id] of rows) {
    const label = document.getElementById(id)?.closest(".install-perm-row");
    if (!label) continue;
    const state = await permissionState(name);
    const chip = label.querySelector(".install-perm-state");
    if (chip) chip.textContent = state === "granted" ? "✅ allowed" : state === "denied" ? "🚫 blocked" : state === "prompt" ? "idle" : "—";
  }
};
async function requestNamedPermission(name) {
  if (name === "notifications") {
    const result = await window.ParagonPWA?.connectPhonePush?.();
    return Boolean(result?.ok);
  }
  if (name === "geolocation") {
    return new Promise(resolve => {
      if (!navigator.geolocation?.getCurrentPosition) return resolve(false);
      navigator.geolocation.getCurrentPosition(() => resolve(true), () => resolve(false), { timeout: 8000 });
    });
  }
  if (name === "camera" || name === "microphone") {
    return new Promise(resolve => {
      if (!navigator.mediaDevices?.getUserMedia) return resolve(false);
      navigator.mediaDevices.getUserMedia(name === "camera" ? { video: true } : { audio: true })
        .then(stream => { stream.getTracks().forEach(track => track.stop()); resolve(true); })
        .catch(() => resolve(false));
    });
  }
  return false;
}
window.toggleInstallPermission = async function(input, name) {
  if (input.checked) {
    const ok = await requestNamedPermission(name);
    if (!ok) { input.checked = false; showToast("Permission was not granted — the browser blocked it or it needs the installed app.", "warning"); }
    else if (name === "notifications") { showToast("Phone notifications ON — sending your test ping now."); window.ParagonPWA?.sendTestNotification?.(); }
    else showToast("Permission allowed — every Paragon website on this origin can use it when needed.");
  } else {
    showToast("Toggled off. Browsers keep granted permissions in site settings — flip it there to fully revoke.", "info");
  }
  window.renderInstallPopupStates?.();
};
window.openParagonInstall = function() {
  try { if (hasPersonalSession()) { accountProfile.installOpenCount = Number(accountProfile.installOpenCount || 0) + 1; persistPersonalState(); renderAchievementsAccount(); } } catch (_) {}
  if (typeof document.createElement !== "function") return;
  document.getElementById("paragon-install-overlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "paragon-install-overlay";
  overlay.className = "utility-overlay active install-overlay";
  overlay.innerHTML = `
    <div class="install-popup-card" role="dialog" aria-modal="true" aria-labelledby="install-popup-title">
      <header><h2 id="install-popup-title">📲 Install Paragon Archive</h2><p>Turn the Archive into a real app on your phone or desktop — one setting for every Paragon website.</p></header>
      <div class="install-perm-list">
        <label class="install-perm-row"><div><b>🔔 Phone notifications</b><small>Real notifications like other apps — updates, replies, and the daily 8 AM Paragon hello (once server push activates). The test fires immediately when toggled on.</small><span class="install-perm-state">—</span></div><input type="checkbox" class="toggle" id="install-perm-notifications" onchange="toggleInstallPermission(this, 'notifications')"></label>
        <label class="install-perm-row"><div><b>📷 Camera</b><small>Ready for future Paragon websites that scan or capture. Nothing uses it until a website asks.</small><span class="install-perm-state">—</span></div><input type="checkbox" class="toggle" id="install-perm-camera" onchange="toggleInstallPermission(this, 'camera')"></label>
        <label class="install-perm-row"><div><b>🎙️ Microphone</b><small>Ready for future voice features. Nothing records until a website asks.</small><span class="install-perm-state">—</span></div><input type="checkbox" class="toggle" id="install-perm-microphone" onchange="toggleInstallPermission(this, 'microphone')"></label>
        <label class="install-perm-row"><div><b>📍 Location</b><small>For future local features (weather, nearby ideas). Paragon itself never needs it.</small><span class="install-perm-state">—</span></div><input type="checkbox" class="toggle" id="install-perm-location" onchange="toggleInstallPermission(this, 'geolocation')"></label>
      </div>
      <div class="install-popup-actions">
        <button type="button" class="primary-action" onclick="installParagonApp()">Install Paragon Archive</button>
        <button type="button" class="secondary-action" onclick="closeParagonInstall()">Later</button>
      </div>
      <small class="install-popup-note">On Android the installed app gets its own icon with no browser bar. On desktop a small browser frame chip remains — a browser rule no website can remove. Server-delivered push notifications activate with the production domain.</small>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("popup-lock");
  overlay.addEventListener("click", event => { if (event.target === overlay) closeParagonInstall(); });
  window.renderInstallPopupStates?.();
};
window.closeParagonInstall = function() {
  document.getElementById("paragon-install-overlay")?.remove();
  document.body.classList.remove("popup-lock");
};

/* P-094 — editable display name for the logged-in profile; saved into the account state that
   persists across logout/login (and syncs through paragon_user_state). */
window.openProfileNameEditor = function() {
  /* P-097 — the editor is a proper POPUP opened from the ✏️ Edit control at the top-right
     of the profile header (owner order), not an inline block under the hero. */
  if (typeof document.createElement !== "function") return;
  document.getElementById("profile-name-editor-popup")?.remove();
  const displayName = accountProfile.displayName || authUser?.user_metadata?.display_name || authUser?.user_metadata?.full_name || String(authUser?.email || "Paragon Member").split("@")[0];
  const overlay = document.createElement("div");
  overlay.id = "profile-name-editor-popup";
  overlay.className = "utility-overlay active install-overlay";
  overlay.innerHTML = `
    <div class="install-popup-card" style="width:min(460px,94vw);" role="dialog" aria-modal="true" aria-labelledby="profile-editor-title">
      <header><h2 id="profile-editor-title">✏️ Edit your profile</h2><p>Your name starts from your ${escapeHTML(providerLabel(authUser))} account — change it once and it stays, even after logout.</p></header>
      <label class="install-perm-row" style="display:flex;flex-direction:column;align-items:stretch;"><div><b>Your display name</b></div>
        <input id="profile-name-input" type="text" maxlength="40" value="${escapeHTML(displayName)}" placeholder="How should Paragon call you?" style="margin-top:8px;padding:11px 12px;border:1px solid var(--border);border-radius:10px;background:var(--card);color:var(--text);font-size:14px;"></label>
      <div class="install-popup-actions">
        <button type="button" class="primary-action" id="profile-name-save">Save name</button>
        <button type="button" class="secondary-action" id="profile-name-cancel">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.classList.add("popup-lock");
  overlay.addEventListener("click", event => { if (event.target === overlay) window.closeProfileNameEditor(); });
  overlay.querySelector("#profile-name-cancel").addEventListener("click", () => window.closeProfileNameEditor());
  overlay.querySelector("#profile-name-save").addEventListener("click", () => window.saveProfileName());
  overlay.querySelector("#profile-name-input")?.focus?.();
};
window.closeProfileNameEditor = function() {
  document.getElementById("profile-name-editor-popup")?.remove();
  document.body.classList.remove("popup-lock");
};
window.saveProfileName = function() {
  const input = document.getElementById("profile-name-input");
  const value = String(input?.value || "").trim().slice(0, 40);
  if (!value) { showToast("Give the profile a name first.", "warning"); return; }
  accountProfile.displayName = value;
  persistPersonalState();
  renderAccount();
  window.closeProfileNameEditor?.();
  showToast(`Saved — your profile is now “${value}”. It stays after logout.`);
};

window.openPasswordUpdate = function() {
  if (!loggedIn || !authClient?.isConfigured()) {
    showToast("Sign in with an Email account before changing your password.", "warning");
    return;
  }
  window.openEmailAuth("password");
};

window.closeEmailAuth = function(restoreFocus = true) {
  const overlay = document.getElementById("auth-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("auth-open");
  document.getElementById("auth-form")?.reset();
  setAuthFormStatus("");
  if (restoreFocus) authReturnFocus?.focus?.({ preventScroll: true });
};

function bindAuthControls() {
  const overlay = document.getElementById("auth-overlay");
  document.getElementById("auth-mode-tabs")?.addEventListener("click", event => {
    const button = event.target.closest("[data-auth-mode]");
    if (button) setAuthMode(button.dataset.authMode);
  });
  document.getElementById("auth-close")?.addEventListener("click", () => closeEmailAuth(true));
  document.getElementById("auth-username")?.addEventListener("blur", async event => {
    if (authMode !== "signup" || !authClient?.isConfigured()) return;
    const status = document.getElementById("auth-username-status");
    const username = event.target.value.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(username)) { status.textContent = "Use 3–24 letters, numbers, or underscores."; return; }
    status.textContent = "Checking…";
    try { status.textContent = await authClient.checkUsernameAvailability(username) ? "Username available." : "Username unavailable."; }
    catch (error) { status.textContent = "Could not check username yet."; }
  });
  overlay?.addEventListener("click", event => { if (event.target === overlay) closeEmailAuth(true); });
  document.getElementById("auth-forgot-password")?.addEventListener("click", async () => {
    const email = document.getElementById("auth-email").value.trim();
    if (!email) { setAuthFormStatus("Enter your email address first.", "error"); return; }
    if (!authClient?.isConfigured()) { setAuthFormStatus("Supabase is not configured yet.", "error"); return; }
    try { await authClient.resetPasswordForEmail(email); setAuthFormStatus("Password reset email sent.", "success"); }
    catch (error) { setAuthFormStatus(error.message, "error"); }
  });
  document.getElementById("auth-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const displayName = document.getElementById("auth-display-name").value.trim();
    const username = document.getElementById("auth-username").value.trim().toLowerCase();
    const submit = document.getElementById("auth-submit");
    if (!authClient?.isConfigured()) { setAuthFormStatus("Add Supabase credentials in config/supabase.js first.", "error"); return; }
    if (authMode === "signup" && !/^[a-z0-9_]{3,24}$/.test(username)) { setAuthFormStatus("Username must be 3–24 letters, numbers, or underscores.", "error"); return; }
    submit.disabled = true;
    submit.textContent = authMode === "signup" ? "Creating account…" : authMode === "password" ? "Updating password…" : "Signing in…";
    try {
      if (authMode === "signup") {
        const available = await authClient.checkUsernameAvailability(username);
        if (!available) throw new Error("That username is unavailable. Choose another one.");
        const result = await authClient.signUpWithPassword(email, password, displayName, username);
        if (result.session) { await activateAuthenticatedSession(result.session); closeEmailAuth(false); showToast("Your Paragon account is ready."); }
        else { setAuthFormStatus("Account created. Check your email to verify it, then sign in.", "success"); window.showSuccessOverlay?.("Check your inbox! 📬", "We sent a verification link to your email — click it, then sign in. (The envelope is on its way.)"); }
      } else if (authMode === "password") {
        await authClient.updatePassword(password);
        closeEmailAuth(false);
        showToast("Your password was updated.");
      } else {
        const session = await authClient.signInWithPassword(email, password);
        await activateAuthenticatedSession(session);
        closeEmailAuth(false);
        showToast("Signed in to your Paragon account.");
      }
    } catch (error) {
      setAuthFormStatus(error.message, "error");
    } finally {
      submit.disabled = false;
      submit.textContent = authMode === "signup" ? "Create account" : authMode === "password" ? "Update password" : "Sign in";
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && overlay?.classList.contains("active")) closeEmailAuth(true);
  });
}

let collectionReturnFocus = null;

window.openCollectionComposer = function(siteName = null) {
  if (!requirePersonalSession("create collections")) return;
  collectionPickerSiteName = siteName || null;
  const overlay = document.getElementById("collection-overlay");
  if (!overlay) return;
  collectionReturnFocus = document.activeElement;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("collection-open");
  requestAnimationFrame(() => document.getElementById("collection-name")?.focus());
};

window.closeCollectionComposer = function(restoreFocus = true) {
  const overlay = document.getElementById("collection-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("collection-open");
  document.getElementById("collection-form")?.reset();
  if (restoreFocus) collectionReturnFocus?.focus?.({ preventScroll: true });
};

window.deleteCollection = function(collectionId) {
  if (!requirePersonalSession("manage collections")) return;
  const collection = userCollections.find(item => item.id === collectionId);
  if (!collection) return;
  userCollections = userCollections.filter(item => item.id !== collectionId);
  persistPersonalState();
  renderCollectionsAccount();
  showToast(`${collection.name} deleted${guestMode ? " from this Guest session" : " and queued for sync"}.`);
};

function bindCollectionComposer() {
  const overlay = document.getElementById("collection-overlay");
  document.getElementById("collection-close")?.addEventListener("click", () => closeCollectionComposer(true));
  document.getElementById("collection-cancel")?.addEventListener("click", () => closeCollectionComposer(true));
  overlay?.addEventListener("click", event => { if (event.target === overlay) closeCollectionComposer(true); });
  document.getElementById("collection-form")?.addEventListener("submit", event => {
    event.preventDefault();
    if (!requirePersonalSession("create collections")) return;
    const name = document.getElementById("collection-name").value.trim();
    const description = document.getElementById("collection-description").value.trim();
    const icon = document.getElementById("collection-icon").value || "📁";
    if (!name) { showToast("Enter a collection name.", "warning"); return; }
    if (userCollections.some(collection => collection.name.toLowerCase() === name.toLowerCase())) {
      showToast("A collection with that name already exists.", "warning"); return;
    }
    const newCollection = { id: makeLocalId("collection"), name, description, icon, items: [], createdAt: new Date().toISOString() };
    if (collectionPickerSiteName) {
      userCollections.forEach(collection => { collection.items = (collection.items || []).filter(item => item !== collectionPickerSiteName); });
      newCollection.items.push(collectionPickerSiteName);
    }
    userCollections.unshift(newCollection);
    accountProfile.collectionsInitialized = true;
    const movedSite = collectionPickerSiteName;
    collectionPickerSiteName = null;
    persistPersonalState();
    closeCollectionComposer(false);
    renderCollectionsAccount();
    renderAccount();
    showToast(movedSite ? `${movedSite} moved into the new ${name} collection.` : (guestMode ? "Collection created for this Guest session." : "Collection created and queued for account sync."));
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && overlay?.classList.contains("active")) closeCollectionComposer(true);
  });
}

let collectionViewReturnFocus = null;
let collectionPickerSiteName = null;

function showCollectionOverlay(title, content) {
  const overlay = document.getElementById("collection-view-overlay");
  if (!overlay) return;
  document.getElementById("collection-view-title").textContent = title;
  document.getElementById("collection-view-content").innerHTML = content;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("collection-view-open");
  requestAnimationFrame(() => document.getElementById("collection-view-close")?.focus({ preventScroll: true }));
}

window.openCollectionPicker = function(siteName) {
  if (!requirePersonalSession("add websites to collections", { type: "collection", siteName })) return;
  collectionViewReturnFocus = document.activeElement;
  collectionPickerSiteName = siteName;
  const rows = userCollections.map(collection => {
    const included = collection.items?.includes(siteName);
    return `<button type="button" class="collection-choice" onclick="addSiteToCollection('${collection.id}', '${siteName}')"><span class="collection-icon">${escapeHTML(collection.icon || "📁")}</span><span><strong>${escapeHTML(collection.name)}</strong><small>${included ? "Current collection" : `${collection.items?.length || 0} websites`}</small></span><span class="choice-action">${included ? "Current" : "Move here"}</span></button>`;
  }).join("");
  showCollectionOverlay(`Choose a collection for ${siteName}`, `<div class="collection-view-list">${rows || `<div class="account-empty-state">Create a collection first.</div>`}<button type="button" class="secondary-action" onclick="closeCollectionView(false); openCollectionComposer('${siteName}')">+ New Collection</button></div>`);
};

window.addSiteToCollection = function(collectionId, siteName = collectionPickerSiteName) {
  const collection = userCollections.find(item => item.id === collectionId);
  if (!collection || !siteName) return;
  const previousCollection = userCollections.find(item => item.id !== collectionId && (item.items || []).includes(siteName));
  userCollections.forEach(item => { item.items = (item.items || []).filter(name => name !== siteName); });
  collection.items = Array.isArray(collection.items) ? collection.items : [];
  if (!collection.items.includes(siteName)) collection.items.push(siteName);
  persistPersonalState();
  renderCollectionsAccount();
  openCollectionPicker(siteName);
  showToast(previousCollection ? `${siteName} moved from ${previousCollection.name} to ${collection.name}.` : `${siteName} added to ${collection.name}${guestMode ? " for this session" : " and queued for sync"}.`);
};

window.openCollectionView = function(collectionId) {
  if (!requirePersonalSession("view collections")) return;
  collectionViewReturnFocus = document.activeElement;
  const collection = userCollections.find(item => item.id === collectionId);
  if (!collection) return;
  const items = (collection.items || []).map(name => sites.find(site => site.name === name)).filter(Boolean);
  const content = items.length ? `<div class="collection-items">${items.map(site => `<article class="collection-item"><button type="button" class="collection-item-remove" onclick="removeSiteFromCollection('${collection.id}', '${site.name}')" aria-label="Remove ${site.name}">×</button><img src="${paragonTile(site.name, 360, 220)}" alt="${site.name}" loading="lazy"><div class="collection-item-body"><strong>${site.name}</strong><small>${site.category}</small></div></article>`).join("")}</div>` : `<div class="account-empty-state">This collection is empty. Add websites from a website detail page.</div>`;
  showCollectionOverlay(`${collection.icon || "📁"} ${collection.name}`, content);
};

window.removeSiteFromCollection = function(collectionId, siteName) {
  const collection = userCollections.find(item => item.id === collectionId);
  if (!collection) return;
  collection.items = (collection.items || []).filter(name => name !== siteName);
  persistPersonalState();
  renderCollectionsAccount();
  openCollectionView(collectionId);
  showToast(`${siteName} removed from ${collection.name}.`);
};

window.closeCollectionView = function(restoreFocus = true) {
  const overlay = document.getElementById("collection-view-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("collection-view-open");
  if (restoreFocus) collectionViewReturnFocus?.focus?.({ preventScroll: true });
};

function bindCollectionView() {
  const overlay = document.getElementById("collection-view-overlay");
  document.getElementById("collection-view-close")?.addEventListener("click", () => closeCollectionView(true));
  overlay?.addEventListener("click", event => { if (event.target === overlay) closeCollectionView(true); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && overlay?.classList.contains("active")) closeCollectionView(true);
  });
}

let requestReturnFocus = null;

window.openWebsiteRequest = function() {
  const overlay = document.getElementById("request-overlay");
  if (!overlay) return;
  requestReturnFocus = document.activeElement;
  const select = document.getElementById("request-category");
  if (select && !select.options.length) select.innerHTML = `<option value="">Choose category</option>${categoryDefinitions.map(category => `<option value="${category.name}">${category.icon} ${category.name}</option>`).join("")}`;
  if (guestMode) {
    const draft = readStorageJSON(window.sessionStorage, localKeys.guestRequestDraft, {});
    document.getElementById("request-name").value = draft.websiteName || "";
    document.getElementById("request-url").value = draft.websiteUrl || "";
    document.getElementById("request-category").value = draft.category || "";
    document.getElementById("request-reason").value = draft.reason || "";
  }
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("request-open");
  requestAnimationFrame(() => document.getElementById("request-name")?.focus());
};

window.closeWebsiteRequest = function(restoreFocus = true) {
  const overlay = document.getElementById("request-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("request-open");
  if (restoreFocus) requestReturnFocus?.focus?.({ preventScroll: true });
};

function bindWebsiteRequest() {
  const overlay = document.getElementById("request-overlay");
  document.getElementById("request-close")?.addEventListener("click", () => closeWebsiteRequest(true));
  document.getElementById("request-cancel")?.addEventListener("click", () => closeWebsiteRequest(true));
  overlay?.addEventListener("click", event => { if (event.target === overlay) closeWebsiteRequest(true); });
  document.getElementById("request-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const request = {
      websiteName: document.getElementById("request-name").value.trim(),
      websiteUrl: document.getElementById("request-url").value.trim(),
      category: document.getElementById("request-category").value,
      reason: document.getElementById("request-reason").value.trim()
    };
    const status = document.getElementById("request-status");
    if (request.reason.length < 10) { status.textContent = "Please explain your request in at least 10 characters."; status.className = "auth-form-status error"; return; }
    if (guestMode) {
      writeStorageJSON(window.sessionStorage, localKeys.guestRequestDraft, request);
      status.textContent = "Guest draft saved for this session. Sign in to submit it to Paragon.";
      status.className = "auth-form-status success";
      return;
    }
    if (!loggedIn) { closeWebsiteRequest(false); requirePersonalSession("submit a website request", { type: "request" }); return; }
    status.textContent = "Submitting…";
    status.className = "auth-form-status";
    try {
      await syncClient.submitWebsiteRequest(request);
      document.getElementById("request-form").reset();
      closeWebsiteRequest(false);
      window.showSuccessOverlay("Request submitted!", "Thank you — your idea is now counted for real. The most-requested websites get built first.");
    } catch (error) {
      status.textContent = error.message;
      status.className = "auth-form-status error";
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && overlay?.classList.contains("active")) closeWebsiteRequest(true);
  });
}

window.guestLogin = function() {
  loggedIn = false;
  guestMode = true;
  authUser = null;
  identityLoading = false;
  try {
    window.sessionStorage.setItem(localKeys.guestSession, "true");
    window.sessionStorage.removeItem(localKeys.guestInactiveSince);
  } catch (error) { /* memory-only fallback */ }
  applyPersonalState(readStorageJSON(window.sessionStorage, localKeys.guestState, {}));
  ensureStarterCollections();
  persistPersonalState();
  renderAccount();
  renderUpdates();
  renderNotificationList();
  syncNotificationPreference();
  showToast("Guest session started. Personal activity will disappear when this browser session ends.", "warning");
  resumePendingPersonalIntent();
};

window.logout = async function() {
  const wasGuest = guestMode;
  if (loggedIn) {
    await flushPersonalState();
    try { await authClient?.signOut?.(); } catch (error) { showToast(`Remote sign-out warning: ${error.message}`, "warning"); }
  }
  clearGuestSessionStorage();
  loggedIn = false; guestMode = false; authUser = null; clearPersonalState(); identityLoading = false;
  syncClient?.clearCache?.();
  renderAccount();
  renderUpdates();
  renderNotificationList();
  syncNotificationPreference();
  showToast(wasGuest ? "Guest session ended and temporary personal data was cleared." : "Signed out of your Paragon account.");
};

window.toggleDark = function(input) {
  const darkEnabled = input.checked;
  document.documentElement.classList.toggle("light", !darkEnabled);
  const storage = guestMode ? window.sessionStorage : window.localStorage;
  try { storage.setItem(localKeys.theme, darkEnabled ? "dark" : "light"); } catch (error) { /* ignore */ }
  try { window.localStorage.setItem(THEME_MODE_KEY, "manual"); } catch (error) { /* blocked */ } /* P-097 — manual beats auto */
  if (hasPersonalSession()) accountProfile.themeSwitchCount = Number(accountProfile.themeSwitchCount || 0) + 1;
  persistPersonalState();
  syncTopThemeButton();
  renderAccount();
  showToast(`${darkEnabled ? "Dark" : "Light"} mode enabled.`);
};
window.toggleNotificationsPreference = function(input) {
  const storage = guestMode ? window.sessionStorage : window.localStorage;
  try { storage.setItem(localKeys.notificationsEnabled, String(input.checked)); } catch (error) { /* ignore */ }
  persistPersonalState();
  syncNotificationPreference();
  showToast(`Notifications ${input.checked ? "enabled" : "disabled"}.`);
};

/* --- Nav Tabs --- */
function closeAllTransientUI() {
  window.closeSearchOverlay?.(false);
  window.closeTrendingOverlay?.(false);
  window.closeStaffOverlay?.(false);
  window.closeRecentOverlay?.(false);
  window.closeCategoryOverlay?.(false);
  window.closeReviewComposer?.(false);
  window.closeEmailAuth?.(false);
  window.closeCollectionComposer?.(false);
  window.closeCollectionView?.(false);
  window.closeWebsiteRequest?.(false);
  window.closeWebsiteQR?.(false);
  window.ParagonAI?.close?.();
  window.closeAchievementsAbout?.();
  window.closePrivacyControls?.();
  window.closeSitePreview?.(false);
  window.closeScreenshotLightbox?.(false);
  closeNotificationPanel(false);
}

window.switchToTab = function(name, options = {}) {
  try {
    if (String(name) === "updates" && hasPersonalSession()) {
      accountProfile.updatesViewCount = Number(accountProfile.updatesViewCount || 0) + 1;
      persistPersonalState();
      renderAchievementsAccount();
    }
  } catch (_) {}
  const { scroll = true, updateHash = true } = options;
  if (!["websites", "updates", "account"].includes(name)) name = "websites";
  closeAllTransientUI();
  ["websites", "updates", "account"].forEach(tabName => {
    const section = document.getElementById(`tab-${tabName}`);
    if (!section) return;
    const active = tabName === name;
    section.style.display = active ? "block" : "none";
    section.setAttribute("aria-hidden", String(!active));
  });
  document.getElementById("detail-view")?.classList.remove("active");
  detailNavigationHistory.length = 0;
  currentDetailName = null;
  setActiveTabState(name);
  if (name === "account") renderAccount();
  if (updateHash && window.history?.replaceState) window.history.replaceState(null, "", `#${name}`);
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
};

function bindNav() {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", event => {
      event.preventDefault();
      window.switchToTab(tab.dataset.tab);
    });
  });
  document.getElementById("bottom-nav")?.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...document.querySelectorAll(".nav-tab")];
    const current = Math.max(0, tabs.indexOf(document.activeElement));
    const next = (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    window.switchToTab(tabs[next].dataset.tab);
  });
  document.getElementById("home-link")?.addEventListener("click", event => {
    event.preventDefault();
    window.switchToTab("websites");
  });
  const initialTab = window.location.hash.replace("#", "");
  if (["updates", "account"].includes(initialTab)) window.switchToTab(initialTab, { scroll: false, updateHash: false });
  else setActiveTabState("websites");
}

function openInitialSiteRoute() {
  const params = new URLSearchParams(window.location.search);
  const siteName = params.get("site");
  /* P-094 — footer/legal destinations arrive through the Hub detail page first; the user's
     chosen section (then=) is remembered so OPEN lands exactly where they were heading. */
  const thenDestination = params.get("then");
  if (thenDestination && siteName === "Paragon Archive Hub") {
    try { window.sessionStorage.setItem("paragonArchive.hubDestination.v1", String(thenDestination).replace(/[^a-z0-9-]/gi, "")); } catch (error) { /* blocked */ }
  }
  if (siteName && (sites.some(site => site.name === siteName) || siteName === deployedTemplateExample.name)) {
    window.openDetail(siteName);
    if (thenDestination) continueToPendingDestination(); // P-096 — detail first, then straight to what they clicked
  }
}

/* P-096 — footer/legal destinations: the detail page opens FIRST, then the user is carried
   automatically to the exact section they wanted (OPEN honors the pending destination).
   Signed-in/guest users auto-continue; first-time visitors get a one-tap hand-off. */
const HUB_DESTINATION_LABELS = { about: "About Paragon", "privacy-policy": "Privacy & Security", terms: "Terms & Conditions", help: "Help & Support", "request-site": "Request a Website", community: "the Community", deployed: "the Deployed category", home: "the Hub home" };
window.continueToPendingDestination = function() {
  let destination = "";
  try { destination = window.sessionStorage.getItem("paragonArchive.hubDestination.v1") || ""; } catch (error) { /* blocked */ }
  if (!destination) return;
  const label = HUB_DESTINATION_LABELS[destination] || destination;
  const detail = document.getElementById("detail-view");
  if (!detail) return;
  const banner = document.createElement("div");
  banner.className = "destination-continue-banner";
  banner.innerHTML = `
    <div>
      <strong>➡ You asked for ${escapeHTML(label)}</strong>
      <span>Taking you there now — this is the Paragon Archive Hub's page first, exactly as Paragon flows.</span>
    </div>
    <div class="destination-continue-actions">
      ${hasPersonalSession() ? `<button type="button" class="primary-action" onclick="launchSite('Paragon Archive Hub', document.querySelector('#detail-view .open-btn'))">Go now</button>` : `<button type="button" class="primary-action" onclick="requirePersonalSession('continue to ${escapeHTML(label)}')">Continue as Guest / Sign in</button>`}
      <button type="button" class="secondary-action" onclick="this.closest('.destination-continue-banner').remove()">Stay here</button>
    </div>`;
  detail.prepend(banner);
  if (hasPersonalSession()) {
    window.setTimeout(() => {
      if (!document.body.contains(banner)) return; // user chose to stay
      const openButton = document.querySelector("#detail-view .open-btn");
      if (openButton && !openButton.disabled) launchSite("Paragon Archive Hub", openButton);
    }, 1400);
  }
};

/* P-094 — resolve the launch URL for a site; the Hub honors a pending footer destination. */
function resolveLaunchUrl(site) {
  let url = site?.siteUrl && site.siteUrl !== "#" ? site.siteUrl : "";
  if (site?.name === "Paragon Archive Hub" && url) {
    try {
      const destination = window.sessionStorage.getItem("paragonArchive.hubDestination.v1");
      if (destination) {
        window.sessionStorage.removeItem("paragonArchive.hubDestination.v1");
        url = url.split("#")[0] + "#" + destination;
      }
    } catch (error) { /* blocked */ }
  }
  return url;
}
window.resolveLaunchUrl = resolveLaunchUrl;

/*
  D-118: illustrative Deployed detail template example. This record is NOT part of the
  public catalogue — it never appears in lists, search, or rankings. It exists only so
  the owner can preview the future Deployed detail layout from the Hub Deployed docs,
  and every rendered value is clearly labelled illustrative on the page itself.
*/
const deployedTemplateExample = {
  name: "My Cool App",
  category: "Deployed",
  group: "Deployed",
  stars: 4.2,
  color: "#f59e0b",
  desc: "Design tool example for the future Deployed detail template",
  icon: "🧰",
  tag: "Tools",
  siteUrl: "paragon-archive-hub.html#deployed",
  version: "v2.1 — January 2027 (example)",
  about: "My Cool App is a design tool that lets you create social graphics, banners, and simple layouts in minutes. This is an illustrative example page: it demonstrates exactly how a real third-party website approved into the Deployed category will be presented — developer identity, premium disclosure, screenshots, updates, and reviews — before any real submission exists.",
  features: ["Drag-and-drop editor", "Template library", "One-click export", "Team sharing"],
  updates: ["Drag-and-drop editor", "Template library", "One-click export", "Team sharing"],
  reviews: [],
  illustrative: true,
  developer: {
    handle: "@JohnDev",
    bio: "Frontend developer from Lagos. Building tools that make design easier for everyone.",
    joined: "January 2027 (example)",
    deployedCount: 3
  },
  premium: {
    price: "$4.99/month — example",
    free: ["Basic editor", "5 projects", "Export as PNG"],
    premium: ["Unlimited projects", "Export as SVG and PDF", "Custom fonts", "Priority support from developer"]
  }
};

/* --- Search --- */
let activeSearchCategory = "All";
let searchReturnFocus = null;
let searchResultsMode = false;
let inlineHintValue = "";

const searchStopWords = new Set([
  "a", "an", "and", "are", "can", "for", "from", "i", "in", "is", "it", "me", "my",
  "of", "on", "or", "that", "the", "this", "to", "want", "website", "with"
]);

function normalizeSearchText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSearchTerms(query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  const usefulTerms = normalized.split(/\s+/).filter(term => term.length > 1 && !searchStopWords.has(term));
  return usefulTerms.length ? usefulTerms : [normalized];
}

function scoreSiteForSearch(site, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;
  const terms = getSearchTerms(query);
  const fields = [
    { text: normalizeSearchText(site.name), weight: 50 },
    { text: normalizeSearchText(site.category), weight: 28 },
    { text: normalizeSearchText(site.tag), weight: 24 },
    { text: normalizeSearchText(site.desc), weight: 22 },
    { text: normalizeSearchText(site.about), weight: 14 },
    { text: normalizeSearchText([...(site.features || []), ...(site.updates || [])].join(" ")), weight: 10 }
  ];
  let matchedTerms = 0;
  let score = 0;
  terms.forEach(term => {
    const best = fields.reduce((current, field) => field.text.includes(term) ? Math.max(current, field.weight) : current, 0);
    if (best > 0) { matchedTerms += 1; score += best; }
  });
  const required = terms.length <= 2 ? terms.length : Math.ceil(terms.length * 0.6);
  if (matchedTerms < required) return 0;
  if (fields[0].text === normalizedQuery) score += 150;
  else if (fields[0].text.startsWith(normalizedQuery)) score += 90;
  else if (fields[0].text.includes(normalizedQuery)) score += 60;
  if (fields[3].text.includes(normalizedQuery)) score += 30;
  return score;
}

function getSearchMatches(query) {
  const clean = String(query || "").trim();
  if (!clean) return [];
  const aiRanked = window.ParagonAI?.rankWebsites?.(clean, { limit: sites.length, minimumScore: 10 });
  if (Array.isArray(aiRanked) && aiRanked.length) return aiRanked.map(entry => entry.site).filter(Boolean);
  return sites.map(site => ({ site, score: scoreSiteForSearch(site, clean) }))
    .filter(entry => entry.score > 0)
    .sort((first, second) => second.score - first.score || first.site.name.localeCompare(second.site.name))
    .map(entry => entry.site);
}

function getSearchCategories() { return []; }

function recentSearchStorage() { return guestMode ? window.sessionStorage : window.localStorage; }
function readRecentSearches() {
  try {
    const values = JSON.parse(recentSearchStorage().getItem(localKeys.recentSearches) || "[]");
    return Array.isArray(values) ? values.filter(value => typeof value === "string" && value.trim()).slice(0, 8) : [];
  } catch (error) { return []; }
}
function writeRecentSearches(values) {
  try { recentSearchStorage().setItem(localKeys.recentSearches, JSON.stringify(values.slice(0, 8))); }
  catch (error) { /* Search remains usable without storage. */ }
}
function recordRecentSearch(query) {
  const clean = String(query || "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (!clean) return readRecentSearches();
  const next = [clean, ...readRecentSearches().filter(item => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
  writeRecentSearches(next);
  renderRecentSearches();
  return next;
}
function renderRecentSearches() {
  const section = document.getElementById("recent-searches");
  const list = document.getElementById("recent-search-list");
  const query = document.getElementById("search-input")?.value.trim() || "";
  if (!section || !list) return [];
  const recent = readRecentSearches();
  section.hidden = Boolean(searchResultsMode || query || !recent.length);
  list.innerHTML = recent.map(item => `<button type="button" data-recent-search="${escapeHTML(item)}"><span aria-hidden="true">⌕</span><span>${escapeHTML(item)}</span></button>`).join("");
  return recent;
}

function longestCommonPrefix(values) {
  if (!values.length) return "";
  let prefix = values[0];
  for (const value of values.slice(1)) {
    let index = 0;
    while (index < prefix.length && index < value.length && prefix[index].toLowerCase() === value[index].toLowerCase()) index += 1;
    prefix = prefix.slice(0, index);
    if (!prefix) break;
  }
  return prefix;
}

function getInlineSearchHint(query) {
  const raw = String(query || "");
  const leading = raw.match(/^\s*/)?.[0] || "";
  const typed = raw.slice(leading.length);
  if (!typed || typed.endsWith(" ")) return "";
  const useFullName = /^paragon\s/i.test(typed);
  const candidates = sites.map(site => useFullName ? site.name : site.name.replace(/^Paragon\s+/i, ""))
    .filter(name => name.toLowerCase().startsWith(typed.toLowerCase()));
  if (!candidates.length) return "";
  const prefix = longestCommonPrefix(candidates);
  return prefix.length > typed.length ? leading + typed + prefix.slice(typed.length) : "";
}

function renderInlineSearchHint(query = document.getElementById("search-input")?.value || "") {
  const hint = document.getElementById("search-inline-hint");
  const raw = String(query || "");
  inlineHintValue = getInlineSearchHint(raw);
  if (!hint || !inlineHintValue) {
    if (hint) hint.innerHTML = "";
    return "";
  }
  const remainder = inlineHintValue.slice(raw.length);
  hint.innerHTML = `<span class="hint-typed">${escapeHTML(raw)}</span><span class="hint-completion">${escapeHTML(remainder)}</span>`;
  return inlineHintValue;
}

function acceptInlineSearchHint() {
  const input = document.getElementById("search-input");
  if (!input || !inlineHintValue) return false;
  input.value = inlineHintValue;
  input.setSelectionRange?.(input.value.length, input.value.length);
  renderInlineSearchHint(input.value);
  renderSearchSuggestions(input.value);
  return true;
}

function renderSearchSuggestions(query = document.getElementById("search-input")?.value || "") {
  const suggestions = document.getElementById("search-suggestions");
  const input = document.getElementById("search-input");
  if (!suggestions) return [];
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery || searchResultsMode) {
    suggestions.innerHTML = "";
    suggestions.hidden = true;
    input?.setAttribute("aria-expanded", "false");
    return [];
  }
  const matches = sites
    .map(site => ({ site, name: normalizeSearchText(site.name), suffix: normalizeSearchText(site.name.replace(/^Paragon\s+/i, "")), score: scoreSiteForSearch(site, query) }))
    .filter(entry => entry.score > 0)
    .sort((first, second) => Number(second.suffix.startsWith(normalizedQuery) || second.name.startsWith(normalizedQuery)) - Number(first.suffix.startsWith(normalizedQuery) || first.name.startsWith(normalizedQuery)) || second.score - first.score || first.site.name.localeCompare(second.site.name))
    .slice(0, 10)
    .map(entry => entry.site);
  if (!matches.length) {
    suggestions.innerHTML = "";
    suggestions.hidden = true;
    input?.setAttribute("aria-expanded", "false");
    return [];
  }
  suggestions.innerHTML = matches.map(site => `
    <button type="button" class="search-suggestion-card" role="option" data-search-suggestion="${escapeHTML(site.name)}">
      <span class="search-suggestion-icon" aria-hidden="true">${site.icon}</span>
      <span class="search-suggestion-copy"><strong>${escapeHTML(site.name)}</strong><small>${escapeHTML(site.category)} · ${escapeHTML(site.desc)}</small></span>
    </button>`).join("");
  suggestions.hidden = false;
  input?.setAttribute("aria-expanded", "true");
  return matches;
}

function renderSearchResults(query = document.getElementById("search-input")?.value || "") {
  const results = document.getElementById("search-results");
  const heading = document.getElementById("search-results-heading");
  const queryLabel = document.getElementById("search-results-query");
  if (!results) return [];
  const clean = String(query || "").trim();
  const matches = getSearchMatches(clean);
  const exactNameMatch = matches.some(site => site.name.toLowerCase() === clean.toLowerCase());
  /* P-094 — ONE search AI, ONE presentation (owner rule after the "two AI" complaint):
     exact name gives plain results; ANY non-exact search (including zero matches) gives the single
     ✦ Paragon AI block with real icon art, confidence, match reasons — no padded lists, no
     second differently-styled AI block, no emoji fallback in AI rows. */
  if (matches.length && exactNameMatch) {
    if (heading) heading.textContent = "Search Results";
    if (queryLabel) queryLabel.textContent = clean || "Your search";
    results.innerHTML = matches.map(site => `
      <a href="#" class="recent-item" onclick="openSearchResult('${site.name}'); return false;">
        <span class="icon" aria-hidden="true">${SITE_ICON_ART[site.name] ? `<img class="site-icon-art-list" src="${SITE_ICON_ART[site.name]}" alt="">` : site.icon}</span>
        <div class="meta"><div class="name">${site.name}</div><div class="cat"><span style="color:${getCategoryColor(site.category)}">●</span> ${site.category} · ${site.desc}</div></div>
      </a>`).join("");
    return matches;
  }
  const aiRanked = (window.ParagonAI?.rankWebsites?.(clean, { limit: 6, minimumScore: 40 }) || []).filter(entry => entry.confidence >= 0.25 || entry.similarity >= 0.45);
  if (heading) heading.textContent = matches.length || aiRanked.length ? "Search Results" : "No Results";
  if (queryLabel) queryLabel.textContent = clean || "Your search";
  if (aiRanked.length) {
    results.innerHTML = `
      <div class="ai-suggest-block" role="region" aria-label="Paragon AI suggestions">
        <div class="ai-suggest-head">
          <span class="ai-suggest-badge">✦ Paragon AI</span>
          <strong>Closest matches to what you typed</strong>
          <span>No exact website name matched “${escapeHTML(clean)}” — ranked from full catalogue knowledge (names, purpose, features, concept documentation).</span>
        </div>
        ${aiRanked.map(entry => `
          <a href="#" class="recent-item ai-suggest-item" onclick="openSearchResult('${entry.site.name}'); return false;">
            <span class="icon" aria-hidden="true">${SITE_ICON_ART[entry.site.name] ? `<img class="site-icon-art-list" src="${SITE_ICON_ART[entry.site.name]}" alt="">` : entry.site.icon}</span>
            <div class="meta">
              <div class="name">${entry.site.name}</div>
              <div class="cat"><span style="color:${getCategoryColor(entry.site.category)}">●</span> ${entry.site.category} · ${entry.site.desc}</div>
              ${entry.reasons?.length ? `<div class="ai-suggest-reason">Matched: ${entry.reasons.map(reason => escapeHTML(reason)).join(" · ")}</div>` : ""}
            </div>
            <span class="ai-suggest-confidence" aria-label="Match confidence">${Math.round(entry.confidence * 100)}%</span>
          </a>`).join("")}
      </div>`;
    return matches;
  }
  if (matches.length) {
    results.innerHTML = matches.map(site => `
      <a href="#" class="recent-item" onclick="openSearchResult('${site.name}'); return false;">
        <span class="icon" aria-hidden="true">${SITE_ICON_ART[site.name] ? `<img class="site-icon-art-list" src="${SITE_ICON_ART[site.name]}" alt="">` : site.icon}</span>
        <div class="meta"><div class="name">${site.name}</div><div class="cat"><span style="color:${getCategoryColor(site.category)}">●</span> ${site.category} · ${site.desc}</div></div>
      </a>`).join("");
    return matches;
  }
  /* Nothing anywhere: honest empty state + the request path. Still exactly ONE AI voice — none. */
  const requestBlock = `
    <div class="search-request-block">
      <strong>No AI suggestions this time. I think it's time to request that website.</strong>
      <span>Tell Paragon exactly what it should do and it goes on the build list.</span>
      <a class="primary-action search-request-action" href="paragon-archive-hub.html#request-site">Request this website</a>
    </div>`;
  results.innerHTML = `
    <div class="search-empty-state">
      <img class="empty-illus" src="assets/illustrations/empty-search.png" alt="" loading="lazy">
      <strong>No matching website. Try another phrase.</strong>
      <span>Paragon is building more, so exact names may not exist yet.</span>
    </div>
    ${requestBlock}`;
  return matches;
}

function setSearchResultsMode(active, query = document.getElementById("search-input")?.value || "") {
  searchResultsMode = Boolean(active);
  if (searchResultsMode && String(query || "").trim() && hasPersonalSession()) {
    accountProfile.resultsSearchCount = Number(accountProfile.resultsSearchCount || 0) + 1;
    persistPersonalState();
  }
  const entry = document.getElementById("search-entry-view");
  const results = document.getElementById("search-results-view");
  const title = document.getElementById("search-view-title");
  if (entry) entry.hidden = searchResultsMode;
  if (results) results.hidden = !searchResultsMode;
  if (title) title.textContent = searchResultsMode ? "Search Results" : "Search";
  if (searchResultsMode) renderSearchResults(query);
  else {
    renderSearchSuggestions(query);
    renderInlineSearchHint(query);
    renderRecentSearches();
  }
}

function submitSearch() {
  const input = document.getElementById("search-input");
  const query = input?.value.trim() || "";
  if (!query) return false;
  recordRecentSearch(query);
  setSearchResultsMode(true, query);
  document.getElementById("search-results-view")?.scrollTo?.({ top: 0, behavior: "auto" });
  document.getElementById("search-back")?.focus?.({ preventScroll: true });
  return true;
}
window.submitSearch = submitSearch;

window.openSearchResult = function(siteName) {
  const query = document.getElementById("search-input")?.value || siteName;
  recordRecentSearch(query);
  window.openDetail(siteName);
  closeSearchOverlay(false);
};

function setSearchCategory(_category, shouldFocus = true) {
  activeSearchCategory = "All";
  if (searchResultsMode) renderSearchResults();
  else {
    renderSearchSuggestions();
    renderInlineSearchHint();
    renderRecentSearches();
  }
  if (shouldFocus) document.getElementById("search-input")?.focus();
}
window.setSearchCategory = setSearchCategory;

window.openSearchOverlay = function(shouldFocus = true, preserveMode = false) {
  const overlay = document.getElementById("search-overlay");
  if (!overlay) return;
  if (!overlay.classList.contains("active")) searchReturnFocus = document.activeElement;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-open");
  if (!preserveMode) setSearchResultsMode(false);
  else setSearchResultsMode(searchResultsMode);
  if (shouldFocus && !searchResultsMode) requestAnimationFrame(() => document.getElementById("search-input")?.focus({ preventScroll: true }));
};

window.closeSearchOverlay = function(restoreFocus = true) {
  const overlay = document.getElementById("search-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
  if (restoreFocus && searchReturnFocus?.focus) searchReturnFocus.focus({ preventScroll: true });
};

window.handleSearchBack = function() {
  if (searchResultsMode) {
    setSearchResultsMode(false);
    requestAnimationFrame(() => document.getElementById("search-input")?.focus({ preventScroll: true }));
    return;
  }
  closeSearchOverlay(true);
};

function bindSearch() {
  const overlay = document.getElementById("search-overlay");
  const input = document.getElementById("search-input");
  setSearchResultsMode(false);
  document.getElementById("search-btn")?.addEventListener("click", () => openSearchOverlay(true));
  input?.addEventListener("input", event => {
    renderInlineSearchHint(event.target.value);
    renderSearchSuggestions(event.target.value);
    renderRecentSearches();
  });
  input?.addEventListener("keydown", event => {
    const atEnd = event.currentTarget.selectionStart === event.currentTarget.value.length && event.currentTarget.selectionEnd === event.currentTarget.value.length;
    if ((event.key === "Tab" || event.key === "ArrowRight") && atEnd && inlineHintValue) {
      event.preventDefault();
      acceptInlineSearchHint();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  });
  overlay?.addEventListener("click", event => {
    const suggestion = event.target.closest("[data-search-suggestion]");
    if (suggestion) {
      input.value = suggestion.dataset.searchSuggestion;
      submitSearch();
      return;
    }
    const recent = event.target.closest("[data-recent-search]");
    if (recent) {
      input.value = recent.dataset.recentSearch;
      renderInlineSearchHint(input.value);
      renderSearchSuggestions(input.value);
      input.focus();
      return;
    }
    if (event.target === overlay) closeSearchOverlay(true);
  });
  document.getElementById("clear-recent-searches")?.addEventListener("click", () => {
    writeRecentSearches([]);
    renderRecentSearches();
  });
  document.addEventListener("keydown", event => {
    if (!overlay?.classList.contains("active")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      window.handleSearchBack();
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]')].filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}

/* --- Top Icons & Notifications --- */
let notificationReturnFocus = null;

function notificationsEnabled() {
  try {
    const storage = guestMode ? window.sessionStorage : window.localStorage;
    return storage.getItem(localKeys.notificationsEnabled) !== "false";
  } catch (error) { return true; }
}

function normalizedNotification(notification) {
  const createdAt = new Date(notification?.createdAt || Date.now());
  const lifetime = ["ad", "promotion"].includes(notification?.type) ? adNotificationLifetimeMs : notificationLifetimeMs;
  const expiresAt = new Date(notification?.expiresAt || createdAt.getTime() + lifetime);
  return {
    id: String(notification?.id || makeLocalId("notification")),
    type: String(notification?.type || "update"),
    title: String(notification?.title || "Paragon Archive notification"),
    message: String(notification?.message || ""),
    icon: String(notification?.icon || "↻"),
    updateId: notification?.updateId ? String(notification.updateId) : null,
    publicCampaign: Boolean(notification?.publicCampaign),
    createdAt: Number.isNaN(createdAt.getTime()) ? new Date().toISOString() : createdAt.toISOString(),
    expiresAt: Number.isNaN(expiresAt.getTime()) ? new Date(Date.now() + lifetime).toISOString() : expiresAt.toISOString(),
    readAt: notification?.readAt || null
  };
}

function activeNotifications({ prune = true } = {}) {
  const now = Date.now();
  const privateNormalized = loggedIn ? inAppNotifications.map(normalizedNotification) : [];
  const privateActive = privateNormalized.filter(notification => new Date(notification.expiresAt).getTime() > now);
  if (loggedIn && prune && privateActive.length !== inAppNotifications.length) {
    inAppNotifications = privateActive;
    persistPersonalState();
  }
  const readMap = accountProfile.publicNotificationReads || {};
  const publicActive = (loggedIn || guestMode ? publicNotifications : [])
    .filter(notification => ["ad", "promotion"].includes(notification?.type))
    .map(notification => normalizedNotification({ ...notification, publicCampaign: true, readAt: readMap[notification.id] || null }))
    .filter(notification => new Date(notification.expiresAt).getTime() > now);
  const byId = new Map();
  [...privateActive, ...publicActive].forEach(notification => byId.set(notification.id, notification));
  return [...byId.values()].sort((first, second) => {
    if (first.type === "welcome" && second.type !== "welcome") return -1;
    if (second.type === "welcome" && first.type !== "welcome") return 1;
    return new Date(second.createdAt) - new Date(first.createdAt);
  });
}

function notificationCutoffDate() {
  const stored = accountProfile.notificationCutoffAt ? new Date(accountProfile.notificationCutoffAt) : null;
  if (stored && !Number.isNaN(stored.getTime())) return stored;
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function synchronizeNotificationFeed({ manual = false } = {}) {
  if (!loggedIn) {
    renderNotificationList();
    syncNotificationPreference();
    if (manual) showToast(guestMode ? "Guest sponsored notifications are up to date." : "Sign in to sync personal notifications.", guestMode ? "success" : "warning");
    return 0;
  }

  const now = new Date();
  let changed = false;
  if (!accountProfile.notificationStartedAt) {
    accountProfile.notificationStartedAt = now.toISOString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    accountProfile.notificationCutoffAt = startOfToday.toISOString();
    changed = true;
  }
  if (!accountProfile.welcomeNotificationCreatedAt) {
    const welcomeCreatedAt = now.toISOString();
    inAppNotifications.push({
      id: "welcome-to-paragon-archive",
      type: "welcome",
      title: "Welcome to Paragon Archive",
      message: "Your account is ready. Explore websites, save favorites and keep your Paragon progress together.",
      icon: "◈",
      createdAt: welcomeCreatedAt,
      expiresAt: new Date(now.getTime() + notificationLifetimeMs).toISOString(),
      readAt: null
    });
    accountProfile.welcomeNotificationCreatedAt = welcomeCreatedAt;
    changed = true;
  }

  const existingIds = new Set(inAppNotifications.map(notification => notification.id));
  const cutoff = notificationCutoffDate().getTime();
  let added = 0;
  buildUpdateEvents().forEach(update => {
    const updateTime = update.date.getTime();
    if (updateTime < cutoff || updateTime > now.getTime()) return;
    const id = `update-notification:${update.id}`;
    if (existingIds.has(id)) return;
    const createdAt = new Date(Math.max(updateTime, new Date(accountProfile.notificationStartedAt).getTime())).toISOString();
    inAppNotifications.push({
      id,
      type: "update",
      title: update.title,
      message: update.desc,
      icon: update.icon || "↻",
      updateId: update.id,
      createdAt,
      expiresAt: new Date(new Date(createdAt).getTime() + notificationLifetimeMs).toISOString(),
      readAt: null
    });
    existingIds.add(id);
    added += 1;
    changed = true;
  });

  accountProfile.notificationLastSyncedAt = now.toISOString();
  activeNotifications();
  if (changed || manual) persistPersonalState();
  renderNotificationList();
  syncNotificationPreference();
  if (manual) showToast(added ? `${added} new notification${added === 1 ? "" : "s"} synced.` : "Notifications are up to date.");
  return added;
}
window.synchronizeNotificationFeed = synchronizeNotificationFeed;

/* P-092 — the in-app inbox: real Team replies, shown to everyone (they answer YOUR ticket). */
function readUserInbox() {
  try { return JSON.parse(window.localStorage.getItem("paragonUserInbox.v1") || "null") || []; }
  catch (error) { return []; }
}
function markInboxRead() {
  try {
    const inbox = readUserInbox();
    inbox.forEach(entry => { entry.read = true; });
    window.localStorage.setItem("paragonUserInbox.v1", JSON.stringify(inbox));
  } catch (error) { /* blocked */ }
}
function inboxMarkup() {
  const inbox = readUserInbox();
  if (!inbox.length) return "";
  return inbox.slice().reverse().map(entry => `<article class="notification-item inbox-item ${entry.read ? "" : "unread"}"><div class="notification-icon">💬</div><div><strong>${escapeHTML(entry.title)}</strong><p>${escapeHTML(entry.text)}</p><time>${new Date(entry.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div></article>`).join("");
}

function renderNotificationList() {
  const list = document.getElementById("notification-list");
  if (!list) return;
  const inboxHtml = inboxMarkup();
  if (!loggedIn && !guestMode) {
    list.innerHTML = inboxHtml + `<div class="notification-empty notification-empty-rich"><img src="assets/brand/logo-mark.png" alt="" class="notif-brand"><strong>Account notifications</strong><p>Sign in to receive a welcome message and real Archive updates.</p><p class="notif-guest-note">🔒 Guest mode receives only protected sponsored/promotional notices.</p><button type="button" class="primary-action notif-signin-btn" onclick="closeNotificationPanel(false); switchToTab('account')">Sign in</button></div>`;
    return;
  }
  const notifications = activeNotifications();
  if (!notifications.length) {
    list.innerHTML = inboxHtml + `<div class="notification-empty"><strong>No current notifications</strong>${guestMode ? "Guest receives only current sponsored/promotional notices." : "Select ↻ to check for newly added Archive activity."}</div>`;
    return;
  }
  list.innerHTML = notifications.map(notification => {
    const expires = new Date(notification.expiresAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    return `<button class="notification-item ${notification.readAt ? "" : "unread"}" type="button" data-notification-id="${escapeHTML(notification.id)}">
      <span class="notification-icon">${escapeHTML(notification.icon)}</span><span><strong>${escapeHTML(notification.title)}</strong>${["ad", "promotion"].includes(notification.type) ? `<small class="notification-sponsored">${notification.type === "ad" ? "Sponsored notification" : "Paragon promotion"} · 72-hour limit</small>` : ""}<small>${escapeHTML(notification.message)}</small><small class="notification-expiry">Available until ${expires}</small></span>
    </button>`;
  }).join("");
}

function markAllNotificationsRead() {
  const readAt = new Date().toISOString();
  const active = activeNotifications();
  const publicReads = { ...(accountProfile.publicNotificationReads || {}) };
  active.filter(notification => notification.publicCampaign).forEach(notification => { publicReads[notification.id] = notification.readAt || readAt; });
  accountProfile.publicNotificationReads = publicReads;
  inAppNotifications = inAppNotifications.map(notification => active.some(item => item.id === notification.id) ? { ...notification, readAt: notification.readAt || readAt } : notification);
  persistPersonalState();
  renderNotificationList();
  syncNotificationPreference();
}

function syncNotificationPreference() {
  const button = document.getElementById("notifications-btn");
  const dot = button?.querySelector(".notification-dot");
  if (!button) return;
  const enabled = notificationsEnabled();
  const unreadCount = (loggedIn || guestMode) && enabled ? activeNotifications({ prune: false }).filter(notification => !notification.readAt).length : 0;
  const unread = unreadCount > 0;
  if (dot) dot.hidden = !unread;
  button.dataset.unread = String(unread);
  button.setAttribute("aria-label", enabled ? (unread ? `Notifications, ${unreadCount} unread` : "Notifications, no unread notifications") : "Notifications disabled");
}
window.syncNotificationPreference = syncNotificationPreference;

function openNotificationPanel() {
  const panel = document.getElementById("notification-panel");
  const button = document.getElementById("notifications-btn");
  if (!panel || !button) return;
  notificationReturnFocus = button;
  renderNotificationList();
  markInboxRead(); // opening the panel reads the Team replies
  panel.hidden = false;
  panel.setAttribute("aria-hidden", "false");
  button.setAttribute("aria-expanded", "true");
}

function closeNotificationPanel(restoreFocus = true) {
  const panel = document.getElementById("notification-panel");
  const button = document.getElementById("notifications-btn");
  if (!panel || !button || panel.hidden) return;
  panel.hidden = true;
  panel.setAttribute("aria-hidden", "true");
  button.setAttribute("aria-expanded", "false");
  if (restoreFocus) notificationReturnFocus?.focus?.({ preventScroll: true });
}
window.closeNotificationPanel = closeNotificationPanel;

function selectNotification(notificationId) {
  const notification = activeNotifications().find(item => item.id === notificationId);
  if (!notification) return;
  notification.readAt = notification.readAt || new Date().toISOString();
  if (notification.publicCampaign) {
    accountProfile.publicNotificationReads = { ...(accountProfile.publicNotificationReads || {}), [notification.id]: notification.readAt };
  } else {
    inAppNotifications = inAppNotifications.map(item => item.id === notification.id ? notification : item);
  }
  persistPersonalState();
  closeNotificationPanel(false);
  syncNotificationPreference();
  if (notification.updateId) window.openUpdateFromNotification(notification.updateId);
  else if (notification.type === "welcome") window.switchToTab("account");
  else showToast(notification.message || notification.title);
}

function bindTopIcons() {
  const button = document.getElementById("notifications-btn");
  const panel = document.getElementById("notification-panel");
  renderNotificationList();
  syncNotificationPreference();
  button?.addEventListener("click", event => {
    event.stopPropagation();
    if (panel?.hidden) openNotificationPanel();
    else closeNotificationPanel(true);
  });
  document.getElementById("mark-notifications-read")?.addEventListener("click", () => {
    markAllNotificationsRead();
    showToast("Notifications marked as read.");
  });
  document.getElementById("sync-notifications")?.addEventListener("click", event => {
    event.stopPropagation();
    const syncButton = event.currentTarget;
    syncButton.classList.add("syncing");
    synchronizeNotificationFeed({ manual: true });
    setTimeout(() => syncButton.classList.remove("syncing"), 500);
  });
  panel?.addEventListener("click", event => {
    event.stopPropagation();
    const item = event.target.closest("[data-notification-id]");
    if (item) selectNotification(item.dataset.notificationId);
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".notification-wrap")) closeNotificationPanel(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && panel && !panel.hidden) closeNotificationPanel(true);
  });
  document.getElementById("theme-toggle-btn")?.addEventListener("click", window.toggleTopTheme);
  syncTopThemeButton();
}

/* --- Screenshot lightbox --- */
let lightboxScreenshots = [];
let lightboxIndex = 0;
let lightboxReturnFocus = null;
let lightboxPointerStartX = null;

function renderScreenshotLightbox() {
  const screenshot = lightboxScreenshots[lightboxIndex];
  const image = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  const dots = document.getElementById("lightbox-dots");
  if (!screenshot || !image || !dots) return;
  image.src = screenshot.src;
  image.alt = screenshot.label;
  if (caption) caption.textContent = `${screenshot.label} · ${lightboxIndex + 1} of ${lightboxScreenshots.length}`;
  dots.innerHTML = lightboxScreenshots.map((item, index) => `<button type="button" class="lightbox-dot ${index === lightboxIndex ? "active" : ""}" data-lightbox-index="${index}" aria-label="Show ${item.label}" aria-current="${index === lightboxIndex ? "true" : "false"}"></button>`).join("");
}

window.setScreenshotLightboxIndex = function(index) {
  if (!lightboxScreenshots.length) return;
  lightboxIndex = (Number(index) + lightboxScreenshots.length) % lightboxScreenshots.length;
  renderScreenshotLightbox();
};

window.openScreenshotLightbox = function(siteName, index = 0) {
  const site = sites.find(item => item.name === siteName);
  const overlay = document.getElementById("screenshot-lightbox");
  if (!site || !overlay) return;
  lightboxReturnFocus = document.activeElement;
  lightboxScreenshots = getSiteScreenshots(site);
  lightboxIndex = Math.max(0, Math.min(lightboxScreenshots.length - 1, Number(index) || 0));
  renderScreenshotLightbox();
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  requestAnimationFrame(() => document.getElementById("lightbox-close")?.focus({ preventScroll: true }));
};

window.closeScreenshotLightbox = function(restoreFocus = true) {
  const overlay = document.getElementById("screenshot-lightbox");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  document.getElementById("lightbox-image")?.removeAttribute("src");
  if (restoreFocus) lightboxReturnFocus?.focus?.({ preventScroll: true });
};

function bindScreenshotLightbox() {
  const overlay = document.getElementById("screenshot-lightbox");
  const figure = overlay?.querySelector(".lightbox-figure");
  document.getElementById("lightbox-close")?.addEventListener("click", () => closeScreenshotLightbox(true));
  document.getElementById("lightbox-prev")?.addEventListener("click", () => setScreenshotLightboxIndex(lightboxIndex - 1));
  document.getElementById("lightbox-next")?.addEventListener("click", () => setScreenshotLightboxIndex(lightboxIndex + 1));
  document.getElementById("lightbox-dots")?.addEventListener("click", event => {
    const dot = event.target.closest("[data-lightbox-index]");
    if (dot) setScreenshotLightboxIndex(dot.dataset.lightboxIndex);
  });
  overlay?.addEventListener("click", event => { if (event.target === overlay) closeScreenshotLightbox(true); });
  figure?.addEventListener("pointerdown", event => {
    if (event.button !== undefined && event.button !== 0) return;
    lightboxPointerStartX = event.clientX;
    figure.setPointerCapture?.(event.pointerId);
  });
  figure?.addEventListener("pointerup", event => {
    if (lightboxPointerStartX === null) return;
    const distance = event.clientX - lightboxPointerStartX;
    lightboxPointerStartX = null;
    figure.releasePointerCapture?.(event.pointerId);
    if (Math.abs(distance) >= 45) setScreenshotLightboxIndex(lightboxIndex + (distance < 0 ? 1 : -1));
  });
  figure?.addEventListener("pointercancel", () => { lightboxPointerStartX = null; });
  document.addEventListener("keydown", event => {
    if (!overlay?.classList.contains("active")) return;
    if (event.key === "Escape") closeScreenshotLightbox(true);
    else if (event.key === "ArrowLeft") { event.preventDefault(); setScreenshotLightboxIndex(lightboxIndex - 1); }
    else if (event.key === "ArrowRight") { event.preventDefault(); setScreenshotLightboxIndex(lightboxIndex + 1); }
    else if (event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll("button:not([disabled])")].filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}

/* --- Local detail actions --- */
let reviewRating = 0;
let reviewEditingId = "";
let reviewReturnFocus = null;
let reviewSortMode = "recent";
let reviewStarFilter = "all";
let reviewSearchTerm = "";
let reviewPageIndex = 0;
const reviewPageSize = 10;

function syncReviewStars() {
  document.querySelectorAll("#review-stars [data-rating]").forEach(button => {
    const active = Number(button.dataset.rating) <= reviewRating;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(Number(button.dataset.rating) === reviewRating));
  });
}

window.openReviewComposer = function(siteName, reviewId = "") {
  if (!requirePersonalSession("write a review", { type: "review", siteName })) return;
  const site = sites.find(item => item.name === siteName);
  const overlay = document.getElementById("review-overlay");
  if (!site || !overlay) return;
  reviewReturnFocus = document.activeElement;
  const existing = reviewId ? getUserReviews(siteName).find(review => review.id === reviewId) : null;
  reviewEditingId = existing ? existing.id : "";
  reviewRating = Number(existing?.stars || 0);
  document.getElementById("review-site-name").value = siteName;
  document.getElementById("review-text").value = existing?.text || "";
  document.getElementById("review-dialog-title").textContent = existing ? `Edit your review of ${siteName}` : `Review ${siteName}`;
  syncReviewStars();
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("review-open");
  requestAnimationFrame(() => (existing ? document.getElementById("review-text") : document.querySelector('#review-stars [data-rating="5"]'))?.focus());
};

window.closeReviewComposer = function(restoreFocus = true) {
  const overlay = document.getElementById("review-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("review-open");
  if (restoreFocus) reviewReturnFocus?.focus?.({ preventScroll: true });
};

function refreshCurrentDetail() {
  if (!currentDetailName) return;
  const name = currentDetailName;
  const position = window.scrollY;
  isRestoringDetailState = true;
  try { window.openDetail(name); } finally { isRestoringDetailState = false; }
  requestAnimationFrame(() => window.scrollTo({ top: position, behavior: "auto" }));
}

window.deleteLocalReview = function(siteName, reviewId = "") {
  if (!requirePersonalSession("manage reviews")) return;
  const list = getUserReviews(siteName);
  if (!list.length) return;
  const remaining = reviewId ? list.filter(review => review.id !== reviewId) : list.slice(0, -1);
  if (remaining.length) localReviews[siteName] = remaining;
  else delete localReviews[siteName];
  persistPersonalState();
  if (hasPersonalSession()) renderAccount(); else renderAccountReviews();
  refreshCurrentDetail();
  showToast(guestMode ? "Temporary Guest review deleted." : "Your review was deleted and will sync.");
};

window.toggleBookmark = function(siteName) {
  if (!requirePersonalSession("save websites", { type: "bookmark", siteName })) return;
  const saved = bookmarkedSites.has(siteName);
  if (saved) bookmarkedSites.delete(siteName); else bookmarkedSites.add(siteName);
  persistPersonalState();
  if (hasPersonalSession()) renderAccount(); else renderSavedAccount();
  renderUpdates();
  const button = document.getElementById("detail-bookmark");
  button?.classList.toggle("active", !saved);
  button?.setAttribute("aria-label", saved ? "Save bookmark" : "Remove bookmark");
  button?.setAttribute("aria-pressed", String(!saved));
  showToast(saved ? "Bookmark removed." : (guestMode ? "Website bookmarked for this Guest session." : "Website bookmarked and queued for sync."));
};

function recordShareAchievement() {
  if (!hasPersonalSession()) return;
  if (!accountProfile.firstShareAt) accountProfile.firstShareAt = new Date().toISOString();
  accountProfile.shareCount = Number(accountProfile.shareCount || 0) + 1;
  persistPersonalState();
  renderAchievementsAccount();
}

window.shareSite = async function(siteName) {
  const site = sites.find(item => item.name === siteName);
  if (!site) return;
  const shareData = { title: site.name, text: site.desc, url: websiteDetailUrl(site) };
  try {
    if (window.navigator?.share) {
      // Native device share sheet: lists every installed app that accepts links —
      // WhatsApp, Telegram, Messenger, X, Instagram, SMS, email, notes, browsers, and more.
      await window.navigator.share(shareData);
      recordShareAchievement();
      return;
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
    // Fall through to the in-app share sheet if the native sheet failed.
  }
  openShareSheet(site);
};

function shareSheetTargets(site) {
  const url = websiteDetailUrl(site);
  const message = `${site.name} — ${site.desc}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedMessage = encodeURIComponent(message);
  const encodedBoth = encodeURIComponent(`${message}\n${url}`);
  /* P-081 — every target carries an APP deep link (opens the installed app; Android shows
     the system chooser when several apps handle it — e.g. WhatsApp + WhatsApp Business)
     and a WEB fallback that opens IN THIS TAB so the user simply presses Back to return. */
  return [
    { id: "whatsapp", label: "WhatsApp", icon: "🟢", app: `whatsapp://send?text=${encodedBoth}`, web: `https://wa.me/?text=${encodedBoth}` },
    { id: "telegram", label: "Telegram", icon: "✈️", app: `tg://msg_url?url=${encodedUrl}&text=${encodedMessage}`, web: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}` },
    { id: "x", label: "X / Twitter", icon: "𝕏", app: `twitter://post?message=${encodedBoth}`, web: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}` },
    { id: "facebook", label: "Facebook", icon: "📘", web: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { id: "messenger", label: "Messenger", icon: "💬", app: `fb-messenger://share?link=${encodedUrl}`, web: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { id: "instagram", label: "Instagram", icon: "📸", copyFirst: true, app: `instagram://app`, web: `https://www.instagram.com/` },
    { id: "linkedin", label: "LinkedIn", icon: "💼", web: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { id: "reddit", label: "Reddit", icon: "👽", web: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedMessage}` },
    { id: "email", label: "Gmail / Email", icon: "✉️", direct: `mailto:?subject=${encodedMessage}&body=${encodedBoth}` },
    { id: "sms", label: "SMS", icon: "📱", direct: `sms:?body=${encodedBoth}` }
  ];
}

let activeShareTargets = [];
let activeShareText = "";

/* App-first opener: try the installed app; if nothing grabbed the intent quickly,
   fall back to the web version IN THE SAME TAB (Back returns to the Archive). */
window.shareViaTarget = function(targetId) {
  const target = activeShareTargets.find(entry => entry.id === targetId);
  if (!target) return;
  recordShareAchievement();
  if (target.copyFirst) {
    try { window.navigator.clipboard.writeText(activeShareText); showToast("📋 Link copied — paste it into your Story or DM."); } catch (error) { /* clipboard blocked */ }
  }
  if (target.direct) { window.location.href = target.direct; return; }
  if (target.app) {
    const startedAt = Date.now();
    window.location.href = target.app;
    window.setTimeout(() => {
      // If the app opened, the page is hidden; otherwise use the web fallback in this tab.
      if (!document.hidden && Date.now() - startedAt < 1900 && target.web) window.location.href = target.web;
    }, 1300);
    return;
  }
  if (target.web) window.location.href = target.web;
};

window.openShareSheet = function(siteOrName) {
  const site = typeof siteOrName === "string" ? sites.find(item => item.name === siteOrName) : siteOrName;
  if (!site) return;
  let overlay = document.getElementById("share-sheet-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "share-sheet-overlay";
    overlay.className = "share-sheet-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
    overlay.addEventListener("click", event => { if (event.target === overlay) window.closeShareSheet(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && overlay.classList.contains("active")) window.closeShareSheet(); });
  }
  const targets = shareSheetTargets(site);
  activeShareTargets = targets;
  activeShareText = `${site.name} — ${site.desc}\n${websiteDetailUrl(site)}`;
  overlay.innerHTML = `
    <div class="share-sheet" role="dialog" aria-modal="true" aria-label="Share ${escapeHTML(site.name)}">
      <div class="share-sheet-head"><strong>Share ${escapeHTML(site.name)}</strong><button type="button" class="share-sheet-close" onclick="closeShareSheet()" aria-label="Close share sheet">×</button></div>
      <div class="share-sheet-grid">
        ${targets.map(target => `<button type="button" class="share-sheet-app" onclick="shareViaTarget('${target.id}')"><span class="share-sheet-icon" aria-hidden="true">${target.icon}</span><span>${target.label}</span></button>`).join("")}
        <button type="button" class="share-sheet-app" onclick="copyShareLink('${escapeHTML(site.name)}')"><span class="share-sheet-icon" aria-hidden="true">🔗</span><span>Copy link</span></button>
      </div>
      <p class="share-sheet-note">Each button opens the installed app directly (your device shows a chooser if two apps qualify — e.g. WhatsApp + WhatsApp Business). No app? The web version opens right here — press Back to return. Instagram copies the link first.</p>
    </div>`;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("popup-lock");
};

window.closeShareSheet = function() {
  const overlay = document.getElementById("share-sheet-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".utility-overlay.active, #welcome-splash")) document.body.classList.remove("popup-lock");
};

window.recordShareTarget = function() {
  recordShareAchievement();
};

window.copyShareLink = async function(siteName) {
  const site = sites.find(item => item.name === siteName);
  if (!site) return;
  try {
    await window.navigator.clipboard.writeText(`${site.name} — ${site.desc}\n${websiteDetailUrl(site)}`);
    recordShareAchievement();
    showToast("Exact Archive detail link copied to clipboard.");
  } catch (error) {
    showToast("Could not copy in this browser.", "warning");
  }
};

function websiteDetailUrl(site) {
  const url = new URL("paragon-archive.html", window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("site", site.name);
  return url.toString();
}
window.websiteDetailUrl = websiteDetailUrl;

let qrReturnFocus = null;
let qrCurrentSite = null;
window.openWebsiteQR = function(siteName) {
  const site = sites.find(item => item.name === siteName);
  const overlay = document.getElementById("qr-overlay");
  if (!site || !overlay) return;
  qrReturnFocus = document.activeElement;
  qrCurrentSite = site;
  if (hasPersonalSession()) {
    accountProfile.qrCount = Number(accountProfile.qrCount || 0) + 1;
    persistPersonalState();
    renderAchievementsAccount();
  }
  const url = websiteDetailUrl(site);
  document.getElementById("qr-title").textContent = `${site.name} QR Code`;
  document.getElementById("qr-url").textContent = url;
  const image = document.getElementById("qr-image");
  try {
    if (typeof window.qrcode !== "function" && typeof qrcode !== "function") throw new Error("Local QR encoder unavailable");
    const createQr = window.qrcode || qrcode;
    const code = createQr(0, "M");
    code.addData(url, "Byte");
    code.make();
    image.src = code.createDataURL(7, 14);
    image.alt = `Scannable QR code opening the ${site.name} detail in Paragon Archive`;
  } catch (error) {
    image.removeAttribute("src");
    image.alt = "QR generation unavailable";
    showToast("The local QR code could not be generated.", "warning");
  }
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("qr-open");
  requestAnimationFrame(() => document.getElementById("qr-close")?.focus({ preventScroll: true }));
};
window.closeWebsiteQR = function(restoreFocus = true) {
  const overlay = document.getElementById("qr-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("qr-open");
  if (restoreFocus) qrReturnFocus?.focus?.({ preventScroll: true });
};
function bindWebsiteQR() {
  const overlay = document.getElementById("qr-overlay");
  document.getElementById("qr-close")?.addEventListener("click", () => closeWebsiteQR(true));
  overlay?.addEventListener("click", event => { if (event.target === overlay) closeWebsiteQR(true); });
  document.getElementById("qr-copy")?.addEventListener("click", async () => {
    if (!qrCurrentSite) return;
    try { await window.navigator.clipboard.writeText(websiteDetailUrl(qrCurrentSite)); recordShareAchievement(); showToast("Website link copied."); }
    catch (error) { showToast("Clipboard access is unavailable.", "warning"); }
  });
  document.getElementById("qr-share")?.addEventListener("click", () => qrCurrentSite && shareSite(qrCurrentSite.name));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && overlay?.classList.contains("active")) closeWebsiteQR(true); });
}

window.toggleAbout = function(button) {
  const paragraph = button.previousElementSibling;
  const collapsed = paragraph.classList.toggle("collapsed");
  button.textContent = collapsed ? "Read more" : "Show less";
  button.setAttribute("aria-expanded", String(!collapsed));
};

window.toggleDetailList = function(button) {
  const list = button.previousElementSibling;
  if (!list) return;
  const expanded = list.classList.toggle("expanded");
  button.textContent = expanded ? "Show less" : "Read more";
  button.setAttribute("aria-expanded", String(expanded));
};

window.toggleTimelineText = function(button) {
  const text = button.previousElementSibling;
  if (!text) return;
  const expanded = text.classList.toggle("expanded");
  button.textContent = expanded ? "Show less" : "Read more";
  button.setAttribute("aria-expanded", String(expanded));
};

function setupTimelineDisclosures() {
  requestAnimationFrame(() => {
    document.querySelectorAll("#updates-timeline .timeline-card").forEach(card => {
      const text = card.querySelector(".t-sub");
      const button = card.querySelector(".timeline-read-more");
      if (!text || !button) return;
      button.hidden = text.scrollHeight <= text.clientHeight + 2;
    });
  });
}

function setupAboutSection() {
  const paragraph = document.querySelector("#detail-view .detail-about");
  const button = document.querySelector("#detail-view .about-read-more");
  if (!paragraph || !button) return;
  requestAnimationFrame(() => {
    const needsExpansion = paragraph.scrollHeight > paragraph.clientHeight + 3;
    button.hidden = !needsExpansion;
    if (!needsExpansion) paragraph.classList.remove("collapsed");
  });
}

function starRatingMarkup(rating) {
  const numeric = Number.isFinite(Number(rating)) ? Math.max(0, Math.min(5, Number(rating))) : 0;
  return `<span class="decimal-stars" aria-label="${numeric.toFixed(1)} out of 5 stars">${[0,1,2,3,4].map(index => {
    const fill = Math.max(0, Math.min(100, (numeric - index) * 100));
    return `<span class="decimal-star" aria-hidden="true"><span class="star-empty">★</span><span class="star-fill" style="width:${fill}%">★</span></span>`;
  }).join("")}</span>`;
}

function animateDetailStats() {
  document.querySelectorAll("#detail-view [data-counter-target]").forEach(element => {
    const target = Number(element.dataset.counterTarget || 0);
    const decimals = Number(element.dataset.counterDecimals || 0);
    const format = element.dataset.counterFormat || "number";
    let step = 0;
    const totalSteps = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 1 : 34;
    element.textContent = decimals ? Number(0).toFixed(decimals) : "0";
    const timer = setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / totalSteps);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      element.textContent = format === "integer" ? Math.round(value).toLocaleString() : value.toFixed(decimals);
      if (progress >= 1) clearInterval(timer);
    }, totalSteps === 1 ? 0 : 30);
  });
}

window.scrollToReviews = function() {
  const section = document.getElementById("reviews-section");
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => section.focus({ preventScroll: true }), 450);
};


/* =====================================================================
   P-097 — PREVIEW WINDOW MANAGER (MS-Word-style):
   • every OPEN creates its own window with a titlebar: minimize –, maximize ⛶,
     open-in-new-tab (new-window glyph), close ×
   • a NEW window opens maximized; the PREVIOUS window shrinks to a small fitted
     card (picture-in-picture) instead of being buried — closing the new one
     restores the previous EXACTLY as it was (its maximize choice is remembered)
   • minimized windows live on a taskbar strip at the bottom; one click restores
   ===================================================================== */
const previewWindows = [];
let previewWindowSequence = 0;

function previewWindowHost() {
  let host = document.getElementById("preview-wm-layer");
  if (!host) {
    const overlay = document.getElementById("site-preview-overlay");
    if (!overlay) return null;
    host = document.createElement("div");
    host.id = "preview-wm-layer";
    host.innerHTML = '<div id="preview-wm-stage"></div><div id="preview-wm-taskbar" hidden></div>';
    overlay.appendChild(host);
    overlay.querySelector(".site-preview-shell")?.setAttribute("hidden", "");
  }
  return host;
}

function syncPreviewWindowsUi() {
  const host = previewWindowHost();
  if (!host) return;
  const taskbar = document.getElementById("preview-wm-taskbar");
  const top = previewWindows[previewWindows.length - 1];
  previewWindows.forEach(win => {
    const element = document.getElementById(win.elementId);
    if (!element) return;
    const isTop = win === top;
    element.classList.toggle("is-top", isTop);
    element.classList.toggle("is-pip", !isTop && !win.minimized);
    element.classList.toggle("is-max", isTop && win.maximized);
    element.classList.toggle("is-min", Boolean(win.minimized));
    element.setAttribute("aria-hidden", String(win.minimized));
  });
  const minimized = previewWindows.filter(win => win.minimized);
  if (taskbar) {
    taskbar.hidden = minimized.length === 0;
    taskbar.innerHTML = minimized.map(win => `<button type="button" class="preview-wm-taskchip" data-wmrestore="${win.id}">${win.site.icon} ${escapeHTML(win.site.name)}</button>`).join("");
  }
  const overlay = document.getElementById("site-preview-overlay");
  if (overlay) {
    if (previewWindows.length === 0) {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("preview-open");
    } else {
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("preview-open");
    }
  }
  const legacyTitle = document.getElementById("site-preview-title");
  if (legacyTitle && top) legacyTitle.textContent = top.site.name + (top.site.previewOnly ? " · Concept Preview" : "");
}

function renderPreviewWindow(win) {
  const host = previewWindowHost();
  if (!host) return;
  const stage = document.getElementById("preview-wm-stage");
  if (!stage || document.getElementById(win.elementId)) return;
  const element = document.createElement("article");
  element.id = win.elementId;
  element.className = "preview-wm-window";
  element.innerHTML = `
    <header class="preview-wm-titlebar">
      <span class="preview-wm-name"><b>${escapeHTML(win.site.name)}</b><small>${win.site.previewOnly ? "Concept preview" : "Website preview"}</small></span>
      <span class="preview-wm-controls">
        <button type="button" data-wmact="min" data-wm="${win.id}" title="Minimize" aria-label="Minimize preview">–</button>
        <button type="button" data-wmact="max" data-wm="${win.id}" title="Maximize / restore" aria-label="Maximize or restore preview">⛶</button>
        <button type="button" data-wmact="tab" data-wm="${win.id}" title="Open in new tab" aria-label="Open website in a new tab">⌘</button>
        <button type="button" data-wmact="close" data-wm="${win.id}" class="wm-close" title="Close" aria-label="Close preview">×</button>
      </span>
    </header>
    <div class="preview-wm-body">
      ${win.hasUrl ? `<iframe title="${escapeHTML(win.site.name)} preview" loading="eager" sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin" src="${escapeHTML(win.url)}"></iframe>`
        : `<div class="site-preview-message"><div class="preview-maintenance-card">${win.maintenance ? `<img src="assets/illustrations/maintenance.png" alt="">` : `<img src="assets/illustrations/welcome-hero.jpg" alt="" style="border-radius:12px;">`}<strong>${win.maintenance ? "🔧 Under maintenance" : "Preview"}</strong><span>${escapeHTML(win.message || "This website does not have a production URL yet — its real URL arrives at launch.")}</span></div></div>`}
    </div>`;
  stage.appendChild(element);
}

function openPreviewWindow(site, { hasUrl = true, url = "", maintenance = false, message = "" } = {}) {
  if (typeof document.createElement !== "function") return null;
  previewWindowSequence += 1;
  const win = {
    id: "pw" + previewWindowSequence,
    elementId: "preview-wm-" + previewWindowSequence,
    site,
    url: url || (site.siteUrl && site.siteUrl !== "#" ? site.siteUrl : ""),
    hasUrl: Boolean(hasUrl),
    maintenance,
    message,
    minimized: false,
    maximized: true /* P-097 — NEW windows always open maximized; previous ones keep their own state */
  };
  previewWindows.push(win);
  renderPreviewWindow(win);
  syncPreviewWindowsUi();
  return win;
}

function activatePreviewWindow(id) {
  const index = previewWindows.findIndex(win => win.id === id);
  if (index === -1) return;
  const [win] = previewWindows.splice(index, 1);
  win.minimized = false;
  previewWindows.push(win);
  syncPreviewWindowsUi();
}

function closePreviewWindow(id) {
  const index = previewWindows.findIndex(win => win.id === id);
  if (index === -1) return;
  const win = previewWindows[index];
  document.getElementById(win.elementId)?.remove();
  previewWindows.splice(index, 1);
  syncPreviewWindowsUi();
}

let previewWmBound = false;
function bindPreviewWindowManager() {
  const overlay = document.getElementById("site-preview-overlay");
  if (!overlay || previewWmBound || typeof overlay.addEventListener !== "function") return;
  previewWmBound = true;
  overlay.addEventListener("click", event => {
    const control = event.target.closest?.("[data-wmact]");
    if (control) {
      const win = previewWindows.find(entry => entry.id === control.dataset.wm);
      if (!win) return;
      if (control.dataset.wmact === "min") win.minimized = true;
      if (control.dataset.wmact === "max") {
        win.maximized = !win.maximized;
        /* P-098 — maximize now means TRUE fullscreen: the window claims the whole screen
           (all four sides) via the Fullscreen API when the browser allows it. */
        try {
          if (win.maximized && document.fullscreenEnabled && typeof element === "undefined") { /* noop in VM */ }
          if (win.maximized && document.fullscreenEnabled) {
            const target = document.getElementById("site-preview-overlay");
            if (target?.requestFullscreen) target.requestFullscreen().catch(() => {});
          } else if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
        } catch (error) { /* fullscreen unsupported — CSS still fills the screen */ }
      }
      if (control.dataset.wmact === "tab") {
        if (win.url) window.open(win.url, "_blank", "noopener,noreferrer");
        else showToast("A production URL is still required.", "warning");
      }
      if (control.dataset.wmact === "close") { closePreviewWindow(win.id); return; }
      syncPreviewWindowsUi();
      return;
    }
    const restore = event.target.closest?.("[data-wmrestore]");
    if (restore) { activatePreviewWindow(restore.dataset.wmrestore); return; }
    const pip = event.target.closest?.(".preview-wm-window.is-pip");
    if (pip) { const win = previewWindows.find(entry => entry.elementId === pip.id); if (win) activatePreviewWindow(win.id); }
  });
}

let currentPreviewSite = null;
let previewReturnFocus = null;

function showSitePreview(site, hasUrl) {
  /* P-097 — every preview opens as a managed window: new windows maximize, previous ones
     shrink to fitted cards, minimize/maximize/close live in the window titlebar. */
  currentPreviewSite = site;
  if (typeof document.createElement === "function" && document.getElementById) {
    bindPreviewWindowManager();
    openPreviewWindow(site, { hasUrl });
    requestAnimationFrame(() => document.querySelector(".preview-wm-window.is-top .wm-close")?.focus?.({ preventScroll: true }));
    return;
  }
  const overlay = document.getElementById("site-preview-overlay");
  if (!overlay) return;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("preview-open");
}

window.closeSitePreview = function(restoreFocus = true) {
  /* P-097 — closing the top window restores the previous one exactly as the user left it;
     the overlay only truly closes when the whole stack is gone. */
  if (previewWindows.length) {
    closePreviewWindow(previewWindows[previewWindows.length - 1].id);
    if (previewWindows.length && restoreFocus) previewReturnFocus?.focus?.({ preventScroll: true });
    return;
  }
  const overlay = document.getElementById("site-preview-overlay");
  const frame = document.getElementById("site-preview-frame");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("preview-open");
  if (frame) { frame.onload = null; frame.removeAttribute("src"); }
  if (restoreFocus) previewReturnFocus?.focus?.({ preventScroll: true });
};

function bindSitePreview() {
  const overlay = document.getElementById("site-preview-overlay");
  document.getElementById("site-preview-close")?.addEventListener("click", () => closeSitePreview(true));
  overlay?.addEventListener("click", event => { if (event.target === overlay) closeSitePreview(true); });
  document.getElementById("site-preview-new-tab")?.addEventListener("click", () => {
    const top = previewWindows[previewWindows.length - 1];
    const url = top?.url || (currentPreviewSite?.siteUrl && currentPreviewSite.siteUrl !== "#" ? currentPreviewSite.siteUrl : "");
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else showToast("A production URL is still required.", "warning");
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && overlay?.classList.contains("active")) closeSitePreview(true); });
  bindPreviewWindowManager(); /* P-097 — titlebar/taskbar/PIP controls */
}

window.launchSite = function(siteName, button) {
  const site = sites.find(item => item.name === siteName);
  const progress = document.getElementById("site-launch-progress");
  const ring = document.getElementById("site-launch-ring");
  const percentage = document.getElementById("site-launch-percent");
  const detailView = document.getElementById("detail-view");
  const frame = document.getElementById("site-preview-frame");
  if (!site || !progress || progress.classList.contains("launching")) return;
  /* P-094 — OPEN requires at least a Guest session or a real login (owner rule).
     A first-time visitor without any session is guided to the Account tab first. */
  if (!hasPersonalSession()) {
    requirePersonalSession("open websites");
    return;
  }
  /* P-097 — a website the Team marked "Under Review" is in MAINTENANCE: it cannot be used. */
  if (teamSiteOverrideStatus(site.name) === "review") {
    previewReturnFocus = button;
    showSitePreview({ ...site, siteUrl: "" }, false);
    const message = document.getElementById("site-preview-message");
    if (message) {
      message.hidden = false;
      message.innerHTML = `<div class="preview-maintenance-card"><img src="assets/illustrations/maintenance.png" alt=""><strong>🔧 ${escapeHTML(site.name)} is under maintenance</strong><span>The Paragon Team marked this website "Under Review" — it is temporarily closed for checks. It returns right after the review. <a href="#" onclick="switchToTab('updates'); return false;">See Updates</a></span></div>`;
    }
    return;
  }
  previewReturnFocus = button;
  /* P-094 — the launch URL resolves through the pending footer destination for the Hub. */
  const launchUrl = resolveLaunchUrl(site) || "";
  const launchSite = launchUrl ? { ...site, siteUrl: launchUrl } : site;
  try {
    if (hasPersonalSession() && String(launchUrl || site.siteUrl || "").includes("/sites/")) {
      accountProfile.productOpenCount = Number(accountProfile.productOpenCount || 0) + 1;
      persistPersonalState();
      renderAchievementsAccount();
    }
  } catch (_) {}
  const hasUrl = Boolean(launchUrl);
  let frameLoaded = !hasUrl;
  let visualReady = false;
  let completed = false;
  progress.classList.add("launching");
  progress.setAttribute("aria-valuenow", "0");
  button.disabled = true;
  let value = 0;

  const complete = () => {
    if (completed || !visualReady || !frameLoaded) return;
    completed = true;
    value = 100;
    ring.style.strokeDashoffset = "0";
    percentage.textContent = "100%";
    progress.setAttribute("aria-valuenow", "100");
    progress.classList.add("complete");
    detailView.classList.add("launch-complete");
    button.textContent = "READY ✓";
    /* P-094 — the ONLY place a view is recorded: a successfully completed OPEN.
       Detail views no longer count (owner rule). */
    siteMetrics?.recordView(site.name);
    recordLocalVisit(site.name);
    refreshHeroViews?.();
    showSitePreview(launchSite, hasUrl);
    setTimeout(() => {
      progress.classList.remove("launching", "complete");
      detailView.classList.remove("launch-complete");
      ring.style.strokeDashoffset = "100";
      percentage.textContent = "0%";
      progress.setAttribute("aria-valuenow", "0");
      button.disabled = false;
      button.textContent = "OPEN";
    }, 900);
  };

  if (hasUrl && frame) {
    frame.hidden = false;
    frame.onload = () => { frameLoaded = true; complete(); };
    frame.src = launchUrl;
    setTimeout(() => { frameLoaded = true; complete(); }, 6500);
  }

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const timer = setInterval(() => {
    value = Math.min(hasUrl ? 94 : 100, value + (reduced ? 25 : 4)); // P-074 — livelier loading fill
    ring.style.strokeDashoffset = String(100 - value);
    percentage.textContent = `${value}%`;
    progress.setAttribute("aria-valuenow", String(value));
    button.textContent = `OPENING ${value}%`;
    if (value >= (hasUrl ? 94 : 100)) {
      clearInterval(timer);
      visualReady = true;
      complete();
    }
  }, reduced ? 30 : 32);
};

function bindReviewComposer() {
  const overlay = document.getElementById("review-overlay");
  document.getElementById("review-stars")?.addEventListener("click", event => {
    const button = event.target.closest("[data-rating]");
    if (!button) return;
    reviewRating = Number(button.dataset.rating);
    syncReviewStars();
  });
  document.getElementById("review-close")?.addEventListener("click", () => closeReviewComposer(true));
  document.getElementById("review-cancel")?.addEventListener("click", () => closeReviewComposer(true));
  overlay?.addEventListener("click", event => { if (event.target === overlay) closeReviewComposer(true); });
  document.getElementById("review-form")?.addEventListener("submit", event => {
    event.preventDefault();
    const siteName = document.getElementById("review-site-name").value;
    const text = document.getElementById("review-text").value.trim();
    if (!reviewRating) { showToast("Choose a star rating first.", "warning"); return; }
    if (!text) { showToast("Write a short review first.", "warning"); return; }
    const list = getUserReviews(siteName);
    const existing = reviewEditingId ? list.find(review => review.id === reviewEditingId) : null;
    if (existing) {
      existing.stars = reviewRating;
      existing.text = text;
      existing.editedAt = new Date().toISOString();
      localReviews[siteName] = list;
    } else {
      localReviews[siteName] = [...list, { id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: "You", date: new Date().toISOString(), stars: reviewRating, text }];
    }
    reviewEditingId = "";
    persistPersonalState();
    closeReviewComposer(false);
    if (hasPersonalSession()) renderAccount(); else renderAccountReviews();
    refreshCurrentDetail();
    showToast(existing
      ? (guestMode ? "Review updated for this Guest session." : "Review updated and queued for account sync.")
      : (guestMode ? "Review saved temporarily for this Guest session." : "Review saved and queued for account sync."));
  });
  document.addEventListener("keydown", event => {
    if (!overlay?.classList.contains("active")) return;
    if (event.key === "Escape") { closeReviewComposer(true); return; }
    if (event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll('button:not([disabled]), textarea:not([disabled])')].filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}

/* --- Detail Routing --- */
const detailNavigationHistory = [];
let currentDetailName = null;
let isRestoringDetailState = false;

function captureSearchState() {
  const overlay = document.getElementById("search-overlay");
  return {
    open: Boolean(overlay?.classList.contains("active")),
    query: document.getElementById("search-input")?.value || "",
    category: activeSearchCategory,
    resultsMode: searchResultsMode,
    overlayScrollTop: overlay?.scrollTop || 0
  };
}

function captureTrendingState() {
  const overlay = document.getElementById("trending-overlay");
  return {
    open: Boolean(overlay?.classList.contains("active")),
    overlayScrollTop: overlay?.scrollTop || 0
  };
}

function captureStaffState() {
  const overlay = document.getElementById("staff-overlay");
  return {
    open: Boolean(overlay?.classList.contains("active")),
    overlayScrollTop: overlay?.scrollTop || 0
  };
}

function captureRecentState() {
  const overlay = document.getElementById("recent-overlay");
  const rail = document.getElementById("recent-full-list");
  return {
    open: Boolean(overlay?.classList.contains("active")),
    overlayScrollTop: overlay?.scrollTop || 0,
    railScrollLeft: rail?.scrollLeft || 0
  };
}

function captureCategoryState() {
  const overlay = document.getElementById("category-overlay");
  return {
    open: Boolean(overlay?.classList.contains("active")),
    categoryName: activeCategoryView,
    overlayScrollTop: overlay?.scrollTop || 0
  };
}

function getCurrentTabName() {
  const activeTab = document.querySelector(".nav-tab.active")?.dataset.tab;
  if (activeTab) return activeTab;
  return ["websites", "updates", "account"].find(name => {
    const section = document.getElementById(`tab-${name}`);
    return section && section.style.display !== "none";
  }) || "websites";
}

function captureCurrentViewState() {
  const sharedState = {
    scrollY: window.scrollY || 0,
    search: captureSearchState(),
    trending: captureTrendingState(),
    staff: captureStaffState(),
    recent: captureRecentState(),
    category: captureCategoryState()
  };
  const detailView = document.getElementById("detail-view");
  if (detailView?.classList.contains("active") && currentDetailName) {
    return { ...sharedState, type: "detail", detailName: currentDetailName };
  }
  return { ...sharedState, type: "tab", tabName: getCurrentTabName() };
}

function restoreSearchState(searchState) {
  if (!searchState?.open) return;
  const input = document.getElementById("search-input");
  if (input) input.value = searchState.query || "";
  searchResultsMode = Boolean(searchState.resultsMode);
  setSearchCategory("All", false);
  window.openSearchOverlay(false, true);
  searchReturnFocus = document.getElementById("search-btn");
  requestAnimationFrame(() => {
    const overlay = document.getElementById("search-overlay");
    if (overlay) overlay.scrollTop = searchState.overlayScrollTop || 0;
  });
}

function restoreTrendingState(trendingState) {
  if (!trendingState?.open) return;
  window.openTrendingOverlay(false);
  trendingReturnFocus = document.getElementById("trending-see-all");
  requestAnimationFrame(() => {
    const overlay = document.getElementById("trending-overlay");
    if (overlay) overlay.scrollTop = trendingState.overlayScrollTop || 0;
  });
}

function restoreStaffState(staffState) {
  if (!staffState?.open) return;
  window.openStaffOverlay(false);
  staffReturnFocus = document.getElementById("staff-see-all");
  requestAnimationFrame(() => {
    const overlay = document.getElementById("staff-overlay");
    if (overlay) overlay.scrollTop = staffState.overlayScrollTop || 0;
  });
}

function restoreRecentState(recentState) {
  if (!recentState?.open) return;
  window.openRecentOverlay(false);
  recentReturnFocus = document.getElementById("recent-see-all");
  requestAnimationFrame(() => {
    const overlay = document.getElementById("recent-overlay");
    const rail = document.getElementById("recent-full-list");
    if (overlay) overlay.scrollTop = recentState.overlayScrollTop || 0;
    if (rail) rail.scrollLeft = recentState.railScrollLeft || 0;
  });
}

function restoreCategoryState(categoryState) {
  if (!categoryState?.open) return;
  window.openCategoryOverlay(categoryState.categoryName || null, false);
  categoryReturnFocus = document.getElementById("category-see-all");
  requestAnimationFrame(() => {
    const overlay = document.getElementById("category-overlay");
    if (overlay) overlay.scrollTop = categoryState.overlayScrollTop || 0;
  });
}

function restoreScrollAndSearch(state) {
  requestAnimationFrame(() => {
    window.scrollTo({ top: state.scrollY || 0, left: 0, behavior: "auto" });
    restoreSearchState(state.search);
    restoreTrendingState(state.trending);
    restoreStaffState(state.staff);
    restoreRecentState(state.recent);
    restoreCategoryState(state.category);
  });
}

function setActiveTabState(tabName) {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    if (isActive) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
}

window.openDetail = function(name) {
  try {
    if (hasPersonalSession()) {
      accountProfile.detailOpenCount = Number(accountProfile.detailOpenCount || 0) + 1;
      persistPersonalState();
    }
  } catch (_) {}
  const site = sites.find(s => s.name === name) || (name === deployedTemplateExample.name ? deployedTemplateExample : null);
  if (!site) return;
  if (!isRestoringDetailState && !site.illustrative) {
    detailNavigationHistory.push(captureCurrentViewState());
    /* P-094 — views count ONLY when a website is actually OPENED (launchSite completion),
       never for merely viewing its detail page. Owner rule: "views = successful opens". */
  } else if (!isRestoringDetailState && site.illustrative) {
    detailNavigationHistory.push(captureCurrentViewState());
  }
  currentDetailName = name;
  reviewSortMode = "recent";
  reviewStarFilter = "all";
  reviewSearchTerm = "";
  reviewPageIndex = 0;
  const relatedSites = getRelatedSites(site);
  const combinedReviews = getCombinedReviews(site);
  const isBookmarked = bookmarkedSites.has(site.name);
  const numericRating = realSiteRating(site) || 0; // P-076 — real user rating or honest 0 ("New")
  const numericViews = getSiteViewCount(site);
  const screenshots = getSiteScreenshots(site);
  const detailTags = getSiteTags(site);
  const detailFeatures = site.features || site.updates || [];
  const versionHistory = getVersionHistory(site);
  const developer = site.developer || null;
  const isDeployed = site.category === "Deployed";
  const bylineLabel = developer ? `by ${developer.handle}` : "by Paragon";
  const deployedRelated = isDeployed ? sites.filter(other => other.name !== site.name && other.category === "Deployed").slice(0, 4) : [];
  document.getElementById("tab-websites").style.display = "none";
  document.getElementById("tab-updates").style.display = "none";
  document.getElementById("tab-account").style.display = "none";
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.classList.remove("active");
    tab.setAttribute("aria-selected", "false");
    tab.tabIndex = 0;
    tab.removeAttribute("aria-current");
  });
  const dv = document.getElementById("detail-view");
  dv.classList.add("active");
  /* P-097 — honest maintenance banner when the Team has this website under review. */
  if (teamSiteOverrideStatus(site.name) === "review") {
    const banner = document.createElement("div");
    banner.className = "site-maintenance-banner";
    banner.innerHTML = `🔧 <strong>${escapeHTML(site.name)} is under maintenance (Team review)</strong> — OPEN is disabled until the review completes.`;
    dv.prepend(banner);
  }
  const detailAdSlot = document.getElementById("detail-ad-slot");
  if (detailAdSlot) { detailAdSlot.hidden = false; try { window.ParagonAds?.renderAdSlots?.(); } catch (error) { /* dormant */ } }
  dv.innerHTML = `
    ${site.illustrative ? `<div class="illustrative-banner" role="note"><strong>🧪 Illustrative template preview</strong><span>“${site.name}” is not a real website. This page demonstrates how a future approved Deployed website will look — developer, ratings, premium pricing, and stats shown here are example values only. No purchase, download, or developer contact is possible.</span></div>` : ""}
    <div class="detail-header">
      <img class="detail-hero-banner" src="${heroBannerFor(site)}" alt="">
      <div class="hero-copy-veil"></div>
      <div class="detail-grad"></div>
      <div class="detail-top">
        <a id="detail-back" href="#" onclick="closeDetail(); return false;" aria-label="Return to the previous location">Back</a>
        <div style="display:flex;gap:8px;">
          <button id="detail-bookmark" type="button" class="icon-btn-small ${isBookmarked ? "active" : ""}" onclick="toggleBookmark('${site.name}')" aria-label="${isBookmarked ? "Remove bookmark" : "Save bookmark"}" aria-pressed="${isBookmarked}">🔖</button>
          <button type="button" class="icon-btn-small" onclick="openCollectionPicker('${site.name}')" aria-label="Add ${site.name} to a collection">📂</button>
          <button type="button" class="icon-btn-small" onclick="openWebsiteQR('${site.name}')" aria-label="Open link and QR options for ${site.name}">🔗</button>
          <button type="button" class="icon-btn-small" onclick="openReviewComposer('${site.name}')" aria-label="Rate and review ${site.name}">⭐</button>
        </div>
      </div>
      <div class="detail-hero-info">
        <h1>${site.name}</h1>
        <div class="line"><span style="color:${site.color}">${site.icon}</span> ${site.category} • ${bylineLabel} • ${site.tag}</div>
      </div>
    </div>
    <div class="info-bar">
      <div class="left">
        <div id="site-launch-progress" class="site-launch-progress" role="progressbar" aria-label="Website launch progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <svg viewBox="0 0 72 72" aria-hidden="true"><circle class="launch-ring-track" cx="36" cy="36" r="32" pathLength="100"></circle><circle id="site-launch-ring" class="launch-ring-value" cx="36" cy="36" r="32" pathLength="100"></circle></svg>
          <div class="icon-large" style="background:linear-gradient(135deg,${site.color},#8b5cf6);"><span class="site-icon-glyph">${siteIconMarkup(site, "site-icon-art-large")}</span><span id="site-launch-percent" class="site-launch-percent">0%</span></div>
        </div>
        <div>
          <h2>${site.name}</h2>
          <div class="sub">${bylineLabel} • ${site.category}</div>
        </div>
      </div>
      <div class="stats" role="group" aria-label="Website statistics">
        <div class="stat-item rating-stat"><div class="num">${numericRating ? `<span data-counter-target="${numericRating}" data-counter-decimals="1">0.0</span>` : `<span class="rating-new">New</span>`}</div>${numericRating ? starRatingMarkup(numericRating) : ""}<div class="lab">Rating</div></div>
        <div class="stat-item"><div class="num"><span data-counter-target="${numericViews}" data-counter-format="integer">0</span></div><div class="lab">Views</div></div>
        <button type="button" class="stat-item reviews-stat" onclick="scrollToReviews()" aria-label="Jump to ${combinedReviews.length} reviews"><div class="num"><span data-counter-target="${combinedReviews.length}" data-counter-format="integer">0</span></div><div class="lab">Reviews ↓</div></button>
      </div>
      <button type="button" class="open-btn" onclick="launchSite('${site.name}', this)">OPEN</button>
    </div>
    ${site.premium ? `
    <div class="detail-section premium-disclosure">
      <h3>💎 This website has premium features</h3>
      <div class="premium-columns">
        <div class="premium-col">
          <h4>FREE</h4>
          <ul>${site.premium.free.map(item => `<li><span aria-hidden="true">✅</span> ${escapeHTML(item)}</li>`).join("")}</ul>
        </div>
        <div class="premium-col paid">
          <h4>PREMIUM <small>(${escapeHTML(site.premium.price)})</small></h4>
          <ul>${site.premium.premium.map(item => `<li><span aria-hidden="true">💎</span> ${escapeHTML(item)}</li>`).join("")}</ul>
        </div>
      </div>
      <p class="premium-note">Purchases are handled by the developer ${developer ? escapeHTML(developer.handle) : "of this website"}, not by Paragon Archive.</p>
    </div>` : ""}
    <div class="screenshot-section-head"><h3>📱 Website Screenshots</h3><span>Tap to view fullscreen · swipe to explore</span></div>
    <div class="screens-row" role="list" aria-label="${site.name} screenshots">
      ${screenshots.map((screenshot, index) => `<button type="button" class="shot" role="listitem" onclick="openScreenshotLightbox('${site.name}', ${index})" aria-label="Open ${screenshot.label} fullscreen"><img src="${screenshot.thumb}" alt="${screenshot.label}" loading="lazy"><span class="shot-state-label">${screenshot.label.replace(`${site.name} — `, "")}</span></button>`).join("")}
    </div>
    <div class="detail-section about-section">
      <h3>📄 About this Website <button type="button" class="ask-paragon-ai-btn" onclick="window.ParagonAI?.openDetailAssistant('${site.name}')">🧠 Ask Paragon AI</button></h3>
      <p class="detail-about collapsed">${site.about}</p>
      <button type="button" class="read-more about-read-more" onclick="toggleAbout(this)" aria-expanded="false">Read more</button>
      <div class="detail-about-tags"><div class="detail-tags-label">🏷️ Tags:</div><div class="detail-tag-chips">${detailTags.map(tag => `<span class="detail-tag">${escapeHTML(tag)}</span>`).join("")}</div></div>
    </div>
    ${developer ? `
    <div class="detail-section developer-section">
      <h3>👤 About the Developer</h3>
      <div class="developer-card">
        <span class="developer-avatar" aria-hidden="true">${escapeHTML(developer.handle.replace(/^@/, "").slice(0, 2).toUpperCase())}</span>
        <div class="developer-copy">
          <strong>${escapeHTML(developer.handle)}</strong>
          <p>“${escapeHTML(developer.bio)}”</p>
          <div class="developer-meta">
            <span>📅 Joined Paragon: ${escapeHTML(String(developer.joined))}</span>
            <span>🚀 Websites deployed: ${Number(developer.deployedCount) || 0}</span>
          </div>
        </div>
      </div>
    </div>` : ""}
    <div class="detail-section features-section">
      <h3>✨ Key Features</h3>
      <div class="feature-grid detail-collapsible-list">${detailFeatures.map((feature, index) => `<div class="feature-item ${index >= 3 ? "detail-list-extra" : ""}"><span>${index + 1}</span><strong>${escapeHTML(feature)}</strong></div>`).join("")}</div>
      ${detailFeatures.length > 3 ? `<button type="button" class="read-more detail-list-toggle" onclick="toggleDetailList(this)" aria-expanded="false">Read more</button>` : ""}
    </div>
    <div class="detail-section version-history-section">
      <h3>🆕 Version History</h3>
      <div class="version-history-list detail-collapsible-list">
        ${versionHistory.map((entry, index) => `<article class="version-history-item ${index === 0 ? "current" : ""} ${index >= 1 ? "detail-list-extra" : ""}"><div class="version-marker"></div><div><div class="ver"><strong>${entry.version}</strong><time>${entry.date}</time></div><ul>${entry.changes.map(change => `<li>${change}</li>`).join("")}</ul></div></article>`).join("")}
      </div>
      ${versionHistory.length > 1 ? `<button type="button" class="read-more detail-list-toggle" onclick="toggleDetailList(this)" aria-expanded="false">Read more</button>` : ""}
    </div>
    <div id="reviews-section" class="detail-section reviews-section" tabindex="-1">
      <h3>⭐ Ratings & Reviews <button type="button" class="write-review-btn" onclick="openReviewComposer('${site.name}')">Add a review</button></h3>
      ${ratingBreakdownMarkup(site, combinedReviews)}
      <div class="review-filter-row">
        <label class="review-search-label">Search reviews<input id="review-search" type="search" placeholder="Find words, reviewer, or stars" oninput="applyReviewFilters()" aria-label="Search ratings and reviews"></label>
        <label>Sort reviews<select id="review-sort" onchange="applyReviewFilters()"><option value="recent">Most Recent</option><option value="helpful">Most Helpful</option><option value="highest">Highest Rated</option><option value="lowest">Lowest Rated</option></select></label>
        <label>Star rating<select id="review-star-filter" onchange="applyReviewFilters()"><option value="all">All stars</option><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label>
      </div>
      <div id="reviews-list">${reviewCardsMarkup(site)}</div>
      <div id="review-pagination" class="review-pagination" hidden>
        <button id="review-previous" type="button" class="secondary-action" onclick="showPreviousReviews()" hidden>Previous</button>
        <span id="review-pagination-status" aria-live="polite"></span>
        <button id="review-view-more" type="button" class="secondary-action" onclick="showMoreReviews()" hidden>View more</button>
      </div>
    </div>
    ${isDeployed ? `
    <div class="detail-section">
      <h3>🚀 Similar Deployed Websites</h3>
      ${deployedRelated.length ? `
      <div class="related-sites" role="list" aria-label="Similar deployed websites">
        ${deployedRelated.map(related => `
          <a href="#" class="related-site-card" role="listitem" onclick="openDetail('${related.name}'); return false;">
            <span class="related-site-icon" style="background:${related.color}22;color:${related.color};">${SITE_ICON_ART[related.name] ? `<img class="site-icon-art-list" src="${SITE_ICON_ART[related.name]}" alt="">` : related.icon}</span>
            <span class="related-site-copy"><strong>${related.name}</strong><small>${related.category}</small></span>
          </a>`).join("")}
      </div>` : `<div class="detail-empty-state"><strong>No other Deployed websites yet</strong><span>The Deployed category opens with the future developer programme — approved websites will appear here.</span></div>`}
    </div>` : relatedSites.length ? `
    <div class="detail-section">
      <h3>🔗 Related Websites</h3>
      <div class="related-sites" role="list" aria-label="Related websites">
        ${relatedSites.map(related => `
          <a href="#" class="related-site-card" role="listitem" onclick="openDetail('${related.name}'); return false;">
            <span class="related-site-icon" style="background:${related.color}22;color:${related.color};">${SITE_ICON_ART[related.name] ? `<img class="site-icon-art-list" src="${SITE_ICON_ART[related.name]}" alt="">` : related.icon}</span>
            <span class="related-site-copy">
              <strong>${related.name}</strong>
              <small>${related.category}</small>
            </span>
            
          </a>`).join('')}
      </div>
    </div>` : ''}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderReviewCards();
  setupAboutSection();
  setupRatingBreakdownAnimation();
  animateDetailStats();
  requestAnimationFrame(() => document.getElementById("detail-back")?.focus({ preventScroll: true }));
};
/* P-093 — WotD views stay in sync with the real recorded views */
function refreshHeroViews() {
  document.querySelectorAll("[data-wotd-views]").forEach(node => {
    node.textContent = `👁 ${formatSiteViews(node.getAttribute("data-wotd-views"))} views`;
  });
}
window.closeDetail = function() {
  refreshHeroViews();
  const previousState = detailNavigationHistory.pop();

  if (previousState?.type === "detail" && previousState.detailName) {
    isRestoringDetailState = true;
    try {
      window.openDetail(previousState.detailName);
    } finally {
      isRestoringDetailState = false;
    }
    restoreScrollAndSearch(previousState);
    return;
  }

  const tabName = previousState?.tabName || "websites";
  document.getElementById("detail-view").classList.remove("active");
  document.getElementById("detail-ad-slot")?.setAttribute("hidden", "");
  ["websites", "updates", "account"].forEach(name => {
    document.getElementById(`tab-${name}`).style.display = name === tabName ? "block" : "none";
  });
  setActiveTabState(tabName);
  currentDetailName = null;
  if (tabName === "account") renderAccount();

  if (previousState) restoreScrollAndSearch(previousState);
  else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};
window.installParagonApp = async function() {
  if (!window.ParagonPWA) { showToast("PWA installation is unavailable in this browser.", "warning"); return; }
  const result = await window.ParagonPWA.install();
  if (result.outcome === "accepted") showToast("Paragon Archive installation accepted.");
  else if (result.outcome === "installed") showToast("Paragon Archive is already installed.");
  else showToast("Use your browser’s Install App or Add to Home Screen option.", "warning");
};
/* P-094 — real-app powers in App settings: notification opt-in, test ping, share. */
window.enableParagonNotifications = async function() {
  if (!window.ParagonPWA?.notificationsSupported?.()) { showToast("This browser does not support notifications.", "warning"); return; }
  const result = await window.ParagonPWA.connectPhonePush?.() || await window.ParagonPWA.enableNotifications();
  if (result.ok && result.method === "subscribed") showToast("Phone notifications connected — Paragon Archive can now reach your screen.");
  else if (result.ok) showToast("Notifications on — installing the app makes them appear like a real app's.");
  else if (result.permission === "denied") showToast("Notifications were blocked — allow them in your browser site settings.", "warning");
  else showToast("Notifications were not enabled.", "warning");
};
window.testParagonNotification = async function() {
  const result = await window.ParagonPWA?.sendTestNotification?.();
  if (result?.ok) showToast("Test notification sent — check your screen.");
  else showToast("Enable notifications first (the Enable button).", "warning");
};
window.shareParagonApp = async function() {
  /* P-097 — the shared link opens the install popup directly on arrival. */
  try { window.ParagonPWA?.setShareOverride?.(window.location.href.split("?")[0].split("#")[0] + "?install=1"); } catch (error) { /* older pwa */ }
  const result = await window.ParagonPWA?.shareParagon?.();
  try { window.ParagonPWA?.setShareOverride?.(null); } catch (error) { /* reset */ }
  if (result?.ok && result.method === "clipboard") showToast("Install link copied — anyone who opens it gets the install popup.");
  else if (!result?.ok && result?.reason === "unavailable") showToast("Sharing is not available in this browser.", "warning");
};

/* --- Global UI polish --- */
function bindGlobalUI() {
  // P-092 — arrival popup: unread Team replies greet the user when they come back.
  window.setTimeout(() => {
    try {
      const unread = (JSON.parse(window.localStorage.getItem("paragonUserInbox.v1") || "null") || []).filter(entry => !entry.read).length;
      if (unread) showToast(`📬 ${unread === 1 ? "A reply" : unread + " replies"} from the Paragon Team — open the 🔔 notifications.`);
    } catch (error) { /* blocked */ }
  }, 5600);
  document.addEventListener("click", event => {
    const notice = event.target.closest("[data-notice]");
    if (!notice) return;
    event.preventDefault();
    // P-076 — every "about/how it works" button renders the SAME inline notice panel.
    const host = notice.closest(".account-section-head") || notice.parentElement;
    const existing = host.parentElement.querySelector(".inline-notice");
    if (existing) { existing.remove(); return; }
    const panel = document.createElement("div");
    panel.className = "inline-notice";
    panel.innerHTML = `<span>💡 ${notice.dataset.notice}</span><button type="button" aria-label="Dismiss">×</button>`;
    panel.querySelector("button").addEventListener("click", () => panel.remove());
    host.insertAdjacentElement("afterend", panel);
  });

  document.getElementById("clear-history-btn")?.addEventListener("click", () => {
    if (!requirePersonalSession("manage visit history")) return;
    localVisits = [];
    persistPersonalState();
    renderVisitedAccount();
    renderAccount();
    showToast(guestMode ? "Temporary Guest history cleared." : "Visit history cleared and queued for sync.");
  });

  window.addEventListener("paragon:progress", event => {
    const { productId, entry } = event.detail || {};
    if (!productId) return;
    if (entry) sharedProgress[productId] = entry;
    else delete sharedProgress[productId];
    if (hasPersonalSession()) renderAccount();
  });

  const backToTop = document.getElementById("back-to-top");
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => backToTop?.classList.toggle("visible", window.scrollY > 700), { passive: true });

  const footer = document.getElementById("footer");
  const bottomNav = document.getElementById("bottom-nav");
  const updateFooterNavigation = () => {
    if (!footer || !bottomNav) return;
    const rect = footer.getBoundingClientRect();
    const footerVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (window.innerWidth < 700) {
      bottomNav.style.removeProperty("bottom");
      bottomNav.classList.toggle("footer-visible", footerVisible);
      bottomNav.classList.remove("footer-shifted");
      return;
    }
    bottomNav.classList.remove("footer-visible");
    const visibleFooterHeight = footerVisible
      ? Math.max(0, Math.min(Number(rect.height || rect.bottom - rect.top || 0), window.innerHeight - Math.max(0, rect.top)))
      : 0;
    bottomNav.style.bottom = `${visibleFooterHeight > 0 ? visibleFooterHeight + 12 : 16}px`;
    bottomNav.classList.toggle("footer-shifted", visibleFooterHeight > 0);
  };
  window.updateFooterNavigation = updateFooterNavigation;
  if (footer && bottomNav && "IntersectionObserver" in window) {
    const footerObserver = new IntersectionObserver(updateFooterNavigation, { threshold: [0, 0.05, 0.5, 1] });
    footerObserver.observe(footer);
  }
  window.addEventListener("scroll", updateFooterNavigation, { passive: true });
  window.addEventListener("resize", updateFooterNavigation);
  updateFooterNavigation();

  document.addEventListener("error", event => {
    if (event.target?.tagName === "IMG") {
      event.target.classList.add("image-failed");
      event.target.parentElement?.classList.add("image-fallback");
    }
  }, true);

  const revealTargets = document.querySelectorAll("#tab-websites > section, .updates-header, .account-section");
  if ("IntersectionObserver" in window && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    }), { threshold: 0.08 });
    revealTargets.forEach(target => { target.classList.add("reveal-ready"); observer.observe(target); });
  } else revealTargets.forEach(target => target.classList.add("revealed"));
}

/* --- Scroll Color for Bottom Nav --- */
function bindScrollColor() {
  const nav = document.getElementById("bottom-nav");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const progress = h > 0 ? y / h : 0;
        const hue = Math.floor(progress * 360);
        document.documentElement.style.setProperty("--h", hue);
        // Very subtle page wash
        document.body.style.background = `radial-gradient(circle at 50% 0%, hsla(${hue}, 90%, 15%, 0.08), var(--bg) 70%)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* --- Scroll Color for Bottom Nav --- */
function bindScrollColor() {
  const nav = document.getElementById("bottom-nav");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const progress = h > 0 ? y / h : 0;
        const hue = Math.floor(progress * 360);
        document.documentElement.style.setProperty("--h", hue);
        // Very subtle page wash
        document.body.style.background = `radial-gradient(circle at 50% 0%, hsla(${hue}, 90%, 15%, 0.08), var(--bg) 70%)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

