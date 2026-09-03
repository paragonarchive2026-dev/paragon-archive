/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: suite-ux.test.js
  EXPECTED PROJECT PATH: /tests/suite-ux.test.js
  ROLE: Consolidated regression suite (P-089 file-count reduction) — contains the former fixtures help-support.test.js, metrics-carousel.test.js, privacy.test.js, product-preview.test.js, request-website.test.js, search-navigation.test.js, ui-regression.test.js unchanged, each in its own scope.
  RESTORE/LOAD NOTE: Run from the project root with node tests/suite-ux.test.js. All original checks preserved.
*/

/* ================= FIXTURE: help-support.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "paragon-archive-hub.html"), "utf8");
const source = fs.readFileSync(path.join(root, "archive-hub.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const archive = fs.readFileSync(path.join(root, "paragon-archive.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const schema = fs.readFileSync(path.join(root, "supabase/schema.sql"), "utf8");
const submitWorker = fs.readFileSync(path.join(root, "supabase/functions/submit-support-message/index.ts"), "utf8");
const supportGuide = fs.readFileSync(path.join(root, "supabase/functions/SUPPORT-INTEGRATION.md"), "utf8");

function assert(condition, message) { if (!condition) throw new Error(message); }

for (const phrase of [
  "🆘</span> HELP &amp; SUPPORT",
  "We are here.",
  "Ask us anything.",
  "Whatever you need — we will sort it out together.",
  "We Are Real People",
  "we will get back to you within <strong>72 hours</strong>",
  "No bots. No automated runaround.",
  "Contact Form",
  "Direct Email",
  "Send Us a Message",
  "What should we call you?",
  "We will reply here",
  "What do you need help with?",
  "Describe your issue",
  "0 / 2000 characters",
  "Click to attach or drag and drop",
  "PNG, JPG, GIF up to 10MB",
  "SEND MESSAGE 📬",
  "Reporting a Bug",
  "What counts as a bug:",
  "What is NOT a bug:",
  "When reporting a bug please include:",
  "Attach your screenshot directly in the form.",
  "Frequently Asked Questions",
  "🔑 Account",
  "🌐 Websites",
  "🔔 Notifications and Settings",
  "💰 Pricing",
  "How do I create an account?",
  "I forgot my password. What do I do?",
  "How do I delete my account?",
  "Can I download my data?",
  "How do I open a website?",
  "How do I request a website that does not exist yet?",
  "How do I opt out of analytics tracking?",
  "Is Paragon Archive free?",
  "Will it always be free?",
  "How to Use Paragon Archive",
  "Step 1 — Account",
  "Step 2 — Create Account",
  "Step 3 — Archive",
  "Step 4 — Open Website",
  "Step 5 — Save",
  "Step 6 — Stay Updated",
  "Screenshot placeholder"
]) assert(html.includes(phrase), `Help page is missing supplied copy: ${phrase}`);

assert((html.match(/<details>/g) || []).length === 15, "FAQ does not contain all fifteen supplied questions");
assert((html.match(/class="docs-step"/g) || []).length === 6, "Documentation guide does not contain all six steps");
assert((html.match(/class="docs-shot-placeholder /g) || []).length === 6, "Documentation screenshot placeholders are incomplete");
for (const icon of ["⚙️", "👤", "◈", "🌐", "🔖", "↻"]) assert(html.includes(`<span>${icon}</span>`), `Confirmed guide icon is missing: ${icon}`);
assert(!/all 100 Paragon-built websites|full archive grid/i.test(html), "Help documentation publicly exposes the private catalogue total or removed full grid");
assert(html.includes("Secure permanent deletion still requires the planned backend deletion workflow"), "Account deletion FAQ falsely claims the pending backend already deletes accounts");
assert(html.includes("use Open in New Tab") && html.includes("Guest reviews are temporary"), "FAQ does not reflect iframe fallback or Guest-session behavior");

const topics = ["General Question", "Bug Report", "Account Issue", "Website Not Loading", "Privacy Concern", "Feature Suggestion", "Other"];
for (const topic of topics) assert(html.includes(`<option>${topic}</option>`), `Support topic is missing: ${topic}`);
for (const subject of ["Support", "Bug", "Billing", "Privacy", "Other"]) assert(html.includes(`subject=${subject}`), `Direct-email subject link is missing: ${subject}`);
for (const id of ["support-form", "support-name", "support-email", "support-topic", "support-message", "support-message-count", "support-attachment", "support-drop-zone", "support-file-state", "support-submit", "support-status"]) {
  assert(html.includes(`id="${id}"`), `Help form is missing ${id}`);
}
assert(/maxlength="2000"/.test(html) && /accept="image\/png,image\/jpeg,image\/gif"/.test(html), "Message/file constraints are missing from Help form");
// P-094 — Help opens the in-app support popup (openSupportOverlay) and the footer routes through the Hub detail (then=help).
assert(archive.includes('then=help') || app.includes("openSupportOverlay"), "Help & Support route was lost in the P-094 detail-first footer");
assert(serviceWorker.includes('"./paragon-archive-hub.html"') && serviceWorker.includes('"./archive-hub.js"') && !serviceWorker.includes('"./help-support.js"'), "Consolidated Help is missing from the Hub PWA shell");

for (const token of [
  "create table if not exists public.paragon_support_messages",
  "revoke all on table public.paragon_support_messages from anon, authenticated",
  "enforce_paragon_support_rate_limit",
  "pg_advisory_xact_lock",
  "interval '24 hours'",
  "support-attachments",
  "10485760",
  "queue_paragon_support_notification",
  "'support-notification'"
]) assert(schema.includes(token), `Support schema is missing: ${token}`);

for (const token of [
  'Deno.env.get("PARAGON_ALLOWED_ORIGINS")',
  "request.formData()",
  "image/png",
  "image/jpeg",
  "image/gif",
  "maximumAttachmentBytes",
  "SUPPORT_RATE_LIMIT",
  "paragon_support_messages",
  "support-attachments",
  "authenticatedUserId"
]) assert(submitWorker.includes(token), `Support Edge Function is missing: ${token}`);
assert(supportGuide.includes("Free-first anti-spam rules") && supportGuide.includes("supabase functions deploy submit-support-message --no-verify-jwt"), "Support activation guide is incomplete");
assert(supportGuide.includes("No IP address or device fingerprint is stored"), "Support privacy/rate-limit guidance is missing");

function classList() {
  const values = new Set();
  return { add: (...names) => names.forEach(name => values.add(name)), remove: (...names) => names.forEach(name => values.delete(name)), contains: name => values.has(name) };
}

function createFixture() {
  const elements = new Map();
  const documentListeners = {};
  const submissions = [];

  function makeElement(id) {
    const handlers = {};
    const node = {
      id,
      value: "",
      textContent: "",
      className: "",
      hidden: false,
      disabled: false,
      files: [],
      classList: classList(),
      addEventListener(type, handler) { handlers[type] = handler; },
      focus() {},
      click() {},
      reset() {
        for (const field of ["support-name", "support-email", "support-topic", "support-message", "support-company", "support-attachment"]) elements.get(field).value = "";
      },
      _handlers: handlers
    };
    elements.set(id, node);
    return node;
  }

  for (const id of ["support-form", "support-name", "support-email", "support-topic", "support-message", "support-message-count", "support-company", "support-attachment", "support-drop-zone", "support-file-state", "support-file-name", "support-file-remove", "support-submit", "support-status"]) makeElement(id);
  elements.get("support-file-state").hidden = true;

  const context = {
    console,
    FormData,
    ParagonConfig: { supabaseUrl: "https://project.supabase.co", supabaseAnonKey: "public-anon-key-longer-than-twenty-characters" },
    ParagonAuth: { getSession: async () => ({ access_token: "user-token", user: { email: "member@example.com", user_metadata: { display_name: "Archive Member" } } }) },
    fetch: async (url, options) => {
      submissions.push({ url, options });
      return { ok: true, status: 201, async json() { return { ok: true, id: "support-1" }; } };
    },
    document: {
      getElementById: id => elements.get(id) || null,
      addEventListener(type, handler) { documentListeners[type] = handler; }
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, elements, submissions };
}

async function run() {
  const fixture = createFixture();
  await fixture.context.ParagonSupport.initialize();
  assert(fixture.elements.get("support-name").value === "Archive Member" && fixture.elements.get("support-email").value === "member@example.com", "Authenticated support identity was not prefilled");
  assert(fixture.context.ParagonSupport.topics.length === 7, "Support controller topic allowlist is incomplete");

  const oversized = { name: "large.png", type: "image/png", size: 10 * 1024 * 1024 + 1 };
  const wrongType = { name: "notes.pdf", type: "application/pdf", size: 2000 };
  const validFile = { name: "screen.png", type: "image/png", size: 2048 };
  assert(!fixture.context.ParagonSupport.validateFile(oversized).valid, "Oversized screenshot was accepted");
  assert(!fixture.context.ParagonSupport.validateFile(wrongType).valid, "Unsupported screenshot type was accepted");
  assert(fixture.context.ParagonSupport.validateFile(validFile).valid, "Valid screenshot was rejected");

  fixture.elements.get("support-topic").value = "Bug Report";
  fixture.elements.get("support-message").value = "The Account button stopped responding after I returned from a website detail page.";
  fixture.context.ParagonSupport.updateCharacterCount();
  assert(fixture.elements.get("support-message-count").textContent === "82 / 2000 characters", "Support character counter did not update");
  const result = await fixture.context.ParagonSupport.submitSupportMessage({ preventDefault() {} });
  assert(result.submitted && fixture.submissions.length === 1, "Valid support message was not submitted to the Edge Function");
  const sentForm = fixture.submissions[0].options.body;
  assert(sentForm.get("name") === "Archive Member" && sentForm.get("topic") === "Bug Report", "Support form payload is incomplete");
  assert(fixture.elements.get("support-status").textContent.includes("within 72 hours"), "Support success state does not preserve the response promise");

  console.log("PASS: Help page copy, direct-email subjects, form/counter, screenshot rules, private support schema, Edge contract, and owner notification path");
}

run().catch(error => { console.error(error); process.exitCode = 1; });

})();

/* ================= FIXTURE: metrics-carousel.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeClassList(initial = []) {
  const values = new Set(initial);
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    contains: name => values.has(name),
    toggle: (name, force) => {
      const enabled = force === undefined ? !values.has(name) : Boolean(force);
      if (enabled) values.add(name);
      else values.delete(name);
      return enabled;
    }
  };
}

const storage = new Map();
const context = {
  console,
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  }
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "data/sites.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "data/catalogue-expansion.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "data/catalogue-expansion-45-100.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "data/metrics.js"), "utf8"), context);

const metrics = context.ParagonMetrics;
const sites = context.ParagonSites;
// P-033 fixture-freshness fix: anchor deterministic test dates to the most recent
// Tuesday at 12:00 local so recorded view events always survive the eight-day
// pruneState() window measured against the real current time. The original fixed
// anchor (Tuesday 2026-08-04) aged out of that window and broke the fixture.
const anchor = new Date();
anchor.setHours(12, 0, 0, 0);
while (anchor.getDay() !== 2) anchor.setDate(anchor.getDate() - 1);
const firstDate = new Date(anchor);
const sameDateLater = new Date(firstDate);
sameDateLater.setHours(23, 30, 0, 0);
const nextDate = new Date(firstDate);
nextDate.setDate(nextDate.getDate() + 1);

const initialDaily = metrics.getDailyFeaturedSites(7, firstDate).map(site => site.name);
assert(initialDaily.length === 7, `Daily featured should contain 7 sites, received ${initialDaily.length}`);
assert(new Set(initialDaily).size === 7, "Daily featured contains duplicate sites");

const promotedSite = sites.find(site => !initialDaily.includes(site.name));
assert(promotedSite, "No non-featured site available for daily rollover test");
metrics._debug.state.localViews[promotedSite.name] = 1000000;
const frozenDaily = metrics.getDailyFeaturedSites(7, sameDateLater).map(site => site.name);
assert(JSON.stringify(frozenDaily) === JSON.stringify(initialDaily), "Daily ranking changed before the date rolled over");
const nextDaily = metrics.getDailyFeaturedSites(7, nextDate).map(site => site.name);
assert(nextDaily.includes(promotedSite.name), "New daily snapshot did not use updated view totals");

const viewsBefore = metrics.getViewCount("Paragon Resume");
metrics.recordView("Paragon Resume", firstDate);
assert(metrics.getViewCount("Paragon Resume") === viewsBefore + 1, "recordView did not increment the stable total");

const staffFirst = metrics.getDailyStaffPickEntries(firstDate);
assert(staffFirst.length === sites.length, `Daily Staff ranking should contain the full catalogue, received ${staffFirst.length}`);
assert(new Set(staffFirst.map(entry => entry.name)).size === sites.length, "Daily Staff ranking contains duplicate or missing sites");
for (let index = 1; index < staffFirst.length; index += 1) {
  const previous = staffFirst[index - 1];
  const current = staffFirst[index];
  const ordered =
    previous.last24hViews < current.last24hViews ||
    (previous.last24hViews === current.last24hViews && previous.rating < current.rating) ||
    (previous.last24hViews === current.last24hViews && previous.rating === current.rating && previous.reviewCount < current.reviewCount) ||
    (previous.last24hViews === current.last24hViews && previous.rating === current.rating && previous.reviewCount === current.reviewCount && previous.totalViews <= current.totalViews);
  assert(ordered, `Daily Staff ranking is out of ascending opportunity order at ${current.name}`);
}
const originalStaffLeader = staffFirst[0].name;
for (let count = 0; count < 6; count += 1) {
  metrics.recordView(originalStaffLeader, new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 13, count, 0));
}
const staffFrozen = metrics.getDailyStaffPickEntries(sameDateLater).map(entry => entry.name);
assert(JSON.stringify(staffFrozen) === JSON.stringify(staffFirst.map(entry => entry.name)), "Daily Staff ranking changed before the date rolled over");
const staffNextDay = metrics.getDailyStaffPickEntries(nextDate);
assert(staffNextDay.findIndex(entry => entry.name === originalStaffLeader) > 0, "New Staff snapshot did not move the recently viewed former leader behind an underexposed site");

// Seed all seven days of the prior week to prove daily-feature carryover affects the next weekly snapshot.
const weeklyDate = new Date(firstDate); // Anchor Tuesday; its week begins the previous Monday.
const weekMonday = new Date(firstDate);
weekMonday.setDate(weekMonday.getDate() - 1);
function dayInWeek(base, offset, hour = 12, minute = 0) {
  const result = new Date(base);
  result.setDate(result.getDate() + offset);
  result.setHours(hour, minute, 0, 0);
  return result;
}
for (let offset = 7; offset >= 1; offset -= 1) {
  const key = metrics.getDateKey(dayInWeek(weekMonday, -offset));
  metrics._debug.state.dailyFeatures[key] = [promotedSite.name];
  metrics._debug.state.dailyViews[key] = { [promotedSite.name]: 3 };
}
const weeklyOne = metrics.getWeeklyRankingEntries(weeklyDate);
const promotedEntry = weeklyOne.find(entry => entry.name === promotedSite.name);
assert(promotedEntry.featuredDays === 7, `Expected 7 prior-week featured days, received ${promotedEntry.featuredDays}`);
assert(weeklyOne[0].name === promotedSite.name, "Prior-week daily featured site did not lead the following weekly ranking");
const frozenWeeklyNames = weeklyOne.map(entry => entry.name);
metrics._debug.state.localViews[sites[0].name] = 5000000;
const weeklyOneLater = metrics.getWeeklyRankingEntries(dayInWeek(weekMonday, 5, 18)).map(entry => entry.name);
assert(JSON.stringify(weeklyOneLater) === JSON.stringify(frozenWeeklyNames), "Weekly snapshot changed before the next week");

const nextWeeklyLeader = sites.find(site => site.name !== promotedSite.name);
for (let offset = 0; offset <= 6; offset += 1) {
  const key = metrics.getDateKey(dayInWeek(weekMonday, offset));
  metrics._debug.state.dailyFeatures[key] = [nextWeeklyLeader.name];
  metrics._debug.state.dailyViews[key] = { [nextWeeklyLeader.name]: 5 };
}
const weeklyTwo = metrics.getWeeklyRankingEntries(dayInWeek(weekMonday, 8));
assert(weeklyTwo[0].name === nextWeeklyLeader.name, "New weekly snapshot did not use the new prior-week daily features");
assert(weeklyTwo.length === sites.length, `Weekly ranking should contain the full catalogue, received ${weeklyTwo.length}`);

// Add the smallest DOM fixture needed to validate seven slides and manual controls.
metrics._debug.state.dailyFeatures[metrics.getDateKey(new Date())] = initialDaily;
const elements = new Map();
function makeElement(id) {
  const listeners = {};
  const element = {
    id,
    innerHTML: "",
    dataset: {},
    classList: makeClassList(),
    listeners,
    addEventListener(type, handler) { listeners[type] = handler; },
    setPointerCapture() {},
    releasePointerCapture() {},
    focus() {}
  };
  elements.set(id, element);
  return element;
}
const heroInner = makeElement("hero-inner");
const heroDots = makeElement("hero-dots");
const heroSection = makeElement("hero-section");
const heroPrevious = makeElement("hero-prev");
const heroNext = makeElement("hero-next");
const staffRow = makeElement("staff-row");
const staffFullList = makeElement("staff-full-list");
makeElement("staff-day-label");
makeElement("staff-summary");
const slideElements = Array.from({ length: 7 }, () => ({ classList: makeClassList(), setAttribute() {} }));
const dotElements = Array.from({ length: 7 }, () => ({ classList: makeClassList(), setAttribute() {} }));
let intervalCallback = null;
context.setInterval = callback => { intervalCallback = callback; return 1; };
context.clearInterval = () => {};
context.requestAnimationFrame = callback => callback();
context.setTimeout = callback => callback();
context.alert = () => {};
context.innerHeight = 800;
context.scrollY = 0;
context.addEventListener = () => {};
context.scrollTo = () => {};
context.document = {
  addEventListener() {},
  activeElement: null,
  body: { classList: makeClassList(), style: {} },
  documentElement: { scrollHeight: 2000, style: { setProperty() {} } },
  getElementById: id => elements.get(id) || null,
  querySelector: () => null,
  querySelectorAll(selector) {
    if (selector === ".hero-slide") return slideElements;
    if (selector === "#hero-dots .dot") return dotElements;
    return [];
  }
};
vm.runInContext(fs.readFileSync(path.join(root, "app.js"), "utf8"), context);
vm.runInContext("renderHero()", context);

assert((heroInner.innerHTML.match(/class="hero-slide/g) || []).length === 7, "Hero did not render seven slides");
assert((heroDots.innerHTML.match(/class="dot/g) || []).length === 7, "Hero did not render seven dots");
assert(typeof heroPrevious.listeners.click === "function" && typeof heroNext.listeners.click === "function", "Previous/next controls were not bound");

heroNext.listeners.click();
assert(vm.runInContext("heroIndex", context) === 1, "Next control did not advance the hero");
heroPrevious.listeners.click();
assert(vm.runInContext("heroIndex", context) === 0, "Previous control did not move the hero backward");
vm.runInContext("setHero(6)", context);
heroNext.listeners.click();
assert(vm.runInContext("heroIndex", context) === 0, "Hero did not wrap using the seven-slide count");

heroSection.listeners.pointerdown({ button: 0, clientX: 300, pointerId: 1, target: { closest: () => null } });
heroSection.listeners.pointerup({ clientX: 100, pointerId: 1 });
assert(vm.runInContext("heroIndex", context) === 1, "Left swipe did not advance the hero");
heroSection.listeners.keydown({ key: "ArrowLeft", preventDefault() {} });
assert(vm.runInContext("heroIndex", context) === 0, "Keyboard ArrowLeft did not move the hero backward");
assert(typeof intervalCallback === "function", "Six-second automatic timer was not created");
intervalCallback();
assert(vm.runInContext("heroIndex", context) === 1, "Automatic timer did not advance the hero");

vm.runInContext("renderStaffPicks()", context);
// P-092 replacement law: the old staff-ribbon was REPLACED by the single badge-staff-pick (owner order — no double badges).
assert((staffRow.innerHTML.match(/badge-staff-pick/g) || []).length === 1 && !staffRow.innerHTML.includes("staff-ribbon"), "Staff Pick must carry exactly ONE badge (the new one)");
assert((staffRow.innerHTML.match(/class="staff-mini-card"/g) || []).length === 2, "Staff preview did not render two smaller cards");
vm.runInContext("renderFullStaffPickList()", context);
assert((staffFullList.innerHTML.match(/class="trending-rank-card staff-rank-card"/g) || []).length === sites.length, "Full Staff Picks list did not render the full catalogue");

console.log("PASS: daily hero/Staff and weekly Trending snapshots, view metrics, carousel controls, three-card Staff preview, and full Staff list");

})();

/* ================= FIXTURE: privacy.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
function assert(value, message) { if (!value) throw new Error(message); }
const local = new Map(), session = new Map(), elements = new Map(), documentListeners = {};
function el(id) {
  const handlers = {};
  const node = { id, hidden: false, checked: false, textContent: "", className: "", classList: { add() {}, remove() {}, contains() { return false; } }, addEventListener(type, fn) { handlers[type] = fn; }, setAttribute() {}, focus() {}, _handlers: handlers };
  elements.set(id, node); return node;
}
["cookie-banner","cookie-essential","cookie-manage","cookie-accept-all","privacy-analytics","privacy-tracking","privacy-ads","privacy-controls-save","privacy-download-data","privacy-delete-account","privacy-controls-status"].forEach(el);
const context = {
  console,
  localStorage: { getItem:k=>local.get(k)??null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k) },
  sessionStorage: { getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k) },
  CustomEvent: class { constructor(type, init) { this.type=type; this.detail=init?.detail; } },
  Blob,
  URL: { createObjectURL:()=>"blob:test", revokeObjectURL(){} },
  setTimeout: fn=>fn(),
  requestAnimationFrame: fn=>fn(),
  dispatchEvent() {},
  location: { href: "https://example.test/paragon-archive.html" }
};
context.window = context;
context.document = {
  body: { classList: { add() {}, remove() {} }, appendChild() {} },
  addEventListener(type, fn) { documentListeners[type] = fn; },
  getElementById: id => elements.get(id) || null,
  createElement() { return { click() {}, remove() {}, set href(v) {}, set download(v) {} }; }
};
const policyHTML = fs.readFileSync(path.join(root,"paragon-archive-hub.html"),"utf8");
assert(policyHTML.includes("Email delivery providers") && policyHTML.includes("authentication or transactional messages"),"Privacy policy does not disclose transactional email delivery providers");
assert(policyHTML.includes("Support messages, bug reports and optional screenshots"),"Privacy policy does not disclose support messages/screenshots");
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,"privacy.js"),"utf8"),context);
documentListeners.DOMContentLoaded();
assert(elements.get("cookie-banner").hidden === false,"First-visit cookie banner did not appear");
elements.get("cookie-essential")._handlers.click();
let prefs=JSON.parse(local.get("paragonArchive.privacyPreferences.v1"));
assert(prefs.decided && !prefs.analytics && !prefs.tracking && !prefs.ads,"Essential-only consent is incorrect");
elements.get("cookie-accept-all")._handlers.click();
prefs=JSON.parse(local.get("paragonArchive.privacyPreferences.v1"));
assert(prefs.analytics && prefs.tracking && prefs.ads,"Accept-all consent is incorrect");
session.set("paragonArchive.guestSession.v1","true");
context.ParagonPrivacy.savePreferences({ analytics:false, tracking:true, ads:false });
assert(session.has("paragonArchive.privacyPreferences.v1"),"Guest privacy preferences were not session-only");
assert(context.ParagonPrivacy.trackingAllowed(),"Privacy API did not expose tracking preference");
console.log("PASS: first-visit banner, essential/all consent, controls state, and Guest session-only privacy preferences");

})();

/* ================= FIXTURE: product-preview.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
function assert(value, message) { if (!value) throw new Error(message); }
const html = fs.readFileSync(path.join(root, "paragon-product-preview.html"), "utf8");
const source = fs.readFileSync(path.join(root, "product-preview.js"), "utf8");
const sw = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const brain = fs.readFileSync(path.join(root, "docs/AI-BRAIN.md"), "utf8");
assert(/data\/sites\.js[\s\S]*data\/catalogue-expansion\.js[\s\S]*data\/catalogue-expansion-45-100\.js[\s\S]*product-preview\.js/.test(html), "Product preview script order is incorrect");
assert(sw.includes('"./paragon-product-preview.html"') && sw.includes('"./product-preview.js"'), "Product preview is missing from PWA shell");
const catalogue = { console }; catalogue.window = catalogue; vm.createContext(catalogue);
for (const file of ["data/sites.js", "data/catalogue-expansion.js", "data/catalogue-expansion-45-100.js"]) vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), catalogue);
assert(brain.includes("# PARAGON ARCHIVE — AI BRAIN") && brain.includes("Hybrid retrieval") && brain.includes("Backend/API design") && brain.includes("Hallucination and honesty rules"), "AI Brain is missing knowledge/retrieval/backend/safety foundations");
for (const site of catalogue.ParagonSites) assert(brain.includes(`| ${site.name} |`) || brain.includes(`| ${site.name.replace('|','\\|')} |`), `AI Brain is missing catalogue knowledge for ${site.name}`);
const hub = catalogue.ParagonSites.find(site => site.name === "Paragon Archive Hub");
assert(hub.siteUrl === "paragon-archive-hub.html" && !hub.previewOnly, "Archive Hub real destination was replaced by a concept preview");
// P-048: Paragon Quiz is the first real product build with a live same-origin destination.
const quiz = catalogue.ParagonSites.find(site => site.name === "Paragon Quiz");
assert(quiz.siteUrl === "paragon-quiz/index.html" && !quiz.previewOnly, "Paragon Quiz live destination was replaced by a concept preview");
const LIVE_SITES = new Set([
  "Paragon Archive Hub",
  "Paragon Quiz",
  // P-099 — first in-project product wave from docs/site-specs
  "Paragon Invoice",
  "Paragon Resume",
  "Paragon Recipe",
  "Paragon Flash",
  "Paragon Files",
  "Paragon Travel",
  "Paragon Photo",
  "Paragon Shop"
]);
const previewSites = catalogue.ParagonSites.filter(site => !LIVE_SITES.has(site.name));
assert(previewSites.every(site => site.previewOnly && /^paragon-product-preview\.html\?site=/.test(site.siteUrl)), "Not every unfinished catalogue site has the shared tailored preview route");
for (const name of LIVE_SITES) {
  if (name === "Paragon Archive Hub" || name === "Paragon Quiz") continue;
  const live = catalogue.ParagonSites.find(site => site.name === name);
  assert(live && live.siteUrl && live.siteUrl.startsWith("sites/") && !live.previewOnly, `${name} must open its in-project /sites/ build (P-099)`);
}const container = { innerHTML: "" };
const runtime = {
  console,
  URLSearchParams,
  location: { search: "?site=Paragon%20Notes" },
  document: {
    title: "",
    documentElement: { style: { setProperty() {} } },
    getElementById: id => id === "product-preview" ? container : null,
    addEventListener() {}
  },
  ParagonSites: catalogue.ParagonSites
};
runtime.window = runtime; vm.createContext(runtime); vm.runInContext(source, runtime); runtime.ParagonProductPreview.render();
assert(container.innerHTML.includes("Paragon Notes") && container.innerHTML.includes("Not the final production website") && container.innerHTML.includes("Planned experience"), "Tailored product preview did not render honest catalogue content");
assert(!container.innerHTML.includes("Preview not found"), "Existing product routed to preview-not-found state");
console.log("PASS: all unfinished catalogue websites use the shared honest tailored iframe preview while Archive Hub keeps its real destination");

})();

/* ================= FIXTURE: request-website.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "paragon-archive-hub.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const shell = fs.readFileSync(path.join(root, "paragon-archive.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const source = fs.readFileSync(path.join(root, "archive-hub.js"), "utf8");
const syncSource = fs.readFileSync(path.join(root, "auth/paragon-sync.js"), "utf8");
const schema = fs.readFileSync(path.join(root, "supabase/schema.sql"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const phrase of [
  "💡</span> REQUEST A WEBSITE",
  "You imagine it.",
  "We build it.",
  "Tell Us What You Need",
  "This is how Paragon grows — with you.",
  "website requests submitted so far",
  "RECENTLY BUILT FROM YOUR REQUESTS",
  "These started as requests just like yours.",
  "Submit Your Request",
  "Fill in the details below and send it our way.",
  "Website Name or Idea",
  "What would you call it? e.g. Paragon Maps",
  "What should it do?",
  "Why do you think people need this?",
  "Your Email",
  "I understand that submitting a request does not guarantee it will be built",
  "SUBMIT MY REQUEST 💡",
  "One request every 7 days"
]) assert(html.includes(phrase), `Dedicated request page is missing supplied copy: ${phrase}`);

for (const id of [
  "request-page-form", "request-page-name", "request-page-category", "request-page-reason", "request-page-reason-count",
  "request-page-need", "request-page-need-count", "request-page-email", "request-page-acknowledgement",
  "request-page-submit", "request-page-status", "request-identity-status", "request-counter-value", "request-counter-number"
]) assert(html.includes(`id="${id}"`), `Dedicated request page is missing ${id}`);

assert(!html.includes('id="request-page-url"'), "Removed example-URL field remains in the dedicated request form");
assert(!/>247</.test(html) && /id="request-counter-number">0</.test(html), "Request counter does not start at the real zero-safe value");
assert(/maxlength="1000"/.test(html) && /0 \/ 1000 characters/.test(html), "What-should-it-do 1000-character limit/counter is missing");
assert(/maxlength="500"/.test(html) && /0 \/ 500 characters/.test(html), "Why-needed 500-character limit/counter is missing");
assert(/type="checkbox" required/.test(html), "Required request acknowledgement is missing");
assert(html.includes("without using an IP address or device fingerprint for this limit"), "Account-only anti-bypass/privacy disclosure is missing");
assert(/config\/supabase\.js[\s\S]*auth\/supabase-auth\.js[\s\S]*auth\/paragon-sync\.js[\s\S]*privacy\.js[\s\S]*archive-hub\.js/.test(html), "Consolidated Hub request script order is incorrect");
assert((html.match(/class="request-built-card /g) || []).length === 3, "Recently built section does not contain exactly three cards");
const requestedBuilds = ["Paragon Vibe", "Paragon Sounds", "Paragon Journal"];
for (const name of requestedBuilds) {
  assert(html.includes(`site=${name.replace(" ", "%20")}`) && html.includes(`<strong>${name}</strong>`), `${name} recently built card or deep link is missing`);
}
assert(requestedBuilds.every((name, index) => index === 0 || html.indexOf(`<strong>${requestedBuilds[index - 1]}</strong>`) < html.indexOf(`<strong>${name}</strong>`)), "Recently built cards are not in the supplied order");
// P-094 — footer Request-a-site routes through the Hub website detail (then=request-site); the in-app popup stays in Account settings.
assert(app.includes("openWebsiteRequest") && shell.includes("then=request-site"), "Account popup or footer detail-first route for Request a Website was lost (P-094)");
assert(serviceWorker.includes('"./paragon-archive-hub.html"') && serviceWorker.includes('"./archive-hub.js"') && !serviceWorker.includes('"./request-website.js"'), "Consolidated Request is missing from the Hub PWA shell");
assert(syncSource.includes("getWebsiteRequestEligibility") && syncSource.includes("need_reason") && syncSource.includes("contact_email") && syncSource.includes("terms_acknowledged"), "Shared request client is missing eligibility or expanded fields");
assert(/enforce_paragon_request_rate_limit/.test(schema) && /pg_advisory_xact_lock/.test(schema) && /interval '7 days'/.test(schema) && /REQUEST_RATE_LIMIT/.test(schema), "Database-backed rolling seven-day request limit is incomplete");
assert(/new\.created_at := now\(\)/.test(schema) && /new\.status := 'submitted'/.test(schema), "Request trigger does not prevent client backdating or moderation-status injection");
assert(/revoke all on table public\.paragon_website_requests from anon/.test(schema), "Anonymous database request insertion is not blocked");
assert(/function public\.paragon_request_count\(\)/.test(schema) && /grant execute on function public\.paragon_request_count\(\) to anon, authenticated/.test(schema), "Privacy-safe live request-count RPC is missing");
assert(schema.includes("'request-receipt:'") && schema.includes("new.created_at + interval '24 hours'") && schema.includes("We got your idea 💡 — Paragon Archive"), "No-email in-app request receipt is missing");
assert(syncSource.includes("getWebsiteRequestCount") && syncSource.includes("paragon_request_count"), "Shared live request-count client is missing");

function createFixture(mode) {
  const session = new Map();
  if (mode === "guest") session.set("paragonArchive.guestSession.v1", "true");
  const elements = new Map();
  const submitted = [];
  const listeners = {};

  function makeElement(id) {
    const handlers = {};
    const attributes = {};
    const value = {
      id,
      value: "",
      checked: false,
      textContent: "",
      innerHTML: "",
      className: "",
      disabled: false,
      addEventListener(type, handler) { handlers[type] = handler; },
      setAttribute(name, content) { attributes[name] = String(content); },
      removeAttribute(name) { delete attributes[name]; },
      focus() {},
      reset() {
        for (const field of ["request-page-name", "request-page-category", "request-page-reason", "request-page-need", "request-page-email"]) elements.get(field).value = "";
        elements.get("request-page-acknowledgement").checked = false;
      },
      _handlers: handlers,
      _attributes: attributes
    };
    elements.set(id, value);
    return value;
  }

  for (const id of [
    "request-page-form", "request-page-name", "request-page-category", "request-page-reason", "request-page-reason-count",
    "request-page-need", "request-page-need-count", "request-page-email", "request-page-acknowledgement",
    "request-page-submit", "request-page-status", "request-identity-status", "request-account-link",
    "request-counter-value", "request-counter-number"
  ]) makeElement(id);

  const isAuthenticated = mode === "authenticated" || mode === "rate-limited";
  const lastSubmittedAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const nextEligibleAt = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();
  const context = {
    console,
    sessionStorage: {
      getItem: key => session.get(key) ?? null,
      setItem: (key, value) => session.set(key, value),
      removeItem: key => session.delete(key)
    },
    ParagonAuth: {
      getSession: async () => isAuthenticated ? { user: { id: "user-1", email: "reader@example.com", user_metadata: {} } } : null
    },
    ParagonSync: {
      getWebsiteRequestCount: async () => 12,
      getWebsiteRequestEligibility: async () => mode === "rate-limited"
        ? { allowed: false, lastSubmittedAt, nextEligibleAt }
        : { allowed: true, lastSubmittedAt: null, nextEligibleAt: null },
      submitWebsiteRequest: async request => { submitted.push(request); return { id: "request-1" }; }
    },
    document: {
      getElementById: id => elements.get(id) || null,
      addEventListener(type, handler) { listeners[type] = handler; }
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, elements, submitted, session };
}

function fillValidForm(fixture) {
  fixture.elements.get("request-page-name").value = "Paragon Garden";
  fixture.elements.get("request-page-category").value = "Health";
  fixture.elements.get("request-page-reason").value = "Plan a home garden with reminders, crop notes, and seasonal guidance.";
  fixture.elements.get("request-page-need").value = "It would help beginners grow food and care for plants confidently.";
  fixture.elements.get("request-page-email").value = "ideas@example.com";
  fixture.elements.get("request-page-acknowledgement").checked = true;
}

async function run() {
  const guest = createFixture("guest");
  await guest.context.ParagonWebsiteRequest.initialize();
  assert(guest.context.ParagonWebsiteRequest.getIdentityMode() === "guest", "Guest request identity was not detected");
  assert(guest.elements.get("request-counter-number").textContent === "12" && guest.elements.get("request-counter-value")._attributes["aria-label"] === "12 website requests", "Live request count did not render from the aggregate client");
  assert((guest.elements.get("request-page-category").innerHTML.match(/<option/g) || []).length === 11, "Request category selector does not contain the supplied 10 categories plus its prompt");
  assert(guest.elements.get("request-page-submit").textContent === "SAVE GUEST DRAFT 💡", "Guest action does not clearly save a draft instead of submitting");
  fillValidForm(guest);
  guest.context.ParagonWebsiteRequest.updateCharacterCounts();
  assert(guest.elements.get("request-page-reason-count").textContent.startsWith("69 / 1000"), "1000-character counter did not update");
  assert(guest.elements.get("request-page-need-count").textContent.startsWith("66 / 500"), "500-character counter did not update");
  const guestResult = await guest.context.ParagonWebsiteRequest.submitRequest({ preventDefault() {} });
  const draft = JSON.parse(guest.session.get("paragonArchive.guestRequestDraft.v1"));
  assert(guestResult.draftSaved && draft.websiteName === "Paragon Garden" && draft.needReason, "Guest request draft was not saved with expanded fields");
  assert(guest.submitted.length === 0, "Guest request was incorrectly submitted to Supabase");

  const authenticated = createFixture("authenticated");
  await authenticated.context.ParagonWebsiteRequest.initialize();
  assert(authenticated.context.ParagonWebsiteRequest.getIdentityMode() === "authenticated", "Authenticated request identity was not detected");
  assert(authenticated.elements.get("request-page-email").value === "reader@example.com", "Authenticated email was not prefilled");
  fillValidForm(authenticated);
  const authResult = await authenticated.context.ParagonWebsiteRequest.submitRequest({ preventDefault() {} });
  assert(authResult.submitted && authenticated.submitted.length === 1, "Authenticated website request did not submit through ParagonSync");
  assert(authenticated.submitted[0].needReason && authenticated.submitted[0].contactEmail && authenticated.submitted[0].termsAcknowledged, "Expanded request fields were not submitted");
  assert(authenticated.elements.get("request-page-status").textContent.includes("Watch your inbox"), "Authenticated submission does not mention the queued confirmation email");
  assert(authenticated.context.ParagonWebsiteRequest.getEligibility().allowed === false, "Successful submission did not activate the local seven-day status");

  const noEmail = createFixture("authenticated");
  await noEmail.context.ParagonWebsiteRequest.initialize();
  fillValidForm(noEmail);
  noEmail.elements.get("request-page-email").value = "";
  const noEmailResult = await noEmail.context.ParagonWebsiteRequest.submitRequest({ preventDefault() {} });
  assert(noEmailResult.submitted && noEmail.elements.get("request-page-status").textContent.includes("Archive notifications"), "No-email request does not direct its receipt to in-app notifications");

  const limited = createFixture("rate-limited");
  await limited.context.ParagonWebsiteRequest.initialize();
  assert(limited.elements.get("request-page-submit").disabled && limited.elements.get("request-page-submit").textContent === "7-DAY LIMIT ACTIVE", "Existing request did not disable another submission");
  fillValidForm(limited);
  const limitedResult = await limited.context.ParagonWebsiteRequest.submitRequest({ preventDefault() {} });
  assert(limitedResult.rateLimited && limited.submitted.length === 0, "Rate-limited account submitted another request");

  const signedOut = createFixture("signed-out");
  await signedOut.context.ParagonWebsiteRequest.initialize();
  fillValidForm(signedOut);
  const signedOutResult = await signedOut.context.ParagonWebsiteRequest.submitRequest({ preventDefault() {} });
  assert(!signedOutResult.submitted && signedOut.submitted.length === 0, "Signed-out request was incorrectly submitted");

  console.log("PASS: expanded request form, character counters, account-only Guest drafts, and database-backed one-per-seven-days submission path");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

})();

/* ================= FIXTURE: search-navigation.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const shell = fs.readFileSync(path.join(root, "paragon-archive.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "style.css"), "utf8");

function makeClassList(initial = []) {
  const values = new Set(initial);
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    contains: name => values.has(name),
    toggle: (name, force) => {
      const enabled = force === undefined ? !values.has(name) : Boolean(force);
      if (enabled) values.add(name);
      else values.delete(name);
      return enabled;
    }
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createFixture() {
  const elements = new Map();
  const local = new Map();
  const session = new Map();
  const context = {
    console,
    alert() {},
    setInterval: () => 1,
    clearInterval() {},
    setTimeout: callback => callback(),
    requestAnimationFrame: callback => callback(),
    innerHeight: 800,
    scrollY: 0,
    localStorage: { getItem: key => local.get(key) ?? null, setItem: (key, value) => local.set(key, value), removeItem: key => local.delete(key) },
    sessionStorage: { getItem: key => session.get(key) ?? null, setItem: (key, value) => session.set(key, value), removeItem: key => session.delete(key) },
    addEventListener() {},
    scrollTo(options) {
      const top = typeof options === "object" ? options.top : arguments[1];
      this.scrollY = Number(top) || 0;
    }
  };
  context.window = context;

  function makeElement(id, initialClasses = []) {
    const attributes = {};
    const element = {
      id,
      style: {},
      dataset: {},
      innerHTML: "",
      textContent: "",
      value: "",
      hidden: false,
      selectionStart: 0,
      selectionEnd: 0,
      scrollTop: 0,
      scrollLeft: 0,
      offsetParent: {},
      classList: makeClassList(initialClasses),
      setAttribute(name, value) { attributes[name] = String(value); },
      getAttribute(name) { return attributes[name]; },
      removeAttribute(name) { delete attributes[name]; },
      addEventListener() {},
      querySelector() { return null; },
      querySelectorAll() { return []; },
      scrollTo(options = {}) { element.scrollTop = Number(options.top || 0); },
      focus() { context.document.activeElement = element; },
      setSelectionRange(start, end) { element.selectionStart = start; element.selectionEnd = end; }
    };
    elements.set(id, element);
    return element;
  }

  const overlay = makeElement("search-overlay");
  const input = makeElement("search-input");
  const results = makeElement("search-results");
  const heading = makeElement("search-results-heading");
  const entryView = makeElement("search-entry-view");
  const resultsView = makeElement("search-results-view");
  const resultsQuery = makeElement("search-results-query");
  const inlineHint = makeElement("search-inline-hint");
  makeElement("search-view-title");
  makeElement("search-back");
  const suggestions = makeElement("search-suggestions");
  const recentSearches = makeElement("recent-searches");
  const recentSearchList = makeElement("recent-search-list");
  makeElement("clear-recent-searches");
  makeElement("search-btn");
  const trendingOverlay = makeElement("trending-overlay");
  const trendingList = makeElement("trending-full-list");
  makeElement("trending-week-label");
  makeElement("trending-summary");
  makeElement("trending-back");
  makeElement("trending-see-all");
  const staffOverlay = makeElement("staff-overlay");
  const staffList = makeElement("staff-full-list");
  makeElement("staff-day-label");
  makeElement("staff-summary");
  makeElement("staff-back");
  makeElement("staff-see-all");
  const recentOverlay = makeElement("recent-overlay");
  const recentList = makeElement("recent-full-list");
  const recentRow = makeElement("recent-row");
  makeElement("recent-back");
  makeElement("recent-see-all");
  makeElement("recent-summary");
  const categoryOverlay = makeElement("category-overlay");
  const categoryContent = makeElement("category-overlay-content");
  const categoryTitle = makeElement("category-overlay-title");
  makeElement("category-overlay-subtitle");
  makeElement("category-summary");
  makeElement("category-back");
  makeElement("category-see-all");
  const detail = makeElement("detail-view");
  const websites = makeElement("tab-websites");
  const updates = makeElement("tab-updates");
  const account = makeElement("tab-account");
  websites.style.display = "block";
  updates.style.display = "none";
  account.style.display = "none";

  const navs = ["websites", "updates", "account"].map((name, index) => {
    const nav = makeElement(`nav-${name}`, index === 0 ? ["nav-tab", "active"] : ["nav-tab"]);
    nav.dataset.tab = name;
    return nav;
  });

  context.document = {
    activeElement: null,
    body: { classList: makeClassList(), style: {} },
    documentElement: { scrollHeight: 4000, style: { setProperty() {} } },
    addEventListener() {},
    getElementById: id => elements.get(id) || null,
    querySelector(selector) {
      if (selector === ".nav-tab.active") return navs.find(nav => nav.classList.contains("active")) || null;
      const match = selector.match(/^\.nav-tab\[data-tab="(.+)"\]$/);
      if (match) return navs.find(nav => nav.dataset.tab === match[1]) || null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".nav-tab") return navs;
      return [];
    }
  };

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "data/sites.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(root, "data/catalogue-expansion.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(root, "data/catalogue-expansion-45-100.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(root, "data/metrics.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(root, "app.js"), "utf8"), context);

  return {
    context,
    elements: {
      overlay, input, results, heading, entryView, resultsView, resultsQuery, inlineHint, suggestions, recentSearches, recentSearchList,
      trendingOverlay, trendingList, staffOverlay, staffList,
      recentOverlay, recentList, recentRow,
      categoryOverlay, categoryContent, categoryTitle,
      detail, websites
    },
    navs,
    run: expression => vm.runInContext(expression, context)
  };
}

assert(/id="search-suggestions"[^>]*role="listbox"/.test(shell), "Custom in-site Search suggestion rail is missing");
assert(!/<datalist|list="site-suggestions"|autocomplete="on"/.test(shell), "Browser-native autocomplete remains enabled");
assert(!/id="search-filter-chips"|id="search-browse-chips"|Browse by Category/.test(shell.slice(shell.indexOf('id="search-overlay"'), shell.indexOf('id="trending-overlay"'))), "Removed Search category filters/browse controls remain");
assert(/id="recent-searches"/.test(shell) && /id="clear-recent-searches"/.test(shell), "Recent-search UI is missing");
assert(/id="search-inline-hint"/.test(shell) && /id="search-results-view"/.test(shell), "Inline hint or dedicated Results mode is missing");
const searchMarkup = shell.slice(shell.indexOf('id="search-overlay"'), shell.indexOf('id="trending-overlay"'));
assert((searchMarkup.match(/id="search-back"/g) || []).length === 1 && !/id="search-close"/.test(searchMarkup), "Search does not have exactly one Back control");
assert(/\.search-suggestions[\s\S]*overflow-x:\s*auto/.test(styles) && /scroll-snap-type:\s*x mandatory/.test(styles), "Search suggestions are not a horizontal swipe rail");

const fixture = createFixture();
const { context, elements, navs, run } = fixture;
const catalogueSize = context.ParagonSites.length;
const creativeCount = context.ParagonSites.filter(site => site.category === "Creative").length;

run('setSearchResultsMode(false)');
assert(elements.entryView.hidden === false && elements.resultsView.hidden === true, "Search did not start in autocomplete/input mode");
let matches = run('getSearchMatches("")');
assert(matches.length === 0, "Empty Search should not return the full catalogue");

matches = run('setSearchCategory("Creative", false); renderSearchResults("color matching")');
assert(matches.some(site => site.name === "Paragon Palette"), "Descriptive Search did not find Paragon Palette after category controls were removed");

run('setSearchCategory("All", false)');
for (const [query, expected] of [
  ["CV", "Paragon Resume"],
  ["homework question", "Paragon Tutor"],
  ["ambient sound", "Paragon Sounds"],
  ["static hosting", "Paragon Deploy"],
  ["accessibility contrast", "Paragon Contrast"]
]) {
  matches = run(`renderSearchResults(${JSON.stringify(query)})`);
  assert(matches.some(site => site.name === expected), `${JSON.stringify(query)} did not find ${expected}`);
}

let suggestions = run('renderSearchSuggestions("")');
assert(suggestions.length === 0 && elements.suggestions.hidden === true && elements.suggestions.innerHTML === "", "Custom autocomplete appears before the first typed character");
suggestions = run('renderSearchSuggestions("p")');
assert(suggestions.length > 0 && suggestions.length <= 10 && elements.suggestions.hidden === false, "Custom autocomplete did not appear after the first character");
assert((elements.suggestions.innerHTML.match(/search-suggestion-card/g) || []).length === suggestions.length, "Custom in-site suggestion cards did not render");
const mixedHint = run('getInlineSearchHint("rEsu")');
assert(mixedHint.toLowerCase() === "resume" && mixedHint.startsWith("rEsu"), "Inline completion hint did not handle mixed case without replacing typed text");
elements.input.value = "rEsu"; elements.input.selectionStart = 4; elements.input.selectionEnd = 4;
run('renderInlineSearchHint(); acceptInlineSearchHint()');
assert(elements.input.value.toLowerCase() === "resume" && elements.inlineHint.innerHTML === "", "Inline hint acceptance failed");
suggestions = run('renderSearchSuggestions("zzzz impossible archive need")');
assert(suggestions.length === 0 && elements.suggestions.hidden === true && elements.suggestions.innerHTML === "", "Autocomplete should disappear silently when there is no match");
elements.input.value = "zzzz impossible archive need";
assert(run('submitSearch()') && elements.resultsView.hidden === false && elements.results.innerHTML.includes("No matching website") && elements.results.innerHTML.includes("paragon-archive-hub.html#request-site"), "Results mode no-match/request guidance is missing");
run('handleSearchBack()');
assert(elements.entryView.hidden === false && elements.resultsView.hidden === true, "Search Back did not return from Results to input mode");
run('recordRecentSearch("homework helper"); recordRecentSearch("budget planner"); document.getElementById("search-input").value = ""; renderRecentSearches()');
assert(elements.recentSearchList.innerHTML.includes("budget planner") && elements.recentSearchList.innerHTML.includes("homework helper") && elements.recentSearches.hidden === false, "Recent searches were not stored and rendered");

context.scrollY = 2400;
const resumeViewsBefore = context.ParagonMetrics.getViewCount("Paragon Resume");
context.openDetail("Paragon Resume");
// P-094 — owner rule: views count ONLY on a successful OPEN (launch), never for viewing a detail page.
assert(context.ParagonMetrics.getViewCount("Paragon Resume") === resumeViewsBefore, "Viewing a detail incorrectly recorded a view (P-094: opens only)");
context.closeDetail();
assert(context.ParagonMetrics.getViewCount("Paragon Resume") === resumeViewsBefore, "Back restoration incorrectly recorded another view");
assert(context.scrollY === 2400, `Detail Back restored scroll ${context.scrollY}, expected 2400`);
assert(elements.websites.style.display === "block", "Detail Back did not restore the Website tab");
assert(navs[0].classList.contains("active"), "Detail Back did not restore the Website navigation state");

context.scrollY = 900;
context.openDetail("Paragon Whiteboard");
context.scrollY = 1300;
context.openDetail("Paragon Design");
context.closeDetail();
assert(elements.detail.innerHTML.includes("<h1>Paragon Whiteboard</h1>"), "Related-site Back did not restore the previous detail");
assert(context.scrollY === 1300, `Related-site Back restored scroll ${context.scrollY}, expected 1300`);
context.closeDetail();
assert(context.scrollY === 900, `Second Back restored scroll ${context.scrollY}, expected 900`);

context.scrollY = 1750;
elements.input.value = "mock exam";
run('setSearchCategory("Education", false)');
elements.overlay.scrollTop = 360;
context.openSearchOverlay(false);
run('submitSearch()');
context.openDetail("Paragon Exam");
context.closeSearchOverlay(false);
context.closeDetail();
assert(elements.overlay.classList.contains("active"), "Search overlay did not reopen after Detail Back");
assert(elements.overlay.getAttribute("aria-hidden") === "false", "Restored Search has incorrect ARIA state");
assert(elements.input.value === "mock exam", "Search query was not restored");
assert(elements.heading.textContent === "Search Results", "Simplified Search results heading was not restored");
assert(elements.results.innerHTML.includes("Paragon Exam"), "Search result set was not restored");
assert(elements.overlay.scrollTop === 360, `Search overlay scroll restored to ${elements.overlay.scrollTop}, expected 360`);
assert(context.scrollY === 1750, `Underlying page scroll restored to ${context.scrollY}, expected 1750`);
context.closeSearchOverlay(false);

context.scrollY = 1120;
elements.trendingOverlay.scrollTop = 480;
context.openTrendingOverlay(false);
assert((elements.trendingList.innerHTML.match(/class="trending-rank-card"/g) || []).length === catalogueSize, "Full Trending list did not render the full ranked catalogue");
context.openDetail("Paragon Invest");
context.closeTrendingOverlay(false);
context.closeDetail();
assert(elements.trendingOverlay.classList.contains("active"), "Trending overlay did not reopen after Detail Back");
assert(elements.trendingOverlay.scrollTop === 480, `Trending overlay scroll restored to ${elements.trendingOverlay.scrollTop}, expected 480`);
assert(context.scrollY === 1120, `Trending underlying page scroll restored to ${context.scrollY}, expected 1120`);
context.closeTrendingOverlay(false);

context.scrollY = 1460;
elements.staffOverlay.scrollTop = 520;
context.openStaffOverlay(false);
assert((elements.staffList.innerHTML.match(/class="trending-rank-card staff-rank-card"/g) || []).length === catalogueSize, "Full Staff Picks list did not render the full ranked catalogue");
context.openDetail("Paragon Journal");
context.closeStaffOverlay(false);
context.closeDetail();
assert(elements.staffOverlay.classList.contains("active"), "Staff Picks overlay did not reopen after Detail Back");
assert(elements.staffOverlay.scrollTop === 520, `Staff Picks overlay scroll restored to ${elements.staffOverlay.scrollTop}, expected 520`);
assert(context.scrollY === 1460, `Staff Picks underlying page scroll restored to ${context.scrollY}, expected 1460`);
context.closeStaffOverlay(false);

const chronologicalNames = run("getSitesByAddedDate().map(site => site.name)");
const expectedChronological = [...context.ParagonSites].sort((first, second) => Date.parse(second.addedAt) - Date.parse(first.addedAt) || Number(second.addedSequence) - Number(first.addedSequence) || first.name.localeCompare(second.name)).map(site => site.name);
assert(JSON.stringify(chronologicalNames) === JSON.stringify(expectedChronological), "Recently Added chronology is not newest-to-oldest after catalogue expansion");
run("renderRecentlyAdded()");
// D-124: Recently Added lists only websites added within the last 7 days (newest first).
// The expectation is computed with the same cutoff rule so this fixture never goes date-stale.
const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
const expectedRecent = expectedChronological.filter(name => {
  const site = context.ParagonSites.find(entry => entry.name === name);
  const added = Date.parse(site?.addedAt || 0);
  return Number.isFinite(added) && added >= recentCutoff;
});
const previewCount = (elements.recentRow.innerHTML.match(/class="card recent-card"/g) || []).length;
assert(previewCount === Math.min(7, expectedRecent.length), `Recent preview rendered ${previewCount} cards, expected ${Math.min(7, expectedRecent.length)} from the last 7 days`);
if (!expectedRecent.length) assert(elements.recentRow.innerHTML.includes("No websites added in the last 7 days"), "Recent preview is missing the honest 7-day empty state");
context.scrollY = 1580;
elements.recentOverlay.scrollTop = 90;
elements.recentList.scrollLeft = 640;
context.openRecentOverlay(false);
const fullRecentCount = (elements.recentList.innerHTML.match(/class="card recent-card"/g) || []).length;
assert(fullRecentCount === expectedRecent.length, `Full Recently Added list rendered ${fullRecentCount} cards, expected ${expectedRecent.length} from the last 7 days`);
if (!expectedRecent.length) assert(elements.recentList.innerHTML.includes("No websites added in the last 7 days"), "Full Recently Added list is missing the honest 7-day empty state");
context.openDetail("Paragon Contrast");
context.closeRecentOverlay(false);
context.closeDetail();
assert(elements.recentOverlay.classList.contains("active"), "Recently Added overlay did not reopen after Detail Back");
assert(elements.recentList.scrollLeft === 640, `Recently Added horizontal position restored to ${elements.recentList.scrollLeft}, expected 640`);
assert(elements.recentOverlay.scrollTop === 90, `Recently Added overlay position restored to ${elements.recentOverlay.scrollTop}, expected 90`);
assert(context.scrollY === 1580, `Recently Added underlying page scroll restored to ${context.scrollY}, expected 1580`);
context.closeRecentOverlay(false);

context.openCategoryOverlay(null, false);
const categoryDefinitionCount = vm.runInContext("categoryDefinitions.length", context);
assert((elements.categoryContent.innerHTML.match(/class=\"category-full-chip\"/g) || []).length === categoryDefinitionCount, "Full category view did not render every category chip");
context.showCategoryInOverlay("Creative");
assert((elements.categoryContent.innerHTML.match(/class="grid-card"/g) || []).length === creativeCount, "Creative category did not render every exact-category website");
elements.categoryOverlay.scrollTop = 310;
context.scrollY = 1710;
context.openDetail("Paragon Palette");
context.closeCategoryOverlay(false);
context.closeDetail();
assert(elements.categoryOverlay.classList.contains("active"), "Category overlay did not reopen after Detail Back");
assert(String(elements.categoryTitle.innerHTML || elements.categoryTitle.textContent).includes("Creative"), "Selected category was not restored");
assert(elements.categoryOverlay.scrollTop === 310, `Category overlay position restored to ${elements.categoryOverlay.scrollTop}, expected 310`);
assert(context.scrollY === 1710, `Category underlying page scroll restored to ${context.scrollY}, expected 1710`);

console.log("PASS: search/category filtering, chronological Recent, autocomplete, view tracking, and all overlay Back contexts");

})();

/* ================= FIXTURE: ui-regression.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
function assert(condition, message) { if (!condition) throw new Error(message); }
function classList(initial = []) {
  const values = new Set(initial);
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    contains: name => values.has(name),
    toggle: (name, force) => {
      const enabled = force === undefined ? !values.has(name) : Boolean(force);
      if (enabled) values.add(name); else values.delete(name);
      return enabled;
    }
  };
}

const html = fs.readFileSync(path.join(root, "paragon-archive.html"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styleSource = fs.readFileSync(path.join(root, "style.css"), "utf8");
const exportFiles = [
  "paragon-archive.html", "paragon-archive-hub.html", "paragon-product-preview.html", "style.css", "app.js", "archive-hub.js", "product-preview.js", "ai/paragon-archive-ai.js", "pwa.js", "privacy.js", "service-worker.js", "vendor/qrcode.min.js", "config/supabase.js",
  "auth/supabase-auth.js", "auth/paragon-sync.js", "data/sites.js", "data/catalogue-expansion.js", "data/catalogue-expansion-45-100.js",
  "data/updates.js", "data/metrics.js", "supabase/schema.sql", "supabase/functions/_shared/email-templates.mjs", "supabase/functions/send-transactional-email/index.ts", "supabase/functions/submit-support-message/index.ts",
  "tests/suite-core.test.js", "tests/suite-ux.test.js", "tests/suite-ai-team.test.js"
];
assert(!fs.existsSync(path.join(root, "index.html")), "Generic index.html still exists");
for (const relativePath of exportFiles) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8").slice(0, 800);
  assert(source.includes("PARAGON ARCHIVE — EXPORT IDENTITY"), `${relativePath} is missing its export identity header`);
  assert(source.includes(`EXPECTED PROJECT PATH: /${relativePath}`), `${relativePath} has the wrong expected path header`);
}
assert(!/onclick="switchTab/.test(html), "Legacy inline tab handler remains");
assert((html.match(/aria-label="Primary sections"/g) || []).length === 1, "Bottom navigation label is missing or duplicated");
assert(/id="account-hero" class="account-hero"/.test(html), "Account hero style hook is missing");
assert(/id="account-private" hidden/.test(html), "Logged-out private account wrapper is missing");
assert(/id="notification-panel"/.test(html), "Notification panel is missing");
assert(/id="theme-toggle-btn"/.test(html) && !/id="profile-btn"/.test(html), "Top Account shortcut was not replaced by the appearance toggle");
assert(/theme-moon-icon[^>]*hidden/.test(html) && /theme-sun-icon[^>]*(?<!hidden)>/.test(html) && appSource.includes("moon.hidden = !light") && appSource.includes("sun.hidden = light"), "Theme icon does not show sun in dark mode and moon in light mode");
assert(!/id="search-filter-chips"|id="search-browse-chips"/.test(html), "Removed Search category controls remain");
assert(/id="review-overlay"/.test(html), "Review composer is missing");
assert(/id="auth-overlay"/.test(html), "Email authentication dialog is missing");
assert(/id="request-overlay"/.test(html), "Request a Website form is missing");
assert(/id="qr-overlay"/.test(html), "QR dialog is missing");
assert(/id="site-preview-overlay"/.test(html), "Iframe preview dialog is missing");
assert(styleSource.includes("@media (min-width: 1200px)") && styleSource.includes("height: 100dvh") && /site-preview-head \.secondary-action \{ display: inline-flex/.test(styleSource), "Laptop/MacBook full iframe or mobile New Tab visibility is missing");
assert(/id="privacy-controls-overlay"/.test(html) && /id="cookie-banner"/.test(html), "Privacy controls or cookie banner is missing");
const hubPage = fs.readFileSync(path.join(root, "paragon-archive-hub.html"), "utf8");
assert(hubPage.includes("Privacy &amp; Security Policy") && hubPage.includes("Tell Us What You Need") && hubPage.includes("We Are Real People") && hubPage.includes("Where It All Started") && hubPage.includes("Terms and Conditions"), "Hub consolidation is missing About/Privacy/Terms/Help/Request content");
for (const removed of ["paragon-privacy-security.html", "paragon-request-website.html", "paragon-help-support.html", "paragon-about.html", "request-website.js", "help-support.js"]) assert(!fs.existsSync(path.join(root, removed)), `${removed} remains after Hub consolidation`);
// P-094 — footer destinations route through the Hub website DETAIL with then=<section>; OPEN lands there.
for (const anchor of ["about", "privacy-policy", "terms", "help", "request-site"]) assert(html.includes(`then=${anchor}`), `Archive footer lost its detail-first Hub destination: ${anchor} (P-094)`);
assert(/id="screenshot-lightbox"/.test(html), "Screenshot lightbox is missing");
assert(/rel="manifest" href="manifest.webmanifest"/.test(html), "PWA manifest link is missing");
assert(fs.existsSync(path.join(root, "service-worker.js")) && fs.existsSync(path.join(root, "assets/icons/paragon-512.png")), "PWA service worker or icon is missing");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
assert(manifest._fileIdentity.expectedProjectPath === "/manifest.webmanifest" && manifest.start_url.includes("paragon-archive.html"), "PWA manifest identity/start URL is incorrect");
assert(!/<button[^>]*>[^<]*Continue with Google/.test(html), "Static HTML should not contain a fake Account login implementation");
assert(/config\/supabase\.js/.test(html) && /auth\/supabase-auth\.js/.test(html) && /auth\/paragon-sync\.js/.test(html), "Supabase auth modules are not loaded");
assert(/id="toast-region"/.test(html), "Toast feedback region is missing");
assert(/data-update-type="announcement"/.test(html), "Announcement filter is missing");
assert(/data-update-type="featured"/.test(html), "Featured filter is missing");
assert(/data\/updates\.js/.test(html), "Curated update data file is not loaded");
assert(/id="updates-category-select"/.test(html) && /id="updates-date-input"/.test(html) && !/id="updates-site-select"/.test(html), "Updates category/date filters did not replace the website filter");
assert(/id="notification-list"/.test(html) && /id="sync-notifications"/.test(html), "Data-driven notification list or refresh action is missing");
assert(/id="achievements-overlay"/.test(html) && /About Achievements/.test(html), "About Achievements dialog is missing");
assert(/vendor\/qrcode\.min\.js[\s\S]*app\.js/.test(html), "Local QR encoder is not loaded before app.js");
assert(!/api\.qrserver\.com|create-qr-code/.test(fs.readFileSync(path.join(root, "config/supabase.js"), "utf8")), "Remote QR service remains configured");
assert(!/alert\(/.test(html), "HTML still contains alert behavior");
assert(!/[←→↗]/.test(html) && !/[←→↗]/.test(appSource), "Decorative textual arrows remain in Archive action labels");
assert(appSource.includes("Open link and QR options") && !/onclick=\\?"shareSite\('/.test(appSource), "Detail still exposes a duplicate Share toolbar action");
assert(appSource.includes("recordShareAchievement") && appSource.includes("firstShareAt"), "Link/QR sharing does not complete the First Share achievement");
assert(appSource.includes("updatePageIndex = 0") && appSource.includes("showMoreUpdates") && appSource.includes("showPreviousUpdates"), "Updates next/previous ten-item pagination is missing");
assert(appSource.includes("reviewPageSize = 10") && appSource.includes("showMoreReviews") && appSource.includes("showPreviousReviews"), "Filtered review pagination is missing");
assert(appSource.includes("guestAwayTimeoutMs = 30 * 60 * 1000") && appSource.includes("mergePersonalStates") && appSource.includes("guestInactiveSince"), "30-minute Guest expiry or authenticated-state transfer is missing");
assert(appSource.includes("storePendingPersonalIntent") && appSource.includes("resumePendingPersonalIntent") && appSource.includes("pendingPersonalIntent.v1"), "Return-to-intent authentication state is missing");
assert(appSource.includes("achievementStage") && appSource.includes("unlockNextAchievementStage") && appSource.includes("Trusted Reviewer"), "Staged achievement groups are incomplete");
assert(/\.detail-about\.collapsed[^}]*line-clamp:\s*3/.test(styleSource), "Detail About is not restricted to three lines");
assert(appSource.includes("detail-list-extra") && appSource.includes("toggleDetailList") && appSource.includes("setupTimelineDisclosures") && /timeline-card \.t-sub[^}]*line-clamp:\s*3/.test(styleSource), "Key Features/Version/Timeline disclosure is incomplete");
assert(appSource.includes("notificationLifetimeMs = 24 * 60 * 60 * 1000") && appSource.includes("adNotificationLifetimeMs = 72 * 60 * 60 * 1000") && appSource.includes("welcome-to-paragon-archive"), "Welcome/update notification lifetime rules are missing");
assert(appSource.includes('["ad", "promotion"]') && appSource.includes("Sponsored notification") && appSource.includes("72-hour limit"), "Future Team-created ad/promotion notification rendering is not prepared");
assert(!/type:\s*["']ad["']/.test(appSource), "A fake advertisement notification was introduced");
assert(styleSource.includes("timelineColorFlow") && styleSource.includes("accentSurfaceFlow") && !/timeline-dot-right[^}]*background:\s*#ec4899/.test(styleSource), "Right timeline marker still uses a static color");
assert(styleSource.includes("@media (min-width: 700px)") && styleSource.includes("max-width: 1600px"), "Shared tablet/desktop page widening is missing");
assert(/\.ach-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3/.test(styleSource), "Achievements are not three columns by two rows");
assert(appSource.includes("visibleFooterHeight + 12") && appSource.includes("window.innerWidth < 700"), "Large-screen bottom navigation does not shift above the footer");

const storage = new Map();
const session = new Map();
const elements = new Map();
const listeners = {};
let scrollCalls = 0;

const context = {
  console,
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
  sessionStorage: { getItem: key => session.get(key) ?? null, setItem: (key, value) => session.set(key, value), removeItem: key => session.delete(key) },
  history: { replaceState() {} },
  location: { href: "https://example.test/archive/", origin: "https://example.test", pathname: "/archive/", search: "", hash: "", assign() {} },
  navigator: {},
  URL,
  URLSearchParams,
  structuredClone: global.structuredClone,
  fetch: async () => { throw new Error("Unexpected fetch in UI fixture"); },
  setInterval: () => 1,
  clearInterval() {},
  setTimeout: callback => { callback(); return 1; },
  clearTimeout() {},
  requestAnimationFrame: callback => callback(),
  innerHeight: 800,
  scrollY: 0,
  addEventListener(type, handler) { listeners[`window:${type}`] = handler; },
  scrollTo(options) { scrollCalls += 1; this.scrollY = Number(options?.top || 0); },
  open() {},
  matchMedia: () => ({ matches: true })
};
context.window = context;

function element(id, initial = []) {
  const attributes = {};
  const handlers = {};
  const value = {
    id,
    hidden: false,
    innerHTML: "",
    textContent: "",
    value: "",
    checked: false,
    options: [],
    style: {},
    dataset: {},
    tabIndex: 0,
    classList: classList(initial),
    children: [],
    offsetParent: {},
    scrollTop: 0,
    scrollLeft: 0,
    setAttribute(name, val) { attributes[name] = String(val); },
    getAttribute(name) { return attributes[name]; },
    removeAttribute(name) { delete attributes[name]; },
    addEventListener(type, handler) { handlers[type] = handler; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    appendChild(child) { value.children.push(child); },
    focus() { context.document.activeElement = value; },
    scrollTo(options = {}) { value.scrollTop = Number(options.top || 0); },
    reset() {},
    _handlers: handlers
  };
  elements.set(id, value);
  return value;
}

[
  "account-hero", "account-private", "stats-row", "progress-row", "ach-row", "saved-row", "collections-row", "visited-row", "reviews-row", "settings-row",
  "updates-timeline", "updates-filter-summary", "updates-category-select", "updates-date-input", "update-filter-chips", "updates-pagination", "updates-previous", "updates-view-more", "updates-pagination-status", "toast-region",
  "notification-list", "notifications-btn", "sync-notifications", "mark-notifications-read", "notification-panel",
  "reviews-list", "review-pagination", "review-previous", "review-view-more", "review-pagination-status",
  "collection-overlay", "collection-form", "collection-close", "collection-cancel", "collection-name", "collection-description", "collection-icon",
  "collection-view-overlay", "collection-view-title", "collection-view-content", "collection-view-close",
  "request-overlay", "request-form", "request-close", "request-cancel", "request-name", "request-url", "request-category", "request-reason", "request-status",
  "qr-overlay", "qr-title", "qr-image", "qr-url", "qr-close", "qr-copy", "qr-share",
  "site-preview-overlay", "site-preview-title", "site-preview-frame", "site-preview-message", "site-preview-close", "site-preview-new-tab",
  "screenshot-lightbox", "lightbox-image", "lightbox-caption", "lightbox-dots", "lightbox-close", "lightbox-prev", "lightbox-next",
  "tab-websites", "tab-updates", "tab-account", "detail-view", "back-to-top", "footer", "bottom-nav"
].forEach(id => element(id));
elements.get("tab-websites").style.display = "block";
elements.get("tab-updates").style.display = "none";
elements.get("tab-account").style.display = "none";
elements.get("collection-icon").value = "📁";
const navs = ["websites", "updates", "account"].map((name, index) => {
  const nav = element(`nav-${name}`, index === 0 ? ["nav-tab", "active"] : ["nav-tab"]);
  nav.dataset.tab = name;
  return nav;
});
const updateTypes = ["all", "new", "updated", "maintenance", "announcement", "featured"];
const updateChips = updateTypes.map((type, index) => {
  const chip = element(`update-chip-${type}`, index === 0 ? ["active"] : []);
  chip.dataset.updateType = type;
  chip.setAttribute("aria-pressed", index === 0 ? "true" : "false");
  return chip;
});
elements.get("update-filter-chips").querySelectorAll = selector => selector === "[data-update-type]" ? updateChips : [];

context.document = {
  activeElement: null,
  body: { classList: classList(), style: {} },
  documentElement: { classList: classList(), scrollHeight: 3000, style: { setProperty() {} } },
  addEventListener(type, handler) { listeners[`document:${type}`] = handler; },
  createElement() { return { className: "", textContent: "", remove() {} }; },
  getElementById: id => elements.get(id) || null,
  querySelector(selector) {
    if (selector === ".nav-tab.active") return navs.find(nav => nav.classList.contains("active")) || null;
    const match = selector.match(/^\.nav-tab\[data-tab="(.+)"\]$/);
    return match ? navs.find(nav => nav.dataset.tab === match[1]) || null : null;
  },
  querySelectorAll(selector) {
    if (selector === ".nav-tab") return navs;
    return [];
  }
};

vm.createContext(context);
for (const file of ["config/supabase.js", "auth/supabase-auth.js", "auth/paragon-sync.js", "data/sites.js", "data/catalogue-expansion.js", "data/catalogue-expansion-45-100.js", "data/updates.js", "data/metrics.js", "pwa.js", "privacy.js", "vendor/qrcode.min.js", "app.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
}

assert(context.ParagonExpansionNames.length === 44, "Catalogue expansion does not contain all 44 supplied names");
for (const name of context.ParagonExpansionNames) {
  const matches = context.ParagonSites.filter(site => site.name === name);
  assert(matches.length === 1, `${name} is missing or duplicated`);
  assert(matches[0].about && matches[0].features?.length && matches[0].updates?.length, `${name} has an incomplete detail record`);
}
assert(context.ParagonExpansion45100Names.length === 57, "Catalogue continuation does not contain all 57 supplied names");
for (const name of context.ParagonExpansion45100Names) {
  const matches = context.ParagonSites.filter(site => site.name === name);
  assert(matches.length === 1, `${name} is missing or duplicated in continuation`);
  assert(matches[0].about && matches[0].features?.length && matches[0].updates?.length, `${name} has an incomplete continuation detail record`);
}
const mergedGuestState = context.mergePersonalStates(
  { bookmarks: ["Paragon Notes"], reviews: {}, reviewVotes: {}, visits: [], progress: { account: { value: 1 } }, preferences: {}, collections: [{ id: "study", name: "Study", items: ["Paragon Notes"] }], profile: { username: "member" }, notifications: [{ id: "existing" }] },
  { bookmarks: ["Paragon Resume"], reviews: { "Paragon Resume": { text: "Guest review" } }, reviewVotes: { vote: 1 }, visits: [{ name: "Paragon Resume", visitedAt: "2026-08-05T10:00:00Z" }], progress: { guest: { value: 2 } }, preferences: { theme: "light" }, collections: [{ id: "study", name: "Study", items: ["Paragon Resume"] }], profile: { username: "guest" }, notifications: [] }
);
assert(mergedGuestState.bookmarks.includes("Paragon Notes") && mergedGuestState.bookmarks.includes("Paragon Resume") && mergedGuestState.collections[0].items.length === 2, "Live Guest bookmarks/collections do not merge into account state");
assert(mergedGuestState.reviews["Paragon Resume"] && mergedGuestState.progress.account && mergedGuestState.progress.guest && mergedGuestState.profile.username === "member", "Guest review/progress merge damaged account profile state");
vm.runInContext("identityLoading = false; loggedIn = false; guestMode = false", context);
context.renderAccount();
assert(elements.get("account-private").hidden === true, "Private account content is visible while logged out");
assert(elements.get("account-hero").innerHTML.includes("One account for every Paragon experience"), "Logged-out authentication hero did not render");
assert(!elements.get("account-hero").innerHTML.includes("demo"), "Public Account UI still exposes demo-account wording");
context.guestLogin();
assert(elements.get("account-private").hidden === false, "Private account content did not appear after Guest start");
assert(session.get("paragonArchive.guestSession.v1") === "true", "Guest session flag was not stored in sessionStorage");
assert(elements.get("account-hero").innerHTML.includes("Guest session"), "Guest identity is not clearly labeled");
assert(elements.get("stats-row").innerHTML.includes("Saved Websites"), "Dynamic account stats did not render");
assert((elements.get("ach-row").innerHTML.match(/class="ach-item/g) || []).length === 6 && elements.get("ach-row").innerHTML.includes("More Soon"), "Account does not render all six prerequisite-aware achievements");
context.logout();
assert(elements.get("account-private").hidden === true, "Private account content remained visible after logout");
assert(elements.get("stats-row").innerHTML === "", "Stale account stats remained after logout");
assert(!session.has("paragonArchive.guestSession.v1") && !session.has("paragonArchive.guestState.v1"), "Ending Guest did not clear temporary session data");
context.switchToTab("websites", { scroll: false });
context.openDetail("Paragon Notes");
vm.runInContext('requirePersonalSession("write a review", { type: "review", siteName: "Paragon Notes" })', context);
assert(session.has("paragonArchive.pendingPersonalIntent.v1") && elements.get("tab-account").style.display === "block", "Signed-out personal action did not preserve return intent and open Account");
context.guestLogin();
assert(elements.get("detail-view").innerHTML.includes("<h1>Paragon Notes</h1>") && !session.has("paragonArchive.pendingPersonalIntent.v1"), "Guest activation did not return to the prior website detail");
context.logout();
vm.runInContext('loggedIn = true; guestMode = false; authUser = { id: "creator", email: "paragon.archive.2026@gmail.com", created_at: "2026-08-04T00:00:00Z", app_metadata: { provider: "email" }, user_metadata: { display_name: "Creator" } }; accountProfile = { registeredAt: authUser.created_at }; renderAccount()', context);
assert(elements.get("account-hero").innerHTML.includes("Creator Demo"), "Configured creator email was not labeled as Creator Demo");
assert(elements.get("account-hero").innerHTML.includes("Member since August 4, 2026"), "Registration date badge did not use the account creation date");
vm.runInContext('inAppNotifications = []; accountProfile = {}; synchronizeNotificationFeed()', context);
assert(elements.get("notification-list").innerHTML.includes("Welcome to Paragon Archive") && vm.runInContext('Boolean(accountProfile.notificationCutoffAt)', context), "First authenticated notification is not the welcome/cutoff state");
const notificationLifetimes = vm.runInContext('(() => { const createdAt = "2026-08-05T00:00:00Z"; return [new Date(normalizedNotification({ type: "update", createdAt }).expiresAt) - new Date(createdAt), new Date(normalizedNotification({ type: "ad", createdAt }).expiresAt) - new Date(createdAt)]; })()', context);
assert(notificationLifetimes[0] === 24 * 60 * 60 * 1000 && notificationLifetimes[1] === 72 * 60 * 60 * 1000, "Notification 24/72-hour expiry rules are incorrect");
vm.runInContext('inAppNotifications = [{ id: "expired", createdAt: "2026-08-01T00:00:00Z", expiresAt: "2026-08-01T01:00:00Z" }, { id: "current", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() }]', context);
assert(vm.runInContext('activeNotifications().length', context) === 1, "Expired notifications were not wiped from the active feed");
vm.runInContext('loggedIn = false; guestMode = true; accountProfile = {}; inAppNotifications = [{ id: "welcome", type: "welcome", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now()+3600000).toISOString() }, { id: "update", type: "update", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now()+3600000).toISOString() }]; publicNotifications.push({ id: "team-ad-1", type: "ad", title: "Sponsored", message: "Team campaign", icon: "✦", createdAt: new Date().toISOString() }); renderNotificationList()', context);
assert(elements.get("notification-list").innerHTML.includes("Sponsored notification") && !elements.get("notification-list").innerHTML.includes("Welcome to Paragon") && !elements.get("notification-list").innerHTML.includes("Archive activity"), "Guest notification feed did not restrict itself to Team ad/promotion records");
vm.runInContext('loggedIn = false; guestMode = false; authUser = null; clearPersonalState(); renderAccount(); renderNotificationList()', context);

const lightInput = { checked: false };
context.toggleDark(lightInput);
assert(context.document.documentElement.classList.contains("light"), "Light theme class was not applied");
assert(storage.get("paragonArchive.theme.v2") === "light", "Theme preference was not persisted");

context.guestLogin();
context.toggleBookmark("Paragon Resume");
assert(vm.runInContext('bookmarkedSites.has("Paragon Resume")', context), "Guest bookmark was not stored in current state");
assert(JSON.parse(session.get("paragonArchive.guestState.v1")).bookmarks.includes("Paragon Resume"), "Guest bookmark was not written to sessionStorage");
assert(!storage.has("paragonArchive.bookmarks.v1"), "Guest bookmark leaked into persistent localStorage");
assert(elements.get("saved-row").innerHTML.includes("Paragon Resume"), "Saved account view did not update");
assert(elements.get("collections-row").innerHTML.includes("No collections yet") && !elements.get("collections-row").innerHTML.includes("My Study Tools"), "Collections must start honestly EMPTY (P-076 — no made-up starter collections)");
context.bindCollectionComposer();
elements.get("collection-name").value = "Design Inspiration";
elements.get("collection-description").value = "Visual references";
elements.get("collection-form")._handlers.submit({ preventDefault() {} });
assert(elements.get("collections-row").innerHTML.includes("Design Inspiration"), "Create New Collection did not add a collection");
assert(JSON.parse(session.get("paragonArchive.guestState.v1")).collections.some(collection => collection.name === "Design Inspiration"), "Guest collection was not stored in session state");
const createdCollectionId = vm.runInContext('userCollections.find(collection => collection.name === "Design Inspiration").id', context);
context.openCollectionPicker("Paragon Notes");
context.addSiteToCollection(createdCollectionId, "Paragon Notes");
assert(JSON.parse(session.get("paragonArchive.guestState.v1")).collections.find(collection => collection.id === createdCollectionId).items.includes("Paragon Notes"), "Website was not added to the Guest collection");
// P-076 — no starter collections exist anymore; create a SECOND real user collection for the exclusive-move check.
context.openCollectionComposer();
elements.get("collection-name").value = "Second Shelf";
elements.get("collection-description").value = "Move target";
elements.get("collection-form")._handlers.submit({ preventDefault() {} });
const starterCollectionId = vm.runInContext('userCollections.find(collection => collection.name === "Second Shelf").id', context);
context.addSiteToCollection(starterCollectionId, "Paragon Notes");
const exclusiveCollections = JSON.parse(session.get("paragonArchive.guestState.v1")).collections.filter(collection => collection.items.includes("Paragon Notes"));
assert(exclusiveCollections.length === 1 && exclusiveCollections[0].id === starterCollectionId, "A website remained in more than one collection after moving");
context.bindWebsiteRequest();
elements.get("request-name").value = "Example Tool";
elements.get("request-url").value = "https://example.com";
elements.get("request-category").value = "Tools";
elements.get("request-reason").value = "This tool would help the community.";
elements.get("request-form")._handlers.submit({ preventDefault() {} });
assert(JSON.parse(session.get("paragonArchive.guestRequestDraft.v1")).websiteName === "Example Tool", "Guest website request draft was not saved to sessionStorage");
context.openWebsiteQR("Paragon Notes");
assert(elements.get("qr-image").src.startsWith("data:image/gif;base64,") && elements.get("qr-url").textContent.includes("paragon-archive.html?site=Paragon"), "Local per-site QR/deep link was not generated");
const exactDetailLink = vm.runInContext('websiteDetailUrl({ name: "Paragon Notes", siteUrl: "https://external.example/product" })', context);
assert(exactDetailLink.includes("paragon-archive.html?site=Paragon+Notes") && !exactDetailLink.includes("external.example"), "Share/QR URL does not always target the exact Archive detail");
context.logout();
assert(!session.has("paragonArchive.guestState.v1") && !session.has("paragonArchive.guestRequestDraft.v1"), "Ending Guest did not clear temporary collections/request draft");
context.guestLogin();

context.renderUpdates();
assert(elements.get("updates-timeline").innerHTML.includes("timeline-entry"), "Updates timeline did not render generated events");
assert((elements.get("updates-timeline").innerHTML.match(/timeline-entry/g) || []).length === 10 && elements.get("updates-pagination").hidden === false, "Updates did not start with exactly ten visible entries");
const firstUpdatePage = elements.get("updates-timeline").innerHTML;
context.showMoreUpdates();
const secondUpdatePage = elements.get("updates-timeline").innerHTML;
assert((secondUpdatePage.match(/timeline-entry/g) || []).length === 10 && secondUpdatePage !== firstUpdatePage && elements.get("updates-previous").hidden === false, "View more did not replace the first ten with the next ten");
context.showPreviousUpdates();
assert(elements.get("updates-timeline").innerHTML === firstUpdatePage, "Previous did not restore the prior ten updates");
vm.runInContext('updatePageIndex = 0; renderUpdates()', context);
const renderedTypes = vm.runInContext('[...new Set(buildUpdateEvents().map(event => event.type))]', context);
// P-092 — maintenance/featured are honestly EMPTY until something real happens to a real site.
for (const type of ["new", "updated", "announcement"]) {
  assert(renderedTypes.includes(type), `Update data is missing the ${type} entry type`);
  context.setUpdateTypeFilter(type);
  const timelineHTML = elements.get("updates-timeline").innerHTML;
  assert(timelineHTML.includes(`data-update-type="${type}"`), `${type} filter did not render its matching entry`);
  assert(!updateTypes.filter(other => !["all", type].includes(other)).some(other => timelineHTML.includes(`data-update-type="${other}"`)), `${type} filter leaked another entry type`);
  const activeButtons = updateChips.filter(chip => chip.classList.contains("active") && chip.getAttribute("aria-pressed") === "true");
  assert(activeButtons.length === 1 && activeButtons[0].dataset.updateType === type, `${type} filter left stale active chips`);
}
context.setUpdateTypeFilter("all");
assert(updateChips.filter(chip => chip.classList.contains("active")).length === 1, "All filter did not become the only active chip");
assert((elements.get("updates-timeline").innerHTML.match(/timeline-dot-right/g) || []).length > 0, "Mirrored right timeline dots are missing");
// P-092 TRUTH PURGE: no maintenance events exist (no site was ever really maintained) — the
// intersection test now uses a REAL announcement, and maintenance must honestly be empty.
assert(vm.runInContext('buildUpdateEvents().filter(event => event.type === "maintenance").length', context) === 0, "Fake maintenance events returned — only real events are allowed (P-092)");
const exactUpdateMatches = vm.runInContext('activeUpdateType = "announcement"; activeUpdateCategory = "all"; activeUpdateDate = localDateKey(buildUpdateEvents().find(event => event.type === "announcement").date); renderUpdates()', context);
assert(exactUpdateMatches.length >= 1 && elements.get("updates-pagination").hidden === true, "Type/date intersection or conditional View more state is incorrect");
vm.runInContext('activeUpdateDate = "2099-01-01"; renderUpdates()', context);
assert(elements.get("updates-timeline").innerHTML.includes("No matching updates"), "Updates date filter lacks an honest empty state");
vm.runInContext('activeUpdateDate = ""; activeUpdateCategory = "all"; setUpdateTypeFilter("all")', context);
context.toggleBookmark("Paragon Notes");
vm.runInContext('activeUpdateCategory = "Tools"; activeUpdateDate = localDateKey(buildUpdateEvents().find(event => event.type === "new" && event.siteName === "Paragon Notes").date); setUpdateTypeFilter("new")', context); // P-092 — star test pinned to Notes' REAL added-event (maintenance is honestly empty)
assert(!elements.get("updates-timeline").innerHTML.includes("saved-update-star"), "Guest incorrectly received an authenticated saved-site star");
vm.runInContext('guestMode = false; loggedIn = true; authUser = { id: "user-1", email: "user@example.com", app_metadata: { provider: "email" }, user_metadata: {} }; renderUpdates()', context);
assert(elements.get("updates-timeline").innerHTML.includes("saved-update-star"), "Authenticated saved-site update did not show its star");
vm.runInContext('loggedIn = false; authUser = null; renderUpdates()', context);
assert(!elements.get("updates-timeline").innerHTML.includes("saved-update-star"), "Saved-site star remained visible after authenticated sign-out");
vm.runInContext('activeUpdateCategory = "all"; activeUpdateDate = ""; setUpdateTypeFilter("all")', context);

scrollCalls = 0;
context.switchToTab("updates");
assert(scrollCalls === 1, `One tab transition caused ${scrollCalls} scroll calls`);
assert(elements.get("tab-updates").style.display === "block", "Updates tab did not become visible");
assert(navs[1].getAttribute("aria-selected") === "true", "Selected tab ARIA state was not updated");

context.switchToTab("websites", { scroll: false });
context.guestLogin();
context.voteReview("Paragon Notes:archive:0:Sarah T.", "up");
assert(JSON.parse(session.get("paragonArchive.guestState.v1")).reviewVotes["Paragon Notes:archive:0:Sarah T."] === 1, "Guest review vote was not saved in session state");
// P-076 — inherited sample reviews are retired: write a REAL user review so the detail renders real review UI.
vm.runInContext('localReviews["Paragon Notes"] = [{ id: "local-test-1", name: "You", date: new Date().toISOString(), stars: 4, text: "Real review written during the regression run" }]; persistPersonalState();', context);
context.openDetail("Paragon Notes");
assert(elements.get("detail-view").innerHTML.includes("site-launch-progress"), "Detail launch progress ring is missing");
assert((elements.get("detail-view").innerHTML.match(/class="stat-item/g) || []).length === 3, "Detail statistics are not three equal items");
assert(elements.get("detail-view").innerHTML.includes("decimal-star"), "Decimal star rendering is missing");
assert(elements.get("detail-view").innerHTML.includes("data-counter-target"), "Animated statistic targets are missing");
assert(elements.get("detail-view").innerHTML.includes("onclick=\"scrollToReviews()\""), "Reviews statistic is not actionable");
assert(elements.get("detail-view").innerHTML.includes("id=\"reviews-section\""), "Reviews section anchor is missing");
assert(elements.get("detail-view").innerHTML.includes("openCollectionPicker") && elements.get("detail-view").innerHTML.includes("openWebsiteQR") && elements.get("detail-view").innerHTML.includes("🔗"), "Collection or Link & QR detail action is missing");
assert(!elements.get("detail-view").innerHTML.includes("onclick=\"shareSite"), "Duplicate direct Share toolbar action remains");
assert(elements.get("detail-view").innerHTML.includes("rating-breakdown") && elements.get("detail-view").innerHTML.includes("version-history-list"), "Rating breakdown or version history is missing");
assert(elements.get("detail-view").innerHTML.includes("feature-grid") && elements.get("detail-view").innerHTML.includes("Markdown support"), "Supplied key features are missing from the detail");
assert(elements.get("detail-view").innerHTML.includes("review-vote-row"), "Review upvote/downvote controls are missing");
assert(elements.get("detail-view").innerHTML.includes("rating-summary-layout") && elements.get("detail-view").innerHTML.includes("rating-bar-fill"), "Rating summary or animated breakdown bars are missing");
assert(elements.get("detail-view").innerHTML.includes("id=\"review-sort\"") && elements.get("detail-view").innerHTML.includes("Most Helpful") && elements.get("detail-view").innerHTML.includes("id=\"review-star-filter\""), "Review sort/star filters are missing");
assert(elements.get("detail-view").innerHTML.includes("review-avatar") && elements.get("detail-view").innerHTML.includes("Helpful") && elements.get("detail-view").innerHTML.includes("Not helpful"), "Review card identity/helpfulness details are missing");
assert(elements.get("detail-view").innerHTML.includes("launchSite"), "Iframe launch action is missing");
assert((elements.get("detail-view").innerHTML.match(/class="shot"/g) || []).length === 5, "Detail did not render five horizontal screenshot states");
assert(elements.get("detail-view").innerHTML.includes("about-section") && elements.get("detail-view").innerHTML.includes("detail-tag-chips"), "Tagged About section is missing");
context.openScreenshotLightbox("Paragon Notes", 1);
assert(elements.get("screenshot-lightbox").classList.contains("active"), "Screenshot lightbox did not open");
assert(elements.get("lightbox-caption").textContent.includes("2 of 5"), "Lightbox position caption is incorrect");
assert((elements.get("lightbox-dots").innerHTML.match(/lightbox-dot/g) || []).length === 5, "Lightbox dots do not match screenshot count");
context.setScreenshotLightboxIndex(2);
assert(elements.get("lightbox-caption").textContent.includes("3 of 5"), "Lightbox next-position rendering failed");
context.closeScreenshotLightbox(false);
assert(!elements.get("screenshot-lightbox").classList.contains("active"), "Screenshot lightbox did not close");
// P-076 — every displayed review is now user-written, so its own Edit/Delete actions MUST be present.
assert(elements.get("detail-view").innerHTML.includes("review-actions"), "User-written review is missing its Edit/Delete actions");
vm.runInContext('localReviews["Paragon Notes"] = { name: "You", stars: 5, text: "<script>unsafe</script>", date: new Date().toISOString() }', context);
vm.runInContext('isRestoringDetailState = true; openDetail("Paragon Notes"); isRestoringDetailState = false;', context);
assert(elements.get("detail-view").innerHTML.includes("Your review"), "Local review was not merged into detail reviews");
assert(!elements.get("detail-view").innerHTML.includes("<script>unsafe</script>"), "Local review text was not escaped");
assert((elements.get("detail-view").innerHTML.match(/review-actions/g) || []).length === 1, "Review ownership actions are incorrect");
const lowestOnly = vm.runInContext('reviewSortMode = "lowest"; reviewStarFilter = "5"; reviewCardsMarkup(sites.find(site => site.name === "Paragon Notes"))', context);
assert(lowestOnly.includes("review-avatar") && lowestOnly.includes("Helpful") && lowestOnly.includes("Not helpful"), "Filtered review cards lost required fields");
// P-076 — pagination is exercised with USER-written reviews (the only kind displayed now).
vm.runInContext('localReviews["Paragon Notes"] = Array.from({ length: 12 }, (_, index) => ({ id: `local-page-${index + 1}`, name: `Reviewer ${index + 1}`, stars: index % 5 + 1, text: `Review ${index + 1}`, date: `2026-08-${String(index + 1).padStart(2, "0")}T12:00:00Z` })); currentDetailName = "Paragon Notes"; reviewSortMode = "recent"; reviewStarFilter = "all"; reviewPageIndex = 0; renderReviewCards()', context);
assert((elements.get("reviews-list").innerHTML.match(/class="review-card"/g) || []).length === 10 && elements.get("reviews-list").innerHTML.includes("Reviewer 12") && elements.get("review-pagination").hidden === false, "Latest review page did not show the newest ten reviews");
context.showMoreReviews();
assert((elements.get("reviews-list").innerHTML.match(/class="review-card"/g) || []).length === 2 && elements.get("reviews-list").innerHTML.includes("Reviewer 1") && elements.get("review-previous").hidden === false, "Eleventh/twelfth reviews did not move to the second review page");
const filteredFiveStar = vm.runInContext('reviewPageIndex = 0; reviewSortMode = "highest"; reviewStarFilter = "5"; renderReviewCards()', context);
assert(filteredFiveStar.every(model => Number(model.review.stars) === 5) && elements.get("review-pagination").hidden === true, "Review star/sort filters did not apply before pagination");
vm.runInContext('loggedIn = true; guestMode = false; authUser = { email: "member@example.com", app_metadata: { provider: "email" }, user_metadata: {} }; localVisits = [{ name: "Paragon Notes", visitedAt: new Date().toISOString() }]; localReviews = { "Paragon Notes": { text: "Done", stars: 5 } }; sharedProgress = {}; accountProfile = { firstShareAt: new Date().toISOString(), shareCount: 1, achievementStage: 1 }; renderAchievementsAccount()', context);
assert(elements.get("ach-row").innerHTML.includes('class="ach-item ready"') && elements.get("ach-row").innerHTML.includes("First Rating") && elements.get("ach-row").innerHTML.includes("First Share") && elements.get("ach-row").innerHTML.includes("Google or Email"), "First five achievements did not unlock More Soon without Progress Starter");
context.unlockNextAchievementStage();
assert(elements.get("ach-row").innerHTML.includes("Stage 2 of 6") && elements.get("ach-row").innerHTML.includes("Progress Starter") && vm.runInContext('accountProfile.achievementStage', context) === 2, "Stage two did not unlock with Progress Starter as its first task");

console.log("PASS: navigation, account cleanup, theme persistence, all update filters, mirrored markers, saved stars, bookmarks, and review ownership/escaping");

})();


/* ================= FIXTURE: suite-ux — P-094 systems (announcements desk, one-AI search, opens-only views, PWA powers, AdSense dormant, footer detail-first) ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
function assert(condition, message) { if (!condition) throw new Error(message); }

const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const archiveHtml = fs.readFileSync(path.join(root, "paragon-archive.html"), "utf8");
const teamPages = fs.readFileSync(path.join(root, "team/team-pages.js"), "utf8");
const annHtml = fs.readFileSync(path.join(root, "team/desk.html"), "utf8"); // P-097: merged desk
const hubHtml = fs.readFileSync(path.join(root, "paragon-archive-hub.html"), "utf8");
const hubJs = fs.readFileSync(path.join(root, "archive-hub.js"), "utf8");
const pwa = fs.readFileSync(path.join(root, "pwa.js"), "utf8");
const ads = fs.readFileSync(path.join(root, "ads/adsense.js"), "utf8");
const adsTxt = fs.readFileSync(path.join(root, "ads.txt"), "utf8");
const preview = fs.readFileSync(path.join(root, "product-preview.js"), "utf8");
const css = fs.readFileSync(path.join(root, "style.css"), "utf8");
const sql = fs.readFileSync(path.join(root, "supabase/announcements-schema.sql"), "utf8");

/* Managed announcements system (D-174) */
const updatesSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data/updates.js"), "utf8"), updatesSandbox);
const updatesData = updatesSandbox.window.ParagonCuratedUpdates;
assert(Array.isArray(updatesData) && updatesData.length === 0, "Static curated list should be retired — announcements are managed from the Team desk (P-094)");
for (const id of ["announcement-2026-08-18-backend-live", "announcement-2026-08-18-community-board", "announcement-2026-08-18-developer-portal", "announcement-2026-08-04-catalogue-expansion"]) {
  assert(app.includes(`"${id}"`) && teamPages.includes(`"${id}"`) && sql.includes(`'${id}'`), `Real announcement ${id} is not consistently seeded across app, team desk, and SQL`);
}
assert(app.includes("announcementIsLive") && app.includes("record.scheduledFor") , "Scheduled announcements do not go live automatically at their time (P-094)");
assert(teamPages.includes("function ensureSeed") && teamPages.includes("readImageFile") && teamPages.includes("function isDue"), "Announcement desk lost seed/image-upload/schedule powers (P-094)");
assert(annHtml.includes('id="ann-link-row"') && annHtml.includes("ann-image-remove") && annHtml.includes("ann-preview-btn"), "Announcement composer lost the link row, real image picker, or preview (P-094)");
assert(teamPages.includes('currentType() === "special" ? null') && teamPages.includes('hidden = type !== "special"'), "Special announcements must need only title+message with special-only link (P-094)");
assert(app.includes("openUpdateImageViewer") && app.includes("timeline-link-pill") && app.includes("imageIsUpload"), "Public feed lost the full-size image viewer or the LINK pill (P-094)");
assert(css.includes(".update-image-viewer") && css.includes(".welcome-splash-veil"), "P-094 visual system is incomplete");
// P-096 — the merged pill was REVERTED per owner order: original bar + percent line restored, restyled.
assert(css.includes(".construction-bar-wrap") && css.includes(".construction-percent") && !css.includes(".construction-pill {"), "Construction stage must use the restored bar + percentage layout (P-096)");

