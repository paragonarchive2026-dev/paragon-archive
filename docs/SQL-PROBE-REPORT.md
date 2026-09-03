# SQL Probe Report — 2026-09-03 (re-run)

Probed the live Supabase project `qnylhlyyzpwlfftiygcn.supabase.co` through the REST API
with the public anon key. **The project is UP and healthy** — it answers REST requests
normally (a paused project would not respond). The sandbox itself still cannot open a
direct TCP/SSL connection to supabase.co, so probing used the anon key as a query
parameter through the fetch proxy; table presence is read from PostgREST's answers
(`200/[]` = exists and readable, `42501` = exists but anon SELECT not granted,
`PGRST205/202` = does not exist in the schema cache).

## Applied (live) ✔
| File | Proof |
|---|---|
| `supabase/schema.sql` | `paragon_user_state`, `paragon_profiles` exist (42501 = RLS-protected as intended) |
| `supabase/announcements-schema.sql` | `paragon_announcements` readable; real rows present (e.g. “The Paragon backend went LIVE”, published 2026-08-18) |
| `supabase/coins-master-phase1.sql` | `paragon_coin_accounts`, `paragon_coin_ledger_v2`, `paragon_payment_intents`, `paragon_payment_events`, `paragon_competitions`, `paragon_leaderboard_periods` all exist (empty) |

## Not applied (missing) ✖ — run in this order
| File | Proof | Notes |
|---|---|---|
| `supabase/coins-master-phase2.sql` | no tables; ledger RPCs (`paragon_coin_my_account`, …) absent | needs Phase 1 as base (live) |
| `supabase/coins-master-phase3.sql` | `paragon_payment_matches`, `paragon_payment_webhook_inbox`, `paragon_sql_health` missing | defines the SQL health RPC used by the GitHub Actions workflow + Team desk probe |
| `supabase/coins-master-phase4.sql` | competition participants/settlements/creator-prize tables missing | |
| `supabase/coins-master-phase5.sql` | `paragon_kyc_profiles` missing | OPay/Moniepoint rails + KYC |
| `supabase/coins-master-stage1-hardening.sql` | `paragon_platform_books` missing | |
| `supabase/coins-master-stage2-coin-system.sql` | Stage-2 RPC set missing | purchase intents → claim → reconcile |
| `supabase/coins-master-stage3-games.sql` | `paragon_competitive_points`, `paragon_anticheat_events` missing | run after phase4 per EOP |
| `supabase/coins-master-stage4-quiz.sql` | `paragon_quiz_definitions` missing | run after stage3 per EOP |
| `supabase/leaderboards-schema.sql` | `paragon_leaderboards`, `paragon_rewards`, `paragon_leaderboard_audit` missing | prepared, never executed |
| `supabase/finance-schema.sql` | `paragon_wallets`, `paragon_finance_controls`, … missing | prepared, never executed — device layer only until the owner activates real-money infra |

`supabase/coins-schema.sql` is the LEGACY pre-phase1 coin schema (its tables were replaced
by the phase-1 names — PostgREST itself hints `paragon_coin_accounts` when asked for
`paragon_coin_wallets`). Do NOT run it.

## Note on pausing
The project answers requests normally today (healthy). If it was paused while offline,
the pause is over/cleared — nothing else is needed from this side.
