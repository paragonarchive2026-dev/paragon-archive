# Paragon Archive — SEO & Visibility Guide

Plain-language guide to everything the codebase already does for search
visibility, and the short checklist a human still needs to do.

## 1. What is already implemented (and where)

| Lever | Where | What it does |
|---|---|---|
| Unique titles + meta descriptions | `tools/seo-heads.js` writes them into all 10 public pages | The two lines Google shows in results; each page sells a different thing |
| `robots` meta (`index, follow`) | same block | Explicit permission to index public pages |
| Canonical URLs | `<link rel="canonical" data-seo="abs">` on every public page | Stops duplicate-URL dilution (`/` vs `/paragon-archive.html`, query strings, etc.) |
| Open Graph + Twitter card | og:title/description/url/image(+dims), twitter:* | Rich previews when links are shared on WhatsApp, X, Facebook, LinkedIn |
| Dual `theme-color` | dark `#0b0a18` / light `#f3f2ef` | Browser chrome matches the heavenly brand in both modes |
| Font `preconnect` | fonts.googleapis/gstatic | Shaves latency off the first paint (Core Web Vitals) |
| JSON-LD structured data | same block: `WebSite`, `Organization`, `WebPage`, `SoftwareApplication` (games, price 0), `ItemList` (arcade cabinets) | Eligibility for rich results; Google understands the site is one brand with free web games |
| `robots.txt` | repo root | Allows everything public; keeps `/team/`, `/config/`, `/supabase/`, `/tests/`, `/tools/`, `/vendor/`, `/uploads/` out of the index |
| `sitemap.xml` generator | `tools/gen-sitemap.js` | Writes a valid sitemap with priorities + changefreq and wires the `Sitemap:` line into robots.txt |
| `noindex` on utility pages | `404.html`, `offline.html`, `maintenance.html` | Error/offline pages never pollute results |
| Semantic/a11y HTML | whole app: single `h1`s, labelled controls (373/373), alt text, aria landmarks | Google rewards accessible, well-structured pages; screen readers too |
| PWA + service worker | `manifest.webmanifest`, `service-worker.js` | Installability + instant repeat visits (engagement signals) |
| Performance guards | `HEAVEN-08` in `style.css` | Low-end phones drop heavy blur/shimmer → better LCP/CLS on real devices |
| Honest content | catalogue, updates, reviews, docs | No fake players/ratings anywhere — sustainable ranking, no spam penalties |

## 2. The one thing that needs a human (5 minutes, when the domain exists)

```bash
node tools/gen-sitemap.js https://your-production-domain
```

That single command writes `sitemap.xml`, adds the `Sitemap:` line to
`robots.txt`, makes every canonical/OG URL absolute, and fills the
`__ORIGIN__` placeholders in the JSON-LD. To change domain later:
`node tools/seo-heads.js` (restores relative URLs) then rerun the command.

## 3. Visibility checklist after deploy

1. **Google Search Console** — verify the domain (DNS or file method), submit `sitemap.xml`, watch Coverage + Core Web Vitals reports.
2. **Bing Webmaster Tools** — import the Search Console property; Bing powers DuckDuckGo and AI copilots.
3. **Google Analytics 4 or Plausible** — measure which pages earn clicks; keep updating the ones that do.
4. **Social profiles** — create/claim @paragonarchive on X/Instagram/LinkedIn and link them to the site (brand-entity signals); when they exist, add them to the `Organization` JSON-LD `sameAs`.
5. **Backlinks, honestly** — submit to reputable web-directory/indie-web listings; write a launch post on dev/community forums describing the honest-review policy; every mention of “Paragon Archive” should link to the canonical domain.
6. **Fresh content cadence** — the Updates feed, weekly Trending and daily featured sites already change constantly; keep that rhythm — crawlers revisit pages that demonstrably change.
7. **Core Web Vitals** — retest monthly in PageSpeed Insights; the fixed-layer guards (`HEAVEN-08`) are the first place to tune if LCP slips on cheap phones.
8. **Rich results** — once real user reviews exist at scale, add `aggregateRating` to the game `SoftwareApplication` entities (only from real data — never invented).

## 4. Re-audit any time

```bash
node tools/ux-audit.js     # links, anchors, flows, assets, contrast, a11y, SEO heads
```

The SEO section fails loudly if a public page ever loses its title,
description, canonical, OG/Twitter tags or valid JSON-LD.
