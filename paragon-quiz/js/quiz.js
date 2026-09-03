/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: quiz.js
  EXPECTED PROJECT PATH: /paragon-quiz/js/quiz.js
  ROLE: THE single consolidated Paragon Quiz controller (P-073 file-count reduction) — shared engine + all page modules (home, explore, create, play, results), each self-guarded by its page's key element so one file safely serves every quiz page.
  RESTORE/LOAD NOTE: Load as the only script on every /paragon-quiz/*.html page. Replaces the former js/app.js, explore.js, create.js, play.js, results.js (their code lives here unchanged, wrapped in presence guards).
*/

/* ============ SHARED ENGINE (former app.js) ============ */
(function () {
  "use strict";

  var STORE_KEYS = {
    quizzes: "paragonQuiz.quizzes.v1",
    results: "paragonQuiz.results.v1",
    best: "paragonQuiz.bestScores.v1"
  };

  var CATEGORIES = {
    science:       { label: "Science",           icon: "🔬" },
    history:       { label: "History",           icon: "📜" },
    geography:     { label: "Geography",         icon: "🌍" },
    math:          { label: "Mathematics",       icon: "🔢" },
    language:      { label: "Language",          icon: "📝" },
    technology:    { label: "Technology",        icon: "💻" },
    sports:        { label: "Sports",            icon: "⚽" },
    entertainment: { label: "Entertainment",     icon: "🎬" },
    general:       { label: "General Knowledge", icon: "🧠" },
    other:         { label: "Other",             icon: "📦" }
  };

  var DIFFICULTY = {
    easy:   { label: "Easy",   icon: "🟢" },
    medium: { label: "Medium", icon: "🟡" },
    hard:   { label: "Hard",   icon: "🔴" }
  };

  /*
    Starter quizzes are genuinely authored by the Paragon Team — they are real content,
    not fake community submissions. Their play counts and ratings start at zero and only
    move through real player actions.
  */
  var STARTER_QUIZZES = [
    {
      id: "starter-world-capitals",
      title: "World Capitals Challenge",
      description: "Ten capital cities from every corner of the planet. Can you place them all?",
      category: "geography",
      difficulty: "medium",
      timer: 20,
      author: "Paragon Team",
      builtIn: true,
      createdAt: "2026-08-17T12:00:00+01:00",
      questions: [
        { text: "What is the capital of Nigeria?", options: ["Lagos", "Abuja", "Kano", "Ibadan"], correct: 1 },
        { text: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
        { text: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], correct: 3 },
        { text: "What is the capital of Brazil?", options: ["Rio de Janeiro", "Brasília", "São Paulo", "Salvador"], correct: 1 },
        { text: "What is the capital of Japan?", options: ["Osaka", "Kyoto", "Tokyo", "Nagoya"], correct: 2 },
        { text: "What is the capital of Egypt?", options: ["Cairo", "Alexandria", "Giza", "Luxor"], correct: 0 },
        { text: "What is the capital of Turkey?", options: ["Istanbul", "Izmir", "Ankara", "Bursa"], correct: 2 },
        { text: "What is the capital of Switzerland?", options: ["Zurich", "Geneva", "Bern", "Basel"], correct: 2 },
        { text: "What is the capital of Kenya?", options: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"], correct: 1 },
        { text: "What is the capital of South Korea?", options: ["Busan", "Incheon", "Seoul", "Daegu"], correct: 2 }
      ]
    },
    {
      id: "starter-science-basics",
      title: "Science Essentials",
      description: "Fundamental science facts everyone should know — physics, biology, and chemistry basics.",
      category: "science",
      difficulty: "easy",
      timer: 30,
      author: "Paragon Team",
      builtIn: true,
      createdAt: "2026-08-17T12:05:00+01:00",
      questions: [
        { text: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Earth"], correct: 1 },
        { text: "What gas do plants absorb from the air?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2 },
        { text: "What is H2O commonly known as?", options: ["Salt", "Water", "Sugar", "Acid"], correct: 1 },
        { text: "How many bones does an adult human body have?", options: ["106", "206", "306", "156"], correct: 1 },
        { text: "What force pulls objects toward the Earth?", options: ["Magnetism", "Friction", "Gravity", "Inertia"], correct: 2 },
        { text: "Which organ pumps blood around the body?", options: ["Lungs", "Brain", "Liver", "Heart"], correct: 3 },
        { text: "What is the closest star to Earth?", options: ["Polaris", "The Sun", "Sirius", "Alpha Centauri"], correct: 1 },
        { text: "What do bees collect from flowers?", options: ["Water", "Nectar", "Seeds", "Leaves"], correct: 1 }
      ]
    },
    {
      id: "starter-tech-trivia",
      title: "Tech & Web Trivia",
      description: "From the birth of the web to the tools we use daily — test your technology knowledge.",
      category: "technology",
      difficulty: "medium",
      timer: 30,
      author: "Paragon Team",
      builtIn: true,
      createdAt: "2026-08-17T12:10:00+01:00",
      questions: [
        { text: "What does HTML stand for?", options: ["HyperText Markup Language", "HighText Machine Language", "HyperTransfer Markup Language", "HomeTool Markup Language"], correct: 0 },
        { text: "Who is credited with inventing the World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Alan Turing"], correct: 2 },
        { text: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], correct: 0 },
        { text: "Which of these is NOT a programming language?", options: ["Python", "Java", "Cobra", "Photoshop"], correct: 3 },
        { text: "What does 'www' stand for in a website address?", options: ["World Wide Web", "Web World Wide", "Wide Web World", "World Web Wide"], correct: 0 },
        { text: "Roughly how many bytes are in one kilobyte?", options: ["100", "1,000", "10,000", "1,000,000"], correct: 1 },
        { text: "Which company developed the Android operating system first?", options: ["Google", "Samsung", "Android Inc.", "Microsoft"], correct: 2 }
      ]
    }
  ];

  function readStore(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) { return fallback; }
  }

  function writeStore(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* storage may be blocked */ }
  }

  function getUserQuizzes() {
    var list = readStore(STORE_KEYS.quizzes, []);
    return Array.isArray(list) ? list : [];
  }

  function getAllQuizzes() {
    return STARTER_QUIZZES.concat(getUserQuizzes());
  }

  function getQuizById(id) {
    var match = null;
    getAllQuizzes().forEach(function (quiz) { if (quiz.id === id) match = quiz; });
    return match;
  }

  function saveQuiz(quiz) {
    var list = getUserQuizzes();
    list.push(quiz);
    writeStore(STORE_KEYS.quizzes, list);
    return quiz;
  }

  function deleteQuiz(id) {
    writeStore(STORE_KEYS.quizzes, getUserQuizzes().filter(function (quiz) { return quiz.id !== id; }));
  }

  function getResults() {
    var list = readStore(STORE_KEYS.results, []);
    return Array.isArray(list) ? list : [];
  }

  function saveResult(result) {
    var list = getResults();
    list.push(result);
    if (list.length > 200) list = list.slice(list.length - 200);
    writeStore(STORE_KEYS.results, list);
    var best = readStore(STORE_KEYS.best, {});
    var previous = best[result.quizId];
    if (!previous || result.score > previous.score) {
      best[result.quizId] = { score: result.score, total: result.total, at: result.finishedAt };
      writeStore(STORE_KEYS.best, best);
    }
    return result;
  }

  function getResultById(id) {
    var match = null;
    getResults().forEach(function (entry) { if (entry.id === id) match = entry; });
    return match;
  }

  function getBestScore(quizId) {
    var best = readStore(STORE_KEYS.best, {});
    return best[quizId] || null;
  }

  function playCount(quizId) {
    return getResults().filter(function (entry) { return entry.quizId === quizId; }).length;
  }

  function averagePercent(quizId) {
    var plays = getResults().filter(function (entry) { return entry.quizId === quizId; });
    if (!plays.length) return null;
    var sum = 0;
    plays.forEach(function (entry) { sum += entry.total ? entry.score / entry.total : 0; });
    return Math.round((sum / plays.length) * 100);
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function categoryInfo(key) { return CATEGORIES[key] || CATEGORIES.other; }
  function difficultyInfo(key) { return DIFFICULTY[key] || DIFFICULTY.medium; }

  function quizCardMarkup(quiz) {
    var cat = categoryInfo(quiz.category);
    var diff = difficultyInfo(quiz.difficulty);
    var plays = playCount(quiz.id);
    var avg = averagePercent(quiz.id);
    return '' +
      '<a class="quiz-card" href="play.html?id=' + encodeURIComponent(quiz.id) + '">' +
        '<div class="quiz-card-top">' +
          '<span class="quiz-card-icon">' + cat.icon + '</span>' +
          '<span class="quiz-card-diff diff-' + escapeHTML(quiz.difficulty) + '">' + diff.icon + " " + diff.label + '</span>' +
        '</div>' +
        '<h3 class="quiz-card-title">' + escapeHTML(quiz.title) + '</h3>' +
        '<p class="quiz-card-desc">' + escapeHTML(quiz.description) + '</p>' +
        '<div class="quiz-card-meta">' +
          '<span>' + cat.label + '</span>' +
          '<span>' + quiz.questions.length + ' questions</span>' +
          '<span>' + (Number(quiz.timer) ? Number(quiz.timer) + "s/question" : "No timer") + '</span>' +
        '</div>' +
        '<div class="quiz-card-foot">' +
          '<span class="quiz-card-author">by ' + escapeHTML(quiz.author || "Anonymous") + (quiz.builtIn ? ' <em class="starter-chip">Starter</em>' : "") + '</span>' +
          '<span class="quiz-card-plays">▶ ' + plays + ' play' + (plays === 1 ? "" : "s") + (avg === null ? "" : " · avg " + avg + "%") + '</span>' +
        '</div>' +
        '<span class="quiz-card-cta">🎮 Play now</span>' +
      '</a>';
  }

  function animateNumber(element, target) {
    if (!element) return;
    var value = Number(target) || 0;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || value === 0) { element.textContent = String(value); return; }
    var started = performance.now();
    var duration = 800;
    function tick(now) {
      var ratio = Math.min(1, (now - started) / duration);
      element.textContent = String(Math.round(value * (1 - Math.pow(1 - ratio, 3))));
      if (ratio < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- Home page loaders (called from index.html) ---- */

  window.loadHomeStats = function () {
    var quizzes = getAllQuizzes();
    var questions = 0;
    quizzes.forEach(function (quiz) { questions += quiz.questions.length; });
    animateNumber(document.getElementById("totalQuizzes"), quizzes.length);
    animateNumber(document.getElementById("totalPlays"), getResults().length);
    animateNumber(document.getElementById("totalQuestions"), questions);
  };

  window.loadFeaturedQuizzes = function () {
    var grid = document.getElementById("featuredGrid");
    if (!grid) return;
    var quizzes = getAllQuizzes().slice().sort(function (a, b) {
      return playCount(b.id) - playCount(a.id) || Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0);
    }).slice(0, 6);
    grid.innerHTML = quizzes.map(quizCardMarkup).join("");
  };

  window.loadCategories = function () {
    var grid = document.getElementById("categoryGrid");
    if (!grid) return;
    var counts = {};
    getAllQuizzes().forEach(function (quiz) {
      counts[quiz.category] = (counts[quiz.category] || 0) + 1;
    });
    grid.innerHTML = Object.keys(CATEGORIES).map(function (key) {
      var count = counts[key] || 0;
      return '<a class="category-card" href="explore.html?category=' + key + '">' +
        '<span class="category-icon">' + CATEGORIES[key].icon + '</span>' +
        '<span class="category-name">' + CATEGORIES[key].label + '</span>' +
        '<span class="category-count">' + count + ' quiz' + (count === 1 ? "" : "zes") + '</span>' +
      '</a>';
    }).join("");
  };

  window.ParagonQuiz = {
    CATEGORIES: CATEGORIES,
    DIFFICULTY: DIFFICULTY,
    STARTER_QUIZZES: STARTER_QUIZZES,
    getAllQuizzes: getAllQuizzes,
    getUserQuizzes: getUserQuizzes,
    getQuizById: getQuizById,
    saveQuiz: saveQuiz,
    deleteQuiz: deleteQuiz,
    getResults: getResults,
    saveResult: saveResult,
    getResultById: getResultById,
    getBestScore: getBestScore,
    playCount: playCount,
    averagePercent: averagePercent,
    quizCardMarkup: quizCardMarkup,
    categoryInfo: categoryInfo,
    difficultyInfo: difficultyInfo,
    escapeHTML: escapeHTML,
    animateNumber: animateNumber
  };
})();

/* ============ PAGE MODULE: create (guarded by #questionsContainer) ============ */
if (document.getElementById("questionsContainer")) {
(function () {
  "use strict";
  var PQ = window.ParagonQuiz;
  var questionsContainer = document.getElementById("questionsContainer");
  var questionCounter = document.getElementById("questionCounter");
  var publishedQuizId = null;
  var questionSeq = 0;

  function bindCounter(inputId, counterId) {
    var input = document.getElementById(inputId);
    var counter = document.getElementById(counterId);
    if (!input || !counter) return;
    input.addEventListener("input", function () { counter.textContent = String(input.value.length); });
  }

  function updateQuestionCounter() {
    var count = questionsContainer.querySelectorAll(".question-block").length;
    questionCounter.textContent = count + " question" + (count === 1 ? "" : "s") + " added";
  }

  function addQuestionBlock() {
    questionSeq += 1;
    var blockId = "q" + questionSeq;
    var block = document.createElement("div");
    block.className = "question-block";
    block.dataset.blockId = blockId;
    block.innerHTML =
      '<div class="question-block-head">' +
        '<strong class="question-block-title">Question</strong>' +
        '<button type="button" class="question-remove" aria-label="Remove this question">🗑 Remove</button>' +
      '</div>' +
      '<div class="form-group">' +
        '<input type="text" class="form-input question-text-input" placeholder="Type the question…" maxlength="200">' +
      '</div>' +
      '<div class="option-rows">' +
        [0, 1, 2, 3].map(function (index) {
          return '<label class="option-row">' +
            '<input type="radio" name="correct-' + blockId + '" value="' + index + '"' + (index === 0 ? " checked" : "") + ' aria-label="Mark option ' + (index + 1) + ' as correct">' +
            '<input type="text" class="form-input option-input" placeholder="Option ' + (index + 1) + (index < 2 ? " (required)" : " (optional)") + '" maxlength="120">' +
          '</label>';
        }).join("") +
      '</div>' +
      '<p class="option-hint">Select the radio next to the correct answer. At least two options are required.</p>';
    block.querySelector(".question-remove").addEventListener("click", function () {
      block.remove();
      renumberQuestions();
      updateQuestionCounter();
    });
    questionsContainer.appendChild(block);
    renumberQuestions();
    updateQuestionCounter();
    block.querySelector(".question-text-input").focus();
  }

  function renumberQuestions() {
    questionsContainer.querySelectorAll(".question-block").forEach(function (block, index) {
      block.querySelector(".question-block-title").textContent = "Question " + (index + 1);
    });
  }

  function collectQuiz() {
    var errors = [];
    var title = document.getElementById("quizTitle").value.trim();
    var description = document.getElementById("quizDescription").value.trim();
    var category = document.getElementById("quizCategory").value;
    var difficulty = document.getElementById("quizDifficulty").value;
    var timer = Number(document.getElementById("quizTimer").value) || 0;
    if (!title) errors.push("Add a quiz title.");
    if (!description) errors.push("Add a description.");
    if (!category) errors.push("Select a category.");
    if (!difficulty) errors.push("Select a difficulty.");

    var questions = [];
    questionsContainer.querySelectorAll(".question-block").forEach(function (block, index) {
      var text = block.querySelector(".question-text-input").value.trim();
      var options = [];
      block.querySelectorAll(".option-input").forEach(function (input) {
        var value = input.value.trim();
        if (value) options.push(value);
      });
      var checked = block.querySelector('input[type="radio"]:checked');
      var correctIndex = checked ? Number(checked.value) : 0;
      if (!text && !options.length) return; // fully empty block is ignored
      if (!text) errors.push("Question " + (index + 1) + " needs its question text.");
      if (options.length < 2) errors.push("Question " + (index + 1) + " needs at least two options.");
      var correctValue = block.querySelectorAll(".option-input")[correctIndex] ? block.querySelectorAll(".option-input")[correctIndex].value.trim() : "";
      if (!correctValue) errors.push("Question " + (index + 1) + ": the option marked correct is empty.");
      var mappedCorrect = options.indexOf(correctValue);
      questions.push({ text: text, options: options, correct: mappedCorrect === -1 ? 0 : mappedCorrect });
    });
    if (questions.length < 3) errors.push("You need at least 3 complete questions to publish.");

    return {
      errors: errors,
      quiz: {
        id: "user-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
        title: title, description: description, category: category, difficulty: difficulty,
        timer: timer, author: "You", builtIn: false,
        createdAt: new Date().toISOString(), questions: questions
      }
    };
  }

  function showErrors(errors) {
    // P-066: inline error panel — alert boxes are not part of the product.
    var existing = document.getElementById("createErrors");
    if (existing) existing.remove();
    var panel = document.createElement("div");
    panel.id = "createErrors";
    panel.className = "form-errors";
    panel.innerHTML = "<strong>Almost there — fix these first:</strong><ul>" + errors.map(function (error) { return "<li>" + PQ.escapeHTML(error) + "</li>"; }).join("") + "</ul>";
    var actions = document.querySelector(".form-actions");
    actions.parentNode.insertBefore(panel, actions);
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function clearErrors() {
    var existing = document.getElementById("createErrors");
    if (existing) existing.remove();
  }

  function openPreview() {
    var collected = collectQuiz();
    var content = document.getElementById("previewContent");
    var quiz = collected.quiz;
    var cat = PQ.categoryInfo(quiz.category || "other");
    var diff = PQ.difficultyInfo(quiz.difficulty || "medium");
    content.innerHTML =
      '<div class="preview-head">' +
        '<h3>' + PQ.escapeHTML(quiz.title || "Untitled quiz") + '</h3>' +
        '<p>' + PQ.escapeHTML(quiz.description || "No description yet.") + '</p>' +
        '<div class="quiz-card-meta"><span>' + cat.icon + " " + cat.label + '</span><span>' + diff.icon + " " + diff.label + '</span><span>' + (quiz.timer ? quiz.timer + "s/question" : "No timer") + '</span><span>' + quiz.questions.length + ' questions</span></div>' +
      '</div>' +
      (collected.errors.length
        ? '<div class="preview-errors"><strong>Before you can publish:</strong><ul>' + collected.errors.map(function (error) { return "<li>" + PQ.escapeHTML(error) + "</li>"; }).join("") + '</ul></div>'
        : "") +
      quiz.questions.map(function (question, index) {
        return '<div class="preview-question">' +
          '<strong>' + (index + 1) + ". " + PQ.escapeHTML(question.text) + '</strong>' +
          '<div class="preview-options">' + question.options.map(function (option, optionIndex) {
            return '<span class="preview-option' + (optionIndex === question.correct ? " correct" : "") + '">' + PQ.escapeHTML(option) + (optionIndex === question.correct ? " ✓" : "") + '</span>';
          }).join("") + '</div>' +
        '</div>';
      }).join("");
    document.getElementById("previewModal").style.display = "flex";
  }

  function closePreview() {
    document.getElementById("previewModal").style.display = "none";
  }

  function publish() {
    var collected = collectQuiz();
    if (collected.errors.length) { showErrors(collected.errors); return; }
    clearErrors();
    PQ.saveQuiz(collected.quiz);
    publishedQuizId = collected.quiz.id;
    closePreview();
    document.getElementById("successModal").style.display = "flex";
  }

  document.getElementById("addQuestionBtn").addEventListener("click", addQuestionBlock);
  document.getElementById("previewBtn").addEventListener("click", openPreview);
  document.getElementById("closePreview").addEventListener("click", closePreview);
  document.getElementById("closePreviewBtn").addEventListener("click", closePreview);
  document.getElementById("publishBtn").addEventListener("click", publish);
  document.getElementById("publishFromPreview").addEventListener("click", publish);
  document.getElementById("playNewQuiz").addEventListener("click", function () {
    if (publishedQuizId) window.location.href = "play.html?id=" + encodeURIComponent(publishedQuizId);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closePreview();
  });
  bindCounter("quizTitle", "titleCount");
  bindCounter("quizDescription", "descCount");

  // Start creators off with one empty question block.
  addQuestionBlock();
})();

}

/* ============ PAGE MODULE: explore (guarded by #exploreGrid) ============ */
if (document.getElementById("exploreGrid")) {
(function () {
  "use strict";
  var PQ = window.ParagonQuiz;

  var searchInput = document.getElementById("searchInput");
  var categoryFilter = document.getElementById("categoryFilter");
  var difficultyFilter = document.getElementById("difficultyFilter");
  var sortFilter = document.getElementById("sortFilter");
  var grid = document.getElementById("exploreGrid");
  var emptyState = document.getElementById("emptyState");
  var resultsCount = document.getElementById("resultsCount");

  function populateCategoryFilter() {
    Object.keys(PQ.CATEGORIES).forEach(function (key) {
      var option = document.createElement("option");
      option.value = key;
      option.textContent = PQ.CATEGORIES[key].icon + " " + PQ.CATEGORIES[key].label;
      categoryFilter.appendChild(option);
    });
    var preset = new URLSearchParams(window.location.search).get("category");
    if (preset && PQ.CATEGORIES[preset]) categoryFilter.value = preset;
  }

  function filteredQuizzes() {
    var term = (searchInput.value || "").trim().toLowerCase();
    var category = categoryFilter.value;
    var difficulty = difficultyFilter.value;
    var list = PQ.getAllQuizzes().filter(function (quiz) {
      if (category !== "all" && quiz.category !== category) return false;
      if (difficulty !== "all" && quiz.difficulty !== difficulty) return false;
      if (!term) return true;
      var haystack = (quiz.title + " " + quiz.description + " " + PQ.categoryInfo(quiz.category).label + " " + (quiz.author || "")).toLowerCase();
      return haystack.indexOf(term) !== -1;
    });
    var sort = sortFilter.value;
    list.sort(function (a, b) {
      if (sort === "oldest") return Date.parse(a.createdAt || 0) - Date.parse(b.createdAt || 0);
      if (sort === "popular") return PQ.playCount(b.id) - PQ.playCount(a.id) || Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0);
      if (sort === "highest") return (PQ.averagePercent(b.id) || 0) - (PQ.averagePercent(a.id) || 0) || PQ.playCount(b.id) - PQ.playCount(a.id);
      return Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0); // newest
    });
    return list;
  }

  function render() {
    var list = filteredQuizzes();
    resultsCount.textContent = "Showing " + list.length + " quiz" + (list.length === 1 ? "" : "zes");
    grid.innerHTML = list.map(PQ.quizCardMarkup).join("");
    emptyState.style.display = list.length ? "none" : "block";
  }

  populateCategoryFilter();
  render();
  searchInput.addEventListener("input", render);
  categoryFilter.addEventListener("change", render);
  difficultyFilter.addEventListener("change", render);
  sortFilter.addEventListener("change", render);
})();

}

