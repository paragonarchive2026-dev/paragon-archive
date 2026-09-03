<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: IMAGE-REQUIREMENTS.md
  EXPECTED PROJECT PATH: /docs/IMAGE-REQUIREMENTS.md
  ROLE: The owner's complete image requirements list (P-068) converted into a tracked production checklist — every item mapped to an honest sourcing status.
  RESTORE/LOAD NOTE: Governance document. Update statuses as images are produced; never mark an item ✅ unless the file really exists in /assets/.
-->

# 🎨 PARAGON ARCHIVE — IMAGE PRODUCTION TRACKER

**Source:** Owner's complete image requirements list, logged 2026-08-18 as prompt **P-068**.
**Policy (D-153):** every image is REAL or clearly labelled. No fake screenshots of unbuilt websites, ever.

## STATUS LEGEND

| Status | Meaning |
|---|---|
| ✅ EXISTS | File really present in `/assets/` today |
| 💻 CODE | Implemented (or to implement) as inline SVG / CSS — no image file needed |
| 🎨 GENERATE | AI-generatable now; brand items need owner approval of concepts first |
| 📸 REAL SHOT | Real screenshot — only possible after that website is actually built |
| 🧑 OWNER | Only the owner can provide (photos, brand-official assets, decisions) |

## HONEST STARTING INVENTORY (2026-08-18)

Real image files grew substantially after P-069+ batches. Achievement badges: **30/30** as of P-105. Starting note was: — `assets/hub-hero.jpg`, `assets/icons/paragon-192.png`, `assets/icons/paragon-512.png`. Everything else visual is currently emoji or inline SVG in code. Real built products available for REAL screenshots right now: **Paragon Archive (main app), Archive Hub, Paragon Quiz, Team Dashboard** — nothing else is built yet, so nothing else can be screenshotted honestly.

---

## §1.1 BRAND & IDENTITY

> **2026-08-18 (P-069):** owner selected **Concept B — faceted ◈ diamond** as the official mark. Batch A produced & wired.

| # | Image | Status | Plan |
|---|---|---|---|
| 1 | Logo Mark (SVG+PNG) | ✅ `assets/brand/logo-mark.png` (PNG; clean SVG redraw still worthwhile later) | Owner-approved Concept B |
| 2 | Full Logo (mark + wordmark) | ✅ `assets/brand/logo-full.png` | Horizontal lockup |
| 3 | Founder Photo | 🧑 OWNER | Open CTA item — only a real photo of you |
| 4 | Open Graph image 1200×630 | ✅ `assets/brand/og-default.png` — wired into Archive + Hub meta | Uses the REAL tagline "The gateway to everything Paragon."; og:image URL becomes absolute at production-domain decision |
| 5 | Favicon ICO + 32px | ✅ `assets/brand/favicon.ico` + `favicon-32.png` + `favicon-16.png` — wired into all 4 entry pages | Derived from the mark via PIL |
| 6 | PWA icon 512 | ✅ regenerated on-brand — `assets/icons/paragon-512.png` + `paragon-192.png` overwritten (real files, cache v50) | Maskable-safe padding |
| 7 | Splash screen | ✅ `assets/brand/splash.png` | PWA splash manifest wiring later |

## §1.2 HOMEPAGE / BROWSE

| # | Image | Status | Plan |
|---|---|---|---|
| 8 | Hero banners ×5 (Website of the Day) | ✅ WIRED — 5 cinematic CATEGORY banners (`assets/hero-banners/`, concept art not fake screenshots per D-153) back the rotation with a copy veil + WOTD badge; real screenshots replace them per site at build |
| 9 | Category icons ×10 | ✅ WIRED — `assets/category-icons/` in the Browse row (P-073); Productivity/Entertainment/Lifestyle/Deployed still emoji, queued | Owner's 10 done |
| 10 | Staff Pick badge | ✅ 💻 CODE — golden ribbon chip live on the staff feature card |
| 11 | Trending badge | ✅ 💻 CODE — flame gradient chip live on trending thumbs |
| 12 | New badge | ✅ 💻 CODE — glowing NEW chip live on Recently Added cards |
| 13 | Empty-search illustration | ✅ `assets/illustrations/empty-search.png` (wiring into app.js pending full set) | Telescope character |
| 14 | Loading skeleton | ✅ 💻 CODE — shimmer on card/collection thumbnails (P-072) |

