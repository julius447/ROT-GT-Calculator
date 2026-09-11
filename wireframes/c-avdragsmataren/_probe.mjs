// Interaktionstest + höjdmätning för riktning C (Playwright). Körs från repo-roten:
//   node wireframes/c-avdragsmataren/_probe.mjs
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
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
const base = `http://localhost:${port}/wireframes/c-avdragsmataren/index.html`;
const browser = await chromium.launch();
const results = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: Boolean(cond), extra }); };

async function open(query, viewport = { width: 390, height: 844 }) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${base}${query}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  return { page, errors };
}
const toolHeight = (page) => page.evaluate(() => Math.round(document.getElementById('verktyg').getBoundingClientRect().height));
const toolTop = (page) => page.evaluate(() => Math.round(document.getElementById('verktyg').getBoundingClientRect().top + window.scrollY));
const topOf = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top + window.scrollY) : null; }, sel);
const demoH = (page) => page.evaluate(() => Math.round(document.querySelector('.demo').getBoundingClientRect().height));
/** Tryck på en chip som en tumme: klicka etiketten (label), inte inputen. */
const tap = async (page, sel) => { await page.locator(sel).first().locator('xpath=ancestor::label[1]').click(); };
const setRange = (page, name, v) => page.evaluate(([n, val]) => { const r = document.querySelector(`input[name="${n}"]`); r.value = val; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }, [name, v]);
const taxLabel = (page) => page.evaluate(() => document.querySelector('.meter__taxtxt').textContent.trim());
const headline = (page) => page.evaluate(() => document.getElementById('verdict-h').textContent.trim());
const primary = (page) => page.evaluate(() => { const el = document.querySelector('#cta .cta__primary > *'); return el ? { tag: el.tagName, cls: el.className, text: el.textContent.trim() } : null; });
const secondary = (page) => page.evaluate(() => { const el = document.querySelector('#cta .cta__secondary > *'); return el ? el.textContent.trim() : null; });

// ---- höjder (embed-budgeten) ----
const heights = {};
for (const [label, q, vp] of [
  ['embed rot mobil', '?m=rot&surface=embed', { width: 390, height: 844 }],
  ['embed gt laddbox mobil', '?m=gt&l=laddbox&surface=embed', { width: 390, height: 844 }],
  ['embed gt batteri mobil', '?m=gt&l=batteri&surface=embed', { width: 390, height: 844 }],
  ['embed rot desktop', '?m=rot&surface=embed', { width: 1440, height: 1000 }],
  ['standalone rot mobil', '?m=rot', { width: 390, height: 844 }],
  ['standalone rot desktop', '?m=rot', { width: 1440, height: 1000 }],
  ['standalone gt batteri mobil', '?m=gt&l=batteri', { width: 390, height: 844 }],
]) {
  const { page, errors } = await open(q, vp);
  const d = await demoH(page);
  heights[label] = { tool_px: await toolHeight(page), tool_top_px: await toolTop(page) - d, besked_top_px: (await topOf(page, '#besked')) - d, doc_px: await page.evaluate(() => document.documentElement.scrollHeight), errors };
  await page.close();
}

