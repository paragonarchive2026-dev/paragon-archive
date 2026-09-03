/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/personal-shopper/app.js
  ROLE: Paragon Shopper local engine — paragonPersonalShopper.v1
  RESTORE-LOAD NOTE: No checkout / payments.
*/
(function () {
  "use strict";
  const K = "paragonPersonalShopper.v1";
  const kit = window.ParagonSiteKit;
  function def() { return { items: [], budget: 0, currency: "NGN" }; }
  function load() { return Object.assign(def(), kit.storageGet(K, def())); }
  function save(s) { kit.storageSet(K, s); }
  function stats() {
    const s = load();
    const lists = {};
    s.items.forEach(function (i) { lists[i.list || "General"] = true; });
    const saved = s.items.filter(function (i) { return i.status === "dropped"; }).reduce(function (n, i) { return n + (Number(i.price) || 0); }, 0);
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statItems", s.items.length);
    set("statLists", Object.keys(lists).length);
    set("statSaved", Math.round(saved));
  }
  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);
  let filterList = "all";

  function renderItems() {
    const box = document.getElementById("itemList");
    if (!box) return;
    const s = load();
    const filters = document.getElementById("listFilters");
    const lists = ["all"].concat(Array.from(new Set(s.items.map(function (i) { return i.list || "General"; }))));
    filters.innerHTML = lists.map(function (l) {
      return '<button type="button" class="chip' + (filterList === l ? " active" : "") + '" data-list="' + kit.escapeHTML(l) + '">' + kit.escapeHTML(l) + "</button>";
    }).join("");
    filters.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () { filterList = chip.getAttribute("data-list"); renderItems(); });
    });
    const rows = s.items.filter(function (i) { return filterList === "all" || (i.list || "General") === filterList; });
    if (!rows.length) {
      box.className = "empty";
      box.innerHTML = "<strong>No items yet</strong>Add something you are considering.";
      return;
    }
    box.className = "list";
    box.innerHTML = rows.slice().reverse().map(function (i) {
      return '<div class="list-item" data-id="' + kit.escapeHTML(i.id) + '"><div><div class="card-title">' + kit.escapeHTML(i.name) +
        '</div><div class="meta">' + kit.escapeHTML(i.list || "General") + " · " + kit.escapeHTML(i.status) + " · " +
        kit.money(i.price || 0, s.currency || "NGN") + (i.notes ? " · " + kit.escapeHTML(i.notes.slice(0, 40)) : "") +
        '</div></div><div class="actions"><button type="button" class="btn btn-sm btn-danger it-del">Delete</button></div></div>';
    }).join("");
    box.querySelectorAll(".it-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const s2 = load();
        s2.items = s2.items.filter(function (x) { return x.id !== btn.closest(".list-item").dataset.id; });
        save(s2); renderItems(); stats(); renderBudget();
      });
    });
  }

  if (document.getElementById("saveItem")) {
    document.getElementById("saveItem").addEventListener("click", function () {
      const item = {
        id: kit.uid("it"),
        name: document.getElementById("itemName").value.trim(),
        price: Number(document.getElementById("itemPrice").value) || 0,
        list: document.getElementById("itemList").value.trim() || "General",
        notes: document.getElementById("itemNotes").value.trim(),
        status: document.getElementById("itemStatus").value
      };
      if (!item.name) { kit.showPanel(document.getElementById("msg"), "Name required.", "bad"); return; }
      const s = load();
      s.items.push(item);
      save(s);
      document.getElementById("itemName").value = "";
      document.getElementById("itemNotes").value = "";
      document.getElementById("itemPrice").value = 0;
      renderItems(); stats();
      kit.showPanel(document.getElementById("msg"), "Item saved (no checkout — shortlist only).", "good");
    });
    renderItems();
  }

  function renderBudget() {
    const box = document.getElementById("budgetSummary");
    if (!box && !document.getElementById("budgetCap")) return;
    const s = load();
    if (document.getElementById("budgetCap")) {
      document.getElementById("budgetCap").value = s.budget || 0;
      document.getElementById("budgetCur").value = s.currency || "NGN";
    }
    if (!box) return;
    const cur = s.currency || "NGN";
    const wish = s.items.filter(function (i) { return i.status === "wish" || i.status === "comparing"; })
      .reduce(function (n, i) { return n + (Number(i.price) || 0); }, 0);
    const spent = s.items.filter(function (i) { return i.status === "bought"; })
      .reduce(function (n, i) { return n + (Number(i.price) || 0); }, 0);
    const cap = Number(s.budget) || 0;
    const over = cap > 0 && wish > cap;
    box.innerHTML =
      "<div class='card-title'>Summary</div>" +
      "<p class='muted'>Cap: <strong>" + kit.money(cap, cur) + "</strong></p>" +
      "<p class='muted'>Wish + comparing: <strong>" + kit.money(wish, cur) + "</strong></p>" +
      "<p class='muted'>Bought (spent): <strong>" + kit.money(spent, cur) + "</strong></p>" +
      (over ? "<div class='notice warn'>Wish list is over your cap by " + kit.money(wish - cap, cur) + ".</div>" :
        "<div class='notice good'>Within cap or no cap set.</div>");
  }
  if (document.getElementById("saveBudget")) {
    document.getElementById("saveBudget").addEventListener("click", function () {
      const s = load();
      s.budget = Number(document.getElementById("budgetCap").value) || 0;
      s.currency = (document.getElementById("budgetCur").value || "NGN").toUpperCase().slice(0, 3);
      save(s); renderBudget(); stats();
      kit.showPanel(document.getElementById("msg"), "Budget saved.", "good");
    });
    renderBudget();
  }
  stats();
})();
