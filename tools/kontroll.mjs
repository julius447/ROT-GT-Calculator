// Oberoende kontroll av en kalkylatorversion: Enter laddar inte om, aldrig "ca 0", 180 000 -> "ca 12 000 kr",
// Nej på ägande -> stoppmening, ?m=gt döljer fråga 2, kortmått desktop/mobil, tryckytor på pekskärm.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const [,, dir] = process.argv;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]); const f = join(root, p.endsWith('/') ? p + 'index.html' : p);
  let data; try { data = await readFile(f); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': mime[extname(f)] || 'application/octet-stream' }); res.end(data);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;
const browser = await chromium.launch();
const out = {};
for (const [vp, opts] of [['desktop', { viewport: { width: 1440, height: 1000 } }], ['mobil', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }]]) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  let loads = 0; page.on('load', () => loads++);
  await page.goto(`http://localhost:${port}/${dir}/index.html?m=rot`); await page.waitForTimeout(400);
  const text = async () => (await page.locator('body').innerText()).replace(/[\s\u00a0\u202f]+/g, ' ');
  const r = { errors };
  r.start = /upp till\s*50 000 kr/.test(await text());
  r.femFragor = (await text()).includes('Är bostaden äldre än fem år?');
  const num = page.locator('input[inputmode="numeric"], input[type="text"]').first();
  // Enter -> ingen omladdning
  await num.click(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  r.enterLaddarOm = loads > 1;
  // skriv 180000, samla text under skrivandet
  const sedda = new Set();
  await num.click(); await num.fill('');
  for (const ch of '180000') { await page.keyboard.type(ch); await page.waitForTimeout(60); sedda.add((await text()).match(/(ca|upp till)?\s*[\d ]+ kr/)?.[0]?.trim()); }
  await page.waitForTimeout(700);
  r.underSkrivning = [...sedda].filter(Boolean);
  r.ca0 = [...sedda].some(s => /ca 0 kr/.test(s || ''));
  r.efter180000 = (await text()).match(/(ca|upp till)?\s*[\d ]+ kr/)?.[0]?.trim();
  // Nej på ägande
  const nej = page.locator('label:has(input[type="radio"])').filter({ hasText: /^Nej$/ }).first();
  await nej.click(); await page.waitForTimeout(300);
  r.stopp = (await text()).includes('Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag.');
  r.stoppTalBorta = !/[\d ]{5,} kr/.test(await text());
  // tillbaka till Ja
  await page.locator('label:has(input[type="radio"])').filter({ hasText: /^Ja$/ }).first().click(); await page.waitForTimeout(300);
  r.tillbaka = (await text()).match(/(ca|upp till)?\s*[\d ]+ kr/)?.[0]?.trim();
  // Pension 240000
  await page.locator('label:has(input[type="radio"])').filter({ hasText: /^Pension$/ }).first().click();
  await num.fill('240000'); await num.blur(); await page.waitForTimeout(700);
  r.pension240 = (await text()).match(/(ca|upp till)?\s*[\d ]+ kr/)?.[0]?.trim();
  // mått
  r.matt = await page.evaluate(() => {
    const h2 = document.querySelector('h2'); const card = h2 && [...document.querySelectorAll('section, div, form')].find(el => el !== h2 && el.getBoundingClientRect().top > h2.getBoundingClientRect().bottom && el.getBoundingClientRect().height > 200 && el.getBoundingClientRect().width > 300 && getComputedStyle(el).borderRadius !== '0px');
    const cs = h2 && getComputedStyle(h2);
    const radios = [...document.querySelectorAll('label:has(input[type="radio"])')].map(l => { const b = l.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; });
    const fields = [...document.querySelectorAll('input:not([type="radio"])')].map(i => { const b = i.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; });
    return { h2: cs && `${cs.fontSize}/${cs.fontWeight}`, kort: card ? Math.round(card.getBoundingClientRect().height) : null, kortBredd: card ? Math.round(card.getBoundingClientRect().width) : null, radios, fields, bodyW: document.documentElement.scrollWidth, vw: innerWidth };
  });
  // gt
  await page.goto(`http://localhost:${port}/${dir}/index.html?m=gt`); await page.waitForTimeout(400);
  const t = await text();
  r.gt = { h2: t.includes('Räkna ut ditt grön teknik-avdrag'), femFragaDold: !t.includes('fem år'), rotOrd: /ROT/.test(t) };
  await page.locator('label:has(input[type="radio"])').filter({ hasText: /^Nej$/ }).first().click(); await page.waitForTimeout(300);
  r.gt.stopp = (await text()).includes('har du inte rätt till grön teknik-avdrag.');
  out[vp] = r;
  await ctx.close();
}
await browser.close(); server.close();
console.log(JSON.stringify(out, null, 1));
