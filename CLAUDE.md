# CLAUDE.md — joeyfarah.dev

Read this file before writing any code. It describes the current project state, what has been built, and what comes next.

## Security

Never read `.env`, `.env.*`, or any file containing secrets or credentials. If a task requires a secret value, ask Joey to supply it directly.

---

## Project

Personal portfolio site for Joey Farah — Oracle Cloud ERP Architect and independent developer.

**Stack:** React + Vite (client), Node.js + Express (server), MongoDB Atlas, shared Zod schemas. Monorepo deployed as a single Railway service.

**Design language:** Bento-Terminal hybrid. Dark mode (`#0d0d0d`), electric cyan (`#06b6d4`) accents, JetBrains Mono font, terminal chrome on every tile.

**Key docs:**
- `PRD.md` — all 40 user stories, tile types, content schema
- `ARCHITECTURE.md` — authoritative module map, interfaces, implementation order, data flow
- `CHANGELOG.md` — full history of what has been built and changed

---

## Current State (as of 2026-06-26)

The site is **live at https://joeyfarah.dev** — past the old "pre-launch stripped" phase. It is a **single page** (the former `/work` route was collapsed into an in-page `#build` section; there is no router). Deployed on Railway + MongoDB Atlas.

### Page composition (top → bottom, `App.tsx`)
Hero boot sequence → scroll transition → `IntroSection` (`#joey`) → `WorkSection` (`#build`) → `BentoGrid` (projects / timeline / personal) → `ClosingCTA`.

