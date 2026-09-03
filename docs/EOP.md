# EOP — Executed Operation Procedure

> **Purpose:** Append-only execution history for Paragon Archive. This document records what was actually changed, when it changed, why it changed, the files affected, and the validation performed.
>
> **Companion:** [`SOP.md`](./SOP.md) is the source of truth for requirements, decisions, project state, prompt history, and the living CTA.

## Versioning rules

- Use semantic project versions: `MAJOR.MINOR.PATCH`.
- Every delivery adds a new entry; previous entries are not rewritten except to correct a factual error.
- Each entry must identify the request, actions, files, validation, result, and any remaining risk.
- Functional or visual behavior must not be changed without a recorded reason.
- Status: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked.

---

## v0.1.0 — 2026-08-04 — Project intake and safe baseline

**Request reference:** SOP §11, Prompt P-001  
**Status:** `[x]` completed

### Executed actions

1. Read and inventoried all three uploaded files.
2. Created a working project at `/home/user/paragon-archive/`.
3. Preserved the uploaded source files unchanged in `/home/user/uploads/`.
4. Copied and normalized the working filenames so the existing HTML references resolve:
   - `paragon-archive.html` → `index.html`
   - `paragon-archive.css` → `style.css`
   - `paragon-archive.md` → `app.js`
5. Created the two requested governance documents:
   - `docs/EOP.md`
   - `docs/SOP.md`, including the living CTA
6. Recorded the non-monolithic page-architecture rule: new HTML pages will be created when a feature is a genuinely independent page or flow; existing working sections will not be split merely for appearance.
7. Made no intentional visual, content, or functional changes to the application code during intake.

### Files created

- `index.html`
- `style.css`
- `app.js`
- `docs/EOP.md`
- `docs/SOP.md`

### Source-integrity verification

The working code files matched their uploaded sources byte-for-byte immediately after copying:

| Source | Working file | SHA-256 |
|---|---|---|
| `uploads/paragon-archive.html` | `paragon-archive/index.html` | `d8ee439e30c8e24b7c820f27d4987d736bd017bf333e9fb1311df93312dda7c0` |
| `uploads/paragon-archive.css` | `paragon-archive/style.css` | `7b75e78e0f20b95dadb70e5258a82fecd8078154a878e9fa7d17ce4b57a13666` |
| `uploads/paragon-archive.md` | `paragon-archive/app.js` | `dcf801731a3584f907529c1b99812c054c26982628fa79b9d01a73cf80e42bc4` |

### Validation

- `[x]` Uploaded files are still present and unchanged.
- `[x]` `index.html` references `style.css`.
- `[x]` `index.html` references `app.js`.
- `[x]` The JavaScript working file now has the required `.js` extension.
- `[x]` `node --check app.js` completed without syntax errors.
- `[x]` Local HTTP checks returned `200` for `/`, `/style.css`, `/app.js`, `/docs/SOP.md`, and `/docs/EOP.md`.
- `[x]` Documentation structure created.
- `[~]` Interactive browser behavior baseline to be tested before the first bug fix.

### Result

A safe, runnable working copy and project-control baseline now exist. No unrequested redesign or refactor was introduced.

### Known follow-up

- Perform a browser baseline and address one reproducible bug at a time.
- Keep CTA items current in SOP §13.

---

## v0.2.0 — 2026-08-04 — Website responsiveness and reliable top-bar controls

**Request reference:** SOP §11, Prompt P-002  
**Status:** `[x]` implemented; owner visual confirmation pending

### Reported problems

- Laptop and MacBook simulations made the application content look overly constrained or zoomed into the center of a wide background.
- Tablet simulations showed more side spacing than desired.
- The top-bar Account/Profile emoji did not render reliably.
- The notification indicator did not disappear after notifications were opened/read.

### Executed actions

1. Replaced the fixed 1200px main wrapper with a fluid responsive wrapper:
   - `width: 100%`
   - `max-width: 1720px` only for very wide displays
   - responsive horizontal gutters using `clamp(14px, 2.5vw, 44px)`
2. Preserved the existing compact mobile override and general visual design.
3. Replaced the top-bar notification emoji with an inline SVG bell.
4. Replaced the top-bar profile emoji with an inline SVG user icon.
5. Kept both controls as semantic buttons and added visible keyboard focus styling.
6. Kept the unread notification dot and its gentle pulse; disabled that animation when the operating system requests reduced motion.
7. Added notification state behavior:
   - opening notifications marks the two demo updates as read;
   - the unread dot is hidden;
   - the button’s `data-unread` and accessible label are updated;
   - read state is saved in `localStorage` when available;
   - the interaction still works for the current page when storage is unavailable.
8. Removed the long duplicate inline Account click handler; Account navigation now uses the existing `bindTopIcons()` path.
9. Did not create another HTML page because this work corrects the existing Website environment and top bar rather than introducing an independent page/flow.

### Files changed

- `index.html`
- `style.css`
- `app.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` `node --check app.js` passed.
- `[x]` HTML audit confirmed unique IDs.
- `[x]` Notification and profile controls are semantic `<button>` elements.
- `[x]` Two inline SVG top-bar icons are present.
- `[x]` Notification control begins with an explicit unread state.
- `[x]` A Node interaction fixture confirmed that notification opening hides the dot, updates `data-unread`, updates the accessible label, and stores the read state.
- `[x]` The same fixture confirmed that the profile click handler is bound.
- `[x]` Responsive wrapper calculations produced positive, non-overflowing content widths for Galaxy S5 (360px), Pixel 7 (412px), Galaxy Tab (768px), Tab S6 Lite (800px), laptop (1366px), MacBook (1440px), and 1920px desktop widths.
- `[x]` `/`, `/style.css`, and `/app.js` returned HTTP `200` from the live preview.
- `[!]` No graphical browser automation engine is installed in the workspace, so final appearance confirmation in the owner’s SPCK presets is still required.

### Result

The Website environment now uses more of the available tablet and computer width without changing the established phone-first appearance. The bell and profile controls no longer depend on inconsistent emoji rendering, and the unread dot now clears when notifications are opened.

### Remaining risk

SPCK’s resolution simulator may scale some desktop presets differently from a physical browser. Owner screenshots or exact viewport dimensions will be needed if any preset still appears zoomed or overly centered.

---

## v0.3.0 — 2026-08-04 — Sixteen new websites and related-catalogue bindings

**Request reference:** SOP §11, Prompt P-003  
**Status:** `[x]` completed

### Requested catalogue additions

1. Paragon Resume — Productivity
2. Paragon Whiteboard — Creative
3. Paragon Palette — Creative
4. Paragon Exam — Education
5. Paragon Tutor — Education
6. Paragon Confess — Social
7. Paragon Events — Social
8. Paragon Sounds — Entertainment
9. Paragon Theater — Entertainment
10. Paragon Bet — Games
11. Paragon Survival — Games
12. Paragon Invest — Finance
13. Paragon Wardrobe — Lifestyle
14. Paragon Journal — Lifestyle
15. Paragon Deploy — Dev Tools
16. Paragon Contrast — Dev Tools

### Executed actions

1. Created `data/sites.js` as the dedicated catalogue source.
2. Moved the twelve existing records from `app.js` into `data/sites.js` without changing their record text.
3. Added all sixteen supplied products with:
   - exact names, descriptions, and visible categories from the owner;
   - individual icon, accent color, tag, About text, version label, and feature/update list;
   - `isNew: true` for data-driven Recently Added rendering;
   - an honest `New` rating and empty reviews array instead of invented customer feedback.
4. Added case-insensitive name deduplication before combining existing and incoming records.
5. Loaded `data/sites.js` before `app.js` using deferred scripts.
6. Updated Recently Added to derive all cards from `isNew` rather than three hard-coded array indexes.
7. Updated All Websites A–Z to sort a copy of the combined catalogue by name.
8. Added Productivity, Entertainment, Lifestyle, and Dev Tools to:
   - category color mapping;
   - Website-tab category browsing;
   - search filter chips and search category browsing.
9. Added category-family relationships:
   - Tools ↔ Productivity
   - Media ↔ Entertainment
   - Health ↔ Lifestyle
   - Dev ↔ Dev Tools
   - matching categories such as Creative, Education, Social, Games, and Finance remain naturally grouped.
10. Added a Related Websites section to dynamic details so compatible existing and new products link to each other.
11. Added a clear empty-review state for new products.
12. Added responsive styles for related-site cards.
13. Kept the existing dynamic-detail architecture; no sixteen duplicated HTML pages were created because the existing products also use one reusable detail renderer.

### Files created

- `data/sites.js`

### Files changed

- `index.html`
- `app.js`
- `style.css`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` `node --check data/sites.js` passed.
- `[x]` `node --check app.js` passed.
- `[x]` Combined catalogue contains exactly 28 records: 12 existing and 16 new.
- `[x]` All 28 names are unique using case-insensitive comparison.
- `[x]` Every requested new name appears exactly once.
- `[x]` Every new record contains category, description, About content, version, updates, reviews state, icon, and color.
- `[x]` Existing site-record text matches the original uploaded JavaScript data byte-for-byte after extraction.
- `[x]` Recently Added renders exactly 16 new cards in the interaction fixture.
- `[x]` All Websites A–Z renders exactly 28 cards in alphabetical order.
- `[x]` Every one of the 16 new cards produced a detail view containing its title, What’s New content, empty-review state, and Related Websites section.
- `[x]` Old/new binding fixtures confirmed representative relationships including Resume ↔ Notes, Whiteboard ↔ Design, Exam ↔ Education, Confess ↔ Social, Sounds ↔ Vibe, Bet ↔ Chess, Invest ↔ Finance, Journal ↔ Health, and Deploy ↔ Code.
- `[x]` `/`, `/style.css`, `/data/sites.js`, and `/app.js` returned HTTP `200`.
- `[!]` Final graphical appearance still requires owner confirmation in SPCK or a physical browser because no graphical browser engine is installed in the workspace.

### Result

The catalogue now contains 28 unique websites. All sixteen new products appear in Recently Added and the alphabetical catalogue, use the existing reusable detail experience, and are connected to relevant existing products through Related Websites.

### Remaining content dependencies

- Real destination URLs
- Final logos and screenshots
- Confirmed release dates/version labels
- Owner confirmation of the non-real-money scope currently stated for Paragon Bet

---

## v0.4.0 — 2026-08-04 — Context-preserving Back navigation and category-aware search

**Request reference:** SOP §11, Prompt P-004  
**Status:** `[x]` implemented; owner SPCK confirmation pending

### Reported problems and requirements

- Detail `← Back` returned to the top of the Website tab instead of the location where the user opened the card.
- This was especially frustrating after scrolling far into a list or opening a result from Search.
- Search needed a more lively website-matched input border, autocomplete, a working `All` filter, and real category-scoped filtering.
- Future AI intent search needed to be recorded without falsely presenting the current front-end search as AI.
- Website-tab Browse by Category is intentionally deferred until the website list is finalized.

### Executed actions

#### Detail return context

1. Added an in-memory detail navigation-state stack.
2. Before opening a detail, the application now records:
   - source tab;
   - page scroll position;
   - current detail name when following Related Websites;
   - whether Search was open;
   - Search query;
   - selected Search category;
   - Search overlay scroll position.
3. Updated detail `← Back` to restore the preceding state instead of forcing Website/top.
4. Added nested-detail behavior: opening a Related Website and pressing Back restores the previous detail and its exact scroll; pressing Back again returns to the original list position.
5. Added active-tab and `aria-current` restoration.
6. Added a descriptive Back label and focus target for the detail control.

#### Search behavior

7. Rebuilt the Search overlay markup around data-driven category containers and live catalogue results.
8. Replaced the hard-coded three recent items with results generated from all 28 websites.
9. Made `All` the unrestricted search scope; All + empty query displays all 28 websites alphabetically.
10. Made each category an exact scope; category + empty query displays every website in that category, while category + query filters only inside it.
11. Synchronized category chips in both filter and Browse-by-Category groups with `aria-pressed` states.
12. Added weighted local relevance across website name, category, tag, description, About text, and updates/features.
13. Added browser autocomplete and a native datalist containing all 28 website names.
14. Added purpose/feature descriptions to search result rows.
15. Added result counts, scope summaries, and an informative empty state.
16. Recorded future AI natural-language/intent search in SOP/CTA as a separate backend/external phase.

#### Search UI and accessibility

17. Added a rounded animated gradient border using the current website accent plus complementary colors.
18. Added focus glow, responsive phone sizing, and a reduced-motion fallback.
19. Added explicit Search open/close functions, correct `aria-hidden` updates, Escape closing, focus return, modal focus containment, backdrop closing, and body scroll locking.
20. Search opened from a preserved detail state reopens without forcing the mobile keyboard and restores its overlay position.

#### Regression protection

21. Created `tests/search-navigation.test.js`, a dependency-free Node fixture for search and navigation-state behavior.

### Files created

- `tests/search-navigation.test.js`

### Files changed

- `index.html`
- `style.css`
- `app.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` `node --check app.js` passed.
- `[x]` `node --check data/sites.js` passed.
- `[x]` `node --check tests/search-navigation.test.js` passed.
- `[x]` Regression fixture confirmed All + empty query returns all 28 websites.
- `[x]` Regression fixture confirmed Creative + empty query returns only the three Creative websites.
- `[x]` Category + query remained inside the selected category.
- `[x]` Descriptive queries found expected products: CV → Resume, homework question → Tutor, white noise → Sounds, static hosting → Deploy, and accessibility contrast → Contrast.
- `[x]` Autocomplete datalist contains 28 website names.
- `[x]` Back restored a Website-tab source position of 2400px exactly in the fixture.
- `[x]` Related-detail Back restored the preceding detail at 1300px, followed by the original list at 900px.
- `[x]` Search-result Back restored the Education scope, `homework question` query, Tutor result set, 360px overlay position, and 1750px underlying page position.
- `[x]` HTML audit confirmed unique IDs, `type="search"`, `autocomplete="on"`, datalist binding, and a correctly hidden initial dialog state.
- `[x]` CSS audit confirmed the accent animation, body scroll lock, and reduced-motion fallback.
- `[x]` `/`, `/style.css`, `/data/sites.js`, `/app.js`, and `/tests/search-navigation.test.js` returned HTTP `200`.
- `[!]` Final animation quality, native autocomplete presentation, and physical/SPCK scrolling behavior still require owner confirmation because no graphical browser engine is installed in the workspace.

### Result

Users can now leave a deeply scrolled catalogue or a filtered Search result, inspect one or more website details, and use `← Back` to return to the exact context they left. Search now supports all-site browsing, exact category scoping, descriptive local matching, autocomplete, and a lively accent-driven input treatment without claiming to be AI.

### Deferred by owner direction

- Website-tab Browse by Category will be upgraded after the website list is finalized.
- AI-powered intent search remains a future backend/external feature.

---

## v0.5.0 — 2026-08-04 — Seven-site daily hero and weekly data-driven Trending

**Request reference:** SOP §11, Prompt P-005  
**Status:** `[x]` implemented; owner SPCK confirmation pending

### Requested behavior

- Keep six-second hero autoplay while adding immediate manual navigation.
- Increase Website of the Day from five fixed slides to the seven most viewed sites.
- Refresh the daily selection once each day from view statistics, retaining the same sites when rankings do not change.
- Generate Trending automatically once per week from views, ratings, reviews, and the preceding week’s daily featured websites.
- Replace the Trending `See all →` alert with a complete ranked list.

### Executed actions

#### Metrics and snapshots

1. Created `data/metrics.js` and loaded it between `data/sites.js` and `app.js`.
2. Added stable per-site seeded totals so the front-end ranking is deterministic before a production analytics service exists.
3. Added browser-local view recording in `localStorage` with an in-memory fallback when storage is blocked.
4. Replaced random detail-view counts with stable formatted totals.
5. Opening a detail now records one view; restoring a previous detail through Back does not create a duplicate view.
6. Added one frozen seven-site daily snapshot per local calendar date.
7. Daily snapshots rank only by total views and recompute on the next date; unchanged rankings naturally retain the same sites.
8. Added a midnight refresh scheduler so a page left open across the date boundary refreshes the daily hero and, when applicable, the weekly ranking.
9. Added Monday-starting weekly snapshots that remain frozen for the week.
10. Weekly scoring now combines:
    - appearances in the previous week’s daily seven-site snapshots;
    - previous-week local view activity;
    - stable total views;
    - numeric rating;
    - review count.
11. Previous-week daily-feature appearances receive the strongest ranking bonus so those sites carry into the following week’s Trending list.
12. Added bounded history pruning for daily and weekly browser data.

#### Hero carousel

13. Replaced five fixed hero picks with the seven daily-ranked sites.
14. Kept the six-second automatic rotation and removed the former hard-coded five-slide wrap.
15. Added visible previous and next arrow controls.
16. Added touch/pointer swipe and mouse-drag navigation with a 45px threshold.
17. Added keyboard ArrowLeft and ArrowRight navigation.
18. Manual arrows, dots, swipe, drag, and keyboard navigation restart the six-second timer.
19. Added carousel/slide ARIA descriptions, active-state updates, seven named dots, focus styles, and phone-responsive controls.
20. Added current stable view totals to each Website of the Day badge.

#### Weekly Trending

21. Replaced the four hard-coded Trending entries with the top seven weekly-ranked entries.
22. Added view, rating, review, category, and ranking information to preview cards.
23. Replaced the `See all →` alert with a full-screen Trending dialog.
24. Rendered all 28 ranked websites as horizontal cards stacked from top to bottom.
25. Added week labeling, ranking explanation, responsive layouts, Escape/backdrop closing, focus containment, and focus restoration.
26. Extended detail navigation state so a detail opened from full Trending returns to the same Trending overlay and scroll position.
27. Clearly labeled the current ranking as a device-local preview rather than site-wide analytics.

#### Regression protection

28. Created `tests/metrics-carousel.test.js`.
29. Extended `tests/search-navigation.test.js` with view-count and Trending-context checks.

### Files created

- `data/metrics.js`
- `tests/metrics-carousel.test.js`

### Files changed

- `index.html`
- `style.css`
- `app.js`
- `tests/search-navigation.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` `node --check data/sites.js` passed.
- `[x]` `node --check data/metrics.js` passed.
- `[x]` `node --check app.js` passed.
- `[x]` Both dependency-free regression test files passed.
- `[x]` Daily fixture returned exactly seven unique sites.
- `[x]` Same-date fixture remained frozen after view totals changed.
- `[x]` Next-date fixture recomputed and included the newly promoted most-viewed site.
- `[x]` `recordView()` incremented stable totals exactly once.
- `[x]` Prior-week fixtures confirmed seven daily-feature appearances carried a site to the top of the following weekly ranking.
- `[x]` Same-week fixture remained frozen after metrics changed.
- `[x]` Next-week fixture created a new ranking from the new preceding week.
- `[x]` Weekly ranking contained all 28 websites.
- `[x]` Hero fixture rendered seven slides and seven dots.
- `[x]` Hero fixture confirmed next, previous, seven-slide wrap, left swipe, ArrowLeft, and automatic timer advancement.
- `[x]` Search/navigation fixture confirmed Back restoration does not add another view.
- `[x]` Full Trending fixture rendered 28 stacked entries and restored its 480px overlay position plus 1120px underlying page position after Detail Back.
- `[x]` HTML audit confirmed unique IDs, required hero/Trending controls, and `sites → metrics → app` script order.
- `[x]` CSS audit confirmed carousel gesture controls and responsive stacked Trending-row styles.
- `[x]` `/`, `/style.css`, `/data/sites.js`, `/data/metrics.js`, `/app.js`, and both test files returned HTTP `200`.
- `[!]` Final gesture feel, animation quality, and device-specific layout still require SPCK/physical-browser confirmation because no graphical browser engine is installed in the workspace.

### Result

Website of the Day is now a seven-site daily view ranking with six-second autoplay plus arrows, dots, swipe/drag, and keyboard navigation. Trending is now a frozen weekly ranking influenced by the previous week’s daily features, views, ratings, and reviews, with a functional complete ranked list.

### Production dependency

The current metrics are stable demo totals plus activity from the current browser. Site-wide or signed-in-user analytics require a backend event pipeline, shared datastore, scheduled ranking jobs, and an agreed global/personalized ranking policy.

---

## v0.6.0 — 2026-08-04 — Daily opportunity-based Staff Picks

**Request reference:** SOP §11, Prompt P-006  
**Status:** `[x]` implemented; owner SPCK confirmation pending

### Requested behavior

- Make Staff Picks the daily opposite of the most-viewed hero and Trending rankings.
- Prioritize websites with the fewest preceding-24-hour views, lowest ratings, and fewest reviews.
- Keep one large featured card and add two smaller cards side by side below it.
- Add a small golden Staff Pick ribbon to the large card’s top-right corner.
- Replace the Staff Picks `See all →` alert with a functional full list.

### Executed actions

#### Daily Staff metrics

1. Extended `data/metrics.js` with timestamped local view events.
2. Added an exact preceding-24-hour local view counter for each website.
3. Added one frozen Staff ranking snapshot per local calendar date.
4. Ranked all 28 websites in ascending opportunity order using:
   - preceding-24-hour views;
   - numeric rating;
   - review count;
   - stable total views;
   - website name as the final deterministic tie-breaker.
5. Kept `New` sites honest by treating their nonnumeric rating as zero rather than fabricating a score.
6. Added daily Staff snapshot persistence and bounded pruning to the existing local metrics state.
7. Updated the midnight scheduler to rerender the Staff preview and any open full Staff list.
8. Preserved the existing rule that Back restoration does not record another view.

#### Staff preview

9. Replaced the fixed `sites[1]` Staff Pick with the daily top three opportunity-ranked websites.
10. Rendered rank one as the existing large featured-card format.
11. Added a CSS-only golden ribbon at the large card’s top-right corner with the label `Staff Pick`.
12. Added ranks two and three as two smaller cards directly below the large card.
13. Kept the two smaller cards side by side, including compact vertical internals on phone widths.
14. Added preceding-24-hour views, rating, and review count to all three preview cards.

#### Full Staff Picks list

15. Replaced the Staff Picks `See all →` alert with a full-screen accessible dialog.
16. Rendered all 28 websites in opportunity order as horizontal rows stacked vertically.
17. Added daily labeling and a clear explanation of the least-exposure ranking.
18. Added Escape/backdrop closing, focus containment, focus restoration, responsive layouts, and initial hidden ARIA state.
19. Extended detail navigation state with Staff-overlay open state and scroll position.
20. A detail opened from the full Staff list now returns to the same full list and position when Back is used.

#### Regression protection

21. Extended `tests/metrics-carousel.test.js` with Staff ordering, daily freeze/rollover, ribbon, three-card preview, and full-list assertions.
22. Extended `tests/search-navigation.test.js` with full Staff list and Back-context restoration assertions.

### Files changed

- `index.html`
- `style.css`
- `app.js`
- `data/metrics.js`
- `tests/metrics-carousel.test.js`
- `tests/search-navigation.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` `node --check data/sites.js` passed.
- `[x]` `node --check data/metrics.js` passed.
- `[x]` `node --check app.js` passed.
- `[x]` Both regression test files passed.
- `[x]` Daily Staff fixture contained all 28 unique websites.
- `[x]` Staff entries were confirmed in ascending 24-hour views, rating, reviews, and total-view order.
- `[x]` Same-date Staff snapshot remained frozen after new views were recorded.
- `[x]` Next-date Staff snapshot moved the newly viewed former leader behind an underexposed website.
- `[x]` Staff preview rendered one golden ribbon and exactly two smaller cards.
- `[x]` Full Staff dialog rendered all 28 ranked websites.
- `[x]` Staff Detail Back fixture restored the 520px full-list position and 1460px underlying page position.
- `[x]` HTML audit confirmed unique IDs and the required Staff overlay controls.
- `[x]` CSS audit confirmed the golden gradient ribbon, two-column smaller-card layout, responsive internals, and Staff overlay styling.
- `[x]` Static audit confirmed Staff capture/restore hooks and the daily scheduler refresh.
- `[x]` `/`, `/style.css`, `/data/sites.js`, `/data/metrics.js`, `/app.js`, and both test files returned HTTP `200`.
- `[!]` Final ribbon proportions, card balance, and device-specific layout still require SPCK/physical-browser confirmation because no graphical browser engine is installed in the workspace.

### Result

Staff Picks by Paragon now refreshes daily as an opportunity ranking for underexposed websites. The Website tab shows one large golden-ribbon pick plus two smaller side-by-side picks, and `See all →` opens a complete context-preserving list instead of an alert.

### Production dependency

Like the hero and Trending metrics, preceding-24-hour Staff statistics are currently based on this browser’s local events. A production analytics backend is required for authoritative site-wide or personalized Staff Picks.

---

## v0.7.0 — 2026-08-04 — Descending Recently Added and private category-led discovery

**Request reference:** SOP §11, Prompt P-007  
**Status:** `[x]` implemented; owner SPCK confirmation pending

### Confirmed product decisions

- Trending weeks run Monday through Sunday.
- Production ranking must support both global/archive-wide and personalized signed-in-user modes.
- The public All Websites A–Z inventory must be removed to avoid advertising catalogue size.
- Public website discovery should be category-led.

### Executed actions

#### Addition chronology

1. Added catalogue-level `addedAt`, `addedSequence`, and `addedDateStatus` metadata after existing/new record deduplication.
2. Preserved the original twelve record bodies; chronology is attached only to the combined exported catalogue.
3. Marked the current sixteen-site intake as recorded on 2026-08-04.
4. Used intake order as deterministic same-date sequence, so later ingested items sort ahead of earlier ones.
5. Added provisional addition dates for the twelve inherited websites using their available version-date evidence.
6. Added a reusable newest-to-oldest sorter:
   - `addedAt` descending;
   - `addedSequence` descending;
   - name ascending as the final tie-breaker.

#### Recently Added

7. Replaced the `isNew`-only ordering with chronological catalogue ordering.
8. Updated the Website-tab preview to show the seven latest additions.
9. Added visible addition-date badges, category/rating metadata, accent edging, gradient image treatment, and livelier hover states.
10. Replaced the Recently Added `See all →` alert with a full-screen dialog.
11. Rendered the complete chronological catalogue as clickable horizontal cards in one swipe/scroll rail.
12. Added newest-first guidance, scroll snapping, a styled gradient scrollbar, responsive card widths, Escape/backdrop closing, focus containment, and focus restoration.
13. Extended detail context state with Recent overlay vertical position and horizontal rail position.
14. A detail opened from Recently Added now returns to the same card rail and position.

#### Catalogue-size privacy

15. Removed the All Websites A–Z section and its `all-grid` markup from the Website tab.
16. Removed the `renderAllGrid()` initialization and renderer.
17. Kept Search `All` functional for discovery but removed public result-count suffixes and the explicit `Searching all 28 websites` message.
18. Search now uses privacy-neutral labels such as `Explore Websites` and `Searching across the archive`.

#### Browse by Category

19. Centralized category names, icons, and colors into one reusable definition list.
20. Replaced Website-tab category-chip alerts with a functional exact-category website view.
21. Styled the Browse by Category `See all →` action as an accent pill with hover/focus feedback.
22. Replaced its alert with a complete category-discovery dialog.
23. The complete view displays all fourteen category chips and icons in a non-clipped responsive grid.
24. Selecting a category shows only websites whose visible category label exactly matches the selected category.
25. Category website cards include image, category, rating, and addition-date information.
26. Category Back first returns from a selected category to all categories, then closes to the Website tab.
27. Search-overlay Browse by Category remains an exact category scope and displays only matching search results.
28. Extended detail context state with selected category and category-overlay scroll position.
29. A detail opened from a category list now returns to the same category and position.

#### Regression protection

30. Extended `tests/search-navigation.test.js` with chronology, Recent preview/full rail, all-category view, exact Creative-category results, and Recent/category Back restoration.
31. Updated SOP decisions and CTA to record Monday–Sunday and both global/personalized ranking modes as confirmed rather than pending.

### Files changed

- `index.html`
- `style.css`
- `app.js`
- `data/sites.js`
- `tests/search-navigation.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` `node --check data/sites.js` passed.
- `[x]` `node --check data/metrics.js` passed.
- `[x]` `node --check app.js` passed.
- `[x]` Both regression test files passed.
- `[x]` Chronological fixture confirmed Paragon Contrast first and inherited Paragon Notes last under current metadata.
- `[x]` Recently Added preview rendered seven chronological cards.
- `[x]` Full Recently Added rail rendered every catalogued addition in newest-to-oldest order.
- `[x]` Recent Detail Back restored 640px horizontal rail position, 90px overlay position, and 1580px underlying page position.
- `[x]` Full category view rendered all fourteen category chips.
- `[x]` Creative category rendered exactly its three matching websites.
- `[x]` Category Detail Back restored the Creative view, 310px overlay position, and 1710px underlying page position.
- `[x]` Public HTML contains no All Websites A–Z heading or `all-grid`.
- `[x]` Search source no longer prints the archive total in headings or summary text.
- `[x]` Category and Recently Added `See all →` actions contain no alert handlers.
- `[x]` HTML audit confirmed unique IDs for Recent and category dialogs.
- `[x]` CSS audit confirmed lively See all styling, horizontal Recent rail, full category grid, category site grid, and responsive overlay styles.
- `[x]` `/`, `/style.css`, `/data/sites.js`, `/data/metrics.js`, `/app.js`, and the expanded regression test returned HTTP `200`.
- `[!]` Final horizontal-scroll feel, category card balance, and addition-date presentation still require SPCK/physical-browser confirmation because no graphical browser engine is installed in the workspace.

### Result

Recently Added is now a lively newest-to-oldest experience with a functional horizontal full list. The public All Websites inventory is gone, and discovery now flows through exact categories whose complete icon list and website lists are functional. Ranking policy is confirmed as Monday–Sunday with both global and personalized production modes.

### Remaining content dependency

The twelve inherited addition dates are provisional. Authoritative historical dates/times from the owner will replace them when available.

---

## v0.8.0 — 2026-08-04 — Comprehensive front-end audit and final UI polish

**Request reference:** SOP §11, Prompt P-008  
**Status:** `[x]` completed; final owner device/visual confirmation pending

### Audit scope

Reviewed the complete HTML, CSS, application logic, data modules, local state, generated detail markup, navigation, overlays, Website/Updates/Account tabs, accessibility state, placeholder behavior, and existing regression fixtures.

### Verified bugs repaired

1. Removed duplicate bottom-tab execution caused by simultaneous inline handlers and `bindNav()` listeners.
2. Removed the duplicate bottom-navigation `aria-label` and replaced navigation with one `switchToTab()` implementation.
3. Added coherent `aria-selected`, `aria-current`, tab focus, section `aria-hidden`, URL hash, keyboard-arrow, and Home-logo behavior.
4. Added the missing `.account-hero` class expected by CSS.
5. Added logged-in styling override so the profile card is not double-wrapped by the welcome treatment.
6. Wrapped private Account content in `#account-private`; it is hidden and cleared while logged out.
7. Fixed logout stale-state leakage and rerendered Account data when returning from details.
8. Replaced permanent `.toggle.checked` styling with real `:checked` state.
9. Added persisted dark/light and notification preferences.
10. Replaced hard-coded stale Updates data with events generated from catalogue addition/version metadata.
11. Implemented functional Updates type chips and website selector, grouped chronological dates, dynamic select options, and honest empty states.
12. Removed all JavaScript/HTML alert calls.
13. Removed the unused no-op detail-routing binder.
14. Removed fake Open success behavior and random view feedback; Open now uses a supplied URL or honestly reports that the destination is pending.
15. Converted Read more into a real collapsed/expanded control.
16. Removed unauthorized Edit/Delete controls from built-in reviews.
17. Added HTML escaping for device-local review text.

### Front-end functionality added

18. Added a persisted local bookmark system and synchronized Account Saved content/count.
19. Added Web Share API support with clipboard fallback.
20. Added a local review composer with accessible stars, text validation, edit, delete, persistence, ownership labels, accurate detail review counts, and Account review display.
21. Added device-local visit history and dynamic Account statistics/achievements.
22. Added local demo login/session labeling and honest Google/Email/Guest preview messaging.
23. Replaced notification alerts with an accessible notification panel, mark-read behavior, preference synchronization, site-opening items, click-outside closing, and Escape handling.
24. Replaced nonfunctional legal/settings/backend links with non-jumping explanatory toast feedback.
25. Added generated collection cards with honest backend dependency feedback.
26. Added local history clearing.

### Modern layout and styling improvements

27. Replaced the top Search emoji with a consistent SVG icon.
28. Replaced bottom-nav emoji with stroke SVG icons.
29. Capped and centered desktop bottom navigation at 520px while preserving the mobile floating layout.
30. Added selected-nav background, accent indicator, glow, and light-mode treatment.
31. Added ambient background color fields, global focus-visible treatment, and a keyboard skip link.
32. Added a toast notification system and Back-to-top control.
33. Added reduced-motion-safe section reveal behavior.
34. Added graceful failed-image placeholders for unavailable remote imagery.
35. Added modern Updates header, preview status badge, filters, select, and empty state styling.
36. Added modern Account section headers, empty states, visit rows, collection cards, settings controls, and responsive logout placement.
37. Added a responsive local review dialog with focus containment and local-data disclosure.
38. Standardized Trending and Staff `See all` actions with the existing accent-pill treatment.
39. Added responsive notification-panel styling.
40. Added global reduced-motion fallbacks.

### Regression protection

41. Created `tests/ui-regression.test.js`.
42. The new fixture verifies single-path navigation, one-scroll tab transitions, Account private-state cleanup, theme persistence, Updates filtering, bookmarks, built-in review ownership, local review merging, and HTML escaping.
43. Existing metrics/carousel and search/navigation suites remained passing.

### Files created

- `tests/ui-regression.test.js`

### Files changed

- `index.html`
- `style.css`
- `app.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` `node --check data/sites.js` passed.
- `[x]` `node --check data/metrics.js` passed.
- `[x]` `node --check app.js` passed.
- `[x]` `node --check tests/ui-regression.test.js` passed.
- `[x]` All three dependency-free regression test suites passed.
- `[x]` UI fixture confirmed one tab transition produces one scroll call.
- `[x]` Account private content hides and clears on logout.
- `[x]` Theme class and persisted preference remain synchronized.
- `[x]` Bookmarks update local storage and Account Saved content.
- `[x]` Updates generated events render and Maintenance produces an honest empty state.
- `[x]` Built-in reviews contain no ownership actions; local reviews receive exactly one Edit/Delete control set.
- `[x]` Local review script markup is escaped.
- `[x]` HTML audit confirmed unique IDs, tablist semantics, Account hooks, notification/review dialog hooks, and initial ARIA states.
- `[x]` Source audit found no `alert(`, legacy `switchTab`, duplicate inline tab handler, dead placeholder `href="#"`, or no-op binding comment.
- `[x]` CSS audit confirmed notification, Updates, review, toast, compact-nav, reveal, account, and image-fallback systems.
- `[x]` `/`, all application assets, and all three test files returned HTTP `200`.
- `[!]` Final typography, animation feel, notification placement, bottom-nav proportions, and physical-device behavior still require SPCK/physical-browser confirmation because no graphical browser engine is installed in the workspace.

### Result

The remaining verified front-end bugs and misleading alert-only interactions have been removed. Navigation is single-path and accessible, Updates filtering works, Account state is coherent, detail actions work locally, backend-dependent actions are honest, and the visual system is more modern without changing Paragon Archive’s established identity.

### Remaining production dependencies

- Real authentication and cloud synchronization
- Global + personalized analytics backend
- Real website destination URLs
- Final legal/help/about/request content
- Final hosted image/font assets
- Authoritative inherited addition dates

---

## v0.9.0 — 2026-08-04 — Robust Updates filters, mirrored timeline, and expanded entry types

**Request reference:** SOP §11, Prompt P-009  
**Status:** `[x]` completed; owner SPCK confirmation pending

### Reported problems and requirements

- Update type chips could visually appear pressed after another filter was selected.
- Type and website filters needed to remain reliable as update/site data grows.
- Timeline cards needed a matching right rail and right dot.
- Announcement and Featured/Promoted were missing as real entry types.
- Blue/other badges lacked the shared pill foundation used by New.
- Logged-in bookmarked websites needed a personalized star on matching update cards.

### Executed actions

#### Update data architecture

1. Created `data/updates.js` for curated non-generated update events.
2. Added real curated entries for:
   - 🔧 Maintenance — Paragon Notes;
   - 🎉 Announcement — archive-wide catalogue expansion;
   - ✨ Featured/Promoted — Paragon Contrast.
3. Loaded `data/updates.js` after catalogue data and before metrics/application logic.
4. Updated `buildUpdateEvents()` to merge generated New/Updated records with curated events on every render.
5. Added validation/fallback handling for invalid dates, unknown types, missing websites, optional thumbnails, and archive-wide events.

#### Filter state repair

6. Added Announcement and Featured/Promoted filter buttons.
7. Centralized all type labels, badge text, and badge classes in `updateTypeDefinitions`.
8. Added `setUpdateTypeFilter()` as the single type-state entry point.
9. Added `syncUpdateFilterChips()` so exactly one button receives `.active` and `aria-pressed="true"`.
10. Limited hover styling to actual hover-capable devices, preventing sticky touch-hover from looking selected.
11. Added `syncUpdateSiteOptions()` to rebuild options from current events while preserving a valid selection.
12. Kept type and website filters as a true intersection.
13. Kept delegated type-chip handling so future buttons added to the filter group work without separate listeners.
14. Updated filter summaries to use centralized type labels.

#### Entry types and badges

15. Standardized every badge with the shared `.update-badge` pill foundation.
16. Added distinct modifiers:
   - New — green;
   - Updated — blue;
   - Maintenance — orange;
   - Announcement — purple;
   - Featured/Promoted — gold/pink gradient;
   - neutral fallback for future unknown types.
17. Added archive-wide event icons and labels when no website detail target exists.

#### Mirrored timeline

18. Added a right timeline rail matching the existing left rail.
19. Added a right pulsing dot to every entry with an offset pulse and complementary pink color.
20. Centered timeline cards between configurable left/right gutters.
21. Added mobile-specific gutter/card/thumb sizing while keeping both rails aligned.
22. Updated hover motion from sideways displacement to a centered upward lift.

#### Saved-site personalization

23. Added a small gold saved-site star when `loggedIn && bookmarkedSites.has(siteName)`.
24. Rerendered Updates after login, logout, and bookmark changes so stars appear/disappear immediately.
25. Kept archive-wide announcements and unsaved/logged-out cards unstarred.

#### Regression protection

26. Expanded `tests/ui-regression.test.js` to load curated update data.
27. Added assertions for all five concrete event types plus All.
28. Added single-active-chip and `aria-pressed` assertions for every filter transition.
29. Added type-leak prevention checks.
30. Added combined Maintenance + Paragon Notes filtering.
31. Added mirrored right-dot assertions.
32. Added logged-in bookmarked star and logged-out star-removal assertions.

### Files created

- `data/updates.js`

### Files changed

- `index.html`
- `style.css`
- `app.js`
- `tests/ui-regression.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` `node --check data/updates.js` passed.
- `[x]` `node --check data/sites.js`, `data/metrics.js`, `app.js`, and all tests passed.
- `[x]` All three regression suites passed.
- `[x]` All six type controls (`All` plus five concrete types) were present.
- `[x]` New, Updated, Maintenance, Announcement, and Featured/Promoted each rendered only matching entries when selected.
- `[x]` Exactly one chip retained `.active` and `aria-pressed="true"` after every transition.
- `[x]` All restored the complete mixed timeline.
- `[x]` Maintenance + Paragon Notes intersection returned the curated maintenance card.
- `[x]` Every timeline entry rendered a right dot in addition to the left dot.
- `[x]` Logged-in bookmarked Paragon Notes maintenance rendered a saved star.
- `[x]` Logging out removed the saved star.
- `[x]` HTML audit confirmed unique IDs, all filter types, and `sites → updates → metrics → app` script order.
- `[x]` CSS audit confirmed all pill modifiers, mirrored rails, touch-safe hover behavior, saved-star styling, and responsive timeline gutters.
- `[x]` `/`, `/data/updates.js`, all application assets, and the expanded UI regression test returned HTTP `200`.
- `[!]` Final mirrored-rail spacing, pill density, and touch behavior still require owner confirmation in SPCK because no graphical browser engine is installed in the workspace.

