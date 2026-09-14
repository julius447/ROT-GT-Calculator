/* Tillståndsprob för v3 (utökad i fixrundan). Klickar Nej på ägande, Nej på fem år, skriver 180 000 (lön), byter till
   Pension 240 000, mäter rytmen, och kontrollerar fixrundans krav:
   - Enter i beloppsfältet laddar inte om sidan
   - kontrollerna flyttar 0 px när femårsnoten dyker upp (desktop + mobil)
   - DOM-ordning = visuell ordning för fråga 1 (underraden före kontrollen)
   - mobil med tangentbord (390 x 370): talpanelen helt synlig medan man skriver och efter blur
   - alternativen 44 px höga på touch (spåret 48), spårkanten tryckbar
   - EN mutationsbatch i live-regionen efter "180000"
   - ingen bock någonstans
   - ?m=gt utan femårsfråga
   Skriver PNG per tillstånd till kalkylator/v3/skarmdumpar/ och alla mått till skarmdumpar/_probe-resultat.json.
   Kör: node kalkylator/v3/_probe.mjs */
import { chromium } from '../../tools/node_modules/playwright/index.mjs';
import { createServer } from 'http'; import { readFile, stat, mkdir, writeFile } from 'fs/promises';
import { join, extname, resolve, dirname } from 'path'; import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const ut = join(here, 'skarmdumpar');
await mkdir(ut, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try { let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)); if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
    res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); }
  catch { res.writeHead(404); res.end(); }
});
const port = 8140 + Math.floor(Math.random() * 300);
await new Promise(r => server.listen(port, r));
const b = await chromium.launch();
const out = {};
const rnd = (n) => Math.round(n * 10) / 10;
const url = (m) => `http://localhost:${port}/kalkylator/v3/index.html?m=${m}`;
const NEJ_AGER = 'label:has(input[name="ager"][value="nej"])', JA_AGER = 'label:has(input[name="ager"][value="ja"])';
const NEJ_ALDRE = 'label:has(input[name="aldre"][value="nej"])', JA_ALDRE = 'label:has(input[name="aldre"][value="ja"])';

