import { Router, Request, Response } from 'express';
import type { IBlockRepository } from '../repositories/IBlockRepository';

const SITE_URL = process.env.SITE_URL ?? 'https://joeyfarah.dev';

const SECTION_ANCHORS = ['professional', 'enterprise', 'projects', 'contact'] as const;

export function createSitemapRouter(repo: IBlockRepository): Router {
  const router = Router();

  router.get('/sitemap.xml', async (_req: Request, res: Response) => {
    const blocks = await repo.getBlocks();
    const today = new Date().toISOString().slice(0, 10);

    const urls: string[] = [];
    urls.push(urlEntry(SITE_URL + '/', today, '1.0'));
    for (const section of SECTION_ANCHORS) {
      urls.push(urlEntry(`${SITE_URL}/#${section}`, today, '0.8'));
    }
    for (const block of blocks) {
      if (block.type === 'hero') continue;
      urls.push(urlEntry(`${SITE_URL}/#${block.slug}`, today, '0.6'));
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.join('\n') +
      `\n</urlset>\n`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  return router;
}

function urlEntry(loc: string, lastmod: string, priority: string): string {
  return (
    `  <url>\n` +
    `    <loc>${escapeXml(loc)}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`
  );
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
