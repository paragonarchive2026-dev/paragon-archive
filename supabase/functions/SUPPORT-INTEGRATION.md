# Paragon Archive Help & Support Integration

## Architecture

- Public page: `paragon-archive-hub.html#help`
- Browser controller: consolidated `archive-hub.js` Help module
- Public submission endpoint: `supabase/functions/submit-support-message/index.ts`
- Private database table: `public.paragon_support_messages`
- Private Storage bucket: `support-attachments`
- Owner notification: private email outbox → existing `send-transactional-email` worker → Brevo → `paragon.archive.2026@gmail.com`

The public form does not insert directly into database/storage and never receives the service-role key. The Edge Function validates fields/files and performs privileged operations server-side.

## Free-first anti-spam rules

- Hidden honeypot field blocks simple form bots.
- Database trigger limits one email address to three accepted support messages per rolling 24 hours.
- The trigger uses a per-email advisory transaction lock to close simultaneous-submit races.
- No IP address or device fingerprint is stored for this limit.
- Screenshot type and 10MB limit are enforced in the browser, Edge Function, Storage bucket, and database.

This is reasonable for the first free launch but cannot stop a determined attacker rotating email addresses. If abuse appears later, add free Cloudflare Turnstile or require authentication for screenshot uploads.

## Apply the schema

Run the complete `supabase/schema.sql`. It creates/upgrades:

- `paragon_support_messages`
- `enforce_paragon_support_rate_limit`
- private `support-attachments` bucket
- `support-notification` email template allowlist
- `queue_paragon_support_notification`

Anonymous and authenticated browser roles receive no direct table access and no Storage policies. The service-role Edge Function is the only form writer/uploader.

## Configure allowed origins

Store exact production/preview origins as an Edge Function secret:

```bash
supabase secrets set PARAGON_ALLOWED_ORIGINS="https://paragonarchive.com,https://www.paragonarchive.com"
```

Add temporary local/preview origins only while testing. Do not use `*` in production.

## Deploy the public submission function

```bash
supabase functions deploy submit-support-message --no-verify-jwt
```

`--no-verify-jwt` allows signed-out visitors to request help. The function still validates origin, honeypot, fields, topic, file type/size, and database rate limit. If a valid Paragon JWT is supplied, its user ID is attached to the support record.

The browser calls:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit-support-message
```

The Help module inside `archive-hub.js` derives this URL from the public Supabase project URL. No new browser secret is required beyond the existing public anon key.

## Owner notification

Every accepted support message queues one idempotent `support-notification` outbox event addressed to `paragon.archive.2026@gmail.com`. The existing protected outbox Database Webhook and `send-transactional-email` function deliver it through Brevo.

The notification includes:

- topic
- sender name/email
- message
- support ID
- browser/device user-agent
- private screenshot path when provided
- Reply button that opens a prefilled email to the visitor

There is intentionally no automatic reply to the visitor: the page promises that a real person will respond. The website success message confirms receipt and the 72-hour response commitment.

## Viewing screenshots

Screenshots are private. During the first launch, use Supabase Dashboard → Storage → `support-attachments` to inspect/download the file path included in the owner notification. Do not make this bucket public. A protected support-admin page or signed-URL workflow can be added later.

## Direct email fallback

The Help page provides `mailto:` links for exact subjects:

- Support
- Bug
- Billing
- Privacy
- Other

These links open the visitor's configured email app with the recipient/subject prepared. The visitor chooses Send. Browser security does not allow the website to silently attach the selected screenshot to a mailto draft, so screenshots submitted through the web form use private Storage instead.

## Live test checklist

1. Run the final schema.
2. Activate the Brevo/outbox worker from `EMAIL-INTEGRATION.md`.
3. Set allowed origins and deploy `submit-support-message`.
4. Submit each topic without a screenshot.
5. Submit PNG, JPG, and GIF screenshots under 10MB.
6. Confirm unsupported/oversized files are rejected.
7. Confirm the database row and private object exist.
8. Confirm the owner notification reaches Gmail and Reply opens a prepared response.
9. Confirm three messages are accepted and the fourth from the same email is blocked for 24 hours.
10. Confirm direct-email subject links work.
11. Test Galaxy S5, Pixel 7, both tablets, laptop, and MacBook layouts.
