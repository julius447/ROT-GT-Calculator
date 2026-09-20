/* Slutgranskning responsiv/enheter för Avdragskollen (research/13-slutgranskning-responsiv.md).
   Kör: node tools/enhetsmatris.mjs [--bara=slug,slug] [--sidor=slug,slug]
   Serverar repo-roten. Artikelklonen laddar Bricks-CSS från ampy.se; fem av URL:erna (FlyingPress-cache) svarar
   404 sedan klonen gjordes 2026-09-15, så harnessen dirigerar om dem till dagens hashar (ur live-sidan, annars den
   fasta listan nedan) och cachar alla ampy.se-tillgångar i minnet så alla tre motorer får samma sida.
   Skriver research/underlag/enheter/matris.json (efter varje enhet), en JPEG per enhet (fristående ?m=rot,
   standardläge) och fynd-skärmdumpar i research/underlag/enheter/fynd/. Rör inga källfiler. */
import { chromium, webkit, firefox, devices } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
/* Källfilernas hashar: rapporten ska säga exakt vilken version som mättes (filerna ändrades mitt under körning 1, 2026-09-20 22:11) */
const KALLOR = ['kalkylator/v1/index.html', 'kalkylator/v1/style.css', 'kalkylator/v1/app.js', 'kalkylator/rakna.js', 'kalkylator/artikel/index.html', 'kalkylator/artikel/artikel.css', 'kalkylator/artikel/bas-inbaddad.css'];
async function hashar_() { const o = {}; for (const f of KALLOR) o[f] = createHash('sha1').update(await readFile(join(root, f))).digest('hex').slice(0, 12); return o; }
const kallhashStart = await hashar_();
/* Artikelklonen i repot bär v1-markupen från 2026-09-16. Harnessen sätter in AKTUELL v1-markup (H2 + section, som
   tools/artikel-klon.py steg 5) och serverar den virtuellt på /kalkylator/artikel/index.html. Repot rörs inte. */
const v1Html = await readFile(join(root, 'kalkylator/v1/index.html'), 'utf8');
const h2Ny = v1Html.match(/<h2 class="ampy-h2 rk__rubrik"[^>]*>[\s\S]*?<\/h2>/)[0];
const sektionNy = v1Html.match(/<section class="ampy-card rk"[\s\S]*?<\/section>/)[0];
let artikelHtml = await readFile(join(root, 'kalkylator/artikel/index.html'), 'utf8');
const artikelStale = !artikelHtml.includes(sektionNy);
artikelHtml = artikelHtml.replace(/<h2 class="ampy-h2 rk__rubrik"[^>]*>[\s\S]*?<\/h2>/, h2Ny).replace(/<section class="ampy-card rk"[\s\S]*?<\/section>/, sektionNy);
console.log('artikelklonens markup', artikelStale ? 'INAKTUELL mot v1: aktuell markup insatt virtuellt' : 'samma som v1');
const ut = join(root, 'research/underlag/enheter');
const utFynd = join(ut, 'fynd');
await mkdir(utFynd, { recursive: true });

const arg = (n) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=')[1].split(',') : null; };
const baraEnheter = arg('bara');
const baraSidor = arg('sidor');

