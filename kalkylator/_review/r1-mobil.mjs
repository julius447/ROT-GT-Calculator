/* R1 mobilprob: (1) iPhone-fönster 390 x 664 (Safari med fält uppe/nere): var ligger talet, sista kontrollen
   och stoppbeskedet i förhållande till vikningen? (2) Tangentbord uppe: synligt fönster ca 390 x 370 (664 minus
   ca 294 px tangentbord med "Klar"-rad): när fältet är i fokus och inskrollat, syns talet samtidigt?
   (3) Avstånd fråga 1 -> reaktion (stoppbeskedet) på mobil. (4) Beloppsfältets bredd: ryms "1 000 000"?
   Kör: node kalkylator/_review/r1-mobil.mjs */
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
const port = 8900 + Math.floor(Math.random() * 90);
await new Promise((r) => server.listen(port, r));

const SEL = {
  v1:  { tal: '#rk-tal', stopp: '#rk-stopp', input: '#rk-inkomst', kort: '#avdragskollen' },
  v2b: { tal: '#rk-num', stopp: '#rk-stopp', input: '#rk-inkomst', kort: '.rk__card' },
  v3:  { tal: '#ak-siffra', stopp: '#ak-stopp', input: '#ak-inkomst', kort: '.ak__kort' },
};
const q1nej = 'label:has(input[name="ager"][value="nej"])';
const browser = await chromium.launch();
const out = {};
const r1 = (n) => Math.round(n * 10) / 10;

for (const v of ['v1', 'v2b', 'v3']) {
  const S = SEL[v];
  const url = `http://localhost:${port}/kalkylator/${v}/index.html?m=rot`;
  out[v] = {};

  /* (1) + (3): 390 x 664 utan tangentbord */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
    const pos = await page.evaluate((S) => {
      const b = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
      return { tal: b(S.tal), input: b(S.input), q1: b('label:has(input[name="ager"][value="nej"])'), kort: b(S.kort), vh: innerHeight };
    }, S);
    await page.click(q1nej); await page.waitForTimeout(400);
    const stopp = await page.evaluate((S) => { const r = document.querySelector(S.stopp).getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; }, S);
    await page.screenshot({ path: join(here, 'shots', `${v}-mobil-664-ager-nej.png`) });
    out[v].fonster664 = {
      talTop: pos.tal.top, talBottom: pos.tal.bottom, talHeltSynligt: pos.tal.bottom <= 664,
      sistaKontrollTop: pos.input.top, sistaKontrollBottom: pos.input.bottom, sistaKontrollHeltSynlig: pos.input.bottom <= 664,
      kortBottom: pos.kort.bottom,
      stoppTop: stopp.top, stoppBottom: stopp.bottom, stoppHeltSynligt: stopp.bottom <= 664,
      avstandQ1TillStopp: r1(Math.abs(stopp.top - pos.q1.top)),
    };
    await page.close();
  }

  /* (2): tangentbord uppe = 390 x 370, fältet fokuserat och inskrollat */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 370 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
    await page.focus(S.input);
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'nearest' }), S.input);
    await page.keyboard.type('180000'); await page.waitForTimeout(400);
    const res = await page.evaluate((S) => {
      const b = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
      const tal = b(S.tal), input = b(S.input);
      return { tal, input, vh: innerHeight, talSynligtMedTangentbord: tal.top >= 0 && tal.bottom <= innerHeight, faltSynligt: input.top >= 0 && input.bottom <= innerHeight };
    }, S);
    await page.screenshot({ path: join(here, 'shots', `${v}-mobil-tangentbord-370.png`) });
    out[v].tangentbord370 = res;
    await page.close();
  }

  /* (4): ryms 1 000 000 i fältet? (desktop 1440 där fältet är smalast i v2b/v3) */
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
    await page.focus(S.input); await page.keyboard.type('1000000'); await page.waitForTimeout(200);
    const f = await page.evaluate((S) => { const el = document.querySelector(S.input); return { varde: el.value, bredd: Math.round(el.clientWidth), scrollW: el.scrollWidth, klipps: el.scrollWidth > el.clientWidth, tal: document.querySelector(S.tal).textContent }; }, S);
    out[v].faltMiljon = f;
    await page.close();
  }
}
await browser.close(); server.close();
await writeFile(join(here, 'r1-mobil.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
