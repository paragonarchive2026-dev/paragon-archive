<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: GAMES-UPDATES-SPEC.md
  EXPECTED PROJECT PATH: /docs/GAMES-UPDATES-SPEC.md
  ROLE: Owner Updates.txt games spec, mapped to what is built — Spin/Chess, free tier + bet mode, stake-matched matchmaking, in-game vs money leaderboards, Supabase capacity, Firebase/Firebird note (P-118 / D-237).
-->

# Games Updates spec — owner brief mapped to the build (P-118)

Source: the owner's Updates.txt notes, restated here as the working spec. Each
row says where it lives in the repo today.

## 1. Spec → build map

| # | Updates.txt spec | Status | Where |
|---|------------------|--------|-------|
| 1 | **Paragon Spin** as a new game | ✅ Live free room | `games/spin/` — Precision Wheel duel, 12 sectors × 6 turns, seeded shared result, `buildProgress: 90` pending owner demo |
| 2 | **Paragon Chess** as a new game | ✅ Live free room | `games/chess/` — full-rule computer chess (castling, en passant, 4 promotions, check/mate, all draws), 3 strengths, `buildProgress: 90` pending owner demo |
| 3 | **Free tier** (guest + signed-up, 0 coins) alongside bet mode | ✅ Live | `games/engine.js` gate: free always open (guest/offline included, never coins); stake requires member + KYC + real-money ON + no pause/kill switch |
| 4 | **Bet mode** (staked play) | 🟡 Built + gated, no stake UI until real money ON | Engine gate + `recordStakedResult` + Stage 3 SQL (`paragon_competition_create/join/settle`); stake inputs deliberately absent from game rooms (platform law) |
| 5 | **User-vs-user matchmaking by matching stake amount** | ✅ Completed P-118 | Archive 1v1 desk (`openGamesCompeteDesk`): match-my-stake toggle, STAKE MATCH rows first, honest empty state; server seats both stakes (`paragon_competition_join`), Team/Edge settles |
| 6 | **In-game leaderboard** (free + bet + multiplayer points combined) | ✅ Live | `ParagonGameKit.mountLeaderboard` — General/Free/Bet/Multiplayer tabs on all three rooms; General combines real modes per player; device rows + `verified: true` server adapter only; never invented users |
| 7 | **Money leaderboard** (top 10 paid from platform revenue) — explicitly separate | ✅ Live, separate | Phase-4 `paragon_leaderboard_periods`/`paragon_leaderboard_entries` + settle RPCs (server) and `paragon-leaderboards.js` + Team settlement desk (device mirror). Free performance NEVER enters it (`recordStakedResult` refuses zero stake) |

Rules that stay law: the browser never settles a money outcome and never mints
coins; one suspicious signal opens a Risk case, never an auto-ban; no stake
inputs, live opponent search, or sample "searching" users until the real server
contract + presence service exist.

## 2. Supabase free-tier capacity — concrete estimate (P-118)

Free plan, verified 2026: **500 MB Postgres · 1 GB file storage · 5 GB egress ·
50,000 MAU · 500,000 Edge invocations/month · 2 projects · auto-pause after
7 days idle.** Free play consumes **zero** Supabase rows (sessions live in
device localStorage) and **zero** file storage (game art lives on the static
host/CDN — current game heroes ≈ 250 KB of a ≈ 6 MB project).

Server rows exist only for money/competition flows. Estimated steady state for
**10,000 active economy users**:

| Table family | Rows | ≈ Bytes/row | ≈ Total |
|---|---|---|---|
| `paragon_coin_accounts` | 10,000 (1/user) | 200 | 2 MB |
| `paragon_coin_ledger_v2` | 100,000 | 300 | 30 MB |
| `paragon_payment_intents` + `paragon_payment_events` | 10,000 | 500 | 5 MB |
| `paragon_competitions` + `paragon_competition_participants` | 10,000 matches | 500 | 5 MB |
| `paragon_competitive_points` | 50,000 | 200 | 10 MB |
| `paragon_quiz_definitions` + `paragon_quiz_attempts` | 10,000 attempts | 1,000 | 10 MB |
| `paragon_audit_log` (largest — needs retention) | 100,000 | 500 | 50 MB |
| Everything else (flags, settings, KYC, cases) | — | — | < 5 MB |
| **Total @ 10k users** | | | **≈ 115 MB of 500 MB** |

Headroom: roughly **4× this load (~40k economy users) before DB pressure**,
and the audit table is the only fast grower — a retention/archive policy
(Biggest-table-first) extends that further. Edge invocations: even 1,000
purchases + 1,000 match settles/day ≈ 60k/month — **8× headroom** under 500k.
Egress: tiny JSON RPCs; 5 GB ≈ tens of millions of responses. MAU 50k is fine
for launch.

**Real risks (not storage):** (1) **7-day auto-pause** — keep weekly activity or
move to Pro before public launch; (2) audit growth — add retention before
scaling; (3) file storage is unneeded — do NOT move game assets into Supabase
Storage; the CDN path is free and faster.

## 3. "Firebird" vs Firebase — clarification (P-118)

- **Firebird** (firebirdsql.org) is a standalone open-source SQL database — it
  has no role in this stack and was almost certainly a typo/autocorrect.
- **Firebase** (Google) is a separate backend-as-a-service. The standing
  decision (D-236, P-117) holds: **do not add it.** Reasons: free play is
  device-local, game assets are on the static host/CDN, and money already has
  one authority (Supabase + RLS + Edge). A second backend would duplicate Auth,
  user identity, and sync logic while solving no capacity problem that exists
  (see §2 — the binding constraints are pause policy and audit retention, both
  inside Supabase, not asset hosting or DB row limits for games).
- Revisit only if realtime multiplayer presence outgrows Supabase Realtime
  (≈200 concurrent connections on free) — and even then the coherent upgrade is
  Supabase Pro, not a second backend.

## 4. What is still planned (NOT half-built — build order stands)

Per `GAMES-BUILD-PLAN.md` §3: **Arcade → Quiz onto the engine → Cards wave 2
(solitaire/memory) → Bet LAST.** These were never started, so there was nothing
half-built to complete; P-118 completed the two genuinely half-built pieces
instead (Quiz paid-path dialogs → inline panels; stake-matched matchmaking).
Only the owner moves Cards/Spin/Chess 90 → 100 after the demo pass.
