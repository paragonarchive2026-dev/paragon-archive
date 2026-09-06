# Paragon Archive

**Every website you need, one archive.** Paragon Archive is the gateway to the Paragon web
ecosystem — a curated, honestly-labelled catalogue of Paragon-built websites with search,
reviews, collections, coins, weekly leaderboards and a built-in AI.

- Entry point: `paragon-archive.html`
- Games build plan: [`GAMES-BUILD-PLAN.md`](GAMES-BUILD-PLAN.md)
- Documentation hub: `paragon-archive-hub.html`
- Quiz product: `paragon-quiz/`
- Games: `games/` (shared framework plus live Cards, Spin and Chess rooms)
- Team dashboard: `team/desk.html` (routed `?page=…`)
- Community board: `community-board.html` · Developer portal: `developer-portal.html`

## Highlights

- 🔎 **Google-style Search** — one shared search bar with results lined up beneath it and
  result tabs: **All · AI Mode · Images · Videos · News · Articles** (honest empty states).
- 💠 **Paragon Mind** — the built-in brand AI. One local core (no external AI service) that
  powers search ranking, the floating assistant (Websites/Updates/Account tabs), website-detail
  Q&A, and the full AI Mode page. It knows the catalogue, coins & KYC, the leaderboard,
  365-day Daily Goals, accounts/guests, the Updates feed, the official FAQ and every
  documentation page — and it handles pleasantries and general chat naturally.
- **Paragon Cards, Spin and Chess** — three live rooms on one shared game framework. Cards
  includes Higher · Lower and Blackjack 21; Spin is a six-turn seeded Precision Wheel duel;
  Chess is a full-rule local computer match at three strengths. All save/resume, work for guests
  with zero coins, and use game-specific General / Free / Bet / Multiplayer performance views
  without inventing online players. Cards also received a tactile felt-and-walnut visual pass.
- 🎯 **365-day Daily Goals** — three new deterministic missions every day for a full year
  (365 unique day-sets). Complete all three to earn exactly **1 leaderboard point** that day;
  guests bank the point and it posts automatically when they sign in before the session ends.
- 🪙 **Paragon Coins with KYC** — buying and withdrawing both require team-approved KYC;
  the Paragon payment account stays locked until approval. Packs render side-by-side and
  tapping a pack is the request. Withdrawals follow the full payout state machine with
  fee rules, limits and idempotent claims.
- 🏆 **Weekly leaderboard** — points from eligible staked results plus the daily-goal point;
  revenue-funded reward pool (30% of realized fees), team-reviewed settlement.
- 📄 **Honest documentation** — About, Privacy, Terms, Community Guidelines, Cookie Policy,
  Help & Support, FAQ, Roadmap and Developer Requirements in the Archive Hub.

## Run locally

Static site — any static server works:

```bash
python3 -m http.server 8080
# open http://localhost:8080/paragon-archive.html
```

Optional backend: add your Supabase URL + anon key in `config/supabase.js` (auth, sync,
finance RPCs). Free games run locally/offline and static assets come from the host/CDN, so they do
not consume Supabase database space. Firebase is not required and would duplicate the current auth
and data stack. Everything degrades honestly to local/device state without Supabase.

## Test

```bash
node tests/suite-core.test.js
node tests/suite-ux.test.js
node tests/suite-ai-team.test.js
node tests/suite-finance.test.js
node tests/suite-games.test.js
```

## Key files

| Path | Role |
|---|---|
| `app.js` | Main app: navigation, search, details, Account/Updates, coins, KYC, goals |
| `ai/paragon-archive-ai.js` | Paragon Mind — the one local AI core (see `docs/AI-BRAIN.md`) |
| `paragon-leaderboards.js` | Weekly leaderboard engine + daily-goal points |
| `games/engine.js` | Shared game framework — sessions, seeded RNG, stake gate, bests, audit (P-114/116/117) |
| `games/manifest.js` | Game registry: what is live, what is planned, stake limits |
| `games/cards/` | Higher · Lower and Blackjack 21 |
| `games/spin/` | Precision Wheel free duel |
| `games/chess/` | Full-rule chess with three local computer strengths |
| `paragon-wallets.js` | Withdrawals, payout state machine, claims, risk, audit |
| `data/*.js` | Catalogue + updates data |
| `style.css` | The whole design system |
| `docs/` | Specifications, changelogs, runbooks (start with `SOP.md`, `CHANGES.md`) |