### Result

Updates filters are now single-select, touch-safe, composable with the website selector, and data-driven. Maintenance, Announcement, and Featured/Promoted are real rendered types with consistent pills. Timeline cards sit between mirrored rails/dots, and logged-in saved-site updates show a personalized gold star.

### Future production dependency

Curated events currently live in `data/updates.js`. A production content/update service should eventually supply these records while preserving the same event schema and filter behavior.

---

## v0.10.0 — 2026-08-04 — Real Supabase authentication and shared cross-product progress

**Request reference:** SOP §11, Prompt P-010  
**Status:** `[x]` front-end/schema completed; Supabase project activation pending

### Confirmed owner choices

- Authentication provider: Supabase
- Google authentication: Supabase Google OAuth
- Email authentication: email + password
- Product hosting: one origin with path-based products
- Guest persistence: session-only through `sessionStorage`
- Public demo accounts: removed; separate owner-only demo purpose deferred

### Authentication architecture

1. Created `config/supabase.js` for public project URL, anon key, redirect URL, base path, and state-table configuration.
2. Created dependency-free `auth/supabase-auth.js` using Supabase Auth REST endpoints.
3. Implemented:
   - Google OAuth authorize redirect;
   - OAuth fragment callback parsing and cleanup;
   - email/password sign-in;
   - email/password account creation;
   - email confirmation result handling;
   - persisted access/refresh session;
   - automatic near-expiry token refresh;
   - current-user retrieval;
   - password reset email;
   - recovery callback handling;
   - authenticated password update;
   - remote logout and local session cleanup;
   - auth-state subscriptions;
   - authenticated REST fetch helper.
4. Persisted authenticated Supabase sessions in same-origin `localStorage`, allowing the same login to follow all path-based Paragon products.
5. Removed public `PARAGON_USER`, demo-session keys, fake Google/Email login, and public demo-account wording.

### Shared account state and progress

6. Created `auth/paragon-sync.js`.
7. Created `supabase/schema.sql` with:
   - one `paragon_user_state` row per `auth.users` user;
   - JSONB state for bookmarks, reviews, visits, progress, and preferences;
   - foreign-key cascade;
   - authenticated grants;
   - Row Level Security;
   - own-row SELECT/INSERT/UPDATE/DELETE policies;
   - updated-at index;
   - rerunnable policy drops.
8. Added authenticated state load and upsert through Supabase PostgREST.
9. Added shared `ParagonProgress.load/save/remove(productId)` for every path-based product.
10. Added generic product/course progress values with timestamps.
11. Added progress-change events so the Account view refreshes when a product saves progress in the same page session.
12. Created `auth/INTEGRATION.md` with same-origin setup, script order, Supabase console steps, and product integration examples.

### Guest isolation

13. Replaced the old local preview login boolean with explicit signed-out, authenticated, Guest, and loading states.
14. Guest session flag and personal state now live only in `sessionStorage`.
15. Guest bookmarks, reviews, visits, preferences, and product progress may survive refreshes in the same browser session but are never written to Supabase or persistent personal-state `localStorage`.
16. Ending Guest removes the Guest session flag, Guest state, temporary theme, temporary notification preference, and temporary progress.
17. Signed-out personal actions redirect users to Account and request sign-in or Guest instead of silently saving.
18. Guest accounts never receive authenticated saved-site stars in Updates.

### Account UI

19. Replaced demo Account copy with “One account for every Paragon experience.”
20. Connected Continue with Google to the real OAuth client.
21. Added a real email authentication dialog with Sign in and Create account modes.
22. Added email validation, minimum password length, provider errors, loading states, and email verification messaging.
23. Added Forgot password and Set new password flows.
24. Added configuration warnings when Supabase credentials are absent instead of fake authentication.
25. Authenticated profile now displays actual Supabase email, display/full name, avatar, and provider.
26. Guest profile is explicitly labeled session-only and unsynced.
27. Added a fourth Account statistic for products in progress.
28. Added Progress Across Paragon cards showing synced versus temporary product state.
29. Authenticated bookmarks, reviews, visits, theme, and notification preferences now queue Supabase state synchronization.
30. Account logout flushes pending authenticated state before remote sign-out.

### Regression protection

31. Created `tests/auth.test.js`.
32. The auth fixture verifies Google OAuth URL creation, email/password login, persisted session restoration, RLS state loading, authenticated progress save/load, logout cleanup, Guest session-only progress, signed-out progress rejection, OAuth callback user retrieval, and callback URL cleanup.
33. Expanded UI regression checks for Guest labeling, Guest state cleanup, Guest `sessionStorage` bookmarks, no persistent bookmark leakage, Guest saved-star exclusion, and authenticated saved-star inclusion.
34. Existing metrics, carousel, Search, Recent, category, navigation, Updates, review, and Back-context suites remained passing.

### Files created

- `config/supabase.js`
- `auth/supabase-auth.js`
- `auth/paragon-sync.js`
- `auth/INTEGRATION.md`
- `supabase/schema.sql`
- `tests/auth.test.js`

### Files changed

- `index.html`
- `style.css`
- `app.js`
- `tests/ui-regression.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` Syntax checks passed for configuration, auth, sync, data, application, and all tests.
- `[x]` All four dependency-free regression suites passed.
- `[x]` Google OAuth URL contains provider and configured redirect URL.
- `[x]` Email/password sign-in returns the real mocked Supabase user and persists a restorable session.
- `[x]` RLS state client loads the authenticated user’s row.
- `[x]` Shared product progress saves under the authenticated user ID and loads correctly.
- `[x]` Sign-out clears the persistent Supabase session.
- `[x]` Guest progress writes to `sessionStorage` and creates no authenticated/local persistent session.
- `[x]` Signed-out progress save is rejected.
- `[x]` OAuth callback retrieves the user and removes token parameters from the URL.
- `[x]` Guest bookmarks use session state and do not write the legacy persistent bookmark key.
- `[x]` Guest identity is labeled clearly and Guest end clears temporary state.
- `[x]` Authenticated saved-site update stars appear; Guest stars do not.
- `[x]` Source audit found no public demo identity, demo session key, or fake `window.login` path.
- `[x]` SQL audit confirmed RLS, `auth.uid()`, authenticated grants, and user primary key.
- `[x]` HTML audit confirmed unique IDs and `config → auth → sync → sites → updates → metrics → app` script order.
- `[x]` `/`, all auth/config/schema/integration files, application assets, and `tests/auth.test.js` returned HTTP `200`.
- `[!]` Live Google OAuth and email delivery cannot complete until Supabase credentials/provider configuration are supplied.

### Result

The Account tab no longer signs anyone into a public demo account. Google and Email are wired to real Supabase authentication, authenticated personal state is RLS-protected and shared across path-based Paragon products, and generic course/product progress has a common API. Guest remains available but is strictly session-only and unsynced.

### Activation still required from the owner

1. Add Supabase project URL and public anon key to `config/supabase.js`.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable Email and Google providers.
4. Configure Google OAuth credentials and the Supabase callback URL.
5. Add the final production origin and product paths to the Supabase redirect allowlist.

---

## v0.11.0 — 2026-08-04 — Creator demo identity, collections, footer-aware navigation, and animated detail launch/stats

**Request reference:** SOP §11, Prompt P-011  
**Status:** `[x]` front-end/state completed; owner activation and SPCK confirmation pending

### Creator demo identity and registration date

1. Added `creatorDemoEmail` to public Supabase configuration.
2. Did **not** store the supplied password anywhere in the workspace.
3. Kept creator sign-in on the same real Supabase Email/password path—no bypass or fake credential check was introduced.
4. Added authenticated email matching for the `Creator Demo · Real Email Auth` presentation badge.
5. Added a separate `Member since` badge.
6. Registration date uses Supabase `user.created_at`; if absent, it stores the first authenticated activation timestamp in synced profile state.
7. Added synced profile metadata with `registeredAt`, `accountType`, and collection-initialization state.
8. Documented that Creator Demo labeling is not authorization; future privileges require protected claims/server checks.

### Persistent collections

9. Extended shared state normalization and SQL defaults with `collections` and `profile`.
10. Preserved the two existing collection concepts as first-session starter collections.
11. Created a collection composer dialog with name, description, icon, validation, duplicate-name prevention, Cancel/Close, and responsive styling.
12. Replaced the nonfunctional Create Collection placeholder with `+ Create New Collection`.
13. Added dynamic collection rendering with icon, description, item count, creation date, and delete action.
14. Authenticated collections queue Supabase synchronization.
15. Guest collections write only to session state and are removed when Guest ends.
16. Updated the integration guide and shared state schema documentation.

### Footer-aware bottom navigation

17. Added footer intersection tracking in `bindGlobalUI()`.
18. Added a scroll-position fallback for browsers without `IntersectionObserver`.
19. Added a `footer-visible` bottom-nav state that fades, lowers, hides, and disables pointer interaction while the footer is visible.
20. Navigation reappears when the footer leaves the viewport.

### Detail Open launch experience

21. Replaced direct Open handling with reusable `launchSite()` for every dynamic detail.
22. Added an SVG circular progress track/value ring around the website icon.
23. Added percentage text in the icon center and synchronized `aria-valuenow` from 0 to 100.
24. Added opening-button percentage updates, disabled state, Ready state, and reset.
25. Added icon pop animation and complete-detail zoom pulse at 100%.
26. Added reduced-motion timing.
27. For real URLs, opens a user-initiated blank tab immediately and navigates it at completion to avoid popup blocking.
28. Added separate feedback for missing URLs versus blocked popups.
29. Documented that remote cross-origin load percentage is unavailable; the current ring represents launch preparation.

### Detail statistics

30. Rebuilt statistics as three equal grid columns with thin vertical dividers.
31. Added reusable count-up animation for rating, stable raw Views, and Reviews.
32. Views animate from zero to the full localized numeric value rather than a static compact label.
33. Added reusable decimal partial-star markup with per-star fill percentages.
34. Whole-number ratings render fully filled stars; decimal ratings render the final star partially filled.
35. Converted Reviews into a keyboard-accessible button.
36. Added stable `reviews-section` anchor, smooth scrolling, and post-scroll focus.
37. Added responsive stat sizing/dividers for phones.

### Shared progress/state improvements

38. Extended `ParagonSync.normalizeState()` and SQL JSON defaults for collections/profile without breaking existing rows.
39. Added cross-product progress change events so Account progress cards update in the same page session.
40. Updated Guest `ParagonProgress` support to use the same session-only Guest state.

### Regression protection

41. Extended UI regression tests for:
   - configured Creator Demo labeling;
   - Supabase creation-date badge;
   - starter collections;
   - functional collection creation;
   - Guest session collection persistence and cleanup;
   - launch progress markup;
   - exactly three stat items;
   - decimal-star markup;
   - count-up targets;
   - Reviews jump and anchor.
42. Added exact workspace scan confirming the supplied password is absent.
43. Existing auth, Updates, ranking, Search, Recent, category, navigation, and Back-context suites remained passing.

### Files changed

- `config/supabase.js`
- `auth/paragon-sync.js`
- `auth/INTEGRATION.md`
- `supabase/schema.sql`
- `index.html`
- `style.css`
- `app.js`
- `tests/ui-regression.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` Exact credential scan confirmed the supplied password is absent from all workspace files.
- `[x]` All JavaScript syntax checks passed.
- `[x]` All four regression suites passed.
- `[x]` Configured creator email renders Creator Demo only after authenticated-state simulation.
- `[x]` Member-since badge rendered August 4, 2026 from the test user’s `created_at`.
- `[x]` Collection composer created and rendered a new collection.
- `[x]` Guest collection was stored in session state and removed when Guest ended.
- `[x]` Shared state and SQL include `collections` and `profile` defaults.
- `[x]` Detail fixture contains launch progress ring, percentage hooks, three stat items, decimal-star markup, count-up targets, Reviews action, and reviews anchor.
- `[x]` Static CSS audit confirmed footer hiding, collection controls, launch rings, partial stars, equal stats, and completion zoom.
- `[x]` `/`, all application/auth/schema files, and all tests returned HTTP `200`.
- `[!]` Live creator login requires the user to be created in Supabase Auth and project credentials to be configured.
- `[!]` Final visual timing/spacing and footer intersection behavior require SPCK/physical-browser confirmation.

### Result

The supplied creator email is now the only configured Creator Demo identity, while still requiring real Supabase Email authentication; the password is not exposed. Registration dates come from the real account. Collections can be created and persisted. The bottom nav clears the footer automatically. Every website detail now includes launch-ring progress, percentage, completion zoom, equal animated stats, decimal stars, and a working Reviews jump.

### Owner activation still required

- Create the configured creator email user in Supabase Auth using the privately supplied password.
- Configure Supabase URL/anon key and providers.
- Run the updated schema SQL.
- Supply real website URLs for actual post-animation launches.

---

## v0.12.0 — 2026-08-04 — Export-safe file reconstruction, screenshot lightbox, and tagged About sections

**Request reference:** SOP §11, Prompt P-012  
**Status:** `[x]` completed; owner export/re-import and SPCK confirmation pending

### Export-safe filename and reconstruction

1. Renamed the canonical application shell from `index.html` to `paragon-archive.html`.
2. Removed the generic workspace `index.html` rather than keeping a conflicting duplicate.
3. Added an HTML export identity comment before the doctype containing real filename, expected path, role, and restore/load note.
4. Added matching block-comment headers to every CSS and JavaScript source/test file.
5. Added matching SQL comment header to `supabase/schema.sql`.
6. Each code header now states the exact folder path to restore if uploads arrive flattened or renamed.
7. Added standing SOP rule P-014 requiring export identity headers on all future code files.
8. Added SOP §3A with a complete project tree, browser load order, reconstruction instructions, security rules, and canonical entry guidance.
9. Updated the integration guide to reference `paragon-archive.html` and SOP §3A.
10. Updated current SOP inventory/architecture and superseded the old `index.html` working-name decision with D-040.
11. Updated UI regression tests to read the renamed shell and validate every export header/path.

### Screenshot experience

12. Added a reusable five-state screenshot generator for every website:
    - Home;
    - Dashboard;
    - Primary feature;
    - Mobile state;
    - Settings.
13. Rebuilt the detail screenshot area as a horizontally scrollable row with rounded button-based screenshots, labels, scroll snapping, and a styled scrollbar.
14. Added `screenshot-lightbox`, a fullscreen dialog with:
    - large contained image;
    - X close button;
    - previous/next controls;
    - caption and current position;
    - synchronized dot indicators;
    - dot selection;
    - pointer/touch swipe threshold;
    - ArrowLeft/ArrowRight keyboard navigation;
    - Escape close;
    - Tab focus containment;
    - backdrop close;
    - focus restoration;
    - responsive phone layout.
15. Added body scroll locking while the lightbox is open.
16. Applied the screenshot/lightbox system automatically from catalogue data to every existing and future detail.

### About sections and tags

17. Added a subtle accent top divider and short gradient accent segment to the About section.
18. Changed About collapse from three-line clamp to an animated four-line max-height state.
19. Added post-render overflow detection so Read more is hidden when the description does not need expansion.
20. Kept accessible `aria-expanded` state and added Show less behavior.
21. Added generated keyword tags for every website using:
    - product name;
    - exact category;
    - existing product tag;
    - description/About/update keyword rules;
    - category/feature mappings.
22. Added deduplication and a seven-tag cap.
23. Added a labeled `🏷️ Tags:` area with responsive rounded keyword pills.
24. Verified Paragon Notes naturally produces tags including Notes, Tools, Productivity, Writing, and Dark Mode from its data.

### Regression protection

25. Extended UI regression checks for:
    - absence of `index.html`;
    - export headers and exact paths on every code file;
    - screenshot lightbox presence;
    - five screenshot buttons per detail;
    - lightbox open/close;
    - position captions;
    - five synchronized dots;
    - index navigation;
    - About/tag markup.
26. Added static audits for lightbox gestures/keyboard functions, four-line About styling, export manifest, and canonical filename.
27. Existing auth, Updates, ranking, Search, Recent, category, Account, collection, and Back-context suites remained passing.

### Files renamed

- `index.html` → `paragon-archive.html`

### Files changed

- `paragon-archive.html`
- `style.css`
- `app.js`
- `config/supabase.js`
- `auth/supabase-auth.js`
- `auth/paragon-sync.js`
- `auth/INTEGRATION.md`
- `data/sites.js`
- `data/updates.js`
- `data/metrics.js`
- `supabase/schema.sql`
- `tests/auth.test.js`
- `tests/ui-regression.test.js`
- `tests/metrics-carousel.test.js`
- `tests/search-navigation.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` Workspace contains `paragon-archive.html` and no `index.html`.
- `[x]` Every HTML/CSS/JS/SQL code file contains `PARAGON ARCHIVE — EXPORT IDENTITY` near the top.
- `[x]` Every code header’s `EXPECTED PROJECT PATH` matches the actual project-relative path.
- `[x]` SOP §3A contains the complete tree and exact script order.
- `[x]` All JavaScript syntax checks passed after header insertion.
- `[x]` All four regression suites passed.
- `[x]` Detail fixture rendered five screenshots and tagged About markup.
- `[x]` Lightbox fixture opened selected screenshot 2 of 5, rendered five dots, moved to 3 of 5, and closed.
- `[x]` HTML audit confirmed unique IDs and full lightbox controls.
- `[x]` CSS audit confirmed rounded horizontal screenshots, fullscreen layout, dots, responsive controls, top divider, four-line collapse, smooth max-height, and tag pills.
- `[x]` `/paragon-archive.html` and every application/auth/data/schema/test asset returned HTTP `200`.
- `[!]` Final swipe feel, real screenshot content, and About overflow behavior require SPCK/physical-browser confirmation.

### Result

The project can now be exported and later reconstructed even if uploads lose their folders or filenames. `paragon-archive.html` is the distinctive canonical shell. Every website detail now includes a five-state horizontal screenshot gallery with a fullscreen swipeable lightbox and position dots, plus a four-line expandable About section with generated keyword tags.

### Owner reminders for export

- Keep `paragon-archive.html` as the entry filename.
- Restore files using their internal `EXPECTED PROJECT PATH` comments.
- Follow SOP §3A script order.
- Replace generated screenshot placeholders with real product screenshots when available.

---

## v0.13.0 — 2026-08-04 — Feature-completeness checklist pass

**Request reference:** SOP §11, Prompt P-013  
**Status:** `[x]` completed; deployment/backend activation and SPCK confirmation pending

### Checklist audit — already implemented and preserved

- Website of the Day — seven-site daily ranking, autoplay, arrows, dots, swipe, keyboard
- Trending Section — Monday–Sunday ranking, full list, ratings/reviews/views
- Staff Picks — daily underexposure ranking, ribbon, three-card preview, full list
- Achievements & Badges — dynamic local/account achievement state
- Search with Filters — All/exact-category scope, descriptive matching, autocomplete
- Similar Websites — Related Websites category-family section
- Share Feature — Web Share API with clipboard fallback
- Notification System — unread indicator, panel, mark read, preferences
- Guest Browsing/Guest Mode — session-only state, no persistent demo-user bypass
- Full Update Timeline — filters, mirrored rails/dots, five concrete types, saved stars
- User Stats Dashboard — visits/reviews/saves/progress
- Recently Visited Timeline — account visit history
- Email + Password, Google Sign-in, Password reset — Supabase front-end flows

### Collections / Playlists completion

1. Extended shared state collection support with actual item membership.
2. Added Add to Collection action to every website detail.
3. Added collection picker showing existing collections and included state.
4. Added collection view with website cards and item count.
5. Added remove-from-collection controls.
6. Kept collection creation/deletion from P-011.
7. Authenticated collection items sync through Supabase state; Guest items remain session-only.
8. Renamed Account heading to Collections / Playlists.

### Request a Website

9. Added a full Request a Website dialog with name, optional URL, category, reason, validation, status, close/cancel, and responsive styling.
10. Added `paragon_website_requests` SQL table, checks, index, authenticated grants, and own-row RLS policies.
11. Added `ParagonSync.submitWebsiteRequest()` for authenticated submissions.
12. Connected footer and Account Settings actions to the form.
13. Guest requests save as session-only drafts and require sign-in for real submission.
14. Guest end clears request drafts.

### Review upvote/downvote

15. Extended personal state with `reviewVotes`.
16. Added Upvote and Downvote buttons/counts to every built-in and user review.
17. Added one-vote toggle behavior with active/pressed state.
18. Authenticated votes sync with user state; Guest votes remain session-only.
19. Used deterministic seeded display counts until global vote aggregation is built.

### QR code per website

20. Added QR action to every website detail.
21. Added fullscreen QR dialog with real scannable image, title, share URL, Copy Link, Share, and close/backdrop/Escape behavior.
22. QR encodes the real site URL when supplied or a deep link to `paragon-archive.html?site=...`.
23. Added initial deep-link detail routing.
24. Added configurable public QR service URL to configuration.

### PWA installability

25. Created `manifest.webmanifest` with name, ID, start URL, scope, standalone display, colors, and icon identity metadata.
26. Generated bundled 192px and 512px PNG icons.
27. Created root `service-worker.js` with application-shell precache, old-cache cleanup, same-origin runtime caching, network-first navigation, and offline shell fallback.
28. Created `pwa.js` for service-worker registration, install-prompt capture, installed state, and install API.
29. Added manifest/theme/apple-touch links and Account Install App action.
30. Added PWA files/icons to SOP export manifest and load order.

### Rating breakdown and version history

31. Added five-to-one-star rating breakdown bars and counts to every review section.
32. Added data-backed version history for every website using current release data plus archive-entry history.
33. Added visual version timeline, current marker, dates, and change lists.
34. Removed the former incomplete full-history placeholder behavior.

### Username system

35. Added Username field to Email account creation with pattern/length validation and live availability feedback.
36. Added Supabase availability RPC call and signup metadata.
37. Added `paragon_profiles` table with unique `citext` username, RLS, grants, timestamps, and display name.
38. Added auth-user trigger to create profiles for Email and Google users.
39. Added sanitized collision-resistant Google/email fallback usernames.
40. Added account profile retrieval and `@username` display.

### Iframe preview with loading percentage

41. Added fullscreen sandboxed iframe preview dialog with title, close, Open in New Tab, message fallback, and responsive shell.
42. Refactored Open progress to load real site URLs in the iframe.
43. Progress advances while the frame loads, waits at 94%, completes at iframe `load` or timeout, then shows 100%, completion zoom, and preview.
44. Missing URLs show an in-preview configuration message.
45. Frame-blocked websites retain Open in New Tab fallback.

### Export identity additions

46. Added export headers to `pwa.js` and `service-worker.js`.
47. Added `_fileIdentity` to the commentless JSON manifest.
48. Added PWA icons and files to SOP §3A.

### Schema and integration updates

49. Extended shared JSON defaults with `reviewVotes`.
50. Extended integration documentation for usernames, requests, PWA scope, collections, and shared state.
51. Updated username trigger to sanitize Google/email fallback names and avoid collisions.

### Validation

- `[x]` Supplied creator password remains absent from all workspace files.
- `[x]` All JavaScript syntax checks passed.
- `[x]` All four regression suites passed.
- `[x]` Auth tests confirmed username availability/signup metadata, authenticated requests, shared progress, password recovery, OAuth, and Guest isolation.
- `[x]` UI tests confirmed Guest collection items, request drafts, QR deep links, review votes, rating breakdown, version history, and existing functionality.
- `[x]` PWA manifest parses, standalone/start URL are correct, icons are valid 192×192 and 512×512 PNGs, and service-worker assets return HTTP 200.
- `[x]` Static audits confirmed request/QR/preview dialogs, username system, collection item APIs, rating/version helpers, install API, and SQL tables/functions/policies.
- `[x]` `paragon-archive.html`, manifest, PWA scripts/icons, application assets, schema, and tests returned HTTP `200`.
- `[!]` Live Supabase username/request behavior requires the updated schema and credentials.
- `[!]` PWA install/offline behavior requires HTTPS or localhost and final deployment testing.
- `[!]` Iframe display depends on destination frame policies and real URLs.

### Result

Every requested checklist item is now either confirmed as already working or implemented with a real front-end/data/schema path. Collections can contain websites, requests can submit through Supabase, reviews can be voted, details have QR codes, the archive is PWA-installable, rating/version details are complete, usernames are unique Supabase profiles, and Open can load real products in an iframe with icon progress.

### Remaining production activation

- Run the updated `supabase/schema.sql`.
- Configure Supabase and Google credentials/redirects.
- Supply real `siteUrl` values.
- Test PWA scope/offline installation on the final HTTPS origin.
- Decide whether to replace the public QR service with a self-hosted generator.
- Build global review-vote aggregation/admin moderation when required.

---

## v0.14.0 — 2026-08-04 — Forty-four-site catalogue merge and complete detail records

**Request reference:** SOP §11, Prompt P-014  
**Status:** `[x]` completed; owner content/asset review pending

### Catalogue verification

1. Compared all 44 supplied website names against the existing catalogue case-insensitively.
2. Found and updated nine existing matches without duplication:
   - Paragon Notes
   - Paragon Resume
   - Paragon Design
   - Paragon Whiteboard
   - Paragon Palette
   - Paragon Code
   - Paragon Exam
   - Paragon Confess
   - Paragon Events
3. Added the remaining 35 missing websites.
4. Preserved every unrelated previously catalogued website.
5. Expanded the internal catalogue from 28 to 63 unique records without exposing that total publicly.

### Data architecture

6. Created `data/catalogue-expansion.js` with an export identity header and expected path.
7. Loaded it directly after `data/sites.js` and before Updates/Metrics/App.
8. Added it to the service-worker application shell.
9. Added it to SOP §3A tree/load order and UI export-header validation.
10. Merged by exact lowercased name using a Map.
11. Added chronology sequence/date only to newly appended records.
12. Added `features` fallback to every catalogue record.

### Detail content

13. Added/updated each supplied record with:
    - group
    - category
    - What’s Inside description
    - exact supplied feature list
    - rich About text
    - icon
    - tag
    - color
    - current version/update list
    - reviews/new-state defaults
    - addition metadata
14. Added a Key Features section to every dynamic detail.
15. Key Features renders responsive numbered feature cards from supplied data.
16. Updated Paragon Code to the latest Education grouping from the supplied list.
17. All expanded records automatically inherit screenshots/lightbox, About/tags, version history, ratings, Related Websites, collections, QR, share, review voting, iframe preview, and launch progress.

### Tests and future-proofing

18. Replaced stale hard-coded 28-site test expectations with dynamic catalogue-size assertions.
19. Replaced hard-coded Creative count with dynamic exact-category count.
20. Replaced fixed chronology name assumptions with metadata-derived ordering comparison.
21. Added UI assertions that all 44 expansion names appear exactly once and have About/features/updates.
22. Added Paragon Notes Key Features rendering assertion.
23. Existing auth, PWA, Updates, ranking, Search, Recent, category, Account, and Back-context suites remained passing.

### Files created

- `data/catalogue-expansion.js`

### Files changed

- `paragon-archive.html`
- `app.js`
- `style.css`
- `service-worker.js`
- `tests/ui-regression.test.js`
- `tests/search-navigation.test.js`
- `tests/metrics-carousel.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` All 44 supplied names appear exactly once.
- `[x]` Nine existing matches were updated rather than duplicated.
- `[x]` Thirty-five missing sites were added.
- `[x]` Expanded catalogue contains 63 unique names internally.
- `[x]` Every supplied record has About, Features, Updates, category, icon, and standard detail fields.
- `[x]` `data/catalogue-expansion.js` syntax/header/path/load order passed.
- `[x]` Dynamic ranking, Search, autocomplete, Staff, Trending, Recent, and category counts passed with the expanded catalogue.
- `[x]` All four regression suites passed.
- `[x]` Service worker and HTTP asset checks include the expansion file.
- `[x]` No supplied creator password appears in workspace files.
- `[!]` Real product URLs, screenshots, logos, and owner content review remain pending.

### Result

The supplied 44-site catalogue is fully represented with no duplicates. Existing products were enriched with the latest feature definitions, missing products received complete dynamic detail records, and every product automatically inherits the full Paragon detail experience.

### Newly added groups

- Productivity & Tools additions such as Tasks, Calendar, Clock, Calc, Dictionary, Files, Paste, QR, Password, Bookmarks, and Contacts
- Creative additions such as Canvas, Color, Icons, Fonts, Photo, Meme, and Mood
- Education additions such as Learn, Quiz, Flash, Math, Type, Language, Kids, Debate, and Mind
- Social additions such as Chat, Forum, Poll, Meet, Wall, Connect, Feed, and Collab

---

## v0.15.0 — 2026-08-04 — Catalogue continuation 45–100 merge

**Request reference:** SOP §11, Prompt P-015  
**Status:** `[x]` completed; owner content/asset review pending

### Catalogue verification

1. Compared all 56 supplied names numbered 45–100 against the catalogue after the 1–44 expansion.
2. Updated 13 existing matches without duplication:
   - Paragon Music
   - Paragon Sounds
   - Paragon Theater
   - Paragon Chess
   - Paragon Bet
   - Paragon Survival
   - Paragon Invest
   - Paragon Wardrobe
   - Paragon Journal
   - Paragon Tutor
   - Paragon Deploy
   - Paragon Contrast
   - Paragon Vibe
3. Added the remaining 43 missing websites.
4. Preserved all previous unrelated entries.
5. Internal catalogue now contains 106 unique records; the public UI still does not advertise the total.

### Data and detail implementation

6. Created `data/catalogue-expansion-45-100.js` with export identity/path/load instructions.
7. Loaded it after `data/catalogue-expansion.js` and before Updates/Metrics/App.
8. Added it to service-worker offline cache, SOP tree/load order, and export-header tests.
9. Added complete group/category/inside/features/About/icon/tag/color/version/chronology fields.
10. Applied the latest group definitions, including Vibe under Originals and Tutor under Lifestyle.
11. Updated all matching products with the latest supplied features.
12. Every new/updated product automatically inherits Key Features, screenshots/lightbox, About/tags, ratings, versions, review votes, Related Websites, collections, QR, PWA deep links, and iframe preview.

### Groups merged

- Entertainment & Media — Music through Theater
- Games — Puzzle through Survival
- Finance & Business — Budget through Receipt
- Lifestyle & Health — Recipe through Countdown
- Web & Developer Tools — Dev Tools through Snippets
- Paragon Originals — Random through Archive Hub

### Regression updates

13. Loaded the second expansion in UI, metrics, and Search fixtures.
14. Added exact-once/completeness assertions for all 56 names.
15. Kept all catalogue-size, Creative-count, and chronology assertions dynamic.
16. All four regression suites remained passing.

### Files created

- `data/catalogue-expansion-45-100.js`

### Files changed

- `paragon-archive.html`
- `service-worker.js`
- `tests/ui-regression.test.js`
- `tests/search-navigation.test.js`
- `tests/metrics-carousel.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` All 56 supplied names appear exactly once.
- `[x]` Thirteen matches updated rather than duplicated.
- `[x]` Forty-three missing records added.
- `[x]` Final internal catalogue contains 106 unique records.
- `[x]` All 56 records include complete About/features/updates and standard detail fields.
- `[x]` Expansion file syntax/header/path/script order/PWA cache checks passed.
- `[x]` All four regression suites passed with dynamic catalogue sizing.
- `[x]` `/data/catalogue-expansion-45-100.js` returned HTTP 200.
- `[!]` Real product URLs, screenshots, logos, and owner category/content review remain pending.

### Result

Catalogue entries 45–100 are fully merged with no duplicates. Existing products were enriched, missing products received complete dynamic details, and every entry automatically uses the full Paragon detail and account ecosystem.

---

## v0.16.0 — 2026-08-04 — Advanced Ratings & Reviews experience

**Request reference:** SOP §11, Prompt P-016  
**Status:** `[x]` completed; owner SPCK confirmation pending

### Rating summary and breakdown

1. Rebuilt the rating summary as a two-column desktop layout and stacked mobile layout.
2. Added a large rating number on the left.
3. Added decimal-aware stars below the rating.
4. Added review count below the stars.
5. Added five-to-one-star percentage bars on the right.
6. Changed breakdown labels to percentages.
7. Added IntersectionObserver entry animation from zero width to target percentage.
8. Added reduced-motion fallback that reveals bars immediately.

### Review filtering and sorting

9. Added Most Recent sorting.
10. Added Most Helpful sorting using helpful minus not-helpful score.
11. Added Highest Rated sorting.
12. Added Lowest Rated sorting.
13. Added exact 5/4/3/2/1-star filtering plus All stars.
14. Added combined sort + star-filter behavior.
15. Added a filtered empty state.
16. Rerenders only the review-list container rather than rebuilding the whole detail.

### Review cards

17. Added gradient initial avatars.
18. Added username and local ownership badge.
19. Added formatted review date.
20. Added integer star display.
21. Preserved review text and HTML escaping.
22. Replaced triangle vote controls with Helpful and Not helpful buttons/counts.
23. Preserved authenticated/Guest vote persistence and active state.
24. Preserved Edit/Delete controls only for the user’s own review.

### Write Review bottom sheet

25. Converted the review composer from a centered dialog to a bottom sheet.
26. Added slide-up animation, top drag handle, safe-area padding, max-height scrolling, and mobile full-width treatment.
27. Preserved star selection, text validation, local/auth persistence, Escape, backdrop, focus containment, and focus restoration.

### Validation

- `[x]` All JavaScript syntax checks passed.
- `[x]` All four regression suites passed.
- `[x]` Detail fixture contains large summary, animated bar targets, sort selector, star selector, avatars, dates, Helpful, and Not helpful controls.
- `[x]` Filtered review markup preserves required card fields.
- `[x]` CSS audit confirmed two-column/stacked layout, bar animation, filter responsiveness, card identity layout, and bottom-sheet animation.
- `[x]` `/paragon-archive.html`, `/app.js`, and `/style.css` returned HTTP 200.
- `[!]` Final bar timing, mobile sheet height, and filter ergonomics require SPCK/physical-browser confirmation.

### Result

Ratings & Reviews now has a large left-side score, decimal stars, review count, animated right-side percentage breakdown, combined sorting/filtering, full identity/date/helpfulness review cards, and a Write Review sheet that slides up from the bottom.

---

## v0.17.0 — 2026-08-04 — Final front-end freeze, category corrections, audit, documentation, and export handoff

**Request reference:** SOP §11, Prompt P-017  
**Status:** `[x]` completed; owner testing/content/backend activation deferred to CTA

### Final owner decisions applied

1. Corrected Paragon Tutor from Lifestyle to **Education & Learning / Education**.
2. Corrected Paragon Vibe from Originals to **Entertainment & Media / Entertainment**.
3. Kept the owner-approved 13 previously existing 45–100 detail updates unchanged apart from those category corrections.
4. Recorded expanded Media content as approved.
5. Recorded logos and real screenshots as future owner/product-build tasks.
6. Froze scope at front-end authentication clients plus Supabase schema; no backend server/service implementation was added.

### One-account confirmation

7. Confirmed one Supabase account session is shared across same-origin Paragon product paths.
8. Confirmed `ParagonProgress.load/save/remove(productId)` is the shared product/course progress API.
9. Confirmed authenticated bookmarks, reviews, votes, visits, collections, preferences, profile, and progress use one RLS-protected user-state row.
10. Confirmed Guest equivalents are session-only and removed when Guest ends.
11. Confirmed Creator Demo remains a real Supabase Email-authenticated identity and the supplied password is absent from workspace files.

### Final automated audit

12. Ran syntax checks across configuration, auth, sync, catalogue expansions, Updates, Metrics, PWA, service worker, application, and all tests.
13. Ran all four regression suites successfully.
14. Verified all HTML IDs are unique.
15. Verified every linked local script, stylesheet, manifest, icon, schema, test, and documentation path exists.
16. Verified `paragon-archive.html` is canonical and no `index.html` exists.
17. Verified every HTML/CSS/JS/SQL file has the correct export identity and expected path.
18. Verified no `alert(`, TODO, FIXME, fake `window.login`, or `PARAGON_USER` remains in active HTML/application source.
19. Verified supplied creator password is absent from all workspace files.
20. Verified PWA manifest, icons, service worker, and offline shell references.
21. Verified Supabase RLS/state/profile/request/username schema hooks.
22. Verified Tutor=Education, Vibe=Entertainment, and all 106 internal catalogue names remain unique.
23. Verified every handoff code/text asset returns HTTP 200.

### Documentation and CTA finalization

24. Updated project phase to front-end/schema complete and export-ready.
25. Marked automated baseline and known front-end bug work complete.
26. Kept owner visual/device validation pending.
27. Consolidated CTA §13 into four clear groups:
    - later owner testing;
    - Supabase activation;
    - content/product assets;
    - deferred backend/production work.
28. Kept SOP §3A as the canonical reconstruction tree/load order.
29. Recorded current category and backend-scope decisions in D-056 through D-058.

### Export handoff

30. Prepared a folder-preserving final archive named `paragon-archive-export-v0.17.0.zip`.
31. The ZIP contains the complete `paragon-archive/` tree, including canonical HTML, CSS, app/auth/data/PWA files, icons, Supabase schema, tests, SOP, EOP, and integration guide.
32. Export headers remain the recovery source of truth if files are later uploaded individually or flattened.

### Final completion state

- `[x]` Front-end application implementation complete
- `[x]` Supabase authentication client complete
- `[x]` Supabase schema/RLS complete
- `[x]` Shared account/progress API complete
- `[x]` Catalogue 1–100 plus preserved unrelated records merged
- `[x]` Export/re-import metadata complete
- `[x]` Automated tests complete
- `[~]` Owner SPCK/physical-device tests pending
- `[~]` Supabase activation/configuration pending
- `[~]` Real URLs/logos/screenshots/content pending
- `[ ]` Deferred backend/production services intentionally not started

### Result

Paragon Archive is frozen as a complete export-ready front-end and Supabase-schema handoff. The next phase can begin with individual website creation, real content/assets, owner testing, Supabase activation, and later backend services without reopening foundational Archive work.

---

## v0.18.0 — 2026-08-04 — Privacy & Security Policy and consent controls

**Request reference:** SOP §11, Prompt P-018  
**Status:** `[x]` completed; owner legal/production review pending

### Policy publication

1. Created `paragon-privacy-security.html` with export identity/path/load instructions.
2. Published the owner-supplied Privacy & Security Policy effective and last updated August 1, 2026.
3. Included all fourteen supplied sections, Nigeria/international language, data categories, purposes, ads, cookies, Analytics, sharing, retention, rights, security, children, changes, and Privacy contact details.
4. Added a direct Table of Contents, responsive legal layout, policy dates, mail links, Back to Archive, and contact section.
5. Added an implementation-status notice clarifying Google Analytics/Ads scripts are not connected in the exported front end.
6. Replaced the footer Privacy placeholder with a real policy link.

### Privacy controls and cookies

