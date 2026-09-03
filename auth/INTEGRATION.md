# Paragon shared authentication integration

> Canonical Archive shell: `/paragon-archive.html`. If exported files arrive flattened, reconstruct paths using the export headers and SOP §3A.

All Paragon products should be served from paths on the same origin, for example:

- `/archive/`
- `/notes/`
- `/education/`
- `/exam/`
- `/code/`

Each product loads these public browser files in order:

```html
<script src="/config/supabase.js"></script>
<script src="/auth/supabase-auth.js"></script>
<script src="/auth/paragon-sync.js"></script>
```

## Supabase setup

1. Create a Supabase project.
2. Run [`../supabase/schema.sql`](../supabase/schema.sql) in the SQL editor.
3. Add the project URL and anon key to [`../config/supabase.js`](../config/supabase.js).
4. Enable **Email** and **Google** providers in Supabase Authentication.
5. Add the application origin and callback paths to Supabase URL Configuration.
6. In Google Cloud, add the Supabase OAuth callback URL shown by Supabase.

The anon key is public by design. The RLS policies in `schema.sql` ensure users can only access their own row.

## Authentication

```js
const session = await ParagonAuth.getSession();
const user = session?.user;

await ParagonAuth.signInWithPassword(email, password);
await ParagonAuth.signUpWithPassword(email, password, displayName);
ParagonAuth.signInWithGoogle();
await ParagonAuth.signOut();
```

## Shared product/course progress

Use a stable product ID on every route:

```js
await ParagonProgress.save("paragon-education", {
  courseId: "html-foundations",
  lesson: 7,
  completion: 0.58
});

const progress = await ParagonProgress.load("paragon-education");
```

`ParagonProgress` stores product data inside the authenticated user's RLS-protected `paragon_user_state.state.progress` JSON object. The same row also carries bookmarks, reviews, review votes, visits, preferences, collections, in-app notifications, and profile metadata such as registration date and notification cutoff.

## Creator demo identity

`config/supabase.js` contains only the public creator demo email identifier. Create that user through Supabase Auth using the privately supplied password. Never place the password, service-role key, or Google client secret in browser files. The creator label is display metadata only; any future privileged creator/admin authorization must use protected Supabase claims or server-side checks.

## Usernames

Email sign-up checks `paragon_username_available`, includes the username in Supabase user metadata, and the `handle_new_paragon_user` trigger creates a unique `paragon_profiles` row. Google users receive a sanitized email/profile fallback username. Treat usernames as public identity, not authorization.

## Website requests

Authenticated requests are inserted into `paragon_website_requests` through `ParagonSync.submitWebsiteRequest()`. Use `ParagonSync.getWebsiteRequestEligibility()` to show the latest rolling-seven-day eligibility state before submission. Use `ParagonSync.getWebsiteRequestCount()` for the privacy-safe public aggregate returned by `paragon_request_count()`; an empty database returns zero and no request/user fields are exposed. The database trigger `enforce_paragon_request_rate_limit` is the authority: it uses a per-user advisory transaction lock and rejects every second request from the same authenticated account within seven days, including simultaneous attempts.

A request with optional contact email queues the allowlisted email receipt. A request without contact email appends the receipt to the authenticated user's in-app notifications instead. Guest requests remain session-only drafts until sign-in. Anonymous inserts stay revoked, so logging out and switching to Guest cannot bypass the account limit. This implementation does not use IP addresses or device fingerprints for request limiting.

## PWA and product paths

Keep `service-worker.js` at project root so it can cache the Archive shell and shared modules. Each additional path-based product may register its own narrower service worker or share the root worker intentionally; avoid overlapping cache strategies without planning scope.

## Guest behavior

Guest sessions are managed with `sessionStorage`. The same `ParagonProgress` API works while Guest is active, but it writes only to the shared session-only Guest state instead of Supabase. Hidden/offline time is tracked with a session timestamp; after 30 continuous minutes away or offline, the Guest session and its temporary activity are cleared. Returning sooner cancels the pending expiry. If the still-live Guest authenticates first, bookmarks, reviews, votes, visits/history, progress, preferences, and collection items merge into the authenticated RLS state. Explicit Guest end or expiry discards them.

## Production hardening

For higher-security deployments, consider moving refresh tokens to secure HttpOnly cookies through a server-side auth layer. Keep Row Level Security enabled even when a server is added.
