# PARAGON ARCHIVE — AI BRAIN

> **Document identity:** `/docs/AI-BRAIN.md`  
> **Version:** 1.0 · August 5, 2026  
> **Role:** Comprehensive knowledge, retrieval, reasoning, safety, API, evaluation, and operations specification for future Paragon Archive AI.  
> **Truth statement:** This document is a knowledge brain and implementation blueprint. It is **not** a newly trained foundation model and no external AI API, secret key, vector database, or production inference server is connected yet.

---

## 1. What “AI Brain” means here

The Brain is the governed body of facts and rules a future assistant/search service must retrieve before answering. It combines:

1. **Catalogue truth** — website names, groups, categories, purposes, features, versions, dates, URLs, and preview status.
2. **Platform truth** — Search, details, rankings, Account, Guest, collections, reviews, Updates, notifications, PWA, privacy, request, support, and Hub behavior.
3. **Policy truth** — Terms, Community Guidelines, Cookie Policy, Privacy, developer and Deployed rules.
4. **Operational truth** — what is live, prepared, preview-only, planned, or blocked.
5. **Response rules** — how to answer, cite internal evidence, admit uncertainty, avoid hallucination, and route unmet needs to Request a Website.
6. **Future implementation plan** — retrieval, embeddings, API, backend, security, evaluation, monitoring, and updating.

The future AI should behave as a **retrieval-grounded Archive guide**, not as an unrestricted system that invents products or claims unavailable systems are operational.

## 2. Source-of-truth precedence

When sources disagree, use this order:

1. Latest active catalogue merge (`data/catalogue-expansion-45-100.js` after earlier data files).
2. Current application behavior (`app.js`, `archive-hub.js`, `privacy.js`).
3. Current Supabase schema and Edge functions.
4. Current Hub public policies and status labels.
5. SOP decision register and latest prompt execution.
6. Older EOP entries only as history, never as current behavior when superseded.

Never treat an old version entry, mock screenshot, sample rating, sample developer, sample price, roadmap concept, or future policy as current production evidence.

## 3. Current system map

| Area | Current truth |
|---|---|
| Canonical entry | `paragon-archive.html` |
| Public information/forms | Consolidated in `paragon-archive-hub.html` anchors |
| Product destinations | Archive Hub is real; other unfinished products use tailored shared concept previews |
| Authentication | Supabase clients/schema prepared; owner activation pending |
| Guest | Session-only; 30-minute continuous hidden/offline expiry; live state merges on authentication |
| Search | Local weighted descriptive matching, autocomplete, inline hint, recent searches, dedicated Results mode |
| AI Search | Not connected; this document specifies the future implementation |
| Updates | Generated + curated events, exact type/category/date filtering, ten-entry pages |
| Notifications | Auth welcome/updates; future protected public ad/promotion records; 24/72-hour expiry |
| Requests | Account-only real Supabase path; one accepted request per rolling seven days; Guest draft only |
| Support | Public Edge-function path, private screenshots, three messages/email/24h |
| Analytics | Device-local preview metrics only; no production global analytics |
| Ads | No AdSense script; future consent + protected Team workflow required |
| Deployed/Community/Team | Documented but not launched |
| Account deletion | Protected backend pending |

## 4. User intents the Brain must understand

### Discovery intents
- Find a website by exact/partial name.
- Find by category, purpose, task, problem, audience, or feature.
- Handle typos, abbreviations, mixed case, vague phrases, and “I wish this existed” language.
- Compare two or more websites using only catalogue facts.
- Explain why a result matches.
- Suggest related alternatives without exposing a public catalogue total.

### Platform-help intents
- How to search, open, preview, use New Tab, bookmark, collect, review, vote, share, install, change theme, manage privacy, request, or contact Support.
- Explain Guest versus authenticated behavior and return-to-intent navigation.
- Explain rankings honestly as current device-local previews.
- Explain notification eligibility and expiry.

### Policy/status intents
- Terms, acceptable use, prohibited conduct, privacy, cookies, Analytics, ads, Deployed, developer rules, Community, Team access, account deletion, system readiness, and roadmap.
- Distinguish **available**, **prepared**, **limited**, **planned**, and **concept preview**.

### Unmet-need intent
If no confident catalogue match exists:
1. Say no matching website was found.
2. Offer the closest honest alternatives only when confidence is sufficient.
3. Explain Paragon is building more.
4. Route to `paragon-archive-hub.html#request-site`.
5. Never invent a website name or claim it is live.

## 5. Retrieval and ranking blueprint

