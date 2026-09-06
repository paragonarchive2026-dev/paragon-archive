# 📦 Changed files

## 2026-09-06 — P-116 games wave (first playable game)
**Shared game framework (GAMES-BUILD-PLAN.md §2):** `games/engine.js` (ParagonGameEngine —
session lifecycle, seeded RNG, save/resume checkpoints, personal bests, the free-vs-stake gate,
plausibility flags → Risk cases, append-only audit, and the staked-only leaderboard hook) and
`games/manifest.js` (one registry row per game; Paragon Cards is `live`, the other ten games are
declared `planned` with no fake paths). `games/_shared/game-kit.js` + `game-kit.css` give every
game the same screen: FREE PLAY chip, honest STAKE · LOCKED chip that lists every reason staking
is closed, stat bar, one-tap rules card, inline quit/resume panels (no `confirm()`) and a result
overlay that prints the session seed, duration and action-log hash.
**Paragon Cards (`games/cards/`):** two rule sets on one seeded deck — **Higher · Lower** (ten
rounds, you and the house call the same card; 10 × streak points capped at 5x; equal ranks push)
and **Blackjack 21** (100 play chips to 200, bets 10/25/50, dealer draws to 17, blackjack 3:2,
six-deck shoe reshuffled below 78 cards). Play chips are labelled everywhere as NOT Paragon Coins.
**Rules enforced:** free play is open to guests and offline, never moves coins and never earns
leaderboard points; stake sessions are refused until registered member + team-approved KYC +
real-money ON + no financial pause + no per-game kill switch; an impossibly fast result is
flagged and opens a Risk case, never a ban.
**Wiring:** Paragon Cards is wired into the catalogue (`siteUrl: games/cards/index.html`, build
progress 90 until the owner demo pass), the LIVE_SITES fixture in `tests/suite-ux.test.js`
learned the `/games/` root, and the service worker precaches the games shell at cache v89.
**Tests:** new `tests/suite-games.test.js` — 121 checks (gate, seeded fairness, resume,
anti-cheat, audit, honest counters, catalogue wiring). All five suites green.

**New files:** `games/engine.js`, `games/manifest.js`, `games/_shared/game-kit.js`,
`games/_shared/game-kit.css`, `games/cards/index.html`, `games/cards/play.html`,
`games/cards/css/style.css`, `games/cards/js/cards.js`, `games/cards/js/home.js`,
`games/cards/SPEC.md`, `tests/suite-games.test.js`.
**Changed:** `data/catalogue-expansion-45-100.js`, `service-worker.js`, `tests/suite-ux.test.js`,
`tests/suite-core.test.js`, `tests/suite-finance.test.js`, `README.md`, `docs/SOP.md`,
`GAMES-BUILD-PLAN.md`, `docs/CHANGES.md`.

---

## 2026-09-06 — P-114/P-115 wave
**P-114:** Google-style Search (shared bar above entry+results, results tabs **All / AI Mode /
Images / Videos / News / Articles**, compact lined-up results, honest per-tab empty states); the AI
renamed **Paragon Mind** 💠 with the brand diamond mark; AI Mode = the full Archive brain page; the
floating Mind button lives **only** on the Websites/Updates/Account tabs; Welcome splash plays
**once per browser** (never replays after login); popup-lock v2 (background scroll always recovers;
only Settings-side popups freeze it); About-Achievements opens **in front**; shared diamond header
on all Settings popups; **KYC gate** — team-approved KYC required for buy AND withdraw, Paragon
payment account locked until approval, coin packs side-by-side on top (tap-a-pack = request), Team
desk KYC review queue + payment-account publisher; Continue-as-Guest matches the auth buttons.
**P-115:** **365-day Daily Goals** (3 deterministic missions/day, 365 unique day-sets, manual doc
missions, "Mark done"); **1 leaderboard point per completed day** via
`ParagonLeaderboards.recordDailyPoint` (members instant; guests bank → auto-post on sign-in before
session end); live AI context extended (dayOfCycle, pointEarnedToday, pointsTotal); **Paragon Mind
trained on the whole platform** — pleasantries engine, official FAQ knowledge base, smarter routing
(website lists only for actual website searches); leaderboard copy updated everywhere; HTML
structure bugs fixed (truncated button in quiz create, missing section close in team desk, broken
setup links); README expanded; AI-BRAIN.md rewritten as the living Mind spec.

