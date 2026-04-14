import type { BentoBlock } from 'shared/types';
import type { IBlockRepository } from './IBlockRepository';
import { BlockNotFoundError } from './BlockNotFoundError';

export class InMemoryBlockRepository implements IBlockRepository {
  private store: Map<string, BentoBlock>;

  constructor(initialBlocks: BentoBlock[] = []) {
    this.store = new Map(initialBlocks.map((b) => [b.slug, b]));
  }

  async getBlocks(): Promise<BentoBlock[]> {
    return Array.from(this.store.values()).sort((a, b) => a.order - b.order);
  }

  async getBlock(slug: string): Promise<BentoBlock> {
    const block = this.store.get(slug);
    if (!block) {
      throw new BlockNotFoundError(slug);
    }
    return block;
  }

  async upsertBlocks(blocks: BentoBlock[]): Promise<void> {
    for (const block of blocks) {
      this.store.set(block.slug, block);
    }
  }
}
