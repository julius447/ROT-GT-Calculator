// Renderar tillstånden för hushållsversionen: två personer, allt använt, 18 nej, gt. Skriver PNG till _shots/h-*.png
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]); const f = join(root, p);
  let d; try { d = await readFile(f); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': mime[extname(f)] || 'application/octet-stream' }); res.end(d);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;
const browser = await chromium.launch();
const steg = {
  'tva-personer': async (p) => { await p.click('#rk-lagg'); await p.fill('#rk-inkomst-1', '600000'); await p.fill('#rk-inkomst-2', '240000'); await p.click('label:has(input[name="typ-2"][value="pension"])'); await p.locator('#rk-inkomst-2').blur(); },
  'allt-anvant': async (p) => { await p.fill('#rk-anvant-1', '50000'); await p.locator('#rk-anvant-1').blur(); },
  'delvis-anvant': async (p) => { await p.fill('#rk-inkomst-1', '180000'); await p.fill('#rk-anvant-1', '5000'); await p.locator('#rk-anvant-1').blur(); },
  'arton-nej': async (p) => { await p.click('label:has(input[name="myndig"][value="nej"])'); },
  'fyra-personer': async (p) => { for (let i = 0; i < 3; i++) await p.click('#rk-lagg'); },
};
for (const [vp, opts] of [['desktop', { viewport: { width: 1440, height: 1000 } }], ['mobil', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  for (const [namn, fn] of Object.entries(steg)) {
    for (const m of (namn === 'tva-personer' ? ['rot', 'gt'] : ['rot'])) {
      const ctx = await browser.newContext(opts); const page = await ctx.newPage();
      const errors = []; page.on('pageerror', e => errors.push(String(e)));
      await page.goto(`http://localhost:${port}/kalkylator/v1/index.html?m=${m}`); await page.waitForTimeout(300);
      await fn(page); await page.waitForTimeout(700);
      const h = await page.evaluate(() => Math.round(document.querySelector('.rk').getBoundingClientRect().height));
      const text = (await page.locator('.rk__panel').innerText()).replace(/\s+/g, ' ');
      await page.screenshot({ path: `_shots/h-${namn}-${m}-${vp}.png`, fullPage: true });
      console.log(vp, namn, m, 'kort', h, '|', text, errors.length ? errors : '');
      await ctx.close();
    }
  }
}
await browser.close(); server.close();