// ---- Fixrunda 2026-09-11: blockers C-B1..B3 ----
{
  // C-B1: count-up-racet. Batteri, sedan "Nej" på solceller inom 60 ms: avläsningen får aldrig visa batteriets belopp.
  for (const gap of [60, 1000]) {
    const { page, errors } = await open('?m=gt', { width: 1440, height: 1000 });
    await tap(page, 'input[name="lage"][value="batteri"]');
    await page.waitForTimeout(gap);
    await tap(page, 'input[name="sol"][value="nej"]');
    await page.waitForTimeout(900);
    const rubrik = await page.evaluate(() => document.querySelector('.meter__rubrik').textContent.trim());
    const h = await headline(page);
    ok(`C-B1 race (${gap} ms): rubriken "Troligen inte…"`, /^Troligen inte/.test(h), h);
    ok(`C-B1 race (${gap} ms): avläsningen = "ROT 30 % på arbetskostnaden kan gälla i stället"`, rubrik === 'ROT 30 % på arbetskostnaden kan gälla i stället', rubrik);
    ok(`C-B1 race (${gap} ms): inga JS-fel`, errors.length === 0, errors.join(' | '));
    await page.close();
  }
  // C-B1: belopp skrivs (tween startar), hyresrätt trycks inom 280 ms: inget belopp bredvid ett nej
  {
    const { page } = await open('?m=rot', { width: 1440, height: 1000 });
    const el = page.locator('input[name="belopp"]');
    await el.click(); await el.fill(''); await el.type('60000', { delay: 5 }); await el.press('Tab');
    await page.waitForTimeout(420);
    await tap(page, 'input[name="boende"][value="hyra"]');
    await page.waitForTimeout(900);
    const rubrik = await page.evaluate(() => document.querySelector('.meter__rubrik').textContent.trim());
    ok('C-B1 race (belopp -> hyra): avläsningen tom vid hårt nej', rubrik === '', rubrik);
    await page.close();
  }
  // C-B2: bekräfta-trycket. Tre tryck på förvalda chips -> "Ja, du kan använda ROT-avdraget".
  {
    const { page } = await open('?m=rot', { width: 1440, height: 1000 });
    await tap(page, 'input[name="boende"][value="villa"]');
    await page.waitForTimeout(150);
    const rows1 = await page.$$eval('.villkor__row', (els) => els.map((e) => [...e.classList].find((c) => /^is-/.test(c))));
    ok('C-B2: trycket på förvald "Villa" bekräftar raden (is-ok)', rows1[0] === 'is-ok', rows1.join(','));
    await tap(page, 'input[name="vardear"][value="t2011"]');
    await tap(page, 'input[name="skatt"][value="lon"]');
    await page.waitForTimeout(300);
    const h = await headline(page);
    ok('C-B2: tre bekräftade förval -> "Ja, du kan använda ROT-avdraget"', h === 'Ja, du kan använda ROT-avdraget', h);
    await page.close();
  }
  // C-B2 / S-7: tangentbord. Space på den redan valda radion bekräftar.
  {
    const { page } = await open('?m=rot', { width: 1440, height: 1000 });
    await page.focus('input[name="boende"][value="villa"]');
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    const first = await page.$eval('.villkor__row', (e) => [...e.classList].find((c) => /^is-/.test(c)));
    ok('C-B2 tangentbord: Space på vald radio bekräftar (is-ok)', first === 'is-ok', first);
    await page.focus('input[name="vardear"][value="t2011"]');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const rows = await page.$$eval('.villkor__row', (els) => els.map((e) => [...e.classList].find((c) => /^is-/.test(c))));
    ok('C-B2 tangentbord: Enter på vald radio bekräftar (rad 2 is-ok)', rows[1] === 'is-ok', rows.join(','));
    // ett vanligt byte via klick ger fortfarande bara ETT svar (ingen dubblett): staten ska vara brf efteråt
    await tap(page, 'input[name="boende"][value="brf"]');
    await page.waitForTimeout(200);
    const txt = await page.$eval('.villkor__row', (e) => e.textContent);
    ok('C-B2: byte villa -> bostadsrätt registreras', /bostadsrätt/i.test(txt), txt.trim());
    await page.close();
  }
  // C-B3: två ägare, fördjupning på båda -> etikettens tal = motorns tal (villkorsradens "räcker till X av Y")
  {
    const { page, errors } = await open('?m=rot', { width: 1440, height: 1000 });
    await page.click('#fler summary');
    await tap(page, 'input[name="agare"][value="2"]');
    await page.fill('input[name="belopp"]', '150000'); await page.dispatchEvent('input[name="belopp"]', 'blur');
    await page.fill('input[name="arbete_kr"]', '150000'); await page.dispatchEvent('input[name="arbete_kr"]', 'blur');
    await page.waitForTimeout(500);
    await setRange(page, 'manadsinkomst', 15000);
    await setRange(page, 'manadsinkomst_2', 60000);
    await page.waitForTimeout(400);
    const label = await taxLabel(page);
    const row = await page.evaluate(() => { const r = [...document.querySelectorAll('.villkor__row')].find((e) => /räcker preliminärt till/.test(e.textContent)); return r ? r.textContent.trim() : ''; });
    const inLabel = ((label.match(/\(ca ([^)]+)\)/) || [])[1] || '').replace(/\D/g, '');
    const inRow = ((row.match(/till ([\d\s\u00a0]+)kr av/) || [])[1] || '').replace(/\D/g, '');
    ok('C-B3: två ägare + fördjupning på båda: etikettens tal = motorns "ryms"', inLabel.length > 0 && inLabel === inRow, `${label} | ${row}`);
    ok('C-B3: markören på (skattetaket ritas)', await page.evaluate(() => document.querySelector('.meter__marker').classList.contains('is-on')));
    ok('C-B3: ägare 2:s reglage rört -> talet utan "antaget"', await page.evaluate(() => !document.querySelector('.djup__cell--manadsinkomst_2 .slider__tag')));
    ok('C-B3: inga JS-fel', errors.length === 0, errors.join(' | '));
    await page.close();
  }
}

