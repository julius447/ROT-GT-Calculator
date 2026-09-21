#!/usr/bin/env node
/*
 * skarmdumpar.mjs: bilderna till leveransen (produktion/skarmdumpar/), tagna ur produktion/preview/artikel-rot|gt.html,
 * alltså paketet (dist/ by reference) överst i artikelmallen. Kör: node produktion/_build/skarmdumpar.mjs
 *
 *   desktop-{rot|gt}-sida.png          1440 px, sidans topp t.o.m. kalkylatorn och början av Snabbt svar (sammanhanget)
 *   desktop-{rot|gt}-kalkylator.png    1440 px, rubrik + kort + luften ned till Snabbt svar (två spalter)
 *   desktop-{rot|gt}-exempel.png       1440 px, kortet med 300 000 i inkomst ("ca 31 000 kr")
 *   ipad-{rot|gt}-kalkylator.png       1024 px stående (staplat kort i artikelspalten)
 *   mobil-{rot|gt}-1.png, -2.png       390×844 (iPhone-mått, touch): två skärmar ur sidan, frågorna resp. beskedet
 *
 * Chromium, dsf 2, animationer avstängda. Bilderna från ampy.se (artikelns) hämtas live; typsnittet ur dist/fonts.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(dirname(HERE));
const UT = join(dirname(HERE), 'skarmdumpar');
const { chromium } = await import(join(ROOT, 'tools/node_modules/playwright/index.mjs'));

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.startsWith('/wp-content/uploads/fonts/')) p = '/produktion/dist/fonts/' + p.slice('/wp-content/uploads/fonts/'.length);
    let f = join(ROOT, p);
    if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(f)] || 'application/octet-stream' });
    res.end(await readFile(f));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;
await mkdir(UT, { recursive: true });

const browser = await chromium.launch();
const SEC = { rot: '#ak1-avdragskollen', gt: '#ak2-avdragskollen' };
const NASTA = '#brxe-vjjqxy';   // Snabbt svar-kortet, blocket efter kalkylatorn
const open = async (ctx, m) => {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/produktion/preview/artikel-${m}.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return page;
};
/* rubrik + kort + luften ned till Snabbt svar (+ 56 px av det kortet så avståndet syns), spaltens bredd + 16 px */
const klippKalkylator = (page, sec) => page.evaluate(({ sec, nasta }) => {
  const s = document.querySelector(sec), w = s.closest('.ampy-avdragskollen');
  const h = w.querySelector('.rk__rubrik').getBoundingClientRect(), sp = document.querySelector('#brxe-pfbtud').getBoundingClientRect(), n = document.querySelector(nasta).getBoundingClientRect();
  const x = Math.max(0, Math.floor(sp.left) - 16), y = Math.floor(h.top + scrollY) - 8;
  return { x, y, width: Math.min(Math.ceil(sp.width) + 32, document.documentElement.clientWidth - x), height: Math.ceil(n.top + scrollY + 56) - y };
}, { sec, nasta: NASTA });
const spara = async (page, namn, opts) => { const b = await page.screenshot({ animations: 'disabled', ...opts }); await writeFile(join(UT, namn), b); console.log(namn, (b.length / 1024).toFixed(0) + ' kB'); };

for (const m of ['rot', 'gt']) {
  /* desktop 1440 */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await open(ctx, m);
    const k = await klippKalkylator(page, SEC[m]);
    await spara(page, `desktop-${m}-sida.png`, { fullPage: true, clip: { x: 0, y: 0, width: 1440, height: k.y + k.height } });
    await spara(page, `desktop-${m}-kalkylator.png`, { fullPage: true, clip: k });
    const f = page.locator(`${SEC[m]} [data-falt="inkomst"]`).first();
    await f.fill('300000'); await f.blur(); await page.mouse.move(0, 0); await page.waitForTimeout(700);
    const k2 = await klippKalkylator(page, SEC[m]);
    await spara(page, `desktop-${m}-exempel.png`, { fullPage: true, clip: k2 });
    await ctx.close();
  }
  /* iPad stående 1024 */
  {
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 1366 }, hasTouch: true, deviceScaleFactor: 2 });
    const page = await open(ctx, m);
    await spara(page, `ipad-${m}-kalkylator.png`, { fullPage: true, clip: await klippKalkylator(page, SEC[m]) });
    await ctx.close();
  }
  /* mobil 390 (iPhone-mått): två skärmar, rubriken överst resp. beskedet överst */
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await open(ctx, m);
    /* två skärmar (390×844) ur helsidan: rubriken överst resp. beskedet överst. Klipp ur fullPage i stället för
       viewport-dump: i mobil-emuleringen ritar Chromium den fasta headern på fel höjd i en viewport-dump, och utan
       sajtens JS ligger den ändå bara på sidans topp. Skärmarna visar alltså sidan utan den klistrade headern. */
    const y1 = await page.evaluate((sec) => { const w = document.querySelector(sec).closest('.ampy-avdragskollen'); return Math.floor(w.querySelector('.rk__rubrik').getBoundingClientRect().top + scrollY - 16); }, SEC[m]);
    await spara(page, `mobil-${m}-1.png`, { fullPage: true, clip: { x: 0, y: y1, width: 390, height: 844 } });
    const y2 = await page.evaluate((sec) => Math.floor(document.querySelector(sec + ' .rk__panel').getBoundingClientRect().top + scrollY - 16), SEC[m]);
    await spara(page, `mobil-${m}-2.png`, { fullPage: true, clip: { x: 0, y: y2, width: 390, height: 844 } });
    await ctx.close();
  }
}
await browser.close(); server.close();
console.log('KLART:', UT);
