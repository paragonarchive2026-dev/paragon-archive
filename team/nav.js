/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: nav.js
  EXPECTED PROJECT PATH: /team/nav.js
  ROLE: Shared Paragon Team dashboard sidebar — collapsible desktop navigation injected into every dashboard page, active-state aware.
  RESTORE/LOAD NOTE: Include on every /team/ dashboard page (not login/setup). Future spec pages toast honestly until built.
*/

(function () {
  "use strict";

  var COLLAPSE_KEY = "paragonTeamNav.collapsed.v1";

  var SECTIONS = [
    { title: "", items: [ { icon: "📊", label: "Overview", href: "desk.html?page=overview" } ] },
    { title: "WEBSITES", items: [
      { icon: "🌐", label: "All Websites", href: "desk.html?page=websites" },
      { icon: "🏗️", label: "Construction Desk", href: "desk.html?page=construction" },
      { icon: "➕", label: "Add Website", href: "desk.html?page=add-website" },
      { icon: "🚀", label: "Deployed Reviews", href: "desk.html?page=deployed" },
      { icon: "📅", label: "Scheduled", href: "desk.html?page=websites&status=scheduled" },
      { icon: "🗂️", label: "Archived", href: "desk.html?page=websites&status=archived" }
    ] },
    { title: "PEOPLE", items: [
      { icon: "👥", label: "All Users", href: "desk.html?page=users" },
      { icon: "🚫", label: "Banned Users", href: "desk.html?page=users&status=banned" },
      { icon: "💼", label: "Dev Applications", href: "desk.html?page=applications" }
    ] },
    { title: "CONTENT", items: [
      { icon: "⭐", label: "Reviews & Reports", href: "desk.html?page=content-reviews" },
      { icon: "💬", label: "Community Posts", href: "desk.html?page=content-community" },
      { icon: "💡", label: "Suggestions", href: "desk.html?page=content-suggestions" }
    ] },
    { title: "TASKS", items: [
      { icon: "🎫", label: "Support Tickets", href: "desk.html?page=tickets" },
      { icon: "🐛", label: "Bug Reports", href: "desk.html?page=bugs" },
      { icon: "📬", label: "Website Requests", href: "desk.html?page=requests" }
    ] },
    { title: "PUBLISH", items: [
      { icon: "📢", label: "Announcements", href: "desk.html?page=announcements" },
      { icon: "📣", label: "Promotions", href: "desk.html?page=promotions" },
      { icon: "🗺️", label: "Roadmap", href: "desk.html?page=roadmap" }
    ] },
    { title: "ANALYTICS", items: [
      { icon: "📈", label: "Platform Stats", href: "desk.html?page=analytics" },
      { icon: "🌐", label: "Website Stats", href: "desk.html?page=analytics-websites" },
      { icon: "👤", label: "User Stats", href: "desk.html?page=analytics-users" }
    ] },
    { title: "TEAM", items: [
      { icon: "🧑‍💼", label: "Team Members", href: "desk.html?page=members" },
      { icon: "📋", label: "Activity Log", href: "desk.html?page=activity" },
      { icon: "🔑", label: "Permissions", href: "desk.html?page=permissions" }
    ] },
    { title: "SYSTEM", items: [
      { icon: "🗄️", label: "Archive", href: "desk.html?page=archive" },
      { icon: "⚙️", label: "Settings", href: "desk.html?page=settings" }
    ] },
    { title: "LAB", items: [
      { icon: "🧪", label: "Lab", href: "desk.html?page=lab", lab: true }
    ] }
  ];

  function currentPage() {
    /* P-097 — the consolidated desk: ?page=name is the real page identity. */
    var file = window.location.pathname.split("/").pop() || "overview.html";
    var query = window.location.search || "";
    if (file === "desk.html") {
      var page = new URLSearchParams(query).get("page") || "overview";
      return page.replace(/\.html$/, "") + ".html" + query.replace(/^\?page=[a-z0-9-]+(&|$)/, "?");
    }
    return file + query;
  }

  function pageIdentity(value) {
    /* P-097 — "desk.html?page=x&y" and "x.html?y" share one identity: "x.html?y". */
    var file = value, query = "";
    var q = value.indexOf("?");
    if (q !== -1) { file = value.slice(0, q); query = value.slice(q + 1); }
    var routed = /(?:^|&)page=([a-z0-9-]+)/.exec(query);
    if (file === "desk.html" && routed) {
      var extra = query.replace(/^page=[a-z0-9-]+&?/, "");
      return routed[1].replace(/\.html$/, "") + ".html" + (extra ? "?" + extra : "");
    }
    if (file === "desk.html") return "overview.html" + (query ? "?" + query : "");
    return file + (query ? "?" + query : "");
  }
  function isActive(href) {
    if (!href || href.indexOf("../") === 0) return false;
    var current = pageIdentity(currentPage());
    var target = pageIdentity(href);
    if (href.indexOf("?") !== -1 || current.indexOf("?") !== -1) return current === target;
    return current.split("?")[0] === target.split("?")[0];
  }

  function build() {
    var aside = document.createElement("aside");
    aside.id = "team-sidebar";
    aside.className = "team-sidebar";
    aside.setAttribute("aria-label", "Team dashboard navigation");
    var inner = '<div class="team-sidebar-head"><span class="team-sidebar-brand">◈ <b>PARAGON TEAM</b></span><button type="button" id="team-sidebar-toggle" aria-label="Collapse navigation">⟨</button></div><nav class="team-sidebar-nav">';
    SECTIONS.forEach(function (section) {
      if (section.title) inner += '<div class="team-sidebar-sectitle">' + section.title + '</div>';
      section.items.forEach(function (item) {
        if (item.href && item.lab) {
          /* P-067 — the Lab is a DIFFERENT kind of entry: a switch-styled link into the no-action preview mode. */
          inner += '<a class="team-sidebar-link lab-link' + (isActive(item.href) ? " active" : "") + '" href="' + item.href + '"><span aria-hidden="true">' + item.icon + '</span><b>' + item.label + '</b><i class="lab-mini-switch" aria-hidden="true"></i></a>';
        } else if (item.href) {
          inner += '<a class="team-sidebar-link' + (isActive(item.href) ? " active" : "") + '" href="' + item.href + '"><span aria-hidden="true">' + item.icon + '</span><b>' + item.label + '</b></a>';
        } else {
          inner += '<button type="button" class="team-sidebar-link future" data-navfuture="' + item.future + '"><span aria-hidden="true">' + item.icon + '</span><b>' + item.label + '</b><i title="Arrives with a future spec page">soon</i></button>';
        }
      });
    });
    inner += '</nav><div class="team-sidebar-foot">' +
      /* P-097 — the desk links straight to every public surface it manages */
      '<a class="team-sidebar-link" href="../paragon-archive.html#updates" title="The public feed this desk manages"><span aria-hidden="true">📰</span><b>Public Updates feed</b></a>' +
      '<a class="team-sidebar-link" href="../community-board.html" title="The board the content desks moderate"><span aria-hidden="true">💬</span><b>Community Board</b></a>' +
      '<a class="team-sidebar-link" href="../developer-portal.html" title="The portal applications/deployed desks serve"><span aria-hidden="true">🧑\u200d💻</span><b>Developer Portal</b></a>' +
      '<a class="team-sidebar-link" href="../paragon-archive-hub.html#roadmap" title="The public roadmap fed by this desk"><span aria-hidden="true">🗺️</span><b>Public Roadmap</b></a>' +
      '<a class="team-sidebar-link" href="desk.html?page=profile"><span aria-hidden="true">👤</span><b>My Profile</b></a>' +
      '<a class="team-sidebar-link" href="../paragon-archive.html"><span aria-hidden="true">←</span><b>Back to Archive</b></a>' +
      '<a class="team-sidebar-link" href="login.html"><span aria-hidden="true">🚪</span><b>Logout</b></a>' +
    '</div>';
    aside.innerHTML = inner;
    document.body.insertBefore(aside, document.body.firstChild);

    var burger = document.createElement("button");
    burger.id = "team-sidebar-burger";
    burger.className = "team-sidebar-burger";
    burger.setAttribute("aria-label", "Open navigation");
    burger.textContent = "☰";
    document.body.appendChild(burger);

    document.body.classList.add("team-has-sidebar");
    try { if (window.localStorage.getItem(COLLAPSE_KEY) === "true") document.body.classList.add("team-sidebar-collapsed"); } catch (error) { /* blocked */ }

    document.getElementById("team-sidebar-toggle").addEventListener("click", function () {
      var collapsed = document.body.classList.toggle("team-sidebar-collapsed");
      try { window.localStorage.setItem(COLLAPSE_KEY, String(collapsed)); } catch (error) { /* blocked */ }
    });
    burger.addEventListener("click", function () {
      document.body.classList.toggle("team-sidebar-open");
    });
    aside.addEventListener("click", function (event) {
      var future = event.target.closest("[data-navfuture]");
      if (future) {
        var toast = document.getElementById("dash-toast");
        if (toast) {
          toast.textContent = "🧭 " + future.dataset.navfuture + " — arrives with the next Team spec pages.";
          toast.hidden = false;
          window.setTimeout(function () { toast.hidden = true; }, 2600);
        }
      }
      if (event.target.closest("a")) document.body.classList.remove("team-sidebar-open");
    });
  }

  document.addEventListener("DOMContentLoaded", build);
  window.ParagonTeamNav = { SECTIONS: SECTIONS, isActive: isActive };
})();