// ---- Fixrunda: majors C-M1..M8 ----
{
  // C-M1: mobil ordning: besked direkt efter reglagen, fördjupningen efter beskedet
  const { page } = await open('?m=rot');
  const t = async (s) => topOf(page, s);
  const [ctl, bes, djup, fler] = [await t('.controls'), await t('#besked'), await t('.djup'), await t('#fler')];
  ok('C-M1: mobil: reglage < besked < fördjupning < Fler detaljer', ctl < bes && bes < djup && djup < fler, `${ctl} < ${bes} < ${djup} < ${fler}`);
  // C-M3: reglaget i orört läge
  ok('C-M3: reglaget orört -> "Dra för att ange"', (await page.evaluate(() => document.querySelector('.djup__cell--manadsinkomst output').textContent.trim())) === 'Dra för att ange');
  ok('C-M3: reglaget orört -> aria-valuetext "inte angivet"', (await page.evaluate(() => document.querySelector('input[name="manadsinkomst"]').getAttribute('aria-valuetext'))) === 'inte angivet');
  ok('C-M3: en hjälprad i bandet (vi sparar inget), ingen prompt, inget resultat före inkomst', await page.evaluate(() => { const h = document.querySelectorAll('.djup .djup__help'); const st = document.getElementById('djup-status'); return h.length === 1 && /sparar inget/.test(h[0].textContent) && st.hidden && st.textContent.trim() === ''; }));
  // fyllt 66 ensamt (bekräftat "Nej") tänder INTE fördjupningen (ingen markör på en inkomst kunden inte angett)
  await tap(page, 'input[name="fyllt66"][value="false"]');
  await page.waitForTimeout(150);
  ok('C-M3: fyllt 66 besvarat utan inkomst -> ingen skattemarkör', await page.evaluate(() => !document.querySelector('.meter__marker').classList.contains('is-on')));
  await setRange(page, 'manadsinkomst', 20000);
  await page.waitForTimeout(300);
  ok('C-M3: reglaget rört -> talet visas', (await page.evaluate(() => document.querySelector('.djup__cell--manadsinkomst output').textContent.trim())).startsWith('20'));
  ok('C-M3: reglaget rört -> skattemarkören ritas', await page.evaluate(() => document.querySelector('.meter__marker').classList.contains('is-on')));
  ok('C-M3: reglaget rört -> motorns skatterad + hedge visas SIST i bandet (under reglagen)', await page.evaluate(() => { const st = document.getElementById('djup-status'); const g = document.querySelector('.djup__grid--1'); return !st.hidden && /räcker preliminärt/.test(st.textContent) && st.getBoundingClientRect().top > g.getBoundingClientRect().bottom; }));
  // C-M2: "Både lön och pension" ersätter inkomsttyp-chippen
  ok('C-M2: inga inkomsttyp-chips i bandet (en inkomstfråga)', await page.evaluate(() => !document.querySelector('#q-inkomsttyp input[type="radio"]') && !!document.querySelector('#q-inkomsttyp input[type="checkbox"]')));
  await page.check('#q-inkomsttyp input[type="checkbox"]');
  await page.waitForTimeout(200);
  ok('C-M2: "Både" på -> lön/pension-fälten syns, reglaget döljs', await page.evaluate(() => !document.querySelector('.djup__cell--lon_manad').hidden && !document.querySelector('.djup__cell--pension_manad').hidden && document.querySelector('.djup__cell--manadsinkomst').hidden));
  ok('C-M2: "Både" på utan belopp -> markören av tills lön/pension anges', await page.evaluate(() => !document.querySelector('.meter__marker').classList.contains('is-on')));
  await page.fill('input[name="lon_manad"]', '30000'); await page.dispatchEvent('input[name="lon_manad"]', 'blur');
  await page.waitForTimeout(600);   // beloppsfältets debounce är 400 ms
  ok('C-M2: lön ifylld -> markören på', await page.evaluate(() => document.querySelector('.meter__marker').classList.contains('is-on')));
  await page.uncheck('#q-inkomsttyp input[type="checkbox"]');
  await page.waitForTimeout(200);
  ok('C-M2: "Både" av -> reglaget tillbaka med sitt tal', await page.evaluate(() => !document.querySelector('.djup__cell--manadsinkomst').hidden && document.querySelector('.djup__cell--manadsinkomst output').textContent.trim().startsWith('20')));
  // C-M6 / C-M7: statisk tabell bara utan JS, källrad synlig
  ok('C-M6: beloppstabellen finns inte i DOM med JS', await page.evaluate(() => !document.querySelector('.tabell')));
  ok('C-M7: källa + datum synlig vid avläsningen', await page.evaluate(() => { const k = document.querySelector('.meter__kalla'); return k && k.getClientRects().length > 0 && /Skatteverket/.test(k.textContent); }));
  // C-m1: rubrikordning h1 -> h2 -> h2
  const hs = await page.$$eval('#verktyg h1, #verktyg h2, #verktyg h3, #verktyg h4', (els) => els.filter((e) => e.getClientRects().length).map((e) => e.tagName));
  ok('C-m1: rubrikordning utan hopp (H1, H2, H2, H3…)', hs[0] === 'H1' && hs[1] === 'H2' && hs[2] === 'H2', hs.join(','));
  // C-m2: skärmläsartexten utan dubbel interpunktion
  await tap(page, 'input[name="boende"][value="fritid"]');
  await page.waitForTimeout(800);
  const live = await page.evaluate(() => document.getElementById('live').textContent);
  ok('C-m2: aria-live utan ":." ', !/[:.]\./.test(live), live);
  await page.close();
}
{
  // C-M5 kontrast: vald chip = bläck, taggen "antaget" = ink-muted, eyebrow = ink-muted
  const { page } = await open('?m=rot', { width: 1440, height: 1000 });
  const cols = await page.evaluate(() => ({
    chip: getComputedStyle(document.querySelector('.chip input:checked + .chip__face')).backgroundColor,
    tag: getComputedStyle(document.querySelector('.villkor__tag')).color,
    eyebrow: getComputedStyle(document.querySelector('.verdict__eyebrow')).color,
    dim: getComputedStyle(document.querySelector('.meter__key.is-dim')).color,
    preset: getComputedStyle(document.querySelector('.preset.is-on')).color,
  }));
  ok('C-M5: vald chip fylld med bläck (rgb(15, 18, 60))', cols.chip === 'rgb(15, 18, 60)', cols.chip);
  ok('C-M5: "antaget"-taggen i ink-muted (rgb(86, 94, 130))', cols.tag === 'rgb(86, 94, 130)', cols.tag);
  ok('C-M5: eyebrow i ink-muted', cols.eyebrow === 'rgb(86, 94, 130)', cols.eyebrow);
  ok('C-M5: dämpad legend i ink-muted', cols.dim === 'rgb(86, 94, 130)', cols.dim);
  ok('C-M5: preset.is-on i bläck', cols.preset === 'rgb(15, 18, 60)', cols.preset);
  // motoränding (a): skatten räcker delvis -> tel som solid primär, offert som sekundär textlänk
  await page.fill('input[name="belopp"]', '200000'); await page.dispatchEvent('input[name="belopp"]', 'blur');
  await page.waitForTimeout(500);
  await setRange(page, 'manadsinkomst', 15000);
  await page.waitForTimeout(300);
  const p = await primary(page); const s = await secondary(page);
  const phref = await page.evaluate(() => document.querySelector('#cta .cta__primary a').getAttribute('href'));
  const shref = await page.evaluate(() => { const a = document.querySelector('#cta .cta__secondary a'); return a && a.getAttribute('href'); });
  ok('motor (a): delvis -> primär = tel, solid', p && /btn--primary/.test(p.cls) && /^tel:/.test(phref), JSON.stringify(p));
  ok('motor (a): delvis -> sekundär = offert-textlänk till /kontakt/', s === 'Få ett pris efter avdrag' && /\/kontakt\//.test(shref || ''), `${s} ${shref}`);
  await page.close();
}
{
  // C-m4: tre tända poster (redan använt + jobbet + kan bli kvarskatt) -> legenden i en kolumn på mobil
  const { page } = await open('?m=rot&u=10000&a=200000');
  await setRange(page, 'manadsinkomst', 15000);
  await page.waitForTimeout(300);
  const lit = await page.evaluate(() => [...document.querySelectorAll('.meter__key:not(.is-dim)')].length);
  ok('C-m4: legenden med > 2 tända poster får has-many (en kolumn på mobil)', lit === 3 && await page.evaluate(() => document.querySelector('.meter__legend').classList.contains('has-many') && getComputedStyle(document.querySelector('.meter__legend')).gridTemplateColumns.split(' ').length === 1), `tända: ${lit}`);
  await page.close();
}
{
  // motoränding (b): GT solceller -> primär = lage_byte som TEXTLÄNK (solid: false) som byter till batteri
  const { page, errors } = await open('?m=gt&l=sol', { width: 1440, height: 1000 });
  const p = await primary(page);
  ok('motor (b): sol -> primär är en textlänk, ingen solid knapp', p && p.tag === 'BUTTON' && /textlink/.test(p.cls) && !/btn--primary/.test(p.cls), JSON.stringify(p));
  ok('motor (b): sol -> sekundär tel', /tel:/.test(await page.evaluate(() => document.querySelector('#cta .cta__secondary a').getAttribute('href'))));
  await page.click('#cta .cta__primary button');
  await page.waitForTimeout(300);
  ok('motor (b): klick -> läge batteri', await page.evaluate(() => document.querySelector('input[name="lage"]:checked').value === 'batteri'));
  ok('motor (b): inga JS-fel', errors.length === 0, errors.join(' | '));
  await page.close();
}
{
  // C-M8: "kvar i år" i spårets tomma del på ett litet jobb; av när jobbet fyller spåret
  const { page } = await open('?m=rot', { width: 1440, height: 1000 });
  ok('C-M8: "kvar i år" tänd på förvalet (30 000 kr)', await page.evaluate(() => { const k = document.querySelector('.meter__kvar'); return k.classList.contains('is-on') && /kvar i år/.test(k.textContent); }), await page.evaluate(() => document.querySelector('.meter__kvar').textContent));
  await page.fill('input[name="belopp"]', '400000'); await page.dispatchEvent('input[name="belopp"]', 'blur');
  await page.waitForTimeout(500);
  ok('C-M8: "kvar i år" släckt när jobbet fyller spåret', await page.evaluate(() => !document.querySelector('.meter__kvar').classList.contains('is-on')));
  await page.close();
}

// ---- interaktion (mobil, fristående, rot) ----
{
  const { page, errors } = await open('?m=rot');
  ok('load: rubriken är "Ja, om det här stämmer:"', (await headline(page)).startsWith('Ja, om det här stämmer'), await headline(page));
  ok('load: inga JS-fel', errors.length === 0, errors.join(' | '));
  ok('load: sticky-remsan dold på load', await page.evaluate(() => document.getElementById('sticky').hidden));
  // Hyresrätt -> NEJ utan knapp
  await page.check('input[name="boende"][value="hyra"]');
  await page.waitForTimeout(100);
  const h1 = await headline(page); const p1 = await primary(page);
  ok('hyresrätt -> NEJ', h1.startsWith('Nej'), h1);
  ok('hyresrätt -> ingen solid knapp', !p1 || !/btn--primary/.test(p1.cls), JSON.stringify(p1));
  ok('hyresrätt -> mätaren inaktiv', await page.evaluate(() => document.querySelector('.meter').classList.contains('is-inactive')));
  ok('hyresrätt -> beloppsfrågan gråad, kvar i DOM', await page.evaluate(() => { const f = document.getElementById('q-belopp'); return f && !f.hidden && f.disabled; }));
  ok('sticky-remsan visas efter interaktion (mobil, fristående)', await page.evaluate(() => !document.getElementById('sticky').hidden));
  // tillbaka till villa, sedan två "vet inte" -> OSÄKERT med tel
  await page.check('input[name="boende"][value="villa"]');
  await page.check('input[name="vardear"][value="vet_inte"]');
  await page.check('input[name="skatt"][value="vet"]');
  await page.waitForTimeout(100);
  const h2 = await headline(page); const p2 = await primary(page);
  ok('två vet inte -> OSÄKERT', h2.startsWith('Osäkert'), h2);
  ok('OSÄKERT -> tel som primär', p2 && /tel:/.test(await page.evaluate(() => document.querySelector('#cta .cta__primary a').getAttribute('href'))), JSON.stringify(p2));
  ok('OSÄKERT -> takläge i mätaren (kontur)', await page.evaluate(() => document.querySelector('.meter__seg--outline').classList.contains('is-on')));
  // skattefördjupning: dra reglaget -> skattetaket ritas
  await page.check('input[name="skatt"][value="lon"]');
  await page.check('input[name="vardear"][value="t2011"]');
  await page.fill('input[name="belopp"]', '200000');
  await page.dispatchEvent('input[name="belopp"]', 'blur');
  await page.waitForTimeout(500);
  await page.evaluate(() => { const r = document.querySelector('input[name="manadsinkomst"]'); r.value = 15000; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(150);
  const h3 = await headline(page);
  ok('15 000 kr/mån + 200 000 kr -> "Ja, men skatten räcker till ungefär …"', /^Ja, men skatten räcker/.test(h3), h3);
  ok('skattetaket ritas (markören på)', await page.evaluate(() => document.querySelector('.meter__marker').classList.contains('is-on')));
  ok('kvarskatt-segmentet ritas', await page.evaluate(() => document.querySelector('.meter__seg--over').classList.contains('is-on')));
  const lbl = await page.evaluate(() => document.querySelector('.meter__taxtxt').textContent);
  ok('etiketten "Din skatt räcker hit (ca …)"', /Din skatt räcker hit/.test(lbl), lbl);
  const legend = await page.evaluate(() => [...document.querySelectorAll('.meter__key:not(.is-dim)')].map((k) => k.textContent.trim()));
  ok('legenden visar kan bli kvarskatt med belopp', legend.some((x) => /Kan bli kvarskatt/.test(x) && /kr/.test(x)), legend.join(' | '));
  // länken bär aldrig inkomst (replaceState är debouncad 400 ms)
  await page.waitForTimeout(600);
  const url = await page.evaluate(() => `${location.pathname}${location.search}`);
  ok('URL:en efter replaceState saknar inkomst', !/manad|inkomst|ranta|skatt_djup/.test(url) && /a=200000/.test(url), url);
  // Fler detaljer
  await page.click('#fler summary');
  ok('Fler detaljer öppnas', await page.evaluate(() => document.getElementById('fler').open));
  ok('Fler detaljer innehåller ägare + redan använt', await page.evaluate(() => !!document.querySelector('#folded #q-agare') && !!document.querySelector('#folded #q-anvant_rot')));
  // villkorsrad -> fråga
  await page.click('.villkor__btn[data-fraga="boende"]');
  await page.waitForTimeout(300);
  ok('villkorsrad flyttar fokus till frågan', await page.evaluate(() => document.activeElement && document.activeElement.name === 'boende'));
  // kopiera länk (urklipp saknas i headless -> statusfältet visar URL:en eller "Länk kopierad")
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  await page.click('[data-share="copy"]');
  await page.waitForTimeout(200);
  const status = await page.evaluate(() => document.querySelector('.share__status').textContent);
  ok('kopiera länk ger status', status.length > 0, status);
  ok('inga JS-fel efter interaktion', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ---- GT: batteri + nej solceller -> "Räkna med ROT i stället" -> byter läge ----
{
  const { page, errors } = await open('?m=gt&l=batteri');
  await page.check('input[name="sol"][value="nej"]');
  await page.waitForTimeout(100);
  const h = await headline(page); const p = await primary(page);
  ok('batteri utan sol -> troligen inte', /^Troligen inte/.test(h), h);
  ok('CTA "Räkna med ROT i stället"', p && /ROT i stället/.test(p.text), JSON.stringify(p));
  await page.click('#cta .cta__primary button');
  await page.waitForTimeout(300);
  ok('läge-byte till ROT', await page.evaluate(() => document.getElementById('verktyg').dataset.mode === 'rot'));
  ok('ROT efter byte: rubriken börjar med Ja', /^Ja/.test(await headline(page)), await headline(page));
  ok('inga JS-fel (gt)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ---- GT sol + batteri samtidigt: två segment under ett tak ----
{
  const { page, errors } = await open('?m=gt&l=sol&a2=80000');
  const segs = await page.evaluate(() => ({ sol: document.querySelector('.meter__seg--job').style.cssText, batt: document.querySelector('.meter__seg--job2').style.cssText, tail: document.querySelector('.meter__tail').classList.contains('is-on') }));
  ok('sol + batteri: två segment', /--w: ?0\.45/.test(segs.sol) && /--w: ?0\.55/.test(segs.batt), JSON.stringify(segs));
  ok('sol + batteri: svansen "ryms inte i år" på', segs.tail);
  ok('inga JS-fel (sol)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ---- två ägare: skalan växer till 100 000 ----
{
  const { page } = await open('?m=rot&o=2&a=400000');
  const ticks = await page.evaluate(() => [...document.querySelectorAll('.meter__tick')].map((x) => x.textContent));
  ok('två ägare: tick 100 000 kr', ticks.some((x) => /100/.test(x)), ticks.join(','));
  ok('två ägare: villkorsraden "ni båda har skatt" finns (antaget)', await page.evaluate(() => [...document.querySelectorAll('.villkor__row.is-antaget')].some((r) => /Ni båda/.test(r.textContent))), await headline(page));
  await page.close();
}

// ---- pott slut ----
{
  const { page } = await open('?m=rot&u=50000');
  ok('pott slut -> "Nej, inte i år"', /Nej, inte i år/.test(await headline(page)), await headline(page));
  ok('pott slut -> använt-segmentet fyller hela skalan', await page.evaluate(() => /--w: ?1\.0/.test(document.querySelector('.meter__seg--used').style.cssText)));
  await page.close();
}

// ---- embed: fördjupningen hopfälld, Visa villkoren, ingen sticky ----
{
  const { page } = await open('?m=rot&surface=embed');
  ok('embed: rubriken är H2', await page.evaluate(() => document.getElementById('tool-title').tagName === 'H2'));
  ok('embed: fördjupningen bakom "Räcker skatten?"', await page.evaluate(() => { const d = document.getElementById('fold-djup'); return d && !d.open; }));
  ok('embed: villkoren bakom "Visa villkoren"', await page.evaluate(() => { const d = document.getElementById('fold-villkor'); return d && !d.open; }));
  ok('embed: Skriv ut dold', await page.evaluate(() => document.querySelector('[data-share="print"]').hidden));
  // C-M4: två synliga frågor (boende + belopp); skatt-chippen inne i "Räcker skatten?"; mätaren utan linjal/legend/takrad
  ok('embed (C-M4): bara boende + belopp synliga i reglagen', await page.evaluate(() => [...document.querySelectorAll('#controls > fieldset')].filter((f) => !f.hidden).map((f) => f.dataset.q).join(',') === 'boende,belopp'));
  ok('embed (C-M4): skatt-chippen ligger i "Räcker skatten?"', await page.evaluate(() => !!document.querySelector('#fold-djup #q-skatt')));
  ok('embed (C-M4): linjal, legend och takrad dolda', await page.evaluate(() => ['.meter__ticks', '.meter__legend', '.meter__cap'].every((s) => getComputedStyle(document.querySelector(s)).display === 'none')));
  // villkorsraden för skatt (antaget) öppnar fällraden och flyttar fokus till chippen
  await page.click('#fold-villkor summary');
  await page.click('.villkor__btn[data-fraga="skatt"]');
  await page.waitForTimeout(300);
  ok('embed (C-M4): villkorsraden "skatt" öppnar Räcker skatten? och fokuserar chippen', await page.evaluate(() => document.getElementById('fold-djup').open && document.activeElement && document.activeElement.name === 'skatt'));
  ok('embed: rubrikordning H2 -> H3 (fördjupning) -> H3 (besked)', await page.evaluate(() => { const hs = [...document.querySelectorAll('#verktyg h1, #verktyg h2, #verktyg h3, #verktyg h4')].map((e) => e.tagName); return hs[0] === 'H2' && !hs.includes('H1') && hs.slice(1).every((h) => h !== 'H2'); }));
  await page.check('input[name="boende"][value="brf"]');
  await page.waitForTimeout(100);
  ok('embed: sticky-remsan aldrig', await page.evaluate(() => document.getElementById('sticky').hidden));
  await page.close();
}

await browser.close();
server.close();
console.log('HÖJDER (px):');
for (const [k, v] of Object.entries(heights)) console.log(`  ${k.padEnd(30)} verktyg ${String(v.tool_px).padStart(5)}  (topp ${v.tool_top_px} exkl. demo-remsan, beskedet börjar ${v.besked_top_px}, dokument ${v.doc_px})${v.errors.length ? '  FEL: ' + v.errors.join(' | ') : ''}`);
console.log('TESTER:');
let fails = 0;
for (const r of results) { if (!r.pass) fails++; console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.extra ? `  [${r.extra}]` : ''}`); }
console.log(`${results.length - fails}/${results.length} godkända`);
process.exit(fails ? 1 : 0);
