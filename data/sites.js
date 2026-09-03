/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: sites.js
  EXPECTED PROJECT PATH: /data/sites.js
  ROLE: Website catalogue and addition chronology.
  RESTORE/LOAD NOTE: Restore under data/. Load before data/updates.js, data/metrics.js, and app.js.
*/
/* ============================================
   PARAGON ARCHIVE — WEBSITE CATALOGUE DATA
   Existing and newly added records share one deduplicated collection.
   ============================================ */

(() => {
  const existingSites = [
  { name: "Paragon Vibe", category: "Media", stars: 4.9, color: "#a855f7", desc: "Tell your mood, get music, color and an activity.", icon: "🌐", siteUrl: "#", tag: "Entertainment", about: "Paragon Vibe reads your mood through a quick quiz and delivers a curated mix of music, colors, and activities designed to match how you feel. It is elegant, fast, and built to be a daily ritual.", version: "v2.1 — Aug 4, 2026", updates: ["Added dark/light mode toggle", "Improved mood detection accuracy", "New daily challenge mode"], reviews: [{ name: "Maya O.", date: "Aug 4, 2026", stars: 5, text: "This changed how I start my mornings. The color palettes alone are worth it." }, { name: "Leo K.", date: "Aug 3, 2026", stars: 5, text: "Beautiful interface and genuinely useful recommendations." }] },
  { name: "Paragon Notes", category: "Tools", stars: 4.8, color: "#3b82f6", desc: "A rich, elegant note-taking experience.", icon: "📝", siteUrl: "#", tag: "Productivity", about: "Paragon Notes is a modern writing environment that combines beautiful typography with smart formatting, inline collaboration, and powerful export options. It feels like paper, but works like software.", version: "v1.2 — Aug 1, 2026", updates: ["Added dark/light mode toggle", "Fixed export to PDF bug", "Improved text formatting"], reviews: [{ name: "Sarah T.", date: "Aug 4, 2026", stars: 5, text: "Best note app I have used. The typography alone makes it special." }] },
  { name: "Paragon Chess", category: "Games", stars: 4.7, color: "#f59e0b", desc: "Play classic chess with AI or friends.", icon: "♟", siteUrl: "#", tag: "Games", about: "Paragon Chess brings the timeless game of chess to life with a refined interface, adaptive AI, and real-time multiplayer. Learn openings, study endgames, or play casually.", version: "v3.0 — Aug 3, 2026", updates: ["New 3D board view", "Improved AI difficulty curve", "Live spectator mode"], reviews: [{ name: "Jonas R.", date: "Aug 4, 2026", stars: 4, text: "Clean, fast, and the AI is impressively human." }] },
  { name: "Paragon Code", category: "Education", stars: 4.9, color: "#10b981", desc: "Learn, practice and build with real code.", icon: "💻", siteUrl: "#", tag: "Coding", about: "Paragon Code offers interactive lessons, real-time syntax checking, and a playground where you can build small projects. It is designed for beginners who want to actually build things.", version: "v1.8 — Aug 3, 2026", updates: ["Added Python track", "New project templates", "Live collaboration"], reviews: [{ name: "Dana W.", date: "Aug 4, 2026", stars: 5, text: "Finally a coding site that does not feel like a classroom." }] },
  { name: "Paragon Music", category: "Media", stars: 4.6, color: "#ec4899", desc: "Discover tracks that match your vibe.", icon: "🎵", siteUrl: "#", tag: "Media", about: "Discover new songs through mood-based playlists, artist deep-dives, and curated mixes. Paragon Music focuses on quality over quantity, helping you find tracks you will actually want to hear again.", version: "v2.4 — Aug 3, 2026", updates: ["Improved recommendations", "New weekly digest", "Artist interviews"], reviews: [{ name: "Tomi A.", date: "Aug 4, 2026", stars: 4, text: "The mood mixes are fantastic. I have discovered artists I never would have found." }] },
  { name: "Paragon Design", category: "Creative", stars: 4.9, color: "#f97316", desc: "Design tools for creators who care.", icon: "🎨", siteUrl: "#", tag: "Creative", about: "A curated suite of color palettes, typography pairings, layout grids, and asset libraries designed to help creators make faster, better decisions. No bloat, just useful tools.", version: "v1.5 — Aug 4, 2026", updates: ["New palette generator", "Export to Figma", "Accessibility checker"], reviews: [{ name: "Kim J.", date: "Aug 4, 2026", stars: 5, text: "Every tool here is genuinely useful. No filler." }] },
  { name: "Paragon Finance", category: "Finance", stars: 4.5, color: "#14b8a6", desc: "Track, save and grow your wealth.", icon: "💰", siteUrl: "#", tag: "Finance", about: "Simplify budgeting, build savings goals, and get clear insights into your spending patterns. Paragon Finance is built to help you feel in control without overwhelming you with data.", version: "v3.2 — Aug 2, 2026", updates: ["New savings tracker", "Expense categories", "Monthly reports"], reviews: [{ name: "Rita E.", date: "Aug 3, 2026", stars: 4, text: "Simple and effective. Finally a finance tool that respects my time." }] },
  { name: "Paragon Health", category: "Health", stars: 4.4, color: "#ef4444", desc: "Wellness and mindful living.", icon: "🍎", siteUrl: "#", tag: "Health", about: "Daily wellness prompts, mindful breathing guides, simple nutrition tracking, and gentle habit reminders. Paragon Health is designed to help you feel better without creating pressure.", version: "v2.0 — Aug 2, 2026", updates: ["New breathing timer", "Weekly wellness report", "Hydration tracker"], reviews: [{ name: "Olivia P.", date: "Aug 3, 2026", stars: 4, text: "Gentle and actually useful. I use the timer every day." }] },
  { name: "Paragon Social", category: "Social", stars: 4.3, color: "#8b5cf6", desc: "Connect with people who inspire.", icon: "💬", siteUrl: "#", tag: "Social", about: "A calm, focused social space for people who value depth over noise. Curated circles, thoughtful discussions, and tools to share ideas without the usual social fatigue.", version: "v1.1 — Aug 2, 2026", updates: ["New circle feature", "Topic groups", "Quiet mode"], reviews: [{ name: "Marcus L.", date: "Aug 3, 2026", stars: 4, text: "Finally a social platform that feels respectful." }] },
  { name: "Paragon Education", category: "Education", stars: 4.7, color: "#0ea5e9", desc: "Courses and lessons that stick.", icon: "📚", siteUrl: "#", tag: "Education", about: "Courses built around real projects, not just videos. Learn by doing with guided exercises, peer feedback, and certificates you can actually show employers.", version: "v4.0 — Aug 3, 2026", updates: ["Project-based tracks", "Peer review", "New course library"], reviews: [{ name: "Nina B.", date: "Aug 4, 2026", stars: 5, text: "I finally finished a course. The project-based method works." }] },
  { name: "Paragon Tools", category: "Tools", stars: 4.8, color: "#06b6d4", desc: "Everyday utilities that work.", icon: "🛠️", siteUrl: "#", tag: "Tools", about: "A clean collection of converters, calculators, generators, and small utilities you use daily. Fast, reliable, and without ads or clutter.", version: "v5.1 — Aug 3, 2026", updates: ["New unit converter", "Text formatter", "Image resizer"], reviews: [{ name: "David H.", date: "Aug 4, 2026", stars: 5, text: "Simple, fast, and no popups. Perfect." }] },
  { name: "Paragon Originals", category: "Creative", stars: 5.0, color: "#eab308", desc: "Hand-crafted creative experiences.", icon: "✨", siteUrl: "#", tag: "Creative", about: "Paragon Originals is a creative showcase of hand-crafted digital experiences from the Paragon team. Each project is designed to feel distinctive, expressive and worth returning to.", version: "v1.0 — Aug 4, 2026", updates: ["Launch of Originals collection", "First three sites live"], reviews: [{ name: "Aya R.", date: "Aug 4, 2026", stars: 5, text: "These feel truly special. You can feel the care." }] },
];;

  const incomingSites = [
  {
    name: "Paragon Resume",
    category: "Productivity",
    stars: "New",
    color: "#6366f1",
    desc: "Resume and CV builder with templates.",
    icon: "📄",
    siteUrl: "#",
    tag: "Career",
    about: "Paragon Resume helps people create polished resumes and CVs from guided sections and professional templates. Users can organize experience, education, skills, and achievements, then prepare a clean document for job applications without wrestling with layout tools.",
    version: "v1.0 — New",
    updates: ["Guided resume and CV builder", "Professional template collection", "Flexible section ordering and export preparation"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Whiteboard",
    category: "Creative",
    stars: "New",
    color: "#f97316",
    desc: "Infinite collaborative whiteboard.",
    icon: "🧠",
    siteUrl: "#",
    tag: "Collaboration",
    about: "Paragon Whiteboard is an open canvas for brainstorming, planning, diagrams, notes, and team workshops. Its infinite workspace is designed to let ideas grow naturally while collaborators organize concepts together in one visual environment.",
    version: "v1.0 — New",
    updates: ["Infinite pan-and-zoom canvas", "Collaborative drawing and sticky notes", "Boards for diagrams, planning, and workshops"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Palette",
    category: "Creative",
    stars: "New",
    color: "#fb7185",
    desc: "Interior and outfit color matching tool.",
    icon: "🎨",
    siteUrl: "#",
    tag: "Color",
    about: "Paragon Palette helps users build harmonious color combinations for rooms and outfits. Start with a favorite color, item, or mood and explore coordinated palettes that make interior styling and clothing choices easier to visualize.",
    version: "v1.0 — New",
    updates: ["Interior color matching", "Outfit palette suggestions", "Coordinated color combinations and saved palettes"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Exam",
    category: "Education",
    stars: "New",
    color: "#0ea5e9",
    desc: "Mock exam and test simulator.",
    icon: "📝",
    siteUrl: "#",
    tag: "Assessment",
    about: "Paragon Exam recreates the focus and timing of a real test environment. Learners can take mock examinations, review answers, measure progress, and become comfortable with exam conditions before the actual day.",
    version: "v1.0 — New",
    updates: ["Timed mock exam sessions", "Answer review and scoring", "Progress summaries across practice attempts"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Tutor",
    category: "Education",
    stars: "New",
    color: "#38bdf8",
    desc: "AI-powered Q&A homework helper.",
    icon: "🎓",
    siteUrl: "#",
    tag: "AI Learning",
    about: "Paragon Tutor is an AI-powered homework companion that explains questions step by step. It is designed to help students understand the reasoning behind an answer, ask follow-up questions, and learn at their own pace rather than simply copying a result.",
    version: "v1.0 — New",
    updates: ["AI-powered question and answer support", "Step-by-step explanations", "Follow-up questions for deeper understanding"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Confess",
    category: "Social",
    stars: "New",
    color: "#8b5cf6",
    desc: "Anonymous confession and thought sharing.",
    icon: "🤫",
    siteUrl: "#",
    tag: "Anonymous",
    about: "Paragon Confess gives people a place to share confessions and unfiltered thoughts without attaching their public identity. The experience is intended to feel calm, respectful, and focused on expression while supporting clear community-safety controls.",
    version: "v1.0 — New",
    updates: ["Anonymous confession posting", "Thought-sharing feed", "Community safety and reporting foundations"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Events",
    category: "Social",
    stars: "New",
    color: "#a78bfa",
    desc: "Event creation and RSVP manager.",
    icon: "📅",
    siteUrl: "#",
    tag: "Planning",
    about: "Paragon Events simplifies creating an event, inviting people, collecting RSVPs, and keeping guests informed. It brings the essential planning details into one clear page for hosts and attendees.",
    version: "v1.0 — New",
    updates: ["Guided event creation", "Guest invitations and RSVP tracking", "Central event details and attendance status"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Sounds",
    category: "Entertainment",
    stars: "New",
    color: "#ec4899",
    desc: "Ambient sounds and white noise mixer.",
    icon: "🎧",
    siteUrl: "#",
    tag: "Ambient Audio",
    about: "Paragon Sounds lets users combine ambient recordings and white noise into a personal soundscape for focus, relaxation, sleep, or reading. Individual layers can be balanced to create the right atmosphere for the moment.",
    version: "v1.0 — New",
    updates: ["Layered ambient sound mixer", "White-noise and nature-sound collection", "Saveable focus and relaxation mixes"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Theater",
    category: "Entertainment",
    stars: "New",
    color: "#db2777",
    desc: "Script writing and screenplay tool.",
    icon: "🎭",
    siteUrl: "#",
    tag: "Screenwriting",
    about: "Paragon Theater is a focused writing environment for stage scripts and screenplays. It helps writers organize scenes, characters, dialogue, and production notes while keeping formatting consistent and the story easy to navigate.",
    version: "v1.0 — New",
    updates: ["Script and screenplay formatting", "Scene and character organization", "Dialogue-focused writing workspace"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Bet",
    category: "Games",
    stars: "New",
    color: "#f59e0b",
    desc: "Friendly prediction and bet tracker with friends.",
    icon: "🎯",
    siteUrl: "#",
    tag: "Social Games",
    about: "Paragon Bet is a friendly prediction tracker for private groups. Friends can record predictions, agree on fun stakes, settle outcomes, and view standings without handling real-money wagering inside the product.",
    version: "v1.0 — New",
    updates: ["Private friend-group predictions", "Outcome and score tracking", "Friendly standings without in-app real-money wagering"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Survival",
    category: "Games",
    stars: "New",
    color: "#d97706",
    desc: "Text-based survival adventure game.",
    icon: "🧭",
    siteUrl: "#",
    tag: "Adventure",
    about: "Paragon Survival is a choice-driven text adventure where every decision affects resources, relationships, and the path forward. Players explore changing scenarios, manage risk, and try to survive long enough to uncover the full story.",
    version: "v1.0 — New",
    updates: ["Branching survival story", "Resource and risk decisions", "Multiple outcomes shaped by player choices"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Invest",
    category: "Finance",
    stars: "New",
    color: "#14b8a6",
    desc: "Investment portfolio simulator (paper trading).",
    icon: "📈",
    siteUrl: "#",
    tag: "Paper Trading",
    about: "Paragon Invest is a paper-trading simulator for learning how portfolios behave without putting real money at risk. Users can practice allocation decisions, monitor simulated performance, and understand investing concepts in a controlled environment.",
    version: "v1.0 — New",
    updates: ["Risk-free paper-trading portfolios", "Simulated performance tracking", "Allocation and investment-learning tools"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Wardrobe",
    category: "Lifestyle",
    stars: "New",
    color: "#84cc16",
    desc: "Outfit planner and clothing organizer.",
    icon: "👗",
    siteUrl: "#",
    tag: "Fashion",
    about: "Paragon Wardrobe helps users organize clothing and plan outfits around weather, occasions, and personal style. A visual closet makes it easier to rediscover existing pieces, prepare looks in advance, and make more intentional clothing choices.",
    version: "v1.0 — New",
    updates: ["Visual clothing organizer", "Outfit planning by occasion", "Wardrobe combinations and saved looks"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Journal",
    category: "Lifestyle",
    stars: "New",
    color: "#65a30d",
    desc: "Daily journaling with mood tracking and prompts.",
    icon: "📔",
    siteUrl: "#",
    tag: "Wellbeing",
    about: "Paragon Journal combines private daily writing with gentle prompts and mood tracking. It is designed to make reflection approachable, reveal patterns over time, and help users maintain a consistent journaling habit.",
    version: "v1.0 — New",
    updates: ["Daily journal entries", "Mood tracking over time", "Optional reflection prompts and habit support"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Deploy",
    category: "Dev Tools",
    stars: "New",
    color: "#10b981",
    desc: "Simple static website deployer and hosting.",
    icon: "🚀",
    siteUrl: "#",
    tag: "Hosting",
    about: "Paragon Deploy provides a simple path from static website files to a shareable hosted page. It is aimed at creators and learners who want straightforward deployment, clear status feedback, and fewer infrastructure decisions.",
    version: "v1.0 — New",
    updates: ["Static file deployment workflow", "Hosted preview and deployment status", "Simple project and release management"],
    reviews: [],
    isNew: true
  },
  {
    name: "Paragon Contrast",
    category: "Dev Tools",
    stars: "New",
    color: "#059669",
    desc: "Accessibility contrast checker for designers.",
    icon: "◐",
    siteUrl: "#",
    tag: "Accessibility",
    about: "Paragon Contrast helps designers and developers test foreground and background colors against accessibility contrast guidance. It provides clear pass or fail results and supports finding readable alternatives without interrupting the design workflow.",
    version: "v1.0 — New",
    updates: ["Foreground and background contrast testing", "Accessible pass or fail guidance", "Readable color-adjustment suggestions"],
    reviews: [],
    isNew: true
  }
];

  const seenNames = new Set(existingSites.map(site => site.name.toLocaleLowerCase()));
  const uniqueIncomingSites = incomingSites.filter(site => {
    const key = site.name.toLocaleLowerCase();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  const normalizedProjectAdditionDates = {
    "Paragon Vibe": "2026-08-03T09:00:00+01:00",
    "Paragon Notes": "2026-08-01T09:00:00+01:00",
    "Paragon Chess": "2026-08-02T11:00:00+01:00",
    "Paragon Code": "2026-08-02T12:00:00+01:00",
    "Paragon Music": "2026-08-03T10:00:00+01:00",
    "Paragon Design": "2026-08-03T11:00:00+01:00",
    "Paragon Finance": "2026-08-02T09:00:00+01:00",
    "Paragon Health": "2026-08-01T10:00:00+01:00",
    "Paragon Social": "2026-08-01T11:00:00+01:00",
    "Paragon Education": "2026-08-02T10:00:00+01:00",
    "Paragon Tools": "2026-08-01T12:00:00+01:00",
    "Paragon Originals": "2026-08-03T12:00:00+01:00"
  };

  const combinedSites = [...existingSites, ...uniqueIncomingSites];
  window.ParagonSites = combinedSites.map((site, combinedIndex) => {
    const incomingIndex = uniqueIncomingSites.findIndex(incoming => incoming.name === site.name);
    const isIncoming = incomingIndex >= 0;
    return {
      ...site,
      addedAt: isIncoming
        ? "2026-08-04T09:00:00+01:00"
        : (normalizedProjectAdditionDates[site.name] || "2026-08-01T09:00:00+01:00"),
      addedSequence: isIncoming ? incomingIndex + 1 : combinedIndex + 1,
      addedDateStatus: isIncoming ? "recorded" : "normalized-to-project-start"
    };
  });
  window.ParagonNewSiteNames = uniqueIncomingSites.map(site => site.name);
})();
