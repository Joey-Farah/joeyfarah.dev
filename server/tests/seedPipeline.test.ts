import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import type { BentoBlock } from 'shared/types';
import { ingestSeed } from '../src/modules/seedIngestion';
import { InMemoryBlockRepository } from '../src/repositories/InMemoryBlockRepository';
import { BlockNotFoundError } from '../src/repositories/BlockNotFoundError';

const VALID_SEED = path.resolve(__dirname, 'fixtures/valid.seed.json');
const BLOCKS_SEED = path.resolve(__dirname, '../seed/blocks.seed.json');

// ---------------------------------------------------------------------------
// End-to-end: ingestSeed() → InMemoryBlockRepository → getBlocks()
// ---------------------------------------------------------------------------

describe('seedPipeline — valid fixture seed (5 blocks)', () => {
  let repo: InMemoryBlockRepository;
  let blocks: BentoBlock[];

  beforeAll(async () => {
    blocks = await ingestSeed(VALID_SEED);
    repo = new InMemoryBlockRepository();
    await repo.upsertBlocks(blocks);
  });

  it('getBlocks() returns 5 blocks', async () => {
    const result = await repo.getBlocks();
    expect(result.length).toBe(5);
  });

  it('blocks are ordered by .order field', async () => {
    const result = await repo.getBlocks();
    for (let i = 1; i < result.length; i++) {
      expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
    }
  });

  it('getBlock("hero") returns the hero block', async () => {
    const block = await repo.getBlock('hero');
    expect(block.slug).toBe('hero');
    expect(block.type).toBe('hero');
  });

  it('getBlock("contact") returns the contact-links block', async () => {
    const block = await repo.getBlock('contact');
    expect(block.slug).toBe('contact');
    expect(block.type).toBe('contact-links');
  });

  it('getBlock("nonexistent") throws BlockNotFoundError', async () => {
    await expect(repo.getBlock('nonexistent')).rejects.toBeInstanceOf(BlockNotFoundError);
  });

  it('upsertBlocks is idempotent — re-upserting returns same count', async () => {
    await repo.upsertBlocks(blocks);
    const result = await repo.getBlocks();
    expect(result.length).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// End-to-end: production blocks.seed.json → InMemoryBlockRepository
// ---------------------------------------------------------------------------

describe('seedPipeline — production blocks.seed.json (10 blocks)', () => {
  let repo: InMemoryBlockRepository;

  beforeAll(async () => {
    const blocks = await ingestSeed(BLOCKS_SEED);
    repo = new InMemoryBlockRepository();
    await repo.upsertBlocks(blocks);
  });

  it('getBlocks() returns 10 blocks', async () => {
    const result = await repo.getBlocks();
    expect(result.length).toBe(10);
  });

  it('all blocks have required envelope fields', async () => {
    const result = await repo.getBlocks();
    for (const block of result) {
      expect(typeof block.slug).toBe('string');
      expect(typeof block.type).toBe('string');
      expect(typeof block.title).toBe('string');
      expect(typeof block.order).toBe('number');
      expect(typeof block.visible).toBe('boolean');
      expect(block.content).toBeDefined();
    }
  });

  it('can retrieve every slug individually', async () => {
    const expectedSlugs = [
      'hero',
      'professional-timeline',
      'oracle-db-mapper',
      'conversion-automation',
      'fusion-sql-developer',
      'slippi-ranked-stats',
      'fitness-ring-analytics',
      'habitat',
      'lombardi-project',
      'contact',
    ];
    for (const slug of expectedSlugs) {
      const block = await repo.getBlock(slug);
      expect(block.slug).toBe(slug);
    }
  });

  it('hero content has lines array (Story 36: boot sequence is data-driven)', async () => {
    const block = await repo.getBlock('hero');
    const content = block.content as { lines: string[] };
    expect(Array.isArray(content.lines)).toBe(true);
    expect(content.lines.length).toBeGreaterThanOrEqual(1);
  });

  it('habitat tile is independently updatable without affecting contact tile', async () => {
    const blocks = await repo.getBlocks();
    const habitat = blocks.find((b) => b.slug === 'habitat');
    const contact = blocks.find((b) => b.slug === 'contact');

    // Upsert only habitat with a modified title
    const updatedHabitat = { ...habitat!, title: 'Habitat v2' };
    await repo.upsertBlocks([updatedHabitat]);

    const contactAfter = await repo.getBlock('contact');
    expect(contactAfter.title).toBe(contact!.title); // contact unchanged

    const habitatAfter = await repo.getBlock('habitat');
    expect(habitatAfter.title).toBe('Habitat v2'); // habitat updated
  });
});
