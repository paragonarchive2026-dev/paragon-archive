/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/meal-planner/app.js
  ROLE: Paragon Meal local engine — paragonMealPlanner.v1
  RESTORE-LOAD NOTE: Local week board; not fitness macro planning.
*/
(function () {
  "use strict";
  const K = "paragonMealPlanner.v1";
  const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const SLOTS = ["breakfast","lunch","dinner"];
  const kit = window.ParagonSiteKit;
  function emptyWeek() {
    const w = {};
    DAYS.forEach(function (d) {
      w[d] = { breakfast: "", lunch: "", dinner: "" };
    });
    return w;
  }
  function def() { return { week: emptyWeek(), shop: [], weeksSaved: 0 }; }
  function load() { return Object.assign(def(), kit.storageGet(K, def())); }
  function save(s) { kit.storageSet(K, s); }
  function mealCount(week) {
    let n = 0;
    DAYS.forEach(function (d) { SLOTS.forEach(function (s) { if ((week[d] || {})[s]) n++; }); });
    return n;
  }
  function stats() {
    const s = load();
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statMeals", mealCount(s.week || emptyWeek()));
    set("statShop", (s.shop || []).length);
    set("statWeeks", s.weeksSaved || 0);
  }
  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);

  function renderGrid() {
    const grid = document.getElementById("mealGrid");
    if (!grid) return;
    const week = load().week || emptyWeek();
    grid.innerHTML = DAYS.map(function (d) {
      const day = week[d] || {};
      return '<div class="meal-day" data-day="' + d + '"><h3>' + d + '</h3>' +
        SLOTS.map(function (slot) {
          return '<label style="font-size:10px;color:var(--text-muted)">' + slot + '</label>' +
            '<textarea data-slot="' + slot + '" placeholder="' + slot + '">' + kit.escapeHTML(day[slot] || "") + '</textarea>';
        }).join("") + "</div>";
    }).join("");
  }
  function readWeek() {
    const week = emptyWeek();
    document.querySelectorAll(".meal-day").forEach(function (col) {
      const d = col.getAttribute("data-day");
      week[d] = {};
      col.querySelectorAll("textarea").forEach(function (ta) {
        week[d][ta.getAttribute("data-slot")] = ta.value.trim();
      });
    });
    return week;
  }
  if (document.getElementById("mealGrid")) {
    renderGrid();
    document.getElementById("saveWeek").addEventListener("click", function () {
      const s = load();
      s.week = readWeek();
      s.weeksSaved = (s.weeksSaved || 0) + 1;
      save(s); stats();
      kit.showPanel(document.getElementById("msg"), "Week saved on this device.", "good");
    });
    document.getElementById("clearWeek").addEventListener("click", function () {
      const s = load(); s.week = emptyWeek(); save(s); renderGrid(); stats();
      kit.showPanel(document.getElementById("msg"), "Week cleared.", "good");
    });
    document.getElementById("toShop").addEventListener("click", function () {
      const week = readWeek();
      const s = load();
      s.week = week;
      const names = [];
      DAYS.forEach(function (d) {
        SLOTS.forEach(function (slot) {
          const v = (week[d] || {})[slot];
          if (v) names.push(v);
        });
      });
      names.forEach(function (n) {
        // crude split on + or ,
        n.split(/\s+\+\s+|,\s*/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (item) {
          if (!s.shop.some(function (x) { return x.name.toLowerCase() === item.toLowerCase(); })) {
            s.shop.push({ id: kit.uid("sh"), name: item, done: false });
          }
        });
      });
      save(s); stats();
      kit.showPanel(document.getElementById("msg"), "Shopping list updated from meal names. Open Shopping tab.", "good");
    });
  }

  function renderShop() {
    const box = document.getElementById("shopList");
    if (!box) return;
    const s = load();
    if (!s.shop.length) {
      box.className = "empty";
      box.innerHTML = "<strong>List empty</strong>Add items or generate from the planner.";
      return;
    }
    box.className = "list";
    box.innerHTML = s.shop.map(function (p) {
      return '<div class="list-item" data-id="' + kit.escapeHTML(p.id) + '"><label style="display:flex;gap:10px;align-items:center;flex:1;cursor:pointer">' +
        '<input type="checkbox" class="shop-check" ' + (p.done ? "checked" : "") + '> <span style="' + (p.done ? "text-decoration:line-through;opacity:.6" : "") + '">' +
        kit.escapeHTML(p.name) + '</span></label><button type="button" class="btn btn-sm btn-danger shop-del">Delete</button></div>';
    }).join("");
    box.querySelectorAll(".shop-check").forEach(function (cb) {
      cb.addEventListener("change", function () {
        const s2 = load();
        const item = s2.shop.find(function (x) { return x.id === cb.closest(".list-item").dataset.id; });
        if (item) item.done = cb.checked;
        save(s2); renderShop();
      });
    });
    box.querySelectorAll(".shop-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const s2 = load();
        s2.shop = s2.shop.filter(function (x) { return x.id !== btn.closest(".list-item").dataset.id; });
        save(s2); renderShop(); stats();
      });
    });
  }
  if (document.getElementById("addShop")) {
    document.getElementById("addShop").addEventListener("click", function () {
      const name = document.getElementById("shopItem").value.trim();
      if (!name) return;
      const s = load();
      s.shop.push({ id: kit.uid("sh"), name: name, done: false });
      save(s);
      document.getElementById("shopItem").value = "";
      renderShop(); stats();
    });
    renderShop();
  }
  document.getElementById("importRecipes")?.addEventListener("click", function () {
      try {
        const raw = JSON.parse(localStorage.getItem("paragonRecipeCreator.v1") || "{}");
        const titles = (raw.recipes || []).map(function (r) { return r.title; }).filter(Boolean);
        if (!titles.length) {
          kit.showPanel(document.getElementById("msg"), "No recipes saved in Paragon Recipe on this device yet.", "warn");
          return;
        }
        // Fill empty dinner slots first
        const week = readWeek();
        let i = 0;
        DAYS.forEach(function (d) {
          if (!week[d].dinner && titles[i]) { week[d].dinner = titles[i] + " (recipe)"; i++; }
        });
        const s = load(); s.week = week; save(s); renderGrid(); stats();
        kit.showPanel(document.getElementById("msg"), "Filled empty dinners from your cookbook (" + i + ").", "good");
      } catch (e) {
        kit.showPanel(document.getElementById("msg"), "Could not read Paragon Recipe data.", "bad");
      }
    });
  stats();
})();
