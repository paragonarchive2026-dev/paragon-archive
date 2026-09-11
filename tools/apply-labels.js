/* One-shot dev script (kept for provenance): inserts aria-label on controls
   that had no label association. Run: node tools/apply-labels.js */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const MAP = {
  "community-board.html": { "post-title": "Post title", "post-body": "Post body" },
  "developer-portal.html": {
    "app-username": "Username", "app-email": "Email address", "app-portfolio": "Portfolio URL",
    "app-skills": "Skills", "app-exp": "Experience level", "app-pitch": "Your pitch",
    "sub-name": "Website name", "sub-icon": "Website icon", "sub-url": "Hosted URL",
    "sub-pricing": "Pricing model", "sub-desc": "Website description"
  },
  "paragon-archive-hub.html": {
    "hub-website-name": "Website name", "hub-creator-name": "Creator name",
    "hub-hosted-url": "Hosted URL", "hub-contact-email": "Contact email",
    "hub-subcategory": "Subcategory", "hub-description": "Website description",
    "hub-premium-details": "Premium details", "community-display-name": "Display name",
    "community-bio": "Bio", "team-login-email": "Team email", "team-login-password": "Team password"
  },
  "paragon-quiz/explore.html": {
    "searchInput": "Search flashcards", "categoryFilter": "Filter by category",
    "difficultyFilter": "Filter by difficulty", "sortFilter": "Sort flashcards"
  },
  "team/desk.html": {
    "aw-name": "Website name", "aw-short": "Short pitch", "aw-path": "Path or hosted URL",
    "aw-version": "Version", "aw-tag-input": "Add a tag", "aw-category": "Category",
    "aw-subcategory": "Subcategory", "aw-difficulty": "Difficulty", "aw-full": "Full description",
    "aw-whatsnew": "What is new", "ann-title": "Announcement title", "ann-link": "Announcement link",
    "ann-message": "Announcement message", "invite-name": "Invitee full name",
    "invite-email": "Invitee email", "invite-role": "Invite role", "edit-name": "Your name",
    "edit-email": "Your email", "edit-pw-current": "Current password", "edit-pw-new": "New password",
    "edit-pw-confirm": "Confirm new password", "promo-sponsor": "Sponsor name",
    "promo-title": "Promotion title", "promo-type": "Promotion type", "promo-audience": "Audience",
    "promo-body": "Promotion body", "rm-title": "Milestone name", "rm-detail": "Milestone detail",
    "rm-percent": "Percent complete", "rm-group": "Roadmap group", "set-idle": "Idle timeout in minutes",
    "set-warn": "Warning timeout in minutes", "setup-email": "Owner email",
    "setup-initial": "Initial password", "setup-password": "New password", "setup-confirm": "Confirm password",
    "modal-site-name": "Website name", "modal-site-icon": "Website icon", "modal-site-version": "Version",
    "modal-site-category": "Category", "modal-site-desc": "Description", "con-progress": "Progress percent",
    "con-note": "Progress note", "ticket-assignee": "Assignee", "ticket-priority": "Priority",
    "ticket-status": "Status", "ticket-reply": "Reply to member", "ticket-internal": "Internal note",
    "suspend-duration": "Suspension duration", "suspend-reason": "Suspension reason",
    "risk-user": "Affected user", "risk-type": "Risk type", "risk-reason": "Risk reason",
    "rep-period": "Report period", "perm-highlight": "Permission highlight"
  },
  "team/login.html": { "portal-email": "Email address", "portal-password": "Password" }
};

let changed = 0;
for (const [file, ids] of Object.entries(MAP)) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, "utf8");
  html = html.replace(/<(input|select|textarea)\b[^>]*>/g, (tag) => {
    const idm = tag.match(/\bid="([^"]+)"/);
    if (!idm || !ids[idm[1]] || /aria-label=/.test(tag)) return tag;
    changed++;
    return tag.replace(`id="${idm[1]}"`, `id="${idm[1]}" aria-label="${ids[idm[1]]}"`);
  });
  fs.writeFileSync(p, html);
}
console.log("aria-labels inserted:", changed);
