/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: suite-core.test.js
  EXPECTED PROJECT PATH: /tests/suite-core.test.js
  ROLE: Consolidated regression suite (P-089 file-count reduction) — contains the former fixtures about.test.js, archive-hub.test.js, auth.test.js, catalogue-governance.test.js, email.test.js unchanged, each in its own scope.
  RESTORE/LOAD NOTE: Run from the project root with node tests/suite-core.test.js. All original checks preserved.
*/

/* ================= FIXTURE: about.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "paragon-archive-hub.html"), "utf8");
const aboutHTML = html.slice(html.indexOf('id="about"'), html.indexOf('id="privacy-policy"'));
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const archive = fs.readFileSync(path.join(root, "paragon-archive.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

function assert(condition, message) { if (!condition) throw new Error(message); }

for (const phrase of [
  "ABOUT PARAGON",
  "Built with purpose.",
  "Driven by passion.",
  "Free for everyone.",
  "Where It All Started",
  "On August 1, 2026 one idea changed everything.",
  "The answer became Paragon Archive.",
  "One home. No stress. No storage problems. No cost.",
  "Why We Exist",
  "Not free with a catch.",
  "One account.",
  "One archive.",
  "What Paragon Means",
  "Paragon means a perfect example.",
  "Exceptional tools. Exceptional access. Exceptional ease.",
  "Where We Are Going",
  "PARAGON TIMELINE",
  "August 2026",
  "The idea is born.",
  "Paragon Archive launches.",
  "The first 100 websites go live inside the archive.",
  "The Future",
  "What We Stand For",
  "Free and Accessible Above All",
  "Quality Over Quantity",
  "Built for Real People",
  "Honest and Open",
  "Community Driven",
  "From Paragon, To You",
  "My name is Paragon.",
  "Paragon Archive is that something.",
  "We are just getting started. Stay with us.",
  "Founder, Paragon Archive",
  "Founder photo",
  "The People Behind the Archive",
  "Get In Touch",
  "paragon.archive.2026@gmail.com",
  "We read everything. We respond to everything. Give us up to 72 hours.",
  "More Paragon products are coming soon.",
  "The Web, Reimagined — Every Website You Need, One Archive.",
  "© 2026 Paragon. Built free. For everyone."
]) assert(aboutHTML.includes(phrase), `About page is missing supplied content: ${phrase}`);

assert((aboutHTML.match(/class="about-section/g) || []).length >= 8, "About page does not contain all major sections");
assert((aboutHTML.match(/<article><span class="about-roadmap-dot"/g) || []).length === 4, "Paragon timeline does not contain four milestones");
assert((aboutHTML.match(/<article><span aria-hidden="true">/g) || []).length === 5, "Values section does not contain all five values");
assert(aboutHTML.includes('role="img" aria-label="Founder photo placeholder"'), "Accessible founder photo placeholder is missing");
for (const subject of ["Support", "Privacy", "Bug", "Partnership", "Press", "Other"]) assert(aboutHTML.includes(`subject=${subject}`), `About contact subject is missing: ${subject}`);
assert(aboutHTML.includes("how to request its removal") && !aboutHTML.includes("exactly how to get it removed"), "About privacy value falsely guarantees a completed deletion path");
// P-076 — owner removed the About row from Account settings (About lives in the footer + Hub).
assert(!app.includes(`<div class="row"><a class="settings-link" href="paragon-archive-hub.html#about"`), "Removed About settings row has returned against owner order P-076");
// P-094 — footer About routes through the Hub website DETAIL first, OPEN lands on #about (owner order).
assert(archive.includes('then=about'), "Archive footer does not route About through the Hub website detail (P-094)");
assert(serviceWorker.includes('"./paragon-archive-hub.html"') && !serviceWorker.includes('"./paragon-about.html"'), "Consolidated About is not using the Hub PWA shell");
assert(!/src="[^"]*founder/i.test(aboutHTML), "About page pretends a final founder image exists instead of using the supplied placeholder");

console.log("PASS: About story, mission, meaning, roadmap, values, founder placeholder/message, team, contact subjects, honesty, navigation, and PWA shell");

})();

/* ================= FIXTURE: archive-hub.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "paragon-archive-hub.html"), "utf8");
const source = fs.readFileSync(path.join(root, "archive-hub.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "style.css"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const shell = fs.readFileSync(path.join(root, "paragon-archive.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

function assert(condition, message) { if (!condition) throw new Error(message); }

for (const id of ["overview", "terms", "community-guidelines", "cookie-policy", "developers", "deployed", "roadmap", "system-status", "membership", "categories", "team-gateway", "completion"]) {
  assert(html.includes(`id="${id}"`), `Archive Hub section is missing: ${id}`);
}
for (const phrase of [
  "Terms and Conditions", "Effective: August 1, 2026", "Last Updated: August 5, 2026",
  "Acceptable Use", "Prohibited Conduct", "Reviews and Future Community Content", "Intellectual Property", "Enforcement and Penalties",
  "Community Guidelines", "Be Respectful", "Be Constructive", "Protect Privacy", "Report, Do Not Retaliate",
  "Cookie Policy", "Essential Storage", "Analytics Cookies", "Tracking &amp; Advertising",
  "Developer Requirements &amp; Acceptance", "Trial Project", "Developer Responsibilities", "Developer Removal",
  "The Deployed Category", "Deployed Subcategories", "Premium Rules", "Deploy Your Website in Paragon Archive",
  "Updated Paragon Roadmap", "RxLife Network", "Pharmapaedia", "Paragon Ecosystem",
  "PARAGON ARCHIVE — SYSTEM STATUS", "Community Membership Process", "Archive Categories with Deployed",
  "Paragon Team Gateway", "Published and Clearly Scoped"
]) assert(html.includes(phrase), `Archive Hub documentation is missing: ${phrase}`);

assert((html.match(/data-deployed-subcategory/g) || []).length === 10, "Deployed does not contain all ten supplied subcategories");
assert((html.match(/<tr><td>[1-9]|<tr class="hub-category-planned"><td>11/g) || []).length >= 10, "Updated category-family table is incomplete");
assert(/id="hub-deploy-form"/.test(html) && /ZIP, max 50MB/.test(html) && /minimum 3, maximum 8/.test(html) && /Website Files or URL/.test(html), "Deployed form preview or upload guidance is incomplete");
for (const id of ["hub-website-name", "hub-creator-name", "hub-description", "hub-description-count", "hub-subcategory", "hub-premium-field", "hub-premium-details", "hub-hosted-url", "hub-contact-email", "hub-website-files", "hub-website-icon", "hub-screenshots", "hub-deploy-submit", "hub-deploy-status"]) {
  assert(html.includes(`id="${id}"`), `Deployed form preview is missing ${id}`);
}

assert(!html.includes("ALL SYSTEMS OPERATIONAL"), "Hub falsely claims every system is operational");
for (const section of ["about", "privacy-policy", "terms", "help", "request-site"]) assert(html.includes(`id="${section}"`), `Consolidated Hub section is missing: ${section}`);
assert(/config\/supabase\.js[\s\S]*auth\/supabase-auth\.js[\s\S]*auth\/paragon-sync\.js[\s\S]*privacy\.js[\s\S]*archive-hub\.js/.test(html), "Consolidated Hub script order is incorrect");
assert(source.includes("setupConditionalDisclosures") && source.includes("button.hidden = !needsDisclosure") && styles.includes(".hub-disclosure-content.collapsed"), "Conditional long-form disclosure or short-content suppression is missing");
assert(source.includes('window.self !== window.top') && styles.includes('.embedded-hub .hub-page-shell') && styles.includes('min-height: calc(100dvh - 64px)'), "Embedded laptop/MacBook Hub does not use the full iframe background");
// D-115/P-035: the owner-supplied landing layout explicitly uses "See all →" style links on Home.
// D-092 still bans decorative arrows elsewhere, so only the landing "see all"/banner arrows are allowed.
const htmlWithoutLandingArrows = html.replace(/See all →|Join now →|Developer docs →|← Back to Hub Home|← Back to Archive|Archive Hub → Join Community/g, "");
assert(!/[←→↗]/.test(htmlWithoutLandingArrows), "Textual action arrows remain in Archive Hub outside the owner-approved landing links");
assert(!/Community Platform[\s\S]{0,220}<b>Operational<\/b>/.test(html), "Community is falsely operational");
assert(!/Deployed Platform[\s\S]{0,220}<b>Operational<\/b>/.test(html), "Deployed is falsely operational");
assert(html.includes("Community product: Planned") && html.includes("Public hosting: Not launched") && html.includes("Applications: Not open"), "Future products are not clearly labelled");
assert(html.includes("Secure self-service account deletion is not yet activated"), "Terms falsely claim immediate account deletion");
assert(html.includes("Google Analytics is not connected now") && html.includes("Tracking cookies and Google Ads/AdSense are not connected"), "Cookie policy falsely claims optional tracking is live");
assert(!html.includes("████") && !html.includes("65%") && !html.includes("20%") && !html.includes("10%"), "Unsupported roadmap progress percentages remain");
assert(/2027[\s\S]{0,180}Planned/.test(html), "Future 2027 launch is marked as completed");
assert(html.includes("Nothing entered here is uploaded or sent") && source.includes("no data or files were sent"), "Deployed preview can imply fake submission");
assert(html.includes("Creator email matching is not sufficient") && !/service[_-]?role\s*[:=]\s*["'][A-Za-z0-9]/i.test(html), "Team Gateway truth/security boundary is missing");

const context = { console };
context.window = context;
vm.createContext(context);
for (const file of ["data/sites.js", "data/catalogue-expansion.js", "data/catalogue-expansion-45-100.js"]) vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
const hub = context.ParagonSites.find(site => site.name === "Paragon Archive Hub");
assert(hub?.siteUrl === "paragon-archive-hub.html", "Archive Hub catalogue OPEN destination is not connected");
assert(hub.features.some(feature => feature.includes("Community Guidelines")) && hub.features.some(feature => feature.includes("Deployed-category")), "Archive Hub detail does not reflect the published documentation");
assert(!context.ParagonSites.some(site => site.category === "Deployed"), "A fake third-party Deployed website was added");
assert(/icon:\s*"🚀",\s*name:\s*"Deployed"[\s\S]*status:\s*"planned"/.test(app), "Planned empty Deployed category definition is missing");
assert(app.includes("No third-party websites are listed") && app.includes("paragon-archive-hub.html#deployed"), "Deployed empty state is not honest or linked");

// P-094 — footer destinations became detail-first routes (then=about/privacy-policy/help/request-site).
assert(shell.includes("then=about") && shell.includes("then=privacy-policy") && shell.includes("then=help") && shell.includes("then=request-site"), "Archive footer does not route all Hub sections through the detail-first flow (P-094)");
for (const removedPage of ["paragon-about.html", "paragon-help-support.html", "paragon-request-website.html", "paragon-privacy-security.html"]) assert(!fs.existsSync(path.join(root, removedPage)), `${removedPage} was not removed after Hub consolidation`);
assert(shell.includes('then=terms') && !shell.includes("Terms content is pending owner approval"), "Archive footer Terms route is not published (P-094 detail-first)");
assert(app.includes('href="paragon-archive-hub.html"'), "Account settings lost the Paragon Archive Hub link (P-076 keeps it)");
assert(serviceWorker.includes('"./paragon-archive-hub.html"') && serviceWorker.includes('"./archive-hub.js"') && serviceWorker.includes("paragon-archive-v80"), "Hub is missing from the current PWA shell");
assert(/stale-while-revalidate/i.test(serviceWorker) || /network\.then|const network = fetch/.test(serviceWorker), "Service worker assets are cache-first without background revalidation");
assert(styles.includes("PARAGON ARCHIVE HUB") && styles.includes(".hub-page-shell") && styles.includes(".hub-status-grid") && styles.includes(".hub-deploy-form-card"), "Archive Hub responsive visual system is incomplete");

const idMatches = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
assert(new Set(idMatches).size === idMatches.length, "Archive Hub contains duplicate HTML IDs");

function dynamicFixture() {
  const elements = new Map();
  const make = id => {
    const node = { id, value: "", textContent: "", hidden: false, required: false, files: [], addEventListener() {}, closest() { return null; } };
    elements.set(id, node);
    return node;
  };
  for (const id of ["hub-description", "hub-description-count", "hub-premium-field", "hub-premium-details", "hub-website-files", "hub-website-icon", "hub-screenshots"]) make(id);
  const pricing = { value: "premium" };
  const runtime = {
    console,
    window: null,
    document: {
      getElementById: id => elements.get(id) || null,
      querySelector: selector => selector === 'input[name="pricing"]:checked' ? pricing : null,
      querySelectorAll: () => [],
      addEventListener() {}
    },
    IntersectionObserver: function() {}
  };
  runtime.window = runtime;
  vm.createContext(runtime);
  vm.runInContext(source, runtime);
  return { runtime, elements };
}

const fixture = dynamicFixture();
fixture.elements.get("hub-description").value = "A clear description";
fixture.runtime.ParagonArchiveHub.updateDescriptionCount();
assert(fixture.elements.get("hub-description-count").textContent === "19 / 1000 characters", "Hub description counter did not update");
fixture.runtime.ParagonArchiveHub.syncPremiumField();
assert(fixture.elements.get("hub-premium-field").hidden === false && fixture.elements.get("hub-premium-details").required === true, "Premium disclosure field did not become required");
fixture.elements.get("hub-website-files").files = [{ name: "site.zip", size: 51 * 1024 * 1024, type: "application/zip" }];
assert(/50MB/.test(fixture.runtime.ParagonArchiveHub.validatePreviewFiles()), "50MB ZIP preview limit is not enforced");
fixture.elements.get("hub-website-files").files = [];
fixture.elements.get("hub-screenshots").files = [{ type: "image/png" }, { type: "image/png" }];
assert(/3 and 8/.test(fixture.runtime.ParagonArchiveHub.validatePreviewFiles()), "3–8 screenshot preview rule is not enforced");

console.log("PASS: Archive Hub documentation, honest current states, Deployed preview, catalogue/category connections, navigation, and PWA shell");

})();

/* ================= FIXTURE: auth.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
function assert(condition, message) { if (!condition) throw new Error(message); }
function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() { return body === null || body === undefined ? "" : JSON.stringify(body); }
  };
}

const local = new Map();
const session = new Map();
let assignedUrl = "";
let resetRequested = false;
let passwordUpdated = false;
let lastSavedRow = null;
let lastSignupBody = null;
let submittedWebsiteRequest = null;
let requestRows = [];
let stateRows = [{ state: { bookmarks: ["Paragon Notes"], reviews: {}, visits: [], progress: {}, preferences: {} }, updated_at: "2026-08-04T00:00:00Z" }];
const user = { id: "user-123", email: "member@example.com", app_metadata: { provider: "email" }, user_metadata: { display_name: "Member" } };

const context = {
  console,
  URL,
  URLSearchParams,
  structuredClone: global.structuredClone,
  localStorage: { getItem: key => local.get(key) ?? null, setItem: (key, value) => local.set(key, value), removeItem: key => local.delete(key) },
  sessionStorage: { getItem: key => session.get(key) ?? null, setItem: (key, value) => session.set(key, value), removeItem: key => session.delete(key) },
  location: {
    origin: "https://paragon.test",
    pathname: "/archive/",
    search: "",
    hash: "",
    assign(url) { assignedUrl = url; }
  },
  history: { replaceState(_state, _title, url) { context.replacedUrl = url; } },
  ParagonConfig: {
    supabaseUrl: "https://example.supabase.co",
    supabaseAnonKey: "public-anon-key-that-is-long-enough-for-tests",
    authRedirectUrl: "https://paragon.test/archive/",
    userStateTable: "paragon_user_state"
  },
  async fetch(url, options = {}) {
    if (url.includes("/auth/v1/token?grant_type=password")) {
      return response({ access_token: "access-1", refresh_token: "refresh-1", expires_in: 3600, user });
    }
    if (url.includes("/auth/v1/token?grant_type=refresh_token")) {
      return response({ access_token: "access-2", refresh_token: "refresh-2", expires_in: 3600, user });
    }
    if (url.includes("/auth/v1/signup")) {
      lastSignupBody = JSON.parse(options.body);
      return response({ user: { ...user, confirmation_sent_at: "now" } });
    }
    if (url.includes("/rest/v1/rpc/paragon_username_available")) return response(true);
    if (url.includes("/rest/v1/rpc/paragon_request_count")) return response(12);
    if (url.includes("/rest/v1/paragon_profiles") && options.method === "GET") return response([{ username: "member_name", display_name: "Member", created_at: "2026-08-04T00:00:00Z" }]);
    if (url.endsWith("/auth/v1/user") && options.method === "GET") return response(user);
    if (url.endsWith("/auth/v1/user") && options.method === "PUT") { passwordUpdated = true; return response(user); }
    if (url.endsWith("/auth/v1/recover")) { resetRequested = true; return response({}); }
    if (url.endsWith("/auth/v1/logout")) return response(null, 204);
    if (url.includes("/rest/v1/paragon_website_requests") && options.method === "GET") return response(requestRows);
    if (url.includes("/rest/v1/paragon_website_requests") && options.method === "POST") {
      submittedWebsiteRequest = JSON.parse(options.body);
      requestRows = [{ created_at: new Date().toISOString() }];
      return response([{ id: "request-1", ...submittedWebsiteRequest, status: "submitted", created_at: requestRows[0].created_at }], 201);
    }
    if (url.includes("/rest/v1/paragon_user_state") && options.method === "GET") return response(stateRows);
    if (url.includes("/rest/v1/paragon_user_state") && options.method === "POST") {
      lastSavedRow = JSON.parse(options.body);
      stateRows = [{ state: lastSavedRow.state, updated_at: lastSavedRow.updated_at }];
      return response(null, 201);
    }
    throw new Error(`Unexpected fetch: ${options.method || "GET"} ${url}`);
  }
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "auth/supabase-auth.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "auth/paragon-sync.js"), "utf8"), context);

(async () => {
  const auth = context.ParagonAuth;
  const sync = context.ParagonSync;
  assert(auth.isConfigured(), "Configured Supabase client was not recognized");

  auth.signInWithGoogle();
  assert(assignedUrl.includes("/auth/v1/authorize") && assignedUrl.includes("provider=google"), "Google OAuth URL was not created");
  assert(assignedUrl.includes(encodeURIComponent("https://paragon.test/archive/")), "OAuth redirect URL is missing");
  assert(await auth.checkUsernameAvailability("member_name"), "Username availability RPC did not return true");
  await auth.signUpWithPassword("new@example.com", "secure-password", "New Member", "member_name");
  assert(lastSignupBody.data.username === "member_name", "Signup did not include the normalized username");

  const signedIn = await auth.signInWithPassword("member@example.com", "correct-password");
  assert(signedIn.user.email === "member@example.com", "Email/password sign-in did not return the real user");
  assert(local.has("paragonArchive.supabaseSession.v1"), "Authenticated session was not persisted across paths");
  assert((await auth.getSession()).user.id === "user-123", "Persisted session could not be restored");

  const loaded = await sync.loadState();
  assert(loaded.bookmarks.includes("Paragon Notes"), "Authenticated user state did not load through RLS REST client");
  await context.ParagonProgress.save("paragon-education", { courseId: "html", completion: 0.5 });
  assert(lastSavedRow.user_id === "user-123", "Progress was not saved under the authenticated user ID");
  assert(lastSavedRow.state.progress["paragon-education"].value.completion === 0.5, "Shared product progress was not persisted");
  assert((await context.ParagonProgress.load("paragon-education")).completion === 0.5, "Shared product progress could not be loaded");
  assert(await sync.getWebsiteRequestCount() === 12, "Privacy-safe public request count did not load");
  assert((await sync.getWebsiteRequestEligibility()).allowed, "Account with no prior request was not eligible");
  await sync.submitWebsiteRequest({
    websiteName: "Useful Tool",
    category: "Tools",
    reason: "It helps the community learn through clear planning features.",
    needReason: "Students and teachers need a simpler free workflow.",
    contactEmail: "member@example.com",
    termsAcknowledged: true
  });
  assert(submittedWebsiteRequest.user_id === "user-123" && submittedWebsiteRequest.website_name === "Useful Tool", "Authenticated website request was not submitted under the user");
  assert(submittedWebsiteRequest.need_reason && submittedWebsiteRequest.contact_email === "member@example.com" && submittedWebsiteRequest.terms_acknowledged, "Expanded website-request fields were not submitted");
  assert(!(await sync.getWebsiteRequestEligibility()).allowed, "Recent request did not activate the seven-day eligibility state");
  await auth.resetPasswordForEmail("member@example.com");
  await auth.updatePassword("new-secure-password");
  assert(resetRequested && passwordUpdated, "Password recovery/update endpoints were not called");

  await auth.signOut();
  assert(!local.has("paragonArchive.supabaseSession.v1"), "Sign-out did not clear the persistent auth session");

  session.set("paragonArchive.guestSession.v1", "true");
  session.set("paragonArchive.guestState.v1", JSON.stringify({ bookmarks: [], reviews: {}, visits: [], progress: {}, preferences: {} }));
  await context.ParagonProgress.save("paragon-exam", { mock: 2, score: 78 });
  const guestState = JSON.parse(session.get("paragonArchive.guestState.v1"));
  assert(guestState.progress["paragon-exam"].value.score === 78, "Guest progress was not written to sessionStorage");
  assert(!local.has("paragonArchive.supabaseSession.v1"), "Guest progress created a persistent authenticated session");
  session.delete("paragonArchive.guestSession.v1");
  session.delete("paragonArchive.guestState.v1");

  let rejected = false;
  try { await context.ParagonProgress.save("paragon-code", { lesson: 1 }); }
  catch (error) { rejected = /Sign in or continue as Guest/.test(error.message); }
  assert(rejected, "Signed-out progress save was not rejected");

  context.location.hash = "#access_token=oauth-access&refresh_token=oauth-refresh&expires_in=3600&token_type=bearer";
  const callbackSession = await auth.handleOAuthCallback();
  assert(callbackSession.user.id === "user-123", "OAuth callback did not retrieve the real user");
  assert(context.replacedUrl === "/archive/", "OAuth callback parameters were not removed from the URL");

  console.log("PASS: Supabase Google/email auth, persistent sessions, RLS state sync, shared progress, and session-only Guest progress");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

})();

/* ================= FIXTURE: catalogue-governance.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = { console };
context.window = context;
vm.createContext(context);
for (const file of ["data/sites.js", "data/catalogue-expansion.js", "data/catalogue-expansion-45-100.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
}

function assert(condition, message) { if (!condition) throw new Error(message); }
const sites = context.ParagonSites;
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const requestSource = fs.readFileSync(path.join(root, "archive-hub.js"), "utf8");
const hubHTML = fs.readFileSync(path.join(root, "paragon-archive-hub.html"), "utf8");
const requestHTML = hubHTML;
const privacyHTML = hubHTML;
const dataSources = ["data/sites.js", "data/catalogue-expansion.js", "data/catalogue-expansion-45-100.js", "data/updates.js"].map(file => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

assert(!sites.some(site => site.category === "Dev"), "Removed Dev category still contains a website");
assert(!/name:\s*["']Dev["']/.test(appSource), "Dev category definition remains in app.js");
assert(/icon:\s*["']💻["'],\s*name:\s*["']Dev Tools["']/.test(appSource), "Dev Tools category did not inherit the Dev computer icon");
assert(requestSource.includes('["💻", "Dev Tools"]'), "Request form Dev Tools option did not inherit the computer icon");

const expectedMoves = {
  "Paragon Originals": "Creative",
  "Paragon Random": "Tools",
  "Paragon Time Capsule": "Lifestyle",
  "Paragon Alive": "Health",
  "Paragon Archive Hub": "Originals"
};
for (const [name, category] of Object.entries(expectedMoves)) {
  const site = sites.find(entry => entry.name === name);
  assert(site?.category === category, `${name} is ${site?.category}, expected ${category}`);
}
const originals = sites.filter(site => site.category === "Originals");
// P-066: the owner moved Paragon Templates into Paragon Originals alongside the Hub.
const ORIGINALS_ALLOWED = new Set(["Paragon Archive Hub", "Paragon Templates"]);
assert(originals.length === 2 && originals.every(site => ORIGINALS_ALLOWED.has(site.name)), "Originals must contain exactly the Hub and Paragon Templates");
assert(sites.filter(site => site.group === "Paragon Originals").every(site => ORIGINALS_ALLOWED.has(site.name)), "A moved site still belongs to the Paragon Originals group");

const hub = sites.find(site => site.name === "Paragon Archive Hub");
for (const phrase of [
  "Official Paragon Archive channel and publishing gateway",
  "Paragon Team secure login gateway",
  "Request a Website access",
  "About, Privacy and Terms & Conditions",
  "Deploy or host a website in Paragon Archive",
  "Roadmap and platform updates"
]) assert([hub.desc, hub.about, ...(hub.features || [])].join(" ").includes(phrase), `Archive Hub channel detail is missing: ${phrase}`);
assert(hub.icon === "◈" && hub.tag === "Archive Channel", "Archive Hub identity was not preserved as the Archive channel");
assert(/icon:\s*["']🌟["'],\s*name:\s*["']Originals["']/.test(appSource), "Originals category does not use the latest supplied star icon");

const projectStart = new Date("2026-08-01T00:00:00+01:00").getTime();
for (const site of sites) {
  assert(new Date(site.addedAt).getTime() >= projectStart, `${site.name} has a pre-project addition date: ${site.addedAt}`);
  assert(!/\b202[0-5]\b/.test(String(site.version || "")), `${site.name} has a pre-project version year: ${site.version}`);
  for (const review of site.reviews || []) assert(!/\b202[0-5]\b|\bJan\b|\bDec\b/.test(String(review.date || "")), `${site.name} has stale review date: ${review.date}`);
}
assert(!/\b202[0-5]\b/.test(dataSources), "Active catalogue/update sources still contain a pre-2026 year");
assert(!/\b2025\b/.test(appSource), "Application review-date fallback still uses 2025");

assert(requestHTML.includes("We have mapped out our first 100 websites") && !requestHTML.includes("We have built 100 websites"), "Request page still conflicts with the 2027 first-100 roadmap");
for (const falseClaim of ["Paragon Archive shows ads", "We use Google Analytics", "This permanently removes your account", "all your personal data is permanently removed"]) {
  assert(!privacyHTML.includes(falseClaim), `Privacy page still contains inaccurate active-state claim: ${falseClaim}`);
}
assert(privacyHTML.includes("Last Updated:</strong> August 5, 2026"), "Privacy policy last-updated date was not advanced after accuracy corrections");

console.log("PASS: Dev removal/icon transfer, Originals redistribution, sole Archive Hub channel, 2026-only catalogue chronology, and active-copy accuracy");

})();

/* ================= FIXTURE: email.test.js ================= */
(function () {
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const templatePath = path.join(root, "supabase/functions/_shared/email-templates.mjs");
const workerPath = path.join(root, "supabase/functions/send-transactional-email/index.ts");
const integrationPath = path.join(root, "supabase/functions/EMAIL-INTEGRATION.md");
const schema = fs.readFileSync(path.join(root, "supabase/schema.sql"), "utf8");
const worker = fs.readFileSync(workerPath, "utf8");
const integration = fs.readFileSync(integrationPath, "utf8");
const privacy = fs.readFileSync(path.join(root, "paragon-archive-hub.html"), "utf8");
const requestClient = fs.readFileSync(path.join(root, "archive-hub.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  const templates = await import(`${pathToFileURL(templatePath).href}?test=${Date.now()}`);
  const email = templates.getEmailTemplate("request-received", { websiteName: "Paragon Maps" });

  assert(email.subject === "We got your idea 💡 — Paragon Archive", "Automatic-reply subject is incorrect");
  for (const phrase of [
    "Thank you for submitting your website request to Paragon Archive.",
    "We review every request personally.",
    "There is no fixed timeline.",
    "If you left your email",
    "Want to speed things up?",
    "Every great thing started with someone saying \"I wish this existed.\"",
    "Stay exceptional.",
    "The Paragon Team",
    "paragon.archive.2026@gmail.com",
    "https://paragonarchive.com"
  ]) assert(email.text.includes(phrase), `Text automatic reply is missing: ${phrase}`);
  assert(email.text.includes("Your request: Paragon Maps"), "Request name was not safely included in the receipt");
  assert(email.html.includes("We got your idea 💡") && email.html.includes("Share Paragon Archive by email"), "HTML automatic reply or share action is incomplete");
  assert(email.html.includes("mailto:") && email.html.includes("subject="), "Prefilled manual email link is missing");
  assert(!email.html.includes("<script"), "Email template contains executable script markup");

  const supportEmail = templates.getEmailTemplate("support-notification", {
    supportId: "support-1",
    name: "Ada <script>",
    email: "ada@example.com",
    topic: "Bug Report",
    message: "The save button failed <script>alert(1)</script>",
    attachmentPath: "support-1/screen.png",
    attachmentName: "screen.png",
    userAgent: "Pixel 7 / Chrome"
  });
  assert(supportEmail.subject.includes("Bug Report") && supportEmail.replyTo === "ada@example.com", "Owner support notification subject/reply path is incorrect");
  assert(supportEmail.text.includes("support-attachments/support-1/screen.png") && supportEmail.text.includes("Pixel 7 / Chrome"), "Support notification is missing attachment or device context");
  assert(!supportEmail.html.includes("<script>alert") && supportEmail.html.includes("&lt;script&gt;"), "Support notification did not escape user content");
  assert(supportEmail.html.includes("Reply to Ada") && supportEmail.html.includes("mailto:ada%40example.com"), "Owner notification prefilled Reply action is missing");

  const mailto = templates.buildMailto("Subject & idea", "Line one\nLine two", "person@example.com");
  assert(mailto.startsWith("mailto:person%40example.com?"), "Mailto recipient was not encoded");
  assert(mailto.includes("subject=Subject%20%26%20idea") && mailto.includes("body=Line%20one%0ALine%20two"), "Mailto subject/body were not URL-encoded");

  for (const token of [
    'Deno.env.get("BREVO_API_KEY")',
    'Deno.env.get("PARAGON_EMAIL_WEBHOOK_SECRET")',
    'Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")',
    "https://api.brevo.com/v3/smtp/email",
    "safeEqual",
    'status: "processing"',
    '"pending"',
    '"failed"'
  ]) assert(worker.includes(token), `Protected email worker is missing: ${token}`);
  assert(!/BREVO_API_KEY\s*=\s*["'][^"']{10,}["']/.test(worker), "Brevo credential appears hard-coded");
  assert(!/SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']{10,}["']/.test(worker), "Service-role credential appears hard-coded");

  for (const token of [
    "create table if not exists public.paragon_email_outbox",
    "event_key text not null unique",
    "revoke all on table public.paragon_email_outbox from anon, authenticated",
    "queue_paragon_request_received_email",
    "after insert on public.paragon_website_requests",
    "on conflict (event_key) do nothing",
    "'request-received'"
  ]) assert(schema.includes(token), `Email outbox/schema hook is missing: ${token}`);

  assert(integration.includes("Free-First Setup") && integration.includes("Database Webhook") && integration.includes("SAVE GUEST DRAFT") === false, "Email activation guide is missing or contains UI-specific noise");
  assert(integration.includes("supabase functions deploy send-transactional-email --no-verify-jwt"), "Edge Function deployment command is missing");
  assert(integration.includes("X-Paragon-Email-Secret") && integration.includes("Authentication → Emails → SMTP Settings"), "Webhook secret or Auth SMTP setup is missing");
  assert(privacy.includes("Email delivery providers") && privacy.includes("authentication or transactional messages"), "Privacy policy does not disclose email delivery providers");
  assert(requestClient.includes("Watch your inbox for our confirmation email"), "Request success state does not mention the queued confirmation email");

  console.log("PASS: automatic reply template, prefilled mail link, private outbox, Brevo Edge worker, Auth SMTP guide, and privacy disclosure");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

})();