7. Created `privacy.js` with export identity/path/load instructions.
8. Added first-visit cookie banner with Essential Only, Manage, and Accept All.
9. Essential storage is always enabled.
10. Optional Analytics, tracking-cookie, and ad preferences default off until explicit consent.
11. Added Privacy Controls dialog to the Archive and inline controls on the policy page.
12. Connected Account Settings → Privacy & Security to the controls.
13. Added persistent preference API: `ParagonPrivacy.getPreferences/savePreferences/analyticsAllowed/trackingAllowed/adsAllowed`.
14. Guest privacy preferences follow Guest session-only storage.
15. Added consent-change event for future integrations.
16. Added local/account data export excluding passwords and authentication tokens.
17. Added honest Delete Account status explaining secure backend processing is pending.
18. Added backdrop/Escape/close/cancel interactions and responsive mobile controls.

### PWA/export/testing

19. Added policy page and privacy script to service-worker application shell.
20. Added both files and `tests/privacy.test.js` to SOP §3A and source inventory.
21. Added export headers to privacy HTML/JS/test.
22. Created `tests/privacy.test.js` covering first-visit banner, Essential Only, Accept All, controls state, and Guest session-only preferences.
23. Expanded UI regression checks for policy page, controls, cookie banner, headers, and paths.
24. Rebuilt the folder-preserving handoff as `paragon-archive-export-v0.18.0.zip`.

### Validation

- `[x]` `privacy.js` and privacy test syntax passed.
- `[x]` All five regression suites passed.
- `[x]` Policy page contains required dates, sections 1–14, and contact email.
- `[x]` Cookie banner and privacy controls have unique IDs and working preference state.
- `[x]` Essential-only consent disables all optional categories.
- `[x]` Accept-all enables all optional categories.
- `[x]` Guest privacy preferences are session-only.
- `[x]` Policy page, privacy script, styles, service worker, and test returned HTTP 200.
- `[x]` Export ZIP integrity test passed with privacy files and updated documentation included.
- `[!]` Owner/legal review of policy wording remains recommended before production.
- `[!]` Analytics/Ads scripts are intentionally absent until future consent-aware integration.
- `[!]` Secure account deletion remains a backend workflow.

### Result

Paragon Archive now has a direct, responsive Privacy & Security Policy, first-visit consent banner, Account privacy controls, optional tracking/analytics/ad preferences, local data export, and honest account-deletion status. The implementation does not load analytics or advertising scripts without a future consent-aware integration.

---

## v0.19.0 — 2026-08-05 — Dedicated Request a Website page and owner-supplied introduction

**Request reference:** SOP §11, Prompt P-019  
**Status:** `[x]` completed; owner device/live-Supabase testing pending

### Page publication

1. Created `paragon-request-website.html` as a distinct direct page under the multi-page rule.
2. Published the supplied page header and lead copy:
   - `💡 REQUEST A WEBSITE`
   - `You imagine it. We build it.`
   - the statement that a user idea could become the next website thousands of people use.
3. Published the complete supplied `Tell Us What You Need` introduction, including:
   - Paragon’s free, easy-to-find, working-web belief;
   - the 100-website milestone;
   - tools, games, resources, and creative spaces as welcome idea types;
   - the promise to read every request;
   - most-requested idea prioritization;
   - follow-up when work starts;
   - `No idea is too big or too small`;
   - `This is how Paragon grows — with you.`
4. Added an accessible jump action from the hero to the form and a concise three-step explanation of what follows submission.
5. Reused the Archive logo/back navigation, shared stylesheet, Privacy link, manifest, and semantic page structure.

### Submission behavior

6. Created `request-website.js` with an export identity/path header.
7. Added current-session identity detection for authenticated, Guest, and signed-out visitors.
8. Preserved all fourteen exact request categories used by the Archive.
9. Preserved website-name, optional URL, category, and reason fields with validation and private-information guidance.
10. Authenticated requests use the existing `ParagonSync.submitWebsiteRequest()` Supabase path.
11. Guest requests save only to `sessionStorage` under the existing session-draft key and are restored on return during that browser session.
12. Signed-out users receive honest Account guidance and cannot trigger a fake submission.
13. Added clear identity, loading, success, and error states.

### Navigation and compatibility

14. Changed the Archive footer Request a site action to a direct link to the dedicated page.
15. Changed Account Settings → Request a Website to a direct page link.
16. Kept the original in-shell request dialog and controller intact as a compatibility fallback rather than removing working behavior.
17. Extended `.settings-link` styling to support semantic anchors without changing the Account row appearance.

### Responsive presentation

18. Added a distinctive but design-consistent gradient hero, responsive typography, exact-copy introduction card, sticky desktop form, and single-column tablet/mobile layout.
19. Added phone-specific card, process-step, field, and hero sizing.
20. Preserved keyboard focus, semantic labels, live status regions, native field validation, and reduced-motion behavior inherited from the shared stylesheet.

### PWA, export, documentation, and regression protection

21. Added the request page and script to the service-worker application shell and advanced the cache to `paragon-archive-v19`.
22. Added both files to SOP inventory, reconstruction tree, and page load order.
23. Added `tests/request-website.test.js` with static supplied-copy/path audits and dynamic fixtures for:
   - fourteen category options;
   - Guest identity and session-only draft saving;
   - authenticated Supabase submission;
   - signed-out submission blocking.
24. Extended the UI regression suite’s export-header manifest and dedicated-page assertions.
25. Updated SOP progress, architecture state, D-062, P-019, known constraints, and owner testing CTA.
26. Rebuilt the folder-preserving handoff as `paragon-archive-export-v0.19.0.zip`.

### Validation

- `[x]` New page, script, and test contain correct export identity/path headers.
- `[x]` `node --check request-website.js` and `node --check tests/request-website.test.js` passed.
- `[x]` Dedicated request regression passed for exact owner copy, form hooks, Guest isolation, signed-out guard, and authenticated submission.
- `[x]` Existing Privacy, Auth, UI, Metrics/Carousel, and Search/Navigation suites remained passing.
- `[x]` Static checks confirmed Archive footer and Account Settings link to the dedicated page.
- `[x]` Service-worker shell includes the request page and script.
- `[x]` Canonical Archive entry remains `paragon-archive.html`; no `index.html` was created.
- `[x]` No Supabase service-role key or private creator password was added.
- `[!]` Live authenticated submission still requires the owner’s Supabase activation.
- `[!]` Final visual/interaction confirmation remains owner-dependent because no graphical browser engine is installed in the workspace.

### Result

Request a Website is now a full, direct, responsive Paragon page using the owner’s supplied message. It preserves real Supabase submission for authenticated users, session-only Guest drafts, honest signed-out guidance, and the existing in-shell fallback without changing unrelated Archive behavior.

---

## v0.20.0 — 2026-08-05 — Request counter and Recently Built community proof

**Request reference:** SOP §11, Prompt P-020  
**Status:** `[x]` completed; owner visual/live-data confirmation pending

### Counter display

1. Added a full-width counter card below the dedicated request page’s introduction/form area.
2. Published the exact owner-supplied value and copy:
   - `💡 247`
   - `website requests submitted so far`
   - `and we are building them one by one`
3. Styled the number as the visual focus with responsive type, Paragon accent gradient, a soft background glow, and semantic accessible labeling.
4. Recorded 247 as an owner-supplied curated count rather than falsely describing it as a live database aggregate.

### Recently Built section

5. Added `✅ RECENTLY BUILT FROM YOUR REQUESTS` directly below the counter.
6. Added exactly three cards in the supplied order:
   - Paragon Vibe — Entertainment — Mood-based experience
   - Paragon Sounds — Entertainment — Ambient sound mixer
   - Paragon Journal — Lifestyle — Daily journal
7. Preserved the confirmed Paragon Vibe Entertainment placement.
8. Connected every card to its existing `paragon-archive.html?site=...` detail deep link.
9. Added the exact closing sentence: `These started as requests just like yours.`
10. Added product-specific accent treatments, icons, category labels, descriptions, keyboard-focus support, and external-style route arrows without introducing new remote assets.

### Responsive and regression protection

11. Added a three-column desktop/tablet card grid and one-column phone layout.
12. Added phone-specific counter, section, card, and heading sizing.
13. Extended `tests/request-website.test.js` to verify:
   - exact counter value/supporting copy;
   - exact Recently Built heading/closing copy;
   - exactly three cards;
   - Vibe, Sounds, and Journal deep links.
14. Advanced the service-worker cache to `paragon-archive-v20` so the updated page/styles replace the prior cached version.
15. Updated SOP progress, D-063, P-020, known constraints, owner testing CTA, and deferred live-count requirement.
16. Rebuilt the folder-preserving handoff as `paragon-archive-export-v0.20.0.zip`.

### Validation

- `[x]` Request page contains the exact supplied counter and Recently Built copy.
- `[x]` Exactly three recently built cards appear in the supplied order.
- `[x]` All three deep links target existing Archive product details.
- `[x]` Counter/card CSS includes desktop and phone-responsive states.
- `[x]` Request regression suite passed with the expanded assertions.
- `[x]` Existing Privacy, Auth, UI, Metrics/Carousel, and Search/Navigation suites remained passing.
- `[x]` JavaScript syntax, HTML IDs, export headers, local links/assets, CSS brace, HTTP, and ZIP-integrity audits passed.
- `[x]` Canonical entry remains `paragon-archive.html`; no `index.html` was created.
- `[x]` No private credential or service-role key was added.
- `[!]` Final visual confirmation remains owner-dependent because no graphical browser engine is installed.
- `[!]` Automatic live request-count aggregation remains deferred backend work.

### Result

The dedicated Request a Website page now shows the owner-supplied 247-request community counter and three concrete request-origin successes—Vibe, Sounds, and Journal—immediately followed by direct Archive detail links and the supplied community message.

---

## v0.21.0 — 2026-08-05 — Expanded request form and authenticated rolling seven-day limit

**Request reference:** SOP §11, Prompt P-021  
**Status:** `[x]` front-end/schema completed; Supabase activation/live limit testing pending

### Clarification and security decision

1. Confirmed through owner clarification that real request submission now requires a Paragon account.
2. Guest users may save a session-only draft but cannot submit to the database.
3. This account-only choice prevents a signed-in user from logging out and using Guest to bypass the limit.
4. No public-IP lookup, IP hash, browser fingerprint, or persistent device identifier is used for this request limit.
5. Added a concise form disclosure explaining the account requirement, Guest draft behavior, seven-day limit, and no-fingerprint approach.

### Supplied form write-up and fields

6. Replaced the short heading with `Submit Your Request`.
7. Added the supplied introduction: `Fill in the details below and send it our way. The more detail you give us the better we can understand what you need and the faster we can build it right.`
8. Rebuilt the dedicated form with:
   - required Website Name or Idea and supplied Paragon Maps prompt;
   - required Category;
   - required What should it do? field, 1,000-character maximum, and live counter;
   - required Why do you think people need this? field, 500-character maximum, and live counter;
   - optional/recommended contact email and supplied notification prompt;
   - required no-guarantee acknowledgement;
   - `SUBMIT MY REQUEST 💡` action.
9. Replaced the previous fourteen Archive categories in this submission form with the ten supplied choices:
   - Tools
   - Creative
   - Education
   - Social
   - Entertainment
   - Games
   - Finance
   - Health
   - Dev Tools
   - Other
10. Removed the previous optional example-URL field from the dedicated form.
11. Prefilled the authenticated account email while keeping it optional and editable.
12. Added validation for name, category, both required explanations, optional email format, and acknowledgement.

### Identity and Guest behavior

13. Authenticated eligible users see `SUBMIT MY REQUEST 💡`.
14. Guest users see `SAVE GUEST DRAFT 💡`; expanded draft fields remain in sessionStorage only.
15. Signed-out users see `SIGN IN TO SUBMIT 💡` and cannot insert a request.
16. Rate-limited accounts see a disabled `7-DAY LIMIT ACTIVE` action and next-eligible date.
17. The acknowledgement checkbox is not restored as accepted from a prior Guest draft; users must confirm it for the current submission.

### Shared client and schema

18. Added `ParagonSync.getWebsiteRequestEligibility()` to read the authenticated user’s latest request and calculate the next eligible timestamp.
19. Extended `ParagonSync.submitWebsiteRequest()` with:
   - `need_reason`;
   - `contact_email`;
   - `terms_acknowledged`.
20. Added rerunnable columns and length checks to `paragon_website_requests`.
21. Kept anonymous table access revoked and own-user authenticated RLS policies active.
22. Added `enforce_paragon_request_rate_limit`, a database `before insert` trigger enforcing one request per authenticated account in every rolling seven-day period.
23. Added a per-user advisory transaction lock so simultaneous submissions cannot both pass the check.
24. Forced `created_at = now()` and `status = submitted` inside the trigger so a browser client cannot bypass the limit by backdating a row or assigning its own moderation status.
25. Updated `auth/INTEGRATION.md` with eligibility, database-authority, Guest, race-prevention, and no-fingerprint guidance.

### Responsive and visual updates

26. Added rate-limit notice, character-counter, required-marker, acknowledgement, rate-limited identity, and disabled-action styling.
27. Made the expanded form card non-sticky so every field remains reachable on shorter laptop/tablet viewports.
28. Preserved the existing hero, introduction, 247 counter, Recently Built cards, footer, and Archive links.
29. Advanced the service-worker cache to `paragon-archive-v21`.

### Regression protection and documentation

30. Expanded `tests/request-website.test.js` with exact form-copy/field/category/counter/consent assertions and dynamic fixtures for:
   - live 1,000/500 counters;
   - authenticated email prefill;
   - expanded Guest drafts;
   - signed-out blocking;
   - authenticated expanded submission;
   - local post-submit limit state;
   - pre-existing rate-limit disabling;
   - anonymous grant revocation;
   - advisory-lock/database-trigger enforcement;
   - anti-backdating/moderation-status protection.
31. Expanded `tests/auth.test.js` with request eligibility before/after submission and expanded payload checks.
32. Updated SOP progress, D-064, P-021, known constraints, Supabase activation checklist, and owner testing CTA.
33. Rebuilt the folder-preserving handoff as `paragon-archive-export-v0.21.0.zip`.

### Validation

- `[x]` All six dependency-free regression suites passed.
- `[x]` All JavaScript syntax checks passed.
- `[x]` Exact supplied form copy, ten categories, limits, counters, acknowledgement, and action are present.
- `[x]` Guest saves a session-only expanded draft and performs no Supabase insertion.
- `[x]` Signed-out submission is blocked.
- `[x]` Authenticated eligible submission includes all expanded fields.
- `[x]` Recent-account eligibility disables a second request in the front end.
- `[x]` SQL audit confirmed anonymous revocation, own-user RLS, advisory lock, rolling seven-day trigger, forced server timestamp, and forced submitted status.
- `[x]` HTML IDs, export headers, local links/assets, CSS structure, credential scan, HTTP assets, and ZIP integrity passed.
- `[x]` Canonical entry remains `paragon-archive.html`; no `index.html` was created.
- `[!]` The database trigger and live eligibility request require the updated schema to be run in the owner’s Supabase project.
- `[!]` Final physical-device/SPCK form usability remains owner testing.

### Result

The supplied request form is complete. Secure submission is account-only, Guest is draft-only, and the database—not browser storage—is authoritative for one accepted request per account every rolling seven days. Logging out into Guest cannot bypass the rule, and the solution does not rely on IP tracking or device fingerprinting.

---

## v0.22.0 — 2026-08-05 — Free-first transactional email foundation and request auto-reply

**Request reference:** SOP §11, Prompt P-022  
**Status:** `[x]` code/schema/template complete; free provider/Supabase activation pending

### Free-first architecture decision

1. Interpreted the owner’s instruction to continue with the easiest no-cost route as approval for the narrow email backend foundation.
2. Selected Brevo Email API/SMTP because it provides one simpler route for application emails and Supabase Auth email while the project remains small.
3. Kept `paragon.archive.2026@gmail.com` as the initial visible sender and Reply-To after sender verification.
4. Avoided direct Gmail API integration because it would add Google Cloud OAuth consent, refresh-token rotation, quotas, and possible verification.
5. Kept all provider credentials, webhook secret, and Supabase service-role access out of browser files.
6. Recorded that a verified `paragonarchive.com` sender can replace Gmail later through one Edge secret if the owner controls the domain DNS.

### Automatic reply template

7. Created `supabase/functions/_shared/email-templates.mjs` as the central allowlisted template registry.
8. Added the exact subject `We got your idea 💡 — Paragon Archive`.
9. Added responsive HTML and plain-text versions containing every supplied section:
   - request thank-you and appreciation;
   - personal review/priority process;
   - no fixed timeline and quality commitment;
   - future website-live email promise;
   - sharing encouragement;
   - `I wish this existed` closing;
   - Stay exceptional;
   - The Paragon Team, Gmail address, and `paragonarchive.com`.
10. Added the submitted website/idea name safely when available.
11. Added a `Share Paragon Archive by email` mailto action with URL-encoded subject/body; recipients still review and choose Send.
12. Updated the request success state to tell users with contact email to watch their inbox.

### Private email outbox and request queue

13. Extended `supabase/schema.sql` with private `paragon_email_outbox` storage for:
   - unique event key;
   - allowlisted template key;
   - recipient;
   - JSON payload;
   - pending/processing/sent/failed status;
   - provider and provider message ID;
   - attempt count;
   - last error;
   - created/updated/sent timestamps.
14. Enabled RLS and revoked all outbox access from anonymous and authenticated browser roles.
15. Added `queue_paragon_request_received_email`, an after-insert request trigger.
16. Requests with contact email queue exactly one `request-received` event using a unique request-derived key and conflict-safe insertion.
17. Requests without contact email queue no email.

### Protected Edge delivery worker

18. Created `supabase/functions/send-transactional-email/index.ts`.
19. Required POST and a constant-time checked custom webhook secret.
20. Loaded Brevo API key, webhook secret, service role, sender email, and sender name only through Edge environment secrets.
21. Atomically claimed only a pending outbox row before delivery, preventing duplicate webhook processing under normal execution.
22. Sent allowlisted template output through Brevo’s transactional Email API.
23. Stored sent status, provider, provider message ID, sent time, attempt count, and failures.
24. Returned no browser CORS surface and no provider detail on public error responses.

### Activation and Auth/OTP guide

25. Created `supabase/functions/EMAIL-INTEGRATION.md` with free-first setup for:
   - Brevo account and Gmail sender verification;
   - complete schema execution;
   - Edge secrets;
   - function deployment with `--no-verify-jwt` plus custom webhook authentication;
   - protected Database Webhook configuration;
   - Supabase Auth custom SMTP;
   - signup verification, recovery, and future server-generated email OTP;
   - live testing, no-email behavior, rate limit, logs, and future templates;
   - manual mailto behavior;
   - later SMS/WhatsApp separation.
26. Explicitly prohibited Gmail passwords, OAuth tokens, provider API keys, webhook secrets, and service-role keys in browser source.

### Privacy and monetization guidance

27. Updated Privacy & Security Policy data-sharing disclosure so destination email/message content may be processed by an email delivery provider solely for authentication or transactional delivery.
28. Kept Google Analytics/Ads scripts absent.
29. Recorded Google AdSense as a future external application: Google does not pay simply because a site has users; the site must be reviewed/approved and maintain original, audience-attracting, policy-compliant content.
30. Kept consent-aware AdSense, SMS OTP, and WhatsApp Business messaging deferred.

### Regression, PWA, documentation, and export

31. Created `tests/email.test.js` covering exact subject/body, responsive HTML, plain text, request name, mailto encoding, no scripts, Edge secrets/provider/claim states, outbox privacy/idempotency, activation guide, request success message, and privacy disclosure.
32. Expanded Privacy regression with email-provider disclosure.
33. Added the Edge/template/test files to export-header validation.
34. Advanced the service-worker cache to `paragon-archive-v22` for changed request/privacy browser assets.
35. Updated SOP inventory, reconstruction tree, phase, progress, D-065/D-066, P-022, constraints, testing, activation, and deferred integrations.
36. Rebuilt the folder-preserving handoff as `paragon-archive-export-v0.22.0.zip`.

### Validation

- `[x]` All seven dependency-free regression suites passed.
- `[x]` Browser JavaScript, MJS template, tests, and JavaScript-compatible Edge worker syntax passed.
- `[x]` Exact supplied automatic reply is present in plain text and responsive HTML.
- `[x]` Prefilled mailto subject/body encoding passed.
- `[x]` SQL audit confirmed a private outbox, unique event keys, browser-role revocation, optional-email queue trigger, and conflict-safe insertion.
- `[x]` Worker audit confirmed environment-only credentials, constant-time custom-secret validation, pending-row claim, Brevo endpoint, and sent/failed logging.
- `[x]` Privacy disclosure and no-contact-email behavior are documented/tested.
- `[x]` HTML IDs, export identities including MJS/TS, local assets, CSS structure, credential scan, HTTP assets, and ZIP integrity passed.
- `[x]` Canonical entry remains `paragon-archive.html`; no `index.html` was created.
- `[!]` Real email delivery requires the owner to create/verify the free Brevo sender, apply schema, set secrets, deploy the function, create the Database Webhook, and configure Auth SMTP.
- `[!]` Provider free limits/terms can change and must be confirmed during activation.

### Result

Paragon Archive now has a secure, reusable, free-first transactional email foundation. Accepted requests with contact email queue the supplied automatic reply; a protected Supabase Edge Function can deliver it through Brevo and log its result. Supabase Auth can use the same provider for verification, recovery, and future email OTP, while no secret is exposed to the browser. A prefilled email-share action is included for user-confirmed sending.

---

## v0.23.0 — 2026-08-05 — Dedicated Help & Support page and private support intake

**Request reference:** SOP §11, Prompt P-023  
**Status:** `[x]` front-end/schema/Edge foundation completed; deployment/live testing pending

### Dedicated page and supplied content

1. Created `paragon-help-support.html` as a direct public Help & Support page under the multi-page rule.
2. Published the supplied hero:
   - `🆘 HELP & SUPPORT`
   - `We are here. Ask us anything.`
   - `Whatever you need — we will sort it out together.`
3. Published the complete `We Are Real People` introduction and retained the 72-hour response promise, no-bots statement, and real-team response commitment.
4. Added responsive Contact Form and Direct Email cards.
5. Added direct Gmail compose links using exact subjects:
   - Support
   - Bug
   - Billing
   - Privacy
   - Other
6. Published the complete Reporting a Bug guidance:
   - what counts as a bug;
   - what is not a bug;
   - what diagnostics to include;
   - screenshot guidance;
   - Bug Report topic instruction;
   - direct Request a Website route for missing-product ideas.

### Contact form

7. Added the supplied Send Us a Message form with:
   - required name and supplied prompt;
   - required reply email and supplied prompt;
   - seven exact support topics;
   - required issue description, 2,000-character maximum, and live counter;
   - optional screenshot picker/drag-and-drop;
   - PNG/JPG/GIF and 10MB guidance;
   - `SEND MESSAGE 📬` action.
8. Added authenticated name/email prefill while preserving public signed-out submission.
9. Added keyboard-accessible upload selection, drag states, file-name/size display, removal, and client-side type/size rejection.
10. Added an invisible honeypot and honest free-first three-messages-per-email/24-hours disclosure.
11. Kept Supabase-unconfigured behavior honest by directing visitors to Direct Email rather than showing fake success.
12. Added success feedback promising a real-person response within 72 hours.

### Public support Edge Function

13. Created `supabase/functions/submit-support-message/index.ts`.
14. Added exact-origin CORS controlled by `PARAGON_ALLOWED_ORIGINS` instead of wildcard production access.
15. Added POST/OPTIONS handling, content-size guard, multipart parsing, honeypot, name/email/topic/message validation, and file validation.
16. Added optional authenticated-user detection from a valid Paragon bearer session.
17. Uploaded valid screenshots through service role to private Storage.
18. Inserted support rows through service role; anonymous/authenticated browser roles receive no direct table or bucket access.
19. Added orphan screenshot cleanup when the database insert fails.
20. Returned a specific 429 response for the database support limit without exposing internal errors.

### Private support schema and screenshots

21. Added private `paragon_support_messages` with sender, optional user, topic, message, attachment metadata, user-agent, status, and timestamps.
22. Enabled RLS and revoked all browser-role table access.
23. Added indexes for status/admin processing and email-based rate checks.
24. Added `enforce_paragon_support_rate_limit`:
   - normalizes email;
   - forces server timestamps/open status;
   - locks per email against simultaneous races;
   - permits up to three accepted messages per rolling 24 hours;
   - stores no IP address/device fingerprint.
25. Created/upgraded the private `support-attachments` bucket with 10MB and PNG/JPG/GIF restrictions and no public Storage policies.

### Owner notification and human response

26. Extended the email template allowlist with `support-notification`.
27. Added `queue_paragon_support_notification` so every accepted support row queues exactly one owner email to `paragon.archive.2026@gmail.com`.
28. The owner notification includes topic, name/email, support ID, message, device/browser user-agent, and private attachment path.
29. Escaped all public user content in notification HTML.
30. Added a prefilled Reply button addressed to the visitor with a prepared support subject/body; the owner reviews and chooses Send.
31. Sent no automatic reply to the visitor, preserving the no-bots/real-person promise.

### Navigation, privacy, PWA, and guidance

32. Replaced Account Settings pending Help with the real page.
33. Added Help links to the Archive, Request, and Privacy footers.
34. Updated Privacy & Security data collection to disclose support messages, bug reports, and optional screenshots.
35. Created `supabase/functions/SUPPORT-INTEGRATION.md` covering architecture, free-first anti-spam, schema, exact origins, deployment, owner notifications, private screenshot review, direct email limits, and live tests.
36. Updated `EMAIL-INTEGRATION.md` to record the current support-notification template.
37. Added the Help page/client to the PWA shell and advanced cache to `paragon-archive-v23`.

### Regression, documentation, and export

38. Created `tests/help-support.test.js` covering exact supplied copy, subjects, topics, field/upload constraints, counter, account prefill, valid submission payload, 72-hour success, navigation, support schema, Edge contract, private bucket, notification, and integration guide.
39. Expanded email tests with escaped support notification, attachment/device context, Reply-To, and prefilled Reply action.
40. Expanded privacy tests with support-message/screenshot disclosure.
41. Expanded UI export-header and dedicated-page/link coverage.
42. Updated SOP inventory, reconstruction manifest/load order, progress, D-067, P-023, constraints, owner tests, activation tasks, content CTA, and deferred support administration.
43. Rebuilt the folder-preserving handoff as `paragon-archive-export-v0.23.0.zip`.

### Validation

- `[x]` All eight dependency-free regression suites passed.
- `[x]` Browser JavaScript, MJS template, tests, and both JavaScript-compatible Edge workers passed syntax checks.
- `[x]` Every supplied Help/Support/bug-report statement, field, topic, direct subject, and upload rule is present.
- `[x]` Client fixtures confirmed account prefill, 2,000 counter, file rejection/acceptance, Edge submission, and 72-hour success.
- `[x]` SQL audit confirmed private support table/bucket, browser-role revocation, advisory-lock rate limit, allowlisted email event, and owner-notification trigger.
- `[x]` Edge audit confirmed exact-origin handling, multipart/field/file validation, private upload, user detection, service-role insert, cleanup, and rate-limit response.
- `[x]` Support notification escapes user content and includes a prefilled human Reply action.
- `[x]` HTML IDs, export identities including MJS/TS, local assets, CSS structure/responsive hooks, credential scan, HTTP assets, and ZIP integrity passed.
- `[x]` Canonical entry remains `paragon-archive.html`; no `index.html` was created.
- `[!]` Live support form/upload/notification requires final schema, allowed-origin secret, both Edge deployments, Database Webhook, Brevo activation, and production HTTPS origin.
- `[!]` A future protected support admin inbox/signed screenshot URLs may improve operations after initial launch.

### Result

Paragon Archive now has a complete responsive Help & Support page with real direct-email options, public contact intake, private screenshot handling, database anti-spam, detailed bug guidance, and owner notifications that open a prepared human reply. No automated visitor response undermines the real-person promise, and no browser receives private table, Storage, provider, or service-role access.

---

## v0.24.0 — 2026-08-05 — Help FAQ and six-step Archive documentation

**Request reference:** SOP §11, Prompt P-024  
**Status:** `[x]` completed; owner visual/content confirmation pending

### Frequently Asked Questions

1. Added a full Frequently Asked Questions card to `paragon-help-support.html`.
2. Used semantic native `details/summary` accordions for keyboard and pointer access without adding another JavaScript controller.
3. Added all fifteen supplied questions under four groups:
   - 🔑 Account — five questions;
   - 🌐 Websites — five questions;
   - 🔔 Notifications and Settings — three questions;
   - 💰 Pricing — two questions.
4. Preserved the supplied signup, password reset, data download, theme, privacy-control, free-pricing, and accessibility-of-tools guidance.

### Truth-preserving corrections

5. Clarified that Guest bookmarks/reviews/collections/history are temporary for the browser session rather than entirely unavailable.
6. Replaced the false completed account-deletion claim with the current honest pending secure-backend status and Privacy support path.
7. Clarified that embedded websites may block framing and require Open in New Tab.
8. Distinguished authenticated persistent/synced state from temporary Guest state.
9. Added the current one-request-per-account rolling seven-day rule.
10. Clarified that saved-site timeline highlights exist now while production email notification delivery remains activation-dependent.
11. Clarified that Analytics scripts are not currently connected.
12. Clarified that future ads are optional, currently absent, and must respect consent.

### How to Use Paragon Archive

13. Added the supplied `How to Use Paragon Archive` introduction.
14. Added all six steps:
   - Browse the Archive;
   - Open a Website;
   - Create Your Account;
   - Save Your Favorites;
   - Stay Updated;
   - Your Account.
15. Replaced the supplied public `all 100`/full-grid wording with category-led discovery so the guide does not expose the private catalogue total or reintroduce the removed inventory grid.
16. Added current iframe/new-tab, authenticated sync, saved-update highlight, and account-state guidance.
17. Added six styled, labeled screenshot placeholders rather than presenting generated artwork as final Archive screenshots.

### Presentation and responsiveness

18. Added grouped FAQ cards with open states, accent controls, and mobile-safe spacing.
19. Added a six-step visual timeline with numbered markers, responsive cards, and distinct placeholder treatments.
20. Added mobile layouts for FAQ headings, details, timeline markers, guide text, and screenshot placeholders.
21. Preserved all existing Help hero, contact options/form, upload, bug guidance, footer, and support backend behavior.
22. Advanced the service-worker cache to `paragon-archive-v24`.

### Regression, documentation, and export

23. Expanded `tests/help-support.test.js` to verify:
   - all FAQ headings/questions;
   - exactly fifteen native FAQ items;
   - all six documentation steps;
   - exactly six screenshot placeholders;
   - no public total/full-grid wording;
   - honest deletion, Guest, iframe, and analytics statements.
24. Updated SOP progress, D-068, P-024, known constraints, Help owner-testing CTA, and final screenshot content dependency.
25. Rebuilt the folder-preserving handoff as `paragon-archive-export-v0.24.0.zip`.

### Validation

- `[x]` All eight dependency-free regression suites passed.
- `[x]` Complete JavaScript, MJS template, tests, and both JavaScript-compatible Edge workers passed syntax checks.
- `[x]` Exactly fifteen FAQ items appear in four supplied groups.
- `[x]` Exactly six documentation steps and six screenshot placeholders appear.
- `[x]` Static audit confirmed no `all 100` or full archive-grid disclosure.
- `[x]` Static audit confirmed honest current deletion, Guest, iframe fallback, email-notification, analytics, and ad states.
- `[x]` HTML IDs, export headers, local links/assets, CSS structure/responsive hooks, credential scan, HTTP assets, and ZIP integrity passed.
- `[x]` Existing Help form/upload/Edge, email/outbox, privacy, request, auth, Archive, ranking, and navigation suites remained passing.
- `[!]` Styled guide placeholders should be replaced with final owner-approved Archive screenshots later.
- `[!]` Final FAQ open/close feel and guide layout remain owner device testing.

### Result

Help & Support now includes a complete accessible FAQ and responsive six-step onboarding guide. The owner’s supplied topics are preserved while inaccurate production claims were corrected so the page does not promise completed deletion, persistent Guest state, guaranteed iframe loading, active notification email, active tracking/ads, or a public catalogue total that the current implementation does not provide.

---

## v0.25.0 — 2026-08-05 — Public About Paragon story, roadmap, values, and founder message

**Request reference:** SOP §11, Prompt P-025  
**Status:** `[x]` completed; owner founder-photo/visual confirmation pending

### Dedicated About page

1. Created `paragon-about.html` as a bookmarkable public About page under the multi-page rule.
2. Kept the page semantic and static with no unnecessary page-specific JavaScript.
3. Published the supplied hero:
   - `◈ ABOUT PARAGON`
   - `Built with purpose. Driven by passion.`
   - `Free for everyone.`
4. Added direct Archive navigation, shared manifest/style integration, and cross-page footer navigation.

### Story, mission, and name

5. Published the complete August 1, 2026 `Where It All Started` origin story.
6. Published the Archive discovery problem, handcrafted free-website answer, one-home/no-storage/no-cost vision, and day-one commitment.
7. Published the complete `Why We Exist` mission and actually-free positioning.
8. Added the `One account. One archive. Everything you need. Free.` mantra treatment.
9. Published `What Paragon Means`, its perfect-example definition, exceptional tools/access/ease promise, and build-it-right standard.

### Vision and roadmap

10. Published `Where We Are Going` with a four-milestone visual roadmap:
    - August 2026 idea;
    - 2027 Archive launch;
    - 2027 first-100 future milestone;
    - The Future.
11. Preserved the owner’s 100-site wording as a future milestone rather than a claim about the current private internal catalogue count.
12. Published the no-storage, one-account, one-tap, no-cost future vision and only-the-beginning message.

### Values

13. Added five value cards:
    - Free and Accessible Above All;
    - Quality Over Quantity;
    - Built for Real People;
    - Honest and Open;
    - Community Driven.
14. Refined `exactly how to get it removed` to `how to request its removal` so the value statement does not falsely claim the secure deletion backend already exists.

### Founder and team

15. Published the complete founder letter under `From Paragon, To You`.
16. Preserved the founder identity/signoff as `Paragon · Founder, Paragon Archive`.
17. Added an accessible styled Founder photo placeholder instead of inventing or generating a person image.
18. Published the complete lean-team description and developer/designer/builder role chips.

### Contact and signoff

19. Published the complete Get In Touch message, Gmail address, 72-hour response promise, coming-products statement, and archive-is-the-beginning close.
20. Added prepared email subject links for:
    - Support;
    - Privacy;
    - Bug;
    - Partnership;
    - Press;
    - Other.
21. Added the supplied `◈ PARAGON` signoff, Web Reimagined tagline, and 2026 free-for-everyone footer.

### Navigation, PWA, regression, and documentation

22. Replaced Account Settings pending About with the real direct page.
23. Added About links to Archive, Help, Request, and Privacy footers.
24. Added About to the PWA application shell and advanced cache to `paragon-archive-v25`.
25. Created `tests/about.test.js` covering all supplied sections, four milestones, five values, founder placeholder/message, team, six subjects, deletion honesty, navigation, and PWA shell.
26. Expanded UI export-header/dedicated-page/link coverage.
27. Updated SOP inventory, reconstruction manifest/load order, progress, architecture, D-069, P-025, constraints, owner testing, and content dependencies.
28. Rebuilt the folder-preserving handoff as `paragon-archive-export-v0.25.0.zip`.

### Validation

- `[x]` All nine dependency-free regression suites passed.
- `[x]` Complete JavaScript, MJS template, tests, and both JavaScript-compatible Edge workers passed syntax checks.
- `[x]` All supplied story, mission, name, roadmap, value, founder, team, contact, and signoff text is present.
- `[x]` Exactly four roadmap milestones, five value cards, six subject choices, and one accessible founder placeholder are present.
- `[x]` Account Settings and every requested footer route link to About.
- `[x]` Static audit confirmed no fake founder image and no false completed-deletion wording.
- `[x]` HTML IDs, export headers, local links/assets, CSS structure/responsive hooks, credential scan, HTTP assets, and ZIP integrity passed.
- `[x]` Existing Help/FAQ/docs/form/upload, support Edge/schema, email/outbox, privacy, request, auth, Archive, ranking, navigation, and PWA tests remained passing.
- `[!]` The founder placeholder requires an owner-approved real image and final alt text later.
- `[!]` Final typography, roadmap proportions, founder layout, and contact/signoff presentation remain owner device testing.

### Result

Paragon now has a complete public About page that tells the owner-supplied story from origin through mission, meaning, future roadmap, values, founder message, team, contact, and final brand promise. It is responsive, dependency-free, fully linked, PWA-cached, honest about deletion status, and preserves a placeholder until a real founder photo is approved.

---

## v0.26.0 — 2026-08-05 — Category consolidation, sole Archive Hub channel, and 2026 chronology audit

**Request reference:** SOP §11, Prompt P-026  
**Status:** `[x]` completed; future Archive Hub product build/owner review pending

### Dev category removal

1. Removed Dev from the category color map, category-family membership, and category discovery definitions.
2. Kept Dev Tools as the only developer-tools category.
3. Changed the Dev Tools category icon from `🧰` to the former Dev icon `💻`.
4. Applied `💻` to the dedicated Request form Dev Tools option and the Paragon Dev Tools website record.
5. Corrected the base Paragon Code source from Dev to Education and changed its tag to Coding, matching the existing latest expansion decision.

### Originals consolidation

6. Kept exactly one website in Originals: Paragon Archive Hub.
7. Moved Paragon Originals to Creative as a hand-crafted creative showcase.
8. Moved Paragon Random to Productivity & Tools / Tools.
9. Moved Paragon Time Capsule to Lifestyle & Health / Lifestyle.
10. Moved Paragon Alive to Lifestyle & Health / Health and clarified its wellbeing purpose.
11. Kept Paragon Vibe in Entertainment, preserving D-056.
12. Changed the sole Originals category icon to the Archive Hub diamond `◈`.
13. Because no other site shares Archive Hub’s category, it has no same-category Related Website sibling and remains the Archive’s unique companion/channel.

### Archive Hub channel preparation

14. Reframed Paragon Archive Hub as the `Official Paragon Archive channel and publishing gateway`.
15. Added current catalogue feature definitions for:
    - complete Archive overview/documentation;
    - future protected Paragon Team login gateway;
    - Request a Website access;
    - About, Privacy and Terms & Conditions;
    - deploy-or-host-a-website-in-Archive submissions;
    - roadmap and platform updates.
16. Changed its tag to `Archive Channel` while preserving its `◈` identity.
17. Recorded the actual Archive Hub product, protected authorization, and moderation workflow as future work rather than pretending the channel already exists.

### Project-start chronology correction

18. Audited active HTML/JavaScript catalogue/update/application source for pre-project years and stale month-only review dates.
19. Replaced all active 2024/2025 base catalogue version dates with August 1–4, 2026 dates.
20. Replaced inherited January/December review dates with explicit August 2026 dates.
21. Replaced every pre-project addition timestamp with an August 1–3, 2026 normalized timestamp.
22. Replaced the 2024 fallback with August 1, 2026.
23. Changed inherited date status from provisional to `normalized-to-project-start` and renamed the stale variable to `normalizedProjectAdditionDates`.
24. Changed the application’s invalid-review-date fallback from 2025 to 2026.
25. Confirmed every active catalogue `addedAt` is on/after August 1, 2026.

### Active-copy accuracy audit

26. Aligned the Request page with the About roadmap by changing `We have built 100 websites` to `We have mapped out our first 100 websites`.
27. Advanced Privacy & Security `Last Updated` to August 5, 2026.
28. Corrected Privacy language that previously described inactive systems as live:
    - Google Analytics is not connected;
    - ad services are not connected and require future approval/consent;
    - tracking cookies are not connected;
    - notification email depends on activation;
    - secure deletion/30-day purge is pending;
    - Download My Data covers currently available state and excludes credentials;
    - profile editing is pending;
    - production HTTPS is required rather than falsely guaranteed on every preview;
    - infrastructure providers may process technical request data.
