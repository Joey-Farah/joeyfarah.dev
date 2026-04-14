import type { BentoBlock } from 'shared/types';
import type { IBlockRepository } from './IBlockRepository';
import { BlockNotFoundError } from './BlockNotFoundError';
import { BlockModel } from '../models/BlockModel';

export class MongoBlockRepository implements IBlockRepository {
  async getBlocks(): Promise<BentoBlock[]> {
    const docs = await BlockModel.find({}).sort({ order: 1 }).lean();
    return docs as unknown as BentoBlock[];
  }

  async getBlock(slug: string): Promise<BentoBlock> {
    const doc = await BlockModel.findOne({ slug }).lean();
    if (!doc) {
      throw new BlockNotFoundError(slug);
    }
    return doc as unknown as BentoBlock;
  }

  async upsertBlocks(blocks: BentoBlock[]): Promise<void> {
    for (const block of blocks) {
      await BlockModel.findOneAndReplace(
        { slug: block.slug },
        block,
        { upsert: true, new: true }
      );
    }
  }
}
