import { Router, Request, Response } from 'express';
import type { IBlockRepository } from '../repositories/IBlockRepository';
import { BlockNotFoundError } from '../repositories/BlockNotFoundError';

export function createBlocksRouter(repo: IBlockRepository): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    const blocks = await repo.getBlocks();
    res.json(blocks);
  });

  router.get('/:slug', async (req: Request, res: Response) => {
    try {
      const block = await repo.getBlock(req.params.slug);
      res.json(block);
    } catch (err) {
      if (err instanceof BlockNotFoundError) {
        res.status(404).json({ error: err.message });
        return;
      }
      throw err;
    }
  });

  return router;
}
