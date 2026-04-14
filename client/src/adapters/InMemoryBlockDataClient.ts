import type { BentoBlock } from 'shared/types';
import type { IBlockDataClient } from './BlockDataClient';

export class InMemoryBlockDataClient implements IBlockDataClient {
  private blocks: BentoBlock[];

  constructor(blocks: BentoBlock[]) {
    this.blocks = blocks;
  }

  async fetchBlocks(): Promise<BentoBlock[]> {
    return this.blocks;
  }

  async fetchBlock(slug: string): Promise<BentoBlock> {
    const block = this.blocks.find((b) => b.slug === slug);
    if (!block) {
      throw new Error(`Block not found: "${slug}"`);
    }
    return block;
  }
}
