# PARAGON MIND — THE AI BRAIN OF PARAGON ARCHIVE

> **Document identity:** `/docs/AI-BRAIN.md`
> **Version:** 3.0 · September 6, 2026 (supersedes the v1.0 "future AI" blueprint)
> **Implementation:** `ai/paragon-archive-ai.js` (one core, loaded after catalogue data, before `app.js`)
> **Truth statement:** Paragon Mind runs **fully locally inside the app**. No external AI API, secret
> key, vector database, or inference server is connected — and none is needed for what ships today.

---

## 1. What Paragon Mind is

Paragon Mind 💠 is the brand AI of Paragon Archive — one local core with several faces:

| Face | Where it lives | What it knows |
|---|---|---|
| **Search ranking** | `rankWebsites()` — powers the Search suggestions + All tab | The full catalogue: names, categories, purposes, features, concept documentation, owner intent routes, route keywords |
| **AI Mode** | Its own results tab beside "All" in Search (`askMode`) | Everything below at full depth |
| **Floating assistant** | The Paragon Mind pill on the Websites / Updates / Account tabs | Same brain, tab-scoped surface |
| **Website-detail Q&A** | `answerDetail()` from a website's About panel | That website's live signals + platform fallback |

## 2. The answer router (in order)

1. **Greetings & identity** — `answerConversation()` (hello, who are you, what can you do, how are you, launch date, is-it-free…)
2. **Pleasantries & general chat** — `pleasantriesReply()` (good morning, what's up, jokes, "I'm bored/tired/sad", are-you-a-robot, who trained you, favorite things, love/thanks/insults, weather/homework honest redirects, "I'm new here")
3. **Official FAQ** — `faqAnswer()` with the Hub's verbatim-faithful answers (accounts, passwords, guest, delete/download data, loading issues, bookmarks, reviews, requests, notifications, themes, analytics, pricing)
4. **Platform knowledge** — `answerPlatform()` reading **live state** through `window.ParagonMindLive()`:
   - Coins: live balance buckets, locked ₦1 = 2 rate, packs, buy/withdraw rules + fees
   - KYC: none / pending / approved state machine (buy AND withdraw require team approval)
   - Leaderboard: live rank, points, week key, the two honest point paths
   - Daily Goals: 365-day mission system, today's progress, streak, point-earned state
   - Games (free play vs the 1v1 stake desk), Accounts/Guest/Email, Updates feed, Documentation how-tos
5. **Website matching** — only when the input actually looks like a website search
   (`looksLikeWebsiteSearch()` guards against dumping website lists on plain questions)
6. **Honest fallback** — "I didn't catch…" + the Request a Website path

## 3. Live context contract (`window.ParagonMindLive()`)

`app.js` provides real, at-answer-time facts. The Mind **never invents numbers**:

```js
{ session: { mode: "account"|"guest"|"none", name },
  coins:   { available, locked, pending, restricted, rateBuy, rateOut, packs, realMoney, minWithdrawCoins, feeCoins },
  kyc:     { status: "none"|"pending"|"approved", rail },
  leaderboard: { weekKey, rank, points, total },
  daily:   { done, total, streak, dayOfCycle, pointEarnedToday, pointsTotal },
  updates: [{ title, desc, siteName, date }] }
```

## 4. Daily Goals — the 365-day system (P-115)

- 3 missions per day, deterministic from the Aug 1 2026 launch anchor: a catalogue
  explore mission, a tracked action, and a category browse or documentation read.
- **365 unique day-sets** — missions never repeat within the year and users cannot
  view the whole year at once.
- Completing ALL of a day's missions = **exactly 1 leaderboard point** that day:
  - members post instantly via `ParagonLeaderboards.recordDailyPoint()` (one per
    player per day, engine-deduped, zero stake, never funds the fee pool);
  - guests bank the point in the session — it posts automatically when they sign in
    on the same device before the 30-minute session ends (after that, honestly lost).
- Counters reset daily; documentation reads are honest self-reports ("Mark done").

## 5. Safety & truth rules (unchanged law)

- No external providers or keys — checked by `tests/suite-ai-team.test.js`.
- Grounded answers only; uncertainty is admitted; nothing operational is claimed falsely.
- Guest play never ranks; money never moves without team-verified KYC + transfers.
- One core, many modes (tutor/product/code/image/voice remain reserved).

---

# PART II — FULL BRAIN CONTENT (v2 archive, preserved and still true)

## Hybrid retrieval

The Mind combines four retrieval strategies, in order of trust:

1. **Direct catalogue lookup** — exact, alias and normalized name matches (typo-tolerant to two edits per word).
2. **Weighted descriptive matching** — purpose, features, category, concept documentation and route keywords, scored with `rankWebsites()`.
3. **Live platform context** — `window.ParagonMindLive()` provides at-answer-time balances, KYC, leaderboard, Daily Goals and Updates facts; numbers are NEVER invented.
4. **Owner-intent routing** — recurring needs (receipts, invoices, music, journaling, flashcards…) map to shortlists with reasons.

## Backend/API design (future, not connected)

No external AI API, key or vector DB ships today. Any future server brain must: proxy through a
Paragon-owned endpoint, send only the question + retrieved context (never account secrets), return
cited evidence, and degrade to the local core when unreachable. Until then the local core IS the product.

## Hallucination and honesty rules

1. **Grounded-only answers** — every claim must come from catalogue data, live context, or the official FAQ/documentation.
2. **Say "I don't know"** — unknown topics get the honest fallback plus the Request a Website path, never a guess.
3. **No operational lies** — backend/auth/payment states are labelled by their REAL status; nothing "planned" is described as "live".
4. **No invented numbers** — balances, ranks, points, fees come from live context only.
5. **Safety** — insults get de-escalation, distress gets a real-support redirect, homework gets honest tools instead of answers.

## Catalogue knowledge table (live from data files)

| Website | Category | Purpose |
|---|---|---|
| Paragon Vibe | Entertainment |  |
| Paragon Notes | Tools |  |
| Paragon Chess | Games |  |
| Paragon Code | Education |  |
| Paragon Music | Media |  |
| Paragon Design | Creative |  |
| Paragon Finance | Finance |  |
| Paragon Health | Health |  |
| Paragon Social | Social |  |
| Paragon Education | Education |  |
| Paragon Tools | Tools |  |
| Paragon Originals | Creative |  |
| Paragon Resume | Productivity |  |
| Paragon Whiteboard | Creative |  |
| Paragon Palette | Creative |  |
| Paragon Exam | Education |  |
| Paragon Tutor | Education |  |
| Paragon Confess | Social |  |
| Paragon Events | Social |  |
| Paragon Sounds | Entertainment |  |
| Paragon Theater | Entertainment |  |
| Paragon Bet | Games |  |
| Paragon Survival | Games |  |
| Paragon Invest | Finance |  |
| Paragon Wardrobe | Lifestyle |  |
| Paragon Journal | Lifestyle |  |
| Paragon Deploy | Dev Tools |  |
| Paragon Contrast | Dev Tools |  |
| Paragon Tasks | Tools |  |
| Paragon Calendar | Tools |  |
| Paragon Clock | Tools |  |
| Paragon Calc | Tools |  |
| Paragon Dictionary | Tools |  |
| Paragon Files | Tools |  |
| Paragon Paste | Tools |  |
| Paragon QR | Tools |  |
| Paragon Password | Tools |  |
| Paragon Bookmarks | Tools |  |
| Paragon Contacts | Tools |  |
| Paragon Canvas | Creative |  |
| Paragon Color | Creative |  |
| Paragon Icons | Creative |  |
| Paragon Fonts | Creative |  |
| Paragon Photo | Creative |  |
| Paragon Meme | Creative |  |
| Paragon Mood | Creative |  |
| Paragon Learn | Education |  |
| Paragon Quiz | Education |  |
| Paragon Flash | Education |  |
| Paragon Math | Education |  |
| Paragon Type | Education |  |
| Paragon Language | Education |  |
| Paragon Kids | Education |  |
| Paragon Debate | Education |  |
| Paragon Mind | Education |  |
| Paragon Chat | Social |  |
| Paragon Forum | Social |  |
| Paragon Poll | Social |  |
| Paragon Meet | Social |  |
| Paragon Wall | Social |  |
| Paragon Connect | Social |  |
| Paragon Feed | Social |  |
| Paragon Collab | Social |  |
| Paragon Radio | Media |  |
| Paragon Beats | Entertainment |  |
| Paragon Watch | Media |  |
| Paragon Read | Media |  |
| Paragon Comics | Media |  |
| Paragon Anime | Media |  |
| Paragon Movie | Media |  |
| Paragon Podcast | Media |  |
| Paragon Stories | Media |  |
| Paragon Mixes | Entertainment |  |
| Paragon Puzzle | Games |  |
| Paragon Cards | Games |  |
| Paragon Trivia | Games |  |
| Paragon Arcade | Games |  |
| Paragon Race | Games |  |
| Paragon RPG | Games |  |
| Paragon Draw | Games |  |
| Paragon Spin | Games |  |
| Paragon Budget | Finance |  |
| Paragon Invoice | Finance |  |
| Paragon Crypto | Finance |  |
| Paragon Stocks | Finance |  |
| Paragon Shop | Finance |  |
| Paragon Receipt | Finance |  |
| Paragon Recipe | Lifestyle |  |
| Paragon Fit | Lifestyle |  |
| Paragon Sleep | Lifestyle |  |
| Paragon Mental | Lifestyle |  |
| Paragon Habits | Lifestyle |  |
| Paragon Travel | Lifestyle |  |
| Paragon Weather | Lifestyle |  |
| Paragon Quotes | Lifestyle |  |
| Paragon Countdown | Lifestyle |  |
| Paragon Dev Tools | Dev Tools |  |
| Paragon Speed | Dev Tools |  |
| Paragon Domain | Dev Tools |  |
| Paragon SEO | Dev Tools |  |
| Paragon Markdown | Dev Tools |  |
| Paragon Snippets | Dev Tools |  |
| Paragon Random | Tools |  |
| Paragon Time Capsule | Lifestyle |  |
| Paragon Alive | Health |  |
| Paragon Templates | Originals |  |
| Paragon Archive Hub | Originals |  |
| RxLife Network | Health |  |
| Pharmapaedia | Health |  |