29. Kept the existing status note and privacy controls consistent with those corrections.

### Regression, PWA, documentation, and export

30. Created `tests/catalogue-governance.test.js` covering Dev removal/icon transfer, all category moves, sole Archive Hub category/group, Hub channel features, project-start dates, active-source years, Request roadmap wording, and Privacy active-state claims.
31. Made complete-category rendering regression dynamic instead of hard-coding the old fourteen-category count.
32. Added the new governance test to export-header validation and SOP reconstruction manifest.
33. Advanced the service-worker cache to `paragon-archive-v26` so corrected app/data/page files replace stale cached copies.
34. Updated SOP inventory, progress, D-021 status, D-070, P-026, constraints, category testing, content CTA, and future Archive Hub scope.
35. Rebuilt the folder-preserving handoff as `paragon-archive-export-v0.26.0.zip`.

### Validation

- `[x]` All ten dependency-free regression suites passed.
- `[x]` Complete JavaScript, MJS template, tests, and both JavaScript-compatible Edge workers passed syntax checks.
- `[x]` No active Dev category/site/definition remains.
- `[x]` Dev Tools uses `💻` in category, Request, and website data.
- `[x]` Originals contains exactly one site: Paragon Archive Hub.
- `[x]` Random, Time Capsule, Alive, and Paragon Originals resolve to their new categories/groups; Tutor and Vibe remain correct.
- `[x]` Archive Hub includes all supplied channel/publishing/team/legal/request/deploy-host concepts without granting current privileges.
- `[x]` No active HTML/JavaScript source contains a 2024/2025 year, January/December review fallback, or pre-August-2026 catalogue addition.
- `[x]` Request/About 100-site chronology is consistent.
- `[x]` Privacy no longer claims inactive Analytics, ads, deletion, profile editing, or universal HTTPS are live.
- `[x]` HTML IDs, export headers, local links/assets, CSS structure, credential scan, HTTP assets, and ZIP integrity passed.
- `[x]` Existing Archive, ranking, Search, Recent, category, About, Help, support, email, privacy, request, auth, and PWA behavior remained passing.
- `[!]` Building Paragon Archive Hub itself—including team claims, moderation and deploy/host processing—remains future product work.
- `[!]` Owner device/category/content confirmation remains CTA work.

### Result

The catalogue now has no Dev category, Dev Tools consistently uses the computer icon, and Originals is reserved exclusively for Paragon Archive Hub. Former Originals products have practical destination categories. Archive Hub is prepared in data as the future official Archive channel/publishing gateway, while all active pre-project dates and misleading live-system claims were removed or corrected.

---

## v0.27.0 — 2026-08-05 — Workspace cleanup and single-export retention

**Request reference:** SOP §11, Prompt P-027  
**Status:** `[x]` completed

### Pre-cleanup inventory

1. Re-read SOP/EOP and inventoried the workspace root before deletion.
2. Confirmed the root contained:
   - the complete `paragon-archive/` project;
   - original intake copies under `/uploads/`;
   - superseded exports v0.17.0 through v0.26.0.
3. Confirmed `/uploads/` held only the three original intake files already reconstructed into the governed project.
4. Confirmed no active project file depends on `/uploads/` or any older export ZIP.

### Governance update

5. Superseded D-002 and revised P-004 so the current working project and latest verified export are the recovery sources of truth.
6. Added D-071 and P-027 documenting the owner-authorized cleanup boundary.
7. Kept every active source, page, style, data module, auth client, schema, Edge function, integration guide, test, icon, SOP and EOP file.

### Replacement export

8. Built `paragon-archive-export-v0.27.0.zip` from the full current project.
9. Ran ZIP integrity validation.
10. Compared the ZIP file manifest against the working tree and confirmed exact file coverage and folder paths.
11. Confirmed canonical entry remains `paragon-archive.html` and no `index.html` exists.

### Cleanup

12. Removed `/home/user/uploads/` at the owner’s explicit request.
13. Removed root export ZIPs v0.17.0 through v0.26.0.
14. Retained exactly:
    - `/home/user/paragon-archive/`
    - `/home/user/paragon-archive-export-v0.27.0.zip`

### Validation

- `[x]` Working project remained complete.
- `[x]` Replacement ZIP integrity passed.
- `[x]` Replacement ZIP exactly matched all current project files.
- `[x]` `/uploads/` no longer exists.
- `[x]` No superseded root export ZIP remains.
- `[x]` Exactly one current export ZIP remains.
- `[x]` No source, test, page, asset, schema, function or documentation file was deleted from the working project.

### Result

Workspace clutter is reduced to one complete working project and one latest folder-preserving export. Duplicate intake sources and ten superseded export bundles were removed only after the replacement export was verified.

---

## v0.28.0 — 2026-08-05 — Owner device follow-up, custom Search, exact-detail sharing, Updates/notifications, Guest transfer, achievements, request aggregate, and guide revision

**Request reference:** SOP §11, Prompt P-028  
**Status:** `[x]` implemented; owner physical-device and activated-Supabase confirmation pending

### Owner test results and protected behavior

1. Recorded Galaxy S5 `360×240` and Pixel 7 `393×851` as owner-passed.
2. Recorded Galaxy Tab `800×1280`, Tab S6 Lite `810×1080`, laptop `1366×768`, and MacBook `1440×900` as failed because shared page bodies still appeared too narrowly centered.
3. Preserved the owner-approved top/bottom navigation behavior, footer/footer-trigger hiding, Back context, Website of the Day/discovery behavior, Detail behavior outside QR/Share, Ratings & Reviews, and Account wording.
4. Applied the confirmed clarification choices:
   - `1B` — horizontal custom Search suggestions with left/right swipe;
   - `2B` — 30-minute continuous Guest hidden/offline timeout;
   - `3A` — 24-hour welcome/update notifications, 72 hours only for future real AdSense notifications, no fake ads;
   - `4A` — guide icons `⚙️`, `👤`, `◈`, `🌐`, `🔖`, `↻` in the revised order.

### Shared responsive width correction

5. Kept the approved phone gutters/layout unchanged.
6. Added a shared `min-width: 700px` width policy so Archive main content and Privacy/Request/Help/About shells use materially more of tablet, laptop, and MacBook viewports.
7. Increased shared page-shell caps to 1480–1600px and removed narrow internal caps from support/form/prose bodies where they made the background dominate.
8. Static width calculations now produce:
   - 800px → Archive 764px / shared page shell 768px;
   - 810px → Archive 774px / shared page shell 777.6px;
   - 1366px → Archive 1305.9px / shared page shell 1311.4px;
   - 1440px → Archive 1376.6px / shared page shell 1384px.

### Custom in-site Search suggestions

9. Removed the native `<datalist>`, `list` binding, and browser `autocomplete="on"` behavior.
10. Added `#search-suggestions`, an accessible in-site listbox below the Search field.
11. Suggestions remain hidden for an empty query and appear only after the first typed character.
12. Rendered up to ten weighted/category-scoped suggestion cards in a horizontal overflow rail with scroll snap and touch/pointer left/right swipe.
13. Preserved existing All/category filters, descriptive results, exact detail opening, Search Back state, Escape, focus containment, and approved Search results.

### Exact Archive Share and local QR

14. Centralized one canonical detail URL builder: `paragon-archive.html?site=<exact name>`.
15. Share now always sends/copies that detail URL even when the product has a separate real destination URL.
16. Clipboard fallback now includes the exact detail URL instead of description-only text.
17. QR uses the identical detail URL.
18. Removed `qrServiceUrl` and the remote QR image request.
19. Added local `vendor/qrcode.min.js` (qrcode-generator 1.4.4, MIT license retained), loaded before `app.js` and cached in the PWA shell.
20. QR now creates a local scannable data image and therefore remains available without the former third-party QR endpoint.

### Updates filters and transition-color treatment

21. Removed Filter by Website.
22. Added an exact Filter by Category selector derived from current update event categories.
23. Added a date input beside Category.
24. Type + category + local date now intersect, preserve one active type chip, and return an explicit no-match state.
25. Added stable update IDs/DOM anchors so notification targets can focus and scroll to an exact timeline event.
26. Replaced the static right-dot pink with the same animated multi-color transition used by the left dot.
27. Animated both timeline rails and extended the decorative transition surface to shared Archive/page logo marks while leaving semantic badge/status colors intact.
28. Changed the bottom Updates icon to the owner-supplied `↻`.

### Authenticated in-app notifications

29. Replaced two static notification buttons/read-all storage with a normalized authenticated notification array inside `paragon_user_state.state`.
30. First authenticated activation creates one drafted welcome notification and records an activation timestamp plus local-calendar cutoff.
31. Update sync adds only events on/after that activation calendar day; older timeline events remain visible in Updates but are never backfilled into a new account’s notification feed.
32. Added a notification-panel `↻` action for unsynced current/future events.
33. Notification selection marks the item read; update notifications reset filters, open Updates, scroll/focus the exact event, and briefly highlight the card.
34. Mark all read now updates the real notification array; unread badge/count comes from unexpired unread records.
35. Welcome/update/request-receipt notifications expire after 24 hours.
36. The state normalizer recognizes a future `ad` type with a 72-hour lifetime, but no fake ad item, AdSense script, or demonstration ad was added.

### Guest timeout and account transfer

37. Added `paragonArchive.guestInactiveSince.v1` and a 30-minute timeout.
38. `visibilitychange`, offline/online, and pagehide events mark/evaluate continuous absence.
39. Returning online/visible before 30 minutes cancels the pending expiry; expiry clears Guest session/state/draft/preferences and updates Account honestly.
40. Captured a live unexpired Guest state before Email/Google authentication instead of deleting it.
41. Added regression-safe merge behavior for:
   - bookmark union;
   - Guest review/vote transfer;
   - newest-per-site history union;
   - progress union;
   - Guest preference transfer;
   - collection merge with item union;
   - preservation of authenticated profile and notification identity.
42. The Guest state is removed only after the merged authenticated state saves successfully; a failed account load/save keeps the temporary source for retry rather than silently destroying it.
43. Guest request drafts are retained across successful Guest→account transfer so the authenticated user can submit the draft.
44. Updated Account/Help/integration copy to describe timeout, transfer, explicit end, and expiry accurately.

### Six achievements and About Achievements

45. Expanded Account achievements from five cards to six.
46. The first five requirements are First Visit, First Review, First Save, Progress Starter, and Collection Builder.
47. Final `More Soon` is disabled/locked until all five are complete, then changes to a selectable ready state and records its unlock timestamp when selected.
48. Replaced the old See all notice with `About Achievements`.
49. Added an accessible About Achievements dialog explaining all five tasks and the final prerequisite.

### Real request count and optional-email receipt routing

50. Replaced static `247` with zero-safe dynamic markup.
51. Added security-definer RPC `paragon_request_count()` that returns only the accepted request-row count and exposes no request/user fields to anonymous/authenticated callers.
52. Added `ParagonSync.getWebsiteRequestCount()` and request-page loading/refresh after accepted submission.
53. Kept contact-email requests on the idempotent `request-received` Brevo outbox path.
54. Extended the authoritative request trigger so blank contact email appends `We got your idea 💡 — Paragon Archive` to the authenticated user’s in-app notification array instead of queuing email.
55. No-email receipt records expire after 24 hours and display on the next Archive account-state load.
56. Updated request success copy, setup guides, schema defaults, and tests for both receipt routes.

### Help guide revision

57. Reordered the six guide steps exactly as confirmed:
   - Account `⚙️`;
   - Create Account `👤`;
   - Archive `◈`;
   - Open Website `🌐`;
   - Save `🔖`;
   - Stay Updated `↻`.
58. Updated each step’s text, screenshot placeholder label, Guest information, and current notification behavior without changing the FAQ/support backend.

### PWA, documentation, and regression protection

59. Advanced the service-worker cache to `paragon-archive-v28` and cached the local QR encoder.
60. Added the vendor file to export identity validation, SOP inventory/tree/load order/reconstruction rules, and the exact project manifest.
61. Updated Auth and Email integration guides for notification state, Guest transfer/expiry, live request count, and no-email in-app receipt.
62. Updated existing Help, Request, Auth, UI, and Search regression fixtures instead of creating a redundant suite.
63. Updated SOP progress, decisions D-072–D-079, P-028, known constraints, owner pass/fail CTA, activation tasks, and deferred work.

### Files created

- `vendor/qrcode.min.js`

### Files changed

- `paragon-archive.html`
- `paragon-request-website.html`
- `paragon-help-support.html`
- `style.css`
- `app.js`
- `request-website.js`
- `config/supabase.js`
- `auth/paragon-sync.js`
- `auth/INTEGRATION.md`
- `supabase/schema.sql`
- `supabase/functions/EMAIL-INTEGRATION.md`
- `service-worker.js`
- `tests/auth.test.js`
- `tests/help-support.test.js`
- `tests/request-website.test.js`
- `tests/ui-regression.test.js`
- `tests/search-navigation.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` All ten dependency-free regression suites passed.
- `[x]` JavaScript/MJS/vendor syntax checks passed; both JavaScript-compatible Edge TypeScript workers passed syntax transformation checks.
- `[x]` Custom Search fixture confirmed empty-query hiding, first-character display, maximum-ten cards, horizontal rail hooks, and removal of native autocomplete.
- `[x]` Local QR smoke test generated a 33-module scannable GIF data URI; Share/QR exact-detail URL regression passed even when a product URL exists.
- `[x]` Updates fixture passed all type filters, category/date exact intersection, honest no-match state, one-active-chip state, mirrored markers, and saved-site stars.
- `[x]` Notification static/dynamic fixtures confirmed welcome-first cutoff, 24/72-hour constants, no fake ad object, sync controls, and exact target hooks.
- `[x]` Guest merge fixture confirmed bookmark/collection/review/progress union while preserving authenticated profile state; timeout/listener/source protection assertions passed.
- `[x]` Achievement fixture rendered six items, changed final `More Soon` to ready only after five tasks, and persisted unlock on selection.
- `[x]` Request fixtures confirmed zero-safe markup, live aggregate client/RPC, email/no-email success paths, and database receipt branch.
- `[x]` Guide regression confirmed six exact labels/icons and six placeholders.
- `[x]` Responsive calculations passed all six owner target widths without horizontal overflow; owner-passed phone gutters remained unchanged.
- `[x]` All 43 project files returned HTTP 200 from a local server.
- `[x]` Every HTML page has unique IDs; all local HTML assets resolve; CSS braces balance.
- `[x]` Every HTML/CSS/JS/MJS/TS/SQL file has the correct export identity/path.
- `[x]` Credential-pattern scan found no service-role JWT, Brevo key, Google client secret, or Gmail secret; no password field/value was added, preserving the previously verified absence of the private creator password.
- `[x]` Canonical entry remains `paragon-archive.html`; no `index.html` exists.
- `[!]` No graphical browser engine is installed, so final 800–1440px appearance, swipe feel, QR camera scan, 30-minute lifecycle, and activated-Supabase behavior remain owner testing in CTA §13.

### Export handoff

64. Prepared `paragon-archive-export-v0.28.0.zip` from the complete 43-file project tree.
65. ZIP integrity and exact working-tree manifest comparison passed before the superseded v0.27.0 bundle was removed.
66. Workspace retention remains one working project plus one latest verified export.

### Result

The owner’s failed large-screen cases and accepted functional change set are implemented without altering approved Ratings & Reviews, navigation behavior, discovery behavior, or unrelated Detail content. Search is now in-site and swipeable, Share/QR open exact details, Updates and notifications are data-driven, live Guest work can transfer safely, achievements have the requested prerequisite, request proof is real/zero-safe, and the Help guide matches the confirmed order/icons.

---

## v0.29.0 — 2026-08-05 — Paragon Archive Hub documentation and honest launch foundations

**Request reference:** SOP §11, Prompt P-029  
**Status:** `[x]` public documentation/front-end completed; protected Community/Team/Deployed operations deferred

### Scope and truth boundary

1. Received the owner’s complete Archive Hub documentation covering Terms, Community Guidelines, Cookie Policy, developer requirements, Deployed hosting, roadmap, System Status, community membership, and the updated category list.
2. Implemented the supplied policy intent without publishing chronologically or operationally false claims.
3. Interpreted all Community Board, Q&A, suggestions, reporting, moderation, developer applications, trial projects, Team Gateway, Deployed upload/review/hosting, developer analytics, premium payments, membership email, and production incident monitoring as documented future operations.
4. Kept optional Analytics, tracking-cookie, advertising, and AdSense integrations disconnected and consent-gated.
5. Kept August 2027 launch/first-100 milestones planned on the current August 5, 2026 project date.
6. Replaced unsupported supplied 65/20/10 progress bars and `ALL SYSTEMS OPERATIONAL` with verifiable available-preview/prepared/limited/planned states.

### Dedicated Archive Hub page

7. Created `paragon-archive-hub.html` as the direct official Archive channel under the multi-page rule.
8. Added a responsive animated Hub hero, current-state banner, sticky horizontal section navigation, gateway links, and explicit public/protected implementation boundary.
9. Added independently linkable sections for:
   - Overview;
   - Terms and Conditions;
   - Community Guidelines;
   - Cookie Policy;
   - Developer Requirements;
   - Deployed Category;
   - Roadmap;
   - System Status;
   - Community Membership;
   - Category Families;
   - Team Gateway;
   - Documentation Completion.
10. Added direct gateway links to Request a Website, About, Privacy & Security, Help & Support, Terms, Status, Deployed documentation, and the future Team Gateway.

### Terms and Conditions

11. Published plain-language Terms effective August 1, 2026 and implementation-aware Last Updated August 5, 2026.
12. Included platform definition, account/security rules, acceptable use, prohibited conduct, reviews/community content, future Deployed rules, intellectual property, disclaimer, liability, enforcement/penalties, changes, appeals, and contact.
13. Preserved spam, abuse, harassment, doxxing, fraud, impersonation, phishing, security attack, injection, scraping, rate-limit bypass, malware, DoS, content, advertising, iframe, software-distribution, and resale prohibitions.
14. Corrected Account Termination so it does not claim secure self-service deletion already exists; Privacy/Support remains the honest request path until the protected workflow is activated.
15. Labelled Community and Deployed terms as launch policy rather than evidence that those systems are live.

### Community Guidelines and Cookie Policy

16. Published all ten Community policy areas: English-language initial policy, respect, constructive participation, honesty, topic relevance, privacy, anti-spam, reporting, consequences, moderation, and appeals.
17. Clarified that only Archive review UI exists now; Board/Q&A/Suggestions/report queue/membership/moderation are not launched.
18. Published the Cookie Policy using accurate `cookies and browser storage` terminology.
19. Documented essential state currently used by the app and future Analytics/tracking/ad categories.
20. Explicitly stated Google Analytics, tracking cookies, Google Ads, and AdSense are not connected and must respect `ParagonPrivacy` consent helpers before future loading.
21. Linked Cookie choices to the implemented Privacy Controls page.

### Developer and Deployed documentation

22. Published required/preferred/bonus developer skills, future application/review/trial/evaluation/acceptance steps, responsibilities, and removal rules.
23. Labelled applications, trials, protected Developer status, Team access, and badges as not open/not issued.
24. Added Deployed as a planned empty category without creating fake websites.
25. Published the ten supplied future subcategories:
   - Deployed Tools;
   - Creative;
   - Education;
   - Games;
   - Social;
   - Business;
   - Lifestyle;
   - Dev;
   - Media;
   - Other.
26. Published future user/developer process, review criteria, differences from Paragon products, website rules, premium transparency, developer maintenance, removal, and support responsibility.
27. Added clearly labelled illustrative—not real—Deployed card/detail/premium examples.
28. Avoided fabricated creators, live ratings, views, reviews, deployment totals, joined dates, analytics, payments, or support promises.

### Deployed form preview

29. Added the supplied form layout with website/creator name, 1,000-character description/counter, subcategory, free/premium choice, conditional premium disclosure, hosted URL, 50MB ZIP, PNG icon, 3–8 screenshots, contact email, four agreements, and review action.
30. Created `archive-hub.js` for:
   - live description count;
   - premium-field required/hidden state;
   - local ZIP/icon/screenshot validation;
   - selected-file size guidance;
   - local form readiness feedback;
   - current local timestamp;
   - active section navigation.
31. Form submission always prevents network activity and states that no data/files were sent; there is no fake upload or success.
32. Production submission remains dependent on protected authentication claims, private storage, malware/security review, moderation, publishing, and administration.

### Roadmap and System Status

33. Published August 2026 foundation as in progress.
34. Kept 2027 platform launch and first-100-live milestones planned rather than completed early.
35. Published Community, Developer/Deployed, mobile, websites 101–200, multi-language, desktop, RxLife Network, Pharmapaedia, more platforms, and Paragon Ecosystem as planned/concept/long-term items.
36. Published honest System Status cards:
   - Core front end — available preview;
   - iframe — available with browser-policy limitations;
   - Auth and Database — prepared, Supabase activation pending;
   - Updates — available preview;
   - Community and Deployed — not launched;
   - notifications/email — partly prepared, provider activation pending.
37. Replaced the supplied unsupported “no incidents in 30 days” with an explicit statement that no production incident monitor/feed is connected.
38. Added System Status direct-email reporting.

### Community membership, categories, and Team Gateway

39. Published the future six-step account/guidelines/email/profile/community membership flow.
40. Labelled membership records, badges, boards, beta invitations, monthly email, and credits as unavailable until backend launch.
41. Published the eleven broad category-family table while preserving the Archive’s existing granular visible category labels.
42. Added `🚀 Deployed` to Archive Browse by Category with `status: planned` and an honest no-sites state linking back to Hub documentation.
43. Added no Deployed catalogue record, preserving a zero-third-party-site state.
44. Applied the latest supplied `🌟` to Originals category-family discovery while retaining the sole Archive Hub website’s distinct `◈` product icon.
45. Added a locked Team Gateway explanation requiring protected Supabase claims/server authorization; no creator-email admin bypass or secret was introduced.

### Catalogue, navigation, and PWA integration

46. Connected the existing Paragon Archive Hub catalogue record to `paragon-archive-hub.html` through `siteUrl`.
47. Updated Hub catalogue features and release to `v1.1 — Aug 5, 2026`, producing an honest current Updates event.
48. Preserved Share/QR behavior so those actions still point to the exact Archive detail while OPEN/New Tab loads the Hub page.
49. Replaced the Archive footer’s pending Terms button with the real Hub Terms anchor.
50. Added Archive Hub and Terms to Account Settings and to Archive/About/Help/Request/Privacy footers.
51. Added Hub page/script to the PWA shell and advanced cache to `paragon-archive-v29`.

### Responsive visual system

52. Added shared Hub styles for hero, navigation, documentation cards, policy grids, tables, gateway cards, developer process, sample Deployed surfaces, form controls, roadmap, status, membership, Team lock, and completion matrix.
53. Kept wide-screen body usage aligned with P-028.
54. Responsive calculations produced Hub shells of:
   - 340px at Galaxy S5 360px;
   - 373px at Pixel 7 393px;
   - 768px at Galaxy Tab 800px;
   - 777.6px at Tab S6 Lite 810px;
   - 1311.4px at 1366px laptop;
   - 1384px at 1440px MacBook.
55. Gateway cards collapse from four to two to one columns; policy tables and section navigation scroll internally instead of overflowing the page.

### Regression and governance

56. Created `tests/archive-hub.test.js` covering all documentation parts, dates, truth-state boundaries, ten Deployed subcategories, form fields/limits, no-fake-operation rules, catalogue destination, planned empty category, cross-page links, PWA assets, unique IDs, counter/premium behavior, ZIP limit, and screenshot count.
57. Extended UI export-identity coverage for the Hub page/script/test.
58. Updated catalogue governance for the latest `🌟` Originals-family icon while preserving Hub `◈` identity and sole-Originals membership.
59. Updated SOP inventory, reconstruction manifest/load order, progress, architecture, decisions D-080–D-085, P-029, known constraints, CTA testing, completed Terms content, and future protected backend work.

### Files created

- `paragon-archive-hub.html`
- `archive-hub.js`
- `tests/archive-hub.test.js`

### Files changed

- `paragon-archive.html`
- `paragon-about.html`
- `paragon-help-support.html`
- `paragon-request-website.html`
- `paragon-privacy-security.html`
- `style.css`
- `app.js`
- `data/catalogue-expansion-45-100.js`
- `service-worker.js`
- `tests/catalogue-governance.test.js`
- `tests/ui-regression.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` All eleven dependency-free regression suites passed.
- `[x]` Every JS/MJS/vendor file passed syntax checking; JavaScript-compatible Edge TS checks remained passing.
- `[x]` Archive Hub contains all supplied documentation groups and independently linkable section IDs.
- `[x]` Hub test confirmed ten Deployed subcategories and every supplied form field/constraint.
- `[x]` Dynamic form fixture confirmed the 1,000-character counter, premium-required state, 50MB ZIP limit, and 3–8 screenshot limit.
- `[x]` Static audits found no `ALL SYSTEMS OPERATIONAL`, fake current Community/Deployed operation, unsupported 65/20/10 bars, fake incident-free claim, or immediate account-deletion claim.
- `[x]` No Deployed website record exists; the planned category displays an honest empty state.
- `[x]` Archive Hub catalogue OPEN destination, Account/footer links, and Hub Terms anchor passed.
- `[x]` All six HTML pages have unique IDs; Hub contains 44 unique IDs.
- `[x]` CSS braces balance; local files and non-SPA HTML anchors resolve.
- `[x]` All 46 project files returned HTTP 200.
- `[x]` Credential-pattern scan found no service-role JWT, Brevo key, Google client secret, or other committed provider secret.
- `[x]` Canonical entry remains `paragon-archive.html`; no `index.html` exists.
- `[!]` No graphical browser engine is installed, so final Hub typography, horizontal navigation/table scrolling, form ergonomics, and Archive iframe presentation remain owner device testing.
- `[!]` Terms/Community/Deployed wording should receive appropriate production legal review before public launch.

### Export handoff

60. Prepared `paragon-archive-export-v0.29.0.zip` from the complete 46-file project tree.
61. ZIP integrity and exact working-tree manifest comparison passed before removing v0.28.0.
62. Workspace retention remains one working project plus one latest verified export.

### Result

Paragon Archive Hub is now a complete public documentation and gateway page connected to the Archive catalogue, Account, footers, and PWA shell. The owner’s policies, developer/Deployed design, roadmap, status, membership, and category vision are published without pretending that protected or future systems are already operational.

---

## v0.30.0 — 2026-08-05 — Hub consolidation, complete responsive surfaces, footer-safe navigation, simplified Search, Updates pagination, and interaction cleanup

**Request reference:** SOP §11, Prompt P-030  
**Status:** `[x]` implemented; owner physical-device and activated-provider confirmation pending

### Owner results and confirmed choices

1. Recorded all six outer resolution/background-fit checks as owner-passed: Galaxy S5, Pixel 7, Galaxy Tab, Tab S6 Lite, laptop, and MacBook.
2. Retained a new owner test requirement for previously narrow inner surfaces: Search, Account, all See-all overlays, category listings, Updates, and every Hub section/form.
3. Applied four explicit clarification choices:
   - Hub consolidation: `hub-only`;
   - bottom navigation: `shift-above` at large widths;
   - achievements: recommended five-task mapping plus Progress Starter for final unlock;
   - arrow cleanup: remove textual arrows only and retain essential carousel/lightbox chevrons.

### Footer-safe bottom navigation

4. Replaced the all-width footer intersection hide rule with width-aware behavior.
5. Below 700px, footer visibility continues to hide bottom navigation so phone footers are not covered.
6. At 700px and above, measured the visible footer height and moved the fixed navigation to `visible footer height + 12px`.
7. Added scroll, resize, and IntersectionObserver refresh paths.
8. Large-screen navigation remains visible and usable when the entire page/footer fits inside one viewport.
9. Added bottom-position animation and shifted-state shadow while preserving the approved navigation design.

### Responsive inner surfaces

10. Expanded Search inner width to the shared 1600px page cap at widths 700px+.
11. Expanded Trending, Staff, Recent, and category discovery overlay shells to the available shared width.
12. Kept Account sections, stats, collections, reviews, history, and settings at full main-wrapper width.
13. Consolidated Hub sections use the full Hub shell rather than nesting the former standalone page-width caps.
14. Added two-column Search results on wide screens while preserving single-column phones/tablets.
15. Static width calculations remained non-overflowing at all six owner targets.

### Simplified Search and recent history

16. Removed Search category-filter chips and Search Browse by Category controls from HTML and controller logic.
17. Empty Search no longer renders the whole catalogue; it shows recent history when available.
18. Added up to eight deduplicated recent phrases with most-recent-first order, selection, and Clear.
19. Signed-out/authenticated recent searches use device-local storage; Guest recent searches use session storage and clear on Guest end.
20. Recent phrases are recorded on Enter and when a Search result/autocomplete item is opened.
21. Preserved weighted name/category/tag/description/About/feature matching as the current transparent non-AI bridge.
22. Added autocomplete and full-results no-match messages with direct `paragon-archive-hub.html#request-site` actions.
23. Added recent searches to Download My Data and disclosed device/session storage in Privacy.
24. Added full future AI/intent Search architecture—indexing/embeddings, safe proxy, confidence, typos, privacy, abuse controls, evaluation, fallback—to CTA without exposing an API key or pretending AI exists now.

### Updates ten-item pagination

25. Added exact post-filter pagination state with `updatePageSize = 10`.
26. Type, category, and date still intersect before pagination.
27. Initial and newly filtered timelines show at most ten entries.
28. View more reveals at most the next ten; when fewer remain it reveals only the remainder.
29. Pagination/remaining status hides when ten or fewer matching entries exist.
30. Every filter change resets the visible limit to ten.
31. Notification targeting automatically expands the visible batch far enough to render and focus the exact target update.

### Detail Link/QR and sharing

32. Removed the duplicate direct Share toolbar button from every dynamic detail.
33. Replaced the former QR glyph with `🔗` and labelled it Link & QR options.
34. Kept QR, Copy Link, and Share inside the existing panel, all targeting the exact Archive detail.
35. Copy/share completion now records `firstShareAt` for the First Share achievement when a personal session exists.
36. Kept the local QR generator and product OPEN/New Tab separation unchanged.

### Notification advertising foundation

37. Preserved normal 24-hour notification expiry.
38. Extended the existing 72-hour future record handling to both `ad` and `promotion` types.
39. Added visible `Sponsored notification`/`Paragon promotion` disclosure and 72-hour label when such a protected record eventually exists.
40. Added no fake campaign, public Team creator, targeting, action monitoring, or AdSense script.
41. Expanded CTA for protected Team claims, campaign approval/IDs, consent, click/action analytics, fraud prevention, and cleanup.

### Achievement remap and layout

42. Replaced the first-five task mapping with:
   - First Visit;
   - First Review;
   - First Rating;
   - First Share;
   - Continue with Google or Email.
43. Moved Progress Starter into the final More Soon prerequisite.
44. More Soon becomes selectable only after all five tasks and at least one product-progress entry exist.
45. Updated About Achievements wording and icons.
46. Rebuilt the achievement grid as three columns by two rows, including compact Galaxy S5 sizing.
47. Preserved final unlock timestamp persistence and Guest→account transfer of safe share/final achievement metadata.

### Exclusive collection membership

48. Changed Add to Collection into choose/move behavior.
49. Adding a website to an existing collection removes it from every other collection first.
50. Creating a new collection from the detail picker moves the selected website directly into it.
51. Picker labels now distinguish Current from Move here.
52. Added load-time legacy duplicate cleanup and Guest/account merge duplicate cleanup.
53. Preserved collection removal, deletion, Guest storage, and authenticated sync paths.

### Top appearance control and textual-arrow cleanup

54. Replaced the top Account/Profile control with synchronized moon/sun appearance control.
55. Account remains accessible from bottom navigation.
56. Top and Account Dark Mode controls share the same theme/storage/state path and update each other after changes.
57. Removed visible textual `←`, `→`, and `↗` from Back, Open, See all, View more, settings, history, Related, hero, and similar action labels.
58. Kept essential SVG previous/next controls for hero, screenshots, and lightbox navigation.
59. Changed Hub `Archive` top action to plain `Back` using browser history with Archive fallback.

### Conditional long-form disclosure

60. Added automatic conditional disclosure to long Hub Terms/Community/Cookie/Developer/Deployed cards, integrated About sections, Privacy sections, Help introductions/FAQ/docs, and the Request introduction.
61. Long content starts at a 220px masked height with Show details/Hide details.
62. Short content measures below the threshold and receives no unnecessary toggle.
63. Request, Support, Privacy controls, Deployed form, critical statuses, and primary actions remain immediately usable.
64. Existing Detail About Read more continues to appear only when actual text overflow exists.

### Hub-only consolidation and code reduction

65. Moved the complete About, Privacy & Security, Help & Support, and Request a Website bodies into anchored Hub sections:
   - `#about`;
   - `#privacy-policy`;
   - `#help`;
   - `#request-site`.
66. Terms remained at the existing Hub `#terms` anchor.
67. Updated Hub navigation and gateway cards for all consolidated anchors.
68. Merged the Request and Help controllers into isolated modules inside `archive-hub.js`.
69. Retained `privacy.js` as a shared core module because both the canonical Archive and Hub require the same consent/preferences API.
70. Updated Hub script order to config → auth → sync → privacy → archive-hub.
71. Added Hub cookie banner and retained inline Privacy controls/data export.
72. Removed six superseded files:
   - `paragon-about.html`;
   - `paragon-privacy-security.html`;
   - `paragon-help-support.html`;
   - `paragon-request-website.html`;
   - `help-support.js`;
   - `request-website.js`.
73. Reduced the project from 46 to 40 files while preserving every functional form, FAQ, guide, policy, story, backend schema, Edge function, and integration guide.
74. Updated every Account/footer/Search/FAQ/privacy/support route to Hub anchors.
75. Removed all superseded pages/scripts from service-worker v30.
76. Kept `paragon-archive.html` as the canonical application entry and created no `index.html`.

### Request acceptance and flow audit

77. Preserved the owner-approved Request form, count, email/in-app receipt choice, Guest draft, account requirement, and authoritative rolling-seven-day database trigger.
78. Live account submission remains owner-testable only after Supabase activation; no weaker browser-only bypass was introduced.
79. Preserved Support form Edge/private screenshot/rate-limit behavior after consolidation.
80. Updated Support integration documentation to the Hub route/controller.

### Regression and governance

81. Retargeted About, Privacy, Help, Request, Email, Catalogue, Hub, and UI tests to consolidated Hub source/controllers.
82. Expanded Search tests for removed category controls, empty-query state, recent history, and no-match Request route.
83. Expanded UI tests for ten/next-ten pagination, conditional View more, exclusive collection moving, Link/QR toolbar cleanup, new achievement mapping, Team ad/promotion preparation, top theme markup, arrow removal, and large-screen footer-shift hooks.
84. Expanded Hub tests for all consolidated anchors, script order, disclosure/short-content suppression, removed files, and arrow cleanup.
85. Updated SOP inventory, exact reconstruction manifest, architecture exception, progress, D-039/D-059/D-062/D-067/D-069 status, decisions D-086–D-094, P-030, known constraints, and CTA.

### Files removed

- `paragon-about.html`
- `paragon-privacy-security.html`
- `paragon-help-support.html`
- `paragon-request-website.html`
- `help-support.js`
- `request-website.js`

### Files changed

- `paragon-archive.html`
- `paragon-archive-hub.html`
- `style.css`
- `app.js`
- `archive-hub.js`
- `privacy.js`
- `service-worker.js`
- `supabase/functions/SUPPORT-INTEGRATION.md`
- `tests/about.test.js`
- `tests/archive-hub.test.js`
- `tests/catalogue-governance.test.js`
- `tests/email.test.js`
- `tests/help-support.test.js`
- `tests/privacy.test.js`
- `tests/request-website.test.js`
- `tests/search-navigation.test.js`
- `tests/ui-regression.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` All eleven dependency-free regression suites passed.
- `[x]` Every JS/MJS/vendor syntax check passed; JavaScript-compatible Edge TS checks remained passing.
- `[x]` SOP reconstruction manifest exactly matched all 40 project files.
- `[x]` Both remaining HTML pages have unique IDs: 161 Archive IDs and 132 static Hub IDs before generated disclosures.
- `[x]` All local file routes and non-SPA anchors resolve; no link points to a removed page/script.
- `[x]` Active HTML/JS contains no textual `←`, `→`, or `↗` glyph.
- `[x]` CSS braces balance.
- `[x]` Responsive calculations passed 360, 393, 800, 810, 1366, and 1440px widths for Archive main, Hub, Search, and overlays.
- `[x]` Updates fixture rendered exactly 10, then 20, and hid pagination for a one-result filter.
- `[x]` Collection fixture confirmed one website moved from its old collection and existed in exactly one destination.
- `[x]` Search fixture confirmed recent phrases, empty-query state, first-character autocomplete, no-match Request route, and descriptive matching.
- `[x]` Achievement fixture confirmed the five new tasks plus Progress Starter final prerequisite and unlock persistence.
- `[x]` All 40 project files returned HTTP 200.
- `[x]` Credential-pattern scan found no service-role JWT, Brevo key, Google client secret, or committed provider secret.
- `[x]` Canonical entry remains `paragon-archive.html`; no `index.html` exists.
- `[!]` No graphical browser engine is installed, so large-screen footer shifting, full-width inner surfaces, disclosure ergonomics, consolidated Hub length, and top-theme visuals remain owner device testing.
- `[!]` Live Google/Email/request/support/email behavior still requires the owner’s Supabase/Brevo activation.

### Export handoff

86. Prepared `paragon-archive-export-v0.30.0.zip` from the complete 40-file project tree.
87. ZIP integrity and exact working-tree manifest comparison passed before removing v0.29.0.
88. Workspace retention remains one working project plus one latest verified export.

### Result

All outer resolutions remain passed, and the remaining inner surfaces now follow the same responsive width system. The Archive is less repetitive and easier to navigate: public pages are consolidated into Hub, Search is focused and remembers recent phrases, Updates reveal ten at a time, collections are exclusive, achievements reflect the new tasks, appearance is available at the top, and text actions no longer carry decorative arrows.

---

## v0.31.0 — 2026-08-05 — Iframe completion, Search Results/hints, shared product previews, staged achievements, return-to-intent, AI Brain, and portable handoff

**Request reference:** SOP §11, Prompt P-031  
**Status:** `[x]` implemented; owner device/provider/AI decisions and portable re-import confirmation pending

### Owner results and remaining responsive issue

1. Recorded Galaxy S5, Pixel 7, Galaxy Tab, Tab S6 Lite, general Hub, PWA, catalogue/details, exclusive collections, conditional disclosure, and textual-arrow cleanup as owner-passed.
2. Isolated remaining responsive concerns to Archive Hub inside iframe at laptop `1366×768` and MacBook `1440×900`, plus mobile Preview New Tab visibility.
3. At widths 1200px+, removed iframe overlay padding and made the preview shell full-width/full-`100dvh` with no rounded outer gap.
4. On mobile, restored Open in New Tab beside close and added compact header/title/button sizing rather than hiding the action.

### Two-stage Search and inline hinting

5. Rebuilt Search into two explicit modes:
   - Search input/autocomplete/recent history;
   - Enter-driven Search Results.
