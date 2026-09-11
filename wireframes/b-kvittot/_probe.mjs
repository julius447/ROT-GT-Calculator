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
  const stamp = async () => `${await page.locator('.stamp').getAttribute('class')} "${await page.locator('.stamp__main').textContent()} / ${(await page.locator('.stamp__sub').count()) ? await page.locator('.stamp__sub').textContent() : ''}"`;
  const primary = async () => { const b = page.locator('#kv-cta .btn'); return (await b.count()) ? await b.first().textContent() : null; };
  const links = async () => page.locator('#kv-cta a, #kv-cta button').allTextContents();
  const rows = async (p = page) => p.$$eval('#kv-stamps .srow', (els) => els.map((e) => [...e.classList].filter((c) => /(ok|antaget|okand|varning|stopp|skoter_vi)$/.test(c)).join(',')));
  await page.evaluate(() => { window.dataLayer = []; });
  log('start:', await title(), '|', await stamp(), '| knapp:', await primary(), '| ingress:', await page.locator('.ak__lead').textContent());
  // B-B1: rent tryck på förvalen (ingen byt-och-tillbaka)
  await page.locator('label.chip:has(input[name="boende"][value="villa"])').click(); await page.waitForTimeout(120);
  log('tryck på förvalet villa: rader', JSON.stringify(await rows()));
  await page.locator('label.chip:has(input[name="boende"][value="villa"])').click(); await page.waitForTimeout(120);
  const answers = await page.evaluate(() => window.dataLayer.filter((e) => e.event === 'ampy_ak_answer').length);
  log('samma chip igen: answer-events totalt', answers, '(ska vara 1, idempotent)');
  await page.locator('label.chip:has(input[name="vardear"][value="t2011"])').click();
  await page.locator('label.chip:has(input[name="skatt"][value="lon"])').click(); await page.waitForTimeout(150);
  log('tre rena tryck:', await title(), '|', await stamp(), '| knapp:', await primary(), '| rader', JSON.stringify(await rows()));
  // B-M2: frågeräkningen följer banken
  await page.locator('label.chip:has(input[name="vardear"][value="2021_2025"])').click(); await page.waitForTimeout(100);
  log('värdeår 2021-2025:', await title(), '| ingress:', await page.locator('.ak__lead').textContent(), '| synliga huvudfrågor:', await page.locator('#bank-main .q:not([hidden])').count());
  await page.locator('label.chip:has(input[name="vardear"][value="t2011"])').click(); await page.waitForTimeout(100);
  // hyresrätt -> nej
  await page.locator('label.chip:has(input[value="hyra"])').click();
  log('hyresrätt:', await title(), '|', await stamp(), '| knapp:', await primary(), '| länkar:', JSON.stringify(await links()), '| belopp-fråga dold:', await page.locator('.q[data-q="belopp"]').isHidden(), '| källrad synlig:', await page.locator('#kv-source').isVisible());
  await page.locator('label.chip:has(input[name="boende"][value="villa"])').click();
  await page.locator('label.chip:has(input[name="vardear"][value="vet_inte"])').click();
  await page.locator('label.chip:has(input[name="skatt"][value="vet"])').click();
  log('vet+vet:', await title(), '|', await stamp(), '| knapp:', await primary(), '| länkar:', JSON.stringify(await links()));
  await page.locator('label.chip:has(input[name="vardear"][value="t2011"])').click();
  await page.locator('label.chip:has(input[name="skatt"][value="lon"])').click();
  log('tillbaka till ja:', await title(), '|', await stamp());
  // sticky-remsan (B-M5): aldrig bredvid synlig CTA
  const stripVisible = async () => page.evaluate(() => { const s = document.getElementById('strip'); return !s.hidden && !s.classList.contains('is-off'); });
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(350);
  log('remsa vid toppen:', await stripVisible(), '| text:', await page.locator('#strip-verdict').textContent(), '/', await page.locator('#strip-amt').textContent(), '| knapp:', await page.locator('#strip-btn').textContent());
  await page.locator('#kv').scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  log('remsa när kvittot syns:', await stripVisible());
  await page.locator('#kv-cta').scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  const ctaVis = await page.evaluate(() => { const r = document.getElementById('kv-cta').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
  log('remsa när CTA:n syns:', await stripVisible(), '| CTA i viewport:', ctaVis);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(400);
  log('remsa vid sidans slut:', await stripVisible());
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  // fler detaljer + villkorsrad -> fråga
  await page.locator('#more summary').click();
  log('fler detaljer öppen:', await page.locator('#more').evaluate((d) => d.open), '| synliga frågor där:', await page.locator('#bank-more .q:not([hidden])').count());
  await page.locator('#kv-stamps [data-fraga="skatt"]').click(); await page.waitForTimeout(400);
  log('villkorsrad -> fråga skatt fokus:', await page.evaluate(() => document.activeElement && document.activeElement.name));
  // belopp tomt -> tak
  await page.locator('#in-belopp').fill(''); await page.waitForTimeout(100);
  log('belopp tomt:', await page.locator('.line--deduct .line__amt').textContent(), '| total:', await page.locator('.total').textContent());
  await page.locator('.preset[data-v="60000"]').click();
  log('förval 60 000:', JSON.stringify(await page.locator('#kv-lines .line').allTextContents()), '| total:', (await page.locator('.total__amt').textContent()));
  // arbete_kr -> punkt
  await page.locator('#in-arbete_kr').fill('40000'); await page.waitForTimeout(100);
  log('arbete_kr 40 000:', await page.locator('.line--deduct .line__amt').textContent(), '| total:', (await page.locator('.total__amt').textContent()), '| arbete-slider dold:', await page.locator('.q[data-q="arbete"]').isHidden());
  // B-m3: fokus i kvittot överlever en omräkning (debounce 400 ms från beloppsfältet)
  await page.locator('#in-belopp').fill('50000'); await page.locator('#kv-cta .btn').first().focus(); await page.waitForTimeout(700);
  log('fokus på CTA efter omräkning:', await page.evaluate(() => `${document.activeElement.tagName}.${document.activeElement.className}`), '| total nu:', await page.locator('.total__amt').textContent());
  // kopiera länk + status överlever nästa svar
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.locator('[data-share="link"]').click(); await page.waitForTimeout(200);
  log('kopiera länk status:', await page.locator('#share-status').textContent(), '| url:', await page.evaluate(() => window.__ak.shareUrl()));
  await page.locator('label.chip:has(input[name="boende"][value="fritid"])').click(); await page.waitForTimeout(100);
  log('status efter nytt svar:', JSON.stringify(await page.locator('#share-status').textContent()));
  await page.waitForTimeout(500);
  log('adressfältet (efter 400 ms debounce):', await page.evaluate(() => location.search));
  log('fel:', JSON.stringify(errors));
  await page.close();

  // B-B1 tangentbord: Space på en redan vald radio bekräftar
  const k = await open('?m=rot');
  await k.page.focus('#inputs input[name="boende"][value="villa"]'); await k.page.keyboard.press('Space'); await k.page.waitForTimeout(150);
  log('tangentbord Space på villa: rader', JSON.stringify(await rows(k.page)));
  await k.page.focus('#inputs input[name="skatt"][value="lon"]'); await k.page.keyboard.press('Enter'); await k.page.waitForTimeout(150);
  log('tangentbord Enter på lön: rader', JSON.stringify(await rows(k.page)), '| rubrik:', await k.page.locator('.kv__title').textContent());
  await k.page.keyboard.press('ArrowRight'); await k.page.waitForTimeout(150);
  log('pil höger (pension):', await k.page.locator('#kv-stamps [data-fraga="skatt"]').textContent(), '| fel:', JSON.stringify(k.errors));
  await k.page.close();

  // Motorns nya CTA-former: skatten räcker delvis -> tel primär + offert som textlänk
  const d = await open('?m=rot&a=150000&ak=150000', { width: 1440, height: 1000 });
  await d.page.locator('#more > summary').click();
  await d.page.locator('label.chip:has(input[name="skatt_djup"][value="true"])').click();
  await d.page.locator('#in-manadsinkomst').fill('15000'); await d.page.locator('#in-manadsinkomst').dispatchEvent('input'); await d.page.waitForTimeout(600);
  log('skatt räcker delvis:', await d.page.locator('.kv__title').textContent(), '| knapp:', await d.page.locator('#kv-cta .btn').first().textContent(), '| sekundär:', JSON.stringify(await d.page.locator('#kv-cta .cta__sec').allTextContents()), '| stämpel:', await d.page.locator('.stamp__main').textContent(), '/', await d.page.locator('.stamp__sub').textContent(), '| fel:', JSON.stringify(d.errors));
  await d.page.close();

  // GT sol: primär = textlänk (byte till batteri), sekundär tel
  const so = await open('?m=gt&l=sol');
  log('sol:', await so.page.locator('.kv__title').textContent(), '| solid knapp finns:', await so.page.locator('#kv-cta .btn').count(), '| länkar:', JSON.stringify(await so.page.locator('#kv-cta a, #kv-cta button').allTextContents()));
  await so.page.locator('#kv-cta [data-byte]').click(); await so.page.waitForTimeout(600);
  log('efter sol -> batteri:', await so.page.evaluate(() => `${document.body.dataset.mode} ${window.__ak.state.lage}`), '|', await so.page.locator('.kv__title').textContent(), '| url:', await so.page.evaluate(() => location.search), '| fel:', JSON.stringify(so.errors));
  await so.page.close();

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

  // embed: chips (inga select), värdeår + skatt bakom Fler detaljer, fold, källrad, src=artikel
  const e = await open('?m=rot&surface=embed');
  log('embed: select:', await e.page.locator('select').count(), '| synliga huvudfrågor:', JSON.stringify(await e.page.$$eval('#bank-main .q:not([hidden])', (els) => els.map((x) => x.dataset.q))), '| i Fler detaljer:', JSON.stringify(await e.page.$$eval('#bank-more .q:not([hidden])', (els) => els.map((x) => x.dataset.q))));
  log('embed: fold finns:', await e.page.locator('#kv-fold').count(), '| skriv ut finns:', await e.page.locator('[data-share="print"]').count(), '| remsa:', await e.page.locator('#strip').isVisible(), '| h2:', await e.page.locator('h2.ak__title').count(), '| källrad synlig utanför details:', await e.page.evaluate(() => { const s = document.getElementById('kv-source'); return !!s && !s.closest('details') && s.offsetParent !== null; }), '| offert-href:', await e.page.locator('#kv-cta .btn').getAttribute('href'));
  await e.page.locator('label.chip:has(input[name="boende"][value="brf"])').click(); await e.page.waitForTimeout(300);
  log('embed brf via chip:', await e.page.locator('.kv__title').textContent(), '| url orörd:', await e.page.evaluate(() => location.search), '| villkor i fold:', await e.page.locator('#kv-fold .srow').count());
  await e.page.locator('#kv-fold > summary').click(); await e.page.waitForTimeout(100);
  log('embed fold öppen: basrader:', JSON.stringify(await e.page.locator('#kv-fold .kv__base .line').allTextContents()));
  await e.page.locator('#kv-fold [data-fraga="skatt"]').click(); await e.page.waitForTimeout(500);
  log('embed antaget-rad skatt -> Fler detaljer öppen:', await e.page.locator('#more').evaluate((d) => d.open), '| fokus:', await e.page.evaluate(() => document.activeElement && `${document.activeElement.name}=${document.activeElement.value}`));
  await e.page.locator('label.chip:has(input[name="skatt"][value="lon"])').click(); await e.page.waitForTimeout(200);
  log('embed bekräfta skatt i fällraden:', JSON.stringify(await e.page.$$eval('#kv-fold .srow', (els) => els.map((x) => [...x.classList].filter((c) => /(ok|antaget|okand|varning|stopp|skoter_vi)$/.test(c)).join(',')))), '| fel:', JSON.stringify(e.errors));
  await e.page.close();
}
if (argv.includes('--a11y')) {
  // tryckytor (B-M6) + kontrast för teal-bright-text på navy (S-1, lokalt)
  const { page } = await open('?m=rot');
  const sizes = await page.evaluate(() => {
    const h = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null).map((e) => Math.round(e.getBoundingClientRect().height));
    return { preset: h('.preset'), srow: h('.srow__btn'), cta_sec: h('.cta__sec'), chip: h('.chip'), share: h('.share__btn'), summary: h('summary') };
  });
  log('tryckytor 390:', JSON.stringify(sizes));
  const contrast = await page.evaluate(() => {
    const parse = (rgb) => { const m = rgb.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
    const over = (fg, bg) => { const f = parse(fg); const b = parse(bg); return { r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a) }; }; // alfa-komposition mot ytan
    const lum = (c) => { const [r, g, b] = [c.r, c.g, c.b].map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const ratio = (fg, bg) => { const a = lum(over(fg, bg)) + 0.05; const b = lum(parse(bg)) + 0.05; return (Math.max(a, b) / Math.min(a, b)).toFixed(2); };
    const bg = getComputedStyle(document.querySelector('.kv')).backgroundColor; const bg2 = getComputedStyle(document.querySelector('.total')).backgroundColor;
    const pick = (sel) => getComputedStyle(document.querySelector(sel)).color;
    return { deduct_on_navy: ratio(pick('.line--deduct .line__amt'), bg), tel_on_navy: ratio(pick('.cta__sec strong'), bg), tel_label_on_navy: ratio(pick('.cta__sec'), bg), i_ok: ratio(pick('.i-ok'), bg), source_on_navy: ratio(pick('.kv__source'), bg), note_on_navy: ratio(pick('.line__note'), bg), total_on_navy2: ratio(pick('.total__amt'), bg2), antaget_ring: ratio(pick('.i-antaget'), bg), btn_text_on_teal: ratio(getComputedStyle(document.querySelector('.btn--primary')).color, getComputedStyle(document.querySelector('.btn--primary')).backgroundColor) };
  });
  log('kontrast:', JSON.stringify(contrast));
  await page.close();
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
