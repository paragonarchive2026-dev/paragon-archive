/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/invoice-generator/app.js
  ROLE: Paragon Invoice local engine — invoices + business profile in paragonInvoiceGenerator.v1.
  RESTORE-LOAD NOTE: No backend. Print uses browser print-to-PDF.
*/
(function () {
  "use strict";
  const K = "paragonInvoiceGenerator.v1";
  const kit = window.ParagonSiteKit;
  const defaultState = function () {
    return { business: { name: "", email: "", phone: "", address: "", taxId: "" }, invoices: [], exports: 0 };
  };
  function load() { return Object.assign(defaultState(), kit.storageGet(K, defaultState())); }
  function save(s) { kit.storageSet(K, s); }

  function totals(inv) {
    const sub = (inv.lines || []).reduce(function (sum, line) {
      return sum + (Number(line.qty) || 0) * (Number(line.price) || 0);
    }, 0);
    const discount = sub * ((Number(inv.discountPct) || 0) / 100);
    const after = Math.max(0, sub - discount);
    const tax = after * ((Number(inv.taxPct) || 0) / 100);
    return { sub: sub, discount: discount, tax: tax, total: after + tax };
  }

  function renderHomeStats() {
    const s = load();
    const paid = s.invoices.filter(function (i) { return i.status === "paid"; }).length;
    const out = s.invoices.filter(function (i) { return i.status !== "paid" && i.status !== "void"; }).length;
    const el = function (id, v) { const n = document.getElementById(id); if (n) n.textContent = String(v); };
    el("statInvoices", s.invoices.length);
    el("statPaid", paid);
    el("statOutstanding", out);
  }

  function lineRow(line) {
    const wrap = document.createElement("div");
    wrap.className = "field-row";
    wrap.style.marginBottom = "8px";
    wrap.innerHTML =
      '<div class="field" style="margin:0"><input class="line-desc" placeholder="Description" value="' + kit.escapeHTML(line.desc || "") + '"></div>' +
      '<div class="field" style="margin:0;max-width:90px"><input class="line-qty" type="number" min="0" step="1" value="' + (line.qty ?? 1) + '" title="Qty"></div>' +
      '<div class="field" style="margin:0;max-width:110px"><input class="line-price" type="number" min="0" step="0.01" value="' + (line.price ?? 0) + '" title="Price"></div>' +
      '<button type="button" class="btn btn-sm btn-danger line-del" title="Remove">×</button>';
    wrap.querySelector(".line-del").addEventListener("click", function () { wrap.remove(); });
    return wrap;
  }

  function readLines() {
    return Array.from(document.querySelectorAll("#lineItems .field-row")).map(function (row) {
      return {
        desc: row.querySelector(".line-desc").value.trim(),
        qty: Number(row.querySelector(".line-qty").value) || 0,
        price: Number(row.querySelector(".line-price").value) || 0
      };
    }).filter(function (l) { return l.desc; });
  }

  function fillForm(inv) {
    document.getElementById("invId").value = inv.id || "";
    document.getElementById("invNumber").value = inv.number || "";
    document.getElementById("invDate").value = inv.date || new Date().toISOString().slice(0, 10);
    document.getElementById("invClient").value = inv.client || "";
    document.getElementById("invEmail").value = inv.email || "";
    document.getElementById("invNotes").value = inv.notes || "";
    document.getElementById("invTax").value = inv.taxPct ?? 0;
    document.getElementById("invCurrency").value = inv.currency || "NGN";
    if (document.getElementById("invDue")) document.getElementById("invDue").value = inv.due || "";
    if (document.getElementById("invDiscount")) document.getElementById("invDiscount").value = inv.discountPct ?? 0;
    if (document.getElementById("invTerms")) document.getElementById("invTerms").value = inv.terms || "Due on receipt";
    document.getElementById("invStatus").value = inv.status || "draft";
    const box = document.getElementById("lineItems");
    box.innerHTML = "";
    (inv.lines && inv.lines.length ? inv.lines : [{ desc: "", qty: 1, price: 0 }]).forEach(function (line) {
      box.appendChild(lineRow(line));
    });
    renderPreview(inv);
  }

  function renderPreview(inv) {
    const box = document.getElementById("invoicePreview");
    if (!box) return;
    const s = load();
    const t = totals(inv);
    const cur = inv.currency || "USD";
    box.innerHTML =
      '<div style="font-weight:800;font-size:18px">' + kit.escapeHTML(s.business.name || "Your business") + '</div>' +
      '<div class="muted" style="white-space:pre-line;margin:6px 0 14px">' + kit.escapeHTML([s.business.email, s.business.phone, s.business.address, s.business.taxId].filter(Boolean).join("\n") || "Set business details in the Business tab.") + '</div>' +
      '<div><strong>Invoice ' + kit.escapeHTML(inv.number || "—") + '</strong> · ' + kit.escapeHTML(inv.date || "") + ' · <span class="chip">' + kit.escapeHTML(inv.status || "draft") + '</span></div>' +
      '<div style="margin:10px 0">Bill to: <strong>' + kit.escapeHTML(inv.client || "—") + '</strong>' + (inv.email ? " · " + kit.escapeHTML(inv.email) : "") + '</div>' +
      '<div class="table-wrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>' +
      (inv.lines || []).map(function (l) {
        return '<tr><td>' + kit.escapeHTML(l.desc) + '</td><td>' + l.qty + '</td><td>' + kit.money(l.price, cur) + '</td><td>' + kit.money((l.qty || 0) * (l.price || 0), cur) + '</td></tr>';
      }).join("") +
      '</tbody></table></div>' +
      '<div style="margin-top:12px;text-align:right">' +
      '<div>Subtotal ' + kit.money(t.sub, cur) + '</div>' +
      (t.discount ? '<div>Discount −' + kit.money(t.discount, cur) + '</div>' : '') +
      '<div>Tax ' + kit.money(t.tax, cur) + '</div>' +
      (inv.due ? '<div class="muted">Due ' + kit.escapeHTML(inv.due) + (inv.terms ? ' · ' + kit.escapeHTML(inv.terms) : '') + '</div>' : '') +
      '<div style="font-size:18px;font-weight:800;margin-top:4px">Total ' + kit.money(t.total, cur) + '</div></div>' +
      (inv.notes ? '<div class="muted" style="margin-top:12px">' + kit.escapeHTML(inv.notes) + '</div>' : "");
  }

  function renderList() {
    const box = document.getElementById("invoiceList");
    if (!box) return;
    const s = load();
    if (!s.invoices.length) {
      box.className = "empty";
      box.innerHTML = "<strong>No invoices yet</strong>Create your first invoice — counters start at real zero.";
      return;
    }
    box.className = "list";
    box.innerHTML = s.invoices.slice().reverse().map(function (inv) {
      const t = totals(inv);
      return '<div class="list-item" data-id="' + kit.escapeHTML(inv.id) + '">' +
        '<div><div class="card-title">' + kit.escapeHTML(inv.number || "Untitled") + ' · ' + kit.escapeHTML(inv.client || "No client") + '</div>' +
        '<div class="meta">' + kit.escapeHTML(inv.date || "") + ' · ' + kit.escapeHTML(inv.status) + ' · ' + kit.money(t.total, inv.currency) + '</div></div>' +
        '<div class="actions">' +
        '<button type="button" class="btn btn-sm btn-secondary inv-edit">Edit</button>' +
        '<button type="button" class="btn btn-sm btn-danger inv-del">Delete</button>' +
        '</div></div>';
    }).join("");
    box.querySelectorAll(".inv-edit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.closest(".list-item").getAttribute("data-id");
        const inv = load().invoices.find(function (i) { return i.id === id; });
        if (inv) fillForm(inv);
      });
    });
    box.querySelectorAll(".inv-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.closest(".list-item").getAttribute("data-id");
        const s2 = load();
        s2.invoices = s2.invoices.filter(function (i) { return i.id !== id; });
        save(s2);
        renderList();
        renderHomeStats();
        kit.showPanel(document.getElementById("msg"), "Invoice deleted.", "good");
      });
    });
  }

  function currentFromForm() {
    return {
      id: document.getElementById("invId").value || kit.uid("inv"),
      number: document.getElementById("invNumber").value.trim() || ("INV-" + Date.now().toString().slice(-6)),
      date: document.getElementById("invDate").value,
      client: document.getElementById("invClient").value.trim(),
      email: document.getElementById("invEmail").value.trim(),
      notes: document.getElementById("invNotes").value.trim(),
      taxPct: Number(document.getElementById("invTax").value) || 0,
      currency: (document.getElementById("invCurrency").value || "USD").toUpperCase().slice(0, 3),
      status: document.getElementById("invStatus").value,
      lines: readLines()
    };
  }

  function bindInvoicePage() {
    if (!document.getElementById("lineItems")) return;
    document.getElementById("addLine").addEventListener("click", function () {
      document.getElementById("lineItems").appendChild(lineRow({ desc: "", qty: 1, price: 0 }));
    });
    document.getElementById("newInv").addEventListener("click", function () {
      fillForm({ id: "", number: "", date: new Date().toISOString().slice(0, 10), client: "", email: "", notes: "", taxPct: 0, currency: "USD", status: "draft", lines: [{ desc: "", qty: 1, price: 0 }] });
    });
    function updateShareUrl(inv) {
      const el = document.getElementById("shareUrl");
      if (!el || !inv) return;
      try {
        const payload = btoa(unescape(encodeURIComponent(JSON.stringify({
          n: inv.number, d: inv.date, c: inv.client, cur: inv.currency,
          lines: inv.lines, tax: inv.taxPct, disc: inv.discountPct, due: inv.due
        }))));
        el.value = location.origin + location.pathname + "#inv=" + payload.slice(0, 1800);
      } catch (e) { el.value = ""; }
    }

    document.getElementById("saveInv").addEventListener("click", function () {
      const inv = currentFromForm();
      if (!inv.client) {
        kit.showPanel(document.getElementById("msg"), "Client name is required.", "bad");
        return;
      }
      if (!inv.lines.length) {
        kit.showPanel(document.getElementById("msg"), "Add at least one line item with a description.", "bad");
        return;
      }
      const s = load();
      const idx = s.invoices.findIndex(function (i) { return i.id === inv.id; });
      if (idx >= 0) s.invoices[idx] = inv; else s.invoices.push(inv);
      save(s);
      document.getElementById("invId").value = inv.id;
      renderPreview(inv);
      renderList();
      renderHomeStats();
      updateShareUrl(inv);
      kit.showPanel(document.getElementById("msg"), "Invoice saved on this device.", "good");
    });
        document.getElementById("copyShareUrl")?.addEventListener("click", function () {
      const el = document.getElementById("shareUrl");
      if (!el || !el.value) { kit.showPanel(document.getElementById("msg"), "Save an invoice first.", "bad"); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(el.value).then(function () {
          kit.showPanel(document.getElementById("msg"), "Share URL copied (snapshot — not a hosted invoice server).", "good");
        });
      } else {
        el.select();
        kit.showPanel(document.getElementById("msg"), "Select and copy the URL manually.", "good");
      }
    });
    // load hash snapshot
    if (location.hash.indexOf("#inv=") === 0) {
      try {
        const raw = location.hash.slice(5);
        const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
        fillForm({
          number: data.n, date: data.d, client: data.c, currency: data.cur,
          lines: data.lines, taxPct: data.tax, discountPct: data.disc, due: data.due, status: "draft"
        });
        kit.showPanel(document.getElementById("msg"), "Loaded shared invoice snapshot from URL.", "good");
      } catch (e) { /* ignore bad hash */ }
    }
    document.getElementById("exportInvJson")?.addEventListener("click", function () {
      const inv = currentFromForm();
      kit.downloadText((inv.number || "invoice") + ".json", JSON.stringify(inv, null, 2), "application/json;charset=utf-8");
      kit.showPanel(document.getElementById("msg"), "Invoice JSON exported.", "good");
    });
    document.getElementById("exportInvDocx")?.addEventListener("click", function () {
      const inv = currentFromForm();
      const s = load();
      const t = totals(inv);
      const lines = [
        (s.business.name || "Invoice"),
        "Invoice " + (inv.number || "") + " · " + (inv.date || ""),
        "Bill to: " + (inv.client || ""),
        "Due: " + (inv.due || "") + " · " + (inv.terms || ""),
        ""
      ];
      (inv.lines || []).forEach(function (l) {
        lines.push(l.desc + " · qty " + l.qty + " · " + l.price);
      });
      lines.push("");
      lines.push("Subtotal " + t.sub);
      lines.push("Total " + t.total + " " + (inv.currency || ""));
      if (inv.notes) lines.push(inv.notes);
      kit.downloadDocx((inv.number || "invoice") + ".docx", lines);
      kit.showPanel(document.getElementById("msg"), "DOCX exported.", "good");
    });
    function scaleToFit(el) {
      if (!el) return;
      el.style.transform = "";
      const maxH = 1000; /* approx printable area px */
      const h = el.scrollHeight || el.offsetHeight;
      if (h > maxH) {
        const s = Math.max(0.55, maxH / h);
        el.style.transformOrigin = "top left";
        el.style.transform = "scale(" + s + ")";
      }
    }
    document.getElementById("printInv").addEventListener("click", function () {
      const inv = currentFromForm();
      renderPreview(inv);
      const s = load();
      s.exports = (s.exports || 0) + 1;
      save(s);
      scaleToFit(document.getElementById("invoicePreview"));
      window.print();
      setTimeout(function () { const p = document.getElementById("invoicePreview"); if (p) p.style.transform = ""; }, 800);
    });
    // Shareable query template (skill Approach A — URL params)
    if (!document.getElementById("exportCsv")) {
      const actions = document.querySelector(".actions");
      if (actions) {
        const b1 = document.createElement("button");
        b1.type = "button"; b1.className = "btn btn-outline"; b1.id = "exportCsv"; b1.textContent = "Export CSV";
        const b2 = document.createElement("button");
        b2.type = "button"; b2.className = "btn btn-outline"; b2.id = "copyLink"; b2.textContent = "Copy fill-link";
        actions.appendChild(b1); actions.appendChild(b2);
      }
    }
    document.getElementById("exportCsv")?.addEventListener("click", function () {
      const s = load();
      const rows = [["number","date","client","status","total","currency"]];
      s.invoices.forEach(function (inv) {
        const t = totals(inv);
        rows.push([inv.number, inv.date, inv.client, inv.status, String(t.total), inv.currency || "USD"]);
      });
      kit.downloadText("paragon-invoices.csv", kit.toCSV(rows), "text/csv;charset=utf-8");
      kit.showPanel(document.getElementById("msg"), "CSV downloaded.", "good");
    });
    document.getElementById("copyLink")?.addEventListener("click", function () {
      const inv = currentFromForm();
      const params = new URLSearchParams({
        number: inv.number || "",
        client: inv.client || "",
        date: inv.date || "",
        currency: inv.currency || "USD",
        tax: String(inv.taxPct || 0),
        lines: (inv.lines || []).map(function (l) { return [l.desc, l.qty, l.price].join(":"); }).join("|")
      });
      const url = location.origin + location.pathname.replace(/app\.html.*/, "app.html") + "?" + params.toString();
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(function () {
        kit.showPanel(document.getElementById("msg"), "Fill-link copied — open it to preload this invoice.", "good");
      }).catch(function () { kit.showPanel(document.getElementById("msg"), url, "warn"); });
      else kit.showPanel(document.getElementById("msg"), url, "warn");
    });
    // hydrate from URL params if present
    try {
      const q = new URLSearchParams(location.search);
      if (q.get("client") || q.get("number")) {
        const lines = String(q.get("lines") || "").split("|").filter(Boolean).map(function (chunk) {
          const p = chunk.split(":");
          return { desc: p[0] || "", qty: Number(p[1]) || 1, price: Number(p[2]) || 0 };
        });
        fillForm({
          id: "", number: q.get("number") || "", date: q.get("date") || new Date().toISOString().slice(0,10),
          client: q.get("client") || "", email: "", notes: "", taxPct: Number(q.get("tax")) || 0,
          currency: q.get("currency") || "USD", status: "draft",
          lines: lines.length ? lines : [{ desc: "", qty: 1, price: 0 }]
        });
      }
    } catch (e) { /* ignore */ }
    fillForm({ id: "", number: "", date: new Date().toISOString().slice(0, 10), client: "", email: "", notes: "", taxPct: 0, currency: "USD", status: "draft", lines: [{ desc: "", qty: 1, price: 0 }] });
    renderList();
  }

  function bindBusinessPage() {
    if (!document.getElementById("bizName")) return;
    const s = load();
    document.getElementById("bizName").value = s.business.name || "";
    document.getElementById("bizEmail").value = s.business.email || "";
    document.getElementById("bizPhone").value = s.business.phone || "";
    document.getElementById("bizAddress").value = s.business.address || "";
    document.getElementById("bizTax").value = s.business.taxId || "";
    document.getElementById("saveBiz").addEventListener("click", function () {
      const s2 = load();
      s2.business = {
        name: document.getElementById("bizName").value.trim(),
        email: document.getElementById("bizEmail").value.trim(),
        phone: document.getElementById("bizPhone").value.trim(),
        address: document.getElementById("bizAddress").value.trim(),
        taxId: document.getElementById("bizTax").value.trim()
      };
      save(s2);
      kit.showPanel(document.getElementById("msg"), "Business profile saved.", "good");
    });
  }

  /* P-113 — per-site dark/light toggle removed; the Archive nav bar controls all sites. */
  renderHomeStats();
  bindInvoicePage();
  bindBusinessPage();
})();