6. Pressing Enter records the query and replaces the input surface with a Play-Store-style Results list.
7. No-match/Request guidance now exists only in Results.
8. Autocomplete disappears silently when nothing matches; it no longer displays the no-match card.
9. Replaced duplicate Search Back/X actions with one styled Back control.
10. Back from Results returns to the Search input; Back from Search closes to the preserved Website context.
11. Preserved Results/input mode inside detail navigation state so Detail Back restores the exact Search side.
12. Added deterministic inline name completion inside the input:
   - product suffixes unless `Paragon` is typed;
   - case-insensitive matching while preserving typed case;
   - longest common next portion across candidates;
   - no hint when candidates diverge immediately;
   - explicit acceptance with Tab or ArrowRight at the caret end;
   - no silent overwriting.
13. Kept weighted local descriptive matching, recent history, exact-detail opening, and no-match Request route.

### Theme action correction

14. Corrected top appearance semantics:
   - default/dark environment displays the sun icon as the action to switch light;
   - light environment displays the moon icon as the action to switch dark.
15. Updated initial HTML state and runtime synchronization together so icon and environment change in the same interaction.
16. Preserved Account Dark Mode control, storage, Guest/authenticated preferences, and Theme Explorer achievement counting.

### Updates page-replacement pagination

17. Replaced cumulative `10 → 20 → 30` rendering with one ten-item page at a time.
18. View more advances to the next filtered ten and removes the previous ten from the rendered timeline.
19. Added Previous to restore the prior ten.
20. Kept button labels plain `View more` and `Previous`.
21. Added page/range status and a smaller final page when fewer than ten remain.
22. Pagination hides when one page is sufficient.
23. Type/category/date changes reset to page one.
24. Notification targeting selects the exact page containing the target update before focus/scroll.

### Three-line Detail About behavior

25. Changed collapsed Detail About from four rendered lines (`6.4em`) to three (`4.8em`).
26. Added a three-line line clamp plus existing measured overflow check.
27. Read more is hidden when the full text already fits; Show less returns expanded content to exactly three lines.

### Key Features, Version History, Timeline, and Review pagination

- Added three-item conditional lists to Detail Key Features and Version History.
- Features/history beyond item three remain hidden until Read more; no control renders when three or fewer exist.
- Added three-line clamp plus measured Read more/Show less to every Updates timeline description.
- Added review pagination after current sort/star filtering with ten reviews per page.
- Default Most Recent order places the newest ten on page one; review eleven/twelve and later records move to page two.
- Added Previous/View more page replacement, range status, smaller final page, filter reset to page one, and pagination hiding when ten or fewer match.

### Return-to-intent identity flow

28. Added session key `paragonArchive.pendingPersonalIntent.v1`.
29. Before a signed-out personal action opens Account, stored:
   - allowlisted intent type/payload;
   - current detail;
   - source tab;
   - scroll position;
   - detail navigation history;
   - creation timestamp.
30. Pending intents expire after 30 minutes and are removed before execution.
31. Added safe resumable actions for Review, Bookmark, Collection, review Vote, and in-shell Request.
32. Guest activation, same-page Email activation, OAuth return/current-session initialization all attempt safe resumption after identity/state rendering.
33. Resumption restores exact detail/tab/scroll and prior detail-history stack before reopening the requested UI or applying the allowlisted action.
34. No arbitrary function name, script, URL, or untrusted callback is executed from stored intent data.

### Staged achievements

35. Replaced the single six-item/final-lock model with 22 concrete tasks grouped as 5 + 5 + 5 + 5 + 2.
36. Stage one contains First Visit, First Rating, First Review, First Share, and Google/Email.
37. Progress Starter is the first task in stage two and is not required to unlock stage two.
38. Added later available-behavior tasks for saves, collections, review voting, visits, reviews, progress, five-star rating, sharing, theme switching, recent Search, notification reading, veteran visits, and trusted reviewing.
39. Added `accountProfile.achievementStage` persistence and safe Guest/account maximum-stage merge.
40. More Soon becomes ready only after the current visible group is complete.
41. Clicking ready More Soon increments the stage and reveals the next group.
42. More Soon and stage summary display real completed/total/remaining counts; the final stage contains only two tasks and no extra lock.
43. Added share count, theme switch count, and public-notification read metadata to personal state/Guest merge rules.

### Guest advertising notifications

44. Added empty governed `window.ParagonPublicNotifications` source in `data/updates.js` for future protected Team delivery.
45. Public feed accepts only `ad` and `promotion` record types.
46. Guest notification rendering ignores private welcome/update state and reads only unexpired public ads/promotions.
47. Authenticated users may see public campaigns in addition to private welcome/updates.
48. Added per-account/Guest-session public campaign read map without copying public campaign bodies into personal notification state.
49. Kept sponsored/promotion disclosure and 72-hour expiry.
50. No fake campaign or public Team authoring/action tracking was created.

### Shared product previews for the catalogue

51. Created `paragon-product-preview.html` and `product-preview.js`.
52. Assigned every unfinished catalogue record a URL-safe shared preview destination `paragon-product-preview.html?site=...` and `previewOnly: true`.
53. Preserved Paragon Archive Hub’s real `paragon-archive-hub.html` destination.
54. Added category-aware mock workspaces for Education, Games, Media/Entertainment, Finance, Health/Lifestyle, Social, Creative, and general Tools/Developer products.
55. Rendered each preview from real catalogue name, icon, group, category, description/About, tags, and feature lists.
56. Added prominent `Not the final production website`, `Concept preview`, and `Preview only` labels.
57. Added safe Archive-detail links and avoided fake live data, transactions, users, ratings, or production claims.
58. Added responsive shared preview styling and PWA/offline shell coverage.
59. Archive iframe title now appends `Concept Preview` for preview-only destinations.

### AI Brain — third document

60. Created `docs/AI-BRAIN.md` as the owner-requested third document beside SOP/EOP.
61. Explicitly stated it is governed knowledge and a future implementation blueprint, not a trained foundation model or connected AI service.
62. Documented source precedence, current system status, user intents, hybrid lexical/semantic/rule retrieval, ranking/confidence, inline hinting, response schema, hallucination rules, backend/API endpoints, key protection, prompt-injection isolation, privacy/retention, evaluation metrics, operations, updating, and open owner decisions.
63. Generated a complete internal table for all 106 current catalogue records with group, category, purpose, features/evidence, and destination state.
64. Added platform, identity, collection, achievement, notification, Request/Support, policy, and handoff knowledge.
65. Kept AI provider, model/runtime, budget, query retention, languages, safety boundaries, and production deployment in CTA for owner decisions.

### Portable one-file handoff

66. Added the v0.31.0 portable artifact design as a standalone JSON outside the project tree to prevent recursive self-embedding.
67. Portable JSON contains format/version, canonical entry, restore instructions, a ready Python restoration script, and every project file with relative path, byte length, SHA-256, encoding, and encoded content.
68. Text files use UTF-8 content; binary assets use Base64.
69. Another agent can reconstruct the full tree from this one upload and verify every checksum even when ZIP import is unavailable.
70. Kept the folder-preserving ZIP as the conventional download/export alongside the portable artifact.

### PWA, regression, and governance

71. Advanced service worker to `paragon-archive-v31` and cached shared product preview assets.
72. Created `tests/product-preview.test.js` for preview route coverage, Hub destination protection, honest rendering, Brain completeness, and PWA files.
73. Expanded Search tests for two modes, single Back, mixed-case inline hint, hint acceptance, silent autocomplete no-match, Results no-match, and Results-mode Back restoration.
74. Expanded UI tests for replacement pagination/Previous, corrected theme icon mapping, staged achievements, Guest ad-only visibility, return-to-intent Guest resumption, three-line About, full iframe shell, and mobile New Tab.
75. Updated SOP inventory, manifest/load order, D-003/D-089/D-090 status, decisions D-095–D-104, P-031, progress, constraints, CTA, and the third-document rules.

### Files created

- `paragon-product-preview.html`
- `product-preview.js`
- `tests/product-preview.test.js`
- `docs/AI-BRAIN.md`

### Files changed

- `paragon-archive.html`
- `style.css`
- `app.js`
- `data/catalogue-expansion-45-100.js`
- `data/updates.js`
- `service-worker.js`
- `tests/archive-hub.test.js`
- `tests/search-navigation.test.js`
- `tests/ui-regression.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Validation

- `[x]` All twelve dependency-free regression suites passed.
- `[x]` Every JS/MJS/vendor syntax check passed; JavaScript-compatible Edge TS checks remained passing.
- `[x]` Mixed-case hint fixture preserved `rEsu` and completed it to `rEsume` only after acceptance.
- `[x]` Autocomplete no-match rendered nothing; Results no-match rendered Request guidance.
- `[x]` Search Results mode and two-stage Back restoration passed.
- `[x]` Updates rendered first ten, replacement second ten, Previous-restored first ten, and conditional one-page filters.
- `[x]` Review fixture rendered newest ten, moved review eleven/twelve to a two-item second page, restored Previous, and applied star/sort filtering before pagination.
- `[x]` Key Features/Version/Timeline conditional disclosure hooks and three-line measurement passed static/dynamic audits.
- `[x]` Stage one unlocked stage two without Progress; Progress Starter appeared first in stage two.
- `[x]` Guest feed rendered a protected ad fixture while excluding welcome/update records.
- `[x]` Pending-intent fixture returned Guest to the prior Paragon Notes detail and cleared the intent.
- `[x]` Every unfinished catalogue website received the shared preview route; Hub retained its real destination.
- `[x]` Product preview rendered catalogue content with explicit preview honesty.
- `[x]` AI Brain contained every current catalogue website and all required architecture/safety sections.
- `[x]` Both application pages and shared preview page had unique IDs; local routes/anchors resolved.
- `[x]` CSS braces and responsive calculations passed at all six target widths.
- `[x]` All current project files returned HTTP 200.
- `[x]` Credential-pattern scan found no service-role JWT, provider key, client secret, or private creator password value.
- `[x]` Canonical entry remained `paragon-archive.html`; no `index.html` was created.
- `[!]` No graphical browser engine is installed, so laptop/Mac Hub iframe fill, mobile New Tab, inline hint visual alignment, theme icon transition, shared product previews, and staged achievement ergonomics remain owner device testing.
- `[!]` AI remains documentation/local retrieval preparation only until the owner selects and activates a secure backend/model/provider.

### Export handoff

76. Prepared `paragon-archive-export-v0.31.0.zip` from the complete current project tree.
77. Prepared `paragon-archive-portable-v0.31.0.json` as the one-upload reconstruction artifact.
78. Verified ZIP and portable manifests/checksums before removing v0.30.0.
79. Workspace retention becomes one working project, one latest ZIP, and one latest portable JSON by explicit owner request.

### Result

The remaining preview and navigation issues are implemented. Search now behaves as an input/autocomplete surface followed by a separate Results side, theme icon meaning is correct, Updates moves between ten-item pages, personal actions return after identity completion, achievements unlock in stages, Guest sees only future sponsored notices, every unfinished website has a useful honest iframe preview, and the project now has both a comprehensive AI Brain and a one-file agent handoff format.

---

## v0.32.0 — 2026-08-05 — Secure one-core Paragon AI Search and Website Detail Q&A foundation

**Request reference:** SOP §11, Prompt P-032  
**Status:** `[x]` secure local first release completed; external model/backend and future product modes pending

### Uploaded source identification and audit

1. Read `/home/user/uploads/paragon-archive-ai.md` and confirmed it was JavaScript, not Markdown documentation.
2. Treated it as an untrusted feature prototype rather than renaming/shipping it unchanged.
3. Identified browser-security and honesty problems:
   - embedded token-like BuildPico value;
   - browser-local Groq/Gemini/OpenRouter key storage;
   - direct browser calls to Groq, Gemini, OpenRouter, BuildPico, Pollinations, Wikipedia, translation, image, voice, and TTS services;
   - incomplete hard-coded catalogue while claiming 106 records;
   - fake Request submission alerts disconnected from the authoritative Supabase seven-day limit;
   - unrestricted generated HTML iframe preview;
   - premature broad chat/image/voice/code/translation features;
   - model availability claims without configured providers.
4. Did not copy any token-like value or browser provider-key workflow into the governed project.
5. Removed the raw uploaded prototype after secure migration so it cannot be accidentally shipped.

### One AI core and mode registry

6. Created `/ai/paragon-archive-ai.js` with the required export identity/path header.
7. Implemented one `ParagonAI` core and an allowlisted mode registry.
8. Activated only:
   - `archive-search`;
   - `website-detail`.
9. Reserved but disabled:
   - Tutor;
   - general product mode;
   - code;
   - image;
   - voice.
10. Documented that future products reuse the same core with different governed context/tool permissions rather than creating unrelated AIs.

### Secure local Search intelligence

11. Read current `window.ParagonSites` instead of a stale duplicated catalogue.
12. Added normalization, tokenization, stop words, reviewed concept rules, Levenshtein typo tolerance, weighted field evidence, confidence, and human-readable match reasons.
13. Indexed current name/suffix, category, group, tag, purpose, About, features, and updates at runtime.
14. Added governed intent concepts for CV/resume, homework/Tutor, exams, ambient sound, creative drawing/design, color, coding, deployment, finance/budget/investment, health/fitness, recipes, social/chat, games, weather, notes, and journal/reflection.
15. Archive Search now delegates to `ParagonAI.rankWebsites()` first and retains the prior weighted local matcher as a graceful fallback.
16. Verified messy CV wording ranks Paragon Resume first.
17. Verified typo-filled homework wording finds Paragon Tutor.
18. Verified vague calm/rain/sleep wording ranks Paragon Sounds first.
19. Unknown intent returns a Request-a-Website recommendation instead of inventing a product.

### Grounded Website Detail Q&A

20. Added a new accessible `Paragon AI — Website Detail mode` dialog to `paragon-archive.html`.
21. Added `Ask Paragon AI` to every dynamic Detail About heading.
22. Scoped each session to the currently open website.
23. Added local grounded answers for:
   - purpose/About;
   - features;
   - category/group;
   - version/updates;
   - live/preview status;
   - free/premium policy;
   - iframe/New Tab behavior.
24. Default answers summarize current catalogue evidence and list the supported question types.
25. Concept-preview answers explicitly state the product is not a completed production website.
26. Unsupported/general questions remain bounded to current website knowledge rather than using fabricated world knowledge.
27. Added keyboard Escape, backdrop close, focus, accessible live messages, 600-character input limit, responsive dialog, and theme support.
28. Added no image generation, voice, translation, unrestricted code execution, fake Request form, or provider-success UI.

### Future protected inference boundary

29. Added public configuration fields:
   - `aiEndpoint: ""`;
   - `aiEnabled: false`.
30. Added no API key or provider credential to configuration.
31. `ParagonAI.getConfiguration()` reports external inference disabled and browser provider secrets false.
32. Future model inference remains restricted to a protected same-origin/Supabase backend endpoint with server-held secrets, rate limiting, validation, safety, retention, and monitoring.

### AI Brain integration

33. Extended `docs/AI-BRAIN.md` with one-core/multi-mode architecture.
34. Added an explicit security audit of the uploaded prototype.
35. Documented why direct browser provider keys/calls, fake submissions, unsafe code previews, and unsupported provider claims must not return.
36. Added the first active-release contract for Search and Website Detail.
37. Kept Tutor/product activation dependent on each real product, curriculum/context, tool authorization, safety rules, and protected backend.

### Integration, PWA, and cleanup

38. Loaded `ai/paragon-archive-ai.js` after catalogue/metrics data and before `app.js`.
39. Added AI overlay styling to the shared visual system.
40. Added AI overlay cleanup to global transient-UI navigation.
41. Advanced service worker to `paragon-archive-v32` and cached the AI core.
42. Removed `/home/user/uploads/` after migration, restoring the governed cleanup boundary.

### Regression protection

43. Created `tests/ai.test.js`.
44. Tested active/reserved mode states.
45. Tested messy, vague, and typo-filled Search intents.
46. Tested grounded feature and preview-status Detail answers.
47. Tested unknown-intent Request fallback.
48. Tested disabled external inference configuration.
49. Audited active AI source for forbidden direct provider endpoints, browser API-key storage names, token constant, and BuildPico/Pollinations code.
50. Updated UI export-header coverage for AI source/test.
51. Updated SOP inventory, manifest/load order, progress, decisions D-105–D-108, P-032, known constraints, CTA, AI Brain, and v0.32.0 handoff paths.

### Files created

- `ai/paragon-archive-ai.js`
- `tests/ai.test.js`

### Files changed

- `paragon-archive.html`
- `style.css`
- `app.js`
- `config/supabase.js`
- `service-worker.js`
- `docs/AI-BRAIN.md`
- `tests/archive-hub.test.js`
- `tests/ui-regression.test.js`
- `docs/SOP.md`
- `docs/EOP.md`

### Removed after migration

- `/home/user/uploads/paragon-archive-ai.md`
- `/home/user/uploads/`

### Validation

- `[x]` All thirteen dependency-free regression suites passed.
- `[x]` AI source and every JS/MJS/vendor file passed syntax checks.
- `[x]` AI core contained no direct Groq/Gemini/OpenRouter/BuildPico/Pollinations provider endpoint or browser provider-key storage.
- `[x]` AI Brain and live catalogue covered all 106 current records without a second hard-coded browser catalogue.
- `[x]` Search and Detail integration hooks loaded in correct order.
- `[x]` AI dialog IDs were unique and local links/assets resolved.
- `[x]` Service-worker v32 cached the safe AI module.
- `[x]` `/home/user/uploads/` was removed after migration.
- `[x]` All current project files returned HTTP 200.
- `[x]` Credential-pattern scan found no committed service-role JWT, provider API key, client secret, or private creator password value.
- `[x]` Canonical entry remained `paragon-archive.html`; no `index.html` was created.
- `[!]` Current AI is deterministic local retrieval/Q&A, not a trained external foundation model.
- `[!]` Real external model intelligence requires owner provider/runtime/budget/privacy decisions and protected backend deployment.

### Export handoff

52. Prepared `paragon-archive-export-v0.32.0.zip` from the exact project tree.
53. Prepared `paragon-archive-portable-v0.32.0.json` with exact paths, encodings, checksums, restoration instructions, and all project files.
54. Verified ZIP and portable reconstruction before removing v0.31.0 artifacts.

### Result

The uploaded disguised JavaScript prototype has been converted into a secure, governed one-core Paragon AI foundation. Search now has stronger intent/typo matching, every website detail can answer grounded questions locally, future Tutor/product modes share the same core, and no provider secret or fake multi-provider behavior is shipped to the browser.

---

## v0.32.1 — 2026-08-17 — Workspace reconstruction from renamed continuation uploads

**Request reference:** SOP §11, Prompt P-033  
**Status:** `[~]` reconstruction and validation complete; one source file missing from uploads and one fixture-date decision pending

### Executed actions

1. Read `docs/SOP.md` (all sections, rules P-001–P-014, §3A manifest, decisions through D-108, CTA §13) and `docs/EOP.md` (v0.1.0–v0.32.0) before any project action, per owner instruction.
2. Inventoried 45 uploaded project files delivered with changed extensions (`.js`→`.txt`; `.ts`, `.mjs`, `.sql`, `.webmanifest`, and one `.css`→`.md`; HTML, MD, and PNG intact).
3. Verified the internal `PARAGON ARCHIVE — EXPORT IDENTITY` header of every code/manifest file and used the recorded `EXPECTED PROJECT PATH` — not the uploaded filename — as the restore target, per SOP §3A.
4. Recreated `/home/user/paragon-archive/` with the exact §3A directory layout: root shell/scripts/styles, `ai/`, `assets/icons/`, `auth/`, `config/`, `data/`, `docs/`, `supabase/functions/_shared/`, `supabase/functions/send-transactional-email/`, `supabase/functions/submit-support-message/` (directory only — see risk), `tests/`, and `vendor/`.
5. Copied all 45 files unmodified to their manifest paths with correct real extensions; no content was edited, reformatted, or "fixed" during restoration.
6. Placed `SOP.md`, `EOP.md`, and `AI-BRAIN.md` under `docs/` per the manifest.

### Files restored

- 3 HTML pages, `style.css`, `manifest.webmanifest`, 2 PNG icons
- 16 root/module scripts and data files, `vendor/qrcode.min.js`
- `supabase/schema.sql`, `supabase/functions/_shared/email-templates.mjs`, `supabase/functions/send-transactional-email/index.ts`, 2 integration guides, `auth/INTEGRATION.md`
- 13 regression fixtures under `tests/`
- 3 governance documents under `docs/`

### Validation

- `[x]` `node --check` passed on all 16 non-test JavaScript files and `email-templates.mjs`.
- `[x]` `manifest.webmanifest` parses as valid JSON with `_fileIdentity` intact.
- `[x]` Export-identity headers of all restored files match the SOP §3A manifest paths exactly.
- `[x]` 10 of 13 regression fixtures pass: about, ai, archive-hub, auth, catalogue-governance, email, privacy, product-preview, request-website, search-navigation.
- `[!]` `tests/help-support.test.js` and `tests/ui-regression.test.js` fail only because `/supabase/functions/submit-support-message/index.ts` is absent from the uploads; both fixtures read that file from disk.
- `[!]` `tests/metrics-carousel.test.js` fails from fixture date staleness: fixed 2026-08-04 view timestamps are pruned by the eight-day `pruneState()` cutoff measured against real `Date.now()` (today 2026-08-17). Application behavior is unaffected because production views are recorded at current time. No change was made pending owner confirmation.

### Result

The complete project tree is reconstructed at the SOP working directory with verified paths, extensions, and syntax. The build is ready for continued work under the existing SOP/EOP governance.

### Remaining risk

- `/supabase/functions/submit-support-message/index.ts` must be re-supplied by the owner (upload renamed, e.g. `submit-support-message-index.md`); it was not recreated from scratch to avoid inventing unverified security-sensitive Edge Function code.
- Owner decision pending on the metrics-carousel fixture-date fix (test-only change; no application logic would be touched).

---

## v0.32.2 — 2026-08-17 — Metrics-carousel fixture freshness repair

**Request reference:** SOP §11, Prompt P-033 (owner confirmed the test-only fix)  
**Status:** `[x]` completed

### Executed actions

1. Replaced the fixture's fixed 2026-08-04/05 anchor dates with dates derived from the most recent Tuesday at 12:00 local time, preserving the original Tuesday-anchor/Monday-week semantics.
2. Rewrote the prior-week and next-week seeding loops to compute date keys through the exposed `metrics.getDateKey()` relative to the anchor's Monday instead of hard-coded `2026-07-27…2026-08-09` strings.
3. Touched only `tests/metrics-carousel.test.js`; no application, data, or style file changed.

### Files changed

- `tests/metrics-carousel.test.js`

### Validation

- `[x]` `node --check` passes.
- `[x]` Fixture passes on 2026-08-17 and is no longer sensitive to the eight-day `pruneState()` window on any future run date.
- `[x]` Full suite: 11 of 13 fixtures pass; `help-support` and `ui-regression` remain `[!]` blocked solely on the owner re-supplying `/supabase/functions/submit-support-message/index.ts`.

### Result

The ranking/metrics regression fixture is permanently date-safe with identical assertion coverage.

---

## v0.32.3 — 2026-08-17 — Missing support Edge Function restored; full suite green

**Request reference:** SOP §11, Prompt P-033 (owner re-supplied the overwritten upload)  
**Status:** `[x]` completed — reconstruction is now 46/46 files, matching SOP §3A exactly

### Executed actions

1. Received the two `index.ts` files re-uploaded as `.txt` (the originals had overwritten each other in a single export folder because they share a filename).
2. Verified both internal export identity headers: 7,687-byte file → `/supabase/functions/submit-support-message/index.ts`; 5,594-byte file → `/supabase/functions/send-transactional-email/index.ts`, consistent with the owner's screenshot paths and sizes.
3. Restored `supabase/functions/submit-support-message/index.ts` to its manifest path.
4. Confirmed the re-supplied `send-transactional-email/index.ts` is byte-identical to the previously restored copy; no change made.
5. Scanned the restored file for embedded credentials: none found; the service-role key is read only from `Deno.env`, per the reconstruction security rules.

### Files restored

- `supabase/functions/submit-support-message/index.ts`

### Validation

- `[x]` All 46 SOP §3A manifest files are present at their exact paths.
- `[x]` Full regression suite passes: 13 of 13 fixtures, including the previously blocked `help-support` and `ui-regression`.
- `[x]` No hardcoded service-role key, provider API key, or private password in any restored file.

### Result

The continuation handoff is complete. The project tree, documentation, and every regression fixture match the v0.32.0 handoff state, with the fixture-date repair from v0.32.2. The build is ready for new owner-directed work.

---

## v0.33.0 — 2026-08-17 — AI search suggestions, honest multi-review system, real share sheet, expanded achievements, Paragon Templates, and the three-page Archive Hub

**Request reference:** SOP §11, Prompt P-034 (owner CTA test feedback)  
**Status:** `[x]` front-end delivery complete; Supabase/Brevo activation, owner Hub landing layout, and Community/Team/Templates backends pending

### Search — Paragon AI suggestions (D-110)

1. Results-mode no-match now calls `ParagonAI.rankWebsites()` with the user's exact words — any phrase, typo, or vague idea is ranked live against the full catalogue (no canned examples).
2. When suggestions exist: a "✦ Paragon AI — Similar websites based on your idea" block renders each suggestion with icon, category, description, matched-reason chips, and a confidence percentage, followed by a "Still not the website you need?" Request block.
3. When nothing is similar: an honest "No AI suggestions this time. I think it's time to request that website." state leads directly to Hub Request.
4. New `.ai-suggest-*` and `.search-request-block` styles support both themes and all widths.

### Ratings & Reviews (D-109)

5. `localReviews` becomes an array per website with per-review ids; `normalizeStoredReviews()` migrates every legacy single-review state transparently, and Guest→account merges concatenate review lists without duplication.
6. Users can add unlimited reviews ("Add a review"), edit any specific review (dialog title switches to "Edit your review of …", `editedAt` recorded), and delete each review individually from Detail and Account.
7. Helpful/not-helpful counts dropped all seeded fake numbers (`seededReviewCount` removed): counts start at zero and reflect only the user's real vote, permanently.
8. New review search input filters by review text, reviewer name, or star number, combined with existing sort/star filters and pagination; it resets per detail.

### Share (D-114)

9. `shareSite` prefers the native device share sheet (`navigator.share`) which lists every installed app accepting links.
10. Browsers without native sharing get a new in-app share sheet overlay with WhatsApp, Telegram, X/Twitter, Facebook, Messenger, LinkedIn, Reddit, Email, SMS, and Copy link targets; every option records the share achievement. Copy link and QR keep their existing roles.

### Achievements (D-113)

11. Task list expanded 22 → 30 (six stages of five): Hub Visitor, Hub Regular, QR Creator, AI Curious, AI Regular, Results Seeker, Social Spreader, Fully Notified.
12. Real tracked counters added with Guest/account merge support: `hubVisitCount` (Hub link clicks), `qrCount` (QR opens), `aiQuestionCount` (Paragon AI form submissions), `resultsSearchCount` (Results-mode searches).

### Catalogue (D-112)

13. Added record #107 "Paragon Templates" (Dev Tools / Web & Developer Tools): future template marketplace with purchase, free Archive hosting, and paid custom-hosting upgrade — all features labelled planned; previewOnly concept route; `addedAt` 2026-08-17.
14. AI Brain §13 updated to 107 records with the new row; continuation name-count fixture updated 56 → 57.

### Archive Hub three pages (D-111)

15. Added a sticky Hub top navigation with Documentation, Community, and Team tabs; every piece of former landing content now lives inside the Documentation panel with all section anchors (`#request-site`, `#terms`, …) still working — non-page hashes route into Documentation automatically.
16. Community page: benefits grid plus a join card enforcing the owner's rules — real authenticated accounts only, Guests ineligible with an honest explanation, one-time join stored per user id (`paragonCommunityMembership:{userId}`) with `pendingBackendSync` for the future Community backend, member state showing joined date and linked account.
17. Team page: protected-login template with honest disclosure — no credentials are sent, no fake success, server-side authorization required when the backend activates.
18. New `ParagonHubPages` controller (hash routing, tab state, membership, team form) appended to `archive-hub.js`; new Hub navigation/community/team styles appended to `style.css`.

### Platform

19. Service-worker cache bumped to v33 so all clients receive the new code.
20. SOP updated: standing rule P-015 (all-resolution first), prompt P-034, decisions D-109–D-114, CTA additions (owner Hub layout, Templates naming, new page ideas: Showcase, Blog/News, Events, Careers, Changelog).

### Files changed

- `app.js`, `style.css`, `archive-hub.js`, `paragon-archive-hub.html`, `service-worker.js`
- `data/catalogue-expansion-45-100.js`, `docs/AI-BRAIN.md`
- `tests/ui-regression.test.js` (57-name count; Stage 2 of 6)
- `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes on every changed script.
- `[x]` All 13 regression fixtures pass after the changes.
- `[x]` Hub HTML tag balance verified after the three-page restructure.
- `[x]` CSS uses only existing theme variables; new surfaces styled for narrow and wide widths (P-015).
- `[!]` Community membership and Team login are honest front-end foundations; their production behavior requires the protected backends in CTA §13.
- `[!]` Native share availability depends on the user's browser; the in-app sheet covers the rest.

### Result

Search now behaves like a real assistant on any input, reviews are honest and unlimited with search, sharing reaches real apps, achievements reward Hub/tool/social engagement, the catalogue gains the future Templates marketplace, and the Archive Hub is restructured as the first real three-page product awaiting the owner's landing layout.

---

## v0.34.0 — 2026-08-17 — Archive Hub Home landing page from the owner's layout

**Request reference:** SOP §11, Prompt P-035 (owner-supplied landing mock)  
**Status:** `[x]` landing implemented with honest data; Community discussions/request-upvote backends remain future work

### Executed actions

1. Added a default **Home** page to the Hub (now four pages: Home, Documentation, Community, Team) implementing the owner's layout: cinematic hero, quick cards (Docs / Roadmap / Join Community / Stats), live stats band, Documentation preview cards, Roadmap preview, Join Community banner, Community Discussions preview, Most Requested Websites preview, developer banner, and Official Documents chips.
2. Generated the wide cinematic hero visual `assets/hub-hero.jpg` (glowing ◈ over an archive gateway, brand blue/violet) and cached it in the PWA shell.
3. Topbar upgraded per the mock: 🔍 Hub search (searches all Hub pages and every Documentation section, jump-on-click) and 👤 Team Login shortcut to the Team page.
4. Live stats are real, never fabricated: Websites and Reviews computed from live catalogue data (catalogue scripts now load on the Hub page), Requests uses the zero-safe `getWebsiteRequestCount()` aggregate, Members counts actual Community joins; explanatory honesty caption included.
5. Roadmap preview uses truthful states; the mock's premature "Launch Complete"/"100 Websites Live" claims were re-labelled per D-084.
6. Discussions and Most Requested render honest placeholder cards tied to their future backends; Most Requested shows the live request count and routes to Request.
7. Hash routing extended: empty hash → Home, `#landing-*` anchors stay on Home, page hashes switch pages, all other anchors open inside Documentation.
8. `tests/archive-hub.test.js` arrow rule refined: owner-approved landing "See all →/Join now →/Developer docs →" links are allowed; D-092 still bans arrows everywhere else.

### Files changed

- `paragon-archive-hub.html`, `archive-hub.js`, `style.css`, `service-worker.js`, `assets/hub-hero.jpg` (new), `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes on all changed scripts; Hub HTML tag balance verified.
- `[x]` All 13 regression fixtures pass.
- `[x]` Hero, Hub page, and all assets return HTTP 200 on the preview server.
- `[x]` Landing surfaces are responsive from narrow phones through wide desktops (P-015).
- `[!]` Discussions, request upvotes, and member counts beyond this browser await the protected backends in CTA §13.

### Result

Entering the Archive Hub now lands on the owner's designed gateway page with honest live numbers, while Documentation, Community, and Team remain one tap away.

---

## v0.35.0 — 2026-08-17 — Dedicated full Roadmap view

**Request reference:** SOP §11, Prompt P-036 (owner-supplied roadmap layout)  
**Status:** `[x]` completed

### Executed actions

1. Added the `#roadmap-full` Hub view (`hub-page-roadmap` panel) opened by the landing Roadmap "See all →", with a "← Back to Hub Home" control; the four top tabs remain visible with no tab highlighted while a view is open.
2. Implemented the owner's layout as a dotted timeline: ✅ COMPLETED (4 real 2026 milestones), 🔄 IN PROGRESS (Community Platform, Developer Portal), 📅 PLANNED (Platform Launch target Aug 2027, First 100 Websites Live 2027 target, Mobile App, Multi-language 10+, Websites 101–200).
3. Honest progress bars: percentages are computed at runtime from visible six-item milestone checklists under each bar (`populateRoadmapProgress()`), currently 50% Community (3/6) and 33% Developer (2/6); captions state the count so every number is supported. No hand-written 65/20 values.
4. Status line replaced "All Systems Operational" with the truthful foundations status linking to System Status.
5. Hash routing extended with a VIEWS registry; `data-hub-goto` buttons navigate between Hub pages.
6. Timeline/progress/milestone styles appended to `style.css`; arrow-rule fixture updated to allow the essential ← Back control.

### Files changed

- `paragon-archive-hub.html`, `archive-hub.js`, `style.css`, `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes; Hub HTML balanced; page serves HTTP 200.
- `[x]` All 13 regression fixtures pass.
- `[x]` Progress bars derive only from the checklist DOM — changing a milestone's data-done updates the percentage automatically.
- `[!]` In-progress percentages will move as Community/Developer backends are built; planned items stay planned until real completion.

### Result

Roadmap "See all" now opens the owner's designed full roadmap with truthful states and self-proving progress numbers.

---

## v0.36.0 — 2026-08-17 — Team Secure Access screen

**Request reference:** SOP §11, Prompt P-037 (owner-supplied Team layout)  
**Status:** `[x]` completed

### Executed actions

1. Replaced the Team page hero/form with the owner's centered Secure Access design: ◈ brand line, "TEAM SECURE ACCESS", "Authorized personnel only", glowing card with Team Email + Access Key + full-width "SECURE LOGIN 🔐", members-only warning, and "← Back to Archive" link to the Archive app.
2. Honesty preserved: warning uses future tense ("will be logged and reported when the protected gateway activates"); submitting still sends nothing and reports the inactive-backend status; the full disclosure moved into a compact expandable note.
3. Form ids (`team-login-form/email/password/status`) unchanged so the existing controller and any fixtures keep working; error copy updated to "Access Key".
4. Added the `.hub-team-secure*` centered layout styles with radial glow; "← Back to Archive" added to the approved-arrow exceptions in the Hub fixture.

### Files changed

- `paragon-archive-hub.html`, `archive-hub.js`, `style.css`, `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes; Hub HTML balanced; page serves HTTP 200.
- `[x]` All 13 regression fixtures pass.
- `[x]` Screen is centered and responsive from narrow phones to desktop (P-015).

### Result

The Team tab now opens the owner's designed secure-access portal, honest about its inactive backend while looking every bit the protected gateway it will become.

---

## v0.37.0 — 2026-08-17 — Audit pass: theme-sync fix, flow repairs, and modern motion polish

**Request reference:** SOP §11, Prompt P-038  
**Status:** `[x]` completed

### Audit executed

1. Link audit: every `href`/`src` in the three pages checked against the filesystem — all resolve; no broken links.
2. Anchor audit: every `#hash` target in the Hub and every `paragon-archive-hub.html#…` deep link from the app verified against existing ids/pages — none missing.
3. Flow audit: hub Back button, Team "← Back to Archive", roadmap "← Back to Hub Home", hash history navigation, and return-to-intent verified coherent.

### Bugs fixed

