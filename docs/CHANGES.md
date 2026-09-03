<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: CHANGES.md
-->
# Changed — P-106 (2026-09-03)

## Added
- 20 achievements (31–50): Ad Curious → Ad Patron, Leaderboard Scout → Podium Push, Daily/Week streak, Coin/Product/Install/Community/Detail/Category/Updates, Archive Legend
- Badge art under `assets/achievement-badges/` for all 20 (50 total)
- Engagement leaderboard panel (`openEngagementLeaderboard`) — climb to Top 10 / podium
- Ad impression + intentional support-tap tracking via `ParagonArchiveAdsBridge` + `ads/adsense.js` (works on reserved slots until AdSense live)
- Day streak tracking for Daily Return / Week Streak

## Changed
- `app.js` BADGE_ART + `achievementTasks` (50), settings link to leaderboard, counter merges
- `style.css` leaderboard styles; cache **v83**
- IMAGE-REQUIREMENTS, EOP/SOP/NEXT-AGENT, file tree
