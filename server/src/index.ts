import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import mongoose from 'mongoose';
import { createBlocksRouter } from './routes/blocks';
import { resumeRouter } from './routes/resume';
import { MongoBlockRepository } from './repositories/MongoBlockRepository';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Wire repository
const repo = new MongoBlockRepository();

// Mount API routes
app.use('/api/blocks', createBlocksRouter(repo));
app.use('/api', resumeRouter);

// Serve Vite production build in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Connect to MongoDB and start server
const MONGODB_URI = process.env.MONGODB_URI;

if (require.main === module) {
  if (!MONGODB_URI) {
    process.stderr.write('[server] ERROR: MONGODB_URI environment variable is not set.\n');
    process.stderr.write('[server] Set MONGODB_URI to your MongoDB Atlas connection string and restart.\n');
    process.exit(1);
  }

  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      app.listen(PORT, () => {
        process.stdout.write(`[server] Listening on port ${PORT}\n`);
      });
    })
    .catch((err: Error) => {
      process.stderr.write(`[server] MongoDB connection failed: ${err.message}\n`);
      process.exit(1);
    });
}

export { app };