const lasHero = (page) => page.evaluate(() => {
  const t = (s) => { const el = document.querySelector(s); return el && !el.hidden ? el.textContent.replace(/\s+/g, ' ').trim() : null; };
  return { tal: t('#ak-tal'), stopp: t('#ak-stopp'), not: t('#ak-not'), etikett: t('#ak-etikett'), bock: !!document.querySelector('#ak-bock, .ak__bock') };
});
const lage = (page) => page.evaluate(() => {   // positioner för skift-mätning
  const r = (s) => { const el = document.querySelector(s); return el ? el.getBoundingClientRect() : null; };
  const k1 = r('.ak__fraga:nth-child(1) .ak__kontroll'), k2 = r('.ak__fraga:nth-child(2) .ak__kontroll'), inp = r('#ak-inkomst'), kort = r('.ak__kort'), hero = r('#ak-hero'), tal = r('#ak-siffra');
  return { k1: k1.top, k2: k2 ? k2.top : null, inp: inp.top, kortH: kort.height, heroH: hero.height, tal: tal ? tal.top : null };
});
const matt = (page) => page.evaluate(() => {
  const r = (s) => document.querySelector(s).getBoundingClientRect();
  const q1 = r('#ak-q1'), u1 = r('#ak-under-1'), k1 = r('.ak__fraga:nth-child(1) .ak__kontroll');
  const q2 = r('#ak-q2'), k2 = r('.ak__fraga:nth-child(2) .ak__kontroll'), q3 = r('#ak-q3'), k3 = r('.ak__fraga:nth-child(3) .ak__kontroll');
  const kort = r('.ak__kort'), hero = r('#ak-hero'), ety = r('#ak-etikett'), tal = r('#ak-siffra'), rad = r('#ak-rad'), per = r('.ak__per'), h2 = r('#ak-rubrik');
  const seg = r('.ak__fraga:nth-child(1) .ak__seg'), opt = r('.ak__fraga:nth-child(1) .ak__seg > label'), inp = r('#ak-inkomst'), kr = r('#ak-kr');
  const cs = (s) => getComputedStyle(document.querySelector(s));
  const fs = (s) => cs(s).fontSize, fw = (s) => cs(s).fontWeight;
  const rnd = (n) => Math.round(n * 10) / 10;
  const bred = cs('.ak__fragor').display === 'grid';
  const heroUnder = hero.top > q1.top;
  const q2Synlig = q2.height > 0;
  const svg = document.querySelector('.ak__kryss svg'); const kryssPath = svg ? svg.querySelector('path').getAttribute('d') : null;
  return {
    layout: bred ? 'en rad (tre kolumner)' : (heroUnder ? 'staplat, panelen under frågorna' : 'staplat'),
    kort: { bredd: rnd(kort.width), hojd: rnd(kort.height) },
    h2_till_kort: rnd(kort.top - h2.bottom),
    panel: { hojd: rnd(hero.height), kortkant_till_panel: rnd(heroUnder ? kort.bottom - hero.bottom : hero.top - kort.top), kortkant_till_panel_sida: rnd(hero.left - kort.left), panelkant_till_etikett: rnd(ety.top - hero.top), panelkant_till_text_sida: rnd(ety.left - hero.left), kortkant_till_text: rnd(ety.left - kort.left), etikett_till_tal: rnd(tal.top - ety.bottom), tal_till_rad: rnd(rad.top - tal.bottom), per_till_panelkant: rnd(hero.bottom - per.bottom), rad_reserverad_hojd: rnd(rad.height) },
    panel_till_fraga1: rnd(heroUnder ? hero.top - Math.max(k3.bottom, inp.bottom) : q1.top - hero.bottom),
    kortkant_till_fraga1: rnd(q1.top - kort.top), fraga_vansterkant_lika_etikett: Math.abs(q1.left - ety.left) < 0.6,
    fraga1: { etikett_till_underrad: rnd(u1.top - q1.bottom), underrad_till_kontroll: rnd(k1.top - u1.bottom), underrad_rader: Math.round(u1.height / 24), underrad_bredd: rnd(u1.width) },
    fraga2: q2Synlig ? { etikett_till_kontroll: rnd(k2.top - q2.bottom) } : 'dold (grön teknik)',
    fraga3: { etikett_till_kontroll: rnd(k3.top - q3.bottom) },
    fraga_till_fraga: bred
      ? (q2Synlig ? { kolumngap_1_2: rnd(q2.left - k1.right), kolumngap_2_3: rnd(q3.left - k2.right), underrad_slut_till_kolumn2: rnd(q2.left - u1.right) } : { kolumngap_1_3: rnd(q3.left - k1.right), underrad_slut_till_kolumn3: rnd(q3.left - u1.right) })
      : (q2Synlig ? { f1_till_f2: rnd(q2.top - k1.bottom), f2_till_f3: rnd(q3.top - k2.bottom) } : { f1_till_f3: rnd(q3.top - k1.bottom) }),
    sista_kontroll_till_kortkant: rnd(heroUnder ? hero.top - inp.bottom : kort.bottom - Math.max(k3.bottom, inp.bottom)),
    typografi: { h2: fs('#ak-rubrik') + '/' + fw('#ak-rubrik'), fraga: fs('#ak-q1') + '/' + fw('#ak-q1') + ' ls ' + cs('#ak-q1').letterSpacing, underrad: fs('.ak__under') + '/' + fw('.ak__under'), etikett: fs('#ak-etikett') + '/' + fw('#ak-etikett') + ' ls ' + cs('#ak-etikett').letterSpacing, tal: fs('#ak-siffra') + '/' + fw('#ak-siffra'), prefix: fs('#ak-prefix'), per: fs('.ak__per'), not: fs('.ak__not'), stopp: fs('#ak-stopp') + '/' + fw('#ak-stopp'), segment_ovald: fs('.ak__seg > label:not(:has(input:checked))') + '/' + fw('.ak__seg > label:not(:has(input:checked))'), segment_vald: fw('.ak__seg > label:has(input:checked)'), input: fs('#ak-inkomst') },
    kontroller: { segment_hojd: rnd(seg.height), segment_bredd: rnd(seg.width), option_bredd: rnd(opt.width), option_hojd: rnd(opt.height), input_hojd: rnd(inp.height), input_bredd: rnd(inp.width), kr_gap: rnd(kr.left - (inp.right - parseFloat(cs('#ak-inkomst').paddingRight))), kryss_path: kryssPath, kryss_px: kryssPath === 'M6 6l12 12M18 6L6 18' ? 12 : null },
    bakgrund: { sida: getComputedStyle(document.body).backgroundColor, kort: cs('.ak__kort').backgroundColor, panel: cs('#ak-hero').backgroundColor, panel_radie: cs('#ak-hero').borderRadius },
    svg_antal: document.querySelectorAll('#avdragskollen svg').length,
  };
});

