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
  it('is a standalone HTML document with a noindex meta tag', () => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });
});
