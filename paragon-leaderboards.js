/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: paragon-leaderboards.js
  EXPECTED PROJECT PATH: /paragon-leaderboards.js
  ROLE: STAGE 5 — LEADERBOARDS engine (P-099 / D-207). The one shared, dependency-free
        Paragon Coins weekly leaderboard engine used by the public Archive (app.js), the
        Team desk settlement module (team/team-pages.js) and — later — every competitive
        game/quiz product as betting lands. Loaded before app.js on paragon-archive.html
        and before team-pages.js on team/desk.html.
  SPEC: PARAGON-COINS-MASTER-BUILD-SPEC.md §11 (LEADERBOARD) + §12 (WEEKLY LEADERBOARD
        REWARDS) + §12.1 (REWARD SETTLEMENT) — implemented for real on-device, with the
        server tables + economic settings prepared in supabase/leaderboards-schema.sql.
  RULES ENFORCED HERE (no fake money, no fake standings):
    • ONLY eligible staked ("bet") competition results earn points. Free play, guest play,
      login, account creation, coin purchases and promotional activity NEVER award points.
    • Points come from game PERFORMANCE only — never 1 coin = 1 point, never stake-sized.
      Stake size only proves eligibility (min stake). Per-game scoring rules are config
      (server-controlled copy in paragon_economic_settings when the backend is live).
    • A quiz creator can NEVER earn leaderboard points (or prizes) from their own quiz.
    • The weekly reward pool is REVENUE-FUNDED: 30% of eligible realized competition-fee
      revenue for that period. Zero realized fees = zero pool = zero payouts. Never funded
      fixed prizes are never shown.
    • Settlement follows the spec state machine: PERIOD CLOSED -> RESULTS FROZEN ->
      ANTI-ABUSE REVIEW -> ELIGIBILITY CHECK -> FINAL RANKING -> PRIZE CALCULATION ->
      REWARD LEDGER ENTRIES -> CREDIT. Suspicious rows are flagged, never auto-rewarded;
      only a super-admin's explicit eligibility decision lets a row reach the final
      ranking, and rewards credit through the SAME approval -> credit-mirror flow as coin
      purchases (paragonArchive.coinCredits.v1, kind "weekly-leaderboard-reward").
  HONESTY NOTE: standings are real-zero until the betting/competition stage lands and
        starts calling recordResult(); the pool is real-zero until realized competition
        fees exist. This file never fabricates a player, a point, a fee or a prize.
*/