### 5.1 Search document per website
Each indexed document should contain:
- canonical name and normalized suffix without “Paragon”;
- group and visible category;
- description, About, tag, features, updates, version, date;
- generated synonyms and task phrases reviewed by Paragon;
- production/preview status;
- related category family;
- allowed policy/status metadata.

### 5.2 Hybrid retrieval
Use three lanes:
1. **Lexical** — normalized tokens, prefixes, typo tolerance, BM25/trigram.
2. **Semantic** — embeddings for purpose/idea matching.
3. **Rules** — exact name/category boosts, status filters, safety/policy constraints.

Suggested score (tune with evaluation data):
```text
0.42 lexical relevance
0.32 semantic similarity
0.12 exact/prefix name boost
0.06 category/task match
0.04 feature evidence coverage
0.04 quality/status confidence
```

Do not rank by fabricated popularity. Production global/personalized ranking signals may be added only after the analytics backend exists and consent/retention rules are approved.

### 5.3 Confidence
- **High:** exact name or multiple strong evidence fields — answer directly.
- **Medium:** useful intent match — show 3–5 candidates and explain each match.
- **Low:** do not pretend — show no-match/Request guidance.

## 6. Inline autocomplete brain

Inline hinting is deterministic UI assistance, not AI:
- compare case-insensitively;
- preserve user-typed case;
- use website suffixes unless the user types “Paragon”;
- show only the longest common next portion;
- never replace text until Tab/ArrowRight acceptance;
- show no inline hint when candidates diverge at the next character;
- keep the list below the input separate from the inline hint.

## 7. Response contract

Every future AI answer should internally produce:
```json
{
  "intent": "discovery|help|policy|status|comparison|request",
  "confidence": 0.0,
  "answer": "plain-language answer",
  "matches": [{"name":"Paragon Notes","reason":"evidence-based reason"}],
  "evidence": ["catalogue field or policy section"],
  "status": "available|preview|prepared|planned|unknown",
  "requestSuggested": false
}
```

User-facing output should be concise, explain matches, and label previews/planned features. Internal evidence can be logged without exposing private user state or hidden catalogue totals.

## 8. Hallucination and honesty rules

The Brain must never:
- invent websites, features, ratings, reviews, developers, prices, dates, incidents, user totals, or build percentages;
- claim Supabase/Brevo/AdSense/Analytics/Community/Deployed/Team systems are operational before activation;
- expose secrets, private screenshots, service-role data, passwords, auth tokens, support rows, or another user’s state;
- claim an iframe will always work;
- claim immediate account deletion;
- present concept previews as completed production products;
- infer medical, financial, legal, or safety guarantees from product names.

When uncertain, say what is known, what is pending, and where the user can verify/request help.

## 9. Backend/API design

### 9.1 Recommended services
- Node.js/TypeScript API or Supabase Edge functions for the first secure version.
- PostgreSQL catalogue/search tables; optional `pgvector` after semantic retrieval is approved.
- Scheduled ingestion from governed source files.
- Server-side provider key only; browser receives no AI key.
- Per-account/IP-aware infrastructure rate limiting only after privacy review; avoid fingerprinting.

### 9.2 Suggested endpoints
```text
POST /api/archive/search
POST /api/archive/assistant
GET  /api/archive/sites/:slug
POST /api/archive/feedback
GET  /api/archive/brain/version
```

### 9.3 Search request
```json
{"query":"something for homework","limit":8,"mode":"hybrid","locale":"en","sessionContext":{"signedIn":false}}
```

### 9.4 Security
- strict schema validation and length limits;
- allowlisted model/provider and timeouts;
- prompt-injection isolation: catalogue/policy documents are data, never instructions;
- CORS allowlist and CSRF strategy where applicable;
- no service-role/provider key in HTML/JS;
- output escaping and safe URL allowlist;
- audit logs without raw secrets or unnecessary personal queries;
- quotas, abuse detection, circuit breaker, and local-search fallback.

## 10. Privacy and retention

- Search text may be sensitive; minimize collection.
- Device recent searches remain local/session-only under current behavior.
- Server AI query logging should default to short retention or aggregate metrics and require policy disclosure.
- Do not use private account/support/request data for model training without explicit lawful consent and governance.
- Honour `ParagonPrivacy.analyticsAllowed()`, `trackingAllowed()`, and `adsAllowed()`.
- Provide deletion/export coverage for any future server query history.

## 11. Evaluation plan

Maintain a reviewed dataset with:
- exact names and prefixes;
- mixed case and misspellings;
- category queries;
- vague problems (“help me study”, “make a CV”, “calm sounds”);
- overlapping products;
- no-match requests;
- adversarial prompt injection;
- policy/status questions;
- prohibited data requests.

