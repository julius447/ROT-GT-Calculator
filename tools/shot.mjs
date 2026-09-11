// Render-and-look helper for the wireframes.
// Usage: node tools/shot.mjs <relative-path-under-repo> <outprefix> [--port 8099] [--scroll]
//   Starts a static server for the repo root, screenshots desktop (1440x1000) and mobile (390x844),
//   full page, and prints the measured document height per viewport (the embed budget check).
// Example: node tools/shot.mjs wireframes/a-villkorstavlan/index.html _shots/a
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { resolve, join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [,, file, prefix, ...rest] = process.argv;
if (!file || !prefix) { console.error('usage: node tools/shot.mjs <file.html> <outprefix> [--port N] [--query "?m=gt"]'); process.exit(1); }
const port = Number((rest[rest.indexOf('--port') + 1]) || 0) || 8090 + Math.floor(Math.random() * 500);
const query = rest.includes('--query') ? rest[rest.indexOf('--query') + 1] : '';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let fp = join(root, p);
    if ((await stat(fp)).isDirectory()) fp = join(fp, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(fp)] || 'application/octet-stream' });
    res.end(await readFile(fp));
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise(r => server.listen(port, r));
const url = `http://localhost:${port}/${file}${query}`;
const browser = await chromium.launch();
const out = {};
for (const [name, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.screenshot({ path: `${prefix}-${name}.png`, fullPage: true });
  out[name] = { height, overflowX: overflow, errors };
  await page.close();
}
await browser.close();
server.close();
console.log(JSON.stringify({ url, ...out }, null, 1));
