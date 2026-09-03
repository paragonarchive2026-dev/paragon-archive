/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/photo-editor/app.js
  ROLE: Paragon Photo local engine — paragonPhotoEditor.v1
  RESTORE-LOAD NOTE: Canvas pixel pipeline only.
*/
(function () {
  "use strict";
  const K = "paragonPhotoEditor.v1";
  const kit = window.ParagonSiteKit;
  function def() { return { edits: 0, exports: 0, filters: 0 }; }
  function load() { return Object.assign(def(), kit.storageGet(K, def())); }
  function save(s) { kit.storageSet(K, s); }
  function stats() {
    const s = load();
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statEdits", s.edits || 0);
    set("statExports", s.exports || 0);
    set("statFilters", s.filters || 0);
  }
  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);

  let source = null; // Image
  const canvas = document.getElementById("photoCanvas");
  if (!canvas) { stats(); return; }
  const ctx = canvas.getContext("2d");

  function draw() {
    if (!source) {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#666";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Load a photo to begin", canvas.width / 2, canvas.height / 2);
      return;
    }
    const maxSide = Number(document.getElementById("maxSide").value) || 1600;
    let w = source.naturalWidth, h = source.naturalHeight;
    const scale = Math.min(1, maxSide / Math.max(w, h), 1000 / Math.max(w, h));
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
    canvas.width = w; canvas.height = h;
    const rot = Number(document.getElementById("rotate")?.value || 0);
    const flip = document.getElementById("flipH")?.value === "1";
    if (rot === 90 || rot === 270) { canvas.width = h; canvas.height = w; }
    else { canvas.width = w; canvas.height = h; }
    ctx.save();
    if (rot || flip) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rot * Math.PI / 180);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(source, -w / 2, -h / 2, w, h);
    } else {
      ctx.drawImage(source, 0, 0, w, h);
    }
    ctx.restore();
    w = canvas.width; h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const b = Number(document.getElementById("bright").value) || 0;
    const c = Number(document.getElementById("contrast").value) || 0;
    const factor = (259 * (c + 255)) / (255 * (259 - c));
    const filter = document.getElementById("filter").value;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], bch = d[i + 2];
      r = factor * (r - 128) + 128 + b;
      g = factor * (g - 128) + 128 + b;
      bch = factor * (bch - 128) + 128 + b;
      if (filter === "mono") {
        const y = 0.299 * r + 0.587 * g + 0.114 * bch;
        r = g = bch = y;
      } else if (filter === "warm") {
        r += 18; bch -= 10;
      } else if (filter === "cool") {
        bch += 18; r -= 8;
      } else if (filter === "fade") {
        r = r * 0.9 + 20; g = g * 0.9 + 20; bch = bch * 0.9 + 20;
      }
      d[i] = Math.max(0, Math.min(255, r));
      d[i + 1] = Math.max(0, Math.min(255, g));
      d[i + 2] = Math.max(0, Math.min(255, bch));
    }
    ctx.putImageData(imgData, 0, 0);
    const text = (document.getElementById("overlayText") && document.getElementById("overlayText").value || "").trim();
    if (text) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, h - 42, w, 42);
      ctx.fillStyle = "#fff";
      ctx.font = "bold " + Math.max(14, Math.round(w / 28)) + "px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(text, w / 2, h - 14, w - 24);
      ctx.restore();
    }
  }

  function bumpEdit() {
    const s = load();
    s.edits = (s.edits || 0) + 1;
    if (document.getElementById("filter").value !== "none") s.filters = (s.filters || 0) + 1;
    save(s); stats();
  }

  document.getElementById("photoFile").addEventListener("change", function () {
    const f = this.files && this.files[0];
    if (!f) return;
    const img = new Image();
    img.onload = function () { source = img; draw(); bumpEdit(); };
    img.onerror = function () { kit.showPanel(document.getElementById("msg"), "Could not decode image.", "bad"); };
    img.src = URL.createObjectURL(f);
  });
  ["bright", "contrast", "filter", "maxSide", "overlayText", "rotate", "flipH"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      document.getElementById("brightV").textContent = document.getElementById("bright").value;
      document.getElementById("contrastV").textContent = document.getElementById("contrast").value;
      draw();
    });
    document.getElementById(id).addEventListener("change", function () { bumpEdit(); draw(); });
  });
  document.getElementById("resetPhoto").addEventListener("click", function () {
    document.getElementById("bright").value = 0;
    document.getElementById("contrast").value = 0;
    document.getElementById("filter").value = "none";
    document.getElementById("brightV").textContent = "0";
    document.getElementById("contrastV").textContent = "0";
    draw();
  });
  document.getElementById("exportPhoto").addEventListener("click", function () {
    if (!source) { kit.showPanel(document.getElementById("msg"), "Load a photo first.", "bad"); return; }
    draw();
    canvas.toBlob(function (blob) {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "paragon-photo.jpg";
      document.body.appendChild(a); a.click(); a.remove();
      const s = load(); s.exports = (s.exports || 0) + 1; save(s); stats();
      kit.showPanel(document.getElementById("msg"), "JPG downloaded.", "good");
    }, "image/jpeg", 0.9);
  });
  draw();
  stats();
})();