/* ONE search AI (owner complaint: two AI blocks) */
assert((app.match(/ai-suggest-block/g) || []).length === 1, "There must be exactly ONE Paragon AI suggestion block in search (P-094)");
assert(!app.includes("Similar websites based on your idea") && !app.includes("ensure: 3"), "The old padded second AI block must stay dead (P-094)");

/* Views count on successful OPEN only; OPEN needs a guest-or-login session */
assert(!app.includes("siteMetrics?.recordView(name);"), "Detail view still records views — opens only (P-094)");
assert(app.includes("siteMetrics?.recordView(site.name);"), "A completed launch should record exactly one view (P-094)");
assert(app.includes('requirePersonalSession("open websites")'), "OPEN lost its guest-or-login gate (P-094)");

/* Splash v4: preload-first + replay on every login */
// P-096 — the preload gate was REMOVED (owner bug: late pop-in); the splash shows instantly with the veil.
assert(app.includes("welcome-splash-veil") && app.includes("welcome-splash-tagline"), "Splash legibility layer is missing (P-094)");
assert(app.includes('window.sessionStorage.removeItem("paragonArchive.welcomeSplash.v1")'), "Login no longer replays the welcome splash (P-094)");

/* Logged-in editable display name + guest merge stays real */
assert(app.includes("accountProfile.displayName || authUser?.user_metadata?.display_name") && app.includes("saveProfileName"), "Editable saved display name is missing (P-094)");
assert(app.includes("mergePersonalStates(accountState, guestStateToMerge)"), "Guest-to-account merge regressed (P-094)");

