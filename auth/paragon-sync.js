/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: paragon-sync.js
  EXPECTED PROJECT PATH: /auth/paragon-sync.js
  ROLE: Shared authenticated/Guest state and cross-product progress API.
  RESTORE/LOAD NOTE: Restore under auth/. Load after auth/supabase-auth.js and before app.js.
*/
/* ============================================
   PARAGON ARCHIVE — SHARED ACCOUNT STATE & PROGRESS
   One Supabase row follows the authenticated user across same-origin paths.
   ============================================ */

(() => {
  const auth = window.ParagonAuth;
  const config = window.ParagonConfig || {};
  const guestSessionKey = "paragonArchive.guestSession.v1";
  const guestStateKey = "paragonArchive.guestState.v1";
  let cachedState = null;

  function emptyState() {
    return { bookmarks: [], reviews: {}, reviewVotes: {}, visits: [], progress: {}, preferences: {}, collections: [], profile: {}, notifications: [] };
  }

  function normalizeState(value) {
    const state = value && typeof value === "object" ? value : {};
    return {
      bookmarks: Array.isArray(state.bookmarks) ? state.bookmarks : [],
      reviews: state.reviews && typeof state.reviews === "object" && !Array.isArray(state.reviews) ? state.reviews : {},
      reviewVotes: state.reviewVotes && typeof state.reviewVotes === "object" && !Array.isArray(state.reviewVotes) ? state.reviewVotes : {},
      visits: Array.isArray(state.visits) ? state.visits : [],
      progress: state.progress && typeof state.progress === "object" && !Array.isArray(state.progress) ? state.progress : {},
      preferences: state.preferences && typeof state.preferences === "object" && !Array.isArray(state.preferences) ? state.preferences : {},
      collections: Array.isArray(state.collections) ? state.collections : [],
      profile: state.profile && typeof state.profile === "object" && !Array.isArray(state.profile) ? state.profile : {},
      notifications: Array.isArray(state.notifications) ? state.notifications : []
    };
  }

  function guestIsActive() {
    try { return window.sessionStorage.getItem(guestSessionKey) === "true"; }
    catch (error) { return false; }
  }

  function readGuestState() {
    try { return normalizeState(JSON.parse(window.sessionStorage.getItem(guestStateKey) || "null")); }
    catch (error) { return emptyState(); }
  }

  function writeGuestState(state) {
    window.sessionStorage.setItem(guestStateKey, JSON.stringify(normalizeState(state)));
  }

  async function currentSession() {
    try { return await auth?.getSession?.(); }
    catch (error) { return null; }
  }

  function tableName() {
    const candidate = String(config.userStateTable || "paragon_user_state");
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(candidate) ? candidate : "paragon_user_state";
  }

  async function loadState() {
    if (!auth?.isConfigured()) throw new Error("Supabase is not configured.");
    const session = await auth.getSession();
    if (!session?.user?.id) throw new Error("Authentication required.");
    const rows = await auth.authenticatedFetch(`/rest/v1/${tableName()}?user_id=eq.${encodeURIComponent(session.user.id)}&select=state,updated_at`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    cachedState = normalizeState(Array.isArray(rows) && rows[0] ? rows[0].state : emptyState());
    return structuredCloneSafe(cachedState);
  }

  async function saveState(nextState) {
    if (!auth?.isConfigured()) throw new Error("Supabase is not configured.");
    const session = await auth.getSession();
    if (!session?.user?.id) throw new Error("Authentication required.");
    cachedState = normalizeState(nextState);
    await auth.authenticatedFetch(`/rest/v1/${tableName()}?on_conflict=user_id`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        user_id: session.user.id,
        state: cachedState,
        updated_at: new Date().toISOString()
      })
    });
    return structuredCloneSafe(cachedState);
  }

  function structuredCloneSafe(value) {
    if (typeof window.structuredClone === "function") return window.structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  async function ensureState() {
    return cachedState ? structuredCloneSafe(cachedState) : loadState();
  }

  function emitProgress(productId, entry) {
    if (typeof window.CustomEvent === "function" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("paragon:progress", { detail: { productId, entry } }));
    }
  }

  async function stateForProgress() {
    const session = await currentSession();
    if (session?.user?.id) return { mode: "authenticated", state: await ensureState() };
    if (guestIsActive()) return { mode: "guest", state: readGuestState() };
    throw new Error("Sign in or continue as Guest before saving progress.");
  }

  async function saveProductProgress(productId, value) {
    if (!productId) throw new Error("A product ID is required.");
    const context = await stateForProgress();
    context.state.progress[productId] = { value, updatedAt: new Date().toISOString() };
    if (context.mode === "authenticated") await saveState(context.state);
    else writeGuestState(context.state);
    emitProgress(productId, context.state.progress[productId]);
    return structuredCloneSafe(context.state.progress[productId]);
  }

  async function loadProductProgress(productId) {
    const context = await stateForProgress();
    return context.state.progress[productId]?.value ?? null;
  }

  async function removeProductProgress(productId) {
    const context = await stateForProgress();
    delete context.state.progress[productId];
    if (context.mode === "authenticated") await saveState(context.state);
    else writeGuestState(context.state);
    emitProgress(productId, null);
  }

  async function getWebsiteRequestCount() {
    if (!auth?.isConfigured()) return 0;
    const configuration = auth.getConfiguration?.() || config;
    const baseUrl = String(configuration.supabaseUrl || config.supabaseUrl || "").replace(/\/$/, "");
    const anonKey = configuration.supabaseAnonKey || config.supabaseAnonKey;
    const response = await window.fetch(`${baseUrl}/rest/v1/rpc/paragon_request_count`, {
      method: "POST",
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "Content-Type": "application/json" },
      body: "{}"
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Request count is temporarily unavailable (${response.status}).`);
    const value = text ? JSON.parse(text) : 0;
    return Math.max(0, Number(value) || 0);
  }

  async function getWebsiteRequestEligibility() {
    const session = await currentSession();
    if (!session?.user?.id) throw new Error("Sign in to check website request eligibility.");
    const rows = await auth.authenticatedFetch(`/rest/v1/paragon_website_requests?user_id=eq.${encodeURIComponent(session.user.id)}&select=created_at&order=created_at.desc&limit=1`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    const lastSubmittedAt = Array.isArray(rows) && rows[0]?.created_at ? rows[0].created_at : null;
    const lastTime = lastSubmittedAt ? new Date(lastSubmittedAt).getTime() : 0;
    const nextEligibleAt = lastTime ? new Date(lastTime + 7 * 24 * 60 * 60 * 1000).toISOString() : null;
    return {
      allowed: !lastTime || Date.now() >= new Date(nextEligibleAt).getTime(),
      lastSubmittedAt,
      nextEligibleAt
    };
  }

  async function submitWebsiteRequest(request) {
    const session = await currentSession();
    if (!session?.user?.id) throw new Error("Sign in to submit a website request. Guest drafts remain session-only.");
    const rows = await auth.authenticatedFetch("/rest/v1/paragon_website_requests", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: session.user.id,
        website_name: request.websiteName,
        website_url: request.websiteUrl || null,
        category: request.category || null,
        reason: request.reason,
        need_reason: request.needReason || null,
        contact_email: request.contactEmail || null,
        terms_acknowledged: Boolean(request.termsAcknowledged)
      })
    });
    return Array.isArray(rows) ? rows[0] : rows;
  }

  function clearCache() {
    cachedState = null;
  }

  auth?.onAuthStateChange(event => {
    if (event === "SIGNED_OUT") clearCache();
  });

  window.ParagonSync = {
    emptyState,
    normalizeState,
    loadState,
    saveState,
    getWebsiteRequestCount,
    getWebsiteRequestEligibility,
    submitWebsiteRequest,
    clearCache,
    getCachedState: () => cachedState ? structuredCloneSafe(cachedState) : null
  };

  // Shared API for every product route under the same origin.
  window.ParagonProgress = {
    load: loadProductProgress,
    save: saveProductProgress,
    remove: removeProductProgress,
    clearCache
  };
})();
