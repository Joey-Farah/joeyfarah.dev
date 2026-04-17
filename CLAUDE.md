# CLAUDE.md — joeyfarah.dev

Read this file before writing any code. It describes the current project state, what has been built, and what comes next.

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

## Current State (as of 2026-04-14)

The site is **fully built and visually polished**. All 40 user stories from the PRD are implemented. Manual browser validation passed (Lighthouse 100, mobile boot timing, scroll transition).

### What exists
- Terminal boot sequence hero → bento grid scroll transition
- Professional timeline (Deloitte, Accenture, Grant Thornton) with scroll-animated entries
- Oracle Database Mapper ERD tile with SVG pathLength draw animation
- Enterprise suite tiles (Conversion Automation, Fusion SQL Developer)
- Personal project tiles (Slippi, Fitness Ring, Habitat, Lombardi)
- Contact tile with copy-to-clipboard email, resume download, build date footer
- Sticky NavBar with smooth entrance animation
- Cyan scroll progress bar fixed at top of viewport
- `GET /api/resume` — downloadable plain-text resume
- Custom 404 page (terminal-themed)
- SEO: OG tags, Twitter Card, Schema.org JSON-LD, robots.txt
- Favicon: `>_` SVG glyph

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

These require Joey's input (accounts, payment, external setup). Do them in order — each step unblocks the next. Total time if nothing goes wrong: **~45 min**.

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
