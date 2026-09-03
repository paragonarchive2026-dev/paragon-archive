<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SKILLS-COMPLETION.md
  EXPECTED PROJECT PATH: /docs/SKILLS-COMPLETION.md
  ROLE: Honest matrix of uploads/ skills vs shipped browser products (P-104).
-->

# Skills completion matrix (uploads/ + coins master)

**Rule:** Free Paragon products ship **browser-local engines**. Skill rows that need Python CLI, paid APIs, native binaries, or live booking are documented as **out of scope / not faked** — not claimed complete.

| # | File | Product | Browser-complete | Still out of scope (honest) |
|---|------|---------|------------------|------------------------------|
| 1 | Invoice-Generator.md | `sites/invoice-generator` | Line items, tax/discount, multi-currency, terms, print scale-to-fit, DOCX/JSON, share snapshot URL | Hosted invoice SaaS server, Stripe live links, jurisdiction legal auto-fill |
| 2 | Resume-Maker.md | `sites/resume-maker` | Sections, LinkedIn text parse, job keyword tailor, templates, DOCX, print/PDF, tips | LinkedIn PDF binary parse, React artifact pipeline, server ATS score API |
| 3 | Recipe-Creator.md | `sites/recipe-creator` | Cookbook, scale, subs, ratios, nutrition table, cook timer, print card, ideas | Live USDA API, full-stack API server |
| 4 | FlashCard-Quiz-Creator.md | `sites/flashcard-generator` | Cloze/reverse, SM-2, due queue, quiz type-answer mode, Anki TSV/JSON | genanki `.apkg` binary, image occlusion ML, server AI quiz |
| 5 | Meal-Planner.md | `sites/meal-planner` | Week board, shopping, macros, **BMR/TDEE**, fitness notes, recipe merge | Clinical dietetics, barcode grocery APIs |
| 6 | Personal-Shopper.md | `sites/personal-shopper` | Shortlists, dual price, compare, budget, gift checklist, CSV | Live merchant search, checkout, affiliate scrape |
| 7 | Photo-Editor.md | `sites/photo-editor` | Adjust, filters, crop, square, text, heal-fill, export | OpenCV inpaint, HEIC, face-detection model weights |
| 8 | Travel-Assitance.md | `sites/travel-assistant` | Trips, pacing days, budget parts, entry lists, packing, print, flight/hotel **planning standards** | Live flights/hotels APIs, maps tiles paid keys, booking |
| 9 | File-Converter.md | `sites/file-converter` | Images batch/ZIP, CSV/JSON/TSV/JSONL/YAML-lite, MD/HTML, ZIP pack | pandoc, ffmpeg, HEIC, Excel/Parquet native, PDF merge engine |
| 10 | PARAGON-COINS-MASTER… | SQL + Edge + FE + Team | Phases 1–4: accounts, ledger, payments, webhooks, **compete settle**, leaderboard, prizes, cases, finance desk, health probe | Owner: run SQL, deploy Edge, provider keys, licence, `real_money_enabled` |

## Coins phases

| Phase | Artifact | Status in repo |
|-------|----------|----------------|
| 1 | `coins-master-phase1.sql` | Built |
| 2 | `coins-master-phase2.sql` | Built |
| 3 | `coins-master-phase3.sql` + webhook/reconcile Edge | Built |
| 4 | `coins-master-phase4.sql` + competition-settle Edge + finance desk | Built (this turn) |
| Live confirm | Team **Probe SQL health** | Owner browser (sandbox DNS blocked) |

## Bottom line

- **All 10 files are implemented** to the maximum honest free-browser / Supabase-SQL depth.
- **Nothing that requires your payment provider account, Edge deploy secrets, or gaming licence is pretended live.**
- Catalogue buildProgress sits in the high 90s band for tools; **100% only after your demo pass.**
