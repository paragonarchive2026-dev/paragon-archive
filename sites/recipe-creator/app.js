/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/recipe-creator/app.js
  ROLE: Paragon Recipe local engine — paragonRecipeCreator.v1
  RESTORE-LOAD NOTE: Local suggestions only; no external recipe API.
*/
(function () {
  "use strict";
  const K = "paragonRecipeCreator.v1";
  const kit = window.ParagonSiteKit;
  function def() { return { recipes: [], cooks: 0, ideas: 0 }; }
  function load() { return Object.assign(def(), kit.storageGet(K, def())); }
  function save(s) { kit.storageSet(K, s); }
  let timer = null;
  let timerLeft = 0;

  function parseLines(text) {
    return String(text || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
  }

  function scaleIngredients(lines, fromS, toS) {
    const factor = (Number(toS) || 1) / Math.max(1, Number(fromS) || 1);
    return lines.map(function (line) {
      const m = line.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
      if (!m) return line;
      const n = Math.round(parseFloat(m[1]) * factor * 100) / 100;
      return n + " " + m[2];
    });
  }

  function stats() {
    const s = load();
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statRecipes", s.recipes.length);
    set("statCooks", s.cooks || 0);
    set("statIdeas", s.ideas || 0);
  }

  function fill(rec) {
    document.getElementById("recId").value = rec.id || "";
    document.getElementById("recTitle").value = rec.title || "";
    document.getElementById("recDesc").value = rec.desc || "";
    document.getElementById("recPrep").value = rec.prep || 10;
    document.getElementById("recCook").value = rec.cook || 20;
    document.getElementById("recServings").value = rec.servings || 4;
    document.getElementById("recDiff").value = rec.diff || "Easy";
    document.getElementById("recIngredients").value = (rec.ingredients || []).join("\n");
    document.getElementById("recSteps").value = (rec.steps || []).join("\n");
    document.getElementById("recTags").value = (rec.tags || []).join(", ");
    document.getElementById("scaleTo").value = rec.servings || 4;
    showScale(rec, rec.servings || 4);
  }

  function showScale(rec, toS) {
    const box = document.getElementById("scalePreview");
    if (!box || !rec) return;
    const lines = scaleIngredients(rec.ingredients || [], rec.servings || 4, toS);
    box.innerHTML = "<strong>" + kit.escapeHTML(rec.title || "Recipe") + "</strong> · " + toS + " servings<br>" +
      lines.map(function (l) { return "· " + kit.escapeHTML(l); }).join("<br>") || "No ingredients";
  }

  function list() {
    const box = document.getElementById("recList");
    if (!box) return;
    const s = load();
    if (!s.recipes.length) {
      box.className = "empty";
      box.innerHTML = "<strong>No recipes yet</strong>Add your first recipe.";
      return;
    }
    box.className = "list";
    box.innerHTML = s.recipes.slice().reverse().map(function (r) {
      return '<div class="list-item" data-id="' + kit.escapeHTML(r.id) + '"><div><div class="card-title">' + kit.escapeHTML(r.title) +
        '</div><div class="meta">' + (r.prep + r.cook) + " min · " + kit.escapeHTML(r.diff || "") + " · " + (r.servings || 4) + ' serv</div></div>' +
        '<div class="actions"><button type="button" class="btn btn-sm btn-secondary rec-edit">Edit</button>' +
        '<button type="button" class="btn btn-sm btn-outline rec-cook">Cooked +1</button>' +
        '<button type="button" class="btn btn-sm btn-danger rec-del">Delete</button></div></div>';
    }).join("");
    box.querySelectorAll(".rec-edit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.closest(".list-item").dataset.id;
        const r = load().recipes.find(function (x) { return x.id === id; });
        if (r) fill(r);
      });
    });
    box.querySelectorAll(".rec-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.closest(".list-item").dataset.id;
        const s2 = load();
        s2.recipes = s2.recipes.filter(function (x) { return x.id !== id; });
        save(s2); list(); stats();
      });
    });
    box.querySelectorAll(".rec-cook").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const s2 = load();
        s2.cooks = (s2.cooks || 0) + 1;
        save(s2); stats();
        kit.showPanel(document.getElementById("msg"), "Cook count updated.", "good");
      });
    });
  }

  function readRec() {
    return {
      id: document.getElementById("recId").value || kit.uid("rec"),
      title: document.getElementById("recTitle").value.trim(),
      desc: document.getElementById("recDesc").value.trim(),
      prep: Number(document.getElementById("recPrep").value) || 0,
      cook: Number(document.getElementById("recCook").value) || 0,
      servings: Number(document.getElementById("recServings").value) || 4,
      diff: document.getElementById("recDiff").value,
      ingredients: parseLines(document.getElementById("recIngredients").value),
      steps: parseLines(document.getElementById("recSteps").value),
      tags: document.getElementById("recTags").value.split(",").map(function (t) { return t.trim(); }).filter(Boolean)
    };
  }

  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);

  if (document.getElementById("saveRec")) {
    document.getElementById("saveRec").addEventListener("click", function () {
      const r = readRec();
      if (!r.title) { kit.showPanel(document.getElementById("msg"), "Title required.", "bad"); return; }
      const s = load();
      const i = s.recipes.findIndex(function (x) { return x.id === r.id; });
      if (i >= 0) s.recipes[i] = r; else s.recipes.push(r);
      save(s);
      document.getElementById("recId").value = r.id;
      list(); stats(); showScale(r, r.servings);
      kit.showPanel(document.getElementById("msg"), "Recipe saved.", "good");
    });
    document.getElementById("newRec").addEventListener("click", function () {
      fill({ id: "", title: "", desc: "", prep: 10, cook: 20, servings: 4, diff: "Easy", ingredients: [], steps: [], tags: [] });
    });
    document.getElementById("applyScale").addEventListener("click", function () {
      const r = readRec();
      showScale(r, document.getElementById("scaleTo").value);
    });
    document.getElementById("startTimer").addEventListener("click", function () {
      const mins = Number(document.getElementById("recCook").value) || 0;
      if (mins <= 0) { kit.showPanel(document.getElementById("msg"), "Set cook minutes first.", "bad"); return; }
      timerLeft = mins * 60;
      if (timer) clearInterval(timer);
      const disp = document.getElementById("timerDisplay");
      timer = setInterval(function () {
        timerLeft -= 1;
        if (timerLeft <= 0) {
          clearInterval(timer); timer = null; timerLeft = 0;
          disp.textContent = "Done";
          kit.showPanel(document.getElementById("msg"), "Cook timer finished.", "good");
          return;
        }
        const m = Math.floor(timerLeft / 60);
        const s = timerLeft % 60;
        disp.textContent = m + ":" + String(s).padStart(2, "0");
      }, 1000);
    });
    list();
  }

  if (document.getElementById("genIdeas")) {
    document.getElementById("genIdeas").addEventListener("click", function () {
      const raw = document.getElementById("haveIngredients").value.toLowerCase();
      const parts = raw.split(/[\n,]/).map(function (x) { return x.trim(); }).filter(Boolean);
      const out = document.getElementById("ideasOut");
      if (!parts.length) {
        out.className = "empty";
        out.innerHTML = "<strong>Add ingredients</strong>List what you have first.";
        return;
      }
      const has = function (w) { return parts.some(function (p) { return p.indexOf(w) >= 0 || w.indexOf(p) >= 0; }); };
      const ideas = [];
      if (has("rice") && (has("tomato") || has("tomatoes"))) ideas.push({ t: "Tomato rice skillet", d: "Sauté onion, add rice + tomatoes, simmer. Add protein if you have chicken/beans." });
      if (has("egg") || has("eggs")) ideas.push({ t: "Simple scramble bowl", d: "Eggs with any veg on hand. Serve with toast or leftover grains." });
      if (has("pasta") || has("noodle")) ideas.push({ t: "Pantry pasta", d: "Boil pasta; sauce from oil/garlic/tomato or butter + whatever veg." });
      if (has("bean") || has("beans") || has("lentil")) ideas.push({ t: "Hearty bean pot", d: "Beans + onion + spice + any greens. Serve over rice or with bread." });
      if (has("potato") || has("yam")) ideas.push({ t: "Roast/boil root base", d: "Cook potatoes; top with eggs, beans, or a quick tomato stew." });
      if (has("chicken")) ideas.push({ t: "One-pan chicken", d: "Season chicken; cook with onions + any veg/rice on the side." });
      if (document.getElementById("diet").value === "vegetarian") {
        ideas.forEach(function (i) { if (/chicken|egg/i.test(i.t + i.d) && !/bean|rice|pasta|potato/i.test(i.t)) i.d += " (swap meat for beans/tofu if needed)."; });
      }
      // Match against saved cookbook
      load().recipes.forEach(function (r) {
        const blob = (r.ingredients || []).join(" ").toLowerCase();
        const hits = parts.filter(function (p) { return blob.indexOf(p) >= 0; }).length;
        if (hits >= 2) ideas.unshift({ t: "From your cookbook: " + r.title, d: "Matches " + hits + " of your ingredients." });
      });
      if (!ideas.length) {
        ideas.push({ t: "Improvised stir / stew", d: "Chop everything small, cook aromatics first, add denser items, finish with soft veg. Season and serve over a starch if you have one." });
      }
      const s = load();
      s.ideas = (s.ideas || 0) + 1;
      save(s); stats();
      out.className = "grid";
      out.innerHTML = ideas.slice(0, 8).map(function (i) {
        return '<div class="card"><div class="card-title">' + kit.escapeHTML(i.t) + '</div><p class="card-desc">' + kit.escapeHTML(i.d) + '</p></div>';
      }).join("");
    });
  }

  stats();
})();
