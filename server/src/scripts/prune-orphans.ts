import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const ORPHAN_SLUGS = [
  'oracle-db-mapper',
  'conversion-automation',
  'fitness-ring-analytics',
];

async function main(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    process.stderr.write('[prune] ERROR: MONGODB_URI environment variable is not set.\n');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  const result = await mongoose.connection
    .collection('blocks')
    .deleteMany({ slug: { $in: ORPHAN_SLUGS } });
  await mongoose.disconnect();

  process.stdout.write(
    `[prune] Deleted ${result.deletedCount} orphan block(s): ${ORPHAN_SLUGS.join(', ')}\n`
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  process.stderr.write(`[prune] Unexpected error: ${(err as Error).message}\n`);
  process.exit(1);
});
