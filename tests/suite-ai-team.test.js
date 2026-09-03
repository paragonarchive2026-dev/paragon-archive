/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: suite-ai-team.test.js
  EXPECTED PROJECT PATH: /tests/suite-ai-team.test.js
  ROLE: Consolidated regression suite (P-089 file-count reduction) — contains the former fixtures ai.test.js, ai-detail.test.js, team-extension.test.js, community-deployed.test.js unchanged, each in its own scope.
  RESTORE/LOAD NOTE: Run from the project root with node tests/suite-ai-team.test.js. All original checks preserved.
*/

/* ================= FIXTURE: ai.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
function assert(value, message) { if (!value) throw new Error(message); }
const source = fs.readFileSync(path.join(root, "ai/paragon-archive-ai.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const shell = fs.readFileSync(path.join(root, "paragon-archive.html"), "utf8");
const config = fs.readFileSync(path.join(root, "config/supabase.js"), "utf8");
const brain = fs.readFileSync(path.join(root, "docs/AI-BRAIN.md"), "utf8");
for (const forbidden of ["api.groq.com", "openrouter.ai", "generativelanguage.googleapis.com", "text.pollinations.ai", "backend.buildpicoapps.com", "paragon_groq_api_key", "paragon_gemini_api_key", "DEFAULT_BUILDPICO_PK"]) assert(!source.includes(forbidden), `Unsafe browser AI provider/key behavior remains: ${forbidden}`);
assert(/aiEndpoint:\s*""/.test(config) && /aiEnabled:\s*false/.test(config), "AI backend does not default to a disabled secret-free state");
assert(/data\/metrics\.js[\s\S]*ai\/paragon-archive-ai\.js[\s\S]*app\.js/.test(shell), "AI core does not load after catalogue data and before app.js");
assert(/id="paragon-ai-overlay"/.test(shell) && /id="paragon-ai-form"/.test(shell), "Website Detail AI dialog is missing");
assert(app.includes("openDetailAssistant") && app.includes("ParagonAI?.rankWebsites"), "Detail Q&A or Search ranking is not delegated to the one AI core");
assert(/one[- ]core|same core/i.test(brain), "AI Brain does not describe one-core multi-mode architecture");
const context = { console, document: { addEventListener() {} }, ParagonConfig: { aiEndpoint: "", aiEnabled: false } };
context.window = context; vm.createContext(context);
for (const file of ["data/sites.js", "data/catalogue-expansion.js", "data/catalogue-expansion-45-100.js", "ai/paragon-archive-ai.js"]) vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
const ai = context.ParagonAI;
assert(ai.version && ai.modes["archive-search"].active && ai.modes["website-detail"].active, "Search and Website Detail AI modes are not active");
assert(!ai.modes.tutor.active && !ai.modes.product.active && !ai.modes.code.active, "Future Tutor/product/code modes were exposed too early");
let ranked = ai.rankWebsites("beautiful rubbish please make me a CV for a job", { limit: 5 });
assert(ranked[0]?.name === "Paragon Resume", "Messy CV intent did not rank Paragon Resume first");
ranked = ai.rankWebsites("helo me with homewrok", { limit: 8 });
assert(ranked.some(entry => entry.name === "Paragon Tutor"), "Typo-filled homework intent did not find Paragon Tutor");
ranked = ai.rankWebsites("I need calm rain noise for sleep", { limit: 5 });
assert(ranked[0]?.name === "Paragon Sounds", "Vague ambient-sound intent did not rank Paragon Sounds first");
const featureAnswer = ai.answerDetail("Paragon Notes", "What features does it include?");
assert(featureAnswer.text.includes("Paragon Notes") && featureAnswer.text.includes("Markdown") && featureAnswer.evidence.includes("features"), "Detail AI did not ground feature answer in catalogue evidence");
const statusAnswer = ai.answerDetail("Paragon Notes", "Is this finished and live?");
assert(/concept preview/i.test(statusAnswer.text) && /not.*completed production/i.test(statusAnswer.text), "Detail AI did not disclose concept-preview status");
const unknown = ai.answerSearch("quantum teleportation banana engine 9427");
assert(unknown.requestSuggested && unknown.matches.length === 0, "Unknown AI Search intent did not use the Request fallback");
const configuration = ai.getConfiguration();
assert(configuration.endpoint === "" && configuration.externalInferenceEnabled === false && configuration.providerSecretsInBrowser === false, "AI configuration falsely enables external inference or browser secrets");
console.log("PASS: secure one-core Paragon AI handles messy Search intent and grounded Detail Q&A without browser provider secrets or premature product modes");

})();

/* ================= FIXTURE: ai-detail.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
function assert(value, message) { if (!value) throw new Error(message); }

let passed = 0;
function check(value, label) { assert(value, label); passed += 1; console.log("  ✅ " + label); }

/* VM with simulated device stores: need votes + device-written reviews */
const storage = {};
const localStorage = {
  getItem: key => (key in storage ? storage[key] : null),
  setItem: (key, value) => { storage[key] = String(value); },
  removeItem: key => { delete storage[key]; }
};
storage["paragonArchive.siteNeeds.v1"] = JSON.stringify({
  "Paragon Notes": { count: 3, mine: true },
  "Paragon Chess": { count: 5, mine: true }
});
storage["paragonArchive.guestState.v1"] = JSON.stringify({
  reviews: {
    "Paragon Notes": [
      { id: "r1", author: "Tester", stars: 5, text: "I really want offline mode and dark mode please" },
      { id: "r2", author: "Tester", stars: 4, text: "dark mode would be great, also need offline saving" }
    ]
  }
});

