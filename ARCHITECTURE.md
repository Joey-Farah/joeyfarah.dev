# ARCHITECTURE.md — joeyfarah.dev Visual Resume

> Developer Agent: read this file in full before writing any code. Every module path, interface, and constraint here is authoritative.

---

## Overview

This is a TypeScript monorepo (React + Vite frontend, Express backend, shared Zod schemas) deployed as a single Railway service. Express serves the Vite production build statically and exposes a `/api/blocks` REST API. Content is authored in a single JSON seed file; `npm run seed` validates it with Zod and writes it to MongoDB Atlas. The frontend fetches blocks via `BlockDataClient`, renders a terminal boot-sequence `Hero`, then transitions (via Framer Motion `AnimatePresence`) into a bento grid of independently rendered `BentoTile` components. The architecture is Ports & Adapters: all business logic is isolated behind typed interfaces, infrastructure adapters are swappable, and the frontend never bypasses the `BlockDataClient` port.

---

## Module Map

| File Path | Responsibility |
|---|---|
| `package.json` | Root workspace manifest; defines `npm run seed`, `npm run dev`, `npm run build` scripts that delegate to client/server workspaces |
| `.env.example` | Documents all Railway environment variables (`MONGODB_URI`, `NODE_ENV`, `PORT`) — committed to repo, never contains real values |
| `shared/package.json` | Shared workspace package definition |
| `shared/types.ts` | TypeScript interfaces for `BentoBlock` and all content payload types (`HeroContent`, `TimelineContent`, `ErdTileContent`, `ProjectCardContent`, `ContactLinksContent`) |
| `shared/schemas.ts` | Zod discriminated-union schema for `BentoBlock`; single source of truth imported by both server and client; exports `BentoBlockSchema` and `BentoBlockArraySchema` |
| `server/package.json` | Server workspace manifest; lists Express, Mongoose, Zod, ts-node, vitest, supertest, mongodb-memory-server dependencies |
| `server/src/index.ts` | Express app entry point: mounts `/api` router, serves Vite production build in production, starts HTTP server on `process.env.PORT \|\| 3001` |
| `server/src/routes/blocks.ts` | Thin REST shell: `GET /api/blocks` and `GET /api/blocks/:slug` route handlers; calls repository, returns JSON, handles 404; zero business logic |
| `server/src/modules/seedIngestion.ts` | Deep module: `ingestSeed(filePath)` reads JSON file, validates via Zod, throws `SeedValidationError` with slug+field on failure, returns `BentoBlock[]` |
| `server/src/modules/seedIngestion.errors.ts` | Exports `SeedValidationError` class with `slug` and `field` properties |
| `server/src/repositories/IBlockRepository.ts` | Port interface: `getBlocks(): Promise<BentoBlock[]>` and `getBlock(slug: string): Promise<BentoBlock>` — throws `BlockNotFoundError` on missing slug |
| `server/src/repositories/MongoBlockRepository.ts` | MongoDB adapter implementing `IBlockRepository`; uses Mongoose model; production implementation |
| `server/src/repositories/InMemoryBlockRepository.ts` | In-memory adapter implementing `IBlockRepository`; initialized with `BentoBlock[]`; used in tests only |
| `server/src/repositories/BlockNotFoundError.ts` | Exports `BlockNotFoundError` class; routes map this to HTTP 404 |
| `server/src/models/BlockModel.ts` | Mongoose schema and model for `BentoBlock` persisted in MongoDB |
| `server/src/scripts/seed.ts` | CLI entry point for `npm run seed`: calls `ingestSeed()`, upserts blocks via `MongoBlockRepository`, exits 0 on success, exits 1 on `SeedValidationError` with message to stderr |
| `server/seed/blocks.seed.json` | Authoritative content seed file; contains all bento blocks as a JSON array |
| `server/tests/seedIngestion.test.ts` | Unit tests: valid seed → correct array; each malformed block type → `SeedValidationError` with correct slug and field |
| `server/tests/blockRepository.test.ts` | Integration tests using `mongodb-memory-server`: `getBlocks()`, `getBlock(slug)`, unknown slug → `BlockNotFoundError` |
| `server/tests/api.test.ts` | Integration tests using `supertest` with `InMemoryBlockRepository`: 200 on list, 200 on known slug, 404 on unknown slug |
| `server/tests/seedPipeline.test.ts` | End-to-end: `ingestSeed()` → `InMemoryBlockRepository` → `getBlocks()` returns expected count and shapes |
| `server/tests/fixtures/valid.seed.json` | Test fixture: one valid block of every type |
| `server/tests/fixtures/invalid.seed.json` | Test fixture: one block with a missing required field per type |
| `client/package.json` | Client workspace manifest; lists React, Vite, Tailwind, Framer Motion, @rive-app/react-canvas, vitest, @testing-library/react dependencies |
| `client/index.html` | Vite HTML entry point with basic meta tags |
| `client/vite.config.ts` | Vite config: React plugin, `/api` proxy to `http://localhost:3001` in dev, build output to `dist/` |
| `client/tailwind.config.js` | Tailwind config: `brand` color token extension (`brand-primary`, `brand-secondary`, `brand-bg`, `brand-text`), JetBrains Mono + Inter font families |
| `client/src/index.css` | CSS variables for brand tokens; base Tailwind directives; `@font-face` or Google Fonts import for JetBrains Mono and Inter |
| `client/src/main.tsx` | React entry point: renders `<App />` into `#root` |
| `client/src/App.tsx` | Root component: fetches blocks via `BlockDataClient`, passes hero block to `<Hero>`, passes all blocks to `<ScrollTransitionOrchestrator>`, renders `<NavBar>` |
| `client/src/adapters/BlockDataClient.ts` | Port/adapter interface and production implementation: `fetchBlocks()` and `fetchBlock(slug)` as fetch calls to `/api/blocks`; exports `IBlockDataClient` interface |
| `client/src/adapters/InMemoryBlockDataClient.ts` | In-memory test adapter implementing `IBlockDataClient`; initialized with a `BentoBlock[]` array |
| `client/src/modules/Hero/Hero.tsx` | Deep module: boot-sequence line-by-line render loop driven by `data.content.lines[]`; mobile timing (<1s); `prefers-reduced-motion` fallback to `<StaticProfileCard>`; scroll-threshold exit trigger |
| `client/src/modules/Hero/StaticProfileCard.tsx` | Reduced-motion fallback: renders hero lines as plain styled text, no animation |
| `client/src/modules/Hero/Hero.test.tsx` | RTL tests: reduced-motion → `StaticProfileCard`; boot lines appear in DOM |
| `client/src/modules/BentoTile/BentoTile.tsx` | Deep module: terminal chrome (title bar, window controls, prompt glyph `>_`, blinking cursor); dispatches to sub-renderer based on `content.type`; single-column mobile, bento grid desktop |
| `client/src/modules/BentoTile/renderers/TimelineRenderer.tsx` | Renders `timeline` content: scroll-animated entry cards with employer, role, dates, accomplishments |
| `client/src/modules/BentoTile/renderers/ERDTileRenderer.tsx` | Deep module: SVG layout from `content.nodes[]` and `content.edges[]`; Framer Motion `pathLength` draw animation on scroll via `useInView`; all lines use `brand-primary` |
| `client/src/modules/BentoTile/renderers/ProjectCardRenderer.tsx` | Renders `project-card` content: description, stack badges, links, status badge (`in-development` / `live`) |
| `client/src/modules/BentoTile/renderers/ContactLinksRenderer.tsx` | Renders `contact-links` content: terminal-styled link list with platform labels |
| `client/src/modules/BentoTile/BentoTile.test.tsx` | RTL tests: chrome elements present; correct sub-renderer per type; single-column class at mobile breakpoint |
| `client/src/modules/BentoGrid/BentoGrid.tsx` | Lays out `BentoTile` components in CSS grid; passes `LayoutConfig` per tile; responsive breakpoints |
| `client/src/modules/ScrollTransition/ScrollTransitionOrchestrator.tsx` | Wraps `<Hero>` and `<BentoGrid>` in `AnimatePresence`; Hero exits on scroll threshold; tiles stagger in with coordinated delay; Option B only — no `layoutId` |
| `client/src/components/NavBar.tsx` | Sticky nav bar with anchor links to `#professional`, `#enterprise`, `#projects`, `#contact` sections; hides until hero exit completes |
| `client/src/types.ts` | Re-exports all types from `shared/types.ts` for use within the client workspace |

