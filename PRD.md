# PRD: Visual Resume Website (joeyfarah.dev)

## Problem Statement

As an Oracle Cloud ERP consultant and independent developer, I lack a centralized, shareable hub that communicates the full breadth of my work to any audience — from enterprise recruiters and clients to personal contacts. My professional consulting work and personal micro-SaaS projects exist in separate contexts with no unified presentation layer. Patreon and GitHub alone don't convey the depth or design sensibility behind my work.

## Solution

A modern, dark-mode, single-page portfolio application built on the MERN stack, hosted on Railway, with a Bento-Terminal hybrid visual identity. The site opens with an animated terminal boot sequence, then expands into an interactive bento grid with three core sections: Professional Timeline, B2B Enterprise Suite, and Personal Projects. Each bento tile is an independently rendered deep module driven by a typed content block API. Content is managed via a static JSON seed file validated at ingest time, requiring no admin UI.

## User Stories

1. As a visitor, I want to see a terminal boot sequence on load, so that I immediately understand this is the portfolio of a technical professional.
2. As a visitor, I want the boot sequence to display the owner's name, Oracle tenure, and Melee rank, so that I get a compelling snapshot before scrolling.
3. As a visitor, I want the terminal window to transition into the bento grid as I scroll, so that the navigation feels fluid and intentional.
4. As a visitor, I want a sticky navigation bar with anchor links to each section, so that I can jump directly to the content I care about.
5. As a visitor on mobile, I want the boot sequence to complete in under one second, so that I reach the content quickly on a small screen.
6. As a visitor with reduced motion enabled, I want to see a static profile card instead of the animation, so that the site is accessible to me.
7. As a visitor, I want the site to render correctly on any device (desktop, tablet, phone), so that I can share the link without worrying about the recipient's device.
8. As a recruiter, I want to see a clearly structured professional timeline, so that I can quickly assess the owner's career progression.
9. As a recruiter, I want each timeline entry to show the employer, role, tenure dates, and key accomplishments, so that I have enough context to evaluate fit.
10. As an enterprise client, I want the timeline to emphasize Oracle Cloud ERP project leadership specifically, so that I understand the depth of relevant experience.
11. As a visitor, I want timeline entries to animate into view as I scroll, so that the section feels dynamic and modern rather than a static list.
12. As a visitor, I want to be able to read the timeline comfortably on mobile in a single-column layout, so that the content is always legible.
13. As an enterprise client, I want a dedicated section showcasing the Oracle Cloud Utility Suite, so that I understand the owner builds production-grade internal tooling.
14. As a visitor, I want the Database Mapper tile to visually draw an ERD diagram as I scroll into view, so that the animation itself demonstrates frontend engineering skill.
15. As a visitor, I want the ERD animation to be driven by real node/edge data from the seed, so that it reflects an actual schema rather than a decorative placeholder.
16. As a visitor, I want each enterprise tool tile to show the tool name, a short description, and the technical problem it solves, so that I understand its business value.
17. As a visitor, I want the Conversion Automation Tool tile to describe what it automates and why, so that I can appreciate the scope of the work.
18. As a visitor, I want the Fusion SQL Developer tile to convey the depth of the SQL tooling built, so that I understand the owner's database engineering capabilities.
19. As an enterprise client, I want each tile to have a terminal-chrome visual wrapper (title bar, prompt glyph), so that the aesthetic communicates professional-grade engineering.
20. As a visitor, I want a section dedicated to personal projects, so that I can see the owner's range beyond enterprise consulting.
21. As a visitor, I want the Slippi Ranked Stats tile to link to the live dashboard and describe what it tracks, so that I can explore it directly.
22. As a visitor, I want the Fitness Ring Analytics tile to link to the live app and explain what health data it visualizes, so that I understand its purpose.
23. As a visitor, I want the Habitat tile to show a mock plant growth animation, so that the concept and visual design language of the app are immediately clear even though it's in development.
24. As a visitor, I want the Habitat tile to clearly indicate it is "In Development," so that I understand the current status.
25. As a visitor, I want the Lombardi Project tile to have a storefront aesthetic that conveys it is a premium Melee training resource, so that the product positioning is clear.
26. As a visitor, I want the Lombardi Project tile to link to the Patreon page, so that I can access the current version of the content.
27. As a visitor, I want all project tiles to display the tech stack used, so that I can quickly assess technical breadth.
28. As a visitor, I want project tiles to include GitHub links where applicable, so that I can inspect the code directly.
29. As a visitor who wants to reach out, I want a contact section with clear static links, so that I can choose my preferred communication channel.
30. As a visitor, I want LinkedIn, GitHub, and email links in the contact section, so that all standard professional channels are covered.
31. As a visitor, I want the contact section to match the terminal aesthetic of the rest of the site, so that the design remains cohesive.
32. As the site owner, I want to update my Melee rank or tenure years by editing a JSON seed file, so that content changes don't require touching animation or component logic.
33. As the site owner, I want the seed validation to fail with a clear, targeted error message if I provide malformed data, so that I catch mistakes before they reach production.
34. As the site owner, I want the `npm run seed` command to exit non-zero on validation failure, so that CI/CD blocks a broken deploy automatically.
35. As the site owner, I want each bento tile's content to be independently updatable in the seed file, so that changing one tile never risks breaking another.
36. As the site owner, I want the boot sequence lines to be data-driven from the seed, so that I can update my tagline or stats in one place.
37. As a visitor on a slow connection, I want the initial page load to be fast, so that I don't abandon the site before the content renders.
38. As a visitor using a screen reader, I want all interactive elements to have accessible labels, so that the site is navigable without a mouse.
39. As a visitor with reduced motion preferences, I want all Framer Motion animations to respect `prefers-reduced-motion`, so that the site doesn't cause discomfort.
40. As a visitor, I want the color contrast between background and text to meet WCAG AA standards, so that the terminal aesthetic doesn't sacrifice readability.

