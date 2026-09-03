# PARAGON ARCHIVE — PARAGON COINS MASTER BUILD SPECIFICATION

**Document:** `PARAGON-COINS-MASTER-BUILD-SPEC.md`  
**Purpose:** Master handoff for the coding/build agent  
**Project:** Paragon Archive  
**Current codebase:** Existing vanilla HTML/CSS/JS + Supabase project  
**Status:** Build specification prepared after repository audit; implement against the existing codebase, not as a greenfield rewrite.

---

## 0. AGENT INSTRUCTIONS — READ THIS FIRST

You are modifying an existing Paragon Archive project.

**Do not rebuild Paragon from scratch. Do not replace the existing architecture merely because a different stack would be easier.**

The existing project is a vanilla HTML/CSS/JS application with Supabase authentication/state and a consolidated Team desk. Preserve the existing UX, file conventions, route structure, tests, and honest-data rules unless this specification explicitly requires a change.

### Non-negotiable engineering rules

1. **No fake money.**
   - Do not simulate successful payments with arbitrary localStorage records.
   - Do not create redeemable coins from client-side claims.
   - Do not create fake bank confirmations.
   - Do not ship a production-looking financial flow that secretly operates only as a demo.

2. **The browser is never authoritative for money.**
   - Client-side coin balances are display/cache state only.
   - The server/database ledger is authoritative.
   - Game results that affect money must be server-authoritative.

3. **Never give an admin a direct "edit balance" operation.**
   - Financial corrections must be ledger adjustments with reason, evidence, actor, timestamp and authorization.
   - Significant financial adjustments require dual approval.

4. **Never delete financial history.**
   - Use reversals/adjustments instead of editing historical financial events.

5. **Every financial event needs a unique ID and source.**

6. **All financial operations must be idempotent.**
   - Repeated requests, double clicks, repeated webhooks and retries must not create duplicate money/coins.

7. **Do not trust user-submitted payment details as proof.**
   - They are matching hints only.
   - Independently verified provider/bank records are authoritative.

8. **Do not let free play generate leaderboard points.**

9. **A login alone does not make a user leaderboard-eligible.**
   - Email/password login: no points merely for logging in.
   - Google/Gmail login: no points merely for logging in.
   - Only an eligible staked/competitive result can affect the competitive leaderboard.

10. **Guest users are free-play only.**
    - Guest can play free games/quizzes.
    - Guest cannot buy coins, stake coins, withdraw, or earn competitive leaderboard points.

11. **Do not add direct user-to-user coin transfers at launch.**

12. **Do not hard-code economic values throughout the UI.**
    - Put them in a server-controlled/configurable economic settings layer.

13. **Never expose server secrets in frontend code.**
    - Payment provider secrets, service-role keys, signing secrets, webhook secrets and private keys belong in server/Edge Function secrets.

14. **Use the project's existing conventions.**
    - New HTML/CSS/JS/SQL files need the existing `PARAGON ARCHIVE — EXPORT IDENTITY` header.
    - Do not use `window.alert`, `window.prompt` or `window.confirm`; use the existing UI/modal conventions.
    - Keep all existing regression fixtures green and add financial fixtures.

15. **Do not claim a feature is live until it is actually wired and tested.**
    - The project has an explicit honesty rule. Preserve it.

---

# 1. REPOSITORY AUDIT — WHAT EXISTS TODAY

The uploaded repository contains the current Paragon Archive project. The ZIP contains **276 files**, including **89 text/code/config files** and the project's image/assets.

The current architecture is broadly:

```text
Paragon Archive
├── app.js
├── style.css
├── paragon-archive.html
├── paragon-archive-hub.html
├── paragon-quiz/
│   ├── index.html
│   ├── explore.html
│   ├── create.html
│   ├── play.html
│   ├── results.html
│   └── js/quiz.js
├── auth/
│   ├── supabase-auth.js
│   └── paragon-sync.js
├── config/
│   └── supabase.js
├── supabase/
│   ├── schema.sql
│   └── functions/
├── team/
│   ├── desk.html
│   ├── login.html
│   ├── nav.js
│   ├── permissions.js
│   ├── session.js
│   └── team-pages.js
├── docs/
└── tests/
```

### Existing important architecture

- Authentication is handled through the project's Supabase auth wrapper.
- Authenticated user state is currently stored in `paragon_user_state`.
- The main app keeps `accountProfile` in the personal state.
- Guest state is session-based.
- The Team desk is consolidated into `team/desk.html?page=...`.
- Team roles are already defined in `team/permissions.js`.
- Paragon Quiz is currently a localStorage-based quiz engine.
- The existing coin core is also primarily localStorage/personal-state based.
- The existing Supabase schema is an **archived/executed reference** and explicitly says not to blindly rerun it. New financial schema should therefore be added as a new migration/SQL file rather than modifying/re-running the archived schema blindly.

---

# 2. EXISTING COIN CORE — WHAT MUST BE REPLACED/UPGRADED

The current P-098 coin implementation is a prototype/core UI layer.

Current behavior includes:

- `accountProfile.coinBalance`
- `accountProfile.coinHistory`
- `coinBalance()`
- `addCoins(amount, reason)`
- `spendCoins(amount, reason)`
- a coin shop
- ₦500 / ₦1,000 / ₦5,000 placeholder packs
- placeholder conversion of ₦1 = 2 coins
- localStorage purchase requests:
  - `paragonTeamCoinRequests.v1`
- Team approval
- localStorage credit mirror:
  - `paragonArchive.coinCredits.v1`
- device-side synchronization of approved credits

### This is NOT sufficient for real-money operation.

The current client-side design must be converted into a server-authoritative financial system.

The existing functions may remain as compatibility wrappers where useful, but they must no longer be trusted to create/settle redeemable value.

### Important existing code locations

- Main coin core: `app.js`
- Authenticated shared state: `auth/paragon-sync.js`
- Auth: `auth/supabase-auth.js`
- Supabase config: `config/supabase.js`
- Team coin approval prototype: `team/team-pages.js`
- Existing coin documentation: `docs/COIN-SYSTEM.md`
- Existing schema reference: `supabase/schema.sql`

---

# 3. CORE PRODUCT RULES

## 3.1 Guest

Guest users can:

- browse Paragon
- play free games
- play free quizzes

Guest users cannot:

- purchase coins
- deposit money
- stake coins
- enter paid/staked competitions
- withdraw
- receive competitive leaderboard points

A guest may later sign in and become a registered account, but previous free-play activity must not retroactively create competitive points.

---

## 3.2 Registered user

A registered account can:

- play free games
- play free quizzes
- purchase coins
- participate in eligible staked competitions after required eligibility/verification
- win coins
- earn competitive leaderboard points from eligible staked results
- receive eligible leaderboard rewards
- request withdrawals

---

## 3.3 Login is not leaderboard eligibility

This must be explicit everywhere.

These do **not** create leaderboard points:

- creating an account
- email verification
- Google login
- Gmail login
- opening a game
- free game completion
- free quiz completion
- purchasing coins

