/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: team-pages.js
  EXPECTED PROJECT PATH: /team/team-pages.js
  ROLE: THE single consolidated Team dashboard controller (P-088 file-count reduction) — every page module lives here, wrapped in a location guard so it only executes on its own page. Replaces the former per-page scripts (their code is unchanged inside the guards).
  RESTORE/LOAD NOTE: Load on every /team/*.html page after permissions.js + nav.js, before session.js. Shared infra (permissions.js, nav.js, session.js) stays separate by design.
*/

function paragonTeamPage() {
  /* P-097 — the consolidated desk routes with ?page=name; every module guard below still
     compares against "<name>.html", so the param is normalized to that exact shape. */
  try {
    var file = window.location.pathname.split("/").pop() || "";
    if (/desk\.html$/.test(file)) {
      var routed = new URLSearchParams(window.location.search).get("page") || "overview";
      return (routed.replace(/\.html$/, "") + ".html").toLowerCase();
    }
    return file.toLowerCase();
  } catch (error) { return ""; }
}

/* ================= PAGE MODULE: activity.js (runs only on activity.html) ================= */
if (paragonTeamPage() === "activity.html") {
(function () {
  "use strict";

  var ACTOR = "Paragon (this device)";

  function readJSON(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || "null") || fallback; }
    catch (error) { return fallback; }
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }
  function element(id) { return document.getElementById(id); }

  function collect() {
    var events = [];
    function add(type, icon, headline, detail, at, link, linkLabel) {
      var time = Date.parse(at || 0);
      if (!Number.isFinite(time) || time <= 0) return;
      events.push({ type: type, icon: icon, headline: headline, detail: detail || "", at: time, link: link || "", linkLabel: linkLabel || "" });
    }
    readJSON("paragonTeamWebsites.drafts.v1", []).forEach(function (draft) {
      add("website", "🌐", "WEBSITE DRAFT CREATED", "\u201C" + draft.name + "\u201D added as a team-only draft", draft.createdAt, "desk.html?page=websites", "View Websites");
    });
    var overrides = readJSON("paragonTeamWebsites.overrides.v1", {});
    Object.keys(overrides).forEach(function (name) {
      var override = overrides[name];
      if (override.updatedAt) add("website", override.status === "archived" ? "🗂️" : "🌐", "WEBSITE " + String(override.status || "EDITED").toUpperCase(), "\u201C" + name + "\u201D " + (override.status ? "set to " + override.status : "edited") + (override.scheduledFor ? " — goes live " + new Date(override.scheduledFor).toLocaleDateString() : ""), override.updatedAt, "desk.html?page=websites", "View Websites");
    });
    readJSON("paragonTeamDeployed.submissions.v1", []).forEach(function (submission) {
      if (submission.decidedAt) add("deployed", "🚀", "DEPLOYED " + submission.status.toUpperCase(), "\u201C" + submission.name + "\u201D by " + submission.submittedBy + (submission.decisionReason ? " — Reason: " + submission.decisionReason : ""), submission.decidedAt, "deployed.html", "View Submission");
    });
    readJSON("paragonTeamTickets.v1", []).forEach(function (ticket) {
      ticket.thread.forEach(function (message) {
        if (message.team && message.queued) add("ticket", "🎫", "TICKET REPLY SENT", "Reply on ticket #" + ticket.id + " (" + ticket.subject + ")", message.at, "desk.html?page=ticket&id=" + ticket.id, "View Ticket");
      });
    });
    var moderation = readJSON("paragonTeamUsers.moderation.v1", {});
    Object.keys(moderation).forEach(function (userId) {
      (moderation[userId].history || []).forEach(function (entry) {
        var who = userId.replace("example-", "@").replace("local-", "member ");
        var reason = entry.detail && entry.detail.reason ? " — Reason: " + entry.detail.reason : "";
        add("user", "🚫", "USER " + entry.action.toUpperCase(), who + reason, entry.at, "users.html", "View Users");
      });
    });
    readJSON("paragonTeamAnnouncements.v1", []).forEach(function (record) {
      if (record.publishedAt) add("announcement", "📢", "ANNOUNCEMENT PUBLISHED", "\u201C" + record.title + "\u201D", record.publishedAt, "desk.html?page=announcements", "View Announcements");
      else add("announcement", "📢", "ANNOUNCEMENT DRAFTED", "\u201C" + record.title + "\u201D (" + record.status + ")", record.createdAt, "desk.html?page=announcements", "View Announcements");
    });
    (readJSON("paragonTeamMembers.v1", { invites: [] }).invites || []).forEach(function (invite) {
      add("team", "🧑‍💼", "TEAM INVITATION SENT", invite.name + " (" + invite.role + ") — email queues for backend dispatch", invite.at, "members.html", "View Team");
    });
    readJSON("paragonTeamRequests.v1", []).forEach(function (request) {
      request.updates.forEach(function (update) {
        add("request", "📬", "REQUESTER UPDATE QUEUED", "\u201C" + request.name + "\u201D — " + update.text, update.at, "requests.html", "View Requests");
      });
    });
    (readJSON("paragonTeamPortal.security.v1", { incidents: [] }).incidents || []).forEach(function (incident) {
      add("security", "🔒", "PORTAL LOCKOUT", "5 failed login attempts on this device — owner alert queued", incident.at, "login.html", "View Portal");
    });
    for (var index = 0; index < window.localStorage.length; index += 1) {
      var key = window.localStorage.key(index) || "";
      if (key.indexOf("paragonCommunityMembership:") === 0) {
        var record = readJSON(key, null);
        if (record && record.joinedAt) add("community", "👥", "COMMUNITY MEMBER JOINED", (record.displayName || "A member") + " joined on this device", record.joinedAt, "../paragon-archive-hub.html#community", "View Community");
      }
    }
    readJSON("paragonQuiz.quizzes.v1", []).forEach(function (quiz) {
      add("website", "🎮", "QUIZ PUBLISHED", "\u201C" + quiz.title + "\u201D on Paragon Quiz", quiz.createdAt, "../paragon-quiz/play.html?id=" + encodeURIComponent(quiz.id), "Play Quiz");
    });
    events.sort(function (a, b) { return b.at - a.at; });
    return events;
  }

  function dayLabel(time) {
    var date = new Date(time);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var thatDay = new Date(date); thatDay.setHours(0, 0, 0, 0);
    var label = date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    if (thatDay.getTime() === today.getTime()) return "TODAY — " + label;
    if (thatDay.getTime() === today.getTime() - 86400000) return "YESTERDAY — " + label;
    return label;
  }

  function filtered() {
    var term = (element("act-search").value || "").trim().toLowerCase();
    var type = element("act-type").value;
    var dateFilter = element("act-date").value;
    return collect().filter(function (event) {
      if (type !== "all" && event.type !== type) return false;
      if (dateFilter === "today") {
        var today = new Date(); today.setHours(0, 0, 0, 0);
        if (event.at < today.getTime()) return false;
      } else if (dateFilter !== "all") {
        if (event.at < Date.now() - Number(dateFilter) * 86400000) return false;
      }
      if (!term) return true;
      return (event.headline + " " + event.detail).toLowerCase().indexOf(term) !== -1;
    });
  }

  function render() {
    var events = filtered();
    element("act-total").textContent = events.length + " recorded action" + (events.length === 1 ? "" : "s") + " · all genuinely performed on this device";
    if (!events.length) {
      element("act-log").innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><h3>No recorded actions' + (element("act-type").value !== "all" || element("act-search").value ? " match" : " yet") + '</h3><p>Every action you take across the dashboard records itself here — nothing is fabricated.</p></div>';
      return;
    }
    var html = "";
    var lastDay = "";
    events.forEach(function (event) {
      var day = dayLabel(event.at);
      if (day !== lastDay) {
        if (lastDay) html += "</ol>";
        html += '<h2 class="team-dash-heading act-day-heading">' + escapeHTML(day) + '</h2><ol class="team-activity-list">';
        lastDay = day;
      }
      var time = new Date(event.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
      html += '<li><span class="team-activity-dot">' + event.icon + '</span><div>' +
        '<p><strong>' + escapeHTML(event.headline) + '</strong></p>' +
        '<p>' + escapeHTML(event.detail) + '</p>' +
        '<p class="act-byline">By: ' + ACTOR + (event.link ? ' · <a href="' + event.link + '">' + escapeHTML(event.linkLabel) + ' →</a>' : "") + '</p>' +
      '</div><time>' + time + '</time></li>';
    });
    html += "</ol>";
    element("act-log").innerHTML = html;
  }

  function exportCSV() {
    var lines = ["timestamp,type,headline,detail,actor"];
    filtered().forEach(function (event) {
      lines.push([new Date(event.at).toISOString(), event.type, JSON.stringify(event.headline), JSON.stringify(event.detail), JSON.stringify(ACTOR)].join(","));
    });
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "paragon-activity-log.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    ["act-search", "act-type", "act-date"].forEach(function (id) {
      element(id).addEventListener("input", render);
      element(id).addEventListener("change", render);
    });
    element("act-export").addEventListener("click", exportCSV);
  });

  window.ParagonTeamActivity = { collect: collect, dayLabel: dayLabel };
})();

}

/* ================= PAGE MODULE: add-website.js (runs only on add-website.html) ================= */
if (paragonTeamPage() === "add-website.html") {
(function () {
  "use strict";

  var DRAFTS_KEY = "paragonTeamWebsites.drafts.v1";
  var EXPECTED = {
    "aw-icon": { width: 200, height: 200, label: "Icon" },
    "aw-card": { width: 800, height: 400, label: "Card preview" },
    "aw-hero": { width: 1200, height: 600, label: "Hero screenshot" }
  };

  var tags = [];
  var media = {}; // id -> { name, width, height, ok, preview? }

  function element(id) { return document.getElementById(id); }
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

  var toastHandle = null;
  function showToast(text) {
    var toast = element("dash-toast");
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3400);
  }
  function setStatusLine(text, tone) {
    var line = element("aw-status-line");
    line.hidden = !text;
    line.textContent = text || "";
    line.dataset.tone = tone || "info";
  }

  /* ---- counters ---- */
  function bindCounter(inputId, countId) {
    element(inputId).addEventListener("input", function () {
      element(countId).textContent = String(element(inputId).value.length);
    });
  }

  /* ---- categories from real catalogue ---- */
  function fillCategories() {
    var seen = {};
    (window.ParagonSites || []).forEach(function (site) { if (site.category) seen[site.category] = true; });
    var select = element("aw-category");
    Object.keys(seen).sort().forEach(function (category) {
      var option = document.createElement("option");
      option.value = category; option.textContent = category;
      select.appendChild(option);
    });
  }

  /* ---- media with real dimension checks ---- */
  function checkImage(inputId, file, done) {
    var expected = EXPECTED[inputId];
    var reader = new FileReader();
    reader.onload = function () {
      var image = new Image();
      image.onload = function () {
        var ok = !expected || (image.width === expected.width && image.height === expected.height);
        done({ name: file.name, width: image.width, height: image.height, ok: ok, preview: inputId === "aw-icon" && String(reader.result).length < 120000 ? String(reader.result) : null });
      };
      image.onerror = function () { done({ name: file.name, width: 0, height: 0, ok: false }); };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function bindUpload(inputId, faceId, checkId) {
    element(inputId).addEventListener("change", function () {
      var files = [].slice.call(this.files || []);
      var check = element(checkId);
      if (!files.length) { check.textContent = ""; delete media[inputId]; return; }
      if (inputId === "aw-shots") {
        if (files.length < 3 || files.length > 8) {
          check.textContent = "⚠️ Select between 3 and 8 screenshots (you chose " + files.length + ").";
          check.dataset.tone = "bad";
          delete media[inputId];
          return;
        }
        media[inputId] = { count: files.length, names: files.map(function (f) { return f.name; }), ok: true };
        check.textContent = "✅ " + files.length + " screenshots selected (dimensions verified at backend upload).";
        check.dataset.tone = "good";
        element(faceId).textContent = "📎 " + files.length + " screenshots selected";
        return;
      }
      checkImage(inputId, files[0], function (result) {
        media[inputId] = result;
        var expected = EXPECTED[inputId];
        check.textContent = result.ok
          ? "✅ " + result.name + " — " + result.width + "×" + result.height + " looks right."
          : "⚠️ " + result.name + " is " + result.width + "×" + result.height + " — expected " + expected.width + "×" + expected.height + ". You can still save the draft.";
        check.dataset.tone = result.ok ? "good" : "bad";
        element(faceId).textContent = "📎 " + result.name;
      });
    });
  }

  /* ---- features ---- */
  function addFeatureRow(value) {
    var wrap = document.createElement("label");
    wrap.className = "aw-feature-row";
    wrap.innerHTML = '<input class="aw-feature-input" maxlength="90" placeholder="Feature ' + (element("aw-features").children.length + 1) + '"><button type="button" class="team-mini-link danger aw-feature-remove">×</button>';
    wrap.querySelector("input").value = value || "";
    wrap.querySelector(".aw-feature-remove").addEventListener("click", function () { wrap.remove(); });
    element("aw-features").appendChild(wrap);
  }

  function featureValues() {
    return [].slice.call(document.querySelectorAll(".aw-feature-input"))
      .map(function (input) { return input.value.trim(); })
      .filter(Boolean);
  }

  /* ---- tags ---- */
  function renderTags() {
    element("aw-tags").innerHTML = tags.map(function (tag, index) {
      return '<span class="aw-tag-chip">' + escapeHTML(tag) + '<button type="button" data-tag-index="' + index + '" aria-label="Remove tag ' + escapeHTML(tag) + '">×</button></span>';
    }).join("");
  }
  function addTag(value) {
    var clean = value.trim().replace(/\s+/g, " ");
    if (!clean || tags.indexOf(clean) !== -1 || tags.length >= 10) return;
    tags.push(clean);
    renderTags();
  }

  /* ---- collect + save ---- */
  function collect() {
    var statusChoice = (document.querySelector('input[name="aw-status"]:checked') || {}).value || "draft";
    return {
      name: element("aw-name").value.trim(),
      shortDesc: element("aw-short").value.trim(),
      fullDesc: element("aw-full").value.trim(),
      category: element("aw-category").value,
      subCategory: element("aw-subcategory").value,
      difficulty: element("aw-difficulty").value,
      path: element("aw-path").value.trim(),
      version: element("aw-version").value.trim(),
      features: featureValues(),
      tags: tags.slice(),
      whatsNew: element("aw-whatsnew").value.trim(),
      statusChoice: statusChoice,
      scheduledFor: statusChoice === "schedule" && element("aw-schedule-date").value
        ? element("aw-schedule-date").value + "T" + (element("aw-schedule-time").value || "09:00")
        : null,
      featured: {
        staffPick: element("aw-staffpick").checked,
        trending: element("aw-trending").checked,
        websiteOfTheDay: element("aw-wotd").checked ? (element("aw-wotd-date").value || null) : null
      },
      media: media
    };
  }

  function validateForPublish(data) {
    var problems = [];
    if (!data.name) problems.push("Website name");
    if (!data.shortDesc) problems.push("Short description");
    if (!data.fullDesc) problems.push("Full description");
    if (!data.category) problems.push("Category");
    if (!data.path) problems.push("Page path or iframe URL");
    if (!data.version) problems.push("Version number");
    if (!media["aw-icon"]) problems.push("Website icon");
    if (!media["aw-card"]) problems.push("Card preview image");
    if (!media["aw-hero"]) problems.push("Hero screenshot");
    if (data.features.length < 3) problems.push("At least 3 key features");
    return problems;
  }

  function saveDraft(fromPublish) {
    var data = collect();
    if (!data.name) { setStatusLine("A website name is required even for a draft.", "signed-out"); return null; }
    var list = readJSON(DRAFTS_KEY, []);
    var record = {
      id: "draft-" + Date.now().toString(36),
      name: data.name,
      desc: data.shortDesc || data.fullDesc.slice(0, 120) || "Draft website",
      about: data.fullDesc,
      icon: media["aw-icon"] && media["aw-icon"].preview ? "🌐" : "🌐",
      iconPreview: media["aw-icon"] ? media["aw-icon"].preview || null : null,
      category: data.category || "Tools",
      subCategory: data.subCategory,
      difficulty: data.difficulty,
      siteUrl: data.path,
      version: data.version ? "v" + data.version.replace(/^v/i, "") + " — Draft" : "v0.1 — Draft",
      features: data.features,
      tags: data.tags,
      whatsNew: data.whatsNew,
      featured: data.featured,
      statusChoice: data.statusChoice,
      scheduledFor: data.scheduledFor,
      readyToPublish: Boolean(fromPublish),
      media: {
        icon: media["aw-icon"] ? { name: media["aw-icon"].name, ok: media["aw-icon"].ok } : null,
        card: media["aw-card"] ? { name: media["aw-card"].name, ok: media["aw-card"].ok } : null,
        hero: media["aw-hero"] ? { name: media["aw-hero"].name, ok: media["aw-hero"].ok } : null,
        screenshots: media["aw-shots"] ? media["aw-shots"].names : []
      },
      reviews: [],
      stars: "New",
      createdAt: new Date().toISOString()
    };
    list.push(record);
    writeJSON(DRAFTS_KEY, list);
    return record;
  }

  function handleSaveDraft() {
    var record = saveDraft(false);
    if (!record) return;
    setStatusLine("💾 Draft saved — it now appears in the All Websites manager as 📝 Draft (team-only).", "member");
    showToast("Draft \u201C" + record.name + "\u201D saved.");
  }

  function handlePublish() {
    var data = collect();
    var problems = validateForPublish(data);
    if (problems.length) {
      setStatusLine("Before publishing, complete: " + problems.join(" · ") + ".", "signed-out");
      return;
    }
    var record = saveDraft(true);
    if (!record) return;
    var scheduleNote = data.statusChoice === "schedule" && data.scheduledFor
      ? " Scheduled go-live is stored for " + new Date(data.scheduledFor).toLocaleString() + "."
      : "";
    setStatusLine("🚀 Publish-ready record saved with every requirement met." + scheduleNote + " Public launch happens through catalogue integration — the record is flagged ready-to-publish for that step; the public Archive is unchanged until then.", "member");
    showToast("\u201C" + record.name + "\u201D is publish-ready.");
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillCategories();
    bindCounter("aw-short", "aw-short-count");
    bindCounter("aw-full", "aw-full-count");
    bindUpload("aw-icon", "aw-icon-face", "aw-icon-check");
    bindUpload("aw-card", "aw-card-face", "aw-card-check");
    bindUpload("aw-hero", "aw-hero-face", "aw-hero-check");
    bindUpload("aw-shots", "aw-shots-face", "aw-shots-check");
    addFeatureRow(); addFeatureRow(); addFeatureRow();
    element("aw-add-feature").addEventListener("click", function () { addFeatureRow(); });
    element("aw-tag-input").addEventListener("keydown", function (event) {
      if (event.key === "Enter") { event.preventDefault(); addTag(this.value); this.value = ""; }
    });
    element("aw-tags").addEventListener("click", function (event) {
      var button = event.target.closest("[data-tag-index]");
      if (!button) return;
      tags.splice(Number(button.dataset.tagIndex), 1);
      renderTags();
    });
    document.querySelectorAll('input[name="aw-status"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        element("aw-schedule-row").hidden = this.value !== "schedule";
      });
    });
    element("aw-wotd").addEventListener("change", function () { element("aw-wotd-row").hidden = !this.checked; });
    element("head-save-draft").addEventListener("click", handleSaveDraft);
    element("foot-save-draft").addEventListener("click", handleSaveDraft);
    element("head-publish").addEventListener("click", handlePublish);
    element("foot-publish").addEventListener("click", handlePublish);
  });

  window.ParagonTeamAddWebsite = { collect: collect, validateForPublish: validateForPublish, addTag: addTag, getTags: function () { return tags.slice(); }, saveDraft: saveDraft, mediaState: media };
})();

}

/* ================= PAGE MODULE: analytics-users.js (runs only on analytics-users.html) ================= */
if (paragonTeamPage() === "analytics-users.html") {
(function () {
  "use strict";

  function readJSON(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || "null") || fallback; }
    catch (error) { return fallback; }
  }

  function deviceSignals() {
    var quizResults = readJSON("paragonQuiz.results.v1", []);
    var bestScores = readJSON("paragonQuiz.bestScores.v1", {});
    var guest = readJSON("paragonArchive.guestState.v1", {});
    var reviewCount = 0;
    Object.keys(guest.reviews || {}).forEach(function (siteName) {
      if (Array.isArray(guest.reviews[siteName])) reviewCount += guest.reviews[siteName].length;
    });
    var communityMember = false;
    try {
      for (var index = 0; index < window.localStorage.length; index += 1) {
        if ((window.localStorage.key(index) || "").indexOf("paragonCommunityMembership:") === 0) { communityMember = true; break; }
      }
    } catch (error) { /* blocked */ }
    return {
      quizPlays: quizResults.length,
      quizBests: Object.keys(bestScores).length,
      reviewsWritten: reviewCount,
      communityMember: communityMember
    };
  }

  function render() {
    if (typeof document === "undefined" || !document.getElementById("us-stats")) return;
    document.getElementById("us-stats").innerHTML =
      '<div class="team-stat-box"><b>—</b><span>Registered users · backend pending</span></div>' +
      '<div class="team-stat-box"><b>0</b><span>New today · real zero</span></div>' +
      '<div class="team-stat-box"><b>—</b><span>Active this week · backend pending</span></div>' +
      '<div class="team-stat-box"><b>—</b><span>Suspensions · backend pending</span></div>';

    var bars = [];
    for (var day = 29; day >= 0; day -= 1) {
      var date = new Date(); date.setDate(date.getDate() - day);
      bars.push('<span class="team-bar" style="height:4%" title="' + date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ': 0 signups (schema pending)"></span>');
    }
    document.getElementById("us-signup-chart").innerHTML = bars.join("");

    var signals = deviceSignals();
    document.getElementById("us-device-list").innerHTML =
      '<article class="team-site-card"><div class="team-site-main">' +
        '<div class="team-site-titleline"><b>🎯 Paragon Quiz plays</b><span class="team-status-chip st-live">REAL</span></div>' +
        '<p class="team-site-sub">' + signals.quizPlays + ' completed plays and ' + signals.quizBests + ' personal-best records saved on this device.</p>' +
      '</div></article>' +
      '<article class="team-site-card"><div class="team-site-main">' +
        '<div class="team-site-titleline"><b>⭐ Reviews written</b><span class="team-status-chip st-live">REAL</span></div>' +
        '<p class="team-site-sub">' + signals.reviewsWritten + ' user reviews written in the public Archive on this device.</p>' +
      '</div></article>' +
      '<article class="team-site-card"><div class="team-site-main">' +
        '<div class="team-site-titleline"><b>👥 Community membership</b><span class="team-status-chip st-live">REAL</span></div>' +
        '<p class="team-site-sub">' + (signals.communityMember ? "A community membership record exists on this device (join wizard completed)." : "No community membership on this device yet.") + '</p>' +
      '</div></article>';
  }

  function exportCSV() {
    var signals = deviceSignals();
    var lines = ["metric,value",
      "registered_users,backend pending — Supabase schema not yet run",
      "new_signups_today,0",
      "device_quiz_plays," + signals.quizPlays,
      "device_quiz_best_records," + signals.quizBests,
      "device_reviews_written," + signals.reviewsWritten,
      "device_community_member," + signals.communityMember,
      "exported_at," + new Date().toISOString(),
      "note,registered-user analytics activate after the schema runs and real people sign up"];
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "paragon-user-stats.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.getElementById("us-stats")) return;
      render();
      document.getElementById("us-export").addEventListener("click", exportCSV);
    });
  }

  window.ParagonTeamUserStats = { deviceSignals: deviceSignals };
})();

}

/* ================= PAGE MODULE: analytics-websites.js (runs only on analytics-websites.html) ================= */
if (paragonTeamPage() === "analytics-websites.html") {
(function () {
  "use strict";

  function sites() { return Array.isArray(window.ParagonSites) ? window.ParagonSites : []; }
  function metric(name, method) {
    try { return window.ParagonMetrics && window.ParagonMetrics[method] ? Number(window.ParagonMetrics[method](name)) || 0 : 0; }
    catch (error) { return 0; }
  }
  function needCount(siteName) {
    try {
      var map = JSON.parse(window.localStorage.getItem("paragonArchive.siteNeeds.v1") || "null") || {};
      return map[siteName] ? Number(map[siteName].count) || 0 : 0;
    } catch (error) { return 0; }
  }
  function deviceReviewCount(siteName) {
    try {
      var state = JSON.parse(window.localStorage.getItem("paragonArchive.guestState.v1") || "null") || {};
      var list = state.reviews && state.reviews[siteName];
      return Array.isArray(list) ? list.length : 0;
    } catch (error) { return 0; }
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function buildRows() {
    return sites().map(function (site) {
      return {
        name: site.name,
        category: site.category || "—",
        views: metric(site.name, "getViewCount"),
        views24: metric(site.name, "getViewsInLast24Hours"),
        reviews: (Array.isArray(site.reviews) ? site.reviews.length : 0) + deviceReviewCount(site.name),
        needs: needCount(site.name),
        progress: Number(site.buildProgress) || 0
      };
    });
  }

  function applyFilters(rows, filters) {
    var out = rows.slice();
    if (filters.category && filters.category !== "all") out = out.filter(function (r) { return r.category === filters.category; });
    if (filters.query) {
      var q = filters.query.toLowerCase();
      out = out.filter(function (r) { return r.name.toLowerCase().indexOf(q) !== -1; });
    }
    var key = { views: "views", views24: "views24", reviews: "reviews", progress: "progress", needs: "needs" }[filters.sort];
    if (key) out.sort(function (a, b) { return b[key] - a[key] || a.name.localeCompare(b.name); });
    else out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return out;
  }

  var lastRows = [];

  function render() {
    if (typeof document === "undefined" || !document.getElementById("ws-rows")) return;

    /* Developer scope note per the permissions matrix (View Website Stats = "own"). */
    var P = window.ParagonTeamPermissions;
    var role = P && P.getRole ? P.getRole() : "super-admin";
    var note = document.getElementById("ws-scope-note");
    if (role === "developer") {
      note.hidden = false;
      note.textContent = "🔎 Developer scope: the matrix grants you stats for YOUR OWN websites only. Backend claims enforce that scope at activation; no catalogue website belongs to a third-party developer yet, so the full honest table is shown read-only.";
    } else { note.hidden = true; }

    var rows = buildRows();
    var totalViews = rows.reduce(function (sum, r) { return sum + r.views; }, 0);
    var viewedCount = rows.filter(function (r) { return r.views > 0; }).length;
    var top = rows.slice().sort(function (a, b) { return b.views - a.views; })[0];
    document.getElementById("ws-stats").innerHTML =
      '<div class="team-stat-box"><b>' + rows.length + '</b><span>Websites</span></div>' +
      '<div class="team-stat-box"><b>' + totalViews + '</b><span>Views recorded (this device)</span></div>' +
      '<div class="team-stat-box"><b>' + viewedCount + '</b><span>Websites with views</span></div>' +
      '<div class="team-stat-box"><b>' + (top && top.views > 0 ? escapeHTML(top.name) : "—") + '</b><span>Most viewed</span></div>';

    var categorySelect = document.getElementById("ws-category");
    if (categorySelect.options.length === 1) {
      var seen = {};
      rows.forEach(function (r) { seen[r.category] = true; });
      Object.keys(seen).sort().forEach(function (category) {
        var option = document.createElement("option");
        option.value = category; option.textContent = category;
        categorySelect.appendChild(option);
      });
    }

    var filtered = applyFilters(rows, {
      category: categorySelect.value,
      sort: document.getElementById("ws-sort").value,
      query: document.getElementById("ws-search").value.trim()
    });
    lastRows = filtered;
    document.getElementById("ws-total").textContent = filtered.length + (filtered.length === 1 ? " website" : " websites");
    document.getElementById("ws-rows").innerHTML = filtered.map(function (r) {
      return "<tr><td><b>" + escapeHTML(r.name) + "</b></td><td>" + escapeHTML(r.category) + "</td>" +
        "<td>" + r.views + "</td><td>" + r.views24 + "</td><td>" + r.reviews + "</td><td>" + (r.needs || 0) + "</td>" +
        '<td><div class="team-mini-progress" title="' + r.progress + '% built"><span style="width:' + r.progress + '%"></span></div> ' + r.progress + "%</td></tr>";
    }).join("") || '<tr><td colspan="6">No websites match the filters.</td></tr>';
  }

  function exportCSV() {
    var lines = ["website,category,views_this_device,views_24h,reviews,needs_this_device,build_progress_percent"];
    lastRows.forEach(function (r) {
      lines.push('"' + r.name.replace(/"/g, '""') + '","' + r.category + '",' + r.views + "," + r.views24 + "," + r.reviews + "," + (r.needs || 0) + "," + r.progress);
    });
    lines.push("");
    lines.push("note,views are real device-recorded metrics; global cross-user stats activate with the production backend");
    lines.push("exported_at," + new Date().toISOString());
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "paragon-website-stats.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.getElementById("ws-rows")) return;
      render();
      document.getElementById("ws-export").addEventListener("click", exportCSV);
      ["ws-category", "ws-sort"].forEach(function (id) { document.getElementById(id).addEventListener("change", render); });
      document.getElementById("ws-search").addEventListener("input", render);
    });
  }

  window.ParagonTeamWebsiteStats = { buildRows: buildRows, applyFilters: applyFilters };
})();

}

/* ================= PAGE MODULE: analytics.js (runs only on analytics.html) ================= */
if (paragonTeamPage() === "analytics.html") {
(function () {
  "use strict";

  var COLORS = ["#2563eb", "#6d5efc", "#f59e0b", "#22c55e", "#ec4899", "#38bdf8", "#a78bfa", "#ef4444", "#84cc16", "#7c869f"];

  function element(id) { return document.getElementById(id); }
  function sites() { return Array.isArray(window.ParagonSites) ? window.ParagonSites : []; }
  function readJSON(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || "null") || fallback; }
    catch (error) { return fallback; }
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function pie(targetId, legendId, entries, emptyNote) {
    var total = entries.reduce(function (sum, entry) { return sum + entry.value; }, 0);
    var pieNode = element(targetId);
    var legend = element(legendId);
    if (!total) {
      pieNode.style.background = "repeating-conic-gradient(var(--border) 0deg 10deg, transparent 10deg 20deg)";
      legend.innerHTML = "<li>" + escapeHTML(emptyNote || "No data yet — honest zero.") + "</li>";
      return;
    }
    var cursor = 0;
    var stops = [];
    legend.innerHTML = entries.filter(function (entry) { return entry.value > 0; }).map(function (entry, index) {
      var color = COLORS[index % COLORS.length];
      var span = (entry.value / total) * 360;
      stops.push(color + " " + cursor + "deg " + (cursor + span) + "deg");
      cursor += span;
      return '<li><i style="background:' + color + '"></i>' + escapeHTML(entry.label) + " " + Math.round((entry.value / total) * 100) + "%</li>";
    }).join("");
    pieNode.style.background = "conic-gradient(" + stops.join(", ") + ")";
  }

  function line(svgId, values) {
    var svg = element(svgId);
    var max = Math.max(1, Math.max.apply(null, values));
    var step = 480 / Math.max(1, values.length - 1);
    var points = values.map(function (value, index) {
      return (index * step).toFixed(1) + "," + (112 - (value / max) * 100).toFixed(1);
    }).join(" ");
    svg.innerHTML = '<polyline fill="none" stroke="#6d5efc" stroke-width="2.5" points="' + points + '"/>' +
      values.map(function (value, index) {
        return '<circle cx="' + (index * step).toFixed(1) + '" cy="' + (112 - (value / max) * 100).toFixed(1) + '" r="3.5" fill="#2563eb"><title>Week ' + (index + 1) + ": " + value + '</title></circle>';
      }).join("");
  }

  function weeklyCounts(items, dateField) {
    var weeks = [];
    for (var week = 11; week >= 0; week -= 1) {
      var start = Date.now() - (week + 1) * 7 * 86400000;
      var end = Date.now() - week * 7 * 86400000;
      weeks.push(items.filter(function (item) {
        var at = Date.parse(item[dateField] || 0);
        return at >= start && at < end;
      }).length);
    }
    return weeks;
  }

  var summary = {};

  function build() {
    var rangeDays = Number(element("an-range").value) || 30;
    var quizResults = readJSON("paragonQuiz.results.v1", []);
    var reviews = sites().reduce(function (total, site) { return total + (Array.isArray(site.reviews) ? site.reviews.length : 0); }, 0);
    element("an-plays").textContent = String(quizResults.length);
    element("an-reviews").textContent = String(reviews);
    summary = { totalUsers: "backend pending", newToday: 0, totalPlays: quizResults.length, reviews: reviews, rangeDays: rangeDays };

    /* Users over time: real zeros with per-day hover labels */
    var bars = [];
    for (var day = rangeDays - 1; day >= 0; day -= 1) {
      var date = new Date(); date.setDate(date.getDate() - day);
      bars.push('<span class="team-bar" style="height:4%" title="' + date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ': 0 new users"></span>');
    }
    element("an-users-chart").innerHTML = bars.join("");

    /* Category popularity: real catalogue */
    var catCounts = {};
    sites().forEach(function (site) { catCounts[site.category] = (catCounts[site.category] || 0) + 1; });
    pie("an-cat-pie", "an-cat-legend", Object.keys(catCounts).map(function (category) { return { label: category, value: catCounts[category] }; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 9));

    /* Most visited: real recorded views, top 10 */
    var viewed = sites().map(function (site) {
      var views = 0;
      try { views = window.ParagonMetrics ? window.ParagonMetrics.getViewCount(site.name) : 0; } catch (error) { views = 0; }
      return { name: site.name, views: views };
    }).filter(function (entry) { return entry.views > 0; }).sort(function (a, b) { return b.views - a.views; }).slice(0, 10);
    var maxViews = viewed.length ? viewed[0].views : 1;
    element("an-top-sites").innerHTML = viewed.length
      ? viewed.map(function (entry, index) {
          return '<div class="an-hbar-row"><span class="an-hbar-name">' + escapeHTML(entry.name) + '</span><div class="an-hbar-track"><span style="width:' + Math.max(4, (entry.views / maxViews) * 100) + '%;background:' + COLORS[index % COLORS.length] + '"></span></div><b>' + entry.views + '</b></div>';
        }).join("")
      : '<p class="team-site-sub">No recorded views yet on this device — open websites in the Archive and this chart fills with real data.</p>';

    /* Weekly lines */
    line("an-users-week", new Array(12).fill(0));
    line("an-bugs-week", weeklyCounts(readJSON("paragonTeamBugs.v1", []), "reportedAt"));

    /* Ticket categories */
    var tickets = readJSON("paragonTeamTickets.v1", []);
    var topicCounts = {};
    tickets.forEach(function (ticket) { topicCounts[ticket.topic || ticket.subject] = (topicCounts[ticket.topic || ticket.subject] || 0) + 1; });
    pie("an-ticket-pie", "an-ticket-legend", Object.keys(topicCounts).map(function (topic) { return { label: topic, value: topicCounts[topic] }; }), "No tickets in the desk yet.");

    /* Requests by category */
    var requests = readJSON("paragonTeamRequests.v1", []);
    var reqCounts = {};
    requests.forEach(function (request) { reqCounts[request.category] = (reqCounts[request.category] || 0) + Number(request.count || 1); });
    pie("an-req-pie", "an-req-legend", Object.keys(reqCounts).map(function (category) { return { label: category, value: reqCounts[category] }; }), "No requests in the desk yet.");

    /* Deployed vs Paragon: real catalogue composition */
    var deployedCount = sites().filter(function (site) { return site.category === "Deployed"; }).length;
    pie("an-ratio-pie", "an-ratio-legend", [
      { label: "Paragon built", value: sites().length - deployedCount },
      { label: "Deployed third-party", value: deployedCount }
    ], "Catalogue empty.");
  }

  function exportCSV() {
    var lines = ["metric,value"];
    lines.push("total_users," + summary.totalUsers);
    lines.push("new_today," + summary.newToday);
    lines.push("total_quiz_plays_this_device," + summary.totalPlays);
    lines.push("catalogue_reviews," + summary.reviews);
    lines.push("catalogue_websites," + sites().length);
    lines.push("deployed_websites," + sites().filter(function (site) { return site.category === "Deployed"; }).length);
    lines.push("range_days," + summary.rangeDays);
    lines.push("exported_at," + new Date().toISOString());
    lines.push("note,user/device/country analytics activate with the production backend");
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "paragon-platform-analytics.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  document.addEventListener("DOMContentLoaded", function () {
    build();
    element("an-range").addEventListener("change", build);
    element("an-export").addEventListener("click", exportCSV);
  });

  window.ParagonTeamAnalytics = { build: build, weeklyCounts: weeklyCounts, exportCSV: exportCSV };
})();

}

/* ================= PAGE MODULE: announcements.js (runs only on announcements.html) ================= */
if (paragonTeamPage() === "announcements.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamAnnouncements.v1";
  var TYPE_META = {
    "new": { label: "🆕 NEW WEBSITE ADDED", cls: "st-live" },
    "updated": { label: "🔄 WEBSITE UPDATED", cls: "st-preview" },
    "maintenance": { label: "🔧 MAINTENANCE NOTICE", cls: "st-scheduled" },
    "special": { label: "🎉 SPECIAL ANNOUNCEMENT", cls: "st-draft" },
    "featured": { label: "⭐ FEATURED / PROMOTED", cls: "st-review" }
  };

  /* P-094 / D-174 — the four REAL launch-window announcements migrate from the old static
     data/updates.js into this managed desk, so the founder can edit or delete them from here
     exactly as if they had been composed here. Same records, same real dates, now manageable. */
  var SEED = [
    { id: "announcement-2026-08-18-backend-live", type: "special", siteName: null, title: "The Paragon backend went LIVE", message: "Database schema, Email + Google sign-in, and the community & developer tables are all live and probe-verified. Signed-in members' board posts now publish to the real backend.", linkUrl: null, image: null, imageName: null, status: "published", publishedAt: "2026-08-18T18:00:00+01:00", scheduledFor: null, createdAt: "2026-08-18T18:00:00+01:00", publishedBy: "Paragon Founder" },
    { id: "announcement-2026-08-18-community-board", type: "special", siteName: null, title: "The Community Board is open", message: "Members can post, comment, like, report and appeal — with a real moderation loop on the Team desk. Join through Account, then Paragon Community.", linkUrl: null, image: null, imageName: null, status: "published", publishedAt: "2026-08-18T17:00:00+01:00", scheduledFor: null, createdAt: "2026-08-18T17:00:00+01:00", publishedBy: "Paragon Founder" },
    { id: "announcement-2026-08-18-developer-portal", type: "special", siteName: null, title: "The Developer Portal is open", message: "Apply as a developer, pass the real 8-point review gate, and your website joins the public Deployed category.", linkUrl: null, image: null, imageName: null, status: "published", publishedAt: "2026-08-18T16:00:00+01:00", scheduledFor: null, createdAt: "2026-08-18T16:00:00+01:00", publishedBy: "Paragon Founder" },
    { id: "announcement-2026-08-04-catalogue-expansion", type: "special", siteName: null, title: "A larger Paragon collection is now available", message: "New productivity, education, creative, social, finance, lifestyle, entertainment, games, and developer experiences have joined the archive.", linkUrl: null, image: null, imageName: null, status: "published", publishedAt: "2026-08-04T03:15:00+01:00", scheduledFor: null, createdAt: "2026-08-04T03:15:00+01:00", publishedBy: "Paragon Founder" }
  ];

  var editingId = null;
  var pickedImage = null; /* data URL of the currently chosen composer image */
  var backendAvailable = false;

  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
  }
  function ensureSeed() {
    try {
      if (window.localStorage.getItem(STORE_KEY) === null) writeStore(SEED.slice());
    } catch (error) { /* blocked */ }
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }
  function element(id) { return document.getElementById(id); }

  var toastHandle = null;
  function showToast(text) {
    var toast = element("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3200);
  }
  function setLine(text, tone) {
    var line = element("ann-status-line");
    if (!line) return;
    line.hidden = !text;
    line.textContent = text || "";
    line.dataset.tone = tone || "info";
  }
  function setSyncChip(state) {
    var chip = element("ann-sync-chip");
    if (!chip) return;
    chip.hidden = !state;
    if (state === "live") { chip.textContent = "☁️ Live backend — edits reach every device"; chip.style.color = "#22c55e"; }
    if (state === "local") { chip.textContent = "📴 This device — run announcements-schema.sql + sign in for every-device sync"; chip.style.color = ""; }
  }

  /* ---- REAL image upload (P-094): resize to ≤900px wide JPEG data URL, stored with the record ---- */
  function readImageFile(file) {
    if (!file || typeof window.FileReader !== "function") return Promise.resolve(null);
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var dataUrl = String(reader.result || "");
        if (typeof document.createElement !== "function" || !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(dataUrl)) return resolve(dataUrl);
        var img = document.createElement("img");
        img.onload = function () {
          try {
            var maxSide = 900;
            var scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
            var canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round((img.width || 1) * scale));
            canvas.height = Math.max(1, Math.round((img.height || 1) * scale));
            var ctx = canvas.getContext && canvas.getContext("2d");
            if (!ctx) return resolve(dataUrl);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
          } catch (error) { resolve(dataUrl); }
        };
        img.onerror = function () { resolve(dataUrl); };
        img.src = dataUrl;
      };
      reader.onerror = function () { resolve(null); };
      reader.readAsDataURL(file);
    });
  }
  function showPickedImage(dataUrl, name) {
    var box = element("ann-image-preview");
    var thumb = element("ann-image-thumb");
    var label = element("ann-image-name");
    if (!box || !thumb) return;
    if (dataUrl) {
      thumb.src = dataUrl;
      if (label) label.textContent = name || "announcement image";
      box.hidden = false;
    } else {
      box.hidden = true;
    }
  }

  function normalizeLink(raw) {
    var value = String(raw || "").trim();
    if (!value) return "";
    if (!/^https?:\/\//i.test(value)) value = "https://" + value;
    try { new URL(value); return value; } catch (error) { return ""; }
  }

  function currentType() {
    return (document.querySelector('input[name="ann-type"]:checked') || {}).value || "new";
  }

  function collect() {
    var whenChoice = (document.querySelector('input[name="ann-when"]:checked') || {}).value || "now";
    var type = currentType();
    return {
      type: type,
      title: element("ann-title").value.trim(),
      message: element("ann-message").value.trim(),
      linkUrl: type === "special" ? normalizeLink(element("ann-link") ? element("ann-link").value : "") : "",
      image: pickedImage,
      imageName: pickedImage ? (element("ann-image") && element("ann-image").files && element("ann-image").files[0] ? element("ann-image").files[0].name : "announcement.jpg") : null,
      whenChoice: whenChoice,
      scheduledFor: whenChoice === "schedule" && element("ann-date") && element("ann-date").value ? element("ann-date").value + "T" + (element("ann-time") || { value: "09:00" }).value : null
    };
  }

  function validate(data) {
    var problems = [];
    if (!data.title) problems.push("a title");
    if (!data.message) problems.push("a message");
    if (data.whenChoice === "schedule" && !data.scheduledFor) problems.push("a schedule date");
    if (data.scheduledFor && !Number.isNaN(Date.parse(data.scheduledFor)) && Date.parse(data.scheduledFor) < Date.now() - 60000) problems.push("a schedule time in the future");
    return problems;
  }

  function bindSitePicker() {
    var select = document.getElementById("ann-site");
    if (!select || select.dataset.filled) return;
    (window.ParagonSites || []).slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (site) {
      var option = document.createElement("option");
      option.value = site.name; option.textContent = site.icon + " " + site.name;
      select.appendChild(option);
    });
    select.dataset.filled = "true";
  }
  function toggleTypeRows() {
    var type = currentType();
    var siteRow = document.getElementById("ann-site-row");
    var linkRow = document.getElementById("ann-link-row");
    if (siteRow) siteRow.style.display = type === "special" ? "none" : "flex"; // special announcements need no website — title + message (+ optional link/image) only
    if (linkRow) linkRow.hidden = type !== "special"; // link pill is special-only (P-094)
  }

  /* ---- Effective status: scheduled records go live automatically when due (P-094) ---- */
  function isDue(record) {
    return record.status === "scheduled" && record.scheduledFor && Date.parse(record.scheduledFor) <= Date.now();
  }
  function promoteDue(list) {
    var promoted = false;
    list.forEach(function (record) {
      if (isDue(record)) { record.status = "published"; record.publishedAt = record.scheduledFor; promoted = true; }
    });
    if (promoted) writeStore(list);
    return promoted;
  }

  function save(status) {
    bindSitePicker();
    var data = collect();
    data.siteName = currentType() === "special" ? null : ((document.getElementById("ann-site") || {}).value || null);
    if (data.siteName === "") data.siteName = null;
    var problems = validate(data);
    if (data.type !== "special" && !data.siteName) problems.push("a website (site-linked update types must point at a real website)");
    if (data.type === "special" && data.linkUrl === "" && element("ann-link") && element("ann-link").value.trim()) problems.push("a valid link URL (check the address)");
    if (problems.length) { setLine("Add " + problems.join(", ") + " first.", "signed-out"); return null; }
    var list = readStore();
    var record;
    if (editingId) {
      record = list.filter(function (entry) { return entry.id === editingId; })[0];
      if (record) Object.assign(record, data, { image: data.image || null, imageName: data.imageName || null, linkUrl: data.linkUrl || null });
      editingId = null;
    }
    if (!record) {
      record = Object.assign({ id: "ann-" + Date.now().toString(36), createdAt: new Date().toISOString(), publishedBy: "Paragon Team (this device)" }, data);
      list.push(record);
    }
    record.status = data.whenChoice === "schedule" ? "scheduled" : status;
    if (record.status === "published") record.publishedAt = new Date().toISOString();
    writeStore(list);
    pushBackend(record);
    clearForm();
    render();
    return record;
  }

  function clearForm() {
    pickedImage = null;
    element("ann-title").value = "";
    element("ann-message").value = "";
    if (element("ann-link")) element("ann-link").value = "";
    element("ann-image").value = "";
    showPickedImage(null);
    setLine("", "info");
  }

  function when(iso) {
    var date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) + " " + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  function countdown(iso) {
    var ms = Date.parse(iso) - Date.now();
    if (Number.isNaN(ms) || ms <= 0) return "due now";
    var minutes = Math.round(ms / 60000);
    if (minutes < 60) return "live in ~" + minutes + " min";
    var hours = Math.floor(minutes / 60);
    if (hours < 48) return "live in ~" + hours + " h";
    return "live in ~" + Math.round(hours / 24) + " days";
  }

  function cardMarkup(record) {
    var type = TYPE_META[record.type] || TYPE_META.special;
    var stamp = record.status === "published" ? "Published: " + when(record.publishedAt)
      : record.status === "scheduled" ? "⏰ Scheduled: " + when(record.scheduledFor) + " · " + countdown(record.scheduledFor)
      : "Draft";
    return '<article class="team-site-row ' + type.cls + '">' +
      '<div class="team-site-copy">' +
        '<div class="team-site-title"><span class="team-site-badge ' + type.cls + '">' + type.label + '</span><span class="team-site-cat">' + stamp + '</span>' + (record.siteName ? '<span class="team-site-cat">🌐 ' + escapeHTML(record.siteName) + '</span>' : "") + '</div>' +
        '<div class="team-site-sub"><strong>' + escapeHTML(record.title) + '</strong></div>' +
        '<div class="team-site-sub">' + escapeHTML(record.message) + '</div>' +
        '<div class="team-site-sub">Published by: ' + escapeHTML(record.publishedBy || "—") +
          (record.image ? ' · <span class="ann-thumb-inline"><img src="' + record.image + '" alt=""></span> image attached' : "") +
          (record.linkUrl ? ' · 🔗 ' + escapeHTML(record.linkUrl) : "") +
        '</div>' +
      '</div>' +
      '<div class="team-site-actions">' +
        '<button type="button" class="team-mini-link" data-anact="edit" data-id="' + record.id + '">Edit</button>' +
        '<button type="button" class="team-mini-link" data-anact="preview" data-id="' + record.id + '">Preview</button>' +
        '<button type="button" class="team-mini-link danger" data-anact="delete" data-id="' + record.id + '">Delete</button>' +
        (record.status !== "published" ? '<button type="button" class="team-mini-link" data-anact="publishnow" data-id="' + record.id + '">Publish Now</button>' : "") +
        '<a class="team-mini-link" href="../paragon-archive.html#updates">View on Archive</a>' +
      '</div>' +
    '</article>';
  }

  var EMPTY_ART = '<img class="team-empty-art" src="../assets/illustrations/empty-updates.png" alt="" loading="lazy">';

  function render() {
    var list = readStore();
    promoteDue(list);
    var published = list.filter(function (record) { return record.status === "published"; }).sort(function (a, b) { return Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0); });
    var pending = list.filter(function (record) { return record.status !== "published"; });
    element("ann-published").innerHTML = published.length ? published.map(cardMarkup).join("") : EMPTY_ART + '<p class="team-site-sub">No published announcements yet. Published records go straight into the public Updates feed — nothing fake is posted.</p>';
    element("ann-drafts").innerHTML = pending.length ? pending.map(cardMarkup).join("") : EMPTY_ART + '<p class="team-site-sub">No drafts or scheduled announcements.</p>';
  }

  /* ---- Preview: the card EXACTLY as the public Updates feed renders it (P-094) ---- */
  function publicCardMarkup(record) {
    var badges = { "new": ["🆕 New", "badge-green"], "updated": ["🔄 Updated", "badge-blue"], "maintenance": ["🔧 Maintenance", "badge-orange"], "special": ["🎉 Announcement", "badge-purple"], "featured": ["✨ Featured/Promoted", "badge-gold"] };
    var badge = badges[record.type] || badges.special;
    var whenText = record.status === "scheduled" ? "Scheduled: " + when(record.scheduledFor) : "Public feed · " + when(record.publishedAt || new Date().toISOString());
    var linkedSite = record.siteName && window.ParagonSites ? window.ParagonSites.filter(function (s) { return s.name === record.siteName; })[0] : null;
    var siteIconPath = linkedSite ? ("../assets/site-icons/paragon-" + linkedSite.name.replace(/^Paragon\s+/, "").toLowerCase().replace(/\s+/g, "-") + ".png") : "";
    return '<div class="ann-public-preview">' +
      '<div class="ann-public-preview-note">This is exactly how archive users will see it in Updates:</div>' +
      '<article class="timeline-entry ann-preview-entry"><div class="timeline-card" style="margin:0;">' +
        '<div class="t-thumb">' + (record.image
          ? '<img class="t-image-art" src="' + record.image + '" alt="">'
          : (siteIconPath
              ? '<img src="' + siteIconPath + '" alt="" onerror="this.remove()">'
              : '<span class="timeline-event-icon">🎉</span>')) + '</div>' +
        '<div class="t-body">' +
          '<div class="t-head"><span class="update-badge ' + badge[1] + '">' + badge[0] + '</span></div>' +
          '<div class="t-title">' + escapeHTML(record.title) + '</div>' +
          '<div class="t-sub">' + escapeHTML(record.message) + '</div>' +
          '<div class="t-foot"><time>' + whenText + '</time>' +
            (record.siteName ? '<a href="#" onclick="return false;">Open</a>' : "") +
            (record.linkUrl ? '<a class="timeline-link-pill" href="' + escapeHTML(record.linkUrl) + '" target="_blank" rel="noopener noreferrer">Link</a>' : "") +
            (!record.siteName && !record.linkUrl ? '<span class="timeline-info-label">Archive-wide</span>' : "") +
          '</div>' +
        '</div>' +
      '</div></article>' +
      (record.image ? '<div class="ann-public-preview-note">🖼️ The image replaces the website icon in the feed. Tapping it opens the full-size view with a download button.</div>' : "") +
      (record.linkUrl ? '<div class="ann-public-preview-note">🔗 The LINK pill sits beside OPEN with the same style and opens: ' + escapeHTML(record.linkUrl) + '</div>' : "") +
    '</div>';
  }
  function openPreview(record) {
    var body = element("ann-preview-body");
    if (!body) return;
    body.innerHTML = publicCardMarkup(record);
    element("ann-preview-modal").style.display = "flex";
  }

  /* ---- Optional live backend sync (P-094): owner signs in with the Paragon account on this
         device; team-member RLS then allows this desk to read/write paragon_announcements so
         edits reach EVERY device. Without it the desk stays honest device-local. ---- */
  function backendBase() {
    var config = window.ParagonConfig || {};
    return config.supabaseUrl || "";
  }
  function authHeaders() {
    var session = window.ParagonAuth && typeof window.ParagonAuth.getSession === "function" ? window.ParagonAuth.getSession() : null;
    var token = session && session.access_token;
    var anon = (window.ParagonConfig || {}).supabaseAnonKey;
    if (!token || !anon) return null;
    return { apikey: anon, Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }
  function toRow(record) {
    return { id: record.id, type: record.type, site_name: record.siteName, title: record.title, message: record.message, image_url: record.image, link_url: record.linkUrl || null, status: record.status, publish_at: record.scheduledFor, published_at: record.status === "published" ? (record.publishedAt || new Date().toISOString()) : null, published_by: record.publishedBy };
  }
  function pushBackend(record) {
    if (!backendAvailable) return;
    var headers = authHeaders();
    if (!headers || typeof window.fetch !== "function") return;
    window.fetch(backendBase() + "/rest/v1/paragon_announcements?id=eq." + encodeURIComponent(record.id), {
      method: "PUT", headers: headers, body: JSON.stringify(toRow(record)), "Prefer": "resolution=merge-duplicates"
    }).then(function () { setSyncChip("live"); }).catch(function () { setSyncChip("local"); });
  }
  function deleteBackend(id) {
    if (!backendAvailable) return;
    var headers = authHeaders();
    if (!headers || typeof window.fetch !== "function") return;
    window.fetch(backendBase() + "/rest/v1/paragon_announcements?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: headers }).catch(function () {});
  }
  function tryBackend() {
    var headers = authHeaders();
    if (!headers || typeof window.fetch !== "function" || !backendBase()) { setSyncChip("local"); return; }
    window.fetch(backendBase() + "/rest/v1/paragon_announcements?select=*&order=published_at.desc&limit=200", { headers: headers })
      .then(function (response) {
        if (!response.ok) throw new Error("backend " + response.status);
        return response.json();
      })
      .then(function (rows) {
        backendAvailable = true;
        setSyncChip("live");
        /* mirror backend truth into the local store so the public feed + offline view stay current */
        var list = readStore().filter(function (record) { return !rows.some(function (row) { return row.id === record.id; }); });
        rows.forEach(function (row) {
          list.push({ id: row.id, type: row.type, siteName: row.site_name, title: row.title, message: row.message, linkUrl: row.link_url, image: row.image_url, imageName: row.image_url ? "backend image" : null, status: row.status, publishedAt: row.published_at, scheduledFor: row.publish_at, createdAt: row.published_at || row.publish_at || new Date().toISOString(), publishedBy: row.published_by || "Paragon Founder" });
        });
        writeStore(list);
        render();
      })
      .catch(function () { setSyncChip("local"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureSeed();
    render();
    tryBackend();
    bindPublicFeed();
    window.setInterval(render, 30000); /* scheduled records flip to live automatically while the desk is open */
    document.querySelectorAll('input[name="ann-when"]').forEach(function (radio) {
      radio.addEventListener("change", function () { element("ann-schedule-row").hidden = this.value !== "schedule"; });
    });
    document.querySelectorAll('input[name="ann-type"]').forEach(function (radio) { radio.addEventListener("change", toggleTypeRows); });
    bindSitePicker();
    toggleTypeRows();

    element("ann-image").addEventListener("change", function () {
      var file = this.files && this.files[0];
      if (!file) { showPickedImage(null); return; }
      if (file.size > 8 * 1024 * 1024) { setLine("That image is too large — pick one under 8 MB.", "signed-out"); this.value = ""; return; }
      readImageFile(file).then(function (dataUrl) {
        pickedImage = dataUrl;
        showPickedImage(dataUrl, file.name + " (auto-compressed for the feed)");
      });
    });
    element("ann-image-remove").addEventListener("click", function () {
      pickedImage = null;
      element("ann-image").value = "";
      showPickedImage(null);
    });

    element("ann-new-btn").addEventListener("click", function () { element("ann-title").focus(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    element("ann-preview-btn").addEventListener("click", function () {
      var data = collect();
      var problems = validate(data);
      if (problems.length) { setLine("Add " + problems.join(", ") + " first.", "signed-out"); return; }
      data.siteName = currentType() === "special" ? null : ((document.getElementById("ann-site") || {}).value || null);
      data.status = data.whenChoice === "schedule" ? "scheduled" : "published";
      if (data.status === "published") data.publishedAt = new Date().toISOString();
      openPreview(data);
    });
    ["ann-preview-close", "ann-preview-cancel"].forEach(function (id) {
      element(id).addEventListener("click", function () { element("ann-preview-modal").style.display = "none"; });
    });
    element("ann-preview-publish").addEventListener("click", function () {
      element("ann-preview-modal").style.display = "none";
      var record = save("published");
      if (record) showToast(record.status === "scheduled" ? "Scheduled for " + when(record.scheduledFor) + " — goes live automatically." : "Published — live in the public Updates feed" + (backendAvailable ? " on every device." : " on this device."));
    });
    element("ann-draft-btn").addEventListener("click", function () {
      if (save("draft")) showToast("Draft saved.");
    });
    element("ann-publish-btn").addEventListener("click", function () {
      var record = save("published");
      if (record) showToast(record.status === "scheduled" ? "Scheduled for " + when(record.scheduledFor) + " — goes live automatically." : "Published — live in the public Updates feed" + (backendAvailable ? " on every device." : " on this device."));
    });
    document.body.addEventListener("click", function (event) {
      var button = event.target.closest("[data-anact]");
      if (!button) return;
      var id = button.dataset.id;
      var list = readStore();
      var record = list.filter(function (entry) { return entry.id === id; })[0];
      if (!record) return;
      if (button.dataset.anact === "delete") {
        if (!window.ParagonTeamConfirm) return; // no modal system — refuse destructive action
        window.ParagonTeamConfirm({ icon: "🗑️", title: "Delete announcement", lines: ["“" + record.title + "” disappears from the public Updates feed too.", "This cannot be undone."], confirmLabel: "Delete", danger: true }).then(function (confirmed) {
          if (!confirmed.ok) return;
          writeStore(list.filter(function (entry) { return entry.id !== id; }));
          deleteBackend(id);
          render();
          showToast("Announcement deleted — removed from the public feed.");
        });
        return;
      }
      if (button.dataset.anact === "preview") { openPreview(record); return; }
      if (button.dataset.anact === "edit") {
        editingId = id;
        element("ann-title").value = record.title;
        element("ann-message").value = record.message;
        if (element("ann-link")) element("ann-link").value = record.linkUrl || "";
        var typeInput = document.querySelector('input[name="ann-type"][value="' + record.type + '"]');
        if (typeInput) typeInput.checked = true;
        bindSitePicker();
        if (record.siteName && element("ann-site")) element("ann-site").value = record.siteName;
        pickedImage = record.image || null;
        showPickedImage(record.image || null, record.imageName);
        toggleTypeRows();
        if (record.status === "scheduled" && element("ann-date")) {
          var scheduleRadio = document.querySelector('input[name="ann-when"][value="schedule"]');
          if (scheduleRadio) scheduleRadio.checked = true;
          element("ann-schedule-row").hidden = false;
          var parsed = new Date(record.scheduledFor);
          if (!Number.isNaN(parsed.getTime())) {
            element("ann-date").value = parsed.toISOString().slice(0, 10);
            element("ann-time").value = parsed.toISOString().slice(11, 16);
          }
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        setLine("Editing “" + record.title + "” — Save Draft or Publish applies your changes.", "eligible");
        return;
      }
      if (button.dataset.anact === "publishnow") {
        record.status = "published";
        record.publishedAt = new Date().toISOString();
        writeStore(list);
        pushBackend(record);
        render();
        showToast("Published — live in the public Updates feed" + (backendAvailable ? " on every device." : " on this device."));
      }
    });
  });

  /* ================= P-096 — PUBLIC FEED A–Z MANAGER =================
     Mirrors app.js buildUpdateEvents 1:1 (same ids) and lets the Team edit any entry's
     wording or hide it from the public Updates feed + notifications. */
  var OVERRIDE_KEY = "paragonTeamUpdateOverrides.v1";
  var FEED_TYPE_META = {
    "new": { badge: "🆕 New", cls: "badge-green" },
    "updated": { badge: "🔄 Updated", cls: "badge-blue" },
    "maintenance": { badge: "🔧 Maintenance", cls: "badge-orange" },
    "announcement": { badge: "🎉 Announcement", cls: "badge-purple" },
    "featured": { badge: "✨ Featured", cls: "badge-gold" }
  };
  function readOverrides() {
    try { return JSON.parse(window.localStorage.getItem(OVERRIDE_KEY) || "null") || { suppressed: {}, text: {} }; }
    catch (error) { return { suppressed: {}, text: {} }; }
  }
  function writeOverrides(map) {
    try { window.localStorage.setItem(OVERRIDE_KEY, JSON.stringify(map)); } catch (error) { /* blocked */ }
  }
  function parseVersionDate(version) {
    var match = String(version || "").match(/—\s*([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})/);
    var parsed = match ? new Date(match[1]) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
  }
  function buildPublicFeed() {
    var events = [];
    var REALLY_UPDATED = ["Paragon Quiz", "Paragon Archive Hub"]; // P-092 truth — same as app.js
    (window.ParagonSites || []).forEach(function (site) {
      var added = new Date(site.addedAt);
      if (!Number.isNaN(added.getTime())) events.push({ id: "new-" + site.name, type: "new", title: site.name, desc: "Added to " + site.category + " · " + site.desc, date: added, siteName: site.name });
      var versionDate = parseVersionDate(site.version);
      if (versionDate && Array.isArray(site.updates) && site.updates.length && REALLY_UPDATED.indexOf(site.name) !== -1) {
        events.push({ id: "updated-" + site.name + "-" + site.version, type: "updated", title: site.name + " · " + String(site.version).split(" — ")[0], desc: site.updates.join(" · "), date: versionDate, siteName: site.name });
      }
    });
    readStore().forEach(function (record) {
      if (!isDue(record) && record.status !== "published") return;
      if (record.status !== "published" && !isDue(record)) return;
      var typeMap = { "new": "new", "updated": "updated", "maintenance": "maintenance", "special": "announcement", "featured": "featured" };
      var date = new Date(record.status === "scheduled" ? record.scheduledFor : record.publishedAt);
      if (Number.isNaN(date.getTime())) return;
      events.push({ id: "team-" + record.id, announcementId: record.id, type: typeMap[record.type] || "announcement", title: record.title, desc: record.message, date: date, siteName: record.siteName || null });
    });
    var overrides = readOverrides();
    return events
      .map(function (event) {
        var edit = overrides.text && overrides.text[event.id];
        if (edit) event = Object.assign({}, event, { title: edit.title || event.title, desc: edit.desc || event.desc, edited: true });
        event.hidden = Boolean(overrides.suppressed && overrides.suppressed[event.id]);
        return event;
      })
      .sort(function (a, b) { return b.date - a.date; });
  }
  function feedRowMarkup(event) {
    var meta = FEED_TYPE_META[event.type] || FEED_TYPE_META.announcement;
    var when = event.date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return '<article class="team-site-row ' + (event.hidden ? "st-archived" : meta.cls) + '" style="opacity:' + (event.hidden ? "0.55" : "1") + ';">' +
      '<div class="team-site-copy">' +
        '<div class="team-site-title"><span class="team-site-badge ' + meta.cls + '">' + meta.badge + '</span>' + (event.siteName ? '<span class="team-site-cat">🌐 ' + escapeHTML(event.siteName) + '</span>' : '<span class="team-site-cat">Archive-wide</span>') + '<span class="team-site-cat">' + when + '</span>' + (event.edited ? '<span class="team-site-cat" style="color:#22c55e;">✏️ team-edited</span>' : "") + (event.hidden ? '<span class="team-site-cat" style="color:#ef4444;">🚫 hidden from public</span>' : "") + '</div>' +
        '<div class="team-site-sub"><strong>' + escapeHTML(event.title) + '</strong></div>' +
        '<div class="team-site-sub">' + escapeHTML(event.desc) + '</div>' +
      '</div>' +
      '<div class="team-site-actions">' +
        '<button type="button" class="team-mini-link" data-feedact="edit" data-id="' + escapeHTML(event.id) + '">Edit wording</button>' +
        (event.hidden
          ? '<button type="button" class="team-mini-link" data-feedact="restore" data-id="' + escapeHTML(event.id) + '">Restore to public</button>'
          : '<button type="button" class="team-mini-link danger" data-feedact="hide" data-id="' + escapeHTML(event.id) + '">Hide from public</button>') +
        (event.announcementId ? '<button type="button" class="team-mini-link" data-feedact="openann" data-id="' + escapeHTML(event.announcementId) + '">Full editor</button>' : "") +
      '</div>' +
    '</article>';
  }
  function renderPublicFeed() {
    var box = element("ann-feed");
    if (!box) return;
    var term = (element("feed-search") ? element("feed-search").value : "").trim().toLowerCase();
    var events = buildPublicFeed().filter(function (event) {
      return !term || (event.title + " " + event.desc + " " + (event.siteName || "")).toLowerCase().indexOf(term) !== -1;
    });
    box.innerHTML = events.length ? events.slice(0, 60).map(feedRowMarkup).join("") + (buildPublicFeed().length > 60 ? '<p class="team-site-sub">Showing the newest 60 of ' + buildPublicFeed().length + ' — use the filter to reach the rest.</p>' : "") : '<p class="team-site-sub">No feed entries match.</p>';
  }
  function bindPublicFeed() {
    var box = element("ann-feed");
    if (!box) return;
    element("feed-search").addEventListener("input", renderPublicFeed);
    box.addEventListener("click", function (event) {
      var button = event.target.closest("[data-feedact]");
      if (!button) return;
      var overrides = readOverrides();
      var id = button.dataset.id;
      if (button.dataset.feedact === "hide") {
        overrides.suppressed = overrides.suppressed || {};
        overrides.suppressed[id] = true;
        writeOverrides(overrides); renderPublicFeed(); showToast("Hidden from the public Updates feed.");
        return;
      }
      if (button.dataset.feedact === "restore") {
        if (overrides.suppressed) delete overrides.suppressed[id];
        writeOverrides(overrides); renderPublicFeed(); showToast("Restored to the public Updates feed.");
        return;
      }
      if (button.dataset.feedact === "openann") {
        document.querySelector('[data-anact="edit"][data-id="' + button.dataset.id + '"]')?.click();
        return;
      }
      if (button.dataset.feedact === "edit") {
        if (!window.ParagonTeamPrompt) { showToast("Prompt system unavailable."); return; }
        window.ParagonTeamPrompt({ icon: "✏️", title: "Edit public wording", fields: [{ name: "title", label: "Title", value: button.closest(".team-site-row").querySelector(".team-site-sub strong").textContent }, { name: "desc", label: "Description", value: button.closest(".team-site-row").querySelectorAll(".team-site-sub")[1].textContent }], confirmLabel: "Save wording" }).then(function (result) {
          if (!result.ok) return;
          overrides.text = overrides.text || {};
          overrides.text[id] = { title: String(result.values.title || "").trim(), desc: String(result.values.desc || "").trim() };
          writeOverrides(overrides);
          renderPublicFeed();
          showToast("Wording updated — live in the public Updates feed.");
        });
      }
    });
    renderPublicFeed();
  }

  window.ParagonTeamAnnouncements = { readStore: readStore, writeStore: writeStore, TYPE_META: TYPE_META, collect: collect, validate: validate, ensureSeed: ensureSeed, isDue: isDue, SEED: SEED, buildPublicFeed: buildPublicFeed };
})();

}
/* ================= PAGE MODULE: applications.js (runs only on applications.html) ================= */
if (paragonTeamPage() === "applications.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamApplications.v1";
  var STATUS_META = {
    pending: { label: "🟡 Pending", cls: "st-scheduled" },
    review: { label: "🔵 Under Review", cls: "st-preview" },
    accepted: { label: "✅ Accepted", cls: "st-live" },
    rejected: { label: "❌ Rejected", cls: "st-archived" }
  };
  var EXP_META = { beginner: "🌱 Beginner", intermediate: "🌿 Intermediate", expert: "🌳 Expert" };

  var EXAMPLES = [
    { id: "app-jdev", illustrative: true, username: "JohnDev", email: "johndev@example.com", portfolio: "https://example.com/johndev", experience: "intermediate", skills: "HTML, CSS, JavaScript, Vue", pitch: "I want to publish My Cool App — a productivity tool I built for students.", submittedAt: "2027-01-08T10:00:00Z", status: "pending", decision: null },
    { id: "app-amina", illustrative: true, username: "AminaCodes", email: "amina@example.com", portfolio: "https://example.com/amina", experience: "expert", skills: "React, Node, PostgreSQL, security review", pitch: "Full-stack developer from Abuja. I'd like to bring two finished tools to the Deployed category.", submittedAt: "2027-01-11T14:30:00Z", status: "review", decision: null },
    { id: "app-tunde", illustrative: true, username: "TundeBuilds", email: "tunde@example.com", portfolio: "", experience: "beginner", skills: "HTML, CSS", pitch: "Learning to code, want to share my first game.", submittedAt: "2027-01-13T09:15:00Z", status: "pending", decision: null }
  ];

  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
  }
  function updateApplication(list, id, mutate) {
    var app = list.filter(function (entry) { return entry.id === id; })[0];
    if (!app) return list;
    mutate(app);
    writeStore(list);
    return list;
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
    window.setTimeout(function () { toast.hidden = true; }, 3200);
  }
  function allowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return !!P.can(P.getRole ? P.getRole() : "super-admin", action);
  }

  function applyFilters(list, filters) {
    var out = list.slice();
    if (filters.status && filters.status !== "all") out = out.filter(function (a) { return a.status === filters.status; });
    if (filters.experience && filters.experience !== "all") out = out.filter(function (a) { return a.experience === filters.experience; });
    if (filters.query) {
      var q = filters.query.toLowerCase();
      out = out.filter(function (a) {
        return (a.username + " " + a.email + " " + a.skills + " " + a.pitch).toLowerCase().indexOf(q) !== -1;
      });
    }
    out.sort(function (a, b) {
      var d = Date.parse(b.submittedAt || 0) - Date.parse(a.submittedAt || 0);
      return filters.sort === "oldest" ? -d : d;
    });
    return out;
  }

  function stats(list) {
    return {
      total: list.length,
      pending: list.filter(function (a) { return a.status === "pending"; }).length,
      review: list.filter(function (a) { return a.status === "review"; }).length,
      accepted: list.filter(function (a) { return a.status === "accepted"; }).length,
      rejected: list.filter(function (a) { return a.status === "rejected"; }).length
    };
  }

  /* ---------- rendering (browser only) ---------- */
  function render() {
    if (typeof document === "undefined" || !document.getElementById("app-list")) return;
    var list = readStore();
    var s = stats(list);
    document.getElementById("app-stats").innerHTML =
      '<div class="team-stat-box"><b>' + s.total + '</b><span>Total</span></div>' +
      '<div class="team-stat-box"><b>' + s.pending + '</b><span>🟡 Pending</span></div>' +
      '<div class="team-stat-box"><b>' + s.review + '</b><span>🔵 In Review</span></div>' +
      '<div class="team-stat-box"><b>' + s.accepted + '</b><span>✅ Accepted</span></div>' +
      '<div class="team-stat-box"><b>' + s.rejected + '</b><span>❌ Rejected</span></div>';

    var filtered = applyFilters(list, {
      status: document.getElementById("app-status").value,
      experience: document.getElementById("app-experience").value,
      sort: document.getElementById("app-sort").value,
      query: document.getElementById("app-search").value.trim()
    });
    document.getElementById("app-total").textContent = filtered.length + (filtered.length === 1 ? " application" : " applications");

    var container = document.getElementById("app-list");
    if (!filtered.length) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-icon">💼</div><h3>No developer applications</h3>' +
        '<p>Real applications arrive when the Deployed developer backend opens. This queue never shows fake applicants — load the labelled illustrative examples to try the workflow.</p></div>';
      return;
    }
    var canAccept = allowed("Accept Developer Applications");
    container.innerHTML = filtered.map(function (app) {
      var meta = STATUS_META[app.status] || STATUS_META.pending;
      return '<article class="team-site-card" data-id="' + escapeHTML(app.id) + '">' +
        '<div class="team-site-main">' +
          '<div class="team-site-titleline"><b>@' + escapeHTML(app.username) + '</b>' +
            '<span class="team-status-chip ' + meta.cls + '">' + meta.label + '</span>' +
            (app.illustrative ? '<span class="team-status-chip st-preview">🧪 illustrative example</span>' : "") +
          '</div>' +
          '<p class="team-site-sub">' + escapeHTML(EXP_META[app.experience] || app.experience) + " · " + escapeHTML(app.email) +
            (app.portfolio ? ' · <a href="' + escapeHTML(app.portfolio) + '" target="_blank" rel="noopener">Portfolio ↗</a>' : " · No portfolio") + '</p>' +
          '<p class="team-site-sub">🛠️ ' + escapeHTML(app.skills) + '</p>' +
          '<p class="team-site-desc">💬 ' + escapeHTML(app.pitch) + '</p>' +
          '<p class="team-site-sub">📅 Submitted ' + new Date(app.submittedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) + '</p>' +
          (app.decision ? '<p class="team-site-sub">📝 Decision (' + escapeHTML(app.decision.by) + ', ' + new Date(app.decision.at).toLocaleDateString() + '): ' + escapeHTML(app.decision.note || "—") +
            (app.status === "accepted" ? " · Developer role is granted for real at backend activation." : "") + '</p>' : "") +
        '</div>' +
        '<div class="team-site-actions">' +
          (app.status === "pending" ? '<button type="button" class="secondary-action" data-act="review">🔍 Start review</button>' : "") +
          (canAccept && (app.status === "pending" || app.status === "review") ?
            '<button type="button" class="primary-action" data-act="accept">✅ Accept</button>' +
            '<button type="button" class="secondary-action deployed-reject" data-act="reject">❌ Reject</button>' : "") +
        '</div>' +
      '</article>';
    }).join("");
  }

  function onListClick(event) {
    var button = event.target.closest("[data-act]");
    if (!button) return;
    var card = button.closest("[data-id]");
    var id = card.getAttribute("data-id");
    var act = button.getAttribute("data-act");
    var list = readStore();
    var app = list.filter(function (entry) { return entry.id === id; })[0];
    if (!app) return;

    if (act === "review") {
      updateApplication(list, id, function (a) { a.status = "review"; });
      showToast("🔍 @" + app.username + " moved to Under Review.");
      render();
      return;
    }
    if (act === "accept") {
      if (!allowed("Accept Developer Applications")) { showToast("🔐 Your role cannot accept applications."); return; }
      window.ParagonTeamConfirm({
        icon: "✅", title: "Accept developer application",
        lines: ["@" + app.username + " becomes a Paragon developer.",
                "• The real developer role and upload access are granted at backend activation.",
                "• This decision is recorded with your name."],
        requireReason: false,
        field: { type: "text", label: "Welcome note (optional)", value: "" },
        confirmLabel: "Accept application"
      }).then(function (result) {
        if (!result.ok) return;
        updateApplication(list, id, function (a) {
          a.status = "accepted";
          a.decision = { by: "Paragon", at: new Date().toISOString(), note: result.value || "" };
        });
        showToast("✅ @" + app.username + " accepted.");
        render();
      });
      return;
    }
    if (act === "reject") {
      if (!allowed("Accept Developer Applications")) { showToast("🔐 Your role cannot decide applications."); return; }
      window.ParagonTeamConfirm({
        icon: "❌", title: "Reject developer application",
        lines: ["Reject @" + app.username + "'s application?", "• The applicant can apply again later.", "• A written reason is required."],
        requireReason: true, reasonLabel: "Rejection reason",
        confirmLabel: "Reject application", danger: true
      }).then(function (result) {
        if (!result.ok) return;
        updateApplication(list, id, function (a) {
          a.status = "rejected";
          a.decision = { by: "Paragon", at: new Date().toISOString(), note: result.reason };
        });
        showToast("❌ Application rejected.");
        render();
      });
    }
  }

  function loadExamples() {
    var list = readStore();
    var existing = {};
    list.forEach(function (a) { existing[a.id] = true; });
    var added = 0;
    EXAMPLES.forEach(function (example) {
      if (!existing[example.id]) { list.push(JSON.parse(JSON.stringify(example))); added += 1; }
    });
    writeStore(list);
    showToast(added ? "🧪 " + added + " illustrative applications loaded (clearly labelled)." : "🧪 Examples already loaded.");
    render();
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.getElementById("app-list")) return;
      render();
      document.getElementById("app-list").addEventListener("click", onListClick);
      document.getElementById("load-app-example").addEventListener("click", loadExamples);
      ["app-status", "app-experience", "app-sort"].forEach(function (id) {
        document.getElementById(id).addEventListener("change", render);
      });
      document.getElementById("app-search").addEventListener("input", render);
    });
  }

  window.ParagonTeamApplications = {
    STORE_KEY: STORE_KEY, EXAMPLES: EXAMPLES,
    readStore: readStore, writeStore: writeStore,
    applyFilters: applyFilters, stats: stats, updateApplication: updateApplication
  };
})();

}

/* ================= PAGE MODULE: archive.js (runs only on archive.html) ================= */
if (paragonTeamPage() === "archive.html") {
(function () {
  "use strict";

  var ARCHIVE_DAYS = 90;

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
  function element(id) { return document.getElementById(id); }

  var toastHandle = null;
  function showToast(text) {
    var toast = element("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3400);
  }

  function daysLeft(fromIso) {
    var elapsed = (Date.now() - Date.parse(fromIso || 0)) / 86400000;
    return Math.max(0, Math.ceil(ARCHIVE_DAYS - elapsed));
  }

  function matches(term, text) {
    return !term || text.toLowerCase().indexOf(term) !== -1;
  }

  function allowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return P.can(P.getRole ? P.getRole() : "super-admin", action);
  }

  function render() {
    var term = (element("arc-search").value || "").trim().toLowerCase();
    var section = element("arc-section").value;
    document.querySelectorAll("[data-arc]").forEach(function (node) {
      node.hidden = section !== "all" && node.dataset.arc !== section;
    });

    /* Deleted users — real records from the moderation store */
    var moderation = readJSON("paragonTeamUsers.moderation.v1", {});
    var deletedUsers = Object.keys(moderation).filter(function (userId) { return moderation[userId].status === "deleted"; });
    element("arc-users").innerHTML = deletedUsers.length
      ? deletedUsers.filter(function (userId) { return matches(term, userId); }).map(function (userId) {
          var record = moderation[userId];
          var deletedEntry = (record.history || []).filter(function (entry) { return entry.action === "delete"; }).pop();
          var deletedAt = deletedEntry ? deletedEntry.at : new Date().toISOString();
          var left = daysLeft(deletedAt);
          var who = userId.replace("example-", "@").replace("local-", "member ");
          return '<article class="team-site-row st-archived"><div class="team-site-main"><span class="team-site-icon">👤</span><div class="team-site-copy">' +
            '<div class="team-site-title"><strong>' + escapeHTML(who) + '</strong>' + (userId.indexOf("example-") === 0 ? '<span class="team-site-localflag">illustrative example</span>' : "") + '</div>' +
            '<div class="team-site-sub">Deleted: ' + new Date(deletedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) + ' by: Paragon (this device)</div>' +
            '<div class="team-site-sub">Permanent deletion in: <strong>' + left + ' day' + (left === 1 ? "" : "s") + '</strong> (server-side automation at backend activation)</div>' +
          '</div></div><div class="team-site-actions">' +
            '<a class="team-mini-link" href="desk.html?page=user-profile&id=' + encodeURIComponent(userId) + '">View Data</a>' +
            '<button type="button" class="team-mini-link" data-arcact="restore-user" data-id="' + escapeHTML(userId) + '">Restore Account</button>' +
            (allowed("Permanently Delete Archived Data") ? '<button type="button" class="team-mini-link danger" data-arcact="purge-user" data-id="' + escapeHTML(userId) + '">🗑️ Delete Now — Super Admin</button>' : '') +
          '</div></article>';
        }).join("")
      : '<p class="team-site-sub">No deleted user accounts in the vault. Deletions from the Users desk land here with their real 90-day countdown.</p>';

    /* Archived websites — real overrides with status archived */
    var overrides = readJSON("paragonTeamWebsites.overrides.v1", {});
    var archived = Object.keys(overrides).filter(function (name) { return overrides[name].status === "archived"; });
    element("arc-websites").innerHTML = archived.length
      ? archived.filter(function (name) { return matches(term, name); }).map(function (name) {
          var record = overrides[name];
          var left = daysLeft(record.archivedAt);
          return '<article class="team-site-row st-archived"><div class="team-site-main"><span class="team-site-icon">🌐</span><div class="team-site-copy">' +
            '<div class="team-site-title"><strong>' + escapeHTML(name) + '</strong></div>' +
            '<div class="team-site-sub">Archived: ' + new Date(record.archivedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) + ' by: Paragon (this device)</div>' +
            '<div class="team-site-sub">Permanent deletion in: <strong>' + left + ' day' + (left === 1 ? "" : "s") + '</strong></div>' +
          '</div></div><div class="team-site-actions">' +
            '<button type="button" class="team-mini-link" data-arcact="restore-site" data-id="' + escapeHTML(name) + '">Restore to Archive</button>' +
            (allowed("Permanently Delete Archived Data") ? '<button type="button" class="team-mini-link danger" data-arcact="purge-site" data-id="' + escapeHTML(name) + '">🗑️ Delete Now — Super Admin</button>' : '') +
          '</div></article>';
        }).join("")
      : '<p class="team-site-sub">No archived websites in the vault. Archive a website from the All Websites manager and it appears here with its real countdown.</p>';

    /* Closed tickets — real from the ticket store */
    var tickets = readJSON("paragonTeamTickets.v1", []).filter(function (ticket) { return ticket.status === "closed"; });
    element("arc-tickets").innerHTML = tickets.length
      ? tickets.filter(function (ticket) { return matches(term, "#" + ticket.id + " " + ticket.subject + " " + ticket.from); }).map(function (ticket) {
          return '<article class="team-site-row st-archived"><div class="team-site-copy">' +
            '<div class="team-site-title"><strong>#' + ticket.id + '</strong><span class="team-site-cat">' + escapeHTML(ticket.subject) + '</span>' + (ticket.illustrative ? '<span class="team-site-localflag">illustrative example</span>' : "") + '</div>' +
            '<div class="team-site-sub">From: ' + escapeHTML(ticket.from) + ' · closed ticket retained in the vault</div>' +
          '</div><div class="team-site-actions">' +
            '<a class="team-mini-link" href="desk.html?page=ticket&id=' + ticket.id + '">View Ticket</a>' +
            '<button type="button" class="team-mini-link" data-arcact="reopen-ticket" data-id="' + ticket.id + '">Reopen</button>' +
            (allowed("Permanently Delete Archived Data") ? '<button type="button" class="team-mini-link danger" data-arcact="purge-ticket" data-id="' + ticket.id + '">🗑️ Delete Now — Super Admin</button>' : '') +
          '</div></article>';
        }).join("")
      : '<p class="team-site-sub">No closed tickets in the vault.</p>';
  }

  function handleAction(event) {
    var button = event.target.closest("[data-arcact]");
    if (!button) return;
    var act = button.dataset.arcact;
    var id = button.dataset.id;
    if (act === "restore-user") {
      var moderation = readJSON("paragonTeamUsers.moderation.v1", {});
      if (moderation[id]) {
        moderation[id].status = "active";
        moderation[id].history = (moderation[id].history || []).concat([{ action: "restore", at: new Date().toISOString(), pendingBackendSync: true }]);
        writeJSON("paragonTeamUsers.moderation.v1", moderation);
        showToast("Account restored from the vault.");
      }
    }
    if (act === "purge-user") {
      if (!allowed("Permanently Delete Archived Data")) { showToast("Permanent deletion is Super Admin only per the matrix."); return; }
      window.ParagonTeamConfirm({
        icon: "🗑️", title: "DELETE ACCOUNT DATA PERMANENTLY", danger: true, confirmLabel: "🗑️ Delete Permanently",
        lines: ["You are about to permanently delete this account's archived data NOW.", "⚠️ This action CANNOT be undone.", "(Super Admin only — server-side removal executes at backend activation.)"]
      }).then(function (result) {
        if (!result.ok) return;
        var map = readJSON("paragonTeamUsers.moderation.v1", {});
        if (map[id]) { map[id].status = "purged"; map[id].purgedAt = new Date().toISOString(); writeJSON("paragonTeamUsers.moderation.v1", map); }
        showToast("Purge recorded — server-side data removal executes at backend activation.");
        render();
      });
      return;
    }
    if (act === "restore-site") {
      var overrides = readJSON("paragonTeamWebsites.overrides.v1", {});
      delete overrides[id];
      writeJSON("paragonTeamWebsites.overrides.v1", overrides);
      showToast("\u201C" + id + "\u201D restored to the Archive listing.");
    }
    if (act === "purge-site") {
      if (!allowed("Permanently Delete Archived Data")) { showToast("Permanent deletion is Super Admin only per the matrix."); return; }
      var purgeConfirm = window.ParagonTeamConfirm ? window.ParagonTeamConfirm({
        icon: "🗑️", title: "DELETE WEBSITE PERMANENTLY", danger: true, confirmLabel: "🗑️ Delete Permanently",
        lines: [
          "You are about to permanently delete \u201C" + id + "\u201D from the archive.",
          "⚠️ This action CANNOT be undone.",
          "All reviews, stats and data will be deleted.",
          "This website will be removed for all users.",
          "(Super Admin only — catalogue data files apply the removal at integration.)"
        ]
      }) : Promise.resolve({ ok: false }) /* no modal system — refuse destructive action */;
      purgeConfirm.then(function (result) {
        if (!result.ok) return;
        var map2 = readJSON("paragonTeamWebsites.overrides.v1", {});
        if (map2[id]) { map2[id].status = "purged"; map2[id].purgedAt = new Date().toISOString(); writeJSON("paragonTeamWebsites.overrides.v1", map2); }
        showToast("Permanent deletion recorded — applies to the public catalogue at integration.");
        render();
      });
      return;
    }
    if (act === "reopen-ticket" || act === "purge-ticket") {
      var tickets = readJSON("paragonTeamTickets.v1", []);
      if (act === "reopen-ticket") {
        tickets.forEach(function (ticket) { if (String(ticket.id) === String(id)) ticket.status = "open"; });
        writeJSON("paragonTeamTickets.v1", tickets);
        showToast("Ticket #" + id + " reopened.");
      } else {
        window.ParagonTeamConfirm({
          icon: "🗑️", title: "DELETE TICKET PERMANENTLY", danger: true, confirmLabel: "🗑️ Delete Permanently",
          lines: ["Permanently delete ticket #" + id + " and its conversation?", "⚠️ This action CANNOT be undone."]
        }).then(function (result) {
          if (!result.ok) return;
          writeJSON("paragonTeamTickets.v1", readJSON("paragonTeamTickets.v1", []).filter(function (ticket) { return String(ticket.id) !== String(id); }));
          showToast("Ticket #" + id + " permanently deleted.");
          render();
        });
      }
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    ["arc-search", "arc-section"].forEach(function (id) {
      element(id).addEventListener("input", render);
      element(id).addEventListener("change", render);
    });
    document.body.addEventListener("click", handleAction);
  });

  window.ParagonTeamArchiveVault = { daysLeft: daysLeft, ARCHIVE_DAYS: ARCHIVE_DAYS, render: render };
})();

}

/* ================= PAGE MODULE: bugs.js (runs only on bugs.html) ================= */
if (paragonTeamPage() === "bugs.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamBugs.v1";

  var STATUS_META = { open: { label: "🟢 Open", cls: "st-live" }, progress: { label: "🟡 In Progress", cls: "st-scheduled" }, fixed: { label: "✅ Fixed", cls: "st-live" }, wontfix: { label: "⚫ Won't Fix", cls: "st-archived" } };
  var PRIORITY_META = { high: { label: "🔴 High Priority", cls: "st-archived" }, medium: { label: "🟡 Medium Priority", cls: "st-scheduled" }, low: { label: "🟢 Low Priority", cls: "st-live" } };

  var EXAMPLE = {
    id: 89, illustrative: true,
    website: "Paragon Notes",
    title: "Export to PDF crashes on mobile",
    from: "user@email.com",
    reportedAt: "2027-01-20T11:30:00Z",
    browser: "Chrome Android", device: "Mobile",
    priority: "high", status: "progress",
    screenshot: "crash-screen.png",
    steps: "1. Open any note with more than 3 images. 2. Tap Export → PDF. 3. App freezes for ~5 seconds then the tab crashes.",
    expected: "The note exports as a PDF file.",
    actual: "The browser tab crashes; no file is produced.",
    notes: ""
  };

  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
  }
  function updateBug(id, mutate) {
    var list = readStore();
    var bug = list.filter(function (entry) { return String(entry.id) === String(id); })[0];
    if (!bug) return;
    mutate(bug);
    writeStore(list);
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function when(iso) {
    var date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " — " + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  var toastHandle = null;
  function showToast(text) {
    var toast = document.getElementById("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3200);
  }

  var expanded = {};

  function cardMarkup(bug) {
    var status = STATUS_META[bug.status] || STATUS_META.open;
    var priority = PRIORITY_META[bug.priority] || PRIORITY_META.medium;
    var isOpen = Boolean(expanded[bug.id]);
    return '<article class="team-site-row ' + (bug.priority === "high" ? "st-archived" : "st-scheduled") + '">' +
      '<div class="team-site-copy">' +
        '<div class="team-site-title"><strong>🐛 #' + bug.id + '</strong><span class="team-site-cat">' + escapeHTML(bug.website) + ' — ' + escapeHTML(bug.title) + '</span>' + (bug.illustrative ? '<span class="team-site-localflag">illustrative example</span>' : "") + '</div>' +
        '<div class="team-site-sub">From: ' + escapeHTML(bug.from) + ' · <a href="desk.html?page=users">View User</a> · ' + when(bug.reportedAt) + '</div>' +
        '<div class="team-site-sub">Browser: ' + escapeHTML(bug.browser) + ' · Device: ' + escapeHTML(bug.device) + '</div>' +
        '<div class="team-site-title" style="margin-top:6px;"><span class="team-site-badge ' + priority.cls + '">' + priority.label + '</span><span class="team-site-badge ' + status.cls + '">' + status.label + '</span>' + (bug.screenshot ? '<span class="team-site-cat">📎 Screenshot attached</span>' : "") + '</div>' +
        (isOpen ? fullReportMarkup(bug) : "") +
      '</div>' +
      '<div class="team-site-actions">' +
        '<button type="button" class="team-mini-link" data-bact="toggle" data-id="' + bug.id + '">' + (isOpen ? "Hide Full Report" : "View Full Report →") + '</button>' +
      '</div>' +
    '</article>';
  }

  function fullReportMarkup(bug) {
    return '<div class="bug-full-report">' +
      '<p><strong>Steps to reproduce:</strong> ' + escapeHTML(bug.steps || "—") + '</p>' +
      '<p><strong>Expected:</strong> ' + escapeHTML(bug.expected || "—") + '</p>' +
      '<p><strong>Actual:</strong> ' + escapeHTML(bug.actual || "—") + '</p>' +
      (bug.screenshot ? '<p><strong>📎 Attachment:</strong> ' + escapeHTML(bug.screenshot) + ' <em>(real files open from private storage when the backend activates)</em></p>' : "") +
      '<div class="ticket-controls">' +
        '<label>Priority: <select data-bset="priority" data-id="' + bug.id + '"><option value="high"' + (bug.priority === "high" ? " selected" : "") + '>🔴 High</option><option value="medium"' + (bug.priority === "medium" ? " selected" : "") + '>🟡 Medium</option><option value="low"' + (bug.priority === "low" ? " selected" : "") + '>🟢 Low</option></select></label>' +
        '<label>Status: <select data-bset="status" data-id="' + bug.id + '"><option value="open"' + (bug.status === "open" ? " selected" : "") + '>🟢 Open</option><option value="progress"' + (bug.status === "progress" ? " selected" : "") + '>🟡 In Progress</option><option value="fixed"' + (bug.status === "fixed" ? " selected" : "") + '>✅ Fixed</option><option value="wontfix"' + (bug.status === "wontfix" ? " selected" : "") + '>⚫ Won\u2019t Fix</option></select></label>' +
      '</div>' +
      '<label class="deployed-notes"><span>Internal notes (team only)</span><textarea data-bnotes="' + bug.id + '" maxlength="600" rows="2">' + escapeHTML(bug.notes || "") + '</textarea></label>' +
      '<p class="hub-join-note">Marking ✅ Fixed queues the reporter notification for backend dispatch.</p>' +
    '</div>';
  }

  function fillWebsiteFilter() {
    var select = document.getElementById("bug-website-filter");
    var names = {};
    (window.ParagonSites || []).forEach(function (site) { names[site.name] = true; });
    Object.keys(names).sort().forEach(function (name) {
      var option = document.createElement("option");
      option.value = name; option.textContent = name;
      select.appendChild(option);
    });
  }

  function render() {
    var term = (document.getElementById("bug-search").value || "").trim().toLowerCase();
    var website = document.getElementById("bug-website-filter").value;
    var status = document.getElementById("bug-status-filter").value;
    var priority = document.getElementById("bug-priority-filter").value;
    var list = readStore().filter(function (bug) {
      if (website !== "all" && bug.website !== website) return false;
      if (status !== "all" && bug.status !== status) return false;
      if (priority !== "all" && bug.priority !== priority) return false;
      if (!term) return true;
      return ("#" + bug.id + " " + bug.website + " " + bug.title + " " + bug.from + " " + bug.browser).toLowerCase().indexOf(term) !== -1;
    });
    list.sort(function (a, b) {
      var rank = { high: 0, medium: 1, low: 2 };
      return rank[a.priority] - rank[b.priority] || Date.parse(b.reportedAt) - Date.parse(a.reportedAt);
    });
    document.getElementById("bug-total").textContent = list.length + " bug report" + (list.length === 1 ? "" : "s") + " (real reports arrive with the support backend)";
    document.getElementById("bug-list").innerHTML = list.length
      ? list.map(cardMarkup).join("")
      : '<div class="empty-state"><div class="empty-icon">🐛</div><h3>No bug reports yet</h3><p>Real reports arrive here through the Help &amp; Support backend — no fake queue is shown. Load the illustrative example to preview triage.</p></div>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillWebsiteFilter();
    render();
    ["bug-search", "bug-website-filter", "bug-status-filter", "bug-priority-filter"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", render);
      document.getElementById(id).addEventListener("change", render);
    });
    document.getElementById("load-bugs-example").addEventListener("click", function () {
      var list = readStore();
      if (list.some(function (bug) { return bug.illustrative; })) { showToast("The illustrative example is already loaded."); return; }
      list.push(JSON.parse(JSON.stringify(EXAMPLE)));
      writeStore(list);
      render();
      showToast("Illustrative bug #89 loaded — clearly labelled.");
    });
    document.getElementById("bug-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-bact]");
      if (!button) return;
      if (button.dataset.bact === "toggle") {
        expanded[button.dataset.id] = !expanded[button.dataset.id];
        render();
      }
    });
    document.getElementById("bug-list").addEventListener("change", function (event) {
      var control = event.target.closest("[data-bset]");
      if (!control) return;
      var field = control.dataset.bset;
      var value = control.value;
      updateBug(control.dataset.id, function (bug) { bug[field] = value; });
      if (field === "status" && value === "fixed") showToast("Marked Fixed — reporter notification queues for backend dispatch.");
      render();
    });
    document.getElementById("bug-list").addEventListener("input", function (event) {
      var notes = event.target.closest("[data-bnotes]");
      if (!notes) return;
      updateBug(notes.dataset.bnotes, function (bug) { bug.notes = notes.value; });
    });
  });

  window.ParagonTeamBugs = { readStore: readStore, writeStore: writeStore, updateBug: updateBug, EXAMPLE: EXAMPLE, STATUS_META: STATUS_META, PRIORITY_META: PRIORITY_META };
})();

}

/* ================= PAGE MODULE: content-community.js (runs only on content-community.html) ================= */
if (paragonTeamPage() === "content-community.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamCommunityPosts.v1";
  var BOARDS = ["General", "Show & Tell", "Help & Questions", "Ideas", "Off-topic"];

  var EXAMPLES = [
    { id: "post-1", illustrative: true, board: "Show & Tell", author: "ChessFan22", title: "I hit 1200 rating on Paragon Chess!", body: "Three weeks of daily puzzles. The analysis view helped a lot.", postedAt: "2027-01-12T18:00:00Z", flags: 0, status: "visible" },
    { id: "post-2", illustrative: true, board: "General", author: "SpamBot99", title: "FREE COINS CLICK HERE", body: "Visit my-crypto-site.example for free coins!!!", postedAt: "2027-01-14T03:00:00Z", flags: 6, status: "flagged" },
    { id: "post-3", illustrative: true, board: "Help & Questions", author: "NotesDaily", title: "How do I export my notes?", body: "Is there a way to download all my Paragon Notes at once?", postedAt: "2027-01-15T10:30:00Z", flags: 0, status: "visible" }
  ];

  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
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
    window.setTimeout(function () { toast.hidden = true; }, 3200);
  }
  function allowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return !!P.can(P.getRole ? P.getRole() : "super-admin", action);
  }

  function applyFilters(list, filters) {
    var out = list.slice();
    if (filters.board && filters.board !== "all") out = out.filter(function (p) { return p.board === filters.board; });
    if (filters.status && filters.status !== "all") out = out.filter(function (p) { return p.status === filters.status; });
    if (filters.query) {
      var q = filters.query.toLowerCase();
      out = out.filter(function (p) { return (p.title + " " + p.author + " " + p.body).toLowerCase().indexOf(q) !== -1; });
    }
    if (filters.sort === "flagged") out.sort(function (a, b) { return (b.flags || 0) - (a.flags || 0); });
    else out.sort(function (a, b) { return Date.parse(b.postedAt || 0) - Date.parse(a.postedAt || 0); });
    return out;
  }

  function stats(list) {
    return {
      total: list.length,
      visible: list.filter(function (p) { return p.status === "visible"; }).length,
      hidden: list.filter(function (p) { return p.status === "hidden"; }).length,
      flagged: list.filter(function (p) { return p.status === "flagged"; }).length
    };
  }

  function render() {
    if (typeof document === "undefined" || !document.getElementById("post-list")) return;
    var list = readStore();
    var s = stats(list);
    document.getElementById("post-stats").innerHTML =
      '<div class="team-stat-box"><b>' + s.total + '</b><span>Total posts</span></div>' +
      '<div class="team-stat-box"><b>' + s.visible + '</b><span>🟢 Visible</span></div>' +
      '<div class="team-stat-box"><b>' + s.flagged + '</b><span>🚩 Flagged</span></div>' +
      '<div class="team-stat-box"><b>' + s.hidden + '</b><span>🙈 Hidden</span></div>';

    var filtered = applyFilters(list, {
      board: document.getElementById("post-board").value,
      status: document.getElementById("post-status").value,
      sort: document.getElementById("post-sort").value,
      query: document.getElementById("post-search").value.trim()
    });
    document.getElementById("post-total").textContent = filtered.length + (filtered.length === 1 ? " post" : " posts");

    var container = document.getElementById("post-list");
    if (!filtered.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><h3>No community posts</h3><p>Real posts arrive with the Community backend — the board is honestly empty today. Load the labelled illustrative examples to try the moderation workflow.</p></div>';
      return;
    }
    var canDelete = allowed("Delete Community Posts");
    container.innerHTML = filtered.map(function (post) {
      var chip = post.status === "visible" ? '<span class="team-status-chip st-live">🟢 Visible</span>'
        : post.status === "hidden" ? '<span class="team-status-chip st-archived">🙈 Hidden</span>'
        : '<span class="team-status-chip st-scheduled">🚩 Flagged ×' + (post.flags || 0) + '</span>';
      return '<article class="team-site-card" data-id="' + escapeHTML(post.id) + '">' +
        '<div class="team-site-main">' +
          '<div class="team-site-titleline"><b>' + escapeHTML(post.title) + '</b>' + chip +
            (post.illustrative ? '<span class="team-status-chip st-preview">🧪 illustrative example</span>' : "") +
          '</div>' +
          '<p class="team-site-sub">📌 ' + escapeHTML(post.board) + " · by " + escapeHTML(post.author) + " · " + new Date(post.postedAt).toLocaleDateString() + '</p>' +
          '<p class="team-site-desc">' + escapeHTML(post.body) + '</p>' +
          (post.moderation ? '<p class="team-site-sub">📝 ' + escapeHTML(post.moderation) + '</p>' : "") +
          (post.appeal && post.appeal.status === "open" ? '<p class="team-site-sub team-appeal-line">🛡️ OPEN APPEAL: “' + escapeHTML(post.appeal.text) + '” (' + new Date(post.appeal.at).toLocaleDateString() + ')</p>' : "") +
        '</div>' +
        '<div class="team-site-actions">' +
          (canDelete ? (
            (post.status !== "hidden" ? '<button type="button" class="secondary-action" data-act="hide">🙈 Hide</button>' : '<button type="button" class="secondary-action" data-act="restore">👁️ Restore</button>') +
            (post.appeal && post.appeal.status === "open" ? '<button type="button" class="primary-action" data-act="appeal-approve">🛡️ Approve appeal</button><button type="button" class="secondary-action deployed-reject" data-act="appeal-deny">🛡️ Deny appeal</button>' : "") +
            '<button type="button" class="secondary-action deployed-reject" data-act="delete">🗑️ Delete</button>'
          ) : '<span class="team-site-sub">🔐 View-only for your role</span>') +
        '</div>' +
      '</article>';
    }).join("");
  }

  function onListClick(event) {
    var button = event.target.closest("[data-act]");
    if (!button) return;
    if (!allowed("Delete Community Posts")) { showToast("🔐 Your role cannot moderate posts."); return; }
    var id = button.closest("[data-id]").getAttribute("data-id");
    var act = button.getAttribute("data-act");
    var list = readStore();
    var post = list.filter(function (p) { return p.id === id; })[0];
    if (!post) return;

    if (act === "hide") {
      window.ParagonTeamConfirm({
        icon: "🙈", title: "Hide community post",
        lines: ["“" + post.title + "” becomes invisible to members.", "• The author is notified with your reason at backend activation.", "• You can restore it any time."],
        requireReason: true, reasonLabel: "Moderation reason", confirmLabel: "Hide post"
      }).then(function (result) {
        if (!result.ok) return;
        post.status = "hidden";
        post.moderation = "Hidden by Paragon — " + result.reason;
        writeStore(list); showToast("🙈 Post hidden."); render();
      });
      return;
    }
    if (act === "appeal-approve") {
      post.status = "visible";
      post.appeal.status = "approved";
      post.moderation = "Appeal approved — restored by Paragon on " + new Date().toLocaleDateString();
      writeStore(list); showToast("🛡️ Appeal approved — post restored on the public board."); render();
      return;
    }
    if (act === "appeal-deny") {
      window.ParagonTeamConfirm({
        icon: "🛡️", title: "Deny appeal",
        lines: ["The post stays " + post.status + ".", "• A written reason is required — the author sees it."],
        requireReason: true, reasonLabel: "Denial reason", confirmLabel: "Deny appeal", danger: true
      }).then(function (result) {
        if (!result.ok) return;
        post.appeal.status = "denied";
        post.appeal.decision = result.reason;
        writeStore(list); showToast("🛡️ Appeal denied."); render();
      });
      return;
    }
    if (act === "restore") {
      post.status = "visible";
      post.moderation = "Restored by Paragon on " + new Date().toLocaleDateString();
      writeStore(list); showToast("👁️ Post restored."); render();
      return;
    }
    if (act === "delete") {
      window.ParagonTeamConfirm({
        icon: "🗑️", title: "Delete community post",
        lines: ["Permanently delete “" + post.title + "”?", "• This cannot be undone.", "• A written reason is required for the moderation record."],
        requireReason: true, reasonLabel: "Deletion reason", confirmLabel: "Delete post", danger: true
      }).then(function (result) {
        if (!result.ok) return;
        writeStore(list.filter(function (p) { return p.id !== id; }));
        showToast("🗑️ Post deleted."); render();
      });
    }
  }

  function loadExamples() {
    var list = readStore();
    var existing = {};
    list.forEach(function (p) { existing[p.id] = true; });
    var added = 0;
    EXAMPLES.forEach(function (example) {
      if (!existing[example.id]) { list.push(JSON.parse(JSON.stringify(example))); added += 1; }
    });
    writeStore(list);
    showToast(added ? "🧪 " + added + " illustrative posts loaded (clearly labelled)." : "🧪 Examples already loaded.");
    render();
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.getElementById("post-list")) return;
      var boardSelect = document.getElementById("post-board");
      BOARDS.forEach(function (board) {
        var option = document.createElement("option");
        option.value = board; option.textContent = board;
        boardSelect.appendChild(option);
      });
      render();
      document.getElementById("post-list").addEventListener("click", onListClick);
      document.getElementById("load-post-example").addEventListener("click", loadExamples);
      ["post-board", "post-status", "post-sort"].forEach(function (id) { document.getElementById(id).addEventListener("change", render); });
      document.getElementById("post-search").addEventListener("input", render);
    });
  }

  window.ParagonTeamCommunityPosts = {
    STORE_KEY: STORE_KEY, BOARDS: BOARDS, EXAMPLES: EXAMPLES,
    readStore: readStore, writeStore: writeStore, applyFilters: applyFilters, stats: stats
  };
})();

}

/* ================= PAGE MODULE: content-reviews.js (runs only on content-reviews.html) ================= */
if (paragonTeamPage() === "content-reviews.html") {
(function () {
  "use strict";

  var REPORT_KEY = "paragonTeamReviewReports.v1";
  var GUEST_KEY = "paragonArchive.guestState.v1";

  var EXAMPLES = [
    { id: "rep-1", illustrative: true, siteName: "Paragon Chess", author: "GuestUser", stars: 1, text: "This site is trash and so are you!!", reason: "Harassment / insults", reportedBy: "ChessFan22", reportedAt: "2027-01-14T08:00:00Z", status: "open" },
    { id: "rep-2", illustrative: true, siteName: "Paragon Notes", author: "SpamBot99", stars: 5, text: "AMAZING!! visit my-crypto-site.example for free coins", reason: "Spam / advertising", reportedBy: "NotesDaily", reportedAt: "2027-01-15T12:00:00Z", status: "open" }
  ];

  function readReports() {
    try { return JSON.parse(window.localStorage.getItem(REPORT_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeReports(list) {
    try { window.localStorage.setItem(REPORT_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
  }

  /* REAL device reviews out of the shared Archive guest state. */
  function readGuestState() {
    try { return JSON.parse(window.localStorage.getItem(GUEST_KEY) || "null") || {}; }
    catch (error) { return {}; }
  }
  function deviceReviews() {
    var state = readGuestState();
    var byName = state.reviews || {};
    var out = [];
    Object.keys(byName).forEach(function (siteName) {
      (Array.isArray(byName[siteName]) ? byName[siteName] : []).forEach(function (review) {
        out.push({ siteName: siteName, id: review.id, author: review.author || "You (this device)", stars: Number(review.stars) || 0, text: review.text || "", createdAt: review.createdAt || review.at || null, source: "device" });
      });
    });
    return out;
  }
  function deleteDeviceReview(siteName, reviewId) {
    var state = readGuestState();
    if (!state.reviews || !Array.isArray(state.reviews[siteName])) return false;
    var before = state.reviews[siteName].length;
    state.reviews[siteName] = state.reviews[siteName].filter(function (review) { return review.id !== reviewId; });
    if (!state.reviews[siteName].length) delete state.reviews[siteName];
    try { window.localStorage.setItem(GUEST_KEY, JSON.stringify(state)); } catch (error) { return false; }
    return before > (state.reviews[siteName] ? state.reviews[siteName].length : 0);
  }

  function inheritedReviews() {
    var sites = Array.isArray(window.ParagonSites) ? window.ParagonSites : [];
    var out = [];
    sites.forEach(function (site) {
      (Array.isArray(site.reviews) ? site.reviews : []).forEach(function (review, index) {
        out.push({ siteName: site.name, id: "inherited-" + site.name + "-" + index, author: review.author || review.user || "Sample reviewer", stars: Number(review.stars) || 0, text: review.text || "", createdAt: review.date || null, source: "inherited" });
      });
    });
    return out;
  }
  function allReviews() { return deviceReviews().concat(inheritedReviews()); }

  function filterReviews(list, filters) {
    var out = list.slice();
    if (filters.stars && filters.stars !== "all") out = out.filter(function (r) { return Math.round(r.stars) === Number(filters.stars); });
    if (filters.source && filters.source !== "all") out = out.filter(function (r) { return r.source === filters.source; });
    if (filters.query) {
      var q = filters.query.toLowerCase();
      out = out.filter(function (r) { return (r.siteName + " " + r.author + " " + r.text).toLowerCase().indexOf(q) !== -1; });
    }
    return out;
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }
  function starRow(stars) {
    var full = Math.max(0, Math.min(5, Math.round(stars)));
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }
  function showToast(text) {
    var toast = document.getElementById("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    window.setTimeout(function () { toast.hidden = true; }, 3200);
  }
  function allowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return !!P.can(P.getRole ? P.getRole() : "super-admin", action);
  }

  /* ---------- rendering ---------- */
  function renderReports() {
    if (!document.getElementById("report-list")) return;
    var reports = readReports();
    var open = reports.filter(function (r) { return r.status === "open"; });
    document.getElementById("tab-reports-count").textContent = String(open.length);
    document.getElementById("report-total").textContent = open.length + (open.length === 1 ? " open report" : " open reports");
    var container = document.getElementById("report-list");
    if (!reports.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🚩</div><h3>No reported reviews</h3><p>Real reports arrive from the community backend. Zero reports today is the honest truth — load the labelled illustrative examples to try the moderation workflow.</p></div>';
      return;
    }
    var canDelete = allowed("Delete Reviews");
    container.innerHTML = reports.map(function (report) {
      var resolved = report.status !== "open";
      return '<article class="team-site-card" data-repid="' + escapeHTML(report.id) + '">' +
        '<div class="team-site-main">' +
          '<div class="team-site-titleline"><b>' + escapeHTML(report.siteName) + '</b>' +
            '<span class="team-status-chip ' + (report.status === "open" ? "st-scheduled" : report.status === "removed" ? "st-archived" : "st-live") + '">' +
              (report.status === "open" ? "🚩 Open" : report.status === "removed" ? "🗑️ Review removed" : "✔️ Dismissed") + '</span>' +
            (report.illustrative ? '<span class="team-status-chip st-preview">🧪 illustrative example</span>' : "") +
          '</div>' +
          '<p class="team-site-sub">' + starRow(report.stars) + " by " + escapeHTML(report.author) + '</p>' +
          '<p class="team-site-desc">“' + escapeHTML(report.text) + '”</p>' +
          '<p class="team-site-sub">🚩 Reported by ' + escapeHTML(report.reportedBy) + " — " + escapeHTML(report.reason) + " · " + new Date(report.reportedAt).toLocaleDateString() + '</p>' +
          (report.resolution ? '<p class="team-site-sub">📝 ' + escapeHTML(report.resolution) + '</p>' : "") +
        '</div>' +
        (!resolved ? '<div class="team-site-actions">' +
          '<button type="button" class="secondary-action" data-repact="dismiss">✔️ Dismiss report</button>' +
          (canDelete ? '<button type="button" class="secondary-action deployed-reject" data-repact="remove">🗑️ Delete review</button>' : "") +
        '</div>' : "") +
      '</article>';
    }).join("");
  }

  function renderAll() {
    if (!document.getElementById("rev-list")) return;
    var list = filterReviews(allReviews(), {
      stars: document.getElementById("rev-stars").value,
      source: document.getElementById("rev-source").value,
      query: document.getElementById("rev-search").value.trim()
    });
    document.getElementById("tab-all-count").textContent = String(allReviews().length);
    document.getElementById("rev-total").textContent = list.length + (list.length === 1 ? " review" : " reviews");
    var canDelete = allowed("Delete Reviews");
    var container = document.getElementById("rev-list");
    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">⭐</div><h3>No reviews match</h3><p>Adjust the filters, or write a review in the public Archive and it appears here for real.</p></div>';
      return;
    }
    container.innerHTML = list.map(function (review) {
      return '<article class="team-site-card" data-site="' + escapeHTML(review.siteName) + '" data-revid="' + escapeHTML(review.id) + '" data-source="' + review.source + '">' +
        '<div class="team-site-main">' +
          '<div class="team-site-titleline"><b>' + escapeHTML(review.siteName) + '</b>' +
            '<span class="team-status-chip ' + (review.source === "device" ? "st-live" : "st-preview") + '">' + (review.source === "device" ? "✍️ Written on this device" : "📦 Inherited sample") + '</span>' +
          '</div>' +
          '<p class="team-site-sub">' + starRow(review.stars) + " by " + escapeHTML(review.author) + (review.createdAt ? " · " + new Date(review.createdAt).toLocaleDateString() : "") + '</p>' +
          '<p class="team-site-desc">“' + escapeHTML(review.text) + '”</p>' +
        '</div>' +
        '<div class="team-site-actions">' +
          (review.source === "device" && canDelete
            ? '<button type="button" class="secondary-action deployed-reject" data-revact="delete">🗑️ Delete review</button>'
            : review.source === "inherited"
              ? '<span class="team-site-sub" title="Keep-or-remove decision pending in the CTA">🔒 Read-only until the sample-review decision</span>'
              : "") +
        '</div>' +
      '</article>';
    }).join("");
  }

  function onReportClick(event) {
    var button = event.target.closest("[data-repact]");
    if (!button) return;
    var id = button.closest("[data-repid]").getAttribute("data-repid");
    var reports = readReports();
    var report = reports.filter(function (r) { return r.id === id; })[0];
    if (!report) return;
    var act = button.getAttribute("data-repact");

    if (act === "dismiss") {
      window.ParagonTeamConfirm({
        icon: "✔️", title: "Dismiss report",
        lines: ["The review stays visible.", "• A short note is required for the moderation record."],
        requireReason: true, reasonLabel: "Moderation note", confirmLabel: "Dismiss report"
      }).then(function (result) {
        if (!result.ok) return;
        report.status = "dismissed";
        report.resolution = "Dismissed by Paragon — " + result.reason;
        writeReports(reports);
        showToast("✔️ Report dismissed, review kept.");
        renderReports();
      });
      return;
    }
    if (act === "remove") {
      if (!allowed("Delete Reviews")) { showToast("🔐 Your role cannot delete reviews."); return; }
      window.ParagonTeamConfirm({
        icon: "🗑️", title: "Delete reported review",
        lines: ["Remove this review from " + report.siteName + "?",
                "• Device-written reviews are really deleted from the Archive store.",
                "• Backend reviews are deleted server-side at activation.",
                "• A written reason is required."],
        requireReason: true, reasonLabel: "Removal reason", confirmLabel: "Delete review", danger: true
      }).then(function (result) {
        if (!result.ok) return;
        var reallyDeleted = report.reviewId ? deleteDeviceReview(report.siteName, report.reviewId) : false;
        report.status = "removed";
        report.resolution = "Removed by Paragon — " + result.reason + (reallyDeleted ? " (deleted from this device's Archive store)" : report.illustrative ? " (illustrative report — no real review existed)" : "");
        writeReports(reports);
        showToast("🗑️ Review removed.");
        renderReports();
        renderAll();
      });
    }
  }

  function onAllClick(event) {
    var button = event.target.closest("[data-revact='delete']");
    if (!button) return;
    if (!allowed("Delete Reviews")) { showToast("🔐 Your role cannot delete reviews."); return; }
    var card = button.closest("[data-revid]");
    var siteName = card.getAttribute("data-site");
    var reviewId = card.getAttribute("data-revid");
    window.ParagonTeamConfirm({
      icon: "🗑️", title: "Delete review",
      lines: ["Delete this review of " + siteName + "?", "• It disappears from the public Archive on this device immediately.", "• A written reason is required."],
      requireReason: true, reasonLabel: "Removal reason", confirmLabel: "Delete review", danger: true
    }).then(function (result) {
      if (!result.ok) return;
      if (deleteDeviceReview(siteName, reviewId)) {
        showToast("🗑️ Review deleted from the Archive store.");
        renderAll();
      } else {
        showToast("⚠️ Review was not found in the device store.");
      }
    });
  }

  function loadExamples() {
    var reports = readReports();
    var existing = {};
    reports.forEach(function (r) { existing[r.id] = true; });
    var added = 0;
    EXAMPLES.forEach(function (example) {
      if (!existing[example.id]) { reports.push(JSON.parse(JSON.stringify(example))); added += 1; }
    });
    writeReports(reports);
    showToast(added ? "🧪 " + added + " illustrative reports loaded (clearly labelled)." : "🧪 Examples already loaded.");
    renderReports();
  }

  function switchTab(which) {
    var reports = which === "reports";
    document.getElementById("tab-reports").classList.toggle("active", reports);
    document.getElementById("tab-all").classList.toggle("active", !reports);
    document.getElementById("tab-reports").setAttribute("aria-selected", String(reports));
    document.getElementById("tab-all").setAttribute("aria-selected", String(!reports));
    document.getElementById("panel-reports").hidden = !reports;
    document.getElementById("panel-all").hidden = reports;
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.getElementById("report-list")) return;
      renderReports();
      renderAll();
      document.getElementById("report-list").addEventListener("click", onReportClick);
      document.getElementById("rev-list").addEventListener("click", onAllClick);
      document.getElementById("load-report-example").addEventListener("click", loadExamples);
      document.getElementById("tab-reports").addEventListener("click", function () { switchTab("reports"); });
      document.getElementById("tab-all").addEventListener("click", function () { switchTab("all"); });
      ["rev-stars", "rev-source"].forEach(function (id) { document.getElementById(id).addEventListener("change", renderAll); });
      document.getElementById("rev-search").addEventListener("input", renderAll);
    });
  }

  window.ParagonTeamContentReviews = {
    REPORT_KEY: REPORT_KEY, EXAMPLES: EXAMPLES,
    readReports: readReports, writeReports: writeReports,
    deviceReviews: deviceReviews, inheritedReviews: inheritedReviews,
    deleteDeviceReview: deleteDeviceReview, filterReviews: filterReviews
  };
})();

}

/* ================= PAGE MODULE: content-suggestions.js (runs only on content-suggestions.html) ================= */
if (paragonTeamPage() === "content-suggestions.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamSuggestions.v1";
  var ROADMAP_KEY = "paragonTeamRoadmap.v1";
  var STATUS_META = {
    "new": { label: "🟡 New", cls: "st-scheduled" },
    review: { label: "🔵 Under Review", cls: "st-preview" },
    planned: { label: "✅ Planned", cls: "st-live" },
    declined: { label: "❌ Declined", cls: "st-archived" }
  };

  var EXAMPLES = [
    { id: "sug-dark-sched", illustrative: true, title: "Scheduled dark mode", detail: "Let the Archive switch themes automatically at sunset.", author: "NightOwl", submittedAt: "2027-01-09T20:00:00Z", votes: 14, status: "new", note: "" },
    { id: "sug-offline-quiz", illustrative: true, title: "Offline quiz packs", detail: "Download quiz categories so Paragon Quiz works fully offline.", author: "QuizMaster", submittedAt: "2027-01-11T11:00:00Z", votes: 32, status: "review", note: "" },
    { id: "sug-yoruba", illustrative: true, title: "Yoruba language support", detail: "Add Yoruba to the multi-language plans first.", author: "LagosDev", submittedAt: "2027-01-13T16:45:00Z", votes: 21, status: "new", note: "" }
  ];

  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
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
    window.setTimeout(function () { toast.hidden = true; }, 3200);
  }
  function allowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return !!P.can(P.getRole ? P.getRole() : "super-admin", action);
  }

  /* REAL roadmap hand-off: appends a planned item to the shared team roadmap store. */
  function promoteToRoadmap(suggestion) {
    var roadmap;
    try { roadmap = JSON.parse(window.localStorage.getItem(ROADMAP_KEY) || "null") || []; }
    catch (error) { roadmap = []; }
    var id = "sug-" + suggestion.id;
    if (roadmap.some(function (item) { return item.id === id; })) return false;
    roadmap.push({
      id: id, group: "planned",
      title: suggestion.title,
      detail: "Community suggestion by " + suggestion.author + " — " + suggestion.detail,
      percent: 0, isPublic: true, fromSuggestion: true
    });
    try { window.localStorage.setItem(ROADMAP_KEY, JSON.stringify(roadmap)); } catch (error) { return false; }
    return true;
  }

  function applyFilters(list, filters) {
    var out = list.slice();
    if (filters.status && filters.status !== "all") out = out.filter(function (s) { return s.status === filters.status; });
    if (filters.query) {
      var q = filters.query.toLowerCase();
      out = out.filter(function (s) { return (s.title + " " + s.detail + " " + s.author).toLowerCase().indexOf(q) !== -1; });
    }
    if (filters.sort === "votes") out.sort(function (a, b) { return (b.votes || 0) - (a.votes || 0); });
    else out.sort(function (a, b) { return Date.parse(b.submittedAt || 0) - Date.parse(a.submittedAt || 0); });
    return out;
  }
  function stats(list) {
    return {
      total: list.length,
      fresh: list.filter(function (s) { return s.status === "new"; }).length,
      review: list.filter(function (s) { return s.status === "review"; }).length,
      planned: list.filter(function (s) { return s.status === "planned"; }).length,
      declined: list.filter(function (s) { return s.status === "declined"; }).length
    };
  }

  function render() {
    if (typeof document === "undefined" || !document.getElementById("sug-list")) return;
    var list = readStore();
    var s = stats(list);
    document.getElementById("sug-stats").innerHTML =
      '<div class="team-stat-box"><b>' + s.total + '</b><span>Total</span></div>' +
      '<div class="team-stat-box"><b>' + s.fresh + '</b><span>🟡 New</span></div>' +
      '<div class="team-stat-box"><b>' + s.review + '</b><span>🔵 In Review</span></div>' +
      '<div class="team-stat-box"><b>' + s.planned + '</b><span>✅ Planned</span></div>' +
      '<div class="team-stat-box"><b>' + s.declined + '</b><span>❌ Declined</span></div>';

    var filtered = applyFilters(list, {
      status: document.getElementById("sug-status").value,
      sort: document.getElementById("sug-sort").value,
      query: document.getElementById("sug-search").value.trim()
    });
    document.getElementById("sug-total").textContent = filtered.length + (filtered.length === 1 ? " suggestion" : " suggestions");

    var container = document.getElementById("sug-list");
    if (!filtered.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">💡</div><h3>No suggestions</h3><p>Real community suggestions arrive with the backend — this desk never invents them. Load the labelled illustrative examples to try the workflow.</p></div>';
      return;
    }
    var canRoadmap = allowed("Edit Roadmap");
    container.innerHTML = filtered.map(function (sug) {
      var meta = STATUS_META[sug.status] || STATUS_META["new"];
      return '<article class="team-site-card" data-id="' + escapeHTML(sug.id) + '">' +
        '<div class="team-site-main">' +
          '<div class="team-site-titleline"><b>' + escapeHTML(sug.title) + '</b>' +
            '<span class="team-status-chip ' + meta.cls + '">' + meta.label + '</span>' +
            (sug.illustrative ? '<span class="team-status-chip st-preview">🧪 illustrative example</span>' : "") +
          '</div>' +
          '<p class="team-site-sub">👍 ' + (sug.votes || 0) + ' votes · by ' + escapeHTML(sug.author) + " · " + new Date(sug.submittedAt).toLocaleDateString() + '</p>' +
          '<p class="team-site-desc">' + escapeHTML(sug.detail) + '</p>' +
          (sug.note ? '<p class="team-site-sub">📝 ' + escapeHTML(sug.note) + '</p>' : "") +
        '</div>' +
        '<div class="team-site-actions">' +
          (sug.status === "new" ? '<button type="button" class="secondary-action" data-act="review">🔍 Start review</button>' : "") +
          (sug.status === "new" || sug.status === "review" ? (
            (canRoadmap ? '<button type="button" class="primary-action" data-act="plan">🗺️ Plan + add to Roadmap</button>' : '<button type="button" class="primary-action" data-act="plan-only">✅ Mark planned</button>') +
            '<button type="button" class="secondary-action deployed-reject" data-act="decline">❌ Decline</button>'
          ) : "") +
        '</div>' +
      '</article>';
    }).join("");
  }

  function onListClick(event) {
    var button = event.target.closest("[data-act]");
    if (!button) return;
    var id = button.closest("[data-id]").getAttribute("data-id");
    var act = button.getAttribute("data-act");
    var list = readStore();
    var sug = list.filter(function (s) { return s.id === id; })[0];
    if (!sug) return;

    if (act === "review") {
      sug.status = "review";
      writeStore(list); showToast("🔍 Moved to Under Review."); render();
      return;
    }
    if (act === "plan" || act === "plan-only") {
      var toRoadmap = act === "plan" && allowed("Edit Roadmap");
      window.ParagonTeamConfirm({
        icon: "✅", title: "Mark suggestion as planned",
        lines: ["“" + sug.title + "” joins the plan.",
                toRoadmap ? "• A planned roadmap item is REALLY created and syncs to the public hub roadmap." : "• Roadmap publishing needs the Edit Roadmap permission (Super Admin / Admin).",
                "• The suggester is credited by name."],
        field: { type: "text", label: "Team note (optional)", value: "" },
        confirmLabel: toRoadmap ? "Plan + publish to roadmap" : "Mark planned"
      }).then(function (result) {
        if (!result.ok) return;
        sug.status = "planned";
        sug.note = "Planned by Paragon" + (result.value ? " — " + result.value : "");
        if (toRoadmap) {
          var added = promoteToRoadmap(sug);
          sug.note += added ? " · Added to the roadmap (planned, 0%)" : " · Already on the roadmap";
        }
        writeStore(list);
        showToast(toRoadmap ? "🗺️ Planned and published to the roadmap!" : "✅ Marked planned.");
        render();
      });
      return;
    }
    if (act === "decline") {
      window.ParagonTeamConfirm({
        icon: "❌", title: "Decline suggestion",
        lines: ["Decline “" + sug.title + "”?", "• The suggester sees your reason at backend activation.", "• A written reason is required."],
        requireReason: true, reasonLabel: "Decline reason", confirmLabel: "Decline suggestion", danger: true
      }).then(function (result) {
        if (!result.ok) return;
        sug.status = "declined";
        sug.note = "Declined by Paragon — " + result.reason;
        writeStore(list); showToast("❌ Suggestion declined."); render();
      });
    }
  }

  function loadExamples() {
    var list = readStore();
    var existing = {};
    list.forEach(function (s) { existing[s.id] = true; });
    var added = 0;
    EXAMPLES.forEach(function (example) {
      if (!existing[example.id]) { list.push(JSON.parse(JSON.stringify(example))); added += 1; }
    });
    writeStore(list);
    showToast(added ? "🧪 " + added + " illustrative suggestions loaded (labelled, votes are example values)." : "🧪 Examples already loaded.");
    render();
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.getElementById("sug-list")) return;
      render();
      document.getElementById("sug-list").addEventListener("click", onListClick);
      document.getElementById("load-sug-example").addEventListener("click", loadExamples);
      ["sug-status", "sug-sort"].forEach(function (id) { document.getElementById(id).addEventListener("change", render); });
      document.getElementById("sug-search").addEventListener("input", render);
    });
  }

  window.ParagonTeamSuggestions = {
    STORE_KEY: STORE_KEY, ROADMAP_KEY: ROADMAP_KEY, EXAMPLES: EXAMPLES,
    readStore: readStore, writeStore: writeStore,
    applyFilters: applyFilters, stats: stats, promoteToRoadmap: promoteToRoadmap
  };
})();

}

/* ================= PAGE MODULE: deployed.js (runs only on deployed.html) ================= */
if (paragonTeamPage() === "deployed.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamDeployed.submissions.v1";

  var CHECKLIST = [
    "Responsive on mobile",
    "Supports dark mode",
    "Works inside iframe",
    "No malicious code detected",
    "Premium features clearly labeled",
    "Content is appropriate",
    "Performance is acceptable",
    "Privacy compliant"
  ];

  var STATUS_META = {
    pending:  { badge: "🟡 PENDING REVIEW", cls: "st-review" },
    approved: { badge: "✅ APPROVED", cls: "st-live" },
    rejected: { badge: "❌ REJECTED", cls: "st-archived" },
    hold:     { badge: "🔄 ON HOLD", cls: "st-scheduled" }
  };

  var EXAMPLE = {
    id: "example-my-design-tool",
    illustrative: true,
    name: "My Design Tool",
    icon: "🎨",
    submittedBy: "@JohnDev",
    category: "Deployed Tools",
    pricing: "Free + Premium features",
    submittedAt: "2027-01-20T10:00:00Z",
    status: "pending",
    checklist: {},
    notes: "",
    decisionReason: ""
  };

  var activeFilter = "all";

  function element(id) { return document.getElementById(id); }
  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  var toastHandle = null;
  function showToast(text) {
    var toast = element("dash-toast");
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3400);
  }

  function checklistDone(submission) {
    return CHECKLIST.every(function (item, index) { return submission.checklist && submission.checklist[index]; });
  }

  function checklistCount(submission) {
    return CHECKLIST.filter(function (item, index) { return submission.checklist && submission.checklist[index]; }).length;
  }

  function dateLabel(iso) {
    var date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  }

  function cardMarkup(submission) {
    var meta = STATUS_META[submission.status] || STATUS_META.pending;
    var done = checklistCount(submission);
    var isDecided = submission.status === "approved" || submission.status === "rejected";
    return '<article class="deployed-card ' + meta.cls + '" data-id="' + escapeHTML(submission.id) + '">' +
      '<div class="deployed-card-head">' +
        '<span class="team-site-badge ' + meta.cls + '">' + meta.badge + '</span>' +
        (submission.illustrative ? '<span class="team-site-localflag" title="Illustrative example — not a real submission">illustrative example</span>' : "") +
        '<time>' + dateLabel(submission.submittedAt) + '</time>' +
      '</div>' +
      '<div class="team-site-main">' +
        '<span class="team-site-icon" aria-hidden="true">' + escapeHTML(submission.icon || "🌐") + '</span>' +
        '<div class="team-site-copy">' +
          '<div class="team-site-title"><strong>' + escapeHTML(submission.name) + '</strong></div>' +
          '<div class="team-site-sub">Submitted by ' + escapeHTML(submission.submittedBy) + ' · Category: ' + escapeHTML(submission.category) + ' · Type: ' + escapeHTML(submission.pricing) + ' · Submitted: ' + dateLabel(submission.submittedAt) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="team-site-actions deployed-file-actions">' +
        '<button type="button" class="team-mini-link" data-act="files" data-id="' + escapeHTML(submission.id) + '">📎 View Files</button>' +
        '<button type="button" class="team-mini-link" data-act="shots" data-id="' + escapeHTML(submission.id) + '">🖼️ View Screenshots</button>' +
        '<button type="button" class="team-mini-link" data-act="preview" data-id="' + escapeHTML(submission.id) + '">🔗 Preview Website</button>' +
      '</div>' +
      '<div class="deployed-checklist">' +
        '<strong>REVIEW CHECKLIST <span class="deployed-checklist-count">' + done + '/' + CHECKLIST.length + '</span></strong>' +
        CHECKLIST.map(function (item, index) {
          var checked = submission.checklist && submission.checklist[index];
          return '<label><input type="checkbox" data-check="' + index + '" data-id="' + escapeHTML(submission.id) + '"' + (checked ? " checked" : "") + (isDecided ? " disabled" : "") + '> ' + escapeHTML(item) + '</label>';
        }).join("") +
      '</div>' +
      '<label class="deployed-notes"><span>Internal Notes (only team sees this)</span><textarea data-notes="' + escapeHTML(submission.id) + '" maxlength="600" rows="2"' + (isDecided ? " disabled" : "") + ' placeholder="Notes for the team…">' + escapeHTML(submission.notes || "") + '</textarea></label>' +
      (submission.decisionReason ? '<p class="deployed-decision-reason"><strong>' + (submission.status === "rejected" ? "Rejection reason:" : "Decision note:") + '</strong> ' + escapeHTML(submission.decisionReason) + '</p>' : "") +
      (isDecided
        ? '<div class="deployed-actions"><button type="button" class="team-mini-link" data-act="reopen" data-id="' + escapeHTML(submission.id) + '">↩ Reopen Review</button>' + (submission.status === "approved" ? '<span class="hub-join-note deployed-approved-note">Approval is recorded; the public Deployed listing goes live with the hosting backend.</span>' : "") + '</div>'
        : '<div class="deployed-actions">' +
            '<button type="button" class="secondary-action" data-act="hold" data-id="' + escapeHTML(submission.id) + '">🔄 ' + (submission.status === "hold" ? "Resume Review" : "Put on Hold") + '</button>' +
            '<button type="button" class="secondary-action deployed-reject" data-act="reject" data-id="' + escapeHTML(submission.id) + '">❌ Reject with Reason</button>' +
            '<button type="button" class="primary-action" data-act="approve" data-id="' + escapeHTML(submission.id) + '"' + (checklistDone(submission) ? "" : " disabled title=\"Complete all 8 checklist items first\"") + '>✅ Approve</button>' +
          '</div>') +
    '</article>';
  }

  function render() {
    var list = readStore().filter(function (submission) {
      return activeFilter === "all" || submission.status === activeFilter;
    });
    element("deployed-list").innerHTML = list.length
      ? list.map(cardMarkup).join("")
      : '<div class="empty-state"><div class="empty-icon">🚀</div><h3>No submissions' + (activeFilter === "all" ? " yet" : " in this state") + '</h3><p>The Deployed programme has not opened public submissions. Real developer submissions arrive here through the upload/review backend — no fake queue is shown. Use the illustrative example to preview the workflow.</p></div>';
  }

  function update(id, mutate) {
    var list = readStore();
    var submission = list.filter(function (entry) { return entry.id === id; })[0];
    if (!submission) return;
    mutate(submission);
    writeStore(list);
    render();
  }

  function handleAction(act, id) {
    if (act === "files" || act === "shots") {
      showToast("Real files and screenshots arrive with submissions through the upload backend. The illustrative example carries none.");
      return;
    }
    if (act === "preview") {
      window.open("../paragon-archive.html?site=My%20Cool%20App", "_blank");
      showToast("Opening the illustrative Deployed detail template as the preview stand-in.");
      return;
    }
    if (act === "hold") {
      update(id, function (submission) { submission.status = submission.status === "hold" ? "pending" : "hold"; });
      return;
    }
    if (act === "reject") {
      window.ParagonTeamConfirm({
        icon: "❌", title: "REJECT SUBMISSION", danger: true, confirmLabel: "❌ Reject",
        lines: ["Reject this deployed-website submission.", "The written reason is sent to the developer with the decision (email dispatches at backend activation)."],
        requireReason: true, reasonLabel: "Rejection reason"
      }).then(function (result) {
        if (!result.ok) return;
        update(id, function (submission) { submission.status = "rejected"; submission.decisionReason = result.reason; submission.decidedAt = new Date().toISOString(); });
        showToast("Rejected — developer notification queues for backend dispatch.");
      });
      return;
    }
    if (act === "approve") {
      update(id, function (submission) {
        if (!checklistDone(submission)) return;
        submission.status = "approved";
        submission.decidedAt = new Date().toISOString();
      });
      showToast("Approved. Public listing and developer notification activate with the hosting backend.");
      return;
    }
    if (act === "reopen") {
      update(id, function (submission) { submission.status = "pending"; submission.decisionReason = ""; });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    document.querySelectorAll(".deployed-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        activeFilter = tab.dataset.status;
        document.querySelectorAll(".deployed-tab").forEach(function (other) {
          other.classList.toggle("active", other === tab);
          other.setAttribute("aria-selected", String(other === tab));
        });
        render();
      });
    });
    element("load-example-btn").addEventListener("click", function () {
      var list = readStore();
      if (list.some(function (entry) { return entry.id === EXAMPLE.id; })) { showToast("The illustrative example is already in the queue."); return; }
      list.push(JSON.parse(JSON.stringify(EXAMPLE)));
      writeStore(list);
      render();
      showToast("Illustrative example loaded — clearly labelled, fully reviewable.");
    });
    element("deployed-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-act]");
      if (button) handleAction(button.dataset.act, button.dataset.id);
    });
    element("deployed-list").addEventListener("change", function (event) {
      var checkbox = event.target.closest("[data-check]");
      if (!checkbox) return;
      update(checkbox.dataset.id, function (submission) {
        submission.checklist = submission.checklist || {};
        submission.checklist[checkbox.dataset.check] = checkbox.checked;
      });
    });
    element("deployed-list").addEventListener("input", function (event) {
      var notes = event.target.closest("[data-notes]");
      if (!notes) return;
      var list = readStore();
      var submission = list.filter(function (entry) { return entry.id === notes.dataset.notes; })[0];
      if (submission) { submission.notes = notes.value; writeStore(list); }
    });
  });

  window.ParagonTeamDeployed = { CHECKLIST: CHECKLIST, readStore: readStore, writeStore: writeStore, checklistDone: checklistDone, EXAMPLE: EXAMPLE };
})();

}

/* ================= PAGE MODULE: lab.js (runs only on lab.html) ================= */
if (paragonTeamPage() === "lab.html") {
(function () {
  "use strict";

  var PAGES = [
    { label: "◈ Paragon Archive (main app)", href: "../paragon-archive.html" },
    { label: "🏠 Archive Hub — Home", href: "../paragon-archive-hub.html" },
    { label: "🎯 Paragon Quiz — Home", href: "../paragon-quiz/index.html" },
    { label: "🎯 Paragon Quiz — Explore", href: "../paragon-quiz/explore.html" },
    { label: "🎯 Paragon Quiz — Create", href: "../paragon-quiz/create.html" },
    { label: "🚧 Product concept preview", href: "../paragon-product-preview.html" }
  ];
  var DEVICE_WIDTHS = { full: "", laptop: "1180px", tablet: "768px", mobile: "390px" };

  function element(id) { return document.getElementById(id); }

  function setDevice(device) {
    var wrap = element("lab-frame-wrap");
    wrap.className = "lab-frame-wrap lab-" + device;
    wrap.style.width = DEVICE_WIDTHS[device] || "";
  }

  function setActions(enabled) {
    var shield = element("lab-shield");
    shield.style.display = enabled ? "none" : "flex";
    element("lab-actions-state").textContent = enabled ? "ON · live actions" : "OFF · pure preview";
    var frame = element("lab-frame");
    frame.setAttribute("tabindex", enabled ? "0" : "-1");
  }

  function loadPage(href) {
    element("lab-frame").src = href;
    element("lab-open").href = href;
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!element("lab-frame")) return;
      var pageSelect = element("lab-page");
      PAGES.forEach(function (page) {
        var option = document.createElement("option");
        option.value = page.href;
        option.textContent = page.label;
        pageSelect.appendChild(option);
      });

      loadPage(PAGES[0].href);
      setActions(false); /* Lab default: no actions — pure preview */
      setDevice("full");

      pageSelect.addEventListener("change", function () { loadPage(this.value); });
      element("lab-device").addEventListener("change", function () { setDevice(this.value); });
      element("lab-actions").addEventListener("change", function () { setActions(this.checked); });
      element("lab-reload").addEventListener("click", function () {
        var frame = element("lab-frame");
        frame.src = frame.src; // eslint-disable-line no-self-assign
        var toast = document.getElementById("dash-toast");
        if (toast) {
          toast.textContent = "🔄 Preview reloaded.";
          toast.hidden = false;
          window.setTimeout(function () { toast.hidden = true; }, 2200);
        }
      });

      /* Extra safety: while actions are OFF, swallow any key events targeting the stage. */
      element("lab-stage").addEventListener("keydown", function (event) {
        if (!element("lab-actions").checked) { event.preventDefault(); event.stopPropagation(); }
      }, true);
    });
  }

  window.ParagonTeamLab = { PAGES: PAGES, DEVICE_WIDTHS: DEVICE_WIDTHS };
})();

}

/* ================= PAGE MODULE: login.js (runs only on login.html) ================= */
if (paragonTeamPage() === "login.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamPortal.security.v1";
  var LOCK_MINUTES = 30;
  var MAX_ATTEMPTS = 5;
  var countdownHandle = null;

  function readState() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || { attempts: 0, lockedUntil: 0, incidents: [] }; }
    catch (error) { return { attempts: 0, lockedUntil: 0, incidents: [] }; }
  }

  function writeState(state) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (error) { /* storage blocked */ }
  }

  function element(id) { return document.getElementById(id); }

  function setStatus(text, tone) {
    var status = element("team-portal-status");
    status.hidden = !text;
    status.textContent = text || "";
    status.dataset.tone = tone || "info";
  }

  function formatCountdown(msLeft) {
    var totalSeconds = Math.max(0, Math.ceil(msLeft / 1000));
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  function applyLockUI() {
    var state = readState();
    var lockout = element("portal-lockout");
    var form = element("team-portal-form");
    var locked = state.lockedUntil > Date.now();
    ["portal-email", "portal-password", "portal-submit", "portal-show-toggle"].forEach(function (id) {
      var node = element(id);
      if (node) node.disabled = locked;
    });
    if (!locked) {
      lockout.hidden = true;
      if (state.lockedUntil && state.attempts >= MAX_ATTEMPTS) {
        // Lock expired — reset the counter for a fresh set of attempts.
        state.attempts = 0;
        state.lockedUntil = 0;
        writeState(state);
        setStatus("Lockout expired. You may try again.", "info");
      }
      if (countdownHandle) { window.clearInterval(countdownHandle); countdownHandle = null; }
      return;
    }
    lockout.hidden = false;
    function paint() {
      var left = state.lockedUntil - Date.now();
      if (left <= 0) { applyLockUI(); return; }
      lockout.textContent = "🔒 Account locked for " + LOCK_MINUTES + " minutes after " + MAX_ATTEMPTS + " failed attempts. Try again in " + formatCountdown(left) + ". This lockout incident has been recorded.";
    }
    paint();
    if (!countdownHandle) countdownHandle = window.setInterval(paint, 1000);
    void form;
  }

  function recordIncident(state) {
    state.incidents.push({
      at: new Date().toISOString(),
      attempts: MAX_ATTEMPTS,
      note: "Owner alert to paragon.archive.2026@gmail.com queues here and dispatches with IP address when the security backend activates.",
      pendingBackendDispatch: true
    });
    if (state.incidents.length > 50) state.incidents = state.incidents.slice(state.incidents.length - 50);
  }

  function handleSubmit(event) {
    event.preventDefault();
    var state = readState();
    if (state.lockedUntil > Date.now()) { applyLockUI(); return; }
    if (state.lockedUntil && state.lockedUntil <= Date.now()) {
      // Lock expired — fresh set of attempts.
      state.attempts = 0;
      state.lockedUntil = 0;
    }
    var email = element("portal-email").value.trim();
    var password = element("portal-password").value;
    if (!email || !password) {
      setStatus("Enter your Team email address and password.", "signed-out");
      return;
    }
    // Server-side Team authorization is not active, so no credential can succeed yet;
    // every attempt is a genuine failed attempt against the escalation policy.
    state.attempts += 1;
    if (state.attempts >= MAX_ATTEMPTS) {
      state.lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
      recordIncident(state);
      writeState(state);
      setStatus("", "info");
      element("portal-password").value = "";
      applyLockUI();
      return;
    }
    writeState(state);
    element("portal-password").value = "";
    if (state.attempts <= 2) {
      setStatus("Wrong credentials. This portal accepts only authorized Paragon Team accounts. (Attempt " + state.attempts + " of " + MAX_ATTEMPTS + ")", "signed-out");
    } else if (state.attempts === 3) {
      setStatus("⚠️ Warning — 2 more attempts before this device is locked out for " + LOCK_MINUTES + " minutes.", "signed-out");
    } else if (state.attempts === 4) {
      setStatus("⚠️ Final warning — 1 more attempt before this device is locked out for " + LOCK_MINUTES + " minutes.", "signed-out");
    }
  }

  function bindShowToggle() {
    var toggle = element("portal-show-toggle");
    var password = element("portal-password");
    toggle.addEventListener("click", function () {
      var show = password.type === "password";
      password.type = show ? "text" : "password";
      toggle.textContent = show ? "Hide" : "Show";
      toggle.setAttribute("aria-pressed", String(show));
      toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    element("team-portal-form").addEventListener("submit", handleSubmit);
    bindShowToggle();
    applyLockUI();
  });

  window.ParagonTeamPortal = { readState: readState, MAX_ATTEMPTS: MAX_ATTEMPTS, LOCK_MINUTES: LOCK_MINUTES };
})();

/* P-050: session-timeout arrival notice (login.html?timeout=1 set by team/session.js). */
document.addEventListener("DOMContentLoaded", function () {
  try {
    if (new URLSearchParams(window.location.search).get("timeout") === "1") {
      var note = document.getElementById("portal-timeout-note");
      if (note) note.hidden = false;
    }
  } catch (error) { /* older browsers */ }
});

}

/* ================= PAGE MODULE: member-profile.js (runs only on member-profile.html) ================= */
if (paragonTeamPage() === "member-profile.html") {
(function () {
  "use strict";

  var M = window.ParagonTeamMembers;
  var memberId = new URLSearchParams(window.location.search).get("id") || "";

  function element(id) { return document.getElementById(id); }

  function render() {
    var member = M.findMember(memberId);
    if (!member) {
      element("member-not-found").style.display = "block";
      element("member-body").style.display = "none";
      return;
    }
    element("member-body").style.display = "block";
    document.title = member.name + " — Paragon Team Dashboard";
    element("member-avatar").textContent = member.name.slice(0, 1).toUpperCase();
    element("member-name").textContent = member.name;
    element("member-email").textContent = member.email;
    element("member-role").textContent = "Role: " + member.role;
    element("member-joined").textContent = "Joined: " + new Date(member.joinedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "2-digit" === "never" ? "2-digit" : "numeric" });
    element("member-lastactive").textContent = "Last Active: " + member.lastActive;
    var badge = element("member-status-badge");
    if (member.suspended) { badge.textContent = "⏸️ Suspended"; badge.className = "team-site-badge st-archived"; }
    else { badge.textContent = "🟢 Active"; badge.className = "team-site-badge st-live"; }
    var flag = element("member-flag");
    flag.hidden = false;
    if (member.isOwner) { flag.textContent = "real · owner"; flag.style.borderColor = "rgba(34,197,94,0.5)"; flag.style.color = "#22c55e"; }
    else flag.textContent = "illustrative example";

    element("mstat-actions").textContent = String(member.stats.actions);
    element("mstat-actions-note").textContent = member.isOwner ? "Counted live from this device's real dashboard activity" : "Example values";
    element("mstat-websites").textContent = String(member.stats.websitesAdded);
    element("mstat-tickets").textContent = String(member.stats.ticketsResolved);
    element("mstat-reviews").textContent = String(member.stats.reviewsRemoved);

    var activity = member.activity || [];
    element("member-activity").innerHTML = activity.length
      ? activity.map(function (event) {
          return '<li><span class="team-activity-dot">' + event.icon + '</span><div><p>' + M.escapeHTML(event.text) + '</p></div><time>' + M.escapeHTML(event.at) + '</time></li>';
        }).join("")
      : '<li class="team-activity-empty">No recorded actions yet' + (member.isOwner ? " on this device — activity appears as you work in the dashboard." : ".") + '</li>';

    var isOwner = member.isOwner;
    ["member-change-role", "member-suspend", "member-remove"].forEach(function (id) { element(id).disabled = isOwner; });
    element("member-owner-note").hidden = !isOwner;
    element("member-suspend").textContent = member.suspended ? "▶️ Restore Access" : "⏸️ Suspend Access";
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    element("member-change-role").addEventListener("click", function () {
      var member = M.findMember(memberId);
      window.ParagonTeamConfirm({
        icon: "🔄", title: "CHANGE ROLE", confirmLabel: "Change Role",
        lines: ["Change " + member.name + "'s team role."],
        field: { type: "select", label: "New role", required: true, value: member.role, options: [{value:"Admin",label:"Admin"},{value:"Developer",label:"Developer"},{value:"Moderator",label:"Moderator"},{value:"Support",label:"Support"},{value:"Analyst",label:"Analyst"}] }
      }).then(function (result) {
        if (!result.ok || !result.value) return;
        M.setOverride(memberId, { role: result.value });
        M.showToast("Role changed to " + result.value + " — backend claims apply it at activation.");
        render();
      });
    });
    element("member-suspend").addEventListener("click", function () {
      var member = M.findMember(memberId);
      M.setOverride(memberId, { suspended: !member.suspended });
      M.showToast(member.suspended ? "Access restored." : "Access suspended — enforced by backend claims at activation.");
      render();
    });
    element("member-remove").addEventListener("click", function () {
      var member = M.findMember(memberId);
      window.ParagonTeamConfirm({
        icon: "🗑️", title: "REMOVE TEAM MEMBER", danger: true, confirmLabel: "Remove from Team",
        lines: ["You are about to remove " + (member ? member.name : "this member") + " from the Paragon team.", "Their team access will be revoked immediately.", "Their activity log will be preserved."]
      }).then(function (result) {
        if (!result.ok) return;
        M.setOverride(memberId, { removed: true });
        M.showToast("Removed — access revocation enforced by backend claims at activation.");
        window.setTimeout(function () { window.location.href = "members.html"; }, 900);
      });
    });
  });
})();

}

/* ================= PAGE MODULE: members.js (runs only on members.html) ================= */
if (paragonTeamPage() === "members.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamMembers.v1";

  var ILLUSTRATIVE = {
    id: "example-admin-john", illustrative: true,
    name: "Admin John", email: "john@email.com", role: "Admin",
    joinedAt: "2026-09-01T09:00:00Z", lastActive: "example record",
    stats: { actions: 456, websitesAdded: 12, ticketsResolved: 89, reviewsRemoved: 34 },
    activity: [
      { icon: "🌐", text: "Added Paragon Vibe to archive", at: "example — Today 2:45 PM" },
      { icon: "🎫", text: "Resolved ticket #247", at: "example — Today 1:12 PM" },
      { icon: "🚀", text: "Approved deployed website My Design Tool", at: "example — Yesterday 4:30 PM" }
    ]
  };

  function readJSON(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || "null") || fallback; }
    catch (error) { return fallback; }
  }
  function writeJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* blocked */ }
  }
  function storeState() { return readJSON(STORE_KEY, { invites: [], exampleLoaded: false, overrides: {} }); }
  function saveState(state) { writeJSON(STORE_KEY, state); }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  /* ---- REAL owner action counting from actual dashboard stores ---- */
  function ownerRealStats() {
    var drafts = readJSON("paragonTeamWebsites.drafts.v1", []).length;
    var overrides = Object.keys(readJSON("paragonTeamWebsites.overrides.v1", {})).length;
    var tickets = readJSON("paragonTeamTickets.v1", []);
    var ticketsResolved = tickets.filter(function (ticket) { return ticket.status === "resolved" || ticket.status === "closed"; }).length;
    var ticketReplies = tickets.reduce(function (total, ticket) { return total + ticket.thread.filter(function (message) { return message.team && message.queued; }).length; }, 0);
    var announcements = readJSON("paragonTeamAnnouncements.v1", []).length;
    var roadmapEdits = readJSON("paragonTeamRoadmap.v1", []).filter(function (item) { return item.pendingPublicSync; }).length;
    var deployedDecisions = readJSON("paragonTeamDeployed.submissions.v1", []).filter(function (submission) { return submission.decidedAt; }).length;
    var moderation = readJSON("paragonTeamUsers.moderation.v1", {});
    var moderationActions = Object.keys(moderation).reduce(function (total, key) { return total + ((moderation[key].history || []).length); }, 0);
    var bugsTriaged = readJSON("paragonTeamBugs.v1", []).filter(function (bug) { return bug.status !== "open" || bug.notes; }).length;
    var requestsManaged = readJSON("paragonTeamRequests.v1", []).reduce(function (total, request) { return total + request.updates.length + (request.status !== "consideration" ? 1 : 0); }, 0);
    var total = drafts + overrides + ticketReplies + ticketsResolved + announcements + roadmapEdits + deployedDecisions + moderationActions + bugsTriaged + requestsManaged;
    return {
      actions: total, websitesAdded: drafts, ticketsResolved: ticketsResolved, reviewsRemoved: 0,
      breakdown: { drafts: drafts, overrides: overrides, ticketReplies: ticketReplies, announcements: announcements, roadmapEdits: roadmapEdits, deployedDecisions: deployedDecisions, moderationActions: moderationActions, bugsTriaged: bugsTriaged, requestsManaged: requestsManaged }
    };
  }

  function ownerRecord() {
    var stats = ownerRealStats();
    return {
      id: "owner-paragon", isOwner: true,
      name: "Paragon", email: "paragon.archive.2026@gmail.com", role: "Super Admin",
      joinedAt: "2026-08-01T09:00:00+01:00", lastActive: "this device",
      stats: stats, activity: ownerActivity()
    };
  }

  function ownerActivity() {
    var events = [];
    readJSON("paragonTeamAnnouncements.v1", []).forEach(function (record) {
      if (record.publishedAt) events.push({ icon: "📢", text: "Published announcement \u201C" + record.title + "\u201D", at: record.publishedAt });
    });
    readJSON("paragonTeamWebsites.drafts.v1", []).forEach(function (draft) {
      events.push({ icon: "➕", text: "Created website draft \u201C" + draft.name + "\u201D", at: draft.createdAt });
    });
    readJSON("paragonTeamDeployed.submissions.v1", []).forEach(function (submission) {
      if (submission.decidedAt) events.push({ icon: "🚀", text: (submission.status === "approved" ? "Approved" : "Rejected") + " deployed submission \u201C" + submission.name + "\u201D", at: submission.decidedAt });
    });
    var moderation = readJSON("paragonTeamUsers.moderation.v1", {});
    Object.keys(moderation).forEach(function (userId) {
      (moderation[userId].history || []).forEach(function (entry) {
        events.push({ icon: "🚫", text: entry.action.charAt(0).toUpperCase() + entry.action.slice(1) + " action on " + userId.replace("example-", "@").replace("local-", "member "), at: entry.at });
      });
    });
    events.sort(function (a, b) { return Date.parse(b.at) - Date.parse(a.at); });
    return events.slice(0, 8).map(function (event) {
      var date = new Date(event.at);
      return { icon: event.icon, text: event.text, at: Number.isNaN(date.getTime()) ? "—" : date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) };
    });
  }

  function allMembers() {
    var state = storeState();
    var list = [ownerRecord()];
    if (state.exampleLoaded) {
      var example = JSON.parse(JSON.stringify(ILLUSTRATIVE));
      var override = state.overrides[example.id] || {};
      Object.assign(example, override);
      if (!override.removed) list.push(example);
    }
    return list;
  }

  function findMember(id) {
    return allMembers().filter(function (member) { return member.id === id; })[0] || null;
  }

  function setOverride(id, patch) {
    var state = storeState();
    state.overrides[id] = Object.assign({}, state.overrides[id] || {}, patch, { pendingBackendSync: true });
    saveState(state);
  }

  var toastHandle = null;
  function showToast(text) {
    var toast = document.getElementById("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3400);
  }

  /* ---- List page ---- */
  function allowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return P.can(P.getRole ? P.getRole() : "super-admin", action);
  }

  function memberCard(member) {
    var joined = new Date(member.joinedAt);
    var suspended = member.suspended;
    var actions = ['<a class="team-mini-link" href="desk.html?page=member-profile&id=' + encodeURIComponent(member.id) + '">View Profile</a>'];
    if (!member.isOwner && allowed("Manage Team Members")) {
      actions.push('<button type="button" class="team-mini-link" data-mact="role" data-id="' + member.id + '">Change Role</button>');
      actions.push('<button type="button" class="team-mini-link danger" data-mact="remove" data-id="' + member.id + '">Remove from Team</button>');
    }
    return '<article class="team-site-row ' + (suspended ? "st-archived" : "st-live") + '">' +
      '<div class="team-site-main"><span class="team-site-icon">👤</span><div class="team-site-copy">' +
        '<div class="team-site-title"><strong>' + escapeHTML(member.name) + '</strong><span class="team-site-cat">' + escapeHTML(member.email) + '</span><span class="team-role-badge">' + escapeHTML(member.role) + '</span>' + (member.isOwner ? '<span class="team-site-localflag" style="border-color:rgba(34,197,94,0.5);color:#22c55e;">real · owner</span>' : '<span class="team-site-localflag">illustrative example</span>') + (suspended ? '<span class="team-site-badge st-archived">⏸️ Suspended</span>' : "") + '</div>' +
        '<div class="team-site-sub">Joined: ' + joined.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) + ' · Last active: ' + escapeHTML(member.lastActive) + ' · Actions: ' + member.stats.actions + (member.isOwner ? " (counted live from this device's dashboard activity)" : "") + '</div>' +
      '</div></div>' +
      '<div class="team-site-actions">' + actions.join("") + '</div>' +
    '</article>';
  }

  function renderList() {
    var listNode = document.getElementById("member-list");
    if (!listNode) return;
    listNode.innerHTML = allMembers().map(memberCard).join("");
    var invites = storeState().invites;
    document.getElementById("invite-list").innerHTML = invites.length
      ? invites.map(function (invite) {
          return '<article class="team-site-row st-scheduled"><div class="team-site-copy">' +
            '<div class="team-site-title"><strong>' + escapeHTML(invite.name) + '</strong><span class="team-site-cat">' + escapeHTML(invite.email) + '</span><span class="team-role-badge">' + escapeHTML(invite.role) + '</span><span class="team-site-localflag">invitation queued — emails at backend activation</span></div>' +
            '<div class="team-site-sub">Invited ' + new Date(invite.at).toLocaleString() + ' · setup link preview: setup.html?mode=role&email=' + encodeURIComponent(invite.email) + '</div>' +
          '</div><div class="team-site-actions"><button type="button" class="team-mini-link danger" data-mact="cancel-invite" data-id="' + invite.id + '">Cancel Invitation</button></div></article>';
        }).join("")
      : '<p class="team-site-sub">No pending invitations.</p>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("member-list")) return;
    renderList();
    document.getElementById("invite-btn").addEventListener("click", function () { document.getElementById("invite-modal").style.display = "flex"; });
    ["invite-close", "invite-cancel"].forEach(function (id) {
      document.getElementById(id).addEventListener("click", function () { document.getElementById("invite-modal").style.display = "none"; });
    });
    document.getElementById("invite-send").addEventListener("click", function () {
      var name = document.getElementById("invite-name").value.trim();
      var email = document.getElementById("invite-email").value.trim();
      var role = document.getElementById("invite-role").value;
      if (!name || !email || !role) { showToast("Full name, email, and role are all required."); return; }
      var state = storeState();
      state.invites.push({ id: "inv-" + Date.now().toString(36), name: name, email: email, role: role, at: new Date().toISOString(), pendingBackendDispatch: true });
      saveState(state);
      document.getElementById("invite-modal").style.display = "none";
      ["invite-name", "invite-email"].forEach(function (id) { document.getElementById(id).value = ""; });
      renderList();
      showToast("Invitation recorded — the system-generated password email dispatches when the security backend activates.");
    });
    document.getElementById("load-members-example").addEventListener("click", function () {
      var state = storeState();
      if (state.exampleLoaded) { showToast("The illustrative example is already loaded."); return; }
      state.exampleLoaded = true;
      saveState(state);
      renderList();
      showToast("Illustrative member loaded — clearly labelled.");
    });
    document.getElementById("member-list").addEventListener("click", handleAction);
    document.getElementById("invite-list").addEventListener("click", handleAction);
  });

  function handleAction(event) {
    var button = event.target.closest("[data-mact]");
    if (!button) return;
    var act = button.dataset.mact;
    var id = button.dataset.id;
    if (act === "cancel-invite") {
      var state = storeState();
      state.invites = state.invites.filter(function (invite) { return invite.id !== id; });
      saveState(state);
      renderList();
      showToast("Invitation cancelled.");
      return;
    }
    var member = findMember(id);
    if (!member) return;
    if (act === "role") {
      window.ParagonTeamConfirm({
        icon: "🔄", title: "CHANGE ROLE", confirmLabel: "Change Role",
        lines: ["Change " + member.name + "'s team role. The permissions matrix applies immediately in previews and via backend claims at activation."],
        field: { type: "select", label: "New role", required: true, value: member.role, options: [{value:"Admin",label:"Admin"},{value:"Developer",label:"Developer"},{value:"Moderator",label:"Moderator"},{value:"Support",label:"Support"},{value:"Analyst",label:"Analyst"}] }
      }).then(function (result) {
        if (!result.ok || !result.value) return;
        setOverride(id, { role: result.value });
        renderList();
        showToast("Role changed to " + result.value + " — backend claims apply it at activation.");
      });
      return;
    }
    if (act === "remove") {
      var removeConfirm = window.ParagonTeamConfirm ? window.ParagonTeamConfirm({
        icon: "🗑️", title: "REMOVE TEAM MEMBER", danger: true, confirmLabel: "Remove from Team",
        lines: [
          "You are about to remove " + member.name + " from the Paragon team.",
          "Their team access will be revoked immediately.",
          "Their activity log will be preserved."
        ]
      }) : Promise.resolve({ ok: false }) /* no modal system — refuse destructive action */;
      removeConfirm.then(function (result) {
        if (!result.ok) return;
        setOverride(id, { removed: true });
        renderList();
        showToast(member.name + " removed — access revocation enforced by backend claims at activation.");
      });
    }
  }

  window.ParagonTeamMembers = { allMembers: allMembers, findMember: findMember, setOverride: setOverride, ownerRealStats: ownerRealStats, storeState: storeState, saveState: saveState, ILLUSTRATIVE: ILLUSTRATIVE, escapeHTML: escapeHTML, showToast: showToast };
})();

}

/* ================= PAGE MODULE: overview.js (runs only on overview.html) ================= */
if (paragonTeamPage() === "overview.html") {
(function () {
  "use strict";

  /* Owner's role-based widget visibility matrix (P-051). */
  var ROLE_WIDGETS = {
    "super-admin": ["stats", "pending", "activity", "charts", "actions", "tickets", "bugs", "deployed", "devapps", "flags", "lockouts"],
    "admin":       ["stats", "pending", "activity", "charts", "actions", "tickets", "bugs", "deployed", "devapps", "flags", "lockouts"],
    "developer":   ["stats", "pending", "bugs"],
    "moderator":   ["pending", "activity", "flags", "deployed"],
    "support":     ["pending", "tickets", "bugs", "actions"],
    "analyst":     ["stats", "charts"]
  };
  var ROLE_LABELS = { "super-admin": "Super Admin", "admin": "Admin", "developer": "Developer", "moderator": "Moderator", "support": "Support", "analyst": "Analyst" };

  var FAMILY_COLORS = ["#2563eb", "#6d5efc", "#f59e0b", "#22c55e", "#ec4899", "#7c869f"];

  function element(id) { return document.getElementById(id); }
  function sites() { return Array.isArray(window.ParagonSites) ? window.ParagonSites : []; }

  function readJSON(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || "null") || fallback; }
    catch (error) { return fallback; }
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  /* ---- Greeting ---- */
  function applyGreeting() {
    var hour = new Date().getHours();
    var word = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    element("dash-greeting").textContent = word;
  }

  /* ---- Quick stats (real local data) ---- */
  function applyStats() {
    var all = sites();
    var live = all.filter(function (site) { return site.siteUrl && site.siteUrl !== "#" && !/^paragon-product-preview\.html/.test(site.siteUrl); });
    var reviews = all.reduce(function (total, site) { return total + (Array.isArray(site.reviews) ? site.reviews.length : 0); }, 0);
    var quizPlays = readJSON("paragonQuiz.results.v1", []).length;
    element("stat-websites").textContent = String(all.length);
    element("stat-websites-sub").textContent = "catalogued · " + live.length + " live";
    element("stat-reviews").textContent = String(reviews);
    element("stat-plays").textContent = String(quizPlays);
  }

  /* ---- Pending actions (real queues; backend queues honestly at zero) ---- */
  function applyPending() {
    var incidents = (readJSON("paragonTeamPortal.security.v1", { incidents: [] }).incidents || []).length;
    element("pending-lockouts").textContent = String(incidents);
    element("dash-bell-count").textContent = String(incidents);
    // tickets/bugs/deployed/devapps/flags stay at their real value: zero, until their backends exist.
  }

  /* ---- Recent activity from real local sources ---- */
  function relativeTime(iso) {
    var diff = Date.now() - Date.parse(iso || 0);
    if (!Number.isFinite(diff) || diff < 0) return "recently";
    var minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + " min" + (minutes === 1 ? "" : "s") + " ago";
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " hour" + (hours === 1 ? "" : "s") + " ago";
    var days = Math.floor(hours / 24);
    return days + " day" + (days === 1 ? "" : "s") + " ago";
  }

  function collectActivity() {
    var events = [];
    // Live product launches + newest catalogue additions (real catalogue data).
    sites().forEach(function (site) {
      if (site.siteUrl && !/^paragon-product-preview\.html/.test(site.siteUrl) && site.siteUrl !== "#" && site.name !== "Paragon Archive Hub") {
        events.push({ at: site.addedAt || "2026-08-17T12:00:00+01:00", icon: "🚀", text: site.name + " went live in the archive", link: "../paragon-archive.html?site=" + encodeURIComponent(site.name), label: "View Website" });
      }
    });
    var newest = sites().slice().sort(function (a, b) { return Date.parse(b.addedAt || 0) - Date.parse(a.addedAt || 0); }).slice(0, 3);
    newest.forEach(function (site) {
      events.push({ at: site.addedAt, icon: "🌐", text: site.name + " was added to the archive", link: "../paragon-archive.html?site=" + encodeURIComponent(site.name), label: "View Website" });
    });
    // Community joins (real membership records).
    for (var index = 0; index < window.localStorage.length; index += 1) {
      var key = window.localStorage.key(index) || "";
      if (key.indexOf("paragonCommunityMembership:") === 0) {
        var record = readJSON(key, null);
        if (record && record.joinedAt) events.push({ at: record.joinedAt, icon: "👥", text: (record.displayName || "A member") + " joined the Paragon Community", link: "../paragon-archive-hub.html#community", label: "View Community" });
      }
    }
    // User-created quizzes (real).
    readJSON("paragonQuiz.quizzes.v1", []).forEach(function (quiz) {
      events.push({ at: quiz.createdAt, icon: "🎮", text: "Quiz \u201C" + quiz.title + "\u201D was published on Paragon Quiz", link: "../paragon-quiz/play.html?id=" + encodeURIComponent(quiz.id), label: "Play Quiz" });
    });
    // Portal security incidents (real).
    (readJSON("paragonTeamPortal.security.v1", { incidents: [] }).incidents || []).forEach(function (incident) {
      events.push({ at: incident.at, icon: "🔒", text: "Team portal lockout after 5 failed attempts on this device", link: "login.html", label: "View Portal" });
    });
    events.sort(function (a, b) { return Date.parse(b.at || 0) - Date.parse(a.at || 0); });
    return events.slice(0, 8);
  }

  function applyActivity() {
    var list = element("dash-activity-list");
    var events = collectActivity();
    list.innerHTML = events.length
      ? events.map(function (event) {
          return '<li><span class="team-activity-dot" aria-hidden="true">' + event.icon + '</span><div><p>' + escapeHTML(event.text) + '</p><a href="' + event.link + '">' + escapeHTML(event.label) + ' →</a></div><time>' + relativeTime(event.at) + '</time></li>';
        }).join("")
      : '<li class="team-activity-empty">No recorded activity yet on this device. Real events appear as they happen.</li>';
  }

  /* ---- Charts ---- */
  function applyUserChart() {
    var chart = element("chart-users");
    var bars = [];
    for (var day = 29; day >= 0; day -= 1) {
      var date = new Date(); date.setDate(date.getDate() - day);
      var label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      // Real value: zero new users until the accounts backend exists.
      bars.push('<span class="team-bar" style="height:4%" title="' + label + ": 0 new users" + '"></span>');
    }
    chart.innerHTML = bars.join("");
  }

  function familyOf(category) {
    var map = { Tools: "Tools", Productivity: "Tools", "Dev Tools": "Developer", Creative: "Creative", Media: "Creative", Education: "Education", Social: "Social", Games: "Games", Entertainment: "Games", Finance: "Other", Lifestyle: "Other", Health: "Other", Originals: "Other", Deployed: "Other" };
    return map[category] || "Other";
  }

  function applyPieChart() {
    var counts = {};
    sites().forEach(function (site) {
      var family = familyOf(site.category);
      counts[family] = (counts[family] || 0) + 1;
    });
    var total = sites().length || 1;
    var entries = Object.keys(counts).map(function (family) {
      return { family: family, percent: Math.round((counts[family] / total) * 100) };
    }).sort(function (a, b) { return b.percent - a.percent; });
    var gradient = [];
    var legend = [];
    var cursor = 0;
    entries.forEach(function (entry, index) {
      var color = FAMILY_COLORS[index % FAMILY_COLORS.length];
      var span = (counts[entry.family] / total) * 360;
      gradient.push(color + " " + cursor + "deg " + (cursor + span) + "deg");
      cursor += span;
      legend.push('<li><i style="background:' + color + '"></i>' + escapeHTML(entry.family) + " " + entry.percent + "%</li>");
    });
    element("chart-pie").style.background = "conic-gradient(" + gradient.join(", ") + ")";
    element("chart-pie-legend").innerHTML = legend.join("");
  }

  /* ---- Role matrix ---- */
  function applyRole(role) {
    var allowed = ROLE_WIDGETS[role] || ROLE_WIDGETS["super-admin"];
    document.querySelectorAll("[data-widget]").forEach(function (node) {
      node.hidden = allowed.indexOf(node.dataset.widget) === -1;
    });
    element("dash-role-badge").textContent = "[" + (ROLE_LABELS[role] || role) + "]";
    element("dash-greeting-sub").textContent = role === "analyst"
      ? "Here are today's numbers."
      : "Here is what needs your attention today.";
  }

  /* ---- Toast for future pages ---- */
  var toastHandle = null;
  function showToast(text) {
    var toast = element("dash-toast");
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 2600);
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyGreeting();
    applyStats();
    applyPending();
    applyActivity();
    applyUserChart();
    applyPieChart();
    var sharedRole = window.ParagonTeamPermissions && window.ParagonTeamPermissions.getRole ? window.ParagonTeamPermissions.getRole() : "super-admin";
    element("dash-role-select").value = sharedRole;
    applyRole(sharedRole);
    element("dash-role-select").addEventListener("change", function () {
      if (window.ParagonTeamPermissions && window.ParagonTeamPermissions.setRole) window.ParagonTeamPermissions.setRole(this.value); /* P-097 — broadcast updates sidebar + chip too */
      applyRole(this.value);
      if (window.ParagonDesk && window.ParagonDesk.refresh) window.ParagonDesk.refresh(); /* re-check the routed panel's role law */
    });
    window.addEventListener("paragon:role-change", function (event) {
      var select = element("dash-role-select");
      if (select && event.detail && select.value !== event.detail.role) { select.value = event.detail.role; applyRole(event.detail.role); }
    });
    document.querySelectorAll("[data-future]").forEach(function (button) {
      button.addEventListener("click", function () { showToast("🧭 " + button.dataset.future + " — arrives with the next Team spec pages."); });
    });
    element("view-lockouts-btn").addEventListener("click", function () {
      var incidents = readJSON("paragonTeamPortal.security.v1", { incidents: [] }).incidents || [];
      showToast(incidents.length ? incidents.length + " lockout incident(s) recorded on this device, queued for owner alerts at backend activation." : "No lockout incidents recorded on this device.");
    });
    element("dash-notifications").addEventListener("click", function () {
      var count = element("dash-bell-count").textContent;
      showToast(count === "0" ? "No team notifications yet — they arrive with the backend queues." : count + " security incident(s) on this device.");
    });
  });

  window.ParagonTeamOverview = { ROLE_WIDGETS: ROLE_WIDGETS, applyRole: applyRole, collectActivity: collectActivity, familyOf: familyOf };
})();

}

/* ================= PAGE MODULE: permissions-page.js (runs only on permissions.html) ================= */
if (paragonTeamPage() === "permissions.html") {
(function () {
  "use strict";

  var P = window.ParagonTeamPermissions;
  var COLUMNS = [
    { key: "sa", label: "Super Admin" }, { key: "ad", label: "Admin" }, { key: "dev", label: "Developer" },
    { key: "mod", label: "Moderator" }, { key: "sup", label: "Support" }, { key: "an", label: "Analyst" }
  ];

  function cell(value) {
    if (value === true) return '<td class="perm-yes">✅</td>';
    if (value === false) return '<td class="perm-no">❌</td>';
    var label = value === "own" ? "✅ own only" : value === "limited" ? "✅ limited" : value === "own-websites" ? "✅ own websites" : value === "own-level-below" ? "own level & below" : value;
    return '<td class="perm-qualified">' + label + '</td>';
  }

  function renderHierarchy() {
    document.getElementById("perm-hierarchy").innerHTML = P.HIERARCHY.map(function (role) {
      return '<article class="team-site-row ' + (role.rank <= 2 ? "st-live" : role.rank <= 4 ? "st-preview" : "st-scheduled") + '">' +
        '<div class="team-site-copy"><div class="team-site-title">' +
          '<strong>' + role.rank + '. ' + role.label + '</strong>' +
          (role.key === "super-admin" ? '<span class="team-site-localflag" style="border-color:rgba(34,197,94,0.5);color:#22c55e;">that\u2019s you</span>' : "") +
        '</div><div class="team-site-sub">' + role.note + '</div></div>' +
      '</article>';
    }).join("");
  }

  function renderTable(highlight) {
    var head = '<thead><tr><th>Action</th>' + COLUMNS.map(function (column) {
      return '<th class="' + (column.key === highlight ? "perm-highlight" : "") + '">' + column.label + '</th>';
    }).join("") + '</tr></thead>';
    var body = '<tbody>' + P.PERMISSIONS.map(function (row) {
      return '<tr><td class="perm-action">' + row.action + '</td>' + COLUMNS.map(function (column) {
        var markup = cell(row[column.key]);
        return column.key === highlight ? markup.replace("<td", '<td data-hl="1"') : markup;
      }).join("") + '</tr>';
    }).join("") + '</tbody>';
    document.getElementById("perm-table").innerHTML = head + body;
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderHierarchy();
    renderTable("");
    document.getElementById("perm-highlight").addEventListener("change", function () {
      renderTable(this.value);
    });
  });
})();

}

/* ================= PAGE MODULE: profile.js (runs only on profile.html) ================= */
if (paragonTeamPage() === "profile.html") {
(function () {
  "use strict";

  var PROFILE_KEY = "paragonTeamProfile.v1";

  function element(id) { return document.getElementById(id); }
  function readJSON(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || "null") || fallback; }
    catch (error) { return fallback; }
  }
  function writeJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* blocked */ }
  }

  var toastHandle = null;
  function showToast(text) {
    var toast = element("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3400);
  }
  function setStatus(text, tone) {
    var status = element("prof-status");
    status.hidden = !text;
    status.textContent = text || "";
    status.dataset.tone = tone || "info";
  }

  function passwordChecks(value) {
    return { length: value.length >= 12, upper: /[A-Z]/.test(value), number: /[0-9]/.test(value), symbol: /[^A-Za-z0-9]/.test(value) };
  }

  function deviceLabel() {
    var ua = window.navigator.userAgent || "";
    var browser = /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /Firefox/.test(ua) ? "Firefox" : /Chrome/.test(ua) ? "Chrome" : /Safari/.test(ua) ? "Safari" : "Browser";
    var os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Device";
    return browser + " on " + os;
  }

  function applyProfile() {
    var profile = readJSON(PROFILE_KEY, {});
    var name = profile.displayName || "Paragon";
    var email = profile.email || "paragon.archive.2026@gmail.com";
    element("prof-name").textContent = name;
    element("prof-email").textContent = email;
    element("edit-name").value = name;
    element("edit-email").value = email;
    var avatar = element("prof-avatar");
    if (profile.photo) {
      avatar.style.backgroundImage = "url(" + profile.photo + ")";
      avatar.style.backgroundSize = "cover";
      avatar.textContent = "";
    } else {
      avatar.style.backgroundImage = "";
      avatar.textContent = name.slice(0, 1).toUpperCase();
    }
  }

  function applyStats() {
    var M = window.ParagonTeamMembers;
    var stats = M ? M.ownerRealStats() : { actions: 0, websitesAdded: 0, breakdown: {} };
    element("pstat-total").textContent = String(stats.actions);
    element("pstat-added").textContent = String(stats.websitesAdded);
    var managed = (stats.breakdown.overrides || 0) + (stats.breakdown.drafts || 0);
    element("pstat-managed").textContent = String(managed);
    var joined = new Date("2026-08-01T09:00:00+01:00");
    element("pstat-days").textContent = String(Math.max(0, Math.floor((Date.now() - joined.getTime()) / 86400000)));
    element("prof-lastactive").textContent = "Last Active: " + new Date().toLocaleString(undefined, { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }) + " (now, this device)";
  }

  function renderSessions() {
    element("prof-sessions").innerHTML =
      '<article class="team-site-row st-live"><div class="team-site-copy">' +
        '<div class="team-site-title"><strong>' + deviceLabel() + '</strong><span class="team-site-badge st-live">🟢 Active now</span><span class="team-site-localflag" style="border-color:rgba(34,197,94,0.5);color:#22c55e;">this device · real</span></div>' +
        '<div class="team-site-sub">Location and IP are captured server-side at backend activation.</div>' +
      '</div></article>';
  }

  function saveChanges() {
    var name = element("edit-name").value.trim();
    var email = element("edit-email").value.trim();
    if (!name || !email) { setStatus("Display name and email are required.", "signed-out"); return; }
    var profile = readJSON(PROFILE_KEY, {});
    profile.displayName = name;
    profile.email = email;
    profile.pendingBackendSync = true;

    var current = element("edit-pw-current").value;
    var next = element("edit-pw-new").value;
    var confirm = element("edit-pw-confirm").value;
    var passwordMessage = "";
    if (next || confirm || current) {
      var problems = [];
      if (!current) problems.push("enter your current password");
      var checks = passwordChecks(next);
      if (!checks.length) problems.push("new password needs 12+ characters");
      if (!checks.upper) problems.push("an uppercase letter");
      if (!checks.number) problems.push("a number");
      if (!checks.symbol) problems.push("a symbol");
      if (next !== confirm) problems.push("both new passwords must match");
      if (problems.length) { setStatus("Password change: " + problems.join(", ") + ".", "signed-out"); return; }
      profile.passwordChangeQueuedAt = new Date().toISOString();
      passwordMessage = " Password change passed the full policy and is queued — it applies through the security backend at activation; nothing was transmitted.";
      ["edit-pw-current", "edit-pw-new", "edit-pw-confirm"].forEach(function (id) { element(id).value = ""; });
    }
    writeJSON(PROFILE_KEY, profile);
    applyProfile();
    setStatus("✅ Profile saved on this device and flagged for backend sync." + passwordMessage, "member");
    showToast("Profile saved.");
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyProfile();
    applyStats();
    renderSessions();
    element("prof-save").addEventListener("click", saveChanges);
    element("prof-edit-jump").addEventListener("click", function () {
      element("prof-edit-section").scrollIntoView({ behavior: "smooth", block: "start" });
      element("edit-name").focus();
    });
    element("prof-photo").addEventListener("change", function () {
      var file = this.files && this.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var data = String(reader.result);
        if (data.length > 200000) { showToast("Choose a smaller image (under ~150KB) for the local preview."); return; }
        var profile = readJSON(PROFILE_KEY, {});
        profile.photo = data;
        profile.pendingBackendSync = true;
        writeJSON(PROFILE_KEY, profile);
        applyProfile();
        showToast("Photo updated — uploads to storage at backend activation.");
      };
      reader.readAsDataURL(file);
    });
    element("prof-logout-others").addEventListener("click", function () {
      showToast("Remote session logout queues here and executes when server-side sessions exist — only this device has a session today.");
    });
  });

  window.ParagonTeamProfile = { passwordChecks: passwordChecks, deviceLabel: deviceLabel, PROFILE_KEY: PROFILE_KEY };
})();

}

/* ================= PAGE MODULE: promotions.js (runs only on promotions.html) ================= */
if (paragonTeamPage() === "promotions.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamPromotions.v1";
  var RUN_HOURS = 72;

  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
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
    window.setTimeout(function () { toast.hidden = true; }, 3200);
  }
  function allowed() {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return !!P.can(P.getRole ? P.getRole() : "super-admin", "Publish Announcements");
  }
  function showError(text) {
    var node = document.getElementById("promo-error");
    if (!node) return;
    node.textContent = text;
    node.style.display = text ? "block" : "none";
  }

  function validate() {
    var type = document.getElementById("promo-type").value;
    var sponsor = document.getElementById("promo-sponsor").value.trim();
    var title = document.getElementById("promo-title").value.trim();
    var body = document.getElementById("promo-body").value.trim();
    if (title.length < 4) return { error: "The title needs at least 4 characters." };
    if (body.length < 10) return { error: "The message needs at least 10 characters." };
    if (type === "sponsored" && !sponsor) return { error: "Sponsored notices MUST name the sponsor — the disclosure is a platform rule." };
    return { record: { type: type, sponsor: type === "sponsored" ? sponsor : "", title: title, body: body, audience: document.getElementById("promo-audience").value } };
  }

  function hoursLeft(publishedAt) {
    var expiry = Date.parse(publishedAt) + RUN_HOURS * 3600000;
    return Math.max(0, Math.round((expiry - Date.now()) / 3600000));
  }

  function render() {
    if (typeof document === "undefined" || !document.getElementById("promo-list")) return;
    var list = readStore();
    var now = Date.now();
    /* Auto-expire past-72h published notices (real countdown, real expiry) */
    var changed = false;
    list.forEach(function (notice) {
      if (notice.status === "published" && Date.parse(notice.publishedAt) + RUN_HOURS * 3600000 < now) {
        notice.status = "expired";
        changed = true;
      }
    });
    if (changed) writeStore(list);

    var drafts = list.filter(function (n) { return n.status === "draft"; }).length;
    var live = list.filter(function (n) { return n.status === "published"; }).length;
    var expired = list.filter(function (n) { return n.status === "expired"; }).length;
    document.getElementById("promo-stats").innerHTML =
      '<div class="team-stat-box"><b>' + list.length + '</b><span>Total</span></div>' +
      '<div class="team-stat-box"><b>' + drafts + '</b><span>📝 Drafts</span></div>' +
      '<div class="team-stat-box"><b>' + live + '</b><span>📣 In 72h window</span></div>' +
      '<div class="team-stat-box"><b>' + expired + '</b><span>⌛ Expired</span></div>';
    document.getElementById("promo-total").textContent = list.length + (list.length === 1 ? " notice" : " notices");

    var container = document.getElementById("promo-list");
    if (!list.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📣</div><h3>No notices yet</h3><p>Compose the first sponsored or promotional notice above. Nothing fake lives here — the list starts honestly empty.</p></div>';
      return;
    }
    container.innerHTML = list.slice().reverse().map(function (notice) {
      var chip = notice.status === "draft" ? '<span class="team-status-chip st-scheduled">📝 Draft</span>'
        : notice.status === "published" ? '<span class="team-status-chip st-live">📣 Published · ' + hoursLeft(notice.publishedAt) + 'h left · pendingBackendDispatch</span>'
        : '<span class="team-status-chip st-archived">⌛ Expired</span>';
      return '<article class="team-site-card" data-id="' + escapeHTML(notice.id) + '">' +
        '<div class="team-site-main">' +
          '<div class="team-site-titleline"><b>' + escapeHTML(notice.title) + '</b>' + chip +
            (notice.type === "sponsored" ? '<span class="team-status-chip st-preview">🤝 Sponsored — disclosure shown</span>' : '<span class="team-status-chip st-preview">📣 Promotion</span>') +
          '</div>' +
          '<p class="team-site-sub">Audience: ' + escapeHTML(notice.audience) + (notice.sponsor ? ' · Sponsor: ' + escapeHTML(notice.sponsor) : "") + '</p>' +
          '<p class="team-site-desc">' + escapeHTML(notice.body) + '</p>' +
          '<div class="promo-user-preview"><small>USER PREVIEW</small><div>' + (notice.type === "sponsored" ? '<i>Sponsored · ' + escapeHTML(notice.sponsor) + '</i>' : '<i>Paragon promotion</i>') + '<strong>' + escapeHTML(notice.title) + '</strong><span>' + escapeHTML(notice.body) + '</span></div></div>' +
        '</div>' +
        '<div class="team-site-actions">' +
          (notice.status === "draft" ? '<button type="button" class="primary-action" data-act="publish">📣 Publish</button>' : "") +
          (notice.status === "published" ? '<button type="button" class="secondary-action deployed-reject" data-act="stop">🛑 Stop early</button>' : "") +
          '<button type="button" class="secondary-action" data-act="delete">🗑️ Delete</button>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  function saveRecord(status) {
    if (!allowed()) { showToast("🔐 Your role cannot publish notices."); return; }
    var result = validate();
    if (result.error) { showError(result.error); return; }
    showError("");
    var finishSave = function () {
      var list = readStore();
      var record = result.record;
      record.id = "promo-" + Date.now();
      record.status = status;
      record.createdAt = new Date().toISOString();
      if (status === "published") { record.publishedAt = record.createdAt; record.pendingBackendDispatch = true; }
      list.push(record);
      writeStore(list);
      ["promo-title", "promo-body", "promo-sponsor"].forEach(function (id) { document.getElementById(id).value = ""; });
      showToast(status === "published" ? "📣 Notice published — delivery queues for the backend, 72h window started." : "💾 Draft saved.");
      render();
    };
    if (status === "published") {
      window.ParagonTeamConfirm({
        icon: "📣", title: "Publish this notice",
        lines: ["It enters its real 72-hour window immediately.",
                result.record.type === "sponsored" ? "• Users ALWAYS see the “Sponsored · " + result.record.sponsor + "” disclosure." : "• It is labelled as a Paragon promotion.",
                "• Actual device delivery activates with the notification backend (honestly queued until then)."],
        confirmLabel: "Publish notice"
      }).then(function (confirmed) { if (confirmed.ok) finishSave(); });
    } else finishSave();
  }

  function onListClick(event) {
    var button = event.target.closest("[data-act]");
    if (!button) return;
    if (!allowed()) { showToast("🔐 Your role cannot manage notices."); return; }
    var id = button.closest("[data-id]").getAttribute("data-id");
    var act = button.getAttribute("data-act");
    var list = readStore();
    var notice = list.filter(function (n) { return n.id === id; })[0];
    if (!notice) return;
    if (act === "publish") {
      window.ParagonTeamConfirm({
        icon: "📣", title: "Publish draft",
        lines: ["“" + notice.title + "” enters its 72-hour window now."],
        confirmLabel: "Publish"
      }).then(function (confirmed) {
        if (!confirmed.ok) return;
        notice.status = "published";
        notice.publishedAt = new Date().toISOString();
        notice.pendingBackendDispatch = true;
        writeStore(list); showToast("📣 Published."); render();
      });
      return;
    }
    if (act === "stop") {
      window.ParagonTeamConfirm({
        icon: "🛑", title: "Stop notice early",
        lines: ["“" + notice.title + "” leaves its 72-hour window immediately.", "• A reason is required for the record."],
        requireReason: true, reasonLabel: "Stop reason", confirmLabel: "Stop notice", danger: true
      }).then(function (confirmed) {
        if (!confirmed.ok) return;
        notice.status = "expired";
        notice.stopReason = confirmed.reason;
        writeStore(list); showToast("🛑 Notice stopped."); render();
      });
      return;
    }
    if (act === "delete") {
      window.ParagonTeamConfirm({
        icon: "🗑️", title: "Delete notice",
        lines: ["Permanently delete “" + notice.title + "”?"],
        confirmLabel: "Delete", danger: true
      }).then(function (confirmed) {
        if (!confirmed.ok) return;
        writeStore(list.filter(function (n) { return n.id !== id; }));
        showToast("🗑️ Deleted."); render();
      });
    }
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.getElementById("promo-list")) return;
      render();
      document.getElementById("promo-save-draft").addEventListener("click", function () { saveRecord("draft"); });
      document.getElementById("promo-publish").addEventListener("click", function () { saveRecord("published"); });
      document.getElementById("promo-list").addEventListener("click", onListClick);
    });
  }

  window.ParagonTeamPromotions = { STORE_KEY: STORE_KEY, RUN_HOURS: RUN_HOURS, readStore: readStore, writeStore: writeStore };
})();

}

/* ================= PAGE MODULE: requests.js (runs only on requests.html) ================= */
if (paragonTeamPage() === "requests.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamRequests.v1";
  var STATUS_META = {
    consideration: { label: "🟡 Under Consideration", cls: "st-scheduled" },
    progress: { label: "🔵 In Progress", cls: "st-preview" },
    rejected: { label: "❌ Rejected", cls: "st-archived" },
    complete: { label: "✅ Complete", cls: "st-live" }
  };

  var EXAMPLES = [
    { id: "req-maps", illustrative: true, name: "Paragon Maps", description: "Navigation and maps for Africa", category: "Tools", count: 247, status: "consideration", createdAt: "2027-01-10T09:00:00Z", updates: [] },
    { id: "req-translate2", illustrative: true, name: "Paragon Translate V2", description: "Better translation with more languages", category: "Tools", count: 189, status: "progress", createdAt: "2027-01-12T09:00:00Z", updates: [] }
  ];

  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
  }
  function updateRequest(id, mutate) {
    var list = readStore();
    var request = list.filter(function (entry) { return entry.id === id; })[0];
    if (!request) return;
    mutate(request);
    writeStore(list);
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  var toastHandle = null;
  function showToast(text) {
    var toast = document.getElementById("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3200);
  }

  function allowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return P.can(P.getRole ? P.getRole() : "super-admin", action);
  }

  function cardMarkup(request) {
    var status = STATUS_META[request.status];
    var buttons = [];
    var mayDecide = allowed("Approve Website Requests");
    if (!mayDecide) {
      buttons.push('<button type="button" class="team-mini-link" data-ract="update" data-id="' + request.id + '">Send Update to Requester' + (request.count > 1 ? "s" : "") + '</button>');
      return wrapCard(request, buttons);
    }
    if (request.status === "consideration") {
      buttons.push('<button type="button" class="team-mini-link" data-ract="progress" data-id="' + request.id + '">Mark as In Progress</button>');
      buttons.push('<button type="button" class="team-mini-link danger" data-ract="rejected" data-id="' + request.id + '">Mark as Rejected</button>');
      buttons.push('<button type="button" class="team-mini-link" data-ract="complete" data-id="' + request.id + '">Mark as Complete</button>');
    } else if (request.status === "progress") {
      buttons.push('<button type="button" class="team-mini-link" data-ract="complete" data-id="' + request.id + '">Mark as Complete</button>');
      buttons.push('<button type="button" class="team-mini-link" data-ract="consideration" data-id="' + request.id + '">Back to Consideration</button>');
    } else {
      buttons.push('<button type="button" class="team-mini-link" data-ract="consideration" data-id="' + request.id + '">Reopen</button>');
    }
    buttons.push('<button type="button" class="team-mini-link" data-ract="update" data-id="' + request.id + '">Send Update to Requester' + (request.count > 1 ? "s" : "") + '</button>');
    return wrapCard(request, buttons);
  }

  function wrapCard(request, buttons) {
    var status = STATUS_META[request.status];
    return '<article class="team-site-row ' + status.cls + '">' +
      '<div class="team-site-copy">' +
        '<div class="team-site-title"><strong>🔥 ' + request.count + ' request' + (request.count === 1 ? "" : "s") + '</strong><span class="team-site-cat">' + escapeHTML(request.name) + '</span>' + (request.illustrative ? '<span class="team-site-localflag">illustrative example</span>' : "") + '</div>' +
        '<div class="team-site-sub">Category: ' + escapeHTML(request.category) + ' · ' + escapeHTML(request.description) + '</div>' +
        '<div class="team-site-title" style="margin-top:6px;"><span class="team-site-badge ' + status.cls + '">' + status.label + '</span></div>' +
        (request.updates.length ? '<div class="team-site-sub">📨 ' + request.updates.length + ' update(s) queued for requester email dispatch at backend activation</div>' : "") +
      '</div>' +
      '<div class="team-site-actions">' + buttons.join("") + '</div>' +
    '</article>';
  }

  function render() {
    var sort = document.getElementById("req-sort").value;
    var category = document.getElementById("req-category").value;
    var status = document.getElementById("req-status").value;
    var list = readStore().filter(function (request) {
      if (category !== "all" && request.category !== category) return false;
      if (status !== "all" && request.status !== status) return false;
      return true;
    });
    list.sort(function (a, b) {
      if (sort === "newest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      return b.count - a.count;
    });
    document.getElementById("req-total").textContent = list.length + " request group" + (list.length === 1 ? "" : "s") + " (real requests arrive with the Supabase backend — the public live count already works)";
    document.getElementById("req-list").innerHTML = list.length
      ? list.map(cardMarkup).join("")
      : '<div class="empty-state"><div class="empty-icon">📬</div><h3>No requests yet</h3><p>Real community requests appear here from the Supabase request table after activation — the public request counter is already zero-safe and honest. Load the illustrative examples to preview the workflow.</p></div>';
  }

  function fillCategories() {
    var select = document.getElementById("req-category");
    ["Tools", "Productivity", "Creative", "Education", "Social", "Games", "Entertainment", "Finance", "Lifestyle", "Dev Tools", "Other"].forEach(function (category) {
      var option = document.createElement("option");
      option.value = category; option.textContent = category;
      select.appendChild(option);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillCategories();
    render();
    ["req-sort", "req-category", "req-status"].forEach(function (id) {
      document.getElementById(id).addEventListener("change", render);
    });
    document.getElementById("load-requests-example").addEventListener("click", function () {
      var list = readStore();
      if (list.some(function (request) { return request.illustrative; })) { showToast("Illustrative examples already loaded."); return; }
      writeStore(list.concat(JSON.parse(JSON.stringify(EXAMPLES))));
      render();
      showToast("Illustrative requests loaded — clearly labelled.");
    });
    document.getElementById("req-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-ract]");
      if (!button) return;
      var action = button.dataset.ract;
      var id = button.dataset.id;
      if (action === "update") {
        window.ParagonTeamConfirm({
          icon: "📨", title: "SEND UPDATE TO REQUESTERS", confirmLabel: "Queue Update",
          lines: ["This message goes to everyone who requested this website (emails dispatch at backend activation)."],
          requireReason: true, reasonLabel: "Update message"
        }).then(function (result) {
          if (!result.ok) return;
          updateRequest(id, function (request) { request.updates.push({ text: result.reason, at: new Date().toISOString(), pendingBackendDispatch: true }); });
          showToast("Update queued — it emails every requester when the backend activates.");
          render();
        });
      } else {
        updateRequest(id, function (request) { request.status = action; });
        if (action === "complete") showToast("Marked Complete — requesters are notified at backend activation. Time to build it!");
        if (action === "rejected") showToast("Marked Rejected — recorded.");
      }
      render();
    });
  });

  window.ParagonTeamRequests = { readStore: readStore, writeStore: writeStore, updateRequest: updateRequest, EXAMPLES: EXAMPLES, STATUS_META: STATUS_META };
})();

}

/* ================= PAGE MODULE: roadmap.js (runs only on roadmap.html) ================= */
if (paragonTeamPage() === "roadmap.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamRoadmap.v1";

  /* Seed = the REAL public roadmap as it stands today (v0.40.0), not invented milestones. */
  var SEED = [
    { id: "c1", group: "completed", title: "Paragon Archive application built", detail: "August 2026 — three-tab Archive, search, details, PWA", percent: 100, isPublic: true },
    { id: "c2", group: "completed", title: "Archive catalogue documented", detail: "August 2026 — 107 websites recorded with previews", percent: 100, isPublic: true },
    { id: "c3", group: "completed", title: "Archive Hub published", detail: "August 2026 — documentation, policies, forms", percent: 100, isPublic: true },
    { id: "c4", group: "completed", title: "Hub Home, Community & Team pages", detail: "August 17, 2026 — the Hub became a multi-page product", percent: 100, isPublic: true },
    { id: "p1", group: "progress", title: "Community Platform", detail: "Discussion board and community features", percent: 50, isPublic: true, milestoneDerived: true },
    { id: "p2", group: "progress", title: "Developer Portal and Deployed Category", detail: "Application system and third-party publishing", percent: 33, isPublic: true, milestoneDerived: true },
    { id: "p3", group: "progress", title: "Paragon Archive Mobile App", detail: "Native experience beyond the installable PWA", percent: 17, isPublic: true, milestoneDerived: true },
    { id: "n1", group: "planned", title: "Paragon Archive Platform Launch", detail: "Target: August 2027 — the archive goes live", percent: 0, isPublic: true },
    { id: "n2", group: "planned", title: "First 100 Websites Live", detail: "2027 target — every catalogued website built", percent: 0, isPublic: true },
    { id: "n3", group: "planned", title: "Websites 101–200", detail: "Second wave of Paragon websites", percent: 0, isPublic: true },
    { id: "n4", group: "planned", title: "Multi-language Support", detail: "Archive in 10+ languages", percent: 0, isPublic: true },
    { id: "n5", group: "planned", title: "Paragon Archive Desktop App", detail: "Native desktop experience", percent: 0, isPublic: true },
    { id: "f1", group: "coming", title: "🧬 RxLife Network", detail: "Healthcare professionals, patients and pharma resources in one network", percent: 0, isPublic: true, hintOnly: true },
    { id: "f2", group: "coming", title: "💊 Pharmapaedia", detail: "The most accessible encyclopedia of pharmaceutical knowledge", percent: 0, isPublic: true, hintOnly: true },
    { id: "f3", group: "coming", title: "🌐 More Paragon Platforms", detail: "Multiple products in early concept stages", percent: 0, isPublic: true, hintOnly: true },
    { id: "f4", group: "coming", title: "🏗️ Paragon Ecosystem", detail: "All connected, all free, for everyone", percent: 0, isPublic: true, hintOnly: true }
  ];

  var GROUP_ICON = { completed: "✅", progress: "🔄", planned: "📅", coming: "🔮" };
  var editingId = null;

  function readStore() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(STORE_KEY) || "null");
      if (!raw) { writeStore(SEED); return JSON.parse(JSON.stringify(SEED)); }
      return raw;
    } catch (error) { return JSON.parse(JSON.stringify(SEED)); }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
  }
  function updateItem(id, mutate) {
    var list = readStore();
    var item = list.filter(function (entry) { return entry.id === id; })[0];
    if (!item) return;
    mutate(item);
    item.pendingPublicSync = true;
    writeStore(list);
    render();
  }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }
  function element(id) { return document.getElementById(id); }

  var toastHandle = null;
  function showToast(text) {
    var toast = element("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3200);
  }

  function cardMarkup(item) {
    var actions = ['<button type="button" class="team-mini-link" data-rmact="edit" data-id="' + item.id + '">Edit</button>'];
    if (item.group === "completed") actions.push('<button type="button" class="team-mini-link" data-rmact="to-progress" data-id="' + item.id + '">Move to In Progress</button>');
    if (item.group === "progress") {
      actions.push('<button type="button" class="team-mini-link" data-rmact="complete" data-id="' + item.id + '">Mark Complete</button>');
      actions.push('<button type="button" class="team-mini-link" data-rmact="to-planned" data-id="' + item.id + '">Move to Planned</button>');
    }
    if (item.group === "planned") actions.push('<button type="button" class="team-mini-link" data-rmact="to-progress" data-id="' + item.id + '">Move to In Progress</button>');
    actions.push('<button type="button" class="team-mini-link danger" data-rmact="delete" data-id="' + item.id + '">Delete</button>');
    var progressBlock = item.group === "progress"
      ? '<div class="rm-progress-row"><div class="hub-progress-track rm-track"><div class="hub-progress-fill" style="width:' + item.percent + '%"></div></div><span class="rm-percent-label">' + item.percent + '%</span></div>' +
        '<div class="rm-update-row">Update Progress: <input type="number" min="0" max="100" value="' + item.percent + '" data-rmpercent="' + item.id + '"> % <button type="button" class="team-mini-link" data-rmact="setpercent" data-id="' + item.id + '">Update</button>' + (item.milestoneDerived ? '<small>public page shows the milestone-derived value until sync (D-116)</small>' : "") + '</div>'
      : "";
    return '<article class="team-site-row ' + (item.group === "completed" ? "st-live" : item.group === "progress" ? "st-preview" : item.group === "planned" ? "st-scheduled" : "st-draft") + '">' +
      '<div class="team-site-copy">' +
        '<div class="team-site-title"><strong>' + GROUP_ICON[item.group] + ' ' + escapeHTML(item.title) + '</strong>' + (item.pendingPublicSync ? '<span class="team-site-localflag">syncs to public page at integration</span>' : "") + '</div>' +
        '<div class="team-site-sub">' + escapeHTML(item.detail || "") + '</div>' +
        progressBlock +
        '<div class="team-site-sub">Visibility: ' + (item.isPublic ? "🌐 Public" + (item.hintOnly ? " (hint only)" : "") : "🔒 Private (team only)") + ' <button type="button" class="team-mini-link" data-rmact="visibility" data-id="' + item.id + '">' + (item.isPublic ? "Make Private" : "Make Public") + '</button></div>' +
      '</div>' +
      '<div class="team-site-actions">' + actions.join("") + '</div>' +
    '</article>';
  }

  function render() {
    var list = readStore();
    ["completed", "progress", "planned", "coming"].forEach(function (group) {
      var items = list.filter(function (item) { return item.group === group; });
      element("rm-" + group).innerHTML = items.length ? items.map(cardMarkup).join("") : '<p class="team-site-sub">Nothing in this group.</p>';
    });
  }

  function openModal(item) {
    editingId = item ? item.id : null;
    element("rm-modal-title").textContent = item ? "Edit Roadmap Item" : "Add Roadmap Item";
    element("rm-title").value = item ? item.title : "";
    element("rm-detail").value = item ? item.detail || "" : "";
    element("rm-group").value = item ? item.group : "planned";
    element("rm-percent").value = item ? item.percent || 0 : 0;
    element("rm-public").checked = item ? item.isPublic !== false : true;
    element("rm-modal").style.display = "flex";
  }
  function closeModal() { element("rm-modal").style.display = "none"; editingId = null; }

  function saveModal() {
    var title = element("rm-title").value.trim();
    if (!title) { showToast("A title is required."); return; }
    var list = readStore();
    var data = {
      title: title,
      detail: element("rm-detail").value.trim(),
      group: element("rm-group").value,
      percent: Math.max(0, Math.min(100, Number(element("rm-percent").value) || 0)),
      isPublic: element("rm-public").checked,
      pendingPublicSync: true
    };
    if (editingId) {
      var item = list.filter(function (entry) { return entry.id === editingId; })[0];
      if (item) Object.assign(item, data);
    } else {
      list.push(Object.assign({ id: "rm-" + Date.now().toString(36) }, data));
    }
    writeStore(list);
    closeModal();
    render();
    showToast("Saved — flagged for public-page sync at integration.");
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindMilestoneEditor();
    render();
    element("rm-add-btn").addEventListener("click", function () { openModal(null); });
    element("rm-modal-close").addEventListener("click", closeModal);
    element("rm-modal-cancel").addEventListener("click", closeModal);
    element("rm-modal-save").addEventListener("click", saveModal);
    document.body.addEventListener("click", function (event) {
      var button = event.target.closest("[data-rmact]");
      if (!button) return;
      var id = button.dataset.id;
      var act = button.dataset.rmact;
      var list = readStore();
      var item = list.filter(function (entry) { return entry.id === id; })[0];
      if (!item) return;
      if (act === "edit") { openModal(item); return; }
      if (act === "delete") {
        if (!window.ParagonTeamConfirm) return; // no modal system — refuse destructive action
        window.ParagonTeamConfirm({ icon: "🗑️", title: "Delete roadmap item", lines: ["Delete \u201C" + item.title + "\u201D from the roadmap?", "• The public page sync reflects it immediately."], confirmLabel: "Delete", danger: true }).then(function (confirmed) {
          if (!confirmed.ok) return;
          writeStore(list.filter(function (entry) { return entry.id !== id; }));
          render();
          showToast("Deleted — flagged for public-page sync.");
        });
        return;
      }
      if (act === "complete") updateItem(id, function (target) { target.group = "completed"; target.percent = 100; });
      if (act === "to-progress") updateItem(id, function (target) { target.group = "progress"; });
      if (act === "to-planned") updateItem(id, function (target) { target.group = "planned"; });
      if (act === "visibility") updateItem(id, function (target) { target.isPublic = !target.isPublic; });
      if (act === "setpercent") {
        var input = document.querySelector('[data-rmpercent="' + id + '"]');
        var value = Math.max(0, Math.min(100, Number(input && input.value) || 0));
        updateItem(id, function (target) { target.percent = value; target.milestoneDerived = false; });
        showToast("Progress set to " + value + "% — the public page keeps milestone-derived honesty until sync.");
      }
    });
  });

  /* ================= P-096 — PUBLIC MILESTONE CHECKLISTS =================
     The Hub roadmap's three checklist groups render from this store once the Team saves
     here (hub applyTeamMilestoneChecklists). Seeded with the REAL current truths. */
  var MILESTONE_KEY = "paragonTeamRoadmapMilestones.v1";
  var MILESTONE_GROUPS = [
    { key: "community", title: "👥 Community Platform" },
    { key: "developer", title: "🧑\u200d💻 Developer Portal & Deployed" },
    { key: "mobileapp", title: "📲 Paragon Archive App (Browser Install PWA)" }
  ];
  function readMilestones() {
    try { return JSON.parse(window.localStorage.getItem(MILESTONE_KEY) || "null"); }
    catch (error) { return null; }
  }
  function writeMilestones(map) {
    try { window.localStorage.setItem(MILESTONE_KEY, JSON.stringify(map)); } catch (error) { /* blocked */ }
  }
  function milestonesFromPublicHTML() {
    /* Seed honestly from the live Hub HTML truths (the current public state). */
    return {
      community: [
        { text: "Community Guidelines published", done: true },
        { text: "Membership rules — real accounts, one-time account-linked join", done: true },
        { text: "Community page live in the Hub", done: true },
        { text: "Protected member backend — profiles and boards (community tables live, probe-verified 2026-08-18)", done: true },
        { text: "Q&A, suggestions, and voting — Community Board live (backend sync pending)", done: true },
        { text: "Moderation, reports, and appeals — full loop live", done: true }
      ],
      developer: [
        { text: "Developer requirements & acceptance standards published", done: true },
        { text: "Deployed specification, submission form, and detail template", done: true },
        { text: "Application and trial backend (developer tables live, probe-verified 2026-08-18)", done: true },
        { text: "Security review and moderation queue — 8-point Deployed Reviews desk live", done: true },
        { text: "Publishing and hosting pipeline — approve-to-public pipeline live", done: true },
        { text: "Protected developer analytics — own-site views and needs in the Developer Portal", done: true }
      ],
      mobileapp: [
        { text: "Installable PWA foundation live with offline shell", done: true },
        { text: "App plan FINAL: browser-install PWA only — Play Store packaging cancelled, zero fees", done: true },
        { text: "Mobile-native design adaptation — safe-area insets, standalone ergonomics, app shortcuts", done: true },
        { text: "Real-app polish — board-style topbar, share sheet, notification opt-in + test ping", done: true },
        { text: "App-mode hardening — offline shell, cached catalogue, install prompt handling", done: true },
        { text: "Server push-notification delivery + final install verification (needs production domain)", done: false }
      ]
    };
  }
  function renderMilestones() {
    var host = element("rm-milestones");
    if (!host) return;
    var map = readMilestones() || milestonesFromPublicHTML();
    host.innerHTML = MILESTONE_GROUPS.map(function (group) {
      var items = Array.isArray(map[group.key]) ? map[group.key] : [];
      var done = items.filter(function (item) { return item.done; }).length;
      var percent = items.length ? Math.round((done / items.length) * 100) : 0;
      return '<div style="border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-bottom:12px;">' +
        '<div class="team-site-title" style="margin-bottom:8px;"><strong>' + group.title + '</strong><span class="team-site-badge st-live">' + percent + '% · ' + done + '/' + items.length + '</span></div>' +
        items.map(function (item, index) {
          return '<div class="team-site-sub" style="display:flex;gap:8px;align-items:center;padding:4px 0;">' +
            '<input type="checkbox" data-msgroup="' + group.key + '" data-msindex="' + index + '" ' + (item.done ? "checked" : "") + ' style="width:16px;height:16px;">' +
            '<input type="text" data-mstext="' + group.key + '" data-msindex="' + index + '" value="' + escapeHTML(item.text) + '" maxlength="160" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--text);font-size:12px;">' +
            '<button type="button" class="team-mini-link danger" data-msremove="' + group.key + '" data-msindex="' + index + '">✕</button>' +
          '</div>';
        }).join("") +
        '<button type="button" class="team-mini-link" data-msadd="' + group.key + '">+ Add milestone</button>' +
      '</div>';
    }).join("");
  }
  function currentMilestoneMapFromDOM() {
    var map = {};
    MILESTONE_GROUPS.forEach(function (group) {
      map[group.key] = [];
      document.querySelectorAll('[data-mstext="' + group.key + '"]').forEach(function (input, index) {
        var checkbox = document.querySelector('[data-msgroup="' + group.key + '"][data-msindex="' + index + '"]');
        map[group.key].push({ text: input.value.trim(), done: Boolean(checkbox && checkbox.checked) });
      });
    });
    return map;
  }
  function bindMilestoneEditor() {
    var host = element("rm-milestones");
    if (!host) return;
    var statusLine = element("rm-milestone-status");
    function setLine(text) { statusLine.hidden = !text; statusLine.textContent = text || ""; }
    host.addEventListener("change", function () { /* live-save every toggle/edit */ });
    host.addEventListener("click", function (event) {
      var add = event.target.closest("[data-msadd]");
      if (add) {
        var map = currentMilestoneMapFromDOM();
        map[add.dataset.msadd].push({ text: "New milestone", done: false });
        writeMilestones(map); renderMilestones(); setLine("Milestone added — publish when ready.");
        return;
      }
      var remove = event.target.closest("[data-msremove]");
      if (remove) {
        var map2 = currentMilestoneMapFromDOM();
        map2[remove.dataset.msremove].splice(Number(remove.dataset.msindex), 1);
        writeMilestones(map2); renderMilestones(); setLine("Milestone removed.");
        return;
      }
      var save = event.target.closest("[data-mssave]");
      if (save) {
        writeMilestones(currentMilestoneMapFromDOM());
        renderMilestones();
        setLine("Published — the public Hub roadmap now renders these exact lists.");
        showToast("Milestones published to the public roadmap.");
      }
    });
    var publishRow = document.createElement("div");
    publishRow.style.cssText = "display:flex;gap:10px;justify-content:flex-end;margin-top:4px;";
    publishRow.innerHTML = '<button type="button" class="secondary-action" data-msreset>Reset to hub defaults</button><button type="button" class="primary-action" data-mssave>Save &amp; publish to Hub</button>';
    host.after(publishRow);
    publishRow.addEventListener("click", function (event) {
      if (event.target.closest("[data-mssave]")) {
        writeMilestones(currentMilestoneMapFromDOM());
        renderMilestones();
        setLine("Published — the public Hub roadmap now renders these exact lists.");
        showToast("Milestones published to the public roadmap.");
      }
      if (event.target.closest("[data-msreset]")) {
        if (!window.ParagonTeamConfirm) return;
        window.ParagonTeamConfirm({ icon: "↺", title: "Reset milestone checklists", lines: ["The Hub falls back to its own HTML lists and this editor reloads today's public truths."], confirmLabel: "Reset", danger: true }).then(function (confirmed) {
          if (!confirmed.ok) return;
          writeMilestones(milestonesFromPublicHTML());
          renderMilestones();
          setLine("Reset — hub defaults restored.");
        });
      }
    });
    host.addEventListener("input", function (event) {
      if (event.target.hasAttribute("data-mstext")) writeMilestones(currentMilestoneMapFromDOM());
    });
    host.addEventListener("change", function (event) {
      if (event.target.hasAttribute("data-msgroup")) { writeMilestones(currentMilestoneMapFromDOM()); renderMilestones(); }
    });
    renderMilestones();
  }

  window.ParagonTeamRoadmap = { readStore: readStore, writeStore: writeStore, updateItem: updateItem, SEED: SEED };
})();

}

/* ================= PAGE MODULE: settings.js (runs only on settings.html) ================= */
if (paragonTeamPage() === "settings.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamSettings.v1";
  var DEFAULTS = { sessionIdleMinutes: 29, sessionWarnSeconds: 60, maintenanceMode: false, registrationOpen: true, reviewsOpen: true };
  var COIN_KEY = "paragonTeamCoinRequests.v1";
  function readCoinRequests() { return readJSON(COIN_KEY, []); }
  function writeCoinRequests(list) { writeJSON(COIN_KEY, list); }
  function renderCoinRequests() {
    var host = document.getElementById("coin-requests-list");
    if (!host) return;
    var list = readCoinRequests().sort(function (a, b) { return Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0); });
    host.innerHTML = list.length ? list.map(function (request) {
      return '<article class="team-site-row ' + (request.status === "approved" ? "st-live" : request.status === "rejected" ? "st-archived" : "st-review") + '">' +
        '<div class="team-site-copy">' +
          '<div class="team-site-title"><strong>' + escapeHTML(request.displayName || request.user) + '</strong><span class="team-site-badge ' + (request.status === "approved" ? "st-live" : "st-review") + '">' + (request.status === "approved" ? "✅ APPROVED" : request.status === "rejected" ? "❌ REJECTED" : "🟡 PENDING") + '</span><span class="team-site-cat">₦' + Number(request.naira || 0).toLocaleString() + ' = ' + Number(request.coins || 0).toLocaleString() + ' coins</span></div>' +
          '<div class="team-site-sub">' + escapeHTML(request.user || "—") + ' · ' + escapeHTML(request.createdAt || "—") + '</div>' +
        '</div>' +
        '<div class="team-site-actions">' +
          (request.status === "pending" ? '<button type="button" class="team-mini-link" data-coinact="approve" data-id="' + request.id + '">Approve (credit coins)</button><button type="button" class="team-mini-link danger" data-coinact="reject" data-id="' + request.id + '">Reject</button>' : "") +
        '</div>' +
      '</article>';
    }).join("") : '<p class="team-site-sub">No coin purchase requests yet — real zero.</p>';
  }
  function bindCoinRequests() {
    var host = document.getElementById("coin-requests-list");
    if (!host) return;
    host.addEventListener("click", function (event) {
      var button = event.target.closest("[data-coinact]");
      if (!button) return;
      var list = readCoinRequests();
      var request = list.filter(function (entry) { return entry.id === button.dataset.id; })[0];
      if (!request) return;
      if (button.dataset.coinact === "approve") {
        window.ParagonTeamConfirm({ icon: "🪙", title: "Approve coin purchase", lines: ["Credit " + Number(request.coins).toLocaleString() + " coins to " + (request.displayName || request.user) + " after confirming payment was received."], confirmLabel: "Approve & credit" }).then(function (confirmed) {
          if (!confirmed.ok) return;
          request.status = "approved";
          request.approvedAt = new Date().toISOString();
          writeCoinRequests(list);
          var mirrors = readJSON("paragonArchive.coinCredits.v1", []);
          mirrors.push({ for: request.user, coins: request.coins, at: request.approvedAt, id: request.id });
          writeJSON("paragonArchive.coinCredits.v1", mirrors);
          renderCoinRequests();
          showToast("Approved — the user's balance updates when their device syncs.");
        });
      }
      if (button.dataset.coinact === "reject") {
        request.status = "rejected";
        writeCoinRequests(list);
        renderCoinRequests();
        showToast("Request rejected.");
      }
    });
    renderCoinRequests();
  }

  var FLAGS = [
    { key: "maintenanceMode", icon: "🚧", label: "Maintenance mode — LIVE lockdown", detail: "P-097: toggling this IMMEDIATELY closes every public Paragon surface (Archive, Hub, previews, board, portal) behind the maintenance screen on this device. Flip it off to reopen." },
    { key: "registrationOpen", icon: "🔓", label: "Registration open", detail: "Allow new account signups once Supabase auth is fully activated." },
    { key: "reviewsOpen", icon: "⭐", label: "Accept new reviews", detail: "Allow the public Archive to accept new user reviews." }
  ];

  var DESK_STORES = [
    { key: "paragonTeamWebsites.overrides.v1", label: "🌐 Website status overrides" },
    { key: "paragonTeamWebsites.drafts.v1", label: "🌐 Website drafts" },
    { key: "paragonTeamUsers.moderation.v1", label: "👥 User moderation records" },
    { key: "paragonTeamTickets.v1", label: "🎫 Support tickets" },
    { key: "paragonTeamBugs.v1", label: "🐛 Bug reports" },
    { key: "paragonTeamRequests.v1", label: "📬 Website requests" },
    { key: "paragonTeamAnnouncements.v1", label: "📢 Announcements" },
    { key: "paragonTeamRoadmap.v1", label: "🗺️ Roadmap items" },
    { key: "paragonTeamApplications.v1", label: "💼 Dev applications" },
    { key: "paragonTeamReviewReports.v1", label: "🚩 Review reports" },
    { key: "paragonTeamCommunityPosts.v1", label: "💬 Community posts" },
    { key: "paragonTeamSuggestions.v1", label: "💡 Suggestions" }
  ];

  function readSettings() {
    var stored;
    try { stored = JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || {}; }
    catch (error) { stored = {}; }
    var merged = {};
    Object.keys(DEFAULTS).forEach(function (key) {
      merged[key] = Object.prototype.hasOwnProperty.call(stored, key) ? stored[key] : DEFAULTS[key];
    });
    return merged;
  }
  function writeSettings(settings) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(settings)); } catch (error) { /* blocked */ }
  }
  function clampSession(settings) {
    settings.sessionIdleMinutes = Math.min(120, Math.max(5, Math.round(Number(settings.sessionIdleMinutes) || DEFAULTS.sessionIdleMinutes)));
    settings.sessionWarnSeconds = Math.min(120, Math.max(30, Math.round(Number(settings.sessionWarnSeconds) || DEFAULTS.sessionWarnSeconds)));
    return settings;
  }

  function storeCount(key) {
    try {
      var raw = JSON.parse(window.localStorage.getItem(key) || "null");
      if (Array.isArray(raw)) return raw.length;
      if (raw && typeof raw === "object") return Object.keys(raw).length;
      return raw == null ? 0 : 1;
    } catch (error) { return 0; }
  }

  function showToast(text) {
    var toast = document.getElementById("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    window.setTimeout(function () { toast.hidden = true; }, 3200);
  }

  function renderFlags() {
    var settings = readSettings();
    document.getElementById("set-flags").innerHTML = FLAGS.map(function (flag) {
      return '<label class="team-flag-row" data-flag="' + flag.key + '">' +
        '<input type="checkbox"' + (settings[flag.key] ? " checked" : "") + '>' +
        '<span class="team-flag-main"><b>' + flag.icon + " " + flag.label + '</b><small>' + flag.detail + '</small></span>' +
        '<span class="team-status-chip st-scheduled">stored · backend-enforced later</span>' +
      '</label>';
    }).join("");
  }

  function renderStores() {
    document.getElementById("set-stores").innerHTML = DESK_STORES.map(function (store) {
      var count = storeCount(store.key);
      return '<article class="team-site-card" data-store="' + store.key + '">' +
        '<div class="team-site-main"><div class="team-site-titleline"><b>' + store.label + '</b>' +
          '<span class="team-status-chip ' + (count ? "st-live" : "st-archived") + '">' + count + ' record' + (count === 1 ? "" : "s") + '</span></div>' +
          '<p class="team-site-sub"><code>' + store.key + '</code></p></div>' +
        '<div class="team-site-actions">' +
          (count ? '<button type="button" class="secondary-action deployed-reject" data-clear="' + store.key + '">🧹 Clear</button>' : '<span class="team-site-sub">Empty</span>') +
        '</div></article>';
    }).join("");
  }

  function renderInfo() {
    var infoNode = document.getElementById("set-info");
    var swCache = "reading…";
    infoNode.innerHTML =
      '<div class="team-stat-box"><b id="set-sw-cache">' + swCache + '</b><span>Service-worker cache</span></div>' +
      '<div class="team-stat-box"><b>' + (navigator.onLine ? "Online" : "Offline") + '</b><span>Browser connectivity (real)</span></div>' +
      '<div class="team-stat-box"><b>' + new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) + '</b><span>Today</span></div>';
    /* Real cache name straight out of the deployed service worker file. */
    fetch("../service-worker.js").then(function (response) { return response.text(); }).then(function (text) {
      var match = text.match(/CACHE_NAME\s*=\s*"([^"]+)"/);
      var node = document.getElementById("set-sw-cache");
      if (node) node.textContent = match ? match[1] : "not found";
    }).catch(function () {
      var node = document.getElementById("set-sw-cache");
      if (node) node.textContent = "unavailable offline";
    });
  }

  /* ============ P-099 — Stage 5: weekly leaderboard & reward settlement (super-admin) ============
     Engine: ../paragon-leaderboards.js (window.ParagonLeaderboards). This desk drives the spec
     §12.1 settlement flow per week: close -> freeze -> anti-abuse review -> eligibility ->
     final ranking -> prize calculation -> reward ledger entries -> credit (approval -> mirror). */
  var LB = (typeof window !== "undefined") ? window.ParagonLeaderboards : null;
  var lbFocusKey = LB ? LB.currentWeekKey() : "";
  var lbNoteEntry = "";
  var lbNoteText = "";
  var lbActorLabel = "Super Admin (this device)";
  function lbEngine() { return window.ParagonLeaderboards || null; }
  function lbShortLabel(key) {
    var engine = lbEngine(); if (!engine) return key;
    var bounds = engine.periodBounds(key);
    var last = new Date(bounds.end.getTime()); last.setDate(last.getDate() - 1);
    return key.slice(5).replace("-", "/") + "…" + String(last.getDate()).padStart(2, "0") + "/" + String(last.getMonth() + 1).padStart(2, "0");
  }
  function lbStateBadge(state) {
    var text = { running: "RUNNING", closed: "CLOSED / FROZEN", review: "ANTI-ABUSE REVIEW", final: "FINAL RANKING", prizes: "PRIZES CALCULATED", credited: "CREDITED" }[state] || state;
    var kind = { running: "st-live", closed: "st-scheduled", review: "st-review", final: "st-live", prizes: "st-scheduled", credited: "st-live" }[state] || "st-review";
    return '<span class="team-site-badge ' + kind + '">' + escapeHTML(text) + "</span>";
  }
  function lbFlagChips(flags) {
    return (flags || []).map(function (flag) {
      var label = flag === "rapid-fire" ? "RAPID-FIRE" : flag === "repeated-opponent" ? "REPEATED OPPONENT" : flag;
      return '<span class="lb-flag-chip">🚩 ' + escapeHTML(String(label).toUpperCase()) + "</span>";
    }).join("");
  }
  function lbDeskRows(entries) {
    var map = {}; var order = [];
    (entries || []).forEach(function (entry) {
      var row = map[entry.player];
      if (!row) { row = map[entry.player] = { player: entry.player, displayName: entry.displayName || entry.player, points: 0, plays: 0, disqualified: 0, flags: [] }; order.push(row); }
      if (entry.status === "disqualified") row.disqualified += 1;
      else row.points += Number(entry.points) || 0;
      row.plays += 1;
      (entry.flags || []).forEach(function (flag) { if (row.flags.indexOf(flag) === -1) row.flags.push(flag); });
    });
    order.sort(function (a, b) { return b.points - a.points || a.plays - b.plays; });
    return order;
  }
  function renderLBPeriodPicker() {
    var host = document.getElementById("lb-period-row");
    var engine = lbEngine();
    if (!host || !engine) return;
    var keys = engine.recentPeriodKeys(new Date(), 3);
    if (keys.indexOf(lbFocusKey) === -1) lbFocusKey = keys[0];
    var state = engine.periodState(lbFocusKey);
    var bounds = engine.periodBounds(lbFocusKey);
    var endNote = state.state === "running" && new Date() < bounds.end ? " — closes automatically after the period ends (team closes it here)" : "";
    host.innerHTML =
      '<div class="team-site-copy" style="flex:1;min-width:220px">' +
        '<div class="team-site-title"><strong>🏆 ' + escapeHTML(engine.periodLabel(lbFocusKey)) + '</strong> ' + lbStateBadge(state.state) + "</div>" +
        '<div class="team-site-sub">Period weeks (Monday start): ' +
          keys.map(function (key) {
            var active = key === lbFocusKey;
            return '<button type="button" class="team-mini-link' + (active ? " lb-week-chip active" : "") + '" data-lbact="focus" data-key="' + key + '"' + (active ? ' style="border-color:var(--accent);color:var(--accent)"' : "") + ">" + lbShortLabel(key) + "</button>";
          }).join(" ") +
          endNote + "</div>" +
      "</div>";
  }
  function renderLBStandings() {
    var host = document.getElementById("lb-standings");
    var engine = lbEngine();
    if (!host || !engine) return;
    var state = engine.periodState(lbFocusKey);
    var entries = engine.entriesFor(lbFocusKey).slice().sort(function (a, b) { return (b.points - a.points) || (a.recordedAt < b.recordedAt ? -1 : 1); });
    var reviewable = state.state === "closed" || state.state === "review" || state.state === "final";
    var view = engine.standingsForView(lbFocusKey);
    var rankMap = {};
    (view.rows || []).forEach(function (row) { rankMap[row.player] = row.rank; });
    var html = "";
    if (!entries.length) {
      html += '<p class="team-site-sub">No eligible bet results for this period yet — real zero. Points appear only when the competition stage records eligible staked results.</p>';
    } else {
      html += lbDeskRows(entries).map(function (row) {
        var disq = row.disqualified > 0;
        return '<article class="team-site-row ' + (disq ? "st-archived" : "st-live") + '">' +
          '<div class="team-site-copy">' +
            '<div class="team-site-title"><strong>' + (rankMap[row.player] ? "#" + rankMap[row.player] + " " : "") + escapeHTML(row.displayName || row.player) + "</strong>" +
              (disq ? '<span class="team-site-badge st-archived">' + row.disqualified + " DISQUALIFIED</span>" : '<span class="team-site-badge st-live">ELIGIBLE</span>') +
              lbFlagChips(row.flags) +
            "</div>" +
            '<div class="team-site-sub">' + escapeHTML(row.player) + " · " + row.points + " pts · " + row.plays + " play" + (row.plays === 1 ? "" : "s") + "</div>" +
          "</div></article>";
      }).join("");
      html += '<div class="team-site-sub" style="margin-top:6px">' + entries.length + " result record(s) this period" + (reviewable ? " — review each flagged result below before finalizing." : "") + "</div>";
    }
    if (reviewable) {
      html += '<div class="team-dash-sectitle" style="margin:14px 0 6px;">🔎 Result-level anti-abuse review (flags are advisory — YOUR decision is what counts)</div>';
      html += entries.map(function (entry) {
        var disq = entry.status === "disqualified";
        var open = lbNoteEntry === entry.id;
        return '<article class="team-site-row ' + (disq ? "st-archived" : entry.flags && entry.flags.length ? "st-review" : "") + '">' +
          '<div class="team-site-copy">' +
            '<div class="team-site-title"><strong>' + escapeHTML(entry.displayName || entry.player) + " · " + escapeHTML(entry.gameType) + "</strong>" +
              (disq ? '<span class="team-site-badge st-archived">DISQUALIFIED</span>' : '<span class="team-site-badge st-live">ACTIVE</span>') +
              lbFlagChips(entry.flags) + "</div>" +
            '<div class="team-site-sub"><code>' + escapeHTML(entry.id) + "</code> · " + entry.points + " pts · score " + entry.perf.score + "/" + entry.perf.total + " · stake " + entry.stakeCoins + " coin · " + escapeHTML(entry.recordedAt || "") + (entry.reviewNote ? " · note: " + escapeHTML(entry.reviewNote) : "") + "</div>" +
            (open ? '<input type="text" class="lb-note-input" data-lbnote="' + entry.id + '" maxlength="200" placeholder="Reason for this review decision (recorded in the audit trail)" value="' + escapeHTML(lbNoteText) + '">' : "") +
          "</div>" +
          '<div class="team-site-actions">' +
            (disq
              ? '<button type="button" class="team-mini-link" data-lbact="restore" data-eid="' + entry.id + '">Restore eligibility</button>'
              : '<button type="button" class="team-mini-link danger" data-lbact="disqualify" data-eid="' + entry.id + '">Disqualify</button>') +
            (open && !disq ? '<button type="button" class="team-mini-link" data-lbact="disq-save" data-eid="' + entry.id + '">Save decision</button>' : "") +
            (open && disq ? '<button type="button" class="team-mini-link" data-lbact="restore-save" data-eid="' + entry.id + '">Save restore</button>' : "") +
          "</div></article>";
      }).join("");
    }
    host.innerHTML = html;
  }
  function renderLBPool() {
    var host = document.getElementById("lb-pool-box");
    var engine = lbEngine();
    if (!host || !engine) return;
    var state = engine.periodState(lbFocusKey);
    var fees = engine.feeTotal(lbFocusKey);
    var pool = engine.poolCoins(lbFocusKey);
    var html = "";
    if (state.state !== "running") {
      if (state.poolCoins > 0 && state.prizes && state.prizes.length) {
        html = '<div class="lb-pool-grid">' +
          '<div class="lb-pool-stat"><b>' + Number(state.poolCoins).toLocaleString() + " coins</b><small>reward pool = 30% of realized fees</small></div>" +
          '<div class="lb-pool-stat"><b>' + Number(fees).toLocaleString() + " coins</b><small>eligible realized competition-fee revenue</small></div></div>" +
          '<div class="lb-dist">' + state.prizes.map(function (p) { return '<span class="lb-dist-pill"><b>#' + p.rank + "</b> · " + p.pct + "% · " + Number(p.coins).toLocaleString() + " coins</span>"; }).join("") + "</div>";
      } else {
        html = '<div class="lb-pool-zero-note">Pool = 0 coins — realized fees this period: ' + Number(fees).toLocaleString() + ' coins × 30%. The pool is funded ONLY by real realized competition-fee revenue; an unfunded pool pays nothing (no invented prizes).</div>';
      }
    } else {
      html = '<div class="lb-pool-zero-note">Running period — realized fees so far: ' + Number(fees).toLocaleString() + " coins → current 30% pool: " + Number(pool).toLocaleString() + " coins (final pool locks when the week closes and prizes are calculated).</div>";
    }
    host.innerHTML = html;
  }
  function renderLBActions() {
    var host = document.getElementById("lb-actions");
    var engine = lbEngine();
    if (!host || !engine) return;
    var state = engine.periodState(lbFocusKey);
    var now = new Date();
    var canClose = state.state === "running" && now >= engine.periodBounds(lbFocusKey).end;
    var buttons = [];
    if (state.state === "running") {
      buttons.push(canClose
        ? '<button type="button" class="primary-action" data-lbact="close">⏹ Close week &amp; freeze results</button>'
        : '<button type="button" class="secondary-action" disabled title="The period must end before results freeze">⏹ Close week &amp; freeze results (period still live)</button>');
    }
    if (state.state === "closed" || state.state === "review") {
      buttons.push('<button type="button" class="primary-action" data-lbact="finalize">✅ Finalize final ranking (after review)</button>');
    }
    if (state.state === "final") {
      buttons.push('<button type="button" class="primary-action" data-lbact="prizes">💰 Calculate prizes from realized fees</button>');
    }
    if (state.state === "prizes") {
      buttons.push((state.poolCoins > 0)
        ? '<button type="button" class="primary-action" data-lbact="credit">🪙 Approve &amp; credit weekly rewards</button>'
        : '<button type="button" class="secondary-action" disabled title="Unfunded pool">🪙 Approve &amp; credit (pool is 0 — nothing to pay)</button>');
    }
    if (state.state === "credited" && state.issued) {
      buttons.push('<span class="team-site-badge st-live">✅ ' + state.issued.length + " reward(s) credited through the coin-credit mirror</span>");
    }
    host.innerHTML = buttons.length ? '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' + buttons.join("") + "</div>" : "";
  }
  function renderLBAudit() {
    var host = document.getElementById("lb-audit");
    var engine = lbEngine();
    if (!host || !engine) return;
    var rows = engine.auditLog().filter(function (row) {
      return row.periodKey === lbFocusKey || row.action === "result-rejected" || row.action === "fee-realized";
    }).slice(0, 25);
    host.innerHTML = rows.length ? rows.map(function (row) {
      return '<article class="team-site-row"><div class="team-site-copy">' +
        '<div class="team-site-title"><strong>' + escapeHTML(row.action) + "</strong><span class=\"team-site-cat\">" + escapeHTML(row.at || "") + "</span></div>" +
        '<div class="team-site-sub">' + escapeHTML(row.actor || "") + (row.detail ? " · " + escapeHTML(row.detail) : "") + "</div>" +
      "</div></article>";
    }).join("") : '<p class="team-site-sub">No leaderboard audit entries yet — every settlement step is recorded here.</p>';
  }
  function renderLeaderboardSettlement() {
    var engine = lbEngine();
    var host = document.getElementById("lb-settlement-section");
    if (!engine || !host) return;
    renderLBPeriodPicker();
    renderLBStandings();
    renderLBPool();
    renderLBActions();
    renderLBAudit();
  }
  function bindLeaderboardSettlement() {
    var engine = lbEngine();
    var host = document.getElementById("lb-settlement-section");
    if (!engine || !host) return;
    host.addEventListener("click", function (event) {
      var button = event.target.closest("[data-lbact]");
      if (!button) return;
      var act = button.dataset.lbact;
      var key = button.dataset.key || lbFocusKey;
      var eid = button.dataset.eid || "";
      var actor = lbActorLabel;
      if (act === "focus") {
        lbFocusKey = key; lbNoteEntry = ""; lbNoteText = "";
        renderLeaderboardSettlement();
        return;
      }
      if (act === "close") {
        window.ParagonTeamConfirm({ icon: "🏆", title: "Close week " + key + "?", lines: ["Results freeze now and the anti-abuse review opens. Late results can no longer change this week's ranking."], confirmLabel: "Close & freeze" }).then(function (confirmed) {
          if (!confirmed.ok) return;
          var result = engine.closePeriod(key, actor);
          if (!result.ok) { showToast(result.code === "period-active" ? "This week is still live — it ends " + engine.periodLabel(key) + "." : "Close failed: " + result.code); return; }
          showToast("Week closed — results frozen for review.");
          renderLeaderboardSettlement();
        });
        return;
      }
      if (act === "disqualify") {
        lbNoteEntry = eid; lbNoteText = "";
        renderLBStandings();
        return;
      }
      if (act === "restore") {
        var resultRestore = engine.setEntryEligibility(key, eid, true, actor, "Restored by review");
        showToast(resultRestore.ok ? "Eligibility restored." : "Restore failed: " + resultRestore.code);
        renderLeaderboardSettlement();
        return;
      }
      if (act === "disq-save") {
        var resultDisq = engine.setEntryEligibility(key, eid, false, actor, lbNoteText || "Disqualified by super-admin review");
        showToast(resultDisq.ok ? "Result disqualified — it cannot reach the final ranking or any reward." : "Decision failed: " + resultDisq.code);
        lbNoteEntry = ""; lbNoteText = "";
        renderLeaderboardSettlement();
        return;
      }
      if (act === "restore-save") {
        var resultRestoreSave = engine.setEntryEligibility(key, eid, true, actor, lbNoteText || "Restored by super-admin review");
        showToast(resultRestoreSave.ok ? "Eligibility restored." : "Restore failed: " + resultRestoreSave.code);
        lbNoteEntry = ""; lbNoteText = "";
        renderLeaderboardSettlement();
        return;
      }
      if (act === "finalize") {
        var resultFinal = engine.finalizePeriod(key, actor);
        showToast(resultFinal.ok ? "Final ranking locked (" + resultFinal.rows.length + " ranked)." : "Finalize failed: " + resultFinal.code);
        renderLeaderboardSettlement();
        return;
      }
      if (act === "prizes") {
        var resultPrizes = engine.computePrizes(key, actor);
        if (!resultPrizes.ok) { showToast("Prize calculation failed: " + resultPrizes.code); renderLeaderboardSettlement(); return; }
        showToast(resultPrizes.poolCoins > 0 ? "Prizes calculated from a " + resultPrizes.poolCoins + "-coin funded pool." : "Pool is 0 coins — nothing can be paid this week.");
        renderLeaderboardSettlement();
        return;
      }
      if (act === "credit") {
        var stateNow = engine.periodState(key);
        window.ParagonTeamConfirm({
          icon: "🪙", title: "Approve & credit weekly rewards?",
          lines: ["Credit the calculated top-10 reward coins through the same approval → credit-mirror flow as coin purchases. Each winner's device claims them on next Account view.", "Pool: " + Number(stateNow.poolCoins || 0).toLocaleString() + " coins."],
          confirmLabel: "Approve & credit"
        }).then(function (confirmed) {
          if (!confirmed.ok) return;
          var resultCredit = engine.issueCredits(key, actor);
          if (!resultCredit.ok) { showToast("Credit failed: " + resultCredit.code); renderLeaderboardSettlement(); return; }
          showToast("🏆 " + resultCredit.issued.length + " reward(s) credited — winners sync on their next Account view.");
          renderLeaderboardSettlement();
        });
        return;
      }
    });
    host.addEventListener("input", function (event) {
      var note = event.target.closest("[data-lbnote]");
      if (!note) return;
      lbNoteText = note.value;
      lbNoteEntry = note.dataset.lbnote;
    });
    renderLeaderboardSettlement();
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
    bindCoinRequests();
    bindLeaderboardSettlement();
      if (!document.getElementById("set-flags")) return;
      var settings = readSettings();
      document.getElementById("set-idle").value = settings.sessionIdleMinutes;
      document.getElementById("set-warn").value = settings.sessionWarnSeconds;
      renderFlags();
      renderStores();
      renderInfo();

      document.getElementById("set-save-session").addEventListener("click", function () {
        var next = readSettings();
        next.sessionIdleMinutes = Number(document.getElementById("set-idle").value);
        next.sessionWarnSeconds = Number(document.getElementById("set-warn").value);
        clampSession(next);
        writeSettings(next);
        document.getElementById("set-idle").value = next.sessionIdleMinutes;
        document.getElementById("set-warn").value = next.sessionWarnSeconds;
        document.getElementById("set-session-msg").textContent =
          "✅ Saved — the idle guard uses " + next.sessionIdleMinutes + " min + " + next.sessionWarnSeconds + " s on every team page from the next load.";
        showToast("💾 Session settings saved for real.");
      });

      document.getElementById("set-flags").addEventListener("change", function (event) {
        var row = event.target.closest("[data-flag]");
        if (!row) return;
        var next = readSettings();
        next[row.getAttribute("data-flag")] = event.target.checked;
        writeSettings(next);
        showToast("💾 Flag stored — it takes public effect when the backend enforces it.");
      });

      document.getElementById("set-stores").addEventListener("click", function (event) {
        var button = event.target.closest("[data-clear]");
        if (!button) return;
        var key = button.getAttribute("data-clear");
        window.ParagonTeamConfirm({
          icon: "🧹", title: "Clear local desk data",
          lines: ["Delete ALL records in " + key + " from this device?", "• This cannot be undone here.", "• Backend data (once live) is not touched."],
          confirmLabel: "Clear store", danger: true
        }).then(function (result) {
          if (!result.ok) return;
          try { window.localStorage.removeItem(key); } catch (error) { /* blocked */ }
          showToast("🧹 Store cleared.");
          renderStores();
        });
      });
    });
  }

  window.ParagonTeamSettings = {
    STORE_KEY: STORE_KEY, DEFAULTS: DEFAULTS, DESK_STORES: DESK_STORES,
    readSettings: readSettings, writeSettings: writeSettings, clampSession: clampSession, storeCount: storeCount
  };
})();

}

/* ================= PAGE MODULE: setup.js (runs only on setup.html) ================= */
if (paragonTeamPage() === "setup.html") {
(function () {
  "use strict";

  var LINK_HOURS = 24;
  var params = new URLSearchParams(window.location.search);
  var mode = params.get("mode") === "role" ? "role" : "admin";

  function element(id) { return document.getElementById(id); }

  function evaluatePassword(value) {
    return {
      length: value.length >= 12,
      upper: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      symbol: /[^A-Za-z0-9]/.test(value)
    };
  }

  function strengthScore(checks, value) {
    var score = 0;
    if (checks.length) score += 1;
    if (checks.upper) score += 1;
    if (checks.number) score += 1;
    if (checks.symbol) score += 1;
    if (value.length >= 16) score += 1;
    return score; // 0–5
  }

  function paintStrength(value) {
    var checks = evaluatePassword(value);
    var score = strengthScore(checks, value);
    var fill = element("strength-fill");
    var label = element("strength-label");
    var levels = ["Too weak", "Too weak", "Weak", "Fair", "Strong", "Excellent"];
    var colors = ["#ef4444", "#ef4444", "#f59e0b", "#f59e0b", "#22c55e", "#22c55e"];
    fill.style.width = (score / 5) * 100 + "%";
    fill.style.background = colors[score];
    label.textContent = value ? "Password strength: " + levels[score] : "Password strength";
    Object.keys(checks).forEach(function (rule) {
      var item = document.querySelector('[data-rule="' + rule + '"]');
      if (item) item.classList.toggle("met", checks[rule]);
    });
    return checks;
  }

  function linkExpired() {
    var ts = Number(params.get("ts") || 0);
    if (!ts) return false; // Preview/no-timestamp links do not enforce expiry.
    return Date.now() - ts > LINK_HOURS * 60 * 60 * 1000;
  }

  function setStatus(text, tone) {
    var status = element("setup-status");
    status.hidden = !text;
    status.textContent = text || "";
    status.dataset.tone = tone || "info";
  }

  function applyVariant() {
    element("setup-email").value = params.get("email") || "paragon@example.com";
    if (mode === "role") {
      element("setup-title").textContent = "Create Your New Password.";
      element("setup-expiry-note").textContent = "Required before you can continue.";
      element("setup-role-message").hidden = false;
      element("setup-initial-wrap").hidden = false;
      element("setup-initial").required = true;
    }
    if (linkExpired()) {
      element("setup-expired").hidden = false;
      element("setup-form").hidden = true;
      element("setup-expiry-note").textContent = "This link has expired.";
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (linkExpired()) { applyVariant(); return; }
    var password = element("setup-password").value;
    var confirm = element("setup-confirm").value;
    var checks = evaluatePassword(password);
    var problems = [];
    if (mode === "role" && !element("setup-initial").value.trim()) problems.push("Enter the initial password from your email.");
    if (!checks.length) problems.push("Use at least 12 characters.");
    if (!checks.upper) problems.push("Add an uppercase letter.");
    if (!checks.number) problems.push("Add a number.");
    if (!checks.symbol) problems.push("Add a symbol.");
    if (password && confirm && password !== confirm) problems.push("Both passwords must match.");
    if (!confirm) problems.push("Confirm the password.");
    if (problems.length) {
      setStatus("Almost there: " + problems.join(" "), "signed-out");
      return;
    }
    setStatus("✅ Your password meets the full Paragon Team policy. Account provisioning and dashboard entry activate with the protected security backend — nothing was stored or transmitted from this preview.", "member");
    element("setup-password").value = "";
    element("setup-confirm").value = "";
    if (mode === "role") element("setup-initial").value = "";
    paintStrength("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyVariant();
    element("setup-password").addEventListener("input", function () { paintStrength(element("setup-password").value); });
    element("setup-show-toggle").addEventListener("click", function () {
      var input = element("setup-password");
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      this.textContent = show ? "Hide" : "Show";
      this.setAttribute("aria-pressed", String(show));
    });
    element("setup-form").addEventListener("submit", handleSubmit);
  });

  window.ParagonTeamSetup = { evaluatePassword: evaluatePassword, strengthScore: strengthScore, linkExpired: linkExpired, mode: mode, LINK_HOURS: LINK_HOURS };
})();

}

/* ================= PAGE MODULE: ticket.js (runs only on ticket.html) ================= */
if (paragonTeamPage() === "ticket.html") {
(function () {
  "use strict";

  var T = window.ParagonTeamTickets;
  var ticketId = new URLSearchParams(window.location.search).get("id") || "";

  function element(id) { return document.getElementById(id); }

  function render() {
    var ticket = T.findTicket(ticketId);
    if (!ticket) {
      element("ticket-not-found").style.display = "block";
      element("ticket-body").style.display = "none";
      return;
    }
    element("ticket-body").style.display = "block";
    document.title = "Ticket #" + ticket.id + " — Paragon Team Dashboard";
    element("ticket-number-label").textContent = "Ticket #" + ticket.id;
    element("ticket-subject").textContent = ticket.subject;
    var priority = T.PRIORITY_META[ticket.priority];
    var status = T.STATUS_META[ticket.status];
    element("ticket-priority-badge").textContent = priority.label;
    element("ticket-priority-badge").className = "team-site-badge " + priority.cls;
    element("ticket-status-badge").textContent = status.label;
    element("ticket-status-badge").className = "team-site-badge " + status.cls;
    element("ticket-illustrative").hidden = !ticket.illustrative;
    element("ticket-from").textContent = ticket.from;
    var received = new Date(ticket.createdAt);
    element("ticket-received").textContent = "Received: " + received.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) + " at " + received.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    element("ticket-assignee").value = ticket.assignee || "";
    element("ticket-priority").value = ticket.priority;
    element("ticket-status").value = ticket.status;
    element("ticket-internal").value = ticket.internalNotes || "";

    element("ticket-thread").innerHTML = ticket.thread.map(function (message) {
      return '<article class="ticket-message ' + (message.team ? "from-team" : "from-user") + '">' +
        '<div class="ticket-message-head"><strong>' + (message.team ? "🟣 " : "👤 ") + T.escapeHTML(message.author) + '</strong><time>' + T.when(message.at) + '</time></div>' +
        '<p>' + T.escapeHTML(message.text) + '</p>' +
        (message.queued ? '<small class="ticket-queued">✉️ queued for email dispatch at backend activation</small>' : "") +
      '</article>';
    }).join("");

    var closed = ticket.status === "closed";
    ["ticket-reply", "ticket-send", "ticket-send-resolve"].forEach(function (id) { element(id).disabled = closed; });
    element("ticket-close-btn").textContent = closed ? "Reopen Ticket" : "Close Ticket";
  }

  function sendReply(markResolved) {
    var text = element("ticket-reply").value.trim();
    if (!text) { T.showToast("Write a reply first."); return; }
    T.updateTicket(ticketId, function (ticket) {
      ticket.thread.push({ author: "Paragon Team", team: true, at: new Date().toISOString(), text: text, queued: true });
      if (markResolved) ticket.status = "resolved";
      else if (ticket.status === "open") ticket.status = "progress";
      /* P-092 — in-app tickets get their reply delivered to the user's in-app inbox
         (saves the 300-email Brevo budget for signup codes only). */
      if (ticket.origin === "in-app") {
        try {
          var inbox = JSON.parse(window.localStorage.getItem("paragonUserInbox.v1") || "null") || [];
          inbox.push({ id: "inb-" + Date.now(), ticketId: ticket.id, title: "💬 Paragon Team replied — " + (ticket.subject || "your support message"), text: text, at: new Date().toISOString(), read: false });
          window.localStorage.setItem("paragonUserInbox.v1", JSON.stringify(inbox));
        } catch (error) { /* blocked */ }
      }
    });
    element("ticket-reply").value = "";
    T.showToast(markResolved ? "Reply saved and ticket marked Resolved — email dispatches at backend activation." : "Reply saved — email dispatches at backend activation.");
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    element("ticket-send").addEventListener("click", function () { sendReply(false); });
    element("ticket-send-resolve").addEventListener("click", function () { sendReply(true); });
    element("ticket-close-btn").addEventListener("click", function () {
      T.updateTicket(ticketId, function (ticket) { ticket.status = ticket.status === "closed" ? "open" : "closed"; });
      render();
    });
    element("ticket-reassign").addEventListener("click", function () {
      var value = element("ticket-assignee").value;
      T.updateTicket(ticketId, function (ticket) { ticket.assignee = value; });
      T.showToast(value ? "Assigned to " + value + "." : "Ticket unassigned.");
      render();
    });
    element("ticket-priority").addEventListener("change", function () {
      var value = this.value;
      T.updateTicket(ticketId, function (ticket) { ticket.priority = value; });
      render();
    });
    element("ticket-status").addEventListener("change", function () {
      var value = this.value;
      T.updateTicket(ticketId, function (ticket) { ticket.status = value; });
      render();
    });
    var noteHandle = null;
    element("ticket-internal").addEventListener("input", function () {
      var value = this.value;
      if (noteHandle) window.clearTimeout(noteHandle);
      noteHandle = window.setTimeout(function () {
        T.updateTicket(ticketId, function (ticket) { ticket.internalNotes = value; });
      }, 400);
    });
    element("ticket-attach").addEventListener("change", function () {
      if (this.files && this.files.length) T.showToast("📎 " + this.files[0].name + " will attach to the reply when the backend handles file dispatch.");
    });
  });
})();

}

/* ================= PAGE MODULE: tickets.js (runs only on tickets.html) ================= */
if (paragonTeamPage() === "tickets.html") {
(function () {
  "use strict";

  var STORE_KEY = "paragonTeamTickets.v1";

  var PRIORITY_META = { urgent: { label: "🔴 URGENT", cls: "st-archived" }, medium: { label: "🟡 MEDIUM", cls: "st-scheduled" }, low: { label: "🟢 LOW", cls: "st-live" } };
  var STATUS_META = { open: { label: "🟢 Open", cls: "st-live" }, progress: { label: "🔵 In Progress", cls: "st-preview" }, resolved: { label: "✅ Resolved", cls: "st-live" }, closed: { label: "⚫ Closed", cls: "st-archived" } };

  var EXAMPLES = [
    {
      id: 247, illustrative: true, subject: "Account Issue", topic: "Account",
      from: "user@email.com", priority: "urgent", status: "progress",
      assignee: "Support Mary (example roster)",
      createdAt: "2027-01-20T14:45:00Z", internalNotes: "",
      thread: [
        { author: "user@email.com", team: false, at: "2027-01-20T14:45:00Z", text: "I cannot log into my account after resetting my password. I tried three times and it keeps saying wrong credentials. Please help me urgently." },
        { author: "Support Mary — Paragon Team", team: true, at: "2027-01-20T15:15:00Z", text: "Hello! Thank you for reaching out. I have looked into your account and I can see the issue. Please try resetting once more with the link I have just sent — it expires in 60 minutes." }
      ]
    },
    {
      id: 246, illustrative: true, subject: "General Question", topic: "General",
      from: "another@email.com", priority: "medium", status: "open",
      assignee: "", createdAt: "2027-01-20T13:12:00Z", internalNotes: "",
      thread: [
        { author: "another@email.com", team: false, at: "2027-01-20T13:12:00Z", text: "How do I create a collection of my favorite websites? I saved a few but cannot find where to group them." }
      ]
    }
  ];

  function readStore() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || "null") || []; }
    catch (error) { return []; }
  }
  function writeStore(list) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (error) { /* blocked */ }
  }
  function findTicket(id) {
    return readStore().filter(function (ticket) { return String(ticket.id) === String(id); })[0] || null;
  }
  function updateTicket(id, mutate) {
    var list = readStore();
    var ticket = list.filter(function (entry) { return String(entry.id) === String(id); })[0];
    if (!ticket) return null;
    mutate(ticket);
    writeStore(list);
    return ticket;
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function when(iso) {
    var date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " — " + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  var toastHandle = null;
  function showToast(text) {
    var toast = document.getElementById("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3400);
  }

  /* ---- List page ---- */
  function cardMarkup(ticket) {
    var priority = PRIORITY_META[ticket.priority] || PRIORITY_META.medium;
    var status = STATUS_META[ticket.status] || STATUS_META.open;
    var first = ticket.thread[0] || { text: "" };
    var excerpt = first.text.length > 60 ? first.text.slice(0, 57) + "..." : first.text;
    return '<article class="team-site-row ' + (ticket.priority === "urgent" ? "st-archived" : "st-preview") + '">' +
      '<div class="team-site-copy">' +
        '<div class="team-site-title"><strong>#' + ticket.id + '</strong><span class="team-site-badge ' + priority.cls + '">' + priority.label + '</span><span class="team-site-cat">' + escapeHTML(ticket.subject) + '</span><span class="team-site-badge ' + status.cls + '">' + status.label + '</span>' + (ticket.illustrative ? '<span class="team-site-localflag">illustrative example</span>' : "") + '</div>' +
        '<div class="team-site-sub">From: ' + escapeHTML(ticket.from) + ' · ' + when(ticket.createdAt) + '</div>' +
        '<div class="team-site-sub">“' + escapeHTML(excerpt) + '”</div>' +
        '<div class="team-site-sub">Assigned to: ' + (ticket.assignee ? escapeHTML(ticket.assignee) : "Unassigned") + '</div>' +
      '</div>' +
      '<div class="team-site-actions"><a class="team-mini-link" href="desk.html?page=ticket&id=' + ticket.id + '">View &amp; Reply →</a></div>' +
    '</article>';
  }

  function renderList() {
    var listNode = document.getElementById("ticket-list");
    if (!listNode) return;
    var term = (document.getElementById("ticket-search").value || "").trim().toLowerCase();
    var statusFilter = document.getElementById("ticket-status-filter").value;
    var priorityFilter = document.getElementById("ticket-priority-filter").value;
    var assigneeFilter = document.getElementById("ticket-assignee-filter").value;
    var list = readStore().filter(function (ticket) {
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
      if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
      if (assigneeFilter === "unassigned" && ticket.assignee) return false;
      if (!term) return true;
      var haystack = ("#" + ticket.id + " " + ticket.subject + " " + ticket.from + " " + ticket.thread.map(function (m) { return m.text; }).join(" ")).toLowerCase();
      return haystack.indexOf(term) !== -1;
    });
    list.sort(function (a, b) {
      var rank = { urgent: 0, medium: 1, low: 2 };
      return rank[a.priority] - rank[b.priority] || Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
    document.getElementById("ticket-total").textContent = list.length + " ticket" + (list.length === 1 ? "" : "s") + " (real tickets arrive with the support backend)";
    listNode.innerHTML = list.length
      ? list.map(cardMarkup).join("")
      : '<div class="empty-state"><div class="empty-icon">🎫</div><h3>No tickets yet</h3><p>Real support tickets arrive here when the Help &amp; Support backend activates — no fake queue is shown. Load the illustrative examples to preview the workflow.</p></div>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("ticket-list")) return;
    renderList();
    ["ticket-search", "ticket-status-filter", "ticket-priority-filter", "ticket-assignee-filter"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", renderList);
      document.getElementById(id).addEventListener("change", renderList);
    });
    document.getElementById("load-tickets-example").addEventListener("click", function () {
      var list = readStore();
      if (list.some(function (ticket) { return ticket.illustrative; })) { showToast("The illustrative tickets are already loaded."); return; }
      writeStore(list.concat(JSON.parse(JSON.stringify(EXAMPLES))));
      renderList();
      showToast("Illustrative tickets #246 and #247 loaded — clearly labelled.");
    });
  });

  window.ParagonTeamTickets = { readStore: readStore, writeStore: writeStore, findTicket: findTicket, updateTicket: updateTicket, PRIORITY_META: PRIORITY_META, STATUS_META: STATUS_META, EXAMPLES: EXAMPLES, escapeHTML: escapeHTML, when: when, showToast: showToast };
})();

}

/* ================= PAGE MODULE: user-profile.js (runs only on user-profile.html) ================= */
if (paragonTeamPage() === "user-profile.html") {
(function () {
  "use strict";

  var U = window.ParagonTeamUsers;
  var userId = new URLSearchParams(window.location.search).get("id") || "";

  function element(id) { return document.getElementById(id); }

  function statLabel(value) { return value === null || value === undefined ? "—" : String(value); }

  function allowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return P.can(P.getRole ? P.getRole() : "super-admin", action);
  }

  function render() {
    var user = U.findUser(userId);
    if (!user) {
      element("profile-not-found").style.display = "block";
      element("profile-body").style.display = "none";
      return;
    }
    element("profile-body").style.display = "block";
    var status = U.statusOf(user);
    document.title = user.username + " — Paragon Team Dashboard";
    element("profile-avatar").textContent = user.username.slice(0, 1).toUpperCase();
    element("profile-username").textContent = user.username;
    element("profile-email").textContent = user.email;
    var badge = element("profile-status-badge");
    badge.textContent = status.label;
    badge.className = "team-site-badge " + status.cls;
    element("profile-illustrative-flag").hidden = !user.illustrative;
    var joined = new Date(user.joinedAt);
    element("profile-joined").textContent = "Joined: " + (Number.isNaN(joined.getTime()) ? "—" : joined.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }));
    element("profile-lastactive").textContent = "Last Active: " + user.lastActive;
    var stats = user.stats || {};
    element("pstat-visits").textContent = statLabel(stats.visits);
    element("pstat-reviews").textContent = statLabel(stats.reviews);
    element("pstat-saved").textContent = statLabel(stats.saved);
    element("pstat-collections").textContent = statLabel(stats.collections);
    element("pstat-reports").textContent = statLabel(stats.reports || 0);

    /* Moderation history — real recorded actions */
    var record = U.moderation()[user.id];
    var history = (record && record.history) || [];
    element("profile-modhistory").innerHTML = history.length
      ? history.map(function (entry) {
          return '<article class="team-site-row st-review"><div class="team-site-sub"><strong>' + U.escapeHTML(entry.action.toUpperCase()) + '</strong> · ' + new Date(entry.at).toLocaleString() + (entry.detail && entry.detail.reason ? ' · Reason: ' + U.escapeHTML(entry.detail.reason) : entry.detail && typeof entry.detail === "string" ? ' · ' + U.escapeHTML(entry.detail) : "") + ' · queued for backend sync</div></article>';
        }).join("")
      : '<p class="team-site-sub">No moderation actions on this account</p>';

    /* Their reviews */
    var reviews = user.reviews || [];
    element("profile-reviews").innerHTML = reviews.length
      ? reviews.map(function (review, index) {
          return '<article class="team-site-row st-preview"><div class="team-site-sub"><strong>' + U.escapeHTML(review.site) + '</strong> · ' + "⭐".repeat(review.stars) + '<br>“' + U.escapeHTML(review.text) + '”</div><div class="team-site-actions"><button type="button" class="team-mini-link danger" data-delreview="' + index + '">🗑 Delete Review</button></div></article>';
        }).join("")
      : '<p class="team-site-sub">' + (user.realLocal ? "Review activity syncs with the accounts backend." : "No reviews on record.") + '</p>';

    /* Actions */
    element("action-email").href = "mailto:" + encodeURIComponent(user.email) + "?subject=Paragon%20Archive%20Team";
    element("action-suspend").hidden = status.key === "suspended" || status.key === "banned" || !allowed("Suspend User Temporarily");
    element("action-lift").hidden = status.key !== "suspended" || !allowed("Suspend User Temporarily");
    element("action-ban").disabled = status.key === "banned";
    element("action-ban").hidden = !allowed("Ban User Permanently");
    element("action-delete").hidden = !allowed("Delete User Account");
  }

  function bindActions() {
    element("action-suspend").addEventListener("click", function () { element("suspend-modal").style.display = "flex"; });
    ["suspend-close", "suspend-cancel"].forEach(function (id) {
      element(id).addEventListener("click", function () { element("suspend-modal").style.display = "none"; });
    });
    element("suspend-confirm").addEventListener("click", function () {
      var reason = element("suspend-reason").value.trim();
      if (!reason) { U.showToast("A reason is required to suspend."); return; }
      var days = Number(element("suspend-duration").value) || 3;
      U.recordAction(userId, "suspend", { until: new Date(Date.now() + days * 86400000).toISOString(), reason: reason });
      element("suspend-modal").style.display = "none";
      U.showToast("Suspended for " + days + " day(s). User notification dispatches with the backend.");
      render();
    });
    element("action-lift").addEventListener("click", function () {
      U.recordAction(userId, "lift");
      U.showToast("Suspension lifted.");
      render();
    });
    element("action-ban").addEventListener("click", function () {
      var user = U.findUser(userId);
      var banConfirm = window.ParagonTeamConfirm ? window.ParagonTeamConfirm({
        icon: "🚫", title: "BAN USER PERMANENTLY", danger: true, confirmLabel: "🚫 Ban Permanently",
        requireReason: true, reasonLabel: "Reason for ban",
        lines: [
          "You are about to permanently ban " + (user ? user.username : "this user") + " from Paragon Archive.",
          "This user will:",
          "• Lose all access to Paragon Archive",
          "• Be blocked from creating new accounts with the same email",
          "• Receive a ban notification email (dispatches at backend activation)"
        ]
      }) : Promise.resolve({ ok: false, reason: "" }) /* no modal system — refuse destructive action */;
      banConfirm.then(function (result) {
        if (!result.ok) return;
        U.recordAction(userId, "ban", result.reason || "Banned");
        U.showToast("Account banned permanently — notification queues for backend dispatch.");
        render();
      });
    });
    element("action-delete").addEventListener("click", function () {
      window.ParagonTeamConfirm({
        icon: "🗑️", title: "DELETE USER ACCOUNT", danger: true, confirmLabel: "🗑️ Delete Account",
        lines: ["You are about to delete this user's account.", "The account moves to the 90-day archive vault before permanent deletion.", "(Super Admin only — backend claims enforce this at activation.)"]
      }).then(function (result) {
        if (!result.ok) return;
        U.recordAction(userId, "delete");
        U.showToast("Account deleted — held in the vault for 90 days.");
        window.setTimeout(function () { window.location.href = "users.html"; }, 900);
      });
    });
    element("profile-reviews").addEventListener("click", function (event) {
      var button = event.target.closest("[data-delreview]");
      if (!button) return;
      U.showToast("Review removal is recorded and applies to the public Archive at backend integration.");
      button.closest("article").style.opacity = "0.4";
      button.disabled = true;
      button.textContent = "Removal recorded";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    bindActions();
  });
})();

}

/* ================= PAGE MODULE: users.js (runs only on users.html) ================= */
if (paragonTeamPage() === "users.html") {
(function () {
  "use strict";

  var MOD_KEY = "paragonTeamUsers.moderation.v1";
  var EXAMPLES_KEY = "paragonTeamUsers.examplesLoaded.v1";

  var ILLUSTRATIVE = [
    {
      id: "example-username123", illustrative: true,
      username: "username123", email: "user@email.com",
      joinedAt: "2027-01-15T09:00:00Z", lastActive: "today",
      stats: { visits: 47, reviews: 12, saved: 8, collections: 3, reports: 0 },
      reviews: [
        { site: "Paragon Notes", stars: 5, text: "Best notes app I have used. The offline mode is perfect." },
        { site: "Paragon Quiz", stars: 4, text: "Fun quizzes, would love more categories." }
      ]
    },
    {
      id: "example-spammer999", illustrative: true,
      username: "spammer999", email: "spam@email.com",
      joinedAt: "2027-01-18T14:00:00Z", lastActive: "Jan 19",
      stats: { visits: 2, reviews: 47, saved: 0, collections: 0, reports: 6 },
      reviews: [
        { site: "Paragon Notes", stars: 5, text: "CHECK OUT MY SITE buy-cheap-stuff dot example!!!" },
        { site: "Paragon Chess", stars: 5, text: "CHECK OUT MY SITE buy-cheap-stuff dot example!!!" }
      ],
      preSuspended: true
    }
  ];

  function readJSON(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || "null") || fallback; }
    catch (error) { return fallback; }
  }
  function writeJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* blocked */ }
  }
  function moderation() { return readJSON(MOD_KEY, {}); }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  /* Real local identities: Community membership records on this device. */
  function realLocalUsers() {
    var list = [];
    for (var index = 0; index < window.localStorage.length; index += 1) {
      var key = window.localStorage.key(index) || "";
      if (key.indexOf("paragonCommunityMembership:") === 0) {
        var record = readJSON(key, null);
        if (record && record.joinedAt) {
          list.push({
            id: "local-" + key.slice("paragonCommunityMembership:".length),
            illustrative: false, realLocal: true,
            username: record.displayName || "Community member",
            email: record.email || "email syncs with backend",
            joinedAt: record.joinedAt, lastActive: "this device",
            stats: { visits: null, reviews: null, saved: null, collections: null, reports: 0 },
            reviews: []
          });
        }
      }
    }
    return list;
  }

  function allUsers() {
    var list = realLocalUsers();
    if (readJSON(EXAMPLES_KEY, false)) list = list.concat(JSON.parse(JSON.stringify(ILLUSTRATIVE)));
    return list;
  }

  function findUser(id) {
    return allUsers().filter(function (user) { return user.id === id; })[0] || null;
  }

  function statusOf(user) {
    var record = moderation()[user.id];
    if (record) {
      if (record.status === "banned") return { key: "banned", label: "🚫 Banned", cls: "st-archived" };
      if (record.status === "suspended") {
        var left = Math.ceil((Date.parse(record.suspendedUntil || 0) - Date.now()) / 86400000);
        if (left > 0) return { key: "suspended", label: "🔴 Suspended (" + left + " day" + (left === 1 ? "" : "s") + " remaining)", cls: "st-archived", daysLeft: left };
      }
      if (record.status === "deleted") return { key: "deleted", label: "🗑️ Deleted", cls: "st-archived" };
    }
    return { key: "active", label: "🟢 Active", cls: "st-live" };
  }

  function recordAction(userId, action, detail) {
    var map = moderation();
    var record = map[userId] || { history: [] };
    record.history = record.history || [];
    record.history.push({ action: action, detail: detail || "", at: new Date().toISOString(), pendingBackendSync: true });
    if (action === "suspend") { record.status = "suspended"; record.suspendedUntil = detail.until; record.reason = detail.reason; }
    if (action === "lift") { record.status = "active"; record.suspendedUntil = null; }
    if (action === "ban") { record.status = "banned"; record.reason = detail; }
    if (action === "delete") { record.status = "deleted"; }
    map[userId] = record;
    writeJSON(MOD_KEY, map);
  }

  function statLabel(value) { return value === null || value === undefined ? "—" : String(value); }

  /* ---- List page ---- */
    function allowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return P.can(P.getRole ? P.getRole() : "super-admin", action);
  }

  function rowMarkup(user) {
    var status = statusOf(user);
    var stats = user.stats || {};
    var joined = new Date(user.joinedAt);
    var actions = ['<a class="team-mini-link" href="desk.html?page=user-profile?id=' + encodeURIComponent(user.id) + '">View Profile</a>'];
    // P-064: actions follow the permissions matrix for the CURRENT role.
    if (allowed("Suspend User Temporarily")) {
      if (status.key === "suspended") actions.push('<button type="button" class="team-mini-link" data-uact="lift" data-id="' + escapeHTML(user.id) + '">Lift Suspension</button>');
      else if (status.key !== "banned" && status.key !== "deleted") actions.push('<button type="button" class="team-mini-link" data-uact="suspend" data-id="' + escapeHTML(user.id) + '">Suspend</button>');
    }
    if (allowed("Ban User Permanently") && status.key !== "banned" && status.key !== "deleted") actions.push('<button type="button" class="team-mini-link danger" data-uact="ban" data-id="' + escapeHTML(user.id) + '">Ban</button>');
    if (allowed("Delete User Account") && status.key !== "deleted") actions.push('<button type="button" class="team-mini-link danger" data-uact="delete" data-id="' + escapeHTML(user.id) + '">Delete</button>');
    return '<article class="team-site-row ' + status.cls + '">' +
      '<div class="team-site-main">' +
        '<span class="team-site-icon" aria-hidden="true">👤</span>' +
        '<div class="team-site-copy">' +
          '<div class="team-site-title"><strong>' + escapeHTML(user.username) + '</strong><span class="team-site-cat">' + escapeHTML(user.email) + '</span><span class="team-site-badge ' + status.cls + '">' + status.label + '</span>' + (user.illustrative ? '<span class="team-site-localflag">illustrative example</span>' : user.realLocal ? '<span class="team-site-localflag" style="border-color:rgba(34,197,94,0.5);color:#22c55e;">real · this device</span>' : "") + '</div>' +
          '<div class="team-site-sub">Joined: ' + (Number.isNaN(joined.getTime()) ? "—" : joined.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })) + ' · Last active: ' + escapeHTML(user.lastActive) + ' · Visits: ' + statLabel(stats.visits) + ' · Reviews: ' + statLabel(stats.reviews) + ' · Saved: ' + statLabel(stats.saved) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="team-site-actions">' + actions.join("") + '</div>' +
    '</article>';
  }

  var toastHandle = null;
  function showToast(text) {
    var toast = document.getElementById("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3400);
  }

  function renderList() {
    var listNode = document.getElementById("user-list");
    if (!listNode) return;
    var term = (document.getElementById("user-search").value || "").trim().toLowerCase();
    var statusFilter = document.getElementById("user-status-filter").value;
    var sort = document.getElementById("user-sort").value;
    var list = allUsers().filter(function (user) {
      var status = statusOf(user);
      if (status.key === "deleted") return false;
      if (statusFilter !== "all" && status.key !== statusFilter) return false;
      if (!term) return true;
      return (user.username + " " + user.email).toLowerCase().indexOf(term) !== -1;
    });
    list.sort(function (a, b) {
      if (sort === "oldest") return Date.parse(a.joinedAt) - Date.parse(b.joinedAt);
      if (sort === "name") return a.username.localeCompare(b.username);
      return Date.parse(b.joinedAt) - Date.parse(a.joinedAt);
    });
    document.getElementById("user-total").textContent = "Total: " + list.length + " user" + (list.length === 1 ? "" : "s") + " (real accounts arrive with the backend)";
    listNode.innerHTML = list.length
      ? list.map(rowMarkup).join("")
      : '<div class="empty-state"><div class="empty-icon">👥</div><h3>No users yet</h3><p>Real accounts appear when the Supabase backend activates. Community joins on this device show here as real local identities, or load the illustrative examples to preview moderation.</p></div>';
  }

  function handleListAction(act, id) {
    var user = findUser(id);
    if (!user) return;
    if (act === "suspend") {
      if (!allowed("Suspend User Temporarily")) { showToast("The permissions matrix denies Suspend for your role."); return; }
      window.ParagonTeamConfirm({
        icon: "⏸️", title: "SUSPEND ACCOUNT", confirmLabel: "Suspend",
        lines: ["Temporarily suspend " + user.username + " from Paragon Archive."],
        field: { type: "select", label: "Duration", required: true, value: "3", options: [{value:"1",label:"1 day"},{value:"3",label:"3 days"},{value:"7",label:"7 days"},{value:"14",label:"14 days"},{value:"30",label:"30 days"}] },
        requireReason: true, reasonLabel: "Reason"
      }).then(function (result) {
        if (!result.ok) return;
        var days = Math.max(1, Math.min(30, Number(result.value) || 3));
        recordAction(id, "suspend", { until: new Date(Date.now() + days * 86400000).toISOString(), reason: result.reason });
        showToast(user.username + " suspended for " + days + " day(s). User notification dispatches with the backend.");
        renderList();
      });
      return;
    }
    if (act === "lift") { recordAction(id, "lift"); showToast("Suspension lifted for " + user.username + "."); }
    if (act === "ban") {
      if (!allowed("Ban User Permanently")) { showToast("The permissions matrix denies Ban for your role."); return; }
      var banConfirm = window.ParagonTeamConfirm ? window.ParagonTeamConfirm({
        icon: "🚫", title: "BAN USER PERMANENTLY", danger: true, confirmLabel: "🚫 Ban Permanently",
        requireReason: true, reasonLabel: "Reason for ban",
        lines: [
          "You are about to permanently ban " + user.username + " from Paragon Archive.",
          "This user will:",
          "• Lose all access to Paragon Archive",
          "• Be blocked from creating new accounts with the same email",
          "• Receive a ban notification email (dispatches at backend activation)"
        ]
      }) : Promise.resolve({ ok: false, reason: "" }) /* no modal system — refuse destructive action */;
      banConfirm.then(function (result) {
        if (!result.ok) return;
        recordAction(id, "ban", result.reason || "Banned");
        showToast(user.username + " banned permanently — notification queues for backend dispatch.");
        renderList();
      });
      return;
    }
    if (act === "delete") {
      if (!allowed("Delete User Account")) { showToast("Delete User Account is Super Admin only — enforced per the matrix."); return; }
      window.ParagonTeamConfirm({
        icon: "🗑️", title: "DELETE USER ACCOUNT", danger: true, confirmLabel: "🗑️ Delete Account",
        lines: ["You are about to delete " + user.username + "'s account.", "The account moves to the 90-day archive vault before permanent deletion.", "(Super Admin only — backend claims enforce this at activation.)"]
      }).then(function (result) {
        if (!result.ok) return;
        recordAction(id, "delete");
        showToast(user.username + " deleted — held in the vault for 90 days.");
        renderList();
      });
      return;
    }
    renderList();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("user-list")) return; // profile page uses the module only
    // P-058: sidebar deep-links preset the status filter (?status=banned)
    var presetStatusFromUrl = new URLSearchParams(window.location.search).get("status");
    if (presetStatusFromUrl) document.getElementById("user-status-filter").value = presetStatusFromUrl;
    renderList();
    ["user-search", "user-status-filter", "user-sort"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", renderList);
      document.getElementById(id).addEventListener("change", renderList);
    });
    document.getElementById("load-users-example").addEventListener("click", function () {
      if (readJSON(EXAMPLES_KEY, false)) { showToast("Illustrative examples are already loaded."); return; }
      writeJSON(EXAMPLES_KEY, true);
      // spammer999 arrives pre-suspended with 3 days remaining, per the owner's spec card.
      recordAction("example-spammer999", "suspend", { until: new Date(Date.now() + 3 * 86400000).toISOString(), reason: "Review spam (illustrative)" });
      renderList();
      showToast("Illustrative users loaded — clearly labelled.");
    });
    document.getElementById("user-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-uact]");
      if (button) handleListAction(button.dataset.uact, button.dataset.id);
    });
  });

  window.ParagonTeamUsers = { allUsers: allUsers, findUser: findUser, statusOf: statusOf, recordAction: recordAction, moderation: moderation, ILLUSTRATIVE: ILLUSTRATIVE, EXAMPLES_KEY: EXAMPLES_KEY, escapeHTML: escapeHTML, showToast: showToast };
})();

}

/* ================= PAGE MODULE: websites.js (runs only on websites.html) ================= */
if (paragonTeamPage() === "websites.html") {
(function () {
  "use strict";

  var OVERRIDE_KEY = "paragonTeamWebsites.overrides.v1";
  var DRAFTS_KEY = "paragonTeamWebsites.drafts.v1";
  var ARCHIVE_DAYS = 90;

  var STATUS_META = {
    live:      { badge: "🟢 Live", cls: "st-live" },
    preview:   { badge: "🧭 Concept Preview", cls: "st-preview" },
    draft:     { badge: "📝 Draft", cls: "st-draft" },
    scheduled: { badge: "📅 Scheduled", cls: "st-scheduled" },
    review:    { badge: "🟡 Under Review", cls: "st-review" },
    archived:  { badge: "🔴 Archived", cls: "st-archived" }
  };

  var editingKey = null; // draft id or catalogue site name being edited

  function element(id) { return document.getElementById(id); }
  function sites() { return Array.isArray(window.ParagonSites) ? window.ParagonSites : []; }

  function readJSON(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key) || "null") || fallback; }
    catch (error) { return fallback; }
  }
  function writeJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* blocked */ }
  }
  function overrides() { return readJSON(OVERRIDE_KEY, {}); }
  function drafts() { return readJSON(DRAFTS_KEY, []); }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function baseStatus(site) {
    var live = site.siteUrl && site.siteUrl !== "#" && !/^paragon-product-preview\.html/.test(site.siteUrl);
    return live ? "live" : "preview";
  }

  function effectiveStatus(entry) {
    if (entry.isDraft) return entry.override && entry.override.status ? entry.override.status : "draft";
    return (entry.override && entry.override.status) || baseStatus(entry.site);
  }

  function allEntries() {
    var map = overrides();
    var list = sites().map(function (site) {
      return { site: site, isDraft: false, key: site.name, override: map[site.name] || null };
    });
    drafts().forEach(function (draft) {
      list.push({ site: draft, isDraft: true, key: draft.id, override: map[draft.id] || null });
    });
    return list;
  }

  function realViews(name) {
    try { return window.ParagonMetrics ? window.ParagonMetrics.getViewCount(name) : 0; }
    catch (error) { return 0; }
  }

  function daysLeft(archivedAt) {
    var elapsed = (Date.now() - Date.parse(archivedAt || 0)) / 86400000;
    return Math.max(0, Math.ceil(ARCHIVE_DAYS - elapsed));
  }

  function toggleConstructionFromRow(name, mode) {
    var map = readJSON("paragonTeamConstruction.v1", {});
    var site = sites().filter(function (entry) { return entry.name === name; })[0] || {};
    if (mode === "mark") {
      map[name] = Object.assign({}, map[name] || {}, { progress: map[name] && map[name].progress != null ? map[name].progress : Math.max(0, Math.min(100, Number(site.buildProgress) || 0)), note: (map[name] || {}).note || "", hidden: false, updatedAt: new Date().toISOString(), by: "Paragon Team (this device)" });
      showToast(name + " is now UNDER CONSTRUCTION — its public page shows the construction stage.");
    } else {
      map[name] = Object.assign({}, map[name] || {}, { hidden: true, updatedAt: new Date().toISOString(), by: "Paragon Team (this device)" });
      showToast(name + " construction retired — the under-construction stage stops showing.");
    }
    try { window.localStorage.setItem("paragonTeamConstruction.v1", JSON.stringify(map)); } catch (error) { /* blocked */ }
    render();
    renderConstruction();
  }

  function setOverride(key, patch) {
    var map = overrides();
    if (patch === null) delete map[key];
    else map[key] = Object.assign({}, map[key] || {}, patch, { updatedAt: new Date().toISOString(), localOnly: true });
    writeJSON(OVERRIDE_KEY, map);
    render();
  }

  /* ---- Row markup ---- */
  function statusLine(entry, status) {
    var site = entry.site;
    if (status === "scheduled") {
      var when = entry.override && entry.override.scheduledFor ? new Date(entry.override.scheduledFor).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "date not set";
      return "Goes live: " + when;
    }
    if (status === "draft") return "Not yet published · team-only record";
    if (status === "archived") return "In the " + ARCHIVE_DAYS + "-day archive · " + daysLeft(entry.override && entry.override.archivedAt) + " days left before purge";
    /* P-097 — REAL user-written reviews only (mirror kept by the Archive + guest session). */
    var reviews = 0;
    try { reviews = (JSON.parse(window.localStorage.getItem("paragonArchive.reviewMirror.v1") || "null") || {}).total || 0; } catch (error) { reviews = 0; }
    var stars = Number.isFinite(Number(site.stars)) ? "⭐" + site.stars : "⭐ New";
    return realViews(site.name) + " views · " + stars + " · " + reviews + " review" + (reviews === 1 ? "" : "s");
  }

  function constructionState(name) {
    var logs = readJSON("paragonTeamConstruction.v1", {});
    var log = logs[name];
    if (!log) return "none";
    return log.hidden ? "retired" : "active";
  }
  function actionsFor(entry, status) {
    var actions = ['<button type="button" class="team-mini-link" data-action="edit" data-key="' + escapeHTML(entry.key) + '">Edit</button>'];
    /* P-097 — construction control directly on every row: mark under construction / retire it,
       wired to the Construction Desk store AND the website's public construction page. */
    if (!entry.isDraft) {
      var state = constructionState(entry.site.name);
      actions.push(state === "active"
        ? '<button type="button" class="team-mini-link" data-action="con-retire" data-key="' + escapeHTML(entry.key) + '">Retire construction</button>'
        : '<button type="button" class="team-mini-link" data-action="con-mark" data-key="' + escapeHTML(entry.key) + '">Mark under construction</button>');
      actions.push('<a class="team-mini-link" href="../paragon-product-preview.html?site=' + encodeURIComponent(entry.site.name) + '">Construction page</a>');
    }
    if (status === "live" || status === "preview") {
      actions.push('<button type="button" class="team-mini-link" data-action="review" data-key="' + escapeHTML(entry.key) + '">Mark Under Review</button>');
      actions.push('<button type="button" class="team-mini-link" data-action="schedule" data-key="' + escapeHTML(entry.key) + '">Schedule</button>');
      actions.push('<button type="button" class="team-mini-link danger" data-action="archive" data-key="' + escapeHTML(entry.key) + '">Archive</button>');
    }
    if (status === "scheduled") actions.push('<button type="button" class="team-mini-link" data-action="cancel-schedule" data-key="' + escapeHTML(entry.key) + '">Cancel Schedule</button>');
    if (status === "review") actions.push('<button type="button" class="team-mini-link" data-action="approve" data-key="' + escapeHTML(entry.key) + '">Approve</button>');
    if (status === "archived") actions.push('<button type="button" class="team-mini-link" data-action="restore" data-key="' + escapeHTML(entry.key) + '">Restore</button>');
    if (entry.isDraft) {
      if (status === "draft") actions.push('<button type="button" class="team-mini-link" data-action="publish" data-key="' + escapeHTML(entry.key) + '">Publish</button>');
      actions.push('<button type="button" class="team-mini-link danger" data-action="delete-draft" data-key="' + escapeHTML(entry.key) + '">Delete Draft</button>');
    }
    actions.push('<button type="button" class="team-mini-link" data-action="stats" data-key="' + escapeHTML(entry.key) + '">View Stats</button>');
    if (!entry.isDraft) actions.push('<a class="team-mini-link" href="../paragon-archive.html?site=' + encodeURIComponent(entry.site.name) + '">View on Archive</a>');
    return actions.join("");
  }

  function rowMarkup(entry) {
    var status = effectiveStatus(entry);
    var meta = STATUS_META[status];
    var site = entry.site;
    return '<article class="team-site-row ' + meta.cls + '">' +
      '<div class="team-site-main">' +
        '<span class="team-site-icon" aria-hidden="true">' + escapeHTML(site.icon || "🌐") + '</span>' +
        '<div class="team-site-copy">' +
          '<div class="team-site-title"><strong>' + escapeHTML(site.name) + '</strong><span class="team-site-cat">📁 ' + escapeHTML(site.category || "—") + '</span><span class="team-site-badge ' + meta.cls + '">' + meta.badge + '</span>' + (entry.override && entry.override.localOnly ? '<span class="team-site-localflag" title="Local team state — syncs with backend">local</span>' : "") + '</div>' +
          '<div class="team-site-sub">' + escapeHTML(statusLine(entry, status)) + ' · ' + escapeHTML(site.version || "v?") + '</div>' +
          '<div class="team-site-stats" id="stats-' + escapeHTML(entry.key).replace(/\s/g, "_") + '" hidden></div>' +
        '</div>' +
      '</div>' +
      '<div class="team-site-actions">' + actionsFor(entry, status) + '</div>' +
    '</article>';
  }

  /* ---- Filters ---- */
  function filteredEntries() {
    var term = (element("site-search").value || "").trim().toLowerCase();
    var category = element("site-category").value;
    var statusFilter = element("site-status").value;
    var sort = element("site-sort").value;
    var list = allEntries().filter(function (entry) {
      var status = effectiveStatus(entry);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (statusFilter === "all" && status === "archived") return false; // archived hidden unless requested
      if (category !== "all" && entry.site.category !== category) return false;
      if (!term) return true;
      return (entry.site.name + " " + (entry.site.desc || "") + " " + (entry.site.category || "")).toLowerCase().indexOf(term) !== -1;
    });
    list.sort(function (a, b) {
      if (sort === "views") return realViews(b.site.name) - realViews(a.site.name) || a.site.name.localeCompare(b.site.name);
      if (sort === "rating") return (Number(b.site.stars) || 0) - (Number(a.site.stars) || 0) || a.site.name.localeCompare(b.site.name);
      if (sort === "newest") return Date.parse(b.site.addedAt || b.site.createdAt || 0) - Date.parse(a.site.addedAt || a.site.createdAt || 0);
      return a.site.name.localeCompare(b.site.name);
    });
    return list;
  }

  function render() {
    var list = filteredEntries();
    element("site-count").textContent = "Showing " + list.length + " website" + (list.length === 1 ? "" : "s");
    element("site-list").innerHTML = list.length ? list.map(rowMarkup).join("") : '<div class="empty-state"><div class="empty-icon">🔍</div><h3>No websites match</h3><p>Adjust the filters or add a new draft.</p></div>';
  }

  /* ---- Toast ---- */
  var toastHandle = null;
  function showToast(text) {
    var toast = element("dash-toast");
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3200);
  }

  /* ---- Modal (add / edit) ---- */
  function categoryOptions() {
    var seen = {};
    sites().forEach(function (site) { if (site.category) seen[site.category] = true; });
    return Object.keys(seen).sort();
  }

  function openModal(entry) {
    editingKey = entry ? entry.key : null;
    element("site-modal-title").textContent = entry ? "Edit " + entry.site.name : "Add Website (team draft)";
    element("modal-site-name").value = entry ? entry.site.name : "";
    element("modal-site-name").disabled = Boolean(entry && !entry.isDraft);
    element("modal-site-icon").value = entry ? entry.site.icon || "" : "";
    element("modal-site-desc").value = entry ? (entry.override && entry.override.desc) || entry.site.desc || "" : "";
    element("modal-site-version").value = entry ? (entry.override && entry.override.version) || entry.site.version || "" : "v0.1 — Draft";
    var select = element("modal-site-category");
    select.innerHTML = categoryOptions().map(function (category) { return "<option" + ((entry && entry.site.category === category) ? " selected" : "") + ">" + escapeHTML(category) + "</option>"; }).join("");
    element("site-modal-note").textContent = entry && !entry.isDraft
      ? "Catalogue websites are defined in the public data files; these edits save as local team overrides and sync to the real catalogue when the backend activates."
      : "Drafts are genuinely team-only: they exist in this manager and never appear in the public Archive until published through catalogue integration.";
    element("site-modal").style.display = "flex";
  }
  function closeModal() { element("site-modal").style.display = "none"; editingKey = null; }

  function saveModal() {
    var name = element("modal-site-name").value.trim();
    var desc = element("modal-site-desc").value.trim();
    if (!name || !desc) { showToast("Name and description are required."); return; }
    var patch = {
      desc: desc,
      version: element("modal-site-version").value.trim(),
      icon: element("modal-site-icon").value.trim() || "🌐",
      category: element("modal-site-category").value
    };
    if (editingKey) {
      var draftList = drafts();
      var draft = draftList.filter(function (d) { return d.id === editingKey; })[0];
      if (draft) {
        Object.assign(draft, { name: name, desc: patch.desc, version: patch.version, icon: patch.icon, category: patch.category });
        writeJSON(DRAFTS_KEY, draftList);
      } else {
        setOverride(editingKey, patch);
        closeModal();
        showToast("Saved as a local team override for " + editingKey + ".");
        return;
      }
    } else {
      var list = drafts();
      list.push({ id: "draft-" + Date.now().toString(36), name: name, desc: patch.desc, icon: patch.icon, category: patch.category, version: patch.version || "v0.1 — Draft", createdAt: new Date().toISOString(), reviews: [], stars: "New" });
      writeJSON(DRAFTS_KEY, list);
      showToast("Draft created — visible only in this team manager.");
    }
    closeModal();
    render();
  }

  /* ---- Actions ---- */
  function findEntry(key) {
    return allEntries().filter(function (entry) { return entry.key === key; })[0] || null;
  }

  function handleAction(action, key) {
    var entry = findEntry(key);
    if (!entry) return;
    if (action === "edit") { openModal(entry); return; }
    if (action === "con-mark") { toggleConstructionFromRow(entry.site.name, "mark"); return; } /* P-097 */
    if (action === "con-retire") { toggleConstructionFromRow(entry.site.name, "retire"); return; } /* P-097 */
    if (action === "archive") { setOverride(key, { status: "archived", archivedAt: new Date().toISOString() }); showToast(entry.site.name + " archived — " + ARCHIVE_DAYS + "-day window started. Public visibility syncs at backend integration."); return; }
    if (action === "restore") { setOverride(key, null); showToast(entry.site.name + " restored."); return; }
    if (action === "review") { setOverride(key, { status: "review" }); showToast(entry.site.name + " marked Under Review — the website now shows MAINTENANCE to users (P-097)."); return; } /* P-097 — review = real maintenance */
    if (action === "approve") { setOverride(key, null); showToast(entry.site.name + " approved — returned to its real status."); return; }
    if (action === "schedule") {
      window.ParagonTeamConfirm({
        icon: "📅", title: "SCHEDULE GO-LIVE", confirmLabel: "Schedule",
        lines: ["Set the go-live date for " + entry.site.name + ". The automatic switch activates with the backend."],
        field: { type: "date", label: "Go-live date", required: true, value: "2027-02-01" }
      }).then(function (result) {
        if (!result.ok) return;
        var when = Date.parse(result.value);
        if (!Number.isFinite(when)) { showToast("That date could not be read."); return; }
        setOverride(key, { status: "scheduled", scheduledFor: new Date(when).toISOString() });
        showToast(entry.site.name + " scheduled.");
      });
      return;
    }
    if (action === "cancel-schedule") { setOverride(key, null); showToast("Schedule cancelled for " + entry.site.name + "."); return; }
    if (action === "publish") { showToast("Publishing a draft into the public Archive happens through catalogue integration — ask your build agent to make " + entry.site.name + " real. The draft stays team-only meanwhile."); return; }
    if (action === "delete-draft") {
      window.ParagonTeamConfirm({
        icon: "🗑️", title: "DELETE DRAFT", danger: true, confirmLabel: "🗑️ Delete Draft",
        lines: ["Delete the team draft \u201C" + entry.site.name + "\u201D permanently?", "Drafts are team-only, so this removes it completely."]
      }).then(function (result) {
        if (!result.ok) return;
        writeJSON(DRAFTS_KEY, drafts().filter(function (d) { return d.id !== key; }));
        setOverride(key, null);
        showToast("Draft deleted.");
      });
      return;
    }
    if (action === "stats") {
      var panel = document.getElementById("stats-" + key.replace(/\s/g, "_"));
      if (!panel) return;
      if (!panel.hidden) { panel.hidden = true; return; }
      var reviews = 0;
      try { reviews = (JSON.parse(window.localStorage.getItem("paragonArchive.reviewMirror.v1") || "null") || {}).total || 0; } catch (error) { reviews = 0; }
      panel.innerHTML = "<strong>Real stats (this device):</strong> " + realViews(entry.site.name) + " recorded opens · " + reviews + " real user reviews · added " + (entry.site.addedAt ? new Date(entry.site.addedAt).toLocaleDateString() : "—") + ". Global analytics arrive with the production backend.";
      panel.hidden = false;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    // P-058: sidebar deep-links preset the status filter (?status=scheduled|archived)
    var presetStatusFromUrl = new URLSearchParams(window.location.search).get("status");
    if (presetStatusFromUrl) element("site-status").value = presetStatusFromUrl;
    var select = element("site-category");
    categoryOptions().forEach(function (category) {
      var option = document.createElement("option");
      option.value = category; option.textContent = category;
      select.appendChild(option);
    });
    ["site-search", "site-category", "site-status", "site-sort"].forEach(function (id) {
      element(id).addEventListener("input", render);
      element(id).addEventListener("change", render);
    });
    element("site-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-action]");
      if (button) handleAction(button.dataset.action, button.dataset.key);
    });
    if (window.location.hash === "#add") window.location.href = "desk.html?page=add-website";
    element("site-modal-close").addEventListener("click", closeModal);
    element("site-modal-cancel").addEventListener("click", closeModal);
    element("site-modal-save").addEventListener("click", saveModal);
    bindConstructionDesk();
    render();
  });

  /* ================= P-096 — CONSTRUCTION DESK =================
     The Team owns the real build percentage of every website: progress, a public note,
     and retiring the construction surface. paragon-product-preview.html obeys instantly. */
  var CONSTRUCTION_KEY = "paragonTeamConstruction.v1";
  function constructionLogs() { return readJSON(CONSTRUCTION_KEY, {}); }
  function writeConstruction(map) { writeJSON(CONSTRUCTION_KEY, map); }
  function conWhen(iso) {
    var date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  function renderConstruction() {
    var logs = constructionLogs();
    var entries = Object.keys(logs).map(function (name) { return Object.assign({ site: name }, logs[name]); }).sort(function (a, b) { return Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0); });
    var box = element("con-logs");
    if (!box) return;
    box.innerHTML = entries.length ? entries.map(function (entry) {
      return '<article class="team-site-row ' + (entry.hidden ? "st-archived" : "st-scheduled") + '">' +
        '<div class="team-site-copy">' +
          '<div class="team-site-title"><strong>' + escapeHTML(entry.site) + '</strong><span class="team-site-badge ' + (entry.hidden ? "st-archived" : "st-live") + '">' + (entry.hidden ? "🚀 CONSTRUCTION RETIRED" : "🏗️ " + Number(entry.progress || 0) + "% BUILT") + '</span><span class="team-site-cat">logged ' + conWhen(entry.updatedAt) + ' by ' + escapeHTML(entry.by || "team") + '</span></div>' +
          (entry.note ? '<div class="team-site-sub">📝 ' + escapeHTML(entry.note) + '</div>' : "") +
        '</div>' +
        '<div class="team-site-actions">' +
          '<button type="button" class="team-mini-link" data-conact="edit" data-site="' + escapeHTML(entry.site) + '">Edit</button>' +
          (entry.hidden
            ? '<button type="button" class="team-mini-link" data-conact="restore" data-site="' + escapeHTML(entry.site) + '">Restore construction page</button>'
            : '<button type="button" class="team-mini-link" data-conact="retire" data-site="' + escapeHTML(entry.site) + '">Retire construction</button>') +
          '<button type="button" class="team-mini-link danger" data-conact="clear" data-site="' + escapeHTML(entry.site) + '">Remove log</button>' +
        '</div>' +
      '</article>';
    }).join("") : '<p class="team-site-sub">No construction logs yet — pick a website above and save its honest build percentage.</p>';
  }
  function fillConstructionForm(record) {
    var picker = element("con-site");
    if (picker && record && picker.querySelector('option[value="' + record.site + '"]')) picker.value = record.site;
    element("con-progress").value = record && record.progress != null ? record.progress : 0;
    element("con-note").value = record && record.note ? record.note : "";
  }
  function bindConstructionDesk() {
    var picker = element("con-site");
    if (!picker) return;
    var chosen = "";
    picker.innerHTML = sites().slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (site) {
      return '<option value="' + escapeHTML(site.name) + '">' + escapeHTML(site.icon + " " + site.name) + '</option>';
    }).join("");
    picker.addEventListener("change", function () {
      chosen = picker.value;
      fillConstructionForm({ site: chosen, progress: (sites().find(function (s) { return s.name === chosen; }) || {}).buildProgress || 0, note: (constructionLogs()[chosen] || {}).note });
    });
    var line = element("con-status");
    function setLine(text, tone) { line.hidden = !text; line.textContent = text || ""; line.dataset.tone = tone || "info"; }
    element("con-save").addEventListener("click", function () {
      var name = picker.value;
      var progress = Math.max(0, Math.min(100, Number(element("con-progress").value) || 0));
      var note = element("con-note").value.trim();
      var map = constructionLogs();
      map[name] = Object.assign({}, map[name] || {}, { progress: progress, note: note, hidden: false, updatedAt: new Date().toISOString(), by: "Paragon Team (this device)" });
      writeConstruction(map);
      renderConstruction();
      setLine("Saved — " + name + " now shows " + progress + "% built on its construction page, live on this device.", "eligible");
    });
    element("con-retire").addEventListener("click", function () {
      var name = picker.value;
      if (!window.ParagonTeamConfirm) return;
      window.ParagonTeamConfirm({ icon: "🚀", title: "Retire the construction page", lines: ["The under-construction stage stops showing for " + name + ".", "Use this only when the website is truly built/launched."], confirmLabel: "Retire it", danger: false }).then(function (confirmed) {
        if (!confirmed.ok) return;
        var map = constructionLogs();
        map[name] = Object.assign({}, map[name] || {}, { hidden: true, updatedAt: new Date().toISOString(), by: "Paragon Team (this device)" });
        writeConstruction(map);
        renderConstruction();
        setLine("Retired — " + name + " no longer shows the construction surface.", "eligible");
      });
    });
    element("con-logs").addEventListener("click", function (event) {
      var button = event.target.closest("[data-conact]");
      if (!button) return;
      var name = button.dataset.site;
      var map = constructionLogs();
      if (button.dataset.conact === "edit") { fillConstructionForm(Object.assign({ site: name }, map[name])); picker.value = name; window.scrollTo({ top: document.getElementById("construction-desk-section").offsetTop - 70, behavior: "smooth" }); return; }
      if (button.dataset.conact === "retire") { map[name] = Object.assign({}, map[name] || {}, { hidden: true, updatedAt: new Date().toISOString(), by: "Paragon Team (this device)" }); writeConstruction(map); renderConstruction(); setLine("Retired — " + name + " no longer shows the construction surface.", "eligible"); return; }
      if (button.dataset.conact === "restore") { map[name] = Object.assign({}, map[name] || {}, { hidden: false, updatedAt: new Date().toISOString(), by: "Paragon Team (this device)" }); writeConstruction(map); renderConstruction(); setLine("Restored — " + name + " shows its construction page again.", "eligible"); return; }
      if (button.dataset.conact === "clear") {
        if (!window.ParagonTeamConfirm) return;
        window.ParagonTeamConfirm({ icon: "🗑️", title: "Remove construction log", lines: ["The construction page for " + name + " falls back to the catalogue value."], confirmLabel: "Remove", danger: true }).then(function (confirmed) {
          if (!confirmed.ok) return;
          delete map[name];
          writeConstruction(map);
          renderConstruction();
          setLine("Log removed — " + name + " uses its catalogue build percentage again.", "info");
        });
      }
    });
    renderConstruction();
  }

  window.ParagonTeamWebsites = { effectiveStatus: effectiveStatus, baseStatus: baseStatus, allEntries: allEntries, setOverride: setOverride, STATUS_META: STATUS_META, ARCHIVE_DAYS: ARCHIVE_DAYS, constructionLogs: constructionLogs };
})();

}


/* ================= PAGE MODULE: finance-*.js (Stage 7 — runs only on the routed finance desk panels) ================= */
if (["finance.html", "finance-payments.html", "finance-withdrawals.html", "finance-risk.html", "finance-audit.html", "finance-reports.html", "finance-emergency.html"].indexOf(paragonTeamPage()) !== -1) {
(function () {
  "use strict";

  function element(id) { return document.getElementById(id); }
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
  function when(iso) {
    var date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) + " " + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  function naira(n) { return "₦" + Number(n || 0).toLocaleString(); }
  function coins(n) { return Number(n || 0).toLocaleString(); }
  function activeRole() {
    var P = window.ParagonTeamPermissions;
    return P && P.getRole ? P.getRole() : "super-admin";
  }
  function roleAllowed(action) {
    var P = window.ParagonTeamPermissions;
    if (!P || !P.can) return true;
    return P.can(activeRole(), action) === true;
  }
  var toastHandle = null;
  function showToast(text) {
    var toast = document.getElementById("dash-toast");
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(function () { toast.hidden = true; }, 3600);
  }
  function fmtNaira(value) { return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  /* ---------------- Dashboard (finance.html) ---------------- */
  function statCard(icon, value, label, note) {
    return '<article class="team-stat-card"><span class="team-stat-icon">' + icon + '</span><strong>' + value + '</strong><span>' + label + '</span><small>' + (note || "") + '</small></article>';
  }

  function renderFinanceDashboard() {
    var W = window.ParagonWallets;
    if (!W) return;
    var banner = element("fin-paused-banner");
    var ctrl = W.controls();
    if (banner) banner.innerHTML = ctrl.paused ? '<div class="fin-paused">🛑 FINANCIAL PAUSE IS ON — new purchases, withdrawals and payout approvals are stopped (' + escapeHTML(ctrl.pausedReason || "no reason given") + " · " + escapeHTML(ctrl.pausedBy || "team") + "). Free platform functionality keeps running.</div>" : "";

    var requests = W.allRequests();
    var paid = requests.filter(function (r) { return r.state === "PAID"; });
    var pending = requests.filter(function (r) { return ["LOCKED", "PAYOUT_PENDING", "PROVIDER_SUBMITTED", "PROVIDER_CONFIRMED", "RETRYING", "UNKNOWN", "RECONCILIATION"].indexOf(r.state) !== -1; });
    var failed = requests.filter(function (r) { return r.state === "FAILED"; });
    var unlocked = requests.filter(function (r) { return r.state === "COINS_UNLOCKED"; });
    var paidNaira = paid.reduce(function (sum, r) { return sum + (Number(r.naira) || 0); }, 0);
    var lockedCoinsOut = pending.reduce(function (sum, r) { return sum + (Number(r.lockedCoins) || 0); }, 0);
    var claims = W.allClaims();
    var claimedNaira = claims.filter(function (c) { return c.state !== "DUPLICATE" && c.state !== "REJECTED"; }).reduce(function (sum, c) { return sum + (Number(c.amountNaira) || 0); }, 0);
    var pausedCoins = requests.filter(function (r) { return r.state === "LOCKED"; }).reduce(function (sum, r) { return sum + (Number(r.lockedCoins) || 0); }, 0);
    var cases = W.allCases();
    var openCases = cases.filter(function (c) { return c.state === "OPEN" || c.state === "REVIEW"; }).length;
    var grid = element("fin-stat-grid");
    if (grid) grid.innerHTML =
      statCard("💸", naira(paidNaira), "Paid out (device)", paid.length + " paid withdrawal(s) — real records") +
      statCard("🟡", pending.length + " · " + coins(lockedCoinsOut), "Pending withdrawals", lockedCoinsOut + " coins locked across " + pending.length + " open request(s)") +
      statCard("🪙", naira(claimedNaira), "Claims awaiting verification", claims.length + " payment claim(s) recorded") +
      statCard("🚩", String(openCases), "Open risk cases", cases.length + " total case(s) on this device") +
      statCard("♻️", String(unlocked.length), "Coins returned", unlocked.length + " failed withdrawal(s) fully refunded") +
      statCard("📊", "real zeros", "Reserve coverage", "Liability vs reserve metrics activate with the server ledger — nothing is invented here");
    if (grid) grid.insertAdjacentHTML("beforeend", '<p class="fin-stat-note">Stage 7 dashboard: every number above is computed from real device stores. Server ledger totals, provider balances and reward-reserve coverage arrive at backend activation (supabase/finance-schema.sql).</p>');

    var ledgerHost = element("fin-ledger");
    if (ledgerHost) {
      var rows = W.ledger();
      ledgerHost.innerHTML = rows.length ? rows.slice(0, 60).map(function (row) {
        return '<article class="team-site-row"><div class="team-site-copy"><div class="team-site-title"><strong>' + escapeHTML(row.type) + '</strong><span class="team-site-cat">' + escapeHTML(row.user) + "</span>" + (row.amount ? '<span class="team-site-cat">' + (row.amount > 0 ? "+" : "−") + Math.abs(row.amount).toLocaleString() + " coins</span>" : "") + '</div><div class="team-site-sub">' + escapeHTML(row.reason || "") + " · " + escapeHTML(row.ref || "") + " · " + when(row.at) + '</div></div></article>';
      }).join("") : '<p class="team-site-sub">No typed ledger events yet — the ledger fills with real purchase credits, withdrawal locks/refunds and rewards on this device.</p>';
    }
  }

  /* ---------------- Payment Reconciliation (finance-payments.html) ---------------- */
  function renderPayments() {
    var W = window.ParagonWallets;
    var search = element("pay-search"); var filter = element("pay-filter");
    if (!W || !search) return;
    var term = (search.value || "").toLowerCase().trim();
    var filterState = filter.value;
    var claims = W.allClaims().filter(function (c) {
      if (filterState !== "all" && c.state !== filterState) return false;
      if (term && (String(c.providerTxn).toLowerCase().indexOf(term) === -1) && (String(c.user).toLowerCase().indexOf(term) === -1) && (String(c.amountNaira).indexOf(term) === -1) && (String(c.requestId || "").toLowerCase().indexOf(term) === -1)) return false;
      return true;
    });
    var host = element("pay-claims");
    if (!host) return;
    if (!claims.length) {
      host.innerHTML = '<div class="empty-state" style="padding:26px"><div class="empty-icon">🔎</div><h3>No payment claims' + (term ? " matching “" + escapeHTML(term) + "”" : " yet") + '</h3><p>Claims appear when a user buys coins and submits their bank transfer reference. Honest zero until then.</p></div>';
      return;
    }
    var canConfirm = roleAllowed("Confirm Payment Claims");
    host.innerHTML = claims.map(function (c) {
      var badge = c.state === "DUPLICATE" ? '<span class="team-site-badge st-archived">⛔ DUPLICATE — one credit only</span>'
        : c.state === "CONFIRMED" ? '<span class="team-site-badge st-live">✅ Confirmed</span>'
        : c.state === "REJECTED" ? '<span class="team-site-badge st-archived">❌ Rejected</span>'
        : c.state === "MISMATCH" ? '<span class="team-site-badge st-archived">⚠️ Mismatch</span>'
        : c.state === "PENDING_VERIFICATION" ? '<span class="team-site-badge st-scheduled">🟡 Verifying</span>'
        : c.state === "MANUAL_REVIEW" ? '<span class="team-site-badge st-review">🔵 Manual review</span>'
        : '<span class="team-site-badge st-scheduled">🟢 Claimed</span>';
      return '<article class="team-site-row ' + (c.state === "CONFIRMED" ? "fin-paid-row" : "") + '">' +
        '<div class="team-site-copy">' +
          '<div class="team-site-title"><strong>' + naira(c.amountNaira) + '</strong>' + badge + '<span class="team-site-cat">' + escapeHTML(c.providerTxn) + "</span></div>" +
          '<div class="team-site-sub">' + escapeHTML(c.displayName || c.user) + " · " + escapeHTML(c.user) + " · " + escapeHTML(c.senderBank || "bank: —") + " · claim " + escapeHTML(c.id) + '</div>' +
          (c.duplicateOf ? '<div class="team-site-sub">Duplicate of ' + escapeHTML(c.duplicateOf) + " — never crediting twice.</div>" : "") +
          (c.note ? '<div class="team-site-sub">Note: ' + escapeHTML(c.note) + "</div>" : "") +
          '<div class="team-site-sub">' + when(c.createdAt) + "</div>" +
        "</div>" +
        '<div class="team-site-actions">' +
          (canConfirm && c.state === "CLAIMED" ? '<button type="button" class="team-mini-link" data-claimact="PENDING_VERIFICATION" data-id="' + c.id + '">Start verification</button>' : "") +
          (canConfirm && (c.state === "CLAIMED" || c.state === "PENDING_VERIFICATION" || c.state === "MANUAL_REVIEW" || c.state === "MISMATCH") ? '<button type="button" class="team-mini-link" data-claimact="CONFIRMED" data-id="' + c.id + '">✅ Confirm (verified)</button>' : "") +
          (canConfirm && (c.state === "CLAIMED" || c.state === "PENDING_VERIFICATION") ? '<button type="button" class="team-mini-link" data-claimact="MANUAL_REVIEW" data-id="' + c.id + '">Manual review</button>' : "") +
          (canConfirm && (c.state === "CLAIMED" || c.state === "PENDING_VERIFICATION") ? '<button type="button" class="team-mini-link" data-claimact="MISMATCH" data-id="' + c.id + '">⚠️ Mismatch</button>' : "") +
          (canConfirm && c.state !== "REJECTED" && c.state !== "DUPLICATE" && c.state !== "CONFIRMED" ? '<button type="button" class="team-mini-link danger" data-claimact="REJECTED" data-id="' + c.id + '">Reject</button>' : "") +
        "</div>" +
      "</article>";
    }).join("");
    if (!canConfirm) host.insertAdjacentHTML("beforeend", '<p class="team-site-sub">Your role (' + escapeHTML(activeRole()) + ') can review claims; confirmation is reserved for roles with the Confirm Payment Claims permission.</p>');
  }
  function bindPayments() {
    var host = element("pay-claims");
    if (!host) return;
    host.addEventListener("click", function (event) {
      var button = event.target.closest("[data-claimact]");
      if (!button) return;
      var W = window.ParagonWallets;
      if (!W) return;
      var id = button.dataset.id;
      var to = button.dataset.claimact;
      var note = to === "MISMATCH" ? "Details do not match the transfer reference sent by the user." : to === "MANUAL_REVIEW" ? "Sent for manual review." : to === "REJECTED" ? "Rejected — refund path follows the payment terms." : "";
      var action = to === "CONFIRMED" ? "Confirm this payment claim" : to === "REJECTED" ? "Reject this claim" : "Update claim state";
      window.ParagonTeamConfirm({
        icon: "🔎", title: action, confirmLabel: action,
        lines: ["Claim " + id, "State change: " + to + (note ? " — " + note : ""), "Confirming means the team verified this transfer with its bank records. The coins credit through Settings → Coin Requests (one credit per claim)."]
      }).then(function (result) {
        if (!result.ok) return;
        var verdict = W.claimState(id, activeRole() + " (role preview)", to, { note: note });
        if (!verdict.ok) { showToast("Not allowed: " + verdict.code); return; }
        showToast("Claim " + (to === "CONFIRMED" ? "confirmed — credit it in Coin Requests now." : to + "."));
        renderPayments();
      });
    });
  }
  function buildPayFilter() {
    var filter = element("pay-filter");
    if (!filter) return;
    var options = { all: "All states", CLAIMED: "🟢 Claimed", PENDING_VERIFICATION: "🟡 Verifying", MANUAL_REVIEW: "🔵 Manual review", CONFIRMED: "✅ Confirmed", MISMATCH: "⚠️ Mismatch", REJECTED: "❌ Rejected", DUPLICATE: "⛔ Duplicate" };
    filter.innerHTML = Object.keys(options).map(function (k) { return '<option value="' + k + '">' + options[k] + "</option>"; }).join("");
    filter.addEventListener("change", renderPayments);
  }

  /* ---------------- Withdrawal Desk (finance-withdrawals.html) ---------------- */
  var WD_ACTION_LABELS = {
    PAYOUT_PENDING: "🟢 Release for payout", PROVIDER_SUBMITTED: "📤 Submit to provider", PROVIDER_CONFIRMED: "🔵 Mark provider-confirmed", PAID: "✅ Mark paid", UNKNOWN: "❔ Report status unknown", RECONCILIATION: "🔄 Enter reconciliation", RETRYING: "🔄 Mark retry", FAILED: "❌ Mark failed", COINS_UNLOCKED: "♻️ Return coins to user", CANCEL: "✖️ Cancel & return coins"
  };
  function wdActionButtons(W, w) {
    var allowed = (W.EDGES[w.state] || []).slice();
    var out = "";
    if (w.state === "LOCKED" && allowed.indexOf("PAYOUT_PENDING") !== -1) out += '<button type="button" class="team-mini-link" data-wdact="PAYOUT_PENDING" data-id="' + w.id + '">' + WD_ACTION_LABELS.PAYOUT_PENDING + "</button>";
    if (allowed.indexOf("PROVIDER_SUBMITTED") !== -1) out += '<button type="button" class="team-mini-link" data-wdact="PROVIDER_SUBMITTED" data-id="' + w.id + '">' + WD_ACTION_LABELS.PROVIDER_SUBMITTED + "</button>";
    if (allowed.indexOf("PROVIDER_CONFIRMED") !== -1) out += '<button type="button" class="team-mini-link" data-wdact="PROVIDER_CONFIRMED" data-id="' + w.id + '">' + WD_ACTION_LABELS.PROVIDER_CONFIRMED + "</button>";
    if (allowed.indexOf("PAID") !== -1) out += '<button type="button" class="team-mini-link" data-wdact="PAID" data-id="' + w.id + '">' + WD_ACTION_LABELS.PAID + "</button>";
    if (allowed.indexOf("UNKNOWN") !== -1) out += '<button type="button" class="team-mini-link" data-wdact="UNKNOWN" data-id="' + w.id + '">' + WD_ACTION_LABELS.UNKNOWN + "</button>";
    if (allowed.indexOf("RECONCILIATION") !== -1) out += '<button type="button" class="team-mini-link" data-wdact="RECONCILIATION" data-id="' + w.id + '">' + WD_ACTION_LABELS.RECONCILIATION + "</button>";
    if (allowed.indexOf("RETRYING") !== -1) out += '<button type="button" class="team-mini-link" data-wdact="RETRYING" data-id="' + w.id + '">' + WD_ACTION_LABELS.RETRYING + "</button>";
    if (allowed.indexOf("FAILED") !== -1) out += '<button type="button" class="team-mini-link danger" data-wdact="FAILED" data-id="' + w.id + '">' + WD_ACTION_LABELS.FAILED + "</button>";
    if (allowed.indexOf("COINS_UNLOCKED") !== -1) out += '<button type="button" class="team-mini-link" data-wdact="COINS_UNLOCKED" data-id="' + w.id + '">' + WD_ACTION_LABELS.COINS_UNLOCKED + "</button>";
    return out;
  }
  function renderWithdrawalDesk() {
    var W = window.ParagonWallets;
    var host = element("wd-queue"); var grid = element("wd-stat-grid");
    if (!W || !host) return;
    var requests = W.allRequests();
    var open = requests.filter(function (r) { return ["LOCKED", "PAYOUT_PENDING", "PROVIDER_SUBMITTED", "PROVIDER_CONFIRMED", "UNKNOWN", "RECONCILIATION", "RETRYING"].indexOf(r.state) !== -1; });
    var paid = requests.filter(function (r) { return r.state === "PAID"; });
    var returned = requests.filter(function (r) { return r.state === "COINS_UNLOCKED"; });
    if (grid) grid.innerHTML =
      statCard("🟡", String(open.length), "Open withdrawals", open.reduce(function (s, r) { return s + (Number(r.lockedCoins) || 0); }, 0) + " coins locked") +
      statCard("✅", naira(paid.reduce(function (s, r) { return s + (Number(r.naira) || 0); }, 0)), "Paid out", paid.length + " paid · provider refs unique by law") +
      statCard("♻️", String(returned.length), "Coins returned", "Every failure refunds — never traps funds");
    var list = open.concat(requests.filter(function (r) { return r.state === "FAILED" || r.state === "COINS_UNLOCKED"; })).concat(paid);
    if (!requests.length) {
      host.innerHTML = '<div class="empty-state" style="padding:26px"><div class="empty-icon">💸</div><h3>No withdrawal requests yet</h3><p>When a member requests a withdrawal their coins lock and this queue fills. Real zero today.</p></div>';
      return;
    }
    var canRun = roleAllowed("Run Withdrawal Desk");
    host.innerHTML = list.map(function (w) {
      var badge = w.state === "PAID" ? '<span class="team-site-badge st-live">✅ PAID</span>' : w.state === "COINS_UNLOCKED" ? '<span class="team-site-badge st-archived">♻️ Coins returned</span>' : w.state === "FAILED" ? '<span class="team-site-badge st-archived">❌ FAILED</span>' : '<span class="team-site-badge st-scheduled">' + escapeHTML(w.state) + "</span>";
      return '<article class="team-site-row ' + (w.state === "PAID" ? "fin-paid-row" : "") + '">' +
        '<div class="team-site-copy">' +
          '<div class="team-site-title"><strong>' + naira(w.naira) + '</strong>' + badge + '<span class="team-site-cat">' + escapeHTML(w.correlationId || w.id) + "</span>" +
          (w.flags && w.flags.length ? '<span class="team-site-badge st-review">flags: ' + w.flags.join(", ") + "</span>" : "") + "</div>" +
          '<div class="team-site-sub">' + escapeHTML(w.displayName || w.user) + " · " + escapeHTML(w.user) + "</div>" +
          '<div class="team-site-sub">' + coins(w.lockedCoins) + " coins locked (incl. " + w.feeCoins + " fee) → pay " + naira(w.naira) + " to " + escapeHTML((w.payout && (w.payout.bank + " " + w.payout.accountNumber + " " + (w.payout.accountName || ""))) || "") + "</div>" +
          '<div class="team-site-sub">Requested ' + when(w.createdAt) + (w.failReason ? " · Reason: " + escapeHTML(w.failReason) : "") + (w.payoutRef ? " · Payout ref: " + escapeHTML(w.payoutRef) + (w.provider ? " via " + escapeHTML(w.provider) : "") : "") + "</div>" +
          '<details class="lb-details"><summary>Timeline (' + (w.timeline || []).length + ")</summary><ul class='lb-rules'>" + (w.timeline || []).map(function (t) { return "<li><b>" + escapeHTML(t.state) + "</b> — " + when(t.at) + " · " + escapeHTML(t.by || "") + (t.note ? " · " + escapeHTML(t.note) : "") + "</li>"; }).join("") + "</ul></details>" +
        "</div>" +
        '<div class="team-site-actions">' + (canRun ? wdActionButtons(W, w) : "") + "</div>" +
      "</article>";
    }).join("");
    if (!canRun) host.insertAdjacentHTML("beforeend", '<p class="team-site-sub">Your role (' + escapeHTML(activeRole()) + ') can view this desk; running payouts requires the Run Withdrawal Desk permission (super-admin/admin).</p>');
  }
  function bindWithdrawalDesk() {
    var host = element("wd-queue");
    if (!host) return;
    host.addEventListener("click", function (event) {
      var button = event.target.closest("[data-wdact]");
      if (!button) return;
      var W = window.ParagonWallets;
      if (!W) return;
      var id = button.dataset.id; var to = button.dataset.wdact;
      var row = W.findRequest(id); if (!row) return;
      var hasRef = !!(row.payoutRef);
      var needsRef = to === "PROVIDER_SUBMITTED" || (to === "PAID" && !hasRef);
      var options = {
        icon: "💸", title: WD_ACTION_LABELS[to], confirmLabel: WD_ACTION_LABELS[to],
        lines: ["Withdrawal " + row.correlationId + " (" + naira(row.naira) + " to " + escapeHTML((row.payout || {}).masked || "") + ")", "Move: " + row.state + " → " + to + "."]
      };
      if (to === "PROVIDER_SUBMITTED") {
        options.lines.push("Enter the provider payout reference — it becomes the single proof of payout and can never be reused (no double payouts).");
        options.field = { label: "Provider", type: "select", value: "bank", required: true, options: [{ value: "bank", label: "Bank transfer" }, { value: "opay", label: "OPay" }, { value: "paystack", label: "Paystack" }, { value: "flutterwave", label: "Flutterwave" }, { value: "manual", label: "Manual (recorded only)" }] };
      }
      if (needsRef) {
        options.requireReason = true;
        options.reasonLabel = to === "PROVIDER_SUBMITTED" ? "Provider payout reference (unique) *" : "Payout reference *";
      } else {
        options.requireReason = true;
        options.reasonLabel = "Note for the audit log *";
      }
      if (to === "FAILED") options.lines.push("The request then moves to COINS_UNLOCKED and its locked coins return to the user's balance.");
      window.ParagonTeamConfirm(options).then(function (result) {
        if (!result.ok) return;
        var meta = { reason: result.reason, provider: result.value || (row.provider || "") };
        if (needsRef) meta.payoutRef = result.reason;
        var verdict = W.deskTransition(id, activeRole() + " (role preview)", to, meta);
        if (!verdict.ok) { showToast("Blocked: " + (verdict.message || verdict.code)); return; }
        showToast(to + " — " + row.correlationId + " updated.");
        renderWithdrawalDesk();
      });
    });
  }

  /* ---------------- Risk & Fraud (finance-risk.html) ---------------- */
  function renderRisk() {
    var W = window.ParagonWallets;
    var host = element("risk-cases"); var stats = element("risk-stats");
    if (!W || !host) return;
    var cases = W.allCases();
    var open = cases.filter(function (c) { return c.state === "OPEN" || c.state === "REVIEW"; });
    if (stats) stats.innerHTML = statCard("🚩", String(open.length), "Open cases", "OPEN or REVIEW") + statCard("✅", String(cases.filter(function (c) { return c.state === "RESOLVED"; }).length), "Resolved", "resolved on this device") + statCard("🗄️", String(cases.filter(function (c) { return c.state === "CLOSED"; }).length), "Closed", "closed without action");
    if (!cases.length) {
      host.innerHTML = '<div class="empty-state" style="padding:26px"><div class="empty-icon">🚩</div><h3>No risk cases yet</h3><p>Cases are opened by the team or by engine signals (withdrawal bursts, large withdrawals, duplicate payment claims). Advisory only — never automatic guilt.</p></div>';
      return;
    }
    var canResolve = roleAllowed("Resolve Risk & Fraud Cases");
    host.innerHTML = cases.map(function (c) {
      return '<article class="team-site-row">' +
        '<div class="team-site-copy"><div class="team-site-title"><strong>' + escapeHTML(c.id) + "</strong>" +
        '<span class="team-site-badge ' + (c.state === "OPEN" ? "st-review" : c.state === "REVIEW" ? "st-scheduled" : c.state === "RESOLVED" ? "st-live" : "st-archived") + '">' + escapeHTML(c.state) + "</span>" +
        '<span class="team-site-cat">' + escapeHTML(c.type) + "</span></div>" +
        '<div class="team-site-sub">' + escapeHTML(c.displayName || c.user || "No user") + (c.user ? " · " + escapeHTML(c.user) : "") + "</div>" +
        (c.reason ? '<div class="team-site-sub">' + escapeHTML(c.reason) + "</div>" : "") +
        (c.linkedRefs && c.linkedRefs.length ? '<div class="team-site-sub">Linked: ' + c.linkedRefs.map(escapeHTML).join(", ") + "</div>" : "") +
        "</div>" +
        '<div class="team-site-actions">' + (canResolve && c.state === "OPEN" ? '<button type="button" class="team-mini-link" data-riskact="REVIEW" data-id="' + c.id + '">Start review</button>' : "") +
        (canResolve && c.state === "REVIEW" ? '<button type="button" class="team-mini-link" data-riskact="RESOLVED" data-id="' + c.id + '">Resolve</button>' : "") +
        (canResolve && (c.state === "OPEN" || c.state === "REVIEW") ? '<button type="button" class="team-mini-link danger" data-riskact="CLOSED" data-id="' + c.id + '">Close (no action)</button>' : "") +
        "</div></article>";
    }).join("");
  }
  function bindRisk() {
    var host = element("risk-cases"); var openBtn = element("risk-open-btn");
    if (!host) return;
    host.addEventListener("click", function (event) {
      var button = event.target.closest("[data-riskact]");
      if (!button) return;
      var W = window.ParagonWallets;
      if (!W) return;
      var id = button.dataset.id; var to = button.dataset.riskact;
      window.ParagonTeamConfirm({ icon: "🚩", title: "Case " + to, confirmLabel: "Case → " + to, requireReason: true, reasonLabel: "Note for the audit log *", lines: ["Case " + id, "State change: → " + to + ".", "Risk cases never freeze funds automatically — any freeze is a separate, explicit, audited decision."] }).then(function (result) {
        if (!result.ok) return;
        var verdict = W.riskCaseState(id, activeRole() + " (role preview)", to, { note: result.reason });
        if (!verdict.ok) { showToast("Not allowed: " + verdict.code); return; }
        showToast("Case " + id + " → " + to + ".");
        renderRisk();
      });
    });
    if (openBtn) openBtn.addEventListener("click", function () {
      var W = window.ParagonWallets;
      if (!W || !roleAllowed("Resolve Risk & Fraud Cases")) { showToast("🔐 Your role cannot open risk cases."); return; }
      var user = String(element("risk-user").value || "").trim();
      var type = element("risk-type").value;
      var reason = String(element("risk-reason").value || "").trim();
      if (!user || !reason) { showToast("Enter the account and what was observed."); return; }
      var verdict = W.openRiskCase({ user: user, displayName: user, type: type, reason: reason, actor: activeRole() + " (role preview)" });
      if (!verdict.ok) { showToast("Could not open: " + verdict.code); return; }
      element("risk-user").value = ""; element("risk-reason").value = "";
      showToast("Case " + verdict.case.id + " opened.");
      renderRisk();
    });
  }

  /* ---------------- Audit Log (finance-audit.html) ---------------- */
  function renderAudit() {
    var W = window.ParagonWallets;
    var search = element("audit-search");
    if (!W || !search) return;
    var term = (search.value || "").toLowerCase().trim();
    var rows = W.financeAudit().filter(function (row) {
      if (!term) return true;
      return String(row.action).toLowerCase().indexOf(term) !== -1 || String(row.actor).toLowerCase().indexOf(term) !== -1 || String(row.ref || "").toLowerCase().indexOf(term) !== -1 || String(row.detail || "").toLowerCase().indexOf(term) !== -1;
    });
    var host = element("audit-rows");
    if (!host) return;
    host.innerHTML = rows.length ? rows.slice(0, 200).map(function (row) {
      return '<div class="audit-list-item"><code>' + when(row.at) + '</code><div class="audit-what"><b>' + escapeHTML(row.action) + "</b> — " + escapeHTML(row.detail || "") + ' <small>· ' + escapeHTML(row.actor) + (row.ref ? " · " + escapeHTML(row.ref) : "") + "</small></div></div>";
    }).join("") : '<p class="team-site-sub">No finance audit rows yet — the log is append-only by design and fills with real actions (requests, claims, payouts, emergency controls).</p>';
  }
  function exportAudit() {
    var W = window.ParagonWallets;
    var term = (element("audit-search").value || "").toLowerCase().trim();
    var rows = W.financeAudit().filter(function (row) {
      if (!term) return true;
      return String(row.action).toLowerCase().indexOf(term) !== -1 || String(row.actor).toLowerCase().indexOf(term) !== -1 || String(row.detail || "").toLowerCase().indexOf(term) !== -1;
    });
    var csv = "\uFEFFat,actor,action,detail,ref\n" + rows.map(function (row) { return [row.at, row.actor, row.action, (row.detail || "").replace(/,/g, ";"), (row.ref || "").replace(/,/g, ";")].join(","); }).join("\n");
    downloadText("paragon-finance-audit.csv", csv);
  }

  /* ---------------- Financial Reports (finance-reports.html) ---------------- */
  function inRange(iso, mode) {
    if (mode === "all") return true;
    var days = mode === "7d" ? 7 : 30;
    return Date.now() - Date.parse(iso || 0) < days * 86400000;
  }
  function renderReports() {
    var W = window.ParagonWallets;
    var host = element("rep-report");
    var mode = element("rep-period") ? element("rep-period").value : "all";
    if (!W || !host) return;
    var requests = W.allRequests().filter(function (r) { return inRange(r.createdAt, mode); });
    var claims = W.allClaims().filter(function (c) { return inRange(c.createdAt, mode); });
    var ledgerRows = W.ledger().filter(function (l) { return inRange(l.at, mode); });
    var paidNaira = requests.filter(function (r) { return r.state === "PAID"; }).reduce(function (s, r) { return s + Number(r.naira || 0); }, 0);
    var failedNaira = requests.filter(function (r) { return r.state === "FAILED" || r.state === "COINS_UNLOCKED"; }).reduce(function (s, r) { return s + Number(r.naira || 0); }, 0);
    var pendingNaira = requests.filter(function (r) { return ["LOCKED", "PAYOUT_PENDING", "PROVIDER_SUBMITTED", "PROVIDER_CONFIRMED"].indexOf(r.state) !== -1; }).reduce(function (s, r) { return s + Number(r.naira || 0); }, 0);
    var feeCoins = requests.reduce(function (s, r) { return s + Number(r.feeCoins || 0); }, 0);
    var claimNaira = claims.filter(function (c) { return c.state === "CONFIRMED" || c.state === "PENDING_VERIFICATION"; }).reduce(function (s, c) { return s + Number(c.amountNaira || 0); }, 0);
    var credits = ledgerRows.filter(function (l) { return l.amount > 0; }).reduce(function (s, l) { return s + l.amount; }, 0);
    var debits = ledgerRows.filter(function (l) { return l.amount < 0; }).reduce(function (s, l) { return s + Math.abs(l.amount); }, 0);
    var byState = {};
    requests.forEach(function (r) { byState[r.state] = (byState[r.state] || 0) + 1; });
    host.innerHTML =
      '<section class="team-dash-section"><h2 class="team-dash-heading">WITHDRAWAL SUMMARY (' + escapeHTML(mode) + ")</h2>" +
      '<table class="rep-table"><tbody>' +
      "<tr><td>Requests</td><td><b>" + requests.length + "</b></td></tr>" +
      "<tr><td>Paid out (naira)</td><td><b>" + naira(paidNaira) + "</b></td></tr>" +
      "<tr><td>Pending (naira)</td><td><b>" + naira(pendingNaira) + "</b> — coins locked until resolved</td></tr>" +
      "<tr><td>Failed / returned (naira)</td><td><b>" + naira(failedNaira) + "</b></td></tr>" +
      "<tr><td>Withdrawal fees collected</td><td><b>" + coins(feeCoins) + " coins</b> — tracked separately, never profit (spec §22.1)</td></tr>" +
      "<tr><td>States</td><td>" + Object.keys(byState).map(function (s) { return escapeHTML(s) + ": " + byState[s]; }).join(" · ") + "</td></tr>" +
      "</tbody></table></section>" +
      '<section class="team-dash-section"><h2 class="team-dash-heading">PAYMENTS &amp; TYPED LEDGER (' + escapeHTML(mode) + ")</h2>" +
      '<table class="rep-table"><tbody>' +
      "<tr><td>Payment claims</td><td><b>" + claims.length + "</b> · " + naira(claimNaira) + " confirmed/pending</td></tr>" +
      "<tr><td>Ledger events</td><td><b>" + ledgerRows.length + "</b></td></tr>" +
      "<tr><td>Credits (coins)</td><td><b>" + coins(credits) + "</b></td></tr>" +
      "<tr><td>Debits (coins)</td><td><b>" + coins(debits) + "</b></td></tr>" +
      "<tr><td>Balance delta</td><td><b>" + coins(credits - debits) + "</b> coins — every withdrawal lock/fee/refund and approved credit is typed (§15–§16)</td></tr>" +
      "</tbody></table></section>" +
      '<section class="team-dash-section"><h2 class="team-dash-heading">LIABILITY &amp; RESERVE</h2>' +
      '<p class="team-site-sub">Device-layer liability = coins owed to users that are locked or pending payout: <b>' + coins(pendingNaira * (window.ParagonWallets ? window.ParagonWallets.effectiveConfig().nairaRate : 2)) + " coins ≈ " + naira(pendingNaira) + "</b>. Reserve-coverage ratios, escrow balances and payout-provider accounts are server-side metrics that arrive at backend activation (supabase/finance-schema.sql) — nothing is invented meanwhile.</p></section>";
  }
  function exportReports() {
    var W = window.ParagonWallets;
    var mode = element("rep-period") ? element("rep-period").value : "all";
    var requests = W.allRequests().filter(function (r) { return inRange(r.createdAt, mode); });
    var claims = W.allClaims().filter(function (c) { return inRange(c.createdAt, mode); });
    var lines = ["\uFEFFtype,id,user,naira,coins,feeCoins,state,ref,createdAt"];
    requests.forEach(function (r) { lines.push(["withdrawal", r.id, r.user, r.naira, r.coins, r.feeCoins, r.state, r.payoutRef || "", r.createdAt].join(",")); });
    claims.forEach(function (c) { lines.push(["claim", c.id, c.user, c.amountNaira, c.coins, 0, c.state, c.providerTxn, c.createdAt].join(",")); });
    downloadText("paragon-finance-report.csv", lines.join("\n"));
  }
  function downloadText(name, text) {
    try {
      var blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      window.setTimeout(function () { URL.revokeObjectURL(link.href); link.remove(); }, 400);
    } catch (error) { showToast("Export could not run in this browser."); }
  }

  /* ---------------- Emergency Controls (finance-emergency.html) ---------------- */
  function renderEmergency() {
    var W = window.ParagonWallets;
    if (!W) return;
    var pauseSection = element("em-pause-section");
    if (pauseSection) {
      var ctrl = W.controls();
      pauseSection.innerHTML = '<h2 class="team-dash-heading">⏸️ FINANCIAL PAUSE</h2>' +
        (ctrl.paused ? '<div class="fin-paused">PAUSE IS ACTIVE — new purchases, withdrawals and payout approvals are stopped' + (ctrl.pausedSince ? " since " + when(ctrl.pausedSince) : "") + " by " + escapeHTML(ctrl.pausedBy || "team") + (ctrl.pausedReason ? " · “" + escapeHTML(ctrl.pausedReason) + "”" : "") + '.</div>' : '<p class="team-site-sub">Pause is OFF — normal financial operations run (device layer).</p>') +
        '<div class="team-site-actions" style="margin-top:10px">' +
        (ctrl.paused
          ? '<button type="button" class="team-mini-link" id="em-pause-toggle" data-next="off">▶️ Resume financial operations</button>'
          : '<button type="button" class="team-mini-link danger" id="em-pause-toggle" data-next="on">⏸️ Pause financial operations</button>') +
        "</div>";
      var toggle = element("em-pause-toggle");
      if (toggle) toggle.addEventListener("click", function () {
        if (!roleAllowed("Use Emergency Financial Controls")) { showToast("🔐 Super Admin only."); return; }
        var nextOn = toggle.dataset.next === "on";
        window.ParagonTeamConfirm({
          icon: nextOn ? "⏸️" : "▶️", title: nextOn ? "Pause financial operations" : "Resume financial operations",
          confirmLabel: nextOn ? "⏸️ Pause now" : "▶️ Resume now", danger: nextOn,
          requireReason: true, reasonLabel: nextOn ? "Reason for the pause *" : "Reason for resuming *",
          lines: nextOn ? ["NEW purchases, withdrawals and payout approvals stop immediately; unlocks and reversals stay available.", "Free platform functionality (browse, play free games, community) keeps running.", "The public Archive shows an honest paused notice."] : ["Financial operations reopen for new requests."]
        }).then(function (result) {
          if (!result.ok) return;
          W.setFinancialPause(activeRole() + " (role preview)", nextOn, result.reason);
          showToast(nextOn ? "Financial pause is ON — public surfaces updated." : "Financial pause lifted.");
          renderEmergency();
        });
      });
    }
    var switchHost = element("em-switches");
    if (!switchHost) return;
    var games = window.ParagonGames && window.ParagonGames.KILL_SWITCHABLE ? window.ParagonGames.KILL_SWITCHABLE : ["quiz", "chess", "word", "memory"];
    var current = W.controls().killSwitches || {};
    switchHost.innerHTML = games.map(function (game) {
      var state = current[game] || {};
      var on = state.killed === true;
      return '<div class="kill-switch ' + (on ? "on" : "") + '">' +
        '<div><b>🎮 ' + escapeHTML(game) + (on ? " · KILLED" : "") + "</b>" +
        '<small>' + (on ? "Paid play stopped " + when(state.since) + " · " + escapeHTML(state.reason || "") : "Running normally — free play always stays free") + "</small></div>" +
        '<button type="button" class="team-mini-link ' + (on ? "" : "danger fin-toggle-on") + '" data-killswitch="' + escapeHTML(game) + '" data-next="' + (on ? "off" : "on") + '">' + (on ? "▶️ Restore paid play" : "🛑 Kill paid play") + "</button>" +
        "</div>";
    }).join("");
    switchHost.addEventListener("click", function (event) {
      var button = event.target.closest("[data-killswitch]");
      if (!button) return;
      if (!roleAllowed("Use Emergency Financial Controls")) { showToast("🔐 Super Admin only."); return; }
      var game = button.dataset.killswitch; var nextOn = button.dataset.next === "on";
      window.ParagonTeamConfirm({ icon: "🎮", title: nextOn ? "Kill " + game + " paid play" : "Restore " + game + " paid play", confirmLabel: nextOn ? "Kill now" : "Restore now", danger: nextOn, requireReason: true, reasonLabel: "Reason *", lines: ["Future paid game engines must consult ParagonWallets.gameKillState(\"" + game + "\") before accepting a stake/entry.", "Free play is never blocked by a kill switch."] }).then(function (result) {
        if (!result.ok) return;
        W.setGameKillSwitch(activeRole() + " (role preview)", game, nextOn, result.reason);
        showToast(game + (nextOn ? " kill switch ON." : " restored."));
        renderEmergency();
      });
    });
  }

  /* ---------------- Page bootstrap ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var page = paragonTeamPage();
    if (page === "finance.html") renderFinanceDashboard();
    if (page === "finance-payments.html") { buildPayFilter(); renderPayments(); bindPayments(); }
    if (page === "finance-withdrawals.html") { renderWithdrawalDesk(); bindWithdrawalDesk(); }
    if (page === "finance-risk.html") { renderRisk(); bindRisk(); }
    if (page === "finance-audit.html") {
      renderAudit();
      element("audit-search").addEventListener("input", renderAudit);
      element("audit-export").addEventListener("click", exportAudit);
    }
    if (page === "finance-reports.html") {
      renderReports();
      element("rep-period").addEventListener("change", renderReports);
      element("rep-export").addEventListener("click", exportReports);
    }
    if (page === "finance-emergency.html") renderEmergency();
    if (page === "finance-payments.html" || page === "finance-withdrawals.html") {
      window.setInterval(function () {
        if (page === "finance-payments.html") renderPayments();
        if (page === "finance-withdrawals.html") renderWithdrawalDesk();
      }, 8000);
    }
  });

  window.ParagonFinance = { renderDashboard: renderFinanceDashboard, renderPayments: renderPayments, renderWithdrawalDesk: renderWithdrawalDesk, renderRisk: renderRisk, renderAudit: renderAudit, renderReports: renderReports, renderEmergency: renderEmergency };
})();

}
