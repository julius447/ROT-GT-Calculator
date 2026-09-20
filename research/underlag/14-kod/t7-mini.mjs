import { chromium } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
const root = '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => { try { let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); } });
await new Promise((r) => server.listen(0, r)); const port = server.address().port;
const browser = await chromium.launch(); const out = {};
{ const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`http://localhost:${port}/kalkylator/v1/index.html?m=rot`, { waitUntil: 'networkidle' });
  await page.click('#rk-lagg'); await page.waitForTimeout(50);
  await page.fill('#rk-inkomst-2', '180000'); await page.waitForTimeout(650);
  out.person2Typing = await page.evaluate(() => ({ tal: document.querySelector('#rk-tal').textContent, prefix: document.querySelector('#rk-prefix').textContent, per: document.querySelector('#rk-per').textContent }));
  // caret: put "300000", then place caret after "30" and type "5"
  const f = page.locator('#rk-inkomst-1'); await f.fill('300000'); await page.waitForTimeout(600);
  await page.evaluate(() => { const i = document.querySelector('#rk-inkomst-1'); i.focus(); i.setSelectionRange(2, 2); });
  await page.keyboard.type('5'); await page.waitForTimeout(50);
  out.caret = await page.evaluate(() => { const i = document.querySelector('#rk-inkomst-1'); return { value: i.value, caret: i.selectionStart, len: i.value.length }; });
  // Enter on desktop: does it render? (value changed since last render? type then Enter quickly, before 500 ms)
  await f.fill(''); await page.waitForTimeout(600); await f.focus(); await page.keyboard.type('180000'); await page.keyboard.press('Enter'); await page.waitForTimeout(50);
  out.enter = await page.evaluate(() => ({ tal: document.querySelector('#rk-tal').textContent, active: document.activeElement.id, url: location.href.slice(-12) }));
  await page.waitForTimeout(600);
  // segment label at 360 viewport
  await page.setViewportSize({ width: 360, height: 800 }); await page.waitForTimeout(200);
  out.seg360 = await page.evaluate(() => { const l = document.querySelector('.rk__segment > label'); const cs = getComputedStyle(l); const beh = document.querySelector('.rk-spalt'); return { fontSize: cs.fontSize, paddingInline: cs.paddingLeft, containerW: beh.clientWidth, cardW: document.querySelector('#avdragskollen').clientWidth, cols: getComputedStyle(document.querySelector('#avdragskollen')).gridTemplateColumns, scrollW: document.documentElement.scrollWidth }; });
  await page.close(); }
// article clone (embedded): right column + top placement
for (const p of ['hoger', 'topp']) for (const [w, h] of [[1440, 1000], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } }); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
  await page.goto(`http://localhost:${port}/kalkylator/artikel/index.html?p=${p}&m=rot`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(1500);
  out[`artikel-${p}-${w}`] = await page.evaluate(() => { const k = document.querySelector('#avdragskollen'); const beh = document.querySelector('.rk-behallare'); const cs = getComputedStyle(k); const h2 = document.querySelector('#rk-rubrik'); const h2cs = getComputedStyle(h2);
    return { cardW: Math.round(k.getBoundingClientRect().width), behW: Math.round(beh.getBoundingClientRect().width), cols: cs.gridTemplateColumns.split(' ').length, h2: [h2cs.fontSize, h2cs.fontWeight, h2cs.lineHeight, h2cs.letterSpacing], rootFs: getComputedStyle(document.documentElement).fontSize, beloppW: Math.round(document.querySelector('.rk__rad > .rk__belopp').getBoundingClientRect().width), segLabelFs: getComputedStyle(document.querySelector('.rk__segment > label')).fontSize, segLabelFw: getComputedStyle(document.querySelector('.rk__segment > label')).fontWeight, inputFs: getComputedStyle(document.querySelector('#rk-inkomst-1')).fontSize, inputBorder: getComputedStyle(document.querySelector('#rk-inkomst-1')).borderColor, legendFs: getComputedStyle(document.querySelector('.rk__etikett')).fontSize, legendPad: getComputedStyle(document.querySelector('.rk__etikett')).padding, btnTT: getComputedStyle(document.querySelector('#rk-lagg')).textTransform, hostFieldset: getComputedStyle(document.querySelector('.rk__fraga')).border, hostInputShadow: getComputedStyle(document.querySelector('#rk-inkomst-1')).boxShadow }; });
  out[`artikel-${p}-${w}`].errors = errs.filter(e => !/403|404|net::ERR|Failed to load resource/.test(e));
  await page.close(); }
console.log(JSON.stringify(out, null, 1)); await browser.close(); server.close();
