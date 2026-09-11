/*
  PARAGON ARCHIVE — SEO-2 sitemap + absolute-URL activator
  Run (once the production domain exists):
    node tools/gen-sitemap.js https://your-production-domain
  It will:
    1. write sitemap.xml (all indexable pages, changefreq + priority),
    2. add the Sitemap line to robots.txt,
    3. absolutise every canonical / og:url / og:image / twitter:image
       (tags marked data-seo="abs"),
    4. replace the __ORIGIN__ placeholder inside JSON-LD.
  To switch domains later, rerun tools/seo-heads.js first (it restores
  relative URLs), then run this again with the new origin.
*/
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const origin = (process.argv[2] || "").replace(/\/+$/, "");
if (!/^https?:\/\/[^\s]+$/.test(origin)) {
  console.error("Usage: node tools/gen-sitemap.js https://your-production-domain");
  process.exit(1);
}

const SKIP = new Set([".git", "node_modules", ".copilot", "vendor"]);
const htmls = fs.readdirSync(ROOT, { withFileTypes: true })
  .flatMap((e) => {
    if (SKIP.has(e.name)) return [];
    const p = path.join(ROOT, e.name);
    if (e.isDirectory()) {
      return fs.readdirSync(p, { withFileTypes: true })
        .filter((c) => c.isFile() && c.name.endsWith(".html"))
        .map((c) => path.join(p, c.name));
    }
    return e.name.endsWith(".html") ? [p] : [];
  })
  .concat(
    ["games", "paragon-quiz", "sites"].flatMap((d) =>
      fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((s) => {
        const sp = path.join(ROOT, d, s.name);
        if (!s.isDirectory()) return [];
        return fs.existsSync(path.join(sp, "index.html")) ? [path.join(sp, "index.html")] : [];
      })
    )
  );

const PRI = { "/": ["1.0", "daily"], "/paragon-archive-hub": ["0.9", "weekly"] };
const entries = [];
for (const f of new Set(htmls)) {
  let html = fs.readFileSync(f, "utf8");
  const m = html.match(/<link rel="canonical" data-seo="abs" href="([^"]+)" \/>/);
  if (!m) continue;
  const rel = m[1];
  /* absolutise all marked tags */
  html = html.replace(/(<(?:link|meta)[^>]*data-seo="abs"[^>]*(?:href|content)=")([^"]*)("[^>]*>)/g,
    (all, pre, val, post) => pre + origin + val + post);
  html = html.split("__ORIGIN__").join(origin);
  fs.writeFileSync(f, html);
  const [priority, changefreq] = PRI[rel] || ["0.7", "weekly"];
  entries.push({ loc: origin + (rel === "/" ? "/" : rel), priority, changefreq });
  console.log("absolutised:", path.relative(ROOT, f));
}

const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries.map((e) => `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`).join("\n") +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);

let robots = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
if (!/^Sitemap:/m.test(robots)) robots += `\nSitemap: ${origin}/sitemap.xml\n`;
else robots = robots.replace(/^Sitemap:.*$/m, `Sitemap: ${origin}/sitemap.xml`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), robots);

console.log(`\nsitemap.xml written with ${entries.length} URLs for ${origin}`);
