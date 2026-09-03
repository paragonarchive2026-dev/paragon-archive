<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: GOOGLE-OAUTH-BRANDING.md
  EXPECTED PROJECT PATH: /docs/GOOGLE-OAUTH-BRANDING.md
  ROLE: Exact owner steps to make the Google sign-in consent screen say "Paragon Archive"
        (instead of "Continue with qnylhlyyzpwlfftiygcn.supabase.co"), plus the scopes,
        the redirect URLs to allowlist, and the post-login profile behaviour (P-094).
  RESTORE-LOAD NOTE: Owner-side setup doc — the code side (profile, guest-merge, splash
                     replay) is already implemented in app.js this turn.
-->

# 🔵 Google Sign-In — Make it say "Paragon Archive"

## Why it currently shows the Supabase address
Google shows "Continue with <app>" using the **OAuth consent screen configuration inside
YOUR Google Cloud project**. When that screen has no app name/logo (or the app is still in
"Testing"), Google falls back to showing the callback domain — which is the Supabase
project. Supabase cannot override this from its side; the fix is entirely in Google Cloud
Console. 10 minutes, free.

## Steps (owner, in Google Cloud Console)
1. Go to **https://console.cloud.google.com** → sign in with `paragon.archive.2026@gmail.com`.
2. Select the project you created when configuring Google sign-in (the one whose
   **Client ID** you pasted into Supabase).
3. Left menu → **APIs & Services → OAuth consent screen**.
4. Click **Edit App** (or Configure Consent Screen):
   - **App name:** `Paragon Archive`
   - **User support email:** paragon.archive.2026@gmail.com
   - **App logo:** upload `assets/brand/logo-mark.png` (512×512 works best)
   - **Application home page:** your future domain (or leave blank until the domain exists)
   - **Scopes:** keep/add ONLY these three (they are exactly what Paragon needs):
     * `openid`
     * `.../auth/userinfo.email` — the account email
     * `.../auth/userinfo.profile` — **name + profile picture** (this is what lets the
       Paragon profile start from the user's real name, per your request)
     Nothing else. Paragon does not need contacts, drive, or anything sensitive — fewer
     scopes = friendlier consent screen + easier Google review.
   - **Test users:** while in Testing mode, add `paragon.archive.2026@gmail.com`.
5. **Credentials → OAuth 2.0 Client IDs → your Web client** and confirm both:
   - **Authorized JavaScript origins:** the exact origins you serve Paragon from
     (e.g. `http://localhost:7700` for local testing + the future `https://<your-domain>`)
   - **Authorized redirect URIs:** `https://qnylhlyyzpwlfftiygcn.supabase.co/auth/v1/callback`
     (this one is REQUIRED — it is how Google hands the login back to Supabase)
6. Save. Consent changes can take ~5 minutes to a few hours to show.
7. Later, when the production domain exists: add it to BOTH the origins above AND to
   **Supabase → Authentication → URL Configuration** (Site URL + Redirect URLs), then
   re-test so the `redirect_to` points at the real domain.

**Optional but recommended:** Publish the app (Push to production) — Testing mode caps
users at 100 and shows an "unverified app" warning. Publishing with only the three basic
scopes is usually approved automatically.

## What the code now does after login (already built, 2026-08-24)
- The Google **name and avatar become the starting profile**; an ✏️ button beside the
  name lets the user edit it, and the name is **saved to the account** (survives logout,
  returns on next login).
- Everything a guest did before logging in (bookmarks, reviews, votes, needs, visits,
  collections) is **merged into the account** on login — and if the guest does more before
  logging in again, it merges again.
- Every login **replays the full welcome loading splash** (5 s, preloaded art, percentage
  ring) — the "appears instantly unloaded" bug is fixed.

## Still blocked by Brevo (see docs/BREVO-CONTACT.md)
Email sign-ups still fail with "Error sending confirmation email" until Brevo activates
the account's SMTP relay — Google sign-in does NOT depend on it and works once the steps
above are done.
