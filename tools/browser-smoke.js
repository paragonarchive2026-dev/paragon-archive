/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: browser-smoke.js
  EXPECTED PROJECT PATH: /tools/browser-smoke.js
  ROLE: P-096 real-DOM smoke test — boots the live pages in jsdom (server required on :8000)
        and catches boot/runtime errors, splash lifecycle, and hub routing in one run.
  RESTORE-LOAD NOTE: Dev tool. Run: node tools/browser-smoke.js (with npm i jsdom + the preview server up).
*/
const fs = require("fs");
const path = require("path");
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require("jsdom")); }
catch (error) { try { ({ JSDOM, VirtualConsole } = require("/tmp/node_modules/jsdom")); } catch (fallbackError) { console.error("Install jsdom first: npm i jsdom (anywhere) — then rerun."); process.exit(2); } }
const http = require("http");
const ROOT = path.resolve(__dirname, "..");
function get(url) { return new Promise((res, rej) => http.get(url, r => { let d = ""; r.on("data", c => d += c); r.on("end", () => res(d)); }).on("error", rej)); }
(async () => {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", e => { const m = String(e.detail?.message || e.message || e); if (!m.includes("Could not load") && !m.includes("not implemented") && !m.includes("css")) errors.push(m.split("\n")[0]); });
  for (const page of ["paragon-archive.html", "paragon-archive-hub.html", "paragon-product-preview.html?site=Paragon%20Recipe"]) {
    const file = page.split("?")[0];
    const html = await get("http://localhost:8000/" + page);
    const dom = new JSDOM(html, { url: "http://localhost:8000/" + page, runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) { w.fetch = undefined; } });
    await new Promise(r => setTimeout(r, 2500));
    const doc = dom.window.document;
    const state = { hero: doc.querySelectorAll(".hero-slide").length, categories: doc.querySelectorAll("#cat-scroll .cat-chip").length, updates: doc.querySelectorAll(".timeline-entry").length, home: !doc.getElementById("hub-page-home")?.hidden, splash: Boolean(doc.getElementById("welcome-splash")) };
    console.log(`${file}:`, JSON.stringify(state));
    dom.window.close();
  }
  console.log("page errors:", errors.length ? errors.slice(0, 6) : "NONE ✅");
  process.exit(errors.length ? 1 : 0);
})();
