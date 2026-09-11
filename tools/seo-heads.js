/*
  PARAGON ARCHIVE — SEO-1 head normaliser (kept for provenance/re-runs)
  Run: node tools/seo-heads.js
  Gives every public page one modern head: unique title, meta description,
  robots, relative canonical (gen-sitemap.js absolutises it once the
  production domain exists), full Open Graph + Twitter card, dual
  theme-color, font preconnects and honest JSON-LD.
*/
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const O = "__ORIGIN__"; /* replaced by tools/gen-sitemap.js <origin> */

const PAGES = {
  "paragon-archive.html": {
    path: "/",
    title: "Paragon Archive — Curated Websites, Free Games & Built-in AI",
    desc: "Paragon Archive is a curated catalogue of Paragon-built websites with Google-style search, honest reviews, collections, weekly leaderboards, free games and a built-in AI — one honest archive for the whole Paragon web.",
    ld: [
      { "@context": "https://schema.org", "@type": "WebSite", "name": "Paragon Archive", "url": O + "/", "description": "Every website you need, one archive." },
      { "@context": "https://schema.org", "@type": "Organization", "name": "Paragon Archive", "url": O + "/", "logo": O + "/assets/brand/logo-full.png" }
    ]
  },
  "paragon-archive-hub.html": {
    path: "/paragon-archive-hub",
    title: "Paragon Archive Hub — Documentation, Roadmap & Platform Gateway",
    desc: "Official Paragon Archive documentation: About, Privacy, Terms, Community Guidelines, Cookie Policy, FAQ, roadmap, live status and developer requirements — honest platform docs in one hub.",
    ld: [{ "@context": "https://schema.org", "@type": ["WebPage", "CollectionPage"], "name": "Paragon Archive Hub", "url": O + "/paragon-archive-hub", "isPartOf": { "@type": "WebSite", "name": "Paragon Archive", "url": O + "/" } }]
  },
  "community-board.html": {
    path: "/community-board",
    title: "Community Board — Paragon Archive",
    desc: "The Paragon Archive community board: member posts, appeals and community guidelines, moderated honestly and transparently by the Paragon Team.",
    ld: [{ "@context": "https://schema.org", "@type": "WebPage", "name": "Paragon Community Board", "url": O + "/community-board", "isPartOf": { "@type": "WebSite", "name": "Paragon Archive", "url": O + "/" } }]
  },
  "developer-portal.html": {
    path: "/developer-portal",
    title: "Developer Portal — Build for the Paragon Archive",
    desc: "Apply as a Paragon developer: the real 8-point review gate, submission requirements and a transparent developer dashboard. Nothing hidden, no surprises.",
    ld: [{ "@context": "https://schema.org", "@type": "WebPage", "name": "Paragon Developer Portal", "url": O + "/developer-portal", "isPartOf": { "@type": "WebSite", "name": "Paragon Archive", "url": O + "/" } }]
  },
  "paragon-product-preview.html": {
    path: "/paragon-product-preview",
    title: "Paragon Product Preview — Data-driven Website Concepts",
    desc: "A data-driven concept preview for Paragon Archive websites: honest metrics, drafts and previews before anything ships.",
    ld: [{ "@context": "https://schema.org", "@type": "WebPage", "name": "Paragon Product Preview", "url": O + "/paragon-product-preview", "isPartOf": { "@type": "WebSite", "name": "Paragon Archive", "url": O + "/" } }]
  },
  "games/cards/index.html": {
    path: "/games/cards",
    title: "Paragon Cards — Higher·Lower & Blackjack 21, Free Web Card Room",
    desc: "Paragon Cards: Higher·Lower and Blackjack 21 in a free, fair web card room. No account needed, seeded rounds, honest performance stats.",
    ld: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Paragon Cards", "applicationCategory": "GameApplication", "operatingSystem": "Any (web browser)", "url": O + "/games/cards", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NGN" }, "isPartOf": { "@type": "WebSite", "name": "Paragon Archive", "url": O + "/" } }]
  },
  "games/spin/index.html": {
    path: "/games/spin",
    title: "Paragon Spin — Precision Wheel Duels in a Private-Club Wheel Room",
    desc: "Paragon Spin: six-turn seeded Precision Wheel duels in a machined-brass wheel room. Free play, honest stats, no fake players.",
    ld: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Paragon Spin", "applicationCategory": "GameApplication", "operatingSystem": "Any (web browser)", "url": O + "/games/spin", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NGN" }, "isPartOf": { "@type": "WebSite", "name": "Paragon Archive", "url": O + "/" } }]
  },
  "games/chess/index.html": {
    path: "/games/chess",
    title: "Paragon Chess — Full-Rule Chess vs a Local Computer, Three Strengths",
    desc: "Paragon Chess: full-rule chess against a local computer at three strengths, on a tournament-scale walnut board in a photographic club room.",
    ld: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Paragon Chess", "applicationCategory": "GameApplication", "operatingSystem": "Any (web browser)", "url": O + "/games/chess", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NGN" }, "isPartOf": { "@type": "WebSite", "name": "Paragon Archive", "url": O + "/" } }]
  },
  "games/arcade/index.html": {
    path: "/games/arcade",
    title: "Paragon Arcade — Five Free 60-Second Cabinets",
    desc: "Paragon Arcade: five free sixty-second cabinets — Reflex, Memory, Timing, Sequence, Targets. Seeded timers, real device leaderboards, zero coins needed.",
    ld: [
      { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Paragon Arcade", "applicationCategory": "GameApplication", "operatingSystem": "Any (web browser)", "url": O + "/games/arcade", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NGN" }, "isPartOf": { "@type": "WebSite", "name": "Paragon Archive", "url": O + "/" } },
      { "@context": "https://schema.org", "@type": "ItemList", "name": "Paragon Arcade cabinets", "itemListElement": ["Reflex Tap", "Memory Grid", "Timing Line", "Sequence Flash", "Target Sprint"].map((n, i) => ({ "@type": "ListItem", "position": i + 1, "name": n })) }
    ]
  },
  "paragon-quiz/explore.html": {
    path: "/paragon-quiz/explore",
    title: "Explore Paragon Quiz Decks — Free Quizzes by Category & Difficulty",
    desc: "Explore Paragon Quiz decks: free, honest flashcard-style quizzes across categories and difficulties, with real scores and no dark patterns.",
    ld: [{ "@context": "https://schema.org", "@type": "WebPage", "name": "Paragon Quiz Explorer", "url": O + "/paragon-quiz/explore", "isPartOf": { "@type": "WebSite", "name": "Paragon Archive", "url": O + "/" } }]
  }
};

