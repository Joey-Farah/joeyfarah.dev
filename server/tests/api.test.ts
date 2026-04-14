import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { InMemoryBlockRepository } from '../src/repositories/InMemoryBlockRepository';
import { createBlocksRouter } from '../src/routes/blocks';
import type { BentoBlock } from 'shared/types';

const seedBlocks: BentoBlock[] = [
  {
    slug: 'hero',
    type: 'hero',
    title: 'Hero',
    order: 0,
    visible: true,
    content: { lines: ['Joey Farah', 'Oracle Cloud ERP Consultant'] },
  },
  {
    slug: 'contact',
    type: 'contact-links',
    title: 'Contact',
    order: 9,
    visible: true,
    content: {
      links: [{ platform: 'GitHub', url: 'https://github.com/joeyfarah', display: 'joeyfarah' }],
    },
  },
];

function buildApp(): express.Express {
  const app = express();
  app.use(express.json());
  const repo = new InMemoryBlockRepository(seedBlocks);
  app.use('/api/blocks', createBlocksRouter(repo));
  return app;
}

let app: express.Express;

beforeAll(() => {
  app = buildApp();
});

describe('GET /api/blocks', () => {
  it('responds with 200', async () => {
    const res = await request(app).get('/api/blocks');
    expect(res.status).toBe(200);
  });

  it('responds with an array of blocks', async () => {
    const res = await request(app).get('/api/blocks');
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(seedBlocks.length);
  });

  it('returns blocks with expected slugs', async () => {
    const res = await request(app).get('/api/blocks');
    const slugs = res.body.map((b: BentoBlock) => b.slug);
    expect(slugs).toContain('hero');
    expect(slugs).toContain('contact');
  });
});

describe('GET /api/blocks/:slug', () => {
  it('responds with 200 for a known slug', async () => {
    const res = await request(app).get('/api/blocks/hero');
    expect(res.status).toBe(200);
  });

  it('returns the correct block for a known slug', async () => {
    const res = await request(app).get('/api/blocks/hero');
    expect(res.body.slug).toBe('hero');
    expect(res.body.type).toBe('hero');
    expect(res.body.title).toBe('Hero');
  });

  it('responds with 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/blocks/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('404 response includes an error message', async () => {
    const res = await request(app).get('/api/blocks/unknown-slug');
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
  });
});
