<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SITE-BUILD-KIT.md
  EXPECTED PROJECT PATH: /docs/SITE-BUILD-KIT.md
  ROLE: The universal rulebook for building each of the ~100 catalogue websites (P-094 / D-180).
        Every website is built as its OWN project (owner-approved strategy), then linked into
        the Archive through its catalogue record. When the owner drops a "skill" (per-website
        guide/API docs), its rules are merged into a per-site spec file from the template.
  RESTORE-LOAD NOTE: Governance doc. The per-site specs live in /docs/site-specs/.
-->

# 🧰 Paragon Site Build Kit — One Website, One Project, One Archive

## How linking works (the honest architecture)
Each catalogue website is built in a **separate agent project** (decided at P-090 — a 100-site
monolith would collapse under its own weight). When a website is finished and deployed
(GitHub Pages / Netlify / Vercel — all free), its live URL is written into that site's
`siteUrl` in `data/sites.js` + expansion files. From that moment the Archive's OPEN button
launches the REAL website, its `buildProgress` rises to 100, and it joins the live web.

**What CAN be linked from any host:** the OPEN button (iframe/new tab), views counting,
need votes, reviews, detail pages, its icon/banner art — everything in the Archive.
**What CANNOT be pushed into an external site from here:** the Archive cannot inject its own
header, ads, or login INTO a website hosted elsewhere. So every built site must carry the
standard "Paragon bar" itself (spec below) — that is how they all feel like one family.

## The 12 standing rules for EVERY website build (non-negotiable)
1. **Pure HTML + CSS + vanilla JavaScript.** No frameworks, no build step, no npm for the
   site itself. One folder per product, loadable by just opening the page.
2. **Export identity header** at the top of every file (P-014).
3. **Brand family look:** the P-094 topbar pattern — logo left (links back to the site's
   ARCHIVE DETAIL page), centered search/actions, Back on the right, board-style underline.
   Dark theme default with the Paragon palette tokens.
4. **No `window.alert / prompt / confirm`** — inline panels only (platform law).
5. **No fake data (P-009):** every counter starts at real zero; empty states say so.
6. **Responsive** at every resolution (P-015); mobile-first; safe-area aware.
7. **Offline-friendly:** basic shell works without network once loaded where possible.
8. **The Paragon bar back-link:** `https://<archive-domain>/paragon-archive.html?site=<Site Name>`
   (relative `../paragon-archive.html?site=...` while inside the same preview host).
9. **User data stays local-first:** `localStorage` keys namespaced
   `paragon<Sitename>.v1`; future account sync only through the Paragon Supabase project.
10. **APIs the owner provides:** keys stay OUT of site code where possible; free/public
    endpoints preferred; every fetch guarded with try/catch and an honest offline message.
11. **Perf budget:** < 1 MB per page load, images quantized (icon law), no external fonts
    unless the owner's skill explicitly requires them.
12. **A `SPEC.md`** inside each website project, generated from the template below, merged
    from: (a) this kit, (b) the site's Archive concept documentation (about/features/
    documentation fields), (c) the owner's dropped skill material, (d) any API docs.

## The workflow when you (owner) drop a skill/API doc
1. You paste/drop the skill material and say which website(s) it is for.
2. The agent writes `docs/site-specs/<site-name>.md` = template + concept docs + your skill
   rules, resolving conflicts by ASKING you (your material wins where explicit).
3. That spec becomes the single source of truth for the separate build project — you can
   hand it to ANY agent and the result still fits the family.
4. After the site is built + deployed, its `siteUrl` is wired in the Archive, buildProgress
   → 100, and the "under construction" stage retires for that site (D-172 sweep).

## Free hosting recommendation (zero naira)
GitHub Pages (best for plain HTML/CSS/JS, custom domain later), Netlify Drop, or Vercel —
all free tiers are enough for a Paragon product site.
