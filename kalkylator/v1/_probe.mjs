/* Tillståndsprob för v1 "Två spalter". Serverar repo-roten, renderar 1440 (fin pekare) + 390 (touch, pointer:
   coarse), mäter rytm/typografi/kontroller, klickar igenom tillstånden, kör fixrundans kontroller (Enter i
   fältet, skift i stoppläget, tryckyta, live-regionen, femårsfrågan i gt, spårbredd vid viktbyte) och sparar
   PNG + probe.json i kalkylator/v1/skarmdumpar/.
   Kör: node kalkylator/v1/_probe.mjs   (från repo-roten eller varifrån som helst). Avslutar med kod 1 om ett krav faller. */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http';
import { readFile, stat, mkdir, writeFile } from 'fs/promises';
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
const port = 8131 + Math.floor(Math.random() * 300);
await new Promise((r) => server.listen(port, r));
const url = (q = '?m=rot') => `http://localhost:${port}/kalkylator/v1/index.html${q}`;

const browser = await chromium.launch();
const out = { desktop: {}, mobile: {} };
const krav = [];                                    /* [namn, ok, värde] */
const kontrollera = (namn, ok, varde) => krav.push({ krav: namn, ok: !!ok, varde });

const lab = (name, value) => `label:has(input[name="${name}"][value="${value}"])`;