/* Hub: Home tab gone, back-button behavior, fuzzy search */
assert(!hubHtml.includes("hub-top-nav"), "Hub Home tab navigation must be fully removed (P-094)");
assert(hubJs.includes("backButton.hidden = page === \"home\"") && hubJs.includes("window.paragonHubCurrentView"), "Hub Back button lost its legal-pages behavior (P-094/P-096)");
assert(hubJs.includes("hubEditDistance") && hubJs.includes("hubSearchScore"), "Hub search lost typo tolerance (P-094)");
assert(hubHtml.includes('href="#landing-join"') && hubHtml.includes('id="landing-join"'), "Join quick card must scroll to the in-home join section (P-094)");

/* Footer routes detail-first with pending destination */
assert(archiveHtml.includes("resolveLaunchUrl") || app.includes("resolveLaunchUrl"), "Detail-first footer lost its pending-destination resolver (P-094)");
for (const anchor of ["about", "privacy-policy", "terms", "help", "request-site"]) assert(archiveHtml.includes(`then=${anchor}`), `Footer ${anchor} must route through the Hub detail (P-094)`);

/* PWA-only app mode (D-177) + real-app powers */
assert(!fs.existsSync(path.join(root, "native/TWA-BUILD-KIT.md")) && fs.existsSync(path.join(root, "native/PWA-APP-MODE.md")), "TWA kit must be replaced by the PWA app-mode guide (D-172/D-177)");
assert(pwa.includes("enableNotifications") && pwa.includes("sendTestNotification") && pwa.includes("shareParagon"), "PWA lost notification/share powers (P-094)");
assert(app.includes("enableParagonNotifications") && app.includes("shareParagonApp"), "App settings lost the notification/share rows (P-094)");
assert(hubHtml.includes("Play Store packaging cancelled"), "Roadmap still claims a Play Store plan (P-094 PWA-only decision)");

