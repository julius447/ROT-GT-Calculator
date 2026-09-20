/* Läser research/underlag/enheter/matris.json (ur enhetsmatris.mjs) och skriver ut:
   1. matristabellen (enhet | sida | överflöde | tryck | klipp | noteringar) som markdown
   2. defekter grupperade per typ med enheter/sidor/tillstånd
   3. sammanfattning per kontroll (Enter, fokus, kolumnbyte, skift, fraser, mörkt läge, täckning)
   Kör: node tools/enhetsmatris-rapport.mjs > /tmp/rapport.md */
import { readFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const j = JSON.parse(await readFile(join(root, 'research/underlag/enheter/matris.json'), 'utf8'));
let svep = null; try { svep = JSON.parse(await readFile(join(root, 'research/underlag/enheter/svep.json'), 'utf8')); } catch {}

const rader = [];
const defekter = {};   /* typ -> [ {enhet, sida, tillstand, detalj} ] */
const lagg = (typ, enhet, sida, tillstand, detalj) => (defekter[typ] ||= []).push({ enhet, sida, tillstand, detalj });
const kort = { 'fristaende-rot': 'fristående rot', 'fristaende-gt': 'fristående gt', 'artikel-topp-rot': 'artikel topp rot', 'artikel-hoger-rot': 'artikel höger rot', 'artikel-topp-gt': 'artikel topp gt', 'artikel-hoger-gt': 'artikel höger gt' };

for (const r of j.resultat) {
  for (const s of r.sidor) {
    if (s.krasch) { rader.push({ enhet: r.namn, sida: kort[s.sida], overflow: 'KRASCH', tryck: '', klipp: '', not: s.krasch.slice(0, 80) }); lagg('krasch', r.namn, s.sida, '', s.krasch.slice(0, 120)); continue; }
    const t0 = s.tillstand[0];
    const overflowKort = s.tillstand.filter((t) => t.overflowX && (t.overflowOrsak || []).some((x) => x.iKort)).map((t) => t.tillstand);
    const overflowVard = s.tillstand.filter((t) => t.overflowX && !(t.overflowOrsak || []).some((x) => x.iKort)).map((t) => t.tillstand);
    const breda = s.tillstand.filter((t) => t.breda.length).map((t) => `${t.tillstand}: ${t.breda.map((b) => `${b.el} +${b.r}`).join(', ')}`);
    const utanfor = s.tillstand.filter((t) => t.utanforVy.length).map((t) => t.tillstand);
    const klipp = s.tillstand.flatMap((t) => t.klipp.map((k) => `${t.tillstand}: ${k.el} (${k.sw}>${k.cw})`));
    const faltKlipp = s.tillstand.flatMap((t) => t.faltKlipp.map((k) => `${t.tillstand}: ${k.id} "${k.v}" ${k.sw}>${k.cw}`));
    const kr = s.tillstand.filter((t) => t.talrad && t.talrad.krEgenRad).map((t) => t.tillstand);
    const prefixRad = s.tillstand.filter((t) => t.talrad && t.talrad.prefixEgenRad).map((t) => `${t.tillstand} (${t.talrad.text})`);
    const talparUt = s.tillstand.filter((t) => t.talrad && t.talrad.talparUtanfor > 1).map((t) => `${t.tillstand} +${t.talrad.talparUtanfor}`);
    const fras = s.tillstand.flatMap((t) => Object.entries(t.fras).flatMap(([k, v]) => v.filter((x) => x.rader > 1 || x.svansEgenRad).map((x) => `${t.tillstand} ${k}: ${x.rader > 1 ? 'bruten över ' + x.rader + ' rader' : ''}${x.svansEgenRad ? ' "-' + x.svans + '" ensamt på ny rad' : ''} [${x.sammanhang}]`)));
    const ihop = s.tillstand.flatMap((t) => t.ihop.filter((x) => x.rects > 1).map((x) => `${t.tillstand}: ${x.text} ${x.rects} rects`));
    const colsFel = s.tillstand.filter((t) => !t.colsRatt).map((t) => `${t.tillstand} (${t.contW} px -> ${t.cols} kol)`);
    const touch = r.touch;
    const coarse = t0.coarse;
    const tryckMin = touch ? Math.min(...s.tillstand.map((t) => Math.min(t.tryck.labelMinH, t.tryck.laggH ?? 99, ...(t.tryck.tabortH.length ? t.tryck.tabortH : [99])))) : null;
    const tryckTxt = touch ? `${coarse ? '' : '(ej coarse) '}min ${tryckMin} px (val ${Math.min(...s.tillstand.map((t) => t.tryck.labelMinH))} / lägg ${Math.min(...s.tillstand.map((t) => t.tryck.laggH ?? 99))} / ta bort ${Math.min(...s.tillstand.flatMap((t) => t.tryck.tabortH.length ? t.tryck.tabortH : [99]))})` : 'fin pekare';
    const inputFs = Math.min(...s.tillstand.map((t) => t.inputFsMin));
    const skift = s.tillstand.filter((t) => t.skift && (Math.abs(t.skift.eyebrow || 0) > 0.5 || Math.abs(t.skift.panelT || 0) > 0.5 || Math.abs(t.skift.cardH || 0) > 0.5)).map((t) => `${t.tillstand}: eyebrow ${t.skift.eyebrow ?? '-'} / panel ${t.skift.panelT ?? '-'} / kort ${t.skift.cardH}`);
    const fasta = s.tackning ? Object.entries(s.tackning).flatMap(([lage, v]) => v.ut.map((u) => `${lage}: ${u.el} ${u.w}×${u.h}`)) : [];
    const fel = s.fel.length ? s.fel.slice(0, 2) : [];
    const enter = s.enter ? (s.enter.url && s.enter.loads === 1 ? 'ok' : `FEL url=${s.enter.url} loads=${s.enter.loads}`) : '-';
    const fokusI = (s.fokus || []).filter((f) => f.iKort);
    const fokusUtan = fokusI.filter((f) => f.outline === 'none' && (f.boxShadow === 'none' || /rgba\(0, 0, 0, 0\)/.test(f.boxShadow)));
    const fokusAltUtan = (s.fokusAlt || []).filter((f) => f.iKort && f.outline === 'none' && (f.boxShadow === 'none' || /rgba\(0, 0, 0, 0\)/.test(f.boxShadow)));
    const lasbar = t0.lasbar; const lasFel = Object.entries(lasbar).filter(([, v]) => v && (v.fs < 14 || v.kontrast < 4.5)).map(([k, v]) => `${k} ${v.fs}px ${v.kontrast}:1`);
    const morkt = r.colorScheme === 'dark' ? `mörkt: body ${t0.farg.body}, kort ${t0.farg.card}, fält ${t0.farg.input}, tal ${t0.kontrastTal}:1` : '';
    const marg = t0.marginaler ? `marg per/fin ${t0.marginaler['#rk-per']}/${t0.marginaler['#rk-fin']}` : '';

    const not = [];
    not.push(`${t0.contW} px -> ${t0.cols} kol${colsFel.length ? ' FEL ' + colsFel.join('; ') : ''}`);
    if (kr.length) not.push(`"kr" ensamt: ${kr.join(', ')}`);
    if (prefixRad.length) not.push(`prefix egen rad: ${prefixRad.join(', ')}`);
    if (talparUt.length) not.push(`tal utanför panel: ${talparUt.join(', ')}`);
    if (fras.length) not.push(`fras: ${fras.join('; ')}`);
    if (ihop.length) not.push(`ihop: ${ihop.join('; ')}`);
    if (skift.length) not.push(`skift: ${skift.join('; ')}`);
    if (fasta.length) not.push(`täcks av: ${[...new Set(fasta)].join('; ')}`);
    if (inputFs < 16) not.push(`fält ${inputFs}px`);
    if (lasFel.length) not.push(`läsbarhet: ${lasFel.join(', ')}`);
    if (enter !== 'ok') not.push(`Enter: ${enter}`);
    if (fokusUtan.length) not.push(`fokus utan ring (Tab): ${[...new Set(fokusUtan.map((f) => f.el))].join(', ')}`);
    if (fokusAltUtan.length) not.push(`fokus utan ring (Alt+Tab): ${[...new Set(fokusAltUtan.map((f) => f.el))].join(', ')}`);
    if (morkt) not.push(morkt);
    if (marg) not.push(marg);
    if (fel.length) not.push(`fel: ${fel.join(' | ')}`);
    if (faltKlipp.length) not.push(`fältklipp: ${faltKlipp.join('; ')}`);
    if (utanfor.length) not.push(`utanför fönstret: ${utanfor.join(', ')}`);

    rader.push({
      enhet: r.namn, motor: r.motor, sida: kort[s.sida],
      overflow: overflowKort.length ? `JA (kortet): ${overflowKort.join(', ')}` : overflowVard.length ? `värdsidan: ${overflowVard.join(', ')}` : breda.length ? `breda: ${breda.join('; ')}` : 'nej',
      tryck: tryckTxt, klipp: klipp.length ? klipp.join('; ') : faltKlipp.length ? 'fält: ' + faltKlipp.join('; ') : 'nej', not: not.join(' · '),
    });
    /* defekter */
    for (const t of overflowKort) lagg('overflow-kort', r.namn, s.sida, t, (s.tillstand.find((x) => x.tillstand === t).overflowOrsak || []).map((x) => `${x.el} +${x.r}`).join(', '));
    for (const t of overflowVard) lagg('overflow-vard', r.namn, s.sida, t, (s.tillstand.find((x) => x.tillstand === t).overflowOrsak || []).map((x) => `${x.el} +${x.r}`).join(', '));
    for (const b of breda) lagg('breda', r.namn, s.sida, b.split(':')[0], b);
    for (const k of klipp) lagg('klipp', r.namn, s.sida, k.split(':')[0], k);
    for (const k of faltKlipp) lagg('faltklipp', r.namn, s.sida, k.split(':')[0], k);
    for (const t of kr) lagg('kr-ensamt', r.namn, s.sida, t, s.tillstand.find((x) => x.tillstand === t).talrad.text);
    for (const t of prefixRad) lagg('prefix-egen-rad', r.namn, s.sida, t, '');
    for (const t of talparUt) lagg('tal-utanfor-panel', r.namn, s.sida, t, '');
    for (const f of fras) lagg('fras-bruten', r.namn, s.sida, f.split(' ')[0], f);
    for (const c of colsFel) lagg('kolumnbyte-fel', r.namn, s.sida, c, '');
    if (touch && coarse && tryckMin < 44) lagg('tryckyta', r.namn, s.sida, '', tryckTxt);
    if (touch && !coarse) lagg('emulering-ej-coarse', r.namn, s.sida, '', 'pointer: coarse matchar inte i emuleringen; 44-reglerna kan inte mätas här');
    if (inputFs < 16) lagg('falt-under-16', r.namn, s.sida, '', `${inputFs}px`);
    for (const x of skift) lagg('skift', r.namn, s.sida, x.split(':')[0], x);
    for (const x of [...new Set(fasta)]) lagg('tackning', r.namn, s.sida, '', x);
    for (const x of lasFel) lagg('lasbarhet', r.namn, s.sida, '', x);
    if (enter !== 'ok') lagg('enter', r.namn, s.sida, '', enter);
    if (fokusUtan.length) lagg('fokus-utan-ring', r.namn, s.sida, '', [...new Set(fokusUtan.map((f) => `${f.el} (${f.border})`))].join(', '));
    if (fokusAltUtan.length) lagg('fokus-utan-ring-alt', r.namn, s.sida, '', [...new Set(fokusAltUtan.map((f) => `${f.el} (${f.border})`))].join(', '));
    if (fel.length) lagg('konsolfel', r.namn, s.sida, '', fel.join(' | '));
    if (t0.marginaler && parseFloat(t0.marginaler['#rk-per']) === 0) lagg('marginal-nollad', r.namn, s.sida, '', `per ${t0.marginaler['#rk-per']} fin ${t0.marginaler['#rk-fin']} under ${t0.marginaler['#rk-under-1']} not ${t0.marginaler['#rk-not']}`);
    if (r.colorScheme === 'dark') lagg('morkt-lage', r.namn, s.sida, '', `${morkt}; vald ${t0.kontrastVald}:1, ovald ${t0.kontrastOvald}:1, etikett ${t0.kontrastEtikett}:1, fält ${t0.kontrastInput}:1, scheme ${t0.farg.scheme}`);
  }
}

const esc = (x) => String(x).replace(/\|/g, '\\|');
console.log('## Matrisen\n');
console.log('| Enhet (motor) | Sida | Överflöde | Tryckytor | Klipp | Noteringar |');
console.log('|---|---|---|---|---|---|');
for (const r of rader) console.log(`| ${esc(r.enhet)} (${r.motor || ''}) | ${esc(r.sida)} | ${esc(r.overflow)} | ${esc(r.tryck)} | ${esc(r.klipp)} | ${esc(r.not)} |`);
console.log('\n## Defekter per typ\n');
for (const [typ, lista] of Object.entries(defekter).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`### ${typ} (${lista.length})`);
  const perDetalj = {};
  for (const d of lista) (perDetalj[d.detalj || d.tillstand] ||= []).push(`${d.enhet}/${d.sida}${d.tillstand ? '/' + d.tillstand : ''}`);
  for (const [detalj, var_] of Object.entries(perDetalj).slice(0, 40)) console.log(`- ${detalj}: ${var_.length} st (${var_.slice(0, 6).join(', ')}${var_.length > 6 ? ' …' : ''})`);
  console.log('');
}
if (svep) {
  console.log('## Svep\n');
  const byte = svep.fristaende.find((x, i) => i && svep.fristaende[i - 1].cols !== x.cols);
  const fore = svep.fristaende.find((x, i) => i && svep.fristaende[i - 1].cols !== x.cols && svep.fristaende[i - 1]);
  console.log('fristående: kolumnbyte vid vw', byte ? `${byte.vw} (behållare ${byte.contW} px -> ${byte.cols} kol; raden före ${svep.fristaende[svep.fristaende.indexOf(byte) - 1].contW} px -> ${svep.fristaende[svep.fristaende.indexOf(byte) - 1].cols} kol)` : 'inget byte i 700-800', '; överflöde i svepet:', svep.fristaende.filter((x) => x.overflow).map((x) => x.vw).join(',') || 'inget');
  console.log('högerspalten (artikel), vw -> behållare / kort / kolumner / segment utanför / klipp / överflöde:');
  for (const x of svep.hoger) console.log(`  ${x.vw}: ${x.contW} / ${x.cardW} / ${x.cols} / ${x.segUtanfor} / ${x.klipp.join('+') || '-'} / ${x.overflow}`);
}
console.log('\nkörning:', j.skapad, 'enheter:', j.resultat.length, 'omdirigerade CSS-URL:er:', j.omdirigeringar.length);