---

## Data Flow

```
                          AUTHORING TIME
                          ─────────────
  blocks.seed.json
        │
        ▼
  npm run seed
        │
  ingestSeed(filePath)
        │  validates via BentoBlockArraySchema (Zod)
        │  throws SeedValidationError on failure → exit 1
        │
        ▼
  MongoBlockRepository.upsert()
        │
        ▼
  MongoDB Atlas (production)


                          REQUEST TIME (production)
                          ─────────────────────────
  Browser GET /
        │
        ▼
  Express static → client/dist/index.html
        │
  Browser GET /api/blocks
        │
        ▼
  routes/blocks.ts (thin shell)
        │
  IBlockRepository.getBlocks()
        │
  MongoBlockRepository → MongoDB Atlas
        │
        ▼
  BentoBlock[] JSON response
        │
        ▼
  BlockDataClient.fetchBlocks()   [client/src/adapters/]
        │
        ▼
  App.tsx splits blocks:
    heroBlock  ──────────────────────▶  <Hero data={heroBlock} />
    allBlocks  ──────────────────────▶  <ScrollTransitionOrchestrator>
                                               │
                                         AnimatePresence
                                          ┌────┴────┐
                                        Hero      BentoGrid
                                        exits      stagger-in
                                                   │
                                            BentoTile[]
                                            (terminal chrome
                                             + sub-renderer)
                                                   │
                                      ┌────────────┼────────────┐
                               Timeline      ERDTileRenderer  ProjectCard
                               Renderer      (SVG pathLength   Renderer
                                              scroll-draw)


                          DEVELOPMENT TIME
                          ────────────────
  Browser GET /api/blocks
        │
  Vite dev server proxy → localhost:3001
        │
  (same Express path as above, but MongoDB can be Atlas or local)
```

