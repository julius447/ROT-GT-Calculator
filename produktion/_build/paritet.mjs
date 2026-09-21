#!/usr/bin/env node
/*
 * paritet.mjs: bevisar att snippet-paketet (dist/, laddat BY REFERENCE) renderar och beter sig exakt som referensen.
 * Två grupper. A: fixturen _build/prov/tva-instanser.html (två instanser på en tom sida) mot kalkylator/v1/index.html
 * (?m=rot mot instans 1, ?m=gt mot instans 2), i Chromium vid 1280×900 (fin pekare) och 390×844 (touch, dsf 2).
 * B (leveransen): produktion/preview/artikel-rot|gt.html (paketet överst i artikelmallen) mot referensklonen
 * kalkylator/artikel/index.html?m=rot|gt (v1-källan på samma plats) vid 1440, 1024 och 390: samma lägen och mått för
 * rubrik, kort och nästa block (Snabbt svar), samma datorstilar, pixel-lika skärmdump av rubrik + kort + luften under,
 * motorn igång (300 000 -> ca 31 000 kr, Nej -> stopp) och fokuskanten teal-deep inuti sajtens riktiga CSS.
 * Kör: node produktion/_build/paritet.mjs   (exit 1 vid drift)
 *
 *   1. konsol + nät: 0 pageerror, 0 error/warning, 0 anrop utanför localhost (typsnittet mappas till dist/fonts)
 *   2. DOM: 0 dubbla id:n med två instanser, alla for/aria-* löser, legend först, template finns, samma antal tabbstopp
 *   3. datorstilar: font-family/size/weight/line-height/letter-spacing/color/padding/margin/kant/radie/skugga m.m. på
 *      wrapper, H2, fråga, underrad, segment (ovald + vald), fält (+placeholder), enhet, länk, panel, eyebrow, tal,
 *      prefix, per-rad, disclaimer, stopp, not; plus kortets bredd/höjd och det omvandlade rem-fältet (140 px)
 *   4. tillståndsvandring: 9 tillstånd, beskedets text + status lika (300 000 -> "ca 31 000 kr", Nej -> stopp, ...)
 *   5. fokus: tangentbordsfokus på inkomstfältet = teal-deep kant + ring; "Lägg till" = 2 px navy outline; segmentpill
 *   6. två instanser oberoende: Nej/180 000 i instans 2 rör inte instans 1 och tvärtom; Person 2 får unika id:n
 *   7. skärmdumpar (kortet, överkanten snäppt till hel px) referens mot kandidat: byte-lika eller <= 0,1 % pixlar (diffbild i _build/out/)
 *   8. reduced motion: animationen nollad i båda
 *   9. textprov: kortets innerText lika
 *   host-sim.html: samma stilprov + fokusprov inuti sajtens riktiga CSS (M1-provet: input:focus !important)
 *   artikel (grupp B): se ovan
 *
 * Tröskel: exakt lika, eller px-värden inom 0,5 px. Skriver _build/out/paritet.json + skärmdumpar.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat, readdir, unlink } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync, deflateSync } from 'node:zlib';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(dirname(HERE));
const OUTDIR = join(HERE, 'out');
const { chromium } = await import(join(ROOT, 'tools/node_modules/playwright/index.mjs'));

/* ---------- statisk server: repo-roten, /wp-content/uploads/fonts/* -> produktion/dist/fonts/* ---------- */
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.woff2': 'font/woff2', '.json': 'application/json', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.startsWith('/wp-content/uploads/fonts/')) p = '/produktion/dist/fonts/' + p.slice('/wp-content/uploads/fonts/'.length);
    let f = join(ROOT, p);
    if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(f)] || 'application/octet-stream' });
    res.end(await readFile(f));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;
const URLS = {
  ref: (mode) => `${BASE}/kalkylator/v1/index.html?m=${mode}`,
  cand: `${BASE}/produktion/_build/prov/tva-instanser.html`,
  host: `${BASE}/produktion/_build/prov/host-sim.html`,
  artRef: (mode) => `${BASE}/kalkylator/artikel/index.html?m=${mode}`,
  artCand: (mode) => `${BASE}/produktion/preview/artikel-${mode}.html`,
};
const SEC = { ref: '#avdragskollen', cand1: '#ak1-avdragskollen', cand2: '#ak2-avdragskollen' };
const WRAPPER = { ref: 'body', cand1: '#ak1-avdragskollen', cand2: '#ak2-avdragskollen' };   // kandidatens wrapper = sektionens .ampy-avdragskollen-förälder (löses i sidan)

/* ---------- resultatbok ---------- */
const rows = [];
let fel = 0;
function rad(grupp, kontroll, ref, cand, ok, kommentar = '') {
  rows.push({ grupp, kontroll, ref: String(ref), cand: String(cand), ok, kommentar });
  if (!ok) fel++;
}
const nums = (s) => (String(s).match(/-?\d*\.?\d+/g) || []).map(Number);
const skeleton = (s) => String(s).replace(/-?\d*\.?\d+/g, '#');
/** Lika, eller samma form med varje tal inom 0,5 (px-drift). */
function lika(a, b, tol = 0.5) {
  if (a === b) return true;
  if (skeleton(a) !== skeleton(b)) return false;
  const na = nums(a), nb = nums(b);
  return na.length === nb.length && na.every((v, i) => Math.abs(v - nb[i]) <= tol);
}

/* ---------- i sidan: datorstilar ---------- */
const PROPS = ['fontFamily', 'fontWeight', 'fontSize', 'fontStyle', 'fontVariantNumeric', 'fontFeatureSettings', 'fontKerning', 'lineHeight', 'letterSpacing', 'color', 'backgroundColor',
  'padding', 'margin', 'border', 'borderRadius', 'boxShadow', 'outline', 'outlineOffset', 'minHeight', 'width', 'height', 'maxWidth', 'display', 'position', 'boxSizing', 'overflow',
  'gridTemplateColumns', 'gridTemplateRows', 'gridAutoColumns', 'gridAutoFlow', 'gap', 'flex', 'flexDirection', 'flexWrap', 'alignItems', 'justifyContent', 'containerType', 'containerName',
  'whiteSpace', 'textTransform', 'textAlign', 'textDecorationLine', 'textDecorationThickness', 'textUnderlineOffset', 'textWrap', 'textRendering', 'webkitFontSmoothing', 'verticalAlign',
  'fill', 'opacity', 'visibility', 'transition', 'transform', 'animation', 'cursor', 'pointerEvents', 'appearance'];   // 'border' = per sida, färg bara där bredden > 0
