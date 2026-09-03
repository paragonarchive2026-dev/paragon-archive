/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: paragon-wallets.js
  EXPECTED PROJECT PATH: /paragon-wallets.js
  ROLE: STAGE 6 + STAGE 7 (P-100 / D-208) — the shared Paragon Coins wallet/finance engine.
        Dependency-free; loaded BEFORE app.js on paragon-archive.html and BEFORE
        team-pages.js on team/desk.html. Owns: withdrawal requests + the payout state
        machine (spec §22–§25), verified payout accounts (§26), payment claims /
        reconciliation + duplicate-payment protection (§18–§19, §24), the typed finance
        ledger (§15–§16), financial pause + per-game kill switches (§30), risk flags and
        cases (§31–§34, §58–§59), and an append-only finance audit (§37).
        The actual coin BALANCE lives in the personal state (app.js addCoins/spendCoins —
        the browser is never authoritative for money; the server ledger is authoritative
        at activation via supabase/finance-schema.sql).
  RULES ENFORCED HERE (no fake money):
    • Your ₦10,000 rule (§22.1): withdrawals BELOW ₦10,000 pay NO Paragon fee; withdrawals
      of ₦10,000 OR MORE carry the 50-coin withdrawal fee (tracked separately, never
      treated as profit). Rate placeholder: ₦1 = 2 coins (owner sets the real rate).
    • Frequency limits (§23): max 2 withdrawal requests per rolling 24 h and max 5 per
      rolling 7 days — configurable, and they never trap legitimate funds: every failed /
      cancelled request returns its locked coins.
    • Balance types: a request LOCKS the coins (available -> withdrawal locked) when
      created; FAILED/COINS_UNLOCKED returns them.
    • Payout state machine (§25): REQUESTED → ELIGIBILITY_CHECK → RISK_CHECK → LOCKED →
      PAYOUT_PENDING → PROVIDER_SUBMITTED → PROVIDER_CONFIRMED → PAID, with RETRYING /
      UNKNOWN / RECONCILIATION branches. No second payout because a provider response was
      late: a payout reference is issued once and PAID is idempotent per withdrawal.
    • Duplicate payout protection (§19): one unique payoutRef per PAID/RECONCILIATION row.
    • Payment claims (§18/§24): a provider transaction reference can be claimed once;
      identical claims auto-flag as duplicates; max 5 claims per rolling 24 h.
    • Emergency controls (§30): financial pause stops new purchases/new withdrawals/new
      payout approvals (unlocks and reversals stay available); per-game kill switches are
      recorded here and MUST be consulted by future game engines.
    • Risk signals are advisory; a single signal never equals guilt and never freezes a
      user's money automatically (spec §31–§32).
    • Audit (§37): every sensitive action appends actor/action/target/reason/ref/timestamp.
*/