---

## Interface Definitions

### Shared (`shared/types.ts`)

```typescript
// Envelope — every block the API returns has this shape
interface BentoBlock {
  slug: string;
  type: 'hero' | 'timeline' | 'erd-tile' | 'project-card' | 'contact-links';
  title: string;
  order: number;
  visible: boolean;
  content: HeroContent | TimelineContent | ErdTileContent | ProjectCardContent | ContactLinksContent;
}

interface HeroContent       { lines: string[] }
interface TimelineEntry     { employer: string; role: string; start: string; end: string; accomplishments: string[] }
interface TimelineContent   { entries: TimelineEntry[] }
interface ErdNode           { id: string; label: string; x: number; y: number }
interface ErdEdge           { from: string; to: string; label: string }
interface ErdTileContent    { description: string; nodes: ErdNode[]; edges: ErdEdge[] }
interface ProjectLink       { label: string; url: string }
interface ProjectCardContent { description: string; stack: string[]; links: ProjectLink[]; status: 'live' | 'in-development' }
interface ContactLink       { platform: string; url: string; display: string }
interface ContactLinksContent { links: ContactLink[] }
```

### Backend

```typescript
// server/src/modules/seedIngestion.ts
function ingestSeed(filePath: string): Promise<BentoBlock[]>
// Reads file at filePath (UTF-8), parses JSON, validates with BentoBlockArraySchema.
// Throws SeedValidationError on first invalid block with .slug and .field populated.

// server/src/modules/seedIngestion.errors.ts
class SeedValidationError extends Error {
  constructor(public slug: string, public field: string, message: string) {}
}

// server/src/repositories/IBlockRepository.ts
interface IBlockRepository {
  getBlocks(): Promise<BentoBlock[]>;
  getBlock(slug: string): Promise<BentoBlock>; // throws BlockNotFoundError if missing
  upsertBlocks(blocks: BentoBlock[]): Promise<void>; // used by seed script only
}

// server/src/repositories/BlockNotFoundError.ts
class BlockNotFoundError extends Error {
  constructor(public slug: string) {}
}

// server/src/routes/blocks.ts — handler signatures
// GET /api/blocks  →  repo.getBlocks() → res.json(blocks)
// GET /api/blocks/:slug  →  repo.getBlock(slug) → res.json(block)
//                           catch BlockNotFoundError → res.status(404).json({ error })
```

