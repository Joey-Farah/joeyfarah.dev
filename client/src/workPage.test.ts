import { readFileSync } from 'fs';
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
  const text = doc.body.textContent ?? '';

  it('is a standalone HTML document with a noindex meta tag', () => {
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });

  it('has one contact action: email joey@joeyfarah.dev', () => {
    const mailtos = [...doc.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href'));
    expect(mailtos.length).toBeGreaterThan(0);
    expect(new Set(mailtos)).toEqual(new Set(['mailto:joey@joeyfarah.dev']));
    // No other outbound links: nothing competes with the email.
    expect(doc.querySelectorAll('a:not([href^="mailto:"])')).toHaveLength(0);
  });

  it('names the company in the footer', () => {
    expect(doc.querySelector('footer')?.textContent).toContain('JEF Consulting LLC · Minnesota');
  });

  it('carries none of the portfolio or employer content', () => {
    for (const word of ['Oracle', 'Melee', 'Patreon', 'Elire', 'Slippi', 'SSBM', 'hello@']) {
      expect(html).not.toContain(word);
    }
  });

  it('ships no JavaScript and no external stylesheets or fonts', () => {
    expect(doc.querySelectorAll('script')).toHaveLength(0);
    expect(doc.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(0);
  });

  it('has no Examples section until an example is cleared', () => {
    expect(text).not.toMatch(/examples/i);
  });

  it('covers the brief: hero, what I do, how I work, close', () => {
    expect(doc.querySelector('h1')?.textContent).toBe('Websites, and the systems behind them.');
    const headings = [...doc.querySelectorAll('h2')].map((h) => h.textContent);
    expect(headings).toEqual(['What I do', 'How I work', 'Got something that should work better?']);
  });
});
