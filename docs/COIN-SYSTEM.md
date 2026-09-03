<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COIN-SYSTEM.md
  EXPECTED PROJECT PATH: /docs/COIN-SYSTEM.md
  ROLE: The complete Paragon Coins design (P-098): balance, buying, betting, leaderboards,
        creator quizzes, weekly rewards, withdrawals — plus the owner's "heads-up" prompt
        to paste into ChatGPT for the economic/logistics details still to come.
  RESTORE-LOAD NOTE: The front-end core is BUILT (balance, buy requests, team approval,
        credit mirror) and STAGE 5 LEADERBOARDS is BUILT (P-099/D-207: weekly ranking
        engine + public popup + super-admin settlement desk + prepared backend SQL).
        STAGES 6+7 FINANCE are BUILT (P-100/D-208: withdrawal requests + payout state
        machine + claims/reconciliation + typed ledger + Team finance desks + prepared
        supabase/finance-schema.sql — activates ONLY when the owner flips real-money
        infrastructure on; the device layer never claims a live payout).
        Games/quiz betting integration lands as each product is built and calls
        `ParagonLeaderboards.recordResult(...)` for eligible staked results only.
-->

# 🪙 Paragon Coins — The Complete Design

## What is ALREADY BUILT (P-098)
- **Balance** in the personal state (`accountProfile.coinBalance`, account-synced; guest = session).
- **Account tab**: coin stat box + "🪙 Paragon Coins — balance … · buy coins" row → styled shop popup.
- **Buy flow**: pick a pack (₦500/₦1,000/₦5,000 at the placeholder rate ₦1 = 2 coins) →
  request lands in `paragonTeamCoinRequests.v1` → **Team desk (settings panel) super-admin
  approves** → `paragonArchive.coinCredits.v1` mirror → the user's device credits on next
  Account view with a toast. All real on-device; `pendingBackendSync`.
- Helpers for products: `addCoins(amount, reason)`, `spendCoins(amount, reason)`,
  `coinBalance()` + a 50-entry history.

## STAGE 5 — LEADERBOARDS is ALREADY BUILT (P-099 / D-207)
- **Engine `paragon-leaderboards.js`** (loaded before app.js on the Archive and before
  team-pages.js on the desk): `window.ParagonLeaderboards` — Monday-starting weekly periods,
  eligibility + performance scoring, standings/ranks, realized-fee ledger, 30% pool,
  the spec distribution table, the §12.1 settlement state machine, and an append-only audit.
- **Weekly ranking**: eligible BET results only → points by game performance (accuracy mode
  today; per-game rules are config). Ties share ranks (1,1,3…).
- **Anti-farming (enforced)**: guest play, free play, login/purchase/promo activity earn
  nothing; 1 coin staked is never 1 point (stake only proves eligibility); creator can never
  earn points/prizes from their own quiz; duplicates and impossible scores are rejected;
  rapid-fire / repeated-opponent signals flag rows for review — flags never auto-punish.
- **Revenue-funded reward pool**: 30% of eligible REALIZED competition-fee revenue per week
  (`paragonCompetitionFeeLedger.v1`); pool 0 = ₦0 = nothing paid — never an invented prize.
