/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: index.ts
  EXPECTED PROJECT PATH: /supabase/functions/submit-support-message/index.ts
  ROLE: Public Help & Support Edge Function with validation, private screenshot upload, authenticated-user detection, and service-role message insertion.
  RESTORE/LOAD NOTE: Deploy with --no-verify-jwt. Configure PARAGON_ALLOWED_ORIGINS as an Edge secret; service-role credentials remain server-side.
*/

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const allowedOrigins = new Set(
  String(Deno.env.get("PARAGON_ALLOWED_ORIGINS") || "https://paragonarchive.com,https://www.paragonarchive.com")
    .split(",")
    .map(value => value.trim().replace(/\/$/, ""))
    .filter(Boolean)
);
const allowedTopics = new Set(["General Question", "Bug Report", "Account Issue", "Website Not Loading", "Privacy Concern", "Feature Suggestion", "Other"]);
const allowedAttachmentTypes = new Set(["image/png", "image/jpeg", "image/gif"]);
const maximumAttachmentBytes = 10 * 1024 * 1024;
const bucketName = "support-attachments";

function corsHeaders(origin = "") {
  const allowed = origin && allowedOrigins.has(origin.replace(/\/$/, "")) ? origin : "";
  return {
    ...(allowed ? { "Access-Control-Allow-Origin": allowed } : {}),
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function json(body, status = 200, origin = "") {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function cleanText(value, maximum) {
  return String(value || "").trim().slice(0, maximum);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeFileName(value) {
  const cleaned = String(value || "screenshot").normalize("NFKC").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.slice(0, 100) || "screenshot";
}

function storageObjectUrl(path) {
  return `${supabaseUrl}/storage/v1/object/${bucketName}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function serviceHeaders(contentType = "application/json") {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...(contentType ? { "Content-Type": contentType } : {})
  };
}

async function authenticatedUserId(request) {
  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token || token === anonKey || !anonKey) return null;
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
    if (!response.ok) return null;
    const user = await response.json();
    return user?.id || null;
  } catch (error) {
    return null;
  }
}

async function uploadAttachment(path, file) {
  const response = await fetch(storageObjectUrl(path), {
    method: "POST",
    headers: { ...serviceHeaders(file.type), "x-upsert": "false" },
    body: file
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result?.message || `Screenshot upload failed (${response.status}).`);
  }
}

async function removeAttachment(path) {
  if (!path) return;
  try { await fetch(storageObjectUrl(path), { method: "DELETE", headers: serviceHeaders("") }); }
  catch (error) { console.error("Could not remove orphaned support screenshot", error); }
}

async function insertSupportMessage(row) {
  const response = await fetch(`${supabaseUrl}/rest/v1/paragon_support_messages`, {
    method: "POST",
    headers: { ...serviceHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(row)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || result?.details || `Support message insert failed (${response.status}).`);
  return Array.isArray(result) ? result[0] : result;
}

Deno.serve(async request => {
  const origin = request.headers.get("Origin") || "";
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, origin);
  if (origin && !allowedOrigins.has(origin.replace(/\/$/, ""))) return json({ error: "Origin not allowed." }, 403, origin);
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Support service is not configured." }, 503, origin);

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > maximumAttachmentBytes + 1024 * 1024) return json({ error: "Submission is too large." }, 413, origin);

  let form = null;
  try { form = await request.formData(); }
  catch (error) { return json({ error: "Invalid support form data." }, 400, origin); }

  const honeypot = cleanText(form.get("company"), 100);
  if (honeypot) return json({ ok: true, received: true }, 200, origin);

  const name = cleanText(form.get("name"), 80);
  const email = cleanText(form.get("email"), 254).toLowerCase();
  const topic = cleanText(form.get("topic"), 60);
  const message = cleanText(form.get("message"), 2000);
  const attachment = form.get("attachment");

  if (name.length < 2) return json({ error: "Please enter your name." }, 400, origin);
  if (!validEmail(email)) return json({ error: "Please enter a valid reply email." }, 400, origin);
  if (!allowedTopics.has(topic)) return json({ error: "Please select a valid support topic." }, 400, origin);
  if (message.length < 20) return json({ error: "Please describe the issue in at least 20 characters." }, 400, origin);

  let file = null;
  if (attachment instanceof File && attachment.size > 0) {
    if (!allowedAttachmentTypes.has(attachment.type)) return json({ error: "Attach a PNG, JPG, or GIF image only." }, 400, origin);
    if (attachment.size > maximumAttachmentBytes) return json({ error: "The screenshot must be 10MB or smaller." }, 413, origin);
    file = attachment;
  }

  const id = crypto.randomUUID();
  const extension = file?.type === "image/png" ? ".png" : file?.type === "image/gif" ? ".gif" : file ? ".jpg" : "";
  const baseName = file ? safeFileName(file.name).replace(/\.(png|jpe?g|gif)$/i, "") : "";
  const attachmentPath = file ? `${id}/${baseName || "screenshot"}${extension}` : null;

  try {
    if (file && attachmentPath) await uploadAttachment(attachmentPath, file);
    const inserted = await insertSupportMessage({
      id,
      user_id: await authenticatedUserId(request),
      name,
      email,
      topic,
      message,
      attachment_path: attachmentPath,
      attachment_name: file?.name || null,
      attachment_type: file?.type || null,
      attachment_size: file?.size || null,
      user_agent: cleanText(request.headers.get("User-Agent"), 500)
    });
    return json({ ok: true, id: inserted?.id || id }, 201, origin);
  } catch (error) {
    if (attachmentPath) await removeAttachment(attachmentPath);
    const messageText = String(error?.message || error);
    console.error("Support submission failed", error);
    if (/SUPPORT_RATE_LIMIT|three support messages/i.test(messageText)) {
      return json({ error: "SUPPORT_RATE_LIMIT: You can send up to three support messages in 24 hours." }, 429, origin);
    }
    return json({ error: "Your support message could not be saved." }, 500, origin);
  }
});