Measure Recall@5, MRR, no-match precision, explanation evidence coverage, hallucination rate, latency, fallback rate, and user feedback. Production release requires zero secret leakage and a documented hallucination threshold.

## 12. Updating the Brain

On every catalogue/policy change:
1. Validate source and chronology.
2. Rebuild normalized documents.
3. Recompute embeddings if used.
4. Run regression/evaluation cases.
5. Version the Brain and index together.
6. Deploy behind a rollback switch.
7. Keep local weighted Search as fallback.

## 13. Complete catalogue knowledge (107 current records)

> Public UI must not advertise this internal total. It appears here because this is an owner/developer AI knowledge document, not the public catalogue interface.

| # | Website | Group | Category | Purpose | Features / evidence | Destination state |
|---:|---|---|---|---|---|---|
| 1 | Paragon Vibe | Entertainment & Media | Entertainment | Mood-based experience | Mood input; Matching music; Color palette; Quote; Activity suggestion; Wallpaper | Concept preview |
| 2 | Paragon Notes | Productivity & Tools | Tools | Rich text note taking | Folders; Tags; Markdown support; Export; Search | Concept preview |
| 3 | Paragon Chess | Games | Games | Chess | Play versus AI; Multiple difficulties; Move hints; Game history | Concept preview |
| 4 | Paragon Code | Education & Learning | Education | Code editor and runner | HTML/CSS/JavaScript/Python; Live preview; Syntax highlighting; Console output; Save projects | Concept preview |
| 5 | Paragon Music | Entertainment & Media | Media | Music player | Playlists; Shuffle; Repeat; Equalizer; Synced lyrics display; Favorites | Concept preview |
| 6 | Paragon Design | Creative & Design | Creative | Graphic design studio | Templates; Text; Shapes; Images; Built-in logo maker; Export | Concept preview |
| 7 | Paragon Finance |  | Finance | Track, save and grow your wealth. | New savings tracker; Expense categories; Monthly reports | Concept preview |
| 8 | Paragon Health |  | Health | Wellness and mindful living. | New breathing timer; Weekly wellness report; Hydration tracker | Concept preview |
| 9 | Paragon Social |  | Social | Connect with people who inspire. | New circle feature; Topic groups; Quiet mode | Concept preview |
| 10 | Paragon Education |  | Education | Courses and lessons that stick. | Project-based tracks; Peer review; New course library | Concept preview |
| 11 | Paragon Tools |  | Tools | Everyday utilities that work. | New unit converter; Text formatter; Image resizer | Concept preview |
| 12 | Paragon Originals |  | Creative | Hand-crafted creative experiences. | Launch of Originals collection; First three sites live | Concept preview |
| 13 | Paragon Resume | Productivity & Tools | Productivity | Resume and CV builder | Templates; Flexible sections; Export to PDF; Live preview; Cover letter builder | Concept preview |
| 14 | Paragon Whiteboard | Creative & Design | Creative | Infinite whiteboard | Drawing; Sticky notes; Shapes; Collaboration; Infinite zoom and pan | Concept preview |
| 15 | Paragon Palette | Creative & Design | Creative | Color matching tool | Interior room colors; Outfit colors; Brand colors; AI suggestions | Concept preview |
| 16 | Paragon Exam | Education & Learning | Education | Mock exam simulator | Timed tests; Multiple subjects; Scoring; Review answers; Progress tracking | Concept preview |
| 17 | Paragon Tutor | Education & Learning | Education | AI homework helper | Ask questions; Explanations; Step-by-step solutions; Subject categories | Concept preview |
| 18 | Paragon Confess | Social & Communication | Social | Anonymous sharing | Anonymous confessions; Reactions; No usernames; Moderation filters | Concept preview |
| 19 | Paragon Events | Social & Communication | Social | Event management | Create events; Date/time/location; RSVP; Invite link; Calendar sync | Concept preview |
| 20 | Paragon Sounds | Entertainment & Media | Entertainment | Ambient sound mixer | Rain; Forest; Fire; Ocean; City; Custom mix; Timer; Background play | Concept preview |
| 21 | Paragon Theater | Entertainment & Media | Entertainment | Screenplay writer | Script format templates; Character manager; Scene builder; Export to PDF | Concept preview |
| 22 | Paragon Bet | Games | Games | Prediction tracker | Friendly predictions; Track results; Friends leaderboard | Concept preview |
| 23 | Paragon Survival | Games | Games | Survival adventure | Text survival scenarios; Choose your path; Resource management | Concept preview |
| 24 | Paragon Invest | Finance & Business | Finance | Investment simulator | Paper trading; Virtual portfolio; Track gains/losses; Learn investing | Concept preview |
| 25 | Paragon Wardrobe | Lifestyle & Health | Lifestyle | Outfit planner | Upload clothing items; Mix and match outfits; Plan by day; Seasonal organization | Concept preview |
| 26 | Paragon Journal | Lifestyle & Health | Lifestyle | Daily journal | Daily prompts; Mood tracking; Photo entries; Timeline view; Private and secure | Concept preview |
| 27 | Paragon Deploy | Web & Developer Tools | Dev Tools | Static site deployer | Upload HTML/CSS/JavaScript; Live link; Simple hosting | Concept preview |
| 28 | Paragon Contrast | Web & Developer Tools | Dev Tools | Accessibility checker | Color contrast ratios; WCAG compliance; Font size suggestions | Concept preview |
| 29 | Paragon Tasks | Productivity & Tools | Tools | Todo and task manager | Lists; Priorities; Due dates; Subtasks; Progress tracking | Concept preview |
| 30 | Paragon Calendar | Productivity & Tools | Tools | Schedule and events | Day view; Week view; Month view; Reminders; Color coding | Concept preview |
| 31 | Paragon Clock | Productivity & Tools | Tools | Time management hub | World clock; Alarm; Timer; Stopwatch; Pomodoro focus timer | Concept preview |
| 32 | Paragon Calc | Productivity & Tools | Tools | Calculator and converter | Basic calculator; Scientific calculator; Unit converter; Currency converter; Number base converter | Concept preview |
| 33 | Paragon Dictionary | Productivity & Tools | Tools | Words and language | Definitions; Synonyms; Antonyms; Pronunciation; Translator for 50+ languages | Concept preview |
| 34 | Paragon Files | Productivity & Tools | Tools | All file operations | PDF viewer and merger; Image/document/video/audio converter; File compressor; Batch processing | Concept preview |
| 35 | Paragon Paste | Productivity & Tools | Tools | Clipboard and text tools | Text formatter; Case changer; Character counter; Lorem ipsum generator | Concept preview |
| 36 | Paragon QR | Productivity & Tools | Tools | QR code toolkit | URL QR generator; Text QR generator; WiFi/contact QR generator; Camera QR scanner | Concept preview |
| 37 | Paragon Password | Productivity & Tools | Tools | Security tools | Password generator; Strength checker; Random username generator | Concept preview |
| 38 | Paragon Bookmarks | Productivity & Tools | Tools | Bookmark and link manager | Save URLs; Folders; Tags; Quick search | Concept preview |
| 39 | Paragon Contacts | Productivity & Tools | Tools | Contact and address book | Store contacts; Groups; Birthday reminders; Export/import | Concept preview |
| 40 | Paragon Canvas | Creative & Design | Creative | Drawing and painting | Brushes; Layers; Colors; Shapes; Export PNG/SVG | Concept preview |
| 41 | Paragon Color | Creative & Design | Creative | Color everything | Palette generator; Color picker; HEX/RGB/HSL converter; Gradient maker; Contrast checker | Concept preview |
| 42 | Paragon Icons | Creative & Design | Creative | Icon library | Search icons; Filter by style; Download SVG/PNG; Copy code | Concept preview |
| 43 | Paragon Fonts | Creative & Design | Creative | Font explorer | Browse fonts; Font pairing suggestions; Preview custom text; Copy CSS | Concept preview |
| 44 | Paragon Photo | Creative & Design | Creative | Photo editing suite | Filters; Crop and resize; Adjustments; Text overlay; Avatar/profile picture creator; Collage maker | Concept preview |
| 45 | Paragon Meme | Creative & Design | Creative | Meme generator | Template library; Custom text; Image upload; Trending formats | Concept preview |
| 46 | Paragon Mood | Creative & Design | Creative | Mood board creator | Drag and drop images; Colors; Text; Pins; Aesthetic boards | Concept preview |
| 47 | Paragon Learn | Education & Learning | Education | Learning hub | Courses; Tutorials; Science facts; History timeline explorer; Video lessons | Concept preview |
| 48 | Paragon Quiz | Education & Learning | Education | Quiz platform | Create quizzes; Take quizzes; Timed mode; Leaderboards; Share | Concept preview |
| 49 | Paragon Flash | Education & Learning | Education | Flashcard study tool | Create decks; Spaced repetition; Flip cards; Study statistics | Concept preview |
| 50 | Paragon Math | Education & Learning | Education | Math solver and grapher | Step-by-step solving; Graphing calculator; Formula reference | Concept preview |
| 51 | Paragon Type | Education & Learning | Education | Typing trainer | Speed test; Accuracy tracker; Lessons; Custom text; Leaderboard | Concept preview |
| 52 | Paragon Language | Education & Learning | Education | Language learning | Vocabulary; Phrases; Pronunciation; Flashcards; Daily lessons | Concept preview |
| 53 | Paragon Kids | Education & Learning | Education | Kids education games | ABCs; Numbers; Shapes; Colors; Matching; Puzzles | Concept preview |
| 54 | Paragon Debate | Education & Learning | Education | Argument builder | Topic selection; Arguments for and against; Structured debate format | Concept preview |
| 55 | Paragon Mind | Education & Learning | Education | Mind mapping | Mind maps; Idea branches; Color coding; Drag and rearrange; Export | Concept preview |
| 56 | Paragon Chat | Social & Communication | Social | Communication hub | Real-time messaging; Voice messages and notes; Digital letters; Group chats; Media sharing | Concept preview |
| 57 | Paragon Forum | Social & Communication | Social | Discussion boards | Topics; Threads; Replies; Upvotes; Categories; Moderator tools | Concept preview |
| 58 | Paragon Poll | Social & Communication | Social | Polls and voting | Create polls; Multiple choice; Yes/no; Live results; Share link | Concept preview |
| 59 | Paragon Meet | Social & Communication | Social | Video and audio meetings | Video calls; Audio calls; Screen share; Meeting rooms; Join via link | Concept preview |
| 60 | Paragon Wall | Social & Communication | Social | Public message board | Public messages; Reactions; Topic tags; Trending wall posts | Concept preview |
| 61 | Paragon Connect | Social & Communication | Social | Community matching | Interest-based profiles; Similar-person matching; Groups | Concept preview |
| 62 | Paragon Feed | Social & Communication | Social | Social media feed | Text/photo posts; Likes; Comments; Following; Trending posts | Concept preview |
| 63 | Paragon Collab | Social & Communication | Social | Document collaboration | Real-time shared documents; Cursor tracking; Comments; Version history | Concept preview |
| 64 | Paragon Radio | Entertainment & Media | Media | Internet radio | Live stations by genre; Favorites; Now playing information; Background play | Concept preview |
| 65 | Paragon Beats | Entertainment & Media | Entertainment | Beat maker | Drum pads; Loops; Sequencer; Tempo control; Export audio; Share beats | Concept preview |
| 66 | Paragon Watch | Entertainment & Media | Media | Video platform | Upload videos; Streaming; Likes and comments; Subscriptions; Channels; Built-in short clip creator | Concept preview |
| 67 | Paragon Read | Entertainment & Media | Media | Reading platform | eBooks; Articles; Bookmarks; Reading progress; Night mode; Font controls | Concept preview |
| 68 | Paragon Comics | Entertainment & Media | Media | Comics hub | Read comic strips; Create comic strips; Panels; Templates | Concept preview |
| 69 | Paragon Anime | Entertainment & Media | Media | Anime tracker | Anime database; Watchlist tracking; Ratings; Reviews; Recommendations | Concept preview |
| 70 | Paragon Movie | Entertainment & Media | Media | Movie database | Movie information; Trailers; Reviews; Watchlist; Ratings; Recommendations | Concept preview |
| 71 | Paragon Podcast | Entertainment & Media | Media | Podcast player | Browse podcasts; Play episodes; Playlists; Speed control; Bookmarks | Concept preview |
| 72 | Paragon Stories | Entertainment & Media | Media | Story platform | Write short stories; Read community stories; Genres; Featured stories; Comments | Concept preview |
| 73 | Paragon Mixes | Entertainment & Media | Entertainment | DJ mixing tool | Two decks; Crossfader; BPM sync; Effects; Transitions; Record mix | Concept preview |
| 74 | Paragon Puzzle | Games | Games | Puzzle games hub | Jigsaw; Sliding puzzles; Sudoku; Word scramble; Crossword; Brain teasers | Concept preview |
| 75 | Paragon Cards | Games | Games | Card games | Solitaire; Snap; Memory match; Blackjack; Card flip | Concept preview |
| 76 | Paragon Trivia | Games | Games | Trivia game show | Categories; Timed questions; Streak scoring; Leaderboard | Concept preview |
| 77 | Paragon Arcade | Games | Games | Mini arcade | Snake; Tetris; Breakout; Space Invaders; Pac-Man-style games | Concept preview |
| 78 | Paragon Race | Games | Games | Racing game | Browser racing; Keyboard controls; Tracks; Time trial | Concept preview |
| 79 | Paragon RPG | Games | Games | Text adventure | Story-driven choices; Inventory; Stats; Multiple endings | Concept preview |
| 80 | Paragon Draw | Games | Games | Drawing game | Pictionary-style play; Word prompts; Drawing; Guess other drawings | Concept preview |
| 81 | Paragon Spin | Games | Games | Random picker | Spin wheel; Coin flip; Dice roll; Random number; Random name | Concept preview |
| 82 | Paragon Budget | Finance & Business | Finance | Finance hub | Expense tracker; Income tracker; Built-in bill splitter; Salary calculator; Tax estimator; Budget goals; Charts | Concept preview |
| 83 | Paragon Invoice | Finance & Business | Finance | Invoice generator | Create invoices; Add items; Calculate totals; Export PDF; Track payments | Concept preview |
| 84 | Paragon Crypto | Finance & Business | Finance | Crypto tracker | Live prices; Portfolio tracker; News; Price alerts; Charts | Concept preview |
| 85 | Paragon Stocks | Finance & Business | Finance | Stock market | Stock prices; Watchlist; Charts; Market news; Company information | Concept preview |
| 86 | Paragon Shop | Finance & Business | Finance | E-commerce builder | Product listings; Cart; Checkout flow; Store template | Concept preview |
| 87 | Paragon Receipt | Finance & Business | Finance | Receipt and expense scanner | Upload receipt photos; Extract data; Categorize; Monthly reports | Concept preview |
| 88 | Paragon Recipe | Lifestyle & Health | Lifestyle | Recipe and cooking | Recipe search; Meal planner; Shopping list; Cook mode timer | Concept preview |
| 89 | Paragon Fit | Lifestyle & Health | Lifestyle | Health and fitness hub | Workout planner; Exercise library; BMI calculator; Calorie/nutrition tracker; Water intake tracker; Progress charts | Concept preview |
| 90 | Paragon Sleep | Lifestyle & Health | Lifestyle | Sleep tracker | Bedtime reminders; Sleep log; Sleep quality tracking; Tips | Concept preview |
| 91 | Paragon Mental | Lifestyle & Health | Lifestyle | Mental wellness | Meditation timer; Breathing exercises; Mood journal; Daily affirmations | Concept preview |
| 92 | Paragon Habits | Lifestyle & Health | Lifestyle | Habit tracker | Daily habits; Streaks; Reminders; Statistics; Accountability | Concept preview |
| 93 | Paragon Travel | Lifestyle & Health | Lifestyle | Trip planner | Itinerary builder; Packing lists; Budget tracker; Destination information | Concept preview |
| 94 | Paragon Weather | Lifestyle & Health | Lifestyle | Weather forecast | Current weather; 7-day forecast; Hourly forecast; Alerts; Multiple cities | Concept preview |
| 95 | Paragon Quotes | Lifestyle & Health | Lifestyle | Quote library | Browse by category; Save favorites; Daily quote; Share | Concept preview |
| 96 | Paragon Countdown | Lifestyle & Health | Lifestyle | Countdown timers | Event countdowns; Birthdays; Deadlines; Share; Widget | Concept preview |
| 97 | Paragon Dev Tools | Web & Developer Tools | Dev Tools | Developer testing suite | JSON formatter/validator; Regex tester/explainer; API tester; HTTP request builder; Response viewer | Concept preview |
| 98 | Paragon Speed | Web & Developer Tools | Dev Tools | Website speed tester | URL testing; Load time; Performance score; Suggestions | Concept preview |
| 99 | Paragon Domain | Web & Developer Tools | Dev Tools | Domain name generator | Keyword input; Domain suggestions; Availability ideas | Concept preview |
| 100 | Paragon SEO | Web & Developer Tools | Dev Tools | SEO checker | URL analysis; Meta tags; Headings; Keyword density; Suggestions | Concept preview |
| 101 | Paragon Markdown | Web & Developer Tools | Dev Tools | Markdown editor | Markdown writing; Live preview; Export HTML; Cheat sheet | Concept preview |
| 102 | Paragon Snippets | Web & Developer Tools | Dev Tools | Code snippet library | Reusable snippets; Organize by language; Search; Copy | Concept preview |
| 103 | Paragon Random | Productivity & Tools | Tools | Random generator | Random facts; Names; Ideas; Places; Colors; Numbers; Quotes; Jokes; Challenges | Concept preview |
| 104 | Paragon Time Capsule | Lifestyle & Health | Lifestyle | Future self messages | Write a message; Future delivery date; Receive it later; Reflection prompts | Concept preview |
| 105 | Paragon Alive | Lifestyle & Health | Health | Daily inspiration and wellbeing | Daily quote; Challenge; Gratitude prompt; Life reminder; Motivation feed | Concept preview |
| 106 | RxLife Network | Deployed family | Health | Healthcare network | Professional directory; Patient resources; Pharmaceutical index; Appointment flow | In development by Paragon — honest 0% (P-098) |
| 107 | Pharmapaedia | Deployed family | Health | Pharma encyclopedia | Drug encyclopedia; Searchable monographs; Interaction notes; Plain-language summaries | In development by Paragon — honest 0% (P-098) |
| RxLife Network | Health / Deployed family | Healthcare professional directory, patient resources, pharmaceutical index | In development by Paragon — honest 0% until construction starts (P-098) |
| Pharmapaedia | Health / Deployed family | Drug encyclopedia, searchable monographs, interaction notes, plain-language summaries | In development by Paragon — honest 0% until construction starts (P-098) |
| 106 | Paragon Templates | Paragon Originals | Originals | Ready-made website template marketplace | Browse professional website templates by purpose and style; Live template preview before purchase; One-time template purchase — future payment integration; Free hosting inside Paragon Archive after purchase — planned; Optional paid custom-domain hosting upgrade — planned; Personalization requests for colors, logo, and content; Templates for portfolios, businesses, stores, and events | Concept preview |
| 107 | Paragon Archive Hub | Paragon Originals | Originals | Official Paragon Archive channel and publishing gateway | Complete Paragon Archive overview and documentation; Terms, Community Guidelines and Cookie Policy; Developer requirements and Deployed-category specification; Request a Website access; About, Privacy and Terms & Conditions; Deploy or host a website in Paragon Archive — future moderated submissions; Roadmap and platform updates with honest system status; Future Paragon Team secure login gateway | Archive Hub |

