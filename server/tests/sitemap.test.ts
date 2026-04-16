import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { InMemoryBlockRepository } from '../src/repositories/InMemoryBlockRepository';
import { createSitemapRouter } from '../src/routes/sitemap';
import type { BentoBlock } from 'shared/types';

const seedBlocks: BentoBlock[] = [
  {
    slug: 'hero',
    type: 'hero',
    title: 'Hero',
    order: 0,
    visible: true,
    content: { lines: ['Joey'] },
  },
  {
    slug: 'oracle-db-mapper',
    type: 'erd-tile',
    title: 'Oracle DB Mapper',
    order: 2,
    visible: true,
    content: { description: '', nodes: [], edges: [] },
  },
  {
    slug: 'contact',
    type: 'contact-links',
    title: 'Contact',
    order: 9,
    visible: true,
    content: { links: [] },
  },
];

function buildApp(): express.Express {
  const app = express();
  const repo = new InMemoryBlockRepository(seedBlocks);
  app.use('/', createSitemapRouter(repo));
  return app;
}

let app: express.Express;

beforeAll(() => {
  app = buildApp();
});

describe('GET /sitemap.xml', () => {
  it('responds with 200', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
  });

  it('sets XML content-type', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.headers['content-type']).toMatch(/application\/xml/);
  });

  it('contains a urlset element with the XML declaration', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.text).toMatch(/^<\?xml version="1\.0"/);
    expect(res.text).toContain('<urlset');
    expect(res.text).toContain('</urlset>');
  });

  it('includes the site root', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.text).toContain('<loc>https://joeyfarah.dev/</loc>');
  });

  it('includes all four section anchors', async () => {
    const res = await request(app).get('/sitemap.xml');
    for (const section of ['professional', 'enterprise', 'projects', 'contact']) {
      expect(res.text).toContain(`<loc>https://joeyfarah.dev/#${section}</loc>`);
    }
  });

  it('includes non-hero blocks by slug', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.text).toContain('<loc>https://joeyfarah.dev/#oracle-db-mapper</loc>');
  });

  it('excludes the hero block from slug entries', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.text).not.toContain('<loc>https://joeyfarah.dev/#hero</loc>');
  });
});
