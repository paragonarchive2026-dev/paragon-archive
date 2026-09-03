/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/travel-assistant/app.js
  ROLE: Paragon Travel local engine — paragonTravelAssistant.v1
  RESTORE-LOAD NOTE: Planning only; no booking APIs.
*/
(function () {
  "use strict";
  const K = "paragonTravelAssistant.v1";
  const kit = window.ParagonSiteKit;
  function def() { return { trips: [], packing: [] }; }
  function load() { return Object.assign(def(), kit.storageGet(K, def())); }
  function save(s) { kit.storageSet(K, s); }
  function dayCount(t) {
    if (!t.start || !t.end) return (t.days || []).length || 0;
    const a = new Date(t.start), b = new Date(t.end);
    const d = Math.round((b - a) / 86400000) + 1;
    return d > 0 ? d : 0;
  }
  function stats() {
    const s = load();
    const days = s.trips.reduce(function (n, t) { return n + dayCount(t); }, 0);
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statTrips", s.trips.length);
    set("statDays", days);
    set("statItems", s.packing.length);
  }
  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);

  function fill(t) {
    document.getElementById("tripId").value = t.id || "";
    document.getElementById("tripTitle").value = t.title || "";
    document.getElementById("tripDest").value = t.dest || "";
    document.getElementById("tripStart").value = t.start || "";
    document.getElementById("tripEnd").value = t.end || "";
    document.getElementById("tripBudget").value = t.budget || 0;
    document.getElementById("tripCur").value = t.currency || "NGN";
    document.getElementById("tripDays").value = (t.days || []).join("\n");
    document.getElementById("tripNotes").value = t.notes || "";
  }
  function list() {
    const box = document.getElementById("tripList");
    if (!box) return;
    const s = load();
    if (!s.trips.length) {
      box.className = "empty";
      box.innerHTML = "<strong>No trips yet</strong>Create your first plan.";
      return;
    }
    box.className = "list";
    box.innerHTML = s.trips.slice().reverse().map(function (t) {
      return '<div class="list-item" data-id="' + kit.escapeHTML(t.id) + '"><div><div class="card-title">' + kit.escapeHTML(t.title || "Trip") +
        '</div><div class="meta">' + kit.escapeHTML(t.dest || "") + " · " + dayCount(t) + " days · budget " + kit.money(t.budget || 0, t.currency || "NGN") +
        '</div></div><div class="actions"><button type="button" class="btn btn-sm btn-secondary t-edit">Edit</button>' +
        '<button type="button" class="btn btn-sm btn-danger t-del">Delete</button></div></div>';
    }).join("");
    box.querySelectorAll(".t-edit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const t = load().trips.find(function (x) { return x.id === btn.closest(".list-item").dataset.id; });
        if (t) fill(t);
      });
    });
    box.querySelectorAll(".t-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.closest(".list-item").dataset.id;
        const s2 = load(); s2.trips = s2.trips.filter(function (x) { return x.id !== id; }); save(s2); list(); stats();
      });
    });
  }
  if (document.getElementById("saveTrip")) {
    document.getElementById("saveTrip").addEventListener("click", function () {
      const t = {
        id: document.getElementById("tripId").value || kit.uid("trip"),
        title: document.getElementById("tripTitle").value.trim(),
        dest: document.getElementById("tripDest").value.trim(),
        start: document.getElementById("tripStart").value,
        end: document.getElementById("tripEnd").value,
        budget: Number(document.getElementById("tripBudget").value) || 0,
        currency: (document.getElementById("tripCur").value || "NGN").toUpperCase().slice(0, 3),
        days: document.getElementById("tripDays").value.split("\n").map(function (l) { return l.trim(); }).filter(Boolean),
        notes: document.getElementById("tripNotes").value.trim()
      };
      if (!t.title) { kit.showPanel(document.getElementById("msg"), "Title required.", "bad"); return; }
      const s = load();
      const i = s.trips.findIndex(function (x) { return x.id === t.id; });
      if (i >= 0) s.trips[i] = t; else s.trips.push(t);
      save(s); list(); stats();
      kit.showPanel(document.getElementById("msg"), "Trip saved (planning only — not a booking).", "good");
    });
    document.getElementById("newTrip").addEventListener("click", function () {
      fill({ id: "", title: "", dest: "", start: "", end: "", budget: 0, currency: "NGN", days: [], notes: "" });
    });
    list();
    document.getElementById("entryCheck")?.addEventListener("click", function () {
      const c = (document.getElementById("entryCountry").value || "").toLowerCase();
      const box = document.getElementById("entryOut");
      const common = ["Valid passport (6+ months recommended)", "Return/onward ticket plan", "Proof of funds / hotel booking notes", "Travel insurance (recommended — not sold here)"];
      let extra = ["Confirm visa requirements on the official government site for YOUR nationality (this app does not fetch live visa APIs)."];
      if (/schengen|france|germany|italy|spain|netherlands/.test(c)) extra = extra.concat(["Schengen visa or visa-exempt status", "ETIAS (when in force for exempt travellers)", "Travel medical insurance often required for visa apps"]);
      if (/uk|united kingdom|britain/.test(c)) extra = extra.concat(["UK visa or ETA if required for your passport", "Accommodation address for landing card / ETA"]);
      if (/usa|united states|america/.test(c)) extra = extra.concat(["ESTA or non-immigrant visa as applicable", "Address of first night stay"]);
      if (/nigeria|lagos|abuja/.test(c)) extra = extra.concat(["Yellow fever card if arriving from endemic countries", "NIN/passport checks for domestic connections as needed"]);
      if (/uae|dubai|emirates/.test(c)) extra = extra.concat(["Visa on arrival / eVisa depending on nationality"]);
      box.innerHTML = "<strong>Planning checklist (not legal advice)</strong><ul style='margin:8px 0 0 18px'>" +
        common.concat(extra).map(function (x) { return "<li>" + kit.escapeHTML(x) + "</li>"; }).join("") + "</ul>";
      const notes = document.getElementById("tripNotes");
      if (notes && !notes.value) notes.value = common.concat(extra).map(function (x) { return "☐ " + x; }).join("\n");
    });
  }

  function renderPack() {
    const box = document.getElementById("packList");
    if (!box) return;
    const s = load();
    if (!s.packing.length) {
      box.className = "empty";
      box.innerHTML = "<strong>List empty</strong>Add what you need to pack.";
      return;
    }
    box.className = "list";
    box.innerHTML = s.packing.map(function (p) {
      return '<div class="list-item" data-id="' + kit.escapeHTML(p.id) + '"><label style="display:flex;gap:10px;align-items:center;flex:1;cursor:pointer">' +
        '<input type="checkbox" class="pack-check" ' + (p.done ? "checked" : "") + '> <span style="' + (p.done ? "text-decoration:line-through;opacity:.6" : "") + '">' +
        kit.escapeHTML(p.name) + '</span></label><button type="button" class="btn btn-sm btn-danger pack-del">Delete</button></div>';
    }).join("");
    box.querySelectorAll(".pack-check").forEach(function (cb) {
      cb.addEventListener("change", function () {
        const id = cb.closest(".list-item").dataset.id;
        const s2 = load();
        const item = s2.packing.find(function (x) { return x.id === id; });
        if (item) item.done = cb.checked;
        save(s2); renderPack();
      });
    });
    box.querySelectorAll(".pack-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.closest(".list-item").dataset.id;
        const s2 = load(); s2.packing = s2.packing.filter(function (x) { return x.id !== id; }); save(s2); renderPack(); stats();
      });
    });
  }
  if (document.getElementById("addPack")) {
    document.getElementById("addPack").addEventListener("click", function () {
      const name = document.getElementById("packItem").value.trim();
      if (!name) return;
      const s = load();
      s.packing.push({ id: kit.uid("pk"), name: name, done: false });
      save(s);
      document.getElementById("packItem").value = "";
      renderPack(); stats();
    });
    document.getElementById("seedPack").addEventListener("click", function () {
      const s = load();
      ["Passport/ID", "Phone charger", "Toothbrush", "Meds", "Underwear", "Socks"].forEach(function (n) {
        if (!s.packing.some(function (p) { return p.name === n; })) s.packing.push({ id: kit.uid("pk"), name: n, done: false });
      });
      save(s); renderPack(); stats();
    });
    renderPack();
  }
  stats();
})();
