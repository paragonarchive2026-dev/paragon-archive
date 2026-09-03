<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: ADSENSE-SETUP.md
  EXPECTED PROJECT PATH: /docs/ADSENSE-SETUP.md
  ROLE: The complete, honest Google AdSense track for Paragon Archive (P-094 / D-179):
        what is already built, the exact owner steps, costs, and blockers.
  RESTORE-LOAD NOTE: Governance doc — keep with the other docs.
-->

# 💰 Google AdSense — Paragon Archive Revenue Track

**Good news first: AdSense is FREE.** Google charges nothing to apply or to run ads —
they PAY you a share of what advertisers pay. You never send Google money for this.
(The only money in the chain is the future $25 Play developer fee — and that plan is
now CANCELLED by the PWA-only decision, so Paragon has zero mandatory costs.)

## What is already BUILT (2026-08-24, P-094)
- ✅ `ads/adsense.js` — the ad controller. DORMANT until you set the approved publisher ID.
  It mounts Google's library only after approval and fills the three reserved placements:
  below the Websites grid, in the Updates feed, and under website details.
- ✅ Reserved-slot markup pattern (`[data-paragon-ad]` + `.paragon-ad-slot` styling) —
  honest "reserved" label, no fake ads ever (P-009).
- ✅ `ads.txt` template at the project root (fill the publisher ID after approval).
- ✅ Policy prerequisites already live: Privacy policy, Cookie policy + consent banner,
  Terms, About, contact/support path, original content (107 catalogue concepts + docs).
- ✅ Roadmap milestone added (Hub → Roadmap → PLANNED).

## Owner steps (in order) — ~30 minutes total
1. **Domain first (the real blocker).** Google will not approve a localhost preview.
   Buy/deploy a production HTTPS domain (even a cheap one) and host the project there.
   Everything else below waits on this.
2. **Create the AdSense account** — https://adsense.google.com → "Get started".
   Free. Use `paragon.archive.2026@gmail.com`. You must be 18+.
3. **Add the site** (your domain) and submit for **Review**. Google checks content,
   navigation, and policy pages — Paragon already complies; reviews take days to ~2 weeks.
4. **While waiting**: verify you can receive mail at the Gmail (Google sends a postcard/PIN
   only when payments start, not for approval).
5. **After approval**: copy the `ca-pub-…` publisher ID →
   - `ads/adsense.js` → `ADSENSE_PUBLISHER_ID`
   - `ads.txt` → replace `PUB-ID-PLACEHOLDER`
   - create the three display ad units in the dashboard and paste their slot IDs into
     `CONFIG.slots` (websitesList / updatesFeed / detailFooter).
6. **Tell the agent** — we bump the cache, the slots go live, done.

## Honest expectations (no fake optimism — P-009)
- Approval is NOT guaranteed; a brand-new domain sometimes needs a few weeks of real
  traffic/content first. If refused, Google says why; we fix and re-apply free.
- AdSense pays out only after **$100 accumulated**. At Nigerian traffic levels this takes
  months. Treat this as a slow long-term track, not quick money.
- Ads are labelled, never disguised as content, never inside popups, and the cookie
  consent banner already gives users a real choice (AdSense policy requires consent
  messages in many regions — the existing banner + "Accept All" flow covers it).

## Where the money goes
Configuration is yours alone (AdSense dashboard ↔ your bank/Wise/Payoneer). The site code
only carries the publisher ID — no secrets, no payment data in the repo.
