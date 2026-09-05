/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: paragon-archive-ai.js
  EXPECTED PROJECT PATH: /ai/paragon-archive-ai.js
  ROLE: One secure local Paragon AI core for Archive Search intent ranking and grounded Website Detail Q&A, with reserved future product modes.
  RESTORE/LOAD NOTE: Restore under ai/. Load after all catalogue data and before app.js. Provider secrets must never be added here.
*/

(() => {
  if (window.ParagonAI?.version) return;

  const sites = window.ParagonSites || [];
  const modeRegistry = Object.freeze({
    "archive-search": { active: true, purpose: "Match messy, vague, typo-filled, or idea-style queries to Archive websites." },
    "website-detail": { active: true, purpose: "Answer grounded questions about the currently open website." },
    tutor: { active: false, purpose: "Reserved Paragon Tutor teaching role using the same core." },
    product: { active: false, purpose: "Reserved product-specific role selected through an allowlisted product mode." },
    code: { active: false, purpose: "Reserved code-assistance role; no code execution is enabled." },
    image: { active: false, purpose: "Reserved image role; no image provider is connected." },
    voice: { active: false, purpose: "Reserved voice role; no microphone or speech provider is activated." }
  });

  const stopWords = new Set(["a", "an", "and", "are", "be", "for", "from", "give", "i", "in", "is", "it", "me", "my", "need", "of", "on", "or", "please", "something", "that", "the", "this", "to", "want", "website", "with", "works", "better", "beautiful", "rubbish"]);
  const conceptRules = [
    { pattern: /\b(cv|curriculum vitae|job application|resume)\b/i, terms: ["resume", "cv", "cover letter"], preferred: ["Paragon Resume"] },
    { pattern: /\b(homework|assignment|school question|teach me|tutor)\b/i, terms: ["tutor", "education", "learning", "homework"], preferred: ["Paragon Tutor", "Paragon Education"] },
    { pattern: /\b(exam|test|practice question|mock)\b/i, terms: ["exam", "quiz", "mock test"], preferred: ["Paragon Exam", "Paragon Quiz"] },
    { pattern: /\b(calm|sleep|focus sound|rain|ambient|noise)\b/i, terms: ["ambient", "sounds", "music", "timer"], preferred: ["Paragon Sounds"] },
    { pattern: /\b(draw|drawing|paint|canvas|illustrat)\b/i, terms: ["canvas", "drawing", "creative", "design"], preferred: ["Paragon Canvas", "Paragon Design"] },
    { pattern: /\b(logo|poster|graphic|beautiful design|brand)\b/i, terms: ["design", "creative", "logo", "templates"], preferred: ["Paragon Design", "Paragon Canvas"] },
    { pattern: /\b(color|colour|palette|match outfit|brand colour)\b/i, terms: ["color", "palette", "contrast", "creative"], preferred: ["Paragon Palette", "Paragon Color", "Paragon Contrast"] },
    { pattern: /\b(code|coding|program|html|css|javascript|python)\b/i, terms: ["code", "developer", "editor", "programming"], preferred: ["Paragon Code", "Paragon Dev Tools"] },
    { pattern: /\b(host|hosting|deploy|publish site|static site)\b/i, terms: ["deploy", "hosting", "developer"], preferred: ["Paragon Deploy"] },
    { pattern: /\b(budget|money|expense|saving|finance|wealth)\b/i, terms: ["finance", "budget", "expenses", "savings"], preferred: ["Paragon Finance", "Paragon Budget"] },
    { pattern: /\b(invest|stock|portfolio|paper trad)\b/i, terms: ["invest", "portfolio", "finance", "simulator"], preferred: ["Paragon Invest"] },
    { pattern: /\b(health|wellness|breath|hydrate|mindful)\b/i, terms: ["health", "wellness", "hydration", "mindful"], preferred: ["Paragon Health", "Paragon Alive"] },
    { pattern: /\b(workout|fitness|exercise|bmi)\b/i, terms: ["fitness", "workout", "exercise"], preferred: ["Paragon Fit"] },
    { pattern: /\b(recipe|cook|meal|food|shopping list)\b/i, terms: ["recipe", "cooking", "meal"], preferred: ["Paragon Recipe"] },
    { pattern: /\b(chat|message|talk|friends|social|community)\b/i, terms: ["social", "chat", "communication", "community"], preferred: ["Paragon Chat", "Paragon Social"] },
    { pattern: /\b(game|play|arcade|fun|chess)\b/i, terms: ["games", "play", "arcade"], preferred: ["Paragon Arcade", "Paragon Chess"] },
    { pattern: /\b(weather|forecast|rain today|temperature)\b/i, terms: ["weather", "forecast", "alerts"], preferred: ["Paragon Weather"] },
    { pattern: /\b(note|write down|markdown|memo)\b/i, terms: ["notes", "writing", "markdown"], preferred: ["Paragon Notes"] },
    { pattern: /\b(journal|diary|mood track|reflection)\b/i, terms: ["journal", "mood", "reflection"], preferred: ["Paragon Journal"] }
  ];

  const LAUNCH_DATE = "August 1, 2026"; /* P-113 — the day Paragon Archive started (weekly board anchor) */
  const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const tokenize = value => normalize(value).split(/\s+/).filter(token => token && !stopWords.has(token));
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

  function editDistance(first, second) {
    const a = String(first), b = String(second);
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0]; row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const stored = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = stored;
      }
    }
    return row[b.length];
  }

  /* P-064: bigram (Dice) similarity for whole-string closeness — tolerant of typos and word order. */
  function bigrams(value) {
    const clean = normalize(value).replace(/\s+/g, " ");
    const set = new Map();
    for (let index = 0; index < clean.length - 1; index += 1) {
      const pair = clean.slice(index, index + 2);
      set.set(pair, (set.get(pair) || 0) + 1);
    }
    return set;
  }

  function diceSimilarity(first, second) {
    const a = bigrams(first), b = bigrams(second);
    if (!a.size || !b.size) return 0;
    let overlap = 0;
    a.forEach((count, pair) => { if (b.has(pair)) overlap += Math.min(count, b.get(pair)); });
    let totalA = 0, totalB = 0;
    a.forEach(count => { totalA += count; });
    b.forEach(count => { totalB += count; });
    return (2 * overlap) / (totalA + totalB);
  }

  /* Best fuzzy closeness between the query and a site (name, suffix, tag, purpose, tokens). */
  function similarityFor(site, query) {
    const doc = documentFor(site);
    const normalizedQuery = normalize(query);
    let best = Math.max(
      diceSimilarity(normalizedQuery, doc.fields.name),
      diceSimilarity(normalizedQuery, doc.fields.suffix),
      diceSimilarity(normalizedQuery, doc.fields.tag) * 0.9,
      diceSimilarity(normalizedQuery, doc.fields.purpose) * 0.85
    );
    // Token-level: each query token's best fuzzy hit against the site's tokens.
    const queryTokens = tokenize(query);
    if (queryTokens.length) {
      let tokenTotal = 0;
      queryTokens.forEach(token => {
        let tokenBest = 0;
        doc.tokens.forEach(candidate => {
          if (candidate === token) { tokenBest = 1; return; }
          if (candidate.startsWith(token) || token.startsWith(candidate)) tokenBest = Math.max(tokenBest, 0.8);
          else if (token.length >= 3) {
            const distance = editDistance(token, candidate);
            const allowance = token.length > 6 ? 2 : 1;
            if (distance <= allowance) tokenBest = Math.max(tokenBest, 1 - distance / Math.max(token.length, candidate.length));
            else tokenBest = Math.max(tokenBest, diceSimilarity(token, candidate) * 0.7);
          }
        });
        tokenTotal += tokenBest;
      });
      best = Math.max(best, tokenTotal / queryTokens.length * 0.95);
    }
    return best;
  }

  function documentFor(site) {
    const fields = {
      name: normalize(site.name),
      suffix: normalize(site.name.replace(/^Paragon\s+/i, "")),
      category: normalize(site.category),
      group: normalize(site.group),
      tag: normalize(site.tag),
      purpose: normalize(site.desc),
      about: normalize(site.about),
      features: normalize([...(site.features || []), ...(site.updates || [])].join(" ")),
      /* P-091 — concept-documentation training: the group, tag family and the same
         planned-experience text the preview page documents are all searchable, so an
         idea a user types matches the documented concept even without the name. */
      documentation: normalize([site.group, site.tag, site.about, (site.features || []).join(" ")].filter(Boolean).join(" "))
    };
    return { site, fields, tokens: new Set(tokenize(Object.values(fields).join(" "))) };
  }

  function expandIntent(query) {
    const terms = new Set(tokenize(query));
    const preferred = new Set();
    conceptRules.forEach(rule => {
      if (!rule.pattern.test(query)) return;
      rule.terms.forEach(term => tokenize(term).forEach(token => terms.add(token)));
      rule.preferred.forEach(name => preferred.add(name));
    });
    return { terms: [...terms], preferred };
  }


  /* =====================================================================
     P-096 — INTENT ROUTING (owner-trained, Google-style suggest/never rules).
     Boost = the website that genuinely owns the user's intent rises to the top with an
     honest reason. Never = queries the website must NOT be suggested for (the owner's
     boundary rules). Ambiguous edit-vs-generate queries boost BOTH sides so the user picks.
     ===================================================================== */
  const INTENT_ROUTES = [
    {
      site: "Paragon Recipe", label: "recipes, meal planning & cooking",
      when: [/don'?t have [a-z ]+(what|use|instead)|instead of (buttermilk|milk|eggs?|butter|flour)/i, /meal ?plan|weekly meal|macro\b|calorie target|shopping list|training split|adjust (my|the) plan|plateau|weight (gain|loss) plan|what (to|should) (i )?eat|meal prep|batch cook|recipe\b|recipes|ingredient|what can i make|gluten[- ]free|dairy[- ]free|vegan|keto|riss?otto|servings|scale (this|it|the)|substitut|no buttermilk|deglaze|sear (a|the|meat)|pair(s)? well|goes well with|side dish|leftover|fill in|build out|turn this into|make this (vegan|keto|dairy)/i, /cook|dish|dinner recipe|meal idea/i],
      never: [/renal|diabet|celiac|medical diet|dietitian|\brd\b|consult a (doctor|dietitian)/i, /health data|analyze (my )?health|blood work|lab results?/i, /convert (a )?(file|pdf|jpg|png|mp3|wav|docx|csv|zip)|file conver/i, /invoice/i]
    },
    {
      site: "Paragon Health", label: "personal health & wellness analysis",
      when: [/health data|analyze (my )?health|wellness|mindful|breathing|nutrition track|habit reminder|feel better/i],
      never: [/recipe|cook|meal plan/i]
    },
    {
      site: "Paragon Files", label: "file conversion, merge, split & compress",
      when: [/convert (a |an |my )?(file|pdf|jpg|jpeg|png|webp|mp3|wav|docx|csv|zip|gif|mp4)|to (pdf|jpg|png|mp3|wav|docx|csv|zip)|merge (pdf|files|images)|split (a )?(pdf|file)|compress (a |an )?(file|pdf|image|zip|audio)|file conver|zip archive|unzip/i],
      never: [/invoice|receipt for|bill (a|my) client/i, /resize|crop|filter (a|my|the)? ?(photo|image|picture)/i]
    },
    {
      site: "Paragon Invoice", label: "professional invoices with PDF export",
      when: [/invoice|bill (a|my) client|receipt for (a|my) client|payment request document/i],
      never: [/convert (a |an |my |this |the )?(file|pdf|jpg|mp3|docx|csv|zip)|file conver|merge pdf|split pdf|compress/i]
    },
    {
      site: "Paragon Flash", label: "flashcards, quizzes & study guides from notes",
      when: [/flash ?cards?|study guide|anki deck|memorize|revision cards|turn (my )?notes into|paste(d)? notes|exam prep|cram/i],
      never: [],
      neverAlways: [/deep research|market research|competitive landscape|in[- ]depth research/i, /data analysis|analyze (data|this dataset|spreadsheet)|statistics from/i]
    },
    {
      site: "Paragon Learn", label: "deep research & structured learning",
      when: [/deep research|market research|competitive landscape|in[- ]depth (research|study)|learn (about|topic)|course|tutorial|history of|explain (in depth|deeply)/i],
      never: []
    },
    {
      site: "Paragon Calc", label: "calculators & data analysis",
      when: [/data analysis|analyze (data|this dataset|my spreadsheet)|statistics|scientific calculator|unit conver(ter|sion)|currency conver(ter|sion)|number base/i],
      never: []
    },
    {
      site: "Paragon Shop", label: "product picks, price validation & deal timing",
      when: [/best [a-z0-9 ]+ under \\?|best (laptop|phone|tv|headphone|product)/i, /is (this|that) (amazon )?deal real|price (check|validation)|good (deal|price)/i, /gift ideas? for/i, /looking for [a-z0-9 ]+|help me (pick|choose|decide)|recommend me (a|an|the)/i, /when do .+ go on sale|good time to buy|price (drop|history|track)/i, /should i buy|worth the money|is [a-z0-9 ]+ (good|worth it)/i, /vs\.? ?[a-z0-9]+$|brand comparison|head[- ]to[- ]head|product comparison/i],
      never: [],
      neverAlways: [/market research|competitive landscape/i, /budget|budgeting|monthly expenses|savings plan/i]
    },
    {
      site: "Paragon Budget", label: "budgeting & spending plans",
      when: [/budget|budgeting|monthly expenses|spending plan|savings (plan|goal)|expense track/i],
      never: []
    },
    {
      site: "Paragon Travel", label: "trip planning, itineraries & travel budgets",
      when: [/plan (a|my|the) (trip|travel|vacation|holiday)|itinerary|trip plan|flights?|hotels?|accommodation|travel budget|how much (will|does) .+ trip cost|visa (requirements|check)|vaccin|etias|what do i need to enter|packing (list|for a trip)|interactive trip/i],
      never: [],
      neverAlways: [/book (a |an |my |the )?(flight|hotel|seat|ticket)|reserve (a|my) (flight|hotel|seat)|pay for (a|my) (flight|hotel)|checkout|complete (my )?booking|flight ticket purchase/i]
    },
    {
      site: "Paragon Resume", label: "professional resumes with PDF/DOCX export",
      when: [/resume|\bcv\b|curriculum vitae|cover letter|professional resume/i],
      never: []
    },
    {
      site: "Paragon Photo", label: "photo editing, resize, crop, filters & optimization",
      when: [/(edit|fix|enhance|improve) (a|my|the|this)? ?(photo|image|picture)/i, /make (this|it|the photo) look better/i, /resize|crop|rotate (a|my)? ?(photo|image)|brightness|contrast|saturation|filter (a|my)? ?(photo|image)|watermark|remove (the )?background|batch (process|resize) (images|photos)|compress (a|an)? ?(image|photo|jpg|png)|optimize (images|photos)/i],
      never: [],
      neverAlways: [/generate|\bai\b image|make (a|an)? ?(painting|logo|poster|illustration)/i, /put me on|make this photo look like a (painting|drawing)|reimagine/i]
    },
    {
      site: "Paragon Draw", label: "image generation & digital art creation",
      when: [/generate (a|an|the)? ?(image|picture|art|illustration|painting)|\bai\b (image|art|generate|picture)|make (a|an) (painting|drawing|digital art|illustration|logo concept)|make this photo look like a (painting|drawing)|put me on|reimagine (this|my) (photo|picture)/i],
      never: []
    },
    {
      site: "Paragon Design", label: "logos, palettes & design assets",
      when: [/create (a|an)? ?logo|logo concept|design assets|palette generator|typography pairing|brand (kit|style)/i],
      never: []
    }
  ];


  /* P-098 — ROUTE KEYWORDS: the exact words users type, mapped to the website that owns them.
     Adds a keyword layer on top of name/category/feature matching (Google-style "did you mean"). */
  const ROUTE_KEYWORDS = {
    "Paragon Recipe": ["cook", "cooking", "recipe", "recipes", "risotto", "dinner", "meal idea", "ingredients", "kitchen", "baking", "chef", "food", "snack", "breakfast", "lunch", "supper", "substitute", "leftover", "leftovers", "servings", "meal prep", "batch cooking", "gluten free", "dairy free", "vegan recipe", "keto recipe", "spice", "taste", "delicious", "dish", "cuisine", "appetizer", "dessert"],
    "Paragon Files": ["convert", "converter", "conversion", "pdf", "jpg", "png", "mp3", "wav", "mp4", "docx", "csv", "zip", "unzip", "merge", "split", "compress", "compression", "file", "files", "archive file", "image format", "audio format", "document format", "reduce size"],
    "Paragon Invoice": ["invoice", "invoices", "bill", "billing", "receipt", "payment request", "client bill", "proforma", "vat", "remittance"],
    "Paragon Flash": ["flashcard", "flashcards", "flash card", "anki", "study", "studying", "revision", "revise", "cram", "memorize", "memorization", "exam", "exams", "test prep", "quiz me", "study guide", "notes to cards", "spaced repetition"],
    "Paragon Learn": ["learn", "learning", "course", "courses", "tutorial", "tutorials", "lesson", "deep research", "research", "explain", "understand", "topic", "history", "science", "how things work", "education", "study topic"],
    "Paragon Calc": ["calculator", "calculate", "data analysis", "analyze data", "statistics", "stats", "spreadsheet", "dataset", "unit converter", "currency converter", "number base", "percentage", "average"],
    "Paragon Shop": ["buy", "buying", "shop", "shopping", "best", "cheapest", "deal", "deals", "discount", "price", "prices", "pricing", "worth it", "review product", "laptop", "phone", "headphones", "tv", "gift", "gift idea", "birthday gift", "compare products", "versus", "vs", "amazon", "jumia", "konga", "black friday", "sale", "on sale", "recommend", "help me pick", "looking for"],
    "Paragon Budget": ["budget", "budgeting", "expenses", "spending", "save money", "savings", "money plan", "monthly budget", "finance tracker", "cost tracker"],
    "Paragon Travel": ["travel", "trip", "vacation", "holiday", "itinerary", "flight", "flights", "hotel", "hotels", "booking", "visa", "passport", "destination", "tourist", "attraction", "packing", "lagos trip", "abroad", "tour", "tourism", "travel budget", "trip plan"],
    "Paragon Resume": ["resume", "cv", "curriculum vitae", "cover letter", "job application", "linkedin profile", "work experience", "job hunt", "interview prep document"],
    "Paragon Photo": ["photo", "photos", "picture", "pictures", "image", "images", "edit photo", "resize", "crop", "rotate", "filter", "brightness", "contrast", "background remover", "watermark", "compress image", "photo editor", "fix photo", "enhance photo", "picture quality"],
    "Paragon Draw": ["draw", "drawing", "generate image", "ai image", "ai art", "digital art", "illustration", "painting", "poster", "logo", "logo concept", "create art", "concept art", "mascot", "avatar art"],
    "Paragon Design": ["design", "designer", "palette", "color scheme", "colors", "typography", "font pairing", "brand kit", "style guide", "ui design", "mockup"],
    "Paragon Quiz": ["quiz", "quizzes", "trivia", "questions and answers", "test knowledge", "practice test", "paragon quiz", "create quiz", "play quiz"],
    "Paragon Notes": ["notes", "note taking", "notebook", "write", "writing", "journal entry", "markdown", "to do list", "todo", "checklist"],
    "Paragon Weather": ["weather", "forecast", "rain", "temperature", "humidity", "sunny", "cloudy", "today weather", "abuja weather"],
    "Paragon Music": ["music", "songs", "playlist", "listen", "audio", "stream music", "discover music", "artist"],
    "Paragon Movie": ["movie", "movies", "film", "films", "cinema", "watch list", "watchlist", "series", "tv show"],
    "Paragon Chat": ["chat", "message", "messaging", "dm", "talk to friends", "conversation"],
    "Paragon Fitness": ["fitness", "workout", "exercise", "gym", "training", "muscle", "weight training", "cardio"],
    "Paragon Fit": ["fitness", "workout", "exercise", "gym", "training", "dumbbell", "heartbeat", "steps", "calories burned"]
  };
  function keywordBoost(query, entry) {
    const clean = String(query || "").toLowerCase();
    let added = 0;
    let matched = [];
    Object.entries(ROUTE_KEYWORDS).forEach(([siteName, words]) => {
      if (entry.site.name !== siteName) return;
      words.forEach(word => {
        if (clean === word) { added += 40; matched.push(word); }
        else if (clean.includes(word) && word.length >= 4) { added += 16; matched.push(word); }
      });
    });
    return { added, matched: [...new Set(matched)].slice(0, 3) };
  }

  function applyIntentRouting(query, entries) {
    const clean = String(query || "");
    const boosted = new Set();
    const suppressed = new Set();
    const reasonFor = new Map();
    INTENT_ROUTES.forEach(route => {
      const matchesWhen = route.when.some(pattern => pattern.test(clean));
      const matchesNever = route.never.some(pattern => pattern.test(clean));
      const matchesHardNever = (route.neverAlways || []).some(pattern => pattern.test(clean));
      if (matchesHardNever || (matchesNever && !matchesWhen)) { suppressed.add(route.site); return; }
      if (matchesWhen) {
        boosted.add(route.site);
        reasonFor.set(route.site, route.label);
      }
    });
    return entries
      .filter(entry => !suppressed.has(entry.site.name))
      .map(entry => {
        const keywords = keywordBoost(clean, entry); /* P-098 — user-language keyword match */
        if (keywords.added && !boosted.has(entry.site.name)) {
          const reasons = [...entry.reasons, keywords.matched.length ? `You searched: ${keywords.matched.join(", ")}` : "keyword match"];
          return { ...entry, score: entry.score + keywords.added, confidence: Math.min(1, (entry.score + keywords.added) / 320), reasons: [...new Set(reasons)].slice(0, 4), keywordMatched: keywords.matched };
        }
        if (!boosted.has(entry.site.name)) return entry;
        const reasons = [...entry.reasons];
        reasons.unshift(`Matched intent: ${reasonFor.get(entry.site.name)}`);
        return { ...entry, score: entry.score + 320, confidence: Math.min(1, (entry.score + 320) / 420), reasons: [...new Set(reasons)].slice(0, 4), intentRouted: true };
      });
  }

  function rankWebsites(query, options = {}) {
    const clean = String(query || "").trim();
    if (!clean) return [];
    const normalizedQuery = normalize(clean);
    const { terms, preferred } = expandIntent(clean);
    const ranked = sites.map(site => {
      const doc = documentFor(site);
      let score = 0;
      const reasons = [];
      if (doc.fields.name === normalizedQuery || doc.fields.suffix === normalizedQuery) { score += 220; reasons.push("exact website name"); }
      else if (doc.fields.name.startsWith(normalizedQuery) || doc.fields.suffix.startsWith(normalizedQuery)) { score += 120; reasons.push("website name prefix"); }
      else if (doc.fields.name.includes(normalizedQuery) || doc.fields.suffix.includes(normalizedQuery)) { score += 75; reasons.push("website name"); }
      if (preferred.has(site.name)) { score += 130; reasons.push("intent match"); }
      terms.forEach(term => {
        if (doc.fields.name.includes(term) || doc.fields.suffix.includes(term)) { score += 45; reasons.push(`name: ${term}`); return; }
        if (doc.fields.category.includes(term) || doc.fields.group.includes(term)) { score += 28; reasons.push(`category: ${term}`); return; }
        if (doc.fields.purpose.includes(term) || doc.fields.tag.includes(term)) { score += 24; reasons.push(`purpose: ${term}`); return; }
        if (doc.fields.features.includes(term)) { score += 18; reasons.push(`feature: ${term}`); return; }
        if (doc.fields.about.includes(term)) { score += 9; reasons.push(`about: ${term}`); return; }
        if (term.length >= 4 && [...doc.tokens].some(token => Math.abs(token.length - term.length) <= 2 && editDistance(term, token) <= (term.length > 6 ? 2 : 1))) {
          score += 12; reasons.push(`possible typo: ${term}`);
        }
      });
      // P-064: whole-string and token fuzzy closeness always contributes,
      // so misspelled or vague queries still surface the nearest websites.
      const similarity = similarityFor(site, clean);
      score += Math.round(similarity * 90);
      if (similarity >= 0.55 && !reasons.length) reasons.push("closest name match");
      else if (similarity >= 0.4 && reasons.length < 2) reasons.push("similar wording");
      const confidence = Math.min(1, score / 220);
      return { site, name: site.name, score, confidence, similarity, reasons: [...new Set(reasons)].slice(0, 4) };
    });
    const routed = applyIntentRouting(clean, ranked); // P-096 — owner-trained intent routing
    const minimum = Number(options.minimumScore || 10);
    let results = routed.filter(entry => entry.score >= minimum)
      .sort((first, second) => second.score - first.score || first.site.name.localeCompare(second.site.name));
    // P-064: guaranteed closest-match fallback — if the strict pass is thin, top up
    // with the highest-similarity sites so the user ALWAYS sees the nearest options.
    const ensure = Math.max(0, Number(options.ensure || 0));
    if (ensure && results.length < ensure) {
      const seen = new Set(results.map(entry => entry.name));
      const closest = ranked.filter(entry => !seen.has(entry.name))
        .sort((first, second) => second.similarity - first.similarity || second.score - first.score)
        .slice(0, ensure - results.length)
        .map(entry => Object.assign({}, entry, { confidence: Math.min(entry.confidence, Math.max(0.08, entry.similarity * 0.6)), reasons: entry.reasons.length ? entry.reasons : ["closest match to your words"] }));
      results = results.concat(closest);
    }
    return results.slice(0, Math.max(1, Number(options.limit || results.length)));
  }

  function findSite(siteName) { return sites.find(site => site.name.toLowerCase() === String(siteName || "").toLowerCase()) || null; }

  /* ============================================================
     P-075 — DETAIL SIGNAL ENGINE: build-state, demand ranking, live
     updates, documentation, and review-signal analysis. Every number
     comes from real catalogue data or real device stores at answer
     time — nothing is invented, no dates are promised.
     ============================================================ */
  function readStore(key, fallback) {
    try {
      if (typeof window.localStorage === "undefined") return fallback;
      return JSON.parse(window.localStorage.getItem(key) || "null") || fallback;
    } catch (error) { return fallback; }
  }

  function liveSiteSignals(site) {
    const needsMap = readStore("paragonArchive.siteNeeds.v1", {});
    const allNeeds = Object.keys(needsMap)
      .map(name => ({ name, count: Number(needsMap[name] && needsMap[name].count) || 0 }))
      .filter(entry => entry.count > 0)
      .sort((first, second) => second.count - first.count);
    const needCount = needsMap[site.name] ? Number(needsMap[site.name].count) || 0 : 0;
    const needRank = needCount > 0 ? allNeeds.findIndex(entry => entry.name === site.name) + 1 : 0;
    let views = 0;
    try { views = window.ParagonMetrics ? Number(window.ParagonMetrics.getViewCount(site.name)) || 0 : 0; } catch (error) { views = 0; }
    const guest = readStore("paragonArchive.guestState.v1", {});
    const deviceReviews = (guest.reviews && Array.isArray(guest.reviews[site.name])) ? guest.reviews[site.name] : [];
    const inheritedReviews = []; // P-076 — inherited sample reviews retired everywhere; only real user reviews are signals.
    const allReviews = deviceReviews.slice();
    const stars = allReviews.map(review => Number(review.stars) || 0).filter(value => value > 0);
    const averageStars = stars.length ? Math.round((stars.reduce((sum, value) => sum + value, 0) / stars.length) * 10) / 10 : 0;
    const build = Math.max(0, Math.min(100, Math.round(Number(site.buildProgress) || 0)));
    const isLive = Boolean(site.siteUrl && site.siteUrl !== "#" && !site.previewOnly);
    return { build, isLive, needCount, needRank, totalNeedListings: allNeeds.length, views, deviceReviews, inheritedReviews, allReviews, averageStars };
  }

  const THEME_STOPWORDS = new Set(["the","a","an","and","or","but","is","it","its","this","that","was","are","be","been","i","my","me","we","you","your","of","to","in","on","for","with","so","very","really","just","too","not","no","have","has","had","would","could","should","will","can","cant","dont","do","does","did","at","as","by","from","they","them","their","there","here","when","what","how","why","if","then","than","also","more","much","app","site","website","paragon","use","using","used","get","got","one","like","love","great","good","nice","best","awesome","amazing","cool","solid","works","work","well"]);
  function reviewThemes(reviews) {
    const counts = {};
    const wishes = [];
    reviews.forEach(review => {
      const text = String(review.text || "");
      if (/\b(want|need|wish|add|please|missing|should have|would be (nice|great)|hope)\b/i.test(text)) wishes.push(text.trim());
      tokenize(text).forEach(token => {
        if (token.length < 4 || THEME_STOPWORDS.has(token)) return;
        counts[token] = (counts[token] || 0) + 1;
      });
    });
    const themes = Object.keys(counts)
      .map(word => ({ word, count: counts[word] }))
      .filter(entry => entry.count >= 2)
      .sort((first, second) => second.count - first.count)
      .slice(0, 5);
    return { themes, wishes: wishes.slice(0, 4) };
  }

  function buildStateText(site) {
    const signals = liveSiteSignals(site);
    if (signals.isLive) {
      return `${site.name} is already REAL and open today — no waiting. Press OPEN on its detail page to use it right now.`;
    }
    const parts = [];
    parts.push(`${site.name} is ${signals.build}% built${signals.build === 0 ? " — real construction has not started yet" : ""} (this is the genuine build value, not an animation).`);
    if (signals.needCount > 0) {
      parts.push(`Demand recorded on this device: ${signals.needCount} need ${signals.needCount === 1 ? "vote" : "votes"}${signals.needRank ? `, ranked #${signals.needRank} of ${signals.totalNeedListings} websites with recorded needs` : ""}. Paragon schedules construction by real demand, so ${signals.needRank === 1 ? "it currently sits CLOSEST to construction among the needs recorded here" : "more need votes push it earlier in the build order"}.`);
    } else {
      parts.push(`No need votes are recorded on this device yet — tapping “I need this website” on its construction page is the real signal Paragon uses to schedule builds sooner.`);
    }
    if (signals.views > 0) parts.push(`It also has ${signals.views} real recorded ${signals.views === 1 ? "view" : "views"} on this device — another activity signal the team can see.`);
    parts.push(`Honesty note: the public roadmap targets the platform launch for August 2027 with the first 100 websites across 2027, but no individual release date is promised for ${site.name} until the team schedules it.`);
    return parts.join(" ");
  }

  function updatesText(site) {
    const changes = site.updates || [];
    const parts = [`${site.name} currently shows ${site.version || "a version pending confirmation"}.`];
    if (changes.length) parts.push(`Documented changes/updates: ${changes.join("; ")}.`);
    else parts.push("No product updates are documented yet — real update entries appear in the Updates tab as they happen.");
    parts.push("New announcements published by the Paragon Team also appear in the public Updates feed in real time.");
    return parts.join(" ");
  }

  function documentationText(site) {
    const features = site.features || site.updates || [];
    const parts = [];
    parts.push(`Full documentation for ${site.name}:`);
    parts.push(`PURPOSE — ${site.desc}.`);
    if (site.about) parts.push(`ABOUT — ${site.about}`);
    parts.push(`CATEGORY — ${site.category}${site.group ? ` (${site.group} group)` : ""}.`);
    if (features.length) parts.push(`PLANNED EXPERIENCE — ${features.map((feature, index) => `${index + 1}) ${feature}`).join(" ")}`);
    parts.push(site.previewOnly
      ? `STATUS — concept preview: opening it shows the honest under-construction page with its real build percentage and the concept documentation below (scroll or tap “View the concept documentation”).`
      : `STATUS — live destination; open it directly from the detail page.`);
    return parts.join(" ");
  }

  function userNeedsText(site) {
    const signals = liveSiteSignals(site);
    if (!signals.allReviews.length && signals.needCount === 0) {
      return `No reviews or need votes are recorded for ${site.name} yet, so there is no real user-demand signal to report — honest zero. Reviews written in the Archive and “I need this website” taps become the signals I read.`;
    }
    const analysis = reviewThemes(signals.allReviews);
    const parts = [];
    if (signals.allReviews.length) parts.push(`${site.name} has ${signals.allReviews.length} real ${signals.allReviews.length === 1 ? "review" : "reviews"}${signals.averageStars ? ` averaging ${signals.averageStars}★` : ""} — all written on this device by real users (sample reviews are retired; nothing is made up).`);
    if (analysis.themes.length) parts.push(`Most-mentioned themes across reviews: ${analysis.themes.map(entry => `“${entry.word}” (×${entry.count})`).join(", ")}.`);
    if (analysis.wishes.length) parts.push(`Explicit user wishes found: ${analysis.wishes.map(wish => `“${wish}”`).join(" · ")}`);
    if (signals.needCount > 0) parts.push(`Plus ${signals.needCount} need ${signals.needCount === 1 ? "vote" : "votes"} on this device${signals.needRank ? ` (rank #${signals.needRank})` : ""}.`);
    return parts.join(" ");
  }

  function futureText(site) {
    const signals = liveSiteSignals(site);
    const analysis = reviewThemes(signals.allReviews);
    const features = site.features || site.updates || [];
    const parts = [`What is likely next for ${site.name}, based only on real signals:`];
    if (!signals.isLive) parts.push(`1) Construction itself — it is ${signals.build}% built, and its ${signals.needCount} need ${signals.needCount === 1 ? "vote" : "votes"} ${signals.needCount ? "push it up the build order" : "(none yet) would push it up the build order"}.`);
    if (features.length) parts.push(`${signals.isLive ? "1" : "2"}) The documented planned experience still to be delivered: ${features.slice(0, 4).join("; ")}.`);
    if (analysis.themes.length || analysis.wishes.length) parts.push(`Review signals suggest users care about: ${[...analysis.themes.map(entry => entry.word), ...analysis.wishes.slice(0, 2)].slice(0, 5).join(", ")} — strong candidates for future updates.`);
    parts.push("Honesty note: these are real observed signals, not promises — the Paragon Team decides the final roadmap, and confirmed plans appear in the public roadmap and Updates feed.");
    return parts.join(" ");
  }

  const INTENT_VOCABULARY = ["feature", "features", "include", "documentation", "docs", "update", "updates", "version", "release", "build", "built", "ready", "launch", "schedule", "progress", "price", "cost", "free", "premium", "open", "iframe", "category", "purpose", "about", "review", "reviews", "need", "needs", "want", "future", "upcoming", "roadmap", "added", "created", "creation", "everything", "complete", "status", "live", "finished", "users", "people", "when", "soon", "close", "hello", "hi", "hey", "greetings", "morning", "afternoon", "evening", "paragon", "archive", "website", "coin", "coins", "quiz", "leaderboard", "withdraw", "buy", "sell", "guest", "account", "search", "game", "games", "play", "install", "app", "help", "support", "thank", "thanks", "bye", "goodbye"];
  /* P-113 — typo snap table for common chat words: "hwllo"→"hello", "thnak"→"thank"… */
  const CHAT_VOCABULARY = ["hello", "hi", "hey", "helo", "hallo", "holla", "yo", "sup", "howdy", "morning", "afternoon", "evening", "greetings", "thanks", "thank", "thankyou", "bye", "goodbye", "please", "paragon", "archive", "website", "coin", "coins", "quiz", "leaderboard", "withdraw", "guest", "account", "search", "install", "help", "support", "started", "begin", "launch", "created", "who", "what", "when", "where", "how", "why", "are", "you", "your", "name", "doing", "going", "old", "work", "works", "play", "game", "games", "free", "money", "naira", "wallet"];
  function correctTypos(text) {
    // P-080/P-113 — understand typos: snap each unknown word to the closest keyword (edit distance ≤ 2).
    return String(text || "").split(/\s+/).map(word => {
      const clean = word.toLowerCase().replace(/[^a-z']/g, "");
      if (!clean || clean.length < 3) return word;
      if (INTENT_VOCABULARY.includes(clean) || CHAT_VOCABULARY.includes(clean)) return word;
      let best = null;
      let bestDistance = clean.length <= 4 ? 2 : 3;
      INTENT_VOCABULARY.concat(CHAT_VOCABULARY).forEach(candidate => {
        if (Math.abs(candidate.length - clean.length) > 2) return;
        const distance = editDistance(clean, candidate);
        if (distance < bestDistance) { bestDistance = distance; best = candidate; }
      });
      return best && bestDistance <= (clean.length <= 4 ? 1 : 2) ? best : word;
    }).join(" ");
  }

  /* P-113 — CONVERSATION BRAIN: greetings and small talk that are NOT about a website.
     Used by the archive-wide assistant AND as a safety net inside website detail Q&A. */
  function greetingReply() {
    const hour = new Date().getHours();
    const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const roll = Math.floor(Math.random() * 3);
    const opens = [
      `Good ${part}! 👋 Hi, I'm Paragon AI — the brain inside Paragon Archive.`,
      `Hello! 👋 Great to see you. I'm Paragon AI.`,
      `Hi there! 👋 Welcome — I'm Paragon AI, your guide around Paragon Archive.`
    ];
    return `${opens[roll]} I can help you find any of the ${sites.length} Paragon websites (even through typos 🤝), explain what each one does, tell you about coins, the weekly leaderboard, your account, or just chat. Try asking “what can you do?” or search an idea like “I want a tool for invoices”.`;
  }

  function answerConversation(rawQuestion) {
    const q = normalize(correctTypos(rawQuestion));
    if (!q) return null;
    /* greetings */
    if (/^(hi+|hello+|hey+|helo+|hallo+|holla+|yo|sup|howdy|good (morning|afternoon|evening|day)|greetings|hi paragon|hello paragon|hey paragon)\b/.test(q) || /^(hi+|hello+|hey+)\b/.test(q)) {
      return { text: greetingReply(), evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    if (/^(thank(s| you|you very much)|thanks a lot|thnks|tnx|appreciate|well done|good job|nice one)\b/.test(q)) {
      return { text: "You're very welcome! 😊 I'm right here whenever you need to find a website, understand a feature, or anything about Paragon. Enjoy the Archive!", evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    if (/^(bye|goodbye|good bye|see you|see ya|later|good night|gn)\b/.test(q)) {
      return { text: "Goodbye for now! 👋 Everything you do is saved in your account or guest session. Come back anytime — Paragon Archive will be here. 🚀", evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    /* identity */
    if (/(who are you|what are you|your name|who is paragon ai|what is paragon ai|introduce yourself|about you)\b/.test(q)) {
      return { text: `I'm Paragon AI 🧠 — the built-in assistant for Paragon Archive. I run right inside the app (no external service needed) and I know every Paragon website: what it does, how built it is, its reviews, updates, and how to open it. I also understand misspelled or vague words, so just type the way you talk. I never invent facts — if something isn't real yet, I say so honestly.`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    if (/(who (made|created|built|owns|owns?) paragon|who (made|created|built) this|paragon founder|who owns paragon)/.test(q)) {
      return { text: `Paragon Archive is built and run by the Paragon Team (the Paragon founder), with real developer partners joining through the Developer Portal and the 8-point review gate for the Deployed category.`, evidence: ["identity"], confidence: 0.9, mode: "conversation" };
    }
    if (/(what can you do|help me|your features|what do you do|how do you work|how can you help|capabilities)\b/.test(q)) {
      return { text: `Here's what I can do:\n• 🔎 Find a website from any idea or phrase — even misspelled — and tell you why it matches (e.g. “I need something for receipts”).\n• 🧾 Explain any website: purpose, features, build progress, reviews, version updates, price, how to open it.\n• 🪙 Explain Paragon Coins: buying, the ₦1 = 2 coins rate, selling/withdrawing, the weekly leaderboard and prizes.\n• 🏆 Explain how leaderboard points work (only eligible staked competitions earn them).\n• 👤 Explain accounts, guests, collections, saves, reviews and achievements.\n• 💬 And basic chat — greetings, “how are you”, thanks. Just ask!`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    /* small talk */
    if (/(how are you|how (are|r) (you|u|ya)|how far|how (is|iz) (it|paragon)|you (okay|ok|fine|good)|hope you are well)/.test(q)) {
      return { text: `I'm doing great, thank you for asking! 😄 I'm fully switched on and ready to help with anything in Paragon Archive — websites, coins, leaderboard, your account, whatever you need. How can I help you today?`, evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    if (/(when did (this|the|paragon|these|the website|the websites|the archive|platform).*(start|begin|launch|come out|created|made)|when (was|did) paragon (start|begin|launch|created|founded)|how old is paragon|when did (this|the) (website|site) (start|begin|launch)|paragon (start|launch|founded) date|since when)/.test(q)) {
      return { text: `Paragon Archive officially started on ${LAUNCH_DATE} — that's the anchor date for everything here, including the weekly coin leaderboard weeks (Aug 1, Aug 8, Aug 15, Aug 22, Aug 29, Sep 5, and so on). Websites are added and built in waves from that date, and each one shows its honest build progress. The Archive opened with a growing catalogue and the first product wave (Invoice, Resume, Recipe, Flash, Files, Travel, Photo, Shop and more) went live through September 2026.`, evidence: ["launchDate"], confidence: 0.95, mode: "conversation" };
    }
    if (/(what day|what date) is (it|today|today'?s date)|current date|today'?s date/.test(q)) {
      const today = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      return { text: `Today is ${today}. 🗓️ (Taken from your device's clock.)`, evidence: ["date"], confidence: 1, mode: "conversation" };
    }
    if (/(is (it|paragon) (free|safe|legit|real)|is paragon (free|safe)|free to use|do i pay|does it cost)/.test(q)) {
      return { text: `Browsing Paragon Archive, playing free games and quizzes, saving, reviewing and exploring are completely FREE — you don't pay a thing. Coins are only used for optional competitive play and rewards; free mode always stays available, and guests can play free without an account. Your data stays yours, and nothing financial happens without verification.`, evidence: ["policy"], confidence: 0.95, mode: "conversation" };
    }
    if (/(i love|love (it|this|paragon)|nice|awesome|amazing|cool|great app|beautiful|well done paragon)/.test(q)) {
      return { text: `Thank you so much! 🙌 That means a lot to the Paragon Team. Keep exploring — and if there's a website you wish existed, use “Request a Website” and the most-requested ones get built first.`, evidence: ["greeting"], confidence: 0.9, mode: "conversation" };
    }
    return null;
  }


  function addedText(site) {
    const added = site.addedAt || site.addedDate || null;
    const addedLabel = added ? new Date(added).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "the Archive's founding period (August 2026)";
    const parts = [`${site.name} was added to the Paragon Archive catalogue on ${added ? addedLabel : "a date normalized to " + addedLabel}.`];
    parts.push(`Current version: ${site.version || "pending confirmation"}.`);
    const changes = site.updates || [];
    if (changes.length) parts.push(`Documented updates since then: ${changes.join("; ")}.`);
    parts.push(site.previewOnly ? "Creation (actual construction) is tracked separately — ask me \"how close is it to being built\" for the real build state." : "It is a live destination today.");
    return parts.join(" ");
  }

  function answerDetail(siteName, question) {
    const site = findSite(siteName);
    question = correctTypos(question);
    const query = normalize(question);
    if (!site) return { text: "I could not find that website in the current Paragon catalogue.", evidence: [], confidence: 0 };
    /* P-113 — small talk & greetings get natural replies even inside a website Q&A. */
    const chat = answerConversation(question);
    if (chat && /^(hi+|hello+|hey+|yo|sup|howdy|good (morning|afternoon|evening)|greetings|thanks|thank you|bye|goodbye|how are you|how far|who are you|what are you|what can you do|help me|i love|love (it|this|paragon))/.test(query)) {
      return { ...chat, site: site.name, mode: "website-detail" };
    }
    const features = site.features || site.updates || [];
    const status = site.previewOnly ? "concept preview while the real product is still being built" : site.name === "Paragon Archive Hub" ? "available Archive Hub page" : "configured destination";
    let text;
    let evidence = ["name", "description"];
    if (/^\s*(hi|hey|hello|yo|sup|howdy|good\s*(morning|afternoon|evening)|what'?s\s*up|how\s*(are|far)\s*(you|things)?)\b[\s!,.?]*$/i.test(String(question || ""))) {
      text = `Hello! 👋 I'm Paragon AI, and I know ${site.name} inside out. I can tell you its purpose, features, full documentation, build state (how close it is to being built), what users need most, likely future updates, version, price, or how to open it. What would you like to know?`;
      evidence = ["greeting"];
    } else if (/everything|all (i need|about|of it)|complete(ly)? (info|overview|details)?|full (overview|rundown|breakdown)|tell me all/.test(query)) {
      text = `${documentationText(site)}\n\n${buildStateText(site)}\n\n${userNeedsText(site)}\n\n${updatesText(site)}`;
      evidence = ["description", "features", "buildProgress", "siteNeeds", "reviews", "version"];
    } else if (/(when|what day|which day).*(added|created|join|catalogu)|added (to|on)|creation date|date.*(added|created)/.test(query)) {
      text = addedText(site);
      evidence = ["addedAt", "version", "updates"];
    } else if (/when.*(built|build|ready|launch|release|done|finish|come)|how (soon|close|far|long)|soonest|closer to|close to (creation|being built)|release date|eta|schedule|build (state|status|progress)|percent built/.test(query)) {
      text = buildStateText(site);
      evidence = ["buildProgress", "siteNeeds", "views", "public roadmap"];
    } else if (/(users?|people|reviewers?|everyone|community).*(want|need|wish|ask|request|complain|feedback|say)|most (needed|wanted|requested)|what.*(users?|people).*(like|want|need)/.test(query)) {
      text = userNeedsText(site);
      evidence = ["reviews", "siteNeeds"];
    } else if (/future|upcoming|next (update|version|feature)|coming next|what.*next|will (it|this).*(add|get|have)|roadmap/.test(query)) {
      text = futureText(site);
      evidence = ["features", "reviews", "siteNeeds", "buildProgress"];
    } else if (/\bdocs?\b|documentation|how (does|will|would) (it|this) work|full (guide|spec)|concept (doc|documentation)/.test(query)) {
      text = documentationText(site);
      evidence = ["description", "about", "features", "previewOnly"];
    } else if (/feature|inside|include|can it|what can/.test(query)) {
      text = `${site.name} is designed to include: ${features.join("; ") || site.desc}.`;
      evidence = ["features"];
    } else if (/what is|what does|purpose|about|tell me/.test(query)) {
      text = `${site.name} is ${site.desc.toLowerCase()}. ${site.about || "It is part of Paragon Archive."}`;
      evidence = ["description", "about"];
    } else if (/category|group|where/.test(query)) {
      text = `${site.name} is listed under ${site.category}${site.group ? ` in the ${site.group} group` : ""}.`;
      evidence = ["category", "group"];
    } else if (/version|update|new|release/.test(query)) {
      text = updatesText(site);
      evidence = ["version", "updates", "Updates feed"];
    } else if (/live|ready|finished|status|preview/.test(query)) {
      text = `${site.name} currently opens as a ${status}. A preview is useful for exploring the planned experience, but it must not be treated as a completed production product.${site.previewOnly ? ` Real build progress: ${Math.max(0, Math.min(100, Math.round(Number(site.buildProgress) || 0)))}%.` : ""}`;
      evidence = ["previewOnly", "siteUrl", "buildProgress"];
    } else if (/free|price|cost|pay|premium/.test(query)) {
      text = site.category === "Deployed" ? "Future approved Deployed websites may have clearly labelled premium features under the Hub rules." : `${site.name} is a Paragon-built product and is intended to remain free. Its current concept preview does not process payments.`;
      evidence = ["category", "Terms"];
    } else if (/open|iframe|new tab/.test(query)) {
      text = `Use OPEN from the ${site.name} detail to load its destination in the Archive preview. Open in New Tab remains available because some production websites may block iframe embedding.`;
      evidence = ["Archive preview behavior"];
    } else {
      text = `I want to stay exactly on topic for ${site.name}, so tell me which of these you need: purpose · features · full documentation · build state (how close it is) · what users need most · future updates · version & what's new · price · how to open it. Or say "everything about this site" and I'll give the complete picture.`;
      evidence = ["scope"];
    }
    return { text, evidence, confidence: 1, site: site.name, mode: "website-detail" };
  }

  function answerSearch(question) {
    /* P-113 — greetings, small talk, identity & platform questions get direct answers first. */
    const chat = answerConversation(question);
    if (chat) return chat;
    // Strict pass: only confident matches count as an answer; genuinely unrelated
    // queries keep the honest Request fallback. (Closest-match SUGGESTIONS are a
    // separate flow via rankWebsites' ensure option in the Search Results screen.)
    const ranked = rankWebsites(question, { limit: 5, minimumScore: 60 }).filter(entry => entry.confidence >= 0.3 || entry.similarity >= 0.5);
    if (!ranked.length) return { text: "I could not find a confident website match. Paragon is building more, so you can submit the idea through Request a Website. (I can still chat too — try “what can you do?”.)", matches: [], requestSuggested: true, confidence: 0, mode: "archive-search" };
    const matches = ranked.map(entry => ({ name: entry.site.name, reason: entry.reasons.join(", ") || entry.site.desc, confidence: entry.confidence }));
    return { text: `The closest match is ${matches[0].name}.`, matches, requestSuggested: false, confidence: matches[0].confidence, mode: "archive-search" };
  }

  async function ask(question, context = {}) {
    const mode = context.mode === "website-detail" ? "website-detail" : "archive-search";
    return mode === "website-detail" ? answerDetail(context.siteName, question) : answerSearch(question);
  }

  let currentDetailSite = null;
  function appendMessage(text, role = "assistant") {
    const messages = document.getElementById("paragon-ai-messages");
    if (!messages) return;
    const article = document.createElement("article");
    article.className = `paragon-ai-message ${role}`;
    article.textContent = text;
    messages.appendChild(article);
    messages.scrollTop = messages.scrollHeight;
  }

  function openDetailAssistant(siteName) {
    const site = findSite(siteName);
    const overlay = document.getElementById("paragon-ai-overlay");
    if (!site || !overlay) return;
    currentDetailSite = site.name;
    const title = document.getElementById("paragon-ai-title");
    const scope = document.getElementById("paragon-ai-scope");
    const messages = document.getElementById("paragon-ai-messages");
    if (title) title.textContent = `Ask about ${site.name}`;
    if (scope) scope.textContent = `Grounded in ${site.name}'s current Archive details — I also answer greetings and small talk.`;
    const label = document.getElementById("paragon-ai-label");
    if (label) label.textContent = `Ask about ${site.name} — or just say hello`;
    if (messages) messages.innerHTML = "";
    appendMessage(`Hello! 👋 I'm Paragon AI. I know ${site.name} inside out — purpose, features, build state, reviews, updates and how to open it — and I understand typos and casual chat too. What would you like to know?`);
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("ai-open");
    requestAnimationFrame(() => document.getElementById("paragon-ai-question")?.focus({ preventScroll: true }));
  }

  function closeAssistant() {
    const overlay = document.getElementById("paragon-ai-overlay");
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("ai-open");
  }

  /* P-113 — archive-wide assistant: greetings, small talk and website search all work
     without needing to open a website detail first. Reuses the same overlay. */
  function openArchiveAssistant() {
    const overlay = document.getElementById("paragon-ai-overlay");
    if (!overlay) { openDetailAssistant?.("Paragon Archive Hub"); return; }
    currentDetailSite = null;
    const title = document.getElementById("paragon-ai-title");
    const scope = document.getElementById("paragon-ai-scope");
    const messages = document.getElementById("paragon-ai-messages");
    if (title) title.textContent = "Ask Paragon AI";
    if (scope) scope.textContent = "Greetings, chat, and the whole Paragon catalogue — typo-friendly.";
    if (messages) messages.innerHTML = "";
    appendMessage(greetingReply());
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("ai-open");
    requestAnimationFrame(() => document.getElementById("paragon-ai-question")?.focus({ preventScroll: true }));
  }

  function bindUI() {
    const overlay = document.getElementById("paragon-ai-overlay");
    document.getElementById("paragon-ai-close")?.addEventListener("click", closeAssistant);
    /* P-113 owner rule: clicking OUTSIDE a popup never closes it — only the × button (or Esc) does. */
    document.getElementById("paragon-ai-form")?.addEventListener("submit", async event => {
      event.preventDefault();
      const input = document.getElementById("paragon-ai-question");
      const question = input?.value.trim() || "";
      if (!question) return;
      appendMessage(question, "user");
      input.value = "";
      try { window.paragonTrackAiAsk?.(); } catch (_) { /* P-113 daily goal + XP */ }
      if (!currentDetailSite) {
        /* Archive-wide mode: chat answers AND website matches, with tappable results. */
        const response = await ask(question, { mode: "archive-search" });
        appendMessage(response.text, "assistant");
        if (Array.isArray(response.matches) && response.matches.length) {
          const list = document.createElement("div");
          list.className = "paragon-ai-result-list";
          list.innerHTML = response.matches.slice(0, 4).map(match => `<button type="button" data-ai-site="${escapeHTML(match.name)}">◈ ${escapeHTML(match.name)}<small>${escapeHTML(match.reason || "")}</small></button>`).join("");
          document.getElementById("paragon-ai-messages")?.appendChild(list);
          list.querySelectorAll("[data-ai-site]").forEach(button => {
            button.addEventListener("click", () => {
              const siteName = button.getAttribute("data-ai-site");
              closeAssistant();
              if (typeof window.openDetail === "function") window.openDetail(siteName);
            });
          });
          const messages = document.getElementById("paragon-ai-messages");
          if (messages) messages.scrollTop = messages.scrollHeight;
        }
        return;
      }
      const response = await ask(question, { mode: "website-detail", siteName: currentDetailSite });
      appendMessage(response.text, "assistant");
    });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && overlay?.classList.contains("active")) closeAssistant(); });
  }

  window.ParagonAI = {
    liveSiteSignals,
    reviewThemes,
    buildStateText,
    userNeedsText,
    futureText,
    documentationText,
    version: "0.33.0-local",
    modes: modeRegistry,
    rankWebsites, applyIntentRouting, INTENT_ROUTES,
    answerSearch,
    answerDetail,
    answerConversation,
    correctTypos,
    greetingReply,
    ask,
    openDetailAssistant,
    openAssistant: openArchiveAssistant,
    close: closeAssistant,
    getSite: findSite,
    getConfiguration: () => ({ endpoint: window.ParagonConfig?.aiEndpoint || "", externalInferenceEnabled: false, providerSecretsInBrowser: false })
  };

  document.addEventListener("DOMContentLoaded", bindUI);
})();
