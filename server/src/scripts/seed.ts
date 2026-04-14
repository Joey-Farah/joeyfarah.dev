import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { ingestSeed } from '../modules/seedIngestion';
import { SeedValidationError } from '../modules/seedIngestion.errors';
import { MongoBlockRepository } from '../repositories/MongoBlockRepository';

const SEED_FILE = path.resolve(__dirname, '../../seed/blocks.seed.json');

async function main(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    process.stderr.write('[seed] ERROR: MONGODB_URI environment variable is not set.\n');
    process.stderr.write('[seed] Set MONGODB_URI to your MongoDB Atlas connection string and re-run.\n');
    process.exit(1);
  }

  let blocks;
  try {
    blocks = await ingestSeed(SEED_FILE);
  } catch (err) {
    if (err instanceof SeedValidationError) {
      process.stderr.write(`[seed] Validation error: ${err.message}\n`);
      process.exit(1);
    }
    throw err; // unexpected errors bubble up
  }

  await mongoose.connect(MONGODB_URI);
  const repo = new MongoBlockRepository();
  await repo.upsertBlocks(blocks);
  await mongoose.disconnect();

  process.stdout.write(`[seed] Successfully upserted ${blocks.length} blocks.\n`);
  process.exit(0);
}

main().catch((err: unknown) => {
  process.stderr.write(`[seed] Unexpected error: ${(err as Error).message}\n`);
  process.exit(1);
});