for (const [namn, w, h, mob] of [['desktop', 1440, 1000, false], ['mobil', 390, 844, true]]) {
  const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mob, hasTouch: mob });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url('rot'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const kort = page.locator('#avdragskollen');
  const shot = async (fil) => { await page.waitForTimeout(350); await kort.screenshot({ path: join(ut, `${namn}-${fil}.png`) }); };
  const o = { matt: await matt(page), start: await lasHero(page) };

  await shot('0-start');
  /* Nej på ägande */
  const fore = await lage(page);
  await page.click(NEJ_AGER); await page.waitForTimeout(250); o.agerNej = await lasHero(page); await shot('1-ager-nej');
  const stoppLage = await lage(page);
  o.skiftVidStopp = { kontroll1: rnd(stoppLage.k1 - fore.k1), input: rnd(stoppLage.inp - fore.inp), panelHojd: rnd(stoppLage.heroH - fore.heroH), kortHojd: rnd(stoppLage.kortH - fore.kortH) };
  await page.click(JA_AGER); await page.waitForTimeout(250); o.agerJaIgen = await lasHero(page);
  /* Nej på fem år: kontrollerna ska stå stilla */
  const foreNot = await lage(page);
  await page.click(NEJ_ALDRE); await page.waitForTimeout(250); o.aldreNej = await lasHero(page); await shot('2-aldre-nej');
  const efterNot = await lage(page);
  o.skiftVidFemarsnot = { kontroll1: rnd(efterNot.k1 - foreNot.k1), femarKontroll: rnd(efterNot.k2 - foreNot.k2), input: rnd(efterNot.inp - foreNot.inp), tal: rnd(efterNot.tal - foreNot.tal), panelHojd: rnd(efterNot.heroH - foreNot.heroH), kortHojd: rnd(efterNot.kortH - foreNot.kortH) };
  await page.click(JA_ALDRE); await page.waitForTimeout(250);
  /* Lön 180 000: skrivs tangent för tangent; talet visas 500 ms efter sista tangenten, EN mutationsbatch i live-regionen */
  await page.evaluate(() => { const el = document.querySelector('.ak__live'); window.__batch = 0; window.__mellan = []; new MutationObserver(() => { window.__batch++; }).observe(el, { subtree: true, childList: true, characterData: true, attributes: true }); });
  await page.focus('#ak-inkomst');
  const mellan = [];
  for (const ch of '180000') { await page.keyboard.type(ch); await page.waitForTimeout(80); mellan.push((await lasHero(page)).tal); }
  o.lon180k_medanHonSkriver = mellan;                 // ska vara "upp till 50 000 kr" hela vägen (ingen "ca 0 kr")
  await page.waitForTimeout(700);
  o.lon180k = await lasHero(page); o.faltvarde = await page.inputValue('#ak-inkomst');
  o.liveBatchar = await page.evaluate(() => window.__batch);
  await shot('3-lon-180000');
  /* Enter i fältet: ingen omladdning */
  await page.evaluate(() => { window.__kvar = true; });
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  o.enterIFaltet = { sidanLaddadesOm: !(await page.evaluate(() => window.__kvar === true)), mode: await page.evaluate(() => document.documentElement.dataset.mode), faltvarde: await page.inputValue('#ak-inkomst'), aktivtElement: await page.evaluate(() => document.activeElement.id || document.activeElement.tagName) };
  /* Pension 240 000 (fill = direkt input + change) */
  await page.click('label:has(input[name="typ"][value="pension"])'); await page.fill('#ak-inkomst', '240000'); await page.dispatchEvent('#ak-inkomst', 'change'); await page.waitForTimeout(600); o.pension240k = await lasHero(page); await shot('4-pension-240000');
  await page.click('label:has(input[name="typ"][value="lon"])'); await page.waitForTimeout(250); o.lonIgen240k = await lasHero(page);
  /* Ryms 1 000 000? */
  await page.fill('#ak-inkomst', '1000000'); await page.waitForTimeout(600);
  o.faltMiljon = await page.evaluate(() => { const el = document.querySelector('#ak-inkomst'); return { varde: el.value, klipps: el.scrollWidth > el.clientWidth }; });
  /* DOM-ordning vs visuell ordning för fråga 1 */
  o.ordning = await page.evaluate(() => { const under = document.querySelector('#ak-under-1'), kontroll = document.querySelector('.ak__fraga:nth-child(1) .ak__kontroll'); const domUnderForst = !!(under.compareDocumentPosition(kontroll) & Node.DOCUMENT_POSITION_FOLLOWING); const visuelltUnderForst = under.getBoundingClientRect().top < kontroll.getBoundingClientRect().top; return { domUnderForst, visuelltUnderForst, stammer: domUnderForst === visuelltUnderForst }; });
  /* Tap-yta: spårkanten (2 px in) tryckbar? */
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(200);
  const tap = await page.evaluate(() => { const seg = document.querySelector('.ak__fraga:nth-child(1) .ak__seg'); const nej = seg.querySelector('label:has(input[value="nej"])'); const s = seg.getBoundingClientRect(), n = nej.getBoundingClientRect(); return { sparHojd: Math.round(s.height), labelHojd: Math.round(n.height), x: Math.round(n.left + n.width / 2), yPadding: Math.round(s.top + 2) }; });
  await page.mouse.click(tap.x, tap.yPadding); await page.waitForTimeout(150);
  tap.valtEfterKlickPaSparkant = await page.evaluate(() => document.querySelector('input[name="ager"]:checked').value);
  tap.sparkantTryckbar = tap.valtEfterKlickPaSparkant === 'nej';
  tap.pointerCoarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  o.tap = tap;
  o.overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  o.fel = errs;
  out[namn] = o;
  await page.close();
}