- **NavBar order:** `// joey` · `// build` · `// projects` · `// timeline` · `// personal` (anchors, not pages — `NavBar.tsx`).
- **Hero** (`hero` tile) — boot lines: *Joey Farah · Father & Husband · Developer · Cloud Consultant · Globally Ranked Gamer*.
- **`IntroSection`** (`#joey`, hardcoded component) — "$ joey", how-I-work / scope→build→ship methodology.
- **`WorkSection`** (`#build`, hardcoded component) — collaborator-framed "got something you want built?", a single email CTA (`hello@joeyfarah.dev`, click-to-copy), the stats grid (7 yrs Oracle, 6+ products, 50+ paid Patreon supporters, #61 SSBMRank 2025), and contact links (LinkedIn, GitHub, Discord). Contact rows live **here**, not in a tile.
- **`ClosingCTA`** (hardcoded component) — closing email ask at the very bottom (`hello@joeyfarah.dev`).

### Visible tiles (live, served from Atlas via `/api/blocks`)
- `hero`, `dual-timeline` (career overview, `#professional-timeline`)
- Project cards (`#projects`): `oracle-db-diagram`, `fusion-sql-developer`, `conversion-assistant`, `slippi-ranked-stats`, `lombardi-project`, `joeyfarah-dev`, `spotify-to-mp3`, `trendarc`
- Personal (`#personal`): `SlippiStatsTile` (hardcoded live-rating tile) + `reading-list` + `music-list`

### Hidden tiles (`visible: false` in seed)
- `professional-timeline` (old single-entry `timeline` type — superseded by `dual-timeline`)
- `habitat` — project card, in-development
- `contact` (`contact-links` type) — **deprecated**; contact was absorbed into `WorkSection`. Only holds a "Build with me" link.

### Tile types in use
`hero`, `dual-timeline`, `timeline`, `project-card` (×9), `reading-list`, `music-list`, `contact-links`.

### Infrastructure
- Terminal boot sequence hero → bento grid scroll transition (`ScrollTransitionOrchestrator`)
- Sticky NavBar (hidden while hero shows; 5 section anchors once scrolled)
- Cyan scroll progress bar, scroll-to-top button, keyboard section nav (j/k, arrows)
- Custom 404 page (terminal-themed)
- SEO: OG tags, Twitter Card, Schema.org JSON-LD, robots.txt; favicon `>_` SVG glyph
- **Email:** `hello@joeyfarah.dev` via Cloudflare Email Routing → Gmail (confirmed working). Wired into `WorkSection` + `ClosingCTA`. *(Not `joey@` — older notes in this file reference that; `hello@` is the live alias.)*
- Known: `BentoTile.test.tsx` has 2 pre-existing failures (gridColumn/gridRow inline-style assertions) on clean `main`.

### Build
```bash
npm install
npm run build       # client (Vite) + server (tsc --build)
npm run dev         # concurrent Vite dev server + Express (ports 5173 + 3001)
npm run seed        # validate + upsert blocks.seed.json to MongoDB Atlas
```

### Environment
Requires `.env` at root AND `server/.env` (copy of root):
```
MONGODB_URI=mongodb+srv://...
NODE_ENV=development
PORT=3001
```

The seed script reads from `server/.env`. If seed fails with "MONGODB_URI not set", copy root `.env` to `server/.env`.

### Updating the live site

Two independent paths — do not confuse them:

- **Code changes** (React/Express/shared): `git push origin main` → Railway auto-builds + redeploys in ~2 min. No manual step.
- **Content changes** (`server/seed/blocks.seed.json`): `git push` does **not** update what visitors see. The live site reads tile content from MongoDB Atlas. You must run `MONGODB_URI="<prod-atlas-uri>" npm run seed` to push the JSON into the DB. Commit + push the JSON afterward to keep the repo as source of truth; otherwise the repo and live DB drift.

Checklist when editing a tile: (1) edit JSON, (2) run `npm run seed` against prod, (3) verify on https://joeyfarah.dev, (4) commit + push.

---

## What Still Needs To Be Done

> ✅ **Mostly historical.** §1 (Deploy to Railway) and §2 (buy domain + DNS) are **done** — the site is live at https://joeyfarah.dev on Railway + Atlas. Kept below as reference for the deploy/DNS topology and the re-seed commands. The only items that may still be open are §3 (analytics — optional) and the Cloudflare proxy/TLS/analytics-token follow-ups in *Immediate Next Steps* §4–6.

These required Joey's input (accounts, payment, external setup). Original estimate: **~45 min**.

### 0. Before you start — checklist

- [ ] MongoDB Atlas cluster is running and you have the connection string (`mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`). Test it locally: `MONGODB_URI="<your-uri>" npm run seed` should exit with `✓ Seeded N blocks`.
- [ ] Latest `main` is pushed to `github.com/Joey-Farah/joeyfarah.dev`.
- [ ] `.dev` domains always require HTTPS (Google enforces via HSTS preload). Cloudflare, Railway, and this app all handle that — just mentioned so you're not surprised.

---

### 1. Deploy to Railway (~15 min)

1. Sign in at [railway.app](https://railway.app) with GitHub. (Free trial covers this app; typical cost after trial is $5–8/mo on the Hobby plan.)
2. **New Project → Deploy from GitHub repo → `Joey-Farah/joeyfarah.dev`**. Railway clones the repo and starts building.
3. Open the service → **Settings** tab → **Service** section. Confirm (override if Railway auto-filled wrong):
   - **Root Directory:** blank (i.e. repo root)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server/dist/index.js`
   - **Healthcheck Path:** `/healthz` *(this endpoint exists — Railway will mark the deploy unhealthy if it doesn't 200)*
4. **Settings → Variables** → add:

   | Key | Value | Notes |
   |---|---|---|
   | `MONGODB_URI` | `mongodb+srv://…` | full Atlas string, URL-encode the password if it has `@` or `:` |
   | `NODE_ENV` | `production` | enables static SPA serving in `server/src/index.ts` |
   | `SITE_URL` | `https://joeyfarah.dev` | *(optional)* — used by `/sitemap.xml`. Defaults to `https://joeyfarah.dev`, so skip until you've bought the domain |

   **Do NOT set `PORT`** — Railway injects it; the server reads `process.env.PORT` already.

5. **Atlas → Network Access** → add an IP access rule of `0.0.0.0/0` *(allow all; required because Railway egress IPs rotate)*. Safer alternative if you upgrade to a paid Atlas tier: enable private networking.
6. Back on Railway → click **Deploy** (or push a commit). First build takes ~2 min. Tail logs in the **Deployments** tab; you want to see `[server] Listening on port <N>`.
7. **Seed the production database** (one-time, from your laptop; re-run every time you edit `server/seed/blocks.seed.json`):
   ```bash
   MONGODB_URI="<prod-atlas-uri>" npm run seed
   ```
8. **Settings → Networking** → **Generate Domain** → Railway gives you a free `<service>.up.railway.app`. Write it down. You'll use it for DNS next.
9. Smoke test before touching DNS:
   ```bash
   curl https://<service>.up.railway.app/healthz        # {"status":"ok",...}
   curl https://<service>.up.railway.app/api/blocks     # JSON array of tiles
   curl https://<service>.up.railway.app/sitemap.xml    # XML urlset
   ```
   All three must succeed before you move on.

---

### 2. Buy the domain + point DNS (~15 min, plus TLS cert propagation)

Recommended registrar: **[Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)** (~$10/yr at cost, free DNS, CNAME flattening for apex records). Alternatives: Porkbun, Namecheap — if you pick one of those, the DNS steps are the same but the registrar's name differs.

1. Purchase `joeyfarah.dev` in Cloudflare Registrar. Payment goes through Cloudflare's standard checkout.
2. Cloudflare auto-creates a DNS zone. Open it and add these records — **Proxy status must be DNS only (grey cloud)** because Railway handles TLS itself:

   | Type | Name | Content | Proxy |
   |---|---|---|---|
   | CNAME | `@` | `<service>.up.railway.app` | DNS only |
   | CNAME | `www` | `<service>.up.railway.app` | DNS only |

3. In Railway → service → **Settings → Networking → Custom Domain** → add `joeyfarah.dev` and `www.joeyfarah.dev`. Railway provisions Let's Encrypt certs automatically — usually ready in 5 min, sometimes up to 30.
4. Verify: `curl -I https://joeyfarah.dev` → expect `HTTP/2 200` and a green padlock in the browser.
5. **Update hardcoded URLs if and only if the domain is anything other than `joeyfarah.dev`.** Current hardcoded refs to sanity-check:
   - `client/index.html` — `og:url`, `og:image`, `twitter:image`, canonical link, Schema.org `url`
   - `client/public/robots.txt` — `Sitemap:` line
   - `server/src/routes/resume.ts` — `Portfolio: joeyfarah.dev`
   - `server/src/routes/sitemap.ts` — default for `SITE_URL` env var
   - `server/seed/blocks.seed.json` — search for any placeholder URLs
   - On Railway, update the `SITE_URL` env var from step 1.4 to match.
6. If you edited the seed, re-run `npm run seed` with the prod `MONGODB_URI`.

---

### 3. Analytics (~5 min — optional)

Pick **one** or skip. Both are a single `<script>` tag in `client/index.html` — no React code needed. CSP is already open for Plausible and GA4 domains in `server/src/index.ts` (helmet config).

**Option A — Plausible (recommended, privacy-first, ~$9/mo, no cookie banner needed):**
1. Sign up at [plausible.io](https://plausible.io), add site `joeyfarah.dev`.
2. Paste into `client/index.html` `<head>` (above the existing fonts link works fine):
   ```html
   <script defer data-domain="joeyfarah.dev" src="https://plausible.io/js/script.js"></script>
   ```

**Option B — GA4 (free, heavier, needs cookie consent for EU traffic):**
1. Create a GA4 property at [analytics.google.com](https://analytics.google.com), copy the Measurement ID (format `G-XXXXXXXXXX`).
2. Paste into `client/index.html` `<head>`, replacing both `G-XXXXXXXXXX` placeholders:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
3. Commit + push. Railway auto-deploys in ~2 min. No cookie banner for US-only traffic; if you get EU visitors, wire up a consent library (e.g., [cookieconsent](https://github.com/orestbida/cookieconsent)).

---

### 4. Heads-up (no action required, but expect these)

- **Dependabot PRs** will start arriving on Mondays (config at `.github/dependabot.yml`). Dev-deps and minor/patch updates are grouped — usually 1–3 PRs/week. Merge freely after CI passes.
- **Lighthouse CI** runs on every PR and push to main (`.github/workflows/lighthouse.yml`). Accessibility and SEO scores must stay ≥ 0.9 or the job fails. Reports are uploaded to temporary public storage (link appears in the job log).
- **OG image regen:** if you edit `client/scripts/generate-og.mjs` (e.g. change the name or tagline), run `npm run og --workspace=client` and commit the updated `client/public/og.png`.

---

## Immediate Next Steps (pick up here next session)

1. ~~**Cloudflare email routing**~~ — ✅ **DONE.** `hello@joeyfarah.dev` → `joeyefarah@gmail.com` routing is live and confirmed (MX/SPF/DKIM present; round-trip tested). The alias is wired into `WorkSection` + `ClosingCTA` as the email CTA, not into a tile. Note: the live alias is `hello@`, **not** `joey@` as earlier drafts assumed.

2. **Spotify-to-MP3 `.env`** — the repo at `C:\Users\joeyf\Documents\GitHub\ClaudeCoding\spotify-to-mp3` has `.env.example` and dotenv support in place but the actual `.env` hasn't been created yet. Run:
   ```bash
   cat ~/.spotdl/config.json | grep -E "client_id|client_secret"
   ```
   Then create `.env` in the project root with `SPOTIFY_CLIENT_ID=` and `SPOTIFY_CLIENT_SECRET=`.

3. **Spotify-to-MP3 portfolio tile** — once the repo has real content, add a `project-card` tile for it in `server/seed/blocks.seed.json` (see slippi-ranked-stats as a template) and seed to prod.

4. **Verify Cloudflare proxy state for `joeyfarah.dev`** — Cloudflare dashboard is showing real edge analytics (29 uniques / 1.27k requests in 24h on 2026-05-12), which means at least one DNS record is **proxied (orange cloud)**, contradicting the "DNS only (grey cloud)" assumption baked into §2 of this file. Open Cloudflare → DNS and note the proxy state of the `@` and `www` records, then update §2 here to match reality.

5. **Confirm TLS mode is Full (strict)** — if records are proxied, the TLS chain is browser → Cloudflare → Railway. In Cloudflare → SSL/TLS → Overview, verify the mode is **Full (strict)**. Anything else (especially "Flexible") leaves the Cloudflare↔Railway leg unencrypted and must be fixed before doing anything else.

6. **Wire up Cloudflare Analytics API access for Claude** — once proxy state is confirmed, create a Cloudflare API token at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) scoped to *Zone → Analytics → Read* + *Zone → Zone → Read* for the `joeyfarah.dev` zone. Also grab the zone ID (right sidebar of the Cloudflare overview). With those two values, Claude can pull traffic, top paths, bot vs human, country breakdown, and status codes via the GraphQL Analytics API — same data as the dashboard plus per-path detail the free UI hides.

7. ~~**Refresh site content**~~ — ✅ **DONE.** The site is no longer stripped: the bento grid is live with the full project set, dual-timeline, reading-list, and music-list. Remaining hidden-by-design: `professional-timeline` (superseded by `dual-timeline`), `habitat` (in-development), and the deprecated `contact` tile. To flip `habitat` on later: set `visible: true` in the seed → `npm run seed` against prod Atlas → commit + push.

---

## Ideas Backlog

### Not yet done — needs Joey's content or a judgment call
- **`prefers-color-scheme` light mode** — CSS variable swap + localStorage persistence. Held off because it could break the terminal-dark brand; decide whether you want this.
- **Testimonial tile** — new `testimonial` tile type with a short quote carousel. Blocked on getting 2–3 quotes from colleagues.
- **Blog/writing tile** — links to dev.to or Medium posts. Blocked on picking a platform and writing at least one post.

### Not yet done — autonomous-safe, pick any time
- **Self-host JetBrains Mono** — removes Google Fonts roundtrip (privacy + perf win). Trade-off: adds ~50 kB WOFF2 to repo.
- **Error boundary** — wrap `<App>` so a rendering exception shows a themed fallback instead of a white screen.
- **Bundle analyzer report** — `rollup-plugin-visualizer` to show what's in the 92 kB gz bundle; informs future trimming.
- **Per-tile error boundaries** — one broken tile shouldn't break the whole grid.

### Already shipped (moved out of the backlog)
- ~~Tile hover deep-link~~ → click a tile's title bar to copy `#{slug}` (BentoTile.tsx)
- ~~Keyboard navigation~~ → ArrowUp/Down + j/k section nav (useKeyboardSectionNav.ts)
- ~~Lighthouse CI~~ → `.github/workflows/lighthouse.yml`
- ~~Code splitting~~ → ERDTileRenderer lazy-loaded into its own ~2 kB chunk
- ~~Scroll-to-top button~~ → ScrollToTopButton.tsx
- ~~`/sitemap.xml` endpoint~~ → server/src/routes/sitemap.ts
- ~~Active-section highlight in NavBar~~ → useActiveSection.ts
- ~~Skip-to-content link + focus rings~~ → index.css
- ~~OG image + theme-color + canonical~~ → client/index.html, client/public/og.png
- ~~Healthcheck + helmet + compression~~ → server/src/index.ts
- ~~Dependabot~~ → `.github/dependabot.yml`

### Deferred (out of scope or blocked on external systems)
- Real-time Melee rank from Slippi API
- Habitat live preview (depends on Habitat being deployed)
- CMS / admin panel (out of scope per PRD)

---

## Architecture Constraints (do not violate)

- **No admin UI** — content is updated via `server/seed/blocks.seed.json` + `npm run seed`
- **No write endpoints** at runtime — API is read-only
- **No layoutId** in AnimatePresence — Option B scroll transition only
- **Shared types** imported as `import { ... } from 'shared/types'` (workspace alias) — never relative `../../shared/`
- **Vitest throughout** — no Jest
- **`tsc --build`** for server — uses TypeScript project references for shared package

---

## Git

Remote: `git@github.com:Joey-Farah/joeyfarah.dev.git`
Branch: `main`
Joey Farah is the sole author. Do not add Co-Authored-By lines to commits.
