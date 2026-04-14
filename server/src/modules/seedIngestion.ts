import * as fs from 'fs';
import { BentoBlockArraySchema } from 'shared/schemas';
import type { BentoBlock } from 'shared/types';
import { SeedValidationError } from './seedIngestion.errors';

/**
 * Reads a JSON seed file and validates every block with BentoBlockArraySchema.
 * Throws SeedValidationError (with .slug and .field) on the first invalid block.
 * Returns the validated BentoBlock[] on success.
 */
export async function ingestSeed(filePath: string): Promise<BentoBlock[]> {
  const raw = fs.readFileSync(filePath, { encoding: 'utf-8' });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new SeedValidationError(
      '(unknown)',
      '(json)',
      `Seed file is not valid JSON: ${(err as Error).message}`,
    );
  }

  const result = BentoBlockArraySchema.safeParse(parsed);

  if (!result.success) {
    // Extract the first error to produce a targeted message
    const firstIssue = result.error.issues[0];

    // Path looks like: [0, "content", "lines"] or [0, "slug"] etc.
    const indexInPath = firstIssue.path[0];
    const fieldPath = firstIssue.path.slice(1).join('.') || firstIssue.path.join('.');

    // Try to recover the slug from the raw array for a better error message
    let slug = '(unknown)';
    if (
      Array.isArray(parsed) &&
      typeof indexInPath === 'number' &&
      parsed[indexInPath] != null &&
      typeof (parsed[indexInPath] as Record<string, unknown>).slug === 'string'
    ) {
      slug = (parsed[indexInPath] as Record<string, unknown>).slug as string;
    }

    const field = fieldPath || String(firstIssue.path[0] ?? '(unknown)');

    throw new SeedValidationError(
      slug,
      field,
      `Seed validation failed for block "${slug}" at field "${field}": ${firstIssue.message}`,
    );
  }

  // Zod infer type matches BentoBlock — cast is safe because schemas and types
  // are co-generated from the same definitions.
  return result.data as unknown as BentoBlock[];
}
