/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: catalogue-expansion.js
  EXPECTED PROJECT PATH: /data/catalogue-expansion.js
  ROLE: Declarative 44-site Productivity, Creative, Education, and Social catalogue expansion/merge.
  RESTORE/LOAD NOTE: Restore under data/. Load immediately after data/sites.js and before updates, metrics, and app.js.
*/

(() => {
  const definitions = [
    { name: "Paragon Notes", group: "Productivity & Tools", category: "Tools", inside: "Rich text note taking", features: ["Folders", "Tags", "Markdown support", "Export", "Search"], icon: "📝", tag: "Productivity" },
    { name: "Paragon Tasks", group: "Productivity & Tools", category: "Tools", inside: "Todo and task manager", features: ["Lists", "Priorities", "Due dates", "Subtasks", "Progress tracking"], icon: "✅", tag: "Task Management" },
    { name: "Paragon Calendar", group: "Productivity & Tools", category: "Tools", inside: "Schedule and events", features: ["Day view", "Week view", "Month view", "Reminders", "Color coding"], icon: "📅", tag: "Scheduling" },
    { name: "Paragon Clock", group: "Productivity & Tools", category: "Tools", inside: "Time management hub", features: ["World clock", "Alarm", "Timer", "Stopwatch", "Pomodoro focus timer"], icon: "⏱️", tag: "Time" },
    { name: "Paragon Calc", group: "Productivity & Tools", category: "Tools", inside: "Calculator and converter", features: ["Basic calculator", "Scientific calculator", "Unit converter", "Currency converter", "Number base converter"], icon: "🧮", tag: "Utilities" },
    { name: "Paragon Dictionary", group: "Productivity & Tools", category: "Tools", inside: "Words and language", features: ["Definitions", "Synonyms", "Antonyms", "Pronunciation", "Translator for 50+ languages"], icon: "📖", tag: "Language" },
    { name: "Paragon Files", group: "Productivity & Tools", category: "Tools", inside: "All file operations", features: ["PDF viewer and merger", "Image/document/video/audio converter", "File compressor", "Batch processing"], icon: "📁", tag: "Files" },
    { name: "Paragon Paste", group: "Productivity & Tools", category: "Tools", inside: "Clipboard and text tools", features: ["Text formatter", "Case changer", "Character counter", "Lorem ipsum generator"], icon: "📋", tag: "Text Tools" },
    { name: "Paragon QR", group: "Productivity & Tools", category: "Tools", inside: "QR code toolkit", features: ["URL QR generator", "Text QR generator", "WiFi/contact QR generator", "Camera QR scanner"], icon: "▦", tag: "QR Tools" },
    { name: "Paragon Password", group: "Productivity & Tools", category: "Tools", inside: "Security tools", features: ["Password generator", "Strength checker", "Random username generator"], icon: "🔐", tag: "Security" },
    { name: "Paragon Resume", group: "Productivity & Tools", category: "Productivity", inside: "Resume and CV builder", features: ["Templates", "Flexible sections", "Export to PDF", "Live preview", "Cover letter builder"], icon: "📄", tag: "Career" },
    { name: "Paragon Bookmarks", group: "Productivity & Tools", category: "Tools", inside: "Bookmark and link manager", features: ["Save URLs", "Folders", "Tags", "Quick search"], icon: "🔖", tag: "Links" },
    { name: "Paragon Contacts", group: "Productivity & Tools", category: "Tools", inside: "Contact and address book", features: ["Store contacts", "Groups", "Birthday reminders", "Export/import"], icon: "👥", tag: "Contacts" },

    { name: "Paragon Canvas", group: "Creative & Design", category: "Creative", inside: "Drawing and painting", features: ["Brushes", "Layers", "Colors", "Shapes", "Export PNG/SVG"], icon: "🖌️", tag: "Drawing" },
    { name: "Paragon Design", group: "Creative & Design", category: "Creative", inside: "Graphic design studio", features: ["Templates", "Text", "Shapes", "Images", "Built-in logo maker", "Export"], icon: "🎨", tag: "Graphic Design" },
    { name: "Paragon Color", group: "Creative & Design", category: "Creative", inside: "Color everything", features: ["Palette generator", "Color picker", "HEX/RGB/HSL converter", "Gradient maker", "Contrast checker"], icon: "🌈", tag: "Color" },
    { name: "Paragon Icons", group: "Creative & Design", category: "Creative", inside: "Icon library", features: ["Search icons", "Filter by style", "Download SVG/PNG", "Copy code"], icon: "◈", tag: "Icons" },
    { name: "Paragon Fonts", group: "Creative & Design", category: "Creative", inside: "Font explorer", features: ["Browse fonts", "Font pairing suggestions", "Preview custom text", "Copy CSS"], icon: "🔤", tag: "Typography" },
    { name: "Paragon Photo", group: "Creative & Design", category: "Creative", inside: "Photo editing suite", features: ["Filters", "Crop and resize", "Adjustments", "Text overlay", "Avatar/profile picture creator", "Collage maker"], icon: "📷", tag: "Photo Editing" },
    { name: "Paragon Meme", group: "Creative & Design", category: "Creative", inside: "Meme generator", features: ["Template library", "Custom text", "Image upload", "Trending formats"], icon: "😂", tag: "Memes" },
    { name: "Paragon Mood", group: "Creative & Design", category: "Creative", inside: "Mood board creator", features: ["Drag and drop images", "Colors", "Text", "Pins", "Aesthetic boards"], icon: "🧷", tag: "Mood Boards" },
    { name: "Paragon Whiteboard", group: "Creative & Design", category: "Creative", inside: "Infinite whiteboard", features: ["Drawing", "Sticky notes", "Shapes", "Collaboration", "Infinite zoom and pan"], icon: "🧠", tag: "Collaboration" },
    { name: "Paragon Palette", group: "Creative & Design", category: "Creative", inside: "Color matching tool", features: ["Interior room colors", "Outfit colors", "Brand colors", "AI suggestions"], icon: "🎨", tag: "Color Matching" },

    { name: "Paragon Learn", group: "Education & Learning", category: "Education", inside: "Learning hub", features: ["Courses", "Tutorials", "Science facts", "History timeline explorer", "Video lessons"], icon: "🎓", tag: "Learning" },
    { name: "Paragon Quiz", group: "Education & Learning", category: "Education", inside: "Quiz platform", features: ["Create quizzes", "Take quizzes", "Timed mode", "Score tracking and personal bests", "Answer review", "Share results"], icon: "❓", tag: "Quizzes", siteUrl: "paragon-quiz/index.html", version: "v1.0 — Aug 17, 2026", live: true },
    { name: "Paragon Flash", group: "Education & Learning", category: "Education", inside: "Flashcard study tool", features: ["Create decks", "Spaced repetition", "Flip cards", "Study statistics"], icon: "🃏", tag: "Flashcards" },
    { name: "Paragon Math", group: "Education & Learning", category: "Education", inside: "Math solver and grapher", features: ["Step-by-step solving", "Graphing calculator", "Formula reference"], icon: "📐", tag: "Mathematics" },
    { name: "Paragon Code", group: "Education & Learning", category: "Education", inside: "Code editor and runner", features: ["HTML/CSS/JavaScript/Python", "Live preview", "Syntax highlighting", "Console output", "Save projects"], icon: "💻", tag: "Coding" },
    { name: "Paragon Type", group: "Education & Learning", category: "Education", inside: "Typing trainer", features: ["Speed test", "Accuracy tracker", "Lessons", "Custom text", "Leaderboard"], icon: "⌨️", tag: "Typing" },
    { name: "Paragon Language", group: "Education & Learning", category: "Education", inside: "Language learning", features: ["Vocabulary", "Phrases", "Pronunciation", "Flashcards", "Daily lessons"], icon: "🗣️", tag: "Languages" },
    { name: "Paragon Kids", group: "Education & Learning", category: "Education", inside: "Kids education games", features: ["ABCs", "Numbers", "Shapes", "Colors", "Matching", "Puzzles"], icon: "🧒", tag: "Kids Learning" },
    { name: "Paragon Debate", group: "Education & Learning", category: "Education", inside: "Argument builder", features: ["Topic selection", "Arguments for and against", "Structured debate format"], icon: "⚖️", tag: "Debate" },
    { name: "Paragon Mind", group: "Education & Learning", category: "Education", inside: "Mind mapping", features: ["Mind maps", "Idea branches", "Color coding", "Drag and rearrange", "Export"], icon: "🧠", tag: "Mind Maps" },
    { name: "Paragon Exam", group: "Education & Learning", category: "Education", inside: "Mock exam simulator", features: ["Timed tests", "Multiple subjects", "Scoring", "Review answers", "Progress tracking"], icon: "📝", tag: "Assessment" },

    { name: "Paragon Chat", group: "Social & Communication", category: "Social", inside: "Communication hub", features: ["Real-time messaging", "Voice messages and notes", "Digital letters", "Group chats", "Media sharing"], icon: "💬", tag: "Messaging" },
    { name: "Paragon Forum", group: "Social & Communication", category: "Social", inside: "Discussion boards", features: ["Topics", "Threads", "Replies", "Upvotes", "Categories", "Moderator tools"], icon: "🗨️", tag: "Forums" },
    { name: "Paragon Poll", group: "Social & Communication", category: "Social", inside: "Polls and voting", features: ["Create polls", "Multiple choice", "Yes/no", "Live results", "Share link"], icon: "🗳️", tag: "Voting" },
    { name: "Paragon Meet", group: "Social & Communication", category: "Social", inside: "Video and audio meetings", features: ["Video calls", "Audio calls", "Screen share", "Meeting rooms", "Join via link"], icon: "📹", tag: "Meetings" },
    { name: "Paragon Wall", group: "Social & Communication", category: "Social", inside: "Public message board", features: ["Public messages", "Reactions", "Topic tags", "Trending wall posts"], icon: "🧱", tag: "Community" },
    { name: "Paragon Connect", group: "Social & Communication", category: "Social", inside: "Community matching", features: ["Interest-based profiles", "Similar-person matching", "Groups"], icon: "🤝", tag: "Matching" },
    { name: "Paragon Feed", group: "Social & Communication", category: "Social", inside: "Social media feed", features: ["Text/photo posts", "Likes", "Comments", "Following", "Trending posts"], icon: "📰", tag: "Social Feed" },
    { name: "Paragon Collab", group: "Social & Communication", category: "Social", inside: "Document collaboration", features: ["Real-time shared documents", "Cursor tracking", "Comments", "Version history"], icon: "🤝", tag: "Collaboration" },
    { name: "Paragon Confess", group: "Social & Communication", category: "Social", inside: "Anonymous sharing", features: ["Anonymous confessions", "Reactions", "No usernames", "Moderation filters"], icon: "🤫", tag: "Anonymous" },
    { name: "Paragon Events", group: "Social & Communication", category: "Social", inside: "Event management", features: ["Create events", "Date/time/location", "RSVP", "Invite link", "Calendar sync"], icon: "📅", tag: "Events" }
  ];

  const colors = { Tools: "#3b82f6", Productivity: "#6366f1", Creative: "#f97316", Education: "#0ea5e9", Social: "#8b5cf6" };
  const catalogue = window.ParagonSites || [];
  const byName = new Map(catalogue.map(site => [site.name.toLowerCase(), site]));
  let sequence = catalogue.reduce((maximum, site) => Math.max(maximum, Number(site.addedSequence || 0)), 0);

  definitions.forEach((definition, index) => {
    const existing = byName.get(definition.name.toLowerCase());
    const about = `${definition.inside}. ${definition.features.join("; ")}. ${definition.name} is part of the ${definition.group} collection in Paragon Archive.`;
    if (existing) {
      Object.assign(existing, {
        group: definition.group,
        category: definition.category,
        desc: definition.inside,
        features: [...definition.features],
        updates: [...definition.features],
        about,
        icon: definition.icon,
        tag: definition.tag,
        color: existing.color || colors[definition.category],
        ...(definition.siteUrl ? { siteUrl: definition.siteUrl, previewOnly: false } : {}),
        ...(definition.version ? { version: definition.version } : {})
      });
      return;
    }
    sequence += 1;
    const site = {
      name: definition.name,
      category: definition.category,
      group: definition.group,
      stars: "New",
      color: colors[definition.category] || "#a855f7",
      desc: definition.inside,
      icon: definition.icon,
      siteUrl: definition.siteUrl || "#",
      tag: definition.tag,
      about,
      version: definition.version || "v1.0 — New",
      updates: [...definition.features],
      features: [...definition.features],
      reviews: [],
      isNew: true,
      addedAt: "2026-08-04T12:00:00+01:00",
      addedSequence: sequence,
      addedDateStatus: "recorded"
    };
    catalogue.push(site);
    byName.set(site.name.toLowerCase(), site);
  });

  catalogue.forEach(site => {
    if (!Array.isArray(site.features) || !site.features.length) site.features = [...(site.updates || [])];
  });

  window.ParagonSites = catalogue;
  window.ParagonExpansionNames = definitions.map(definition => definition.name);
})();
