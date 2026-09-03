# SOP — Standard Operating Procedure

> **What this is:** The single source of truth and project encyclopedia for Paragon Archive: the plan, rules, requirements, decisions, current state, architecture, and refined prompt history. Anyone taking over the project should be able to understand what is being built, why it is being built, what has already been decided, and what remains.
>
> **Companions:** [`EOP.md`](./EOP.md) records executed/version history. [`AI-BRAIN.md`](./AI-BRAIN.md) is the third owner-requested knowledge/retrieval/backend blueprint for future Archive AI. This SOP records requirements and decisions.
>
> **Principle:** DRY — define intent once in the SOP and record execution once in the EOP.

## How to use the SOP and EOP

- Re-read this SOP before every project action.
- Refine and log every owner prompt in §11.
- Update the relevant topic when a requirement evolves; do not create contradictory duplicate rules.
- Keep progress in §9 synchronized with `EOP.md`.
- Keep §13 current by removing completed CTA items.
- Status: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked.
- **Standing rule P-007:** End every delivery with a **Pending Content reminder** based on §13.

---

## §1. Project identity

- **Project:** Paragon Archive
- **Type:** Responsive front-end web application / curated website archive
- **Current phase:** Front-end, Supabase schema, and free-first transactional email foundation prepared; external activation, owner testing, content, and broader backend work pending
- **Owner priority:** Preserve the existing design and behavior unless a specific change is requested.
- **Working directory:** `/home/user/paragon-archive/`
- **Canonical entry file:** `/paragon-archive.html`
- **Original intake uploads:** removed at the owner’s request in P-027 after the reconstructed project and replacement export were verified
- **Initialized:** 2026-08-04

## §2. Product intent

Paragon Archive presents a curated collection of Paragon websites. The current experience includes:

- Website discovery and category browsing
- Hero recommendations
- Trending, staff picks, recent additions, and category-led discovery
- Search and category chips
- Website detail views
- An updates timeline
- Account, saved items, collections, achievements, reviews, history, and settings demonstrations
- Dark/light appearance support
- Responsive top and bottom navigation

The immediate goal is not a redesign. It is to stabilize the current implementation, repair bugs safely, and evolve the code into maintainable pages and modules only when needed.

## §3. Current source inventory

| Working file | Role | Source |
|---|---|---|
| `paragon-archive.html` | Canonical application shell and browser entry file | Renamed from working `index.html` in P-012; export header records its identity |
| `paragon-archive-hub.html` | Consolidated Archive Hub containing About, Privacy, Terms, Help, Request, Community/Cookie policies, developer/Deployed specification, roadmap, status, membership, and category-family gateway | Created in P-029 and consolidated in P-030; the only informational/form HTML page outside the canonical Archive app |
| `paragon-product-preview.html` | Shared tailored concept-preview shell for every unfinished catalogue product opened inside the iframe | Created in P-031; explicitly preview-only and data-driven |
| `archive-hub.js` | Consolidated Hub navigation/disclosures plus Request, Help, status, and Deployed preview controllers | Created in P-029; Request/Help modules merged into it and former page scripts removed in P-030 |
| `product-preview.js` | Category-aware product concept-preview renderer using current catalogue data | Created in P-031; loaded only by the shared product preview page |
| `ai/paragon-archive-ai.js` | Secure one-core local AI for messy Search intent ranking and grounded Website Detail Q&A; future modes reserved | Restored/refactored from the disguised uploaded JavaScript in P-032; contains no provider secret |
| `privacy.js` | Cookie consent, privacy preferences, and data export controller | Created in P-018 |
| `style.css` | Shared application styles | Uploaded `paragon-archive.css` |
| `app.js` | Rendering, navigation, search, account, detail, and interaction logic | Uploaded `paragon-archive.md`, restored to `.js`, with catalogue data extracted in P-003 |
| `data/sites.js` | Combined, deduplicated website catalogue data plus addition chronology metadata | Created in P-003 and extended in P-007 without changing preserved record bodies |
| `data/catalogue-expansion.js` | Declarative 44-site Tools/Creative/Education/Social merge | Created in P-014; loaded immediately after base catalogue |
| `data/catalogue-expansion-45-100.js` | Entertainment/Games/Finance/Lifestyle/Developer continuation plus current Originals-to-category consolidation and Archive Hub channel details | Created in P-015 and refined in P-026; loaded after the first expansion |
| `data/updates.js` | Curated Maintenance, Announcement, and Featured/Promoted update events | Created in P-009; merged with generated catalogue/version events |
| `data/metrics.js` | Stable local view tracking plus daily hero, daily Staff, and weekly Trending snapshots | Created in P-005 and extended in P-006; front-end preview pending production analytics |
| `manifest.webmanifest` | PWA identity, start URL, theme, and install icons | Created in P-013 |
| `pwa.js` | Service-worker registration and install-prompt controller | Created in P-013 |
| `service-worker.js` | Offline application-shell cache and navigation fallback | Created in P-013 and advanced for the P-028 local QR asset |
| `vendor/qrcode.min.js` | Vendored MIT-licensed qrcode-generator 1.4.4 runtime for offline exact-detail QR creation | Added in P-028; loaded immediately before `app.js` |
| `assets/icons/paragon-192.png`, `paragon-512.png` | Installable PWA icons | Created in P-013 |
| `config/supabase.js` | Public Supabase URL/anon-key and shared auth configuration | Created in P-010; credentials pending owner setup |
| `auth/supabase-auth.js` | Dependency-free Google OAuth and email/password Supabase Auth client | Created in P-010 |
| `auth/paragon-sync.js` | RLS user-state sync and shared authenticated/Guest progress API | Created in P-010 |
| `auth/INTEGRATION.md` | Same-origin path integration guide for all Paragon products | Created in P-010 |
| `supabase/schema.sql` | Shared state/request/outbox tables, grants, RLS policies, aggregates, and database triggers | Created in P-010 and extended through P-028; must be run in Supabase |
| `supabase/functions/_shared/email-templates.mjs` | Allowlisted transactional email subjects, text/HTML bodies, and prefilled-mail links | Created in P-022 |
| `supabase/functions/send-transactional-email/index.ts` | Protected Brevo delivery worker for database-webhook outbox events | Created in P-022; deploy as a Supabase Edge Function |
| `supabase/functions/submit-support-message/index.ts` | Public support endpoint with server validation, private screenshot upload, and message insertion | Created in P-023; deploy as a Supabase Edge Function |
| `supabase/functions/EMAIL-INTEGRATION.md` | Free-first Brevo, webhook, Auth SMTP, secrets, testing, and template guide | Created in P-022 |
| `supabase/functions/SUPPORT-INTEGRATION.md` | Support schema, endpoint, private Storage, anti-spam, notification, and testing guide | Created in P-023 |
| `tests/auth.test.js` | Supabase auth/session/state/progress and Guest-isolation regression fixture | Created in P-010 |
| `tests/privacy.test.js` | Cookie consent/privacy preference regression fixture | Created in P-018 |
| `tests/request-website.test.js` | Consolidated Hub request copy, identity, Guest-draft, count, receipt, and authenticated-submission regression fixture | Created in P-019; retargeted to Hub in P-030 |
| `tests/email.test.js` | Transactional template, outbox, Edge worker, mailto, SMTP-guide, and privacy regression fixture | Created in P-022 |
| `tests/help-support.test.js` | Consolidated Hub Help copy/form/upload/FAQ/docs, support schema/Edge, direct-email, notification, and navigation fixture | Created in P-023; retargeted to Hub in P-030 |
| `tests/about.test.js` | Consolidated Hub About story, roadmap, values, founder/team/contact, honesty, navigation, and PWA fixture | Created in P-025; retargeted to Hub in P-030 |
| `tests/archive-hub.test.js` | Hub documentation, truth-state, Deployed preview, catalogue/category, navigation, and PWA regression fixture | Created in P-029 |
| `tests/product-preview.test.js` | Shared concept-preview route, catalogue coverage, Brain knowledge, honesty, rendering, and PWA regression fixture | Created in P-031 |
| `tests/ai.test.js` | Secure one-core AI, messy intent ranking, grounded Detail Q&A, mode registry, UI, and browser-secret regression fixture | Created in P-032 |
| `tests/catalogue-governance.test.js` | Category consolidation, sole Archive Hub channel, 2026 chronology, and active-copy accuracy regression fixture | Created in P-026 |
| `tests/search-navigation.test.js` | Dependency-free regression fixture for search, category/recent discovery, and context-preserving detail Back behavior | Created in P-004, extended through P-007 |
| `tests/metrics-carousel.test.js` | Dependency-free regression fixture for daily/weekly metrics, hero controls, and Staff Picks | Created in P-005, extended in P-006 |
| `tests/ui-regression.test.js` | Dependency-free regression fixture for navigation, Account/Auth, collections/items, requests, QR, PWA, detail features, Updates, bookmarks, and review votes | Created in P-008 and extended through P-013 |
| `docs/SOP.md` | Requirements, rules, current state, prompt log, and CTA | Created at intake |
| `docs/EOP.md` | Executed change and validation history | Created at intake |
| `docs/AI-BRAIN.md` | Comprehensive catalogue/platform knowledge, future retrieval/AI API/backend/security/evaluation blueprint | Created in P-031 as the owner-requested third document |

The former `/home/user/uploads/` intake copies were removed in P-027 at the owner’s explicit request. The reconstructed project plus the latest folder-preserving export are now the recovery sources of truth.

## §3A. Export and re-import reconstruction manifest

> **Canonical entry:** `paragon-archive.html` — do not rename it back to `index.html` unless a deployment platform explicitly requires an index entry.
>
> **Latest and only retained folder-preserving bundle:** `/paragon-archive-export-v0.32.0.zip` in the workspace root.
>
> **Portable one-file handoff:** `/paragon-archive-portable-v0.32.0.json` in the workspace root; another agent can reconstruct every project path from its manifest/encoded content without ZIP support.
>
> **Flattened-upload recovery:** Read the `PARAGON ARCHIVE — EXPORT IDENTITY` comment at the top of each code file, then move it to the listed `EXPECTED PROJECT PATH`.

```text
/paragon-archive.html
/paragon-archive-hub.html
/paragon-product-preview.html
/style.css
/app.js
/archive-hub.js
/product-preview.js
/ai/paragon-archive-ai.js
/pwa.js
/privacy.js
/service-worker.js
/vendor/qrcode.min.js
/manifest.webmanifest
/assets/icons/paragon-192.png
/assets/icons/paragon-512.png
/config/supabase.js
/auth/supabase-auth.js
/auth/paragon-sync.js
/auth/INTEGRATION.md
/data/sites.js
/data/catalogue-expansion.js
/data/catalogue-expansion-45-100.js
/data/updates.js
/data/metrics.js
/supabase/schema.sql
/supabase/functions/_shared/email-templates.mjs
/supabase/functions/send-transactional-email/index.ts
/supabase/functions/submit-support-message/index.ts
/supabase/functions/EMAIL-INTEGRATION.md
/supabase/functions/SUPPORT-INTEGRATION.md
/tests/auth.test.js
/tests/privacy.test.js
/tests/request-website.test.js
/tests/email.test.js
/tests/help-support.test.js
/tests/about.test.js
/tests/archive-hub.test.js
/tests/product-preview.test.js
/tests/ai.test.js
/tests/catalogue-governance.test.js
/tests/ui-regression.test.js
/tests/metrics-carousel.test.js
/tests/search-navigation.test.js
/docs/SOP.md
/docs/EOP.md
/docs/AI-BRAIN.md
```

### Browser load order

1. `style.css` from the `<head>` of `paragon-archive.html`
2. `config/supabase.js`
3. `auth/supabase-auth.js`
4. `auth/paragon-sync.js`
5. `data/sites.js`
6. `data/catalogue-expansion.js`
7. `data/catalogue-expansion-45-100.js`
8. `data/updates.js`
9. `data/metrics.js`
10. `ai/paragon-archive-ai.js`
11. `pwa.js`
12. `privacy.js`
13. `vendor/qrcode.min.js`
14. `app.js`

Archive Hub consolidated page load order:

1. `style.css`
2. `config/supabase.js`
3. `auth/supabase-auth.js`
4. `auth/paragon-sync.js`
5. `privacy.js`
6. `archive-hub.js` — includes the Request and Help controllers

Shared product preview load order:

1. `style.css`
2. `data/sites.js`
3. `data/catalogue-expansion.js`
4. `data/catalogue-expansion-45-100.js`
5. `product-preview.js`

### Reconstruction rules

- Keep `paragon-archive.html`, `style.css`, and `app.js` at project root.
- Recreate `config/`, `auth/`, `data/`, `vendor/`, `supabase/`, `tests/`, and `docs/` exactly as listed.
- Keep the bundled `vendor/qrcode.min.js` local and immediately before `app.js`; it replaces the former remote QR-image service.
- Do not expose a Supabase service-role key or private password in any browser file.
- Run `supabase/schema.sql` in Supabase rather than loading it in the browser.
- Deploy `supabase/functions/send-transactional-email/index.ts` and `supabase/functions/submit-support-message/index.ts` as Supabase Edge Functions; never load them or their service/provider secrets in the browser.
- `auth/INTEGRATION.md`, `supabase/functions/EMAIL-INTEGRATION.md`, `supabase/functions/SUPPORT-INTEGRATION.md`, SOP, and EOP are documentation; they are not browser scripts.
- If files arrive with changed upload names, trust the internal export header over the uploaded filename.
- Every future code file must follow standing rule P-014.
- JSON manifests cannot use comments, so `manifest.webmanifest` stores identity in `_fileIdentity`; binary PNG icons must keep their listed paths.
- `paragon-archive-hub.html` loads the consolidated order listed above. About, Privacy, Terms, Help, and Request are anchored Hub sections; the former standalone HTML files and Request/Help scripts must not be recreated.
- Keep the founder-photo and guide screenshot placeholders until owner-approved real assets are supplied.
- The Hub publishes documentation and working Request/Help/Privacy front ends, but not privileged Team/Community/Deployed operations.
- `paragon-product-preview.html` and `product-preview.js` are shared concept-preview infrastructure, not completed products; preserve the `previewOnly` label when restoring.
- Keep `docs/AI-BRAIN.md` beside SOP/EOP. It governs the active local retrieval/Q&A core and future secure model implementation; it is not a trained foundation model or secret-bearing configuration.
- Restore `ai/paragon-archive-ai.js` after catalogue data and before `app.js`. Never reintroduce direct browser provider keys/calls from the discarded prototype.

## §4. Architecture policy

### 4.1 Current structure

The build now has two browser pages: canonical `paragon-archive.html` contains the three-tab data-driven application, while `paragon-archive-hub.html` consolidates every public informational, policy, support, and request flow under anchor routes.

### 4.2 Multi-page rule

Do **not** keep adding unrelated full-page flows to `paragon-archive.html`. Create another HTML file when a feature:

1. Has its own direct URL or must be refreshable/bookmarkable;
2. Is a distinct legal, informational, authentication, settings, submission, or management flow;
3. Has enough unique structure that keeping it in `paragon-archive.html` would reduce maintainability; or
4. Is explicitly requested as a separate page.

Potential future pages include `updates.html`, `account.html`, `settings.html`, `privacy.html`, `terms.html`, `request-site.html`, and a dedicated website-detail route/page. These are architectural candidates, not approved changes yet.

### 4.3 Split-without-spoil rule

- Do not split a working feature solely to increase file count.
- Preserve visual presentation and user-visible behavior during structural refactors.
- Reuse shared `style.css` and shared modules where practical.
- Create page-specific CSS/JS only when it reduces coupling.
- Update all links, navigation states, and back behavior when a page is extracted.
- Validate each extraction before starting another.

### 4.4 Owner-confirmed Hub consolidation exception

P-030 supersedes the earlier separate-page decisions for About, Privacy, Help, and Request. Those flows now live only as anchored sections inside `paragon-archive-hub.html`, alongside Terms. Keep their functional form/privacy behavior, but do not recreate standalone pages unless the owner explicitly reverses this decision. The canonical Archive application remains separate and must never be renamed to `index.html`.

## §5. Standing project rules

- **P-001 — Preserve first:** Do not redesign, remove, or rewrite working features unless the owner asks or a verified bug requires it.
- **P-002 — Small changes:** Fix one coherent bug or feature group at a time; avoid broad speculative rewrites.
- **P-003 — Multi-page when warranted:** Create separate HTML pages for independent flows instead of endlessly expanding `paragon-archive.html`.
- **P-004 — Protect current sources:** Work only in `/paragon-archive/`, keep the latest verified export, and never delete current project files as cleanup; the obsolete intake uploads were removed only by explicit owner instruction in P-027.
- **P-005 — No silent assumptions:** Ask for clarification when expected behavior, content, or business logic is materially ambiguous.
- **P-006 — Validate:** Check syntax, loading, responsive behavior, interaction behavior, and regressions relevant to every change.
- **P-007 — Pending reminder:** End every delivery with the current owner-dependent items from §13.
- **P-008 — Documentation:** Log refined owner intent in SOP §11 and executed changes in EOP.
- **P-009 — Honest functionality:** Clearly distinguish front-end demos from real authentication, storage, notifications, search indexing, and other backend behavior.
- **P-010 — Accessibility:** Preserve semantic markup and keyboard access; improve labels, focus behavior, and ARIA state when touching the related component.
- **P-011 — Responsive safety:** Check mobile and desktop layouts after any UI change.
- **P-012 — No unnecessary dependencies:** Prefer the existing stack unless a dependency has a clear, recorded benefit.
- **P-013 — Owner-controlled scope:** Suggestions belong in the CTA until accepted; they are not permission to alter the site.
- **P-014 — Export identity headers:** Every future HTML, CSS, JavaScript, and SQL file must begin with a comment stating its real filename, expected project-relative path, role, and restore/load note so flattened uploads can be reconstructed.
- **P-016 — Cache version discipline:** Every delivery that changes any cached shell file (HTML, CSS, JS, data, icons) must bump the service-worker `CACHE_NAME`; assets additionally use stale-while-revalidate so browsers self-heal one load later even if a bump is missed. Root cause of the P-047 stale-feature report.
- **P-015 — All-resolution first:** Owner standing instruction from device testing: every new or changed UI surface must be implemented to work across all device resolutions from the start — phones, tablets, laptop 1366×768, MacBook 1440×900, and larger — not fixed per-device afterwards.

## §6. Change workflow

For each requested edit:

1. Read this SOP and current CTA.
2. Refine the prompt and add it to §11.
3. Identify expected behavior and acceptance criteria.
4. Inspect the smallest relevant code area.
5. Reproduce or verify the bug when possible.
6. Make the smallest safe change.
7. Run relevant syntax and behavior checks.
8. Check for nearby regressions and responsive effects.
9. Update §9 progress and §13 CTA.
10. Append the execution record to `EOP.md`.
11. Deliver a concise summary, validation result, files changed, and Pending Content reminder.

## §7. Definition of done

A task is done only when:

- The requested behavior is implemented or the verified bug is fixed.
- Existing unrelated behavior and visual design are preserved.
- Relevant console/syntax errors are resolved or documented.
- Links and asset paths used by the change resolve correctly.
- Relevant mobile and desktop behavior has been checked.
- Accessibility states affected by the change are coherent.
- SOP, EOP, progress, and CTA are updated.
- Any remaining limitation or backend dependency is stated plainly.

## §8. Testing matrix

Use the applicable subset for each change:

| Area | Checks |
|---|---|
| File loading | HTML, CSS, JS paths; no missing local assets |
| JavaScript | Syntax, console errors, duplicate event execution, missing elements |
| Navigation | Top actions, bottom tabs, direct links, back behavior, active state |
| Search | Open/close, keyboard behavior, empty query, result selection, filters |
| Website detail | Open/close, correct site data, actions, stable state |
| Account | Guest/login/logout states, hidden/visible content, settings state |
| Theme | Dark/light visual state and control state stay synchronized |
| Responsive | Small mobile, tablet, and desktop widths |
| Accessibility | Labels, landmarks, focus, dialog state, keyboard operation |
| External assets | Graceful fallback when remote images or fonts are unavailable |

## §9. Progress and current state

### Foundation

- `[x]` Uploaded HTML, CSS, and JavaScript source inventoried.
- `[x]` JavaScript restored from `.md` to working `app.js`.
- `[x]` Working filenames aligned with existing HTML references.
- `[x]` Original uploads preserved throughout reconstruction, then removed by explicit owner instruction after replacement export verification — P-027.
- `[x]` SOP and EOP created.
- `[x]` Multi-page architecture policy recorded.

### Stabilization

- `[x]` Automated syntax, structure, state, interaction, auth, catalogue, and export baselines completed.
- `[x]` Known front-end bugs found during the project audit were fixed with regression coverage.
- `[~]` Owner SPCK/physical-device visual and interaction testing is deferred to CTA §13.
- `[x]` Run targeted syntax, structure, responsive-calculation, interaction-fixture, and asset checks for P-002.
- `[x]` Website-tab responsive width and top-bar controls implemented — P-002; owner device/preset confirmation remains in CTA §13.
- `[x]` Added sixteen catalogue entries, dynamic details, and old/new related-site bindings — P-003.
- `[x]` Preserved detail/search return context and implemented category-aware catalogue search — P-004; owner SPCK confirmation remains in CTA §13.
- `[x]` Built seven-site daily hero rankings, manual carousel controls, and weekly data-driven Trending — P-005; owner SPCK confirmation remains in CTA §13.
- `[x]` Built daily underexposure-based Staff Picks, three-card preview, golden ribbon, and full list — P-006; owner SPCK confirmation remains in CTA §13.
- `[x]` Built descending Recently Added, removed public All Websites, and made category discovery functional — P-007; owner SPCK confirmation remains in CTA §13.
- `[x]` Completed comprehensive UI audit, repaired remaining front-end interactions, and applied final modern polish — P-008; owner device confirmation remains in CTA §13.
- `[x]` Repaired Updates filters, added mirrored timeline markers, Announcement/Featured types, and saved-site stars — P-009; owner SPCK confirmation remains in CTA §13.
- `[x]` Replaced demo Account behavior with Supabase Google/email auth, shared account state, and session-only Guest mode — P-010; Supabase credentials/provider activation remain in CTA §13.
- `[x]` Added creator demo identity/date, persistent collections, footer-aware navigation, launch progress, and animated detail stats — P-011; owner SPCK/Supabase activation remains in CTA §13.
- `[x]` Added export-safe file identity/manifest, screenshot lightbox, and tagged About sections — P-012; owner export/SPCK confirmation remains in CTA §13.
- `[x]` Completed missing checklist features: collections, requests, review votes, QR, PWA, ratings, versions, username, and iframe preview — P-013; backend activation/real URLs remain in CTA §13.
- `[x]` Verified and merged the supplied 44-site catalogue with complete details and no duplicates — P-014; real URLs/assets remain in CTA §13.
- `[x]` Verified and merged catalogue continuation 45–100 with complete details and no duplicates — P-015; real URLs/assets remain in CTA §13.
- `[x]` Added advanced rating summary, animated breakdown, review filters/cards, and bottom-sheet composer — P-016; owner SPCK confirmation remains in CTA §13.
- `[x]` Finalized category corrections, complete audit, documentation, and export handoff — P-017; owner testing/backend/content tasks are isolated in CTA §13.
- `[x]` Published Privacy & Security Policy and added consent/privacy controls — P-018; owner legal/production review remains in CTA §13.
- `[x]` Published the dedicated Request a Website page with owner-supplied introduction and preserved Supabase/Guest submission behavior — P-019; owner device/live-Supabase testing remains in CTA §13.
- `[x]` Added the original owner-supplied request counter and three Recently Built request-origin cards — P-020; the curated 247 was replaced by the zero-safe live aggregate in P-028 while the three cards remain.
- `[x]` Expanded the request form and added a database-enforced one-request-per-account rolling seven-day limit — P-021; live Supabase testing remains in CTA §13.
- `[x]` Prepared the free-first Brevo/Supabase transactional email foundation and supplied request auto-reply — P-022; account/provider/webhook activation remains in CTA §13.
- `[x]` Published the dedicated Help & Support page with direct email, public support form, private screenshots, bug guidance, and owner notification — P-023; live endpoint/email testing remains in CTA §13.
- `[x]` Added the complete FAQ and six-step How to Use documentation with honest current-state corrections and screenshot placeholders — P-024; owner visual/content confirmation remains in CTA §13.
- `[x]` Published the full About Paragon story, mission, roadmap, values, founder message, team, and contact page — P-025; founder photo and owner visual review remain in CTA §13.
- `[x]` Removed Dev, consolidated Originals around the sole Archive Hub channel, normalized catalogue dates to the August 2026 project start, and corrected active copy — P-026; public Hub documentation was later completed in P-029 while protected operations remain in CTA §13.
- `[x]` Removed obsolete intake uploads and superseded export ZIPs while retaining the complete project and one verified latest bundle — P-027.
- `[x]` Applied owner device-test follow-up: widened all shared large-screen page bodies; replaced native autocomplete; repaired exact-detail Share/QR; rebuilt Updates filters/markers and notifications; added 30-minute Guest transfer/expiry; completed six achievements, live request count/receipt routing, and confirmed Help guide order/icons — P-028; owner device/live-Supabase confirmation remains in CTA §13.
- `[x]` Published Paragon Archive Hub with complete Terms, Community/Cookie policies, developer and Deployed specifications, honest roadmap/status, community membership, updated category families, local-only form preview, catalogue destination, cross-page links, and PWA support — P-029; protected Team/Community/Deployed operations remain future backend work.
- `[x]` Completed full-surface P-030 follow-up: Hub-only page consolidation, four-page/two-script removal, large-screen footer-safe bottom navigation, simplified Search/recent history/request fallback, ten-item Updates pagination, Link/QR cleanup, new achievements, exclusive collections, top theme action, text-arrow removal, and conditional long-form disclosures; owner device review remains in CTA.
- `[x]` Completed P-031: full laptop/Mac iframe shell, mobile New Tab, two-stage Search with inline hint, replacement Updates pages, three-line Detail About, return-to-intent identity flow, staged 22-task achievements, Guest ad-only feed preparation, shared previews for unfinished products, comprehensive AI Brain, and portable single-file handoff; owner live-device/provider testing remains.
- `[x]` Securely refactored the uploaded disguised JavaScript into one local Paragon AI core with active Search intent ranking and Website Detail Q&A, reserved future Tutor/product modes, no browser provider secrets, AI dialog, Brain governance, tests, and PWA support — P-032; external model/backend selection remains in CTA.

### Architecture

- `[x]` Main Archive remains a data-driven SPA; About, Privacy, Terms, Help, Request, and all public Hub documentation/forms are consolidated into one anchored Archive Hub page under the P-030 owner exception.
- `[x]` Project browser-page count is reduced to two: `paragon-archive.html` and `paragon-archive-hub.html`.
- `[~]` Future product pages/modules should follow §4.2 only when each product is built.

### Content and production readiness

- `[~]` Replace placeholder URLs, logos, and generated screenshots as individual products are built.
- `[x]` Front-end authentication clients, Supabase schema, and the narrow transactional-email Edge Function foundation are complete.
- `[~]` Broader backend operations remain deferred; Supabase/Brevo activation, final deployment origin, PWA scope, and production asset strategy remain owner tasks in CTA §13.

## §10. Decision register