for (const [file, meta] of Object.entries(PAGES)) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, "utf8");

  /* strip previous SEO-1 block and legacy social/theme tags */
  html = html.replace(/<!-- SEO-1 -->[\s\S]*?<!-- \/SEO-1 -->\n?/, "");
  html = html.replace(/[ \t]*<meta property="og:[^>]*>\n/g, "");
  html = html.replace(/[ \t]*<meta name="twitter:[^>]*>\n/g, "");
  html = html.replace(/[ \t]*<meta name="theme-color"[^>]*>\n/g, "");

  /* title + description */
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`);
  if (/<meta name="description"/.test(html)) {
    html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${meta.desc}" />`);
  } else {
    html = html.replace(/(<title>[\s\S]*?<\/title>)/, `$1\n<meta name="description" content="${meta.desc}" />`);
  }

  const block = `<!-- SEO-1 -->
<meta name="robots" content="index, follow" />
<link rel="canonical" data-seo="abs" href="${meta.path}" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0b0a18" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f2ef" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Paragon Archive" />
<meta property="og:title" content="${meta.title}" />
<meta property="og:description" content="${meta.desc}" />
<meta property="og:url" data-seo="abs" content="${meta.path}" />
<meta property="og:image" data-seo="abs" content="/assets/brand/og-default.jpg" />
<meta property="og:image:width" content="1659" />
<meta property="og:image:height" content="948" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${meta.title}" />
<meta name="twitter:description" content="${meta.desc}" />
<meta name="twitter:image" data-seo="abs" content="/assets/brand/og-default.jpg" />
<script type="application/ld+json">
${JSON.stringify(meta.ld, null, 2)}
</script>
<!-- /SEO-1 -->
`;
  html = html.replace(/<\/head>/, block + "</head>");
  fs.writeFileSync(p, html);
  console.log("SEO head:", file);
}
console.log("done");
