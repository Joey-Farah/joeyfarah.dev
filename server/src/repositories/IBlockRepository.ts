import type { BentoBlock } from 'shared/types';

export interface IBlockRepository {
  getBlocks(): Promise<BentoBlock[]>;
  getBlock(slug: string): Promise<BentoBlock>; // throws BlockNotFoundError if missing
  upsertBlocks(blocks: BentoBlock[]): Promise<void>;
}