/* Mobil, tangentbordet uppe: synligt fönster 390 x 370. Fältet får fokus: syns talpanelen medan hon skriver, och efter blur? */
{
  const page = await b.newPage({ viewport: { width: 390, height: 370 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(url('rot'), { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  await page.focus('#ak-inkomst');
  await page.evaluate(() => document.querySelector('#ak-inkomst').scrollIntoView({ block: 'nearest' }));   // webbläsarens eget fokusbeteende: fältet precis i bild
  await page.waitForTimeout(900);                                                                          // appens 300 ms + mjuk rullning
  const pos = (s) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; }, s);
  const o = { vh: 370, efterFokus: { falt: await pos('#ak-inkomst'), panel: await pos('#ak-hero') } };
  await page.keyboard.type('180000'); await page.waitForTimeout(700);
  o.medanHonSkriver = { falt: await pos('#ak-inkomst'), panel: await pos('#ak-hero'), tal: (await lasHero(page)).tal };
  o.medanHonSkriver.panelHeltSynlig = o.medanHonSkriver.panel.top >= 0 && o.medanHonSkriver.panel.bottom <= 370;
  o.medanHonSkriver.faltSynligt = o.medanHonSkriver.falt.top >= 0 && o.medanHonSkriver.falt.bottom <= 370;
  await page.screenshot({ path: join(ut, 'mobil-tangentbord-370-skriver.png') });
  await page.evaluate(() => document.querySelector('#ak-inkomst').blur()); await page.waitForTimeout(900);
  o.efterBlur = { panel: await pos('#ak-hero') };
  o.efterBlur.panelHeltSynlig = o.efterBlur.panel.top >= 0 && o.efterBlur.panel.bottom <= 370;
  await page.screenshot({ path: join(ut, 'mobil-tangentbord-370-blur.png') });
  /* Samma sak men fältet rullat till fönstrets nederkant före fokus (värsta fallet, Android "nearest") och blur via Enter/"Klar" */
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(200);
  await page.evaluate(() => { const r = document.querySelector('#ak-inkomst').getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.bottom - innerHeight); });
  await page.waitForTimeout(100);
  o.varstaFallet = { foreFokus: { falt: await pos('#ak-inkomst'), panel: await pos('#ak-hero') } };
  await page.focus('#ak-inkomst'); await page.waitForTimeout(900);
  o.varstaFallet.efterFokus = { falt: await pos('#ak-inkomst'), panel: await pos('#ak-hero') };
  await page.keyboard.type('180000'); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  o.varstaFallet.efterEnter = { panel: await pos('#ak-hero'), tal: (await lasHero(page)).tal, sidanLaddadesOm: null };
  o.varstaFallet.efterEnter.panelHeltSynlig = o.varstaFallet.efterEnter.panel.top >= 0 && o.varstaFallet.efterEnter.panel.bottom <= 370;
  o.varstaFallet.efterEnter.sidanLaddadesOm = (await page.inputValue('#ak-inkomst')) !== '180 000';
  out.mobilTangentbord = o;
  await page.close();
}

/* Mobil 390 x 664 (Safari med fält): vikningen i utgångsläget */
{
  const page = await b.newPage({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(url('rot'), { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  out.mobil664 = await page.evaluate(() => { const b = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; }; const inp = b('#ak-inkomst'), tal = b('#ak-siffra'), kort = b('.ak__kort'); return { sistaKontroll: inp, sistaKontrollHeltSynlig: inp.bottom <= 664, tal, talHeltSynligt: tal.bottom <= 664, kortBottom: kort.bottom }; });
  await page.close();
}

/* Grön teknik: ingen femårsfråga, beskedet säger grön teknik-avdrag (obrutet), ingen reserverad notrad */
for (const [namn, w, h, mob] of [['desktop', 1440, 1000, false], ['mobil', 390, 844, true]]) {
  const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mob, hasTouch: mob });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url('gt'), { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  const o = { start: await lasHero(page), rubrik: await page.textContent('#ak-rubrik'), matt: await matt(page) };
  o.femarsfraga = await page.evaluate(() => { const el = document.querySelector('.ak__fraga--femar'); return { finnsIDom: !!el, synlig: !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0, antalSynligaFragor: [...document.querySelectorAll('.ak__fraga')].filter(e => e.getBoundingClientRect().height > 0 || getComputedStyle(e).display === 'contents').length }; });
  o.gronTeknikObruten = await page.evaluate(() => ({ rubrik: /grön teknik/.test(document.querySelector('#ak-rubrik').textContent), etikett: /grön teknik/.test(document.querySelector('#ak-etikett').textContent) }));
  if (namn === 'desktop') await page.locator('#avdragskollen').screenshot({ path: join(ut, 'desktop-gt-0-start.png') });
  await page.click(NEJ_AGER); await page.waitForTimeout(250); o.agerNej = await lasHero(page);
  o.gronTeknikObruten.stopp = await page.evaluate(() => /grön teknik/.test(document.querySelector('#ak-stopp-text').textContent));
  if (namn === 'desktop') await page.locator('#avdragskollen').screenshot({ path: join(ut, 'desktop-gt-1-ager-nej.png') });
  await page.click(JA_AGER); await page.waitForTimeout(250); o.agerJaIgen = await lasHero(page);
  o.overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  o.fel = errs;
  out['gt_' + namn] = o;
  await page.close();
}

/* Reduced motion: ingen tick-animation, ingen mjuk rullning */
{
  const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await page.goto(url('rot'), { waitUntil: 'networkidle' }); await page.waitForTimeout(200);
  await page.click(NEJ_AGER); await page.waitForTimeout(50);
  out.reducedMotion = await page.evaluate(() => ({ tickKlass: document.querySelector('#ak-stopp').classList.contains('is-tick'), animation: getComputedStyle(document.querySelector('#ak-stopp')).animationName }));
  await page.close();
}

await b.close(); server.close();
/* Sammanfattning mot kraven */
const d = out.desktop, m = out.mobil;
out.krav = {
  ingaFel: d.fel.length === 0 && m.fel.length === 0 && out.gt_desktop.fel.length === 0 && out.gt_mobil.fel.length === 0,
  ingenOverflowX: !d.overflowX && !m.overflowX && !out.gt_desktop.overflowX && !out.gt_mobil.overflowX,
  kortDesktopMax460: d.matt.kort.hojd <= 460, kortMobilMax640: m.matt.kort.hojd <= 640,
  ingenOmladdningVidEnter: !d.enterIFaltet.sidanLaddadesOm && !out.mobilTangentbord.varstaFallet.efterEnter.sidanLaddadesOm,
  kontrollerStillaVidFemarsnot: [d.skiftVidFemarsnot, m.skiftVidFemarsnot].every(s => s.kontroll1 === 0 && s.femarKontroll === 0 && s.input === 0),
  panelHojdKonstantDesktop: d.skiftVidFemarsnot.panelHojd === 0 && d.skiftVidStopp.panelHojd === 0,
  domOrdningStammer: d.ordning.stammer && m.ordning.stammer,
  panelSynligMedTangentbord: out.mobilTangentbord.medanHonSkriver.panelHeltSynlig && out.mobilTangentbord.efterBlur.panelHeltSynlig && out.mobilTangentbord.varstaFallet.efterEnter.panelHeltSynlig,
  labelHojd44Mobil: m.tap.labelHojd === 44 && m.tap.sparHojd === 48 && m.tap.sparkantTryckbar,
  enLiveBatch: d.liveBatchar === 1 && m.liveBatchar === 1,
  ingenCa0MedanHonSkriver: [...d.lon180k_medanHonSkriver, ...m.lon180k_medanHonSkriver].every(t => t === 'upp till 50 000 kr'),
  ingenBock: !d.start.bock && !m.start.bock && !d.lon180k.bock && d.matt.svg_antal === 1 && m.matt.svg_antal === 1,
  gtUtanFemarsfraga: !out.gt_desktop.femarsfraga.synlig && !out.gt_mobil.femarsfraga.synlig,
  gronTeknikObruten: Object.values(out.gt_desktop.gronTeknikObruten).every(Boolean) && Object.values(out.gt_mobil.gronTeknikObruten).every(Boolean),
  underradEnRadDesktop: d.matt.fraga1.underrad_rader === 1,
  faltRymmerMiljon: !d.faltMiljon.klipps && !m.faltMiljon.klipps,
};
out.krav.alla = Object.values(out.krav).every(Boolean);
await writeFile(join(ut, '_probe-resultat.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
