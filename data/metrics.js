/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: metrics.js
  EXPECTED PROJECT PATH: /data/metrics.js
  ROLE: Local ranking/view snapshots for daily hero, Staff, and weekly Trending.
  RESTORE/LOAD NOTE: Restore under data/. Load after data/sites.js and before app.js.
*/
/* ============================================
   PARAGON ARCHIVE — LOCAL VIEW & RANKING METRICS
   Front-end demo analytics. Production-wide rankings require a backend.
   ============================================ */

(() => {
  const sites = window.ParagonSites || [];
  const storageKey = "paragonArchive.metrics.v1";
  const state = loadState();

  function emptyState() {
    return {
      localViews: {},
      dailyViews: {},
      viewEvents: [],
      dailyFeatures: {},
      dailyStaffRankings: {},
      weeklyRankings: {}
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "null");
      if (!parsed || typeof parsed !== "object") return emptyState();
      return {
        localViews: parsed.localViews || {},
        dailyViews: parsed.dailyViews || {},
        viewEvents: Array.isArray(parsed.viewEvents) ? parsed.viewEvents : [],
        dailyFeatures: parsed.dailyFeatures || {},
        dailyStaffRankings: parsed.dailyStaffRankings || {},
        weeklyRankings: parsed.weeklyRankings || {}
      };
    } catch (error) {
      return emptyState();
    }
  }

  function saveState() {
    pruneState();
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      // Embedded/private previews may block storage. Rankings still work for the current page session.
    }
  }

  function keepNewestKeys(object, limit) {
    const keys = Object.keys(object).sort();
    keys.slice(0, Math.max(0, keys.length - limit)).forEach(key => delete object[key]);
  }

  function pruneState() {
    keepNewestKeys(state.dailyViews, 62);
    keepNewestKeys(state.dailyFeatures, 62);
    keepNewestKeys(state.dailyStaffRankings, 62);
    keepNewestKeys(state.weeklyRankings, 16);
    const eventCutoff = Date.now() - (8 * 24 * 60 * 60 * 1000);
    state.viewEvents = state.viewEvents.filter(event => Number(event.timestamp) >= eventCutoff);
  }

  function hashName(name) {
    let hash = 2166136261;
    for (let index = 0; index < name.length; index += 1) {
      hash ^= name.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function getSeedViews(name) {
    return 12000 + (hashName(name) % 52000);
  }

  function getDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getWeekStart(date = new Date()) {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  function addDays(date, days) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  function getSite(name) {
    return sites.find(site => site.name === name);
  }

  function getViewCount(name) {
    // P-046/D-126: view totals are REAL recorded views only. The former 12k–64k
    // hashed demo seeds are removed so every number reflects actual user action;
    // authoritative global totals still arrive with the future analytics backend.
    return Number(state.localViews[name] || 0);
  }

  function getNumericRating(site) {
    const rating = Number(site?.stars);
    return Number.isFinite(rating) ? rating : 0;
  }

  function getReviewCount(site) {
    return Array.isArray(site?.reviews) ? site.reviews.length : 0;
  }

  function recordView(name, date = new Date()) {
    if (!getSite(name)) return;
    const dateKey = getDateKey(date);
    state.localViews[name] = Number(state.localViews[name] || 0) + 1;
    if (!state.dailyViews[dateKey]) state.dailyViews[dateKey] = {};
    state.dailyViews[dateKey][name] = Number(state.dailyViews[dateKey][name] || 0) + 1;
    state.viewEvents.push({ name, timestamp: date.getTime() });
    saveState();
  }

  function rankByViews() {
    return [...sites].sort((first, second) =>
      getViewCount(second.name) - getViewCount(first.name) || first.name.localeCompare(second.name)
    );
  }

  function getDailyFeaturedSites(limit = 7, date = new Date()) {
    const dateKey = getDateKey(date);
    if (!Array.isArray(state.dailyFeatures[dateKey])) {
      state.dailyFeatures[dateKey] = rankByViews().slice(0, limit).map(site => site.name);
      saveState();
    }
    return state.dailyFeatures[dateKey]
      .map(getSite)
      .filter(Boolean)
      .slice(0, limit);
  }

  function getViewsInLast24Hours(name, date = new Date()) {
    const endTime = date.getTime();
    const startTime = endTime - (24 * 60 * 60 * 1000);
    return state.viewEvents.reduce((count, event) =>
      event.name === name && Number(event.timestamp) > startTime && Number(event.timestamp) <= endTime
        ? count + 1
        : count,
    0);
  }

  function buildDailyStaffRanking(date = new Date()) {
    return sites.map(site => ({
      name: site.name,
      last24hViews: getViewsInLast24Hours(site.name, date),
      rating: getNumericRating(site),
      reviewCount: getReviewCount(site),
      totalViews: getViewCount(site.name)
    })).sort((first, second) =>
      first.last24hViews - second.last24hViews ||
      first.rating - second.rating ||
      first.reviewCount - second.reviewCount ||
      first.totalViews - second.totalViews ||
      first.name.localeCompare(second.name)
    );
  }

  function getDailyStaffPickEntries(date = new Date()) {
    const dateKey = getDateKey(date);
    if (!Array.isArray(state.dailyStaffRankings[dateKey])) {
      state.dailyStaffRankings[dateKey] = buildDailyStaffRanking(date);
      saveState();
    }
    return state.dailyStaffRankings[dateKey]
      .map(entry => ({ ...entry, site: getSite(entry.name) }))
      .filter(entry => Boolean(entry.site));
  }

  function getDailyStaffPickSites(date = new Date()) {
    return getDailyStaffPickEntries(date).map(entry => entry.site);
  }

  function getPreviousWeekRange(date = new Date()) {
    const currentWeekStart = getWeekStart(date);
    const previousWeekStart = addDays(currentWeekStart, -7);
    return {
      currentWeekStart,
      previousWeekStart,
      currentWeekKey: getDateKey(currentWeekStart),
      previousWeekKey: getDateKey(previousWeekStart)
    };
  }

  function getPriorWeekActivity(date = new Date()) {
    const range = getPreviousWeekRange(date);
    const featureAppearances = {};
    const weeklyViews = {};

    Object.entries(state.dailyFeatures).forEach(([dateKey, names]) => {
      if (dateKey >= range.previousWeekKey && dateKey < range.currentWeekKey) {
        names.forEach(name => {
          featureAppearances[name] = Number(featureAppearances[name] || 0) + 1;
        });
      }
    });

    Object.entries(state.dailyViews).forEach(([dateKey, views]) => {
      if (dateKey >= range.previousWeekKey && dateKey < range.currentWeekKey) {
        Object.entries(views).forEach(([name, count]) => {
          weeklyViews[name] = Number(weeklyViews[name] || 0) + Number(count || 0);
        });
      }
    });

    return { ...range, featureAppearances, weeklyViews };
  }

  function buildWeeklyRanking(date = new Date()) {
    const activity = getPriorWeekActivity(date);
    return sites.map(site => {
      const totalViews = getViewCount(site.name);
      const priorWeekViews = Number(activity.weeklyViews[site.name] || 0);
      const featuredDays = Number(activity.featureAppearances[site.name] || 0);
      const rating = getNumericRating(site);
      const reviewCount = getReviewCount(site);
      const score =
        featuredDays * 250 +
        priorWeekViews * 30 +
        Math.log10(totalViews + 1) * 24 +
        rating * 20 +
        reviewCount * 8;

      return {
        name: site.name,
        score: Number(score.toFixed(4)),
        totalViews,
        priorWeekViews,
        featuredDays,
        rating,
        reviewCount
      };
    }).sort((first, second) =>
      second.score - first.score ||
      second.totalViews - first.totalViews ||
      first.name.localeCompare(second.name)
    );
  }

  function getWeeklyRankingEntries(date = new Date()) {
    const weekKey = getDateKey(getWeekStart(date));
    if (!Array.isArray(state.weeklyRankings[weekKey])) {
      state.weeklyRankings[weekKey] = buildWeeklyRanking(date);
      saveState();
    }
    return state.weeklyRankings[weekKey]
      .map(entry => ({ ...entry, site: getSite(entry.name) }))
      .filter(entry => Boolean(entry.site));
  }

  function getWeeklyTrendingSites(date = new Date()) {
    return getWeeklyRankingEntries(date).map(entry => entry.site);
  }

  function formatViews(value) {
    const count = Number(value || 0);
    if (count >= 1000000) return `${(count / 1000000).toFixed(count >= 10000000 ? 0 : 1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(count >= 100000 ? 0 : 1)}K`;
    return String(count);
  }

  function getWeekLabel(date = new Date()) {
    const start = getWeekStart(date);
    const end = addDays(start, 6);
    const format = value => value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${format(start)}–${format(end)}, ${end.getFullYear()}`;
  }

  window.ParagonMetrics = {
    recordView,
    getViewCount,
    getNumericRating,
    getReviewCount,
    getDailyFeaturedSites,
    getDailyStaffPickEntries,
    getDailyStaffPickSites,
    getViewsInLast24Hours,
    getWeeklyRankingEntries,
    getWeeklyTrendingSites,
    getDateKey,
    getWeekStart,
    getWeekLabel,
    formatViews,
    isLocalDemo: true,
    _debug: {
      state,
      storageKey,
      getSeedViews,
      getPriorWeekActivity,
      buildDailyStaffRanking,
      buildWeeklyRanking
    }
  };
})();
