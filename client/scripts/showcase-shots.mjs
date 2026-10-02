// Regenerates the phone-sized preview images used on /showcase.
// Usage: npm run shots --workspace=client   (needs Google Chrome and cwebp)
//
// Serves client/public on a local port, opens each concept in headless Chrome
// inside a 390px-wide iframe (Chrome won't size a window that narrow), and
// crops the screenshot to the iframe. Writes client/public/showcase/shots/<slug>.webp.

import { createServer } from 'node:http';
import { existsSync, readdirSync, readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Async on purpose: a sync exec would block this process's own server while Chrome waits on it.
const run = promisify(execFile);
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 390, H = 700, SCALE = 2;
const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const showcaseDir = path.join(publicDir, 'showcase');
const TYPES = { '.html': 'text/html', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = createServer((req, res) => {
  let p = path.join(publicDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(path.join(p, 'index.html'))) p = path.join(p, 'index.html');
  if (!p.startsWith(publicDir) || !existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] ?? 'application/octet-stream' }).end(readFileSync(p));
}).listen(0);
const port = server.address().port;

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(showcaseDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(path.join(showcaseDir, d.name, 'index.html')))
      .map((d) => d.name);

const tmp = mkdtempSync(path.join(tmpdir(), 'shots-'));
for (const slug of slugs) {
  const frame = path.join(tmp, `${slug}.html`);
  const png = path.join(tmp, `${slug}.png`);
  writeFileSync(frame, `<body style="margin:0"><iframe src="http://localhost:${port}/showcase/${slug}/" style="width:${W}px;height:${H}px;border:0;display:block"></iframe></body>`);
  await run(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--force-device-scale-factor=${SCALE}`,
    '--virtual-time-budget=5000', `--window-size=600,${H}`, `--screenshot=${png}`, `file://${frame}`]);
  const out = path.join(showcaseDir, 'shots', `${slug}.webp`);
  await run('cwebp', ['-quiet', '-q', '82', '-crop', '0', '0', String(W * SCALE), String(H * SCALE), png, '-o', out]);
  console.log(`✓ ${path.relative(publicDir, out)}`);
}
server.close();