Only an eligible staked competition result can affect the competitive leaderboard.

---

# 4. COIN ECONOMIC MODEL

## 4.1 Base denomination

Target design:

> **1 Paragon Coin = ₦1 gross redeemable value**

Examples:

- 100 coins = ₦100
- 500 coins = ₦500
- 1,000 coins = ₦1,000
- 10,000 coins = ₦10,000

This denomination is intentionally simple.

---

## 4.2 Purchase price

The current ₦1 = 2 coins is explicitly a placeholder and must be removed from production UI.

The final production rate must live in server-controlled configuration.

The agent must not scatter conversion values through frontend code.

Recommended initial production denomination:

> ₦1 paid → 1 redeemable coin

unless a later economic decision explicitly changes it.

If a promotional pack gives extra non-redeemable promotional value, that must be represented separately from redeemable coins.

---

## 4.3 Redeemable liability

Purchased redeemable coins are not automatically company profit.

If users collectively have:

> 1,000,000 redeemable coins

Paragon records approximately:

> ₦1,000,000 gross redeemable user liability

subject to the final legal/accounting treatment.

Platform revenue is tracked separately.

---

# 5. COMPETITION ECONOMICS

## 5.1 Competition is skill-based

Paragon's intended competition model is:

> two users voluntarily stake coins against each other in a skill-based game.

Paragon does not select a sportsbook outcome and does not take the user's opposing stake.

However, the build must not claim that this automatically makes the service exempt from gaming regulation.

Current FCT-LRO material covers interactive gaming and emerging-market gaming, including games of skill where prizes are distributed from a player pool. Treat regulatory classification as a real production requirement, not something the UI should misrepresent.

---

## 5.2 Free and competitive modes are separate

Every applicable game should expose:

### FREE

- ₦0
- 0 coins
- no competitive leaderboard points

### COMPETE

- requires account
- requires sufficient available coins
- displays stake and fee before confirmation
- uses server-authoritative settlement
- eligible result can produce leaderboard points

---

## 5.3 Minimum stake

Initial configuration:

> **100 coins**

This is a configurable setting.

---

## 5.4 Maximum stake

Initial configuration:

> **10,000 coins per player per match**

This is a configurable setting and should not be hard-coded.

---

## 5.5 Competition fee

The agreed model is:

> **5% of the total two-player competition pool**

Example:

```text
Player A stake = 1,000
Player B stake = 1,000

Gross pool = 2,000

Paragon fee = 100

Winner settlement = 1,900
```

The fee must be calculated server-side.

Do not let the browser tell the server:

> "The fee is 50."

The server calculates it from authoritative settings.

---

# 6. MATCH MONEY STATE MACHINE

Each staked match should have a financial state machine.

Recommended:

```text
CREATED
  ↓
STAKE_PENDING
  ↓
STAKES_LOCKED
  ↓
READY
  ↓
IN_PROGRESS
  ↓
RESULT_PENDING
  ↓
SETTLEMENT_PENDING
  ↓
SETTLED
```

Failure branches:

```text
STAKE_PENDING → CANCELLED
READY → VOIDED
IN_PROGRESS → INTERRUPTED
RESULT_PENDING → VOIDED
SETTLEMENT_PENDING → RETRYING
SETTLEMENT_PENDING → MANUAL_REVIEW
```

### Rule

No user balance is permanently changed until the corresponding ledger entries are committed atomically.

---

# 7. DRAW / VOID / TECHNICAL FAILURE

## Genuine draw

Initial preferred behavior:

> return the relevant stakes to the players.

Paragon should not automatically profit from an unresolved/genuine draw.

---

## Game crash

If a result cannot be reliably established:

> void the match and return the locked stakes.

Do not invent a winner.

---

## Disconnect

Each game needs an explicit disconnect policy.

Examples:

- turn-based: reconnect window
- timed real-time: predefined timeout
- abandonment: published loss/void policy depending on the game

The rule must be displayed before staking.

---

# 8. SERVER-AUTHORITATIVE GAME RULE

For money-affecting games:

> The browser is a client, not the referee.

The server must validate:

- match participants
- legal moves/actions
- match state
- timers where relevant
- final result
- stake
- settlement

Never accept:

```text
client says winner = user A
```

as sufficient evidence.

---

# 9. QUIZ SYSTEM INTEGRATION

The existing Paragon Quiz is currently localStorage-based.

It has:

- `paragonQuiz.quizzes.v1`
- `paragonQuiz.results.v1`
- `paragonQuiz.bestScores.v1`

and a single `paragon-quiz/js/quiz.js` controller.

The current engine:

- creates quizzes locally
- plays locally
- saves results locally
- exposes correct answers to the browser during gameplay/review

This is acceptable for free play but is **not sufficient for paid competitive quizzes**.

---

## 9.1 Paid quiz architecture

For competitive quizzes:

- quiz definition must be server-backed
- paid quiz state must be immutable after publication/activation
- correct answers must not be unnecessarily exposed to the client
- scoring must be verified server-side
- paid attempt must have a server-side attempt ID
- stake/entry must be locked before the attempt starts
- final result must be server validated
- settlement must be atomic

---

## 9.2 Creator quiz rules

Creator may stake coins to create a prize.

Creator:

- cannot win their own quiz prize
- cannot earn competitive leaderboard points from their own quiz
- cannot use an associated account to farm the prize
- cannot alter the financial rules after paid participation starts
- must have the prize amount available before publishing the paid quiz

---

# 10. CREATOR PRIZE STATE

A creator prize should move through:

```text
DRAFT
  ↓
FUNDED
  ↓
PUBLISHED
  ↓
ACTIVE
  ↓
CLOSED
  ↓
SETTLED
```

Failure:

```text
FUNDED → CANCELLED → REFUNDED
```

or:

```text
ACTIVE → DISPUTED → REVIEW → SETTLED/REFUNDED
```

The creator's prize must remain locked while committed.

---

# 11. LEADERBOARD

## 11.1 Eligibility

Only eligible staked competition results affect the competitive leaderboard.

No points from:

- guest play
- free play
- login
- account creation
- coin purchases
- promotional activity

---

## 11.2 Anti-farming

Do not use:

> 1 coin wagered = 1 leaderboard point.

That allows money size to dominate skill.

Points should be based on game performance and/or a game-specific rating system.

The exact scoring algorithm should be implemented per game type, but must be server-controlled.

---

# 12. WEEKLY LEADERBOARD REWARDS

Initial design:

> **30% of eligible realized competition-fee revenue is allocated to the weekly leaderboard reward pool.**

The reward pool is therefore revenue-funded.

Do not promise a fixed prize pool that the platform has not funded.

Initial distribution:

| Rank | Share |
|---|---:|
| #1 | 30% |
| #2 | 20% |
| #3 | 15% |
| #4 | 10% |
| #5 | 7% |
| #6 | 5% |
| #7 | 4% |
| #8 | 3% |
| #9 | 2% |
| #10 | 4% |