## 14. Platform feature knowledge

### Website discovery
- Seven-site daily Website of the Day snapshot; device-local metrics preview.
- Weekly Monday–Sunday Trending influenced by previous daily appearances, views, ratings, and reviews.
- Daily Staff opportunity ranking prioritizing underexposed sites.
- Recently Added uses normalized August 2026 chronology.
- Browse by exact visible category; Deployed is planned and empty.

### Details
- Screenshots/lightbox, About/tags, Key Features, version history, related sites, ratings/reviews, Link & QR, collections, iframe preview, and New Tab fallback.
- About collapses to three rendered lines only when overflow exists.
- Key Features show three items before conditional Read more; Version History follows the same rule when more than three entries exist; Updates timeline descriptions clamp at three lines only when needed.
- Ratings & Reviews sort/filter first, then show the latest/ordered ten per page with Previous/View more replacement pagination.
- Most unfinished products open a tailored shared concept preview; this is not a final build.

### Identity and state
- Signed out: browsing/search/details; personal actions request identity.
- Guest: temporary session-only state, 30-minute away/offline expiry, ad/promotion notices only.
- Authenticated: Supabase RLS state after activation, welcome/update notices, cross-product progress.
- Personal-action redirects preserve an allowlisted pending intent and return after Guest/Email/Google activation.

