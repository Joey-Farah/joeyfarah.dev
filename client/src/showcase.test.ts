import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// /showcase is a gallery of concept sites for made-up businesses in a made-up
// town (Halvorsen Falls, MN). Like /work, every page is a standalone static
// file. These tests enforce the guardrails that keep the concepts from passing
// as real businesses: a visible concept banner, noindex, fictional phone
// numbers and emails, and actions that end in a "this is a demo" notice.

const repoRoot = path.resolve(__dirname, '../..');
const showcaseDir = path.join(repoRoot, 'client/public/showcase');
const vercel = JSON.parse(readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8'));
const read = (rel: string) => readFileSync(path.join(showcaseDir, rel), 'utf8');
const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const concepts = readdirSync(showcaseDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(path.join(showcaseDir, d.name, 'index.html')))
  .map((d) => d.name);

function localRefs(doc: Document, html: string): string[] {
  return [
    ...[...doc.querySelectorAll('link[href]')].map((el) => el.getAttribute('href')!),
    ...[...doc.querySelectorAll('[src]')].map((el) => el.getAttribute('src')!),
    ...[...html.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/["']/g, '')),
  ];
}

describe('/showcase routing', () => {
  it('rewrites the gallery and each concept before the SPA catch-all', () => {
    const rewrites: { source: string; destination: string }[] = vercel.rewrites;
    const catchAll = rewrites.findIndex((r) => r.destination === '/index.html');
    const expected: Record<string, string> = {
      '/showcase': '/showcase/index.html',
      '/showcase/': '/showcase/index.html',
      '/showcase/:slug': '/showcase/:slug/index.html',
      '/showcase/:slug/': '/showcase/:slug/index.html',
    };
    for (const [source, destination] of Object.entries(expected)) {
      const i = rewrites.findIndex((r) => r.source === source);
      expect(rewrites[i]?.destination).toBe(destination);
      expect(i).toBeLessThan(catchAll);
    }
  });

  it('sends X-Robots-Tag: noindex for everything under /showcase', () => {
    const rule = vercel.headers?.find((h: { source: string }) => h.source === '/showcase(/.*)?');
    expect(rule?.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex' });
  });
});

describe('/showcase gallery', () => {
  const html = read('index.html');
  const doc = parse(html);

  it('is noindex', () => {
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });

  it('links to every concept, with a preview image that exists', () => {
    expect(concepts.length).toBeGreaterThan(0);
    for (const slug of concepts) {
      expect(doc.querySelector(`a[href="/showcase/${slug}"]`)).not.toBeNull();
      const img = doc.querySelector(`img[src="/showcase/shots/${slug}.webp"]`);
      expect(img).not.toBeNull();
      expect(img?.getAttribute('alt')).toBeTruthy();
      expect(existsSync(path.join(showcaseDir, 'shots', `${slug}.webp`))).toBe(true);
    }
  });

  it('labels the concepts as made-up businesses', () => {
    expect(doc.body.textContent).toMatch(/made-up/i);
  });

  it('links back to /work and offers the one email address', () => {
    expect(doc.querySelector('a[href="/work"]')).not.toBeNull();
    const mailtos = new Set([...doc.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href')));
    expect(mailtos).toEqual(new Set(['mailto:joey@joeyfarah.dev']));
  });

  it('carries none of the portfolio or employer content', () => {
    for (const word of ['oracle', 'melee', 'patreon', 'elire', 'slippi', 'ssbm', 'hello@']) {
      expect(html.toLowerCase()).not.toContain(word);
    }
  });

  it('makes no third-party requests', () => {
    for (const ref of localRefs(doc, html)) expect(ref).toMatch(/^(\/(?!\/)|data:|#)/);
  });
});

describe.each(concepts)('concept: %s', (slug) => {
  const html = read(`${slug}/index.html`);
  const doc = parse(html);
  const text = doc.body.textContent ?? '';

  it('is noindex', () => {
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });

  it('shows a concept banner that names it as made-up and links to the gallery', () => {
    const banner = doc.querySelector('[data-concept-banner]');
    expect(banner?.textContent).toContain('Concept site by JEF Consulting');
    expect(banner?.textContent).toMatch(/made-up business/i);
    expect(banner?.querySelector('a[href="/showcase"]')).not.toBeNull();
  });

  it('uses only fictional phone numbers (555-01xx)', () => {
    const phones = text.match(/\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g) ?? [];
    for (const p of phones) expect(p).toMatch(/555[\s.-]01\d\d$/);
    for (const a of doc.querySelectorAll('a[href^="tel:"]')) {
      expect(a.getAttribute('href')).toMatch(/555-?01\d\d$/);
    }
  });

  it('uses only reserved .example email addresses (or Joey\'s)', () => {
    const emails = html.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) ?? [];
    for (const e of emails) expect(e === 'joey@joeyfarah.dev' || e.endsWith('.example')).toBe(true);
  });

  it('makes no third-party requests', () => {
    for (const ref of localRefs(doc, html)) expect(ref).toMatch(/^(\/(?!\/)|data:|#)/);
  });

  it('ends every booking/ordering action in a "this is a demo" notice', async () => {
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
    const w = dom.window;
    await new Promise((r) => w.setTimeout(r, 0));
    const actions = [...w.document.querySelectorAll<HTMLElement>('[data-demo]')];
    expect(actions.length).toBeGreaterThan(0);
    for (const el of actions) {
      const notice = w.document.querySelector('[data-demo-notice]')!;
      notice.textContent = '';
      if (el instanceof w.HTMLFormElement) el.requestSubmit();
      else el.click();
      expect(notice.textContent).toMatch(/this is a demo/i);
    }
  });
});