### Frontend

```typescript
// client/src/adapters/BlockDataClient.ts
interface IBlockDataClient {
  fetchBlocks(): Promise<BentoBlock[]>;
  fetchBlock(slug: string): Promise<BentoBlock>;
}
// Production class HttpBlockDataClient implements IBlockDataClient via fetch('/api/blocks')

// client/src/modules/Hero/Hero.tsx
// Props: { data: BentoBlock & { content: HeroContent } }
// Internally detects window.matchMedia('(prefers-reduced-motion: reduce)')
// Detects mobile via window.innerWidth < 768 for <1s timing path

// client/src/modules/BentoTile/BentoTile.tsx
interface LayoutConfig {
  colSpan?: number;  // CSS grid column span, default 1
  rowSpan?: number;  // CSS grid row span, default 1
}
// Props: { layout: LayoutConfig; block: BentoBlock }
// Dispatches to sub-renderer based on block.type

// client/src/modules/BentoTile/renderers/ERDTileRenderer.tsx
// Props: { content: ErdTileContent }
// Uses useInView() hook to trigger Framer Motion pathLength animation
// SVG viewBox derived from node x/y extents; edges rendered as <path> elements

// client/src/modules/ScrollTransition/ScrollTransitionOrchestrator.tsx
// Props: { heroBlock: BentoBlock; blocks: BentoBlock[] }
// Manages showHero: boolean state toggled by scroll threshold (e.g., window.scrollY > 80px)
// AnimatePresence wraps both Hero and BentoGrid; Hero animate/exit, BentoGrid stagger delay
```

---

## Implementation Order

1. **`shared/types.ts` + `shared/schemas.ts`** — All downstream modules import from here; nothing else can be typed without it.
2. **`server/src/modules/seedIngestion.ts` + errors** — Core business logic and the Zod schema are the foundation of data integrity; test this before wiring persistence.
3. **`server/seed/blocks.seed.json`** — Real content seed with all block types, including ERD nodes/edges for Oracle Database Mapper; needed for every subsequent test and UI pass.
4. **`server/tests/seedIngestion.test.ts`** — Validate the ingestion contract before it touches the DB; catches schema drift immediately.
5. **`server/src/repositories/IBlockRepository.ts` + `InMemoryBlockRepository.ts` + `BlockNotFoundError.ts`** — In-memory adapter enables all API and pipeline tests without a real DB.
6. **`server/tests/seedPipeline.test.ts`** — End-to-end regression guard for the seed → repository pipeline; catches contract breaks early.
7. **`server/src/models/BlockModel.ts` + `MongoBlockRepository.ts`** — Production persistence layer; tested with `mongodb-memory-server`.
8. **`server/tests/blockRepository.test.ts`** — Verify MongoDB adapter correctness before exposing it via HTTP.
9. **`server/src/scripts/seed.ts`** — CLI seed script; depends on both ingestion and repository being correct.
10. **`server/src/routes/blocks.ts` + `server/src/index.ts`** — Thin HTTP shell wiring repository to endpoints; keep route handlers under 10 lines each.
11. **`server/tests/api.test.ts`** — Integration test the full HTTP surface with `supertest` + `InMemoryBlockRepository`.
12. **`client/tailwind.config.js` + `client/src/index.css`** — Design tokens and fonts must exist before any component touches styles.
13. **`client/src/adapters/BlockDataClient.ts` + `InMemoryBlockDataClient.ts`** — Frontend data port; build the in-memory adapter first so component tests never depend on a running server.
14. **`client/src/modules/Hero/Hero.tsx` + `StaticProfileCard.tsx`** — First visible component; isolated from the grid; reduced-motion and mobile timing paths tested here.
15. **`client/src/modules/Hero/Hero.test.tsx`** — Verify reduced-motion and DOM line rendering before wiring into the app.
16. **`client/src/modules/BentoTile/BentoTile.tsx`** — Terminal chrome shell with type dispatch; build without sub-renderers first (render a `<div>` placeholder per type).
17. **`client/src/modules/BentoTile/renderers/TimelineRenderer.tsx`** — Simplest sub-renderer; validates the BentoTile dispatch contract.
18. **`client/src/modules/BentoTile/renderers/ProjectCardRenderer.tsx`** — Standard card; tests stack badges and status badge rendering.
19. **`client/src/modules/BentoTile/renderers/ContactLinksRenderer.tsx`** — Simplest renderer; terminal link list.
20. **`client/src/modules/BentoTile/BentoTile.test.tsx`** — Chrome presence, sub-renderer dispatch, mobile class assertions.
21. **`client/src/modules/BentoTile/renderers/ERDTileRenderer.tsx`** — Most complex renderer; depends on BentoTile being stable; SVG + Framer Motion scroll animation.
22. **`client/src/modules/BentoGrid/BentoGrid.tsx`** — Grid layout composing BentoTile instances; assign `LayoutConfig` per slug (see grid spec below).
23. **`client/src/modules/ScrollTransition/ScrollTransitionOrchestrator.tsx`** — Requires Hero and BentoGrid both stable; implements Option B AnimatePresence stagger.
24. **`client/src/components/NavBar.tsx`** — Sticky nav; anchor links; hides until `showHero === false`.
25. **`client/src/App.tsx` + `client/src/main.tsx`** — Wire everything together; fetch blocks, split by slug, render orchestrator.
26. **`vite.config.ts` + `server/src/index.ts` static serving** — Final integration: verify dev proxy and production static build both work end-to-end.
27. **`.env.example`** — Commit documented env vars; block deploy without this.

