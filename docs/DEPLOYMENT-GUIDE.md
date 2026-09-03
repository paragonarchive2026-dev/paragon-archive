<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: DEPLOYMENT-GUIDE.md
  EXPECTED PROJECT PATH: /docs/DEPLOYMENT-GUIDE.md
  ROLE: How the owner gets Paragon Archive from this workspace to GitHub -> Vercel/Netlify
        (free), including the SPCK Editor workflow, the per-turn changed-files list, and
        the honest answers on push access + upload limits (P-098).
  RESTORE-LOAD NOTE: Owner-side procedures. The agent cannot push to GitHub directly.
-->

# 🚀 Paragon Archive — GitHub + Vercel/Netlify + SPCK Guide (all FREE)

## 1. Can the agent push to GitHub directly?
**Honest answer: no.** The agent has no access to your GitHub account/credentials and never
will (that would be unsafe). But the workflow below takes ~5 minutes per update and the
agent does its part: **every turn, a changed-files list is written to `docs/CHANGES.md`**
(file + what changed), so you always know exactly what to upload.

## 2. One-time setup (15 minutes)
1. Create a **GitHub** account (free) → New repository → name it `paragon-archive` → Public → Create.
2. Install **Git** on your computer (git-scm.com) OR just use GitHub's web uploader (easiest:
   repo page → "uploading an existing file" link → drag folders).
3. Go to **vercel.com** (or netlify.com) → Sign up **with GitHub** → "Add New Project" →
   import `paragon-archive` → Deploy. Done — you get a free `*.vercel.app` HTTPS URL.
   - Vercel/Netlify serve static sites perfectly: no build command, no output folder needed.
4. Later, buy a domain (~₦2,000–5,000/yr from Whogohost/Qservers/Namecheap) and add it in
   Vercel → Settings → Domains (free SSL automatic). That domain unlocks: real install
   prompts, server push notifications, AdSense application, OAuth consent publishing.

## 3. Every-update workflow (SPCK Editor)
1. In the agent chat, say **"start with the next update"** and attach the files you're
   replacing (or just download the whole project zip if offered).
2. The agent ships a **`docs/CHANGES.md`** listing every changed/added/deleted file.
3. In SPCK: open your local copy → replace exactly those files (delete files marked deleted).
4. Push to GitHub (either):
   - **SPCK + Git**: SPCK has Git support (Menu → Git → Commit/Push) after you clone
     `https://github.com/<you>/paragon-archive.git`;
   - **Or web upload**: github.com → your repo → Add file → Upload files → drag the changed
     files/folders (keep the same folder paths!) → Commit.
5. Vercel/Netlify **redeploys automatically** on every commit — zero extra steps.

## 3b. Downloading the WHOLE project as a ZIP from GitHub (easiest backup / SPCK copy)
The ZIP is just your files — GitHub **excludes the hidden .git history**, so what you get is
the clean project (~6.5 MB of code + images; smaller than two phone photos).
- **On a computer (browser):** open `https://github.com/<you>/paragon-archive` → tap the
  green **"Code"** button (top-right above the file list) → **"Download ZIP"**. Your phone
  or PC saves `paragon-archive-main.zip` → open it with your file manager to unzip.
- **Direct link (no clicking needed):** `https://github.com/<you>/paragon-archive/archive/refs/heads/main.zip`
  — replace `<you>` with your GitHub username, and `main` with your branch name if yours is
  different (the dropdown under "Code" shows it, e.g. `master`). Paste the link in any
  browser and the download starts immediately.
- **In SPCK:** the same web steps work inside SPCK's browser, or unzip on the phone with
  Files by Google / ZArchiver, then open the folder — keep the folder paths identical when
  replacing files in your SPCK project.
- **Why it's small (not large):** the whole project content is ~6.5 MB across ~283 files.
  The biggest files are the single consolidated code files (app.js ~327 KB, team-pages.js
  ~373 KB, style.css ~345 KB) and the docs — all by design after the file-count reduction.
  GitHub's per-file limit is 100 MB, so nothing here is anywhere near a problem.

## 4. How many files can you upload to the agent per turn?
Honest practical guidance (varies by platform limits, file size ~tens of MB each):
- **Comfortable: about 10–20 files per message.** Beyond that reliability drops.
- For many files: **zip them and upload the single zip** (the agent can unpack it) —
  a zip can carry hundreds of files.
- Text/code files are tiny; the 100 MB total project fits easily in a couple of zips.

## 5. Folder structure note (why some files sit at the root)
`paragon-archive.html`, `app.js`, `style.css`, `service-worker.js` etc. MUST stay at the
project root: the service worker's scope, the PWA manifest, and the canonical-entry law
depend on it. Everything else lives in folders (assets/, team/, data/, docs/, sites/…).

## 6. The Chrome-banner question (installed app)
- **Android install:** own icon, full screen, **no browser bar at all** — already true.
- **Desktop Chrome PWA:** a slim title bar with the origin remains — **no website can remove
  it** (browser security rule).
- **The NotebookLM-style window you saw** is a **Chrome extension**, not a PWA: extensions
  can open frameless windows (`chrome.windows.create`). Paragon COULD ship a tiny free
  extension that opens the deployed site in a frameless window — developing it is free, but
  publishing on the Chrome Web Store costs a **one-time $5** (the cheapest "real app store"
  fee that exists — still optional and NOT required for anything else to work).

## 7. Hosting summary
| Thing | Where | Cost |
|---|---|---|
| Code | GitHub | Free |
| Hosting + SSL + URL | Vercel or Netlify (pick one) | Free |
| Custom domain (later) | Any Nigerian registrar | ~₦2–5k/yr |
| Chrome frameless app (optional, later) | Chrome Web Store | $5 once |
