<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: PWA-APP-MODE.md
  EXPECTED PROJECT PATH: /native/PWA-APP-MODE.md
  ROLE: The owner's FINAL app decision (2026-08-24, replaces the retired TWA/Play Store plan):
        Paragon Archive is a browser-installable PWA that behaves like a real installed app.
        This file records what "real app" means here, what is already built, what browsers
        honestly cannot do, and the one remaining blocker (production HTTPS domain).
  RESTORE-LOAD NOTE: Governance/product doc. Replaced native/TWA-BUILD-KIT.md (D-172 replacement law).
-->

# 📲 Paragon Archive — Browser-Install "Real App" Mode (PWA-Only)

**Owner decision (2026-08-24):** No Play Store app. No $25. No packaging tools.
The app is the **installable PWA** — after "Install Paragon Archive" (Account settings),
it runs in its own window with no browser UI, own icon, own taskbar/dock entry, and works offline.

## What "real app" means — and what is ALREADY BUILT
| Real-app behavior | Status |
|---|---|
| Own window, no address bar, no Chrome toolbar (`display: standalone` + `display_override`) | ✅ manifest v2 |
| Own icon on desktop/home screen (brand PWA icons + maskable) | ✅ |
| Offline shell — catalogue, icons, styles cached; offline page when a route is unreachable | ✅ service worker |
| App shortcuts (right-click the icon) + categories | ✅ manifest v2 |
| 🔔 Notifications — permission opt-in + test ping in Account → App settings | ✅ P-094 |
| 📤 Share sheet — Web Share API with copy-link fallback | ✅ P-094 |
| Board-style app topbar (logo + search + back) shared across products | ✅ P-094 |
| Install prompt handled in-app (Account → Install Paragon Archive) | ✅ pwa.js |

## Honest browser limits (no fix exists — every PWA shares these)
- **The "Chrome chip"**: on desktop Chrome, installed PWAs can show a small "⪚" pil in the
  window frame. It is browser-controlled — no website can remove it today. On Android the
  installed app opens web-style with no chip; on iOS it uses the Safari Add-to-Home flow.
- **OS "App info / uninstall" panel**: opening the OS-level app-info page from a button is
  not exposed to web apps. Users uninstall a PWA the normal OS way (or via `app.uninstall`
  experiments that are not standard). We keep in-app guidance instead.
- **Server push notifications** need a push service + the production HTTPS domain (roadmap item 6).
- **Permissions** (camera/location/etc.): browsers grant these per-site when a feature needs
  them. Paragon deliberately requests NOTHING beyond notifications — the Archive has no
  feature that needs camera, mic, or location, so we do not ask (privacy-first, P-009-aligned).

## The one real blocker
`beforeinstallprompt` requires a **production HTTPS origin** (localhost previews install on
Chrome desktop/Android for testing, but the public needs the real domain). That same domain
unlocks: server push, absolute `og:image`, Supabase redirect allowlist, and AdSense review.

## When the domain arrives (checklist)
1. Host the project at the HTTPS origin; keep `paragon-archive.html` as entry.
2. Add the origin to the Supabase Auth redirect allowlist (Site URL + redirects).
3. Deploy a push service (Supabase Edge Function) and wire it to announcements → notifications.
4. Verify install prompt + notifications on a real device; tick roadmap item 6.

---

## ❓ OWNER QUESTION (P-097): "Can we ship a REAL downloadable installer app for FREE — no Play Store?"

**Honest answer: no — not a true native installer, and here is the full truth:**

| Path | Cost | Reality |
|---|---|---|
| Play Store app (APK) | $25 once | ❌ Owner rejected (and rightly — no money needed) |
| Native Windows installer (.exe/MSIX) | Free to build | ⚠️ Unsigned installers scream "unknown publisher" warnings on every user's PC; real signing certificates cost money (\\$100+/yr). Free = scary warnings = users run away |
| Native Mac app | \\$99/yr Apple dev account | ❌ Not free |
| **Browser-install PWA (what we built)** | **\\$0** | ✅ Android: real icon, own window, NO browser bar, NO Chrome chip. Desktop: own window + taskbar icon, small browser frame chip (unremovable browser rule). Auto-updates on every visit — which is EXACTLY the owner's "Install Paragon Archive as the gateway to every newly updated file" idea, already how it works |

**So the decision stands:** PWA-only (D-177). The install gateway popup (P-097) with the
permission toggles + Install button is the closest free thing to a "real app installer",
and on Android phones it genuinely becomes a real app icon. When the production domain
arrives, server push + the morning hello notifications complete the native feeling.