### Collections
One website belongs to only one collection. Moving it removes previous membership. Legacy duplicates are normalized.

### Achievements
22 tasks in stages of five, with a final two-task stage. Completing one stage unlocks the next. Progress Starter begins stage two. More Soon reports total remaining tasks.

### Notifications
- Authenticated welcome/update/request receipt: 24 hours.
- Future protected Team ad/promotion: 72 hours and sponsored disclosure; visible to Guest/authenticated users.
- Guest receives no welcome or catalogue update notification.

### Requests and Support
- Request requires account, one accepted request per rolling seven days, Guest draft only.
- Contact email routes request receipt to email; blank email routes in-app receipt.
- Support is public, 3/email/24h, screenshot max 10MB, private Storage, human response promise, no fake bot reply.

## 15. Policy knowledge summary

- Paragon-built products are intended free; future Deployed products may have transparent premium features.
- No spam, manipulation, abuse, harassment, doxxing, fraud, phishing, hacking, injection, scraping, malware, DoS, illegal/harmful content, impersonation, unapproved ads, or resale.
- Community/Developer/Deployed/Team systems are planned, not operational.
- Secure deletion, production monitoring, Analytics, AdSense, and broader backend administration remain pending.
- Nigeria-based project with international privacy principles; production legal review remains required.

