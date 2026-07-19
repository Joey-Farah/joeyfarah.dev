import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app, connectDB } from '../server/src/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  return app(req as never, res as never);
}
