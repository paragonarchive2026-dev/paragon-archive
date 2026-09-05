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
  
  const RATIOS = {
    "rice water": "1 cup rice : 1.5–2 cups water (method dependent)",
    "pasta water": "100 g dry pasta : ~1 L boiling salted water",
    "vinaigrette": "3 oil : 1 acid (lemon/vinegar), salt to taste",
    "roux": "1 fat : 1 flour by weight for thickening",
    "bread dough": "flour 100% · water 60–70% · salt 2% · yeast 1% (baker %)"
  };
  const SUB_MAP = {
    buttermilk: ["1 cup milk + 1 tbsp lemon/vinegar (rest 5 min)", "plain yogurt thinned with water"],
    butter: ["oil (3/4 amount)", "coconut oil", "vegan margarine"],
    egg: ["1 tbsp ground flax + 3 tbsp water (vegan binder)", "1/4 cup applesauce (cakes)"],
    milk: ["oat milk", "soy milk", "coconut milk (richer)"],
    cream: ["coconut cream", "evaporated milk"],
    flour: ["1:1 gluten-free blend", "oat flour (denser)"],
    soy_sauce: ["tamari (gluten-free)", "coconut aminos"],
    sugar: ["honey (not vegan)", "maple syrup", "date paste"],
    chicken: ["firm tofu", "chickpeas", "mushrooms"],
    cheese: ["nutritional yeast", "vegan cheese"]
  };
  const TECH = {
    deglaze: "After searing, add a splash of stock/wine to the hot pan; scrape browned bits — that liquid is flavour.",
    sear: "Pat protein dry, high heat, don't crowd the pan, leave it until it releases naturally.",
    saute: "Medium-high heat, small amount of fat, keep food moving for even colour.",
    simmer: "Gentle bubbles only — aggressive boil toughens proteins and breaks sauces.",
    roast: "Hot oven, space on the tray, dry surface for browning."
  };

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

  /* P-113 — per-site dark/light toggle removed; the Archive nav bar controls all sites. */

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


  const NUT = {
      rice: { cal: 130, p: 2.7, c: 28, f: 0.3, per: "100g cooked" },
      chicken: { cal: 165, p: 31, c: 0, f: 3.6, per: "100g cooked" },
      egg: { cal: 72, p: 6.3, c: 0.4, f: 4.8, per: "1 large" },
      milk: { cal: 42, p: 3.4, c: 5, f: 1, per: "100ml" },
      bread: { cal: 265, p: 9, c: 49, f: 3.2, per: "100g" },
      pasta: { cal: 131, p: 5, c: 25, f: 1.1, per: "100g cooked" },
      bean: { cal: 127, p: 8.7, c: 22.8, f: 0.5, per: "100g cooked" },
      oil: { cal: 884, p: 0, c: 0, f: 100, per: "100g" },
      tomato: { cal: 18, p: 0.9, c: 3.9, f: 0.2, per: "100g" },
      potato: { cal: 77, p: 2, c: 17, f: 0.1, per: "100g" },
      banana: { cal: 89, p: 1.1, c: 23, f: 0.3, per: "100g" },
      beef: { cal: 250, p: 26, c: 0, f: 15, per: "100g" },
      fish: { cal: 120, p: 22, c: 0, f: 3, per: "100g" },
      yogurt: { cal: 59, p: 10, c: 3.6, f: 0.4, per: "100g" },
      cheese: { cal: 402, p: 25, c: 1.3, f: 33, per: "100g" },
      flour: { cal: 364, p: 10, c: 76, f: 1, per: "100g" },
      sugar: { cal: 387, p: 0, c: 100, f: 0, per: "100g" },
      butter: { cal: 717, p: 0.9, c: 0.1, f: 81, per: "100g" },
      onion: { cal: 40, p: 1.1, c: 9.3, f: 0.1, per: "100g" }
    };
    function nutritionEstimate(lines) {
      let cal = 0, p = 0, c = 0, f = 0, hits = [];
      (lines || []).forEach(function (line) {
        const low = String(line).toLowerCase();
        const key = Object.keys(NUT).find(function (k) { return low.indexOf(k) >= 0; });
        if (!key) return;
        const n = NUT[key];
        const m = low.match(/(\d+(?:\.\d+)?)/);
        const qty = m ? Number(m[1]) : 1;
        // crude: if grams assume /100, if no unit treat as 1 serving of table
        let mult = 1;
        if (/\bg\b|gram/.test(low) && qty) mult = qty / 100;
        else if (/kg/.test(low) && qty) mult = (qty * 1000) / 100;
        else if (/cup/.test(low) && qty) mult = qty * 1.5; // rough
        else if (qty && qty > 5) mult = qty / 100;
        else mult = qty || 1;
        cal += n.cal * mult; p += n.p * mult; c += n.c * mult; f += n.f * mult;
        hits.push(key + " ×" + mult.toFixed(2));
      });
      return { cal: Math.round(cal), p: Math.round(p), c: Math.round(c), f: Math.round(f), hits: hits };
    }
    document.getElementById("estNutrition")?.addEventListener("click", function () {
      const lines = (document.getElementById("recIngredients")?.value || "").split(/\n/).filter(Boolean);
      const box = document.getElementById("nutritionOut");
      if (!lines.length) {
        kit.showPanel(document.getElementById("msg"), "Add ingredients first.", "bad");
        return;
      }
      const n = nutritionEstimate(lines);
      if (box) {
        box.innerHTML = n.hits.length
          ? ("<strong>Local estimate (not lab analysis)</strong><br>≈ " + n.cal + " kcal · P " + n.p + "g · C " + n.c + "g · F " + n.f + "g<br><small>Matched: " +
            kit.escapeHTML(n.hits.join(", ")) + "</small>")
          : "No ingredients matched the local table yet (rice, chicken, egg, milk, pasta, beans…).";
      }
    });

  if (document.getElementById("runSub")) {
    document.getElementById("runSub").addEventListener("click", function () {
      const q = document.getElementById("subQuery").value.trim().toLowerCase().replace(/\s+/g, "_");
      const diet = document.getElementById("subDiet").value;
      const box = document.getElementById("subPanel");
      const key = Object.keys(SUB_MAP).find(function (k) { return q.indexOf(k) >= 0 || k.indexOf(q.replace(/_/g," ")) >= 0 || q.replace(/_/g," ").indexOf(k.replace(/_/g," ")) >= 0; });
      if (!key) {
        // technique?
        const tkey = Object.keys(TECH).find(function (k) { return document.getElementById("subQuery").value.toLowerCase().indexOf(k) >= 0; });
        if (tkey) { box.innerHTML = "<strong>Technique — " + kit.escapeHTML(tkey) + "</strong><br>" + kit.escapeHTML(TECH[tkey]); return; }
        var ratioKey = Object.keys(RATIOS).find(function (k) { return document.getElementById("subQuery").value.toLowerCase().indexOf(k.split(" ")[0]) >= 0; });
        if (ratioKey) { box.innerHTML = "<strong>Ratio — " + kit.escapeHTML(ratioKey) + "</strong><br>" + kit.escapeHTML(RATIOS[ratioKey]); return; }
        box.innerHTML = "No local substitute row for that item yet. Try: buttermilk, butter, egg, milk, flour, soy sauce, chicken, cheese — or a technique word like sear / deglaze.";
        return;
      }
      let opts = SUB_MAP[key].slice();
      if (diet === "vegan" || diet === "dairy-free") {
        opts = opts.filter(function (o) { return !/honey|milk \+|yogurt|evaporated milk/i.test(o) || /oat|soy|coconut|flax|vegan|chickpea|tofu|mushroom|nutritional/i.test(o); });
      }
      if (diet === "gluten-free") {
        opts = opts.filter(function (o) { return !/flour(?!.*gluten-free)/i.test(o) || /gluten-free|oat|tamari|aminos/i.test(o); });
        if (key === "flour") opts = ["1:1 gluten-free blend", "oat flour (denser, certified GF if needed)"];
        if (key === "soy_sauce") opts = ["tamari (gluten-free)", "coconut aminos"];
      }
      box.innerHTML = "<strong>Instead of " + kit.escapeHTML(key.replace(/_/g," ")) + "</strong><ul style='margin:8px 0 0 18px'>" +
        opts.map(function (o) { return "<li>" + kit.escapeHTML(o) + "</li>"; }).join("") + "</ul>";
    });
  }

  document.getElementById("printRecipe")?.addEventListener("click", function () {
    var title = document.getElementById("recTitle")?.value || "Recipe";
    var ing = document.getElementById("recIngredients")?.value || "";
    var steps = document.getElementById("recSteps")?.value || "";
    var w = window.open("", "_blank");
    if (!w) return;
    w.document.write("<html><head><title>" + title.replace(/</g,"") + "</title></head><body style='font-family:system-ui;padding:24px;max-width:640px'>");
    w.document.write("<h1>" + title.replace(/</g,"") + "</h1>");
    w.document.write("<h2>Ingredients</h2><pre style='white-space:pre-wrap'>" + ing.replace(/</g,"&lt;") + "</pre>");
    w.document.write("<h2>Steps</h2><pre style='white-space:pre-wrap'>" + steps.replace(/</g,"&lt;") + "</pre>");
    w.document.write("<p style='color:#666'>Paragon Recipe — local card</p></body></html>");
    w.document.close(); w.focus(); w.print();
  });
  stats();
})();
