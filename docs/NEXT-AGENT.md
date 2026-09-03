<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: NEXT-AGENT.md
  EXPECTED PROJECT PATH: /docs/NEXT-AGENT.md
  ROLE: Complete handoff brief for the NEXT build agent — read this FIRST if the owner starts a fresh chat. Kept current every turn per owner rule (P-071).
  RESTORE/LOAD NOTE: Governance document. Update the "WHERE WE STOPPED" section at the end of every working turn.
-->

# 🤝 NEXT-AGENT HANDOFF BRIEF — READ THIS FIRST

**Last updated:** 2026-08-25 (EOP v0.90.0, prompts P-095/P-096)
**You are:** the owner's dedicated build agent for **Paragon Archive**, a large multi-product front-end platform.

## 1. WHO THE OWNER IS & HOW TO WORK WITH THEM

- Owner is in **Abuja, Nigeria** (Africa/Lagos). Types fast with heavy typos/informal English — **decode intent charitably**, never mock or over-question obvious meaning. Emoji-rich enthusiastic replies appreciated.
- Owner supplies specs/layouts incrementally; you implement them EXACTLY, and design yourself when told "build it on your own".
- When ambiguous on something important → ask (rule P-005). Otherwise just build.

## 2. THE LAW — READ THESE FILES BEFORE ANY ACTION

1. `docs/SOP.md` — the whole rulebook: workflow §6, decision register §10 (D-001…D-155), prompt log §11 (P-001…P-071), constraints §12, **Pending Content (CTA) §13**.
2. `docs/EOP.md` — append-only execution log, semantic versions (currently **v0.92.0**). EVERY delivery appends an entry.
3. `docs/AI-BRAIN.md` — Paragon AI knowledge base (107 catalogue records).
4. `docs/IMAGE-REQUIREMENTS.md` — the owner's complete image bibles (Sections 1–3) with per-item status. NEVER lose the owner's specs.

## 3. NON-NEGOTIABLE STANDING RULES

- **P-009 HONESTY:** no fake data/stats/claims EVER. Counters start at real zero; anything not real is labelled "illustrative example" or "backend pending". No "ALL SYSTEMS OPERATIONAL" claims (test-enforced). **No fake screenshots of unbuilt websites (D-153).**
- **P-001 preserve-first:** never destroy owner-approved work; extend it.
- **P-014:** every new HTML/CSS/JS/SQL file starts with the `PARAGON ARCHIVE — EXPORT IDENTITY` comment header (REAL FILE NAME / EXPECTED PROJECT PATH / ROLE / RESTORE-LOAD NOTE).
- **P-015:** responsive at all resolutions.
- **P-016:** ANY cached-shell change (app.js, style.css, root HTMLs, data/, icons) ⇒ bump `CACHE_NAME` in `service-worker.js` (currently **paragon-archive-v76**) AND the assertion in `tests/archive-hub.test.js`.
- **NO `window.alert/prompt/confirm` anywhere** — use inline panels or `ParagonTeamConfirm` (in `team/nav.js`).
- **Canonical entry = `paragon-archive.html`. NEVER create a root index.html.**
- Progress % must be milestone-derived (D-116) or labelled "team-set".
- Dates: today is Aug 2026; never claim pre-Aug-2026 history or completed 2027 milestones.
- **Owner rules from P-071:** keep TOTAL project < **100 MB** (optimize every generated image: spot illustrations = 640px quantized PNG, wide headers/OG = JPG ~82–85; currently 3.6 MB total ✅). **Regenerate `/home/user/paragon-file-tree.html` whenever structure changes.** Keep THIS handoff current every turn.

## 4. WORKFLOW EVERY TURN (SOP §6)

1. Read SOP rules; log the owner prompt as the next P-0XX in SOP §11 (+ new decisions as D-1XX in §10).
2. Build. Wire everything for real — the owner previews in a browser and exports the code.
3. Run ALL fixtures from `/home/user/paragon-archive/`: `for t in tests/*.test.js; do node $t; done` → 3/3 consolidated suites must stay green. Write a new fixture for substantial new systems.
4. Append EOP entry (next version), update SOP §13 CTA, refresh file tree + this brief.
5. End EVERY delivery with a **Pending Content reminder** (P-007).
6. Preview server dies between turns: `python3 -m http.server 8000 --bind 0.0.0.0 --directory /home/user/paragon-archive` (start_process, name "Paragon Archive").

## 5. WHAT EXISTS (high level)