/* AdSense: dormant, honest, free-to-apply track (D-179) */
assert(ads.includes('ADSENSE_PUBLISHER_ID = ""') && ads.includes("reserved"), "AdSense controller must stay dormant and honest until approval (P-009/D-179)");
assert(adsTxt.includes("PUB-ID-PLACEHOLDER") && fs.existsSync(path.join(root, "docs/ADSENSE-SETUP.md")), "ads.txt template or setup doc is missing (D-179)");
assert(archiveHtml.includes('data-paragon-ad="websitesList"') && archiveHtml.includes("ads/adsense.js"), "Reserved ad slots/controller are not wired (P-094)");

/* Construction pill: percentage merged into the bar as one complete pill */
assert(preview.includes("construction-bar-wrap") && preview.includes("readTeamConstruction") && preview.includes("construction-team-note"), "Construction page lost its original layout or team link (P-096)");
// P-096 — owner REVERTED the merged pill: the original bar + percent layout is the truth again.
assert(css.includes(".construction-percent {") && !css.includes(".construction-pill {"), "The merged construction pill must stay dead; the original percent layout is restored (P-096)");

/* Icons #70–79 wired everywhere */
for (const name of ["invoice", "crypto", "stocks", "shop", "invest", "receipt", "recipe", "fit", "sleep", "mental"]) {
  assert(fs.existsSync(path.join(root, `assets/site-icons/paragon-${name}.png`)), `Site icon paragon-${name}.png missing`);
  assert(app.includes(`assets/site-icons/paragon-${name}.png`), `Site icon paragon-${name} not wired into SITE_ICON_ART`);
}

