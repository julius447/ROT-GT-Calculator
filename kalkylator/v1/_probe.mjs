/* Tillståndsprob för v1 "Två spalter". Serverar repo-roten, renderar 1440 + 390, mäter rytm/typografi/
   kontroller, klickar igenom de fyra tillstånden och sparar PNG i kalkylator/v1/skarmdumpar/.
   Kör: node kalkylator/v1/_probe.mjs   (från repo-roten eller varifrån som helst) */
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
const port = 8131 + Math.floor(Math.random() * 300);
await new Promise((r) => server.listen(port, r));
const url = (q = '?m=rot') => `http://localhost:${port}/kalkylator/v1/index.html${q}`;

const browser = await chromium.launch();
const out = { desktop: {}, mobile: {} };

const r2 = (n) => Math.round(n * 10) / 10;
const rect = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, bottom: b.bottom }; };

async function matt(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const qa = (s) => [...document.querySelectorAll(s)];
    const b = (el) => el.getBoundingClientRect();
    const fs = (el) => getComputedStyle(el).fontSize;
    const fw = (el) => getComputedStyle(el).fontWeight;
    const lh = (el) => getComputedStyle(el).lineHeight;
    const kort = q('#avdragskollen');
    const h2 = q('#rk-rubrik');
    const etiketter = qa('.rk__etikett');
    const under = q('.rk__under');
    const seg = qa('.rk__segment');
    const segOpt = qa('.rk__segment > label');
    const input = q('#rk-inkomst');
    const panel = q('.rk__panel');
    const eyebrow = q('#rk-eyebrow');
    const tal = q('#rk-tal');
    const per = q('#rk-per');
    const talrad = q('#rk-talrad');
    const res = q('#rk-resultat');
    const spalt = q('.rk-spalt');
    const round = (n) => Math.round(n * 10) / 10;
    return {
      kortHojd: round(b(kort).height), kortBredd: round(b(kort).width), spaltBredd: round(b(spalt).width),
      fragorBredd: round(b(q('.rk__fragor')).width), panelBredd: round(b(panel).width),
      avstand: {
        h2_till_fraga1: round(b(etiketter[0]).top - b(h2).bottom),
        fraga1_till_underrad: round(b(under).top - b(etiketter[0]).bottom),
        underrad_till_kontroll: round(b(seg[0]).top - b(under).bottom),
        kontroll1_till_fraga2: round(b(etiketter[1]).top - b(seg[0]).bottom),
        fraga2_till_kontroll: round(b(seg[1]).top - b(etiketter[1]).bottom),
        kontroll2_till_fraga3: round(b(etiketter[2]).top - b(seg[1]).bottom),
        fraga3_till_kontroll: round(b(seg[2]).top - b(etiketter[2]).bottom),
        kortkant_till_h2: round(b(h2).top - b(kort).top),
        sista_kontroll_till_kortkant: round(b(kort).bottom - Math.max(b(seg[2]).bottom, b(input).bottom)),
        eyebrow_till_tal: round(b(talrad).top - b(eyebrow).bottom),
        tal_till_per: round(b(per).top - b(talrad).bottom),
        panel_topp_till_innehall: round(b(res).top - b(panel).top),
        innehall_till_panel_botten: round(b(panel).bottom - b(res).bottom),
      },
      typografi: {
        h2: `${fs(h2)} / ${fw(h2)} / lh ${lh(h2)}`,
        fraga: `${fs(etiketter[0])} / ${fw(etiketter[0])} / lh ${lh(etiketter[0])}`,
        underrad: `${fs(under)} / ${fw(under)}`,
        eyebrow: `${fs(eyebrow)} / ${fw(eyebrow)} / ls ${getComputedStyle(eyebrow).letterSpacing}`,
        tal: `${fs(tal)} / ${fw(tal)} / ${getComputedStyle(tal).fontVariantNumeric}`,
        per: `${fs(per)} / ${fw(per)}`,
        segment: `${fs(segOpt[0])} / vald ${fw(segOpt[0])} / ovald ${fw(segOpt[1])}`,
        input: `${fs(input)} / ${fw(input)}`,
      },
      kontroller: {
        segmentSpar: seg.map((s) => `${round(b(s).width)} x ${round(b(s).height)}`),
        alternativ: segOpt.map((o) => `${o.textContent.trim()} ${round(b(o).width)} x ${round(b(o).height)}`),
        input: `${round(b(input).width)} x ${round(b(input).height)}`,
      },
      talradBredd: round(b(talrad).width), panelInnerBredd: round(b(res).width), talradTopp: round(b(talrad).top + window.scrollY),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
}

async function bild(page, namn) {
  const box = await page.evaluate(() => { const b = document.querySelector('#avdragskollen').getBoundingClientRect(); return { x: b.x, y: b.y + window.scrollY, w: b.width, h: b.height }; });
  const m = 32;
  await page.screenshot({ path: join(ut, `${namn}.png`), fullPage: true, clip: { x: Math.max(0, box.x - m), y: Math.max(0, box.y - m), width: box.w + 2 * m, height: box.h + 2 * m } });
}

async function las(page) {
  return page.evaluate(() => {
    const t = (s) => { const el = document.querySelector(s); return el && !el.closest('[hidden]') ? el.textContent.replace(/\s+/g, ' ').trim() : null; };
    return { status: document.querySelector('#rk-resultat').dataset.status, prefix: t('#rk-prefix'), tal: t('#rk-tal'), enhet: t('#rk-talenhet'), per: t('#rk-per'), not: t('#rk-not'), stopp: t('#rk-stopptext') };
  });
}

for (const [namn, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url('?m=rot'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const o = out[namn];
  o.rot = { ...(await matt(page)), besked: await las(page) };
  await bild(page, `${namn}-1-utgangslage`);

  // 1. Nej på ägande
  await page.click('label:has(input[name="ager"][value="nej"])');
  await page.waitForTimeout(350);
  o.agerNej = { besked: await las(page), kortHojd: (await matt(page)).kortHojd };
  await bild(page, `${namn}-2-ager-nej`);
  await page.click('label:has(input[name="ager"][value="ja"])');
  await page.waitForTimeout(350);
  o.agerJaIgen = await las(page);

  // 2. Nej på fem år
  await page.click('label:has(input[name="aldre"][value="nej"])');
  await page.waitForTimeout(350);
  { const m = await matt(page); o.aldreNej = { besked: await las(page), kortHojd: m.kortHojd, talradTopp: m.talradTopp, talradToppUtgangslage: o.rot.talradTopp }; }
  await bild(page, `${namn}-3-femar-nej`);
  await page.click('label:has(input[name="aldre"][value="ja"])');

  // 3. Inkomst 180 000 (lön)
  await page.fill('#rk-inkomst', '180000');
  await page.waitForTimeout(350);
  o.lon180k = { besked: await las(page), falt: await page.inputValue('#rk-inkomst'), kortHojd: (await matt(page)).kortHojd };
  await bild(page, `${namn}-4-lon-180000`);

  // 4. Pension 240 000
  await page.click('label:has(input[name="typ"][value="pension"])');
  await page.fill('#rk-inkomst', '240000');
  await page.waitForTimeout(350);
  o.pension240k = { besked: await las(page), falt: await page.inputValue('#rk-inkomst'), kortHojd: (await matt(page)).kortHojd };
  await bild(page, `${namn}-5-pension-240000`);

  // tillbaka till lön + 600 000 (taket) och tom
  await page.click('label:has(input[name="typ"][value="lon"])');
  await page.fill('#rk-inkomst', '600000');
  await page.waitForTimeout(200);
  o.lon600k = await las(page);
  await page.fill('#rk-inkomst', '');
  await page.waitForTimeout(200);
  o.tomIgen = await las(page);

  // fokusring på ett alternativ (tangentbord)
  await page.focus('input[name="ager"][value="ja"]');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  o.tangentbord = await las(page);
  await bild(page, `${namn}-8-tangentbordsfokus`);
  await page.keyboard.press('ArrowLeft');

  // gt-läget
  await page.goto(url('?m=gt'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const g = await matt(page);
  o.gt = { kortHojd: g.kortHojd, h2: await page.textContent('#rk-rubrik'), eyebrow: await page.textContent('#rk-eyebrow'), besked: await las(page), overflowX: g.overflowX };
  await bild(page, `${namn}-6-gt-utgangslage`);
  await page.click('label:has(input[name="ager"][value="nej"])');
  await page.waitForTimeout(350);
  o.gtAgerNej = await las(page);
  await bild(page, `${namn}-7-gt-ager-nej`);
  await page.click('label:has(input[name="ager"][value="ja"])');
  await page.click('label:has(input[name="aldre"][value="nej"])');
  await page.waitForTimeout(250);
  o.gtAldreNej = await las(page);

  o.errors = errors;
  await page.close();
}

await browser.close();
server.close();
console.log(JSON.stringify(out, null, 1));