## 16. Operations and handoff checklist

Before another agent builds AI:
- read SOP, EOP, and this Brain;
- verify today’s date and status labels;
- run all regression suites;
- never add provider keys to browser files;
- select provider/model/backend only after owner approval;
- define budget, quotas, retention, evaluation thresholds, and fallback;
- keep this document and catalogue index versioned;
- update CTA with every external dependency.

## 17. Open decisions for the owner

- AI provider versus self-hosted/open model;
- budget/free-tier expectations and maximum latency;
- whether queries may be logged and for how long;
- personalization opt-in and use of authenticated history;
- supported languages;
- moderation boundaries for health/finance/legal questions;
- model feedback and appeal process;
- deployment origin and server runtime.

## 18. One-core, multi-mode Paragon AI architecture

Paragon should operate **one AI core** with governed mode routing, not unrelated AIs. The same retrieval, safety, identity, logging, and backend layer can receive an allowlisted mode:

- `archive-search` — active local intent ranking for messy/vague/typo-filled website discovery.
- `website-detail` — active local grounded Q&A for the currently open website.
- `tutor` — reserved future teaching mode for Paragon Tutor.
- `product:<id>` — reserved product-specific mode using that product's approved knowledge and tools.
- `code`, `image`, `voice`, `translation` — reserved until provider, privacy, safety, and authorization requirements are approved.

