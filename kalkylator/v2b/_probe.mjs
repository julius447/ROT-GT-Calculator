/* Tillståndsprov för v2b: mäter rytmen, renderar de fyra tillstånden och skriver JSON.
   Kör: node kalkylator/v2b/_probe.mjs  (från repots rot). Skärmdumpar -> kalkylator/v2b/skarmdumpar/ */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http';
import { readFile, stat, mkdir } from 'fs/promises';
import { join, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const ut = join(here, 'skarmdumpar');
await mkdir(ut, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
});
const port = 8130 + Math.floor(Math.random() * 300);
await new Promise((r) => server.listen(port, r));
const url = (m) => `http://localhost:${port}/kalkylator/v2b/index.html?m=${m}`;

const browser = await chromium.launch();
const out = { errors: [] };

const rect = (page, sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom }; }, sel);
const round = (n) => Math.round(n * 10) / 10;
const lasBand = async (page) => ({
  status: await page.getAttribute('#avdragskollen', 'data-status'),
  etikett: (await page.textContent('#rk-etikett')).trim(),
  tal: (await page.isHidden('#rk-utfall')) ? null : (await page.textContent('#rk-tal')).replace(/\s+/g, ' ').trim(),
  per: (await page.isHidden('#rk-utfall')) ? null : (await page.textContent('#rk-per')).trim(),
  not: (await page.isHidden('#rk-not')) ? null : (await page.textContent('#rk-not')).trim(),
  stopp: (await page.isHidden('#rk-stopp')) ? null : (await page.textContent('#rk-stopp-text')).trim(),
  kortHojd: round((await rect(page, '.rk__card')).h),
});
const klipp = async (page, fil) => {
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.waitForTimeout(250);                       /* fokusringens transition (160 ms) ska hinna klinga av */
  const r = await rect(page, '.rk');
  await page.screenshot({ path: join(ut, fil), clip: { x: Math.max(0, r.x - 24), y: Math.max(0, r.y - 24), width: r.w + 48, height: r.h + 48 } });
};
const aterstall = async (page) => {
  await page.click('label:has(input[name="ager"][value="ja"])');
  await page.click('label:has(input[name="aldre"][value="ja"])');
  await page.click('label:has(input[name="typ"][value="lon"])');
  await page.fill('#rk-inkomst', '');
};

