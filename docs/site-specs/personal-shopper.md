<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: personal-shopper.md
  EXPECTED PROJECT PATH: /docs/site-specs/personal-shopper.md
  ROLE: BUILD SPEC for the Personal Shopper website (P-098) — merged from the owner's uploaded skill
        file (Personal-Shopper.md), the Site Build Kit law, and the Archive catalogue record.
  RESTORE-LOAD NOTE: The website builds IN-PROJECT under /sites/personal-shopper/ (D-191 build-here
        decision), vanilla HTML+CSS+JS, quiz-style layout family, linked back via siteUrl.
-->

# BUILD SPEC — Personal Shopper

**Skill source:** owner upload `Personal-Shopper.md` (361 lines)
**Build location:** `/sites/personal-shopper/` - **Catalogue wiring:** `siteUrl` points at the site when live
**Spec version:** 1 - **Date:** 2026-08-26

## 0. Owner's own description (verbatim)
> Research products, compare options, find deals, and validate purchases.

## 1. When to build/surface it (owner's rules, verbatim from the skill)
- "What's the best [X] under $[Y]?" / product comparison
- "Is this Amazon deal real?" / price validation

- Gift ideas for a specific person
- "I'm looking for [X]" / "Help me pick a [X]" / "Recommend me a [X]" — general shopping

- "When do [X] go on sale?" / "Is now a good time to buy [X]?" — seasonal pricing and deal timing
- "Should I buy this?" / "Is this a good [X]?" / "Is [X] worth the money?" — purchase validation

- "[Brand A] vs [Brand B]?" — product or brand head-to-head comparison

## 2. When NOT to use it (boundaries, verbatim)
- Market research or competitive landscape analysis (deep-research)
- Budgeting (budget-planner)

## 3. Architecture adaptation to the FREE build law
The skill describes full-stack/API/React architecture. **Paragon adaptation (free, zero paid services):**
- Keep every DATA MODEL and FEATURE from the skill; implement with **vanilla HTML+CSS+JS + localStorage** (per-site key `paragonPersonalShopper.v1`), same as the quiz.
- Any required "API" becomes a **local engine module** (pure JS, same inputs/outputs) behind an adapter, swappable for a free real API later (documented in the file header).
- No databases, no paid AI calls, no build step - runs by opening the file.

### Skill architecture summary (fidelity reference)
```

```

## 4. UI law (the quiz family)
- Topbar/header/footer family identical to Paragon Quiz (board-style underline; logo links to this site's Archive detail).
- Dark tokens + the auto day/night rule. Home page carries an **unclickable example section** (like the quiz's "largest planet" demo).
- Navigation may exceed three tabs as needed.

## 5. Acceptance checklist
- [ ] Identity headers on every file - no alert/prompt/confirm - responsive - real-zero counters
- [ ] Local engine covers section-1 use-cases and refuses section-2 boundaries
- [ ] Logo links to this site's Archive detail - Paragon bar present
- [ ] Owner demo pass before siteUrl wiring + buildProgress to 100 (Team Construction Desk)