- **Archive SPA** `paragon-archive.html` + `app.js` (~190KB) + shared `style.css` (single sheet, P-0XX sections appended at the end). 107-site catalogue in `data/` (only real destinations: Archive Hub + Paragon Quiz; Originals = exactly {Hub, Templates} — governance fixture enforces).
- **Archive Hub** `paragon-archive-hub.html` + `archive-hub.js` — Home/Documentation/Community/Team + #roadmap-full; integrated About/Privacy/Help/Request pages (now with header illustrations).
- **Paragon Quiz** `paragon-quiz/` — first real product, v1 live, play v2 owner design, real icon wired in headers.
- **Team dashboard** `team/` — 24 real pages + LAB (no-action preview workbench, v1; owner will explain full concept later). Permissions matrix ENFORCED (`team/permissions.js` = law; 6 roles; Settings = Super Admin only). Role preview select in sidebar foot.
- **Supabase LIVE** creds in `config/supabase.js` (role=anon verified). **Schema NOT yet run — owner must run `supabase/schema.sql` in the SQL Editor. THE next activation step.** Email provider ON, Google OFF.
- **Paragon AI** `ai/paragon-archive-ai.js` — local ranking engine (bigram+fuzzy, `ensure:3` closest-match).
- **Brand (owner-chosen, D-154):** faceted **◈ diamond** = official mark. `assets/brand/` (logo-mark, logo-full, og-default.jpg, splash, pwa-icon, favicons); favicons+OG wired on root pages; PWA icons regenerated.
- **Art wired so far:** 6 empty states, guest-welcome (Account signed-out), achievement-locked tile, cookie banner icon, 4 hub page headers (About/Privacy/Help/Request), success-submit (request form), Quiz site icon (5 pages).
- Tests: `tests/*.test.js` — 14 fixtures, date-independent by design.

## 6. IMAGE PRODUCTION STATE (P-068/069/070/071)

