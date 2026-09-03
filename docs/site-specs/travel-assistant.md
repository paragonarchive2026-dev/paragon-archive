<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: travel-assistant.md
  EXPECTED PROJECT PATH: /docs/site-specs/travel-assistant.md
  ROLE: BUILD SPEC for the Travel Assistant website (P-098) — merged from the owner's uploaded skill
        file (Travel-Assitance.md), the Site Build Kit law, and the Archive catalogue record.
  RESTORE-LOAD NOTE: The website builds IN-PROJECT under /sites/travel-assistant/ (D-191 build-here
        decision), vanilla HTML+CSS+JS, quiz-style layout family, linked back via siteUrl.
-->

# BUILD SPEC — Travel Assistant

**Skill source:** owner upload `Travel-Assitance.md` (667 lines)
**Build location:** `/sites/travel-assistant/` - **Catalogue wiring:** `siteUrl` points at the site when live
**Spec version:** 1 - **Date:** 2026-08-26

## 0. Owner's own description (verbatim)
> Plan trips, build itineraries, find flights and hotels, and estimate travel budgets.

## 1. When to build/surface it (owner's rules, verbatim from the skill)
- Itinerary building, flight/accommodation strategy, budget estimation
- "What do I need to enter [country]?" — visa/vaccine/ETIAS checks

- Building interactive trip planning web apps

## 2. When NOT to use it (boundaries, verbatim)
- Booking (can't transact); travel insurance (insurance-optimizer)

## 3. Architecture adaptation to the FREE build law
The skill describes full-stack/API/React architecture. **Paragon adaptation (free, zero paid services):**
- Keep every DATA MODEL and FEATURE from the skill; implement with **vanilla HTML+CSS+JS + localStorage** (per-site key `paragonTravelAssistant.v1`), same as the quiz.
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