The exact lower-rank percentages can remain configurable, but the total must always equal 100%.

---

## 12.1 Reward settlement

At the end of a leaderboard period:

```text
PERIOD CLOSED
↓
RESULTS FROZEN
↓
ANTI-ABUSE REVIEW
↓
ELIGIBILITY CHECK
↓
FINAL RANKING
↓
PRIZE CALCULATION
↓
REWARD LEDGER ENTRIES
↓
CREDIT
```

Suspicious accounts must not automatically receive final rewards merely because the leaderboard period ended.

---

# 13. NO LAUNCH-TIME REDEEMABLE WELCOME CASH

Do not create a redeemable welcome bonus.

The platform is free-to-play through free games.

If promotional rewards are later added, separate:

- redeemable coins
- non-redeemable promotional credits
- XP
- badges/cosmetics

Never mix these into one generic balance.

---

# 14. BALANCE TYPES

The financial engine must support at least:

### AVAILABLE

Can be used according to eligibility rules.

### LOCKED

Committed to a match, creator prize or withdrawal.

### PENDING

Associated with an unfinalized payment/settlement.

### RESTRICTED

Financially frozen due to dispute, security or fraud review.

Example:

```text
Total balance:       10,000
Available:             6,000
Game locked:           2,000
Withdrawal locked:     1,500
Restricted:              500
```

The total is not the same as spendable balance.

---

# 15. FINANCIAL LEDGER

Create a proper append-only financial ledger.

Recommended conceptual table:

`coin_ledger_entries`

Fields should include at least:

- id
- user_id
- entry_type
- amount
- currency_unit / coin_unit
- status
- reference_type
- reference_id
- correlation_id
- idempotency_key
- created_at
- metadata
- created_by / actor where applicable

Possible entry types:

```text
PURCHASE_CREDIT
GAME_STAKE_LOCK
GAME_STAKE_RELEASE
GAME_WIN
GAME_FEE
GAME_VOID_REFUND
CREATOR_PRIZE_LOCK
CREATOR_PRIZE_REFUND
LEADERBOARD_REWARD
WITHDRAWAL_LOCK
WITHDRAWAL_SETTLED
WITHDRAWAL_FEE
WITHDRAWAL_REVERSAL
PAYMENT_REVERSAL
ADMIN_ADJUSTMENT
PROMOTIONAL_CREDIT
PROMOTIONAL_REVERSAL
```

Do not use arbitrary free-text reasons as the primary accounting mechanism.

Use typed event categories plus metadata.

---

# 16. DOUBLE-ENTRY-LIKE FINANCIAL THINKING

The implementation does not need to become a full accounting package, but every value movement must have an auditable source and destination.

Example:

```text
A stakes 1,000
B stakes 1,000

A available: -1,000
A locked:     +1,000

B available: -1,000
B locked:     +1,000

Competition pool:
+2,000

Settlement:

Winner:
+1,900

Platform fee:
+100
```

The system must never simply mutate:

```text
winner.coinBalance += 1900
```

without corresponding ledger references.

---

# 17. PURCHASE FLOW

Target production flow:

```text
USER SELECTS PACK
↓
SERVER CREATES PAYMENT INTENT / PURCHASE REQUEST
↓
USER RECEIVES PAYMENT INSTRUCTIONS
↓
USER TRANSFERS NAIRA
↓
PAYMENT PROVIDER/BANK RECORD IS RECEIVED
↓
RECONCILIATION MATCH
↓
PAYMENT CONFIRMED
↓
LEDGER PURCHASE CREDIT
↓
AVAILABLE COINS
↓
RECEIPT/NOTIFICATION
```

The user's submitted:

- transaction ID
- amount
- sender name
- sending institution

is only matching information.

---

# 18. PAYMENT MATCHING

The backend should support a reconciliation record with:

- provider
- provider transaction/reference ID
- amount
- currency
- sender name where available
- sender account identifier where legally/operationally appropriate
- destination account
- received timestamp
- raw/provider event reference
- normalized match fields
- status
- matched user ID
- matched purchase request ID

Payment states:

```text
CLAIMED
PENDING_VERIFICATION
MATCHED
CONFIRMED
DUPLICATE
MISMATCH
EXCESS_PAYMENT
UNDERPAYMENT
REVERSED
MANUAL_REVIEW
REFUNDED
```

---

# 19. DUPLICATE PAYMENT PROTECTION

A provider transaction/reference must not be credited twice.

Use a unique constraint where appropriate, for example:

```text
(provider, provider_transaction_id)
```

The same payment arriving twice must result in one credit.

---

# 20. IDEMPOTENCY

All money-moving commands need idempotency.

Examples:

- create purchase
- confirm payment
- lock stake
- settle match
- create withdrawal
- mark withdrawal paid
- award leaderboard reward
- apply reversal

Repeated request:

> return the existing result

rather than performing the action twice.

---

# 21. RACE CONDITIONS

Use database transactions/atomic operations.

Example:

User has:

> 1,000 available coins.

Two devices simultaneously try to stake 1,000.

Expected:

```text
Request A → SUCCESS
Request B → INSUFFICIENT AVAILABLE BALANCE
```

Never:

```text
Balance = -1,000
```

or two successful stakes.

---

# 22. WITHDRAWAL RULES

## User request

User selects a withdrawal amount.

The backend checks:

- account eligibility
- available balance
- locked/restricted balance
- risk flags
- payout account
- daily frequency limits
- weekly frequency limits
- applicable fees
- minimum withdrawal
- maximum withdrawal if configured

---

## 22.1 Your ₦10,000 rule

### Withdrawal below ₦10,000

> No Paragon withdrawal fee.

### Withdrawal of ₦10,000 or more

> **50 coins withdrawal fee**

Example:

User wants:

> ₦10,000

Required balance:

> 10,050 coins

User receives:

> ₦10,000

Paragon ledger:

```text
-10,000 redeemable coins
-50 coins withdrawal fee
```

The 50-coin fee is tracked separately.

The 50 coins are not automatically treated as pure profit; actual provider/bank costs must be recorded separately.

---

# 23. WITHDRAWAL FREQUENCY LIMITS

Initial configuration:

> **Maximum 2 withdrawal requests per rolling 24 hours**

and:

> **Maximum 5 withdrawal requests per rolling 7 days**

These are configurable launch parameters.

They must not be used to trap legitimate funds.

---

# 24. INCOMING PAYMENT CLAIM LIMIT

Initial configuration:

> **Maximum 5 payment claims per rolling 24 hours per account**

This is an anti-spam/reconciliation control, not a maximum spending amount.

---

# 25. WITHDRAWAL STATE MACHINE

Recommended:

```text
REQUESTED
↓
ELIGIBILITY_CHECK
↓
RISK_CHECK
↓
LOCKED
↓
PAYOUT_PENDING
↓
PROVIDER_SUBMITTED
↓
PROVIDER_CONFIRMED
↓
PAID
```

Failure branches:

```text
PAYOUT_PENDING → RETRYING
PROVIDER_SUBMITTED → UNKNOWN
UNKNOWN → RECONCILIATION
RECONCILIATION → PAID
RECONCILIATION → FAILED
FAILED → COINS_UNLOCKED
```

Never issue a second payout simply because the first provider response was delayed.

---

# 26. PAYOUT ACCOUNT RULE

Initially:

> payout should go to a verified payout account belonging to the eligible user.

Do not enable arbitrary third-party payout accounts at launch.

Changing payout details should trigger additional verification/risk controls.

---

# 27. DIRECT USER-TO-USER COIN TRANSFERS

**Disabled at launch.**

No:

```text
sendCoins(userA, userB)
```

feature.

Reasons:

- fraud
- scams
- laundering risk
- account selling
- disputes
- financial tracing complexity

Competition winnings are the permitted peer-to-peer value movement mechanism.

---

# 28. PAYMENT REVERSALS / CHARGEBACKS

If a confirmed purchase is later reversed:

```text
PAYMENT
↓
CONFIRMED
↓
COINS ISSUED
↓
PAYMENT REVERSED
```

Do not silently delete the original purchase.

Create:

> `PAYMENT_REVERSAL`

Then calculate the user's affected financial exposure.

If coins have already been spent or withdrawn, the account may enter a restricted/review state according to the published rules and applicable law.

---

# 29. FAILURE HANDLING

## Payment received but server crashes before coin credit

Payment remains:

> `CONFIRMED / UNSETTLED`

Reconciliation retries.

The user does not need to pay again.

---

## Duplicate webhook

Ignore financially after the first successful processing.

Record the duplicate event.

---

## User clicks Pay repeatedly

Idempotency key prevents duplicate payment intents/credits.

---

## Game crashes

If result cannot be trusted:

> void and refund stakes.

---

## Withdrawal provider times out

Do not pay twice.

Mark:

> `UNKNOWN / RECONCILIATION_REQUIRED`

and verify provider state before retrying.

---

## Database failure

Use backups and recovery.

Financial records must be restored before financial operations resume.

---

# 30. EMERGENCY CONTROLS

Add:

## Financial Pause

Stops:

- new purchases
- new paid competitions
- new withdrawals

while allowing safe free platform functionality to remain available.

---

## Per-game Kill Switch

A broken game can be disabled without shutting down Paragon.

Existing affected matches follow their published failure policy.

---

# 31. ANTI-CHEAT

Implement a risk engine, not a single magic "cheat detector."

Signals can include:

- repeated opponent relationships
- extreme win/loss asymmetry
- repeated identical stake patterns
- suspicious timing
- device relationships
- payment-source relationships
- withdrawal-account relationships
- impossible game events
- bot-like timing
- account creation bursts
- unusual financial velocity

A single signal should not automatically equal guilt.

---

# 32. COLLUSION / WIN-TRADING

Explicitly prohibit:

> deliberately losing or manipulating games to transfer coins to another account.

If suspicious:

```text
FLAG
↓
PROTECT FINANCIAL STATE
↓
REVIEW
↓
DECISION
```

Do not automatically confiscate user money solely because an algorithm produced a risk score.

---

# 33. MULTIPLE ACCOUNTS

One person should have one financial identity.

Detection should combine:

- verified identity
- payment instruments
- payout accounts
- device risk
- account relationships
- gameplay relationships
- timing
- financial patterns

Do not use IP address alone as proof.

---

# 34. BOT / CLIENT MANIPULATION

Paid games must be server-authoritative.

The server should reject:

- impossible moves
- impossible timestamps
- invalid state transitions
- duplicate action sequences
- illegal scoring
- impossible results

Do not depend on client-side JavaScript anti-cheat.

---

# 35. ADMIN SECURITY

Existing roles:

```text
Super Admin
Admin
Developer
Moderator
Support
Analyst
```

Keep the existing role architecture.

Add financial permissions separately.

Recommended:

### Finance reviewer

Can review:

- payment reconciliation
- withdrawal queues
- financial disputes

Cannot directly alter game results.

### Game moderator

Can review:

- matches
- cheating reports
- quiz disputes

Cannot directly credit coins.

### Support

Can:

- view relevant transaction information
- open support cases

Cannot:

- credit redeemable coins
- approve large payouts
- edit balances

### Super Admin

Can perform exceptional financial administration subject to:

- authorization
- audit
- dual approval for significant adjustments

---

# 36. NO DIRECT BALANCE EDIT

Do not create a UI like:

```text
User balance: [5000]
Save
```

Instead:

```text
Adjustment request
↓
Reason
↓
Evidence/reference
↓
Authorization
↓
Ledger adjustment
```

---

# 37. AUDIT LOG

Every sensitive action must record:

- actor
- actor role
- action
- target
- timestamp
- reason
- old state/reference
- new state/reference
- correlation ID
- IP/device metadata only where appropriate and lawful
- related transaction ID

Audit records should be append-only to the extent practical.

---

# 38. CORRELATION IDS

A single financial journey should be traceable.

Example:

```text
CORR-ABC123
↓
Purchase request
↓
Payment
↓
Verification
↓
Coin issuance
↓
Match
↓
Settlement
↓
Withdrawal
```

Searching the correlation ID should reconstruct the chain.

---

# 39. PUBLIC USER TRANSACTION HISTORY

Users should be able to see their own:

- purchases
- coin credits
- stakes
- wins
- losses
- fees
- rewards
- withdrawals
- refunds
- reversals
- pending transactions
- locked balances

No unexplained balance changes.

---

# 40. FINANCIAL AUDIT EXPORT

Team should eventually be able to export a period report containing:

```text
Opening balance/liability
Deposits
Coin issuance
Competition stakes
Competition fees
Winnings
Creator prizes
Leaderboard rewards
Withdrawal requests
Withdrawal settlements
Withdrawal fees
Refunds
Reversals
Administrative adjustments
Closing balances/liabilities
Unmatched payments
Pending payouts
Restricted funds
```

Exports should include IDs rather than exposing unnecessary private data.

---

# 41. PRIVACY

The current project uses Supabase and stores authenticated state.

The new financial system should minimize personal data.

Do not store full bank details in every transaction row.

Prefer:

- encrypted sensitive account data where needed
- masked display
- provider reference IDs
- controlled access

The system should follow Nigerian data-protection requirements, including purpose limitation, data minimization, security and appropriate retention.

---

# 42. IMPORTANT LEGAL/REGULATORY PRODUCTION NOTE

Do not modify the UI to falsely claim:

> "This is definitely not betting/gaming and needs no licence."

The product is intentionally a skill-based two-player staked competition, but current FCT-LRO material explicitly covers:

- Interactive Gaming
- Mobile/Web gaming
- Emerging Markets
- games of skill where prizes come from a player pool

The FCT-LRO currently states that operators must obtain applicable licences/permits before engaging in gaming activity and publishes approved interactive operators.

Therefore:

### Build the complete production-capable engine.

But maintain an operational activation gate:

```text
REAL_MONEY_ENGINE = BUILT
REAL_MONEY_MODE = CONFIGURABLE
```

Do not switch the public real-money operation on until the owner has completed the applicable regulatory/provider requirements.

This is not a fake/demo requirement; it is a deployment/authorization gate.

---

# 43. REAL-MONEY MODE

Implement a server-side feature configuration such as:

```text
real_money_enabled
competitive_mode_enabled
withdrawals_enabled
purchases_enabled
leaderboard_rewards_enabled
```

Do not rely on frontend-only flags.

A malicious user must not be able to enable financial functionality by editing JavaScript.

---

# 44. PAYMENT PROVIDER ARCHITECTURE

The payment layer must be provider-agnostic.

Create an interface such as:

```text
PaymentProvider
├── createPurchaseIntent()
├── verifyIncomingPayment()
├── reconcileTransaction()
├── initiatePayout()
├── verifyPayout()
└── handleWebhook()
```

The first provider can be whatever the owner ultimately selects.

Do not hard-wire the entire coin engine to one bank/payment provider.

This allows later migration without rewriting the ledger.

---

# 45. BANK-TRANSFER-FIRST DESIGN

The owner wants Nigerian bank-transfer support and initially prefers a low/no-cost setup.

Therefore the architecture should support:

```text
User transfer
↓
Provider/bank transaction feed
↓
Backend ingestion
↓
Reconciliation
↓
Purchase confirmation
↓
Coin issuance
```

If a provider cannot supply a reliable incoming transaction feed, do not pretend Gmail/localStorage is a secure payment gateway.

A Gmail notification can be an auxiliary operational signal where permitted, but it must not become the sole security boundary for money.

---

# 46. EMAIL/GMAIL PAYMENT ALERTS

If an email-based transaction feed is eventually used:

- parse it server-side
- authenticate the source
- store raw event/reference safely
- deduplicate
- normalize transaction fields
- match against purchase requests
- require sufficient confidence
- send ambiguous records to manual review

Never allow a user to manufacture an email alert or browser-local transaction record that the backend treats as verified.

---

# 47. DATABASE DESIGN — RECOMMENDED NEW TABLES

Create a new financial migration rather than modifying the archived `supabase/schema.sql` directly.

Recommended tables:

### `paragon_coin_accounts`

One row per user financial account.

Fields:

- user_id
- available_coins
- locked_coins
- pending_coins
- restricted_coins
- status
- created_at
- updated_at

Balances should be derived/reconciled against the ledger.

---

### `paragon_coin_ledger`

Immutable financial events.

---

### `paragon_payment_intents`

User purchase requests.

---

### `paragon_payment_events`

Provider/bank transaction events.

---

### `paragon_payment_matches`

Reconciliation decisions.

---

### `paragon_competitions`

Competition/match records.

---

### `paragon_competition_participants`

One row per player.

---

### `paragon_competition_events`

Server-authoritative game events where required.

---

### `paragon_competition_settlements`

Settlement record and fee calculation.

---

### `paragon_creator_prizes`

Creator-funded quiz prizes.

---

### `paragon_leaderboards`

Leaderboard periods.

---

### `paragon_leaderboard_entries`

User ranking snapshots/results.

---

### `paragon_rewards`

Reward issuance records.

---

### `paragon_withdrawals`

Withdrawal requests and payout status.

---

### `paragon_payout_accounts`

Verified payout destinations.

---

### `paragon_financial_cases`

Payment/withdrawal/fraud/dispute cases.

---

### `paragon_audit_log`

Append-only sensitive operational audit.

---

### `paragon_risk_flags`

Risk events and review states.

---

### `paragon_economic_settings`

Server-controlled configurable limits/rates.

---

### `paragon_feature_flags`

Production activation controls.

---

# 48. DATABASE SECURITY

All financial tables must use Supabase Row Level Security.

### User access

A normal user may:

- read their own account
- read their own transaction history
- create permitted purchase/withdrawal requests through controlled APIs

A normal user must NOT be able to:

- directly insert arbitrary positive ledger entries
- directly settle a competition
- change a payment from pending to confirmed
- mark their own withdrawal as paid
- award themselves leaderboard rewards

Prefer controlled RPC/Edge Function/server operations for money-moving actions.

---

# 49. SERVICE-ROLE KEY

If Supabase Edge Functions are used:

- service-role key stays in server secrets
- never put service-role key in `config/supabase.js`
- never put provider secrets in browser code
- never commit `.env` secrets

The existing public Supabase anon key can remain public because it is intended for browser use; RLS must enforce security.

---

# 50. API/EDGE FUNCTION LAYER

Implement server-side operations conceptually like:

```text
POST /functions/v1/coin-create-purchase
POST /functions/v1/coin-confirm-payment
POST /functions/v1/coin-reconcile-payment
POST /functions/v1/competition-create
POST /functions/v1/competition-join
POST /functions/v1/competition-action
POST /functions/v1/competition-settle
POST /functions/v1/quiz-create-paid
POST /functions/v1/quiz-start-paid
POST /functions/v1/quiz-submit
POST /functions/v1/withdrawal-create
POST /functions/v1/withdrawal-process
POST /functions/v1/withdrawal-reconcile
POST /functions/v1/leaderboard-settle
POST /functions/v1/admin-financial-adjustment
```

The exact URL naming can follow the existing project conventions.

---

# 51. CLIENT ARCHITECTURE AFTER MIGRATION

The frontend should stop treating:

```text
accountProfile.coinBalance
```

as the authoritative financial balance.

Instead:

```text
Server financial account
↓
Authenticated fetch
↓
Cached display state
↓
UI
```

`coinBalance()` may remain as a compatibility/display function, but it should read from the server-synced account state.

---

# 52. LOCALSTORAGE MIGRATION

Existing keys:

```text
paragonTeamCoinRequests.v1
paragonArchive.coinCredits.v1
```

must not remain the authoritative financial mechanism.

Migration plan:

1. Detect legacy records.
2. Mark them as legacy/pending migration.
3. Do not automatically convert unverified local claims into redeemable money.
4. Only server-verified transactions can become financial ledger entries.
5. Preserve legacy records for audit where useful.

---

# 53. ACCOUNT MIGRATION

Existing authenticated state lives in:

`paragon_user_state`

Do not destroy this.

Add financial state separately so that:

- general profile/preferences remain compatible
- financial data is not casually editable as JSON
- financial RLS can be stricter
- reconciliation can occur independently

---

# 54. TEAM DESK INTEGRATION

Add a dedicated financial section to the consolidated Team desk.

Suggested panels:

```text
Financial Overview
Payment Reconciliation
Coin Purchases
Withdrawals
Competitions
Leaderboard Rewards
Creator Prizes
Fraud/Risk
Disputes
Audit Log
Financial Reports
Economic Settings
Emergency Controls
```

Do not overload the existing general Settings coin prototype.

---

# 55. TEAM ROLE RULES

Add explicit financial permissions to the existing permission matrix.

