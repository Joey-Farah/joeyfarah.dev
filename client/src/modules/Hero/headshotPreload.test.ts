import { readFileSync } from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { HEADSHOT_SRC } from './HeadshotFrame';

const indexHtml = readFileSync(path.resolve(__dirname, '../../../index.html'), 'utf8');
const preload = indexHtml.match(/<link[^>]*rel="preload"[^>]*as="image"[^>]*>/)?.[0] ?? '';

describe('headshot preload (client/index.html)', () => {
  it('preloads the same file HeadshotFrame renders', () => {
    expect(preload).toContain(`href="${HEADSHOT_SRC}"`);
  });

  it('skips the download for reduced-motion visitors, who never see the hero', () => {
    expect(preload).toContain('media="(prefers-reduced-motion: no-preference)"');
  });
});