const WRAP_PROPS = ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing', 'color', 'webkitFontSmoothing', 'textRendering'];
const ELEMENT = [
  ['kort', ''], ['etikett', '.rk__etikett'], ['under', '.rk__under'], ['segment', '.rk__segment'],
  ['segLabelOvald', '.rk__segment > label:not(:has(input:checked))'], ['segLabelVald', '.rk__segment > label:has(input:checked)'],
  ['input', '.rk__input'], ['inputPlaceholder', '.rk__input::placeholder'], ['enhet', '.rk__enhet'], ['lagg', '.rk__lagg .rk__lank'],
  ['panel', '.rk__panel'], ['eyebrow', '.rk__eyebrow'], ['talrad', '.rk__talrad'], ['tal', '.rk__tal'], ['prefix', '.rk__prefix'],
  ['talenhet', '.rk__talenhet'], ['per', '.rk__per'], ['fin', '.rk__fin'], ['stopp', '.rk__stopp'], ['stopptext', '.rk__stopptext'],
  ['xCircle', '.rk__x circle'], ['not', '.rk__not'], ['radBelopp', '.rk__fraga--ranta > .rk__belopp'], ['personetikett', '.rk__personetikett'],
];
function styleSpot({ secSel, props, wrapProps, elements, wrapSel }) {
  const sec = document.querySelector(secSel);
  const wrap = (wrapSel && sec.closest(wrapSel)) || sec.closest('.ampy-avdragskollen') || document.body;
  const rubrik = wrap.querySelector('.rk__rubrik');
  const out = {};
  const grab = (el, ps, pseudo) => {
    if (!el) return null;
    const cs = getComputedStyle(el, pseudo || null);
    const o = {};
    for (const p of ps) o[p] = p === 'border'
      ? ['Top', 'Right', 'Bottom', 'Left'].map((sida) => cs['border' + sida + 'Width'] === '0px' ? '0' : `${cs['border' + sida + 'Width']} ${cs['border' + sida + 'Style']} ${cs['border' + sida + 'Color']}`).join(' / ')
      : cs[p];
    if (!pseudo) { const r = el.getBoundingClientRect(); o.w = Math.round(r.width * 2) / 2; o.h = Math.round(r.height * 2) / 2; }
    return o;
  };
  out.wrapper = grab(wrap, wrapProps);
  for (const [key, sel] of elements) {
    if (sel === '') out[key] = grab(sec, props);
    else if (sel === '@rubrik') out[key] = grab(rubrik, props);
    else if (sel.endsWith('::placeholder')) out[key] = grab(sec.querySelector(sel.replace('::placeholder', '')), props, '::placeholder');
    else out[key] = grab(sec.querySelector(sel), props);
  }
  return out;
}
function domCheck(secSel) {
  const sec = document.querySelector(secSel);
  const wrap = sec.closest('.ampy-avdragskollen') || document.body;
  const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  const refs = [];
  for (const el of wrap.querySelectorAll('[for],[aria-labelledby],[aria-describedby]')) {
    for (const attr of ['for', 'aria-labelledby', 'aria-describedby']) {
      const v = el.getAttribute(attr); if (!v) continue;
      for (const id of v.split(/\s+/)) if (!document.getElementById(id)) refs.push(attr + '=' + id);
    }
  }
  const legends = [...wrap.querySelectorAll('fieldset')].map((f) => f.firstElementChild && f.firstElementChild.tagName === 'LEGEND');
  const tabbable = [...wrap.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter((e) => !e.disabled && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden').length;
  const radios = new Set([...wrap.querySelectorAll('input[type=radio]')].map((r) => r.name));
  return { dup: [...new Set(dup)], refs, legendsOk: legends.every(Boolean), legends: legends.length, templates: wrap.querySelectorAll('template').length, tabbable, radioGroups: [...radios].sort().join(',') };
}
const resultText = (secSel) => {
  const r = document.querySelector(secSel + ' .rk__resultat');
  const t = (el) => el.innerText.replace(/[\s\u00a0\u202f]+/g, ' ').trim();
  const stopp = document.querySelector(secSel + ' .rk__stopp');
  return { status: r.dataset.status, text: t(r), tal: stopp.hidden ? t(document.querySelector(secSel + ' .rk__talrad')) : 'stopp: ' + t(stopp), eyebrow: document.querySelector(secSel + ' .rk__eyebrow').textContent, per: t(document.querySelector(secSel + ' .rk__per')), not: document.querySelector(secSel + ' .rk__not').textContent, stoppHidden: stopp.hidden, notHidden: document.querySelector(secSel + ' .rk__not').hidden };
};

/* ---------- tillstånd (samma handlingar i referens och kandidat; selektorer utan id:n) ---------- */
async function klickLabel(page, sec, inputSel) { await page.locator(`${sec} label:has(${inputSel})`).first().click(); await page.waitForTimeout(60); }
async function fyll(page, sec, falt, v, nth = 0) {
  const loc = page.locator(`${sec} [data-falt="${falt}"]`).nth(nth);
  await loc.fill(v); await loc.blur(); await page.waitForTimeout(80);
}
const STATES = (mode) => ({
  '1 start': async () => {},
  '2 äger=nej': async (p, s) => klickLabel(p, s, 'input[name$="ager"][value="nej"]'),
  '3 under 18': async (p, s) => klickLabel(p, s, 'input[name$="alder-1"][value="u18"]'),
  '4 lön 180 000': async (p, s) => fyll(p, s, 'inkomst', '180000'),
  '5 pension 240 000, över 65': async (p, s) => { await klickLabel(p, s, 'input[name$="typ-1"][value="pension"]'); await klickLabel(p, s, 'input[name$="alder-1"][value="66+"]'); await fyll(p, s, 'inkomst', '240000'); },
  '6 lön 1 200 000': async (p, s) => fyll(p, s, 'inkomst', '1200000'),
  '7 lön 300 000 + ränta 50 000': async (p, s) => { await fyll(p, s, 'inkomst', '300000'); await fyll(p, s, 'ranta', '50000'); },
  '8 två personer (180 000 + tom)': async (p, s) => { await fyll(p, s, 'inkomst', '180000'); await p.locator(`${s} .rk__lagg .rk__lank`).click(); await p.waitForTimeout(80); },
  '9 fyra personer': async (p, s) => { for (let i = 0; i < 3; i++) { await p.locator(`${s} .rk__lagg .rk__lank`).click(); await p.waitForTimeout(60); } },
  '10 lön 300 000': async (p, s) => fyll(p, s, 'inkomst', '300000'),
});

/* ---------- PNG: minimal avkodare/kodare (8-bit RGB/RGBA, ointerlaced) för pixeldiffen, inga beroenden ---------- */
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function pngDecode(buf) {
  let pos = 8; let w, h, ct; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos + 4, pos + 8); const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); if (data[8] !== 8 || data[12] !== 0) throw new Error('png: bara 8-bit ointerlaced'); ct = data[9]; }
    else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : (() => { throw new Error('png: färgtyp ' + ct); })();
  const raw = inflateSync(Buffer.concat(idat)); const stride = w * bpp; const px = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)]; const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      if (f === 1) line[i] = (line[i] + a) & 255; else if (f === 2) line[i] = (line[i] + b) & 255; else if (f === 3) line[i] = (line[i] + ((a + b) >> 1)) & 255;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); line[i] = (line[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255; }
    }
    for (let x = 0; x < w; x++) { const s = x * bpp, d = (y * w + x) * 4; px[d] = line[s]; px[d + 1] = line[s + 1]; px[d + 2] = line[s + 2]; px[d + 3] = bpp === 4 ? line[s + 3] : 255; }
    prev = line;
  }
  return { w, h, px };
}
function pngEncode({ w, h, px }) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
function pixelDiff(aBuf, bBuf) {
  const a = pngDecode(aBuf), b = pngDecode(bBuf);
  if (a.w !== b.w || a.h !== b.h) return { pct: 100, olika: -1, storlek: `${a.w}×${a.h} mot ${b.w}×${b.h}`, diff: null };
  const diff = Buffer.from(a.px); let olika = 0;
  for (let i = 0; i < a.px.length; i += 4) {
    const d = Math.abs(a.px[i] - b.px[i]) + Math.abs(a.px[i + 1] - b.px[i + 1]) + Math.abs(a.px[i + 2] - b.px[i + 2]);
    if (d > 24) { olika++; diff[i] = 255; diff[i + 1] = 0; diff[i + 2] = 0; diff[i + 3] = 255; }
    else { diff[i] = 255 - ((255 - a.px[i]) >> 2); diff[i + 1] = 255 - ((255 - a.px[i + 1]) >> 2); diff[i + 2] = 255 - ((255 - a.px[i + 2]) >> 2); }
  }
  return { pct: (100 * olika) / (a.w * a.h), olika, storlek: `${a.w}×${a.h}`, diff: pngEncode({ w: a.w, h: a.h, px: diff }) };
}

