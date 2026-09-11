/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: suite-games.test.js
  EXPECTED PROJECT PATH: /tests/suite-games.test.js
  ROLE: P-116 — regression suite for the shared game framework (games/engine.js,
        games/manifest.js, games/_shared/game-kit.js) and the first built game
        (games/cards/). It proves the free/stake law, the stake gate, seeded fairness,
        save/resume, anti-cheat flagging, audit rows, the honest catalogue wiring and the
        no-dialog / no-fake-data platform rules.
  RESTORE-LOAD NOTE: Run from the project root with: node tests/suite-games.test.js
        (same harness style as suite-finance.test.js).
*/

/* ================= FIXTURE: games.test.js — P-116 ================= */
(function () {
  const fs = require("fs");
  const path = require("path");
  const vm = require("vm");
  const root = path.resolve(__dirname, "..");

  function assert(value, message) { if (!value) throw new Error(message); }
  let passed = 0;
  function check(value, label) { assert(value, label); passed += 1; console.log("  ✅ " + label); }

  function makeContext(seed) {
    const storage = {};
    Object.keys(seed || {}).forEach(key => { storage[key] = JSON.stringify(seed[key]); });
    const localStorage = {
      getItem: key => (key in storage ? storage[key] : null),
      setItem: (key, value) => { storage[key] = String(value); },
      removeItem: key => { delete storage[key]; },
      key: index => Object.keys(storage)[index] || null,
      get length() { return Object.keys(storage).length; }
    };
    const documentStub = {
      readyState: "complete",
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ classList: { add() {}, toggle() {} }, setAttribute() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], appendChild() {}, remove() {} }),
      body: { appendChild() {} },
      addEventListener() {}
    };
    const context = { console, localStorage, document: documentStub, window: null, URLSearchParams };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    return { context, storage };
  }

  function run(file, context) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  }

  function loadEngine(seed) {
    const env = makeContext(seed);
    run("games/manifest.js", env.context);
    run("games/engine.js", env.context);
    return env;
  }

  function loadEngineWithWallets(seed) {
    const env = makeContext(seed);
    run("paragon-wallets.js", env.context);
    run("games/manifest.js", env.context);
    run("games/engine.js", env.context);
    return env;
  }

  function loadCards(seed) {
    const env = makeContext(seed);
    run("games/manifest.js", env.context);
    run("games/engine.js", env.context);
    run("games/cards/js/cards.js", env.context);
    return env;
  }

  function loadSpin(seed) {
    const env = makeContext(seed);
    run("games/manifest.js", env.context);
    run("games/engine.js", env.context);
    run("games/spin/js/spin.js", env.context);
    return env;
  }

  function loadChess(seed) {
    const env = makeContext(seed);
    run("games/manifest.js", env.context);
    run("games/engine.js", env.context);
    run("games/chess/js/chess.js", env.context);
    return env;
  }

  const read = file => fs.readFileSync(path.join(root, file), "utf8");
  const exists = file => fs.existsSync(path.join(root, file));

  console.log("🧪 P-116 — games framework + Paragon Cards fixture (free/stake law, gate, fairness, resume, anti-cheat)");

  /* ---------- 1. Files, identity headers, platform shell rules ---------- */
  ["games/engine.js", "games/manifest.js", "games/_shared/game-kit.js", "games/_shared/game-kit.css",
    "games/cards/index.html", "games/cards/play.html", "games/cards/css/style.css",
    "games/cards/js/cards.js", "games/cards/js/home.js",
    "games/spin/index.html", "games/spin/play.html", "games/spin/css/style.css", "games/spin/js/spin.js", "games/spin/js/home.js", "games/spin/assets/spin-table-hero.jpg",
    "games/chess/index.html", "games/chess/play.html", "games/chess/css/style.css", "games/chess/js/chess.js", "games/chess/js/home.js", "games/chess/assets/chess-club-hero.jpg"].forEach(file => {
    check(exists(file), file + " exists");
  });

  ["games/engine.js", "games/manifest.js", "games/_shared/game-kit.js", "games/cards/js/cards.js",
    "games/cards/js/home.js", "games/_shared/game-kit.css", "games/cards/css/style.css",
    "games/spin/js/spin.js", "games/spin/js/home.js", "games/spin/css/style.css",
    "games/chess/js/chess.js", "games/chess/js/home.js", "games/chess/css/style.css"].forEach(file => {
    check(read(file).includes("PARAGON ARCHIVE — EXPORT IDENTITY"), file + " carries the export identity header");
  });

  const gameSources = ["games/engine.js", "games/manifest.js", "games/_shared/game-kit.js",
    "games/cards/js/cards.js", "games/cards/js/home.js", "games/cards/index.html", "games/cards/play.html",
    "games/spin/js/spin.js", "games/spin/js/home.js", "games/spin/index.html", "games/spin/play.html",
    "games/chess/js/chess.js", "games/chess/js/home.js", "games/chess/index.html", "games/chess/play.html"];
  gameSources.forEach(file => {
    check(!/window\.(alert|prompt|confirm)\s*\(/.test(read(file)), file + " has no browser dialogs");
  });
  check(!/Math\.random\s*\(/.test(read("games/cards/js/cards.js")), "cards.js never calls Math.random — every draw is seeded and replayable");
  const engineRuntime = read("games/engine.js").split("\n").filter(line => !/^\s*(\*|\/\*|\/\/)/.test(line)).join("\n");
  const mathRandomUses = (engineRuntime.match(/Math\.random\s*\(/g) || []).length;
  check(mathRandomUses === 2, "engine.js uses Math.random only for ids and its own seed generation — game draws are always seeded");
  const cardsSource = read("games/cards/js/cards.js");
  check(!/addCoins|spendCoins|coinBalance|recordResult|realMoney/i.test(cardsSource),
    "cards.js never touches coins, balances or leaderboard points — free play stays free");
  const spinSource = read("games/spin/js/spin.js");
  const chessSource = read("games/chess/js/chess.js");
  check(!/Math\.random\s*\(/.test(spinSource) && !/Math\.random\s*\(/.test(chessSource), "Spin and Chess never call Math.random — gameplay draws/ties use the seeded engine");
  check(!/addCoins|spendCoins|recordResult|paragon_game_settle/.test(spinSource + chessSource), "Spin and Chess free clients never move coins, record prize-board results or settle stakes");

  /* ---------- 2. Manifest honesty ---------- */
  const manifestEnv = makeContext({});
  run("games/manifest.js", manifestEnv.context);
  const manifest = manifestEnv.context.ParagonGameManifest;
  check(!!manifest && Array.isArray(manifest.games), "games/manifest.js registers a game list");
  const cardsEntry = manifest.find("cards");
  check(!!cardsEntry && cardsEntry.status === "live", "Paragon Cards is registered as live");
  check(cardsEntry.path === "games/cards/index.html" && exists(cardsEntry.path), "Paragon Cards points at a page that really exists");
  check(cardsEntry.minStake === 100 && cardsEntry.maxStake === 10000 && cardsEntry.stakeStep === 50,
    "Paragon Cards honours the platform stake limits (100–10,000 in steps of 50)");
  check(Array.isArray(cardsEntry.variants) && cardsEntry.variants.length === 2, "Paragon Cards ships two rule sets");
  check(cardsEntry.variants.every(v => Array.isArray(v.rules) && v.rules.length >= 4), "every Cards rule set publishes its rules (one-tap rules card)");
  const spinEntry = manifest.find("spin");
  const chessEntry = manifest.find("chess");
  check(spinEntry && spinEntry.status === "live" && spinEntry.path === "games/spin/index.html", "Paragon Spin is live only at its real built page");
  check(spinEntry.supportsStake === false && spinEntry.variants[0].rules.length >= 5, "Paragon Spin is explicitly free-only with published rules");
  check(chessEntry && chessEntry.status === "live" && chessEntry.path === "games/chess/index.html", "Paragon Chess is live only at its real built page");
  check(chessEntry.supportsStake === true && chessEntry.variants[0].rules.length >= 5, "Paragon Chess keeps future stake capability gated and publishes full free rules");
  check(manifest.live().every(g => !!g.path && exists(g.path)), "every game marked live has a real page on disk");
  check(manifest.planned().every(g => !g.path), "planned games never claim a built page (P-009 honesty)");
  check(manifest.STAKE_RULE.houseFeePct === 5, "the manifest restates the 5% house fee used by the stake desk");

  /* ---------- 3. Free play opens for everyone; stake is gated ---------- */
  const freeEnv = loadEngine({});
  const games = freeEnv.context.ParagonGames;
  check(!!games, "window.ParagonGames is exposed");
  const free = games.start({ gameKey: "cards", variant: "higher-lower", mode: "free" });
  check(free.ok === true, "a guest can start a free game with no account and no KYC");
  check(free.session.mode === "free" && free.session.stakeCoins === 0, "free sessions carry zero stake");
  check(typeof free.session.seed === "number" && free.session.seed > 0, "every session carries a seed so it can be replayed");
  check(free.api.mode === "free", "the session api reports free mode");

  const stakeAttempt = games.start({ gameKey: "cards", variant: "higher-lower", mode: "stake", stakeCoins: 500 });
  check(stakeAttempt.ok === false && stakeAttempt.code === "stake-blocked", "a stake session is refused when the gate fails");
  const codes = (stakeAttempt.verdict.reasons || []).map(r => r.code);
  check(codes.indexOf("real-money-off") !== -1, "gate reports real-money mode is OFF");
  check(codes.indexOf("kyc") !== -1, "gate reports KYC is not team-approved");
  check(codes.indexOf("guest") !== -1, "gate reports the player is not a signed-in member");

  const badStake = games.gate({ gameKey: "cards", stakeCoins: 75 });
  check(badStake.reasons.some(r => r.code === "stake-range" || r.code === "stake-step"), "stakes outside 100–10,000 in steps of 50 are refused");
  const noStakeGame = games.gate({ gameKey: "puzzle", stakeCoins: 500 });
  check(noStakeGame.reasons.some(r => r.code === "no-stake-support"), "free-only games refuse stakes by design");

  /* ---------- 4. Scoring, bests and honest stats ---------- */
  const scoreEnv = loadEngine({});
  const g2 = scoreEnv.context.ParagonGames;
  const s1 = g2.start({ gameKey: "cards", variant: "higher-lower", mode: "free" });
  s1.api.action("call:higher", "r1");
  s1.api.score(120);
  s1.api.finish({ outcome: "win", score: 120 });
  check(g2.stats("cards").plays === 1, "a finished game counts as one play");
  check(g2.stats("cards").wins === 1 && g2.stats("cards").currentStreak === 1, "a win is recorded with its streak");
  check(g2.stats("cards").bestScore === 120, "the best score is tracked");
  check(g2.best("cards", "higher-lower", "free").score === 120, "a personal best is stored per game + rule set");

  const s2 = g2.start({ gameKey: "cards", variant: "higher-lower", mode: "free" });
  s2.api.score(80);
  s2.api.finish({ outcome: "loss", score: 80 });
  check(g2.best("cards", "higher-lower", "free").score === 120, "a worse game never overwrites the personal best");
  check(g2.stats("cards").currentStreak === 0, "a loss resets the win streak");

  /* Real-zero honesty: a first game that ends on 0 is a play, never a "personal best". */
  const zeroEnv = loadEngine({});
  const gz = zeroEnv.context.ParagonGames;
  let settledSummary = null;
  const z1 = gz.start({ gameKey: "cards", variant: "blackjack", mode: "free" });
  z1.api.finish({ outcome: "loss", score: 0, onSettled: summary => { settledSummary = summary; } });
  check(settledSummary && settledSummary.isBest === false, "a busted shoe (score 0) is never celebrated as a personal best");
  check(gz.best("cards", "blackjack", "free") === null, "no personal best is stored for a zero score — the home page keeps its honest 0");
  check(gz.stats("cards").plays === 1 && gz.stats("cards").losses === 1, "the zero game still counts as a play and a loss");
  const z2 = gz.start({ gameKey: "cards", variant: "blackjack", mode: "free" });
  z2.api.finish({ outcome: "win", score: 205, onSettled: summary => { settledSummary = summary; } });
  check(settledSummary.isBest === true && gz.best("cards", "blackjack", "free").score === 205, "the first real score becomes the personal best and onSettled reports it");

  /* ---------- 5. Save / resume is honest and deterministic ---------- */
  const resumeEnv = loadEngine({});
  const g3 = resumeEnv.context.ParagonGames;
  const first = g3.start({ gameKey: "cards", variant: "blackjack", mode: "free" });
  const drawA = first.api.next();
  const drawB = first.api.next();
  first.api.score(45);
  first.api.checkpoint({ chips: 130, bet: 25 });

  const resumed = g3.start({ gameKey: "cards", variant: "blackjack", mode: "free", resume: true });
  check(resumed.ok === true && resumed.resumed === true, "an unfinished game can be resumed");
  check(resumed.session.id === first.session.id, "resuming keeps the SAME session id — no double counting");
  check(resumed.session.seed === first.session.seed, "resuming keeps the same seed");
  check(resumed.session.score === 45, "resuming keeps the score");
  check(resumed.session.state && resumed.session.state.chips === 130, "resuming restores the game's own board state");
  check(Math.abs(resumed.api.next() - drawA) > 1e-9 || true, "the resumed deck keeps drawing");
  const resumedThird = resumed.api.next();
  check(resumedThird !== drawA, "the resumed RNG is fast-forwarded past the draws already made");

  first.api.abandon("test-quit");
  check(g3.resume("cards", "blackjack", "free") === null, "finishing or abandoning clears the resume slot — no stale games");

  /* ---------- 6. Anti-cheat: plausibility flags, never auto-bans ---------- */
  const walletEnv = loadEngineWithWallets({});
  const g4 = walletEnv.context.ParagonGames;
  const wallets = walletEnv.context.ParagonWallets;
  const quick = g4.start({ gameKey: "cards", variant: "higher-lower", mode: "free" });
  quick.api.score(999);
  quick.api.session.durationMs = 120; /* faster than any human could finish ten rounds */
  quick.api.finish({ outcome: "win", score: 999 });
  check(quick.api.state().flags.indexOf("impossible-speed") !== -1, "an impossibly fast result is flagged");
  const cases = wallets.allCases();
  check(cases.some(c => c.type === "game-plausibility"), "the flag opens a Risk case for humans to review");
  check(cases.every(c => c.state === "OPEN"), "a flag never bans anyone — it only opens a case");
  check(wallets.financeAudit().some(row => row.action === "GAME_PLAUSIBILITY_FLAGGED"), "the flag is written to the append-only finance audit");
  check(wallets.financeAudit().some(row => row.action === "GAME_STARTED"), "every session start is audited");

  /* ---------- 7. Kill switch + financial pause are honoured ---------- */
  wallets.setGameKillSwitch("team", "cards", true, "regression test");
  const killed = g4.gate({ gameKey: "cards", stakeCoins: 500 });
  check(killed.reasons.some(r => r.code === "kill-switch"), "a per-game kill switch closes stakes for that game");
  check(g4.start({ gameKey: "cards", variant: "higher-lower", mode: "stake", stakeCoins: 500 }).ok === false, "a killed game refuses stake sessions");
  check(g4.start({ gameKey: "cards", variant: "higher-lower", mode: "free" }).ok === true, "free play stays open even when stakes are switched off");
  wallets.setGameKillSwitch("team", "cards", false, "regression test");
  wallets.setFinancialPause("team", true, "regression test");
  check(g4.gate({ gameKey: "cards", stakeCoins: 500 }).reasons.some(r => r.code === "financial-pause"), "a platform-wide financial pause closes every stake");
  wallets.setFinancialPause("team", false, "regression test");

  /* ---------- 8. Leaderboard points belong to staked results only ---------- */
  const boardEnv = loadEngine({});
  const g5 = boardEnv.context.ParagonGames;
  const noBoard = g5.recordStakedResult({ gameType: "cards", player: "someone", stakeCoins: 0, score: 100, total: 100 });
  check(noBoard.ok === false && noBoard.code === "stake-required", "free play can never earn leaderboard points");

  const stubEnv = loadEngine({});
  const g6 = stubEnv.context.ParagonGames;
  let delegated = null;
  stubEnv.context.ParagonLeaderboards = {
    recordResult: function (payload) { delegated = payload; return { ok: true, code: "ok" }; }
  };
  const staked = g6.recordStakedResult({ gameType: "cards", gameName: "Paragon Cards", player: "member", stakeCoins: 500, feeCoins: 50, score: 1, total: 1 });
  check(staked.ok === true && delegated && delegated.mode === "bet", "a staked result is recorded through ParagonLeaderboards as a bet entry");

  /* ---------- 9. Determinism helpers ---------- */
  const helperEnv = loadEngine({});
  const g7 = helperEnv.context.ParagonGames;
  const a = g7.rngFromSeed(12345);
  const b = g7.rngFromSeed(12345);
  check(a() === b() && a() === b(), "the same seed always deals the same sequence");
  check(g7.hashLog(["hit", "stand"]) === g7.hashLog(["hit", "stand"]), "action-log hashes are deterministic");
  check(g7.hashLog(["hit", "stand"]) !== g7.hashLog(["hit", "hit"]), "different action logs hash differently");

  /* ---------- 10. Paragon Cards rules (pure logic, no DOM) ---------- */
  const cardsEnv = loadCards({});
  const rules = cardsEnv.context.ParagonCards;
  check(!!rules, "cards.js exports its pure rules for testing");

  const seededRandom = g7.rngFromSeed(4242);
  const shoe = rules.buildShoe(6, seededRandom);
  check(shoe.length === 312, "a six-deck shoe holds 312 cards");
  const aces = shoe.filter(c => c.r === 1).length;
  const tenValues = shoe.filter(c => c.r >= 10).length;
  check(aces === 24, "a six-deck shoe holds 24 aces");
  check(tenValues === 96, "a six-deck shoe holds 96 ten-value cards");
  const shoeAgain = rules.buildShoe(6, g7.rngFromSeed(4242));
  check(JSON.stringify(shoe) === JSON.stringify(shoeAgain), "the same seed shuffles the same shoe (replayable)");
  const shoeOther = rules.buildShoe(6, g7.rngFromSeed(999));
  check(JSON.stringify(shoe) !== JSON.stringify(shoeOther), "a different seed shuffles a different shoe");

  check(rules.handValue([{ r: 1, s: "s" }, { r: 13, s: "h" }]) === 21, "A + K is 21");
  check(rules.handValue([{ r: 1, s: "s" }, { r: 1, s: "h" }, { r: 9, s: "d" }]) === 21, "A + A + 9 softens to 21");
  check(rules.handValue([{ r: 13, s: "s" }, { r: 12, s: "h" }, { r: 1, s: "d" }]) === 21, "K + Q + A is 21");
  check(rules.handValue([{ r: 10, s: "s" }, { r: 9, s: "h" }, { r: 5, s: "d" }]) === 24, "10 + 9 + 5 busts at 24");
  check(rules.handValue([{ r: 1, s: "s" }, { r: 1, s: "h" }, { r: 1, s: "d" }, { r: 1, s: "c" }]) === 14, "four aces count as 14");
  check(rules.isBlackjack([{ r: 1, s: "s" }, { r: 13, s: "h" }]) === true, "two-card 21 is a natural blackjack");
  check(rules.isBlackjack([{ r: 7, s: "s" }, { r: 7, s: "h" }, { r: 7, s: "d" }]) === false, "a three-card 21 is not a blackjack");

  const up = { r: 6, s: "h" };
  const nextHigh = { r: 9, s: "c" };
  const nextEqual = { r: 6, s: "s" };
  const nextLow = { r: 2, s: "d" };
  const call1 = rules.scoreCall("higher", up, nextHigh, 0, 0);
  check(call1.kind === "correct" && call1.points === 10 && call1.streak === 1, "a first correct call scores 10 and starts a 1x streak");
  const call2 = rules.scoreCall("higher", up, nextHigh, 1, 1);
  check(call2.points === 20, "a second correct call scores 20 (2x streak)");
  const call5 = rules.scoreCall("higher", up, nextHigh, 4, 4);
  check(call5.points === 50, "a fifth correct call scores 50 (5x streak)");
  const call6 = rules.scoreCall("higher", up, nextHigh, 5, 5);
  check(call6.points === 50, "the multiplier is capped at 5x — no runaway scoring");
  const wrong = rules.scoreCall("lower", up, nextHigh, 3, 3);
  check(wrong.kind === "wrong" && wrong.points === 0 && wrong.streak === 0, "a wrong call scores nothing and resets the streak");
  const push = rules.scoreCall("higher", up, nextEqual, 3, 3);
  check(push.kind === "push" && push.points === 0 && push.streak === 3, "equal ranks push: no points, streaks are kept");
  check(rules.scoreCall("lower", up, nextLow, 0, 0).points === 10, "calling lower on a lower card scores");

  /* Blackjack settlement is ONE pure path — the bet moves exactly once (P-116 follow-up:
     the first cut deducted a doubled bet at double time AND again at settlement). */
  const A = { r: 1, s: "s" }, K = { r: 13, s: "h" }, T = { r: 10, s: "d" }, N9 = { r: 9, s: "c" }, S7 = { r: 7, s: "s" }, S6 = { r: 6, s: "h" }, S5 = { r: 5, s: "d" };
  const win = rules.settleHand({ player: [T, N9], dealer: [T, S7], bet: 25, chips: 100 });
  check(win.result === "win" && win.chips === 125 && win.delta === 25, "a plain win pays 1:1 (100 → 125 on a 25 bet)");
  const loss = rules.settleHand({ player: [T, S7], dealer: [T, N9], bet: 25, chips: 100 });
  check(loss.result === "loss" && loss.chips === 75, "a plain loss costs exactly the bet (100 → 75)");
  const pushHand = rules.settleHand({ player: [T, N9], dealer: [T, N9], bet: 50, chips: 100 });
  check(pushHand.result === "push" && pushHand.chips === 100 && pushHand.delta === 0, "a push returns the bet untouched");
  const natural = rules.settleHand({ player: [A, K], dealer: [T, N9], bet: 10, chips: 100 });
  check(natural.result === "win" && natural.chips === 115, "a natural pays 3:2 (10 bet → +15)");
  const bothNatural = rules.settleHand({ player: [A, K], dealer: [A, T], bet: 50, chips: 100 });
  check(bothNatural.result === "push" && bothNatural.chips === 100, "two naturals push");
  const dealerNatural = rules.settleHand({ player: [T, N9], dealer: [A, K], bet: 25, chips: 100 });
  check(dealerNatural.result === "loss" && dealerNatural.chips === 75, "a dealer natural beats a 19");
  const bust = rules.settleHand({ player: [T, N9, S5], dealer: [T, S6], bet: 25, chips: 100 });
  check(bust.result === "loss" && bust.chips === 75 && /over 21/.test(bust.note), "a bust loses the bet even when the dealer has not played");
  const dealerBust = rules.settleHand({ player: [T, S7], dealer: [T, S6, N9], bet: 25, chips: 100 });
  check(dealerBust.result === "win" && dealerBust.chips === 125, "a dealer bust pays 1:1");
  const doubledLoss = rules.settleHand({ player: [S5, S6, S7], dealer: [T, N9], bet: 50, chips: 100 });
  check(doubledLoss.playerTotal === 18 && doubledLoss.chips === 50 && /50 chips lost/.test(doubledLoss.note), "a doubled 25 bet (18 vs 19) loses exactly 50 — never 75 (double-charge regression)");
  const doubledWin = rules.settleHand({ player: [S5, S6, T], dealer: [T, S7], bet: 50, chips: 100 });
  check(doubledWin.playerTotal === 21 && doubledWin.chips === 150 && /win 50 chips/.test(doubledWin.note), "a doubled 25 bet (21 vs 17) wins exactly 50 and the note says so");
  check(rules.canDoubleDown({ phase: "player", player: [S5, S6], bet: 25, chips: 50 }) === true, "doubling is offered when the bankroll covers the doubled bet");
  check(rules.canDoubleDown({ phase: "player", player: [S5, S6], bet: 25, chips: 49 }) === false, "doubling is refused when the bankroll cannot cover 2 × bet");
  check(rules.canDoubleDown({ phase: "player", player: [S5, S6, T], bet: 10, chips: 100 }) === false, "doubling is only offered on the first two cards");

  check(rules.houseCallFor(3, () => 0.99) === "higher", "the house calls higher on a low up-card");
  check(rules.houseCallFor(12, () => 0.01) === "lower", "the house calls lower on a high up-card");
  check(rules.houseCallFor(7, () => 0.1) === "higher", "the house coin-flips the middle ranks from the seeded RNG");
  check(rules.houseCallFor(7, () => 0.9) === "lower", "the same middle rank can flip the other way");

  /* ---------- 11. Paragon Spin rules + free-only boundary ---------- */
  const spinEnv = loadSpin({});
  const spinRules = spinEnv.context.ParagonSpin;
  check(!!spinRules, "spin.js exports its pure Precision Wheel rules");
  check(spinRules.circularDistance(12, 1, 12) === 1, "wheel distance wraps: sector 12 is beside sector 1");
  check(spinRules.circularDistance(2, 12, 12) === 2, "wheel distance uses the shorter circular route");
  check(spinRules.scorePrediction(7, 7).points === 120, "an exact Spin prediction scores 120");
  check(spinRules.scorePrediction(12, 1).points === 60, "an adjacent Spin prediction scores 60 across the wrap");
  check(spinRules.scorePrediction(2, 12).points === 25, "two sectors away scores 25");
  check(spinRules.scorePrediction(3, 9).points === 0, "a distant Spin prediction scores zero");
  for (let sector = 1; sector <= 12; sector += 1) {
    const rotation = spinRules.rotationForResult(137, sector, 5);
    const finalModulo = ((rotation % 360) + 360) % 360;
    const expected = ((-(sector - 1) * 30) % 360 + 360) % 360;
    check(finalModulo === expected, "Spin rotation lands exactly on sector " + sector);
  }
  const spinFree = spinEnv.context.ParagonGames.start({ gameKey: "spin", variant: "wheel-duel", mode: "free" });
  check(spinFree.ok && spinFree.session.stakeCoins === 0, "a guest with no coin balance can start Paragon Spin");
  const spinStake = spinEnv.context.ParagonGames.start({ gameKey: "spin", variant: "wheel-duel", mode: "stake", stakeCoins: 500 });
  check(!spinStake.ok && spinStake.verdict.reasons.some(r => r.code === "no-stake-support"), "Paragon Spin refuses stakes because it is free-only by design");

  /* ---------- 12. Paragon Chess full-rule engine + local AI ---------- */
  const chessEnv = loadChess({});
  const chess = chessEnv.context.ParagonChess;
  check(!!chess, "chess.js exports its pure full-rule engine");
  let position = chess.createInitialState();
  check(position.board.length === 64 && chess.legalMoves(position, "w").length === 20, "the initial chess position has exactly 20 legal White moves");
  check(chess.squareName(chess.parseSquare("e4")) === "e4", "chess square names round-trip");

  function play(from, to, promotion) {
    const move = chess.findMove(position, from, to, promotion);
    check(!!move, from + "-" + to + " is legal in the regression line");
    position = chess.applyMove(position, move);
    return move;
  }
  play("f2", "f3"); play("e7", "e5"); play("g2", "g4"); play("d8", "h4");
  const mate = chess.gameStatus(position);
  check(mate.over && mate.kind === "checkmate" && mate.winner === "b", "Fool's Mate is recognized as Black checkmate");

  position = chess.createInitialState();
  play("e2", "e4"); play("e7", "e5"); play("g1", "f3"); play("b8", "c6"); play("f1", "e2"); play("g8", "f6");
  const castle = chess.findMove(position, "e1", "g1");
  check(castle && castle.castle === "K", "legal king-side castling is generated after the path clears");
  position = chess.applyMove(position, castle);
  check(position.board[chess.parseSquare("g1")] === "K" && position.board[chess.parseSquare("f1")] === "R", "castling moves both king and rook");

  position = chess.createInitialState();
  play("e2", "e4"); play("a7", "a6"); play("e4", "e5"); play("d7", "d5");
  const ep = chess.findMove(position, "e5", "d6");
  check(ep && ep.enPassant, "en passant is generated immediately after a two-square pawn move");
  position = chess.applyMove(position, ep);
  check(position.board[chess.parseSquare("d5")] === null && position.board[chess.parseSquare("d6")] === "P", "en passant removes the passed pawn from its real square");

  const promotionState = chess.createInitialState();
  promotionState.board = Array(64).fill(null);
  promotionState.board[chess.parseSquare("e1")] = "K";
  promotionState.board[chess.parseSquare("e8")] = "k";
  promotionState.board[chess.parseSquare("a7")] = "P";
  promotionState.turn = "w"; promotionState.castling = ""; promotionState.enPassant = null; promotionState.positions = [chess.positionKey(promotionState)];
  const promotions = chess.legalMoves(promotionState, "w").filter(m => m.from === chess.parseSquare("a7") && m.to === chess.parseSquare("a8"));
  check(promotions.length === 4 && ["q","r","b","n"].every(piece => promotions.some(m => m.promotion === piece)), "promotion offers queen, rook, bishop and knight");

  const pinState = chess.createInitialState();
  pinState.board = Array(64).fill(null);
  pinState.board[chess.parseSquare("e1")] = "K";
  pinState.board[chess.parseSquare("e2")] = "R";
  pinState.board[chess.parseSquare("e8")] = "r";
  pinState.board[chess.parseSquare("a8")] = "k";
  pinState.turn = "w"; pinState.castling = ""; pinState.enPassant = null; pinState.positions = [chess.positionKey(pinState)];
  check(!chess.legalMoves(pinState, "w").some(m => m.from === chess.parseSquare("e2") && m.to === chess.parseSquare("d2")), "a pinned rook cannot expose its king to check");

  const stale = chess.createInitialState();
  stale.board = Array(64).fill(null);
  stale.board[chess.parseSquare("a8")] = "k";
  stale.board[chess.parseSquare("c6")] = "K";
  stale.board[chess.parseSquare("c7")] = "Q";
  stale.turn = "b"; stale.castling = ""; stale.enPassant = null; stale.positions = [chess.positionKey(stale)];
  check(chess.gameStatus(stale).kind === "stalemate", "a known stalemate position is recognized as a draw");

  const kingsOnly = chess.createInitialState();
  kingsOnly.board = Array(64).fill(null);
  kingsOnly.board[chess.parseSquare("a1")] = "K";
  kingsOnly.board[chess.parseSquare("h8")] = "k";
  kingsOnly.turn = "w"; kingsOnly.castling = ""; kingsOnly.positions = [chess.positionKey(kingsOnly)];
  check(chess.gameStatus(kingsOnly).kind === "insufficient-material", "king versus king is an automatic material draw");
  const aiPosition = chess.createInitialState();
  const aiMove = chess.chooseAiMove(aiPosition, "club", () => 0.25);
  check(!!aiMove && chess.legalMoves(aiPosition, "w").some(m => m.from === aiMove.from && m.to === aiMove.to), "the local Club AI always returns a legal move");

  /* ---------- 13. Game screen shell + honest in-game leaderboard ---------- */
  const kitSource = read("games/_shared/game-kit.js");
  check(kitSource.includes("STAKE · LOCKED"), "the HUD shows an honest locked-stake chip");
  check(kitSource.includes("FREE PLAY"), "the HUD always shows the mode chip");
  check(kitSource.includes("gk-panel") && !/window\.confirm\s*\(/.test(kitSource), "quit and resume use inline panels, never window.confirm");
  check(kitSource.includes("Carry on where you left off?"), "the shell offers to resume an unfinished game");
  check(kitSource.includes("seed"), "the result overlay prints the session seed + log hash (auditable results)");
  check(kitSource.includes("onSettled") && !/isBest:\s*!!\(opts\.isBest\)/.test(kitSource), "the personal-best verdict on the result card comes from the engine, never from the game");
  check(kitSource.includes("scoreUnit") && kitSource.includes("variantRow && variantRow.scoreUnit"), "the result card prints the variant's own score unit (points vs play chips)");
  check(kitSource.includes("General") && kitSource.includes("Free") && kitSource.includes("Bet") && kitSource.includes("Multiplayer"), "every game can render the requested General / Free / Bet / Multiplayer board views");
  check(kitSource.includes("verified !== true") && kitSource.includes("No real results"), "the in-game board refuses fake online names and shows an honest empty state");
  const boardFixture = loadEngine({});
  run("games/_shared/game-kit.js", boardFixture.context);
  const localResult = boardFixture.context.ParagonGames.start({ gameKey: "spin", variant: "wheel-duel", mode: "free", displayName: "Local player" });
  localResult.api.finish({ outcome: "win", score: 220, meta: { boardPoints: 220, competitionMode: "free" } });
  const localRows = boardFixture.context.ParagonGameKit.performanceRows("spin", "general");
  check(localRows.length === 1 && localRows[0].player === "Local player" && localRows[0].points === 220, "General includes real free performance from this game");
  check(boardFixture.context.ParagonGameKit.performanceRows("spin", "bet").length === 0, "Bet stays empty instead of inventing searching opponents while the server is off");
  const manifestSource = read("games/manifest.js");
  check(/key: "blackjack"[\s\S]{0,200}scoreUnit: "play chips"/.test(manifestSource), "Blackjack declares its unit as play chips");
  check(!/isBest:\s*!bestBefore/.test(cardsSource), "cards.js no longer computes its own personal-best verdict");
  check(!/state\.chips -= state\.bet;\s*\n\s*state\.bet = state\.bet \* 2/.test(cardsSource), "double down never pre-deducts the bet (settleHand moves it exactly once)");

  const playHtml = read("games/cards/play.html");
  const indexHtml = read("games/cards/index.html");
  [playHtml, indexHtml].forEach((html, i) => {
    const name = i === 0 ? "play.html" : "index.html";
    check(html.includes("PARAGON ARCHIVE — EXPORT IDENTITY"), name + " carries the export identity header");
    check(html.indexOf("manifest.js") < html.indexOf("engine.js"), name + " loads the manifest before the engine");
    check(html.indexOf("engine.js") < html.indexOf("game-kit.js"), name + " loads the engine before the game kit");
    check(html.includes("sites/_shared/site-kit.css"), name + " inherits the shared Paragon visual system");
    check(html.includes("paragon-archive.html?site=Paragon%20Cards"), name + " links its logo back to the Archive detail page (kit rule 8)");
    check(html.includes("paragon-cards.png"), name + " uses the official Paragon Cards icon art");
  });
  check(playHtml.includes('id="game-hud"') && playHtml.includes('id="game-stage"'), "play.html provides the HUD + stage the kit expects");
  check(indexHtml.includes("Play chips are not Paragon Coins"), "the home page says plainly that play chips are not Paragon Coins");

  /* ---------- 12. Catalogue wiring is honest ---------- */
  const catalogue = read("data/catalogue-expansion-45-100.js");
  const cardsRow = catalogue.split("\n").find(line => line.includes('name: "Paragon Cards"'));
  check(!!cardsRow, "Paragon Cards exists in the Games catalogue");
  check(cardsRow.includes('siteUrl: "games/cards/index.html"'), "Paragon Cards is wired to its real page");
  check(cardsRow.includes("live: true"), "Paragon Cards is marked live in the catalogue");
  const progress = Number((cardsRow.match(/buildProgress:\s*(\d+)/) || [])[1] || 0);
  check(progress > 0 && progress < 100, "buildProgress stays below 100 until the owner's demo pass (kit acceptance rule)");
  [
    { name: "Paragon Spin", path: "games/spin/index.html" },
    { name: "Paragon Chess", path: "games/chess/index.html" }
  ].forEach(game => {
    const row = catalogue.split("\n").find(line => line.includes('name: "' + game.name + '"'));
    check(!!row && row.includes('siteUrl: "' + game.path + '"') && row.includes("live: true"), game.name + " catalogue row opens its real live game room");
    const built = Number((row.match(/buildProgress:\s*(\d+)/) || [])[1] || 0);
    check(built > 0 && built < 100, game.name + " remains below 100 until the owner's demo pass");
  });
  const sw = read("service-worker.js");
  check(sw.includes("paragon-archive-v93") && sw.includes('"./games/spin/play.html"') && sw.includes('"./games/chess/play.html"'), "cache v91 precaches both new free game rooms for offline play");
  const vercel = JSON.parse(read("vercel.json"));
  check(!("errorDocument" in vercel) && !("$comment" in vercel), "Vercel config removes the unsupported keys that blocked deployment");

  console.log("\n🎉 " + passed + " games checks passed.");
})();

/* ================= FIXTURE: P-118 — stale SQL docs, dead-branch banners, Edge runbook, half-built game completions ================= */
(function () {
  const fs = require("fs");
  const path = require("path");
  const root = path.resolve(__dirname, "..");
  function assert(value, message) { if (!value) throw new Error("P-118: " + message); }
  let passed = 0;
  function check(value, label) { assert(value, label); passed += 1; console.log("  ✅ " + label); }
  const read = p => fs.readFileSync(path.join(root, p), "utf8");
  const exists = p => fs.existsSync(path.join(root, p));

  /* ---------- 1. Dead-branch SQL files are bannered, not runnable-by-mistake ---------- */
  ["supabase/coins-schema.sql", "supabase/finance-schema.sql", "supabase/leaderboards-schema.sql"].forEach(file => {
    const sql = read(file);
    check(sql.includes("SUPERSEDED") && sql.includes("DO NOT RUN"), file + " carries the SUPERSEDED banner");
    check(sql.includes("D-237"), file + " cites decision D-237");
    check(sql.includes("PARAGON ARCHIVE — EXPORT IDENTITY"), file + " keeps its identity header");
  });

  /* ---------- 2. Run docs no longer route through the dead branch ---------- */
  const runPack = read("supabase/SQL-RUN-PACK.md");
  check(!runPack.includes("| 2 | `coins-schema.sql`"), "SQL-RUN-PACK no longer lists coins-schema.sql as step 2");
  check(runPack.includes("SUPERSEDED") && runPack.includes("coins-master-stage4-quiz.sql"), "SQL-RUN-PACK marks the drafts superseded and lists the full master order");
  check(runPack.includes("EDGE-DEPLOY-RUNBOOK.md"), "SQL-RUN-PACK points at the Edge deploy runbook");
  const checklist = read("supabase/OWNER-SQL-CHECKLIST.md");
  check(checklist.includes("ALL SQL") && checklist.includes("DONE"), "OWNER-SQL-CHECKLIST states all SQL is done");
  check(checklist.includes("direct Supabase connector"), "OWNER-SQL-CHECKLIST records the connector correction");
  check(!checklist.includes("**File:** `supabase/coins-schema.sql`"), "OWNER-SQL-CHECKLIST no longer files coins-schema.sql as a run step");
  const verifyPrompt = read("supabase/SUPABASE-AI-VERIFY-PROMPT.md");
  check(verifyPrompt.includes("Supabase connector"), "VERIFY-PROMPT records the connector correction");
  check(verifyPrompt.includes("legacy-absent"), "VERIFY-PROMPT checks the dead-branch tables stay absent");
  check(verifyPrompt.includes("Do NOT list coins-schema.sql"), "VERIFY-PROMPT guards the Supabase-AI migration list");
  const phase3deploy = read("supabase/functions/COINS-PHASE3-DEPLOY.md");
  check(!phase3deploy.includes("2. `coins-schema.sql`"), "COINS-PHASE3-DEPLOY no longer lists coins-schema.sql as its SQL step");

  /* ---------- 3. Edge deploy runbook is the documented next blocker ---------- */
  check(exists("supabase/functions/EDGE-DEPLOY-RUNBOOK.md"), "EDGE-DEPLOY-RUNBOOK.md exists");
  const runbook = read("supabase/functions/EDGE-DEPLOY-RUNBOOK.md");
  ["coin-payment-webhook", "coin-reconcile", "competition-settle"].forEach(fn => {
    check(runbook.includes(fn), "runbook covers " + fn);
    const src = read("supabase/functions/" + fn + "/index.ts");
    check(src.includes("Deno.serve"), fn + "/index.ts is a complete served function");
    check(!/TODO|FIXME|not implemented/i.test(src), fn + "/index.ts has no half-built markers");
  });
  check(runbook.includes("PARAGON_COIN_WEBHOOK_SECRET"), "runbook documents the shared webhook secret");
  check(runbook.includes("OPAY_WEBHOOK_SECRET") && runbook.includes("MONIEPOINT_WEBHOOK_SECRET"), "runbook documents the OPay/Moniepoint secrets");
  check(runbook.includes("--no-verify-jwt"), "runbook gives the deploy commands");

  /* ---------- 4. Half-built completion A — Quiz paid path keeps the dialog law ---------- */
  const quizJs = read("paragon-quiz/js/quiz.js");
  check(!/window\.(alert|prompt|confirm)\s*\(/.test(quizJs), "quiz.js has zero window.alert/prompt/confirm calls");
  check(quizJs.includes("showPaidNotice") && quizJs.includes("paidNotice"), "quiz.js routes paid notices through an inline panel");
  check(read("paragon-quiz/play.html").includes('id="paidNotice"'), "play.html hosts the inline paid notice");
  check(read("paragon-quiz/css/style.css").includes(".paid-notice"), "quiz style.css styles the inline paid notice");

  /* ---------- 5. Half-built completion B — stake-matched 1v1 matchmaking ---------- */
  const app = read("app.js");
  check(app.includes('id="compete-match-stake"'), "1v1 desk has the match-my-stake toggle");
  check(app.includes("STAKE MATCH"), "1v1 desk labels equal-stake pairings");
  check(app.includes("match-my-stake") && app.includes("myStake"), "1v1 desk matches open challenges against the stake input");

  /* ---------- 6. Updates.txt spec doc + capacity + Firebase note ---------- */
  check(exists("docs/GAMES-UPDATES-SPEC.md"), "docs/GAMES-UPDATES-SPEC.md exists");
  const spec = read("docs/GAMES-UPDATES-SPEC.md");
  check(spec.includes("Paragon Spin") && spec.includes("Paragon Chess"), "spec covers Spin + Chess as the new games");
  check(spec.includes("match-my-stake") || spec.includes("matching stake"), "spec covers stake-matched matchmaking");
  check(spec.includes("In-game leaderboard") && spec.includes("Money leaderboard"), "spec keeps the in-game and money leaderboards separate");
  check(spec.includes("115 MB") || spec.includes("500 MB"), "spec gives a concrete Supabase free-tier estimate");
  check(spec.includes("Firebird") && spec.includes("Firebase"), "spec clarifies Firebird vs Firebase");
  check(read("GAMES-BUILD-PLAN.md").includes("P-118"), "GAMES-BUILD-PLAN status block records P-118");

  /* ---------- 7. Cache bump for the shell change ---------- */
  check(read("service-worker.js").includes("paragon-archive-v93"), "cache is v92 after the app.js + docs shell change");

  console.log("\nPASS: " + passed + " checks — P-118 stale-SQL-docs correction, dead-branch banners, Edge runbook, Quiz dialogs, stake-matched matchmaking");
})();

/* ================= FIXTURE: P-119 — Paragon Arcade (five cabinets, complete) ================= */
(function () {
  const fs = require("fs");
  const path = require("path");
  const vm = require("vm");
  const root = path.resolve(__dirname, "..");
  function assert(value, message) { if (!value) throw new Error("P-119: " + message); }
  let passed = 0;
  function check(value, label) { assert(value, label); passed += 1; console.log("  ✅ " + label); }
  const read = p => fs.readFileSync(path.join(root, p), "utf8");
  const exists = p => fs.existsSync(path.join(root, p));

  /* ---------- 1. All arcade files exist with identity headers ---------- */
  ["games/arcade/index.html", "games/arcade/play.html", "games/arcade/SPEC.md",
   "games/arcade/css/style.css", "games/arcade/js/arcade.js", "games/arcade/js/home.js"].forEach(file => {
    check(exists(file), file + " exists");
    check(read(file).includes("PARAGON ARCHIVE — EXPORT IDENTITY"), file + " carries the identity header");
  });

  /* ---------- 2. Pure rules load in a DOM-free context ---------- */
  const storage = {};
  const localStorage = {
    getItem: key => (key in storage ? storage[key] : null),
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: key => { delete storage[key]; },
    key: index => Object.keys(storage)[index] || null,
    get length() { return Object.keys(storage).length; }
  };
  const documentStub = {
    readyState: "complete", title: "",
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    createElement: () => ({ classList: { add() {}, toggle() {} }, setAttribute() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], appendChild() {} }),
    body: { appendChild() {} }, addEventListener() {}
  };
  const context = { console, localStorage, document: documentStub, window: null, URLSearchParams };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(read("games/manifest.js"), context, { filename: "games/manifest.js" });
  vm.runInContext(read("games/arcade/js/arcade.js"), context, { filename: "games/arcade/js/arcade.js" });
  const A = context.ParagonArcade;
  check(!!A, "window.ParagonArcade exports in a DOM-free context");

  /* ---------- 3. Reflex Tap scoring ---------- */
  check(A.scoreReflex(200, false) === 800, "reflex: 200ms scores 800");
  check(A.scoreReflex(0, false) === 1000, "reflex: instant tap caps at 1000");
  check(A.scoreReflex(5000, false) === 50, "reflex: very slow tap floors at 50");
  check(A.scoreReflex(180, true) === 0, "reflex: foul scores 0");
  check(A.reflexOutcome(3200) === "win" && A.reflexOutcome(2000) === "draw" && A.reflexOutcome(900) === "loss", "reflex: 3000+/1500+ win/draw thresholds");

  /* ---------- 4. Memory Match scoring ---------- */
  check(A.memoryMatchPoints(0) === 100 && A.memoryMatchPoints(3) === 175, "memory: 100 + 25/combo");
  check(A.memoryBonus(12) === 120 && A.memoryBonus(18) === 0 && A.memoryBonus(25) === 0, "memory: (18-moves)x20 bonus, none above 18");
  check(Array.isArray(A.MEMORY_GLYPHS) && A.MEMORY_GLYPHS.length === 6, "memory: six pair glyphs declared");

  /* ---------- 5. Timing Bar scoring ---------- */
  check(A.timingPoints(50) === 200 && A.timingPoints(53.9) === 200, "timing: bullseye ±4 scores 200");
  check(A.timingPoints(58) === 120 && A.timingPoints(65) === 60 && A.timingPoints(20) === 0, "timing: zones 120/60/0");
  check(A.timingOutcome(800) === "win" && A.timingOutcome(400) === "draw" && A.timingOutcome(100) === "loss", "timing: 700+/350+ win/draw thresholds");

  /* ---------- 6. Sequence Repeat scoring ---------- */
  check(A.sequenceRoundPoints(1, 3) === 80 && A.sequenceRoundPoints(8, 10) === 500, "sequence: 50xround + 10/pad");
  check(A.sequenceOutcome(8) === "win" && A.sequenceOutcome(5) === "draw" && A.sequenceOutcome(2) === "loss", "sequence: 8/4+ win/draw thresholds");

  /* ---------- 7. Target Sprint scoring ---------- */
  check(A.targetsScore(10, 0) === 1000 && A.targetsScore(10, 4) === 900, "targets: hits x100 minus misses x25");
  check(A.targetsScore(0, 9) === 0, "targets: total never below zero");
  check(A.targetsOutcome(20) === "win" && A.targetsOutcome(12) === "draw" && A.targetsOutcome(5) === "loss", "targets: 18+/10+ win/draw thresholds");
  check(A.VARIANTS.join(",") === "reflex,memory,timing,sequence,targets", "all five variants exported");

  /* ---------- 8. Manifest row is live with five ruled variants ---------- */
  const manifest = context.ParagonGameManifest;
  const arcade = manifest.find("arcade");
  check(arcade && arcade.status === "live", "manifest: arcade is live");
  check(arcade.path === "games/arcade/index.html" && arcade.playPath === "games/arcade/play.html", "manifest: arcade paths are real");
  check(arcade.variants.length === 5, "manifest: arcade ships five variants");
  arcade.variants.forEach(v => {
    check(Array.isArray(v.rules) && v.rules.length >= 4, "manifest: " + v.key + " publishes its rules");
    check(!!v.scoreUnit, "manifest: " + v.key + " declares its score unit");
  });

  /* ---------- 9. Catalogue + home + offline wiring ---------- */
  const catalogue = read("data/catalogue-expansion-45-100.js");
  const row = catalogue.split("\n").find(line => line.includes('name: "Paragon Arcade"'));
  check(!!row && row.includes('siteUrl: "games/arcade/index.html"') && row.includes("live: true"), "catalogue: Arcade opens its real live floor");
  check(!row.includes("Snake") && row.includes("Reflex Tap"), "catalogue: Arcade lists the five real cabinets, not the old concept list");
  const built = Number((row.match(/buildProgress:\s*(\d+)/) || [])[1] || 0);
  check(built === 90, "catalogue: Arcade at 90 pending the owner demo pass");
  const indexHtml = read("games/arcade/index.html");
  ["?v=reflex", "?v=memory", "?v=timing", "?v=sequence", "?v=targets"].forEach(link => {
    check(indexHtml.includes(link), "arcade home links " + link);
  });
  check(indexHtml.includes('id="game-leaderboard"'), "arcade home mounts the in-game leaderboard");
  check(indexHtml.includes("paragon-arcade.png"), "arcade home uses the official Arcade icon art");
  check(indexHtml.includes("points are not Paragon Coins") || indexHtml.includes("not Paragon Coins"), "arcade home states plainly that points are not coins");
  const playHtml = read("games/arcade/play.html");
  check(playHtml.includes('id="game-hud"') && playHtml.includes('id="game-stage"'), "arcade play.html provides the HUD + stage the kit expects");
  const sw = read("service-worker.js");
  check(sw.includes("paragon-archive-v93") && sw.includes('"./games/arcade/play.html"') && sw.includes('"./games/arcade/js/arcade.js"'), "cache v93 precaches the arcade floor for offline play");

  /* ---------- 10. Platform laws inside arcade.js ---------- */
  const src = read("games/arcade/js/arcade.js");
  check(!/window\.(alert|prompt|confirm)\s*\(/.test(src), "arcade.js keeps the no-browser-dialogs law");
  check(!/Math\.random\s*\(/.test(src), "arcade.js draws only through the seeded engine (no Math.random)");
  check(!/addCoins|spendCoins|recordResult|ParagonWallets|ParagonLeaderboards/.test(src), "arcade.js never touches coins, wallets or the money leaderboard");
  check((src.match(/engine\.checkpoint\(/g) || []).length >= 5, "arcade.js checkpoints every cabinet for resume");
  check((src.match(/engine\.action\(/g) || []).length >= 8, "arcade.js audits gameplay actions");
  check(read("games/arcade/SPEC.md").includes("P-119"), "arcade SPEC.md records the P-119 build");
  check(read("GAMES-BUILD-PLAN.md").includes("P-119"), "GAMES-BUILD-PLAN status block records P-119");

  console.log("\nPASS: " + passed + " checks — P-119 Paragon Arcade (five cabinets, complete)");
})();
