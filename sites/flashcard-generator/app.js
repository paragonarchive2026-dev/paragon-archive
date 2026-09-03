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

  function parseNotes(text) {
    const cards = [];
    String(text || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean).forEach(function (line) {
      let front, back;
      if (line.indexOf(":") >= 0) {
        const i = line.indexOf(":");
        front = line.slice(0, i).trim(); back = line.slice(i + 1).trim();
      } else if (line.indexOf("—") >= 0 || line.indexOf(" - ") >= 0) {
        const parts = line.split(/\s+—\s+|\s+-\s+/);
        front = (parts[0] || "").trim(); back = (parts.slice(1).join(" - ") || "").trim();
      } else {
        // sentence split heuristic
        const parts = line.split(/[.?!]/);
        if (parts.length >= 2 && parts[0].trim().length > 2) {
          front = parts[0].trim() + "?";
          back = parts.slice(1).join(". ").trim() || line;
        } else {
          front = line;
          back = "(add definition)";
        }
      }
      if (front) cards.push({ id: kit.uid("c"), front: front, back: back || "", known: 0, again: 0, easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: null });
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

  document.getElementById("themeToggle")?.addEventListener("click", kit.toggleTheme);

  if (document.getElementById("genDeck")) {
    document.getElementById("genDeck").addEventListener("click", function () {
      const name = document.getElementById("deckName").value.trim() || "Untitled deck";
      const cards = parseNotes(document.getElementById("notesIn").value);
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
      study.cards = deck.cards.slice().sort(function () { return Math.random() - 0.5; });
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
    function sm2(card, quality) {
      /* quality 0 again, 4 known — simplified SM-2 */
      var ef = Number(card.easeFactor) || 2.5;
      var rep = Number(card.repetitions) || 0;
      var interval = Number(card.interval) || 0;
      if (quality < 3) {
        rep = 0; interval = 0;
      } else {
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

  stats();
})();
