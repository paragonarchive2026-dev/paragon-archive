# Paragon Archive Email Integration — Free-First Setup

This setup keeps every secret out of browser files and uses services that can be activated without paying at the current small-project scale.

## Selected route

- **Application emails:** Supabase Database Outbox → Database Webhook → `send-transactional-email` Edge Function → Brevo Email API
- **Visible sender during free-first setup:** `Paragon Archive <paragon.archive.2026@gmail.com>` after verifying that sender in Brevo
- **Reply-To:** `paragon.archive.2026@gmail.com`
- **Authentication verification/reset/OTP delivery:** Supabase Auth custom SMTP using the same Brevo account
- **First application template:** `request-received`

Brevo currently advertises a free transactional Email API/SMTP allowance. Always confirm the provider's current limits before production. If Paragon later verifies `paragonarchive.com`, change the sender to a domain address for stronger branding and deliverability without changing application code.

## Why Gmail is not connected directly

A Gmail password, Google OAuth client secret, OAuth refresh token, Brevo API key, Supabase service-role key, or webhook secret must never appear in `config/supabase.js`, HTML, browser JavaScript, tests, or public Git history. Direct Gmail API sending is possible, but it adds OAuth token rotation, Google Cloud consent configuration, quotas, and possible verification. Brevo is the simpler free-first relay, while replies still return to the existing Gmail inbox.

## Files

- `supabase/functions/_shared/email-templates.mjs` — subjects, text/HTML bodies, and prefilled mail links
- `supabase/functions/send-transactional-email/index.ts` — protected outbox worker
- `supabase/schema.sql` — private `paragon_email_outbox` plus request-email queue trigger

## 1. Create and verify a free Brevo sender

1. Create a Brevo account.
2. Add `paragon.archive.2026@gmail.com` as a sender.
3. Open the verification message Brevo sends to Gmail and complete sender verification.
4. Generate an Email API key.
5. For production scale, authenticate `paragonarchive.com` with the DNS records shown by Brevo and switch `PARAGON_EMAIL_FROM` to a domain address.

## 2. Apply the database schema

Run the complete `supabase/schema.sql` in the Supabase SQL Editor. It creates/upgrades:

- `paragon_website_requests`
- the one-request-per-account rolling seven-day trigger
- private `paragon_email_outbox`
- `queue_paragon_request_received_email`, which queues one idempotent receipt email when a request has contact email, or appends a 24-hour in-app receipt to the authenticated user state when the optional email is blank

Authenticated and anonymous browser roles receive no access to the outbox. Only the Edge Function's server-side service-role credential processes it.

## 3. Set Edge Function secrets

Generate a long random webhook secret. From a trusted terminal with the Supabase CLI:

```bash
supabase secrets set \
  BREVO_API_KEY="your-brevo-email-api-key" \
  PARAGON_EMAIL_WEBHOOK_SECRET="a-long-random-secret" \
  PARAGON_EMAIL_FROM="paragon.archive.2026@gmail.com" \
  PARAGON_EMAIL_FROM_NAME="Paragon Archive"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available to deployed Supabase Edge Functions. Never copy the service-role key into the Archive front end.

## 4. Deploy the worker

```bash
supabase functions deploy send-transactional-email --no-verify-jwt
```

`--no-verify-jwt` is required because a database webhook is not a user session. The function still rejects every request unless the custom webhook secret matches.

## 5. Create the Database Webhook

In Supabase Dashboard:

1. Open **Database → Webhooks**.
2. Create a webhook for **INSERT** on `public.paragon_email_outbox`.
3. Use the deployed function URL:
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-transactional-email`
4. Add one protected header:
   - `X-Paragon-Email-Secret: <the same long random secret>`
5. Save and enable the webhook.

The function atomically changes an outbox row from `pending` to `processing`. Duplicate webhook deliveries therefore do not send the same queued message twice under normal operation. Delivery success/failure and the provider message ID are stored in the outbox for later administration.

## 6. Configure Supabase Auth email

In **Authentication → Emails → SMTP Settings**, enable custom SMTP and copy Brevo's SMTP credentials. Set:

- Sender name: `Paragon Archive`
- Sender email: the verified sender
- Host/port/user/password: the values shown in Brevo SMTP settings

Supabase Auth—not browser JavaScript—should generate and validate signup confirmation, password-reset, magic-link, or email OTP tokens. The existing Archive currently uses email/password verification and recovery; email OTP sign-in can be added later without changing the transactional outbox.

## 7. Test without risking real users

1. Use a test authenticated Paragon account that has not submitted in the prior seven days.
2. Submit a request with your own contact email.
3. Confirm:
   - the request row exists;
   - one `request-received` outbox row exists;
   - the webhook invokes the function;
   - status changes to `sent`;
   - the Gmail inbox receives the supplied automatic reply;
   - clicking **Share Paragon Archive by email** opens a prefilled draft but does not send without user confirmation.
4. Submit without a contact email and confirm no outbox email is queued; open Paragon Archive with that account and confirm the matching request receipt appears in in-app notifications.
5. Confirm `paragon_request_count()` increased only after accepted inserts and exposes no request/user fields.
6. Confirm a second request is rejected by the seven-day trigger.

## Updating subjects and content

Edit only `supabase/functions/_shared/email-templates.mjs`, test, and redeploy the function. Current allowlisted templates are:

- `request-received` — receipt sent to a requester
- `support-notification` — owner alert with a prefilled Reply action

Future templates can be added to its `templates` registry, for example:

- `request-approved`
- `website-live`
- `password-security-alert`
- `saved-site-updated`

Do not let public users upload arbitrary email subjects or HTML. Template keys and variable payloads should remain allowlisted server-side.

## Manual prefilled email links

A `mailto:` link can prefill recipient, subject, and body in the visitor's configured email application. The recipient reviews it and presses **Send**. It is useful for Contact/Share actions but is not automatic delivery and is not guaranteed to open Gmail specifically.

## SMS and WhatsApp later

SMS OTP and WhatsApp Business messages need separate provider accounts, message templates, consent, costs/quotas, and abuse controls. Do not mix those credentials into the email function. Add them only after the email system is activated and tested.
