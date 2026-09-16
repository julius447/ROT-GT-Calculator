/* Verifiering mot Skatteverkets e-tjänst "Räkna ut rot- och rutavdrag" (https://www7.skatteverket.se/portal/rot-rut),
   inkomstår 2026. Kör ett rutnät av fall headless med Playwright, läser tjänstens resultat + "Så här har vi räknat",
   räknar samma fall i logik/engine.js (skatteutrymme) med den kommunalskatt tjänsten själv visar, och sparar allt
   inkrementellt till logik/verifiering-skv-2026.json. Skärmdumpar för utpekade fall till research/underlag/skv-etjanst/.
   Kör: node tools/skv-etjanst-grid.mjs [--only=ID,ID] [--limit=N]     (från repo-roten eller varifrån som helst)
   Rör aldrig engine.js. Tjänsten renderar i shadow DOM; Playwright-locators går igenom den, innerText gör det inte. */
import { chromium } from '../tools/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { skatteutrymme } from '../logik/engine.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const jsonPath = join(root, 'logik', 'verifiering-skv-2026.json');
const shotDir = join(root, 'research', 'underlag', 'skv-etjanst');
const scratchShots = process.env.SKV_SCRATCH || '/private/tmp/claude-501/-Users-juliuscallahan-Desktop-Claude-Code/99d99428-a3f5-43ec-9ad9-e358153dd420/scratchpad/skv/shots';
await mkdir(shotDir, { recursive: true });
await mkdir(scratchShots, { recursive: true });

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));

