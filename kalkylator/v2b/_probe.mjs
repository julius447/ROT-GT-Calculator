/* Tillståndsprov för v2b: mäter rytmen, renderar tillstånden, kör fixrundans krav och skriver JSON.
   Kör: node kalkylator/v2b/_probe.mjs  (från repots rot). Skärmdumpar + probe.json -> kalkylator/v2b/skarmdumpar/
   Krav som provet kontrollerar (fixrundan 2026-09-14):
     fråga -> kontroll 14 px i varje spalt (desktop) ; "1 200 000" klipps inte ; alternativets höjd 44 på touch ;
     en (1) mutationsbatch i aria-live-regionen efter "180000" ; ?m=gt utan femårsfrågan ; kortet <= 460 desktop / <= 640 mobil ;
     stoppbeskedet helt ovanför 664 px i ett iPhone-fönster ; femårsraden på egen rad, reserverad på desktop (kortet byter inte höjd) ;
     "grön teknik-avdrag" obrutet i H2 och stopptext på mobil ; ingen horisontell scroll, inga fel.
   Dessutom renderas R1-1:s alternativ (två spalter) med injicerad CSS för jämförelsen i NOTES (alt-*.png). */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http';
import { readFile, writeFile, stat, mkdir } from 'fs/promises';
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
const out = { errors: [], krav: {} };
const DEBOUNCE = 700;                                   /* app.js räknar om 500 ms efter sista tangenten */

