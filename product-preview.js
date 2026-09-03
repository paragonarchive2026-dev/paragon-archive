/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: product-preview.js
  EXPECTED PROJECT PATH: /product-preview.js
  ROLE: Renders one tailored same-style concept preview from Paragon catalogue data.
  RESTORE/LOAD NOTE: Keep at project root. Load after all catalogue data on paragon-product-preview.html.
*/

(() => {
  const sites = window.ParagonSites || [];
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

  function workspaceFor(site) {
    const features = (site.features || site.updates || []).slice(0, 5);
    const featureCards = features.map((feature, index) => `<article><span>${index + 1}</span><div><strong>${escapeHTML(feature)}</strong><small>Included in the planned ${escapeHTML(site.name)} experience</small></div></article>`).join("");
    const category = site.category;
    if (["Education"].includes(category)) return `<section class="product-mock-panel"><div class="product-mock-heading"><span>📚</span><div><strong>Learning workspace</strong><small>Continue your next lesson</small></div></div><div class="product-lesson-list">${features.slice(0, 4).map((feature, index) => `<div><b>${index + 1}</b><span>${escapeHTML(feature)}</span><em>${index ? "Ready" : "Start here"}</em></div>`).join("")}</div></section>`;
    if (["Games"].includes(category)) return `<section class="product-mock-panel product-game-panel"><span class="product-game-icon">${site.icon}</span><h2>Ready to play?</h2><p>A focused browser-game preview built around ${escapeHTML(site.desc.toLowerCase())}.</p><button type="button">Start preview</button></section>`;
    if (["Media", "Entertainment"].includes(category)) return `<section class="product-mock-panel"><div class="product-now-playing"><span>${site.icon}</span><div><small>NOW PREVIEWING</small><strong>${escapeHTML(site.name)}</strong><p>${escapeHTML(site.desc)}</p></div></div><div class="product-player-line"><button type="button">Play</button><span></span><time>0:00</time></div></section>`;
    if (["Finance"].includes(category)) return `<section class="product-mock-panel"><div class="product-dashboard-numbers"><article><small>Overview</small><strong>₦0.00</strong><span>Private preview data</span></article><article><small>Planned tools</small><strong>${features.length}</strong><span>Ready to explore</span></article><article><small>Status</small><strong>Concept</strong><span>No real transaction</span></article></div></section>`;
    if (["Health", "Lifestyle"].includes(category)) return `<section class="product-mock-panel"><div class="product-checkin"><span>${site.icon}</span><div><small>TODAY'S PREVIEW</small><h2>How are you doing?</h2><p>${escapeHTML(site.desc)}</p></div></div><div class="product-mood-row"><button>Great</button><button>Okay</button><button>Focus</button><button>Rest</button></div></section>`;
    if (["Social"].includes(category)) return `<section class="product-mock-panel"><div class="product-feed-compose"><span>◈</span><div><strong>Community preview</strong><small>Real community features require production moderation.</small></div></div><div class="product-feed-items">${features.slice(0, 3).map(feature => `<article><b>${site.icon}</b><div><strong>${escapeHTML(feature)}</strong><p>Designed to keep this experience useful, respectful, and easy to use.</p></div></article>`).join("")}</div></section>`;
    if (["Creative"].includes(category)) return `<section class="product-mock-panel product-canvas-panel"><div class="product-canvas-tools"><span>✦</span><span>□</span><span>○</span><span>T</span></div><div class="product-canvas"><span>${site.icon}</span><strong>${escapeHTML(site.name)}</strong><small>Creative workspace concept</small></div><div class="product-palette"><i></i><i></i><i></i><i></i><i></i></div></section>`;
    return `<section class="product-feature-preview"><div class="product-mock-heading"><span>${site.icon}</span><div><strong>${escapeHTML(site.name)} workspace</strong><small>Shared Paragon interaction preview</small></div></div><div class="product-feature-preview-grid">${featureCards}</div></section>`;
  }

  /* P-096 — TEAM CONSTRUCTION LINK: the Team websites desk writes real build percentages,
     notes, and construction-retirement here; this public page obeys instantly. */
  var TEAM_CONSTRUCTION_KEY = "paragonTeamConstruction.v1";
  function readTeamConstruction() {
    try { return JSON.parse(window.localStorage.getItem(TEAM_CONSTRUCTION_KEY) || "null") || {}; }
    catch (error) { return {}; }
  }
  if (typeof window.addEventListener === "function") {
    window.addEventListener("storage", function (event) {
      if (event.key === TEAM_CONSTRUCTION_KEY && document.getElementById("product-preview")) render();
    });
  }

  /* P-074 — "I NEED this website" demand signal (owner request, MovieBox-style).
     Honest: counts start at REAL ZERO and live on this device until the backend
     aggregates global demand; the team reads them to prioritize construction. */
  var NEEDS_KEY = "paragonArchive.siteNeeds.v1";
  function readNeeds() {
    try { return JSON.parse(window.localStorage.getItem(NEEDS_KEY) || "null") || {}; }
    catch (error) { return {}; }
  }
  function writeNeeds(map) {
    try { window.localStorage.setItem(NEEDS_KEY, JSON.stringify(map)); } catch (error) { /* blocked */ }
  }
  function needState(name) {
    var map = readNeeds();
    var entry = map[name] || { count: 0, mine: false };
    return { count: Number(entry.count) || 0, mine: Boolean(entry.mine) };
  }
  function addNeed(name) {
    var map = readNeeds();
    var entry = map[name] || { count: 0 };
    entry.count = Math.max(0, (Number(entry.count) || 0) + 1); // unlimited — every tap counts (owner rule P-080)
    map[name] = entry;
    writeNeeds(map);
    return entry;
  }
  function refreshNeedUI(name) {
    var state = needState(name);
    var count = document.getElementById("need-site-count");
    if (count) count.textContent = String(state.count);
    var label = document.getElementById("need-site-label");
    if (label) label.textContent = state.count === 1 ? "1 need registered on this device" : state.count + " needs registered on this device";
  }


  /* P-097 — WHOLE-PLATFORM MAINTENANCE: the Team Settings toggle closes every Paragon surface. */
  function platformMaintenanceActive() {
    try { return (JSON.parse(window.localStorage.getItem("paragonTeamSettings.v1") || "null") || {}).maintenanceMode === true; }
    catch (error) { return false; }
  }
  function applyPlatformMaintenanceLockdown() {
    if (!platformMaintenanceActive() || typeof document.createElement !== "function") return false;
    if (document.getElementById("platform-maintenance-lockdown")) return true;
    var screen = document.createElement("div");
    screen.id = "platform-maintenance-lockdown";
    screen.innerHTML = '<style>#platform-maintenance-lockdown{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:26px;background:#0b0b0f;color:#e6e9f0;text-align:center;font-family:system-ui,-apple-system,sans-serif}#platform-maintenance-lockdown img{width:min(300px,62vw);height:auto}#platform-maintenance-lockdown h1{font-size:clamp(22px,4vw,32px);margin:0}#platform-maintenance-lockdown p{max-width:520px;font-size:14px;line-height:1.65;opacity:.82;margin:0}#platform-maintenance-lockdown button{margin-top:8px;padding:12px 24px;border:0;border-radius:999px;background:linear-gradient(120deg,#2563eb,#6d5efc);color:#fff;font-weight:800;cursor:pointer}</style>' +
      '<img src="assets/illustrations/maintenance.png" alt=""><h1>🚧 Paragon Archive is under maintenance</h1><p>The whole platform is briefly closed for repairs and updates from the Paragon Team. Every Paragon website routes here until maintenance is switched off. Nothing is lost — please check back soon.</p><button type="button" onclick="location.reload()">Try again</button>';
    document.documentElement.appendChild(screen);
    return true;
  }
  function render() {
if (applyPlatformMaintenanceLockdown()) return;    const container = document.getElementById("product-preview");
    const requestedName = new URLSearchParams(window.location.search).get("site") || "";
    const site = sites.find(entry => entry.name.toLowerCase() === requestedName.toLowerCase());
    if (!container || !site) {
      if (container) container.innerHTML = `<section class="product-preview-error"><strong>Preview not found</strong><p>Return to Paragon Archive and open a listed website.</p><a href="paragon-archive.html">Open Archive</a></section>`;
      return;
    }
    document.title = `${site.name} — Under Construction`;
    document.documentElement.style.setProperty("--preview-accent", site.color || "#2563eb");
    const detailUrl = `paragon-archive.html?site=${encodeURIComponent(site.name)}`;
    // D-125: the loader shows the website's REAL build percentage. Sites that are 0% built
    // show an honest empty bar at 0% — the bar only fills as real construction progresses
    // (each site's buildProgress value is updated in catalogue data as it is actually built).
    /* P-096 — the Team desk owns the real build percentage (paragonTeamConstruction.v1);
       the catalogue value stays the fallback. hidden=true retires the construction surface. */
    var teamLog = readTeamConstruction()[site.name] || null;
    var buildProgress = Math.max(0, Math.min(100, Math.round(Number(teamLog && teamLog.progress != null ? teamLog.progress : site.buildProgress) || 0)));
    var constructionRetired = Boolean(teamLog && teamLog.hidden);
    container.innerHTML = `
      <section class="construction-stage" aria-labelledby="construction-title">
        <div class="construction-glow" aria-hidden="true"></div>
        <div class="construction-icon" aria-hidden="true">${site.name === "Paragon Quiz" ? '<img src="assets/site-icons/paragon-quiz.png" alt="">' : site.icon}</div>
        ${constructionRetired
          ? `<h1 id="construction-title">🚀 Construction retired by the Paragon Team</h1><p class="construction-status">${escapeHTML(site.name)} no longer shows the under-construction stage${teamLog && teamLog.note ? " — team note: “" + escapeHTML(teamLog.note) + "”" : ""}. Everything else below still works.</p>`
          : `<h1 id="construction-title">We're building something</h1>
        <p class="construction-status">${escapeHTML(site.name)} is under construction. Paragon is actively building it — check back soon.</p>`}
        ${constructionRetired ? "" : `
        <div class="construction-bar-wrap">
          <div class="construction-bar determinate" role="progressbar" aria-label="Real build progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${buildProgress}"><span id="construction-fill"></span></div>
          <p class="construction-percent"><b id="construction-percent-value">0</b><span>% built</span></p>
        </div>
        ${teamLog && teamLog.note && !constructionRetired ? `<p class="construction-team-note">🛠️ Team note: “${escapeHTML(teamLog.note)}”</p>` : ""}
        <p class="construction-note">🚧 This is the real build percentage${teamLog ? ", set live from the Paragon Team construction desk" : " from the catalogue"} — it only rises as ${escapeHTML(site.name)} is actually built.${buildProgress === 0 ? " Construction has not started yet." : ""}</p>`}
        <div class="construction-journey" aria-label="Where this website is in its real journey">
          <div class="${buildProgress === 0 ? "active" : ""}"><b>🗒️</b><strong>Documented</strong><small>Concept + features recorded in the Archive</small></div>
          <div class="${buildProgress > 0 && buildProgress < 100 ? "active" : ""}"><b>🏗️</b><strong>Being built</strong><small>${buildProgress > 0 ? `Real construction at ${buildProgress}%` : "Starts when scheduled by demand"}</small></div>
          <div><b>🚀</b><strong>Launch</strong><small>OPEN goes live in the Archive</small></div>
        </div>
        <div class="construction-need">
          <div class="need-bubble-wrap">
            <span id="need-site-count" class="need-count-bubble">0</span>
            <span class="need-bubble-stem" aria-hidden="true"></span>
            <button type="button" id="need-site-btn" class="need-site-btn" onclick="ParagonProductPreview.toggleNeed('${site.name.replace(/'/g, "\\'")}')">🙋 I NEED this website</button>
          </div>
          <span id="need-site-label" class="need-site-count">0 needs registered on this device</span>
          <small class="need-site-note">💪 Every tap is a real vote — tap as many times as you need it! The team literally builds the MOST-NEEDED websites first, so you are speeding this one up right now. (Global counts activate with the backend.)</small>
        </div>
        <div class="construction-actions">
          <button type="button" class="construction-docs-btn" onclick="ParagonProductPreview.toggleDocs(true)">📖 View the concept documentation</button>
          <a class="construction-detail-link" href="${detailUrl}" target="_blank" rel="noopener">Return to Archive detail</a>
        </div>

      </section>
      <div id="preview-docs" class="preview-docs-collapsed">
      <!-- P-081 — mid-page topbar removed: the docs flow starts directly with the hero; Return-to-detail lives in the stage actions and the footer -->
      <section class="product-preview-hero">
        <div class="product-preview-icon" aria-hidden="true">${site.icon}</div>
        <div><p class="eyebrow">${escapeHTML(site.group || site.category)} · Concept preview</p><h1>${escapeHTML(site.name)}</h1><p>${escapeHTML(site.about || site.desc)}</p><div class="product-preview-tags"><span>${escapeHTML(site.category)}</span><span>${escapeHTML(site.tag || "Paragon")}</span><span>Preview only</span></div></div>
      </section>
      <aside class="product-preview-honesty"><strong>Not the final production website</strong><span>This shared preview uses real catalogue information and planned features so the iframe is useful while the individual product is still being built.</span></aside>
      ${workspaceFor(site)}
      <section class="product-preview-features"><div><p class="eyebrow">Planned experience</p><h2>What ${escapeHTML(site.name)} is designed to include</h2></div><div>${(site.features || site.updates || []).map((feature, index) => `<article><span>${index + 1}</span><strong>${escapeHTML(feature)}</strong></article>`).join("")}</div></section>
      <footer class="product-preview-footer"><span>◈ Paragon · The Web, Reimagined</span><a href="${detailUrl}" target="_blank" rel="noopener">Return to detail</a></footer>
      </div>`;
    animateBuildProgress(buildProgress);
    var bar = typeof document.querySelector === "function" ? document.querySelector(".construction-bar") : null;
    if (bar && buildProgress === 0) bar.classList.add("awaiting-start"); // P-074 — alive shimmer while the REAL value is still 0%
    refreshNeedUI(site.name);
  }

  function animateBuildProgress(target) {
    const fill = document.getElementById("construction-fill");
    const value = document.getElementById("construction-percent-value");
    if (!fill || !value) return;
    const clamped = Math.max(0, Math.min(100, Number(target) || 0));
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || clamped === 0) {
      fill.style.width = `${clamped}%`;
      value.textContent = String(clamped);
      return;
    }
    const started = performance.now();
    const duration = 1100;
    function tick(now) {
      const ratio = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      fill.style.width = `${(clamped * eased).toFixed(1)}%`;
      value.textContent = String(Math.round(clamped * eased));
      if (ratio < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function toggleDocs(open) {
    const docs = document.getElementById("preview-docs");
    if (!docs) return;
    const show = open === undefined ? docs.classList.contains("preview-docs-collapsed") : Boolean(open);
    docs.classList.toggle("preview-docs-collapsed", !show);
    if (show) {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => docs.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }));
    }
  }

  window.ParagonProductPreview = { render, workspaceFor, toggleDocs, toggleNeed: function (name) {
      addNeed(name);
      refreshNeedUI(name);
      var btn = document.getElementById("need-site-btn");
      if (btn) { btn.classList.remove("need-pop"); void btn.offsetWidth; btn.classList.add("need-pop"); }
    } };
  document.addEventListener("DOMContentLoaded", render);
})();