/* ---------- körningen ---------- */
await mkdir(OUTDIR, { recursive: true });
for (const f of await readdir(OUTDIR)) if (/^diff-.*\.png$/.test(f)) await unlink(join(OUTDIR, f));   // gamla diffbilder bort: bara den här körningens bevis ligger kvar
const browser = await chromium.launch();
const VIEWPORTS = [
  ['1280', { viewport: { width: 1280, height: 900 } }],
  ['390', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }],
];
const json = { viewports: {} };

function bevaka(page, tag) {
  const log = { errors: [], requests: [] };
  page.on('pageerror', (e) => log.errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) log.errors.push(m.type() + ': ' + m.text()); });
  page.on('request', (r) => log.requests.push(r.url()));
  page._bevak = log; page._tag = tag;
  return page;
}
async function open(ctx, url, tag) {
  const page = bevaka(await ctx.newPage(), tag);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  return page;
}
async function tabTill(page, sel, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate((s) => { const a = document.activeElement; return !!a && a.matches(s); }, sel)) return true;
  }
  return false;
}
async function fokusProv(page, sec, tag, vp) {
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  const ok = await tabTill(page, `${sec} [data-falt="inkomst"]`);
  await page.waitForTimeout(400);
  const f = await page.evaluate((s) => { const el = document.querySelector(s + ' [data-falt="inkomst"]'); const cs = getComputedStyle(el); return { boxShadow: cs.boxShadow, borderColor: cs.borderColor, outline: cs.outlineStyle + ' ' + cs.outlineWidth }; }, sec);
  rad(`${vp} fokus ${tag}`, 'Tab når inkomstfältet', 'true', ok, ok);
  rad(`${vp} fokus ${tag}`, 'inkomstfält: box-shadow', 'rgba(0, 122, 105, 0.9) 0px 0px 0px 3px', f.boxShadow, f.boxShadow === 'rgba(0, 122, 105, 0.9) 0px 0px 0px 3px');
  rad(`${vp} fokus ${tag}`, 'inkomstfält: border-color', 'rgb(0, 122, 105)', f.borderColor, f.borderColor === 'rgb(0, 122, 105)');
  rad(`${vp} fokus ${tag}`, 'inkomstfält: outline', 'none 0px', f.outline, f.outline === 'none 0px');
  const ok2 = await tabTill(page, `${sec} .rk__lagg .rk__lank`);
  await page.waitForTimeout(250);
  const l = await page.evaluate((s) => { const cs = getComputedStyle(document.querySelector(s + ' .rk__lagg .rk__lank')); return cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor; }, sec);
  rad(`${vp} fokus ${tag}`, 'Lägg till: outline (tangentbord)', 'solid 2px rgb(9, 11, 50)', l, ok2 && l === 'solid 2px rgb(9, 11, 50)');
  // segmentpill: Shift+Tab bakåt till typ-radion (Lön)
  await page.evaluate((s) => document.querySelector(s + ' input[name$="typ-1"]:checked').focus({ focusVisible: true }), sec);
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  await page.waitForTimeout(250);
  const seg = await page.evaluate((s) => { const lab = document.querySelector(s + ' .rk__segment[data-q="typ"] > label:has(input:focus-visible)'); return lab ? getComputedStyle(lab).boxShadow : 'ingen label med input:focus-visible'; }, sec);
  rad(`${vp} fokus ${tag}`, 'segmentpill (typ): ring på labeln', 'rgba(0, 122, 105, 0.9) 0px 0px 0px 3px', seg, seg === 'rgba(0, 122, 105, 0.9) 0px 0px 0px 3px');
}

const jamforStilar = (grupp, refS, candS, elementList = ELEMENT) => {
  let n = 0, drift = 0;
  for (const p of WRAP_PROPS) { n++; if (!lika(refS.wrapper[p], candS.wrapper[p])) { drift++; rad(grupp, `wrapper.${p}`, refS.wrapper[p], candS.wrapper[p], false); } }
  for (const [key] of elementList) {
    const a = refS[key], b = candS[key];
    if (!a || !b) { rad(grupp, key, a ? 'finns' : 'saknas', b ? 'finns' : 'saknas', false); continue; }
    for (const p of Object.keys(a)) { n++; if (!lika(a[p], b[p])) { drift++; rad(grupp, `${key}.${p}`, a[p], b[p], false); } }
  }
  rad(grupp, `datorstilar lika (${n} värden på ${elementList.length + 1} element)`, n, n - drift, drift === 0, drift ? `${drift} avvikelser ovan` : '');
};