---

## Bento Grid Layout Spec

The CSS grid is a 3-column layout on desktop (≥1024px), 2-column on tablet (≥768px), 1-column on mobile.

| Slug | Type | Desktop colSpan | Desktop rowSpan | Notes |
|---|---|---|---|---|
| `hero` | `hero` | 3 | 2 | Full-width; handled by `ScrollTransitionOrchestrator`, not `BentoGrid` |
| `professional-timeline` | `timeline` | 2 | 3 | Tall left tile in Professional section |
| `oracle-db-mapper` | `erd-tile` | 1 | 2 | ERD draw animation tile |
| `conversion-automation` | `project-card` | 1 | 1 | Enterprise suite tile |
| `fusion-sql-developer` | `project-card` | 1 | 1 | Enterprise suite tile |
| `slippi-ranked-stats` | `project-card` | 1 | 1 | Personal projects tile |
| `fitness-ring-analytics` | `project-card` | 1 | 1 | Personal projects tile |
| `habitat` | `project-card` | 1 | 1 | `status: 'in-development'`; Rive animation |
| `lombardi-project` | `project-card` | 1 | 1 | Storefront aesthetic; Patreon link |
| `contact` | `contact-links` | 3 | 1 | Full-width footer tile |

---

## Seed File Shape (blocks.seed.json)

The seed file is a JSON array of `BentoBlock` objects. Every block must have all envelope fields (`slug`, `type`, `title`, `order`, `visible`) plus a `content` object matching its type. Example minimal entries:

```json
[
  {
    "slug": "hero",
    "type": "hero",
    "title": "Hero",
    "order": 0,
    "visible": true,
    "content": {
      "lines": [
        "Joey Farah",
        "Oracle Cloud ERP Consultant — 4 years",
        "Super Smash Bros. Melee — Diamond ranked",
        "Building tools for enterprise and fun."
      ]
    }
  },
  {
    "slug": "oracle-db-mapper",
    "type": "erd-tile",
    "title": "Oracle Database Mapper",
    "order": 3,
    "visible": true,
    "content": {
      "description": "Visual ERD mapper for Oracle Fusion schema exploration. Maps FK relationships across 200+ tables.",
      "nodes": [
        { "id": "invoice", "label": "AP_INVOICES", "x": 50, "y": 50 },
        { "id": "vendor",  "label": "PO_VENDORS",  "x": 250, "y": 50 },
        { "id": "dist",    "label": "AP_INVOICE_DISTRIBUTIONS", "x": 150, "y": 200 }
      ],
      "edges": [
        { "from": "invoice", "to": "vendor", "label": "VENDOR_ID" },
        { "from": "invoice", "to": "dist",   "label": "INVOICE_ID" }
      ]
    }
  }
]
```

