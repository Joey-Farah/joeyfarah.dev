import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

export const healthRouter = Router();

healthRouter.get('/healthz', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    db: dbStatus,
  });
});