async function matt(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const qa = (s) => [...document.querySelectorAll(s)];
    const b = (el) => el.getBoundingClientRect();
    const fs = (el) => getComputedStyle(el).fontSize;
    const fw = (el) => getComputedStyle(el).fontWeight;
    const lh = (el) => getComputedStyle(el).lineHeight;
    const synlig = (el) => !!el && el.getClientRects().length > 0;
    const round = (n) => Math.round(n * 10) / 10;
    const kort = q('#avdragskollen');
    const h2 = q('#rk-rubrik');
    const fragor = qa('.rk__fraga').filter(synlig);
    const etiketter = fragor.map((f) => f.querySelector('.rk__etikett'));
    const seg = fragor.map((f) => f.querySelector('.rk__segment')).filter(Boolean);   /* använt-raden har inget segment */
    const segOpt = qa('.rk__segment > label').filter(synlig);
    const under = q('.rk__under');
    const input = q('#rk-inkomst-1');
    const panel = q('.rk__panel');
    const eyebrow = q('#rk-eyebrow');
    const huvud = q('.rk__huvud');
    const tal = q('#rk-tal');
    const prefix = q('#rk-prefix');
    const enhet = q('#rk-talenhet');
    const per = q('#rk-per');
    const talrad = q('#rk-talrad');
    const stopp = q('#rk-stopp');
    const stopptext = q('#rk-stopptext');
    const not = q('#rk-not');
    const res = q('#rk-resultat');
    const spalt = q('.rk-spalt');
    const sista = [...fragor].reverse().find((f) => f.querySelector('.rk__segment'));   /* sista frågan med segment (inkomsten) */
    const typSeg = q('[data-q="typ"]');
    const r = (el) => ({ top: round(b(el).top + scrollY), h: round(b(el).height), w: round(b(el).width) });
    return {
      status: res.dataset.status,
      kortHojd: round(b(kort).height), kortBredd: round(b(kort).width), spaltBredd: round(b(spalt).width),
      fragorBredd: round(b(q('.rk__fragor')).width), panelBredd: round(b(panel).width),
      antalFragorSynliga: fragor.length, femarSynlig: synlig(q('.rk__fraga--aldre')),
      avstand: {
        h2_till_kort: round(b(kort).top - b(h2).bottom),
        kortkant_till_fraga1: round(b(etiketter[0]).top - b(kort).top),
        fraga1_till_underrad: round(b(under).top - b(etiketter[0]).bottom),
        underrad_till_kontroll: round(b(seg[0]).top - b(under).bottom),
        kontroll_till_nasta_fraga: fragor.length > 1 ? round(b(etiketter[1]).top - b(seg[0]).bottom) : null,
        fraga2_till_kontroll: fragor.length > 2 ? round(b(seg[1]).top - b(etiketter[1]).bottom) : null,
        sista_fraga_till_kontroll: round(b(sista.querySelector('.rk__segment')).top - b(sista.querySelector('.rk__etikett')).bottom),
        sista_kontroll_till_kortkant: round(b(kort).bottom - Math.max(b(sista.querySelector('.rk__segment')).bottom, b(input).bottom)),
        eyebrow_till_tal: synlig(talrad) ? round(b(talrad).top - b(eyebrow).bottom) : null,
        eyebrow_till_stopp: synlig(stopp) ? round(b(stopp).top - b(eyebrow).bottom) : null,
        tal_till_per: synlig(per) ? round(b(per).top - b(talrad).bottom) : null,
        panel_topp_till_innehall: round(b(res).top - b(panel).top),
        innehall_till_panel_botten: round(b(panel).bottom - b(res).bottom),
      },
      typografi: {
        h2: `${fs(h2)} / ${fw(h2)} / lh ${lh(h2)}`,
        fraga: `${fs(etiketter[0])} / ${fw(etiketter[0])} / lh ${lh(etiketter[0])}`,
        underrad: `${fs(under)} / ${fw(under)}`,
        eyebrow: `${fs(eyebrow)} / ${fw(eyebrow)} / ls ${getComputedStyle(eyebrow).letterSpacing}`,
        prefix: fs(prefix), enhet: fs(enhet), tal: `${fs(tal)} / ${fw(tal)} / ${getComputedStyle(tal).fontVariantNumeric}`,
        per: `${fs(per)} / ${fw(per)}`, not: `${fs(not)} / ${fw(not)}`,
        stopptext: `${fs(stopptext)} / ${fw(stopptext)} / lh ${lh(stopptext)}`,
        segment: `${fs(segOpt[0])} / vald ${fw(segOpt[0])} / ovald ${fw(segOpt[1])}`,
        input: `${fs(input)} / ${fw(input)}`,
      },
      px: { prefix: parseFloat(fs(prefix)), enhet: parseFloat(fs(enhet)), tal: parseFloat(fs(tal)), stopptext: parseFloat(fs(stopptext)), not: parseFloat(fs(not)) },
      kontroller: {
        segmentSpar: seg.map((s) => `${round(b(s).width)} x ${round(b(s).height)}`),
        alternativ: segOpt.map((o) => `${o.textContent.trim()} ${round(b(o).width)} x ${round(b(o).height)}`),
        sparHojd: round(b(seg[0]).height), labelHojd: round(b(segOpt[0]).height), typSparBredd: round(b(typSeg).width),
        input: `${round(b(input).width)} x ${round(b(input).height)}`,
        pointerCoarse: matchMedia('(pointer: coarse)').matches,
      },
      lage: {
        eyebrow: r(eyebrow), huvud: r(huvud), talrad: synlig(talrad) ? r(talrad) : null, stopp: synlig(stopp) ? r(stopp) : null,
        stoppMinH: parseFloat(getComputedStyle(stopp).minHeight) || null, stopptextH: synlig(stopptext) ? round(b(stopptext).height) : null,
        forstaKontroll: r(segOpt[0]), input: r(input), kort: r(kort), panel: r(panel), not: synlig(not) ? r(not) : null,
      },
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
}

async function bild(page, namn) {
  /* klipper från rubriken till kortets nederkant, så H2:ns förhållande till kortet syns */
  const box = await page.evaluate(() => {
    const h = document.querySelector('#rk-rubrik').getBoundingClientRect(), k = document.querySelector('#avdragskollen').getBoundingClientRect();
    return { x: k.x, y: h.y + scrollY, w: k.width, h: k.bottom - h.y };
  });
  const m = 24;
  await page.screenshot({ path: join(ut, `${namn}.png`), fullPage: true, clip: { x: Math.max(0, box.x - m), y: Math.max(0, box.y - m), width: box.w + 2 * m, height: box.h + 2 * m } });
  /* Playwright-artefakt: en fullPage-skärmdump av en sida som är högre än viewporten släpper (pointer: coarse) i
     mobilemuleringen efteråt (uppmätt 2026-09-14: 44 -> 40 px alternativ). Återställs via CDP på touch-sidor. */
  if (page.viewportSize().width < 768) {
    page._cdp ||= await page.context().newCDPSession(page);   /* sessionen hålls öppen: detach() nollar överstyrningen */
    const { width, height } = page.viewportSize();
    await page._cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: true });
    await page._cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await page._cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'pointer', value: 'coarse' }, { name: 'hover', value: 'none' }] });
    await page.waitForTimeout(100);
  }
}

