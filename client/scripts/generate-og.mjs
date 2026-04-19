#!/usr/bin/env node
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0d0d0d"/>

  <!-- JF monogram card -->
  <rect x="450" y="115" width="300" height="300" rx="48" fill="#0d0d0d" stroke="#06b6d4" stroke-opacity="0.4" stroke-width="2"/>
  <text x="600" y="310" font-family="monospace" font-size="160" font-weight="700" fill="#06b6d4" text-anchor="middle">JF</text>

  <!-- URL -->
  <text x="600" y="490" font-family="monospace" font-size="28" fill="#e2e8f0" fill-opacity="0.4" text-anchor="middle">joeyfarah.dev</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
});
const png = resvg.render().asPng();

const out = resolve(__dirname, '..', 'public', 'og-v2.png');
writeFileSync(out, png);
console.log(`[og] wrote ${out} (${png.length} bytes)`);
