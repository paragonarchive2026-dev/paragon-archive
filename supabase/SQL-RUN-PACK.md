<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: SQL-RUN-PACK.md
  EXPECTED PROJECT PATH: /supabase/SQL-RUN-PACK.md
  ROLE: Owner runbook — every Supabase SQL script to paste, in order, with what each does.
  RESTORE-LOAD NOTE: Keep this current whenever a new *.sql is added under /supabase/.
-->

# 🗄️ Paragon Archive — SQL run pack (do these now)

Open **Supabase Dashboard → SQL → New query**.  
Paste **one file at a time**, click **Run**, confirm success, then next.

---

## Status of each script

| # | File | Status | Action |
|---|------|--------|--------|
| 0 | `schema.sql` | ✅ Already executed live (2026-08-18) | **Do NOT re-run** (archive reference only) |
| 1 | `announcements-schema.sql` | ⬜ Pending | **RUN NOW** |
| 2 | `coins-schema.sql` | ⬜ Pending (new P-100) | **RUN NOW** (after #1) |

---

## 1) Announcements (Team desk → every device)

**File:** `supabase/announcements-schema.sql`  
**Does:**
- `paragon_team_members` (seeds `paragon.archive.2026@gmail.com` as founder)
- `paragon_announcements` + RLS (public reads published only; team writes)
- Seeds the 4 real launch announcements

**After run:** sign into the Team desk on any device → Announcements should flip to live-backend mode when the client is wired; at minimum the tables exist for multi-device edits.

---

## 2) Paragon Coins backend

**File:** `supabase/coins-schema.sql`  
**Does:**
- Wallet per user (`paragon_coin_wallets`)
- Immutable ledger (`paragon_coin_ledger`)
- Purchase requests + approve/reject RPCs
- Withdrawal requests + complete-payout RPC
- Public rate config row (`paragon_coin_config`) — placeholder ₦1 = 2 coins buy
- Helpers: `paragon_coin_my_balance`, `paragon_coin_spend`, `paragon_coin_apply`

**After run:**
1. Confirm your founder email is in `paragon_team_members` (the script inserts it).
2. Front-end still works **local-first** today; multi-device credit lands when the Archive client is pointed at these RPCs (already designed — local path stays as offline fallback).
3. Replace placeholder rates later by updating `paragon_coin_config` (or Team settings when wired).

### Quick verify queries (optional)

```sql
-- tables exist?
select table_name from information_schema.tables
where table_schema = 'public' and table_name like 'paragon_coin%'
order by 1;

-- config row
select * from public.paragon_coin_config;

-- you are team?
select public.paragon_is_team_member();
```

---

## 3) Secrets / Edge (not SQL — still owner checklist)

These are **not** SQL; do when ready (see docs):

| Item | Where | Doc |
|------|--------|-----|
| Brevo SMTP hold | Brevo account | `docs/BREVO-CONTACT.md` |
| Auth redirect allowlist | Supabase Auth → URL config | production origin |
| Edge: `send-transactional-email` | Functions | `supabase/functions/EMAIL-INTEGRATION.md` |
| Edge: `submit-support-message` | Functions | `supabase/functions/SUPPORT-INTEGRATION.md` |
| `supabase secrets set` for Brevo keys | CLI / Dashboard | never put secrets in browser files |

---

## Order summary (copy this)

1. Run **`announcements-schema.sql`** once.  
2. Run **`coins-schema.sql`** once.  
3. Reply here “SQL done” if anything errors — paste the error text.  
4. Do **not** re-run `schema.sql`.

---

## Honesty note

- Coin **front-end** (balance, shop packs, team approve on same device) has been live since P-098.  
- This SQL makes the **same rules** durable across devices and auditable (ledger).  
- Real ₦ rates, bank payout logistics, and payment-provider automation stay owner decisions (see `docs/COIN-SYSTEM.md`).
