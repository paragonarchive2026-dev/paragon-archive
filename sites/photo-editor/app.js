/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/photo-editor/app.js
  ROLE: Paragon Photo canvas pipeline — adjust, filter, crop, text, export.
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

  const canvas = document.getElementById("photoCanvas");
  if (!canvas) { stats(); return; }
  const ctx = canvas.getContext("2d");
  let source = null;
  let crop = null;
  let drag = null;

  function bumpEdit() {
    const s = load(); s.edits = (s.edits || 0) + 1; save(s); stats();
  }

  function draw() {
    if (!source) {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const rot = Number(document.getElementById("rotate").value) || 0;
    const flip = document.getElementById("flip").value;
    const b = Number(document.getElementById("bright").value) || 0;
    const c = Number(document.getElementById("contrast").value) || 0;
    const sat = Number(document.getElementById("saturate").value) || 0;
    const filter = document.getElementById("filter").value;

    let w = source.naturalWidth;
    let h = source.naturalHeight;
    if (rot === 90 || rot === 270) { canvas.width = h; canvas.height = w; }
    else { canvas.width = w; canvas.height = h; }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rot * Math.PI / 180);
    if (flip === "h") ctx.scale(-1, 1);
    if (flip === "v") ctx.scale(1, -1);

    let filterCss = "brightness(" + (100 + b) + "%) contrast(" + (100 + c) + "%) saturate(" + (100 + sat) + "%)";
    if (filter === "warm") filterCss += " sepia(0.25) hue-rotate(-10deg)";
    if (filter === "cool") filterCss += " hue-rotate(15deg) saturate(1.1)";
    if (filter === "mono") filterCss += " grayscale(1)";
    if (filter === "fade") filterCss += " contrast(0.9) brightness(1.05) saturate(0.85)";
    if (filter === "vivid") filterCss += " saturate(1.4) contrast(1.1)";
    if (filter === "sepia") filterCss += " sepia(0.7)";
    ctx.filter = filterCss;
    ctx.drawImage(source, -w / 2, -h / 2, w, h);
    ctx.filter = "none";

    const text = document.getElementById("textOverlay").value;
    if (text) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = "bold " + (Number(document.getElementById("textSize").value) || 28) + "px system-ui,sans-serif";
      ctx.fillStyle = document.getElementById("textColor").value || "#fff";
      ctx.strokeStyle = "rgba(0,0,0,.55)";
      ctx.lineWidth = 3;
      const x = 24, y = canvas.height - 24;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }

    if (crop) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
      ctx.strokeStyle = "#a29bfe";
      ctx.lineWidth = 2;
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
      /* redraw image in crop hole */
      ctx.save();
      ctx.beginPath();
      ctx.rect(crop.x, crop.y, crop.w, crop.h);
      ctx.clip();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rot * Math.PI / 180);
      if (flip === "h") ctx.scale(-1, 1);
      if (flip === "v") ctx.scale(1, -1);
      ctx.filter = filterCss;
      ctx.drawImage(source, -w / 2, -h / 2, w, h);
      ctx.restore();
      if (text) {
        ctx.font = "bold " + (Number(document.getElementById("textSize").value) || 28) + "px system-ui,sans-serif";
        ctx.fillStyle = document.getElementById("textColor").value || "#fff";
        ctx.fillText(text, 24, canvas.height - 24);
      }
      ctx.strokeStyle = "#a29bfe";
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
    }
    ctx.restore();
    document.getElementById("photoMeta").textContent = canvas.width + "×" + canvas.height + " px";
  }

  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener("mousedown", function (e) {
    if (!source) return;
    drag = pointerPos(e);
    crop = { x: drag.x, y: drag.y, w: 0, h: 0 };
  });
  canvas.addEventListener("mousemove", function (e) {
    if (!drag) return;
    const p = pointerPos(e);
    crop = {
      x: Math.min(drag.x, p.x),
      y: Math.min(drag.y, p.y),
      w: Math.abs(p.x - drag.x),
      h: Math.abs(p.y - drag.y)
    };
    draw();
  });
  window.addEventListener("mouseup", function () { drag = null; });

  document.getElementById("photoFile").addEventListener("change", function () {
    const f = this.files && this.files[0];
    if (!f) return;
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = function () {
      source = img;
      crop = null;
      draw();
      bumpEdit();
      kit.showPanel(document.getElementById("msg"), "Loaded " + f.name, "good");
    };
    img.onerror = function () {
      kit.showPanel(document.getElementById("msg"), "Could not decode image (try JPG/PNG/WebP).", "bad");
    };
    img.src = url;
  });

  ["bright","contrast","saturate","filter","rotate","flip","textOverlay","textSize","textColor"].forEach(function (id) {
    document.getElementById(id)?.addEventListener("input", function () {
      if (id === "bright") document.getElementById("brightV").textContent = this.value;
      if (id === "contrast") document.getElementById("contrastV").textContent = this.value;
      if (id === "saturate") document.getElementById("satV").textContent = this.value;
      if (id === "filter" && this.value !== "none") {
        const s = load(); s.filters = (s.filters || 0) + 1; save(s); stats();
      }
      draw();
    });
  });

  document.getElementById("applyCrop").addEventListener("click", function () {
    if (!source || !crop || crop.w < 4 || crop.h < 4) {
      kit.showPanel(document.getElementById("msg"), "Drag a crop rectangle on the canvas first.", "bad");
      return;
    }
    /* bake current canvas without overlay dim into new image */
    const tmp = document.createElement("canvas");
    /* force redraw without crop overlay */
    const saved = crop; crop = null; draw();
    tmp.width = Math.max(1, Math.floor(saved.w));
    tmp.height = Math.max(1, Math.floor(saved.h));
    tmp.getContext("2d").drawImage(canvas, saved.x, saved.y, saved.w, saved.h, 0, 0, tmp.width, tmp.height);
    const img = new Image();
    img.onload = function () {
      source = img;
      document.getElementById("rotate").value = "0";
      document.getElementById("flip").value = "none";
      crop = null;
      draw();
      bumpEdit();
      kit.showPanel(document.getElementById("msg"), "Crop applied.", "good");
    };
    img.src = tmp.toDataURL("image/png");
  });
  document.getElementById("clearCrop").addEventListener("click", function () { crop = null; draw(); });
  document.getElementById("squareCrop")?.addEventListener("click", function () {
    if (!source) { kit.showPanel(document.getElementById("msg"), "Load a photo first.", "bad"); return; }
    const side = Math.min(canvas.width, canvas.height);
    crop = {
      x: Math.floor((canvas.width - side) / 2),
      y: Math.floor((canvas.height - side) / 2),
      w: side,
      h: side
    };
    draw();
    kit.showPanel(document.getElementById("msg"), "Center square selected — click Apply crop.", "good");
  });
  document.getElementById("healRegion")?.addEventListener("click", function () {
    if (!source || !crop || crop.w < 4) {
      kit.showPanel(document.getElementById("msg"), "Drag a region to heal first (simple blur fill — not AI inpaint).", "bad");
      return;
    }
    const saved = crop;
    crop = null;
    draw();
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width; tmp.height = canvas.height;
    const tctx = tmp.getContext("2d");
    tctx.drawImage(canvas, 0, 0);
    /* sample average color from region and fill — honest simple heal */
    const sample = tctx.getImageData(saved.x, saved.y, Math.max(1, saved.w), Math.max(1, saved.h));
    let r = 0, g = 0, b = 0, n = sample.data.length / 4;
    for (let i = 0; i < sample.data.length; i += 4) {
      r += sample.data[i]; g += sample.data[i + 1]; b += sample.data[i + 2];
    }
    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    tctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    tctx.fillRect(saved.x, saved.y, saved.w, saved.h);
    /* soft edge: redraw blurred patch if filter available */
    try {
      tctx.filter = "blur(6px)";
      tctx.drawImage(canvas, saved.x, saved.y, saved.w, saved.h, saved.x, saved.y, saved.w, saved.h);
      tctx.filter = "none";
    } catch (e) { /* ignore */ }
    const img = new Image();
    img.onload = function () {
      source = img;
      document.getElementById("rotate").value = "0";
      document.getElementById("flip").value = "none";
      crop = null;
      draw();
      bumpEdit();
      kit.showPanel(document.getElementById("msg"), "Region filled with local average/blur (not professional inpaint).", "good");
    };
    img.src = tmp.toDataURL("image/png");
  });

  document.getElementById("resetPhoto").addEventListener("click", function () {
    ["bright","contrast","saturate"].forEach(function (id) { document.getElementById(id).value = 0; });
    document.getElementById("brightV").textContent = "0";
    document.getElementById("contrastV").textContent = "0";
    document.getElementById("satV").textContent = "0";
    document.getElementById("filter").value = "none";
    document.getElementById("rotate").value = "0";
    document.getElementById("flip").value = "none";
    document.getElementById("textOverlay").value = "";
    crop = null;
    draw();
  });

  document.getElementById("exportPhoto").addEventListener("click", function () {
    if (!source) { kit.showPanel(document.getElementById("msg"), "Load a photo first.", "bad"); return; }
    const had = crop; crop = null; draw();
    const type = document.getElementById("outFmt").value || "image/jpeg";
    const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    canvas.toBlob(function (blob) {
      if (!blob) return;
      kit.downloadBlob("paragon-photo." + ext, blob);
      const s = load(); s.exports = (s.exports || 0) + 1; save(s); stats();
      kit.showPanel(document.getElementById("msg"), "Downloaded " + ext.toUpperCase() + ".", "good");
      crop = had; draw();
    }, type, 0.92);
  });

  stats();
})();
