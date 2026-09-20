/* Verifierar de föreslagna CSS-patcharna ur research/13 utan att röra källfilerna: patchen injiceras med addStyleTag
   och samma mått tas före/efter. Kör: node tools/enhetsmatris-patchtest.mjs */
import { chromium, webkit, devices } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/tools/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const v1Html = await readFile(join(root, 'kalkylator/v1/index.html'), 'utf8');
let artikelHtml = await readFile(join(root, 'kalkylator/artikel/index.html'), 'utf8');
artikelHtml = artikelHtml.replace(/<h2 class="ampy-h2 rk__rubrik"[^>]*>[\s\S]*?<\/h2>/, v1Html.match(/<h2 class="ampy-h2 rk__rubrik"[^>]*>[\s\S]*?<\/h2>/)[0]).replace(/<section class="ampy-card rk"[\s\S]*?<\/section>/, v1Html.match(/<section class="ampy-card rk"[\s\S]*?<\/section>/)[0]);
const server = createServer(async (req, res) => { try { const vag = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (vag === '/kalkylator/artikel/index.html') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(artikelHtml); return; } let p = join(root, vag); if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); } });
await new Promise((r) => server.listen(0, r)); const bas = `http://localhost:${server.address().port}`;
const hashar = { 'frontend-light-layer.min.css': '5b638592a2cd', 'theme-style-ampy.min.css': '243af2986dbc', 'post-15042.min.css': '502b0d84360f', 'post-56073.min.css': '69985dd214df', 'post-15096.min.css': '501d82d91edb' };
const cache = new Map();
async function ruta(route) { let url = route.request().url(); const m = url.match(/flying-press\/[0-9a-f]{12}\.(.+\.css)$/); if (m && hashar[m[1]]) url = url.replace(/flying-press\/[0-9a-f]{12}\./, `flying-press/${hashar[m[1]]}.`); let c = cache.get(url); if (!c) { try { const r = await route.fetch({ url, headers: { 'user-agent': 'Mozilla/5.0', accept: '*/*' } }); c = { status: r.status(), ct: r.headers()['content-type'] || 'application/octet-stream', body: await r.body() }; } catch { c = { status: 502, ct: 'text/plain', body: Buffer.from('') }; } cache.set(url, c); } await route.fulfill({ status: c.status, headers: { 'content-type': c.ct }, body: c.body }); }

/* ---- patcharna (samma text som i research/13) ---- */
const P5 = `
@container rk (max-width: 719px) { .rk__segment > label { min-width: 0; } }
@container rk (max-width: 339px) { .rk__segment > label { padding-inline: 5px; } }
@container rk (max-width: 299px) { .rk__segment > label { font-size: 15px; } }`;
const P6 = `
@container rk (min-width: 720px) { .rk { --rk-text-tal: clamp(40px, calc((45cqi - 80px) / 5.3), var(--ampy-text-number)); } }`;
const P7 = `
@container rk (min-width: 720px) { .rk__rad > .rk__belopp { margin-left: auto; } }`;
const P9 = `
@container rk (max-width: 339px) { .rk { --rk-text-tal: 44px; } }`;
const P2 = `:where(.ampy) :is(h1, h2, h3, h4, p, ul, ol, figure) { margin: 0; } .ampy-kalkylator .rk__under { margin-top: var(--rk-gap-sub); } .ampy-kalkylator .rk__under--rad { margin-top: calc(var(--rk-gap-sub) - var(--rk-gap-ctl)); } .ampy-kalkylator .rk__per, .ampy-kalkylator .rk__fin { margin-top: var(--ampy-space-2xs); } .ampy-kalkylator .rk__not { margin-top: var(--ampy-space-s); } .ampy-kalkylator .rk__under--lagg { margin-top: 0; }`;
const P3 = `.ampy-kalkylator .ampy-input:focus-visible { border-color: var(--ampy-action-strong) !important; box-shadow: var(--ampy-focus-ring); }`;

