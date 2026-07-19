import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

import express from 'express';
import mongoose from 'mongoose';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createBlocksRouter } from './routes/blocks';
import { createSitemapRouter } from './routes/sitemap';
import { healthRouter } from './routes/health';
import { slippiRouter } from './routes/slippi';
import { MongoBlockRepository } from './repositories/MongoBlockRepository';

const app = express();
const PORT = process.env.PORT || 3001;

// Railway terminates TLS at its edge proxy; trust one hop so rate-limit
// keys off the real client IP instead of the proxy's.
app.set('trust proxy', 1);

// Security headers — CSP permits Google Fonts, Plausible, and GA4 (both are
// optional analytics; the <script> tags in index.html decide which, if any,
// the client actually loads).
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          'https://plausible.io',
          'https://www.googletagmanager.com',
        ],
        'connect-src': [
          "'self'",
          'https://plausible.io',
          'https://www.google-analytics.com',
        ],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'https:'],
      },
    },
  }),
);
app.use(compression());
app.use(express.json());

// Rate-limit the API so a misbehaving client can't burn bandwidth or
// pound Mongo. Static files and /healthz are intentionally excluded.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// Wire repository
const repo = new MongoBlockRepository();

// Mount API routes
app.use('/api/blocks', apiLimiter, createBlocksRouter(repo));
app.use('/api', apiLimiter, slippiRouter);
app.use('/', createSitemapRouter(repo));
app.use('/', healthRouter);

// Serve Vite production build in production — skipped on Vercel, where
// static output and SPA fallback are handled by vercel.json instead.
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    // acceptRanges: false — index.html is the SPA shell, never a ranged
    // download; a client sending a Range header (e.g. a bad crawler)
    // otherwise triggers a RangeNotSatisfiableError that isn't routed
    // through Express's error handling and crashes the process.
    res.sendFile(path.join(clientDist, 'index.html'), { acceptRanges: false }, (err) => {
      if (err && !res.headersSent) {
        res.status(500).end();
      }
    });
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

// Final error-handling middleware — safety net so an unexpected error from
// any route (e.g. a static-file send failure) returns a 500 instead of
// crashing the whole process.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cached Mongo connection — reused across warm serverless invocations so a
// Vercel function doesn't reconnect (and exhaust Atlas connections) on
// every request.
let dbConnection: Promise<typeof mongoose> | null = null;
function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }
  if (!dbConnection) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      dbConnection = null;
      throw new Error('MONGODB_URI environment variable is not set.');
    }
    dbConnection = mongoose.connect(MONGODB_URI);
  }
  return dbConnection;
}

// Standalone entrypoint (local dev, or any non-serverless host) — connects
// then listens. Vercel instead imports { app, connectDB } from api/index.ts
// and never reaches this branch.
if (require.main === module) {
  connectDB()
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

export { app, connectDB };