for (const [vp, opts] of VIEWPORTS) {
  const ctx = await browser.newContext(opts);
  const J = (json.viewports[vp] = {});

  /* --- referens + kandidat + host laddade --- */
  const refRot = await open(ctx, URLS.ref('rot'), 'ref-rot');
  const refGt = await open(ctx, URLS.ref('gt'), 'ref-gt');
  const cand = await open(ctx, URLS.cand, 'cand');
  const host = await open(ctx, URLS.host, 'host');

  /* 1. konsol + nät */
  for (const p of [refRot, refGt, cand, host]) {
    rad(`${vp} konsol`, `${p._tag}: fel/varningar`, '0', p._bevak.errors.length, p._bevak.errors.length === 0, p._bevak.errors.join(' | ').slice(0, 200));
    const ext = p._bevak.requests.filter((u) => !u.startsWith(BASE));
    rad(`${vp} nät`, `${p._tag}: anrop utanför localhost`, '0', ext.length, ext.length === 0, ext.join(' ').slice(0, 200));
  }
  const fontReq = cand._bevak.requests.filter((u) => /Outfit-VariableFont_wght\.woff2/.test(u)).map((u) => u.replace(BASE, ''));
  rad(`${vp} nät`, 'kandidat: typsnittet hämtas via dist-CSS:ens sajtsökväg', '/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2', fontReq.join(' '), fontReq.includes('/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2'));
  J.requests = { cand: cand._bevak.requests.map((u) => u.replace(BASE, '')), host: host._bevak.requests.map((u) => u.replace(BASE, '')) };

  /* 2. DOM */
  const dRef = { rot: await refRot.evaluate(domCheck, SEC.ref), gt: await refGt.evaluate(domCheck, SEC.ref) };
  const dCand = { rot: await cand.evaluate(domCheck, SEC.cand1), gt: await cand.evaluate(domCheck, SEC.cand2) };
  rad(`${vp} DOM`, 'kandidat: dubbla id:n i hela dokumentet (två instanser)', '[]', JSON.stringify(dCand.rot.dup), dCand.rot.dup.length === 0);
  for (const m of ['rot', 'gt']) {
    rad(`${vp} DOM`, `${m}: hängande for/aria-referenser`, JSON.stringify(dRef[m].refs), JSON.stringify(dCand[m].refs), dCand[m].refs.length === 0 && dRef[m].refs.length === 0);
    rad(`${vp} DOM`, `${m}: legend först i varje fieldset`, `${dRef[m].legendsOk}/${dRef[m].legends}`, `${dCand[m].legendsOk}/${dCand[m].legends}`, dCand[m].legendsOk && dCand[m].legends === dRef[m].legends);
    rad(`${vp} DOM`, `${m}: template finns`, dRef[m].templates, dCand[m].templates, dCand[m].templates === 1);
    rad(`${vp} DOM`, `${m}: tabbstopp`, dRef[m].tabbable, dCand[m].tabbable, dRef[m].tabbable === dCand[m].tabbable);
  }
  rad(`${vp} DOM`, 'radionamn per instans prefixade', 'ak1-ager,ak1-alder-1,ak1-aldre,ak1-typ-1', dCand.rot.radioGroups, dCand.rot.radioGroups === 'ak1-ager,ak1-alder-1,ak1-aldre,ak1-typ-1');
  J.dom = { ref: dRef, cand: dCand };

  /* 3. datorstilar (utgångsläget) */
  J.styles = {};
  const sRefRot = await refRot.evaluate(styleSpot, { secSel: SEC.ref, props: PROPS, wrapProps: WRAP_PROPS, elements: ELEMENT });
  const sRefGt = await refGt.evaluate(styleSpot, { secSel: SEC.ref, props: PROPS, wrapProps: WRAP_PROPS, elements: ELEMENT });
  const sCand1 = await cand.evaluate(styleSpot, { secSel: SEC.cand1, props: PROPS, wrapProps: WRAP_PROPS, elements: ELEMENT });
  const sCand2 = await cand.evaluate(styleSpot, { secSel: SEC.cand2, props: PROPS, wrapProps: WRAP_PROPS, elements: ELEMENT });
  const sHost1 = await host.evaluate(styleSpot, { secSel: SEC.cand1, props: PROPS, wrapProps: WRAP_PROPS, elements: ELEMENT });
  const sHost2 = await host.evaluate(styleSpot, { secSel: SEC.cand2, props: PROPS, wrapProps: WRAP_PROPS, elements: ELEMENT });
  J.styles = { refRot: sRefRot, refGt: sRefGt, cand1: sCand1, cand2: sCand2, host1: sHost1, host2: sHost2 };
  jamforStilar(`${vp} stil rot`, sRefRot, sCand1);
  jamforStilar(`${vp} stil gt`, sRefGt, sCand2);
  jamforStilar(`${vp} stil host rot`, sRefRot, sHost1);
  jamforStilar(`${vp} stil host gt`, sRefGt, sHost2);
  rad(`${vp} stil rot`, 'kortets bredd × höjd', `${sRefRot.kort.w} × ${sRefRot.kort.h}`, `${sCand1.kort.w} × ${sCand1.kort.h}`, lika(`${sRefRot.kort.w} × ${sRefRot.kort.h}`, `${sCand1.kort.w} × ${sCand1.kort.h}`));
  rad(`${vp} stil gt`, 'kortets bredd × höjd', `${sRefGt.kort.w} × ${sRefGt.kort.h}`, `${sCand2.kort.w} × ${sCand2.kort.h}`, lika(`${sRefGt.kort.w} × ${sRefGt.kort.h}`, `${sCand2.kort.w} × ${sCand2.kort.h}`));
  rad(`${vp} stil rot`, 'rotens font-size (wrapper)', sRefRot.wrapper.fontSize, sCand1.wrapper.fontSize, lika(sRefRot.wrapper.fontSize, sCand1.wrapper.fontSize));
  rad(`${vp} stil rot`, 'detaljradens fält (140 px = 14rem omvandlat)', sRefRot.radBelopp.w, sCand1.radBelopp.w, lika(sRefRot.radBelopp.w, sCand1.radBelopp.w));
  rad(`${vp} stil rot`, 'html font-size (kandidatsidan är 16 px: 0 rem-beroende)', await refRot.evaluate(() => getComputedStyle(document.documentElement).fontSize), await cand.evaluate(() => getComputedStyle(document.documentElement).fontSize), true, 'informativt');

  /* 9. textprov */
  for (const [m, rp, cs] of [['rot', refRot, SEC.cand1], ['gt', refGt, SEC.cand2]]) {
    const tr = await rp.evaluate((s) => document.querySelector(s).innerText.replace(/[\s  ]+/g, ' ').trim(), SEC.ref);
    const tc = await cand.evaluate((s) => document.querySelector(s).innerText.replace(/[\s  ]+/g, ' ').trim(), cs);
    rad(`${vp} text ${m}`, 'kortets innerText lika', tr.length + ' tecken', tc.length + ' tecken', tr === tc, tr === tc ? '' : 'skiljer');
    const hr = await rp.evaluate((s) => document.querySelector('.rk__rubrik').innerHTML, SEC.ref);
    const hc = await cand.evaluate((s) => document.querySelector(s).closest('.ampy-avdragskollen').querySelector('.rk__rubrik').innerHTML, cs);
    rad(`${vp} text ${m}`, 'rubrikens innerHTML lika (gt: span.rk__ihop)', hr, hc, hr === hc);
  }

  /* 7. skärmdumpar: rubrik + kort */
  /* Klippet är kortet (inte rubriken): paketets rubrik följer artikelmallens H2 (block 8), v1:s följer designsystemet. */
  /* Kortets överkant snäpps till hel pixel i båda sidorna (padding-top på html = avståndet upp till nästa hela px):
     rubrikerna är olika höga (43,19 mot 39,89 px vid 1280) så kortet börjar annars på olika bråkdelar av en pixel och
     texten rastreras olika (0,26 till 1,54 % pixlar utan snäppet, inget verkligt fel). */
  const snapp = async (page, secSel) => page.evaluate((s) => { const html = document.documentElement; html.style.paddingTop = '0px'; const t = document.querySelector(s).getBoundingClientRect().top; const d = Math.ceil(t) - t; html.style.paddingTop = (d > 0.001 ? d : 0) + 'px'; return document.querySelector(s).getBoundingClientRect().top; }, secSel);
  const clipOf = async (page, secSel) => page.evaluate((s) => { const sec = document.querySelector(s); const b = sec.getBoundingClientRect(); const x = Math.max(0, Math.floor(b.left) - 8), y = Math.max(0, Math.floor(b.top) - 8); return { x, y, width: Math.min(Math.ceil(b.width) + 16, document.documentElement.clientWidth - x), height: Math.ceil(b.bottom) + 8 - y }; }, secSel);   // 8 px marginal: ryms i båda sidorna (referensens spalt har >= 16,9 px padding)
  for (const [m, rp, cs, dolj] of [['rot', refRot, SEC.cand1, null], ['gt', refGt, SEC.cand2, '.ampy-avdragskollen-outer']]) {
    if (dolj) await cand.evaluate((s) => { document.querySelector(s).style.display = 'none'; }, dolj);   // gt: instans 1 döljs så instans 2 hamnar på samma y som referensen
    await cand.waitForTimeout(100);
    const tr = await snapp(rp, SEC.ref), tc = await snapp(cand, cs);
    rad(`${vp} bild ${m}`, 'kortets överkant på hel pixel i båda (snäppt)', Number.isInteger(tr), Number.isInteger(tc), Number.isInteger(tr) && Number.isInteger(tc), `ref ${tr} px, kandidat ${tc} px`);
    const cr = await clipOf(rp, SEC.ref), cc = await clipOf(cand, cs);
    const a = await rp.screenshot({ clip: cr, fullPage: true, animations: 'disabled' }), b = await cand.screenshot({ clip: cc, fullPage: true, animations: 'disabled' });
    await writeFile(join(OUTDIR, `ref-${m}-${vp}.png`), a); await writeFile(join(OUTDIR, `cand-${m}-${vp}.png`), b);
    const same = a.equals(b);
    let pct = 0, info = 'byte-lika PNG';
    if (!same) { const d = pixelDiff(a, b); pct = d.pct; info = `${d.olika} pixlar olika (${d.storlek})`; if (d.diff && d.olika > 0) await writeFile(join(OUTDIR, `diff-${m}-${vp}.png`), d.diff); }
    rad(`${vp} bild ${m}`, 'skärmdump kortet, referens mot kandidat', 'byte-lika eller <= 0,1 % pixlar', same ? 'byte-lika' : `${pct.toFixed(3)} %`, same || pct <= 0.1, info);
    if (dolj) await cand.evaluate((s) => { document.querySelector(s).style.display = ''; }, dolj);
    for (const p of [rp, cand]) await p.evaluate(() => { document.documentElement.style.paddingTop = ''; });
  }

  /* 4. tillståndsvandring */
  J.states = {};
  for (const [m, refUrl, cs] of [['rot', URLS.ref('rot'), SEC.cand1], ['gt', URLS.ref('gt'), SEC.cand2]]) {
    const states = STATES(m);
    for (const [namn, act] of Object.entries(states)) {
      await refRot.goto(refUrl, { waitUntil: 'networkidle' }); await cand.goto(URLS.cand, { waitUntil: 'networkidle' });
      await act(refRot, SEC.ref); await act(cand, cs);
      await refRot.mouse.move(0, 0); await cand.mouse.move(0, 0);                               // pekaren bort: ingen :hover i mätningen
      await refRot.waitForTimeout(120); await cand.waitForTimeout(120);
      const r = await refRot.evaluate(resultText, SEC.ref), c = await cand.evaluate(resultText, cs);
      const ok = JSON.stringify(r) === JSON.stringify(c);
      rad(`${vp} tillstånd ${m}`, namn, `${r.status}: ${r.tal}`.slice(0, 90), `${c.status}: ${c.tal}`.slice(0, 90), ok, ok ? '' : JSON.stringify({ r, c }).slice(0, 200));
      (J.states[m] ||= {})[namn] = { ref: r, cand: c };
      if (namn === '10 lön 300 000') rad(`${vp} tillstånd ${m}`, '300 000 -> "ca 31 000 kr"', 'ca 31 000 kr', c.tal, c.tal === 'ca 31 000 kr');
      if (namn === '2 äger=nej') rad(`${vp} tillstånd ${m}`, 'Nej -> stopp', 'stopp', c.status, c.status === 'stopp' && c.stoppHidden === false);
      if (namn === '8 två personer (180 000 + tom)') {
        const ids = await cand.evaluate((s) => { const uid = s.slice(1, 4); const ids = [...document.querySelectorAll('[id]')].map((e) => e.id); return { p2: !!document.getElementById(uid + '-rk-inkomst-2'), dup: ids.filter((id, i) => ids.indexOf(id) !== i), label: document.querySelector(s + ' .rk__person[data-person="2"] .rk__personetikett').textContent, describedby: document.querySelector(s + ' [data-falt="ranta"][id$="-2"]').getAttribute('aria-describedby'), refsOk: [...document.querySelectorAll(s + ' [aria-describedby],' + s + ' [aria-labelledby],' + s + ' [for]')].every((el) => ['aria-describedby', 'aria-labelledby', 'for'].every((a) => !el.getAttribute(a) || el.getAttribute(a).split(/\s+/).every((id) => document.getElementById(id)))) }; }, cs);
        rad(`${vp} tillstånd ${m}`, 'Lägg till -> Person 2 med unika, prefixade id:n', 'Person 2, 0 dubbletter, alla referenser löser', `${ids.label}, ${ids.dup.length} dubbletter, refs ${ids.refsOk}, ${ids.describedby}`, ids.p2 && ids.dup.length === 0 && ids.label === 'Person 2' && ids.refsOk);
      }
      // datorstilar efter tillståndet (samma element, samma tolerans)
      const sr = await refRot.evaluate(styleSpot, { secSel: SEC.ref, props: PROPS, wrapProps: WRAP_PROPS, elements: ELEMENT }), sc = await cand.evaluate(styleSpot, { secSel: cs, props: PROPS, wrapProps: WRAP_PROPS, elements: ELEMENT });
      let drift = 0; const avv = [];
      for (const [key] of ELEMENT) { const a = sr[key], b = sc[key]; if (!a && !b) continue; if (!a || !b) { drift++; avv.push(key + ' saknas'); continue; } for (const p of Object.keys(a)) if (!lika(a[p], b[p])) { drift++; avv.push(`${key}.${p}: ${a[p]} / ${b[p]}`); } }
      rad(`${vp} tillstånd ${m}`, `${namn}: datorstilar lika`, '0 avvikelser', `${drift} avvikelser`, drift === 0, avv.join(' | ').slice(0, 220));
    }
  }

  /* 6. två instanser oberoende (kandidaten) */
  await cand.goto(URLS.cand, { waitUntil: 'networkidle' });
  const res = async () => { const a = await cand.evaluate(resultText, SEC.cand1), b = await cand.evaluate(resultText, SEC.cand2); return { i1: a.tal, i2: b.tal, s1: a.status, s2: b.status }; };
  await klickLabel(cand, SEC.cand2, 'input[name$="ager"][value="nej"]');
  let r = await res();
  rad(`${vp} oberoende`, 'Nej i instans 2: instans 1 orörd, instans 2 stopp', 'i1 upp till 50 000 kr / i2 stopp', `i1 ${r.i1} / i2 ${r.s2}`, /^upp till 50 000 kr/.test(r.i1) && r.s2 === 'stopp');
  await klickLabel(cand, SEC.cand2, 'input[name$="ager"][value="ja"]');
  await fyll(cand, SEC.cand2, 'inkomst', '180000');
  r = await res();
  rad(`${vp} oberoende`, '180 000 i instans 2: instans 1 orörd', 'i1 upp till 50 000 kr / i2 ca 12 000 kr', `i1 ${r.i1} / i2 ${r.i2}`, /^upp till 50 000 kr/.test(r.i1) && /^ca 12 000 kr/.test(r.i2));
  await fyll(cand, SEC.cand1, 'inkomst', '300000');
  r = await res();
  rad(`${vp} oberoende`, '300 000 i instans 1: instans 2 orörd', 'i1 ca 31 000 kr / i2 ca 12 000 kr', `i1 ${r.i1} / i2 ${r.i2}`, /^ca 31 000 kr/.test(r.i1) && /^ca 12 000 kr/.test(r.i2));
  await cand.locator(`${SEC.cand1} .rk__lagg .rk__lank`).click(); await cand.waitForTimeout(80);
  const antal = await cand.evaluate(() => [document.querySelector('#ak1-avdragskollen .rk__personer').dataset.antal, document.querySelector('#ak2-avdragskollen .rk__personer').dataset.antal]);
  rad(`${vp} oberoende`, 'Lägg till i instans 1: instans 2 har fortfarande 1 person', '2 / 1', antal.join(' / '), antal[0] === '2' && antal[1] === '1');
  const booted = await cand.evaluate(() => [...document.querySelectorAll('.ampy-avdragskollen .rk[data-mode]')].map((s) => s.dataset.booted).join(','));
  rad(`${vp} oberoende`, 'data-booted satt på båda sektionerna', '1,1', booted, booted === '1,1');
  // Enter i ett fält laddar aldrig om
  let loads = 0; cand.on('load', () => loads++);
  await cand.locator(`${SEC.cand1} [data-falt="inkomst"]`).first().click(); await cand.keyboard.press('Enter'); await cand.waitForTimeout(300);
  rad(`${vp} oberoende`, 'Enter i fältet laddar inte om sidan', '0 omladdningar', `${loads} omladdningar`, loads === 0);

  /* 5. fokus (referens, kandidat, host-sim = M1-provet) */
  await refRot.goto(URLS.ref('rot'), { waitUntil: 'networkidle' }); await cand.goto(URLS.cand, { waitUntil: 'networkidle' }); await host.goto(URLS.host, { waitUntil: 'networkidle' });
  await fokusProv(refRot, SEC.ref, 'referens', vp);
  await fokusProv(cand, SEC.cand1, 'kandidat', vp);
  await fokusProv(host, SEC.cand1, 'host-sim', vp);
  // host-sim: kantfärgen med mus-fokus (input:focus i 14-global-css är !important)
  await host.locator(`${SEC.cand1} [data-falt="inkomst"]`).first().click(); await host.waitForTimeout(400);
  const hb = await host.evaluate((s) => getComputedStyle(document.querySelector(s + ' [data-falt="inkomst"]')).borderColor, SEC.cand1);
  rad(`${vp} fokus host-sim`, 'musklick i fältet: kanten är teal-deep, inte sajtens #5EB1BF', 'rgb(0, 122, 105)', hb, hb === 'rgb(0, 122, 105)');

  await ctx.close();

  /* 8. reduced motion (1280) */
  if (vp === '1280') {
    const rctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const pr = await open(rctx, URLS.ref('rot'), 'ref-rm'), pc = await open(rctx, URLS.cand, 'cand-rm');
    await fyll(pr, SEC.ref, 'inkomst', '180000'); await fyll(pc, SEC.cand1, 'inkomst', '180000');
    const g = (s) => { const cs = getComputedStyle(document.querySelector(s + ' .rk__talrad')); return cs.animationName + ' ' + cs.animationDuration; };
    const a = await pr.evaluate(g, SEC.ref), b = await pc.evaluate(g, SEC.cand1);
    rad('1280 reduced motion', 'talradens animation nollad (rk-in 1e-06s)', a, b, a === b && /1e-06s|0\.001ms/.test(b));
    await rctx.close();
  }
}
/* =====================================================================================================================
   Grupp B: leveransen, paketet överst i artikelmallen (preview/artikel-*.html) mot referensklonen (kalkylator/artikel)
   ===================================================================================================================== */
