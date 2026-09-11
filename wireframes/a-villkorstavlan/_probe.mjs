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
// Embed/mobil mäts i två varianter: som byggt (första huvudraden öppen, A-M3) och med alla rader stängda, plus
// reviewerns "nästa spakar" (tel-länken och leaden dolda i DOM), så ägaren ser vad varje spak kostar.
const measureTool = (page, tool) => page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().height), tool);
async function measureHidden(page, tool, sels) {
  return page.evaluate(([s, list]) => {
    const hidden = [];
    for (const sel of list) for (const e of document.querySelectorAll(sel)) { hidden.push([e, e.style.display]); e.style.display = 'none'; }
    const h = Math.round(document.querySelector(s).getBoundingClientRect().height);
    for (const [e, d] of hidden) e.style.display = d;
    return h;
  }, [tool, sels]);
}
for (const [label, query, tool] of [['rot-standalone', '?m=rot', '#ak-rot'], ['gt-standalone', '?m=gt', '#ak-gt'], ['rot-embed', '?m=rot&surface=embed', '#ak-rot'], ['gt-embed', '?m=gt&surface=embed', '#ak-gt'], ['gt-batteri-embed', '?m=gt&l=batteri&surface=embed', '#ak-gt']]) {
  for (const [vp, w, h] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const { page, ctx, errors } = await open(query, { width: w, height: h });
    const t = await rect(page, tool); const card = await rect(page, `${tool} .ak-card`); const rows = await rect(page, `${tool} .ak-rows--main`);
    const verdict = await rect(page, `${tool} .ak-verdict`); const core = await rect(page, `${tool} .ak-besked__core`);
    const snabb = query.includes('embed') ? await rect(page, '#snabbfakta') : null;
    const demo = await rect(page, '.demo');
    const entry = { tool: t.height, card: card.height, verdict: verdict.height, rows: rows.height, core: core.height, toolTop: t.top, toolTopExclDemo: t.top - demo.height, snabbfaktaTop: snabb ? snabb.top : null, snabbfaktaTopExclDemo: snabb ? snabb.top - demo.height : null, errors };
    if (query.includes('embed') && vp === 'mobile') {
      entry.variants = {
        forsta_raden_oppen: await measureTool(page, tool),
        alla_rader_stangda: await page.evaluate((s) => {
          const open = [...document.querySelectorAll(`${s} .ak-row.is-open`)];
          open.forEach((r) => r.classList.remove('is-open'));
          const h = Math.round(document.querySelector(s).getBoundingClientRect().height);
          open.forEach((r) => r.classList.add('is-open'));
          return h;
        }, tool),
        utan_tel: await measureHidden(page, tool, [`${tool} .ak-cta .ak-sec`]),
        utan_tel_och_lead: await measureHidden(page, tool, [`${tool} .ak-cta .ak-sec`, `${tool} .ak-lead`]),
      };
    }
    out.heights[`${label}/${vp}`] = entry;
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
  // kompakt läge (mobil i artikeln, A-M3): första huvudraden öppen från start, de andra stängda tills raden trycks, stannar öppna
  ok('embed mobil: kompakt läge, första raden (boende) öppen från start', await page.evaluate(() => document.getElementById('ak-rot').classList.contains('is-compact') && document.getElementById('ak-rot-row-boende').classList.contains('is-open') && document.getElementById('ak-rot-ans-boende').getBoundingClientRect().height > 0));
  ok('embed mobil: övriga rader stängda (svarskolumnen dold)', await page.evaluate(() => ['vardear', 'belopp', 'skatt'].every((id) => !document.getElementById(`ak-rot-row-${id}`).classList.contains('is-open') && document.getElementById(`ak-rot-ans-${id}`).getBoundingClientRect().height === 0)));
  ok('embed mobil: aria-expanded true/false + aria-label "Svara: {villkor}"', await page.evaluate(() => {
    const b = document.querySelector('#ak-rot-row-boende .ak-row__stmt'); const v = document.querySelector('#ak-rot-row-vardear .ak-row__stmt'); const p = document.querySelector('#ak-rot-row-belopp .ak-row__stmt');
    return b.getAttribute('aria-expanded') === 'true' && v.getAttribute('aria-expanded') === 'false' && /^Svara: Huset är äldre/.test(v.getAttribute('aria-label')) && /^Ändra pris: /.test(p.getAttribute('aria-label')) && !v.hasAttribute('tabindex');
  }));
  ok('embed mobil: stängd rad = hel tryckyta >= 44 px med chevron i bläck, "Svara" utan understrykning', await page.evaluate(() => {
    const s = document.querySelector('#ak-rot-row-vardear .ak-row__stmt'); const o = s.querySelector('.ak-row__open'); const cs = getComputedStyle(o);
    return s.getBoundingClientRect().height >= 44 && s.getBoundingClientRect().width > 250 && o.querySelector('svg.ak-row__chev') !== null && cs.display !== 'none' && cs.color === 'rgb(15, 18, 60)' && cs.textDecorationLine === 'none' && cs.fontWeight === '600';
  }));
  await page.click('#ak-rot-row-vardear .ak-row__stmt');
  await page.waitForTimeout(400);
  ok('embed mobil: tryck på raden öppnar den + fokus på chipen', await page.evaluate(() => document.getElementById('ak-rot-row-vardear').classList.contains('is-open') && document.getElementById('ak-rot-ans-vardear').getBoundingClientRect().height > 0 && document.activeElement.name === 'rot-vardear' && document.querySelector('#ak-rot-row-vardear .ak-row__stmt').getAttribute('aria-expanded') === 'true'));
  await page.click('label:has(input[name="rot-boende"][value="villa"])');
  await page.waitForTimeout(250);
  ok('embed mobil: bekräftat svar tänder bocken, raden stannar öppen', await page.$eval('#ak-rot-row-boende', (el) => el.classList.contains('ak-row--ok') && el.classList.contains('is-open')));
  await page.click('label:has(input[name="rot-vardear"][value="vet_inte"])');
  await page.waitForTimeout(250);
  ok('embed mobil: vet inte på värdeår öppnar underfrågan i raden', await page.$eval('#ak-rot-row-arbetstyp', (el) => !el.hidden && el.classList.contains('is-open') && el.getBoundingClientRect().height > 0));
  await page.click('#ak-rot-row-belopp .ak-row__stmt');
  await page.waitForTimeout(300);
  ok('embed mobil: Ändra pris öppnar fältet med fokus', await page.evaluate(() => document.activeElement && document.activeElement.id === 'rot-belopp'));
  // Ett belopp per yta (A-M1): i artikeln bor beloppet i tavlans beloppsrad, blocket under tavlan finns inte
  const amtRow = await page.$eval('#ak-rot-row-belopp .ak-stmt__amt', (el) => el.textContent.replace(/\u00a0/g, ' '));
  const engineRubrik = await page.evaluate(() => window.__ak.tools.rot.view.result.belopp.rubrik.replace(/\u00a0/g, ' '));
  ok('embed: beloppet står i beloppsraden (= motorns rubrik) och inget block under tavlan', amtRow === engineRubrik && !(await page.$('#ak-rot-sum')), `${amtRow} | ${engineRubrik}`);
  ok('embed: "Ditt avdrag, preliminärt" finns exakt en gång', (await page.$$eval('#ak-rot .ak-row__cap, #ak-rot .ak-sum__h', (els) => els.filter((e) => e.getBoundingClientRect().height > 0).length)) === 1);
  ok('embed: att betala + basrad + källrad ligger i Visa villkoren (stängd)', await page.evaluate(() => { const m = document.getElementById('ak-rot-more'); const s = document.getElementById('ak-rot-moresum'); return !m.open && m.contains(s) && s.contains(document.getElementById('ak-rot-betala')) && s.querySelector('.ak-sum__kalla') !== null && /Att betala/.test(document.getElementById('ak-rot-betala').textContent); }));
  ok('embed: offert-CTA bär src=artikel', await page.$eval('#ak-rot-cta .ak-btn', (el) => /src=artikel/.test(el.getAttribute('href'))), await page.$eval('#ak-rot-cta .ak-btn', (el) => el.getAttribute('href')));
  ok('embed: ingen sticky-remsa', !(await page.$('#ak-rot-sticky')));
  ok('embed: Skriv ut saknas, Kopiera länk finns', !(await page.$('#ak-rot-dela [data-print]')) && (await page.$('#ak-rot-dela [data-share]')) !== null);
  await page.click('label:has(input[name="rot-boende"][value="brf"])');
  await page.waitForTimeout(300);
  ok('embed: URL rörs aldrig', page.url().endsWith('?m=rot&surface=embed'), page.url());
  await page.click('#ak-rot-more > summary');
  await page.waitForTimeout(200);
  ok('embed: Visa villkoren visar att betala + kompakta rader + steg', await page.evaluate(() => document.querySelector('#ak-rot-more').open && document.getElementById('ak-rot-moresum').getBoundingClientRect().height > 0 && document.querySelectorAll('#ak-rot-crows .ak-row').length >= 2));
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
    return { stmt: ratio(pick('.ak-row__stmt'), bg).toFixed(2), help: ratio(pick('.ak-q__help'), bg).toFixed(2), tag: ratio(pick('.ak-row__tag'), bg).toFixed(2), kalla: ratio(pick('.ak-sum__kalla'), bg).toFixed(2),
      eyebrow_ja_villkor: ratio(pick('#ak-rot-verdict.ak-verdict--ja_villkor .ak-eyebrow'), bg).toFixed(2), status: ratio(pick('.ak-dela__status'), bg).toFixed(2), sec: ratio(pick('.ak-sec'), bg).toFixed(2),
      btn: ratio('rgb(255, 255, 255)', getComputedStyle(document.querySelector('.ak-btn')).backgroundColor).toFixed(2) };
  });
  ok('kontrast brödtext >= 4.5 (stmt, help)', Number(contrast.stmt) >= 4.5 && Number(contrast.help) >= 4.5, JSON.stringify(contrast));
  ok('kontrast: eyebrow i ja-läge, "Länk kopierad" och sekundärlänk >= 4.5 (A-M5, S-1 lokalt)', Number(contrast.eyebrow_ja_villkor) >= 4.5 && Number(contrast.status) >= 4.5 && Number(contrast.sec) >= 4.5, JSON.stringify(contrast));
  ok('ingen teal text på vit (bara CTA-knappen, ägargrind S-1)', await page.evaluate(() => {
    const teal = 'rgb(0, 169, 145)';
    const bad = [...document.querySelectorAll('#ak-rot *')].filter((e) => e.getBoundingClientRect().height > 0 && e.children.length === 0 && e.textContent.trim() && getComputedStyle(e).color === teal && getComputedStyle(e).backgroundColor !== teal && !e.closest('.ak-btn'));
    return bad.length === 0;
  }));
  ok('desktop >= 768: villkorsknapparna utanför tabbordningen (tabindex=-1), Stämmer inte? >= 44 px (A-m2)', await page.evaluate(() => [...document.querySelectorAll('#ak-rot-rows .ak-row__stmt')].every((b) => b.getAttribute('tabindex') === '-1') && [...document.querySelectorAll('#ak-rot-crows .ak-row__fix')].every((b) => b.getBoundingClientRect().height >= 44)));
  ok('fristående: ett belopp (blocket under tavlan), inget belopp i beloppsraden, etiketten en gång', await page.evaluate(() => !document.querySelector('#ak-rot-row-belopp .ak-stmt__amt') && document.getElementById('ak-rot-rubrik').textContent.length > 0 && document.getElementById('ak-rot-row-belopp').classList.contains('ak-row--nocond') && [...document.querySelectorAll('#ak-rot .ak-row__cap, #ak-rot .ak-sum__h')].filter((e) => e.getBoundingClientRect().height > 0).length === 1));
  await ctx.close();
}

