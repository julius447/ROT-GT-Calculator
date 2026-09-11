// Interaktionstest + höjdmätning för riktning A (Playwright). Kör från repo-roten:
//   node wireframes/a-villkorstavlan/_probe.mjs
// Skriver ut JSON: höjder per läge/yta/viewport (verktyget, kortet, budgeten 900 px i embed/mobil) och testutfall.
import { createRequire } from 'module';
const { chromium } = createRequire(new URL('../../tools/package.json', import.meta.url))('playwright');
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { resolve, join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let fp = join(root, p);
    if ((await stat(fp)).isDirectory()) fp = join(fp, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(fp)] || 'application/octet-stream' });
    res.end(await readFile(fp));
  } catch { res.writeHead(404); res.end('not found'); }
});
const port = 8700 + Math.floor(Math.random() * 200);
await new Promise((r) => server.listen(port, r));
const page0 = `http://localhost:${port}/wireframes/a-villkorstavlan/index.html`;
const browser = await chromium.launch();
const out = { heights: {}, tests: [] };
const ok = (name, cond, info) => out.tests.push({ name, pass: Boolean(cond), info });

async function open(query, vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, javaScriptEnabled: opts.js !== false, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(page0 + query, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  return { page, ctx, errors };
}
const rect = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), height: Math.round(r.height) }; }, sel);

