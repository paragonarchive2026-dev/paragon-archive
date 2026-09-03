<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: resume-maker.md
  EXPECTED PROJECT PATH: /docs/site-specs/resume-maker.md
  ROLE: BUILD SPEC for the Resume Maker website (P-098) — merged from the owner's uploaded skill
        file (Resume-Maker.md), the Site Build Kit law, and the Archive catalogue record.
  RESTORE-LOAD NOTE: The website builds IN-PROJECT under /sites/resume-maker/ (D-191 build-here
        decision), vanilla HTML+CSS+JS, quiz-style layout family, linked back via siteUrl.
-->

# BUILD SPEC — Resume Maker

**Skill source:** owner upload `Resume-Maker.md` (790 lines)
**Build location:** `/sites/resume-maker/` - **Catalogue wiring:** `siteUrl` points at the site when live
**Spec version:** 1 - **Date:** 2026-08-26

## 0. Owner's own description (verbatim)
> Build professional resumes with viewable HTML and downloadable PDF/DOCX export.

## 1. When to build/surface it (owner's rules, verbatim from the skill)
(extract the use-cases from the skill file at build time)

## 2. When NOT to use it (boundaries, verbatim)
(none stated)

## 3. Architecture adaptation to the FREE build law
The skill describes full-stack/API/React architecture. **Paragon adaptation (free, zero paid services):**
- Keep every DATA MODEL and FEATURE from the skill; implement with **vanilla HTML+CSS+JS + localStorage** (per-site key `paragonResumeMaker.v1`), same as the quiz.
- Any required "API" becomes a **local engine module** (pure JS, same inputs/outputs) behind an adapter, swappable for a free real API later (documented in the file header).
- No databases, no paid AI calls, no build step - runs by opening the file.

### Skill architecture summary (fidelity reference)
```
scripts/src/generate-resume-files.ts `← single source of truth for content + layout

└─ output/

`├─ resume-data.json ← consumed by the web frontend

`├─ <name>-resume.pdf ← downloadable PDF

`└─ <name>-resume.docx ← downloadable DOCX

artifacts/<name>/src/pages/resume.tsx `← React page, reads resume-data.json via API

artifacts/api-server/src/routes/download.ts ← serves PDF, DOCX, and JSON

Data flow

- generate-resume-files.ts holds all resume content in a getResumeData() function.
- The script renders the PDF with jsPDF, measures content height, and auto-adjusts spacing to fill exactly one 
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