## Implementation Decisions

### Architecture
- **Pattern:** Ports & Adapters (Hexagonal Architecture). Business logic is isolated from infrastructure via defined interfaces.
- **Stack:** React + Vite (frontend), Node.js + Express (backend API + static file serving), MongoDB Atlas (production), local JSON seed (source of truth for content).
- **Hosting:** Railway, single service. Express serves the Vite production build. Vite dev server proxies `/api` to Express in development.
- **Monorepo layout:** `/client` (React/Vite), `/server` (Express), `/shared` (Zod schemas and TypeScript types shared between layers).
- **Styling:** Tailwind CSS with custom `brand` color tokens. CSS variables for accent color swapping. JetBrains Mono (monospace/terminal content), Inter (sans-serif/UI prose).
- **Animation:** Framer Motion for all scroll and transition animations. Rive for the Habitat tile mock plant animation.

### Color Tokens (tailwind.config.js under `brand` key)
- `brand-primary`: `#06b6d4` — Electric Cyan. Active cursors, terminal prompts, ERD lines, primary highlights.
- `brand-secondary`: `#3b82f6` — Cobalt Blue. Subtle UI elements, secondary highlights.
- `brand-bg`: `#0d0d0d` — Near-Black. Page background, tile backgrounds.
- `brand-text`: `#e2e8f0` — Off-White/Slate. Primary body text.
- All tokens defined as CSS variables in addition to Tailwind config for easy accent swapping.

### Tile Types & Content Schema
- `hero`: `{ lines: string[] }`
- `timeline`: `{ entries: [{ employer, role, start, end, accomplishments[] }] }`
- `erd-tile`: `{ description, nodes: [{ id, label, x, y }], edges: [{ from, to, label }] }`
- `project-card`: `{ description, stack: string[], links: [{ label, url }], status: 'live' | 'in-development' }`
- `contact-links`: `{ links: [{ platform, url, display }] }`

### BentoBlock API Envelope (stable, never changes)
```
GET /api/blocks          → BentoBlock[]
GET /api/blocks/:slug    → BentoBlock

{
  "slug": string,
  "type": "hero" | "timeline" | "erd-tile" | "project-card" | "contact-links",
  "title": string,
  "order": number,
  "visible": boolean,
  "content": { ...type-specific payload }
}
```

### Modules

**`SeedIngestion` (Backend Deep Module)**
- Interface: `ingestSeed(filePath: string): Promise<BentoBlock[]>`
- Reads raw JSON seed, validates each block against the Zod discriminated union schema, transforms to typed `BentoBlock[]`.
- On failure: throws `SeedValidationError` identifying the block slug and field. Never silently swallows invalid data.
- This is the only place validation logic lives.

**`BlockRepository` (Backend Deep Module, Port/Adapter)**
- Port: `IBlockRepository { getBlocks(): Promise<BentoBlock[]>; getBlock(slug: string): Promise<BentoBlock>; }`
- MongoDB adapter: production implementation.
- In-memory adapter: used in integration tests — no real DB connection required at the API boundary.

**`REST API Layer` (Thin Shell)**
- `GET /api/blocks` → `BlockRepository.getBlocks()`
- `GET /api/blocks/:slug` → `BlockRepository.getBlock(slug)`
- No business logic in route handlers.

**`HeroModule` (Frontend Deep Module)**
- Interface: `<Hero data={HeroBlock} />`
- Internally: boot sequence line-by-line render loop, animation timing (full speed desktop, <1s mobile), `prefers-reduced-motion` fallback to static card, scroll-threshold exit trigger.
- Content is data-driven from `data.content.lines[]`. Animation logic never changes when content changes.

**`BentoTile` (Frontend Deep Module)**
- Interface: `<BentoTile layout={LayoutConfig} content={BlockContent} />`
- Internally: terminal chrome rendering (title bar, window controls, prompt glyph, cursor), responsive layout (single column mobile, bento grid desktop), tile-type sub-renderer dispatch.
- Consumers never touch layout or chrome logic.