/* Quiz logo leads to its Archive website detail + board-style bar */
for (const page of ["index", "explore", "create", "play", "results"]) {
  const quizHtml = fs.readFileSync(path.join(root, `paragon-quiz/${page}.html`), "utf8");
  assert(quizHtml.includes('href="../paragon-archive.html?site=Paragon%20Quiz"'), `Quiz ${page}: logo must open the Paragon Quiz detail (P-094)`);
}

console.log("PASS: P-094 — managed announcements desk + backend SQL, one-AI search, opens-only views + guest/login gate, splash v4, editable profile name, hub back-button + fuzzy search, detail-first footer, PWA-only app powers, dormant AdSense, construction pill, 10 new icons, quiz detail links");
})();


/* ================= FIXTURE: P-096 — boot/hub/splash bug fixes, intent-trained AI, team A-Z control, phone push, 100/100 icons ================= */
(function () {
const fs2 = require("fs");
const path2 = require("path");
const root2 = path2.resolve(__dirname, "..");
function assert2(condition, message) { if (!condition) throw new Error(message); }
const read = p => fs2.readFileSync(path2.join(root2, p), "utf8");
const app = read("app.js");
const hubJs = read("archive-hub.js");
const ai = read("ai/paragon-archive-ai.js");
const pwa = read("pwa.js");
const sw = read("service-worker.js");
const preview = read("product-preview.js");
const teamPages = read("team/team-pages.js");
const navJs = read("team/nav.js");
const hubHtml = read("paragon-archive-hub.html");
const annHtml = read("team/desk.html");
const websitesHtml = read("team/desk.html");
const css = read("style.css");

/* Boot-killer fixes */
assert2(!/^\s*if \(!byId\("hub-top-nav"\)\) return;/m.test(hubJs), "The hub module still dies when the Home nav is absent (P-096 killer bug)");
assert2(hubJs.includes('window.paragonHubCurrentView'), "Hub view state must be shared, not cross-scope referenced (P-096)");
assert2(hubJs.includes('if (!byId("hub-page-home")) return;'), "Hub init guard must test the pages container (P-096)");

/* Splash: instant + unconditional 5 s + original ring position */
{ const domIdx = app.indexOf('document.addEventListener("DOMContentLoaded", () => {');
  assert2(domIdx !== -1 && app.indexOf("showWelcomeSplash(); // P-096", domIdx) < app.indexOf("renderHero();", domIdx), "Splash must fire FIRST at DOMContentLoaded (P-096)"); }
assert2(app.includes("const HOLD_MS = 5000;"), "Splash must hold 5 s unconditionally (P-096 reduced-motion bug)");
assert2(css.includes("#welcome-splash .welcome-splash-loader { position: absolute; top: 14px; right: 14px;"), "Splash ring must sit at its original top-right position (P-096)");
assert2(!app.includes("preloader.onload"), "The splash preload gate (late pop-in) must stay removed (P-096)");

/* AI intent routing: owner-trained suggest/never rules */
assert2(ai.includes("const INTENT_ROUTES = [") && ai.includes("applyIntentRouting(clean, ranked)"), "Intent routing layer missing (P-096)");
assert2(ai.includes("neverAlways"), "Hard-never tier missing (medical/booking/generation boundaries)");
assert2(ai.includes('site: "Paragon Recipe"') && ai.includes('site: "Paragon Files"') && ai.includes('site: "Paragon Shop"') && ai.includes('site: "Paragon Travel"') && ai.includes('site: "Paragon Photo"') && ai.includes('site: "Paragon Draw"'), "Core intent routes missing (P-096)");

/* Team A-Z feed control */
assert2(app.includes("paragonTeamUpdateOverrides.v1"), "Public feed ignores Team overrides (P-096)");
assert2(teamPages.includes("buildPublicFeed") && teamPages.includes('data-feedact="hide"'), "Team public-feed manager missing (P-096)");
assert2(annHtml.includes("PUBLIC FEED — EVERYTHING A TO Z") || annHtml.includes("PUBLIC FEED"), "Feed section missing from the desk (P-096)");

/* Construction desk owns build percentages */
assert2(teamPages.includes('var CONSTRUCTION_KEY = "paragonTeamConstruction.v1"') && teamPages.includes("renderConstruction"), "Team construction desk missing (P-096)");
assert2(preview.includes('var TEAM_CONSTRUCTION_KEY = "paragonTeamConstruction.v1"'), "Construction page not linked to the team store (P-096)");

/* Roadmap made from the team side */
assert2(teamPages.includes('var MILESTONE_KEY = "paragonTeamRoadmapMilestones.v1"'), "Team milestone editor missing (P-096)");
assert2(hubJs.includes("applyTeamMilestoneChecklists"), "Hub does not render team milestone truths (P-096)");

/* Phone notifications (real push client) */
assert2(sw.includes('addEventListener("push"') && sw.includes('addEventListener("notificationclick"'), "Service worker push handlers missing (P-096)");
assert2(pwa.includes("connectPhonePush") && pwa.includes("pushPublicKey"), "Push subscription client missing (P-096)");
assert2(app.includes("connectPhonePush"), "Settings rows do not use the phone-push path (P-096)");

/* Guest hero v2 */
assert2(app.includes("guest-hero-v2") && app.includes("guest-hint-quiet") && !app.includes('class="guest-warning"'), "Guest hero v2 missing or old warning text returned (P-096)");

/* Footer auto-continue */
assert2(app.includes("continueToPendingDestination") && css.includes(".destination-continue-banner"), "Footer detail-first auto-continue missing (P-096)");

/* Icon chips on trending/staff/recent + 100/100 set */
assert2(app.includes("function siteIconChip"), "Icon chips helper missing (P-096)");
assert2(css.includes(".thumb-icon-chip"), "Icon chip styling missing (P-096)");
for (const icon of ["habits","travel","weather","wardrobe","journal","tutor","quotes","countdown","devtools","speed","domain","seo","deploy","contrast","markdown","snippets","random","timecapsule","vibe","alive"]) {
  assert2(fs2.existsSync(path2.join(root2, `assets/site-icons/paragon-${icon}.png`)), `paragon-${icon}.png missing (100/100 set)`);
  assert2(app.includes(`assets/site-icons/paragon-${icon}.png`), `paragon-${icon} not wired (100/100 set)`);
}
// P-097 — the owner cancelled the take-away export (websites are built HERE now); the quiz stays in-project.
assert2(fs2.existsSync(path2.join(root2, "paragon-quiz/index.html")), "In-project Paragon Quiz must stay (P-097 build-here decision)");
assert2(navJs.includes("ParagonTeamPrompt"), "Dialog-law prompt helper missing (P-096)");
assert2(sw.includes("paragon-archive-v80"), "Cache must be v73 (P-096)");
console.log("PASS: P-096 — hub killer-guard fix, cross-scope fix, instant 5 s splash at original position, intent-trained AI, team A-to-Z feed control, construction desk, roadmap milestones, phone push client, guest hero v2, footer auto-continue, icon chips, 100/100 icons, quiz export");
})();