Modes change instructions, knowledge scope, and permitted tools. They do not expose separate provider keys or bypass common policy.

## 19. Uploaded JavaScript prototype security audit

The uploaded `paragon-archive-ai.md` was confirmed to contain JavaScript and was treated as a design prototype, not shipped unchanged. Unsafe or inaccurate prototype patterns that must not return include:

- token-like BuildPico value embedded in browser source;
- Groq/Gemini/OpenRouter keys entered and stored in browser localStorage;
- direct browser calls to model providers;
- keyless external provider chains with no availability, privacy, or output guarantees;
- incomplete hard-coded catalogue claiming full 106-record coverage;
- fake Request submission alerts that do not use the authoritative Supabase limit;
- unrestricted generated HTML `srcdoc` preview;
- broad image/voice/translation features activated without consent/provider review;
- claims that models or live Wikipedia are always available.

The safe replacement is `/ai/paragon-archive-ai.js`. It reads the governed live catalogue, exposes one mode registry, performs local intent retrieval and Detail Q&A, and contains no provider key. Future external inference must use `config.aiEndpoint` only after a protected server/Edge implementation is deployed; the browser must never hold provider secrets.

## 20. First active release contract

The first active release deliberately exposes only Search and Website Detail modes:

1. Search expands reviewed intent concepts, tolerates small typos, ranks evidence from names/categories/purposes/features/About, and returns confidence/reasons.
2. Website Detail Q&A answers purpose, features, category, version, preview status, free/premium policy, and opening behavior from the selected catalogue record.
3. Unsupported questions receive bounded guidance instead of invented facts.
4. Tutor and other product modes remain present in the registry but inactive until their real products, curricula, tools, moderation, and backend are ready.

