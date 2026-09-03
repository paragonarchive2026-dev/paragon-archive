/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: developer-portal.js
  EXPECTED PROJECT PATH: /developer-portal.js
  ROLE: P-077 (B1+B2+B3+B5) controller — Developer Portal: 8-point gate display (mirrors the Team desk exactly), application form writing paragonTeamApplications.v1 for REAL, accepted-developer detection, website submission into paragonTeamDeployed.submissions.v1 (the Team review desk), my-submissions status tracking.
  RESTORE/LOAD NOTE: Load on /developer-portal.html. Loops are real on-device: apply → Team Dev Applications desk; accepted → dashboard unlocks; submit → Team Deployed Reviews desk (8-point gate) → approval joins the public Deployed category via app.js merge. pendingBackendSync until backend activation.
*/

(function () {
  "use strict";

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
  if (document.readyState !== "loading") { if (applyPlatformMaintenanceLockdown()) return; }
  else document.addEventListener("DOMContentLoaded", function () { if (applyPlatformMaintenanceLockdown()) throw new Error("maintenance lockdown"); });

  var APPLICATIONS_KEY = "paragonTeamApplications.v1";
  var SUBMISSIONS_KEY = "paragonTeamDeployed.submissions.v1";
  var DEV_IDENTITY_KEY = "paragonDeveloperIdentity.v1";
  /* EXACT mirror of the Team desk checklist (team/deployed.js) — B5 transparency rule */
  var GATE = [
    "Responsive on mobile",
    "Supports dark mode",
    "Works inside iframe",
    "No malicious code detected",
    "Premium features clearly labeled",
    "Content is appropriate",
    "Performance is acceptable",
    "Privacy compliant"
  ];

  function readJSON(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || "null") || fallback; }
    catch (error) { return fallback; }
  }
  function writeJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* blocked */ }
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }
  function showToast(text) {
    var toast = document.getElementById("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    window.setTimeout(function () { toast.hidden = true; }, 3400);
  }
  function showError(id, text) {
    var node = document.getElementById(id);
    if (!node) return;
    node.textContent = text;
    node.style.display = text ? "block" : "none";
  }

  function myIdentity() { return readJSON(DEV_IDENTITY_KEY, null); }
  function myApplication() {
    var identity = myIdentity();
    if (!identity) return null;
    return readJSON(APPLICATIONS_KEY, []).filter(function (application) { return application.username === identity.username; })[0] || null;
  }

  function submitApplication() {
    var username = document.getElementById("app-username").value.trim();
    var email = document.getElementById("app-email").value.trim();
    var skills = document.getElementById("app-skills").value.trim();
    var pitch = document.getElementById("app-pitch").value.trim();
    if (username.length < 3) return showError("apply-error", "Username needs at least 3 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("apply-error", "A valid email is required.");
    if (skills.length < 3 || pitch.length < 15) return showError("apply-error", "Tell us your skills and a real pitch (15+ characters).");
    showError("apply-error", "");
    var applications = readJSON(APPLICATIONS_KEY, []);
    if (applications.some(function (application) { return application.username === username && (application.status === "pending" || application.status === "review"); })) {
      return showError("apply-error", "An application for this username is already under review.");
    }
    applications.push({
      id: "app-" + Date.now(), username: username, email: email,
      portfolio: document.getElementById("app-portfolio").value.trim(),
      experience: document.getElementById("app-exp").value,
      skills: skills, pitch: pitch,
      submittedAt: new Date().toISOString(), status: "pending", decision: null,
      pendingBackendSync: true
    });
    writeJSON(APPLICATIONS_KEY, applications);
    writeJSON(DEV_IDENTITY_KEY, { username: username, email: email, appliedAt: new Date().toISOString() });
    /* P-089 — publish to the LIVE developer backend when a session exists */
    (async function () {
      try {
        var session = await window.ParagonAuth?.getSession?.();
        var config = window.ParagonConfig || {};
        if (session && session.access_token && config.supabaseUrl) {
          await fetch(config.supabaseUrl + "/rest/v1/paragon_dev_applications", {
            method: "POST",
            headers: { apikey: config.supabaseAnonKey, Authorization: "Bearer " + session.access_token, "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: session.user.id, username: username, email: email, portfolio: document.getElementById("app-portfolio").value.trim(), experience: document.getElementById("app-exp").value, skills: skills, pitch: pitch })
          });
          showToast("💼 Application submitted — LIVE on the developer backend + the Team desk.");
          return;
        }
      } catch (error) { /* device queue carries on */ }
      showToast("💼 Application submitted — on the Team desk (publishes to the backend when signed in).");
    })();
    render();
  }

  function submitWebsite() {
    var application = myApplication();
    if (!application || application.status !== "accepted") return;
    var name = document.getElementById("sub-name").value.trim();
    var desc = document.getElementById("sub-desc").value.trim();
    if (name.length < 3) return showError("sub-error", "Website name needs at least 3 characters.");
    if (desc.length < 15) return showError("sub-error", "Describe the website (15+ characters).");
    var submissions = readJSON(SUBMISSIONS_KEY, []);
    if (submissions.some(function (entry) { return entry.name.toLowerCase() === name.toLowerCase(); })) {
      return showError("sub-error", "A submission with this name already exists.");
    }
    showError("sub-error", "");
    submissions.push({
      id: "sub-" + Date.now(), name: name,
      icon: document.getElementById("sub-icon").value.trim() || "🚀",
      submittedBy: "@" + application.username,
      category: "Deployed",
      pricing: document.getElementById("sub-pricing").value,
      url: document.getElementById("sub-url").value.trim(),
      desc: desc,
      submittedAt: new Date().toISOString(),
      status: "pending", checklist: {}, notes: "", decisionReason: "",
      pendingBackendSync: true
    });
    writeJSON(SUBMISSIONS_KEY, submissions);
    ["sub-name", "sub-icon", "sub-url", "sub-desc"].forEach(function (id) { document.getElementById(id).value = ""; });
    showToast("🚀 Submitted — the Team's 8-point review gate has it now.");
    render();
  }

  function render() {
    var gate = document.getElementById("gate-list");
    if (gate) gate.innerHTML = GATE.map(function (item, index) {
      return '<div class="devportal-gate-item"><span>' + (index + 1) + '</span>' + escapeHTML(item) + '</div>';
    }).join("");

    var application = myApplication();
    var statusNode = document.getElementById("apply-status");
    var applySection = document.getElementById("apply-section");
    var dashboard = document.getElementById("dev-dashboard");
    if (!application) {
      dashboard.hidden = true;
      statusNode.innerHTML = "";
    } else {
      var meta = { pending: ["🟡 Pending — the team will review it", "st-scheduled"], review: ["🔵 Under review right now", "st-preview"], accepted: ["✅ ACCEPTED — welcome, developer!", "st-live"], rejected: ["❌ Rejected" + (application.decision && application.decision.note ? " — " + application.decision.note : ""), "st-archived"] }[application.status] || ["🟡 Pending", "st-scheduled"];
      statusNode.innerHTML = '<div class="team-site-card" style="margin-top:12px;"><div class="team-site-main"><div class="team-site-titleline"><b>@' + escapeHTML(application.username) + '</b><span class="team-status-chip ' + meta[1] + '">' + meta[0] + '</span></div><p class="team-site-sub">Applied ' + new Date(application.submittedAt).toLocaleDateString() + ' · status updates live from the Team desk (one real store).</p></div></div>';
      var accepted = application.status === "accepted";
      dashboard.hidden = !accepted;
      applySection.querySelectorAll("input, textarea, select, button").forEach(function (node) { node.disabled = accepted; });
      if (accepted) {
        document.getElementById("dev-welcome").textContent = "Welcome @" + application.username + "! Submit websites below — each passes the real 8-point gate before joining the public Deployed category.";
        var mine = readJSON(SUBMISSIONS_KEY, []).filter(function (entry) { return entry.submittedBy === "@" + application.username; });
        /* P-088 — protected developer analytics: real device metrics for THIS developer's approved websites only */
        var needsMap = readJSON("paragonArchive.siteNeeds.v1", {});
        function siteViews(name) { try { return window.ParagonMetrics ? Number(window.ParagonMetrics.getViewCount(name)) || 0 : 0; } catch (error) { return 0; } }
        document.getElementById("my-submissions").innerHTML = mine.length ? mine.map(function (entry) {
          var chip = entry.status === "approved" ? '<span class="team-status-chip st-live">✅ APPROVED — live in the Deployed category</span>'
            : entry.status === "rejected" ? '<span class="team-status-chip st-archived">❌ Rejected' + (entry.decisionReason ? " — " + escapeHTML(entry.decisionReason) : "") + '</span>'
            : entry.status === "hold" ? '<span class="team-status-chip st-scheduled">🔄 On hold</span>'
            : '<span class="team-status-chip st-preview">🟡 In the 8-point review</span>';
          var analytics = entry.status === "approved"
            ? '<p class="team-site-sub">📊 Your real analytics (this device; global at backend): 👁 ' + siteViews(entry.name) + ' views · 🙋 ' + ((needsMap[entry.name] && Number(needsMap[entry.name].count)) || 0) + ' needs</p>'
            : "";
          return '<article class="team-site-card"><div class="team-site-main"><div class="team-site-titleline"><b>' + escapeHTML(entry.icon) + ' ' + escapeHTML(entry.name) + '</b>' + chip + '</div><p class="team-site-sub">' + escapeHTML(entry.desc || "") + '</p>' + analytics + '</div></article>';
        }).join("") : '<div class="empty-state"><div class="empty-icon">📦</div><h3>No submissions yet</h3><p>Your first website is one form away.</p></div>';
      }
    }
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.getElementById("gate-list")) return;
      render();
      document.getElementById("apply-submit").addEventListener("click", submitApplication);
      document.getElementById("sub-submit").addEventListener("click", submitWebsite);
    });
  }

  window.ParagonDeveloperPortal = {
    APPLICATIONS_KEY: APPLICATIONS_KEY, SUBMISSIONS_KEY: SUBMISSIONS_KEY, GATE: GATE,
    readJSON: readJSON, writeJSON: writeJSON
  };
})();
