# P-113 Update Wave — plain-English change log (2026-09-05)

This records everything in the owner's big update wave, in simple language. It is a living
note for the team; the older SOP/EOP entries stay as history.

## Ask Paragon AI
- Greets and chats: "hi/hello/good morning", "how are you", "who/what are you", "when did
  these websites start" (answers **August 1, 2026** + the weekly dates Aug 1, 8, 15, 22, 29;
  Sep 5, 12…), "is it free/safe/legit", thanks and goodbye.
- Better **typo** understanding.
- A floating **🧠 Ask AI** button is now on every tab (archive-wide), not only inside a website.
- AI answers are wired into both the archive search and the per-website question box.

## Search (Google-style)
- Instant suggestions as you type (debounced), using the AI brain's typo-tolerant ranking.
- **Matched words are highlighted**; each suggestion shows category + why it matched.
- Full **arrow-key** navigation (Up/Down to move, Enter to open), with a "Did you mean" line
  on the results screen.
- Suggestions hide silently when there is no match (the "no results" message shows after Enter).

## Updates tab
- The unrequested per-website grouped layout was **reverted** to the earlier flat, newest-first
  timeline.

## Popups (applies to ALL popups)
- Close (×) buttons are on the **right**.
- Clicking **outside** a popup never closes it.
- The background **cannot scroll or be clicked** while a popup is open; only inside-popup
  content acts. The leaderboard popup keeps its bottom Close button (no × added).

## Leaderboards (REAL only)
- No made-up rivals or fake ranks (e.g. the old fake "21st"). Guests with no points are
  **unranked**; the list is empty until real users/activity exist; guests can still **view**
  the real synced list.
- Weekly coin prize distribution corrected to:
  **rank 1 = 30%, 2 = 20%, 3 = 15%, 4 = 10%, 5 = 9%, 6 = 6%, 7 = 4%, 8 = 3%, 9 = 2%, 10 = 1%**
  (sums to 100; the whole pool always pays out).
- Week picker is now a **calendar dropdown** of weekly dates starting **Aug 1, 2026**
  (Aug 1, 8, 15, 22, 29; Sep 5, 12…). Ended weeks stay visible but are **locked/unclickable**.

## Coins & money
- **Real Money is ON** (purchases + withdrawals via the OPay/Moniepoint + team-verification desk).
- Withdrawal fee corrected to **100 coins** for ₦10,000+ (₦50 worth × 2 coins per ₦1). Below
  ₦10,000 there is still **no** fee. The "6 digit" warning is now **10 digits**.
- Payout form: **Payout Rail is an OPay / Moniepoint dropdown**; account number is 10 numbers
  only; phone shows a fixed **+234** prefix with 10 digits; the summary updates **live as you
  type** (even under ₦1,000, showing the coin math with no fee); tapping the same amount chip
  does not toggle it off; the **Request withdrawal** button is faded but clickable and directs
  the user to complete KYC payout details first; withdrawals only go to the saved OPay/Moniepoint
  account.
- KYC payout details drive the **buy/pay** side: a user whose KYC says OPay sees **Paragon's
  OPay account**; Moniepoint users see **Paragon's Moniepoint account**. The account number shows
  an honest placeholder until the team connects the OPay/Moniepoint APIs. There is a live
  "₦ → coins" total as the user types, and fields to submit transfer evidence (reference,
  date/time, amount, sender name) for matching. Duplicate references are rejected; 5 claims /
  24 h.
- Competition ruleset enforced in the engine: guests free-only; points **only** from eligible
  **staked** competitions (free play/login/buying never score); min stake **100 coins**, max
  **10,000**, platform competition fee **5%**; draws/cancellations refund stakes; a creator can
  never win points or prize from their own quiz; rewards come from 30% of realized fee revenue
  (a real ₦0 pool stays ₦0).

## Account
- **Coin Shop box removed**; the grid is now **12 boxes**:
  Paragon Coin · Leaderboard · Achievements / Products in Progress · Recently Visited ·
  Reviews / Saved Websites · Collections · Playlist, then **Rewards Center · Daily Goals ·
  My Orders & Payments · Invite Friends**.
- All boxes are the **same height** with **centered** titles and descriptions.
- Account hero gained a **mirrored fading decorative shape** top-right (matching the back-left).
- Guest entry renamed to **Continue as Guest**, styled with the guest avatar.
- Each device gets **one unique guest ID** (device fingerprint + connection IP hint), stamped on
  the guest session and carried onto the account on sign-in (backend sync activates with Supabase).
- **Ad space** added at the bottom of the account side, below Settings.
- Achievements About panel now wires in the **real badge images** with updated write-ups; Daily
  Goals and XP track real activity (rewards are recognition, never cash).

## Websites (launch + architecture)
- Websites now open in a **FULL TAB — no iframes** — built sites and under-construction /
  maintenance ones alike (the launch progress ring is kept; construction/maintenance show a
  branded full-tab page).
- Each product under `/sites/` now owns its own **`css/style.css` and `js/site.js`** (the quiz
  pattern) instead of one shared kit; the per-site dark/light toggle is removed — the **Archive
  nav bar theme switch controls every site**, and the site top bars follow the quiz style.

## Popups & install
- The **Share app** button moved **inside the Install popup** beside Install (removed from
  Settings); the install close button is at the top.

## Routing / deployment
- Added **`vercel.json`** so the bare `.vercel.app` link serves the Archive (root rewrite to
  `paragon-archive.html`), with real 404/500 handling. This is why the link previously showed
  `404.html` — there was no entry page at the root.
- Offline page already shows automatically on network loss (service worker); maintenance is wired
  to the team maintenance switch.

## Tests
- All four suites green: `suite-core`, `suite-finance`, `suite-ux`, `suite-ai-team` (updated for
  the 100-coin fee, the 30/20/15/10/9/6/4/3/2/1 split, 100-coin min stake, the 12-box grid, the
  flat Updates feed, the per-site CSS/JS split, and real leaderboard empty states).