> **Illustration production log (P-069):** produced so far — empty-search, empty-updates, empty-bookmarks, empty-history, empty-collections (all in `assets/illustrations/`). ⏳ Queue (10-image/turn generation limit reached): empty-reviews, guest-welcome, auth login/signup backgrounds, email-verify, 4 page headers, bug, success, 404, 500, offline, maintenance, cookie, default-avatar — then 10 category icons and 30 achievement badges. In-app wiring happens once the full matched set exists.

## §1.3 + PER-WEBSITE TEMPLATE (×107 catalogue sites)

Per site: icon 200², card preview 800×400, hero 1200×600, 3–5 detail shots 1080×720, OG 1200×630 → **≈750+ images at full catalogue**.

| Scope | Status | Plan |
|---|---|---|
| Paragon Archive Hub set | 📸 REAL SHOT — possible NOW | Real captures of the live Hub |
| Paragon Quiz set | 📸 REAL SHOT — possible NOW | Real captures of the live Quiz |
| Remaining 105 sites | 📸 blocked — honest | Screenshots only as each site is really built (buildProgress rises). Until then cards keep the current honest styled-tile look |
| Site icons (200²) | 🎨 partially | Stylized icon art per site is acceptable BEFORE build (it's branding, not a fake screenshot) — can generate in prioritized batches |
| Per-site OG images | 🎨 after logo | Template: icon + name + description on brand dark background |

## §1.4 DETAIL PAGE

| # | Image | Status |
|---|---|---|
| 15 | Hero screenshot per site | 📸 REAL SHOT (see §1.3) |
| 16 | Circular OPEN loading ring | ✅ 💻 CODE — live on every detail (percent shows only during real launches) |
| 17 | Star rating graphics | ✅ 💻 CODE — already inline SVG in app.js |
| 18 | Review default avatar | ✅ WIRED — default-avatar art backs every review avatar |

## §1.5 UPDATES TAB

| # | Image | Status |
|---|---|---|
| 19 | Timeline dot icons (4 type colors) | ✅ 💻 CODE — timeline types already color-coded |
| 20 | Update card thumbnails | 📸 tied to per-site preview images |
| 21 | Empty updates illustration | 🎨 GENERATE (currently emoji empty-state) |

## §1.6 ACCOUNT TAB

| # | Image | Status |
|---|---|---|
| 22 | Default profile avatar | ✅ WIRED — `default-avatar.png` shown for Guest sessions |
| 23 | Achievement badges | ✅ **50/50** in `assets/achievement-badges/` + wired in `BADGE_ART` (P-106 ads/leaderboard/engagement 31–50) |
| 24–27 | Empty bookmarks/history/collections/reviews | 🎨 GENERATE — 4-piece matched illustration set |
| 28 | Guest mode illustration | 🎨 after logo (uses logo) |
| 29 | Collection folder icon | 💻 CODE — recolorable SVG folder |

## §1.7 AUTH PAGES

| # | Image | Status |
|---|---|---|
| 30–31 | Login/Signup backgrounds | ✅ WIRED — `auth-bg.jpg` as the email auth dialog backdrop (single shared banner) |
| 32 | Google G icon | ✅ 💻 CODE — official multicolor G as inline SVG per brand guidelines |
| 33 | Email icon | ✅ 💻 CODE — envelope SVG in the auth buttons |
| 34 | Success checkmark animation | ✅ 💻 CODE — animated circle+check draws in every success overlay |
| 35 | Email verification illustration | ✅ WIRED — shows in the signup success overlay |

## §1.8 SETTINGS & SUPPORT

| # | Image | Status |
|---|---|---|
| 36 | Privacy header (shield/lock) | 🎨 GENERATE |
| 37 | Support header (friendly helper) | 🎨 GENERATE |
| 38 | Request header (lightbulb energy) | 🎨 GENERATE |
| 39 | About header (vision cinematic) | 🎨 GENERATE |
| 40 | FAQ +/− icons | ✅ 💻 CODE — accordion already implemented |
| 41 | Bug report illustration | 🎨 GENERATE |
| 42 | Documentation step screenshots | 📸 REAL SHOT — the six guide screenshots already open in CTA |
| 43 | Upload icon | ✅ 💻 CODE — masked SVG utility class .icon-upload |
| 44 | Submission success illustration | 🎨 GENERATE |

## §1.9 ERROR & SYSTEM PAGES

| # | Image | Status | Note |
|---|---|---|---|
| 45 | 404 illustration | 🎨 GENERATE | ⚠️ a 404 page itself doesn't exist yet — build page + art together |
| 46 | 500 illustration | 🎨 GENERATE | Same — needs the page |
| 47 | Offline illustration | 🎨 GENERATE | SW offline fallback can adopt it |
| 48 | Maintenance illustration | 🎨 GENERATE | Pairs with the new Settings maintenance flag |

## §1.10 NOTIFICATION & SYSTEM UI

| # | Image | Status |
|---|---|---|
| 49 | Bell icon + unread dot | ✅ 💻 CODE |
| 50 | Notification panel header | ✅ — brand mark lives in the notifications panel |
| 51 | Toast icons ×4 | ✅ 💻 CODE |
| 52 | Cookie-with-P icon 🍪 | 🎨 GENERATE — fun one |

---

## 📊 TOTALS & HONEST SUMMARY

- **💻 Code/SVG items:** ~17 (several already live; skeleton loader, badges set, avatar, folder, check-anim to build)
- **🎨 AI-generatable now:** ~25 unique illustrations/icon-sets (+30 achievement badges +107 site icons as batches)
- **📸 Real-screenshot items:** the big ~750-image mass — grows automatically as real websites get built; only Hub/Quiz/Archive/Team sets are honestly possible today
- **🧑 Owner-only:** founder photo, Google official icon usage approval, logo concept pick, brand tagline for OG image

## 🚦 PROPOSED PRODUCTION ORDER (awaiting owner approval)

1. **Batch A — Brand core:** logo mark decision → full logo, favicon, OG, splash, PWA re-icon
2. **Batch B — Platform illustrations:** empty states (6), auth pair, page headers (4), error set (4), verification, bug, success, cookie
3. **Batch C — Category icons ×10 + achievement badges ×30**
4. **Batch D — Real screenshot sets** for Hub + Quiz (+ each new site at launch)
5. **Batch E — Site icon art ×107** in category-priority order

---

# 📦 SECTION 2 — THE 100 WEBSITE ICONS (owner spec, P-070 — PRESERVED VERBATIM)

> Owner supplied the exact look for every site icon. Production: pre-build icon art is allowed as labelled branding (D-153). ✅ = produced file in `assets/site-icons/`.

## 🛠️ Productivity & Tools
| # | Website | Icon spec | Status |
|---|---|---|---|
| 1 | Paragon Notes | Stylized notepad with a pen, clean lines | ✅ |
| 2 | Paragon Tasks | Checkmark list, bold tick marks | ✅ |
| 3 | Paragon Calendar | Calendar grid with a star or dot on a date | ✅ |
| 4 | Paragon Clock | Clock face with Pomodoro tomato element or timer | ✅ |
| 5 | Paragon Calc | Calculator with a conversion arrow or currency symbol | ✅ |
| 6 | Paragon Dictionary | Open book with a translation arrow or speech bubble | ✅ |
| 7 | Paragon Files | Folder with file conversion arrows | ⬜ |
| 8 | Paragon Paste | Clipboard with text formatting symbols | ⬜ |
| 9 | Paragon QR | QR code pattern with a scan beam | ⬜ |
| 10 | Paragon Password | Shield with a key or lock | ⬜ |
| 11 | Paragon Resume | Document with a person silhouette or star | ⬜ |
| 12 | Paragon Bookmarks | Ribbon bookmark with a plus sign | ⬜ |
| 13 | Paragon Contacts | Person silhouette with a phone or address book | ⬜ |

## 🎨 Creative & Design
| # | Website | Icon spec | Status |
|---|---|---|---|
| 14 | Paragon Canvas | Paint brush making a stroke | ⬜ |
| 15 | Paragon Design | Magic wand or design grid with shapes | ⬜ |
| 16 | Paragon Color | Color wheel or paint droplet | ⬜ |
| 17 | Paragon Icons | Grid of small icon shapes | ⬜ |
| 18 | Paragon Fonts | Letter A in an elegant typeface | ⬜ |
| 19 | Paragon Photo | Camera lens or photo frame with edit sliders | ⬜ |
| 20 | Paragon Meme | Laughing face with text bars top and bottom | ⬜ |
| 21 | Paragon Mood | Aesthetic frame with scattered mood elements | ⬜ |
| 22 | Paragon Whiteboard | Infinite canvas with a pen drawing on it | ⬜ |
| 23 | Paragon Palette | Color swatches arranged in a fan | ⬜ |

## 📚 Education & Learning
| # | Website | Icon spec | Status |
|---|---|---|---|
| 24 | Paragon Learn | Graduation cap with a play button | ⬜ |
| 25 | Paragon Quiz | Question mark in a bold circle | ✅ `paragon-quiz.png` — WIRED as the live Quiz header logo (all 5 quiz pages) |
| 26 | Paragon Flash | Two cards flipping, front and back | ⬜ |
| 27 | Paragon Math | Sigma or integral symbol with a graph line | ⬜ |
| 28 | Paragon Code | Code brackets with a play triangle | ⬜ |
| 29 | Paragon Type | Keyboard keys with a speed meter | ⬜ |
| 30 | Paragon Language | Speech bubble with a world globe inside | ⬜ |
| 31 | Paragon Kids | Star with a smiling face, colorful | ⬜ |
| 32 | Paragon Debate | Two speech bubbles facing each other | ⬜ |
| 33 | Paragon Mind | Brain with branching mind map lines | ⬜ |
| 34 | Paragon Exam | Paper with a timer or clock beside it | ⬜ |

## 💬 Social & Communication
| # | Website | Icon spec | Status |
|---|---|---|---|
| 35 | Paragon Chat | Speech bubble with a lightning bolt or wave | ⬜ |
| 36 | Paragon Forum | Stacked speech bubbles, community feel | ⬜ |
| 37 | Paragon Poll | Bar chart with a checkmark vote | ⬜ |
| 38 | Paragon Meet | Video camera with a signal wave | ⬜ |
| 39 | Paragon Wall | Pin board with posts | ⬜ |
| 40 | Paragon Connect | Two people silhouettes connecting | ⬜ |
| 41 | Paragon Feed | Scrolling feed with like hearts | ⬜ |
| 42 | Paragon Collab | Two cursors on a document | ⬜ |
| 43 | Paragon Confess | Masked face or anonymous silhouette | ⬜ |
| 44 | Paragon Events | Calendar with a party popper or pin | ⬜ |

## 🎵 Entertainment & Media
| # | Website | Icon spec | Status |
|---|---|---|---|
| 45 | Paragon Music | Musical note with equalizer bars | ⬜ |
| 46 | Paragon Radio | Radio tower with signal waves | ⬜ |
| 47 | Paragon Beats | Drum pad with sound waves | ⬜ |
| 48 | Paragon Watch | Play button inside a screen | ⬜ |
| 49 | Paragon Read | Open book with a reading lamp glow | ⬜ |
| 50 | Paragon Comics | Comic panel grid with speech bubble | ⬜ |
| 51 | Paragon Anime | Stylized anime eye or star burst | ⬜ |
| 52 | Paragon Movie | Film reel with star rating | ⬜ |
| 53 | Paragon Podcast | Microphone with sound wave rings | ⬜ |
| 54 | Paragon Stories | Feather quill writing on paper | ⬜ |
| 55 | Paragon Mixes | Two turntable discs with crossfader | ⬜ |
| 56 | Paragon Sounds | Sound wave with nature leaf or rain drop | ⬜ |
| 57 | Paragon Theater | Theater curtains with spotlight | ⬜ |

## 🎮 Games
| # | Website | Icon spec | Status |
|---|---|---|---|
| 58 | Paragon Puzzle | Jigsaw puzzle piece fitting together | ⬜ |
| 59 | Paragon Chess | Chess king piece, bold and clean | ⬜ |
| 60 | Paragon Cards | Playing card fan with suit symbols | ⬜ |
| 61 | Paragon Trivia | Lightning bolt with a question mark | ⬜ |
| 62 | Paragon Arcade | Joystick or pixel character | ⬜ |
| 63 | Paragon Race | Racing car from top view with speed lines | ⬜ |
| 64 | Paragon RPG | Sword and scroll or d20 dice | ⬜ |
| 65 | Paragon Draw | Pencil drawing a star shape | ⬜ |
| 66 | Paragon Spin | Spinning wheel arrow | ⬜ |
| 67 | Paragon Bet | Trophy with a prediction chart | ⬜ |
| 68 | Paragon Survival | Campfire or survival knife | ⬜ |

## 💰 Finance & Business
| # | Website | Icon spec | Status |
|---|---|---|---|
| 69 | Paragon Budget | Pie chart with a coin or wallet | ⬜ |
| 70 | Paragon Invoice | Document with a currency symbol and stamp | ✅ |
| 71 | Paragon Crypto | Bitcoin or coin symbol with chart line | ✅ |
| 72 | Paragon Stocks | Upward graph with a bull silhouette | ✅ |
| 73 | Paragon Shop | Shopping bag with a star or tag | ✅ |
| 74 | Paragon Invest | Growing plant with coin or bar chart | ✅ |
| 75 | Paragon Receipt | Receipt paper with scan lines | ✅ |

## 🍕 Lifestyle & Health
| # | Website | Icon spec | Status |
|---|---|---|---|
| 76 | Paragon Recipe | Chef hat with fork and spoon | ✅ |
| 77 | Paragon Fit | Dumbbell with a heartbeat line | ✅ |
| 78 | Paragon Sleep | Moon with zzz or sleep waves | ✅ |
| 79 | Paragon Mental | Lotus flower or brain with heart | ✅ |
| 80 | Paragon Habits | Chain links with a checkmark | ✅ |
| 81 | Paragon Travel | Suitcase with a location pin | ✅ |
| 82 | Paragon Weather | Sun and cloud with rain drop | ✅ |
| 83 | Paragon Wardrobe | Clothes hanger with outfit elements | ✅ |
| 84 | Paragon Journal | Diary with a lock and pen | ✅ |
| 85 | Paragon Tutor | Owl with a graduation cap | ✅ |
| 86 | Paragon Quotes | Quotation marks with a star | ✅ |
| 87 | Paragon Countdown | Hourglass or digital countdown display | ✅ |

## 🌐 Web & Developer Tools
| # | Website | Icon spec | Status |
|---|---|---|---|
| 88 | Paragon Dev Tools | Terminal bracket with a bug or wrench | ✅ |
| 89 | Paragon Speed | Speedometer dial at high speed | ✅ |
| 90 | Paragon Domain | Globe with a cursor or .com text | ✅ |
| 91 | Paragon SEO | Magnifying glass over a bar chart | ✅ |
| 92 | Paragon Deploy | Rocket launching from code brackets | ✅ |
| 93 | Paragon Contrast | Split circle half black half white | ✅ |
| 94 | Paragon Markdown | Hash symbol or MD text in brackets | ✅ |
| 95 | Paragon Snippets | Code lines with a scissors or copy icon | ✅ |

## 🌟 Paragon Originals
| # | Website | Icon spec | Status |
|---|---|---|---|
| 96 | Paragon Random | Dice with a sparkle or shuffle arrows | ✅ |
| 97 | Paragon Time Capsule | Antique bottle with a letter inside | ✅ |
| 98 | Paragon Vibe | Mood face transitioning into music note and color | ✅ |
| 99 | Paragon Alive | Sun rising or heartbeat becoming a spark | ✅ |
| 100 | Paragon Archive Hub | The Paragon Archive logo mark itself | ✅ FREE — `assets/brand/logo-mark.png` IS this icon |

---

# 🖼️ SECTION 3 — PLATFORM ILLUSTRATIONS (owner spec, P-070 — PRESERVED VERBATIM)

| # | Illustration | Where | Owner style note | Status |
|---|---|---|---|---|
| 1 | Welcome Hero | Homepage when no account | Abstract dark landscape with glowing websites floating like portals | ✅ WIRED — `welcome-hero.jpg` banner atop Websites tab for signed-out visitors |
| 2 | Archive Vision | About page | Futuristic city of websites, all connected, glowing | ✅ WIRED — `header-about.jpg` in the Hub About hero |
| 3 | Free For Everyone | About mission section | Diverse group of people using websites, warm and inclusive | ✅ WIRED — `free-for-everyone.jpg` in About §Mission |
| 4 | Founder Section Background | About founder message | Subtle abstract background behind founder photo and quote | ⬜ (photo itself = 🧑 owner) |
| 5 | Privacy Shield | Privacy page header | Elegant shield with lock, dark themed | ✅ WIRED — `header-privacy.jpg` in the Hub Privacy hero |
| 6 | Support Hands | Help page header | Two hands or a headset character, friendly | ✅ WIRED — `header-support.jpg` in the Hub Help hero |
| 7 | Idea Lightbulb | Request page header | Explosive lightbulb with website ideas floating out | ✅ WIRED — `header-request.jpg` in the Hub Request hero |
| 8 | Timeline Journey | About timeline section | Visual journey path from 2026 to future | ✅ WIRED — `timeline-journey.jpg` in About §Vision timeline |
| 9 | Empty — Search | Search no results | Person with telescope finding nothing | ✅ WIRED into Search results |
| 10 | Empty — Bookmarks | No saved websites | Empty shelf with a bookmark | ✅ WIRED into Account Saved |
| 11 | Empty — History | No visit history | Blank timeline with a ghost or trail | ✅ WIRED into Recently Visited |
| 12 | Empty — Reviews | No reviews written | Empty notepad with a pen | ✅ WIRED into Account Reviews |
| 13 | Empty — Collections | No collections | Empty folder waiting to be filled | ✅ WIRED into Collections |
| 14 | Empty — Updates | No updates yet | Clock with no hands | ✅ WIRED into Updates filters |
| 15 | 404 Not Found | Error page | Lost explorer or astronaut floating | ✅ BUILT+WIRED — `404.html` + `error-404.png` |
| 16 | 500 Server Error | Error page | Robot with a confused expression | ✅ BUILT+WIRED — `500.html` + `error-500.png` |
| 17 | Offline Page | No internet | Disconnected plug in space | ✅ BUILT+WIRED — `offline.html` + SW fallback + shell-cached |
| 18 | Maintenance Page | Under maintenance | Worker building something, hard hat | ✅ BUILT+WIRED — `maintenance.html` (pairs with Team Settings flag) |
| 19 | Bug Report Section | Support page | Friendly cartoon bug being caught in a net | ✅ WIRED — `bug-report.png` in Hub Help intro |
| 20 | Success Submission | After form submitted | Celebration confetti or paper plane flying | ✅ WIRED — `success-submit.png` in the request-form success state |
| 21 | Cookie | Cookie banner | Small friendly cookie with Paragon P | ✅ WIRED into the cookie banner |
| 22 | Guest Mode Welcome | Account tab not logged in | Open door or welcome mat with glow | ✅ WIRED into signed-out Account hero |
| 23 | Achievements Locked | Locked badges | Dark badge with question mark | ✅ WIRED into the More Soon locked tile |
| 24 | Achievement Unlocked Animation | When badge earned | Burst animation, badge glowing and popping | 💻 CODE — CSS/SVG animation to build |
| 25 | Documentation Illustrations | How to use guide | Step by step annotated app screenshots | 📸 REAL SHOT (existing CTA item) |

**Wiring log (P-070):** 10 illustrations live in the app (6 empty states, guest welcome, locked badge, cookie, + Quiz site icon across 5 quiz pages). Generation budget honesty: 5 images per owner instruction this turn (limit is 10/turn — next turn we use all 10 as agreed).


---

## 📏 SIZE BUDGET POLICY (P-071 — owner rule)

The COMPLETE website must stay under **100 MB**. Enforcement after every generation run (PIL):
- Spot illustrations → max 640px, 256-color quantized PNG
- Wide headers / OG banners → JPG quality 82–85 (og-default is now `og-default.jpg`)
- Icons → 512px quantized PNG; concepts → 480px
- 2026-08-18 optimization pass: assets 24.7 MB → 1.4 MB; whole project 3.6 MB ✅


## 🧭 P-073 HONESTY & UX LOG (2026-08-18)
- **Fake imagery purged:** all 14 external picsum.photos random-photo placeholders removed from app.js. Cards, heroes, galleries, thumbs and collections now use `paragonTile()` — deterministic branded SVG tiles built ONLY from real catalogue data (category color + the site's own icon + honest label). Real screenshots replace tiles as each site actually ships (§1.3 policy unchanged).
- Bug fixes: white scroll flash (html bg + color-scheme), faint-text contrast tokens raised, Updates compact mode for short filtered lists.
- Category icons: 10 produced + wired, corners transparent, 5–8 KB each.


## 🙋 P-074 LOG (2026-08-18)
- Category icons complete: all 14 categories have art, wired in BOTH the home row and the See-All grid.
- Site icons: 8/100 done (Quiz, Hub + Notes, Tasks, Calendar, Clock, Calc, Dictionary) — SITE_ICON_ART shows them inside Website Detail + search rows.
- Animations: tab/card entrances, press feedback, success pop, unlock burst, launch pulse (+reduced-motion off-switch). Achievement-unlock burst = list §3 #24 ✅ (CSS).
- NEED button live on the under-construction page (real zero store) + Team Needs column. 10-image cap hit; owner's second 10 owed next turn (site icons #7–16: Files, Paste, QR, Password, Resume, Bookmarks, Contacts, Canvas, Design, Color).


## ✅ P-091 LOG (2026-08-18)
- §1.2 #8/#10/#11/#12 + §1.4 #16/#18 delivered; §1.6 #24–27 (empty states) confirmed ✅ done since P-070/P-072.
- Site icons #56–60 (Sounds, Theater, Puzzle, Chess, Cards) → **61/100**. 5 cinematic hero banners live.
- Splash upgraded: 4 s, "Paragon Archive" typewriter synced to a percent ring (100 ÷ 16 chars = 6.25%/char).


## ✅ P-092 LOG (2026-08-18)
- REPLACEMENT LAW (D-172): new elements REPLACE old ones — WotD double badge, staff double badge, recent double badge all cleaned.
- Site icons #61–70 (Trivia, Arcade, Race, RPG, Draw, Spin, Bet, Survival, Budget) + email-verify illustration → **70/100 site icons**.
- Code items delivered: official Google G SVG (#32), email SVG (#33), animated checkmark (#34), upload icon (#43), notification header mark (#50).
- Updates feed truth purge: updated=2 real (Quiz, Hub), maintenance=0, featured=0, announcements=4 — team desk now picks a real website per site-linked update type.


## ✅ P-093 LOG (2026-08-18)
- **HERO BANNER SET COMPLETE (item §1.2 #8 fully):** 15 cinematic banners (14 categories + default) in `assets/hero-banners/` — wired into Website of the Day AND every Website Detail header (same presentation, veil + emoji identity kept). Real screenshots replace per-site at build, per D-153.
- Related-website cards + AI suggestion rows now use the real icon art (70/100).
- Remaining images to produce: site icons #71–100 (30), 30 achievement badges. Everything else in Sections 1–3 is ✅ or 💻-done or 📸-blocked-on-real-builds.