for (const [namn, w, h] of [['desktop', 1440, 1000], ['mobil', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => out.errors.push(`${namn}: ${e}`));
  page.on('console', (m) => { if (m.type() === 'error') out.errors.push(`${namn}: ${m.text()}`); });
  await page.goto(url('rot'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  /* 1. Rytmen (getBoundingClientRect) */
  const q1f = await rect(page, '#rk-q1'), q1u = await rect(page, '#rk-q1-under'), q1k = await rect(page, '[aria-labelledby="rk-q1"]');
  const q2f = await rect(page, '#rk-q2'), q2k = await rect(page, '[aria-labelledby="rk-q2"]');
  const q3f = await rect(page, '#rk-q3'), q3k = await rect(page, '.rk__inkomst [role="radiogroup"]'), inp = await rect(page, '#rk-inkomst');
  const h2 = await rect(page, '#rk-h2'), kort = await rect(page, '.rk__card'), fragor = await rect(page, '.rk__fragor'), band = await rect(page, '.rk__band');
  const etik = await rect(page, '#rk-etikett'), tal = await rect(page, '#rk-tal'), num = await rect(page, '#rk-num'), per = await rect(page, '.rk__sub');
  const seg = await rect(page, '[aria-labelledby="rk-q1"] > label');
  const fs = await page.evaluate(() => {
    const g = (s, p) => getComputedStyle(document.querySelector(s))[p];
    return {
      h2: g('#rk-h2', 'fontSize') + ' / ' + g('#rk-h2', 'fontWeight') + ' / lh ' + g('#rk-h2', 'lineHeight'),
      fraga: g('#rk-q1', 'fontSize') + ' / ' + g('#rk-q1', 'fontWeight'),
      under: g('#rk-q1-under', 'fontSize') + ' / ' + g('#rk-q1-under', 'fontWeight'),
      segmentText: g('[aria-labelledby="rk-q1"] > label', 'fontSize') + ' / ' + g('[aria-labelledby="rk-q1"] > label', 'fontWeight'),
      input: g('#rk-inkomst', 'fontSize') + ' / ' + g('#rk-inkomst', 'fontWeight'),
      etikett: g('#rk-etikett', 'fontSize') + ' / ' + g('#rk-etikett', 'fontWeight') + ' / ls ' + g('#rk-etikett', 'letterSpacing'),
      tal: g('#rk-num', 'fontSize') + ' / ' + g('#rk-num', 'fontWeight') + ' / ' + g('#rk-num', 'fontVariantNumeric'),
      prefix: g('#rk-prefix', 'fontSize') + ' / ' + g('#rk-prefix', 'fontWeight'),
      per: g('.rk__sub', 'fontSize') + ' / ' + g('.rk__sub', 'fontWeight'),
      stoppText: g('#rk-stopp-text', 'fontSize'),
      q2Rader: Math.round(document.querySelector('#rk-q2').getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector('#rk-q2')).lineHeight)),
      q1UnderRader: Math.round(document.querySelector('#rk-q1-under').getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector('#rk-q1-under')).lineHeight)),
      textbredd: (() => { const m = (el) => { const r = document.createRange(); r.selectNodeContents(el); const w = Array.from(r.getClientRects()); return Math.round(Math.max(...w.map((x) => x.width))); };
        const c = document.createElement('span'); c.style.cssText = 'position:absolute;white-space:nowrap;visibility:hidden;font:500 20px Outfit'; c.textContent = 'Är bostaden äldre än fem år?'; document.body.appendChild(c); const q2 = c.getBoundingClientRect().width;
        c.style.font = '400 16px Outfit'; c.textContent = 'Villa, radhus eller lägenhet. Helt eller delvis.'; const u1 = c.getBoundingClientRect().width;
        c.textContent = 'Yngre än fem år: ROT gäller bara reparationer.'; const not = c.getBoundingClientRect().width; c.remove();
        return { 'Q2 en rad': Math.round(q2), 'Q1 underrad en rad': Math.round(u1), 'femårsraden': Math.round(not) }; })(),
    };
  });
  out[namn] = {
    viewport: `${w}x${h}`,
    typografi: fs,
    rytm: {
      'H2 -> kort': round(kort.y - h2.b),
      'kortpadding topp (kort -> fråga)': round(q1f.y - kort.y),
      'fråga -> underrad (Q1)': round(q1u.y - q1f.b),
      'underrad -> kontroll (Q1)': round(q1k.y - q1u.b),
      'fråga -> kontroll (Q2)': round(q2k.y - q2f.b),
      'fråga -> kontroll (Q3)': round(q3k.y - q3f.b),
      'kontroll -> band (hårlinje)': round(band.y - q1k.b),
      'band: hårlinje -> etikett': round(etik.y - band.y),
      'etikett -> tal': round(tal.y - etik.b),
      'tal -> per person': round(per.y - tal.b),
      'per person -> kortets kant': round(band.b - per.b),
      'fråga -> fråga (mobil, Q1-kontroll -> Q2-fråga)': namn === 'mobil' ? round(q2f.y - q1k.b) : null,
    },
    matt: {
      kortBredd: round(kort.w), kortHojd: round(kort.h), fragorHojd: round(fragor.h), bandHojd: round(band.h),
      segmentHojd: round(q1k.h), segmentBredd: round(q1k.w), optionHojd: round(seg.h), optionBredd: round(seg.w),
      inputHojd: round(inp.h), inputBredd: round(inp.w), typSegmentBredd: round(q3k.w),
      kolumnbredder: [round(q1f.w), round(q2f.w), round(q3f.w)],
      talHojd: round(num.h), talBredd: round(tal.w),
    },
    overflowX: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
  };

  /* 2. De fyra tillstånden */
  const st = {};
  st.start = await lasBand(page);
  await page.click('label:has(input[name="ager"][value="nej"])'); await page.waitForTimeout(350);
  st.nejAgande = await lasBand(page); await klipp(page, `${namn}-1-nej-agande.png`);
  await page.click('label:has(input[name="ager"][value="ja"])'); await page.waitForTimeout(350);
  st.jaIgen = await lasBand(page);
  await page.click('label:has(input[name="aldre"][value="nej"])'); await page.waitForTimeout(350);
  st.nejFemAr = await lasBand(page); await klipp(page, `${namn}-2-nej-fem-ar.png`);
  await page.click('label:has(input[name="aldre"][value="ja"])');
  await page.fill('#rk-inkomst', '180000'); await page.waitForTimeout(350);
  st.lon180k = await lasBand(page); st.lon180k.falt = await page.inputValue('#rk-inkomst'); await klipp(page, `${namn}-3-lon-180000.png`);
  await page.click('label:has(input[name="typ"][value="pension"])'); await page.fill('#rk-inkomst', '240000'); await page.waitForTimeout(350);
  st.pension240k = await lasBand(page); st.pension240k.falt = await page.inputValue('#rk-inkomst'); await klipp(page, `${namn}-4-pension-240000.png`);
  await page.click('label:has(input[name="typ"][value="lon"])'); await page.waitForTimeout(350);
  st.tillbakaLon240k = await lasBand(page);
  await page.fill('#rk-inkomst', '600000'); await page.waitForTimeout(200);
  st.lon600k = await lasBand(page);
  await aterstall(page); await page.waitForTimeout(350);
  st.aterstalld = await lasBand(page); await klipp(page, `${namn}-0-utgangslage.png`);
  out[namn].tillstand = st;
  out[namn].overflowXEfter = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  /* 3. Grön teknik: rubrik, etikett och stoppets mening */
  await page.goto(url('gt'), { waitUntil: 'networkidle' });
  const gt = { h2: (await page.textContent('#rk-h2')).trim(), ...(await lasBand(page)) };
  await page.click('label:has(input[name="ager"][value="nej"])'); await page.waitForTimeout(350);
  gt.nejAgande = await lasBand(page); await klipp(page, `${namn}-gt-nej-agande.png`);
  await page.click('label:has(input[name="ager"][value="ja"])'); await page.click('label:has(input[name="aldre"][value="nej"])'); await page.waitForTimeout(350);
  gt.nejFemAr = await lasBand(page);
  out[namn].gt = gt;

  /* 4. Tangentbord: tab till första segmentet, pil höger = Nej */
  await page.goto(url('rot'), { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(350);
  out[namn].tangentbord = { efterPilHoger: (await lasBand(page)).status, fokusRing: await page.evaluate(() => getComputedStyle(document.querySelector('label:has(input[name="ager"]:focus-visible)') || document.body).boxShadow) };
  await page.close();
}
await browser.close(); server.close();
console.log(JSON.stringify(out, null, 1));
