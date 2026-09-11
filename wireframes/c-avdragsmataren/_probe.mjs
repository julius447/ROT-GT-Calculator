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
  heights[label] = { tool_px: await toolHeight(page), tool_top_px: await toolTop(page), doc_px: await page.evaluate(() => document.documentElement.scrollHeight), errors };
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
  await page.check('input[name="boende"][value="brf"]');
  await page.waitForTimeout(100);
  ok('embed: sticky-remsan aldrig', await page.evaluate(() => document.getElementById('sticky').hidden));
  await page.close();
}

await browser.close();
server.close();
console.log('HÖJDER (px):');
for (const [k, v] of Object.entries(heights)) console.log(`  ${k.padEnd(30)} verktyg ${String(v.tool_px).padStart(5)}  (topp ${v.tool_top_px}, dokument ${v.doc_px})${v.errors.length ? '  FEL: ' + v.errors.join(' | ') : ''}`);
console.log('TESTER:');
let fails = 0;
for (const r of results) { if (!r.pass) fails++; console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.extra ? `  [${r.extra}]` : ''}`); }
console.log(`${results.length - fails}/${results.length} godkända`);
process.exit(fails ? 1 : 0);