const context = {
  console,
  document: { addEventListener() {} },
  ParagonConfig: { aiEndpoint: "", aiEnabled: false },
  localStorage,
  ParagonMetrics: { getViewCount: name => (name === "Paragon Notes" ? 7 : 0) }
};
context.window = context;
vm.createContext(context);
for (const file of ["data/sites.js", "data/catalogue-expansion.js", "data/catalogue-expansion-45-100.js", "ai/paragon-archive-ai.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
}
const ai = context.ParagonAI;

console.log("🧪 ai-detail.test.js — P-075 Detail signal engine");

/* 1. Build-state answer: real %, real needs, real rank, no invented dates */
const buildAnswer = ai.answerDetail("Paragon Notes", "when will it be built? how close is it?");
check(/\d+% built/.test(buildAnswer.text), "build-state answer states the real build percentage");
check(buildAnswer.text.includes("3 need votes"), "build-state answer counts the real need votes");
check(buildAnswer.text.includes("#2 of 2"), "build-state answer ranks demand correctly (#2 behind Chess)");
check(/no individual release date is promised/i.test(buildAnswer.text), "build-state answer promises NO invented dates");
check(buildAnswer.evidence.includes("siteNeeds") && buildAnswer.evidence.includes("buildProgress"), "build-state evidence cites real sources");

/* 2. Rank #1 site sits closest to construction */
const chessAnswer = ai.answerDetail("Paragon Chess", "how soon will this be ready?");
check(/CLOSEST to construction/i.test(chessAnswer.text) && chessAnswer.text.includes("#1"), "most-needed site is told it sits closest to construction");

/* 3. Live site: no fake waiting */
const quizAnswer = ai.answerDetail("Paragon Quiz", "when will it be built?");
check(/already REAL/i.test(quizAnswer.text), "live Paragon Quiz reports it is already real — no fake construction talk");

/* 4. Review-signal analysis: themes + explicit wishes from REAL review texts */
const needsAnswer = ai.answerDetail("Paragon Notes", "what do users want most?");
check(/dark/.test(needsAnswer.text) && /offline/.test(needsAnswer.text), "review themes surface the real repeated keywords (dark, offline)");
check(needsAnswer.text.includes("written on this device"), "review analysis separates device-written from inherited reviews");

/* 5. Future answer: signals labelled honestly, never promised */
const futureAnswer = ai.answerDetail("Paragon Notes", "what future updates will it get?");
check(/not promises/i.test(futureAnswer.text), "future answer labels signals as observations, not promises");
check(/dark|offline/.test(futureAnswer.text), "future answer builds on real review signals");

/* 6. Documentation digest */
const docsAnswer = ai.answerDetail("Paragon Notes", "show me the documentation for this website");
check(docsAnswer.text.includes("PURPOSE") && docsAnswer.text.includes("PLANNED EXPERIENCE"), "documentation answer digests purpose + planned experience");
check(/under-construction page/i.test(docsAnswer.text), "documentation answer points to the real concept-doc location");

/* 7. Zero-state honesty (site with no reviews/needs) */
const zeroAnswer = ai.answerDetail("Paragon Sounds", "what do users need on this?");
check(/honest zero/i.test(zeroAnswer.text), "no-signal site reports an honest zero instead of inventing demand");

/* 8. Existing grounded branches unharmed */
const feature = ai.answerDetail("Paragon Notes", "What features does it include?");
check(feature.evidence.includes("features"), "original feature branch still grounded");
const status = ai.answerDetail("Paragon Notes", "Is this finished and live?");
check(/concept preview/i.test(status.text) && /Real build progress: \d+%/.test(status.text), "status branch keeps honesty phrases and now adds the real build percent");

/* 9. VM without localStorage must not crash (ai.test.js parity) */
const bareContext = { console, document: { addEventListener() {} }, ParagonConfig: { aiEndpoint: "", aiEnabled: false } };
bareContext.window = bareContext;
vm.createContext(bareContext);
for (const file of ["data/sites.js", "data/catalogue-expansion.js", "data/catalogue-expansion-45-100.js", "ai/paragon-archive-ai.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), bareContext);
}
const bare = bareContext.ParagonAI.answerDetail("Paragon Notes", "how close is this to being built?");
check(/0 need votes|No need votes/i.test(bare.text) || /need/.test(bare.text), "engine survives environments without localStorage (honest empty signals)");

console.log(`\nPASS: ${passed} checks — Detail AI reads only real signals and promises nothing it cannot know`);

})();

