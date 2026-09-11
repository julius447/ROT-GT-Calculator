#!/usr/bin/env node
/**
 * test.mjs  (Node >= 18)   usage: node logik/test.mjs
 *
 * (a) skatteutrymme: the 4 Skatteverket e-service runs (2026-09-11) + 6 rows of the E4 lookup table
 * (b) all ROT cases in rot-testfall.json  (field by field; flaggor as sets)
 * (c) all GT cases in gt-testfall.json    (every expected key; flaggor as sets)
 * (d) ui-model scenarios (classes, headline grammar, amount states, tax band, share-link codec)
 * (e) COPY hygiene (no em/en dashes, no "·", at most one "!" per string) + every referenced key exists
 *
 * Prints PASS/FAIL per group and exits non-zero on any failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { skatteutrymme, beraknaRot, beraknaGt, PARAMS_2026 } from './engine.js';
import {
  COPY, BANKS, evaluate, resolveTexts, encodeState, decodeState, defaultState, effectiveState, toEngineInput,
  resolveBank, formatKr, round100, t,
} from './ui-model.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));

let totalFail = 0;
const groups = [];
function group(name) {
  const g = { name, pass: 0, fail: 0, notes: [] };
  groups.push(g);
  return {
    ok(cond, label, detail) {
      if (cond) g.pass += 1;
      else { g.fail += 1; totalFail += 1; g.notes.push(`  FAIL ${label}${detail !== undefined ? `: ${detail}` : ''}`); }
    },
    eq(actual, expected, label) {
      const same = JSON.stringify(actual) === JSON.stringify(expected);
      this.ok(same, label, same ? undefined : `got ${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`);
    },
    near(actual, expected, tol, label) {
      const d = Math.abs(actual - expected);
      this.ok(d <= tol, label, d <= tol ? undefined : `got ${actual} expected ${expected} (tol ${tol})`);
    },
  };
}
const sortedSet = (arr) => [...new Set(arr)].sort();

// ---------------------------------------------------------------------------------------------------
// (a) skatteutrymme
// ---------------------------------------------------------------------------------------------------
{
  const g = group('a) skatteutrymme: 4 Skatteverket runs (±1 kr) + 6 E4 rows');
  const skv = [
    ['SKV-KAL-01 lön 360 000, Stockholm 30,55 %', { lon_ar: 360_000, ks: 0.3055 }, 37_594],
    ['SKV-KAL-02 pension 240 000, 66+, Stockholm', { pension_ar: 240_000, ar_66_plus: true, ks: 0.3055 }, 35_702],
    ['SKV-KAL-03 lön 720 000, ränta 60 000, fastighetsavgift (capped)', { lon_ar: 720_000, ks: 0.3055, ranteutgifter: 60_000, taxeringsvarde: 1_390_000 }, 140_535 - 30_000 + 10_425],
    ['SKV-KAL-04 lön 180 000, Göteborg 32,60 %', { lon_ar: 180_000, ks: 0.3260 }, 11_881],
  ];
  for (const [label, inp, exp] of skv) g.near(skatteutrymme(inp).utrymme_rot_rut_gt, exp, 1, label);
  // E4 table (01-rot-regelverk §E4): [månadsbrutto, löntagare utan, löntagare villa, pensionär utan, pensionär villa]
  const e4 = [
    [15_000, 11_711, 22_136, 24_276, 34_701],
    [20_000, 21_042, 31_467, 37_876, 48_301],
    [30_000, 41_445, 51_870, 66_501, 76_926],
    [45_000, 77_528, 87_953, 115_359, 125_784],
    [60_000, 138_432, 148_857, 185_559, 195_984],
    [80_000, 264_144, 274_569, 311_202, 321_627],
  ];
  for (const [man, a, b, c, d] of e4) {
    const ar = man * 12;
    g.near(skatteutrymme({ lon_ar: ar }).utrymme_rot_rut_gt, a, 1, `E4 ${man} löntagare utan villa`);
    g.near(skatteutrymme({ lon_ar: ar, taxeringsvarde: 1_390_000 }).utrymme_rot_rut_gt, b, 1, `E4 ${man} löntagare villa`);
    g.near(skatteutrymme({ pension_ar: ar, ar_66_plus: true }).utrymme_rot_rut_gt, c, 1, `E4 ${man} pensionär utan villa`);
    g.near(skatteutrymme({ pension_ar: ar, ar_66_plus: true, taxeringsvarde: 1_390_000 }).utrymme_rot_rut_gt, d, 1, `E4 ${man} pensionär villa`);
  }
  g.eq(PARAMS_2026.TAX_YEAR, 2026, 'TAX_YEAR');
}

// ---------------------------------------------------------------------------------------------------
// (b) ROT cases
// ---------------------------------------------------------------------------------------------------
{
  const doc = readJson('rot-testfall.json');
  const g = group(`b) ROT: ${doc.testfall.length} cases from rot-testfall.json`);
  for (const c of doc.testfall) {
    const r = beraknaRot(c.input);
    const e = c.expected;
    const diffs = [];
    for (const k of ['verdict', 'avdrag_kr', 'att_betala_kr', 'skatt_racker', 'avdrag_brutto_kr', 'aterbetalningsrisk_kr']) {
      if (r[k] !== e[k]) diffs.push(`${k}=${r[k]} (exp ${e[k]})`);
    }
    if (JSON.stringify(r.fordelning_kr) !== JSON.stringify(e.fordelning_kr)) diffs.push(`fordelning_kr=${JSON.stringify(r.fordelning_kr)} (exp ${JSON.stringify(e.fordelning_kr)})`);
    if (JSON.stringify(r.skatt) !== JSON.stringify(e.skatt_per_agare)) diffs.push(`skatt_per_agare=${JSON.stringify(r.skatt)} (exp ${JSON.stringify(e.skatt_per_agare)})`);
    if (JSON.stringify(sortedSet(r.flaggor)) !== JSON.stringify(sortedSet(e.flaggor))) diffs.push(`flaggor=${r.flaggor} (exp ${e.flaggor})`);
    g.ok(diffs.length === 0, c.id, diffs.join('; '));
  }
}

// ---------------------------------------------------------------------------------------------------
// (c) GT cases
// ---------------------------------------------------------------------------------------------------
{
  const doc = readJson('gt-testfall.json');
  const cases = doc.filter((x) => x.id);
  const g = group(`c) GT: ${cases.length} cases from gt-testfall.json`);
  for (const c of cases) {
    const r = beraknaGt(c.input);
    const e = c.expected;
    const diffs = [];
    for (const k of Object.keys(e)) {
      if (k === 'flaggor') { if (JSON.stringify(sortedSet(r.flaggor)) !== JSON.stringify(sortedSet(e.flaggor))) diffs.push(`flaggor=${r.flaggor} (exp ${e.flaggor})`); }
      else if (r[k] !== e[k]) diffs.push(`${k}=${r[k]} (exp ${e[k]})`);
    }
    g.ok(diffs.length === 0, c.id, diffs.join('; '));
  }
}

// ---------------------------------------------------------------------------------------------------
// (d) ui-model scenarios
// ---------------------------------------------------------------------------------------------------
{
  const g = group('d) ui-model scenarios');
  const ALL_ROT = ['boende', 'vardear', 'belopp', 'skatt'];

  // 1. load defaults ROT -> ja_villkor "Ja, om det här stämmer:" with 3 antagna, intervall amount, offert CTA
  {
    const r = evaluate('rot', {}, []);
    g.eq(r.klass, 'ja_villkor', '1 load ROT class');
    g.eq(r.headline.key, 'h.ja_om_stammer', '1 load ROT headline');
    g.eq(r.counts.antagna, 3, '1 load ROT antagna = 3');
    g.eq(r.villkor.filter((v) => v.status === 'antaget').map((v) => v.id), ['boende', 'vardear', 'skatt'], '1 load ROT antagna rows');
    g.eq(r.belopp.state, 'intervall', '1 load ROT belopp intervall');
    g.ok(r.belopp.avdrag_min_kr < r.belopp.avdrag_kr && r.belopp.avdrag_kr < r.belopp.avdrag_max_kr, '1 load ROT min < mid < max', JSON.stringify([r.belopp.avdrag_min_kr, r.belopp.avdrag_kr, r.belopp.avdrag_max_kr]));
    g.eq(r.belopp.avdrag_kr, 5400, '1 load ROT mid avdrag = 30 % of 60 % of 30 000');
    g.eq(r.cta.primary.kind, 'offert', '1 load ROT CTA offert');
    g.eq(r.skatt.status, 'ej_bedomd', '1 load ROT skatt ej_bedomd');
    g.ok(r.villkor.some((v) => v.status === 'skoter_vi'), '1 load ROT has "det sköter vi" row');
  }
  // 2. all visible gates touched -> ja "Ja, du kan använda ROT-avdraget"
  {
    const r = evaluate('rot', {}, ALL_ROT);
    g.eq(r.klass, 'ja', '2 all touched -> ja');
    g.eq(r.headline.key, 'h.rot.ja', '2 all touched headline');
    g.eq(r.counts.antagna, 0, '2 all touched antagna = 0');
    g.eq(r.nasta_steg[0].key, 's.ja.1', '2 all touched step 1');
  }
  // 3. hyra -> nej, no CTA, amount hidden, no tax block
  {
    const r = evaluate('rot', { boende: 'hyra' }, ['boende']);
    g.eq(r.klass, 'nej', '3 hyra class'); g.eq(r.subtyp, 'hyra', '3 hyra subtyp');
    g.eq(r.cta.primary.kind, 'none', '3 hyra no primary CTA');
    g.eq(r.belopp.state, 'dold', '3 hyra belopp dold');
    g.eq(r.skatt.status, 'ej_relevant', '3 hyra skatt ej_relevant');
    const rg = evaluate('gt', { boende: 'hyra' }, ['boende']);
    g.eq([rg.klass, rg.subtyp, rg.cta.primary.kind, rg.belopp.state], ['nej', 'hyra', 'none', 'dold'], '3 GT hyra');
  }
  // 4. batteri + no sol -> troligen_inte with alt_rot and lage_byte CTA
  {
    const r = evaluate('gt', { lage: 'batteri', sol: 'nej', arbete_kr: 20_000 }, ['lage', 'boende', 'sol', 'skatt']);
    g.eq([r.klass, r.subtyp], ['troligen_inte', 'batteri_utan_sol'], '4 batteri utan sol class');
    g.eq(r.belopp.state, 'alt_rot', '4 alt_rot state');
    g.eq(r.belopp.rot_avdrag_kr, 6000, '4 alt_rot = 30 % of 20 000');
    g.eq(r.cta.primary.kind, 'lage_byte', '4 CTA lage_byte');
    g.eq(r.cta.primary.byte.mode, 'rot', '4 lage_byte target rot');
    const r2 = evaluate('gt', { lage: 'batteri', sol: 'nej' }, ['sol']);
    g.eq(r2.belopp.rot_avdrag_kr, null, '4 alt_rot without arbete_kr shows no number');
  }
  // 5. two "vet inte" -> osaker with tel CTA and tak amount
  {
    const r = evaluate('rot', { vardear: 'vet_inte', skatt: 'vet' }, ALL_ROT);
    g.eq(r.klass, 'osaker', '5 two vet inte -> osaker');
    g.eq(r.counts.okanda, 2, '5 okanda = 2');
    g.eq(r.cta.primary.kind, 'tel', '5 CTA tel');
    g.eq(r.headline.key, 'h.osaker', '5 headline names two things');
    g.eq(r.belopp.state, 'tak', '5 belopp tak');
    // one "vet inte" -> ja_villkor "Ja, om <villkor>", never a plain ja
    const r1 = evaluate('rot', { vardear: 'vet_inte' }, ALL_ROT);
    g.eq([r1.klass, r1.headline.key], ['ja_villkor', 'h.ja_om'], '5b one vet inte -> Ja, om');
    g.ok(r1.villkor.find((v) => v.id === 'vardear').status === 'okand', '5b vet inte row is okand, never ok');
    // vet inte + reparation: repair gives ROT at any age (B6)
    const r3 = evaluate('rot', { vardear: 'vet_inte', arbetstyp: 'reparation' }, [...ALL_ROT, 'arbetstyp']);
    g.eq(r3.klass, 'ja', '5c vet inte + reparation -> ja (repair at any age)');
  }
  // 6. laddbox in BRF, gemensamt garage -> nej + Ladda bilen
  {
    const r = evaluate('gt', { boende: 'brf', pplats: 'gemensamt' }, ['boende', 'pplats']);
    g.eq([r.klass, r.subtyp], ['nej', 'brf_gemensamt'], '6 brf gemensamt -> nej');
    g.ok(r.flaggor.includes('ladda_bilen_foreningen'), '6 ladda_bilen flag');
    g.eq(r.cta.primary.labelKey, 'cta.ladda_bilen', '6 CTA Ladda bilen link');
    g.eq(r.cta.primary.solid, false, '6 no solid button on nej');
    const ru = evaluate('gt', { boende: 'brf' }, ['boende']);
    g.eq(ru.cta.primary.kind, 'tel', '6b brf laddbox with p-plats unknown -> tel CTA (föreningen)');
    const rf = evaluate('gt', { boende: 'brf', pplats: 'foljer_bostadsratten' }, ['boende', 'pplats', 'skatt']);
    g.eq([rf.klass, rf.cta.primary.kind], ['ja_villkor', 'offert'], '6c p-plats följer bostadsrätten -> ja_villkor + offert');
  }
  // 7. skatt lag + deep-dive 15 000 kr/mån (lön, villa): utrymme 22 136 < 30 000 -> ryms_delvis, begransad_skatt
  //    (the engine's ryms_inte requires utrymme = 0, i.e. income below ~8 000 kr/mån: checked with 5 000)
  {
    const r = evaluate('rot', { skatt: 'lag', skatt_djup: true, manadsinkomst: 15_000, belopp: 100_000, arbete_kr: 100_000 }, ALL_ROT);
    g.eq(r.skatt.status, 'ryms_delvis', '7 lag + 15 000/mån -> ryms_delvis');
    g.eq(r.skatt.utrymme_kr, 22_136, '7 utrymme 22 136 (E4 villa row)');
    g.eq([r.klass, r.headline.key], ['ja_villkor', 'h.ja_men'], '7 class Ja, men');
    g.eq(r.belopp.state, 'begransad_skatt', '7 belopp begransad_skatt');
    g.eq(r.belopp.skatt_tacker_kr, 22_136, '7 skatt täcker');
    g.eq(r.belopp.aterbetalningsrisk_kr, 30_000 - 22_136, '7 risk');
    g.ok(r.skatt.utrymme_min_kr < r.skatt.utrymme_kr && r.skatt.utrymme_kr < r.skatt.utrymme_max_kr, '7 tax band 29–35 % brackets the 32,38 % value', JSON.stringify([r.skatt.utrymme_min_kr, r.skatt.utrymme_kr, r.skatt.utrymme_max_kr]));
    // utrymme = 0 needs no property fee in the pool as well (villa t2011 carries 10 425 kr): use a bostadsrätt
    const r0 = evaluate('rot', { boende: 'brf', skatt: 'lag', skatt_djup: true, manadsinkomst: 5_000, belopp: 100_000, arbete_kr: 100_000 }, ALL_ROT);
    g.eq(r0.skatt.utrymme_kr, 0, '7b lag + 5 000/mån in brf -> utrymme 0');
    g.eq([r0.skatt.status, r0.klass, r0.subtyp, r0.belopp.state], ['ryms_inte', 'troligen_inte', 'skatt_lag', 'dold'], '7b lag + 5 000/mån -> ryms_inte, troligen_inte, hidden amount');
    const rl = evaluate('rot', { skatt: 'lag' }, ALL_ROT);
    g.eq([rl.skatt.status, rl.klass, rl.cta.primary.kind, rl.cta.primary.solid], ['ryms_inte', 'troligen_inte', 'skatteverket', false], '7c lag without deep-dive -> troligen_inte, Skatteverket text link');
  }
  // 8. pensionär 30 000 kr/mån -> ryms
  {
    const r = evaluate('rot', { boende: 'brf', skatt: 'pension', skatt_djup: true, manadsinkomst: 30_000 }, ['boende', 'skatt', 'plats']);
    g.eq(r.skatt.status, 'ryms', '8 pensionär 30 000 -> ryms');
    g.eq(r.skatt.utrymme_kr, 66_501, '8 utrymme 66 501 (E4 pensionär utan villa)');
    g.eq(toEngineInput('rot', { skatt: 'pension', skatt_djup: true }).agare[0].fyllt_66_vid_arets_ingang, true, '8 pension chip auto-sets 66+');
    const rg = evaluate('gt', { skatt: 'pension', skatt_djup: true, manadsinkomst: 30_000 }, ['boende', 'skatt']);
    g.eq(rg.skatt.status, 'ryms', '8b GT pensionär 30 000 -> ryms');
  }
  // 9. link codec round-trip (values survive, income never encoded)
  {
    const st = { boende: 'brf', belopp: 42_000, arbete_kr: 28_000, skatt: 'pension', agare: 2, anvant_rot: 10_000, anvant_rut: 5_000 };
    const enc = encodeState('rot', st, { src: 'salj' });
    const dec = decodeState('?' + enc);
    g.eq(dec.mode, 'rot', '9 round-trip mode');
    g.eq(dec.src, 'salj', '9 round-trip src');
    for (const k of Object.keys(st)) g.eq(dec.state[k], st[k], `9 round-trip ${k}`);
    g.eq(JSON.stringify(evaluate('rot', dec.state, [])), JSON.stringify(evaluate('rot', st, [])), '9 decoded state evaluates identically');
    g.eq(evaluate('rot', dec.state, []).counts.antagna > 0, true, '9 link-prefilled answers stay antaget');
    const gst = { lage: 'batteri', sol: 'nej', belopp: 90_000, skatt: 'vet', anvant_gt: 20_000 };
    const gdec = decodeState(encodeState('gt', gst));
    for (const k of Object.keys(gst)) g.eq(gdec.state[k], gst[k], `9 GT round-trip ${k}`);
    g.eq(decodeState('m=rot&y=nej&yy=2022').state.vardear, '2021_2025', '9 legacy y=nej&yy=2022 -> 2021_2025');
    g.eq(decodeState('m=rot&y=nej&yy=2020').state.vardear, '2012_2020', '9 legacy y=nej&yy=2020 -> 2012_2020');
    g.eq(decodeState('m=rot&y=ja').state.vardear, 't2011', '9 legacy y=ja -> t2011');
    g.eq(decodeState('m=gt&l=batteri&p=nej').state.sol, 'nej', '9 legacy p=nej -> sol nej');
  }
  // 10. invalid params ignored silently
  {
    const d = decodeState('m=rot&b=slott&s=hacker&a=abc&y=1999&o=7&u=-5&xyz=1&ak=99999999');
    g.eq(d.mode, 'rot', '10 valid mode kept');
    g.eq(Object.keys(d.state).length, 0, '10 every invalid value ignored');
    g.eq(decodeState('m=banan&b=villa').mode, null, '10 invalid mode -> null, nothing prefilled');
    g.eq(decodeState('').mode, null, '10 empty string');
    g.eq(decodeState('m=rot&p=nej').state.sol, undefined, '10 GT-only param ignored in rot');
  }
  // 11. income / tax never in encodeState
  {
    const st = { skatt: 'lag', skatt_djup: true, manadsinkomst: 99_000, ranteutgifter_ar: 150_000, kommunalskatt: 35, gt_planerad_kr: 40_000, inkomsttyp: 'bada', lon_manad: 50_000, pension_manad: 20_000, fyllt66: true, manadsinkomst_2: 77_000 };
    const enc = encodeState('rot', st);
    for (const bad of ['99000', '150000', '35', '40000', '50000', '20000', '77000', 'djup', 'inkomst', 'rante', 'kommunal', 'fyllt']) g.ok(!enc.includes(bad), `11 "${bad}" not in link`, enc);
    g.eq(enc, 'm=rot&s=lag', '11 only the tax segment chip is encoded');
    const encGt = encodeState('gt', { ...st, lage: 'laddbox' });
    g.eq(encGt, 'm=gt&l=laddbox&s=lag', '11 GT same');
    const href = evaluate('rot', st, []).cta.primary.href || '';
    for (const bad of ['99000', '150000', 'manads', 'skatt']) g.ok(!href.includes(bad), `11 offert href has no "${bad}"`, href);
  }
  // 12. ROT cap with anvant 40 000 -> begransad_pott "Ja, men bara 10 000 kr kvar i år"
  {
    const r = evaluate('rot', { belopp: 100_000, arbete_kr: 100_000, anvant_rot: 40_000 }, ALL_ROT);
    g.eq(r.belopp.state, 'begransad_pott', '12 begransad_pott');
    g.eq(r.belopp.avdrag_kr, 10_000, '12 avdrag 10 000');
    g.eq(r.belopp.pott_kvar_kr, 10_000, '12 pott kvar 10 000');
    g.eq([r.klass, r.subtyp, r.headline.key], ['ja_villkor', 'pott', 'h.ja_men'], '12 class Ja, men');
    g.eq(r.belopp.state, 'begransad_pott', '12 amount state');
    const rs = evaluate('rot', { anvant_rot: 50_000, anvant_rut: 30_000 }, ALL_ROT);
    g.eq([rs.klass, rs.subtyp, rs.belopp.state], ['nej', 'inte_i_ar', 'noll'], '12b pott slut -> Nej, inte i år, 0 kr');
    g.eq(rs.cta.primary.solid, false, '12b no solid button');
  }
  // 13. hard nej beats everything (under 18 + two vet inte)
  {
    const r = evaluate('rot', { under18: true, vardear: 'vet_inte', skatt: 'vet' }, []);
    g.eq([r.klass, r.subtyp], ['nej', 'under18'], '13 hard nej beats osaker');
    g.eq(r.cta.primary.kind, 'none', '13 under 18: no CTA');
    g.eq(r.nasta_steg.length, 0, '13 under 18: no next steps');
    const rg = evaluate('gt', { under18: true, lage: 'batteri', sol: 'vet_inte' }, []);
    g.eq([rg.klass, rg.subtyp], ['nej', 'under18'], '13 GT hard nej beats osaker');
  }
  // 14. femårsregeln: värdeår 2021-2025 + ombyggnad -> troligen_inte; + reparation -> ja_villkor; 2026 -> nej inte_an
  {
    const a = evaluate('rot', { vardear: '2021_2025', arbetstyp: 'ombyggnad' }, [...ALL_ROT, 'arbetstyp']);
    g.eq([a.klass, a.subtyp, a.belopp.state], ['troligen_inte', 'femarsregeln', 'dold'], '14 2021-2025 + ombyggnad');
    const b = evaluate('rot', { vardear: '2021_2025', arbetstyp: 'reparation' }, [...ALL_ROT, 'arbetstyp']);
    g.eq([b.klass, b.headline.key], ['ja_villkor', 'h.ja_om'], '14 2021-2025 + reparation -> Ja, om');
    const c = evaluate('rot', { vardear: '2021_2025' }, ALL_ROT);
    g.eq(c.villkor.find((v) => v.id === 'vardear').status, 'okand', '14 2021-2025 + arbetstyp vet inte -> okand row');
    const d = evaluate('rot', { vardear: '2026_ej_fardig' }, ALL_ROT);
    g.eq([d.klass, d.subtyp], ['nej', 'inte_an'], '14 2026 not finished -> Nej, inte än');
    const e = evaluate('rot', { vardear: '2012_2020', arbetstyp: 'ombyggnad' }, [...ALL_ROT, 'arbetstyp']);
    g.eq(e.klass, 'ja', '14 värdeår 2012-2020 + ombyggnad -> ja (limit is värdeår <= 2020)');
    g.eq(toEngineInput('rot', { vardear: '2012_2020' }).agare[0].taxeringsvarde, 0, '14 2012+ house: no property fee in the pool');
    g.eq(toEngineInput('rot', { vardear: 't2011' }).agare[0].taxeringsvarde, 1_390_000, '14 old house: max property fee');
  }
  // 15. punkt vs intervall, tomt belopp -> tak, display rounding
  {
    const p = evaluate('rot', { arbete_kr: 20_000 }, ALL_ROT);
    g.eq([p.belopp.state, p.belopp.avdrag_kr], ['punkt', 6000], '15 arbete_kr given -> punkt');
    const s = evaluate('rot', { arbete: 50 }, [...ALL_ROT, 'arbete']);
    g.eq([s.belopp.state, s.belopp.avdrag_kr], ['punkt', 4500], '15 touched share -> punkt');
    const e = evaluate('rot', { belopp: 0 }, ALL_ROT);
    g.eq([e.belopp.state, e.belopp.tak_kr], ['tak', 50_000], '15 empty amount -> tak 50 000');
    const e2 = evaluate('rot', { belopp: 0, agare: 2 }, ALL_ROT);
    g.eq(e2.belopp.tak_kr, 100_000, '15 two owners -> tak 100 000');
    g.eq(formatKr(9000), '9 000 kr', '15 formatKr');
    g.eq(formatKr(1234567), '1 234 567 kr', '15 formatKr millions');
    g.eq(formatKr(-500), '-500 kr', '15 formatKr negative (plain hyphen)');
    g.eq(round100(4050), 4100, '15 round100');
    g.eq(round100(4049), 4000, '15 round100 down');
    const gp = evaluate('gt', { belopp: 9999 }, ['boende', 'skatt']);
    g.eq([gp.belopp.state, gp.belopp.avdrag_kr, gp.belopp.params.avdrag], ['punkt', 4999, '5 000 kr'], '15 GT punkt, raw 4 999, displayed 5 000');
  }
  // 16. GT: sol + batteri samtidigt = two rows under one cap; GT tak; GT material self-bought
  {
    const r = evaluate('gt', { lage: 'sol', batteri_samtidigt_kr: 100_000 }, ['lage', 'boende', 'skatt']);
    g.eq(r.belopp.rader.map((x) => x.avdrag_kr), [22_500, 27_500], '16 sol 22 500 + batteri capped 27 500');
    g.eq(r.belopp.avdrag_kr, 50_000, '16 total capped at 50 000');
    g.eq([r.klass, r.subtyp], ['ja_villkor', 'tak'], '16 tak -> Ja, men taket slår i');
    const m = evaluate('gt', { material: 'sjalv', arbete_kr: 5000, belopp: 12_000 }, ['boende', 'skatt', 'material']);
    g.eq([m.belopp.avdrag_kr, m.klass, m.subtyp], [2500, 'ja_villkor', 'material'], '16 self-bought box: 50 % of labour only, Ja, men');
    const tw = evaluate('gt', { lage: 'batteri', belopp: 120_000, agare: 2 }, ['lage', 'boende', 'sol', 'skatt', 'agare']);
    g.eq([tw.belopp.avdrag_kr, tw.klass], [60_000, 'ja_villkor'], '16 two owners: 60 000 fits, "båda har skatt" is antaget');
    g.eq(tw.villkor.find((v) => v.id === 'agare').status, 'antaget', '16 owner 2 tax is antaget');
  }
  // 17. GT batteri in BRF -> osaker (cannot be judged here), tel
  {
    const r = evaluate('gt', { lage: 'batteri', boende: 'brf' }, ['lage', 'boende', 'sol', 'skatt']);
    g.eq([r.klass, r.subtyp, r.cta.primary.kind], ['osaker', 'brf_batteri', 'tel'], '17 batteri i brf -> osaker + tel');
    g.eq(r.headline.key, 'h.osaker.brf_batteri', '17 headline');
  }
  // 18. foralder / anvandning / bor_detalj
  {
    const a = evaluate('rot', { boende: 'foralder' }, ALL_ROT);
    g.eq([a.klass, a.headline.key], ['ja_villkor', 'h.ja_om'], '18 föräldrarnas bostad -> Ja, om (villkor)');
    const b = evaluate('rot', { boende: 'foralder', skatt: 'vet' }, ALL_ROT);
    g.eq(b.klass, 'osaker', '18 foralder + one vet inte -> osaker (UX §3.3)');
    const c = evaluate('rot', { bor_detalj: 'uthyrd' }, [...ALL_ROT, 'bor_detalj']);
    g.eq([c.klass, c.subtyp], ['nej', 'uthyrd'], '18 uthyrd -> nej');
    const d = evaluate('gt', { anvandning: 'annan' }, ['boende', 'anvandning']);
    g.eq([d.klass, d.subtyp], ['nej', 'anvandning'], '18 GT uthyrd/annan -> nej');
    const e = evaluate('gt', { boende: 'fritid' }, ['boende', 'skatt']);
    g.eq(e.klass, 'ja', '18 GT fritidshus, all touched -> ja');
    const f = evaluate('rot', { boende: 'brf', plats: 'utanfor' }, ['boende', 'plats', 'skatt']);
    g.eq([f.klass, f.subtyp], ['nej', 'utanfor'], '18 brf utanför lägenheten -> nej');
  }
  // 19. bank integrity: defaults, visibility, four visible ROT questions on load, GT per läge
  {
    const rb = resolveBank('rot', {});
    const visibleRot = rb.filter((q) => q.shown && !q.folded).map((q) => q.id);
    g.eq(visibleRot, ['boende', 'vardear', 'belopp', 'skatt'], '19 ROT: four visible on load');
    g.eq(resolveBank('rot', { vardear: '2021_2025' }).find((q) => q.id === 'arbetstyp').shown, true, '19 arbetstyp auto-shown for 2021-2025');
    g.eq(resolveBank('rot', { boende: 'brf' }).find((q) => q.id === 'vardear').shown, false, '19 vardear hidden for brf');
    g.eq(resolveBank('rot', { boende: 'brf' }).find((q) => q.id === 'plats').folded, true, '19 plats folded for brf');
    const gl = resolveBank('gt', {}).filter((q) => q.shown && !q.folded).map((q) => q.id);
    g.eq(gl, ['lage', 'boende', 'belopp', 'skatt'], '19 GT laddbox: four visible');
    const gb = resolveBank('gt', { lage: 'batteri' }).filter((q) => q.shown && !q.folded).map((q) => q.id);
    g.eq(gb, ['lage', 'boende', 'sol', 'belopp', 'skatt', 'agare'], '19 GT batteri: six visible');
    const gs = resolveBank('gt', { lage: 'sol' }).filter((q) => q.shown && !q.folded).map((q) => q.id);
    g.eq(gs, ['lage', 'boende', 'belopp', 'skatt', 'agare'], '19 GT sol: five visible');
    g.eq(resolveBank('gt', { boende: 'brf' }).find((q) => q.id === 'pplats').shown, true, '19 pplats shown for brf + laddbox');
    g.eq(resolveBank('gt', { lage: 'batteri' }).find((q) => q.id === 'belopp').label, t('q.belopp.batteri.label'), '19 GT belopp label per läge');
    g.eq(effectiveState('gt', { lage: 'batteri' }).belopp, 70_000, '19 GT batteri default amount 70 000');
    g.eq(effectiveState('gt', { lage: 'sol' }).belopp, 150_000, '19 GT sol default 150 000');
    g.eq(effectiveState('rot', {}).belopp, 30_000, '19 ROT default 30 000');
    for (const q of rb) g.ok(q.label !== '' || q.id === 'belopp', `19 label resolves: ${q.id}`, q.labelKey);
    g.eq(defaultState('rot').skatt_djup, false, '19 deep-dive off by default');
  }
  // 20. resolveTexts leaves no unresolved keys or placeholders in the rendered strings
  {
    const samples = [
      evaluate('rot', {}, []), evaluate('rot', {}, ALL_ROT), evaluate('rot', { boende: 'hyra' }, []),
      evaluate('rot', { vardear: 'vet_inte', skatt: 'vet' }, ALL_ROT), evaluate('rot', { skatt: 'lag', skatt_djup: true, manadsinkomst: 15_000, belopp: 100_000, arbete_kr: 100_000 }, ALL_ROT),
      evaluate('rot', { belopp: 100_000, arbete_kr: 100_000, anvant_rot: 40_000 }, ALL_ROT), evaluate('rot', { anvant_rot: 50_000, anvant_rut: 30_000 }, ALL_ROT),
      evaluate('rot', { vardear: '2021_2025', arbetstyp: 'ombyggnad' }, ALL_ROT), evaluate('rot', { agare: 2, skatt_djup: true, belopp: 400_000, arbete_kr: 400_000 }, ALL_ROT),
      evaluate('rot', { skatt_djup: true, inkomsttyp: 'bada', gt_planerad_kr: 50_000, belopp: 170_000, arbete_kr: 170_000 }, ALL_ROT),
      evaluate('gt', {}, []), evaluate('gt', { lage: 'batteri', sol: 'nej', arbete_kr: 20_000 }, []), evaluate('gt', { lage: 'batteri', sol: 'nej' }, []),
      evaluate('gt', { boende: 'brf', pplats: 'gemensamt' }, []), evaluate('gt', { boende: 'brf' }, []), evaluate('gt', { lage: 'sol', batteri_samtidigt_kr: 100_000 }, []),
      evaluate('gt', { lage: 'batteri', boende: 'brf' }, []), evaluate('gt', { material: 'sjalv', arbete_kr: 5000 }, []), evaluate('gt', { skatt: 'lag', skatt_djup: true, manadsinkomst: 15_000 }, []),
      evaluate('gt', { anvant_gt: 50_000 }, []), evaluate('gt', { anvant_gt: 45_000 }, []), evaluate('gt', { under18: true }, []), evaluate('gt', { fastpris: true, tillagg_elcentral_kr: 15_000 }, []),
    ];
    let checked = 0;
    for (const r of samples) {
      const x = resolveTexts(r);
      const strings = [x.headline.text, x.ram.text, x.eyebrow, x.disclaimer, x.belopp.rubrik, x.belopp.bas_text, x.belopp.att_betala_text || '', x.skatt.text, x.skatt.hedge,
        ...x.villkor.map((v) => v.text), ...x.villkor.map((v) => v.fras || ''), ...x.nasta_steg.map((s) => s.text), x.cta.primary.label, x.cta.secondary ? x.cta.secondary.label : '', ...x.metod_text];
      for (const s of strings) {
        checked += 1;
        g.ok(!/\{\w+\}/.test(s), 'unresolved placeholder', `${s} (${r.klass}/${r.subtyp})`);
        g.ok(!/^(h|v|b|s|sk|cta|ram|q|metod)\.[\w.]+$/.test(s), 'unresolved key', s);
      }
    }
    g.ok(checked > 200, `20 rendered ${checked} strings`);
  }
}

// ---------------------------------------------------------------------------------------------------
// (e) COPY hygiene + key integrity
// ---------------------------------------------------------------------------------------------------
{
  const g = group('e) COPY hygiene (no em/en dash, no "·", max one "!") + referenced keys exist');
  let n = 0;
  for (const [k, v] of Object.entries(COPY)) {
    n += 1;
    g.ok(!/[—–·•]/.test(v), `dash/dot in ${k}`, v);
    g.ok((v.match(/!/g) || []).length <= 1, `too many ! in ${k}`, v);
    g.ok(v.length > 0, `empty string ${k}`);
  }
  g.ok(n > 250, `${n} strings in COPY`);
  for (const mode of ['rot', 'gt']) {
    for (const q of BANKS[mode]) {
      if (q.label) g.ok(q.label in COPY, `bank ${mode}.${q.id}.label key`, q.label);
      if (q.help) g.ok(q.help in COPY, `bank ${mode}.${q.id}.help key`, q.help);
      for (const o of q.options || []) {
        g.ok(o.label in COPY, `bank ${mode}.${q.id}.${o.id} label key`, o.label);
        if (o.help) g.ok(o.help in COPY, `bank ${mode}.${q.id}.${o.id} help key`, o.help);
      }
    }
  }
  // every key produced by evaluate in the sample set must exist in COPY
  const seen = new Set();
  const collect = (r) => {
    seen.add(r.headline.key); seen.add(r.ram.key); seen.add(r.eyebrowKey); seen.add(r.disclaimerKey); seen.add(r.skatt.hedgeKey);
    if (r.skatt.textKey) seen.add(r.skatt.textKey);
    if (r.belopp.rubrikKey) seen.add(r.belopp.rubrikKey);
    if (r.belopp.bas_textKey) seen.add(r.belopp.bas_textKey);
    for (const v of r.villkor) { seen.add(v.textKey); if (v.frasKey) seen.add(v.frasKey); }
    for (const s of r.nasta_steg) seen.add(s.key);
    if (r.cta.primary.labelKey) seen.add(r.cta.primary.labelKey);
    if (r.cta.secondary && r.cta.secondary.labelKey) seen.add(r.cta.secondary.labelKey);
    for (const m of r.metod) seen.add(m);
  };
  const boendeVals = ['villa', 'brf', 'fritid', 'hyra', 'foralder'];
  const skattVals = ['lon', 'pension', 'lag', 'vet'];
  for (const b of boendeVals) for (const s of skattVals) for (const y of ['t2011', '2021_2025', '2026_ej_fardig', 'vet_inte']) for (const a of ['reparation', 'ombyggnad', 'vet_inte']) {
    collect(evaluate('rot', { boende: b, skatt: s, vardear: y, arbetstyp: a }, []));
    collect(evaluate('rot', { boende: b, skatt: s, vardear: y, arbetstyp: a, skatt_djup: true, agare: 2, anvant_rot: 45_000 }, ['boende', 'vardear', 'skatt', 'arbetstyp', 'plats']));
  }
  for (const l of ['laddbox', 'batteri', 'sol']) for (const b of boendeVals) for (const s of skattVals) for (const sol of ['har', 'samtidigt', 'nej', 'vet_inte']) for (const pp of ['foljer_bostadsratten', 'hyrd_uppsagningsbar', 'gemensamt', 'vet_inte']) {
    collect(evaluate('gt', { lage: l, boende: b, skatt: s, sol, pplats: pp, arbete_kr: 5000 }, []));
    collect(evaluate('gt', { lage: l, boende: b, skatt: s, sol, pplats: pp, skatt_djup: true, agare: 2, material: 'sjalv', arbete_kr: 5000, anvant_gt: 30_000 }, ['boende', 'sol', 'skatt', 'pplats']));
  }
  for (const k of seen) g.ok(k in COPY, `evaluate() key exists: ${k}`);
  g.ok(seen.size > 80, `${seen.size} distinct keys exercised by the sweep`);
}

// ---------------------------------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------------------------------
console.log(`Avdragskollen logic tests, ${new Date().toISOString()} (node ${process.version})`);
for (const g of groups) {
  console.log(`${g.fail === 0 ? 'PASS' : 'FAIL'}  ${g.name}: ${g.pass} ok, ${g.fail} fail`);
  for (const n of g.notes) console.log(n);
}
const totalPass = groups.reduce((s, g) => s + g.pass, 0);
console.log(`${totalFail === 0 ? 'ALL GREEN' : 'RED'}: ${totalPass} checks passed, ${totalFail} failed`);
process.exit(totalFail === 0 ? 0 : 1);