(function () {
  "use strict";

  /* ------------------------------------------------------------------ storage */
  var STORES = {
    entries: "paragonLeaderboardEntries.v1",   /* eligible result rows (points) */
    fees: "paragonCompetitionFeeLedger.v1",    /* REALIZED competition fees -> fund the pool */
    ops: "paragonTeamLeaderboardOps.v1",       /* settlement state per period (team desk) */
    audit: "paragonLeaderboardAudit.v1",       /* append-only operational trail */
    mirrors: "paragonArchive.coinCredits.v1",  /* reward credits ride the SAME mirror as purchases */
    economy: "paragonEconomicSettings.v1"      /* optional settings mirror (SQL is authoritative later) */
  };

  /* Spec §12 defaults — the server-controlled paragon_economic_settings table mirrors these. */
  var CONFIG = {
    rewardPoolShare: 0.30,            /* 30% of eligible realized competition-fee revenue */
    rewardRanks: 10,                  /* top 3 + ranks 4-10 */
    minStakeCoins: 1,
    distribution: [30, 20, 15, 10, 9, 6, 4, 3, 2, 1] /* P-113 owner-corrected percents, still sums to 100 */, /* percents, ranks #1-#10, total MUST be 100 */
    scoring: {                        /* performance-only per game; server-controlled */
      quiz: { mode: "accuracyPct" },  /* points = round(score/total * 100), 0..100 per play */
      default: { mode: "accuracyPct" }
    },
    flags: { rapidFireCount: 6, rapidFireMinutes: 60, repeatedOpponentCount: 3 }
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
  function isGuest(player) { return /^guest(\s|\(|@|$)/i.test(String(player || "").trim()); }
  function escapePlayer(player) { return String(player || "").trim().toLowerCase(); }

  /* ------------------------------------------------------------------ weekly periods (Monday start, matching D-013) */
  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function startOfWeek(date) {
    var d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }
  function endOfWeek(date) { /* exclusive */
    var d = startOfWeek(date);
    d.setDate(d.getDate() + 7);
    return d;
  }
  function weekKeyFor(date) { return ymd(startOfWeek(new Date(date.getTime()))); }
  function periodBounds(key) {
    var parts = String(key).split("-");
    var start = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    var end = new Date(start.getTime());
    end.setDate(end.getDate() + 7);
    return { start: start, end: end };
  }
  function periodLabel(key) {
    var b = periodBounds(key);
    var last = new Date(b.end.getTime());
    last.setDate(last.getDate() - 1);
    return ymd(b.start) + " → " + ymd(last);
  }
  function previousPeriodKey(key) {
    var b = periodBounds(key);
    b.start.setDate(b.start.getDate() - 7);
    return ymd(b.start);
  }
  function recentPeriodKeys(now, count) {
    var keys = [];
    var cursor = new Date((now || new Date()).getTime());
    var limit = Math.max(1, Math.min(12, Number(count) || 3));
    for (var i = 0; i < limit; i += 1) {
      var key = weekKeyFor(cursor);
      if (keys.indexOf(key) === -1) keys.push(key);
      cursor = startOfWeek(cursor);
      cursor.setDate(cursor.getDate() - 1);
    }
    return keys;
  }

  /* ------------------------------------------------------------------ economy mirror (server-controlled later) */
  function applyEconomyMirror() {
    var mirror = readJSON(STORES.economy, null);
    if (!mirror || typeof mirror !== "object") return;
    /* P-113: legacy mirrors (distribution 30/20/15/10/7/5/4/3/2/4) are pre-correction.
       Ignore stale local mirrors unless they carry the current economy version marker. */
    var ECONOMY_VERSION = 2;
    if (Number(mirror.economyVersion || 0) < ECONOMY_VERSION) return;
    if (Number(mirror.rewardPoolShare) > 0 && Number(mirror.rewardPoolShare) <= 1) CONFIG.rewardPoolShare = Number(mirror.rewardPoolShare);
    if (Array.isArray(mirror.distribution)) {
      var list = mirror.distribution.map(Number);
      if (list.length >= 3 && list.every(function (n) { return n >= 0; })) {
        var total = list.reduce(function (a, b) { return a + b; }, 0);
        if (total === 100) CONFIG.distribution = list;
        CONFIG.rewardRanks = list.length;
      }
    }
    if (Number(mirror.minStakeCoins) >= 1) CONFIG.minStakeCoins = Math.round(Number(mirror.minStakeCoins));
    if (mirror.scoring && typeof mirror.scoring === "object") {
      Object.keys(mirror.scoring).forEach(function (game) { CONFIG.scoring[game] = mirror.scoring[game]; });
    }
  }
  function effectiveConfig() {
    applyEconomyMirror();
    return {
      rewardPoolShare: CONFIG.rewardPoolShare,
      rewardRanks: CONFIG.rewardRanks,
      minStakeCoins: CONFIG.minStakeCoins,
      distribution: CONFIG.distribution.slice(),
      scoring: JSON.parse(JSON.stringify(CONFIG.scoring))
    };
  }

  /* ------------------------------------------------------------------ entries */
  function allEntries() { return readJSON(STORES.entries, []); }
  function writeEntries(list) { writeJSON(STORES.entries, list); }
  function entriesFor(periodKey) {
    return allEntries().filter(function (entry) { return entry.weekKey === periodKey; });
  }

  /* ------------------------------------------------------------------ audit */
  function auditLog() { return readJSON(STORES.audit, []); }
  function appendAudit(record) {
    if (!record || !record.action) return;
    var list = auditLog();
    list.unshift({
      at: record.at || nowISO(),
      actor: String(record.actor || "system"),
      action: String(record.action),
      detail: String(record.detail || ""),
      periodKey: record.periodKey || ""
    });
    writeJSON(STORES.audit, list.slice(0, 400));
  }

  /* ------------------------------------------------------------------ scoring (performance-only, spec §11.2) */
  function pointsForResult(gameType, perf, rule) {
    perf = perf || {};
    var mode = rule && rule.mode ? rule.mode : "accuracyPct";
    if (mode === "fixedWin") { /* future head-to-head games: configured points for the winner only */
      return perf.won ? Math.max(0, Math.round(Number(rule.points) || 0)) : 0;
    }
    var total = Number(perf.total) || 0;
    var score = Number(perf.score) || 0;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((score / total) * 100)));
  }

  function riskFlagsFor(raw, entries, now) {
    var flags = [];
    var player = escapePlayer(raw.player);
    var recent = entries.filter(function (entry) {
      return entry.player === player && entry.gameType === raw.gameType &&
        Math.abs(new Date(now.getTime()) - new Date(entry.recordedAt || 0)) < (CONFIG.flags.rapidFireMinutes * 60 * 1000);
    });
    if (recent.length >= CONFIG.flags.rapidFireCount) flags.push("rapid-fire");
    if (raw.opponent) {
      var sameOpponent = entries.filter(function (entry) {
        return entry.player === player && entry.weekKey === weekKeyFor(now) && entry.opponent === escapePlayer(raw.opponent);
      });
      if (sameOpponent.length >= CONFIG.flags.repeatedOpponentCount) flags.push("repeated-opponent");
    }
    return flags;
  }

  /* ------------------------------------------------------------------ result intake */
  /* Returns { ok, code, reason?, entry?, flags? } — only ok:true results are recorded. */
  function evaluateResult(raw, nowDate) {
    var now = new Date(nowDate ? nowDate.getTime() : Date.now());
    var r = raw || {};
    var player = escapePlayer(r.player);
    var reason = "";
    if (!player) return { ok: false, code: "no-player" };
    if (isGuest(player) || String(r.player || "").trim() === "Guest (this device)") return { ok: false, code: "guest" };
    if (String(r.mode || "").toLowerCase() !== "bet") return { ok: false, code: "free-play" }; /* spec: free play never climbs */
    var stake = Math.round(Number(r.stakeCoins) || 0);
    if (stake < CONFIG.minStakeCoins) return { ok: false, code: "below-min-stake" };
    var creatorFor = r.creatorFor ? escapePlayer(r.creatorFor) : "";
    if (r.selfPlay === true || (creatorFor && creatorFor === player)) {
      return { ok: false, code: "creator-self-play" }; /* spec §9.2: never points, never prize from own quiz */
    }
    var perf = r.perf || {};
    var total = Number(perf.total) || 0;
    var score = Number(perf.score) || 0;
    if (total < 0 || score < 0 || (total > 0 && score > total)) return { ok: false, code: "impossible-result" };
    if (perf.place != null && perf.entrants != null && Number(perf.place) >= 1 && Number(perf.place) > Number(perf.entrants)) {
      return { ok: false, code: "impossible-result" };
    }
    var existing = allEntries();
    var duplicate = false;
    if (r.resultRef) {
      duplicate = existing.some(function (entry) {
        return entry.player === player && entry.resultRef === String(r.resultRef);
      });
    }
    if (!duplicate) {
      duplicate = existing.some(function (entry) {
        return entry.player === player && entry.gameType === r.gameType &&
          entry.perf && Number(entry.perf.total) === total && Number(entry.perf.score) === score &&
          Math.abs(new Date(now.getTime()) - new Date(entry.recordedAt || 0).getTime()) < 60 * 1000;
      });
    }
    if (duplicate) return { ok: false, code: "duplicate" };

    var gameType = String(r.gameType || "default").toLowerCase();
    var rule = CONFIG.scoring[gameType] || CONFIG.scoring.default || { mode: "accuracyPct" };
    var points = pointsForResult(gameType, perf, rule);
    if (!(points > 0)) return { ok: false, code: "no-points" };

    var week = weekKeyFor(now);
    /* Results freeze at period close: a late/stale result can never change a closed week. */
    var periodNow = periodState(week);
    if (periodNow.state !== "running") return { ok: false, code: "period-closed" };
    var flags = riskFlagsFor({ player: player, gameType: gameType, opponent: r.opponent }, existing, now);
    var entry = {
      id: String(r.id || "lb-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6)),
      weekKey: week,
      gameType: gameType,
      gameName: String(r.gameName || gameType),
      player: player,
      displayName: String(r.displayName || player),
      mode: "bet",
      stakeCoins: stake,
      feeCoins: Math.max(0, Math.round(Number(r.feeCoins) || 0)),
      perf: {
        score: score,
        total: total,
        place: perf.place != null ? Number(perf.place) : null,
        entrants: perf.entrants != null ? Number(perf.entrants) : null,
        won: perf.won === true
      },
      opponent: r.opponent ? escapePlayer(r.opponent) : "",
      creatorFor: creatorFor,
      resultRef: r.resultRef ? String(r.resultRef) : "",
      points: points,
      flags: flags,
      status: "active",            /* super-admin review can set "disqualified" before finalization */
      reviewedBy: "",
      reviewNote: "",
      recordedAt: nowISO(now)
    };
    return { ok: true, code: "ok", entry: entry, flags: flags };
  }

  function recordResult(raw, nowDate) {
    var verdict = evaluateResult(raw, nowDate);
    if (!verdict.ok) {
      appendAudit({
        actor: String((raw || {}).player || "unknown"),
        action: "result-rejected",
        detail: verdict.code + (verdict.reason ? " — " + verdict.reason : ""),
        periodKey: ""
      });
      return verdict;
    }
    var list = allEntries();
    list.push(verdict.entry);
    writeEntries(list);
    appendAudit({
      actor: verdict.entry.player,
      action: "result-recorded",
      detail: verdict.entry.gameType + " +" + verdict.entry.points + " pts (stake " + verdict.entry.stakeCoins + " coin) week " + verdict.entry.weekKey,
      periodKey: verdict.entry.weekKey
    });
    return verdict;
  }

  /* ------------------------------------------------------------------ standings / weekly ranking */
  function buildStandings(sourceEntries) {
    var map = {};
    var order = [];
    sourceEntries.forEach(function (entry) {
      if (entry.status === "disqualified") return;
      var row = map[entry.player];
      if (!row) {
        row = map[entry.player] = {
          rank: 0, player: entry.player, displayName: entry.displayName || entry.player,
          points: 0, plays: 0, games: {}, flags: [], firstAt: entry.recordedAt || ""
        };
        order.push(row);
      }
      row.points += Number(entry.points) || 0;
      row.plays += 1;
      row.games[entry.gameType] = (row.games[entry.gameType] || 0) + 1;
      (entry.flags || []).forEach(function (flag) { if (row.flags.indexOf(flag) === -1) row.flags.push(flag); });
      if (!row.firstAt || entry.recordedAt < row.firstAt) row.firstAt = entry.recordedAt;
    });
    order.sort(function (a, b) {
      if (b.points !== a.points) return b.points - a.points;   /* points desc */
      if (a.plays !== b.plays) return a.plays - b.plays;        /* fewer plays wins ties */
      return a.firstAt < b.firstAt ? -1 : a.firstAt > b.firstAt ? 1 : 0;
    });
    var lastPoints = null;
    var lastRank = 0;
    order.forEach(function (row, index) {
      if (row.points === lastPoints) row.rank = lastRank;       /* standard shared-rank (1,1,3...) */
      else { row.rank = index + 1; lastRank = index + 1; lastPoints = row.points; }
    });
    return order;
  }

  function liveStandings(periodKey) { return buildStandings(entriesFor(periodKey)); }

  /* What a period publicly shows: live while running, frozen/final once closed. */
  function standingsForView(periodKey) {
    var state = periodState(periodKey);
    if (state.state === "running") return { state: state.state, rows: liveStandings(periodKey) };
    if (state.final && state.final.length) return { state: state.state, rows: state.final };
    if (Array.isArray(state.frozen)) return { state: state.state, rows: state.frozen };
    return { state: state.state, rows: liveStandings(periodKey) };
  }

  /* ------------------------------------------------------------------ realized competition fees (fund the pool) */
  function allFees() { return readJSON(STORES.fees, []); }
  function writeFees(list) { writeJSON(STORES.fees, list); }
  /* Called by the future competition engine when a fee is REALIZED (never for free/voided play). */
  function recordRealizedFee(raw) {
    var feeCoins = Math.max(0, Math.round(Number((raw || {}).feeCoins) || 0));
    if (!(feeCoins > 0)) return { ok: false, code: "no-fee" };
    var list = allFees();
    var id = String(raw.id || "fee-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6));
    if (list.some(function (fee) { return fee.id === id; })) return { ok: false, code: "duplicate" };
    var at = new Date(raw.realizedAt ? raw.realizedAt : Date.now());
    var fee = {
      id: id,
      periodKey: raw.periodKey || weekKeyFor(at),
      competitionRef: String(raw.competitionRef || ""),
      gameType: String(raw.gameType || "default"),
      feeCoins: feeCoins,
      realizedAt: nowISO(at)
    };
    list.push(fee);
    writeFees(list);
    appendAudit({ actor: "competition-engine", action: "fee-realized", detail: "+" + feeCoins + " coins " + fee.periodKey, periodKey: fee.periodKey });
    return { ok: true, fee: fee };
  }
  function feesFor(periodKey) {
    return allFees().filter(function (fee) { return fee.periodKey === periodKey && fee.realized !== false; });
  }
  function feeTotal(periodKey) {
    return feesFor(periodKey).reduce(function (sum, fee) { return sum + (Number(fee.feeCoins) || 0); }, 0);
  }
  /* The revenue-funded pool: 30% of ELIGIBLE REALIZED competition fees for the period. */
  function poolCoins(periodKey) {
    return Math.floor(feeTotal(periodKey) * CONFIG.rewardPoolShare);
  }
  /* Spec §12 distribution table: #1..#10 percents; total always 100. Remainder coins go to #1 so the pool is never over- or under-paid. */
  function prizeRows(periodKey) {
    var cfg = effectiveConfig();
    var pool = poolCoins(periodKey);
    var rows = cfg.distribution.map(function (pct, index) {
      return { rank: index + 1, pct: pct, coins: Math.floor(pool * pct / 100) };
    });
    var granted = rows.reduce(function (sum, row) { return sum + row.coins; }, 0);
    if (pool > 0 && rows.length) rows[0].coins += pool - granted; /* remainder to rank #1 */
    return rows;
  }

  /* ------------------------------------------------------------------ settlement state machine (spec §12.1) */
  function opsStore() { return readJSON(STORES.ops, {}); }
  function writeOpsStore(store) { writeJSON(STORES.ops, store); }
  function periodState(periodKey) {
    var store = opsStore();
    return store[periodKey] || { state: "running" };
  }
  function savePeriodState(periodKey, state) {
    var store = opsStore();
    store[periodKey] = state;
    writeOpsStore(store);
  }
  function setState(periodKey, actor, next) {
    var state = periodState(periodKey);
    var from = state.state;
    if (next === "review" && (from === "closed" || from === "frozen")) state.state = next;
    else state.state = next;
    state.updatedAt = nowISO();
    state.updatedBy = String(actor || "team");
    savePeriodState(periodKey, state);
    appendAudit({ actor: actor || "team", action: "period-state", detail: from + " → " + state.state, periodKey: periodKey });
    return { ok: true, state: state.state };
  }

  function closePeriod(periodKey, actor, nowDate) {
    var now = new Date(nowDate ? nowDate.getTime() : Date.now());
    var state = periodState(periodKey);
    if (state.state === "credited") return { ok: false, code: "already-credited" };
    if (state.state !== "running") {
      return { ok: false, code: "already-closed", message: "This period is already out of the running state." };
    }
    var bounds = periodBounds(periodKey);
    if (now.getTime() < bounds.end.getTime()) {
      return { ok: false, code: "period-active", message: "This period ends " + periodLabel(periodKey) + " — results can still change." };
    }
    state.state = "closed";
    state.closedAt = nowISO(now);
    state.closedBy = String(actor || "team");
    state.frozen = liveStandings(periodKey).map(function (row) { return JSON.parse(JSON.stringify(row)); });
    state.frozenIds = entriesFor(periodKey).map(function (entry) { return entry.id; });
    savePeriodState(periodKey, state);
    appendAudit({ actor: actor || "team", action: "period-closed", detail: "results frozen — " + state.frozen.length + " ranked player(s), " + state.frozenIds.length + " result(s)", periodKey: periodKey });
    return { ok: true, state: state.state, frozenCount: state.frozen.length };
  }

  /* Anti-abuse review: an explicit super-admin decision per flagged entry (spec: suspicious
     accounts never auto-reward). Decision applies to the source entry; finalization excludes
     disqualified rows and later restores only via another explicit decision. */
  function setEntryEligibility(periodKey, entryId, eligible, actor, note) {
    var list = allEntries();
    var entry = null;
    list.forEach(function (item) {
      if (item.id === entryId && item.weekKey === periodKey && item.status !== "credited") entry = item;
    });
    if (!entry) return { ok: false, code: "not-found" };
    var state = periodState(periodKey);
    if (state.state === "credited") return { ok: false, code: "already-credited" };
    if (state.state === "running") return { ok: false, code: "period-active" };
    entry.status = eligible ? "active" : "disqualified";
    entry.reviewedBy = String(actor || "team");
    entry.reviewNote = String(note || "");
    writeEntries(list);
    if (state.state === "closed" || state.state === "frozen") {
      state.state = "review";
      state.updatedAt = nowISO();
      state.updatedBy = String(actor || "team");
    }
    /* A decision after finalization/prize calculation invalidates the locked ranking:
       the period reopens for review and every downstream result is cleared so the
       super-admin must re-finalize and re-calculate before any credit. */
    if (state.state === "final" || state.state === "prizes") {
      state.state = "review";
      state.final = null;
      state.prizes = null;
      state.poolCoins = 0;
      state.issued = null;
      state.reopenedAt = nowISO();
      state.updatedAt = nowISO();
      state.updatedBy = String(actor || "team");
    }
    savePeriodState(periodKey, state);
    appendAudit({
      actor: actor || "team",
      action: eligible ? "eligibility-restored" : "eligibility-revoked",
      detail: (entry.displayName || entry.player) + " " + entry.id + (note ? " — " + note : ""),
      periodKey: periodKey
    });
    return { ok: true, status: entry.status, state: state.state };
  }

  function finalizePeriod(periodKey, actor) {
    var state = periodState(periodKey);
    if (state.state === "running") return { ok: false, code: "period-active" };
    if (state.state === "credited") return { ok: false, code: "already-credited" };
    /* Frozen ids guard: only entries that existed when the period closed are ranked. */
    var frozenIds = (state.frozenIds || []).slice();
    var eligible = entriesFor(periodKey).filter(function (entry) {
      if (entry.status === "disqualified") return false;
      if (frozenIds.length && frozenIds.indexOf(entry.id) === -1) return false;
      return true;
    });
    state.final = buildStandings(eligible);
    state.finalizedAt = nowISO();
    savePeriodState(periodKey, state);
    setState(periodKey, actor, "final");
    appendAudit({ actor: actor || "team", action: "final-ranking", detail: state.final.length + " ranked", periodKey: periodKey });
    return { ok: true, rows: state.final };
  }

  function computePrizes(periodKey, actor) {
    var state = periodState(periodKey);
    if (state.state === "running") return { ok: false, code: "period-active" };
    if (state.state === "credited") return { ok: false, code: "already-credited" };
    if (!state.final || !state.final.length) return { ok: false, code: "finalize-first" }; /* spec order: FINAL RANKING before PRIZE CALCULATION */
    var pool = poolCoins(periodKey);
    state.poolCoins = pool;
    state.prizes = prizeRows(periodKey);
    state.prizesComputedAt = nowISO();
    savePeriodState(periodKey, state);
    setState(periodKey, actor, "prizes");
    appendAudit({
      actor: actor || "team",
      action: "prize-calculation",
      detail: "pool " + pool + " coins from realized fees (" + feeTotal(periodKey) + " × " + Math.round(CONFIG.rewardPoolShare * 100) + "%)",
      periodKey: periodKey
    });
    return { ok: true, poolCoins: pool, prizes: state.prizes };
  }

  /* Credits ride the SAME approval -> credit-mirror flow as purchases; the user's device
     claims them in syncApprovedCoinCredits() and adds them to the coin balance. */
  function issueCredits(periodKey, actor) {
    var state = periodState(periodKey);
    if (state.state === "running") return { ok: false, code: "period-active" };
    if (state.state === "credited") return { ok: false, code: "already-credited" };
    if (state.state !== "prizes") return { ok: false, code: "prizes-not-computed" }; /* spec order: PRIZE CALCULATION before CREDIT */
    var pool = Number(state.poolCoins) || 0;
    var prizes = (state.prizes || []).slice();
    if (!(pool > 0) || !prizes.length) {
      return { ok: false, code: "unfunded-pool", message: "The reward pool is 0 coins — an unfunded pool never pays." };
    }
    var rows = (state.final || []).slice(0, CONFIG.rewardRanks);
    var mirrors = readJSON(STORES.mirrors, []);
    var issued = [];
    rows.forEach(function (row) {
      var prize = null;
      prizes.forEach(function (candidate) { if (candidate.rank === row.rank) prize = candidate; });
      var coins = prize ? Number(prize.coins) || 0 : 0;
      if (!(coins > 0)) return;
      var at = nowISO();
      var creditId = "lb-" + periodKey + "-r" + row.rank;
      if (mirrors.some(function (m) { return m.id === creditId; })) return; /* idempotent */
      mirrors.push({
        for: row.player,
        displayName: row.displayName,
        coins: coins,
        at: at,
        id: creditId,
        kind: "weekly-leaderboard-reward",
        period: periodKey,
        rank: row.rank,
        reason: "Weekly leaderboard #" + row.rank + " — " + periodLabel(periodKey)
      });
      issued.push({ player: row.player, rank: row.rank, coins: coins });
      appendAudit({ actor: actor || "team", action: "reward-credited", detail: creditId + " → " + row.player + " +" + coins, periodKey: periodKey });
    });
    if (!issued.length) return { ok: false, code: "nothing-to-credit" };
    writeJSON(STORES.mirrors, mirrors);
    state.creditedAt = nowISO();
    state.creditedBy = String(actor || "team");
    state.issued = issued;
    savePeriodState(periodKey, state);
    setState(periodKey, actor, "credited");
    return { ok: true, issued: issued };
  }

  /* ------------------------------------------------------------------ public API */
  var api = {
    STORES: STORES,
    CONFIG_VERSION: "1",
    effectiveConfig: effectiveConfig,
    startOfWeek: startOfWeek,
    endOfWeek: endOfWeek,
    weekKeyFor: weekKeyFor,
    currentWeekKey: function (now) { return weekKeyFor(new Date(now ? now : Date.now())); },
    periodBounds: periodBounds,
    periodLabel: periodLabel,
    previousPeriodKey: previousPeriodKey,
    recentPeriodKeys: recentPeriodKeys,
    evaluateResult: evaluateResult,
    recordResult: recordResult,
    liveStandings: liveStandings,
    standingsForView: standingsForView,
    entriesFor: entriesFor,
    recordRealizedFee: recordRealizedFee,
    feesFor: feesFor,
    feeTotal: feeTotal,
    poolCoins: poolCoins,
    prizeRows: prizeRows,
    periodState: periodState,
    closePeriod: closePeriod,
    setEntryEligibility: setEntryEligibility,
    finalizePeriod: finalizePeriod,
    computePrizes: computePrizes,
    issueCredits: issueCredits,
    auditLog: auditLog,
    isGuestPlayer: isGuest,
    DISTRIBUTION_SPEC: "30/20/15/10/9/6/4/3/2/1" /* exact spec §12 table, kept for fixtures */
  };
  if (typeof window !== "undefined") window.ParagonLeaderboards = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