| ID | Date | Decision | Reason | Status |
|---|---|---|---|---|
| D-001 | 2026-08-04 | Initially use `index.html`, `style.css`, and `app.js` as working filenames. | Intake decision; superseded by D-040 for export-safe naming. | Superseded |
| D-002 | 2026-08-04 | Preserve `/uploads/` as an untouched baseline. | Enabled safe comparison and recovery through reconstruction; superseded by owner-directed cleanup after v0.26.0. | Superseded |
| D-003 | 2026-08-04 | Keep CTA inside `SOP.md`, initially producing exactly SOP and EOP. | Superseded only for document count by D-097/P-031; CTA remains inside SOP. | Partially superseded |
| D-004 | 2026-08-04 | Do not immediately split the working SPA merely to create more files. | Avoids unrequested breakage; pages will be extracted when §4.2 applies. | Active |
| D-005 | 2026-08-04 | Preserve current visuals and behavior during bug fixing. | Explicit owner instruction not to spoil the existing site. | Active |
| D-006 | 2026-08-04 | Store catalogue records in `data/sites.js`, loaded before `app.js`. | Keeps twenty-eight records out of application logic and avoids hard-coding details in `index.html`. | Active |
| D-007 | 2026-08-04 | Bind related old/new categories through category families while preserving each exact visible category label. | Connects new products to existing products without renaming or duplicating them. | Active |
| D-008 | 2026-08-04 | Label unrated additions as “New” and show an empty review state. | Avoids inventing ratings or customer reviews. | Active |
| D-009 | 2026-08-04 | Use an in-memory view-state stack for the detail `← Back` control. | Restores source tab, prior detail, Search context, and exact scroll without forcing every detail into separate markup. | Active |
| D-010 | 2026-08-04 | Search categories use exact visible category labels; `All` is the only unrestricted scope. | Matches the owner’s category-first search rule and avoids silently broadening a chosen category through category families. | Active |
| D-011 | 2026-08-04 | Current descriptive search is weighted local keyword matching, not AI. | Improves discovery now while keeping the future AI requirement honest and separately scoped. | Active |
| D-012 | 2026-08-04 | Daily and weekly rankings use stable seeded demo totals plus browser-local views until a backend exists. | Enables deterministic front-end behavior without falsely claiming site-wide analytics. | Temporary |
| D-013 | 2026-08-04 | Daily snapshots follow the browser’s local calendar date; weekly snapshots begin Monday and use the preceding Monday–Sunday period. | Owner explicitly confirmed Monday–Sunday for Trending. | Confirmed |
| D-014 | 2026-08-04 | Full Trending is an in-page dialog with horizontal rows stacked vertically. | Satisfies `See all`, preserves the Website-tab context, and matches the owner’s requested row arrangement. | Active |
| D-015 | 2026-08-04 | Daily Staff ranking is ascending by preceding-24-hour views, numeric rating, review count, total views, then name. | Implements the requested opposite of popularity while providing deterministic tie-breaking. | Active |
| D-016 | 2026-08-04 | Unrated `New` sites count as rating zero in Staff opportunity ranking. | Avoids inventing ratings and gives unrated/underexposed websites a chance to surface. | Active |
| D-017 | 2026-08-04 | Full Staff Picks uses the existing in-page ranked-list dialog pattern. | Makes `See all` functional while preserving context and avoiding another duplicated page flow. | Active |
| D-018 | 2026-08-04 | Production ranking must support both global and personalized modes. | Owner explicitly confirmed both archive-wide and signed-in-user experiences are required. | Confirmed |
| D-019 | 2026-08-04 | Remove the public All Websites A–Z section and lead discovery through categories. | Protects catalogue-size privacy while keeping websites discoverable. | Active |
| D-020 | 2026-08-04 | Recently Added sorts by `addedAt` descending, then `addedSequence` descending, then name. | Enforces newest-to-oldest ordering and deterministic same-date ordering. | Active |
| D-021 | 2026-08-04 | Inherited addition dates are provisional until owner history is supplied. | Existing records had version dates but no authoritative addition timestamps; superseded by the August 2026 normalization in D-070. | Superseded |
| D-022 | 2026-08-04 | Use one JavaScript tab-navigation path and remove inline tab handlers. | Eliminates duplicate transitions and keeps ARIA/hash state coherent. | Active |
| D-023 | 2026-08-04 | Bookmarks, reviews, visits, theme, and notification preferences persist locally until backend sync exists. | Provides honest working front-end behavior without pretending production accounts are connected. | Temporary |
| D-024 | 2026-08-04 | Backend/content-dependent actions use non-jumping toast feedback instead of alerts or fake success. | Preserves usability and truthfulness while required owner/backend input remains pending. | Active |
| D-025 | 2026-08-04 | Desktop bottom navigation is capped at 520px and centered. | Improves modern desktop proportion while retaining the mobile floating-navigation pattern. | Active |
| D-026 | 2026-08-04 | Curated non-generated update events live in `data/updates.js`. | Keeps Maintenance, Announcement, and Featured/Promoted content maintainable and separate from renderer logic. | Active |
| D-027 | 2026-08-04 | Update type selection is single-select with `.active` and `aria-pressed` synchronized from one state value. | Prevents stale pressed visuals and supports future delegated controls. | Active |
| D-028 | 2026-08-04 | Saved-site update stars require both a local login session and a bookmark match. | Matches the owner’s signed-in/saved requirement without exposing personalized state while logged out. | Active |
| D-029 | 2026-08-04 | Update timeline uses mirrored left/right rails and dots. | Centers cards visually while preserving the timeline identity the owner liked. | Active |
| D-030 | 2026-08-04 | Supabase is the production authentication and shared-state provider. | Owner selected Supabase for Google OAuth, email/password, database, and RLS. | Confirmed |
| D-031 | 2026-08-04 | Paragon products use same-origin path-based hosting. | Owner selected paths, enabling one persisted browser session and shared progress API across products. | Confirmed |
| D-032 | 2026-08-04 | Guest personal state uses only `sessionStorage`. | Owner selected session-only Guest behavior; no Guest personal data is persisted to Supabase/localStorage. | Confirmed |
| D-033 | 2026-08-04 | Authenticated personal state is one RLS-protected JSONB row per user. | Supports shared bookmarks, reviews, visits, preferences, and arbitrary product/course progress while keeping the initial schema flexible. | Active |
| D-034 | 2026-08-04 | Public auth code uses Supabase REST directly without a CDN dependency. | Keeps the existing dependency-light architecture and works across all same-origin product paths. | Active |
| D-035 | 2026-08-04 | Creator demo is identified by configured email after real Supabase authentication; its password is never shipped. | Meets the owner-only demo requirement without exposing a plaintext credential or creating a fake login bypass. | Confirmed |
| D-036 | 2026-08-04 | Member-since uses Supabase `created_at`, then synced first-activation fallback. | Preserves the original account registration date consistently across devices. | Active |
| D-037 | 2026-08-04 | Collections live in the same authenticated/Guest personal-state schema. | Makes collection creation persist with the same identity rules as bookmarks and progress. | Active |
| D-038 | 2026-08-04 | Detail Open progress is a launch/preparation animation unless real same-origin load events are available. | Cross-origin browser security does not expose trustworthy remote page-load percentages. | Active |
| D-039 | 2026-08-04 | Bottom navigation hides whenever the footer intersects the viewport. | Superseded at widths 700px+ by D-087/P-030; phone behavior remains active. | Partially superseded |
| D-040 | 2026-08-04 | `paragon-archive.html` is the canonical shell filename. | Distinctive export identity is safer than a generic `index.html` during flattened uploads. | Active |
| D-041 | 2026-08-04 | All code files carry export identity/path headers. | Allows a later agent to reconstruct folders regardless of upload location/name. | Active |
| D-042 | 2026-08-04 | Detail screenshots use one reusable five-state lightbox system. | Automatically applies fullscreen, swipe, arrows, X, caption, and dots to every data-driven website. | Active |
| D-043 | 2026-08-04 | About tags are generated from structured data and keyword rules. | Gives every current/future site useful tags without manually duplicating tag arrays. | Active |
| D-044 | 2026-08-04 | PWA uses a root service worker and bundled PNG icons. | Keeps install/offline scope aligned with same-origin path-based products. | Active |
| D-045 | 2026-08-04 | Usernames are unique Supabase profile records created by an auth-user trigger. | Makes the username system real rather than display-only metadata. | Active |
| D-046 | 2026-08-04 | Authenticated website requests submit to Supabase; Guest requests remain session drafts. | Preserves the session-only Guest rule and avoids anonymous-spam insert policy. | Active |
| D-047 | 2026-08-04 | Review votes persist as per-user personal state in the initial version. | Provides working vote controls now; global aggregation may later move to a dedicated votes table. | Temporary |
| D-048 | 2026-08-04 | QR images use a configurable public QR service. | Superseded by D-074 after owner testing found the remote display unreliable. | Superseded |
| D-049 | 2026-08-04 | Website Open loads real URLs in a sandboxed iframe preview when available. | Allows load-event completion and in-app preview while retaining New Tab fallback for frame-blocked sites. | Active |
| D-050 | 2026-08-04 | The supplied 44-site list lives in `data/catalogue-expansion.js` and merges by exact case-insensitive name. | Prevents duplicates, preserves unrelated catalogue entries, and keeps the owner list maintainable. | Active |
| D-051 | 2026-08-04 | Supplied feature lists replace current update/features for matching names and populate Key Features. | Treats the latest owner catalogue as the current product-detail source of truth. | Active |
| D-052 | 2026-08-04 | Catalogue entries 45–100 live in a second ordered expansion file. | Preserves the numbered owner batches and keeps each large import readable and independently reconstructable. | Active |
| D-053 | 2026-08-04 | Review sorting/filtering uses client-side view models over the current combined review set. | Preserves local/auth state and avoids unnecessary full-detail rerenders. | Active |
| D-054 | 2026-08-04 | Rating bars animate only when entering view, with reduced-motion fallback. | Improves visual feedback without forcing motion for all users. | Active |
| D-055 | 2026-08-04 | Write Review uses a bottom-sheet dialog. | Matches mobile interaction expectations while preserving desktop accessibility and validation. | Active |
| D-056 | 2026-08-04 | Paragon Tutor is Education; Paragon Vibe is Entertainment. | Owner explicitly corrected the latest catalogue grouping. | Confirmed |
| D-057 | 2026-08-04 | Handoff includes front-end auth clients and Supabase schema only; backend operations are deferred. | Owner requested website creation to begin next without further backend implementation here. | Confirmed |
| D-058 | 2026-08-04 | Final handoff is a folder-preserving ZIP plus source headers/SOP manifest. | Reduces reconstruction risk after leaving the agent chat environment. | Active |
| D-059 | 2026-08-04 | Privacy policy lives on `paragon-privacy-security.html`. | Superseded by the owner-confirmed Hub-only consolidation in D-086/P-030. | Superseded |
| D-060 | 2026-08-04 | Optional analytics/tracking/ads default off until explicit consent. | The exported front end does not currently load those services and must not imply consent. | Active |
| D-061 | 2026-08-04 | Delete Account remains an honest pending secure-backend workflow. | Supabase browser anon credentials cannot securely perform administrative account deletion. | Temporary |
| D-062 | 2026-08-05 | Request a Website initially used the dedicated page `paragon-request-website.html`. | Superseded by Hub anchor `#request-site` and consolidated controller in D-086/P-030; the in-shell compatibility dialog remains. | Superseded |
| D-063 | 2026-08-05 | The request page initially published the owner-supplied count of 247 and highlights Vibe, Sounds, and Journal as request-origin builds. | The three proof cards remain; the curated count was superseded by D-078/P-028. | Partially superseded |
| D-064 | 2026-08-05 | Website-request submission requires authentication and is limited to one request per account in every rolling seven-day period; Guest can save only a session draft. | Owner selected account-only enforcement after clarification. This prevents logout→Guest bypass without unreliable IP/device fingerprinting; a database trigger with an advisory lock is authoritative. | Confirmed |
| D-065 | 2026-08-05 | Use a free-first Brevo Email API/SMTP route with Supabase outbox, Database Webhook, and protected Edge Function; Gmail remains sender/reply inbox during initial setup. | Owner instructed the easiest path with no paid dependency. This is the narrow approved exception to previously deferred backend work; secrets remain server-side. | Confirmed |
| D-066 | 2026-08-05 | Google monetization is a future consent-aware AdSense application, not payment merely for having users. | Google reviews site ownership, original content, audience, and policy compliance; scripts must not be added before approval and consent integration. | Active |
| D-067 | 2026-08-05 | Help & Support uses a public form through a service-role Edge Function, private screenshots, email-based rate limiting, and owner notification without bot reply. | The secure behavior remains active; only its former dedicated HTML/controller location was superseded by Hub consolidation. | Partially superseded |
| D-068 | 2026-08-05 | FAQ/documentation uses the owner’s supplied topics but is corrected where necessary to match current implementation and privacy rules. | Prevents false claims about completed account deletion, persistent Guest data, iframe compatibility, production notification delivery, analytics scripts, and a public total/full-grid inventory. | Active |
| D-069 | 2026-08-05 | About Paragon initially used a static direct page with the owner story/roadmap/founder placeholder. | Content and truth rules remain; the standalone page location was superseded by Hub `#about` in D-086/P-030. | Partially superseded |
| D-070 | 2026-08-05 | Remove Dev; Dev Tools inherits 💻. Originals contains only Paragon Archive Hub; Random→Tools, Time Capsule→Lifestyle, Alive→Health, and Paragon Originals→Creative. All active catalogue dates begin August 1, 2026 or later. | Owner explicitly requested category consolidation, gave discretion for moved sites, defined Archive Hub as the Archive’s only sibling/channel, and rejected pre-project 2024/2025 dates. | Confirmed |
| D-071 | 2026-08-05 | Retain only `/paragon-archive/` and one latest verified export; remove `/uploads/` and every superseded root export ZIP. | Owner explicitly requested fewer files. Reconstructed sources, export identities and the current bundle make duplicate intake/old bundles unnecessary. | Confirmed |
| D-072 | 2026-08-05 | Protect the approved Galaxy S5/Pixel layout while shared Archive/legal/request/help/about bodies expand fluidly through tablet, laptop, and MacBook widths. | Owner passed both phones but failed 800–1440px bodies as too narrowly centered. | Confirmed |
| D-073 | 2026-08-05 | Search autocomplete is a custom horizontal in-site card rail shown only after the first character; native datalist/browser autocomplete is disabled. | Owner selected clarification 1B and rejected suggestions that cover the Search interface. | Confirmed |
| D-074 | 2026-08-05 | Share and QR always use the canonical Archive detail deep link, while Open/New Tab alone uses a product destination; QR generation is bundled locally. | Ensures recipients/scanners reach the exact detail and removes unreliable remote QR display. | Confirmed |
| D-075 | 2026-08-05 | Updates combines one type, exact category, and exact local date; the former per-website selector is removed. Decorative timeline rails/dots use the transition-color system. | Reduces dropdown size, adds requested date intersection/empty behavior, and fixes the static right marker. | Confirmed |
| D-076 | 2026-08-05 | Authenticated notifications begin with one welcome item, then sync events from the activation calendar day forward; normal items expire after 24 hours. Future real AdSense items may use 72 hours, but no fake ads are created. | Owner selected clarification 3A and prohibited past-update backfill for new accounts. | Confirmed |
| D-077 | 2026-08-05 | A Guest session expires after 30 continuous minutes hidden/offline. A still-live Guest transfers personal state into the authenticated account; explicit end/expiry discards it. | Owner selected clarification 2B, balancing temporary privacy with protection from brief app/network interruptions. | Confirmed |
| D-078 | 2026-08-05 | Website-request count comes from a zero-safe public aggregate RPC. Contact email routes receipt to Brevo outbox; no email routes it to authenticated in-app notifications. | Replaces the curated 247 and follows the optional-contact decision without exposing request rows. | Confirmed |
| D-079 | 2026-08-05 | Account shows six achievements: five task prerequisites plus clickable final `More Soon`; Help guide order/icons are Account ⚙️, Create Account 👤, Archive ◈, Open Website 🌐, Save 🔖, Stay Updated ↻. | Owner confirmed clarification 4A and supplied the revised guide sequence. | Confirmed |
| D-080 | 2026-08-05 | Publish the complete Archive Hub in one direct `paragon-archive-hub.html` document with independently linkable sections rather than duplicating multiple policy pages. | The supplied content is one unified Hub reference; anchors keep Terms, Community, Cookies, Developers, Deployed, Roadmap, Status, Membership, and Categories bookmarkable without unnecessary files. | Confirmed |
| D-081 | 2026-08-05 | Preserve policy intent but label every unbuilt Community, Deployed, Team, analytics, moderation, payment, upload, dashboard, and monitoring system as planned/prepared rather than operational. | P-009 honest-functionality rules and the August 5, 2026 date prohibit false production claims. | Active |
| D-082 | 2026-08-05 | Add Deployed as a visible planned empty Archive category and publish its ten future subcategories; do not add fabricated third-party sites. | Implements the owner’s updated category documentation safely before protected submission/moderation infrastructure exists. | Confirmed |
| D-083 | 2026-08-05 | The Deployed submission layout is a local-only validation preview that never uploads/sends data; production submission requires a protected future backend. | ZIP/file uploads, malware review, moderation, and developer authorization cannot be handled securely by the public browser alone. | Active |
| D-084 | 2026-08-05 | August 2027 launch/first-100 milestones remain planned; unsupported 65/20/10 progress values and `ALL SYSTEMS OPERATIONAL` are not published. | Those claims would be chronologically or operationally false on August 5, 2026. | Active |
| D-085 | 2026-08-05 | Paragon Originals category-family discovery uses the latest supplied `🌟`, while the sole Paragon Archive Hub website retains its distinct `◈` product icon. | Reconciles the newest category list with the established Hub identity. | Confirmed |
| D-086 | 2026-08-05 | Consolidate About, Privacy, Terms, Help, and Request into one Archive Hub page; remove four standalone HTML pages and merge Request/Help controllers into `archive-hub.js`. | Owner selected `hub-only` to reduce files while keeping the canonical Archive app separate. | Confirmed |
| D-087 | 2026-08-05 | At widths below 700px, bottom navigation still hides over the footer; at 700px+, it stays visible and shifts above the visible footer height. | Owner selected `shift-above` so full-screen tablet/desktop pages retain navigation without covering footer content. | Confirmed |
| D-088 | 2026-08-05 | Search has no category-filter or Browse-by-Category controls; empty Search shows device/session recent history, and no-match states route to Hub Request. | Owner prefers one input plus custom autocomplete; future AI intent matching remains deferred. | Confirmed |
| D-089 | 2026-08-05 | Updates initially revealed filtered results cumulatively in ten-entry increments. | Superseded by page-replacement Previous/View more behavior in D-099/P-031. | Superseded |
| D-090 | 2026-08-05 | Achievements initially used five tasks plus one final More Soon, with Progress Starter as a final prerequisite. | Superseded by staged achievement groups in D-101/P-031. | Superseded |
| D-091 | 2026-08-05 | One website may belong to only one collection; choosing/creating another collection moves it and removes all duplicate membership. | Owner explicitly prohibited multi-collection membership. | Confirmed |
| D-092 | 2026-08-05 | Top Account shortcut becomes synchronized light/dark control. Decorative text arrows are removed while essential carousel/lightbox chevrons remain. | Account already exists in bottom navigation; owner selected text-only arrow removal. | Confirmed |
| D-093 | 2026-08-05 | Long Hub/About/Privacy/Terms/Help/Request information uses conditional disclosure generated only when content exceeds the collapsed height. | Reduces page bulk without hiding short content behind unnecessary controls. | Confirmed |
| D-094 | 2026-08-05 | Notification records support future protected Team-created `ad` and `promotion` types with sponsored disclosure and 72-hour expiry; no public creator or fake campaign is added. | Records the owner’s future advertising workflow without bypassing protected roles, consent, or monitoring requirements. | Active |
| D-095 | 2026-08-05 | Laptop/MacBook iframe preview uses the full viewport; mobile keeps Open in New Tab visible beside close. | Owner passed all other responsive cases and identified only these preview-shell issues. | Confirmed |
| D-096 | 2026-08-05 | Search uses one Back control, a separate Enter-driven Results mode, silent no-match autocomplete, and deterministic inline name completion accepted by Tab/ArrowRight. | Matches the owner’s Play-Store-style flow and separates hints from final results/no-match guidance. | Confirmed |
| D-097 | 2026-08-05 | Add `docs/AI-BRAIN.md` as the third owner-requested document containing complete governed knowledge and a future retrieval/API/backend blueprint. | The owner wants one deep AI “brain”; current truth does not justify claiming a trained model exists. | Confirmed |
| D-098 | 2026-08-05 | All unfinished catalogue products share one category-aware `paragon-product-preview.html?site=...` destination; Hub keeps its real page. | Gives every iframe useful consistent content without creating 105 duplicated placeholder codebases or claiming completion. | Confirmed |
| D-099 | 2026-08-05 | Updates shows one filtered ten-item page at a time; View more replaces it with the next page and Previous restores the prior page. | Owner explicitly rejected cumulative expansion. | Confirmed |
| D-100 | 2026-08-05 | Personal-action identity redirects store an allowlisted session intent, source detail/tab/scroll/history, expire after 30 minutes, and resume after Guest/Email/Google activation. | Prevents users losing context while avoiding arbitrary callback execution. | Confirmed |
| D-101 | 2026-08-05 | Achievements contain 22 tasks in stages of five, with a final two-task stage; each completed stage unlocks the next and Progress Starter begins stage two. | Owner clarified that Progress is not a stage-one prerequisite and requested real remaining counts. | Confirmed |
| D-102 | 2026-08-05 | Guest notification feed may render only protected public `ad`/`promotion` records; authenticated accounts additionally receive welcome/updates. Public campaign read state stays in personal state. | Implements Guest ad visibility without leaking account-only notifications. | Confirmed |
| D-103 | 2026-08-05 | Produce a standalone machine-readable portable JSON bundle containing every project file, encoding, checksum, manifest, and reconstruction instructions in addition to the ZIP. | Owner cannot re-import ZIP directly and needs one uploadable file for another agent. | Confirmed |
| D-104 | 2026-08-05 | Dark mode displays the sun icon as the action to switch light; light mode displays the moon action to switch dark, synchronized with the environment. | Corrects the icon/action meaning identified in owner testing. | Confirmed |
| D-105 | 2026-08-05 | Use one Paragon AI core with allowlisted modes rather than separate AIs; Search and Website Detail are active first, Tutor/product/code/image/voice remain reserved. | Owner explicitly wants one AI serving different functions everywhere over time. | Confirmed |
| D-106 | 2026-08-05 | Do not ship the uploaded browser-direct multi-provider prototype unchanged; migrate only its safe intent into `/ai/paragon-archive-ai.js` and delete the disguised upload. | Prototype embedded a token-like value, browser API-key storage/direct provider calls, fake Request success, unsafe code preview, and incomplete catalogue. | Active |
| D-107 | 2026-08-05 | First active AI release is local retrieval-grounded Search ranking plus current-site Detail Q&A using live catalogue/AI Brain facts. | Delivers useful behavior now without pretending external inference/training exists. | Confirmed |
| D-108 | 2026-08-05 | Future external inference must use a protected backend/Edge endpoint; browser config contains only a disabled endpoint path and never a provider secret. | Protects keys, centralizes rate limits/safety/logging, and follows the AI Brain security model. | Active |
| D-109 | 2026-08-17 | Users may write unlimited reviews per website and edit or delete each one individually; helpful/not-helpful counts show only real personal votes starting from zero — seeded/made-up vote numbers are prohibited now and in the future; Ratings & Reviews gains a text/reviewer/star search filter. | Owner explicitly requested multi-review with per-review editing, honest zero-based votes, and review search. | Confirmed |
| D-110 | 2026-08-17 | Results-mode no-match consults the local Paragon AI core with the user's exact words: similar-idea suggestions render under an explicit Paragon AI block with match reasons and confidence, followed by the Request fallback; when the AI finds nothing it says so honestly and leads directly to Request. | Owner requested real AI suggestions for any typed/mistyped/vague idea instead of an immediate request-only dead end. | Confirmed |
| D-111 | 2026-08-17 | Archive Hub becomes a three-page product — Documentation (all former landing content and anchors), Community, and Team — behind a persistent top page navigation. Community join requires a real authenticated account, never Guest, and links membership to the account exactly once; Team is an honest protected-login template that sends no credentials until the backend exists. | Owner selected the Hub as the first real product build and supplied the three-tab structure and membership rules. | Confirmed |
| D-112 | 2026-08-17 | Add "Paragon Templates" (owner working name "Website Template") as catalogue record #107 under Dev Tools: a future template marketplace with purchase, free Archive hosting, and paid custom-hosting upgrade — all labelled planned/previewOnly. | Owner requested the product and allowed renaming; payment/hosting are future work. | Confirmed |
| D-113 | 2026-08-17 | Achievements expand from 22 to 30 tasks in six stages of five, adding Hub visits, QR creation, Paragon AI questions, Results searches, social sharing, and notification-reading tasks with real tracked counters. | Owner requested more achievements that drive Hub, tools, and social engagement. | Confirmed |
| D-114 | 2026-08-17 | Website Detail Share uses the device-native share sheet when available and otherwise an in-app share sheet with WhatsApp, Telegram, X, Facebook, Messenger, LinkedIn, Reddit, Email, SMS, and Copy link targets. | Owner requested real sharing into installed messaging/social apps on every platform. | Confirmed |
| D-115 | 2026-08-17 | The Archive Hub gains a fourth default Home landing page implementing the owner's supplied layout, with a generated cinematic hero image, quick cards, honest live stats, previews, and Official Documents chips; landing "See all →" arrows are an owner-approved exception to D-092; the topbar adds Hub search and a Team Login shortcut. | Owner supplied the exact landing structure and confirmed Documentation keeps all moved content. | Confirmed |
| D-199 | 2026-08-26 | REVIEW-COUNT HONESTY COMPLETED (D-162 endgame): every DISPLAYED review count across trending, staff picks, recently added, detail stats, Hub stats, and the Team desks now reads real user-written reviews only (realReviewCount + the paragonArchive.reviewMirror.v1 mirror + guest-session merge); the inherited catalogue sample arrays can never surface as counts anywhere. | Owner's P-097 justice order. | Confirmed |
| D-198 | 2026-08-26 | AUTO DAY/NIGHT THEME: with no manual choice the platform follows the clock (06:00–18:00 light, otherwise dark) and re-checks every 10 minutes without user action, on the Archive, Hub, and Team desk; a manual toggle marks mode=manual and always wins. | Owner's P-097 order. | Confirmed |
| D-197 | 2026-08-26 | INSTALL GATEWAY POPUP: "Install Paragon Archive & app permissions" opens one privacy-style popup holding every permission toggle (phone notifications with instant test ping, camera, microphone, location — ONE origin-wide setting for every Paragon website, each requesting the real browser permission) plus the Install button; the Share button now shares a ?install=1 link that opens the popup on arrival. | Owner's P-097 install UX. | Confirmed |
| D-196 | 2026-08-26 | PREVIEW WINDOW MANAGER (MS-Word-style): every OPEN is a window with a titlebar (minimize, maximize/restore, open-in-new-tab, close); a NEW window always opens maximized while the PREVIOUS one shrinks to a fitted PIP card instead of being buried; closing restores the previous window EXACTLY as the user left it (its maximize choice is remembered); minimized windows sit on a bottom taskbar. | Owner's P-097 iframe order. | Confirmed |
| D-195 | 2026-08-26 | MAINTENANCE SYSTEM: (a) WHOLE-PLATFORM lockdown — the Team Settings maintenanceMode toggle instantly closes every public surface (Archive, Hub, previews, board, portal) behind the maintenance screen, and no route can override it; (b) PER-SITE maintenance — "Mark Under Review" now means the website truly cannot be used: OPEN shows the maintenance card, the detail shows an honest banner. The maintenance art (D-153) is finally live in-product. | Owner's P-097 maintenance order. | Confirmed |
| D-194 | 2026-08-26 | TEAM ROLE SYNC + ROLE-FILTERED DESK: setRole broadcasts paragon:role-change so the sidebar selector, dashboard selector, and topbar chip stay in sync no matter which side changes; the consolidated desk router enforces the page-access law per panel (denied desks never render — no more click-then-denied stress), and the sidebar foot links every public surface the desks manage (Updates feed, Community Board, Developer Portal, public roadmap). | Owner's P-097 sync orders. | Confirmed |
| D-193 | 2026-08-26 | ACHIEVEMENT BADGES 10/30: first-visit through explorer-five produced with the owner icon pipeline and wired into the achievements grid (emoji fallback remains for the unproduced 20). | Owner's P-097 image order. | Confirmed |
| D-192 | 2026-08-26 | ICON-FACED CARDS: trending, staff-pick (featured + minis), and recently-added cards now use the website's real icon art AS the card face (the gradient tile is retired for iconed sites and remains only as the honest fallback); paragonTile chips removed (D-172). | Owner's P-097 card-face order. | Confirmed |
| D-191 | 2026-08-26 | CONSOLIDATED TEAM DESK + WASTE SWEEP (owner file-reduction order): all 29 team pages merged into ONE routed shell (team/desk.html? ?page=, 30 panels incl. the new Construction Desk page) — team folder 32 → 6 files, whole project 276 → 244 files (69 code files); the Construction Desk becomes its own sidebar destination with per-row "Mark under construction / Retire construction / Construction page" actions wired to the public pages; removed community-schema.sql (executed live 2026-08-18) and the cancelled quiz take-away export; schema.sql relabelled an EXECUTED archive reference. The ~100 websites will be BUILT INSIDE THIS PROJECT (owner reversed the separate-agent strategy after learning ads cannot inject into other domains). | Owner's P-097 consolidation + build-here decision. | Confirmed |
| D-206 | 2026-08-26 | DEPLOYMENT + CHANGES TRACKING: docs/DEPLOYMENT-GUIDE.md (GitHub → Vercel/Netlify free, SPCK workflow, upload limits ~10-20 files/message or one zip, custom-domain unlocks, the $5-once optional Chrome-extension frameless-app path) and docs/CHANGES.md (the per-turn changed-files list the owner uploads). The agent cannot push to GitHub directly — the guide is the procedure. | Owner's P-098 deployment questions. | Confirmed |
| D-207 | 2026-09-03 | Nine in-project product sites under /sites/ with shared quiz-family kit; personal-shopper maps to Paragon Shop; meal-planner is a Recipe companion tool. | P-098 next-turn plan + D-191 build-here. | Confirmed |
| D-208 | 2026-09-03 | Catalogue siteUrls for the eight live products point at /sites/… with honest buildProgress 55–80 (not 100 until owner demo). | Site Build Kit acceptance checklist. | Confirmed |
| D-209 | 2026-09-03 | Unfinished-preview fixture LIVE_SITES expanded to include the eight newly opened products. | Preserve P-009 honesty for remaining concept previews. | Confirmed |
| D-210 | 2026-09-03 | Coins backend SQL (wallets/ledger/RPCs) is multi-device source of truth; localStorage remains offline-first fallback. | Owner asked for all SQL to run ASAP. | Confirmed |
| D-211 | 2026-09-03 | Coin withdrawals = manual team naira payout + debit mirror/SQL complete RPC — no automated bank API. | Free-tier / Nigeria bank-transfer logistics. | Confirmed |
| D-212 | 2026-09-03 | Product sites deepen with local engines even when skills describe React/API; free build law holds. | Site Build Kit + D-191. | Confirmed |
| D-213 | 2026-09-03 | When Arena attachments fail, owner pushes skills to GitHub `uploads/`; agent pulls from main. | Owner workflow. | Confirmed |
| D-214 | 2026-09-03 | Production coin target ₦1=1 redeemable coin; packs 500/1000/5000; real_money_enabled default false. | Coins master build spec. | Confirmed |
| D-215 | 2026-09-03 | SQL verification is owner-run VERIFY queries; sandbox has no DNS to Supabase. | Platform network limit. | Confirmed |
| D-216 | 2026-09-03 | Skill complete = all browser-capable engines; native/server rows stay honest not-faked. | Free build law. | Confirmed |
| D-217 | 2026-09-03 | Coins Phase 2 = ledger RPCs + FE gates; provider webhooks deferred to owner Phase 3. | Master spec. | Confirmed |
| D-218 | 2026-09-03 | buildProgress 80–92 after depth; 100 only after owner demo. | Site Build Kit. | Confirmed |
| D-219 | 2026-09-03 | Sandbox cannot DNS-resolve Supabase; Team desk probe / Dashboard is SQL truth. | Network limit. | Confirmed |
| D-220 | 2026-09-03 | Phase 3 webhooks provider-agnostic; secrets only in Edge; real_money stays gated. | Master §44–46. | Confirmed |
| D-221 | 2026-09-03 | Uploads “complete” = browser engines + coins ph1–4; native/API rows not faked. | Free build law. | Confirmed |
| D-222 | 2026-09-03 | Phase 4 competition settle is server/team only; browser never referee for money. | Master §6–8. | Confirmed |
| D-223 | 2026-09-03 | SQL assurance via owner Script A / Team probe / GH Actions anon; never service_role in git. | Security + network. | Confirmed |
| D-224 | 2026-09-03 | Achievement badges 1–30 complete art set wired in BADGE_ART. | IMAGE-REQUIREMENTS §1.6. | Confirmed |
| D-225 | 2026-09-03 | Achievements expand to 50 (ads, top-10 leaderboard, engagement). | Engagement growth. | Confirmed |
| D-226 | 2026-09-03 | Ad badges use real impressions/taps; reserved slots until AdSense; no fake revenue. | P-009 / D-179. | Confirmed |
| D-227 | 2026-09-03 | Engagement leaderboard is practice rank; money comps stay server-settled. | D-222. | Confirmed |
| D-228 | 2026-09-03 | OPay/Moniepoint preferred payment rails; Flutterwave not required. | Coin master §44–45; owner intent. | Confirmed |
| D-229 | 2026-09-03 | Coins SQL phases 1–5 complete; remaining = owner activation not missing phase file. | COINS-PHASES.md. | Confirmed |
| D-230 | 2026-09-03 | Stage 1 foundation complete in repo; real_money stays OFF. | Master Stage 1. | Confirmed |
| D-231 | 2026-09-03 | Stage 2 waits for owner brief; do not rebuild completed phases. | Workflow. | Confirmed |
| D-205 | 2026-08-26 | PARAGON COINS CORE: balance in personal state, Account coin stat + styled shop popup (₦500/₦1,000/₦5,000 packs at placeholder ₦1=2), buy requests -> Team settings panel (super-admin approve/reject) -> paragonArchive.coinCredits.v1 mirror -> user's device credits with a toast; addCoins/spendCoins helpers + history. Full economics + games/quiz integration rules + the owner's ChatGPT heads-up prompt recorded in docs/COIN-SYSTEM.md (creator-quiz no-win rule, bet-only leaderboards, weekly top-10 rewards, withdrawal flow). | Owner's P-098 coin order. | Confirmed |
| D-204 | 2026-08-26 | SITE SPECS FROM OWNER SKILLS: all 9 uploaded skill files (recipe-creator, meal-planner, file-converter, invoice-generator, flashcard-generator, personal-shopper, photo-editor, resume-maker, travel-assistant) merged into docs/site-specs/<slug>.md — verbatim use/never-use rules + the FREE adaptation law (vanilla HTML/CSS/JS + localStorage engines replacing the skills' full-stack/API/React architecture; adapters ready for free APIs). Websites build in-project under /sites/<slug>/ in the quiz layout family. | Owner's P-098 skill uploads. | Confirmed |
| D-203 | 2026-08-26 | RxLife Network + Pharmapaedia added to the catalogue as honest Deployed-family Paragon products (0% build, preview route, no fake progress; AI Brain rows added). | Owner's P-098 order. | Confirmed |
| D-202 | 2026-08-26 | SEARCH KEYWORD LAYER: ROUTE_KEYWORDS maps the exact words users type (cook, anki, weather, deal, cv, pdf…) to the website that owns them, boosting with an honest "You searched: …" reason on top of the intent routes. | Owner's P-098 search order. | Confirmed |
| D-201 | 2026-08-26 | MAXIMIZE = TRUE FULLSCREEN: the preview window's maximize now claims the whole screen (all four sides, edge-to-edge CSS + the Fullscreen API where allowed); minimize keeps the previous fitted-PIP behaviour. | Owner's P-098 maximize clarification. | Confirmed |
| D-200 | 2026-08-26 | TEAM DESK LINK REPAIR + PLAN VERIFICATION: every runtime "View" link (ticket, user/member profiles, view-user) re-routed to desk.html?page=… (the consolidation had orphaned them — owner-reported); the pasted A1–A5/B1–B5 plan verified COMPLETE (board + comments + reports + moderation loop, dev portal + applications + 8-point gate + Deployed merge, mini profiles, guidelines) including live backend sync. | Owner's P-098 bug report + plan. | Confirmed |
| D-190 | 2026-08-25 | TEAM ROADMAP TRUTH: the Team roadmap desk gains PUBLIC MILESTONE CHECKLISTS (edit wording, tick done, add/remove items, publish/reset) stored in paragonTeamRoadmapMilestones.v1; the Hub roadmap renders those exact lists + recomputed percentages once the Team publishes (HTML defaults remain the honest fallback) — the roadmap is now genuinely made from the Team side. | Owner's P-096 linkage order. | Confirmed |
| D-189 | 2026-08-25 | UPDATES A–Z TEAM CONTROL: every public Updates event (catalogue additions, product updates, announcements) mirrors 1:1 into the Team desk's "PUBLIC FEED — EVERYTHING A TO Z" manager (same ids); the Team can edit any entry's wording or hide/restore it (paragonTeamUpdateOverrides.v1) and the public feed + notifications obey — as if the Team authored every entry from its side. ParagonTeamPrompt added to team/nav.js as the dialog-law prompt replacement. | Owner's P-096 A-to-Z order. | Confirmed |
| D-188 | 2026-08-25 | CONSTRUCTION DESK: the Team websites desk owns every website's real build percentage, public team note, and construction-surface retirement (paragonTeamConstruction.v1); the public under-construction page obeys instantly (progress bar + team note + retired state). The merged percentage pill from P-094 is REVERTED per owner order back to the original full-width bar with the percentage line beneath it, restyled. | Owner's P-096 revert + linkage order. | Confirmed |
| D-187 | 2026-08-25 | INTENT-TRAINED SEARCH AI: the owner's suggest/never rules are codified as INTENT_ROUTES (boost + never + neverAlways tiers) inside rankWebsites — recipe/meal-planning boundaries (medical dietary and health-data never suggest), file-conversion vs invoice, flashcards vs deep-research/data-analysis, shopping picks vs market-research/budgeting, trip planning vs booking transactions, resumes, photo-edit vs image-generation (ambiguous queries surface both so the user picks), budgeting. 30 automated intent tests green. | Owner's P-095 training material. | Confirmed |
| D-186 | 2026-08-25 | BUG FIXES (real-DOM jsdom harness): the hub pages module had silently died since the Home-nav removal (stale `hub-top-nav` existence guard) — see-all, join-now, quick cards, stats and search were all dead; the hub Back handler cross-scope ReferenceError is fixed with shared paragonHubCurrentView state; the splash now fires FIRST at DOMContentLoaded (it previously waited for the identity check), holds 5 s unconditionally (prefers-reduced-motion no longer shortens it), sits at its original top-right ring position, and the preload gate that caused late pop-in is removed. tools/browser-smoke.js added as the permanent real-DOM smoke test. | Owner bug reports. | Confirmed |
| D-185 | 2026-08-25 | PHONE NOTIFICATIONS (real-app): service worker gains push + notificationclick handlers (OS-level "Paragon Archive" notifications); pwa.js gains connectPhonePush (permission + VAPID push subscription, config pushPublicKey placeholder); Account row reworded to the phone-notification truth — permission-based notifications work after install, server push delivery activates with the production domain + keys. | Owner's phone-notification order. | Confirmed |
| D-184 | 2026-08-25 | FOOTER AUTO-CONTINUE: footer destinations open the Hub website DETAIL first (as built in P-094) and now CARRY the user automatically — a "you asked for X" banner appears and auto-launches (guest/session users) to the exact section; first-time visitors get the guest/sign-in hand-off. | Owner's P-096 flow order. | Confirmed |
| D-183 | 2026-08-25 | SITE ICONS COMPLETE 100/100: #80–99 produced via the owner pipeline (no-white edges verified 0.00 on every icon), wired into SITE_ICON_ART; #100 = the Archive Hub brand mark. Real icon chips now sit on trending, staff-pick (featured + minis) and recently-added cards. | Owner's P-096 image order. | Confirmed |
| D-182 | 2026-08-25 | QUIZ STANDALONE EXPORT: exports/paragon-quiz-standalone/ is a self-contained take-away (5 pages + css/js + every referenced asset, paths fixed, EXPORT-README with hosting + deletion rules). The in-project paragon-quiz/ stays untouched until the owner's deletion order; the Archive keeps the quiz catalogue record and its logo→detail links. | Owner's P-096 take-away order. | Confirmed |
| D-181 | 2026-08-24 | Hub search becomes typo-tolerant and meaning-ranked (exact label, word/prefix, then edit-distance ≤2 for 4+ letter words) with richer synonym keywords; ALL footer destinations (About/Privacy/Terms/Help/Request/Archive Hub) route through the Paragon Archive Hub WEBSITE DETAIL first with a remembered pending destination that OPEN then honors; the Join quick card scrolls to the in-home join section whose Join-now button then opens the Community page; the quiz pages adopt the board-style topbar and their logo opens the Paragon Quiz website detail; the build-percentage label merges into the real progress bar as ONE complete capsule pill. | Owner's P-094 UX orders. | Confirmed |
| D-180 | 2026-08-24 | SITE BUILD KIT (docs/SITE-BUILD-KIT.md + docs/site-specs/_TEMPLATE.md): every catalogue website is built as its own project under 12 standing rules (vanilla HTML/CSS/JS, identity headers, P-094 topbar with logo-to-detail back-link, local-first data, honest zeros, perf budget); owner-dropped "skill" material merges with each site's concept documentation into a per-site spec that any build agent can execute; finished sites link back through siteUrl. External hosts cannot have the Archive's header/ads injected into them — each site carries the Paragon bar itself. | Owner's P-094 multi-website build strategy. | Confirmed |
| D-179 | 2026-08-24 | GOOGLE ADSENSE TRACK opened: ad controller (ads/adsense.js) ships DORMANT (no ad code until the approved ca-pub ID is set), three honestly-labelled reserved slots exist (websites grid, updates feed, detail footer), ads.txt template + docs/ADSENSE-SETUP.md carry the exact free application steps; roadmap gains the AdSense milestone. AdSense itself is FREE to apply — the real blocker is the production domain, and ads never run before Google approval (P-009). | Owner's P-094 monetization request. | Confirmed |
| D-178 | 2026-08-24 | Welcome splash v4: hero art preloads BEFORE the splash appears (fixes the pops-in-unloaded bug), a dedicated readability veil sits between the art and the text, the percentage lives inside a bolder glowing ring, and every successful login REPLAYS the full 5 s loading experience. | Owner's P-094 bug report + UX order. | Confirmed |
| D-177 | 2026-08-24 | APP PLAN FINAL — PWA ONLY (supersedes D-170's TWA/Play Store path): no Play Store app, no $25 fee; the browser-installable PWA IS the app. native/TWA-BUILD-KIT.md is REPLACED by native/PWA-APP-MODE.md; roadmap milestone rebuilt around real-app polish (already done: notifications opt-in + test ping, share sheet with clipboard fallback, board-style app topbar, offline shell). Honest browser limits recorded (Chrome frame chip, OS app-info panel, server push needs the production domain). | Owner's P-094 final app decision. | Confirmed |
| D-176 | 2026-08-24 | OPEN becomes a gated real action: it requires at least a Guest session or a real login (first-time visitors are routed to the Account tab), and views are counted ONLY on successfully completed OPENs — detail views no longer count. Guest→account merge stays the real path; the logged-in profile gains an editable display name (defaults from the Google/email name) that is saved to the account and survives logout/login. | Owner's P-094 identity rules. | Confirmed |
| D-175 | 2026-08-24 | Hub top bar becomes the board-style platform topbar: the Home tab navigation is REMOVED entirely (deep links keep working, content moves up), the legal-pages Back button appears whenever any section other than Home is viewed and returns Home first, and the centered search keeps clear distance from the Back button; this topbar pattern becomes the standard for products and pages from now on. | Owner's P-094 hub navigation order. | Confirmed |
| D-174 | 2026-08-24 | MANAGED ANNOUNCEMENTS SYSTEM (supersedes the static curated list under D-172): the four REAL launch-window announcements migrated from data/updates.js (now honestly empty) into the Team Announcements desk — seeded identically in the managed store and in supabase/announcements-schema.sql (owner runs once; RLS: public sees only published+due rows, paragon_team_members write). The desk gains REAL image upload (auto-compressed, every type — the image takes the website icon's place in the public feed, viewable full-size and downloadable), a special-only LINK pill styled exactly like OPEN, true Preview (the exact public card), Save Draft, Schedule (auto-publishes at due time — counted live on both desk and public feed), and Publish Now, with optional live backend sync when a team member is signed in. | Owner's P-094 announcements overhaul. | Confirmed |
| D-173 | 2026-08-18 | Search AI final shape (owner-settled): exact-name queries render plain results; ANY non-exact query renders ONLY the owner's ai-suggest-block with genuine docs-trained matches (minimumScore 40, confidence/similarity floor, no padded lists); the cinematic banner set covers all categories + default and backs both the Website of the Day and every Detail header; the hub top bar keeps a single Home tab with the centered page-wide search as primary navigation. | Owner's P-093 refinement. | Confirmed |
| D-172 | 2026-08-18 | THE REPLACEMENT LAW (owner directive, permanent): whenever anything new replaces or duplicates an existing element, the OLD ONE IS REMOVED in the same change — no double badges, no orphaned code — and the agent proactively sweeps for no-longer-needed code, updates docs/tree/handoff every turn, and acts as a building partner (sensible improvements like doc refreshes happen without being asked, provided nothing breaks). Applied retroactively: WotD double badge, staff double badge, recent double badge all cleaned; three fixtures rewritten to the new truths. | Owner's direct correction after repeated double-element bugs. | Confirmed |
| D-171 | 2026-08-18 | Search AI is ONE presentation — the owner's chosen ai-suggest-block (confidence %, match reasons, category line) renders whenever no exact website name matches, the plain fuzzy list is deleted, and rankWebsites now also indexes the concept-documentation text; the welcome splash runs 4 s with a "Paragon Archive" typewriter synced to a percent ring (6.25%/char) and locks the page (no scroll/clicks behind any popup platform-wide); the privacy banner waits for the splash; the join flow enforces profile → guidelines → auto-checkbox → join with no manual ticking and no un-accepting; need meter becomes a split capsule; five cinematic category hero banners (concept art per D-153) back Website of the Day; staff/trending/new badges + review avatar delivered as code; trending/staff/recent lists wear real icon art; 404/500/maintenance stay separate this turn (merge deferred — nothing risked). | Owner's P-091 corrections, arithmetic included. | Confirmed |
| D-170 | 2026-08-18 | PWA native path DECIDED: TWA (Trusted Web Activity) — the live PWA wraps into a real Play Store app; native/TWA-BUILD-KIT.md carries the full Bubblewrap config, assetlinks template and store steps; Core Native Build / Store Submission / Public Release stay honestly open behind two real owner blockers: a production HTTPS domain and the one-time $25 Google Play account. Hub home restructured per owner (quick cards Stats→Roadmap→Docs→Community with in-home scrolls, hero buttons removed, discussion/requests/dev landing sections removed, dev content → Account "Become a Developer" popup, Official Document chips = the reformed docs section, one permanent topbar search that lists while typing and clears when emptied); join popup gains the real in-popup profile form (step 4 completes inside the popup, saved draft feeds the membership record). Rejected logo concepts deleted (owner-approved waste removal); splash.png wired as iOS startup image; a reference scan proved every remaining image wired. | Owner's P-090 specifications. | Confirmed |
| D-169 | 2026-08-18 | 100% + 100% + PWA: community/developer tables probe-verified live (all five return 200 honest-empty) — Community Platform and Developer Portal & Deployed milestones complete at 6/6 each; the Community Board and Developer Portal now REALLY publish to the live backend when signed in (posts insert/load with 🟢 live vs 📴 device chips; applications insert), device store remains the offline queue + moderation working set; PWA mobile-native adaptation done (manifest v2 with shortcuts/categories/display-override, iOS standalone metas, safe-area insets, standalone ergonomics); remaining Mobile App items (native decision → owner choice requested, core build, store submission, release) stay honestly open; tests consolidated 16→3 suite files with every check preserved (files 197→184; non-image count 87). | Owner ran community-schema.sql; ordered 100% completion, PWA work, backend-comment cleanup inside the site, and further file cuts. | Confirmed |
| D-168 | 2026-08-18 | File-count reduction phase 2: all 30 team page controllers consolidated into one location-guarded team/team-pages.js (fixtures rewired) — the merge EXPOSED six hidden window.confirm dialogs in legacy team code, all purged (modal or safe-refusal). Community & Deployed milestones pushed to 5/6 each with real builds (appeals loop board+desk, developer analytics in the portal, publishing pipeline already live); the final two backend items complete when the owner runs supabase/community-schema.sql (prepared this turn). Search AI-suggestion UIs unified into the single ✦ Paragon AI component. | Owner ordered 100% milestones, max file reduction (images untouchable), one AI suggestions system, and modern polish. | Confirmed |
| D-167 | 2026-08-18 | Community joining is now fully self-service from the Account popup: it renders the REAL documentation join section (live-fetched, steps reordered per the owner: account → verify email → find Paragon Community in Account Settings → complete profile → accept guidelines → click Join), the guidelines pop in-place with Back + Accept (no documentation trip), and the Join button writes the real membership record for signed-in users (guests get the honest step-1 message). Roadmap milestone flips by real state: Community "Q&A, suggestions, and voting" done (Board live), Deployed "Security review and moderation queue" done (8-point desk) — checklist-derived percents recompute automatically per D-116. The welcome banner became a front-and-center entry splash (blur-dark backdrop, ~2s, auto-fade, once per session, reduced-motion safe). | Owner's exact specifications; percentages must stay checklist-derived. | Confirmed |
| D-166 | 2026-08-18 | Account settings v3: Privacy Controls restored (popup, not documentation); Request a Website opens the in-app request form popup; Help & Support opens an in-app support-form popup (queue paragonSupportMessages.v1, honest pendingBackendDispatch, direct-email fallback); a new FAQ popup fetches the EXACT Hub documentation FAQ at open time (always in sync); Help/FAQ/Privacy sit side-by-side as a trio row; the Community entry is smart — members go straight to the Community Board, everyone else gets the six-step join reminder popup (steps animate upward) and completes in the Hub wizard; the board's read-only notice is removed accordingly. Image-cap truth restated: 10 generations/turn is a platform hard limit, not an owner rule — every future turn maxes it until the full image plan (~900) completes. | Owner's exact popup specifications; owner asked to raise the cap believing it was his own rule. | Confirmed |
| D-165 | 2026-08-18 | The NEED button becomes an unlimited demand meter (owner's MovieBox model): every tap adds +1 with no cap or undo, the count rides in a bubble visually connected to the button, users are told plainly that tapping genuinely steers the team to build that website sooner, and the Team's Most-Needed ranking remains the real build-order signal. Icon processing bug fixed: non-square crops are now padded square before resizing (the cause of the compacted Health/Productivity icons). | Owner defined the unlimited need-rating model and correctly suspected the processing step was squishing icons. | Confirmed |
| D-164 | 2026-08-18 | The owner-approved Community & Deployed completion plan is BUILT: community-board.html shares ONE store with the Team Community Posts desk (posts/comments/likes/reports real-zero; Team hide/remove really removes from the public board; membership-gated composing, read-only + join CTA otherwise, guidelines, mini profiles); developer-portal.html mirrors the Team 8-point gate verbatim, applications write the real Team Dev Applications store, accepted developers unlock the dashboard, submissions enter the real Team Deployed review store, and approved non-illustrative submissions genuinely join the public Deployed category at load (app.js merge). Fixture 16 guards every loop. | Owner approved the full plan and ordered it in one turn. | Confirmed |
| D-163 | 2026-08-18 | Search results without an exact website-name match are explicitly Paragon AI territory: the Results list carries a "✨ Paragon AI suggestions" note whenever the closest-match engine (the AI core) produced the list; exact-name searches stay unlabelled. The Detail AI additionally gains greeting handling, an "everything about this site" full-dump intent, and a tight on-topic fallback that never dumps unrequested documentation. | Owner: closest-match results are the AI's job and should be presented as AI suggestions; the assistant must stay on topic and answer greetings politely. | Confirmed |
| D-162 | 2026-08-18 | MADE-UP DATA FINAL PURGE (resolves the long-open demo-reviews CTA): inherited catalogue sample reviews are RETIRED from all public display and AI signals — every review, rating, count and star now derives from real user input only (ratings show "New" until real reviews exist); starter collections removed (collections start honestly empty); the P-073 image shimmer/backing that read as "white stuff" is reverted while the Updates compact fix stays. | Owner: "make review all zero and views and so on — nothing should be made up again, real based on user input"; owner reported the background regression. | Confirmed |
| D-161 | 2026-08-18 | The Detail AI gains a signal engine reading ONLY live real data at answer time: build-state answers (real buildProgress %, need votes + demand rank from paragonArchive.siteNeeds.v1, real device views, real 2027 roadmap targets, never an invented date), review intelligence (theme frequency + explicit wish extraction across inherited and device reviews, honest zero when silent), future-update answers labelled "signals, not promises", full documentation digests, and live-product answers that refuse fake construction talk. Enforced by fixture 15 (tests/ai-detail.test.js, 17 checks). | Owner asked the AI to know build closeness, demand ranking, updates, the website's documentation, and user needs from reviews. | Confirmed |
| D-160 | 2026-08-18 | Demand-driven prioritization: the under-construction page carries an "I need this website" toggle (paragonArchive.siteNeeds.v1, REAL ZERO start, honest this-device label until backend aggregation); Team Website Stats gains a Needs column + Most Needed sort so construction is scheduled by real demand. Site icon art extends into the Archive itself (detail header/byline, search rows, category See-All) via SITE_ICON_ART/CATEGORY_ICON_ART with emoji fallback; the detail launch ring hides its idle 0% and only shows percent while genuinely loading; the 0% build bar shows an alive shimmer while the REAL value stays zero. Animation pack shipped with prefers-reduced-motion opt-out. | Owner requested the MovieBox-style need feature, icons everywhere, all animations, and the 0%-as-loading feel; honesty rules kept every number real. | Confirmed |
| D-159 | 2026-08-18 | Export/upload protocol documented as law in NEXT-AGENT §9: non-html/txt/md files are renamed by appending .md/.txt for upload; the next agent restores real names via the documented one-shot script and trusts each file's EXPORT IDENTITY header over its upload name; binary assets are regenerable from the tracker's art direction. File-count reduction: Paragon Quiz consolidated to a single guarded js/quiz.js (5→1); team/ consolidation planned with fixture update in the same turn. | Owner's upload channel only accepts html/txt/md and rejects ZIPs; file count itself is a constraint. | Confirmed |
| D-158 | 2026-08-18 | HONESTY: all 14 external picsum.photos random-photo placeholders are purged from the Archive; every card/hero/gallery/thumb/collection image is now paragonTile() — a deterministic branded SVG generated from real catalogue data only, replaced by real screenshots as each website actually ships. | Owner: "I need real stuffs in the website not made up — find the made-up and make them real"; random stock photos misrepresented unbuilt websites. | Confirmed |
| D-157 | 2026-08-18 | Owner-reported UX bugs fixed at the token/layout level: html element carries the theme background + color-scheme (kills white scroll/overscroll flash), --text-faint raised to readable contrast in both themes, short-filtered Updates lists switch to a compact timeline without animated rails, website Detail gains a sticky glass info-bar and a floating mobile OPEN button. | Owner reported faint transition text, the fading Updates page under sparse filters, and white flashes while swiping. | Confirmed |
| D-156 | 2026-08-18 | Owner operating rules made standing: (1) total project size stays under 100 MB — every generated image is optimized (quantized PNG ≤640px for spot art, JPG for wide banners; og-default became .jpg); (2) /paragon-file-tree.html is regenerated on every structural change; (3) docs/NEXT-AGENT.md is a complete, always-current handoff brief so a fresh agent can continue mid-project when the chat runs out; (4) all art gets wired the same turn so browser previews and code exports always show the current state. | Owner requested the size cap, live tree, handoff readiness, and preview-ready implementation before battery ran low. | Confirmed |
| D-155 | 2026-08-18 | Image cadence per owner: ~5 generations this turn then wire them in, 10 per turn onward; every generated visual gets wired into the live product the same turn where a real mount point exists; owner's Section 2 (100 site-icon specs) and Section 3 (25 illustration specs) are preserved verbatim in docs/IMAGE-REQUIREMENTS.md as the canonical art direction; Paragon Quiz receives site icon #25 for real as the first of the 100. | Owner: "do maybe 5 more and implement … we can do ten next time … keep all data's about the image and animation". | Confirmed |
| D-154 | 2026-08-18 | The official Paragon Archive logo mark is Concept B — the faceted ◈ diamond (owner-selected); the full brand suite derives from it (full logo, OG banner with the real existing tagline "The gateway to everything Paragon.", splash, favicons, regenerated PWA icons) and production proceeds through ALL image batches with no priority order per the owner; og:image URLs stay relative until the production domain is decided. | Owner picked Concept B via the decision panel and directed "everything, no one first". | Confirmed |
| D-153 | 2026-08-18 | Image production policy: every visual is REAL or clearly labelled — no fake screenshots of unbuilt websites ever (per-site preview/hero/detail shots wait for each real build; only Archive/Hub/Quiz/Team can be captured today); stylized per-site icon art is acceptable pre-build as branding; AI-generated illustrations allowed for empty states/headers/errors; Google sign-in must use the official G asset, never generated; brand logo ships only after the owner picks a concept. | Owner supplied the complete image requirements list; honesty rule P-009 forbids fake screenshots. | Confirmed |
| D-152 | 2026-08-18 | The Team sidebar gains a LAB section rendered as a switch-styled entry: Lab v1 is a no-action preview workbench (page picker over real project pages, device-width frames, Actions switch default OFF with an interaction shield); the full Lab definition is pending the owner's explanation and the core is built to grow. | Owner introduced the Lab concept ("preview the website without any of the action") and will explain the rest later. | Confirmed |
| D-151 | 2026-08-18 | Settings (Super Admin only) really drives the team idle-session guard: session.js reads sessionIdleMinutes/sessionWarnSeconds from paragonTeamSettings.v1 (test override still wins); platform flags are stored intent clearly labelled backend-enforced-later; local desk-store maintenance shows real counts. | Only real-effect settings or honestly-labelled stored intent are acceptable under P-009. | Confirmed |
| D-150 | 2026-08-18 | Reviews & Reports moderation: device-written reviews really delete from the shared public Archive store; inherited catalogue sample reviews stay read-only until the CTA keep-or-remove decision; report queue is honestly empty until the backend. | Deleting inherited data would preempt an open owner decision; deleting real device reviews is genuinely possible now. | Confirmed |
| D-149 | 2026-08-18 | Suggestions desk "Plan + add to Roadmap" writes a real planned roadmap record (0%, suggester credited) into paragonTeamRoadmap.v1 which already syncs to the public hub roadmap; the action is gated by the Edit Roadmap permission. | Reuses the existing documented sync instead of inventing a parallel store. | Confirmed |
| D-148 | 2026-08-18 | The final seven sidebar pages are self-designed by the agent in the established dashboard language (owner: "build it on your own"); nested spec URLs (team/content/*, team/analytics/*) map to flat filenames per dashboard convention; the owner's original dev-application form spec will be reconciled when re-sent. | Owner delegated the layouts and confirmed the earlier form spec was missed and can be re-sent. | Confirmed |
| D-147 | 2026-08-17 | Paragon Templates belongs to Paragon Originals beside the Hub; alert/prompt browser dialogs are banned from the product — all flows use inline panels or the shared field-capable modal system; the quiz play experience follows the owner's v2 design while preserving shared-store compatibility. | Owner directed the move, the alert purge, and supplied the quiz v2 code. | Confirmed |
| D-146 | 2026-08-17 | Team-published announcements merge into the public Updates feed and the public roadmap rebuilds from the team manager on this device; backend broadcast extends both syncs across devices; milestone bars stay checklist-derived per D-116. | Owner directed implementing the documented syncs. | Confirmed |
| D-145 | 2026-08-17 | AI ranking combines lexical scoring with bigram and token-level fuzzy similarity and a guaranteed closest-match ensure fallback at honestly low confidence; strict confident answers keep the Request fallback for unrelated queries. | Owner reported the AI was not returning the closest matches. | Confirmed |
| D-144 | 2026-08-17 | The permission matrix is actively enforced in the front end: page access, sidebar visibility, and action-level gating all derive from can() with a persisted role preview standing in for backend claims. | Owner directed enforcement over documentation. | Confirmed |
| D-143 | 2026-08-17 | The owner's six-role hierarchy and 37-action permission table are encoded as the single machine-readable authority (permissions.js) that the Permissions page renders from and backend claims will enforce; Admin can never act on the Super Admin, and account deletion plus archive purging remain Super-Admin-only. | Owner supplied the final governance matrix. | Confirmed |
| D-142 | 2026-08-17 | My Profile computes all stats live from real activity with the genuine days-on-team count; the shared confirmation-modal system implements the owner's three spec modals with required ban reasons; the owner's access-summary table is the authoritative role map that backend claims enforce at activation. | Owner supplied PAGE 17, the linking map, the modal specs, and the access table. | Confirmed |
| D-141 | 2026-08-17 | The activity log contains only genuinely recorded local actions with device attribution until team accounts exist, and the archive vault computes real 90-day countdowns over real deleted/archived records with restore/purge semantics that never fake server-side deletion. | Owner supplied PAGES 15–16. | Confirmed |
| D-140 | 2026-08-17 | The team roster contains one real member (the owner) whose action totals are computed live from genuine dashboard activity; invitations queue real records for backend email dispatch; role/suspend/remove actions persist as overrides pending backend claims; the owner account is protected from suspension/removal. | Owner supplied PAGES 13–14; no fabricated team members exist outside the labelled example. | Confirmed |
| D-139 | 2026-08-17 | The roadmap manager is seeded from the real public roadmap and flags every edit pendingPublicSync while the public page keeps milestone-derived percentages until integration; analytics render only real local data or clearly-labelled backend-pending states, and CSV export contains the true displayed numbers. | Owner supplied PAGES 11–12; D-084/D-116 honesty governs roadmap and metrics truth. | Confirmed |
| D-138 | 2026-08-17 | The team dashboard uses the owner's full sidebar as its navigation shell with honest "soon" labels for unbuilt sections; the requests desk queues requester updates and the announcements composer flags published records for public-feed sync — no fake public posting or fake queues exist. | Owner supplied PAGES 9–10 and the complete sidebar navigation map. | Confirmed |
| D-137 | 2026-08-17 | The bug desk keeps an honestly empty queue until the support backend, expands full reports inline with persistent triage (priority/status/notes), and labels the illustrative example clearly; fixed-state notifications queue for backend dispatch. | Owner supplied the PAGE 8 bug-desk spec. | Confirmed |
| D-136 | 2026-08-17 | The support ticket desk keeps an honestly empty queue until the support backend, queues every team reply for email dispatch at activation, persists all workflow state on-device, and labels the example roster and illustrative tickets clearly. | Owner supplied the PAGE 7 ticket-desk spec. | Confirmed |
| D-135 | 2026-08-17 | Team user management lists only real local identities and the labelled illustrative pair until accounts activate; moderation actions (timed suspensions with auto-expiry, bans, deletions, review removals) persist with full per-user history queued for backend sync, and IP/device data is never invented. | Owner supplied the PAGES 5–6 user-management specs. | Confirmed |
| D-134 | 2026-08-17 | The Deployed review console keeps an honestly empty queue until the programme backend opens, gates Approve on the complete eight-item checklist, requires written rejection reasons, and persists every review decision; the only sample content is the clearly-labelled illustrative example. | Owner supplied the PAGE 4 review-console spec. | Confirmed |
| D-133 | 2026-08-17 | The Add Website editor validates media dimensions client-side, gates Publish on the complete requirement set, saves drafts into the shared team manager store without touching the public catalogue, and flags publish-ready records for catalogue integration. | Owner supplied the PAGE 3 editor spec. | Confirmed |
| D-132 | 2026-08-17 | The Team websites manager derives statuses from reality (Live for real destinations, Concept Preview for public preview entries), keeps team status changes and edits as flagged local overrides until backend sync, and keeps team drafts genuinely out of the public catalogue. | Owner supplied the PAGE 2 manager spec; honesty rules govern status truth and draft isolation. | Confirmed |
| D-131 | 2026-08-17 | The Team Overview Dashboard previews at /team/overview.html with the owner's role-visibility matrix enforced in front-end logic (backend claims take over later), all statistics drawn from real local/catalogue data, honest zero queues for inactive backends, and a genuine local-event activity feed. | Owner supplied the PAGE 1 dashboard specification. | Confirmed |
| D-130 | 2026-08-17 | Team first-login setup enforces the 12+/upper/number/symbol policy with a live strength meter and a real 24-hour link-expiry check; the reusable session guard warns at 29 idle minutes with a 60-second logout countdown and click-anywhere reset; no fake provisioning or dashboard entry occurs before the security backend. | Owner supplied the first-login and session-timeout specifications. | Confirmed |
| D-129 | 2026-08-17 | The Team portal lives at /team/login.html behind a hidden footer lock link; its five-attempt escalation and 30-minute lockout are real device-local security behavior, incidents queue for owner notification with server-added IP at backend activation, and no fake login success exists. | Owner supplied the PAGE 0 portal spec and failed-login policy. | Confirmed |
| D-128 | 2026-08-17 | Paragon Quiz ships as the first real same-origin product at /paragon-quiz/ with local-first storage, genuinely zero-based stats, and Paragon-authored starter quizzes; its catalogue record becomes a live destination and the shared concept preview no longer applies to it. | Owner initiated real product construction with supplied structure and pages. | Confirmed |
| D-127 | 2026-08-17 | The Account tab surfaces real Community membership (badge + state-aware settings row read from the Hub join record) and an achievement-progress strip; all Account numbers are real user data. | Owner asked for a better Account tab with real cross-page state. | Confirmed |
| D-126 | 2026-08-17 | View counts contain no seeded demo totals: every view number and view-driven ranking reflects only real recorded user activity until the production analytics backend adds global totals. | Owner directed that everything be real and driven by real user action. | Confirmed |
| D-125 | 2026-08-17 | The Under-Construction loader is a determinate real-build-percentage bar driven by an optional per-site buildProgress value (default 0); 0% stays empty and numbers rise only with actual construction. | Owner wants real loading, not a filling animation trick. | Confirmed |
| D-124 | 2026-08-17 | Recently Added shows only websites added within the last 7 days, newest to oldest, with honest empty states, and its See-all view is a vertical up-down list. | Owner corrected the horizontal swipe and the all-catalogue listing. | Confirmed |
| D-123 | 2026-08-17 | The System Status page uses the owner's component-row layout with a live local last-checked time and dual legend (pre-launch readiness states now, production incident states later); operational claims are limited to genuinely working front-end systems and no incident-free claims are made before monitoring. | Owner supplied the status layout; honesty rules prohibit fabricated uptime. | Confirmed |
| D-122 | 2026-08-17 | Community joining is a six-step guided wizard (account → Hub → guidelines acceptance → email verification → profile with display name/bio/interests → member badge and benefits); email verification reflects the real Supabase confirmation state after activation and is honestly labelled pending before; backend-dependent benefits carry activation labels. | Owner supplied the exact six-step membership flow. | Confirmed |
| D-121 | 2026-08-17 | Every unfinished product's OPEN destination shows an Under Construction stage first (dark minimal layout, "We're building something", honest indeterminate orange progress bar with a no-countdown label) with the full concept documentation collapsed beneath a View-documentation control; the single shared preview route from D-098 is retained. | Owner requested the construction placeholder plus in-page access to the existing concept documentation. | Confirmed |
| D-120 | 2026-08-17 | Roadmap v2 adds the Coming Soon products group (RxLife Network, Pharmapaedia, More Paragon Platforms, Paragon Ecosystem) as future concepts, promotes the Mobile App to milestone-tracked IN PROGRESS on the strength of the live PWA foundation, and adds the Desktop App to PLANNED; percentages remain checklist-derived per D-116. | Owner supplied the updated roadmap layout and new product vision. | Confirmed |
| D-119 | 2026-08-17 | The Hub Deploy preview form follows the owner's supplied layout, including the combined Website-Files-or-URL either/or field and the future review-window note, while remaining a no-upload local validation preview until the protected review backend exists. | Owner supplied the exact form structure; D-083 still governs submission honesty. | Confirmed |
| D-118 | 2026-08-17 | The Archive detail renderer supports Deployed records: developer byline, premium FREE/PREMIUM disclosure with developer-responsibility note, About the Developer card, and a Similar Deployed Websites section with an honest empty state; the layout is previewable only through the non-catalogue illustrative "My Cool App" example behind an explicit template banner. | Owner supplied the Deployed detail layout; honesty rules prohibit fake catalogue entries. | Confirmed |
| D-117 | 2026-08-17 | The Team page is a centered Secure Access screen (brand, Team Email, Access Key, SECURE LOGIN, future-tense logging warning, Back to Archive link, compact honesty disclosure); no fake authentication occurs until the protected backend exists. | Owner supplied the exact Team screen layout. | Confirmed |
| D-116 | 2026-08-17 | The Hub Roadmap "See all" opens a dedicated full Roadmap view (#roadmap-full) with Completed/In-Progress/Planned timeline groups; progress percentages are always computed from visible milestone checklists, never hand-written; launch-era milestones remain PLANNED untilthey truly complete; the view's ← Back control joins the approved-arrow exceptions. | Owner supplied the roadmap layout; D-084 prohibits premature completion claims and unsupported percentages. | Confirmed |

## §11. Refined prompt log

### P-001 — 2026-08-04 — Intake, documentation, and safe project structure

**Owner intent, refined:**

1. Treat the uploaded HTML, CSS, and Markdown-disguised JavaScript as the starting codebase.
2. Restore the JavaScript file to a `.js` extension so it can be used normally.
3. Continue building on these files and create additional files, including HTML pages, when the architecture genuinely requires them.
4. Avoid turning `index.html` into an ever-growing container for every future feature.
5. Create two governance documents before broader edits:
   - EOP for executed operations/version history;
   - SOP containing project truth, rules, plans, current state, refined prompts, and the living CTA.
6. Preserve the current site rather than redesigning it; make only requested modifications and safe bug fixes.
7. Begin a careful stabilization process because the current site contains multiple bugs.
8. Keep a Pending Content reminder active at the end of every delivery.

**Acceptance criteria:**

- The working JS file is `app.js`.
- Local HTML references resolve to `style.css` and `app.js`.
- Original uploads are not destroyed.
- Exactly two governance documents exist, with CTA included in SOP.
- Multi-page guidance is documented.
- No unrequested redesign is introduced.

**Execution:** See EOP `v0.1.0`.

### P-002 — 2026-08-04 — Website tab responsiveness and top-bar icons

**Owner observations, refined:**

1. Start stabilization with the Website tab environment.
2. The site looks strongest on phone-sized viewports such as Galaxy S5 and Pixel 7.
3. Laptop and MacBook simulations make the application content appear overly concentrated or “zoomed into” the center while the background spans the screen.
4. Galaxy Tab and Tab S6 Lite simulations are usable but appear too centered with noticeable side padding.
5. The top-bar Account/Profile control does not reliably render as an icon and may display text or an unsupported glyph.
6. Use a reliable account/profile icon rather than depending on emoji-font support.
7. Keep the notification bell’s gently pulsing unread dot while notifications are unread.
8. When notifications are opened/read, remove the unread dot.

**Implementation intent:**

- Make the main application wrapper fluid across tablet, laptop, and larger desktop widths while retaining modest responsive gutters and preserving the phone layout.
- Use inline SVG for the top-bar notification and profile controls so their appearance does not depend on platform emoji fonts.
- Make the notification control a real button with an accessible unread state.
- Mark notifications read when opened, hide the pulsing indicator, and preserve the read state locally for later reloads where browser storage is available.
- Remove the duplicate inline profile-navigation path while preserving Account-tab navigation through the existing JavaScript binding.

**Acceptance criteria:**

- Website content uses substantially more available width on laptop/MacBook viewports and is not constrained to the previous 1200px wrapper.
- Tablet gutters remain balanced and do not cause horizontal overflow.
- Existing phone layout remains compact and usable.
- Bell and profile icons render as SVG on supported browsers.
- The unread dot pulses only while notifications are unread.
- Opening notifications hides the dot and updates the accessible label/state.
- The Account button still opens the Account tab.

**Execution:** Completed in EOP `v0.2.0`; owner visual confirmation across SPCK presets remains in CTA §13.

### P-003 — 2026-08-04 — Add sixteen websites and connect related catalogue entries

**Owner request, refined:**

1. Add sixteen named Paragon products to the Website catalogue using the supplied names, descriptions, and categories.
2. Give every new product a complete dynamic detail view equivalent to existing catalogue entries.
3. Avoid duplicate entries if an incoming product already exists.
4. Where a new product belongs with an existing product/category, connect the new and old catalogue entries rather than leaving them isolated.
5. Keep the catalogue maintainable instead of expanding `index.html` with hard-coded detail markup.

**New catalogue entries:**

- Paragon Resume — Productivity
- Paragon Whiteboard — Creative
- Paragon Palette — Creative
- Paragon Exam — Education
- Paragon Tutor — Education
- Paragon Confess — Social
- Paragon Events — Social
- Paragon Sounds — Entertainment
- Paragon Theater — Entertainment
- Paragon Bet — Games
- Paragon Survival — Games
- Paragon Invest — Finance
- Paragon Wardrobe — Lifestyle
- Paragon Journal — Lifestyle
- Paragon Deploy — Dev Tools
- Paragon Contrast — Dev Tools

**Implementation intent:**

- Move catalogue data into a dedicated `data/sites.js` file and load it before `app.js`.
- Preserve all existing site records and append only non-duplicate incoming names.
- Mark the sixteen incoming entries as new so Recently Added can derive its contents from data instead of hard-coded array indexes.
- Add category-family bindings: Tools ↔ Productivity, Media ↔ Entertainment, Health ↔ Lifestyle, and Dev ↔ Dev Tools; exact owner-supplied category labels remain visible.
- Add a Related Websites section to detail views so old and new products in the same family link to each other.
- Add the four new categories to category browsing and color mapping.
- Sort the displayed A–Z catalogue by name without mutating the source data.
- Use honest “New” rating labels and empty review states rather than inventing customer ratings or reviews.

**Acceptance criteria:**

- All sixteen names appear exactly once in the combined catalogue.
- Existing twelve entries remain present.
- Total catalogue count becomes twenty-eight.
- Every new card opens its own populated detail view.
- Recently Added is generated from all sixteen new entries.
- Related Websites connects compatible old and new category families.
- New categories appear in category browsing and search chips.
- Existing hero, trending, staff-pick, search, account, and navigation code continues loading.

**Execution:** Completed in EOP `v0.3.0`.

### P-004 — 2026-08-04 — Context-preserving detail Back and category-aware search

**Owner request, refined:**

1. The detail-view `← Back` control must return users to the exact context where they opened the website instead of always returning to the top of the Website tab.
2. Preserve the originating tab and scroll position, including cases where the user opened a detail after scrolling far down the catalogue.
3. If a result was opened from Search, Back must restore the search overlay, query, selected category, results, and overlay position.
4. Restyle the search field with a polished, lively border whose colors match and transition with the website accent system.
5. Enable browser autocomplete and website-name suggestions.
6. Make the active `All` chip genuinely search all websites.
7. Make every category chip a real search scope:
   - selecting a category with an empty query lists all websites in that exact category;
   - typing then filters only within the selected category;
   - selecting `All` removes the category restriction.
8. Improve current non-AI discovery so descriptions, tags, About text, and feature/update text can help find a website even when the user does not know its name.
9. Record the future requirement for AI-powered natural-language/intent search, including category-scoped intent search.
10. Do not yet change the Website-tab Browse by Category cards; that will be handled after the website list is finalized.

**Implementation intent:**

- Introduce a detail navigation-state stack that records source tab, window scroll position, current detail when following Related Websites, and Search overlay state.
- Restore scroll without smooth animation after the source view is visible, avoiding a jump to the top.
- Introduce explicit accessible Search open/close functions, Escape-key handling, dialog ARIA updates, focus handling, and body scroll locking.
- Replace hard-coded recent-search results with live results derived from the 28-site catalogue.
- Synchronize duplicate category controls through `data-search-category` values and `aria-pressed`.
- Populate a native `<datalist>` and set `autocomplete="on"`.
- Use weighted local keyword relevance across names, categories, descriptions, tags, About text, and updates as a transparent bridge—not a claim of AI.
- Add an animated accent-gradient search-field border with a reduced-motion fallback.

**Acceptance criteria:**

- Back from a detail opened far down a tab restores the same tab and scroll position.
- Back through Related Websites restores the preceding detail and its scroll position.
- Back from a search result restores Search with the same query, category, result set, and overlay scroll position.
- All + empty query lists all 28 websites.
- A category + empty query lists all websites in that exact category.
- A category + query returns only matching websites from that category.
- Search can match useful descriptive terms such as CV, homework, white noise, hosting, or accessibility.
- Autocomplete suggestions contain all website names.
- Search dialog state and keyboard behavior remain coherent.

**Execution:** Completed in EOP `v0.4.0`; owner interaction/visual confirmation in SPCK remains in CTA §13.

### P-005 — 2026-08-04 — Data-driven daily hero carousel and weekly Trending

**Owner request, refined:**

1. Keep the Website of the Day carousel’s six-second automatic rotation but also let users move through it manually without waiting.
2. Support direct previous/next controls and touch/drag sliding for phone and pointer users.
3. Increase the daily hero selection from five to seven websites.
4. Select those seven from the most viewed/browsed websites rather than fixed array positions.
5. Freeze the selection for a day and recompute it on the following day from the latest view statistics; if ranking does not change, the same websites remain.
6. Make Trending This Week automatic rather than hard-coded.
7. Recompute Trending once per week using views plus ratings and review volume.
8. Carry the previous week’s daily-feature appearances into the following week’s Trending ranking.
9. Replace the Trending `See all →` alert with a functional full weekly ranking.
10. Present the full ranking as horizontal result rows stacked from top to bottom.

**Implementation intent:**

- Add a dedicated `data/metrics.js` front-end analytics/ranking module loaded after catalogue data and before `app.js`.
- Replace random detail-view counts with stable view totals.
- Record a local view when a user intentionally opens a detail; restoring a prior detail through Back must not create an extra view.
- Create one seven-site daily snapshot per local calendar day and keep it unchanged until the next date.
- Create one weekly snapshot per Monday-starting local calendar week.
- Rank weekly results using prior-week activity, total views, numeric rating, review count, and a strong bonus for appearances in the prior week’s daily snapshots.
- Use stable seeded demo totals plus browser-local activity until a production analytics backend exists; do not claim these are site-wide multi-user statistics.
- Add previous/next arrows, swipe/drag gestures, keyboard arrows, and timer restart after manual interaction.
- Add a Trending full-list overlay with all ranked websites displayed as horizontal rows stacked vertically.
- Preserve source context when a detail is opened from the Trending overlay.

**Acceptance criteria:**

- Hero renders seven ranked slides and seven corresponding dots.
- Automatic rotation remains six seconds and wraps using the actual slide count.
- Previous, next, pointer/touch swipe, and keyboard-left/right navigation work.
- Daily ranking remains stable within the same date and recomputes on a new date.
- Opening a detail increments that website’s local view count once; Back restoration does not.
- Trending preview is generated from the weekly ranking and shows views, rating, and review count.
- Weekly ranking is stable within the same week and obtains a new snapshot in the next Monday-starting week.
- Prior-week daily-feature appearances influence the following week’s ranking.
- `See all →` opens the complete stacked weekly list instead of an alert.
- Detail Back from the full Trending list restores that list and its position.

**Execution:** Completed in EOP `v0.5.0`; owner interaction/visual confirmation in SPCK remains in CTA §13.

### P-006 — 2026-08-04 — Daily opportunity-based Staff Picks

**Owner request, refined:**

1. Make Staff Picks by Paragon automatic instead of using one fixed website.
2. Staff Picks must be the opposite of Website of the Day and Trending:
   - least viewed in the preceding 24 hours;
   - lowest rated;
   - least reviewed.
3. Freeze the Staff Picks selection for the day and refresh it after the next 24-hour/day boundary from the latest statistics.
4. Keep one large featured Staff Pick card.
5. Add two smaller Staff Pick cards side by side directly below the large card.
6. Add a small golden ribbon-shaped `Staff Pick` badge at the top-right of the large card.
7. Replace the Staff Picks `See all →` alert with a functional full ranked list.
8. Preserve context if a user opens a detail from the full Staff Picks list and then presses Back.

**Implementation intent:**

- Extend `data/metrics.js` with timestamped local view events and a frozen daily Staff ranking.
- Rank all websites in ascending opportunity order: preceding-24-hour views first, then numeric rating, review count, and total views as deterministic tie-breakers.
- Treat the existing `New` rating as unrated/zero rather than inventing a rating.
- Store one daily Staff snapshot and recompute it on the next local calendar date; if statistics produce the same order, the picks remain unchanged.
- Update the existing midnight refresh scheduler to rerender Staff Picks and an open Staff overlay.
- Render the first ranked website as the large card and ranks two and three as smaller side-by-side cards.
- Add a gold ribbon badge using CSS rather than an external asset.
- Add a full Staff Picks dialog containing all 28 opportunity-ranked websites as horizontal rows stacked vertically.
- Extend the existing detail view-state stack with Staff-overlay state and scroll restoration.
- Keep current metrics clearly labeled as a device-local preview until production analytics exists.

**Acceptance criteria:**

- Staff preview is generated from daily metrics, not a fixed array index.
- Large card and two side-by-side smaller cards render three distinct websites.
- Large card has a golden top-right ribbon labeled `Staff Pick`.
- Daily Staff ranking remains stable within one date and recomputes on the following date.
- A website with more preceding-24-hour views ranks after an otherwise eligible underexposed website.
- Rating, review count, and total views resolve ties deterministically.
- `See all →` opens all 28 Staff-ranked websites instead of an alert.
- Opening a detail from full Staff Picks and pressing Back restores the full list and its previous position.
- Mobile, tablet, and laptop layouts remain usable.

**Execution:** Completed in EOP `v0.6.0`; owner interaction/visual confirmation in SPCK remains in CTA §13.

### P-007 — 2026-08-04 — Recent chronology, private category discovery, and ranking decisions

**Owner request and decisions, refined:**

1. Confirm Trending uses a Monday–Sunday week.
2. Confirm production rankings must support both:
   - site-wide/global rankings;
   - personalized rankings for signed-in users.
3. Make Recently Added chronological in descending order: latest addition first, oldest last.
4. Use addition date/time and deterministic ingestion sequence metadata to resolve ordering.
5. Make Recently Added visually lively while preserving the horizontal card-row interaction.
6. Replace Recently Added `See all →` alert with a functional full chronological list; all cards remain horizontally browsable and open their website details.
7. Remove the public `All Websites A–Z` section so the Website tab does not advertise the archive’s total size.
8. Replace that broad public inventory with category-led discovery.
9. Make Website-tab category chips open a list of websites in the selected exact category instead of showing an alert.
10. Keep Search-overlay category browsing functional: selecting a category shows results only from that category.
11. Style the Website-tab Browse by Category `See all →` action and make it open every category with its icon and category-chip treatment.
12. The full category view must expose categories that may be outside the currently visible horizontal rail, and each category must open its website list.
13. Preserve detail Back context from Recently Added and category views.

**Implementation intent:**

- Add `addedAt` and `addedSequence` catalogue metadata without modifying the preserved original record bodies.
- Use provisional version-derived dates for the twelve inherited sites and the current intake date plus sequence for the sixteen newly supplied sites; request final historical dates later.
- Sort a copy of the catalogue by `addedAt` descending, then `addedSequence` descending, then name.
- Render the top recent entries in the existing horizontal row with date badges.
- Add a full Recently Added dialog containing every chronological card in one horizontally scrollable rail.
- Remove the All Websites A–Z markup, renderer call, and public search-result totals; internal catalogue size remains available to application logic/tests.
- Add a category discovery dialog with two states:
  - all categories shown in a complete responsive chip grid;
  - selected category shown as a website-card list.
- Reuse exact category labels; category families do not silently broaden the selected list.
- Change `filterCategory()` from an alert to opening the selected category list.
- Keep Search `All` functional while avoiding an explicit total-count label.
- Extend detail view-state restoration for Recently Added and category dialogs.
- Record global + personalized production ranking modes as a confirmed backend requirement.

**Acceptance criteria:**

- Recently Added preview and full list are ordered newest-to-oldest from metadata.
- Same-date additions use descending ingestion sequence.
- Recently Added `See all →` opens a horizontal full list and no longer alerts.
- A detail opened from the full recent list returns to the same recent-list position.
- The Website tab no longer contains an All Websites A–Z section.
- Search does not publicly print the archive’s total website count.
- Website-tab category chips open exact-category website lists.
- Search Browse by Category continues to filter to exact-category results.
- Browse by Category `See all →` opens every category and icon in a complete non-clipped view.
- A detail opened from a category list returns to that category and position.
- Monday–Sunday and global + personalized production ranking decisions are removed from owner-pending CTA items.

**Execution:** Completed in EOP `v0.7.0`; owner interaction/visual confirmation in SPCK remains in CTA §13.

### P-008 — 2026-08-04 — Comprehensive front-end audit, bug fixes, and final visual polish

**Owner authorization, refined:**

1. Audit the complete front-end for bugs, duplicate behavior, dead controls, incomplete interactions, responsiveness issues, and inconsistent styling.
2. Correct verified problems rather than preserving broken demo behavior.
3. Implement reasonable front-end functionality where the current files already contain the necessary data.
4. Improve layout and modern styling where it strengthens usability without changing the product identity.
5. Keep backend-dependent functionality honest and clearly distinguish local preview behavior from production services.

**Verified audit findings:**

- Bottom navigation executes twice because inline handlers and `bindNav()` both handle the same clicks.
- Bottom navigation contains duplicate `aria-label` attributes and incomplete active/selected-state handling.
- The Account welcome container does not use the `.account-hero` class expected by CSS.
- Private Account headings remain visible while logged out, and logout leaves previously rendered private content behind.
- Theme toggles use a permanent `.checked` class instead of the actual checkbox state and do not persist.
- Updates filter chips and website selector are visual-only; the timeline is stale and hard-coded.
- Notification interaction still uses an alert instead of a usable panel.
- Detail bookmark, share, rate/review, Read more, and Open actions are incomplete or misleading.
- Built-in reviews incorrectly expose Edit/Delete actions to every visitor.
- Many placeholder links jump to `#` without an explanation.
- The fixed bottom navigation stretches excessively on desktop.
- Search still uses an emoji icon while other top actions use reliable SVG.
- Account metrics and saved/review content do not reflect local front-end state.
- Several images lack graceful offline failure behavior.

**Implementation intent:**

- Replace duplicate inline tab logic with one `switchToTab()` path and coherent ARIA state.
- Add a skip link, SVG navigation icons, capped floating desktop navigation, global focus treatment, ambient background treatment, reveal animation, toast feedback, and Back-to-top control.
- Replace notification alerts with an accessible notification popover and persisted read state.
- Make Updates filtering functional using catalogue chronology and update data, with type/site filters and modern empty states.
- Repair Account logged-out/logged-in visibility, cleanup, theme persistence, notification preferences, dynamic saved count, and locally saved content.
- Add local bookmark persistence, Web Share/clipboard fallback, local rating/review composer, local review deletion, correct review ownership, and accurate detail review counts.
- Make Read more a real collapsed/expanded control and make Open use a real URL when supplied or provide honest non-alert feedback when it is unavailable.
- Replace remaining front-end alerts with toast or panel feedback.
- Add graceful image-failure behavior and reduced-motion-safe reveal effects.
- Convert backend/content-dependent links into explicit non-jumping pending actions rather than pretending they are complete.
- Add dependency-free regression coverage for the newly repaired UI state.

**Acceptance criteria:**

- One tab click causes one navigation transition and one scroll action.
- Account login/logout does not leak stale private content; styling is applied correctly.
- Theme state and visual toggle state remain synchronized across rerenders/reloads.
- Updates type and website filters change the timeline contents correctly.
- Notification panel replaces alert behavior and unread state remains coherent.
- Bookmark, share fallback, review creation/deletion, and saved/review Account views work locally.
- Built-in reviews no longer show unauthorized Edit/Delete links.
- Read more collapses/expands real content, and unavailable external URLs do not produce fake success alerts.
- Desktop bottom navigation is compact and modern; mobile remains usable.
- Placeholder/legal/backend-dependent actions no longer jump the page and clearly report what remains pending.
- Existing search, detail Back, hero, Trending, Staff, Recent, category, and ranking regression tests continue passing.

**Execution:** Completed in EOP `v0.8.0`; final visual/device confirmation remains in CTA §13.

### P-009 — 2026-08-04 — Robust Updates filters, mirrored timeline, new entry types, and saved-site indicators

**Owner request, refined:**

1. Repair Updates filter selection so exactly one type chip appears active at any time.
2. `All`, `New Sites`, `Updated`, `Maintenance`, `Announcement`, and `Featured/Promoted` must each filter the timeline correctly.
3. Selecting another type must remove both the visual active state and `aria-pressed` state from the previous type.
4. Type filtering and the website selector must combine correctly and remain data-driven when new websites or update records are added later.
5. Add a second timeline rail and pulsing dot on the right so each timeline card is visually centered between matching left/right markers.
6. Standardize every update-type badge as a rounded pill:
   - 🆕 New — green;
   - 🔄 Updated — blue;
   - 🔧 Maintenance — orange;
   - 🎉 Announcement — purple;
   - Featured/Promoted — an additional distinct gold/pink pill.
7. Add Special Announcement and Featured/Promoted as real update entry types, not decorative filters with no records.
8. When a user is logged into the local preview and a bookmarked website receives an update, show a small saved-site star on that timeline card.
9. Saved stars must update when login/logout or bookmark state changes.

**Implementation intent:**

- Create `data/updates.js` as the dedicated source for curated Maintenance, Announcement, and Featured/Promoted entries.
- Load curated update data after catalogue data and before `app.js`.
- Merge generated addition/version events with curated events on every render.
- Centralize update-type metadata for label, icon, and badge class so future types have one source of truth.
- Replace sticky touch-hover styling with active-state-first chip CSS and hover rules limited to devices that genuinely support hover.
- Add `setUpdateTypeFilter()` and `syncUpdateFilterChips()` so filters can be changed programmatically or by future controls without stale active states.
- Refresh website-selector options from current catalogue/update data without discarding the user’s valid current selection.
- Add right-side timeline line/dot markup and responsive mirrored styling.
- Derive the saved-site marker from `loggedIn && bookmarkedSites.has(siteName)`.
- Rerender Updates after login, logout, and bookmark changes.

**Acceptance criteria:**

- Exactly one update-type chip has `.active` and `aria-pressed="true"` after every filter change.
- All six filters return only their matching records; `All` returns every type.
- Website selection intersects correctly with every type filter.
- Newly added catalogue sites and curated events automatically appear in options/rendering after reload; runtime option synchronization does not reset a valid selection.
- New, Updated, Maintenance, Announcement, and Featured entries each render their correct pill badge.
- Every timeline entry has left and right dots aligned with mirrored rails.
- Logged-in bookmarked-site entries display a saved star; logged-out or unsaved entries do not.
- Existing Website, Search, Account, ranking, and Back-context regression tests remain passing.

**Execution:** Completed in EOP `v0.9.0`; final SPCK interaction/visual confirmation remains in CTA §13.

### P-010 — 2026-08-04 — Real Supabase authentication, shared account state, and temporary Guest sessions

**Owner request and confirmed choices, refined:**

1. Remove all demo-account behavior from public Google and Email sign-in.
2. Build real front-end authentication now using **Supabase**.
3. Google uses Supabase Google OAuth.
4. Email uses email + password sign-up/sign-in, including verification/error/reset handling.
5. All Paragon products will be served under **one origin with path-based products**, allowing one shared Supabase session across the archive and product routes.
6. One authenticated account must carry bookmarks, reviews, visits, preferences, and generic product/course progress across every product path.
7. Continue as Guest remains available.
8. Guest data is **session-only**: it may survive refreshes in the same browser tab/session through `sessionStorage`, but it must not be written as persistent account progress and disappears when the session ends.
9. Guest mode must never be presented as a real authenticated or demo owner account.
10. The owner will define the separate private demo-account purpose later; do not build or expose that now.

**Implementation intent:**

- Create a dependency-free Supabase Auth REST client rather than relying on a CDN library.
- Add a public configuration file for Supabase URL, anon key, redirect URL, and path-based hosting settings.
- Add Google OAuth redirect/callback handling, email/password sign-in, sign-up, sign-out, session refresh, current-user retrieval, password reset, and auth-state subscriptions.
- Create a generic Supabase state-sync client backed by one RLS-protected JSONB row per user.
- Expose a shared `ParagonProgress` API for any product path to load/save product-specific progress with the same account.
- Add Supabase SQL schema/RLS policies and an integration guide for all Paragon product paths.
- Replace public Account demo controls with real auth actions and a real email-auth dialog.
- Model identity as signed-out, authenticated, or guest—not a single demo boolean.
- Move bookmarks, reviews, visits, and progress to authenticated Supabase state; use `sessionStorage` only for Guest state.
- Require an authenticated or Guest session before personal actions; signed-out users are directed to Account.
- Keep authenticated saved-site update stars; Guest mode must not show the logged-in personalization star.
- Preserve honest configuration feedback until the owner supplies Supabase project credentials and enables Google OAuth.

**Acceptance criteria:**

- Google button initiates Supabase OAuth when configured and never logs into a fake account.
- Email form supports real Supabase sign-in and account creation with email/password.
- OAuth callback and token refresh persist one authenticated session across same-origin paths.
- Authenticated state loads/saves one user state row under RLS.
- `ParagonProgress.save(productId, value)` and `load(productId)` work through the shared account state.
- Guest mode writes personal activity only to `sessionStorage`, never persistent `localStorage` or Supabase.
- Closing the Guest session clears temporary personal state.
- Signed-out personal actions request sign-in/Guest instead of silently saving.
- Authenticated Account displays actual Supabase email/provider metadata; no `PARAGON_USER` demo identity remains.
- Existing navigation, Updates, saved-star, detail, Search, ranking, and UI regressions remain passing.

**Execution:** Completed in EOP `v0.10.0`; Supabase project credentials and provider-console activation remain in CTA §13.

### P-011 — 2026-08-04 — Creator demo identity, registered date, collections, footer-aware navigation, and animated detail statistics

**Owner request, refined:**

1. Designate the supplied creator Gmail account as the only public-facing **creator demo account**.
2. Keep its sign-in on the same real Supabase Email/password authentication path; all other users continue using real Google or Email authentication.
3. Never hard-code or ship the supplied plaintext password in front-end source, configuration, documentation, tests, or generated output.
4. Identify the creator demo by configured email or protected Supabase metadata after real authentication.
5. Display the account registration date from Supabase `user.created_at`; if unavailable, store the first authenticated activation date in the user’s synced profile state.
6. Make Create New Collection functional and persist collections to authenticated Supabase state or Guest session state.
7. Hide the floating bottom navigation when the footer enters view so footer actions are not covered; restore it when the footer leaves view.
8. Make the Website Detail Open action show an animated circular progress ring around the website icon, a percentage in the center, and a completion zoom effect before launching.
9. Apply the launch experience automatically to every current and future dynamic website detail.
10. Rebuild detail statistics as three equal columns with thin dividers.
11. Animate Rating, Views, and Reviews from zero to their target values when details render.
12. Render rating stars with decimal partial-fill support.
13. Make the Reviews statistic keyboard/click actionable and scroll to the Ratings & Reviews section.

**Implementation intent:**

- Add only `creatorDemoEmail` to public configuration; do not store the password anywhere in the workspace.
- Extend synced/Guest state with `profile` and `collections` while preserving the flexible JSON schema.
- Create a collection composer dialog with validation, persistent creation, and dynamic Account rendering.
- Use `IntersectionObserver` with a scroll fallback for footer-aware bottom-nav hiding.
- Replace the current Open handler with a reusable launch controller using SVG stroke progress, percentage updates, reduced-motion support, and a completion pulse.
- For real URLs, open a blank user-initiated window immediately and navigate it at completion to avoid popup blocking; when no URL exists, complete the honest launch animation and show pending-URL feedback.
- Build reusable partial-star markup and count-up helpers from data attributes.
- Give the Reviews section a stable anchor and focus target for scroll navigation.
- Record that cross-origin browser security cannot expose true remote page-load percentage; the ring is an honest launch/preparation animation unless a future same-origin loader supplies real progress events.

**Acceptance criteria:**

- No supplied password appears anywhere in persisted workspace files.
- The configured creator email receives a Creator Demo label only after successful real Supabase authentication.
- Registration badge uses Supabase creation date or first authenticated activation fallback.
- New collections are added to the Account UI and persist to Supabase/Guest session state according to identity mode.
- Ending Guest clears Guest collections.
- Bottom navigation hides while the footer is visible and reappears afterward.
- Open animates an icon ring and center percentage from 0 to 100, then applies a completion zoom and launches a real URL when present.
- Stats are equal-width with dividers and responsive behavior.
- Rating decimals display partial stars correctly.
- All three numbers animate from zero; Views uses the stable numeric target.
- Reviews statistic scrolls/focuses the review section.
- Existing auth, UI, Updates, ranking, Search, Recent, category, and Back-context tests remain passing.

**Execution:** Completed in EOP `v0.11.0`; Supabase creator-user creation and final SPCK confirmation remain in CTA §13.

### P-012 — 2026-08-04 — Export-safe file identity/manifest, screenshot lightbox, and tagged About sections

**Owner request, refined:**

1. Prepare the project for export from this chat and later re-import when files may arrive flattened or in the wrong folders.
2. Give the former generic `index.html` a distinctive real filename.
3. Rename it to `paragon-archive.html` and place its real filename/expected path at the top of the source.
4. Add a standardized source header to every HTML, CSS, JavaScript, and SQL code file stating:
   - real filename;
   - expected project-relative path/folder;
   - role;
   - required load/dependency order where relevant.
5. Store a complete reconstruction manifest and these standing export rules in SOP/EOP.
6. Update tests, documentation, links, and live validation to use the renamed HTML file.
7. Keep future code files following the same header rule.
8. Upgrade every dynamic website detail screenshot area:
   - horizontal scroll row;
   - multiple rounded screenshots representing different pages/states;
   - tap/click opens a fullscreen lightbox;
   - X close button;
   - previous/next controls and left/right swipe;
   - keyboard Escape/Arrow support;
   - dot indicators showing current position.
9. Upgrade every dynamic About section:
   - subtle top divider;
   - icon/title on the left;
   - description truncated to about four lines;
   - smooth Read more/Show less expansion only when needed;
   - generated keyword tag pills for every website.

**Implementation intent:**

- Rename only the application shell; preserve all other established filenames and folder roles.
- Use `paragon-archive.html` as the canonical entry file and remove the generic `index.html` copy.
- Add an explicit import-reconstruction manifest to SOP listing every path and script order.
- Add a standing rule requiring headers on every future code file.
- Generate five screenshot states per site from stable seeds until owner screenshots are supplied.
- Use button-based screenshot thumbnails with accessible labels.
- Add one reusable fullscreen screenshot lightbox with image, caption, close, arrows, swipe/pointer gesture, keyboard navigation, and synchronized dots.
- Generate tags from site name, category, existing tag, descriptive text, updates, and category/keyword rules; deduplicate and cap the visible list.
- Replace line-clamp-only About behavior with animated max-height and post-render overflow detection so Read more is hidden for short content.

**Acceptance criteria:**

- Canonical shell is `paragon-archive.html`; no workspace `index.html` remains.
- Every code file has an accurate export header and expected relative path.
- SOP contains a complete reconstruction manifest and future-header standing rule.
- Tests and live HTTP checks use `/paragon-archive.html`.
- Each detail renders a horizontal row of rounded screenshot buttons.
- Lightbox opens the selected image, supports X/arrows/swipe/keyboard, and renders synchronized dots/caption.
- About sections have a subtle divider, four-line collapsed state, smooth expansion, conditional Read more, and keyword pills.
- Screenshot/About behavior applies automatically to every existing and future data-driven detail.
- Existing auth, Updates, Account, ranking, Search, navigation, and Back-context suites remain passing.

**Execution:** Completed in EOP `v0.12.0`; owner export/re-import and SPCK confirmation remains in CTA §13.

### P-013 — 2026-08-04 — Feature-completeness pass: PWA, requests, QR, votes, ratings, versions, username, collections, and iframe preview

**Owner request, refined:**

1. Audit the supplied feature checklist, preserve completed features, and implement missing front-end/data/schema pieces.
2. Preserve the existing Supabase Email/Google authentication and session-only Guest behavior.
3. The configured creator email remains the only Creator Demo identity and saves progress through real authentication; never embed the supplied password.
4. Complete Collections/Playlists by allowing websites to be added to and removed from collections.
5. Add a real Request a Website form with authenticated Supabase submission and session-only Guest drafts.
6. Add per-review Upvote/Downvote controls with authenticated/Guest personal vote persistence.
7. Add a QR code action for every website detail using a real scannable QR image and shareable detail URL.
8. Make Paragon Archive installable as a PWA with manifest, service worker, install prompt, offline shell, and icons.
9. Add a rating breakdown to every website detail.
10. Add a complete data-backed version-history view per site using current release plus archive-entry history.
11. Add a real username system to Supabase signup/profile schema with unique username enforcement and availability checking.
12. Add an iframe website preview that cooperates with the existing icon progress ring, completes on iframe load, and offers Open in New Tab.
13. Confirm already implemented Website of the Day, Trending, Staff Picks, Achievements, Search filters, Related/Similar Websites, Share, Notifications, Guest, full Updates, User Stats, Recently Visited, Email/Google auth, and password reset.

**Implementation intent:**

- Extend personal state with collection items and reviewVotes.
- Add detail actions for Add to Collection and QR.
- Add collection-picker and collection-view dialogs.
- Add Request Website and QR dialogs plus Supabase request schema/client.
- Add bundled PWA files with export identities: manifest identity fields, service worker, and PNG icons.
- Add username field/validation/availability check to signup and `paragon_profiles` SQL schema/trigger/RPC.
- Add version-history and rating-breakdown render helpers.
- Add an iframe preview dialog; treat `load` as completion and document cross-origin frame restrictions.
- Keep Guest request/vote/collection behavior session-only.
- Update SOP §3A manifest and every new code file’s export header.

**Acceptance criteria:**

- Completed checklist features remain passing in regression suites.
- Collection cards can open, display items, remove items, and accept a website from detail.
- Request form validates and submits for authenticated users; Guest draft remains session-only.
- Review vote buttons toggle one personal up/down vote and persist according to identity mode.
- QR action opens a scannable per-site code and copyable detail URL.
- Manifest/service worker/icons make the app PWA-installable when served over HTTPS/localhost.
- Rating breakdown shows five bars and counts.
- Version history shows current and archive-entry records for every site.
- Username is collected at signup, validated, checked, stored uniquely, and displayed after auth.
- Iframe preview loads real URLs with icon progress and fallback/new-tab controls.
- No supplied password appears in workspace files.

**Execution:** Completed in EOP `v0.13.0`; Supabase activation, real URLs, and SPCK/PWA confirmation remain in CTA §13.

### P-014 — 2026-08-04 — Forty-four-site catalogue verification and detail expansion

**Owner request, refined:**

1. Verify the supplied 44-site Productivity/Tools, Creative, Education, and Social catalogue against existing data.
2. Do not duplicate websites already present.
3. Add every missing website with a complete dynamic detail record.
4. Update matching existing websites with the newly supplied “What’s Inside” and feature lists.
5. Preserve all other previously catalogued websites outside this list.
6. Ensure new and updated details automatically receive screenshots, About/tags, versions, ratings, Related Websites, QR, collections, iframe launch, and all shared detail features.

**Implementation intent:**

- Create `data/catalogue-expansion.js` as a declarative 44-entry source loaded immediately after `data/sites.js`.
- Merge by case-insensitive exact website name.
- Update existing matches in place and append only missing names.
- Add `features`, `group`, rich About copy, current updates, icons, colors, tags, chronology, and standard detail fields.
- Give every catalogue record a `features` fallback so the detail renderer can show a Key Features section consistently.
- Update Paragon Code to the latest Education grouping from this owner list.
- Extend tests to use dynamic catalogue size instead of stale 28-site assumptions.
- Add the new data file to export headers, SOP manifest/load order, PWA cache, and tests.

**Acceptance criteria:**

- Every supplied name appears exactly once.
- Existing matches are not duplicated.
- All missing names are appended with complete fields.
- Supplied feature lists are reflected in detail Key Features and version history.
- Search/category/Recent/rankings automatically include added entries.
- No public total count is exposed in the UI.
- All regression suites pass against the expanded dynamic catalogue.

**Execution:** Completed in EOP `v0.14.0`; real product URLs/assets and SPCK confirmation remain in CTA §13.

### P-015 — 2026-08-04 — Catalogue continuation 45–100 verification and merge

**Owner request, refined:**

1. Verify and merge the supplied Entertainment/Media, Games, Finance/Business, Lifestyle/Health, Web/Developer Tools, and Paragon Originals entries numbered 45–100.
2. Update matching existing websites without duplication.
3. Add every missing website with complete feature-rich dynamic detail data.
4. Preserve all earlier catalogue records and shared detail functionality.
5. Keep internal totals private in the public Archive UI despite the Archive Hub product concept mentioning statistics.

**Implementation intent:**

- Create `data/catalogue-expansion-45-100.js` loaded after the 1–44 expansion.
- Merge exact case-insensitive names and append only missing records.
- Use the newest group/category/inside/features as current detail source.
- Add features, groups, tags, About text, chronology, icons, colors, and standard fields.
- Add the file to export headers, SOP manifest/load order, PWA cache, and tests.
- Keep regression expectations dynamic as catalogue size grows.

**Acceptance criteria:**

- Every supplied 45–100 name appears exactly once.
- Existing matches are updated rather than duplicated.
- Missing records receive complete dynamic details and Key Features.
- All shared screenshot, About, rating, version, collection, QR, review, and iframe features apply automatically.
- All regression suites pass.

**Execution:** Completed in EOP `v0.15.0`; real product URLs/assets and SPCK confirmation remain in CTA §13.

### P-016 — 2026-08-04 — Advanced rating summary, animated breakdown, review filters, and bottom-sheet composer

**Owner request, refined:**

1. Redesign Ratings & Reviews with a large rating number on the left, stars below, and review count below that.
2. Show the five-level percentage breakdown as horizontal bars on the right.
3. Animate bars from left to right when the breakdown enters the viewport.
4. Add review sorting: Most Recent, Most Helpful, Highest Rated, Lowest Rated.
5. Add exact star-count filtering.
6. Show avatar, username, star rating, date, review text, Helpful, and Not helpful controls on every review card.
7. Open Write a review as a modal sheet sliding upward from the bottom.
8. Preserve authenticated/Guest vote and review persistence.

**Implementation intent:**

- Build review view-models with stable IDs, timestamps, seeded helpfulness, personal vote state, and ownership state.
- Render filtering/sorting without rebuilding the entire detail page.
- Use IntersectionObserver with reduced-motion fallback for rating bars.
- Convert the review composer’s visual treatment to a bottom sheet while preserving validation/focus handling.

**Acceptance criteria:**

- Summary is two-column desktop and stacked mobile.
- Bars animate to percentage targets in view.
- All four sort modes and star filtering work together.
- Review cards contain every requested identity/date/rating/text/helpfulness field.
- Vote state remains functional.
- Write review slides from the bottom and remains accessible.
- Existing detail and regression functionality remains passing.

**Execution:** Completed in EOP `v0.16.0`; owner SPCK interaction/visual confirmation remains in CTA §13.

### P-017 — 2026-08-04 — Final category corrections, front-end freeze, audit, and export handoff

**Owner decisions and request, refined:**

1. Paragon Tutor belongs in Education & Learning / Education.
2. Paragon Vibe must not be an Original; place it in Entertainment & Media / Entertainment.
3. The updated details for the thirteen previously existing 45–100 matches are approved.
4. Expanded Media content is approved.
5. Logos and real screenshots remain owner work after each product is built.
6. Finish only the front-end authentication integration and Supabase schema; leave backend services/operations for later.
7. Ensure one authenticated Paragon account can manage the Archive and persist progress for every same-origin product path.
8. Run a final full-project bug audit, update every required file, finalize SOP/EOP/CTA, and prepare a folder-preserving export bundle.
9. Move all manual testing tasks to CTA for later owner feedback.

**Implementation intent:**

- Correct Tutor and Vibe in the latest catalogue expansion source.
- Re-run all regression, syntax, credential, export-header, manifest, asset, schema, and HTTP checks.
- Confirm no backend server implementation was introduced beyond front-end clients and Supabase SQL schema.
- Update current project phase/progress to front-end complete with owner testing/content/backend activation pending.
- Consolidate CTA into testing, activation, content, and future backend sections.
- Create a final ZIP preserving the exact SOP §3A folder structure.

**Acceptance criteria:**

- Tutor resolves to Education; Vibe resolves to Entertainment; both appear once.
- All front-end/auth/schema tests pass.
- Supplied password remains absent from workspace files.
- Every code file retains the correct export header/path.
- Canonical entry remains `paragon-archive.html`.
- One-account progress API and Supabase state schema remain intact.
- SOP/EOP clearly distinguish completed front-end work from owner testing/content and future backend work.
- Final export ZIP contains the complete folder structure.

**Execution:** Completed in EOP `v0.17.0`; folder-preserving export bundle created.

### P-018 — 2026-08-04 — Privacy & Security Policy page and consent controls

**Owner request, refined:**

1. Publish the supplied Privacy & Security Policy with effective/updated date August 1, 2026.
2. Keep the supplied plain-language sections, Nigerian identity, contact email, rights, cookies, analytics, advertisements, retention, security, children, international users, changes, and contact details.
3. Replace the pending Privacy action with a real dedicated privacy page.
4. Connect Account → Settings → Privacy & Security to usable privacy controls.
5. Add a first-visit cookie notice consistent with the policy.
6. Keep Analytics, tracking-cookie, and ad preferences disabled unless consented to; do not load Google Analytics/Ads merely because the policy mentions them.
7. Provide a working local data download; keep account deletion honest as a backend-dependent request until a secure server/admin flow is added.
8. Add the privacy page and consent files to export headers, SOP manifest/load order, PWA cache, tests, and final export bundle.

**Implementation intent:**

- Create `paragon-privacy-security.html` using shared styles and an export identity header.
- Create `privacy.js` for cookie preferences, consent banner, Privacy Controls dialog, local data export, and Account navigation.
- Store consent preferences locally or in Guest session storage according to identity mode where applicable.
- Wire footer Privacy to the policy and Account Privacy & Security to the controls dialog.
- Add explicit status notes that analytics/ads scripts are not currently connected.

**Acceptance criteria:**

- Full supplied policy is readable and linked from the Archive.
- First-visit cookie banner supports Essential Only, Manage, and Accept All.
- Privacy controls manage analytics, tracking-cookie, and ad preferences.
- Download My Data exports the currently available browser/account state.
- Delete Account does not falsely claim deletion; it explains secure backend handling is pending.
- No analytics/ad script loads without future consent-aware integration.
- PWA/export/tests/docs include the new files.

**Execution:** Completed in EOP `v0.18.0`; owner legal/production review remains in CTA §13.

### P-019 — 2026-08-05 — Dedicated Request a Website page and owner-supplied introduction

**Owner request, refined:**

1. Publish a full Request a Website page headed `💡 REQUEST A WEBSITE`.
2. Lead with the exact message `You imagine it. We build it.` and explain that a user idea could become the next website thousands of people use.
3. Add the supplied `Tell Us What You Need` introduction explaining Paragon’s free/easy/working principle, the 100-website milestone, accepted idea types, review process, popular-request prioritization, follow-up promise, and community-growth message.
4. Preserve the already working authenticated Supabase submission and session-only Guest draft rules.
5. Treat the submission as a distinct page under §4.2 rather than continuing to expand the main Archive shell.

**Implementation intent:**

- Create `paragon-request-website.html` as the dedicated direct page.
- Create `request-website.js` for identity detection, exact category options, validation, Guest draft restoration/saving, signed-out guidance, and authenticated `ParagonSync.submitWebsiteRequest()` submission.
- Present the supplied wording prominently without changing its meaning.
- Reuse the shared Paragon visual system and provide responsive one/two-column layouts.
- Point footer and Account Settings request actions to the new page while preserving the original in-shell dialog as a compatibility fallback.
- Add the page/script to export headers, SOP manifest/load order, service-worker shell, regression coverage, and the next export bundle.

**Acceptance criteria:**

- The dedicated page contains every supplied header and introduction statement.
- The form remains usable by keyboard and across phone, tablet, and desktop widths.
- Authenticated users submit through the existing Supabase sync client.
- Guest users save only a sessionStorage draft and do not submit to Supabase.
- Signed-out users receive honest Account guidance rather than fake success.
- Archive footer and Account Settings link to the dedicated page.
- The PWA shell, tests, SOP/EOP, and export bundle include the new files.

**Execution:** Completed in EOP `v0.19.0`; owner device and live-Supabase testing remain in CTA §13.

### P-020 — 2026-08-05 — Request counter and Recently Built community proof

**Owner request, refined:**

1. Add a prominent counter showing `💡 247` with the labels `website requests submitted so far` and `and we are building them one by one`.
2. Place a Recently Added/Recently Built section directly below the counter.
3. Head that section `✅ RECENTLY BUILT FROM YOUR REQUESTS`.
4. Show cards for Paragon Vibe, Paragon Sounds, and Paragon Journal in that exact order.
5. End the section with `These started as requests just like yours.`

**Implementation intent:**

- Add the counter and proof section to the existing dedicated request page without changing the form or authentication behavior.
- Treat 247 as the owner-supplied published count; keep future automatic aggregation separate from this front-end delivery.
- Link all three cards to their existing Archive deep-link detail routes.
- Use existing catalogue category/description details and confirmed Vibe=Entertainment placement.
- Add responsive card/counter styles, regression assertions, service-worker cache revision, documentation, and a new export bundle.

**Acceptance criteria:**

- The counter displays the exact supplied number and both supporting lines.
- The Recently Built heading and closing sentence match the supplied copy.
- Exactly three cards appear in the supplied order.
- Every card opens the correct existing Archive detail route.
- Counter and cards remain readable at phone, tablet, and desktop widths.
- Existing request identity, Guest draft, signed-out guard, and authenticated submission tests remain passing.

**Execution:** Completed in EOP `v0.20.0`; owner visual confirmation and future live aggregation remain in CTA §13.

### P-021 — 2026-08-05 — Expanded request form and authenticated seven-day limit

**Owner request, refined:**

1. Replace the dedicated page’s short request form with the supplied `Submit Your Request` heading and explanatory copy.
2. Collect:
   - Website Name or Idea — required;
   - Category — required, using Tools, Creative, Education, Social, Entertainment, Games, Finance, Health, Dev Tools, and Other;
   - What should it do? — required, maximum 1,000 characters with live counter;
   - Why do you think people need this? — required, maximum 500 characters with live counter;
   - Your Email — optional but recommended;
   - acknowledgement that submission does not guarantee a build — required.
3. Use the supplied field prompts and `SUBMIT MY REQUEST 💡` action.
4. Permit only one submitted request per user in every rolling seven-day period.
5. Prevent a signed-in user from bypassing the limit by logging out and switching to Guest.
6. Find a privacy-respecting solution rather than relying on easily reset browser state.

**Clarification selected by owner:**

- Submission mode: **Require an account**. Guest can save a draft but cannot submit.
- Privacy: disclose anti-abuse behavior clearly. Because account-only enforcement was selected, no IP address or device fingerprint is needed for this limit.

**Implementation intent:**

- Expand the dedicated form and add accessible live character counters.
- Prefill the authenticated account email while keeping the contact field optional/editable.
- Keep Guest drafts in sessionStorage only and relabel the Guest action `SAVE GUEST DRAFT 💡`.
- Add `ParagonSync.getWebsiteRequestEligibility()` for pre-submit status.
- Extend submitted rows with need reason, optional contact email, and acknowledgement state.
- Enforce the rolling limit in PostgreSQL with a `before insert` trigger and per-user advisory transaction lock so simultaneous requests cannot race.
- Keep anonymous table inserts revoked; Guest/session switching therefore cannot bypass the account limit.
- Add an honest form disclosure that no IP/device fingerprint is used for this account limit.

**Acceptance criteria:**

- Exact form heading, explanation, labels, prompts, required states, category list, counters, acknowledgement, and submit wording are present.
- Guest can save the expanded draft but cannot insert a request.
- Signed-out visitors cannot submit.
- Eligible authenticated users can submit all expanded fields.
- A second request within seven days is rejected by the database even if browser checks are bypassed or requests are simultaneous.
- Eligibility becomes available exactly seven days after the latest accepted request.
- Existing authentication, privacy, Archive, request-counter/cards, and regression behavior remains passing.

**Execution:** Completed in EOP `v0.21.0`; schema activation and live seven-day testing remain in CTA §13.

### P-022 — 2026-08-05 — Free-first transactional email foundation and request auto-reply

**Owner request, refined:**

1. Send the supplied `We got your idea 💡 — Paragon Archive` automatic reply whenever an accepted request includes a contact email.
2. Explore using `paragon.archive.2026@gmail.com` automatically for OTP, request receipts, and future website emails without manual sending.
3. Support email links that prefill subject/body so a visitor can review and choose Send.
4. Prepare one reusable email foundation for future Paragon products.
5. Use the easiest route that does not require paying now.
6. Keep Google monetization as a future possibility, but do not assume Google pays simply because users visit.

**Implementation intent:**

- Select Brevo's free-first Email API/SMTP route rather than the more complex Gmail API OAuth route.
- Keep the visible sender and Reply-To on the existing Gmail during initial sender verification; support changing to a verified domain address later through Edge secrets.
- Create a private database outbox queued by accepted request inserts with contact email.
- Create a protected Supabase Edge Function that validates a custom webhook secret, atomically claims pending rows, sends through Brevo, and logs success/failure/provider ID.
- Store Brevo API key, service role, and webhook secret only in Supabase Edge Function secrets.
- Put the supplied subject/body in a central allowlisted template registry and add a URL-encoded `mailto:` share action.
- Document Brevo account/sender verification, schema, secrets, deployment, Database Webhook, Supabase Auth custom SMTP, OTP ownership, testing, and future templates.
- Update Privacy & Security disclosure for transactional/auth email delivery providers.
- Keep SMS/WhatsApp and AdSense as separate future integrations.

**Acceptance criteria:**

- The supplied automatic-reply subject and all message sections exist in text and responsive HTML forms.
- A request with contact email queues one idempotent `request-received` outbox row; no email is queued when contact email is blank.
- Browser roles cannot access the outbox or provider/service credentials.
- The Edge worker rejects an invalid webhook secret and claims one pending row before delivery.
- Delivery status, attempts, errors, sent time, and provider message ID are recorded.
- The prefilled share-email link opens a draft with encoded subject/body and never silently sends.
- Supabase Auth SMTP guidance covers verification/reset and future email OTP generation without browser-generated secrets.
- Privacy disclosure and regression coverage are updated.
- No paid provider activation, Gmail password, private OAuth token, API key, or service-role key is committed.

**Execution:** Completed in EOP `v0.22.0`; free Brevo/Supabase activation and live delivery testing remain in CTA §13.

### P-023 — 2026-08-05 — Dedicated Help & Support page, private screenshots, and support intake

**Owner request, refined:**

1. Publish a direct `🆘 HELP & SUPPORT` page led by `We are here. Ask us anything.` and the supplied real-person/72-hour introduction.
2. Add Contact Form and Direct Email options.
3. Provide direct Gmail links using Support, Bug, Billing, Privacy, and Other subject lines.
4. Build the supplied Send Us a Message form with name, email, seven exact topics, 2,000-character issue description/counter, optional PNG/JPG/GIF screenshot up to 10MB, and send action.
5. Publish the complete Reporting a Bug explanation, examples, exclusions, required diagnostic details, and Request-a-Website link.
6. Let signed-out visitors request help without exposing private database/storage credentials.
7. Preserve the promise that a real person responds; do not send a fake automated support answer.

**Implementation intent:**

- Create `paragon-help-support.html` and `help-support.js` as a dedicated responsive page/client.
- Prefill name/email for authenticated visitors, while keeping the form public.
- Validate screenshot type/size in browser and Edge Function; upload through service role to a private `support-attachments` bucket.
- Create private `paragon_support_messages` with no browser-role grants.
- Deploy a public `submit-support-message` Edge Function with exact-origin CORS, honeypot, field/topic/file checks, optional authenticated-user detection, private upload, and service-role insert.
- Rate-limit to three accepted messages per email per rolling 24 hours with an advisory lock; do not store IP/device fingerprints.
- Queue one idempotent `support-notification` email to the owner; include topic/message/device context/private attachment path and a prefilled Reply action.
- Send no automatic reply to the visitor; show the 72-hour success message in the page.
- Replace Account/footer pending Help actions with the real page and add PWA/offline support.
- Disclose support messages/bug screenshots in Privacy & Security Policy.

**Acceptance criteria:**

- Every supplied header, intro, contact option, field, topic, prompt, upload rule, bug example/exclusion, diagnostic instruction, and 72-hour statement is present.
- Direct email subject links open prepared Gmail-recipient drafts.
- The message counter and drag/drop/file selection/removal work.
- Unsupported or over-10MB files are rejected.
- Public browser roles cannot access support table or screenshot bucket directly.
- The Edge Function accepts valid public forms only from configured origins and stores valid screenshots privately.
- Fourth message from one email within 24 hours is database-blocked.
- Accepted messages queue one owner notification with a prefilled human Reply link.
- Account Settings, Archive footer, Request footer, and Privacy footer reach Help.
- Existing Archive/request/privacy/email/auth regressions remain passing.

**Execution:** Completed in EOP `v0.23.0`; Supabase/Brevo deployment and physical-device testing remain in CTA §13.

### P-024 — 2026-08-05 — Help FAQ and six-step Archive documentation

**Owner request, refined:**

1. Add a Frequently Asked Questions section to Help & Support grouped under Account, Websites, Notifications and Settings, and Pricing.
2. Include all supplied questions about signup, password reset, Guest use, deletion, data download, opening/saving/reviewing/requesting websites, notifications, theme, analytics, free pricing, and future free access.
3. Add `How to Use Paragon Archive` with six steps: Browse, Open, Create Account, Save Favorites, Stay Updated, and Your Account.
4. Add one screenshot placeholder to every documentation step.
5. Keep the FAQ easy to scan and responsive.

**Truth-preserving refinements:**

- Guest personal actions are session-only rather than unavailable.
- Secure account deletion remains pending and is not described as already completed.
- Embedded websites can require Open in New Tab due CSP/X-Frame-Options.
- Authenticated persistence/sync and notification email depend on production activation.
- Request submission requires authentication and is limited to one per seven days.
- Analytics/ad scripts are currently absent and future ads must respect consent.
- The guide does not expose a public total or reintroduce the removed full archive grid.

**Implementation intent:**

- Use semantic native `details/summary` accordions for all fifteen questions.
- Add four visually distinct FAQ groups.
- Add a six-step responsive timeline with styled screenshot placeholders instead of fake product screenshots.
- Preserve all supplied guidance where it matches current behavior and make the smallest honest corrections where it does not.
- Add mobile layouts, regression assertions, a PWA cache revision, documentation, and export bundle.

**Acceptance criteria:**

- Fifteen FAQ questions appear in the four supplied groups.
- All six guide steps and six screenshot placeholders appear.
- FAQ controls work with pointer and keyboard without extra JavaScript.
- No false completed-deletion, permanent-Guest, guaranteed-iframe, active-email-notification, active-analytics, public-total, or full-grid claim is introduced.
- Existing contact form, upload, bug guidance, support backend, email, privacy, request, auth, and Archive behavior remains passing.

**Execution:** Completed in EOP `v0.24.0`; owner visual/content confirmation remains in CTA §13.

### P-025 — 2026-08-05 — Public About Paragon story, founder message, and roadmap

**Owner request, refined:**

1. Publish a direct `◈ ABOUT PARAGON` page led by `Built with purpose. Driven by passion. Free for everyone.`
2. Publish the complete August 1, 2026 origin story and explanation of why Paragon Archive exists.
3. Publish the mission, meaning of Paragon, one-account/free-access mantra, and future vision.
4. Present the supplied August 2026, 2027, and Future roadmap milestones.
5. Publish five values: Free and Accessible, Quality, Real People, Honest/Open, and Community Driven.
6. Publish the complete founder message signed Paragon, with a founder-photo placeholder.
7. Publish the team description and developer/designer/builder roles.
8. Add direct contact email and Support, Privacy, Bug, Partnership, Press, and Other subject links.
9. Finish with the supplied Paragon signoff/tagline.

**Implementation intent:**

- Create `paragon-about.html` as semantic static content with no unnecessary JavaScript.
- Build a responsive story layout, roadmap, value grid, founder letter, team card, contact card, and brand signoff using shared CSS.
- Keep the roadmap’s `100 websites` wording as a future milestone rather than a current internal catalogue count.
- Use a clearly labeled styled founder-photo placeholder; do not invent or generate a person image.
- Refine `exactly how to get it removed` to `how to request its removal` so About does not contradict the pending secure deletion workflow.
- Connect Account Settings and all page footers to About and add it to the PWA shell.
- Add regression coverage, documentation, and export bundle.

**Acceptance criteria:**

- Every supplied story, mission, name, roadmap, value, founder, team, contact, and signoff section is present.
- Four timeline milestones, five value cards, six subject links, and the founder placeholder render.
- Account Settings and Archive/Help/Request/Privacy footers reach About.
- No fake founder photo, page-specific dependency, exposed credential, or false completed-deletion claim is introduced.
- Mobile, tablet, and desktop structures are responsive.
- Existing Help, support backend, email, privacy, request, auth, Archive, PWA, and regression behavior remains passing.

**Execution:** Completed in EOP `v0.25.0`; founder image and owner visual/content confirmation remain in CTA §13.

### P-026 — 2026-08-05 — Category consolidation, sole Archive Hub channel, and 2026 chronology audit

**Owner request, refined:**

1. Remove the `Dev` category completely.
2. Keep `Dev Tools` and give it the former Dev computer icon because it matches better.
3. Remove every website except Paragon Archive Hub from Originals and place each moved site in the most suitable current category.
4. Keep Paragon Archive Hub as the only website closely related to/brother of Paragon Archive.
5. Define Archive Hub as the future official channel for Paragon Team login, Request a Website, About, Privacy, Terms & Conditions, platform details, and deploy/host-in-Archive submissions.
6. Do not build Archive Hub yet; prepare its catalogue role/details now and record the future build.
7. Read active files for inaccurate text and dates, especially 2024/2025 records that predate the August 2026 project start, and correct them safely.

**Category decisions:**

- Paragon Originals website → Creative
- Paragon Random → Tools
- Paragon Time Capsule → Lifestyle
- Paragon Alive → Health
- Paragon Archive Hub → remains the sole Originals entry/channel
- Paragon Code → Education source corrected consistently

**Implementation intent:**

- Remove Dev from color/category definitions and related-category families.
- Give Dev Tools `💻` in category discovery, Request form, and the Paragon Dev Tools record.
- Use `◈` for the sole Originals/Archive Hub category.
- Rewrite Archive Hub description/features as the official Archive channel and publishing gateway without implementing privileged team login yet.
- Normalize all active catalogue versions, reviews, and addition chronology to August 1–4, 2026; remove active 2024/2025 fallbacks.
- Change inherited/provisional chronology status to normalized-to-project-start and rename stale variables.
- Align Request page language with the 2027 first-100 roadmap by saying the first 100 are mapped out, not already built.
- Audit Privacy copy so inactive Analytics/Ads/deletion/profile-edit/HTTPS systems are not described as live; advance Last Updated to August 5, 2026.
- Add dedicated governance regression coverage and rebuild PWA/export/docs.

**Acceptance criteria:**

- No Dev category or Dev-category site remains.
- Dev Tools consistently uses the computer icon.
- Originals contains exactly one website: Paragon Archive Hub.
- All moved sites use the approved destination categories/groups.
- Archive Hub details include team login, Request, About/Privacy/Terms, deploy/host submission, documentation, roadmap, and updates.
- Archive Hub has no same-category Related Website sibling.
- No active catalogue/update/app source contains a 2024 or 2025 date or fallback.
- Every `addedAt` is August 1, 2026 or later.
- Request/About 100-site wording is chronologically consistent.
- Privacy does not claim inactive Analytics, ads, deletion, profile editing, or universal HTTPS are already live.
- Existing catalogue uniqueness, Tutor/Vibe corrections, Archive behavior, and all regressions remain passing.

**Execution:** Completed in EOP `v0.26.0`; future Archive Hub build and owner category/date review remain in CTA §13.

### P-027 — 2026-08-05 — Workspace cleanup and single-export retention

**Owner request, refined:**

1. Reduce workspace clutter and remove files no longer needed.
2. Delete the former `/home/user/uploads/` intake copies.
3. Delete superseded versioned export ZIPs.
4. Keep the complete working project and one latest verified folder-preserving export.
5. Do not remove active source, documentation, tests, assets, schema, Edge functions, or integration guides merely to reduce file count.

**Implementation intent:**

- Inventory root files and sizes before deletion.
- Update governance rules so `/uploads/` is no longer treated as the current recovery baseline.
- Build and integrity-test `paragon-archive-export-v0.27.0.zip` from the complete current project.
- Compare every current project file with the ZIP manifest before cleanup.
- Remove `/home/user/uploads/` and root exports v0.17.0 through v0.26.0 only after the replacement bundle passes.
- Verify the workspace root contains only the working project and v0.27.0 ZIP.

**Acceptance criteria:**

- `/home/user/paragon-archive/` remains complete and unchanged except governance cleanup records.
- The latest ZIP contains every current project file in the correct folder.
- No generic `index.html` appears.
- `/home/user/uploads/` is removed.
- No superseded `paragon-archive-export-v*.zip` remains.
- Exactly one export is retained: v0.27.0.

**Execution:** Completed in EOP `v0.27.0`; the working project and one latest bundle remain.

### P-028 — 2026-08-05 — Owner device resolution follow-up, custom Search, detail sharing, Updates/notifications, Guest transfer, achievements, live request count, and guide revision

**Owner test results and protected areas, refined:**

1. Galaxy S5 `360×240` and Pixel 7 `393×851` are approved.
2. Galaxy Tab `800×1280`, Tab S6 Lite `810×1080`, laptop `1366×768`, and MacBook `1440×900` still make page bodies look too narrowly centered against the background; correct the shared large-screen width behavior on every Archive, Privacy, Request, Help, and About page without disturbing the approved phone layouts.
3. Top navigation, bottom navigation, footer, footer-triggered navigation hiding, Back behavior, Website of the Day/discovery controls, Ratings & Reviews, and Account copy are approved and must be preserved.

**Accepted functional scope:**

4. Replace browser-native Search autocomplete with custom in-site horizontal suggestion cards below the field. Suggestions appear only after the first typed character and support left/right swipe; they must not cover the Search interface.
5. Make Share and QR encode one canonical `paragon-archive.html?site=...` detail deep link so recipients/scanners open the exact Archive detail. Replace the unreliable remote QR image dependency with local QR generation.
6. Give both Updates timeline markers the live Paragon transition-color treatment and extend the same transition treatment to nearby verified static-accent UI while preserving semantic status colors.
7. Replace Filter by Website with Filter by Category, add a date filter beside it, combine type/category/date as an exact intersection, and show an honest empty state when no event matches.
8. Use `↻` for Updates and provide a notification `↻` sync action.
9. Authenticated users receive one welcome notification on first activation and then only update events from that activation day forward; historical events remain available in Updates but are not backfilled as notifications. Notification items open the exact corresponding Updates event.
10. Welcome/update notifications expire after 24 hours. Future real AdSense notifications may expire after 72 hours, but no fake advertisement notification or AdSense script is added now.
11. End a Guest session after 30 continuous minutes away/offline. Brief app switching or connection loss must not erase state immediately. If the live Guest signs in or creates an account before expiry/end, merge Guest bookmarks, reviews, votes, visits/history, collections, preferences, and progress into the authenticated state; explicit Guest end or expiry discards it.
12. Expand achievements to six. The first five are task achievements; the sixth remains locked until all five are complete, then becomes actionable/unlocked. Replace `See all Achievements` with `About Achievements` and explain every requirement and final prerequisite.
13. Replace the curated 247 request total with a real accepted-request count that starts at zero in an empty database and increases from accepted rows through a safe public aggregate function.
14. If an accepted request has a contact email, retain the email receipt path. If it has no contact email, create the same receipt as an authenticated in-app notification instead.
15. Revise the six Help guide steps to the owner-confirmed order and icons: Account `⚙️`, Create Account `👤`, Archive `◈`, Open Website `🌐`, Save `🔖`, and Stay Updated `↻`.
16. Update CTA testing state from the owner’s pass/fail report, add regression coverage, preserve one canonical entry, create one verified v0.28.0 export, and remove v0.27.0 only after replacement validation.

**Confirmed clarifications:**

- Search layout: `1B` — custom horizontal cards with swipe.
- Guest timeout: `2B` — 30 minutes away/offline.
- Notification expiry: `3A` — 24 hours for welcome/updates, 72 hours only for future real AdSense notifications, no fake ads.
- Guide icons: `4A` — `⚙️`, `👤`, `◈`, `🌐`, `🔖`, `↻` in the owner-specified order.

**Acceptance criteria:**

- All shared pages use materially more of the 800–1440px viewport while Galaxy S5/Pixel layouts remain protected.
- Native datalist/browser suggestions are removed; custom suggestions remain below Search and do not exist for an empty query.
- Share/QR exact-detail links match, survive reload, and use local QR generation.
- Updates type/category/date filtering, transition markers, refresh, empty state, and notification targeting work together.
- Authenticated notification cutoffs/expiration and no-fake-ad rules are enforced in state.
- Guest state merges only when the live unexpired Guest authenticates, and expires after 30 continuous hidden/offline minutes.
- Six achievements, final prerequisite, and About Achievements explanation work.
- Request count is database-derived and zero-safe; receipt delivery follows optional-email choice.
- Six guide labels/icons match the confirmed mapping.
- Existing approved navigation, discovery, Detail (outside Share/QR), Ratings & Reviews, and Account content regressions remain passing.

**Execution:** Completed in EOP `v0.28.0`; owner live-device and activated-Supabase confirmation remains in CTA §13.

### P-029 — 2026-08-05 — Publish Paragon Archive Hub documentation and honest launch foundations

**Owner request, refined:**

1. Publish the supplied complete Paragon Archive Hub documentation as a direct, responsive, bookmarkable product page.
2. Include the supplied Terms and Conditions, Community Guidelines, Cookie Policy, Developer Requirements and acceptance process, Deployed-category specification, future-product roadmap, System Status, community membership process, updated category-family list, and documentation-completion overview.
3. Connect Paragon Archive Hub from its existing Archive catalogue detail, Account/footer navigation, and relevant About/Privacy/Request/Help destinations.
4. Prepare the supplied Deployed submission-form layout and community/developer entry points without inventing a live moderation, upload, payment, analytics, Team Gateway, or community backend.
5. Add Deployed as a documented future category/family and Archive browse placeholder without fabricating deployed websites.
6. Preserve the owner’s rules and policy intent while correcting claims that conflict with the verified August 5, 2026 implementation state.
7. Keep the canonical Archive entry `paragon-archive.html`, current approved UI behavior, security boundaries, consent rules, and one-export retention policy.

**Truth-preserving implementation decisions:**

- Terms remain effective August 1, 2026, with implementation-aware Last Updated August 5, 2026.
- Secure self-service account deletion is not described as live; users are directed to Privacy/Support until the protected deletion workflow exists.
- Community Board, Q&A, suggestions, reports, developer applications, Team Gateway, Deployed hosting/submission, developer analytics, payments, moderation, email membership, and production incident monitoring are clearly labelled planned/not launched.
- Optional Analytics, tracking-cookie, and advertising categories remain disconnected and consent-gated; documentation does not create or load those services.
- August 2027 platform launch and first-100-live milestones remain planned, not completed on August 5, 2026; supplied unsupported percentage bars become honest status labels.
- System Status reports verified front-end/prepared/pending/planned states rather than the supplied false `ALL SYSTEMS OPERATIONAL` claim.
- The Deployed form is an accessible preview with conditional premium fields, counters, and file guidance, but no fake upload or submission success.
- Third-party premium/payment rules are policy for future approved deployments; Paragon does not process those transactions in the current build.

**Acceptance criteria:**

- One dedicated `paragon-archive-hub.html` page contains all eight supplied parts and the completion overview with anchor navigation.
- Terms, Community, Cookies, Developer, Deployed, Roadmap, Status, Membership, and Categories are independently linkable sections.
- Archive Hub catalogue OPEN loads the same-origin Hub page; Share/QR still target the Archive detail.
- Deployed appears as a clearly planned empty category and does not expose fake websites, developers, ratings, reviews, analytics, uploads, or payments.
- Current-state notices are prominent and no unbuilt service is described as operational.
- Footer/Account cross-links and PWA offline shell include the Hub.
- Responsive, accessibility, unique-ID, local-link, syntax, export-header, security, and all existing regression checks pass.
- A new verified v0.29.0 export replaces v0.28.0 only after exact manifest/integrity validation.

**Execution:** Completed in EOP `v0.29.0`; owner visual/legal review and protected backend activation remain in CTA §13.

### P-030 — 2026-08-05 — Full responsive consolidation, search simplification/history, paginated Updates, Hub-only pages, navigation/theme cleanup, achievements, collections, and compact disclosure

**Owner test results and accepted scope, refined:**

1. All six target resolutions now fit the background. Mark the shared outer-resolution issue as passed, while repairing remaining narrow inner surfaces: Search, Account, all See-all overlays, category listings, and the consolidated Hub sections/forms.
2. Preserve phone footer-aware bottom-navigation hiding. At widths 700px and above, keep the bottom navigation visible and dynamically shift it above the visible footer rather than hiding it or covering footer content.
3. Remove Search category filter chips and Search-overlay Browse by Category. Keep the Search input, custom autocomplete, full matching results, and add recent search history with clear/select actions.
4. When no search result matches, show the no-match guidance and a direct Request a Website route explaining that Paragon is building more.
5. Keep current weighted descriptive search as the non-AI bridge; record future intent/AI search API, indexing, typo/idea matching, privacy, and abuse controls in CTA.
6. Paginate Updates in exact batches of ten after current type/category/date filtering. Show View more only when more filtered items remain; each activation reveals at most the next ten and filters reset the visible limit.
7. Apply conditional disclosure globally where safe: long informational/documentation cards start collapsed and expose details on demand; controls appear only when overflow/additional content actually exists.
8. Remove the direct Detail Share toolbar action. Keep exact-link Copy/Share inside QR and change the Detail QR toolbar glyph to `🔗`.
9. Preserve 72-hour expiry support for future real Team-created ad/promotional notifications, but do not add a public Team creator, fake ad, or action monitoring before protected roles/backend requirements are defined.
10. Replace Account achievements with the confirmed mapping: First Visit, First Review, First Rating, First Share, Continue with Google/Email; final More Soon additionally requires Progress Starter before it becomes unlockable. Render three columns by two rows with smaller cards.
11. Remove decorative textual arrows from Back, Open, See all/View more, Account/settings rows, and similar action labels while retaining essential carousel/lightbox chevrons.
12. Replace the top-bar Account shortcut with a light/dark appearance button; Account remains in bottom navigation.
13. Enforce exclusive collection membership: moving a website to another/new collection removes it from every previous collection, so a website can belong to only one collection at a time.
14. Treat the request-page functional review and existing database-enforced rolling seven-day limit as owner-accepted; live authentication/Supabase activation remains external testing.
15. Consolidate About, Privacy, Terms, Help, and Request a Website into `paragon-archive-hub.html`; update every internal route/anchor and remove the four former standalone HTML files (Terms was already a Hub section). Merge page-specific browser behavior into Hub loading while keeping `paragon-archive.html` as the canonical Archive application entry.
16. Reduce the project only where duplication is removed safely; preserve Supabase/Brevo/schema/Edge foundations, support/request forms, privacy controls, FAQs, guide, About content, and policy truth.
17. Audit/fix broken routes, stale labels, styles, overflow, conditional controls, and regressions; update SOP/EOP/CTA and create one verified v0.30.0 export.

**Confirmed choices:**

- Consolidation: `hub-only` — one Archive Hub page; remove the four former standalone HTML pages (Terms was already in Hub) and merge the Request/Help page controllers.
- Bottom navigation: `shift-above` — at 700px+, dynamically sit above the visible footer; phones retain hide-on-footer.
- Achievements: `recommended-map` — five listed tasks, with Progress Starter added to the final More Soon prerequisite.
- Arrow removal: `text-only` — remove textual arrow glyphs while retaining essential carousel/lightbox previous/next controls.

**Acceptance criteria:**

- Archive Website/Updates/Detail plus Search, Account, overlays, category lists, and every Hub section use responsive widths at 360, 393, 800, 810, 1366, and 1440 without page overflow.
- Large-screen bottom navigation remains usable and never covers the visible footer.
- Search overlay contains no category filter/browse controls; recent searches persist by identity mode and no-result request guidance works.
- Updates pagination respects the filtered result set and exact ten-item increments.
- Detail has one `🔗` QR/link action and no duplicate Share toolbar control.
- Achievement tasks, final prerequisite, three-by-two layout, and state persistence are correct.
- Top appearance control and Account settings stay synchronized.
- Collection membership is exclusive across all create/add/move paths.
- About/Privacy/Terms/Help/Request exist only inside Archive Hub; no internal link targets a removed page and the request/help controllers are consolidated into `archive-hub.js`.
- Support/request/privacy/auth integrations remain functional from Hub and no secret or fake backend behavior is introduced.
- All automated regression, syntax, link, responsive, export-header, HTTP, credential, and ZIP manifest checks pass.

**Execution:** Completed in EOP `v0.30.0`; owner physical-device, legal, and activated-Supabase confirmation remains in CTA §13.

### P-031 — 2026-08-05 — Iframe fit, Search results mode/inline hint, product previews, return-to-intent auth, staged achievements, AI Brain, and portable handoff

**Owner test results and accepted scope, refined:**

1. Mark Galaxy S5, Pixel 7, Galaxy Tab, and Tab S6 Lite responsive behavior as passed. The remaining visual issue is the Archive Hub inside the iframe preview at laptop `1366×768` and MacBook `1440×900`; make the preview shell use the full background/viewport there.
2. Restore the iframe Preview `Open in New Tab` action on mobile beside the close button instead of hiding it.
3. Keep autocomplete below the Search input, but pressing Enter moves into a separate Play-Store-style Search Results mode. No-match/Request guidance belongs only in Results, never inside autocomplete.
4. Add an inline, case-insensitive completion hint inside the Search input based on the unique/longest common next portion of matching website names; allow accepting the hint with Tab/ArrowRight when appropriate.
5. Replace Search’s duplicate Back/X controls with one prominent Back action: Results → Search input first, then Search → prior Website context.
6. Create a third project document, `docs/AI-BRAIN.md`, containing comprehensive product/catalogue knowledge, platform rules, data sources, retrieval/ranking design, backend/API/security/privacy plan, prompt/response policy, evaluations, operations, and handoff guidance. Do not falsely claim a new trained foundation model exists.
7. Give every catalogue website a shared, data-driven same-style product preview destination so iframe OPEN displays a useful tailored experience instead of a missing-URL message; keep previews explicitly labelled as previews rather than completed products.
8. Replace cumulative Updates pagination with page replacement: View more shows the next ten in place of the previous ten, Previous returns to the prior batch, filters reset to page one, and labels remain plain `View more`/`Previous`.
9. Restrict Detail About collapse to exactly three visible lines. Show Read more only when actual rendered content exceeds those three lines; Show less returns to three.
10. Preserve the selected light/dark response and invert the top icon correctly: dark environment shows the sun/day icon (action to switch light), light environment shows the moon icon (action to switch dark), with no detectable desynchronization.
11. Add return-to-intent authentication: when a personal action redirects a signed-out user to Account, successful Guest/Email/Google activation returns to the exact prior tab/detail/scroll and resumes the intended review, bookmark, collection, or vote action where safe.
12. Replace the single final achievement model with staged groups of up to five tasks. Initial five tasks unlock the next group; Progress Starter is the first task in group two, not a prerequisite for opening group two. Continue through later groups and a shorter final group (for example 22 total), with `More Soon` showing a live simple remaining-task count.
13. Keep exclusive collection behavior, conditional Hub disclosure, textual-arrow cleanup, PWA, catalogue/details, and Hub content marked owner-passed.
14. Guest notifications may show only protected Team-created ad/promotion records with 72-hour expiry. Guest receives no welcome or catalogue-update notifications; those remain authenticated Google/Email behavior.
15. Create one additional portable single-file handoff artifact containing every project file, path, encoding, checksum, restore instructions, and metadata so another agent can reconstruct the project from one uploaded file even when ZIP import is unavailable.
16. Apply the same conditional reduction to Detail Key Features, Version History, and Updates timeline descriptions: show three items/lines first and display Read more only when additional content exists.
17. Add ten-review page-replacement pagination after review sort/star filtering: newest/default ordered ten first, View more for the next ten, Previous for the prior ten, and a smaller final page.
18. Update SOP/EOP/CTA, regression tests, PWA/cache, export manifest, and one current v0.31.0 ZIP without weakening security or the canonical `paragon-archive.html` entry.

**Acceptance criteria:**

- Hub iframe preview fills laptop/MacBook viewport; mobile New Tab is visible and usable.
- Autocomplete stays suggestion-only and disappears silently when no match; Enter opens Results mode with matching list or no-match Request guidance.
- Inline hint handles lowercase/uppercase/mixed input and never overwrites user text without acceptance.
- Search has one Back control with correct two-stage behavior.
- `AI-BRAIN.md` is the third governance/knowledge document and covers all current catalogue/platform knowledge plus future AI implementation truthfully.
- Every current site with no production URL opens the shared tailored preview route; Hub still opens the real Hub page.
- Updates shows one ten-item page at a time with Previous/View more states and filter/notification correctness.
- Detail About and Updates descriptions use three-line overflow measurement; Key Features/Version History show three items before conditional expansion.
- Review sort/star filters run before ten-review Previous/View more replacement pagination.
- Theme environment/icon/action remain synchronized.
- Pending personal intent survives same-page Guest/Email and OAuth redirect through session storage, expires safely, and resumes only allowlisted actions.
- Staged achievements unlock groups correctly and show real remaining counts.
- Guest ad/promotion visibility excludes welcome/update items and no fake campaign is created.
- Portable bundle reconstructs all current project files byte-for-byte from one JSON upload.
- All existing and expanded tests/audits pass.

**Execution:** Completed in EOP `v0.31.0`; owner device/provider/AI decisions and portable re-import test remain in CTA §13.

### P-032 — 2026-08-05 — Secure one-core Paragon AI refactor with Search intent ranking and Website Detail Q&A

**Owner clarification and selected scope:**

1. The uploaded `paragon-archive-ai.md` is JavaScript source intended to be restored as `.js`.
2. Build one Paragon AI core that can serve different functions/modes across the Archive and future products rather than unrelated AIs.
3. Use the latest `docs/AI-BRAIN.md` and live catalogue as governed knowledge.
4. First active release exposes only:
   - messy/vague intent matching for Archive Search;
   - grounded Q&A about the currently open website detail.
5. Tutor and other product-specific roles use the same future core with different allowlisted mode instructions, but remain reserved/hidden until those products are built.
6. Selected implementation choice: `secure-refactor`. Do not deploy the uploaded browser-direct multi-provider prototype unchanged.

**Security/truth refinements:**

- Remove the uploaded prototype’s hardcoded token-like BuildPico value, browser-stored provider keys, direct Groq/Gemini/OpenRouter/Pollinations calls, fake Request success, unsafe unrestricted code preview, and incomplete/stale hard-coded catalogue.
- Browser code receives no AI provider secret. A future model call must go through a protected same-origin/Supabase backend endpoint configured separately.
- The first release works locally without a model by using governed catalogue retrieval, synonyms, fuzzy matching, confidence, evidence/reasons, and deterministic Website Detail answers.
- Do not claim the system has been model-trained. `AI-BRAIN.md` is retrieval knowledge/instructions; future fine-tuning or external-model inference is a separate owner/backend decision.
- Keep one core/mode registry: Archive Search and Website Detail active; Tutor/product modes reserved.

**Acceptance criteria:**

- Safe source lives at `/ai/paragon-archive-ai.js` with export identity and no committed provider key/token.
- Module loads after catalogue data and before `app.js`.
- Archive Search delegates ranking to the AI core when available and handles typos, vague phrases, synonyms, and idea-style queries better than literal matching, with current local search as fallback.
- Every website detail includes an `Ask Paragon AI` action opening one accessible grounded assistant dialog scoped to that website.
- Detail answers use only current catalogue/Brain facts, identify concept-preview versus real Hub status, and admit unsupported questions.
- No fake external answer, Request submission, image generation, code execution, voice, translation, or provider success is exposed.
- Future backend endpoint configuration is public-path metadata only; secrets remain server-side.
- AI Brain documents the one-core/multi-mode architecture and prototype security audit.
- Uploaded disguised `.md` prototype is removed after safe migration so it cannot be accidentally shipped.
- All existing and new regression/security/export checks pass; one v0.32.0 ZIP and portable JSON replace v0.31.0.

**Execution:** Completed in EOP `v0.32.0`; owner provider/backend activation and future Tutor/product mode work remain in CTA §13.

### P-033 — 2026-08-17 — Continuation handoff: reconstruct project from renamed uploads

**Owner intent (refined):** The previous agent conversation was lost. The owner re-supplied the complete project as flattened uploads with changed extensions (`.js`→`.txt`, `.ts`/`.mjs`/`.sql`/`.webmanifest`/one `.css`→`.md`; HTML/MD/PNG intact) and instructed the new agent to read SOP and EOP first, reconstruct the project exactly, and then continue building under the existing governance.

**Refined requirements:**

- Read `docs/SOP.md` and `docs/EOP.md` fully before any action (owner instruction; SOP "How to use").
- Reconstruct every file at its `EXPECTED PROJECT PATH` by trusting the internal `PARAGON ARCHIVE — EXPORT IDENTITY` headers over uploaded filenames, per SOP §3A.
- Restore the exact directory layout, correct extensions, and content byte-for-byte from the uploads.
- Validate reconstruction: JS syntax checks, manifest JSON validity, and the dependency-free regression fixtures.
- Report any missing or failing artifact honestly instead of recreating source silently (P-005, P-009).

**Findings recorded at reconstruction:**

- 45 of 46 manifest files were supplied initially; `/supabase/functions/submit-support-message/index.ts` had been overwritten during the owner's single-folder export because both Edge Functions share the filename `index.ts`. The owner re-supplied both files and the missing one was restored in EOP v0.32.3; all 46 files are now present.
- `tests/metrics-carousel.test.js` fails on 2026-08-17 due to fixture date staleness, not an application bug: the fixture records views at fixed 2026-08-04 timestamps, while `data/metrics.js` `pruneState()` drops view events older than eight days relative to real `Date.now()` on every `saveState()`. The fixture passed when written on 2026-08-05 and its fixed dates have now aged out. A fixture-only fix (deriving test dates relative to the current date) awaits owner confirmation.

**Execution:** Recorded in EOP `v0.32.1`–`v0.32.3`; reconstruction complete with 46/46 files and all 13 fixtures passing.

### P-034 — 2026-08-17 — Owner CTA test feedback: AI search suggestions, multi-review honesty, real sharing, achievement expansion, Paragon Templates, and the three-page Archive Hub

**Owner intent (refined):** After completing most CTA §13.A device tests successfully, the owner requested: (1) real Paragon AI suggestions in Results-mode no-match for any typed/mistyped/vague idea, with the Request fallback below and an honest no-suggestions state; (2) unlimited reviews per user with per-review editing, permanently zero-seeded honest helpful votes, and a review search; (3) real sharing into installed apps (WhatsApp, Telegram, Messenger, X, Facebook, notes, browsers, and so on) while Copy link and QR keep their roles; (4) more achievements that drive Archive Hub, tools, and social engagement; (5) steps to obtain/enter the Supabase URL and anon key plus everything else needed; (6) begin building the Archive Hub as the first real product with three navigated pages — Documentation (all former landing content), Community (account-linked one-time join, never Guest), and Team (login template) — with the final landing layout to be supplied later; (7) add a "Website Template" product to the catalogue for future paid templates with Archive hosting; (8) optional stylistic polish is delegated; additional Hub page ideas go to CTA. The owner also set the standing all-resolution rule now recorded as P-015.

**Execution:** Recorded in EOP `v0.33.0`. Supabase/Brevo activation, the owner's Hub landing layout, payment/hosting for Paragon Templates, and Community/Team backends remain owner/backend work in CTA §13.


### P-035 — 2026-08-17 — Owner-supplied Archive Hub landing page

**Owner intent (refined):** The owner supplied the exact landing layout for the Archive Hub Home page: topbar with ◈ brand, 🔍 search, and 👤 Team Login; a wide cinematic hero ("PARAGON ARCHIVE HUB — The gateway to everything Paragon"); four quick cards (Docs, Roadmap, Join Community, Stats); a live stats band; Documentation preview with See all; a Roadmap preview list; a Join the Community banner; Community Discussions preview; Most Requested Websites preview; a developer application banner; and Official Documents chips. All former landing/documentation content stays inside the Documentation page.

**Honesty adjustments applied (P-009/D-081/D-084):** the mock's illustrative numbers (12,450 users, 3,891 reviews, 247 requests, "Launch Complete", "First 100 Websites Live") are replaced by real values — live catalogue counts, the zero-safe request aggregate, real Community-member counts — and truthful roadmap states ("Archive catalogue documented", "Archive Hub published", Community "In Progress", Developer portal "Coming Soon", Mobile app "Planned").

**Execution:** Recorded in EOP `v0.34.0`. Community discussions and request-upvote lists render honest placeholders until their backends exist.


### P-036 — 2026-08-17 — Full Roadmap view from the owner's layout

**Owner intent (refined):** Clicking the landing Roadmap "See all →" opens a dedicated full Roadmap view using the owner's supplied layout: a status line, then ✅ COMPLETED, 🔄 IN PROGRESS (with progress bars), and 📅 PLANNED groups on a dotted timeline rail.

**Honesty adjustments applied (D-084):** "All Systems Operational" is replaced by the truthful foundations status linked to System Status; the August 2027 launch and First-100 milestones stay under PLANNED as targets rather than completed; the mock's unsupported 65%/20% bars are replaced by percentages computed live from visible six-item milestone checklists rendered beneath each bar.

**Execution:** Recorded in EOP `v0.35.0`.


### P-037 — 2026-08-17 — Team Secure Access screen from the owner's layout

**Owner intent (refined):** Pressing the Team navigation tab shows a centered secure-access screen: ◈ PARAGON ARCHIVE HUB brand, "TEAM SECURE ACCESS — Authorized personnel only", a card with Team Email + Access Key + SECURE LOGIN 🔐, a members-only warning, and "← Back to Archive".

**Honesty adjustment:** the warning reads "will be logged and reported when the protected gateway activates" because no logging backend exists yet (P-009); the no-fake-login template behavior is unchanged and the honest-state disclosure remains as a compact expandable note.

**Execution:** Recorded in EOP `v0.36.0`.


### P-038 — 2026-08-17 — Full audit, bug fixes, back/forth flows, and modern motion polish

**Owner intent (refined):** Before stepping away, the owner requested a whole-project quality pass: find and fix bugs, missing pieces, and broken links; verify back-and-forth navigation returns users properly after completing actions; and raise the UI/UX with modern styling and animation wherever appropriate.

**Audit results:** all local file links across the three pages resolve; every Hub anchor target exists; all app→Hub deep links land correctly. Bugs found and fixed: (1) the Hub and product-preview pages ignored the saved light theme — an early inline theme bootstrap now applies it on all three pages before paint; (2) re-clicking a link whose hash was already active did not scroll; (3) roadmap progress bars set widths while hidden and never animated; (4) Community membership had no return affordance after joining.

**Polish delivered (motion respects prefers-reduced-motion):** Hub page-panel entrance transitions, hero ken-burns drift with staggered text reveal, scroll-reveal landing sections, live stat count-up, join celebration pulse, tab shine hover, card hover elevation, unified focus-visible rings, and light-theme tuning for every new surface.

**Execution:** Recorded in EOP `v0.37.0`.


### P-039 — 2026-08-17 — Deployed website detail template from the owner's layout

**Owner intent (refined):** The owner supplied the detail-page layout for future Deployed (third-party) websites: hero screenshot, icon + name + "by @developer" byline with Deployed tag, stats row, a 💎 premium-features disclosure card (FREE vs PREMIUM columns, price, "purchases handled by the developer, not Paragon Archive"), About this Website, an About the Developer card (handle, bio, joined date, deployed count), screenshots, What's New, Ratings & Reviews, and Similar Deployed Websites.

**Honest implementation (D-082/D-083):** the template is built into the live detail renderer and activates for any future record carrying `developer`/`premium` data or the Deployed category. Because no real Deployed website may be fabricated, the layout is demonstrated through a clearly labelled illustrative example ("My Cool App" by @JohnDev) that lives outside the public catalogue — never in lists, search, rankings, metrics, or visit history — reachable only from the Hub Deployed documentation preview link, with a prominent on-page banner stating every value is an example.

**Execution:** Recorded in EOP `v0.38.0`.


### P-040 — 2026-08-17 — Deploy submission form from the owner's layout

**Owner intent (refined):** The owner supplied the exact Deploy-your-website form layout: hero pitch ("Host your website inside the world's free website archive…"), field order Name → Creator Name → Description with counter → Sub-Category → premium radio with conditional free/premium listing → a combined "Website Files or URL" either/or field (ZIP upload OR hosted URL) → Icon → Screenshots (3–8) → Contact Email → four agreement checkboxes → SUBMIT FOR REVIEW 🚀 → the 7–14 day review/notification note.

**Honest implementation (D-083 unchanged):** the form remains a local-only validation preview that uploads and sends nothing; the pitch and review-time note are framed as the future programme's process ("when submissions open"), and the on-form status still states plainly that submissions are not open.

**Execution:** Recorded in EOP `v0.39.0`.


### P-041 — 2026-08-17 — Roadmap v2 with Coming Soon Paragon products

**Owner intent (refined):** Update the full Roadmap view to the revised layout: "THE PARAGON ROADMAP" title; Mobile App moves into IN PROGRESS with a progress bar; Developer entry renamed "Developer Portal and Deployed Category"; PLANNED becomes Websites 101–200, Multi-language, and a new Paragon Archive Desktop App; a new "🔮 COMING SOON — NEW PARAGON PRODUCTS" group introduces 🧬 RxLife Network, 💊 Pharmapaedia, 🌐 More Paragon Platforms, and 🏗️ Paragon Ecosystem with the owner's descriptions; the founder quote closes the page.

**Honesty handling:** launch/First-100 remain PLANNED targets (D-084); all three progress bars stay milestone-derived (Community 3/6, Developer 2/6, Mobile App 1/6 via the live PWA foundation) — no hand-written 65/20/10 values; Coming Soon products are presented as future concepts, not operating platforms. The landing Roadmap preview was synchronized (Developer In Progress, New Paragon products Coming Soon).

**Execution:** Recorded in EOP `v0.40.0`.


### P-042 — 2026-08-17 — Under Construction stage for every unfinished website

**Owner intent (refined):** When OPEN is clicked on any catalogue website that is not yet built, the user should first see a placeholder "Under Construction / Coming Soon" landing stage — bold "We're building something" headline, a status line asking visitors to check back, a stylized orange progress bar, and a clean dark minimal layout — with a control to view the existing concept documentation (the planned-experience content already prepared for every product) beneath it.

**Implementation notes:** the shared `paragon-product-preview.html` route (already the OPEN destination for all 105 unfinished products) now renders a full-viewport construction stage first: floating product icon, "We're building something", per-site status line, an indeterminate orange sweep bar (visual cue only — explicitly labelled "no launch date claimed" so no fake percentage or countdown is shown), a "📖 View the concept documentation" button plus a scroll hint that reveal and smooth-scroll to the complete existing concept preview, and a Return-to-Archive-detail link. Reduced-motion users get a static bar and instant reveal. One shared page continues to serve every unfinished product (D-098) — no per-site placeholder files were created.

**Execution:** Recorded in EOP `v0.41.0`.


### P-043 — 2026-08-17 — Six-step Community join wizard from the owner's flow

**Owner intent (refined):** Community joining follows six explicit steps: (1) have a real Paragon Archive account — Guests cannot join; (2) go to Archive Hub → Join Community; (3) read and accept the Community Guidelines via a required checkbox; (4) verify the account email through a verification link; (5) complete the community profile — display name, optional-but-encouraged short bio, interests from the category list; (6) you are in — badge on the profile plus access to the discussion board, Q&A, suggestions box, early-access notifications, beta invites, the monthly update email, and community credits.

**Implementation notes:** the Community page now renders a live six-step tracker (numbered marks turn to green checks as each step completes in real time), a join form enforcing the guidelines checkbox and display name with interest chips, and a member panel showing the 👥 COMMUNITY MEMBER badge, display name, joined date, interests, and the full benefits list — backend-dependent benefits are individually labelled (boards/Q&A/suggestions open with the Community backend; the monthly email starts with email activation). Step 4 reads the real Supabase email-confirmation state once providers are activated and is labelled pending until then; membership records now store displayName, bio, interests, and guidelinesAcceptedAt with pendingBackendSync for the future backend. One-join-forever semantics are unchanged.

**Execution:** Recorded in EOP `v0.42.0`.


### P-044 — 2026-08-17 — System Status page from the owner's layout

**Owner intent (refined):** Rebuild the Hub System Status section to the supplied layout: a Current Status banner with last-checked time, eight per-component rows (Core Platform, Website Iframe System, Authentication, Database, Updates System, Community Platform, Deployed Platform, Notifications) each with a colored status dot and description, a five-level STATUS LEGEND, a RECENT INCIDENTS section, and the report-an-issue email with the System Status subject.

**Honesty adjustments (standing D-084/§12 rule):** "ALL SYSTEMS OPERATIONAL" and "No incidents in the last 30 days ✅" cannot be published before monitoring exists. The banner reports FRONT-END PREVIEW AVAILABLE with a live locally-computed last-checked time explicitly labelled as a page check; each component carries its true state (Core/Updates: operational front-end preview; Iframe: operational with limitations; Community: partially available — wizard live, boards pending; Auth/Database/Notifications: prepared awaiting activation; Deployed: planned); the legend shows both the pre-launch readiness states in use now and the owner's five production states that activate with monitoring; Recent Incidents states plainly that the incident feed begins at launch.

**Execution:** Recorded in EOP `v0.43.0`.


### P-045 — 2026-08-17 — Real build-percentage loader and 7-day vertical Recently Added

**Owner intent (refined):** (1) The construction page's loading bar must show each website's REAL build percentage — 0% built shows an honest empty bar at 0%, and websites with actual construction progress show their true number; the bar must never pretend to fill. (2) The Recently Added "See all" view should scroll vertically (up-down) instead of the horizontal swipe rail. (3) Recently Added should list only websites added within the last 7 days — not the whole catalogue — still newest to oldest.

**Implementation notes:** catalogue records support an optional `buildProgress` (0–100) that defaults to 0; the construction bar is now determinate with a count-up animation to the real value, aria progressbar semantics, and copy stating "this is the real build percentage… it only rises as {site} is actually built" (Paragon Archive Hub opens its real page, so no bar applies). Recently Added preview and overlay both use a 7-day cutoff with honest empty states when nothing qualifies, and the overlay rail became a centered vertical column. The search-navigation fixture computes its expectations with the same 7-day rule so it can never go date-stale.

**Execution:** Recorded in EOP `v0.44.0`.


### P-046 — 2026-08-17 — Line-by-line SOP/EOP audit, reality pass, and Account upgrades

**Owner intent (refined):** Re-audit the SOP and EOP line by line; list every unimplemented/blocked feature and record what it is waiting on in the CTA for the owner to provide later; hunt broken flows; convert remaining unreal data to real user-action-driven values; improve layouts, especially the Account tab.

**Audit outcome:** all front-end features recorded through P-045 are implemented; every remaining open item is externally blocked and now itemized in CTA §13 (Supabase keys/schema/providers, Google OAuth, Brevo/email activation, support Edge deployment, real product builds/URLs/assets, founder photo, guide screenshots, demo-review decision, RxLife/Pharmapaedia go-ahead, production origin, backend programmes). Link/anchor audit across all three pages: zero broken references.

**Reality pass (D-126):** removed the hashed 12k–64k seeded view totals — `getViewCount` now returns only genuinely recorded views, so detail stats, hero, Trending, and Staff rankings are driven entirely by real user actions (ties fall back to rating/review/name ordering until activity accumulates); ranking summaries updated to say so. Seeded review votes were already removed in D-109; the remaining non-real display data (inherited demo reviews/ratings, placeholder imagery, Creator Demo identity) is documented as owner decisions in the CTA.

**Account upgrades (D-127):** profile badges now include a real 👥 Community Member chip read from the Hub membership record; a new achievement-progress strip (completed/total with animated bar) sits under the stats; settings gained a state-aware Paragon Community row (Member / Join / real-account-required).

**Execution:** Recorded in EOP `v0.45.0`.


### P-047 — 2026-08-17 — Stale service-worker cache made new features disappear in exported browsers

**Owner report:** After exporting the code and opening it in a browser, the Under-Construction page (shown after OPEN) and other features were missing.

**Root cause:** the service worker served assets cache-first, and `CACHE_NAME` had not been bumped since v0.33.0 — any browser that installed the v33 worker kept serving the old `app.js`, `style.css`, `product-preview.js`, `archive-hub.js`, and data files forever, while navigations fetched fresh HTML. Everything shipped between v0.34.0 and v0.45.1 (Hub pages, landing, roadmap, Team screen, Community wizard, System Status, construction pages, real views, Account upgrades) was invisible to such browsers. No feature was actually removed — a runtime simulation confirmed the construction page renders correctly.

**Fix:** `CACHE_NAME` bumped to `paragon-archive-v46`; asset fetches switched to stale-while-revalidate (cached copy answers instantly, network copy refreshes the cache in the background) so future updates self-heal after one reload; standing rule P-016 added so every shell-changing delivery bumps the version.

**Execution:** Recorded in EOP `v0.46.0`.


### P-048 — 2026-08-17 — Paragon Quiz: the first real product build

**Owner intent (refined):** Build Paragon Quiz as a real working website inside the Archive using the supplied structure (index/explore/create/play/results + css/js modules) and the owner's exact HTML for the landing, explore, and create pages; the agent completes play.html, results.html, the full stylesheet, and all five JavaScript modules in the same design language.

**Implementation notes:** the product lives at `/paragon-quiz/` on the same origin per `auth/INTEGRATION.md`. Quizzes, plays, results, and best scores persist in dedicated localStorage keys; home stats (quizzes/plays/questions) are real live counts starting from genuine zero; three starter quizzes are authentic Paragon-Team-authored content (labelled "Starter", zero plays, no fake community activity); Popular ranks by real play counts; Explore has live search, category/difficulty filters, and four sort modes; Create enforces title/description/category/difficulty, at least 3 complete questions with 2+ options each, live counters, preview, and success modals; Play offers an intro with personal best, per-question countdown with urgency state, letter-keyed options with correct/wrong feedback, live score, and quit confirmation; Results shows an animated score ring, verdict tiers, new-best detection, full answer review (including timed-out answers), retry, and native share with clipboard fallback. The catalogue record now points to the live `paragon-quiz/index.html` destination (previewOnly removed, v1.0 — Aug 17, 2026), expansion merges support definition siteUrl/version, and the product-preview fixture tracks live sites.

**Execution:** Recorded in EOP `v0.47.0`. Cross-account sync of quiz content awaits Supabase activation (CTA §13).


### P-049 — 2026-08-17 — Team secure login portal (PAGE 0) with escalating lockout

**Owner intent (refined):** Build the dedicated Team login portal at /team/login: ◈ PARAGON TEAM branding, "Secure Team Access Portal", email + password with a Show toggle, 🔐 SECURE LOGIN, Forgot-your-password link, members-only warning, and "← Back to Archive Hub"; entry is a hidden lock-icon-only link at the bottom of the Archive Hub page. Failed-login policy: attempts 1–2 show wrong-credentials, attempt 3 warns of 2 remaining, attempt 4 warns of 1 remaining, attempt 5 locks for 30 minutes and notifies the platform owner with IP and timestamp.

**Implementation notes (honesty preserved):** the attempt counter, escalating warnings, 30-minute lockout with live countdown, disabled-form state, and post-expiry reset are fully real on-device (persisted, survives reloads). Because server-side Team authorization is not activated, no credential can succeed and none is transmitted; every attempt is genuinely counted as failed. Lockout incidents are recorded locally with timestamps and flagged pendingBackendDispatch — the owner email with IP attaches when the security backend activates (a browser cannot see its own IP), and the warning copy states this precisely. Forgot-password routes to the owner mailbox with the Team Password subject. The Hub Team tab links to the portal, and the hidden 🔒 sits in the Hub footer at low opacity.

**Execution:** Recorded in EOP `v0.48.0`. A simulation bug fix is included: the attempt counter now resets cleanly when a lockout expires instead of instantly re-locking.


### P-050 — 2026-08-17 — Team first-login password setup and session-timeout guard

**Owner intent (refined):** Two additions to the Team portal. (1) First-login screens: Super Admin via 24-hour email link — pre-filled email, Create Password with a strength meter, Confirm Password, "✅ SET PASSWORD & ENTER", policy of at least 12 characters with uppercase, numbers, and symbols; other roles get the same layout plus "Your initial password was sent to your email. You must create a new password before continuing." with the initial system-generated password field. (2) A session-timeout warning modal at 29 minutes of idle time: ⚠️ "Your Session Is About to Expire", 60-second countdown box, "Any unsaved work may be lost.", Stay Logged In / Log Out Now, and any click anywhere fully resetting the 30-minute timer.

**Implementation notes (honesty preserved):** /team/setup.html serves both variants (?mode=admin | ?mode=role) with a live 5-level strength meter, real rule checklist that ticks as each requirement is met, confirmation matching, and a REAL 24-hour expiry check against the link's ts parameter (expired links disable the form). Because the backend is inactive, a valid submission confirms policy compliance and states that provisioning/dashboard entry activate later — no password is stored or transmitted and no fake dashboard opens. /team/session.js is the reusable idle guard for every future team page (currently active on setup): 29-minute idle warning, 60-second countdown with auto-logout to login.html?timeout=1, Stay/Log-Out controls, click-anywhere reset that never silently dismisses the open warning, and test-injectable durations. The login page shows an inactivity notice on ?timeout=1 and links both setup variants for preview.

**Execution:** Recorded in EOP `v0.49.0`.


### P-051 — 2026-08-17 — Team Overview Dashboard (PAGE 1) with role matrix

**Owner intent (refined):** Build team/overview — the dashboard all roles land on: topbar (brand, 🔔 count, 👤 name with role badge), time-aware greeting, QUICK STATS (users/websites/reviews/plays), PENDING ACTIONS cards (tickets, bugs, deployed pending, dev apps, flagged reports) with View/Review links, RECENT ACTIVITY timeline with actor links and relative times, CHARTS (new-users bar chart with hover counts; category-popularity pie), QUICK ACTIONS row, and the exact role-visibility matrix: Super Admin/Admin see everything; Developer only website stats and own bug reports; Moderator pending reports/reviews/community; Support tickets/bugs/requests; Analyst stats and charts only.

**Honest data sources:** the mock's example numbers are replaced by real values — Websites: live catalogue count with live-product subcount; Reviews: real published catalogue reviews; Quiz Plays: genuine device plays; Total Users: honest — until the accounts backend; backend queues (tickets/bugs/deployed/devapps/flags) show their true zero with activation notes plus a real Portal Lockout Incidents card; the activity feed assembles genuine local events (product launches, catalogue additions, community joins by display name, quiz publications, security lockouts) with true relative timestamps; the users bar chart renders real zeros with hover labels until accounts exist; the pie chart shows the true catalogue family distribution via conic-gradient. A preview-role switcher drives the matrix until backend claims replace it; future-page buttons toast honestly; the session guard runs on the page.

**Execution:** Recorded in EOP `v0.50.0`.


### P-052 — 2026-08-17 — Team All Websites manager (PAGE 2)

**Owner intent (refined):** Build team/websites: header with + Add Website; search, category, status, and sort filters; a count line; one row per website with icon, name, category, status badge, stats line, version, and per-status action buttons; and the five status badges (🟢 Live, 📝 Draft, 📅 Scheduled with go-live date, 🟡 Under Review, 🔴 Archived with the 90-day window).

**Honest implementation:** rows list the real 107-site catalogue with true per-site data (real recorded views, real ratings/review counts, real versions); statuses derive from reality (Hub and Quiz = Live; the 105 concept previews get an added 🧭 Concept Preview badge because they are genuinely public preview entries, not team-only drafts). Team status changes (Archive with a real 90-day countdown, Schedule with date, Under Review, Approve, Restore) and catalogue edits save as clearly-flagged local team overrides that sync to the public catalogue at backend integration — the public Archive is untouched meanwhile. + Add Website creates genuinely team-only drafts (name/icon/category/description/version) that never enter the public catalogue; Publish honestly explains drafts become public through catalogue integration; Delete Draft works with confirmation. View Stats expands real device stats; View on Archive deep-links each site.

**Execution:** Recorded in EOP `v0.51.0`.


### P-053 — 2026-08-17 — Add Website editor (PAGE 3)

**Owner intent (refined):** Build the full team/websites/add editor: BASIC INFORMATION (name, 150-char short description, 1000-char full description with counters, category/sub-category/difficulty), MEDIA (icon 200×200, card preview 800×400, hero 1200×600, 3–8 detail screenshots), TECHNICAL (internal path or iframe URL, version), dynamic KEY FEATURES, enter-to-add TAGS with removable chips, WHAT'S NEW notes, and PUBLISH SETTINGS (Draft / Publish Immediately / Schedule with date+time; featured flags for Staff Pick, Trending, and Website of the Day with date), with Save Draft and Publish in header and footer plus Cancel.

**Honest implementation:** implemented at /team/add-website.html. Image uploads are genuinely checked client-side — type filtering plus real dimension verification against each expected size with ✅/⚠️ feedback, and a 3–8 count gate on screenshots; asset storage uploads happen at backend integration. Save Draft writes a complete record into the shared PAGE 2 manager store (features, tags, media check results, publish settings, featured flags), appearing immediately as a team-only 📝 Draft while the public catalogue stays untouched. Publish enforces every required field and asset, then stores the record flagged ready-to-publish with an honest note that public launch happens through catalogue integration; scheduling stores the chosen date/time for the future auto-go-live backend. All + Add Website entry points now route to this editor.

**Execution:** Recorded in EOP `v0.52.0`.


### P-054 — 2026-08-17 — Deployed website review console (PAGE 4)

**Owner intent (refined):** Build team/websites/deployed: status filter tabs (All/Pending/Approved/Rejected/Under Review), submission cards with status badge and date, submitter/category/pricing metadata, View Files / View Screenshots / Preview Website actions, the eight-item REVIEW CHECKLIST, team-only internal notes, and the decision row — 🔄 Put on Hold, ❌ Reject with Reason, ✅ Approve.

**Honest implementation:** implemented at /team/deployed.html over a device-local submissions store that is honestly EMPTY — no fake queue exists because the Deployed programme has not opened. A clearly-labelled illustrative example (My Design Tool by @JohnDev, the established D-118 fixture identity) can be loaded to exercise the entire workflow for real: checklist state persists per item with an X/8 counter, Approve stays disabled until all eight items are checked, Reject requires a written reason, Hold toggles with resume, decided cards lock their checklist/notes and offer Reopen, and internal notes autosave. Approval/rejection honestly note that public listing and developer notification emails activate with the hosting backend; file/screenshot buttons explain real assets arrive through the upload backend; Preview opens the illustrative Deployed detail template.

**Execution:** Recorded in EOP `v0.54.0`.


### P-055 — 2026-08-17 — User management (PAGES 5–6)

**Owner intent (refined):** PAGE 5 (team/users): search by username/email, role/status/sort filters, total count, and user rows with avatar, identity, joined/last-active, activity numbers, status badge (including "Suspended (N days remaining)"), and View Profile / Suspend / Lift Suspension / Ban / Delete actions. PAGE 6 (team/users/[id]): full team profile — identity block with IP/device, five activity stat boxes, moderation history, IP history, their reviews with per-review delete, community posts, and the action set (Email User; Suspend via duration+reason modal; Ban with confirm; Delete as Super Admin only with confirm).

**Honest implementation:** the roster is genuinely empty until Supabase accounts exist; Community joins on this device appear as real local identities (flagged "real · this device") with backend-pending stats; the labelled illustrative pair (username123, spammer999 — the latter arriving pre-suspended with a real 3-day countdown) exercises everything. Moderation is real and persistent: suspensions carry live remaining-day counts and auto-lift on expiry, bans and deletions record confirmations, every action lands in a per-user history queued pendingBackendSync, and Super-Admin-only deletion states that backend claims enforce the restriction. IP address, device, and IP history honestly state server-side capture at activation; review deletion records the action for backend application; community posts state the boards are not open.

**Execution:** Recorded in EOP `v0.54.0`.


### P-056 — 2026-08-17 — Support ticket desk (PAGE 7)

**Owner intent (refined):** PAGE 7 (team/tickets): searchable ticket list with status/priority/topic/assignee filters and cards showing number, priority, subject, status, sender, time, excerpt, and assignment; plus the individual ticket page (team/tickets/[id]) with the full conversation thread (user vs team bubbles), reply box with attachment, Send Reply / Send & Mark Resolved / Close Ticket, team-only internal notes, and live priority/status/assignee controls with Reassign.

**Honest implementation:** the queue is genuinely empty until the Help & Support backend delivers real submissions; the labelled illustrative tickets #246 and #247 (spec content, spec states) exercise the entire desk. The workflow is fully real on-device: replies append to the thread marked "queued for email dispatch at backend activation" and auto-advance Open → In Progress, Send & Mark Resolved and Close/Reopen persist, priority/status/assignee changes and autosaving internal notes persist, urgent tickets sort first, and closed tickets lock their reply box. The assignment roster is labelled example until real team accounts exist; attachments record their filename for backend dispatch.

**Execution:** Recorded in EOP `v0.55.0`.


### P-057 — 2026-08-17 — Bug report desk (PAGE 8)

**Owner intent (refined):** PAGE 8 (team/bugs): a what-counts-as-a-bug reminder for the team at the top; search plus website/status/priority filters; bug cards with number, website — title, reporter with View User, timestamp, browser/device, priority and status badges, screenshot-attached indicator, and View Full Report.

**Honest implementation:** the queue is honestly empty until reports flow through the support backend; the labelled illustrative bug #89 (Paragon Notes PDF-export crash, spec metadata) exercises triage. View Full Report expands inline with steps/expected/actual, the attachment line (real files open from private storage at activation), live priority/status selectors, and autosaving internal notes; marking Fixed queues the reporter notification; high-priority reports sort first; the website filter is built from the real catalogue.

**Execution:** Recorded in EOP `v0.56.0`.


### P-058 — 2026-08-17 — Requests desk, Announcements, and the full dashboard sidebar (PAGES 9–10 + navigation shell)

**Owner intent (refined):** PAGE 9 (team/requests): sort by most requested, category/status filters, request cards with 🔥 counts, description, status badge, per-status transitions (In Progress/Rejected/Complete/Reopen), and Send Update to Requester(s). PAGE 10 (team/announcements): five-type composer (New Website/Updated/Maintenance/Special/Featured) with title, message, optional image, Publish Now or Schedule with date+time, Preview/Save Draft/Publish, and the published list with Edit/Delete/View on Archive. Plus the full collapsible left sidebar as the post-login navigation shell with the owner's complete section map (Websites, People, Content, Tasks, Publish, Analytics, Team, System, profile/back/logout).

**Honest implementation:** requests queue is empty until the Supabase request table activates (the public live count already works); labelled illustrative examples (Paragon Maps 247, Paragon Translate V2 189) exercise the workflow; requester updates queue pendingBackendDispatch. Announcements persist for real with drafts/scheduled/published lists, edit/delete/publish-now, and published records flagged pendingFeedSync for the public Updates feed at integration — nothing fake posts publicly. The shared sidebar (nav.js) injects into all eleven dashboard pages: desktop collapsible with persisted state, mobile off-canvas with floating burger, active-page highlighting, real deep-links for Scheduled/Archived/Banned via new URL-param filter presets, a real Roadmap link to the Hub view, and honestly-labelled "soon" entries for unbuilt sections (Dev Applications, Content trio, Analytics trio, Team trio, System pair, My Profile).

**Execution:** Recorded in EOP `v0.57.0`.


### P-059 — 2026-08-17 — Roadmap management and platform analytics (PAGES 11–12)

**Owner intent (refined):** PAGE 11 (team/roadmap): a four-group roadmap manager (Completed / In Progress with editable progress bars / Planned / Coming Soon future products) with + Add Roadmap Item, Edit, Delete, group moves (Mark Complete, Move to In Progress/Planned), an Update Progress percent control, and per-item 🌐 Public / 🔒 Private visibility. PAGE 12 (team/analytics/platform): stat cards (users, new today, plays, reviews), Export CSV, date range, and ten chart sections (users over time, category popularity, most visited top-10, device breakdown, users by country, new users per week, ticket categories, bugs per week, requests by category, Deployed-vs-Paragon ratio).

**Honest implementation:** the roadmap manager seeds from the REAL public roadmap (16 items exactly as published in v0.40.0 — launch milestones stay planned per D-084; in-progress items carry their true milestone-derived 50/33/17). All CRUD/moves/visibility/percent edits persist and flag pendingPublicSync; hand-set percentages note that the public page keeps milestone-derived honesty until sync (D-116). Analytics charts real local data everywhere it exists — genuine quiz plays, real recorded top-10 views, true catalogue category distribution and Deployed ratio, live desk-store breakdowns (tickets by topic, requests by category, bugs per week) — while user/device/country charts state plainly that server-side capture activates them; Export CSV downloads the actual displayed numbers. The sidebar now routes Roadmap and Platform Stats to the real pages.

**Execution:** Recorded in EOP `v0.58.0`.


### P-060 — 2026-08-17 — Team members and member profiles (PAGES 13–14)

**Owner intent (refined):** PAGE 13 (team/members): the roster with + Invite Team Member (modal: full name, email, role from Admin/Developer/Moderator/Support/Analyst, and the system-generated-password email note), member cards with role, joined date, last active, action counts, and View Profile / Change Role / Remove from Team. PAGE 14 (team/members/[id]): member profile with identity/status, four activity stat boxes (total actions, websites added, tickets resolved, reviews removed), recent activity timeline, and Super-Admin-only admin actions (Change Role / Suspend Access / Remove from Team).

**Honest implementation:** "Paragon" (Super Admin, joined August 1 2026 — the real project start) is the one genuine member, and their action total is COUNTED LIVE from this device's actual dashboard stores (drafts created, catalogue overrides, ticket replies and resolutions, announcements, roadmap edits, deployed decisions, user-moderation history, bug triage, request management) with the same real events powering their recent-activity timeline. Invitations record genuinely with pendingBackendDispatch (the password email sends at security-backend activation; the invite even previews its role-mode setup link) and can be cancelled; the labelled illustrative member (Admin John, spec values) exercises Change Role / Suspend / Remove, all persisting as overrides flagged for backend claims. The owner account cannot be suspended or removed, and the Super-Admin-only section states that backend claims enforce the restriction at activation.

**Execution:** Recorded in EOP `v0.59.0`.


### P-061 — 2026-08-17 — Activity log and the 90-day archive vault (PAGES 15–16)

**Owner intent (refined):** PAGE 15 (team/activity): a searchable, filterable activity log (team member, action type, date) grouped under day headings (TODAY — …), each entry showing the action headline, detail, actor with View Member, and contextual links, plus Export CSV. PAGE 16 (team/archive): the deleted-data vault holding records for 90 days before permanent deletion, with sections for deleted users, archived websites, deleted reviews, and closed tickets, per-record deletion metadata, live remaining-day counts, and View Data / Restore / Delete Now (Super Admin).

**Honest implementation:** the activity log aggregates ONLY genuinely recorded actions from eleven dashboard stores (drafts, catalogue overrides, deployed decisions, ticket replies, user moderation with reasons, announcements, team invitations, requester updates, portal lockouts, community joins, quiz publications), attributed to "Paragon (this device)" until real team accounts attribute multi-member actions; Export CSV downloads the true filtered log. The vault reads real records — users deleted from the Users desk, websites archived in the manager, closed tickets — each with its genuine 90-day countdown (29 days elapsed → 61 remaining, matching the spec math); Restore actions genuinely reverse state, Super-Admin purges record the intent for server-side execution at activation (catalogue websites live in public data files, honestly noted), and ticket purges truly delete local records.

**Execution:** Recorded in EOP `v0.60.0`.


### P-062 — 2026-08-17 — My Profile, spec confirmation modals, linking map, and access summary (PAGE 17 + finishing suite)

**Owner intent (refined):** PAGE 17 (team/profile): the team member's own profile — photo with Change Photo, identity block, MY STATS (total actions, websites added, websites managed, days on team), EDIT PROFILE (display name, email, change password with current/new/confirm), Save Changes, and ACTIVE SESSIONS with log-out-all-others. Plus: the complete linking map across all team pages, three specified confirmation modals (Ban User Permanently with required reason and consequence bullets; Delete Website Permanently with the cannot-be-undone warning; Remove Team Member with access-revoked/activity-preserved copy), and the full page/role access summary table.

**Honest implementation:** My Profile counts every stat live from real dashboard stores; Days on Team is the genuine count since August 1 2026 (17 today — the mock's 365 assumed 2027); profile/photo edits persist locally flagged pendingBackendSync; password changes enforce the same real 12+/upper/number/symbol policy as the setup page and queue for backend application with nothing transmitted; Active Sessions lists only this device's real session (browser/OS parsed from the true user agent) with server-side session tracking honestly deferred. A shared ParagonTeamConfirm modal system now lives in nav.js and powers the three spec modals — ban (both user surfaces, reason required), permanent website deletion (archive vault), and team-member removal — replacing browser prompts. The linking map is complete for every built page (sidebar My Profile now live; member-profile links to the activity log); the access-summary table is recorded here as the authoritative role-permission map that backend claims will enforce: per the owner's table, from Login/Setup/Overview/Profile for all roles through Settings for Super Admin only.

**Execution:** Recorded in EOP `v0.61.0`. Remaining sidebar pages (Dev Applications, Content trio, Website/User analytics, Permissions, Settings) await their specs.


### P-063 — 2026-08-17 — Final role hierarchy and the complete permissions matrix

**Owner intent (refined):** The definitive governance artifact for the Team dashboard: the six-role FINAL HIERARCHY (1 Super Admin — full control · 2 Admin — everything except removing Super Admin · 3 Developer — own websites · 4 Moderator — reviews/reports/community · 5 Support — tickets/bugs/requests · 6 Analyst — stats only) and the complete 37-action permissions table with per-role allow/deny/qualified values (own only, limited, own websites, own level & below).

**Implementation:** encoded as the machine-readable authority in /team/permissions.js — ParagonTeamPermissions exposes the hierarchy, the full matrix, can(role, action) with qualifier passthrough, rank comparison, and canManageMember (Admin can never touch the Super Admin; nobody removes the owner). The 🔑 Permissions sidebar page went live, rendering the hierarchy cards and the complete table DIRECTLY from the module — the page can never drift from the law — with a role-column highlighter and the ✅/❌/qualifier legend. Thirteen spot-checks verify the matrix against the owner's table exactly (Delete User Account and Permanently Delete Archived Data are Super Admin only; Moderator suspends but never bans; Developer sees own-website bugs only; Analyst is read-only; universal Overview/Own-Profile rows). Backend claims enforce this exact matrix at activation; the Overview role preview already follows it.

**Execution:** Recorded in EOP `v0.62.0`.


### P-064 — 2026-08-17 — Enforcement pass: rules actually enforced, AI closest-match fix, documented syncs implemented

**Owner intent (refined):** Stop documenting and start enforcing: (1) the permission matrix must actually govern the dashboard; (2) the AI must reliably return the closest websites to any search; (3) implement the flows previously recorded as pending sync.

**1. Real permission enforcement (D-144):** permissions.js gained the enforcement layer — persisted current-role state (backend claims replace it at activation), the page-access law from the owner's access table, pageAllowed/roleLabel helpers. nav.js now enforces on every dashboard page: sidebar links the role cannot open are hidden, a persisted Role-preview selector sits in the sidebar foot, and disallowed pages replace their content with a 🔐 access-denied panel citing the matrix. Action-level gating landed on the key desks straight from can(): Suspend requires Suspend User Temporarily (Moderator yes, Support no), Ban requires Ban User Permanently (Super Admin/Admin), Delete User Account and all vault purges are Super-Admin-only (buttons hidden AND handlers guarded), Manage Team Members gates roster actions, request status decisions require Approve Website Requests while Support keeps Send Update; the Overview role switcher now drives the same shared role.

**2. AI closest-match upgrade (D-145):** the ranking core gained bigram (Dice) whole-string similarity plus graded per-token fuzzy matching that always contributes to scores, and a guaranteed ensure option that tops results up with the highest-similarity sites (honestly low confidence, "closest match to your words") so the Search suggestions ALWAYS show the nearest websites — verified on 12 messy real-world queries (nots→Notes, ches→Chess, kwiz→Quiz, wether→Weather, muzik player→Music, habbit traker→Habits, trip planning→Travel…). answerSearch keeps the honest Request fallback for genuinely unrelated queries via a strict confidence threshold, preserving the owner's two-block Results flow.

**3. Documented syncs now real (D-146):** published Team announcements genuinely appear in the public Updates feed (type-mapped, real timestamps) on this device — pendingFeedSync is implemented, with backend broadcast extending it across devices; the public Hub roadmap now rebuilds its four groups from the Team roadmap manager when data exists (public items only, private hidden, team-set percents labelled, and the three milestone items keeping their checklist-derived bars per D-116).

**Execution:** Recorded in EOP `v0.63.0`.


### P-065 — 2026-08-17 — Supabase activation: URL and anon key wired, connection verified live

**Owner action:** supplied the project URL (https://qnylhlyyzpwlfftiygcn.supabase.co) and the anon public key.

**Executed with verification:** the key's JWT payload was decoded and confirmed role=anon for the matching project ref (valid to 2036) before embedding — a service-role key would have been refused. Both values are live in config/supabase.js. Real connection tests against the project: auth settings reachable with **Email provider already enabled** (owner had done it), Google still off as expected; schema probes show paragon_request_count() and paragon_user_state do not exist yet — **schema.sql has not been run**, which is the single remaining activation step for data sync/requests. System Status updated truthfully (Authentication → Operational, Email live; Database → Connected, schema pending); CTA §13.B updated; service-worker cache bumped per P-016.

**Execution:** Recorded in EOP `v0.64.0`.


### P-066 — 2026-08-17 — Templates to Originals, quiz play v2, alert elimination, and whole-project link audit

**Owner intent (refined):** (1) Move Paragon Templates into Paragon Originals; (2) resolve every broken link and cross-link what belongs together, plus fix any bugs found; (3) reduce visual bulk for better UX; (4) replace every alert/prompt that fakes a placeholder when the front end can do the real thing, and remove alert boxes entirely — they were never part of the product; (5) update Paragon Quiz with the owner's new code (create page confirmation, the redesigned play experience, and the new stylesheet palette).

**Executed:** Templates now lives in Originals beside the Hub (catalogue, AI Brain, governance fixture updated to the two-record rule). The quiz gained the owner's full play v2: start screen with real played-count and best-score, circular SVG countdown ring with urgency state, inline ✅/❌/⏰ feedback with the correct answer shown, skipped tracking, complete screen with animated percent circle, correct/wrong/skipped/time boxes, verdict messages, Try Again, and the Review Answers modal — while results still save to the shared store so home stats, explore counts, bests, and results.html deep links all keep working; the entire quiz stylesheet adopted the owner's design tokens (#0a0a0f/#6c5ce7 palette). Alert elimination: the quiz create page's alert box became an inline error panel that scrolls into view; ParagonTeamConfirm gained select/date/text field support; and every remaining window.prompt/confirm across the dashboard became a proper modal — suspend (duration select + reason), delete account, change role (role select), remove member, schedule go-live (date picker), delete draft, reject submission (required reason), send requester update (message), permanent purges — zero prompt/alert calls remain in team/ or paragon-quiz/. Whole-project audit: 29 pages scanned, zero broken file links, all hub anchors resolve. UX de-bulk: preview banners slimmed to quiet single-liners, section spacing tightened, note text reduced. Cache bumped to v48 per P-016.

**Execution:** Recorded in EOP `v0.65.0`.

### P-067 — 2026-08-18 — The final seven sidebar pages, self-designed, plus the new LAB switch

**Owner intent (refined):** Build the seven remaining "soon" sidebar destinations — Dev Applications (team/applications), Reviews & Reports (team/content/reviews), Community Posts (team/content/community), Suggestions (team/content/suggestions), Website Stats (team/analytics/websites), User Stats (team/analytics/users), and Settings (team/settings, Super Admin only) — designing their layouts myself in the same style as the earlier spec pages ("build it on your own"; the owner can re-send layout material later and once sent a dev-application form spec that was missed — to be reconciled on re-send). Additionally add a new kind of navigation entry called **Lab**: a different switch in the team navigation where the website can be previewed **without any of the actions**; the owner will explain the full concept later.

**Executed:** Eight page pairs built (16 files) in the established dashboard language. 💼 Dev Applications: honest empty queue, labelled illustrative examples, pending→review→accepted/rejected workflow with field-capable confirm modals, accept gated by the matrix (SA/Admin), decisions recorded with honesty note that the developer role is granted for real at backend activation. ⭐ Reviews & Reports: two tabs — reported-review queue (honestly empty, dismiss/delete with required reasons) and an ALL-REVIEWS browser over REAL data (inherited catalogue samples badged read-only pending the CTA decision; device-written reviews really delete from paragonArchive.guestState.v1 so the public Archive reflects it). 💬 Community Posts: board/status/flag moderation with hide/restore/delete workflows. 💡 Suggestions: review/planned/declined workflow plus REAL Promote-to-Roadmap (planned record at 0%, suggester credited, Edit Roadmap-gated, double-promotion refused). 🌐 Website Stats: real per-site table (device-recorded views via ParagonMetrics, 24h views, review counts, buildProgress bars), sort/filter/CSV, developer own-scope note. 👤 User Stats: registered counts honestly "backend pending", real zeros chart, REAL device engagement signals (quiz plays/bests, reviews written, community membership), CSV. ⚙️ Settings (SUPER ADMIN ONLY page law): REAL session-security controls consumed by session.js (paragonTeamSettings.v1, clamped 5–120 min/30–120 s, PARAGON_SESSION_CONFIG test override preserved), backend-pending platform flags stored as labelled intent, local desk-data maintenance with real counts and confirm-gated clearing, real system info (live CACHE_NAME read from service-worker.js). 🧪 LAB: switch-styled sidebar entry (new LAB section) opening a no-action preview workbench — page picker across six real project pages, full/laptop/tablet/mobile device frames, Actions switch default OFF with a transparent shield blocking every click/key (v1 scope honestly labelled pending the owner's full definition). nav.js has zero "soon" placeholders left; PAGE_ACCESS extended (settings=SA-only, content trio admits Moderator, analytics split per matrix, lab open to all); new fixture tests/team-extension.test.js (85 checks) makes the suite 14/14; cache v48→v49 per P-016.

**Execution:** Recorded in EOP `v0.66.0`.

### P-068 — 2026-08-18 — The complete image requirements list

**Owner intent (refined):** The owner supplied the full image bible for the entire platform — brand & identity (logo mark, full logo, founder photo, OG image, favicon, PWA icon, splash), homepage/browse art (5 rotating hero banners, 10 category icons, card badges, empty/loading states), the per-website 5-image template (icon 200², card 800×400, hero 1200×600, 3–5 detail shots 1080×720, per-site OG — ≈750+ images at full catalogue), detail/updates/account/auth/support/error/system-UI imagery, plus a sourcing guide (design/screenshot/AI/icon-libraries/photography/CSS). (Message opened with a stray "Xbox" — treated as an accidental keystroke unless the owner says otherwise.)

**Executed:** Created `docs/IMAGE-REQUIREMENTS.md` — the full list converted into a tracked production checklist where every item carries an honest sourcing status (✅ exists / 💻 code-SVG / 🎨 AI-generatable / 📸 real-screenshot-after-build / 🧑 owner-only). Honest inventory recorded: exactly 3 real image files exist today (hub hero + 2 PWA icons); stars/timeline dots/toasts/bell/FAQ icons already live as code; skeleton loader and several SVG badges identified as code work to build. D-153 policy set: no fake screenshots of unbuilt sites — the ~750-image screenshot mass grows only as real websites are built (Archive/Hub/Quiz/Team capturable today); pre-build site icon art allowed as labelled branding; official Google G asset only. Batch plan A–E proposed (brand core → platform illustrations → category icons + 30 achievement badges → real Hub/Quiz shots → 107 site icons). First Batch A step delivered: two logo-mark concept candidates generated into `assets/brand-concepts/` (Concept A faceted P monogram; Concept B faceted ◈ diamond echoing the existing Team brand glyph) — awaiting the owner's pick before any final brand asset ships.

**Execution:** Recorded in EOP `v0.67.0`.

### P-069 — 2026-08-18 — Logo decision: Concept B; produce everything

**Owner intent (refined):** Via the decision panel: the logo mark is **Concept B (faceted ◈ diamond)**; image production proceeds on EVERYTHING with no batch priority ("You are going to do everything no one first everything for now"); the stray "Xbox" was accidental.

**Executed:** Brand suite produced from Concept B — square `logo-mark.png`, horizontal `logo-full.png` lockup, `og-default.png` share banner using the REAL existing tagline "The gateway to everything Paragon.", `splash.png`, on-brand `pwa-icon.png`; PIL-derived favicon.ico/32/16, apple-touch-180, and REAL overwrite of the live PWA icons (paragon-192/512.png). Brand wired in: favicon links + OG/Twitter meta on paragon-archive.html and the Hub, favicons on product-preview and Quiz; cache v49→v50 per P-016 (shell icons changed). Illustration run started in the matched dark-navy flat style (no baked-in text — UI supplies real copy): empty-search, empty-updates, empty-bookmarks, empty-history, empty-collections produced before the 10-image/turn generation limit stopped the run. Queue recorded in the tracker: 17 remaining illustrations, 10 category icons, 30 achievement badges, per-site icon art — continuing next turns. In-app illustration wiring deliberately waits for the complete matched set (preserve-first).

**Execution:** Recorded in EOP `v0.68.0`.

### P-070 — 2026-08-18 — Wire the art in; 5 more images; preserve the icon & illustration bibles

**Owner intent (refined):** The earlier image work wasn't finished — generated art must actually be implemented/connected inside the website. Cadence: about 5 more images THIS turn, wire them in, then 10 per turn onward. Keep ALL supplied image/animation data. The owner also delivered Section 2 — exact icon specs for all 100 websites — and Section 3 — the 25 platform illustrations with style notes.

**Executed:** (1) Both owner lists preserved verbatim in `docs/IMAGE-REQUIREMENTS.md` with per-item status columns. (2) Five images generated per the owner's cadence: empty-reviews, guest-welcome (features the real logo mark), cookie-icon (cookie with P), achievement-locked badge, and site icon #25 Paragon Quiz (question mark in bold circle, owner's exact spec). (3) REAL wiring — ten images now live in the product: all six empty states (Search results, Saved, Recently Visited, Reviews, Collections, Updates) show their illustrations; the signed-out Account hero shows the guest-welcome art; the locked "More Soon" achievement tile uses the locked-badge art; the cookie banner got its cookie; Paragon Quiz's header logo is its real icon across all five quiz pages (first of the 100-icon set; #100 Archive Hub = the logo mark itself, already done by definition). New `.empty-illus`/`.guest-welcome-illus`/`.ach-lock-illus`/`.cookie-illus`/`.quiz-logo-img` styles; cache v50→v51 per P-016.

**Execution:** Recorded in EOP `v0.69.0`.

### P-071 — 2026-08-18 — Next 5 wired, size budget, live file tree, next-agent handoff

**Owner intent (refined):** (1) Confirm the FIRST image list (P-068, sections 1.1–1.10) was not lost and fold its unimplemented items into the queue; (2) keep the whole website under 100 MB despite image generation — compress whatever helps; (3) always keep /paragon-file-tree.html updated; (4) maintain a complete brief so a NEXT agent can continue the build if this chat runs out (it happened before) — prompts, tree, everything, from where we stop; (5) implement all changes so browser preview/export shows them; (6) do the next 5 images now (battery low).

**Executed:** Confirmed P-068 list preserved in IMAGE-REQUIREMENTS §1.1–1.10; its pending items (skeleton loader, card badges, checkmark animation, error pages, etc.) remain queued. Generated 5 and wired all 5: header-about/privacy/support/request as hero illustrations on the four integrated Hub pages, success-submit inside the request-form success state. SIZE: optimization pass with PIL — headers/OG to JPG, spot art to 640px quantized PNG — assets 24.7 MB → 1.4 MB, whole project **3.6 MB** (budget rule now standing, D-156). File tree regenerated (147 files) with the always-update rule baked in. Created **docs/NEXT-AGENT.md** — full handoff brief (owner style, law files, standing rules, workflow, state, image queue, where-we-stopped) refreshed every turn. og:image references updated to .jpg; cache v51→v52 per P-016.

**Execution:** Recorded in EOP `v0.70.0`.

### P-072 — 2026-08-18 — 20-image run (first 10) + Websites/Updates/Account UX upgrade

**Owner intent (refined):** "Next 20 image run" and improve the UX design of the Websites tab, Updates tab and Account tab.

**Executed:** Platform cap allows 10 generations/turn — first 10 delivered and ALL wired, second 10 owed next turn (logged). Art: welcome-hero (signed-out banner atop the Websites tab, toggled by real session state), free-for-everyone (About §Mission), timeline-journey (About §Vision), error-404 astronaut / error-500 dizzy robot / offline unplugged / maintenance diamond-polisher — with **four new branded root system pages** (404.html, 500.html, offline.html, maintenance.html; offline.html added to the PWA shell and made the final SW navigation fallback), bug-report net-catcher (Hub Help intro), auth-bg (email auth dialog backdrop), default-avatar (now the real Guest session avatar). UX upgrade (style.css P-072, additive): Websites — card hover lift + image zoom + skeleton shimmer loaders (owner list §1.2 #14 done) + chip polish; Updates — live-badge pulse, card hover slide, active-chip ring; Account — stat/section hover states, avatar img support, centered hero. All art size-optimized (project 4.0 MB of 100 MB). Cache v52→v53; tree regenerated (162 files); NEXT-AGENT brief updated.

**Execution:** Recorded in EOP `v0.71.0`.

### P-073 — 2026-08-18 — Bug fixes (contrast/white-flash/updates-fade), Detail UX, real-not-made-up purge, category icons, export protocol, file-count reduction

**Owner intent (refined):** (1) Improve Website Detail UI/UX/layout while keeping every action; more UX on Updates/Websites/Account; (2) fix color transitions that leave words faint/blurry/unreadable per real color-design rules; (3) fix the Updates tab looking faded when a filter (e.g. Maintenance) leaves few entries; (4) fix white areas flashing while scrolling before content appears; (5) continue image creation; (6) one full audit sweep — find gaps where something is needed and nothing is there; (7) find made-up stuff and make it real; (8) write the export format protocol — uploads only allow html/txt/md, so renamed files (e.g. .js → .js.md) need a restore prompt for the next agent (no renames now); (9) reduce file COUNT (e.g. one JS per product section) since ZIP upload is impossible.

**Executed:** Contrast tokens raised (--text-faint both themes) with quick transitions; html now paints the theme background + color-scheme and images are dark-backed — white scroll flash eliminated; .timeline.compact (≤3 filtered entries) drops the animated rails/dots so sparse Updates pages stay solid; Detail: sticky glass info-bar, floating mobile OPEN pill, calmer hero gradient, hover polish. HONESTY PURGE (D-158): every picsum.photos random photo (14 sites-wide uses) replaced by paragonTile() branded deterministic SVG tiles. Image run: 10 category icons produced (owner §1.2 #9 spec), corners transparent, wired into Browse with emoji fallback for the 4 remaining categories. Audit: 389 local references checked across all HTML — zero missing. Export protocol + one-shot restore script + regenerable-assets guide written into NEXT-AGENT §9 (D-159); quiz consolidated to a single guarded js/quiz.js (5→1) with team/ merge plan documented (§10). Cache v53→v54; tree regenerated; 14/14 fixtures green.

**Execution:** Recorded in EOP `v0.72.0`.

### P-074 — 2026-08-18 — 20-image demand (10 now/10 owed), icons everywhere, animation pack, need button, live loading feel

**Owner intent (refined):** (1) 20 images this turn (acknowledged the 10 rule but wants 20 — hard platform cap explained; 10 delivered + 10 owed); (2) category icon art missing from the "See all" category view — fix; (3) site icon art (e.g. Quiz) missing inside the Website Detail and elsewhere in the Archive — fix; (4) implement ALL animations across the website; (5) upgrade the under-development page UX and add a MovieBox-style "I need this website" control whose counts drive which sites get built/scheduled first; (6) make the 0% display feel like loading genuinely starting.

**Executed:** 10 images: the 4 remaining category icons (Productivity/Entertainment/Lifestyle/Deployed — the full 14-category row now has art) + first 6 site icons per §2 specs (Notes, Tasks, Calendar, Clock, Calc, Dictionary), rounded/optimized. SITE_ICON_ART system wired into detail info-bar icon, detail byline, search result rows; CATEGORY_ICON_ART now also renders in the See-All full grid. Animation pack: tab-switch entrance, card/grid entrances, button press feedback, success pop, achievement unlock burst (hooked into unlockNextAchievementStage), launch-ring pulse, all disabled under prefers-reduced-motion. Under-construction page upgraded: need toggle (real-zero device store paragonArchive.siteNeeds.v1, honest label), need counts + Most Needed sort + CSV column in Team Website Stats (D-160). Loading feel: launch ring hides its idle 0% (percent appears only while launching, icon pulses, faster fill); 0% build bar gets an alive shimmer while the real number stays honest zero. Cache v54→v55; VM guard fix for the preview fixture; 14/14 green.

**Execution:** Recorded in EOP `v0.73.0`.

### P-075 — 2026-08-18 — Train the Detail AI: build-state, demand ranking, updates, documentation, review-signal intelligence

**Owner intent (refined):** Take time and train the website-detail AI to tell a lot more: the current build state and whether a website is coming soonest/closer to creation (it now has the need counts and ranking), know the new updates, know the full documentation for each website (as opened from the preview page) and how the website will be, and speak about what users need most based on reviews and observed activity — including likely future updates derived from those signals.

**Executed:** New Detail signal engine inside the one AI core (ai/paragon-archive-ai.js): liveSiteSignals (real buildProgress, need votes + rank across all recorded needs, real device views, review corpus), reviewThemes (stop-worded keyword frequency + explicit wish-sentence extraction), and five new grounded answer families — build-state ("X% built, N need votes, rank #K → closer to construction; no individual release date is promised"), user-needs (themes + wishes + honest zero-state), future-updates (documented planned features + review signals, always labelled "not promises"), full documentation digest (purpose/about/category/planned experience/where the real concept docs open), and enriched updates/status branches (real % appended; live products answer "already REAL"). Engine is localStorage-safe for VM/test environments. AI-BRAIN §21 documents sources and honesty laws. Fixture 15 added (17 checks) — suite now 15/15. Cache v55→v56 (AI file is shell-cached).

**Execution:** Recorded in EOP `v0.74.0`.

### P-076 — 2026-08-18 — The great polish: background revert, made-up purge, category/logo sweep, AI-labelled search, settings v2, promo desk, completion plan

**Owner intent (refined):** (1) Restore the pre-P-073 background feel — the "white stuff" persisted (it was the shimmer/img backing) — keeping only the Updates maintenance-filter fix; (2) ALL reviews/views/ratings start at real zero, nothing made up anywhere (and preemptively purge similar fakes); (3) category fixes — health icon compacted (regenerate), See-All icons too large (arrange like the achievements grid, ≥3 across, icon top/name below), Productivity/Entertainment/Lifestyle/Deployed missing from the map, icon alignment consistent, category-view header uses the icon art, and any replaced logo must be replaced EVERYWHERE; (4) non-exact search results are Paragon AI's job — label them as AI suggestions; (5) welcome hero must not squeeze Website of the Day — greet then auto-collapse; (6) top-bar home logo still emoji — use the brand mark, and fix logo marks everywhere without being told again; (7) improve top bar, bottom nav, and Updates header UI/UX; (8) Account: remove the ◈ emoji block (guest illustration takes its place); redesign the notification sign-in prompt; (9) build the Team page that authors the sponsored/promotional notices guests can receive; (10) merge the achievement strip into the stage summary at the summary's position; (11) collections must never ship made-up entries; (12) reduce Account settings to: Notifications, Install, Community, Hub, Request, Help (footer duplicates removed; dark-mode switch removed — top-bar icon does the job); (13) every "about/how it works" button renders identically; (14) detail: small site-icon art looked bad (reverted to emoji), large icon art full-bleed, header nav buttons readable, related websites in the achievements-grid arrangement, version history shows only the latest entry behind Read more; (15) Detail AI: greetings, on-topic answers, "everything about this site" full dump; (16) produce the Community Platform + Developer Portal/Deployed completion PLAN for approval before building.

**Executed:** All sixteen delivered. Highlights: shimmer + img backing reverted (html theme backing kept — invisible); getCombinedReviews returns user reviews only, realSiteRating()/"⭐ New" replaces every fabricated star (7 display sites + detail stat + breakdown + metrics inputs), starter collections deleted, AI signal engine now reads device reviews only; CATEGORY_ICON_ART completed to all 14 (the 4 missing were a map omission — art existed), health icon regenerated full-size, See-All grid now ach-grid style with compact art, overlay titles carry icon art; "✨ Paragon AI suggestions" note on non-exact search results; welcome hero auto-collapses after 6.5s; brand mark now in the Archive top bar, Hub top bar, notification prompt and settings Hub row; settings-row rebuilt to the owner's exact list (password kept as sole entry point, privacy controls remain reachable via cookie Manage); notification prompt redesigned with sign-in CTA; achievement strip merged into the stage summary with progress track; data-notice buttons all render the same dismissible inline panel; detail byline/search icons back to emoji, large art full-bleed, glassy readable header buttons, related-sites ach-grid, version history collapsed to latest; Detail AI greets, dumps everything only on request, and stays on topic otherwise; Team PAGE 25 Promotions desk built (sponsored disclosure enforced, 72h real countdown/expiry, publish confirm, pendingBackendDispatch honesty, nav + SA/Admin access law); docs/BUILD-PLAN-COMMUNITY-DEPLOYED.md written for approval. Five fixtures updated to the new owner-approved reality; suite 15/15. Cache v56→v57.

**Execution:** Recorded in EOP `v0.75.0`.

### P-077 — 2026-08-18 — APPROVED PLAN BUILT: Community Board + Developer Portal, construction UX v2, 20-image debt cleared, audits

**Owner intent (refined):** Full approval of the Community/Deployed plan — build everything in this one prompt; improve the under-construction "please wait" experience; owner personally runs schema.sql, Google OAuth, Brevo and uploads the founder photo before the Lab phase; deliver the 10 owed images; implement any unimplemented images; check for bugs, broken flows, incomplete icon swaps, and missing back-navigation.

**Executed:** (A1–A4) community-board.html/js — member composer (real membership gate), five boards, New/Top sort, likes/comments/reports all real-zero, ONE shared store with the Team desk so moderation is a genuine loop (hidden/removed posts vanish publicly), mini member profiles, guidelines, join CTA for non-members. (B1–B5) developer-portal.html/js — Build-for-Paragon landing with 3-step path, the REAL 8-point gate mirrored verbatim from the Team desk (fixture-enforced), application form → paragonTeamApplications.v1, accepted-developer dashboard → submissions into paragonTeamDeployed.submissions.v1, live status tracking; (B4) app.js mergeApprovedDeployed(): approved non-illustrative submissions join the public Deployed category (pending/illustrative excluded, honest zero stars). (A5) every record carries pendingBackendSync. Construction UX v2: floating icon, 3-step journey strip (Documented → Being built → Launch) derived from the real buildProgress. Image debt cleared: site icons #7–16 generated, rounded, wired into SITE_ICON_ART (18/100 done incl. Quiz/Hub). Brand sweep: all 28 team-page topbars + hub kickers now wear the real mark. Audits: 447 references zero-missing, back-navigation verified on all standalone pages, node --check clean, fixture 16 (community-deployed.test.js) added — suite 16/16. Hub links to both new destinations. Cache v57→v58.

**Execution:** Recorded in EOP `v0.76.0`.

### P-078 — 2026-08-18 — Supabase login link (quick assist)

**Owner intent:** Provide the Supabase login link immediately (owner activating the schema today).

**Executed:** Provided dashboard login, direct project link (qnylhlyyzpwlfftiygcn), and the direct SQL-Editor link plus the 4-step activation path (schema → Google provider → Brevo SMTP). No code changed; awaiting owner's confirmation to run the live post-schema probes.

### P-079 — 2026-08-18 — SCHEMA LIVE: probes green, Database status flipped, Google OAuth steps

**Owner intent:** Re-run the live probes after personally executing supabase/schema.sql; then provide the Google OAuth steps.

**Executed:** Live probes against qnylhlyyzpwlfftiygcn: paragon_request_count() → 200 with the real honest 0; paragon_username_available('paragon') → 200 true; paragon_user_state/paragon_profiles now EXIST and correctly deny anonymous reads (schema grants tables to authenticated only — probe results match the schema's security design exactly). Hub System Status Database row flipped to operational "Connected — schema LIVE" with the probe evidence. Cache v58→v59. Google OAuth step-by-step handed to the owner. Remaining activation: Google provider, Brevo SMTP, founder photo, then real-signup end-to-end test.

### P-080 — 2026-08-18 — Icon fix + 10 images, chips 2-row, AI dates/typos, need meter v2, above-the-fold preview, hub nav cleanup

**Owner intent (refined):** (1) Productivity icon compacted — find whether generation or processing caused it (it was the processing: non-square crop squashed into a square) and deliver it inside the next 10-image run; (2) Updates filter chips in exactly two rows and shorten that header area; (3) NO new AI in Updates — instead train the Detail AI to know each site's added day/creation/update history, and understand typos so it answers what the user meant; (4) improve the Trending overlay header; (5) need button = rating without reviews: unlimited taps, each +1, count bubble connected to the button MovieBox-style, message telling users tapping steers the team to build faster, Team builds the most-needed first; (6) the under-construction page must show everything without scrolling (docs button, return link) with whitespace respected; (7) Hub Home: remove the Team Login topbar button AND the Team tab from the lineup, reorder Home → Community → Documentation (secret 🔒 footer passage remains the only public entry); remove About/Request/Help/Privacy/Terms from the hub footer.

**Executed:** Roundify processor now pads crops square before resize (root cause fixed); productivity regenerated spacious + site icons #17–24 & #26 (Icons, Fonts, Photo, Meme, Mood, Whiteboard, Palette, Learn, Flash) — SITE_ICON_ART = 27 entries. Chips grid = strict 3×2 rows with a tightened header. Detail AI: correctTypos() snaps misspelled words to intent keywords via edit distance (≤2), and a new added/created intent answers with the real addedAt/normalized date + version + documented updates. Trending header: amber-accent card with gradient title. Need meter v2 (D-165): unlimited +1 taps, bubble+stem visual, pop animation, honest "every tap is a real vote… team builds the most-needed first" message; Team desk ranking unchanged (already sorts by needs). Construction stage compressed into a centered 100vh column — journey, need meter, docs button and return link all visible without scrolling, with a sub-700px height fallback. Hub: Team Login button removed, Team tab removed, tabs reordered Home→Community→Documentation, footer reduced to © + Archive + secret 🔒 (deep links and the gateway section stay functional). Suite 16/16; cache v59→v60.

**Execution:** Recorded in EOP `v0.78.0`.

### P-081 — 2026-08-18 — Team search inputs, share sheet v2 (app deep-links), sticky overlay headers, media icon, preview cleanup

**Owner intent (refined):** (1) Better CSS for every search/typing field in the team dashboard filter bars (Website Stats ws-search, Community Posts post-search, and all the rest); (2) share sheet: add Instagram and more; Telegram/Messenger/X must open the installed app directly like WhatsApp; WhatsApp must trigger the device chooser so BOTH WhatsApp and WhatsApp Business pop up (like SMS does); Gmail/Facebook stay as-is; when an app is absent, the web fallback opens IN THE SAME TAB so Back returns — never a new tab; (3) Browse-by-Category overlay: scrolling content mixes with the header text — make the header behave like the detail info-bar (content passes BEHIND it), same for the Trending overlay; (4) the Media category icon looks off — fix it, and keep the Tools/Games/Health style (big symbol, no white space, same size) as the standard without spoiling anything; (5) concept preview: remove the down-arrow scroll hint, and remove the mid-page "PARAGON PRODUCT PREVIEW / Archive detail" topbar that cuts into the view so the docs join cleanly below the stage.

**Executed:** All team filter-bar inputs restyled (inline SVG search glyph, focus ring, placeholder polish — one rule covers every desk). Share sheet v2: every target now carries an app deep link + same-tab web fallback via a visibility-checked opener (whatsapp:// scheme → device chooser shows both WhatsApps; tg://, twitter://, fb-messenger:// added); Instagram added with honest copy-link-first behavior; grid buttons replaced anchors; note text explains the behavior. Overlay headers (.trending-overlay-header, shared by Category + Trending) are now sticky with a solid blurred backdrop — scrolling content passes behind exactly like the detail info-bar. Media icon regenerated flat 2D (no bevel/white remnants) and processed with the square-safe pipeline; the big-symbol standard is now the documented prompt style for all future icons. Preview page: scroll-hint arrow removed, mid-page topbar removed (docs open directly with the hero; return links live in the stage actions + footer). Suite 16/16; cache v60→v61.

**Execution:** Recorded in EOP `v0.79.0`.

### P-082 — 2026-08-18 — GOOGLE OAUTH VERIFIED LIVE

**Owner intent:** Verify Google OAuth after configuring it.

**Executed:** Live probe of /auth/v1/settings: external.google = TRUE, external.email = TRUE, signups open, mailer_autoconfirm = false (real email verification). Hub System Status Authentication row flipped to operational "Email + Google sign-in LIVE" with probe evidence. Remaining activation: Brevo SMTP (prettier/reliable verification emails), founder photo, then a real end-to-end signup test on the owner's device. Cache v61→v62.

### P-083 — 2026-08-18 — Brevo setup steps handed to the owner

**Owner intent:** Provide the Brevo activation steps to do personally.

**Executed:** 6-step guide delivered: Brevo signup with paragon.archive.2026@gmail.com, sender verification, SMTP key generation (smtp-relay.brevo.com:587), Supabase Custom SMTP configuration at settings/auth, rate-limit note, and the security rule that the SMTP key lives only in the Supabase dashboard. Awaiting "Brevo done" for the settings probe + real signup-email test.

### P-084 — 2026-08-18 — Brevo done; guiding the Supabase SMTP plug-in location

**Owner intent:** Brevo account/sender/key ready but cannot find the Supabase SMTP form.

**Executed:** Precise navigation delivered: direct settings/auth URL (scroll to "SMTP Settings" / "Enable Custom SMTP" toggle), the newer-dashboard route (Authentication → Emails → SMTP Settings tab), the Ctrl+K "SMTP" search fallback, and the exact field-by-field values (host smtp-relay.brevo.com, port 587, Brevo SMTP Login as username, SMTP key as password — not the account password). Awaiting confirmation for the probe + real signup-email test.

### P-085 — 2026-08-18 — SMTP live-fire test FAILED (500) — diagnosis delivered

**Owner intent:** Verify the Brevo SMTP plug-in.

**Executed:** Real signup probe (paragon.archive.2026+smtptest1@gmail.com alias → owner's own inbox) returned 500 "Error sending confirmation email" — Brevo rejected the send. Diagnosis checklist delivered in likelihood order: (1) SMTP key vs account password in the password field, (2) username must be the Brevo Login (xxxxx@smtp-brevo.com), (3) Brevo's known new-account SMTP deactivation requiring activation, (4) sender verification state, (5) host/port exactness. Awaiting "retest". Honest note: no status flipped anywhere — email remains on the default state until the probe passes.

### P-086 — 2026-08-18 — Brevo novice guidance, settings popups suite, board/updates/profile polish, flat-icon purge, image-cap truth

**Owner intent (refined):** (1) Novice-level steps for the Brevo/Supabase SMTP fix confusion; (2) restore Privacy in Account settings (popup controls, not documentation); (3) Request a Website and Help & Support become in-app popups instead of documentation links; add an FAQ popup mirroring the documentation exactly (with expanding details), and place Help/FAQ/Privacy side by side; (4) Community entry: non-members get the six-step join reminder popup (animated, scroll-up steps) then complete in the Hub — members go straight to the Community Board; remove the board's now-unneeded read-only notice and polish the board top bar/layout; (5) Updates: category and date filters side by side, label above control, with UI spice; (6) improve the profile header and the whole account hero; (7) purge white borders/padding from ALL remaining category icons to match the beloved Tools/Media/Health/Games standard; (8) raise the image cap to 20–30/turn — corrected honestly: it is a platform hard limit of 10, not the owner's rule; every turn will max the 10 until the ~900-image plan completes.

**Executed:** All delivered. 10/10 generations spent regenerating creative, education, social, finance, dev-tools, originals, productivity, entertainment, lifestyle, deployed as flat 2D edge-to-edge big-symbol icons (square-safe pipeline). Settings v3 with the trio row + smart community routing + three new utility popups (support queue store, live-fetched FAQ, animated join steps). Board notice removed + top bar/brand/nav/composer polish. Updates category/date selectors side-by-side with focus rings. Account hero gradient band + avatar ring + badge hovers. The fixture caught two textual arrows in my new popup copy (banned by D-092) — removed; suite 16/16. Cache v62→v63. Brevo walkthrough re-delivered in novice steps.

**Execution:** Recorded in EOP `v0.81.0`.

### P-087 — 2026-08-18 — Real join flow, achievements accuracy, data export verified, roadmap truth, entry splash, 10 images

**Owner intent (refined):** (1) The join popup must show the REAL hub documentation join section, with the six steps reordered (1 account, 2 verify email, 3 find Paragon Community in Account profile/settings, 4 complete profile, 5 accept guidelines — popping up in-place with a back button, never a documentation trip, 6 click the Join button and boom, in); (2) the achievements stage summary must respond as accurately as the cards on task done/undo; (3) Download My Data must really work now that the backend is connected, Save Preferences must do its job, Accept-All must enable all three switches, and explain "essential" (plus the AdSense connection); (4) work on the roadmap areas (community/dev-portal/mobile-app checklists); (5) the welcome hero becomes a front-of-page entry animation — page blurred/dark behind, fades after ~2 seconds; (6) productivity icon still off — regenerate, plus 9 new images.

**Executed:** Join popup v2 (D-167): live-fetched documentation section + working in-popup guidelines reader (Back + Accept) + REAL join writing paragonCommunityMembership:{userId} with the hub record shape; hub six steps reordered/reworded per the owner. Achievements summary now states stage progress AND overall percent separately (stageCompleted/stage total + overall N of M · %), recomputed on every render. Download My Data audited: already real (auth user + synced state via live backend + guest state + preferences → JSON download) — verified, no fake stub; Accept-All persists all three switches and controls sync on open; an "essential storage" explainer (with the honest AdSense-consent note) added to the privacy controls. Roadmap flips: Q&A/suggestions/voting → done (Board live), security review queue → done (8-point desk) — percents self-derive. Entry splash implemented (front-and-center card, blur-dark backdrop, scale-in, auto-fade ~2.1s, once per session, reduced-motion instant); in-flow banner removed. Images 10/10: productivity v3 (flat chunky bolt) + site icons #27–35 (Math, Code, Type, Language, Kids, Debate, Mind, Exam, Chat) → SITE_ICON_ART = 36. Two fixture catches fixed in-turn (header order, VM guard). Suite 16/16; cache v63→v64.

**Execution:** Recorded in EOP `v0.82.0`.

### P-088 — 2026-08-18 — 10 images, milestones to the honest maximum, mega-consolidation, one AI suggestions component, modern polish

**Owner intent (refined):** Next 10 images; push Community and Deployed roadmap items to 100% ("tell me if you need anything"); no building the actual 100 websites yet; modernize all UI/UX/layout/links; reduce the file count toward ~100 (never deleting images); explain/fix the two Paragon AI suggestion blocks in Search (keep one); general bug sweep and search polish.

**Executed:** Images 10/10 — site icons #36–45 (Forum, Poll, Meet, Wall, Connect, Feed, Collab, Confess, Events, Music) → SITE_ICON_ART 46/100. Milestones: appeals loop BUILT end-to-end (author sees own hidden/removed posts on the board with an appeal composer; the Team desk shows open appeals with Approve-restore / Deny-with-reason) → moderation item done; developer analytics BUILT (portal dashboard shows real device views + need votes per approved own website) → analytics item done; publishing pipeline item flipped done (approve-to-public loop has been live since P-077). Community and Deployed both at 5/6 (83%, auto-derived); the LAST item in each is pure backend — supabase/community-schema.sql WRITTEN (community posts/comments/appeals + dev applications/submissions with RLS): the owner runs it, I probe, both hit 100%. Consolidation: 30 team controllers → ONE location-guarded team-pages.js (28 team pages rewired, fixtures updated) — which exposed SIX hidden window.confirm dialogs in legacy modules, all purged. File count 226→197: images (97) are protected by owner order, so non-image files now sit at ~100 — the honest floor analysis is logged. Search: the two AI suggestion UIs merged into the single ✦ Paragon AI head; search inputs modernized (pill, focus ring, hover rows); platform-wide modern button/link polish. Suite 16/16; cache v64→v65.

**Execution:** Recorded in EOP `v0.83.0`.

### P-089 — 2026-08-18 — TABLES LIVE: double 100%, live board/portal sync, PWA completion, 10 icons, 16→3 tests

**Owner intent (refined):** Probe after the community-schema run; take both milestones to 100%; complete the roadmap PWA work ("ask if you need anything"); the proposed next 10 images; reduce files further if possible; hunt bugs; and update the in-site texts that still said "needs Supabase backend" wherever the backend is now real.

**Executed:** Probe: all five new tables return 200 honest-empty → Community 6/6 (100%) and Deployed 6/6 (100%), probe-dated in the checklists; hub status rows for Community and Deployed flipped to operational with evidence. LIVE SYNC BUILT: board posts publish to paragon_community_posts when signed in (insert with return, 🟢 live chip; offline/signed-out posts queue with 📴 device chip; backend posts load-merge on open) and portal applications insert to paragon_dev_applications — the "backend at activation" copy replaced by the live truth on both pages. PWA: manifest v2 (id/lang/categories/display_override/launch_handler + 4 app shortcuts), iOS standalone metas, viewport-fit=cover, safe-area insets, standalone-mode ergonomics → "Mobile-native design adaptation" done (Mobile App milestone 3/6 = 50%); the native-technology decision was formally requested from the owner (TWA→Play Store recommended, needs a one-time $25 Google Play account) — core build/store submission/public release stay honestly open. Images 10/10: site icons #46–55 (Radio, Beats, Watch, Read, Comics, Anime, Movie, Podcast, Stories, Mixes) → 56/100. Tests consolidated 16→3 suite files (every original check preserved; meta-list fixture updated) → 184 files total, 87 non-image. Cache v65→v66.

**Execution:** Recorded in EOP `v0.84.0`.

### P-090 — 2026-08-18 — Hub home restructure, in-popup profile form, TWA decision + build kit, search fixes, waste sweep, build-strategy advice

**Owner intent (refined):** Probe the SQL again; complete the two backend milestone items 100% (already flipped last turn — re-verified); remove genuinely wasted images; reduce file count further (asks whether many same-shape HTML pages can merge); complete the PWA items and ask for whatever is needed; fix the search-input icon covering typed text; add the step-4 profile-form button inside the join popup (form fills + Save + Back, step 4 text updated); merge the hub topbar search toggle into one permanent search input (typing lists, clearing empties); remove hero action buttons, landing discussions, most-requested and dev sections (dev content becomes an Account settings popup); quick cards reordered to match the page order with in-home scrolls; landing Documentation reformed as "Official Document" chips; Documentation-page cards restyled as chips three-across; and advise whether the 100 websites should be built in separate projects/agents.

**Executed:** Re-probe confirmed the five tables live (both milestones remain 100%, probe-dated). TWA decided (D-170) + native/TWA-BUILD-KIT.md (Mobile App 4/6 = 67%; the last two items honestly blocked on the production domain + $25 Play account — formally requested). Hub surgery delivered exactly as specified (hero buttons gone, sections removed, quick cards reordered with in-home scroll targets, Official Document chips, permanent topbar search with type-to-list/clear-to-empty, doc-page cards as chips 3-across). Join popup: 📝 profile form (display name/bio/interest chips, Save/Back, saved-state line, draft feeds the real membership record) + hub step 4 reworded. Search-icon overlap fixed (padding + pointer-events). Become a Developer popup added to Account settings. Rejected logo concepts deleted; splash.png wired (no orphaned images — scan proven). Files 194→193; suites 3/3; cache v66→v67. Build-strategy advice delivered (separate projects per category, linked by siteUrl).

**Execution:** Recorded in EOP `v0.85.0`.

### P-091 — 2026-08-18 — The AI correction done right, splash arithmetic, join gates, popup locks, image items, truth sweep

**Owner intent (refined):** Merge the two search AIs keeping HIS chosen presentation (empty-state art, confidence, match reasons, category line) and delete the other; train the AI on concept documentation; splash to 4 s with the privacy banner waiting; typewriter "Paragon Archive" + percent ring finishing together (100÷16 per char); improve the Website-of-the-Day card; deliver image items §1 #8/10/11/12/16/18 and tick #24–27; enforce the join order (green profile button, locked guidelines, checkbox only via in-guidelines Accept, no reversal); lock scroll/clicks behind every popup including the splash; keep reducing files safely; refresh outdated texts/updates; redesign the need meter away from the head-bubble; re-probe Brevo; connect unconnected pages; icon art into trending/staff/recent lists.

**Executed:** All delivered — AI: single ai-suggest-block presentation on every non-exact search (rankWebsites-powered with reasons/confidence/category; plain list deleted; documentation field added to the index). Splash v2: 4 s hold, synced typewriter+ring (6.25%/char), page fully locked, privacy banner reveals only on splash-done (with safety net). Join gates enforced exactly as specified. popup-lock on all utility sheets + share sheet. WotD: cinematic category banners + veil + 🌟 badge. Badges/avatar/ring items shipped as code; tracker ticked (#24–27 confirmed). Need meter v3 split capsule. Real update entries added for the day's real milestones (backend live, board open, portal open); footer claim date refreshed. Board↔Portal cross-links. Icon art in trending overlay rows, staff minis, recent cards. Brevo re-probe: STILL 500 (SMTP rejecting — awaiting the Brevo-side fix). Site icons #56–60 + 5 hero banners (10/10). Two fixture catches (VM guard, comment arrow) fixed in-turn. Suites 3/3; cache v67→v68; system-page merge deferred rather than risked.

**Execution:** Recorded in EOP `v0.86.0`.

### P-092 — 2026-08-18 — The Replacement Law, hero v2, real updates only, ticket loop, splash v3, 10 images

**Owner intent (refined):** Stop leaving old elements behind when adding replacements (WotD double badge, staff double badge, recent double badge); remove one search AI outright (no feature transfer); WotD layout (views pill beside the badge at top, centered name/desc, OPEN pill smaller on the right); Updates truth purge (only Quiz+Hub have real "updated" entries; my two milestone entries retyped announcement; fake Notes maintenance + Contrast featured deleted; "Local preview" badge removed; expected real counts 107/2/0/0/4) with the Team announcements desk driving the feed via a real website dropdown per site-linked type and deletable published records; guest-welcome art becomes the account hero background; splash = still name (no typewriter/caret) with only the percentage animating across 5 s; code icons (official Google G, email, animated check, upload, notification mark); 10 images (email-verify + 9 site icons); join steps mark from real state and the profile form waits for steps 1–2; support popup closes → clears → success overlay, becomes a REAL team ticket (not email), and team replies land in the user's in-app inbox + arrival popup (saving the 300-email Brevo budget for signup codes); request form gets the same close-then-celebrate flow; keep docs/tree/handoff current always.

**Executed:** Every item delivered; data/updates.js rebuilt clean after an edit mishap (real announcements only); three fixtures rewritten to the new truths (single staff badge, zero maintenance events, star test pinned to a real added-event); suites 3/3; cache v68→v70. New shared success-overlay component (animated SVG check; email-verify art for the signup case). D-172 Replacement Law logged permanent.

**Execution:** Recorded in EOP `v0.87.0`.

### P-093 — 2026-08-18 — Banner set complete, AI final shape, hub single-tab, sync fixes

**Owner intent (refined):** Splash name back to its position (no typing animation); related-website cards use the new icons; WotD view count syncs with the real detail views; staff badge flush to the RIGHT card edge (flat edge right, round side left, never covering names); top-bar search becomes Paragon AI suggestions whenever the words do not exactly match a website name — trained on everything (about, features, concept documentation), returning ONLY matches; the notification Sign-in button routes to the Account tab (user picks the method); the account-hero top gradient covers the whole hero so the background art sits dull; hub top-bar search centered with a page-wide dropdown that appears only while typing and vanishes on clear/selection, with keyword-smart entries (help etc.); Official Document chips exactly three per row; hub top bar keeps ONLY Home (Community + Documentation tabs removed; Join and See-all deep links still reach those pages); community page + board header UI/UX air; complete the hero banners (the 10) and use them inside every Website Detail exactly like the WotD; tick the tracker and refresh the tree.

**Executed:** All delivered. 10/10 images = the completing banners (productivity, social, finance, health, lifestyle, dev-tools, originals, deployed, entertainment, default) → 15-banner set wired through a single shared heroBannerFor() into BOTH surfaces (old tile removed per D-172); splash name repositioned; related cards + AI rows wear icon art; refreshHeroViews() syncs the WotD pill on every detail close; staff badge right-flush (999px 0 0 999px); search AI final shape (D-173) with the docs-trained index and genuine-match floors; sign-in routes to Account; account hero fully veiled; hub search centered/fixed-width dropdown with [hidden] enforcement + 11 keyword entries; chips 3×; hub tabs → Home only; board/community spacing pass. Suites 3/3 first run; cache v70→v71.

**Execution:** Recorded in EOP `v0.88.0`.


### P-094 — 2026-08-24 — Announcements become a managed system, PWA-only app decision, AdSense track, OAuth profile flow, splash v4, hub board topbar, 10 icons

**Owner intent (decoded):** Get Brevo contact steps (Supabase side already done their end); improve the welcome splash so text is never distorted by the background art and the percentage UI is better; continue site icons #70–79 and wire them everywhere; make the existing updates editable/deletable from the Team Announcements desk as if composed there (run SQL if needed); special announcements need only title+message; add working Schedule/Preview/Save Draft/Publish Now; add image upload (ALL types — it replaces the website icon in the feed, viewable full-size + downloadable) and a special-only LINK pill styled/positioned exactly like OPEN; start Google AdSense (free, no money — do what's possible, add roadmap); OPEN requires guest-or-login; fix Google consent branding ("Continue with qnylhlyyzpwlfftiygcn.supabase.co" must say Paragon Archive) + request only needed scopes; logged-in users get a real editable profile (name from Google, saved across sessions) and guest work merges into the account on every login; merge the construction percentage into the need side as one complete pill; FINAL app decision = browser-install PWA only (no Play Store, no $25) but as close to a real app as possible (notifications, share, app-like install); fix the splash appearing fast/unloaded and replay it on login; verify WotD/Trending/Staff rules; end the "two AI blocks" search confusion; remove the Hub Home tab nav and move content up; back button like legal pages appears when sections are viewed; move the hub search away from the back button; make this topbar a platform standard (quiz too, logo opens the quiz's detail); views count successful OPENs only; hub search must handle typos/meaning; footer links route through the Hub website detail first (OPEN lands the destination); Join quick card scrolls to the in-home join section; combine team HTML files if possible without breaking anything; restore lost team illustrations; set up the site-build-kit framework for upcoming per-website "skill" material; don't forget the tree/SOP/EOP/CTA/IMAGE-REQUIREMENTS updates and the 10 images.

**Executed:** Announcements: D-174 managed system end-to-end (desk + feed + SQL + seeds + images/links/schedule/preview/draft/publish). Search: ONE ✦ Paragon AI block everywhere (padded second block deleted, D-173 honored). Identity: D-176 (OPEN gate, opens-only views, editable saved displayName, login splash replay, guest merge verified). Splash: D-178 v4 (preload-first, veil, in-ring percent). Hub: D-175 board topbar + fuzzy search + join quick-card fix. Footer/PWA/AdSense/Build-kit: D-181/D-177/D-179/D-180. Icons: #70–79 produced via the owner pipeline (all edge-verified no-white, 4–11 KB each), wired in SITE_ICON_ART → 80/100. Team illustrations: scan found ZERO broken image references (all present); empty-state art added to the announcements desk; team HTML consolidation deferred to its own dedicated turn (owner allowed "if possible" — doing it safely needs a full regression pass, not a rushed splice). Brevo: retested live (smtptest3 → HTTP 500, error_id 01a035f2) — Supabase side confirmed fine, Brevo side still blocking; exact contact steps in docs/BREVO-CONTACT.md. Google consent fix steps + scopes + redirect allowlist in docs/GOOGLE-OAUTH-BRANDING.md. Suites 3/3 green incl. the new P-094 fixture; cache v71→v72.

**Execution:** Recorded in EOP `v0.89.0`.


### P-095 — 2026-08-25 — AI intent training delivered, splash/construction orders (turn interrupted mid-build)

**Owner intent (decoded):** Train the search AI with the provided suggest/never rules (meal-planner/recipe boundaries, file converter, flashcards, invoice, shopping, travel, resume, photo-edit vs generation — Google-style); restore the splash percentage ring to its original position and fix it not lasting 5 s; restructure the construction area (the P-094 pill was wrong); link construction with the team side; real phone notifications (not in-page); footer detail-first flow "not done"; hub see-all/join-now broken; site not loading completely — find the bugs; next 10 images.
**Executed before interruption:** icons #80–99 raws generated; bug-hunt harness built (jsdom); catalogue site mapping for intents gathered. Everything else completed under P-096.
**Execution:** Completed in EOP `v0.90.0` (as P-096 scope).

### P-096 — 2026-08-25 — The maintenance mega-turn: hub killer bug fixed, intent AI live, team A-to-Z control, 100/100 icons, phone push, quiz export

**Owner intent (decoded):** Finish P-095's remaining work; generate the next 10 images and wire them everywhere (trending/staff/recent too); do heavy maintenance + bug-hunting + styling; redesign the guest hero (long warning text not needed in the face); provide the promised Brevo message; next prompt = website-skill uploads + paste-ready builder prompt for other agents; prepare the quiz for take-away (delete next prompt, keep Archive links); team side must own the build percentage (edit/remove construction from the surface); EVERYTHING in Updates linked to the team side a-to-z; roadmap made from the team side; other places that need the same effect.
**Executed:** See D-182–D-190. Real-DOM harness caught the silent hub killer (stale nav guard) + cross-scope crash + splash timing bugs — all fixed and regression-locked. INTENT_ROUTES trained + 30 intent tests green. Construction desk, A-to-Z feed manager, milestone checklist editor all live on the Team side with instant public effect. Phone-push client + SW handlers in. Guest hero v2. Footer auto-continue. 100/100 site icons. Quiz standalone export. Suites 3/3 + browser smoke green; cache v72→v73.
**Execution:** Recorded in EOP `v0.90.0`.


### P-097 — 2026-08-26 — The consolidation mega-turn: one desk shell, maintenance system, preview window manager, install gateway, auto theme

**Owner intent (decoded):** finish anything missed; generate the next 10 images (achievement badges); make trending/staff/recent cards use the icon AS the face (no tile background); day/night mode switches automatically by time (manual still wins); DECISION: build every other website INSIDE this project (no next agent) after learning ads cannot inject into other domains; reduce files toward ~200 and remove dead ones (community/schema SQL already run, quiz export cancelled); iframe windows: new open maximized while the previous shrinks to fit (not buried), MS-Word-style titlebar with minimize/maximize/new-tab/close, previous restored exactly as left, remembered maximize; role preview must sync BOTH ways + dashboard pages filtered by role like the sidebar (no click-then-denied); real phone notifications + an install popup styled like the privacy popup with permission toggles (notifications test instantly; camera/mic/location one-setting-for-all-sites) and the Install button below, the Share button sharing a link that opens that popup; review counts are not zero in places — sweep ALL review counts to the truth; link everything team↔public (dev applications ↔ portal etc.); Construction Desk as its own sidebar page + under-construction actions on every website row; "Mark Under Review" = real maintenance for that website (users see the maintenance screen, cannot use it); whole-website maintenance toggle in Settings = total lockdown nothing can override; hub review stat fixed; profile name editor as a popup from an Edit button at the top-right of the profile header; the daily-8AM/notification backlog ideas noted for the push era; answer whether a real downloadable app is possible for free.
**Executed:** All of it — see D-191–D-199. Plus the honest free-real-app answer recorded in native/PWA-APP-MODE.md (short: no free true-native installer without scary warnings; the PWA install gateway IS the free real-app path, and on Android it is indistinguishable from a store app). Notifications-when-closed / daily 8 AM hello remain server-push features that activate with the production domain + VAPID keys (roadmap item 6) — the client side is fully built.
**Execution:** Recorded in EOP `v0.91.0`.


### P-098 — 2026-08-26 — Skills in, specs out; coins; fullscreen; keywords; deployment guide; badges 11–20

**Owner intent (decoded):** build/verify the A1–B5 community+developer plan (already built — verified, links repaired); fix the team "View" links that died in the consolidation; next 10 images (badges); reduce files + organize; search keywords like Google; maximize = cover the WHOLE screen; GitHub/Vercel/Netlify/SPCK procedures + file-upload limits + changed-files lists each turn; RxLife + Pharmapaedia into the Deployed side; the Chrome-banner/extension question answered; the 9 uploaded skill files processed into buildable specs (free adaptations only); coin system (balance, buy, super-admin approval, betting, bet-only leaderboards, creator-quiz no-win rule, weekly top-10 rewards, withdrawals) + an MD of questions for ChatGPT; games get the same coin settings; quiz leaderboard too.
**Executed:** D-200–D-206 (all above). Badges 11–20 wired (20/30). Suites 3/3 + keyword probes green; cache v74→v75. The first website BUILDS next turn from its spec (sites/ folders, quiz family layout).
**Execution:** Recorded in EOP `v0.92.0`.

## §12. Known constraints and observations

- The owner-directed cleanup removed the original intake copies and all superseded exports. Recovery now uses the working project, one latest verified ZIP, and one standalone portable JSON handoff requested in P-031. The portable artifact stays outside the project tree to avoid recursively embedding itself.
- Production authentication and shared-state front-end code is complete, but activation requires the owner’s Supabase project URL/anon key, SQL schema execution, Google provider setup, and redirect allowlist.
- Authenticated bookmarks, reviews, votes, visits, preferences, collections, notifications, and product progress sync through Supabase after activation. Guest equivalents stay in `sessionStorage`, transfer into the account only when authentication occurs before expiry/end, and otherwise clear after explicit end or 30 continuous hidden/offline minutes.
- Recent Search phrases are device-local for signed-out/authenticated browsing and session-only for Guest; they are capped at eight, clearable, and included in Download My Data. Future AI/intent Search remains a separate protected backend/API project.
- Updates are client-paginated after filtering in ten-item increments. This reduces rendering length but is not server/database pagination.
- On phones, bottom navigation still hides over the footer. At 700px and above it dynamically shifts above the visible footer; owner physical-device confirmation remains pending.
- Privacy policy/controls, Terms/Community/Cookie documentation, Request a Website, Help & Support, About Paragon, and the public Archive Hub are implemented inside `paragon-archive-hub.html`. The four former standalone pages and the Request/Help page scripts were removed after link/controller migration. Secure account deletion, protected moderation/administration, and most real product destinations still require owner/backend work.
- About currently uses a styled founder-photo placeholder. Replace it only with an owner-approved real founder image and appropriate alt text.
- Public support submission files are prepared but require final schema, private Storage bucket, allowed-origin secret, `submit-support-message` deployment, and active outbox email delivery. Screenshots remain private and are initially reviewed through Supabase Dashboard.
- Help documentation currently uses six styled screenshot placeholders. Replace them with real Archive screenshots after owner device/content approval without changing the guide structure.
- Support anti-spam is a free-first honeypot plus three-messages-per-email/24-hours database limit without IP/device fingerprinting. A determined attacker rotating addresses may require future Turnstile or account-only upload rules.
- Website-request submission is account-only. Guest can save a session draft but cannot submit; no IP/device fingerprint is used for this limit. The rolling seven-day database trigger becomes active after the updated schema is run in Supabase.
- Transactional email files are prepared but send nothing until Brevo sender/API, Edge secrets, function deployment, Database Webhook, and Supabase Auth custom SMTP are activated. Provider limits and terms can change; verify the current free allowance before launch.
- Gmail password/OAuth secrets are not used. The initial visible sender can be the verified Gmail address through Brevo; a verified `paragonarchive.com` sender is recommended later if the owner controls its DNS.
- Google does not pay merely for Archive users. AdSense requires a separate application/review and policy-compliant, original, audience-attracting content; optional ad scripts must remain absent until approval and consent-aware integration.
- The former curated `247` request count is removed. `paragon_request_count()` now returns the actual accepted-row aggregate, starting at zero in an empty database; the Request page uses zero while Supabase is unconfigured.
- Dev is removed. Originals remains a single-site category containing only Paragon Archive Hub. The Hub public documentation/page is live in the front end; Team login, Community, developer applications, Deployed upload/review/hosting, moderation, payments, and dashboards remain protected future operations, not current authorization.
- Deployed appears only as a `🚀` planned empty category and ten documented future subcategories. No third-party website, rating, developer identity, premium offer, analytics total, or transaction is fabricated.
- Archive Hub System Status intentionally reports available-preview/prepared/limited/planned states. It is not a production uptime monitor and cannot claim incident-free operation before monitoring is connected.
- New/Updated timeline events derive from catalogue data; Maintenance, Announcement, and Featured/Promoted events are currently curated in `data/updates.js` until a production update feed exists. Authenticated in-app notifications sync those events only from the account activation calendar day forward, expire after 24 hours, and remain distinct from future external push/email delivery.
- View totals and daily/weekly rankings use only real activity saved in the current browser (P-046 removed all demo seeds). Authoritative global and personalized rankings require the future analytics backend listed in CTA §13.
- Earlier inherited dates were normalized into August 1–3, 2026 to match the confirmed project start; no active product date predates August 2026. Owner may refine exact within-project timestamps later if authoritative records exist.
- Remote Google Fonts, Picsum images, and avatar images require network access; image failures now degrade to styled local placeholders, but final production assets remain pending.
- Detail screenshot states currently use stable generated placeholder images; owner-supplied real product screenshots should replace them later without changing the lightbox API.
- Every unfinished product now has a tailored shared concept-preview URL so iframe OPEN is useful. These pages are explicitly `previewOnly`; they are not substitutes for building the real products or supplying final URLs/assets.
- `docs/AI-BRAIN.md` governs the active local one-core Search/Detail assistant and future external inference. The current core is deterministic retrieval/Q&A, not a trained foundation model. Provider, model/runtime, budget, retention, languages, fine-tuning, and production safety/evaluation remain owner/backend work.
- The uploaded `paragon-archive-ai.md` was JavaScript but unsafe to ship unchanged; its secure replacement contains no hardcoded provider token, browser API-key storage, direct model-provider calls, fake Request success, or unrestricted generated-code preview. The raw upload was removed after migration.
- Guest may receive only protected public ad/promotion notification records; welcome and catalogue updates remain authenticated-only. The public campaign feed is empty until protected Team tooling/backend exists.
- Achievements now expose one stage at a time from 22 defined tasks; unlocking stage state is personal-state metadata and later-stage completion may depend on production account/notification activity.
- Share and QR always point to the canonical Archive detail URL. QR creation uses the bundled MIT-licensed `vendor/qrcode.min.js` encoder and no remote QR image service.
- Iframe previews depend on each destination’s `X-Frame-Options`/CSP; blocked sites must use Open in New Tab.
- Review votes are currently per-user personal state with seeded display counts; global vote aggregation can move to a dedicated backend table later.
- PWA installation/service workers require HTTPS or localhost and must be tested in the final deployment scope.
- The policy references Google Analytics/Ads, but those scripts are intentionally not connected in this export; optional consent defaults off until a future integration respects `ParagonPrivacy` preferences.
- Secure account deletion requires a future backend/admin workflow; the current control reports that limitation instead of falsely deleting.
- The Open progress ring reports launch preparation, not inaccessible cross-origin network percentage; real URLs launch at completion.
- Creator Demo email matching is presentation-only. Any future creator/admin privileges must use protected Supabase claims or server-side authorization.
- Inline event handlers still exist inside generated catalogue/detail markup. They are functional and tested, but a future module/CSP refactor may remove them when production routing is introduced.
- No graphical browser engine is installed in the workspace; automated syntax, structure, state, and interaction fixtures pass, while final visual/device confirmation remains owner-dependent.

---

# CTA — Call To Action (living requirements doc)

> **Purpose:** The single list of everything still needed from the owner to finish the project—content, decisions, missing flows, and questions—plus clearly separated improvements that can be built without owner content and future backend/external requirements.
>
> **How it stays current:** Completed items are removed so this section shows only what remains.
>
> **Legend:** ⬜ needs **you** · 🔧 I can build it after approval/prioritization · ⚙️ backend/external, usually later

## §13. Pending Content reminder

> Front-end code, Supabase schema, and the transactional-email foundation are prepared for handoff. The owner will perform the following activation/tests later and provide feedback. Items below are the only remaining owner/external/backend/content tasks.

### A. Owner testing checklist — do later

- ⬜ Re-test only the remaining responsive preview cases: Archive Hub inside iframe at laptop `1366×768` and MacBook `1440×900`, plus mobile Open in New Tab visibility beside close. Other resolution, Hub, PWA, catalogue/detail, collection, disclosure, and textual-arrow checks passed owner testing.
- ⬜ Test two-stage Search: autocomplete remains below input, no-match autocomplete disappears silently, mixed-case inline hint previews/accepts correctly, Enter opens Results, Results no-match routes to Request, and the single Back returns Results → Search → prior Website context.
- ⬜ Test Updates replacement pagination: first ten, View more replaces with next ten, Previous restores prior ten, smaller final page, exact filters, page-one reset, and notification target page selection.
- ⬜ Test top appearance action: default dark displays sun; switching light changes the environment and icon to moon at the same time; switching back restores dark/sun and Account setting stays synchronized.
- ⬜ Test Detail conditional content: About and Updates descriptions clamp at three lines only on overflow; Key Features/Version History show three items before Read more and restore correctly with Show less.
- ⬜ Test Ratings & Reviews pagination with 9/10/11/12+ records: newest ten first, smaller second page, Previous/View more replacement, and sort/star filters applied before pagination.
- ⬜ Test return-to-intent for signed-out Review, Bookmark, Collection, Vote, and Request actions using Guest and—after activation—Email/Google. Confirm exact detail/tab/scroll/history returns and only the allowlisted intended action resumes.
- ⬜ Test staged achievements: stage one’s five tasks, More Soon live total remaining, manual stage-two unlock without Progress as a stage-one prerequisite, Progress Starter first in stage two, later five-task stages, and final two-task stage.
- ⬜ Test shared concept previews from multiple categories in iframe/New Tab: tailored data/features, consistent visual system, honest preview label, Archive-detail return, mobile layout, and Archive Hub retaining its real destination.
- ⬜ Test Guest notifications with future protected fixture/backend data: ad/promotion only, sponsored disclosure, read state, 72-hour expiry, and no welcome/catalogue updates. Test authenticated welcome/update behavior separately after Supabase activation.
- ⬜ Test consolidated Hub Request/Help/Privacy behavior after real account/provider activation: request count/submission/receipt/rate limit, Support Edge/private upload/owner email, privacy data export, and account prefill.
- ⬜ Test active local Paragon AI: messy/typo/vague Search ranking, no-match fallback, every Detail Ask Paragon AI dialog, grounded feature/status/free/opening answers, unsupported-question honesty, keyboard/mobile dialog behavior, and no external network/provider claim.
- ⬜ Review `docs/AI-BRAIN.md` for catalogue knowledge, terminology, future provider/backend choices, query retention, supported languages, health/finance/legal boundaries, evaluation targets, fine-tuning policy, and budget before external inference begins.
- ⬜ Test the portable single-file JSON handoff by uploading it alone to a fresh agent and reconstructing all files/checksums without the ZIP.
- ⬜ Test the final ZIP and portable-bundle manifests against the project and keep external backups.

### B. Supabase/authentication activation

- ✅ ~~Add Supabase project URL and public anon key to `config/supabase.js`~~ — DONE 2026-08-17 (key verified role=anon, connection tested live).
- ✅ ~~Run the final `supabase/schema.sql`~~ — DONE by the owner 2026-08-18; live probes verified (RPC real 0, tables live, authenticated-only security working).
- ✅ Email provider enabled (verified 2026-08-17) · ✅ Google provider ENABLED (verified by live settings probe 2026-08-18).
- ✅ ~~Configure Google OAuth credentials and Supabase callback URL~~ — DONE by the owner 2026-08-18, probe-verified.
- ⬜ Add the exact production origin/path callbacks to the Supabase redirect allowlist.
- ⬜ Create the configured Creator Demo email as a real Supabase Email user using the privately held password; never place that password in browser files.
- ⬜ Verify `paragon_user_state` notification JSON, Guest-transfer state fields, `paragon_profiles`, username RPC/trigger, public `paragon_request_count()`, request columns/RLS, `enforce_paragon_request_rate_limit`, no-email in-app receipt branch, private email outbox, and email queue branch after schema execution.
- ⬜ **RUN ONCE (P-094/D-174):** paste `supabase/announcements-schema.sql` in the Supabase SQL editor — creates `paragon_announcements` + `paragon_team_members`, seeds the 4 real announcements, and turns the Team desk into an every-device live editor (sign in on the team desk device with the Paragon account).
- 🔴 **BREVO BLOCKED ACCOUNT-SIDE (P-094, 2026-08-24):** Supabase SMTP config is confirmed correct; live signup probe (`+smtptest3`) still returns HTTP 500 "Error sending confirmation email". Follow docs/BREVO-CONTACT.md (3 self-checks + the exact support ticket text). After Brevo lifts the SMTP hold, the retest runs before anything is marked working.
- ⬜ Store Brevo/webhook sender values only with `supabase secrets set`; never place them in browser files.
- ⬜ Deploy `send-transactional-email --no-verify-jwt`, configure the protected outbox INSERT Database Webhook, and test status logging.
- ⬜ Configure Supabase Auth custom SMTP with the verified Brevo sender for signup verification, recovery, and future email OTP. *(Your Supabase side is done — only the Brevo hold above remains.)*
- ⬜ Set exact `PARAGON_ALLOWED_ORIGINS`, deploy `submit-support-message --no-verify-jwt`, and verify private `support-attachments`, support-message RLS/grants, 24-hour rate limit, and owner notification.
- ⬜ If `paragonarchive.com` DNS is controlled, verify the domain and later switch to a branded sender such as `notifications@paragonarchive.com`.

### C. Content and product assets

> **P-046 line-by-line audit additions** — every remaining feature that waits on something from you:

- ✅ ~~**LOGO DECISION (P-068):** pick logo-mark Concept A or B~~ — DONE 2026-08-18: owner selected Concept B (faceted ◈ diamond); brand suite produced and wired (D-154).
- ✅ ~~**Site icons 100/100 COMPLETE** (P-096/D-183)~~ · ✅ **Achievement badges 10/30** (P-097/D-193 — stages 1–2 wired via BADGE_ART; emoji fallback for the rest). NEXT: badges 21–30 (final 10).
- ⬜ **og:image absolute URL:** becomes possible only after the production-domain decision (existing CTA item).
- ⬜ **LAB full definition (P-067):** Lab v1 is live as a no-action preview workbench (page picker, device frames, Actions switch OFF by default). Explain the rest of the Lab concept whenever ready and it will be extended.
- ⬜ **Dev-application form spec:** you mentioned you sent the application form layout once and it was missed — re-send it and the self-designed team/applications page will be reconciled to your exact form.
- ⬜ **Layout material for the seven self-designed pages:** if you still want to supply your original layout stuff for Dev Applications / Reviews & Reports / Community Posts / Suggestions / Website Stats / User Stats / Settings, send it any time; the built pages will be adjusted to match (P-001 preserve-first).
- ⬜ Decide whether the new template-marketplace product keeps the name "Paragon Templates" or another name.
- ✅ ~~**Inherited demo reviews/ratings decision:**~~ RESOLVED 2026-08-18 (P-076/D-162): inherited sample reviews retired from all public display and AI signals; every rating starts "New" until real users review. Original text: votes and view counts are now fully real, so the last non-real display data is the inherited catalogue reviews and their star ratings from intake. Decide before launch: keep as clearly-labelled sample reviews, or remove them so every review is user-written (ratings would start at "New").
- ⬜ **RxLife Network & Pharmapaedia:** currently roadmap concepts only. Tell me when to add them as catalogue entries and/or start building them as real products.
- ⬜ **Per-site build progress:** as each website is actually built, its real `buildProgress` value (0–100) rises in catalogue data; provide priorities for which websites to build first.
- ⬜ **Production origin decision:** final deployment host/domain — now unlocks SIX things: PWA install prompt + server push, Supabase redirect allowlist, absolute `og:image`, support-form allowed origins, **Google AdSense application (docs/ADSENSE-SETUP.md — free to apply)**, and the Google OAuth consent "publish" step.
- ⬜ **Google consent branding (P-094):** follow docs/GOOGLE-OAUTH-BRANDING.md once (app name "Paragon Archive", logo, the 3 basic scopes, redirect URI) so the sign-in screen stops showing the Supabase address.
- ⬜ **Skill material for website builds (OWNER PROMISED NEXT PROMPT): builds now happen IN-PROJECT (D-191 reversed the separate-agent plan) — drop the skill/API plans and they merge into `docs/site-specs/<site>.md`; sites get built under /sites/<name>/ with one shared style kit per category and the Archive links them via siteUrl.
- ✅ ~~QUIZ DELETION~~ RESOLVED DIFFERENTLY (P-097/D-191): the owner decided ALL websites are built inside this project — the take-away export was cancelled and deleted; /paragon-quiz/ stays.
- ⬜ **Team HTML consolidation (P-094, deferred deliberately):** merging the 28 team HTML files into one shell is scheduled as its OWN next turn with a full regression pass — rushing it inside this turn risked breaking desks (owner allowed "if possible, with no lost function").
- ⬜ Confirm the Hub page ideas to build or drop: Showcase, Blog/News, Events, Careers, Changelog.
- ⬜ Replace each `previewOnly` shared concept-preview route with its real same-origin or external product URL as that website is actually built.
- ⬜ Consider additional Archive Hub page ideas (added at your request): **Showcase** (finished Paragon products gallery), **Blog/News** (announcements beyond the Updates feed), **Events** (community challenges/launch events), **Careers/Join the Team** (future applications), **Changelog** (public version history). Approve any of these and they move into the build plan.
- ⬜ Replace each `previewOnly` shared concept-preview route with its real same-origin or external product URL as that website is actually built.
- ⬜ Provide final logos and real product screenshots after each website exists, six final Archive guide screenshots, and the owner-approved founder photo; generated/styled placeholders remain temporary.
- ⬜ Confirm whether Paragon Bet must remain friendly/non-real-money only.
- ⬜ Provide any additional Account settings beyond theme and notifications.

### D. Deferred backend/production work

- ⚙️ Activate protected Archive Hub operations: server-authorized Paragon Team claims/login, role administration, and private management tools; public documentation/gateway is implemented
- ⚙️ Build the Community backend: membership records, verification, profiles/interests, board, Q&A, suggestions, reports, moderation/appeals, badges, beta invitations, monthly updates, and credits
- ⚙️ Build the Deployed backend: developer applications/trials/claims, private ZIP/icon/screenshot uploads, malware/security review, moderation queue, publishing, support routing, premium disclosures, complaints/removal, and protected developer analytics
- ⚙️ Define compliant third-party payment/refund boundaries before any premium Deployed website is approved; Paragon does not currently process those transactions
- ⚙️ Production uptime/incident monitoring and server-backed System Status feed
- ⚙️ Production global + personalized analytics and scheduled daily/weekly ranking jobs
- ⚙️ Optional external push/email notification delivery and richer cross-product real-time synchronization; current authenticated in-app feed/state is implemented
- ⚙️ Protected Paragon Team ad/promotion notification authoring, approval, targeting/consent rules, campaign IDs, click/action analytics, fraud prevention, and 72-hour cleanup; public/browser Team creation remains prohibited
- ⚙️ Admin moderation/processing for website requests; the privacy-safe live aggregate count is already implemented
- ⚙️ Protected support inbox/admin dashboard, private screenshot signed URLs, retention/deletion workflow, and optional Turnstile if public-form abuse appears
- ⚙️ Secure account-deletion request/processing workflow and 30-day purge automation
- ⚙️ Google AdSense application and consent-aware ad integration only after Google approves a complete policy-compliant production site
- ⚙️ SMS OTP and WhatsApp Business messaging through separate providers, templates, consent, quotas, and abuse controls
- ⚙️ Global review-vote aggregation and abuse moderation
- ⚙️ External-model enhancement for the one Paragon AI core: protected endpoint/provider/model, server-side index/embeddings, secret proxy, rate limits, retention, abuse controls, evaluation, monitoring, costs, and local-engine fallback
- ⚙️ Activate reserved Tutor and product-specific Paragon AI modes only as each real product, curriculum/tool permissions, safety policy, and backend context become available
- ⚙️ Optional server-side HttpOnly refresh-token/session hardening
- ⚙️ Final hosting, monitoring, analytics, asset CDN, backups, and deployment pipeline

### P-099 — 2026-09-03 — Continue from GitHub restore: build first /sites/ products from the nine specs

**Owner intent (decoded):** Zip upload failed earlier; owner pushed the workspace to GitHub and asked to continue building the website. Handoff (NEXT-AGENT after P-098) ordered the first in-project builds under `/sites/<slug>/`.

**Decisions**
- D-207: Ship nine vanilla product sites sharing `sites/_shared` kit; map personal-shopper → catalogue Paragon Shop; meal-planner pairs with Paragon Recipe without a separate catalogue row.
- D-208: Catalogue `siteUrl` points at in-project paths; `buildProgress` honest mid-range (55–80) until owner demo pass — not fake 100.
- D-209: LIVE_SITES / unfinished-preview fixture expanded so only remaining unfinished records keep concept-preview routes.

**Delivered:** shared kit, 9 site folders + SPEC.md each, catalogue wiring, REALLY_UPDATED, cache v76, P-099 fixture, file tree, EOP v0.93.0, CHANGES, NEXT-AGENT.

### P-100 — 2026-09-03 — Coins master + 9 skill files (upload path flaky); SQL pack + product depth

**Owner intent:** Use 10 uploaded MD files (coins master + 9 product skills), deepen the 9 sites, ship all Supabase SQL to run now.

**Decisions**
- D-210: Coins backend SQL is the multi-device source of truth; localStorage remains offline-first fallback and same-device team desk loop.
- D-211: Withdrawals are manual team payouts (no automated bank API in free tier).
- D-212: Product depth upgrades stay vanilla/local engines per Site Build Kit even when skill files describe React/API stacks.

**Delivered:** coins-schema.sql, SQL-RUN-PACK.md, withdrawals UI, 9 site upgrades, EOP v0.94.0, cache v77.

### P-101 — 2026-09-03 — GitHub uploads/ skills + coins master Phase 1b + full maintenance

**Owner intent:** Skills live in GitHub `uploads/`; agent reads them; SQL checklist; maintain Archive/Hub/Account/Team/Updates/detail/products.

**Decisions**
- D-213: Skill source of truth = `uploads/` (+ mirror `docs/skills/`) on GitHub when Arena disk uploads fail.
- D-214: Coin purchase production target ₦1 = 1 coin; real_money_enabled defaults false.
- D-215: Owner verifies SQL via OWNER-SQL-CHECKLIST (agent cannot reach Supabase DNS from this sandbox).

**Delivered:** coins-master-phase1.sql, OWNER-SQL-CHECKLIST, rate honesty, product-wave announcement, skill depth, cache v78, EOP v0.95.0.

### P-102 — 2026-09-03 — Complete all skill partials + coins master Phase 2

**Owner intent:** Finish everything previously marked partial on the 9 uploads skills and the coins master “No”.

**Decisions**
- D-216: Skill “complete” for free Paragon products means full browser-local engines for every capability that can run without paid servers/native binaries; remaining skill rows stay documented as not-faked.
- D-217: Coins master Phase 2 ships authority SQL RPCs + FE gates; provider webhooks are Phase 3 (owner).
- D-218: buildProgress may rise into the 80–92 band after depth passes; 100 only after owner demo per Site Build Kit.

**Delivered:** product depth P-102, coins-master-phase2.sql, FE coin authority path, cache v79, EOP v0.96.0.

### P-103 — 2026-09-03 — Coins Phase 3 + live SQL confirmation path

**D-219:** Sandbox DNS cannot reach Supabase; owner browser Team probe / Dashboard VERIFY is source of truth for “SQL ran”.
**D-220:** Phase 3 = provider-agnostic webhook + reconcile; never credit from client-only claims.
**Delivered:** phase3 SQL, Edge pair, Team probe, deploy doc, cache v80, EOP v0.97.0.

### P-104 — 2026-09-03 — Phase 4 + complete remaining skill browser depth

**D-221:** “Everything in the 10 uploads” means browser-complete + coins phases 1–4 in repo; native/provider/licence rows stay not-faked.
**D-222:** Phase 4 = competition/leaderboard/prize/cases server RPCs; client never settles money.
**Delivered:** phase4 SQL+Edge, finance desk, SKILLS-COMPLETION.md, product depth, cache v81, EOP v0.98.0.

### P-105 — 2026-09-03 — Assurance path + badges 21–30 + polish

**D-223:** Full SQL assurance = owner-run Script A / Team probe / GitHub Actions anon — not agent DNS and not service_role in GitHub.
**D-224:** Achievement badges 1–30 complete matched set under `assets/achievement-badges/`.
**Delivered:** verify prompt, Actions workflow, badges 21–30, polish, file tree, EOP v0.99.0, cache v82.

### P-106 — 2026-09-03 — 50 achievements (ads + leaderboard)

**D-225:** Achievement set is 50 tasks / 10 stages; badges 31–50 focus ads, top-10 climb, retention.
**D-226:** Ad achievements count honest impressions + intentional support taps (reserved slots until AdSense live) — never fake revenue.
**D-227:** Engagement leaderboard is practice ranking on-device; coin competition settle stays server/team only (D-222).
**Delivered:** 20 badges + tasks, ads bridge, leaderboard UI, cache v83, EOP v1.00.0.

### P-107 — 2026-09-03 — Phase 5 OPay/Moniepoint + badge polish

**D-228:** Preferred payment rails are OPay and Moniepoint (bank-transfer-first). Flutterwave/Paystack are optional adapters only.
**D-229:** Coins SQL phases 1–5 complete in repo; no mandatory phase 6 SQL. Remaining work is owner activation and optional live APIs/compliance.
**Delivered:** phase5.sql, webhook normalizers, Team rails desk, FE pay cards, COINS-PHASES.md, badges 41–50 AI art, cache v84.

### P-108 — 2026-09-03 — Stage 1 foundation complete (audit + hardening)

**D-230:** Stage 1 foundation is complete in-repo (ledger, RLS, authority RPCs, real_money OFF, rate limits, reserves, reports). Owner must run SQL for live effect.
**D-231:** Do not redo completed coin phases; Stage 2 starts only from owner brief on remaining gaps (paid quiz server, live API payouts, etc.).
**Delivered:** COINS-AUDIT-CHECKLIST, stage1-hardening.sql, finance report desk, DR doc, cache v85.
