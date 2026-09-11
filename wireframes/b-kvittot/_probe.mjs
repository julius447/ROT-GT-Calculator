// Interaktionstest + mätningar för riktning B (Playwright). Kör: node wireframes/b-kvittot/_probe.mjs [--overflow]
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { resolve, join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try { const p = decodeURIComponent(new URL(req.url, 'http://x').pathname); let fp = join(root, p); if ((await stat(fp)).isDirectory()) fp = join(fp, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(fp)] || 'application/octet-stream' }); res.end(await readFile(fp)); } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const url = (q) => `http://localhost:${port}/wireframes/b-kvittot/index.html${q}`;
const browser = await chromium.launch();
const out = [];
const log = (...a) => { console.log(...a); out.push(a.join(' ')); };

async function open(q, vp = { width: 390, height: 844 }) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url(q), { waitUntil: 'networkidle' }); await page.waitForTimeout(150);
  return { page, errors };
}
const argv = process.argv.slice(2);

if (argv.includes('--overflow')) {
  for (const q of ['?m=rot', '?m=gt', '?m=rot&surface=embed']) {
    const { page } = await open(q);
    const wide = await page.evaluate(() => {
      const w = document.documentElement.clientWidth; const res = [];
      for (const el of document.querySelectorAll('body *')) { const r = el.getBoundingClientRect(); if (r.right > w + 1 && r.width > 0) res.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)}`); }
      return { scrollW: document.documentElement.scrollWidth, w, res: res.slice(0, 12) };
    });
    log(q, JSON.stringify(wide));
    await page.close();
  }
}

if (argv.includes('--heights') || argv.length === 0) {
  for (const [q, vp] of [['?m=rot&surface=embed', { width: 390, height: 844 }], ['?m=rot&surface=embed', { width: 1440, height: 1000 }], ['?m=gt&surface=embed', { width: 390, height: 844 }], ['?m=rot', { width: 390, height: 844 }], ['?m=gt', { width: 390, height: 844 }], ['?m=rot', { width: 1440, height: 1000 }], ['?m=gt', { width: 1440, height: 1000 }]]) {
    const { page, errors } = await open(q, vp);
    const h = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : null; };
      const top = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; };
      return { verktyg: r('#ak'), inputs: r('#inputs'), kvitto: r('#kv'), kvLines: r('#kv-lines'), head: r('.kv__head'), sida: document.documentElement.scrollHeight, verktygTop: top('#ak'), snabbfaktaTop: top('#art-after') };
    });
    log(`${q} @${vp.width}: verktyg=${h.verktyg}px (inputs ${h.inputs}, kvitto ${h.kvitto}, lines ${h.kvLines}, head ${h.head}) sida=${h.sida} verktygTop=${h.verktygTop} snabbfaktaTop=${h.snabbfaktaTop} errors=${JSON.stringify(errors)}`);
    await page.close();
  }
}

if (argv.includes('--interact') || argv.length === 0) {
  const { page, errors } = await open('?m=rot');
  const title = () => page.locator('.kv__title').textContent();
  const stamp = () => page.locator('.stamp').getAttribute('class');
  const primary = async () => { const b = page.locator('#kv-cta .btn'); return (await b.count()) ? await b.first().textContent() : null; };
  const links = async () => page.locator('#kv-cta a, #kv-cta button').allTextContents();
  log('start:', await title(), '|', await stamp(), '| knapp:', await primary());
  await page.locator('label.chip:has(input[value="hyra"])').click();
  log('hyresrätt:', await title(), '|', await stamp(), '| knapp:', await primary(), '| länkar:', JSON.stringify(await links()), '| belopp-fråga dold:', await page.locator('.q[data-q="belopp"]').isHidden());
  await page.locator('label.chip:has(input[name="boende"][value="villa"])').click();
  await page.locator('label.chip:has(input[name="vardear"][value="vet_inte"])').click();
  await page.locator('label.chip:has(input[name="skatt"][value="vet"])').click();
  log('vet+vet:', await title(), '|', await stamp(), '| knapp:', await primary(), '| länkar:', JSON.stringify(await links()));
  await page.locator('label.chip:has(input[name="vardear"][value="t2011"])').click();
  await page.locator('label.chip:has(input[name="skatt"][value="lon"])').click();
  log('allt bekräftat:', await title(), '|', await stamp(), '| knapp:', await primary());
  // sticky-remsan
  const stripVisible = async () => page.evaluate(() => { const s = document.getElementById('strip'); return !s.hidden && !s.classList.contains('is-off'); });
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  log('remsa efter interaktion, toppen:', await stripVisible(), '| text:', await page.locator('#strip-verdict').textContent(), await page.locator('#strip-amt').textContent(), '| knapp:', await page.locator('#strip-btn').textContent());
  await page.locator('#kv').scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  log('remsa när kvittot syns:', await stripVisible());
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(400);
  log('remsa efter kvittot (passerat):', await stripVisible(), '| knapp:', await page.locator('#strip-btn').textContent());
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  // fler detaljer + villkorsrad -> fråga
  await page.locator('#more summary').click();
  log('fler detaljer öppen:', await page.locator('#more').evaluate((d) => d.open), '| synliga frågor där:', await page.locator('#bank-more .q:not([hidden])').count());
  await page.locator('#kv-stamps [data-fraga="skatt"]').click(); await page.waitForTimeout(400);
  log('villkorsrad → fråga skatt fokus:', await page.evaluate(() => document.activeElement && document.activeElement.name));
  // belopp tomt -> tak
  await page.locator('#in-belopp').fill(''); await page.waitForTimeout(100);
  log('belopp tomt:', await page.locator('.line--deduct .line__amt').textContent(), '| total:', await page.locator('.total').textContent());
  await page.locator('.preset[data-v="60000"]').click();
  log('förval 60 000:', await page.locator('.line--deduct .line__amt').textContent(), '| total:', (await page.locator('.total__amt').textContent()));
  // arbete_kr -> punkt
  await page.locator('#in-arbete_kr').fill('40000'); await page.waitForTimeout(100);
  log('arbete_kr 40 000:', await page.locator('.line--deduct .line__amt').textContent(), '| total:', (await page.locator('.total__amt').textContent()), '| arbete-slider dold:', await page.locator('.q[data-q="arbete"]').isHidden());
  // kopiera länk
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('[data-share="link"]').click(); await page.waitForTimeout(200);
  log('kopiera länk status:', await page.locator('#share-status').textContent(), '| url:', await page.evaluate(() => window.__ak.shareUrl()));
  await page.waitForTimeout(500);
  log('adressfältet (efter 400 ms debounce):', await page.evaluate(() => location.search));
  log('fel:', JSON.stringify(errors));
  await page.close();

  // GT: batteri + nej solceller -> Räkna med ROT i stället
  const g = await open('?m=gt&l=batteri');
  await g.page.locator('label.chip:has(input[name="sol"][value="nej"])').click();
  log('batteri utan sol:', await g.page.locator('.kv__title').textContent(), '|', await g.page.locator('.stamp').getAttribute('class'), '| knapp:', await g.page.locator('#kv-cta .btn').first().textContent(), '| rader:', JSON.stringify(await g.page.locator('.line').allTextContents()));
  await g.page.locator('#kv-cta [data-byte]').click(); await g.page.waitForTimeout(600);
  log('efter läge-byte:', await g.page.evaluate(() => document.body.dataset.mode), '|', await g.page.locator('.kv__title').textContent(), '| url:', await g.page.evaluate(() => location.search));
  log('fel gt:', JSON.stringify(g.errors));
  await g.page.close();

  // GT sol + batteri: två rader
  const s = await open('?m=gt&l=sol&a2=80000');
  log('sol+batteri rader:', JSON.stringify(await s.page.locator('.line').allTextContents()), '| total:', await s.page.locator('.total__amt').textContent());
  await s.page.close();
  // embed: fold + inga print
  const e = await open('?m=rot&surface=embed');
  log('embed: fold finns:', await e.page.locator('#kv-fold').count(), '| skriv ut finns:', await e.page.locator('[data-share="print"]').count(), '| remsa:', await e.page.locator('#strip').isVisible(), '| h2:', await e.page.locator('h2.ak__title').count());
  await e.page.locator('select[name="boende"]').selectOption('brf'); await e.page.waitForTimeout(600);
  log('embed brf via select:', await e.page.locator('.kv__title').textContent(), '| url orörd:', await e.page.evaluate(() => location.search), '| villkor i fold:', await e.page.locator('#kv-fold .srow').count());
  await e.page.locator('#kv-fold > summary').click();
  log('embed fold öppen: basrader:', JSON.stringify(await e.page.locator('#kv-fold .kv__base .line').allTextContents()));
  await e.page.close();
}
if (argv.includes('--states')) {
  const states = [
    ['rot-default', '?m=rot'], ['rot-nej-hyra', '?m=rot&b=hyra'], ['rot-osaker', '?m=rot&y=vet&s=vet'], ['rot-tak', '?m=rot&a=0'], ['rot-noll', '?m=rot&u=50000'],
    ['rot-punkt', '?m=rot&a=60000&ak=40000'], ['rot-skatt-lag', '?m=rot&s=lag'], ['rot-troligen-femar', '?m=rot&y=nej&yy=2023'], ['rot-agare2', '?m=rot&o=2&a=300000&ak=250000'],
    ['gt-laddbox', '?m=gt&l=laddbox'], ['gt-batteri-utan-sol', '?m=gt&l=batteri&p=nej'], ['gt-sol-batteri', '?m=gt&l=sol&a2=80000'], ['gt-brf-laddbox', '?m=gt&l=laddbox&b=brf'], ['gt-brf-batteri', '?m=gt&l=batteri&b=brf'],
    ['embed-rot', '?m=rot&surface=embed'], ['embed-gt-batteri-nej', '?m=gt&l=batteri&p=nej&surface=embed'],
  ];
  for (const [name, q] of states) {
    for (const [vpName, vp] of [['m', { width: 390, height: 844 }], ['d', { width: 1440, height: 1000 }]]) {
      const { page, errors } = await open(q, vp);
      await page.locator('#kv').screenshot({ path: resolve(root, `_shots/state-${name}-${vpName}.png`) });
      if (errors.length) log(name, vpName, 'FEL', JSON.stringify(errors));
      await page.close();
    }
  }
  log('state-skärmdumpar klara');
}
if (argv.includes('--print')) {
  const { page } = await open('?m=rot&a=60000&ak=40000', { width: 800, height: 1000 });
  await page.evaluate(() => { for (const d of document.querySelectorAll('details')) d.open = true; });
  await page.emulateMedia({ media: 'print' });
  await page.screenshot({ path: resolve(root, '_shots/state-print.png'), fullPage: true });
  const vis = await page.evaluate(() => ['.inputs', '.cta', '.share', '.demo', '.strip', '#kv', '.stamps', '.next', '.metod'].map((s) => { const e = document.querySelector(s); return `${s}:${e ? getComputedStyle(e).display : 'saknas'}`; }).join(' '));
  log('print:', vis);
  await page.close();
}
if (argv.includes('--motion')) {
  const { page } = await open('?m=rot&a=60000&ak=40000', { width: 1440, height: 1000 });
  const before = await page.locator('.total__amt').textContent();
  await page.locator('.preset[data-v="30000"]').click();
  const mid = await page.evaluate(() => new Promise((r) => setTimeout(() => r(document.querySelector('.total__amt').textContent), 120)));
  await page.waitForTimeout(400);
  const after = await page.locator('.total__amt').textContent();
  log('count-up: före', before, '| mitt i', mid, '| efter', after);
  await page.close();
  const r = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await r.goto(url('?m=rot&a=60000&ak=40000'), { waitUntil: 'networkidle' });
  await r.locator('.preset[data-v="30000"]').click();
  const mid2 = await r.evaluate(() => new Promise((res) => setTimeout(() => res(document.querySelector('.total__amt').textContent), 60)));
  log('reduced motion: direkt', mid2);
  await r.close();
}
if (argv.includes('--details')) {
  const { page, errors } = await open('?m=rot', { width: 1440, height: 1000 });
  await page.locator('#more > summary').click();
  await page.locator('label.chip:has(input[name="skatt_djup"][value="true"])').click();
  await page.locator('label.chip:has(input[name="agare"][value="2"])').click();
  await page.waitForTimeout(200);
  await page.locator('#inputs').screenshot({ path: resolve(root, '_shots/state-details-d.png') });
  log('details: fel', JSON.stringify(errors), '| rubrik:', await page.locator('.kv__title').textContent(), '| skatt-rad:', await page.locator('#kv-stamps .srow--info, #kv-stamps [data-fraga="skatt"]').first().textContent());
  await page.close();
  const m = await open('?m=gt&l=laddbox', { width: 390, height: 844 });
  await m.page.locator('label.chip:has(input[name="boende"][value="brf"])').click();
  await m.page.locator('#more > summary').click();
  await m.page.waitForTimeout(200);
  await m.page.locator('#inputs').screenshot({ path: resolve(root, '_shots/state-details-m.png') });
  // remsa synlig
  await m.page.evaluate(() => window.scrollTo(0, 300)); await m.page.waitForTimeout(400);
  await m.page.screenshot({ path: resolve(root, '_shots/state-strip-m.png') });
  await m.page.close();
}
await browser.close(); server.close();
