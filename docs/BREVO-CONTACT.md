<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: BREVO-CONTACT.md
  EXPECTED PROJECT PATH: /docs/BREVO-CONTACT.md
  ROLE: Exact owner steps to contact Brevo support and unblock the SMTP relay that is
        breaking Supabase signup confirmation emails (probe retested 2026-08-24: HTTP 500
        "Error sending confirmation email" — error_id 01a035f2-47ed-75aa-a4a2-8c53499fd699).
  RESTORE-LOAD NOTE: Owner-side fix doc. The Supabase side is confirmed correctly configured.
-->

# 📧 Contacting Brevo — Unblock the SMTP Relay

**Status right now (2026-08-24):** your Supabase SMTP settings are fine — a live signup
probe with `paragon.archive.2026+smtptest3@gmail.com` still returns HTTP 500
"Error sending confirmation email". That means Brevo's side is refusing the relay, and only
Brevo (or your Brevo account state) can fix it. This is a known pattern with new Brevo
accounts.

## First: the 3 self-checks (2 minutes, in Brevo dashboard)
1. **SMTP really activated?** Dashboard → **SMTP & API** tab → if there is a banner like
   "Your SMTP account is being activated" or "waiting for validation" — that is the bug.
   New Brevo accounts often sit in a hold until support lifts it or the first campaign step
   is completed. Do what the banner says, or go straight to support below.
2. **Using the SMTP KEY, not the account password.** In Supabase → Auth → SMTP settings:
   - Host `smtp-relay.brevo.com` · Port `587`
   - Username = your Brevo **SMTP login** shown on the SMTP & API page (format
     `xxxxxxx@smtp-brevo.com`) — NOT your email
   - Password = an **SMTP key** you generate on that page (NOT your Brevo login password)
3. **Sender verified:** Senders & IP → `paragon.archive.2026@gmail.com` must show
   verified/active.

## Then: contact Brevo support (the actual contact steps)
1. Log in at **https://app.brevo.com** → click the **? / Contact us** bubble
   (bottom-right) → **Contact us** / **Submit a ticket**.
2. Or go directly: **https://help.brevo.com/hc/en-us → Submit a ticket** — free on every plan.
3. Choose category **SMTP / API / Transactional email**.
4. Paste this message (edit nothing unless you want to):

   > Subject: SMTP relay rejected — new account, error on every send
   >
   > Hello Brevo,
   > My new Brevo account (login email: paragon.archive.2026@gmail.com) cannot send any
   > SMTP transactional mail. Every send is rejected. My SMTP relay username is
   > [YOUR xxxxxxx@smtp-brevo.com LOGIN], the sender paragon.archive.2026@gmail.com is
   > verified, and I am using a freshly generated SMTP key with host smtp-relay.brevo.com
   > port 587. If my account is in the new-account SMTP activation hold, please activate
   > the SMTP relay for me. The daily volume is tiny (< 20 signup confirmation emails/day).
   > Thank you!

5. Brevo chat support answers in minutes–hours on weekdays; tickets in ~1 day. The hold is
   usually lifted immediately once a human checks the account.

## After they fix it
Tell the agent "Brevo is fixed" — the retest is one command away
(signup probe with `+smtptest4`), and we only mark it working after a real 200 + the
confirmation email arriving in the inbox. The 300 free monthly emails stay reserved ONLY
for signup confirmation codes, exactly as you decided.