## 21. Detail signal engine — build-state, demand, documentation, review intelligence (P-075)

The Website Detail assistant now answers five deeper question families, grounded ONLY in data that really exists at answer time:

| Question family | Real sources read at answer time |
|---|---|
| "When will it be built / how close is it / soonest?" | `site.buildProgress` (real %), `paragonArchive.siteNeeds.v1` (need votes + rank across all recorded needs), `ParagonMetrics.getViewCount` (real device views), the public roadmap's real 2027 targets |
| "What do users want/need most?" | Inherited sample reviews + device-written reviews from `paragonArchive.guestState.v1`; keyword-frequency themes (≥2 mentions, stop-worded) + explicit wish sentences (want/need/wish/add/please/…) |
| "What future updates will it get?" | Documented planned features not yet delivered + review themes + need votes — ALWAYS labelled "real observed signals, not promises" |
| "Show me the documentation" | Purpose/about/category/planned-experience digest + where the live concept documentation opens (the under-construction page) |
| "What's new / version?" | `site.version`, documented `site.updates`, pointer to the real public Updates feed |

**Honesty laws for this engine (test-enforced by `tests/ai-detail.test.js`, 17 checks):**
- No invented dates — every build-state answer carries "no individual release date is promised".
- Live products (Quiz, Hub) answer "already REAL" — never fake construction talk.
- Need counts/ranks honestly labelled as this-device until backend aggregation; zero-signal sites say "honest zero".
- Demand ranking is the scheduling truth: rank #1 of recorded needs = "closest to construction".
- Engine survives environments without localStorage (empty-signal fallback, no crash).