// ---- 7. Bekräfta genom att trycka på förvalet: mus + tangentbord (A-M2, S-7) ----
{
  const { page, ctx, errors } = await open('?m=rot', { width: 1440, height: 1000 });
  const rowStatus = (id) => page.$eval(`#ak-rot-row-${id}`, (el) => [...el.classList].find((c) => /^ak-row--(ok|antaget|okand|varning|stopp|skoter_vi|neutral)$/.test(c)).replace('ak-row--', ''));
  ok('load: boende/vardear/skatt antagna', (await rowStatus('boende')) === 'antaget' && (await rowStatus('vardear')) === 'antaget' && (await rowStatus('skatt')) === 'antaget');
  // mus: klick på den redan valda chippen (ger inget change-event) bekräftar
  await page.click('label:has(input[name="rot-boende"][value="villa"])');
  await page.waitForTimeout(250);
  ok('mus: klick på förvald chip bekräftar (boende -> ok)', (await rowStatus('boende')) === 'ok', await rowStatus('boende'));
  // tangentbord: Space på den redan valda radion
  await page.focus('input[name="rot-vardear"][value="t2011"]');
  await page.keyboard.press('Space');
  await page.waitForTimeout(250);
  ok('tangentbord: Space på förvald radio bekräftar (vardear -> ok)', (await rowStatus('vardear')) === 'ok', await rowStatus('vardear'));
  ok('tangentbord: Space byter inte värde', await page.$eval('input[name="rot-vardear"][value="t2011"]', (el) => el.checked));
  // tangentbord: Enter på den redan valda radion
  await page.focus('input[name="rot-skatt"][value="lon"]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  ok('tangentbord: Enter på förvald radio bekräftar (skatt -> ok)', (await rowStatus('skatt')) === 'ok', await rowStatus('skatt'));
  ok('alla tre bekräftade -> "Ja, du kan"', /^Ja, du kan/.test(await page.$eval('#ak-rot-headline', (el) => el.textContent)), await page.$eval('#ak-rot-headline', (el) => el.textContent));
  // pil-tangent byter värde (change) och räknas som svar
  await page.focus('input[name="rot-boende"][value="villa"]');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  ok('tangentbord: pil byter till bostadsrätt och räknar om', await page.$eval('input[name="rot-boende"][value="brf"]', (el) => el.checked) && /bostadsrätt/i.test(await page.$eval('#ak-rot-row-boende .ak-row__lines', (el) => el.textContent)));
  ok('inga JS-fel (bekräfta)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ---- 7b. Reviewerns scenario 2 tecken för tecken: underfrågan synlig (värdeår 2021–2025) + belopp skrivs med count-up, båda ytorna ----
for (const [label, query, vp] of [['fristående desktop', '?m=rot', { width: 1440, height: 1000 }], ['artikeln mobil', '?m=rot&surface=embed', { width: 390, height: 844 }]]) {
  const { page, ctx, errors } = await open(query, vp);
  if (query.includes('embed')) { await page.click('#ak-rot-row-vardear .ak-row__stmt'); await page.waitForTimeout(200); }
  await page.click('label:has(input[name="rot-vardear"][value="2021_2025"])');
  await page.waitForTimeout(200);
  if (query.includes('embed')) { await page.click('#ak-rot-row-belopp .ak-row__stmt'); await page.waitForTimeout(200); }
  const inp = page.locator('#rot-belopp'); await inp.click(); await inp.fill(''); await inp.type('60000', { delay: 15 }); await inp.press('Tab');
  await page.waitForTimeout(700);
  const amt = query.includes('embed') ? await page.$eval('#ak-rot-row-belopp .ak-stmt__amt', (el) => el.textContent.replace(/\u00a0/g, ' ')) : await page.$eval('#ak-rot-rubrik', (el) => el.textContent.replace(/\u00a0/g, ' '));
  ok(`scenario 2 (${label}): underfråga synlig + 60 000 skrivet -> 8 100 till 13 500, count-up landar, inga JS-fel`, /8 100 kr till 13 500 kr/.test(amt) && errors.length === 0 && await page.$eval('#ak-rot-row-arbetstyp', (el) => !el.hidden), `${amt} | ${errors.join(' | ')}`);
  await ctx.close();
}

// ---- 8. Motorns nya CTA-lägen: "räcker delvis" (tel primär + offert-textlänk) och solceller (lägesbyte som textlänk) ----
{
  const { page, ctx, errors } = await open('?m=rot', { width: 1440, height: 1000 });
  await page.click('label:has(input[name="rot-skatt"][value="lon"])');
  await page.click('#ak-rot-details > summary');
  await page.waitForTimeout(200);
  await page.click('label:has(input[data-q="skatt_djup"])');
  await page.waitForTimeout(200);
  await page.fill('#rot-manadsinkomst', '15000'); await page.press('#rot-manadsinkomst', 'Enter');
  await page.fill('#rot-belopp', '150000'); await page.press('#rot-belopp', 'Enter');
  await page.fill('#rot-arbete_kr', '100000'); await page.press('#rot-arbete_kr', 'Enter');
  await page.waitForTimeout(500);
  const cta = await page.$eval('#ak-rot-cta', (el) => ({ btn: el.querySelector('.ak-btn') && el.querySelector('.ak-btn').getAttribute('href'), btnText: el.querySelector('.ak-btn') && el.querySelector('.ak-btn').textContent, sec: el.querySelector('.ak-sec') && el.querySelector('.ak-sec').getAttribute('href'), secKind: el.querySelector('.ak-sec') && el.querySelector('.ak-sec').dataset.cta, secText: el.querySelector('.ak-sec') && el.querySelector('.ak-sec').textContent, n: el.querySelectorAll('a,button').length }));
  ok('räcker delvis: skatt-raden varning + beloppet begränsat', (await page.$eval('#ak-rot-row-skatt', (el) => el.classList.contains('ak-row--varning'))) && /räcker till/.test(await page.$eval('#ak-rot-rubrik', (el) => el.textContent)), await page.$eval('#ak-rot-rubrik', (el) => el.textContent));
  ok('räcker delvis: primär = solid tel "Prata med oss innan du beställer", sekundär = offert-textlänk', cta.btn && cta.btn.startsWith('tel:') && /Prata med oss/.test(cta.btnText) && cta.secKind === 'offert' && /\/kontakt\/\?src=avdragskollen/.test(cta.sec) && cta.n === 2, JSON.stringify(cta));
  ok('inga JS-fel (räcker delvis)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
{
  const { page, ctx, errors } = await open('?m=gt', { width: 1440, height: 1000 });
  await page.click('label:has(input[name="gt-lage"][value="sol"])');
  await page.click('label:has(input[name="gt-boende"][value="fritid"])');
  await page.waitForTimeout(300);
  const cta = await page.$eval('#ak-gt-cta', (el) => ({ solid: el.querySelector('.ak-btn') !== null, link: el.querySelector('button.ak-link[data-cta="lage_byte"]') && el.querySelector('button.ak-link[data-cta="lage_byte"]').textContent, sec: el.querySelector('.ak-sec') && el.querySelector('.ak-sec').dataset.cta }));
  ok('solceller: ingen solid knapp, lägesbyte som textlänk "Räkna på batteri till solcellerna", tel sekundär', !cta.solid && /batteri/.test(cta.link || '') && cta.sec === 'tel', JSON.stringify(cta));
  await page.click('#ak-gt-cta button[data-cta="lage_byte"]');
  await page.waitForTimeout(400);
  ok('solceller -> batteri: läget byter i samma verktyg, boende bevarat', await page.evaluate(() => document.querySelector('input[name="gt-lage"][value="batteri"]').checked && document.querySelector('input[name="gt-boende"][value="fritid"]').checked && !document.getElementById('ak-gt').hidden));
  ok('inga JS-fel (sol)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log(JSON.stringify(out, null, 1));
const fails = out.tests.filter((x) => !x.pass);
console.log(`\n${out.tests.length - fails.length}/${out.tests.length} tester gröna${fails.length ? `, FEL: ${fails.map((f) => f.name).join('; ')}` : ''}`);
