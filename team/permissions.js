/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: permissions.js
  EXPECTED PROJECT PATH: /team/permissions.js
  ROLE: THE authoritative Paragon Team permission matrix — the owner's final role hierarchy and complete permissions table as machine-readable law.
  RESTORE/LOAD NOTE: Load wherever role gating is needed and on /team/permissions.html. Backend claims enforce this exact matrix at activation.
*/

(function () {
  "use strict";

  /* Owner's FINAL ROLE HIERARCHY (P-063). Rank 1 = highest. */
  var HIERARCHY = [
    { rank: 1, key: "super-admin", label: "Super Admin", note: "You. Full control. Everything." },
    { rank: 2, key: "admin", label: "Admin", note: "Everything except removing Super Admin" },
    { rank: 3, key: "developer", label: "Developer", note: "Manage own websites, upload new ones" },
    { rank: 4, key: "moderator", label: "Moderator", note: "Reviews, reports, community content" },
    { rank: 5, key: "support", label: "Support", note: "Tickets, bug reports, website requests" },
    { rank: 6, key: "analyst", label: "Analyst", note: "View stats and analytics only" }
  ];

  /* Values: true | false | "own" | "limited" | "own-websites" | "own-level-below" */
  var Y = true, N = false;
  var PERMISSIONS = [
    { action: "View Overview Dashboard",            sa: Y, ad: Y, dev: Y, mod: Y, sup: Y, an: Y },
    { action: "View Platform Analytics",            sa: Y, ad: Y, dev: N, mod: N, sup: N, an: Y },
    { action: "View Website Stats",                 sa: Y, ad: Y, dev: "own", mod: N, sup: N, an: Y },
    { action: "Add New Website",                    sa: Y, ad: Y, dev: Y, mod: N, sup: N, an: N },
    { action: "Edit Any Website",                   sa: Y, ad: Y, dev: "own", mod: N, sup: N, an: N },
    { action: "Delete Website Permanently",         sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Archive Website",                    sa: Y, ad: Y, dev: "own", mod: N, sup: N, an: N },
    { action: "Approve Deployed Website",           sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Reject Deployed Website",            sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "View All Users",                     sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "View User Full Profile",             sa: Y, ad: Y, dev: N, mod: "limited", sup: "limited", an: N },
    { action: "Suspend User Temporarily",           sa: Y, ad: Y, dev: N, mod: Y, sup: N, an: N },
    { action: "Ban User Permanently",               sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Unban User",                         sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Delete User Account",                sa: Y, ad: N, dev: N, mod: N, sup: N, an: N },
    { action: "View Reviews",                       sa: Y, ad: Y, dev: N, mod: Y, sup: N, an: N },
    { action: "Delete Reviews",                     sa: Y, ad: Y, dev: N, mod: Y, sup: N, an: N },
    { action: "View Community Posts",               sa: Y, ad: Y, dev: N, mod: Y, sup: N, an: N },
    { action: "Delete Community Posts",             sa: Y, ad: Y, dev: N, mod: Y, sup: N, an: N },
    { action: "View Support Tickets",               sa: Y, ad: Y, dev: N, mod: N, sup: Y, an: N },
    { action: "Reply to Support Tickets",           sa: Y, ad: Y, dev: N, mod: N, sup: Y, an: N },
    { action: "Close Support Tickets",              sa: Y, ad: Y, dev: N, mod: N, sup: Y, an: N },
    { action: "View Bug Reports",                   sa: Y, ad: Y, dev: "own-websites", mod: N, sup: Y, an: N },
    { action: "Reply to Bug Reports",               sa: Y, ad: Y, dev: "own-websites", mod: N, sup: Y, an: N },
    { action: "View Website Requests",              sa: Y, ad: Y, dev: N, mod: N, sup: Y, an: N },
    { action: "Approve Website Requests",           sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Publish Announcements",              sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Edit Roadmap",                       sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "View Developer Applications",        sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Accept Developer Applications",      sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Manage Team Members",                sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "View Activity Log",                  sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "View Archived Data",                 sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Permanently Delete Archived Data",   sa: Y, ad: N, dev: N, mod: N, sup: N, an: N },
    { action: "View Own Profile",                   sa: Y, ad: Y, dev: Y, mod: Y, sup: Y, an: Y },
    { action: "Edit Own Profile",                   sa: Y, ad: Y, dev: Y, mod: Y, sup: Y, an: Y },
    { action: "View Team Member Profiles",          sa: Y, ad: Y, dev: "own-level-below", mod: "own-level-below", sup: "own-level-below", an: "own-level-below" },
    /* P-100 — Stage 7 financial permissions (§35/§55 fitted to the six fixed roles) */
    { action: "View Financial Dashboard",           sa: Y, ad: Y, dev: N, mod: N, sup: N, an: Y },
    { action: "View Payment Reconciliation",        sa: Y, ad: Y, dev: N, mod: N, sup: Y, an: N },
    { action: "Confirm Payment Claims",             sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Approve Coin Purchases",             sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "View Withdrawal Desk",               sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Run Withdrawal Desk",                sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "Approve Payouts",                    sa: Y, ad: Y, dev: N, mod: N, sup: N, an: N },
    { action: "View Risk & Fraud Cases",            sa: Y, ad: Y, dev: N, mod: N, sup: N, an: Y },
    { action: "Resolve Risk & Fraud Cases",         sa: Y, ad: N, dev: N, mod: N, sup: N, an: N },
    { action: "View Financial Audit Log",           sa: Y, ad: Y, dev: N, mod: N, sup: N, an: Y },
    { action: "Export Financial Reports",           sa: Y, ad: Y, dev: N, mod: N, sup: N, an: Y },
    { action: "Use Emergency Financial Controls",   sa: Y, ad: N, dev: N, mod: N, sup: N, an: N }
  ];

  var ROLE_COLUMN = { "super-admin": "sa", "admin": "ad", "developer": "dev", "moderator": "mod", "support": "sup", "analyst": "an" };

  function can(role, action) {
    var column = ROLE_COLUMN[role];
    if (!column) return false;
    var row = null;
    PERMISSIONS.forEach(function (entry) { if (entry.action === action) row = entry; });
    if (!row) return false;
    return row[column]; // true | false | qualifier string
  }

  function rankOf(role) {
    var found = null;
    HIERARCHY.forEach(function (entry) { if (entry.key === role) found = entry; });
    return found ? found.rank : 99;
  }

  /* Admin can do everything except: remove Super Admin, delete user accounts, permanently delete archived data (per the table). */
  function canManageMember(actorRole, targetRole) {
    if (actorRole === "super-admin") return targetRole !== "super-admin" || false; // even SA cannot remove SA (the owner)
    if (actorRole === "admin") return targetRole !== "super-admin";
    return false;
  }

  window.ParagonTeamPermissions = {
    HIERARCHY: HIERARCHY,
    PERMISSIONS: PERMISSIONS,
    ROLE_COLUMN: ROLE_COLUMN,
    can: can,
    rankOf: rankOf,
    canManageMember: canManageMember
  };
})();

/*
  P-064 — ENFORCEMENT layer: current-role state (backend claims replace it at activation),
  the page-access law from the owner's access table, and helpers every page uses to
  actually follow the rules.
*/
(function () {
  "use strict";
  var P = window.ParagonTeamPermissions;
  var ROLE_KEY = "paragonTeamRole.v1";
  var VALID = ["super-admin", "admin", "developer", "moderator", "support", "analyst"];

  P.getRole = function () {
    try {
      var stored = window.localStorage.getItem(ROLE_KEY);
      return VALID.indexOf(stored) !== -1 ? stored : "super-admin";
    } catch (error) { return "super-admin"; }
  };
  P.setRole = function (role) {
    if (VALID.indexOf(role) === -1) return;
    try { window.localStorage.setItem(ROLE_KEY, role); } catch (error) { /* blocked */ }
    /* P-097 — ONE role, EVERYWHERE: every role surface (sidebar, dashboard, topbar chip)
       listens for this broadcast, so switching from any side updates all sides instantly. */
    try { window.dispatchEvent(new CustomEvent("paragon:role-change", { detail: { role: role } })); } catch (error) { /* older engines */ }
  };

  /* Owner's access-summary table → page law (filename without query). */
  P.PAGE_ACCESS = {
    "login.html": VALID, "setup.html": VALID,
    "overview.html": VALID,
    "websites.html": ["super-admin", "admin", "developer"],
    "add-website.html": ["super-admin", "admin", "developer"],
    "deployed.html": ["super-admin", "admin"],
    "users.html": ["super-admin", "admin"],
    "user-profile.html": ["super-admin", "admin", "moderator", "support"],
    "tickets.html": ["super-admin", "admin", "support"],
    "ticket.html": ["super-admin", "admin", "support"],
    "bugs.html": ["super-admin", "admin", "developer", "support"],
    "requests.html": ["super-admin", "admin", "support"],
    "announcements.html": ["super-admin", "admin"],
    "promotions.html": ["super-admin", "admin"],
    "roadmap.html": ["super-admin", "admin"],
    "analytics.html": ["super-admin", "admin", "analyst"],
    "members.html": ["super-admin", "admin"],
    "member-profile.html": VALID, // own level & below — backend claims scope the data
    "activity.html": ["super-admin", "admin"],
    "archive.html": ["super-admin", "admin"],
    "permissions.html": ["super-admin", "admin"],
    "profile.html": VALID,
    /* P-067 — the final seven spec pages + the Lab */
    "applications.html": ["super-admin", "admin"],
    "content-reviews.html": ["super-admin", "admin", "moderator"],
    "content-community.html": ["super-admin", "admin", "moderator"],
    "content-suggestions.html": ["super-admin", "admin", "moderator"],
    "analytics-websites.html": ["super-admin", "admin", "developer", "analyst"],
    "analytics-users.html": ["super-admin", "admin", "analyst"],
    "settings.html": ["super-admin"],
    "lab.html": VALID,
    /* P-097 — consolidated shell + the new Construction Desk page */
    "desk.html": VALID,
    "construction.html": ["super-admin", "admin"],
    /* P-100 — Stage 7 finance law (spec §54–§61 fitted to the six fixed roles;
       no seventh role is introduced without updating the role law + fixtures) */
    "finance.html": ["super-admin", "admin", "analyst"],
    "finance-payments.html": ["super-admin", "admin", "support"],
    "finance-withdrawals.html": ["super-admin", "admin"],
    "finance-risk.html": ["super-admin", "admin", "analyst"],
    "finance-audit.html": ["super-admin", "admin", "analyst"],
    "finance-reports.html": ["super-admin", "admin", "analyst"],
    "finance-emergency.html": ["super-admin"]
  };

  P.pageAllowed = function (file, role) {
    var allowed = P.PAGE_ACCESS[file];
    if (!allowed) return true;
    return allowed.indexOf(role) !== -1;
  };

  P.roleLabel = function (role) {
    var label = role;
    P.HIERARCHY.forEach(function (entry) { if (entry.key === role) label = entry.label; });
    return label;
  };
})();
