/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: index.ts
  EXPECTED PROJECT PATH: /supabase/functions/coin-payment-webhook/index.ts
  ROLE: Provider-agnostic payment webhook ingress for Paragon Coins (Phase 3).
        Accepts Paystack / Flutterwave / generic JSON; stores inbox + normalized events.
        NEVER credits coins from an unverified client. HMAC/secret required.
  RESTORE/LOAD NOTE: Deploy with secrets only in Edge env. real_money_enabled is a DB flag —
        this function will refuse to auto-confirm if financial_pause is true.
*/

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const webhookSecret = Deno.env.get("PARAGON_COIN_WEBHOOK_SECRET") || "";
const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY") || "";
const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY") || "";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
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

async function hmacHexSha512(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
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
    const message = (data as { message?: string })?.message || `REST ${response.status}`;
    throw new Error(message);
  }
  return data;
}

type Normalized = {
  provider: string;
  providerTransactionId: string;
  amountNaira: number;
  currency: string;
  senderName?: string;
  rawRef?: string;
  eventKey: string;
};

function normalizePaystack(payload: Record<string, unknown>): Normalized | null {
  const event = String(payload.event || "");
  const data = (payload.data || {}) as Record<string, unknown>;
  if (event && event !== "charge.success") return null;
  const status = String(data.status || "");
  if (status && status !== "success") return null;
  const amountKobo = Number(data.amount) || 0;
  const reference = String(data.reference || data.id || "");
  if (!reference || amountKobo <= 0) return null;
  return {
    provider: "paystack",
    providerTransactionId: reference,
    amountNaira: Math.round(amountKobo / 100),
    currency: String(data.currency || "NGN"),
    senderName: String((data.customer as { email?: string })?.email || data.authorization && (data.authorization as { account_name?: string })?.account_name || ""),
    rawRef: reference,
    eventKey: `paystack:${reference}:${event || "charge"}`
  };
}

function normalizeFlutterwave(payload: Record<string, unknown>): Normalized | null {
  const data = (payload.data || payload) as Record<string, unknown>;
  const status = String(data.status || payload.status || "").toLowerCase();
  if (status && status !== "successful" && status !== "success") return null;
  const amount = Number(data.amount) || 0;
  const txId = String(data.id || data.tx_ref || data.flw_ref || "");
  if (!txId || amount <= 0) return null;
  return {
    provider: "flutterwave",
    providerTransactionId: txId,
    amountNaira: Math.round(amount),
    currency: String(data.currency || "NGN"),
    senderName: String(data.customer && (data.customer as { name?: string })?.name || ""),
    rawRef: String(data.tx_ref || txId),
    eventKey: `flutterwave:${txId}`
  };
}

function normalizeGeneric(payload: Record<string, unknown>, providerHint: string): Normalized | null {
  const amount = Number(payload.amount_naira || payload.amount || payload.naira) || 0;
  const txId = String(payload.provider_transaction_id || payload.reference || payload.id || "");
  if (!txId || amount <= 0) return null;
  return {
    provider: providerHint || String(payload.provider || "generic"),
    providerTransactionId: txId,
    amountNaira: Math.round(amount),
    currency: String(payload.currency || "NGN"),
    senderName: String(payload.sender_name || payload.email || ""),
    rawRef: String(payload.raw_ref || txId),
    eventKey: `${providerHint || "generic"}:${txId}`
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization, x-paragon-coin-secret, x-paystack-signature, verif-hash"
      }
    });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Supabase service not configured." }, 503);

  const rawBody = await request.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const url = new URL(request.url);
  const providerHint = (url.searchParams.get("provider") || String(payload.provider || "generic")).toLowerCase();

  /* Auth: shared secret OR provider HMAC */
  let authorized = false;
  const shared = request.headers.get("X-Paragon-Coin-Secret") ||
    (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (webhookSecret && safeEqual(shared, webhookSecret)) authorized = true;

  if (!authorized && providerHint === "paystack" && paystackSecret) {
    const sig = request.headers.get("x-paystack-signature") || "";
    const expected = await hmacHexSha512(paystackSecret, rawBody);
    if (safeEqual(sig, expected)) authorized = true;
  }
  if (!authorized && providerHint === "flutterwave" && flutterwaveSecret) {
    const hash = request.headers.get("verif-hash") || "";
    if (safeEqual(hash, flutterwaveSecret)) authorized = true;
  }

  if (!authorized) {
    /* Allow shared secret alone even when provider keys not set yet */
    if (!webhookSecret) return json({ error: "PARAGON_COIN_WEBHOOK_SECRET not set; refusing traffic." }, 503);
    return json({ error: "Unauthorized webhook." }, 401);
  }

  let normalized: Normalized | null = null;
  if (providerHint === "paystack") normalized = normalizePaystack(payload);
  else if (providerHint === "flutterwave") normalized = normalizeFlutterwave(payload);
  else normalized = normalizeGeneric(payload, providerHint);

  if (!normalized) {
    return json({ ok: true, ignored: true, reason: "event not a successful charge or missing fields" });
  }

  /* Persist raw inbox (idempotent on provider+event_key) */
  try {
    await rest("/rest/v1/paragon_payment_webhook_inbox", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        provider: normalized.provider,
        event_key: normalized.eventKey,
        payload,
        headers: {
          "x-paystack-signature": request.headers.get("x-paystack-signature"),
          "verif-hash": request.headers.get("verif-hash") ? "[present]" : null
        },
        processed: false
      })
    });
  } catch (error) {
    /* duplicate event_key is OK */
    const message = String((error as Error).message || error);
    if (!/duplicate|unique/i.test(message)) {
      return json({ error: "Inbox write failed: " + message }, 500);
    }
  }

  /* Ingest normalized event + optional auto-match */
  try {
    const rows = await rest("/rest/v1/rpc/paragon_coin_ingest_payment_event", {
      method: "POST",
      body: JSON.stringify({
        p_provider: normalized.provider,
        p_provider_transaction_id: normalized.providerTransactionId,
        p_amount_naira: normalized.amountNaira,
        p_currency: normalized.currency,
        p_sender_name: normalized.senderName || null,
        p_raw_ref: normalized.rawRef || null,
        p_auto_match: true
      })
    });

    await rest(
      `/rest/v1/paragon_payment_webhook_inbox?provider=eq.${encodeURIComponent(normalized.provider)}&event_key=eq.${encodeURIComponent(normalized.eventKey)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          processed: true,
          process_result: "ingested",
          processed_at: new Date().toISOString(),
          payment_event_id: (rows as { id?: string })?.id || null
        })
      }
    );

    return json({
      ok: true,
      provider: normalized.provider,
      transaction_id: normalized.providerTransactionId,
      amount_naira: normalized.amountNaira,
      event: rows
    });
  } catch (error) {
    return json({ error: String((error as Error).message || error) }, 500);
  }
});
