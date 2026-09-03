/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: catalogue-expansion-45-100.js
  EXPECTED PROJECT PATH: /data/catalogue-expansion-45-100.js
  ROLE: Declarative Entertainment, Games, Finance, Lifestyle, Developer, and Originals catalogue continuation (45–100).
  RESTORE/LOAD NOTE: Restore under data/. Load after data/catalogue-expansion.js and before updates, metrics, and app.js.
*/

(() => {
  const definitions = [
    { name: "Paragon Music", group: "Entertainment & Media", category: "Media", inside: "Music player", features: ["Playlists", "Shuffle", "Repeat", "Equalizer", "Synced lyrics display", "Favorites"], icon: "🎵", tag: "Music" },
    { name: "Paragon Radio", group: "Entertainment & Media", category: "Media", inside: "Internet radio", features: ["Live stations by genre", "Favorites", "Now playing information", "Background play"], icon: "📻", tag: "Radio" },
    { name: "Paragon Beats", group: "Entertainment & Media", category: "Entertainment", inside: "Beat maker", features: ["Drum pads", "Loops", "Sequencer", "Tempo control", "Export audio", "Share beats"], icon: "🥁", tag: "Beat Making" },
    { name: "Paragon Watch", group: "Entertainment & Media", category: "Media", inside: "Video platform", features: ["Upload videos", "Streaming", "Likes and comments", "Subscriptions", "Channels", "Built-in short clip creator"], icon: "▶️", tag: "Video" },
    { name: "Paragon Read", group: "Entertainment & Media", category: "Media", inside: "Reading platform", features: ["eBooks", "Articles", "Bookmarks", "Reading progress", "Night mode", "Font controls"], icon: "📚", tag: "Reading" },
    { name: "Paragon Comics", group: "Entertainment & Media", category: "Media", inside: "Comics hub", features: ["Read comic strips", "Create comic strips", "Panels", "Templates"], icon: "💥", tag: "Comics" },
    { name: "Paragon Anime", group: "Entertainment & Media", category: "Media", inside: "Anime tracker", features: ["Anime database", "Watchlist tracking", "Ratings", "Reviews", "Recommendations"], icon: "🌸", tag: "Anime" },
    { name: "Paragon Movie", group: "Entertainment & Media", category: "Media", inside: "Movie database", features: ["Movie information", "Trailers", "Reviews", "Watchlist", "Ratings", "Recommendations"], icon: "🎬", tag: "Movies" },
    { name: "Paragon Podcast", group: "Entertainment & Media", category: "Media", inside: "Podcast player", features: ["Browse podcasts", "Play episodes", "Playlists", "Speed control", "Bookmarks"], icon: "🎙️", tag: "Podcasts" },
    { name: "Paragon Stories", group: "Entertainment & Media", category: "Media", inside: "Story platform", features: ["Write short stories", "Read community stories", "Genres", "Featured stories", "Comments"], icon: "📕", tag: "Stories" },
    { name: "Paragon Mixes", group: "Entertainment & Media", category: "Entertainment", inside: "DJ mixing tool", features: ["Two decks", "Crossfader", "BPM sync", "Effects", "Transitions", "Record mix"], icon: "🎚️", tag: "DJ" },
    { name: "Paragon Sounds", group: "Entertainment & Media", category: "Entertainment", inside: "Ambient sound mixer", features: ["Rain", "Forest", "Fire", "Ocean", "City", "Custom mix", "Timer", "Background play"], icon: "🎧", tag: "Ambient Audio" },
    { name: "Paragon Theater", group: "Entertainment & Media", category: "Entertainment", inside: "Screenplay writer", features: ["Script format templates", "Character manager", "Scene builder", "Export to PDF"], icon: "🎭", tag: "Screenwriting" },

    { name: "Paragon Puzzle", group: "Games", category: "Games", inside: "Puzzle games hub", features: ["Jigsaw", "Sliding puzzles", "Sudoku", "Word scramble", "Crossword", "Brain teasers"], icon: "🧩", tag: "Puzzles" },
    { name: "Paragon Chess", group: "Games", category: "Games", inside: "Chess", features: ["Play versus AI", "Multiple difficulties", "Move hints", "Game history"], icon: "♟️", tag: "Chess" },
    { name: "Paragon Cards", group: "Games", category: "Games", inside: "Card games", features: ["Solitaire", "Snap", "Memory match", "Blackjack", "Card flip"], icon: "🃏", tag: "Card Games" },
    { name: "Paragon Trivia", group: "Games", category: "Games", inside: "Trivia game show", features: ["Categories", "Timed questions", "Streak scoring", "Leaderboard"], icon: "🎤", tag: "Trivia" },
    { name: "Paragon Arcade", group: "Games", category: "Games", inside: "Mini arcade", features: ["Snake", "Tetris", "Breakout", "Space Invaders", "Pac-Man-style games"], icon: "🕹️", tag: "Arcade" },
    { name: "Paragon Race", group: "Games", category: "Games", inside: "Racing game", features: ["Browser racing", "Keyboard controls", "Tracks", "Time trial"], icon: "🏎️", tag: "Racing" },
    { name: "Paragon RPG", group: "Games", category: "Games", inside: "Text adventure", features: ["Story-driven choices", "Inventory", "Stats", "Multiple endings"], icon: "🗡️", tag: "RPG" },
    { name: "Paragon Draw", group: "Games", category: "Games", inside: "Drawing game", features: ["Pictionary-style play", "Word prompts", "Drawing", "Guess other drawings"], icon: "✏️", tag: "Drawing Game" },
    { name: "Paragon Spin", group: "Games", category: "Games", inside: "Random picker", features: ["Spin wheel", "Coin flip", "Dice roll", "Random number", "Random name"], icon: "🎡", tag: "Random Picker" },
    { name: "Paragon Bet", group: "Games", category: "Games", inside: "Prediction tracker", features: ["Friendly predictions", "Track results", "Friends leaderboard"], icon: "🎯", tag: "Predictions" },
    { name: "Paragon Survival", group: "Games", category: "Games", inside: "Survival adventure", features: ["Text survival scenarios", "Choose your path", "Resource management"], icon: "🧭", tag: "Survival" },

    { name: "Paragon Budget", group: "Finance & Business", category: "Finance", inside: "Finance hub", features: ["Expense tracker", "Income tracker", "Built-in bill splitter", "Salary calculator", "Tax estimator", "Budget goals", "Charts"], icon: "💵", tag: "Budgeting" },
    { name: "Paragon Invoice", group: "Finance & Business", category: "Finance", inside: "Invoice generator", features: ["Create invoices", "Add items", "Calculate totals", "Export PDF", "Track payments"], icon: "🧾", tag: "Invoices", siteUrl: "sites/invoice-generator/index.html", version: "v1.0 — Sep 3, 2026", live: true, buildProgress: 80, previewOnly: false },
    { name: "Paragon Crypto", group: "Finance & Business", category: "Finance", inside: "Crypto tracker", features: ["Live prices", "Portfolio tracker", "News", "Price alerts", "Charts"], icon: "₿", tag: "Crypto" },
    { name: "Paragon Stocks", group: "Finance & Business", category: "Finance", inside: "Stock market", features: ["Stock prices", "Watchlist", "Charts", "Market news", "Company information"], icon: "📈", tag: "Stocks" },
    { name: "Paragon Shop", group: "Finance & Business", category: "Finance", inside: "E-commerce builder", features: ["Product listings", "Cart", "Checkout flow", "Store template"], icon: "🛍️", tag: "E-commerce", siteUrl: "sites/personal-shopper/index.html", version: "v0.9 — Sep 3, 2026", live: true, buildProgress: 55, previewOnly: false },
    { name: "Paragon Invest", group: "Finance & Business", category: "Finance", inside: "Investment simulator", features: ["Paper trading", "Virtual portfolio", "Track gains/losses", "Learn investing"], icon: "📊", tag: "Investing" },
    { name: "Paragon Receipt", group: "Finance & Business", category: "Finance", inside: "Receipt and expense scanner", features: ["Upload receipt photos", "Extract data", "Categorize", "Monthly reports"], icon: "🧾", tag: "Expenses" },

    { name: "Paragon Recipe", group: "Lifestyle & Health", category: "Lifestyle", inside: "Recipe and cooking", features: ["Recipe search", "Meal planner", "Shopping list", "Cook mode timer"], icon: "🍳", tag: "Cooking", siteUrl: "sites/recipe-creator/index.html", version: "v1.0 — Sep 3, 2026", live: true, buildProgress: 75, previewOnly: false },
    { name: "Paragon Fit", group: "Lifestyle & Health", category: "Lifestyle", inside: "Health and fitness hub", features: ["Workout planner", "Exercise library", "BMI calculator", "Calorie/nutrition tracker", "Water intake tracker", "Progress charts"], icon: "🏋️", tag: "Fitness" },
    { name: "Paragon Sleep", group: "Lifestyle & Health", category: "Lifestyle", inside: "Sleep tracker", features: ["Bedtime reminders", "Sleep log", "Sleep quality tracking", "Tips"], icon: "😴", tag: "Sleep" },
    { name: "Paragon Mental", group: "Lifestyle & Health", category: "Lifestyle", inside: "Mental wellness", features: ["Meditation timer", "Breathing exercises", "Mood journal", "Daily affirmations"], icon: "🧘", tag: "Mental Wellness" },
    { name: "Paragon Habits", group: "Lifestyle & Health", category: "Lifestyle", inside: "Habit tracker", features: ["Daily habits", "Streaks", "Reminders", "Statistics", "Accountability"], icon: "🔥", tag: "Habits" },
    { name: "Paragon Travel", group: "Lifestyle & Health", category: "Lifestyle", inside: "Trip planner", features: ["Itinerary builder", "Packing lists", "Budget tracker", "Destination information"], icon: "✈️", tag: "Travel", siteUrl: "sites/travel-assistant/index.html", version: "v1.0 — Sep 3, 2026", live: true, buildProgress: 70, previewOnly: false },
    { name: "Paragon Weather", group: "Lifestyle & Health", category: "Lifestyle", inside: "Weather forecast", features: ["Current weather", "7-day forecast", "Hourly forecast", "Alerts", "Multiple cities"], icon: "🌦️", tag: "Weather" },
    { name: "Paragon Wardrobe", group: "Lifestyle & Health", category: "Lifestyle", inside: "Outfit planner", features: ["Upload clothing items", "Mix and match outfits", "Plan by day", "Seasonal organization"], icon: "👗", tag: "Fashion" },
    { name: "Paragon Journal", group: "Lifestyle & Health", category: "Lifestyle", inside: "Daily journal", features: ["Daily prompts", "Mood tracking", "Photo entries", "Timeline view", "Private and secure"], icon: "📔", tag: "Journaling" },
    { name: "Paragon Tutor", group: "Education & Learning", category: "Education", inside: "AI homework helper", features: ["Ask questions", "Explanations", "Step-by-step solutions", "Subject categories"], icon: "🎓", tag: "AI Tutor" },
    { name: "Paragon Quotes", group: "Lifestyle & Health", category: "Lifestyle", inside: "Quote library", features: ["Browse by category", "Save favorites", "Daily quote", "Share"], icon: "💬", tag: "Quotes" },
    { name: "Paragon Countdown", group: "Lifestyle & Health", category: "Lifestyle", inside: "Countdown timers", features: ["Event countdowns", "Birthdays", "Deadlines", "Share", "Widget"], icon: "⏳", tag: "Countdown" },

    { name: "Paragon Dev Tools", group: "Web & Developer Tools", category: "Dev Tools", inside: "Developer testing suite", features: ["JSON formatter/validator", "Regex tester/explainer", "API tester", "HTTP request builder", "Response viewer"], icon: "💻", tag: "Developer Testing" },
    { name: "Paragon Speed", group: "Web & Developer Tools", category: "Dev Tools", inside: "Website speed tester", features: ["URL testing", "Load time", "Performance score", "Suggestions"], icon: "⚡", tag: "Performance" },
    { name: "Paragon Domain", group: "Web & Developer Tools", category: "Dev Tools", inside: "Domain name generator", features: ["Keyword input", "Domain suggestions", "Availability ideas"], icon: "🌐", tag: "Domains" },
    { name: "Paragon SEO", group: "Web & Developer Tools", category: "Dev Tools", inside: "SEO checker", features: ["URL analysis", "Meta tags", "Headings", "Keyword density", "Suggestions"], icon: "🔎", tag: "SEO" },
    { name: "Paragon Deploy", group: "Web & Developer Tools", category: "Dev Tools", inside: "Static site deployer", features: ["Upload HTML/CSS/JavaScript", "Live link", "Simple hosting"], icon: "🚀", tag: "Deployment" },
    { name: "Paragon Contrast", group: "Web & Developer Tools", category: "Dev Tools", inside: "Accessibility checker", features: ["Color contrast ratios", "WCAG compliance", "Font size suggestions"], icon: "◐", tag: "Accessibility" },
    { name: "Paragon Markdown", group: "Web & Developer Tools", category: "Dev Tools", inside: "Markdown editor", features: ["Markdown writing", "Live preview", "Export HTML", "Cheat sheet"], icon: "Ⓜ️", tag: "Markdown" },
    { name: "Paragon Snippets", group: "Web & Developer Tools", category: "Dev Tools", inside: "Code snippet library", features: ["Reusable snippets", "Organize by language", "Search", "Copy"], icon: "✂️", tag: "Code Snippets" },

    { name: "Paragon Random", group: "Productivity & Tools", category: "Tools", inside: "Random generator", features: ["Random facts", "Names", "Ideas", "Places", "Colors", "Numbers", "Quotes", "Jokes", "Challenges"], icon: "🎲", tag: "Random Generator" },
    { name: "Paragon Time Capsule", group: "Lifestyle & Health", category: "Lifestyle", inside: "Future self messages", features: ["Write a message", "Future delivery date", "Receive it later", "Reflection prompts"], icon: "⏳", tag: "Reflection" },
    { name: "Paragon Vibe", group: "Entertainment & Media", category: "Entertainment", inside: "Mood-based experience", features: ["Mood input", "Matching music", "Color palette", "Quote", "Activity suggestion", "Wallpaper"], icon: "🌐", tag: "Mood Experience" },
    { name: "Paragon Alive", group: "Lifestyle & Health", category: "Health", inside: "Daily inspiration and wellbeing", features: ["Daily quote", "Challenge", "Gratitude prompt", "Life reminder", "Motivation feed"], icon: "🌱", tag: "Wellbeing" },
    { name: "Paragon Templates", group: "Paragon Originals", category: "Originals", inside: "Ready-made website template marketplace", features: ["Browse professional website templates by purpose and style", "Live template preview before purchase", "One-time template purchase — future payment integration", "Free hosting inside Paragon Archive after purchase — planned", "Optional paid custom-domain hosting upgrade — planned", "Personalization requests for colors, logo, and content", "Templates for portfolios, businesses, stores, and events"], icon: "🧩", tag: "Website Templates", addedAt: "2026-08-17T12:00:00+01:00" },

    { name: "Paragon Archive Hub", group: "Paragon Originals", category: "Originals", inside: "Official Paragon Archive channel and publishing gateway", features: ["Complete Paragon Archive overview and documentation", "Terms, Community Guidelines and Cookie Policy", "Developer requirements and Deployed-category specification", "Request a Website access", "About, Privacy and Terms & Conditions", "Deploy or host a website in Paragon Archive — future moderated submissions", "Roadmap and platform updates with honest system status", "Future Paragon Team secure login gateway"], icon: "◈", tag: "Archive Channel", siteUrl: "paragon-archive-hub.html", version: "v1.1 — Aug 5, 2026" }
  ];

  const colors = { Media: "#ec4899", Entertainment: "#db2777", Games: "#f59e0b", Finance: "#14b8a6", Lifestyle: "#84cc16", "Dev Tools": "#10b981", Originals: "#eab308" };
  const catalogue = window.ParagonSites || [];
  const byName = new Map(catalogue.map(site => [site.name.toLowerCase(), site]));
  let sequence = catalogue.reduce((maximum, site) => Math.max(maximum, Number(site.addedSequence || 0)), 0);

  definitions.forEach(definition => {
    const existing = byName.get(definition.name.toLowerCase());
    const about = `${definition.inside}. ${definition.features.join("; ")}. ${definition.name} is part of the ${definition.group} collection in Paragon Archive.`;
    if (existing) {
      Object.assign(existing, { group: definition.group, category: definition.category, desc: definition.inside, features: [...definition.features], updates: [...definition.features], about, icon: definition.icon, tag: definition.tag, color: existing.color || colors[definition.category], ...(definition.siteUrl ? { siteUrl: definition.siteUrl, previewOnly: false } : {}), ...(definition.version ? { version: definition.version } : {}), ...(definition.live ? { live: true } : {}), ...(definition.buildProgress != null ? { buildProgress: definition.buildProgress } : {}) });
      return;
    }
    sequence += 1;
    const site = {
      name: definition.name, category: definition.category, group: definition.group,
      stars: "New", color: colors[definition.category] || "#a855f7", desc: definition.inside,
      icon: definition.icon, siteUrl: definition.siteUrl || "#", tag: definition.tag, about,
      version: definition.version || "v1.0 — New", updates: [...definition.features], features: [...definition.features],
      reviews: [], isNew: true, addedAt: definition.addedAt || "2026-08-04T13:00:00+01:00",
      addedSequence: sequence, addedDateStatus: "recorded"
    };
    catalogue.push(site);
    byName.set(site.name.toLowerCase(), site);
  });

  catalogue.forEach(site => {
    if (!site.siteUrl || site.siteUrl === "#") {
      site.siteUrl = `paragon-product-preview.html?site=${encodeURIComponent(site.name)}`;
      site.previewOnly = true;
    }
  });

  window.ParagonSites = catalogue;
  window.ParagonExpansion45100Names = definitions.map(definition => definition.name);
})();

