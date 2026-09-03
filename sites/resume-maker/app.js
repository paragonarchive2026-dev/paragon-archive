/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/resume-maker/app.js
  ROLE: Paragon Resume local engine — paragonResumeMaker.v1
  RESTORE-LOAD NOTE: Print-to-PDF via browser. No DOCX in v1 (honest).
*/
(function () {
  "use strict";
  const K = "paragonResumeMaker.v1";
  const kit = window.ParagonSiteKit;
  function def() { return { resume: null, exports: 0 }; }
  function load() { return Object.assign(def(), kit.storageGet(K, def())); }
  function save(s) { kit.storageSet(K, s); }

  function readForm() {
    return {
      fullName: document.getElementById("fullName").value.trim(),
      headline: document.getElementById("headline").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      location: document.getElementById("location").value.trim(),
      links: document.getElementById("links").value.trim(),
      summary: document.getElementById("summary").value.trim(),
      experience: document.getElementById("experience").value,
      education: document.getElementById("education").value,
      skills: document.getElementById("skills").value.trim(),
      coverLetter: document.getElementById("coverLetter") ? document.getElementById("coverLetter").value.trim() : "",
      templateStyle: document.getElementById("templateStyle") ? document.getElementById("templateStyle").value : "classic",
      updatedAt: new Date().toISOString()
    };
  }

  function fillForm(r) {
    if (!r || !document.getElementById("fullName")) return;
    ["fullName","headline","email","phone","location","links","summary","experience","education","skills","coverLetter","templateStyle"].forEach(function (k) {
      const el = document.getElementById(k);
      if (el) el.value = r[k] || "";
    });
  }

  function sectionCount(r) {
    if (!r) return 0;
    let n = 0;
    if (r.summary) n++;
    if ((r.experience || "").trim()) n++;
    if ((r.education || "").trim()) n++;
    if (r.skills) n++;
    if (r.fullName) n++;
    return n;
  }

  function renderStats() {
    const s = load();
    const r = s.resume;
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statResumes", r && r.fullName ? 1 : 0);
    set("statSections", sectionCount(r));
    set("statExports", s.exports || 0);
  }

  function renderPreview() {
    const sheet = document.getElementById("resumeSheet");
    const empty = document.getElementById("resumeEmpty");
    if (!sheet) return;
    const r = load().resume;
    if (!r || !r.fullName) {
      if (empty) empty.hidden = false;
      sheet.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    sheet.hidden = false;
    const contact = [r.email, r.phone, r.location, r.links].filter(Boolean).join(" · ");
    function block(text) {
      return kit.escapeHTML(text || "").split(/\n\s*\n/).map(function (chunk) {
        const lines = chunk.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
        if (!lines.length) return "";
        const head = lines[0];
        const rest = lines.slice(1);
        return "<p><strong>" + kit.escapeHTML(head) + "</strong></p>" +
          (rest.length ? "<ul>" + rest.map(function (l) { return "<li>" + kit.escapeHTML(l.replace(/^[•\\-\\*]\\s*/, "")) + "</li>"; }).join("") + "</ul>" : "");
      }).join("");
    }
    const skills = (r.skills || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    sheet.innerHTML =
      "<h1>" + kit.escapeHTML(r.fullName) + "</h1>" +
      (r.headline ? "<div class='sub'><strong>" + kit.escapeHTML(r.headline) + "</strong></div>" : "") +
      (contact ? "<div class='sub'>" + kit.escapeHTML(contact) + "</div>" : "") +
      (r.summary ? "<h2>Summary</h2><p>" + kit.escapeHTML(r.summary) + "</p>" : "") +
      (r.experience ? "<h2>Experience</h2>" + block(r.experience) : "") +
      (r.education ? "<h2>Education</h2>" + block(r.education) : "") +
      (skills.length ? "<h2>Skills</h2><p>" + skills.map(kit.escapeHTML).join(" · ") + "</p>" : "") +
      (r.coverLetter ? "<h2>Cover letter</h2><p style=\"white-space:pre-wrap\">" + kit.escapeHTML(r.coverLetter) + "</p>" : "");
    sheet.dataset.template = r.templateStyle || "classic";
  }

  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);

  if (document.getElementById("saveResume")) {
    fillForm(load().resume);
    document.getElementById("saveResume").addEventListener("click", function () {
      const r = readForm();
      if (!r.fullName) {
        kit.showPanel(document.getElementById("msg"), "Full name is required.", "bad");
        return;
      }
      const s = load();
      s.resume = r;
      save(s);
      renderStats();
      kit.showPanel(document.getElementById("msg"), "Resume saved on this device.", "good");
    });
  }

  if (document.getElementById("printResume")) {
    document.getElementById("printResume").addEventListener("click", function () {
      const s = load();
      s.exports = (s.exports || 0) + 1;
      save(s);
      renderStats();
      window.print();
    });
    renderPreview();
  }

  renderStats();
})();