const rect = (page, sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, r: r.right }; }, sel);
const round = (n) => Math.round(n * 10) / 10;
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
const lasBand = async (page) => ({
  status: await page.getAttribute('#avdragskollen', 'data-status'),
  etikett: norm(await page.textContent('#rk-etikett')),
  tal: (await page.isHidden('#rk-utfall')) ? null : norm(await page.textContent('#rk-tal')),
  per: (await page.isHidden('#rk-utfall')) ? null : norm(await page.textContent('#rk-per')),
  not: (await page.isHidden('#rk-utfall')) ? null : (norm(await page.textContent('#rk-not')) || null),
  stopp: (await page.isHidden('#rk-stopp')) ? null : norm(await page.textContent('#rk-stopp-text')),
  kortHojd: round((await rect(page, '.rk__card')).h),
  talY: round((await rect(page, '#rk-num')).y),
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
  await page.fill('#rk-inkomst', ''); await page.waitForTimeout(DEBOUNCE);
};

for (const [namn, w, h, touch] of [['desktop', 1440, 1000, false], ['mobil', 390, 844, true]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch });
  page.on('pageerror', (e) => out.errors.push(`${namn}: ${e}`));
  page.on('console', (m) => { if (m.type() === 'error') out.errors.push(`${namn}: ${m.text()}`); });
  await page.goto(url('rot'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);

  /* 1. Rytmen (getBoundingClientRect) */
  const q1f = await rect(page, '#rk-q1'), q1u = await rect(page, '#rk-q1-under'), q1k = await rect(page, '[aria-labelledby="rk-q1"]');
  const q2f = await rect(page, '#rk-q2'), q2k = await rect(page, '[aria-labelledby="rk-q2"]');
  const q3f = await rect(page, '#rk-q3'), q3k = await rect(page, '.rk__inkomst [role="radiogroup"]'), inp = await rect(page, '#rk-inkomst');
  const h2 = await rect(page, '#rk-h2'), kort = await rect(page, '.rk__card'), fragor = await rect(page, '.rk__fragor'), band = await rect(page, '.rk__band');
  const etik = await rect(page, '#rk-etikett'), tal = await rect(page, '#rk-tal'), num = await rect(page, '#rk-num'), per = await rect(page, '#rk-per'), not = await rect(page, '#rk-not');
  const seg = await rect(page, '[aria-labelledby="rk-q1"] > label');
  const kol = await page.evaluate(() => [...document.querySelectorAll('.rk__q')].map((q) => {
    const r = q.getBoundingClientRect(), k = q.querySelector('.rk__kontroll').getBoundingClientRect();
    return { bredd: Math.round(r.width), hojd: Math.round(r.height * 10) / 10, tomtUnderKontroll: Math.round((r.bottom - k.bottom) * 10) / 10 };
  }));
  const fs = await page.evaluate(() => {
    const g = (s, p) => getComputedStyle(document.querySelector(s))[p];
    return {
      h2: g('#rk-h2', 'fontSize') + ' / ' + g('#rk-h2', 'fontWeight') + ' / lh ' + g('#rk-h2', 'lineHeight'),
      fraga: g('#rk-q1', 'fontSize') + ' / ' + g('#rk-q1', 'fontWeight'),
      under: g('#rk-q1-under', 'fontSize') + ' / ' + g('#rk-q1-under', 'fontWeight'),
      segmentText: g('[aria-labelledby="rk-q1"] > label', 'fontSize') + ' / ' + g('[aria-labelledby="rk-q1"] > label', 'fontWeight'),
      segmentTextVald: g('[aria-labelledby="rk-q1"] > label:has(input:checked)', 'fontWeight') + ' / ovald ' + g('[aria-labelledby="rk-q1"] > label:has(input:not(:checked))', 'fontWeight'),
      input: g('#rk-inkomst', 'fontSize') + ' / ' + g('#rk-inkomst', 'fontWeight'),
      kr: g('#rk-kr', 'fontSize'),
      placeholderVikt: getComputedStyle(document.querySelector('#rk-inkomst'), '::placeholder').fontWeight,
      etikett: g('#rk-etikett', 'fontSize') + ' / ' + g('#rk-etikett', 'fontWeight') + ' / ls ' + g('#rk-etikett', 'letterSpacing'),
      tal: g('#rk-num', 'fontSize') + ' / ' + g('#rk-num', 'fontWeight') + ' / ' + g('#rk-num', 'fontVariantNumeric'),
      prefix: g('#rk-prefix', 'fontSize') + ' / ' + g('#rk-prefix', 'fontWeight'),
      per: g('#rk-per', 'fontSize') + ' / ' + g('#rk-per', 'fontWeight'),
      not: g('#rk-not', 'fontSize') + ' / ' + g('#rk-not', 'fontWeight'),
      stoppText: g('#rk-stopp-text', 'fontSize') + ' / ' + g('#rk-stopp-text', 'fontWeight'),
      pointerCoarse: matchMedia('(pointer: coarse)').matches,
      subgrid: CSS.supports('grid-template-columns', 'subgrid'),
      sidbakgrund: getComputedStyle(document.body).backgroundColor,
      bandBakgrund: getComputedStyle(document.querySelector('.rk__band')).backgroundColor,
      kortKant: getComputedStyle(document.querySelector('.rk__card')).borderTopColor + ' / skugga ' + getComputedStyle(document.querySelector('.rk__card')).boxShadow,
      q1UnderRader: Math.round(document.querySelector('#rk-q1-under').getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector('#rk-q1-under')).lineHeight)),
      q2Rader: Math.round(document.querySelector('#rk-q2').getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector('#rk-q2')).lineHeight)),
    };
  });
  out[namn] = {
    viewport: `${w}x${h}` + (touch ? ' (touch, pointer: coarse)' : ''),
    typografi: fs,
    rytm: {
      'H2 -> kort': round(kort.y - h2.b),
      'kortpadding topp (kort -> fråga)': round(q1f.y - kort.y),
      'fråga -> underrad (Q1)': round(q1u.y - q1f.b),
      'underrad -> kontroll (Q1)': round(q1k.y - q1u.b),
      'fråga -> kontroll (Q2)': round(q2k.y - q2f.b),
      'fråga -> kontroll (Q3)': round(q3k.y - q3f.b),
      'kontroll -> hårlinje (Q1 / Q2 / Q3)': namn === 'desktop' ? [round(band.y - q1k.b), round(band.y - q2k.b), round(band.y - inp.b)] : round(band.y - inp.b),
      'band: hårlinje -> etikett': round(etik.y - band.y),
      'etikett -> per person (samma spalt)': namn === 'desktop' ? round(per.y - etik.b) : null,
      'etikett -> tal': namn === 'desktop' ? `kvittorad: talets överkant ${round(num.y - etik.y)} från etikettens, talets högerkant ${round(kort.r - 1 - tal.r)} från kortets inre kant (fältets ${round(kort.r - 1 - inp.r)})` : round(tal.y - etik.b),
      'tal -> per person': namn === 'desktop' ? null : round(per.y - tal.b),
      'per person -> femårsrad (reserverad)': namn === 'desktop' ? round(not.y - per.b) : null,
      'femårsradens reserverade höjd': namn === 'desktop' ? round(not.h) : 'reserveras inte på mobil (display: none när tom), se NOTES',
      'femårsrad -> kortets kant': namn === 'desktop' ? round(band.b - not.b) : null,
      'per person -> kortets kant (mobil)': namn === 'mobil' ? round(band.b - per.b) : null,
      'fråga -> fråga (mobil, Q1-kontroll -> Q2-fråga)': namn === 'mobil' ? round(q2f.y - q1k.b) : null,
    },
    matt: {
      kortBredd: round(kort.w), kortHojd: round(kort.h), fragorHojd: round(fragor.h), bandHojd: round(band.h),
      spårHojd: round(q1k.h), segmentBredd: round(q1k.w), optionHojd: round(seg.h), optionBredd: round(seg.w),
      inputHojd: round(inp.h), inputBredd: round(inp.w), typSegmentBredd: round(q3k.w),
      spalter: kol,
      talHojd: round(num.h), talBredd: round(tal.w), bandTomtHoger: round(band.r - tal.r), bandTomtMellan: namn === 'desktop' ? round(tal.x - Math.max(etik.r, per.r)) : null,
    },
    overflowX: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
  };

  /* 2. Tillstånden (renderas och läses) */
  const st = {};
  st.start = await lasBand(page); await klipp(page, `${namn}-0-utgangslage.png`);
  await page.screenshot({ path: join(ut, `rot-${namn}-${w}.png`), fullPage: true });
  await page.click('label:has(input[name="ager"][value="nej"])'); await page.waitForTimeout(350);
  st.nejAgande = await lasBand(page); st.nejAgande.stoppRad = await page.evaluate(() => { const x = document.querySelector('.rk__x').getBoundingClientRect(), t = document.querySelector('#rk-stopp-text').getBoundingClientRect(); return { xStorlek: Math.round(x.width), textRader: Math.round(t.height / (parseFloat(getComputedStyle(document.querySelector('#rk-stopp-text')).lineHeight))), xMittMinusTextMitt: Math.round(((x.top + x.height / 2) - (t.top + t.height / 2)) * 10) / 10 }; });
  await klipp(page, `${namn}-1-nej-agande.png`);
  await page.click('label:has(input[name="ager"][value="ja"])'); await page.waitForTimeout(350);
  st.jaIgen = await lasBand(page);
  await page.click('label:has(input[name="aldre"][value="nej"])'); await page.waitForTimeout(350);
  st.nejFemAr = await lasBand(page); st.nejFemAr.notRader = await page.evaluate(() => Math.round(document.querySelector('#rk-not').getBoundingClientRect().height / 24)); st.nejFemAr.notEgenRad = await page.evaluate(() => document.querySelector('#rk-not').getBoundingClientRect().top >= document.querySelector('#rk-per').getBoundingClientRect().bottom);
  await klipp(page, `${namn}-2-nej-fem-ar.png`);
  await page.click('label:has(input[name="aldre"][value="ja"])');
  await page.fill('#rk-inkomst', '180000'); await page.waitForTimeout(DEBOUNCE);
  st.lon180k = await lasBand(page); st.lon180k.falt = await page.inputValue('#rk-inkomst'); await klipp(page, `${namn}-3-lon-180000.png`);
  await page.click('label:has(input[name="typ"][value="pension"])'); await page.fill('#rk-inkomst', '240000'); await page.waitForTimeout(DEBOUNCE);
  st.pension240k = await lasBand(page); st.pension240k.falt = await page.inputValue('#rk-inkomst'); await klipp(page, `${namn}-4-pension-240000.png`);
  await page.click('label:has(input[name="typ"][value="lon"])'); await page.waitForTimeout(350);
  st.tillbakaLon240k = await lasBand(page);
  await page.fill('#rk-inkomst', '600000'); await page.waitForTimeout(DEBOUNCE);
  st.lon600k = await lasBand(page);
  await page.fill('#rk-inkomst', '1200000'); await page.waitForTimeout(DEBOUNCE);
  st.lon1200k = await lasBand(page);
  st.lon1200k.falt = await page.evaluate(() => { const el = document.querySelector('#rk-inkomst'); return { varde: el.value, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth, klipps: el.scrollWidth > el.clientWidth }; });
  await aterstall(page);
  st.aterstalld = await lasBand(page);
  out[namn].tillstand = st;
  out[namn].kortHojdKonstant = [...new Set(Object.values(st).map((s) => s.kortHojd))];
  out[namn].talFlyttarAldrig = [...new Set(Object.values(st).filter((s) => s.tal).map((s) => s.talY))];
  out[namn].overflowXEfter = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  /* 3. Live-regionen: hur många mutationsbatchar får aria-live-regionen medan "180000" skrivs (80 ms per tangent)? Målet är 1. */
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(200);
  await page.evaluate(() => {
    const el = document.querySelector('.rk__varde');
    window.__batch = 0; window.__mut = 0; window.__texter = [];
    new MutationObserver((recs) => { window.__batch++; window.__mut += recs.length; window.__texter.push(el.innerText.replace(/\s+/g, ' ').trim()); }).observe(el, { subtree: true, childList: true, characterData: true, attributes: true });
  });
  await page.focus('#rk-inkomst');
  for (const ch of '180000') { await page.keyboard.type(ch); await page.waitForTimeout(80); }
  const underTid = await page.evaluate(() => ({ batcharMedanHonSkriver: window.__batch, talMedanHonSkriver: document.querySelector('#rk-tal').innerText.replace(/\s+/g, ' ').trim() }));
  await page.waitForTimeout(DEBOUNCE);
  out[namn].live = { ...underTid, ...(await page.evaluate(() => ({ batchar: window.__batch, mutationer: window.__mut, upplast: window.__texter, ariaLive: document.querySelector('.rk__varde').getAttribute('aria-live'), atomic: document.querySelector('.rk__varde').getAttribute('aria-atomic') }))) };
  /* Enter i fältet: räknar direkt, laddar inte om */
  await page.fill('#rk-inkomst', '360000'); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  out[namn].enter = { url: page.url().replace(/^.*\/kalkylator/, ''), tal: norm(await page.textContent('#rk-tal')), falt: await page.inputValue('#rk-inkomst') };

  /* 4. Grön teknik: rubrik, etikett, fråga 2 dold, stoppets mening, femårsraden aldrig */
  await page.goto(url('gt'), { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(100);
  const gt = { h2: norm(await page.textContent('#rk-h2')), titel: await page.title(), fraga2Dold: await page.isHidden('#rk-q2-block'), fraga2Fokuserbar: await page.evaluate(() => { const r = document.querySelector('input[name="aldre"]'); r.focus(); return document.activeElement === r; }), ...(await lasBand(page)) };
  gt.spalter = await page.evaluate(() => [...document.querySelectorAll('.rk__q')].filter((q) => !q.hidden).map((q) => ({ bredd: Math.round(q.getBoundingClientRect().width), fragaTillKontroll: Math.round((q.querySelector('.rk__seg').getBoundingClientRect().top - (q.querySelector('.rk__under') || q.querySelector('.rk__fraga')).getBoundingClientRect().bottom) * 10) / 10, underradRader: q.querySelector('.rk__under') ? Math.round(q.querySelector('.rk__under').getBoundingClientRect().height / 24) : null })));   /* från underraden där den finns (Q1), till segmentet (kontrollens padding är luften) */
  gt.h2Rader = await page.evaluate(() => Math.round(document.querySelector('#rk-h2').getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector('#rk-h2')).lineHeight)));
  gt.h2RadTexter = await page.evaluate(() => { const r = document.createRange(); const el = document.querySelector('#rk-h2'); r.selectNodeContents(el); const rects = [...r.getClientRects()]; const rader = new Map(); rects.forEach((x) => { const k = Math.round(x.top); rader.set(k, (rader.get(k) || 0) + x.width); }); return [...rader.values()].map((v) => Math.round(v)); });
  gt.nobrHel = await page.evaluate(() => [...document.querySelectorAll('.rk__nobr')].every((s) => s.getClientRects().length === 1));
  await klipp(page, `${namn}-gt-0-utgangslage.png`);
  await page.screenshot({ path: join(ut, `gt-${namn}-${w}.png`), fullPage: true });
  await page.click('label:has(input[name="ager"][value="nej"])'); await page.waitForTimeout(350);
  gt.nejAgande = await lasBand(page);
  gt.nejAgande.stopptextNobrHel = await page.evaluate(() => [...document.querySelectorAll('#rk-stopp-text .rk__nobr')].every((s) => s.getClientRects().length === 1));
  await klipp(page, `${namn}-gt-nej-agande.png`);
  await page.click('label:has(input[name="ager"][value="ja"])'); await page.waitForTimeout(350);
  gt.jaIgen = await lasBand(page);
  out[namn].gt = gt;

  /* 5. Tangentbord: tab till första segmentet, pil höger = Nej; fokusring ur systemet */
  await page.goto(url('rot'), { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(350);
  out[namn].tangentbord = { efterPilHoger: (await lasBand(page)).status, fokusRing: await page.evaluate(() => getComputedStyle(document.querySelector('label:has(input[name="ager"]:focus-visible)') || document.body).boxShadow) };
  await page.close();
}

/* 6. Mobil: iPhone-fönster 390 x 664 (Safari med fält): ligger stoppbeskedet helt ovanför vikningen? Tangentbord uppe (390 x 370): syns talet? */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await page.goto(url('rot'), { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(100);
  const fore = await page.evaluate(() => { const b = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; }; return { tal: b('#rk-num'), falt: b('#rk-inkomst'), kort: b('.rk__card') }; });
  await page.click('label:has(input[name="ager"][value="nej"])'); await page.waitForTimeout(400);
  const stopp = await page.evaluate(() => { const r = document.querySelector('#rk-stopp').getBoundingClientRect(), t = document.querySelector('#rk-stopp-text').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), textBottom: Math.round(t.bottom) }; });
  await page.screenshot({ path: join(ut, 'mobil-664-nej-agande.png') });
  out.mobil.fonster664 = { ...fore, stopp, stoppHeltSynligt: stopp.bottom <= 664, talHeltSynligt: fore.tal.bottom <= 664 };
  await page.close();
  const p2 = await browser.newPage({ viewport: { width: 390, height: 370 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p2.goto(url('rot'), { waitUntil: 'networkidle' }); await p2.waitForTimeout(200);
  await p2.focus('#rk-inkomst'); await p2.evaluate(() => document.querySelector('#rk-inkomst').scrollIntoView({ block: 'nearest' }));
  await p2.keyboard.type('180000'); await p2.waitForTimeout(DEBOUNCE);
  out.mobil.tangentbord370 = await p2.evaluate(() => { const b = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; }; const tal = b('#rk-num'), falt = b('#rk-inkomst'); return { tal, falt, talSynligt: tal.top >= 0 && tal.bottom <= innerHeight, faltSynligt: falt.top >= 0 && falt.bottom <= innerHeight, talText: document.querySelector('#rk-tal').innerText.replace(/\s+/g, ' ').trim() }; });
  await p2.close();
}

/* 7. Jämförelsen för NOTES: R1-1:s två spalter (fråga 1 + 2 staplade vänster, inkomsten höger) med injicerad CSS, inga filer ändras */
{
  const varianter = {
    'tva-spalter-R1': `.rk__fragor{grid-template-columns:1fr 1.3fr} .rk__q--femar{grid-column:1;border-left:0 !important;border-top:1px solid var(--ampy-line);padding:var(--ampy-space-m) 0 0;margin-top:var(--ampy-space-m)} .rk__q--inkomst{grid-column:2;grid-row:1/span 2}`,
    'tva-spalter-28': `.rk__fragor{grid-template-columns:1fr 1.3fr} .rk__q--femar{grid-column:1;border-left:0 !important;padding:0;margin-top:var(--ampy-space-m)} .rk__q--inkomst{grid-column:2;grid-row:1/span 2}`,
  };
  out.jamforelse = {};
  for (const [namn, css] of Object.entries(varianter)) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
    await page.goto(url('rot'), { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: css }); await page.waitForTimeout(150);
    out.jamforelse[namn] = await page.evaluate(() => {
      const qs = [...document.querySelectorAll('.rk__q')]; const card = document.querySelector('.rk__card').getBoundingClientRect();
      return { kortHojd: Math.round(card.height * 10) / 10, fragaTillKontroll: qs.map((q) => Math.round((q.querySelector('.rk__seg').getBoundingClientRect().top - (q.querySelector('.rk__under') || q.querySelector('.rk__fraga')).getBoundingClientRect().bottom) * 10) / 10), tomtUnderKontroll: qs.map((q) => Math.round((q.getBoundingClientRect().bottom - q.querySelector('.rk__kontroll').getBoundingClientRect().bottom) * 10) / 10), spaltHojd: qs.map((q) => Math.round(q.getBoundingClientRect().height)) };
    });
    const r = await rect(page, '.rk');
    await page.screenshot({ path: join(ut, `alt-${namn}-desktop.png`), clip: { x: r.x - 24, y: r.y - 24, width: r.w + 48, height: r.h + 48 } });
    await page.close();
  }
}