/*
  P-062 — Shared confirmation modal system (spec modals for Ban / Delete / Remove).
  window.ParagonTeamConfirm({ icon, title, lines, requireReason, reasonLabel, confirmLabel, danger })
  → Promise resolving { ok, reason }.
*/
(function () {
  "use strict";
  window.ParagonTeamConfirm = function (options) {
    return new Promise(function (resolve) {
      var overlay = document.createElement("div");
      overlay.className = "modal-overlay team-modal-overlay";
      overlay.style.display = "flex";
      overlay.innerHTML =
        '<div class="modal team-site-modal team-confirm-modal" role="alertdialog" aria-modal="true">' +
          '<div class="modal-header"><h2>' + (options.icon || "⚠️") + " " + options.title + '</h2></div>' +
          '<div class="modal-body">' +
            (options.lines || []).map(function (line) {
              return line.indexOf("•") === 0
                ? '<p class="team-confirm-bullet">' + line + '</p>'
                : '<p class="team-confirm-line">' + line + '</p>';
            }).join("") +
            (options.field ? '<label class="team-confirm-reason"><span>' + options.field.label + (options.field.required ? " *" : "") + '</span>' + (options.field.type === "select" ? '<select id="team-confirm-field">' + (options.field.options || []).map(function (opt) { return '<option value="' + opt.value + '"' + (opt.value === options.field.value ? " selected" : "") + '>' + opt.label + '</option>'; }).join("") + '</select>' : '<input id="team-confirm-field" type="' + (options.field.type || "text") + '" value="' + (options.field.value || "") + '">') + '</label>' : "") +
            (options.requireReason ? '<label class="team-confirm-reason"><span>' + (options.reasonLabel || "Reason") + ' *</span><textarea id="team-confirm-reason-input" rows="2" maxlength="300"></textarea></label>' : "") +
            '<p id="team-confirm-error" class="portal-lockout" style="display:none;margin-top:10px;"></p>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="secondary-action" id="team-confirm-cancel">Cancel</button>' +
            '<button type="button" class="' + (options.danger ? "secondary-action deployed-reject team-confirm-danger" : "primary-action") + '" id="team-confirm-ok">' + (options.confirmLabel || "Confirm") + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      function close(result) { overlay.remove(); resolve(result); }
      overlay.querySelector("#team-confirm-cancel").addEventListener("click", function () { close({ ok: false }); });
      overlay.addEventListener("click", function (event) { if (event.target === overlay) close({ ok: false }); });
      overlay.querySelector("#team-confirm-ok").addEventListener("click", function () {
        var reason = "";
        if (options.requireReason) {
          reason = (overlay.querySelector("#team-confirm-reason-input").value || "").trim();
          if (!reason) {
            var error = overlay.querySelector("#team-confirm-error");
            error.textContent = "A written reason is required.";
            error.style.display = "block";
            return;
          }
        }
        var fieldValue = "";
        if (options.field) {
          var fieldNode = overlay.querySelector("#team-confirm-field");
          fieldValue = fieldNode ? fieldNode.value : "";
          if (options.field.required && !fieldValue) {
            var fieldError = overlay.querySelector("#team-confirm-error");
            fieldError.textContent = options.field.label + " is required.";
            fieldError.style.display = "block";
            return;
          }
        }
        close({ ok: true, reason: reason, value: fieldValue });
      });
      var reasonInput = overlay.querySelector("#team-confirm-reason-input");
      if (reasonInput) reasonInput.focus();
    });
  };
})();