(function () {
  "use strict";

  var STORES = {
    requests: "paragonWithdrawals.v1",
    accounts: "paragonPayoutAccounts.v1",
    claims: "paragonPaymentClaims.v1",
    ledger: "paragonFinanceLedger.v1",
    cases: "paragonFinancialCases.v1",
    controls: "paragonFinanceControls.v1",
    audit: "paragonFinanceAudit.v1"
  };

  /* Spec §23 defaults + COIN-SYSTEM placeholder rate — server-controlled later. */
  var CONFIG = {
    nairaRate: 2,                 /* placeholder ₦1 = 2 coins (owner sets the real rate) */
    withdrawalFeeThresholdNaira: 10000,  /* ₦10,000+ → 50-coin fee (spec §22.1) */
    withdrawalFeeCoins: 50,
    minWithdrawalNaira: 1000,
    dailyLimit: 2,                /* max requests per rolling 24 h */
    weeklyLimit: 5,               /* max requests per rolling 7 days */
    claimDailyLimit: 5,           /* max payment claims per rolling 24 h (spec §24) */
    dustNaira: 1
  };

  var STATES = [
    "REQUESTED", "ELIGIBILITY_CHECK", "RISK_CHECK", "LOCKED", "PAYOUT_PENDING",
    "PROVIDER_SUBMITTED", "PROVIDER_CONFIRMED", "PAID", "RETRYING", "UNKNOWN",
    "RECONCILIATION", "FAILED", "COINS_UNLOCKED"
  ];

  /* §25 allowed transitions (state machine law). */
  var EDGES = {
    REQUESTED: ["ELIGIBILITY_CHECK", "FAILED"],
    ELIGIBILITY_CHECK: ["RISK_CHECK", "FAILED"],
    RISK_CHECK: ["LOCKED", "FAILED"],
    LOCKED: ["PAYOUT_PENDING", "FAILED"],            /* FAILED = desk rejection / user cancel → unlock */
    PAYOUT_PENDING: ["PROVIDER_SUBMITTED", "RETRYING", "FAILED"],
    RETRYING: ["PROVIDER_SUBMITTED", "FAILED"],
    PROVIDER_SUBMITTED: ["PROVIDER_CONFIRMED", "UNKNOWN"],
    UNKNOWN: ["RECONCILIATION"],
    RECONCILIATION: ["PAID", "FAILED"],
    PROVIDER_CONFIRMED: ["PAID"],
    FAILED: ["COINS_UNLOCKED"],
    COINS_UNLOCKED: [],
    PAID: []
  };

  var memory = {};
  function readJSON(key, fallback) {
    try {
      var raw = null;
      if (typeof window !== "undefined" && window.localStorage) raw = window.localStorage.getItem(key);
      if (raw == null && Object.prototype.hasOwnProperty.call(memory, key)) raw = memory[key];
      return raw == null ? fallback : JSON.parse(raw);
    } catch (error) { return fallback; }
  }
  function writeJSON(key, value) {
    try {
      var raw = JSON.stringify(value);
      if (typeof window !== "undefined" && window.localStorage) window.localStorage.setItem(key, raw);
      memory[key] = raw;
    } catch (error) { memory[key] = JSON.stringify(value); }
  }
  function nowISO(date) { return (date || new Date()).toISOString(); }
  function esc(player) { return String(player || "").trim().toLowerCase(); }
  function isGuest(player) { return /^guest(\s|\(|@|$)/i.test(String(player || "").trim()); }
  function uid(prefix) {
    return (prefix || "w") + "-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6).toString(36);
  }
  function roundN(value) { return Math.round(Number(value) || 0); }
  function maskAccount(number) {
    var digits = String(number || "").replace(/\D/g, "");
    if (!digits.length) return "";
    return "•••• " + digits.slice(-4);
  }

  /* ------------------------------------------------------------------ audit (§37) */
  function financeAudit() { return readJSON(STORES.audit, []); }
  function appendAudit(actor, action, detail, ref) {
    var list = financeAudit();
    list.unshift({
      at: nowISO(),
      actor: String(actor || "system"),
      action: String(action || ""),
      detail: String(detail || ""),
      ref: String(ref || ""),
      actorRole: String((actor && actor.role) || "")
    });
    writeJSON(STORES.audit, list.slice(0, 2000));
  }
  function writeAuditRow(row) { /* tests/restores only — never a UI operation */
    var list = financeAudit();
    list.unshift(row);
    writeJSON(STORES.audit, list.slice(0, 2000));
  }

  /* ------------------------------------------------------------------ controls (§30) */
  function controls() {
    var stored = readJSON(STORES.controls, {}) || {};
    return {
      paused: stored.paused === true,
      pausedSince: stored.pausedSince || "",
      pausedBy: stored.pausedBy || "",
      pausedReason: stored.pausedReason || "",
      killSwitches: stored.killSwitches || {}
    };
  }
  function setFinancialPause(actor, paused, reason) {
    var current = controls();
    var state = { paused: paused === true, pausedSince: nowISO(), pausedBy: String(actor || "team"), pausedReason: String(reason || ""), killSwitches: current.killSwitches };
    writeJSON(STORES.controls, state);
    appendAudit(actor, paused ? "FINANCIAL_PAUSE_ON" : "FINANCIAL_PAUSE_OFF", String(reason || ""), "controls");
    return state;
  }
  function setGameKillSwitch(actor, gameType, killed, reason) {
    var current = controls();
    var switches = JSON.parse(JSON.stringify(current.killSwitches || {}));
    var entry = switches[String(gameType || "")] || {};
    entry.killed = killed === true;
    entry.since = nowISO();
    entry.by = String(actor || "team");
    entry.reason = String(reason || "");
    switches[String(gameType || "")] = entry;
    var state = { paused: current.paused, pausedSince: current.pausedSince, pausedBy: current.pausedBy, pausedReason: current.pausedReason, killSwitches: switches };
    writeJSON(STORES.controls, state);
    appendAudit(actor, killed ? "GAME_KILL_SWITCH_ON" : "GAME_KILL_SWITCH_OFF", (gameType || "") + (reason ? " — " + reason : ""), "controls:" + gameType);
    return state;
  }
  function gameKillState(gameType) {
    var sw = controls().killSwitches || {};
    return { killed: (sw[gameType] || {}).killed === true, since: (sw[gameType] || {}).since || "", reason: (sw[gameType] || {}).reason || "" };
  }

  /* ------------------------------------------------------------------ economy config (server-controlled later) */
  function effectiveConfig() {
    var stored = readJSON("paragonEconomicSettings.v1", null);
    var out = {
      nairaRate: CONFIG.nairaRate,
      withdrawalFeeThresholdNaira: CONFIG.withdrawalFeeThresholdNaira,
      withdrawalFeeCoins: CONFIG.withdrawalFeeCoins,
      minWithdrawalNaira: CONFIG.minWithdrawalNaira,
      dailyLimit: CONFIG.dailyLimit,
      weeklyLimit: CONFIG.weeklyLimit,
      claimDailyLimit: CONFIG.claimDailyLimit
    };
    if (!stored || typeof stored !== "object") return out;
    if (Number(stored.nairaRate) > 0) out.nairaRate = Number(stored.nairaRate);
    if (Number(stored.withdrawalFeeThresholdNaira) > 0) out.withdrawalFeeThresholdNaira = Number(stored.withdrawalFeeThresholdNaira);
    if (Number(stored.withdrawalFeeCoins) >= 0) out.withdrawalFeeCoins = Number(stored.withdrawalFeeCoins);
    if (Number(stored.minWithdrawalNaira) > 0) out.minWithdrawalNaira = Number(stored.minWithdrawalNaira);
    if (Number(stored.withdrawalDailyLimit) > 0) out.dailyLimit = Number(stored.withdrawalDailyLimit);
    if (Number(stored.withdrawalWeeklyLimit) > 0) out.weeklyLimit = Number(stored.withdrawalWeeklyLimit);
    if (Number(stored.claimDailyLimit) > 0) out.claimDailyLimit = Number(stored.claimDailyLimit);
    return out;
  }
  function nairaToCoins(naira) { return Math.round(Number(naira) * effectiveConfig().nairaRate); }
  function coinsToNaira(coins) {
    var rate = effectiveConfig().nairaRate || 1;
    return Math.floor(Number(coins) / rate);
  }

  /* ------------------------------------------------------------------ requests + state machine */
  function allRequests() { return readJSON(STORES.requests, []); }
  function writeRequests(list) { writeJSON(STORES.requests, list); }
  function findRequest(id) {
    var found = null;
    allRequests().forEach(function (r) { if (String(r.id) === String(id)) found = r; });
    return found;
  }
  function requestsFor(user) {
    var key = esc(user);
    return allRequests().filter(function (r) { return r.user === key; });
  }

  function withdrawalFeeFor(naira) {
    var cfg = effectiveConfig();
    return Number(naira) >= cfg.withdrawalFeeThresholdNaira ? cfg.withdrawalFeeCoins : 0;
  }
  function coinsRequiredFor(naira) { return nairaToCoins(naira) + withdrawalFeeFor(naira); }

  function rollingCount(user, minutes, nowDate) {
    var key = esc(user);
    var now = nowDate ? nowDate.getTime() : Date.now();
    var windowMs = minutes * 60 * 1000;
    return allRequests().filter(function (r) {
      return r.user === key && now - Date.parse(r.createdAt || 0) <= windowMs && Date.parse(r.createdAt || 0) <= now;
    }).length;
  }
  function remainingLimits(user, nowDate) {
    var cfg = effectiveConfig();
    var used24 = rollingCount(user, 24 * 60, nowDate);
    var used7d = rollingCount(user, 7 * 24 * 60, nowDate);
    return {
      used24: used24, remaining24: Math.max(0, cfg.dailyLimit - used24),
      used7d: used7d, remaining7d: Math.max(0, cfg.weeklyLimit - used7d),
      dailyLimit: cfg.dailyLimit, weeklyLimit: cfg.weeklyLimit
    };
  }

  /* Risk signals (§58–§59) — advisory only. */
  function riskFlagsFor(user, naira, nowDate) {
    var flags = [];
    var key = esc(user);
    var now = nowDate || new Date();
    var hourMs = 60 * 60 * 1000;
    var recent = allRequests().filter(function (r) { return r.user === key && now.getTime() - Date.parse(r.createdAt || 0) < 24 * hourMs; });
    if (recent.length >= 3) flags.push("withdrawal-burst");
    var total7d = allRequests().filter(function (r) { return r.user === key && now.getTime() - Date.parse(r.createdAt || 0) < 7 * 24 * hourMs; })
      .reduce(function (sum, r) { return sum + (Number(r.naira) || 0); }, 0);
    if (Number(naira) > 0 && total7d > 0 && Number(naira) > total7d * 3) flags.push("large-withdrawal");
    return flags;
  }

  function checkBlockers(user) {
    if (isGuest(user)) return { code: "guest", message: "Guests cannot withdraw — sign in to redeem coins." };
    if (controls().paused) return { code: "financial-paused", message: "Financial operations are temporarily paused by the Paragon Team. Withdrawals will reopen shortly — your balance is safe." };
    return { ok: true };
  }

  /* The user-side request entry point. Balance is passed in — this engine never fabricates
     funds; the caller (app.js) debits `result.lockedCoins` from the real available balance. */
  function requestWithdrawal(raw, nowDate) {
    var now = new Date(nowDate ? nowDate.getTime() : Date.now());
    var r = raw || {};
    var user = esc(r.user);
    var blocked = checkBlockers(user);
    if (!blocked.ok) return blocked;
    if (!user) return { code: "no-user" };
    var naira = Math.round(Number(r.naira) || 0);
    var cfg = effectiveConfig();
    if (naira < cfg.minWithdrawalNaira) return { code: "below-minimum", message: "Minimum withdrawal is ₦" + cfg.minWithdrawalNaira.toLocaleString() + "." };
    if (!r.payout || !r.payout.accountNumber || !r.payout.accountName) return { code: "payout-required" };
    var available = Math.max(0, Math.round(Number(r.availableCoins) || 0));
    var lockedCoins = coinsRequiredFor(naira);
    if (available < lockedCoins) {
      return { code: "insufficient", message: "You need " + lockedCoins.toLocaleString() + " coins (₦" + naira.toLocaleString() + " × " + cfg.nairaRate + (withdrawalFeeFor(naira) ? " + " + cfg.withdrawalFeeCoins + "-coin fee" : "") + ")." };
    }
    var limits = remainingLimits(user, now);
    if (limits.remaining24 < 1) return { code: "daily-limit", message: "Daily withdrawal limit reached (" + cfg.dailyLimit + " per 24 h). New requests unlock on a rolling window — your locked coins are never trapped." };
    if (limits.remaining7d < 1) return { code: "weekly-limit", message: "Weekly withdrawal limit reached (" + cfg.weeklyLimit + " per 7 days)." };
    var feeCoins = withdrawalFeeFor(naira);
    var flags = riskFlagsFor(user, naira, now);
    var id = uid("wd");
    var entry = {
      id: id,
      correlationId: "CORR-" + id.toUpperCase(),
      user: user,
      displayName: String(r.displayName || user),
      naira: naira,
      coins: nairaToCoins(naira),
      feeCoins: feeCoins,
      lockedCoins: lockedCoins,
      state: "LOCKED",            /* eligibility + risk checks pass here; the desk re-verifies before payout */
      payout: {
        bank: String(r.payout.bank || ""),
        accountNumber: String(r.payout.accountNumber || ""),
        accountName: String(r.payout.accountName || ""),
        masked: maskAccount(r.payout.accountNumber)
      },
      flags: flags,
      payoutRef: "",
      provider: "",
      failReason: "",
      timeline: [{ state: "REQUESTED", at: nowISO(now), by: user }, { state: "LOCKED", at: nowISO(now), by: user, note: "Coins locked while this request is processed" }],
      createdAt: nowISO(now),
      updatedAt: nowISO(now),
      refundedAt: "",
      paidAt: "",
      paidSeen: false,
      refundedOnDevice: false,
      pendingBackendSync: true
    };
    var list = allRequests();
    list.unshift(entry);
    writeRequests(list);
    appendAudit(user, "WITHDRAWAL_REQUESTED", "₦" + naira + " → " + lockedCoins + " coins locked (incl. " + feeCoins + " fee) · " + entry.correlationId, id);
    return { ok: true, request: entry, lockedCoins: lockedCoins, feeCoins: feeCoins, flags: flags };
  }

  function appendTimeline(entry, state, actor, note) {
    entry.timeline = entry.timeline || [];
    entry.timeline.push({ state: state, at: nowISO(), by: String(actor || "system"), note: note || "" });
  }

  function transition(id, actor, to, meta) {
    var live = allRequests();
    var entry = null;
    live.forEach(function (row) { if (String(row.id) === String(id)) entry = row; });
    if (!entry) return { ok: false, code: "not-found" };
    var from = entry.state;
    if (EDGES[from].indexOf(to) === -1) return { ok: false, code: "invalid-transition", message: from + " → " + to + " is not a legal payout-state move." };
    /* A locked row's coins are returned only through the FAILED → COINS_UNLOCKED path. */
    if (to === "PROVIDER_SUBMITTED") {
      var subRef = String((meta || {}).payoutRef || "").trim();
      if (!subRef) return { ok: false, code: "payout-ref-required", message: "A provider payout reference is required before submission (it becomes the single payout proof)." };
      /* §19/§25: a payout reference can only ever map to one payout. */
      var subDup = allRequests().filter(function (other) {
        return String(other.id) !== String(id) && other.payoutRef === subRef &&
          (other.state === "PAID" || other.state === "RECONCILIATION" || other.state === "PROVIDER_SUBMITTED" || other.state === "PROVIDER_CONFIRMED");
      });
      if (subDup.length) return { ok: false, code: "duplicate-payout-ref", message: "This payout reference is already used by " + subDup[0].id + " — never pay twice." };
      entry.payoutRef = subRef;
      entry.provider = String((meta || {}).provider || entry.provider || "").trim();
      entry.state = "PROVIDER_SUBMITTED";
      entry.updatedAt = nowISO();
      appendTimeline(entry, to, actor, (meta || {}).reason || ("submitted to " + entry.provider));
      appendAudit(actor, "WITHDRAWAL_SUBMITTED", entry.correlationId + " · ₦" + entry.naira + " · ref " + subRef, id);
    } else if (to === "PAID") {
      var payoutRef = String((meta || {}).payoutRef || "").trim() || entry.payoutRef;
      var provider = String((meta || {}).provider || "").trim();
      if (!payoutRef) return { ok: false, code: "payout-ref-required", message: "A payout reference is required to record payment." };
      /* §19/§25: a payout reference can be used exactly once; PAID is idempotent. */
      var dup = allRequests().filter(function (other) {
        return String(other.id) !== String(id) && other.payoutRef === payoutRef && (other.state === "PAID" || other.state === "RECONCILIATION" || other.state === "PROVIDER_SUBMITTED" || other.state === "PROVIDER_CONFIRMED");
      });
      if (dup.length) return { ok: false, code: "duplicate-payout-ref", message: "This payout reference is already used by " + dup[0].id + " — never pay twice." };
      entry.payoutRef = payoutRef;
      if (provider) entry.provider = provider;
      entry.paidAt = nowISO();
      entry.state = "PAID";
      entry.updatedAt = nowISO();
      appendTimeline(entry, to, actor, "payout " + payoutRef + (meta && meta.reason ? " — " + meta.reason : ""));
      appendAudit(actor, "WITHDRAWAL_PAID", entry.correlationId + " · ₦" + entry.naira + " via " + payoutRef, id);
    } else if (to === "FAILED") {
      entry.failReason = String((meta || {}).reason || "Rejected by the Paragon Team");
      entry.state = "FAILED";
      entry.updatedAt = nowISO();
      appendTimeline(entry, to, actor, entry.failReason);
      appendAudit(actor, "WITHDRAWAL_FAILED", entry.correlationId + " — " + entry.failReason, id);
    } else if (to === "COINS_UNLOCKED") {
      entry.state = "COINS_UNLOCKED";
      entry.refundedAt = nowISO();
      entry.updatedAt = nowISO();
      appendTimeline(entry, to, actor, "Locked coins returned: " + entry.lockedCoins + " coins");
      appendAudit(actor, "WITHDRAWAL_COINS_UNLOCKED", entry.correlationId + " refund " + entry.lockedCoins + " coins", id);
    } else {
      entry.state = to;
      entry.updatedAt = nowISO();
      appendTimeline(entry, to, actor, (meta || {}).reason || "");
      appendAudit(actor, "WITHDRAWAL_" + to.replace(/-/g, "_"), entry.correlationId + (meta && meta.reason ? " — " + meta.reason : ""), id);
    }
    writeRequests(live);
    return { ok: true, state: entry.state, request: entry };
  }

  /* Team desk convenience transitions with honest confirm copy handled by the caller. */
  function deskTransition(id, actor, to, meta) { return transition(id, actor, to, meta || {}); }
  function cancelRequest(id, actor, reason) { /* LOCKED/REQUESTED → FAILED, then coins returned */
    var first = transition(id, actor, "FAILED", { reason: reason || "Cancelled" });
    if (!first.ok) return first;
    var unlock = transition(id, actor, "COINS_UNLOCKED");
    return unlock.ok ? unlock : first;
  }
  function persistRequests(list) { writeRequests(list || allRequests()); } /* app marks refundedOnDevice/paidSeen on rows it already holds */

  /* ------------------------------------------------------------------ payment claims / reconciliation (§18–§19, §24) */
  function allClaims() { return readJSON(STORES.claims, []); }
  function writeClaims(list) { writeJSON(STORES.claims, list); }

  function claimDailyCount(user, nowDate) {
    var key = esc(user);
    var now = nowDate ? nowDate.getTime() : Date.now();
    return allClaims().filter(function (c) {
      return c.user === key && now - Date.parse(c.createdAt || 0) <= 24 * 3600 * 1000;
    }).length;
  }

  /* Called by the app when a purchase request is submitted. `providerTxn` is the user's
     transfer reference — matching information only, never proof. */
  function recordPaymentClaim(raw, nowDate) {
    var now = new Date(nowDate ? nowDate.getTime() : Date.now());
    var user = esc(raw.user || "");
    if (!user || isGuest(user)) return { ok: false, code: "guest" };
    var providerTxn = String(raw.providerTxn || "").trim();
    var amount = Math.round(Number(raw.amount) || 0);
    if (!providerTxn || providerTxn.length < 4) return { ok: false, code: "txn-ref-required" };
    if (amount <= 0) return { ok: false, code: "amount-required" };
    if (claimDailyCount(user, now) >= (effectiveConfig().claimDailyLimit || 5)) {
      return { ok: false, code: "claim-daily-limit", message: "Maximum 5 payment claims per 24 h (anti-spam)." };
    }
    var list = allClaims();
    /* §19: the same provider transaction must never credit twice. */
    var duplicate = list.filter(function (c) { return c.providerTxn === providerTxn; });
    var claim = {
      id: String(raw.requestId || uid("pay")),
      user: user,
      displayName: String(raw.displayName || user),
      requestId: String(raw.requestId || ""),
      providerTxn: providerTxn,
      provider: String(raw.provider || "bank-transfer"),
      amountNaira: amount,
      coins: nairaToCoins(amount),
      senderName: String(raw.senderName || ""),
      senderBank: String(raw.senderBank || ""),
      state: duplicate.length ? "DUPLICATE" : "CLAIMED",
      duplicateOf: duplicate.length ? duplicate[0].id : "",
      note: duplicate.length ? "Provider transaction reference already claimed — one credit only." : "",
      timeline: [{ state: duplicate.length ? "DUPLICATE" : "CLAIMED", at: nowISO(now), by: user }],
      createdAt: nowISO(now),
      pendingBackendSync: true
    };
    list.unshift(claim);
    writeClaims(list);
    appendAudit(user, duplicate.length ? "PAYMENT_CLAIM_DUPLICATE" : "PAYMENT_CLAIMED", "₦" + amount + " ref " + providerTxn + (duplicate.length ? " (duplicate of " + duplicate[0].id + ")" : ""), claim.id);
    return { ok: true, claim: claim, duplicate: duplicate.length > 0 };
  }

  function claimState(id, actor, to, meta) {
    var list = allClaims();
    var claim = null;
    list.forEach(function (c) { if (String(c.id) === String(id)) claim = c; });
    if (!claim) return { ok: false, code: "not-found" };
    var valid = { CLAIMED: ["PENDING_VERIFICATION", "CONFIRMED", "MANUAL_REVIEW", "MISMATCH", "REJECTED"], PENDING_VERIFICATION: ["CONFIRMED", "MANUAL_REVIEW", "MISMATCH", "REJECTED"], MANUAL_REVIEW: ["CONFIRMED", "MISMATCH", "REJECTED"], DUPLICATE: ["REJECTED"], MISMATCH: ["MANUAL_REVIEW", "CONFIRMED", "REJECTED"] };
    if (!valid[claim.state] || valid[claim.state].indexOf(to) === -1) return { ok: false, code: "invalid-transition" };
    if (to === "CONFIRMED") {
      var dup = list.filter(function (other) { return other.id !== claim.id && other.providerTxn === claim.providerTxn && (other.state === "CONFIRMED" || other.state === "PENDING_VERIFICATION"); });
      if (dup.length) return { ok: false, code: "duplicate-confirmed", message: "This provider transaction is already confirmed — one credit only." };
    }
    claim.state = to;
    claim.note = String((meta || {}).note || "");
    claim.timeline = claim.timeline || [];
    claim.timeline.push({ state: to, at: nowISO(), by: String(actor || "team"), note: claim.note });
    claim.updatedAt = nowISO();
    writeClaims(list);
    appendAudit(actor, "PAYMENT_CLAIM_" + to.replace(/-/g, "_"), claim.id + " · ₦" + claim.amountNaira + " · ref " + claim.providerTxn + (claim.note ? " — " + claim.note : ""), claim.id);
    return { ok: true, claim: claim };
  }

  /* ------------------------------------------------------------------ typed ledger (§15–§16) */
  function ledger() { return readJSON(STORES.ledger, []); }
  function appendLedger(row) {
    if (!row || !row.type || !row.user) return { ok: false };
    var list = ledger();
    var id = row.id || uid("led");
    if (row.idempotencyKey && list.some(function (l) { return l.idempotencyKey === row.idempotencyKey; })) {
      return { ok: true, existing: true };
    }
    list.unshift({
      id: id,
      at: row.at || nowISO(),
      user: esc(row.user),
      type: String(row.type).toUpperCase(),
      amount: Math.round(Number(row.amount) || 0),        /* signed: + credit / − debit */
      refType: row.refType || "",
      ref: row.ref || "",
      reason: row.reason || "",
      actor: row.actor || "system",
      idempotencyKey: row.idempotencyKey || ""
    });
    writeJSON(STORES.ledger, list.slice(0, 5000));
    return { ok: true };
  }
  function ledgerFor(user) { return ledger().filter(function (l) { return l.user === esc(user); }); }
  /* Stage-8 balance reconciliation: credits − debits vs the balance the app reports. */
  function reconcileBalance(user, reportedAvailable) {
    var rows = ledgerFor(user);
    var credits = 0; var debits = 0; var missing = [];
    rows.forEach(function (row) {
      if (row.amount > 0) credits += row.amount; else debits += Math.abs(row.amount);
    });
    var delta = credits - debits;
    var expected = Math.max(0, Math.round(Number(reportedAvailable) || 0));
    return { user: esc(user), credits: credits, debits: debits, delta: delta, reported: expected, matches: delta === expected, difference: delta - expected, rows: rows.length, missing: missing };
  }

  /* ------------------------------------------------------------------ risk cases (§31–§35, §56–§57) */
  function allCases() { return readJSON(STORES.cases, []); }
  function writeCases(list) { writeJSON(STORES.cases, list); }
  function openRiskCase(raw) {
    var entry = {
      id: uid("case"),
      user: esc(raw.user || ""),
      displayName: String(raw.displayName || raw.user || ""),
      type: String(raw.type || "manual"),
      reason: String(raw.reason || ""),
      linkedRefs: Array.isArray(raw.linkedRefs) ? raw.linkedRefs : [],
      state: "OPEN",
      flags: Array.isArray(raw.flags) ? raw.flags : [],
      timeline: [{ state: "OPEN", at: nowISO(), by: String(raw.actor || "team"), note: String(raw.reason || "") }],
      createdAt: nowISO(),
      updatedAt: nowISO()
    };
    if (!entry.user && !raw.type) return { ok: false, code: "details-required" };
    var list = allCases();
    list.unshift(entry);
    writeCases(list);
    appendAudit(raw.actor || "team", "RISK_CASE_OPENED", entry.id + (entry.reason ? " — " + entry.reason : ""), entry.id);
    return { ok: true, case: entry };
  }
  function riskCaseState(id, actor, to, meta) {
    var list = allCases();
    var entry = null;
    list.forEach(function (c) { if (String(c.id) === String(id)) entry = c; });
    if (!entry) return { ok: false, code: "not-found" };
    var valid = { OPEN: ["REVIEW", "RESOLVED", "CLOSED"], REVIEW: ["RESOLVED", "CLOSED", "OPEN"], RESOLVED: ["CLOSED"], CLOSED: [] };
    if (!valid[entry.state] || valid[entry.state].indexOf(to) === -1) return { ok: false, code: "invalid-transition" };
    entry.state = to;
    entry.updatedAt = nowISO();
    entry.timeline = entry.timeline || [];
    entry.timeline.push({ state: to, at: nowISO(), by: String(actor || "team"), note: String((meta || {}).note || "") });
    writeCases(list);
    appendAudit(actor, "RISK_CASE_" + to.replace(/-/g, "_"), entry.id + ((meta || {}).note ? " — " + meta.note : ""), entry.id);
    return { ok: true, case: entry };
  }

  /* ------------------------------------------------------------------ payout accounts (§26) */
  function payoutAccounts() { return readJSON(STORES.accounts, []); }
  function writePayoutAccounts(list) { writeJSON(STORES.accounts, list); }
  function savePayoutAccount(raw) {
    var user = esc(raw.user || "");
    if (!user || isGuest(user)) return { ok: false, code: "guest" };
    var accountNumber = String(raw.accountNumber || "").replace(/\D/g, "");
    if (accountNumber.length < 6) return { ok: false, code: "account-required" };
    var bank = String(raw.bank || "").trim();
    if (!bank) return { ok: false, code: "bank-required" };
    var list = payoutAccounts();
    var mine = list.filter(function (a) { return a.user === user; })[0] || null;
    var changed = mine && (mine.accountNumber !== accountNumber || mine.bank !== bank || (mine.accountName || "") !== String(raw.accountName || "").trim());
    var record = {
      user: user,
      bank: bank,
      accountNumber: accountNumber,
      accountName: String(raw.accountName || "").trim(),
      masked: maskAccount(accountNumber),
      verified: false,                 /* self-declared on-device; the desk re-verifies before payout */
      changedAt: nowISO(),
      createdAt: mine ? mine.createdAt : nowISO(),
      riskHold: (mine && mine.riskHold) || (changed ? true : false), /* §26: changes trigger extra verification */
      history: mine ? (mine.history || []).concat([{ at: nowISO(), bank: mine.bank, accountNumber: mine.accountNumber }]) : []
    };
    if (mine) list[list.indexOf(mine)] = record; else list.push(record);
    writePayoutAccounts(list);
    appendAudit(user, changed ? "PAYOUT_ACCOUNT_CHANGED" : "PAYOUT_ACCOUNT_SAVED", bank + " " + maskAccount(accountNumber) + (changed ? " (change → verification hold)" : ""), "payout:" + user);
    return { ok: true, account: record, changed: changed };
  }

  /* ------------------------------------------------------------------ public API */
  var api = {
    STORES: STORES,
    STATES: STATES,
    EDGES: EDGES,
    CONFIG_VERSION: "1",
    effectiveConfig: effectiveConfig,
    nairaToCoins: nairaToCoins,
    coinsToNaira: coinsToNaira,
    withdrawalFeeFor: withdrawalFeeFor,
    coinsRequiredFor: coinsRequiredFor,
    remainingLimits: remainingLimits,
    checkBlockers: checkBlockers,
    requestWithdrawal: requestWithdrawal,
    allRequests: allRequests,
    findRequest: findRequest,
    requestsFor: requestsFor,
    deskTransition: deskTransition,
    cancelRequest: cancelRequest,
    persistRequests: persistRequests,
    controls: controls,
    setFinancialPause: setFinancialPause,
    setGameKillSwitch: setGameKillSwitch,
    gameKillState: gameKillState,
    recordPaymentClaim: recordPaymentClaim,
    allClaims: allClaims,
    claimState: claimState,
    ledger: ledger,
    appendLedger: appendLedger,
    ledgerFor: ledgerFor,
    reconcileBalance: reconcileBalance,
    allCases: allCases,
    openRiskCase: openRiskCase,
    riskCaseState: riskCaseState,
    payoutAccounts: payoutAccounts,
    savePayoutAccount: savePayoutAccount,
    financeAudit: financeAudit,
    appendAudit: appendAudit,
    maskAccount: maskAccount,
    isGuestUser: isGuest,
    uid: uid
  };
  if (typeof window !== "undefined") window.ParagonWallets = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
