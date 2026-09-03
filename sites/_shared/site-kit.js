/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: site-kit.js
  EXPECTED PROJECT PATH: /sites/_shared/site-kit.js
  ROLE: Shared helpers for in-project product sites — theme, storage, escape, download, CSV/JSON, DOCX-lite.
  RESTORE-LOAD NOTE: Loaded before each site's app.js.
*/
(function (global) {
  "use strict";

  function storageGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function applyTheme() {
    try {
      const mode = localStorage.getItem("paragonSiteThemeMode") || "auto";
      let dark = true;
      if (mode === "light") dark = false;
      else if (mode === "dark") dark = true;
      else {
        const hour = new Date().getHours();
        dark = !(hour >= 6 && hour < 18);
      }
      document.documentElement.classList.toggle("light", !dark);
      document.documentElement.dataset.themeMode = mode;
    } catch (error) { /* ignore */ }
  }

  function toggleTheme() {
    const isLight = document.documentElement.classList.contains("light");
    localStorage.setItem("paragonSiteThemeMode", isLight ? "dark" : "light");
    applyTheme();
  }

  function showPanel(el, message, kind) {
    if (!el) return;
    el.textContent = message;
    el.className = "notice " + (kind || "");
    el.hidden = false;
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function downloadText(filename, text, mime) {
    downloadBlob(filename, new Blob([text], { type: mime || "text/plain;charset=utf-8" }));
  }

  function money(n, currency) {
    const num = Number(n) || 0;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 2
      }).format(num);
    } catch (error) {
      return (currency || "USD") + " " + num.toFixed(2);
    }
  }

  /* Minimal CSV parse (quoted fields, commas, newlines) */
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let i = 0;
    let inQ = false;
    const s = String(text || "").replace(/^\uFEFF/, "");
    while (i < s.length) {
      const ch = s[i];
      if (inQ) {
        if (ch === '"') {
          if (s[i + 1] === '"') { cell += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        cell += ch; i++; continue;
      }
      if (ch === '"') { inQ = true; i++; continue; }
      if (ch === ",") { row.push(cell); cell = ""; i++; continue; }
      if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && s[i + 1] === "\n") i++;
        row.push(cell); cell = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = []; i++; continue;
      }
      cell += ch; i++;
    }
    row.push(cell);
    if (row.length > 1 || row[0] !== "") rows.push(row);
    return rows;
  }

  function toCSV(rows) {
    return (rows || []).map(function (row) {
      return row.map(function (v) {
        const t = String(v == null ? "" : v);
        if (/[",\n\r]/.test(t)) return '"' + t.replace(/"/g, '""') + '"';
        return t;
      }).join(",");
    }).join("\n");
  }

  function csvToObjects(rows) {
    if (!rows || !rows.length) return [];
    const headers = rows[0].map(function (h) { return String(h || "").trim() || "col"; });
    return rows.slice(1).filter(function (r) { return r.some(function (c) { return String(c || "").trim(); }); })
      .map(function (r) {
        const o = {};
        headers.forEach(function (h, i) { o[h] = r[i] != null ? r[i] : ""; });
        return o;
      });
  }

  function objectsToCSV(objs) {
    if (!objs || !objs.length) return "";
    const keys = Object.keys(objs[0]);
    return toCSV([keys].concat(objs.map(function (o) { return keys.map(function (k) { return o[k]; }); })));
  }

  /* Minimal OOXML DOCX (Word opens it) — single body paragraphs */
  function buildDocx(paragraphs) {
    function xmlEsc(t) {
      return String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    const paras = (paragraphs || []).map(function (p) {
      const lines = String(p).split(/\n/);
      return lines.map(function (line) {
        return '<w:p><w:r><w:t xml:space="preserve">' + xmlEsc(line) + "</w:t></w:r></w:p>";
      }).join("");
    }).join("");
    const documentXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      "<w:body>" + paras + "<w:sectPr/></w:body></w:document>";
    const contentTypes =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      "</Types>";
    const rels =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      "</Relationships>";
    /* Store ZIP locally (STORE method, no compression) */
    function crc32(str) {
      let c = ~0;
      for (let i = 0; i < str.length; i++) {
        c ^= str.charCodeAt(i) & 0xff;
        for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
      }
      return ~c >>> 0;
    }
    function u16(n) { return String.fromCharCode(n & 255, (n >>> 8) & 255); }
    function u32(n) { return String.fromCharCode(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255); }
    function dosTime(d) {
      const t = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((Math.floor(d.getSeconds() / 2)) & 31);
      const da = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
      return { t: t, d: da };
    }
    const now = dosTime(new Date());
    function toBytes(str) {
      const out = [];
      for (let i = 0; i < str.length; i++) out.push(str.charCodeAt(i) & 0xff);
      return out;
    }
    function utf8(str) {
      return unescape(encodeURIComponent(str));
    }
    const files = [
      { name: "[Content_Types].xml", data: utf8(contentTypes) },
      { name: "_rels/.rels", data: utf8(rels) },
      { name: "word/document.xml", data: utf8(documentXml) }
    ];
    let local = "";
    let central = "";
    let offset = 0;
    files.forEach(function (f) {
      const name = f.name;
      const data = f.data;
      const crc = crc32(data);
      const size = data.length;
      const localHeader =
        "PK\x03\x04" + u16(20) + u16(0) + u16(0) + u16(now.t) + u16(now.d) +
        u32(crc) + u32(size) + u32(size) + u16(name.length) + u16(0) + name + data;
      local += localHeader;
      central +=
        "PK\x01\x02" + u16(20) + u16(20) + u16(0) + u16(0) + u16(now.t) + u16(now.d) +
        u32(crc) + u32(size) + u32(size) + u16(name.length) + u16(0) + u16(0) + u16(0) + u16(0) +
        u32(0) + u32(offset) + name;
      offset += localHeader.length;
    });
    const end =
      "PK\x05\x06" + u16(0) + u16(0) + u16(files.length) + u16(files.length) +
      u32(central.length) + u32(local.length) + u16(0);
    const bin = local + central + end;
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  function downloadDocx(filename, paragraphs) {
    downloadBlob(filename, buildDocx(paragraphs));
  }

  /* Simple multi-file ZIP (STORE) for bulk exports */
  function buildZip(fileEntries) {
    function crc32(str) {
      let c = ~0;
      for (let i = 0; i < str.length; i++) {
        c ^= str.charCodeAt(i) & 0xff;
        for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
      }
      return ~c >>> 0;
    }
    function u16(n) { return String.fromCharCode(n & 255, (n >>> 8) & 255); }
    function u32(n) { return String.fromCharCode(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255); }
    function utf8(str) { return unescape(encodeURIComponent(str)); }
    const now = new Date();
    const t = ((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | ((Math.floor(now.getSeconds() / 2)) & 31);
    const da = (((now.getFullYear() - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31);
    let local = "";
    let central = "";
    let offset = 0;
    (fileEntries || []).forEach(function (f) {
      const name = f.name;
      const data = typeof f.data === "string" ? utf8(f.data) : f.data;
      const crc = crc32(data);
      const size = data.length;
      const localHeader =
        "PK\x03\x04" + u16(20) + u16(0) + u16(0) + u16(t) + u16(da) +
        u32(crc) + u32(size) + u32(size) + u16(name.length) + u16(0) + name + data;
      local += localHeader;
      central +=
        "PK\x01\x02" + u16(20) + u16(20) + u16(0) + u16(0) + u16(t) + u16(da) +
        u32(crc) + u32(size) + u32(size) + u16(name.length) + u16(0) + u16(0) + u16(0) + u16(0) +
        u32(0) + u32(offset) + name;
      offset += localHeader.length;
    });
    const end =
      "PK\x05\x06" + u16(0) + u16(0) + u16(fileEntries.length) + u16(fileEntries.length) +
      u32(central.length) + u32(local.length) + u16(0);
    const bin = local + central + end;
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: "application/zip" });
  }

  applyTheme();

  global.ParagonSiteKit = {
    storageGet: storageGet,
    storageSet: storageSet,
    escapeHTML: escapeHTML,
    uid: uid,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    showPanel: showPanel,
    downloadText: downloadText,
    downloadBlob: downloadBlob,
    money: money,
    parseCSV: parseCSV,
    toCSV: toCSV,
    csvToObjects: csvToObjects,
    objectsToCSV: objectsToCSV,
    buildDocx: buildDocx,
    downloadDocx: downloadDocx,
    buildZip: buildZip
  };
})(typeof window !== "undefined" ? window : globalThis);
