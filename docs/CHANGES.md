# 📦 Changed files

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