**`ERDTileRenderer` (Frontend Deep Module, inside BentoTile)**
- Interface: receives `content.nodes[]` and `content.edges[]`
- Internally: SVG path computation, Framer Motion `pathLength` scroll-driven draw animation via `useInView` + `useTransform`. ERD lines draw themselves as tile scrolls into viewport.
- Uses `brand-primary` cyan for all lines.

**`ScrollTransitionOrchestrator`**
- Wraps `<Hero>` and `<BentoGrid>` in `AnimatePresence`.
- **Resolved: Option B.** Hero exits with exit animation, tiles stagger in with coordinated delay. Clean, architecturally simple, fully testable.
- No `layoutId` fragment composition.

**`BlockDataClient` (Frontend Port/Adapter)**
- Interface: `fetchBlocks(): Promise<BentoBlock[]>`, `fetchBlock(slug: string): Promise<BentoBlock>`
- Production: fetch calls to `/api/blocks`.
- Test: in-memory adapter. This is the only external boundary mocked on the frontend.

**`BentoBlock Zod Schemas` (Shared, `/shared/schemas.ts`)**
- Discriminated union on `type` field.
- Imported by both server (`SeedIngestion`) and client (optional runtime validation).
- Single source of truth for valid seed data shape.

### Project-Specific Tile Notes
- **Habitat:** Status `in-development`. Mock Rive plant bloom animation. Lottie acceptable as v1 fallback. Do not imply it is live.
- **The Lombardi Project:** Storefront aesthetic. Link to `patreon.com/joeydonuts`. Copy should signal "transitioning from Patreon to bespoke storefront."
- **Slippi Ranked Stats:** Link to live dashboard. Describe stat tracking purpose.
- **Fitness Ring Analytics:** Link to live app. Describe health data visualization purpose.
- **Oracle Database Mapper:** ERD draw animation on scroll. Use `erd-tile` type with real node/edge data.

## Testing Decisions

**What makes a good test:** Tests assert observable behavior at module boundaries — inputs in, outputs or errors out. No assertions on internal implementation details, animation timing values, intermediate state, or private methods.

### Modules to test

- **`SeedIngestion`:** Valid seed JSON → correct `BentoBlock[]` returned. Malformed block → `SeedValidationError` thrown with correct slug and field in message. One test per block type, valid and invalid paths.
- **`BlockRepository` (MongoDB adapter):** Integration test using `mongodb-memory-server`. Seed in-memory DB, call `getBlocks()` and `getBlock(slug)`, assert correct shapes. Assert unknown slug returns 404-equivalent error.
- **`REST API`:** Integration test using `supertest` with in-memory `BlockRepository` adapter. Assert `GET /api/blocks` returns 200 with array. Assert `GET /api/blocks/:slug` returns correct block. Assert unknown slug returns 404.
- **`SeedIngestion` → `BlockRepository` pipeline:** End-to-end seed test. Run `ingestSeed()` against fixture JSON, write to in-memory DB, assert `getBlocks()` returns expected count and shapes. Primary regression guard for content changes.
- **`BentoTile`:** React Testing Library. Assert terminal chrome elements present. Assert correct sub-renderer dispatched per `type`. Assert single-column class applied at mobile breakpoint.
- **`HeroModule`:** Assert `prefers-reduced-motion` results in static card render. Assert boot lines from `data.content.lines` appear in the DOM.

### External boundaries mocked
- MongoDB → `mongodb-memory-server`
- `BlockDataClient` fetch → in-memory adapter in frontend tests
- Rive animation runtime → static placeholder in tests

### Never mocked
`SeedIngestion` internals, Zod schema logic, `BentoTile` responsive logic, React component rendering.

## Out of Scope

- Admin panel or CMS for content editing
- Contact form or email integration
- Authentication or protected routes
- Blog or writing section
- Live data feeds (e.g., real-time Melee rank from Slippi API)
- Full Habitat app development (tile is a placeholder only)
- Full Lombardi Project storefront (tile links to existing Patreon)
- SEO optimization beyond basic meta tags
- Analytics integration
- i18n / multi-language support

## Further Notes

- **Flag 1 (RESOLVED):** Hero → Bento transition uses Option B — coordinated stagger with `AnimatePresence`. No `layoutId` fragment composition. This decision is locked before `HeroModule` and `ScrollTransitionOrchestrator` are built.
- **Flag 2 (RESOLVED):** Single service monorepo on Railway. Express serves Vite production build. Vite proxies `/api` to Express in development.
- The `brand-*` Tailwind tokens are designed for easy accent color swapping. Changing `brand-primary` from Electric Cyan to Amber or Cyber-Blue requires one value change in `tailwind.config.js`.
- The Habitat tile should use a Rive animation file (`.riv`). A Lottie fallback is acceptable for v1.
- All Railway environment variables (MongoDB connection string, Node environment) must be documented in a `.env.example` file committed to the repo.
- GitHub repo: https://github.com/Joey-Farah/joeyfarah.dev
- Target domain: joeyfarah.dev (not yet purchased)
