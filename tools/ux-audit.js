/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: ux-audit.js
  EXPECTED PROJECT PATH: /tools/ux-audit.js
  ROLE: quantitative UX/component audit — dead links, unrouted anchors,
        unresolved onclick handlers, typeless buttons in forms, missing
        asset references, and WCAG contrast ratios for the design-system
        palette in both modes. Dev tool, read-only.
  RESTORE/LOAD NOTE: Run: node tools/ux-audit.js
*/
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const SKIP = new Set([".git", "node_modules", ".copilot", "vendor"]);
function walk(dir, exts) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (SKIP.has(e.name)) return [];
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p, exts);
    return exts.some((x) => e.name.endsWith(x)) ? [p] : [];
  });
}
const htmls = [...walk(path.join(ROOT, "sites"), [".html"]), ...walk(ROOT, [".html"]), ...walk(path.join(ROOT, "games"), [".html"])];
const jss = [...walk(ROOT, [".js"]), ...walk(path.join(ROOT, "sites"), [".js"]), ...walk(path.join(ROOT, "games"), [".js"])];

/* hash routes handled by JS routers (app.js tabs, hub pages/views) */
const HASH_ROUTES = new Set(["websites", "updates", "account", "home", "documentation", "community", "team", "roadmap-full", "app", ""]);

let failures = 0;
const fail = (msg) => { failures++; console.log("  ✗ " + msg); };

