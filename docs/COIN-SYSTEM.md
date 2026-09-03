<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: COIN-SYSTEM.md
  EXPECTED PROJECT PATH: /docs/COIN-SYSTEM.md
  ROLE: The complete Paragon Coins design (P-098): balance, buying, betting, leaderboards,
        creator quizzes, weekly rewards, withdrawals — plus the owner's "heads-up" prompt
        to paste into ChatGPT for the economic/logistics details still to come.
  RESTORE-LOAD NOTE: The front-end core is BUILT (balance, buy requests, team approval,
        credit mirror). Games/quiz integration lands as each product is built.
-->

# 🪙 Paragon Coins — The Complete Design

## What is ALREADY BUILT (P-098 + P-100)
- **Withdrawals UI** (P-100): Account coin shop → sell-back form → `paragonTeamCoinWithdrawals.v1` → Team settings desk marks Paid → `paragonArchive.coinDebits.v1` deducts on user device.
- **SQL backend** (P-100): `supabase/coins-schema.sql` — wallets, ledger, purchase/withdraw tables, approve/spend RPCs. Run via `supabase/SQL-RUN-PACK.md`.
- **History** shown inside the coin shop popup.

## What is ALREADY BUILT (P-098)
- **Balance** in the personal state (`accountProfile.coinBalance`, account-synced; guest = session).
- **Account tab**: coin stat box + "🪙 Paragon Coins — balance … · buy coins" row → styled shop popup.
- **Buy flow**: pick a pack (₦500/₦1,000/₦5,000 at the placeholder rate ₦1 = 1 coin (master-spec target; was placeholder 2)) →
  request lands in `paragonTeamCoinRequests.v1` → **Team desk (settings panel) super-admin
  approves** → `paragonArchive.coinCredits.v1` mirror → the user's device credits on next
  Account view with a toast. All real on-device; `pendingBackendSync`.
- Helpers for products: `addCoins(amount, reason)`, `spendCoins(amount, reason)`,
  `coinBalance()` + a 50-entry history.

## The full mechanics (owner's rules, implemented as products are built)
1. **Free vs Bet:** every game is fully playable FREE. Betting is optional and costs coins.
2. **Betting:** player sets a coin stake + pays an entry fee (shown in ₦, charged in coins
   at the current rate). Winner takes both stakes — balance moves instantly.
3. **Leaderboards:** ONLY bet games award leaderboard points. Free play never climbs.
   Quiz leaderboard works the same way (bet entry = points eligibility).
4. **Creator quizzes:** a creator stakes coins from their own balance as the prize; the
   creator MAY play their own quiz but can NEVER win its prize or earn leaderboard points
   from it (prevents answer-farming the weekly rewards).
5. **Weekly/monthly rewards:** top 3 get the big coin prizes, ranks 4–10 get smaller ones —
   paid by the team through the same approval → credit mirror flow.
6. **Withdrawals/selling coins back to Paragon:** user requests → team verifies → pays naira
   minus the team's fee → coins deducted. (Front-end hook ready; rates/fees = owner.)

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

## Phase 2 authority (P-102)
- SQL: `supabase/coins-master-phase2.sql` — `paragon_coin_post_entry`, payment intents, withdrawal lock/settle, admin adjust.
- FE: registered users only for buy/withdraw; attempts RPCs then falls back to team desk queue.
- Browser balance = display/cache. No credit on “Request” click alone.

## Real-money gate (P-101)
- Server flag `paragon_feature_flags.real_money_enabled` defaults **false**.
- Purchases/withdrawals/compete stay disabled until the owner flips flags after provider + compliance.
- UI must never claim bank money moved while the flag is off.

## Still needed from the owner (CTA)
- The real ₦→coin rate, entry fees, prize amounts, withdrawal fee, payment channels
  (transfer/OPay/Paystack free tier?), and reward schedule — then the placeholder numbers
  are replaced everywhere in one pass.