const ART_ELEMENT = [['rubrik', '@rubrik'], ...ELEMENT];
const ART_VIEWPORTS = [
  ['1440', { viewport: { width: 1440, height: 900 } }],
  ['1024', { viewport: { width: 1024, height: 1366 }, hasTouch: true, deviceScaleFactor: 2 }],
  ['390', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }],
];
const NASTA = '#brxe-vjjqxy';   // Snabbt svar-kortet: blocket efter kalkylatorn i artikelspalten
const lagen = (secSel) => {
  const r = (el) => { const b = el.getBoundingClientRect(); return [b.left, b.top + scrollY, b.width, b.height].map((v) => Math.round(v * 4) / 4).join(' '); };
  const sec = document.querySelector(secSel);
  const wrap = sec.closest('.ampy-avdragskollen') || sec.closest('.ampy-kalkylator');
  return { rubrik: r(wrap.querySelector('.rk__rubrik')), kort: r(sec), nasta: r(document.querySelector('#brxe-vjjqxy')), spalt: r(document.querySelector('#brxe-pfbtud')), ordning: [...document.querySelector('#brxe-pfbtud').children].map((e) => e.id || e.className.split(' ')[0]).slice(0, 4).join(' > ') };
};
json.artikel = {};
for (const [vp, opts] of ART_VIEWPORTS) {
  const ctx = await browser.newContext(opts);
  for (const m of ['rot', 'gt']) {
    const G = `artikel ${vp} ${m}`;
    const rp = await open(ctx, URLS.artRef(m), `art-ref-${m}`), cp = await open(ctx, URLS.artCand(m), `art-cand-${m}`);
    const cs = m === 'gt' ? SEC.cand2 : SEC.cand1;   /* artikel-gt.html renderar shortcoden som instans ak2 */
    /* konsol + nät: 0 fel; utanför localhost bara ampy.se (artikelns bilder, samma i båda) */
    for (const p of [rp, cp]) {
      rad(G, `${p._tag}: fel/varningar i konsolen`, '0', p._bevak.errors.length, p._bevak.errors.length === 0, p._bevak.errors.join(' | ').slice(0, 200));
      const ext = p._bevak.requests.filter((u) => !u.startsWith(BASE) && !u.startsWith('https://ampy.se/'));
      rad(G, `${p._tag}: anrop utanför localhost/ampy.se`, '0', ext.length, ext.length === 0, ext.join(' ').slice(0, 200));
    }
    /* typsnittet: sajtens tema-CSS deklarerar samma Outfit-fil (i klonen som absolut ampy.se-URL), paketet som /wp-content/...;
       en och samma fil på sajten. Här: minst en hämtning av Outfit-VariableFont_wght.woff2, ingen från Google/CDN. */
    const fontReq = cp._bevak.requests.filter((u) => /\.woff2?(\?|$)/.test(u)).map((u) => u.replace(BASE, ''));
    const outfit = fontReq.filter((u) => /Outfit/i.test(u));
    const extern = cp._bevak.requests.filter((u) => /googleapis|gstatic|jsdelivr|unpkg|cdnjs/.test(u));
    rad(G, 'Outfit: bara sajtens fil /wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2, ingen extern källa', '1 fil, 0 externa', `${outfit.map((u) => u.replace(/^https:\/\/ampy\.se/, '')).join(' ')}, ${extern.length} externa`, outfit.length >= 1 && outfit.every((u) => u.endsWith('/wp-content/uploads/fonts/Outfit-VariableFont_wght.woff2')) && extern.length === 0, `övriga woff2 (sajtens egna): ${fontReq.length - outfit.length}`);
    /* lägen: rubrik, kort, nästa block och spalten på exakt samma plats (x, y, bredd, höjd) */
    const lr = await rp.evaluate(lagen, SEC.ref), lc = await cp.evaluate(lagen, cs);
    for (const k of ['rubrik', 'kort', 'nasta', 'spalt']) rad(G, `läge ${k} (x y bredd höjd)`, lr[k], lc[k], lika(lr[k], lc[k]));
    rad(G, 'ordningen i artikelspalten (Code, kalkylatorn, Snabbt svar)', lr.ordning, lc.ordning, lc.ordning.startsWith('brxe-code > ampy-avdragskollen-outer > brxe-vjjqxy') && lr.ordning.startsWith('brxe-code > ampy-kalkylator > brxe-vjjqxy'));
    /* datorstilar: rubriken + kortets 24 element, wrapper = .ampy-kalkylator resp. .ampy-avdragskollen */
    const sr = await rp.evaluate(styleSpot, { secSel: SEC.ref, props: PROPS, wrapProps: WRAP_PROPS, elements: ART_ELEMENT, wrapSel: '.ampy-kalkylator' });
    const sc = await cp.evaluate(styleSpot, { secSel: cs, props: PROPS, wrapProps: WRAP_PROPS, elements: ART_ELEMENT });
    jamforStilar(`${G} stil`, sr, sc, ART_ELEMENT);
    rad(`${G} stil`, 'rubrikens font-size / margin', `${sr.rubrik.fontSize} / ${sr.rubrik.margin}`, `${sc.rubrik.fontSize} / ${sc.rubrik.margin}`, lika(sr.rubrik.fontSize, sc.rubrik.fontSize) && lika(sr.rubrik.margin, sc.rubrik.margin));
    rad(`${G} stil`, 'kortets bredd × höjd', `${sr.kort.w} × ${sr.kort.h}`, `${sc.kort.w} × ${sc.kort.h}`, lika(`${sr.kort.w} × ${sr.kort.h}`, `${sc.kort.w} × ${sc.kort.h}`));
    rad(`${G} stil`, 'kortets layout', sr.kort.gridTemplateColumns, sc.kort.gridTemplateColumns, lika(sr.kort.gridTemplateColumns, sc.kort.gridTemplateColumns), Number(vp) >= 1440 ? 'två spalter väntas' : 'staplat väntas');
    /* skärmdump: rubrikens överkant t.o.m. 40 px in i Snabbt svar-kortet, spaltens bredd + 16 px, överkanten snäppt */
    const klipp = async (page, secSel) => page.evaluate((s) => {
      const html = document.documentElement; html.style.paddingTop = '0px';
      const sec = document.querySelector(s); const wrap = sec.closest('.ampy-avdragskollen') || sec.closest('.ampy-kalkylator');
      const t0 = wrap.querySelector('.rk__rubrik').getBoundingClientRect().top + scrollY; const d = Math.ceil(t0) - t0; html.style.paddingTop = (d > 0.001 ? d : 0) + 'px';
      const h = wrap.querySelector('.rk__rubrik').getBoundingClientRect(), sp = document.querySelector('#brxe-pfbtud').getBoundingClientRect(), n = document.querySelector('#brxe-vjjqxy').getBoundingClientRect();
      const x = Math.max(0, Math.floor(sp.left) - 16), y = Math.floor(h.top + scrollY);
      return { x, y, width: Math.min(Math.ceil(sp.width) + 32, html.clientWidth - x), height: Math.ceil(n.top + scrollY + 40) - y, top: h.top + scrollY };
    }, secSel);
    const kr = await klipp(rp, SEC.ref), kc = await klipp(cp, cs);
    rad(G, 'klippets överkant på hel pixel i båda', Number.isInteger(kr.top), Number.isInteger(kc.top), Number.isInteger(kr.top) && Number.isInteger(kc.top), `ref ${kr.top}, kandidat ${kc.top}`);
    const a = await rp.screenshot({ clip: kr, fullPage: true, animations: 'disabled' }), b = await cp.screenshot({ clip: kc, fullPage: true, animations: 'disabled' });
    await writeFile(join(OUTDIR, `artikel-ref-${m}-${vp}.png`), a); await writeFile(join(OUTDIR, `artikel-cand-${m}-${vp}.png`), b);
    const same = a.equals(b); let pct = 0, info = 'byte-lika PNG';
    if (!same) { const d = pixelDiff(a, b); pct = d.pct; info = `${d.olika} pixlar olika (${d.storlek})`; if (d.diff && d.olika > 0) await writeFile(join(OUTDIR, `diff-artikel-${m}-${vp}.png`), d.diff); }
    rad(G, 'skärmdump rubrik + kort + luften under, referens mot kandidat', 'byte-lika eller <= 0,1 % pixlar', same ? 'byte-lika' : `${pct.toFixed(3)} %`, same || pct <= 0.1, info);
    for (const p of [rp, cp]) await p.evaluate(() => { document.documentElement.style.paddingTop = ''; });
    /* motorn igång i artikelsidan */
    await fyll(cp, cs, 'inkomst', '300000'); await fyll(rp, SEC.ref, 'inkomst', '300000');
    let r = await cp.evaluate(resultText, cs), r0 = await rp.evaluate(resultText, SEC.ref);
    rad(G, '300 000 -> "ca 31 000 kr" (kandidat = referens)', r0.tal, r.tal, r.tal === 'ca 31 000 kr' && r0.tal === r.tal);
    await klickLabel(cp, cs, 'input[name$="ager"][value="nej"]'); await klickLabel(rp, SEC.ref, 'input[name$="ager"][value="nej"]');
    r = await cp.evaluate(resultText, cs); r0 = await rp.evaluate(resultText, SEC.ref);
    rad(G, 'Nej -> stopp (kandidat = referens)', `${r0.status}: ${r0.tal}`.slice(0, 80), `${r.status}: ${r.tal}`.slice(0, 80), r.status === 'stopp' && JSON.stringify(r) === JSON.stringify(r0));
    await klickLabel(cp, cs, 'input[name$="ager"][value="ja"]');
    /* fokus inuti sajtens riktiga CSS (14-global-css: input:focus{border-color:#5EB1BF!important}) */
    await cp.locator(`${cs} [data-falt="inkomst"]`).first().click(); await cp.waitForTimeout(300);
    const f = await cp.evaluate((s) => { const cs2 = getComputedStyle(document.querySelector(s + ' [data-falt="inkomst"]')); return { borderColor: cs2.borderColor, boxShadow: cs2.boxShadow }; }, cs);
    rad(G, 'musklick i inkomstfältet: kanten teal-deep, inte sajtens #5EB1BF', 'rgb(0, 122, 105)', f.borderColor, f.borderColor === 'rgb(0, 122, 105)');
    rad(G, 'fokusringen', 'rgba(0, 122, 105, 0.9) 0px 0px 0px 3px', f.boxShadow, f.boxShadow === 'rgba(0, 122, 105, 0.9) 0px 0px 0px 3px');
    /* kalkylatorn ryms i spalten (sidans egen header-meny ligger utanför viewporten i klonen utan JS: inte vårt) */
    const ox = await cp.evaluate((s) => { const sec = document.querySelector(s); const o = sec.closest('.ampy-avdragskollen-outer').getBoundingClientRect(), sp = document.querySelector('#brxe-pfbtud').getBoundingClientRect(); return { inom: o.left >= sp.left - 0.5 && o.right <= sp.right + 0.5, overflow: sec.scrollWidth - sec.clientWidth }; }, cs);
    rad(G, 'kalkylatorn ryms i artikelspalten, inget inre överflöd', 'inom spalten, 0 px', `${ox.inom ? 'inom spalten' : 'utanför'}, ${ox.overflow} px`, ox.inom && ox.overflow <= 0);
    (json.artikel[vp] ||= {})[m] = { lagen: { ref: lr, cand: lc }, styles: { ref: sr, cand: sc } };
    await rp.close(); await cp.close();
  }
  await ctx.close();
}
await browser.close(); server.close();

