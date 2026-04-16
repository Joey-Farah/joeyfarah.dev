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

---

## What Still Needs To Be Done

These require Joey's input (accounts, payment, external setup). Do them in order — each step unblocks the next.

### 1. Deploy to Railway

**Prereq:** GitHub repo `Joey-Farah/joeyfarah.dev` is pushed and up to date, MongoDB Atlas cluster exists with a working `MONGODB_URI`.

1. Sign in at [railway.app](https://railway.app) with GitHub (free tier allows ~$5 usage/mo).
2. Click **New Project → Deploy from GitHub repo → `Joey-Farah/joeyfarah.dev`**.
3. Railway auto-detects Nixpacks (Node.js). On the service **Settings** tab, confirm:
   - **Root Directory:** `/` (leave blank)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server/dist/index.js`
   - **Watch Paths:** `/**` (default)
4. In **Variables**, add:
   - `MONGODB_URI` — full Atlas connection string (includes username, password, cluster, `?retryWrites=true&w=majority`)
   - `NODE_ENV` = `production`
   - (Do **not** set `PORT` — Railway injects it automatically; the server reads `process.env.PORT`)
5. Click **Deploy**. First build takes ~2 min. Tail logs in the **Deployments** tab. Expect `[server] Listening on port <N>`.
6. **Seed the production DB** (one-time, from your laptop):
   ```bash
   MONGODB_URI="<prod-atlas-uri>" npm run seed
   ```
   Verify: `curl https://<railway-url>/api/blocks | jq '. | length'` should return the tile count.
7. In service **Settings → Networking**, click **Generate Domain**. You'll get a free `*.up.railway.app` URL — save it; you'll point the custom domain at it next.

**Atlas gotcha:** Railway's egress IPs are dynamic. In Atlas → Network Access, add `0.0.0.0/0` **or** (preferred) enable Railway's private networking if you upgrade.

### 2. Buy the domain and point DNS

Recommended registrar: **Cloudflare Registrar** (~$10/yr, at-cost pricing, free DNS, automatic CNAME flattening for apex records). Alternative: Porkbun, Namecheap.

1. Purchase `joeyfarah.dev` at [cloudflare.com/products/registrar](https://www.cloudflare.com/products/registrar/). `.dev` is a Google-operated TLD — HTTPS is enforced via HSTS preload (no HTTP-only fallback).
2. In Cloudflare DNS, add two records:
   - `CNAME` / `@` / `<your-service>.up.railway.app` / Proxy **off** (orange cloud grey — Railway handles TLS itself)
   - `CNAME` / `www` / `<your-service>.up.railway.app` / Proxy **off**
3. In Railway → service → **Settings → Networking → Custom Domain**, add `joeyfarah.dev` and `www.joeyfarah.dev`. Railway provisions a Let's Encrypt cert automatically (~5 min).
4. Once TLS goes green, update these hardcoded references:
   - `client/index.html` — `og:url` and Schema.org `url` (already `https://joeyfarah.dev`, no change if the domain matches)
   - `server/src/routes/resume.ts` — `Portfolio: joeyfarah.dev` line (already correct)
   - `server/seed/blocks.seed.json` — search for any placeholder URLs and update
5. Re-run `npm run seed` if you edited the seed.

### 3. Analytics

Pick **one**. Both are a single script tag in `client/index.html` — no React code needed.

**Option A — Plausible (recommended, privacy-first, $9/mo):**
1. Sign up at [plausible.io](https://plausible.io), add site `joeyfarah.dev`.
2. Paste into `client/index.html` `<head>`:
   ```html
   <script defer data-domain="joeyfarah.dev" src="https://plausible.io/js/script.js"></script>
   ```
3. No cookie banner needed (GDPR-compliant by default).

**Option B — GA4 (free, heavier, requires cookie consent in EU):**
1. Create a GA4 property at [analytics.google.com](https://analytics.google.com), copy the Measurement ID (`G-XXXXXXXXXX`).
2. Paste into `client/index.html` `<head>`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
3. If you ever ship to EU visitors, add a consent banner (e.g., `cookieconsent`).

---

## Ideas Backlog (autonomous — no user input needed)

These were identified by a research agent and can be implemented without Joey:

### High value, quick
- **Tile hover deep-link** — clicking a tile's title bar could copy a `#slug` anchor to clipboard
- **Keyboard navigation** — arrow keys scroll between sections; Tab highlights tiles
- **`prefers-color-scheme` light mode** — CSS variable swap, localStorage persistence
- **Lighthouse CI** — GitHub Action to run Lighthouse on every PR and block regressions
- **Code splitting** — lazy-load tile renderers (especially `ERDTileRenderer`) to reduce initial bundle

### Medium value
- **Testimonial tile** — new `testimonial` tile type with a short quote carousel
- **Blog/writing tile** — links to dev.to or Medium posts; new `blog-post` tile type
- **Scroll-to-top button** — appears after scrolling past hero, smooth-scrolls back
- **`/sitemap.xml` endpoint** — generated from seed blocks at request time

### Deferred
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
