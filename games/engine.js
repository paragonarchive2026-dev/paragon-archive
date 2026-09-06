/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: engine.js
  EXPECTED PROJECT PATH: /games/engine.js
  ROLE: ParagonGameEngine — the ONE shared game framework (P-114 / GAMES-BUILD-PLAN.md §2, §5).
        Every Paragon game imports this file. It owns: the game registry read, session
        lifecycle, seeded RNG, scoring + personal bests, save/resume checkpoints, the
        free-vs-stake gate, anti-cheat plausibility flags, audit rows and the leaderboard
        hook. Games own ONLY their own rules and drawing.
  PLATFORM LAWS ENFORCED HERE (never relax):
        · FREE play is always open — guest included, offline included, NEVER coins.
        · STAKE play requires: registered member + team-approved KYC + real-money ON
          + no financial pause + no per-game kill switch. The browser NEVER settles a
          money outcome and NEVER mints coins; stake results go to the server/Team.
        · Leaderboard POINTS are only ever written for eligible STAKED results
          (ParagonLeaderboards.recordResult) — free play records local bests only.
        · One suspicious signal never bans anyone: it opens a Risk case for review.
  RESTORE-LOAD NOTE: Load AFTER games/manifest.js, paragon-leaderboards.js and
        paragon-wallets.js when those engines are present; the engine degrades honestly
        to local-only when they are absent (standalone game page).
