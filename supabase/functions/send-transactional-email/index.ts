/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: index.ts
  EXPECTED PROJECT PATH: /supabase/functions/send-transactional-email/index.ts
  ROLE: Protected Supabase Edge Function that claims queued emails and sends approved templates through Brevo.
  RESTORE/LOAD NOTE: Deploy with --no-verify-jwt for a Database Webhook, then require PARAGON_EMAIL_WEBHOOK_SECRET. Provider/service credentials belong only in Supabase Edge Function secrets.
*/

import { getEmailTemplate } from "../_shared/email-templates.mjs";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const brevoApiKey = Deno.env.get("BREVO_API_KEY") || "";
const webhookSecret = Deno.env.get("PARAGON_EMAIL_WEBHOOK_SECRET") || "";
const senderEmail = Deno.env.get("PARAGON_EMAIL_FROM") || "paragon.archive.2026@gmail.com";
const senderName = Deno.env.get("PARAGON_EMAIL_FROM_NAME") || "Paragon Archive";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function safeEqual(left, right) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  if (!a.length || a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

function providedSecret(request) {
  const authorization = request.headers.get("Authorization") || "";
  const bearer = authorization.replace(/^Bearer\s+/i, "");
  return request.headers.get("X-Paragon-Email-Secret") || bearer;
}

function outboxEndpoint(id, expectedStatus = "") {
  const query = new URLSearchParams({ id: `eq.${id}`, select: "*" });
  if (expectedStatus) query.set("status", `eq.${expectedStatus}`);
  return `${supabaseUrl}/rest/v1/paragon_email_outbox?${query}`;
}

async function patchOutbox(id, values, expectedStatus = "") {
  const response = await fetch(outboxEndpoint(id, expectedStatus), {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({ ...values, updated_at: new Date().toISOString() })
  });
  const text = await response.text();
  const rows = text ? JSON.parse(text) : [];
  if (!response.ok) throw new Error(rows?.message || `Outbox update failed (${response.status}).`);
  return Array.isArray(rows) ? rows : [];
}

async function sendWithBrevo(record) {
  const template = getEmailTemplate(record.template_key, record.payload || {});
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": brevoApiKey },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: record.recipient_email }],
      replyTo: { email: template.replyTo || senderEmail, name: "The Paragon Team" },
      subject: template.subject,
      textContent: template.text,
      htmlContent: template.html,
      tags: [record.template_key]
    })
  });
  const text = await response.text();
  let result = {};
  try { result = text ? JSON.parse(text) : {}; } catch (error) { result = { message: text }; }
  if (!response.ok) throw new Error(result?.message || `Brevo delivery failed (${response.status}).`);
  return result;
}

Deno.serve(async request => {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!webhookSecret || !safeEqual(providedSecret(request), webhookSecret)) return json({ error: "Unauthorized." }, 401);
  if (!supabaseUrl || !serviceRoleKey || !brevoApiKey) return json({ error: "Email delivery secrets are not configured." }, 503);

  let record = null;
  try {
    const payload = await request.json();
    record = payload?.record || payload;
  } catch (error) {
    return json({ error: "Invalid JSON payload." }, 400);
  }

  if (!record?.id || !record?.recipient_email || !record?.template_key) return json({ error: "Incomplete outbox record." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(record.recipient_email))) return json({ error: "Invalid recipient email." }, 400);

  let claimed = null;
  try {
    const rows = await patchOutbox(record.id, {
      status: "processing",
      attempt_count: Number(record.attempt_count || 0) + 1,
      last_error: null
    }, "pending");
    claimed = rows[0] || null;
    if (!claimed) return json({ ok: true, skipped: true, reason: "Already claimed or processed." });

    const delivery = await sendWithBrevo(claimed);
    await patchOutbox(claimed.id, {
      status: "sent",
      provider: "brevo",
      provider_message_id: delivery?.messageId || delivery?.message_id || null,
      sent_at: new Date().toISOString(),
      last_error: null
    }, "processing");
    return json({ ok: true, outboxId: claimed.id, providerMessageId: delivery?.messageId || null });
  } catch (error) {
    if (claimed?.id) {
      try {
        await patchOutbox(claimed.id, {
          status: "failed",
          last_error: String(error?.message || error).slice(0, 1000)
        }, "processing");
      } catch (updateError) {
        console.error("Could not record email failure", updateError);
      }
    }
    console.error("Transactional email failed", error);
    return json({ error: "Transactional email delivery failed." }, 502);
  }
});
