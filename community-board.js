/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: community-board.js
  EXPECTED PROJECT PATH: /community-board.js
  ROLE: P-077 (A1–A4) controller — Community Board: membership gate, post/comment/like/report over the SHARED moderation store (paragonTeamCommunityPosts.v1 — the Team desk moderates the same records), boards filter, New/Top sort, mini member profiles, real-zero counters.
  RESTORE/LOAD NOTE: Load on /community-board.html. Hidden/removed posts (Team moderation) disappear from the public feed for real. pendingBackendSync until community backend activates.
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

  var STORE_KEY = "paragonTeamCommunityPosts.v1"; // ONE store — the Team desk moderates these exact records

  /* P-089 — LIVE BACKEND SYNC: when a real session exists, posts publish to and
     load from paragon_community_posts (probe-verified live). Local store stays the
     offline queue + the Team moderation working set. */
  var backendReady = false;
  async function backendFetch(path, options, token) {
    var config = window.ParagonConfig || {};
    if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
    var headers = Object.assign({ apikey: config.supabaseAnonKey, "Content-Type": "application/json" }, options.headers || {});
    if (token) headers.Authorization = "Bearer " + token;
    var response = await fetch(config.supabaseUrl + "/rest/v1/" + path, Object.assign({}, options, { headers: headers }));
    if (!response.ok) throw new Error("backend " + response.status);
    var text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  async function syncFromBackend() {
    try {
      var session = await window.ParagonAuth?.getSession?.();
      if (!session || !session.access_token) return;
      var rows = await backendFetch("paragon_community_posts?select=*&order=created_at.desc&limit=100", { method: "GET" }, session.access_token);
      if (!Array.isArray(rows)) return;
      var list = readStore();
      var known = {};
      list.forEach(function (post) { if (post.backendId) known[post.backendId] = true; });
      rows.forEach(function (row) {
        if (known[row.id]) return;
        list.push({ id: "post-b-" + row.id, backendId: row.id, board: row.board, author: row.author_name, title: row.title, body: row.body, postedAt: row.created_at, status: row.status, flags: row.flags || 0, likes: row.likes || 0, likedByMe: false, comments: [], liveSynced: true });
      });
      writeStore(list);
      backendReady = true;
      render();
    } catch (error) { /* backend unreachable — device store carries on honestly */ }
  }
  async function publishToBackend(post) {
    try {
      var session = await window.ParagonAuth?.getSession?.();
      if (!session || !session.access_token || !session.user) return false;
      var rows = await backendFetch("paragon_community_posts", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ author_id: session.user.id, author_name: post.author, board: post.board, title: post.title, body: post.body })
      }, session.access_token);
      if (Array.isArray(rows) && rows[0]) {
        var list = readStore();
        var mine = list.filter(function (entry) { return entry.id === post.id; })[0];
        if (mine) { mine.backendId = rows[0].id; mine.liveSynced = true; delete mine.pendingBackendSync; writeStore(list); }
        return true;
      }
    } catch (error) { /* stays queued locally */ }
    return false;
  }
  var BOARDS = ["General", "Show & Tell", "Help & Questions", "Ideas", "Off-topic"];
  var activeBoard = "all";
  var sortMode = "new";

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

  /* Membership: any real paragonCommunityMembership:{userId} record on this device */
  function membershipRecord() {
    try {
      for (var index = 0; index < window.localStorage.length; index += 1) {
        var key = window.localStorage.key(index) || "";
        if (key.indexOf("paragonCommunityMembership:") === 0) {
          var record = JSON.parse(window.localStorage.getItem(key) || "null");
          if (record) return record;
        }
      }
    } catch (error) { /* blocked */ }
    return null;
  }
  function memberName(record) {
    return (record && (record.displayName || record.username || record.name)) || "Community Member";
  }

  function visiblePosts(list) {
    return list.filter(function (post) { return post.status !== "hidden" && post.status !== "removed"; });
  }
  function applyView(list) {
    var out = visiblePosts(list);
    if (activeBoard !== "all") out = out.filter(function (post) { return post.board === activeBoard; });
    if (sortMode === "top") out.sort(function (a, b) { return (b.likes || 0) - (a.likes || 0) || Date.parse(b.postedAt) - Date.parse(a.postedAt); });
    else out.sort(function (a, b) { return Date.parse(b.postedAt) - Date.parse(a.postedAt); });
    return out;
  }

  function createPost(author, board, title, body) {
    return {
      id: "post-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      board: board, author: author, title: title, body: body,
      postedAt: new Date().toISOString(),
      status: "visible", flags: 0, likes: 0, likedByMe: false,
      comments: [], pendingBackendSync: true
    };
  }

  function render() {
    var container = document.getElementById("board-feed");
    if (!container) return;
    var member = membershipRecord();
    var note = document.getElementById("board-membership-note");
    if (note) note.hidden = true;
    document.getElementById("board-composer").hidden = !member;

    var chips = document.getElementById("board-chips");
    chips.innerHTML = ['all'].concat(BOARDS).map(function (board) {
      var label = board === "all" ? "All boards" : board;
      return '<button type="button" class="chip ' + (activeBoard === board ? "active" : "") + '" data-board="' + escapeHTML(board) + '">' + escapeHTML(label) + '</button>';
    }).join("");

    /* P-088 — appeals: the author still sees their own hidden/removed posts with an appeal control */
    var member = membershipRecord();
    var myName = member ? memberName(member) : null;
    var myModerated = myName ? readStore().filter(function (post) {
      return post.author === myName && (post.status === "hidden" || post.status === "removed");
    }) : [];
    var appealsArea = document.getElementById("board-appeals");
    if (appealsArea) appealsArea.innerHTML = myModerated.length ? "<h3 class=\"board-appeals-title\">🛡️ Your moderated posts</h3>" + myModerated.map(function (post) {
      var appeal = post.appeal || null;
      return '<div class="board-appeal-card" data-appeal-id="' + escapeHTML(post.id) + '">' +
        '<b>' + escapeHTML(post.title) + '</b><span class="team-status-chip st-archived">' + (post.status === "hidden" ? "🙈 Hidden by moderation" : "🗑️ Removed") + '</span>' +
        (post.moderation ? '<small>' + escapeHTML(post.moderation) + '</small>' : "") +
        (!appeal ? '<div class="board-appeal-compose"><input type="text" maxlength="240" placeholder="Why should this be restored?"><button type="button" class="secondary-action" data-appealact="send">Appeal</button></div>'
          : appeal.status === "open" ? '<small>⏳ Appeal submitted — awaiting the moderation desk.</small>'
          : appeal.status === "approved" ? '<small>✅ Appeal approved — the post is restored.</small>'
          : '<small>❌ Appeal denied' + (appeal.decision ? " — " + escapeHTML(appeal.decision) : "") + '</small>') +
      '</div>';
    }).join("") : "";

    var posts = applyView(readStore());
    document.getElementById("board-count").textContent = posts.length + (posts.length === 1 ? " post" : " posts") + " · every count starts at real zero";
    if (!posts.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><h3>No posts here yet</h3><p>' + (member ? "Be the first — the composer above is live and your post really lands on the moderation desk too." : "Nothing has been posted on this board yet. Join the community to write the first post.") + '</p></div>';
      return;
    }
    container.innerHTML = posts.map(function (post) {
      return '<article class="board-post" data-id="' + escapeHTML(post.id) + '">' +
        '<div class="board-post-head">' +
          '<button type="button" class="board-author" data-author="' + escapeHTML(post.author) + '">👤 ' + escapeHTML(post.author) + '</button>' +
          '<span class="board-tag">' + escapeHTML(post.board) + '</span>' +
          '<time>' + new Date(post.postedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) + '</time>' +
        '</div>' +
        '<h3>' + escapeHTML(post.title) + (post.liveSynced ? ' <span class="board-live-chip">🟢 live</span>' : post.pendingBackendSync ? ' <span class="board-live-chip board-queued-chip">📴 device</span>' : '') + '</h3>' +
        '<p>' + escapeHTML(post.body) + '</p>' +
        '<div class="board-post-actions">' +
          '<button type="button" class="board-act" data-act="like" ' + (membershipRecord() ? "" : "disabled") + '>👍 ' + (post.likes || 0) + '</button>' +
          '<button type="button" class="board-act" data-act="comments">💬 ' + (post.comments || []).length + '</button>' +
          '<button type="button" class="board-act" data-act="report" ' + (membershipRecord() ? "" : "disabled") + '>🚩 Report</button>' +
        '</div>' +
        '<div class="board-comments" hidden>' +
          '<div class="board-comment-list">' + (post.comments || []).map(function (comment) {
            return '<div class="board-comment"><b>' + escapeHTML(comment.author) + '</b><span>' + escapeHTML(comment.text) + '</span><time>' + new Date(comment.at).toLocaleDateString() + '</time></div>';
          }).join("") + '</div>' +
          (membershipRecord() ? '<div class="board-comment-compose"><input type="text" maxlength="240" placeholder="Write a comment…"><button type="button" class="secondary-action" data-act="comment-send">Send</button></div>' : '<p class="team-site-sub">Join the community to comment.</p>') +
        '</div>' +
      '</article>';
    }).join("");
  }

  function onAppealClick(event) {
    var button = event.target.closest("[data-appealact='send']");
    if (!button) return;
    var card = button.closest("[data-appeal-id]");
    var input = card.querySelector("input");
    var text = (input.value || "").trim();
    if (text.length < 5) return;
    var list = readStore();
    var post = list.filter(function (entry) { return entry.id === card.getAttribute("data-appeal-id"); })[0];
    if (!post) return;
    post.appeal = { text: text, at: new Date().toISOString(), status: "open", pendingBackendSync: true };
    writeStore(list);
    showToast("🛡️ Appeal submitted — it is on the real moderation desk now.");
    render();
  }

  function onFeedClick(event) {
    var authorBtn = event.target.closest("[data-author]");
    if (authorBtn) { openMemberPanel(authorBtn.getAttribute("data-author")); return; }
    var button = event.target.closest("[data-act]");
    if (!button) return;
    var article = button.closest("[data-id]");
    var id = article.getAttribute("data-id");
    var act = button.getAttribute("data-act");
    var list = readStore();
    var post = list.filter(function (entry) { return entry.id === id; })[0];
    if (!post) return;

    if (act === "comments") {
      var panel = article.querySelector(".board-comments");
      panel.hidden = !panel.hidden;
      return;
    }
    if (act === "like") {
      post.likedByMe = !post.likedByMe;
      post.likes = Math.max(0, (post.likes || 0) + (post.likedByMe ? 1 : -1));
      writeStore(list); render();
      return;
    }
    if (act === "comment-send") {
      var input = article.querySelector(".board-comment-compose input");
      var text = (input.value || "").trim();
      if (text.length < 2) return;
      post.comments = post.comments || [];
      post.comments.push({ id: "c-" + Date.now(), author: memberName(membershipRecord()), text: text, at: new Date().toISOString(), pendingBackendSync: true });
      writeStore(list); render();
      showToast("💬 Comment posted.");
      return;
    }
    if (act === "report") {
      post.flags = (post.flags || 0) + 1;
      if (post.status === "visible") post.status = "flagged";
      writeStore(list); render();
      showToast("🚩 Reported — this post is now flagged on the real moderation desk.");
    }
  }

  function openMemberPanel(author) {
    var posts = visiblePosts(readStore()).filter(function (post) { return post.author === author; });
    var member = membershipRecord();
    var isSelf = member && memberName(member) === author;
    var panel = document.getElementById("member-panel");
    document.getElementById("member-panel-body").innerHTML =
      '<img class="member-mini-avatar" src="assets/illustrations/default-avatar.png" alt="">' +
      '<h3>' + escapeHTML(author) + '</h3>' +
      '<p class="team-site-sub">' + (isSelf && member && member.joinedAt ? "Member since " + new Date(member.joinedAt).toLocaleDateString() : "Community member") + '</p>' +
      '<p class="team-site-sub">' + posts.length + ' visible ' + (posts.length === 1 ? "post" : "posts") + ' on this device</p>' +
      (posts.length ? '<ul class="member-mini-posts">' + posts.slice(0, 5).map(function (post) { return '<li>' + escapeHTML(post.title) + '</li>'; }).join("") + '</ul>' : "");
    panel.hidden = false;
  }

  function submitPost() {
    var member = membershipRecord();
    if (!member) return;
    var title = document.getElementById("post-title").value.trim();
    var body = document.getElementById("post-body").value.trim();
    var errorNode = document.getElementById("composer-error");
    if (title.length < 4 || body.length < 10) {
      errorNode.textContent = "A post needs a title (4+ characters) and a message (10+ characters).";
      errorNode.style.display = "block";
      return;
    }
    errorNode.style.display = "none";
    var list = readStore();
    var newPost = createPost(memberName(member), document.getElementById("post-board-select").value, title, body);
    list.push(newPost);
    writeStore(list);
    document.getElementById("post-title").value = "";
    document.getElementById("post-body").value = "";
    render();
    publishToBackend(newPost).then(function (synced) {
      showToast(synced ? "✅ Posted — LIVE on the community backend + the Team moderation desk." : "✅ Posted on this device — it publishes to the backend when you are signed in and online.");
      render();
    });
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function () {
      if (!document.getElementById("board-feed")) return;
      var select = document.getElementById("post-board-select");
      BOARDS.forEach(function (board) {
        var option = document.createElement("option");
        option.value = board; option.textContent = board;
        select.appendChild(option);
      });
      render();
      syncFromBackend(); // P-089 — pull live backend posts when signed in
      document.getElementById("board-feed").addEventListener("click", onFeedClick);
      document.getElementById("board-appeals")?.addEventListener("click", onAppealClick);
      document.getElementById("post-submit").addEventListener("click", submitPost);
      document.getElementById("board-chips").addEventListener("click", function (event) {
        var chip = event.target.closest("[data-board]");
        if (!chip) return;
        activeBoard = chip.getAttribute("data-board");
        render();
      });
      document.getElementById("board-sort").addEventListener("change", function () { sortMode = this.value; render(); });
      document.getElementById("member-panel-close").addEventListener("click", function () { document.getElementById("member-panel").hidden = true; });
    });
  }

  window.ParagonCommunityBoard = {
    STORE_KEY: STORE_KEY, BOARDS: BOARDS,
    readStore: readStore, writeStore: writeStore,
    createPost: createPost, visiblePosts: visiblePosts, applyView: applyView
  };
})();
