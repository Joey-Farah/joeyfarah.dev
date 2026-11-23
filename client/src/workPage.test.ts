import { existsSync, readFileSync } from 'fs';
import path from 'path';

// /work is the client-facing page behind the business-card QR code. It is a
// standalone static file (client/public/work/index.html), not part of the
// React app, so these tests read the file and the Vercel config directly.

const repoRoot = path.resolve(__dirname, '../..');
const vercel = JSON.parse(readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8'));
const html = readFileSync(path.join(repoRoot, 'client/public/work/index.html'), 'utf8');

describe('/work routing', () => {
  it('rewrites /work and /work/ to the static page before the SPA catch-all', () => {
    const rewrites: { source: string; destination: string }[] = vercel.rewrites;
    const catchAll = rewrites.findIndex((r) => r.destination === '/index.html');
    for (const source of ['/work', '/work/']) {
      const i = rewrites.findIndex((r) => r.source === source);
      expect(rewrites[i]?.destination).toBe('/work/index.html');
      expect(i).toBeLessThan(catchAll);
    }
  });

  it('sends X-Robots-Tag: noindex for /work', () => {
    const rule = vercel.headers?.find((h: { source: string }) => h.source === '/work(/.*)?');
    expect(rule?.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex' });
  });
});

describe('/work page', () => {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  it('is a standalone HTML document with a noindex meta tag', () => {
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });

  it('has one contact action: email joey@joeyfarah.dev', () => {
    const mailtos = [...doc.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href'));
    expect(mailtos.length).toBeGreaterThan(0);
    expect(new Set(mailtos)).toEqual(new Set(['mailto:joey@joeyfarah.dev']));
    // The only other links go to the showcase examples on this site.
    for (const a of doc.querySelectorAll('a:not([href^="mailto:"])')) expect(a.getAttribute('href')).toMatch(/^\/showcase(\/[a-z-]+)?$/);
  });

  it('names the company in the footer', () => {
    expect(doc.querySelector('footer')?.textContent).toContain('JEF Consulting LLC · Minnesota');
  });

  it('carries none of the portfolio or employer content', () => {
    for (const word of ['oracle', 'melee', 'patreon', 'elire', 'slippi', 'ssbm', 'hello@']) {
      expect(html.toLowerCase()).not.toContain(word);
    }
  });

  it('ships no JavaScript', () => {
    expect(doc.querySelectorAll('script')).toHaveLength(0);
  });

  it('makes no third-party requests: every asset is served from this site', () => {
    const refs = [
      ...[...doc.querySelectorAll('link[href]')].map((el) => el.getAttribute('href')!),
      ...[...doc.querySelectorAll('[src]')].map((el) => el.getAttribute('src')!),
      ...[...html.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/["']/g, '')),
    ];
    for (const ref of refs) expect(ref).toMatch(/^(\/(?!\/)|data:)/);
  });

  it('preloads its self-hosted font, and the file exists', () => {
    const href = doc.querySelector('link[rel="preload"][as="font"]')?.getAttribute('href');
    expect(href).toMatch(/^\/work\/.+\.woff2$/);
    expect(existsSync(path.join(repoRoot, 'client/public', href!))).toBe(true);
    // The preload only helps if @font-face asks for the same URL; otherwise the font downloads twice.
    expect(html).toContain(`src: url("${href}")`);
  });

  it('keeps the closing email address in one piece on narrow phones', () => {
    expect(html).not.toContain('break-all');
    expect(doc.querySelector('.big-mail')?.innerHTML).toBe('joey@<wbr>joeyfarah.dev');
  });

  it('shows the showcase concepts as its examples, labelled as made-up businesses', () => {
    const section = doc.querySelector('section.examples')!;
    expect(section.textContent).toMatch(/made-up businesses/);
    const cards = [...section.querySelectorAll('.shots a')];
    expect(cards.length).toBeGreaterThanOrEqual(2);
    for (const a of cards) {
      const slug = a.getAttribute('href')!.replace('/showcase/', '');
      const img = a.querySelector('img')!;
      expect(img.getAttribute('src')).toBe(`/showcase/shots/${slug}.webp`);
      expect(existsSync(path.join(repoRoot, 'client/public/showcase', slug, 'index.html'))).toBe(true);
      expect(img.getAttribute('alt')).toBeTruthy();
      expect(img.getAttribute('width')).toBeTruthy();
    }
    expect(section.querySelector('a[href="/showcase"]')?.textContent).toMatch(/see all the examples/i);
  });

  it('covers the brief: hero, services, how I work, close', () => {
    expect(doc.querySelector('h1')?.textContent).toBe('Websites, and the systems behind them.');
    const headings = [...doc.querySelectorAll('h2')].map((h) => h.textContent);
    expect(headings).toEqual(['Five things I build.', 'Tap through a few.', 'How I work', 'Got something that should work better?']);
  });
});