The `npm run seed` script uses `slug` as the upsert key — re-running is idempotent.

---

## Risks & Notes

### File Encoding
All file reads in `ingestSeed()` must use `{ encoding: 'utf-8' }` explicitly. On Windows, Node defaults to `cp1252` which will corrupt any non-ASCII characters in content strings (e.g., em-dashes in accomplishment bullets). This is a known project-wide requirement.

### TypeScript Path Aliases
The `shared/` package is referenced as a workspace dependency (`"shared": "*"` in both client and server `package.json`). Do not use relative `../../shared/` imports — use the package name import `import { BentoBlock } from 'shared/types'`. Configure `tsconfig.json` paths accordingly in both workspaces.

### ERD SVG Coordinate System
`ERDTileRenderer` computes its SVG `viewBox` dynamically from the min/max x/y values in `content.nodes[]`. Edge paths are straight lines between node center points. If all nodes cluster near one corner, the computed viewBox will be very small — seed data should spread nodes across a reasonable coordinate space (e.g., 0–400 on both axes).

### Framer Motion + prefers-reduced-motion
The `Hero` boot-sequence animation and all `BentoTile` scroll-in animations must gate on `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. The `ERDTileRenderer` pathLength animation must also skip to its end state (pathLength: 1) instantly when reduced-motion is active. Framer Motion provides `useReducedMotion()` hook — use it in every animated component.

### Mobile Boot Sequence Timing
On mobile (`window.innerWidth < 768`), Hero must complete all lines within 1 second total. Divide 1000ms by the number of lines to derive per-line interval. On desktop, use 80ms per line as the default. These timing constants must live inside `Hero.tsx` only — not in seed data, not in CSS.

### Railway Single Service Deployment
Express serves `client/dist/` as static files in production (`NODE_ENV === 'production'`). The `package.json` root `build` script must run `npm run build --workspace=client` before starting the server. The Railway start command is `node server/dist/index.js`. The Vite build output path (`client/dist/`) and Express static path must match exactly.

### `npm run seed` CI Guard
`server/src/scripts/seed.ts` must call `process.exit(1)` on any `SeedValidationError` and print the error message to `stderr`. This is the mechanism by which CI/CD blocks a broken deploy. Do not catch and swallow the error silently.

### MongoDB Upsert Key
The `MongoBlockRepository.upsertBlocks()` method must upsert on `slug` (not `_id`). Use `{ upsert: true, new: true }` with `findOneAndReplace({ slug: block.slug }, block, ...)`. This makes the seed script idempotent.

### Test Environment
Server tests run with Vitest. Frontend tests run with Vitest + jsdom + `@testing-library/react`. Do not use Jest — the monorepo uses Vitest throughout for consistency. Each workspace has its own `vitest.config.ts`.

### Rive Animation (Habitat tile)
The Rive `.riv` file is loaded via `@rive-app/react-canvas`. In test environments, mock the entire `@rive-app/react-canvas` module to return a static `<div data-testid="rive-placeholder" />`. Do not attempt to run Rive in jsdom — it will fail with canvas errors.

### Anchor Link Sections
The `BentoGrid` renders three `<section>` wrappers with ids `professional`, `enterprise`, and `projects`. The contact tile sits in a `<section id="contact">` beneath the grid. The `NavBar` links target these ids. The `id` values are hardcoded constants — do not derive them from seed data.

### No Admin UI
There is no authentication, no write endpoint beyond the seed script, and no CMS. The API is read-only at runtime. Any attempt to add write routes is out of scope.
