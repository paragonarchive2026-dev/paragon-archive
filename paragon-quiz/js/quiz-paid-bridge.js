/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: quiz-paid-bridge.js
  EXPECTED PROJECT PATH: /paragon-quiz/js/quiz-paid-bridge.js
  ROLE: Stage 4 paid quiz bridge — start attempt + server score via Supabase RPC.
        Free play stays 100% local in quiz.js. This file never returns answer keys.
  RESTORE-LOAD NOTE: Load after config/supabase.js on play.html when paid mode is used.
*/
(function (global) {
  "use strict";

  function cfg() {
    return global.ParagonConfig || {};
  }

  function sessionAccessToken() {
    try {
      var raw = global.localStorage.getItem("paragonArchive.supabase.session") ||
        global.sessionStorage.getItem("paragonArchive.supabase.session");
      if (!raw) {
        /* supabase-js default storage keys vary — try scan */
        for (var i = 0; i < global.localStorage.length; i++) {
          var k = global.localStorage.key(i);
          if (k && /auth-token|supabase.auth/i.test(k)) {
            var v = JSON.parse(global.localStorage.getItem(k) || "null");
            if (v && (v.access_token || (v.currentSession && v.currentSession.access_token))) {
              return v.access_token || v.currentSession.access_token;
            }
          }
        }
        return "";
      }
      var s = JSON.parse(raw);
      return s.access_token || s.accessToken || "";
    } catch (e) {
      return "";
    }
  }

  function rest(path, body) {
    var base = String(cfg().supabaseUrl || "").replace(/\/$/, "");
    var key = cfg().supabaseAnonKey || "";
    if (!base || !key) return Promise.reject(new Error("Supabase not configured"));
    var token = sessionAccessToken() || key;
    return fetch(base + path, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!r.ok) {
          var msg = (data && (data.message || data.error_description || data.error)) || ("HTTP " + r.status);
          throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
        }
        return data;
      });
    });
  }

  function startPaidAttempt(quizKey, idem) {
    return rest("/rest/v1/rpc/paragon_quiz_start_paid_attempt", {
      p_quiz_key: quizKey,
      p_idempotency_key: idem || null
    });
  }

  function scoreAttempt(attemptId, answers, correlationId) {
    return rest("/rest/v1/rpc/paragon_quiz_score_attempt", {
      p_attempt_id: attemptId,
      p_answers: answers,
      p_correlation_id: correlationId || null
    });
  }

  function publishQuiz(payload) {
    return rest("/rest/v1/rpc/paragon_quiz_publish", payload);
  }

  function lockCreatorPrize(quizKey, coins, idem) {
    return rest("/rest/v1/rpc/paragon_creator_prize_lock", {
      p_quiz_key: quizKey,
      p_prize_coins: coins,
      p_idempotency_key: idem || null
    });
  }

  global.ParagonQuizPaid = {
    startPaidAttempt: startPaidAttempt,
    scoreAttempt: scoreAttempt,
    publishQuiz: publishQuiz,
    lockCreatorPrize: lockCreatorPrize,
    isConfigured: function () {
      return !!(cfg().supabaseUrl && cfg().supabaseAnonKey);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