const matt = () => { const c = document.querySelector('#avdragskollen'); const cr = c.getBoundingClientRect(); const labs = [...c.querySelectorAll('.rk__segment > label')].filter((l) => l.offsetParent); const maxUt = Math.max(...labs.map((l) => l.getBoundingClientRect().right)) - cr.right; const klipp = labs.filter((l) => l.scrollWidth > l.clientWidth + 1).map((l) => l.textContent.trim()); const tal = document.querySelector('#rk-tal').getBoundingClientRect(), pre = document.querySelector('#rk-prefix').getBoundingClientRect(), enh = document.querySelector('#rk-talenhet').getBoundingClientRect(); const panel = document.querySelector('.rk__panel'); const pr = panel.getBoundingClientRect().right - parseFloat(getComputedStyle(panel).paddingRight); const s = document.querySelector('.rk-behallare') || document.querySelector('.rk-spalt'); const cs = getComputedStyle(s); return { contW: +(s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)).toFixed(0), cols: getComputedStyle(c).gridTemplateColumns.split(' ').length, etikettUt: +maxUt.toFixed(1), klipp: klipp.join('+') || '-', talFs: getComputedStyle(document.querySelector('#rk-tal')).fontSize, talVar: getComputedStyle(c).getPropertyValue('--rk-text-tal').trim(), talUt: +(enh.right - pr).toFixed(1), prefixEgenRad: tal.top >= pre.bottom - 2, eyebrowT: +(document.querySelector('#rk-eyebrow').getBoundingClientRect().top - cr.top).toFixed(1), cardH: +cr.height.toFixed(1), perMt: getComputedStyle(document.querySelector('#rk-per')).marginTop, faltRight: +(document.querySelector('#rk-anvant-1, #rk-gtanvant-1').getBoundingClientRect().right - cr.right).toFixed(1), faltRightRanta: +(document.querySelector('#rk-ranta-1').getBoundingClientRect().right - cr.right).toFixed(1) }; };
const lab = (page, name, value) => page.locator(`#avdragskollen label:has(input[name="${name}"][value="${value}"])`);
const D = (n) => { const d = { ...devices[n] }; delete d.defaultBrowserType; return d; };
const FALL = [
  { namn: 'P5+P9 iPhone SE 320 fristående', motor: webkit, ctx: D('iPhone SE'), url: '/kalkylator/v1/index.html?m=rot', css: P5 + P9, val: 'u18' },
  { namn: 'P5+P9 iPhone SE 320 artikel topp', motor: webkit, ctx: D('iPhone SE'), url: '/kalkylator/artikel/index.html?p=topp&m=rot', css: P5 + P9, val: 'u18' },
  { namn: 'P5+P9 320×568 Chromium artikel höger', motor: chromium, ctx: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, url: '/kalkylator/artikel/index.html?p=hoger&m=rot', css: P5 + P9, val: 'u18' },
  { namn: 'P5 Galaxy S8 360 fristående', motor: chromium, ctx: D('Galaxy S8'), url: '/kalkylator/v1/index.html?m=rot', css: P5, val: 'u18' },
  { namn: 'P6 desktop 1280 artikel topp', motor: chromium, ctx: { viewport: { width: 1280, height: 800 } }, url: '/kalkylator/artikel/index.html?p=topp&m=rot', css: P6 },
  { namn: 'P6 iPad Pro 11 liggande artikel topp', motor: webkit, ctx: D('iPad Pro 11 landscape'), url: '/kalkylator/artikel/index.html?p=topp&m=rot', css: P6 },
  { namn: 'P6 desktop 1440 artikel topp', motor: chromium, ctx: { viewport: { width: 1440, height: 900 } }, url: '/kalkylator/artikel/index.html?p=topp&m=rot', css: P6 },
  { namn: 'P6 desktop 1440 fristående (ska vara oförändrad 56 px)', motor: chromium, ctx: { viewport: { width: 1440, height: 900 } }, url: '/kalkylator/v1/index.html?m=rot', css: P6 },
  { namn: 'P6 iPad Mini 768 fristående', motor: webkit, ctx: D('iPad Mini'), url: '/kalkylator/v1/index.html?m=rot', css: P6 },
  { namn: 'P7 desktop 1440 artikel topp (fältet höger när raden bryter)', motor: chromium, ctx: { viewport: { width: 1440, height: 900 } }, url: '/kalkylator/artikel/index.html?p=topp&m=rot', css: P7 },
  { namn: 'P2 iPhone 12 artikel höger (marginaler tillbaka, inget skift)', motor: webkit, ctx: D('iPhone 12'), url: '/kalkylator/artikel/index.html?p=hoger&m=rot', css: P2 },
  { namn: 'P2 desktop 1440 artikel topp (inget skift i två spalter)', motor: chromium, ctx: { viewport: { width: 1440, height: 900 } }, url: '/kalkylator/artikel/index.html?p=topp&m=rot', css: P2 },
  { namn: 'P3 desktop 1440 artikel topp (fokusring)', motor: chromium, ctx: { viewport: { width: 1440, height: 900 } }, url: '/kalkylator/artikel/index.html?p=topp&m=rot', css: P3, fokus: true },
];
const oppna = new Map(); const ut = [];
for (const f of FALL) {
  const br = oppna.get(f.motor) || (await f.motor.launch()); oppna.set(f.motor, br);
  const ctx = await br.newContext({ ...f.ctx, reducedMotion: 'reduce' }); await ctx.route(/^https:\/\/ampy\.se\//, ruta); await ctx.route(/^https:\/\/(www\.googletagmanager|fonts\.g|www\.google-analytics|connect\.facebook)/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(bas + f.url, { waitUntil: 'load', timeout: 90000 }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(150);
  if (f.val) { await lab(page, 'alder-1', f.val).click(); await page.waitForTimeout(120); }
  const kor = async () => { const m0 = await page.evaluate(matt); await lab(page, 'ager', 'nej').click(); await page.waitForTimeout(150); const m1 = await page.evaluate(matt); await lab(page, 'ager', 'ja').click(); await page.waitForTimeout(150); m0.skiftEyebrow = +(m1.eyebrowT - m0.eyebrowT).toFixed(1); m0.skiftKort = +(m1.cardH - m0.cardH).toFixed(1); return m0; };
  const fokus = async () => { await lab(page, 'alder-1', '18-65').click(); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(100); return page.evaluate(() => { const i = document.querySelector('#rk-inkomst-1'); const s = getComputedStyle(i); return { aktiv: document.activeElement === i, border: s.borderColor, ring: s.boxShadow.slice(0, 45) }; }); };
  const fore = f.fokus ? await fokus() : await kor();
  await page.addStyleTag({ content: f.css }); await page.waitForTimeout(400);
  const efter = f.fokus ? await fokus() : await kor();
  ut.push({ fall: f.namn, fore, efter });
  console.log('==', f.namn, '\n  före:', JSON.stringify(fore), '\n  efter:', JSON.stringify(efter));
  await ctx.close();
}
await writeFile(join(root, 'research/underlag/enheter/patchtest.json'), JSON.stringify(ut, null, 1));
for (const b of oppna.values()) await b.close(); server.close();
