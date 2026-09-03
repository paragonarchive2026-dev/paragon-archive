<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: invoice-generator.md
  EXPECTED PROJECT PATH: /docs/site-specs/invoice-generator.md
  ROLE: BUILD SPEC for the Invoice Generator website (P-098) — merged from the owner's uploaded skill
        file (Invoice-Generator.md), the Site Build Kit law, and the Archive catalogue record.
  RESTORE-LOAD NOTE: The website builds IN-PROJECT under /sites/invoice-generator/ (D-191 build-here
        decision), vanilla HTML+CSS+JS, quiz-style layout family, linked back via siteUrl.
-->

# BUILD SPEC — Invoice Generator

**Skill source:** owner upload `Invoice-Generator.md` (527 lines)
**Build location:** `/sites/invoice-generator/` - **Catalogue wiring:** `siteUrl` points at the site when live
**Spec version:** 1 - **Date:** 2026-08-26

## 0. Owner's own description (verbatim)
> Generate professional invoices as HTML pages or React apps with PDF export.

## 1. When to build/surface it (owner's rules, verbatim from the skill)
(extract the use-cases from the skill file at build time)

## 2. When NOT to use it (boundaries, verbatim)
(none stated)

## 3. Architecture adaptation to the FREE build law
The skill describes full-stack/API/React architecture. **Paragon adaptation (free, zero paid services):**
- Keep every DATA MODEL and FEATURE from the skill; implement with **vanilla HTML+CSS+JS + localStorage** (per-site key `paragonInvoiceGenerator.v1`), same as the quiz.
- Any required "API" becomes a **local engine module** (pure JS, same inputs/outputs) behind an adapter, swappable for a free real API later (documented in the file header).
- No databases, no paid AI calls, no build step - runs by opening the file.

### Skill architecture summary (fidelity reference)
```
```text

client/public/invoice-template.html \# Single file, URL-param driven

```

##### How it works

- The template lives in the main app's `public/` folder, served as a static asset
- All client-specific fields are read from `URLSearchParams` at runtime

- Seller info, domain, and billing email are hardcoded (they never change)
- Client pastes the parameterized link into any browser → prints to PDF

**File location:** `client/public/invoice-template.html`→ served at`/invoice-template.html`

### Approach B — React Component (preferred for one-off custom invoices)

**Use when:** Building a o
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