/* ================= FIXTURE: P-097 — consolidated desk, maintenance lockdowns, preview WM, install popup, auto theme, badges, review honesty ================= */
(function () {
const fs3 = require("fs");
const path3 = require("path");
const root3 = path3.resolve(__dirname, "..");
function assert3(condition, message) { if (!condition) throw new Error(message); }
const read3 = p => fs3.readFileSync(path3.join(root3, p), "utf8");
const app = read3("app.js");
const css = read3("style.css");
const desk = read3("team/desk.html");
const nav = read3("team/nav.js");
const perms = read3("team/permissions.js");
const teamPages = read3("team/team-pages.js");
const pwa = read3("pwa.js");
const sw = read3("service-worker.js");

/* Consolidated desk (28 files -> 1) */
assert3((desk.match(/data-team-page="/g) || []).length >= 30, "desk.html must carry every merged desk panel (P-097)");
assert3(fs3.existsSync(path3.join(root3, "team/login.html")) && !fs3.existsSync(path3.join(root3, "team/overview.html")), "Team folder must be desk.html + login.html only (P-097)");
assert3(teamPages.includes('new URLSearchParams(window.location.search).get("page")'), "paragonTeamPage() must read the desk ?page= route (P-097)");
assert3(desk.includes('pageAllowed(page, role)'), "Desk router must enforce the role law (P-097)");
assert3(nav.includes('desk.html?page=construction'), "Sidebar must expose the Construction Desk (P-097)");
assert3(perms.includes('"construction.html"') && perms.includes("paragon:role-change"), "Permissions must register construction + broadcast role changes (P-097)");
assert3(nav.includes("paragon:role-change") && teamPages.includes("paragon:role-change"), "Role sync must be two-way: sidebar AND dashboard (P-097)");
assert3(nav.includes("Public Updates feed") && nav.includes("Community Board") && nav.includes("Developer Portal"), "Desk sidebar must link its public surfaces (P-097)");

/* Maintenance system */
assert3(app.includes("applyPlatformMaintenanceLockdown") && app.includes("teamSiteOverrideStatus"), "Archive maintenance lockdown + per-site under-review law missing (P-097)");
for (const file of ["archive-hub.js", "product-preview.js", "community-board.js", "developer-portal.js"]) assert3(read3(file).includes("applyPlatformMaintenanceLockdown"), file + " missing the whole-platform maintenance guard (P-097)");
assert3(teamPages.includes("con-mark") && teamPages.includes("con-retire"), "Websites rows lost the under-construction actions (P-097)");
assert3(teamPages.includes("the website now shows MAINTENANCE to users"), "Under Review must speak maintenance truth (P-097)");

/* Preview window manager */
assert3(app.includes("const previewWindows = [];") && app.includes("function openPreviewWindow") && app.includes("preview-wm-taskbar"), "Preview window manager missing (P-097)");
assert3(css.includes(".preview-wm-window.is-pip") && css.includes(".preview-wm-controls"), "Preview WM styling missing (P-097)");
assert3(!/→|←|↗/.test(app), "No textual arrows in app.js (law)");

/* Install popup + permissions + share-install */
assert3(app.includes("window.openParagonInstall") && app.includes("install-perm-notifications") && app.includes("install-perm-camera"), "Install/permissions popup missing (P-097)");
assert3(app.includes('get("install") === "1"') && pwa.includes("setShareOverride"), "Share-to-install deep link missing (P-097)");

/* Auto day/night theme */
assert3(app.includes("autoThemeForNow") && app.includes("paragonArchive.themeMode.v2") && app.includes("manual beats auto"), "Auto day/night theme missing (P-097)");

/* Achievement badges (first 10) */
for (const badge of ["first-visit", "first-rating", "first-review", "first-share", "account", "progress-starter", "first-save", "collection-keeper", "helpful-voice", "explorer-five"]) {
  assert3(fs3.existsSync(path3.join(root3, `assets/achievement-badges/badge-${badge}.png`)), `badge-${badge}.png missing (10/30 this turn)`);
}
assert3(app.includes("const BADGE_ART = {") && app.includes("badgeIconMarkup"), "Badge art is not wired into achievements (P-097)");

/* Icon-facaded cards */
assert3(app.includes("function cardFace") && css.includes(".thumb-icon-face"), "Trending/staff/recent cards must wear the icon as the face (P-097)");

/* Review honesty everywhere */
assert3(app.includes("function realReviewCount") && app.includes("paragonArchive.reviewMirror.v1"), "Real review counts missing in the Archive (P-097)");
assert3(read3("archive-hub.js").includes("paragonArchive.reviewMirror.v1"), "Hub stats not using real review counts (P-097)");
assert3(read3("paragon-archive-hub.html").includes("Real user-written reviews"), "Hub review stat label not honest (P-097)");

/* Profile editor popup at the header top-right */
assert3(app.includes("profile-header-tools") && app.includes("profile-name-editor-popup"), "Profile editor must be a popup from the header Edit button (P-097)");

/* Waste sweep */
assert3(!fs3.existsSync(path3.join(root3, "supabase/community-schema.sql")), "community-schema.sql must stay removed (executed live 2026-08-18)");
assert3(!fs3.existsSync(path3.join(root3, "exports")), "exports/ take-away cancelled by owner (P-097 build-here decision)");
assert3(read3("supabase/schema.sql").includes("EXECUTED LIVE"), "schema.sql must be labelled the executed archive reference (P-097)");
assert3(sw.includes("paragon-archive-v80"), "Cache must be v74 (P-097)");
console.log("PASS: P-097 — consolidated 30-panel desk with role law + two-way role sync, maintenance lockdowns (platform + per-site), preview window manager, install/permissions popup + share-install, auto day/night, 10 achievement badges, icon-facaded cards, honest review counts, profile editor popup, waste swept");
})();

/* ================= FIXTURE: P-099 — first in-project product wave (/sites/*) ================= */
(function () {
const fs4 = require("fs");
const path4 = require("path");
const root4 = path4.resolve(__dirname, "..");
function assert4(condition, message) { if (!condition) throw new Error(message); }
const read4 = p => fs4.readFileSync(path4.join(root4, p), "utf8");
const sw = read4("service-worker.js");
const app = read4("app.js");
const kitCss = read4("sites/_shared/site-kit.css");
const kitJs = read4("sites/_shared/site-kit.js");

const SITES = [
  ["invoice-generator", "Paragon Invoice", "paragonInvoiceGenerator.v1"],
  ["resume-maker", "Paragon Resume", "paragonResumeMaker.v1"],
  ["recipe-creator", "Paragon Recipe", "paragonRecipeCreator.v1"],
  ["flashcard-generator", "Paragon Flash", "paragonFlashcardGenerator.v1"],
  ["file-converter", "Paragon Files", "paragonFileConverter.v1"],
  ["travel-assistant", "Paragon Travel", "paragonTravelAssistant.v1"],
  ["meal-planner", "Paragon Meal", "paragonMealPlanner.v1"],
  ["photo-editor", "Paragon Photo", "paragonPhotoEditor.v1"],
  ["personal-shopper", "Paragon Shopper", "paragonPersonalShopper.v1"]
];

assert4(kitCss.includes(".brand-link") && kitCss.includes("--accent:"), "Shared site-kit.css missing brand tokens (P-099)");
assert4(kitJs.includes("ParagonSiteKit") && kitJs.includes("storageGet") && !/alert\s*\(|confirm\s*\(|prompt\s*\(/.test(kitJs), "site-kit.js must expose storage helpers without alert/confirm/prompt (P-099)");

for (const [slug, archiveName, storageKey] of SITES) {
  const dir = path4.join(root4, "sites", slug);
  assert4(fs4.existsSync(path4.join(dir, "index.html")), `${slug}/index.html missing`);
  assert4(fs4.existsSync(path4.join(dir, "app.js")), `${slug}/app.js missing`);
  assert4(fs4.existsSync(path4.join(dir, "SPEC.md")), `${slug}/SPEC.md missing`);
  const index = read4(`sites/${slug}/index.html`);
  const js = read4(`sites/${slug}/app.js`);
  assert4(index.includes("PARAGON ARCHIVE — EXPORT IDENTITY"), `${slug} index missing identity header`);
  assert4(index.includes("../_shared/site-kit.css") && index.includes("../_shared/site-kit.js"), `${slug} must load shared kit`);
  assert4(index.includes("paragon-archive.html?site="), `${slug} logo/Archive link missing`);
  assert4(index.includes("floating-card") && index.includes("Example only"), `${slug} home must carry unclickable example section`);
  assert4(js.includes(storageKey), `${slug} must use storage key ${storageKey}`);
  assert4(!/\balert\s*\(|\bconfirm\s*\(|\bprompt\s*\(/.test(js + index), `${slug} must not use alert/confirm/prompt`);
}

// Catalogue wiring for the 8 archive records (meal planner pairs with Recipe)
const exp = read4("data/catalogue-expansion.js") + read4("data/catalogue-expansion-45-100.js");
for (const url of [
  "sites/file-converter/index.html",
  "sites/resume-maker/index.html",
  "sites/photo-editor/index.html",
  "sites/flashcard-generator/index.html",
  "sites/invoice-generator/index.html",
  "sites/personal-shopper/index.html",
  "sites/recipe-creator/index.html",
  "sites/travel-assistant/index.html"
]) {
  assert4(exp.includes(url), `Catalogue missing siteUrl ${url}`);
}
assert4(app.includes("Paragon Invoice") && app.includes("Paragon Resume") && app.includes("REALLY_UPDATED"), "REALLY_UPDATED must list newly shipped products (P-099)");
assert4(sw.includes("paragon-archive-v80"), "Cache must be v76 (P-099)");
console.log("PASS: P-099 — nine in-project product sites under /sites/, shared kit, catalogue siteUrls, honest local engines, cache v77");
})();

/* ================= FIXTURE: P-100 — coins SQL + withdrawals + product depth ================= */
(function () {
const fs5 = require("fs");
const path5 = require("path");
const root5 = path5.resolve(__dirname, "..");
function assert5(c, m) { if (!c) throw new Error(m); }
const read5 = p => fs5.readFileSync(path5.join(root5, p), "utf8");
assert5(fs5.existsSync(path5.join(root5, "supabase/coins-schema.sql")), "coins-schema.sql missing");
assert5(fs5.existsSync(path5.join(root5, "supabase/SQL-RUN-PACK.md")), "SQL-RUN-PACK.md missing");
const coinsSql = read5("supabase/coins-schema.sql");
assert5(coinsSql.includes("paragon_coin_wallets") && coinsSql.includes("paragon_coin_approve_purchase") && coinsSql.includes("paragon_coin_complete_withdrawal"), "coins SQL incomplete");
const app = read5("app.js");
assert5(app.includes("requestCoinWithdrawal") && app.includes("paragonArchive.coinDebits.v1") && app.includes("paragonTeamCoinWithdrawals.v1"), "withdrawal front-end missing");
assert5(read5("team/desk.html").includes("coin-withdrawals-list"), "team withdrawals panel missing");
assert5(read5("team/team-pages.js").includes("bindCoinWithdrawals"), "team withdrawals binder missing");
assert5(read5("sites/recipe-creator/app.js").includes("SUB_MAP"), "recipe substitutions missing");
assert5(read5("sites/flashcard-generator/app.js").includes("exportAnki") || read5("sites/flashcard-generator/app.html").includes("exportAnki"), "flash Anki export missing");
assert5(read5("sites/invoice-generator/app.js").includes("exportCsv") || read5("sites/invoice-generator/app.js").includes("Export CSV"), "invoice CSV missing");
assert5(read5("service-worker.js").includes("paragon-archive-v80"), "cache must be v77");
console.log("PASS: P-100 — coins SQL pack, withdrawals desk, product depth upgrades, cache v77");
})();

/* ================= FIXTURE: P-101 — skills from GitHub uploads + coins master phase1 + maintenance ================= */
(function () {
const fs6 = require("fs");
const path6 = require("path");
const root6 = path6.resolve(__dirname, "..");
function a6(c, m) { if (!c) throw new Error(m); }
const r6 = p => fs6.readFileSync(path6.join(root6, p), "utf8");
a6(fs6.existsSync(path6.join(root6, "uploads/Recipe-Creator.md")), "uploads/ skills missing — pull from main");
a6(fs6.existsSync(path6.join(root6, "docs/skills/PARAGON-COINS-MASTER-BUILD-SPEC.md")) || fs6.existsSync(path6.join(root6, "PARAGON-COINS-MASTER-BUILD-SPEC.md")), "coins master missing");
a6(fs6.existsSync(path6.join(root6, "supabase/coins-master-phase1.sql")), "coins-master-phase1.sql missing");
a6(fs6.existsSync(path6.join(root6, "supabase/OWNER-SQL-CHECKLIST.md")), "OWNER-SQL-CHECKLIST.md missing");
const masterSql = r6("supabase/coins-master-phase1.sql");
a6(masterSql.includes("paragon_coin_accounts") && masterSql.includes("real_money_enabled") && masterSql.includes("paragon_economic_settings"), "master phase1 incomplete");
const app = r6("app.js");
a6(app.includes("naira_per_coin_purchase") || app.includes("nairaPerCoinBuy"), "coin purchase rate config missing");
a6(app.includes("naira: 500") && app.includes("coins: 500"), "coin packs must be 1:1");
a6(app.includes("Real-money mode is") || app.includes("realMoney"), "honest real-money mode copy required");
a6(app.includes("announcement-2026-09-03-product-wave"), "product-wave announcement seed missing");
a6(r6("service-worker.js").includes("paragon-archive-v80"), "cache must be v80");
a6(r6("sites/flashcard-generator/app.js").includes("easeFactor"), "flash SM-2 fields missing");
console.log("PASS: P-101 — GitHub uploads skills ingested, coins master phase1 SQL, 1:1 rates, real-money OFF honesty, cache v78");
})();

/* ================= FIXTURE: P-102 — complete partial products + coins master phase2 ================= */
(function () {
const fs7 = require("fs");
const path7 = require("path");
const root7 = path7.resolve(__dirname, "..");
function a7(c, m) { if (!c) throw new Error(m); }
const r7 = p => fs7.readFileSync(path7.join(root7, p), "utf8");
a7(fs7.existsSync(path7.join(root7, "supabase/coins-master-phase2.sql")), "phase2 SQL missing");
const p2 = r7("supabase/coins-master-phase2.sql");
a7(p2.includes("paragon_coin_post_entry") && p2.includes("paragon_coin_create_payment_intent") && p2.includes("paragon_coin_request_withdrawal") && p2.includes("WITHDRAWAL_LOCK"), "phase2 RPCs incomplete");
const kit = r7("sites/_shared/site-kit.js");
a7(kit.includes("parseCSV") && kit.includes("buildDocx") && kit.includes("buildZip"), "site-kit converters missing");
a7(r7("sites/file-converter/app.js").includes("csvToObjects") || r7("sites/file-converter/app.js").includes("runData") || r7("sites/file-converter/app.html").includes("CSV"), "files data convert missing");
a7(r7("sites/resume-maker/app.js").includes("downloadDocx") && r7("sites/resume-maker/app.js").includes("parseLinkedInish"), "resume DOCX/import missing");
a7(r7("sites/photo-editor/app.js").includes("applyCrop") && r7("sites/photo-editor/app.js").includes("textOverlay"), "photo crop/text missing");
a7(r7("sites/flashcard-generator/app.js").includes("cloze") || r7("sites/flashcard-generator/app.html").includes("cloze"), "flash cloze missing");
a7(r7("sites/invoice-generator/app.js").includes("discountPct") || r7("sites/invoice-generator/app.html").includes("invDiscount"), "invoice discount missing");
a7(r7("sites/personal-shopper/app.js").includes("priceB") || r7("sites/personal-shopper/app.html").includes("itemPriceB"), "shop dual price missing");
a7(r7("sites/travel-assistant/app.js").includes("genDays") || r7("sites/travel-assistant/app.html").includes("genDays"), "travel day draft missing");
a7(r7("sites/meal-planner/app.html").includes("macroCal"), "meal macros missing");
a7(r7("sites/recipe-creator/app.js").includes("nutritionEstimate") || r7("sites/recipe-creator/app.js").includes("estNutrition"), "recipe nutrition missing");
const app = r7("app.js");
a7(app.includes("paragon_coin_create_payment_intent") && app.includes("paragon_coin_request_withdrawal"), "FE coin RPCs missing");
a7(app.includes("isRegisteredMember") && app.includes("Guests are free-play only"), "guest coin gate missing");
a7(r7("service-worker.js").includes("paragon-archive-v80"), "cache must be v80");
console.log("PASS: P-102 — product skill depth complete + coins master phase2 authority RPCs + FE gates, cache v79");
})();

/* ================= FIXTURE: P-103 — coins phase3 + SQL health probe ================= */
(function () {
const fs8 = require("fs");
const path8 = require("path");
const root8 = path8.resolve(__dirname, "..");
function a8(c, m) { if (!c) throw new Error(m); }
const r8 = p => fs8.readFileSync(path8.join(root8, p), "utf8");
a8(fs8.existsSync(path8.join(root8, "supabase/coins-master-phase3.sql")), "phase3 SQL missing");
const p3 = r8("supabase/coins-master-phase3.sql");
a8(p3.includes("paragon_payment_matches") && p3.includes("paragon_payment_webhook_inbox") && p3.includes("paragon_sql_health"), "phase3 incomplete");
a8(fs8.existsSync(path8.join(root8, "supabase/functions/coin-payment-webhook/index.ts")), "webhook edge missing");
a8(fs8.existsSync(path8.join(root8, "supabase/functions/coin-reconcile/index.ts")), "reconcile edge missing");
a8(fs8.existsSync(path8.join(root8, "supabase/functions/COINS-PHASE3-DEPLOY.md")), "phase3 deploy doc missing");
const wh = r8("supabase/functions/coin-payment-webhook/index.ts");
a8(wh.includes("PARAGON_COIN_WEBHOOK_SECRET") && wh.includes("paystack") && wh.includes("paragon_coin_ingest_payment_event"), "webhook weak");
a8(r8("team/desk.html").includes("probe-sql-health") && r8("team/team-pages.js").includes("paragon_sql_health"), "team SQL probe missing");
a8(r8("service-worker.js").includes("paragon-archive-v80"), "cache must be v80");
a8(r8("supabase/SQL-RUN-PACK.md").includes("coins-master-phase3"), "sql pack missing phase3");
console.log("PASS: P-103 — coins phase3 provider webhook/reconcile + Team SQL health probe, cache v80");
})();
