import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { ingestSeed } from '../src/modules/seedIngestion';
import { SeedValidationError } from '../src/modules/seedIngestion.errors';

const FIXTURES = path.resolve(__dirname, 'fixtures');
const VALID_SEED = path.join(FIXTURES, 'valid.seed.json');
const INVALID_SEED = path.join(FIXTURES, 'invalid.seed.json');
const BLOCKS_SEED = path.resolve(__dirname, '../seed/blocks.seed.json');

// ---------------------------------------------------------------------------
// Valid seed — should return a correctly shaped BentoBlock[]
// ---------------------------------------------------------------------------

describe('ingestSeed — valid seed', () => {
  it('returns an array of BentoBlock objects', async () => {
    const blocks = await ingestSeed(VALID_SEED);
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBe(5);
  });

  it('hero block has correct shape', async () => {
    const blocks = await ingestSeed(VALID_SEED);
    const hero = blocks.find((b) => b.slug === 'hero');
    expect(hero).toBeDefined();
    expect(hero!.type).toBe('hero');
    expect(Array.isArray((hero!.content as { lines: string[] }).lines)).toBe(true);
    expect((hero!.content as { lines: string[] }).lines.length).toBeGreaterThan(0);
  });

  it('timeline block has correct shape', async () => {
    const blocks = await ingestSeed(VALID_SEED);
    const block = blocks.find((b) => b.slug === 'professional-timeline');
    expect(block).toBeDefined();
    expect(block!.type).toBe('timeline');
    const content = block!.content as { entries: unknown[] };
    expect(Array.isArray(content.entries)).toBe(true);
    expect(content.entries.length).toBeGreaterThan(0);
  });

  it('erd-tile block has correct shape', async () => {
    const blocks = await ingestSeed(VALID_SEED);
    const block = blocks.find((b) => b.slug === 'oracle-db-mapper');
    expect(block).toBeDefined();
    expect(block!.type).toBe('erd-tile');
    const content = block!.content as { nodes: unknown[]; edges: unknown[]; description: string };
    expect(typeof content.description).toBe('string');
    expect(Array.isArray(content.nodes)).toBe(true);
    expect(Array.isArray(content.edges)).toBe(true);
  });

  it('project-card block has correct shape', async () => {
    const blocks = await ingestSeed(VALID_SEED);
    const block = blocks.find((b) => b.slug === 'slippi-ranked-stats');
    expect(block).toBeDefined();
    expect(block!.type).toBe('project-card');
    const content = block!.content as { stack: string[]; status: string };
    expect(Array.isArray(content.stack)).toBe(true);
    expect(['live', 'in-development']).toContain(content.status);
  });

  it('contact-links block has correct shape', async () => {
    const blocks = await ingestSeed(VALID_SEED);
    const block = blocks.find((b) => b.slug === 'contact');
    expect(block).toBeDefined();
    expect(block!.type).toBe('contact-links');
    const content = block!.content as { links: unknown[] };
    expect(Array.isArray(content.links)).toBe(true);
    expect(content.links.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// blocks.seed.json — production seed should load clean
// ---------------------------------------------------------------------------

describe('ingestSeed — production blocks.seed.json', () => {
  it('loads all 10 blocks without error', async () => {
    const blocks = await ingestSeed(BLOCKS_SEED);
    expect(blocks.length).toBe(10);
  });

  it('all required slugs are present', async () => {
    const blocks = await ingestSeed(BLOCKS_SEED);
    const slugs = blocks.map((b) => b.slug);
    expect(slugs).toContain('hero');
    expect(slugs).toContain('professional-timeline');
    expect(slugs).toContain('oracle-db-mapper');
    expect(slugs).toContain('conversion-automation');
    expect(slugs).toContain('fusion-sql-developer');
    expect(slugs).toContain('slippi-ranked-stats');
    expect(slugs).toContain('fitness-ring-analytics');
    expect(slugs).toContain('habitat');
    expect(slugs).toContain('lombardi-project');
    expect(slugs).toContain('contact');
  });

  it('hero lines reference Melee (Story 32)', async () => {
    const blocks = await ingestSeed(BLOCKS_SEED);
    const hero = blocks.find((b) => b.slug === 'hero');
    const content = hero!.content as { lines: string[] };
    expect(content.lines.some((l) => l.includes('Melee'))).toBe(true);
  });

  it('hero lines reference Oracle Cloud role (Story 32)', async () => {
    const blocks = await ingestSeed(BLOCKS_SEED);
    const hero = blocks.find((b) => b.slug === 'hero');
    const content = hero!.content as { lines: string[] };
    expect(content.lines.some((l) => l.includes('Oracle Cloud'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Malformed seed — should throw SeedValidationError with slug and field
// ---------------------------------------------------------------------------

describe('ingestSeed — invalid.seed.json (Story 33)', () => {
  it('throws SeedValidationError (not a generic Error)', async () => {
    await expect(ingestSeed(INVALID_SEED)).rejects.toBeInstanceOf(SeedValidationError);
  });

  it('error has a non-empty .slug property', async () => {
    try {
      await ingestSeed(INVALID_SEED);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(SeedValidationError);
      expect((err as SeedValidationError).slug).toBeTruthy();
    }
  });

  it('error has a non-empty .field property', async () => {
    try {
      await ingestSeed(INVALID_SEED);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(SeedValidationError);
      expect((err as SeedValidationError).field).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Per-type malformed block tests — one seed file per type tested via
// a helper that builds a one-element array in memory by writing a temp file,
// OR by pointing at specific invalid slugs via targeted single-block seeds.
// We test by parsing each invalid fixture block individually using a helper.
// ---------------------------------------------------------------------------

import * as fs from 'fs';
import * as os from 'os';

/** Writes a single-block seed to a temp file and calls ingestSeed() */
async function ingestSingleBlock(block: unknown): Promise<void> {
  const tmp = path.join(os.tmpdir(), `seed-test-${Date.now()}-${Math.random()}.json`);
  fs.writeFileSync(tmp, JSON.stringify([block]), { encoding: 'utf-8' });
  try {
    await ingestSeed(tmp);
  } finally {
    fs.unlinkSync(tmp);
  }
}

describe('ingestSeed — per-type malformed blocks (Story 33)', () => {
  it('hero: missing content.lines → SeedValidationError with slug="bad-hero"', async () => {
    const block = {
      slug: 'bad-hero',
      type: 'hero',
      title: 'Hero',
      order: 0,
      visible: true,
      content: {},
    };
    try {
      await ingestSingleBlock(block);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(SeedValidationError);
      expect((err as SeedValidationError).slug).toBe('bad-hero');
      expect((err as SeedValidationError).field).toBeTruthy();
    }
  });

  it('timeline: missing content.entries → SeedValidationError with slug="bad-timeline"', async () => {
    const block = {
      slug: 'bad-timeline',
      type: 'timeline',
      title: 'Timeline',
      order: 1,
      visible: true,
      content: {},
    };
    try {
      await ingestSingleBlock(block);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(SeedValidationError);
      expect((err as SeedValidationError).slug).toBe('bad-timeline');
    }
  });

  it('erd-tile: missing content.nodes → SeedValidationError with slug="bad-erd"', async () => {
    const block = {
      slug: 'bad-erd',
      type: 'erd-tile',
      title: 'ERD',
      order: 2,
      visible: true,
      content: { description: 'desc' },
    };
    try {
      await ingestSingleBlock(block);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(SeedValidationError);
      expect((err as SeedValidationError).slug).toBe('bad-erd');
    }
  });

  it('project-card: missing content.description → SeedValidationError with slug="bad-card"', async () => {
    const block = {
      slug: 'bad-card',
      type: 'project-card',
      title: 'Card',
      order: 3,
      visible: true,
      content: { stack: ['Python'], links: [], status: 'live' },
    };
    try {
      await ingestSingleBlock(block);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(SeedValidationError);
      expect((err as SeedValidationError).slug).toBe('bad-card');
    }
  });

  it('contact-links: missing content.links → SeedValidationError with slug="bad-contact"', async () => {
    const block = {
      slug: 'bad-contact',
      type: 'contact-links',
      title: 'Contact',
      order: 4,
      visible: true,
      content: {},
    };
    try {
      await ingestSingleBlock(block);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(SeedValidationError);
      expect((err as SeedValidationError).slug).toBe('bad-contact');
    }
  });

  it('block with invalid JSON file → SeedValidationError', async () => {
    const tmp = path.join(os.tmpdir(), `seed-test-badjson-${Date.now()}.json`);
    fs.writeFileSync(tmp, '{ not valid json }', { encoding: 'utf-8' });
    try {
      await expect(ingestSeed(tmp)).rejects.toBeInstanceOf(SeedValidationError);
    } finally {
      fs.unlinkSync(tmp);
    }
  });
});