console.log("== 1. local file links ==");
{
  let checked = 0;
  for (const f of htmls) {
    const html = fs.readFileSync(f, "utf8");
    for (const m of html.matchAll(/href="([^"#][^"]*)"/g)) {
      const h = m[1];
      if (/^(https?:|mailto:|tel:|data:)/.test(h)) continue;
      const clean = h.split(/[?#]/)[0];
      if (!clean) continue;
      checked++;
      if (!fs.existsSync(path.join(path.dirname(f), clean))) fail(`${path.relative(ROOT, f)} -> ${h}`);
    }
  }
  console.log(`  checked ${checked}, dead: ${failures}`);
}

console.log("== 2. in-page anchors ==");
{
  let checked = 0, dead = 0;
  for (const f of htmls) {
    const html = fs.readFileSync(f, "utf8");
    const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
    for (const m of html.matchAll(/href="#([^"]+)"/g)) {
      checked++;
      const a = m[1];
      if (ids.has(a) || HASH_ROUTES.has(a)) continue;
      dead++; fail(`${path.relative(ROOT, f)} -> #${a}`);
    }
  }
  console.log(`  checked ${checked}, unrouted: ${dead}`);
}

console.log("== 3. onclick handlers resolve ==");
{
  const defined = new Set();
  for (const f of jss) {
    const s = fs.readFileSync(f, "utf8");
    for (const m of s.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(/g)) defined.add(m[1]);
    for (const m of s.matchAll(/window\.([A-Za-z0-9_]+)\s*=/g)) defined.add(m[1]);
  }
  let checked = 0, missing = 0;
  const scan = (s, label) => {
    for (const m of s.matchAll(/onclick=\\?"?([A-Za-z0-9_]+)\(/g)) {
      checked++;
      if (!defined.has(m[1])) { missing++; fail(`${label} :: ${m[1]}`); }
    }
  };
  htmls.forEach((f) => scan(fs.readFileSync(f, "utf8"), path.relative(ROOT, f)));
  jss.forEach((f) => scan(fs.readFileSync(f, "utf8"), path.relative(ROOT, f) + " (template)"));
  console.log(`  checked ${checked}, unresolved: ${missing}`);
}

console.log("== 4. typeless buttons inside forms ==");
{
  let found = 0;
  for (const f of htmls) {
    const html = fs.readFileSync(f, "utf8");
    for (const m of html.matchAll(/<form[\s\S]*?<\/form>/g)) {
      for (const b of m[0].matchAll(/<button(?![^>]*\btype=)[^>]*>/g)) {
        found++; fail(`${path.relative(ROOT, f)} :: ${b[0].slice(0, 70)}`);
      }
    }
  }
  console.log(`  typeless-in-form: ${found}`);
}

console.log("== 5. asset references exist ==");
{
  let checked = 0, missing = 0;
  const files = [...htmls, ...jss, ...walk(ROOT, [".css"]), ...walk(path.join(ROOT, "sites"), [".css"]), ...walk(path.join(ROOT, "games"), [".css"])];
  for (const f of files) {
    const s = fs.readFileSync(f, "utf8");
    const refs = new Set();
    for (const m of s.matchAll(/["'(]((?:\.\.\/|\.\/)?assets\/[A-Za-z0-9_\-./]+\.(?:png|jpg|jpeg|svg|webp|gif|ico))["')]/g)) refs.add(m[1]);
    for (const r of refs) {
      checked++;
      const okLocal = fs.existsSync(path.resolve(path.dirname(f), r));
      const okRoot = fs.existsSync(path.join(ROOT, r.replace(/^(\.\.\/|\.\/)+/, "")));
      if (!okLocal && !okRoot) { missing++; fail(`${path.relative(ROOT, f)} -> ${r}`); }
    }
  }
  console.log(`  checked ${checked}, missing: ${missing}`);
}

console.log("== 6. contrast ratios (text pairs, both modes) ==");
{
  const lum = (h) => {
    h = h.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
      .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const la = lum(a), lb = lum(b);
    return Math.round(((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)) * 100) / 100;
  };
  const pairs = [
    /* dark mode */
    ["dark", "--text #f2f2f7 on --card #171432", "#f2f2f7", "#171432", 4.5],
    ["dark", "--text-dim #9ca3af on --card #171432", "#9ca3af", "#171432", 4.5],
    ["dark", "--text-faint #8d8ea0 on --card #171432", "#8d8ea0", "#171432", 4.5],
    ["dark", "--text-faint #8d8ea0 on --bg #0b0a18", "#8d8ea0", "#0b0a18", 4.5],
    ["dark", "gold btn #2b1c05 on #e3a53f", "#2b1c05", "#e3a53f", 4.5],
    ["dark", "chip text #3a2a08 on #f2b95c", "#3a2a08", "#f2b95c", 4.5],
    /* light mode */
    ["light", "--text #161616 on --card #ffffff", "#161616", "#ffffff", 4.5],
    ["light", "--text-dim #5a5955 on --card #ffffff", "#5a5955", "#ffffff", 4.5],
    ["light", "--text-faint #706e67 on --card #ffffff", "#706e67", "#ffffff", 4.5],
    ["light", "--text-faint #706e67 on --bg #f3f2ef", "#706e67", "#f3f2ef", 4.5],
    ["light", "heaven stop #6d28d9 on #f3f2ef", "#6d28d9", "#f3f2ef", 4.5],
    ["light", "heaven stop #be185d on #f3f2ef", "#be185d", "#f3f2ef", 4.5],
    ["light", "heaven stop #92400e on #f3f2ef", "#92400e", "#f3f2ef", 4.5],
    ["light", "heaven stop #0e7490 on #f3f2ef", "#0e7490", "#f3f2ef", 4.5],
    ["light", "stars #b45309 on #ffffff", "#b45309", "#ffffff", 4.5],
    ["light", "divider #92400e on #f3f2ef", "#92400e", "#f3f2ef", 4.5],
  ];
  /* game kit tokens are parsed live so the audit always checks current values */
  const kit = fs.readFileSync(path.join(ROOT, "sites/_shared/site-kit.css"), "utf8");
  const mutedVals = [...kit.matchAll(/--text-muted:\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[1]);
  const cardVals = [...kit.matchAll(/--card:\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[1]);
  const faintVals = [...kit.matchAll(/--text-faint:\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[1]);
  if (mutedVals[0] && cardVals[0]) pairs.push(["dark", `live kit --text-muted ${mutedVals[0]} on --card ${cardVals[0]}`, mutedVals[0], cardVals[0], 4.5]);
  if (mutedVals[1] && cardVals[1]) pairs.push(["light", `live kit --text-muted ${mutedVals[1]} on --card ${cardVals[1]}`, mutedVals[1], cardVals[1], 4.5]);
  if (faintVals[1] && cardVals[1]) pairs.push(["light", `live kit --text-faint ${faintVals[1]} on --card ${cardVals[1]}`, faintVals[1], cardVals[1], 4.5]);
  let bad = 0;
  for (const [mode, name, a, b, min] of pairs) {
    const r = ratio(a, b);
    if (r < min) { bad++; fail(`[${mode}] ${name} = ${r}:1 (< ${min}:1)`); }
  }
  console.log(`  checked ${pairs.length} pairs, failing: ${bad}`);
}

console.log("== 7. form controls have accessible names ==");
{
  let checked = 0, gaps = 0;
  for (const f of htmls) {
    const html = fs.readFileSync(f, "utf8");
    const labelFor = new Set([...html.matchAll(/<label[^>]*for="([^"]+)"/g)].map((m) => m[1]));
    for (const m of html.matchAll(/<(input|select|textarea)([^>]*)>/g)) {
      const t = m[2];
      if (/type="(hidden|file|radio|checkbox|date|range|color)"/.test(t)) continue;
      checked++;
      const id = (t.match(/id="([^"]+)"/) || [])[1];
      if (/aria-label=/.test(t) || (id && labelFor.has(id))) continue;
      gaps++; fail(`${path.relative(ROOT, f)} :: <${m[1]}${t.slice(0, 60)}`);
    }
  }
  console.log(`  checked ${checked}, unlabeled: ${gaps}`);
}

console.log("== 8. category chips expose --category-color ==");
{
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const ok = app.includes("--category-color:${c.color}");
  if (!ok) fail("cat-chip template no longer sets --category-color");
  console.log(`  category hue token: ${ok ? "wired ✅" : "MISSING"}`);
}

console.log(failures ? `\nAUDIT: ${failures} issue(s) found` : "\nAUDIT: clean ✅");
process.exit(0);
