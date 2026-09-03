<!--
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: BUILD-PLAN-COMMUNITY-DEPLOYED.md
  EXPECTED PROJECT PATH: /docs/BUILD-PLAN-COMMUNITY-DEPLOYED.md
  ROLE: P-076 — the completion PLAN for the two in-progress roadmap items (Community Platform 50%, Developer Portal & Deployed 33%): gap analysis of what exists vs what's missing, proposed layouts/links/flow. AWAITING OWNER APPROVAL before any build starts.
  RESTORE/LOAD NOTE: Governance planning document. Owner approves/edits per section; approved items move into the build queue.
-->

# 🗺️ COMPLETION PLAN — Community Platform & Developer Portal/Deployed
**Status: PROPOSAL — waiting for your approval (nothing is built yet).** Approve, edit, or reject per numbered item in your next prompt.

## PART A — COMMUNITY PLATFORM (currently 50% by milestone checklist)

### What already EXISTS (real, verified in code)
✅ Hub Community page (6-step join wizard, membership record `paragonCommunityMembership:{userId}`) · ✅ membership badge in Account · ✅ Team moderation desks ready: Community Posts, Suggestions, Reviews & Reports · ✅ permissions law rows for community moderation · ✅ Supabase schema base (needs run).

### What's MISSING to call it complete (front-end, buildable now)
| # | Piece | Proposed layout / flow |
|---|---|---|
| A1 | **Community Board page** (`hub #community-board` or `community/board.html`) | Reddit-lite single feed: post composer at top (title + body, member-only), post cards (author, time, board tag chips: General/Show & Tell/Help/Ideas/Off-topic), like + comment counts (real zero), sort New/Top. Data: local store `paragonCommunity.posts.v1` until schema; the Team desk moderates the SAME store — real moderation loop on-device. |
| A2 | **Post detail + comments** | Card expands in-page (no new file): comment list + composer, report button → feeds Team Reviews & Reports queue for real. |
| A3 | **Member profiles (mini)** | Click author → side panel: display name, member-since, badges, their posts. Reads real membership + posts stores. |
| A4 | **Community guidelines page section** | Static section reusing the Hub doc style; links from composer ("by posting you agree…"). |
| A5 | **Backend hook points** | Every store keyed + labelled pendingBackendSync; when schema runs, swap store adapters (documented in code headers). |

**Flow:** Hub Community → (member) Board → post/comment/report → Team desks moderate → public board reflects. Non-members see the board read-only + join CTA.

## PART B — DEVELOPER PORTAL & DEPLOYED (currently 33%)

### What already EXISTS
✅ Deployed category + rules documented in Hub · ✅ illustrative Deployed detail template ("My Cool App") · ✅ Team desks: Dev Applications (accept/reject), Deployed Reviews (8-point checklist gate) · ✅ permissions rows (developer role, own-websites) · ✅ dev application form spec owed by owner (P-070 CTA).

### What's MISSING
| # | Piece | Proposed layout / flow |
|---|---|---|
| B1 | **Developer Portal page** (`hub #developers` or `developers.html`) | Landing: "Build for Paragon" hero, 3-step path (Apply → Get approved → Submit websites), requirements list (from Hub rules), Apply button → application form (uses your form spec when re-sent; my self-built form meanwhile). Submissions feed the REAL team applications desk store. |
| B2 | **Application form** | Fields per team desk record: username, email, portfolio, experience, skills, pitch. Writes `paragonTeamApplications.v1` for real (same-device loop) + pendingBackendSync label. |
| B3 | **Developer dashboard (mini)** | For accepted devs (role=developer in team preview): "My Websites" list, submission form (name, desc, category, URL, icon), status chips (pending review → approved/rejected — feeds Team Deployed desk store for real). |
| B4 | **Deployed public listing completion** | When a team-approved submission exists, it appears in the Deployed category for real (local store merge like announcements→updates sync, proven pattern). |
| B5 | **Safety pages** | Submission rules + review checklist public page (mirrors the team 8-point gate so devs know the bar). |

**Flow:** Portal → Apply (→ Team Dev Applications desk) → accepted → Dev dashboard → submit website (→ Team Deployed Reviews desk, 8-point gate) → approve → website joins the public Deployed category. Every step real on-device now, backend swaps in later.

## HONESTY GUARANTEES (both parts)
- All counters start at real zero; no fake members, posts, developers, or apps.
- Anything not yet backend-powered is labelled pendingBackendSync in the UI where relevant.
- The existing "My Cool App" illustrative template stays clearly labelled or retires once the first real approved website exists.

## PROPOSED BUILD ORDER (if approved)
1. B1+B2 (Portal + application form — completes the milestone's biggest gap, feeds existing desk)
2. A1+A2 (Community board + comments — completes the community loop with existing moderation desks)
3. B3+B4 (Dev dashboard + real Deployed listing merge)
4. A3+A4+B5 (profiles, guidelines, rules pages)

**👉 Your move:** approve all, approve some numbers (e.g. "build B1 B2 A1"), or change anything — layouts/flows adjust to your word.