---

## 2026-09-05 — P-113 update wave
See **[P-113-WAVE.md](P-113-WAVE.md)** for the full plain-English list. Highlights: Google-style
instant search; smarter Paragon AI (chat/greetings/typos + floating Ask AI button); Updates feed
reverted to flat; all popups modal (× on right, no outside-close, background locked); REAL
leaderboards (no fake rivals, honest empty states) with a weekly calendar dropdown; prize split
**30/20/15/10/9/6/4/3/2/1**; Real Money ON; withdrawal fee **100 coins** (₦50 × 2); OPay/Moniepoint
KYC-driven payment rail with placeholders + live coin total; 12 account boxes (Coin Shop removed;
Rewards / Daily Goals / Orders / Invite added); websites open **full tab (no iframes)**; each
`/sites/` product now owns its CSS/JS with no per-site theme toggle; `vercel.json` root routing.

---

## 📦 Changed files — lineage-union merge to GitHub main (2026-09-03)

Both post-P-098 parallel lineages are now ONE tree on GitHub `main`. Everything this
workspace built (Stages 5–7 device leaderboards + withdrawal engine + finance desks)
and everything the earlier agent's PR #1 built (P-101–P-111 server coin stack) is merged
losslessly; the GitHub ZIP now matches the workspace.

## Conflict-resolved files (both sides' work kept, unioned by hand)
- `app.js` — canonical server-first coin flow (P-106–P-111: engagement leaderboard, OPay/Moniepoint rails, Stage 2 payment intents + claims, Stage 3 stake games, Stage 4 quiz) **plus** this workspace's P-099 leaderboard popup + P-100 withdrawal popup, kind-aware reward credit sync, and the extra Account rows; every `window.prompt` replaced with the dialog-law overlay (`askAppFields`).
- `style.css` — P-105…P-109 polish blocks **plus** the P-099/P-100 leaderboard + wallet + finance-desk styles.
- `team/desk.html` — main lineage Stage 2–4 desk panels **plus** the leaderboard settlement + coin-withdrawal + seven finance desk sections (38 panels total).
- `team/team-pages.js` — both sides' desk bindings (reconcile, finance desks, Stage 3 games, Stage 4 quiz, Phase 5 rails **and** coin requests, leaderboard settlement, withdrawals); every `window.prompt` converted to the `ParagonTeamPrompt` dialog-law helper.
- `service-worker.js` — cache unified at **paragon-archive-v88**, shell includes the leaderboard + wallet engines.
- `tests/suite-core.test.js`, `tests/suite-ux.test.js` — assertions unioned at cache v88; the P-099 leaderboard fixture (18 checks) is preserved.
- `docs/SOP.md`, `docs/EOP.md`, `docs/NEXT-AGENT.md` — main narrative baseline (v0.93.0→v1.05.0, P-101–P-111) **plus** this workspace's parallel entries (EOP v0.93.0-par/v0.94.0-par, NEXT-AGENT 7e-arena/7f-arena); SOP D-234 records the merge.
- `docs/CHANGES.md` — this file, rewritten this turn.
- `paragon-file-tree.html` — regenerated from the merged tree (see the new total below).

## Files that existed only on GitHub main (now downloaded with every ZIP)
Badge art set (41–50), `.github/workflows/supabase-health.yml`, coins-master SQL phases 1–5 +
hardening + stage SQL + Supabase functions, the nine in-project `/sites/` product builds,
`paragon-quiz` paid bridge + create/play hooks, `README.md`, `PARAGON-COINS-MASTER-BUILD-SPEC.md`.

## Files that existed only in this workspace (now on main)
`paragon-leaderboards.js`, `paragon-wallets.js`, `supabase/leaderboards-schema.sql`,
`supabase/finance-schema.sql`, `tests/suite-finance.test.js` (107 checks).

## Owner download help
Code → Download ZIP on GitHub, or the direct link
`https://github.com/paragonarchive2026-dev/paragon-archive/archive/refs/heads/main.zip`
(always the latest main). Full walkthrough: `docs/DEPLOYMENT-GUIDE.md` §3b.
