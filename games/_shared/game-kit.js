/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: game-kit.js
  EXPECTED PROJECT PATH: /games/_shared/game-kit.js
  ROLE: The shared game screen shell (GAMES-BUILD-PLAN.md §6). Every Paragon game gets the
        same head: mode chip, stat bar, one-tap rules card, quit panel and result overlay —
        all rendered through games/engine.js so no game can accidentally invent its own
        coin, stake or anti-cheat behaviour. Games keep ONLY their own board and rules.
  PLATFORM LAWS: no window.alert/prompt/confirm (inline panels only); every game states its
        rules in one tappable card; the stake chip is always honest about WHY it is locked.
  RESTORE-LOAD NOTE: Load after games/manifest.js and games/engine.js, before the game's own
        js/<game>.js. Works standalone (no Archive) — it degrades to free play only.
*/
(function (global) {
  "use strict";

  var doc = global.document;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function el(id) {
    if (!id || !doc) return null;
    if (typeof id === "object") return id;
    return doc.querySelector(id);
  }

  function make(tag, className, html) {
    var node = doc.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  /* ------------------------------------------------------------------ honest stake explanations */
  function stakeChip(gameKey) {
    var games = global.ParagonGames;
    var entry = games ? games.game(gameKey) : null;
    if (!entry || entry.supportsStake !== true) {
      return {
        html: '<span class="gk-chip gk-chip-nostake" title="This game is free-play only — it takes no stakes.">FREE ONLY</span>',
        reasons: []
      };
    }
    var verdict = games.gate({ gameKey: gameKey, stakeCoins: Number(entry.minStake) || 100 });
    if (verdict.allowed) {
      return {
        html: '<span class="gk-chip gk-chip-stake">STAKE AVAILABLE</span>',
        reasons: []
      };
    }
    var reasons = verdict.reasons.map(function (r) { return r.message; });
    return {
      html: '<button type="button" class="gk-chip gk-chip-locked" data-gk="stake-why" title="' + esc(reasons.join(" ")) + '">STAKE · LOCKED</button>',
      reasons: reasons
    };
  }

  function rulesMarkup(entry, variantRow) {
    var games = global.ParagonGames;
    var rules = (variantRow && Array.isArray(variantRow.rules) ? variantRow.rules : []);
    var summary = (variantRow && variantRow.summary) || "";
    var list = rules.length
      ? rules.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("")
      : "<li>Rules for this mode are not published yet.</li>";

    var stakeRows = "";
    if (entry && entry.supportsStake) {
      var chip = stakeChip(entry.key);
      var why = chip.reasons.length
        ? chip.reasons.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("")
        : "<li>All stake checks pass on this device.</li>";
      stakeRows = '<h4>Staked play</h4>' +
        "<p>Stakes are " + (Number(entry.minStake) || 0) + "–" + (Number(entry.maxStake) || 0) +
        " coins in steps of " + (Number(entry.stakeStep) || 50) + ". Coins are locked by the server and the Paragon Team settles the result — this browser never decides who won.</p>" +
        "<ul>" + why + "</ul>";
    } else {
      stakeRows = "<h4>Staked play</h4><p>This game is free-play only by design — it never takes a stake.</p>";
    }

    return '<div class="gk-rules-body">' +
      (summary ? "<p>" + esc(summary) + "</p>" : "") +
      "<h4>Rules</h4><ul>" + list + "</ul>" +
      stakeRows +
      '<p class="gk-rules-law">💠 ' + esc((games && games.LAW) || "Free play never touches coins.") + "</p>" +
      "</div>";
  }

  /* ------------------------------------------------------------------ the shell */
  function mount(config) {
    var cfg = config || {};
    var games = global.ParagonGames;
    if (!games) return { ok: false, code: "no-engine", message: "games/engine.js must load before game-kit.js." };

    var host = el(cfg.hud || "#game-hud");
    if (!host) return { ok: false, code: "no-host", message: "No HUD container found." };

    var gameKey = String(cfg.gameKey || "");
    var variantKey = String(cfg.variant || "");
    var entry = games.game(gameKey);
    var variantRow = games.variant(gameKey, variantKey);
    var statDefs = Array.isArray(cfg.stats) ? cfg.stats : [];

    host.innerHTML = "";
    host.classList.add("gk-hud");

    /* ---- chips + actions ---- */
    var top = make("div", "gk-hud-top");
    var chips = make("div", "gk-chips");
    chips.innerHTML = '<span class="gk-chip gk-chip-free">FREE PLAY</span>' + stakeChip(gameKey).html;
    var actions = make("div", "gk-hud-actions");
    actions.innerHTML =
      '<button type="button" class="gk-btn" data-gk="rules" aria-expanded="false">Rules</button>' +
      '<button type="button" class="gk-btn" data-gk="quit">Quit</button>';
    top.appendChild(chips);
    top.appendChild(actions);
    host.appendChild(top);

    /* ---- stat bar ---- */
    var statsRow = make("div", "gk-stats");
    statsRow.innerHTML = statDefs.map(function (def) {
      return '<div class="gk-stat"><span class="gk-stat-label">' + esc(def.label) + '</span>' +
        '<span class="gk-stat-value" data-stat="' + esc(def.id) + '">' + esc(def.value != null ? def.value : "0") + "</span></div>";
    }).join("");
    host.appendChild(statsRow);

    var metaRow = make("div", "gk-meta", esc(cfg.meta || ""));
    host.appendChild(metaRow);

    /* ---- rules card ---- */
    var rulesCard = make("div", "gk-rules", "<h3>" + esc(entry ? entry.name : gameKey) + " — " + esc(variantRow ? variantRow.name : variantKey) + "</h3>" + rulesMarkup(entry, variantRow));
    rulesCard.hidden = true;
    host.parentNode.insertBefore(rulesCard, host.nextSibling);

    /* ---- inline panel (never confirm()) ---- */
    var panel = make("div", "gk-panel");
    panel.hidden = true;
    host.parentNode.insertBefore(panel, rulesCard.nextSibling);

    function showPanel(options) {
      var opts = options || {};
      panel.innerHTML = '<div class="gk-panel-card" role="dialog" aria-modal="true">' +
        "<h4>" + esc(opts.title || "") + "</h4>" +
        "<p>" + esc(opts.body || "") + "</p>" +
        '<div class="gk-panel-actions"></div></div>';
      var row = panel.querySelector(".gk-panel-actions");
      (opts.actions || []).forEach(function (action) {
        var button = make("button", "gk-btn" + (action.primary ? " gk-btn-primary" : ""), esc(action.label));
        button.type = "button";
        button.addEventListener("click", function () {
          if (action.close !== false) hidePanel();
          if (typeof action.onClick === "function") action.onClick();
        });
        row.appendChild(button);
      });
      panel.hidden = false;
    }

    function hidePanel() { panel.hidden = true; panel.innerHTML = ""; }

    /* ---- result overlay ---- */
    var overlay = make("div", "gk-overlay");
    overlay.hidden = true;
    doc.body.appendChild(overlay);

    function showResult(options) {
      var opts = options || {};
      var session = api ? api.state() : null;
      var statRow = games.stats(gameKey);
      var lines = Array.isArray(opts.lines) ? opts.lines : [];
      var outcomeLabel = { win: "You win", loss: "House wins", draw: "Draw", abandoned: "Game left", incomplete: "Round over" }[String(opts.outcome || "incomplete")] || "Round over";
      /* The score unit is the variant's own (points, play chips, moves…) — never assumed. */
      var unit = String(opts.unit || (variantRow && variantRow.scoreUnit) || (entry && entry.scoreUnit) || "points");

      overlay.innerHTML = '<div class="gk-overlay-card" role="dialog" aria-modal="true">' +
        '<p class="gk-result-eyebrow">' + esc(entry ? entry.name : gameKey) + " · " + esc(variantRow ? variantRow.name : variantKey) + "</p>" +
        '<h3 class="gk-result-title">' + esc(outcomeLabel) + "</h3>" +
        '<p class="gk-result-score">' + esc(session ? session.score : 0) + "<small>" + esc(unit) + "</small></p>" +
        (opts.isBest ? '<p class="gk-result-best">🏆 New personal best</p>' : "") +
        (lines.length ? '<ul class="gk-result-lines">' + lines.map(function (line) { return "<li>" + esc(line) + "</li>"; }).join("") + "</ul>" : "") +
        '<p class="gk-result-stats">Played ' + esc(statRow.plays) + " · won " + esc(statRow.wins) + " · drawn " + esc(statRow.draws) + " · lost " + esc(statRow.losses) +
        " · best " + esc(statRow.bestScore) + "</p>" +
        (session ? '<p class="gk-result-audit"><small>Session ' + esc(session.id) + " · seed " + esc(session.seed) + " · " + esc(session.durationMs) + "ms · log " + esc(games.hashLog(session.actions)) + "</small></p>" : "") +
        '<p class="gk-result-law">Free play — no coins moved, no leaderboard points. ' + esc(games.LAW) + "</p>" +
        '<div class="gk-result-actions"></div></div>';

      var actionsRow = overlay.querySelector(".gk-result-actions");
      var buttons = Array.isArray(opts.actions) && opts.actions.length ? opts.actions : [{ label: "Back to " + (entry ? entry.name : "menu"), primary: true, onClick: function () { quit(); } }];
      buttons.forEach(function (action) {
        var button = make("button", "gk-btn" + (action.primary ? " gk-btn-primary" : ""), esc(action.label));
        button.type = "button";
        button.addEventListener("click", function () { if (typeof action.onClick === "function") action.onClick(); });
        actionsRow.appendChild(button);
      });
      overlay.hidden = false;
    }

    function hideResult() { overlay.hidden = true; overlay.innerHTML = ""; }

    /* ---- session ---- */
    var api = null;

    function begin(savedState) {
      var started = games.start({
        gameKey: gameKey,
        variant: variantKey,
        mode: "free",
        resume: !!savedState,
        meta: { shell: "game-kit", rulesAccepted: true }
      });
      if (!started.ok) {
        showPanel({
          title: "This game can't start",
          body: started.message || "The game engine refused to start this session.",
          actions: [{ label: "Back", primary: true, onClick: function () { quit(); } }]
        });
        return;
      }
      api = started.api;
      /* The shell is handed to the game so it can render immediately, without waiting
         for mount() to return. */
      if (typeof cfg.onStart === "function") cfg.onStart(api, savedState ? savedState.state : null, started.resumed, ui);
    }

    function quit() {
      if (api && !api.isFinished()) api.abandon("quit-to-menu");
      if (typeof cfg.onQuit === "function") cfg.onQuit();
    }

    /* ---- wire the HUD buttons ---- */
    host.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.getAttribute) return;
      var role = target.getAttribute("data-gk");
      if (role === "rules") {
        rulesCard.hidden = !rulesCard.hidden;
        target.setAttribute("aria-expanded", rulesCard.hidden ? "false" : "true");
        target.textContent = rulesCard.hidden ? "Rules" : "Hide rules";
        return;
      }
      if (role === "quit") {
        showPanel({
          title: "Leave this game?",
          body: "Your place is saved on this device — you can carry on where you left off next time.",
          actions: [
            { label: "Leave game", primary: true, onClick: function () { quit(); } },
            { label: "Keep playing" }
          ]
        });
        return;
      }
      if (role === "stake-why") {
        var chip = stakeChip(gameKey);
        showPanel({
          title: "Why staked play is locked",
          body: chip.reasons.length ? "Every reason is listed — nothing is hidden:" : "Staked play is not available.",
          actions: [{ label: "Got it", primary: true }]
        });
        if (chip.reasons.length) {
          var card = panel.querySelector(".gk-panel-card p");
          if (card) card.innerHTML = "<ul>" + chip.reasons.map(function (message) { return "<li>" + esc(message) + "</li>"; }).join("") + "</ul>";
        }
      }
    });

    /* The shell object is built BEFORE any session starts so games can render straight
       away from onStart without waiting for mount() to return. */
    var ui = {
      ok: true,
      game: entry,
      variant: variantRow,
      get api() { return api; },
      session: function () { return api ? api.state() : null; },
      setStat: function (id, value) {
        var node = host.querySelector('[data-stat="' + String(id).replace(/"/g, "") + '"]');
        if (node) node.textContent = String(value);
      },
      setMeta: function (text) { metaRow.innerHTML = esc(text || ""); },
      showResult: showResult,
      hideResult: hideResult,
      showPanel: showPanel,
      hidePanel: hidePanel,
      finish: function (options) {
        var opts = options || {};
        /* The ENGINE decides whether this was a personal best (it owns the bests store and
           the real-zero rule) — a game may only ever hand a hint in, never overrule it. */
        var settled = null;
        if (api && !api.isFinished()) {
          api.finish(Object.assign({}, opts, {
            onSettled: function (summary) { settled = summary; }
          }));
        }
        var isBest = settled ? settled.isBest === true : false;
        showResult(Object.assign({}, opts, { isBest: isBest }));
      },
      quit: quit
    };

    /* ---- offer resume BEFORE a new session is created ---- */
    var saved = null;
    try { saved = games.resume(gameKey, variantKey, "free"); } catch (error) { saved = null; }

    if (saved && saved.endedAt) saved = null;

    if (saved) {
      showPanel({
        title: "Carry on where you left off?",
        body: "You have an unfinished " + (variantRow ? variantRow.name : "game") + " on this device" +
          (saved.score ? " at " + saved.score + " points" : "") + ". Nothing was lost.",
        actions: [
          { label: "Resume", primary: true, onClick: function () { begin(saved); } },
          {
            label: "Start fresh",
            onClick: function () {
              try { games.clearResume(gameKey, variantKey, "free"); } catch (error) { /* noop */ }
              begin(null);
            }
          }
        ]
      });
    } else {
      begin(null);
    }

    return ui;
  }

  /* ------------------------------------------------------------------ honest home-page counters */
  function summary(gameKey) {
    var games = global.ParagonGames;
    if (!games) return null;
    var row = games.stats(gameKey);
    return {
      plays: Number(row.plays) || 0,
      wins: Number(row.wins) || 0,
      losses: Number(row.losses) || 0,
      draws: Number(row.draws) || 0,
      bestScore: Number(row.bestScore) || 0,
      bestStreak: Number(row.bestStreak) || 0,
      currentStreak: Number(row.currentStreak) || 0,
      lastPlayedAt: row.lastPlayedAt || ""
    };
  }

  /* ------------------------------------------------------------------ game-specific performance board
     This is deliberately NOT the revenue-funded Coins Leaderboard. The owner asked for an
     in-game board whose General tab combines Free, Bet and (later) Multiplayer performance.
     Free games therefore count here as device-local performance points, while still never
     calling ParagonLeaderboards.recordResult and never earning coins. Online rows may only
     arrive through a real host adapter; this shell never fabricates names or "searching"
     opponents when no server has supplied them. */
  function performanceRows(gameKey, scope) {
    var games = global.ParagonGames;
    var asked = String(scope || "general").toLowerCase();
    var buckets = {};
    var list = games && typeof games.sessions === "function" ? games.sessions() : [];

    (Array.isArray(list) ? list : []).forEach(function (session) {
      if (!session || String(session.gameKey) !== String(gameKey) || !session.endedAt || session.outcome === "abandoned") return;
      var meta = session.meta && typeof session.meta === "object" ? session.meta : {};
      var mode = meta.competitionMode === "multiplayer" ? "multiplayer" : (session.mode === "stake" ? "bet" : "free");
      if (asked !== "general" && asked !== mode) return;
      var player = String(session.displayName || "You · this device");
      var key = player.toLowerCase() + "|" + mode;
      if (!buckets[key]) buckets[key] = { player: player, mode: mode, points: 0, plays: 0, best: 0, source: "device" };
      var rawPoints = meta.boardPoints != null ? Number(meta.boardPoints) : Number(session.score);
      var points = Math.max(0, isFinite(rawPoints) ? Math.round(rawPoints) : 0);
      buckets[key].points += points;
      buckets[key].plays += 1;
      buckets[key].best = Math.max(buckets[key].best, points);
    });

    var rows = Object.keys(buckets).map(function (key) { return buckets[key]; });

    /* Optional production adapter. It must return real, server-verified rows synchronously;
       if it is absent/fails, the honest result is an empty online board — never demo users. */
    var directory = global.ParagonGameDirectory;
    if (directory && typeof directory.standings === "function") {
      try {
        var online = directory.standings(String(gameKey), asked);
        if (Array.isArray(online)) {
          online.forEach(function (row) {
            if (!row || !row.player || row.verified !== true) return;
            rows.push({
              player: String(row.player),
              mode: String(row.mode || (asked === "general" ? "free" : asked)),
              points: Math.max(0, Math.round(Number(row.points) || 0)),
              plays: Math.max(0, Math.round(Number(row.plays) || 0)),
              best: Math.max(0, Math.round(Number(row.best) || 0)),
              source: "server"
            });
          });
        }
      } catch (error) { /* server adapter unavailable — local rows remain honest */ }
    }

    /* General combines every mode per real player; mode tabs keep their own row. */
    if (asked === "general") {
      var combined = {};
      rows.forEach(function (row) {
        var key = row.player.toLowerCase();
        if (!combined[key]) combined[key] = { player: row.player, mode: "general", points: 0, plays: 0, best: 0, source: row.source };
        combined[key].points += row.points;
        combined[key].plays += row.plays;
        combined[key].best = Math.max(combined[key].best, row.best);
        if (row.source === "server") combined[key].source = "server";
      });
      rows = Object.keys(combined).map(function (key) { return combined[key]; });
    }

    rows.sort(function (a, b) { return b.points - a.points || b.best - a.best || a.player.localeCompare(b.player); });
    return rows.slice(0, 50);
  }

  function mountLeaderboard(config) {
    var cfg = config || {};
    var host = el(cfg.host || "#game-leaderboard");
    var games = global.ParagonGames;
    if (!host || !games) return { ok: false, code: "no-host-or-engine" };
    var gameKey = String(cfg.gameKey || "");
    var scope = "general";
    var labels = { general: "General", free: "Free", bet: "Bet", multiplayer: "Multiplayer" };

    function render() {
      var rows = performanceRows(gameKey, scope);
      var body = rows.length ? rows.map(function (row, index) {
        var mode = scope === "general" ? "All modes" : labels[row.mode] || row.mode;
        return '<div class="gk-board-row">' +
          '<span class="gk-board-rank">' + (index + 1) + '</span>' +
          '<span class="gk-board-player"><strong>' + esc(row.player) + '</strong><small>' + esc(mode) + (row.source === "server" ? " · verified live" : " · this device") + '</small></span>' +
          '<span class="gk-board-number"><strong>' + row.points.toLocaleString() + '</strong><small>points</small></span>' +
          '<span class="gk-board-number"><strong>' + row.plays.toLocaleString() + '</strong><small>played</small></span>' +
          '<span class="gk-board-number"><strong>' + row.best.toLocaleString() + '</strong><small>best</small></span>' +
        '</div>';
      }).join("") : '<div class="gk-board-empty"><strong>No real results in this view yet.</strong><span>' +
        (scope === "free"
          ? "Finish a free game and your actual performance will appear here."
          : scope === "general"
            ? "Finish a game to create the first device-local result. Online players appear only when the live server supplies verified rows."
            : "This mode is not live. Real-money and online matchmaking remain off, so no sample players are shown.") +
        '</span></div>';

      host.innerHTML = '<div class="gk-board-head">' +
        '<div><p class="gk-board-kicker">In-game performance</p><h3>' + esc((games.game(gameKey) || {}).name || gameKey) + ' leaderboard</h3></div>' +
        '<span class="gk-board-live"><i></i> Real results only</span>' +
        '</div>' +
        '<div class="gk-board-tabs" role="tablist" aria-label="Leaderboard mode">' +
          Object.keys(labels).map(function (key) {
            return '<button type="button" role="tab" class="gk-board-tab' + (scope === key ? " active" : "") + '" data-board-scope="' + key + '" aria-selected="' + (scope === key ? "true" : "false") + '">' + labels[key] + '</button>';
          }).join("") +
        '</div>' +
        '<div class="gk-board-table">' + body + '</div>' +
        '<p class="gk-board-law"><strong>Separate from the Coins Leaderboard.</strong> Free performance counts in this game’s General view, but never earns coins or a revenue-funded prize. Bet and Multiplayer activate only with the real server contract.</p>';

      host.querySelectorAll("[data-board-scope]").forEach(function (button) {
        button.addEventListener("click", function () {
          scope = button.getAttribute("data-board-scope") || "general";
          render();
        });
      });
    }

    render();
    return { ok: true, rows: function (asked) { return performanceRows(gameKey, asked || scope); }, refresh: render };
  }

  global.ParagonGameKit = {
    mount: mount,
    mountLeaderboard: mountLeaderboard,
    performanceRows: performanceRows,
    summary: summary,
    stakeChip: stakeChip,
    escape: esc
  };
  if (global.window) global.window.ParagonGameKit = global.ParagonGameKit;
})(typeof window !== "undefined" ? window : globalThis);
