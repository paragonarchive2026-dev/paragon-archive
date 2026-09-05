/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: app.js
  EXPECTED PROJECT PATH: /sites/flashcard-generator/app.js
  ROLE: Paragon Flash local engine — paragonFlashcardGenerator.v1
  RESTORE-LOAD NOTE: Local spaced-ish simple counters only.
*/
(function () {
  "use strict";
  const K = "paragonFlashcardGenerator.v1";
  const kit = window.ParagonSiteKit;
  function def() { return { decks: [], selectedId: null, reviews: 0 }; }
  function load() { return Object.assign(def(), kit.storageGet(K, def())); }
  function save(s) { kit.storageSet(K, s); }

  function stats() {
    const s = load();
    const cards = s.decks.reduce(function (n, d) { return n + (d.cards || []).length; }, 0);
    const set = function (id, v) { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    set("statDecks", s.decks.length);
    set("statCards", cards);
    set("statReviews", s.reviews || 0);
  }

  function parseNotes(text, mode) {
    mode = mode || "basic";
    const cards = [];
    function baseCard(front, back, type) {
      return { id: kit.uid("c"), front: front, back: back || "", type: type || "basic", known: 0, again: 0, easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: null };
    }
    String(text || "").split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean).forEach(function (line) {
      /* explicit cloze already in line */
      if (/\{\{c\d+::/.test(line) || mode === "cloze") {
        var src = line;
        if (mode === "cloze" && !/\{\{c\d+::/.test(src)) {
          /* auto: blank the longest word > 4 chars (skip first) */
          var words = src.split(/(\s+)/);
          var bestI = -1, bestL = 0;
          words.forEach(function (w, i) {
            var clean = w.replace(/[^a-zA-Z0-9]/g, "");
            if (clean.length > bestL && clean.length > 4 && i > 0) { bestL = clean.length; bestI = i; }
          });
          if (bestI >= 0) {
            var w = words[bestI];
            var clean = w.replace(/[^a-zA-Z0-9'-]/g, "");
            words[bestI] = w.replace(clean, "{{c1::" + clean + "}}");
            src = words.join("");
          } else {
            src = "{{c1::" + src + "}}";
          }
        }
        var re = /\{\{c(\d+)::([^}]+)\}\}/g;
        var matches = [];
        var mm;
        while ((mm = re.exec(src))) matches.push({ n: mm[1], term: mm[2], raw: mm[0] });
        if (!matches.length) {
          cards.push(baseCard(src, "(cloze)", "cloze"));
        } else {
          matches.forEach(function (m) {
            var front = src;
            matches.forEach(function (o) {
              if (o.raw === m.raw) front = front.split(o.raw).join("[…]");
              else front = front.split(o.raw).join(o.term);
            });
            cards.push(baseCard(front, m.term, "cloze"));
          });
        }
        return;
      }
      var front = "", back = "";
      if (line.indexOf(":") >= 0) {
        var i = line.indexOf(":");
        front = line.slice(0, i).trim();
        back = line.slice(i + 1).trim();
      } else if (line.indexOf(" — ") >= 0 || line.indexOf(" - ") >= 0) {
        var parts = line.split(/\s+[—\-]\s+/);
        front = (parts[0] || "").trim();
        back = (parts.slice(1).join(" - ") || "").trim();
      } else {
        var sp = line.split(/[.?!]/);
        if (sp.length >= 2 && sp[0].trim().length > 2) {
          front = sp[0].trim() + "?";
          back = sp.slice(1).join(". ").trim() || line;
        } else {
          front = line;
          back = "(add definition)";
        }
      }
      if (front) {
        cards.push(baseCard(front, back, "basic"));
        if (mode === "reverse" && back && back !== "(add definition)") {
          cards.push(baseCard(back, front, "reversed"));
        }
      }
    });
    return cards;
  }

  function listDecks() {
    const box = document.getElementById("deckList");
    if (!box) return;
    const s = load();
    if (!s.decks.length) {
      box.className = "empty";
      box.innerHTML = "<strong>No decks yet</strong>Generate from notes or create an empty deck.";
      return;
    }
    box.className = "list";
    box.innerHTML = s.decks.slice().reverse().map(function (d) {
      const sel = d.id === s.selectedId ? " · selected" : "";
      return '<div class="list-item" data-id="' + kit.escapeHTML(d.id) + '"><div><div class="card-title">' + kit.escapeHTML(d.name) +
        '</div><div class="meta">' + (d.cards || []).length + " cards" + sel + '</div></div>' +
        '<div class="actions"><button type="button" class="btn btn-sm btn-secondary deck-sel">Select</button>' +
        '<button type="button" class="btn btn-sm btn-danger deck-del">Delete</button></div></div>';
    }).join("");
    box.querySelectorAll(".deck-sel").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const s2 = load();
        s2.selectedId = btn.closest(".list-item").dataset.id;
        save(s2); listDecks();
        kit.showPanel(document.getElementById("msg"), "Deck selected for new cards.", "good");
      });
    });
    box.querySelectorAll(".deck-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.closest(".list-item").dataset.id;
        const s2 = load();
        s2.decks = s2.decks.filter(function (d) { return d.id !== id; });
        if (s2.selectedId === id) s2.selectedId = null;
        save(s2); listDecks(); stats(); fillStudySelect();
      });
    });
  }

  function fillStudySelect() {
    const sel = document.getElementById("studyDeck");
    if (!sel) return;
    const s = load();
    sel.innerHTML = s.decks.map(function (d) {
      return '<option value="' + kit.escapeHTML(d.id) + '">' + kit.escapeHTML(d.name) + " (" + (d.cards || []).length + ")</option>";
    }).join("") || '<option value="">No decks</option>';
  }

  let study = { cards: [], i: 0, showBack: false };

  function showFace() {
    const face = document.getElementById("flashFace");
    const meta = document.getElementById("studyMeta");
    if (!face || !study.cards.length) return;
    const c = study.cards[study.i];
    face.textContent = study.showBack ? (c.back || "—") : (c.front || "—");
    meta.textContent = "Card " + (study.i + 1) + " / " + study.cards.length + (study.showBack ? " · back" : " · front");
  }

  /* P-113 — per-site dark/light toggle removed; the Archive nav bar controls all sites. */

  if (document.getElementById("genDeck")) {
    document.getElementById("genDeck").addEventListener("click", function () {
      const name = document.getElementById("deckName").value.trim() || "Untitled deck";
      const mode = (document.getElementById("genMode") && document.getElementById("genMode").value) || "basic";
      const cards = parseNotes(document.getElementById("notesIn").value, mode);
      if (!cards.length) {
        kit.showPanel(document.getElementById("msg"), "Paste some notes first.", "bad");
        return;
      }
      const s = load();
      const deck = { id: kit.uid("deck"), name: name, cards: cards, createdAt: new Date().toISOString() };
      s.decks.push(deck);
      s.selectedId = deck.id;
      save(s);
      listDecks(); stats(); fillStudySelect();
      kit.showPanel(document.getElementById("msg"), "Created deck with " + cards.length + " cards.", "good");
    });
    document.getElementById("saveEmpty").addEventListener("click", function () {
      const name = document.getElementById("deckName").value.trim() || "Untitled deck";
      const s = load();
      const deck = { id: kit.uid("deck"), name: name, cards: [], createdAt: new Date().toISOString() };
      s.decks.push(deck); s.selectedId = deck.id; save(s);
      listDecks(); stats(); fillStudySelect();
      kit.showPanel(document.getElementById("msg"), "Empty deck created.", "good");
    });
    document.getElementById("addCard").addEventListener("click", function () {
      const s = load();
      const deck = s.decks.find(function (d) { return d.id === s.selectedId; }) || s.decks[s.decks.length - 1];
      if (!deck) { kit.showPanel(document.getElementById("msg"), "Create or select a deck first.", "bad"); return; }
      const front = document.getElementById("cardFront").value.trim();
      const back = document.getElementById("cardBack").value.trim();
      if (!front) { kit.showPanel(document.getElementById("msg"), "Front text required.", "bad"); return; }
      deck.cards.push({ id: kit.uid("c"), front: front, back: back, known: 0, again: 0, easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: null });
      s.selectedId = deck.id;
      save(s);
      document.getElementById("cardFront").value = "";
      document.getElementById("cardBack").value = "";
      listDecks(); stats(); fillStudySelect();
      kit.showPanel(document.getElementById("msg"), "Card added to “" + deck.name + "”.", "good");
    });
    listDecks();
    document.getElementById("exportAnki")?.addEventListener("click", function () {
      const s = load();
      const deck = s.decks.find(function (d) { return d.id === s.selectedId; }) || s.decks[s.decks.length - 1];
      if (!deck || !(deck.cards || []).length) { kit.showPanel(document.getElementById("msg"), "Select a deck with cards first.", "bad"); return; }
      const tsv = deck.cards.map(function (c) { return (c.front || "").replace(/\t/g," ") + "\t" + (c.back || "").replace(/\t/g," "); }).join("\n");
      kit.downloadText((deck.name || "deck").replace(/\s+/g,"_") + ".tsv", tsv, "text/tab-separated-values;charset=utf-8");
      kit.showPanel(document.getElementById("msg"), "Anki-friendly TSV downloaded (Import → Tab).", "good");
    });
    document.getElementById("exportJson")?.addEventListener("click", function () {
      const s = load();
      const deck = s.decks.find(function (d) { return d.id === s.selectedId; }) || s.decks[s.decks.length - 1];
      if (!deck) { kit.showPanel(document.getElementById("msg"), "Select a deck first.", "bad"); return; }
      kit.downloadText((deck.name || "deck").replace(/\s+/g, "_") + ".json", JSON.stringify(deck, null, 2), "application/json;charset=utf-8");
      kit.showPanel(document.getElementById("msg"), "JSON deck exported.", "good");
    });
    document.getElementById("genClozeHelp")?.addEventListener("click", function () {
      kit.showPanel(document.getElementById("msg"), "Cloze tip: write “TCP {{c1::guarantees}} ordered delivery” or use Generate mode Cloze to auto-blank a key term per line.", "good");
    });
    document.getElementById("exportGuide")?.addEventListener("click", function () {
      const s = load();
      const deck = s.decks.find(function (d) { return d.id === s.selectedId; }) || s.decks[s.decks.length - 1];
      if (!deck || !(deck.cards || []).length) { kit.showPanel(document.getElementById("msg"), "Select a deck with cards first.", "bad"); return; }
      const text = "# " + deck.name + " — study guide\n\n" + deck.cards.map(function (c, i) {
        return (i+1) + ". " + (c.front || "") + "\n   → " + (c.back || "");
      }).join("\n\n");
      kit.downloadText((deck.name || "guide").replace(/\s+/g,"_") + "-guide.txt", text, "text/plain;charset=utf-8");
      kit.showPanel(document.getElementById("msg"), "Study guide downloaded.", "good");
    });
  }

  function sm2(card, quality) {
    var ef = Number(card.easeFactor) || 2.5;
    var rep = Number(card.repetitions) || 0;
    var interval = Number(card.interval) || 0;
    if (quality < 3) { rep = 0; interval = 0; }
    else {
      if (rep === 0) interval = 1;
      else if (rep === 1) interval = 6;
      else interval = Math.round(interval * ef);
      rep += 1;
      ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (ef < 1.3) ef = 1.3;
    }
    card.easeFactor = ef; card.repetitions = rep; card.interval = interval;
    card.nextReview = new Date(Date.now() + interval * 86400000).toISOString();
  }

  if (document.getElementById("startStudy")) {
    fillStudySelect();
    function begin() {
      const s = load();
      const id = document.getElementById("studyDeck").value;
      const deck = s.decks.find(function (d) { return d.id === id; });
      const empty = document.getElementById("studyEmpty");
      const area = document.getElementById("studyArea");
      if (!deck || !(deck.cards || []).length) {
        empty.hidden = false; area.hidden = true; return;
      }
      empty.hidden = true; area.hidden = false;
      const now = Date.now();
      study.cards = deck.cards.slice().sort(function (a, b) {
        const da = a.nextReview ? Date.parse(a.nextReview) : 0;
        const db = b.nextReview ? Date.parse(b.nextReview) : 0;
        const dueA = !a.nextReview || da <= now;
        const dueB = !b.nextReview || db <= now;
        if (dueA && !dueB) return -1;
        if (!dueA && dueB) return 1;
        return da - db;
      });
      study.i = 0; study.showBack = false;
      showFace();
    }
    document.getElementById("startStudy").addEventListener("click", begin);
    document.getElementById("flipCard").addEventListener("click", function () {
      study.showBack = !study.showBack; showFace();
    });
    document.getElementById("flashFace")?.addEventListener("click", function () {
      study.showBack = !study.showBack; showFace();
    });
    /* sm2 hoisted */
    function grade(known) {
      if (!study.cards.length) return;
      const s = load();
      const id = document.getElementById("studyDeck").value;
      const deck = s.decks.find(function (d) { return d.id === id; });
      const card = study.cards[study.i];
      if (deck) {
        const real = deck.cards.find(function (c) { return c.id === card.id; });
        if (real) {
          if (known) { real.known = (real.known || 0) + 1; sm2(real, 4); }
          else { real.again = (real.again || 0) + 1; sm2(real, 1); }
        }
      }
      s.reviews = (s.reviews || 0) + 1;
      save(s); stats();
      study.i += 1;
      study.showBack = false;
      if (study.i >= study.cards.length) {
        document.getElementById("flashFace").textContent = "Deck complete";
        document.getElementById("studyMeta").textContent = "Session finished · reviews are counted";
        return;
      }
      showFace();
    }
    document.getElementById("knownBtn").addEventListener("click", function () { grade(true); });
    document.getElementById("againBtn").addEventListener("click", function () { grade(false); });
    begin();
  }


  if (document.getElementById("startQuiz")) {
    var quiz = { cards: [], i: 0 };
    function showQuiz() {
      var q = document.getElementById("quizQ");
      var fb = document.getElementById("quizFeedback");
      var ans = document.getElementById("quizAnswer");
      if (!quiz.cards.length) return;
      if (quiz.i >= quiz.cards.length) {
        q.textContent = "Quiz complete";
        fb.textContent = "Finished " + quiz.cards.length + " cards.";
        return;
      }
      var c = quiz.cards[quiz.i];
      q.textContent = c.front || "—";
      if (ans) ans.value = "";
      if (fb) fb.textContent = "Card " + (quiz.i + 1) + " / " + quiz.cards.length;
    }
    document.getElementById("startQuiz").addEventListener("click", function () {
      var s = load();
      var id = document.getElementById("studyDeck").value;
      var deck = s.decks.find(function (d) { return d.id === id; });
      var empty = document.getElementById("studyEmpty");
      var area = document.getElementById("studyArea");
      var qarea = document.getElementById("quizArea");
      if (!deck || !(deck.cards || []).length) {
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;
      if (area) area.hidden = true;
      if (qarea) qarea.hidden = false;
      quiz.cards = deck.cards.slice().sort(function () { return Math.random() - 0.5; });
      quiz.i = 0;
      showQuiz();
    });
    document.getElementById("quizCheck")?.addEventListener("click", function () {
      if (!quiz.cards.length || quiz.i >= quiz.cards.length) return;
      var c = quiz.cards[quiz.i];
      var got = (document.getElementById("quizAnswer").value || "").trim().toLowerCase();
      var want = (c.back || "").trim().toLowerCase();
      var fb = document.getElementById("quizFeedback");
      var ok = got && want && (got === want || want.indexOf(got) >= 0 || got.indexOf(want) >= 0);
      if (fb) fb.innerHTML = ok
        ? "<span style='color:var(--good,#2ecc71)'>Correct</span> — " + kit.escapeHTML(c.back || "")
        : "<span style='color:var(--danger,#e74c3c)'>Not quite</span> — answer: " + kit.escapeHTML(c.back || "");
      var s = load();
      var id = document.getElementById("studyDeck").value;
      var deck = s.decks.find(function (d) { return d.id === id; });
      var real = deck && deck.cards.find(function (x) { return x.id === c.id; });
      if (real) {
        if (ok) { real.known = (real.known || 0) + 1; sm2(real, 4); }
        else { real.again = (real.again || 0) + 1; sm2(real, 1); }
      }
      s.reviews = (s.reviews || 0) + 1;
      save(s); stats();
    });
    document.getElementById("quizNext")?.addEventListener("click", function () {
      quiz.i += 1;
      showQuiz();
    });
  }

  stats();
})();