- **Top 3 + ranks 4–10**: distribution `30/20/15/10/7/5/4/3/2/4` (#1–#10, total 100%);
  remainder coins go to #1 so the whole pool pays out.
- **Reward settlement (§12.1)**: Team desk settings panel → "🏆 Weekly leaderboard & reward
  settlement" — close & freeze → anti-abuse review (disqualify/restore with notes, reopens
  a finalized week) → final ranking → prize calculation → **approve & credit** through the
  SAME `paragonArchive.coinCredits.v1` approval → mirror flow (`kind:
  "weekly-leaderboard-reward"`, toast + history on the winner's device).
- **Public UI**: Account → "🏆 Coins Leaderboard — weekly top 3 + ranks 4–10 rewards" popup
  (or from the coin shop) — live standings, state chip, pool + distribution, eligibility/
  anti-farming rules, week selector. Honest real-zero states everywhere.
- **Backend prepared**: `supabase/leaderboards-schema.sql` (periods, entries, fees, rewards,
  append-only audit, economic settings + RLS + public standings RPC) — RUN ONCE when the
  betting stage lands (see SOP §13 B). Until then the device engine + desk are the working
  layer and nothing claims otherwise.


## STAGES 6+7 — WITHDRAWALS + FINANCE DESKS are ALREADY BUILT (P-100 / D-208)
- **Engine `paragon-wallets.js`** (loaded before app.js on the Archive and before
  team-pages.js on the desk): `window.ParagonWallets` —
  - **Your ₦10,000 fee rule (§22.1):** below ₦10,000 = NO Paragon fee; ₦10,000+ carries the
    50-coin fee, tracked separately and never treated as profit. Placeholder rate ₦1 = 2 coins.
  - **Limits (§23):** max 2 requests per rolling 24 h and 5 per rolling 7 days (configurable);
    they never trap funds — every failure/cancel refunds its locked coins (FAILED → COINS_UNLOCKED).
  - **Payout state machine (§25):** REQUESTED → ELIGIBILITY_CHECK → RISK_CHECK → LOCKED →
    PAYOUT_PENDING → PROVIDER_SUBMITTED → PROVIDER_CONFIRMED → PAID, with RETRYING / UNKNOWN /
    RECONCILIATION branches. One unique provider payout reference per payout — a delayed
    provider response can never cause a second payment.
  - **Payment claims (§18/§19/§24):** each purchase carries a transfer reference; the same
    reference can only ever be claimed once (max 5 claims per 24 h); desk confirms → credits
    through the Settings approval flow.
  - **Typed append-only ledger (§15–§16),** correlation IDs on every request, risk cases,
    payout accounts (user-owned, change = verification hold), financial pause + per-game
    kill switches (§30), append-only audit (§37).
- **Public UI (Archive, Account):** 💸 "Withdraw coins" popup — balance ≈ naira, amount chips
  + live fee/needed summary, bank/account/name fields, history with state badges + cancel &
  unlock, automatic refund claim + paid marking on every Account view.
- **Team desks (Stage 7):** Financial Dashboard · Payment Reconciliation · Withdrawal Desk
  (full per-state action row + timeline) · Risk & Fraud Cases · Financial Audit Log (+CSV) ·
  Financial Reports (+CSV) · Emergency Controls (pause + kill switches). Permission law:
  sa/admin (+ analyst read views); payouts/pause/emergency = super-admin (permissions.js).
- **Backend prepared:** `supabase/finance-schema.sql` (wallets, typed ledger, payout accounts,
  withdrawals, claims, risk cases, audit, controls, economic settings, UNIQUE provider pairs,
  negative-balance guards) — RUN ONLY when the owner activates real-money infrastructure
  (see SOP §13 B). Until then the device engine + desks are the working layer and no UI ever
  claims a payout was made.

## The full mechanics (owner's rules, implemented as products are built)
1. **Free vs Bet:** every game is fully playable FREE. Betting is optional and costs coins.
2. **Betting:** player sets a coin stake + pays an entry fee (shown in ₦, charged in coins
   at the current rate). Winner takes both stakes — balance moves instantly.
3. **Leaderboards:** ONLY bet games award leaderboard points. Free play never climbs.
   Quiz leaderboard works the same way (bet entry = points eligibility). **BUILT in
   Stage 5 (P-099)** — engine/UI/desk ready; it fills as betting lands per product.
4. **Creator quizzes:** a creator stakes coins from their own balance as the prize; the
   creator MAY play their own quiz but can NEVER win its prize or earn leaderboard points
   from it (prevents answer-farming the weekly rewards). **Enforced by the engine.**
5. **Weekly/monthly rewards:** top 3 get the big coin prizes, ranks 4–10 get smaller ones —
   paid by the team through the same approval → credit mirror flow. **Settlement desk
   built (Stage 5):** close → freeze → review → final ranking → prizes → approve & credit.
6. **Withdrawals/selling coins back to Paragon:** user requests → coins lock → team verifies
   → pays naira to the user's own verified account → coins close the loop. **BUILT in Stages
   6+7 (P-100):** request UI, ₦10,000+ 50-coin fee rule, rolling limits, payout state machine,
   claims/reconciliation, dup protection, finance desks — real on-device, honest labels,
   backend SQL prepared for owner activation. (Real rate/fees/provider = owner.)

## ❓ HEADS-UP PROMPT — paste into ChatGPT to design the economics
> I run a free web platform (Paragon Archive) with mini-games and quizzes using a virtual
> coin system. Coins are bought with naira (I'm in Nigeria), used for game betting, quiz
> entry fees and creator prizes; users can also sell coins back to the platform for naira.
> Design for me: (1) a fair coin price/payout spread so I can't lose money on payouts,
> (2) entry-fee and house-edge suggestions for 1v1 bet games, (3) weekly/monthly leaderboard
> prize pools for top 3 + ranks 4-10 that stay affordable at small scale, (4) anti-abuse
> rules (multiple accounts, creator self-play, win-trading with friends), (5) withdrawal
> fee structure and simple manual payout logistics with bank transfer, (6) a simple
> accounting sheet layout so I can track coin liability vs naira collected, (7) legal/
> fairness disclaimers for a skill-based (not luck-based) coin system in Nigeria. Keep
> everything free-to-play friendly: no user ever needs to pay to enjoy the platform.

## Still needed from the owner (CTA)
- The real ₦→coin rate, entry fees, prize amounts, withdrawal fee, payment channels
  (transfer/OPay/Paystack free tier?), and reward schedule — then the placeholder numbers
  are replaced everywhere in one pass.
