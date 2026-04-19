#!/usr/bin/env node
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d0d0d"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <pattern id="grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#06b6d4" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Terminal chrome bar -->
  <rect x="60" y="60" width="1080" height="40" rx="4" fill="#000000" fill-opacity="0.5" stroke="#06b6d4" stroke-opacity="0.2"/>
  <circle cx="88" cy="80" r="6" fill="#ef4444"/>
  <circle cx="108" cy="80" r="6" fill="#eab308"/>
  <circle cx="128" cy="80" r="6" fill="#22c55e"/>
  <text x="600" y="86" font-family="JetBrains Mono, monospace" font-size="14" fill="#e2e8f0" text-anchor="middle">joeyfarah.dev</text>
  <text x="1120" y="86" font-family="JetBrains Mono, monospace" font-size="14" fill="#06b6d4" text-anchor="end">&gt;_</text>

  <!-- Main content card -->
  <rect x="60" y="100" width="1080" height="470" fill="#0d0d0d" stroke="#06b6d4" stroke-opacity="0.2"/>

  <!-- Prompt line -->
  <text x="100" y="180" font-family="JetBrains Mono, monospace" font-size="22" fill="#06b6d4">$ ./boot</text>

  <!-- Name -->
  <text x="100" y="275" font-family="JetBrains Mono, monospace" font-size="72" font-weight="700" fill="#e2e8f0">Joey Farah</text>

  <!-- Taglines -->
  <text x="100" y="335" font-family="JetBrains Mono, monospace" font-size="26" fill="#06b6d4">Oracle Cloud Technical Consultant</text>
  <text x="100" y="378" font-family="JetBrains Mono, monospace" font-size="26" fill="#06b6d4">Independent Developer</text>
  <text x="100" y="421" font-family="JetBrains Mono, monospace" font-size="26" fill="#06b6d4">Globally Ranked Gamer</text>

  <!-- URL -->
  <text x="100" y="530" font-family="JetBrains Mono, monospace" font-size="20" fill="#e2e8f0" fill-opacity="0.4">→ joeyfarah.dev</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
});
const png = resvg.render().asPng();

const out = resolve(__dirname, '..', 'public', 'og-v2.png');
writeFileSync(out, png);
console.log(`[og] wrote ${out} (${png.length} bytes)`);
