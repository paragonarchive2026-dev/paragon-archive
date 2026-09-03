/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: supabase-auth.js
  EXPECTED PROJECT PATH: /auth/supabase-auth.js
  ROLE: Dependency-free Supabase Google and Email authentication client.
  RESTORE/LOAD NOTE: Restore under auth/. Load after config/supabase.js and before auth/paragon-sync.js.
*/
/* ============================================
   PARAGON ARCHIVE — SUPABASE AUTH CLIENT
   Dependency-free browser client using Supabase Auth REST endpoints.
   ============================================ */

(() => {
  const config = window.ParagonConfig || {};
  const sessionKey = "paragonArchive.supabaseSession.v1";
  const listeners = new Set();

  function baseUrl() {
    return String(config.supabaseUrl || "").replace(/\/$/, "");
  }

  function isConfigured() {
    try {
      const url = new URL(baseUrl());
      return url.protocol === "https:" && String(config.supabaseAnonKey || "").length > 20;
    } catch (error) {
      return false;
    }
  }

  function configurationError() {
    return new Error("Supabase is not configured. Add the project URL and anon key in config/supabase.js.");
  }

  function getRedirectUrl() {
    if (config.authRedirectUrl) return config.authRedirectUrl;
    return `${window.location.origin}${window.location.pathname}`;
  }

  function readSession() {
    try {
      const value = JSON.parse(window.localStorage.getItem(sessionKey) || "null");
      return value && value.access_token ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeSession(session) {
    if (!session?.access_token) return null;
    const normalized = {
      ...session,
      expires_at: Number(session.expires_at || (Date.now() / 1000 + Number(session.expires_in || 3600)))
    };
    window.localStorage.setItem(sessionKey, JSON.stringify(normalized));
    return normalized;
  }

  function clearSession() {
    try { window.localStorage.removeItem(sessionKey); } catch (error) { /* ignore */ }
  }

  function emit(event, session) {
    listeners.forEach(listener => {
      try { listener(event, session); } catch (error) { console.error(error); }
    });
  }

  async function parseResponse(response) {
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (error) { body = text; }
    if (!response.ok) {
      const message = body?.msg || body?.message || body?.error_description || body?.error || `Authentication request failed (${response.status}).`;
      const authError = new Error(message);
      authError.status = response.status;
      authError.details = body;
      throw authError;
    }
    return body;
  }

  async function authRequest(path, options = {}, accessToken = null) {
    if (!isConfigured()) throw configurationError();
    const headers = {
      apikey: config.supabaseAnonKey,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const response = await window.fetch(`${baseUrl()}/auth/v1${path}`, { ...options, headers });
    return parseResponse(response);
  }

  async function fetchUser(accessToken) {
    return authRequest("/user", { method: "GET" }, accessToken);
  }

  async function refreshSession(refreshToken) {
    if (!refreshToken) { clearSession(); return null; }
    try {
      const session = await authRequest("/token?grant_type=refresh_token", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      const user = session.user || await fetchUser(session.access_token);
      const stored = writeSession({ ...session, user });
      emit("TOKEN_REFRESHED", stored);
      return stored;
    } catch (error) {
      clearSession();
      emit("SIGNED_OUT", null);
      throw error;
    }
  }

  async function getSession({ refresh = true } = {}) {
    const session = readSession();
    if (!session) return null;
    const expiresInSeconds = Number(session.expires_at || 0) - Date.now() / 1000;
    if (refresh && expiresInSeconds < 90) return refreshSession(session.refresh_token);
    if (!session.user) {
      try {
        session.user = await fetchUser(session.access_token);
        writeSession(session);
      } catch (error) {
        clearSession();
        return null;
      }
    }
    return session;
  }

  async function signInWithPassword(email, password) {
    const session = await authRequest("/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    const stored = writeSession(session);
    emit("SIGNED_IN", stored);
    return stored;
  }

  async function checkUsernameAvailability(username) {
    if (!isConfigured()) throw configurationError();
    const candidate = String(username || "").trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(candidate)) return false;
    const response = await window.fetch(`${baseUrl()}/rest/v1/rpc/paragon_username_available`, {
      method: "POST",
      headers: { apikey: config.supabaseAnonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ candidate })
    });
    return Boolean(await parseResponse(response));
  }

  async function getProfile() {
    const session = await getSession();
    if (!session?.user?.id) return null;
    const rows = await authenticatedFetch(`/rest/v1/paragon_profiles?user_id=eq.${encodeURIComponent(session.user.id)}&select=username,display_name,created_at`, { method: "GET" });
    return Array.isArray(rows) ? rows[0] || null : null;
  }

  async function signUpWithPassword(email, password, displayName = "", username = "") {
    const normalizedUsername = String(username || "").trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) throw new Error("Username must be 3–24 characters using letters, numbers, or underscores.");
    const result = await authRequest(`/signup?redirect_to=${encodeURIComponent(getRedirectUrl())}`, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        data: { ...(displayName ? { display_name: displayName } : {}), username: normalizedUsername }
      })
    });
    if (result?.access_token) {
      const stored = writeSession(result);
      emit("SIGNED_IN", stored);
      return { ...result, session: stored };
    }
    emit("SIGNUP_REQUIRES_CONFIRMATION", null);
    return { ...result, session: null };
  }

  function signInWithGoogle() {
    if (!isConfigured()) throw configurationError();
    const url = new URL(`${baseUrl()}/auth/v1/authorize`);
    url.searchParams.set("provider", "google");
    url.searchParams.set("redirect_to", getRedirectUrl());
    url.searchParams.set("scopes", "openid email profile");
    window.location.assign(url.toString());
  }

  async function handleOAuthCallback() {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    if (!hash.includes("access_token=")) return null;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken) return null;
    const user = await fetchUser(accessToken);
    const stored = writeSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: Number(params.get("expires_in") || 3600),
      token_type: params.get("token_type") || "bearer",
      auth_type: params.get("type") || "oauth",
      user
    });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    emit("SIGNED_IN", stored);
    return stored;
  }

  async function resetPasswordForEmail(email) {
    return authRequest("/recover", {
      method: "POST",
      body: JSON.stringify({ email, redirect_to: getRedirectUrl() })
    });
  }

  async function updatePassword(password) {
    const session = await getSession();
    if (!session) throw new Error("You must be signed in to update your password.");
    return authRequest("/user", { method: "PUT", body: JSON.stringify({ password }) }, session.access_token);
  }

  async function signOut() {
    const session = readSession();
    try {
      if (session?.access_token && isConfigured()) await authRequest("/logout", { method: "POST" }, session.access_token);
    } finally {
      clearSession();
      emit("SIGNED_OUT", null);
    }
  }

  async function authenticatedFetch(path, options = {}) {
    if (!isConfigured()) throw configurationError();
    const session = await getSession();
    if (!session) throw new Error("Authentication required.");
    const response = await window.fetch(`${baseUrl()}${path}`, {
      ...options,
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    return parseResponse(response);
  }

  function onAuthStateChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  window.ParagonAuth = {
    isConfigured,
    getConfiguration: () => ({ ...config, configured: isConfigured(), redirectUrl: getRedirectUrl() }),
    getSession,
    getCurrentUser: async () => (await getSession())?.user || null,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    checkUsernameAvailability,
    getProfile,
    resetPasswordForEmail,
    updatePassword,
    handleOAuthCallback,
    authenticatedFetch,
    signOut,
    onAuthStateChange,
    clearLocalSession: clearSession,
    _debug: { readSession, writeSession, sessionKey }
  };
})();