Example:

| Action | SA | Admin | Finance | Developer | Moderator | Support | Analyst |
|---|---:|---:|---:|---:|---:|---:|---:|
| View financial dashboard | ✓ | ✓ | ✓ | — | — | limited | ✓ |
| Review payments | ✓ | ✓ | ✓ | — | — | limited | read |
| Approve normal payout | ✓ | ✓ | ✓ | — | — | — | — |
| Financial adjustment request | ✓ | ✓ | ✓ | — | — | — | — |
| Final high-value adjustment | dual approval | dual approval | dual approval | — | — | — | — |
| View fraud cases | ✓ | ✓ | ✓ | — | ✓ | limited | — |
| Modify game outcome | ✓ | ✓ | — | — | ✓ | — | — |
| View audit log | ✓ | ✓ | ✓ | limited | limited | limited | ✓ |

The exact role list can be adapted to the project's existing six-role model. If a new Finance role is introduced, update the permission law and all role fixtures together.

---

# 56. SUPPORT DISPUTES

Users need a:

> "Report a problem"

action on relevant transactions.

The support case should automatically include:

- transaction ID
- user ID
- amount
- status
- payment reference
- competition/match reference
- withdrawal reference
- timestamps
- relevant audit references

Support should not need to manually reconstruct the case.

---

# 57. USER APPEALS

A serious financial restriction must have an appeal path.

Do not tell users:

> "Your money is gone."

without a documented reason and process.

A risk flag can temporarily restrict a financial action while the case is reviewed.

---

# 58. ACCOUNT TAKEOVER

Protect high-risk actions when:

- new device
- password reset
- email change
- payout account change
- unusual login
- sudden large withdrawal

A suspicious combination can trigger additional verification or a temporary withdrawal hold.

---

# 59. TRANSACTION VELOCITY

Monitor unusual patterns such as:

- many deposits in a short period
- rapid deposit → competition → withdrawal cycles
- repeated payout attempts
- repeated payment claims
- sudden high-value activity after account creation

These are risk signals, not automatic proof of fraud.

---

# 60. RESERVE / LIABILITY MONITOR

Create a dashboard metric:

```text
Redeemable user liability
Liquid reserve
Reserve coverage ratio
Pending withdrawals
Pending deposits
Restricted funds
Reward reserve
```

Conceptually:

```text
Reserve Coverage Ratio =
liquid reserve / redeemable liability
```

The owner should see warnings when reserve coverage becomes weak.

Do not automatically call 100% "safe" without considering timing, provider costs and actual liquidity; treat it as a basic monitoring ratio.

---

# 61. REWARD RESERVE

Weekly leaderboard rewards must come from an actual funded allocation.

Example:

```text
Eligible competition fees this week = ₦50,000

Leaderboard allocation = 30%

Reward pool = ₦15,000
```

Do not create ₦100,000 of redeemable rewards from ₦50,000 of revenue.

---

# 62. ACCOUNTING SEPARATION

Keep separate concepts:

### User liability

Redeemable coins owed to users.

### Platform revenue

Competition fees and applicable withdrawal fees.

### Expenses

Payment costs, payout costs, hosting, fraud losses, refunds, etc.

### Reward reserve

Amount intentionally allocated for leaderboard rewards.

Do not mix them into one "cash balance."

---

# 63. TRANSACTION EXAMPLE

Example:

```text
User A buys ₦1,000
→ +1,000 redeemable coins

User A stakes 500
→ 500 locked

User B stakes 500
→ 500 locked

Gross pool = 1,000

5% fee = 50

Winner receives = 950

Platform revenue = 50
```

The winner's 950 remains redeemable user liability.

The 50 is platform competition revenue.

---

# 64. WITHDRAWAL EXAMPLE

User has:

> 12,000 available coins.

Requests:

> ₦10,000 withdrawal.

Fee:

> 50 coins.

Ledger:

```text -10,000 redeemable withdrawal
 -50 withdrawal fee
```

Bank payout:

> ₦10,000

Remaining:

> 1,950 coins.

---

# 65. TESTING REQUIREMENTS

The agent must add tests for:

### Account rules

- guest cannot purchase
- guest cannot stake
- guest cannot withdraw
- guest earns no competitive points
- logged-in free play earns no points
- login alone earns no points
- Google/Gmail login alone earns no points
- only eligible staked results earn points

### Coin

- cannot overspend
- cannot spend locked coins
- cannot spend restricted coins
- cannot create coins from client-only calls
- duplicate credit prevented
- reversal works
- balance reconciliation works

### Payment

- duplicate payment
- mismatched amount
- underpayment
- excess payment
- delayed confirmation
- duplicate webhook
- payment reversal
- idempotent retry

### Competition

- stake lock
- insufficient balance
- concurrent staking
- correct fee
- correct winner
- draw
- cancellation
- disconnect
- crash/void
- duplicate settlement
- impossible result rejection

### Quiz

- free quiz
- paid quiz
- creator cannot win
- creator cannot earn points
- answer leakage protection
- server-side scoring
- immutable paid quiz

### Withdrawal

- below ₦10,000 has no Paragon fee
- ₦10,000 exactly has 50-coin fee
- above ₦10,000 has 50-coin fee
- insufficient balance
- locked balance
- daily limit
- weekly limit
- payout timeout
- payout reversal
- duplicate payout protection

### Security

- unauthorized ledger insertion
- unauthorized reward
- unauthorized payout completion
- admin role restrictions
- replay attack
- idempotency
- race conditions

---

# 66. MANUAL TEST SCENARIOS

The agent must provide a manual QA checklist.

At minimum:

### Scenario A — Free guest

```text
Open Paragon
↓
Continue as Guest
↓
Open game
↓
Play free
↓
Finish
↓
Leaderboard points = 0
```

### Scenario B — Logged-in free user

```text
Sign in
↓
Play free
↓
Finish
↓
Leaderboard points remain 0
```

### Scenario C — Purchase

```text
Account
↓
Buy coins
↓
Payment request
↓
Verified payment
↓
Coins credited
↓
Transaction appears
```

### Scenario D — Competitive match

```text
A stakes
↓
B stakes
↓
Both locked
↓
Game
↓
Server result
↓
5% fee
↓
Winner credited
↓
Leaderboard points
```

### Scenario E — Withdrawal

```text
Eligible balance
↓
Withdrawal request
↓
Risk/eligibility
↓
Fee calculation
↓
Payout
↓
Provider confirmation
↓
Ledger settled
```

### Scenario F — Failure

```text
Payment confirmed
↓
server crash
↓
restart
↓
reconciliation
↓
exactly one coin credit
```

---

# 67. SECURITY TEST: NEVER TRUST THE CLIENT

Attempt to modify:

```text
coinBalance
stake
winner
leaderboardPoints
withdrawalStatus
paymentStatus
```

in browser DevTools.

Expected:

> no unauthorized financial effect.

---

# 68. DEPLOYMENT REQUIREMENTS

Before production:

- Supabase production project
- production database migration
- RLS enabled and tested
- server/Edge Functions deployed
- payment provider configured
- webhook endpoint configured
- webhook signature verification enabled where provider supports it
- server secrets configured
- backup strategy active
- monitoring active
- error logging active
- real domain/HTTPS
- production feature flags configured
- responsible gaming/legal pages published
- financial terms published
- privacy documentation updated
- applicable regulatory/provider requirements completed

---

# 69. SECRETS THE AGENT MUST ASK THE OWNER FOR LATER

Do not ask the owner to paste all secrets into chat or source code.

Request them only when the relevant implementation phase is ready.

Potential later inputs:

### Payment

- selected provider
- business/merchant account details
- API credentials
- webhook secret
- payout credentials

### Supabase

- project configuration
- Edge Function deployment access
- server-side secret configuration

### Email

- transactional email provider credentials if required

### Payout

- verified business payout account
- provider configuration

### Regulatory

- company information
- permit/licence information
- required compliance documents

The agent should explain exactly:

> what is needed, why it is needed, where it is stored, and how to keep it out of Git/source code.

---

# 70. DO NOT ASK FOR SECRETS BEFORE THEY ARE NEEDED

The agent should work in phases.

Suggested:

```text
PHASE 1
Code audit + database migration design

PHASE 2
Ledger + account state

PHASE 3
Purchase/reconciliation engine

PHASE 4
Competition engine

PHASE 5
Quiz integration

PHASE 6
Leaderboards/rewards

PHASE 7
Withdrawal engine

PHASE 8
Team financial desk

PHASE 9
Security/anti-abuse

PHASE 10
Testing/reconciliation

PHASE 11
Provider integration

PHASE 12
Production readiness
```

Only request external credentials when that phase begins.

---

# 71. EXISTING PROJECT FILES TO MODIFY/EXTEND

Likely areas, subject to final agent inspection:

### Main app

- `app.js`
- `style.css`
- `paragon-archive.html`

### Auth/state

- `auth/supabase-auth.js`
- `auth/paragon-sync.js`

### Config

- `config/supabase.js`

### Quiz

- `paragon-quiz/js/quiz.js`
- relevant quiz HTML/CSS

### Team

- `team/desk.html`
- `team/team-pages.js`
- `team/permissions.js`
- `team/nav.js`

### Database

Create a new financial migration, for example:

```text
supabase/coin-system-schema.sql
```

Do not blindly rerun the archived `supabase/schema.sql`.

### Server functions

Create an organized financial function area, for example:

```text
supabase/functions/coin-*/
supabase/functions/competition-*/
supabase/functions/withdrawal-*/
```

The exact structure can follow existing project conventions.

---

# 72. DOCUMENTATION TO UPDATE

After implementation:

- `docs/COIN-SYSTEM.md`
- `docs/CHANGES.md`
- `docs/NEXT-AGENT.md` where appropriate
- deployment documentation
- privacy/terms documentation
- new financial runbook
- payment reconciliation runbook
- incident response runbook

The project already has a convention of maintaining these documents and regression fixtures. Preserve it.

---

# 73. LEGACY COIN SYSTEM MIGRATION

The existing prototype uses:

```text
paragonTeamCoinRequests.v1
paragonArchive.coinCredits.v1
accountProfile.coinBalance
accountProfile.coinHistory
```

Migration must be safe.

### Important:

A localStorage approval record is NOT sufficient evidence of real payment.

For pre-production/test users, the agent may create explicitly labeled migration/test data.

For production redeemable value:

> only independently verified financial records become redeemable ledger entries.

---

# 74. FEATURE FLAG SAFETY

Use server-controlled flags.

Example:

```text
competition_enabled
purchases_enabled
withdrawals_enabled
leaderboards_enabled
creator_paid_quizzes_enabled
```

A frontend user cannot enable these by editing localStorage.

---

# 75. OBSERVABILITY

Track:

- payment processing latency
- payment reconciliation failures
- duplicate events
- settlement failures
- withdrawal failures
- ledger discrepancies
- unusual balance mismatches
- risk flags
- provider errors
- webhook failures

Create alerts for critical financial failures.

---

# 76. RECONCILIATION JOBS

Create periodic reconciliation jobs for:

### Payment reconciliation

Provider/bank transactions vs Paragon purchase records.

### Coin reconciliation

User balance snapshot vs ledger sum.

### Match reconciliation

Competition state vs settlement ledger.

### Withdrawal reconciliation

Payout provider state vs Paragon withdrawal state.

### Reward reconciliation

Leaderboard reward records vs ledger.

Any mismatch becomes:

> `RECONCILIATION_EXCEPTION`

not an invisible correction.

---

# 77. BACKUPS

Financial data must be backed up independently from ordinary frontend localStorage.

At minimum:

- database backup
- recovery procedure
- restore testing
- audit-log preservation

A backup is not considered reliable until a restore has been tested.

---

# 78. INCIDENT RESPONSE

When financial integrity is uncertain:

```text
1. Pause affected financial operation
2. Preserve logs
3. Preserve provider references
4. Identify affected transactions
5. Reconcile
6. Correct through ledger entries
7. Review user impact
8. Resume only after verification
```

Do not "fix" the database manually without recording what was changed.

---

# 79. PUBLIC USER COMMUNICATION

When a financial incident occurs, don't invent reassuring claims.

Use honest statuses such as:

> "Payment verification is temporarily delayed. Your transfer has been recorded and is being reconciled."

or:

> "Withdrawals are temporarily paused while we verify a payment-provider issue."

The project already has an explicit honesty-first design principle. Preserve it.

---

# 80. FINAL ACCEPTANCE CRITERIA

The financial system is not considered complete until all of these are true:

- [ ] Guest can play free only
- [ ] Guest cannot stake
- [ ] Guest cannot purchase
- [ ] Guest cannot withdraw
- [ ] Guest cannot earn competitive points
- [ ] Logged-in free users earn no competitive points
- [ ] Login alone earns no competitive points
- [ ] Google/Gmail login alone earns no competitive points
- [ ] Only eligible staked competitions generate competitive points
- [ ] Coin balance is server authoritative
- [ ] Ledger is append-only
- [ ] No direct balance editing
- [ ] Payment claims cannot create money
- [ ] Duplicate payments cannot double-credit
- [ ] Duplicate webhooks cannot double-credit
- [ ] Race conditions cannot overspend
- [ ] 5% competition fee is server calculated
- [ ] Match failure can refund/void safely
- [ ] Creator cannot win own paid quiz
- [ ] Creator cannot farm own quiz leaderboard points
- [ ] Paid quiz answers/results are server protected
- [ ] Weekly leaderboard rewards are funded
- [ ] Withdrawal ≥ ₦10,000 charges 50 coins
- [ ] Withdrawal < ₦10,000 has no Paragon fee
- [ ] Withdrawal limits work
- [ ] Payouts are idempotent
- [ ] Payout timeout cannot cause double payment
- [ ] Direct coin transfer is disabled
- [ ] Admin financial actions are audited
- [ ] High-value adjustments require dual approval
- [ ] Fraud restrictions are reversible through review/appeal
- [ ] Audit export works
- [ ] Reconciliation jobs work
- [ ] Emergency financial pause works
- [ ] Per-game kill switch works
- [ ] Backups/recovery procedure exists
- [ ] All financial tests pass
- [ ] Existing Paragon regression suites remain green
- [ ] New financial fixtures pass
- [ ] No secrets are committed
- [ ] Production feature flags are server-controlled

