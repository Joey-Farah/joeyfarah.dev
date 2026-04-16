# Changelog

## 2026-04-15

### A11y & SEO polish
- **Skip-to-content link**: `// skip to content` in brand cyan, hidden until keyboard focus hits it; jumps to `<main id="main-content">`.
- **Visible focus rings**: global `:focus-visible` outline in brand-primary so keyboard users can see where they are. Mouse/touch users unaffected.
- **`<meta name="theme-color" content="#0d0d0d">`**: mobile browser chrome matches the dark theme.
- **`<link rel="canonical">`**: points at `https://joeyfarah.dev/` for SEO.

### NavBar UX
- **Active-section highlight** (`useActiveSection.ts`): IntersectionObserver watches each bento section; the NavBar link for the section currently in view switches to brand-primary with an underline. `aria-current="true"` set on the active link.

### Tests
- `sitemap.test.ts`: 7 supertest specs covering status, content-type, XML shape, root, section anchors, tile slugs, hero exclusion.
- `ScrollToTopButton.test.tsx`: 3 specs — hidden near top, appears past threshold, `scrollTo` called on click.
- `useKeyboardSectionNav.test.tsx`: 5 specs — ArrowDown/j triggers scroll, inputs guarded, modifiers guarded, unrelated keys ignored.
- `test-setup.ts`: added `matchMedia` mock (jsdom lacks it; blocked multiple specs).
- Totals: 27 client + 53 server = **80 tests passing**.

### Autonomous backlog pass
- **Scroll-to-top button** (`ScrollToTopButton.tsx`): appears after 600px scroll, smooth-scrolls to top (respects `prefers-reduced-motion`). Terminal-themed `^` glyph.
- **Keyboard section nav** (`useKeyboardSectionNav.ts`): `ArrowDown`/`ArrowUp` and `j`/`k` jump between `#professional`, `#enterprise`, `#projects`, `#contact`. Ignored while typing in inputs or when modifier keys held.
- **Tile title-bar deep-link copy**: clicking a `BentoTile` title bar copies `{origin}/#{slug}` to clipboard. Title bar flips to `✓ copied #slug` for 2s. Tile now exposes `id={slug}` so the anchor actually scrolls.
- **Code-split `ERDTileRenderer`**: lazy-loaded via `React.lazy` + `Suspense` with a terminal-styled fallback. Produces separate chunk (~2.2 kB) off the initial bundle.
- **`GET /sitemap.xml`** (`routes/sitemap.ts`): generates sitemap XML at request time from the block repository — root, 4 section anchors, one URL per tile slug. Respects `SITE_URL` env var (defaults to `https://joeyfarah.dev`).
- **Lighthouse CI workflow** (`.github/workflows/lighthouse.yml` + `lighthouserc.json`): runs `@lhci/cli autorun` against the static build on every PR and push to `main`. Asserts Accessibility & SEO ≥ 0.9 (error), Performance & Best Practices ≥ 0.9 (warn).

### Documentation
- Rewrote "What Still Needs To Be Done" in `CLAUDE.md` with concrete, ordered steps for Railway deploy (exact build/start commands, env var names, Atlas network access gotcha), Cloudflare domain + DNS records, and Plausible-vs-GA4 script-tag snippets.

### Build & test fixes
- Vitest config: defined `__BUILD_DATE__` so `BentoTile.test.tsx` suite loads (was silently failing pre-existing on main).
- `BentoTile.test.tsx`: ERD dispatch test now awaits lazy-loaded renderer via `waitFor`.

---

## 2026-04-14

### Accessibility fix
- Added `<main>` landmark to `App.tsx` — Lighthouse accessibility score 100

### UI polish
- Responsive mobile padding on `BentoGrid` (`pt-8 md:pt-24`, `px-4 md:px-6`)
- Section heading spacing responsive (`mb-3 md:mb-6`)
- `BentoGrid` max-width extended for ultra-wide screens (`lg:max-w-7xl`)
- Window control circles and cursor scale responsively on mobile
- Timeline accomplishment list spacing improved on mobile
- ERD tile min-height responsive (`max(150px, 30vh)`)
- Project card link touch targets and badge gap responsive
- Contact link items vertical spacing improved on mobile
- Hero scroll arrow hides after first scroll
- `ScrollTransitionOrchestrator` exit/enter easing symmetry (both `0.4s easeOut`)
- NavBar entrance: smooth slide-down + fade via Framer Motion instead of instant pop-in
- `BentoTile` hover: cyan border glow + soft box shadow (`whileHover`)
- Fixed scroll gray-out: removed `mode="wait"` gap and `window.scrollTo` scroll fight; added `bg-brand-bg` to orchestrator container

### Content rewrites
- Hero lines: specific achievements (Fortune 500, 200K+ invoice migrations)
- All 10 timeline accomplishments quantified with metrics (%, invoice counts, deadlines, error rates)
- Enterprise tile descriptions rewritten to lead with user value and time savings
- Personal project descriptions sharpened with audience targeting and technical specificity

### New features
- `ScrollProgressBar`: cyan Framer Motion `useScroll` + `useSpring` bar fixed at top of viewport
- `GET /api/resume`: downloadable plain-text resume endpoint
- Resume download row in contact tile (`$ open joey-farah-resume.txt`)
- Copy-to-clipboard on email contact link (shows `✓ copied!` feedback for 2s)
- Build date footer in contact tile (`// last updated YYYY-MM-DD`, injected at build time via Vite)
- Custom 404 page: themed terminal-style HTML from Express (`// repo not found`)
- `favicon.svg`: `>_` terminal glyph on near-black background

### SEO
- Open Graph and Twitter Card meta tags (`og:title`, `og:description`, `og:type`, `og:url`, `twitter:card`)
- Schema.org `Person` structured data JSON-LD
- Updated `<title>` and `<meta name="description">`
- `robots.txt` in `client/public/`

### Build & infra fixes
- Excluded test files from client `tsconfig.json` build check (pre-existing `vi` type errors in test setup)
- Fixed server TypeScript compilation via project references (`tsc --build`, `composite: true` on shared package)
- Shared compiled artifacts removed from git tracking and added to `.gitignore`

---

## 2026-04-13 (initial build — other machine)

Full project scaffold built by Claude Code. All 10 implementation groups completed:

- Group 1: Project scaffold & shared layer (types, Zod schemas, Tailwind tokens, Vite config)
- Group 2: Seed system (`npm run seed`, `SeedIngestion`, `blocks.seed.json` with all 10 tiles)
- Group 3: Backend API (MongoBlockRepository, Express routes, 46/46 server tests passing)
- Group 4: Frontend foundation + Hero (boot sequence, reduced-motion fallback, mobile timing)
- Group 5: Navigation & scroll transition (AnimatePresence Option B, sticky NavBar)
- Group 6: BentoTile shell (terminal chrome, sub-renderer dispatch, responsive grid)
- Group 7: Professional timeline (TimelineRenderer, scroll-animated entries)
- Group 8: Enterprise suite (ERDTileRenderer SVG pathLength animation, ProjectCardRenderer)
- Group 9: Personal projects (Slippi, Fitness Ring, Habitat CSS animation, Lombardi)
- Group 10: Contact + accessibility (ContactLinksRenderer, aria labels, WCAG AA)