/* ---------- tabell + fil ---------- */
const w = [Math.max(...rows.map((r) => r.grupp.length)), Math.max(...rows.map((r) => r.kontroll.length)), 34, 34];
const cell = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s)).padEnd(n);
console.log('\n' + cell('grupp', w[0]) + '  ' + cell('kontroll', w[1]) + '  ' + cell('referens / väntat', w[2]) + '  ' + cell('kandidat', w[3]) + '  ok');
console.log('-'.repeat(w[0] + w[1] + w[2] + w[3] + 12));
for (const r of rows) console.log(cell(r.grupp, w[0]) + '  ' + cell(r.kontroll, w[1]) + '  ' + cell(r.ref, w[2]) + '  ' + cell(r.cand, w[3]) + '  ' + (r.ok ? 'ok' : 'FEL') + (r.kommentar ? '   ' + r.kommentar.slice(0, 160) : ''));
const okN = rows.filter((r) => r.ok).length;
console.log(`\n${okN} av ${rows.length} kontroller ok, ${fel} fel. Utdata: produktion/_build/out/ (paritet.json, skärmdumpar${rows.some((r) => r.grupp.includes('bild') && !r.ok) ? ', diffbilder' : ''}).`);
json.rows = rows; json.summary = { ok: okN, total: rows.length, fel };
await writeFile(join(OUTDIR, 'paritet.json'), JSON.stringify(json, null, 2));
process.exit(fel ? 1 : 0);
