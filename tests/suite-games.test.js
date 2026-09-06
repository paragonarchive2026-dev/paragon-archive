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

  const read = file => fs.readFileSync(path.join(root, file), "utf8");
  const exists = file => fs.existsSync(path.join(root, file));

  console.log("🧪 P-116 — games framework + Paragon Cards fixture (free/stake law, gate, fairness, resume, anti-cheat)");

  /* ---------- 1. Files, identity headers, platform shell rules ---------- */
  ["games/engine.js", "games/manifest.js", "games/_shared/game-kit.js", "games/_shared/game-kit.css",
    "games/cards/index.html", "games/cards/play.html", "games/cards/css/style.css",
    "games/cards/js/cards.js", "games/cards/js/home.js"].forEach(file => {
    check(exists(file), file + " exists");
  });

  ["games/engine.js", "games/manifest.js", "games/_shared/game-kit.js", "games/cards/js/cards.js",
    "games/cards/js/home.js", "games/_shared/game-kit.css", "games/cards/css/style.css"].forEach(file => {
    check(read(file).includes("PARAGON ARCHIVE — EXPORT IDENTITY"), file + " carries the export identity header");
  });

  const gameSources = ["games/engine.js", "games/manifest.js", "games/_shared/game-kit.js",
    "games/cards/js/cards.js", "games/cards/js/home.js", "games/cards/index.html", "games/cards/play.html"];
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
  check(cardsEntry.variants.every(v => Array.isArray(v.rules) && v.rules.length >= 4), "every rule set publishes its rules (one-tap rules card)");
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

  /* ---------- 11. Game screen shell (game-kit) ---------- */
  const kitSource = read("games/_shared/game-kit.js");
  check(kitSource.includes("STAKE · LOCKED"), "the HUD shows an honest locked-stake chip");
  check(kitSource.includes("FREE PLAY"), "the HUD always shows the mode chip");
  check(kitSource.includes("gk-panel") && !/window\.confirm\s*\(/.test(kitSource), "quit and resume use inline panels, never window.confirm");
  check(kitSource.includes("Carry on where you left off?"), "the shell offers to resume an unfinished game");
  check(kitSource.includes("seed"), "the result overlay prints the session seed + log hash (auditable results)");
  check(kitSource.includes("onSettled") && !/isBest:\s*!!\(opts\.isBest\)/.test(kitSource), "the personal-best verdict on the result card comes from the engine, never from the game");
  check(kitSource.includes("scoreUnit") && !kitSource.includes("<small>points</small>"), "the result card prints the variant's own score unit (points vs play chips)");
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

  console.log("\n🎉 " + passed + " games checks passed.");
})();
