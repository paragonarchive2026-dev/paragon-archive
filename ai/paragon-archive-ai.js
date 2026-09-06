/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: paragon-archive-ai.js
  EXPECTED PROJECT PATH: /ai/paragon-archive-ai.js
  ROLE: One secure local Paragon Mind core — the brand AI of Paragon Archive. Powers Archive
        Search intent ranking, the floating tab assistant, website-detail Q&A AND the full
        AI Mode page (platform knowledge: updates, accounts, guests, coins, KYC, leaderboard,
        daily goals, games and documentation).
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
      `Good ${part}! 👋 Hi, I'm Paragon Mind — the brain inside Paragon Archive.`,
      `Hello! 👋 Great to see you. I'm Paragon Mind.`,
      `Hi there! 👋 Welcome — I'm Paragon Mind, your guide around Paragon Archive.`
    ];
    return `${opens[roll]} I know all ${sites.length} Paragon websites (even through typos 🤝), and I can answer about coins, KYC, the leaderboard, your account, games, the latest updates and every documentation page. Try “what can you do?” or search an idea like “I want a tool for invoices”.`;
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
    if (/(who are you|what are you|your name|who is paragon mind|what is paragon mind|who is paragon ai|what is paragon ai|introduce yourself|about you)\b/.test(q)) {
      return { text: `I'm Paragon Mind 💠 — the built-in brand AI of Paragon Archive. I run right inside the app (no external service needed) and I know every Paragon website: what it does, how built it is, its reviews, updates, and how to open it. I also know the platform itself: coins and KYC, the leaderboard, daily goals, games, accounts and guests, the Updates feed and every documentation page. I understand misspelled or vague words, and I never invent facts — if something isn't real yet, I say so honestly.`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    if (/(who (made|created|built|owns|owns?) paragon|who (made|created|built) this|paragon founder|who owns paragon)/.test(q)) {
      return { text: `Paragon Archive is built and run by the Paragon Team (the Paragon founder), with real developer partners joining through the Developer Portal and the 8-point review gate for the Deployed category.`, evidence: ["identity"], confidence: 0.9, mode: "conversation" };
    }
    if (/(what can you do|help me|your features|what do you do|how do you work|how can you help|capabilities)\b/.test(q)) {
      return { text: `Here's what Paragon Mind can do:\n• 🔎 Find a website from any idea or phrase — even misspelled — and tell you why it matches (e.g. “I need something for receipts”).\n• 🪙 Answer coin questions: your live balance, the ₦1 = 2 coins rate, packs, KYC status, withdrawal rules and fees.\n• 🏆 Tell you your real leaderboard position, the current week and how points work.\n• 🎯 Report today's Daily Goals (365 days of missions!) — your progress, streak, and whether today's 1 leaderboard point is earned yet.\n• 🎮 Explain games: free play vs the 1v1 stake desk (100–10,000 coins, server-settled).\n• 🧾 Explain any website: purpose, features, build progress, reviews, updates, price, how to open it.\n• 📄 Answer the official FAQ and documentation: requesting websites, advertising, community, developers, privacy (data, deletion, download), support — where everything lives.\n• 👤 Accounts, guests, email sign-in, passwords, bookmarks, reviews, collections, themes, notifications, achievements.\n• 💬 And real conversation — greetings, pleasantries, jokes, “I'm bored”, “how are you”, thanks. Just talk to me normally!`, evidence: ["identity"], confidence: 1, mode: "conversation" };
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

  /* ============================================================
     P-114 — PARAGON MIND PLATFORM KNOWLEDGE.
     Live facts come from window.ParagonMindLive() (provided by app.js): session
     state, coin balance + config, KYC state, leaderboard position, daily goals,
     and the real Updates feed. Every number is read at answer time — never invented.
     ============================================================ */
  function liveContext() {
    try { return (typeof window !== "undefined" && typeof window.ParagonMindLive === "function") ? window.ParagonMindLive() : null; }
    catch (error) { return null; }
  }
  function fmtNumber(value) { return Number(value || 0).toLocaleString(); }

  /* ============================================================
     P-115 — PLEASANTRIES & GENERAL CONVERSATION.
     The Mind attends to greetings, moods and off-platform questions with
     warm, honest replies — it never dumps a website list on a chat.
     ============================================================ */
  function pleasantriesReply(rawQuestion) {
    const raw = normalize(rawQuestion);
    const q = normalize(correctTypos(rawQuestion));
    if (!q && !raw) return null;
    /* Match the RAW words together with the typo-corrected words — the corrector
       must never eat pleasantries vocabulary ("joke" must not become "note"). */
    const combined = q && raw ? q + " " + raw : (q || raw);
    /* time-of-day greetings */
    if (/^(good |great |fine )?(morning|afternoon|evening|night|day)[ !.]*$/.test(combined) || /^(good (morning|afternoon|evening)) paragon/.test(combined)) {
      const hour = new Date().getHours();
      const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
      return { text: `Good ${part} to you too! 😊 What can I do for you today — find a website, check your coins and leaderboard, or answer a question about Paragon?`, evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    if (/\b(what'?s up|whats up|wassup|how e dey|howfar|how far|what is happening|anything doing)\b|^sup\b|^how far\b/.test(combined)) {
      return { text: `All good on this side! 🙌 The Archive is open, the catalogue has ${sites.length} websites, and I'm ready to help. What's up with YOU — looking for a website, coins, the leaderboard, or just exploring?`, evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    if (/(how (was|is|are) (your|ur) (day|night|week|weekend)|hope (you|ur) (are|re)? ?(fine|good|okay|well))/.test(combined)) {
      return { text: `That's kind of you! 😄 My day is exactly as busy as your questions — which I love. Everything I know is live from the Archive, so I'm always up to date. How can I help yours?`, evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    if (/(i('?m| am) (bored|boring)|nothing to do|entertain me|i need something to do|kill my boredom)/.test(combined)) {
      return { text: `Boredom cure incoming! 🎮 Try Paragon Quiz or Paragon Arcade (free play, no account needed), explore Trending to see what's hot this week, or open a category you've never touched — search "games" or "creative" and see what comes up. Daily Goals also has fresh missions waiting in your Account.`, evidence: ["greeting"], confidence: 0.9, mode: "conversation" };
    }
    if (/(i('?m| am) (tired|exhausted|sleepy)|need (a )?rest|long day)/.test(combined)) {
      return { text: `Rest is productive too. 💙 Take the break — your Paragon activity, coins and streak are saved. When you're back, Paragon Sounds has calm ambient audio for winding down. See you soon!`, evidence: ["greeting"], confidence: 0.9, mode: "conversation" };
    }
    if (/(i('?m| am) (sad|down|unhappy|depressed|stressed|anxious)|feeling (sad|low|down)|bad day)/.test(combined)) {
      return { text: `I'm sorry today feels heavy. 💙 I'm an app assistant, not a professional, so for real support please talk to someone you trust or a professional. If a gentle distraction would help: Paragon Sounds has calming ambience, Paragon Journal lets you put thoughts down, and the Archive will still be here whenever you're ready.`, evidence: ["greeting"], confidence: 0.9, mode: "conversation" };
    }
    if (/(tell me a joke|joke please|make me laugh|say something funny|another joke)/.test(combined)) {
      const jokes = [
        `Why did the website go to the doctor? It had a bad connection. 😄 Want another? I have a whole archive of them… okay, that was the joke.`,
        `I asked the leaderboard for a raise. It said "earn it — one Daily Goal at a time." 😅`,
        `There are 10 types of people: those who understand binary and those who don't. 🤓 Paragon Calc can help either way.`,
        `A guest session walked into a bar… and left 30 minutes later. ⏳ (Guests, you know the pain — sign in!)`
      ];
      return { text: jokes[Math.floor(Math.random() * jokes.length)], evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    if (/(are you (a )?(human|robot|bot|real|person|alive)|am i talking to (a )?(human|bot|robot|ai|real person))/.test(combined)) {
      return { text: `I'm not a human — I'm Paragon Mind 💠, the built-in AI of Paragon Archive. I run entirely inside the app with no outside AI service, and everything I tell you comes from real Paragon data. Think of me as the Archive's brain with good manners. 😊`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    if (/(who (trained|taught|made|built) you|who created you|your (creator|developer|maker|father|mother))/.test(combined)) {
      return { text: `The Paragon Team built and trained me — every rule in my brain was written from the real Archive: the catalogue, the coin rules, the leaderboard, the accounts system and every documentation page. No external AI company is behind me.`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    if (/(how old are you|your age|when (were you|was) you (born|made|created|launched))/.test(combined)) {
      return { text: `Paragon Archive launched on ${LAUNCH_DATE} — that's my birthday too. 🎂 I've been learning the Archive ever since, and every improvement the team ships makes me smarter.`, evidence: ["launchDate"], confidence: 0.95, mode: "conversation" };
    }
    if (/(what'?s your favorite|your best|do you like) (website|site|color|colour|food|music|game|thing)/.test(combined)) {
      return { text: `I don't play favorites — every one of the ${sites.length} websites is equal in my eyes. 😄 But if you want what's genuinely popular right now, open Trending This Week on the Websites tab; and Staff Picks highlights deserving sites with less attention. Tell me what you need and I'll match you to the right website.`, evidence: ["identity"], confidence: 0.9, mode: "conversation" };
    }
    if (/(do you love me|i love you|you'?re (cute|sweet|cool|awesome|the best|amazing)|good (boy|girl|bot|ai))/.test(combined)) {
      return { text: `That's really sweet of you! 💠 I appreciate every user who explores the Archive — now let me earn it: ask me for any website, coin help, or your leaderboard position.`, evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    if (/(you ?(are|re) ?(useless|dumb|stupid|bad|rubbish|trash)|you'?re (useless|dumb|stupid|bad|rubbish|trash)|i hate (you|this|paragon)|this app is (bad|trash|useless))/.test(combined)) {
      return { text: `I hear you, and I'm sorry something didn't work. 😔 That's not the Paragon standard. Tell me what went wrong (or report it from Settings → Help & Support with a screenshot) and the team will fix it — bug reports genuinely shape what gets built next.`, evidence: ["greeting"], confidence: 0.9, mode: "conversation" };
    }
    if (/(happy birthday|congratulations|congrats|well done paragon)/.test(combined)) {
      return { text: `Thank you! 🎉 Days like this make the whole build worth it. Anything I can do for you today?`, evidence: ["greeting"], confidence: 1, mode: "conversation" };
    }
    if (/(what language|which language).*(you speak|support|understand)|do you speak (french|spanish|hausa|yoruba|igbo|pidgin)/.test(combined)) {
      return { text: `I speak English — the Archive's official language. I understand Nigerian expressions like "how far" and common typos though, so type the way you talk and I'll keep up. 😊`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    if (/\bweather\b|will it rain|temperature (outside|today)|what time is it\b|current time\b/.test(combined)) {
      const now = new Date();
      return { text: `I live inside Paragon Archive, so I don't have live weather or outside-world feeds — I'd never guess and present it as fact. 🌤️ For the time: it's ${now.toLocaleTimeString()} on your device's clock (${now.toLocaleDateString()}). When Paragon Weather ships, it'll carry real forecasts.`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    if (/(help me with (my )?homework|do my (homework|assignment)|solve (this|my) (math|equation|problem))/.test(combined)) {
      return { text: `I stay inside Paragon's walls, so I can't do general homework — but Paragon has honest tools for that: Paragon Flash turns your notes into flashcards, Paragon Learn does deep research topics, Paragon Calc handles calculations, and Paragon Quiz tests you properly. Tell me which one fits and I'll point you there.`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    if (/(can i trust you|are you safe|do you steal|my data safe|are you watching|privacy)/.test(combined) && !/policy|delete|download/.test(combined)) {
      return { text: `Yes — and here's the proof: I run 100% inside the app. No outside AI company, no sending your questions anywhere, no secrets in your browser. I only read Paragon's own data (catalogue, your device's Paragon activity) to answer you. Your data is never sold — the Privacy Policy in the Hub explains every word of it.`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    if (/(what should i (do|search|open)|where do i start|i('?m| am) new|first time)/.test(combined)) {
      return { text: `Welcome! 🎉 Start here: 1) tap the search icon and type anything you need ("tool for invoices", "learn coding"); 2) open Website of the Day and Trending to see what's hot; 3) set up your account (or Continue as Guest) so your activity saves; 4) check Daily Goals for today's missions — completing them earns a leaderboard point. Ask me anything along the way!`, evidence: ["identity"], confidence: 1, mode: "conversation" };
    }
    return null;
  }

  /* ============================================================
     P-115 — OFFICIAL FAQ KNOWLEDGE (the Hub's real answers, verbatim-faithful).
     ============================================================ */
  const FAQ_KNOWLEDGE = [
    { keys: [/create (an )?account/, /sign ?up/], a: `Tap the Account tab at the bottom of the screen. You will see options to sign up with Google or with your email. Follow the steps and your account will be ready in under a minute.` },
    { keys: [/forgot (my )?password/, /reset password/, /password recovery/], a: `On the sign-in dialog tap "Forgot Password?" and enter your email address. We will send you a link to reset it. Check your spam folder if you do not see it within a few minutes. You can also change your password anytime from Settings → Change Password (email accounts).` },
    { keys: [/without an account/, /use .* as guest/, /guest mode/, /do i need an account/], a: `Yes — you can browse and open all websites as a Guest. Guest saves, reviews, collections, history and progress are temporary: a Guest session ends after 30 continuous minutes away or offline, or immediately when you choose End Guest Session. If you sign in or create an account before it ends, the live Guest activity merges into your account.` },
    { keys: [/delete (my )?account/], a: `Go to Account → Settings → Privacy & Security → Delete Account. Secure permanent deletion still requires the planned backend deletion workflow, so the current control explains the status honestly instead of claiming your account was deleted. You can contact Privacy support (paragon.archive.2026@gmail.com, subject "Privacy") while that workflow is pending.` },
    { keys: [/download (my )?data/], a: `Yes. Account → Settings → Privacy & Security → "Download My Data" prepares a file with the data currently available to your browser and account. Passwords and authentication tokens are excluded.` },
    { keys: [/why (is|does) (a )?(website|site) (not loading|block)|website not loading|site (won'?t|wont|does ?n'?t) load|preview (blocked|not loading)/], a: `This is usually temporary, or the website blocks embedded previews through its security policy. Try refreshing, closing and reopening it, or use "Open in New Tab". If it continues, report it with the Bug Report form (Hub → Reporting a Bug) including the website name and your browser.` },
    { keys: [/how do i (save|bookmark)/, /save (a )?website/, /bookmark/], a: `Open the website's detail page and tap the Bookmark action. Saves appear under "Saved & Bookmarked" in your Account tab and sync with your account; Guest saves last only for the current session. You can also organize saved sites into Collections.` },
    { keys: [/how do i (write|leave) a review/, /write review/], a: `Open the website detail page and scroll to Ratings & Reviews. Tap "Write a Review", choose your stars, write your thoughts and submit. Account reviews can sync; Guest reviews are temporary for the session.` },
    { keys: [/request (a )?(website|site).*(exist|does ?n'?t|not exist)/, /website i want does ?n'?t exist/, /suggest (a )?(website|idea)/], a: `Go to Settings → "💬 Request a Website" (or the Hub's Request a Website page). Each account can submit one request in every rolling seven-day period — Paragon schedules construction by real demand, so the most-requested ideas get built first.` },
    { keys: [/notifications? (for|on|about) (a )?website/, /turn on notification/, /website updates? notification/], a: `Save the website first, then go to Account → Settings → Notifications. Saved-website updates are highlighted in the Updates tab. Optional email delivery becomes available after the production notification service is activated.` },
    { keys: [/dark mode|light mode|change theme|switch theme/], a: `Go to Account → Settings → Dark Mode toggle, or use the theme button in the top bar. You can switch between dark and light anytime — the site defaults to dark mode and remembers your choice.` },
    { keys: [/opt out of analytics/, /analytics tracking/, /stop tracking/], a: `Go to Account → Settings → Privacy & Security → Privacy Controls and turn off Analytics Tracking (and Tracking Cookies). Analytics scripts are not currently connected, and any future integration must respect those switches.` },
    { keys: [/is paragon (archive )?free/, /does it cost/, /do i (have to )?pay/], a: `Yes — Paragon Archive and every Paragon-built website are intended to remain completely free, and creating an account is free. Future approved Deployed websites may offer clearly labelled premium features under the Deployed rules; those transactions are not handled by Paragon. Coins are only for optional competitive play.` },
    { keys: [/will it always be free/, /always free/], a: `That is the plan and the promise. Paragon exists to make things free and easy for everyone. The plan to keep the lights on is optional ads that YOU control — no advertising scripts are connected today, and any future integration must respect your consent choices.` }
  ];
  function faqAnswer(rawQuestion) {
    const q = normalize(correctTypos(rawQuestion));
    if (!q) return null;
    for (const entry of FAQ_KNOWLEDGE) {
      if (entry.keys.some(pattern => { try { return pattern.test(q); } catch (error) { return false; } })) {
        return { text: entry.a, evidence: ["official FAQ"], confidence: 1, mode: "platform" };
      }
    }
    return null;
  }


  const PLATFORM_INTENTS = [
    { key: "kyc", pattern: /\bkyc\b|verify (my )?identity|team approv|payout details|why (can'?t|cannot) i (buy|withdraw|see the account)/i },
    { key: "coins", pattern: /\bcoins?\b|naira|₦|buy coins|withdraw|sell(ing)? coins|conversion|exchange rate|wallet|coin pack|balance|top ?up|purchase|how much (is|are|do)/i },
    { key: "leaderboard", pattern: /leader ?board|my rank|ranking|what position|points|top of the week|weekly board|am i (on|winning)/i },
    { key: "daily", pattern: /daily (task|goal|mission)|streak|xp\b|tasks? today|my tasks?/i },
    { key: "games", pattern: /\bgames?\b|arcade|quiz|chess|1 ?v ?1|stake|compete|competition|tournament|play (a |some )?game|free play/i },
    { key: "account", pattern: /account|sign ?up|sign ?in|log ?in|log ?out|register|password|profile|display name|username|create (an )?account|verify (my )?email|continue with (google|email)/i },
    { key: "guest", pattern: /guest|continue as guest|without an account|30 minutes|session expir/i },
    { key: "updates", pattern: /updates?|news|what'?s new|announcement|changelog|new version|release notes|recently (added|changed)/i },
    { key: "docs", pattern: /how (do|can|does) (i|you|we|paragon)|where (is|are|can|do)|documentation|\bdocs\b|advertise|ad space|advertis|request (a|the|new) (website|site|page)|community|developer|privacy|terms|cookie policy|faq|support|contact|help me with|guide|tutorial|how (to|about)/i },
    { key: "install", pattern: /install|add to home|\bpwa\b|download paragon|install paragon|offline mode|works offline/i },
    { key: "achievements", pattern: /achievement|badge|unlock stage|milestone/i },
    { key: "leaderboardRules", pattern: /how (do|does) (points|leaderboard|ranking) work|earn points/i }
  ];

  function detectPlatformIntent(rawQuestion) {
    const query = normalize(rawQuestion);
    if (!query) return [];
    return PLATFORM_INTENTS.filter(intent => {
      try { return intent.pattern.test(query); } catch (error) { return false; }
    }).map(intent => intent.key);
  }

  function coinsAnswer(question) {
    const context = liveContext();
    const coins = (context && context.coins) || {};
    const kyc = (context && context.kyc) || {};
    const rateIn = coins.rateBuy || 2;
    const rateOut = coins.rateOut || rateIn;
    const packs = Array.isArray(coins.packs) && coins.packs.length
      ? coins.packs
      : [{ naira: 500, coins: 500, label: "Starter" }, { naira: 1000, coins: 1000, label: "Standard" }, { naira: 5000, coins: 5000, label: "Pro" }];
    const packLine = packs.map(pack => `₦${fmtNumber(pack.naira)} → ${fmtNumber(pack.coins || Math.round(pack.naira * rateIn))} coins${pack.label ? ` (${pack.label})` : ""}`).join(" · ");
    if (/(how much|how many).*(coin|have|balance)|my (coin )?balance|current amount|what do i have/i.test(question)) {
      if (context && context.session && context.session.mode === "none") {
        return { text: `You're browsing without a session right now, so there's no coin balance to read. Continue as Guest or sign in from the Account tab, then I can see your exact balance. The locked conversion stays the same: ₦1 = ${rateIn} coins.`, evidence: ["live coins"], confidence: 1, mode: "platform" };
      }
      return { text: `Your Paragon Coin balance right now: ${fmtNumber(coins.available)} available${coins.locked ? ` · ${fmtNumber(coins.locked)} locked (in withdrawal requests)` : ""}${coins.pending ? ` · ${fmtNumber(coins.pending)} pending` : ""}${coins.restricted ? ` · ${fmtNumber(coins.restricted)} restricted` : ""}. Conversion rate is locked at ₦1 = ${rateIn} coins when buying${rateOut !== rateIn ? ` and ${rateOut} coins per ₦1 when redeeming` : ""} — so your available balance is worth about ₦${fmtNumber(Math.floor(coins.available / rateOut))}. You can buy or withdraw from the 🪙 Paragon Coins box in your Account.`, evidence: ["live coins"], confidence: 1, mode: "platform" };
    }
    if (/withdraw|sell|cash out|payout/i.test(question)) {
      const kycBit = kyc.status === "approved" ? "Your KYC is approved, so withdrawals are unlocked for you." : kyc.status === "pending" ? "⚠️ Your KYC is still PENDING team review — withdrawals (and the Paragon payout account details) stay locked until the team approves it." : "⚠️ You haven't completed KYC yet. Complete it first (Account → Paragon Coins → KYC): withdrawals need an APPROVED KYC.";
      return { text: `Selling / withdrawing coins:\n• Withdrawals are paid ONLY to your saved OPay or Moniepoint account, which comes from your KYC payout details.\n• ${kycBit}\n• Minimum withdrawal: ${fmtNumber(coins.minWithdrawCoins || 500)} coins (₦${fmtNumber(Math.floor((coins.minWithdrawCoins || 500) / rateOut))}).\n• Withdrawals below ₦10,000 pay NO Paragon fee; ₦10,000+ carries a ₦50 fee (that's ${fmtNumber(coins.feeCoins || 100)} coins at the locked rate).\n• Limits: max 2 requests per 24 hours and 5 per 7 days.\n• A request LOCKS the coins first; if it fails or is cancelled they're returned — money is never trapped.\nOpen the Paragon Coins box → Sell / Withdraw to start.`, evidence: ["live coins", "wallet rules"], confidence: 1, mode: "platform" };
    }
    if (/buy|purchase|top ?up|pack|how (do|can|to) get coins/i.test(question)) {
      const kycBit = kyc.status === "approved" ? "✅ Your KYC is approved — you'll see the Paragon payment account as soon as you pick a pack." : kyc.status === "pending" ? "⚠️ KYC is PENDING team review. The Paragon payment account number stays LOCKED until the team approves your KYC — pick your rail (OPay or Moniepoint) as part of KYC, not before." : "First step: complete KYC (Account → Paragon Coins → KYC). The Paragon payment account only appears AFTER the team approves it — Paragon never assumes your rail before then.";
      return { text: `Buying Paragon Coins:\n• Packs: ${packLine}.\n• Locked conversion: ₦1 = ${rateIn} coins.\n• Tap a pack to REQUEST it — nothing is ever auto-credited. You transfer to the Paragon account, then claim with your receipt; the team verifies and credits.\n• ${kycBit}`, evidence: ["live coins", "KYC"], confidence: 1, mode: "platform" };
    }
    return { text: `Paragon Coins, quickly:\n• Locked rate: ₦1 = ${rateIn} coins.\n• Packs right now: ${packLine}.\n• ${kyc.status === "approved" ? "Your KYC is approved ✅" : kyc.status === "pending" ? "Your KYC is pending team review ⏳" : "KYC is required before buying or withdrawing — not done yet ⚠️"}.\n• Free play never needs coins — they're only for optional competitive play and rewards.\nAsk me “how many coins do I have?”, “how do withdrawals work?” or “what is KYC?” for the details.`, evidence: ["live coins"], confidence: 1, mode: "platform" };
  }

  function kycAnswer() {
    const context = liveContext();
    const kyc = (context && context.kyc) || {};
    const stateText = kyc.status === "approved" ? "✅ APPROVED — buying and withdrawing are fully unlocked for you, and the Paragon payment account is visible." : kyc.status === "pending" ? "⏳ PENDING — the team is reviewing it. The Paragon payment account number stays locked until they approve." : "⚠️ NOT STARTED — you need to complete it before any buy or withdraw flow works.";
    return { text: `KYC (Know Your Customer) is the one-time identity check Paragon requires for BOTH buying coins and withdrawing. You provide your name, phone, and your OPay or Moniepoint account details (Account tab → Paragon Coins → KYC). The Paragon Team then reviews and approves it from their side.\nYour KYC status: ${stateText}\nUntil it's approved: the Paragon payment account number is LOCKED (Paragon won't assume your rail), buy requests can't proceed, and withdrawals stay closed. It exists to keep real-money movement verifiable and safe — coins only move after a human-verified transfer.`, evidence: ["KYC"], confidence: 1, mode: "platform" };
  }

  function leaderboardAnswer() {
    const context = liveContext();
    const board = (context && context.leaderboard) || {};
    let weekText = "";
    try {
      if (window.ParagonLeaderboards?.currentWeekKey) weekText = ` The current leaderboard week is ${window.ParagonLeaderboards.currentWeekKey()}.`;
    } catch (error) { weekText = ""; }
    if (board.rank && board.rank > 0) {
      return { text: `Your leaderboard position right now: #${board.rank}${board.points != null ? ` with ${fmtNumber(board.points)} points` : ""}${board.total ? ` out of ${fmtNumber(board.total)} ranked players` : ""}.${weekText} Points come from two honest paths: verified staked competition results, and exactly 1 point per day for completing all of that day's Daily Goals — nothing else ever ranks, and nothing is invented. The board resets each week.`, evidence: ["live leaderboard"], confidence: 1, mode: "platform" };
    }
    return { text: `You're not on the leaderboard right now — but the easiest first point is one tap away: complete today's 3 Daily Goals (🎯 in your Account) and you earn exactly 1 point for the day. Competition points additionally come from verified staked results${(context && context.session && context.session.mode) === "guest" ? ". Guests: finish the goals, then sign in before the session ends — the banked point posts automatically" : ""}.${weekText} Open the leaderboard from your Account to see the current week's full table.`, evidence: ["live leaderboard"], confidence: 1, mode: "platform" };
  }

  function dailyAnswer() {
    const context = liveContext();
    const daily = (context && context.daily) || {};
    const done = Number(daily.done || 0), total = Number(daily.total || 0) || 3;
    const pointLine = daily.pointEarnedToday
      ? "You've already earned today's 1 leaderboard point ✅ — come back tomorrow for three fresh missions."
      : done === total && total > 0
        ? "All done — your +1 point is being claimed right now! 🏆"
        : `Complete all ${total} of today's missions to earn exactly 1 leaderboard point for the day.`;
    return { text: `🎯 Daily Goals — a full YEAR of missions (365 days, three new tasks every day: explore a website, a tracked action, and a category or documentation read). You never see the whole year at once; each day unlocks its own set.
Today: ${done}/${total} done${daily.streak ? ` · 🔥 ${daily.streak}-day streak` : ""} · Day ${daily.dayOfCycle || "?"} of 365 · ${Number(daily.pointsTotal || 0)} point${Number(daily.pointsTotal || 0) === 1 ? "" : "s"} earned so far.
${pointLine}
${(context && context.session && context.session.mode) === "guest" ? "Guest note: today's point is banked in this session — sign in before it ends and it posts to the leaderboard automatically; if the session expires first, that progress is honestly lost." : "Signed-in users: the point posts straight to the weekly leaderboard. Open the 🎯 Daily Goals box in your Account to see today's missions."}`, evidence: ["live daily goals"], confidence: 1, mode: "platform" };
  }

  function gamesAnswer() {
    const context = liveContext();
    const coins = (context && context.coins) || {};
    return { text: `Games on Paragon Archive:\n• 🕹️ FREE PLAY — always available, no coins, no account needed: Paragon Quiz, Paragon Arcade, Paragon Chess, Paragon Cards and the other game destinations in the catalogue (search "games" to see them all).\n• ⚔️ 1v1 COMPETITIVE STAKE — optional real-coin mode (100–10,000 coins per match) from Settings → "1v1 competitive stake". Stakes lock on the SERVER, the house fee is 5% of the two-player pool, and only the Paragon Team settles winners — your browser can never credit a win.\n• 🏆 Leaderboard points come ONLY from verified staked competitions.\nYou have ${fmtNumber(coins.available)} coins available for staking${coins.available < 100 ? " — you'd need at least 100 to stake" : ""}.`, evidence: ["games", "live coins"], confidence: 1, mode: "platform" };
  }

  function accountAnswer(question) {
    const context = liveContext();
    const session = (context && context.session) || {};
    const status = session.mode === "account" ? `You're signed in${session.name ? ` as ${session.name}` : ""}.` : session.mode === "guest" ? "You're currently in a Guest session." : "You're browsing without a session right now.";
    if (/continue with email|email (sign|sign|account|auth)|sign ?in with email/i.test(question)) {
      return { text: `Continue with Email: open the Account tab → "Continue with Email". Sign-in and sign-up are tabs in the same dialog — sign up needs your email, a display name and a password (min 6 characters). After signing up you verify your email, then everything (saves, reviews, collections, coins, progress) syncs to your one Paragon account. If a guest session is active, its activity merges into the account when you sign in on the same device. ${status}`, evidence: ["account"], confidence: 1, mode: "platform" };
    }
    if (/password|forgot/i.test(question)) {
      return { text: `Passwords: use "Continue with Email" → the password field (min 6 characters). Forgot it? Use the "Forgot password?" link in that dialog to receive a reset email. You can change your password anytime from Settings → "Change Password" (email accounts only). Passwords are hashed before storage — even the team can't see yours. ${status}`, evidence: ["account"], confidence: 1, mode: "platform" };
    }
    return { text: `Accounts on Paragon Archive:\n• Create one from the Account tab — "Continue with Google" (one tap) or "Continue with Email" (email + password, verify once).\n• "Continue as Guest" lets you explore immediately with a session that lasts 30 minutes away/offline; guest activity moves into your account when you sign in on the same device.\n• One account works across every Paragon website: saves, reviews, needs, collections, coins and achievements follow you.\n• Edit your display name with the ✏️ button; log out from the Account header.\n${status}`, evidence: ["account"], confidence: 1, mode: "platform" };
  }

  function guestAnswer() {
    return { text: `Guest mode: tap "Continue as Guest" on the Account tab. It's a session-only way to explore — you can browse, open websites, save, review and even play free games. Two honest rules: a guest session expires after 30 minutes away or offline, and guest activity is never ranked on the leaderboard. The moment you sign in (Google or Email) on the same device, your guest activity merges into the real account.`, evidence: ["guest"], confidence: 1, mode: "platform" };
  }

  function updatesAnswer(question) {
    const context = liveContext();
    const updates = (context && Array.isArray(context.updates) ? context.updates : []).slice(0, 4);
    const latest = updates.length
      ? updates.map((entry, index) => `${index + 1}. ${entry.title}${entry.date ? ` (${entry.date})` : ""} — ${entry.desc}`).join("\n")
      : "No update events are recorded on this device right now — the public feed grows as the team publishes announcements.";
    if (/latest|recent|new|what'?s new|now/i.test(question)) {
      return { text: `Latest from the real Updates feed:\n${latest}\nOpen the Updates tab for the full timeline with filters (new websites, version updates, announcements) — everything there describes things that REALLY happened.`, evidence: ["live updates"], confidence: 1, mode: "platform" };
    }
    return { text: `The Updates tab is Paragon Archive's honest changelog: new websites added to the catalogue, real version updates for genuinely shipped products, and Team announcements. You can filter by type and category. Latest entries:\n${latest}`, evidence: ["live updates"], confidence: 1, mode: "platform" };
  }

  function docsAnswer(question) {
    const query = normalize(question);
    if (/request (a |the |new )?(website|site|page)|suggest (a |an )?(website|idea)|wish (there was|this)/i.test(query)) {
      return { text: `Requesting a website: open Settings → "💬 Request a Website" (or the Archive Hub → Request a Website page). Give the name, a category, why you need it and the problem it solves. Every request is real — Paragon schedules construction by demand, and the most-requested websites get built first. You'll be notified if yours gets built.`, evidence: ["docs"], confidence: 1, mode: "platform" };
    }
    if (/advertise|ad space|ads|sponsor|promote/i.test(query)) {
      return { text: `Advertising on Paragon Archive: ad slots exist but stay dormant and honestly-labelled until a consent-aware ad service is approved. To advertise with Paragon or discuss sponsored placements, email paragon.archive.2026@gmail.com with the subject line "Advertising" — the team responds within 72 hours. Users keep full control: ad personalization stays OFF unless allowed in Privacy Controls.`, evidence: ["docs"], confidence: 1, mode: "platform" };
    }
    if (/community/i.test(query)) {
      return { text: `The Paragon Community: join from Settings → "👥 Paragon Community". Membership is a real 4-step process — complete your community profile, read the Community Guidelines, accept them, then join. Members get the Community Board (posts and real conversation). The guidelines keep it respectful; breaking them is handled by the team.`, evidence: ["docs"], confidence: 1, mode: "platform" };
    }
    if (/developer/i.test(query)) {
      return { text: `Becoming a Paragon developer: the Deployed programme lets approved developers publish websites inside the Archive. Read the requirements in the Archive Hub (Developer Requirements & Acceptance — including the real 8-point review gate), then apply on the Developer Portal. Approved websites join the public Deployed category with clear premium disclosure. Applications are reviewed by the team.`, evidence: ["docs"], confidence: 1, mode: "platform" };
    }
    if (/privacy|my data|delete account|download my data|tracking/i.test(query)) {
      return { text: `Privacy on Paragon: your data is never sold or traded. You control it from Settings → Privacy & Security: analytics tracking, tracking cookies and ad personalization each stay OFF unless you allow them, and you can Download My Data or Delete Account. Full details live in the Archive Hub's Privacy Policy (14 short sections, plain language). Security questions go to paragon.archive.2026@gmail.com with subject "Account Security".`, evidence: ["docs"], confidence: 1, mode: "platform" };
    }
    if (/terms|rules of using|conditions/i.test(query)) {
      return { text: `The Terms and Conditions (Archive Hub → Terms) are the honest rules for using Paragon Archive: what's free, how accounts and coins work, community standards and what happens with misuse. Plain-language reading, no traps.`, evidence: ["docs"], confidence: 1, mode: "platform" };
    }
    if (/support|contact|help|bug|problem|stuck|email/i.test(query)) {
      return { text: `Help & Support: Settings → "🆘 Help & Support", or the Hub's Help page. Real people answer within 72 hours. For bugs there's a dedicated bug-report guide (what counts as a bug, what to include) and a message form with optional screenshot. Direct email: paragon.archive.2026@gmail.com — change the subject line to match your need (Privacy, Account Security, Advertising…). The FAQ answers the most common questions about accounts, websites, notifications and pricing.`, evidence: ["docs"], confidence: 1, mode: "platform" };
    }
    if (/install|pwa|app|add to home|offline/i.test(query)) {
      return { text: `Installing Paragon Archive: Settings → "📲 Install Paragon Archive" walks you through adding it to your home screen (it's a PWA — no store needed), including the app permissions explained honestly. Installed, it opens full-screen and keeps working offline for the pages you've visited.`, evidence: ["docs"], confidence: 1, mode: "platform" };
    }
    return { text: `Every official document lives in the Archive Hub: About, Privacy Policy, Terms, Community Guidelines, Cookie Policy, Help & Support, Bug reporting, FAQ, How to use Paragon Archive, Request a Website, the Roadmap, and Developer Requirements. From the app: Settings → "Paragon Archive Hub", or search in the Articles tab of Search. Ask me about any of them by name — e.g. "how do I request a website?" or "how do I advertise on Paragon?"`, evidence: ["docs"], confidence: 1, mode: "platform" };
  }

  function achievementsAnswer() {
    return { text: `Achievements unlock in stages of up to five tasks from REAL activity — first visit, first rating, first review, sharing, signing in, daily goals, product use, asking me, opening the leaderboard. Finish a stage to reveal the next ("More Soon" shows the live count remaining). Badges give XP, recognition and perks — never cash. See them all in Account → Achievements (the ℹ️ button explains every badge).`, evidence: ["achievements"], confidence: 1, mode: "platform" };
  }

  function answerPlatform(rawQuestion) {
    const question = String(rawQuestion || "");
    const intents = detectPlatformIntent(question);
    if (!intents.length) return null;
    /* Priority: the most specific money/identity answers first. */
    if (intents.includes("kyc")) return kycAnswer();
    if (intents.includes("coins")) return coinsAnswer(question);
    if (intents.includes("leaderboardRules") && !intents.includes("leaderboard")) return leaderboardAnswer();
    if (intents.includes("leaderboard")) return leaderboardAnswer();
    if (intents.includes("daily")) return dailyAnswer();
    if (intents.includes("games")) return gamesAnswer();
    if (intents.includes("guest")) return guestAnswer();
    if (intents.includes("account")) return accountAnswer(question);
    if (intents.includes("updates")) return updatesAnswer(question);
    if (intents.includes("install")) return docsAnswer("install");
    if (intents.includes("achievements")) return achievementsAnswer();
    if (intents.includes("docs")) return docsAnswer(question);
    return null;
  }

  /* P-114 — does this input actually look like a WEBSITE search? Stops the assistant
     from dumping a website list for every question a user asks. */
  function looksLikeWebsiteSearch(query) {
    const clean = String(query || "").trim();
    if (!clean) return false;
    if (detectPlatformIntent(clean).length) {
      /* A platform intent only wins if the phrasing isn't clearly product-shaped. */
      if (!/(i (want|need|looking for)|find (me|a)|a (tool|website|app) (for|that)|something (for|to)|website (for|about)|open|show me)/i.test(clean)) return false;
    }
    const ranked = rankWebsites(clean, { limit: 3, minimumScore: 60 });
    if (!ranked.length) return false;
    const top = ranked[0];
    return (top.confidence >= 0.45 || top.similarity >= 0.5 || top.intentRouted || top.keywordMatched);
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
    const chat = answerConversation(question) || pleasantriesReply(question);
    if (chat) {
      return { ...chat, site: site.name, mode: "website-detail" };
    }
    const detailFaq = faqAnswer(question);
    if (detailFaq && /account|password|guest|bookmark|review|notification|theme|analytics|free|download|delete/.test(query)) {
      return { ...detailFaq, site: site.name, mode: "website-detail" };
    }
    const features = site.features || site.updates || [];
    const status = site.previewOnly ? "concept preview while the real product is still being built" : site.name === "Paragon Archive Hub" ? "available Archive Hub page" : "configured destination";
    let text;
    let evidence = ["name", "description"];
    if (/^\s*(hi|hey|hello|yo|sup|howdy|good\s*(morning|afternoon|evening)|what'?s\s*up|how\s*(are|far)\s*(you|things)?)\b[\s!,.?]*$/i.test(String(question || ""))) {
      text = `Hello! 👋 I'm Paragon Mind, and I know ${site.name} inside out. I can tell you its purpose, features, full documentation, build state (how close it is to being built), what users need most, likely future updates, version, price, or how to open it. What would you like to know?`;
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
      /* P-114 — platform questions (coins, KYC, leaderboard, account…) get real answers
         even inside a website detail — the Mind knows the whole platform. */
      const platform = answerPlatform(question);
      if (platform && detectPlatformIntent(question).length) {
        return { ...platform, site: site.name, mode: "website-detail" };
      }
      text = `I want to stay exactly on topic for ${site.name}, so tell me which of these you need: purpose · features · full documentation · build state (how close it is) · what users need most · future updates · version & what's new · price · how to open it. Or say "everything about this site" and I'll give the complete picture.`;
      evidence = ["scope"];
    }
    return { text, evidence, confidence: 1, site: site.name, mode: "website-detail" };
  }

  function answerSearch(question) {
    /* P-113/P-114/P-115 — routing order: greetings & small talk → pleasantries →
       official FAQ → PLATFORM knowledge (coins, KYC, leaderboard, accounts, games,
       updates, docs) → website matches. A plain question never gets a website list. */
    const chat = answerConversation(question) || pleasantriesReply(question);
    if (chat) return chat;
    const faq = faqAnswer(question);
    if (faq) return faq;
    const platform = answerPlatform(question);
    /* A clearly product-shaped search ("find me a drawing app") keeps its website
       results even when a platform word slipped in; platform answers win otherwise. */
    if (platform && !looksLikeWebsiteSearch(question)) return platform;
    if (platform && (platform.mode !== "platform" || !/(find|show|open|search|look(ing)? for|a tool|an? app|website|site for)/i.test(normalize(question)))) {
      if (!looksLikeWebsiteSearch(question)) return platform;
    }
    if (!looksLikeWebsiteSearch(question)) {
      /* Not clearly a website search either: honest Request fallback (contract kept from P-113). */
      return { text: `I didn't catch a clear website or Paragon question in that. I can find any of the ${sites.length} Paragon websites from an idea (“I need a tool for invoices”), or answer about coins, KYC, the leaderboard, your account, games, updates and the documentation. If you were describing a website that should exist, submit it through Request a Website — the most-requested ideas get built first.`, matches: [], requestSuggested: true, confidence: 0, mode: "archive-search" };
    }
    const ranked = rankWebsites(question, { limit: 5, minimumScore: 40 }).filter(entry => entry.confidence >= 0.25 || entry.similarity >= 0.4);
    if (!ranked.length) return { text: "I could not find a confident website match. Paragon is building more, so you can submit the idea through Request a Website (Archive Hub → Request a Website).", matches: [], requestSuggested: true, confidence: 0, mode: "archive-search" };
    const matches = ranked.map(entry => ({ name: entry.site.name, reason: entry.reasons.join(", ") || entry.site.desc, confidence: entry.confidence }));
    return { text: `The closest match is ${matches[0].name}.`, matches, requestSuggested: false, confidence: matches[0].confidence, mode: "archive-search" };
  }

  /* P-114 — AI MODE (its own results page beside All): the FULL Archive brain.
     Conversational + platform + website knowledge in one answer. */
  async function askMode(question) {
    const chat = answerConversation(question) || pleasantriesReply(question);
    if (chat) return chat;
    const faq = faqAnswer(question);
    if (faq) return faq;
    const platform = answerPlatform(question);
    if (platform && !looksLikeWebsiteSearch(question)) return platform;
    const search = await ask(question, { mode: "archive-search" });
    if (platform && search.requestSuggested) return platform;
    if (platform && (!search.matches || !search.matches.length)) return platform;
    if (platform) {
      const combined = { ...platform };
      combined.text = `${platform.text}\n\nAlso matching your words in the catalogue: ${(search.matches || []).slice(0, 3).map(match => match.name).join(", ")}.`;
      combined.matches = search.matches || [];
      return combined;
    }
    return search;
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
    appendMessage(`Hello! 👋 I'm Paragon Mind. I know ${site.name} inside out — purpose, features, build state, reviews, updates and how to open it — and I understand typos and casual chat too. What would you like to know?`);
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
    if (title) title.textContent = "Ask Paragon Mind";
    if (scope) scope.textContent = "Websites, coins, KYC, leaderboard, accounts, games, updates — typo-friendly.";
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
    version: "0.34.0-local",
    name: "Paragon Mind",
    modes: modeRegistry,
    rankWebsites, applyIntentRouting, INTENT_ROUTES,
    answerSearch,
    answerDetail,
    answerConversation,
    answerPlatform,
    detectPlatformIntent,
    looksLikeWebsiteSearch,
    correctTypos,
    greetingReply,
    ask,
    askMode,
    openDetailAssistant,
    openAssistant: openArchiveAssistant,
    close: closeAssistant,
    getSite: findSite,
    getConfiguration: () => ({ endpoint: window.ParagonConfig?.aiEndpoint || "", externalInferenceEnabled: false, providerSecretsInBrowser: false })
  };

  document.addEventListener("DOMContentLoaded", bindUI);
})();