/*
  P-064 — REAL rule enforcement on every dashboard page:
  1. Pages outside the current role's access law are blocked with a denial panel.
  2. Sidebar hides links the role cannot open.
  3. A role-preview selector (persisted) stands in for backend claims until activation.
*/
(function () {
  "use strict";

  function P() { return window.ParagonTeamPermissions || null; }

  function currentFile() {
    var file = window.location.pathname.split("/").pop() || "overview.html";
    if (file === "desk.html") {
      var page = new URLSearchParams(window.location.search || "").get("page") || "overview";
      return page.replace(/\.html$/, "") + ".html";
    }
    return file;
  }

  function enforce() {
    var perms = P();
    if (!perms || !perms.getRole) return;
    var role = perms.getRole();
    var file = currentFile();

    /* 1. Sidebar link filtering per the page law. */
    document.querySelectorAll("#team-sidebar a.team-sidebar-link[href]").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.indexOf("../") === 0 || href === "login.html") return;
      /* P-097 — desk routing: the real target is the ?page= value. */
      var routed = /(?:^|\?|&)page=([a-z0-9-]+)/.exec(href);
      var target = routed ? (routed[1].replace(/\.html$/, "") + ".html") : href.split("?")[0];
      if (perms.PAGE_ACCESS[target] && !perms.pageAllowed(target, role)) link.style.display = "none";
      else link.style.display = "";
    });

    /* 2. Role-preview selector in the sidebar foot. */
    var foot = document.querySelector(".team-sidebar-foot");
    if (foot && !document.getElementById("nav-role-select")) {
      var wrap = document.createElement("label");
      wrap.className = "nav-role-wrap";
      wrap.innerHTML = 'Role preview<select id="nav-role-select">' +
        perms.HIERARCHY.map(function (entry) {
          return '<option value="' + entry.key + '"' + (entry.key === role ? " selected" : "") + '>' + entry.label + '</option>';
        }).join("") + '</select>';
      foot.insertBefore(wrap, foot.firstChild);
      wrap.querySelector("select").addEventListener("change", function () {
        /* P-097 — switching here updates the dashboard select + every surface instantly (no reload). */
        perms.setRole(this.value);
      });
      /* P-097 — react to role changes made ANYWHERE (dashboard select, other widgets). */
      window.addEventListener("paragon:role-change", function (event) {
        var select = document.getElementById("nav-role-select");
        if (select && event.detail && select.value !== event.detail.role) select.value = event.detail.role;
        var chip = document.getElementById("team-dash-role-chip");
        if (chip && perms.roleLabel) chip.textContent = "👤 " + perms.roleLabel(event.detail.role);
        enforce();
      });
    }

    /* 3. Page-level denial. */
    if (!perms.pageAllowed(file, role)) {
      var shell = document.querySelector(".team-dash-shell");
      if (shell) {
        shell.innerHTML =
          '<div class="empty-state team-denied">' +
            '<div class="empty-icon">🔐</div>' +
            '<h3>Access denied for ' + perms.roleLabel(role) + '</h3>' +
            '<p>The permissions matrix does not grant the <strong>' + perms.roleLabel(role) + '</strong> role access to this page. Backend claims will enforce this same rule server-side at activation.</p>' +
            '<p><a href="desk.html?page=overview">← Back to Overview</a>' + (perms.pageAllowed("permissions.html", role) ? ' · <a href="desk.html?page=permissions">View the permissions matrix</a>' : "") + '</p>' +
          '</div>';
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Run after the sidebar builds (nav build is also a DOMContentLoaded listener registered earlier).
    window.setTimeout(enforce, 0);
  });
  window.ParagonTeamEnforce = enforce;
})();

