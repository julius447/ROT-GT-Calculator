import { chromium } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
const root = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => { try { let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); } });
await new Promise((r) => server.listen(0, r)); const port = server.address().port;
const browser = await chromium.launch();
for (const [name, url] of [['v1', `/kalkylator/v1/index.html?m=rot`], ['artikel', `/kalkylator/artikel/index.html?p=hoger&m=rot`]]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route(/ampy\.se/, r => r.abort()); // no live CSS: isolate our own files
  await page.goto(`http://localhost:${port}${url}`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(600);
  await page.keyboard.press('Tab'); // move focus from body
  await page.evaluate(() => document.querySelector('#rk-inkomst-1').focus());
  await page.keyboard.press('Shift'); await page.waitForTimeout(400);
  const r = await page.evaluate(() => { const i = document.querySelector('#rk-inkomst-1'); const cs = getComputedStyle(i); return { active: document.activeElement.id, fv: i.matches(':focus-visible'), boxShadow: cs.boxShadow, border: cs.borderColor, outline: cs.outlineStyle + ' ' + cs.outlineWidth }; });
  console.log(name, JSON.stringify(r)); await page.close();
}
await browser.close(); server.close();