*/
(function (global) {
  "use strict";

  var STORES = {
    sessions: "paragonGames.sessions.v1",
    open: "paragonGames.open.v1",
    bests: "paragonGames.bests.v1",
    stats: "paragonGames.stats.v1"
  };

  var MAX_SESSIONS = 120;

  /* ------------------------------------------------------------------ storage (P-009 honest: real zero) */
  function store() {
    try {
      if (global.localStorage) return global.localStorage;
    } catch (error) { /* blocked */ }
    if (global.window && global.window.localStorage) return global.window.localStorage;
    return null;
  }

  function readJSON(key, fallback) {
    var s = store();
    if (!s) return fallback;
    try {
      var raw = s.getItem(key);
      if (raw == null || raw === "") return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    var s = store();
    if (!s) return false;
    try {
      s.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  /* ------------------------------------------------------------------ small utilities */
  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function nowISO(date) {
    try {
      return new Date(date || Date.now()).toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  function clampNumber(value, fallback) {
    var n = Number(value);
    return isFinite(n) ? n : (fallback || 0);
  }

  /* Deterministic hash of an action log — lets a server/Team replay-check a result later.
     FNV-1a, 32-bit, hex. Not cryptography; it is an audit fingerprint (plan §5). */
  function hashLog(log) {
    var text = Array.isArray(log) ? log.join("|") : String(log == null ? "" : log);
    var hash = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
    }
    return ("0000000" + hash.toString(16)).slice(-8);
  }

  /* Seeded RNG (mulberry32) — every session carries its seed so a staked result can be
     replayed and audited. Games MUST draw through session.random() so a result can be
     replayed exactly — never through an unseeded platform draw. */
  function rngFromSeed(seedInput) {
    var seed = (Number(seedInput) >>> 0) || 1;
    return function () {
      seed = (seed + 0x6d2b79f5) >>> 0;
      var t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomSeed() {
    try {
      if (global.crypto && typeof global.crypto.getRandomValues === "function") {
        var buffer = new Uint32Array(1);
        global.crypto.getRandomValues(buffer);
        return buffer[0] >>> 0;
      }
    } catch (error) { /* fall through */ }
    return Math.floor(Math.random() * 4294967295) >>> 0;
  }

  /* ------------------------------------------------------------------ registry (from games/manifest.js) */
  function manifest() {
    var list = (global.ParagonGameManifest && Array.isArray(global.ParagonGameManifest.games))
      ? global.ParagonGameManifest.games
      : [];
    return list;
  }

  function game(key) {
    var found = null;
    manifest().forEach(function (entry) {
      if (String(entry.key) === String(key)) found = entry;
    });
    return found;
  }

  function variant(gameKey, variantKey) {
    var g = game(gameKey);
    if (!g || !Array.isArray(g.variants)) return null;
    var found = null;
    g.variants.forEach(function (v) {
      if (String(v.key) === String(variantKey)) found = v;
    });
    return found;
  }

  /* ------------------------------------------------------------------ the host adapter
     The Archive page (app.js) can inject its real identity/KYC/coin functions so the gate
     reads live platform state. Standalone game pages get the honest local fallback: no
     member, no KYC, real money OFF — which means stake is simply not offered. */
  var hostHooks = {};

  function setHost(hooks) {
    hostHooks = hooks && typeof hooks === "object" ? hooks : {};
    return hostHooks;
  }

  function host() { return hostHooks; }

  function readKycStatus() {
    try {
      var raw = store() ? store().getItem("paragon.kycPayout.v1") : null;
      if (!raw) return "none";
      var parsed = JSON.parse(raw);
      return parsed && parsed.status === "approved" ? "approved" : "pending";
    } catch (error) {
      return "none";
    }
  }

  function looksSignedIn() {
    var s = store();
    if (!s) return false;
    try {
      if (s.getItem("paragonArchive.supabase.session")) return true;
      for (var i = 0; i < s.length; i++) {
        var key = s.key(i);
        if (key && /auth-token|supabase\.auth/i.test(key)) return true;
      }
    } catch (error) { /* blocked */ }
    return false;
  }

  function hostValue(name, fallbackFn) {
    var hook = hostHooks[name];
    if (typeof hook === "function") {
      try {
        var value = hook();
        if (value !== undefined && value !== null) return value;
      } catch (error) { /* host absent — degrade honestly */ }
    }
    return fallbackFn ? fallbackFn() : null;
  }

  /* ------------------------------------------------------------------ the stake gate (plan §2)
     Returns EVERY reason at once so the UI can explain itself honestly instead of
     failing silently. Nothing here ever moves coins. */
  function gate(options) {
    var opts = options || {};
    var gameKey = String(opts.gameKey || "");
    var stakeCoins = Math.round(clampNumber(opts.stakeCoins, 0));
    var reasons = [];
    var entry = game(gameKey);

    var checks = {
      gameKnown: !!entry,
      supportsStake: !!(entry && entry.supportsStake === true),
      stakeInRange: false,
      stakeStepOk: false,
      killSwitchClear: true,
      notFinanciallyPaused: true,
      realMoneyOn: false,
      kycApproved: false,
      registeredMember: false
    };

    if (!checks.gameKnown) reasons.push({ code: "unknown-game", message: "This game is not registered in the games manifest." });

    if (entry) {
      if (!checks.supportsStake) {
        reasons.push({ code: "no-stake-support", message: entry.name + " is a free-play game — it takes no stakes." });
      } else {
        var min = Number(entry.minStake) || 100;
        var max = Number(entry.maxStake) || 10000;
        var step = Number(entry.stakeStep) || 50;
        checks.stakeInRange = stakeCoins >= min && stakeCoins <= max;
        checks.stakeStepOk = stakeCoins > 0 && (stakeCoins % step === 0);
        if (!checks.stakeInRange) {
          reasons.push({ code: "stake-range", message: "Stake must be between " + min.toLocaleString() + " and " + max.toLocaleString() + " coins." });
        }
        if (!checks.stakeStepOk) {
          reasons.push({ code: "stake-step", message: "Stake must be a multiple of " + step + " coins." });
        }
      }
    }

    /* Per-game kill switch (ParagonWallets owns it — the wallet engine is the authority). */
    var wallets = global.ParagonWallets;
    if (wallets && typeof wallets.gameKillState === "function") {
      try {
        var kill = wallets.gameKillState(gameKey) || {};
        checks.killSwitchClear = kill.killed !== true;
        if (!checks.killSwitchClear) {
          reasons.push({ code: "kill-switch", message: "Stakes are switched off for this game by the Paragon Team" + (kill.reason ? " (" + kill.reason + ")" : "") + "." });
        }
      } catch (error) { /* engine absent */ }
    }

    /* Platform-wide financial pause. */
    if (wallets && typeof wallets.controls === "function") {
      try {
        var controls = wallets.controls() || {};
        checks.notFinanciallyPaused = controls.paused !== true;
        if (!checks.notFinanciallyPaused) {
          reasons.push({ code: "financial-pause", message: "All money movement is paused platform-wide by the Paragon Team." });
        }
      } catch (error) { /* engine absent */ }
    }

    /* Real-money mode — server flag first (window.ParagonCoinPublicConfig), host second. */
    var publicCfg = global.ParagonCoinPublicConfig || null;
    var realMoney = null;
    if (publicCfg && typeof publicCfg === "object" && "real_money_enabled" in publicCfg) {
      realMoney = publicCfg.real_money_enabled === true;
    } else if (publicCfg && typeof publicCfg === "object" && "realMoney" in publicCfg) {
      realMoney = publicCfg.realMoney === true;
    }
    if (realMoney === null) realMoney = hostValue("realMoneyEnabled", function () { return false; }) === true;
    checks.realMoneyOn = realMoney === true;
    if (!checks.realMoneyOn) reasons.push({ code: "real-money-off", message: "Paragon Coins real-money mode is OFF — only free play is open." });

    /* KYC — team-approved or nothing (owner rule). */
    checks.kycApproved = hostValue("kycApproved", function () { return readKycStatus() === "approved"; }) === true;
    if (!checks.kycApproved) reasons.push({ code: "kyc", message: "Staked play needs team-approved KYC (same KYC as buying and withdrawing)." });

    /* Registered member — never a guest. */
    checks.registeredMember = hostValue("isRegisteredMember", function () { return looksSignedIn(); }) === true;
    if (!checks.registeredMember) reasons.push({ code: "guest", message: "Sign in with a real account to stake. Guests stay free-play only." });

    var allowed = reasons.length === 0;
    return { allowed: allowed, reasons: reasons, checks: checks, stakeCoins: stakeCoins, gameKey: gameKey };
  }

  /* ------------------------------------------------------------------ bests + stats (free play earns these, never coins) */
  function bestKey(gameKey, variantKey, mode) {
    return String(gameKey) + ":" + String(variantKey || "default") + ":" + String(mode || "free");
  }

  function bests() {
    var raw = readJSON(STORES.bests, null);
    return raw && typeof raw === "object" ? raw : {};
  }

  function best(gameKey, variantKey, mode) {
    var row = bests()[bestKey(gameKey, variantKey, mode)];
    return row && typeof row === "object" ? row : null;
  }

  function stats(gameKey) {
    var all = readJSON(STORES.stats, null) || {};
    var row = all[String(gameKey)];
    if (!row || typeof row !== "object") {
      row = {
        gameKey: String(gameKey),
        plays: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        abandoned: 0,
        totalScore: 0,
        bestScore: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastPlayedAt: "",
        updatedAt: ""
      };
    }
    return row;
  }

  function saveStats(row) {
    var all = readJSON(STORES.stats, null) || {};
    all[row.gameKey] = row;
    return writeJSON(STORES.stats, all);
  }

  /* ------------------------------------------------------------------ sessions + audit */
  function sessions() {
    var list = readJSON(STORES.sessions, null);
    return Array.isArray(list) ? list : [];
  }

  function saveSession(session) {
    var list = sessions();
    var index = -1;
    list.forEach(function (row, i) { if (row && row.id === session.id) index = i; });
    if (index >= 0) list[index] = session;
    else list.unshift(session);
    writeJSON(STORES.sessions, list.slice(0, MAX_SESSIONS));
    return session;
  }

  function openSessions() {
    var raw = readJSON(STORES.open, null);
    return raw && typeof raw === "object" ? raw : {};
  }

  function saveOpenSession(session) {
    var all = openSessions();
    all[bestKey(session.gameKey, session.variant, session.mode)] = session;
    return writeJSON(STORES.open, all);
  }

  function resume(gameKey, variantKey, mode) {
    var all = openSessions();
    var row = all[bestKey(gameKey, variantKey, mode)];
    return row && typeof row === "object" ? row : null;
  }

  function clearResume(gameKey, variantKey, mode) {
    var all = openSessions();
    delete all[bestKey(gameKey, variantKey, mode)];
    return writeJSON(STORES.open, all);
  }

  function audit(actor, action, detail, ref) {
    var wallets = global.ParagonWallets;
    if (wallets && typeof wallets.appendAudit === "function") {
      try {
        wallets.appendAudit(String(actor || "player"), String(action), String(detail || ""), String(ref || ""));
        return true;
      } catch (error) { /* engine absent */ }
    }
    return false;
  }

  /* One suspicious signal opens a Risk case for humans. NEVER an auto-ban (repo law). */
  function flagForReview(session, code, detail) {
    var wallets = global.ParagonWallets;
    if (!wallets || typeof wallets.openRiskCase !== "function") return null;
    try {
      return wallets.openRiskCase({
        user: String(session.player || ""),
        displayName: String(session.displayName || session.player || "player"),
        type: "game-plausibility",
        reason: code + " — " + detail,
        linkedRefs: [String(session.id)],
        flags: [String(code), session.mode === "stake" ? "stake" : "free"],
        actor: "game-engine"
      });
    } catch (error) {
      return null;
    }
  }

  /* ------------------------------------------------------------------ the session */
  function start(config) {
    var cfg = config || {};
    var gameKey = String(cfg.gameKey || "");
    var entry = game(gameKey);

    if (!entry) {
      return { ok: false, code: "unknown-game", message: "Game \"" + gameKey + "\" is not in the games manifest." };
    }

    var variantKey = String(cfg.variant || (entry.variants && entry.variants[0] ? entry.variants[0].key : "default"));
    var mode = String(cfg.mode || "free") === "stake" ? "stake" : "free";
    var stakeCoins = Math.round(clampNumber(cfg.stakeCoins, 0));

    if (mode === "stake") {
      var verdict = gate({ gameKey: gameKey, stakeCoins: stakeCoins });
      if (!verdict.allowed) {
        return { ok: false, code: "stake-blocked", verdict: verdict, message: verdict.reasons[0] ? verdict.reasons[0].message : "Staked play is not available." };
      }
    }

    var minDurationMs = Number((variant(gameKey, variantKey) || {}).minDurationMs);
    if (!isFinite(minDurationMs) || minDurationMs < 0) {
      minDurationMs = Number(entry.minDurationMs) || 0;
    }

    /* ---------------------------------------------------------------- resume (honest continue)
       When the caller asks to resume, we rehydrate the SAME session record — same id, same
       seed, same action log, same score — instead of minting a fresh one. The RNG is
       fast-forwarded by the number of draws already made so a resumed game stays
       deterministic and replayable like any other. */
    var prior = cfg.resume === true ? resume(gameKey, variantKey, mode) : null;
    var isResumed = !!(prior && prior.id && !prior.endedAt && String(prior.gameKey) === gameKey && String(prior.variant) === variantKey);

    var session = isResumed ? prior : {
      id: uid("gs"),
      gameKey: gameKey,
      gameName: String(entry.name || gameKey),
      variant: variantKey,
      mode: mode,
      stakeCoins: mode === "stake" ? stakeCoins : 0,
      seed: cfg.seed != null ? (Number(cfg.seed) >>> 0) : randomSeed(),
      player: String(cfg.player || hostValue("playerId", function () { return ""; }) || ""),
      displayName: String(cfg.displayName || hostValue("displayName", function () { return ""; }) || ""),
      startedAt: nowISO(),
      startedAtMs: Date.now(),
      endedAt: "",
      durationMs: 0,
      score: 0,
      outcome: "incomplete",
      actions: [],
      flags: [],
      meta: cfg.meta && typeof cfg.meta === "object" ? cfg.meta : {},
      state: null,
      draws: 0
    };

    if (isResumed) {
      session.resumeCount = (Number(session.resumeCount) || 0) + 1;
      session.lastResumedAt = nowISO();
      session.actions = Array.isArray(session.actions) ? session.actions : [];
      session.flags = Array.isArray(session.flags) ? session.flags : [];
      session.meta = session.meta && typeof session.meta === "object" ? session.meta : {};
      session.endedAt = "";
    }

    var random = rngFromSeed(session.seed);
    var drawsMade = Math.max(0, Number(session.draws) || 0);
    for (var warm = 0; warm < drawsMade; warm++) random();

    var finished = false;
    var timer = null;

    function persist() {
      saveOpenSession(session);
      if (finished) saveSession(session);
    }

    function elapsed() {
      return Math.max(0, Date.now() - Number(session.startedAtMs || Date.now()));
    }

    /* Plausibility check (plan §5): a result submitted faster than the game can
       physically be played is flagged, never silently accepted and never auto-banned. */
    function plausibility() {
      var duration = session.durationMs || elapsed();
      if (minDurationMs > 0 && duration < minDurationMs) {
        var code = "impossible-speed";
        if (session.flags.indexOf(code) === -1) session.flags.push(code);
        var detail = session.gameKey + "/" + session.variant + " finished in " + duration + "ms (minimum plausible " + minDurationMs + "ms)";
        audit(session.player || "player", "GAME_PLAUSIBILITY_FLAGGED", detail, session.id);
        flagForReview(session, code, detail);
        return { ok: false, code: code, detail: detail };
      }
      return { ok: true, code: "ok" };
    }

    function applyOutcome(outcome) {
      var row = stats(session.gameKey);
      row.plays = Number(row.plays || 0) + 1;
      row.totalScore = Number(row.totalScore || 0) + Math.max(0, Number(session.score) || 0);
      if (outcome === "win") {
        row.wins += 1;
        row.currentStreak = Number(row.currentStreak || 0) + 1;
        row.bestStreak = Math.max(Number(row.bestStreak || 0), row.currentStreak);
      } else if (outcome === "loss") {
        row.losses += 1;
        row.currentStreak = 0;
      } else if (outcome === "draw") {
        row.draws += 1;
      } else {
        row.abandoned += 1;
        row.currentStreak = 0;
      }
      row.bestScore = Math.max(Number(row.bestScore || 0), Math.max(0, Number(session.score) || 0));
      row.lastPlayedAt = nowISO();
      row.updatedAt = nowISO();
      saveStats(row);
      return row;
    }

    function applyBest() {
      var all = bests();
      var key = bestKey(session.gameKey, session.variant, session.mode);
      var current = all[key];
      /* P-009 honesty: a personal best needs a REAL score. A first game that ends on zero
         (a busted shoe, ten wrong calls) is recorded in stats but is never celebrated as
         a "new personal best" — the home page keeps showing an honest 0 until one is set. */
      var scoreNow = Math.max(0, Number(session.score) || 0);
      var isBest = scoreNow > 0 && (!current || scoreNow > Number(current.score || 0));
      if (isBest) {
        all[key] = {
          score: Math.max(0, Number(session.score) || 0),
          outcome: session.outcome,
          at: nowISO(),
          seed: session.seed,
          durationMs: session.durationMs
        };
        writeJSON(STORES.bests, all);
      }
      return { isBest: isBest, best: all[key] };
    }

    function settle(options) {
      if (finished) return api;
      var opts = options || {};
      finished = true;
      if (timer) { try { global.clearInterval(timer); } catch (error) { /* noop */ } timer = null; }

      if (opts.score !== undefined && opts.score !== null) session.score = Math.max(0, Math.round(clampNumber(opts.score, 0)));
      session.durationMs = Number(session.durationMs) || elapsed();
      session.endedAt = nowISO();
      session.outcome = String(opts.outcome || "incomplete");
      session.meta = Object.assign({}, session.meta, opts.meta && typeof opts.meta === "object" ? opts.meta : {});

      var check = plausibility();
      var bestResult = session.outcome === "abandoned" ? { isBest: false, best: best(session.gameKey, session.variant, session.mode) } : applyBest();
      var row = applyOutcome(session.outcome);

      clearResume(session.gameKey, session.variant, session.mode);
      saveSession(session);

      audit(session.player || "player", "GAME_" + String(session.outcome).toUpperCase(),
        session.gameKey + "/" + session.variant + " " + session.mode + " score " + session.score +
        (session.mode === "stake" ? " stake " + session.stakeCoins + "c" : " free") +
        " · " + session.durationMs + "ms · actions " + session.actions.length + " · log " + hashLog(session.actions) +
        (check.ok ? "" : " · FLAGGED " + check.code),
        session.id);

      var summary = {
        session: session,
        isBest: bestResult.isBest === true,
        best: bestResult.best,
        stats: row,
        plausibility: check,
        flags: session.flags.slice()
      };

      if (typeof opts.onSettled === "function") {
        try { opts.onSettled(summary); } catch (error) { /* a broken UI must never corrupt the record */ }
      }
      if (typeof cfg.onFinish === "function") {
        try { cfg.onFinish(summary); } catch (error) { /* a broken UI must never corrupt the record */ }
      }
      return api;
    }

    var api = {
      session: session,
      game: entry,
      mode: session.mode,
      seed: session.seed,

      /* Games MUST draw through this so a seeded result can be replayed later. The draw
         counter is persisted so a resumed session replays the same sequence. */
      random: function () {
        session.draws = (Number(session.draws) || 0) + 1;
        return random();
      },
      next: function () { return api.random(); },
      int: function (maxExclusive) {
        var max = Math.max(1, Math.floor(Number(maxExclusive) || 1));
        return Math.floor(api.random() * max);
      },
      pick: function (list) {
        var arr = Array.isArray(list) ? list : [];
        if (!arr.length) return null;
        return arr[Math.floor(api.random() * arr.length)];
      },

      /* Append-only action log — the audit trail for every decision the player made. */
      action: function (name, detail) {
        session.actions.push(String(name) + (detail === undefined ? "" : ":" + String(detail)));
        if (session.actions.length > 500) session.actions.splice(0, session.actions.length - 500);
        persist();
        return api;
      },

      flag: function (code) {
        if (code && session.flags.indexOf(String(code)) === -1) session.flags.push(String(code));
        persist();
        return api;
      },

      score: function (value) {
        session.score = Math.max(0, Math.round(clampNumber(value, session.score)));
        if (typeof cfg.onScore === "function") {
          try { cfg.onScore(session.score, api); } catch (error) { /* noop */ }
        }
        persist();
        return session.score;
      },

      add: function (delta) {
        return api.score((Number(session.score) || 0) + Math.round(clampNumber(delta, 0)));
      },

      /* Save/resume: the game hands its own board state over and gets it back verbatim. */
      checkpoint: function (state) {
        if (state !== undefined) session.state = state;
        persist();
        return session.state;
      },

      finish: function (options) { return settle(options); },

      win: function (options) {
        var opts = options || {};
        opts.outcome = "win";
        return settle(opts);
      },

      lose: function (options) {
        var opts = options || {};
        opts.outcome = "loss";
        return settle(opts);
      },

      draw: function (options) {
        var opts = options || {};
        opts.outcome = "draw";
        return settle(opts);
      },

      /* Abandon must never trap coins: in stake mode the caller (server/Team) unlocks.
         The engine marks it abandoned and clears the resume slot. */
      abandon: function (reason) {
        var opts = { outcome: "abandoned", meta: { abandonReason: String(reason || "player-quit") } };
        return settle(opts);
      },

      elapsed: elapsed,
      state: function () { return session; },
      isFinished: function () { return finished; },
      logHash: function () { return hashLog(session.actions); }
    };

    saveOpenSession(session);
    audit(session.player || "player", isResumed ? "GAME_RESUMED" : "GAME_STARTED",
      session.gameKey + "/" + session.variant + " " + session.mode + (session.mode === "stake" ? " stake " + session.stakeCoins + "c" : " free") +
      " · seed " + session.seed + (isResumed ? " · resume #" + session.resumeCount : ""),
      session.id);

    return { ok: true, session: session, api: api, resumed: isResumed };
  }

  /* ------------------------------------------------------------------ leaderboard hook (STAKED results ONLY)
     Nothing in free play ever calls this. It exists NOW so that when stake mode ships the
     wiring is already correct: points come from ParagonLeaderboards.recordResult, which
     refuses zero-stake and non-bet entries on its own (Stage 5 law). */
  function recordStakedResult(raw) {
    var payload = Object.assign({}, raw || {}, { mode: "bet" });
    if (!Number(payload.stakeCoins)) {
      return { ok: false, code: "stake-required", message: "Free play never earns leaderboard points." };
    }
    var boards = global.ParagonLeaderboards;
    if (!boards || typeof boards.recordResult !== "function") {
      return { ok: false, code: "no-leaderboard-engine" };
    }
    try {
      return boards.recordResult(payload);
    } catch (error) {
      return { ok: false, code: "leaderboard-error", message: String((error && error.message) || error) };
    }
  }

  /* ------------------------------------------------------------------ public API */
  var engine = {
    STORES: STORES,
    CONFIG_VERSION: "1",
    manifest: manifest,
    game: game,
    variant: variant,
    start: start,
    resume: resume,
    clearResume: clearResume,
    sessions: sessions,
    best: best,
    bests: bests,
    stats: stats,
    gate: gate,
    setHost: setHost,
    host: host,
    audit: audit,
    flagForReview: flagForReview,
    recordStakedResult: recordStakedResult,
    hashLog: hashLog,
    rngFromSeed: rngFromSeed,
    randomSeed: randomSeed,
    uid: uid,
    nowISO: nowISO,
    /* The free/stake law in one sentence, used by the shared HUD chip. */
    LAW: "Free play never touches coins. Stakes settle on the server — the browser is never the referee."
  };

  if (typeof global !== "undefined") global.ParagonGames = engine;
  if (global.window) global.window.ParagonGames = engine;
})(typeof window !== "undefined" ? window : globalThis);