/* ============ PAGE MODULE: play (guarded by #startScreen) ============ */
if (document.getElementById("startScreen")) {
(function () {
  "use strict";
  var PQ = window.ParagonQuiz;
  var quizId = new URLSearchParams(window.location.search).get("id") || "";
  var quiz = PQ.getQuizById(quizId);

  function el(id) { return document.getElementById(id); }
  function show(id) { el(id).style.display = ""; }
  function hide(id) { el(id).style.display = "none"; }

  if (!quiz) {
    hide("startScreen");
    show("notFoundScreen");
    return;
  }

  var current = 0;
  var correct = 0, wrong = 0, skipped = 0;
  var answers = [];
  var locked = false;
  var timerHandle = null;
  var timeLeft = 0;
  var startedAt = 0;
  var TIMER_CIRCUMFERENCE = 2 * Math.PI * 45;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Start screen (real data) ---- */
  var cat = PQ.categoryInfo(quiz.category);
  var diff = PQ.difficultyInfo(quiz.difficulty);
  document.title = quiz.title + " — Paragon Quiz";
  el("playCategory").textContent = cat.icon + " " + cat.label;
  el("playTitle").textContent = quiz.title;
  el("playDescription").textContent = quiz.description;
  el("playQuestionCount").textContent = String(quiz.questions.length);
  el("playDifficulty").textContent = diff.label;
  el("playCount").textContent = String(PQ.playCount(quiz.id));
  if (Number(quiz.timer)) el("playTimeLimit").textContent = String(quiz.timer);
  else el("playTimeWrap").innerHTML = '<span class="meta-icon">⏱️</span> No time limit';
  var best = PQ.getBestScore(quiz.id);
  if (best) {
    el("playBest").style.display = "";
    el("playBest").textContent = "🏆 Your best: " + best.score + "/" + best.total + " (" + Math.round((best.score / best.total) * 100) + "%) — beat it!";
  }

  /* ---- Timer ring ---- */
  function paintTimer(left, limit) {
    el("timerNumber").textContent = String(Math.max(0, left));
    var circle = el("timerCircle");
    var ratio = limit ? Math.max(0, left) / limit : 1;
    circle.style.strokeDasharray = TIMER_CIRCUMFERENCE;
    circle.style.strokeDashoffset = String(TIMER_CIRCUMFERENCE * (1 - ratio));
    circle.classList.toggle("urgent", left <= Math.max(3, Math.round(limit * 0.2)));
  }

  function startTimer() {
    stopTimer();
    var limit = Number(quiz.timer) || 0;
    if (!limit) { el("timerContainer").style.display = "none"; return; }
    el("timerContainer").style.display = "";
    timeLeft = limit;
    paintTimer(limit, limit);
    timerHandle = window.setInterval(function () {
      timeLeft -= 1;
      paintTimer(timeLeft, limit);
      if (timeLeft <= 0) { stopTimer(); answerChosen(-1); }
    }, 1000);
  }
  function stopTimer() {
    if (timerHandle) { window.clearInterval(timerHandle); timerHandle = null; }
  }

  /* ---- Question flow ---- */
  function renderQuestion() {
    locked = false;
    hide("feedbackContainer");
    var question = quiz.questions[current];
    el("currentQuestion").textContent = String(current + 1);
    el("totalQuestions").textContent = String(quiz.questions.length);
    el("progressFill").style.width = ((current / quiz.questions.length) * 100) + "%";
    el("questionText").textContent = question.text;
    el("optionsContainer").innerHTML = question.options.map(function (option, index) {
      return '<button type="button" class="option-btn" data-index="' + index + '">' +
        '<span class="option-letter">' + String.fromCharCode(65 + index) + '</span>' +
        '<span class="option-text">' + PQ.escapeHTML(option) + '</span>' +
      '</button>';
    }).join("");
    el("optionsContainer").querySelectorAll(".option-btn").forEach(function (button) {
      button.addEventListener("click", function () { answerChosen(Number(button.dataset.index)); });
    });
    startTimer();
  }

  function answerChosen(index) {
    if (locked) return;
    locked = true;
    stopTimer();
    var question = quiz.questions[current];
    var isCorrect = index === question.correct;
    var timedOut = index === -1;
    if (isCorrect) correct += 1;
    else if (timedOut) skipped += 1;
    else wrong += 1;
    answers.push({ chosen: index, correct: question.correct, timedOut: timedOut });

    el("optionsContainer").querySelectorAll(".option-btn").forEach(function (button) {
      var buttonIndex = Number(button.dataset.index);
      button.disabled = true;
      if (buttonIndex === question.correct) button.classList.add("correct");
      else if (buttonIndex === index) button.classList.add("wrong");
      else button.classList.add("dimmed");
    });

    el("feedbackIcon").textContent = isCorrect ? "✅" : timedOut ? "⏰" : "❌";
    el("feedbackText").textContent = isCorrect ? "Correct!" : timedOut ? "Time's up!" : "Not quite!";
    el("feedbackText").className = "feedback-text " + (isCorrect ? "good" : "bad");
    el("correctAnswer").textContent = isCorrect ? "" : "Correct answer: " + question.options[question.correct];
    el("nextBtn").textContent = current === quiz.questions.length - 1 ? "See Results 🏁" : "Next Question →";
    show("feedbackContainer");
    el("nextBtn").focus();
  }

  function finishQuiz() {
    el("progressFill").style.width = "100%";
    var total = quiz.questions.length;
    var percent = total ? Math.round((correct / total) * 100) : 0;
    var seconds = Math.round((Date.now() - startedAt) / 1000);

    PQ.saveResult({
      id: "r-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
      quizId: quiz.id, quizTitle: quiz.title,
      score: correct, total: total, answers: answers,
      wrong: wrong, skipped: skipped, seconds: seconds,
      finishedAt: new Date().toISOString()
    });

    hide("playScreen");
    show("completeScreen");
    var verdict = percent === 100 ? ["🏆", "Perfect Score!", "Flawless — every single answer right. You own this topic."]
      : percent >= 80 ? ["🌟", "Outstanding!", "Excellent knowledge. A whisker away from perfection."]
      : percent >= 60 ? ["💪", "Well Played!", "Solid result — one more run could push you to the top."]
      : percent >= 40 ? ["📚", "Getting There!", "Good effort. Review the answers and go again."]
      : ["🌱", "Room to Grow!", "Every expert started somewhere. Check the review and retry."];
    el("completeIcon").textContent = verdict[0];
    el("completeTitle").textContent = verdict[1];
    el("completeMessage").textContent = verdict[2];
    el("correctCount").textContent = String(correct);
    el("wrongCount").textContent = String(wrong);
    el("skippedCount").textContent = String(skipped);
    el("totalTime").textContent = seconds >= 60 ? Math.floor(seconds / 60) + "m " + (seconds % 60) + "s" : seconds + "s";

    var newBest = PQ.getBestScore(quiz.id);
    el("completeBest").textContent = newBest && newBest.score === correct && percent > 0
      ? "🎉 New personal best!"
      : newBest ? "🏆 Your best on this quiz: " + newBest.score + "/" + newBest.total : "";

    var circle = el("scoreCircle");
    var circumference = 2 * Math.PI * 54;
    circle.style.strokeDasharray = circumference;
    if (reduced) {
      circle.style.strokeDashoffset = String(circumference * (1 - percent / 100));
      el("scoreNumber").textContent = String(percent);
    } else {
      circle.style.strokeDashoffset = String(circumference);
      var started = performance.now();
      var duration = 1100;
      (function tick(now) {
        var ratio = Math.min(1, ((now || performance.now()) - started) / duration);
        var eased = 1 - Math.pow(1 - ratio, 3);
        circle.style.strokeDashoffset = String(circumference * (1 - (percent / 100) * eased));
        el("scoreNumber").textContent = String(Math.round(percent * eased));
        if (ratio < 1) requestAnimationFrame(tick);
      })(performance.now());
    }
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  /* ---- Review modal ---- */
  function openReview() {
    el("reviewContent").innerHTML = quiz.questions.map(function (question, index) {
      var answer = answers[index] || { chosen: -1, timedOut: false };
      var isCorrect = answer.chosen === question.correct;
      var chosenText = answer.chosen === -1 ? (answer.timedOut ? "⏰ Time ran out" : "No answer") : question.options[answer.chosen];
      return '<div class="review-item ' + (isCorrect ? "good" : "bad") + '">' +
        '<div class="review-q"><span class="review-mark">' + (isCorrect ? "✅" : "❌") + '</span><strong>' + (index + 1) + ". " + PQ.escapeHTML(question.text) + '</strong></div>' +
        '<div class="review-a">' + (isCorrect
          ? 'You answered: <b class="good-text">' + PQ.escapeHTML(chosenText) + '</b>'
          : 'You answered: <b class="bad-text">' + PQ.escapeHTML(chosenText) + '</b> · Correct: <b class="good-text">' + PQ.escapeHTML(question.options[question.correct]) + '</b>') + '</div>' +
      '</div>';
    }).join("");
    el("reviewModal").style.display = "flex";
  }
  function closeReview() { el("reviewModal").style.display = "none"; }
  function retry() { window.location.reload(); }

  /* ---- Bindings ---- */
  el("startQuizBtn").addEventListener("click", function () {
    hide("startScreen");
    show("playScreen");
    startedAt = Date.now();
    renderQuestion();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });
  el("nextBtn").addEventListener("click", function () {
    if (!locked) return;
    current += 1;
    if (current >= quiz.questions.length) finishQuiz();
    else renderQuestion();
  });
  el("retryBtn").addEventListener("click", retry);
  el("retryFromReview").addEventListener("click", retry);
  el("reviewBtn").addEventListener("click", openReview);
  el("closeReview").addEventListener("click", closeReview);
  el("closeReviewBtn").addEventListener("click", closeReview);
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeReview(); });
})();

}