- Owner cadence: **10 generations per turn** (platform hard cap; owner said 5 for the last two turns, 10 onward).
- Done: brand suite ✅, 11 platform illustrations produced & wired, site icons 2/100 (Quiz ✅, Hub = logo mark ✅).
- **Queue (in order):** remaining Section 3 items — welcome-hero (#1), vision (#2 done as header-about), free-for-everyone (#3), founder bg (#4, needs owner photo), timeline (#8), 404/500/offline/maintenance art **+ build those actual pages**, bug-report (#19), achievements-locked-variants; then 10 category icons; then 30 achievement badges; then 98 site icons per the exact specs in IMAGE-REQUIREMENTS §2. Unlock animation (#24) = CSS. Doc screenshots (#25) = real captures (CTA).
- **ALWAYS optimize after generating** (PIL: quantize PNG 640px / JPG for wide art) and update tracker statuses.

## 7. WHERE WE STOPPED (update every turn!)

- Last turn (P-093, EOP v0.88.0): 15-banner cinematic set COMPLETE (all categories + default) — shared heroBannerFor() drives WotD + every Detail header. AI final shape (D-173): non-exact → owner's ai-suggest-block ONLY (docs-trained, genuine matches, floors conf≥0.25/sim≥0.45, minScore 40). WotD views live-sync (refreshHeroViews on closeDetail). Staff badge right-flush. Sign-in → Account tab. Account hero fully veiled over guest art. Hub: single Home tab (deep links intact), centered page-wide search (hidden-enforced dropdown, 11 keyword entries), chips 3×. Board/community spacing. Suites 3/3. Cache v71. ~6 MB, ~225 files.
- **Remaining images:** site icons #71–100 (30) + 30 achievement badges = 60 generations = 6 turns at the 10-cap.
- **OWNER PENDING:** Brevo (probe 500) · domain + $25 Play (TWA) · founder photo · Lab explanation.

## 7. WHERE WE STOPPED — after P-094 / EOP v0.89.0 (2026-08-24)

**Shipped this turn:** managed Announcements system (Team desk = source of truth: real image upload all types, special-only LINK pill, Preview/Draft/Schedule-auto-publish/Publish Now, edit/delete; public feed shows image-instead-of-icon with full-size viewer + download; `supabase/announcements-schema.sql` READY FOR OWNER TO RUN ONCE); ONE search AI (padded second block deleted); OPEN gated to guest-or-login with views counted ONLY on completed opens; editable saved display name on logged-in profiles; splash v4 (preload-first + veil + in-ring %; replays on every login); hub Home tab removed + legal-style Back + fuzzy typo-tolerant search + join quick-card fix; footer routes detail-first with `then=` destinations; PWA-ONLY app decision (TWA kit replaced by native/PWA-APP-MODE.md, notifications + share rows in Account); AdSense track open (dormant ads/adsense.js + ads.txt + docs/ADSENSE-SETUP.md + roadmap); Site Build Kit (docs/SITE-BUILD-KIT.md + site-specs template) ready for owner skill drops; construction % merged into one capsule pill; site icons #70–79 done + wired (80/100); quiz logos link to their detail. Tests 3/3 (new P-094 fixture). Cache v72.

**Brevo:** Supabase SMTP side CONFIRMED correct; live probe still HTTP 500 — Brevo account-side hold. Exact contact steps + ticket text: `docs/BREVO-CONTACT.md`. Retest only on owner's word (`+smtptest4`).

**Next turn candidates (in owner priority order):**
1. Team HTML consolidation (28 files into one shell + hash/query routing + rewritten `paragonTeamPage()` guards) — needs its OWN turn with full regression; owner approved "if possible, no lost function".
2. Run `supabase/announcements-schema.sql` for the owner if they ask; then sign in on the team desk → ☁️ live-backend mode flips on.
3. Site icons #80–89 (Habits → Countdown), then #90–100, then 30 achievement badges.
4. Owner drops Google-consent steps result + skill material for websites → write specs via template.
5. If Brevo lifts the hold → retest probe immediately.

**Standing gotchas (unchanged + new):** never two AI blocks in search; views ONLY on launch completion; announcement link fields are special-only; splash must preload before appearing; footer hub destinations MUST go through the detail (fixtures enforce); no textual arrows in paragon-archive.html/app.js; no window.alert/prompt/confirm; P-014 identity headers on every new file; cache bump + suite-green every turn.

## 7b. WHERE WE STOPPED — after P-096 / EOP v0.90.0 (2026-08-25)

**The killer bugs fixed this turn:** hub pages module died silently on a stale `hub-top-nav` guard (see-all/join/stats/search were all dead — guard now checks `hub-page-home`); hub Back cross-scope crash fixed via `window.paragonHubCurrentView`; splash fires FIRST at DOMContentLoaded, holds 5 s unconditionally (reduced-motion only snaps the ring), ring back top-right, preload gate gone. ALWAYS run `node tools/browser-smoke.js` (needs jsdom + the preview server) after touching boot paths.

**Shipped:** intent-trained search AI (INTENT_ROUTES boost/never/neverAlways — 30 tests in the fixture); Team A-to-Z feed manager (paragonTeamUpdateOverrides.v1 — wording edits + hide/restore, ids mirror app.js `new-|updated-|team-`); Team construction desk (paragonTeamConstruction.v1 — build %, note, retire; public page obeys); Team milestone checklists (paragonTeamRoadmapMilestones.v1 → hub renders them); construction PILL REVERTED to original bar+% layout (owner order); SW push handlers + connectPhonePush (VAPID key placeholder in config — honest until domain); footer auto-continue banner; guest hero v2; icon chips on trending/staff/recent; **site icons 100/100 DONE**; quiz standalone export at exports/paragon-quiz-standalone/.

**Next turn (owner's stated plan):** owner uploads website-skill/API plans → write specs via docs/site-specs template + produce the PASTE-READY builder prompt for per-website build agents (one shared style kit per category; vanilla HTML/CSS/JS; Paragon bar linking back to the Archive). Owner will order the quiz deletion (export package is ready). Then 30 achievement badges (10/turn).

**Brevo:** still blocked account-side (HTTP 500, smtptest3). Contact steps + paste-ready ticket in docs/BREVO-CONTACT.md; retest with +smtptest4 on the owner's word.

**Standing gotchas (new):** never reintroduce a guard on removed DOM (the hub killer); hub view state is shared via window.paragonHubCurrentView ONLY; splash = instant + unconditional 5 s + top-right ring (fixtures enforce); construction layout = original bar + percent line (no pill); feed/construction/milestone stores are TEAM-authoritative; photo-edit vs image-generation intents must never cross (neverAlways).

## 7c. WHERE WE STOPPED — after P-097 / EOP v0.91.0 (2026-08-26)

**THE NEW SHAPE:** team/ is now desk.html (30 routed panels, ?page=) + login.html + 4 JS files — paragonTeamPage() normalizes ?page= to "<name>.html" so module guards work unchanged. Project: 244 files (69 code). Websites are BUILT HERE now (owner reversed the separate-agent plan; quiz take-away export cancelled and deleted). Maintenance: settings maintenanceMode = instant platform-wide lockdown (all 5 surfaces guarded); per-site "Under Review" = real maintenance for users. Previews are WM windows (previewWindows stack; new=maximized, previous=PIP, taskbar, remembered maximize). Install popup = openParagonInstall() with permission toggles + Install; Share shares ?install=1. Theme auto-follows the clock (06:00–18:00 light) unless mode=manual. Review counts everywhere = realReviewCount/mirror (never site.reviews). Profile editor = popup from header Edit button. Badges 10/30 wired via BADGE_ART.

**Next turn candidates:** owner uploads website skills/API plans → specs + paste-ready builder prompt, now for IN-PROJECT builds (sites/<name>/ folders, one style kit per category); next 20 achievement badges (10/turn); server-push notification backlog (8 AM hello etc.) waits on the production domain; optional further file cuts (data-file merge) if the owner insists on ≤200 total.

**Standing gotchas (new):** never navigate to team/<page>.html — only desk.html?page=; role changes must go through ParagonPermissions.setRole (it broadcasts); maintenance lockdown guards run BEFORE anything else on every public page; preview stack state lives in previewWindows; review displays must use realReviewCount; textual-arrow law still enforced in app.js.

## 7d. WHERE WE STOPPED — after P-098 / EOP v0.92.0 (2026-08-26)

**Shipped:** team View-links repaired to desk routes; A1–B5 verified complete; 9 site-specs in docs/site-specs/ (free vanilla adaptation of the owner's full-stack skills); Paragon Coins core (account stat + shop popup + paragonTeamCoinRequests.v1 + super-admin approval in the settings panel + paragonArchive.coinCredits.v1 mirror + syncApprovedCoinCredits); maximize = true fullscreen (Fullscreen API + edge-to-edge CSS); ROUTE_KEYWORDS search layer; RxLife + Pharmapaedia honest Deployed entries (+AI Brain rows); docs/DEPLOYMENT-GUIDE.md + docs/COIN-SYSTEM.md + docs/CHANGES.md (rewrite CHANGES.md every turn!); badges 11–20 (20/30).

**NEXT TURN (owner's plan):** BUILD the first websites from the specs under /sites/<slug>/ (quiz layout family: topbar/header/footer, dark tokens, unclickable home-page example section, >3 tabs allowed, logo -> Archive detail, siteUrl wiring + buildProgress via the Construction Desk when live). Owner will send more skills/API plans (spec-first). Then badges 21–30, then games+quiz coin/leaderboard integration as those products build.

**Standing gotchas (new):** CHANGES.md must be rewritten at the end of EVERY turn; catalogue additions need the preview-route normalization + AI-BRAIN row (fixtures enforce); keyword boosts must show honest "You searched:" reasons; coin flows never create coins without a team approval record.


## 7e. WHERE WE STOPPED — after P-099 / EOP v0.93.0 (2026-09-03)

**Shipped — STAGE 5 LEADERBOARDS (complete, real-zero honest, regression-locked):**
- `paragon-leaderboards.js` — shared engine (window.ParagonLeaderboards) loaded by the Archive AND team/desk.html BEFORE their main scripts: Monday-start weekly periods; eligible BET results only (guest/free/login/purchase never earn; creator never earns from own quiz; duplicates/impossible scores rejected; closed weeks immutable; results are performance-points — stake size never multiplies, 1 coin ≠ 1 point); realized-fee ledger funds the pool at exactly 30%; prize table = spec distribution 30/20/15/10/7/5/4/3/2/4 with remainder to #1 (whole pool paid); §12.1 settlement machine running → closed/frozen → review → final → prizes → credited with append-only audit and idempotent credits through the SAME paragonArchive.coinCredits.v1 mirror (kind "weekly-leaderboard-reward"; kind-aware toasts on claim). Post-finalization review decisions reopen the week and clear stale prizes — nothing auto-pays.
- Public UI: Account settings → "🏆 Coins Leaderboard — weekly top 3 + ranks 4–10 rewards" popup (week chips, live standings + your-row, state badge, pool + distribution, rules) + leaderboard button in the coin-shop popup.
- Team desk: settings panel → "🏆 WEEKLY LEADERBOARD & REWARD SETTLEMENT (super-admin)" — period picker, standings, per-result review queue (flag chips, disqualify/restore with notes), action row (close & freeze / finalize / calculate prizes / approve & credit — disabled honestly), audit trail.
- `supabase/leaderboards-schema.sql` PREPARED (idempotent; periods/entries/realized fees/rewards/append-only audit/economic settings + RLS + team gate + public standings RPC) — **RUN ONCE when the betting stage lands** (SOP §13 B).
- Cache v76 (engine precached); suites 3/3 green (63 new P-099 checks); tree/docs refreshed.

**NEXT TURN (owner's plan):** websites build from docs/site-specs under /sites/<slug>/ (quiz layout family); badges 21–30; and as game/quiz products gain BET mode, wire them to ParagonLeaderboards.recordResult + recordRealizedFee (eligible staked results only), then run supabase/leaderboards-schema.sql + deploy leaderboard-settle when the backend phase begins.

**Standing gotchas (new):** leaderboard engine stays performance-scored (never stake-sized); rewards/pool stay REAL (0 fees = ₦0, no invented prize); eligibility changes after finalization reopen the week; credits always go through the approval → coinCredits mirror; keep engine loaded BEFORE app.js / team-pages.js; no textual arrows in app.js/paragon-archive.html; CHANGES.md rewritten every turn.

## 7f. WHERE WE STOPPED — after P-100 / EOP v0.94.0 (2026-09-03)

**Shipped — STAGES 6+7 FINANCE (complete, honest, regression-locked):**
- `paragon-wallets.js` — shared engine (window.ParagonWallets) loaded by the Archive AND team/desk.html BEFORE their main scripts: withdrawal requests LOCK coins; ₦10,000+ → 50-coin fee rule (fee 0 below ₦10,000; tracked separately, never profit; placeholder rate ₦1 = 2 coins); rolling limits 2/24 h + 5/7 days (configurable; never trap funds — failures/cancels refund via FAILED → COINS_UNLOCKED); full payout state machine (REQUESTED…PAID incl. RETRYING/UNKNOWN/RECONCILIATION) with ONE unique provider payout reference per payout — a delayed provider response can NEVER cause a second payout; payment claims (one credit per provider transfer; duplicates auto-flagged; 5/24 h); typed append-only ledger with idempotency keys + reconcileBalance(); risk cases; payout accounts (user-owned; changes → verification hold); financial pause + per-game kill switches (ParagonWallets.gameKillState() is the future game-engine hook); correlation IDs; append-only audit.
- Public UI: Account → "💸 Withdraw coins" popup (amount chips, live fee/coins-needed summary, payout-account fields, limit usage, history with state badges, cancel & unlock, refund/paid claiming on Account view); buy-coins flow records payment claims and refuses duplicate references.
- Team desks (7 finance panels in desk.html?page=…): finance (dashboard + paused banner + typed ledger), finance-payments (reconciliation + claim lifecycle), finance-withdrawals (per-state actions + unique-ref capture + timeline), finance-risk (open/review/resolve/close), finance-audit (search + CSV), finance-reports (periods + CSV), finance-emergency (super-admin pause + kill switches). PAGE_ACCESS finance law + 12 permission rows + sidebar FINANCE section; router titles added.
- `supabase/finance-schema.sql` PREPARED (idempotent; wallets + negative-balance guards, typed coin ledger, payout accounts, withdrawals with UNIQUE (provider, provider_transaction_id), claims UNIQUE pair, risk cases, append-only audit, controls, economic settings) — **RUN ONLY when the owner activates real-money infrastructure** (SOP §13 B); the device layer never claims a live payout (pendingBackendSync kept).
- Cache v77 (wallet engine precached); suites 4/4 green incl. new tests/suite-finance.test.js (107 checks: fee rule, windows, state machine, dup payouts, delayed-response honesty, claims, pause/kill switches, ledger + reconciliation, audit, cases, race double-submit, desk law, SQL); tree/docs refreshed (EOP v0.94.0, SOP D-208 + P-100 + CTAs, COIN-SYSTEM Stages 6+7, CHANGES, NEXT-AGENT).

**NEXT TURN (owner's plan):** websites build from docs/site-specs under /sites/<slug>/ (quiz layout family); badges 21–30; and as game/quiz products gain BET/paid modes, wire them to ParagonLeaderboards.recordResult/recordRealizedFee AND consult ParagonWallets.gameKillState(game) before any paid entry; when the owner flips real-money infrastructure on, run supabase/finance-schema.sql + deploy the provider-agnostic payout Edge Function.

**Standing gotchas (new):** withdrawal/finance state changes on the desk go through ParagonWallets.deskTransition (never hand-edit stores); payout references bind once — dup refs are refused at submission AND at PAID; PAID/COINS_UNLOCKED are terminal; pause only stops NEW money moves (unlocks/reversals stay); engine must stay loaded BEFORE app.js / team-pages.js; no textual arrows in app.js/paragon-archive.html; no window.alert/prompt/confirm; CHANGES.md rewritten every turn; finance permission law lives in permissions.js PAGE_ACCESS + PERMISSIONS (six fixed roles — no seventh role without updating the law + fixtures).