async function las(page) {
  return page.evaluate(() => {
    const t = (s) => { const el = document.querySelector(s); return el && el.getClientRects().length ? el.textContent.replace(/\s+/g, ' ').trim() : null; };
    return { status: document.querySelector('#rk-resultat').dataset.status, prefix: t('#rk-prefix'), tal: t('#rk-tal'), enhet: t('#rk-talenhet'), per: t('#rk-per'), not: t('#rk-not'), stopp: t('#rk-stopptext') };
  });
}

const skift = (a, b, nyckel) => ({ dy: Math.round((b.lage[nyckel].top - a.lage[nyckel].top) * 10) / 10, dh: Math.round((b.lage[nyckel].h - a.lage[nyckel].h) * 10) / 10 });

for (const [namn, w, h, touch] of [['desktop', 1440, 1000, false], ['mobile', 390, 844, true]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const oppna = async (q) => { await page.goto(url(q), { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300); };
  await oppna('?m=rot');
  const o = out[namn];
  const start = await matt(page);
  o.rot = { ...start, besked: await las(page) };
  await bild(page, `${namn}-1-utgangslage`);
  kontrollera(`${namn}: pointer coarse = ${touch}`, start.kontroller.pointerCoarse === touch, start.kontroller.pointerCoarse);
  kontrollera(`${namn}: kort <= ${touch ? 1200 : 820} (rot: sex rader + länk + ägarrad)`, start.kortHojd <= (touch ? 1200 : 820), start.kortHojd);
  kontrollera(`${namn}: ingen horisontell scroll`, !start.overflowX, start.overflowX);
  kontrollera(`${namn}: prefix = enhet = halva talet`, start.px.prefix === start.px.enhet && Math.abs(start.px.prefix - start.px.tal / 2) < 0.6, `${start.px.prefix} / ${start.px.enhet} / tal ${start.px.tal}`);
  if (!touch) kontrollera('desktop: prefix och enhet 28 px vid 1440', start.px.prefix === 28 && start.px.enhet === 28, `${start.px.prefix} / ${start.px.enhet}`);
  if (touch) kontrollera('mobil: talet 52 px', start.px.tal === 52, start.px.tal);
  kontrollera(`${namn}: femårsraden 16 px`, start.px.not === 16, start.px.not);
  kontrollera(`${namn}: stoppbeskedet 18 px`, start.px.stopptext === 18, start.px.stopptext);
  kontrollera(`${namn}: spåret 48 hög`, start.kontroller.sparHojd === 48, start.kontroller.sparHojd);
  kontrollera(`${namn}: alternativet ${touch ? 44 : 40} px`, start.kontroller.labelHojd === (touch ? 44 : 40), start.kontroller.labelHojd);
  kontrollera(`${namn}: femårsfrågan visas i rot`, start.femarSynlig, start.femarSynlig);

  /* 1. Nej på ägande: talet bort, X + besked; etikett/huvud/kontroller/kort står stilla. Ja igen: talet tillbaka. */
  await page.click(lab('ager', 'nej'));
  await page.waitForTimeout(350);
  const agerNej = await matt(page);
  o.agerNej = { besked: await las(page), kortHojd: agerNej.kortHojd, stoppMinH: agerNej.lage.stoppMinH, stoppH: agerNej.lage.stopp?.h, stopptextH: agerNej.lage.stopptextH,
    skift: { eyebrow: skift(start, agerNej, 'eyebrow'), huvud: skift(start, agerNej, 'huvud'), forstaKontroll: skift(start, agerNej, 'forstaKontroll'), input: skift(start, agerNej, 'input'), kort: skift(start, agerNej, 'kort'), panel: skift(start, agerNej, 'panel') },
    talradTopp: start.lage.talrad?.top, stoppTopp: agerNej.lage.stopp?.top };
  await bild(page, `${namn}-2-ager-nej`);
  kontrollera(`${namn}: etiketten står stilla i stoppläget`, o.agerNej.skift.eyebrow.dy === 0, o.agerNej.skift.eyebrow.dy);
  kontrollera(`${namn}: talblocket (huvud) byter varken plats eller höjd i stoppläget`, o.agerNej.skift.huvud.dy === 0 && o.agerNej.skift.huvud.dh === 0, o.agerNej.skift.huvud);
  kontrollera(`${namn}: stoppblocket börjar där talraden börjar`, o.agerNej.talradTopp === o.agerNej.stoppTopp, `${o.agerNej.talradTopp} / ${o.agerNej.stoppTopp}`);
  kontrollera(`${namn}: kortet byter inte höjd i stoppläget`, o.agerNej.skift.kort.dh === 0, o.agerNej.skift.kort.dh);
  kontrollera(`${namn}: stopptexten ryms i talblockets höjd`, o.agerNej.stopptextH <= o.agerNej.stoppMinH, `${o.agerNej.stopptextH} <= ${o.agerNej.stoppMinH}`);
  kontrollera(`${namn}: stoppbeskedet exakt`, o.agerNej.besked.stopp === 'Eftersom du inte äger din bostad har du inte rätt till ROT-avdrag.' && o.agerNej.besked.tal === null, o.agerNej.besked.stopp);
  await page.click(lab('ager', 'ja'));
  await page.waitForTimeout(350);
  const agerJa = await matt(page);
  o.agerJaIgen = { besked: await las(page), skiftTal: skift(start, agerJa, 'talrad'), skiftEyebrow: skift(start, agerJa, 'eyebrow') };
  kontrollera(`${namn}: Ja igen ger talet tillbaka på samma plats`, o.agerJaIgen.besked.tal === '50 000' && o.agerJaIgen.besked.prefix === 'upp till' && o.agerJaIgen.skiftTal.dy === 0, o.agerJaIgen);

  /* 2. Nej på fem år: raden under talet, talet står stilla */
  await page.click(lab('aldre', 'nej'));
  await page.waitForTimeout(350);
  const aldreNej = await matt(page);
  o.aldreNej = { besked: await las(page), kortHojd: aldreNej.kortHojd, kortDh: Math.round((aldreNej.kortHojd - start.kortHojd) * 10) / 10, skiftTal: skift(start, aldreNej, 'talrad'), skiftEyebrow: skift(start, aldreNej, 'eyebrow'), skiftForstaKontroll: skift(start, aldreNej, 'forstaKontroll'), skiftInput: skift(start, aldreNej, 'input') };
  await bild(page, `${namn}-3-femar-nej`);
  kontrollera(`${namn}: femårsraden exakt, talet står stilla`, o.aldreNej.besked.not === 'Yngre än fem år: ROT gäller bara reparationer.' && o.aldreNej.skiftTal.dy === 0 && o.aldreNej.skiftForstaKontroll.dy === 0, o.aldreNej.besked.not);
  if (!touch) kontrollera('desktop: kortet växer inte med femårsraden', o.aldreNej.kortDh === 0, o.aldreNej.kortDh);
  await page.click(lab('aldre', 'ja'));

  /* 3. Inkomst 180 000 (lön): live-regionen muterar EN gång, efter fördröjningen, aldrig "ca 0" */
  await page.evaluate(() => {
    const el = document.querySelector('#rk-talrad');
    window.__live = [];
    new MutationObserver(() => window.__live.push({ t: Math.round(performance.now()), text: el.textContent.replace(/\s+/g, ' ').trim() })).observe(el, { subtree: true, childList: true, characterData: true });
    window.__t0 = Math.round(performance.now());
  });
  await page.focus('#rk-inkomst-1');
  for (const ch of '180000') { await page.keyboard.type(ch); await page.waitForTimeout(80); }
  const underSkrivning = await page.evaluate(() => window.__live.length);
  const textUnderSkrivning = await las(page);
  await page.waitForTimeout(700);
  const live = await page.evaluate(() => ({ batchar: window.__live, t0: window.__t0 }));
  o.lon180k = { besked: await las(page), falt: await page.inputValue('#rk-inkomst-1'), kortHojd: (await matt(page)).kortHojd, live: { mutationerUnderSkrivning: underSkrivning, talUnderSkrivning: textUnderSkrivning.tal, batcharTotalt: live.batchar.length, texter: live.batchar.map((b) => b.text) } };
  await bild(page, `${namn}-4-lon-180000`);
  kontrollera(`${namn}: 180 000 ger "ca 12 000 kr"`, o.lon180k.besked.prefix === 'ca' && o.lon180k.besked.tal === '12 000' && o.lon180k.falt === '180 000', `${o.lon180k.besked.prefix} ${o.lon180k.besked.tal} kr, fält "${o.lon180k.falt}"`);
  kontrollera(`${namn}: ingen mutation i live-regionen medan hon skriver (talet står kvar på 50 000)`, underSkrivning === 0 && textUnderSkrivning.tal === '50 000', `${underSkrivning} mutationer, tal "${textUnderSkrivning.tal}"`);
  kontrollera(`${namn}: exakt EN live-mutation efter fördröjningen, aldrig "ca 0"`, live.batchar.length === 1 && live.batchar[0].text === 'ca 12 000 kr', live.batchar);

  /* 4. Pension 240 000 */
  await page.click(lab('alder-1', '66+'));   /* pension 66+: förhöjt grundavdrag; åldern frågas sedan 2026-09-16 */
  await page.click(lab('typ-1', 'pension'));
  await page.fill('#rk-inkomst-1', '240000');
  await page.waitForTimeout(700);
  const pension = await matt(page);
  o.pension240k = { besked: await las(page), falt: await page.inputValue('#rk-inkomst-1'), kortHojd: pension.kortHojd, typSparBredd: pension.kontroller.typSparBredd, typSparBreddLon: start.kontroller.typSparBredd };
  await bild(page, `${namn}-5-pension-240000`);
  kontrollera(`${namn}: pension 240 000 ger "ca 38 000 kr"`, o.pension240k.besked.prefix === 'ca' && o.pension240k.besked.tal === '38 000', `${o.pension240k.besked.prefix} ${o.pension240k.besked.tal}`);
  kontrollera(`${namn}: Lön/Pension-spåret byter inte bredd när vikten byter (600 på vald)`, o.pension240k.typSparBredd === o.pension240k.typSparBreddLon, `${o.pension240k.typSparBreddLon} -> ${o.pension240k.typSparBredd}`);

  /* tillbaka till lön + 600 000 (taket) och tom; blur ger direkt rendering */
  await page.click(lab('alder-1', '18-65'));
  await page.click(lab('typ-1', 'lon'));
  await page.fill('#rk-inkomst-1', '600000');
  await page.waitForTimeout(700);
  o.lon600k = await las(page);
  kontrollera(`${namn}: 600 000 ger "50 000 kr" utan prefix`, o.lon600k.tal === '50 000' && o.lon600k.prefix === null, o.lon600k);
  await page.fill('#rk-inkomst-1', '');
  await page.dispatchEvent('#rk-inkomst-1', 'blur');
  await page.waitForTimeout(50);
  o.tomIgen = await las(page);
  kontrollera(`${namn}: blur renderar direkt: tomt fält ger "upp till 50 000 kr"`, o.tomIgen.prefix === 'upp till' && o.tomIgen.tal === '50 000', o.tomIgen);

  /* 5. Enter / "Klar" i fältet: ingen omladdning, beloppet kvar, läget kvar */
  await page.click('#rk-inkomst-1');
  await page.keyboard.type('180000');
  const urlFore = page.url();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const enter = { urlFore, urlEfter: page.url(), faltVardeEfter: await page.inputValue('#rk-inkomst-1'), aktivtElement: await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName), besked: await las(page) };
  enter.sidanLaddadesOm = enter.urlFore !== enter.urlEfter;
  o.enter = enter;
  kontrollera(`${namn}: Enter i fältet laddar inte om sidan`, !enter.sidanLaddadesOm && enter.faltVardeEfter === '180 000' && enter.besked.tal === '12 000', enter);
  await page.fill('#rk-inkomst-1', '');
  await page.dispatchEvent('#rk-inkomst-1', 'blur');

  /* 6. Tryckyta (mobil): tryck i spårets överkant ovanför "Nej" */
  if (touch) {
    const tap = await page.evaluate(() => {
      const seg = document.querySelector('[data-q="ager"]'), nej = seg.querySelector('label:has(input[value="nej"])');
      const s = seg.getBoundingClientRect(), n = nej.getBoundingClientRect();
      return { sparHojd: Math.round(s.height), labelHojd: Math.round(n.height), sparPadding: Math.round(n.top - s.top), x: Math.round(n.left + n.width / 2), y2: Math.round(s.top + 2), y1: Math.round(s.top + 1) };
    });
    await page.touchscreen.tap(tap.x, tap.y2); await page.waitForTimeout(150);
    tap.valtEfterTryck2pxIn = await page.evaluate(() => document.querySelector('input[name="ager"]:checked').value);
    await page.click(lab('ager', 'ja')); await page.waitForTimeout(100);
    await page.touchscreen.tap(tap.x, tap.y1); await page.waitForTimeout(150);
    tap.valtEfterTryck1pxIn = await page.evaluate(() => document.querySelector('input[name="ager"]:checked').value);
    await page.click(lab('ager', 'ja')); await page.waitForTimeout(100);
    o.tap = tap;
    kontrollera('mobil: alternativet 44 px i 48 px-spåret (2 px kant)', tap.labelHojd === 44 && tap.sparHojd === 48 && tap.sparPadding === 2, tap);
    kontrollera('mobil: tryck 2 px in i spåret träffar alternativet', tap.valtEfterTryck2pxIn === 'nej', tap.valtEfterTryck2pxIn);
  }

  /* 7. Tangentbord: fokusring på ett alternativ, pil höger byter */
  await page.focus('input[name="ager"][value="ja"]');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  o.tangentbord = await las(page);
  await bild(page, `${namn}-8-tangentbordsfokus`);
  kontrollera(`${namn}: pil höger i segmentet ger stoppläget`, o.tangentbord.status === 'stopp', o.tangentbord.status);
  await page.keyboard.press('ArrowLeft');

  /* 8. gt-läget: strängarna, ingen femårsfråga, kortet, Enter */
  await oppna('?m=gt');
  const g = await matt(page);
  o.gt = { kortHojd: g.kortHojd, antalFragorSynliga: g.antalFragorSynliga, femarSynlig: g.femarSynlig, h2: await page.textContent('#rk-rubrik'), h2Ihop: await page.evaluate(() => getComputedStyle(document.querySelector('#rk-rubrik .rk__ihop')).whiteSpace), eyebrow: await page.textContent('#rk-eyebrow'), besked: await las(page), overflowX: g.overflowX, avstand: g.avstand };
  await bild(page, `${namn}-6-gt-utgangslage`);
  kontrollera(`${namn}: gt visar varken femårsfrågan eller ROT/RUT-fältet (fem rader: äger, ålder, inkomst, ränta, grön teknik använt)`, !g.femarSynlig && g.antalFragorSynliga === 5, `${g.antalFragorSynliga} frågor, femår synlig ${g.femarSynlig}`);
  kontrollera(`${namn}: gt-kort <= ${touch ? 1200 : 820}`, g.kortHojd <= (touch ? 1200 : 820), g.kortHojd);
  kontrollera(`${namn}: gt-rubriken exakt, "grön teknik-avdrag" i nowrap-span`, o.gt.h2 === 'Räkna ut ditt grön teknik-avdrag' && o.gt.h2Ihop === 'nowrap', `${o.gt.h2} / ${o.gt.h2Ihop}`);
  kontrollera(`${namn}: gt-etiketten exakt`, o.gt.eyebrow.replace(/\s/g, ' ') === 'Ditt tillgängliga grön teknik-avdrag', o.gt.eyebrow);
  await page.click(lab('ager', 'nej'));
  await page.waitForTimeout(350);
  const gtNej = await matt(page);
  o.gtAgerNej = { besked: await las(page), skiftEyebrow: skift(g, gtNej, 'eyebrow'), skiftKort: skift(g, gtNej, 'kort'), stopptextH: gtNej.lage.stopptextH, stoppMinH: gtNej.lage.stoppMinH, ihop: await page.evaluate(() => getComputedStyle(document.querySelector('#rk-stopptext .rk__ihop')).whiteSpace) };
  await bild(page, `${namn}-7-gt-ager-nej`);
  kontrollera(`${namn}: gt-stoppbeskedet exakt, ihop, ingenting hoppar`, o.gtAgerNej.besked.stopp === 'Eftersom du inte äger din bostad har du inte rätt till grön teknik-avdrag.' && o.gtAgerNej.ihop === 'nowrap' && o.gtAgerNej.skiftEyebrow.dy === 0 && o.gtAgerNej.skiftKort.dh === 0 && o.gtAgerNej.stopptextH <= o.gtAgerNej.stoppMinH, o.gtAgerNej);
  await page.click(lab('ager', 'ja'));
  await page.click('#rk-inkomst-1');
  await page.keyboard.type('180000');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  o.gtEnter = { modeEfter: await page.evaluate(() => new URLSearchParams(location.search).get('m')), falt: await page.inputValue('#rk-inkomst-1'), besked: await las(page) };
  kontrollera(`${namn}: Enter i gt behåller läget och beloppet`, o.gtEnter.modeEfter === 'gt' && o.gtEnter.falt === '180 000' && o.gtEnter.besked.tal === '12 000', o.gtEnter);

  /* 9. Hushållet (ägarbeslut 2026-09-14): 18 år, redan använt, fler personer */
  await oppna('?m=rot');
  const h0 = await matt(page);
  await page.click(lab('alder-1', 'u18')); await page.waitForTimeout(350);
  const h18 = await matt(page);
  o.arton = { besked: await las(page), skiftEyebrow: skift(h0, h18, 'eyebrow'), skiftKort: skift(h0, h18, 'kort') };
  await bild(page, `${namn}-9-arton-nej`);
  kontrollera(`${namn}: Under 18 ger stoppbeskedet, ingenting hoppar`, o.arton.besked.status === 'stopp' && o.arton.besked.stopp === 'Du behöver ha fyllt 18 år senast vid årets slut för att få ROT-avdrag.' && o.arton.skiftEyebrow.dy === 0 && o.arton.skiftKort.dh === 0, o.arton);
  await page.click(lab('alder-1', '18-65')); await page.waitForTimeout(350);
  kontrollera(`${namn}: 18 till 65 ger talet tillbaka`, (await las(page)).tal === '50 000', await las(page));

  await page.fill('#rk-anvant-1', '20000'); await page.dispatchEvent('#rk-anvant-1', 'blur'); await page.waitForTimeout(200);
  o.anvant20 = await las(page);
  kontrollera(`${namn}: 20 000 använt utan inkomst ger "upp till 30 000 kr"`, o.anvant20.prefix === 'upp till' && o.anvant20.tal === '30 000', o.anvant20);
  await page.fill('#rk-inkomst-1', '180000'); await page.fill('#rk-anvant-1', '5000'); await page.dispatchEvent('#rk-anvant-1', 'blur'); await page.waitForTimeout(200);
  o.anvant5 = await las(page);
  kontrollera(`${namn}: 180 000 i lön och 5 000 använt ger "ca 7 000 kr"`, o.anvant5.prefix === 'ca' && o.anvant5.tal === '7 000', o.anvant5);
  await page.fill('#rk-anvant-1', '50000'); await page.dispatchEvent('#rk-anvant-1', 'blur'); await page.waitForTimeout(200);
  o.anvantAllt = await las(page);
  await bild(page, `${namn}-10-allt-anvant`);
  kontrollera(`${namn}: 50 000 använt ger "0 kr" + raden om årets tak + kvarskattevarning`, o.anvantAllt.tal === '0' && o.anvantAllt.prefix === null && o.anvantAllt.not.startsWith('Du har redan använt hela årets ROT-avdrag. Du har dessutom använt ca 38 000 kr mer än skatten räcker till.'), o.anvantAllt);
  await page.click('#rk-anvant-1'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  kontrollera(`${namn}: Enter i använt-fältet laddar inte om`, page.url().endsWith('?m=rot') && (await las(page)).tal === '0', page.url());
  await page.fill('#rk-anvant-1', ''); await page.fill('#rk-inkomst-1', '600000'); await page.dispatchEvent('#rk-inkomst-1', 'blur'); await page.waitForTimeout(200);

  await page.click('#rk-lagg'); await page.waitForTimeout(200);
  const p2 = await page.evaluate(() => {
    const b = document.querySelectorAll('.rk__person');
    const r = (el) => el.getBoundingClientRect();
    const bort = document.querySelector('.rk__tabort');
    return { antal: b.length, dataAntal: document.querySelector('#rk-personer').dataset.antal, etiketter: [...document.querySelectorAll('.rk__personetikett')].map((e) => e.textContent), huvudSynligt: r(document.querySelector('.rk__personhuvud')).height > 0, fokus: document.activeElement.id, inkomstEtikett2: b[1].querySelector('legend').textContent, anvantEtikett2: b[1].querySelector('label[for^="rk-anvant-"]').textContent, taBortHojd: Math.round(r(bort).height), eyebrow: document.querySelector('#rk-eyebrow').textContent };
  });
  o.person2 = p2;
  kontrollera(`${namn}: Lägg till en person ger Person 1/Person 2, fokus i nya inkomstfältet`, p2.antal === 2 && p2.dataAntal === '2' && p2.etiketter.join('|') === 'Person 1|Person 2' && p2.huvudSynligt && p2.fokus === 'rk-inkomst-2' && p2.inkomstEtikett2 === 'Inkomst förra året' && p2.anvantEtikett2 === 'ROT och RUT använt i år' && p2.eyebrow === 'Ert tillgängliga ROT-avdrag', p2);
  if (touch) kontrollera('mobil: Ta bort har 44 px träffyta', p2.taBortHojd >= 44, p2.taBortHojd);
  await page.click(lab('alder-2', '66+')); await page.click(lab('typ-2', 'pension')); await page.fill('#rk-inkomst-2', '240000'); await page.dispatchEvent('#rk-inkomst-2', 'blur'); await page.waitForTimeout(200);
  o.tvaPersoner = await las(page);
  await bild(page, `${namn}-11-tva-personer`);
  kontrollera(`${namn}: 600 000 lön + 240 000 pension ger "ca 88 000 kr", "Ni två tillsammans, per år."`, o.tvaPersoner.prefix === 'ca' && o.tvaPersoner.tal === '88 000' && o.tvaPersoner.per === 'Ni två tillsammans, per år.', o.tvaPersoner);
  await page.click('#rk-lagg'); await page.click('#rk-lagg'); await page.waitForTimeout(200);
  o.fyra = await page.evaluate(() => ({ antal: document.querySelectorAll('.rk__person').length, laggSynlig: document.querySelector('#rk-lagg').getClientRects().length > 0, per: document.querySelector('#rk-per').textContent }));
  kontrollera(`${namn}: fyra personer: länken försvinner, "Ni fyra tillsammans, per år."`, o.fyra.antal === 4 && !o.fyra.laggSynlig && o.fyra.per === 'Ni fyra tillsammans, per år.', o.fyra);
  await page.click('.rk__person[data-person="3"] .rk__tabort'); await page.waitForTimeout(200);
  o.taBort = await page.evaluate(() => ({ etiketter: [...document.querySelectorAll('.rk__personetikett')].map((e) => e.textContent), laggSynlig: document.querySelector('#rk-lagg').getClientRects().length > 0, per: document.querySelector('#rk-per').textContent, fokus: document.activeElement.id }));
  kontrollera(`${namn}: Ta bort person 3 numrerar om (1, 2, 3), länken tillbaka, fokus på länken`, o.taBort.etiketter.join('|') === 'Person 1|Person 2|Person 3' && o.taBort.laggSynlig && o.taBort.per === 'Ni tre tillsammans, per år.' && o.taBort.fokus === 'rk-lagg', o.taBort);
  await page.click('.rk__person[data-person="3"] .rk__tabort'); await page.click('.rk__person[data-person="2"] .rk__tabort'); await page.waitForTimeout(200);
  o.enIgen = { ...(await las(page)), huvudSynligt: await page.evaluate(() => document.querySelector('.rk__personhuvud').getClientRects().length > 0), eyebrow: await page.textContent('#rk-eyebrow') };
  kontrollera(`${namn}: tillbaka till en person: "Ditt", "Per person och år.", inget personhuvud`, o.enIgen.eyebrow === 'Ditt tillgängliga ROT-avdrag' && o.enIgen.per === 'Per person och år.' && !o.enIgen.huvudSynligt && o.enIgen.tal === '50 000', o.enIgen);

  await oppna('?m=gt');
  o.gtAnvant = await page.evaluate(() => [...document.querySelectorAll('label[for^="rk-gtanvant-"]')].filter((e) => e.getClientRects().length).map((e) => e.textContent));
  await page.click('#rk-lagg'); await page.waitForTimeout(200);
  o.gtAnvant2 = await page.evaluate(() => [...document.querySelectorAll('label[for^="rk-gtanvant-"]')].filter((e) => e.getClientRects().length).map((e) => e.textContent));
  kontrollera(`${namn}: gt: grön teknik-fälten "Grön teknik du redan använt i år" / "Grön teknik använt i år" synliga (dolda i rot)`, o.gtAnvant.join('|') === 'Grön teknik du redan använt i år' && o.gtAnvant2.join('|') === 'Grön teknik du redan använt i år|Grön teknik använt i år', o.gtAnvant2);

  o.errors = errors;
  kontrollera(`${namn}: inga konsolfel`, errors.length === 0, errors);
  await page.close();
}

await browser.close();
server.close();

out.krav = krav;
await writeFile(join(ut, 'probe.json'), JSON.stringify(out, null, 1));
const fel = krav.filter((k) => !k.ok);
for (const k of krav) console.log(`${k.ok ? 'OK ' : 'FEL'}  ${k.krav}  ->  ${typeof k.varde === 'object' ? JSON.stringify(k.varde) : k.varde}`);
console.log(`\n${krav.length - fel.length}/${krav.length} krav OK. Mått: desktop kort ${out.desktop.rot.kortHojd} (gt ${out.desktop.gt.kortHojd}), mobil kort ${out.mobile.rot.kortHojd} (gt ${out.mobile.gt.kortHojd}). probe.json + PNG i ${ut}`);
process.exit(fel.length ? 1 : 0);