/* P-098 — the two future Paragon health products, listed in the DEPLOYED family as honest
   "in development by Paragon" records (owner order). Zero fake progress; buildProgress 0. */
window.ParagonSites.push(
  { name: "RxLife Network", category: "Health", inside: "Healthcare network", group: "Deployed", features: ["Professional directory", "Patient resources", "Pharmaceutical index", "Appointment flow"], icon: "\ud83e\uddec", tag: "Healthcare", desc: "One network connecting healthcare professionals, patients and pharmaceutical resources.", about: "RxLife Network is a comprehensive platform connecting healthcare professionals, patients and pharmaceutical resources in one network — reimagining how health information flows. In development by Paragon; listed here honestly at 0% until construction starts.", siteUrl: "paragon-product-preview.html?site=RxLife%20Network", previewOnly: true, buildProgress: 0, addedAt: "2026-08-26T10:00:00+01:00", version: "", updates: [], reviews: [], paragonProduct: true },
  { name: "Pharmapaedia", category: "Health", inside: "Pharma encyclopedia", group: "Deployed", features: ["Drug encyclopedia", "Searchable monographs", "Interaction notes", "Plain-language summaries"], icon: "\ud83d\udc8a", tag: "Healthcare", desc: "The most accessible encyclopedia of pharmaceutical knowledge.", about: "Pharmapaedia aims to be the most accessible encyclopedia of pharmaceutical knowledge — searchable, plain-language, and reliable. In development by Paragon; listed here honestly at 0% until construction starts.", siteUrl: "paragon-product-preview.html?site=Pharmapaedia", previewOnly: true, buildProgress: 0, addedAt: "2026-08-26T10:00:00+01:00", version: "", updates: [], reviews: [], paragonProduct: true }
);