/*
  PARAGON ARCHIVE — DIALOG LAW (P-096)
  window.ParagonTeamPrompt({ icon, title, fields: [{ name, label, value, placeholder }], confirmLabel })
  → Promise resolving { ok, values: { name: value } }. The dialog-law-compliant replacement
  for window.prompt across every team desk.
*/
(function () {
  "use strict";
  window.ParagonTeamPrompt = function (options) {
    return new Promise(function (resolve) {
      var fields = options.fields || [];
      var overlay = document.createElement("div");
      overlay.className = "modal-overlay team-modal-overlay";
      overlay.style.display = "flex";
      overlay.innerHTML =
        '<div class="modal team-site-modal team-confirm-modal" role="dialog" aria-modal="true">' +
          '<div class="modal-header"><h2>' + (options.icon || "✏️") + " " + options.title + '</h2></div>' +
          '<div class="modal-body">' +
            fields.map(function (field) {
              var isLong = field.long === true;
              return '<label class="team-confirm-reason"><span>' + field.label + (field.required ? " *" : "") + '</span>' +
                (isLong
                  ? '<textarea data-prompt-field="' + field.name + '" rows="3" maxlength="600" placeholder="' + (field.placeholder || "") + '">' + String(field.value || "").replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }) + '</textarea>'
                  : '<input data-prompt-field="' + field.name + '" type="text" maxlength="200" placeholder="' + (field.placeholder || "") + '" value="' + String(field.value || "").replace(/"/g, "&quot;").replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }) + '">') +
              '</label>';
            }).join("") +
            '<p id="team-prompt-error" class="portal-lockout" style="display:none;margin-top:10px;"></p>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="secondary-action" id="team-prompt-cancel">Cancel</button>' +
            '<button type="button" class="primary-action" id="team-prompt-ok">' + (options.confirmLabel || "Save") + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      function close(result) { overlay.remove(); resolve(result); }
      overlay.querySelector("#team-prompt-cancel").addEventListener("click", function () { close({ ok: false, values: null }); });
      overlay.addEventListener("click", function (event) { if (event.target === overlay) close({ ok: false, values: null }); });
      overlay.addEventListener("keydown", function (event) { if (event.key === "Escape") close({ ok: false, values: null }); });
      overlay.querySelector("#team-prompt-ok").addEventListener("click", function () {
        var values = {};
        var missing = false;
        overlay.querySelectorAll("[data-prompt-field]").forEach(function (input) {
          values[input.getAttribute("data-prompt-field")] = input.value;
          if (input.closest("label").querySelector("span").textContent.indexOf("*") !== -1 && !input.value.trim()) missing = true;
        });
        if (missing) {
          var error = overlay.querySelector("#team-prompt-error");
          error.textContent = "Please fill the required fields.";
          error.style.display = "block";
          return;
        }
        close({ ok: true, values: values });
      });
      var first = overlay.querySelector("[data-prompt-field]");
      if (first && typeof first.focus === "function") first.focus();
    });
  };
})();
