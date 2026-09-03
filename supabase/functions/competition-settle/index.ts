/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: index.ts
  EXPECTED PROJECT PATH: /supabase/functions/competition-settle/index.ts
  ROLE: Server-side competition settle / create helpers (Phase 4).
        Browser is never the referee for money outcomes.
  RESTORE/LOAD NOTE: Deploy after coins-master-phase4.sql. Auth via PARAGON_COIN_WEBHOOK_SECRET
        or service role. Does not enable real_money_enabled.
*/

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
/* Stage1: fee→reward reserve recorded via SQL when team passes fee or post-settle RPC */
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
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

function authorized(request: Request) {
  const shared = request.headers.get("X-Paragon-Coin-Secret") ||
    (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  return !!(webhookSecret && safeEqual(shared, webhookSecret));
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

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization, x-paragon-coin-secret"
      }
    });
  }
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Service not configured." }, 503);
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);

  try {
    if (request.method === "GET") {
      const rows = await rest(
        "/rest/v1/paragon_competitions?order=created_at.desc&limit=50"
      );
      return json({ ok: true, competitions: rows });
    }

    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
    const body = await request.json();
    const op = String(body.op || "settle");

    if (op === "settle") {
      const result = await rest("/rest/v1/rpc/paragon_competition_settle", {
        method: "POST",
        body: JSON.stringify({
          p_competition_id: body.competition_id,
          p_outcome: body.outcome,
          p_winner_user_id: body.winner_user_id || null,
          p_correlation_id: body.correlation_id || null
        })
      });
      try {
        const fee = Number((result as { fee_coins?: number })?.fee_coins) || 0;
        const cid = body.competition_id;
        if (fee > 0 && cid) {
          await rest("/rest/v1/rpc/paragon_record_competition_fee_revenue", {
            method: "POST",
            body: JSON.stringify({ p_competition_id: cid, p_fee_coins: fee })
          }).catch(() => null);
        }
      } catch { /* optional stage1 books */ }
      return json({ ok: true, settlement: result });
    }

    if (op === "leaderboard_settle") {
      const result = await rest("/rest/v1/rpc/paragon_leaderboard_settle_period", {
        method: "POST",
        body: JSON.stringify({ p_period_id: body.period_id })
      });
      return json({ ok: true, period: result });
    }

    if (op === "pause") {
      const result = await rest("/rest/v1/rpc/paragon_set_financial_pause", {
        method: "POST",
        body: JSON.stringify({ p_paused: !!body.paused })
      });
      return json({ ok: true, flags: result });
    }

    if (op === "award_prize") {
      const result = await rest("/rest/v1/rpc/paragon_creator_prize_award", {
        method: "POST",
        body: JSON.stringify({
          p_prize_id: body.prize_id,
          p_winner_user_id: body.winner_user_id
        })
      });
      return json({ ok: true, prize: result });
    }

    return json({ error: "Unknown op." }, 400);
  } catch (error) {
    return json({ error: String((error as Error).message || error) }, 500);
  }
});
