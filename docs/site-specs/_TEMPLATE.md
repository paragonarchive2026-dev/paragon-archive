<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: _TEMPLATE.md
  EXPECTED PROJECT PATH: /docs/site-specs/_TEMPLATE.md
  ROLE: Copy this file to <site-name>.md for each website the owner sends skill material for.
        Fill every bracket; resolve conflicts by asking the owner; never invent features.
  RESTORE-LOAD NOTE: The filled spec is the single source of truth for that website's
                     separate build project.
-->

# 🏗️ BUILD SPEC — [Paragon <Site Name>]

**Archive record:** `data/…` · category: [category] · icon art: `assets/site-icons/paragon-<name>.png` · banner: `assets/hero-banners/…`
**Owner skill material:** [where it was dropped / what it contains]
**Spec version:** 1 · **Date:** [date]

## 1. Purpose (from the Archive concept documentation — paste verbatim)
[about text] · [desc text]

## 2. Features to build (paste verbatim from the catalogue record; mark MUST/SHOULD/LATER)
- [ ] …
- [ ] …

## 3. Owner skill rules (merged verbatim — these WIN where explicit)
1. [rule from the dropped skill]
2. [rule]

## 4. Screens & layout
[Sitemap: Home / … — follow the 12 standing rules in docs/SITE-BUILD-KIT.md; the P-094
topbar with logo → Archive detail is mandatory on every screen.]

## 5. Data model (local-first)
Key: `paragon<Sitename>.v1` — shape: [describe] · seed: real zero / empty states only.

## 6. APIs (only if the owner provided)
Endpoint(s): […] · auth: [none / owner-supplied key — where stored] · failure behaviour:
honest offline message, never fake results.

## 7. Acceptance checklist (all must pass before siteUrl is wired)
- [ ] Identity headers on every file
- [ ] No alert/prompt/confirm · no textual arrows in markup
- [ ] Works offline-ish · responsive 320px→4K · reduced-motion respected
- [ ] Paragon bar present; logo links to `paragon-archive.html?site=…`
- [ ] Real-zero counters, honest empty states
- [ ] Spec, tests (if any) and README inside the website project
- [ ] Owner demo pass BEFORE `siteUrl` is set + buildProgress → 100
