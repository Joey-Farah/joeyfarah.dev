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

// Custom 404 handler
app.use((_req, res) => {
  res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 — joeyfarah.dev</title>
  <style>
    body { background: #0d0d0d; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .container { text-align: center; }
    .prompt { color: #06b6d4; font-size: 0.875rem; margin-bottom: 1rem; }
    h1 { font-size: 4rem; margin: 0 0 0.5rem; color: #06b6d4; }
    p { color: #e2e8f0; opacity: 0.6; margin-bottom: 2rem; }
    a { color: #06b6d4; text-decoration: none; font-size: 0.875rem; border: 1px solid rgba(6,182,212,0.4); padding: 0.5rem 1rem; border-radius: 4px; }
    a:hover { background: rgba(6,182,212,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <div class="prompt">$ cd /</div>
    <h1>404</h1>
    <p>// repo not found</p>
    <a href="/">← return home</a>
  </div>
</body>
</html>`);
});

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
