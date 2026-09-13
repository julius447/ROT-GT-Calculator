/* Tillståndsprob för v3: klickar Nej på ägande, Nej på fem år, skriver 180 000 (lön), byter till Pension 240 000.
   Skriver PNG per tillstånd (desktop 1440 + mobil 390) till kalkylator/v3/skarmdumpar/ och mäter rytmen.
   Kör: node kalkylator/v3/_probe.mjs */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http'; import { readFile, stat, mkdir } from 'fs/promises';
import { join, extname, resolve, dirname } from 'path'; import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const ut = join(here, 'skarmdumpar');
await mkdir(ut, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try { let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); }
  catch { res.writeHead(404); res.end(); }
});
const port = 8140 + Math.floor(Math.random() * 300);
await new Promise(r => server.listen(port, r));
const b = await chromium.launch();
const out = {};

const lasHero = (page) => page.evaluate(() => {
  const t = (s) => { const el = document.querySelector(s); return el && !el.hidden ? el.textContent.replace(/\s+/g, ' ').trim() : null; };
  return { tal: t('#ak-tal'), stopp: t('#ak-stopp'), not: t('#ak-not'), bock: !document.querySelector('#ak-bock').hidden, etikett: t('#ak-etikett') };
});
const matt = (page) => page.evaluate(() => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const q1 = r('#ak-q1'), u1 = r('.ak__fraga:nth-child(1) .ak__under'), k1 = r('.ak__fraga:nth-child(1) .ak__kontroll');
  const q2 = r('#ak-q2'), k2 = r('.ak__fraga:nth-child(2) .ak__kontroll'), q3 = r('#ak-q3'), k3 = r('.ak__fraga:nth-child(3) .ak__kontroll');
  const kort = r('.ak__kort'), hero = r('#ak-hero'), ety = r('#ak-etikett'), tal = r('#ak-siffra'), rad = r('#ak-rad'), h2 = r('#ak-rubrik');
  const seg = r('.ak__fraga:nth-child(1) .ak__seg'), opt = r('.ak__fraga:nth-child(1) .ak__seg > label'), inp = r('#ak-inkomst');
  const fs = (s) => getComputedStyle(document.querySelector(s)).fontSize;
  const fw = (s) => getComputedStyle(document.querySelector(s)).fontWeight;
  const rnd = (n) => Math.round(n * 10) / 10;
  const bred = getComputedStyle(document.querySelector('.ak__fragor')).display === 'grid';
  return {
    layout: bred ? 'en rad (tre kolumner)' : 'staplat',
    kort: { bredd: rnd(kort.width), hojd: rnd(kort.height) },
    h2_till_kort: rnd(kort.top - h2.bottom),
    hero: { hojd: rnd(hero.height), kortkant_till_etikett: rnd(ety.top - hero.top), etikett_till_tal: rnd(tal.top - ety.bottom), tal_till_rad: rnd(rad.top - tal.bottom), rad_till_harlinje: rnd(hero.bottom - rad.bottom) },
    harlinje_till_fraga1: rnd(q1.top - hero.bottom),
    fraga1: bred
      ? { etikett_till_kontroll: rnd(k1.top - q1.bottom), kontroll_till_underrad: rnd(u1.top - k1.bottom) }
      : { etikett_till_underrad: rnd(u1.top - q1.bottom), underrad_till_kontroll: rnd(k1.top - u1.bottom) },
    fraga2: { etikett_till_kontroll: rnd(k2.top - q2.bottom) },
    fraga3: { etikett_till_kontroll: rnd(k3.top - q3.bottom) },
    fraga_till_fraga: bred ? { kolumngap: rnd(q2.left - r('.ak__fraga:nth-child(1)').right) } : { f1_till_f2: rnd(q2.top - Math.max(k1.bottom, u1.bottom)), f2_till_f3: rnd(q3.top - k2.bottom) },
    sista_kontroll_till_kortkant: rnd(kort.bottom - Math.max(k3.bottom, u1.bottom, inp.bottom)),
    typografi: { h2: fs('#ak-rubrik') + '/' + fw('#ak-rubrik'), fraga: fs('#ak-q1') + '/' + fw('#ak-q1'), underrad: fs('.ak__under') + '/' + fw('.ak__under'), etikett: fs('#ak-etikett'), tal: fs('#ak-siffra') + '/' + fw('#ak-siffra'), prefix: fs('#ak-prefix'), per: fs('.ak__per'), segment: fs('.ak__seg > label'), input: fs('#ak-inkomst') },
    kontroller: { segment_hojd: rnd(seg.height), segment_bredd: rnd(seg.width), option_bredd: rnd(opt.width), option_hojd: rnd(opt.height), input_hojd: rnd(inp.height), input_bredd: rnd(inp.width) },
  };
});

for (const [namn, w, h] of [['desktop', 1440, 1000], ['mobil', 390, 844]]) {
  const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(`http://localhost:${port}/kalkylator/v3/index.html?m=rot`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const kort = page.locator('#avdragskollen');
  const shot = async (fil) => { await page.waitForTimeout(350); await kort.screenshot({ path: join(ut, `${namn}-${fil}.png`) }); };
  const o = { fel: errs, matt: await matt(page), start: await lasHero(page) };

  await shot('0-start');
  await page.click('label:has(input[name="ager"][value="nej"])'); o.agerNej = await lasHero(page); await shot('1-ager-nej');
  await page.click('label:has(input[name="ager"][value="ja"])'); o.agerJaIgen = await lasHero(page);
  await page.click('label:has(input[name="aldre"][value="nej"])'); o.aldreNej = await lasHero(page); await shot('2-aldre-nej');
  await page.click('label:has(input[name="aldre"][value="ja"])');
  await page.fill('#ak-inkomst', '180000'); o.lon180k = await lasHero(page); o.faltvarde = await page.inputValue('#ak-inkomst'); await shot('3-lon-180000');
  await page.click('label:has(input[name="typ"][value="pension"])'); await page.fill('#ak-inkomst', '240000'); o.pension240k = await lasHero(page); await shot('4-pension-240000');
  await page.click('label:has(input[name="typ"][value="lon"])'); o.lonIgen240k = await lasHero(page);
  o.overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  o.fel = errs;
  out[namn] = o;
  await page.close();
}
// grön teknik: start + ager nej (beskedet ska säga grön teknik-avdrag)
{
  const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${port}/kalkylator/v3/index.html?m=gt`, { waitUntil: 'networkidle' });
  const o = { start: await lasHero(page), rubrik: await page.textContent('#ak-rubrik') };
  await page.click('label:has(input[name="ager"][value="nej"])'); o.agerNej = await lasHero(page);
  await page.locator('#avdragskollen').screenshot({ path: join(ut, 'desktop-gt-1-ager-nej.png') });
  await page.click('label:has(input[name="ager"][value="ja"])'); await page.click('label:has(input[name="aldre"][value="nej"])'); o.aldreNej = await lasHero(page);
  out.gt = o; await page.close();
}
await b.close(); server.close();
console.log(JSON.stringify(out, null, 1));
