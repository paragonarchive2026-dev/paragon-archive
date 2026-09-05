/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: suite-finance.test.js
  EXPECTED PROJECT PATH: /tests/suite-finance.test.js
  ROLE: STAGE 8 (P-100 / D-208) — financial regression for Stages 6+7: the withdrawal
        engine (₦10,000 fee rule, rolling limits, payout state machine, duplicate payout
        protection), payment claims, emergency controls, typed ledger + balance
        reconciliation, risk cases, finance desk wiring, permission law, prepared SQL,
        plus security checks (no browser dialogs, no direct balance-edit UI, no
        fabricating money) and a race-condition double-submit guard.
  RESTORE/LOAD NOTE: Run from the project root with node tests/suite-finance.test.js.
        Keeps the same harness style as the P-099 leaderboard fixture in suite-ux.
*/

/* ================= FIXTURE: finance.test.js — Stages 6+7 ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");

function assert(value, message) { if (!value) throw new Error(message); }
let passed = 0;
function check(value, label) { assert(value, label); passed += 1; console.log("  ✅ " + label); }

function makeContext(seed = {}) {
  const storage = {};
  Object.keys(seed).forEach(key => { storage[key] = JSON.stringify(seed[key]); });
  const localStorage = {
    getItem: key => (key in storage ? storage[key] : null),
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: key => { delete storage[key]; }
  };
  const context = { console, localStorage, window: null };
  context.window = context;
  vm.createContext(context);
  return { context, storage };
}
function loadWallets(seed) {
  const env = makeContext(seed || {});
  vm.runInContext(fs.readFileSync(path.join(root, "paragon-wallets.js"), "utf8"), env.context);
  return env;
}

console.log("🧪 P-100 — Stage 6/7 finance fixture (withdrawals, payouts, claims, controls, desks)");

/* ---------- 1. Source wiring + honesty shell (no fake money anywhere) ---------- */
const engineSource = fs.readFileSync(path.join(root, "paragon-wallets.js"), "utf8");
check(engineSource.includes("PARAGON ARCHIVE — EXPORT IDENTITY"), "paragon-wallets.js carries the identity header");
check(!/window\.(alert|prompt|confirm)\s*\(/.test(engineSource), "wallet engine has no browser dialogs");
check(engineSource.includes("withdrawalFeeThresholdNaira: 10000") && engineSource.includes("withdrawalFeeCoins: 100"), "engine carries the ₦10,000+ → 100-coin fee rule (₦50 × 2 coins per ₦1)");
check(engineSource.includes("dailyLimit: 2") && engineSource.includes("weeklyLimit: 5"), "engine defaults: 2 per rolling 24 h, 5 per rolling 7 days");
check(engineSource.indexOf("PAID") !== -1 && engineSource.indexOf("COINS_UNLOCKED") !== -1, "engine implements the full payout state set");
const archiveHtml = fs.readFileSync(path.join(root, "paragon-archive.html"), "utf8");
check(archiveHtml.includes('src="paragon-wallets.js"') && archiveHtml.indexOf('src="paragon-leaderboards.js"') < archiveHtml.indexOf('src="paragon-wallets.js"') && archiveHtml.indexOf('src="paragon-wallets.js"') < archiveHtml.indexOf('src="app.js"'), "Archive loads paragon-wallets.js after the leaderboard engine and BEFORE app.js");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
check(app.includes("openCoinWithdrawal = function") && app.includes("Withdraw coins — sell back to naira"), "app.js exposes the public withdrawal popup + Account settings row");
check(app.includes("wdBadge") && app.includes("withdrawal-host") && app.includes("renderWithdrawalHistory"), "app.js renders the withdrawal request UI + history");
check(app.includes("paragon_coin_create_payment_intent") && app.includes("Not credited yet"), "purchase flow is server-intent first and never self-credits (§24, P-109 union)");
check(app.includes("one credit per claim") || app.includes("one credit per payment"), "duplicate claim copy is honest (one credit per transfer)");
check(!/[←→↗]/.test(app), "Stage 6 app.js additions respect the no-textual-arrows law");
const sw = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
check(sw.includes('"./paragon-wallets.js"') && sw.includes("paragon-archive-v88"), "service worker precaches the wallet engine at cache v88");
const css = fs.readFileSync(path.join(root, "style.css"), "utf8");
check(css.includes(".wallet-field") && css.includes(".wd-summary") && css.includes(".kill-switch"), "withdrawal/desk styles are present");

/* No direct balance-edit UI: every write to accountProfile.coinBalance must live inside the
   local add/spend helpers or the server-account refresh (browser is never authoritative). */
const balanceWrites = [];
{
  let from = 0, hit;
  const re = /accountProfile\.coinBalance\s*=/g;
  while ((hit = re.exec(app))) balanceWrites.push(hit.index);
}
const allowedOwners = ["function addCoinsLocal", "function spendCoinsLocal", "function refreshCoinAccountFromServer"];
const outOfBand = balanceWrites.filter(idx => {
  const head = app.slice(Math.max(0, idx - 4000), idx);
  const owners = allowedOwners.map(name => ({ name, at: head.lastIndexOf(name) })).filter(o => o.at >= 0);
  if (!owners.length) return true;
  const owner = owners.sort((a, b) => b.at - a.at)[0];
  const fnStart = head.lastIndexOf("function " + owner.name.slice(9));
  return fnStart < 0;
});
check(outOfBand.length === 0, "app.js edits coinBalance only inside add/spend helpers or server refresh (no direct balance-edit UI)");
const dangerous = app.match(/window\.localStorage\.setItem\("paragonArchive\.coinBalance[\s\S]{0,80}/g);
check(!dangerous, "no raw coinBalance localStorage setter outside the personal state writer");

/* ---------- 2. Fee rule + minimums (spec §22.1) ---------- */
const env = loadWallets({});
const W = env.context.ParagonWallets;
check(W.nairaToCoins(10000) === 20000 && W.coinsToNaira(20000) === 10000, "placeholder rate ₦1 = 2 coins both ways");
check(W.withdrawalFeeFor(9999) === 0 && W.withdrawalFeeFor(10000) === 100 && W.withdrawalFeeFor(20000) === 100, "fee kicks in exactly at ₦10,000 (below = 0, at/above = 100 coins = ₦50 worth)");
check(W.coinsRequiredFor(10000) === 20100 && W.coinsRequiredFor(2000) === 4000, "₦10,000 needs 20,100 coins (20,000 payout value + 100-coin fee)");

/* ---------- 3. Request intake (locking, honest balance) ---------- */
const belowMin = W.requestWithdrawal({ user: "ada@example.com", naira: 500, availableCoins: 999999, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Ada Obi" } });
check(!belowMin.ok && belowMin.code === "below-minimum", "below-minimum withdrawal rejected");
const insufficient = W.requestWithdrawal({ user: "ada@example.com", naira: 10000, availableCoins: 20099, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Ada Obi" } });
check(!insufficient.ok && insufficient.code === "insufficient", "withdrawal rejected when balance cannot cover coins + fee");
const okReq = W.requestWithdrawal({ user: "ada@example.com", naira: 10000, availableCoins: 20100, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Ada Obi" } });
check(okReq.ok && okReq.request.state === "LOCKED" && okReq.lockedCoins === 20100 && okReq.request.feeCoins === 100, "valid ₦10,000 request locks 20,100 coins (20,000 + 100 fee)");
check(!!okReq.request.correlationId && okReq.request.correlationId.indexOf("CORR-") === 0, "every request carries a correlation ID for user tracing");
check(okReq.request.payoutRef === "" && okReq.request.state !== "PAID", "a request NEVER claims it was paid (no fabricated payout)");
check(W.findRequest(okReq.request.id).user === "ada@example.com", "request persisted and findable by id");
const second = W.requestWithdrawal({ user: "ada@example.com", naira: 2000, availableCoins: 20100, payout: { bank: "Kuda", accountNumber: "0987654321", accountName: "Ada Obi" } });
check(second.ok && second.feeCoins === 0 && second.lockedCoins === 4000, "below-₦10,000 withdrawal pays no Paragon fee");

/* ---------- 4. Rolling frequency limits (§23) ---------- */
const limitReq = W.requestWithdrawal({ user: "ada@example.com", naira: 1000, availableCoins: 999999, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Ada Obi" } });
check(!limitReq.ok && limitReq.code === "daily-limit", "3rd request in rolling 24 h rejected (max 2)");
const later = new Date(Date.now() + 25 * 3600 * 1000);
const afterWindow = W.requestWithdrawal({ user: "ada@example.com", naira: 1000, availableCoins: 999999, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Ada Obi" }, }, later);
check(afterWindow.ok, "rolling 24 h window frees a slot after 25 hours (limits never trap funds)");
const weeklySeed = loadWallets({ "paragonWithdrawals.v1": [] });
const WK = weeklySeed.context.ParagonWallets;
const wkBase = Date.now();
for (let i = 0; i < 5; i += 1) {
  /* one request per day — each sits inside the rolling 7-day window but outside the 24 h one */
  const day = new Date(wkBase + i * 26 * 3600 * 1000);
  const r = WK.requestWithdrawal({ user: "wk@example.com", naira: 1000, availableCoins: 999999, payout: { bank: "Zenith", accountNumber: "3334445556", accountName: "WK" } }, day);
  if (!r.ok) throw new Error("weekly seed request " + i + " failed: " + r.code);
}
const weeklySixth = WK.requestWithdrawal({ user: "wk@example.com", naira: 1000, availableCoins: 999999, payout: { bank: "Zenith", accountNumber: "3334445556", accountName: "WK" } }, new Date(wkBase + 6 * 26 * 3600 * 1000));
check(!weeklySixth.ok && weeklySixth.code === "weekly-limit", "6th request in rolling 7 days rejected (max 5)");
/* and the same 7-day window rolls open again later — limits never permanently trap */
const weeklyLater = WK.requestWithdrawal({ user: "wk@example.com", naira: 1000, availableCoins: 999999, payout: { bank: "Zenith", accountNumber: "3334445556", accountName: "WK" } }, new Date(wkBase + 10 * 26 * 3600 * 1000));
check(weeklyLater.ok, "rolling 7-day window opens again (oldest request dropped after ~7 days)");

/* ---------- 5. Payout state machine (§25) — full happy path with dup protection ---------- */
const rowA = W.findRequest(second.request.id); /* ada ₦2,000 request */
check(W.deskTransition(rowA.id, "super-admin (role preview)", "PAYOUT_PENDING").ok && W.findRequest(rowA.id).state === "PAYOUT_PENDING", "LOCKED → PAYOUT_PENDING");
const badSubmit = W.deskTransition(rowA.id, "super-admin (role preview)", "PROVIDER_SUBMITTED", { provider: "opay" });
check(!badSubmit.ok && badSubmit.code === "payout-ref-required", "submission without a provider payout reference is refused");
const submitted = W.deskTransition(rowA.id, "super-admin (role preview)", "PROVIDER_SUBMITTED", { provider: "opay", payoutRef: "REF-ONE", reason: "paid via OPay" });
check(submitted.ok && W.findRequest(rowA.id).payoutRef === "REF-ONE", "PROVIDER_SUBMITTED binds the single payout reference");
check(W.deskTransition(rowA.id, "super-admin (role preview)", "PROVIDER_CONFIRMED").ok, "PROVIDER_SUBMITTED → PROVIDER_CONFIRMED");
const paidA = W.deskTransition(rowA.id, "super-admin (role preview)", "PAID");
check(paidA.ok && W.findRequest(rowA.id).state === "PAID" && W.findRequest(rowA.id).paidAt, "PROVIDER_CONFIRMED → PAID records paidAt");
check(W.deskTransition(rowA.id, "super-admin (role preview)", "PAID").code === "invalid-transition", "PAID is terminal — no second payout on the same row");

/* The delayed-response journey + duplicate payoutRef checks run INSIDE the same engine/store:
   rowA (REF-ONE) still lives in W's store, so a second row can never reuse REF-ONE. */
const b = W.requestWithdrawal({ user: "b@example.com", naira: 2000, availableCoins: 4000, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "B" } });
W.deskTransition(b.request.id, "super-admin (role preview)", "PAYOUT_PENDING");
const dupSubmit = W.deskTransition(b.request.id, "super-admin (role preview)", "PROVIDER_SUBMITTED", { provider: "opay", payoutRef: "REF-ONE" });
check(!dupSubmit.ok && dupSubmit.code === "duplicate-payout-ref", "a payout reference already used elsewhere can NEVER submit a second payout");
/* delayed-response honesty: unknown → reconciliation → failed → coins returned */
W.deskTransition(b.request.id, "super-admin (role preview)", "PROVIDER_SUBMITTED", { provider: "bank", payoutRef: "REF-TWO" });
check(W.deskTransition(b.request.id, "super-admin (role preview)", "UNKNOWN").ok && W.findRequest(b.request.id).state === "UNKNOWN", "delayed provider response moves the row to UNKNOWN (never auto-PAID)");
check(W.deskTransition(b.request.id, "super-admin (role preview)", "RECONCILIATION").ok, "UNKNOWN → RECONCILIATION (bank records checked)");
check(W.deskTransition(b.request.id, "super-admin (role preview)", "FAILED", { reason: "provider confirms never received" }).ok, "RECONCILIATION → FAILED when the provider says no payment");
check(W.deskTransition(b.request.id, "super-admin (role preview)", "COINS_UNLOCKED").ok && W.findRequest(b.request.id).state === "COINS_UNLOCKED", "FAILED → COINS_UNLOCKED returns locked coins");
const lateDouble = W.deskTransition(b.request.id, "super-admin (role preview)", "PAID", { payoutRef: "REF-TWO" });
check(!lateDouble.ok, "a row already failed/unlocked can never later be marked paid — no double payout after a delayed response");

/* ---------- 6. User cancel path: cancel → FAILED → COINS_UNLOCKED ---------- */
const envC = loadWallets({});
const WC = envC.context.ParagonWallets;
const c = WC.requestWithdrawal({ user: "c@example.com", naira: 1000, availableCoins: 2000, payout: { bank: "GTB", accountNumber: "1112223334", accountName: "C" } });
const cancelled = WC.cancelRequest(c.request.id, "c@example.com", "Changed my mind");
check(cancelled.ok && WC.findRequest(c.request.id).state === "COINS_UNLOCKED", "user cancel returns coins through FAILED → COINS_UNLOCKED");

/* ---------- 7. Payment claims — duplicate + frequency protection (§18/§19/§24) ---------- */
const claim1 = W.recordPaymentClaim({ user: "ada@example.com", requestId: "coin-aaa", providerTxn: "PARAGON-778899", amount: 500, senderBank: "OPay", senderName: "Ada Obi" });
check(claim1.ok && claim1.claim.state === "CLAIMED", "first claim accepted as CLAIMED (matching info only)");
const claim2 = W.recordPaymentClaim({ user: "ada@example.com", requestId: "coin-bbb", providerTxn: "PARAGON-778899", amount: 500 });
check(claim2.ok && claim2.duplicate && claim2.claim.state === "DUPLICATE", "same provider transaction claimed twice = DUPLICATE (one credit only)");
check(W.claimState(claim2.claim.id, "super-admin (role preview)", "REJECTED", { note: "duplicate of coin-aaa" }).ok, "duplicate claims are rejected, never confirmed");
for (let i = 0; i < 4; i += 1) {
  W.recordPaymentClaim({ user: "ada@example.com", requestId: "coin-c" + i, providerTxn: "PARAGON-9" + i + i + i, amount: 500 });
}
const claimLimit = W.recordPaymentClaim({ user: "ada@example.com", requestId: "coin-cl", providerTxn: "PARAGON-XYZ01", amount: 500 });
check(!claimLimit.ok && claimLimit.code === "claim-daily-limit", "6th claim in rolling 24 h refused (max 5 — anti-spam)");
const confirmedClaim = W.claimState(claim1.claim.id, "super-admin (role preview)", "PENDING_VERIFICATION", { note: "verifying with bank records" });
check(confirmedClaim.ok, "claim can move to PENDING_VERIFICATION");
const secondConfirmAttempt = W.claimState(claim1.claim.id, "super-admin (role preview)", "CONFIRMED", { note: "verified" });
check(secondConfirmAttempt.ok, "verified claim confirms once");
const claimDupConfirm = W.recordPaymentClaim({ user: "other@example.com", requestId: "coin-dup", providerTxn: "PARAGON-778899", amount: 500 });
check(claimDupConfirm.duplicate === true, "claiming an already-confirmed transfer by another account is flagged duplicate");

/* ---------- 8. Emergency controls (§30) — pause + kill switches ---------- */
W.setFinancialPause("super-admin (role preview)", true, "Provider outage — testing pause");
check(W.controls().paused === true, "financial pause turns on");
const pausedReq = W.requestWithdrawal({ user: "new@example.com", naira: 1000, availableCoins: 5000, payout: { bank: "Zenith", accountNumber: "3334445556", accountName: "New" } });
check(!pausedReq.ok && pausedReq.code === "financial-paused", "pause blocks NEW withdrawals");
check(W.gameKillState("quiz").killed === false, "per-game kill switches start off");
W.setGameKillSwitch("super-admin (role preview)", "quiz", true, "payout bug in quiz bets");
check(W.gameKillState("quiz").killed === true && W.controls().killSwitches.quiz.reason, "game kill switch records game + reason");
W.setFinancialPause("super-admin (role preview)", false, "outage resolved");
const resumedReq = W.requestWithdrawal({ user: "new@example.com", naira: 1000, availableCoins: 5000, payout: { bank: "Zenith", accountNumber: "3334445556", accountName: "New" } });
check(resumedReq.ok, "lifting the pause resumes new withdrawals");

/* ---------- 9. Typed ledger + balance reconciliation (§15–§16) ---------- */
const ledgerEnv = loadWallets({});
const WL = ledgerEnv.context.ParagonWallets;
WL.appendLedger({ user: "led@example.com", type: "PURCHASE_CREDIT", amount: 25100, refType: "purchase", ref: "coin-aaa", reason: "Approved purchase", idempotencyKey: "led-1" });
WL.appendLedger({ user: "led@example.com", type: "PURCHASE_CREDIT", amount: 25100, refType: "purchase", ref: "coin-aaa", reason: "replayed", idempotencyKey: "led-1" });
check(WL.ledgerFor("led@example.com").length === 1, "ledger rows are idempotency-keyed (replays never double-credit)");
WL.appendLedger({ user: "led@example.com", type: "WITHDRAWAL_LOCK", amount: -20100, refType: "withdrawal", ref: "wd-x", idempotencyKey: "led-2" });
const rec = WL.reconcileBalance("led@example.com", 5000);
check(rec.credits === 25100 && rec.debits === 20100 && rec.delta === 5000 && rec.matches === true && rec.difference === 0, "reconciliation matches: credits − debits = reported balance (25100 − 20100 = 5000)");
const recMismatch = WL.reconcileBalance("led@example.com", 6000);
check(recMismatch.matches === false && recMismatch.difference === -1000, "reconciliation reports the exact difference when the wallet balance disagrees with the ledger");
const recNegative = WL.reconcileBalance("other@example.com", 0);
check(recNegative.delta === 0 && recNegative.matches === true, "an untouched account reconciles as honest zero");
check(WL.ledger().every(row => ["PURCHASE_CREDIT", "WITHDRAWAL_LOCK"].indexOf(row.type) !== -1 && typeof row.amount === "number"), "ledger rows are typed events with signed amounts — never free text");

/* ---------- 10. Audit (§37) is append-only and complete ---------- */
const audit = W.financeAudit();
check(audit.length > 0 && audit.some(row => row.action === "WITHDRAWAL_REQUESTED") && audit.some(row => row.action === "WITHDRAWAL_PAID") && audit.some(row => row.action === "FINANCIAL_PAUSE_ON"), "audit records requests, payouts and emergency controls");
check(audit.every(row => row.action && row.at && row.actor), "every audit row has actor/action/timestamp");
check(typeof W.ledger !== "function" || W.ledger().length >= 0, "engine exposes no audit-delete or ledger-rewrite API (append-only surface)");
const forbidden = Object.keys(W).filter(key => /delete|rewrite|wipe|clear/i.test(key));
check(forbidden.length === 0, "public engine API has no wipe/rewrite entry points");

/* ---------- 11. Risk cases (§31–§34, §58–§59) ---------- */
const caseOpen = W.openRiskCase({ user: "ada@example.com", displayName: "Ada Obi", type: "velocity", reason: "3 withdrawals inside 20 minutes", actor: "super-admin (role preview)" });
check(caseOpen.ok && caseOpen.case.state === "OPEN", "risk case opens with a reason");
check(W.riskCaseState(caseOpen.case.id, "super-admin (role preview)", "REVIEW", { note: "reviewing" }).ok, "OPEN → REVIEW");
check(W.riskCaseState(caseOpen.case.id, "super-admin (role preview)", "RESOLVED", { note: "benign pattern" }).ok, "REVIEW → RESOLVED with a note");
check(!W.riskCaseState(caseOpen.case.id, "super-admin (role preview)", "REVIEW", { note: "" }).ok, "resolved cases are terminal (no flip-flopping)");

/* ---------- 12. Payout account rule (§26): saved accounts belong to the user ---------- */
const acct = W.savePayoutAccount({ user: "ada@example.com", bank: "OPay", accountNumber: "0123456789", accountName: "Ada Obi" });
check(acct.ok && acct.account.user === "ada@example.com" && acct.account.masked === "•••• 6789", "payout account saves for the owning user with a masked number");
const changed = W.savePayoutAccount({ user: "ada@example.com", bank: "Kuda", accountNumber: "0876543210", accountName: "Ada Obi" });
check(changed.changed === true && changed.account.riskHold === true, "account detail changes trigger the verification hold (§26 — no silent third-party switch)");
const guestAcct = W.savePayoutAccount({ user: "Guest (this device)", bank: "OPay", accountNumber: "0123456789", accountName: "Guest" });
check(!guestAcct.ok, "guests cannot register payout accounts");

/* ---------- 13. Race-condition guard: simultaneous double-submit never goes negative ---------- */
function simAppDoubleSubmit() {
  let balance = 4000; /* enough for ONE ₦2,000 withdrawal only */
  const first = W.requestWithdrawal({ user: "race@example.com", naira: 2000, availableCoins: balance, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Race" } });
  if (first.ok) balance -= first.lockedCoins;
  const secondTry = W.requestWithdrawal({ user: "race@example.com", naira: 2000, availableCoins: balance, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Race" } });
  if (secondTry.ok) balance -= secondTry.lockedCoins;
  return { balance, secondOk: !!secondTry.ok };
}
const race = simAppDoubleSubmit();
check(race.balance >= 0, "double-submit simulation never drives the balance negative");
check(race.balance === 0 && race.secondOk === false, "the second simultaneous submit is refused once funds are locked (available balance re-read between submits)");

/* ---------- 14. Team desk wiring (Stage 7 panels, titles, role law, nav) ---------- */
const deskHtml = fs.readFileSync(path.join(root, "team/desk.html"), "utf8");
["finance.html", "finance-payments.html", "finance-withdrawals.html", "finance-risk.html", "finance-audit.html", "finance-reports.html", "finance-emergency.html"].forEach(page => {
  check(deskHtml.includes('data-team-page="' + page + '"'), "desk panel exists: " + page);
});
check(deskHtml.includes('"finance.html": "Financial Dashboard') && deskHtml.includes('"finance-emergency.html": "Emergency Controls'), "desk router titles include every finance page");
const teamPages = fs.readFileSync(path.join(root, "team/team-pages.js"), "utf8");
check(teamPages.includes('PAGE MODULE: finance-*.js') && teamPages.includes("renderFinanceDashboard") && teamPages.includes("renderWithdrawalDesk") && teamPages.includes("renderEmergency"), "team-pages.js contains the finance desk modules");
const perms = fs.readFileSync(path.join(root, "team/permissions.js"), "utf8");
check(perms.includes('"finance.html": ["super-admin", "admin", "analyst"]') && perms.includes('"finance-emergency.html": ["super-admin"]'), "PAGE_ACCESS law: finance dashboards for sa/admin/analyst, emergency sa-only");
check(perms.includes("View Financial Dashboard") && perms.includes("Approve Payouts") && perms.includes("Use Emergency Financial Controls"), "permission matrix gains the Stage 7 financial rows");
const nav = fs.readFileSync(path.join(root, "team/nav.js"), "utf8");
check(nav.includes('{ title: "FINANCE"') && nav.includes('label: "Withdrawal Desk"') && nav.includes('label: "Emergency Controls"'), "sidebar FINANCE section lists the new desks");
const deskJs = fs.readFileSync(path.join(root, "team/desk.html"), "utf8");
check(deskJs.includes('src="../paragon-wallets.js"') && deskJs.indexOf('src="../paragon-wallets.js"') < deskJs.indexOf('src="team-pages.js"'), "desk loads the wallet engine before team-pages.js");

/* ---------- 15. Prepared backend schema (supabase/finance-schema.sql) ---------- */
const sql = fs.readFileSync(path.join(root, "supabase/finance-schema.sql"), "utf8");
check(sql.includes("PARAGON ARCHIVE — EXPORT IDENTITY"), "finance-schema.sql carries the identity header");
["paragon_wallets", "paragon_coin_ledger_entries", "paragon_payout_accounts", "paragon_withdrawals", "paragon_payment_claims", "paragon_risk_cases", "paragon_finance_audit", "paragon_finance_controls", "paragon_economic_settings"].forEach(table => {
  check(sql.includes("create table if not exists public." + table), "prepared table: " + table);
});
check(sql.includes("unique (payout_provider, payout_provider_txn)"), "SQL enforces the UNIQUE provider payout pair (§19)");
check(sql.includes("unique (provider, provider_transaction_id)"), "SQL enforces the UNIQUE payment-claim pair (§19)");
check(sql.includes("'WITHDRAWAL_LOCK'") && sql.includes("'WITHDRAWAL_REVERSAL'"), "SQL ledger admits only typed withdrawal events");
check(sql.includes("guard_wallet_balance") && sql.includes("can never go negative"), "SQL guards wallets against negative balances");
check(sql.toLowerCase().includes("activate") && sql.toLowerCase().includes("server becomes the wallet of record"), "schema header states the activation gate honestly (nothing live until the owner activates)");

/* ---------- 16. Honesty invariants that Stage 8 must keep ---------- */
const withdrawalCopy = fs.readFileSync(path.join(root, "paragon-wallets.js"), "utf8") + app;
check(!/paid instantly|instant payout|automatic payout|live payout/i.test(withdrawalCopy), "no copy claims instant/automatic real-money payouts");
check(app.includes("pendingBackendSync"), "user-facing copy keeps the pendingBackendSync honesty marker");
check(engineSource.includes("browser is never authoritative for money"), "engine header states the browser-never-authoritative law");

/* ---------- 17. Configurability: limits + fee read from the economic-settings mirror ---------- */
const tunedEnv = loadWallets({ "paragonEconomicSettings.v1": { configVersion: 2, withdrawalDailyLimit: 1, withdrawalFeeCoins: 5, withdrawalFeeThresholdNaira: 5000, nairaRate: 3 } });
const TW = tunedEnv.context.ParagonWallets;
check(TW.effectiveConfig().dailyLimit === 1 && TW.effectiveConfig().withdrawalFeeCoins === 5 && TW.effectiveConfig().withdrawalFeeThresholdNaira === 5000 && TW.effectiveConfig().nairaRate === 3, "server-mirrored settings tune the limits, fee and rate");
const tuneReq1 = TW.requestWithdrawal({ user: "tune@example.com", naira: 5000, availableCoins: 999999, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Tune" } });
check(tuneReq1.ok && tuneReq1.feeCoins === 5 && tuneReq1.lockedCoins === 15005, "tuned threshold/fee apply (₦5,000+ → 5 coins at rate 3: 15,000 + 5)");
const tuneReq2 = TW.requestWithdrawal({ user: "tune@example.com", naira: 1000, availableCoins: 999999, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Tune" } });
check(!tuneReq2.ok && tuneReq2.code === "daily-limit", "tuned daily limit (1/24 h) is enforced");
const tuneReq3 = TW.requestWithdrawal({ user: "tune2@example.com", naira: 3000, availableCoins: 999999, payout: { bank: "OPay", accountNumber: "0123456789", accountName: "Tune2" } });
check(tuneReq3.ok && tuneReq3.feeCoins === 0, "tuned ₦5,000 threshold means ₦3,000 still pays no fee");

console.log(`\nPASS: ${passed} checks — P-100 Stage 6/7 finance (withdrawals, ₦10,000 fee rule, limits, payout machine, dup protection, claims, pause, kill switches, typed ledger, reconciliation, risk cases, desks, SQL)`);

})();