/* 8. Kraven, sammanfattade */
const d = out.desktop, m = out.mobil;
out.krav = {
  'inga fel': out.errors.length === 0,
  'ingen horisontell scroll': !d.overflowX && !m.overflowX && !d.overflowXEfter && !m.overflowXEfter,
  'fråga -> kontroll 14 i alla spalter (desktop)': [d.rytm['underrad -> kontroll (Q1)'], d.rytm['fråga -> kontroll (Q2)'], d.rytm['fråga -> kontroll (Q3)']].every((v) => v === 14) && d.gt.spalter.every((s) => s.fragaTillKontroll === 14),
  '"1 200 000" klipps inte': !d.tillstand.lon1200k.falt.klipps && !m.tillstand.lon1200k.falt.klipps,
  'alternativets höjd 44 på touch (mobil)': m.matt.optionHojd === 44 && m.matt.spårHojd === 48,
  'en aria-live-batch efter "180000"': d.live.batchar === 1 && m.live.batchar === 1,
  'inget "ca 0 kr" medan hon skriver': !d.live.talMedanHonSkriver.startsWith('ca 0') && d.live.batcharMedanHonSkriver === 0,
  '?m=gt utan femårsfrågan': d.gt.fraga2Dold && !d.gt.fraga2Fokuserbar && m.gt.fraga2Dold && d.gt.nejAgande.stopp === 'Eftersom du inte äger din bostad har du inte rätt till grön teknik-avdrag.',
  'kortet <= 460 desktop': d.matt.kortHojd <= 460 && d.gt.kortHojd <= 460,
  'kortet <= 640 mobil (utgångsläget)': m.matt.kortHojd <= 640 && m.gt.kortHojd <= 640,
  'stoppbeskedet helt ovanför 664 (mobil)': m.fonster664.stoppHeltSynligt,
  'kortet byter aldrig höjd (desktop, alla tillstånd)': d.kortHojdKonstant.length === 1,
  'talet flyttar aldrig (desktop)': d.talFlyttarAldrig.length === 1,
  'femårsraden på egen rad': d.tillstand.nejFemAr.notEgenRad && m.tillstand.nejFemAr.notEgenRad,
  '"grön teknik-avdrag" obrutet (H2 + stopptext, mobil)': m.gt.nobrHel && m.gt.nejAgande.stopptextNobrHel,
  'Enter laddar inte om': !d.enter.url.includes('ager=') && d.enter.falt === '360 000',
  'sidan vit, bandet sky mist': d.typografi.sidbakgrund === 'rgb(255, 255, 255)' && d.typografi.bandBakgrund === 'rgb(245, 249, 255)',
};
await browser.close(); server.close();
await writeFile(join(ut, 'probe.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