/* ---------- statisk server för repo-roten ---------- */
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    const vag = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (vag === '/kalkylator/artikel/index.html' || vag === '/kalkylator/artikel/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(artikelHtml); return; }
    let p = join(root, vag);
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const bas = `http://localhost:${port}`;

/* ---------- ampy.se: omdirigering av döda FlyingPress-hashar + minnescache ---------- */
const FAST = {
  'frontend-light-layer.min.css': '5b638592a2cd', 'theme-style-ampy.min.css': '243af2986dbc',
  'post-15042.min.css': '502b0d84360f', 'post-56073.min.css': '69985dd214df', 'post-15096.min.css': '501d82d91edb',
};
let hashar = { ...FAST };
try {
  const html = await (await fetch('https://ampy.se/elcentral-guide-2026/', { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36' } })).text();
  for (const m of html.matchAll(/flying-press\/([0-9a-f]{12})\.([^"' )]+\.css)/g)) hashar[m[2]] = m[1];
  console.log('live-hashar', JSON.stringify(hashar));
} catch (e) { console.log('live-sidan gick inte att hämta, använder fast lista:', String(e).slice(0, 80)); }
const cache = new Map();   /* url -> { status, ct, body } */
const omdirigeringar = new Set();
async function ruta(route) {
  const req = route.request();
  let url = req.url();
  const m = url.match(/flying-press\/[0-9a-f]{12}\.(.+\.css)$/);
  if (m && hashar[m[1]]) { const ny = url.replace(/flying-press\/[0-9a-f]{12}\./, `flying-press/${hashar[m[1]]}.`); if (ny !== url) { omdirigeringar.add(url); url = ny; } }
  let c = cache.get(url);
  if (!c) {
    try {
      const r = await route.fetch({ url, headers: { 'user-agent': req.headers()['user-agent'] || 'Mozilla/5.0', accept: '*/*' }, maxRedirects: 5 });
      c = { status: r.status(), ct: r.headers()['content-type'] || 'application/octet-stream', body: await r.body() };
    } catch (e) { c = { status: 502, ct: 'text/plain', body: Buffer.from(String(e)) }; }
    cache.set(url, c);
  }
  await route.fulfill({ status: c.status, headers: { 'content-type': c.ct, 'access-control-allow-origin': '*' }, body: c.body });
}

/* ---------- enheter ---------- */
const D = (n) => devices[n];
const ENHETER = [
  { slug: 'iphone-se', namn: 'iPhone SE', dev: 'iPhone SE' },
  { slug: 'iphone-se-liggande', namn: 'iPhone SE liggande', dev: 'iPhone SE landscape' },
  { slug: 'iphone-12', namn: 'iPhone 12', dev: 'iPhone 12' },
  { slug: 'iphone-12-morkt', namn: 'iPhone 12 mörkt läge', dev: 'iPhone 12', colorScheme: 'dark' },
  { slug: 'iphone-14-pro-max', namn: 'iPhone 14 Pro Max', dev: 'iPhone 14 Pro Max' },
  { slug: 'iphone-14-pro-max-liggande', namn: 'iPhone 14 Pro Max liggande', dev: 'iPhone 14 Pro Max landscape' },
  { slug: 'iphone-15', namn: 'iPhone 15', dev: 'iPhone 15' },
  { slug: 'pixel-5', namn: 'Pixel 5', dev: 'Pixel 5' },
  { slug: 'pixel-7', namn: 'Pixel 7', dev: 'Pixel 7' },
  { slug: 'galaxy-s8', namn: 'Galaxy S8', dev: 'Galaxy S8' },
  { slug: 'galaxy-s9-plus', namn: 'Galaxy S9+', dev: 'Galaxy S9+' },
  { slug: 'ipad-mini', namn: 'iPad Mini', dev: 'iPad Mini' },
  { slug: 'ipad-gen7', namn: 'iPad (gen 7)', dev: 'iPad (gen 7)' },
  { slug: 'ipad-pro-11', namn: 'iPad Pro 11', dev: 'iPad Pro 11' },
  { slug: 'ipad-pro-11-liggande', namn: 'iPad Pro 11 liggande', dev: 'iPad Pro 11 landscape' },
  { slug: 'desktop-1024', namn: 'Desktop 1024×768', motor: 'chromium', ctx: { viewport: { width: 1024, height: 768 } } },
  { slug: 'desktop-1280', namn: 'Desktop 1280×800', motor: 'chromium', ctx: { viewport: { width: 1280, height: 800 } } },
  { slug: 'desktop-1366', namn: 'Desktop 1366×768', motor: 'chromium', ctx: { viewport: { width: 1366, height: 768 } } },
  { slug: 'desktop-1440', namn: 'Desktop 1440×900', motor: 'chromium', ctx: { viewport: { width: 1440, height: 900 } } },
  { slug: 'desktop-1440-morkt', namn: 'Desktop 1440×900 mörkt läge', motor: 'chromium', ctx: { viewport: { width: 1440, height: 900 } }, colorScheme: 'dark' },
  { slug: 'desktop-1920', namn: 'Desktop 1920×1080', motor: 'chromium', ctx: { viewport: { width: 1920, height: 1080 } } },
  { slug: 'smal-320x568', namn: 'Smal 320×568 (Chromium touch)', motor: 'chromium', ctx: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  { slug: 'smal-360x640', namn: 'Smal 360×640 (Chromium touch)', motor: 'chromium', ctx: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  { slug: 'safari-desktop-1440', namn: 'Safari desktop 1440×900 (WebKit)', motor: 'webkit', ctx: { ...D('Desktop Safari'), viewport: { width: 1440, height: 900 } } },
  { slug: 'firefox-1440', namn: 'Firefox 1440×900', motor: 'firefox', ctx: { viewport: { width: 1440, height: 900 } } },
  { slug: 'firefox-390-touch', namn: 'Firefox 390×844 touch', motor: 'firefox', ctx: { viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 2 } },
].map((e) => {
  if (e.dev) { const d = D(e.dev); if (!d) throw new Error('okänd enhet ' + e.dev); e.ctx = { ...d }; e.motor = d.defaultBrowserType; delete e.ctx.defaultBrowserType; }
  if (e.colorScheme) e.ctx.colorScheme = e.colorScheme;
  return e;
}).filter((e) => !baraEnheter || baraEnheter.includes(e.slug));

const SIDOR = [
  { slug: 'fristaende-rot', namn: 'fristående ?m=rot', url: '/kalkylator/v1/index.html?m=rot', m: 'rot', artikel: false },
  { slug: 'fristaende-gt', namn: 'fristående ?m=gt', url: '/kalkylator/v1/index.html?m=gt', m: 'gt', artikel: false },
  { slug: 'artikel-topp-rot', namn: 'artikel ?p=topp&m=rot', url: '/kalkylator/artikel/index.html?p=topp&m=rot', m: 'rot', artikel: true },
  { slug: 'artikel-hoger-rot', namn: 'artikel ?p=hoger&m=rot', url: '/kalkylator/artikel/index.html?p=hoger&m=rot', m: 'rot', artikel: true },
  { slug: 'artikel-topp-gt', namn: 'artikel ?p=topp&m=gt', url: '/kalkylator/artikel/index.html?p=topp&m=gt', m: 'gt', artikel: true },
  { slug: 'artikel-hoger-gt', namn: 'artikel ?p=hoger&m=gt', url: '/kalkylator/artikel/index.html?p=hoger&m=gt', m: 'gt', artikel: true },
].filter((s) => !baraSidor || baraSidor.includes(s.slug));

/* ---------- mätningen i sidan ---------- */
function matt({ touch }) {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const card = q('#avdragskollen');
  const cont = q('.rk-behallare') || q('.rk-spalt');
  const de = document.documentElement;
  const cs = (el) => getComputedStyle(el);
  const synlig = (el) => { if (!el || el.closest('[hidden]') || el.closest('template')) return false; const s = cs(el); if (s.display === 'none' || s.visibility === 'hidden') return false; const b = el.getBoundingClientRect(); return b.width > 0 || b.height > 0; };
  const R = (el) => { const b = el.getBoundingClientRect(); return { l: +b.left.toFixed(1), t: +b.top.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
  const namn = (el) => (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) + (el.textContent && el.children.length === 0 ? ` "${el.textContent.trim().slice(0, 28)}"` : '');
  const rgb = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bakgrund = (el) => { let e = el; while (e && e !== document) { const c = rgb(cs(e).backgroundColor); if (c && c.a > 0.01) return c; e = e.parentElement; } return { r: 255, g: 255, b: 255, a: 1 }; };
  const blanda = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) });
  const kontrast = (el) => { const bg = bakgrund(el); const fg = blanda(rgb(cs(el).color) || { r: 0, g: 0, b: 0, a: 1 }, bg); const a = lum(fg), b = lum(bg); return +(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05))).toFixed(2); };
  const o = {};
  o.vw = innerWidth; o.cw = de.clientWidth; o.scrollW = de.scrollWidth; o.bodyScrollW = document.body.scrollWidth;
  o.overflowX = o.scrollW > o.cw;
  o.coarse = matchMedia('(pointer: coarse)').matches; o.hover = matchMedia('(hover: hover)').matches; o.dark = matchMedia('(prefers-color-scheme: dark)').matches;
  o.rem = parseFloat(cs(de).fontSize);
  const cc = cs(cont);
  o.contW = +(cont.clientWidth - parseFloat(cc.paddingLeft) - parseFloat(cc.paddingRight)).toFixed(1);
  o.contNamn = cont.className;
  o.cols = cs(card).gridTemplateColumns.trim().split(/\s+/).filter((x) => x !== 'none').length;
  o.colsRatt = (o.contW >= 720 ? 2 : 1) === o.cols;
  o.card = R(card);
  o.cardH = o.card.h;
  const cr = card.getBoundingClientRect();
  /* bredare än kortet / utanför fönstret */
  o.breda = []; o.utanforVy = [];
  for (const el of qa('*', card)) {
    if (!synlig(el)) continue;
    const b = el.getBoundingClientRect();
    if (b.right > cr.right + 1 || b.left < cr.left - 1) o.breda.push({ el: namn(el), l: +(b.left - cr.left).toFixed(1), r: +(b.right - cr.right).toFixed(1) });
    if (b.right > o.cw + 1 || b.left < -1) o.utanforVy.push({ el: namn(el), l: +b.left.toFixed(1), r: +(b.right - o.cw).toFixed(1) });
  }
  o.breda = o.breda.slice(0, 12); o.utanforVy = o.utanforVy.slice(0, 8);
  const contR = cont.getBoundingClientRect();
  o.kortUtanforBehallare = +(cr.right - (contR.right - parseFloat(cc.paddingRight))).toFixed(1);
  /* vad som orsakar sidans överflöde (värdsidan eller kalkylatorn) */
  if (o.overflowX) {
    const v = [];
    for (const el of qa('body *')) { if (!synlig(el)) continue; const b = el.getBoundingClientRect(); if (b.right > o.cw + 1 && cs(el).position !== 'fixed') v.push({ el: namn(el), r: +(b.right - o.cw).toFixed(1), iKort: card.contains(el) }); }
    v.sort((a, b) => b.r - a.r); o.overflowOrsak = v.slice(0, 5);
  }
  /* textklipp (block-element med scrollWidth > clientWidth) */
  o.klipp = [];
  for (const el of qa('.rk__etikett, .rk__segment > label, .rk__eyebrow, .rk__under, .rk__fin, .rk__not, .rk__stopptext, .rk__lank, .rk__per, .rk__personetikett, .rk__input, .rk__talrad, .rk__rubrik', card.parentElement)) {
    if (!synlig(el)) continue; const s = cs(el); if (s.display === 'inline') continue;
    if (el.scrollWidth > el.clientWidth + 1) o.klipp.push({ el: namn(el), sw: el.scrollWidth, cw: el.clientWidth, text: (el.value ?? el.textContent).trim().slice(0, 40) });
  }
  /* talraden */
  const tal = q('#rk-tal'), enhet = q('#rk-talenhet'), prefix = q('#rk-prefix'), talrad = q('#rk-talrad'), talpar = q('.rk__talpar'), panel = q('.rk__panel');
  const pc = cs(panel); const panelInnerR = panel.getBoundingClientRect().right - parseFloat(pc.paddingRight);
  if (synlig(talrad)) {
    const rt = tal.getBoundingClientRect(), re = enhet.getBoundingClientRect(), rp = prefix.getBoundingClientRect(), rtp = talpar.getBoundingClientRect();
    o.talrad = {
      text: talrad.textContent.replace(/\s+/g, ' ').trim(), h: +talrad.getBoundingClientRect().height.toFixed(1),
      krEgenRad: synlig(enhet) && re.top >= rt.bottom - 2, prefixEgenRad: synlig(prefix) && rt.top >= rp.bottom - 2,
      talparUtanfor: +(rtp.right - panelInnerR).toFixed(1), talFs: cs(tal).fontSize, enhetFs: cs(enhet).fontSize,
    };
  }
  /* tryckytor (touch) */
  const labs = qa('.rk__segment > label', card).filter(synlig);
  o.tryck = {
    labelMinH: Math.min(...labs.map((l) => l.getBoundingClientRect().height)), labelMinW: Math.min(...labs.map((l) => l.getBoundingClientRect().width)),
    laggH: synlig(q('#rk-lagg')) ? +q('#rk-lagg').getBoundingClientRect().height.toFixed(1) : null,
    tabortH: qa('.rk__tabort', card).filter(synlig).map((b) => +b.getBoundingClientRect().height.toFixed(1)),
    tabortW: qa('.rk__tabort', card).filter(synlig).map((b) => +b.getBoundingClientRect().width.toFixed(1)),
    inputH: Math.min(...qa('.rk__input', card).filter(synlig).map((i) => i.getBoundingClientRect().height)),
    segPad: cs(labs[0].parentElement).paddingTop,
  };
  /* fältens fontstorlek (iOS zoomar under 16) */
  o.inputFs = qa('input, select, textarea', card).filter(synlig).map((i) => parseFloat(cs(i).fontSize));
  o.inputFsMin = Math.min(...o.inputFs);
  /* fältets text vs kr-suffix: skriven text som inte får plats i innehållsrutan */
  o.faltKlipp = qa('.rk__input', card).filter(synlig).filter((i) => i.value && i.scrollWidth > i.clientWidth + 1).map((i) => ({ id: i.id, v: i.value, sw: i.scrollWidth, cw: i.clientWidth }));
  /* läsbarhet: disclaimer, not, underrad, per */
  const las = (sel) => { const el = q(sel); if (!el || !synlig(el)) return null; return { fs: parseFloat(cs(el).fontSize), kontrast: kontrast(el), rader: Math.round(el.getBoundingClientRect().height / (parseFloat(cs(el).lineHeight) || parseFloat(cs(el).fontSize) * 1.4)), text: el.textContent.trim().slice(0, 50) }; };
  o.lasbar = { fin: las('#rk-fin'), not: las('#rk-not'), under: las('#rk-under-1'), per: las('#rk-per'), stopptext: las('#rk-stopptext'), eyebrow: las('#rk-eyebrow') };
  /* färger (mörkt läge: inget får försvinna) */
  const f = (sel, prop) => { const el = q(sel); return el ? cs(el)[prop] : null; };
  o.farg = { body: f('body', 'backgroundColor'), card: f('#avdragskollen', 'backgroundColor'), panel: f('.rk__panel', 'backgroundColor'), input: f('.rk__input', 'backgroundColor'), inputText: f('.rk__input', 'color'), tal: f('#rk-tal', 'color'), etikett: f('.rk__etikett', 'color'), scheme: cs(de).colorScheme, segBg: f('.rk__segment', 'backgroundColor'), valdBg: f('.rk__segment > label:has(input:checked)', 'backgroundColor'), valdText: f('.rk__segment > label:has(input:checked)', 'color') };
  o.kontrastTal = kontrast(tal); o.kontrastEtikett = kontrast(q('.rk__etikett')); o.kontrastInput = kontrast(q('.rk__input')); o.kontrastVald = kontrast(q('.rk__segment > label:has(input:checked)')); o.kontrastOvald = kontrast(q('.rk__segment > label:not(:has(input:checked))'));
  /* "grön teknik-avdrag" / "ROT-avdrag": bryts frasen över två rader? (Range över textnoder) och blir "-et" ensamt? */
  function frasRader(el, fras) {
    if (!el || !synlig(el)) return null;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const noder = []; let text = '';
    while (tw.nextNode()) { const n = tw.currentNode; if (n.parentElement.closest('template')) continue; noder.push({ n, s: text.length }); text += n.data; }
    const res = [];
    let i = text.indexOf(fras);
    while (i >= 0) {
      const pos = (k) => { for (let j = noder.length - 1; j >= 0; j--) if (k >= noder[j].s) return [noder[j].n, k - noder[j].s]; return [noder[0].n, 0]; };
      const r = document.createRange(); const [n1, o1] = pos(i); const [n2, o2] = pos(i + fras.length); r.setStart(n1, o1); r.setEnd(n2, o2);
      const rects = [...r.getClientRects()].filter((x) => x.width > 0); const tops = [...new Set(rects.map((x) => Math.round(x.top)))];
      /* efterföljande bokstäver (t.ex. "et" i "avdraget"): på samma rad som frasens slut? */
      const m = text.slice(i + fras.length).match(/^[a-zåäö]+/i); let svansEgenRad = false, svans = '';
      if (m) { svans = m[0]; const r2 = document.createRange(); const [a1, b1] = pos(i + fras.length); const [a2, b2] = pos(i + fras.length + m[0].length); r2.setStart(a1, b1); r2.setEnd(a2, b2); const rr = [...r2.getClientRects()].filter((x) => x.width > 0); if (rr.length && rects.length) svansEgenRad = Math.round(rr[0].top) > Math.round(rects[rects.length - 1].top); }
      res.push({ rader: tops.length, svans, svansEgenRad, sammanhang: text.slice(Math.max(0, i - 12), i + fras.length + 8).replace(/\s+/g, ' ') });
      i = text.indexOf(fras, i + 1);
    }
    return res;
  }
  o.fras = {};
  for (const [sel, el] of [['rubrik', q('#rk-rubrik')], ['eyebrow', q('#rk-eyebrow')], ['stopptext', q('#rk-stopptext')], ['not', q('#rk-not')], ['etiketter', q('#rk-form')]]) {
    for (const fras of ['grön teknik-avdrag', 'ROT-avdrag']) { const r = frasRader(el, fras); if (r && r.length) o.fras[`${sel}:${fras}`] = r; }
  }
  /* ihop-spännen: alltid en rad */
  o.ihop = qa('.rk__ihop').filter(synlig).map((s) => ({ rects: s.getClientRects().length, text: s.textContent }));
  /* lägen för skift-mätning */
  o.eyebrowT = +(q('#rk-eyebrow').getBoundingClientRect().top - cr.top).toFixed(1);
  o.panel = R(panel); o.panel.tRel = +(o.panel.t - cr.top).toFixed(1);
  o.huvudH = +q('.rk__huvud').getBoundingClientRect().height.toFixed(1);
  o.stoppSynlig = synlig(q('#rk-stopp')); o.notSynlig = synlig(q('#rk-not'));
  o.status = q('#rk-resultat').dataset.status;
  o.pensionRad = synlig(q('#rk-pension-1'));
  o.antal = q('#rk-personer').dataset.antal; o.laggSynlig = synlig(q('#rk-lagg'));
  /* fasta/klistrade element som täcker kortet vid aktuell scroll */
  o.fasta = [];
  for (const el of qa('body *')) {
    const p = cs(el).position; if (p !== 'fixed' && p !== 'sticky') continue; if (card.contains(el) || el.contains(card)) continue; if (!synlig(el)) continue;
    const b = el.getBoundingClientRect(); const c2 = card.getBoundingClientRect();
    const ox = Math.max(0, Math.min(b.right, c2.right) - Math.max(b.left, c2.left)), oy = Math.max(0, Math.min(b.bottom, c2.bottom) - Math.max(b.top, c2.top));
    if (ox > 0 && oy > 0) o.fasta.push({ el: namn(el), pos: p, overlappW: +ox.toFixed(0), overlappH: +oy.toFixed(0), z: cs(el).zIndex, elH: +b.height.toFixed(0) });
  }
  o.scrollY = scrollY;
  /* marginaler som värdsidans reset kan nolla (bas-inbaddad.css .ampy p { margin: 0 }) */
  o.marginaler = Object.fromEntries(['#rk-under-1', '#rk-per', '#rk-fin', '#rk-not', '#rk-stopptext'].map((sel) => [sel, q(sel) ? cs(q(sel)).marginTop : null]));
  o.inputFokusCss = (() => { const i = q('.rk__input'); const s = cs(i); return { boxShadow: s.boxShadow.slice(0, 40), border: s.borderColor }; })();
  return o;
}

/* ---------- körningen ---------- */
const lab = (page, name, value) => page.locator(`#avdragskollen label:has(input[name="${name}"][value="${value}"])`);
const motorer = { chromium, webkit, firefox };
const oppna = {};
async function browserFor(m) { if (!oppna[m]) oppna[m] = await motorer[m].launch(); return oppna[m]; }
const resultat = [];
const start = Date.now();
const jsonVag = join(ut, 'matris.json');
const spara = async () => writeFile(jsonVag, JSON.stringify({ skapad: new Date().toISOString(), kallhashStart, kallhashSlut: await hashar_(), artikelStale, hashar, omdirigeringar: [...omdirigeringar], resultat }, null, 1));

for (const e of ENHETER) {
  const browser = await browserFor(e.motor);
  const touch = !!e.ctx.hasTouch;
  const t0 = Date.now();
  const rad = { enhet: e.slug, namn: e.namn, motor: e.motor, version: browser.version(), viewport: e.ctx.viewport, touch, isMobile: !!e.ctx.isMobile, colorScheme: e.colorScheme || 'light', sidor: [] };
  for (const s of SIDOR) {
    const ctx = await browser.newContext({ ...e.ctx, reducedMotion: 'reduce', locale: 'sv-SE' });
    await ctx.route(/^https:\/\/ampy\.se\//, ruta);
    await ctx.route(/^https:\/\/(www\.googletagmanager|fonts\.googleapis|fonts\.gstatic|www\.google-analytics|connect\.facebook)\./, (r) => r.abort());
    const page = await ctx.newPage();
    const fel = []; let loads = 0;
    page.on('pageerror', (x) => fel.push(String(x).slice(0, 160)));
    page.on('console', (m) => { if (m.type() === 'error') fel.push(m.text().slice(0, 160)); });
    page.on('load', () => loads++);
    const sida = { sida: s.slug, namn: s.namn, fel, tillstand: [] };
    try {
      await page.goto(bas + s.url, { waitUntil: 'load', timeout: 90000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      const url0 = page.url();
      const mata = async (namn) => { await page.waitForTimeout(80); const m = await page.evaluate(matt, { touch }); m.tillstand = namn; sida.tillstand.push(m); return m; };
      /* artikel: scrolla kortet i sikte (överkanten strax under sidhuvudet) och mät täckning */
      if (s.artikel) {
        const t = await page.evaluate(() => { const c = document.querySelector('#avdragskollen'); const h = document.querySelector('#brx-header'); const hh = h ? h.getBoundingClientRect().height : 0; const y = c.getBoundingClientRect().top + scrollY - hh - 8; scrollTo(0, Math.max(0, y)); return { hh, y }; });
        await page.waitForTimeout(150);
        sida.sidhuvudH = t.hh;
      }
      const m0 = await mata('standard');
      /* skärmdump: fristående rot standard = en per enhet; artikel: ett urval */
      if (s.slug === 'fristaende-rot') await page.screenshot({ path: join(ut, `${e.slug}.jpg`), type: 'jpeg', quality: 60, fullPage: true });
      if (s.artikel && ['iphone-12', 'ipad-gen7', 'ipad-pro-11', 'desktop-1024', 'desktop-1440', 'safari-desktop-1440'].includes(e.slug) && s.m === 'rot') await page.screenshot({ path: join(ut, `artikel-${e.slug}-${s.slug.replace('artikel-', '')}.jpg`), type: 'jpeg', quality: 55, fullPage: false });
      /* artikel: täckning även när kortet står mitt i fönstret och när dess nederkant står vid fönstrets nederkant */
      if (s.artikel) {
        sida.tackning = {};
        for (const [lage, fn] of [['topp-under-sidhuvud', null], ['mitt', () => { const c = document.querySelector('#avdragskollen').getBoundingClientRect(); scrollTo(0, scrollY + c.top + c.height / 2 - innerHeight / 2); }], ['nederkant', () => { const c = document.querySelector('#avdragskollen').getBoundingClientRect(); scrollTo(0, scrollY + c.bottom - innerHeight + 4); }]]) {
          if (fn) { await page.evaluate(fn); await page.waitForTimeout(120); }
          sida.tackning[lage] = await page.evaluate(() => { const card = document.querySelector('#avdragskollen'); const c2 = card.getBoundingClientRect(); const ut = []; for (const el of document.querySelectorAll('body *')) { const p = getComputedStyle(el).position; if (p !== 'fixed' && p !== 'sticky') continue; if (card.contains(el) || el.contains(card)) continue; const b = el.getBoundingClientRect(); if (b.width === 0 || b.height === 0 || getComputedStyle(el).visibility === 'hidden' || getComputedStyle(el).display === 'none') continue; const ox = Math.max(0, Math.min(b.right, c2.right) - Math.max(b.left, c2.left)), oy = Math.max(0, Math.min(b.bottom, c2.bottom) - Math.max(b.top, c2.top)); if (ox > 0 && oy > 0) ut.push({ el: (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]), pos: p, w: Math.round(ox), h: Math.round(oy), z: getComputedStyle(el).zIndex }); } return { scrollY: Math.round(scrollY), kortTop: Math.round(c2.top), kortBottom: Math.round(c2.bottom), vh: innerHeight, ut }; });
        }
        await page.evaluate(() => { const c = document.querySelector('#avdragskollen'); const h = document.querySelector('#brx-header'); const hh = h ? h.getBoundingClientRect().height : 0; scrollTo(0, Math.max(0, c.getBoundingClientRect().top + scrollY - hh - 8)); });
        await page.waitForTimeout(100);
      }
      /* Enter i fältet: ingen omladdning */
      const falt = page.locator('#rk-inkomst-1');
      await falt.click(); await page.keyboard.type('180000'); await page.keyboard.press('Enter'); await page.waitForTimeout(650);
      sida.enter = { url: page.url() === url0, loads, varde: await falt.inputValue(), tal: await page.locator('#rk-talrad').innerText().then((t) => t.replace(/\s+/g, ' ').trim()) };
      await falt.fill(''); await falt.blur(); await page.waitForTimeout(600);
      /* tangentbordsfokus: Tab från början, samla fokusringar */
      await page.evaluate(() => { document.activeElement && document.activeElement.blur(); const c = document.querySelector('#avdragskollen'); const f = document.createElement('button'); f.id = '_tab_start'; f.textContent = 'x'; f.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:1px;opacity:0'; c.parentElement.insertBefore(f, c); f.focus(); });
      const ringar = [];
      for (let i = 0; i < 9; i++) {
        await page.keyboard.press('Tab'); await page.waitForTimeout(40);
        ringar.push(await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return { el: 'body' }; const lbl = a.closest('label'); const mal = lbl || a; const s = getComputedStyle(mal); const namn = (a.id ? '#' + a.id : a.tagName.toLowerCase() + '[' + (a.name || a.className.split(' ')[0]) + ']'); return { el: namn, focusVisible: a.matches(':focus-visible'), outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}` : 'none', boxShadow: s.boxShadow !== 'none' ? s.boxShadow.slice(0, 60) : 'none', border: s.borderColor, iKort: !!a.closest('#avdragskollen') }; }));
      }
      sida.fokus = ringar;
      /* WebKit: Tab hoppar över radioknappar och knappar (Safari-standard); Alt+Tab når allt. Kör om med Alt+Tab. */
      if (e.motor === 'webkit') {
        await page.evaluate(() => document.getElementById('_tab_start').focus());
        const alt = [];
        for (let i = 0; i < 9; i++) {
          await page.keyboard.press('Alt+Tab'); await page.waitForTimeout(40);
          alt.push(await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return { el: 'body' }; const lbl = a.closest('label'); const mal = lbl || a; const s = getComputedStyle(mal); const namn = (a.id ? '#' + a.id : a.tagName.toLowerCase() + '[' + (a.name || a.className.split(' ')[0]) + ']'); return { el: namn, focusVisible: a.matches(':focus-visible'), outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 ? `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}` : 'none', boxShadow: s.boxShadow !== 'none' ? s.boxShadow.slice(0, 60) : 'none', border: s.borderColor, iKort: !!a.closest('#avdragskollen') }; }));
        }
        sida.fokusAlt = alt;
      }
      await page.evaluate(() => { document.getElementById('_tab_start')?.remove(); document.activeElement && document.activeElement.blur(); });
      await page.waitForTimeout(120);
      /* Nej på ägande: stopp med rött X; panelen får inte flytta sig */
      await lab(page, 'ager', 'nej').click(); await page.waitForTimeout(150);
      const m1 = await mata('stopp-ager');
      m1.skift = { eyebrow: +(m1.eyebrowT - m0.eyebrowT).toFixed(1), panelT: +(m1.panel.tRel - m0.panel.tRel).toFixed(1), panelH: +(m1.panel.h - m0.panel.h).toFixed(1), cardH: +(m1.cardH - m0.cardH).toFixed(1), huvudH: +(m1.huvudH - m0.huvudH).toFixed(1), panelW: +(m1.panel.w - m0.panel.w).toFixed(1) };
      m1.stoppRader = await page.evaluate(() => { const p = document.querySelector('#rk-stopptext'); return Math.round(p.getBoundingClientRect().height / (parseFloat(getComputedStyle(p).fontSize) * 1.35)); });
      if (['iphone-12', 'desktop-1440', 'smal-320x568', 'ipad-gen7'].includes(e.slug)) await page.locator('#avdragskollen').screenshot({ path: join(utFynd, `${e.slug}-${s.slug}-stopp-ager.jpg`), type: 'jpeg', quality: 55 }).catch(() => {});
      await lab(page, 'ager', 'ja').click(); await page.waitForTimeout(150);
      const m1b = await mata('tillbaka-ja');
      m1b.skift = { eyebrow: +(m1b.eyebrowT - m0.eyebrowT).toFixed(1), panelT: +(m1b.panel.tRel - m0.panel.tRel).toFixed(1), cardH: +(m1b.cardH - m0.cardH).toFixed(1) };
      /* Under 18 */
      await lab(page, 'alder-1', 'u18').click(); await page.waitForTimeout(150);
      const m2 = await mata('stopp-u18');
      m2.skift = { eyebrow: +(m2.eyebrowT - m0.eyebrowT).toFixed(1), panelT: +(m2.panel.tRel - m0.panel.tRel).toFixed(1), cardH: +(m2.cardH - m0.cardH).toFixed(1) };
      m2.stoppRader = await page.evaluate(() => { const p = document.querySelector('#rk-stopptext'); return Math.round(p.getBoundingClientRect().height / (parseFloat(getComputedStyle(p).fontSize) * 1.35)); });
      /* Över 65 + Lön 300 000: 0 kr + not */
      await lab(page, 'alder-1', '66+').click(); await falt.fill('300000'); await falt.blur(); await page.waitForTimeout(650);
      const m3 = await mata('66-lon'); m3.skift = { cardH: +(m3.cardH - m0.cardH).toFixed(1) };
      /* Båda: pensionsraden */
      await lab(page, 'alder-1', '18-65').click(); await lab(page, 'typ-1', 'bada').click(); await page.waitForTimeout(120);
      await page.locator('#rk-pension-1').fill('100000'); await page.locator('#rk-pension-1').blur(); await page.waitForTimeout(650);
      await mata('bada');
      /* två personer */
      await lab(page, 'typ-1', 'lon').click(); await page.locator('#rk-lagg').click(); await page.waitForTimeout(250);
      await mata('2-personer');
      /* 1 200 000 i fältet */
      await falt.fill('1200000'); await falt.blur(); await page.waitForTimeout(650);
      await mata('1200000');
      /* fyra personer utan inkomst: "upp till 200 000 kr" */
      await falt.fill(''); await falt.blur(); await page.locator('#rk-lagg').click(); await page.waitForTimeout(150); await page.locator('#rk-lagg').click(); await page.waitForTimeout(300);
      const m7 = await mata('4-personer-tomma');
      if (['iphone-12', 'iphone-se', 'desktop-1440', 'smal-320x568', 'galaxy-s9-plus', 'ipad-gen7', 'desktop-1024'].includes(e.slug)) await page.locator('#avdragskollen').screenshot({ path: join(utFynd, `${e.slug}-${s.slug}-4-personer.jpg`), type: 'jpeg', quality: 55 }).catch(() => {});
      /* Ta bort: tryckyta + fokus */
      const tabort = page.locator('#avdragskollen .rk__tabort').last();
      sida.tabort = await tabort.boundingBox();
      await tabort.click(); await page.waitForTimeout(200);
      sida.efterTabort = await page.evaluate(() => ({ antal: document.querySelector('#rk-personer').dataset.antal, fokus: document.activeElement && (document.activeElement.id || document.activeElement.className) }));
      /* defektskärmdumpar: överflöde, klipp, kr ensamt, bruten fras, tryckyta < 44 */
      for (const m of sida.tillstand) {
        const d = [];
        if (m.breda.length) d.push('breda'); if (m.klipp.length) d.push('klipp'); if (m.talrad && (m.talrad.krEgenRad || m.talrad.talparUtanfor > 1)) d.push('talrad');
        if (Object.values(m.fras).some((r) => r.some((x) => x.rader > 1 || x.svansEgenRad))) d.push('fras');
        if (touch && m.coarse && (m.tryck.labelMinH < 44 || (m.tryck.laggH && m.tryck.laggH < 44) || m.tryck.tabortH.some((h) => h < 44))) d.push('tryck');
        if (m.faltKlipp.length) d.push('faltklipp');
        if (m.overflowX && (m.overflowOrsak || []).some((x) => x.iKort)) d.push('overflow');
        m.defekter = d;
      }
    } catch (err) { sida.krasch = String(err).slice(0, 300); console.log('  KRASCH', e.slug, s.slug, sida.krasch); }
    /* skärmdump av tillstånd med defekt: kör om sekvensen är dyrt, så vi tar kortet i sista läget + noterar */
    rad.sidor.push(sida);
    await ctx.close();
  }
  rad.ms = Date.now() - t0;
  resultat.push(rad);
  await spara();
  const sum = rad.sidor.map((s) => `${s.sida}:${s.tillstand.map((t) => t.defekter?.length ? t.tillstand + '[' + t.defekter.join('+') + ']' : '').filter(Boolean).join(',') || 'ok'}`).join(' | ');
  console.log(`${e.slug} (${e.motor}) ${rad.ms} ms  ${sum}`);
}

/* ---------- svep: var byter layouten (fristående) och hur smal blir högerspalten (artikel) ---------- */
const svep = { fristaende: [], hoger: [] };
{
  const browser = await browserFor('chromium');
  const ctx = await browser.newContext({ viewport: { width: 800, height: 900 }, reducedMotion: 'reduce' });
  await ctx.route(/^https:\/\/ampy\.se\//, ruta);
  const page = await ctx.newPage();
  await page.goto(bas + '/kalkylator/v1/index.html?m=rot', { waitUntil: 'load' });
  for (let w = 700; w <= 800; w += 2) {
    await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(30);
    svep.fristaende.push(await page.evaluate((w) => { const c = document.querySelector('#avdragskollen'); const s = document.querySelector('.rk-spalt'); const cs = getComputedStyle(s); return { vw: w, contW: +(s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)).toFixed(1), cols: getComputedStyle(c).gridTemplateColumns.split(' ').length, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }; }, w));
  }
  await page.goto(bas + '/kalkylator/artikel/index.html?p=hoger&m=rot', { waitUntil: 'load', timeout: 90000 });
  for (let w = 781; w <= 1440; w += (w < 1100 ? 10 : 40)) {
    await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(40);
    svep.hoger.push(await page.evaluate((w) => { const c = document.querySelector('#avdragskollen'); const s = document.querySelector('.rk-behallare'); const cr = c.getBoundingClientRect(); const seg = document.querySelector('.rk__segment--tre'); const sr = seg.getBoundingClientRect(); const labs = [...document.querySelectorAll('.rk__segment > label')]; const klipp = labs.filter((l) => l.scrollWidth > l.clientWidth + 1).map((l) => l.textContent.trim()); return { vw: w, contW: +s.clientWidth.toFixed(1), cardW: +cr.width.toFixed(1), cols: getComputedStyle(c).gridTemplateColumns.split(' ').length, segUtanfor: +(sr.right - cr.right).toFixed(1), klipp, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }; }, w));
  }
  await ctx.close();
}
await writeFile(join(ut, 'svep.json'), JSON.stringify(svep, null, 1));
await spara();
for (const b of Object.values(oppna)) await b.close();
server.close();
const kallhashSlut = await hashar_();
const andrade = KALLOR.filter((f) => kallhashStart[f] !== kallhashSlut[f]);
console.log(andrade.length ? 'VARNING: källfiler ändrades under körningen: ' + andrade.join(', ') : 'källfilerna oförändrade under körningen', JSON.stringify(kallhashStart));
console.log('klart', Math.round((Date.now() - start) / 1000), 's', resultat.length, 'enheter ->', jsonVag);
