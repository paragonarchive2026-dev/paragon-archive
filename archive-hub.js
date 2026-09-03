/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: archive-hub.js
  EXPECTED PROJECT PATH: /archive-hub.js
  ROLE: Consolidated Archive Hub navigation, disclosures, privacy-adjacent UI, Request a Website, Help & Support, status, and Deployed form preview.
  RESTORE/LOAD NOTE: Keep at project root. Load after config/auth/sync/privacy on paragon-archive-hub.html.
*/

(() => {
  const byId = id => document.getElementById(id);

  function updateDescriptionCount() {
    const input = byId("hub-description");
    const output = byId("hub-description-count");
    if (input && output) output.textContent = `${input.value.length} / 1000 characters`;
  }

  function syncPremiumField() {
    const premium = document.querySelector('input[name="pricing"]:checked')?.value === "premium";
    const field = byId("hub-premium-field");
    const details = byId("hub-premium-details");
    if (field) field.hidden = !premium;
    if (details) details.required = premium;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 bytes";
    const units = ["bytes", "KB", "MB", "GB"];
    const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
  }

  function validatePreviewFiles() {
    const archive = byId("hub-website-files")?.files?.[0];
    const icon = byId("hub-website-icon")?.files?.[0];
    const screenshots = [...(byId("hub-screenshots")?.files || [])];
    if (archive && archive.size > 50 * 1024 * 1024) return "Website ZIP must be 50MB or smaller.";
    if (archive && !/\.zip$/i.test(archive.name || "")) return "Website files must use a ZIP archive.";
    if (icon && icon.type !== "image/png") return "Website icon must be a PNG file.";
    if (screenshots.length && (screenshots.length < 3 || screenshots.length > 8)) return "Choose between 3 and 8 screenshots for a future submission.";
    if (screenshots.some(file => !["image/png", "image/jpeg", "image/webp"].includes(file.type))) return "Screenshots must be PNG, JPG, or WebP files.";
    return "";
  }

  function updateLocalFileGuidance(input) {
    const small = input?.closest("label")?.querySelector("small");
    if (!small) return;
    const files = [...(input.files || [])];
    small.textContent = files.length
      ? `${files.length} local file${files.length === 1 ? "" : "s"} selected · ${formatBytes(files.reduce((sum, file) => sum + Number(file.size || 0), 0))} · not uploaded`
      : "Local selection preview only; no upload endpoint is connected.";
  }

  function handleDeployPreview(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = byId("hub-deploy-status");
    const fileError = validatePreviewFiles();
    if (!form.checkValidity()) {
      form.reportValidity?.();
      if (status) {
        status.textContent = "Complete the required preview fields. Nothing has been sent.";
        status.className = "hub-form-status error";
      }
      return;
    }
    if (fileError) {
      if (status) {
        status.textContent = `${fileError} Nothing has been sent.`;
        status.className = "hub-form-status error";
      }
      return;
    }
    if (status) {
      status.textContent = "Your local draft looks ready. Deployed submissions are not open, so no data or files were sent.";
      status.className = "hub-form-status success";
    }
  }

  function updateStatusTimestamp() {
    const element = byId("hub-status-checked");
    if (!element) return;
    const now = new Date();
    element.textContent = `Last checked: ${now.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} — local page check, not production uptime monitoring.`;
  }

  function bindSectionNavigation() {
    const links = [...document.querySelectorAll(".hub-section-nav a[href^='#']")];
    const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if (!("IntersectionObserver" in window) || !sections.length) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-18% 0px -68%", threshold: [0, 0.15, 0.4] });
    sections.forEach(section => observer.observe(section));
  }

  function setupConditionalDisclosures() {
    const selectors = [
      ".hub-integrated-page .about-section",
      ".hub-integrated-page .request-intro-card",
      "#privacy-policy .legal-article > section:not(.legal-controls)",
      "#help .support-intro-card",
      "#help .support-bug-card",
      "#help .support-faq-card",
      "#help .support-docs-card",
      "#terms .hub-policy-card",
      "#community-guidelines .hub-policy-card",
      "#cookie-policy .hub-policy-card",
      "#developers .hub-policy-card",
      "#deployed .hub-policy-card:not(.hub-deploy-form-card)"
    ];
    const cards = [...document.querySelectorAll(selectors.join(","))];
    cards.forEach((card, index) => {
      if (card.dataset.disclosureReady === "true") return;
      const children = [...card.children];
      if (children.length < 2) return;
      let keepIndex = children.findIndex(child => child.matches?.("h2,h3,.support-bug-heading,.support-section-heading,.about-section-label"));
      if (children[keepIndex]?.classList?.contains("about-section-label") && children[keepIndex + 1]?.matches?.("h2")) keepIndex += 1;
      if (keepIndex < 0) keepIndex = 0;
      const movable = children.slice(keepIndex + 1);
      if (!movable.length) return;
      const content = document.createElement("div");
      content.className = "hub-disclosure-content collapsed";
      const contentId = `hub-disclosure-${index + 1}`;
      content.id = contentId;
      movable.forEach(child => content.appendChild(child));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "hub-disclosure-toggle";
      button.textContent = "Show details";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", contentId);
      button.addEventListener("click", () => {
        const expanded = content.classList.toggle("expanded");
        content.classList.toggle("collapsed", !expanded);
        button.textContent = expanded ? "Hide details" : "Show details";
        button.setAttribute("aria-expanded", String(expanded));
      });
      card.append(content, button);
      card.dataset.disclosureReady = "true";
      requestAnimationFrame(() => {
        const needsDisclosure = content.scrollHeight > 230;
        button.hidden = !needsDisclosure;
        if (!needsDisclosure) content.classList.remove("collapsed");
      });
    });
  }

  function initialize() {
    try { if (window.self !== window.top) document.documentElement.classList.add("embedded-hub"); } catch (error) { document.documentElement.classList.add("embedded-hub"); }
    byId("hub-back")?.addEventListener("click", () => {
      /* P-094/P-096 — Back returns to Hub Home first from any section; only from Home itself
         does it fall back to browser history / the Archive. Reads the shared view state the
         pages module publishes (paragonHubCurrentView) — no cross-scope references. */
      const currentView = window.paragonHubCurrentView || (window.location.hash || "#home").replace("#", "").toLowerCase() || "home";
      if (currentView !== "home") {
        window.location.hash = "#home";
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
      if (window.history?.length > 1) window.history.back();
      else window.location.href = "paragon-archive.html";
    });
    byId("hub-description")?.addEventListener("input", updateDescriptionCount);
    document.querySelectorAll('input[name="pricing"]').forEach(input => input.addEventListener("change", syncPremiumField));
    ["hub-website-files", "hub-website-icon", "hub-screenshots"].forEach(id => byId(id)?.addEventListener("change", event => updateLocalFileGuidance(event.currentTarget)));
    byId("hub-deploy-form")?.addEventListener("submit", handleDeployPreview);
    updateDescriptionCount();
    syncPremiumField();
    updateStatusTimestamp();
    bindSectionNavigation();
    setupConditionalDisclosures();
  }

  window.ParagonArchiveHub = {
    initialize,
    updateDescriptionCount,
    syncPremiumField,
    validatePreviewFiles,
    setupConditionalDisclosures
  };

  document.addEventListener("DOMContentLoaded", initialize);
})();


/* --- CONSOLIDATED REQUEST A WEBSITE CONTROLLER --- */
(() => {
  const guestSessionKey = "paragonArchive.guestSession.v1";
  const guestDraftKey = "paragonArchive.guestRequestDraft.v1";
  const requestWindowMs = 7 * 24 * 60 * 60 * 1000;
  const categories = [
    ["🛠️", "Tools"],
    ["🎨", "Creative"],
    ["📚", "Education"],
    ["💬", "Social"],
    ["🎧", "Entertainment"],
    ["🎮", "Games"],
    ["💰", "Finance"],
    ["🍎", "Health"],
    ["💻", "Dev Tools"],
    ["✨", "Other"]
  ];

  let identityMode = "loading";
  let authenticatedUser = null;
  let requestEligibility = { allowed: true, lastSubmittedAt: null, nextEligibleAt: null };
  let submitting = false;

  function element(id) {
    return document.getElementById(id);
  }

  function guestIsActive() {
    try { return window.sessionStorage.getItem(guestSessionKey) === "true"; }
    catch (error) { return false; }
  }

  function readGuestDraft() {
    try { return JSON.parse(window.sessionStorage.getItem(guestDraftKey) || "null") || {}; }
    catch (error) { return {}; }
  }

  function writeGuestDraft(request) {
    window.sessionStorage.setItem(guestDraftKey, JSON.stringify(request));
  }

  function setStatus(message, tone = "") {
    const status = element("request-page-status");
    if (!status) return;
    status.textContent = message;
    status.className = `auth-form-status ${tone}`.trim();
  }

  function setIdentity(message, tone) {
    const status = element("request-identity-status");
    if (!status) return;
    status.textContent = message;
    status.className = `request-identity-status ${tone || ""}`.trim();
  }

  async function loadRequestCount() {
    const number = element("request-counter-number");
    const wrapper = element("request-counter-value");
    if (!number || !wrapper) return 0;
    let count = 0;
    try { count = await window.ParagonSync?.getWebsiteRequestCount?.() || 0; }
    catch (error) { count = 0; }
    count = Math.max(0, Number(count) || 0);
    number.textContent = count.toLocaleString();
    wrapper.setAttribute("aria-label", `${count} website request${count === 1 ? "" : "s"}`);
    return count;
  }

  function populateCategories() {
    const select = element("request-page-category");
    if (!select) return;
    select.innerHTML = `<option value="">Select a category</option>${categories.map(([icon, name]) => `<option value="${name}">${icon} ${name}</option>`).join("")}`;
  }

  function populateDraft() {
    const draft = readGuestDraft();
    if (!draft || !Object.keys(draft).length) return;
    element("request-page-name").value = draft.websiteName || "";
    element("request-page-category").value = draft.category || "";
    element("request-page-reason").value = draft.reason || "";
    element("request-page-need").value = draft.needReason || "";
    element("request-page-email").value = draft.contactEmail || "";
    updateCharacterCounts();
    setStatus("Your temporary Guest draft has been restored.", "success");
  }

  function requestFromForm() {
    return {
      websiteName: element("request-page-name").value.trim(),
      websiteUrl: "",
      category: element("request-page-category").value,
      reason: element("request-page-reason").value.trim(),
      needReason: element("request-page-need").value.trim(),
      contactEmail: element("request-page-email").value.trim(),
      termsAcknowledged: Boolean(element("request-page-acknowledgement").checked)
    };
  }

  function updateCharacterCount(inputId, outputId, maximum) {
    const input = element(inputId);
    const output = element(outputId);
    if (!input || !output) return;
    output.textContent = `${String(input.value || "").length} / ${maximum} characters`;
  }

  function updateCharacterCounts() {
    updateCharacterCount("request-page-reason", "request-page-reason-count", 1000);
    updateCharacterCount("request-page-need", "request-page-need-count", 500);
  }

  function bindCharacterCounters() {
    element("request-page-reason")?.addEventListener("input", updateCharacterCounts);
    element("request-page-need")?.addEventListener("input", updateCharacterCounts);
    updateCharacterCounts();
  }

  function formatEligibilityDate(value) {
    if (!value) return "after the 7-day waiting period";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "after the 7-day waiting period";
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }

  function syncSubmitAction() {
    const button = element("request-page-submit");
    if (!button) return;
    if (submitting) {
      button.disabled = true;
      button.textContent = "SUBMITTING…";
      return;
    }
    if (identityMode === "loading") {
      button.disabled = true;
      button.textContent = "CHECKING ACCOUNT…";
      return;
    }
    if (identityMode === "authenticated" && !requestEligibility.allowed) {
      button.disabled = true;
      button.textContent = "7-DAY LIMIT ACTIVE";
      return;
    }
    button.disabled = false;
    if (identityMode === "guest") button.textContent = "SAVE GUEST DRAFT 💡";
    else if (identityMode === "signed-out") button.textContent = "SIGN IN TO SUBMIT 💡";
    else button.textContent = "SUBMIT MY REQUEST 💡";
  }

  async function loadEligibility() {
    if (!window.ParagonSync?.getWebsiteRequestEligibility) {
      requestEligibility = { allowed: true, lastSubmittedAt: null, nextEligibleAt: null };
      return requestEligibility;
    }
    requestEligibility = await window.ParagonSync.getWebsiteRequestEligibility();
    return requestEligibility;
  }

  async function identifyVisitor() {
    identityMode = "loading";
    syncSubmitAction();
    try {
      const session = await window.ParagonAuth?.getSession?.();
      if (session?.user?.id) {
        identityMode = "authenticated";
        authenticatedUser = session.user;
        const label = session.user.email || session.user.user_metadata?.display_name || "your Paragon account";
        if (session.user.email && !element("request-page-email").value) element("request-page-email").value = session.user.email;
        try { await loadEligibility(); }
        catch (error) { requestEligibility = { allowed: true, lastSubmittedAt: null, nextEligibleAt: null }; }
        if (requestEligibility.allowed) {
          setIdentity(`Signed in as ${label}. Your account is eligible to submit one request.`, "authenticated");
        } else {
          setIdentity(`Signed in as ${label}. You already submitted a request and can submit again ${formatEligibilityDate(requestEligibility.nextEligibleAt)}.`, "rate-limited");
        }
        element("request-account-link")?.setAttribute("hidden", "");
        syncSubmitAction();
        return identityMode;
      }
    } catch (error) {
      setStatus(`Account status could not be checked: ${error.message}`, "error");
    }

    if (guestIsActive()) {
      identityMode = "guest";
      authenticatedUser = null;
      setIdentity("Guest session active. You can save a temporary draft, but a Paragon account is required to submit it.", "guest");
      populateDraft();
      syncSubmitAction();
      return identityMode;
    }

    identityMode = "signed-out";
    authenticatedUser = null;
    setIdentity("You are signed out. Sign in to submit, or continue as Guest to save a session-only draft.", "signed-out");
    syncSubmitAction();
    return identityMode;
  }

  function validOptionalEmail(value) {
    return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function submitRequest(event) {
    event?.preventDefault?.();
    const request = requestFromForm();
    if (request.websiteName.length < 2) {
      setStatus("Please give your idea a name of at least 2 characters.", "error");
      return { mode: identityMode, submitted: false };
    }
    if (!request.category) {
      setStatus("Please select a category for your idea.", "error");
      return { mode: identityMode, submitted: false };
    }
    if (request.reason.length < 10) {
      setStatus("Please describe what the website should do in at least 10 characters.", "error");
      return { mode: identityMode, submitted: false };
    }
    if (request.needReason.length < 10) {
      setStatus("Please explain why people need this in at least 10 characters.", "error");
      return { mode: identityMode, submitted: false };
    }
    if (!validOptionalEmail(request.contactEmail)) {
      setStatus("Please enter a valid email address or leave the email field empty.", "error");
      return { mode: identityMode, submitted: false };
    }
    if (!request.termsAcknowledged) {
      setStatus("Please confirm that submitting a request does not guarantee it will be built.", "error");
      return { mode: identityMode, submitted: false };
    }

    if (identityMode === "guest") {
      try {
        writeGuestDraft({ ...request, termsAcknowledged: false });
        setStatus("Guest draft saved for this session. Sign in to submit it to Paragon.", "success");
        return { mode: "guest", submitted: false, draftSaved: true };
      } catch (error) {
        setStatus("This browser could not save the temporary Guest draft.", "error");
        return { mode: "guest", submitted: false, draftSaved: false };
      }
    }

    if (identityMode !== "authenticated" || !authenticatedUser) {
      setStatus("Sign in with a Paragon account to submit this request. Guest mode can only save a draft.", "error");
      element("request-account-link")?.focus?.({ preventScroll: true });
      return { mode: "signed-out", submitted: false };
    }

    if (!requestEligibility.allowed) {
      setStatus(`You can submit one request every 7 days. Your next request is available ${formatEligibilityDate(requestEligibility.nextEligibleAt)}.`, "error");
      syncSubmitAction();
      return { mode: "authenticated", submitted: false, rateLimited: true };
    }

    submitting = true;
    syncSubmitAction();
    setStatus("Submitting your idea…");
    try {
      await window.ParagonSync.submitWebsiteRequest(request);
      element("request-page-form").reset();
      updateCharacterCounts();
      requestEligibility = {
        allowed: false,
        lastSubmittedAt: new Date().toISOString(),
        nextEligibleAt: new Date(Date.now() + requestWindowMs).toISOString()
      };
      setIdentity(`Request received. You can submit another request ${formatEligibilityDate(requestEligibility.nextEligibleAt)}.`, "rate-limited");
      setStatus(request.contactEmail ? "Request submitted. Watch your inbox for our confirmation email." : "Request submitted. Your receipt is waiting in your Paragon Archive notifications.", "success");
      await loadRequestCount();
      return { mode: "authenticated", submitted: true };
    } catch (error) {
      const message = String(error?.message || "Your request could not be submitted.");
      if (/REQUEST_RATE_LIMIT|one request every 7 days|rate limit/i.test(message)) {
        try { await loadEligibility(); } catch (eligibilityError) {
          requestEligibility = { allowed: false, lastSubmittedAt: null, nextEligibleAt: new Date(Date.now() + requestWindowMs).toISOString() };
        }
        setIdentity(`Your 7-day request limit is active. You can submit again ${formatEligibilityDate(requestEligibility.nextEligibleAt)}.`, "rate-limited");
        setStatus("You can submit only one request every 7 days.", "error");
        return { mode: "authenticated", submitted: false, rateLimited: true };
      }
      setStatus(message, "error");
      return { mode: "authenticated", submitted: false };
    } finally {
      submitting = false;
      syncSubmitAction();
    }
  }

  async function initialize() {
    populateCategories();
    bindCharacterCounters();
    element("request-page-form")?.addEventListener("submit", submitRequest);
    await loadRequestCount();
    await identifyVisitor();
  }

  window.ParagonWebsiteRequest = {
    categories: categories.map(([, name]) => name),
    initialize,
    identifyVisitor,
    submitRequest,
    loadRequestCount,
    updateCharacterCounts,
    getIdentityMode: () => identityMode,
    getEligibility: () => ({ ...requestEligibility })
  };

  document.addEventListener("DOMContentLoaded", initialize);
})();


/* --- CONSOLIDATED HELP & SUPPORT CONTROLLER --- */
(() => {
  const maximumAttachmentBytes = 10 * 1024 * 1024;
  const allowedAttachmentTypes = new Set(["image/png", "image/jpeg", "image/gif"]);
  const topics = new Set(["General Question", "Bug Report", "Account Issue", "Website Not Loading", "Privacy Concern", "Feature Suggestion", "Other"]);
  let selectedFile = null;
  let submitting = false;

  function element(id) {
    return document.getElementById(id);
  }

  function setStatus(message, tone = "") {
    const status = element("support-status");
    if (!status) return;
    status.textContent = message;
    status.className = `auth-form-status ${tone}`.trim();
  }

  function updateCharacterCount() {
    const input = element("support-message");
    const output = element("support-message-count");
    if (input && output) output.textContent = `${String(input.value || "").length} / 2000 characters`;
  }

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function validateFile(file) {
    if (!file) return { valid: true };
    if (!allowedAttachmentTypes.has(String(file.type || "").toLowerCase())) return { valid: false, message: "Attach a PNG, JPG, or GIF image only." };
    if (Number(file.size || 0) > maximumAttachmentBytes) return { valid: false, message: "The screenshot must be 10MB or smaller." };
    return { valid: true };
  }

  function showSelectedFile(file) {
    selectedFile = file || null;
    const state = element("support-file-state");
    const name = element("support-file-name");
    const dropZone = element("support-drop-zone");
    if (!state || !name) return;
    if (!selectedFile) {
      state.hidden = true;
      name.textContent = "";
      dropZone?.classList?.remove("has-file");
      return;
    }
    name.textContent = `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`;
    state.hidden = false;
    dropZone?.classList?.add("has-file");
  }

  function chooseFile(file) {
    const validation = validateFile(file);
    if (!validation.valid) {
      showSelectedFile(null);
      const input = element("support-attachment");
      if (input) input.value = "";
      setStatus(validation.message, "error");
      return false;
    }
    showSelectedFile(file);
    setStatus("");
    return true;
  }

  function removeFile() {
    const input = element("support-attachment");
    if (input) input.value = "";
    showSelectedFile(null);
  }

  function readForm() {
    return {
      name: element("support-name").value.trim(),
      email: element("support-email").value.trim(),
      topic: element("support-topic").value,
      message: element("support-message").value.trim(),
      company: element("support-company").value.trim()
    };
  }

  function validateMessage(values) {
    if (values.name.length < 2) return "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return "Please enter a valid email address so we can reply.";
    if (!topics.has(values.topic)) return "Please select what you need help with.";
    if (values.message.length < 20) return "Please describe the issue in at least 20 characters.";
    if (values.message.length > 2000) return "Your message must be 2,000 characters or fewer.";
    const fileValidation = validateFile(selectedFile);
    if (!fileValidation.valid) return fileValidation.message;
    return "";
  }

  function setSubmitting(active) {
    submitting = active;
    const button = element("support-submit");
    if (!button) return;
    button.disabled = active;
    button.textContent = active ? "SENDING…" : "SEND MESSAGE 📬";
  }

  function supportEndpoint() {
    const base = String(window.ParagonConfig?.supabaseUrl || "").replace(/\/$/, "");
    return base ? `${base}/functions/v1/submit-support-message` : "";
  }

  async function currentSession() {
    try { return await window.ParagonAuth?.getSession?.(); }
    catch (error) { return null; }
  }

  async function prefillAccount() {
    const session = await currentSession();
    const user = session?.user;
    if (!user) return;
    const name = user.user_metadata?.display_name || user.user_metadata?.full_name || "";
    if (name && !element("support-name").value) element("support-name").value = name;
    if (user.email && !element("support-email").value) element("support-email").value = user.email;
  }

  async function submitSupportMessage(event) {
    event?.preventDefault?.();
    if (submitting) return { submitted: false };
    const values = readForm();
    if (values.company) return { submitted: false, bot: true };
    const error = validateMessage(values);
    if (error) {
      setStatus(error, "error");
      return { submitted: false };
    }

    const endpoint = supportEndpoint();
    const anonKey = String(window.ParagonConfig?.supabaseAnonKey || "");
    if (!endpoint || anonKey.length < 20) {
      setStatus("Support submission will work after Supabase activation. Please use Direct Email for now.", "error");
      return { submitted: false, configurationPending: true };
    }

    const session = await currentSession();
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("topic", values.topic);
    formData.append("message", values.message);
    formData.append("company", values.company);
    if (selectedFile) formData.append("attachment", selectedFile, selectedFile.name);

    setSubmitting(true);
    setStatus("Sending your message…");
    try {
      const response = await window.fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${session?.access_token || anonKey}`
        },
        body: formData
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || `Support submission failed (${response.status}).`);
      element("support-form").reset();
      removeFile();
      updateCharacterCount();
      setStatus("Message sent. A real person from the Paragon team will respond within 72 hours.", "success");
      return { submitted: true, id: result.id };
    } catch (submissionError) {
      const message = String(submissionError?.message || "Your message could not be sent.");
      setStatus(/SUPPORT_RATE_LIMIT|three support messages/i.test(message) ? "You have reached the support-message limit. Please try again after 24 hours or use Direct Email if the issue is urgent." : message, "error");
      return { submitted: false };
    } finally {
      setSubmitting(false);
    }
  }

  function bindUpload() {
    const input = element("support-attachment");
    const dropZone = element("support-drop-zone");
    input?.addEventListener("change", () => chooseFile(input.files?.[0] || null));
    element("support-file-remove")?.addEventListener("click", removeFile);
    dropZone?.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input?.click();
      }
    });
    ["dragenter", "dragover"].forEach(type => dropZone?.addEventListener(type, event => {
      event.preventDefault();
      dropZone.classList.add("drag-active");
    }));
    ["dragleave", "drop"].forEach(type => dropZone?.addEventListener(type, event => {
      event.preventDefault();
      dropZone.classList.remove("drag-active");
    }));
    dropZone?.addEventListener("drop", event => chooseFile(event.dataTransfer?.files?.[0] || null));
  }

  async function initialize() {
    element("support-message")?.addEventListener("input", updateCharacterCount);
    element("support-form")?.addEventListener("submit", submitSupportMessage);
    bindUpload();
    updateCharacterCount();
    await prefillAccount();
  }

  window.ParagonSupport = {
    initialize,
    submitSupportMessage,
    updateCharacterCount,
    validateFile,
    chooseFile,
    removeFile,
    getSelectedFile: () => selectedFile,
    topics: [...topics]
  };

  document.addEventListener("DOMContentLoaded", initialize);
})();

/*
  P-034 — Archive Hub three-page structure: Documentation, Community, and Team.
  Documentation holds the entire former Hub landing content and all of its anchors.
  Community join is restricted to real authenticated Paragon accounts (never Guest)
  and links membership to the account exactly once. Team is a protected-login
  template that performs no fake authentication.
*/
(() => {
  const byId = id => document.getElementById(id);
  const PAGES = ["home", "documentation", "community", "team"];
  // Full-screen Hub views reachable from landing "See all" links; they behave like pages
  // but keep the four top tabs (no tab is highlighted while a view is open).
  const VIEWS = { "roadmap-full": "roadmap" };

  function pageFromHash(hash) {
    const clean = String(hash || "").replace(/^#/, "").toLowerCase();
    if (VIEWS[clean]) return VIEWS[clean];
    return PAGES.includes(clean) ? clean : clean ? "documentation" : "home";
  }

  let currentHubView = "home";
  window.paragonHubCurrentView = currentHubView; // P-096 — shared with the topbar module above
  function showHubPage(page, anchorHash) {
    currentHubView = page;
    window.paragonHubCurrentView = page;
    const panels = [...PAGES, ...Object.values(VIEWS)];
    panels.forEach(name => {
      const panel = byId(`hub-page-${name}`);
      if (!panel) return;
      const show = name === page;
      if (show && panel.hidden) {
        panel.hidden = false;
        // Modern entrance: re-trigger the panel transition each time a page opens.
        panel.classList.remove("hub-panel-enter");
        void panel.offsetWidth;
        panel.classList.add("hub-panel-enter");
      } else if (!show) {
        panel.hidden = true;
      }
    });
    if (page === "roadmap") animateRoadmapProgress();
    if (page === "home") observeLandingReveals();
    /* P-094 — the Back button appears exactly like the legal-pages top bar: hidden on Hub Home,
       visible whenever any other section/page is viewed, and returns to Home first. */
    const backButton = byId("hub-back");
    if (backButton) {
      backButton.hidden = page === "home";
      backButton.setAttribute("aria-hidden", String(page === "home"));
    }
    document.querySelectorAll("#hub-top-nav .hub-top-tab").forEach(tab => {
      const active = tab.dataset.hubPage === page;
      tab.classList.toggle("active", active);
      if (active) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
    if (anchorHash) {
      requestAnimationFrame(() => document.querySelector(anchorHash)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } else if (page !== "documentation") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function applyLocationHash() {
    const hash = window.location.hash || "";
    const clean = hash.replace(/^#/, "").toLowerCase();
    if (VIEWS[clean]) { showHubPage(VIEWS[clean], ""); return; }
    if (PAGES.includes(clean)) { showHubPage(clean, ""); return; }
    if (!clean) { showHubPage("home", ""); return; }
    // Landing-local anchors stay on Home; every other anchor lives inside Documentation.
    if (clean.startsWith("landing-")) { showHubPage("home", hash); return; }
    showHubPage("documentation", hash);
  }

  async function currentHubSession() {
    try { return await window.ParagonAuth?.getSession?.(); }
    catch (error) { return null; }
  }

  function membershipKey(userId) { return `paragonCommunityMembership:${userId}`; }

  function readMembership(userId) {
    try { return JSON.parse(window.localStorage.getItem(membershipKey(userId)) || "null"); }
    catch (error) { return null; }
  }

  function writeMembership(userId, record) {
    try { window.localStorage.setItem(membershipKey(userId), JSON.stringify(record)); } catch (error) { /* storage may be blocked */ }
  }

  function setJoinStatus(text, tone) {
    const status = byId("community-join-status");
    if (!status) return;
    status.textContent = text;
    status.dataset.tone = tone || "info";
  }

  function setCommunityStep(step, state) {
    const item = document.querySelector(`[data-community-step="${step}"]`);
    if (item) item.dataset.state = state; // "done" | "active" | "pending"
  }

  function emailVerified(user) {
    return Boolean(user?.email_confirmed_at || user?.confirmed_at);
  }

  function updateJoinSteps(user, membership) {
    const agree = byId("community-guidelines-agree")?.checked;
    const named = Boolean(byId("community-display-name")?.value.trim());
    setCommunityStep(1, user?.id ? "done" : "active");
    setCommunityStep(2, "done");
    setCommunityStep(3, membership ? "done" : agree ? "done" : user?.id ? "active" : "pending");
    setCommunityStep(4, membership ? "done" : user?.id ? (emailVerified(user) ? "done" : "active") : "pending");
    setCommunityStep(5, membership ? "done" : named ? "done" : user?.id ? "active" : "pending");
    setCommunityStep(6, membership ? "done" : "pending");
  }

  let communityUser = null;

  async function refreshCommunityCard() {
    const signinLink = byId("community-signin-link");
    const form = byId("community-join-form");
    const memberPanel = byId("community-member-panel");
    if (!form || !memberPanel || !signinLink) return;
    signinLink.hidden = true;
    form.hidden = true;
    memberPanel.hidden = true;
    const session = await currentHubSession();
    const user = session?.user;
    communityUser = user || null;
    if (!user?.id) {
      setJoinStatus("Step 1 first: you are not signed in with a Paragon account. Community membership is for real accounts only — temporary Guest sessions are not eligible.", "signed-out");
      signinLink.hidden = false;
      updateJoinSteps(null, null);
      return;
    }
    const membership = readMembership(user.id);
    if (membership?.joinedAt) {
      const joined = new Date(membership.joinedAt);
      const dateLabel = Number.isNaN(joined.getTime()) ? "an earlier date" : joined.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
      setJoinStatus(`Step 6 — you are in. Membership is linked to ${user.email || "your account"}, so you never need to join again.`, "member");
      const name = byId("community-member-name");
      const meta = byId("community-member-meta");
      if (name) name.textContent = membership.displayName || user.email || "Paragon member";
      if (meta) meta.textContent = `Joined ${dateLabel}${membership.interests?.length ? ` · Interests: ${membership.interests.join(", ")}` : ""}`;
      memberPanel.hidden = false;
      updateJoinSteps(user, membership);
      return;
    }
    setJoinStatus(`Signed in as ${user.email || "your Paragon account"}. Complete steps 3–5 below to join.`, "eligible");
    const emailState = byId("community-email-state");
    if (emailState) {
      emailState.textContent = emailVerified(user)
        ? "✅ Step 4 — your account email is verified."
        : "⏳ Step 4 — email verification pending. Supabase Auth sends the verification link when providers are activated; membership completes locally meanwhile and syncs later.";
      emailState.dataset.tone = emailVerified(user) ? "done" : "pending";
    }
    form.hidden = false;
    updateJoinSteps(user, null);
  }

  function bindCommunityForm() {
    const form = byId("community-join-form");
    if (!form) return;
    ["community-guidelines-agree", "community-display-name"].forEach(id => {
      byId(id)?.addEventListener("input", () => updateJoinSteps(communityUser, null));
      byId(id)?.addEventListener("change", () => updateJoinSteps(communityUser, null));
    });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const user = communityUser;
      if (!user?.id) { await refreshCommunityCard(); return; }
      if (!byId("community-guidelines-agree")?.checked) {
        setJoinStatus("Step 3 — accept the Community Guidelines checkbox before joining.", "signed-out");
        return;
      }
      const displayName = byId("community-display-name")?.value.trim() || "";
      if (!displayName) {
        setJoinStatus("Step 5 — choose your community display name before joining.", "signed-out");
        byId("community-display-name")?.focus();
        return;
      }
      const interests = [...document.querySelectorAll("#community-interest-chips input:checked")].map(input => input.value);
      if (!readMembership(user.id)) {
        writeMembership(user.id, {
          joinedAt: new Date().toISOString(),
          email: user.email || "",
          displayName,
          bio: byId("community-bio")?.value.trim() || "",
          interests,
          guidelinesAcceptedAt: new Date().toISOString(),
          emailVerifiedAtJoin: emailVerified(user),
          pendingBackendSync: true
        });
      }
      await refreshCommunityCard();
      populateLandingStats();
      byId("community-join-card")?.classList.add("hub-join-celebrate");
      window.setTimeout(() => byId("community-join-card")?.classList.remove("hub-join-celebrate"), 1400);
    });
  }

  async function joinCommunity() { byId("community-join-form")?.requestSubmit?.(); }

  function bindTeamLogin() {
    const form = byId("team-login-form");
    const status = byId("team-login-status");
    form?.addEventListener("submit", event => {
      event.preventDefault();
      const email = byId("team-login-email")?.value.trim() || "";
      const password = byId("team-login-password")?.value || "";
      if (!status) return;
      status.hidden = false;
      if (!email || !password) {
        status.textContent = "Enter your Team email and Access Key.";
        status.dataset.tone = "signed-out";
        return;
      }
      status.textContent = "Team authorization runs on a protected backend that is not activated yet. No login was attempted and no credentials were sent. Server-authorized Paragon Team access opens with that backend.";
      status.dataset.tone = "info";
    });
  }

  function countCommunityMembers() {
    let count = 0;
    try {
      for (let index = 0; index < window.localStorage.length; index += 1) {
        if (String(window.localStorage.key(index) || "").startsWith("paragonCommunityMembership:")) count += 1;
      }
    } catch (error) { /* storage may be blocked */ }
    return count;
  }

  async function populateLandingStats() {
    const catalogue = Array.isArray(window.ParagonSites) ? window.ParagonSites : [];
    const websites = byId("hub-stat-websites");
    const reviews = byId("hub-stat-reviews");
    const requests = byId("hub-stat-requests");
    const members = byId("hub-stat-members");
    const liveRequestCount = byId("hub-request-live-count");
    if (websites) websites.textContent = catalogue.length ? String(catalogue.length) : "—";
    /* P-097 — REAL user-written reviews only (the inherited catalogue samples never count). */
  let realReviewTotal = 0;
  try { realReviewTotal = (JSON.parse(window.localStorage.getItem("paragonArchive.reviewMirror.v1") || "null") || {}).total || 0; }
  catch (error) { realReviewTotal = 0; }
  try {
    const guestState = JSON.parse(window.sessionStorage.getItem("paragonArchive.guestState.v1") || "null");
    if (guestState?.reviews) realReviewTotal = Object.values(guestState.reviews).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), realReviewTotal);
  } catch (error) { /* blocked */ }
  if (reviews) reviews.textContent = String(realReviewTotal);
    if (members) members.textContent = String(countCommunityMembers());
    let requestCount = 0;
    try { requestCount = await window.ParagonSync?.getWebsiteRequestCount?.() || 0; } catch (error) { requestCount = 0; }
    if (requests) requests.textContent = String(requestCount);
    if (liveRequestCount) liveRequestCount.textContent = String(requestCount);
  }

  function hubSearchIndex() {
    const entries = [
      { label: "◈ Home", hash: "#home", keywords: "landing start hub home main" },
      { label: "📚 Documentation", hash: "#documentation", keywords: "docs documentation everything guide manual readme" },
      { label: "👥 Community", hash: "#community", keywords: "community join member supporter signup register" },
      { label: "🛡️ Team", hash: "#team", keywords: "team login gateway staff admin dashboard" },
      { label: "📊 Live Stats", hash: "#landing-stats", keywords: "stats statistics numbers websites users reviews requests count live data" },
      { label: "🗺️ Roadmap preview", hash: "#landing-roadmap", keywords: "roadmap milestones plan future coming update progress pwa app install" },
      { label: "🆘 Help & Support", hash: "#help", keywords: "help support contact faq bug problem question message ticket broken error issue" },
      { label: "❓ FAQ", hash: "#help", keywords: "faq questions answers how do i frequently" },
      { label: "💬 Request a Website", hash: "#request-site", keywords: "request idea suggest new website want need proposal" },
      { label: "🔒 Privacy & Security", hash: "#privacy-policy", keywords: "privacy security data cookies policy gdpr protection delete download" },
      { label: "📜 Terms & Conditions", hash: "#terms", keywords: "terms conditions rules legal agreement" },
      { label: "🤝 Community Guidelines", hash: "#community-guidelines", keywords: "guidelines rules behavior conduct etiquette respect" },
      { label: "🍪 Cookie Policy", hash: "#cookie-policy", keywords: "cookies consent tracking browser storage" },
      { label: "📖 About Paragon", hash: "#about", keywords: "about story mission founder vision who we are company brand" },
      { label: "💬 Community Board", hash: "community-board.html", keywords: "board posts discussion members chat forum comments" },
      { label: "🧑‍💻 Developer Portal", hash: "developer-portal.html", keywords: "developer apply submit deploy build portal publish app" },
      { label: "🧾 Updates feed", hash: "../paragon-archive.html#updates", keywords: "updates news announcements changelog new sites latest" },
      { label: "👤 Account & sign in", hash: "../paragon-archive.html#account", keywords: "account sign in login google email profile guest password username member settings" },
      { label: "🔎 Search the Archive", hash: "../paragon-archive.html#search", keywords: "search find websites look up catalogue ai" }
    ];
    document.querySelectorAll("#hub-page-documentation section[id]").forEach(section => {
      const title = section.querySelector("h1, h2, h3")?.textContent?.trim();
      if (title) entries.push({ label: title.length > 60 ? `${title.slice(0, 57)}…` : title, hash: `#${section.id}`, keywords: title.toLowerCase() });
    });
    return entries;
  }

  /* P-094 — typo-tolerant Hub search: exact → word/prefix → edit-distance fuzzy (≤2 for words
     of 4+ letters), scored and ranked so the most-expected destination comes first. */
  function hubEditDistance(a, b) {
    if (a === b) return 0;
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const temp = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = temp;
      }
    }
    return row[b.length];
  }
  function hubSearchScore(entry, tokens) {
    const label = entry.label.toLowerCase();
    const keywordTokens = entry.keywords.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    let score = 0;
    tokens.forEach(token => {
      if (label === token) score += 100;
      else if (label.startsWith(token)) score += 60;
      else if (label.includes(token)) score += 40;
      keywordTokens.forEach(keyword => {
        if (keyword === token) score += 50;
        else if (keyword.startsWith(token)) score += 30;
        else if (keyword.includes(token) && token.length >= 3) score += 18;
        else if (token.length >= 4 && keyword.length >= 4 && hubEditDistance(token, keyword) <= 2) score += 12;
      });
    });
    return score;
  }

  function bindHubSearch() {
    /* P-090 — ONE permanent topbar search input: typing lists live matches,
       clearing the field removes the listing. No toggle, no panel. */
    const input = byId("hub-search-input");
    const results = byId("hub-search-results");
    if (!input || !results) return;
    const escapeHubText = value => String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
    let index = [];
    function renderResults(query) {
      const clean = String(query || "").trim().toLowerCase().replace(/\s+/g, " ");
      if (!clean) { results.hidden = true; results.innerHTML = ""; return; }
      if (!index.length) index = hubSearchIndex();
      const tokens = clean.split(" ").filter(Boolean);
      const ranked = index
        .map(entry => ({ entry, score: hubSearchScore(entry, tokens) }))
        .filter(match => match.score > 0)
        .sort((first, second) => second.score - first.score)
        .slice(0, 8);
      results.innerHTML = ranked.length
        ? ranked.map(match => `<a href="${match.entry.hash}" role="option">${match.entry.label}</a>`).join("")
        : `<span class="hub-search-empty">No Hub match for “${escapeHubText(clean)}”. Try Documentation for the full index.</span>`;
      results.hidden = false;
    }
    input.addEventListener("input", () => renderResults(input.value));
    input.addEventListener("focus", () => renderResults(input.value));
    results.addEventListener("click", () => { results.hidden = true; });
    document.addEventListener("keydown", event => { if (event.key === "Escape") { results.hidden = true; input.blur(); } });
    document.addEventListener("click", event => { if (!event.target.closest(".hub-topbar-search")) results.hidden = true; });
  }

  /* P-064: REAL public-roadmap sync — when the Team roadmap manager has data on this
     device, the public roadmap groups rebuild from it (public items only). The three
     milestone items keep their honest checklist-derived bars (D-116); team-set items
     show their stored percent with a "team-set" caption. Backend broadcast syncs all
     devices later. */
  function syncPublicRoadmapFromTeam() {
    let store = null;
    try { store = JSON.parse(window.localStorage.getItem("paragonTeamRoadmap.v1") || "null"); }
    catch (error) { store = null; }
    if (!Array.isArray(store) || !store.length) return;
    const publicItems = store.filter(item => item.isPublic !== false);
    const dotClass = { completed: "done", progress: "active", planned: "", coming: "coming" };
    function simpleItem(item) {
      const bar = item.group === "progress"
        ? '<div class="hub-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + (item.percent || 0) + '"><div class="hub-progress-fill" style="width:' + (item.percent || 0) + '%"></div></div><small class="hub-progress-caption">' + (item.percent || 0) + '% — team-set progress value</small>'
        : "";
      return '<li><span class="hub-roadmap-dot ' + (dotClass[item.group] || "") + '" aria-hidden="true"></span><div><strong>' + String(item.title).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])) + '</strong><small>' + String(item.detail || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])) + '</small>' + bar + '</div></li>';
    }
    ["completed", "planned", "coming"].forEach(group => {
      const list = byId("rm-pub-" + group);
      if (!list) return;
      const items = publicItems.filter(item => item.group === group);
      if (items.length) list.innerHTML = items.map(simpleItem).join("");
    });
    const progressList = byId("rm-pub-progress");
    if (progressList) {
      const milestoneBlocks = {};
      progressList.querySelectorAll("[data-roadmap-title]").forEach(node => { milestoneBlocks[node.dataset.roadmapTitle] = node; });
      const items = publicItems.filter(item => item.group === "progress");
      if (items.length) {
        const keep = [];
        const fresh = [];
        items.forEach(item => {
          if (milestoneBlocks[item.title]) keep.push(milestoneBlocks[item.title]);
          else fresh.push(simpleItem(item));
        });
        progressList.querySelectorAll(":scope > li").forEach(node => { if (!keep.includes(node)) node.remove(); });
        keep.forEach(node => progressList.appendChild(node));
        if (fresh.length) progressList.insertAdjacentHTML("beforeend", fresh.join(""));
      }
    }
  }

  /* P-096 — MILESTONE CHECKLISTS come from the Team roadmap desk when it has spoken
     (paragonTeamRoadmapMilestones.v1); the HTML lists stay the honest default. Either way
     the percentages are computed from the SAME list the user sees (D-116). */
  function applyTeamMilestoneChecklists() {
    let store = null;
    try { store = JSON.parse(window.localStorage.getItem("paragonTeamRoadmapMilestones.v1") || "null"); }
    catch (error) { store = null; }
    if (!store) return;
    document.querySelectorAll("[data-milestones]").forEach(list => {
      const key = list.dataset.milestones;
      const teamItems = Array.isArray(store[key]) ? store[key] : null;
      if (!teamItems || !teamItems.length) return;
      list.innerHTML = teamItems.map(item => `<li data-done="${item.done ? "true" : "false"}">${String(item.text).replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[character]))}</li>`).join("");
    });
  }

  function populateRoadmapProgress() {
    syncPublicRoadmapFromTeam();
    applyTeamMilestoneChecklists();
    document.querySelectorAll("[data-milestones]").forEach(list => {
      const key = list.dataset.milestones;
      const items = [...list.querySelectorAll("li")];
      const done = items.filter(item => item.dataset.done === "true").length;
      const percent = items.length ? Math.round((done / items.length) * 100) : 0;
      const fill = document.querySelector(`[data-progress-for="${key}"]`);
      const caption = document.querySelector(`[data-progress-caption="${key}"]`);
      const track = fill?.parentElement;
      if (fill) { fill.dataset.targetWidth = String(percent); fill.style.width = `${percent}%`; }
      if (track) track.setAttribute("aria-valuenow", String(percent));
      if (caption) caption.textContent = `${percent}% — ${done} of ${items.length} milestones complete (counted from the list below)`;
      items.forEach(item => item.classList.toggle("done", item.dataset.done === "true"));
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
  }

  function animateRoadmapProgress() {
    if (prefersReducedMotion()) return;
    document.querySelectorAll("[data-progress-for]").forEach(fill => {
      const target = fill.dataset.targetWidth || "0";
      fill.style.transition = "none";
      fill.style.width = "0%";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = "";
        fill.style.width = `${target}%`;
      }));
    });
  }

  let statsAnimated = false;
  function animateStatNumbers() {
    if (statsAnimated) return;
    statsAnimated = true;
    if (prefersReducedMotion()) return;
    document.querySelectorAll(".hub-stat-box strong").forEach(node => {
      const target = Number(node.textContent);
      if (!Number.isFinite(target) || target <= 0) return;
      const started = performance.now();
      const duration = 900;
      function tick(now) {
        const ratio = Math.min(1, (now - started) / duration);
        node.textContent = String(Math.round(target * (1 - Math.pow(1 - ratio, 3))));
        if (ratio < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  let revealObserver = null;
  function observeLandingReveals() {
    const sections = document.querySelectorAll("#hub-page-home .hub-doc-section, #hub-page-home .hub-quick-grid");
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      sections.forEach(section => section.classList.add("hub-revealed"));
      animateStatNumbers();
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("hub-revealed");
          if (entry.target.id === "landing-stats") animateStatNumbers();
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
    }
    sections.forEach(section => { if (!section.classList.contains("hub-revealed")) revealObserver.observe(section); });
  }

  function bindLandingAnchorRescroll() {
    // Re-clicking a link whose hash is already active fires no hashchange event;
    // force the scroll so quick cards always respond.
    document.addEventListener("click", event => {
      const link = event.target?.closest?.('a[href^="#"]');
      if (!link) return;
      if (link.getAttribute("href") === window.location.hash) {
        const target = document.querySelector(link.getAttribute("href"));
        if (target && !target.closest("[hidden]")) {
          event.preventDefault();
          target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
        }
      }
    });
  }


  /* P-097 — WHOLE-PLATFORM MAINTENANCE: the Team Settings toggle closes every Paragon surface. */
  function platformMaintenanceActive() {
    try { return (JSON.parse(window.localStorage.getItem("paragonTeamSettings.v1") || "null") || {}).maintenanceMode === true; }
    catch (error) { return false; }
  }
  function applyPlatformMaintenanceLockdown() {
    if (!platformMaintenanceActive() || typeof document.createElement !== "function") return false;
    if (document.getElementById("platform-maintenance-lockdown")) return true;
    var screen = document.createElement("div");
    screen.id = "platform-maintenance-lockdown";
    screen.innerHTML = '<style>#platform-maintenance-lockdown{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:26px;background:#0b0b0f;color:#e6e9f0;text-align:center;font-family:system-ui,-apple-system,sans-serif}#platform-maintenance-lockdown img{width:min(300px,62vw);height:auto}#platform-maintenance-lockdown h1{font-size:clamp(22px,4vw,32px);margin:0}#platform-maintenance-lockdown p{max-width:520px;font-size:14px;line-height:1.65;opacity:.82;margin:0}#platform-maintenance-lockdown button{margin-top:8px;padding:12px 24px;border:0;border-radius:999px;background:linear-gradient(120deg,#2563eb,#6d5efc);color:#fff;font-weight:800;cursor:pointer}</style>' +
      '<img src="assets/illustrations/maintenance.png" alt=""><h1>🚧 Paragon Archive is under maintenance</h1><p>The whole platform is briefly closed for repairs and updates from the Paragon Team. Every Paragon website routes here until maintenance is switched off. Nothing is lost — please check back soon.</p><button type="button" onclick="location.reload()">Try again</button>';
    document.documentElement.appendChild(screen);
    return true;
  }
  function initialize() {
if (applyPlatformMaintenanceLockdown()) return;    /* P-096 BUG FIX — the old guard `if (!byId("hub-top-nav")) return;` silently killed the
       ENTIRE hub pages module after P-094 removed the Home tab nav: no hash routing, no stats,
       no search, no join flows. The shell test is now the pages container itself. */
    if (!byId("hub-page-home")) return;
    applyLocationHash();
    window.addEventListener("hashchange", applyLocationHash);
    bindCommunityForm();
    bindTeamLogin();
    refreshCommunityCard();
    populateLandingStats().then(() => { statsAnimated = false; observeLandingReveals(); });
    populateRoadmapProgress();
    bindHubSearch();
    bindLandingAnchorRescroll();
    document.querySelectorAll("[data-hub-goto]").forEach(button => {
      button.addEventListener("click", () => { window.location.hash = `#${button.dataset.hubGoto}`; });
    });
  }

  window.ParagonHubPages = { pageFromHash, showHubPage, refreshCommunityCard, populateLandingStats, countCommunityMembers, populateRoadmapProgress };
  document.addEventListener("DOMContentLoaded", initialize);
})();
