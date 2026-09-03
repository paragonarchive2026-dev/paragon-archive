/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: index.ts
  EXPECTED PROJECT PATH: /supabase/functions/coin-reconcile/index.ts
  ROLE: Team/service reconcile worker — list open intents, manual match, health.
        Protected by PARAGON_COIN_WEBHOOK_SECRET or authenticated team JWT + service path.
  RESTORE/LOAD NOTE: Deploy after coins-master-phase3.sql. Does not flip real_money_enabled.
*/

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const webhookSecret = Deno.env.get("PARAGON_COIN_WEBHOOK_SECRET") || "";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

function safeEqual(left: string, right: string) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  if (!a.length || a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

async function rest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    throw new Error((data as { message?: string })?.message || `REST ${response.status}`);
  }
  return data;
}

function authorized(request: Request) {
  const shared = request.headers.get("X-Paragon-Coin-Secret") ||
    (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  return !!(webhookSecret && safeEqual(shared, webhookSecret));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization, x-paragon-coin-secret"
      }
    });
  }
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Service not configured." }, 503);
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);

  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "health";

  try {
    if (request.method === "GET" && action === "health") {
      const health = await rest("/rest/v1/rpc/paragon_sql_health", {
        method: "POST",
        body: "{}"
      });
      return json({ ok: true, health });
    }

    if (request.method === "GET" && action === "open-intents") {
      const rows = await rest(
        "/rest/v1/paragon_payment_intents?status=in.(awaiting_transfer,claimed,pending_verification,manual_review)&order=created_at.asc&limit=100"
      );
      return json({ ok: true, intents: rows });
    }

    if (request.method === "GET" && action === "unmatched-events") {
      const rows = await rest(
        "/rest/v1/paragon_payment_events?matched_intent_id=is.null&order=created_at.desc&limit=100"
      );
      return json({ ok: true, events: rows });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const op = String(body.op || action);

      if (op === "match") {
        const result = await rest("/rest/v1/rpc/paragon_coin_match_and_confirm", {
          method: "POST",
          body: JSON.stringify({
            p_intent_id: body.intent_id,
            p_event_id: body.event_id || null,
            p_match_method: body.match_method || "manual",
            p_note: body.note || "reconcile edge"
          })
        });
        return json({ ok: true, intent: result });
      }

      if (op === "ingest") {
        const result = await rest("/rest/v1/rpc/paragon_coin_ingest_payment_event", {
          method: "POST",
          body: JSON.stringify({
            p_provider: body.provider || "manual_bank",
            p_provider_transaction_id: body.provider_transaction_id,
            p_amount_naira: body.amount_naira,
            p_currency: body.currency || "NGN",
            p_sender_name: body.sender_name || null,
            p_raw_ref: body.raw_ref || null,
            p_auto_match: !!body.auto_match
          })
        });
        return json({ ok: true, event: result });
      }

      return json({ error: "Unknown op." }, 400);
    }

    return json({ error: "Unsupported." }, 405);
  } catch (error) {
    return json({ error: String((error as Error).message || error) }, 500);
  }
});
