<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: CHANGES.md
  EXPECTED PROJECT PATH: /docs/CHANGES.md
  ROLE: Per-turn delta list.
-->
# Changed files — P-102 (2026-09-03)

## Complete partial products (skill depth, browser-local)
- `sites/_shared/site-kit.js` — CSV/JSON helpers, DOCX OOXML builder, ZIP STORE builder
- `sites/file-converter/` — CSV↔JSON↔TSV↔YAML-lite, MD/HTML, batch image ZIP, ZIP pack/list
- `sites/resume-maker/` — LinkedIn-text import, job keyword tailor, DOCX + JSON export, templates
- `sites/photo-editor/` — crop drag, saturation, text overlay, multi-format export
- `sites/flashcard-generator/` — cloze + reverse generation, SM-2 due-first study, JSON export
- `sites/invoice-generator/` — due date, discount, multi-currency, terms, DOCX/JSON export
- `sites/personal-shopper/` — dual-store prices, compare, CSV export
- `sites/meal-planner/` — macro targets, recipe ingredient merge, week JSON export
- `sites/recipe-creator/` — local nutrition estimate table
- `sites/travel-assistant/` — pacing day draft, budget parts, print/export
- `data/catalogue-expansion*.js` — honest feature lists + buildProgress bumps (not fake 100)

## Coins master (was “No”)
- `supabase/coins-master-phase2.sql` — authority RPCs: post_entry, payment intents, withdrawal lock/settle/reject, admin adjust, my_account/ledger, lock_stake
- `app.js` — guest free-play gate, server RPC attempts, display-cache honesty, config-driven packs/rates
- `supabase/SQL-RUN-PACK.md`, `OWNER-SQL-CHECKLIST.md` — step 4

## Other
- `service-worker.js` — cache **v79**
- `tests/suite-ux.test.js` — P-102 fixture
- `docs/EOP.md`, `docs/SOP.md`, `docs/NEXT-AGENT.md`, `docs/COIN-SYSTEM.md`

## Still not claimed live without owner
- Payment provider webhooks / Edge secrets
- `real_money_enabled = true`
- HEIC/ffmpeg/pandoc native engines
- Owner SQL VERIFY + run of phases 1–2