4. **Theme desync:** Hub and product-preview never applied the saved `paragonArchive.theme.v2` light preference. Added a pre-paint inline theme bootstrap to all three HTML heads (also removes the app's dark flash for light-theme users).
5. **Dead re-click:** links whose hash was already active fired no hashchange and did not scroll; a delegated handler now force-scrolls to the visible target.
6. **Static progress bars:** roadmap fills were set while the panel was hidden; bars now animate from zero each time the Roadmap view opens (skipped under reduced motion).
7. **Missing return flow:** after joining the Community, a "← Back to Hub Home" control now appears with a one-time celebration pulse on the join card.

### Modern styling and animation (all guarded by prefers-reduced-motion)

8. Hub page-panel entrance transition on every page switch.
9. Landing hero: slow ken-burns drift on the generated visual plus staggered text fade-up.
10. Scroll-reveal for landing sections via IntersectionObserver with graceful fallback.
11. Live-stats count-up animation triggered when the stats band becomes visible.
12. Tab shine hover, card hover elevation/shadow, and unified focus-visible rings across all new surfaces.
13. Light-theme overrides for every new Hub/share/AI-suggest surface.

### Files changed

- `paragon-archive.html`, `paragon-archive-hub.html`, `paragon-product-preview.html`, `archive-hub.js`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes on all scripts; all three HTML documents balanced; all pages/assets HTTP 200.
- `[x]` All 13 regression fixtures pass.
- `[x]` Motion disabled cleanly under prefers-reduced-motion; light and dark themes verified on new surfaces.

### Result

The project is audited, link-clean, theme-consistent across pages, flow-complete after user actions, and carries a modern motion layer — ready for the owner's next building session.

---

## v0.38.0 — 2026-08-17 — Deployed detail template with illustrative preview

**Request reference:** SOP §11, Prompt P-039 (owner-supplied Deployed detail layout)  
**Status:** `[x]` template live in the renderer; real Deployed entries await the future developer programme

### Executed actions

1. Extended `openDetail` to render Deployed-aware records: "by @developer" byline in the hero and info bar, 💎 premium disclosure card (FREE/PREMIUM columns, price, italic "purchases are handled by the developer … not by Paragon Archive" note), 👤 About the Developer card (gradient avatar initials, handle, quoted bio, joined date, deployed count), and 🚀 Similar Deployed Websites (Deployed-only related list with an honest empty state).
2. Added the non-catalogue illustrative record "My Cool App" by @JohnDev: reachable only via `paragon-archive.html?site=My%20Cool%20App`; excluded from lists, search, rankings, view metrics, and visit history; every value labelled example.
3. A prominent 🧪 "Illustrative template preview" banner renders above the hero for illustrative records.
4. Hub Deployed documentation gained a "Preview the Deployed detail template" card linking to the example.
5. New premium/developer/banner styles with light-theme variants; responsive columns (P-015).

### Files changed

- `app.js`, `style.css`, `paragon-archive-hub.html`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes; Hub HTML balanced.
- `[x]` All 13 regression fixtures pass.
- `[x]` Verified "My Cool App" is absent from the public catalogue (107 records unchanged).
- `[!]` Real Deployed detail pages activate only when the future developer programme supplies genuine approved records.

### Result

The Archive now knows exactly how to present third-party Deployed websites, and the owner can preview that future today through an honestly labelled example.

---

## v0.39.0 — 2026-08-17 — Deploy submission form reshaped to the owner's layout

**Request reference:** SOP §11, Prompt P-040 (owner-supplied Deploy form layout)  
**Status:** `[x]` completed — still an honest local-only preview per D-083

### Executed actions

1. Rebuilt the Hub Deploy preview form to the owner's exact structure and order: hero pitch line, Website Name, Your Creator/Developer Name, Description with 0/1000 counter, Sub-Category dropdown ("Select sub-category"), premium radio ("Yes — has free and premium features"), conditional "If yes: List what is free and what is premium", combined "Website Files or URL" fieldset (📎 ZIP upload max 50MB, an OR divider, hosted URL input), Website Icon (200×200 PNG), Screenshots (minimum 3, max 8), Your Contact Email, the four agreement checkboxes, and SUBMIT FOR REVIEW 🚀.
2. Added the owner's review note framed honestly: "When submissions open: review takes 7–14 days, and you will be notified by email…".
3. All existing element ids kept so the live controller (description counter, premium toggle, local file guidance, preview validation) works unchanged; no upload endpoint added.
4. New pitch/either-or/review-note styles; fixture wording updated to the new labels plus a Website-Files-or-URL assertion.
5. Restarted the preview server (it had stopped between sessions).

### Files changed

- `paragon-archive-hub.html`, `style.css`, `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` All 13 regression fixtures pass; Hub HTML balanced; page serves HTTP 200.
- `[x]` Description counter, premium conditional field, and local file guidance verified wired to the reshaped markup.
- `[!]` Real submission requires the future protected upload/review backend (CTA §13.D).

### Result

The Deploy form now reads exactly like the owner's design — a complete developer-facing submission experience, honestly waiting for its backend.

---

## v0.40.0 — 2026-08-17 — Roadmap v2: Mobile App progress, Desktop App, and Coming Soon products

**Request reference:** SOP §11, Prompt P-041 (owner-supplied updated roadmap layout)  
**Status:** `[x]` completed

### Executed actions

1. Rebuilt the `#roadmap-full` view to the owner's v2 layout under "🗺️ THE PARAGON ROADMAP".
2. IN PROGRESS now carries three milestone-tracked bars: Community Platform (3/6 = 50%), renamed "Developer Portal and Deployed Category" (2/6 = 33%, milestone updated to include the new submission form and detail template), and Paragon Archive Mobile App (1/6 ≈ 17% — the installable PWA foundation is genuinely live; remaining native milestones listed).
3. PLANNED reordered: Platform Launch (Aug 2027 target), First 100 Websites Live (2027 target), Websites 101–200, Multi-language Support, and the new Paragon Archive Desktop App.
4. Added "🔮 COMING SOON — NEW PARAGON PRODUCTS" with the owner's descriptions: 🧬 RxLife Network, 💊 Pharmapaedia, 🌐 More Paragon Platforms, 🏗️ Paragon Ecosystem — violet-themed dots, presented as future concepts.
5. Closed the page with the centered founder quote.
6. Synchronized the landing Roadmap preview (Developer In Progress; New Paragon products Coming Soon) and added matching preview badge colors.

### Files changed

- `paragon-archive-hub.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` All 13 regression fixtures pass; Hub HTML balanced; page serves HTTP 200.
- `[x]` All three progress bars compute from their visible checklists and animate on view open.
- `[!]` RxLife Network and Pharmapaedia are roadmap concepts only; adding them as catalogue records or products requires a future owner request.

### Result

The roadmap now tells the full Paragon story — what is done, what is moving with provable progress, what is planned, and the new product universe coming after the Archive.

---

## v0.41.0 — 2026-08-17 — Under Construction stage on the shared product preview

**Request reference:** SOP §11, Prompt P-042  
**Status:** `[x]` completed — applies automatically to all 105 unfinished catalogue products

### Executed actions

1. Reworked `product-preview.js` so the shared route renders a full-viewport Under Construction stage before the concept content: floating site icon over an accent glow, bold "We're building something", per-site status line ("{Site} is under construction. Paragon is actively building it — check back soon."), and an animated orange sweep progress bar.
2. Honesty preserved: the bar is explicitly a stylized work-in-progress cue — the caption states "no launch date claimed · this page is honest, not a countdown", and no fake percentage is rendered; page title becomes "{Site} — Under Construction".
3. Added "📖 View the concept documentation" (and a bobbing scroll hint) that reveal the complete existing concept preview — hero, honesty note, tailored workspace, planned features, footer — and smooth-scroll to it; `ParagonProductPreview.toggleDocs` exposed; reduced-motion users get static bar, no float/bob, and instant reveal.
4. "Return to Archive detail" remains available from both the construction stage and the documentation footer.
5. New `.construction-*` styles with light-theme support; docs content stays in the DOM (collapsed by class), keeping regression assertions and honest content intact.

### Files changed

- `product-preview.js`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes; all 13 regression fixtures pass.
- `[x]` Preview route serves HTTP 200 and renders the construction stage for existing products; unknown products keep the not-found state.
- `[x]` One shared page continues to serve every unfinished product — no duplicated placeholder files (D-098).

### Result

Opening any not-yet-built Paragon website now lands on a clean, modern "We're building something" page — and one tap below it, the full concept documentation explains exactly what that website is going to become.

---

## v0.42.0 — 2026-08-17 — Six-step Community join wizard

**Request reference:** SOP §11, Prompt P-043 (owner-supplied membership flow)  
**Status:** `[x]` completed — backend-dependent benefits labelled until the Community backend activates

### Executed actions

1. Replaced the simple join card with a live six-step tracker: each step (account, Hub arrival, guidelines, email verification, profile, membership) shows a numbered mark that turns into a green check as it completes, updating in real time as the user interacts.
2. New join form: required Community Guidelines checkbox linking to the published guidelines, community display name (required), short bio (optional but encouraged), and nine interest chips drawn from the Archive category families.
3. Email verification step reads the genuine Supabase `email_confirmed_at` state when providers are active; before activation it is labelled pending with an honest explanation, and membership completes locally with `pendingBackendSync`.
4. Member panel: 👥 COMMUNITY MEMBER badge, display name, joined date + interests, and the owner's full benefits list with per-item activation labels (boards/Q&A/suggestions — Community backend; monthly email — email activation), plus the Back-to-Home control and celebration pulse.
5. Membership records extended with displayName, bio, interests, guidelinesAcceptedAt, and emailVerifiedAtJoin; one-join-forever and real-accounts-only rules unchanged; landing Members stat still counts real joins.
6. New stepper/chips/badge styles with light-theme support; step-2 arrow copy added to the fixture's owner-approved exceptions.

### Files changed

- `paragon-archive-hub.html`, `archive-hub.js`, `style.css`, `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes; all 13 regression fixtures pass; Hub HTML balanced; page serves HTTP 200.
- `[x]` Steps update live: checking the guidelines box completes step 3, typing a display name completes step 5, membership flips step 6 with all previous steps checked.
- `[!]` Real verification emails, boards, Q&A, suggestions, and the monthly email require Supabase/Brevo/Community backend activation (CTA §13).

### Result

Joining the Paragon Community is now a guided six-step journey ending in a member badge and a clearly labelled benefits list — honest at every step about what activates later.

---

## v0.43.0 — 2026-08-17 — System Status page in the owner's layout

**Request reference:** SOP §11, Prompt P-044  
**Status:** `[x]` completed

### Executed actions

1. Rebuilt `#system-status` to the owner's structure: "📊 PARAGON ARCHIVE — SYSTEM STATUS" heading, Current Status banner with a pulsing dot and live "Last checked" timestamp (locally computed at page load and labelled as such), eight component rows in the owner's order with colored state dots and the owner's descriptions.
2. Honest component states: Core Platform and Updates System — Operational (front-end preview); Website Iframe System — Operational with limitations; Community Platform — Partially available (six-step wizard live, boards/Q&A/suggestions pending); Authentication, Database, Notifications — Prepared awaiting activation; Deployed Platform — Planned.
3. Dual STATUS LEGEND: the four pre-launch readiness states in use now plus the owner's five production states (Operational, Degraded, Partial Outage, Major Outage, Maintenance) that activate with monitoring.
4. 📅 RECENT INCIDENTS honestly explains the incident feed begins when monitoring connects — no "no incidents in 30 days" claim; 📧 report-an-issue mailto with the System Status subject retained.
5. `updateStatusTimestamp` rewritten to the "Last checked:" wording; new `.status-*` row/banner/legend styles with pulse animation (reduced-motion safe) and light-theme support; fixture heading phrase updated.

### Files changed

- `paragon-archive-hub.html`, `archive-hub.js`, `style.css`, `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` All 13 regression fixtures pass, including the guard asserting the page never claims "ALL SYSTEMS OPERATIONAL".
- `[x]` Hub HTML balanced; page serves HTTP 200; states color-coded in both themes.

### Result

System Status now reads like a real status page in the owner's design — and every dot on it tells the truth.

---

## v0.44.0 — 2026-08-17 — Real build-percentage loader, vertical Recently Added, 7-day window

**Request reference:** SOP §11, Prompt P-045  
**Status:** `[x]` completed

### Executed actions

1. **Real build loader (D-125):** the construction page bar is now determinate. It reads the site's `buildProgress` (0–100, default 0), animates a count-up to the true value (eased, reduced-motion safe), displays "{N}% built" with "construction has not started yet" at 0%, and carries proper progressbar ARIA. Copy states the number is real and only rises with actual construction. All 105 unfinished sites are honestly at 0% today; per-site values will be raised as each website is genuinely built.
2. **Vertical See-all (D-124):** `.recent-full-rail` became a centered vertical column of full-width cards; the overlay summary copy now says "Scroll down to continue."
3. **7-day window (D-124):** new `getRecentlyAddedSites()` filters additions to the last 7 days, newest first; both the home preview row (up to 7) and the full overlay use it, each with an honest empty state when nothing qualifies. Today only Paragon Templates (added 2026-08-17) is inside the window.
4. Updated `tests/search-navigation.test.js` to compute expectations with the same 7-day cutoff — deliberately date-independent so the fixture never goes stale (lesson from v0.32.2 applied).

### Files changed

- `product-preview.js`, `app.js`, `paragon-archive.html`, `style.css`, `tests/search-navigation.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes; all 13 regression fixtures pass; app and preview pages serve HTTP 200.
- `[x]` 0%-built sites show an empty bar with "0% built — construction has not started yet"; the fill and count animate only to real values.
- `[x]` Recently Added preview, overlay, empty states, and newest-to-oldest order verified through the updated fixture.

### Result

The construction loader now tells the truth in numbers, and Recently Added is a clean, vertical, genuinely-recent list.

---

## v0.45.0 — 2026-08-17 — Line-by-line audit, real view counts, and Account tab upgrades

**Request reference:** SOP §11, Prompt P-046  
**Status:** `[x]` completed — every remaining open feature is externally blocked and itemized in CTA §13

### Audit executed

1. Re-read SOP (rules, decisions D-001–D-125, constraints, CTA) and all EOP entries; verified every front-end feature through P-045 is implemented; compiled the complete waiting-on-owner list into CTA §13 (Supabase, OAuth, Brevo, support Edge, real product builds/URLs/assets, founder photo, guide screenshots, demo-review decision, RxLife/Pharmapaedia go-ahead, production origin, Hub page ideas, backend programmes).
2. Link/anchor audit across all three pages: zero broken references; back/forth flows re-verified.

### Reality pass (D-126)

3. Removed hashed 12,000–64,000 seeded view totals from `data/metrics.js`; `getViewCount` now returns only genuinely recorded views. Detail Views counters, daily hero, weekly Trending, and Staff opportunity rankings are driven purely by real user actions with deterministic rating/review/name tie-breakers until activity accumulates.
4. Trending/Staff summary copy updated to state rankings use real recorded views on this device, with global totals arriving via the analytics backend.

### Account upgrades (D-127)

5. Profile badges now include a 👥 Community Member chip read live from the Hub membership record (`paragonCommunityMembership:{userId}`) — real cross-page state, no fabricated status.
6. New achievement-progress strip under the stats grid: completed/total tasks with percentage and an animated fill.
7. Settings gained a state-aware Community row: "Member" for joined accounts, "Join the Paragon Community" for signed-in non-members, "real account required" note otherwise — all linking to the Hub Community page.

### Files changed

- `data/metrics.js`, `app.js`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes; all 13 regression fixtures pass (metrics fixture unaffected — it already tested relative ordering, not seed values).
- `[x]` Link audit: all local references resolve on all three pages.
- `[x]` Account renders correctly for signed-out, Guest, member, and non-member states; light/dark verified on new surfaces.
- `[!]` Rankings will look sparse until real usage accumulates — this is the honest intended behavior; global analytics remain CTA §13 backend work.

### Result

Every number a user sees is now earned by real actions, the Account tab reflects true cross-product identity including Community membership, and the complete list of externally blocked work sits in one place for the owner.

---

## v0.45.1 — 2026-08-17 — Owner-directed uploads cleanup

**Request reference:** Owner instruction (P-027 precedent: originals removed only by explicit owner direction after verification)  
**Status:** `[x]` completed

### Executed actions

1. Verified all 55 files in `/home/user/uploads/` against the reconstructed project before deletion: 30 byte-identical to their project copies, 17 superseded by newer project edits (v0.32.2–v0.45.0), 8 owner phone screenshots, and zero files whose content was missing from the project.
2. Deleted the `/home/user/uploads/` folder in full.
3. Post-cleanup integrity check: project file tree intact, all 13 regression fixtures pass, preview server serving HTTP 200.

### Result

The workspace now contains only the living project; the flattened intake uploads are retired exactly as in the P-027 precedent.

---

## v0.46.0 — 2026-08-17 — Service-worker staleness fix (missing-features report)

**Request reference:** SOP §11, Prompt P-047 (owner exported the project and saw old behavior)  
**Status:** `[x]` fixed — no feature was actually missing from the source

### Diagnosis

1. Reproduced the failure mode by inspection: assets were cache-first and `CACHE_NAME` stayed at `paragon-archive-v33` from v0.33.0 through v0.45.1, so browsers with the v33 worker installed served every script, style, and data file from the old cache while HTML navigated fresh.
2. Ran a Node DOM simulation of `product-preview.js` for an existing catalogue site: the construction stage, real-percentage loader, honest 0% label, documentation toggle, and collapsed concept content all render correctly — the source was never broken.

### Executed actions

3. Bumped `CACHE_NAME` to `paragon-archive-v46`; install/activate flow (skipWaiting + clients.claim + old-cache deletion) already ensures the new worker takes over and purges v33.
4. Switched same-origin asset fetches to stale-while-revalidate: cached responses answer instantly while the network copy silently refreshes the cache, so any future missed bump self-heals after one reload; offline behavior unchanged.
5. Added standing rule P-016 (cache version discipline) to SOP §5; updated the Hub fixture to assert the current version name and the revalidation strategy.

### Files changed

- `service-worker.js`, `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes; all 13 regression fixtures pass.
- `[x]` Construction-page render simulation passes all seven content checks.
- `[!]` Owner action on already-poisoned browsers: reload the exported site once (the new worker installs and claims), then reload again — or clear site data once. After that, updates self-heal automatically.

### Result

Nothing was lost — the exported browser was simply frozen on the v33 cache. With the version bump, background revalidation, and the new standing rule, this entire class of "features disappeared" reports is closed.

---

## v0.47.0 — 2026-08-17 — Paragon Quiz v1.0: first real product build

**Request reference:** SOP §11, Prompt P-048 (owner-supplied structure and three pages)  
**Status:** `[x]` v1.0 live at /paragon-quiz/ — cross-device sync awaits Supabase activation

### Executed actions

1. Created `/paragon-quiz/` with the owner's exact `index.html`, `explore.html`, and `create.html` (plus P-014 identity headers) and built `play.html` and `results.html` in the same design language.
2. Built `css/style.css`: complete dark Paragon visual system — sticky header, floating hero cards, steps, quiz/category cards, filters, full form/builder styling, modals, play stage with timer, results ring, responsive to narrow phones, focus rings, reduced-motion safe.
3. Built `js/app.js` core: namespaced localStorage stores (quizzes/results/bests), three genuinely Paragon-authored starter quizzes (25 questions total, "Starter" chip, zero plays — no fabricated community activity), quiz CRUD, real stats loaders with count-up, popular-by-real-plays featured grid, live category counts.
4. Built `js/explore.js` (live search + category/difficulty filters + newest/oldest/popular/highest sorts + ?category= deep link), `js/create.js` (dynamic 4-option question blocks with correct-answer radios, live counters, ≥3-question validation with named errors, preview modal, publish + success flow, play-my-quiz), `js/play.js` (intro with personal best, per-question countdown with urgent state, A–D lettered options, correct/wrong/dimmed feedback, live score, quit confirm, result save), and `js/results.js` (animated score ring, five verdict tiers, new-personal-best chip, full answer review incl. ⏰ timeouts, retry, native share/clipboard).
5. Catalogue: Paragon Quiz record now carries `siteUrl: "paragon-quiz/index.html"`, updated real features, `v1.0 — Aug 17, 2026`; the first-expansion merge now honors definition `siteUrl`/`version` and clears `previewOnly` for live destinations.
6. Fixture updated: `product-preview.test.js` recognizes live sites (Hub + Quiz) and asserts Quiz keeps its real destination.
7. Restarted the preview server (had stopped between sessions).

### Files created

- `paragon-quiz/index.html`, `explore.html`, `create.html`, `play.html`, `results.html`
- `paragon-quiz/css/style.css`
- `paragon-quiz/js/app.js`, `explore.js`, `create.js`, `play.js`, `results.js`

### Files changed

- `data/catalogue-expansion.js`, `tests/product-preview.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` `node --check` passes on all five quiz modules; all five quiz pages HTML-balanced; all 11 quiz files serve HTTP 200.
- `[x]` All 13 Archive regression fixtures pass.
- `[x]` Engine smoke test passes 14 checks: starter content, zero-based stats, save/lookup/delete, play recording, best-score improve/keep, average percent, real-data card markup.
- `[!]` Quiz content and scores are device-local until Supabase-backed sync is designed after activation; leaderboards deferred with it.

### Result

Paragon Archive contains its first finished, playable product: opening Paragon Quiz from the Archive now launches a real website where users create, play, and score — every number earned, nothing faked.

---

## v0.48.0 — 2026-08-17 — Team Secure Access Portal (PAGE 0)

**Request reference:** SOP §11, Prompt P-049  
**Status:** `[x]` portal live with real escalation policy; server authorization + IP-bearing owner alerts await the security backend

### Executed actions

1. Created `/team/login.html`: ◈ PARAGON TEAM / Secure Team Access Portal, Team Email, Password with Show/Hide toggle, 🔐 SECURE LOGIN, Forgot-your-password (owner mailbox, Team Password subject), members-only warning, "← Back to Archive Hub", compact honesty disclosure, noindex.
2. Created `/team/login.js` implementing the owner's exact failed-login policy as real device behavior: attempts 1–2 wrong-credentials with counters, attempt 3 "2 more attempts" warning, attempt 4 final warning, attempt 5 → 30-minute lockout with live mm:ss countdown, disabled inputs, persisted state across reloads, clean counter reset after expiry, and incident records (timestamp + pendingBackendDispatch) capped at 50.
3. Fixed a simulation-caught bug: expired lockouts now reset the counter in the submit path instead of instantly re-locking on the next attempt.
4. Hub integration: hidden low-opacity 🔒 link in the Hub footer (brightens on hover/focus) and a Team-tab pointer to the dedicated portal.
5. New portal styles (Show toggle, lockout alert, hidden lock) in the shared stylesheet with light-theme inheritance.

### Files created

- `team/login.html`, `team/login.js`

### Files changed

- `paragon-archive-hub.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` State-machine simulation passes 9 checks covering every step of the owner's policy including expiry reset.
- `[x]` All 13 Archive regression fixtures pass; portal files serve HTTP 200; `node --check` clean.
- `[!]` Real credential verification, IP capture, and the owner alert email require the protected security backend (CTA §13.D); no fake success path exists meanwhile.

### Result

The Team portal is a genuinely defensive front door — real warnings, real lockout, real incident log — waiting only for its server-side brain.

---

## v0.49.0 — 2026-08-17 — Team first-login setup + session-timeout guard

**Request reference:** SOP §11, Prompt P-050  
**Status:** `[x]` both features live as real front-end behavior; provisioning/session backends pending

### Executed actions

1. Created `/team/setup.html` + `/team/setup.js`: Super Admin invite variant (?mode=admin — "Welcome. Set Your Password." / "This link expires in 24 hours.") and forced-change variant (?mode=role — owner's exact message plus the initial-password field). Pre-filled email from the link, Show/Hide toggle, live 5-level strength meter (Too weak → Excellent) with a rule checklist that ticks in real time, confirm matching, and named policy errors on submit.
2. The 24-hour expiry is genuinely enforced from the link's `ts` parameter — expired links hide the form behind an alert; timestamp-less preview links skip enforcement by design.
3. Honest completion: a policy-compliant submission reports success and explains that provisioning and dashboard entry activate with the protected backend; nothing is stored or transmitted.
4. Created `/team/session.js`, the reusable idle guard: warning modal at 29 minutes idle (⚠️ title, inactivity line, 60-second countdown box, unsaved-work note, Stay Logged In / Log Out Now), auto-logout to `login.html?timeout=1` at zero, click/keydown-anywhere reset with modal-safe behavior, injectable durations for testing; included on setup and ready for every future team page.
5. Login page now shows an inactivity notice when arriving with ?timeout=1 and links both setup variants for preview from its honesty disclosure.
6. New styles: role message, strength meter/rules, timeout note, session modal with pop animation (reduced-motion safe).

### Files created

- `team/setup.html`, `team/setup.js`, `team/session.js`

### Files changed

- `team/login.html`, `team/login.js`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Setup policy simulation: 7 checks (role detection, 25-hour link expires, fresh link valid, weak/strong rule evaluation, 4/5 and 5/5 scoring).
- `[x]` Session-guard simulation: 6 checks (config override, idle arm, warning open, Stay reset, 60-tick auto-logout redirect with flag).
- `[x]` All 13 Archive regression fixtures pass; all team files serve HTTP 200; `node --check` clean.
- `[!]` Real invitations, initial passwords, credential storage, and server sessions arrive with the security backend (CTA §13.D).

### Result

The Team portal now has its complete entry security suite — hardened login, policy-enforcing first-time setup, and an idle guard — all real behavior, all waiting only for the server brain.

---

## v0.50.0 — 2026-08-17 — Team Overview Dashboard (PAGE 1)

**Request reference:** SOP §11, Prompt P-051  
**Status:** `[x]` dashboard preview live; backend queues/claims pending

### Executed actions

1. Created `/team/overview.html` + `/team/overview.js` implementing the owner's full PAGE 1 layout: sticky dashboard topbar (◈ brand, 🔔 with live incident count, 👤 Paragon with role badge, log out), preview banner with role switcher, time-aware greeting, QUICK STATS, PENDING ACTIONS grid, RECENT ACTIVITY timeline, CHARTS, and QUICK ACTIONS.
2. Role matrix implemented exactly per the owner's table and verified by simulation for all six roles; the Analyst variant also swaps the greeting subtitle to numbers-only.
3. Real data everywhere: Websites 107 catalogued · 2 live (computed), Reviews from catalogue records, Quiz Plays from genuine device results, Users honestly "—" until accounts, backend queues at true zero with activation notes, plus a real Portal Lockout Incidents card feeding the 🔔 badge.
4. Activity feed assembles genuine local events (live launches, newest additions, community joins, quiz publications, lockout incidents) sorted by true timestamps with relative-time labels and working links.
5. Charts without dependencies: 30-day New Users bar chart (real zeros, per-day hover labels, activates with accounts) and a real catalogue category-family pie via conic-gradient with legend.
6. Future-page buttons (Add Website, Announcement, Team, queue links) toast honestly that they arrive with the next spec pages; Requests links to the live Hub request flow; session guard included; login page links the preview.

### Files created

- `team/overview.html`, `team/overview.js`

### Files changed

- `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Simulation: 10 checks pass — all six role-matrix variants, real activity sources, family mapping.
- `[x]` All 13 Archive regression fixtures pass; overview files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Real team accounts, claims-driven roles, queues, and actor attribution require the security/queue backends (CTA §13.D).

### Result

The Team now has its command center — an honest dashboard whose every number is real today and whose every widget is wired for the backend tomorrow.

---

## v0.51.0 — 2026-08-17 — Team All Websites manager (PAGE 2)

**Request reference:** SOP §11, Prompt P-052  
**Status:** `[x]` manager live over real catalogue data; backend sync of overrides pending

### Executed actions

1. Created `/team/websites.html` + `/team/websites.js`: page head with + Add Website, search + category + status + sort filter bar, live count line, and status-striped rows for all 107 real catalogue websites showing icon, name, 📁 category, status badge, real stats line (recorded views · rating · review count), and version.
2. Status system: real derivation (Live for Hub/Quiz; 🧭 Concept Preview added for public preview entries) plus the owner's full badge set via local team overrides — Archive starts a genuine 90-day countdown shown per row, Schedule stores the go-live date ("Goes live: Feb 1, 2027"-style line), Mark Under Review, Approve returns to real status, Restore clears archives; every override carries a visible "local" flag until backend sync.
3. Per-status action rows per the spec: Edit / Archive / View Stats / View on Archive for live+preview, Cancel Schedule for scheduled, Approve for review, Restore for archived, Publish + Delete Draft for drafts.
4. + Add Website modal creates genuinely team-only drafts (never in the public catalogue — verified); catalogue edits save as flagged overrides with an honest modal note; Publish explains catalogue-integration honestly; Delete Draft confirms then removes.
5. View Stats expands an inline real-device stats panel; archived rows hide from the default listing unless filtered; Overview's ➕ Add Website quick action now opens this page's modal via #add, topbar links added both ways, login preview links updated.

### Files created

- `team/websites.html`, `team/websites.js`

### Files changed

- `team/overview.html`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Simulation: 9 checks — 107 entries, Live derivation for Hub/Quiz, preview derivation, archive/restore/schedule overrides, draft isolation from the public catalogue.
- `[x]` All 13 Archive regression fixtures pass; both files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Override sync to the public catalogue, scheduled auto-go-live, and multi-device team state require the backend (CTA §13.D).

### Result

The Team can now see and manage every website in the Archive from one honest console — real numbers on every row, real drafts kept private, and every status change flagged until the backend makes it public.

---

## v0.52.0 — 2026-08-17 — Add Website editor (PAGE 3)

**Request reference:** SOP §11, Prompt P-053  
**Status:** `[x]` editor live; asset upload and catalogue publishing await backend integration

### Executed actions

1. Created `/team/add-website.html` + `/team/add-website.js` implementing the owner's full editor: basic info with live 150/1000 counters and real-catalogue category options, media section with four upload zones, technical fields, dynamic feature rows (starting at three, add/remove), enter-to-add tag chips with dedupe/normalize/removal (cap 10), What's New notes, and complete publish settings (status radios with schedule date+time reveal, featured checkboxes with Website-of-the-Day date reveal).
2. Real media validation: icon/card/hero images are decoded locally and their true pixel dimensions compared to 200×200 / 800×400 / 1200×600 with ✅/⚠️ feedback (drafts may still save on mismatch); screenshots enforce the 3–8 count; icon previews under ~120KB stored with the draft.
3. Save Draft (header and footer) writes the full record — including tags, features, media check results, featured flags, and schedule — into the shared paragonTeamWebsites.drafts.v1 store, appearing instantly in the PAGE 2 manager as a team-only Draft; the public catalogue is untouched (verified).
4. Publish enforces the complete requirement set (name, both descriptions, category, path, version, all three primary images, ≥3 features) with a named-gap status line; success stores a ready-to-publish flag and honestly explains catalogue integration; scheduled records carry their go-live timestamp for the future backend switch.
5. Entry-point routing: PAGE 2's + Add Website and Overview's quick action now open the editor; login preview links updated; session guard active on the page.

### Files created

- `team/add-website.html`, `team/add-website.js`

### Files changed

- `team/websites.html`, `team/websites.js`, `team/overview.html`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Simulation: 6 checks — tag add/dedupe/normalize, empty-form publish gate (8+ named problems), media-requirement gate, draft persistence into the shared store with features and tags, public-catalogue isolation.
- `[x]` All 13 Archive regression fixtures pass; both files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Real asset storage, catalogue publishing, scheduled auto-go-live, and featured-placement engagement require backend/catalogue integration (CTA §13.D).

### Result

The Team can now assemble a complete, validated website record — media-checked, feature-listed, tagged, scheduled, and featured-flagged — that lands in the manager ready for the day publishing goes live.

---

## v0.53.0 — 2026-08-17 — Deployed website review console (PAGE 4)

**Request reference:** SOP §11, Prompt P-054  
**Status:** `[x]` console live; real submissions arrive with the programme backend

### Executed actions

1. Created `/team/deployed.html` + `/team/deployed.js`: filter tabs (All/Pending/Approved/Rejected/On Hold), submission cards with status badge, date, submitter/category/pricing line, file/screenshot/preview actions, the eight-item review checklist with live X/8 counter, autosaving internal notes, and the Hold/Reject/Approve decision row.
2. Workflow gates: Approve is disabled until all eight checklist items are checked; Reject demands a written reason (stored and displayed); Hold toggles to Resume; decided cards lock their checklist and notes and offer Reopen Review.
3. Honesty: the queue starts genuinely empty with a clear explanation — no fabricated submissions; the loadable example is labelled "illustrative example" on its card and reuses the established @JohnDev fixture identity; approval/rejection toasts state that public listing and developer emails activate with the hosting backend.
4. Wired the Overview "Deployed Sites Pending → Review" card and login preview links to the console.

### Files created

- `team/deployed.html`, `team/deployed.js`

### Files changed

- `team/overview.html`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Simulation: 8 checks — empty queue, eight checklist items, 7/8 vs 8/8 approve gating, approval and reasoned-rejection persistence.
- `[x]` All 13 Archive regression fixtures pass; both files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Real submissions, file/screenshot storage, developer notifications, and public Deployed listings require the programme backend (CTA §13.D).

### Result

The moderation desk is ready: when the first real developer submission ever arrives, the team reviews it through a workflow that has already been exercised end to end.

---

## v0.54.0 — 2026-08-17 — User management (PAGES 5–6)

**Request reference:** SOP §11, Prompt P-055  
**Status:** `[x]` both pages live; real accounts/claims/IP capture await the backend

### Executed actions

1. Created `/team/users.html` + `/team/users.js` (PAGE 5): search, status filter, sort, live total, and status-striped user rows with identity, joined/last-active, activity numbers, and per-status action sets (View Profile / Suspend / Lift Suspension / Ban / Delete).
2. Created `/team/user-profile.html` + `/team/user-profile.js` (PAGE 6): profile card (avatar initial, status badge, joined, last active, honest IP/device lines), five activity stat boxes, real moderation history, IP-history section, their-reviews list with per-review removal recording, community-posts section, and the full action row — Email User (mailto), Suspend modal with duration select + required reason, Ban confirm, Super-Admin-only Delete confirm.
3. User sources: honestly empty roster; Community memberships on this device listed as real local identities; labelled illustrative pair loadable, spammer999 arriving pre-suspended with a genuine 3-day countdown.
4. Moderation engine: timed suspensions with live remaining days and automatic expiry lift, bans, deletions, and review-removal records — all persisted per user with pendingBackendSync history entries.
5. Wired Overview's quick action (👥 Users) and login preview links.

### Files created

- `team/users.html`, `team/users.js`, `team/user-profile.html`, `team/user-profile.js`

### Files changed

- `team/overview.html`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Simulation: 9 checks — empty roster, real-local identity from community join, labelled pair, 3-day suspension countdown, auto-lift on expiry, lift/ban/delete, complete history queue.
- `[x]` All 13 Archive regression fixtures pass; all four files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Real accounts, role claims, IP/device capture, user emails, and public review removal apply at backend activation (CTA §13.B/D).

### Result

The team can now search, inspect, suspend, ban, and audit users through a complete moderation pipeline — honest about every number it cannot yet know, and already recording every decision it can.

---

## v0.55.0 — 2026-08-17 — Support ticket desk (PAGE 7)

**Request reference:** SOP §11, Prompt P-056  
**Status:** `[x]` desk live; real tickets/emails/roster arrive with the support backend

### Executed actions

1. Created `/team/tickets.html` + `/team/tickets.js`: search, status/priority/assignee filters, live count, and ticket cards (number, priority badge, subject, status badge, sender, time, first-message excerpt, assignment, View & Reply) with urgent-first ordering.
2. Created `/team/ticket.html` + `/team/ticket.js`: conversation thread with user/team bubble styling, reply box with attachment note, Send Reply (auto-advances Open → In Progress), Send & Mark Resolved, Close/Reopen with reply lock, autosaving internal notes, and live priority/status/assignee controls with Reassign.
3. Honesty: queue starts empty with explanation; illustrative tickets #246/#247 match the owner's spec content and states and are labelled on every card; team replies carry a visible "queued for email dispatch at backend activation" marker; the example roster is labelled until real team accounts exist.
4. Wired Overview's "Open Tickets → View All" card and login preview links.

### Files created

- `team/tickets.html`, `team/tickets.js`, `team/ticket.html`, `team/ticket.js`

### Files changed

- `team/overview.html`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Simulation: 6 checks — empty queue, spec-state examples, queued reply append, resolve, close/notes/assign/priority persistence.
- `[x]` All 13 Archive regression fixtures pass; all four files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Real ticket intake, user notification emails, attachments, and the true team roster activate with the support backend (CTA §13.B/D).

### Result

The support desk is staffed and ready — the day the first real ticket arrives, the team answers it through a workflow that already works.

---

## v0.56.0 — 2026-08-17 — Bug report desk (PAGE 8)

**Request reference:** SOP §11, Prompt P-057  
**Status:** `[x]` desk live; real reports arrive with the support backend

### Executed actions

1. Created `/team/bugs.html` + `/team/bugs.js`: the ⚠️ what-counts-as-a-bug team reminder, search + website (real catalogue) / status / priority filters, live count, and bug cards per the spec — number, website — title, reporter with View User link, timestamp, browser/device line, priority + status badges, screenshot indicator.
2. View Full Report expands inline: steps to reproduce, expected vs actual, attachment line with honest private-storage note, live priority/status selectors, autosaving internal notes, and the fixed-state notification queue note; high priority sorts first.
3. Honesty: empty queue with explanation; labelled illustrative bug #89 matching the owner's spec card; wired Overview's Bug Reports card and login preview links.

### Files created

- `team/bugs.html`, `team/bugs.js`

### Files changed

- `team/overview.html`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Simulation: 3 checks — empty queue, spec-accurate example, persistent triage.
- `[x]` All 13 Archive regression fixtures pass; files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Real report intake, screenshot storage, and reporter notifications activate with the support backend (CTA §13.D).

### Result

Bug triage is operational — reminder up top, real filters, full reports, and every decision recorded for the day real reports arrive.

---

## v0.57.0 — 2026-08-17 — Requests desk, Announcements, and the dashboard sidebar (PAGES 9–10 + shell)

**Request reference:** SOP §11, Prompt P-058  
**Status:** `[x]` both pages and the navigation shell live

### Executed actions

1. **PAGE 9** — `/team/requests.html` + `requests.js`: most-requested/newest sort, category/status filters, 🔥-count cards with status badges, per-status transition buttons, Send Update to Requester(s) with required message queued pendingBackendDispatch, and labelled spec examples (Paragon Maps 247 · Under Consideration; Paragon Translate V2 189 · In Progress); honestly empty until the Supabase request table activates.
2. **PAGE 10** — `/team/announcements.html` + `announcements.js`: five-type composer, title/message with limits, optional image (name stored; uploads at backend), Publish Now / Schedule with date+time, Preview modal with publish, Save Draft; published list (type badge, timestamp, published-by, Edit/Delete/Publish-Now/View-on-Archive) and a drafts/scheduled list; published records flag pendingFeedSync for the public Updates feed.
3. **Navigation shell** — `/team/nav.js` injects the owner's full sidebar into all eleven dashboard pages: sections (Websites/People/Content/Tasks/Publish/Analytics/Team/System) plus footer (My Profile/Back to Archive/Logout); desktop collapse persists, mobile gets an off-canvas drawer with floating burger; active page highlights; Scheduled/Archived/Banned deep-link through new URL-param filter presets in websites.js/users.js; Roadmap links to the real Hub view; unbuilt sections carry honest "soon" chips with explanatory toasts.
4. Login preview links extended through PAGE 10.

### Files created

- `team/requests.html`, `team/requests.js`, `team/announcements.html`, `team/announcements.js`, `team/nav.js`

### Files changed

- All nine prior dashboard HTML pages (nav injection), `team/websites.js`, `team/users.js`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Simulations: requests desk 3 checks; announcements 4 checks; sidebar verified to contain all 25 owner links with active-state detection.
- `[x]` All 13 Archive regression fixtures pass; new pages/files serve HTTP 200; HTML balanced; `node --check` clean on all five scripts.
- `[!]` Real request rows, requester emails, public feed sync, and the remaining sidebar sections await their backends/spec pages (CTA §13).

### Result

The Team dashboard is now a real product: log in, land on Overview, and reach every desk through the owner's sidebar — ten working pages, honest queues, and every future door already labelled.

---

## v0.58.0 — 2026-08-17 — Roadmap management + platform analytics (PAGES 11–12)

**Request reference:** SOP §11, Prompt P-059  
**Status:** `[x]` both pages live; public-page sync and user/device/country analytics await backends

### Executed actions

1. **PAGE 11** — `/team/roadmap.html` + `roadmap.js`: four-group manager seeded with the real 16-item public roadmap (launch stays Planned per D-084; in-progress seeds carry the true 50/33/17). Add/Edit modal (title, detail, group, percent, visibility), group moves (Mark Complete, to In Progress, to Planned), Update Progress control with live bar, Public/Private toggles with hint-only labelling, Delete with confirm — every change persists and flags pendingPublicSync, with the D-116 note that the public page stays milestone-derived until integration.
2. **PAGE 12** — `/team/analytics.html` + `analytics.js`: four stat cards, working Export CSV (real Blob download of the displayed numbers), date-range selector, and ten sections — users-over-time bars (real zeros with hover labels), real category pie, real top-10 most-visited horizontal bars from recorded views, honest device/country pending states, 12-week SVG line charts (users zeros; bugs from the real desk store), ticket-topic and request-category pies from the live desk stores, and the true Deployed-vs-Paragon catalogue ratio.
3. Sidebar now routes 🗺️ Roadmap → roadmap.html and 📈 Platform Stats → analytics.html (no longer "soon"); login preview links extended through PAGE 12.

### Files created

- `team/roadmap.html`, `team/roadmap.js`, `team/analytics.html`, `team/analytics.js`

### Files changed

- `team/nav.js`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Roadmap simulation: 7 checks — 16 real seeds, true derived percentages, D-084 honesty, percent/move/visibility persistence with sync flags, rendered output.
- `[x]` Analytics simulation: 2 checks — 12-week bucketing with range exclusion; plus real-data chart rendering verified through page load.
- `[x]` All 13 Archive regression fixtures pass; all four files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Public roadmap sync, scheduled percent governance, and user/device/country analytics arrive with the backends (CTA §13.D).

### Result

The team now steers the roadmap and reads the platform's pulse from inside the dashboard — every number real, every future clearly labelled, and the public page's honesty rules intact.

---

## v0.59.0 — 2026-08-17 — Team members + member profiles (PAGES 13–14)

**Request reference:** SOP §11, Prompt P-060  
**Status:** `[x]` both pages live; invitation emails and role claims await the security backend

### Executed actions

1. Created `/team/members.html` + `/team/members.js` (PAGE 13): roster with the real owner record — Paragon · Super Admin · joined Aug 1 2026 · action count computed live from nine genuine dashboard stores — plus pending-invitations list, labelled illustrative member, and per-member actions (View Profile / Change Role / Remove from Team).
2. Invite modal per spec (full name, email, five-role select, system-generated-password note); invitations persist with pendingBackendDispatch, preview their role-mode setup link, and can be cancelled.
3. Created `/team/member-profile.html` + `/team/member-profile.js` (PAGE 14): identity card with status badge and real/illustrative flag, four stat boxes (owner's counted live with an explanatory note), recent-activity timeline assembled from real recorded events, and the Super-Admin-only actions row — Change Role, Suspend/Restore Access, Remove from Team — with the owner account protected and the backend-claims note displayed.
4. Sidebar now routes 🧑‍💼 Team Members → members.html; login preview links extended.

### Files created

- `team/members.html`, `team/members.js`, `team/member-profile.html`, `team/member-profile.js`

### Files changed

- `team/nav.js`, `team/login.html`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Simulation: 8 checks — sole real owner, genuine zero baseline, live action counting across stores (5 actions from 4 seeded stores), labelled example, invite queue, role-change and removal persistence.
- `[x]` All 13 Archive regression fixtures pass; all four files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Real member accounts, password emails, and claim-enforced roles arrive with the security backend (CTA §13.D).

### Result

The team roster is real where it can be — the owner's every dashboard action counts itself — and ready everywhere else, down to invitations that already know which setup link to send.

---

## v0.60.0 — 2026-08-17 — Activity log + 90-day archive vault (PAGES 15–16)

**Request reference:** SOP §11, Prompt P-061  
**Status:** `[x]` both pages live; multi-member attribution and server-side purging await backends

### Executed actions

1. **PAGE 15** — `/team/activity.html` + `activity.js`: unified log aggregating genuinely recorded actions from eleven dashboard stores, day-grouped (TODAY/YESTERDAY/date headings), with search, nine action-type filters, date-range filter, per-entry actor line and contextual links, live count, and a real CSV export of the filtered log.
2. **PAGE 16** — `/team/archive.html` + `archive.js`: three vault sections over real records — deleted users (from the moderation store, with deletion date, actor, and live remaining-day count; View Data/Restore/Purge), archived websites (from manager overrides with real countdowns; Restore to Archive/Purge), and closed tickets (View/Reopen/true local deletion) — plus search and section filter; purge actions record intent for server-side execution with honest catalogue notes.
3. Sidebar routes 📋 Activity Log → activity.html and 🗄️ Archive → archive.html; login preview links extended through PAGE 16.

### Files created

- `team/activity.html`, `team/activity.js`, `team/archive.html`, `team/archive.js`

### Files changed

- `team/nav.js`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Activity simulation: 5 checks — empty start, four-store aggregation, reason/link carriage, TODAY grouping.
- `[x]` Vault simulation: 3 checks — 90-day window, spec-matching countdown math (61 days), overdue clamp.
- `[x]` All 13 Archive regression fixtures pass; all four files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Multi-member attribution, IP-stamped audit trails, and automated server-side purging arrive with the backends (CTA §13.D).

### Result

The dashboard now audits itself and holds its deletions accountable — every recorded action traceable, every deleted record counting down its real 90 days.

---

## v0.61.0 — 2026-08-17 — My Profile + confirmation modals + linking map (PAGE 17 + finishing suite)

**Request reference:** SOP §11, Prompt P-062  
**Status:** `[x]` complete — the owner's entire 17-page Team specification is now built

### Executed actions

1. **PAGE 17** — `/team/profile.html` + `profile.js`: identity card with photo upload (local preview, backend upload deferred), live-counted MY STATS (total actions from nine stores, drafts added, websites managed, genuine days-on-team since Aug 1 2026), EDIT PROFILE with persistence and pendingBackendSync, password change enforcing the real setup-page policy with queued application, and ACTIVE SESSIONS showing only this device's true session (real UA parsing) with honest remote-logout deferral.
2. **Confirmation modals**: shared ParagonTeamConfirm system added to nav.js; the three spec modals wired — 🚫 Ban User Permanently (both Users surfaces; consequence bullets; required written reason), 🗑️ Delete Website Permanently (vault; CANNOT-be-undone warning), 🗑️ Remove Team Member (roster; access-revoked/activity-preserved copy) — replacing browser prompts.
3. **Linking map**: sidebar My Profile went live; member profiles link to the activity log; verified every built-page relationship from the owner's map (login→overview flows, desk cross-links, archive restores, nav-bar constants).
4. **Access summary**: the owner's 30-row page/role table recorded in the SOP as the authoritative permission map for backend claim enforcement.
5. Login preview links extended through PAGE 17.

### Files created

- `team/profile.html`, `team/profile.js`

### Files changed

- `team/nav.js`, `team/users.js`, `team/user-profile.js`, `team/archive.js`, `team/members.js`, `team/member-profile.html`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Profile simulation: 6 checks — UA parsing, policy consistency, REAL days-on-team (17), save persistence, weak-password rejection, queued policy-passing change.
- `[x]` All three spec modals verified wired; shared modal system present on every dashboard page.
- `[x]` All 13 Archive regression fixtures pass; files serve HTTP 200; HTML balanced; `node --check` clean on all seven touched scripts.
- `[!]` Real sessions, photo storage, password application, and claim-enforced access await the security backend (CTA §13).

### Result

The Team dashboard specification is complete: seventeen pages, a full navigation shell, real data throughout, spec-accurate modals, and a permission map waiting only for its backend. The owner's blueprint is now a working product.

---

## v0.62.0 — 2026-08-17 — Final role hierarchy + complete permissions matrix

**Request reference:** SOP §11, Prompt P-063 (owner's final governance artifact)  
**Status:** `[x]` matrix encoded, Permissions page live; backend claims enforce at activation

### Executed actions

1. Created `/team/permissions.js`: the authoritative machine-readable matrix — six-role hierarchy with ranks and notes, all 37 permission rows with true/false/qualifier values ("own", "limited", "own-websites", "own-level-below"), `can(role, action)`, `rankOf`, and `canManageMember` (Admin can never act on the Super Admin; the owner cannot be removed).
2. Created `/team/permissions.html` + `permissions-page.js`: the 🔑 Permissions page rendering hierarchy cards ("that's you" on Super Admin) and the complete table live from the module with a role-column highlighter, qualifier legend, sticky headers, and mobile scroll — read-only law with the enforcement note.
3. Sidebar 🔑 Permissions went live; login preview links updated.

### Files created

- `team/permissions.js`, `team/permissions.html`, `team/permissions-page.js`

### Files changed

- `team/nav.js`, `team/login.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Matrix simulation: 13 checks verifying exact fidelity to the owner's table — Super-Admin-only rows, Moderator suspend-not-ban, Developer own-scope, Support desk scope, Analyst read-only, limited/own-level qualifiers, universal rows, and Admin-cannot-touch-Super-Admin.
- `[x]` All 13 Archive regression fixtures pass; all three files serve HTTP 200; HTML balanced; `node --check` clean.
- `[!]` Server-side claim enforcement of this exact matrix is the security backend's contract (CTA §13.D).

### Result

The Team dashboard now has its constitution: one machine-readable permission law, one page that displays it without drift, and a backend contract ready to enforce it.

---

## v0.63.0 — 2026-08-17 — Enforcement pass: live permission gating, AI closest-match upgrade, real syncs

**Request reference:** SOP §11, Prompt P-064  
**Status:** `[x]` completed — rules enforced, AI fixed, documented syncs implemented

### Executed actions

1. **Permission enforcement:** enforcement layer in permissions.js (role state, page-access law, helpers); nav.js hides disallowed sidebar links, injects the persisted Role-preview selector, and blocks disallowed pages with a 🔐 denial panel; action gating from can() wired into users (suspend/ban/delete), user-profile, archive purges, members management, and request decisions — buttons hidden and handlers guarded; permissions.js now loads on all 18 dashboard pages; the Overview switcher drives the shared role.
2. **AI upgrade:** bigram Dice similarity + graded token fuzzy matching added to the ranking core with similarity always contributing; new ensure option guarantees closest-match suggestions at honestly low confidence; Search Results uses minimumScore 30 + ensure 3; answerSearch tightened (score ≥60 with confidence/similarity floors) so gibberish keeps the Request fallback. Quality: 12/12 messy-query benchmark, gibberish fallback intact, confident answers unchanged.
3. **Real syncs:** app.js merges published Team announcements into the public Updates feed (type/icon mapping, real publish timestamps, storage-safe); archive-hub.js syncPublicRoadmapFromTeam rebuilds the public roadmap groups from the team store — public items only, milestone items keep checklist-derived bars, team-set percents labelled; public roadmap lists gained stable ids and milestone tags.

### Files changed

- `team/permissions.js`, `team/nav.js`, `team/users.js`, `team/user-profile.js`, `team/archive.js`, `team/members.js`, `team/requests.js`, `team/overview.js`, 18 team HTML pages (permissions.js load), `ai/paragon-archive-ai.js`, `app.js`, `archive-hub.js`, `paragon-archive-hub.html`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Enforcement simulation: full page-law verification for all six roles (analyst blocked from 8 pages, support/developer/moderator scopes exact) plus action-condition checks (moderator suspend-only, admin ban-not-delete, super admin all).
- `[x]` AI benchmark: 12/12 messy queries hit top-3; guaranteed fallback returns 3+ for gibberish at low confidence; ai.test.js Request-fallback fixture passes.
- `[x]` All 13 Archive regression fixtures pass; `node --check` clean on every touched script; key files serve HTTP 200.
- `[!]` Server-side claim enforcement, cross-device sync broadcast, and developer own-scope resolution (needs real ownership records) arrive with the backends.

### Result

The dashboard now obeys its own constitution, the AI always finds the nearest websites, and the Team console genuinely publishes into the public Archive — the rules are no longer words; they run.

---

## v0.64.0 — 2026-08-17 — Supabase credentials live: verified, wired, and connection-tested

**Request reference:** SOP §11, Prompt P-065 (owner supplied URL + anon key)  
**Status:** `[x]` credentials active; schema execution is the one remaining owner step

### Executed actions

1. Security verification before embedding: decoded the JWT payload — role=anon ✓, project ref matches ✓, expiry 2036 ✓; a service-role key would have been refused.
2. Wired both values into `config/supabase.js`; `isConfigured()` now returns true and every auth/sync client arms itself.
3. Live connection tests against the real project: `/auth/v1/settings` reachable — **Email provider already enabled by the owner**, Google off (expected, later); REST probes for `paragon_request_count()` and `paragon_user_state` return not-found — **schema.sql has not been run yet**.
4. System Status updated truthfully: 👤 Authentication → 🟢 Operational (Email sign-in live, verified date shown); 💾 Database → 🟠 Connected — schema pending with the exact next step.
5. CTA §13.B: URL/key item and Email-provider item marked done; schema run promoted to NEXT STEP.
6. Service-worker cache bumped v46 → v47 per standing rule P-016 (config.js is in the cached shell); fixture updated.

### Files changed

- `config/supabase.js`, `paragon-archive-hub.html`, `service-worker.js`, `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` Key role/ref/expiry verified by JWT decode; no service-role or password anywhere in the codebase.
- `[x]` Live HTTPS tests: auth settings 200 with email=true; schema probes correctly report missing tables (honest pending state).
- `[x]` All 13 regression fixtures pass; `node --check` clean.
- `[!]` Remaining: owner runs schema.sql (SQL Editor); Google OAuth later; Brevo email later; production-domain redirect allowlist at deployment.

### Result

Paragon Archive is connected to its real backend for the first time — Email accounts can genuinely be created the moment users try, and one SQL paste stands between the project and full data sync.

---

## v0.65.0 — 2026-08-17 — Templates→Originals, quiz play v2, alert purge, whole-project audit

**Request reference:** SOP §11, Prompt P-066  
**Status:** `[x]` completed

### Executed actions

1. **Templates → Paragon Originals:** catalogue definition, AI Brain row, and the governance fixture updated (Originals = Hub + Templates exactly).
2. **Quiz play v2 (owner design):** rebuilt play.html/play.js — start screen (category badge, meta chips, REAL played-count and personal best), circular SVG countdown with urgent state, per-answer inline feedback (✅/❌/⏰ + correct answer + Next), skipped tracking for timeouts, complete screen (animated percent ring, correct/wrong/skipped/time detail boxes, five verdict tiers, new-best line), Review Answers modal, Try Again; results keep saving to the shared store (verified: plays/bests/stats/results.html all compatible). Quiz stylesheet adopted the owner's tokens (#0a0a0f bg, #6c5ce7 accent, #00b894/#ff6b6b state colors) plus all new play-v2 classes.
3. **Alert purge:** quiz create errors now render as an inline scrolled-to panel; ParagonTeamConfirm extended with select/date/text fields; ALL remaining window.prompt/confirm across the dashboard replaced with proper modals (suspend with duration+reason, delete account, change role, remove member, schedule date, delete draft, reject with reason, requester update, ticket/user purges). Verified zero prompt/alert calls remain in team/ and paragon-quiz/.
4. **Whole-project audit:** 29 HTML pages scanned — zero broken file links; every hub anchor resolves.
5. **UX de-bulk:** preview banners slimmed (smaller, quieter, hover-restore), section spacing tightened, secondary notes reduced.
6. Service-worker cache v47 → v48 per P-016; fixture updated; preview server restarted.

### Files changed

- `data/catalogue-expansion-45-100.js`, `docs/AI-BRAIN.md`, `tests/catalogue-governance.test.js`, `paragon-quiz/play.html`, `paragon-quiz/js/play.js`, `paragon-quiz/js/create.js`, `paragon-quiz/css/style.css`, `team/nav.js`, `team/users.js`, `team/user-profile.js`, `team/members.js`, `team/member-profile.js`, `team/websites.js`, `team/deployed.js`, `team/requests.js`, `team/archive.js`, `service-worker.js`, `tests/archive-hub.test.js`, `style.css`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` All 13 regression fixtures pass; `node --check` clean on every touched script; play.html balanced.
- `[x]` Quiz v2 store-compatibility verified (result shape with wrong/skipped/seconds extras saves and counts).
- `[x]` grep confirms zero window.prompt/window.alert across team/ and paragon-quiz/.
- `[x]` 29-page link audit: zero broken references.

### Result

Templates sits with the Originals, the quiz plays like the owner designed it, no browser dialog box survives anywhere in the product, and every link in a 29-page platform resolves.

---

## v0.66.0 — 2026-08-18 — The final seven sidebar pages + the LAB switch

**Request reference:** SOP §11, Prompt P-067  
**Status:** `[x]` completed

### Executed actions

1. **💼 Dev Applications (`team/applications.html/js`):** honest empty queue, labelled illustrative examples, pending → review → accepted/rejected workflow, accept/reject gated by "Accept Developer Applications" (SA/Admin), decisions logged with the honesty note that the real developer role is granted at backend activation. Store `paragonTeamApplications.v1`.
2. **⭐ Reviews & Reports (`team/content-reviews.html/js`):** reported-review queue (dismiss / delete with required reasons; honestly empty until backend) + All Reviews browser over REAL data — device-written reviews REALLY delete from `paragonArchive.guestState.v1` (public Archive reflects it); inherited catalogue samples badged read-only pending the CTA keep-or-remove decision (D-150). Store `paragonTeamReviewReports.v1`.
3. **💬 Community Posts (`team/content-community.html/js`):** board/status/flag filters, hide (reason) / restore / delete (reason) moderation gated by "Delete Community Posts". Store `paragonTeamCommunityPosts.v1`.
4. **💡 Suggestions (`team/content-suggestions.html/js`):** new → review → planned/declined workflow; **Plan + add to Roadmap is REAL** — writes a planned 0% record crediting the suggester into `paragonTeamRoadmap.v1` (already synced to the public hub roadmap), Edit Roadmap-gated, double-promotion refused (D-149). Store `paragonTeamSuggestions.v1`.
5. **🌐 Website Stats (`team/analytics-websites.html/js`):** real per-site table — device-recorded views (ParagonMetrics), 24h views, review counts (catalogue + device), buildProgress bars — search/category/sort, CSV export, developer own-scope note per the matrix.
6. **👤 User Stats (`team/analytics-users.html/js`):** registered counts honestly "backend pending" (schema not run), real-zero signup chart, REAL device engagement (quiz plays/bests, reviews written, community membership), backend-pending panels clearly labelled, CSV export.
7. **⚙️ Settings (`team/settings.html/js`, SUPER ADMIN ONLY):** REAL session security — `session.js` now reads `paragonTeamSettings.v1` idle/warn values (clamped 5–120 min / 30–120 s; `PARAGON_SESSION_CONFIG` test override still wins, D-151); platform flags stored as labelled backend-enforced-later intent; local desk-store maintenance with real record counts and confirm-gated clearing; real system info including the live CACHE_NAME fetched from service-worker.js.
8. **🧪 LAB (`team/lab.html/js` + nav):** new LAB sidebar section rendered as a switch-styled entry (dashed accent card + mini-switch); the workbench previews six real project pages in full/laptop/tablet/mobile frames with the Actions switch OFF by default — a transparent shield blocks every click and key (pure preview). v1 scope honestly labelled pending the owner's full Lab explanation (D-152).
9. **Wiring:** nav.js — zero "soon" placeholders remain, all seven entries are real links; permissions.js PAGE_ACCESS extended (settings SA-only; content trio admits Moderator; Website Stats SA/Admin/Developer(own)/Analyst; User Stats SA/Admin/Analyst; lab open to all six roles).
10. **Regression fixture 14** `tests/team-extension.test.js` (85 checks): nav completeness, page law, store workflows, real review deletion, real roadmap promotion, session-settings wiring, Lab targets/locks, honesty rules.
11. Service-worker cache v48 → v49 per P-016 (style.css shell change); hub fixture assertion updated.

### Files changed

- New: `team/applications.html/js`, `team/content-reviews.html/js`, `team/content-community.html/js`, `team/content-suggestions.html/js`, `team/analytics-websites.html/js`, `team/analytics-users.html/js`, `team/settings.html/js`, `team/lab.html/js`, `tests/team-extension.test.js`
- Edited: `team/nav.js`, `team/permissions.js`, `team/session.js`, `style.css` (P-067 block), `service-worker.js`, `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` All 14 regression fixtures pass (13 previous + new team-extension, 85/85 checks).
- `[x]` `node --check` clean on every new/edited script.
- `[x]` Zero window.alert/prompt/confirm in all new files; every file carries the export-identity header (P-014).
- `[x]` Honesty audit: all queues start empty, examples labelled 🧪 illustrative, no invented user/vote/view numbers.

### Result

The Team sidebar has no "soon" left in it — all 24 destinations are real pages under the enforced permission law, and the new Lab switch opens a locked, no-action preview of the live platform, ready to grow into whatever the owner defines next.

---

## v0.67.0 — 2026-08-18 — Image requirements tracker + logo concepts

**Request reference:** SOP §11, Prompt P-068  
**Status:** `[x]` completed (tracker + concepts) — production batches await owner approval

### Executed actions

1. **`docs/IMAGE-REQUIREMENTS.md` created:** the owner's complete image list converted into a tracked checklist — all 52 numbered items + the per-website 5-image template mapped to honest statuses (✅ exists / 💻 code / 🎨 generatable / 📸 real-shot-after-build / 🧑 owner-only).
2. **Honest inventory:** 3 real image files exist today (hub-hero.jpg, paragon-192/512.png); stars, timeline dots, toast icons, bell, FAQ accordion already implemented as code; skeleton loader + badge/avatar/folder/checkmark SVGs identified as pending CODE work.
3. **Policy D-153:** no fake screenshots of unbuilt websites — per-site screenshot sets (≈750+ images) grow only as sites are really built (Archive/Hub/Quiz/Team capturable today); pre-build site icon art allowed as labelled branding; official Google G asset only; brand assets ship only after the owner picks a logo concept.
4. **Batch plan A–E** proposed in the tracker (brand core → platform illustrations → category icons + 30 achievement badges → real Hub/Quiz screenshot sets → 107 site icons).
5. **Logo concepts generated** into `assets/brand-concepts/`: Concept A — faceted geometric P monogram; Concept B — faceted ◈ diamond mark (echoes the Team dashboard glyph). Labelled proposals, NOT final brand.

### Files changed

- New: `docs/IMAGE-REQUIREMENTS.md`, `assets/brand-concepts/logo-mark-concept-a.png`, `assets/brand-concepts/logo-mark-concept-b.png`
- Edited: `docs/SOP.md` (P-068, D-153, CTA items), `docs/EOP.md`

### Validation

- `[x]` No app code touched — cached shell unchanged, no cache bump needed (P-016 n/a).
- `[x]` All 14 regression fixtures still pass.
- `[x]` Honesty audit: tracker marks nothing ✅ that does not physically exist; concepts stored outside the app shell and not wired into any page.

### Result

The whole image mountain is now a tracked, honest production plan — and the brand conversation starts with two real concept candidates on the table.

---

## v0.68.0 — 2026-08-18 — Official brand shipped (Concept B ◈) + illustration run started

**Request reference:** SOP §11, Prompt P-069  
**Status:** `[x]` completed for this turn — image queue continues next turns

### Executed actions

1. **Official logo (D-154):** owner selected Concept B — faceted ◈ diamond. Produced `assets/brand/`: logo-mark.png (square), logo-full.png (horizontal lockup), og-default.png (share banner with the REAL tagline "The gateway to everything Paragon."), splash.png, pwa-icon.png.
2. **Real icon derivation (PIL):** favicon.ico (16/32/48), favicon-32.png, favicon-16.png, apple-touch-180.png; **live PWA icons paragon-192/512.png overwritten with the new brand** (real files the installed app uses).
3. **Brand wired in:** favicon links + og:title/description/image + twitter:card on paragon-archive.html and paragon-archive-hub.html; favicons on paragon-product-preview.html and paragon-quiz/index.html. og:image documented as relative until the production domain exists.
4. **Illustration set started** (matched flat style, dark navy #0b0e17, blue/violet palette, no baked-in text): empty-search, empty-updates, empty-bookmarks, empty-history, empty-collections in `assets/illustrations/`.
5. **Generation limit honesty:** the 10-image/turn platform cap stopped the run mid-queue; remaining 17 illustrations + 10 category icons + 30 achievement badges queued in the tracker for next turns. In-app wiring waits for the complete matched set (preserve-first).
6. Service-worker cache v49 → v50 per P-016 (shell PWA icons + entry HTML changed); hub fixture updated.

### Files changed

- New: `assets/brand/` (logo-mark, logo-full, og-default, splash, pwa-icon, favicon.ico, favicon-32/16, apple-touch-180), `assets/illustrations/` (5 empty-states), `assets/brand-concepts/` (2 candidates, v0.67.0 turn)
- Overwritten: `assets/icons/paragon-192.png`, `assets/icons/paragon-512.png`
- Edited: `paragon-archive.html`, `paragon-archive-hub.html`, `paragon-product-preview.html`, `paragon-quiz/index.html`, `service-worker.js`, `tests/archive-hub.test.js`, `docs/IMAGE-REQUIREMENTS.md`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` All 14 regression fixtures pass after the cache bump and meta additions.
- `[x]` Honesty audit: OG tagline is the platform's real existing copy; no fake screenshots produced; tracker statuses match physical files.

### Result

Paragon Archive has a real, owner-chosen brand identity live in the tab bar, the installed app icon, and every future shared link — and the illustration factory is rolling.

---

## v0.69.0 — 2026-08-18 — Art wired into the live product + the two owner image bibles preserved

**Request reference:** SOP §11, Prompt P-070  
**Status:** `[x]` completed — image queue continues at 10/turn next turn

### Executed actions

1. **Owner data preserved:** Section 2 (exact icon specs for all 100 websites) and Section 3 (25 platform illustrations with style notes) appended verbatim to `docs/IMAGE-REQUIREMENTS.md` with status columns — nothing the owner sent is lost.
2. **5 images generated (owner cadence):** `empty-reviews.png`, `guest-welcome.png` (built around the real ◈ mark), `cookie-icon.png`, `achievement-locked.png`, `site-icons/paragon-quiz.png` (owner spec #25).
3. **REAL wiring — 10 images live in the product:**
   - Six empty states now show matched illustrations: Search no-results, Saved bookmarks, Recently Visited, Account Reviews, Collections, Updates no-match.
   - Signed-out Account hero: guest-welcome illustration.
   - Locked "More Soon" achievement tile: locked-badge art replaces the 🔒 emoji.
   - Cookie banner: friendly cookie-with-P icon.
   - **Paragon Quiz header logo is its real site icon on all five quiz pages** — the first of the owner's 100-icon set is genuinely deployed (#100 Archive Hub = the logo mark itself, complete by definition).
4. New styles (.empty-illus, .guest-welcome-illus, .ach-lock-illus, .cookie-illus, .quiz-logo-img) with mobile behavior; cache v50 → v51 per P-016.

### Files changed

- New: `assets/illustrations/empty-reviews.png`, `guest-welcome.png`, `cookie-icon.png`, `achievement-locked.png`, `assets/site-icons/paragon-quiz.png`
- Edited: `app.js` (8 wiring points), `paragon-archive.html` (cookie banner), all 5 `paragon-quiz/*.html` + `paragon-quiz/css/style.css`, `style.css` (P-070 block), `service-worker.js`, `tests/archive-hub.test.js`, `docs/IMAGE-REQUIREMENTS.md`, `docs/SOP.md`, `docs/EOP.md`

### Validation

- `[x]` node --check clean on app.js; all 14 regression fixtures pass.
- `[x]` Every generated image now has a live mount point — zero orphaned art from this turn.
- `[x]` Honesty: alt text empty/decorative, no invented content, tracker statuses match physical files.

### Result

The artwork stopped being a folder of files and became part of the product — empty states, the guest door, the locked badge, the cookie, and Paragon Quiz's real icon are all on screen.

---

## v0.70.0 — 2026-08-18 — Hub page heroes wired, 100 MB budget enforced, live tree + next-agent handoff

**Request reference:** SOP §11, Prompt P-071  
**Status:** `[x]` completed

### Executed actions

1. **P-068 list confirmed safe** in IMAGE-REQUIREMENTS §1.1–1.10; unbuilt items stay queued (skeleton loader, card badges, checkmark animation, 404/500/offline/maintenance pages+art, etc.).
2. **5 generated + 5 WIRED:** header-about.jpg (Hub About hero — the "vision" city of connected websites), header-privacy.jpg (shield, Privacy hero), header-support.jpg (headset helper, Help hero), header-request.jpg (idea lightbulb, Request hero), success-submit.png (paper-plane celebration inside the request-form success state).
3. **Size budget (D-156):** PIL optimization — wide art→JPG, spot art→640px quantized PNG, og-default→.jpg (references updated). Assets 24.7 MB → **1.4 MB**; whole project **3.6 MB** of a 100 MB owner budget.
4. **/paragon-file-tree.html regenerated** (147 files, live sizes, budget line) — standing rule: refresh on every structural change.
5. **docs/NEXT-AGENT.md created** — complete handoff brief (owner style guide, law files, standing rules, per-turn workflow, platform map, image queue, where-we-stopped) so a fresh agent continues seamlessly; refreshed every turn.
6. Cache v51 → v52 per P-016 (hub/app/style/og changes); fixture updated.

### Files changed

- New: `assets/illustrations/header-{about,privacy,support,request}.jpg`, `success-submit.png`, `docs/NEXT-AGENT.md`
- Optimized in place: all of `assets/` (brand→smaller, og-default.png→og-default.jpg, concepts/illustrations/site-icons quantized)
- Edited: `paragon-archive-hub.html` (4 hero illustrations), `app.js` (request success art), `paragon-archive.html` + hub (og .jpg refs), `style.css` (P-071 block), `service-worker.js`, `tests/archive-hub.test.js`, `docs/IMAGE-REQUIREMENTS.md`, `docs/SOP.md`, `docs/EOP.md`, `/home/user/paragon-file-tree.html`

### Validation

- `[x]` node --check clean; all 14 regression fixtures pass.
- `[x]` Whole-project size verified 3.6 MB (<100 MB rule).
- `[x]` Every image generated this turn is mounted and visible in browser preview/export.

### Result

Four Hub pages open with real artwork, the request form celebrates for real, the project is 26× lighter than the owner's ceiling, the tree is live, and any future agent can pick up the build from a single document.

---

## v0.71.0 — 2026-08-18 — First 10 of the 20-run wired + tab UX upgrade + system pages

**Request reference:** SOP §11, Prompt P-072  
**Status:** `[x]` first 10 delivered & wired — second 10 owed next turn (10/turn cap)

### Executed actions

1. **10 images generated, optimized, ALL wired:** welcome-hero.jpg (signed-out banner on the Websites tab — hidden the moment a session exists), free-for-everyone.jpg (About §Mission), timeline-journey.jpg (About §Vision), error-404.png, error-500.png, offline.png, maintenance.png, bug-report.png (Hub Help intro, floated), auth-bg.jpg (email auth dialog backdrop), default-avatar.png (real Guest avatar in the Account header).
2. **Four new system pages** at root — 404.html, 500.html, offline.html, maintenance.html — branded, illustrated, theme-aware, linking back to the Archive/Hub; offline.html + its art added to the PWA shell and set as the final SW navigation fallback.
3. **UX upgrade (additive CSS, P-072):** Websites tab — card hover lift + thumbnail zoom, skeleton shimmer while images load (list §1.2 #14 ✅), chip hover; Updates tab — pulsing live badge, card hover slide, active-chip ring, centered empty state; Account tab — stat and section hover states, avatar image support, centered signed-out hero.
4. Cache v52 → v53 per P-016; tracker statuses updated (11 more items ✅); file tree regenerated (162 files, 4.0 MB); NEXT-AGENT §7 updated with the owed second 10.

### Files changed

- New: `404.html`, `500.html`, `offline.html`, `maintenance.html`, 10 files in `assets/illustrations/`
- Edited: `paragon-archive.html` (welcome banner, auth art), `paragon-archive-hub.html` (mission/timeline/bug art), `app.js` (banner toggle, guest avatar), `style.css` (P-072 block), `service-worker.js` (v53 + shell + offline fallback), `tests/archive-hub.test.js`, `docs/IMAGE-REQUIREMENTS.md`, `docs/SOP.md`, `docs/NEXT-AGENT.md`, `docs/EOP.md`, `/home/user/paragon-file-tree.html`

### Validation

- `[x]` All 14 fixtures pass; node --check clean.
- `[x]` Project total 4.0 MB (<100 MB rule).
- `[x]` Every generated image mounted; system pages verified serving.

### Result

Half the 20-run is live on screen, the three main tabs feel alive (hover, shimmer, pulse), and the platform finally fails gracefully — lost, broken, offline and under-repair all have a face now.

---

## v0.72.0 — 2026-08-18 — The honesty purge, the bug-fix trio, Detail UX, category icons, export protocol

**Request reference:** SOP §11, Prompt P-073  
**Status:** `[x]` completed

### Executed actions

1. **Owner-reported bugs fixed (D-157):**
   - *White flash while scrolling:* `html` now paints the theme background and declares `color-scheme`; every `img` gets a dark backing — no more white before content appears.
   - *Faint/blurry text in transitions:* `--text-faint` raised (dark #6b6b7b→#8d8ea0; light #9d9b95→#706e67), interactive color transitions shortened to 0.15s.
   - *Updates page fading under sparse filters:* `.timeline.compact` (auto when ≤3 entries) removes the animated side rails and pulsing dots.
2. **Website Detail UX:** sticky glass info-bar (stats + OPEN always at hand), floating OPEN pill on mobile, calmer hero gradient, section scroll margins, icon-button hover lift — every action untouched.
3. **REAL-NOT-MADE-UP purge (D-158):** all 14 `picsum.photos` random-photo uses replaced by `paragonTile()` — deterministic branded SVG tiles from real catalogue data (works offline, zero external calls, no fake screenshots). Real screenshots take over as each site ships.
4. **Image run (10/10):** category icons — Tools, Creative, Education, Games, Social, Media, Finance, Health, Dev Tools, Originals — per owner spec, transparent corners, 5–8 KB each, wired into the Browse row with emoji fallback for Productivity/Entertainment/Lifestyle/Deployed (queued).
5. **Audit sweep:** 389 hrefs/srcs across every HTML page → zero missing targets; JS-referenced assets all exist.
6. **Export protocol (D-159):** NEXT-AGENT §9 — rename convention (.js→.js.md etc.), the next agent's restore prompt + one-shot script, EXPORT IDENTITY header as source of truth, regenerable-assets guide. No files renamed now, per owner.
7. **File-count reduction:** Paragon Quiz 5 scripts → 1 guarded `js/quiz.js`; team/ merge plan documented with fixture-update warning.
8. Cache v53 → v54; file tree regenerated; NEXT-AGENT §7 updated.

### Files changed

- New: `assets/category-icons/` (10), `paragon-quiz/js/quiz.js`
- Removed: `paragon-quiz/js/{app,create,explore,play,results}.js` (consolidated)
- Edited: `app.js` (paragonTile engine + 14 replacements + compact toggle + category art), `style.css` (P-073 block + contrast tokens), all 5 quiz HTML script tags, `service-worker.js`, `tests/archive-hub.test.js`, `docs/{SOP,EOP,NEXT-AGENT,IMAGE-REQUIREMENTS}.md`, `/home/user/paragon-file-tree.html`

### Validation

- `[x]` 14/14 fixtures green; node --check clean on app.js and quiz.js.
- `[x]` grep: zero picsum references remain in code.
- `[x]` 389-reference audit: zero missing.
- `[x]` Project ~4.1 MB (<100 MB); quiz pages each load exactly one script.

### Result

The Archive stopped borrowing strangers' photos, the dark theme is dark all the way down, faint words can be read, sparse filters look intentional, the Detail page keeps OPEN under your thumb — and the whole project is documented to survive a handoff through a text-only upload channel.

---

## v0.73.0 — 2026-08-18 — Icons everywhere, animation pack, the NEED button, honest loading feel

**Request reference:** SOP §11, Prompt P-074  
**Status:** `[x]` 10 of the requested 20 images delivered (hard 10/turn cap) — remaining 10 owed next turn

### Executed actions

1. **Images (10/10):** category icons Productivity/Entertainment/Lifestyle/Deployed — all 14 Browse categories now carry art — plus site icons #1–6 per the owner's exact §2 specs (Notes, Tasks, Calendar, Clock, Calc, Dictionary), corners transparent, ~5–8 KB each.
2. **Icons EVERYWHERE (owner gap report):** `SITE_ICON_ART` renders real icon art in the Website Detail header icon, the detail byline, and search result rows (emoji fallback preserved); the category **See-All grid** now uses the category art too.
3. **Animation pack:** tab-switch entrance, card/grid entrance, button-press feedback, success pop, achievement-unlock burst (real hook in `unlockNextAchievementStage`), launch-ring pulse — all fully disabled under `prefers-reduced-motion`.
4. **"I NEED this website" (D-160):** under-construction page gains the demand toggle — store `paragonArchive.siteNeeds.v1`, REAL ZERO start, honest "this device" label, undo supported. Team Website Stats shows a **Needs 🙋 column + Most Needed sort + CSV field** so real demand schedules construction order.
5. **Loading honesty + feel:** detail launch ring no longer shows a dead idle "0%" — percent appears only during a real launch (icon pulses, faster fill); the 0% build bar shimmers alive while the REAL value stays zero (labelled).
6. Cache v54 → v55; preview fixture VM guard added; tracker/tree/handoff refreshed.

### Files changed

- New: 4 category icons + 6 site icons in `assets/`
- Edited: `app.js` (SITE_ICON_ART + 5 wiring points + burst hook + ring speed), `product-preview.js` (need system + shimmer + icon art), `team/analytics-websites.{js,html}` (Needs column/sort/CSV), `style.css` (P-074 block), `service-worker.js`, `tests/archive-hub.test.js`, `docs/{SOP,EOP,NEXT-AGENT,IMAGE-REQUIREMENTS}.md`, `/home/user/paragon-file-tree.html`

### Validation

- `[x]` 14/14 fixtures green; node --check clean on all touched scripts.
- `[x]` Need counts start at real zero and toggle ±1 on this device only — no invented demand.
- `[x]` Project ≈4.2 MB (<100 MB).

### Result

Every category wears its icon in both rows, the first six of the hundred site icons exist with two already living inside the product, the whole app moves with intention (unless the user asks it not to), and users can now literally raise their hand for the website they want built next.

---

## v0.74.0 — 2026-08-18 — The Detail AI learns build-state, demand, docs and review intelligence

**Request reference:** SOP §11, Prompt P-075  
**Status:** `[x]` completed

### Executed actions

1. **Signal engine (ai/paragon-archive-ai.js):** `liveSiteSignals` (real buildProgress %, need votes + rank from `paragonArchive.siteNeeds.v1`, real device views via ParagonMetrics, combined inherited+device review corpus, average stars) and `reviewThemes` (stop-worded keyword frequencies ≥2 + explicit wish-sentence extraction).
2. **Five new grounded answer families in answerDetail:**
   - *Build state* — "how close / when / soonest": real %, need votes, demand rank ("#1 = closest to construction"), views signal, real 2027 roadmap targets, and ALWAYS "no individual release date is promised". Live products answer "already REAL — press OPEN".
   - *User needs* — themes and wishes users actually wrote, device vs inherited separated, honest zero when silent.
   - *Future updates* — planned-experience remainder + review signals, permanently labelled "real observed signals, not promises".
   - *Documentation* — PURPOSE/ABOUT/CATEGORY/PLANNED EXPERIENCE digest + where the live concept docs open.
   - *Updates/status enriched* — real build % added to status; updates branch points at the real public feed.
3. **AI-BRAIN §21** documents every source and honesty law; fallback answer now advertises the new abilities.
4. **Fixture 15** `tests/ai-detail.test.js` — 17 checks (rank correctness, no invented dates, live-product truth, theme surfacing, zero-state honesty, localStorage-free survival). Suite 15/15.
5. Cache v55 → v56 (AI core is shell-cached).

### Files changed

- Edited: `ai/paragon-archive-ai.js`, `docs/AI-BRAIN.md`, `service-worker.js`, `tests/archive-hub.test.js`, `docs/SOP.md`, `docs/EOP.md`, `docs/NEXT-AGENT.md`, `/home/user/paragon-file-tree.html`
- New: `tests/ai-detail.test.js`

### Validation

- `[x]` 15/15 fixtures green (old ai.test.js untouched-behavior assertions still pass).
- `[x]` Zero fabricated numbers or dates — every claim traces to a real store, catalogue field, or the public roadmap.

### Result

Ask any website's detail page "how close is this to being built?", "what do users want most?", "what's coming next?", or "show me the docs" — and Paragon AI answers like the project manager it now is, armed with real demand ranks and real review signals, promising nothing it cannot know.

---

## v0.75.0 — 2026-08-18 — Sixteen-point polish: nothing made up, everything branded, AI on-topic

**Request reference:** SOP §11, Prompt P-076  
**Status:** `[x]` completed — Community/Deployed plan awaits owner approval

### Executed actions (16/16)
1. Background reverted (shimmer + img backing removed — the real "white stuff"); Updates compact fix kept.
2. **Made-up purge (D-162):** inherited sample reviews retired everywhere (display + AI); ratings show real user average or "⭐ New"; detail rating stat honest; starter collections deleted — resolves the demo-reviews CTA.
3. Category sweep: map completed to all 14 (4 were missing from the map — art existed), health icon regenerated, See-All grid in achievements style (≥3 across, icon top/name below), overlay title carries icon art.
4. Search: non-exact results labelled "✨ Paragon AI suggestions".
5. Welcome hero greets then auto-collapses (6.5s) — Website of the Day gets its stage back.
6. Brand mark deployed: Archive top bar, Hub top bar, notification prompt, settings Hub row (standing rule: never emoji logo-marks again).
7. Top bar gradient edge + active-tab pill; bottom nav elevated glass.
8. Updates header card with accent edge — stands out, separated.
9. Account: emoji logo block removed (guest art owns the spot); notification prompt redesigned with sign-in CTA.
10. **Team PAGE 25 — Promotions desk:** sponsored/promo notices with enforced sponsor disclosure, real 72h countdown + auto-expiry, stop-early with reason, user-preview card, pendingBackendDispatch honesty, nav + SA/Admin law.
11. Achievement strip merged into the stage summary (owner's position) with progress track.
12. Settings v2 — exactly the owner's list (+password as sole entry point); dark-mode row removed.
13. All about/how-it-works buttons render one identical inline dismissible panel.
14. Detail: small icon art reverted to emoji, large art full-bleed, glassy readable header buttons, related sites in ach-grid, version history = latest only + Read more.
15. Detail AI: greeting responses, "everything about this site" full dump, strict on-topic fallback.
16. `docs/BUILD-PLAN-COMMUNITY-DEPLOYED.md` — gap analysis + layouts/flows for the two 2027 milestones, awaiting approval.

### Files changed
- New: `team/promotions.html/js`, `docs/BUILD-PLAN-COMMUNITY-DEPLOYED.md`; regenerated `assets/category-icons/health.png`
- Edited: `app.js` (purge + 12 features), `ai/paragon-archive-ai.js`, `paragon-archive.html`, `paragon-archive-hub.html`, `team/nav.js`, `team/permissions.js`, `style.css` (P-076 blocks), `service-worker.js` (v57), 5 fixtures updated to the new law, `docs/{SOP,EOP,NEXT-AGENT,IMAGE-REQUIREMENTS}.md`, file tree

### Validation
- `[x]` 15/15 fixtures green after law updates; node --check clean everywhere.
- `[x]` Zero displayed stars/reviews/collections that a real user didn't create.

### Result
The Archive now shows only what users really did, wears its brand in every corner, lets the AI own the fuzzy matches it always produced, and the team can run honest sponsored notices — while the two big 2027 milestones sit planned on paper waiting for one word: approve.

---

## v0.76.0 — 2026-08-18 — The approved plan ships: Community Board + Developer Portal

**Request reference:** SOP §11, Prompt P-077  
**Status:** `[x]` completed — owner runs schema/OAuth/Brevo/founder photo next

### Executed actions
1. **Community Board (A1–A4):** `community-board.html/js` — membership-gated composer, 5 boards, New/Top, likes/comments/reports (real zero), guidelines, mini member profiles; **ONE store with the Team desk** (`paragonTeamCommunityPosts.v1`) — Team hide/remove really removes from the public feed; read-only + join CTA for non-members; pendingBackendSync on every record (A5).
2. **Developer Portal (B1–B5):** `developer-portal.html/js` — landing + 3-step path, the **exact 8-point Team gate displayed publicly** (fixture-enforced mirror), application form → real Team Dev Applications store, accepted-dev dashboard, website submissions → real Team Deployed review store with live status chips.
3. **(B4) Real Deployed merge:** `mergeApprovedDeployed()` in app.js — approved, non-illustrative, team-gated submissions join the public Deployed category at load; honest zero stars, buildProgress 100.
4. **Construction UX v2:** floating icon animation, real-state journey strip (Documented → Being built → Launch), clearer copy — waiting now tells a story.
5. **20-image debt CLEARED:** site icons #7–16 (Files, Paste, QR, Password, Resume, Bookmarks, Contacts, Canvas, Design, Color) generated, rounded, optimized, wired into SITE_ICON_ART → **18/100 site icons done**.
6. **Brand sweep:** 28 team topbars + hub kickers now use the real ◈ mark image.
7. **Audits:** 447 local references — zero missing; back-navigation verified on all standalone pages; no browser dialogs; fixture 16 `community-deployed.test.js` (loop integrity, gate mirror, merge exclusions) — **suite 16/16**.
8. Hub gains both entry links; cache v57 → v58.

### Files changed
- New: `community-board.html/js`, `developer-portal.html/js`, `tests/community-deployed.test.js`, 10 site icons
- Edited: `app.js` (merge + SITE_ICON_ART), `product-preview.js` (journey), `paragon-archive-hub.html` (links + kickers), all 28 `team/*.html` (brand), `style.css` (P-077 block), `service-worker.js`, `tests/archive-hub.test.js`, docs, file tree

### Validation
- `[x]` 16/16 fixtures; zero missing refs; project 4.4 MB.
- `[x]` Honesty: all new counters real-zero; illustrative template excluded from the public merge; gate transparency verbatim.

### Result
The 2027 milestones stopped being roadmap lines: a member can post and be moderated for real, a developer can apply, get approved, submit through the real 8-point gate, and watch their website join the public Deployed category — all before the backend even arrives.

---

## v0.77.0 — 2026-08-18 — THE DATABASE IS LIVE

**Request reference:** SOP §11, Prompt P-079  
**Status:** `[x]` schema verified live — Google/Brevo/founder photo remain

### Executed actions
1. Live probes after the owner ran schema.sql: `paragon_request_count()` → 200/0 (real zero); `paragon_username_available('paragon')` → 200/true; `paragon_user_state` + `paragon_profiles` exist and refuse anon reads exactly per the schema's authenticated-only grants.
2. Hub System Status → Database: **operational, "Connected — schema LIVE"** with probe evidence (no "all systems operational" claims — per-row honesty as always).
3. Google OAuth activation steps handed to the owner. Cache v58→v59.

### Validation
- `[x]` 16/16 fixtures green. Probe outputs captured in-turn (200s + designed 401s).

### Result
Six days of prepared auth code finally has a real database under it — signups are one provider-click away.

---

## v0.78.0 — 2026-08-18 — Need meter v2, AI dates & typos, hub cleanup, icon-squish root cause fixed

**Request reference:** SOP §11, Prompt P-080  
**Status:** `[x]` completed

### Executed actions
1. **Icon bug ROOT CAUSE:** the processor squashed non-square crops — now pads to square first. Productivity regenerated; Health already refit.
2. **10 images:** productivity (fixed) + site icons #17–24, #26 → **SITE_ICON_ART = 27/100**, all wired.
3. **Updates chips = two exact rows (3×3 grid)** + shortened header spacing.
4. **Detail AI:** typo correction (edit-distance snap to intent keywords — "wat futures does it hav" now understood) + added/created-date intent (real addedAt, version, documented updates; construction state referred honestly).
5. **Trending overlay header:** amber accent card, gradient title.
6. **NEED METER v2 (D-165):** unlimited taps (+1 each, no undo), MovieBox count bubble connected by a stem, pop animation, and the honest motivator: "every tap is a real vote — the team builds the MOST-NEEDED websites first."
7. **Construction page above-the-fold:** centered 100vh column — journey strip, need meter, docs button, return link all visible without scrolling; graceful sub-700px fallback.
8. **Hub cleanup:** Team Login button + Team tab removed (secret 🔒 stays), tabs reordered Home → Community → Documentation, footer reduced to © + Archive + 🔒.
9. Cache v59 → v60.

### Validation
- `[x]` 16/16 fixtures; node --check clean; ai fixtures re-verified after training.

### Result
Tapping "I NEED this" now feels like MovieBox and works like a real ballot box, the AI understands bad spelling and knows every site's birthday, and the Hub's front door no longer advertises the staff entrance.

---

## v0.79.0 — 2026-08-18 — Share sheet v2, sticky overlay headers, input polish, media icon

**Request reference:** SOP §11, Prompt P-081  
**Status:** `[x]` completed

### Executed actions
1. **Team search inputs:** one global rule polishes every desk's filter-bar search/text field — inline search glyph, focus ring, tuned placeholders (Website Stats, Community Posts, Applications, Suggestions, Reviews & Reports, and all others).
2. **Share sheet v2:** app-first deep links with same-tab web fallback (visibility-checked): `whatsapp://send` → the device chooser pops with BOTH WhatsApps; `tg://msg_url`, `twitter://post`, `fb-messenger://share` open the real apps; **Instagram added** (copies the link first — honest about platform limits); Gmail/SMS direct handlers untouched; Facebook/LinkedIn/Reddit same-tab web. No new tabs anywhere — Back returns to the Archive.
3. **Sticky overlay headers:** Category + Trending overlay headers now solid+blurred and sticky — scrolling content passes BEHIND them, matching the beloved detail info-bar behavior.
4. **Media icon** regenerated flat-2D (bevel/white remnants gone) through the square-safe pipeline; big-symbol/no-whitespace documented as the icon standard.
5. **Preview cleanup:** down-arrow hint removed; the mid-page PARAGON PRODUCT PREVIEW topbar removed — concept docs now join the stage cleanly.
6. Cache v60 → v61.

### Validation
- `[x]` 16/16 fixtures; node --check clean on app.js/product-preview.js.

### Result
Sharing now behaves like a phone, overlays scroll like the detail page, every team desk search field feels finished, and the construction preview flows as one clean page.

---

## v0.80.0 — 2026-08-18 — GOOGLE SIGN-IN IS LIVE

**Request reference:** SOP §11, Prompt P-082  
**Status:** `[x]` verified

### Executed actions
1. Live /auth/v1/settings probe: **google: ENABLED**, email: ENABLED, signups open, email verification required.
2. Hub System Status → Authentication: operational, "Email + Google sign-in LIVE" (probe-dated, honest per-row claims).
3. SOP activation checklist updated (Google items ✅). Cache v61→v62.

### Result
Both doors are open: users can sign into Paragon Archive with Google or Email against a live database. Brevo + founder photo remain, then the full end-to-end signup test.

---

## v0.81.0 — 2026-08-18 — Settings popup suite, flat-icon purge, board & account polish

**Request reference:** SOP §11, Prompt P-086  
**Status:** `[x]` completed

### Executed actions
1. **Settings v3:** 🔒 Privacy Controls RESTORED (popup); 💬 Request a Website → in-app request form popup; 🆘 Help & Support → new in-app support form popup (honest queue + email fallback); ❓ FAQ popup that live-fetches the EXACT Hub documentation FAQ (details/summary intact, always in sync); Help/FAQ/Privacy as a side-by-side trio.
2. **Smart Community entry (D-166):** members → straight to the Board; guests/non-members → six-step join reminder popup with staggered rise animation → Hub wizard. Board read-only notice removed; board top bar/brand/nav/composer polished.
3. **Updates filters:** category + date side by side, labels above, focus rings.
4. **Account:** hero gradient band, avatar glow ring, badge hovers.
5. **Icon purge:** the 10 remaining category icons regenerated flat 2D edge-to-edge (no bevel, no white) — the full 14-category row now matches the owner's standard.
6. **Image-cap honesty:** 10/turn is a platform hard limit (not the owner's rule to change) — logged; every turn maxes it.
7. Two textual arrows in new copy caught by the fixture (D-092 ban) and removed. Cache v62→v63.

### Validation
- `[x]` 16/16 fixtures; node --check clean.

### Result
Account settings became a control center of real popups instead of doc links, the community has a proper front door for both members and newcomers, and the category row finally wears fourteen matching flat icons.

---

## v0.82.0 — 2026-08-18 — Boom-you-are-in joining, honest roadmap jumps, entry splash

**Request reference:** SOP §11, Prompt P-087  
**Status:** `[x]` completed

### Executed actions
1. **Join popup v2 (D-167):** renders the REAL documentation join section (live fetch, always in sync), six steps REORDERED per the owner, in-popup guidelines reader with Back + Accept, and a genuinely working Join button (membership record written for signed-in users; honest step-1 message for guests; success flips the button to Open the Community Board).
2. **Achievements summary fixed:** stage row shows the stage's own progress; the bar shows overall N of M · % — both recompute with every task change, matching the cards.
3. **Privacy verified/upgraded:** Download My Data confirmed REAL (live backend state + local stores → JSON); Accept-All persists all three; "essential storage" explainer with the AdSense consent note added.
4. **Roadmap truth (auto-derived %):** Community Q&A/suggestions/voting → DONE (Board live); Deployed security review queue → DONE (8-point desk). Community 50%→67%, Deployed 33%→50% by checklist math.
5. **Entry splash:** welcome hero now appears front-and-center over a blurred dark page and fades itself out (~2s, once per session, reduced-motion safe). In-flow banner retired.
6. **Images 10/10:** productivity v3 + site icons #27–35 → **36/100 site icons wired**.
7. Fixture catches (header position, VM guard) fixed same-turn. Cache v63→v64.

### Validation
- `[x]` 16/16 fixtures; node --check clean.

### Result
A newcomer now meets Paragon with a cinematic two-second welcome, joins the community in one popup without ever leaving their profile, and the roadmap finally admits how much of 2027 got built in August 2026.

---

## v0.83.0 — 2026-08-18 — 83% twice, 30-into-1, six hidden dialogs caught

**Request reference:** SOP §11, Prompt P-088  
**Status:** `[x]` completed — 100% on both milestones awaits the owner running community-schema.sql

### Executed actions
1. **Images 10/10:** site icons #36–45 → **46/100 wired**.
2. **Appeals loop (built):** board shows the author their own hidden/removed posts + appeal composer; Team desk gets 🛡️ OPEN APPEAL lines with Approve-restore / Deny-with-reason. Milestone flipped done.
3. **Developer analytics (built):** portal dashboard shows real device views + need votes per approved own website. Milestone flipped done. Publishing-pipeline milestone flipped done (live since P-077).
4. **Community 67%→83%, Deployed 50%→83%** (checklist-derived). Final backend items: `supabase/community-schema.sql` WRITTEN (posts/comments/appeals/applications/submissions + RLS) — owner runs → probe → 100%.
5. **Consolidation:** 30 team controllers → ONE `team/team-pages.js` (location-guarded modules); 28 pages rewired; fixtures updated. **Six hidden window.confirm dialogs exposed and purged.** Files 226→197 (images untouchable per owner).
6. **One AI suggestions component:** duplicate blocks merged into the single ✦ Paragon AI head everywhere; search inputs and results modernized; platform-wide button/link polish.
7. Cache v64→v65.

### Validation
- `[x]` 16/16 fixtures green (team-extension + community-deployed rewired to the consolidated file).
- `[x]` Zero browser dialogs anywhere — re-verified across the merged bundle.

### Result
Two 2027 milestones sit one SQL-run from 100%, thirty files became one without losing a feature, and the consolidation even dragged six old law-breaking dialogs into the light.

---

## v0.84.0 — 2026-08-18 — DOUBLE 100%: the backend went live and the site knows it

**Request reference:** SOP §11, Prompt P-089  
**Status:** `[x]` completed — Mobile App milestone awaits the owner's native-tech decision

### Executed actions
1. **Probe:** paragon_community_posts/comments/appeals + paragon_dev_applications/deployed_submissions ALL live (200, honest empty).
2. **🏆 Community Platform 100% · Developer Portal & Deployed 100%** — probe-dated checklist flips; hub status rows now operational with evidence.
3. **LIVE SYNC:** board posts publish to the real backend when signed in (🟢 live vs 📴 device chips, offline queue preserved, backend posts load-merge); portal applications insert to the live table; stale "at activation" copy replaced with the live truth.
4. **PWA completion:** manifest v2 (shortcuts, categories, display_override, launch_handler), iOS standalone metas, safe-area insets, standalone ergonomics → Mobile App milestone 50% (native decision requested from the owner; TWA recommended, $25 Play account needed for store submission).
5. **Images 10/10:** site icons #46–55 → **56/100**.
6. **Tests 16 → 3 suites** (all checks preserved) → **184 files (87 non-image + 97 protected images)**.
7. Cache v65→v66.

### Validation
- `[x]` 3/3 suites green (containing all 16 original fixtures' checks).
- `[x]` Live-table probes captured in-turn; no invented statuses.

### Result
Two 2027 milestones are DONE in August 2026, a signed-in member's post now travels to a real database, and the whole project fits in 87 code files plus its art.

---

## v0.85.0 — 2026-08-18 — Hub home v2, in-popup profile, TWA decided, search bugs dead

**Request reference:** SOP §11, Prompt P-090  
**Status:** `[x]` completed — native build blocked only on domain + Play account

### Executed actions
1. Re-probe: five tables live → Community 100% + Deployed 100% stand verified.
2. **TWA decision (D-170)** + `native/TWA-BUILD-KIT.md` → Mobile App 67%; remaining two items need the production domain + $25 Play account (requested).
3. **Hub home v2:** hero buttons removed; discussions/most-requested/dev sections removed; quick cards Stats→Roadmap→Docs→Community (in-home scrolls); landing docs reformed as **📋 Official Document** chips; Documentation-page cards restyled as chips, three across; ONE permanent topbar search — types-to-list, clears-to-empty.
4. **Join popup step 4 for real:** 📝 profile form in-popup (name/bio/interests, Save/Back, state line); saved draft feeds the actual membership record; hub step 4 reworded.
5. **Account settings:** 🧑‍💻 Become a Developer popup (former landing dev content + portal CTA).
6. **Fixes/sweeps:** search-input text no longer hides under the icon; rejected logo concepts deleted; splash.png wired as iOS startup image; reference scan — zero orphaned images.
7. Files 193 · suites 3/3 · cache v67.

### Validation
- `[x]` 3/3 suites green; node --check clean on app.js/archive-hub.js.

### Result
The Hub's front page finally breathes, step 4 happens where the user stands, the app has a real path to the Play Store, and not one image in the project is dead weight.

---

## v0.86.0 — 2026-08-18 — One AI, the 4-second doorway, and gates that hold

**Request reference:** SOP §11, Prompt P-091  
**Status:** `[x]` completed — Brevo SMTP still rejecting (500), awaiting Brevo-side activation

### Executed actions
1. **AI corrected for real (D-171):** the owner's ai-suggest-block (confidence %, "Matched:" reasons, category · purpose line) is now THE presentation for every non-exact search; my plain list is deleted; concept-documentation text joined the ranking index.
2. **Splash v2:** 4 s; "Paragon Archive" typewriter synced to a percent ring — 16 characters, 6.25% each, both complete together; page behind fully locked; privacy banner waits for splash-done.
3. **popup-lock everywhere:** no scrolling or clicking behind any sheet/popup/splash.
4. **Join gates:** profile button INCOMPLETE→green COMPLETE; guidelines + checkbox faint until profile saved; checkbox only auto-ticks via the in-guidelines Accept; accepted = locked forever.
5. **Website of the Day:** cinematic category banners (5 generated, concept-art per D-153) + copy veil + 🌟 badge.
6. **Image items:** #10/#11/#12 badges + #18 review avatar + #16 ring → done as code; #24–27 ticked; site icons #56–60 → **61/100**.
7. **Truth sweep:** three REAL update entries (backend live / board open / portal open), footer verification date, board↔portal links.
8. **Need meter v3:** split capsule (button + attached count), bubble-on-head retired.
9. Brevo re-probe: 500 persists — SMTP credentials or Brevo account activation still pending on their side.
10. Suites 3/3 · cache v68 · icon art in trending/staff/recent lists.

### Validation
- `[x]` 3/3 suites; node --check clean across app.js/privacy.js/updates.js/archive-hub.js.

### Result
Search speaks with one AI voice — the owner's; the front door takes four honest seconds to spell its own name; and no popup in the platform can be cheated past again.

---

## v0.87.0 — 2026-08-18 — The Replacement Law + everything real in Updates

**Request reference:** SOP §11, Prompt P-092  
**Status:** `[x]` completed

### Executed actions
1. **D-172 REPLACEMENT LAW (permanent):** new replaces old, old dies same turn. Cleaned: WotD double badge, staff double badge (single badge in the ribbon's spot with a 360° entrance, name protected below), recent double badge.
2. **Hero v2:** views pill top beside the WOTD badge (each standalone), centered name/desc, smaller OPEN pill bottom-right.
3. **ONE search AI:** the P-091 transfer block deleted outright — the ai-suggest-block lives only in the no-match branch, exactly as before.
4. **Updates = REAL ONLY:** updated entries exist solely for Paragon Quiz + Archive Hub; fake Notes maintenance and Contrast featured deleted; milestone entries retyped announcement; "Local preview" badge removed. Real counts: 107 new · 2 updated · 0 maintenance · 0 featured · 4 announcements. Team announcements desk: website dropdown (live catalogue list) required for site-linked types, none for special; published records flow typed+site-linked into the public feed and deletion frees the store for real.
5. **Ticket loop:** in-app support → REAL team ticket (thread shape, medium priority); team reply → user's in-app inbox → unread arrival popup + 🔔 panel merge + read-on-open. Brevo's 300 emails stay reserved for signup codes.
6. **Close-then-celebrate:** support + request forms close, clear, then the shared success overlay (animated SVG circle-check; email-verify art on signup).
7. **Splash v3:** still name, 5 s, percentage-only animation. Guest hero wears the welcome art as background.
8. **Code icons:** official Google G SVG, email SVG, upload utility, notification mark. **Images 10/10:** email-verify + site icons #61–70 → **70/100**.
9. **Join steps** self-mark from real state; profile form gated behind steps 1–2.
10. data/updates.js rebuilt clean; 3 fixtures rewritten to the new truths; suites 3/3; cache v70.

### Result
No ghost twins remain anywhere, the Updates tab tells only the truth, and a support message now completes a full real circle: popup → Team desk → reply → the user's own notification bell.

---

## v0.88.0 — 2026-08-18 — Fifteen banners, one Home tab, the AI settled

**Request reference:** SOP §11, Prompt P-093  
**Status:** `[x]` completed

### Executed actions
1. **Banner set COMPLETE:** 10 new cinematic banners → all 14 categories + default; ONE shared map backs Website of the Day AND every Detail header (tile removed, emoji identity kept, veil preserved).
2. **AI final shape (D-173):** non-exact search → the owner's ai-suggest-block only, docs-trained, genuine matches only (no padding); exact names → plain results. Icon art in suggestion rows.
3. **Sync fixes:** WotD 👁 pill refreshes from real views on every detail close; related-website cards wear the new icons; splash name back at its bottom position (still, no caret).
4. **Staff badge:** right-flush to the card edge, flat side right / round side left, clear of all names.
5. **Account:** notification Sign-in → Account tab; hero gradient veils the full card over the dulled welcome art.
6. **Hub:** search centered with page-wide type-only dropdown ([hidden] enforced) + keyword-smart entries; Official Document chips strict 3-per-row; top bar = Home only (deep links intact); community/board spacing pass.
7. Suites 3/3 · cache v71 · tracker + tree + handoff refreshed.

### Result
Every website now opens under its own cinematic sky, search answers only with real matches under one AI voice, and the Hub breathes with a single calm tab.

---

## v0.89.0 — 2026-08-24 — Announcements become a managed system; the app goes PWA-only; AdSense opens; identity gets a real profile

**Request reference:** SOP §11, Prompt P-094  
**Status:** `[x]` completed

### Executed actions
1. **MANAGED ANNOUNCEMENTS (D-174):** the 4 real launch announcements moved out of `data/updates.js` (now honestly empty) into the Team desk — same ids, texts, dates — seeded in the store AND in `supabase/announcements-schema.sql` (owner runs once; anon sees only published+due, `paragon_team_members` writes). Desk rebuilt: REAL image upload (auto-compressed ≤900px JPEG, ALL types), special-only 🔗 LINK field, true Preview (the exact public card), Save Draft, Schedule with AUTO-publish at due time, Publish Now, edit restores everything, delete removes it from the public feed too, optional ☁️ live-backend mode when signed in. Public feed: uploaded image REPLACES the site icon, opens in a full-size viewer with a ⬇ Download button; special announcements show a LINK pill styled exactly like OPEN (right side, same capsule); scheduled records go live automatically; backend fetch + offline cache in `fetchLiveAnnouncements()`.
2. **ONE SEARCH AI:** the old padded zero-match block (ensure:3, emoji rows) is deleted — exact name gives plain results; every other query gives the single ✦ Paragon AI block with icon art; genuine nothing gives the honest empty state + request path.
3. **IDENTITY (D-176):** OPEN requires Guest-or-login (first-timers routed to Account); views count ONLY completed OPENs (detail views never count); logged-in profile gains ✏️ editable display name (starts from the Google/email name) saved to the account across logins; every login replays the splash; guest→account merge re-verified.
4. **SPLASH v4 (D-178):** hero art PRELOADS before appearing (fixes the flash-unloaded bug), readability veil between art and copy, % inside a bolder glowing ring.
5. **HUB (D-175/D-181):** Home tab nav removed + content up; legal-pages Back appears on any section and returns Home first; board-style topbar underline; search keeps distance from Back and now survives typos (edit-distance ≤2 + synonyms + ranked scoring); Join quick card scrolls to the in-home join section (Join-now opens Community); ALL footer destinations route through the Hub website DETAIL with a pending `then=` destination OPEN honors.
6. **APP = PWA ONLY (D-177):** TWA kit replaced by `native/PWA-APP-MODE.md`; roadmap milestone rebuilt (5/6 done — server push waits on the domain); Account gains 🔔 Enable/Test notifications + 📤 Share (clipboard fallback); honest browser limits documented.
7. **ADSENSE (D-179):** dormant `ads/adsense.js` + 3 reserved labelled slots + `ads.txt` template + `docs/ADSENSE-SETUP.md` (free to apply; domain is the blocker) + roadmap entry.
8. **BUILD KIT (D-180):** `docs/SITE-BUILD-KIT.md` (12 standing rules + linking truth) + `docs/site-specs/_TEMPLATE.md` for the owner's incoming skill material.
9. **CONSTRUCTION PILL:** build % merges right into the bar as ONE complete capsule (dead standalone style swept, D-172).
10. **IMAGES 10/10:** site icons #70–79 (Invoice→Mental) via the owner pipeline — edge-verified no-white, 4–11 KB each — wired in SITE_ICON_ART → **80/100**; tracker ticked.
11. **QUIZ:** all 5 pages — logo opens the Paragon Quiz website detail; board-style topbar effect.
12. **Brevo retested live:** still HTTP 500 (error_id 01a035f2) → Supabase side confirmed fine; `docs/BREVO-CONTACT.md` carries the 3 self-checks + exact support ticket. `docs/GOOGLE-OAUTH-BRANDING.md` carries the consent-screen fix (app name "Paragon Archive", logo, 3 scopes, redirect URI).
13. Team illustration scan: ZERO broken image references; announcements desk gained empty-state art. Team HTML consolidation DELIBERATELY deferred to its own turn (full-regression requirement).
14. Suites 3/3 green (new P-094 fixture locks all of the above) · cache v71→v72 · SOP D-174–D-181 + P-094 + CTA · tracker + tree + handoff refreshed.

### Result
The Updates feed is now a real publishing tool the founder controls end-to-end, the platform behaves like a logged-in product with a real profile, the app question is settled forever (browser install, zero fees), and the money + website-factory tracks (AdSense, build kit) are open and waiting only on the domain and the owner's drops.

---

## v0.90.0 — 2026-08-25 — The maintenance mega-turn: the silent hub killer dies, the AI gets intent-trained, the Team owns A-to-Z, 100/100 icons

**Request reference:** SOP §11, Prompts P-095 (interrupted) + P-096  
**Status:** `[x]` completed

### Executed actions
1. **THE HUB KILLER (real bug, real-DOM caught):** the pages module opened with `if (!byId("hub-top-nav")) return;` — a guard left pointing at the Home nav P-094 removed — so the ENTIRE hub silently died: no see-all, no join flows, no stats, no search. Guard now tests the pages container. Plus the hub Back handler's cross-scope `currentHubView` ReferenceError is fixed via shared `paragonHubCurrentView`. Hub verified end-to-end in jsdom: quick cards, #documentation, Back→Home, #community all flow.
2. **SPLASH (owner bug: "microseconds"):** fires FIRST at DOMContentLoaded (it used to wait for the identity check — seconds on slow networks), holds 5 s UNCONDITIONALLY (prefers-reduced-motion previously cut it to 600 ms — the actual "microseconds" bug), ring restored to its beloved original top-right position, preload gate removed (it caused late pop-in), art fades in behind the legibility veil. Verified: 0→100 % over 4.3 s, clean exit, lock released.
3. **INTENT-TRAINED SEARCH AI (D-187):** INTENT_ROUTES with boost/never/neverAlways tiers — recipe & meal-planning boundaries (medical/renal/diabetic/celiac and health-data analysis NEVER suggest the cooking site), file conversion vs invoice generation, flashcards vs deep-research/data-analysis, shopping picks/deal-timing vs market-research/budgeting, trip planning vs booking transactions, resumes, photo-EDIT vs image-GENERATION (ambiguous queries surface both). 30 intent tests green, e.g. "best laptop under 500" → Shop, "make this photo look like a painting" → Draw (Photo excluded).
4. **TEAM A-TO-Z CONTROL:** PUBLIC FEED manager on the announcements desk mirrors every Updates event 1:1 — edit any entry's wording or hide/restore it; public feed + notifications obey instantly (D-189). CONSTRUCTION DESK on the websites desk — the Team sets every website's real build %, public team note, and can retire the construction surface; the public page obeys live (D-188, pill reverted to the original bar+% layout per owner order). MILESTONE CHECKLISTS editor on the roadmap desk — the Hub roadmap renders the Team's exact lists + recomputed % (D-190).
5. **PHONE NOTIFICATIONS (D-185):** SW push + notificationclick handlers (OS-level "Paragon Archive" pings while the app is closed), connectPhonePush with VAPID placeholder, honest Account copy — permission works now, server delivery waits on domain + keys.
6. **MORE:** footer destinations auto-carry the user (banner + auto-launch) after the detail opens (D-184); guest hero v2 (calm, art-led, warning text demoted to a quiet line); real icon chips on trending/staff/recent cards; **site icons 100/100 COMPLETE** (D-183); quiz standalone export package ready for take-away (D-182); tools/browser-smoke.js permanent real-DOM smoke test.
7. Suites 3/3 green + new P-096 fixture + 30 intent tests + browser smoke; cache v72→v73; SOP/EOP/CTA/handoff/tree refreshed.

### Result
The platform that "wasn't loading completely" now boots clean under a real DOM, the search finally understands what people mean (and what NOT to suggest), the Team desk is the true author of the feed, the roadmap, and every build percentage — and the icon set is finished, 100 of 100.

---

## v0.91.0 — 2026-08-26 — One desk shell, real maintenance, window-manager previews, the install gateway, and 244 files

**Request reference:** SOP §11, Prompt P-097  
**Status:** `[x]` completed

### Executed actions
1. **CONSOLIDATED TEAM DESK (D-191):** all 29 pages merged into `team/desk.html` (30 routed panels + `?page=` routing + per-panel role law + shared role broadcast so sidebar/dash/chip sync both ways + public-surface links). Team folder 32 → 6 files; project 276 → 244 (69 code files). Live-verified: announcements renders 4 published + 60 A-to-Z rows; websites shows 107 rows + 107 construction actions; construction page + save flows; role law denies cleanly.
2. **MAINTENANCE SYSTEM (D-195):** whole-platform lockdown guard on Archive/Hub/preview/board/portal (live-tested: toggling settings maintenanceMode → lockdown screen everywhere; nothing overrides); per-site Under-Review = users get the maintenance card + honest detail banner; settings toggle relabelled LIVE.
3. **PREVIEW WINDOW MANAGER (D-196):** MS-Word-style windows (minimize/maximize/new-tab/close), new windows maximize while previous ones shrink to PIP cards, closing restores exactly-as-left, taskbar for minimized.
4. **INSTALL GATEWAY (D-197):** privacy-style popup with notifications/camera/mic/location toggles (real permission requests, instant test ping, one-setting-for-all-sites) + Install button; Share now shares a `?install=1` link that opens the popup.
5. **AUTO DAY/NIGHT (D-198):** clock-following theme (6:00–18:00 light) on Archive/Hub/desk, 10-minute re-check, manual choice wins.
6. **REVIEW HONESTY (D-199):** realReviewCount + mirror everywhere (trending, staff, recent, detail, Hub stat, team desks) — inherited arrays can never display as counts again.
7. **MORE:** icon-facaded cards (D-192); 10 achievement badges wired (D-193); profile editor popup from a top-right Edit button; community-schema.sql + quiz export removed, schema.sql relabelled EXECUTED; free-real-app answer recorded; P-097 fixture locks it all.
8. Suites 3/3 green + live jsdom verification + browser smoke; cache v73→v74.

### Result
One calm desk, honest numbers everywhere, maintenance that means it, previews that behave like real windows, and an install flow that finally feels like getting an app — with the file count falling and every change regression-locked.

---

## v0.92.0 — 2026-08-26 — Skills become specs, coins go live, maximize goes fullscreen

**Request reference:** SOP §11, Prompt P-098
**Status:** `[x]` completed

### Executed actions
1. **LINK REPAIR (D-200):** every runtime team "View/View & Reply/View Profile" link re-routed to the consolidated desk — the orphaned-link bug the owner hit is dead. The pasted A1–A5/B1–B5 plan verified COMPLETE on both public and team sides.
2. **SITE SPECS (D-204):** all 9 owner skill files merged into docs/site-specs/ with verbatim use/never rules + the free vanilla adaptation law; sites build in-project under /sites/<slug>/ next.
3. **COINS (D-205):** balance + Account stat + shop popup + buy requests + super-admin approval desk + credit mirror + full mechanics/ChatGPT heads-up in docs/COIN-SYSTEM.md.
4. **MORE:** true-fullscreen maximize (D-201); ROUTE_KEYWORDS search layer (D-202 — cook/anki/weather/deal/cv/pdf all route correctly); RxLife + Pharmapaedia honest Deployed entries (D-203); deployment + changes-tracking guides (D-206); badges 11–20 (20/30).
5. Suites 3/3 + AI keyword probes green; cache v75; docs/tree refreshed.

### Result
The owner's skill library is now a buildable spec library, the coin economy has a real working core, and the deployment path to a live HTTPS domain is a documented 15-minute job.

## v0.93.0 — 2026-09-03 — First in-project product wave: nine /sites/ builds + catalogue wiring

**Request reference:** SOP §11, Prompt P-099
**Status:** `[x]` completed

### Executed actions
1. **Workspace restored** from GitHub `main` into session branch `arena/01a065d9-paragon-archive` after the renamed-zip upload path failed.
2. **Read law docs** (NEXT-AGENT, EOP tail, SOP CTA, SITE-BUILD-KIT, nine site-specs) and continued from the P-098 handoff: *build the first websites under /sites/<slug>/*.
3. **Shared kit** `sites/_shared/site-kit.css` + `site-kit.js` — quiz-family tokens, Paragon bar, theme auto/manual, storage helpers, no alert/confirm/prompt.
4. **Nine product sites** (vanilla HTML/CSS/JS, localStorage engines, identity headers, unclickable home examples, Archive logo links):
   - `sites/invoice-generator` → catalogue **Paragon Invoice**
   - `sites/resume-maker` → **Paragon Resume**
   - `sites/recipe-creator` → **Paragon Recipe**
   - `sites/flashcard-generator` → **Paragon Flash**
   - `sites/file-converter` → **Paragon Files**
   - `sites/travel-assistant` → **Paragon Travel**
   - `sites/meal-planner` → pairs with **Paragon Recipe** (meal board + shopping)
   - `sites/photo-editor` → **Paragon Photo**
   - `sites/personal-shopper` → **Paragon Shop** (shortlist desk; honest no-checkout)
5. **Catalogue wiring** in `data/catalogue-expansion.js` + `data/catalogue-expansion-45-100.js`: real `siteUrl` under `sites/…`, `previewOnly: false`, honest `buildProgress` 55–80 (not 100 until owner demo pass), `live: true`. Merge paths now clear `previewOnly` when a real URL is set.
6. **REALLY_UPDATED** list extended in `app.js` for the eight newly opened catalogue products.
7. **Cache** `paragon-archive-v76`; P-099 fixture; LIVE_SITES set updated so unfinished-preview law still holds for the rest.
8. **File tree** regenerated (314 files · ~6.2 MB). Governance: SOP P-099, NEXT-AGENT stop point, CHANGES rewritten.

### Result
The Archive now opens eight real same-origin product builds (plus Meal as a Recipe companion tool) instead of concept previews. Each site is local-first, free, and family-styled.

### Remaining
- Owner demo pass before any `buildProgress → 100`.
- Badges 21–30; more skills → more specs → more /sites/.
- Brevo account hold; announcements SQL; production domain.

## v0.94.0 — 2026-09-03 — Coins backend SQL, withdrawals, product-site depth (P-100)

**Request reference:** SOP §11, Prompt P-100  
**Status:** `[x]` completed

### Context
Owner re-attached 10 skill/coin master files; Arena upload path did not materialise files on disk again. Build proceeded from in-repo COIN-SYSTEM + site-specs (same source family as the uploads) and delivered the SQL pack the owner asked to run immediately.

### Executed actions
1. Authored `supabase/coins-schema.sql` (wallets, ledger, purchases, withdrawals, config, RPCs) + `supabase/SQL-RUN-PACK.md`.
2. Extended Paragon Coins front-end: shop history, withdrawal requests, team Paid desk, debit mirror sync.
3. Deepened all 9 `/sites/` products (substitutions, Anki export, invoice CSV/share link, resume cover letter, travel entry checks, photo overlay/rotate, meal←recipe import, shopper compare, files job log).
4. Cache v77; P-100 fixture; governance updated.

### Result
Owner can run announcements + coins SQL today. Coins buy/withdraw loop is complete on-device; SQL makes it multi-device-ready. Product sites closer to skill fidelity without paid APIs.

### Remaining
- Owner runs SQL pack; owner economics rates replace placeholders.
- When full skill MD files land on disk/GitHub, merge any extra rules still missing.
- Badges 21–30; Brevo hold.

## v0.95.0 — 2026-09-03 — Skills from GitHub uploads; coins master Phase 1b; site maintenance (P-101)

**Request reference:** SOP §11, Prompt P-101  
**Status:** `[x]` completed

### Executed actions
1. Pulled `uploads/*` + `PARAGON-COINS-MASTER-BUILD-SPEC.md` from origin/main into the session branch; mirrored to `docs/skills/`.
2. Authored `supabase/coins-master-phase1.sql` (accounts, economic settings ₦1=1, feature flags real_money=false, payments, withdrawals v2, competition/leaderboard stubs, audit) + `OWNER-SQL-CHECKLIST.md` with VERIFY SQL (sandbox cannot DNS-reach Supabase — owner must run VERIFY).
3. Coin UI: packs 1:1, real-money OFF copy, withdrawal fee ≥10000 → 50 coins, min withdraw 500.
4. Updates: product-wave announcement seed; quiz free/compete honesty; product depth (SM-2, ratios, travel pacing, files roadmap).
5. Cache v78; suites green; SQL run pack updated.

### Result
Owner has a clear SQL VERIFY + run order. Financial engine foundation matches the master build spec without enabling real money. Nine product sites continue to deepen against skill files.

### Remaining owner actions
- Paste OWNER-SQL-CHECKLIST VERIFY results.
- Run any SQL still false (announcements → coins-schema → coins-master-phase1).
- Brevo, domain, payment provider, badges 21–30.

## v0.96.0 — 2026-09-03 — Complete skill partials + coins master Phase 2 (P-102)

**Request reference:** SOP §11, Prompt P-102  
**Status:** `[x]` completed

### Executed actions
1. Completed browser-local skill depth for all 9 product sites (Files/Resume/Photo/Flash/Invoice/Shop/Meal/Recipe/Travel) via real engines — no fake codecs or checkout.
2. Authored `coins-master-phase2.sql` authority RPCs (ledger post, payment intents, withdrawal lock/settle, admin adjust) per master build spec; FE guest gates + RPC wiring with honest offline fallback.
3. Catalogue feature lists + buildProgress updated honestly (high 80s–low 90s, not 100).
4. Cache v79; suites green including P-102 fixture.

### Honesty boundary
- Coins real-money remains **OFF** until owner flips flag after provider + compliance + SQL live.
- Browser balance is display/cache; server ledger is authority when Phase 2 SQL is run.
- File skill items needing pandoc/ffmpeg/HEIC stay guide-only.

### Remaining owner actions
- Run VERIFY + SQL order 1→4 in OWNER-SQL-CHECKLIST / SQL-RUN-PACK.
- Choose payment provider before enabling real_money.
