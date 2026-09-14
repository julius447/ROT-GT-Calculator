/* R1 a11y-prob: (1) hur många DOM-mutationer får aria-live-regionen när man skriver "180000" (= hur många
   gånger en skärmläsare får beskedet uppläst)? (2) Är segmentets 4 px spårkant tryckbar, eller är den
   verkliga tap-ytan bara alternativets 40 px? (3) Läsordning i DOM vs visuellt för fråga 1 (v3 desktop).
   Kör: node kalkylator/_review/r1-a11y.mjs */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http';
import { readFile, stat, writeFile } from 'fs/promises';
import { join, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
});
const port = 9000 + Math.floor(Math.random() * 90);
await new Promise((r) => server.listen(port, r));

const SEL = {
  v1:  { live: '#rk-resultat', input: '#rk-inkomst', under: '.rk__under', kontroll: '[data-q="ager"]' },
  v2b: { live: '.rk__varde', input: '#rk-inkomst', under: '#rk-q1-under', kontroll: '.rk__q .rk__seg' },
  v3:  { live: '#ak-hero', input: '#ak-inkomst', under: '.ak__under', kontroll: '.ak__fraga .ak__seg' },
};
const browser = await chromium.launch();
const out = {};

for (const v of ['v1', 'v2b', 'v3']) {
  const S = SEL[v];
  out[v] = {};
  for (const [vp, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(`http://localhost:${port}/kalkylator/${v}/index.html?m=rot`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    /* (1) mutationer i live-regionen per tangent */
    await page.evaluate((S) => {
      const el = document.querySelector(S.live);
      window.__mut = []; window.__batch = 0;
      new MutationObserver((recs) => { window.__batch++; window.__mut.push(recs.length); }).observe(el, { subtree: true, childList: true, characterData: true, attributes: true });
      window.__liveAttr = { ariaLive: el.getAttribute('aria-live'), atomic: el.getAttribute('aria-atomic'), text: el.innerText.replace(/\s+/g, ' ').trim() };
    }, S);
    await page.focus(S.input);
    for (const ch of '180000') { await page.keyboard.type(ch); await page.waitForTimeout(80); }
    const live = await page.evaluate(() => ({ attr: window.__liveAttr, batchar: window.__batch, mutationer: window.__mut.reduce((a, b) => a + b, 0) }));

    /* (2) tap-yta: tryck 2 px innanför spårets överkant ovanför "Nej" (i spårets padding, utanför label) */
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(200);
    const tap = await page.evaluate((S) => {
      const seg = document.querySelector(S.kontroll);
      const nej = seg.querySelector('label:has(input[value="nej"])');
      const s = seg.getBoundingClientRect(), n = nej.getBoundingClientRect();
      return { sparHojd: Math.round(s.height), labelHojd: Math.round(n.height), x: Math.round(n.left + n.width / 2), yPadding: Math.round(s.top + 2), yLabel: Math.round(n.top + 2) };
    }, S);
    await page.mouse.click(tap.x, tap.yPadding); await page.waitForTimeout(150);
    const valtEfterPaddingKlick = await page.evaluate(() => document.querySelector('input[name="ager"]:checked').value);
    await page.mouse.click(tap.x, tap.yLabel); await page.waitForTimeout(150);
    const valtEfterLabelKlick = await page.evaluate(() => document.querySelector('input[name="ager"]:checked').value);

    /* (3) DOM-ordning vs visuell ordning för fråga 1: ligger underraden före eller efter kontrollen? */
    const ordning = await page.evaluate((S) => {
      const under = document.querySelector(S.under), kontroll = document.querySelector(S.kontroll);
      const domUnderForst = !!(under.compareDocumentPosition(kontroll) & Node.DOCUMENT_POSITION_FOLLOWING);
      const visuelltUnderForst = under.getBoundingClientRect().top < kontroll.getBoundingClientRect().top;
      return { domUnderForst, visuelltUnderForst, stammer: domUnderForst === visuelltUnderForst };
    }, S);

    out[v][vp] = { live, tap: { ...tap, valtEfterPaddingKlick, valtEfterLabelKlick, spårkantTryckbar: valtEfterPaddingKlick === 'nej' }, ordning };
    await page.close();
  }
}
await browser.close(); server.close();
await writeFile(join(here, 'r1-a11y.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
