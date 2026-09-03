/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/file-converter/app.js
  ROLE: Paragon Files local engine — images, CSV/JSON/TSV/YAML-lite, MD/HTML, ZIP STORE.
  RESTORE-LOAD NOTE: Browser-only. No fake pandoc/ffmpeg/HEIC.
*/
(function () {
  "use strict";
  const K = "paragonFileConverter.v1";
  const kit = window.ParagonSiteKit;
  function def() { return { jobs: 0, bytes: 0, saved: 0, jobLog: [] }; }
  function load() { return Object.assign(def(), kit.storageGet(K, def())); }
  function save(s) { kit.storageSet(K, s); }
  function stats() {
    const s = load();
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statJobs", s.jobs || 0);
    set("statBytes", Math.round((s.bytes || 0) / 1024));
    set("statSaved", s.saved || 0);
  }
  function logJob(entry) {
    const s = load();
    s.jobs = (s.jobs || 0) + 1;
    s.saved = (s.saved || 0) + 1;
    s.bytes = (s.bytes || 0) + (entry.bytes || 0);
    s.jobLog = [Object.assign({ at: new Date().toISOString() }, entry), ...(s.jobLog || [])].slice(0, 30);
    save(s); stats(); renderLog();
  }
  function renderLog() {
    const box = document.getElementById("jobLog");
    if (!box) return;
    const s = load();
    if (!(s.jobLog || []).length) {
      box.textContent = "No jobs yet — counters start at real zero.";
      return;
    }
    box.innerHTML = "<ul style='margin:0 0 0 18px'>" + s.jobLog.map(function (j) {
      return "<li>" + kit.escapeHTML(j.name || j.kind || "job") +
        (j.out ? " → " + kit.escapeHTML(j.out) : "") +
        (j.kb != null ? " (" + j.kb + " KB)" : "") +
        " <small>" + kit.escapeHTML(j.at || "") + "</small></li>";
    }).join("") + "</ul>";
  }

  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);

  function convertOneImage(file, opts, done) {
    if (!file.type.startsWith("image/")) {
      done(new Error("not-image"));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = function () {
      let w = img.naturalWidth, h = img.naturalHeight;
      if (opts.maxW && w > opts.maxW) { h = Math.round(h * (opts.maxW / w)); w = opts.maxW; }
      if (opts.maxH && h > opts.maxH) { w = Math.round(w * (opts.maxH / h)); h = opts.maxH; }
      const canvas = document.getElementById("workCanvas") || document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(function (blob) {
        URL.revokeObjectURL(url);
        if (!blob) { done(new Error("blob")); return; }
        done(null, blob);
      }, opts.type, opts.q);
    };
    img.onerror = function () { URL.revokeObjectURL(url); done(new Error("decode")); };
    img.src = url;
  }

  const fileInput = document.getElementById("imgFile");
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      const files = Array.from(fileInput.files || []);
      const prev = document.getElementById("imgPreview");
      if (!files.length) return;
      prev.innerHTML = files.slice(0, 6).map(function (f) {
        return '<span class="chip" style="margin:2px">' + kit.escapeHTML(f.name) + "</span>";
      }).join(" ") + (files.length > 6 ? " +" + (files.length - 6) : "");
    });

    function opts() {
      return {
        type: document.getElementById("outType").value,
        q: Number(document.getElementById("quality").value) || 0.85,
        maxW: Number(document.getElementById("maxW").value) || 0,
        maxH: Number(document.getElementById("maxH").value) || 0
      };
    }
    function extFor(type) {
      return type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    }

    document.getElementById("convertImg").addEventListener("click", function () {
      const f = fileInput.files && fileInput.files[0];
      if (!f) { kit.showPanel(document.getElementById("msg"), "Choose an image first.", "bad"); return; }
      const o = opts();
      convertOneImage(f, o, function (err, blob) {
        if (err) {
          kit.showPanel(document.getElementById("msg"), err.message === "not-image"
            ? "Not a browser-decodable image. See Guide for HEIC and other limits."
            : "Browser could not convert this image.", "bad");
          return;
        }
        const ext = extFor(o.type);
        kit.downloadBlob((f.name.replace(/\.[^.]+$/, "") || "image") + "." + ext, blob);
        logJob({ name: f.name, out: ext, kb: Math.round(blob.size / 1024), bytes: f.size + blob.size, kind: "image" });
        kit.showPanel(document.getElementById("msg"), "Downloaded " + ext.toUpperCase() + " (" + Math.round(blob.size / 1024) + " KB).", "good");
      });
    });

    document.getElementById("convertZip").addEventListener("click", function () {
      const files = Array.from(fileInput.files || []);
      if (!files.length) { kit.showPanel(document.getElementById("msg"), "Choose one or more images.", "bad"); return; }
      const o = opts();
      const ext = extFor(o.type);
      const entries = [];
      let i = 0;
      function next() {
        if (i >= files.length) {
          const zip = kit.buildZip(entries.map(function (e) {
            /* binary as latin1 string for STORE zip helper */
            let s = "";
            const u8 = new Uint8Array(e.buf);
            for (let j = 0; j < u8.length; j++) s += String.fromCharCode(u8[j]);
            return { name: e.name, data: s };
          }));
          kit.downloadBlob("paragon-images.zip", zip);
          logJob({ name: files.length + " images", out: "zip/" + ext, kb: Math.round(zip.size / 1024), bytes: zip.size, kind: "batch-image" });
          kit.showPanel(document.getElementById("msg"), "ZIP ready with " + entries.length + " converted image(s).", "good");
          return;
        }
        const f = files[i++];
        convertOneImage(f, o, function (err, blob) {
          if (!err && blob) {
            blob.arrayBuffer().then(function (buf) {
              entries.push({ name: (f.name.replace(/\.[^.]+$/, "") || "image") + "." + ext, buf: buf });
              next();
            });
          } else next();
        });
      }
      next();
    });
  }

  /* ---- data convert ---- */
  function detectAndParse(text) {
    const t = String(text || "").trim();
    if (!t) return { kind: "empty", objs: [] };
    if (t[0] === "[" || t[0] === "{") {
      try {
        const j = JSON.parse(t);
        const arr = Array.isArray(j) ? j : [j];
        return { kind: "json", objs: arr };
      } catch (e) { /* fall through */ }
    }
    if (t.indexOf("\t") >= 0 && t.indexOf(",") < 0) {
      const rows = t.split(/\r?\n/).map(function (line) { return line.split("\t"); });
      return { kind: "tsv", objs: kit.csvToObjects(rows) };
    }
    const rows = kit.parseCSV(t);
    return { kind: "csv", objs: kit.csvToObjects(rows) };
  }

  function toYamlLite(objs) {
    return (objs || []).map(function (o) {
      return "- " + Object.keys(o).map(function (k) {
        const v = String(o[k] == null ? "" : o[k]);
        if (/[:#\n]/.test(v) || v === "") return k + ': "' + v.replace(/"/g, '\\"') + '"';
        return k + ": " + v;
      }).join("\n  ");
    }).join("\n");
  }

  function runDataConvert(download) {
    const text = document.getElementById("dataIn").value;
    const parsed = detectAndParse(text);
    if (!parsed.objs.length) {
      kit.showPanel(document.getElementById("msg"), "Paste or load CSV/JSON/TSV first.", "bad");
      return;
    }
    const mode = document.getElementById("dataMode").value;
    let out = "";
    let name = "converted";
    let mime = "text/plain;charset=utf-8";
    if (mode === "json") {
      out = JSON.stringify(parsed.objs, null, 2);
      name = "data.json"; mime = "application/json;charset=utf-8";
    } else if (mode === "csv") {
      out = kit.objectsToCSV(parsed.objs);
      name = "data.csv"; mime = "text/csv;charset=utf-8";
    } else if (mode === "tsv") {
      const keys = Object.keys(parsed.objs[0] || {});
      out = [keys.join("\t")].concat(parsed.objs.map(function (o) {
        return keys.map(function (k) { return String(o[k] == null ? "" : o[k]).replace(/\t/g, " "); }).join("\t");
      })).join("\n");
      name = "data.tsv";
    } else {
      out = toYamlLite(parsed.objs);
      name = "data.yaml";
    }
    document.getElementById("dataOut").textContent = out.slice(0, 4000) + (out.length > 4000 ? "\n…" : "");
    if (download) {
      kit.downloadText(name, out, mime);
      logJob({ name: name, out: mode, kb: Math.round(out.length / 1024), bytes: out.length, kind: "data" });
      kit.showPanel(document.getElementById("msg"), "Downloaded " + name + " (" + parsed.objs.length + " rows).", "good");
    }
  }

  document.getElementById("runData")?.addEventListener("click", function () { runDataConvert(true); });
  document.getElementById("previewData")?.addEventListener("click", function () { runDataConvert(false); });
  document.getElementById("dataFile")?.addEventListener("change", function () {
    const f = this.files && this.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function () {
      document.getElementById("dataIn").value = String(reader.result || "");
      kit.showPanel(document.getElementById("msg"), "Loaded " + f.name, "good");
    };
    reader.readAsText(f);
  });

  /* ---- text / md ---- */
  if (document.getElementById("dlText")) {
    document.getElementById("dlText").addEventListener("click", function () {
      const text = document.getElementById("textIn").value;
      const name = document.getElementById("textName").value.trim() || "note.txt";
      kit.downloadText(name, text, "text/plain;charset=utf-8");
      logJob({ name: name, out: "text", bytes: text.length, kind: "text" });
      kit.showPanel(document.getElementById("msg"), "Text file downloaded.", "good");
    });
    document.getElementById("textFile").addEventListener("change", function () {
      const f = this.files && this.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () {
        document.getElementById("textIn").value = String(reader.result || "");
        document.getElementById("textName").value = f.name;
      };
      reader.readAsText(f);
    });
    document.getElementById("mdToHtml").addEventListener("click", function () {
      const md = document.getElementById("textIn").value;
      /* minimal markdown: headings, bold, italic, code, links, lists, paragraphs */
      let html = kit.escapeHTML(md);
      html = html.replace(/^###### (.*)$/gm, "<h6>$1</h6>")
        .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
        .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
        .replace(/^### (.*)$/gm, "<h3>$1</h3>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>")
        .replace(/^# (.*)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/^\- (.*)$/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>\n?)+/g, function (m) { return "<ul>" + m + "</ul>"; })
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>");
      const doc = "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Paragon MD</title></head><body><p>" + html + "</p></body></html>";
      kit.downloadText((document.getElementById("textName").value.replace(/\.[^.]+$/, "") || "note") + ".html", doc, "text/html;charset=utf-8");
      logJob({ name: "md→html", out: "html", bytes: doc.length, kind: "md" });
      kit.showPanel(document.getElementById("msg"), "HTML downloaded (simple MD subset).", "good");
    });
    document.getElementById("htmlToMd").addEventListener("click", function () {
      let t = document.getElementById("textIn").value;
      t = t.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
        .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
        .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
        .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      document.getElementById("textIn").value = t.trim();
      kit.showPanel(document.getElementById("msg"), "Converted HTML tags to plain MD-ish text in the box.", "good");
    });
  }

  /* ---- zip ---- */
  document.getElementById("makeZip")?.addEventListener("click", function () {
    const input = document.getElementById("zipFiles");
    const files = Array.from(input.files || []);
    if (!files.length) { kit.showPanel(document.getElementById("msg"), "Pick files to pack.", "bad"); return; }
    const entries = [];
    let pending = files.length;
    files.forEach(function (f) {
      const reader = new FileReader();
      reader.onload = function () {
        let s = "";
        const u8 = new Uint8Array(reader.result);
        for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
        entries.push({ name: f.name.replace(/^.*[\\/]/, ""), data: s });
        pending--;
        if (pending === 0) {
          const zip = kit.buildZip(entries);
          const name = document.getElementById("zipName").value.trim() || "paragon-pack.zip";
          kit.downloadBlob(name, zip);
          logJob({ name: name, out: "zip", kb: Math.round(zip.size / 1024), bytes: zip.size, kind: "zip" });
          kit.showPanel(document.getElementById("msg"), "ZIP built with " + entries.length + " file(s).", "good");
        }
      };
      reader.readAsArrayBuffer(f);
    });
  });

  document.getElementById("zipIn")?.addEventListener("change", function () {
    const f = this.files && this.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function () {
      const bytes = new Uint8Array(reader.result);
      const names = [];
      let i = 0;
      while (i + 30 < bytes.length) {
        if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x03 && bytes[i + 3] === 0x04) {
          const nameLen = bytes[i + 26] | (bytes[i + 27] << 8);
          const extraLen = bytes[i + 28] | (bytes[i + 29] << 8);
          const comp = bytes[i + 8] | (bytes[i + 9] << 8);
          const csize = bytes[i + 18] | (bytes[i + 19] << 8) | (bytes[i + 20] << 16) | (bytes[i + 21] << 24);
          let name = "";
          for (let n = 0; n < nameLen; n++) name += String.fromCharCode(bytes[i + 30 + n]);
          names.push(name + (comp ? " (compressed — extract offline)" : " (store)"));
          i += 30 + nameLen + extraLen + (csize >>> 0);
          continue;
        }
        i++;
        if (names.length > 200) break;
      }
      document.getElementById("zipList").textContent = names.length
        ? names.join("\n")
        : "No local file headers found (may be empty or unsupported).";
    };
    reader.readAsArrayBuffer(f);
  });

  stats();
  renderLog();
})();
