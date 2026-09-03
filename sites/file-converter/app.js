/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/file-converter/app.js
  ROLE: Paragon Files local engine — paragonFileConverter.v1
  RESTORE-LOAD NOTE: Canvas-only image pipeline; no uploads.
*/
(function () {
  "use strict";
  const K = "paragonFileConverter.v1";
  const kit = window.ParagonSiteKit;
  function def() { return { jobs: 0, bytes: 0, saved: 0 }; }
  function load() { return Object.assign(def(), kit.storageGet(K, def())); }
  function save(s) { kit.storageSet(K, s); }
  function stats() {
    const s = load();
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statJobs", s.jobs || 0);
    set("statBytes", Math.round((s.bytes || 0) / 1024));
    set("statSaved", s.saved || 0);
  }
  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);

  const fileInput = document.getElementById("imgFile");
  if (fileInput) {
    let objectUrl = null;
    fileInput.addEventListener("change", function () {
      const f = fileInput.files && fileInput.files[0];
      const prev = document.getElementById("imgPreview");
      if (!f) return;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(f);
      prev.innerHTML = '<img src="' + objectUrl + '" alt="Preview" style="max-width:100%;border-radius:12px;border:1px solid var(--border)">';
    });
    document.getElementById("convertImg").addEventListener("click", function () {
      const f = fileInput.files && fileInput.files[0];
      if (!f) { kit.showPanel(document.getElementById("msg"), "Choose an image first.", "bad"); return; }
      if (!f.type.startsWith("image/")) {
        kit.showPanel(document.getElementById("msg"), "That file is not a browser-decodable image. See Guide for honest limits.", "bad");
        return;
      }
      const img = new Image();
      img.onload = function () {
        let w = img.naturalWidth, h = img.naturalHeight;
        const maxW = Number(document.getElementById("maxW").value) || 0;
        const maxH = Number(document.getElementById("maxH").value) || 0;
        if (maxW && w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
        if (maxH && h > maxH) { w = Math.round(w * (maxH / h)); h = maxH; }
        const canvas = document.getElementById("workCanvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const type = document.getElementById("outType").value;
        const q = Number(document.getElementById("quality").value) || 0.85;
        canvas.toBlob(function (blob) {
          if (!blob) {
            kit.showPanel(document.getElementById("msg"), "Convert failed in this browser.", "bad");
            return;
          }
          const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = (f.name.replace(/\.[^.]+$/, "") || "image") + "." + ext;
          document.body.appendChild(a); a.click(); a.remove();
          const s = load();
          s.jobs = (s.jobs || 0) + 1;
          s.bytes = (s.bytes || 0) + f.size + blob.size;
          s.saved = (s.saved || 0) + 1;
          save(s); stats();
          kit.showPanel(document.getElementById("msg"), "Downloaded " + ext.toUpperCase() + " (" + Math.round(blob.size / 1024) + " KB).", "good");
        }, type, q);
      };
      img.onerror = function () {
        kit.showPanel(document.getElementById("msg"), "Browser could not decode this image (format unsupported here).", "bad");
      };
      img.src = URL.createObjectURL(f);
    });
  }

  if (document.getElementById("dlText")) {
    document.getElementById("dlText").addEventListener("click", function () {
      const text = document.getElementById("textIn").value;
      const name = document.getElementById("textName").value.trim() || "note.txt";
      kit.downloadText(name, text, "text/plain;charset=utf-8");
      const s = load(); s.jobs = (s.jobs || 0) + 1; s.saved = (s.saved || 0) + 1; s.bytes = (s.bytes || 0) + text.length; save(s); stats();
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
  }

  stats();
})();