// --------------------------------------------------------------------------------------------------
// Rutnätet. fodelsear styr 66+-regeln i tjänsten (född <= 1959 = fyllt 66 vid 2026 års ingång).
// fastighetsavgift_underlag = det tjänsten ber om: min(taxeringsvärde, 1 390 000) enligt dess hjälptext.
// --------------------------------------------------------------------------------------------------
const L = [120_000, 180_000, 240_000, 300_000, 360_000, 420_000, 480_000, 600_000, 720_000, 900_000];
const Pn = [150_000, 180_000, 240_000, 300_000, 360_000, 480_000];
const fall = [];
let k = 1;
const add = (o) => fall.push({ id: `SKV-${String(k++).padStart(2, '0')}`, fodelsear: 1985, kommun: 'Stockholm', lon: 0, pension: 0, ranteutgifter: 0, fastighetsavgift_underlag: 0, taxeringsvarde_verkligt: 0, skarmdump: false, ...o });
for (const l of L) add({ lon: l, kommun: 'Stockholm', skarmdump: l === 360_000 });
for (const l of L) add({ lon: l, kommun: 'Dorotea' });
for (const p of Pn) add({ fodelsear: 1955, pension: p, kommun: 'Stockholm', skarmdump: p === 240_000 });
for (const p of Pn) add({ fodelsear: 1955, pension: p, kommun: 'Dorotea' });
// nära snittet 32,38 %: tjänsten tillåter ingen fri sats, Göteborg (32,60 %) används som tredje kommun
for (const l of [180_000, 360_000, 600_000]) add({ lon: l, kommun: 'Göteborg' });
add({ fodelsear: 1955, pension: 240_000, kommun: 'Göteborg' });
// hög sats UTAN regional skattereduktion (Dorotea ligger i glesbygdsområdet och får -1 675 kr): Munkedal
for (const l of [240_000, 480_000]) add({ lon: l, kommun: 'Munkedal' });
add({ fodelsear: 1955, pension: 240_000, kommun: 'Munkedal' });
// ränteutgifter
add({ lon: 360_000, ranteutgifter: 50_000 });
add({ lon: 360_000, ranteutgifter: 100_000 });
add({ lon: 720_000, ranteutgifter: 100_000 });
add({ lon: 240_000, ranteutgifter: 100_000 });                       // ränta större än vad som finns kvar?
add({ fodelsear: 1955, pension: 240_000, ranteutgifter: 50_000 });
// fastighetsavgift (villa 3 000 000 -> underlag 1 390 000, max avgift 10 425)
add({ lon: 360_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000 });
add({ lon: 600_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000 });
add({ fodelsear: 1955, pension: 240_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000 });
add({ lon: 360_000, fastighetsavgift_underlag: 3_000_000, taxeringsvarde_verkligt: 3_000_000, anm: 'råvärde 3 000 000 matat in trots hjälptexten, för att dokumentera att tjänsten inte kapar själv' });
add({ lon: 360_000, fastighetsavgift_underlag: 800_000, taxeringsvarde_verkligt: 800_000 });   // under taket: avgift 6 000
// kombinationer
add({ lon: 480_000, ranteutgifter: 100_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000, skarmdump: true });
add({ fodelsear: 1955, pension: 300_000, ranteutgifter: 50_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000 });
add({ fodelsear: 1955, pension: 300_000, ranteutgifter: 50_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000, kommun: 'Dorotea' });
// blandade inkomster + åldersgränsen
add({ fodelsear: 1955, lon: 200_000, pension: 200_000 });
add({ fodelsear: 1985, lon: 240_000, pension: 60_000 });
add({ fodelsear: 1959, pension: 240_000, anm: 'fyllt 66 vid 2026 års ingång (gränsfall)' });
add({ fodelsear: 1960, pension: 240_000, anm: 'fyller 66 under 2026, ej vid årets ingång (gränsfall)' });
add({ fodelsear: 1955, pension: 100_000 });
add({ fodelsear: 1985, lon: 60_000 });
add({ fodelsear: 1985, lon: 1_200_000 });
// kantfall 66+ med lön: jobbskatteavdrag 8 § (22 % / platå 0,6293 pbb / avtrappning 3 % över 10,48 pbb = 620 416 kr)
add({ fodelsear: 1955, lon: 100_000 });
add({ fodelsear: 1955, lon: 400_000 });
add({ fodelsear: 1955, lon: 900_000, anm: 'över 10,48 pbb: avtrappning av jobbskatteavdraget för 66+ (finns den i motorn?)' });
// dokumentationsfall utanför motorns modell (väntad, förklarad avvikelse)
add({ lon: 360_000, ranteinkomster: 50_000, anm: 'kapitalinkomst 50 000: 30 % statlig skatt på kapital hamnar i poolen; motorn utelämnar (konservativt)' });
add({ fodelsear: 1955, pension: 150_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000, anm: 'pensionärens begränsningsregel (avgift max 4 % av inkomsten): tillämpar tjänsten den?' });
add({ fodelsear: 1955, pension: 60_000 });
// ojämna inkomster: 7 % blir inte jämna hundratal -> testar avrundningen av allmän pensionsavgift (lag 1994:1744 3 §:
// "avrundas till närmast hela hundratal kronor", 50 -> nedåt) och kapningen av öretal (SFF 22:1, IL 67:1)
add({ lon: 348_000, anm: '29 000 kr/mån; 7 % = 24 360 -> lagen 24 400, nedrundning 24 300' });
add({ lon: 378_000, anm: '31 500 kr/mån; 7 % = 26 460 -> lagen 26 500, nedrundning 26 400' });
add({ lon: 124_000, anm: '7 % = 8 680 -> lagen 8 700, nedrundning 8 600' });
add({ lon: 355_000, anm: '7 % = 24 850 slutar på 50 -> lagen 24 800 (nedåt)' });
add({ lon: 352_200, anm: '7 % = 24 654 -> lagen 24 700' });
add({ lon: 333_333, anm: 'ojämn lön: fastställd förvärvsinkomst 333 300' });
add({ fodelsear: 1955, lon: 348_000, anm: '66+ med lön 29 000 kr/mån: pensionsavgift + jobbskatteavdrag 8 §' });
// avräkningsordningen (IL 67:2): jobbskatteavdrag och förvärvsinkomstreduktion bara mot kommunalskatt som är KVAR efter
// pensionsavgiftsreduktionen; syns bara när poolen har fastighetsavgift/statlig skatt och inkomsten är låg
add({ fodelsear: 1955, lon: 348_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000, anm: 'JSA-tak = kommunal - pensionsavgift? väntat SKV 10 425, motorn 8 800' });
add({ fodelsear: 1985, lon: 80_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000, anm: 'låg lön + villa: JSA-taket binder' });
add({ fodelsear: 1985, lon: 40_000, fastighetsavgift_underlag: 1_390_000, taxeringsvarde_verkligt: 3_000_000, anm: 'mycket låg lön + villa: pensionsavgift + JSA äter kommunalskatten, avgiften kvar' });

let valda = fall;
if (args.only) { const ids = new Set(String(args.only).split(',')); valda = fall.filter((f) => ids.has(f.id)); }
if (args.limit) valda = valda.slice(0, Number(args.limit));

