/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/resume-maker/app.js
  ROLE: Paragon Resume — builder, LinkedIn-text parse, job tailor, DOCX + print.
  RESTORE-LOAD NOTE: DOCX via local OOXML builder in site-kit. No server.
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
      fullName: val("fullName"),
      headline: val("headline"),
      email: val("email"),
      phone: val("phone"),
      location: val("location"),
      links: val("links"),
      summary: val("summary"),
      experience: val("experience"),
      education: val("education"),
      skills: val("skills"),
      extras: val("extras"),
      coverLetter: val("coverLetter"),
      templateStyle: val("templateStyle") || "classic"
    };
  }
  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }
  function fillForm(r) {
    if (!r) return;
    ["fullName","headline","email","phone","location","links","summary","experience","education","skills","extras","coverLetter","templateStyle"].forEach(function (k) {
      const el = document.getElementById(k);
      if (el && r[k] != null) el.value = r[k];
    });
  }
  function sectionCount(r) {
    if (!r) return 0;
    return ["summary","experience","education","skills","extras","coverLetter"].filter(function (k) { return (r[k] || "").trim(); }).length;
  }
  function stats() {
    const s = load();
    const r = s.resume;
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statResumes", r && r.fullName ? 1 : 0);
    set("statSections", sectionCount(r));
    set("statExports", s.exports || 0);
  }

  function parseLinkedInish(text) {
    const t = String(text || "");
    const out = readForm();
    const lines = t.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    if (lines[0] && !out.fullName) out.fullName = lines[0].replace(/^#+\s*/, "");
    if (lines[1] && /engineer|developer|manager|designer|analyst|specialist|officer|founder|student/i.test(lines[1]) && !out.headline) {
      out.headline = lines[1];
    }
    const email = t.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (email) out.email = email[0];
    const phone = t.match(/(\+?\d[\d\s().-]{7,}\d)/);
    if (phone) out.phone = phone[1].trim();

    function section(after, until) {
      const re = new RegExp(after + "[\\s\\S]*?(?=" + until + "|$)", "i");
      const m = t.match(re);
      if (!m) return "";
      return m[0].replace(new RegExp("^" + after + "\\s*", "i"), "").trim();
    }
    const exp = section("Experience", "Education|Skills|Licenses|Certifications|About|Summary|Projects|Volunteering");
    const edu = section("Education", "Experience|Skills|Licenses|Certifications|About|Summary|Projects");
    const skills = section("Skills", "Experience|Education|Licenses|Certifications|About|Summary|Projects|Languages");
    const about = section("About|Summary|Profile", "Experience|Education|Skills");
    if (exp) out.experience = exp;
    if (edu) out.education = edu;
    if (skills) out.skills = skills.replace(/\n/g, ", ").replace(/,+/g, ",").replace(/\s+,/g, ",");
    if (about) out.summary = about.split(/\n/).slice(0, 6).join(" ");
    return out;
  }

  function resumeParagraphs(r) {
    const lines = [];
    lines.push((r.fullName || "Name").toUpperCase());
    lines.push([r.headline, r.location].filter(Boolean).join(" · "));
    lines.push([r.email, r.phone, r.links].filter(Boolean).join(" · "));
    lines.push("");
    if (r.summary) { lines.push("SUMMARY"); lines.push(r.summary); lines.push(""); }
    if (r.experience) { lines.push("EXPERIENCE"); lines.push(r.experience); lines.push(""); }
    if (r.education) { lines.push("EDUCATION"); lines.push(r.education); lines.push(""); }
    if (r.skills) { lines.push("SKILLS"); lines.push(r.skills); lines.push(""); }
    if (r.extras) { lines.push("ADDITIONAL"); lines.push(r.extras); lines.push(""); }
    if (r.coverLetter) { lines.push("COVER LETTER"); lines.push(r.coverLetter); }
    return lines;
  }

  function renderSheet(r) {
    if (!r) return "";
    const style = r.templateStyle || "classic";
    const border = style === "modern" ? "border-left:4px solid #6c5ce7;padding-left:16px" : "";
    const compact = style === "compact" ? "font-size:12.5px" : "";
    function block(title, body) {
      if (!(body || "").trim()) return "";
      const htmlBody = kit.escapeHTML(body).replace(/\n/g, "<br>").replace(/(^|<br>)\- /g, "$1• ");
      return '<div class="sec" style="margin:14px 0"><div style="font-weight:800;letter-spacing:1px;font-size:12px;text-transform:uppercase;border-bottom:1px solid #ccc;margin-bottom:6px">' +
        kit.escapeHTML(title) + "</div><div>" + htmlBody + "</div></div>";
    }
    return '<div class="resume-sheet" style="' + border + ";" + compact + '">' +
      '<div style="font-size:22px;font-weight:900">' + kit.escapeHTML(r.fullName || "") + "</div>" +
      '<div style="opacity:.8;margin:4px 0 2px">' + kit.escapeHTML(r.headline || "") + "</div>" +
      '<div style="font-size:13px;opacity:.75">' + kit.escapeHTML([r.email, r.phone, r.location, r.links].filter(Boolean).join(" · ")) + "</div>" +
      block("Summary", r.summary) +
      block("Experience", r.experience) +
      block("Education", r.education) +
      block("Skills", r.skills) +
      block("Additional", r.extras) +
      block("Cover letter", r.coverLetter) +
      "</div>";
  }

  function liveSnap() {
    const box = document.getElementById("liveSnap");
    if (!box) return;
    const r = readForm();
    box.innerHTML = renderSheet(r) || "Fill the form to preview.";
  }

  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);

  if (document.getElementById("saveResume")) {
    const existing = load().resume;
    if (existing) fillForm(existing);
    liveSnap();
    ["fullName","headline","summary","experience","education","skills","templateStyle"].forEach(function (id) {
      document.getElementById(id)?.addEventListener("input", liveSnap);
    });

    document.getElementById("parseImport").addEventListener("click", function () {
      const parsed = parseLinkedInish(document.getElementById("importPaste").value);
      fillForm(parsed);
      liveSnap();
      kit.showPanel(document.getElementById("msg"), "Parsed what we could from the paste — review every field.", "good");
    });
    document.getElementById("clearImport").addEventListener("click", function () {
      document.getElementById("importPaste").value = "";
    });

    document.getElementById("saveResume").addEventListener("click", function () {
      const r = readForm();
      if (!r.fullName) {
        kit.showPanel(document.getElementById("msg"), "Add your full name before saving.", "bad");
        return;
      }
      const s = load();
      s.resume = r;
      save(s); stats(); liveSnap();
      kit.showPanel(document.getElementById("msg"), "Draft saved on this device.", "good");
    });
    document.getElementById("gotoPreview").addEventListener("click", function () {
      const s = load(); s.resume = readForm(); save(s);
      location.href = "preview.html";
    });
    document.getElementById("exportDocx").addEventListener("click", function () {
      const r = readForm();
      if (!r.fullName) { kit.showPanel(document.getElementById("msg"), "Save a name first.", "bad"); return; }
      kit.downloadDocx((r.fullName || "resume").replace(/\s+/g, "_") + ".docx", resumeParagraphs(r));
      const s = load(); s.resume = r; s.exports = (s.exports || 0) + 1; save(s); stats();
      kit.showPanel(document.getElementById("msg"), "DOCX downloaded (opens in Word / LibreOffice / Google Docs).", "good");
    });
    document.getElementById("exportJson").addEventListener("click", function () {
      const r = readForm();
      kit.downloadText("resume-data.json", JSON.stringify(r, null, 2), "application/json;charset=utf-8");
      const s = load(); s.exports = (s.exports || 0) + 1; save(s); stats();
    });

    document.getElementById("tailorJob").addEventListener("click", function () {
      const job = (document.getElementById("jobPost").value || "").toLowerCase();
      const r = readForm();
      const blob = [r.summary, r.experience, r.skills, r.headline].join(" ").toLowerCase();
      if (!job.trim()) {
        kit.showPanel(document.getElementById("msg"), "Paste a job description first.", "bad");
        return;
      }
      const words = job.replace(/[^a-z0-9+#.\s-]/g, " ").split(/\s+/)
        .filter(function (w) { return w.length > 3; });
      const stop = { with:1, that:1, this:1, from:1, your:1, have:1, will:1, been:1, were:1, they:1, their:1, about:1, into:1, also:1, than:1, then:1, such:1, ability:1, years:1, work:1, working:1, experience:1, team:1, role:1, including:1 };
      const freq = {};
      words.forEach(function (w) {
        if (stop[w]) return;
        freq[w] = (freq[w] || 0) + 1;
      });
      const ranked = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 40);
      const matched = [];
      const missing = [];
      ranked.forEach(function (w) {
        if (blob.indexOf(w) >= 0) matched.push(w);
        else missing.push(w);
      });
      const box = document.getElementById("tailorOut");
      box.innerHTML =
        "<strong>Matched keywords (" + matched.length + ")</strong><div style='margin:6px 0 12px'>" +
        matched.slice(0, 25).map(function (w) { return '<span class="chip" style="margin:2px">' + kit.escapeHTML(w) + "</span>"; }).join(" ") +
        "</div><strong>Consider adding (" + missing.length + ")</strong><div style='margin:6px 0'>" +
        missing.slice(0, 20).map(function (w) { return '<span class="chip" style="margin:2px;opacity:.7">' + kit.escapeHTML(w) + "</span>"; }).join(" ") +
        "</div><p class='muted' style='margin-top:8px'>This is a local keyword highlighter — not an AI rewrite. Mirror honest skills only.</p>";
    });
  }

  /* Preview page */
  if (document.getElementById("resumeSheet")) {
    const s = load();
    const empty = document.getElementById("resumeEmpty");
    const sheet = document.getElementById("resumeSheet");
    if (!s.resume || !s.resume.fullName) {
      if (empty) empty.hidden = false;
      if (sheet) sheet.hidden = true;
    } else {
      if (empty) empty.hidden = true;
      if (sheet) {
        sheet.hidden = false;
        sheet.outerHTML = renderSheet(s.resume).replace('class="resume-sheet"', 'id="resumeSheet" class="resume-sheet"');
      }
    }
    document.getElementById("printResume")?.addEventListener("click", function () {
      const st = load();
      st.exports = (st.exports || 0) + 1;
      save(st);
      window.print();
    });
  }

  stats();
})();
