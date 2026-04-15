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

These require Joey's input (accounts, payment, external setup):

### 1. Deploy to Railway
- Create account at railway.app
- New project → connect GitHub repo `Joey-Farah/joeyfarah.dev`
- Add environment variables: `MONGODB_URI`, `NODE_ENV=production`, `PORT` (Railway sets this automatically)
- Set start command: `node server/dist/index.js`
- Run `npm run build` as the build command
- Railway will auto-deploy on push to `main`

### 2. Buy the domain
- `joeyfarah.dev` — not yet purchased
- Buy at Namecheap, Google Domains, or Cloudflare Registrar
- Point DNS to Railway's provided URL
- Update OG/structured data URLs in `client/index.html` (currently hardcoded to `https://joeyfarah.dev`)

### 3. Analytics
- Choose GA4 (Google Analytics) or Plausible (privacy-first)
- Add tracking script to `client/index.html`
- No code changes needed beyond the script tag

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
