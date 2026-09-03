/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: updates.js
  EXPECTED PROJECT PATH: /data/updates.js
  ROLE: Curated Announcement update events — REAL events only (P-092 truth purge: no maintenance or featured entries exist for unbuilt websites).
  RESTORE/LOAD NOTE: Restore under data/. Load after data/sites.js and before app.js.
*/
/* ============================================
   PARAGON ARCHIVE — CURATED UPDATE EVENTS
   Add future non-catalogue-generated update entries here.
   Every entry must describe something that REALLY happened.
   ============================================ */

(() => {
  // Protected production Team tooling may populate this allowlisted public feed later.
  // Guest rendering accepts only ad/promotion records and applies the 72-hour expiry.
  window.ParagonPublicNotifications = [];

  window.ParagonCuratedUpdates = [
    // P-094 / D-174 — the four REAL launch-window announcements moved out of this static list
    // into the managed Announcements system (Team desk team/announcements.html + local store
    // paragonTeamAnnouncements.v1 + optional live backend table paragon_announcements), so the
    // founder can edit, schedule, image-link and delete them from the Team side exactly as if
    // they had been composed there. Add future curated entries here ONLY if they must never be
    // editable from the Team desk; everything user-facing belongs to the managed system now.
  ];
})();