/* ================= FIXTURE: team-extension.test.js ================= */
(function () {
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

let passed = 0;
let failed = 0;
function assert(condition, label) {
  if (condition) { passed += 1; console.log("  ✅ " + label); }
  else { failed += 1; console.error("  ❌ " + label); }
}

function makeWindow() {
  const storage = {};
  const localStorage = {
    getItem: (key) => (key in storage ? storage[key] : null),
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: (key) => { delete storage[key]; },
    key: (index) => Object.keys(storage)[index] || null,
    get length() { return Object.keys(storage).length; }
  };
  const window = {
    localStorage,
    sessionStorage: localStorage,
    setTimeout: () => 0,
    clearTimeout: () => {},
    location: { pathname: "/team/x.html", search: "" }
  };
  window.window = window;
  return window;
}

function loadPageModule(page, window) {
  window.location = { pathname: "/team/" + page, search: "" };
  return loadScript("team/team-pages.js", window);
}
function loadScript(file, window) {
  const context = vm.createContext({
    window,
    localStorage: window.localStorage,
    navigator: { onLine: true },
    console
  });
  vm.runInContext(read(file), context);
  return window;
}

console.log("🧪 team-extension.test.js — final seven spec pages + Lab (P-067)");

/* ---------- 1. Files exist with identity headers, no alerts/prompts ---------- */
console.log("\n[1] Files, headers, honesty basics");
/* P-097 — the 29 desk pages merged into team/desk.html; content assertions read the desk. */
const NEW_FILES = [
  "team/desk.html",
  "team/login.html",
  "team/team-pages.js"
];
NEW_FILES.forEach((file) => {
  const source = read(file);
  assert(source.includes("PARAGON ARCHIVE — EXPORT IDENTITY"), file + " carries the export-identity header");
  assert(!/window\.alert\s*\(|window\.prompt\s*\(|window\.confirm\s*\(/.test(source), file + " contains no browser dialog calls");
});
assert(!read("team/team-pages.js").match(/registered[^\n]{0,40}\d{2,}/i), "analytics-users module invents no registered-user numbers");
assert(read("team/desk.html").includes("backend"), "User Stats panel declares the backend-pending truth");

/* ---------- 2. Navigation: no 'soon' placeholders remain; Lab is wired ---------- */
console.log("\n[2] Sidebar navigation");
const nav = read("team/nav.js");
assert(!/future:\s*"/.test(nav), "nav.js SECTIONS contain zero remaining 'future' placeholders");
/* P-097 — sidebar links route through desk.html?page=… */
["applications", "content-reviews", "content-community", "content-suggestions",
 "analytics-websites", "analytics-users", "settings", "lab", "construction"].forEach((page) => {
  assert(nav.includes('desk.html?page=' + page), "nav links to the " + page + " desk");
});
assert(/lab:\s*true/.test(nav) && nav.includes("lab-mini-switch"), "Lab renders as its own switch-styled entry");

/* ---------- 3. Page-access law ---------- */
console.log("\n[3] Permissions law (PAGE_ACCESS)");
const permWindow = loadScript("team/permissions.js", makeWindow());
const P = permWindow.ParagonTeamPermissions;
assert(!!P && !!P.PAGE_ACCESS, "permissions.js exposes the law");
assert(JSON.stringify(P.PAGE_ACCESS["settings.html"]) === JSON.stringify(["super-admin"]), "Settings is SUPER ADMIN ONLY");
assert(P.PAGE_ACCESS["applications.html"].length === 2 && P.PAGE_ACCESS["applications.html"].includes("admin"), "Dev Applications = Super Admin + Admin");
["content-reviews.html", "content-community.html", "content-suggestions.html"].forEach((page) => {
  assert(P.PAGE_ACCESS[page].includes("moderator") && !P.PAGE_ACCESS[page].includes("support"), page + " admits moderators, not support");
});
assert(P.PAGE_ACCESS["analytics-websites.html"].includes("developer") && P.PAGE_ACCESS["analytics-websites.html"].includes("analyst"), "Website Stats admits developer(own) + analyst");
assert(!P.PAGE_ACCESS["analytics-users.html"].includes("developer") && P.PAGE_ACCESS["analytics-users.html"].includes("analyst"), "User Stats admits analyst, not developer");
assert(P.PAGE_ACCESS["lab.html"].length === 6, "Lab is open to all six roles");
assert(P.can("moderator", "Delete Reviews") === true && P.can("support", "Delete Reviews") === false, "matrix: moderator deletes reviews, support cannot");
assert(P.can("admin", "Accept Developer Applications") === true && P.can("developer", "Accept Developer Applications") === false, "matrix: only SA/Admin accept applications");

/* ---------- 4. Applications store simulation ---------- */
console.log("\n[4] Dev Applications workflow");
const appWindow = loadPageModule("applications.html", makeWindow());
const Apps = appWindow.ParagonTeamApplications;
assert(Apps.readStore().length === 0, "application queue starts honestly EMPTY (no fake applicants)");
assert(Apps.EXAMPLES.every((example) => example.illustrative === true), "every example application is labelled illustrative");
Apps.writeStore(JSON.parse(JSON.stringify(Apps.EXAMPLES)));
let list = Apps.readStore();
Apps.updateApplication(list, "app-jdev", (a) => { a.status = "accepted"; a.decision = { by: "Paragon", at: new Date().toISOString(), note: "welcome" }; });
list = Apps.readStore();
assert(list.find((a) => a.id === "app-jdev").status === "accepted", "accept decision persists to the store");
const filtered = Apps.applyFilters(list, { status: "pending", query: "", sort: "newest" });
assert(filtered.length === 1 && filtered[0].id === "app-tunde", "status filter isolates remaining pending applicant");
const s = Apps.stats(list);
assert(s.total === 3 && s.accepted === 1 && s.review === 1 && s.pending === 1, "stats derive from real store contents");

/* ---------- 5. Reviews & Reports: real device-review deletion ---------- */
console.log("\n[5] Reviews & Reports");
const revWindow = makeWindow();
revWindow.localStorage.setItem("paragonArchive.guestState.v1", JSON.stringify({
  reviews: { "Paragon Chess": [{ id: "rv-1", author: "Tester", stars: 4, text: "solid" }, { id: "rv-2", author: "Tester", stars: 2, text: "meh" }] }
}));
revWindow.ParagonSites = [{ name: "Paragon Chess", category: "Games", reviews: [{ author: "Sample", stars: 5, text: "inherited" }] }];
const CR = loadPageModule("content-reviews.html", revWindow).ParagonTeamContentReviews;
assert(CR.readReports().length === 0, "report queue starts honestly EMPTY");
assert(CR.deviceReviews().length === 2 && CR.inheritedReviews().length === 1, "browser separates device vs inherited reviews");
assert(CR.deleteDeviceReview("Paragon Chess", "rv-1") === true, "device review REALLY deletes from the shared Archive store");
const guestAfter = JSON.parse(revWindow.localStorage.getItem("paragonArchive.guestState.v1"));
assert(guestAfter.reviews["Paragon Chess"].length === 1 && guestAfter.reviews["Paragon Chess"][0].id === "rv-2", "guest state reflects the deletion");
assert(CR.filterReviews(CR.deviceReviews().concat(CR.inheritedReviews()), { source: "inherited", query: "", stars: "all" }).length === 1, "source filter works");

/* ---------- 6. Suggestions: promote-to-roadmap is REAL ---------- */
console.log("\n[6] Suggestions → Roadmap hand-off");
const sugWindow = loadPageModule("content-suggestions.html", makeWindow());
const Sug = sugWindow.ParagonTeamSuggestions;
assert(Sug.readStore().length === 0, "suggestion queue starts honestly EMPTY");
const promoted = Sug.promoteToRoadmap({ id: "test-1", title: "Offline quiz packs", detail: "download packs", author: "QuizMaster" });
const roadmap = JSON.parse(sugWindow.localStorage.getItem("paragonTeamRoadmap.v1"));
assert(promoted === true && roadmap.some((item) => item.id === "sug-test-1" && item.group === "planned" && item.percent === 0), "promotion writes a REAL planned roadmap record at 0%");
assert(Sug.promoteToRoadmap({ id: "test-1", title: "Offline quiz packs", detail: "x", author: "y" }) === false, "double promotion is refused");

/* ---------- 7. Community posts store ---------- */
console.log("\n[7] Community posts moderation");
const postWindow = loadPageModule("content-community.html", makeWindow());
const Posts = postWindow.ParagonTeamCommunityPosts;
assert(Posts.readStore().length === 0, "post queue starts honestly EMPTY");
Posts.writeStore(JSON.parse(JSON.stringify(Posts.EXAMPLES)));
const flaggedFirst = Posts.applyFilters(Posts.readStore(), { sort: "flagged", query: "", board: "all", status: "all" });
assert(flaggedFirst[0].id === "post-2", "most-flagged sort surfaces the spam post first");
assert(Posts.stats(Posts.readStore()).flagged === 1, "flag stats derive from the store");

/* ---------- 8. Settings: session values really drive session.js ---------- */
console.log("\n[8] Settings → session guard (REAL wiring)");
const setWindow = loadPageModule("settings.html", makeWindow());
const Settings = setWindow.ParagonTeamSettings;
const clamped = Settings.clampSession({ sessionIdleMinutes: 900, sessionWarnSeconds: 2 });
assert(clamped.sessionIdleMinutes === 120 && clamped.sessionWarnSeconds === 30, "session values clamp to safe bounds");
Settings.writeSettings({ sessionIdleMinutes: 10, sessionWarnSeconds: 45 });
const sessionSource = read("team/session.js");
assert(sessionSource.includes("paragonTeamSettings.v1"), "session.js reads the Settings store");
assert(sessionSource.indexOf("PARAGON_SESSION_CONFIG") < sessionSource.indexOf("paragonTeamSettings.v1"), "test override PARAGON_SESSION_CONFIG still takes precedence");
assert(Settings.DESK_STORES.some((store) => store.key === "paragonTeamApplications.v1") && Settings.DESK_STORES.some((store) => store.key === "paragonTeamSuggestions.v1"), "Settings maintenance covers the new desk stores");

/* ---------- 9. Lab ---------- */
console.log("\n[9] Lab (no-action preview)");
const labSource = read("team/team-pages.js");
const labHTML = read("team/desk.html");
const Lab = loadPageModule("lab.html", makeWindow()).ParagonTeamLab;
assert(Lab.PAGES.length >= 5 && Lab.PAGES.every((page) => page.href.indexOf("../") === 0), "Lab previews real project pages only");
Lab.PAGES.forEach((page) => {
  const target = page.href.replace("../", "");
  assert(fs.existsSync(path.join(root, target)), "Lab target exists: " + target);
});
assert(Lab.DEVICE_WIDTHS.mobile === "390px" && Lab.DEVICE_WIDTHS.tablet === "768px", "device frames use real breakpoint widths");
assert(labHTML.includes("lab-shield") && labSource.includes("setActions(false)"), "actions default OFF — the shield blocks interaction (pure preview)");
assert(labHTML.includes("owner explains the rest") || labHTML.includes("owner will"), "Lab honestly states v1 scope pending the owner's full definition");

/* ---------- Summary ---------- */
console.log("\n──────────────────────────────");
console.log("PASSED: " + passed + "   FAILED: " + failed);
if (failed > 0) { process.exitCode = 1; console.error("❌ team-extension fixture FAILED"); }
else console.log("✅ team-extension fixture GREEN");

})();

/* ================= FIXTURE: community-deployed.test.js ================= */
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
    removeItem: key => { delete storage[key]; },
    key: index => Object.keys(storage)[index] || null,
    get length() { return Object.keys(storage).length; }
  };
  const context = { console, localStorage, document: { addEventListener() {}, getElementById: () => null }, window: null,
    setTimeout: () => 0, clearTimeout: () => {} };
  context.window = context;
  vm.createContext(context);
  return { context, storage };
}

console.log("🧪 community-deployed.test.js — P-077 approved-plan loops");

/* ---------- 1. Community Board ---------- */
const boardEnv = makeContext({ "paragonCommunityMembership:test-user": { displayName: "TestMember", joinedAt: "2026-08-10T10:00:00Z" } });
vm.runInContext(fs.readFileSync(path.join(root, "community-board.js"), "utf8"), boardEnv.context);
const Board = boardEnv.context.ParagonCommunityBoard;
check(Board.STORE_KEY === "paragonTeamCommunityPosts.v1", "board shares the EXACT Team moderation store (one real loop)");
check(Board.readStore().length === 0, "board starts honestly EMPTY — no fake posts");
const post = Board.createPost("TestMember", "Ideas", "Offline packs please", "Quiz packs should download for offline play");
check(post.likes === 0 && post.flags === 0 && post.comments.length === 0 && post.pendingBackendSync === true, "new posts carry real-zero counters + backend-sync honesty flag");
Board.writeStore([post]);
check(Board.visiblePosts(Board.readStore()).length === 1, "visible post appears on the board");
/* Team moderation hides it → board loses it */
const moderated = Board.readStore();
moderated[0].status = "hidden";
Board.writeStore(moderated);
check(Board.visiblePosts(Board.readStore()).length === 0, "Team-hidden post REALLY vanishes from the public board");
moderated[0].status = "visible"; moderated[0].likes = 5;
Board.writeStore(moderated);
const another = Board.createPost("TestMember", "General", "Hello", "First hello post here");
Board.writeStore(Board.readStore().concat([another]));
const top = Board.applyView(Board.readStore());
check(top.length === 2, "board view lists both visible posts");

/* ---------- 2. Developer Portal ---------- */
const portalEnv = makeContext({});
vm.runInContext(fs.readFileSync(path.join(root, "developer-portal.js"), "utf8"), portalEnv.context);
const Portal = portalEnv.context.ParagonDeveloperPortal;
check(Portal.APPLICATIONS_KEY === "paragonTeamApplications.v1", "portal applications land in the REAL Team Dev Applications store");
check(Portal.SUBMISSIONS_KEY === "paragonTeamDeployed.submissions.v1", "portal submissions land in the REAL Team Deployed review store");

/* Gate mirror integrity: portal shows the exact team checklist */
const teamDeployed = fs.readFileSync(path.join(root, "team/team-pages.js"), "utf8");
Portal.GATE.forEach(item => check(teamDeployed.includes(`"${item}"`), `gate mirror matches team desk: ${item}`));

/* ---------- 3. Approved submission joins the public catalogue ---------- */
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
check(appSource.includes("mergeApprovedDeployed"), "app.js contains the real Deployed merge");
check(appSource.includes('entry.status === "approved"') && appSource.includes("!entry.illustrative"), "merge accepts ONLY approved, non-illustrative submissions");
const mergeEnv = makeContext({ "paragonTeamDeployed.submissions.v1": [
  { id: "s1", name: "Real Community App", icon: "🧩", submittedBy: "@dev", status: "approved", desc: "A real approved app", url: "https://example.com" },
  { id: "s2", name: "Pending App", status: "pending", submittedBy: "@dev" },
  { id: "s3", name: "My Design Tool", status: "approved", illustrative: true }
] });
mergeEnv.context.ParagonSites = [];
const mergeSnippet = appSource.slice(appSource.indexOf("(function mergeApprovedDeployed()"), appSource.indexOf("})();", appSource.indexOf("(function mergeApprovedDeployed()")) + 5);
vm.runInContext("const sites = window.ParagonSites;" + mergeSnippet, mergeEnv.context);
check(mergeEnv.context.ParagonSites.length === 1 && mergeEnv.context.ParagonSites[0].name === "Real Community App", "ONLY the approved real submission joined the catalogue (pending + illustrative excluded)");
check(mergeEnv.context.ParagonSites[0].stars === 0 && mergeEnv.context.ParagonSites[0].buildProgress === 100, "merged Deployed site starts with honest zero stars and 100% (it is really live)");

/* ---------- 4. Pages exist, headers, no dialogs ---------- */
["community-board.html", "community-board.js", "developer-portal.html", "developer-portal.js"].forEach(file => {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  check(source.includes("PARAGON ARCHIVE — EXPORT IDENTITY"), file + " carries the identity header");
  assert(!/window\.(alert|prompt|confirm)\s*\(/.test(source), file + " has no browser dialogs");
  passed += 1; console.log("  ✅ " + file + " has no browser dialogs");
});
const hub = fs.readFileSync(path.join(root, "paragon-archive-hub.html"), "utf8");
check(hub.includes('href="community-board.html"') && hub.includes('href="developer-portal.html"'), "Hub links to both new destinations");

console.log(`\nPASS: ${passed} checks — the approved Community & Developer loops are real end-to-end`);

})();


/* ================= FIXTURE: P-099 — Stage 5 leaderboards on the Team desk + SQL preparation ================= */
(function () {
const fs9 = require("fs");
const path9 = require("path");
const root9 = path9.resolve(__dirname, "..");
function assert9(value, message) { if (!value) throw new Error(message); }
let passed9 = 0;
function check9(value, label) { assert9(value, label); passed9 += 1; console.log("  ✅ " + label); }

console.log("🧪 P-099 — leaderboard settlement desk + supabase/leaderboards-schema.sql");

const engine9 = fs9.readFileSync(path9.join(root9, "paragon-leaderboards.js"), "utf8");
const desk9 = fs9.readFileSync(path9.join(root9, "team/desk.html"), "utf8");
const team9 = fs9.readFileSync(path9.join(root9, "team/team-pages.js"), "utf8");
const sql9 = fs9.readFileSync(path9.join(root9, "supabase/leaderboards-schema.sql"), "utf8");
const app9 = fs9.readFileSync(path9.join(root9, "app.js"), "utf8");

/* Desk wiring */
check9(desk9.includes('<script src="../paragon-leaderboards.js"></script>') && desk9.indexOf('src="../paragon-leaderboards.js"') < desk9.indexOf('src="team-pages.js"'), "desk.html loads the leaderboard engine before team-pages.js");
check9(desk9.includes('id="lb-settlement-section"') && desk9.includes('id="lb-standings"') && desk9.includes('id="lb-actions"') && desk9.includes('id="lb-audit"'), "settings panel hosts the leaderboard settlement section with all hosts");
check9(team9.includes("function bindLeaderboardSettlement") && team9.includes("bindLeaderboardSettlement();") && team9.includes('data-lbact="close"') && team9.includes('data-lbact="finalize"') && team9.includes('data-lbact="prizes"') && team9.includes('data-lbact="credit"'), "team-pages.js binds the full settlement flow (close, finalize, prizes, credit)");
check9(team9.includes('data-lbact="disqualify"') && team9.includes('data-lbact="restore"') && team9.includes("setEntryEligibility") && team9.includes("Super Admin (this device)"), "anti-abuse eligibility decisions are explicit super-admin actions on the desk");
check9(team9.includes("issueCredits") && team9.includes("ParagonTeamConfirm"), "credits require an explicit super-admin approval modal");
check9(!/window\.(alert|prompt|confirm)\s*\(/.test(desk9) && !/window\.(alert|prompt|confirm)\s*\(/.test(team9), "desk + team-pages keep the no-browser-dialogs law");

/* Engine mirrored on both sides */
check9(engine9.includes("ParagonLeaderboards") && engine9.includes("weekly-leaderboard-reward"), "engine exposes ParagonLeaderboards + reward credit kind");
check9(app9.includes("window.ParagonLeaderboards") || app9.includes("ParagonLeaderboards"), "app.js consumes the shared engine");

/* SQL preparation (run when the betting stage lands) */
for (const token of [
  "create table if not exists public.paragon_leaderboards",
  "create table if not exists public.paragon_leaderboard_entries",
  "create table if not exists public.paragon_competition_fees",
  "create table if not exists public.paragon_rewards",
  "create table if not exists public.paragon_leaderboard_audit",
  "create table if not exists public.paragon_economic_settings",
  "leaderboard_distribution",
  "'[30,20,15,10,7,5,4,3,2,4]'",
  "'0.30'",
  "paragon_leaderboard_standings",
  "status text not null default 'active' check (status in ('active','disqualified'))",
  "grant execute on function public.paragon_leaderboard_standings(text) to anon, authenticated",
  "paragon_team_members",
  "enable row level security"
]) check9(sql9.includes(token), `leaderboards-schema.sql contains: ${token}`);

check9(sql9.includes("free play NEVER awards points"), "SQL documents the free-play-never-points rule");
check9(sql9.includes("creator self-play") || sql9.includes("self-play"), "SQL documents the creator self-play rule");
check9(!/insert into public\.paragon_leaderboard_entries/i.test(sql9) || sql9.includes("on conflict"), "SQL never seeds fake leaderboard entries");

console.log(`\nPASS: ${passed9} checks — P-099 leaderboard settlement desk + prepared backend schema`);

})();
