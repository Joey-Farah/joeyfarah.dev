import type { BentoBlock } from 'shared/types';

export interface IBlockDataClient {
  fetchBlocks(): Promise<BentoBlock[]>;
  fetchBlock(slug: string): Promise<BentoBlock>;
}

export class HttpBlockDataClient implements IBlockDataClient {
  async fetchBlocks(): Promise<BentoBlock[]> {
    const res = await fetch('/api/blocks');
    if (!res.ok) {
      throw new Error(`Failed to fetch blocks: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<BentoBlock[]>;
  }

  async fetchBlock(slug: string): Promise<BentoBlock> {
    const res = await fetch(`/api/blocks/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch block "${slug}": ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<BentoBlock>;
  }
}