// ---- 1. Höjder ----
for (const [label, query, tool] of [['rot-standalone', '?m=rot', '#ak-rot'], ['gt-standalone', '?m=gt', '#ak-gt'], ['rot-embed', '?m=rot&surface=embed', '#ak-rot'], ['gt-embed', '?m=gt&surface=embed', '#ak-gt']]) {
  for (const [vp, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const { page, ctx, errors } = await open(query, { width: w, height: h });
    const t = await rect(page, tool); const card = await rect(page, `${tool} .ak-card`); const rows = await rect(page, `${tool} .ak-rows--main`);
    const verdict = await rect(page, `${tool} .ak-verdict`); const core = await rect(page, `${tool} .ak-besked__core`);
    const snabb = query.includes('embed') ? await rect(page, '#snabbfakta') : null;
    out.heights[`${label}/${vp}`] = { tool: t.height, card: card.height, verdict: verdict.height, rows: rows.height, core: core.height, toolTop: t.top, snabbfaktaTop: snabb ? snabb.top : null, errors };
    await ctx.close();
  }
}

// ---- 2. Interaktion (mobil 390x844, fristående) ----
{
  const { page, ctx, errors } = await open('?m=rot', { width: 390, height: 844 });
  const cls = () => page.$eval('#ak-rot-verdict', (el) => [...el.classList].find((c) => c.startsWith('ak-verdict--')).replace('ak-verdict--', ''));
  const headline = () => page.$eval('#ak-rot-headline', (el) => el.textContent);
  ok('load: ja_villkor + "Ja, om det här stämmer"', (await cls()) === 'ja_villkor' && /om det här stämmer/.test(await headline()), await headline());
  ok('load: sticky dold', await page.$eval('#ak-rot-sticky', (el) => el.hidden));
  // a) Hyresrätt -> NEJ utan knapp
  await page.click('label:has(input[name="rot-boende"][value="hyra"])');
  await page.waitForTimeout(250);
  const noBtn = await page.$('#ak-rot-cta .ak-btn');
  ok('hyresrätt: klass nej', (await cls()) === 'nej', await headline());
  ok('hyresrätt: ingen solid knapp', !noBtn);
  ok('hyresrätt: kryss på boende-raden', await page.$eval('#ak-rot-row-boende', (el) => el.classList.contains('ak-row--stopp')));
  ok('hyresrätt: beloppsraden dold (banken)', await page.$eval('#ak-rot-row-belopp', (el) => el.hidden));
  ok('hyresrätt: sum tom', await page.$eval('#ak-rot-sum', (el) => el.classList.contains('is-empty')));
  ok('sticky: visas efter interaktion (mobil)', await page.$eval('#ak-rot-sticky', (el) => !el.hidden));
  // tillbaka till villa, sedan två "vet inte" -> OSÄKERT med tel
  await page.click('label:has(input[name="rot-boende"][value="villa"])');
  await page.click('label:has(input[name="rot-vardear"][value="vet_inte"])');
  await page.click('label:has(input[name="rot-skatt"][value="vet"])');
  await page.waitForTimeout(250);
  ok('två vet inte: klass osaker', (await cls()) === 'osaker', await headline());
  ok('två vet inte: CTA = tel, solid', await page.$eval('#ak-rot-cta', (el) => { const b = el.querySelector('.ak-btn'); return b && b.getAttribute('href').startsWith('tel:'); }));
  ok('två vet inte: frågeteckenring på vardear + skatt', await page.evaluate(() => ['vardear', 'skatt'].every((id) => document.getElementById(`ak-rot-row-${id}`).classList.contains('ak-row--okand'))));
  ok('vet inte på värdeår visar underfrågan Vad ska göras?', await page.$eval('#ak-rot-row-arbetstyp', (el) => !el.hidden));
  // allt bekräftat -> JA
  await page.click('label:has(input[name="rot-vardear"][value="t2011"])');
  await page.click('label:has(input[name="rot-skatt"][value="lon"])');
  await page.waitForTimeout(250);
  ok('allt bekräftat: klass ja + bockar', (await cls()) === 'ja' && await page.evaluate(() => ['boende', 'vardear', 'skatt'].every((id) => document.getElementById(`ak-rot-row-${id}`).classList.contains('ak-row--ok'))), await headline());
  // belopp: preset + stepper + tomt
  await page.click('#ak-rot-row-belopp .ak-preset[data-preset="60000"]');
  await page.waitForTimeout(350);
  const rub60 = await page.$eval('#ak-rot-rubrik', (el) => el.textContent.replace(/\u00a0/g, ' '));
  ok('preset 60 000 räknar om', /8 [0-9]00|1[0-9] [0-9]00/.test(rub60) && rub60 !== '', rub60);
  await page.click('#ak-rot-row-belopp .ak-step[data-step="1"]');
  await page.waitForTimeout(350);
  ok('stepper +5 000', (await page.$eval('#rot-belopp', (el) => el.value)).replace(/\s/g, '') === '65000', await page.$eval('#rot-belopp', (el) => el.value));
  await page.fill('#rot-belopp', '');
  await page.waitForTimeout(350);
  ok('tomt belopp = takläge', /Upp till/.test(await page.$eval('#ak-rot-rubrik', (el) => el.textContent)), await page.$eval('#ak-rot-rubrik', (el) => el.textContent));
  await page.fill('#rot-belopp', '42000');
  await page.press('#rot-belopp', 'Enter');
  await page.waitForTimeout(350);
  ok('inmatning formateras vid blur', (await page.$eval('#rot-belopp', (el) => el.value.replace(/\u00a0/g, ' '))) === '42 000', await page.$eval('#rot-belopp', (el) => el.value));
  // d) Fler detaljer
  await page.click('#ak-rot-details > summary');
  await page.waitForTimeout(200);
  ok('Fler detaljer öppnas, agare-raden synlig', await page.$eval('#ak-rot-row-agare', (el) => !el.hidden && el.getBoundingClientRect().height > 0));
  await page.click('label:has(input[name="rot-agare"][value="2"])');
  await page.waitForTimeout(250);
  ok('två ägare: kompakt villkorsrad + tak 100 000', await page.evaluate(() => document.querySelector('#ak-rot-crows [data-v="agare"]') !== null));
  // "Stämmer inte?" på 18-årsraden -> öppnar detaljer och fokuserar kryssrutan
  await page.click('#ak-rot-crows [data-v="under18"] .ak-row__fix');
  await page.waitForTimeout(400);
  ok('Stämmer inte? fokuserar under18-kryssrutan', await page.evaluate(() => document.activeElement && document.activeElement.id === 'rot-under18'));
  // villkorsrad -> fråga: klick på boende-villkoret fokuserar chipen
  await page.click('#ak-rot-row-boende .ak-row__stmt');
  await page.waitForTimeout(400);
  ok('villkorsrad -> fokus på frågan', await page.evaluate(() => document.activeElement && document.activeElement.name === 'rot-boende'));
  // e) kopiera länk
  await page.click('#ak-rot-dela [data-share]');
  await page.waitForTimeout(300);
  const status = await page.$eval('#ak-rot-status', (el) => el.textContent);
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
  ok('kopiera länk: status + URL med tillstånd', /Länk kopierad/.test(status) && /m=rot/.test(clip) && /o=2/.test(clip) && /a=42000/.test(clip), `${status} | ${clip}`);
  ok('URL:en uppdateras (replaceState)', /m=rot/.test(page.url()) && /a=42000/.test(page.url()), page.url());
  // skatt = låg -> troligen inte, ingen solid knapp, Skatteverket-länk
  await page.click('label:has(input[name="rot-skatt"][value="lag"])');
  await page.waitForTimeout(250);
  ok('låg inkomst: troligen_inte utan solid knapp', (await cls()) === 'troligen_inte' && !(await page.$('#ak-rot-cta .ak-btn')), await headline());
  // 2026 ej färdigt -> nej inte än, raderna under dimmas
  await page.click('label:has(input[name="rot-skatt"][value="lon"])');
  await page.click('label:has(input[name="rot-vardear"][value="2026_ej_fardig"])');
  await page.waitForTimeout(250);
  ok('2026 ej färdigt: nej + raderna under dimmas', (await cls()) === 'nej' && await page.evaluate(() => document.getElementById('ak-rot-row-belopp').classList.contains('is-dim') && document.getElementById('ak-rot-row-skatt').classList.contains('is-dim') && document.getElementById('ak-rot-row-vardear').classList.contains('ak-row--stopp')), await headline());
  // sticky: döljs när beskedet är synligt
  await page.evaluate(() => document.getElementById('ak-rot-core').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  ok('sticky döljs när beskedet är synligt', await page.$eval('#ak-rot-sticky', (el) => el.hidden));
  ok('inga JS-fel (rot, mobil)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---- 3. GT: batteri + nej solceller -> "Räkna med ROT i stället" (desktop) ----
{
  const { page, ctx, errors } = await open('?m=gt', { width: 1440, height: 1000 });
  await page.click('label:has(input[name="gt-lage"][value="batteri"])');
  await page.waitForTimeout(200);
  ok('batteri: sol-raden visas + agare i huvudtavlan', await page.evaluate(() => !document.getElementById('ak-gt-row-sol').hidden && document.getElementById('ak-gt-row-agare').closest('#ak-gt-rows') !== null));
  await page.click('label:has(input[name="gt-sol"][value="nej"])');
  await page.waitForTimeout(250);
  const h = await page.$eval('#ak-gt-headline', (el) => el.textContent);
  const btn = await page.$('#ak-gt-cta button[data-cta="lage_byte"]');
  ok('batteri utan sol: troligen inte + "Räkna med ROT i stället"', /Troligen inte/.test(h) && btn !== null, h);
  ok('batteri utan sol: alt_rot i beloppsraden', /ROT/.test(await page.$eval('#ak-gt-rubrik', (el) => el.textContent)));
  await page.click('label:has(input[name="gt-boende"][value="fritid"])');
  await page.click('#ak-gt-cta button[data-cta="lage_byte"]');
  await page.waitForTimeout(400);
  ok('lägesbyte: ROT visas med boende bevarat', await page.evaluate(() => !document.getElementById('ak-rot').hidden && document.getElementById('ak-gt').hidden && document.querySelector('input[name="rot-boende"][value="fritid"]').checked));
  ok('lägesbyte: URL m=rot', /m=rot/.test(page.url()), page.url());
  // sol + batteri samtidigt: två rader
  await page.goto(`${page0}?m=gt&l=sol&a=150000`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  ok('länk ?l=sol&a=150000: sol förvalt, belopp antaget', await page.evaluate(() => document.querySelector('input[name="gt-lage"][value="sol"]').checked && document.getElementById('gt-belopp').value.replace(/\s/g, '') === '150000'));
  ok('länkade svar är antagna (hålring)', await page.$eval('#ak-gt-row-boende', (el) => el.classList.contains('ak-row--antaget')));
  ok('inga JS-fel (gt, desktop)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---- 4. Embed: Visa villkoren, ingen sticky, URL orörd ----
{
  const { page, ctx, errors } = await open('?m=rot&surface=embed', { width: 390, height: 844 });
  ok('embed: H2 i verktyget', await page.$eval('#ak-rot-title', (el) => el.tagName === 'H2'));
  // kompakt rad (mobil i artikeln): chipsen är stängda tills raden öppnas, stannar öppna
  ok('embed mobil: raderna kompakta (svarskolumnen dold)', await page.$eval('#ak-rot-ans-boende', (el) => el.getBoundingClientRect().height === 0 && document.getElementById('ak-rot').classList.contains('is-compact')));
  ok('embed mobil: aria-expanded=false på villkorsknappen', await page.$eval('#ak-rot-row-boende .ak-row__stmt', (el) => el.getAttribute('aria-expanded') === 'false'));
  await page.click('#ak-rot-row-boende .ak-row__stmt');
  await page.waitForTimeout(400);
  ok('embed mobil: klick på villkoret öppnar raden + fokus på chipen', await page.evaluate(() => document.getElementById('ak-rot-row-boende').classList.contains('is-open') && document.getElementById('ak-rot-ans-boende').getBoundingClientRect().height > 0 && document.activeElement.name === 'rot-boende'));
  await page.click('label:has(input[name="rot-boende"][value="villa"])');
  await page.waitForTimeout(250);
  ok('embed mobil: bekräftat svar tänder bocken, raden stannar öppen', await page.$eval('#ak-rot-row-boende', (el) => el.classList.contains('ak-row--ok') && el.classList.contains('is-open')));
  await page.click('#ak-rot-row-vardear .ak-row__stmt');
  await page.click('label:has(input[name="rot-vardear"][value="vet_inte"])');
  await page.waitForTimeout(250);
  ok('embed mobil: vet inte på värdeår öppnar underfrågan i raden', await page.$eval('#ak-rot-row-arbetstyp', (el) => !el.hidden && el.classList.contains('is-open') && el.getBoundingClientRect().height > 0));
  await page.click('#ak-rot-row-belopp .ak-row__stmt');
  await page.waitForTimeout(300);
  ok('embed mobil: Ändra pris öppnar fältet med fokus', await page.evaluate(() => document.activeElement && document.activeElement.id === 'rot-belopp'));
  ok('embed: ingen sticky-remsa', !(await page.$('#ak-rot-sticky')));
  ok('embed: Skriv ut saknas, Kopiera länk finns', !(await page.$('#ak-rot-dela [data-print]')) && (await page.$('#ak-rot-dela [data-share]')) !== null);
  await page.click('label:has(input[name="rot-boende"][value="brf"])');
  await page.waitForTimeout(300);
  ok('embed: URL rörs aldrig', page.url().endsWith('?m=rot&surface=embed'), page.url());
  await page.click('#ak-rot-more > summary');
  await page.waitForTimeout(200);
  ok('embed: Visa villkoren visar kompakta rader + steg', await page.evaluate(() => document.querySelector('#ak-rot-more').open && document.querySelectorAll('#ak-rot-crows .ak-row').length >= 2));
  await page.click('#ak-rot-dela [data-share]');
  await page.waitForTimeout(300);
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
  ok('embed: kopierad länk är fristående (utan surface=embed) med b=brf', /m=rot/.test(clip) && /b=brf/.test(clip) && !/surface/.test(clip), clip);
  ok('inga JS-fel (embed)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---- 5. Utan JavaScript ----
{
  const { page, ctx } = await open('?m=rot', { width: 390, height: 844 }, { js: false });
  ok('utan JS: statisk beloppstabell synlig', await page.$eval('#ak-rot .ak-static', (el) => el.getBoundingClientRect().height > 0));
  ok('utan JS: förvalsbeskedet står i HTML', /om det här stämmer/.test(await page.$eval('#ak-rot-headline', (el) => el.textContent)));
  ok('utan JS: chips är riktiga radioknappar', (await page.$$('#ak-rot input[type="radio"]')).length > 10);
  await ctx.close();
}

// ---- 6. Tillgänglighet: fokusordning + fieldset/legend ----
{
  const { page, ctx } = await open('?m=rot', { width: 1440, height: 1000 });
  const legends = await page.$$eval('#ak-rot fieldset > legend', (els) => els.length);
  ok('fieldset/legend per chipsfråga', legends >= 4, String(legends));
  ok('aria-live på beskedet', (await page.$('#ak-rot-live[aria-live="polite"]')) !== null);
  ok('beloppsfältet inputmode=numeric, inte type=number', await page.$eval('#rot-belopp', (el) => el.getAttribute('inputmode') === 'numeric' && el.type === 'text'));
  const contrast = await page.evaluate(() => {
    const lum = (c) => { const [r, g, b] = c.match(/\d+/g).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
    const bg = 'rgb(255, 255, 255)';
    const pick = (sel) => getComputedStyle(document.querySelector(sel)).color;
    return { stmt: ratio(pick('.ak-row__stmt'), bg).toFixed(2), help: ratio(pick('.ak-q__help'), bg).toFixed(2), tag: ratio(pick('.ak-row__tag'), bg).toFixed(2), kalla: ratio(pick('.ak-sum__kalla'), bg).toFixed(2), btn: ratio('rgb(255, 255, 255)', getComputedStyle(document.querySelector('.ak-btn')).backgroundColor).toFixed(2) };
  });
  ok('kontrast brödtext >= 4.5 (stmt, help)', Number(contrast.stmt) >= 4.5 && Number(contrast.help) >= 4.5, JSON.stringify(contrast));
  await ctx.close();
}

await browser.close();
server.close();
console.log(JSON.stringify(out, null, 1));
const fails = out.tests.filter((x) => !x.pass);
console.log(`\n${out.tests.length - fails.length}/${out.tests.length} tester gröna${fails.length ? `, FEL: ${fails.map((f) => f.name).join('; ')}` : ''}`);