/* ============ PAGE MODULE: results (guarded by #resultsStage) ============ */
if (document.getElementById("resultsStage")) {
(function () {
  "use strict";
  var PQ = window.ParagonQuiz;
  var sessionId = new URLSearchParams(window.location.search).get("session") || "";
  var result = PQ.getResultById(sessionId);
  var stage = document.getElementById("resultsStage");
  var notFound = document.getElementById("resultsNotFound");

  if (!result) {
    stage.style.display = "none";
    notFound.style.display = "block";
    return;
  }

  var quiz = PQ.getQuizById(result.quizId);
  var percent = result.total ? Math.round((result.score / result.total) * 100) : 0;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function verdict() {
    if (percent === 100) return { icon: "🏆", title: "Perfect score!", message: "Flawless. Every single answer right — you own this topic." };
    if (percent >= 80) return { icon: "🌟", title: "Outstanding!", message: "Excellent knowledge. Just a whisker away from perfection." };
    if (percent >= 60) return { icon: "💪", title: "Well played!", message: "Solid result. A retry could push you into the top tier." };
    if (percent >= 40) return { icon: "📚", title: "Getting there!", message: "Good effort — review the answers below and go again." };
    return { icon: "🌱", title: "Room to grow!", message: "Every expert started somewhere. Check the review and try again." };
  }

  var view = verdict();
  document.getElementById("resultsVerdict").textContent = view.icon;
  document.getElementById("resultsTitle").textContent = view.title;
  document.getElementById("resultsQuizName").textContent = result.quizTitle + (quiz ? " · " + PQ.categoryInfo(quiz.category).label : "");
  document.getElementById("resultsMessage").textContent = view.message;
  document.getElementById("scoreBig").textContent = result.score + "/" + result.total;

  /* Score ring + percent count-up */
  var ring = document.getElementById("scoreRingValue");
  var percentLabel = document.getElementById("scorePercent");
  if (reduced) {
    ring.style.strokeDasharray = percent + " 100";
    percentLabel.textContent = percent + "%";
  } else {
    ring.style.strokeDasharray = "0 100";
    var started = performance.now();
    var duration = 1000;
    function tick(now) {
      var ratio = Math.min(1, (now - started) / duration);
      var eased = 1 - Math.pow(1 - ratio, 3);
      ring.style.strokeDasharray = (percent * eased).toFixed(1) + " 100";
      percentLabel.textContent = Math.round(percent * eased) + "%";
      if (ratio < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* Best score */
  var best = PQ.getBestScore(result.quizId);
  var bestBox = document.getElementById("resultsBest");
  if (best) {
    var isNewBest = best.at === result.finishedAt && best.score === result.score;
    bestBox.innerHTML = isNewBest
      ? '<span class="best-chip new">🎉 New personal best!</span>'
      : '<span class="best-chip">🏆 Your best on this quiz: ' + best.score + "/" + best.total + '</span>';
  }

  /* Answer review */
  var reviewList = document.getElementById("reviewList");
  if (quiz) {
    reviewList.innerHTML = quiz.questions.map(function (question, index) {
      var answer = result.answers[index] || { chosen: -1, correct: question.correct };
      var isCorrect = answer.chosen === question.correct;
      var chosenText = answer.chosen === -1 ? (answer.timedOut ? "⏰ Time ran out" : "No answer") : question.options[answer.chosen];
      return '<div class="review-item ' + (isCorrect ? "good" : "bad") + '">' +
        '<div class="review-q"><span class="review-mark">' + (isCorrect ? "✅" : "❌") + '</span><strong>' + (index + 1) + ". " + PQ.escapeHTML(question.text) + '</strong></div>' +
        '<div class="review-a">' +
          (isCorrect
            ? 'You answered: <b class="good-text">' + PQ.escapeHTML(chosenText) + '</b>'
            : 'You answered: <b class="bad-text">' + PQ.escapeHTML(chosenText) + '</b> · Correct: <b class="good-text">' + PQ.escapeHTML(question.options[question.correct]) + '</b>') +
        '</div>' +
      '</div>';
    }).join("");
  } else {
    reviewList.innerHTML = '<div class="empty-state"><p>The original quiz is no longer available, so the answer review cannot be shown.</p></div>';
  }

  /* Actions */
  document.getElementById("retryBtn").addEventListener("click", function () {
    window.location.href = "play.html?id=" + encodeURIComponent(result.quizId);
  });
  document.getElementById("shareResultBtn").addEventListener("click", function () {
    var text = "I scored " + result.score + "/" + result.total + " (" + percent + "%) on \u201C" + result.quizTitle + "\u201D in Paragon Quiz! Can you beat me?";
    var url = window.location.origin + window.location.pathname.replace("results.html", "play.html") + "?id=" + encodeURIComponent(result.quizId);
    if (window.navigator.share) {
      window.navigator.share({ title: "Paragon Quiz", text: text, url: url }).catch(function () { /* user cancelled */ });
    } else if (window.navigator.clipboard) {
      window.navigator.clipboard.writeText(text + "\n" + url).then(function () {
        var button = document.getElementById("shareResultBtn");
        button.textContent = "✅ Copied!";
        window.setTimeout(function () { button.textContent = "🔗 Share Score"; }, 1600);
      });
    }
  });
})();

}
