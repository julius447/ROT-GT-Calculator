/* R1: mäter fråga -> kontroll i v2b på desktop (bevis för v2b-1). Kör: node kalkylator/_review/r1-gap-v2b.mjs */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http'; import { readFile, stat } from 'fs/promises'; import { join, extname } from 'path';
import { dirname, resolve } from "path"; import { fileURLToPath } from "url"; const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => { try { let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); } });
await new Promise((r) => server.listen(9123, r));
const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:9123/kalkylator/v2b/index.html?m=rot', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => { const q = (s) => document.querySelector(s).getBoundingClientRect(); const gap = (a, c) => Math.round((q(c).top - q(a).bottom) * 10) / 10;
  return { q1: gap('#rk-q1', 'label:has(input[name="ager"][value="ja"])'), q1underTillKontroll: gap('#rk-q1-under', 'label:has(input[name="ager"][value="ja"])'), q2: gap('#rk-q2', 'label:has(input[name="aldre"][value="ja"])'), q3: gap('#rk-q3', 'label:has(input[name="typ"][value="lon"])') }; });
console.log('v2b desktop fråga -> kontroll (px):', JSON.stringify(r));
await b.close(); server.close();