// --------------------------------------------------------------------------------------------------
async function lasJson() { try { return JSON.parse(await readFile(jsonPath, 'utf8')); } catch { return { _meta: {}, korningar: [] }; } }
async function sparaKorning(k) {
  const d = await lasJson();
  d.korningar = (d.korningar || []).filter((x) => x.id !== k.id);
  d.korningar.push(k);
  d.korningar.sort((a, b) => a.id.localeCompare(b.id));
  d._meta = { ...d._meta, status: 'pågår', senast_sparad: new Date().toISOString(), korningar_totalt: d.korningar.length };
  await writeFile(jsonPath, JSON.stringify(d, null, 1) + '\n');
}

const tal = (s) => { const m = String(s).replace(/\u00a0/g, ' ').match(/\d[\d ]*/); if (!m) return null; const neg = /^\s*[-\u2212]/.test(String(s).trim()); return (neg ? -1 : 1) * Number(m[0].replace(/[^\d]/g, '')); };

function parseBreakdown(text) {
  // lines between "Så här har vi räknat" and "Mer information": label / value pairs
  const start = text.indexOf('Så här har vi räknat');
  const end = text.indexOf('Mer information', start);
  const lines = text.slice(start, end > 0 ? end : undefined).split('\n').map((s) => s.trim()).filter(Boolean);
  const out = {};
  const raw = [];
  for (let i = 1; i < lines.length; i++) {
    const v = lines[i];
    const isValue = /^([+=\-−]\s*)?[\d][\d ,.]*\s*(kronor|%)$/.test(v) || /^\d{4}$/.test(v);
    if (isValue && i > 0) { const label = lines[i - 1]; out[label] = v; raw.push([label, v]); }
  }
  return { rader: raw, karta: out };
}

async function deepText(page, sel = 'skbskut-rot-rut') {
  return page.locator(sel).evaluate((el) => {
    function walk(n, acc) {
      if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t) acc.push(t); return; }
      if (n.nodeType === 1) { if (['SCRIPT', 'STYLE', 'SVG'].includes(n.tagName)) return; if (n.shadowRoot) walk(n.shadowRoot, acc); }
      else if (n.nodeType !== 11) return;
      for (const c of n.childNodes) walk(c, acc);
    }
    const acc = []; walk(el, acc); return acc.join('\n');
  });
}

async function korFall(browser, f) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 2600 }, locale: 'sv-SE', timezoneId: 'Europe/Stockholm' });
  const page = await ctx.newPage();
  try {
    await page.goto('https://www7.skatteverket.se/portal/rot-rut', { waitUntil: 'load', timeout: 60_000 });
    const year = page.getByLabel(/Vilket år är du född/);
    await year.waitFor({ timeout: 60_000 });
    try { await page.getByRole('button', { name: 'Tillåt endast nödvändiga' }).click({ timeout: 4000 }); } catch { /* ingen kakbanner */ }
    await year.fill(String(f.fodelsear));
    await page.getByRole('combobox', { name: /Kommun där du var folkbokförd/ }).click();
    await page.getByRole('option', { name: f.kommun, exact: true }).click();
    await page.getByText('Rotavdrag', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Nästa' }).first().click();
    await page.getByRole('textbox', { name: /Lön, förmåner m\.m\./ }).waitFor({ state: 'visible', timeout: 10_000 });
    if (f.lon) await page.getByRole('textbox', { name: /Lön, förmåner m\.m\./ }).fill(String(f.lon));
    if (f.pension) await page.getByRole('textbox', { name: /Pensioner m\.m\./ }).fill(String(f.pension));
    if (f.ranteutgifter) await page.getByRole('textbox', { name: /Ränteutgifter m\.m\. och förlust på andelar i räntefond/ }).fill(String(f.ranteutgifter));
    if (f.fastighetsavgift_underlag) await page.getByRole('textbox', { name: /Småhus och ägarlägenhet \(0,75%\)/ }).fill(String(f.fastighetsavgift_underlag));
    if (f.ranteinkomster) await page.getByRole('textbox', { name: /Ränteinkomster, utdelningar, schablonintäkter/ }).fill(String(f.ranteinkomster));
    await page.getByRole('button', { name: 'Uppskatta ditt avdrag' }).click();
    await page.getByText('Preliminär beräkning av din skatt').waitFor({ state: 'visible', timeout: 20_000 });
    const resultat = (await page.locator('p', { hasText: /får högst vara/ }).first().innerText()).replace(/\s+/g, ' ').trim();
    await page.getByRole('button', { name: 'Så här har vi räknat' }).click();
    await page.waitForTimeout(600);
    const text = await deepText(page);
    const bd = parseBreakdown(text);
    const utrymmeRad = bd.karta['Utrymme för rot-och rutavdrag'] ?? bd.karta['Utrymme för rot- och rutavdrag'];
    const skv = {
      resultat_text: resultat,
      rot_max_kr: tal(resultat),
      utrymme_kr: utrymmeRad != null ? tal(utrymmeRad) : null,
      kommunalskatt_pct: bd.karta['Kommunalskatt'] ? Number(bd.karta['Kommunalskatt'].replace('%', '').replace(',', '.').trim()) : null,
      sa_har_har_vi_raknat: bd.rader,
    };
    const shotName = `${f.id}-${f.fodelsear}-${f.kommun}-lon${f.lon}-pen${f.pension}-ranta${f.ranteutgifter}-fa${f.fastighetsavgift_underlag}.png`;
    await page.screenshot({ path: join(scratchShots, shotName), fullPage: true });
    if (f.skarmdump) await page.screenshot({ path: join(shotDir, shotName), fullPage: true });
    return { skv, shot: f.skarmdump ? `research/underlag/skv-etjanst/${shotName}` : null, textfil: text };
  } finally {
    await ctx.close();
  }
}

