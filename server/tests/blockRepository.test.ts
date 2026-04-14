import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongoBlockRepository } from '../src/repositories/MongoBlockRepository';
import { BlockNotFoundError } from '../src/repositories/BlockNotFoundError';
import type { BentoBlock } from 'shared/types';

const sampleBlocks: BentoBlock[] = [
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

let mongoServer: MongoMemoryServer;
let repo: MongoBlockRepository;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  repo = new MongoBlockRepository();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all blocks before each test
  await mongoose.connection.collection('blocks').deleteMany({});
});

describe('MongoBlockRepository', () => {
  describe('getBlocks()', () => {
    it('returns an empty array when no blocks exist', async () => {
      const blocks = await repo.getBlocks();
      expect(blocks).toEqual([]);
    });

    it('returns all upserted blocks sorted by order', async () => {
      await repo.upsertBlocks(sampleBlocks);
      const blocks = await repo.getBlocks();
      expect(blocks).toHaveLength(2);
      expect(blocks[0].slug).toBe('hero');
      expect(blocks[1].slug).toBe('contact');
    });

    it('returns an array (not null/undefined)', async () => {
      const blocks = await repo.getBlocks();
      expect(Array.isArray(blocks)).toBe(true);
    });
  });

  describe('getBlock(slug)', () => {
    it('returns the correct block for a known slug', async () => {
      await repo.upsertBlocks(sampleBlocks);
      const block = await repo.getBlock('hero');
      expect(block.slug).toBe('hero');
      expect(block.type).toBe('hero');
      expect(block.title).toBe('Hero');
    });

    it('returns block with correct content shape', async () => {
      await repo.upsertBlocks(sampleBlocks);
      const block = await repo.getBlock('contact');
      expect(block.content).toBeDefined();
    });

    it('throws BlockNotFoundError for an unknown slug', async () => {
      await expect(repo.getBlock('does-not-exist')).rejects.toThrow(BlockNotFoundError);
    });

    it('BlockNotFoundError carries the slug that was requested', async () => {
      await expect(repo.getBlock('missing-slug')).rejects.toMatchObject({ slug: 'missing-slug' });
    });
  });

  describe('upsertBlocks()', () => {
    it('is idempotent — re-upserting the same blocks does not duplicate them', async () => {
      await repo.upsertBlocks(sampleBlocks);
      await repo.upsertBlocks(sampleBlocks);
      const blocks = await repo.getBlocks();
      expect(blocks).toHaveLength(sampleBlocks.length);
    });

    it('updates an existing block when re-upserted with changed data', async () => {
      await repo.upsertBlocks(sampleBlocks);
      const updated: BentoBlock[] = [{ ...sampleBlocks[0], title: 'Updated Hero' }];
      await repo.upsertBlocks(updated);
      const block = await repo.getBlock('hero');
      expect(block.title).toBe('Updated Hero');
    });
  });
});