---

# 81. OWNER INPUTS STILL NEEDED

Do not block the code audit waiting for all of these.

The agent should first build the provider-independent financial engine.

Later, the owner will need to decide/provide:

### Economic configuration

- [ ] Final coin purchase pack sizes
- [ ] Final purchase rate
- [ ] Minimum purchase
- [ ] Minimum withdrawal
- [ ] Any maximum withdrawal
- [ ] Exact leaderboard scoring algorithm per game
- [ ] Final reward distribution if changed

### Payment

- [ ] Selected Nigerian payment/bank provider
- [ ] Incoming transaction feed method
- [ ] Payout method
- [ ] Provider credentials

### Compliance

- [ ] Business/legal entity information
- [ ] Applicable gaming permit/licence information
- [ ] Responsible gaming policy
- [ ] KYC/AML requirements
- [ ] Privacy/compliance requirements

### Infrastructure

- [ ] Production Supabase configuration
- [ ] Edge Function deployment
- [ ] Production domain
- [ ] Error/monitoring setup

---

# 82. IMPORTANT: DO NOT BLOCK THE OWNER WITH A GIANT QUESTION LIST

If something is not needed for the current phase, use a safe placeholder/configuration interface.

The agent should say:

> "I have completed Phase 1. Before Phase 2 provider integration, I need X."

Then explain X.

Do not ask the owner for:

- payment API keys
- bank credentials
- deployment secrets
- private keys

until the implementation actually needs them.

---

# 83. FINAL AGENT WORKFLOW

The agent should follow this order:

```text
READ THIS DOCUMENT
        ↓
READ THE EXISTING REPOSITORY
        ↓
DO NOT REBUILD EXISTING PARAGON
        ↓
AUDIT CURRENT COIN/AUTH/QUIZ/TEAM CODE
        ↓
WRITE IMPLEMENTATION PLAN
        ↓
CREATE FINANCIAL DATABASE MIGRATION
        ↓
CREATE SERVER-AUTHORITATIVE LEDGER
        ↓
CREATE PAYMENT RECONCILIATION
        ↓
CREATE COMPETITION ENGINE
        ↓
INTEGRATE QUIZ
        ↓
CREATE LEADERBOARD
        ↓
CREATE WITHDRAWALS
        ↓
CREATE TEAM FINANCIAL DESK
        ↓
CREATE ANTI-ABUSE/RISK LAYER
        ↓
CREATE AUDIT/RECONCILIATION
        ↓
ADD TESTS
        ↓
RUN ALL EXISTING TESTS
        ↓
RUN FINANCIAL TESTS
        ↓
REPORT REMAINING OWNER INPUTS
        ↓
PRODUCTION READINESS CHECK
```

---

# 84. DO NOT DECLARE SUCCESS TOO EARLY

The agent must not say:

> "Paragon Coins is complete"

because the UI works.

It is complete only when:

> **payment, ledger, competition, rewards, withdrawal, reconciliation, security, auditability and tests all work together.**

A pretty coin balance is not a financial system.

---

# 85. SOURCE/REPOSITORY NOTES

The implementation should preserve the current project's existing identity/documentation conventions and regression philosophy.

Important current files:

- `docs/COIN-SYSTEM.md` — original P-098 coin design
- `docs/NEXT-AGENT.md` — agent/build conventions
- `docs/SOP.md` — project decisions
- `docs/EOP.md` — project history
- `app.js` — main app and current coin core
- `auth/supabase-auth.js` — authentication
- `auth/paragon-sync.js` — shared authenticated state
- `config/supabase.js` — public Supabase browser configuration
- `supabase/schema.sql` — archived/executed schema reference
- `paragon-quiz/js/quiz.js` — current quiz engine
- `team/team-pages.js` — Team desk modules including current coin request desk
- `team/permissions.js` — Team permission law
- `team/session.js` — Team session guard
- `tests/*.test.js` — existing regression suites

---

# 86. REGULATORY NOTE FOR THE BUILD AGENT

This specification is an engineering document, not legal advice.

Current FCT-LRO published material states that it regulates interactive/mobile gaming and emerging gaming categories, and its emerging-market description includes games of lot, chance or skill where prizes are distributed from a player pool. It also states that operators must obtain applicable licences/permits before engaging in gaming activity.

Therefore the agent must:

- build accurate transaction/audit records
- support age/responsible-gaming controls
- support KYC/AML-related extensibility
- support regulatory reporting/audit export
- avoid misleading "not gaming" claims
- keep real-money activation server-controlled

The owner should obtain current professional/legal/regulatory confirmation before public real-money operation.

---

# 87. REPOSITORY AUDIT RESULT

The existing project is **not starting from zero**.

The current coin prototype already provides:

```text
Account coin display
Coin shop
Purchase request concept
Team approval concept
Credit mirror concept
Client coin balance
Coin history
```

But the audit identifies the major architectural gap:

> **The current financial state is client/localStorage based and must be replaced as the authoritative source with a server-side ledger and transaction engine.**

The current Paragon Quiz similarly provides a real free-play engine but uses localStorage for quiz definitions/results. Paid competitive quiz functionality therefore needs a server-authoritative layer rather than simply adding a "coin cost" to the existing client-side play button.

The existing Supabase authentication and shared user-state foundation can be reused rather than replaced.

---

# 88. THE CENTRAL DESIGN PRINCIPLE

Everything ultimately follows this rule:

> **If a user can convert something into real Nigerian naira, the server must be able to explain exactly where that value came from, why the user owns it, how it moved, and why the final payout was authorized.**

That is the standard the agent should build to.

---

# 89. END STATE

The completed Paragon Coins system should behave like:

```text
                         PARAGON ARCHIVE
                               │
                    ┌──────────┴──────────┐
                    │                     │
                  FREE                 ACCOUNT
                    │                     │
              play normally       financial eligibility
                    │                     │
              no points                 coins
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                           PURCHASE              COMPETITION
                              │                       │
                           payment                 stake
                              │                       │
                         verification             lock
                              │                       │
                           ledger                 game
                                                      │
                                                  result
                                                      │
                                             ┌────────┴────────┐
                                             │                 │
                                          winner             fee
                                             │                 │
                                          coins             revenue
                                             │
                                      leaderboard
                                             │
                                          rewards
                                             │
                                        withdrawal
                                             │
                                      ₦ payout
                                             │
                                      reconciliation
```

Every arrow must have an auditable transaction behind it.

**End of Master Build Specification.**