function modell(f, ksPct) {
  const ar66 = f.fodelsear <= 1959;                   // fyllt 66 vid beskattningsårets ingång 2026
  const r = skatteutrymme({
    lon_ar: f.lon, pension_ar: f.pension, ar_66_plus: ar66, ks: ksPct / 100,
    taxeringsvarde: f.fastighetsavgift_underlag,      // motorn kapar själv vid 10 425
    ranteutgifter: f.ranteutgifter, ovrigt_underskott: 0,
  });
  return { indata: { lon_ar: f.lon, pension_ar: f.pension, ar_66_plus: ar66, ks: ksPct / 100, taxeringsvarde: f.fastighetsavgift_underlag, ranteutgifter: f.ranteutgifter }, ut: r };
}

const browser = await chromium.launch();
let ok = 0, fel = 0;
for (const f of valda) {
  let forsok = 0, res = null, err = null;
  while (forsok < 3 && !res) {
    forsok++;
    try { res = await korFall(browser, f); } catch (e) { err = String(e).split('\n')[0]; console.log(`  ${f.id} försök ${forsok} misslyckades: ${err}`); }
  }
  if (!res) { fel++; await sparaKorning({ id: f.id, indata: f, status: 'FEL', fel: err, tidpunkt: new Date().toISOString() }); continue; }
  const ks = res.skv.kommunalskatt_pct;
  const m = modell(f, ks);
  const diff = res.skv.utrymme_kr != null ? res.skv.utrymme_kr - m.ut.utrymme_rot_rut_gt : null;
  const regional = res.skv.sa_har_har_vi_raknat.find((r) => /boende i vissa områden/.test(r[0]));
  const regionalKr = regional ? Math.abs(tal(regional[1])) : 0;
  const diffEfterRegional = diff != null ? diff + regionalKr : null;   // motorn saknar regional skattereduktion (GRIND 11)
  const k = {
    id: f.id, status: 'OK', tidpunkt: new Date().toISOString(),
    indata: { fodelsear: f.fodelsear, kommun: f.kommun, lon_ar: f.lon, pension_ar: f.pension, ranteutgifter: f.ranteutgifter, ranteinkomster: f.ranteinkomster || 0, fastighetsavgift_underlag: f.fastighetsavgift_underlag, taxeringsvarde_verkligt: f.taxeringsvarde_verkligt, avdrag_valt: 'Rotavdrag', anm: f.anm || null },
    skatteverket: res.skv,
    motorn: { funktion: 'logik/engine.js skatteutrymme()', ks_anvand: ks, indata: m.indata, utrymme_rot_rut_gt: m.ut.utrymme_rot_rut_gt, mellanled: m.ut },
    diff_skv_minus_motorn_kr: diff,
    regional_reduktion_i_tjansten_kr: regionalKr,
    diff_efter_regional_reduktion_kr: diffEfterRegional,
    skarmdump: res.shot,
  };
  await sparaKorning(k);
  ok++;
  console.log(`${f.id} ${f.fodelsear} ${f.kommun} lön ${f.lon} pension ${f.pension} ränta ${f.ranteutgifter} fa ${f.fastighetsavgift_underlag} | ks ${ks} % | SKV ${res.skv.utrymme_kr} | motorn ${m.ut.utrymme_rot_rut_gt} | diff ${diff}${regionalKr ? ' (regional ' + regionalKr + ' -> ' + diffEfterRegional + ')' : ''}`);
}
await browser.close();
console.log(`Klart: ${ok} ok, ${fel} fel. JSON: ${jsonPath}`);
